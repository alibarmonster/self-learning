/**
 * Vercel Routing Middleware: HTTP Basic Auth in front of the whole site.
 *
 * It runs on Vercel before the CDN cache, so no file — not index.html, not a
 * JS bundle, not a question bank — is sent until the browser presents the
 * right credentials. The credentials live in the project's Environment
 * Variables, never in the bundle:
 *
 *   BASIC_AUTH_USER       the username
 *   BASIC_AUTH_PASSWORD   the password
 *
 * If either is missing the site refuses every request rather than opening up,
 * so a forgotten variable can never publish the app by accident.
 *
 * Vite never sees this file; it is only picked up by Vercel.
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import { next } from '@vercel/functions';

export const config = {
  runtime: 'nodejs'
};

const REALM = 'Exam Prep';

/** Compares two strings in constant time, whatever their lengths. */
function same(a: string, b: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

function challenge(): Response {
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': `Basic realm="${REALM}", charset="UTF-8"`,
      'Cache-Control': 'no-store'
    }
  });
}

/** Reads `user:password` out of an `Authorization: Basic …` header. */
export function parseBasic(header: string | null): { user: string; password: string } | null {
  if (!header) return null;
  const [scheme, encoded] = header.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const colon = decoded.indexOf(':');
  if (colon < 0) return null;
  return { user: decoded.slice(0, colon), password: decoded.slice(colon + 1) };
}

export default function middleware(request: Request): Response {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !password) {
    return new Response('Site locked: set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in Vercel.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  const given = parseBasic(request.headers.get('authorization'));
  // Evaluate both comparisons so a wrong username takes as long as a wrong password.
  const userOk = same(given?.user ?? '', user);
  const passwordOk = same(given?.password ?? '', password);
  if (!given || !userOk || !passwordOk) return challenge();

  return next();
}
