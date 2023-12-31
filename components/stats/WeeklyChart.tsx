import React from "react";
import { Text, View, StyleSheet, useColorScheme } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { LinearGradient, useFont, vec } from "@shopify/react-native-skia";
import { useMealsDatabase } from "../../shared/MealsStorageContext";
import { getDailyCalories, totalCalories } from "../../utils/food";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useHealthData } from "../../shared/HealthDataContext";
import { useApplicationSettings } from "../../shared/ApplicationSettingsContext";

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

const WeeklyCalories = () => {
  const font = useFont(require("../../assets/SFProText-Regular.ttf"), 12);
  const scheme = useColorScheme();
  const { settings } = useApplicationSettings();
  const { weeklyMeals } = useMealsDatabase();
  const { weeklyActivity } = useHealthData();
  const dailyCalories = getDailyCalories(weeklyMeals);

  const getLast7DaysCaloriesIn = () => {
    return Array.from({ length: 7 })
      .map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toISOString().split("T")[0];
      })
      .reverse();
  };

  const last7Days = getLast7DaysCaloriesIn();

  const data = last7Days.map((date) => {
    const dailyIntake = dailyCalories[date]
      ? totalCalories(dailyCalories[date])
      : 0;
    const dailyActivityBurn =
      weeklyActivity.find(
        (activity) => activity.startDate.split("T")[0] === date
      )?.value || 0;
    const caloricChange =
      dailyIntake -
      (settings.metabolicData.basalMetabolicRate + dailyActivityBurn);
    console.log("value:", date, caloricChange);

    return {
      date,
      caloricChange,
    };
  });

  console.log(data);

  const lightLinesColor = "gray";
  const linesColor = "gray";
  const minY = Math.min(...data.map((item) => item.caloricChange));
  const maxY = Math.max(...data.map((item) => item.caloricChange));
  console.log(minY, maxY);
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
        Weekly caloric change
      </Text>

      {weeklyMeals.length === 0 ? (
        <View
          style={{
            borderRadius: 10,
            width: "100%",
            height: 200,
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
            height: 200,
          }}
        >
          <CartesianChart
            data={data}
            xKey="date"
            yKeys={["caloricChange"]}
            domainPadding={{ left: 50, right: 50, top: 30 }}
            domain={{ y: [minY, maxY] }}
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
                points={points.caloricChange}
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
