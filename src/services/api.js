import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL
const API_BASE_URL = 'https://happy-encouragement-production.up.railway.app/api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'userData';

class ApiService {
  constructor() {
    this.token = null;
  }

  // Initialize and load token
  async init() {
    try {
      this.token = await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('Failed to load token:', error);
    }
  }

  // Set auth token
  async setToken(token) {
    this.token = token;
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  // Remove auth token
  async removeToken() {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
  }

  // Get stored user data
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to get user data:', error);
      return null;
    }
  }

  // Save user data
  async saveUserData(user) {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  // Generic fetch method
  async fetch(endpoint, options = {}) {
    try {
      // Ensure token is loaded before making request
      if (!this.token) {
        await this.init();
      }

      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({ message: 'Invalid JSON response' }));

      if (!response.ok) {
        console.error(`API Error Details - Status: ${response.status}, Endpoint: ${endpoint}`, data);
        throw new Error(data.message || data.error || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      // If it's a network error, provide more context
      if (error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check your internet connection.');
      }
      throw error;
    }
  }

  // Auth endpoints
  async register(email, username, password) {
    const response = await this.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });

    if (response.success) {
      await this.setToken(response.data.token);
      await this.saveUserData(response.data.user);
    }

    return response;
  }

  async login(email, password) {
    const response = await this.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success) {
      await this.setToken(response.data.token);
      await this.saveUserData(response.data.user);
    }

    return response;
  }

  async logout() {
    await this.removeToken();
  }

  // Notes endpoints
  async getNotes(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/notes${queryString ? `?${queryString}` : ''}`;
    return await this.fetch(endpoint);
  }

  async getNote(id) {
    return await this.fetch(`/notes/${id}`);
  }

  async createNote(noteData) {
    return await this.fetch('/notes', {
      method: 'POST',
      body: JSON.stringify(noteData),
    });
  }

  async updateNote(id, noteData) {
    return await this.fetch(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(noteData),
    });
  }

  async deleteNote(id) {
    return await this.fetch(`/notes/${id}`, {
      method: 'DELETE',
    });
  }

  async togglePin(id) {
    return await this.fetch(`/notes/${id}/pin`, {
      method: 'PATCH',
    });
  }

  async getTrash() {
    return await this.fetch('/notes/trash/all');
  }

  async restoreNote(id) {
    return await this.fetch(`/notes/${id}/restore`, {
      method: 'PATCH',
    });
  }

  // User endpoints
  async getProfile() {
    return await this.fetch('/user/profile');
  }

  async updateProfile(userData) {
    return await this.fetch('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Check if user is authenticated
  async isAuthenticated() {
    if (!this.token) {
      await this.init();
    }
    return !!this.token;
  }
}

export default new ApiService();
