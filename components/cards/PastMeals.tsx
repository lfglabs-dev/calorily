import React, { useEffect, useRef, useMemo, useState } from "react";
import PagerView from "react-native-pager-view";
import { StyleSheet, View } from "react-native";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import PastMealCard from "./pastmeals/PastMealCard";
import EmptyMealCard from "./pastmeals/NoMealCard";
import LoadingMealCard from "./pastmeals/LoadingMealCard";
import FailedMealCard from "./pastmeals/FailedMealCard";
import LongTextInputDialog from "../addmeal/FixBugDialog";
import { useAuth } from "../../shared/AuthContext";
import { StoredMeal, OptimisticMeal } from "../../types";

const PastMeals = ({
  onMealPress,
}: {
  onMealPress: (meal: StoredMeal) => void;
}) => {
  const { dailyMeals, updateMeal } = useMealsDatabase();
  const { jwt } = useAuth();
  const sliderRef = useRef<PagerView>(null);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<StoredMeal | null>(null);
  const initialPage = Math.max(0, dailyMeals.length - 1);

  const handleFeedback = (feedback: string) => {
    if (!selectedMeal) return;

    const previousStatus = selectedMeal.status;
    const previousErrorMessage = selectedMeal.error_message;

    updateMeal({
      meal_id: selectedMeal.meal_id,
      status: "analyzing",
      error_message: null,
    });

    setDialogVisible(false);
    setSelectedMeal(null);

    fetch("https://api.calorily.com/meals/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        meal_id: selectedMeal.meal_id,
        feedback,
      }),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.text();
        if (data) {
          console.log("Feedback submitted successfully:", data);
        }
      })
      .catch((error) => {
        console.error("Error submitting feedback:", error);
        updateMeal({
          meal_id: selectedMeal.meal_id,
          status: previousStatus,
          error_message: previousErrorMessage,
        });
      });
  };

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

  const handleFailedMeal = (meal: StoredMeal) => {
    setSelectedMeal(meal);
    setDialogVisible(true);
  };

  const renderMeal = (meal: OptimisticMeal) => {
    switch (meal.status) {
      case "uploading":
      case "analyzing":
        return <LoadingMealCard meal={meal} />;
      case "complete":
        return <PastMealCard meal={meal} onPress={() => onMealPress(meal)} />;
      case "error":
        return <FailedMealCard meal={meal} onFeedback={handleFailedMeal} />;
      default:
        return null;
    }
  };

  return (
    <>
      <PagerView
        ref={sliderRef}
        style={carouselStyles.pagerView}
        initialPage={initialPage}
        overdrag={true}
      >
        {dailyMeals.length > 0 ? (
          sortedMeals.map((meal) => (
            <View key={meal.meal_id}>{renderMeal(meal)}</View>
          ))
        ) : (
          <View key="empty">
            <EmptyMealCard />
          </View>
        )}
      </PagerView>

      <LongTextInputDialog
        visible={dialogVisible}
        onClose={() => {
          setDialogVisible(false);
          setSelectedMeal(null);
        }}
        onSubmit={handleFeedback}
      />
    </>
  );
};

export default PastMeals;
