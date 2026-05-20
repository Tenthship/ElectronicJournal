import { Pressable, StyleSheet, Text, View } from "react-native";

export default function SearchButton({ submitSearch }) {
  return (
    <View>
      <Pressable style={styles.button} onPress={submitSearch}>
        <Text style={styles.text}>Submit</Text>
      </Pressable>
    </View>
  );
}

// SearchButton styles

const styles = StyleSheet.create({
  button: {
    width: 220,
    alignSelf: "center",

    backgroundColor: "#5c6b73",
    paddingVertical: 16,
    borderRadius: 16,

    alignItems: "center",
    justifyContent: "center",

    marginTop: 12,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 4,
  },

  text: {
    color: "#f8f6f2",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
