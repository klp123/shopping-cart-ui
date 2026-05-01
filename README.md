# ShopPOC — Shopping Cart UI

A React 18 + Vite proof-of-concept for a full-featured shopping cart and order management UI. Communicates with a REST API backend and ships with a complete MSW-based mock server for isolated testing.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [API Reference](#api-reference)
- [Components](#components)
- [Custom Hook — `useCart`](#custom-hook--usecart)
- [Testing](#testing)
- [Mock Server (MSW)](#mock-server-msw)
- [Code Coverage](#code-coverage)

---

## Features

| ID    | Feature |
|-------|---------|
| FR01  | Add product to cart |
| FR02  | Update item quantity |
| FR03  | Remove item from cart |
| FR04  | Fetch cart with computed subtotal and total |
| FR05  | Apply coupon code for discount |
| FR07  | Place order from current cart |
| FR08  | Fetch order detail by ID |
| FR14  | Disable checkout when cart is empty |
| FR15  | Show order confirmation with Order ID on success |

Additional UX features:
- Product catalogue with category filtering and search
- Persistent session ID via `sessionStorage`
- Cart item count badge in the navbar
- Inline error and loading states throughout
- Coupon success/error feedback
- "Continue Shopping" flow after order placement

---

## Tech Stack

| Category | Library / Tool |
|----------|---------------|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| HTTP Client | Axios 1.7 |
| Testing Framework | Vitest 1.6 |
| Component Testing | @testing-library/react 16 |
| User Events | @testing-library/user-event 14 |
| API Mocking | MSW (Mock Service Worker) 2.3 |
| DOM Assertions | @testing-library/jest-dom 6 |
| Test Environment | jsdom 24 |
| Coverage | @vitest/coverage-v8 |

---

## Project Structure

```
shopping-cart-ui-main/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── index.html
├── src/
│   ├── App.jsx                        # Root component — product catalogue + layout
│   ├── main.jsx                       # Vite entry point
│   ├── api/
│   │   ├── axiosInstance.js           # Shared Axios instance with base URL + interceptors
│   │   ├── cartApi.js                 # Cart CRUD API calls
│   │   └── orderApi.js                # Order creation and retrieval API calls
│   ├── components/
│   │   ├── CartSidebar/
│   │   │   ├── CartSidebar.jsx        # Cart panel — items, coupon, checkout
│   │   │   └── CartSidebar.test.jsx   # Unit tests for CartSidebar
│   │   ├── CheckoutButton/
│   │   │   ├── CheckoutButton.jsx     # Checkout button with loading/success/error states
│   │   │   └── CheckoutButton.test.jsx
│   │   ├── CouponInput/
│   │   │   ├── CouponInput.jsx        # Coupon code input with feedback
│   │   │   └── CouponInput.test.jsx
│   │   └── ProductCard/
│   │       └── ProductCard.jsx        # Product display card with "Add to Cart"
│   ├── hooks/
│   │   └── useCart.js                 # Central cart state hook
│   └── mocks/
│       ├── handlers.js                # MSW request handlers + shared mock data
│       └── server.js                  # MSW Node server setup
└── tests/
    └── setup.js                       # Vitest global test setup (starts MSW server)
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (Vite default).

> **Note:** The dev server proxies API calls to the backend defined in `VITE_API_URL`. Ensure your backend is running or configure the environment variable accordingly.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:3000/api/v1` | Base URL for all REST API calls |

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Start Vite development server with HMR |
| Build | `npm run build` | Production build output to `dist/` |
| Preview | `npm run preview` | Serve the production build locally |
| Test (once) | `npm test` | Run all tests once via Vitest |
| Test (watch) | `npm run test:watch` | Run tests in watch mode |
| Coverage | `npm run test:coverage` | Run tests and generate coverage report |
| Test UI | `npm run test:ui` | Launch Vitest interactive browser UI |

---

## API Reference

All endpoints are prefixed with `VITE_API_URL` (default: `http://localhost:3000/api/v1`).

### Cart Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/cart/:sessionId` | Fetch cart with computed subtotal/discount/total |
| `POST` | `/cart/:sessionId/items` | Add a product to the cart |
| `PUT` | `/cart/:sessionId/items/:itemId` | Update item quantity |
| `DELETE` | `/cart/:sessionId/items/:itemId` | Remove a specific item |
| `POST` | `/cart/:sessionId/coupon` | Apply a coupon code |
| `DELETE` | `/cart/:sessionId` | Clear all items from the cart |

#### Cart Object Shape

```json
{
  "sessionId": "sess-abc123",
  "items": [
    {
      "itemId": "item-uuid-001",
      "productId": "prod-001",
      "name": "Wireless Headphones",
      "price": 2499,
      "quantity": 2
    }
  ],
  "coupon": "SAVE50",
  "discount": 50,
  "subtotal": 4998,
  "total": 4948
}
```

### Order Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Place an order from the current cart |
| `GET` | `/orders/:orderId` | Fetch order details by ID |

#### Create Order Request Body

```json
{
  "sessionId": "sess-abc123",
  "userId": "guest-user"
}
```

---

## Components

### `App`

Root component. Manages the product catalogue, search, category filtering, and session ID. Renders `ProductCard` components and the `CartSidebar`.

**Product Catalogue** (hardcoded seed data):

| Product | Category | Price (₹) |
|---------|----------|-----------|
| Wireless Headphones | Electronics | 2,499 |
| Running Sneakers | Footwear | 3,299 |
| Smart Watch | Electronics | 7,999 |
| Cotton T-Shirt | Clothing | 499 |
| Yoga Mat | Fitness | 1,199 |
| Stainless Bottle | Accessories | 699 |
| Mechanical Keyboard | Electronics | 4,599 |
| Backpack (30L) | Accessories | 1,899 |

---

### `CartSidebar`

Sliding cart panel. Displays all cart items, quantity controls, coupon input, order totals, and the checkout button.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `cart` | object | Cart object (items, subtotal, discount, total, coupon) |
| `loading` | boolean | Shows loading spinner |
| `cartError` | string\|null | Displays error banner |
| `couponStatus` | object\|null | `{ message, type }` — type is `'success'` or `'error'` |
| `orderState` | object | `{ orderId, loading, error }` |
| `onUpdateQty` | function | Called with `(itemId, quantity)` |
| `onRemoveItem` | function | Called with `(itemId)` |
| `onApplyCoupon` | function | Called with `(code)` |
| `onClearCart` | function | Clears all items |
| `onCheckout` | function | Triggers order placement |
| `onResetOrder` | function | Resets order confirmation state |

---

### `CheckoutButton`

Handles the checkout CTA with three states: default, loading, and order confirmed.

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| `cartIsEmpty` | boolean | Disables the button when `true` |
| `onCheckout` | function | Fires on button click |
| `loading` | boolean | Shows spinner during API call |
| `orderId` | string\|null | Displays order confirmation when set |
| `error` | string\|null | Shows inline error message |
| `onReset` | function | Clears confirmation to allow re-ordering |

---

### `CouponInput`

Controlled input for entering and applying coupon codes. Shows success/error feedback.

---
