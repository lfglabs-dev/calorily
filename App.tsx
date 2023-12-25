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
import { ApplicationSettingsProvider } from "./shared/ApplicationSettingsContext";

const Tab = createBottomTabNavigator();
export const ApplicationSettingsContext = createContext({
  dailyGoals: {
    caloriesIn: 2500,
    caloriesOut: 500,
  },
});

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? DarkTheme : DefaultTheme;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ApplicationSettingsProvider>
        <NavigationContainer theme={theme}>
          <StatusBar style="auto" />
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
              name="Progress"
              component={Progress}
              options={{
                headerShown: false,
                tabBarIcon: ({ color, size }) => (
                  <FontAwesome name="area-chart" color={color} size={size} />
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
      </ApplicationSettingsProvider>
    </GestureHandlerRootView>
  );
}
