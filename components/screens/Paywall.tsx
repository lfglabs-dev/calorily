import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Linking,
} from "react-native";
import Purchases, { PurchasesPackage } from "react-native-purchases";

interface PaywallProps {
  onSubscribe: (option: PurchasesPackage) => Promise<void>;
}

const Paywall: React.FC<PaywallProps> = ({ onSubscribe }) => {
  const [offerings, setOfferings] = useState<PurchasesPackage[] | null>(null);

  const scheme = useColorScheme();
  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 32,
      fontWeight: "bold",
      position: "absolute",
      top: 90,
      alignItems: "center",
    },
    description: {
      color: scheme === "dark" ? "#DDD" : "#333",
      fontSize: 18,
      textAlign: "center",
      paddingBottom: 35,
      paddingLeft: 35,
      paddingRight: 35,
    },
    sectionTitle: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
      textTransform: "uppercase",
      paddingTop: 10,
      marginBottom: 7,
      textAlign: "center",
      alignSelf: "center",
    },
    button: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
      paddingVertical: 12,
      paddingHorizontal: 30,
      borderRadius: 10,
      marginBottom: 10,
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18,
    },
    linkContainer: {
      position: "absolute",
      bottom: 40,
      alignItems: "center",
    },
    link: {
      color: scheme === "dark" ? "#1A73E8" : "#007AFF",
      fontSize: 16,
      marginVertical: 10,
      textAlign: "center",
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
    <View style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Choose a plan</Text>
      <Text style={dynamicStyles.description}>
        With Calorily premium you will get access to unlimited AI scans of your
        food. It's not cheap, but your time and health are worth much more.
      </Text>

      {offerings &&
        offerings.map((pkg, index) => {
          const { priceString, subscriptionPeriod } = pkg.product;
          const title = pkg.product.title || "Subscription Plan";
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
            <View key={index}>
              <Text style={dynamicStyles.sectionTitle}>{title}</Text>
              <TouchableOpacity
                style={dynamicStyles.button}
                onPress={() => onSubscribe(pkg)}
              >
                <Text style={dynamicStyles.buttonText}>{period}</Text>
              </TouchableOpacity>
            </View>
          );
        })}

      <View style={dynamicStyles.linkContainer}>
        <TouchableOpacity
          onPress={() =>
            Linking.openURL(
              "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
            )
          }
        >
          <Text style={dynamicStyles.link}>Terms of Use (EULA)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => Linking.openURL("https://calorily.com/privacy")}
        >
          <Text style={dynamicStyles.link}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Paywall;
