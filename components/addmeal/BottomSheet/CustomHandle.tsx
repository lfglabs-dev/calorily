import React from "react";
import { View, Button, StyleSheet } from "react-native";
import { useColorScheme } from "react-native";
import { BottomSheetBackgroundProps } from "@gorhom/bottom-sheet";
import { useBottomSheet } from "@gorhom/bottom-sheet";

export const CustomHandle: React.FC<BottomSheetBackgroundProps> = () => {
  const { close } = useBottomSheet();

  const handleStyles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "flex-end",
      flexDirection: "row",
      paddingTop: 9,
      paddingBottom: 5,
      paddingRight: 7,
    },
  });

  return (
    <View style={handleStyles.container}>
      <Button onPress={() => close()} title="Cancel" />
    </View>
  );
};
