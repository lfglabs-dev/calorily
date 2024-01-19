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

const Settings = () => {
  const { settings, updateSettings } = useApplicationSettings();
  const [editing, setEditing] = useState(false);
  const [shouldSave, setShouldSave] = useState(false);

  const [basalMetabolicRate, setBasalMetabolicRate] = useState("");
  const [targetCaloricDeficit, setTargetCaloricDeficit] = useState("");
  const [targetCaloricSurplus, setTargetCaloricSurplus] = useState("");
  const [targetMinimumWeight, setTargetMinimumWeight] = useState("");
  const [targetMaximumWeight, setTargetMaximumWeight] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
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
      setOpenAiKey(settings.metabolicData.openAiKey);
    }
  }, [settings]);

  const saveSettings = async () => {
    await updateSettings({
      metabolicData: {
        basalMetabolicRate: parseInt(basalMetabolicRate, 10),
        targetCaloricDeficit: parseInt(targetCaloricDeficit, 10),
        targetCaloricSurplus: parseInt(targetCaloricSurplus, 10),
        targetMinimumWeight: parseInt(targetMinimumWeight, 10),
        targetMaximumWeight: parseInt(targetMaximumWeight, 10),
        openAiKey,
      },
    });
  };

  useEffect(() => {
    if (!editing) {
      saveSettings();
    }
  }, [editing]);

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
        <TouchableOpacity onPress={() => setEditing(!editing)}>
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
        <View style={[dynamicStyles.settingRow, dynamicStyles.lastSettingRow]}>
          <Text style={dynamicStyles.settingLabel}>OpenAI key</Text>
          {editing ? (
            <TextInput
              style={[dynamicStyles.settingValue, dynamicStyles.input]}
              onChangeText={setOpenAiKey}
              value={openAiKey}
              keyboardType="numeric"
            />
          ) : (
            <Text style={dynamicStyles.settingValue}>
              {openAiKey ? openAiKey : "not set"}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
