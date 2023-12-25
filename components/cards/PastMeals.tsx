import React, { useEffect, useRef } from "react";
import PagerView from "react-native-pager-view";
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useMealsDatabase } from "../../shared/MealsDatabaseContext";
import { calculateCalories } from "../../utils/food";

const PastMealCard = ({ meal, backgroundColor }) => {
  const scheme = useColorScheme();
  const { deleteMealById } = useMealsDatabase();

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const cardStyles = StyleSheet.create({
    card: {
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF", // Dark theme background color
      borderRadius: 8,
      padding: 20,
      width: "100%",
      height: "100%",
      elevation: 3,
      alignItems: "flex-start",
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 24,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 10, // Increased padding around the title
    },
    badge: {
      backgroundColor: backgroundColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      marginTop: 5,
    },
    badgeText: {
      color: scheme === "dark" ? "#000" : "#FFF",
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
      backgroundColor: "#D3D3D3",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      marginTop: 10,
    },
  });

  const handleDelete = () => {
    deleteMealById(meal.id);
  };

  return (
    <View style={cardStyles.card}>
      <TouchableOpacity style={cardStyles.closeButton} onPress={handleDelete}>
        <FontAwesome
          name="close"
          size={24}
          color="#A9A9A9" // Dark Gray
        />
      </TouchableOpacity>
      <Text style={cardStyles.title}>{meal.name}</Text>
      <View style={cardStyles.badge}>
        <Text style={cardStyles.badgeText}>{meal.type}</Text>
      </View>
      <View style={cardStyles.detailRow}>
        <Text style={cardStyles.fieldName}>Carbs:</Text>
        <Text style={cardStyles.fieldValue}>{meal.carbs}g</Text>
      </View>
      <View style={cardStyles.detailRow}>
        <Text style={cardStyles.fieldName}>Proteins:</Text>
        <Text style={cardStyles.fieldValue}>{meal.proteins}g</Text>
      </View>
      <View style={cardStyles.detailRow}>
        <Text style={cardStyles.fieldName}>Fats:</Text>
        <Text style={cardStyles.fieldValue}>{meal.fats}g</Text>
      </View>
      <View style={cardStyles.detailRow}>
        <Text style={cardStyles.fieldName}>Calories:</Text>
        <Text style={cardStyles.fieldValue}>
          {calculateCalories(meal)} kcal
        </Text>
      </View>
      <View style={cardStyles.dateBadge}>
        <Text style={cardStyles.fieldValue}>{formatDate(meal.timestamp)}</Text>
      </View>
    </View>
  );
};

const MyCarousel = () => {
  const { meals } = useMealsDatabase();
  const sliderRef = useRef<PagerView>(null);
  const initialPage = meals.length - 1;

  useEffect(() => {
    if (meals.length !== 0) sliderRef.current.setPage(meals.length - 1);
  }, [meals]);

  const carouselStyles = StyleSheet.create({
    pagerView: {
      flex: 1,
      marginRight: -20,
      marginLeft: -20,
    },
    page: {
      marginLeft: 20,
      marginRight: 20,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <PagerView
      ref={sliderRef}
      style={carouselStyles.pagerView}
      initialPage={initialPage}
    >
      {meals.map((meal, index) => (
        <View key={index.toString()} style={carouselStyles.page}>
          <PastMealCard
            meal={meal}
            backgroundColor={determineBackgroundColor(index)}
          />
        </View>
      ))}
    </PagerView>
  );
};

const determineBackgroundColor = (index) => {
  // Implement your logic to determine the background color based on the index or meal type
  // Example: return index % 2 === 0 ? '#FFD700' : '#F0E68C';
  return index % 2 === 0 ? "#FFD700" : "#F0E68C";
};

export default MyCarousel;
