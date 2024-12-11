import {
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ImageBackground,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMealsDatabase } from "../../../shared/MealsStorageContext";
import { getMealMacros } from "../../../utils/food";
import { StoredMeal } from "../../../types";

const PastMealCard = ({ meal }: { meal: StoredMeal }) => {
  const scheme = useColorScheme();
  const { deleteMealById } = useMealsDatabase();
  const macros = getMealMacros(meal);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const cardStyles = StyleSheet.create({
    card: {
      borderRadius: 8,
      opacity: 0.35,
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 24,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    badgeText: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 14,
    },
    closeButton: {
      position: "absolute",
      top: 10,
      right: 10,
    },
    detailRow: {
      flexDirection: "row",
      marginTop: 10,
    },
    fieldName: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
      fontWeight: "bold",
    },
    fieldValue: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 16,
      marginLeft: 5,
    },
    dateBadge: {
      backgroundColor:
        scheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      position: "absolute",
      bottom: 11,
      right: 11,
    },
    dateText: {
      color: scheme === "dark" ? "#000" : "#FFF",
      fontSize: 16,
    },
    macroContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        scheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      opacity: 0.8,
      marginTop: 10,
      alignSelf: "flex-start",
    },
    macroGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 15,
    },
    macroItem: {
      flexDirection: "row",
      alignItems: "center",
    },
    macroText: {
      color: scheme === "dark" ? "#000" : "#FFF",
      fontSize: 16,
      marginRight: 2,
      opacity: 0.8,
    },
    macroIcon: {
      opacity: 0.8,
    },
    caloriesContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor:
        scheme === "dark" ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 15,
      position: "absolute",
      bottom: 10,
      left: 10,
      alignSelf: "flex-start",
    },
    caloriesText: {
      color: scheme === "dark" ? "#000" : "#FFF",
      fontSize: 16,
      marginLeft: 6,
      fontWeight: "bold",
    },
    caloriesIcon: {
      marginRight: 2,
    },
  });

  const handleDelete = () => {
    deleteMealById(meal.id);
  };

  const handleCardPress = () => {
    console.log("card clicked");
  };

  return (
    <TouchableOpacity onPress={handleCardPress}>
      <ImageBackground
        source={{ uri: meal.image_uri }}
        style={{ marginHorizontal: 20, height: "100%" }}
        resizeMode="cover"
        imageStyle={cardStyles.card}
      >
        <View style={{ padding: 20, height: "100%" }}>
          <TouchableOpacity
            style={cardStyles.closeButton}
            onPress={handleDelete}
          >
            <FontAwesome name="close" size={24} color="#A9A9A9" />
          </TouchableOpacity>

          <Text style={cardStyles.title}>
            {meal.last_analysis?.meal_name || "Analyzing..."}
          </Text>

          <View style={cardStyles.macroContainer}>
            <View style={cardStyles.macroGroup}>
              <View style={cardStyles.macroItem}>
                <Ionicons name="egg" size={20} style={cardStyles.macroIcon} />
                <Text style={cardStyles.macroText}>
                  {Math.round(macros.proteins)}g
                </Text>
              </View>

              <View style={cardStyles.macroItem}>
                <Ionicons name="pizza" size={20} style={cardStyles.macroIcon} />
                <Text style={cardStyles.macroText}>
                  {Math.round(macros.fats)}g
                </Text>
              </View>

              <View style={cardStyles.macroItem}>
                <Ionicons
                  name="ice-cream"
                  size={20}
                  style={cardStyles.macroIcon}
                />
                <Text style={cardStyles.macroText}>
                  {Math.round(macros.carbs)}g
                </Text>
              </View>
            </View>
          </View>

          <View style={cardStyles.caloriesContainer}>
            <Ionicons
              name="flame"
              size={20}
              color={scheme === "dark" ? "#000" : "#FFF"}
              style={cardStyles.caloriesIcon}
            />
            <Text style={cardStyles.caloriesText}>
              {macros.calories.toFixed(0)} calories
            </Text>
          </View>

          <View style={cardStyles.dateBadge}>
            <Text style={cardStyles.dateText}>
              {formatDate(meal.created_at)}
            </Text>
          </View>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default PastMealCard;
