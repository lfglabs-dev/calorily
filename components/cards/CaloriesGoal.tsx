import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { getDailyMacros } from "../../utils/food";
import useDailyCaloriesGoal from "../../hooks/useDailyCaloriesGoal";
import { useHealthData } from "../../shared/HealthDataContext";
import { MacroIcon } from "../common/MacroIcon";

const CaloriesGoalCard = () => {
  const dailyCaloriesGoal = useDailyCaloriesGoal();
  const [dailyMacros, setDailyMacros] = useState({
    calories: 0,
    proteins: 0,
    fats: 0,
    carbs: 0,
  });
  const { dailyMeals } = useMealsDatabase();
  const { dailyActiveEnergyBurned } = useHealthData();

  useEffect(() => {
    setDailyMacros(getDailyMacros(dailyMeals));
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
    macroContainer: {
      flexDirection: "row",
      marginTop: 10,
      gap: 15,
    },
    macroItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    macroText: {
      color: scheme === "dark" ? "#AAA" : "gray",
      fontSize: 14,
    },
    macroIcon: {
      marginRight: 4,
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
          {dailyMacros.calories.toFixed(0)} / {dailyCaloriesGoal.toFixed(0)}
          <Text style={dynamicStyles.kcal}> kCal</Text>
        </Text>
      </View>

      <View style={dynamicStyles.macroContainer}>
        <View style={dynamicStyles.macroItem}>
          <MacroIcon
            type="proteins"
            size={16}
            color={scheme === "dark" ? "#AAA" : "gray"}
            style={dynamicStyles.macroIcon}
          />
          <Text style={dynamicStyles.macroText}>
            {dailyMacros.proteins.toFixed(0)}g
          </Text>
        </View>

        <View style={dynamicStyles.macroItem}>
          <MacroIcon
            type="fats"
            size={16}
            color={scheme === "dark" ? "#AAA" : "gray"}
            style={dynamicStyles.macroIcon}
          />
          <Text style={dynamicStyles.macroText}>
            {dailyMacros.fats.toFixed(0)}g
          </Text>
        </View>

        <View style={dynamicStyles.macroItem}>
          <MacroIcon
            type="carbs"
            size={16}
            color={scheme === "dark" ? "#AAA" : "gray"}
            style={dynamicStyles.macroIcon}
          />
          <Text style={dynamicStyles.macroText}>
            {dailyMacros.carbs.toFixed(0)}g
          </Text>
        </View>
      </View>
    </View>
  );
};

export default CaloriesGoalCard;
