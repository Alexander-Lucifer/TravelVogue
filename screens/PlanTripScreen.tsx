import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

export default function PlanTripScreen() {
  const { token } = useAuth();
  const [title, setTitle] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(''); // ISO like 2025-09-30
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!title || !from || !to || !date) {
      Alert.alert('Missing fields', 'Please fill Title, From, To, and Date (YYYY-MM-DD).');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.createTrip({ title, from, to, date, notes }, token || undefined);
      Alert.alert('Trip added', 'Your trip has been added to the itinerary.');
    } catch (e: any) {
      setError(e?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.label}>Title</Text>
          <TextInput value={title} onChangeText={setTitle} placeholder="e.g., Weekend in Goa" style={styles.input} />

          <Text style={styles.label}>From</Text>
          <TextInput value={from} onChangeText={setFrom} placeholder="City A" style={styles.input} />

          <Text style={styles.label}>To</Text>
          <TextInput value={to} onChangeText={setTo} placeholder="City B" style={styles.input} />

          <Text style={styles.label}>Date</Text>
          <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={styles.input} />

          <Text style={styles.label}>Notes</Text>
          <TextInput value={notes} onChangeText={setNotes} placeholder="Optional notes" style={[styles.input, { height: 90 }]} multiline />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Save Trip</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  label: { color: '#111827', fontWeight: '600', marginTop: 12 },
  input: { marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff' },
  submitBtn: { marginTop: 16, backgroundColor: TEAL, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitText: { color: '#fff', fontWeight: '700' },
  errorText: { color: '#B91C1C', marginTop: 8 },
});
