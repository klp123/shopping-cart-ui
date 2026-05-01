import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutButton from './CheckoutButton';

describe('CheckoutButton', () => {
  const mockCheckout = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    mockCheckout.mockClear();
    mockReset.mockClear();
  });

  // ── Normal (idle) state ──────────────────────────────────────

  it('renders the checkout button when cart has items', () => {
    render(<CheckoutButton cartIsEmpty={false} onCheckout={mockCheckout} onReset={mockReset} />);
    expect(screen.getByTestId('checkout-btn')).toBeInTheDocument();
  });

  it('button is enabled when cart is not empty and not loading', () => {
    render(<CheckoutButton cartIsEmpty={false} onCheckout={mockCheckout} onReset={mockReset} />);
    expect(screen.getByTestId('checkout-btn')).not.toBeDisabled();
  });

  it('calls onCheckout when button is clicked', () => {
    render(<CheckoutButton cartIsEmpty={false} onCheckout={mockCheckout} onReset={mockReset} />);
    fireEvent.click(screen.getByTestId('checkout-btn'));
    expect(mockCheckout).toHaveBeenCalledTimes(1);
  });

  // ── Empty cart state ─────────────────────────────────────────

  it('disables the button when cart is empty', () => {
    render(<CheckoutButton cartIsEmpty={true} onCheckout={mockCheckout} onReset={mockReset} />);
    expect(screen.getByTestId('checkout-btn')).toBeDisabled();
  });

  it('shows empty cart hint text when cart is empty', () => {
    render(<CheckoutButton cartIsEmpty={true} onCheckout={mockCheckout} onReset={mockReset} />);
    expect(screen.getByTestId('empty-cart-hint')).toBeInTheDocument();
  });

  it('does not call onCheckout when button is disabled (empty cart)', () => {
    render(<CheckoutButton cartIsEmpty={true} onCheckout={mockCheckout} onReset={mockReset} />);
    fireEvent.click(screen.getByTestId('checkout-btn'));
    expect(mockCheckout).not.toHaveBeenCalled();
  });

  // ── Loading state ────────────────────────────────────────────

  it('disables the button while loading', () => {
    render(
      <CheckoutButton cartIsEmpty={false} loading={true} onCheckout={mockCheckout} onReset={mockReset} />
    );
    expect(screen.getByTestId('checkout-btn')).toBeDisabled();
  });

  it('shows "Placing Order…" text while loading', () => {
    render(
      <CheckoutButton cartIsEmpty={false} loading={true} onCheckout={mockCheckout} onReset={mockReset} />
    );
    expect(screen.getByTestId('checkout-btn')).toHaveTextContent('Placing Order');
  });

  // ── Success state ────────────────────────────────────────────

  it('shows order success panel when orderId is provided', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        orderId="order-uuid-001"
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    expect(screen.getByTestId('order-success')).toBeInTheDocument();
  });

  it('displays the orderId in the success panel', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        orderId="order-uuid-001"
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    expect(screen.getByTestId('order-id-display')).toHaveTextContent('order-uuid-001');
  });

  it('renders "Continue Shopping" button in success state', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        orderId="order-uuid-001"
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    expect(screen.getByTestId('continue-shopping-btn')).toBeInTheDocument();
  });

  it('calls onReset when "Continue Shopping" is clicked', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        orderId="order-uuid-001"
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    fireEvent.click(screen.getByTestId('continue-shopping-btn'));
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('does not show the checkout button when orderId is set', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        orderId="order-uuid-001"
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    expect(screen.queryByTestId('checkout-btn')).not.toBeInTheDocument();
  });

  // ── Error state ──────────────────────────────────────────────

  it('shows error message when error prop is provided', () => {
    render(
      <CheckoutButton
        cartIsEmpty={false}
        error="Cart is empty. Add items before placing an order."
        onCheckout={mockCheckout}
        onReset={mockReset}
      />
    );
    expect(screen.getByTestId('checkout-error')).toBeInTheDocument();
    expect(screen.getByTestId('checkout-error')).toHaveTextContent('Cart is empty');
  });

  it('does not show error banner when error is null', () => {
    render(
      <CheckoutButton cartIsEmpty={false} error={null} onCheckout={mockCheckout} onReset={mockReset} />
    );
    expect(screen.queryByTestId('checkout-error')).not.toBeInTheDocument();
  });
});
