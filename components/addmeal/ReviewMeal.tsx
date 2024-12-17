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
import { ReviewMealHandle } from "./BottomSheet/ReviewMealHandle";
import { IngredientItem } from "./IngredientItem";
import { calculateCalories } from "../../utils/food";
import LongTextInputDialog from "./FixBugDialog";
import { useAuth } from "../../shared/AuthContext";
import { StoredMeal } from "../../types";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { MacroIcon } from "../common/MacroIcon";

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

  const handleFeedback = (feedback: string) => {
    const previousStatus = mealData.status;
    const previousErrorMessage = mealData.error_message;

    setDialogVisible(false);
    onUpdate({
      status: "analyzing",
      error_message: null,
    });

    fetch("https://api.calorily.com/meals/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        meal_id: mealData.meal_id,
        feedback,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.text();
        if (data) {
          console.log("Feedback submitted successfully:", data);
        }
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
        onUpdate({
          status: previousStatus,
          error_message: previousErrorMessage,
        });
      });
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
      snapPoints={SNAP_POINTS}
      onClose={onClose}
      backgroundComponent={CustomBackground}
      handleComponent={ReviewMealHandle}
    >
      <View style={styles(colorScheme).contentContainer}>
        <View style={styles(colorScheme).titleContainer}>
          <Text style={styles(colorScheme).title}>
            {mealData?.last_analysis?.meal_name || "Meal Analysis"}
          </Text>
        </View>

        <View style={styles(colorScheme).macroContainer}>
          <View style={styles(colorScheme).macroGroup}>
            <View style={styles(colorScheme).macroItem}>
              <MacroIcon
                type="proteins"
                size={20}
                color={colorScheme === "dark" ? "#FFF" : "#000"}
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
              <MacroIcon
                type="fats"
                size={20}
                color={colorScheme === "dark" ? "#FFF" : "#000"}
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
              <MacroIcon
                type="carbs"
                size={20}
                color={colorScheme === "dark" ? "#FFF" : "#000"}
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
          <Text style={styles(colorScheme).secondaryButtonText}>Fix a bug</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(colorScheme).mainButton}
          onPress={() => bottomSheetRef.current?.close()}
        >
          <Text style={styles(colorScheme).mainButtonText}>Close</Text>
        </TouchableOpacity>
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
