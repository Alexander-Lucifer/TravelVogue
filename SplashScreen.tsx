import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 3000); // Show splash for 3 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F0" />
      
      {/* Top geometric shapes */}
      <View style={styles.topShapesContainer}>
        <View style={[styles.shape, styles.topTealShape]} />
        <View style={[styles.shape, styles.topBlueGrayShape]} />
      </View>

      {/* App name */}
      <View style={styles.centerContainer}>
        <Text style={styles.appName}>SIHAPP</Text>
      </View>

      {/* Bottom geometric shapes */}
      <View style={styles.bottomShapesContainer}>
        <View style={[styles.shape, styles.bottomBlueGrayShape]} />
        <View style={[styles.shape, styles.bottomTealShape]} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0', // Cream background
    position: 'relative',
  },
  topShapesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    overflow: 'hidden',
  },
  bottomShapesContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    overflow: 'hidden',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: '300',
    color: '#2C2C2C',
    letterSpacing: 2,
    textAlign: 'center',
  },
  shape: {
    position: 'absolute',
  },
  // Top shapes
  topTealShape: {
    width: width * 0.8,
    height: height * 0.5,
    backgroundColor: '#4ECDC4', // Teal color
    transform: [
      { skewY: '-15deg' },
      { translateX: -width * 0.2 },
      { translateY: -height * 0.1 },
    ],
    opacity: 0.9,
  },
  topBlueGrayShape: {
    width: width * 0.6,
    height: height * 0.4,
    backgroundColor: '#6B7A8F', // Blue-gray color
    transform: [
      { skewY: '10deg' },
      { translateX: width * 0.3 },
      { translateY: -height * 0.05 },
    ],
    opacity: 0.8,
  },
  // Bottom shapes
  bottomBlueGrayShape: {
    width: width * 0.7,
    height: height * 0.4,
    backgroundColor: '#6B7A8F', // Blue-gray color
    transform: [
      { skewY: '15deg' },
      { translateX: -width * 0.3 },
      { translateY: height * 0.1 },
    ],
    opacity: 0.8,
  },
  bottomTealShape: {
    width: width * 0.9,
    height: height * 0.5,
    backgroundColor: '#4ECDC4', // Teal color
    transform: [
      { skewY: '-10deg' },
      { translateX: width * 0.2 },
      { translateY: height * 0.05 },
    ],
    opacity: 0.9,
  },
});

export default SplashScreen;
