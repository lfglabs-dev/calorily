import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  ImageBackground,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import { CustomBackground } from "./BottomSheet/CustomBackground";
import { CustomHandle } from "./BottomSheet/CustomHandle";
import { IngredientItem } from "./IngredientItem";
import { calculateCalories } from "../../utils/food";
import LongTextInputDialog from "./FixBugDialog";
import { useAuth } from "../../shared/AuthContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoredMeal } from "../../types";
import { useMealsDatabase } from "../../shared/MealsStorageContext";

const SNAP_POINTS = ["90%"];

interface ReviewMealProps {
  mealData: StoredMeal;
  onUpdate: (updates: Partial<StoredMeal>) => void;
  onClose: () => void;
}

const ReviewMeal = ({ mealData, onUpdate, onClose }: ReviewMealProps) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const { jwt } = useAuth();
  const { updateMeal } = useMealsDatabase();

  const ingredients =
    mealData?.last_analysis?.ingredients?.map((item) => ({
      ...item,
      calories: calculateCalories(item),
      selected: true,
    })) || [];

  const handleFeedback = async (feedback: string) => {
    try {
      const meal_id = mealData.meal_id;
      console.log("Sending feedback for meal:", meal_id);
      console.log("Feedback content:", feedback);

      const response = await fetch("https://api.calorily.com/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          meal_id,
          feedback: feedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Feedback API error:", {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(`API error: ${errorData.message || "Unknown error"}`);
      }

      const data = await response.json();
      console.log("Feedback submitted successfully:", data);

      setDialogVisible(false);
      onUpdate({
        status: "analyzing",
        error_message: null,
      });
    } catch (error) {
      console.error("Error submitting feedback:", {
        error: error.message,
        stack: error.stack,
        meal_id: mealData.meal_id,
      });
      // Optionally show an error message to the user
    }
  };

  const handleUpdate = async (updates: Partial<StoredMeal>) => {
    await updateMeal({
      meal_id: mealData.meal_id,
      ...updates,
    });
    onUpdate?.(updates);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundComponent={CustomBackground}
      handleComponent={CustomHandle}
      onClose={onClose}
    >
      <View style={styles(colorScheme).contentContainer}>
        <ImageBackground
          source={{ uri: mealData.image_uri }}
          style={styles(colorScheme).imageBackground}
          imageStyle={styles(colorScheme).backgroundImage}
        >
          <View style={styles(colorScheme).titleContainer}>
            <Text style={styles(colorScheme).resultTitle}>
              {mealData.last_analysis?.meal_name || "Unnamed Meal"}
            </Text>
            <Text style={styles(colorScheme).calories}>
              {Math.round(
                ingredients.reduce(
                  (sum, item) => sum + calculateCalories(item),
                  0
                )
              )}{" "}
              kCal
            </Text>
          </View>

          <View style={styles(colorScheme).macroContainer}>
            <View style={styles(colorScheme).macroGroup}>
              <View style={styles(colorScheme).macroItem}>
                <Ionicons
                  name="egg"
                  size={20}
                  style={styles(colorScheme).macroIcon}
                />
                <Text style={styles(colorScheme).macroText}>
                  {Math.round(
                    ingredients.reduce((sum, item) => sum + item.proteins, 0)
                  )}
                  g
                </Text>
              </View>

              <View style={styles(colorScheme).macroItem}>
                <Ionicons
                  name="pizza"
                  size={20}
                  style={styles(colorScheme).macroIcon}
                />
                <Text style={styles(colorScheme).macroText}>
                  {Math.round(
                    ingredients.reduce((sum, item) => sum + item.fats, 0)
                  )}
                  g
                </Text>
              </View>

              <View style={styles(colorScheme).macroItem}>
                <Ionicons
                  name="ice-cream"
                  size={20}
                  style={styles(colorScheme).macroIcon}
                />
                <Text style={styles(colorScheme).macroText}>
                  {Math.round(
                    ingredients.reduce((sum, item) => sum + item.carbs, 0)
                  )}
                  g
                </Text>
              </View>
            </View>
          </View>

          <BottomSheetFlatList
            data={ingredients}
            renderItem={({ item, index }) => (
              <IngredientItem
                item={item}
                index={index}
                colorScheme={colorScheme}
                toggleSelection={() => {}}
              />
            )}
            keyExtractor={(_item, index) => index.toString()}
          />

          <TouchableOpacity
            style={styles(colorScheme).secondaryButton}
            onPress={() => setDialogVisible(true)}
          >
            <Text style={styles(colorScheme).secondaryButtonText}>
              Fix a bug
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles(colorScheme).mainButton}
            onPress={() => bottomSheetRef.current?.close()}
          >
            <Text style={styles(colorScheme).mainButtonText}>Close</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>

      <LongTextInputDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSubmit={handleFeedback}
      />
    </BottomSheet>
  );
};

export default ReviewMeal;
