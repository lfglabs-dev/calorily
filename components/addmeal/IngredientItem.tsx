import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import { Ingredient } from "../../types";

interface ExtendedIngredient extends Ingredient {
  calories: number;
  selected: boolean;
}

type IngredientItemProps = {
  item: ExtendedIngredient;
  index: number;
  colorScheme: "light" | "dark";
  toggleSelection: (index: number) => void;
};

function getCaloriesColor(scheme, calories) {
  const colorsDark = {
    low: "#55efc4",
    medium: "#ffeaa7",
    high: "#e17055",
    veryHigh: "#ff7675",
  };

  const colorsLight = {
    low: "#00b894",
    medium: "#fdcb6e",
    high: "#fab1a0",
    veryHigh: "#d63031",
  };

  const colors = scheme === "dark" ? colorsDark : colorsLight;
  if (calories < 50) {
    return colors.low;
  } else if (calories < 150) {
    return colors.medium;
  } else if (calories < 300) {
    return colors.high;
  } else {
    return colors.veryHigh;
  }
}

export const IngredientItem: React.FC<IngredientItemProps> = ({
  item,
  colorScheme,
}) => {
  const calories = item.calories || 0; // Provide default value

  return (
    <View style={styles(colorScheme).ingredientItem}>
      <Text
        style={styles(colorScheme).ingredientText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
      <Text
        style={{
          color: getCaloriesColor(colorScheme, calories),
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        {calories.toFixed(1)} kCal
      </Text>
    </View>
  );
};
