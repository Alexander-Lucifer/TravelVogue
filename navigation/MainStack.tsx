import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RootTabs from './RootTabs';
import PlanTripScreen from '../screens/PlanTripScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
  console.log('[NAV] MainStack rendered');
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
