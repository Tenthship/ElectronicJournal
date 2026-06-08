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
    console.log("Notification permission not granted");
    return false;
  }

  return true;
}

export function buildNotificationDate(entry) {
  const rawText = entry.rawText ?? entry.raw_text ?? "";

  const secondMatch = rawText.match(/in\s+(\d+)\s+seconds?/i);
  if (secondMatch) {
    return new Date(Date.now() + Number(secondMatch[1]) * 1000);
  }

  const minuteMatch = rawText.match(/in\s+(\d+)\s+minutes?/i);
  if (minuteMatch) {
    return new Date(Date.now() + Number(minuteMatch[1]) * 60 * 1000);
  }

  const notificationTime = entry.notificationTime ?? entry.notification_time;

  if (notificationTime) {
    return new Date(notificationTime);
  }

  return null;
}

export async function scheduleNotification(title, body, triggerDate) {
  const seconds = Math.max(
    1,
    Math.floor((triggerDate.getTime() - Date.now()) / 1000),
  );

  return await Notifications.scheduleNotificationAsync({
    content: {
      title: title || "Reminder",
      body: body || "",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
    },
  });
}

export async function handleReminder(entry) {
  const notificationEnabled =
    entry.notificationEnabled ?? entry.notification_enabled;

  if (!notificationEnabled) return null;

  const notifDate = buildNotificationDate(entry);

  if (!notifDate || isNaN(notifDate.getTime())) {
    console.log("No valid notification date");
    return null;
  }

  if (notifDate <= new Date()) {
    console.log("Notification time is in the past");
    return null;
  }

  return await scheduleNotification(
    entry.title,
    entry.description ?? entry.raw_text ?? entry.rawText,
    notifDate,
  );
}
