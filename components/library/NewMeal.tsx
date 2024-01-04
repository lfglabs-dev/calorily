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
  TouchableWithoutFeedback
} from "react-native";
import { useColorScheme } from "react-native";
import { calculateCalories } from "../../utils/food";

const NewMeal = () => {
  const scheme = useColorScheme();

  const [mealName, setMealName] = useState("");
  const [carbs, setCarbs] = useState("");
  const [proteins, setProteins] = useState("");
  const [fats, setFats] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);

  useEffect(() => {
    const calories = calculateCalories({
      carbs: carbs ? parseFloat(carbs) : 0,
      proteins: proteins ? parseFloat(proteins) : 0,
      fats: fats ? parseFloat(fats) : 0
    });
    setTotalCalories(calories);
  }, [carbs, proteins, fats]);

  const handleChooseImage = () => {
    console.log("Image picker triggered");
  };

  const handleAddMeal = () => {
    console.log("Meal added:", { mealName, carbs, proteins, fats, totalCalories });
    // Here you can add logic to save the meal data
  };

  const dynamicStyles = getDynamicStyles(scheme);

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
        <TouchableOpacity
          style={dynamicStyles.secondaryButton}
          onPress={handleChooseImage}
        >
          <Text style={dynamicStyles.secondaryButtonText}>
            Choose an Image
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={dynamicStyles.button}
          onPress={handleAddMeal}
        >
          <Text style={dynamicStyles.buttonText}>Add Meal</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const getDynamicStyles = (scheme) => StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: scheme === "dark" ? "#FFF" : "#5b5b5c",
    fontSize: 18,
  },
});

export default NewMeal;
