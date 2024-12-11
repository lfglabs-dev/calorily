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
import Paywall from "./components/screens/Paywall";
import { AuthProvider, useAuth } from "./shared/AuthContext";
import LoginScreen from "./components/screens/LoginScreen";
import { WebSocketProvider } from "./shared/WebSocketContext";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useSharing } from "./hooks/useSharing";
import Upload from "./components/screens/Upload";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
                    <Stack.Screen
                      name="Upload"
                      component={Upload}
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
