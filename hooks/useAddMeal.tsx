import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { useHealthData } from "../shared/HealthDataContext";
import { useMealsDatabase } from "../shared/MealsStorageContext";

export const useAddMeal = () => {
  const [loading, setLoading] = useState(false);
  const { insertMeal } = useMealsDatabase();
  const { saveFoodData } = useHealthData();

  const pickImage = async () => {
    try {
      setLoading(true);
      // Request permissions and immediately launch picker if granted
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status === "granted") {
        // Immediately launch picker after getting permission
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

        if (!result.canceled) {
          return result.assets[0].uri;
        }
      }
      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const addMeal = async (imageUri: string, mealId?: string) => {
    try {
      await insertMeal(imageUri, mealId);
      return true;
    } catch (error) {
      console.error("Error adding meal:", error);
      return false;
    }
  };

  return {
    pickImage,
    loading,
    addMeal,
  };
};
