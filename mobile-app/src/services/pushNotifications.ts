import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient } from './api';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true, shouldSetBadge: true }) });
export const registerForPushNotifications = async () => {
  let token;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') { const { status } = await Notifications.requestPermissionsAsync(); finalStatus = status; }
  if (finalStatus !== 'granted') { console.log('Push notification permission not granted'); return; }
  token = (await Notifications.getExpoPushTokenAsync()).data;
  if (Platform.OS === 'android') { Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.MAX }); }
  await apiClient.post('/devices/register', { pushToken: token, platform: Platform.OS });
  return token;
};
export const schedulePushNotification = async (title, body, data = {}) => {
  await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: { seconds: 1 } });
};