import { getDefaultConfig } from "expo/metro-config";

const config = getDefaultConfig(__dirname); // 2. Get the complete default config object

config.resolver.assetExts = [...config.resolver.assetExts, "tflite"];

export default config;
