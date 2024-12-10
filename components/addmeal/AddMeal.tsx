import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, useColorScheme } from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { styles } from "./styles";
import { CustomBackground } from "./BottomSheet/CustomBackground";
import { CustomHandle } from "./BottomSheet/CustomHandle";
import { IngredientItem } from "./IngredientItem";
import {
  calculateCalories,
  totalCarbs,
  totalFats,
  totalProteins,
} from "../../utils/food";
import LongTextInputDialog from "./FixBugDialog";
import { exampleResponse } from "./mockup";
import useResizedImage from "../../hooks/useResizedImage";
import LoadingMeal from "./Loading";
import Bug from "./Bug";
import { useWebSocket } from "../../shared/WebSocketContext";
import { v4 as uuidv4 } from "uuid";
import { Ingredient, ExtendedIngredient, ApiResponse } from "../../types";
import { useAuth } from "../../shared/AuthContext";
import { MealStatus } from "../../shared/MealsStorageContext";

const SNAP_POINTS = ["90%"];

const AddMeal = ({ imageURI, resized, addMealFunction, close }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState<"loading" | "bug" | "loaded">(
    "loading"
  );
  const [name, setName] = useState<string>(null);
  const [ingredients, setIngredients] = useState<ExtendedIngredient[]>([]);
  const resizedImage = resized ? resized : useResizedImage(imageURI);
  const [lastResponse, setLastResponse] = useState<ApiResponse>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [mealId] = useState(() => uuidv4());
  const { lastMessage } = useWebSocket();
  const { jwt } = useAuth();

  const openComment = () => {
    setDialogVisible(true);
  };

  const loadResponse = (data: ApiResponse) => {
    setLastResponse(data);
    if (!data || data.error) {
      setIsLoading("bug");
    } else {
      setName(data.name);
      setIngredients(
        data.ingredients.map((item) => ({
          ...item,
          calories: calculateCalories(item),
          selected: true,
        }))
      );
      setIsLoading("loaded");
    }
  };

  const handleFindFix = (remark) => {
    setIsLoading("loading");
    (async () => {
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
            b64_img: resizedImage.base64,
          }),
        }
      );
      loadResponse(await response.json());
    })();
    setDialogVisible(false);
  };

  const fetchIngredients = async (b64Image: string) => {
    setIsLoading("loading");
    try {
      const cleanBase64 = b64Image.replace(/^data:image\/\w+;base64,/, "");

      const response = await fetch("https://api.calorily.com/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          meal_id: mealId,
          b64_img: cleanBase64,
        }),
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(
          "Network connection failed. Please check your internet connection."
        );
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to upload image");
      }

      // Response is successful, wait for WebSocket
    } catch (error) {
      console.error("Upload error:", error);
      setIsLoading("bug");
      setLastResponse({
        error: error.message,
        response:
          "Failed to upload image. Please check your internet connection and try again.",
        name: "",
        ingredients: [],
      });
    }
  };

  const toggleIngredientSelection = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].selected = !newIngredients[index].selected;
    setIngredients(newIngredients);
  };

  useEffect(() => {
    if (resizedImage?.base64) {
      fetchIngredients(resizedImage.base64);
    }
  }, [resizedImage]);

  useEffect(() => {
    if (lastMessage && lastMessage.meal_id === mealId) {
      loadResponse({
        name: lastMessage.data.meal_name,
        ingredients: lastMessage.data.ingredients,
      });
    }
  }, [lastMessage]);

  const handleAddMeal = () => {
    const meal = {
      name: name || "Analyzing...",
      carbs: 0,
      proteins: 0,
      fats: 0,
      timestamp: Math.floor(Date.now() / 1000),
      favorite: false,
      status: "analyzing" as MealStatus,
    };

    addMealFunction(meal, resizedImage.uri, mealId, false);
    bottomSheetRef.current.close();
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundComponent={CustomBackground}
      handleComponent={CustomHandle}
      onClose={close}
    >
      <View style={styles(colorScheme).contentContainer}>
        {isLoading === "loading" ? (
          <LoadingMeal imageURI={imageURI} />
        ) : isLoading === "bug" ? (
          <Bug
            openComment={openComment}
            onClose={close}
            response={lastResponse?.response}
          />
        ) : (
          <>
            {/* Result showcase */}
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
            {/* Result fix */}
            <TouchableOpacity
              style={styles(colorScheme).secondaryButton}
              onPress={openComment}
            >
              <Text style={styles(colorScheme).secondaryButtonText}>
                Fix a bug
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles(colorScheme).mainButton}
              onPress={handleAddMeal}
            >
              <Text style={styles(colorScheme).mainButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
      <LongTextInputDialog
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
        onSubmit={handleFindFix}
      />
    </BottomSheet>
  );
};

export default AddMeal;
