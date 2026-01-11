import * as Notifications from 'expo-notifications';

export async function registerForPushNotifications(): Promise<string | null> {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return null;
  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

export async function scheduleNotification(title: string, body: string, seconds: number): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: { seconds },
  });
}
