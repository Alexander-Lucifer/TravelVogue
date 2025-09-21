import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Platform, PermissionsAndroid, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import env from '../config/env';

const BG = '#F5F5E6';
const TEAL = '#2FB7A6';

const INITIAL_REGION: Region = {
  latitude: 40.758,
  longitude: -73.9855,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

type NearbyPlace = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  vicinity?: string;
  types?: string[];
  distanceKm?: number;
};

export default function MapScreen() {
  const [region, setRegion] = useState(INITIAL_REGION);
  const [query, setQuery] = useState('');
  const [hasCenteredOnUser, setHasCenteredOnUser] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const [nearby, setNearby] = useState<NearbyPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Request location permission on Android at runtime
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'We need your location to show where you are on the map',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          // No-op: Map will handle showsUserLocation if permission is granted
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            // Permission denied; keep default region
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('Error requesting location permission', err);
        }
      }
    };
    requestPermission();
  }, []);

  const toRad = (v: number) => (v * Math.PI) / 180;
  const distKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearby = async (center: { latitude: number; longitude: number }) => {
    // If no API key, provide graceful fallback
    if (!env.GOOGLE_PLACES_API_KEY) {
      const fallback: NearbyPlace[] = [
        { id: '1', name: 'Sample Park', lat: center.latitude + 0.01, lng: center.longitude + 0.01 },
        { id: '2', name: 'Sample Cafe', lat: center.latitude - 0.008, lng: center.longitude - 0.006 },
      ].map(p => ({ ...p, distanceKm: distKm(center.latitude, center.longitude, p.lat, p.lng) }));
      setNearby(fallback);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const radius = 1500; // meters
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${center.latitude},${center.longitude}&radius=${radius}&key=${env.GOOGLE_PLACES_API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== 'OK' && !data.results) {
        throw new Error(data.error_message || 'Failed to load places');
      }
      const places: NearbyPlace[] = (data.results || []).slice(0, 15).map((r: any, idx: number) => {
        const lat = r.geometry?.location?.lat ?? center.latitude;
        const lng = r.geometry?.location?.lng ?? center.longitude;
        return {
          id: r.place_id || String(idx),
          name: r.name,
          lat,
          lng,
          vicinity: r.vicinity,
          types: r.types,
          distanceKm: distKm(center.latitude, center.longitude, lat, lng),
        } as NearbyPlace;
      });
      setNearby(places);
    } catch (e: any) {
      setError(e?.message || 'Failed to load nearby places');
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby whenever we center on the user for the first time, or region changes significantly
  useEffect(() => {
    if (region) {
      fetchNearby({ latitude: region.latitude, longitude: region.longitude });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCenteredOnUser]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Live Map</Text>
        <TouchableOpacity style={styles.modeBtn}><Text style={styles.modeBtnText}>Satellite</Text></TouchableOpacity>
      </View>

      <TextInput
        placeholder="Search locations..."
        placeholderTextColor="#94A3B8"
        style={styles.search}
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          provider={PROVIDER_GOOGLE}
          ref={mapRef}
          initialRegion={INITIAL_REGION}
          showsUserLocation
          showsMyLocationButton
          onUserLocationChange={(e) => {
            if (hasCenteredOnUser) return;
            const coords = e.nativeEvent.coordinate;
            if (coords && mapRef.current) {
              const target: Region = {
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };
              mapRef.current?.animateToRegion(target, 600);
              setRegion(target);
              setHasCenteredOnUser(true);
            }
          }}
          onRegionChangeComplete={setRegion}
        >
          {nearby.map(n => (
            <Marker key={n.id} coordinate={{ latitude: n.lat, longitude: n.lng }} title={n.name} description={n.vicinity || (n.types?.[0] ?? '')} />
          ))}
        </MapView>
      </View>

      {loading ? (
        <View style={{ padding: 16 }}><ActivityIndicator color={TEAL} /></View>
      ) : error ? (
        <View style={{ padding: 16 }}><Text style={styles.itemSub}>{error}</Text></View>
      ) : (
        <FlatList
          data={nearby}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.name}</Text>
                <Text style={styles.itemSub}>{item.vicinity || (item.types?.[0] ?? '')}</Text>
              </View>
              <Text style={styles.distance}>{item.distanceKm != null ? `${item.distanceKm.toFixed(1)} km` : ''}</Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#1F2937' },
  modeBtn: { backgroundColor: TEAL, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
  modeBtnText: { color: '#fff', fontWeight: '700' },
  search: { marginHorizontal: 16, backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  mapWrap: { height: 240, borderRadius: 16, overflow: 'hidden', margin: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  listItem: { backgroundColor: '#fff', marginBottom: 10, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontWeight: '700', color: '#111827' },
  itemSub: { color: '#6B7280', marginTop: 2 },
  distance: { color: '#64748B', fontWeight: '600' },
});
