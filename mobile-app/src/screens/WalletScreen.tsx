import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function WalletScreen() {
  const navigation = useNavigation();

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
        <Text style={styles.balanceAmount}>$125.50</Text>
        <TouchableOpacity style={styles.topupButton}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.topupText}>Top Up</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.transactions}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Ionicons name="car" size={20} color="#4F46E5" />
            </View>
            <View style={styles.transactionInfo}>
              <Text style={styles.transactionTitle}>Ride to Downtown</Text>
              <Text style={styles.transactionDate}>Nov {18 + i}, 2024</Text>
            </View>
            <Text style={styles.transactionAmount}>-$8.50</Text>
          </View>
        ))}
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
});
