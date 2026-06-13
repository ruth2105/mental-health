import { api } from './apiClient';

// Backend endpoints:
// POST /api/mental_health/predict/  -> returns prediction
// POST /api/mental_health/recommend/ -> returns recommendations
// POST /api/mental_health/chat/ -> chat AI conversation
// GET /api/mental_health/chat/history/ -> chat history

export async function predict(payload) {
  const res = await api.post('/api/mental_health/predict/', payload);
  return res.data;
}

export async function recommend(payload) {
  const res = await api.post('/api/mental_health/recommend/', payload);
  return res.data;
}

export async function chatWithAI(payload) {
  const res = await api.post('/api/mental_health/chat/', payload);
  return res.data;
}

export async function getChatHistory(sessionId = null) {
  const url = sessionId 
    ? `/api/mental_health/chat/history/${sessionId}/`
    : '/api/mental_health/chat/history/';
  const res = await api.get(url);
  return res.data;
}


