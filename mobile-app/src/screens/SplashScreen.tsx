import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setTimeout(async () => {
      const token = await AsyncStorage.getItem('authToken');
      const userRole = await AsyncStorage.getItem('userRole');
      const hasOnboarded = await AsyncStorage.getItem('hasOnboarded');

      // Allow RIDER and ADMIN roles
      if (token && (userRole === 'RIDER' || userRole === 'ADMIN')) {
        navigation.navigate('Home' as never);
      } else if (hasOnboarded) {
        navigation.navigate('Login' as never);
      } else {
        navigation.navigate('Onboarding' as never);
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🚗</Text>
      <Text style={styles.title}>TechRide</Text>
      <Text style={styles.subtitle}>Your ride, your way</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
  },
  logo: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E7FF',
  },
});
