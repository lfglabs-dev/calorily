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

const ANALYSIS_TIMEOUT = 60000; // 1 minute in milliseconds

const LoadingMealCard = ({
  imageUri,
  mealId,
  createdAt,
}: {
  imageUri: string;
  mealId: string;
  createdAt: number;
}) => {
  console.log("loading meal id:", mealId);
  const scheme = useColorScheme();
  const { deleteMealById, updateMeal } = useMealsDatabase();
  const [statusMessage, setStatusMessage] = useState("Analyzing your meal...");

  const statusMessages = [
    "Analyzing your meal...",
    "Identifying ingredients...",
    "Calculating portions...",
    "Getting nutrition facts...",
    "Fine-tuning results...",
  ];

  useEffect(() => {
    let currentIndex = 0;
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % statusMessages.length;
      setStatusMessage(statusMessages[currentIndex]);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const now = Date.now() / 1000;
      if (now - createdAt > 60) {
        updateMeal({
          meal_id: mealId,
          status: "failed",
          error_message: "Analysis timed out after 1 minute",
        });
      }
    }, ANALYSIS_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [mealId, createdAt]);

  const styles = StyleSheet.create({
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
        scheme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(255, 255, 255, 0.7)",
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

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 8 }}
        blurRadius={3}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => deleteMealById(mealId)}
        >
          <FontAwesome name="close" size={24} color="#A9A9A9" />
        </TouchableOpacity>
        <View style={styles.overlay}>
          <ActivityIndicator
            size="large"
            color={scheme === "dark" ? "#FFF" : "#007AFF"}
            style={styles.spinner}
          />
          <Text
            style={[
              styles.statusText,
              { color: scheme === "dark" ? "#FFF" : "#000" },
            ]}
          >
            {statusMessage}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoadingMealCard;
