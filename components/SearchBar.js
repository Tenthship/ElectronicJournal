import { useState } from "react";
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors } from "../utils/theme";

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
        placeholderTextColor={colors.inkSoft}
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
  },

  searchInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingLeft: 14,
    paddingRight: 80,
    fontSize: 16,
    color: colors.ink,
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
