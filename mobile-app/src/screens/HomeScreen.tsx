import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../services/api.service';
import socketService from '../services/socket.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const navigation = useNavigation();
  const mapRef = useRef<MapView>(null);
  const [location, setLocation] = useState<any>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    checkUserRole();
    requestLocationPermission();
    socketService.connect();
    
    // Refresh drivers every 10 seconds
    const interval = setInterval(() => {
      if (location) {
        fetchNearbyDrivers(location.latitude, location.longitude);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [location?.latitude, location?.longitude]);

  const checkUserRole = async () => {
    try {
      // Fetch fresh user data from API to ensure role is current
      const response = await userAPI.getProfile();
      const userData = response.data.user;
      
      // Only set admin if role is EXACTLY 'ADMIN'
      if (userData && userData.role === 'ADMIN') {
        setUserRole('ADMIN');
      } else {
        setUserRole('RIDER');
      }
    } catch (error) {
      console.log('Failed to get user role:', error);
      setUserRole('RIDER'); // Default to RIDER on error
    }
  };

  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const currentLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(coords);
      
      // Fetch real nearby drivers from API
      fetchNearbyDrivers(coords.latitude, coords.longitude);
    }
  };

  const fetchNearbyDrivers = async (latitude: number, longitude: number) => {
    try {
      const response = await userAPI.getNearbyDrivers(latitude, longitude, 5);
      const drivers = response.data.drivers || [];
      setNearbyDrivers(drivers.map((driver: any) => ({
        id: driver._id,
        latitude: driver.currentLocation?.coordinates[1],
        longitude: driver.currentLocation?.coordinates[0],
        name: driver.firstName,
        vehicleType: driver.vehicleType,
      })));
    } catch (error) {
      console.error('Failed to fetch nearby drivers:', error);
      setNearbyDrivers([]);
    }
  };

  const handleRequestRide = () => {
    navigation.navigate('RideRequest' as never);
  };

  return (
    <View style={styles.container}>
      {location && (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={location}
          showsUserLocation
          showsMyLocationButton
        >
          {nearbyDrivers.map((driver) => (
            <Marker
              key={driver.id}
              coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
              title="Driver"
            >
              <View style={styles.driverMarker}>
                <Text style={styles.driverIcon}>🚗</Text>
              </View>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Top Menu */}
      <View style={styles.topMenu}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Profile' as never)}>
          <Ionicons name="person-circle" size={32} color="#4F46E5" />
        </TouchableOpacity>
        <View style={styles.topMenuRight}>
          {userRole === 'ADMIN' && (
            <TouchableOpacity 
              style={[styles.menuButton, styles.adminButton]}
              onPress={() => navigation.navigate('AdminDashboard' as never)}
            >
              <Ionicons name="settings" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('Wallet' as never)}>
            <Ionicons name="wallet" size={24} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate('RideHistory' as never)}>
            <Ionicons name="time" size={24} color="#4F46E5" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Action Panel */}
      <View style={styles.bottomPanel}>
        <Text style={styles.panelTitle}>Where to?</Text>
        <TouchableOpacity style={styles.destinationInput} onPress={handleRequestRide}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <Text style={styles.destinationText}>Enter your destination</Text>
        </TouchableOpacity>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="home" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.quickActionText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="briefcase" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.quickActionText}>Work</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="time" size={20} color="#4F46E5" />
            </View>
            <Text style={styles.quickActionText}>Schedule</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  topMenu: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  topMenuRight: {
    flexDirection: 'row',
    gap: 10,
  },
  menuButton: {
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adminButton: {
    backgroundColor: '#4F46E5',
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1F2937',
  },
  destinationInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  destinationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#9CA3AF',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#6B7280',
  },
  driverMarker: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  driverIcon: {
    fontSize: 24,
  },
});
