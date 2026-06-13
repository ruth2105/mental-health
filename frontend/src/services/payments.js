import { api } from './apiClient';

// Backend exposes a Chapa initiate endpoint at /api/payments/initiate/
export async function createPayment(payload) {
  const res = await api.post('/api/payments/initiate/', payload);
  return res.data;
}

// Listing payments is not exposed by the public API (only admin).
// Keep this helper but it may return 404 if the backend does not expose it.
export async function listPayments(params) {
  const res = await api.get('/api/payments/', { params });
  return res.data;
}


