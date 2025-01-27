const API_URL = 'your-api-endpoint';
const LOCAL_STORAGE_USERS_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';
const API_SETTINGS_KEY = 'userApiSettings';
import { storageService } from './storageService';

class AuthService {
  constructor() {
    this.subscribers = []; // Array to hold subscription callbacks
  }

  // Add subscription methods
  subscribe(callback) {
    this.subscribers.push(callback);
    // Return unsubscribe function
    return () => this.unsubscribe(callback);
  }

  unsubscribe(callback) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  // Notify all subscribers of current user state
  // Update notify to be async
  async notify() {
    const currentUser = await this.getCurrentUser();
    this.subscribers.forEach(callback => callback(currentUser));
  }

  // Update getUsers to be async
  async getUsers() {
    const users = await storageService.getAsync(LOCAL_STORAGE_USERS_KEY);
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
    await storageService.setAsync(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async logout() {
    await storageService.removeAsync(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent('logout'));
    await this.notify();
  }

  // Remove duplicate updateUserApiSettings method
  async updateUserApiSettings(userId, settings) {
    try {
      const allSettings = JSON.parse(await storageService.getAsync(API_SETTINGS_KEY) || '{}');
      allSettings[userId] = settings;
      await storageService.setAsync(API_SETTINGS_KEY, JSON.stringify(allSettings));
      return true;
    } catch (error) {
      console.error('Error saving API settings:', error);
      throw new Error('Failed to save API settings');
    }
  }

  async login(credentials) {
    const users = await this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) throw new Error('User not found');
    if (user.password !== credentials.password) throw new Error('Invalid password');

    const { password, ...userWithoutPassword } = user;
    await storageService.setAsync(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    await this.notify(); // Make sure to await notify
    return userWithoutPassword;
  }

  async logout() {
    await storageService.removeAsync(CURRENT_USER_KEY);
    await storageService.removeAsync('currentProfile');
    window.dispatchEvent(new CustomEvent('logout'));
    await this.notify();
  }
  // Update getCurrentUser to be async
  async getCurrentUser() {
    const user = await storageService.getAsync(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Update other methods that use getCurrentUser
  async login(credentials) {
    const users = await this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) throw new Error('User not found');
    if (user.password !== credentials.password) throw new Error('Invalid password');

    const { password, ...userWithoutPassword } = user;
    await storageService.setAsync(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    this.notify(); // Notify subscribers after login
    return userWithoutPassword;
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
    await storageService.setAsync(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const currentUser = await this.getCurrentUser();
    if (currentUser?.id === userId) {
      const { password, ...userWithoutPassword } = updatedUser;
      await storageService.setAsync(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      this.notify();
    }

    return { ...updatedUser, password: undefined };
  }

  async getUserApiSettings(userId) {
    try {
      const allSettings = JSON.parse(await storageService.getAsync(API_SETTINGS_KEY) || '{}');
      return allSettings[userId] || null;
    } catch (error) {
      console.error('Error loading API settings:', error);
      return null;
    }
  }
}

export const authService = new AuthService();