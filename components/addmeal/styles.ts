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
    ingredientText: {
      color: colorScheme === "dark" ? "#fff" : "#000",
      fontWeight: "normal",
      fontSize: 16,
      marginRight: 5,
      width: 180,
    },
    switchStyle: {
      marginLeft: 45,
    },
    mainButton: {
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#1A73E8" : "#007AFF",
      padding: 15,
      borderRadius: 10,
      width: "90%",
    },
    mainButtonText: {
      color: "#FFF",
      fontSize: 18,
    },
    secondaryButton: {
      alignItems: "center",
      backgroundColor: colorScheme === "dark" ? "#343438" : "#dfdfe8",
      padding: 15,
      borderRadius: 10,
      width: "90%",
      marginBottom: 12,
    },
    secondaryButtonText: {
      color: colorScheme === "dark" ? "#FFF" : "#000",
      fontSize: 18,
    },
    titleContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      gap: 15,
    },
    calories: {
      fontSize: 18,
      color: colorScheme === "dark" ? "#FFF" : "#000",
      opacity: 0.95,
    },
    macroContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(0, 0, 0, 0.5)"
          : "rgba(255, 255, 255, 0.5)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      opacity: 0.8,
      marginBottom: 15,
      alignSelf: "center",
    },
    macroGroup: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 15,
    },
    macroItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    macroText: {
      color: colorScheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
      marginLeft: 6,
      opacity: 0.8,
    },
    macroIcon: {
      opacity: 0.8,
      color: colorScheme === "dark" ? "#FFF" : "#000",
    },
  });
