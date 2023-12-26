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

const PastMealCard = ({ meal, backgroundColor }) => {
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
      opacity: 0.4,
    },
    title: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 24,
      fontWeight: "bold",
      alignSelf: "flex-start",
      marginBottom: 10,
    },
    badge: {
      backgroundColor: backgroundColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 15,
      marginTop: 5,
      alignSelf: "flex-start",
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
      position: "absolute",
      bottom: 10,
      right: 10,
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
          <Text style={cardStyles.fieldValue}>
            {formatDate(meal.timestamp)}
          </Text>
        </View>
      </View>
    </ImageBackground>
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
  });

  return (
    <PagerView
      ref={sliderRef}
      style={carouselStyles.pagerView}
      initialPage={initialPage}
    >
      {meals.map((meal, index) => (
        <PastMealCard
          key={index.toString()}
          meal={meal}
          backgroundColor={determineBackgroundColor(index)}
        />
      ))}
    </PagerView>
  );
};

const determineBackgroundColor = (index) => {
  return index % 2 === 0 ? "#FFD700" : "#F0E68C";
};

export default MyCarousel;
