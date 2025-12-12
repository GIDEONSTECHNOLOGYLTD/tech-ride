import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { userAPI } from '../services/api.service';

export default function WalletScreen() {
  const navigation = useNavigation();
  const [wallet, setWallet] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const walletRes = await userAPI.getWallet();
      setWallet(walletRes.data.wallet);
      
      // Get payment history as transactions
      const historyRes = await userAPI.getProfile();
      // Transactions would come from payment history - simplified here
      setTransactions([]);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = () => {
    // Navigate to dedicated top-up screen with payment options
    navigation.navigate('WalletTopUp' as never);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>₦{wallet?.balance?.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</Text>
        <TouchableOpacity style={styles.topupButton} onPress={handleTopUp}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.topupText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.transactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {wallet?.transactions && wallet.transactions.length > 0 ? (
          wallet.transactions.slice(0, 10).map((txn: any, i: number) => (
            <View key={i} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons 
                  name={txn.type === 'DEBIT' ? 'arrow-up' : 'arrow-down'} 
                  size={20} 
                  color={txn.type === 'DEBIT' ? '#EF4444' : '#10B981'} 
                />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionTitle}>{txn.description || 'Transaction'}</Text>
                <Text style={styles.transactionDate}>
                  {new Date(txn.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text style={[styles.transactionAmount, txn.type === 'CREDIT' && { color: '#10B981' }]}>
                {txn.type === 'DEBIT' ? '-' : '+'}₦{txn.amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50 },
  headerTitle: { fontSize: 18, fontWeight: '600' },
  balanceCard: { margin: 20, padding: 30, backgroundColor: '#4F46E5', borderRadius: 20, alignItems: 'center' },
  balanceLabel: { fontSize: 14, color: '#E0E7FF', marginBottom: 8 },
  balanceAmount: { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 20 },
  topupButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  topupText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  transactions: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  transactionItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 12 },
  transactionIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionInfo: { flex: 1 },
  transactionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  transactionDate: { fontSize: 14, color: '#6B7280' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold', color: '#EF4444' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 16, color: '#9CA3AF', marginTop: 12 },
});
