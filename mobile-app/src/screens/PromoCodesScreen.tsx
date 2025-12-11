import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { promoAPI } from '../services/api.service';

export default function PromoCodesScreen() {
  const navigation = useNavigation();
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    setLoading(true);
    try {
      const response = await promoAPI.validatePromoCode(promoCode);
      Alert.alert(
        'Success',
        `Promo code applied! You saved ₦${response.data.discount}`,
        [{ text: 'OK', onPress: () => setPromoCode('') }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Invalid promo code');
    } finally {
      setLoading(false);
    }
  };

  const availablePromos = [
    {
      code: 'WELCOME10',
      title: 'Welcome Bonus',
      description: '10% off your first 5 rides',
      discount: '10%',
      expiry: 'Dec 31, 2025',
    },
    {
      code: 'RIDE50',
      title: 'Ride More, Save More',
      description: '₦50 off rides above ₦500',
      discount: '₦50',
      expiry: 'Jan 15, 2026',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Promo Codes</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Apply Promo */}
      <View style={styles.applySection}>
        <Text style={styles.sectionTitle}>Have a promo code?</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
            placeholderTextColor="#9CA3AF"
          />
          <TouchableOpacity
            style={[styles.applyButton, loading && styles.applyButtonDisabled]}
            onPress={handleApplyPromo}
            disabled={loading}
          >
            <Text style={styles.applyButtonText}>
              {loading ? 'Applying...' : 'Apply'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Available Promos */}
      <View style={styles.promosSection}>
        <Text style={styles.sectionTitle}>Available Promos</Text>
        {availablePromos.map((promo, index) => (
          <View key={index} style={styles.promoCard}>
            <View style={styles.promoIcon}>
              <Ionicons name="pricetag" size={32} color="#4F46E5" />
            </View>
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>{promo.title}</Text>
              <Text style={styles.promoDescription}>{promo.description}</Text>
              <View style={styles.promoFooter}>
                <Text style={styles.promoCode}>{promo.code}</Text>
                <Text style={styles.promoExpiry}>Expires: {promo.expiry}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => {
                setPromoCode(promo.code);
                Alert.alert('Copied', `Promo code "${promo.code}" copied!`);
              }}
            >
              <Ionicons name="copy-outline" size={20} color="#4F46E5" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Info */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color="#4F46E5" />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>How to use promo codes</Text>
          <Text style={styles.infoText}>
            1. Enter your promo code above{'\n'}
            2. Code will be applied automatically{'\n'}
            3. Discount shows on your next ride
          </Text>
        </View>
      </View>
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
  applySection: {
    backgroundColor: '#FFF',
    padding: 20,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
  },
  applyButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
  },
  applyButtonDisabled: {
    opacity: 0.5,
  },
  applyButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  promosSection: {
    marginTop: 20,
    padding: 20,
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  promoIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
    marginLeft: 16,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  promoExpiry: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  copyButton: {
    padding: 8,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
