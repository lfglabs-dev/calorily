import { useHealthData } from "../shared/HealthDataContext";
import { useMealsDatabase } from "../shared/MealsStorageContext";
import { calculateCalories } from "../utils/food";

const useAddMeal = () => {
  const { insertMeal } = useMealsDatabase();
  const { saveFoodData } = useHealthData();

  const getMealType = (mealDate: Date) => {
    const hours = mealDate.getHours();

    if (hours >= 5 && hours < 11) return "Breakfast";
    if (hours >= 11 && hours < 15) return "Lunch";
    if (hours >= 15 && hours < 18) return "Snacks";
    return "Dinner";
  };

  const addMeal = (meal: Meal, imageUri: string) => {
    const mealDate = new Date(meal.timestamp * 1000);
    const mealType = getMealType(mealDate);

    insertMeal(meal, imageUri);

    const nutrientData = {
      foodName: meal.name,
      mealType: mealType,
      date: mealDate.toISOString(),
      carbohydrates: meal.carbs,
      fatTotal: meal.fats,
      protein: meal.proteins,
      energy: calculateCalories(meal),
    };

    saveFoodData(nutrientData);
  };

  return addMeal;
};

export default useAddMeal;
