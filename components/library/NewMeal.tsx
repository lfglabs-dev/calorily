import React, { useState, useEffect } from "react";
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
import { calculateCalories } from "../../utils/food";
import { v4 as uuidv4 } from "uuid";
import { MealAnalysis, MealTemplate } from "../../types";
import { useSingleImagePicker } from "../../hooks/useSingleImagePicker";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../navigation/types";

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

interface NewMealProps {
  prefilledMeal?: MealTemplate;
}

const NewMeal: React.FC<NewMealProps> = ({ prefilledMeal }) => {
  const [formData, setFormData] = useState<NewMealFormData>({});
  const { insertMeal } = useMealsDatabase();
  const scheme = useColorScheme();
  const { pickImage } = useSingleImagePicker();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  useEffect(() => {
    if (prefilledMeal) {
      const roundToOneDecimal = (num?: number) =>
        num !== undefined ? Number(num.toFixed(1)) : undefined;

      const carbs = roundToOneDecimal(prefilledMeal.carbs);
      const proteins = roundToOneDecimal(prefilledMeal.proteins);
      const fats = roundToOneDecimal(prefilledMeal.fats);

      setFormData({
        mealName: prefilledMeal.name,
        imageUri: prefilledMeal.image_uri,
        carbs,
        proteins,
        fats,
        carbsDisplay: carbs?.toString(),
        proteinsDisplay: proteins?.toString(),
        fatsDisplay: fats?.toString(),
      });
    }
  }, [prefilledMeal]);

  const calories = React.useMemo(() => {
    return calculateCalories({
      name: "temp",
      weight: 100,
      carbs: formData.carbs || 0,
      proteins: formData.proteins || 0,
      fats: formData.fats || 0,
    });
  }, [formData.carbs, formData.proteins, formData.fats]);

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
    try {
      const analysis: MealAnalysis = {
        meal_id: uuidv4(),
        meal_name: formData.mealName || "Custom Meal",
        ingredients: [
          {
            name: formData.mealName || "Custom Meal",
            weight: 100,
            carbs: formData.carbs || 0,
            proteins: formData.proteins || 0,
            fats: formData.fats || 0,
          },
        ],
        timestamp: new Date().toISOString(),
      };

      const timestamp = Math.floor(Date.now() / 1000);

      await insertMeal({
        meal_id: analysis.meal_id,
        image_uri: formData.imageUri,
        status: "complete",
        last_analysis: analysis,
        created_at: timestamp,
      });

      setFormData({});
      navigation.navigate("Summary");
    } catch (error) {
      console.error("Error adding meal:", error);
      Alert.alert("Error", "Failed to add meal");
    }
  };

  const handleImageSelection = async () => {
    const imageUri = await pickImage();
    if (imageUri) {
      setFormData((prev) => ({ ...prev, imageUri }));
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
          <Text style={styles.calories}>{calories.toFixed(1)} kcal</Text>
        </View>

        <View style={styles.imageButtonContainer}>
          <TouchableOpacity
            style={styles.selectPhotoButton}
            onPress={handleImageSelection}
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
