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
import { styles } from "./styles";
import { CustomBackground } from "./CustomBackground";
import { CustomHandle } from "./CustomHandle";
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

const SNAP_POINTS = ["90%"];

const AddMeal = ({ image, resized, addMealFunction, close }) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState<string>(null);
  const [type, setType] = useState<string>(null);
  const [ingredients, setIngredients] = useState<ExtendedIngredient[]>([]);
  const resizedImage = resized ? resized : useResizedImage(image);
  const [lastResponse, setLastResponse] = useState(null);
  const [dialogVisible, setDialogVisible] = useState(false);

  const loadResponse = (data: ApiResponse) => {
    setName(data.name);
    setType(data.type);
    setIngredients(
      data.ingredients.map((item) => ({
        ...item,
        calories: calculateCalories(item),
        selected: true,
      }))
    );
  };

  const handleFindFix = (remark) => {
    setIsLoading(true);
    (async () => {
      const response = await fetch(
        "https://api.dietgpt.gouv.media/improve_food_data",
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
      const responseJson = await response.json();

      loadResponse(responseJson);
      setLastResponse(responseJson);
      setIsLoading(false);
    })();
    setDialogVisible(false);
  };

  const fetchIngredients = async (b64Image: string) => {
    setIsLoading(true);
    try {
      // const response = await fetch("https://api.dietgpt.gouv.media/food_data", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ b64_img: b64Image }),
      // });
      // const responseJson = await response.json();
      //Simulate network request delay
      function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
      }
      await delay(3000);
      setLastResponse(exampleResponse);
      loadResponse(exampleResponse);
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

  useEffect(() => {
    if (resizedImage?.base64) {
      fetchIngredients(resizedImage.base64);
    }
  }, [resizedImage]);

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
              source={{ uri: image.uri }}
              style={styles(colorScheme).image}
              blurRadius={100}
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
              style={styles(colorScheme).secondaryButton}
              onPress={() => {
                setDialogVisible(true);
              }}
            >
              <Text style={styles(colorScheme).secondaryButtonText}>
                Fix a bug
              </Text>
            </TouchableOpacity>
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
                  favorite: false,
                };
                addMealFunction(meal, resizedImage.uri);
                bottomSheetRef.current.close();
              }}
            >
              <Text style={styles(colorScheme).addButtonText}>Add Meal</Text>
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
