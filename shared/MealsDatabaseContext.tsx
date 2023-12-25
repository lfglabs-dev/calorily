import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("meals.db");

type Meal = Macro & {
  name: string;
  type: string;
  timestamp: number;
};

type MealEntry = Meal & { id: number };

const setupDatabaseAsync = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS meals (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, type TEXT, carbs REAL, proteins REAL, fats REAL, timestamp INTEGER);",
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

const insertMealAsync = async (meal: Meal): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO meals (name, type, carbs, proteins, fats, timestamp) VALUES (?, ?, ?, ?, ?, ?);",
        [
          meal.name,
          meal.type,
          meal.carbs,
          meal.proteins,
          meal.fats,
          meal.timestamp,
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

const fetchDailyMealsAsync = async (): Promise<MealEntry[]> => {
  const startOfToday = new Date();
  startOfToday.setHours(2, 0, 0, 0);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals WHERE timestamp > ? ORDER BY timestamp DESC;",
        [Math.floor(startOfToday.getTime() / 1000)],
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
        "UPDATE meals SET name = ?, type = ?, carbs = ?, proteins = ?, fats = ?, timestamp = ? WHERE id = ?;",
        [
          meal.name,
          meal.type,
          meal.carbs,
          meal.proteins,
          meal.fats,
          meal.timestamp,
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

type MealsDatabaseContextProps = {
  meals: MealEntry[];
  insertMeal: (meal: Meal) => Promise<void>;
  deleteMealById: (id: number) => Promise<void>;
  updateMealById: (id: number, meal: Meal) => Promise<void>;
  refreshMeals: () => Promise<void>;
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  meals: [],
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
  const [meals, setMeals] = useState<MealEntry[]>([]);

  useEffect(() => {
    setupDatabaseAsync()
      .then(() => refreshMeals())
      .catch(console.error);
  }, []);

  const refreshMeals = async () => {
    const dailyMeals = await fetchDailyMealsAsync();
    setMeals(dailyMeals);
  };

  const insertMeal = async (meal: Meal) => {
    await insertMealAsync(meal);
    await refreshMeals();
  };

  const deleteMealById = async (id: number) => {
    await deleteMealByIdAsync(id);
    await refreshMeals();
  };

  const updateMealById = async (id: number, meal: Meal) => {
    await updateMealByIdAsync(id, meal);
    await refreshMeals();
  };

  return (
    <MealsDatabaseContext.Provider
      value={{
        meals,
        insertMeal,
        deleteMealById,
        updateMealById,
        refreshMeals,
      }}
    >
      {children}
    </MealsDatabaseContext.Provider>
  );
};

export const useMealsDatabase = () => useContext(MealsDatabaseContext);
