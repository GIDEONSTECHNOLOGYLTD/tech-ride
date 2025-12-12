import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { paymentAPI, userAPI } from '../services/api.service';

export default function PaystackWebViewScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { url, reference, type, amount, rideId } = (route.params || {}) as {
    url: string;
    reference: string;
    type?: 'wallet_topup' | 'ride_payment';
    amount?: number;
    rideId?: string;
  };

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const handleNavigationStateChange = async (navState: any) => {
    const { url: currentUrl } = navState;
    
    // Check if payment was successful (Paystack redirects to success URL)
    if (currentUrl.includes('/payment/success') || currentUrl.includes('success=true')) {
      setVerifying(true);
      await verifyPayment();
    }
    
    // Check if payment was cancelled
    if (currentUrl.includes('/payment/cancel') || currentUrl.includes('cancelled=true')) {
      Alert.alert(
        'Payment Cancelled',
        'Your payment was cancelled. Please try again.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  };

  const verifyPayment = async () => {
    try {
      const response = await paymentAPI.verifyPaystackPayment(reference);
      
      if (response.data.success) {
        // Payment successful
        if (type === 'wallet_topup') {
          Alert.alert(
            'Top-Up Successful!',
            `₦${amount?.toLocaleString('en-NG')} has been added to your wallet.`,
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Wallet' as never);
                },
              },
            ]
          );
        } else if (type === 'ride_payment') {
          Alert.alert(
            'Payment Successful!',
            'Your payment has been processed.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('RideTracking' as never, { rideId } as never);
                },
              },
            ]
          );
        } else {
          navigation.goBack();
        }
      } else {
        Alert.alert('Payment Failed', 'Payment verification failed. Please contact support.');
      }
    } catch (error: any) {
      Alert.alert(
        'Verification Error',
        error.response?.data?.error || 'Failed to verify payment',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleClose = () => {
    Alert.alert(
      'Cancel Payment?',
      'Are you sure you want to cancel this payment?',
      [
        { text: 'Continue Payment', style: 'cancel' },
        { text: 'Cancel Payment', style: 'destructive', onPress: () => navigation.goBack() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
          <Ionicons name="close" size={28} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'wallet_topup' ? 'Top Up Wallet' : 'Payment'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* WebView */}
      {url && (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading payment page...</Text>
        </View>
      )}

      {/* Verifying Overlay */}
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <View style={styles.verifyingCard}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.verifyingTitle}>Verifying Payment</Text>
            <Text style={styles.verifyingText}>
              Please wait while we confirm your payment...
            </Text>
          </View>
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
    padding: 16,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  verifyingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyingCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  verifyingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  verifyingText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
