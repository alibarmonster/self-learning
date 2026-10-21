/**
 * Accounts. The **owner** is the person whose username and password are in
 * the environment (BASIC_AUTH_USER / BASIC_AUTH_PASSWORD): always an admin,
 * never stored with a password, created in the database on first sign-in.
 * Everyone else — friends the owner adds — has a row with a scrypt hash.
 */
import type { Client } from '@libsql/client';
import { getDb } from '../db/client.js';
import { DUMMY_HASH, verifyPassword } from './password.js';
import { checkLogin, type Credentials } from './session.js';

export interface Account {
  id: number;
  name: string;
  admin: boolean;
  owner: boolean;
}

const toAccount = (row: Record<string, unknown>): Account => ({
  id: Number(row.id),
  name: String(row.name),
  admin: Number(row.is_admin) === 1,
  owner: Number(row.is_owner) === 1
});

/** Names are what people type to sign in: short, plain, case-insensitive. */
export function nameProblem(name: string): string | null {
  if (!/^[a-z0-9][a-z0-9._-]{1,31}$/i.test(name)) return 'Use 2–32 letters, digits, dots, dashes or underscores, starting with a letter or digit.';
  return null;
}

/** The owner's row, created (or renamed after BASIC_AUTH_USER changed) as needed. */
export async function ensureOwner(db: Client, creds: Credentials): Promise<Account> {
  const now = Date.now();
  const found = await db.execute({ sql: 'SELECT * FROM users WHERE is_owner = 1 LIMIT 1', args: [] });
  if (found.rows[0]) {
    const owner = toAccount(found.rows[0]);
    if (owner.name.toLowerCase() !== creds.user.toLowerCase()) {
      // A friend may already hold the new name; the owner keeps the old one rather than clash.
      const clash = await db.execute({ sql: 'SELECT id FROM users WHERE name = ? AND is_owner = 0', args: [creds.user] });
      if (!clash.rows[0]) await db.execute({ sql: 'UPDATE users SET name = ? WHERE id = ?', args: [creds.user, owner.id] });
    }
    return { ...owner, name: creds.user };
  }
  const made = await db.execute({
    sql: 'INSERT INTO users (name, password_hash, is_admin, is_owner, created_at) VALUES (?, NULL, 1, 1, ?) RETURNING *',
    args: [creds.user, now]
  });
  return toAccount(made.rows[0]);
}

/**
 * Checks a sign-in. Returns the user id to put in the session, `null` for the
 * owner when there is no database (the old single-user mode), or `false`.
 */
export async function authenticate(creds: Credentials, name: string, password: string): Promise<number | null | false> {
  const db = await getDb();
  if (checkLogin(creds, name, password)) return db ? (await ensureOwner(db, creds)).id : null;
  if (!db) return false;
  const row = (await db.execute({ sql: 'SELECT id, password_hash FROM users WHERE name = ? AND is_owner = 0', args: [name] })).rows[0];
  const ok = await verifyPassword(password, row?.password_hash ? String(row.password_hash) : DUMMY_HASH);
  return ok && row ? Number(row.id) : false;
}

export async function accountById(db: Client, id: number): Promise<Account | null> {
  const row = (await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] })).rows[0];
  return row ? toAccount(row) : null;
}
