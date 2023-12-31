import React from "react";
import { View, Text, Switch } from "react-native";
import { styles } from "./styles";

type IngredientItemProps = {
  item: ExtendedIngredient;
  index: number;
  colorScheme: "light" | "dark";
  toggleSelection: (index: number) => void;
};

function getCaloriesColor(scheme, calories) {
  const colorsDark = {
    low: "#00b894",
    medium: "#fdcb6e",
    high: "#fab1a0",
    veryHigh: "#d63031",
  };

  const colorsLight = {
    low: "#55efc4",
    medium: "#ffeaa7",
    high: "#e17055",
    veryHigh: "#ff7675",
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
  index,
  colorScheme,
  toggleSelection,
}) => (
  <View style={styles(colorScheme).ingredientItem}>
    <View style={styles(colorScheme).ingredientNameContainer}>
      <Text
        style={styles(colorScheme).ingredientText}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {item.name}
      </Text>
      <Text
        style={{
          color: getCaloriesColor(colorScheme, item.calories),
          fontWeight: "bold",
          fontSize: 14,
        }}
      >
        {item.calories.toFixed(1)} kCal
      </Text>
    </View>
    <Switch
      style={styles(colorScheme).switchStyle}
      trackColor={{ true: colorScheme === "dark" ? "#1A73E8" : "#007AFF" }}
      onValueChange={() => toggleSelection(index)}
      value={item.selected}
    />
  </View>
);
