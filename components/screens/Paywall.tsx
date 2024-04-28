import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { PurchasesPackage } from "react-native-purchases";
import { useApplicationSettings } from "../../shared/ApplicationSettingsContext";

interface PaywallProps {
  onSubscribe: (option: PurchasesPackage) => Promise<void>;
}

const Paywall: React.FC<PaywallProps> = ({ onSubscribe }) => {
  const { settings, updateSettings } = useApplicationSettings();

  const scheme = useColorScheme();
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: scheme === "dark" ? "#000" : "#fff",
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 24,
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: 20,
    },
    description: {
      color: scheme === "dark" ? "#DDD" : "#333",
      fontSize: 18,
      textAlign: "center",
      marginBottom: 30,
    },
    button: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      marginBottom: 12,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18,
    },
    buttonDisabled: {
      backgroundColor: scheme === "dark" ? "#555" : "#ccc",
    },
    buttonTextDisabled: {
      color: "#999",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Subscribe to Access Features</Text>
      <Text style={styles.description}>
        You can't improve what you can't track. Calorily makes tracking your
        calories easy. It's not cheap but your time is valuable.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          updateSettings({
            ...settings,
            subscribed: true,
          });
        }}
      >
        <Text style={styles.buttonText}>$20/month with One Free Week</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.buttonDisabled]}
        disabled={true}
      >
        <Text style={[styles.buttonText, styles.buttonTextDisabled]}>
          $100 for Lifetime (Unavailable)
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Paywall;
