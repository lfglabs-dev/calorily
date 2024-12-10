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

const FavoriteLibrary = ({
  handlePrefillMeal,
}: {
  handlePrefillMeal: (meal: MealTemplate | undefined) => void;
}) => {
  const { meals, setMeals, isLoading, error, loadMeals, removeMeal } =
    useMealLibrary();

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
          meals
            .filter((meal) => meal.favorite)
            .map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                setMeals={setMeals}
                removeMeal={removeMeal}
                handlePrefillMeal={handlePrefillMeal}
              />
            ))
        ) : (
          <Text>No favorite meals available</Text>
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
  mealContainer: {
    width: "50%",
    padding: 5,
  },
  mealImage: {
    width: "100%",
    height: 150,
    justifyContent: "space-between",
  },
  imageStyle: {
    borderRadius: 10,
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: 5,
  },
  centerIcon: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 50,
    alignItems: "center",
  },
  titleContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 5,
  },
  mealName: {
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});

export default FavoriteLibrary;
