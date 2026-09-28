import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useAuth } from "../utils/AuthContext";
import { colors } from "../utils/theme";

const localUrl = "https://pocketjournal.onrender.com";

export default function EntryField({ entry, onClose, onUpdated }) {
  const { session } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.92)).current;

  const [editedText, setEditedText] = useState("");
  const [isEditable, setIsEditable] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      setEditedText(entry.raw_text || entry.description || "");
      setIsEditable(false);
    }
  }, [entry]);

  useEffect(() => {
    if (entry) {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.92);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 7,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [entry, fadeAnim, scaleAnim]);

  if (!entry) return null;

  async function editEntry() {
    try {
      const response = await fetch(`${localUrl}/entries/${entry.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          new_text: editedText.trim(),
        }),
      });

      if (!response.ok) {
        console.log("Update failed:", await response.text());
        return false;
      }

      await response.json();
      return true;
    } catch (err) {
      console.log("Update error:", err);
      return false;
    }
  }

  async function handleEditPress() {
    if (!isEditable) {
      setIsEditable(true);
      return;
    }

    const cleanedText = editedText.trim();
    if (!cleanedText) return;

    setIsSaving(true);
    const success = await editEntry();
    setIsSaving(false);

    if (!success) return;

    setIsEditable(false);
    await onUpdated?.();
    onClose();
  }

  function handleClose() {
    onClose();
    setIsEditable(false);
  }

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      <Pressable style={styles.backdrop} onPress={handleClose} />

      <Animated.View
        style={[styles.card, { transform: [{ scale: scaleAnim }] }]}
      >
        <Pressable style={styles.closeButton} onPress={handleClose} hitSlop={8}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>

        <Text style={styles.title}>{entry.title || "Untitled"}</Text>

        <TextInput
          style={[styles.description, isEditable && styles.descriptionEditing]}
          value={editedText}
          onChangeText={setEditedText}
          multiline
          editable={isEditable}
          placeholder="Write something..."
          placeholderTextColor={colors.inkSoft}
        />

        <Pressable
          style={[
            styles.editButton,
            isEditable && styles.editButtonActive,
            isSaving && styles.editButtonDisabled,
          ]}
          onPress={handleEditPress}
          disabled={isSaving}
        >
          <AntDesign
            name={isEditable ? "check" : "edit"}
            size={20}
            color={isEditable ? colors.cream : colors.inkSoft}
          />
          <Text style={[styles.editText, isEditable && styles.editTextActive]}>
            {isSaving ? "Saving..." : isEditable ? "Done" : "Edit"}
          </Text>
        </Pressable>

        {entry.created_at && (
          <Text style={styles.time}>
            {new Date(entry.created_at).toLocaleString()}
          </Text>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(38, 33, 26, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },

  card: {
    width: "85%",
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },

  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
  },

  closeText: {
    fontSize: 18,
    color: colors.inkSoft,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
    marginBottom: 12,
    paddingRight: 24,
  },

  description: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.ink,
    marginBottom: 20,
  },

  descriptionEditing: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    minHeight: 120,
    textAlignVertical: "top",
  },

  editButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.bg,
    marginBottom: 16,
  },

  editButtonActive: {
    backgroundColor: colors.primary,
  },

  editButtonDisabled: {
    opacity: 0.6,
  },

  editText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.inkSoft,
  },

  editTextActive: {
    color: colors.cream,
  },

  time: {
    fontSize: 13,
    color: colors.inkSoft,
  },
});
