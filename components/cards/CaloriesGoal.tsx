import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { totalCalories } from "../../utils/food";
import useDailyCaloriesGoal from "../../hooks/useDailyCaloriesGoal";
import { useHealthData } from "../../shared/HealthDataContext";

const CaloriesGoalCard = () => {
  const dailyCaloriesGoal = useDailyCaloriesGoal();
  const [dailyCalories, setDailyCalories] = useState(0);
  const { dailyMeals } = useMealsDatabase();
  const { dailyActiveEnergyBurned } = useHealthData();

  useEffect(() => {
    setDailyCalories(totalCalories(dailyMeals));
  }, [dailyMeals]);

  const scheme = useColorScheme();
  const lightColor = "#22C55F";
  const color = "#17A34A";

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
      borderRadius: 8,
      padding: 15,
      marginBottom: 12,
    },
    headerSection: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    activeCaloriesContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    activeCalories: {
      color: scheme === "dark" ? "#AAA" : "gray",
      fontSize: 14,
    },
    icon: {
      marginRight: 10,
    },
    activeCaloriesIcon: {
      marginRight: 3,
    },
    title: {
      fontSize: 16,
      fontWeight: "bold",
      flex: 1,
      color: scheme === "dark" ? lightColor : color,
    },
    date: {
      color: scheme === "dark" ? "#AAA" : "gray",
      fontSize: 14,
    },
    bottomSection: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginTop: 10,
    },
    values: {
      fontSize: 24,
      fontWeight: "bold",
      color: scheme === "dark" ? "#FFF" : "#000",
    },
    kcal: {
      fontSize: 16,
      color: scheme === "dark" ? "#AAA" : "gray",
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.headerSection}>
        <Ionicons
          name="trending-up"
          size={24}
          color={scheme === "dark" ? lightColor : color}
          style={dynamicStyles.icon}
        />
        <Text style={dynamicStyles.title}>Calories Goal</Text>

        <View style={dynamicStyles.activeCaloriesContainer}>
          <Ionicons
            name="flame"
            size={16}
            color={scheme === "dark" ? "#AAA" : "gray"}
            style={dynamicStyles.activeCaloriesIcon}
          />
          <Text style={dynamicStyles.activeCalories}>
            {dailyActiveEnergyBurned.toFixed(0)} kCal
          </Text>
        </View>
      </View>
      <View style={dynamicStyles.bottomSection}>
        <Text style={dynamicStyles.values}>
          {dailyCalories.toFixed(0)} / {dailyCaloriesGoal.toFixed(0)}
          <Text style={dynamicStyles.kcal}> kCal</Text>
        </Text>
      </View>
    </View>
  );
};

export default CaloriesGoalCard;
