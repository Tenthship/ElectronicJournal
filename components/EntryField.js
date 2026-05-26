import { Text, View } from "react-native";

export default function EntryField({ entry }) {
  return (
    <View>
      <Text>{entry.text}</Text>
    </View>
  );
}
