import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import WeeklyChart from "../stats/WeeklyChart";
import GoalETA from "../stats/GoalETA";

const Progress = () => {
  const scheme = useColorScheme();

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
      padding: 25,
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 32,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 30,
      marginTop: 40,
    },
    addButton: {
      marginTop: 10,
      alignItems: "center",
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
    },
    addButtonText: {
      color: "#FFF",
      fontSize: 18,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Progress</Text>
      <WeeklyChart />
      <GoalETA />
    </View>
  );
};

export default Progress;
