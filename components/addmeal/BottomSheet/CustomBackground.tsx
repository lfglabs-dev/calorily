import React, { useMemo } from "react";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { useColorScheme } from "react-native";
import { BottomSheetBackgroundProps } from "@gorhom/bottom-sheet";

export const CustomBackground: React.FC<BottomSheetBackgroundProps> = ({
  style,
}) => {
  const colorScheme = useColorScheme();

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderRadius: 14,
    backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle]
  );

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};
