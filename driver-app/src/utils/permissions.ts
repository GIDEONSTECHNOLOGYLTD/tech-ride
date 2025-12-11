import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

export const requestLocationPermission = async (): Promise<boolean> => {
  try {
    const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
    
    if (foregroundStatus !== 'granted') {
      console.log('❌ Foreground location permission denied');
      return false;
    }

    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    
    if (backgroundStatus !== 'granted') {
      console.log('⚠️ Background location permission denied');
      return foregroundStatus === 'granted';
    }

    console.log('✅ Location permissions granted');
    return true;
  } catch (error) {
    console.error('Location permission error:', error);
    return false;
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('❌ Notification permission denied');
      return false;
    }

    console.log('✅ Notification permission granted');
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    
    return true;
  } catch (error) {
    console.error('Notification permission error:', error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Get current location error:', error);
    throw error;
  }
};

export const watchLocation = (
  callback: (location: { latitude: number; longitude: number; heading: number }) => void
): { remove: () => void } => {
  const subscription = Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        heading: location.coords.heading || 0,
      });
    }
  );

  return {
    remove: () => {
      subscription.then(sub => sub.remove());
    }
  };
};

export const clearLocationWatch = (watchId: { remove: () => void }) => {
  watchId.remove();
};
