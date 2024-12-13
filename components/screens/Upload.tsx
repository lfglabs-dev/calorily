import React from "react";
import { View } from "react-native";
import UploadingMeal from "../addmeal/UploadingMeal";
import { useAddMeal } from "../../hooks/useAddMeal";
import useResizedImage from "../../hooks/useResizedImage";

const Upload = ({ route, navigation }) => {
  const { imageUri } = route.params;
  const { addMeal } = useAddMeal();
  const resizedImage = useResizedImage(imageUri);

  return (
    <View style={{ flex: 1 }}>
      {resizedImage && (
        <UploadingMeal
          imageBase64={resizedImage.base64}
          imageURI={imageUri}
          onComplete={(mealId) => {
            addMeal(imageUri, mealId);
            navigation.goBack();
          }}
          onError={(error) => {
            alert(error);
            navigation.goBack();
          }}
        />
      )}
    </View>
  );
};

export default Upload;
