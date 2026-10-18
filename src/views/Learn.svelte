<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import { read, write } from '@/state/storage';
  import type { Lesson, LessonBlock, LessonMeta } from '@/types';
  import CidrCalc from './learn/CidrCalc.svelte';
  import FirewallDrill from './learn/FirewallDrill.svelte';
  import ScaleCalc from './learn/ScaleCalc.svelte';

  const exam = $derived(quiz.activeExam);
  const metas = $derived<LessonMeta[]>(exam.lessons ?? []);
  const meta = $derived(metas.find((m) => m.id === quiz.lessonId));

  let lesson = $state<Lesson | null>(null);
  let failed = $state(false);

  $effect(() => {
    const m = meta;
    lesson = null;
    failed = false;
    if (!m) return;
    m.load()
      .then((mod) => {
        if (quiz.lessonId === m.id) lesson = mod.lesson;
      })
      .catch(() => (failed = true));
  });

  // ── progress: sections read, quiz answers ─────────────────────────────
  const readKey = (id: string) => `ep-learn-read-v1:${id}`;
  const quizKey = (id: string) => `ep-learn-quiz-v1:${id}`;
  let readSet = $state<Record<string, true>>({});
  let picks = $state<Record<string, number>>({});
  let current = $state('');

  $effect(() => {
    if (!lesson) return;
    readSet = read<Record<string, true>>(readKey(lesson.id), {});
    picks = read<Record<string, number>>(quizKey(lesson.id), {});
  });

  const sections = $derived(lesson ? lesson.parts.flatMap((p) => p.sections) : []);
  const readCount = $derived(sections.filter((s) => readSet[s.id]).length);
  const quizzes = $derived(
    lesson ? lesson.parts.flatMap((p) => p.sections.flatMap((s) => s.blocks.map((b, i) => ({ b, key: `${s.id}:${i}` })).filter((x) => x.b.kind === 'quiz'))) : []
  );
  const quizRight = $derived(quizzes.filter(({ b, key }) => b.kind === 'quiz' && picks[key] === b.answer).length);
  const quizDone = $derived(quizzes.filter(({ key }) => picks[key] !== undefined).length);

  function markRead(id: string) {
    if (!lesson || readSet[id]) return;
    readSet = { ...readSet, [id]: true };
    write(readKey(lesson.id), readSet);
  }

  function pick(key: string, i: number) {
    if (!lesson || picks[key] !== undefined) return;
    picks = { ...picks, [key]: i };
    write(quizKey(lesson.id), picks);
  }

  function resetQuiz() {
    if (!lesson) return;
    picks = {};
    write(quizKey(lesson.id), picks);
  }

  /**
   * Marks a section read once its end has stayed in view for a moment (so
   * scrolling past it on the way somewhere else does not count), and tracks
   * the section being read for the table of contents.
   */
  function watch(node: HTMLElement, id: string) {
    const end = node.querySelector('.sec-end');
    let timer: ReturnType<typeof setTimeout> | undefined;
    const seen = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          clearTimeout(timer);
          if (e.isIntersecting) timer = setTimeout(() => markRead(id), 1500);
        }),
      { rootMargin: '0px 0px -10% 0px' }
    );
    const here = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (current = id)), { rootMargin: '-30% 0px -60% 0px' });
    if (end) seen.observe(end);
    here.observe(node);
    return {
      destroy() {
        clearTimeout(timer);
        seen.disconnect();
        here.disconnect();
      }
    };
  }

  function jump(id: string) {
    document.getElementById(`s-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    tocOpen = false;
  }
  let tocOpen = $state(false);

  // ── inline formatting: `code` and **bold**, everything else escaped ───
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const fmt = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const lineKind = (l: string) => (l.startsWith('$ ') ? 'cmd' : l.startsWith('# ') ? 'note' : 'out');
  const TONE: Record<string, string> = { analogy: 'Analogi', exam: 'Di soal ujian', tip: 'Tips', warn: 'Perhatikan' };
  const letter = (i: number) => String.fromCharCode(65 + i);

  const isQuiz = (b: LessonBlock): b is Extract<LessonBlock, { kind: 'quiz' }> => b.kind === 'quiz';
</script>

{#if !meta}
  <div class="page hub rise" lang="id">
    <header class="head">
      <p class="eyebrow">{exam.short} · Deep dive</p>
      <h1>Pelajaran mendalam</h1>
      <p class="lede">
        Cheat sheet berisi singkatan untuk mengingat. Halaman ini untuk memahami: satu layanan dibahas dari nol — konsep, komponen,
        perintah, cara membaca apa yang terjadi — lalu studi kasus dan soal cek pemahaman.
      </p>
    </header>
    <ul class="cards">
      {#each metas as m (m.id)}
        {@const done = Object.keys(read<Record<string, true>>(readKey(m.id), {})).length}
        <li>
          <button class="card lesson-card" onclick={() => quiz.openLesson(m.id)}>
            <span class="meta"><span class="level">{m.level}</span><span class="mins mono">±{m.minutes} menit</span>{#if done}<span class="tick">{done} bagian dibaca</span>{/if}</span>
            <strong>{m.title}</strong>
            <span class="summary">{m.summary}</span>
            <span class="topics">{#each m.topics as t (t)}<span>{t}</span>{/each}</span>
          </button>
        </li>
      {/each}
    </ul>
  </div>
{:else if failed}
  <p class="page loading">Pelajaran gagal dimuat. Muat ulang halaman.</p>
{:else if !lesson}
  <p class="page loading">Memuat pelajaran…</p>
{:else}
  <div class="page lesson rise" lang={lesson.lang}>
    <button class="btn btn-ghost crumb" onclick={() => quiz.openLesson()}><span aria-hidden="true">‹</span> Semua pelajaran</button>
    <header class="head">
      <p class="eyebrow">Deep dive · {meta.level} · ±{meta.minutes} menit</p>
      <h1 lang="en">{lesson.title}</h1>
      <p class="lede">{lesson.intro}</p>
      <div class="progress">
        <div class="bar" aria-hidden="true"><span style:width={`${(readCount / Math.max(1, sections.length)) * 100}%`}></span></div>
        <span class="mono">{readCount}/{sections.length} bagian dibaca{#if quizDone} · kuis {quizRight}/{quizzes.length} benar{/if}</span>
      </div>
    </header>

    <div class="layout">
      <nav class="toc" aria-label="Daftar isi">
        <button class="toc-toggle" onclick={() => (tocOpen = !tocOpen)} aria-expanded={tocOpen}>Daftar isi <span aria-hidden="true">{tocOpen ? '▴' : '▾'}</span></button>
        <div class="toc-body" class:open={tocOpen}>
          {#each lesson.parts as part, pi (part.id)}
            <p class="toc-part"><span class="mono">{pi + 1}</span> {part.title}</p>
            <ul>
              {#each part.sections as s (s.id)}
                <li>
                  <button class:current={current === s.id} class:read={readSet[s.id]} onclick={() => jump(s.id)}>
                    <span class="dot" aria-hidden="true">{readSet[s.id] ? '✓' : ''}</span>{s.title}
                  </button>
                </li>
              {/each}
            </ul>
          {/each}
          <p class="toc-part"><span class="mono">→</span> <button class="link" onclick={() => document.getElementById('practice')?.scrollIntoView({ behavior: 'smooth' })}>Latihan di lab</button></p>
        </div>
      </nav>

      <article class="content">
        {#each lesson.parts as part, pi (part.id)}
          <p class="part-label"><span class="mono">Bagian {pi + 1}</span> {part.title}</p>
          {#each part.sections as s (s.id)}
            <section id={`s-${s.id}`} class="sec" use:watch={s.id}>
              <h2>{s.title}</h2>
              {#if s.id === 'quiz' && quizzes.length}
                <p class="quiz-score mono">{quizDone}/{quizzes.length} dijawab · {quizRight} benar {#if quizDone}<button class="link" onclick={resetQuiz}>ulangi</button>{/if}</p>
              {/if}
              {#each s.blocks as b, bi (bi)}
                {#if b.kind === 'p'}
                  <p class="para">{@html fmt(b.text)}</p>
                {:else if b.kind === 'list'}
                  {#if b.ordered}
                    <ol class="list">{#each b.items as it, k (k)}<li>{@html fmt(it)}</li>{/each}</ol>
                  {:else}
                    <ul class="list">{#each b.items as it, k (k)}<li>{@html fmt(it)}</li>{/each}</ul>
                  {/if}
                {:else if b.kind === 'figure'}
                  <figure class="figure">
                    <!-- Figures are authored in the lesson data, never user input. -->
                    {@html b.svg}
                    <figcaption>{@html fmt(b.caption)}</figcaption>
                  </figure>
                {:else if b.kind === 'table'}
                  <div class="table-wrap">
                    <table>
                      {#if b.caption}<caption>{b.caption}</caption>{/if}
                      <thead><tr>{#each b.columns as c, k (k)}<th>{c}</th>{/each}</tr></thead>
                      <tbody>
                        {#each b.rows as r, ri (ri)}
                          <tr>{#each r as cell, ci (ci)}<td class:mono={b.mono?.includes(ci)}>{@html fmt(cell)}</td>{/each}</tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                {:else if b.kind === 'code'}
                  <div class="term">
                    {#if b.title}<p class="term-title">{b.title}</p>{/if}
                    <pre>{#each b.lines as l, k (k)}<span class={`ln ${lineKind(l)}`}>{#if lineKind(l) === 'cmd'}<span class="ps">$</span>{l.slice(1)}{:else}{l}{/if}</span>
{/each}</pre>
                  </div>
                {:else if b.kind === 'callout'}
                  <aside class={`callout ${b.tone}`}>
                    <p class="callout-title">{b.title ?? TONE[b.tone]}</p>
                    <p>{@html fmt(b.text)}</p>
                  </aside>
                {:else if b.kind === 'terms'}
                  <div class="terms">
                    {#each b.items as t (t.term)}
                      <article class="term-card">
                        <h3 lang="en">{t.term}</h3>
                        <p>{@html fmt(t.meaning)}</p>
                        {#if t.analogy}<p class="term-line"><span>Analogi</span>{@html fmt(t.analogy)}</p>{/if}
                        {#if t.example}<p class="term-line"><span>Contoh</span>{@html fmt(t.example)}</p>{/if}
                      </article>
                    {/each}
                  </div>
                {:else if b.kind === 'steps'}
                  <ol class="steps">
                    {#each b.items as st, k (k)}
                      <li>
                        <span class="step-n mono" aria-hidden="true">{k + 1}</span>
                        <div>
                          <p class="step-title">{st.title}</p>
                          <p>{@html fmt(st.text)}</p>
                          {#if st.code}<pre class="mini">{st.code.join('\n')}</pre>{/if}
                        </div>
                      </li>
                    {/each}
                  </ol>
                {:else if b.kind === 'case'}
                  <div class="case">
                    <p class="case-title">{b.title}</p>
                    <div class="case-row"><span class="case-label">Situasi</span><p>{@html fmt(b.situation)}</p></div>
                    {#if b.symptom}
                      <div class="case-row">
                        <span class="case-label">Gejala</span>
                        <pre class="mini">{#each b.symptom as l, k (k)}<span class={`ln ${lineKind(l)}`}>{l}</span>
{/each}</pre>
                      </div>
                    {/if}
                    <div class="case-row">
                      <span class="case-label">Diagnosa</span>
                      <ol class="list tight">{#each b.diagnose as d, k (k)}<li>{@html fmt(d)}</li>{/each}</ol>
                    </div>
                    <div class="case-row">
                      <span class="case-label">Perbaikan</span>
                      <pre class="mini">{#each b.fix as l, k (k)}<span class={`ln ${lineKind(l)}`}>{l}</span>
{/each}</pre>
                    </div>
                    <div class="case-row"><span class="case-label">Kenapa</span><p>{@html fmt(b.why)}</p></div>
                    {#if b.exam}<aside class="callout exam slim"><p class="callout-title">Di soal ujian</p><p>{@html fmt(b.exam)}</p></aside>{/if}
                  </div>
                {:else if b.kind === 'cidr'}
                  <CidrCalc value={b.value} note={b.note} />
                {:else if b.kind === 'firewall'}
                  <FirewallDrill title={b.title} vms={b.vms} rules={b.rules} packets={b.packets} after={b.after} store={`ep-learn-fw-v1:${lesson.id}:${s.id}:${bi}`} />
                {:else if b.kind === 'scaling'}
                  <ScaleCalc start={b.start} presets={b.presets} />
                {:else if isQuiz(b)}
                  {@const key = `${s.id}:${bi}`}
                  {@const chosen = picks[key]}
                  <div class="quiz">
                    <p class="q">{@html fmt(b.q)}</p>
                    <ul>
                      {#each b.options as o, oi (oi)}
                        <li>
                          <button
                            class="opt"
                            class:right={chosen !== undefined && oi === b.answer}
                            class:wrong={chosen === oi && oi !== b.answer}
                            disabled={chosen !== undefined}
                            onclick={() => pick(key, oi)}
                          >
                            <span class="letter mono">{letter(oi)}</span><span>{@html fmt(o)}</span>
                          </button>
                        </li>
                      {/each}
                    </ul>
                    {#if chosen !== undefined}
                      <p class="explain" class:ok={chosen === b.answer}><strong>{chosen === b.answer ? 'Benar.' : `Belum tepat — jawabannya ${letter(b.answer)}.`}</strong> {@html fmt(b.explain)}</p>
                    {/if}
                  </div>
                {/if}
              {/each}
              <span class="sec-end" aria-hidden="true"></span>
            </section>
          {/each}
        {/each}

        <section id="practice" class="sec practice">
          <h2>Latihan di lab</h2>
          <p class="para">Pahami dulu di sini, lalu latih tangan tanpa akun Google Cloud — semua disimulasikan di browser.</p>
          <ul class="links">
            {#each lesson.practice as l (l.href)}
              <li>
                <a class="card link-card" href={l.href}>
                  <strong>{l.label}</strong>
                  {#if l.note}<span>{l.note}</span>{/if}
                </a>
              </li>
            {/each}
          </ul>
        </section>
      </article>
    </div>
  </div>
{/if}

<style>
  .hub,
  .lesson {
    padding-top: 40px;
    padding-bottom: 72px;
  }

  .head {
    max-width: 780px;
  }

  .head h1 {
    margin-top: 12px;
    font-size: var(--type-h1);
    line-height: 1.1;
  }

  .lede {
    margin-top: 16px;
    font-size: 16.5px;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .crumb {
    margin-left: -12px;
    margin-bottom: 8px;
    font-size: 14px;
  }

  .progress {
    margin-top: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .bar {
    width: 160px;
    height: 4px;
    background: var(--line);
  }

  .bar span {
    display: block;
    height: 100%;
    background: var(--mint);
    transition: width var(--dur-ui) var(--ease);
  }

  /* hub */
  .cards {
    list-style: none;
    margin: 32px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 12px;
  }

  .lesson-card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 22px;
    text-align: left;
    border: 1px solid transparent;
  }

  .lesson-card:hover {
    border-color: var(--ink);
  }

  .lesson-card strong {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 23px;
    line-height: 1.2;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
    font-size: 12px;
  }

  .level {
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 3px 7px;
    border: 1px solid var(--line-strong);
  }

  .mins {
    color: var(--text-tertiary);
  }

  .tick {
    color: var(--green);
    font-weight: 600;
  }

  .summary {
    color: var(--text-secondary);
    font-size: 14.5px;
    line-height: 1.55;
  }

  .topics {
    margin-top: auto;
    padding-top: 6px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .topics span {
    font-size: 12px;
    padding: 2px 7px;
    background: var(--surface);
    color: var(--text-tertiary);
  }

  /* lesson layout */
  .layout {
    margin-top: 36px;
    display: grid;
    grid-template-columns: 250px minmax(0, 760px);
    gap: 48px;
    align-items: start;
  }

  .toc {
    position: sticky;
    top: calc(var(--header-h) + 20px);
    max-height: calc(100vh - var(--header-h) - 40px);
    overflow: auto;
    font-size: 13.5px;
  }

  .toc-toggle {
    display: none;
  }

  .toc-part {
    margin: 16px 0 6px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .toc-part:first-child {
    margin-top: 0;
  }

  .toc ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .toc li button {
    width: 100%;
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 4px 6px;
    border: 0;
    border-left: 2px solid transparent;
    background: none;
    text-align: left;
    line-height: 1.4;
    color: var(--text-secondary);
  }

  .toc li button:hover {
    color: var(--text);
  }

  .toc li button.current {
    border-left-color: var(--ink);
    color: var(--text);
    font-weight: 600;
  }

  .dot {
    flex: none;
    width: 14px;
    font-size: 11px;
    color: var(--green);
  }

  .link {
    border: 0;
    background: none;
    padding: 0;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
    font: inherit;
    text-transform: none;
    letter-spacing: 0;
  }

  /* content */
  .part-label {
    margin-top: 56px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
    font-size: 13px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .part-label:first-child {
    margin-top: 0;
  }

  .part-label .mono {
    margin-right: 8px;
    color: var(--text-tertiary);
  }

  .sec {
    scroll-margin-top: calc(var(--header-h) + 20px);
    padding-top: 28px;
  }

  .sec h2 {
    font-size: var(--type-h3);
    line-height: 1.2;
  }

  .sec-end {
    display: block;
    height: 1px;
  }

  .para {
    margin-top: 14px;
    font-size: 16px;
    line-height: 1.7;
  }

  .content :global(code) {
    font-family: var(--font-mono);
    font-size: 0.88em;
    padding: 1px 4px;
    background: var(--bg-sunken);
  }

  .list {
    margin: 12px 0 0;
    padding-left: 22px;
    font-size: 15.5px;
    line-height: 1.65;
  }

  .list li + li {
    margin-top: 6px;
  }

  .list.tight {
    margin-top: 0;
    font-size: 14.5px;
  }

  .figure {
    margin: 20px 0 0;
    padding: 18px;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--ink);
  }

  .figure :global(svg) {
    display: block;
    width: 100%;
    height: auto;
  }

  figcaption {
    margin-top: 12px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .table-wrap {
    margin-top: 18px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
    line-height: 1.5;
  }

  caption {
    text-align: left;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    padding-bottom: 8px;
  }

  th {
    text-align: left;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 8px 10px;
    border-bottom: 1px solid var(--line-strong);
    background: var(--bg-elevated);
  }

  td {
    vertical-align: top;
    padding: 9px 10px;
    border-bottom: 1px solid var(--line);
  }

  td.mono {
    font-family: var(--font-mono);
    font-size: 12.5px;
  }

  .term {
    margin-top: 18px;
    background: #161614;
    color: #e9e6dd;
    border: 1px solid #000;
  }

  .term-title {
    padding: 8px 14px;
    font-size: 12px;
    color: #9c978d;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .term pre,
  pre.mini {
    margin: 0;
    padding: 12px 14px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 12.5px;
    line-height: 1.6;
  }

  pre.mini {
    background: #161614;
    color: #e9e6dd;
    margin-top: 8px;
    white-space: pre;
  }

  .ln.cmd {
    color: #fff;
  }

  .ps {
    color: #56eaaf;
    margin-right: 0;
  }

  .ln.note {
    color: #9c978d;
  }

  .ln.out {
    color: #d6d2c8;
  }

  .callout {
    margin-top: 18px;
    padding: 14px 16px;
    border-left: 3px solid var(--line-strong);
    background: var(--bg-elevated);
    font-size: 15px;
    line-height: 1.6;
  }

  .callout-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
    margin-bottom: 4px;
  }

  .callout.exam {
    border-left-color: var(--mint);
    background: var(--mint-soft);
  }

  .callout.warn {
    border-left-color: var(--amber);
    background: var(--amber-soft);
  }

  .callout.analogy {
    border-left-color: var(--ink);
  }

  .callout.slim {
    margin-top: 12px;
    font-size: 14px;
  }

  .terms {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 10px;
  }

  .term-card {
    padding: 16px;
    border: 1px solid var(--line);
    background: var(--surface);
    font-size: 14.5px;
    line-height: 1.55;
  }

  .term-card h3 {
    font-size: 17px;
    margin-bottom: 6px;
  }

  .term-line {
    margin-top: 8px;
    color: var(--text-secondary);
  }

  .term-line span {
    display: block;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .steps {
    list-style: none;
    margin: 18px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .steps li {
    display: flex;
    gap: 14px;
    font-size: 15px;
    line-height: 1.6;
  }

  .step-n {
    flex: none;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    background: var(--mint);
    color: #1a1a1a;
    font-weight: 700;
    font-size: 13px;
  }

  .steps li > div {
    min-width: 0;
    flex: 1;
  }

  .step-title {
    font-weight: 600;
  }

  .case {
    margin-top: 18px;
    padding: 20px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .case-title {
    font-family: var(--font-display);
    font-size: 21px;
    line-height: 1.25;
  }

  .case-row {
    margin-top: 14px;
    display: grid;
    grid-template-columns: 96px minmax(0, 1fr);
    gap: 12px;
    font-size: 15px;
    line-height: 1.6;
  }

  .case-row pre.mini {
    margin-top: 0;
  }

  .case-label {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    padding-top: 3px;
  }

  .quiz-score {
    margin-top: 8px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .quiz {
    margin-top: 22px;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }

  .q {
    font-size: 16px;
    line-height: 1.6;
    font-weight: 600;
  }

  .quiz ul {
    list-style: none;
    margin: 10px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .opt {
    width: 100%;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 9px 12px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    text-align: left;
    font-size: 15px;
    line-height: 1.5;
  }

  .opt:not(:disabled):hover {
    border-color: var(--ink);
  }

  .opt:disabled {
    cursor: default;
  }

  .opt.right {
    border-color: var(--green);
    background: var(--green-soft);
  }

  .opt.wrong {
    border-color: var(--red);
    background: var(--red-soft);
  }

  .letter {
    flex: none;
    width: 20px;
    font-weight: 700;
    color: var(--text-tertiary);
  }

  .explain {
    margin-top: 10px;
    padding: 10px 12px;
    font-size: 14.5px;
    line-height: 1.6;
    background: var(--red-soft);
  }

  .explain.ok {
    background: var(--green-soft);
  }

  .practice .links {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 10px;
  }

  .link-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px;
    height: 100%;
    color: var(--text);
    text-decoration: none;
    border: 1px solid transparent;
  }

  .link-card:hover {
    border-color: var(--ink);
  }

  .link-card span {
    font-size: 13.5px;
    color: var(--text-secondary);
    line-height: 1.5;
  }

  @media (max-width: 980px) {
    .layout {
      grid-template-columns: minmax(0, 1fr);
      gap: 20px;
    }

    .toc {
      position: sticky;
      top: var(--header-h);
      z-index: 5;
      max-height: none;
      overflow: visible;
      background: var(--bg);
      border-bottom: 1px solid var(--line);
      margin: 0 calc(-1 * var(--page-pad));
      padding: 0 var(--page-pad);
    }

    .toc-toggle {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 12px 0;
      border: 0;
      background: none;
      font-weight: 600;
      font-size: 14px;
    }

    .toc-body {
      display: none;
      max-height: 60vh;
      overflow: auto;
      padding-bottom: 12px;
    }

    .toc-body.open {
      display: block;
    }

    .case-row {
      grid-template-columns: minmax(0, 1fr);
      gap: 4px;
    }

    .terms {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
