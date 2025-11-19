import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function RideHistoryScreen() {
  const navigation = useNavigation();

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
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <Text style={styles.rideDate}>Nov {18 + i}, 2024</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>
            <View style={styles.locationRow}>
              <View style={styles.locationDot} />
              <Text style={styles.locationText}>123 Main St, Downtown</Text>
            </View>
            <View style={styles.locationRow}>
              <View style={[styles.locationDot, styles.dropoffDot]} />
              <Text style={styles.locationText}>456 Oak Ave, Uptown</Text>
            </View>
            <View style={styles.rideFooter}>
              <Text style={styles.vehicleType}>Economy</Text>
              <Text style={styles.rideFare}>$8.50</Text>
            </View>
          </View>
        ))}
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
});
