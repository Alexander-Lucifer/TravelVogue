// Resilient storage wrapper
// Tries to use AsyncStorage; if unavailable (e.g., native not linked yet), falls back to in-memory store
let AsyncStorage: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch {
  AsyncStorage = null;
}

const memStore = new Map<string, string>();

export const Storage = {
  async getItem(key: string): Promise<string | null> {
    if (AsyncStorage && AsyncStorage.getItem) {
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        return null;
      }
    }
    return memStore.has(key) ? memStore.get(key)! : null;
  },
  async setItem(key: string, value: string): Promise<void> {
    if (AsyncStorage && AsyncStorage.setItem) {
      try {
        await AsyncStorage.setItem(key, value);
        return;
      } catch {
        // ignore and fall back to memory
      }
    }
    memStore.set(key, value);
  },
  async removeItem(key: string): Promise<void> {
    if (AsyncStorage && AsyncStorage.removeItem) {
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        // ignore and also clear memory
      }
    }
    memStore.delete(key);
  },
  isAvailable(): boolean {
    return !!AsyncStorage;
  },
};

export default Storage;
