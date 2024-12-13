import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomSheetBackgroundProps } from "@gorhom/bottom-sheet";
import { useBottomSheet } from "@gorhom/bottom-sheet";

export const UploadingMealHandle: React.FC<BottomSheetBackgroundProps> = () => {
  const { close } = useBottomSheet();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.cancelButton} onPress={() => close()}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.hideButton} onPress={() => {}}>
        <Text style={styles.buttonText}>Hide</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  hideButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#007AFF",
  },
});
