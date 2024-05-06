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
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const [isSubscribed, setIsSubscribed] = useState<boolean>();

  // Configure Purchases
  useEffect(() => {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.VERBOSE);
    const apiKey = Platform.select({
      ios: "appl_COIKdnlfZBhFYGEJZtloMNajqdr",
      android: "todo_google_api_key",
    });
    if (apiKey) {
      Purchases.configure({ apiKey });
      if (__DEV__) {
        console.log("dev build detected, skipping subscription check");
        setIsSubscribed(true);
        return;
      }
      const getPackages = async () => {
        try {
          const info = await Purchases.getCustomerInfo();
          const offerings = await Purchases.getOfferings();
          // set to false if some packages are available and users has no entitlements
          setIsSubscribed(
            !Boolean(offerings?.current?.availablePackages) ||
              (info.entitlements.active !== undefined &&
                Object.keys(info.entitlements.active).length > 0)
          );
        } catch (error) {
          console.error("Error fetching offerings:", error);
          setIsSubscribed(true);
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

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!isSubscribed ? (
        isSubscribed === false ? (
          <Paywall onSubscribe={handleSubscribe} />
        ) : null // if isSubscribed not loaded, display nothing
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
