/**
 * Shared plumbing for the JSON API: responses, the same-origin check for
 * writes, and resolving the signed-in account from the session cookie. Every
 * handler is a plain `(Request) => Promise<Response>`, so the same code runs
 * as a Vercel Function and inside the Vite dev server.
 */
import type { Client } from '@libsql/client';
import { getDb } from '../db/client.js';
import { accountById, type Account } from '../auth/accounts.js';
import { SESSION_COOKIE, credentialsFromEnv, readCookie, verifyToken } from '../auth/session.js';

export const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });

export const fail = (status: number, error: string) => json({ error }, status);

/**
 * Writes must come from the app's own pages. Cookies are SameSite=Lax and
 * bodies are JSON, which already blocks cross-site forms; this closes the rest.
 */
export function sameOrigin(request: Request): boolean {
  if (request.method === 'GET' || request.method === 'HEAD') return true;
  const origin = request.headers.get('origin');
  if (origin) return origin === new URL(request.url).origin;
  return request.headers.get('sec-fetch-site') === 'same-origin';
}

export type Signed =
  | { ok: true; db: Client; account: Account }
  | { ok: false; response: Response };

/** The account behind the request's session, with the database to use — or the error to send. */
export async function signedIn(request: Request): Promise<Signed> {
  const creds = credentialsFromEnv(process.env);
  if (!creds) return { ok: false, response: fail(503, 'not-configured') };
  if (!sameOrigin(request)) return { ok: false, response: fail(403, 'cross-origin') };
  const session = verifyToken(creds, readCookie(request.headers.get('cookie'), SESSION_COOKIE));
  if (!session) return { ok: false, response: fail(401, 'signed-out') };
  const db = await getDb();
  if (!db) return { ok: false, response: json({ user: null, sync: false, reason: 'no-database' }) };
  // A session from before the database existed carries no user id: sign in again.
  if (session.uid === null) return { ok: false, response: fail(401, 'signed-out') };
  const account = await accountById(db, session.uid);
  if (!account) return { ok: false, response: fail(401, 'signed-out') };
  return { ok: true, db, account };
}

export async function body<T>(request: Request, limit = 4_000_000): Promise<T | null> {
  const text = await request.text();
  if (text.length > limit) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
