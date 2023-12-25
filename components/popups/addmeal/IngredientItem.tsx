import React from "react";
import { View, Text, Switch } from "react-native";
import { styles } from "./styles";

type IngredientItemProps = {
  item: ExtendedIngredient;
  index: number;
  colorScheme: "light" | "dark";
  toggleSelection: (index: number) => void;
};

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
      <Text style={styles(colorScheme).caloriesText}>
        ({item.calories}kCal)
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
