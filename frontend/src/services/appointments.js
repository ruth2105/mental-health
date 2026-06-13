import { api } from './apiClient';

export async function listAppointments(params) {
  const res = await api.get('/api/appointments/', { params });
  return res.data;
}

export async function createAppointment(payload) {
  const res = await api.post('/api/appointments/', payload);
  return res.data;
}

export async function cancelAppointment(id) {
  const res = await api.delete(`/api/appointments/${id}/`);
  return res.data;
}


