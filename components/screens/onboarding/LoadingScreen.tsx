import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  Animated,
  Easing,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const ANALYSIS_STEPS = [
  "Estimating your BMR",
  "Calculating daily targets",
  "Personalizing your goals",
];

export default function LoadingScreen({ navigation }) {
  const scheme = useColorScheme();
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Start spinning animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Sequence for steps
    const showSteps = async () => {
      for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
        // Reset fade value
        fadeAnim.setValue(0);
        // Update step
        setCurrentStep(i);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
        // Wait before next step
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }
      // Wait a bit after last step
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigation.navigate("PromoCode");
    };

    showSteps();
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6" },
      ]}
    >
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <FontAwesome
          name="cog"
          size={60}
          color={scheme === "dark" ? "#1A73E8" : "#007AFF"}
        />
      </Animated.View>
      <Text
        style={[styles.title, { color: scheme === "dark" ? "#FFF" : "#000" }]}
      >
        Preparing your experience...
      </Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <Text
          style={[
            styles.subtitle,
            { color: scheme === "dark" ? "#AAA" : "#666" },
          ]}
        >
          {ANALYSIS_STEPS[currentStep]}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 30,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
