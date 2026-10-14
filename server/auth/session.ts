/**
 * Signed session cookies for the login page. A token is `<expiry>.<signature>`,
 * where the signature is an HMAC over the expiry. The key is derived from the
 * configured username and password (or SESSION_SECRET when it is set), so
 * changing the password signs everyone out.
 */
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'ep_session';
/** Not secret: tells the app it is behind the login so it can show "Sign out". */
export const FLAG_COOKIE = 'ep_signed_in';
export const SESSION_DAYS = 30;

export interface Credentials {
  user: string;
  password: string;
  secret?: string;
}

/** Reads the credentials from the environment; null means the site is not configured. */
export function credentialsFromEnv(env: Record<string, string | undefined>): Credentials | null {
  const user = env.BASIC_AUTH_USER;
  const password = env.BASIC_AUTH_PASSWORD;
  if (!user || !password) return null;
  return { user, password, secret: env.SESSION_SECRET || undefined };
}

/** Compares two strings in constant time, whatever their lengths. */
export function same(a: string, b: string): boolean {
  const digest = (s: string) => createHash('sha256').update(s).digest();
  return timingSafeEqual(digest(a), digest(b));
}

/** Checks a username and password, evaluating both so neither leaks through timing. */
export function checkLogin(creds: Credentials, user: string, password: string): boolean {
  const userOk = same(user, creds.user);
  const passwordOk = same(password, creds.password);
  return userOk && passwordOk;
}

function key(creds: Credentials): Buffer {
  return createHash('sha256')
    .update(creds.secret ?? `exam-prep-session\u0000${creds.user}\u0000${creds.password}`)
    .digest();
}

function sign(creds: Credentials, payload: string): string {
  return createHmac('sha256', key(creds)).update(payload).digest('base64url');
}

export function issueToken(creds: Credentials, now = Date.now()): string {
  const expires = String(now + SESSION_DAYS * 24 * 60 * 60 * 1000);
  return `${expires}.${sign(creds, expires)}`;
}

export function verifyToken(creds: Credentials, token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const dot = token.indexOf('.');
  if (dot <= 0) return false;
  const expires = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  if (!/^\d+$/.test(expires) || Number(expires) < now) return false;
  return same(signature, sign(creds, expires));
}

export function readCookie(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    if (part.slice(0, eq).trim() === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return undefined;
}

/** Only same-site paths are allowed as a post-login destination. */
export function safeNext(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (value.startsWith('/__login') || value.startsWith('/__logout')) return '/';
  return value;
}
