/** Vercel Function: GET and PUT /api/state. The logic lives in server/api/handlers.ts. */
import { getState, putState } from '../server/api/handlers.js';

export const GET = getState;
export const PUT = putState;
