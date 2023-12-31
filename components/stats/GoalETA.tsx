import React from "react";
import { Text, View, StyleSheet, useColorScheme } from "react-native";
import { useHealthData } from "../../shared/HealthDataContext";
import { useApplicationSettings } from "../../shared/ApplicationSettingsContext";
import Ionicons from "@expo/vector-icons/Ionicons";

const GoalETA = () => {
  const scheme = useColorScheme();
  const { lastWeight, lastWeightDate } = useHealthData();
  const { settings } = useApplicationSettings();

  // Helper functions
  const calculateDaysElapsed = (startDate) => {
    const today = new Date().getTime();
    const start = new Date(startDate).getTime();
    return Math.round((today - start) / (1000 * 60 * 60 * 24));
  };

  function calculateWeightGain(calorieSurplus, weight) {
    const caloriesPerKg = 3500 / 0.45;
    const weightGainPerDay = calorieSurplus / caloriesPerKg;
    return Math.abs(weight / weightGainPerDay);
  }

  function calculateWeightLoss(calorieDeficit, weight) {
    const caloriesPerKg = 3500 / 0.45;
    const weightLossPerDay = calorieDeficit / caloriesPerKg;
    return Math.abs(weight / weightLossPerDay);
  }

  const lastWeightKg = lastWeight / 1000;
  const targetMinWeight = settings.metabolicData.targetMinimumWeight;
  const targetMaxWeight = settings.metabolicData.targetMaximumWeight;

  // Calculate ETAs
  const daysSinceLastMeasurement = calculateDaysElapsed(lastWeightDate);
  const daysToMinWeight = Math.max(
    0,
    calculateWeightLoss(
      settings.metabolicData.targetCaloricDeficit,
      targetMinWeight - lastWeightKg
    ) - daysSinceLastMeasurement
  );
  const daysToMaxWeight = Math.max(
    0,
    calculateWeightGain(
      settings.metabolicData.targetCaloricSurplus,
      lastWeightKg - targetMaxWeight
    ) - daysSinceLastMeasurement
  );

  // Styles
  const styles = StyleSheet.create({
    container: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
      borderRadius: 8,
      padding: 15,
      marginTop: -3,
      marginBottom: 12,
    },
    header: {
      marginTop: -10,
      flexDirection: "row",
      justifyContent: "flex-end",
      width: "100%",
    },
    title: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
      textTransform: "uppercase",
      paddingBottom: 15,
    },
    text: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
    },
    date: {
      color: scheme === "dark" ? "#AAA" : "gray",
      fontSize: 14,
    },
    goalText: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
    },
    goalContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    textContent: {
      flex: 1,
      paddingLeft: 10,
      justifyContent: "center",
    },
    etaText: {
      color: scheme === "dark" ? "#0F0" : "#008000",
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 5,
    },
    cheeringText: {
      color: scheme === "dark" ? "#0F0" : "#008000",
      fontSize: 14,
      fontWeight: "bold",
      marginTop: 5,
    },
  });

  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  let component;
  if (lastWeightKg < targetMinWeight) {
    component = (
      <View style={styles.goalContent}>
        <Ionicons
          name="trending-down"
          size={96}
          color={scheme === "dark" ? "#FFF" : "#000"}
        />
        <View style={styles.textContent}>
          <View style={styles.header}>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <Text style={styles.text}>Weight below target</Text>
          <Text style={styles.goalText}>
            {lastWeightKg.toFixed(2)} kg {"<"} {targetMinWeight} kg
          </Text>
          <Text style={styles.etaText}>
            ETA: {Math.round(daysToMinWeight)} days
          </Text>
        </View>
      </View>
    );
  } else if (lastWeightKg > targetMaxWeight) {
    component = (
      <View style={styles.goalContent}>
        <Ionicons
          name="trending-up"
          size={96}
          color={scheme === "dark" ? "#FFF" : "#000"}
        />
        <View style={styles.textContent}>
          <View style={styles.header}>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <Text style={styles.text}>Weight above target</Text>
          <Text style={styles.goalText}>
            {lastWeightKg.toFixed(2)} kg {">"} {targetMaxWeight} kg
          </Text>
          <Text style={styles.etaText}>
            ETA: {Math.round(daysToMaxWeight)} days
          </Text>
        </View>
      </View>
    );
  } else {
    component = (
      <View style={styles.goalContent}>
        <Ionicons
          name="trophy"
          size={96}
          color={scheme === "dark" ? "#FFF" : "#000"}
        />
        <View style={styles.textContent}>
          <View style={styles.header}>
            <Text style={styles.date}>{formattedDate}</Text>
          </View>
          <Text style={styles.text}>Goal reached</Text>
          <Text style={styles.goalText}>
            {targetMinWeight} ≤ {lastWeightKg.toFixed(2)} ≤ {targetMaxWeight} kg
          </Text>
          <Text style={styles.cheeringText}>Congratulations!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 20 }}>
      <Text style={styles.title}>Goal ETA</Text>
      <View style={styles.container}>{component}</View>
    </View>
  );
};

export default GoalETA;
