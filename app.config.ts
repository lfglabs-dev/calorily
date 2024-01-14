import { ExpoConfig, ConfigContext } from "@expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "DietGPT",
  slug: "dietgpt",
  version: "1.0.1",
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
    bundleIdentifier: 'io.th0rgal.dietgpt',
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
      projectId: "35a0cfd6-4e2e-4759-ac9c-fe898822090b",
    },
  },
});
