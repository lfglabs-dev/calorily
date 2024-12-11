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

const SubscriptionInfo = () => {
  const scheme = useColorScheme();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>();
  const [offerings, setOfferings] = useState<PurchasesOfferings>();

  useEffect(() => {
    const fetchSubscription = async () => {
      setCustomerInfo(await Purchases.getCustomerInfo());
      setOfferings(await Purchases.getOfferings());
    };
    fetchSubscription();
  }, []);

  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 0.5,
      borderBottomColor: scheme === "dark" ? "#555" : "#DDD",
      paddingVertical: 10,
      minHeight: 44,
    },
    lastRow: {
      borderBottomWidth: 0,
    },
    label: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
    },
    value: {
      color: scheme === "dark" ? "#AAA" : "#666",
      fontSize: 16,
    },
    badge: {
      backgroundColor: scheme === "dark" ? "#4CAF50" : "#E8F5E9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      color: scheme === "dark" ? "#FFF" : "#1B5E20",
      fontSize: 14,
      fontWeight: "500",
    },
  });

  if (!customerInfo) {
    return (
      <View style={[styles.row, styles.lastRow]}>
        <Text style={styles.label}>Loading subscription info...</Text>
      </View>
    );
  }

  // Check for lifetime access or any active subscription
  const hasActiveSubscription =
    customerInfo.entitlements.active !== undefined &&
    Object.keys(customerInfo.entitlements.active).length > 0;

  if (hasActiveSubscription) {
    // Find the specific subscription package
    const subscriptionPackage = offerings?.all.default.availablePackages.find(
      (pkg) => customerInfo.activeSubscriptions.includes(pkg.product.identifier)
    );

    if (subscriptionPackage?.product.subscriptionPeriod === undefined) {
      // No subscription period means it's a lifetime purchase
      return (
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.label}>Subscription Status</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Lifetime Access</Text>
          </View>
        </View>
      );
    }

    // Regular subscription
    const activeSubscription = customerInfo.activeSubscriptions[0];
    const expirationDate = customerInfo?.allExpirationDates[activeSubscription];
    const daysLeft = expirationDate
      ? Math.ceil(
          (new Date(expirationDate).valueOf() - Date.now().valueOf()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    return (
      <>
        <View style={styles.row}>
          <Text style={styles.label}>Active Plan</Text>
          <Text style={styles.value}>{subscriptionPackage.product.title}</Text>
        </View>
        <View style={[styles.row, styles.lastRow]}>
          <Text style={styles.label}>Renews in</Text>
          <Text style={styles.value}>
            {daysLeft} day{daysLeft !== 1 ? "s" : ""}
          </Text>
        </View>
      </>
    );
  }

  // No active subscription
  return (
    <View style={[styles.row, styles.lastRow]}>
      <Text style={styles.label}>Subscription Status</Text>
      <Text style={styles.value}>Free Plan</Text>
    </View>
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
        <SubscriptionInfo />
      </View>
    </SafeAreaView>
  );
};

export default Settings;
