import { MealAnalysis, StoredMeal } from "../types";
import * as SQLite from "expo-sqlite";
import { eventBus } from "./eventBus";

const db = SQLite.openDatabase("meals.db");

export const mealService = {
  updateMeal: async (
    updates: Partial<StoredMeal> & { meal_id: string }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const { meal_id, ...otherUpdates } = updates;
        const fields = Object.keys(otherUpdates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const values = fields.map((field) => {
          return typeof otherUpdates[field] === "object"
            ? JSON.stringify(otherUpdates[field])
            : otherUpdates[field];
        });
        const query = `UPDATE meals SET ${setClause} WHERE meal_id = ?`;
        const params = [...values, meal_id];

        tx.executeSql(
          query,
          params,
          () => {
            resolve();
            eventBus.emit("mealsUpdated");
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
};
