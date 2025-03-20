import { Tabs } from "expo-router";
import { StyleSheet, View, Pressable } from "react-native";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import HUD from "../../components/HUD";

export default function RootLayout() {
  const [selectedAgent, setSelectedAgent] = useState("None");
  const [showAgentList, setShowAgentList] = useState(false);

  return (
    <View style={styles.container}>
      <HUD 
        selectedAgent={selectedAgent}
        setSelectedAgent={setSelectedAgent}
        showAgentList={showAgentList}
        setShowAgentList={setShowAgentList}
      />
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
          tabBarItemStyle: {
            backgroundColor: 'transparent', // Prevent background color changes
          },
          tabBarButton: (props) => (
            <Pressable
              {...props}
              android_ripple={{ color: 'transparent' }}
              style={(state) => {
                // Get the base style (either function result or direct style)
                const baseStyle = typeof props.style === 'function' ? props.style(state) : props.style;
                
                // Apply our modifications while preserving the original layout properties
                return {
                  ...baseStyle,
                  opacity: 1, // Prevent opacity changes on press
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                };
              }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="workspace"
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="workspaces-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ai"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
