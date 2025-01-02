import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { useWebSocket } from "./WebSocketContext";

import { StoredMeal, MealStatus, MealAnalysis, OptimisticMeal } from "../types";
import { useAuth } from "./AuthContext";
import { getLastSyncTimestamp, setLastSyncTimestamp } from "../utils/storage";
import { AppState } from "react-native";
import { mealService } from "../services/mealService";
import { eventBus } from "../services/eventBus";
import { v4 as uuidv4 } from "uuid";

const db = SQLite.openDatabase("meals.db");

const DB_VERSION = 4; // Increment for new schema with error_message

const setupDatabaseAsync = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // First check if version table exists
      tx.executeSql(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='version';",
        [],
        (_, result) => {
          const versionTableExists = result.rows.length > 0;

          if (!versionTableExists) {
            // If version table doesn't exist, this is a fresh install
            // Create version table and set initial version
            tx.executeSql(
              "CREATE TABLE IF NOT EXISTS version (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER);",
              [],
              (_, createResult) => {
                tx.executeSql(
                  "INSERT INTO version (id, version) VALUES (1, ?);",
                  [DB_VERSION],
                  (_, insertResult) => {
                    // Create meals table with all required columns
                    tx.executeSql(
                      `CREATE TABLE IF NOT EXISTS meals (
                        meal_id TEXT PRIMARY KEY,
                        image_uri TEXT NOT NULL,
                        favorite INTEGER DEFAULT 0,
                        status TEXT DEFAULT 'analyzing',
                        created_at INTEGER NOT NULL,
                        last_analysis TEXT,
                        error_message TEXT
                      );`,
                      [],
                      () => {
                        resolve();
                      },
                      (_, error) => {
                        console.error("Error creating meals table:", error);
                        reject(error);
                        return false;
                      }
                    );
                  },
                  (_, error) => {
                    console.error("Error inserting version:", error);
                    reject(error);
                    return false;
                  }
                );
              },
              (_, error) => {
                console.error("Error creating version table:", error);
                reject(error);
                return false;
              }
            );
          } else {
            // Version table exists, check version number
            tx.executeSql(
              "SELECT version FROM version WHERE id = 1;",
              [],
              (_, versionResult) => {
                const currentVersion = versionResult.rows.item(0)?.version || 0;

                if (currentVersion < DB_VERSION) {
                  // Handle migration if needed
                  console.log(
                    `Migrating database from version ${currentVersion} to ${DB_VERSION}`
                  );

                  // Add any missing columns instead of dropping the table
                  tx.executeSql(
                    "SELECT sql FROM sqlite_master WHERE type='table' AND name='meals';",
                    [],
                    (_, tableResult) => {
                      const tableSchema = tableResult.rows.item(0).sql;

                      // Check if error_message column exists
                      if (!tableSchema.includes("error_message")) {
                        tx.executeSql(
                          "ALTER TABLE meals ADD COLUMN error_message TEXT;",
                          [],
                          () => {
                            // Update version number after successful migration
                            tx.executeSql(
                              "UPDATE version SET version = ? WHERE id = 1;",
                              [DB_VERSION],
                              () => {
                                resolve();
                              },
                              (_, error) => {
                                console.error("Error updating version:", error);
                                reject(error);
                                return false;
                              }
                            );
                          },
                          (_, error) => {
                            console.error(
                              "Error adding error_message column:",
                              error
                            );
                            reject(error);
                            return false;
                          }
                        );
                      } else {
                        // Column already exists, just update version
                        tx.executeSql(
                          "UPDATE version SET version = ? WHERE id = 1;",
                          [DB_VERSION],
                          () => {
                            resolve();
                          },
                          (_, error) => {
                            console.error("Error updating version:", error);
                            reject(error);
                            return false;
                          }
                        );
                      }
                    },
                    (_, error) => {
                      console.error("Error checking table schema:", error);
                      reject(error);
                      return false;
                    }
                  );
                } else {
                  // Database is up to date
                  resolve();
                }
              },
              (_, error) => {
                console.error("Error checking version:", error);
                reject(error);
                return false;
              }
            );
          }
        },
        (_, error) => {
          console.error("Error checking version table:", error);
          reject(error);
          return false;
        }
      );
    });
  });
};

const fetchMealsSinceTimestamp = async (
  timestamp: number
): Promise<StoredMeal[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals WHERE created_at >= ? ORDER BY created_at DESC;",
        [timestamp],
        (_, result) => {
          const meals = result.rows._array.map((row) => {
            try {
              return {
                ...row,
                favorite: Boolean(row.favorite),
                status: (row.status || "complete") as MealStatus,
                last_analysis: row.last_analysis
                  ? JSON.parse(row.last_analysis)
                  : null,
              };
            } catch (parseError) {
              console.error("Error parsing meal data:", parseError, row);
              return {
                ...row,
                favorite: Boolean(row.favorite),
                status: "error" as MealStatus,
                last_analysis: null,
              };
            }
          });
          resolve(meals);
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

const deleteMealFromDB = async (mealId: string): Promise<void> => {
  console.log("Deleting meal from DB:", mealId);
  return new Promise((resolve, reject) => {
    db.transaction(
      (tx) => {
        tx.executeSql(
          "DELETE FROM meals WHERE meal_id = ?",
          [mealId],
          (_, result) => {
            console.log("Delete result:", result);
            resolve();
          },
          (_, error) => {
            console.error("SQL Error in delete:", error);
            reject(error);
            return false;
          }
        );
      },
      (error) => {
        console.error("Transaction Error in delete:", error);
        reject(error);
      }
    );
  });
};

const updateMeal = mealService.updateMeal;

const fetchMealsInRangeAsync = async (
  startIndex: number,
  count: number
): Promise<StoredMeal[]> => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          "SELECT * FROM meals ORDER BY created_at DESC LIMIT ? OFFSET ?;",
          [count, startIndex],
          (_, result) => {
            if (!result.rows || !result.rows._array) {
              console.log("No rows found");
              resolve([]);
              return;
            }
            const meals = result.rows._array.map((row) => {
              try {
                return {
                  ...row,
                  favorite: Boolean(row.favorite),
                  status: (row.status || "complete") as MealStatus,
                  last_analysis: row.last_analysis
                    ? JSON.parse(row.last_analysis)
                    : null,
                };
              } catch (parseError) {
                console.error("Error parsing meal data:", parseError, row);
                return {
                  ...row,
                  favorite: Boolean(row.favorite),
                  status: "error" as MealStatus,
                  last_analysis: null,
                };
              }
            });
            console.log("Fetched meals from DB:", meals);
            resolve(meals);
          },
          (_, error) => {
            console.error("SQL Error:", error);
            reject(error);
            return false;
          }
        );
      });
    } catch (error) {
      console.error("Transaction Error:", error);
      reject(error);
    }
  });
};

interface MealsDatabaseContextProps {
  dailyMeals: StoredMeal[];
  weeklyMeals: StoredMeal[];
  insertMeal: (
    meal: Pick<StoredMeal, "image_uri"> & Partial<StoredMeal>
  ) => Promise<void>;
  deleteMealById: (mealId: string) => Promise<void>;
  updateMeal: (
    updates: Partial<StoredMeal> & { meal_id: string }
  ) => Promise<void>;
  fetchMealsInRangeAsync: (
    startIndex: number,
    count: number
  ) => Promise<StoredMeal[]>;
  refreshMeals: () => Promise<void>;
  syncMeals: () => Promise<void>;
  addOptimisticMeal: (meal_id: string, imageUri: string) => void;
  updateOptimisticMeal: (meal_id: string, updates: Partial<StoredMeal>) => void;
  deletedMealIds: Set<string>;
}

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  dailyMeals: [],
  weeklyMeals: [],
  insertMeal: async () => {},
  deleteMealById: async () => {},
  updateMeal: async () => {},
  fetchMealsInRangeAsync: async () => [],
  refreshMeals: async () => {},
  syncMeals: async () => {},
  addOptimisticMeal: () => {},
  updateOptimisticMeal: () => {},
  deletedMealIds: new Set(),
});

type ProviderProps = {
  children: ReactNode;
};

const cleanupOldMeals = async () => {
  const oneMonthAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30 days in seconds

  return new Promise<void>((resolve, reject) => {
    db.transaction(async (tx) => {
      // First get the meals to delete so we can remove their images
      tx.executeSql(
        "SELECT meal_id, image_uri FROM meals WHERE created_at < ? AND favorite = 0;",
        [oneMonthAgo],
        async (_, result) => {
          const mealsToDelete = result.rows._array;

          // Delete image files
          for (const meal of mealsToDelete) {
            try {
              const exists = await FileSystem.getInfoAsync(meal.image_uri);
              if (exists.exists) {
                await FileSystem.deleteAsync(meal.image_uri);
              }
            } catch (error) {
              console.warn(
                `Failed to delete image for meal ${meal.meal_id}:`,
                error
              );
            }
          }

          // Then delete the database entries
          tx.executeSql(
            "DELETE FROM meals WHERE created_at < ? AND favorite = 0;",
            [oneMonthAgo],
            (_, deleteResult) => {
              console.log(`Cleaned up ${deleteResult.rowsAffected} old meals`);
              resolve();
            },
            (_, error) => {
              reject(error);
              return false;
            }
          );
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

export const MealsDatabaseProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [dailyMeals, setDailyMeals] = useState<StoredMeal[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<StoredMeal[]>([]);
  const { lastMessage } = useWebSocket();
  const { jwt } = useAuth();
  const deletedMealIdsRef = useRef<Set<string>>(new Set());

  // Add debug logging
  useEffect(() => {
    console.log("MealsDatabaseProvider mounted");
    const initializeMeals = async () => {
      console.log("Starting database initialization...");
      try {
        console.log("Setting up database...");
        await setupDatabaseAsync();
        console.log("Database setup complete");

        console.log("Refreshing meals...");
        await refreshMeals();
        console.log("Initial meal refresh complete");
      } catch (error) {
        console.error("Error initializing meals:", error);
      }
    };

    initializeMeals();
  }, []);

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const timestampToday = Math.floor(startOfToday.getTime() / 1000);
    const mealsForToday = weeklyMeals.filter(
      (meal) => meal.created_at >= timestampToday
    );
    setDailyMeals(mealsForToday);
  }, [weeklyMeals]);

  useEffect(() => {
    if (lastMessage && lastMessage.meal_id) {
      // Skip processing if meal was deleted
      if (deletedMealIdsRef.current.has(lastMessage.meal_id)) {
        console.log("Skipping update for deleted meal:", lastMessage.meal_id);
        return;
      }

      console.log("WebSocket message received:", {
        event: lastMessage.event,
        mealId: lastMessage.meal_id,
        error: lastMessage.error || "none",
      });

      if (lastMessage.event === "analysis_failed") {
        console.log("Analysis failed for meal:", {
          mealId: lastMessage.meal_id,
          error: lastMessage.error,
          timestamp: new Date().toISOString(),
        });

        db.transaction((tx) => {
          tx.executeSql(
            `UPDATE meals 
             SET status = 'error',
             error_message = ?
             WHERE meal_id = ?`,
            [lastMessage.error, lastMessage.meal_id],
            (_, result) => {
              console.log("Database update result:", {
                rowsAffected: result.rowsAffected,
                mealId: lastMessage.meal_id,
              });

              setWeeklyMeals((prevMeals) => {
                const updatedMeals = prevMeals.map((meal) => {
                  if (meal.meal_id === lastMessage.meal_id) {
                    console.log("Updating meal in state:", {
                      mealId: meal.meal_id,
                      oldStatus: meal.status,
                      newStatus: "error",
                    });
                    return {
                      ...meal,
                      status: "error" as MealStatus,
                      error_message: lastMessage.error,
                    };
                  }
                  return meal;
                });
                return updatedMeals;
              });
            },
            (_, error) => {
              console.error("Failed to update meal status:", {
                error,
                mealId: lastMessage.meal_id,
                sql: "UPDATE meals SET status = error...",
              });
              return false;
            }
          );
        });
      } else if (lastMessage.event === "analysis_complete") {
        updateMealData(lastMessage.meal_id, lastMessage.data);
      }
    }
  }, [lastMessage]);

  const refreshMeals = async () => {
    console.log("refreshMeals called");
    const startOfWeek = new Date();
    startOfWeek.setDate(
      startOfWeek.getDate() -
        startOfWeek.getDay() +
        (startOfWeek.getDay() === 0 ? -6 : 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const timestampWeek = Math.floor(startOfWeek.getTime() / 1000);

    try {
      const mealsSinceWeek = await fetchMealsSinceTimestamp(timestampWeek);

      // Preserve optimistic meals
      setWeeklyMeals((prev) => {
        const optimisticMeals = prev.filter((m) => m.status === "uploading");
        return [...optimisticMeals, ...mealsSinceWeek].sort(
          (a, b) => b.created_at - a.created_at
        );
      });
    } catch (error) {
      console.error("Error refreshing meals:", error);
    }
  };

  const insertMeal = async (
    meal: Pick<StoredMeal, "image_uri"> & Partial<StoredMeal>
  ) => {
    return new Promise<void>((resolve, reject) => {
      const timestamp = Date.now();
      const mealId = meal.meal_id || uuidv4();

      console.log("Starting meal insertion:", {
        mealId,
        imageUri: meal.image_uri,
        status: meal.status,
        timestamp,
      });

      db.transaction(
        (tx) => {
          console.log("Beginning insert transaction");
          tx.executeSql(
            `INSERT INTO meals (
              meal_id, 
              image_uri, 
              created_at,
              status,
              favorite,
              last_analysis
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              mealId,
              meal.image_uri,
              Math.floor(timestamp / 1000),
              meal.status || "complete",
              meal.favorite || 0,
              meal.last_analysis ? JSON.stringify(meal.last_analysis) : null,
            ],
            (_, result) => {
              console.log("Insert result:", result);
              console.log("Meal inserted successfully");
              eventBus.emit("mealsUpdated");
              resolve();
            },
            (_, error) => {
              console.error("SQL Error in insert:", error);
              reject(error);
              return false;
            }
          );
        },
        (error) => {
          console.error("Transaction Error in insert:", error);
          reject(error);
        }
      );
    });
  };

  const deleteMealById = async (mealId: string) => {
    // Add to deleted meals set using ref
    deletedMealIdsRef.current.add(mealId);

    // Optimistically remove from state
    setDailyMeals((prev) => prev.filter((meal) => meal.meal_id !== mealId));
    setWeeklyMeals((prev) => prev.filter((meal) => meal.meal_id !== mealId));

    try {
      await deleteMealFromDB(mealId);
    } catch (error) {
      console.error("Error deleting meal:", error);
      // If deletion fails, remove from deleted set using ref
      deletedMealIdsRef.current.delete(mealId);
      // Refresh meals to restore state
      await refreshMeals();
      throw error;
    }
  };

  const updateMealData = (mealId: string, data: any) => {
    const analysisData: MealAnalysis = {
      meal_id: mealId,
      meal_name: data.meal_name,
      ingredients: data.ingredients,
      timestamp: data.timestamp,
    };

    updateMeal({
      meal_id: mealId,
      status: "complete",
      last_analysis: analysisData,
    })
      .then(() => {
        setWeeklyMeals((prevMeals) => {
          return prevMeals.map((meal) => {
            if (meal.meal_id === mealId) {
              return {
                ...meal,
                status: "complete",
                last_analysis: analysisData,
              };
            }
            return meal;
          });
        });
      })
      .catch((error) => {
        console.error("Error updating meal in DB:", error);
      });
  };

  const syncMeals = async () => {
    try {
      const lastSync = await getLastSyncTimestamp();
      if (!lastSync || !jwt) return;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(
        `https://api.calorily.com/meals/sync?since=${lastSync}`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log(`Sync failed with status: ${response.status}`);
        console.log("Response headers:", response.headers);
        const errorText = await response.text();
        console.log("Response body:", errorText);
        console.log("Last sync timestamp:", lastSync);
        console.log("JWT present:", Boolean(jwt));
        return;
      }

      const { analyses } = await response.json();

      for (const analysis of analyses) {
        await updateMealData(analysis.meal_id, {
          meal_name: analysis.meal_name,
          ingredients: analysis.ingredients,
          timestamp: analysis.timestamp,
        });
      }

      await setLastSyncTimestamp(new Date().toISOString());
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Sync request timed out");
      } else {
        console.error("Error during sync:", error);
      }
    }
  };

  // Call sync when app becomes active or resumes from background
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncMeals();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [jwt]); // Add jwt as dependency

  // Initial sync when component mounts
  useEffect(() => {
    if (jwt) {
      syncMeals();
    }
  }, [jwt]);

  const addMeal = async (imageUri: string, mealId: string) => {
    try {
      // Copy image to permanent storage
      const filename = `${mealId}.jpg`;
      const permanentUri = `${FileSystem.documentDirectory}meals/${filename}`;

      // Ensure meals directory exists
      await FileSystem.makeDirectoryAsync(
        `${FileSystem.documentDirectory}meals`,
        {
          intermediates: true,
        }
      );

      // Copy to permanent location
      await FileSystem.copyAsync({
        from: imageUri,
        to: permanentUri,
      });

      // Store meal with permanent URI
      await insertMeal({
        meal_id: mealId,
        image_uri: permanentUri,
        status: "analyzing",
      });
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  // Run cleanup on app launch and daily
  useEffect(() => {
    cleanupOldMeals();

    // Set up daily cleanup
    const cleanup = setInterval(cleanupOldMeals, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    const unsubscribe = eventBus.subscribe("mealsUpdated", refreshMeals);
    return () => unsubscribe();
  }, []);

  const addOptimisticMeal = useCallback((meal_id: string, imageUri: string) => {
    const optimisticMeal: OptimisticMeal = {
      meal_id,
      image_uri: imageUri,
      status: "uploading",
      created_at: Math.floor(Date.now() / 1000),
      favorite: false,
      error_message: null,
      isOptimistic: true,
    };

    setDailyMeals((prev) => {
      const filtered = prev.filter((meal) => meal.meal_id !== meal_id);
      return [optimisticMeal, ...filtered];
    });
    setWeeklyMeals((prev) => {
      const filtered = prev.filter((meal) => meal.meal_id !== meal_id);
      return [optimisticMeal, ...filtered];
    });
  }, []);

  const updateOptimisticMeal = useCallback(
    (meal_id: string, updates: Partial<StoredMeal>) => {
      const updateMealList = (prev: StoredMeal[]) =>
        prev.map((m) => {
          if (m.meal_id === meal_id) {
            return {
              ...m,
              ...updates,
              created_at: m.created_at, // Preserve original creation time
            };
          }
          return m;
        });

      setDailyMeals((prev) => {
        const updated = updateMealList(prev);
        return [...updated].sort((a, b) => b.created_at - a.created_at);
      });
      setWeeklyMeals((prev) => {
        const updated = updateMealList(prev);
        return [...updated].sort((a, b) => b.created_at - a.created_at);
      });
    },
    []
  );

  return (
    <MealsDatabaseContext.Provider
      value={{
        dailyMeals,
        weeklyMeals,
        insertMeal,
        deleteMealById,
        updateMeal,
        fetchMealsInRangeAsync,
        refreshMeals,
        syncMeals,
        addOptimisticMeal,
        updateOptimisticMeal,
        deletedMealIds: deletedMealIdsRef.current,
      }}
    >
      {children}
    </MealsDatabaseContext.Provider>
  );
};

export const useMealsDatabase = () => useContext(MealsDatabaseContext);

export { MealStatus } from "../types";
