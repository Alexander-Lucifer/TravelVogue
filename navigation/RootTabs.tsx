import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Safe component wrapper for tab screens
function SafeTabComponent({ component: Component, name }: { component: any, name: string }) {
  try {
    if (!Component) {
      console.error(`[TABS] Tab component ${name} is null or undefined`);
      return () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Tab Error
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
            {name} could not be loaded
          </Text>
        </View>
      );
    }
    return Component;
  } catch (error) {
    console.error(`[TABS] Error loading tab component ${name}:`, error);
    return () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Tab Component Error
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
          {name} failed to load
        </Text>
      </View>
    );
  }
}

const Tab = createBottomTabNavigator();

const TEAL = '#2FB7A6';
const BG = '#F5F5E6';

export default function RootTabs() {
  console.log('[NAV] RootTabs rendered');

  // Dynamic imports with error handling
  const HomeScreen = SafeTabComponent({
    component: require('../screens/HomeScreen').default,
    name: 'HomeScreen'
  });

  const TripsScreen = SafeTabComponent({
    component: require('../screens/TripsScreen').default,
    name: 'TripsScreen'
  });

  const MapScreen = SafeTabComponent({
    component: require('../screens/MapScreen').default,
    name: 'MapScreen'
  });

  const ProfileStack = SafeTabComponent({
    component: require('./ProfileStack').default,
    name: 'ProfileStack'
  });

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
          const Ionicons = require('react-native-vector-icons/Ionicons');
          return <Ionicons.default name={icon} size={22} color={color} />;
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
