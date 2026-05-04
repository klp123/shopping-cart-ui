import api from './axiosInstance';

/**
 * Order API
 */

/** FR07 — Place order from current cart */
export const createOrder = (sessionId, userId) =>
  api.post('/orders', { sessionId, userId });

/** FR08 — Fetch the order detail by ID */
export const getOrderById = (orderId) =>
  api.get(`/orders/${orderId}`);
