/**
 * The database: SQLite through libSQL. In production the URL points at a
 * Turso database (`libsql://…`, with an auth token); locally it is a plain
 * SQLite file (`file:data/exam-prep.db`), set by the dev server. The same
 * code and the same SQL run against both.
 *
 *   TURSO_DATABASE_URL   libsql://<db>-<org>.turso.io, or file:…
 *   TURSO_AUTH_TOKEN     the Turso token (not needed for a file)
 *
 * With no URL the app still works, exactly as before: everything stays in
 * the browser's localStorage and nothing is synced.
 */
import type { Client } from '@libsql/client';

type Env = Record<string, string | undefined>;

export const databaseUrl = (env: Env = process.env) => env.TURSO_DATABASE_URL || undefined;

/**
 * Tables, created if missing. Rows are deleted by hand rather than with
 * foreign-key cascades, because libSQL over HTTP opens a fresh connection per
 * request and `PRAGMA foreign_keys` would not stick.
 */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT,
    is_admin INTEGER NOT NULL DEFAULT 0,
    is_owner INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    last_seen INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS kv (
    user_id INTEGER NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, key)
  )`,
  `CREATE TABLE IF NOT EXISTS attempts (
    user_id INTEGER NOT NULL,
    exam TEXT NOT NULL,
    at INTEGER NOT NULL,
    label TEXT NOT NULL,
    correct INTEGER NOT NULL,
    total INTEGER NOT NULL,
    percent INTEGER NOT NULL,
    elapsed_ms INTEGER NOT NULL,
    PRIMARY KEY (user_id, exam, at)
  )`
];

let cached: { url: string; client: Promise<Client> } | undefined;

async function open(url: string, authToken: string | undefined): Promise<Client> {
  // A file (or :memory:) needs the native SQLite driver; Turso only needs HTTP, so production
  // loads the web client and never touches a native binary on Vercel.
  const local = url.startsWith('file:') || url === ':memory:';
  const { createClient } = local ? await import('@libsql/client') : await import('@libsql/client/web');
  const client = createClient({ url, authToken });
  await client.batch(SCHEMA, 'write');
  return client;
}

/** The client, with the schema in place — or null when no database is configured. */
export async function getDb(env: Env = process.env): Promise<Client | null> {
  const url = databaseUrl(env);
  if (!url) return null;
  // The promise is cached, not the client, so requests that arrive together share one connection.
  if (!cached || cached.url !== url) cached = { url, client: open(url, env.TURSO_AUTH_TOKEN || undefined) };
  const mine = cached;
  try {
    return await mine.client;
  } catch (e) {
    // Let the next request try again rather than caching a failure forever.
    if (cached === mine) cached = undefined;
    throw e;
  }
}

/** Closes the cached client (scripts and tests; a running server keeps it open). */
export async function closeDb() {
  const c = cached;
  cached = undefined;
  if (c) (await c.client.catch(() => null))?.close();
}
