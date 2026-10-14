/**
 * Vercel Routing Middleware: a sign-in page in front of the whole site.
 *
 * It runs on Vercel before the CDN cache, so no app file — not index.html, not
 * a JS bundle, not a question bank — is sent until the visitor has signed in.
 * The credentials live in the project's Environment Variables, never in the
 * bundle:
 *
 *   BASIC_AUTH_USER       the username
 *   BASIC_AUTH_PASSWORD   the password
 *   SESSION_SECRET        optional; signs the session cookie instead of the
 *                         credentials, so a password change no longer signs
 *                         everyone out
 *
 * Signing in sets an HttpOnly, Secure session cookie for 30 days. /__logout
 * clears it. If the variables are missing the site refuses every request rather
 * than opening up, so a forgotten variable can never publish the app.
 *
 * Vite never sees this file; it is only picked up by Vercel.
 */
import { next } from '@vercel/functions';
import { LOGIN_SCRIPT, loginPage } from './server/auth/login-page';
import {
  FLAG_COOKIE,
  SESSION_COOKIE,
  SESSION_DAYS,
  checkLogin,
  credentialsFromEnv,
  issueToken,
  readCookie,
  safeNext,
  verifyToken
} from './server/auth/session';

export const config = {
  runtime: 'nodejs'
};

const LOGIN = '/__login';
const LOGOUT = '/__logout';
const MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

/** The app's CSP, repeated here because middleware responses skip vercel.json headers. */
const PAGE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-store',
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, nofollow'
};

const cookie = (name: string, value: string, maxAge: number, httpOnly = true) =>
  `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; Secure; SameSite=Lax${httpOnly ? '; HttpOnly' : ''}`;

function page(html: string, status = 200, extra: [string, string][] = []): Response {
  const headers = new Headers(PAGE_HEADERS);
  for (const [k, v] of extra) headers.append(k, v);
  return new Response(html, { status, headers });
}

function redirect(location: string, extra: [string, string][] = []): Response {
  const headers = new Headers({ Location: location, 'Cache-Control': 'no-store' });
  for (const [k, v] of extra) headers.append(k, v);
  return new Response(null, { status: 303, headers });
}

/** Files that reveal nothing and that browsers fetch on their own, sign-in page included. */
const PUBLIC = new Set(['/favicon.svg', '/robots.txt']);

/** Only an app route like #/ace/cheatsheet is carried through the sign-in. */
const appRoute = (hash: string) => (/^#\/[\w\-/]*$/.test(hash) ? hash : '');

/** A short pause on a failed sign-in makes guessing the password slow. */
const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function middleware(request: Request): Promise<Response> {
  const creds = credentialsFromEnv(process.env);
  if (!creds) {
    return new Response('Site locked: set BASIC_AUTH_USER and BASIC_AUTH_PASSWORD in Vercel.', {
      status: 503,
      headers: { 'Cache-Control': 'no-store' }
    });
  }

  const url = new URL(request.url);
  const signedIn = verifyToken(creds, readCookie(request.headers.get('cookie'), SESSION_COOKIE));

  if (PUBLIC.has(url.pathname)) return next();

  if (url.pathname === `${LOGIN}.js`) {
    return new Response(LOGIN_SCRIPT, {
      headers: { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  if (url.pathname === LOGOUT) {
    return redirect(`${LOGIN}?signed-out=1`, [
      ['Set-Cookie', cookie(SESSION_COOKIE, '', 0)],
      ['Set-Cookie', cookie(FLAG_COOKIE, '', 0, false)]
    ]);
  }

  if (url.pathname === LOGIN) {
    if (request.method === 'POST') {
      const form = await request.formData();
      const user = String(form.get('user') ?? '');
      const password = String(form.get('password') ?? '');
      const nextPath = safeNext(String(form.get('next') ?? '/'));
      const hash = String(form.get('hash') ?? '');
      if (checkLogin(creds, user, password)) {
        return redirect(nextPath + appRoute(hash), [
          ['Set-Cookie', cookie(SESSION_COOKIE, issueToken(creds), MAX_AGE)],
          ['Set-Cookie', cookie(FLAG_COOKIE, '1', MAX_AGE, false)]
        ]);
      }
      await pause(800);
      return page(
        loginPage({ next: nextPath, user, hash: appRoute(hash), error: 'That username and password do not match.' }),
        401
      );
    }
    if (signedIn) return redirect(safeNext(url.searchParams.get('next')));
    return page(
      loginPage({
        next: safeNext(url.searchParams.get('next')),
        notice: url.searchParams.has('signed-out') ? 'You are signed out.' : undefined
      })
    );
  }

  if (signedIn) return next();

  // A page load goes to the sign-in form; anything else (assets, fetches) is refused.
  const wantsPage = request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html');
  if (wantsPage) return redirect(`${LOGIN}?next=${encodeURIComponent(url.pathname + url.search)}`);
  return new Response('Sign in required.', { status: 401, headers: { 'Cache-Control': 'no-store' } });
}
