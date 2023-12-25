type ExtendedIngredient = {
    name: string;
    amount: string;
    carbs: number;
    proteins: number;
    fats: number;
    calories: number;
    selected: boolean;
  };

type Ingredient = {
  name: string;
  amount: string;
  carbs: number;
  proteins: number;
  fats: number;
};

type ApiResponse = {
  type: string;
  name: string;
  ingredients: Ingredient[];
};
