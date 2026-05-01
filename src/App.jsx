import React, { useState, useEffect } from 'react';
import { useCart } from './hooks/useCart';
import CartSidebar from './components/CartSidebar/CartSidebar';
import ProductCard from './components/ProductCard/ProductCard';

// ── Seed product catalogue ─────────────────────────────────────
const PRODUCTS = [
  { productId: 'prod-001', name: 'Wireless Headphones',   price: 2499, category: 'Electronics',  emoji: '🎧', color: '#DBEAFE' },
  { productId: 'prod-002', name: 'Running Sneakers',       price: 3299, category: 'Footwear',     emoji: '👟', color: '#D1FAE5' },
  { productId: 'prod-003', name: 'Smart Watch',            price: 7999, category: 'Electronics',  emoji: '⌚', color: '#EDE9FE' },
  { productId: 'prod-004', name: 'Cotton T-Shirt',         price:  499, category: 'Clothing',     emoji: '👕', color: '#FEF3C7' },
  { productId: 'prod-005', name: 'Yoga Mat',               price: 1199, category: 'Fitness',      emoji: '🧘', color: '#FCE7F3' },
  { productId: 'prod-006', name: 'Stainless Bottle',       price:  699, category: 'Accessories',  emoji: '🍶', color: '#FFEDD5' },
  { productId: 'prod-007', name: 'Mechanical Keyboard',    price: 4599, category: 'Electronics',  emoji: '⌨️', color: '#E0F2FE' },
  { productId: 'prod-008', name: 'Backpack (30L)',         price: 1899, category: 'Accessories',  emoji: '🎒', color: '#F0FDF4' },
];

// ── Stable session ID (persisted in sessionStorage) ───────────
function getOrCreateSessionId() {
  const key = 'poc_cart_session';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `sess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

export default function App() {
  const [sessionId]       = useState(() => getOrCreateSessionId());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const {
    cart, loading, cartError, couponStatus, orderState,
    addItem, updateQty, removeItem,
    applyCoupon, clearCart, placeOrder, resetOrder,
  } = useCart(sessionId);

  const categories = ['All', ...new Set(PRODUCTS.map(p => p.category))];

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.items?.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navbar ──────────────────────────────────── */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍</span>
            <div>
              <h1 className="font-extrabold text-gray-900 text-lg leading-tight">ShopPOC</h1>
              <p className="text-xs text-gray-400 leading-tight">Cart & Order Management</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden sm:block">
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                         outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
          </div>

          {/* Cart badge */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-2xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold
                                  w-4 h-4 rounded-full flex items-center justify-center leading-none">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-xs text-gray-400">Session</p>
              <p className="font-mono text-xs text-gray-600">{sessionId.slice(-8)}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main layout ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* ── Left: product catalogue ─────────────────── */}
          <section className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-800 text-lg">Catalogue</h2>
              <span className="text-sm text-gray-400">{filteredProducts.length} products</span>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition
                    ${activeCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mobile search */}
            <div className="sm:hidden mb-4">
              <input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none"
              />
            </div>

            {/* Product grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-2">🔍</p>
                <p>No products match your search</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.productId}
                    product={product}
                    onAddToCart={addItem}
                    loading={loading}
                  />
                ))}
              </div>
            )}

            {/* POC info strip */}
            <div className="mt-8 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-600">
              <strong>POC #2</strong> — Coupon codes to try: &nbsp;
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">SAVE50</code> &nbsp;
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">SAVE100</code> &nbsp;
              <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">SAVE200</code>
              &nbsp;· Max 10 units per item · API: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono">localhost:3000</code>
            </div>
          </section>

          {/* ── Right: cart sidebar ─────────────────────── */}
          <aside className="w-full lg:w-96 lg:flex-shrink-0">
            <CartSidebar
              cart={cart}
              loading={loading}
              cartError={cartError}
              couponStatus={couponStatus}
              orderState={orderState}
              onUpdateQty={updateQty}
              onRemoveItem={removeItem}
              onApplyCoupon={applyCoupon}
              onClearCart={clearCart}
              onCheckout={placeOrder}
              onResetOrder={resetOrder}
            />
          </aside>

        </div>
      </main>

      {/* ── Loading overlay ─────────────────────────────── */}
      {loading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 shadow-lg
                        rounded-full px-4 py-2 flex items-center gap-2 text-sm text-gray-600 z-50">
          <svg className="spin w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83
                     M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
          Updating cart…
        </div>
      )}
    </div>
  );
}
