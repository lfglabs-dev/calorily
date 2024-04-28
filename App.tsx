import React, { createContext, useEffect, useState } from "react";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Progress from "./components/screens/Progress";
import Summary from "./components/screens/Summary";
import Settings from "./components/screens/Settings";
import MealsLibrary from "./components/screens/MealsLibrary";
import {
  ApplicationSettingsProvider,
  useApplicationSettings,
} from "./shared/ApplicationSettingsContext";
import { MealsDatabaseProvider } from "./shared/MealsStorageContext";
import { HealthDataProvider } from "./shared/HealthDataContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Purchases, { PurchasesPackage } from "react-native-purchases";
import Paywall from "./components/screens/Paywall";

const Tab = createBottomTabNavigator();
export const ApplicationSettingsContext = createContext({});

const SummaryStack = createNativeStackNavigator();

function SummaryStackScreen() {
  return (
    <SummaryStack.Navigator screenOptions={{ headerShown: false }}>
      <SummaryStack.Screen name="SummaryScreen" component={Summary} />
      <SummaryStack.Screen name="MealsLibrary" component={MealsLibrary} />
    </SummaryStack.Navigator>
  );
}

export default function SettingsWrapper() {
  return (
    <ApplicationSettingsProvider>
      <App />
    </ApplicationSettingsProvider>
  );
}

function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  const { settings } = useApplicationSettings();
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const getPackages = async () => {
      // Uncomment and implement your package fetching logic here.
      // const offerings = await Purchases.getOfferings();
      // if (offerings.current !== null) {
      //   const _packages = offerings.current.availablePackages;
      //   // Showcase various options
      //   const entitlements = await Purchases.getCustomerInfo();
      //   setIsSubscribed(entitlements.entitlements.active !== undefined);
      // }
    };

    setIsSubscribed(settings.subscribed);
    getPackages();
  }, [settings]);

  const handleSubscribe = async (chosenPackage: PurchasesPackage) => {
    const purchase = await Purchases.purchasePackage(chosenPackage);
    const entitlements = await Purchases.getCustomerInfo();
    if (entitlements.entitlements.active !== undefined) {
      setIsSubscribed(true);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {!isSubscribed ? (
        <Paywall onSubscribe={handleSubscribe} />
      ) : (
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
      )}
    </GestureHandlerRootView>
  );
}
