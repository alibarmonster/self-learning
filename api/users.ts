/** Vercel Function: /api/users. The logic lives in server/api/handlers.ts. */
import { createUser, deleteUser, listUsers, updateUser } from '../server/api/handlers.js';

export const GET = listUsers;
export const POST = createUser;
export const PATCH = updateUser;
export const DELETE = deleteUser;
