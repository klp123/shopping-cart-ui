import React, { useState } from 'react';

/**
 * CouponInput — FR05 / FR13
 * Allows the user to enter a coupon code and shows success or error feedback.
 *
 * Props:
 *   onApply(code)  — callback that fires with the entered code
 *   status         — { message: string, type: 'success'|'error'|'' }
 *   disabled       — bool (loading state from parent)
 *   applied        — bool (coupon already applied — locks input)
 */
export default function CouponInput({ onApply, status = {}, disabled = false, applied = false }) {
  const [code, setCode] = useState('');

  const handleApply = () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    onApply(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleApply();
  };

  return (
    <div className="mt-4" data-testid="coupon-input-wrapper">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
        Coupon Code
      </label>

      <div className="flex gap-2">
        <input
          type="text"
          data-testid="coupon-input"
          value={applied ? (status.message ? '' : code) : code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={handleKeyDown}
          placeholder={applied ? 'Coupon applied ✓' : 'e.g. SAVE50'}
          disabled={disabled || applied}
          className={`flex-1 px-3 py-2 text-sm border rounded-lg outline-none transition
            ${applied
              ? 'bg-green-50 border-green-300 text-green-700 cursor-not-allowed'
              : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        />
        <button
          data-testid="coupon-apply-btn"
          onClick={handleApply}
          disabled={disabled || applied || !code.trim()}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition whitespace-nowrap
            ${applied || !code.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          Apply
        </button>
      </div>

      {/* Feedback message */}
      {status.message && (
        <p
          data-testid="coupon-feedback"
          className={`mt-1.5 text-xs font-medium
            ${status.type === 'success' ? 'text-green-600' : 'text-red-500'}
          `}
        >
          {status.type === 'success' ? '✓ ' : '✕ '}
          {status.message}
        </p>
      )}

      {!applied && !status.message && (
        <p className="mt-1 text-xs text-gray-400">Try: SAVE50 · SAVE100 · SAVE200</p>
      )}
    </div>
  );
}
