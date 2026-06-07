import { useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function SearchBar({
  value,
  onChange,
  hasAI,
  aiSearchFunction,
}) {
  const [isNormalSearch, setIsNormalSearch] = useState(true);

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        value={value}
        onChangeText={onChange}
        placeholder={isNormalSearch ? "Search..." : "AI Search..."}
        returnKeyType="done"
        onSubmitEditing={() => Keyboard.dismiss()}
      />

      {hasAI && (
        <>
          <Pressable
            style={styles.enterButton}
            onPress={() => Keyboard.dismiss()}
          >
            <Text style={styles.buttonText}>↵</Text>
          </Pressable>

          <Pressable
            style={styles.searchButton}
            onPress={() => {
              setIsNormalSearch(!isNormalSearch);
              aiSearchFunction?.();
            }}
          >
            <Text style={styles.buttonText}>🤖</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    position: "relative",
    marginHorizontal: 16,
  },

  searchInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingVertical: 12,
    paddingLeft: 12,
    paddingRight: 80,
    fontSize: 16,
  },

  enterButton: {
    position: "absolute",
    right: 45,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },

  searchButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    width: 24,
  },

  buttonText: {
    fontSize: 18,
  },
});
