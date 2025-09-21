/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './SplashScreen';
import AuthScreen from './AuthScreen';
import RootTabs from './navigation/RootTabs';
import MainStack from './navigation/MainStack';
import { AuthProvider, useAuth } from './context/AuthContext';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { token, hydrated } = useAuth();
  if (!hydrated) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (!token) {
    return <AuthScreen />;
  }
  return <MainStack />;
}

export default App;
