import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";

const db = SQLite.openDatabase("meals.db");

const setupDatabaseAsync = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT, carbs REAL, proteins REAL, fats REAL, timestamp INTEGER, image_uri TEXT, favorite BOOLEAN NOT NULL DEFAULT 0);",
        [],
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

const insertMealAsync = async (
  meal: Meal,
  tmpImageURI: string
): Promise<void> => {
  const fileName = tmpImageURI.split("/").pop();
  const imagePath = FileSystem.documentDirectory + fileName;
  await FileSystem.copyAsync({
    from: tmpImageURI,
    to: imagePath,
  });

  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO meals (name, carbs, proteins, fats, timestamp, image_uri, favorite) VALUES (?, ?, ?, ?, ?, ?, ?);",
        [
          meal.name,
          meal.carbs,
          meal.proteins,
          meal.fats,
          meal.timestamp,
          imagePath,
          meal.favorite ? 1 : 0, // Convert boolean to integer for SQLite
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

const fetchMealsSinceTimestamp = async (
  timestamp: number
): Promise<MealEntry[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals WHERE timestamp >= ? ORDER BY timestamp DESC;",
        [timestamp],
        (_, result) => {
          resolve(result.rows._array as MealEntry[]);
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

const updateMealByIdAsync = async (id: number, meal: Meal): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "UPDATE meals SET name = ?, carbs = ?, proteins = ?, fats = ?, timestamp = ?, favorite = ? WHERE id = ?;",
        [
          meal.name,
          meal.carbs,
          meal.proteins,
          meal.fats,
          meal.timestamp,
          meal.favorite ? 1 : 0,
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
): Promise<MealEntry[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals ORDER BY timestamp DESC LIMIT ? OFFSET ?;",
        [count, startIndex],
        (_, result) => {
          resolve(result.rows._array as MealEntry[]);
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
  dailyMeals: MealEntry[];
  weeklyMeals: MealEntry[];
  fetchMealsInRangeAsync: (
    startIndex: number,
    count: number
  ) => Promise<MealEntry[]>;
  insertMeal: (meal: Meal, tmpImageUri: string) => Promise<void>;
  deleteMealById: (id: number) => Promise<void>;
  updateMealById: (id: number, meal: Meal) => Promise<void>;
  refreshMeals: () => Promise<void>;
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  dailyMeals: [],
  weeklyMeals: [],
  fetchMealsInRangeAsync: async (startIndex: number, count: number) => [],
  insertMeal: async () => {},
  deleteMealById: async () => {},
  updateMealById: async () => {},
  refreshMeals: async () => {},
});

type ProviderProps = {
  children: ReactNode;
};

export const MealsDatabaseProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  const [dailyMeals, setDailyMeals] = useState<MealEntry[]>([]);
  const [weeklyMeals, setWeeklyMeals] = useState<MealEntry[]>([]);

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

  const insertMeal = async (meal: Meal, tmpImageURI: string) => {
    await insertMealAsync(meal, tmpImageURI);
    await refreshMeals();
  };

  const deleteMealById = async (id: number) => {
    await deleteMealByIdAsync(id);
    await refreshMeals();
  };

  const updateMealById = async (id: number, meal: Meal) => {
    await updateMealByIdAsync(id, meal);
    const newDailyMeals = [];
    for (const oldMeal of weeklyMeals) {
      if (oldMeal.id === id) {
        newDailyMeals.push({ ...meal, id });
      } else {
        newDailyMeals.push(oldMeal);
      }
    }
    setWeeklyMeals(weeklyMeals);
    await refreshMeals();
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
