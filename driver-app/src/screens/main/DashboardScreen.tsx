import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { driverAPI } from '../../services/api';
import socketService from '../../services/socket';
import { useRide } from '../../context/RideContext';
import { watchLocation, clearLocationWatch } from '../../utils/permissions';
import RideRequestModal from '../../components/RideRequestModal';

const DashboardScreen = () => {
  const [isOnline, setIsOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const { currentRide, pendingRides } = useRide();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isOnline) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }
    
    // Cleanup on unmount
    return () => {
      stopLocationTracking();
    };
  }, [isOnline]);

  const loadData = async () => {
    try {
      const [statsRes, earningsRes] = await Promise.all([
        driverAPI.getStats(),
        driverAPI.getEarnings('today'),
      ]);
      setStats(statsRes.data.stats);
      setEarnings(earningsRes.data.earnings);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const startLocationTracking = () => {
    // Stop existing watch if any
    if (locationWatchId !== null) {
      clearLocationWatch(locationWatchId);
    }
    
    const watchId = watchLocation((location) => {
      // Update location via API
      driverAPI.updateLocation(location.latitude, location.longitude, location.heading)
        .catch(error => console.error('Location update error:', error));
      
      // Update via socket for real-time
      socketService.updateLocation(location.latitude, location.longitude, location.heading);
    });
    setLocationWatchId(watchId);
  };

  const stopLocationTracking = () => {
    if (locationWatchId !== null) {
      clearLocationWatch(locationWatchId);
      setLocationWatchId(null);
    }
  };

  const toggleOnlineStatus = async () => {
    setLoading(true);
    try {
      const newStatus = !isOnline;
      await driverAPI.updateStatus(newStatus);
      socketService.updateStatus(newStatus, newStatus);
      setIsOnline(newStatus);
      
      Alert.alert(
        'Status Updated',
        newStatus ? '✅ You are now ONLINE and can receive ride requests' : '❌ You are now OFFLINE'
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, isOnline && styles.statusDotOnline]} />
          <Text style={styles.statusText}>{isOnline ? 'ONLINE' : 'OFFLINE'}</Text>
        </View>
      </View>

      {/* Main Toggle */}
      <View style={styles.mainToggle}>
        <View style={styles.toggleContainer}>
          <Icon
            name="steering"
            size={80}
            color={isOnline ? '#00C851' : '#CCC'}
          />
          <Text style={styles.toggleTitle}>
            {isOnline ? 'You are Online!' : 'Go Online to Accept Rides'}
          </Text>
          
          {loading ? (
            <ActivityIndicator size="large" color="#00C851" style={{ marginTop: 20 }} />
          ) : (
            <TouchableOpacity
              style={[styles.toggleButton, isOnline && styles.toggleButtonOnline]}
              onPress={toggleOnlineStatus}
            >
              <Text style={styles.toggleButtonText}>
                {isOnline ? 'GO OFFLINE' : 'GO ONLINE'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Today's Earnings */}
      <View style={styles.earningsCard}>
        <View style={styles.earningsHeader}>
          <Icon name="cash-multiple" size={24} color="#00C851" />
          <Text style={styles.earningsTitle}>Today's Earnings</Text>
        </View>
        <Text style={styles.earningsAmount}>
          ₦{earnings?.totalEarnings?.toLocaleString() || '0'}
        </Text>
        <View style={styles.earningsStats}>
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>{earnings?.totalRides || 0}</Text>
            <Text style={styles.earningStatLabel}>Rides</Text>
          </View>
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>
              {earnings?.totalDistance?.toFixed(1) || '0'}km
            </Text>
            <Text style={styles.earningStatLabel}>Distance</Text>
          </View>
          <View style={styles.earningStat}>
            <Text style={styles.earningStatValue}>
              ₦{earnings?.averagePerRide?.toFixed(0) || '0'}
            </Text>
            <Text style={styles.earningStatLabel}>Avg/Ride</Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Icon name="star" size={24} color="#FFC107" />
          <Text style={styles.statValue}>{stats?.rating?.toFixed(1) || '0.0'}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="check-circle" size={24} color="#00C851" />
          <Text style={styles.statValue}>{stats?.completedRides || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        
        <View style={styles.statCard}>
          <Icon name="percent" size={24} color="#1E88E5" />
          <Text style={styles.statValue}>{stats?.acceptanceRate || 0}%</Text>
          <Text style={styles.statLabel}>Acceptance</Text>
        </View>
      </View>

      {/* Current Ride Status */}
      {currentRide && (
        <View style={styles.activeRideAlert}>
          <Icon name="car-side" size={24} color="#FFF" />
          <Text style={styles.activeRideText}>Ride in Progress</Text>
        </View>
      )}

      {/* Ride Request Modal */}
      {pendingRides.length > 0 && <RideRequestModal />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#CCC',
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#00C851',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  mainToggle: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toggleContainer: {
    alignItems: 'center',
  },
  toggleTitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 15,
    textAlign: 'center',
  },
  toggleButton: {
    backgroundColor: '#00C851',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 20,
  },
  toggleButtonOnline: {
    backgroundColor: '#F44336',
  },
  toggleButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  earningsCard: {
    backgroundColor: '#FFF',
    margin: 20,
    marginTop: 0,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  earningsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  earningsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginLeft: 10,
  },
  earningsAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00C851',
    marginVertical: 10,
  },
  earningsStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  earningStat: {
    alignItems: 'center',
  },
  earningStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  earningStatLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeRideAlert: {
    backgroundColor: '#00C851',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    margin: 20,
    borderRadius: 10,
  },
  activeRideText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default DashboardScreen;
