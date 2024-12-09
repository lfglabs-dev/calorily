import React, { useEffect, useLayoutEffect, useRef } from "react";
import { View, StyleSheet, Animated, Alert, Platform } from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";

interface LoginScreenProps {
  onComplete: () => void;
}

export default function LoginScreen({ onComplete }: LoginScreenProps) {
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(0)).current;
  const mounted = useRef(false);
  const isSignInInProgress = useRef(false);
  const hasShownAlert = useRef(false);

  useLayoutEffect(() => {
    mounted.current = true;
    spinValue.setValue(0);
    fadeValue.setValue(0);

    Animated.sequence([
      Animated.timing(fadeValue, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(200),
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (mounted.current && Platform.OS === "ios") {
        initiateAppleSignIn();
      } else {
        onComplete();
      }
    }, 1000);

    return () => {
      mounted.current = false;
      clearTimeout(timer);
    };
  }, []);

  const showSignInAlert = () => {
    if (!mounted.current || hasShownAlert.current) return;
    hasShownAlert.current = true;

    setTimeout(() => {
      Alert.alert(
        "Sign In Required",
        "Please sign in with Apple to sync your meals and preferences across devices.",
        [
          {
            text: "Continue with Apple",
            onPress: () => {
              hasShownAlert.current = false;
              initiateAppleSignIn();
            },
          },
        ]
      );
    }, 500);
  };

  const initiateAppleSignIn = async () => {
    if (!mounted.current || isSignInInProgress.current) return;

    try {
      isSignInInProgress.current = true;
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      console.log("User ID:", credential.user);
      console.log("Email:", credential.email);
      console.log("Identity Token:", credential.identityToken);

      if (mounted.current) {
        onComplete();
      }
    } catch (e: any) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        showSignInAlert();
      } else {
        console.error("Apple Sign In Error:", e);
        if (mounted.current) {
          setTimeout(() => {
            isSignInInProgress.current = false;
            initiateAppleSignIn();
          }, 1000);
        }
      }
    } finally {
      isSignInInProgress.current = false;
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <View style={styles.overlay} />
      </View>
      <Animated.Image
        source={require("../../assets/splash.png")}
        style={[
          styles.logo,
          {
            transform: [{ rotate: spin }],
            opacity: fadeValue,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  logo: {
    width: "100%",
    height: "100%",
  },
});
