import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function VoiceCircle({ startRecording, stopRecording }) {
  const [isRecording, setIsRecording] = useState(false);
  const beginRecording = () => {
    startRecording();
    setIsRecording(!isRecording);
  };
  const endRecording = () => {
    stopRecording();
    setIsRecording(!isRecording);
  };
  return (
    <Pressable
      style={styles.Circle}
      onPress={isRecording ? endRecording : beginRecording}
    >
      <Text>{isRecording ? "Recording..." : "Start Recording"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  Circle: {
    width: 140,
    height: 140,
    borderRadius: 70,

    backgroundColor: "#4a90e2",

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#4a90e2",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,

    elevation: 10,
  },
});
