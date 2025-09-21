import React from 'react';
import { View, Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Safe component wrapper
function SafeComponent({ component: Component, name }: { component: any, name: string }) {
  try {
    if (!Component) {
      console.error(`[NAV] Component ${name} is null or undefined`);
      return () => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Navigation Error
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
            Component {name} could not be loaded
          </Text>
        </View>
      );
    }
    return Component;
  } catch (error) {
    console.error(`[NAV] Error loading component ${name}:`, error);
    return () => (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Component Error
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
          {name} failed to load
        </Text>
      </View>
    );
  }
}

const Stack = createNativeStackNavigator();

export default function MainStack() {
  console.log('[NAV] MainStack rendered');

  // Dynamic imports with error handling
  const RootTabs = SafeComponent({
    component: require('./RootTabs').default,
    name: 'RootTabs'
  });

  const PlanTripScreen = SafeComponent({
    component: require('../screens/PlanTripScreen').default,
    name: 'PlanTripScreen'
  });

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={RootTabs} />
      <Stack.Screen
        name="PlanTrip"
        component={PlanTripScreen}
        options={{ headerShown: true, title: 'Plan New Trip' }}
      />
    </Stack.Navigator>
  );
}
