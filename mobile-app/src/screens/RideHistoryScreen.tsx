import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { rideAPI } from '../services/api.service';

export default function RideHistoryScreen() {
  const navigation = useNavigation();
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRideHistory();
  }, []);

  const loadRideHistory = async () => {
    try {
      const response = await rideAPI.getRideHistory();
      setRides(response.data.rides || []);
    } catch (error) {
      console.error('Failed to load ride history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return { bg: '#D1FAE5', text: '#10B981' };
      case 'CANCELLED': return { bg: '#FEE2E2', text: '#EF4444' };
      default: return { bg: '#DBEAFE', text: '#3B82F6' };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride History</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {rides.length > 0 ? (
          rides.map((ride) => {
            const statusColor = getStatusColor(ride.status);
            return (
              <View key={ride._id} style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <Text style={styles.rideDate}>
                    {new Date(ride.createdAt).toLocaleDateString()}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {ride.status}
                    </Text>
                  </View>
                </View>
                <View style={styles.locationRow}>
                  <View style={styles.locationDot} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {ride.pickupLocation?.address || 'Pickup location'}
                  </Text>
                </View>
                <View style={styles.locationRow}>
                  <View style={[styles.locationDot, styles.dropoffDot]} />
                  <Text style={styles.locationText} numberOfLines={1}>
                    {ride.dropoffLocation?.address || 'Dropoff location'}
                  </Text>
                </View>
                <View style={styles.rideFooter}>
                  <Text style={styles.vehicleType}>{ride.vehicleType || 'Economy'}</Text>
                  <Text style={styles.rideFare}>${ride.fare?.toFixed(2) || '0.00'}</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No rides yet</Text>
            <Text style={styles.emptySubtext}>Request your first ride to get started</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  content: { flex: 1, padding: 20 },
  rideCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 16 },
  rideHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  rideDate: { fontSize: 14, color: '#6B7280' },
  statusBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, color: '#10B981', fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#4F46E5', marginRight: 12 },
  dropoffDot: { backgroundColor: '#EF4444' },
  locationText: { fontSize: 14, color: '#1F2937' },
  rideFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  vehicleType: { fontSize: 14, color: '#6B7280' },
  rideFare: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6B7280', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#9CA3AF', marginTop: 8 },
});
