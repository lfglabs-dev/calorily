import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Animated,
  Linking,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import { useOnboarding } from "../../../shared/OnboardingContext";

export default function Subscription({
  onSubscribe: externalOnSubscribe,
  setIsSubscribed,
}: {
  onSubscribe?: (pkg: PurchasesPackage) => Promise<void>;
  setIsSubscribed?: (value: boolean) => void;
}) {
  const [offerings, setOfferings] = useState<PurchasesPackage[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const scheme = useColorScheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { setHasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current?.availablePackages) {
        setOfferings(offerings.current.availablePackages);
      }
    } catch (error) {
      console.error("Error loading offerings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (pkg: PurchasesPackage) => {
    try {
      await Purchases.purchasePackage(pkg);
      if (externalOnSubscribe) {
        await externalOnSubscribe(pkg);
      } else {
        setHasCompletedOnboarding(true);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  const handleSkip = async () => {
    try {
      const info = await Purchases.restorePurchases();
      if (
        info.entitlements.active !== undefined &&
        Object.keys(info.entitlements.active).length > 0
      ) {
        if (setIsSubscribed) {
          setIsSubscribed(true);
        } else {
          setHasCompletedOnboarding(true);
        }
      }
    } catch (error) {
      console.error("Error restoring purchases:", error);
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6" },
        ]}
      >
        <View style={styles.contentContainer}>
          <FontAwesome
            name="refresh"
            size={80}
            color={scheme === "dark" ? "#1A73E8" : "#007AFF"}
          />
        </View>
      </View>
    );
  }

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
            name="star"
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
            Try Premium Free for 7 Days
          </Text>
          <Text
            style={[
              styles.description,
              { color: scheme === "dark" ? "#AAA" : "#666" },
            ]}
          >
            Get unlimited AI-powered meal analysis, detailed nutritional
            insights, and personalized recommendations.
          </Text>
        </View>

        {offerings?.map((pkg, index) => {
          const period = pkg.product.subscriptionPeriod?.toLowerCase();
          const isSubscription = period && period !== "lifetime";

          if (isSubscription) {
            return (
              <View key={index} style={styles.planContainer}>
                <View style={styles.priceWrapper}>
                  <View style={styles.priceContainer}>
                    <Text
                      style={[
                        styles.priceText,
                        { color: scheme === "dark" ? "#FFF" : "#000" },
                      ]}
                    >
                      {pkg.product.priceString}
                    </Text>
                    <Text
                      style={[
                        styles.periodText,
                        { color: scheme === "dark" ? "#AAA" : "#666" },
                      ]}
                    >
                      a month
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.cancelText,
                      { color: scheme === "dark" ? "#AAA" : "#666" },
                    ]}
                  >
                    Cancel anytime • No commitment
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.planButton,
                    {
                      backgroundColor:
                        scheme === "dark" ? "#1A73E8" : "#007AFF",
                    },
                  ]}
                  onPress={() => handleSubscribe(pkg)}
                >
                  <Text style={styles.planButtonText}>Start Free Trial</Text>
                </TouchableOpacity>
              </View>
            );
          } else {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.restoreButton,
                  { backgroundColor: scheme === "dark" ? "#222" : "#EEE" },
                ]}
                onPress={() => handleSubscribe(pkg)}
              >
                <Text
                  style={[
                    styles.restoreButtonText,
                    { color: scheme === "dark" ? "#FFF" : "#000" },
                  ]}
                >
                  Get lifetime for {pkg.product.priceString}
                </Text>
              </TouchableOpacity>
            );
          }
        })}
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.restorePurchaseButton,
            { backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F2F1F6" },
          ]}
          onPress={handleSkip}
        >
          <Text
            style={[
              styles.restorePurchaseText,
              { color: scheme === "dark" ? "#AAA" : "#666" },
            ]}
          >
            Restore Purchase
          </Text>
        </TouchableOpacity>

        <View style={styles.legalContainer}>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL(
                "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
              )
            }
          >
            <Text
              style={[
                styles.legalText,
                { color: scheme === "dark" ? "#AAA" : "#666" },
              ]}
            >
              Terms of Use
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Linking.openURL("https://calorily.com/privacy")}
          >
            <Text
              style={[
                styles.legalText,
                { color: scheme === "dark" ? "#AAA" : "#666" },
              ]}
            >
              Privacy Policy
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 20,
  },
  topPadding: {
    flex: 0.2,
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
    marginBottom: 40,
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
    lineHeight: 24,
  },
  planContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  priceWrapper: {
    width: "100%",
    marginBottom: 15,
    alignItems: "center",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 4,
  },
  periodText: {
    fontSize: 16,
    lineHeight: 24,
    paddingBottom: 2,
  },
  priceText: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 38,
  },
  planButton: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  planButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "600",
  },
  restoreButton: {
    width: "100%",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  restoreButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
  legalContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 15,
  },
  legalText: {
    fontSize: 14,
    textDecorationLine: "underline",
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 14,
    textAlign: "center",
  },
  lifetimeButton: {
    paddingVertical: 10,
  },
  lifetimeText: {
    fontSize: 15,
    textDecorationLine: "underline",
  },
  restorePurchaseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 10,
  },
  restorePurchaseText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
