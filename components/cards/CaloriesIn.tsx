import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useApplicationSettings } from "../../shared/ApplicationSettingsContext";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { totalCalories } from "../../utils/food";

const CaloriesInCard = () => {
  const { settings } = useApplicationSettings();
  const [dailyCaloriesGoal, setDailyCaloriesGoal] = useState(0);
  const [dailyCalories, setDailyCalories] = useState(0);

  const { dailyMeals } = useMealsDatabase();
  useEffect(() => {
    setDailyCalories(totalCalories(dailyMeals));
  }, [dailyMeals]);

  const scheme = useColorScheme();
  const lightColor = "#22C55F";
  const color = "#17A34A";

  useEffect(() => {
    if (settings) {
      setDailyCaloriesGoal(settings.dailyGoals.caloriesIn);
    }
  }, [settings]);

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
    icon: {
      marginRight: 10,
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
        <FontAwesome
          name="cutlery"
          size={24}
          color={scheme === "dark" ? lightColor : color}
          style={dynamicStyles.icon}
        />
        <Text style={dynamicStyles.title}>Calories In</Text>
        <Text style={dynamicStyles.date}>21 Dec</Text>
      </View>
      <View style={dynamicStyles.bottomSection}>
        <Text style={dynamicStyles.values}>
          {dailyCalories.toFixed(0)} / {dailyCaloriesGoal}
          <Text style={dynamicStyles.kcal}> kCal</Text>
        </Text>
      </View>
    </View>
  );
};

export default CaloriesInCard;
