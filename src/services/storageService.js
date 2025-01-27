const isExtension = typeof chrome !== 'undefined' && chrome.runtime;

class StorageService {
  constructor() {
    this.storageListeners = new Set();
    this.chromeHandler = null;
  }

  // Core storage methods
  get(key) {
    if (isExtension) {
      return new Promise(resolve => {
        chrome.storage.local.get([key], result => {
          resolve(result[key] ?? null);
        });
      });
    }
    return localStorage.getItem(key);
  }

  set(key, value) {
    if (isExtension) {
      return new Promise(resolve => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }
    localStorage.setItem(key, value);
  }

  remove(key) {
    if (isExtension) {
      return new Promise(resolve => {
        chrome.storage.local.remove(key, () => resolve());
      });
    }
    localStorage.removeItem(key);
  }

  clear() {
    if (isExtension) {
      return new Promise(resolve => {
        chrome.storage.local.clear(() => resolve());
      });
    }
    localStorage.clear();
  }

  // Event handling
  addChangeListener(type, callback) {
    if (type !== 'storage') return;

    if (isExtension) {
      this.storageListeners.add(callback);
      if (!this.chromeHandler) {
        this.chromeHandler = (changes, area) => {
          if (area === 'local') {
            Object.entries(changes).forEach(([key, change]) => {
              const event = {
                key,
                oldValue: change.oldValue,
                newValue: change.newValue,
                storageArea: 'local',
                url: window.location.href
              };
              callback(event);
            });
          }
        };
        chrome.storage.onChanged.addListener(this.chromeHandler);
      }
    } else {
      window.addEventListener(type, callback);
    }
  }

  removeChangeListener(type, callback) {
    if (type !== 'storage') return;

    if (isExtension) {
      this.storageListeners.delete(callback);
      if (this.storageListeners.size === 0 && this.chromeHandler) {
        chrome.storage.onChanged.removeListener(this.chromeHandler);
        this.chromeHandler = null;
      }
    } else {
      window.removeEventListener(type, callback);
    }
  }
}

export const storageService = new StorageService();