import React from "react";
import { Text, View, StyleSheet, useColorScheme } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMealsDatabase } from "../../shared/MealsStorageContext";

const DailyProteins = () => {
  const scheme = useColorScheme();

  const { dailyMeals } = useMealsDatabase();
  const totalProteins = dailyMeals.reduce(
    (sum, meal) => sum + meal.proteins,
    0
  );

  // Styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
      borderRadius: 8,
      padding: 15,
      marginBottom: 12,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      width: "100%",
      marginTop: 0,
    },
    title: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
      textTransform: "uppercase",
      paddingBottom: 10,
    },
    proteinIntakeTitle: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
      marginTop: -20,
    },
    proteinIntakeValue: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
    },
    date: {
      right: -148,
      color: scheme === "dark" ? "#AAA" : "gray",
      fontSize: 14,
    },
    goalContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    textContent: {
      height: 100,
      flex: 1,
      paddingLeft: 10,
      justifyContent: "center",
    },
    proteinIntakeContainer: {
      flex: 1,
      justifyContent: "center",
    },
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  // Calorie Display Component
  const component = (
    <View style={styles.goalContent}>
      <Ionicons
        name="flame"
        size={96}
        color={scheme === "dark" ? "#FFF" : "#000"}
      />
      <View style={styles.textContent}>
        <View style={styles.header}>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
        <View style={styles.proteinIntakeContainer}>
          <Text style={styles.proteinIntakeTitle}>
            Daily Proteins: {totalProteins}g
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>Today's Proteins</Text>
      <View style={styles.container}>{component}</View>
    </View>
  );
};

export default DailyProteins;
