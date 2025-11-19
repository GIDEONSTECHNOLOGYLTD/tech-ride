import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const initializeApp = async () => {
  // Request notification permissions
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
    }
  }
};
