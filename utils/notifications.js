import * as Notifications from "expo-notifications";
import { Alert } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions() {
  console.log("REQUESTING NOTIFS");

  const { status } = await Notifications.getPermissionsAsync();

  let finalStatus = status;

  if (status !== "granted") {
    const request = await Notifications.requestPermissionsAsync();
    finalStatus = request.status;
  }

  console.log("Notification permission:", finalStatus);

  if (finalStatus !== "granted") {
    Alert.alert(
      "Notifications not enabled",
      "Please enable notifications in settings.",
    );

    return false;
  }

  return true;
}

export async function scheduleTestNotification(title, body) {
  try {
    const hasPermission = await requestNotificationPermissions();

    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: title || "Reminder",
        body: body || "You have a reminder",
        sound: "default",
      },
      trigger: {
        type: "timeInterval",
        seconds: 10,
        repeats: false,
      },
    });

    console.log("Test notification scheduled");
  } catch (err) {
    console.log("NOTIFICATION ERROR:", err);
  }
}
