import { useEffect } from "react";
import * as FileSystem from "expo-file-system";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Linking, Platform } from "react-native";

type RootStackParamList = {
  Upload: { imageUri: string };
};

export const useSharing = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const handleSharedContent = async (event: { url?: string }) => {
      if (event?.url) {
        try {
          // On iOS, the shared file is already in our app's container, so we can use it directly
          if (Platform.OS === "ios") {
            navigation.navigate("Upload", {
              imageUri: event.url,
            });
            return;
          }

          // For Android or other platforms, we might need to copy the file
          const filename = event.url.split("/").pop();
          if (!filename) return;

          const destination = `${FileSystem.documentDirectory}${filename}`;

          await FileSystem.copyAsync({
            from: event.url,
            to: destination,
          });

          navigation.navigate("Upload", {
            imageUri: destination,
          });
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
