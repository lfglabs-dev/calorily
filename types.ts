type Macro = {
  carbs: number;
  proteins: number;
  fats: number;
};

type Ingredient = Macro & {
  name: string;
  amount: string;
};

type Meal = Macro & {
  name: string;
  timestamp: number;
  favorite: boolean;
};

type MealEntry = Meal & { id: number; image_uri: string };

type ApiResponse = {
  type: string;
  name: string;
  ingredients: Ingredient[];
};
