import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api, { AccountResponse } from '../services/api';
import { useNavigation } from '@react-navigation/native';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const navigation = useNavigation<any>();
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getAccount(token || undefined);
        setAccount(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load account');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
          <TouchableOpacity style={styles.editBtn}><Text style={styles.editText}>Edit</Text></TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{account?.name || user?.name || 'User'}</Text>
            <Text style={styles.email}>{account?.email || user?.email || 'user@example.com'}</Text>
            <Text style={styles.member}>Member since {account?.memberSince || '—'}</Text>
          </View>
          <Text style={styles.badge}>{account?.tier || 'Member'}</Text>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: 'Total Trips', value: account?.tripsCount ? String(account.tripsCount) : '—' },
            { label: 'Distance', value: account?.totalDistanceKm ? `${account.totalDistanceKm} km` : '—' },
            { label: 'Coins', value: account?.coins != null ? String(account.coins) : '—' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <View style={{ marginTop: 10 }}><ActivityIndicator color={TEAL} /></View>
        ) : error ? (
          <Text style={[styles.cardSub, { marginTop: 8 }]}>{error}</Text>
        ) : null}

        {[
          { label: 'Settings', route: 'Settings' },
          { label: 'Payment Plans', route: 'PaymentPlans' },
          { label: 'Help & Support', route: 'Help' },
          { label: 'About', route: 'About' },
        ].map((item, idx) => (
          <TouchableOpacity key={idx} style={styles.rowItem} onPress={() => navigation.navigate(item.route)}>
            <Text style={styles.rowText}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={{ height: 12 }} />
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() =>
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: logout },
            ])
          }
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  editBtn: { backgroundColor: '#E6F4F1', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  editText: { color: TEAL, fontWeight: '700' },
  profileCard: { backgroundColor: CARD, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', gap: 14, alignItems: 'center', marginTop: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FDE68A' },
  name: { fontWeight: '700', color: '#111827' },
  email: { color: '#6B7280', marginTop: 2 },
  member: { color: '#6B7280', marginTop: 2 },
  badge: { backgroundColor: '#F3FAF7', color: '#059669', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: CARD, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, alignItems: 'center' },
  statValue: { fontWeight: '700', color: '#111827' },
  statLabel: { color: '#6B7280', marginTop: 4 },
  cardSub: { color: '#6B7280', marginTop: 2 },
  rowItem: { backgroundColor: CARD, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 10 },
  rowText: { color: '#111827', fontWeight: '600' },
  logoutBtn: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});
