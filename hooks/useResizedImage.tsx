import { useEffect, useState } from "react";
import * as ImageManipulator from "expo-image-manipulator";
import { ImagePickerAsset } from "expo-image-picker";

const useResizedImage = (imageURI) => {
  const [resizedImage, setResizedImage] =
    useState<ImageManipulator.ImageResult | null>(null);

  const resizeAndConvertToBase64 = async (uri : string) => {
    try {
      const resizedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 896 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );
      return resizedImage;
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (imageURI) {
      resizeAndConvertToBase64(imageURI).then(setResizedImage);
    }
  }, [imageURI]);

  return resizedImage;
};

export default useResizedImage;
