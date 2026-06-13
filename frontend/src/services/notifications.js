import { api } from './apiClient';

// Backend currently exposes only a test endpoint at /api/notifications/test/
export async function listNotifications(params) {
  const res = await api.get('/api/notifications/test/', { params });
  return res.data;
}

export async function markAsRead(id) {
  throw new Error('markAsRead: backend does not expose a mark-as-read endpoint');
}


