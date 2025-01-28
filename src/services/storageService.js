const isExtension = typeof chrome !== 'undefined' && chrome.runtime;

class StorageService {
  constructor() {
    this.cache = new Map();
    this.ready = false;
    this.initPromise = null;
    this.storageListeners = new Set();
    this.chromeHandler = null;

    if (isExtension) {
      this.initSyncCache();
    } else {
      this.ready = true;
    }
  }

  // Add binary data handling methods
  async getBinary(key) {
    if (isExtension) {
      await this.initSyncCache();
      const data = this.cache.get(key);
      return data ? data : null;
    }
    return localStorage.getItem(key);
  }

  async setBinary(key, value) {
    if (isExtension) {
      await this.initSyncCache();
      this.cache.set(key, value);
      return chrome.storage.local.set({ [key]: value });
    }
    localStorage.setItem(key, value);
    return true;
  }

  // Update existing methods to handle JSON
  get(key) {
    if (isExtension) {
      if (!this.ready) {
        throw new Error('Storage not initialized. Use async methods in extension context');
      }
      const value = this.cache.get(key);
      try {
        return value ? JSON.parse(value) : null;
      } catch {
        return value;
      }
    }
    const value = localStorage.getItem(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  }

  set(key, value) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (isExtension) {
      this.cache.set(key, stringValue);
      chrome.storage.local.set({ [key]: stringValue }).catch(console.error);
    } else {
      localStorage.setItem(key, stringValue);
    }
    return true;
  }

  // Synchronous initialization wrapper
  initSyncCache() {
    if (!this.initPromise) {
      this.initPromise = new Promise(resolve => {
        chrome.storage.local.get(null, items => {
          Object.entries(items).forEach(([k, v]) => this.cache.set(k, v));
          this.ready = true;
          resolve();
        });
      });
    }
    return this.initPromise;
  }


  // Unified getItem that always returns string|null
  get(key) {
    if (isExtension) {
      if (!this.ready) {
        throw new Error('Storage not initialized. Use async methods in extension context');
      }
      return this.cache.get(key) || null;
    }
    return localStorage.getItem(key);
  }


  // Unified setItem that handles both sync and async
  set(key, value) {
    if (isExtension) {
      this.cache.set(key, value);
      chrome.storage.local.set({ [key]: value }).catch(console.error);
    } else {
      localStorage.setItem(key, value);
    }
    return true;
  }

  // Unified removeItem
  remove(key) {
    if (isExtension) {
      this.cache.delete(key);
      chrome.storage.local.remove(key).catch(console.error);
    } else {
      localStorage.removeItem(key);
    }
    return true;
  }

  async removeAsync(key) {
    if (!isExtension) return this.remove(key);
    await this.initSyncCache();
    this.cache.delete(key);
    return chrome.storage.local.remove(key);
  }

  // Event handling
  addChangeListener(callback) {
    if (isExtension) {
      this.storageListeners.add(callback);
      if (!this.chromeHandler) {
        this.chromeHandler = (changes, area) => {
          if (area === 'local') {
            Object.entries(changes).forEach(([key, change]) => {
              this.cache.set(key, change.newValue);
              callback({
                key,
                oldValue: change.oldValue,
                newValue: change.newValue
              });
            });
          }
        };
        chrome.storage.onChanged.addListener(this.chromeHandler);
      }
    } else {
      window.addEventListener('storage', callback);
    }
  }

  removeChangeListener(callback) {
    if (isExtension) {
      this.storageListeners.delete(callback);
      if (this.storageListeners.size === 0 && this.chromeHandler) {
        chrome.storage.onChanged.removeListener(this.chromeHandler);
        this.chromeHandler = null;
      }
    } else {
      window.removeEventListener('storage', callback);
    }
  }

  // Async extension-only methods
  async getAsync(key) {
    if (!isExtension) return this.get(key);
    await this.initSyncCache();
    const value = this.cache.get(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value;
    }
  }

  async setAsync(key, value) {
    if (!isExtension) return this.set(key, value);
    await this.initSyncCache();
    this.cache.set(key, value);
    return chrome.storage.local.set({ [key]: value });
  }
}

export const storageService = new StorageService();