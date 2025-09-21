// Lightweight environment config for React Native
// Priority: NativeModules.RNConfig -> global.API_BASE_URL -> process.env.API_BASE_URL -> default

import { NativeModules } from 'react-native';

const nativeCfg = (NativeModules as any)?.RNConfig || {};
const globalCfg = (typeof globalThis !== 'undefined' ? (globalThis as any) : {}) || {};

export type AppConfig = {
  API_BASE_URL: string;
  COINS_DEFAULT: number;
  GOOGLE_PLACES_API_KEY?: string;
  SECRET_KEY?: string;
  DEBUG_NETWORK?: boolean;
};

const API_BASE_URL =
  nativeCfg.API_BASE_URL ||
  globalCfg.API_BASE_URL ||
  'http://10.0.2.2:3000'; // Android emulator localhost; change as needed

export const env: AppConfig = {
  API_BASE_URL,
  COINS_DEFAULT: Number(nativeCfg.COINS_DEFAULT || globalCfg.COINS_DEFAULT || 1200),
  GOOGLE_PLACES_API_KEY: nativeCfg.GOOGLE_PLACES_API_KEY || globalCfg.GOOGLE_PLACES_API_KEY || undefined,
  SECRET_KEY: nativeCfg.SECRET_KEY || globalCfg.SECRET_KEY || '12345',
  DEBUG_NETWORK: !!(nativeCfg.DEBUG_NETWORK ?? globalCfg.DEBUG_NETWORK ?? true),
};

export default env;
