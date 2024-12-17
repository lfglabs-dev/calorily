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
import { useHealthData } from "../../../shared/HealthDataContext";
import { useApplicationSettings } from "../../../shared/ApplicationSettingsContext";
import { useOnboarding } from "../../../shared/OnboardingContext";

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
  const { estimateBMR, getCurrentWeight } = useHealthData();
  const { updateSettings } = useApplicationSettings();
  const { selectedGoals } = useOnboarding();

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

    // Run actual initialization and visual loading in parallel
    const initialize = async () => {
      // Start the computation immediately
      const computationPromise = initializeSettings();

      // Show the loading animation
      await showSteps();

      // Wait for computation to complete if it hasn't already
      await computationPromise;

      // Navigate to next screen
      navigation.navigate("PromoCode");
    };

    initialize();
  }, []);

  const initializeSettings = async () => {
    try {
      // Get or estimate BMR
      let bmr = await estimateBMR();
      if (!bmr || bmr < 800) {
        bmr = 1800; // Default if no data available
      }

      // Get current weight or use default
      let currentWeight = await getCurrentWeight();
      if (!currentWeight) {
        currentWeight = 70; // Default weight in kg
      }

      // Set targets based on goals
      let deficit = Math.round(bmr * 0.05); // Default 5% deficit
      let surplus = Math.round(bmr * 0.05); // Default 5% surplus
      let minWeight = currentWeight - 3;
      let maxWeight = currentWeight + 3;

      if (selectedGoals.includes("LOSE_WEIGHT")) {
        deficit = Math.round(bmr * 0.15); // 15% deficit for weight loss
        surplus = 0;
        minWeight = currentWeight - 5;
        maxWeight = currentWeight - 3;
      } else if (selectedGoals.includes("BUILD_MUSCLE")) {
        deficit = 0;
        surplus = Math.round(bmr * 0.1); // 10% surplus for muscle gain
        minWeight = currentWeight + 3;
        maxWeight = currentWeight + 5;
      }

      // Update settings
      await updateSettings({
        metabolicData: {
          basalMetabolicRate: Math.round(bmr),
          targetCaloricDeficit: deficit,
          targetCaloricSurplus: surplus,
          targetMinimumWeight: Math.round(minWeight),
          targetMaximumWeight: Math.round(maxWeight),
        },
      });
    } catch (error) {
      console.error("Error initializing settings:", error);
    }
  };

  const showSteps = async () => {
    for (let i = 0; i < ANALYSIS_STEPS.length; i++) {
      fadeAnim.setValue(0);
      setCurrentStep(i);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

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
