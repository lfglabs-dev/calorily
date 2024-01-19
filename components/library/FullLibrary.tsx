import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMealsDatabase } from "../../shared/MealsStorageContext";

const FullLibrary = ({
  handlePrefillMeal,
}: {
  handlePrefillMeal: (meal: MealTemplate | undefined) => void;
}) => {
  const scheme = useColorScheme();
  const { fetchMealsInRangeAsync, deleteMealById } = useMealsDatabase();
  const [meals, setMeals] = useState<Array<MealEntry>>([]);

  useEffect(() => {
    fetchMealsInRangeAsync(0, 100).then(setMeals);
  }, []);

  const removeMeal = (meal: MealEntry) => {
    setMeals(meals.filter((other_meal) => meal.id !== other_meal.id));
    deleteMealById(meal.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid}>
        {meals.map((meal) => (
          <View key={meal.id} style={styles.mealContainer}>
            <TouchableOpacity onPress={() => console.log("favorite")}>
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
          </View>
        ))}
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
    top: 5,
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

export default FullLibrary;
