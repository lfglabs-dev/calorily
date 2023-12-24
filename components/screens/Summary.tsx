import React, { useCallback, useMemo, useRef } from "react";
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
import BottomSheet from '@gorhom/bottom-sheet';

const Summary = () => {
  const scheme = useColorScheme();
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

  const handleAddMeal = () => {
    console.log("Add Meal");
  };

  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['25%', '50%'], []);

  // callbacks
  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Summary</Text>
      <CaloriesInCard />
      <CaloriesOutCard />
      <PastMeals />
      <TouchableOpacity style={dynamicStyles.addButton} onPress={handleAddMeal}>
        <Text style={dynamicStyles.addButtonText}>Add Meal</Text>
      </TouchableOpacity>
      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          <Text>Awesome 🎉</Text>
        </View>
      </BottomSheet>
    </View>
  );
};

export default Summary;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: 'grey',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
});