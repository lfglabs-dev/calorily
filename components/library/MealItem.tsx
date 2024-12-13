import React, {
  Dispatch,
  SetStateAction,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  TouchableOpacity,
  View,
  Text,
  ImageBackground,
  Animated,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StoredMeal, MealTemplate } from "../../types";

interface MealItemProps {
  meal: StoredMeal;
  setMeals: React.Dispatch<React.SetStateAction<StoredMeal[]>>;
  removeMeal: (meal: StoredMeal) => Promise<void>;
  handlePrefillMeal: (meal: MealTemplate) => void;
  toggleFavorite: (meal: StoredMeal) => Promise<void>;
}

const MealItem: React.FC<MealItemProps> = ({
  meal,
  setMeals,
  removeMeal,
  handlePrefillMeal,
  toggleFavorite,
}) => {
  const scheme = useColorScheme();
  const animatedOpacity = useRef(
    new Animated.Value(meal.favorite ? 1 : 0)
  ).current;

  const handlePrefill = () => {
    if (!meal.last_analysis) return;

    const { meal_name, ingredients } = meal.last_analysis;
    const totalCarbs = ingredients.reduce((sum, ing) => sum + ing.carbs, 0);
    const totalProteins = ingredients.reduce(
      (sum, ing) => sum + ing.proteins,
      0
    );
    const totalFats = ingredients.reduce((sum, ing) => sum + ing.fats, 0);

    handlePrefillMeal({
      name: meal_name,
      image_uri: meal.image_uri,
      carbs: totalCarbs,
      proteins: totalProteins,
      fats: totalFats,
      favorite: meal.favorite,
    });
  };

  const handleFavoriteToggle = async () => {
    setMeals((currentMeals) => {
      const newMeals = currentMeals.map((m) =>
        m.meal_id === meal.meal_id ? { ...m, favorite: !m.favorite } : m
      );
      return newMeals;
    });

    try {
      await toggleFavorite(meal);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setMeals((currentMeals) =>
        currentMeals.map((m) =>
          m.meal_id === meal.meal_id ? { ...m, favorite: meal.favorite } : m
        )
      );
    }
  };

  const handleLongPress = handleFavoriteToggle;

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: meal.favorite ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [meal.favorite]);

  return (
    <TouchableOpacity
      style={styles.mealContainer}
      onLongPress={handleLongPress}
      onPress={handleFavoriteToggle}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: meal.image_uri }}
        style={styles.mealImage}
        imageStyle={styles.imageStyle}
      >
        <View
          style={[
            styles.overlay,
            {
              backgroundColor:
                scheme === "dark"
                  ? "rgba(0, 0, 0, 0.5)"
                  : "rgba(255, 255, 255, 0.5)",
            },
          ]}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => removeMeal(meal)}>
            <Ionicons
              name="close-circle"
              size={30}
              color={scheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrefill}>
            <Ionicons
              name="add-circle"
              size={30}
              color={scheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.mealName,
              { color: scheme === "dark" ? "#fff" : "#000" },
            ]}
          >
            {meal.last_analysis?.meal_name || "Unnamed Meal"}
          </Text>
        </View>
      </ImageBackground>
      <Animated.View style={[styles.centerIcon, { opacity: animatedOpacity }]}>
        <Ionicons
          name="heart"
          size={48}
          color={scheme === "dark" ? "white" : "black"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
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
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 10,
  },
});

export default MealItem;
