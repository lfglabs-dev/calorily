import React from "react";
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

const Bug = ({
  openComment,
  response,
}: {
  openComment: () => void;
  response: string | undefined;
}) => {
  const scheme = useColorScheme();
  const message = response ? response : "An unexpected error occurred";

  const styles = StyleSheet.create({
    contentContainer: {
      flex: 1,
      justifyContent: "space-between",
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#fff",
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 20,
      alignItems: "center",
    },
    scrollViewContainer: {
      flex: 1,
      paddingHorizontal: 20,
    },
    resultTitle: {
      fontSize: 36,
      fontWeight: "bold",
      color: scheme === "dark" ? "#fff" : "#000",
    },
    bugIcon: {
      marginVertical: 20,
      fontSize: 100,
      color: scheme === "dark" ? "#fff" : "#000",
    },
    messageText: {
      fontSize: 18,
      color: scheme === "dark" ? "#fff" : "#000",
    },
    buttonContainer: {
      paddingHorizontal: 20,
    },
    button: {
      alignItems: "center",
      padding: 15,
      borderRadius: 10,
      width: "100%",
      marginBottom: 12,
    },
    mainButton: {
      backgroundColor: scheme === "dark" ? "#1A73E8" : "#007AFF",
    },
    secondaryButton: {
      backgroundColor: scheme === "dark" ? "#343438" : "#dfdfe8",
    },
    buttonText: {
      color: "#FFF",
      fontSize: 18,
    },
  });

  return (
    <View style={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.resultTitle}>Uh oh</Text>
        <Ionicons name="bug" style={styles.bugIcon} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.messageText}>{message}</Text>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={openComment}
        >
          <Text style={styles.buttonText}>Retry with a comment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.mainButton]}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Bug;
