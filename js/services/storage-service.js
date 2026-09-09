/**
 * KK PHARMACY ONLINE PHARMACY - STORAGE SERVICE
 * Provides safe LocalStorage wrappers for state persistence.
 */
const StorageService = {
  getItem: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      try {
        return JSON.parse(item);
      } catch (e) {
        return item; // Plain string (e.g. JWT token)
      }
    } catch (err) {
      console.error(`[StorageService] Error reading key "${key}":`, err);
      return defaultValue;
    }
  },

  setItem: (key, value) => {
    try {
      const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
      localStorage.setItem(key, serialized);
    } catch (err) {
      console.error(`[StorageService] Error setting key "${key}":`, err);
    }
  },

  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error(`[StorageService] Error removing key "${key}":`, err);
    }
  },

  clearAll: () => {
    try {
      localStorage.clear();
    } catch (err) {
      console.error('[StorageService] Error clearing LocalStorage:', err);
    }
  }
};
