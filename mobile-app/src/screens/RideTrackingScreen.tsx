import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function RideTrackingScreen() {
  const navigation = useNavigation();
  const [rideStatus, setRideStatus] = useState('SEARCHING'); // SEARCHING, ACCEPTED, ARRIVED, IN_PROGRESS, COMPLETED
  const [driver, setDriver] = useState<any>(null);
  const [eta, setEta] = useState('3 min');

  useEffect(() => {
    // Simulate ride flow
    setTimeout(() => {
      setRideStatus('ACCEPTED');
      setDriver({
        name: 'John Doe',
        rating: 4.9,
        vehicle: 'Toyota Camry',
        plate: 'ABC 123',
        phone: '+1234567890',
      });
    }, 3000);

    setTimeout(() => setRideStatus('ARRIVED'), 8000);
    setTimeout(() => setRideStatus('IN_PROGRESS'), 12000);
  }, []);

  const renderStatusContent = () => {
    switch (rideStatus) {
      case 'SEARCHING':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.loadingDots}>
              <View style={[styles.dot, styles.dotAnimated]} />
              <View style={[styles.dot, styles.dotAnimated]} />
              <View style={[styles.dot, styles.dotAnimated]} />
            </View>
            <Text style={styles.statusTitle}>Finding your driver...</Text>
            <Text style={styles.statusSubtitle}>This usually takes less than a minute</Text>
            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancel Request</Text>
            </TouchableOpacity>
          </View>
        );

      case 'ACCEPTED':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Ionicons name="person" size={32} color="#4F46E5" />
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{driver.name}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={16} color="#FCD34D" />
                  <Text style={styles.ratingText}>{driver.rating}</Text>
                  <Text style={styles.vehicleText}> • {driver.vehicle}</Text>
                </View>
                <Text style={styles.plateText}>{driver.plate}</Text>
              </View>
              <View style={styles.etaBadge}>
                <Text style={styles.etaText}>{eta}</Text>
              </View>
            </View>

            <Text style={styles.statusMessage}>Your driver is on the way</Text>

            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="call" size={20} color="#4F46E5" />
                <Text style={styles.actionButtonText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="chatbubble" size={20} color="#4F46E5" />
                <Text style={styles.actionButtonText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share" size={20} color="#4F46E5" />
                <Text style={styles.actionButtonText}>Share Trip</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'ARRIVED':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.arrivedBadge}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.arrivedTitle}>Driver has arrived!</Text>
            </View>
            <Text style={styles.statusMessage}>Please meet your driver at the pickup location</Text>
          </View>
        );

      case 'IN_PROGRESS':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.progressHeader}>
              <Ionicons name="navigation" size={24} color="#4F46E5" />
              <View style={styles.progressInfo}>
                <Text style={styles.progressTitle}>On your way</Text>
                <Text style={styles.progressSubtitle}>15 min • 5.2 km</Text>
              </View>
            </View>

            <View style={styles.sosButton}>
              <TouchableOpacity style={styles.sosButtonInner}>
                <Ionicons name="alert-circle" size={24} color="#EF4444" />
                <Text style={styles.sosText}>SOS Emergency</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {rideStatus !== 'SEARCHING' && (
          <>
            <Marker coordinate={{ latitude: 37.78825, longitude: -122.4324 }} title="Pickup">
              <View style={styles.pickupMarker}>
                <Ionicons name="location" size={32} color="#4F46E5" />
              </View>
            </Marker>
            <Marker coordinate={{ latitude: 37.79825, longitude: -122.4224 }} title="Dropoff">
              <View style={styles.dropoffMarker}>
                <Ionicons name="flag" size={32} color="#EF4444" />
              </View>
            </Marker>
          </>
        )}
      </MapView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#1F2937" />
      </TouchableOpacity>

      <View style={styles.bottomSheet}>{renderStatusContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#fff',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
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
  statusContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4F46E5',
  },
  dotAnimated: {
    opacity: 0.5,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  driverCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  vehicleText: {
    fontSize: 14,
    color: '#6B7280',
  },
  plateText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  etaBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  etaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statusMessage: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
    marginTop: 8,
  },
  arrivedBadge: {
    alignItems: 'center',
    marginBottom: 16,
  },
  arrivedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  progressInfo: {
    marginLeft: 12,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  progressSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  sosButton: {
    width: '100%',
  },
  sosButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FCA5A5',
  },
  sosText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    marginLeft: 8,
  },
  pickupMarker: {
    alignItems: 'center',
  },
  dropoffMarker: {
    alignItems: 'center',
  },
});
