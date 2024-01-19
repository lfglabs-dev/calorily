import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { styles } from "./styles";

const LoadingMeal = ({ imageURI }) => {
  const colorScheme = useColorScheme();

  return (
    <View style={styles(colorScheme).container}>
      <Image
        source={{ uri: imageURI }}
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
  );
};

export default LoadingMeal;
