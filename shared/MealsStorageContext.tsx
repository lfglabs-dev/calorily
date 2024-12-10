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
import AppleHealthKit from "react-native-health";
import { calculateCalories } from "../utils/food";
import { Ingredient } from "../types";
import { HealthValue } from "react-native-health";
import { useHealthData } from "./HealthDataContext";

const db = SQLite.openDatabase("meals.db");

export type MealStatus = "pending" | "analyzing" | "complete" | "error";

export interface StoredMeal {
  id?: number;
  name: string;
  carbs: number;
  proteins: number;
  fats: number;
  timestamp: number;
  image_uri: string;
  favorite: boolean;
  status: MealStatus;
  meal_id?: string;
}

const DB_VERSION = 2; // Increment this when schema changes

const setupDatabaseAsync = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Drop existing tables to force recreation
      tx.executeSql("DROP TABLE IF EXISTS meals", [], () => {
        tx.executeSql("DROP TABLE IF EXISTS version", [], () => {
          // Create version table first
          tx.executeSql(
            "CREATE TABLE IF NOT EXISTS version (version INTEGER PRIMARY KEY)",
            [],
            () => {
              // Create meals table
              tx.executeSql(
                `CREATE TABLE IF NOT EXISTS meals (
                  id INTEGER PRIMARY KEY AUTOINCREMENT, 
                  name TEXT, 
                  carbs REAL, 
                  proteins REAL, 
                  fats REAL, 
                  timestamp INTEGER, 
                  image_uri TEXT, 
                  favorite BOOLEAN NOT NULL DEFAULT 0,
                  status TEXT NOT NULL DEFAULT 'complete',
                  meal_id TEXT
                );`,
                [],
                () => {
                  // Insert initial version
                  tx.executeSql(
                    "INSERT INTO version (version) VALUES (?)",
                    [DB_VERSION],
                    () => resolve(),
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
    });
  });
};

const fetchMealsSinceTimestamp = async (
  timestamp: number
): Promise<StoredMeal[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals WHERE timestamp >= ? ORDER BY timestamp DESC;",
        [timestamp],
        (_, result) => {
          const meals = result.rows._array.map((row) => ({
            ...row,
            favorite: Boolean(row.favorite), // Convert SQLite integer to boolean
            status: (row.status || "complete") as MealStatus,
          }));
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

const deleteMealByIdAsync = async (id: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM meals WHERE id = ?;",
        [id],
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
  meal: Partial<StoredMeal>
): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `UPDATE meals 
         SET name = COALESCE(?, name),
             carbs = COALESCE(?, carbs),
             proteins = COALESCE(?, proteins),
             fats = COALESCE(?, fats),
             timestamp = COALESCE(?, timestamp),
             favorite = COALESCE(?, favorite),
             status = COALESCE(?, status)
         WHERE id = ?;`,
        [
          meal.name,
          meal.carbs,
          meal.proteins,
          meal.fats,
          meal.timestamp,
          meal.favorite ? 1 : 0,
          meal.status,
          id,
        ],
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

const fetchMealsInRangeAsync = async (
  startIndex: number,
  count: number
): Promise<StoredMeal[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals ORDER BY timestamp DESC LIMIT ? OFFSET ?;",
        [count, startIndex],
        (_, result) => {
          const meals = result.rows._array.map((row) => ({
            ...row,
            favorite: Boolean(row.favorite),
            status: (row.status || "complete") as MealStatus,
          }));
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

type MealsDatabaseContextProps = {
  dailyMeals: StoredMeal[];
  weeklyMeals: StoredMeal[];
  fetchMealsInRangeAsync: (
    startIndex: number,
    count: number
  ) => Promise<StoredMeal[]>;
  insertMeal: (
    meal: Partial<StoredMeal>,
    tmpImageUri: string,
    mealId?: string
  ) => Promise<void>;
  deleteMealById: (id: number) => Promise<void>;
  updateMealById: (
    id: number,
    meal: Partial<StoredMeal>
  ) => (meals: StoredMeal[]) => StoredMeal[];
  refreshMeals: () => Promise<void>;
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  dailyMeals: [],
  weeklyMeals: [],
  fetchMealsInRangeAsync: async () => [],
  insertMeal: async () => {},
  deleteMealById: async () => {},
  updateMealById: () => (meals) => meals,
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
    setupDatabaseAsync()
      .then(() => refreshMeals())
      .catch(console.error);
  }, []);

  useEffect(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const timestampToday = Math.floor(startOfToday.getTime() / 1000);
    const mealsForToday = weeklyMeals.filter(
      (meal) => meal.timestamp >= timestampToday
    );
    setDailyMeals(mealsForToday);
  }, [weeklyMeals]);

  useEffect(() => {
    if (lastMessage?.event === "analysis_complete") {
      const { meal_id, data } = lastMessage;

      const totalMacros = data.ingredients.reduce(
        (acc, ing) => ({
          carbs: acc.carbs + ing.carbs,
          proteins: acc.proteins + ing.proteins,
          fats: acc.fats + ing.fats,
        }),
        { carbs: 0, proteins: 0, fats: 0 }
      );

      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE meals 
           SET status = 'complete', 
               name = ?,
               carbs = ?, 
               proteins = ?, 
               fats = ? 
           WHERE meal_id = ?`,
          [
            data.meal_name,
            totalMacros.carbs,
            totalMacros.proteins,
            totalMacros.fats,
            meal_id,
          ],
          () => {
            const calories = calculateCalories({
              name: data.meal_name,
              amount: 1,
              ...totalMacros,
            });

            saveFoodData({
              foodName: data.meal_name,
              mealType: "Lunch",
              date: new Date().toISOString(),
              energy: calories,
              carbohydrates: totalMacros.carbs,
              protein: totalMacros.proteins,
              fatTotal: totalMacros.fats,
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

    const mealsSinceWeek = await fetchMealsSinceTimestamp(timestampWeek);

    setWeeklyMeals(mealsSinceWeek);
  };

  const insertMeal = async (
    meal: Partial<StoredMeal>,
    tmpImageURI: string,
    mealId?: string
  ) => {
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
            name, carbs, proteins, fats, timestamp, 
            image_uri, favorite, status, meal_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            meal.name || "Analyzing...",
            meal.carbs || 0,
            meal.proteins || 0,
            meal.fats || 0,
            meal.timestamp || Math.floor(Date.now() / 1000),
            imagePath,
            meal.favorite ? 1 : 0,
            mealId ? "analyzing" : "complete",
            mealId || null,
          ],
          () => {
            refreshMeals();
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

  const deleteMealById = async (id: number) => {
    await deleteMealByIdAsync(id);
    await refreshMeals();
  };

  const updateMealById = (id: number, meal: Partial<StoredMeal>) => {
    const toUpdated = (meals: StoredMeal[]) => {
      return meals.map((oldMeal) =>
        oldMeal.id === id
          ? {
              ...oldMeal,
              ...meal,
              id: oldMeal.id,
              image_uri: oldMeal.image_uri,
              status: meal.status || oldMeal.status,
            }
          : oldMeal
      );
    };

    updateMealByIdAsync(id, meal);
    setWeeklyMeals(toUpdated(weeklyMeals));
    return toUpdated;
  };

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
