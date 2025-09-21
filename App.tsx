/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import AuthScreen from './AuthScreen';
import MainStack from './navigation/MainStack';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const navigationRef = useRef<any>(null);

  const handleSplashFinish = () => {
    console.log('[APP] Splash finished, showing main app');
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          console.log('[APP] Navigation container is ready');
        }}
      >
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AuthProvider>
          <AppNavigator showSplash={showSplash} onSplashFinish={handleSplashFinish} />
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AppNavigator({ showSplash, onSplashFinish }: {
  showSplash: boolean;
  onSplashFinish: () => void;
}) {
  const { token, hydrated } = useAuth();

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[NAVIGATOR] Auth state changed:', {
      hasToken: !!token,
      hydrated,
      showSplash
    });
  }, [token, hydrated, showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={onSplashFinish} />;
  }

  if (!hydrated) {
    console.log('[NAVIGATOR] App not hydrated yet, showing loading');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, textAlign: 'center' }}>Loading...</Text>
      </View>
    );
  }

  console.log('[NAVIGATOR] Rendering navigator. Token exists:', !!token);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Main"
        component={MainStack}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default App;
