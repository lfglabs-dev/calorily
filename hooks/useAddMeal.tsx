import { useHealthData } from "../shared/HealthDataContext";
import { useMealsDatabase } from "../shared/MealsStorageContext";
import { calculateCalories } from "../utils/food";
import { StoredMeal } from "../shared/MealsStorageContext";

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

  const addMeal = async (
    meal: Partial<StoredMeal>,
    imageUri: string,
    mealId?: string
  ) => {
    try {
      // Don't save to HealthKit here - wait for WebSocket response
      await insertMeal(meal, imageUri, mealId);

      // Remove or comment out this line
      // saveFoodData(nutrientData);

      return true;
    } catch (error) {
      console.error("Error adding meal:", error);
      return false;
    }
  };

  return addMeal;
};

export default useAddMeal;
