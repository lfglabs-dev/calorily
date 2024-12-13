import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Animated,
} from "react-native";
import { useOnboarding } from "../../../shared/OnboardingContext";
import AppleHealthKit, { HealthKitPermissions } from "react-native-health";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function HealthPermissions({ navigation }) {
  const { setHasHealthPermissions } = useOnboarding();
  const scheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== "ios") {
      // Skip for non-iOS platforms
      setHasHealthPermissions(true);
      navigation.navigate("Login");
      return;
    }

    const permissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          AppleHealthKit.Constants.Permissions.BodyFatPercentage,
          AppleHealthKit.Constants.Permissions.Weight,
          AppleHealthKit.Constants.Permissions.Height,
          AppleHealthKit.Constants.Permissions.BiologicalSex,
          AppleHealthKit.Constants.Permissions.DateOfBirth,
        ],
        write: [
          AppleHealthKit.Constants.Permissions.EnergyConsumed,
          AppleHealthKit.Constants.Permissions.Protein,
          AppleHealthKit.Constants.Permissions.Carbohydrates,
          AppleHealthKit.Constants.Permissions.FatTotal,
        ],
      },
    } as HealthKitPermissions;

    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error("[ERROR] Cannot grant permissions:", error);
      }
      setHasHealthPermissions(true);
      navigation.navigate("Login");
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6" },
      ]}
    >
      <View style={styles.contentContainer}>
        <View style={styles.topPadding} />
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
          <FontAwesome
            name="heartbeat"
            size={80}
            color={scheme === "dark" ? "#1A73E8" : "#007AFF"}
          />
        </Animated.View>
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { color: scheme === "dark" ? "#FFF" : "#000" },
            ]}
          >
            Health Data Access
          </Text>
          <Text
            style={[
              styles.description,
              { color: scheme === "dark" ? "#AAA" : "#666" },
            ]}
          >
            To better tailor your experience, Calorily needs access to your
            health data. This information never leaves your device and helps us
            provide more accurate recommendations.
          </Text>
        </View>
        <View style={styles.bottomPadding} />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF" },
        ]}
        onPress={requestPermissions}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topPadding: {
    flex: 0.2,
  },
  bottomPadding: {
    flex: 0.3,
  },
  iconContainer: {
    width: 80,
    height: 80,
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
