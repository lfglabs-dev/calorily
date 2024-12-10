import { Ingredient, ExtendedIngredient } from "../types";
import { StoredMeal } from "../shared/MealsStorageContext";

const CALORIES_PER_GRAM = {
  carbs: 4,
  proteins: 4,
  fats: 9,
};

export const calculateCalories = (ingredient: Ingredient): number => {
  return (
    ingredient.carbs * CALORIES_PER_GRAM.carbs +
    ingredient.proteins * CALORIES_PER_GRAM.proteins +
    ingredient.fats * CALORIES_PER_GRAM.fats
  );
};

export const totalCalories = (ingredients: ExtendedIngredient[]): number => {
  return ingredients
    .filter((ing) => ing.selected)
    .reduce((sum, ing) => sum + calculateCalories(ing), 0);
};

export const totalCarbs = (ingredients: ExtendedIngredient[]): number => {
  return ingredients
    .filter((ing) => ing.selected)
    .reduce((sum, ing) => sum + ing.carbs, 0);
};

export const totalProteins = (ingredients: ExtendedIngredient[]): number => {
  return ingredients
    .filter((ing) => ing.selected)
    .reduce((sum, ing) => sum + ing.proteins, 0);
};

export const totalFats = (ingredients: ExtendedIngredient[]): number => {
  return ingredients
    .filter((ing) => ing.selected)
    .reduce((sum, ing) => sum + ing.fats, 0);
};

export const getDailyCalories = (
  mealEntries: StoredMeal[]
): {
  [day: string]: StoredMeal[];
} => {
  const mealsByDay: { [day: string]: StoredMeal[] } = {};

  mealEntries.forEach((meal) => {
    const date = new Date(meal.timestamp * 1000);
    const dayKey = date.toISOString().split("T")[0];

    if (!mealsByDay[dayKey]) {
      mealsByDay[dayKey] = [];
    }

    mealsByDay[dayKey].push(meal);
  });

  return mealsByDay;
};
