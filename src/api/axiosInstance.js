import axios from 'axios';

/**
 * Shared Axios instance — base URL from .env (VITE_API_URL).
 * Falls back to localhost:3000 for local dev.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://98.86.177.18:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — attach Bearer token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('poc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — unwrap data, normalise errors
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;
