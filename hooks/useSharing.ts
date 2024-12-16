import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Linking, Platform } from "react-native";
import { useAddMeal } from "./useAddMeal";
import { MainTabParamList } from "../navigation/types";

export const useSharing = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { handleImageUpload } = useAddMeal();

  useEffect(() => {
    const handleSharedContent = async (event: { url?: string }) => {
      if (event?.url) {
        try {
          // On iOS, the shared file is already in our app's container
          const imageUri =
            Platform.OS === "ios"
              ? event.url
              : `${FileSystem.documentDirectory}${event.url.split("/").pop()}`;

          if (Platform.OS !== "ios") {
            // For Android, copy the file
            await FileSystem.copyAsync({
              from: event.url,
              to: imageUri,
            });
          }

          const result = await handleImageUpload(imageUri);
          if (result) {
            navigation.navigate("Summary");
          }
        } catch (error) {
          console.error("Error handling shared content:", error);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleSharedContent);

    return () => {
      subscription.remove();
    };
  }, [navigation]);
};
