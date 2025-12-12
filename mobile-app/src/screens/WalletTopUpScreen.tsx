import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { userAPI } from '../services/api.service';

export default function WalletTopUpScreen() {
  const navigation = useNavigation();
  const [customAmount, setCustomAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const quickAmounts = [50, 100, 200, 500, 1000, 2000, 5000, 10000];

  const handleQuickAmount = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount(amount.toString());
  };

  const handleTopUpWithPaystack = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount < 5) {
      Alert.alert('Invalid Amount', 'Minimum top-up amount is ₦5');
      return;
    }

    setLoading(true);
    try {
      const response = await userAPI.topupWallet(amount, 'PAYSTACK');
      
      if (response.data.success && response.data.paymentUrl) {
        // Navigate to Paystack webview
        navigation.navigate('PaystackWebView' as never, {
          url: response.data.paymentUrl,
          reference: response.data.reference,
          type: 'wallet_topup',
          amount: amount,
        } as never);
      } else {
        Alert.alert('Error', 'Failed to initialize payment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Top-up failed');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUpWithCrypto = () => {
    const amount = selectedAmount || parseFloat(customAmount);
    
    if (!amount || amount < 5) {
      Alert.alert('Invalid Amount', 'Minimum top-up amount is ₦5');
      return;
    }

    // Navigate to crypto payment screen
    navigation.navigate('CryptoTopUp' as never, { amount } as never);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3B82F6" />
          <Text style={styles.infoText}>
            Add money to your wallet for faster checkout. Your funds are secure and can only be used for rides.
          </Text>
        </View>

        {/* Quick Amount Selection */}
        <Text style={styles.sectionTitle}>Select Amount</Text>
        <View style={styles.amountGrid}>
          {quickAmounts.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={[
                styles.amountCard,
                selectedAmount === amount && styles.amountCardSelected,
              ]}
              onPress={() => handleQuickAmount(amount)}
            >
              <Text
                style={[
                  styles.amountText,
                  selectedAmount === amount && styles.amountTextSelected,
                ]}
              >
                ₦{amount.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Amount */}
        <Text style={styles.sectionTitle}>Or Enter Custom Amount</Text>
        <View style={styles.customAmountContainer}>
          <Text style={styles.currencySymbol}>₦</Text>
          <TextInput
            style={styles.customAmountInput}
            placeholder="Enter amount (min. ₦5)"
            keyboardType="numeric"
            value={customAmount}
            onChangeText={(text) => {
              setCustomAmount(text);
              setSelectedAmount(null);
            }}
          />
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {/* Paystack Card Payment */}
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={handleTopUpWithPaystack}
          disabled={loading}
        >
          <View style={[styles.paymentIcon, { backgroundColor: '#00C3F7' }]}>
            <Ionicons name="card" size={28} color="#FFF" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Card Payment</Text>
            <Text style={styles.paymentDesc}>
              Pay with your debit/credit card via Paystack
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Bank Transfer */}
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={handleTopUpWithPaystack}
          disabled={loading}
        >
          <View style={[styles.paymentIcon, { backgroundColor: '#10B981' }]}>
            <Ionicons name="business" size={28} color="#FFF" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Bank Transfer</Text>
            <Text style={styles.paymentDesc}>
              Pay directly from your bank account
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Cryptocurrency */}
        <TouchableOpacity
          style={styles.paymentCard}
          onPress={handleTopUpWithCrypto}
          disabled={loading}
        >
          <View style={[styles.paymentIcon, { backgroundColor: '#F59E0B' }]}>
            <Ionicons name="logo-bitcoin" size={28} color="#FFF" />
          </View>
          <View style={styles.paymentInfo}>
            <Text style={styles.paymentName}>Cryptocurrency</Text>
            <Text style={styles.paymentDesc}>
              Pay with Bitcoin, Ethereum, or USDT
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" />
          <Text style={styles.securityText}>
            Your funds are secure. Wallet balance can only be used for rides within the app.
          </Text>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  amountCard: {
    width: '47%',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  amountCardSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  amountTextSelected: {
    color: '#3B82F6',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  customAmountInput: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 16,
    color: '#1F2937',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentDesc: {
    fontSize: 14,
    color: '#6B7280',
  },
  securityNote: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 32,
  },
  securityText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 13,
    color: '#166534',
    lineHeight: 18,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
