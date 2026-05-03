import api from './axiosInstance';

/** Fetch all products from the catalogue */
export const getProducts = (params = {}) =>
  api.get('/products', { params });
