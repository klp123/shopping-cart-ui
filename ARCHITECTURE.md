# Shopping Cart UI — Architecture & Implementation Guide

## Project Overview

A React 18 + Vite single-page application that implements a shopping cart with product browsing, coupon discounts, and order placement. The backend is a Node.js/Express OData server deployed on AWS ECS. The frontend is deployed to AWS S3 + CloudFront.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 |
| Build Tool | Vite 5 |
| State Management | Redux Toolkit + React-Redux |
| HTTP Client | Axios (shared instance with interceptors) |
| API Mocking (tests) | MSW (Mock Service Worker) v2 |
| Unit Testing | Vitest + React Testing Library |
| Containerisation | Docker |
| CI/CD | GitHub Actions |
| Cloud | AWS ECS (API) · AWS ECR (container registry) · AWS S3 + CloudFront (UI) |

---

## Folder Structure

```
src/
├── api/                  # All HTTP calls (cartApi, orderApi, productApi, authApi)
│   └── axiosInstance.js  # Single Axios instance with base URL + auth interceptor
├── components/
│   ├── CartSidebar/      # Cart panel — items, totals, coupon, checkout
│   ├── CheckoutButton/   # Place order button + success/error states
│   ├── CouponInput/      # Coupon code input with validation feedback
│   ├── ProductCard/      # Single product tile with Add to Cart
│   └── LoginPage/        # JWT login form
├── hooks/
│   └── useCart.js        # Custom hook — bridges Redux store ↔ components
├── store/
│   ├── index.js          # configureStore — assembles all reducers
│   └── cartSlice.js      # All cart state: reducers + async thunks
├── mocks/
│   ├── handlers.js       # MSW request handlers (mock API responses)
│   └── server.js         # MSW Node server (used in tests)
└── App.jsx               # Root component — auth gate + ShopApp layout
```

---

## State Management — Redux Toolkit

### Why Redux Toolkit?

Redux Toolkit (RTK) is the official, opinionated way to write Redux. It eliminates boilerplate by providing:
- `createSlice` — combines actions + reducers in one place using Immer for immutable updates
- `createAsyncThunk` — standard pattern for async API calls with automatic `pending / fulfilled / rejected` action lifecycle

### The Store (`src/store/index.js`)

```js
configureStore({
  reducer: {
    cart: cartReducer,  // one slice for now; more can be added (auth, products)
  }
})
```

The store is created once and provided to the whole React tree via `<Provider store={store}>` in `main.jsx`.

### The Cart Slice (`src/store/cartSlice.js`)

This is the heart of state management. It owns everything cart-related:

**State shape:**
```js
{
  cart:         { items, subtotal, discount, total, coupon },
  loading:      false,         // global cart loading flag
  cartError:    null,          // API errors (add/remove/update/clear)
  couponStatus: { message, type },  // 'success' | 'error' — separate from cartError
  orderState:   { orderId, loading, error }
}
```

**Why `couponStatus` is separate from `cartError`:**  
Coupon failures are user-facing feedback ("Invalid code"), not system errors. Keeping them separate means a coupon failure doesn't trigger the same red error banner as a network failure.

**Async Thunks (one per API operation):**

| Thunk | API call | On success | On failure |
|---|---|---|---|
| `fetchCart` | `GET /cart/:sessionId` | Sets `cart` | Sets `cartError` |
| `addItem` | `POST /cart/:sessionId/items` | Sets `cart` | Sets `cartError` |
| `updateQty` | `PUT /cart/:sessionId/items/:id` | Sets `cart` | Sets `cartError` |
| `removeItem` | `DELETE /cart/:sessionId/items/:id` | Sets `cart` | Sets `cartError` |
| `applyCoupon` | `POST /cart/:sessionId/coupon` | Sets `cart` + `couponStatus.success` | Sets `couponStatus.error` |
| `clearCart` | `DELETE /cart/:sessionId` | Resets `cart` | Sets `cartError` |
| `placeOrder` | `POST /orders` | Sets `orderId`, clears `cart` | Sets `orderState.error` |

**Synchronous reducer:**
- `resetOrder` — called when user clicks "Continue Shopping" to dismiss the success panel

### The `useCart` Hook (`src/hooks/useCart.js`)

Acts as the bridge between the Redux store and any component that needs cart functionality. Components don't import Redux directly — they just call `useCart(sessionId)`.

```js
// Inside any component:
const { cart, loading, addItem, placeOrder } = useCart(sessionId);
```

Internally it uses:
- `useSelector` — reads state slices from the store
- `useDispatch` — sends thunk actions to the store
- `useEffect` — auto-fetches the cart when `sessionId` changes

**Key design decision:** The hook's return interface is identical to the old `useState` version, so `App.jsx`, `CartSidebar`, `CheckoutButton`, and all component tests required zero changes when Redux was introduced.

---

## Data Flow (end-to-end)

```
User clicks "Add to Cart"
        │
        ▼
  ProductCard.jsx calls addItem(product)
        │
        ▼
  useCart.js dispatches addItem thunk to Redux store
        │
        ▼
  cartSlice sets loading=true (pending)
        │
        ▼
  cartApi.addItem() sends POST /cart/:sessionId/items via Axios
        │
        ▼
  Response arrives → cartSlice sets cart=<new data>, loading=false (fulfilled)
        │
        ▼
  useSelector in useCart re-renders any subscribed component
        │
        ▼
  CartSidebar shows updated items and totals
```

---

## HTTP Layer — Axios Instance (`src/api/axiosInstance.js`)

A single shared Axios instance is created with:
- **Base URL** from `VITE_API_URL` environment variable (falls back to localhost)
- **Request interceptor** that automatically attaches `Authorization: Bearer <token>` from `localStorage` to every request
- **10 second timeout** on all calls

All API files (`cartApi`, `orderApi`, `productApi`, `authApi`) import this one instance, so auth and base URL are never duplicated.

---

## Authentication Flow

1. App loads → checks `localStorage` for `poc_token`
2. If no token → renders `<LoginPage>` which calls `POST /auth/login`
3. Token is stored in `localStorage` and attached to all subsequent requests by the Axios interceptor
4. Logout removes the token and re-renders the login page

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

**Component tests** (`CheckoutButton.test.jsx`, `CartSidebar.test.jsx`, `CouponInput.test.jsx`):
- Render the component with controlled props
- Assert DOM output using `data-testid` attributes
- Simulate user events with `fireEvent` / `userEvent`
- No Redux store needed — components receive state as props

**Redux slice tests** (`cartSlice.test.js`):
- `vi.mock('../api/cartApi')` and `vi.mock('../api/orderApi')` replace real API calls with mocks
- A real Redux store is created with `configureStore` for each test (`makeStore()`)
- Thunks are dispatched against the real store and state is asserted via `store.getState()`
- Covers: initial state, every thunk's pending/fulfilled/rejected transitions, correct API arguments, the synchronous `resetOrder` reducer

**Why mock the API instead of using MSW here:**  
MSW intercepts at the network level (HTTP). For slice tests the goal is to verify the Redux state transitions in isolation — whether the API call succeeded or failed is a separate concern. Mocking at the module level is faster and more precise for unit tests.

### Integration Tests (MSW)
- `tests/setup.js` starts the MSW Node server before all test suites
- MSW handlers in `src/mocks/handlers.js` intercept real HTTP calls and return controlled JSON responses
- Used for route-level tests (`cart.routes.test.js`, `order.routes.test.js`) where the full request/response cycle matters

---

## CI/CD Pipeline (GitHub Actions)

### API Pipeline (`deploy.yml` — ECS)

```
Push to main
    │
    ├── Configure AWS credentials (IAM user: ecr-demo-user)
    ├── Login to Amazon ECR
    ├── docker build + docker push (tagged with git SHA)
    ├── Download current ECS task definition
    ├── Strip read-only fields (jq del — including enableFaultInjection)
    ├── Render new task definition with updated image URI
    └── Deploy to ECS service (waits for stability)
```

**Key fix applied:** The `enableFaultInjection` field returned by `DescribeTaskDefinition` must be removed before re-registering, otherwise ECS rejects it with "Unexpected key".

### UI Pipeline (`deploy.yml` — S3/CloudFront)

```
Push to main
    │
    ├── Setup Node 20 (with npm cache scoped to shopping-cart-ui/)
    ├── npm ci (install dependencies)
    ├── npm run build (vite build → dist/)
    ├── aws s3 sync dist/ → S3 bucket
    │     ├── Static assets: cache-control max-age=1year (immutable)
    │     └── index.html: no-cache (always fresh)
    └── CloudFront invalidation /* (forces CDN to serve new index.html)
```

**Why split caching:** JS/CSS filenames include a content hash (e.g. `main.a3f9c2.js`), so they can be cached forever. `index.html` has no hash so it must never be cached — otherwise users won't pick up new deployments.

---

## Interview Q&A — Quick Reference

**Q: Why Redux Toolkit over plain Redux or Context?**  
RTK removes boilerplate (no action creators, no switch statements), has Immer built in for safe mutations, and `createAsyncThunk` gives a standard loading/error pattern. Context is fine for small trees but causes unnecessary re-renders at scale — Redux only re-renders components whose selected state slice changed.

**Q: What is a thunk?**  
A function that returns another function. Redux Toolkit's `createAsyncThunk` wraps an async function and automatically dispatches `pending`, `fulfilled`, or `rejected` actions depending on the promise outcome.

**Q: Why keep `useCart` as a hook instead of using `useSelector` directly in components?**  
Single responsibility — components stay dumb (UI only). If the state source ever changes again (e.g. server-sent events), only the hook changes, not every component.

**Q: How does MSW work in tests?**  
MSW intercepts `fetch`/XHR at the Service Worker level in the browser, or at the Node `http` module level in tests. It lets you write tests against real Axios calls without a running server.

**Q: Why is `index.html` uploaded separately with no-cache in the S3 sync?**  
`index.html` is the entry point. If it's cached by CloudFront or the browser, users will keep loading old JS bundles even after a new deploy. All other assets are content-hashed so they're safe to cache forever.

**Q: What is ECR?**  
Amazon Elastic Container Registry — a private Docker image registry. The GitHub Actions pipeline builds the image, pushes it to ECR, then tells ECS to run the new image.

**Q: What is ECS?**  
Amazon Elastic Container Service — runs Docker containers without managing servers. A Task Definition describes the container spec (image, CPU, memory). A Service keeps N copies of the task running and does rolling deployments.
