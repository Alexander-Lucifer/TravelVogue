import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BG = '#F5F5E6';
const CARD = '#FFFFFF';
const TEAL = '#2FB7A6';

export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Help & Support</Text>
          <Text style={styles.text}>For support, contact support@example.com</Text>
          <Text style={styles.link} onPress={() => Linking.openURL('mailto:support@example.com')}>Email Support</Text>
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
  link: { color: TEAL, fontWeight: '700', marginTop: 4 },
});
