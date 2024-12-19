import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function PromoCode({ navigation }) {
  const [code, setCode] = useState("");
  const scheme = useColorScheme();

  const handleContinue = async () => {
    if (code.trim()) {
      // TODO: Validate promo code with backend
      console.log("Promo code entered:", code);
    }
    navigation.navigate("Subscription");
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View
        style={[
          styles.container,
          { backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6" },
        ]}
      >
        <View style={styles.contentContainer}>
          <View style={styles.topPadding} />
          <View style={styles.iconContainer}>
            <FontAwesome
              name="ticket"
              size={80}
              color={scheme === "dark" ? "#1A73E8" : "#007AFF"}
            />
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                { color: scheme === "dark" ? "#FFF" : "#000" },
              ]}
            >
              Got a Promo Code?
            </Text>
            <Text
              style={[
                styles.description,
                { color: scheme === "dark" ? "#AAA" : "#666" },
              ]}
            >
              If you have a promotional code, enter it below to unlock premium
              features.
            </Text>
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: scheme === "dark" ? "#222" : "#EEE",
                color: scheme === "dark" ? "#FFF" : "#000",
              },
            ]}
            placeholder="Enter promo code"
            placeholderTextColor={scheme === "dark" ? "#666" : "#999"}
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
          />
          <View style={styles.bottomPadding} />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.skipButton,
              {
                backgroundColor: scheme === "dark" ? "#222" : "#EEE",
              },
            ]}
            onPress={() => navigation.navigate("Subscription")}
          >
            <Text
              style={[
                styles.skipButtonText,
                { color: scheme === "dark" ? "#FFF" : "#000" },
              ]}
            >
              Skip
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor:
                  code.trim().length > 0
                    ? scheme === "dark"
                      ? "#1A73E8"
                      : "#007AFF"
                    : scheme === "dark"
                    ? "#222"
                    : "#EEE",
              },
            ]}
            onPress={handleContinue}
          >
            <Text
              style={[
                styles.continueButtonText,
                {
                  color:
                    code.trim().length > 0
                      ? "#FFF"
                      : scheme === "dark"
                      ? "#666"
                      : "#999",
                },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
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
    flex: 0.1,
  },
  bottomPadding: {
    flex: 0.4,
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
  input: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    gap: 10,
  },
  skipButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  continueButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
