import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

export default function VoiceCircle({ startRecording, stopRecording }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const isRecordingRef = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const handlePressIn = async () => {
    isRecordingRef.current = true;

    Animated.spring(scaleAnim, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();

    await startRecording();
  };

  const handlePressOut = async () => {
    isRecordingRef.current = false;

    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 90,
      useNativeDriver: true,
    }).start();

    await stopRecording();
  };

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });

  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.45, 0],
  });

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
      />

      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.circle}
        >
          <Text style={styles.icon}>🎙️</Text>
          <Text style={styles.label}>Hold</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 170,
    height: 170,
    alignItems: "center",
    justifyContent: "center",
  },

  pulseRing: {
    position: "absolute",
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#5c6b73",
  },

  circle: {
    width: 132,
    height: 132,
    borderRadius: 66,
    backgroundColor: "#5c6b73",
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 4,
    borderColor: "#fffdf8",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.18,
    shadowRadius: 14,

    elevation: 8,
  },

  icon: {
    fontSize: 34,
    marginBottom: 4,
  },

  label: {
    color: "#fffdf8",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
