import React, { useEffect, useRef } from "react";
import PagerView from "react-native-pager-view";
import { StyleSheet } from "react-native";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import PastMealCard from "./pastmeals/PastMealCard";
import EmptyMealCard from "./pastmeals/NoMealCard";
import LoadingMealCard from "./pastmeals/LoadingMealCard";
import { StoredMeal } from "../../types";

const PastMeals = ({
  onMealPress,
}: {
  onMealPress: (meal: StoredMeal) => void;
}) => {
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
          .sort((a, b) => a.created_at - b.created_at)
          .map((meal, index) =>
            meal.status === "analyzing" ? (
              <LoadingMealCard
                mealId={meal.meal_id}
                key={index.toString()}
                imageUri={meal.image_uri}
              />
            ) : (
              <PastMealCard
                key={index.toString()}
                meal={meal}
                onPress={() => onMealPress(meal)}
              />
            )
          )
      ) : (
        <EmptyMealCard key={0} />
      )}
    </PagerView>
  );
};

export default PastMeals;
