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

const SNAP_POINTS = ["90%"];
const MAX_RETRIES = 3;

const UploadingMeal = ({ imageBase64, imageURI, onComplete, onError }) => {
  const { jwt } = useAuth();
  const scheme = useColorScheme();
  const [currentMealId, setCurrentMealId] = React.useState(() => uuidv4());
  const bottomSheetRef = React.useRef(null);
  const retryCount = React.useRef(0);

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
        });

        const data = await response.json();

        if (
          data.error === "meal already exists" &&
          retryCount.current < MAX_RETRIES
        ) {
          retryCount.current += 1;
          const newMealId = uuidv4();
          console.log(`Meal ID conflict, retrying with new ID: ${newMealId}`);
          setCurrentMealId(newMealId);
          return;
        }

        if (data.error || !response.ok) {
          throw new Error(
            data.error || data.message || "Failed to upload image"
          );
        }

        onComplete(currentMealId);
        bottomSheetRef.current?.close();
      } catch (error) {
        console.error("Upload error:", error);
        onError(error.message || "Failed to upload image");
        bottomSheetRef.current?.close();
      }
    };

    uploadMeal();
  }, [imageBase64, currentMealId]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={SNAP_POINTS}
      backgroundComponent={CustomBackground}
      handleComponent={UploadingMealHandle}
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
                  scheme === "dark"
                    ? "rgba(0, 0, 0, 0.7)"
                    : "rgba(255, 255, 255, 0.7)",
              },
            ]}
          >
            <ActivityIndicator
              size="large"
              color={scheme === "dark" ? "#FFF" : "#007AFF"}
              style={styles.spinner}
            />
            <Text
              style={[
                styles.text,
                {
                  color: scheme === "dark" ? "#FFF" : "#000",
                },
              ]}
            >
              Analyzing your meal...
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
