export interface Ingredient {
  name: string;
  amount: number;
  carbs: number;
  proteins: number;
  fats: number;
}

export interface MealAnalysis {
  meal_id: string;
  meal_name: string;
  ingredients: Ingredient[];
  timestamp: string;
}

export interface StoredMeal {
  meal_id: string;
  image_uri: string;
  favorite: boolean;
  status: MealStatus;
  created_at: number;
  last_analysis?: MealAnalysis;
  error_message?: string;
}

export type MealStatus = "uploading" | "analyzing" | "complete" | "error";

export interface MealTemplate {
  id?: number;
  name: string;
  image_uri: string;
  carbs: number;
  proteins: number;
  fats: number;
  favorite: boolean;
}

export interface OptimisticMeal extends StoredMeal {
  isOptimistic?: boolean;
}
