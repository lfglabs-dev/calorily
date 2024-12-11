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

const db = SQLite.openDatabase("meals.db");

const DB_VERSION = 3; // Increment from 2 to 3

const setupDatabaseAsync = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // First create version table if it doesn't exist
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS version (version INTEGER PRIMARY KEY)",
        [],
        () => {
          // Then create meals table if it doesn't exist
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS meals (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              meal_id TEXT UNIQUE,
              image_uri TEXT NOT NULL,
              favorite BOOLEAN NOT NULL DEFAULT 0,
              status TEXT NOT NULL DEFAULT 'analyzing',
              created_at INTEGER NOT NULL,
              last_analysis TEXT,
              some_new_field TEXT,
              another_field INTEGER DEFAULT 0
            );`,
            [],
            () => {
              // Check version and update if needed
              tx.executeSql(
                "SELECT version FROM version LIMIT 1",
                [],
                (_, result) => {
                  const currentVersion =
                    result.rows.length > 0 ? result.rows.item(0).version : 0;
                  if (currentVersion < DB_VERSION) {
                    // After all updates, update the version number
                    tx.executeSql(
                      "INSERT OR REPLACE INTO version (version) VALUES (?)",
                      [DB_VERSION],
                      () => resolve(),
                      (_, error) => {
                        reject(error);
                        return false;
                      }
                    );
                  } else {
                    resolve();
                  }
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
        },
        (_, error) => {
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

const updateMealById = async (
  id: number,
  updates: Partial<StoredMeal>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      const fields = Object.keys(updates);
      const setClause = fields.map((field) => `${field} = ?`).join(", ");
      const values = fields.map((field) => updates[field]);
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
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  dailyMeals: [],
  weeklyMeals: [],
  insertMeal: async () => {},
  deleteMealById: async () => {},
  updateMealById: async () => {},
  fetchMealsInRangeAsync: async () => [],
  refreshMeals: async () => {},
});

type ProviderProps = {
  children: ReactNode;
};

export const MealsDatabaseProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [dailyMeals, setDailyMeals] = useState<StoredMeal[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<StoredMeal[]>([]);
  const { lastMessage } = useWebSocket();
  const { saveFoodData } = useHealthData();

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
    if (lastMessage?.event === "analysis_complete") {
      const { meal_id, data } = lastMessage;
      const analysisData: MealAnalysis = {
        meal_id,
        ...data,
      };

      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE meals 
           SET status = 'complete',
           last_analysis = ?
           WHERE meal_id = ?`,
          [JSON.stringify(analysisData), meal_id],
          () => {
            const meal = weeklyMeals.find((m) => m.meal_id === meal_id);
            if (!meal) return;

            const macros = getMealMacros({
              ...meal,
              last_analysis: analysisData,
            });

            saveFoodData({
              foodName: data.meal_name,
              mealType: "Lunch",
              date: new Date(data.timestamp).toISOString(),
              energy: macros.calories,
              carbohydrates: macros.carbs,
              protein: macros.proteins,
              fatTotal: macros.fats,
            });
            refreshMeals();
          },
          (_, error) => {
            console.error("Error updating meal:", error);
            return false;
          }
        );
      });
    }
  }, [lastMessage, saveFoodData]);

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
    setWeeklyMeals((prevMeals) => {
      return prevMeals.map((meal) => {
        if (meal.meal_id === mealId) {
          return {
            ...meal,
            name: data.meal_name,
            ingredients: data.ingredients,
            carbs: totalCarbs(data.ingredients),
            proteins: totalProteins(data.ingredients),
            fats: totalFats(data.ingredients),
            status: "complete" as MealStatus,
          };
        }
        return meal;
      });
    });
  };

  useEffect(() => {
    if (lastMessage && lastMessage.meal_id) {
      updateMealData(lastMessage.meal_id, lastMessage.data);
    }
  }, [lastMessage]);

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
      }}
    >
      {children}
    </MealsDatabaseContext.Provider>
  );
};

export const useMealsDatabase = () => useContext(MealsDatabaseContext);

export { MealStatus } from "../types";
