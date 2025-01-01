import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  Text,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMealsDatabase } from "../../../shared/MealsStorageContext";
import { OptimisticMeal } from "../../../types";

interface FailedMealCardProps {
  meal: OptimisticMeal;
  onFeedback: (meal: OptimisticMeal) => void;
}

const FailedMealCard = ({ meal, onFeedback }: FailedMealCardProps) => {
  const scheme = useColorScheme();
  const { deleteMealById } = useMealsDatabase();

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
      padding: 20,
    },
    errorIcon: {
      marginBottom: 10,
    },
    errorText: {
      color: scheme === "dark" ? "#FF6B6B" : "#DC3545",
      fontSize: 16,
      textAlign: "center",
      marginBottom: 10,
    },
    messageText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 14,
      textAlign: "center",
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
      zIndex: 1,
    },
  });

  const handleDelete = (event) => {
    event.stopPropagation();
    deleteMealById(meal.meal_id);
  };

  const handlePress = () => {
    onFeedback(meal);
  };

  return (
    <TouchableOpacity onPress={handlePress} style={styles.container}>
      <ImageBackground
        source={{ uri: meal.image_uri }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 8 }}
        blurRadius={3}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleDelete}>
          <FontAwesome name="close" size={24} color="#A9A9A9" />
        </TouchableOpacity>
        <View style={styles.overlay}>
          <FontAwesome
            name="exclamation-circle"
            size={40}
            color={scheme === "dark" ? "#FF6B6B" : "#DC3545"}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>Analysis Failed</Text>
          <Text style={styles.messageText}>{meal.error_message}</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default FailedMealCard;
