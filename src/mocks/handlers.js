import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000/api/v1';

// ── Shared mock data ─────────────────────────────────────────
export const MOCK_SESSION = 'test-session-123';
export const MOCK_ITEM = {
  itemId: 'item-uuid-001',
  productId: 'prod-001',
  name: 'Wireless Headphones',
  price: 2499,
  quantity: 2,
};

export const MOCK_CART = {
  sessionId: MOCK_SESSION,
  items:    [MOCK_ITEM],
  coupon:   null,
  discount: 0,
  subtotal: 4998,
  total:    4998,
};

export const MOCK_CART_EMPTY = {
  sessionId: MOCK_SESSION,
  items:    [],
  coupon:   null,
  discount: 0,
  subtotal: 0,
  total:    0,
};

export const MOCK_CART_COUPON = {
  ...MOCK_CART,
  coupon:   'SAVE50',
  discount: 50,
  total:    4948,
};

export const MOCK_ORDER = {
  orderId:   'order-uuid-001',
  userId:    'guest-user',
  sessionId: MOCK_SESSION,
  items:     [{ ...MOCK_ITEM, lineTotal: 4998 }],
  subtotal:  4998,
  discount:  0,
  total:     4998,
  status:    'PLACED',
  createdAt: new Date().toISOString(),
};

// ── MSW request handlers ─────────────────────────────────────
export const handlers = [
  // GET /cart/:sessionId
  http.get(`${BASE}/cart/:sessionId`, () =>
    HttpResponse.json(MOCK_CART)
  ),

  // POST /cart/:sessionId/items
  http.post(`${BASE}/cart/:sessionId/items`, () =>
    HttpResponse.json(MOCK_CART, { status: 201 })
  ),

  // PUT /cart/:sessionId/items/:itemId
  http.put(`${BASE}/cart/:sessionId/items/:itemId`, () =>
    HttpResponse.json(MOCK_CART)
  ),

  // DELETE /cart/:sessionId/items/:itemId
  http.delete(`${BASE}/cart/:sessionId/items/:itemId`, () =>
    HttpResponse.json(MOCK_CART_EMPTY)
  ),

  // POST /cart/:sessionId/coupon — success
  http.post(`${BASE}/cart/:sessionId/coupon`, async ({ request }) => {
    const body = await request.json();
    if (body.code === 'INVALID') {
      return HttpResponse.json({ error: 'Invalid or unknown coupon code' }, { status: 400 });
    }
    if (body.code === 'DUPLICATE') {
      return HttpResponse.json({ error: 'Coupon already applied' }, { status: 400 });
    }
    return HttpResponse.json(MOCK_CART_COUPON);
  }),

  // DELETE /cart/:sessionId (clear)
  http.delete(`${BASE}/cart/:sessionId`, () =>
    HttpResponse.json(MOCK_CART_EMPTY)
  ),

  // POST /orders
  http.post(`${BASE}/orders`, async ({ request }) => {
    const body = await request.json();
    if (body.sessionId === 'empty-session') {
      return HttpResponse.json({ error: 'Cart is empty. Add items before placing an order.' }, { status: 422 });
    }
    return HttpResponse.json(MOCK_ORDER, { status: 201 });
  }),

  // GET /orders/:orderId
  http.get(`${BASE}/orders/:orderId`, ({ params }) => {
    if (params.orderId === 'not-found') {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    return HttpResponse.json(MOCK_ORDER);
  }),
];
