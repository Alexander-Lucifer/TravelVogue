import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import TripsScreen from '../screens/TripsScreen';
import MapScreen from '../screens/MapScreen';
import ProfileStack from './ProfileStack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

const TEAL = '#2FB7A6';
const BG = '#F5F5E6';

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: any }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#E0F2EF',
        tabBarStyle: {
          backgroundColor: TEAL,
          borderTopWidth: 0,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarIcon: ({ color, size }: { color: string; size: number }) => {
          let icon = 'home';
          switch (route.name) {
            case 'Home':
              icon = 'home';
              break;
            case 'Trips':
              icon = 'airplane';
              break;
            case 'Map':
              icon = 'map';
              break;
            case 'Profile':
              icon = 'person';
              break;
          }
          return <Ionicons name={icon} size={22} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 11 },
        sceneStyle: { backgroundColor: BG },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Trips" component={TripsScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
