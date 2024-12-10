export interface Ingredient {
  name: string;
  amount: number;
  carbs: number;
  proteins: number;
  fats: number;
}

export interface ExtendedIngredient extends Ingredient {
  calories: number;
  selected: boolean;
}

export interface ApiResponse {
  name: string;
  ingredients: Ingredient[];
  error?: string;
  response?: string;
}
