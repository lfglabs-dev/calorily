import React from "react";
import { View, Text, StyleSheet, useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const CaloriesInCard = () => {
  const scheme = useColorScheme();
  const lightColor = "#22C55F";
  const color = "#17A34A";
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
          1750 / 2500<Text style={dynamicStyles.kcal}> kCal</Text>
        </Text>
      </View>
    </View>
  );
};

export default CaloriesInCard;
