type Macro = {
  carbs: number;
  proteins: number;
  fats: number;
};

type Ingredient = Macro & {
  name: string;
  amount: string;
};

type ApiResponse = {
  type: string;
  name: string;
  ingredients: Ingredient[];
};
