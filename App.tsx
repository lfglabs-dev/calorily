import React, { useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Summary from "./components/screens/Summary";
import Settings from "./components/screens/Settings";
import MealsLibrary from "./components/screens/MealsLibrary";
import { ApplicationSettingsProvider } from "./shared/ApplicationSettingsContext";
import { MealsDatabaseProvider } from "./shared/MealsStorageContext";
import { HealthDataProvider } from "./shared/HealthDataContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Subscription from "./components/screens/onboarding/Subscription";
import { AuthProvider, useAuth } from "./shared/AuthContext";
import Login from "./components/screens/onboarding/Login";
import { WebSocketProvider } from "./shared/WebSocketContext";
import { useSharing } from "./hooks/useSharing";
import { OnboardingProvider, useOnboarding } from "./shared/OnboardingContext";
import GoalSelection from "./components/screens/onboarding/GoalSelection";
import HealthPermissions from "./components/screens/onboarding/HealthPermissions";
import LoadingScreen from "./components/screens/onboarding/LoadingScreen";
import PromoCode from "./components/screens/onboarding/PromoCode";
import { RootStackParamList, MainTabParamList } from "./navigation/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SubscriptionProvider,
  useSubscription,
} from "./shared/SubscriptionContext";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

export default function App() {
  return (
    <HealthDataProvider>
      <ApplicationSettingsProvider>
        <OnboardingProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </OnboardingProvider>
      </ApplicationSettingsProvider>
    </HealthDataProvider>
  );
}

const SubscriptionScreen = () => {
  const { handleSubscribe, setIsSubscribed } = useSubscription();
  return (
    <Subscription
      onSubscribe={handleSubscribe}
      setIsSubscribed={setIsSubscribed}
    />
  );
};

function AppContent() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(true);
  const { isAuthenticated } = useAuth();
  const { hasCompletedOnboarding } = useOnboarding();

  // Configure Purchases
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        // First try to get cached status
        const cachedStatus = await AsyncStorage.getItem("subscription_status");
        console.log("cachedStatus:", cachedStatus);
        if (cachedStatus) {
          setIsSubscribed(cachedStatus === "true");
        }

        // Then check with server
        const info = await Purchases.getCustomerInfo();
        const offerings = await Purchases.getOfferings();
        const newStatus =
          !Boolean(offerings?.current?.availablePackages) ||
          (info.entitlements.active !== undefined &&
            Object.keys(info.entitlements.active).length > 0);

        setIsSubscribed(newStatus);
        await AsyncStorage.setItem("subscription_status", newStatus.toString());
      } catch (error) {
        console.error("Error fetching offerings:", error);
        setIsSubscribed(true); // Default to true in case of error
      }
    };

    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    const apiKey = Platform.select({
      ios: "appl_COIKdnlfZBhFYGEJZtloMNajqdr",
      android: "todo_google_api_key",
    });
    if (apiKey) {
      Purchases.configure({ apiKey });
      checkSubscription();
    }
  }, []);

  // Configure Purchases
  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    const apiKey = Platform.select({
      ios: "appl_COIKdnlfZBhFYGEJZtloMNajqdr",
      android: "todo_google_api_key",
    });
    if (apiKey) {
      Purchases.configure({ apiKey });
      const getPackages = async () => {
        try {
          const info = await Purchases.getCustomerInfo();
          const offerings = await Purchases.getOfferings();
          console.log("Checking subscription status...");
          setIsSubscribed(
            !Boolean(offerings?.current?.availablePackages) ||
              (info.entitlements.active !== undefined &&
                Object.keys(info.entitlements.active).length > 0)
          );
        } catch (error) {
          console.error("Error fetching offerings:", error);
          setIsSubscribed(true); // Default to true in case of error to allow app access
        }
      };

      getPackages();
    }
  }, []);

  const handleSubscribe = async (chosenPackage: PurchasesPackage) => {
    try {
      await Purchases.purchasePackage(chosenPackage);
      const entitlements = await Purchases.getCustomerInfo();
      if (entitlements.entitlements.active !== undefined) {
        setIsSubscribed(true);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
    }
  };

  // Show onboarding flow if not completed OR not authenticated
  console.log(hasCompletedOnboarding, isAuthenticated, isSubscribed);
  if (
    !hasCompletedOnboarding ||
    !isAuthenticated ||
    isSubscribed === undefined
  ) {
    console.log("Showing onboarding flow due to:", {
      hasCompletedOnboarding,
      isAuthenticated,
      isSubscribed,
    });
    return (
      <SubscriptionProvider
        handleSubscribe={handleSubscribe}
        setIsSubscribed={setIsSubscribed}
      >
        <NavigationContainer theme={theme}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="GoalSelection" component={GoalSelection} />
            <Stack.Screen
              name="HealthPermissions"
              component={HealthPermissions}
            />
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Loading" component={LoadingScreen} />
            <Stack.Screen name="PromoCode" component={PromoCode} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SubscriptionProvider>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isSubscribed === false ? (
        <Subscription
          onSubscribe={handleSubscribe}
          setIsSubscribed={setIsSubscribed}
        />
      ) : (
        <ApplicationSettingsProvider>
          <WebSocketProvider>
            <MealsDatabaseProvider>
              <HealthDataProvider>
                <NavigationContainer theme={theme}>
                  <StatusBar style="auto" />
                  <SharingHandler />
                  <Stack.Navigator>
                    <Stack.Screen
                      name="MainTabs"
                      component={TabNavigator}
                      options={{ headerShown: false }}
                    />
                  </Stack.Navigator>
                </NavigationContainer>
              </HealthDataProvider>
            </MealsDatabaseProvider>
          </WebSocketProvider>
        </ApplicationSettingsProvider>
      )}
    </GestureHandlerRootView>
  );
}

const SharingHandler = () => {
  useSharing();
  return null;
};

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Summary"
        component={Summary}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cutlery" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Library"
        component={MealsLibrary}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="book" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
