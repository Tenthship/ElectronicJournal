import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { createContext, useState } from "react";

export const EntriesContext = createContext();

export default function Layout() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <EntriesContext.Provider value={{ refreshKey, setRefreshKey }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#111827",
            height: 70,
            paddingBottom: 10,
            paddingTop: 8,
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: "#93c5fd",
          tabBarInactiveTintColor: "#9ca3af",
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="entries"
          options={{
            title: "Entries",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="journal" size={size} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </EntriesContext.Provider>
  );
}
