import { useState, useCallback } from "react";
import { StoredMeal } from "../types";
import { useMealsDatabase } from "../shared/MealsStorageContext";

export const useMealLibrary = () => {
  const { fetchMealsInRangeAsync, deleteMealById, updateMeal } =
    useMealsDatabase();
  const [meals, setMeals] = useState<StoredMeal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMeals = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedMeals = await fetchMealsInRangeAsync(0, 100);
      if (Array.isArray(fetchedMeals)) {
        setMeals(fetchedMeals);
      } else {
        console.error("Fetched meals is not an array:", fetchedMeals);
        setMeals([]);
      }
    } catch (err) {
      console.error("Error loading meals:", err);
      setError(err.message);
      setMeals([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchMealsInRangeAsync]);

  const toggleFavorite = useCallback(
    async (meal: StoredMeal) => {
      try {
        const newFavoriteValue = !meal.favorite;
        await updateMeal({
          meal_id: meal.meal_id,
          favorite: newFavoriteValue,
        });

        setMeals((currentMeals) => {
          const newMeals = currentMeals.map((m) =>
            m.meal_id === meal.meal_id
              ? { ...m, favorite: newFavoriteValue }
              : m
          );
          return newMeals;
        });
      } catch (err) {
        console.error("Error in toggleFavorite:", err);
        setMeals((currentMeals) =>
          currentMeals.map((m) =>
            m.meal_id === meal.meal_id ? { ...m, favorite: meal.favorite } : m
          )
        );
      }
    },
    [updateMeal]
  );

  const removeMeal = useCallback(
    async (meal: StoredMeal) => {
      try {
        if (meal.favorite) {
          await toggleFavorite(meal);
        } else {
          await deleteMealById(meal.meal_id);
          await loadMeals();
        }
      } catch (err) {
        console.error("Error removing meal:", err);
      }
    },
    [deleteMealById, toggleFavorite, loadMeals]
  );

  return {
    meals,
    setMeals,
    isLoading,
    error,
    loadMeals,
    removeMeal,
    toggleFavorite,
  };
};
