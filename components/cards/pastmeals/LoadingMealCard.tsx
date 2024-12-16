import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
  Text,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMealsDatabase } from "../../../shared/MealsStorageContext";

const LoadingMealCard = ({ meal }) => {
  const colorScheme = useColorScheme();
  const { deleteMealById } = useMealsDatabase();
  const [statusMessage, setStatusMessage] = useState(
    meal.status === "uploading"
      ? "Processing your photo..."
      : "Analyzing your meal..."
  );

  const uploadingMessages = [
    "Processing your photo...",
    "Optimizing image quality...",
    "Preparing for upload...",
    "Sending to our servers...",
    "Almost there...", // This will be the final message for uploading
  ];

  const analyzingMessages = [
    "Analyzing your meal...",
    "Identifying ingredients...",
    "Calculating portions...",
    "Getting nutrition facts...",
    "Fine-tuning results...",
  ];

  useEffect(() => {
    let currentIndex = 0;
    const messages =
      meal.status === "uploading" ? uploadingMessages : analyzingMessages;

    const interval = setInterval(() => {
      if (
        meal.status === "uploading" &&
        currentIndex >= uploadingMessages.length - 1
      ) {
        // Stop at the last uploading message
        clearInterval(interval);
        return;
      }

      currentIndex = (currentIndex + 1) % messages.length;
      setStatusMessage(messages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, [meal.status]);

  return (
    <View style={styles(colorScheme).container}>
      <ImageBackground
        source={{ uri: meal.image_uri }}
        style={styles(colorScheme).imageBackground}
        imageStyle={{ borderRadius: 8 }}
        blurRadius={3}
      >
        <TouchableOpacity
          style={styles(colorScheme).closeButton}
          onPress={() => deleteMealById(meal.meal_id)}
        >
          <FontAwesome name="close" size={24} color="#A9A9A9" />
        </TouchableOpacity>
        <View style={styles(colorScheme).overlay}>
          <ActivityIndicator
            size="large"
            color={colorScheme === "dark" ? "#FFF" : "#007AFF"}
            style={styles(colorScheme).spinner}
          />
          <Text
            style={[
              styles(colorScheme).statusText,
              { color: colorScheme === "dark" ? "#FFF" : "#000" },
            ]}
          >
            {statusMessage}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = (colorScheme) =>
  StyleSheet.create({
    container: {
      marginHorizontal: 20,
      height: "100%",
    },
    imageBackground: {
      flex: 1,
      borderRadius: 8,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(0, 0, 0, 0.7)"
          : "rgba(255, 255, 255, 0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    spinner: {
      transform: [{ scale: 1.5 }],
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
    },
    statusText: {
      marginTop: 20,
      fontSize: 16,
      fontWeight: "500",
      textAlign: "center",
    },
  });

export default LoadingMealCard;
