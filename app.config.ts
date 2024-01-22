import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "Calorily",
  slug: "calorily",
  version: "1.1.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "com.calorily.app",
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "react-native-health",
    [
      "expo-image-picker",
      {
        photosPermission: "This app accesses your photos to analyze your meal.",
        cameraPermission: "This app accesses your camera to analyze your meal.",
      },
    ],
  ],
  extra: {
    eas: {
      projectId: "b4b736d7-5526-4e75-a92c-db0622f97f39",
    },
  },
});
