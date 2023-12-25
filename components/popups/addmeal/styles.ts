import { StyleSheet } from "react-native";

type StylesProps = {
  colorScheme: "light" | "dark";
};

export const styles = (colorScheme: StylesProps["colorScheme"]) =>
  StyleSheet.create({
    contentContainer: {
      flex: 1,
      alignItems: "center",
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
      backgroundColor: colorScheme === "dark" ? "#1C1C1E" : "#fff",
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 13,
      resizeMode: "cover",
      position: "absolute",
      opacity: 0.5,
    },
    title: {
      fontSize: 20,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#fff" : "#000",
      marginVertical: 10,
    },
    activityIndicator: {
      marginVertical: 10,
    },
    resultTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#fff" : "#000",
      marginVertical: 10,
    },
    mealTypeTag: {
      backgroundColor: colorScheme === "dark" ? "#333" : "#e0e0e0",
      borderRadius: 20,
      paddingVertical: 5,
      paddingHorizontal: 10,
      alignSelf: "flex-start",
    },
    mealTypeText: {
      color: colorScheme === "dark" ? "#fff" : "#000",
      fontSize: 14,
    },
    ingredientItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 10,
      borderBottomWidth: 1,
      borderBottomColor: "#ccc",
    },
    ingredientNameContainer: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "70%",
    },
    ingredientText: {
      color: colorScheme === "dark" ? "#fff" : "#000",
      fontWeight: "normal",
      fontSize: 16,
      marginRight: 5,
      width: 180,
    },
    caloriesText: {
      color: "#FF4500",
      fontWeight: "bold",
      fontSize: 14,
    },
    switchStyle: {
      marginLeft: 45,
    },
    addButton: {
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      width: "90%",
    },
    addButtonText: {
      color: "#FFF",
      fontSize: 18,
    },
  });
