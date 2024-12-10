import React from "react";
import {
  View,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  useColorScheme,
} from "react-native";

const LoadingMealCard = ({ imageUri }: { imageUri: string }) => {
  const scheme = useColorScheme();

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
  });

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{ uri: imageUri }}
        style={styles.imageBackground}
        imageStyle={{ borderRadius: 8 }}
        blurRadius={3}
      >
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
