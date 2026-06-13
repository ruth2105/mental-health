import { api, loginWithCredentials, logout as apiLogout } from './apiClient';
import { fetchCurrentUser } from './users';

export const authService = {
  async register({ email, password, name, role, language }) {
    const payload = { email, password, name, role, language };
    const res = await api.post('/api/users/register/', payload);
    return res.data;
  },
  async login({ email, password, username }) {
    const userField = username || email;
    return await loginWithCredentials(userField, password);
  },
  logout() {
    apiLogout();
  },
  isAuthenticated() {
    try { return Boolean(localStorage.getItem('access_token')); } catch { return false; }
  },
};

export const mentalHealthService = {
  async getRecommendations() {
    const res = await api.get('/api/mental_health/recommend/');
    return res.data;
  },
  async predict(payload) {
    // Payload should already contain { symptoms: [...], language: 'en' }
    const res = await api.post('/api/mental_health/predict/', payload);
    return res.data;
  },
};

export const paymentService = {
  async initiatePayment(payload) {
    const res = await api.post('/api/payments/initiate/', payload);
    return res.data;
  },
};

export const appointmentService = {
  async getVideoToken(appointmentId) {
    const res = await api.get(`/api/appointments/${appointmentId}/token/`);
    return res.data;
  },
  async startSession(appointmentId) {
    const res = await api.post(`/api/appointments/${appointmentId}/start-session/`);
    return res.data;
  },
};

// Backwards-compatible user service used by some contexts/components
export const userService = {
  async getProfile() {
    return await fetchCurrentUser();
  },
};


