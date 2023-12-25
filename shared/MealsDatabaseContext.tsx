import React, { ReactNode, createContext, useContext, useEffect } from "react";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("meals.db");

type Meal = {
  name: string;
  type: string;
  carbs: number;
  proteins: number;
  fats: number;
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

const fetchLastMealsAsync = async (n: number): Promise<MealEntry[]> => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        "SELECT * FROM meals ORDER BY timestamp DESC LIMIT ?;",
        [n],
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
  insertMeal: (meal: Meal) => Promise<void>;
  fetchLastMeals: (n: number) => Promise<Meal[]>;
};

const MealsDatabaseContext = createContext<MealsDatabaseContextProps>({
  insertMeal: async () => {},
  fetchLastMeals: async () => [],
});

type ProviderProps = {
  children: ReactNode;
};

export const MealsDatabaseProvider: React.FC<ProviderProps> = ({
  children,
}) => {
  useEffect(() => {
    setupDatabaseAsync().catch(console.error);
  }, []);

  const insertMeal = async (meal: Meal) => {
    await insertMealAsync(meal);
  };

  const fetchLastMeals = async (n: number) => {
    return await fetchLastMealsAsync(n);
  };

  return (
    <MealsDatabaseContext.Provider value={{ insertMeal, fetchLastMeals }}>
      {children}
    </MealsDatabaseContext.Provider>
  );
};

export const useMealsDatabase = () => useContext(MealsDatabaseContext);
