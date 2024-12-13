import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  SafeAreaView,
} from "react-native";
import { useApplicationSettings } from "../../shared/ApplicationSettingsContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useHealthData } from "../../shared/HealthDataContext";
import Purchases, {
  CustomerInfo,
  PurchasesOfferings,
} from "react-native-purchases";
import { useOnboarding } from "../../shared/OnboardingContext";

const SubscriptionInfo = ({ dynamicStyles }) => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSubscriptionStatus = async () => {
      try {
        const info = await Purchases.getCustomerInfo();
        if (
          info.entitlements.active !== undefined &&
          Object.keys(info.entitlements.active).length > 0
        ) {
          const plan = info.entitlements.active.pro?.productIdentifier.includes(
            "lifetime"
          )
            ? "Lifetime Access"
            : "Premium";
          setSubscriptionStatus(plan);
        } else {
          setSubscriptionStatus("Free Plan");
        }
      } catch (error) {
        console.error("Error fetching subscription status:", error);
        setSubscriptionStatus("Unknown");
      } finally {
        setLoading(false);
      }
    };

    getSubscriptionStatus();
  }, []);

  if (loading) {
    return <Text style={dynamicStyles.settingLabel}>Loading...</Text>;
  }

  return (
    <>
      <Text style={dynamicStyles.settingLabel}>Subscription</Text>
      <Text style={dynamicStyles.settingValue}>{subscriptionStatus}</Text>
    </>
  );
};

const Settings = () => {
  const { settings, updateSettings } = useApplicationSettings();
  const [editing, setEditing] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);

  const [basalMetabolicRate, setBasalMetabolicRate] = useState("");
  const [targetCaloricDeficit, setTargetCaloricDeficit] = useState("");
  const [targetCaloricSurplus, setTargetCaloricSurplus] = useState("");
  const [targetMinimumWeight, setTargetMinimumWeight] = useState("");
  const [targetMaximumWeight, setTargetMaximumWeight] = useState("");
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();
  const [offerings, setOfferings] = useState<PurchasesOfferings>();

  const { estimateBMR } = useHealthData();
  const scheme = useColorScheme();
  const { resetOnboarding } = useOnboarding();

  useEffect(() => {
    if (settings) {
      setBasalMetabolicRate(
        settings.metabolicData.basalMetabolicRate.toString()
      );
      setTargetCaloricDeficit(
        settings.metabolicData.targetCaloricDeficit.toString()
      );
      setTargetCaloricSurplus(
        settings.metabolicData.targetCaloricSurplus.toString()
      );
      setTargetMinimumWeight(
        settings.metabolicData.targetMinimumWeight.toString()
      );
      setTargetMaximumWeight(
        settings.metabolicData.targetMaximumWeight.toString()
      );
    }
  }, [settings]);

  useEffect(() => {
    const fetchSubscription = async () => {
      setCustomerInfo(await Purchases.getCustomerInfo());
      setOfferings(await Purchases.getOfferings());
    };
    fetchSubscription();
  }, []);

  const saveSettings = async () => {
    await updateSettings({
      metabolicData: {
        basalMetabolicRate: parseInt(basalMetabolicRate, 10),
        targetCaloricDeficit: parseInt(targetCaloricDeficit, 10),
        targetCaloricSurplus: parseInt(targetCaloricSurplus, 10),
        targetMinimumWeight: parseInt(targetMinimumWeight, 10),
        targetMaximumWeight: parseInt(targetMaximumWeight, 10),
      },
      // subscribed: settings.subscribed,
    });
  };

  useEffect(() => {
    if (shouldSave) {
      saveSettings().then(() => {
        setShouldSave(false);
      });
    }
  }, [shouldSave]);

  const dynamicStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 15,
      backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6",
    },
    headerTitle: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 32,
      fontWeight: "bold",
      marginTop: 4,
    },
    editButton: {
      color: "#007AFF",
      fontWeight: editing ? "bold" : "normal",
      fontSize: 18,
      padding: 5,
    },
    sectionTitle: {
      color: scheme === "dark" ? "#AAA" : "#333",
      fontSize: 13,
      textTransform: "uppercase",
      paddingHorizontal: 25,
      paddingTop: 15,
    },
    section: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
      marginVertical: 10,
      borderRadius: 10,
      paddingHorizontal: 10,
      marginHorizontal: 20,
    },
    settingRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.5,
      borderBottomColor: scheme === "dark" ? "#555" : "#DDD",
      paddingVertical: 10,
    },
    settingLabel: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
    },
    settingValue: {
      color: scheme === "dark" ? "#AAA" : "#666",
      fontSize: 16,
    },
    input: {
      color: "#007AFF",
      fontSize: 16,
      textAlign: "right",
      minWidth: 100,
    },
    lastSettingRow: {
      borderBottomWidth: 0,
    },
    settingItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      borderBottomWidth: 0.5,
      borderBottomColor: scheme === "dark" ? "#555" : "#DDD",
      paddingVertical: 10,
    },
    settingText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
    },
  });

  return (
    <SafeAreaView style={dynamicStyles.safeArea}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Settings</Text>
        <TouchableOpacity
          onPress={() => {
            if (editing) {
              saveSettings();
            }
            setEditing(!editing);
          }}
        >
          <Text style={dynamicStyles.editButton}>
            {editing ? "Done" : "Edit"}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={dynamicStyles.sectionTitle}>Metabolic Data</Text>
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.settingRow}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={dynamicStyles.settingLabel}>Basal Metabolic Rate</Text>
            <TouchableOpacity
              onPress={() => {
                estimateBMR().then((value) => {
                  setBasalMetabolicRate(value.toFixed(0));
                  setShouldSave(true);
                });
              }}
              style={{
                marginLeft: 8,
                padding: 2,
                borderRadius: 8,
                backgroundColor: scheme === "dark" ? "#FFF" : "#000",
              }}
            >
              <Ionicons
                name="color-wand"
                size={18}
                color={scheme === "dark" ? "#333" : "#AAA"}
              />
            </TouchableOpacity>
          </View>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setBasalMetabolicRate}
              value={basalMetabolicRate}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>{basalMetabolicRate}</Text>
          )}
        </View>

        <View style={dynamicStyles.settingRow}>
          <Text style={dynamicStyles.settingLabel}>Target caloric deficit</Text>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setTargetCaloricDeficit}
              value={targetCaloricDeficit}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>
              {targetCaloricDeficit}
            </Text>
          )}
        </View>

        <View style={dynamicStyles.settingRow}>
          <Text style={dynamicStyles.settingLabel}>Target caloric surplus</Text>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setTargetCaloricSurplus}
              value={targetCaloricSurplus}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>
              {targetCaloricSurplus}
            </Text>
          )}
        </View>

        <View style={dynamicStyles.settingRow}>
          <Text style={dynamicStyles.settingLabel}>Target minimum weight</Text>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setTargetMinimumWeight}
              value={targetMinimumWeight}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>
              {targetMinimumWeight}
            </Text>
          )}
        </View>

        <View style={[dynamicStyles.settingRow, dynamicStyles.lastSettingRow]}>
          <Text style={dynamicStyles.settingLabel}>Target maximum weight</Text>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setTargetMaximumWeight}
              value={targetMaximumWeight}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>
              {targetMaximumWeight}
            </Text>
          )}
        </View>
      </View>

      <Text style={dynamicStyles.sectionTitle}>Application</Text>
      <View style={dynamicStyles.section}>
        <View style={dynamicStyles.settingItem}>
          <SubscriptionInfo dynamicStyles={dynamicStyles} />
        </View>
        <TouchableOpacity
          style={[dynamicStyles.settingItem, dynamicStyles.lastSettingRow]}
          onPress={() => resetOnboarding()}
        >
          <Text style={dynamicStyles.settingText}>
            Reset Onboarding (Debug)
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
