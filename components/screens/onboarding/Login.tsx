import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Animated,
  Alert,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import * as AppleAuthentication from "expo-apple-authentication";
import { useAuth } from "../../../shared/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

export default function Login({ navigation }) {
  const { signIn, isAuthenticated } = useAuth();
  const scheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const isSignInInProgress = useRef(false);

  useEffect(() => {
    mounted.current = true;
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    return () => {
      mounted.current = false;
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (isAuthenticated) {
        navigation.navigate("Loading");
      }
    }, [isAuthenticated])
  );

  const initiateAppleSignIn = async () => {
    if (!mounted.current || isSignInInProgress.current) return;

    try {
      isSignInInProgress.current = true;
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      if (!credential.identityToken) {
        throw new Error("No identity token received from Apple");
      }

      const response = await fetch("https://api.calorily.com/auth/apple", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identity_token: credential.identityToken,
        }),
      });

      if (!response.ok) {
        throw new Error(`Authentication failed with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.jwt) {
        throw new Error("No JWT in response");
      }

      await signIn(data.jwt);
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        // User canceled the sign-in, just show the button again
        return;
      }
      console.error("Authentication Error:", e.message || e);
      Alert.alert(
        "Authentication Failed",
        "There was a problem signing in. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      isSignInInProgress.current = false;
    }
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
            name="lock"
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
            Secure Your Data
          </Text>
          <Text
            style={[
              styles.description,
              { color: scheme === "dark" ? "#AAA" : "#666" },
            ]}
          >
            Sign in with Apple to sync your meal analysis across your devices.
            Your data is encrypted and only accessible to you.
          </Text>
        </View>
        <View style={styles.bottomPadding} />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF" },
        ]}
        onPress={initiateAppleSignIn}
      >
        <FontAwesome
          name="apple"
          size={20}
          color="#FFF"
          style={styles.buttonIcon}
        />
        <Text style={styles.buttonText}>Continue with Apple</Text>
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
    flexDirection: "row",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
