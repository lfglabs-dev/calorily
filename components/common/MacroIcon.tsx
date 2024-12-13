import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { macroIcons } from "../../config/macros";

interface MacroIconProps {
  type: keyof typeof macroIcons;
  iconSet?: "ionicons" | "fontawesome5";
  size?: number;
  color?: string;
  style?: any;
}

export const MacroIcon: React.FC<MacroIconProps> = ({
  type,
  iconSet,
  size = 16,
  color,
  style,
}) => {
  const config = macroIcons[type];
  const useSet = iconSet || config.preferredSet;

  if (useSet === "fontawesome5") {
    return (
      <FontAwesome5
        name={config.icons.fontawesome5}
        size={size}
        color={color}
        style={style}
      />
    );
  }

  return (
    <Ionicons
      name={config.icons.ionicons}
      size={size}
      color={color}
      style={style}
    />
  );
};
