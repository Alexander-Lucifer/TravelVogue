import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import env from '../config/env';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const BG = '#F5F5E6';
const TEAL = '#2FB7A6';
const CARD = '#FFFFFF';

type Ride = { id: string; title: string; date: string; status: 'Completed' | 'Upcoming' };

export default function HomeScreen() {
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const [rides, setRides] = useState<Ride[]>([]);
  const [totalDistanceKm, setTotalDistanceKm] = useState<number | null>(null);
  const [tripsCount, setTripsCount] = useState<number | null>(null);
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRides = async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, stats] = await Promise.all([
        api.getMyTrips(token || undefined),
        api.getStats(token || undefined).catch(() => null),
      ]);
      setRides(data);
      if (stats) {
        setTotalDistanceKm(stats.totalDistanceKm);
        setTripsCount(stats.tripsCount);
        setCoins(typeof stats.coins === 'number' ? stats.coins : env.COINS_DEFAULT);
      } else {
        setCoins(env.COINS_DEFAULT);
      }
    } catch (e: any) {
      setError(e?.message || 'Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRides();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
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
            <Text style={styles.cardTitle}>{totalDistanceKm != null ? `${totalDistanceKm.toLocaleString()} km` : '—'}</Text>
            <Text style={styles.cardSubtitle}>Total Distance</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="map-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>{tripsCount != null ? `${tripsCount} Trips` : '—'}</Text>
            <Text style={styles.cardSubtitle}>Trips Made</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}><Ionicons name="cash-outline" size={18} color={TEAL} /></View>
            <Text style={styles.cardTitle}>{(coins ?? env.COINS_DEFAULT).toLocaleString()} Coins</Text>
            <Text style={styles.cardSubtitle}>Coins Earned</Text>
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
        {loading ? (
          <ActivityIndicator color={TEAL} />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : rides.length === 0 ? (
          <Text style={styles.itemSub}>No rides found.</Text>
        ) : (
          rides.map((ride, idx) => (
            <View key={ride.id} style={styles.listItem}>
              <View style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{ride.title}</Text>
                <Text style={styles.itemSub}>{ride.date}</Text>
              </View>
              <Text style={[styles.itemMeta, ride.status === 'Upcoming' && { color: '#F59E0B' }]}>{ride.status}</Text>
            </View>
          ))
        )}
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
  errorText: { color: '#B91C1C', marginTop: 4 },
});
