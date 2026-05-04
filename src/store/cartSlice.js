import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '../api/cartApi';
import { createOrder } from '../api/orderApi';

const EMPTY_CART = { items: [], subtotal: 0, discount: 0, total: 0, coupon: null };

// ── Async thunks ──────────────────────────────────────────────

export const fetchCart = createAsyncThunk('cart/fetchCart', async (sessionId) => {
  return await cartApi.getCart(sessionId);
});

export const addItem = createAsyncThunk('cart/addItem', async ({ sessionId, product }, { rejectWithValue }) => {
  try {
    return await cartApi.addItem(sessionId, product);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateQty = createAsyncThunk('cart/updateQty', async ({ sessionId, itemId, quantity }, { rejectWithValue }) => {
  try {
    return await cartApi.updateQty(sessionId, itemId, quantity);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const removeItem = createAsyncThunk('cart/removeItem', async ({ sessionId, itemId }, { rejectWithValue }) => {
  try {
    return await cartApi.removeItem(sessionId, itemId);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// applyCoupon errors go to couponStatus, not cartError — use rejectWithValue
export const applyCoupon = createAsyncThunk('cart/applyCoupon', async ({ sessionId, code }, { rejectWithValue }) => {
  try {
    return await cartApi.applyCoupon(sessionId, code);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const clearCart = createAsyncThunk('cart/clearCart', async (sessionId, { rejectWithValue }) => {
  try {
    return await cartApi.clearCart(sessionId);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const placeOrder = createAsyncThunk('cart/placeOrder', async (sessionId, { rejectWithValue }) => {
  try {
    return await createOrder(sessionId, 'guest-user');
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

// ── Slice ─────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: EMPTY_CART,
    loading: false,
    cartError: null,
    couponStatus: { message: '', type: '' },
    orderState: { orderId: null, loading: false, error: null },
  },
  reducers: {
    resetOrder(state) {
      state.orderState = { orderId: null, loading: false, error: null };
    },
  },
  extraReducers: (builder) => {
    // ── fetchCart ──────────────────────────────────────────
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.cartError = action.payload ?? action.error.message;
      });

    // ── addItem ────────────────────────────────────────────
    builder
      .addCase(addItem.pending, (state) => {
        state.loading = true;
        state.cartError = null;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(addItem.rejected, (state, action) => {
        state.loading = false;
        state.cartError = action.payload ?? action.error.message;
      });

    // ── updateQty ──────────────────────────────────────────
    builder
      .addCase(updateQty.pending, (state) => {
        state.loading = true;
        state.cartError = null;
      })
      .addCase(updateQty.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(updateQty.rejected, (state, action) => {
        state.loading = false;
        state.cartError = action.payload ?? action.error.message;
      });

    // ── removeItem ─────────────────────────────────────────
    builder
      .addCase(removeItem.pending, (state) => {
        state.loading = true;
        state.cartError = null;
      })
      .addCase(removeItem.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(removeItem.rejected, (state, action) => {
        state.loading = false;
        state.cartError = action.payload ?? action.error.message;
      });

    // ── applyCoupon ────────────────────────────────────────
    builder
      .addCase(applyCoupon.pending, (state) => {
        state.loading = true;
        state.couponStatus = { message: '', type: '' };
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
        state.couponStatus = {
          message: `Coupon "${action.payload.coupon}" applied! You save ₹${action.payload.discount}`,
          type: 'success',
        };
      })
      .addCase(applyCoupon.rejected, (state, action) => {
        state.loading = false;
        state.couponStatus = { message: action.payload ?? action.error.message, type: 'error' };
      });

    // ── clearCart ──────────────────────────────────────────
    builder
      .addCase(clearCart.pending, (state) => {
        state.loading = true;
        state.cartError = null;
        state.couponStatus = { message: '', type: '' };
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.cartError = action.payload ?? action.error.message;
      });

    // ── placeOrder ─────────────────────────────────────────
    builder
      .addCase(placeOrder.pending, (state) => {
        state.orderState = { orderId: null, loading: true, error: null };
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.cart = EMPTY_CART;
        state.couponStatus = { message: '', type: '' };
        state.orderState = { orderId: action.payload.orderId, loading: false, error: null };
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.orderState = { orderId: null, loading: false, error: action.payload ?? action.error.message };
      });
  },
});

export const { resetOrder } = cartSlice.actions;
export default cartSlice.reducer;
