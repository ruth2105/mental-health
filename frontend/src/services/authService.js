import api from './api';

/**
 * Authentication Service
 * Handles user registration, login, logout, and token management
 */

export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise} Response data
   */
  register: async (userData) => {
    const response = await api.post('/api/users/register/', userData);
    return response.data;
  },

  /**
   * Login user and get JWT tokens
   * @param {Object} credentials - { email, password }
   * @returns {Promise} { access, refresh } tokens
   */
  login: async (credentials) => {
    const response = await api.post('/api/users/login/', credentials);
    const { access, refresh } = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },

  /**
   * Get new access token using refresh token
   * @returns {Promise} New access token
   */
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/api/auth/token/refresh/', {
      refresh: refreshToken,
    });
    
    const { access } = response.data;
    localStorage.setItem('access_token', access);
    
    return access;
  },

  /**
   * Logout user (clears tokens)
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  /**
   * Get stored access token
   * @returns {string|null}
   */
  getToken: () => {
    return localStorage.getItem('access_token');
  },
};

export default authService;
