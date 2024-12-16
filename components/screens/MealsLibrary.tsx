import React from "react";
import { View, StyleSheet } from "react-native";
import { useAddMeal } from "../../hooks/useAddMeal";
import NewMeal from "../library/NewMeal";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../navigation/types";

const MealsLibrary = () => {
  const { pickFromLibrary } = useAddMeal();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  const handleNewMeal = async () => {
    const result = await pickFromLibrary();
    if (result) {
      // Navigate to Summary tab after successful upload
      navigation.navigate("Summary");
    }
  };

  return (
    <View style={styles.container}>
      <NewMeal onPress={handleNewMeal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
});

export default MealsLibrary;
