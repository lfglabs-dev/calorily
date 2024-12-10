import React from "react";
import { Text, View, StyleSheet, useColorScheme } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { totalCalories } from "../../utils/food";
import { StoredMeal } from "../../types";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const styles = (scheme) =>
  StyleSheet.create({
    icon: {
      marginBottom: 10,
      color: scheme === "dark" ? "#A9A9A9" : "#606060",
    },
    text: {
      color: scheme === "dark" ? "#FFF" : "#000",
      fontSize: 18,
    },
  });

// Helper function to group meals by day
const getDailyCalories = (
  meals: StoredMeal[]
): { [day: string]: StoredMeal[] } => {
  const mealsByDay: { [day: string]: StoredMeal[] } = {};

  meals.forEach((meal) => {
    const date = new Date(meal.created_at * 1000);
    const dayKey = date.toISOString().split("T")[0];

    if (!mealsByDay[dayKey]) {
      mealsByDay[dayKey] = [];
    }

    mealsByDay[dayKey].push(meal);
  });

  return mealsByDay;
};

const WeeklyCalories = () => {
  const font = useFont(require("../../assets/SFProText-Regular.ttf"), 12);
  const scheme = useColorScheme();
  const { weeklyMeals } = useMealsDatabase();
  const dailyCalories = getDailyCalories(weeklyMeals);

  // Function to generate last 7 dates
  const getLast7Days = () => {
    return Array.from({ length: 7 })
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
      })
      .reverse();
  };

  // Merging the last 7 days with dailyCalories data
  const last7Days = getLast7Days();
  const data = last7Days.map((date) => ({
    date,
    calorieCount: dailyCalories[date] ? totalCalories(dailyCalories[date]) : 0,
  }));

  const lightLinesColor = "gray";
  const linesColor = "gray";

  return (
    <>
      <Text
        style={{
          color: scheme === "dark" ? "#AAA" : "#333",
          fontSize: 13,
          textTransform: "uppercase",
          paddingBottom: 15,
        }}
      >
        Weekly calories in
      </Text>

      {weeklyMeals.length === 0 ? (
        <View
          style={{
            borderRadius: 10,
            width: "100%",
            height: 160,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
          }}
        >
          <FontAwesome name="bar-chart" size={40} style={styles(scheme).icon} />
          <Text style={styles(scheme).text}>No data available</Text>
        </View>
      ) : (
        <View
          style={{
            borderRadius: 10,
            backgroundColor: scheme === "dark" ? "#1C1C1E" : "#FFF",
            paddingLeft: 7,
            paddingRight: 12,
            paddingBottom: 6,
            paddingTop: 15,
            marginBottom: 0,
            width: "100%",
            height: 160,
          }}
        >
          <CartesianChart
            data={data}
            xKey="date"
            yKeys={["calorieCount"]}
            domainPadding={{ left: 50, right: 50, top: 30 }}
            axisOptions={{
              lineColor: scheme === "dark" ? linesColor : lightLinesColor,
              labelColor: scheme === "dark" ? linesColor : lightLinesColor,
              font,
              formatXLabel(value) {
                const date = new Date(value);
                return date
                  .toLocaleDateString("en-US", { weekday: "long" })
                  .split(",")[0];
              },
            }}
          >
            {({ points, chartBounds }) => (
              <Bar
                chartBounds={chartBounds}
                points={points.calorieCount}
                roundedCorners={{
                  topLeft: 5,
                  topRight: 5,
                }}
              >
                <LinearGradient
                  start={vec(0, 0)}
                  end={vec(0, 400)}
                  colors={["#a78bfa", "#1E8BFA00"]}
                />
              </Bar>
            )}
          </CartesianChart>
        </View>
      )}
    </>
  );
};

export default WeeklyCalories;
