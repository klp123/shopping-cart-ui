import { useState, useEffect, useCallback } from 'react';
import * as cartApi from '../api/cartApi';
import { createOrder } from '../api/orderApi';

/**
 * useCart — central state hook for the shopping cart.
 *
 * Manages: cart data, loading states, error messages, coupon feedback,
 *          order confirmation, and all API interactions.
 *
 * @param {string} sessionId — UUID identifying the current browser session
 */
export function useCart(sessionId) {
  const [cart, setCart]               = useState({ items: [], subtotal: 0, discount: 0, total: 0, coupon: null });
  const [loading, setLoading]         = useState(false);
  const [cartError, setCartError]     = useState(null);
  const [couponStatus, setCouponStatus] = useState({ message: '', type: '' }); // type: 'success'|'error'
  const [orderState, setOrderState]   = useState({ orderId: null, loading: false, error: null });

  // ── Helpers ──────────────────────────────────────────────
  const clearErrors = () => {
    setCartError(null);
  };

  const fetchCart = useCallback(async () => {
    if (!sessionId) return;
    setLoading(true);
    try {
      const data = await cartApi.getCart(sessionId);
      setCart(data);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Load cart on mount and whenever sessionId changes
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Cart actions ──────────────────────────────────────────

  const addItem = useCallback(async (product) => {
    clearErrors();
    setLoading(true);
    try {
      const data = await cartApi.addItem(sessionId, product);
      setCart(data);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const updateQty = useCallback(async (itemId, quantity) => {
    clearErrors();
    setLoading(true);
    try {
      const data = await cartApi.updateQty(sessionId, itemId, quantity);
      setCart(data);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const removeItem = useCallback(async (itemId) => {
    clearErrors();
    setLoading(true);
    try {
      const data = await cartApi.removeItem(sessionId, itemId);
      setCart(data);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleApplyCoupon = useCallback(async (code) => {
    setCouponStatus({ message: '', type: '' });
    setLoading(true);
    try {
      const data = await cartApi.applyCoupon(sessionId, code);
      setCart(data);
      setCouponStatus({ message: `Coupon "${data.coupon}" applied! You save ₹${data.discount}`, type: 'success' });
    } catch (err) {
      setCouponStatus({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const handleClearCart = useCallback(async () => {
    clearErrors();
    setCouponStatus({ message: '', type: '' });
    setLoading(true);
    try {
      const data = await cartApi.clearCart(sessionId);
      setCart(data);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // ── Order actions ─────────────────────────────────────────

  const placeOrder = useCallback(async () => {
    setOrderState({ orderId: null, loading: true, error: null });
    try {
      const order = await createOrder(sessionId, 'guest-user');
      setCart({ items: [], subtotal: 0, discount: 0, total: 0, coupon: null });
      setCouponStatus({ message: '', type: '' });
      setOrderState({ orderId: order.orderId, loading: false, error: null });
    } catch (err) {
      setOrderState({ orderId: null, loading: false, error: err.message });
    }
  }, [sessionId]);

  const resetOrder = useCallback(() => {
    setOrderState({ orderId: null, loading: false, error: null });
  }, []);

  return {
    cart,
    loading,
    cartError,
    couponStatus,
    orderState,
    addItem,
    updateQty,
    removeItem,
    applyCoupon: handleApplyCoupon,
    clearCart: handleClearCart,
    placeOrder,
    resetOrder,
    refreshCart: fetchCart,
  };
}
