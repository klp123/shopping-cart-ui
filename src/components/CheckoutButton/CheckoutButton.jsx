import React from 'react';

/**
 * CheckoutButton — FR14 / FR15
 *
 * Props:
 *   cartIsEmpty  — bool: disables button when true
 *   onCheckout() — fires on click
 *   loading      — bool: shows spinner during API call
 *   orderId      — string|null: shows confirmation when set
 *   error        — string|null: shows inline error
 *   onReset()    — clears order confirmation to allow re-ordering
 */
export default function CheckoutButton({
  cartIsEmpty,
  onCheckout,
  loading = false,
  orderId = null,
  error = null,
  onReset,
}) {
  // ── Order success state ───────────────────────────────────
  if (orderId) {
    return (
      <div
        data-testid="order-success"
        className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-center"
      >
        <div className="text-2xl mb-1">🎉</div>
        <p className="text-green-700 font-semibold text-sm">Order Placed Successfully!</p>
        <p className="text-green-600 text-xs mt-1">Order ID:</p>
        <p
          data-testid="order-id-display"
          className="font-mono text-xs text-green-800 bg-green-100 px-2 py-1 rounded mt-1 break-all"
        >
          {orderId}
        </p>
        <button
          data-testid="continue-shopping-btn"
          onClick={onReset}
          className="mt-3 w-full py-2 text-xs font-semibold text-green-700 border border-green-300
                     rounded-lg hover:bg-green-100 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4" data-testid="checkout-button-wrapper">
      {/* API error */}
      {error && (
        <div
          data-testid="checkout-error"
          className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-xs font-medium">✕ {error}</p>
        </div>
      )}

      <button
        data-testid="checkout-btn"
        onClick={onCheckout}
        disabled={cartIsEmpty || loading}
        className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all
          ${cartIsEmpty || loading
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-md hover:shadow-lg'
          }
        `}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="32" />
            </svg>
            Placing Order…
          </span>
        ) : cartIsEmpty ? (
          'Add items to checkout'
        ) : (
          '🛍 Place Order'
        )}
      </button>

      {cartIsEmpty && (
        <p data-testid="empty-cart-hint" className="text-center text-xs text-gray-400 mt-2">
          Your cart is empty
        </p>
      )}
    </div>
  );
}
