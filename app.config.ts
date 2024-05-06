import { ExpoConfig, ConfigContext } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: IS_DEV ? "Calorily Debug" : "Calorily",
  slug: "calorily",
  version: "1.3.2",
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
    bundleIdentifier: IS_DEV ? "com.calorily.app.dev" : "com.calorily.app",
    supportsTablet: true,
  },
  android: {
    package: IS_DEV ? "com.calorily.app.dev" : "com.calorily.app",
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
