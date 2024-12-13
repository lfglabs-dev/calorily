import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
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

const ReviewMeal = ({
  imageURI,
  mealData,
  onUpdate,
  onClose,
}: {
  imageURI: string;
  mealData: StoredMeal;
  onUpdate: (data: any) => void;
  onClose: () => void;
}) => {
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
      const requestBody = {
        meal_id,
        feedback,
      };
      console.log("Sending feedback request:", {
        url: "https://api.calorily.com/meals/feedback",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt.slice(0, 10)}...`, // Log partial JWT for security
        },
        body: requestBody,
      });

      // Optimistically update and close
      onUpdate({
        status: "analyzing",
        last_analysis: null,
      });
      setDialogVisible(false);
      onClose();

      // Send request in background
      const response = await fetch("https://api.calorily.com/meals/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to submit feedback");
      }
    } catch (error) {
      console.error("Feedback error:", error);
      alert(error.message);
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
