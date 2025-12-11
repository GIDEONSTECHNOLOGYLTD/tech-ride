import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { driverAPI } from '../../services/api';

const EarningsScreen = ({ navigation }: any) => {
  const [period, setPeriod] = useState('today');
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadEarnings();
  }, [period]);

  const loadEarnings = async () => {
    setLoading(true);
    try {
      const response = await driverAPI.getEarnings(period);
      setEarnings(response.data.earnings);
    } catch (error: any) {
      console.error('Load earnings error:', error);
      if (error.response?.status === 404) {
        setEarnings({ totalEarnings: 0, totalRides: 0, totalDistance: 0, averagePerRide: 0, rides: [] });
      }
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings</Text>
      </View>

      {/* Period Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodSelector}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodButton, period === p.key && styles.periodButtonActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodText, period === p.key && styles.periodTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#00C851" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView style={styles.content}>
          {/* Total Earnings */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalAmount}>
              ₦{earnings?.totalEarnings?.toLocaleString() || '0'}
            </Text>
            <View style={styles.balanceRow}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Pending</Text>
                <Text style={styles.balanceValue}>
                  ₦{earnings?.pendingBalance?.toLocaleString() || '0'}
                </Text>
              </View>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceLabel}>Available</Text>
                <Text style={[styles.balanceValue, { color: '#00C851' }]}>
                  ₦{earnings?.availableBalance?.toLocaleString() || '0'}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Icon name="car-side" size={24} color="#00C851" />
              <Text style={styles.statValue}>{earnings?.totalRides || 0}</Text>
              <Text style={styles.statLabel}>Rides</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="road-variant" size={24} color="#1E88E5" />
              <Text style={styles.statValue}>
                {earnings?.totalDistance?.toFixed(0) || 0}km
              </Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>

            <View style={styles.statCard}>
              <Icon name="cash" size={24} color="#FFC107" />
              <Text style={styles.statValue}>
                ₦{earnings?.averagePerRide?.toFixed(0) || 0}
              </Text>
              <Text style={styles.statLabel}>Avg/Ride</Text>
            </View>
          </View>

          {/* Withdraw Button */}
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <Icon name="bank-transfer" size={24} color="#FFF" />
            <Text style={styles.withdrawText}>Withdraw to Bank</Text>
          </TouchableOpacity>

          {/* Recent Rides */}
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recent Rides</Text>
            {earnings?.rides?.length > 0 ? (
              earnings.rides.map((ride: any, index: number) => (
                <View key={index} style={styles.rideCard}>
                  <View>
                    <Text style={styles.rideDate}>
                      {new Date(ride.completedAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.rideDistance}>{ride.distance.toFixed(1)} km</Text>
                  </View>
                  <Text style={styles.rideEarning}>₦{ride.driverEarnings.toLocaleString()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.noRides}>No rides yet</Text>
            )}
          </View>
        </ScrollView>
      )}
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
  periodSelector: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  periodButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 10,
  },
  periodButtonActive: {
    backgroundColor: '#00C851',
  },
  periodText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  periodTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  totalCard: {
    backgroundColor: '#00C851',
    margin: 20,
    borderRadius: 15,
    padding: 25,
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  totalAmount: {
    color: '#FFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 5,
  },
  balanceRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  balanceItem: {
    flex: 1,
  },
  balanceLabel: {
    color: '#FFF',
    fontSize: 12,
    opacity: 0.8,
  },
  balanceValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  withdrawButton: {
    backgroundColor: '#1E88E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  withdrawText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  recentSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  rideCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rideDate: {
    fontSize: 14,
    color: '#666',
  },
  rideDistance: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  rideEarning: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00C851',
  },
  noRides: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
});

export default EarningsScreen;
