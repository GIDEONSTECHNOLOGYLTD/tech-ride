import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { userAPI, paymentAPI } from '../services/api.service';

export default function CryptoTopUpScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { amount } = (route.params || {}) as { amount: number };
  
  const [selectedCrypto, setSelectedCrypto] = useState<'BTC' | 'ETH' | 'USDT'>('USDT');
  const [cryptoAmount, setCryptoAmount] = useState<string>('0');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadCryptoDetails();
  }, [selectedCrypto]);

  const loadCryptoDetails = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.getCryptoPrices();
      const prices = response.data.prices;
      
      // Calculate crypto amount
      const cryptoAmt = (amount / prices[selectedCrypto]).toFixed(6);
      setCryptoAmount(cryptoAmt);
      
      // Get wallet address from env (backend will provide)
      const addresses = {
        BTC: process.env.CRYPTO_WALLET_BTC || 'Loading...',
        ETH: process.env.CRYPTO_WALLET_ETH || 'Loading...',
        USDT: process.env.CRYPTO_WALLET_USDT || 'Loading...',
      };
      setWalletAddress(addresses[selectedCrypto]);
    } catch (error) {
      console.error('Failed to load crypto details:', error);
      Alert.alert('Error', 'Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied!', `${label} copied to clipboard`);
  };

  const handleVerifyPayment = async () => {
    Alert.prompt(
      'Enter Transaction Hash',
      'Paste your transaction hash from your crypto wallet',
      async (txHash: string) => {
        if (!txHash) return;
        
        setVerifying(true);
        try {
          await paymentAPI.verifyCryptoPayment(txHash, selectedCrypto);
          Alert.alert(
            'Payment Submitted',
            'Your payment is being verified. This may take 5-30 minutes depending on blockchain confirmations. You will receive a notification once confirmed.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.error || 'Verification failed');
        } finally {
          setVerifying(false);
        }
      }
    );
  };

  const cryptoInfo = {
    BTC: {
      name: 'Bitcoin',
      color: '#F7931A',
      icon: 'logo-bitcoin',
      network: 'Bitcoin Network',
      confirmations: '3 confirmations (~30 minutes)',
    },
    ETH: {
      name: 'Ethereum',
      color: '#627EEA',
      icon: 'logo-bitcoin',
      network: 'Ethereum Mainnet',
      confirmations: '12 confirmations (~3 minutes)',
    },
    USDT: {
      name: 'USDT (Tether)',
      color: '#26A17B',
      icon: 'cash',
      network: 'TRC20 (Tron) - Lowest Fees',
      confirmations: '19 confirmations (~1 minute)',
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crypto Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Amount Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountNaira}>₦{amount?.toLocaleString('en-NG')}</Text>
        </View>

        {/* Crypto Selection */}
        <Text style={styles.sectionTitle}>Select Cryptocurrency</Text>
        <View style={styles.cryptoGrid}>
          {(['BTC', 'ETH', 'USDT'] as const).map((crypto) => (
            <TouchableOpacity
              key={crypto}
              style={[
                styles.cryptoCard,
                selectedCrypto === crypto && { 
                  borderColor: cryptoInfo[crypto].color,
                  backgroundColor: `${cryptoInfo[crypto].color}10`,
                },
              ]}
              onPress={() => setSelectedCrypto(crypto)}
            >
              <Ionicons 
                name={cryptoInfo[crypto].icon as any} 
                size={32} 
                color={cryptoInfo[crypto].color} 
              />
              <Text style={styles.cryptoName}>{cryptoInfo[crypto].name}</Text>
              {selectedCrypto === crypto && (
                <Ionicons name="checkmark-circle" size={24} color={cryptoInfo[crypto].color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {!loading && (
          <>
            {/* Payment Details */}
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Pay Amount:</Text>
                <TouchableOpacity onPress={() => copyToClipboard(cryptoAmount, 'Amount')}>
                  <Text style={styles.detailValue}>{cryptoAmount} {selectedCrypto}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Network:</Text>
                <Text style={styles.detailValue}>{cryptoInfo[selectedCrypto].network}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confirmations:</Text>
                <Text style={styles.detailValue}>{cryptoInfo[selectedCrypto].confirmations}</Text>
              </View>
            </View>

            {/* Wallet Address */}
            <View style={styles.walletCard}>
              <Text style={styles.walletLabel}>Send {selectedCrypto} to this address:</Text>
              <TouchableOpacity 
                style={styles.addressBox}
                onPress={() => copyToClipboard(walletAddress, 'Wallet address')}
              >
                <Text style={styles.addressText}>{walletAddress}</Text>
                <Ionicons name="copy" size={20} color="#3B82F6" />
              </TouchableOpacity>
              <Text style={styles.walletHint}>Tap to copy address</Text>
            </View>

            {/* Instructions */}
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionsTitle}>Payment Instructions</Text>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>
                  Copy the wallet address and amount above
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>
                  Open your crypto wallet app and send the exact {selectedCrypto} amount to our address
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>
                  Copy your transaction hash from your wallet
                </Text>
              </View>
              <View style={styles.instructionStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>4</Text>
                </View>
                <Text style={styles.stepText}>
                  Click "I've Sent Payment" and paste the transaction hash
                </Text>
              </View>
            </View>

            {/* Warning */}
            <View style={styles.warningCard}>
              <Ionicons name="warning" size={24} color="#F59E0B" />
              <Text style={styles.warningText}>
                Send only {selectedCrypto} to this address. Sending any other cryptocurrency will result in permanent loss of funds.
              </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={handleVerifyPayment}
              disabled={verifying}
            >
              {verifying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.verifyButtonText}>I've Sent Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Loading payment details...</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1F2937' },
  content: { flex: 1, padding: 20 },
  amountCard: {
    backgroundColor: '#3B82F6',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  amountLabel: { fontSize: 14, color: '#E0E7FF', marginBottom: 8 },
  amountNaira: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 12 },
  cryptoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  cryptoCard: {
    width: '31%',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  cryptoName: { fontSize: 12, fontWeight: '600', color: '#1F2937', marginTop: 8 },
  detailsCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, marginBottom: 16 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
  walletCard: { backgroundColor: '#EFF6FF', padding: 20, borderRadius: 12, marginBottom: 16 },
  walletLabel: { fontSize: 14, fontWeight: '600', color: '#1E40AF', marginBottom: 12 },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  addressText: { flex: 1, fontSize: 12, color: '#1F2937', fontFamily: 'monospace' },
  walletHint: { fontSize: 12, color: '#3B82F6', textAlign: 'center' },
  instructionsCard: { backgroundColor: '#F9FAFB', padding: 20, borderRadius: 12, marginBottom: 16 },
  instructionsTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16 },
  instructionStep: { flexDirection: 'row', marginBottom: 16 },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: { fontSize: 14, fontWeight: 'bold', color: '#fff' },
  stepText: { flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 20 },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#92400E', lineHeight: 18 },
  verifyButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  verifyButtonText: { fontSize: 16, fontWeight: '600', color: '#fff', marginLeft: 8 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { fontSize: 14, color: '#6B7280', marginTop: 16 },
});
