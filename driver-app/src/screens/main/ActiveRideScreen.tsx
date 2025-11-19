import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useRide } from '../../context/RideContext';
import socketService from '../../services/socket';

const { height } = Dimensions.get('window');

const ActiveRideScreen = () => {
  const { currentRide, startRide, completeRide, cancelRide } = useRide();
  const [region, setRegion] = useState<any>(null);

  useEffect(() => {
    if (currentRide) {
      setRegion({
        latitude: currentRide.pickup.coordinates[1],
        longitude: currentRide.pickup.coordinates[0],
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentRide]);

  if (!currentRide) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="car-off" size={60} color="#CCC" />
        <Text style={styles.emptyText}>No active ride</Text>
      </View>
    );
  }

  const handleNavigate = () => {
    const destination =
      currentRide.status === 'ACCEPTED' || currentRide.status === 'ARRIVED'
        ? currentRide.pickup
        : currentRide.dropoff;

    const url = `google.maps:q=${destination}`;
    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open navigation app');
      }
    });
  };

  const handleArrived = () => {
    Alert.alert(
      'Arrived at Pickup',
      'Confirm you have arrived at the pickup location',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            socketService.driverArrived(currentRide.id);
          },
        },
      ]
    );
  };

  const handleStart = () => {
    Alert.alert('Start Ride', 'Confirm rider is in the vehicle', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Start', onPress: () => startRide() },
    ]);
  };

  const handleComplete = () => {
    Alert.alert('Complete Ride', 'Have you reached the destination?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Complete', onPress: () => completeRide() },
    ]);
  };

  const handleCancel = () => {
    Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: () => {
          // Show reason picker
          Alert.prompt(
            'Cancellation Reason',
            'Please provide a reason',
            (reason) => cancelRide(reason || 'Driver cancelled'),
            'plain-text'
          );
        },
      },
    ]);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${currentRide.rider.phone}`);
  };

  const getActionButton = () => {
    switch (currentRide.status) {
      case 'ACCEPTED':
        return (
          <TouchableOpacity style={styles.primaryButton} onPress={handleArrived}>
            <Icon name="map-marker-check" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>I've Arrived</Text>
          </TouchableOpacity>
        );
      case 'ARRIVED':
        return (
          <TouchableOpacity style={styles.primaryButton} onPress={handleStart}>
            <Icon name="play-circle" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Start Ride</Text>
          </TouchableOpacity>
        );
      case 'IN_PROGRESS':
        return (
          <TouchableOpacity style={styles.primaryButton} onPress={handleComplete}>
            <Icon name="check-circle" size={24} color="#FFF" />
            <Text style={styles.primaryButtonText}>Complete Ride</Text>
          </TouchableOpacity>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      {region && (
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation
          showsMyLocationButton
        >
          <Marker
            coordinate={{
              latitude: currentRide.pickup.coordinates[1],
              longitude: currentRide.pickup.coordinates[0],
            }}
            title="Pickup"
            pinColor="#00C851"
          />
          <Marker
            coordinate={{
              latitude: currentRide.dropoff.coordinates[1],
              longitude: currentRide.dropoff.coordinates[0],
            }}
            title="Dropoff"
            pinColor="#F44336"
          />
        </MapView>
      )}

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={[styles.statusBadge, getStatusStyle(currentRide.status)]}>
          <Text style={styles.statusText}>{currentRide.status}</Text>
        </View>
        <Text style={styles.fareText}>₦{currentRide.fare.toLocaleString()}</Text>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Rider Info */}
        <View style={styles.riderInfo}>
          <View style={styles.avatar}>
            <Icon name="account" size={30} color="#FFF" />
          </View>
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>{currentRide.rider.name}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={14} color="#FFC107" />
              <Text style={styles.riderRating}>{currentRide.rider.rating.toFixed(1)}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Icon name="phone" size={24} color="#00C851" />
          </TouchableOpacity>
        </View>

        {/* Locations */}
        <View style={styles.locations}>
          <View style={styles.locationRow}>
            <Icon name="circle-outline" size={16} color="#00C851" />
            <Text style={styles.locationText} numberOfLines={1}>
              {currentRide.pickup}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={16} color="#F44336" />
            <Text style={styles.locationText} numberOfLines={1}>
              {currentRide.dropoff}
            </Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Icon name="road-variant" size={20} color="#666" />
            <Text style={styles.statText}>{currentRide.distance.toFixed(1)} km</Text>
          </View>
          <View style={styles.stat}>
            <Icon name="car" size={20} color="#666" />
            <Text style={styles.statText}>{currentRide.vehicleType}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.secondaryButton} onPress={handleNavigate}>
            <Icon name="navigation" size={20} color="#00C851" />
            <Text style={styles.secondaryButtonText}>Navigate</Text>
          </TouchableOpacity>

          {getActionButton()}

          <TouchableOpacity style={styles.dangerButton} onPress={handleCancel}>
            <Icon name="close-circle" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'ACCEPTED':
      return { backgroundColor: '#1E88E5' };
    case 'ARRIVED':
      return { backgroundColor: '#FFC107' };
    case 'IN_PROGRESS':
      return { backgroundColor: '#00C851' };
    default:
      return { backgroundColor: '#666' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    width: '100%',
    height: height * 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
  statusBar: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  fareText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00C851',
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderDetails: {
    flex: 1,
    marginLeft: 15,
  },
  riderName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  riderRating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  callButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locations: {
    marginBottom: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#00C851',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#F0F9FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#00C851',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  dangerButton: {
    width: 50,
    height: 50,
    backgroundColor: '#FFEBEE',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActiveRideScreen;
