<script lang="ts">
  import { tick, untrack } from 'svelte';
  import LabHead from './LabHead.svelte';
  import { complete, run } from '@/lab/term/run';
  import { config, type CloudState } from '@/lab/term/state';
  import type { Line } from '@/lab/term/shell';
  import type { TermScenario } from '@/lab/term/scenarios';
  import { clearWork, loadWork, markDone, saveWork } from '@/lab/progress';

  let { sc }: { sc: TermScenario } = $props();

  interface Saved {
    state: CloudState;
    lines: Line[];
    history: string[];
  }

  const MAX_LINES = 800;

  function welcome(): Line[] {
    return [
      { kind: 'info', text: 'Welcome to Cloud Shell (lab simulasi). Ketik help untuk daftar perintah, hint untuk petunjuk.' },
      { kind: 'info', text: 'Tab melengkapi perintah · ↑/↓ riwayat · Ctrl+L bersihkan layar.' },
      { kind: 'out', text: '' }
    ];
  }

  // The lab view remounts per scenario, so reading the prop once is enough.
  const start = untrack(() => sc);
  const saved = loadWork<Saved>('terminal', start.id);
  let cloud = $state<CloudState>(saved?.state ?? start.build());
  let lines = $state<Line[]>(saved?.lines ?? welcome());
  let history = $state<string[]>(saved?.history ?? []);
  let input = $state('');
  let cursor = $state(-1);
  let hintsUsed = $state(0);
  let showSolution = $state(false);

  let screen: HTMLDivElement | undefined = $state();
  let field: HTMLInputElement | undefined = $state();

  const status = $derived(sc.tasks.map((t) => t.check(cloud)));
  const doneCount = $derived(status.filter(Boolean).length);
  const allDone = $derived(sc.tasks.length > 0 && doneCount === sc.tasks.length);
  const prompt = $derived(`student@cloudshell:~${config(cloud).project ? ` (${config(cloud).project})` : ''}$`);

  function push(...more: Line[]) {
    lines = [...lines, ...more].slice(-MAX_LINES);
  }

  function persist() {
    saveWork('terminal', sc.id, { state: $state.snapshot(cloud), lines: $state.snapshot(lines), history: $state.snapshot(history) });
  }

  async function scrollDown() {
    await tick();
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  function nextHint(): string {
    const i = status.findIndex((x) => !x);
    if (i < 0) return sc.tasks.length ? 'Semua task sudah selesai. Coba perintah lain dengan bebas.' : 'Sandbox: tidak ada task. Coba help.';
    hintsUsed += 1;
    return `Task ${i + 1} — ${sc.tasks[i].label}: ${sc.tasks[i].hint}`;
  }

  function reset() {
    cloud = sc.build();
    lines = [...welcome(), { kind: 'warn', text: 'Skenario dimulai ulang.' }];
    history = [];
    hintsUsed = 0;
    showSolution = false;
    clearWork('terminal', sc.id);
  }

  function exec(raw: string) {
    const line = raw.trim();
    push({ kind: 'cmd', text: `${prompt} ${raw}` });
    if (line) history = [...history.filter((h) => h !== line), line].slice(-100);
    cursor = -1;
    const word = line.split(/\s+/)[0];
    if (word === 'clear') {
      lines = [];
    } else if (word === 'history') {
      push(...history.map((h, i) => ({ kind: 'out' as const, text: `${String(i + 1).padStart(4)}  ${h}` })));
    } else if (word === 'hint') {
      push({ kind: 'warn', text: nextHint() });
    } else if (word === 'reset') {
      reset();
    } else if (word === 'tasks') {
      push(...sc.tasks.map((t, i) => ({ kind: status[i] ? ('ok' as const) : ('out' as const), text: `${status[i] ? '✓' : '○'} ${i + 1}. ${t.label}` })));
    } else if (line) {
      const before = [...status];
      push(...run(cloud, line));
      const after = sc.tasks.map((t) => t.check(cloud));
      after.forEach((ok, i) => {
        if (ok && !before[i]) push({ kind: 'ok', text: `✓ Task selesai: ${sc.tasks[i].label}` });
      });
      if (sc.tasks.length && after.every(Boolean) && !before.every(Boolean)) {
        push({ kind: 'ok', text: '★ Semua task selesai!' }, { kind: 'info', text: sc.lesson });
        markDone('terminal', sc.id);
      }
    }
    persist();
    scrollDown();
  }

  function onkey(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = input;
      input = '';
      exec(v);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!history.length) return;
      cursor = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      input = history[cursor];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cursor < 0) return;
      cursor += 1;
      if (cursor >= history.length) {
        cursor = -1;
        input = '';
      } else input = history[cursor];
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const r = complete(input);
      input = r.line;
      if (r.options.length > 1) {
        push({ kind: 'cmd', text: `${prompt} ${input}` }, { kind: 'info', text: r.options.join('    ') });
        scrollDown();
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      lines = [];
    } else if (e.key === 'c' && e.ctrlKey && !window.getSelection()?.toString()) {
      e.preventDefault();
      push({ kind: 'cmd', text: `${prompt} ${input}^C` });
      input = '';
      scrollDown();
    }
  }

  function focusField() {
    if (!window.getSelection()?.toString()) field?.focus();
  }

  function paste(cmd: string) {
    input = cmd;
    field?.focus();
  }

  $effect(() => {
    scrollDown();
  });
</script>

<LabHead {sc} mode="Terminal" story={sc.story} />

<div class="layout">
  <aside class="panel">
    {#if sc.tasks.length}
      <div class="tasks card">
        <div class="tasks-head">
          <h2>Task</h2>
          <span class="count mono">{doneCount}/{sc.tasks.length}</span>
        </div>
        <div class="bar" aria-hidden="true"><span style:width={`${(doneCount / sc.tasks.length) * 100}%`}></span></div>
        <ol>
          {#each sc.tasks as t, i (t.label)}
            <li class:ok={status[i]}>
              <span class="mark" aria-hidden="true">{status[i] ? '✓' : i + 1}</span>
              <span>{t.label}<span class="sr-only">{status[i] ? ' — selesai' : ' — belum'}</span></span>
            </li>
          {/each}
        </ol>
        <p class="note">Dicek dari state project, bukan dari teks perintah — cara lain yang benar juga dihitung.</p>
      </div>
    {/if}

    {#if allDone}
      <div class="lesson card">
        <p class="eyebrow">Pelajaran</p>
        <p>{sc.lesson}</p>
      </div>
    {/if}

    <div class="actions">
      <button class="btn btn-secondary sm" onclick={() => exec('hint')}>Petunjuk</button>
      {#if sc.solution.length}
        <button class="btn btn-ghost sm" onclick={() => (showSolution = !showSolution)} aria-expanded={showSolution}>
          {showSolution ? 'Sembunyikan solusi' : 'Lihat solusi'}
        </button>
      {/if}
      <button class="btn btn-ghost sm" onclick={() => exec('reset')}>Mulai ulang</button>
    </div>
    {#if hintsUsed}<p class="note">{hintsUsed} petunjuk dipakai.</p>{/if}

    {#if showSolution}
      <ol class="solution">
        {#each sc.solution as cmd (cmd)}
          <li><button class="mono" onclick={() => paste(cmd)} title="Salin ke terminal">{cmd}</button></li>
        {/each}
      </ol>
      <p class="note">Klik baris untuk menyalinnya ke prompt, lalu tekan Enter.</p>
    {/if}
  </aside>

  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="term" onclick={focusField}>
    <div class="term-bar" aria-hidden="true">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="title mono">Cloud Shell · {config(cloud).project ?? 'tanpa project'}</span>
    </div>
    <div class="screen mono" bind:this={screen} role="log" aria-live="polite" aria-label="Output terminal">
      {#each lines as l, i (i)}
        <div class="line {l.kind}">{l.text || ' '}</div>
      {/each}
      <label class="input-line">
        <span class="prompt">{prompt}</span>
        <input
          bind:this={field}
          bind:value={input}
          onkeydown={onkey}
          spellcheck="false"
          autocomplete="off"
          autocapitalize="off"
          aria-label="Perintah"
        />
      </label>
    </div>
  </div>
</div>

<style>
  .layout {
    display: grid;
    grid-template-columns: minmax(260px, 340px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: sticky;
    top: calc(var(--header-h) + 16px);
  }

  .tasks {
    padding: 20px;
  }

  .tasks-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .tasks h2 {
    font-size: var(--type-h4);
  }

  .count {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .bar {
    margin-top: 10px;
    height: 3px;
    background: var(--line);
  }

  .bar span {
    display: block;
    height: 100%;
    background: var(--mint);
    transition: width var(--dur-ui) var(--ease);
  }

  ol {
    list-style: none;
    margin: 14px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  li {
    display: flex;
    gap: 10px;
    font-size: 14.5px;
    line-height: 1.45;
  }

  .mark {
    flex: none;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    font-size: 11.5px;
    font-weight: 600;
    border: 1px solid var(--line-strong);
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  li.ok .mark {
    background: var(--mint);
    border-color: var(--mint);
    color: #1a1a1a;
  }

  li.ok > span:last-child {
    color: var(--text-secondary);
  }

  .note {
    margin-top: 12px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .lesson {
    padding: 18px 20px;
    background: var(--mint-soft);
  }

  .lesson p:last-child {
    margin-top: 6px;
    font-size: 14.5px;
    line-height: 1.55;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .solution {
    gap: 4px;
    margin-top: 0;
  }

  .solution button {
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid var(--line);
    background: var(--surface);
    font-size: 12.5px;
    line-height: 1.45;
    word-break: break-all;
  }

  .solution button:hover {
    border-color: var(--ink);
  }

  /* The terminal stays dark in both themes, like Cloud Shell. */
  .term {
    --t-bg: #161614;
    --t-fg: #e9e6dd;
    --t-dim: #9c978d;
    background: var(--t-bg);
    color: var(--t-fg);
    border: 1px solid #000;
    min-width: 0;
    cursor: text;
  }

  :global(:root[data-theme='dark']) .term {
    border-color: var(--line-strong);
  }

  .term-bar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 9px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.18);
  }

  .title {
    margin-left: 8px;
    font-size: 12px;
    color: var(--t-dim);
  }

  .screen {
    height: min(68vh, 640px);
    min-height: 360px;
    overflow: auto;
    padding: 14px 14px 18px;
    font-size: 13px;
    line-height: 1.55;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
  }

  .line {
    white-space: pre-wrap;
    word-break: break-word;
  }

  /* Command output keeps its columns; the screen scrolls sideways instead of wrapping tables. */
  .line.out {
    white-space: pre;
    word-break: normal;
    width: max-content;
    min-width: 100%;
  }

  .line.cmd {
    color: var(--t-fg);
    margin-top: 6px;
  }

  .line.out {
    color: #d6d2c8;
  }

  .line.err {
    color: #ff8a80;
  }

  .line.warn {
    color: #e9b95a;
  }

  .line.info {
    color: var(--t-dim);
  }

  .line.ok {
    color: #56eaaf;
  }

  .input-line {
    display: flex;
    gap: 8px;
    margin-top: 6px;
    align-items: baseline;
  }

  .prompt {
    flex: none;
    color: #56eaaf;
    max-width: 55%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .input-line input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    padding: 0;
    background: transparent;
    color: var(--t-fg);
    font: inherit;
    caret-color: #56eaaf;
  }

  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .panel {
      position: static;
    }

    .screen {
      height: 62vh;
      font-size: 12.5px;
    }

    /* 16px stops iOS from zooming into the field. */
    .input-line input {
      font-size: 16px;
    }
  }
</style>
