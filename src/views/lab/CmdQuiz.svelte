<script lang="ts">
  import { tick, untrack } from 'svelte';
  import LabHead from './LabHead.svelte';
  import { ALL_ITEMS, ITEM_BY_ID, MIX_ID, MIX_SIZE, SECTION_OF, type CmdSection } from '@/lab/cmd/bank';
  import { display, judge, shownAnswer, type CmdItem } from '@/lab/cmd/grade';
  import { completions, parseLine } from '@/lab/cmd/parse';
  import { newEnv, simulate, type QuizEnv } from '@/lab/cmd/outputs';
  import { clearWork, loadWork, markDone, saveWork } from '@/lab/progress';
  import { read, write } from '@/state/storage';

  let { sc }: { sc: CmdSection } = $props();

  type Kind = 'cmd' | 'out' | 'err' | 'warn' | 'info' | 'ok' | 'bad' | 'q' | 'qh' | 'ans';
  interface Line {
    kind: Kind;
    text: string;
  }
  /** first = right on the first try with no help; ok = right in the end. */
  type Status = 'open' | 'first' | 'ok' | 'shown' | 'skip';

  interface Saved {
    ids: string[];
    cur: number;
    status: Status[];
    tries: number[];
    helped: boolean[];
    lines: Line[];
    history: string[];
    env: QuizEnv;
  }

  const BEST_KEY = 'ep-lab-cmd-best-v1';
  const MAX_LINES = 900;

  const shuffle = <T,>(xs: T[]): T[] => {
    const a = [...xs];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const start = untrack(() => sc);
  const isMix = start.id === MIX_ID;
  const freshIds = (random = false) => (isMix ? shuffle(ALL_ITEMS).slice(0, MIX_SIZE).map((i) => i.id) : (random ? shuffle(start.items) : start.items).map((i) => i.id));

  const saved = loadWork<Saved>('cmd', start.id);
  const valid = saved && saved.ids.every((id) => ITEM_BY_ID[id]);
  const firstIds = valid ? saved!.ids : freshIds();
  let ids = $state<string[]>(firstIds);
  let cur = $state(valid ? saved!.cur : 0);
  let status = $state<Status[]>(valid ? saved!.status : firstIds.map(() => 'open'));
  let tries = $state<number[]>(valid ? saved!.tries : firstIds.map(() => 0));
  let helped = $state<boolean[]>(valid ? saved!.helped : firstIds.map(() => false));
  let env = $state<QuizEnv>(valid ? saved!.env : newEnv());
  let lines = $state<Line[]>(valid ? saved!.lines : []);
  let history = $state<string[]>(valid ? saved!.history : []);
  let input = $state('');
  let cursor = $state(-1);

  let screen: HTMLDivElement | undefined = $state();
  let field: HTMLInputElement | undefined = $state();

  const items = $derived(ids.map((id) => ITEM_BY_ID[id]));
  const item = $derived<CmdItem | undefined>(items[cur]);
  const answered = $derived(status.filter((s) => s !== 'open').length);
  const right = $derived(status.filter((s) => s === 'first' || s === 'ok').length);
  const firstTry = $derived(status.filter((s) => s === 'first').length);
  const finished = $derived(status.every((s) => s !== 'open'));
  const prompt = $derived(`student@cloudshell:~ (${env.project})$`);
  const missed = $derived(ids.filter((_, i) => status[i] !== 'first' && status[i] !== 'ok'));

  const best = $state(read<Record<string, { right: number; first: number; total: number; at: number }>>(BEST_KEY, {}));
  const myBest = $derived(best[start.id]);

  function push(...more: Line[]) {
    lines = [...lines, ...more].slice(-MAX_LINES);
  }

  function persist() {
    saveWork('cmd', sc.id, {
      ids: $state.snapshot(ids),
      cur,
      status: $state.snapshot(status),
      tries: $state.snapshot(tries),
      helped: $state.snapshot(helped),
      lines: $state.snapshot(lines),
      history: $state.snapshot(history),
      env: $state.snapshot(env)
    });
  }

  async function scrollDown() {
    await tick();
    if (screen) screen.scrollTop = screen.scrollHeight;
  }

  function sectionTitle(it: CmdItem) {
    return isMix ? SECTION_OF[it.id]?.title ?? '' : sc.title;
  }

  function showQuestion() {
    const it = items[cur];
    if (!it) return;
    push(
      { kind: 'out', text: '' },
      { kind: 'qh', text: `── Soal ${cur + 1}/${ids.length} · ${sectionTitle(it)} ` },
      { kind: 'q', text: `# ${it.prompt}` }
    );
  }

  function welcome(): Line[] {
    return [
      { kind: 'info', text: 'Welcome to Cloud Shell — kuis perintah (simulasi, tidak ada resource sungguhan).' },
      { kind: 'info', text: 'Ketik perintah yang menjawab soal. Bantuan: petunjuk · jawaban · lewati · soal · help' },
      { kind: 'info', text: 'Tab melengkapi perintah dan flag · ↑/↓ riwayat · Ctrl+L bersihkan layar.' }
    ];
  }

  function begin() {
    lines = welcome();
    showQuestion();
  }

  if (!valid) begin();

  function nextOpen(from: number): number {
    for (let k = 1; k <= ids.length; k++) {
      const i = (from + k) % ids.length;
      if (status[i] === 'open') return i;
    }
    return -1;
  }

  function advance() {
    const n = nextOpen(cur);
    if (n < 0) {
      summary();
      return;
    }
    cur = n;
    showQuestion();
  }

  function summary() {
    const total = ids.length;
    push(
      { kind: 'out', text: '' },
      { kind: 'qh', text: '── Selesai ' },
      { kind: right === total ? 'ok' : 'info', text: `${right}/${total} benar · ${firstTry} langsung benar tanpa bantuan · ${status.filter((s) => s === 'shown').length} dilihat jawabannya · ${status.filter((s) => s === 'skip').length} dilewati` }
    );
    if (missed.length) push({ kind: 'info', text: 'Tekan "Ulangi yang belum benar" di panel untuk mengerjakan ulang sisanya.' });
    const prev = best[start.id];
    if (!prev || right > prev.right || (right === prev.right && firstTry > prev.first)) {
      best[start.id] = { right, first: firstTry, total, at: Date.now() };
      write(BEST_KEY, $state.snapshot(best));
    }
    if (right === total) markDone('cmd', sc.id);
  }

  function reveal(it: CmdItem): Line[] {
    const alts = it.answers.slice(1).map(display);
    return [
      { kind: 'ans', text: `  ${shownAnswer(it)}` },
      ...(alts.length ? [{ kind: 'info' as const, text: `Juga benar: ${alts.join('  ·  ')}` }] : []),
      { kind: 'info', text: it.explain }
    ];
  }

  function giveHint() {
    const it = item;
    if (!it || status[cur] !== 'open') return push({ kind: 'warn', text: 'Tidak ada soal yang sedang dikerjakan.' });
    // First hint: the tool and group. Asking again reveals about half the command.
    const again = helped[cur];
    helped[cur] = true;
    const a = shownAnswer(it).split(/\s+/);
    const shown = again ? Math.min(a.length - 1, Math.max(3, Math.ceil(a.length / 2))) : Math.min(2, a.length - 1);
    push({ kind: 'warn', text: `Petunjuk: ${it.hint && !again ? it.hint + ' ' : ''}Diawali dengan \`${a.slice(0, Math.max(1, shown)).join(' ')} …\`` });
  }

  function showAnswer() {
    const it = item;
    if (!it || status[cur] !== 'open') return push({ kind: 'warn', text: 'Tidak ada soal yang sedang dikerjakan.' });
    status[cur] = 'shown';
    push({ kind: 'warn', text: 'Jawaban:' }, ...reveal(it));
    advance();
  }

  function skip() {
    if (!item || status[cur] !== 'open') return push({ kind: 'warn', text: 'Tidak ada soal yang sedang dikerjakan.' });
    status[cur] = 'skip';
    push({ kind: 'info', text: 'Dilewati — klik soalnya di panel untuk mencoba lagi nanti.' });
    advance();
  }

  function restart(which: 'all' | 'random' | 'missed') {
    const next = which === 'missed' && missed.length ? missed : which === 'random' ? freshIds(true) : freshIds();
    ids = next;
    cur = 0;
    status = next.map(() => 'open');
    tries = next.map(() => 0);
    helped = next.map(() => false);
    env = newEnv();
    history = [];
    clearWork('cmd', sc.id);
    begin();
    persist();
    scrollDown();
    field?.focus();
  }

  function goto(i: number) {
    if (status[i] !== 'open') {
      // Reopen a skipped or revealed question for another go.
      if (status[i] === 'skip' || status[i] === 'shown') status[i] = 'open';
      else {
        push({ kind: 'info', text: `Soal ${i + 1} sudah benar:` }, ...reveal(items[i]));
        persist();
        scrollDown();
        return;
      }
    }
    cur = i;
    showQuestion();
    persist();
    scrollDown();
    field?.focus();
  }

  function grade(line: string) {
    const it = item;
    const r = parseLine(line);
    if (!r) return;
    if (r.ok) {
      for (const w of r.warnings) push({ kind: 'warn', text: w });
      for (const t of simulate(r.p, env)) push({ kind: 'out', text: t });
    } else for (const t of r.lines) push({ kind: 'err', text: t });
    for (const n of r.notes) push({ kind: 'info', text: `Catatan: ${n}` });
    if (!it || status[cur] !== 'open') {
      if (finished) push({ kind: 'info', text: 'Semua soal sudah dijawab. Pilih "Ulangi" di panel untuk mulai lagi.' });
      return;
    }
    const v = judge(it, line, r);
    if (v.correct) {
      status[cur] = tries[cur] === 0 && !helped[cur] ? 'first' : 'ok';
      push({ kind: 'ok', text: `✓ Benar${status[cur] === 'first' ? '' : ' (setelah percobaan ulang)'}.` });
      if (v.extra.length) push({ kind: 'info', text: `Flag tambahan ${v.extra.join(', ')} tidak wajib untuk soal ini, tapi tidak salah.` });
      const shown = shownAnswer(it);
      if (shown !== line.trim()) push({ kind: 'info', text: `Bentuk baku: ${shown}` });
      const alts = it.answers.slice(1).map(display).filter((a) => a !== line.trim());
      if (alts.length) push({ kind: 'info', text: `Juga benar: ${alts.join('  ·  ')}` });
      push({ kind: 'info', text: it.explain });
      advance();
    } else {
      tries[cur] += 1;
      push({ kind: 'bad', text: '✗ Belum tepat.' });
      for (const f of v.feedback) push({ kind: 'warn', text: f });
      if (tries[cur] >= 2) push({ kind: 'info', text: 'Butuh bantuan? Ketik petunjuk, atau jawaban untuk melihat jawabannya.' });
    }
  }

  function exec(raw: string) {
    const line = raw.trim();
    push({ kind: 'cmd', text: `${prompt} ${raw}` });
    if (line) history = [...history.filter((h) => h !== line), line].slice(-100);
    cursor = -1;
    switch (line.toLowerCase()) {
      case '':
        break;
      case 'clear':
        lines = [];
        break;
      case 'help':
      case 'bantuan':
        push(
          { kind: 'out', text: 'Kuis perintah — jawab tiap soal dengan mengetik perintahnya.' },
          { kind: 'out', text: '' },
          { kind: 'out', text: '  petunjuk   awal perintahnya (dipakai = tidak dihitung "langsung benar")' },
          { kind: 'out', text: '  jawaban    tampilkan jawaban dan penjelasannya, lalu lanjut' },
          { kind: 'out', text: '  lewati     lewati dulu, kembali lewat panel' },
          { kind: 'out', text: '  soal       tampilkan lagi soal yang sedang dikerjakan' },
          { kind: 'out', text: '  history    perintah yang sudah diketik · clear  bersihkan layar' },
          { kind: 'out', text: '' },
          { kind: 'out', text: 'Urutan flag bebas; --flag=nilai dan --flag nilai sama saja; alias seperti -q, -n, po, svc diterima.' },
          { kind: 'out', text: 'Perintah dinilai dari maknanya — gsutil dan gcloud storage sama-sama dihitung bila setara.' }
        );
        break;
      case 'hint':
      case 'petunjuk':
        giveHint();
        break;
      case 'answer':
      case 'jawaban':
        showAnswer();
        break;
      case 'skip':
      case 'lewati':
        skip();
        break;
      case 'soal':
      case 'question':
        if (item && status[cur] === 'open') showQuestion();
        else push({ kind: 'info', text: 'Tidak ada soal yang sedang dikerjakan.' });
        break;
      case 'history':
        push(...history.map((h, i) => ({ kind: 'out' as const, text: `${String(i + 1).padStart(4)}  ${h}` })));
        break;
      default:
        grade(line);
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
      const r = completions(input);
      input = r.line;
      if (r.options.length > 1) {
        push({ kind: 'cmd', text: `${prompt} ${input}` }, { kind: 'info', text: r.options.slice(0, 60).join('    ') });
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

  /** `code` spans in a question line. */
  const parts = (t: string) => t.split(/(`[^`]+`)/g).map((s) => ({ code: s.startsWith('`') && s.endsWith('`') && s.length > 1, s: s.replace(/^`|`$/g, '') }));

  const MARK: Record<Status, string> = { open: '', first: '✓', ok: '✓', shown: '!', skip: '–' };

  $effect(() => {
    scrollDown();
  });
</script>

<LabHead {sc} mode="Kuis perintah" story={sc.summary} />

<div class="layout">
  <aside class="panel">
    <div class="card situ">
      <p class="eyebrow">Situasi</p>
      <p>
        {#each parts(sc.intro) as part, i (i)}{#if part.code}<code>{part.s}</code>{:else}{part.s}{/if}{/each}
      </p>
    </div>

    <div class="card tasks">
      <div class="tasks-head">
        <h2>Soal</h2>
        <span class="count mono">{right}/{ids.length} benar</span>
      </div>
      <div class="bar" aria-hidden="true"><span style:width={`${(answered / ids.length) * 100}%`}></span></div>
      {#if myBest}
        <p class="note">Terbaik: {myBest.right}/{myBest.total} benar, {myBest.first} langsung.</p>
      {/if}
      <ol>
        {#each items as it, i (it.id)}
          <li>
            <button class="q" class:active={i === cur && status[i] === 'open'} data-status={status[i]} onclick={() => goto(i)}>
              <span class="mark mono" aria-hidden="true">{MARK[status[i]] || i + 1}</span>
              <span class="label">
                {#each parts(it.prompt) as part, k (k)}{#if part.code}<code>{part.s}</code>{:else}{part.s}{/if}{/each}
              </span>
            </button>
          </li>
        {/each}
      </ol>
    </div>

    <div class="actions">
      <button class="btn btn-secondary sm" onclick={() => exec('petunjuk')}>Petunjuk</button>
      <button class="btn btn-ghost sm" onclick={() => exec('jawaban')}>Lihat jawaban</button>
      <button class="btn btn-ghost sm" onclick={() => exec('lewati')}>Lewati</button>
    </div>
    <div class="actions">
      {#if finished && missed.length}
        <button class="btn btn-secondary sm" onclick={() => restart('missed')}>Ulangi yang belum benar ({missed.length})</button>
      {/if}
      <button class="btn btn-ghost sm" onclick={() => restart('all')}>{isMix ? 'Ambil soal baru' : 'Ulangi dari awal'}</button>
      {#if !isMix}<button class="btn btn-ghost sm" onclick={() => restart('random')}>Ulangi acak</button>{/if}
    </div>
    <p class="note">✓ benar · ! jawaban dilihat · – dilewati. Klik soal yang dilewati untuk mencobanya lagi.</p>
  </aside>

  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="term" onclick={focusField}>
    <div class="term-bar" aria-hidden="true">
      <span class="dot"></span><span class="dot"></span><span class="dot"></span>
      <span class="title mono">Cloud Shell · {env.project} · kuis {answered}/{ids.length}</span>
    </div>
    <div class="screen mono" bind:this={screen} role="log" aria-live="polite" aria-label="Output terminal">
      {#each lines as l, i (i)}
        {#if l.kind === 'q'}
          <div class="line q">{#each parts(l.text) as part, k (k)}{#if part.code}<span class="qcode">{part.s}</span>{:else}{part.s}{/if}{/each}</div>
        {:else}
          <div class="line {l.kind}">{l.text || ' '}</div>
        {/if}
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
    grid-template-columns: minmax(270px, 360px) minmax(0, 1fr);
    gap: 20px;
    align-items: start;
  }

  .panel {
    display: flex;
    flex-direction: column;
    gap: 12px;
    position: sticky;
    top: calc(var(--header-h) + 16px);
  }

  .situ {
    padding: 16px 18px;
    background: var(--mint-soft);
  }

  .situ p:last-child {
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.55;
  }

  code {
    font-family: var(--font-mono);
    font-size: 0.9em;
    padding: 0 3px;
    background: var(--surface);
  }

  .tasks {
    padding: 18px 16px 12px;
  }

  .tasks-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 0 4px;
  }

  .tasks h2 {
    font-size: var(--type-h4);
  }

  .count {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .bar {
    margin: 10px 4px 0;
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
    margin: 10px 0 0;
    padding: 0;
    max-height: min(46vh, 460px);
    overflow: auto;
  }

  .q {
    width: 100%;
    display: flex;
    gap: 9px;
    padding: 6px 4px;
    text-align: left;
    font-size: 13.5px;
    line-height: 1.4;
    color: var(--text);
    background: transparent;
    border: 0;
    border-left: 2px solid transparent;
  }

  .q:hover {
    background: var(--surface-hover);
  }

  .q.active {
    border-left-color: var(--ink);
    background: var(--surface);
  }

  .q code {
    background: var(--bg-sunken);
  }

  .mark {
    flex: none;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 600;
    border: 1px solid var(--line-strong);
    color: var(--text-tertiary);
  }

  .q[data-status='first'] .mark,
  .q[data-status='ok'] .mark {
    background: var(--mint);
    border-color: var(--mint);
    color: #1a1a1a;
  }

  .q[data-status='shown'] .mark {
    border-color: var(--amber);
    color: var(--amber);
  }

  .q[data-status='first'] .label,
  .q[data-status='ok'] .label {
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .note {
    margin-top: 6px;
    padding: 0 4px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text-tertiary);
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
    height: min(72vh, 700px);
    min-height: 380px;
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

  .line.out,
  .line.err {
    white-space: pre;
    word-break: normal;
    width: max-content;
    min-width: 100%;
  }

  .line.cmd {
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
    font-weight: 600;
  }

  .line.bad {
    color: #ff8a80;
    font-weight: 600;
  }

  .line.qh {
    color: #56eaaf;
    margin-top: 4px;
  }

  .line.q {
    color: #fff;
    font-weight: 600;
    padding: 6px 10px;
    margin: 4px 0 2px;
    border-left: 3px solid #56eaaf;
    background: rgba(86, 234, 175, 0.08);
  }

  .qcode {
    color: #56eaaf;
  }

  .line.ans {
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
      order: 2;
    }

    ol {
      max-height: 260px;
    }

    .screen {
      height: 64vh;
      font-size: 12.5px;
    }

    /* 16px stops iOS from zooming into the field. */
    .input-line input {
      font-size: 16px;
    }
  }
</style>
