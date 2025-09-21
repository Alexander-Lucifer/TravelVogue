/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StatusBar, useColorScheme, View, ActivityIndicator, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './SplashScreen';
import AuthScreen from './AuthScreen';
import MainStack from './navigation/MainStack';
import { AuthProvider, useAuth } from './context/AuthContext';

const Stack = createNativeStackNavigator();

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<any> },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('[ERROR BOUNDARY] App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || (() => (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Something went wrong. Please restart the app.
          </Text>
          {this.state.error && (
            <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
              Error: {this.state.error.message}
            </Text>
          )}
        </View>
      ));
      return <FallbackComponent />;
    }
    return this.props.children;
  }
}

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [showSplash, setShowSplash] = useState(true);
  const [appError, setAppError] = useState<string | null>(null);
  const navigationRef = useRef<any>(null);

  const handleSplashFinish = useCallback(() => {
    console.log('[APP] Splash finished, showing main app');
    setShowSplash(false);
  }, []);

  // Global error handler
  useEffect(() => {
    const handleUnhandledError = (error: any) => {
      console.error('[APP] Unhandled error:', error);
      setAppError(error?.message || 'Unknown error occurred');
    };

    // Note: In React Native, you might want to use ErrorUtils or other global error handlers
    // For now, we'll rely on component error boundaries

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (appError) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
            Application Error
          </Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
            {appError}
          </Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer
          ref={navigationRef}
          onReady={() => {
            console.log('[APP] Navigation container is ready');
          }}
          onStateChange={(state) => {
            console.log('[APP] Navigation state changed:', state?.routeNames);
          }}
          fallback={
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 10 }}>Loading Navigation...</Text>
            </View>
          }
        >
          <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
          <AuthProvider>
            <AppNavigator
              showSplash={showSplash}
              onSplashFinish={handleSplashFinish}
              navigationRef={navigationRef}
            />
          </AuthProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

function AppNavigator({ showSplash, onSplashFinish, navigationRef }: {
  showSplash: boolean;
  onSplashFinish: () => void;
  navigationRef: any;
}) {
  const { token, hydrated } = useAuth();
  const [renderKey, setRenderKey] = useState(0);
  const [renderCount, setRenderCount] = useState(0);

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[NAVIGATOR] Auth state changed:', {
      hasToken: !!token,
      hydrated,
      showSplash,
      renderKey,
      renderCount
    });
  }, [token, hydrated, showSplash, renderKey, renderCount]);

  // Force re-render when token changes to ensure navigation updates
  // Use a debounced approach to prevent rapid re-renders
  useEffect(() => {
    if (hydrated && renderCount < 10) { // Prevent infinite loops
      console.log('[NAVIGATOR] Token changed, forcing re-render:', !!token);
      const timer = setTimeout(() => {
        setRenderKey(prev => prev + 1);
        setRenderCount(prev => prev + 1);
      }, 50); // Small delay to debounce rapid changes

      return () => clearTimeout(timer);
    } else if (renderCount >= 10) {
      console.warn('[NAVIGATOR] Maximum render count reached, preventing further renders');
    }
  }, [token, hydrated, renderCount]);

  // Reset render count when token stabilizes
  useEffect(() => {
    if (renderCount > 0) {
      const resetTimer = setTimeout(() => {
        setRenderCount(0);
        console.log('[NAVIGATOR] Render count reset');
      }, 1000);

      return () => clearTimeout(resetTimer);
    }
  }, [renderCount]);

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

  // Safety check: if we've rendered too many times, show error
  if (renderCount >= 10) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 20 }}>
          Navigation Error
        </Text>
        <Text style={{ fontSize: 12, textAlign: 'center', color: 'red' }}>
          Too many re-renders. Please restart the app.
        </Text>
      </View>
    );
  }

  console.log('[NAVIGATOR] Rendering navigator. Token exists:', !!token, 'Render key:', renderKey);

  return (
    <View key={renderKey} style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Main"
            component={MainStack}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </View>
  );
}

export default App;
