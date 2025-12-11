import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

// Screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RideRequestScreen from './src/screens/RideRequestScreen';
import RideTrackingScreen from './src/screens/RideTrackingScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RideHistoryScreen from './src/screens/RideHistoryScreen';
import WalletScreen from './src/screens/WalletScreen';
import PaymentMethodScreen from './src/screens/PaymentMethodScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import EditProfileScreen from './src/screens/EditProfileScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

// Services
import { initializeApp } from './src/services/app.service';

const Stack = createStackNavigator();

export default function App() {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#fff' },
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
            <Stack.Screen name="RideRequest" component={RideRequestScreen} />
            <Stack.Screen name="RideTracking" component={RideTrackingScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
