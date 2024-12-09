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
import Progress from "./components/screens/Progress";
import Summary from "./components/screens/Summary";
import Settings from "./components/screens/Settings";
import MealsLibrary from "./components/screens/MealsLibrary";
import { ApplicationSettingsProvider } from "./shared/ApplicationSettingsContext";
import { MealsDatabaseProvider } from "./shared/MealsStorageContext";
import { HealthDataProvider } from "./shared/HealthDataContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Paywall from "./components/screens/Paywall";
import { AuthProvider, useAuth } from "./shared/AuthContext";
import LoginScreen from "./components/screens/LoginScreen";

const Tab = createBottomTabNavigator();

const SummaryStack = createNativeStackNavigator();

function SummaryStackScreen() {
  return (
    <SummaryStack.Navigator screenOptions={{ headerShown: false }}>
      <SummaryStack.Screen name="SummaryScreen" component={Summary} />
      <SummaryStack.Screen name="MealsLibrary" component={MealsLibrary} />
    </SummaryStack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(
    undefined
  );
  const [isLoginComplete, setIsLoginComplete] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

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

  // Show login screen if not authenticated
  if (isLoading) {
    return <LoginScreen onComplete={() => setIsLoginComplete(true)} />;
  }

  if (!isAuthenticated && !isLoginComplete) {
    return <LoginScreen onComplete={() => setIsLoginComplete(true)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {isSubscribed === false ? (
        <Paywall
          onSubscribe={handleSubscribe}
          setIsSubscribed={setIsSubscribed}
        />
      ) : (
        <ApplicationSettingsProvider>
          <MealsDatabaseProvider>
            <HealthDataProvider>
              <NavigationContainer theme={theme}>
                <StatusBar style="auto" />
                <Tab.Navigator>
                  <Tab.Screen
                    name="Summary"
                    component={SummaryStackScreen}
                    options={{
                      headerShown: false,
                      tabBarIcon: ({ color, size }) => (
                        <FontAwesome name="cutlery" color={color} size={size} />
                      ),
                    }}
                  />
                  <Tab.Screen
                    name="Progress"
                    component={Progress}
                    options={{
                      headerShown: false,
                      tabBarIcon: ({ color, size }) => (
                        <FontAwesome
                          name="area-chart"
                          color={color}
                          size={size}
                        />
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
              </NavigationContainer>
            </HealthDataProvider>
          </MealsDatabaseProvider>
        </ApplicationSettingsProvider>
      )}
    </GestureHandlerRootView>
  );
}
