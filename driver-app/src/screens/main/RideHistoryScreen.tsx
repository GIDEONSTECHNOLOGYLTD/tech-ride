import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { driverAPI } from '../../services/api';
import { format } from 'date-fns';

const RideHistoryScreen = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadRides();
  }, [page]);

  const loadRides = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const response = await driverAPI.getRideHistory(page);
      const newRides = response.data.rides;
      
      if (newRides.length === 0) {
        setHasMore(false);
      } else {
        setRides([...rides, ...newRides]);
      }
    } catch (error) {
      console.error('Load rides error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderRide = ({ item }: any) => (
    <TouchableOpacity style={styles.rideCard}>
      <View style={styles.rideHeader}>
        <View>
          <Text style={styles.rideDate}>
            {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </Text>
          <Text style={styles.rideTime}>
            {format(new Date(item.createdAt), 'hh:mm a')}
          </Text>
        </View>
        <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Icon name="circle-outline" size={12} color="#00C851" />
        <Text style={styles.locationText} numberOfLines={1}>
          {item.pickupLocation?.address}
        </Text>
      </View>

      <View style={styles.locationRow}>
        <Icon name="map-marker" size={12} color="#F44336" />
        <Text style={styles.locationText} numberOfLines={1}>
          {item.dropoffLocation?.address}
        </Text>
      </View>

      <View style={styles.rideFooter}>
        <View style={styles.rideInfo}>
          <Icon name="road-variant" size={16} color="#666" />
          <Text style={styles.rideInfoText}>{item.distance.toFixed(1)} km</Text>
        </View>
        
        <View style={styles.rideInfo}>
          <Icon name="clock-outline" size={16} color="#666" />
          <Text style={styles.rideInfoText}>{item.duration} min</Text>
        </View>

        <Text style={styles.rideEarning}>
          ₦{item.driverEarnings?.toLocaleString() || '0'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return styles.statusCompleted;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ride History</Text>
      </View>

      {/* List */}
      <FlatList
        data={rides}
        renderItem={renderRide}
        keyExtractor={(item: any) => item._id}
        contentContainerStyle={styles.listContent}
        onEndReached={() => setPage(page + 1)}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#00C851" style={{ marginTop: 50 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="car-off" size={60} color="#CCC" />
              <Text style={styles.emptyText}>No rides yet</Text>
            </View>
          )
        }
        ListFooterComponent={
          loading && rides.length > 0 ? (
            <ActivityIndicator size="small" color="#00C851" style={{ marginVertical: 20 }} />
          ) : null
        }
      />
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212121',
  },
  listContent: {
    padding: 20,
  },
  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  rideDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  rideTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusCancelled: {
    backgroundColor: '#FFEBEE',
  },
  statusDefault: {
    backgroundColor: '#F5F5F5',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  rideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  rideInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  rideInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  rideEarning: {
    marginLeft: 'auto',
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C851',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 15,
  },
});

export default RideHistoryScreen;
