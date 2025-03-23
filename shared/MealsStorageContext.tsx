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
import { useHealthData } from "./HealthDataContext";
import {
  totalCarbs,
  totalProteins,
  totalFats,
  calculateCalories,
} from "../utils/food";

const db = SQLite.openDatabase("meals.db");

const DB_VERSION = 6; // Increment version to trigger schema update

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
            createTablesWithLatestSchema(tx, DB_VERSION, resolve, reject);
          } else {
            // Version table exists, check version number
            tx.executeSql(
              "SELECT version FROM version WHERE id = 1;",
              [],
              (_, versionResult) => {
                const currentVersion = versionResult.rows.item(0)?.version || 0;

                if (currentVersion < DB_VERSION) {
                  // We need to update the schema - simplest approach is to drop and recreate
                  console.log(
                    `Updating database from version ${currentVersion} to ${DB_VERSION}`
                  );

                  // First, get all existing meals to preserve them
                  tx.executeSql(
                    "SELECT * FROM meals",
                    [],
                    (_, mealsResult) => {
                      const meals = mealsResult.rows._array || [];

                      // Drop existing meals table
                      tx.executeSql(
                        "DROP TABLE IF EXISTS meals",
                        [],
                        () => {
                          // Recreate tables with latest schema
                          createTablesWithLatestSchema(
                            tx,
                            DB_VERSION,
                            () => {
                              // Reinsert meals data
                              if (meals.length > 0) {
                                const reinsertPromises = meals.map(
                                  (meal) =>
                                    new Promise<void>(
                                      (resolveMeal, rejectMeal) => {
                                        // Convert analysis JSON string back to object if it exists
                                        let analysis = null;
                                        if (meal.last_analysis) {
                                          try {
                                            analysis = JSON.stringify(
                                              JSON.parse(meal.last_analysis)
                                            );
                                          } catch (e) {
                                            console.error(
                                              "Error parsing analysis:",
                                              e
                                            );
                                          }
                                        }

                                        tx.executeSql(
                                          `INSERT INTO meals (
                                      meal_id, image_uri, favorite, status, 
                                      created_at, last_analysis, error_message, 
                                      healthkit_object_id
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                                          [
                                            meal.meal_id,
                                            meal.image_uri,
                                            meal.favorite || 0,
                                            meal.status || "complete",
                                            meal.created_at,
                                            analysis,
                                            meal.error_message,
                                            null, // New meals won't have a healthkit_object_id
                                          ],
                                          () => resolveMeal(),
                                          (_, err) => {
                                            console.error(
                                              "Error reinserting meal:",
                                              err
                                            );
                                            resolveMeal(); // Continue even if one meal fails
                                            return false;
                                          }
                                        );
                                      }
                                    )
                                );

                                Promise.all(reinsertPromises)
                                  .then(() => resolve())
                                  .catch((err) => reject(err));
                              } else {
                                resolve();
                              }
                            },
                            reject
                          );
                        },
                        (_, error) => {
                          console.error("Error dropping meals table:", error);
                          reject(error);
                          return false;
                        }
                      );
                    },
                    (_, error) => {
                      console.error("Error selecting existing meals:", error);
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

// Helper function to create tables with the latest schema
const createTablesWithLatestSchema = (
  tx: SQLite.SQLTransaction,
  version: number,
  resolve: () => void,
  reject: (error: any) => void
) => {
  // Create version table
  tx.executeSql(
    "CREATE TABLE IF NOT EXISTS version (id INTEGER PRIMARY KEY CHECK (id = 1), version INTEGER);",
    [],
    () => {
      // Insert or update version
      tx.executeSql(
        "INSERT OR REPLACE INTO version (id, version) VALUES (1, ?);",
        [version],
        () => {
          // Create meals table with all columns including healthkit_object_id
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS meals (
              meal_id TEXT PRIMARY KEY,
              image_uri TEXT NOT NULL,
              favorite INTEGER DEFAULT 0,
              status TEXT DEFAULT 'analyzing',
              created_at INTEGER NOT NULL,
              last_analysis TEXT,
              error_message TEXT,
              healthkit_object_id TEXT
            );`,
            [],
            () => {
              // Create indexes
              tx.executeSql(
                "CREATE INDEX IF NOT EXISTS idx_meals_created_at ON meals (created_at DESC);",
                [],
                () => {
                  tx.executeSql(
                    "CREATE INDEX IF NOT EXISTS idx_meals_healthkit_id ON meals (healthkit_object_id);",
                    [],
                    () => {
                      resolve();
                    },
                    (_, error) => {
                      console.error(
                        "Error creating healthkit_object_id index:",
                        error
                      );
                      reject(error);
                      return false;
                    }
                  );
                },
                (_, error) => {
                  console.error("Error creating created_at index:", error);
                  reject(error);
                  return false;
                }
              );
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
  const { jwt, refreshToken } = useAuth();
  const [dailyMeals, setDailyMeals] = useState<StoredMeal[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<StoredMeal[]>([]);
  const { lastMessage } = useWebSocket();
  const deletedMealIdsRef = useRef<Set<string>>(new Set());
  const { saveFoodData, deleteFoodData } = useHealthData();

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
      let healthkitObjectId: string | null = null;

      console.log("Starting meal insertion:", {
        mealId,
        imageUri: meal.image_uri,
        status: meal.status,
        timestamp,
      });

      // Function to perform the database insertion
      const performDatabaseInsertion = () => {
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
                last_analysis,
                healthkit_object_id
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                mealId,
                meal.image_uri,
                Math.floor(timestamp / 1000),
                meal.status || "complete",
                meal.favorite || 0,
                meal.last_analysis ? JSON.stringify(meal.last_analysis) : null,
                healthkitObjectId,
              ],
              (_, result) => {
                console.log("Insert result:", result);
                console.log(
                  "Meal inserted successfully with healthkit_object_id:",
                  healthkitObjectId
                );
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
      };

      // If there's analysis data, try to save to HealthKit first
      if (meal.last_analysis) {
        try {
          const analysis = meal.last_analysis;
          const createdAt = meal.created_at || Math.floor(timestamp / 1000);
          const date = new Date(createdAt * 1000).toISOString();

          // Use individual utility functions to calculate nutritional values
          const ingredients = analysis.ingredients || [];

          // Only proceed if we have valid nutritional data
          if (
            ingredients.length > 0 &&
            ingredients.some(
              (ing) => ing.carbs > 0 || ing.proteins > 0 || ing.fats > 0
            )
          ) {
            const carbsValue = totalCarbs(ingredients);
            const proteinsValue = totalProteins(ingredients);
            const fatsValue = totalFats(ingredients);

            // Calculate total calories by summing calories from each ingredient
            const totalCaloriesValue = ingredients.reduce(
              (sum, ingredient) => sum + calculateCalories(ingredient),
              0
            );

            // Only save to HealthKit if we have meaningful nutritional values
            if (totalCaloriesValue > 0) {
              console.log(
                `Meal ${mealId} has valid nutritional data (${totalCaloriesValue} calories), saving to HealthKit`
              );

              // Prepare HealthKit food data
              const healthkitOptions = {
                foodName: analysis.meal_name || "Unknown Meal",
                mealType: "Lunch", // Default to Lunch as we don't track meal types
                date: date,
                energy: totalCaloriesValue,
                protein: proteinsValue,
                carbohydrates: carbsValue,
                fatTotal: fatsValue,
                fiber: 0, // We don't track these values in our current data model
                sugar: 0,
                sodium: 0,
              };

              // Save to HealthKit and wait for the callback before proceeding
              saveFoodData(healthkitOptions, (error, result) => {
                if (!error && result) {
                  // Set the healthkit object ID from the result
                  healthkitObjectId = result.toString();
                  console.log(
                    `Saved meal ${mealId} to HealthKit with ID: ${healthkitObjectId}`
                  );
                } else {
                  console.log(
                    "Failed to save to HealthKit or no ID returned, continuing without HealthKit ID"
                  );
                }

                // Proceed with database insertion after HealthKit operation completes
                // (whether it succeeded or failed)
                performDatabaseInsertion();
              });

              // Early return to prevent immediate database insertion
              // It will be performed in the callback above
              return;
            } else {
              console.log(
                `Skipping HealthKit save for meal ${mealId} as it has zero calories`
              );
            }
          } else {
            console.log(
              `Skipping HealthKit save for meal ${mealId} as it has no valid nutritional data`
            );
          }
        } catch (error) {
          console.error("Error preparing HealthKit data:", error);
          // Continue with database insertion even if HealthKit preparation fails
        }
      }

      // If we got here, we didn't save to HealthKit (no analysis data or it failed),
      // so just do the database insertion directly
      performDatabaseInsertion();
    });
  };

  const deleteMealById = async (mealId: string) => {
    // Add to deleted meals set using ref
    deletedMealIdsRef.current.add(mealId);

    // Optimistically remove from state
    setDailyMeals((prev) => prev.filter((meal) => meal.meal_id !== mealId));
    setWeeklyMeals((prev) => prev.filter((meal) => meal.meal_id !== mealId));

    try {
      // Try to get the meal first to see if it has a healthkit_object_id
      // This is wrapped in a try/catch to handle the case where the database
      // might not have the healthkit_object_id column yet
      try {
        const mealData = await new Promise<any>((resolve, reject) => {
          db.transaction((tx) => {
            tx.executeSql(
              "SELECT * FROM meals WHERE meal_id = ?",
              [mealId],
              (_, result) => {
                if (result.rows.length > 0) {
                  resolve(result.rows.item(0));
                } else {
                  resolve(null);
                }
              },
              (_, error) => {
                reject(error);
                return false;
              }
            );
          });
        });

        // If there's a HealthKit object ID, delete from HealthKit
        if (mealData && mealData.healthkit_object_id) {
          try {
            const createdAt = new Date(mealData.created_at * 1000);
            const startDate = createdAt.toISOString();
            // End date is 1 minute later (arbitrary small window)
            const endDate = new Date(createdAt.getTime() + 60000).toISOString();

            await deleteFoodData({
              startDate,
              endDate,
              objectId: mealData.healthkit_object_id,
            });

            console.log(`Successfully deleted meal ${mealId} from HealthKit`);
          } catch (healthkitError) {
            console.error("Error deleting from HealthKit:", healthkitError);
            // Continue with database deletion even if HealthKit fails
          }
        }
      } catch (dbError) {
        // If there's an error with the database query (e.g., column doesn't exist),
        // log it but continue with deletion
        console.error("Error querying for healthkit_object_id:", dbError);
      }

      // Delete from local database first
      await deleteMealFromDB(mealId);

      // Then delete from the backend
      if (jwt) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          const response = await fetch(
            `https://api.calorily.com/meals/${mealId}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${jwt}` },
              signal: controller.signal,
            }
          );

          clearTimeout(timeoutId);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Backend deletion failed with status: ${response.status}`,
              errorText
            );
            // We don't throw here because the meal is already deleted from local DB
            // and we want to keep the optimistic UI update
          } else {
            console.log(`Successfully deleted meal ${mealId} from backend`);
          }
        } catch (backendError) {
          if (backendError.name === "AbortError") {
            console.log("Backend delete request timed out");
          } else {
            console.error("Error deleting meal from backend:", backendError);
          }
          // Again, don't throw as local deletion was successful
        }
      } else {
        console.log("No JWT available, skipping backend deletion");
      }
    } catch (error) {
      console.error("Error deleting meal from local DB:", error);
      // If local deletion fails, remove from deleted set using ref
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

    // First, get the current meal data to check if we need to update HealthKit
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals WHERE meal_id = ?",
        [mealId],
        async (_, result) => {
          if (result.rows.length > 0) {
            const existingMeal = result.rows.item(0);

            // If we receive analysis data for a meal that was previously inserted,
            // and it doesn't have a HealthKit ID yet, save it to HealthKit now
            if (
              !existingMeal.healthkit_object_id &&
              analysisData.ingredients &&
              analysisData.ingredients.length > 0
            ) {
              try {
                const createdAt = existingMeal.created_at;
                const date = new Date(createdAt * 1000).toISOString();

                // Use individual utility functions to calculate nutritional values
                const ingredients = analysisData.ingredients || [];

                // Only proceed if we have valid nutritional data
                if (
                  ingredients.some(
                    (ing) => ing.carbs > 0 || ing.proteins > 0 || ing.fats > 0
                  )
                ) {
                  const carbsValue = totalCarbs(ingredients);
                  const proteinsValue = totalProteins(ingredients);
                  const fatsValue = totalFats(ingredients);

                  // Calculate total calories by summing calories from each ingredient
                  const totalCaloriesValue = ingredients.reduce(
                    (sum, ingredient) => sum + calculateCalories(ingredient),
                    0
                  );

                  // Only save to HealthKit if we have meaningful nutritional values
                  if (totalCaloriesValue > 0) {
                    console.log(
                      `Meal ${mealId} has valid nutritional data (${totalCaloriesValue} calories), saving to HealthKit`
                    );

                    // Prepare HealthKit food data
                    const healthkitOptions = {
                      foodName: analysisData.meal_name || "Unknown Meal",
                      mealType: "Lunch", // Default to Lunch as we don't track meal types
                      date: date,
                      energy: totalCaloriesValue,
                      protein: proteinsValue,
                      carbohydrates: carbsValue,
                      fatTotal: fatsValue,
                      fiber: 0,
                      sugar: 0,
                      sodium: 0,
                    };

                    // Save to HealthKit and wait for callback
                    let healthkitObjectId: string | null = null;

                    // Use a promise to wait for the HealthKit operation to complete
                    await new Promise<void>((resolveHealthKit) => {
                      saveFoodData(healthkitOptions, (error, result) => {
                        if (!error && result) {
                          healthkitObjectId = result.toString();
                          console.log(
                            `Saved meal ${mealId} to HealthKit with ID: ${healthkitObjectId} during analysis update`
                          );
                        }
                        resolveHealthKit();
                      });
                    });

                    // Update the meal with HealthKit ID if available
                    if (healthkitObjectId) {
                      updateMeal({
                        meal_id: mealId,
                        status: "complete",
                        last_analysis: analysisData,
                        healthkit_object_id: healthkitObjectId,
                      });
                      return; // Early return as updateMeal will handle the state update
                    }
                  } else {
                    console.log(
                      `Skipping HealthKit save for meal ${mealId} as it has zero calories`
                    );
                  }
                } else {
                  console.log(
                    `Skipping HealthKit save for meal ${mealId} as it has no valid nutritional data`
                  );
                }
              } catch (error) {
                console.error(
                  "Error saving to HealthKit during analysis update:",
                  error
                );
                // Continue with regular update if HealthKit fails
              }
            }

            // Fall through to regular update if HealthKit update isn't needed or fails
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
          }
        },
        (_, error) => {
          console.error("Error querying meal for HealthKit update:", error);
          // Fall back to standard update
          standardUpdate();
          return false;
        }
      );
    });

    // Standard update function for fallback
    const standardUpdate = () => {
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
