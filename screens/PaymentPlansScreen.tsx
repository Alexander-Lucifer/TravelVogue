import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

const plans = [
  { name: 'Basic', price: '$0/mo', perks: ['Standard support', 'Access to basic features'] },
  { name: 'Pro', price: '$9.99/mo', perks: ['Priority support', 'Advanced analytics', 'Unlimited trips'] },
  { name: 'Gold', price: '$19.99/mo', perks: ['24/7 support', 'Dedicated advisor', 'Exclusive rewards'] },
];

export default function PaymentPlansScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {plans.map((p) => (
          <View key={p.name} style={styles.card}>
            <Text style={styles.planName}>{p.name}</Text>
            <Text style={styles.planPrice}>{p.price}</Text>
            {p.perks.map((perk, i) => (
              <Text key={i} style={styles.perk}>• {perk}</Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  planPrice: { color: TEAL, fontWeight: '700', marginTop: 4 },
  perk: { color: '#6B7280', marginTop: 6 },
});
