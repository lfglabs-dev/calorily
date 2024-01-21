import React, { Dispatch, SetStateAction, useRef } from "react";
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
  const opacity = meal.favorite ? 1 : 0;

  const onPressOut = () => {
    // Animated.timing(opacity, {
    //   toValue: meal.favorite ? 0 : 1,
    //   duration: 500,
    //   useNativeDriver: true,
    // }).start();
  };

  // add to favorite
  const onLongPress = (meal: MealEntry) => {
    if (meal.favorite) {
      console.log("removed from favorite");
    } else {
      console.log("added to favorite");
    }

    // Animated.timing(opacity, {
    //   toValue: meal.favorite ? 1 : 0,
    //   duration: 500,
    //   useNativeDriver: true,
    // }).start(() => {
    //   setTimeout(onPressOut, 500);
    // });
    // we change its favorite
    const refresh: any = updateMealById(meal.id, {
      ...meal,
      favorite: meal.favorite === 1 ? 0 : 1,
    });

    setMeals(refresh);
  };

  // JSX for rendering a single meal
  return (
    <View key={meal.id} style={styles.mealContainer}>
      <TouchableOpacity
        onLongPress={() => onLongPress(meal)}
        onPressOut={onPressOut}
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
                console.log("add clicked", meal);
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
      </TouchableOpacity>
      <Animated.View style={[styles.centerIcon, { opacity }]}>
        <Ionicons
          name="heart"
          size={48}
          color={scheme === "dark" ? "white" : "black"}
        />
      </Animated.View>
    </View>
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
