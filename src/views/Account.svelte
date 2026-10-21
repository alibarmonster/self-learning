<script lang="ts">
  /**
   * #/account — who you are signed in as, whether your progress is saved to
   * the database, your password and your exam stats; for admins, everyone else
   * too, with adding people, resetting passwords and removing them.
   */
  import { EXAMS } from '@/exams';
  import { flush, sync, signOut } from '@/state/sync.svelte';

  interface ExamStat {
    exam: string;
    attempts: number;
    best: number;
    average: number;
    last: number;
  }
  interface Person {
    id: number;
    name: string;
    admin: boolean;
    owner: boolean;
    createdAt: number;
    lastSeen: number | null;
    exams: ExamStat[];
  }

  const examName = (prefix: string) => EXAMS.find((e) => e.storagePrefix === prefix)?.short ?? prefix.toUpperCase();
  const when = (t: number | null) => (t ? new Date(t).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—');
  const role = (p: { owner: boolean; admin: boolean }) => (p.owner ? 'Owner' : p.admin ? 'Admin' : 'Member');

  let people = $state<Person[]>([]);
  let loadError = $state('');

  async function call(method: string, url: string, body?: unknown): Promise<{ ok: boolean; data: any }> {
    try {
      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { accept: 'application/json', ...(body ? { 'content-type': 'application/json' } : {}) },
        body: body ? JSON.stringify(body) : undefined
      });
      const data = (res.headers.get('content-type') ?? '').includes('json') ? await res.json() : null;
      return { ok: res.ok, data };
    } catch {
      return { ok: false, data: { error: 'The server could not be reached.' } };
    }
  }

  async function load() {
    if (!sync.user) return;
    const r = await call('GET', '/api/users');
    if (r.ok) {
      people = r.data.users;
      loadError = '';
    } else loadError = r.data?.error ?? 'Could not load.';
  }

  $effect(() => {
    void load();
  });

  const me = $derived(people.find((p) => p.id === sync.user?.id));
  const others = $derived(people.filter((p) => p.id !== sync.user?.id));

  // ── my password ──
  let current = $state('');
  let next1 = $state('');
  let next2 = $state('');
  let pwMsg = $state<{ ok: boolean; text: string } | null>(null);

  async function changeMine(e: SubmitEvent) {
    e.preventDefault();
    if (next1 !== next2) return (pwMsg = { ok: false, text: 'The two new passwords are not the same.' });
    const r = await call('PATCH', '/api/users', { id: sync.user!.id, current, password: next1 });
    pwMsg = r.ok ? { ok: true, text: 'Password changed.' } : { ok: false, text: r.data?.error ?? 'Could not change it.' };
    if (r.ok) current = next1 = next2 = '';
  }

  // ── admin: add a person ──
  let newName = $state('');
  let newPassword = $state('');
  let newAdmin = $state(false);
  let addMsg = $state<{ ok: boolean; text: string; password?: string } | null>(null);

  function generate() {
    const bytes = crypto.getRandomValues(new Uint8Array(12));
    newPassword = Array.from(bytes, (b) => 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'[b % 56]).join('');
  }

  async function add(e: SubmitEvent) {
    e.preventDefault();
    const r = await call('POST', '/api/users', { name: newName.trim(), password: newPassword, admin: newAdmin });
    if (r.ok) {
      addMsg = { ok: true, text: `Added ${newName.trim()}. Give them their name and this password — it is not shown again; they can change it here after signing in.`, password: newPassword };
      newName = '';
      newPassword = '';
      newAdmin = false;
      await load();
    } else addMsg = { ok: false, text: r.data?.error ?? 'Could not add.' };
  }

  // ── admin: per-person actions ──
  let resetFor = $state<number | null>(null);
  let resetPassword = $state('');
  let rowMsg = $state<{ id: number; ok: boolean; text: string } | null>(null);

  async function reset(p: Person) {
    const r = await call('PATCH', '/api/users', { id: p.id, password: resetPassword });
    rowMsg = r.ok ? { id: p.id, ok: true, text: 'New password set.' } : { id: p.id, ok: false, text: r.data?.error ?? 'Could not set it.' };
    if (r.ok) {
      resetFor = null;
      resetPassword = '';
    }
  }

  async function toggleAdmin(p: Person) {
    const r = await call('PATCH', '/api/users', { id: p.id, admin: !p.admin });
    if (r.ok) await load();
    else rowMsg = { id: p.id, ok: false, text: r.data?.error ?? 'Could not change the role.' };
  }

  async function removePerson(p: Person) {
    if (!confirm(`Remove ${p.name} and everything they have saved? This cannot be undone.`)) return;
    const r = await call('DELETE', `/api/users?id=${p.id}`);
    if (r.ok) await load();
    else rowMsg = { id: p.id, ok: false, text: r.data?.error ?? 'Could not remove.' };
  }

  const status = $derived(
    sync.error === 'offline'
      ? `${sync.pending} change${sync.pending === 1 ? '' : 's'} waiting — the server cannot be reached; they are kept in this browser and sent when it can.`
      : sync.error === 'signed-out'
        ? 'Your session has ended. Sign in again to keep saving.'
        : sync.error
          ? `Saving failed: ${sync.error}`
          : sync.saving || sync.pending
            ? 'Saving…'
            : sync.lastSaved
              ? `Everything is saved to the database · last saved ${new Date(sync.lastSaved).toLocaleTimeString()}`
              : 'Everything is saved to the database.'
  );
</script>

<div class="page account rise">
  <header class="head">
    <p class="eyebrow">Account</p>
    <h1>{sync.user ? sync.user.name : 'This browser'}</h1>
  </header>

  {#if !sync.user}
    <section class="card block">
      <h2>Progress is kept in this browser only</h2>
      <p>
        There is no account database here, so answers, history and lesson progress live in this browser's storage, as before.
        {#if sync.reason === 'no-database'}
          You are signed in, but the server has no database configured.
        {/if}
      </p>
      <ul>
        <li><strong>On Vercel:</strong> create a Turso database and add <code>TURSO_DATABASE_URL</code> and <code>TURSO_AUTH_TOKEN</code> to the project's environment variables, then redeploy. See <code>docs/deployment.md</code>.</li>
        <li><strong>Locally:</strong> copy <code>.env.example</code> to <code>.env.local</code>, set <code>BASIC_AUTH_USER</code> and <code>BASIC_AUTH_PASSWORD</code>, and restart <code>bun run dev</code> — it then uses a SQLite file in <code>data/</code>.</li>
      </ul>
    </section>
  {:else}
    <section class="card block">
      <div class="who">
        <span class="role">{role(sync.user)}</span>
        <p class="status" class:warn={!!sync.error}>
          <span class="dot" class:busy={sync.saving || sync.pending > 0} class:bad={!!sync.error} aria-hidden="true"></span>{status}
        </p>
      </div>
      <div class="row-actions">
        <button class="btn btn-secondary sm" onclick={() => flush()}>Save now</button>
        <button class="btn btn-ghost sm" onclick={signOut}>Sign out</button>
      </div>
    </section>

    <section class="block">
      <h2>Your exams</h2>
      {#if me?.exams.length}
        <div class="table-wrap">
          <table>
            <thead><tr><th>Exam</th><th>Attempts</th><th>Best</th><th>Average</th><th>Last attempt</th></tr></thead>
            <tbody>
              {#each me.exams as x (x.exam)}
                <tr><td>{examName(x.exam)}</td><td class="mono">{x.attempts}</td><td class="mono">{x.best}%</td><td class="mono">{x.average}%</td><td>{when(x.last)}</td></tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="muted">No attempts yet. Finish a paper and it appears here — every attempt is kept, not only the last 25.</p>
      {/if}
    </section>

    <section class="block">
      <h2>Password</h2>
      {#if sync.user.owner}
        <p class="muted">You are the owner: your password is <code>BASIC_AUTH_PASSWORD</code> in the environment (Vercel, or <code>.env.local</code>). Change it there and redeploy.</p>
      {:else}
        <form class="form" onsubmit={changeMine}>
          <label><span>Current password</span><input type="password" autocomplete="current-password" bind:value={current} required /></label>
          <label><span>New password</span><input type="password" autocomplete="new-password" minlength="8" bind:value={next1} required /></label>
          <label><span>New password again</span><input type="password" autocomplete="new-password" minlength="8" bind:value={next2} required /></label>
          <button class="btn btn-primary sm" type="submit">Change password</button>
          {#if pwMsg}<p class="msg" class:ok={pwMsg.ok}>{pwMsg.text}</p>{/if}
        </form>
      {/if}
    </section>

    {#if sync.user.admin}
      <section class="block">
        <h2>People</h2>
        {#if loadError}<p class="msg">{loadError}</p>{/if}
        {#if others.length}
          <ul class="people">
            {#each others as p (p.id)}
              <li class="card person">
                <div class="person-head">
                  <strong>{p.name}</strong>
                  <span class="role">{role(p)}</span>
                  <span class="muted small">last seen {when(p.lastSeen)}</span>
                </div>
                <p class="small">
                  {#if p.exams.length}
                    {#each p.exams as x, k (x.exam)}{#if k} · {/if}{examName(x.exam)}: {x.attempts} attempt{x.attempts === 1 ? '' : 's'}, best {x.best}%{/each}
                  {:else}
                    <span class="muted">No attempts yet.</span>
                  {/if}
                </p>
                {#if !p.owner}
                  <div class="row-actions">
                    <button class="btn btn-ghost sm" onclick={() => ((resetFor = resetFor === p.id ? null : p.id), (resetPassword = ''))}>Reset password</button>
                    <button class="btn btn-ghost sm" onclick={() => toggleAdmin(p)}>{p.admin ? 'Make member' : 'Make admin'}</button>
                    <button class="btn btn-ghost sm danger" onclick={() => removePerson(p)}>Remove</button>
                  </div>
                  {#if resetFor === p.id}
                    <form class="inline" onsubmit={(e) => (e.preventDefault(), reset(p))}>
                      <input type="text" placeholder="New password (8+ characters)" minlength="8" bind:value={resetPassword} required />
                      <button class="btn btn-primary sm" type="submit">Set</button>
                    </form>
                  {/if}
                {/if}
                {#if rowMsg?.id === p.id}<p class="msg" class:ok={rowMsg.ok}>{rowMsg.text}</p>{/if}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="muted">Nobody else yet. Add someone below — each person gets their own saved answers, history and lesson progress.</p>
        {/if}
      </section>

      <section class="block">
        <h2>Add a person</h2>
        <form class="form" onsubmit={add}>
          <label><span>Name (what they type to sign in)</span><input type="text" autocomplete="off" pattern="[A-Za-z0-9][A-Za-z0-9._\-]{'{1,31}'}" bind:value={newName} required /></label>
          <label>
            <span>Password</span>
            <span class="with-button">
              <input type="text" autocomplete="off" minlength="8" bind:value={newPassword} required />
              <button class="btn btn-ghost sm" type="button" onclick={generate}>Generate</button>
            </span>
          </label>
          <label class="check"><input type="checkbox" bind:checked={newAdmin} /><span>Admin — can add and remove people</span></label>
          <button class="btn btn-primary sm" type="submit">Add person</button>
          {#if addMsg}
            <p class="msg" class:ok={addMsg.ok}>
              {addMsg.text}
              {#if addMsg.password}<span class="secret mono">{addMsg.password}</span>{/if}
            </p>
          {/if}
        </form>
      </section>
    {/if}
  {/if}
</div>

<style>
  .account {
    padding-top: 40px;
    padding-bottom: 72px;
    max-width: 820px;
  }

  .head h1 {
    margin-top: 8px;
    font-size: var(--type-h1);
    line-height: 1.1;
  }

  .block {
    margin-top: 28px;
  }

  .card.block {
    padding: 20px;
  }

  h2 {
    font-size: var(--type-h3);
    line-height: 1.2;
    margin-bottom: 10px;
  }

  p,
  li {
    font-size: 15px;
    line-height: 1.6;
  }

  ul {
    margin: 10px 0 0;
    padding-left: 20px;
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.88em;
    padding: 1px 4px;
    background: var(--bg-sunken);
  }

  .muted {
    color: var(--text-secondary);
  }

  .small {
    font-size: 13.5px;
  }

  .who {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 14px;
  }

  .role {
    padding: 2px 8px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    border: 1px solid var(--line-strong);
  }

  .status {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--text-secondary);
    font-size: 14px;
  }

  .status.warn {
    color: var(--amber);
  }

  .dot {
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--green);
  }

  .dot.busy {
    background: var(--amber);
  }

  .dot.bad {
    background: var(--red);
  }

  .row-actions {
    margin-top: 12px;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .danger {
    color: var(--red);
  }

  .table-wrap {
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 7px 10px;
    border-bottom: 1px solid var(--line-strong);
    background: var(--bg-elevated);
  }

  td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--line);
  }

  .form {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    max-width: 420px;
  }

  .form label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    font-size: 13px;
    font-weight: 600;
  }

  .form label.check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-weight: 500;
  }

  input[type='text'],
  input[type='password'] {
    width: 100%;
    padding: 9px 11px;
    font-size: 15px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--bg);
    color: var(--text);
  }

  input:focus {
    outline: 2px solid var(--mint);
    outline-offset: 1px;
  }

  .with-button {
    display: flex;
    gap: 6px;
  }

  .msg {
    padding: 8px 12px;
    font-size: 14px;
    background: var(--red-soft);
  }

  .msg.ok {
    background: var(--green-soft);
  }

  .secret {
    display: block;
    margin-top: 6px;
    font-size: 15px;
    user-select: all;
  }

  .people {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .person {
    padding: 14px 16px;
  }

  .person-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    margin-bottom: 4px;
  }

  .inline {
    margin-top: 8px;
    display: flex;
    gap: 6px;
    max-width: 420px;
  }
</style>
