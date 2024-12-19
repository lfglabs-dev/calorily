import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const useSingleImagePicker = () => {
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Photo Library Access Required",
          "Calorily needs access to your photos. You can enable it in your iOS settings."
        );
        return null;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.075,
      });

      if (!result.canceled && result.assets) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to load photo. Please try again.");
      return null;
    }
  };

  return { pickImage };
};
