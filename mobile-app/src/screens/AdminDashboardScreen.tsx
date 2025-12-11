import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminDashboardScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalRides: 0,
    activeRides: 0,
    totalDrivers: 0,
    totalRiders: 0,
    revenue: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // In production, fetch from admin API endpoints
      // For now, redirect to web dashboard
      setLoading(false);
    } catch (error) {
      console.error('Failed to load admin dashboard:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const openWebDashboard = () => {
    // Open web dashboard in browser
    const webUrl = 'https://techride-admin.onrender.com';
    // You can use Linking.openURL(webUrl) to open in browser
    alert(`Please visit: ${webUrl}\n\nFor full admin features, use the web dashboard.`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Profile' as never)}>
          <Ionicons name="person-circle" size={32} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Admin Notice */}
      <View style={styles.noticeCard}>
        <Ionicons name="information-circle" size={32} color="#4F46E5" />
        <View style={styles.noticeContent}>
          <Text style={styles.noticeTitle}>Full Dashboard Available</Text>
          <Text style={styles.noticeText}>
            For complete admin features, use the web dashboard at techride-admin.onrender.com
          </Text>
          <TouchableOpacity style={styles.webButton} onPress={openWebDashboard}>
            <Ionicons name="globe" size={20} color="#FFF" />
            <Text style={styles.webButtonText}>Open Web Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <Text style={styles.sectionTitle}>Quick Overview</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="car" size={32} color="#4F46E5" />
          <Text style={styles.statValue}>{stats.totalRides}</Text>
          <Text style={styles.statLabel}>Total Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="timer" size={32} color="#10B981" />
          <Text style={styles.statValue}>{stats.activeRides}</Text>
          <Text style={styles.statLabel}>Active Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="people" size={32} color="#F59E0B" />
          <Text style={styles.statValue}>{stats.totalDrivers}</Text>
          <Text style={styles.statLabel}>Drivers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="person" size={32} color="#EF4444" />
          <Text style={styles.statValue}>{stats.totalRiders}</Text>
          <Text style={styles.statLabel}>Riders</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <TouchableOpacity style={styles.actionCard} onPress={openWebDashboard}>
        <Ionicons name="people" size={24} color="#4F46E5" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Manage Drivers</Text>
          <Text style={styles.actionSubtitle}>Approve, reject, view all drivers</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={openWebDashboard}>
        <Ionicons name="car" size={24} color="#4F46E5" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Manage Rides</Text>
          <Text style={styles.actionSubtitle}>View all rides, filter by status</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={openWebDashboard}>
        <Ionicons name="pricetag" size={24} color="#4F46E5" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Promo Codes</Text>
          <Text style={styles.actionSubtitle}>Create and manage promotions</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={openWebDashboard}>
        <Ionicons name="cash" size={24} color="#4F46E5" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Payments & Revenue</Text>
          <Text style={styles.actionSubtitle}>Track all transactions</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionCard} onPress={openWebDashboard}>
        <Ionicons name="settings" size={24} color="#4F46E5" />
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Platform Settings</Text>
          <Text style={styles.actionSubtitle}>Configure app settings</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  noticeText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  webButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4F46E5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  webButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    margin: '1.5%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionContent: {
    flex: 1,
    marginLeft: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});
