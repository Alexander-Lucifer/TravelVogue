import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BG = '#F5F5E6';
const TEAL = '#2FB7A6';
const CARD = '#FFFFFF';

export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();

  // Use hardcoded placeholder data
  const vehicleType = 'SUV';
  const passengerCount = 4;
  const tripsCount = 3;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar} />
            <Text style={styles.screenTitle}>Hi, {user?.name || 'User'}</Text>
          </View>
          <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Profile' as never)}>
            <Ionicons name="settings-outline" size={20} color="#111827" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>My Stats</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="earth-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>{vehicleType}</Text>
            <Text style={styles.cardSubtitle}>Vehicle Type</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="map-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>{tripsCount != null ? `${tripsCount} Trips` : '—'}</Text>
            <Text style={styles.cardSubtitle}>Trips Made</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="cash-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>{passengerCount} Passengers</Text>
            <Text style={styles.cardSubtitle}>Passenger Count</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="trophy-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>75% to Next Reward</Text>
            <Text style={styles.cardSubtitle}>Reward Progress</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions</Text>
        <View style={styles.actionsRow}>
          {['Plan New Trip', 'Book Now', 'View Itinerary', 'Live Map'].map((label, idx) => {
            const onPress = () => {
              switch (label) {
                case 'Plan New Trip':
                  navigation.navigate('PlanTrip');
                  break;
                case 'View Itinerary':
                  navigation.navigate('Trips');
                  break;
                case 'Book Now':
                  navigation.navigate('Trips');
                  break;
                case 'Live Map':
                  navigation.navigate('Map');
                  break;
                default:
                  break;
              }
            };
            const iconName = label === 'Plan New Trip' ? 'add-outline' : label === 'Book Now' ? 'bag-outline' : label === 'View Itinerary' ? 'book-outline' : 'map-outline';
            return (
              <TouchableOpacity key={idx} style={styles.actionBtn} onPress={onPress}>
                <Ionicons name={iconName} size={18} color="#111827" style={{ marginRight: 8 }} />
                <Text style={styles.actionText}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.listItem}>
          <View style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Mumbai to Pune</Text>
            <Text style={styles.itemSub}>2024-01-15</Text>
          </View>
          <Text style={[styles.itemMeta, { color: '#10B981' }]}>Completed</Text>
        </View>
        <View style={styles.listItem}>
          <View style={styles.thumb} />
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>Delhi to Jaipur</Text>
            <Text style={styles.itemSub}>2024-01-20</Text>
          </View>
          <Text style={[styles.itemMeta, { color: '#F59E0B' }]}>Upcoming</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { padding: 16, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FDE68A' },
  settingsBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' },
  screenTitle: { fontSize: 24, fontWeight: '700', color: '#1F2937' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937', marginTop: 8, marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: '48%', backgroundColor: CARD, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  iconCircle: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#E6F4F1', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardTitle: { fontWeight: '700', color: '#111827' },
  cardSubtitle: { color: '#6B7280', marginTop: 4 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center' },
  actionBtn: { width: '48%', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  actionText: { color: '#111827', fontWeight: '600', textAlign: 'center' },
  listItem: { backgroundColor: CARD, borderRadius: 12, padding: 10, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  thumb: { width: 56, height: 40, borderRadius: 8, backgroundColor: '#CBD5E1' },
  itemTitle: { fontWeight: '600', color: '#111827' },
  itemSub: { color: '#6B7280', marginTop: 2 },
  itemMeta: { color: TEAL, fontWeight: '700' },
});
