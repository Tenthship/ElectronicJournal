export const colors = {
  bg: "#F7F1E4",
  card: "#FFFDF7",
  border: "#E6DCC6",
  ink: "#26211A",
  inkSoft: "#7A6F5D",

  primary: "#B5502D",
  primarySoft: "#F3DECB",

  accent: "#5B7A63",
  accentSoft: "#DEE8DF",

  gold: "#B8862E",
  goldSoft: "#F1E4C6",

  plum: "#7A4B68",
  plumSoft: "#EEDFE8",

  navy: "#221D17",
  navyAlt: "#2E2820",
  cream: "#FBF6EC",

  danger: "#A6432E",
};

export const typeMeta = {
  task: { label: "Task", fg: colors.accent, bg: colors.accentSoft },
  reminder: { label: "Reminder", fg: colors.gold, bg: colors.goldSoft },
  event: { label: "Event", fg: colors.plum, bg: colors.plumSoft },
  statement: { label: "Note", fg: colors.primary, bg: colors.primarySoft },
};
