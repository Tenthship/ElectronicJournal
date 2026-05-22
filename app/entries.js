import AntDesign from "@expo/vector-icons/AntDesign";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { EntriesContext } from "./_layout";
const ip = "192.168.1.74";

export default function Entries() {
  const { refreshKey } = useContext(EntriesContext);
  const [dbEntries, setDbEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState("All");
  const [currentType, setCurrentType] = useState("All");
  const loadEntries = async () => {
    const response = await fetch(`http://${ip}:3000/entries`);
    const entries = await response.json();
    setDbEntries(entries);
  };

  async function handleDelete(id) {
    setDbEntries((oldEntries) => oldEntries.filter((entry) => entry.id !== id));

    const response = await fetch(`http://${ip}:3000/entries/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      console.log("Delete failed");
      loadEntries(); // puts it back if delete failed
    }
  }

  useEffect(() => {
    loadEntries();
  }, [refreshKey]);

  function PageButton({ name }) {
    return (
      <Pressable
        style={
          currentPage === name ? styles.topButtonPressed : styles.topButton
        }
        onPress={() => {
          if (name === "Tasks") {
            setCurrentType("task");
          }
          if (name === "Reminders") {
            setCurrentType("reminder");
          }
          if (name === "Events") {
            setCurrentType("event");
          }
          if (name === "Notes") {
            setCurrentType("statement");
          }
          setCurrentPage(name);
          console.log(name);
        }}
      >
        <Text style={styles.topButtonText}>{name}</Text>
      </Pressable>
    );
  }
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <PageButton name="All" />
        <PageButton name="Tasks" />
        <PageButton name="Reminders" />
        <PageButton name="Events" />
        <PageButton name="Notes" />
      </View>
      {dbEntries.map((entry, index) => {
        if (currentPage !== "All" && currentType !== entry.type) {
          return null;
        }

        return (
          <View
            key={index}
            style={[
              styles.entryCard,
              { backgroundColor: entryColors[entry.type] || "#ffffff" },
            ]}
          >
            <Text>
              ID: {entry.id} {"\n"}
              Text: {entry.raw_text} {"\n"}
              Type: {entry.type}
            </Text>

            <Pressable onPress={() => handleDelete(entry.id)}>
              <AntDesign name="delete" size={12} color="black" />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

const entryColors = {
  statement: "#F5E6CC", // warm beige
  task: "#D6EAF8", // light blue
  reminder: "#FFF3B0", // soft yellow
  event: "#E8D5FF", // light purple
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f1e8",
  },

  content: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    gap: 12,
  },
  topBar: {
    flexDirection: "row",

    width: "100%",
    marginTop: 20,

    backgroundColor: "#e7edf5",
    borderRadius: 16,

    overflow: "hidden",
  },
  topButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,

    alignItems: "center",
    justifyContent: "center",
  },
  topButtonPressed: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
    backgroundColor: "#5b8def",
    color: "#ffffff",

    alignItems: "center",
    justifyContent: "center",
  },
  topButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#4a5a6a",
    textAlign: "center",
    flexShrink: 1,
  },
  entryCard: { padding: 5, margin: 5, gap: 5 },
});
