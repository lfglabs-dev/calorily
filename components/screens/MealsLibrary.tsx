import React, { useState } from "react";
import {
  StyleSheet,
  useColorScheme,
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import FullLibrary from "../library/FullLibrary";
import SegmentedControlTab from "react-native-segmented-control-tab";
import { useNavigation } from "@react-navigation/native";
import NewMeal from "../library/NewMeal";

const Summary = () => {
  const scheme = useColorScheme();
  const navigation = useNavigation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [popupComponent, setPopupComponent] = useState(null);
  const dynamicStyles = StyleSheet.create({
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
    backButton: {
      color: "#007AFF",
      fontSize: 18,
      position: "absolute",
      paddingTop: 0.5,
      left: 10,
      height: "100%", // Ensuring full height for vertical centering
      justifyContent: "center", // Center content vertically
      alignItems: "center", // Center content horizontally
    },
    headerTitle: {
      fontSize: 22,
      fontWeight: "bold",
      color: scheme === "dark" ? "#FFF" : "#000",
    },
  });

  const [prefilledMeal, setPrefilledMeal] = useState<
    MealTemplate | undefined
  >();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handlePrefillMeal = (meal: MealTemplate) => {
    setSelectedIndex(2);
    setPrefilledMeal(meal);
  };

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.header}>
        <TouchableOpacity
          onPress={handleBackPress}
          style={dynamicStyles.backButton}
        >
          <Text style={dynamicStyles.backButton}>&lt; Summary</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.headerTitle}>Library</Text>
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
        <FullLibrary handlePrefillMeal={handlePrefillMeal} />
      ) : null}
      {selectedIndex === 2 ? (
        <NewMeal
          prefilledMeal={prefilledMeal}
          setPopupComponent={setPopupComponent}
        />
      ) : null}

      {popupComponent}
    </SafeAreaView>
  );
};

export default Summary;
