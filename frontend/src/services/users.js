import { api } from './apiClient';

export async function fetchCurrentUser() {
  // was: return api.get('/api/users/');
  const res = await api.get('/api/users/profile/');
  return res.data;
}

export async function updateCurrentUser(payload) {
  // Profile endpoint is read-only in backend; keep for future
  const res = await api.put('/api/users/profile/', payload);
  return res.data;
}

export async function listUsers(params) {
  const res = await api.get('/api/users/', { params });
  return res.data;
}


