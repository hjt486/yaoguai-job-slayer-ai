const API_URL = 'your-api-endpoint'; // Replace with your actual API endpoint
const LOCAL_STORAGE_USERS_KEY = 'registeredUsers';
const CURRENT_USER_KEY = 'currentUser';
const API_SETTINGS_KEY = 'userApiSettings';

class AuthService {
  getUsers() {
    const users = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
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
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

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
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }

  getCurrentUser() {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  logout() {
    localStorage.removeItem(CURRENT_USER_KEY);
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
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const { password, ...userWithoutPassword } = updatedUser;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
    }

    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  getUserApiSettings(userId) {
    try {
      const allSettings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || '{}');
      return allSettings[userId] || null;
    } catch (error) {
      console.error('Error loading API settings:', error);
      return null;
    }
  }

  updateUserApiSettings(userId, settings) {
    try {
      const allSettings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY) || '{}');
      allSettings[userId] = settings;
      localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(allSettings));
      return true;
    } catch (error) {
      console.error('Error saving API settings:', error);
      throw new Error('Failed to save API settings');
    }
  }
}

export const authService = new AuthService();