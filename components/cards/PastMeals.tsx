import React, { useEffect, useRef } from "react";
import PagerView from "react-native-pager-view";
import {
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
  ImageBackground,
  View,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { calculateCalories } from "../../utils/food";

function getMealColor(scheme, mealType) {
  const colorsDark = {
    Breakfast: "#00b894",
    Lunch: "#0984e3",
    Dinner: "#fdcb6e",
    Snacks: "#6c5ce7",
  };

  const colorsLight = {
    Breakfast: "#55efc4",
    Lunch: "#74b9ff",
    Dinner: "#ffeaa7",
    Snacks: "#a29bfe",
  };

  if (scheme === "dark") {
    return colorsDark[mealType] || "#e84393";
  } else {
    return colorsLight[mealType] || "#fd79a8";
  }
}

const PastMealCard = ({ meal }) => {
  const scheme = useColorScheme();
  const { deleteMealById } = useMealsDatabase();

  const formatDate = (timestamp) => {
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
    badge: {
      backgroundColor: getMealColor(scheme, meal.type),
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      marginTop: 5,
      alignSelf: "flex-start",
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
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      marginTop: 10,
      position: "absolute",
      bottom: 10,
      right: 10,
    },
    dateText: {
      color: scheme === "dark" ? "#000" : "#FFF",
      fontSize: 14,
    },
  });

  const handleDelete = () => {
    deleteMealById(meal.id);
  };

  return (
    <ImageBackground
      source={{ uri: meal.image_path }}
      style={{ marginHorizontal: 20, height: "100%" }}
      resizeMode="cover"
      imageStyle={cardStyles.card}
    >
      <View
        style={{
          padding: 20,
          height: "100%",
        }}
      >
        <TouchableOpacity style={cardStyles.closeButton} onPress={handleDelete}>
          <FontAwesome name="close" size={24} color="#A9A9A9" />
        </TouchableOpacity>
        <Text style={cardStyles.title}>{meal.name}</Text>
        <View style={cardStyles.badge}>
          <Text style={cardStyles.badgeText}>{meal.type}</Text>
        </View>
        <View style={cardStyles.detailRow}>
          <Text style={cardStyles.fieldName}>Carbs:</Text>
          <Text style={cardStyles.fieldValue}>{meal.carbs.toFixed(1)}g</Text>
        </View>
        <View style={cardStyles.detailRow}>
          <Text style={cardStyles.fieldName}>Proteins:</Text>
          <Text style={cardStyles.fieldValue}>{meal.proteins.toFixed(1)}g</Text>
        </View>
        <View style={cardStyles.detailRow}>
          <Text style={cardStyles.fieldName}>Fats:</Text>
          <Text style={cardStyles.fieldValue}>{meal.fats.toFixed(1)}g</Text>
        </View>
        <View style={cardStyles.detailRow}>
          <Text style={cardStyles.fieldName}>Calories:</Text>
          <Text style={cardStyles.fieldValue}>
            {+calculateCalories(meal).toFixed(1)} kcal
          </Text>
        </View>
        <View style={cardStyles.dateBadge}>
          <Text style={cardStyles.dateText}>{formatDate(meal.timestamp)}</Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const PastMeals = () => {
  const { dailyMeals } = useMealsDatabase();
  const sliderRef = useRef<PagerView>(null);
  const initialPage = dailyMeals.length - 1;

  useEffect(() => {
    if (dailyMeals.length !== 0)
      sliderRef.current.setPage(dailyMeals.length - 1);
  }, [dailyMeals]);

  const carouselStyles = StyleSheet.create({
    pagerView: {
      flex: 1,
      marginRight: -20,
      marginLeft: -20,
    },
  });

  return (
    <PagerView
      ref={sliderRef}
      style={carouselStyles.pagerView}
      initialPage={initialPage}
    >
      {dailyMeals
        .sort((a, b) => a.timestamp - b.timestamp)
        .map((meal, index) => (
          <PastMealCard key={index.toString()} meal={meal} />
        ))}
    </PagerView>
  );
};

export default PastMeals;
