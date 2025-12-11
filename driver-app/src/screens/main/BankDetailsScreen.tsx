import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { driverAPI } from '../../services/api';

const BankDetailsScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    accountNumber: '',
    bankName: '',
    bankCode: '',
  });

  useEffect(() => {
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    setLoading(true);
    try {
      const response = await driverAPI.getProfile();
      if (response.data.driver.bankDetails) {
        setBankDetails(response.data.driver.bankDetails);
      }
    } catch (error) {
      console.error('Load bank details error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.bankName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (bankDetails.accountNumber.length < 10) {
      Alert.alert('Error', 'Account number must be at least 10 digits');
      return;
    }

    setSaving(true);
    try {
      await driverAPI.updateBankDetails(bankDetails);
      Alert.alert('Success', 'Bank details updated successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update bank details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00C851" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bank Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Icon name="information" size={20} color="#1E88E5" />
          <Text style={styles.infoText}>
            Enter your bank account details to receive your earnings
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Name</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.accountName}
              onChangeText={(text) => setBankDetails({ ...bankDetails, accountName: text })}
              placeholder="Enter account name"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.accountNumber}
              onChangeText={(text) => setBankDetails({ ...bankDetails, accountNumber: text })}
              placeholder="Enter account number"
              keyboardType="number-pad"
              maxLength={10}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Name</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.bankName}
              onChangeText={(text) => setBankDetails({ ...bankDetails, bankName: text })}
              placeholder="e.g., GTBank, Access Bank, Zenith Bank"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Bank Code (Optional)</Text>
            <TextInput
              style={styles.input}
              value={bankDetails.bankCode}
              onChangeText={(text) => setBankDetails({ ...bankDetails, bankCode: text })}
              placeholder="Enter bank code"
              keyboardType="number-pad"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Icon name="check" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Save Bank Details</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  infoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#1E88E5',
    lineHeight: 20,
  },
  form: {
    padding: 20,
    paddingTop: 0,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: '#00C851',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default BankDetailsScreen;
