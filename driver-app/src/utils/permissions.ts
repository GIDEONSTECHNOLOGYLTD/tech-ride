import { Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import messaging from '@react-native-firebase/messaging';

export const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('always');
    return status === 'granted';
  }

  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'TechRide Driver Location Permission',
        message: 'We need access to your location to find nearby riders',
        buttonPositive: 'OK',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      // Also request background location for continuous tracking
      if (Platform.Version >= 29) {
        const backgroundGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
          {
            title: 'Background Location Permission',
            message: 'Allow TechRide to access your location in the background',
            buttonPositive: 'OK',
          }
        );
        return backgroundGranted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    }
    return false;
  }

  return false;
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('✅ Notification permission granted');
      // Get FCM token
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

export const watchLocation = (
  callback: (location: { latitude: number; longitude: number; heading: number }) => void
): number => {
  return Geolocation.watchPosition(
    (position) => {
      callback({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        heading: position.coords.heading || 0,
      });
    },
    (error) => {
      console.error('Watch location error:', error);
    },
    { enableHighAccuracy: true, distanceFilter: 10, interval: 5000 }
  );
};

export const clearLocationWatch = (watchId: number) => {
  Geolocation.clearWatch(watchId);
};
