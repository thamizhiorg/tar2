import { Tabs } from "expo-router";
import { StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "black",
        tabBarStyle: styles.tabBar,
        headerShown: false,
        tabBarShowLabel: false, // Hide the labels
        tabBarIconStyle: { marginBottom: 0 }, // Remove padding around icons
        tabBarHideOnKeyboard: true,
        tabBarPressColor: 'transparent', // Remove press effect on Android
        tabBarHighlightColor: 'transparent', // Remove highlight color
      }}
    >
      <Tabs.Screen
        name="agents"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="sparkles-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <Feather name="square" size={20} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="play-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="people"
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="at-circle-outline" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    elevation: 0, // Remove shadow on Android
    shadowOpacity: 0, // Remove shadow on iOS
    borderTopWidth: 0.5,
    borderTopColor: '#E0E0E0',
  },
});
