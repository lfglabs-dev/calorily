import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { StoredMeal } from "../types";
import { eventBus } from "./eventBus";

const db = SQLite.openDatabase("meals.db");

export interface UploadMealResponse {
  error?: string;
  message?: string;
}

export const mealService = {
  async uploadMeal(
    imageUri: string,
    mealId: string,
    jwt: string
  ): Promise<UploadMealResponse> {
    try {
      // Log original file info
      const fileInfo = await FileSystem.getInfoAsync(imageUri, { size: true });
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }
      console.log(
        "Original image size:",
        (fileInfo.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      // Compress the image
      const compressedImage = await manipulateAsync(
        imageUri,
        [{ resize: { width: 1024 } }], // Resize to max width of 1024px
        {
          compress: 0.25, // 25% quality
          format: SaveFormat.JPEG,
        }
      );

      // Log compressed file info
      const compressedFileInfo = await FileSystem.getInfoAsync(
        compressedImage.uri,
        { size: true }
      );
      if (!compressedFileInfo.exists) {
        throw new Error("Compressed file does not exist");
      }
      console.log(
        "Compressed image size:",
        (compressedFileInfo.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("Base64 string length:", base64.length);

      // Just send the raw base64 string without data URI prefix
      const response = await fetch("https://api.calorily.com/meals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          meal_id: mealId,
          b64_img: base64, // Send raw base64 string
        }),
      });

      const responseText = await response.text();

      try {
        const json = JSON.parse(responseText);
        console.log("Parsed JSON:", JSON.stringify(json, null, 2));

        if (json.error || !response.ok) {
          throw new Error(
            json.error?.message || json.message || "Failed to upload image"
          );
        }

        return json;
      } catch (parseError) {
        console.error("JSON parse error:", {
          parseError,
          responseText,
          contentType: response.headers.get("content-type"),
        });
        throw parseError;
      }
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  },

  updateMeal: async (
    updates: Partial<StoredMeal> & { meal_id: string }
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        const { meal_id, ...otherUpdates } = updates;
        const fields = Object.keys(otherUpdates);
        const setClause = fields.map((field) => `${field} = ?`).join(", ");
        const values = fields.map((field) => {
          return typeof otherUpdates[field] === "object"
            ? JSON.stringify(otherUpdates[field])
            : otherUpdates[field];
        });
        const query = `UPDATE meals SET ${setClause} WHERE meal_id = ?`;
        const params = [...values, meal_id];

        tx.executeSql(
          query,
          params,
          () => {
            resolve();
            eventBus.emit("mealsUpdated");
          },
          (_, error) => {
            reject(error);
            return false;
          }
        );
      });
    });
  },
};
