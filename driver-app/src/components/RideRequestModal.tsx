import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRide } from '../context/RideContext';

const { width } = Dimensions.get('window');

const RideRequestModal = () => {
  const { pendingRides, acceptRide } = useRide();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pendingRides.length === 0) return null;

  const ride = pendingRides[currentIndex];

  const handleAccept = async () => {
    await acceptRide(ride.id);
    if (currentIndex < pendingRides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleReject = () => {
    if (currentIndex < pendingRides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Icon name="car-side" size={40} color="#00C851" />
            <Text style={styles.title}>New Ride Request!</Text>
            <Text style={styles.subtitle}>
              {pendingRides.length} request{pendingRides.length > 1 ? 's' : ''} waiting
            </Text>
          </View>

          {/* Ride Details */}
          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Icon name="map-marker" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Pickup</Text>
                <Text style={styles.detailValue}>{ride.pickup}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="map-marker-check" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Dropoff</Text>
                <Text style={styles.detailValue}>{ride.dropoff}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Icon name="road-variant" size={20} color="#666" />
              <View style={styles.detailText}>
                <Text style={styles.detailLabel}>Distance</Text>
                <Text style={styles.detailValue}>{ride.distance.toFixed(1)} km</Text>
              </View>
            </View>

            <View style={styles.fareContainer}>
              <Text style={styles.fareLabel}>You'll Earn</Text>
              <Text style={styles.fareAmount}>₦{ride.fare.toLocaleString()}</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
            >
              <Text style={styles.rejectText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
            >
              <Text style={styles.acceptText}>Accept Ride</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width - 40,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  details: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailText: {
    marginLeft: 15,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#212121',
    marginTop: 2,
  },
  fareContainer: {
    backgroundColor: '#F0F9FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00C851',
    marginTop: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  rejectText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButton: {
    flex: 2,
    backgroundColor: '#00C851',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RideRequestModal;
