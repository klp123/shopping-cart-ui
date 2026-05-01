import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/** MSW Node server — used by Vitest */
export const server = setupServer(...handlers);
