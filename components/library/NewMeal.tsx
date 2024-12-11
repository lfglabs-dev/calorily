import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
  Image,
  Keyboard,
} from "react-native";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import * as ImagePicker from "expo-image-picker";
import UploadingMeal from "../addmeal/UploadingMeal";
import useResizedImage from "../../hooks/useResizedImage";
import Ionicons from "@expo/vector-icons/Ionicons";
import { calculateCalories } from "../../utils/food";

interface NewMealFormData {
  imageUri?: string;
  imageBase64?: string;
  mealName?: string;
  carbs?: number;
  proteins?: number;
  fats?: number;
  carbsDisplay?: string;
  proteinsDisplay?: string;
  fatsDisplay?: string;
}

const NewMeal = () => {
  const [formData, setFormData] = useState<NewMealFormData>({});
  const [isUploading, setIsUploading] = useState(false);
  const { insertMeal } = useMealsDatabase();
  const scheme = useColorScheme();
  const resizedImage = useResizedImage(formData.imageUri);

  const calories = React.useMemo(() => {
    return calculateCalories({
      name: "temp",
      amount: 100,
      carbs: formData.carbs || 0,
      proteins: formData.proteins || 0,
      fats: formData.fats || 0,
    });
  }, [formData.carbs, formData.proteins, formData.fats]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFormData((prev) => ({
          ...prev,
          imageUri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image");
    }
  };

  const handleInputChange = (field: keyof NewMealFormData, value: string) => {
    const numericField = field as "carbs" | "proteins" | "fats";
    const displayField = `${numericField}Display` as
      | "carbsDisplay"
      | "proteinsDisplay"
      | "fatsDisplay";

    setFormData((prev) => ({
      ...prev,
      [displayField]: value,
    }));

    const normalizedValue = value.replace(",", ".");
    const numValue =
      normalizedValue === "" ? undefined : Number(normalizedValue);

    if (numValue !== undefined && (isNaN(numValue) || numValue < 0)) return;

    setFormData((prev) => ({
      ...prev,
      [field]: numValue,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.imageUri || !resizedImage) {
      Alert.alert("Error", "Please select an image first");
      return;
    }

    setIsUploading(true);
    try {
      await insertMeal(formData.imageUri);
      setFormData({});
      Alert.alert("Success", "Meal added successfully");
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal");
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = Boolean(
    formData.imageUri &&
      formData.mealName &&
      formData.carbs !== undefined &&
      formData.proteins !== undefined &&
      formData.fats !== undefined
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingBottom: 20,
      paddingHorizontal: 20,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
    },
    inputContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 12,
    },
    label: {
      fontSize: 14,
      color: scheme === "dark" ? "#999" : "#666",
      marginBottom: 4,
    },
    input: {
      height: 40,
      borderWidth: 1,
      borderColor: scheme === "dark" ? "#444" : "#DDD",
      borderRadius: 8,
      paddingHorizontal: 10,
      color: scheme === "dark" ? "#FFF" : "#000",
      backgroundColor: scheme === "dark" ? "#222" : "#FFF",
    },
    buttonContainer: {
      marginTop: "auto",
      gap: 10,
    },
    imageButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    selectPhotoButton: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    imageThumbnail: {
      width: 50,
      height: 50,
      borderRadius: 10,
    },
    addButton: {
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 17,
      fontFamily: "System",
    },
    addButtonText: {
      color: "#FFF",
      fontSize: 17,
      fontFamily: "System",
      fontWeight: "600",
    },
    caloriesContainer: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#fff",
      borderRadius: 8,
      padding: 15,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 0,
    },
    caloriesLabel: {
      fontSize: 16,
      color: scheme === "dark" ? "#999" : "#666",
    },
    calories: {
      fontSize: 20,
      color: scheme === "dark" ? "#FFF" : "#000",
      fontWeight: "600",
    },
  });

  if (isUploading && formData.imageUri && resizedImage) {
    return (
      <UploadingMeal
        imageBase64={resizedImage.base64}
        imageURI={formData.imageUri}
        onComplete={(mealId) => {
          setIsUploading(false);
          setFormData({});
        }}
        onError={(error) => {
          setIsUploading(false);
          Alert.alert("Error", error.toString());
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Meal Name</Text>
          <TextInput
            style={styles.input}
            value={formData.mealName || ""}
            onChangeText={(value) =>
              setFormData((prev) => ({ ...prev, mealName: value }))
            }
            placeholder="Enter meal name"
            placeholderTextColor={scheme === "dark" ? "#666" : "#999"}
            returnKeyType="done"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Carbs (g)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.carbsDisplay || formData.carbs?.toString() || ""}
            onChangeText={(value) => handleInputChange("carbs", value)}
            placeholder="0"
            placeholderTextColor={scheme === "dark" ? "#666" : "#999"}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Proteins (g)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={
              formData.proteinsDisplay || formData.proteins?.toString() || ""
            }
            onChangeText={(value) => handleInputChange("proteins", value)}
            placeholder="0"
            placeholderTextColor={scheme === "dark" ? "#666" : "#999"}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Fats (g)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={formData.fatsDisplay || formData.fats?.toString() || ""}
            onChangeText={(value) => handleInputChange("fats", value)}
            placeholder="0"
            placeholderTextColor={scheme === "dark" ? "#666" : "#999"}
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <View style={styles.caloriesContainer}>
          <Text style={styles.caloriesLabel}>Total Calories</Text>
          <Text style={styles.calories}>{calories} kcal</Text>
        </View>

        <View style={styles.imageButtonContainer}>
          <TouchableOpacity
            style={styles.selectPhotoButton}
            onPress={pickImage}
          >
            <Text style={styles.buttonText}>
              {formData.imageUri ? "Change Photo" : "Select Photo"}
            </Text>
          </TouchableOpacity>

          {formData.imageUri && (
            <Image
              source={{ uri: formData.imageUri }}
              style={styles.imageThumbnail}
            />
          )}
        </View>

        <TouchableOpacity
          style={[styles.addButton, !isFormValid && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Text style={styles.addButtonText}>Add Meal</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NewMeal;
