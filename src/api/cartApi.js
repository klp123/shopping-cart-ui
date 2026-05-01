import api from './axiosInstance';

/**
 * Cart API — all calls scoped to a sessionId.
 * Every function returns the full updated cart object.
 */

/** FR04 — Fetch cart with computed subtotal/total */
export const getCart = (sessionId) =>
  api.get(`/cart/${sessionId}`);

/** FR01 — Add product to cart */
export const addItem = (sessionId, { productId, name, price, quantity }) =>
  api.post(`/cart/${sessionId}/items`, { productId, name, price, quantity });

/** FR02 — Update item quantity */
export const updateQty = (sessionId, itemId, quantity) =>
  api.put(`/cart/${sessionId}/items/${itemId}`, { quantity });

/** FR03 — Remove item from cart */
export const removeItem = (sessionId, itemId) =>
  api.delete(`/cart/${sessionId}/items/${itemId}`);

/** FR05 — Apply coupon code */
export const applyCoupon = (sessionId, code) =>
  api.post(`/cart/${sessionId}/coupon`, { code });

/** Clear all items from cart */
export const clearCart = (sessionId) =>
  api.delete(`/cart/${sessionId}`);
