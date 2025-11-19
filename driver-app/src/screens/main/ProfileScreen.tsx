import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../context/AuthContext';
import { driverAPI } from '../../services/api';

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await driverAPI.getProfile();
      setProfile(response.data.driver);
    } catch (error) {
      console.error('Load profile error:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Icon name="account" size={60} color="#FFF" />
        </View>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.phone}>{user?.phoneNumber}</Text>
        <View style={styles.ratingContainer}>
          <Icon name="star" size={20} color="#FFC107" />
          <Text style={styles.rating}>{profile?.rating?.toFixed(1) || '0.0'}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.totalRides || 0}</Text>
          <Text style={styles.statLabel}>Rides</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile?.acceptanceRate || 0}%</Text>
          <Text style={styles.statLabel}>Acceptance</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>
            ₦{(profile?.totalEarnings || 0).toLocaleString()}
          </Text>
          <Text style={styles.statLabel}>Earned</Text>
        </View>
      </View>

      {/* Vehicle Info */}
      {profile && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Icon name="car" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Vehicle</Text>
                <Text style={styles.infoValue}>
                  {profile.vehicleMake} {profile.vehicleModel} ({profile.vehicleYear})
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="card-text" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Plate Number</Text>
                <Text style={styles.infoValue}>{profile.licensePlate}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="palette" size={20} color="#666" />
              <View style={styles.infoText}>
                <Text style={styles.infoLabel}>Color</Text>
                <Text style={styles.infoValue}>{profile.vehicleColor}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Menu Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.menuItem}>
          <Icon name="bank" size={24} color="#666" />
          <Text style={styles.menuText}>Bank Details</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="file-document" size={24} color="#666" />
          <Text style={styles.menuText}>Documents</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="cog" size={24} color="#666" />
          <Text style={styles.menuText}>Settings</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Icon name="help-circle" size={24} color="#666" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Icon name="logout" size={24} color="#F44336" />
          <Text style={[styles.menuText, { color: '#F44336' }]}>Logout</Text>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#00C851',
    padding: 30,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  phone: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212121',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoText: {
    marginLeft: 15,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 15,
  },
});

export default ProfileScreen;
