import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

export default function BookingsScreen() {
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const chips = [
    { key: 'all', label: 'All Bookings' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'pending', label: 'Pending' },
  ] as const;

  const items = [
    { title: 'New York to London', date: '2023-09-15 • 14:30', ref: 'FL123456', price: '$650', status: 'Confirmed', tag: 'confirmed' },
    { title: 'Grand Hotel London', date: '2023-09-15 • Check-in', ref: 'HT789012', price: '$120/night', status: 'Confirmed', tag: 'confirmed' },
    { title: 'Economy Car Rental', date: '2023-09-16 • 09:00', ref: 'CR345678', price: '$45/day', status: 'Pending', tag: 'pending' },
  ];

  const filtered = items.filter(i => filter === 'all' || i.tag === filter);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>My Bookings</Text>

        <View style={styles.chipsRow}>
          {chips.map(c => (
            <Pressable key={c.key} style={[styles.chip, filter === c.key && styles.chipActive]} onPress={() => setFilter(c.key)}>
              <Text style={[styles.chipText, filter === c.key && styles.chipTextActive]}>{c.label}</Text>
            </Pressable>
          ))}
        </View>

        {filtered.map((i, idx) => (
          <View key={idx} style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{i.title}</Text>
              <Text style={styles.cardSub}>{i.date}</Text>
              <Text style={styles.ref}>Ref: {i.ref}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.badge, i.tag === 'confirmed' ? styles.badgeConfirmed : styles.badgePending]}>
                {i.status}
              </Text>
              <Text style={styles.price}>{i.price}</Text>
            </View>
          </View>
        ))}
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
  ref: { color: '#6B7280', marginTop: 2 },
  price: { fontWeight: '700', color: '#111827', marginTop: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, color: '#fff', overflow: 'hidden', alignSelf: 'flex-start' },
  badgeConfirmed: { backgroundColor: '#10B981' },
  badgePending: { backgroundColor: '#F59E0B' },
});
