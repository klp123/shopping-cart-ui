import React, { useState, useEffect } from 'react';
import { useCart } from './hooks/useCart';
import CartSidebar from './components/CartSidebar/CartSidebar';
import ProductCard from './components/ProductCard/ProductCard';
import LoginPage from './components/LoginPage/LoginPage';
import { getProducts } from './api/productApi';

// ── UI-only enrichment (emoji / colour) ───────────────────────
// category now comes directly from the API
const PRODUCT_UI = {
  'Wireless Headphones':    { emoji: '🎧', color: '#DBEAFE' },
  'Running Sneakers':       { emoji: '👟', color: '#D1FAE5' },
  'Smart Watch':            { emoji: '⌚', color: '#EDE9FE' },
  'Cotton T-Shirt':         { emoji: '👕', color: '#FEF3C7' },
  'Yoga Mat':               { emoji: '🧘', color: '#FCE7F3' },
  'Stainless Steel Bottle': { emoji: '🍶', color: '#FFEDD5' },
  'Mechanical Keyboard':    { emoji: '⌨️', color: '#E0F2FE' },
  'Backpack (30L)':         { emoji: '🎒', color: '#F0FDF4' },
};

function enrichProduct(p) {
  const ui = PRODUCT_UI[p.name] ?? { emoji: '📦', color: '#F3F4F6' };
  return { productId: `prod-${String(p.id).padStart(3, '0')}`, ...p, ...ui };
}

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

const PAGE_SIZE = 10;

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('poc_token'));

  function handleLogin(t) { setToken(t); }
  function handleLogout() {
    localStorage.removeItem('poc_token');
    setToken(null);
  }

  if (!token) return <LoginPage onLogin={handleLogin} />;

  return <ShopApp onLogout={handleLogout} />;
}

function ShopApp({ onLogout }) {
  const [sessionId]       = useState(() => getOrCreateSessionId());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [allCategories, setAllCategories] = useState(['All']);
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const {
    cart, loading, cartError, couponStatus, orderState,
    addItem, updateQty, removeItem,
    applyCoupon, clearCart, placeOrder, resetOrder,
  } = useCart(sessionId);

  useEffect(() => {
    setProductsLoading(true);
    setProductsError(null);
    const params = { limit: PAGE_SIZE, skip: page * PAGE_SIZE };
    if (activeCategory !== 'All') params.category = activeCategory;
    if (minPrice !== '')          params.minPrice  = minPrice;
    if (maxPrice !== '')          params.maxPrice  = maxPrice;
    getProducts(params)
      .then(data => {
        const { count = 0, products: raw = [] } = (data && typeof data === 'object' && !Array.isArray(data)) ? data : { products: data };
        setTotalCount(count);
        const enriched = (Array.isArray(raw) ? raw : []).map(enrichProduct);
        setProducts(enriched);
        // Rebuild category list only when no filter is active so pills stay stable
        if (activeCategory === 'All' && minPrice === '' && maxPrice === '' && page === 0) {
          setAllCategories(['All', ...new Set(enriched.map(p => p.category))]);
        }
      })
      .catch(err => setProductsError(err.message ?? 'Failed to load products'))
      .finally(() => setProductsLoading(false));
  }, [activeCategory, minPrice, maxPrice, page]);

  // Search stays client-side (backend has no name search)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <button
              onClick={onLogout}
              className="ml-2 px-3 py-1.5 text-xs font-semibold text-gray-500 border border-gray-200
                         rounded-lg hover:border-red-300 hover:text-red-500 transition"
            >
              Sign out
            </button>
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
            <div className="flex gap-2 flex-wrap mb-3">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setPage(0); }}
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

            {/* Price filter */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs text-gray-500 font-medium">Price:</span>
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400"
              />
              <span className="text-xs text-gray-400">—</span>
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-blue-400"
              />
              {(minPrice !== '' || maxPrice !== '') && (
                <button
                  onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(0); }}
                  className="text-xs text-gray-400 hover:text-red-400 transition"
                >
                  ✕ clear
                </button>
              )}
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
            {productsLoading ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-2 animate-spin">⏳</p>
                <p>Loading products…</p>
              </div>
            ) : productsError ? (
              <div className="text-center py-16 text-red-400">
                <p className="text-3xl mb-2">⚠️</p>
                <p>{productsError}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
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

            {/* Pagination controls */}
            {!productsLoading && !productsError && totalCount > 0 && (() => {
              const totalPages = Math.ceil(totalCount / PAGE_SIZE);
              // Build page number list with ellipsis: always show first, last, current ±1
              const getPageNums = () => {
                const pages = new Set([0, totalPages - 1, page, page - 1, page + 1].filter(n => n >= 0 && n < totalPages));
                const sorted = [...pages].sort((a, b) => a - b);
                const result = [];
                sorted.forEach((n, i) => {
                  if (i > 0 && n - sorted[i - 1] > 1) result.push('…');
                  result.push(n);
                });
                return result;
              };
              return (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-400">{totalCount} products total</span>
                    <span className="text-xs text-gray-400">Page {page + 1} of {totalPages}</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 flex-wrap">
                    {/* Prev */}
                    <button
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 hover:border-blue-300 hover:text-blue-600 transition"
                    >
                      ← Prev
                    </button>

                    {/* Page number buttons */}
                    {getPageNums().map((n, i) =>
                      n === '…' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-xs text-gray-400">…</span>
                      ) : (
                        <button
                          key={n}
                          onClick={() => setPage(n)}
                          className={`w-8 h-8 text-xs font-semibold rounded-lg border transition
                            ${page === n
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                            }`}
                        >
                          {n + 1}
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page >= totalPages - 1}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200
                                 disabled:opacity-40 disabled:cursor-not-allowed
                                 hover:border-blue-300 hover:text-blue-600 transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            })()}

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
