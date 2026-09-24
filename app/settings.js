import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { supabase } from "../utils/supabase";

export default function Settings() {
  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#93c5fd",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 16,
  },
});
