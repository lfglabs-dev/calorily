import { Ingredient, StoredMeal } from "../types";

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

export const getMealMacros = (meal: StoredMeal) => {
  if (!meal.last_analysis) {
    return { calories: 0, carbs: 0, proteins: 0, fats: 0 };
  }

  const ingredients = meal.last_analysis.ingredients;
  const carbs = ingredients.reduce((sum, ing) => sum + ing.carbs, 0);
  const proteins = ingredients.reduce((sum, ing) => sum + ing.proteins, 0);
  const fats = ingredients.reduce((sum, ing) => sum + ing.fats, 0);
  const calories = ingredients.reduce(
    (sum, ing) => sum + calculateCalories(ing),
    0
  );

  return { calories, carbs, proteins, fats };
};

export const getDailyMacros = (meals: StoredMeal[]) => {
  return meals.reduce(
    (acc, meal) => {
      const macros = getMealMacros(meal);
      return {
        calories: acc.calories + macros.calories,
        carbs: acc.carbs + macros.carbs,
        proteins: acc.proteins + macros.proteins,
        fats: acc.fats + macros.fats,
      };
    },
    { calories: 0, carbs: 0, proteins: 0, fats: 0 }
  );
};

export const totalCarbs = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((sum, ing) => sum + ing.carbs, 0);
};

export const totalProteins = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((sum, ing) => sum + ing.proteins, 0);
};

export const totalFats = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((sum, ing) => sum + ing.fats, 0);
};

export const totalCalories = (meals: StoredMeal[]): number => {
  return meals.reduce((sum, meal) => {
    const macros = getMealMacros(meal);
    return sum + macros.calories;
  }, 0);
};
