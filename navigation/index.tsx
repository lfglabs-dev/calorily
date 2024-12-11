import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Upload from "../components/screens/Upload";

const Stack = createStackNavigator();

export default function App() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Upload"
        component={Upload}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
