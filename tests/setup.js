import '@testing-library/jest-dom';
import { server } from '../src/mocks/server';

// Start MSW before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset handlers after each test (allows per-test overrides)
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
