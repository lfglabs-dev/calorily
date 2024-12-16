import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { v4 as uuidv4 } from "uuid";
import { useMealsDatabase } from "../shared/MealsStorageContext";
import { mealService } from "../services/mealService";
import { Alert } from "react-native";
import { useAuth } from "../shared/AuthContext";

export const useAddMeal = () => {
  const [loading, setLoading] = useState(false);
  const { insertMeal, addOptimisticMeal, updateOptimisticMeal } =
    useMealsDatabase();
  const { jwt } = useAuth();

  const handleImageUpload = async (imageUri: string) => {
    const mealId = uuidv4();
    console.log("Starting image upload:", { mealId, imageUri });

    try {
      console.log("Adding optimistic meal...");
      addOptimisticMeal(mealId, imageUri);

      console.log("Uploading to server...");
      const response = await mealService.uploadMeal(imageUri, mealId, jwt);
      console.log("Server response:", response);

      console.log("Updating optimistic meal status to analyzing...");
      updateOptimisticMeal(mealId, { status: "analyzing" });

      console.log("Inserting meal into local DB...");
      await insertMeal({
        meal_id: mealId,
        image_uri: imageUri,
        status: "analyzing",
      });

      console.log("Upload process completed successfully");
      return true;
    } catch (error) {
      console.error("Error uploading meal:", {
        error,
        message: error.message,
        stack: error.stack,
        response: error.response?.text ? await error.response.text() : null,
      });

      updateOptimisticMeal(mealId, {
        status: "error",
        error_message: error.message || "Failed to upload image",
      });
      return false;
    }
  };

  const pickFromLibrary = async () => {
    try {
      setLoading(true);
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Photo Library Access Required",
          "Calorily needs access to your photos. You can enable it in your iOS settings."
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        quality: 0.075,
      });

      if (!result.canceled && result.assets) {
        return handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to load photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    try {
      setLoading(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Camera Access Required",
          "Calorily needs camera access to take photos of your meals. You can enable it in your settings."
        );
        return null;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        quality: 0.075,
      });

      if (!result.canceled && result.assets) {
        return handleImageUpload(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    pickFromLibrary,
    takePhoto,
    loading,
    handleImageUpload,
  };
};
