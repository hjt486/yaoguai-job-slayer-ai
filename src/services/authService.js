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
  notify() {
    const currentUser = this.getCurrentUser();
    this.subscribers.forEach(callback => callback(currentUser));
  }

  // Modified existing methods to include notifications
  login(credentials) {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) throw new Error('User not found');
    if (user.password !== credentials.password) throw new Error('Invalid password');

    const { password, ...userWithoutPassword } = user;
    storageService.set(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));

    this.notify(); // Notify subscribers after login
    return userWithoutPassword;
  }

  logout() {
    storageService.remove(CURRENT_USER_KEY);
    window.dispatchEvent(new CustomEvent('logout'));
    this.notify(); // Notify subscribers after logout
  }

  updateUser(userId, updateData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) throw new Error('User not found');

    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    storageService.set(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const currentUser = this.getCurrentUser();
    if (currentUser?.id === userId) {
      const { password, ...userWithoutPassword } = updatedUser;
      storageService.set(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      this.notify(); // Notify if current user updated
    }

    return { ...updatedUser, password: undefined };
  }


  getUsers() {
    const users = storageService.get(LOCAL_STORAGE_USERS_KEY);
    return users ? JSON.parse(users) : [];
  }

  register(userData) {
    const users = this.getUsers();

    if (users.some(user => user.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    storageService.set(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  login(credentials) {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password !== credentials.password) {
      throw new Error('Invalid password');
    }

    const { password, ...userWithoutPassword } = user;
    storageService.set(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  getCurrentUser() {
    const user = storageService.get(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  logout() {
    storageService.remove(CURRENT_USER_KEY);
    storageService.remove('currentProfile');
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('logout'));
  }

  updateUser(userId, updateData) {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const updatedUser = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    users[userIndex] = updatedUser;
    storageService.set(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { password, ...userWithoutPassword } = updatedUser;
      storageService.set(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  getUserApiSettings(userId) {
    try {
      const allSettings = JSON.parse(storageService.get(API_SETTINGS_KEY) || '{}');
      return allSettings[userId] || null;
    } catch (error) {
      console.error('Error loading API settings:', error);
      return null;
    }
  }

  updateUserApiSettings(userId, settings) {
    try {
      const allSettings = JSON.parse(storageService.get(API_SETTINGS_KEY) || '{}');
      allSettings[userId] = settings;
      storageService.set(API_SETTINGS_KEY, JSON.stringify(allSettings));
      return true;
    } catch (error) {
      console.error('Error saving API settings:', error);
      throw new Error('Failed to save API settings');
    }
  }
}

export const authService = new AuthService();