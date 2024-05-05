import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
} from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

interface PaywallProps {
  onSubscribe: (option: PurchasesPackage) => Promise<void>;
}

const Paywall: React.FC<PaywallProps> = ({ onSubscribe }) => {
  const [offerings, setOfferings] = useState<PurchasesPackage[] | null>(null);

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

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        setOfferings(offerings.current.availablePackages);
      } catch (error) {
        console.error("Error fetching offerings:", error);
      }
    };
    fetchOfferings();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chose your plan</Text>
      <Text style={styles.description}>
        It's not cheap but your time and health are worth much more
      </Text>

      {offerings &&
        offerings.map((pkg, index) => {
          const { priceString, subscriptionPeriod } = pkg.product;
          let period = priceString;
          if (subscriptionPeriod) {
            const periodMap: { [key: string]: string } = {
              D: "day",
              W: "week",
              M: "month",
              Y: "year",
            };
            const regex = /(\d+)([DWMY])/;
            const match = subscriptionPeriod.match(regex);
            if (match) {
              const numberOfUnits = parseInt(match[1]);
              const unit = periodMap[match[2]] || match[2];
              period =
                numberOfUnits > 1
                  ? `${priceString} per ${numberOfUnits} ${unit}${numberOfUnits}`
                  : `${priceString} per ${unit}`;
            }
          } else {
            period = `${priceString} for life`;
          }
          return (
            <TouchableOpacity
              key={index}
              style={styles.button}
              onPress={() => onSubscribe(pkg)}
            >
              <Text style={styles.buttonText}>{period}</Text>
            </TouchableOpacity>
          );
        })}
    </View>
  );
};

export default Paywall;
