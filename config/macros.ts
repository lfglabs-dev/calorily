import { IconProps } from "@expo/vector-icons/build/createIconSet";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

type IconSet = "ionicons" | "fontawesome5";

export interface MacroConfig {
  name: string;
  icons: {
    ionicons: keyof typeof Ionicons.glyphMap;
    fontawesome5: keyof typeof FontAwesome5.glyphMap;
  };
  preferredSet: "ionicons" | "fontawesome5";
}

export const macroIcons: Record<"proteins" | "fats" | "carbs", MacroConfig> = {
  proteins: {
    name: "Proteins",
    icons: {
      ionicons: "egg",
      fontawesome5: "drumstick-bite",
    },
    preferredSet: "fontawesome5",
  },
  fats: {
    name: "Fats",
    icons: {
      ionicons: "water",
      fontawesome5: "hamburger",
    },
    preferredSet: "ionicons",
  },
  carbs: {
    name: "Carbs",
    icons: {
      ionicons: "ice-cream",
      fontawesome5: "carrot",
    },
    preferredSet: "fontawesome5",
  },
};
