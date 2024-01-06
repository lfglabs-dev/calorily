import React, { createContext } from "react";
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
import { ApplicationSettingsProvider } from "./shared/ApplicationSettingsContext";
import { MealsDatabaseProvider } from "./shared/MealsStorageContext";
import { HealthDataProvider } from "./shared/HealthDataContext";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

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

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  );
}
