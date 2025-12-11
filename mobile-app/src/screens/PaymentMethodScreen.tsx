import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { paymentAPI, userAPI } from '../services/api.service';

interface PaymentMethodScreenProps {
  navigation: any;
  route: {
    params: {
      rideId: string;
      amount: number;
    };
  };
}

const PaymentMethodScreen: React.FC<PaymentMethodScreenProps> = ({ navigation, route }) => {
  const params = route.params || {};
  const rideId = params.rideId;
  const amount = params.amount;
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [cryptoPrices, setCryptoPrices] = useState<any>(null);

  useEffect(() => {
    if (!rideId || !amount) {
      Alert.alert('Error', 'Missing ride information', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
    loadWalletAndPrices();
  }, [rideId, amount]);

  const loadWalletAndPrices = async () => {
    try {
      const [walletRes, pricesRes] = await Promise.all([
        userAPI.getWallet(),
        paymentAPI.getCryptoPrices(),
      ]);
      setWallet(walletRes.data.wallet);
      setCryptoPrices(pricesRes.data.prices);
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const handlePaystack = async () => {
    setLoading(true);
    try {
      const response = await paymentAPI.initializePaystackPayment(rideId, amount);
      const { authorizationUrl } = response.data;
      
      // Navigate to Paystack webview
      navigation.navigate('PaystackWebView', {
        url: authorizationUrl,
        rideId,
      });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWallet = async () => {
    if (!wallet || wallet.balance < amount) {
      Alert.alert('Insufficient Balance', 'Please top up your wallet first');
      return;
    }

    Alert.alert(
      'Pay with Wallet',
      `Pay ₦${amount.toLocaleString()} from your wallet?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay',
          onPress: async () => {
            setLoading(true);
            try {
              await paymentAPI.payWithWallet(rideId, amount);
              Alert.alert('Success', 'Payment successful!', [
                { text: 'OK', onPress: () => navigation.navigate('RideTracking', { rideId }) },
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Payment failed');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCrypto = (currency: string) => {
    if (!cryptoPrices) return;

    const cryptoAmount = (amount / cryptoPrices[currency]).toFixed(6);
    
    navigation.navigate('CryptoPayment', {
      rideId,
      amount,
      currency,
      cryptoAmount,
    });
  };

  const handleCash = async () => {
    Alert.alert(
      'Pay with Cash',
      'You will pay the driver directly in cash',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setLoading(true);
            try {
              await paymentAPI.payWithCash(rideId);
              navigation.navigate('RideTracking', { rideId });
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to confirm');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Amount */}
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount to Pay</Text>
        <Text style={styles.amountValue}>₦{amount.toLocaleString()}</Text>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Payment Method</Text>

        {/* Paystack */}
        <TouchableOpacity
          style={styles.methodCard}
          onPress={handlePaystack}
          disabled={loading}
        >
          <View style={[styles.methodIcon, { backgroundColor: '#00C3F7' }]}>
            <Icon name="credit-card" size={24} color="#FFF" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Card Payment</Text>
            <Text style={styles.methodDesc}>Pay with debit/credit card via Paystack</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* Wallet */}
        <TouchableOpacity
          style={styles.methodCard}
          onPress={handleWallet}
          disabled={loading}
        >
          <View style={[styles.methodIcon, { backgroundColor: '#00C851' }]}>
            <Icon name="wallet" size={24} color="#FFF" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Wallet</Text>
            <Text style={styles.methodDesc}>
              Balance: ₦{wallet?.balance?.toLocaleString() || '0'}
            </Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>

        {/* Crypto */}
        <View style={styles.cryptoSection}>
          <Text style={styles.cryptoTitle}>Cryptocurrency</Text>
          
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleCrypto('BTC')}
            disabled={loading}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#F7931A' }]}>
              <Icon name="bitcoin" size={24} color="#FFF" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Bitcoin (BTC)</Text>
              {cryptoPrices && (
                <Text style={styles.methodDesc}>
                  ≈ {(amount / cryptoPrices.BTC).toFixed(6)} BTC
                </Text>
              )}
            </View>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleCrypto('ETH')}
            disabled={loading}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#627EEA' }]}>
              <Icon name="ethereum" size={24} color="#FFF" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>Ethereum (ETH)</Text>
              {cryptoPrices && (
                <Text style={styles.methodDesc}>
                  ≈ {(amount / cryptoPrices.ETH).toFixed(6)} ETH
                </Text>
              )}
            </View>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => handleCrypto('USDT')}
            disabled={loading}
          >
            <View style={[styles.methodIcon, { backgroundColor: '#26A17B' }]}>
              <Icon name="currency-usd" size={24} color="#FFF" />
            </View>
            <View style={styles.methodInfo}>
              <Text style={styles.methodName}>USDT (Tether)</Text>
              {cryptoPrices && (
                <Text style={styles.methodDesc}>
                  ≈ {(amount / cryptoPrices.USDT).toFixed(2)} USDT
                </Text>
              )}
            </View>
            <Icon name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Cash */}
        <TouchableOpacity
          style={styles.methodCard}
          onPress={handleCash}
          disabled={loading}
        >
          <View style={[styles.methodIcon, { backgroundColor: '#4CAF50' }]}>
            <Icon name="cash" size={24} color="#FFF" />
          </View>
          <View style={styles.methodInfo}>
            <Text style={styles.methodName}>Cash</Text>
            <Text style={styles.methodDesc}>Pay driver directly</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#CCC" />
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00C851" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  amountCard: {
    backgroundColor: '#00C851',
    margin: 20,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  amountLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.9,
  },
  amountValue: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 15,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  methodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  methodDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cryptoSection: {
    marginTop: 20,
  },
  cryptoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
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

export default PaymentMethodScreen;
