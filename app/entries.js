import AntDesign from "@expo/vector-icons/AntDesign";
import { Bell, Calendar, CheckCircle2, StickyNote } from "lucide-react-native";
import { useContext, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import EntryField from "../components/EntryField";
import SearchBar from "../components/SearchBar";
import { EntriesContext } from "./_layout";

const ip = "192.168.1.203";

const TYPE_META = {
  task: {
    label: "Task",
    Icon: CheckCircle2,
    bg: "#ecfdf5",
    border: "#a7f3d0",
    fg: "#047857",
    chipBg: "#d1fae5",
  },
  reminder: {
    label: "Reminder",
    Icon: Bell,
    bg: "#fffbeb",
    border: "#fde68a",
    fg: "#b45309",
    chipBg: "#fef3c7",
  },
  statement: {
    label: "Note",
    Icon: StickyNote,
    bg: "#eef2ff",
    border: "#c7d2fe",
    fg: "#4338ca",
    chipBg: "#e0e7ff",
  },
  event: {
    label: "Event",
    Icon: Calendar,
    bg: "#fdf2f8",
    border: "#fbcfe8",
    fg: "#be185d",
    chipBg: "#fce7f3",
  },
};

function formatTime(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function Entries() {
  const { refreshKey } = useContext(EntriesContext);
  const [dbEntries, setDbEntries] = useState([]);
  const [currentPage, setCurrentPage] = useState("All");
  const [currentType, setCurrentType] = useState("All");
  const [searchValue, setSearchValue] = useState("");
  const [showEntry, setShowEntry] = useState(null);
  const [isAiSearch, setIsAiSearch] = useState(false);

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
      loadEntries();
    }
  }

  useEffect(() => {
    loadEntries();
  }, [refreshKey]);

  function PageButton({ name, type }) {
    const active = currentPage === name;

    return (
      <Pressable
        style={[styles.pill, active && styles.pillActive]}
        onPress={() => {
          setCurrentPage(name);
          setCurrentType(type);
        }}
      >
        <Text style={[styles.pillText, active && styles.pillTextActive]}>
          {name}
        </Text>
      </Pressable>
    );
  }

  async function aiSearch(searchPrompt) {
    console.log("BWWWWWW.... Initiating AI Search Sequence");
  }

  return (
    <View style={styles.container}>
      <EntryField
        entry={showEntry}
        onClose={() => setShowEntry(null)}
        onUpdated={loadEntries}
      />
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Pocket Journal</Text>
        <Text style={styles.h1}>Entries</Text>
      </View>

      <SearchBar
        value={searchValue}
        onChange={setSearchValue}
        hasAI={true}
        aiSearchFunction={() => {
          setIsAiSearch(!isAiSearch);
        }}
      />

      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          <PageButton name="All" type="All" />
          <PageButton name="Tasks" type="task" />
          <PageButton name="Reminders" type="reminder" />
          <PageButton name="Events" type="event" />
          <PageButton name="Notes" type="statement" />
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        {dbEntries.map((entry) => {
          const matchesType =
            currentType === "All" || entry.type === currentType;

          const search = searchValue.toLowerCase();

          const matchesSearch =
            search === "" ||
            entry.raw_text?.toLowerCase().includes(search) ||
            entry.title?.toLowerCase().includes(search) ||
            entry.description?.toLowerCase().includes(search) ||
            entry.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(search),
            );

          if (!matchesType || !matchesSearch) {
            return null;
          }

          const meta = TYPE_META[entry.type] || TYPE_META.statement;
          const Icon = meta.Icon;

          return (
            <Pressable
              key={entry.id}
              onPress={() => {
                setShowEntry(entry);
              }}
            >
              <View
                style={[
                  styles.entryCard,
                  {
                    backgroundColor: meta.bg,
                    borderColor: meta.border,
                  },
                ]}
              >
                <View style={[styles.rail, { backgroundColor: meta.fg }]} />

                <View style={styles.cardBody}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[styles.chip, { backgroundColor: meta.chipBg }]}
                    >
                      <Icon size={12} color={meta.fg} />
                      <Text style={[styles.chipText, { color: meta.fg }]}>
                        {meta.label}
                      </Text>
                    </View>

                    <Pressable onPress={() => handleDelete(entry.id)}>
                      <AntDesign name="delete" size={16} color="#64748b" />
                    </Pressable>
                  </View>

                  <Text style={styles.title}>
                    {entry.title || entry.raw_text || "Untitled"}
                  </Text>

                  <Text style={styles.description} numberOfLines={3}>
                    {entry.description || entry.raw_text}
                  </Text>

                  <Text style={styles.time}>
                    {formatTime(
                      entry.created_at || entry.createdat || entry.date,
                    )}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaf9",
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 12,
  },

  eyebrow: {
    fontSize: 12,
    color: "#64748b",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  h1: {
    fontSize: 32,
    fontWeight: "700",
    color: "#0f172a",
    marginTop: 2,
  },

  filters: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },

  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginRight: 8,
  },

  pillActive: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },

  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  pillTextActive: {
    color: "#fff",
  },

  list: {
    padding: 16,
    paddingTop: 8,
  },

  entryCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
  },

  rail: {
    width: 4,
  },

  cardBody: {
    flex: 1,
    padding: 14,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },

  chipText: {
    fontSize: 11,
    fontWeight: "700",
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },

  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
    marginBottom: 8,
  },

  time: {
    fontSize: 12,
    color: "#64748b",
  },
});
