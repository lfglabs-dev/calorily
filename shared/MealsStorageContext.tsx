import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import { useWebSocket } from "./WebSocketContext";
import {
  calculateCalories,
  totalCarbs,
  totalProteins,
  totalFats,
  getMealMacros,
} from "../utils/food";
import { StoredMeal, MealStatus, MealAnalysis } from "../types";
import { useHealthData } from "./HealthDataContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./AuthContext";
import { getLastSyncTimestamp, setLastSyncTimestamp } from "../utils/storage";
import { AppState } from "react-native";

const db = SQLite.openDatabase("meals.db");

const DB_VERSION = 4; // Increment for new schema with error_message

const setupDatabaseAsync = async (): Promise<void> => {
  console.log("Starting database setup...");
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      console.log("Dropping old version table...");
      tx.executeSql("DROP TABLE IF EXISTS version;", [], () => {
        console.log("Creating version table...");
        tx.executeSql(
          "CREATE TABLE IF NOT EXISTS version (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER)",
          [],
          () => {
            console.log("Version table created");
            tx.executeSql(
              `CREATE TABLE IF NOT EXISTS meals (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                meal_id TEXT,
                image_uri TEXT NOT NULL,
                favorite INTEGER DEFAULT 0,
                status TEXT DEFAULT 'analyzing',
                created_at INTEGER NOT NULL,
                last_analysis TEXT,
                error_message TEXT
              );`,
              [],
              () => {
                console.log("Meals table created");
                tx.executeSql(
                  "INSERT OR REPLACE INTO version (id, version) VALUES (1, ?)",
                  [DB_VERSION],
                  () => {
                    console.log("Version updated to", DB_VERSION);
                    resolve();
                  },
                  (_, error) => {
                    console.error("Error updating version:", error);
                    reject(error);
                    return false;
                  }
                );
              }
            );
          }
        );
      });
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

const deleteMealByIdAsync = async (
  mealIdOrId: string | number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // If it's a number, use id. If it's a string, use meal_id
      const query =
        typeof mealIdOrId === "number"
          ? "DELETE FROM meals WHERE id = ?;"
          : "DELETE FROM meals WHERE meal_id = ?;";

      tx.executeSql(
        query,
        [mealIdOrId],
        () => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

const updateMealByIdAsync = async (
  id: number,
  updates: Partial<StoredMeal>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const fields = Object.keys(updates);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => {
        // Stringify objects like last_analysis
        return typeof updates[field] === "object"
          ? JSON.stringify(updates[field])
          : updates[field];
      });
      const query = `UPDATE meals SET ${setClause} WHERE id = ?`;
      const params = [...values, id];

      tx.executeSql(
        query,
        params,
        (_, result) => {
          resolve();
        },
        (_, error) => {
          reject(error);
          return false;
        }
      );
    });
  });
};

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

type MealsDatabaseContextProps = {
  dailyMeals: StoredMeal[];
  weeklyMeals: StoredMeal[];
  insertMeal: (tmpImageUri: string, mealId?: string) => Promise<void>;
  deleteMealById: (mealIdOrId: string | number) => Promise<void>;
  updateMealById: (id: number, updates: Partial<StoredMeal>) => Promise<void>;
  fetchMealsInRangeAsync: (
    startIndex: number,
    count: number
  ) => Promise<StoredMeal[]>;
  refreshMeals: () => Promise<void>;
  syncMeals: () => Promise<void>;
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  dailyMeals: [],
  weeklyMeals: [],
  insertMeal: async () => {},
  deleteMealById: async () => {},
  updateMealById: async () => {},
  fetchMealsInRangeAsync: async () => [],
  refreshMeals: async () => {},
  syncMeals: async () => {},
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
  const { saveFoodData } = useHealthData();
  const { jwt } = useAuth();

  useEffect(() => {
    console.log("Setting up database...");
    setupDatabaseAsync()
      .then(() => {
        console.log("Database setup complete, refreshing meals...");
        return refreshMeals();
      })
      .then(() => {
        console.log("Initial meal refresh complete");
      })
      .catch((error) => {
        console.error("Error during setup:", error);
      });
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
      if (lastMessage.event === "analysis_failed") {
        db.transaction((tx) => {
          tx.executeSql(
            `UPDATE meals 
             SET status = 'failed',
             error_message = ?
             WHERE meal_id = ?`,
            [lastMessage.error, lastMessage.meal_id],
            () => {
              setWeeklyMeals((prevMeals) => {
                return prevMeals.map((meal) => {
                  if (meal.meal_id === lastMessage.meal_id) {
                    return {
                      ...meal,
                      status: "failed",
                      error_message: lastMessage.error,
                    };
                  }
                  return meal;
                });
              });
            }
          );
        });
      } else if (lastMessage.event === "analysis_complete") {
        updateMealData(lastMessage.meal_id, lastMessage.data);
      }
    }
  }, [lastMessage]);

  const refreshMeals = async () => {
    const startOfWeek = new Date();
    startOfWeek.setDate(
      startOfWeek.getDate() -
        startOfWeek.getDay() +
        (startOfWeek.getDay() === 0 ? -6 : 1)
    );
    startOfWeek.setHours(0, 0, 0, 0);
    const timestampWeek = Math.floor(startOfWeek.getTime() / 1000);

    console.log("Fetching meals since:", new Date(timestampWeek * 1000));
    const mealsSinceWeek = await fetchMealsSinceTimestamp(timestampWeek);
    console.log("Fetched meals:", mealsSinceWeek);

    setWeeklyMeals(mealsSinceWeek);
  };

  const insertMeal = async (
    tmpImageURI: string,
    mealId?: string
  ): Promise<void> => {
    console.log("Inserting meal:", { tmpImageURI, mealId });
    const fileName = tmpImageURI.split("/").pop();
    const imagePath = FileSystem.documentDirectory + fileName;
    await FileSystem.copyAsync({
      from: tmpImageURI,
      to: imagePath,
    });

    return new Promise<void>((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO meals (
            meal_id, image_uri, created_at, status
          ) VALUES (?, ?, ?, ?);`,
          [
            mealId || null,
            imagePath,
            Math.floor(Date.now() / 1000),
            "analyzing",
          ],
          () => {
            console.log("Meal inserted successfully");
            refreshMeals();
            resolve();
          },
          (_, error) => {
            console.error("Error inserting meal:", error);
            reject(error);
            return false;
          }
        );
      });
    });
  };

  const deleteMealById = async (mealIdOrId: string | number) => {
    await deleteMealByIdAsync(mealIdOrId);
    await refreshMeals();
  };

  const updateMealData = (mealId: string, data: any) => {
    db.transaction((tx) => {
      const analysisData: MealAnalysis = {
        meal_id: mealId,
        meal_name: data.meal_name,
        ingredients: data.ingredients,
        timestamp: data.timestamp,
      };

      tx.executeSql(
        `UPDATE meals 
         SET status = 'complete',
         last_analysis = ?
         WHERE meal_id = ?`,
        [JSON.stringify(analysisData), mealId],
        () => {
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
        },
        (_, error) => {
          console.error("Error updating meal in DB:", error);
          return false;
        }
      );
    });
  };

  const updateMealById = async (id: number, updates: Partial<StoredMeal>) => {
    try {
      await updateMealByIdAsync(id, updates);
      await refreshMeals();
    } catch (error) {
      console.error("Error updating meal:", error);
    }
  };

  const syncMeals = async () => {
    try {
      const lastSync = await getLastSyncTimestamp();
      if (!lastSync) return;

      const response = await fetch(
        `https://api.calorily.com/meals/sync?since=${lastSync}`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      );

      if (!response.ok) throw new Error("Sync failed");

      const { analyses } = await response.json();

      // Update each meal that has a newer analysis
      for (const analysis of analyses) {
        await updateMealData(analysis.meal_id, {
          meal_name: analysis.meal_name,
          ingredients: analysis.ingredients,
          timestamp: analysis.timestamp,
        });
      }

      // Update last sync timestamp
      await setLastSyncTimestamp(new Date().toISOString());
    } catch (error) {
      console.error("Error syncing meals:", error);
    }
  };

  // Call sync when app becomes active
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        syncMeals();
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  // Initial sync when component mounts
  useEffect(() => {
    syncMeals();
  }, []);

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
      const meal: StoredMeal = {
        meal_id: mealId,
        image_uri: permanentUri,
        // ... other meal properties
      };

      await insertMeal(meal);
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

  return (
    <MealsDatabaseContext.Provider
      value={{
        dailyMeals,
        weeklyMeals,
        insertMeal,
        deleteMealById,
        updateMealById,
        fetchMealsInRangeAsync,
        refreshMeals,
        syncMeals,
      }}
    >
      {children}
    </MealsDatabaseContext.Provider>
  );
};

export const useMealsDatabase = () => useContext(MealsDatabaseContext);

export { MealStatus } from "../types";
