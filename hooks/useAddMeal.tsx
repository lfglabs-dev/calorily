import { useHealthData } from "../shared/HealthDataContext";
import { useMealsDatabase } from "../shared/MealsStorageContext";

const useAddMeal = () => {
  const { insertMeal } = useMealsDatabase();
  const { saveFoodData } = useHealthData();

  const addMeal = async (imageUri: string, mealId?: string) => {
    try {
      await insertMeal(imageUri, mealId);
      return true;
    } catch (error) {
      console.error("Error adding meal:", error);
      return false;
    }
  };

  return addMeal;
};

export default useAddMeal;
