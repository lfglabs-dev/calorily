import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import CaloriesGoalCard from "../cards/CaloriesGoal";
import PastMeals from "../cards/PastMeals";
import { useAddMeal } from "../../hooks/useAddMeal";
import ReviewMeal from "../addmeal/ReviewMeal";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { StoredMeal } from "../../types";

const Summary = ({ navigation }) => {
  const scheme = useColorScheme();
  const { pickFromLibrary, takePhoto, loading } = useAddMeal();
  const [reviewingMeal, setReviewingMeal] = useState(null);
  const { updateMeal } = useMealsDatabase();

  const onMealUpdate = (meal: StoredMeal, updatedData: any) => {
    updateMeal({
      meal_id: meal.meal_id,
      status: updatedData.status,
      last_analysis: updatedData.last_analysis,
    });
  };

  return (
    <View style={dynamicStyles(scheme).container}>
      <Text style={dynamicStyles(scheme).title}>Summary</Text>
      <CaloriesGoalCard />
      <PastMeals onMealPress={(meal) => setReviewingMeal(meal)} />
      <TouchableOpacity
        style={dynamicStyles(scheme).secondaryButton}
        onPress={pickFromLibrary}
        disabled={loading}
      >
        <Text style={dynamicStyles(scheme).secondaryButtonText}>
          Load from Library
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={dynamicStyles(scheme).mainButton}
        onPress={takePhoto}
        disabled={loading}
      >
        <Text style={dynamicStyles(scheme).mainButtonText}>
          Quickly Add Meal
        </Text>
      </TouchableOpacity>

      {reviewingMeal && (
        <ReviewMeal
          mealData={reviewingMeal}
          onUpdate={(updatedData) => {
            onMealUpdate(reviewingMeal, updatedData);
            setReviewingMeal(null);
          }}
          onClose={() => setReviewingMeal(null)}
        />
      )}
    </View>
  );
};

const dynamicStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
      padding: 15,
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 32,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 30,
      marginTop: 55,
      marginLeft: 5,
    },
    mainButton: {
      marginTop: 12,
      alignItems: "center",
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
    },
    mainButtonText: {
      color: "#FFF",
      fontSize: 18,
    },
    secondaryButton: {
      marginTop: 12,
      alignItems: "center",
      backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
      padding: 15,
      borderRadius: 10,
    },
    secondaryButtonText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 18,
    },
  });

export default Summary;
