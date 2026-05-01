import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CartSidebar from './CartSidebar';

// ── Shared test data ──────────────────────────────────────────────────────────

const MOCK_ITEM_A = {
  itemId: 'item-uuid-001',
  productId: 'prod-001',
  name: 'Wireless Headphones',
  price: 2499,
  quantity: 2,
};

const MOCK_ITEM_B = {
  itemId: 'item-uuid-002',
  productId: 'prod-002',
  name: 'Running Sneakers',
  price: 3299,
  quantity: 1,
};

const EMPTY_CART = {
  sessionId: 'sess-test',
  items: [],
  coupon: null,
  discount: 0,
  subtotal: 0,
  total: 0,
};

const LOADED_CART = {
  sessionId: 'sess-test',
  items: [MOCK_ITEM_A],
  coupon: null,
  discount: 0,
  subtotal: 4998,
  total: 4998,
};

const COUPON_CART = {
  ...LOADED_CART,
  coupon: 'SAVE50',
  discount: 50,
  total: 4948,
};

const DEFAULT_ORDER_STATE = { loading: false, orderId: null, error: null };

function renderSidebar(cartOverride = {}, extraProps = {}) {
  const mockFns = {
    onUpdateQty: vi.fn(),
    onRemoveItem: vi.fn(),
    onApplyCoupon: vi.fn(),
    onClearCart: vi.fn(),
    onCheckout: vi.fn(),
    onResetOrder: vi.fn(),
  };
  render(
    <CartSidebar
      cart={{ ...EMPTY_CART, ...cartOverride }}
      loading={false}
      cartError={null}
      couponStatus={null}
      orderState={DEFAULT_ORDER_STATE}
      {...mockFns}
      {...extraProps}
    />
  );
  return mockFns;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('CartSidebar', () => {

  // ── Rendering ─────────────────────────────────────────────
  it('renders the cart sidebar container', () => {
    renderSidebar();
    expect(screen.getByTestId('cart-sidebar')).toBeInTheDocument();
  });

  // ── Empty cart state ───────────────────────────────────────
  it('shows empty state when cart has no items', () => {
    renderSidebar();
    expect(screen.getByTestId('empty-cart-state')).toBeInTheDocument();
  });

  it('does not show Clear All button when cart is empty', () => {
    renderSidebar();
    expect(screen.queryByTestId('clear-cart-btn')).not.toBeInTheDocument();
  });

  // ── Loaded cart state ──────────────────────────────────────
  it('renders a cart item row for each item in the cart', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('cart-item-item-uuid-001')).toBeInTheDocument();
  });

  it('renders item name and price', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('item-name')).toHaveTextContent('Wireless Headphones');
    expect(screen.getByTestId('item-price')).toHaveTextContent('2,499');
  });

  it('renders quantity value for an item', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('qty-value-item-uuid-001')).toHaveTextContent('2');
  });

  it('renders correct line total (price × qty)', () => {
    renderSidebar(LOADED_CART);
    // 2499 × 2 = 4998
    expect(screen.getByTestId('item-line-total')).toHaveTextContent('4,998');
  });

  it('renders multiple items when cart has several', () => {
    renderSidebar({ ...LOADED_CART, items: [MOCK_ITEM_A, MOCK_ITEM_B] });
    expect(screen.getByTestId('cart-item-item-uuid-001')).toBeInTheDocument();
    expect(screen.getByTestId('cart-item-item-uuid-002')).toBeInTheDocument();
  });

  // ── Totals row ─────────────────────────────────────────────
  it('shows subtotal row', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('subtotal-row')).toHaveTextContent('4,998');
  });

  it('shows total row', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('total-row')).toHaveTextContent('4,998');
  });

  it('shows discount row when a coupon is applied', () => {
    renderSidebar(COUPON_CART);
    expect(screen.getByTestId('discount-row')).toBeInTheDocument();
    expect(screen.getByTestId('discount-row')).toHaveTextContent('50');
    expect(screen.getByTestId('discount-row')).toHaveTextContent('SAVE50');
  });

  it('does not show discount row when no coupon is applied', () => {
    renderSidebar(LOADED_CART);
    expect(screen.queryByTestId('discount-row')).not.toBeInTheDocument();
  });

  // ── Clear cart ─────────────────────────────────────────────
  it('shows Clear All button when cart has items', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('clear-cart-btn')).toBeInTheDocument();
  });

  it('calls onClearCart when Clear All is clicked', () => {
    const fns = renderSidebar(LOADED_CART);
    fireEvent.click(screen.getByTestId('clear-cart-btn'));
    expect(fns.onClearCart).toHaveBeenCalledTimes(1);
  });

  // ── Quantity controls ──────────────────────────────────────
  it('calls onUpdateQty with decremented qty when − is clicked', () => {
    const fns = renderSidebar(LOADED_CART);
    fireEvent.click(screen.getByTestId('qty-dec-item-uuid-001'));
    expect(fns.onUpdateQty).toHaveBeenCalledWith('item-uuid-001', 1);
  });

  it('calls onUpdateQty with incremented qty when + is clicked', () => {
    const fns = renderSidebar(LOADED_CART);
    fireEvent.click(screen.getByTestId('qty-inc-item-uuid-001'));
    expect(fns.onUpdateQty).toHaveBeenCalledWith('item-uuid-001', 3);
  });

  it('disables − button when quantity is 1', () => {
    renderSidebar({ ...LOADED_CART, items: [{ ...MOCK_ITEM_A, quantity: 1 }] });
    expect(screen.getByTestId('qty-dec-item-uuid-001')).toBeDisabled();
  });

  it('disables + button when quantity is at max (10)', () => {
    renderSidebar({ ...LOADED_CART, items: [{ ...MOCK_ITEM_A, quantity: 10 }] });
    expect(screen.getByTestId('qty-inc-item-uuid-001')).toBeDisabled();
  });

  // ── Remove item ────────────────────────────────────────────
  it('calls onRemoveItem when remove button is clicked', () => {
    const fns = renderSidebar(LOADED_CART);
    fireEvent.click(screen.getByTestId('remove-item-item-uuid-001'));
    expect(fns.onRemoveItem).toHaveBeenCalledWith('item-uuid-001');
  });

  // ── Loading state ──────────────────────────────────────────
  it('disables qty and remove buttons while loading', () => {
    renderSidebar(LOADED_CART, { loading: true });
    expect(screen.getByTestId('qty-dec-item-uuid-001')).toBeDisabled();
    expect(screen.getByTestId('qty-inc-item-uuid-001')).toBeDisabled();
    expect(screen.getByTestId('remove-item-item-uuid-001')).toBeDisabled();
  });

  it('disables Clear All button while loading', () => {
    renderSidebar(LOADED_CART, { loading: true });
    expect(screen.getByTestId('clear-cart-btn')).toBeDisabled();
  });

  // ── Error banner ───────────────────────────────────────────
  it('shows error banner when cartError is set', () => {
    renderSidebar(LOADED_CART, { cartError: 'Something went wrong' });
    expect(screen.getByTestId('cart-error-banner')).toBeInTheDocument();
    expect(screen.getByTestId('cart-error-banner')).toHaveTextContent('Something went wrong');
  });

  it('does not show error banner when cartError is null', () => {
    renderSidebar(LOADED_CART, { cartError: null });
    expect(screen.queryByTestId('cart-error-banner')).not.toBeInTheDocument();
  });

  // ── Coupon input integration ───────────────────────────────
  it('renders the coupon input when no order is placed', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('coupon-input')).toBeInTheDocument();
  });

  it('hides coupon input after order is placed', () => {
    renderSidebar(LOADED_CART, {
      orderState: { loading: false, orderId: 'order-uuid-001', error: null },
    });
    expect(screen.queryByTestId('coupon-input')).not.toBeInTheDocument();
  });

  // ── Checkout button integration ────────────────────────────
  it('renders checkout button', () => {
    renderSidebar(LOADED_CART);
    expect(screen.getByTestId('checkout-btn')).toBeInTheDocument();
  });

  it('shows order success panel in checkout area when orderId is set', () => {
    renderSidebar(LOADED_CART, {
      orderState: { loading: false, orderId: 'order-uuid-001', error: null },
    });
    expect(screen.getByTestId('order-success')).toBeInTheDocument();
  });
});
