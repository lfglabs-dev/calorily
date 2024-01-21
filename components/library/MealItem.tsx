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
import { useMealsDatabase } from "../../shared/MealsStorageContext";

const MealItem = ({
  meal,
  setMeals,
  removeMeal,
  handlePrefillMeal,
}: {
  meal: MealEntry;
  setMeals: Dispatch<SetStateAction<MealEntry[]>>;
  removeMeal: (meal: MealEntry) => void;
  handlePrefillMeal: (meal: MealTemplate | undefined) => void;
}) => {
  const scheme = useColorScheme();
  const { updateMealById } = useMealsDatabase();
  const animatedOpacity = useRef(
    new Animated.Value(meal.favorite ? 1 : 0)
  ).current;

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: meal.favorite ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [meal.favorite]);

  const onLongPress = () => {
    const updatedMeal = {
      ...meal,
      favorite: meal.favorite === 1 ? 0 : 1,
    };
    const refresh = updateMealById(meal.id, updatedMeal);
    setMeals(refresh);
  };

  // JSX for rendering a single meal
  return (
    <TouchableOpacity
      style={styles.mealContainer}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <ImageBackground
        source={{ uri: meal.image_uri }}
        style={styles.mealImage}
        imageStyle={styles.imageStyle}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 10,
            backgroundColor:
              scheme === "dark"
                ? "rgba(0, 0, 0, 0.5)"
                : "rgba(255, 255, 255, 0.5)",
          }}
        />
        <View style={styles.iconContainer}>
          <TouchableOpacity onPress={() => removeMeal(meal)}>
            <Ionicons
              name="close-circle"
              size={30}
              color={scheme === "dark" ? "white" : "black"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              handlePrefillMeal({
                name: meal.name,
                carbs: meal.carbs,
                fats: meal.fats,
                proteins: meal.proteins,
                image_uri: meal.image_uri,
              });
            }}
          >
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
            {meal.name}
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
});

export default MealItem;
