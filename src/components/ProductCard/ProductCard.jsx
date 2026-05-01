import React, { useState } from 'react';

/**
 * ProductCard — renders a single product with quantity selector + Add to Cart.
 * Used in the product catalogue grid in App.jsx.
 */
export default function ProductCard({ product, onAddToCart, loading }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    await onAddToCart({ ...product, quantity: qty });
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      data-testid={`product-card-${product.productId}`}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md
                 transition-all overflow-hidden group"
    >
      {/* Product image placeholder */}
      <div
        className="h-36 flex items-center justify-center text-4xl font-bold text-white"
        style={{ background: product.color || '#DBEAFE' }}
      >
        {product.emoji || product.name.charAt(0)}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 text-sm leading-tight" data-testid="product-name">
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
        <p className="font-bold text-blue-700 text-base mt-2" data-testid="product-price">
          ₹{product.price.toLocaleString('en-IN')}
        </p>

        <div className="flex items-center gap-2 mt-3">
          {/* Qty stepper */}
          <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-2 py-1">
            <button
              onClick={() => setQty(q => Math.max(1, q - 1))}
              className="w-5 h-5 text-gray-500 hover:text-gray-800 font-bold text-sm transition"
            >−</button>
            <span className="w-5 text-center text-sm font-semibold">{qty}</span>
            <button
              onClick={() => setQty(q => Math.min(10, q + 1))}
              className="w-5 h-5 text-gray-500 hover:text-gray-800 font-bold text-sm transition"
            >+</button>
          </div>

          {/* Add button */}
          <button
            data-testid={`add-to-cart-${product.productId}`}
            onClick={handleAdd}
            disabled={loading}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all
              ${added
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 disabled:opacity-50'
              }
            `}
          >
            {added ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
