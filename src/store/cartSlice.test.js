import { configureStore } from '@reduxjs/toolkit';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
  fetchCart,
  addItem,
  updateQty,
  removeItem,
  applyCoupon,
  clearCart,
  placeOrder,
  resetOrder,
} from './cartSlice';

// ── Mock API modules ──────────────────────────────────────────────────────────

vi.mock('../api/cartApi', () => ({
  getCart:      vi.fn(),
  addItem:      vi.fn(),
  updateQty:    vi.fn(),
  removeItem:   vi.fn(),
  applyCoupon:  vi.fn(),
  clearCart:    vi.fn(),
}));

vi.mock('../api/orderApi', () => ({
  createOrder: vi.fn(),
}));

import * as cartApi from '../api/cartApi';
import * as orderApi from '../api/orderApi';

// ── Shared test data ──────────────────────────────────────────────────────────

const SESSION = 'sess-test-001';

const EMPTY_CART = { items: [], subtotal: 0, discount: 0, total: 0, coupon: null };

const MOCK_CART = {
  sessionId: SESSION,
  items: [{ itemId: 'item-001', productId: 'prod-001', name: 'Wireless Headphones', price: 2499, quantity: 2 }],
  coupon: null,
  discount: 0,
  subtotal: 4998,
  total: 4998,
};

const MOCK_CART_COUPON = {
  ...MOCK_CART,
  coupon: 'SAVE50',
  discount: 50,
  total: 4948,
};

const MOCK_ORDER = {
  orderId: 'order-uuid-001',
  userId: 'guest-user',
  sessionId: SESSION,
  total: 4998,
  status: 'PLACED',
};

// ── Helper: build a fresh store for each test ─────────────────────────────────

function makeStore() {
  return configureStore({ reducer: { cart: cartReducer } });
}

function getCartState(store) {
  return store.getState().cart;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('cartSlice — initial state', () => {
  it('has the correct initial state shape', () => {
    const store = makeStore();
    const state = getCartState(store);
    expect(state.cart).toEqual(EMPTY_CART);
    expect(state.loading).toBe(false);
    expect(state.cartError).toBeNull();
    expect(state.couponStatus).toEqual({ message: '', type: '' });
    expect(state.orderState).toEqual({ orderId: null, loading: false, error: null });
  });
});

// ── resetOrder (synchronous reducer) ─────────────────────────────────────────

describe('resetOrder reducer', () => {
  it('clears orderState back to initial values', () => {
    const store = makeStore();
    // Inject a non-null orderState directly via placeOrder.fulfilled
    store.dispatch({
      type: placeOrder.fulfilled.type,
      payload: MOCK_ORDER,
    });
    expect(getCartState(store).orderState.orderId).toBe('order-uuid-001');

    store.dispatch(resetOrder());

    const { orderState } = getCartState(store);
    expect(orderState.orderId).toBeNull();
    expect(orderState.loading).toBe(false);
    expect(orderState.error).toBeNull();
  });
});

// ── fetchCart thunk ───────────────────────────────────────────────────────────

describe('fetchCart thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets loading=true while pending', async () => {
    cartApi.getCart.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    const promise = store.dispatch(fetchCart(SESSION));
    expect(getCartState(store).loading).toBe(true);
    await promise;
  });

  it('stores fetched cart and clears loading on success', async () => {
    cartApi.getCart.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    await store.dispatch(fetchCart(SESSION));
    const { cart, loading } = getCartState(store);
    expect(loading).toBe(false);
    expect(cart).toEqual(MOCK_CART);
  });

  it('sets cartError and clears loading on failure', async () => {
    cartApi.getCart.mockRejectedValue(new Error('Network error'));
    const store = makeStore();
    await store.dispatch(fetchCart(SESSION));
    const { loading, cartError } = getCartState(store);
    expect(loading).toBe(false);
    expect(cartError).toBe('Network error');
  });

  it('calls cartApi.getCart with the correct sessionId', async () => {
    cartApi.getCart.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    await store.dispatch(fetchCart(SESSION));
    expect(cartApi.getCart).toHaveBeenCalledWith(SESSION);
  });
});

// ── addItem thunk ─────────────────────────────────────────────────────────────

describe('addItem thunk', () => {
  const PRODUCT = { productId: 'prod-001', name: 'Wireless Headphones', price: 2499, quantity: 1 };

  beforeEach(() => vi.clearAllMocks());

  it('sets loading=true and clears cartError while pending', async () => {
    cartApi.addItem.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    const promise = store.dispatch(addItem({ sessionId: SESSION, product: PRODUCT }));
    const { loading, cartError } = getCartState(store);
    expect(loading).toBe(true);
    expect(cartError).toBeNull();
    await promise;
  });

  it('updates cart state on success', async () => {
    cartApi.addItem.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    await store.dispatch(addItem({ sessionId: SESSION, product: PRODUCT }));
    const { cart, loading } = getCartState(store);
    expect(loading).toBe(false);
    expect(cart).toEqual(MOCK_CART);
  });

  it('sets cartError on failure', async () => {
    cartApi.addItem.mockRejectedValue(new Error('Product not found'));
    const store = makeStore();
    await store.dispatch(addItem({ sessionId: SESSION, product: PRODUCT }));
    expect(getCartState(store).cartError).toBe('Product not found');
    expect(getCartState(store).loading).toBe(false);
  });

  it('calls cartApi.addItem with the correct arguments', async () => {
    cartApi.addItem.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    await store.dispatch(addItem({ sessionId: SESSION, product: PRODUCT }));
    expect(cartApi.addItem).toHaveBeenCalledWith(SESSION, PRODUCT);
  });
});

// ── updateQty thunk ───────────────────────────────────────────────────────────

describe('updateQty thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates cart on success', async () => {
    const updatedCart = { ...MOCK_CART, items: [{ ...MOCK_CART.items[0], quantity: 5 }] };
    cartApi.updateQty.mockResolvedValue(updatedCart);
    const store = makeStore();
    await store.dispatch(updateQty({ sessionId: SESSION, itemId: 'item-001', quantity: 5 }));
    expect(getCartState(store).cart.items[0].quantity).toBe(5);
    expect(getCartState(store).loading).toBe(false);
  });

  it('sets cartError on failure', async () => {
    cartApi.updateQty.mockRejectedValue(new Error('Item not found'));
    const store = makeStore();
    await store.dispatch(updateQty({ sessionId: SESSION, itemId: 'bad-id', quantity: 3 }));
    expect(getCartState(store).cartError).toBe('Item not found');
  });

  it('calls cartApi.updateQty with correct arguments', async () => {
    cartApi.updateQty.mockResolvedValue(MOCK_CART);
    const store = makeStore();
    await store.dispatch(updateQty({ sessionId: SESSION, itemId: 'item-001', quantity: 3 }));
    expect(cartApi.updateQty).toHaveBeenCalledWith(SESSION, 'item-001', 3);
  });
});

// ── removeItem thunk ──────────────────────────────────────────────────────────

describe('removeItem thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates cart to empty on success', async () => {
    cartApi.removeItem.mockResolvedValue(EMPTY_CART);
    const store = makeStore();
    await store.dispatch(removeItem({ sessionId: SESSION, itemId: 'item-001' }));
    expect(getCartState(store).cart).toEqual(EMPTY_CART);
    expect(getCartState(store).loading).toBe(false);
  });

  it('sets cartError on failure', async () => {
    cartApi.removeItem.mockRejectedValue(new Error('Remove failed'));
    const store = makeStore();
    await store.dispatch(removeItem({ sessionId: SESSION, itemId: 'item-001' }));
    expect(getCartState(store).cartError).toBe('Remove failed');
  });

  it('calls cartApi.removeItem with correct arguments', async () => {
    cartApi.removeItem.mockResolvedValue(EMPTY_CART);
    const store = makeStore();
    await store.dispatch(removeItem({ sessionId: SESSION, itemId: 'item-001' }));
    expect(cartApi.removeItem).toHaveBeenCalledWith(SESSION, 'item-001');
  });
});

// ── applyCoupon thunk ─────────────────────────────────────────────────────────

describe('applyCoupon thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears couponStatus while pending', async () => {
    cartApi.applyCoupon.mockResolvedValue(MOCK_CART_COUPON);
    const store = makeStore();
    const promise = store.dispatch(applyCoupon({ sessionId: SESSION, code: 'SAVE50' }));
    expect(getCartState(store).couponStatus).toEqual({ message: '', type: '' });
    await promise;
  });

  it('sets success couponStatus and updates cart on success', async () => {
    cartApi.applyCoupon.mockResolvedValue(MOCK_CART_COUPON);
    const store = makeStore();
    await store.dispatch(applyCoupon({ sessionId: SESSION, code: 'SAVE50' }));
    const { cart, couponStatus, loading } = getCartState(store);
    expect(loading).toBe(false);
    expect(cart).toEqual(MOCK_CART_COUPON);
    expect(couponStatus.type).toBe('success');
    expect(couponStatus.message).toContain('SAVE50');
    expect(couponStatus.message).toContain('50');
  });

  it('sets error couponStatus on failure (does not touch cartError)', async () => {
    cartApi.applyCoupon.mockRejectedValue(new Error('Invalid or unknown coupon code'));
    const store = makeStore();
    await store.dispatch(applyCoupon({ sessionId: SESSION, code: 'BAD' }));
    const { couponStatus, cartError } = getCartState(store);
    expect(couponStatus.type).toBe('error');
    expect(couponStatus.message).toBe('Invalid or unknown coupon code');
    expect(cartError).toBeNull(); // coupon errors do NOT write to cartError
  });

  it('calls cartApi.applyCoupon with correct arguments', async () => {
    cartApi.applyCoupon.mockResolvedValue(MOCK_CART_COUPON);
    const store = makeStore();
    await store.dispatch(applyCoupon({ sessionId: SESSION, code: 'SAVE50' }));
    expect(cartApi.applyCoupon).toHaveBeenCalledWith(SESSION, 'SAVE50');
  });
});

// ── clearCart thunk ───────────────────────────────────────────────────────────

describe('clearCart thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('resets cart to empty and clears couponStatus while pending', async () => {
    cartApi.clearCart.mockResolvedValue(EMPTY_CART);
    const store = makeStore();
    const promise = store.dispatch(clearCart(SESSION));
    const { loading, couponStatus } = getCartState(store);
    expect(loading).toBe(true);
    expect(couponStatus).toEqual({ message: '', type: '' });
    await promise;
  });

  it('sets cart to empty response on success', async () => {
    cartApi.clearCart.mockResolvedValue(EMPTY_CART);
    const store = makeStore();
    await store.dispatch(clearCart(SESSION));
    const { cart, loading } = getCartState(store);
    expect(loading).toBe(false);
    expect(cart).toEqual(EMPTY_CART);
  });

  it('sets cartError on failure', async () => {
    cartApi.clearCart.mockRejectedValue(new Error('Clear failed'));
    const store = makeStore();
    await store.dispatch(clearCart(SESSION));
    expect(getCartState(store).cartError).toBe('Clear failed');
  });

  it('calls cartApi.clearCart with the sessionId', async () => {
    cartApi.clearCart.mockResolvedValue(EMPTY_CART);
    const store = makeStore();
    await store.dispatch(clearCart(SESSION));
    expect(cartApi.clearCart).toHaveBeenCalledWith(SESSION);
  });
});

// ── placeOrder thunk ──────────────────────────────────────────────────────────

describe('placeOrder thunk', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sets orderState.loading=true while pending', async () => {
    orderApi.createOrder.mockResolvedValue(MOCK_ORDER);
    const store = makeStore();
    const promise = store.dispatch(placeOrder(SESSION));
    expect(getCartState(store).orderState.loading).toBe(true);
    expect(getCartState(store).orderState.orderId).toBeNull();
    await promise;
  });

  it('stores orderId, clears cart and couponStatus on success', async () => {
    orderApi.createOrder.mockResolvedValue(MOCK_ORDER);
    const store = makeStore();
    await store.dispatch(placeOrder(SESSION));
    const { cart, couponStatus, orderState } = getCartState(store);
    expect(orderState.loading).toBe(false);
    expect(orderState.orderId).toBe('order-uuid-001');
    expect(orderState.error).toBeNull();
    expect(cart).toEqual(EMPTY_CART);
    expect(couponStatus).toEqual({ message: '', type: '' });
  });

  it('sets orderState.error on failure', async () => {
    orderApi.createOrder.mockRejectedValue(new Error('Cart is empty'));
    const store = makeStore();
    await store.dispatch(placeOrder(SESSION));
    const { orderState } = getCartState(store);
    expect(orderState.loading).toBe(false);
    expect(orderState.orderId).toBeNull();
    expect(orderState.error).toBe('Cart is empty');
  });

  it('calls orderApi.createOrder with sessionId and "guest-user"', async () => {
    orderApi.createOrder.mockResolvedValue(MOCK_ORDER);
    const store = makeStore();
    await store.dispatch(placeOrder(SESSION));
    expect(orderApi.createOrder).toHaveBeenCalledWith(SESSION, 'guest-user');
  });
});

// ── Action type string checks ─────────────────────────────────────────────────

describe('thunk action type names', () => {
  it('fetchCart has correct type prefix', () => {
    expect(fetchCart.pending.type).toBe('cart/fetchCart/pending');
    expect(fetchCart.fulfilled.type).toBe('cart/fetchCart/fulfilled');
    expect(fetchCart.rejected.type).toBe('cart/fetchCart/rejected');
  });

  it('placeOrder has correct type prefix', () => {
    expect(placeOrder.pending.type).toBe('cart/placeOrder/pending');
    expect(placeOrder.fulfilled.type).toBe('cart/placeOrder/fulfilled');
    expect(placeOrder.rejected.type).toBe('cart/placeOrder/rejected');
  });

  it('resetOrder has correct action type', () => {
    expect(resetOrder.type).toBe('cart/resetOrder');
  });
});
