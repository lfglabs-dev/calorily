import React, { useEffect, useRef, useMemo } from "react";
import PagerView from "react-native-pager-view";
import { StyleSheet } from "react-native";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import PastMealCard from "./pastmeals/PastMealCard";
import EmptyMealCard from "./pastmeals/NoMealCard";
import LoadingMealCard from "./pastmeals/LoadingMealCard";
import FailedMealCard from "./pastmeals/FailedMealCard";
import { StoredMeal, OptimisticMeal } from "../../types";

const PastMeals = ({
  onMealPress,
}: {
  onMealPress: (meal: StoredMeal) => void;
}) => {
  const { dailyMeals } = useMealsDatabase();
  const sliderRef = useRef<PagerView>(null);
  const initialPage = Math.max(0, dailyMeals.length - 1);

  // Memoize meals to prevent unnecessary re-renders
  const sortedMeals = useMemo(
    () => dailyMeals.slice().sort((a, b) => a.created_at - b.created_at),
    [dailyMeals]
  );

  useEffect(() => {
    if (dailyMeals.length > 0) {
      // Small delay to ensure the new meal is rendered
      setTimeout(() => {
        sliderRef.current?.setPage(dailyMeals.length - 1);
      }, 100);
    }
  }, [dailyMeals.length]); // Only trigger when meals count changes

  const carouselStyles = StyleSheet.create({
    pagerView: {
      flex: 1,
      marginRight: -20,
      marginLeft: -20,
    },
  });

  const renderMeal = (meal: OptimisticMeal) => {
    switch (meal.status) {
      case "uploading":
      case "analyzing":
        return <LoadingMealCard meal={meal} />;
      case "complete":
        return <PastMealCard meal={meal} onPress={() => onMealPress(meal)} />;
      case "error":
        return <FailedMealCard meal={meal} />;
      default:
        return null;
    }
  };

  return (
    <PagerView
      ref={sliderRef}
      style={carouselStyles.pagerView}
      initialPage={initialPage}
      overdrag={true}
    >
      {dailyMeals.length > 0 ? (
        sortedMeals.map((meal) => renderMeal(meal))
      ) : (
        <EmptyMealCard key="empty" />
      )}
    </PagerView>
  );
};

export default PastMeals;
