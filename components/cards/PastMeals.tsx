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
import PastMealCard from "./pastmeals/PastMealCard";
import EmptyMealCard from "./pastmeals/NoMealCard";
import LoadingMealCard from "./pastmeals/LoadingMealCard";

const PastMeals = () => {
  const { dailyMeals } = useMealsDatabase();
  const sliderRef = useRef<PagerView>(null);
  const initialPage = Math.max(0, dailyMeals.length - 1);

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
      {dailyMeals.length > 0 ? (
        dailyMeals
          .sort((a, b) => a.timestamp - b.timestamp)
          .map((meal, index) =>
            meal.status === "analyzing" || meal.status === "pending" ? (
              <LoadingMealCard
                key={index.toString()}
                imageUri={meal.image_uri}
              />
            ) : (
              <PastMealCard key={index.toString()} meal={meal} />
            )
          )
      ) : (
        <EmptyMealCard key={0} />
      )}
    </PagerView>
  );
};

export default PastMeals;
