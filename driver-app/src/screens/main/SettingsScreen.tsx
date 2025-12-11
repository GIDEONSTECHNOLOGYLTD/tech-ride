import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const SettingsScreen = ({ navigation }: any) => {
  const [settings, setSettings] = useState({
    notifications: true,
    soundEffects: true,
    rideAlerts: true,
    locationSharing: true,
    autoAccept: false,
    offlineMode: false,
  });

  const toggleSetting = (key: string) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setSettings({
              notifications: true,
              soundEffects: true,
              rideAlerts: true,
              locationSharing: true,
              autoAccept: false,
              offlineMode: false,
            });
            Alert.alert('Success', 'Settings reset to default');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="bell" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive ride requests and updates</Text>
              </View>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="volume-high" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDescription}>Play sounds for notifications</Text>
              </View>
            </View>
            <Switch
              value={settings.soundEffects}
              onValueChange={() => toggleSetting('soundEffects')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="car-clock" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Ride Alerts</Text>
                <Text style={styles.settingDescription}>Alert when ride is approaching</Text>
              </View>
            </View>
            <Switch
              value={settings.rideAlerts}
              onValueChange={() => toggleSetting('rideAlerts')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="map-marker" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Location Sharing</Text>
                <Text style={styles.settingDescription}>Share real-time location with riders</Text>
              </View>
            </View>
            <Switch
              value={settings.locationSharing}
              onValueChange={() => toggleSetting('locationSharing')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Ride Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="check-circle" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Auto-Accept Rides</Text>
                <Text style={styles.settingDescription}>Automatically accept ride requests</Text>
              </View>
            </View>
            <Switch
              value={settings.autoAccept}
              onValueChange={() => toggleSetting('autoAccept')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Icon name="wifi-off" size={24} color="#666" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Offline Mode</Text>
                <Text style={styles.settingDescription}>Work with limited connectivity</Text>
              </View>
            </View>
            <Switch
              value={settings.offlineMode}
              onValueChange={() => toggleSetting('offlineMode')}
              trackColor={{ false: '#CCC', true: '#00C851' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* App Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Data</Text>
          
          <TouchableOpacity style={styles.actionItem} onPress={handleClearCache}>
            <Icon name="delete-sweep" size={24} color="#F44336" />
            <Text style={[styles.actionText, { color: '#F44336' }]}>Clear Cache</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={handleResetSettings}>
            <Icon name="refresh" size={24} color="#FF9800" />
            <Text style={[styles.actionText, { color: '#FF9800' }]}>Reset Settings</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>App Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Build Number</Text>
            <Text style={styles.infoValue}>2024.12</Text>
          </View>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="file-document-outline" size={24} color="#666" />
            <Text style={styles.actionText}>Terms of Service</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <Icon name="shield-check" size={24} color="#666" />
            <Text style={styles.actionText}>Privacy Policy</Text>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFF',
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginLeft: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 15,
  },
  settingLabel: {
    fontSize: 16,
    color: '#212121',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    marginLeft: 15,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#212121',
    fontWeight: '600',
  },
});

export default SettingsScreen;
