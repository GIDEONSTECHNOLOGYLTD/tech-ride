import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { RideProvider } from './src/context/RideContext';
import { requestLocationPermission, requestNotificationPermission } from './src/utils/permissions';

const App = () => {
  useEffect(() => {
    // Request permissions on app start
    requestLocationPermission();
    requestNotificationPermission();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RideProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </RideProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

export default App;
