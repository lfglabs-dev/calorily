import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Goal =
  | "LOSE_WEIGHT"
  | "BUILD_MUSCLE"
  | "EAT_HEALTHIER"
  | "TRACK_DATA"
  | "CALORIC_AWARENESS"
  | "POST_WORKOUT";

interface OnboardingContextType {
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => Promise<void>;
  selectedGoals: Goal[];
  setSelectedGoals: (goals: Goal[]) => void;
  hasHealthPermissions: boolean;
  setHasHealthPermissions: (value: boolean) => void;
  resetOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(false);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [hasHealthPermissions, setHasHealthPermissions] =
    useState<boolean>(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const status = await AsyncStorage.getItem("onboarding_completed");
      setHasCompletedOnboarding(status === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    }
  };

  const updateOnboardingStatus = async (value: boolean) => {
    try {
      await AsyncStorage.setItem("onboarding_completed", value.toString());
      setHasCompletedOnboarding(value);
    } catch (error) {
      console.error("Error updating onboarding status:", error);
    }
  };

  const resetOnboarding = async () => {
    try {
      await AsyncStorage.removeItem("onboarding_completed");
      setHasCompletedOnboarding(false);
      setSelectedGoals([]);
      setHasHealthPermissions(false);
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  };

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedOnboarding,
        setHasCompletedOnboarding: updateOnboardingStatus,
        selectedGoals,
        setSelectedGoals,
        hasHealthPermissions,
        setHasHealthPermissions,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
