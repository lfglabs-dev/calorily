import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import CaloriesInCard from "../cards/CaloriesIn";
import CaloriesOutCard from "../cards/CaloriesOut";
import PastMeals from "../cards/PastMeals";

const Summary = () => {
  const scheme = useColorScheme();
  const [showAddMeal, setShowAddMeal] = useState(false);
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
      padding: 20,
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 32,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 30,
      marginTop: 50,
    },
    addButton: {
      alignItems: "center",
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      position: "absolute",
      bottom: 20,
      left: 20,
      right: 20,
    },
    addButtonText: {
      color: "#FFF",
      fontSize: 18,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Summary</Text>
      <CaloriesInCard />
      <CaloriesOutCard />
      <PastMeals />
      {showAddMeal ? null : null}
      <TouchableOpacity
        style={dynamicStyles.addButton}
        onPress={() => {
          setShowAddMeal(true);
        }}
      >
        <Text style={dynamicStyles.addButtonText}>Add Meal</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Summary;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "grey",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
  },
});
