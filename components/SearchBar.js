import { StyleSheet, TextInput, View } from "react-native";

export default function SearchBar({ value, onChange }) {
  return (
    <View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Search..."
      ></TextInput>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    width: "100%",
    height: 55,
    backgroundColor: "#f8f6f2",
    borderRadius: 16,
    paddingHorizontal: 18,
    color: "#2d2a26",
    fontSize: 16,

    borderWidth: 1,
    borderColor: "#d6cfc2",
  },
});
