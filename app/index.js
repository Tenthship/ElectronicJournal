import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { useContext, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import SearchBar from "../components/SearchBar";
import SearchButton from "../components/SearchButton";
import VoiceCircle from "../components/VoiceCircle";
import { scheduleTestNotification } from "../utils/notifications";
import { EntriesContext } from "./_layout";

const ip = "192.168.1.85";

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

    await scheduleTestNotification("Reminder", "Check your app notifications");

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
      uri: uri,
      name: "recording.m4a",
      type: "audio/m4a",
    });

    const response = await fetch(`http://${ip}:3000/upload`, {
      method: "POST",
      body: formData,
    });

    const voiceMessage = await response.json();
    console.log("The user said: ", voiceMessage);
    submitSearch(voiceMessage);

    console.log("Recording saved at:", uri);
  };

  return (
    <View style={styles.view}>
      <VoiceCircle
        startRecording={startRecording}
        stopRecording={stopRecording}
      />

      <Text>
        {recorderState.isRecording ? "Recording..." : "Not recording"}
      </Text>

      <Pressable onPress={() => player.play()}>
        <Text>Play Recording</Text>
      </Pressable>
    </View>
  );
}

function TypingSection({ setRefreshKey }) {
  const [input, setInput] = useState("");

  const submitSearch = async () => {
    const savedInput = input;
    setInput("");

    console.log(savedInput);

    const response = await fetch(`http://${ip}:3000/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: savedInput }),
    });

    const savedEntry = await response.json();

    await scheduleTestNotification("Reminder", "Check your app notifications");

    setRefreshKey((prev) => prev + 1);
  };

  return (
    <View style={styles.view}>
      <SearchBar value={input} onChange={setInput} />
      <SearchButton submitSearch={submitSearch} />

      <Pressable
        style={styles.button}
        onPress={async () => {
          try {
            const response = await fetch(`http://${ip}:3000/entries`);
            const data = await response.json();
            console.log(data);
          } catch (err) {
            console.log(err);
          }
        }}
      >
        <Text style={styles.buttonText}>GETTTTTTTT</Text>
      </Pressable>
    </View>
  );
}

export default function Index() {
  const { setRefreshKey } = useContext(EntriesContext);
  const [audioUri, setAudioUri] = useState(null);
  const [isRecorderPage, setIsRecorderPage] = useState(false);

  const player = useAudioPlayer(audioUri);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Pressable
        onPress={() => {
          setIsRecorderPage(!isRecorderPage);
        }}
      >
        <Text>Flippy Doo</Text>
      </Pressable>

      {isRecorderPage ? (
        <RecorderSection
          player={player}
          setRefreshKey={setRefreshKey}
          setAudioUri={(uri) => {
            setAudioUri(uri);
          }}
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
});
