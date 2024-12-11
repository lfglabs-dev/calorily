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
import Ionicons from "react-native-vector-icons/Ionicons";

const SNAP_POINTS = ["90%"];

const ReviewMeal = ({ imageURI, mealData, onUpdate, onClose }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [dialogVisible, setDialogVisible] = useState(false);
  const { jwt } = useAuth();

  const ingredients =
    mealData?.ingredients?.map((item) => ({
      ...item,
      calories: calculateCalories(item),
      selected: true,
    })) || [];

  const handleFeedback = async (feedback: string) => {
    try {
      console.log("Submitting feedback for meal:", mealData.meal_id);
      const response = await fetch("https://api.calorily.com/meals/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          meal_id: mealData.last_analysis.meal_id,
          feedback,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit feedback");
      }

      setDialogVisible(false);
    } catch (error) {
      console.error("Feedback error:", error);
      alert(error.message);
    }
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
          <Text style={styles(colorScheme).resultTitle}>{mealData.name}</Text>
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
