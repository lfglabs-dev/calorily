export const calculateCalories = (macro: Macro): number => {
  const carbsCalories = macro.carbs * 4;
  const proteinsCalories = macro.proteins * 4;
  const fatsCalories = macro.fats * 9;

  return carbsCalories + proteinsCalories + fatsCalories;
};

export const totalCarbs = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ingredient) => total + ingredient.carbs, 0);
};

export const totalProteins = (ingredients: Ingredient[]): number => {
  return ingredients.reduce(
    (total, ingredient) => total + ingredient.proteins,
    0
  );
};

export const totalFats = (ingredients: Ingredient[]): number => {
  return ingredients.reduce((total, ingredient) => total + ingredient.fats, 0);
};

export const totalCalories = (macros: Macro[]): number => {
  return macros.reduce((total, macro) => total + calculateCalories(macro), 0);
};
