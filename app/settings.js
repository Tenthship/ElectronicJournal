import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../utils/AuthContext";
import { supabase } from "../utils/supabase";
import { colors } from "../utils/theme";

export default function Settings() {
  const { user } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut();
    setSigningOut(false);

    if (error) {
      Alert.alert("Sign out failed", error.message);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Signed in as</Text>
          <Text style={styles.cardValue}>{user?.email || "Unknown"}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Pocket Journal</Text>
          <Text style={styles.cardValue}>
            A place for thoughts, tasks, and reminders.
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.signOutButton, signingOut && styles.disabled]}
        onPress={handleSignOut}
        disabled={signingOut}
      >
        <Text style={styles.signOutText}>
          {signingOut ? "Signing out..." : "Sign out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.navy,
    padding: 24,
    paddingTop: 64,
  },

  h1: {
    color: colors.cream,
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 28,
  },

  section: {
    marginBottom: 22,
  },

  sectionLabel: {
    color: "#A79C88",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },

  card: {
    backgroundColor: colors.navyAlt,
    borderRadius: 16,
    padding: 16,
  },

  cardLabel: {
    color: "#A79C88",
    fontSize: 12,
    marginBottom: 4,
  },

  cardValue: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: "600",
  },

  signOutButton: {
    marginTop: 12,
    backgroundColor: colors.gold,
    padding: 14,
    borderRadius: 14,
    alignItems: "center",
  },

  disabled: {
    opacity: 0.6,
  },

  signOutText: {
    color: colors.navy,
    fontWeight: "800",
    fontSize: 16,
  },
});
