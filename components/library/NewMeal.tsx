import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useColorScheme } from "react-native";
import { calculateCalories } from "../../utils/food";
import useResizedImage from "../../hooks/useResizedImage";
import { useNavigation } from "@react-navigation/native";
import useAddMeal from "../../hooks/useAddMeal";
import UploadingMeal from "../addmeal/UploadingMeal";
import { MealTemplate } from "../../types";

const NewMeal = ({
  prefilledMeal,
  setPopupComponent,
}: {
  prefilledMeal: MealTemplate | undefined;
  setPopupComponent: (popup: React.JSX.Element) => void;
}) => {
  const scheme = useColorScheme();
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const [mealName, setMealName] = useState("");
  const [carbs, setCarbs] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [selectedImageURI, setSelectedImageURI] = useState(null);
  const resizedImage = useResizedImage(selectedImageURI);

  const addMeal = useAddMeal();
  const navigation = useNavigation();
  const isReady = Boolean(mealName) && Boolean(selectedImageURI);

  useEffect(() => {
    if (!prefilledMeal) {
      return;
    }
    setMealName(prefilledMeal.name);
    setCarbs(prefilledMeal.carbs.toString());
    setProteins(prefilledMeal.proteins.toString());
    setFats(prefilledMeal.fats.toString());
    setSelectedImageURI(prefilledMeal.image_uri);
  }, [prefilledMeal]);

  useEffect(() => {
    const calories = calculateCalories({
      name: mealName || "Unnamed",
      amount: 100, // Default serving size
      carbs: carbs ? parseFloat(carbs) : 0,
      proteins: proteins ? parseFloat(proteins) : 0,
      fats: fats ? parseFloat(fats) : 0,
    });
    setTotalCalories(calories);
  }, [carbs, proteins, fats, mealName]);

  const handleChooseImage = async () => {
    if (status.granted) {
      let imageResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        exif: false,
        quality: 0.075,
      });

      if (!imageResult.canceled && imageResult.assets) {
        setSelectedImageURI(imageResult.assets[0].uri);
        setPopupComponent(
          <UploadingMeal
            imageBase64={resizedImage.base64}
            imageURI={resizedImage.uri}
            onComplete={(mealId) => {
              addMeal(resizedImage.uri, mealId);
              setPopupComponent(null);
              navigation.goBack();
            }}
            onError={(error) => {
              // Handle error
              alert(error);
              setPopupComponent(null);
            }}
          />
        );
      }
    } else if (status.canAskAgain) {
      await requestPermission();
    } else {
      alert(
        "Calorily needs your permission to use your camera. You can allow it in your iOS settings."
      );
    }
  };

  const handleAddMeal = () => {
    addMeal(resizedImage.uri);
    console.log("Meal added:", {
      mealName,
      carbs,
      proteins,
      fats,
      totalCalories,
    });
    navigation.goBack();
  };

  const dynamicStyles = getDynamicStyles(scheme, isReady);

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <ScrollView style={dynamicStyles.scrollView}>
          <View style={dynamicStyles.form}>
            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Meal Name:</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter meal name"
                value={mealName}
                onChangeText={setMealName}
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Carbs (g):</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter carbs in grams"
                value={carbs}
                onChangeText={setCarbs}
                keyboardType="numeric"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Proteins (g):</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter proteins in grams"
                value={proteins}
                onChangeText={setProteins}
                keyboardType="numeric"
              />
            </View>

            <View style={dynamicStyles.inputGroup}>
              <Text style={dynamicStyles.label}>Fats (g):</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter fats in grams"
                value={fats}
                onChangeText={setFats}
                keyboardType="numeric"
              />
            </View>

            <View style={dynamicStyles.inputGroupRow}>
              <Text style={dynamicStyles.caloriesLabel}>Total Calories: </Text>
              <Text style={dynamicStyles.calories}>{totalCalories} kcal</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>

      <View style={dynamicStyles.buttonContainer}>
        <View style={dynamicStyles.imageButtonContainer}>
          <TouchableOpacity
            style={
              selectedImageURI
                ? dynamicStyles.secondaryButtonSelected
                : dynamicStyles.fullWidthButton
            }
            onPress={handleChooseImage}
          >
            <Text style={dynamicStyles.buttonText}>
              {selectedImageURI ? "Change Image" : "Choose an Image"}
            </Text>
          </TouchableOpacity>
          {selectedImageURI && (
            <Image
              source={{ uri: selectedImageURI }}
              style={dynamicStyles.imageThumbnail}
            />
          )}
        </View>
        {selectedImageURI && (
          <TouchableOpacity
            style={[
              dynamicStyles.secondaryButton,
              dynamicStyles.additionalMargin,
            ]}
            onPress={() => {
              // TODO: Implement AI analysis
              console.log("AI analysis not implemented yet");
            }}
          >
            <Text style={dynamicStyles.buttonText}>Fill with AI</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[dynamicStyles.button, dynamicStyles.additionalMargin]}
          disabled={!isReady}
          onPress={handleAddMeal}
        >
          <Text style={dynamicStyles.mealButtonText}>Add Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getDynamicStyles = (scheme: "dark" | "light", isReady: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
    },
    scrollView: {
      flex: 1,
    },
    form: {
      marginHorizontal: 20,
    },
    inputGroup: {
      marginBottom: 15,
    },
    inputGroupRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    label: {
      color: scheme === "dark" ? "#FFF" : "#000",
      marginBottom: 5,
      flex: 1,
    },
    input: {
      backgroundColor: scheme === "dark" ? "#333" : "#FFF",
      borderWidth: 1,
      borderColor: scheme === "dark" ? "#555" : "#DDD",
      padding: 10,
      borderRadius: 5,
      color: scheme === "dark" ? "#FFF" : "#000",
      minHeight: 40,
    },
    caloriesLabel: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
    },
    calories: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
      marginLeft: 5,
    },
    buttonContainer: {
      paddingBottom: 15,
      paddingHorizontal: 15,
    },
    button: {
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      opacity: isReady ? 1 : 0.5,
      marginTop: 15,
    },
    buttonText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 18,
    },
    mealButtonText: {
      color: "#FFF",
      fontSize: 18,
      opacity: isReady ? 1 : 0.5,
    },
    fullWidthButton: {
      backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
      flex: 1,
    },
    secondaryButton: {
      backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
      padding: 15,
      borderRadius: 10,
      alignItems: "center",
    },
    secondaryButtonText: {
      color: scheme === "dark" ? "#FFF" : "#5b5b5c",
      fontSize: 18,
    },
    imageButtonContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    secondaryButtonSelected: {
      backgroundColor: scheme === "dark" ? "#5E5CE6" : "#A4A4FF",
      padding: 15,
      borderRadius: 10,
      flex: 1,
      marginRight: 15,
    },
    imageThumbnail: {
      width: 50,
      height: 50,
      borderRadius: 10,
    },
    additionalMargin: {
      marginTop: 15,
    },
  });

export default NewMeal;
