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

const FullLibrary = () => {
  const scheme = useColorScheme();
  const { fetchMealsInRangeAsync } = useMealsDatabase();
  const [meals, setMeals] = useState<Array<MealEntry>>([]);

  useEffect(() => {
    fetchMealsInRangeAsync(0, 100).then(setMeals);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.grid}>
        {meals.map((meal, index) => (
          <View key={index} style={styles.mealContainer}>
            <ImageBackground
              source={{ uri: meal.image_uri }}
              style={styles.mealImage}
              imageStyle={styles.imageStyle}
            >
              <View style={styles.iconContainer}>
                <TouchableOpacity onPress={() => console.log("close clicked")}>
                  <Ionicons name="close-circle" size={30} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => console.log("star clicked")}
                  style={styles.centerIcon}
                >
                  <Ionicons
                    name="star"
                    size={30}
                    color="white"
                    style={{ opacity: 0.9 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => console.log("add clicked")}>
                  <Ionicons name="add-circle" size={30} color="white" />
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
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
