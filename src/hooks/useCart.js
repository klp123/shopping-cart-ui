import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCart,
  addItem as addItemThunk,
  updateQty as updateQtyThunk,
  removeItem as removeItemThunk,
  applyCoupon as applyCouponThunk,
  clearCart as clearCartThunk,
  placeOrder as placeOrderThunk,
  resetOrder,
} from '../store/cartSlice';

/**
 * useCart — central state hook for the shopping cart.
 *
 * Reads state from the Redux store and dispatches thunks for all API interactions.
 * The returned interface is identical to the previous useState-based version so
 * App.jsx and all components remain unchanged.
 *
 * @param {string} sessionId — UUID identifying the current browser session
 */
export function useCart(sessionId) {
  const dispatch = useDispatch();
  const { cart, loading, cartError, couponStatus, orderState } = useSelector(
    (state) => state.cart
  );

  // Load cart on mount and whenever sessionId changes
  useEffect(() => {
    if (sessionId) dispatch(fetchCart(sessionId));
  }, [dispatch, sessionId]);

  const addItem = useCallback(
    (product) => dispatch(addItemThunk({ sessionId, product })),
    [dispatch, sessionId]
  );

  const updateQty = useCallback(
    (itemId, quantity) => dispatch(updateQtyThunk({ sessionId, itemId, quantity })),
    [dispatch, sessionId]
  );

  const removeItem = useCallback(
    (itemId) => dispatch(removeItemThunk({ sessionId, itemId })),
    [dispatch, sessionId]
  );

  const applyCoupon = useCallback(
    (code) => dispatch(applyCouponThunk({ sessionId, code })),
    [dispatch, sessionId]
  );

  const clearCart = useCallback(
    () => dispatch(clearCartThunk(sessionId)),
    [dispatch, sessionId]
  );

  const placeOrder = useCallback(
    () => dispatch(placeOrderThunk(sessionId)),
    [dispatch, sessionId]
  );

  const resetOrderFn = useCallback(() => dispatch(resetOrder()), [dispatch]);

  return {
    cart,
    loading,
    cartError,
    couponStatus,
    orderState,
    addItem,
    updateQty,
    removeItem,
    applyCoupon,
    clearCart,
    placeOrder,
    resetOrder: resetOrderFn,
  };
}
