import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { rideAPI, userAPI } from '../services/api.service';

const VEHICLE_TYPES = [
  { id: 'ECONOMY', name: 'Economy', icon: '🚗', seats: 4, description: 'Affordable rides' },
  { id: 'COMFORT', name: 'Comfort', icon: '✨', seats: 4, description: 'Premium comfort' },
  { id: 'XL', name: 'XL', icon: '🚙', seats: 6, description: 'Extra space' },
  { id: 'BIKE', name: 'Bike', icon: '🏍️', seats: 1, description: 'Fast & cheap' },
];

export default function RideRequestScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const [selectedVehicle, setSelectedVehicle] = useState('ECONOMY');
  const [pickup, setPickup] = useState('Current Location');
  const [dropoff, setDropoff] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [pickupCoords, setPickupCoords] = useState<any>(null);
  const [dropoffCoords, setDropoffCoords] = useState<any>(null);
  const [fares, setFares] = useState<any>(null);
  const [loadingFares, setLoadingFares] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    getCurrentLocation();
    loadWalletBalance();
  }, []);

  useEffect(() => {
    if (pickupCoords && dropoffCoords) {
      calculateFares();
    }
  }, [pickupCoords, dropoffCoords, selectedVehicle]);

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setPickupCoords({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    }
  };

  const loadWalletBalance = async () => {
    try {
      const response = await userAPI.getWallet();
      setWalletBalance(response.data.wallet.balance || 0);
    } catch (error) {
      console.error('Failed to load wallet balance');
    }
  };

  const calculateFares = async () => {
    setLoadingFares(true);
    try {
      const response = await rideAPI.calculateFare({
        pickupLocation: pickupCoords,
        dropoffLocation: dropoffCoords,
        vehicleType: selectedVehicle,
      });
      setFares(response.data);
    } catch (error: any) {
      console.error('Fare calculation error:', error);
    } finally {
      setLoadingFares(false);
    }
  };

  const handleRequestRide = async () => {
    if (!dropoffCoords) {
      Alert.alert('Error', 'Please enter a destination');
      return;
    }

    if (paymentMethod === 'WALLET' && walletBalance < (fares?.estimatedFare || 0)) {
      Alert.alert(
        'Insufficient Balance',
        `Your wallet balance (₦${walletBalance.toFixed(2)}) is less than the fare (₦${fares?.estimatedFare?.toFixed(2)}). Please top up or use another payment method.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setRequesting(true);
    try {
      const response = await rideAPI.requestRide({
        pickupLocation: {
          latitude: pickupCoords.latitude,
          longitude: pickupCoords.longitude,
          address: pickup,
        },
        dropoffLocation: {
          latitude: dropoffCoords.latitude,
          longitude: dropoffCoords.longitude,
          address: dropoff,
        },
        vehicleType: selectedVehicle,
        paymentMethod,
      });

      const rideId = response.data.ride._id;
      navigation.navigate('RideTracking' as never, { rideId } as never);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to request ride');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request a Ride</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Location Inputs */}
        <View style={styles.locationSection}>
          <View style={styles.locationDots}>
            <View style={styles.pickupDot} />
            <View style={styles.dotLine} />
            <View style={styles.dropoffDot} />
          </View>
          <View style={styles.locationInputs}>
            <TextInput
              style={styles.locationInput}
              value={pickup}
              onChangeText={setPickup}
              placeholder="Pickup location"
            />
            <TextInput
              style={styles.locationInput}
              value={dropoff}
              onChangeText={setDropoff}
              placeholder="Where to?"
            />
          </View>
        </View>

        {/* Vehicle Selection */}
        <Text style={styles.sectionTitle}>Choose a ride</Text>
        {VEHICLE_TYPES.map((vehicle) => (
          <TouchableOpacity
            key={vehicle.id}
            style={[styles.vehicleCard, selectedVehicle === vehicle.id && styles.vehicleCardSelected]}
            onPress={() => setSelectedVehicle(vehicle.id)}
          >
            <Text style={styles.vehicleIcon}>{vehicle.icon}</Text>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleName}>{vehicle.name}</Text>
              <Text style={styles.vehicleDescription}>{vehicle.description}</Text>
              <Text style={styles.vehicleTime}>{vehicle.time} away • {vehicle.seats} seats</Text>
            </View>
            {loadingFares ? (
              <ActivityIndicator size="small" color="#4F46E5" />
            ) : fares ? (
              <Text style={styles.vehiclePrice}>₦{fares.estimatedFare?.toFixed(2) || '0.00'}</Text>
            ) : (
              <Text style={styles.vehiclePrice}>--</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Payment Method */}
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentSection}>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'CARD' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('CARD')}
          >
            <Ionicons name="card" size={24} color={paymentMethod === 'CARD' ? '#4F46E5' : '#6B7280'} />
            <Text style={[styles.paymentText, paymentMethod === 'CARD' && styles.paymentTextSelected]}>
              Credit Card
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'WALLET' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('WALLET')}
          >
            <Ionicons name="wallet" size={24} color={paymentMethod === 'WALLET' ? '#4F46E5' : '#6B7280'} />
            <Text style={[styles.paymentText, paymentMethod === 'WALLET' && styles.paymentTextSelected]}>
              Wallet (₦{walletBalance.toFixed(2)})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'CASH' && styles.paymentSelected]}
            onPress={() => setPaymentMethod('CASH')}
          >
            <Ionicons name="cash" size={24} color={paymentMethod === 'CASH' ? '#4F46E5' : '#6B7280'} />
            <Text style={[styles.paymentText, paymentMethod === 'CASH' && styles.paymentTextSelected]}>
              Cash
            </Text>
          </TouchableOpacity>
        </View>

        {/* Promo Code */}
        <TouchableOpacity style={styles.promoButton}>
          <Ionicons name="pricetag" size={20} color="#4F46E5" />
          <Text style={styles.promoText}>Add promo code</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Request Button */}
      <View style={styles.footer}>
        <View style={styles.fareRow}>
          <Text style={styles.fareLabel}>Estimated Fare:</Text>
          {loadingFares ? (
            <ActivityIndicator size="small" color="#4F46E5" />
          ) : fares ? (
            <Text style={styles.fareAmount}>₦{fares.estimatedFare?.toFixed(2) || '0.00'}</Text>
          ) : (
            <Text style={styles.fareAmount}>--</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.requestButton, (!dropoff || requesting) && styles.requestButtonDisabled]}
          onPress={handleRequestRide}
          disabled={!dropoff || requesting}
        >
          {requesting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.requestButtonText}>Request Ride</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  locationSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  locationDots: {
    alignItems: 'center',
    marginRight: 16,
    paddingTop: 8,
  },
  pickupDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  dotLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  dropoffDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
  },
  locationInputs: {
    flex: 1,
  },
  locationInput: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  vehicleIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  vehicleDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  vehicleTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  vehiclePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  paymentSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  paymentText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  promoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  requestButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  requestButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  requestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  fareAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
});
