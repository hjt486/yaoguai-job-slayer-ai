const API_URL = 'your-api-endpoint';
const LOCAL_STORAGE_USERS_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';
const API_SETTINGS_KEY = 'userApiSettings';

class AuthService {
  constructor() {
    this.subscribers = [];
    this.isExtension = typeof chrome !== 'undefined' && chrome.runtime;
  }

  // Storage helper methods
  async getFromStorage(key) {
    if (this.isExtension) {
      const result = await chrome.storage.local.get(key);
      return result[key];
    }
    return localStorage.getItem(key);
  }

  async setToStorage(key, value) {
    if (this.isExtension) {
      await chrome.storage.local.set({ [key]: value });
    } else {
      localStorage.setItem(key, value);
    }
  }

  async removeFromStorage(key) {
    if (this.isExtension) {
      await chrome.storage.local.remove(key);
    } else {
      localStorage.removeItem(key);
    }
  }

  // Update existing methods to use storage helpers
  async getUsers() {
    const users = await this.getFromStorage(LOCAL_STORAGE_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  async register(userData) {
    const users = await this.getUsers();

    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await this.setToStorage(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async login(credentials) {
    const users = await this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) throw new Error('User not found');
    if (user.password !== credentials.password) throw new Error('Invalid password');

    const { password, ...userWithoutPassword } = user;
    await this.setToStorage(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    this.notify();
    return userWithoutPassword;
  }

  async logout() {
    await this.removeFromStorage(CURRENT_USER_KEY);
    await this.removeFromStorage('currentProfile');
    window.dispatchEvent(new CustomEvent('logout'));
    this.notify();
  }

  async getCurrentUser() {
    const user = await this.getFromStorage(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  async updateUser(userId, updateData) {
    const users = await this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');

    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    await this.setToStorage(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const currentUser = await this.getCurrentUser();
    if (currentUser?.id === userId) {
      const { password, ...userWithoutPassword } = updatedUser;
      await this.setToStorage(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      this.notify();
    }

    return { ...updatedUser, password: undefined };
  }

  async getUserApiSettings(userId) {
    try {
      const allSettings = await this.getFromStorage(API_SETTINGS_KEY);
      const parsedSettings = allSettings ? JSON.parse(allSettings) : {};
      return parsedSettings[userId] || null;
    } catch (error) {
      console.error('Error loading API settings:', error);
      return null;
    }
  }

  async updateUserApiSettings(userId, settings) {
    try {
      const allSettings = await this.getFromStorage(API_SETTINGS_KEY) || '{}';
      const parsedSettings = JSON.parse(allSettings);
      parsedSettings[userId] = settings;
      await this.setToStorage(API_SETTINGS_KEY, JSON.stringify(parsedSettings));
      return true;
    } catch (error) {
      console.error('Error saving API settings:', error);
      throw new Error('Failed to save API settings');
    }
  }
}

export const authService = new AuthService();