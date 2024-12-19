import React, { useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Text,
  View,
  StatusBar,
} from "react-native";
import FullLibrary from "../library/FullLibrary";
import SegmentedControlTab from "react-native-segmented-control-tab";
import NewMeal from "../library/NewMeal";
import FavoriteLibrary from "../library/FavoriteLibrary";
import { MealTemplate } from "../../types";
import { useAddMeal } from "../../hooks/useAddMeal";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { MainTabParamList } from "../../navigation/types";

const MealsLibrary = () => {
  const scheme = useColorScheme();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { pickFromLibrary } = useAddMeal();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [prefilledMeal, setPrefilledMeal] = useState<
    MealTemplate | undefined
  >();

  const handlePrefillMeal = (meal: MealTemplate) => {
    setSelectedIndex(2);
    setPrefilledMeal(meal);
  };

  const handlePhotoSelect = async () => {
    const result = await pickFromLibrary();
    if (result) {
      navigation.navigate("Summary");
    }
  };

  return (
    <SafeAreaView style={dynamicStyles(scheme).safeArea}>
      <View style={dynamicStyles(scheme).header}>
        <Text style={dynamicStyles(scheme).headerTitle}>Library</Text>
      </View>

      <SegmentedControlTab
        values={["Full Library", "Favorites", "New Meal"]}
        selectedIndex={selectedIndex}
        onTabPress={setSelectedIndex}
        tabsContainerStyle={{
          margin: 20,
        }}
        tabStyle={{
          backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
          borderColor: "#00000000",
        }}
        activeTabStyle={{
          backgroundColor: scheme === "dark" ? "#137ced" : "#137ced",
        }}
        tabTextStyle={{
          color: scheme === "dark" ? "#DDD" : "#000",
        }}
        activeTabTextStyle={{
          color: "#FFF",
        }}
      />

      {selectedIndex === 0 ? (
        <FullLibrary handlePrefillMeal={handlePrefillMeal} />
      ) : null}
      {selectedIndex === 1 ? (
        <FavoriteLibrary handlePrefillMeal={handlePrefillMeal} />
      ) : null}
      {selectedIndex === 2 ? <NewMeal prefilledMeal={prefilledMeal} /> : null}
    </SafeAreaView>
  );
};

const dynamicStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
      paddingTop: StatusBar.currentHeight || 0,
    },
    header: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: scheme === "dark" ? "#FFF" : "#000",
    },
  });

export default MealsLibrary;
