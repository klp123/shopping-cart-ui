import api from './axiosInstance';

/** POST /auth/login — returns JWT token */
export const login = (email, password) =>
  api.post('/auth/login', { email, password });
