/**
 * The API, three resources:
 *
 *   GET  /api/me      who is signed in, and whether their progress is synced
 *   GET  /api/state   every saved key of the signed-in user
 *   PUT  /api/state   save or delete keys (last write wins, by updatedAt)
 *   GET  /api/users   admins: every user with their exam stats; others: themselves
 *   POST /api/users   admins: add a user
 *   PATCH /api/users  change your own password, or (admins) another user's password or role
 *   DELETE /api/users?id=  admins: remove a user and everything they saved
 *
 * The app's state is stored the way the browser stores it — one JSON string
 * per localStorage key — so nothing in the app had to change shape. Exam
 * history is also copied into an `attempts` table, which keeps every attempt
 * (the browser key keeps the last 25) and is what the users page reports.
 */
import type { InStatement } from '@libsql/client';
import { nameProblem } from '../auth/accounts.js';
import { hashPassword, passwordProblem, verifyPassword } from '../auth/password.js';
import { body, fail, json, signedIn } from './http.js';

const KEY_RE = /^[\w.:\-]{1,160}$/;
const MAX_VALUE = 1_500_000;
const MAX_ITEMS = 200;
const HISTORY_RE = /^([a-z0-9]+)-quiz-history-v1$/;

/** Only touch last_seen every few minutes, not on every page load. */
const SEEN_EVERY = 5 * 60 * 1000;

export async function me(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  const now = Date.now();
  await s.db.execute({ sql: 'UPDATE users SET last_seen = ? WHERE id = ? AND (last_seen IS NULL OR last_seen < ?)', args: [now, s.account.id, now - SEEN_EVERY] });
  return json({ user: s.account, sync: true });
}

export async function getState(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  const rows = await s.db.execute({ sql: 'SELECT key, value, updated_at FROM kv WHERE user_id = ?', args: [s.account.id] });
  return json({ items: rows.rows.map((r) => ({ key: String(r.key), value: String(r.value), updatedAt: Number(r.updated_at) })) });
}

interface Item {
  key: string;
  value: string | null;
  updatedAt: number;
}

interface Attempt {
  at: number;
  label: string;
  correct: number;
  total: number;
  percent: number;
  elapsedMs: number;
}

export async function putState(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  const data = await body<{ items?: Item[] }>(request);
  const items = data?.items;
  if (!Array.isArray(items) || items.length > MAX_ITEMS) return fail(400, 'bad-request');
  const uid = s.account.id;
  const stmts: InStatement[] = [];
  for (const it of items) {
    if (!it || typeof it.key !== 'string' || !KEY_RE.test(it.key) || !Number.isFinite(it.updatedAt)) return fail(400, 'bad-item');
    if (it.value === null) {
      stmts.push({ sql: 'DELETE FROM kv WHERE user_id = ? AND key = ? AND updated_at <= ?', args: [uid, it.key, it.updatedAt] });
      continue;
    }
    if (typeof it.value !== 'string' || it.value.length > MAX_VALUE) return fail(413, 'too-large');
    stmts.push({
      sql: `INSERT INTO kv (user_id, key, value, updated_at) VALUES (?, ?, ?, ?)
            ON CONFLICT (user_id, key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
            WHERE excluded.updated_at >= kv.updated_at`,
      args: [uid, it.key, it.value, it.updatedAt]
    });
    const history = HISTORY_RE.exec(it.key);
    if (history) {
      let attempts: Attempt[] = [];
      try {
        attempts = JSON.parse(it.value);
      } catch {
        /* a broken history string is stored as is; it just adds no attempts */
      }
      for (const a of Array.isArray(attempts) ? attempts : []) {
        if (!a || !Number.isFinite(a.at)) continue;
        stmts.push({
          sql: `INSERT OR REPLACE INTO attempts (user_id, exam, at, label, correct, total, percent, elapsed_ms) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [uid, history[1], a.at, String(a.label ?? '').slice(0, 200), Number(a.correct) || 0, Number(a.total) || 0, Number(a.percent) || 0, Number(a.elapsedMs) || 0]
        });
      }
    }
  }
  if (stmts.length) await s.db.batch(stmts, 'write');
  return json({ ok: true, saved: items.length });
}

export async function listUsers(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  const where = s.account.admin ? '' : 'WHERE u.id = ?';
  const args = s.account.admin ? [] : [s.account.id];
  const users = await s.db.execute({
    sql: `SELECT u.id, u.name, u.is_admin, u.is_owner, u.created_at, u.last_seen FROM users u ${where} ORDER BY u.is_owner DESC, u.name`,
    args
  });
  const stats = await s.db.execute({
    sql: `SELECT user_id, exam, COUNT(*) AS n, MAX(percent) AS best, ROUND(AVG(percent)) AS avg, MAX(at) AS last
          FROM attempts ${s.account.admin ? '' : 'WHERE user_id = ?'} GROUP BY user_id, exam`,
    args
  });
  return json({
    users: users.rows.map((u) => ({
      id: Number(u.id),
      name: String(u.name),
      admin: Number(u.is_admin) === 1,
      owner: Number(u.is_owner) === 1,
      createdAt: Number(u.created_at),
      lastSeen: u.last_seen === null ? null : Number(u.last_seen),
      exams: stats.rows
        .filter((r) => Number(r.user_id) === Number(u.id))
        .map((r) => ({ exam: String(r.exam), attempts: Number(r.n), best: Number(r.best), average: Number(r.avg), last: Number(r.last) }))
    }))
  });
}

export async function createUser(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  if (!s.account.admin) return fail(403, 'admin-only');
  const data = await body<{ name?: string; password?: string; admin?: boolean }>(request, 10_000);
  const name = String(data?.name ?? '').trim();
  const password = String(data?.password ?? '');
  const problem = nameProblem(name) ?? passwordProblem(password);
  if (problem) return fail(400, problem);
  const taken = await s.db.execute({ sql: 'SELECT id FROM users WHERE name = ?', args: [name] });
  if (taken.rows[0]) return fail(409, 'That name is already taken.');
  const made = await s.db.execute({
    sql: 'INSERT INTO users (name, password_hash, is_admin, is_owner, created_at) VALUES (?, ?, ?, 0, ?) RETURNING id',
    args: [name, await hashPassword(password), data?.admin ? 1 : 0, Date.now()]
  });
  return json({ ok: true, id: Number(made.rows[0].id) }, 201);
}

export async function updateUser(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  const data = await body<{ id?: number; password?: string; current?: string; admin?: boolean }>(request, 10_000);
  const id = Number(data?.id);
  if (!Number.isInteger(id)) return fail(400, 'bad-request');
  const target = await s.db.execute({ sql: 'SELECT id, is_owner, password_hash FROM users WHERE id = ?', args: [id] });
  const row = target.rows[0];
  if (!row) return fail(404, 'No such user.');
  if (Number(row.is_owner) === 1) return fail(400, 'The owner\'s password is set in the environment (BASIC_AUTH_PASSWORD).');

  const self = id === s.account.id;
  if (!self && !s.account.admin) return fail(403, 'admin-only');
  const stmts: InStatement[] = [];
  if (data?.password !== undefined) {
    const problem = passwordProblem(String(data.password));
    if (problem) return fail(400, problem);
    if (self && !(await verifyPassword(String(data.current ?? ''), String(row.password_hash ?? '')))) return fail(400, 'Your current password is not right.');
    stmts.push({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [await hashPassword(String(data.password)), id] });
  }
  if (data?.admin !== undefined) {
    if (!s.account.admin || self) return fail(403, 'admin-only');
    stmts.push({ sql: 'UPDATE users SET is_admin = ? WHERE id = ?', args: [data.admin ? 1 : 0, id] });
  }
  if (!stmts.length) return fail(400, 'Nothing to change.');
  await s.db.batch(stmts, 'write');
  return json({ ok: true });
}

export async function deleteUser(request: Request): Promise<Response> {
  const s = await signedIn(request);
  if (!s.ok) return s.response;
  if (!s.account.admin) return fail(403, 'admin-only');
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!Number.isInteger(id)) return fail(400, 'bad-request');
  if (id === s.account.id) return fail(400, 'You cannot remove yourself.');
  const target = await s.db.execute({ sql: 'SELECT is_owner FROM users WHERE id = ?', args: [id] });
  if (!target.rows[0]) return fail(404, 'No such user.');
  if (Number(target.rows[0].is_owner) === 1) return fail(400, 'The owner cannot be removed.');
  await s.db.batch(
    [
      { sql: 'DELETE FROM kv WHERE user_id = ?', args: [id] },
      { sql: 'DELETE FROM attempts WHERE user_id = ?', args: [id] },
      { sql: 'DELETE FROM users WHERE id = ?', args: [id] }
    ],
    'write'
  );
  return json({ ok: true });
}

/** Method tables, for the Vercel functions and the dev server alike. */
export const ROUTES: Record<string, Partial<Record<string, (r: Request) => Promise<Response>>>> = {
  '/api/me': { GET: me },
  '/api/state': { GET: getState, PUT: putState },
  '/api/users': { GET: listUsers, POST: createUser, PATCH: updateUser, DELETE: deleteUser }
};
