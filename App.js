import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { TouchableOpacity } from "react-native"; // Add this import
import HomeScreen from "./screens/HomeScreen";
import NoteEditor from "./screens/NoteEditorScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Notes" }} />
        <Stack.Screen name="NoteEditor" component={NoteEditor} options={{ title: "Edit Note" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
