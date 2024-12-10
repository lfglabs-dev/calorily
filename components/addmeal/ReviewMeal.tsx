import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import { CustomBackground } from "./BottomSheet/CustomBackground";
import { CustomHandle } from "./BottomSheet/CustomHandle";
import { IngredientItem } from "./IngredientItem";
import { calculateCalories } from "../../utils/food";
import LongTextInputDialog from "./FixBugDialog";
import useResizedImage from "../../hooks/useResizedImage";
import LoadingMeal from "./Loading";
import Bug from "./Bug";
import { useWebSocket } from "../../shared/WebSocketContext";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "../../shared/AuthContext";
import { MealStatus } from "../../shared/MealsStorageContext";
import { Ingredient } from "../../types";

interface ExtendedIngredient extends Ingredient {
  calories: number;
  selected: boolean;
}

const SNAP_POINTS = ["90%"];

const ReviewMeal = ({ imageURI, mealData, onUpdate, onClose }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [name, setName] = useState<string>(mealData?.name || "");
  const [ingredients, setIngredients] = useState<ExtendedIngredient[]>(
    mealData?.ingredients || []
  );
  const [lastResponse, setLastResponse] =
    useState<ExtendedIngredient[]>(mealData);
  const [dialogVisible, setDialogVisible] = useState(false);
  const { jwt } = useAuth();

  const handleFindFix = async (remark) => {
    try {
      const response = await fetch(
        "https://api.calorily.com/improve_food_data",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            remark,
            prev_response: lastResponse,
            b64_img: imageURI,
          }),
        }
      );
      const data = await response.json();
      setLastResponse(data);
      if (!data || data.error) {
        throw new Error(data.error || "Unknown error");
      }
      setName(data.name);
      setIngredients(
        data.ingredients.map((item) => ({
          ...item,
          calories: calculateCalories(item),
          selected: true,
        }))
      );
    } catch (error) {
      console.error("Fix error:", error);
      alert(error.message);
    }
    setDialogVisible(false);
  };

  const handleUpdateMeal = () => {
    onUpdate({
      name,
      ingredients: ingredients.filter((i) => i.selected),
    });
    bottomSheetRef.current.close();
  };

  const toggleIngredientSelection = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].selected = !newIngredients[index].selected;
    setIngredients(newIngredients);
  };

  const openComment = () => {
    setDialogVisible(true);
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundComponent={CustomBackground}
      handleComponent={CustomHandle}
      onClose={onClose}
    >
      <View style={styles(colorScheme).contentContainer}>
        <Text style={styles(colorScheme).resultTitle}>{name}</Text>
        <BottomSheetFlatList
          data={ingredients}
          renderItem={({ item, index }) => (
            <IngredientItem
              item={item}
              index={index}
              colorScheme={colorScheme}
              toggleSelection={toggleIngredientSelection}
            />
          )}
          keyExtractor={(_item, index) => index.toString()}
        />
        <TouchableOpacity
          style={styles(colorScheme).secondaryButton}
          onPress={openComment}
        >
          <Text style={styles(colorScheme).secondaryButtonText}>Fix a bug</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles(colorScheme).mainButton}
          onPress={handleUpdateMeal}
        >
          <Text style={styles(colorScheme).mainButtonText}>Update Meal</Text>
        </TouchableOpacity>
      </View>
      <LongTextInputDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSubmit={handleFindFix}
      />
    </BottomSheet>
  );
};

export default ReviewMeal;
