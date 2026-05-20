import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission() {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== "granted") {
    console.log("Notification permission denied");
    return false;
  }

  return true;
}

export async function scheduleEntryNotification(entry) {
  const allowed = await requestNotificationPermission();

  if (!allowed) return;

  if (!entry.notificationEnabled) return;

  const notificationTime = entry.notificationTime || entry.time;

  if (!entry.date || !notificationTime) {
    console.log("No date/time for notification");
    return;
  }

  const triggerDate = new Date(`${entry.date}T${notificationTime}:00`);

  if (triggerDate <= new Date()) {
    console.log("Notification time already passed");
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: entry.title || "Pocket Journal Reminder",
      body: entry.description || entry.rawText || "You have something saved.",
      data: {
        entryId: entry.id,
        type: entry.type,
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });

  console.log("Notification scheduled for:", triggerDate);
}
