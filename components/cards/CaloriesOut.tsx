import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CaloriesOutCard = () => {
  const scheme = useColorScheme();
  const lightColor = "#EA580B";
  const color = "#F97315";
  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
      borderRadius: 8,
      padding: 15,
      marginBottom: 10,
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
          name="bicycle"
          size={24}
          color={scheme === "dark" ? lightColor : color}
          style={dynamicStyles.icon}
        />
        <Text style={dynamicStyles.title}>Calories Out</Text>
        <Text style={dynamicStyles.date}>21 Dec</Text>
      </View>
      <View style={dynamicStyles.bottomSection}>
        <Text style={dynamicStyles.values}>
          450 / 500<Text style={dynamicStyles.kcal}> kCal</Text>
        </Text>
      </View>
    </View>
  );
};

export default CaloriesOutCard;
