import axios from "axios";
import { useCallback } from "react";

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://127.0.0.1:8000';

export function useApi() {
  const api = axios.create({
    baseURL: `${API_BASE}/api`,
  });

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token") || localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleError = (error: any) => {
    // If 401 and we have a token, it's expired - clear it
    if (error.response?.status === 401) {
      const hasToken = localStorage.getItem("access_token") || localStorage.getItem('token');
      if (hasToken) {
        console.log('Token expired, clearing...');
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
      }
    }
    throw error;
  };

  const get = useCallback(async (url: string) => {
    try {
      const response = await api.get(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const post = useCallback(async (url: string, body: any) => {
    try {
      const response = await api.post(url, body, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const put = useCallback(async (url: string, body: any) => {
    try {
      const response = await api.put(url, body, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const patch = useCallback(async (url: string, body: any) => {
    try {
      const response = await api.patch(url, body, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }, []);

  const del = useCallback(async (url: string) => {
    try {
      const response = await api.delete(url, { headers: getAuthHeaders() });
      return response.data;
    } catch (error) {
      return handleError(error);
    }
  }, []);

  return { get, post, put, patch, del };
}
