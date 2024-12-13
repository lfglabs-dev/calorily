import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Goal, useOnboarding } from "../../../shared/OnboardingContext";

const GOALS: { id: Goal; title: string; description: string }[] = [
  {
    id: "LOSE_WEIGHT",
    title: "Reach a Healthier Weight",
    description: "Adopt sustainable and balanced eating habits",
  },
  {
    id: "BUILD_MUSCLE",
    title: "Build Strength & Muscle",
    description: "Focus on protein and support muscle growth",
  },
  {
    id: "EAT_HEALTHIER",
    title: "Eat Healthier",
    description: "Balance nutrients to feel more energetic",
  },
  {
    id: "TRACK_DATA",
    title: "Understand My Eating Patterns",
    description: "Gain insights into your daily intake and habits",
  },
  {
    id: "CALORIC_AWARENESS",
    title: "Develop Caloric Awareness",
    description: "Learn about portion sizes and nutrition",
  },
  {
    id: "POST_WORKOUT",
    title: "Understand my Body Needs",
    description: "Support healthy recovery to keep you active",
  },
];

export default function GoalSelection({ navigation }) {
  const { selectedGoals, setSelectedGoals } = useOnboarding();
  const scheme = useColorScheme();

  const toggleGoal = (goal: Goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const continueToNextScreen = () => {
    if (selectedGoals.length > 0) {
      navigation.navigate("HealthPermissions");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: scheme === "dark" ? "#000" : "#F2F1F6" },
      ]}
    >
      <Text
        style={[styles.title, { color: scheme === "dark" ? "#FFF" : "#000" }]}
      >
        What's your goal with Calorily?
      </Text>
      <Text
        style={[
          styles.subtitle,
          { color: scheme === "dark" ? "#AAA" : "#666" },
        ]}
      >
        Select all that apply
      </Text>

      {GOALS.map((goal) => (
        <TouchableOpacity
          key={goal.id}
          style={[
            styles.goalButton,
            {
              backgroundColor: selectedGoals.includes(goal.id)
                ? scheme === "dark"
                  ? "#1A73E8"
                  : "#007AFF"
                : scheme === "dark"
                ? "#222"
                : "#EEE",
            },
          ]}
          onPress={() => toggleGoal(goal.id)}
        >
          <Text
            style={[
              styles.goalTitle,
              {
                color: selectedGoals.includes(goal.id)
                  ? "#FFF"
                  : scheme === "dark"
                  ? "#FFF"
                  : "#000",
              },
            ]}
          >
            {goal.title}
          </Text>
          <Text
            style={[
              styles.goalDescription,
              {
                color: selectedGoals.includes(goal.id)
                  ? "#EEE"
                  : scheme === "dark"
                  ? "#AAA"
                  : "#666",
              },
            ]}
          >
            {goal.description}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.continueButton,
          {
            backgroundColor:
              selectedGoals.length > 0
                ? scheme === "dark"
                  ? "#1A73E8"
                  : "#007AFF"
                : scheme === "dark"
                ? "#222"
                : "#EEE",
          },
        ]}
        onPress={continueToNextScreen}
        disabled={selectedGoals.length === 0}
      >
        <Text
          style={[
            styles.continueButtonText,
            {
              color:
                selectedGoals.length > 0
                  ? "#FFF"
                  : scheme === "dark"
                  ? "#666"
                  : "#999",
            },
          ]}
        >
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  goalButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
  },
  continueButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
