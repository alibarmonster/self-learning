/**
 * Keeps the browser's saved state in step with the database, per user.
 *
 * On start it asks /api/me who is signed in. With no account (no database, a
 * static host, `bun run dev` without credentials) nothing changes: storage
 * stays plain localStorage. With one, storage is scoped to that user, the
 * server's copy is pulled into this browser, and from then on every write is
 * pushed back a moment later — batched, retried on the next write or when the
 * browser comes back online, and flushed when the page is hidden. Unsaved
 * keys are remembered across reloads, so an offline session is not lost.
 *
 * The first time the owner signs in on a browser that already has progress
 * from before accounts existed, that progress is uploaded as theirs.
 */
import { THEME_KEY, setStorageScope } from './storage';

export interface Account {
  id: number;
  name: string;
  admin: boolean;
  owner: boolean;
}

/** The same rule the server applies; a key it would refuse is never sent. */
const KEY_RE = /^[\w.:\-]{1,160}$/;
const DEBOUNCE_MS = 1500;
const MIGRATED = 'ep-sync-migrated-v1';
const dirtyKey = (uid: number) => `ep-sync-dirty:u${uid}`;
const isInternal = (key: string) => key === THEME_KEY || key.startsWith('ep-sync-') || /^u\d+:/.test(key);

class SyncState {
  user = $state<Account | null>(null);
  /** `synced` once the server copy has been loaded; otherwise storage is browser-only. */
  mode = $state<'local' | 'synced'>('local');
  /** Why there is no sync, when there is none: no-database, not-configured, unreachable. */
  reason = $state('');
  pending = $state(0);
  saving = $state(false);
  lastSaved = $state(0);
  /** offline, signed-out, or a server message — cleared by the next good save. */
  error = $state('');
}

export const sync = new SyncState();

let prefix = '';
let dirty: Record<string, number> = {};
/** The newest value of each dirty key, in case localStorage refused it (quota). */
const latest: Record<string, string | null> = {};
let timer: ReturnType<typeof setTimeout> | undefined;
let flushing: Promise<void> | null = null;

const storageGet = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const storageSet = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* full or unavailable: the server copy is still kept */
  }
};

function saveDirty() {
  if (sync.user) storageSet(dirtyKey(sync.user.id), Object.keys(dirty).length ? JSON.stringify(dirty) : null);
  sync.pending = Object.keys(dirty).length;
}

function changed(key: string, raw: string | null) {
  if (!KEY_RE.test(key)) return;
  dirty[key] = Date.now();
  latest[key] = raw;
  saveDirty();
  clearTimeout(timer);
  timer = setTimeout(() => void flush(), DEBOUNCE_MS);
}

async function fetchJson(url: string, init: RequestInit = {}, timeoutMs = 8000): Promise<{ status: number; data: any }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { credentials: 'same-origin', ...init, signal: init.keepalive ? undefined : ctrl.signal, headers: { accept: 'application/json', ...(init.body ? { 'content-type': 'application/json' } : {}), ...init.headers } });
    const type = res.headers.get('content-type') ?? '';
    return { status: res.status, data: type.includes('application/json') ? await res.json() : null };
  } finally {
    clearTimeout(t);
  }
}

/** Sends every unsaved key, in batches the server accepts. */
export function flush(keepalive = false): Promise<void> {
  if (!sync.user || !Object.keys(dirty).length) return Promise.resolve();
  if (flushing) return flushing.then(() => flush(keepalive));
  flushing = (async () => {
    sync.saving = true;
    try {
      const items = Object.entries(dirty).map(([key, updatedAt]) => ({
        key,
        value: key in latest ? latest[key] : storageGet(prefix + key),
        updatedAt
      }));
      const batches: (typeof items)[] = [[]];
      let size = 0;
      for (const it of items) {
        const n = (it.value?.length ?? 0) + it.key.length + 40;
        if (batches[batches.length - 1].length >= 150 || size + n > 3_000_000) {
          batches.push([]);
          size = 0;
        }
        batches[batches.length - 1].push(it);
        size += n;
      }
      for (const batch of batches) {
        if (!batch.length) continue;
        const body = JSON.stringify({ items: batch });
        const { status, data } = await fetchJson('/api/state', { method: 'PUT', body, keepalive: keepalive && body.length < 60_000 });
        if (status === 401) {
          sync.error = 'signed-out';
          return;
        }
        if (status !== 200) {
          sync.error = data?.error ?? `server ${status}`;
          return;
        }
        for (const it of batch) {
          if (dirty[it.key] === it.updatedAt) {
            delete dirty[it.key];
            delete latest[it.key];
          }
        }
        saveDirty();
      }
      sync.error = '';
      sync.lastSaved = Date.now();
    } catch {
      sync.error = 'offline';
    } finally {
      sync.saving = false;
      flushing = null;
    }
  })();
  return flushing;
}

/** Before signing out: save what is left, then wipe this user's copy from the browser. */
export async function signOut() {
  await flush();
  if (sync.user && !Object.keys(dirty).length) {
    const own = `u${sync.user.id}:`;
    try {
      for (const k of Object.keys(localStorage)) if (k.startsWith(own)) localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
  location.href = '/__logout';
}

export async function startSync(): Promise<void> {
  let me: { status: number; data: any };
  try {
    me = await fetchJson('/api/me', {}, 4000);
  } catch {
    sync.reason = 'unreachable';
    return;
  }
  if (me.status !== 200 || !me.data?.sync || !me.data.user) {
    sync.reason = me.data?.reason ?? me.data?.error ?? (me.status === 200 ? '' : 'not-configured');
    return;
  }
  const user: Account = me.data.user;
  sync.user = user;
  prefix = `u${user.id}:`;
  try {
    dirty = JSON.parse(storageGet(dirtyKey(user.id)) ?? '{}') ?? {};
  } catch {
    dirty = {};
  }
  setStorageScope(prefix, changed);
  await flush();

  let items: { key: string; value: string; updatedAt: number }[] = [];
  try {
    const state = await fetchJson('/api/state');
    if (state.status !== 200) throw new Error(String(state.status));
    items = state.data.items;
  } catch {
    // Could not load the server copy: work from this browser's copy and keep saving.
    sync.error = 'offline';
    sync.mode = 'synced';
    listen();
    return;
  }

  const legacy = user.owner && !storageGet(MIGRATED) && items.length === 0;
  if (legacy) {
    // Progress from before accounts: it is the owner's, so it goes up as theirs.
    try {
      for (const k of Object.keys(localStorage)) {
        if (isInternal(k) || !KEY_RE.test(k)) continue;
        const v = storageGet(k);
        storageSet(prefix + k, v);
        changed(k, v);
      }
    } catch {
      /* ignore */
    }
    storageSet(MIGRATED, String(Date.now()));
    await flush();
  } else {
    const onServer = new Set<string>();
    for (const it of items) {
      onServer.add(it.key);
      if (!dirty[it.key]) storageSet(prefix + it.key, it.value);
    }
    // Keys this browser has but the server does not (removed elsewhere) go, unless they are unsaved here.
    try {
      for (const k of Object.keys(localStorage)) {
        if (!k.startsWith(prefix)) continue;
        const key = k.slice(prefix.length);
        if (!onServer.has(key) && !dirty[key]) localStorage.removeItem(k);
      }
    } catch {
      /* ignore */
    }
  }
  sync.mode = 'synced';
  listen();
}

function listen() {
  addEventListener('pagehide', () => void flush(true));
  addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void flush(true);
  });
  addEventListener('online', () => void flush());
}
