import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';

export default function AboutScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>About SIHAPP</Text>
          <Text style={styles.text}>SIHAPP helps you plan trips, track rides, and explore live maps with ease.</Text>
          <Text style={styles.text}>Version: 0.0.1</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/privacy')}>Privacy Policy</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('https://example.com/terms')}>Terms of Service</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16 },
  card: { backgroundColor: CARD, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  text: { color: '#6B7280', marginBottom: 6 },
  link: { color: '#2563EB', fontWeight: '600', marginTop: 4 },
});
