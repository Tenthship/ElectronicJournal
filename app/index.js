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
import { useAuth } from "../utils/AuthContext";
import {
  handleReminder,
  requestNotificationPermission,
} from "../utils/notifications";
import { colors } from "../utils/theme";
import { EntriesContext } from "./_layout";

const localUrl = "https://pocketjournal.onrender.com";

function uploadAudio(uri, token) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("audio", {
      uri,
      name: "recording.m4a",
      type: "audio/m4a",
    });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${localUrl}/upload`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (err) {
          reject(err);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function RecorderSection({ setAudioUri, player, setRefreshKey, session }) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const submitSearch = async (voiceMessage) => {
    const response = await fetch(`${localUrl}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text: voiceMessage.transcript }),
    });

    if (!response.ok) {
      console.log("Saving voice entry failed:", response.status);
      return;
    }

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
  };

  const stopRecording = async () => {
    await audioRecorder.stop();

    const uri = audioRecorder.uri;
    setAudioUri(uri);

    let voiceMessage;
    try {
      voiceMessage = await uploadAudio(uri, session.access_token);
    } catch (err) {
      console.log("Transcription failed:", err.message);
      return;
    }

    await submitSearch(voiceMessage);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Voice entry</Text>
      <Text style={styles.cardSubtitle}>
        Hold the circle, speak naturally, and let go to save it.
      </Text>

      <View style={styles.voiceArea}>
        <VoiceCircle
          startRecording={startRecording}
          stopRecording={stopRecording}
        />
        <Text style={styles.recordingStatus}>
          {recorderState.isRecording ? "Listening..." : "Ready when you are"}
        </Text>
      </View>

      <Pressable
        style={[
          styles.secondaryButton,
          !audioRecorder.uri && styles.disabledButton,
        ]}
        onPress={() => player.play()}
      >
        <Text style={styles.secondaryButtonText}>Play last recording</Text>
      </Pressable>
    </View>
  );
}

function TypingSection({ setRefreshKey, session }) {
  const [input, setInput] = useState("");

  const submitSearch = async () => {
    if (!input.trim()) return;

    const savedInput = input;
    setInput("");

    const response = await fetch(`${localUrl}/entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ text: savedInput }),
    });

    if (!response.ok) {
      console.log("Saving entry failed:", response.status);
      setInput(savedInput);
      return;
    }

    const savedEntry = await response.json();
    await handleReminder(savedEntry);

    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>New entry</Text>
      <Text style={styles.cardSubtitle}>
        A thought, a task, a reminder, an event — just write it.
      </Text>

      <View style={styles.inputBox}>
        <SearchBar value={input} onChange={setInput} />
      </View>

      <Pressable
        style={[styles.primaryButton, !input.trim() && styles.disabledButton]}
        onPress={submitSearch}
      >
        <Text style={styles.primaryButtonText}>Save entry</Text>
      </Pressable>
    </View>
  );
}

export default function Index() {
  const { setRefreshKey } = useContext(EntriesContext);
  const { session } = useAuth();
  const [audioUri, setAudioUri] = useState(null);
  const [isRecorderPage, setIsRecorderPage] = useState(false);

  React.useEffect(() => {
    requestNotificationPermission();
  }, []);

  const player = useAudioPlayer(audioUri);

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{todayLabel()}</Text>
        <Text style={styles.title}>{greeting()}</Text>
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
          session={session}
        />
      ) : (
        <TypingSection setRefreshKey={setRefreshKey} session={session} />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  header: {
    marginBottom: 24,
  },

  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.inkSoft,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.ink,
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: colors.primarySoft,
    borderRadius: 18,
    padding: 4,
    marginBottom: 20,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  toggleButtonActive: {
    backgroundColor: colors.card,
  },

  toggleText: {
    color: colors.inkSoft,
    fontSize: 15,
    fontWeight: "700",
  },

  toggleTextActive: {
    color: colors.primary,
  },

  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    lineHeight: 20,
    marginBottom: 20,
  },

  inputBox: {
    marginBottom: 16,
  },

  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: colors.cream,
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: 18,
    backgroundColor: colors.bg,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },

  secondaryButtonText: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.45,
  },

  voiceArea: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },

  recordingStatus: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
});
