import React from 'react';
import CouponInput from '../CouponInput/CouponInput';
import CheckoutButton from '../CheckoutButton/CheckoutButton';

/**
 * CartSidebar — FR11, FR12, FR13, FR14, FR15
 *
 * Renders the full cart panel: item list, qty controls, remove buttons,
 * subtotal/discount/total summary, coupon input, and checkout button.
 */
export default function CartSidebar({
  cart,
  loading,
  cartError,
  couponStatus,
  orderState,
  onUpdateQty,
  onRemoveItem,
  onApplyCoupon,
  onClearCart,
  onCheckout,
  onResetOrder,
}) {
  const isEmpty = !cart.items || cart.items.length === 0;
  const hasDiscount = cart.discount > 0;

  return (
    <aside
      data-testid="cart-sidebar"
      className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full max-h-screen sticky top-4"
    >
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">🛒</span>
          <h2 className="font-bold text-gray-800 text-base">Your Cart</h2>
          {!isEmpty && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cart.items.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </div>
        {!isEmpty && (
          <button
            data-testid="clear-cart-btn"
            onClick={onClearCart}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition disabled:opacity-40"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── API error banner ────────────────────────────── */}
      {cartError && (
        <div
          data-testid="cart-error-banner"
          className="mx-4 mt-3 px-3 py-2 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-600 text-xs font-medium">✕ {cartError}</p>
        </div>
      )}

      {/* ── Items list ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {isEmpty ? (
          <div
            data-testid="empty-cart-state"
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <span className="text-5xl mb-3 opacity-30">🛍</span>
            <p className="text-gray-400 font-medium text-sm">Your cart is empty</p>
            <p className="text-gray-300 text-xs mt-1">Add products from the catalogue</p>
          </div>
        ) : (
          cart.items.map((item) => (
            <div
              key={item.itemId}
              data-testid={`cart-item-${item.itemId}`}
              className="cart-item-enter flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
            >
              {/* Product colour dot (visual indicator) */}
              <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-lg"
                style={{ background: stringToColor(item.productId) }}
              >
                {item.name.charAt(0)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm truncate" data-testid="item-name">
                  {item.name}
                </p>
                <p className="text-gray-500 text-xs mt-0.5" data-testid="item-price">
                  ₹{item.price.toLocaleString('en-IN')} each
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    data-testid={`qty-dec-${item.itemId}`}
                    onClick={() => onUpdateQty(item.itemId, item.quantity - 1)}
                    disabled={loading || item.quantity <= 1}
                    className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-600
                               flex items-center justify-center text-xs font-bold
                               hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    −
                  </button>
                  <span
                    data-testid={`qty-value-${item.itemId}`}
                    className="text-sm font-bold text-gray-800 w-5 text-center"
                  >
                    {item.quantity}
                  </span>
                  <button
                    data-testid={`qty-inc-${item.itemId}`}
                    onClick={() => onUpdateQty(item.itemId, item.quantity + 1)}
                    disabled={loading || item.quantity >= 10}
                    className="w-6 h-6 rounded-full bg-white border border-gray-300 text-gray-600
                               flex items-center justify-center text-xs font-bold
                               hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  >
                    +
                  </button>
                  <span className="ml-auto font-bold text-gray-700 text-sm" data-testid="item-line-total">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Remove button */}
              <button
                data-testid={`remove-item-${item.itemId}`}
                onClick={() => onRemoveItem(item.itemId)}
                disabled={loading}
                className="text-gray-300 hover:text-red-500 transition mt-0.5 disabled:opacity-30 flex-shrink-0"
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Footer: totals + coupon + checkout ──────────── */}
      <div className="px-4 pb-5 border-t border-gray-100 pt-4 space-y-1">
        {/* Subtotal */}
        <div className="flex justify-between text-sm text-gray-600" data-testid="subtotal-row">
          <span>Subtotal</span>
          <span>₹{cart.subtotal?.toLocaleString('en-IN') ?? 0}</span>
        </div>

        {/* Discount row */}
        {hasDiscount && (
          <div className="flex justify-between text-sm text-green-600 font-medium" data-testid="discount-row">
            <span>Discount ({cart.coupon})</span>
            <span>−₹{cart.discount?.toLocaleString('en-IN')}</span>
          </div>
        )}

        {/* Total */}
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100" data-testid="total-row">
          <span>Total</span>
          <span className="text-blue-700">₹{cart.total?.toLocaleString('en-IN') ?? 0}</span>
        </div>

        {/* Coupon input — hide once order is placed */}
        {!orderState.orderId && (
          <CouponInput
            onApply={onApplyCoupon}
            status={couponStatus}
            disabled={loading}
            applied={!!cart.coupon}
          />
        )}

        {/* Checkout button */}
        <CheckoutButton
          cartIsEmpty={isEmpty}
          onCheckout={onCheckout}
          loading={orderState.loading}
          orderId={orderState.orderId}
          error={orderState.error}
          onReset={onResetOrder}
        />
      </div>
    </aside>
  );
}

/** Deterministic pastel colour from a string — for product avatars */
function stringToColor(str) {
  const palette = [
    '#DBEAFE','#D1FAE5','#FEF3C7','#FCE7F3',
    '#EDE9FE','#FFEDD5','#E0F2FE','#F0FDF4',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}
