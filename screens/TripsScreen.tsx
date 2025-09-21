import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api, { RideItem, BookingItem } from '../services/api';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

export default function TripsScreen() {
  type Row = (RideItem & { kind: 'trip' }) | (BookingItem & { kind: 'booking' });
  const [filter, setFilter] = useState<'all' | 'trips' | 'bookings'>('all');
  const chips = [
    { key: 'all', label: 'All' },
    { key: 'trips', label: 'Trips' },
    { key: 'bookings', label: 'Bookings' },
  ] as const;

  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    setError(null);
    try {
      const [rides, bookings] = await Promise.all([
        api.getRides(token || undefined),
        api.getBookings(token || undefined),
      ]);
      const combined: Row[] = [
        ...rides.map((r) => ({ ...r, kind: 'trip' as const })),
        ...bookings.map((b) => ({ ...b, kind: 'booking' as const })),
      ].sort((a, b) => (a.date > b.date ? -1 : 1));
      setRows(combined);
    } catch (e: any) {
      setError(e?.message || 'Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrips();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadTrips();
    } finally {
      setRefreshing(false);
    }
  };

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'trips') return rows.filter((r) => r.kind === 'trip');
    return rows.filter((r) => r.kind === 'booking');
  }, [rows, filter]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <Text style={styles.title}>My Trips</Text>

        <View style={styles.chipsRow}>
          {chips.map(c => (
            <Pressable key={c.key} style={[styles.chip, filter === c.key && styles.chipActive]} onPress={() => setFilter(c.key)}>
              <Text style={[styles.chipText, filter === c.key && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={TEAL} />
        ) : error ? (
          <Text style={styles.cardSub}>{error}</Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.cardSub}>No trips found.</Text>
        ) : (
          filtered.map((i) => (
            <View key={`${i.kind}-${i.id}`} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{i.title}</Text>
                {'place' in i && i.place ? <Text style={styles.cardSub}>{i.place}</Text> : null}
                <Text style={styles.cardSub}>{i.date}</Text>
                {'status' in i ? (
                  <Text
                    style={[
                      styles.status,
                      i.kind === 'trip'
                        ? (i.status === 'Completed' ? styles.statusCompleted : styles.statusUpcoming)
                        : (i.status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending),
                    ]}
                  >
                    {i.status}
                  </Text>
                ) : null}
              </View>
              {'price' in i && i.price ? <Text style={styles.price}>{i.price}</Text> : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10, color: '#1F2937' },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#E6F4F1', borderRadius: 20 },
  chipActive: { backgroundColor: TEAL },
  chipText: { color: '#0F766E', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 10 },
  cardTitle: { fontWeight: '700', color: '#111827' },
  cardSub: { color: '#6B7280', marginTop: 2 },
  status: { marginTop: 6, fontWeight: '600' },
  statusCompleted: { color: '#059669' },
  statusUpcoming: { color: '#2563EB' },
  statusConfirmed: { color: '#10B981' },
  statusPending: { color: '#F59E0B' },
  price: { fontWeight: '700', color: '#111827' },
});
