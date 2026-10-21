/**
 * End-to-end check of the sign-in middleware and the API against a throwaway
 * in-memory SQLite database: the owner signs in, adds a friend, both save progress, history
 * becomes attempts, permissions hold, and deleting the friend removes their
 * data. Run with `bun scripts/api-check.ts`.
 */
process.env.BASIC_AUTH_USER = 'owner';
process.env.TURSO_DATABASE_URL = ':memory:';
delete process.env.SESSION_SECRET;

const { randomBytes } = await import('node:crypto');
const { default: middleware } = await import('../middleware.ts');
const { ROUTES } = await import('../server/api/handlers.ts');
const { closeDb } = await import('../server/db/client.ts');

const ORIGIN = 'http://localhost:5173';
/** Throwaway passwords, made fresh each run so none is ever written down. */
const pw = () => `t-${randomBytes(9).toString('base64url')}`;
const OWNER_PW = pw();
const BUDI_PW = pw();
const BUDI_PW2 = pw();
process.env.BASIC_AUTH_PASSWORD = OWNER_PW;
let failed = 0;
const check = (ok: boolean, what: string) => {
  console.log(`${ok ? '✓' : '✗'} ${what}`);
  if (!ok) failed++;
};

async function signIn(user: string, password: string): Promise<string | null> {
  const form = new FormData();
  form.set('user', user);
  form.set('password', password);
  form.set('next', '/');
  const res = await middleware(new Request(`${ORIGIN}/__login`, { method: 'POST', body: form }));
  const cookie = res.headers.getSetCookie().find((c) => c.startsWith('ep_session='));
  return res.status === 303 && cookie ? cookie.split(';')[0] : null;
}

async function api(cookie: string | null, method: string, path: string, data?: unknown) {
  const [route, query] = path.split('?');
  const make = () =>
    new Request(`${ORIGIN}${route}${query ? `?${query}` : ''}`, {
      method,
      headers: { ...(cookie ? { cookie } : {}), origin: ORIGIN, 'content-type': 'application/json' },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
  const gate = await middleware(make());
  if (gate.headers.get('x-middleware-next') !== '1') return { status: gate.status, body: null as any };
  const res = await ROUTES[route][method]!(make());
  return { status: res.status, body: (await res.json()) as any };
}

try {
  check((await signIn('owner', pw())) === null, 'a wrong password is refused');
  const owner = await signIn('owner', OWNER_PW);
  check(owner !== null, 'the owner signs in with the environment password');

  const me = await api(owner, 'GET', '/api/me');
  check(me.status === 200 && me.body.user?.owner && me.body.user.admin && me.body.sync, 'the owner is an admin and synced');

  check((await api(null, 'GET', '/api/me')).status === 401, 'no cookie, no API');

  const made = await api(owner, 'POST', '/api/users', { name: 'budi', password: BUDI_PW });
  check(made.status === 201, 'the owner adds a friend');
  check((await api(owner, 'POST', '/api/users', { name: 'BUDI', password: pw() })).status === 409, 'names are unique, ignoring case');
  check((await api(owner, 'POST', '/api/users', { name: 'x', password: 'short' })).status === 400, 'bad names and short passwords are refused');

  const budi = await signIn('budi', BUDI_PW);
  check(budi !== null, 'the friend signs in with their own password');

  const history = JSON.stringify([{ at: 1, label: 'Full Exam', correct: 40, total: 50, percent: 80, elapsedMs: 3600000, auto: false }]);
  const put = await api(budi, 'PUT', '/api/state', { items: [{ key: 'ace-quiz-history-v1', value: history, updatedAt: 10 }, { key: 'ep-learn-read-v1:vpc', value: '{"what":true}', updatedAt: 10 }] });
  check(put.status === 200, 'the friend saves progress');
  await api(budi, 'PUT', '/api/state', { items: [{ key: 'ep-learn-read-v1:vpc', value: '{"old":true}', updatedAt: 5 }] });
  const state = await api(budi, 'GET', '/api/state');
  const read = state.body.items.find((i: any) => i.key === 'ep-learn-read-v1:vpc');
  check(state.body.items.length === 2 && read?.value === '{"what":true}', 'an older write does not overwrite a newer one');

  const ownerState = await api(owner, 'GET', '/api/state');
  check(ownerState.body.items.length === 0, "the owner does not see the friend's progress");

  check((await api(budi, 'GET', '/api/users')).body.users.length === 1, 'a non-admin only sees themselves');
  check((await api(budi, 'POST', '/api/users', { name: 'eve', password: pw() })).status === 403, 'a non-admin cannot add users');

  const users = await api(owner, 'GET', '/api/users');
  const budiRow = users.body.users.find((u: any) => u.name === 'budi');
  check(users.body.users.length === 2 && budiRow?.exams[0]?.best === 80, "the admin sees everyone, with the friend's attempt");

  check((await api(budi, 'PATCH', '/api/users', { id: budiRow.id, current: 'nope', password: BUDI_PW2 })).status === 400, 'changing your password needs the current one');
  check((await api(budi, 'PATCH', '/api/users', { id: budiRow.id, current: BUDI_PW, password: BUDI_PW2 })).status === 200, 'the friend changes their own password');
  check((await signIn('budi', BUDI_PW2)) !== null, 'and signs in with the new one');

  check((await api(owner, 'DELETE', `/api/users?id=${me.body.user.id}`)).status === 400, 'the owner cannot remove themselves');
  check((await api(owner, 'DELETE', `/api/users?id=${budiRow.id}`)).status === 200, 'the owner removes the friend');
  check((await api(budi, 'GET', '/api/me')).status === 401, "the removed friend's session no longer works");
  check((await api(owner, 'GET', '/api/users')).body.users.length === 1, 'and their data is gone');

  const cross = await middleware(new Request(`${ORIGIN}/api/state`, { method: 'GET', headers: { cookie: owner! } }));
  check(cross.headers.get('x-middleware-next') === '1', 'a signed-in request passes the middleware');
  const evil = await ROUTES['/api/state'].PUT!(
    new Request(`${ORIGIN}/api/state`, { method: 'PUT', headers: { cookie: owner!, origin: 'https://evil.example' }, body: '{"items":[]}' })
  );
  check(evil.status === 403, 'a write from another origin is refused');
} finally {
  await closeDb();
}

if (failed) {
  console.log(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log('\nAPI and sign-in: all checks passed');
