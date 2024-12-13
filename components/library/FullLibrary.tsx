import React, { useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Text,
} from "react-native";
import MealItem from "./MealItem";
import { StoredMeal, MealTemplate } from "../../types";
import { useMealLibrary } from "../../hooks/useMealLibrary";

const FullLibrary = ({
  handlePrefillMeal,
}: {
  handlePrefillMeal: (meal: MealTemplate | undefined) => void;
}) => {
  const {
    meals,
    setMeals,
    isLoading,
    error,
    loadMeals,
    removeMeal,
    toggleFavorite,
  } = useMealLibrary();

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error loading meals: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid}>
        {Array.isArray(meals) ? (
          meals.map((meal) => (
            <MealItem
              key={meal.meal_id}
              meal={meal}
              setMeals={setMeals}
              removeMeal={removeMeal}
              toggleFavorite={toggleFavorite}
              handlePrefillMeal={handlePrefillMeal}
            />
          ))
        ) : (
          <Text>No meals available</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

export default FullLibrary;
