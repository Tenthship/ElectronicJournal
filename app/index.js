import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import React, { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SearchBar from "../components/SearchBar";
import VoiceCircle from "../components/VoiceCircle";
import {
  handleReminder,
  requestNotificationPermission,
} from "../utils/notifications";
import { EntriesContext } from "./_layout";

const ip = "192.168.1.203";

function RecorderSection({ setAudioUri, player, setRefreshKey }) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const submitSearch = async (voiceMessage) => {
    console.log("Recording submitted");
    console.log("Voice Message: ", voiceMessage.transcript);

    const response = await fetch(`http://${ip}:3000/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: voiceMessage.transcript }),
    });

    const savedEntry = await response.json();
    await handleReminder(savedEntry);

    setRefreshKey((prev) => prev + 1);
  };

  const startRecording = async () => {
    const permission = await AudioModule.requestRecordingPermissionsAsync();

    if (!permission.granted) {
      console.log("Mic permission denied");
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });

    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();

    console.log("Recording started");
  };

  const stopRecording = async () => {
    await audioRecorder.stop();

    const uri = audioRecorder.uri;
    setAudioUri(uri);

    const formData = new FormData();

    formData.append("audio", {
      uri,
      name: "recording.m4a",
      type: "audio/m4a",
    });

    const response = await fetch(`http://${ip}:3000/upload`, {
      method: "POST",
      body: formData,
    });

    const voiceMessage = await response.json();
    console.log("The user said: ", voiceMessage);

    await submitSearch(voiceMessage);

    console.log("Recording saved at:", uri);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Voice Entry</Text>
      <Text style={styles.cardSubtitle}>
        Tap the circle, speak naturally, and Pocket Journal will save it.
      </Text>

      <View style={styles.voiceArea}>
        <VoiceCircle
          startRecording={startRecording}
          stopRecording={stopRecording}
        />

        <Text style={styles.recordingStatus}>
          {recorderState.isRecording ? "Listening..." : "Ready to record"}
        </Text>
      </View>

      <Pressable
        style={[
          styles.secondaryButton,
          !audioRecorder.uri && styles.disabledButton,
        ]}
        onPress={() => player.play()}
      >
        <Text style={styles.secondaryButtonText}>Play Last Recording</Text>
      </Pressable>
    </View>
  );
}

function TypingSection({ setRefreshKey }) {
  const [input, setInput] = useState("");

  const submitSearch = async () => {
    if (!input.trim()) return;

    const savedInput = input;
    setInput("");

    const response = await fetch(`http://${ip}:3000/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: savedInput }),
    });

    const savedEntry = await response.json();
    await handleReminder(savedEntry);

    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>New Entry</Text>
      <Text style={styles.cardSubtitle}>
        Type a thought, task, reminder, or event.
      </Text>

      <View style={styles.inputBox}>
        <SearchBar value={input} onChange={setInput} />
      </View>

      <Pressable
        style={[styles.primaryButton, !input.trim() && styles.disabledButton]}
        onPress={submitSearch}
      >
        <Text style={styles.primaryButtonText}>Save Entry</Text>
      </Pressable>
    </View>
  );
}

export default function Index() {
  const { setRefreshKey } = useContext(EntriesContext);
  const [audioUri, setAudioUri] = useState(null);
  const [isRecorderPage, setIsRecorderPage] = useState(false);

  React.useEffect(() => {
    requestNotificationPermission();
  }, []);

  const player = useAudioPlayer(audioUri);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Pocket Journal</Text>
        <Text style={styles.subtitle}>
          {isRecorderPage ? "Say what's on your mind" : "Write a quick entry"}
        </Text>
      </View>

      <View style={styles.toggleRow}>
        <Pressable
          style={[
            styles.toggleButton,
            !isRecorderPage && styles.toggleButtonActive,
          ]}
          onPress={() => setIsRecorderPage(false)}
        >
          <Text
            style={[
              styles.toggleText,
              !isRecorderPage && styles.toggleTextActive,
            ]}
          >
            Type
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.toggleButton,
            isRecorderPage && styles.toggleButtonActive,
          ]}
          onPress={() => setIsRecorderPage(true)}
        >
          <Text
            style={[
              styles.toggleText,
              isRecorderPage && styles.toggleTextActive,
            ]}
          >
            Voice
          </Text>
        </Pressable>
      </View>

      {isRecorderPage ? (
        <RecorderSection
          player={player}
          setRefreshKey={setRefreshKey}
          setAudioUri={setAudioUri}
        />
      ) : (
        <TypingSection setRefreshKey={setRefreshKey} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f1e8",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  view: {
    width: "100%",
    backgroundColor: "#fffdf8",
    borderRadius: 24,
    padding: 24,

    borderWidth: 1,
    borderColor: "#d6cfc2",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,

    elevation: 4,
  },

  button: {
    marginTop: 16,
    backgroundColor: "#5c6b73",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  buttonText: {
    color: "#f8f6f2",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  header: {
    width: "100%",
    marginBottom: 24,
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#2f2f2f",
  },

  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#7a7268",
  },

  toggleRow: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#e8e0d3",
    borderRadius: 18,
    padding: 4,
    marginBottom: 18,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  toggleButtonActive: {
    backgroundColor: "#fffdf8",
  },

  toggleText: {
    color: "#7a7268",
    fontSize: 15,
    fontWeight: "600",
  },

  toggleTextActive: {
    color: "#2f2f2f",
  },
  card: {
    width: "100%",
    backgroundColor: "#fffdf8",
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: "#d6cfc2",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#2f2f2f",
    marginBottom: 6,
  },

  cardSubtitle: {
    fontSize: 15,
    color: "#7a7268",
    lineHeight: 21,
    marginBottom: 22,
  },

  inputBox: {
    marginBottom: 18,
  },

  primaryButton: {
    backgroundColor: "#5c6b73",
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "#fffdf8",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 22,
    backgroundColor: "#eee7dc",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: "#4d4944",
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
  },

  voiceArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },

  recordingStatus: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#5c6b73",
  },
});
