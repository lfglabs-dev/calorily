import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { View, Animated } from "react-native";

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
  isSubscribed: boolean;
  setIsSubscribed: (value: boolean) => Promise<void>;
  isLoading: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(
  undefined
);

const LoadingView = () => (
  <View
    style={{
      position: "absolute",
      backgroundColor: "#000", // Or match your app's background
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}
  />
);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] =
    useState<boolean>(true);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [hasHealthPermissions, setHasHealthPermissions] =
    useState<boolean>(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const [onboardingStatus, subscriptionStatus] = await Promise.all([
          AsyncStorage.getItem("onboarding_completed"),
          AsyncStorage.getItem("subscription_status"),
        ]);

        setHasCompletedOnboarding(onboardingStatus === "true");
        setIsSubscribed(subscriptionStatus !== "false");

        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }).start(() => setIsLoading(false));
      } catch (error) {
        console.error("Error initializing app:", error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

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
    <>
      <OnboardingContext.Provider
        value={{
          hasCompletedOnboarding: isLoading ? true : hasCompletedOnboarding,
          setHasCompletedOnboarding: updateOnboardingStatus,
          selectedGoals,
          setSelectedGoals,
          hasHealthPermissions,
          setHasHealthPermissions,
          resetOnboarding,
          isSubscribed,
          setIsSubscribed: async (value) => {
            await AsyncStorage.setItem("subscription_status", value.toString());
            setIsSubscribed(value);
          },
          isLoading,
        }}
      >
        {children}
      </OnboardingContext.Provider>
      {isLoading && (
        <Animated.View
          style={{
            position: "absolute",
            backgroundColor: "#000",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: fadeAnim,
          }}
        />
      )}
    </>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
};
