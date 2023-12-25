import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import * as ImageManipulator from "expo-image-manipulator";
import { styles } from "./styles";
import { exampleResponse } from "./mockup";
import { ImagePickerAsset } from "expo-image-picker";
import { CustomBackground } from "./CustomBackground";
import { CustomHandle } from "./CustomHandle";
import { IngredientItem } from "./IngredientItem";
import { useMealsDatabase } from "../../../shared/MealsDatabaseContext";
import {
  calculateCalories,
  totalCarbs,
  totalFats,
  totalProteins,
} from "../../../utils/food";

const SNAP_POINTS = ["90%"];

type ExtendedIngredient = Ingredient & {
  calories: number;
  selected: boolean;
};

const AddMeal = ({ image, close }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState<string>(null);
  const [type, setType] = useState<string>(null);
  const [ingredients, setIngredients] = useState<ExtendedIngredient[]>([]);
  const [b64Image, setB64Image] = useState<string | null>(null);
  const { insertMeal, fetchLastMeals } = useMealsDatabase();

  const fetchIngredients = async (b64Image: string) => {
    setIsLoading(true);
    try {
      //     const response = await fetch("https://api.dietgpt.gouv.media/food_data", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ b64_img: b64Image }),
      // });
      // const responseText = await response.text();
      // JSON.parse(responseText)
      // Simulate network request delay

      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      await delay(3000);
      const data: ApiResponse = exampleResponse;
      setName(data.name);
      setType(data.type);
      setIngredients(
        data.ingredients.map((item) => ({
          ...item,
          calories: calculateCalories(item),
          selected: true,
        }))
      );
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleIngredientSelection = (index: number) => {
    const newIngredients = [...ingredients];
    newIngredients[index].selected = !newIngredients[index].selected;
    setIngredients(newIngredients);
  };

  const resizeAndConvertToBase64 = async (asset: ImagePickerAsset) => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1024 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      return resizedImage.base64;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (image?.assets) {
      const selectedImage = image.assets[0];
      resizeAndConvertToBase64(selectedImage).then(setB64Image);
    }
  }, [image]);

  useEffect(() => {
    if (b64Image) {
      fetchIngredients(b64Image);
    }
  }, [b64Image]);

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
        {isLoading ? (
          <View style={styles(colorScheme).container}>
            <Image
              source={{ uri: image.assets?.[0].uri }}
              style={styles(colorScheme).image}
              blurRadius={5}
            />
            <Text style={styles(colorScheme).title}>Analyzing Image</Text>
            <ActivityIndicator
              size="large"
              color={colorScheme === "dark" ? "#fff" : "#000"}
              style={styles(colorScheme).activityIndicator}
            />
          </View>
        ) : (
          <>
            <Text style={styles(colorScheme).resultTitle}>{name}</Text>
            <View style={styles(colorScheme).mealTypeTag}>
              <Text style={styles(colorScheme).mealTypeText}>{type}</Text>
            </View>
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
              keyExtractor={(item, index) => index.toString()}
            />
            <TouchableOpacity
              style={styles(colorScheme).addButton}
              onPress={() => {
                const meal = {
                  name,
                  type,
                  carbs: totalCarbs(ingredients),
                  proteins: totalProteins(ingredients),
                  fats: totalFats(ingredients),
                  timestamp: Math.floor(Date.now() / 1000),
                };
                console.log("Adding meal:", meal);
                insertMeal(meal);
                bottomSheetRef.current.close();
              }}
            >
              <Text style={styles(colorScheme).addButtonText}>Add Meal</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </BottomSheet>
  );
};

export default AddMeal;
