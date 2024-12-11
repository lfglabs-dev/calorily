import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMealsDatabase } from "../../../shared/MealsStorageContext";

const LoadingMealCard = ({
  imageUri,
  mealId,
}: {
  imageUri: string;
  mealId: string;
}) => {
  console.log("loading meal id:", mealId);
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
  });

  const handleDelete = () => {
    deleteMealById(mealId);
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 8 }}
        blurRadius={3}
      >
        <TouchableOpacity style={styles.closeButton} onPress={handleDelete}>
          <FontAwesome name="close" size={24} color="#A9A9A9" />
        </TouchableOpacity>
        <View style={styles.overlay}>
          <ActivityIndicator
            size="large"
            color={scheme === "dark" ? "#FFF" : "#007AFF"}
            style={styles.spinner}
          />
        </View>
      </ImageBackground>
    </View>
  );
};

export default LoadingMealCard;
