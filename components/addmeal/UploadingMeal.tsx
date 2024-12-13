import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ImageBackground,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../shared/AuthContext";
import { v4 as uuidv4 } from "uuid";
import BottomSheet from "@gorhom/bottom-sheet";
import { CustomBackground } from "./BottomSheet/CustomBackground";
import { UploadingMealHandle } from "./BottomSheet/UploadingMealHandle";
import { useMealsDatabase } from "../../shared/MealsStorageContext";

const SNAP_POINTS = ["90%"];
const MAX_RETRIES = 3;

const UploadingMeal = ({ imageBase64, imageURI, onComplete, onError }) => {
  const { jwt } = useAuth();
  const colorScheme = useColorScheme();
  const { addOptimisticMeal, updateOptimisticMeal } = useMealsDatabase();
  const [currentMealId] = React.useState(() => uuidv4());
  const bottomSheetRef = React.useRef(null);
  const uploadStarted = React.useRef(false);
  const abortControllerRef = React.useRef(new AbortController());

  const handleCancel = () => {
    abortControllerRef.current.abort();
    bottomSheetRef.current?.close();
  };

  const handleHide = () => {
    if (!uploadStarted.current) {
      addOptimisticMeal(currentMealId, imageURI);
      uploadStarted.current = true;
    }
    bottomSheetRef.current?.close();
  };

  useEffect(() => {
    const uploadMeal = async () => {
      try {
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        const response = await fetch("https://api.calorily.com/meals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({
            meal_id: currentMealId,
            b64_img: cleanBase64,
          }),
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (data.error || !response.ok) {
          throw new Error(
            data.error || data.message || "Failed to upload image"
          );
        }

        if (uploadStarted.current) {
          updateOptimisticMeal(currentMealId, { status: "analyzing" });
        }
        onComplete(currentMealId);
        bottomSheetRef.current?.close();
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
        console.error("Upload error:", error);
        if (uploadStarted.current) {
          updateOptimisticMeal(currentMealId, {
            status: "error",
            error_message: error.message,
          });
        }
        onError(error.message || "Failed to upload image");
        bottomSheetRef.current?.close();
      }
    };

    uploadMeal();

    return () => {
      abortControllerRef.current.abort();
    };
  }, [imageBase64, currentMealId]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundComponent={CustomBackground}
      handleComponent={(props) => (
        <UploadingMealHandle
          {...props}
          onCancel={handleCancel}
          onHide={handleHide}
        />
      )}
    >
      <View style={styles.container}>
        <ImageBackground
          source={{ uri: imageURI }}
          style={styles.imageBackground}
          imageStyle={styles.backgroundImage}
          blurRadius={3}
        >
          <View
            style={[
              styles.overlay,
              {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.7)",
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={colorScheme === "dark" ? "#FFF" : "#007AFF"}
              style={styles.spinner}
            />
            <Text
              style={[
                styles.text,
                {
                  color: colorScheme === "dark" ? "#FFF" : "#000",
                },
              ]}
            >
              Uploading...
            </Text>
          </View>
        </ImageBackground>
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  imageBackground: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
  text: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default UploadingMeal;
