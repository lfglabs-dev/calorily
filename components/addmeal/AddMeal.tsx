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
      const response = await fetch("https://api.calorily.com/food_data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ b64_img: b64Image }),
      });
      const responseJson = await response.json();
      console.log("responsejson:", responseJson);
      //Simulate network request delay
      // function delay(ms) {
      //   return new Promise((resolve) => setTimeout(resolve, ms));
      // }
      // await delay(3000);
      loadResponse(responseJson as any);
    } catch (error) {
      console.error(error);
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
        {isLoading === "loading" ? (
          <LoadingMeal imageURI={imageURI} />
        ) : isLoading === "bug" ? (
          <Bug openComment={openComment} response={lastResponse?.response} />
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
              onPress={() => {
                const meal = {
                  name,
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
