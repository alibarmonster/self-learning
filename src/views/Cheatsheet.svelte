<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import type {
    Cheatsheet,
    CheatsheetBullet,
    CheatsheetGroup,
    CheatsheetTable,
    CheatsheetTerm
  } from '@/types';

  /** A group with every optional block filled in, so the markup has one shape. */
  type Block = CheatsheetGroup & {
    path: NonNullable<CheatsheetGroup['path']>;
    bullets: CheatsheetBullet[];
    tables: CheatsheetTable[];
    terms: CheatsheetTerm[];
  };

  const exam = $derived(quiz.activeExam);
  // The router only opens this view for an exam that has a sheet.
  const current = $derived(exam.sheetById[quiz.sheetId] ?? exam.sheets[0]);
  const sheet: Cheatsheet = $derived(current?.sheet ?? { groups: [] });
  /** Glossary labels follow the sheet's language. */
  const labels = $derived(
    sheet.lang === 'id'
      ? { analogy: 'Analogi', example: 'Contoh', exam: 'Di soal ujian', tip: 'Tips ujian' }
      : { analogy: 'Analogy', example: 'Example', exam: 'In the exam', tip: 'Exam tip' }
  );

  let query = $state('');

  // A new sheet starts unfiltered.
  $effect(() => {
    void quiz.sheetId;
    query = '';
  });

  const needle = $derived(query.trim().toLowerCase());
  const hit = (text: string | undefined) => String(text ?? '').toLowerCase().includes(needle);

  /**
   * A group carries any of four kinds of block: a decision path, one table
   * (`columns`/`rows`), several captioned tables (`tables`), and a bullet list
   * whose entries are either a string or a [term, text] pair. `normalise`
   * folds the single table into the `tables` list so the markup has one shape
   * to render, and everything below counts lines the same way.
   */
  function normalise(g: CheatsheetGroup): Block {
    const tables: CheatsheetTable[] = [
      ...(g.columns && g.rows ? [{ caption: '', columns: g.columns, rows: g.rows }] : []),
      ...(g.tables ?? [])
    ];
    return { ...g, path: g.path ?? [], bullets: g.bullets ?? [], tables, terms: g.terms ?? [] };
  }

  const all = $derived(sheet.groups.map(normalise));

  const lineCount = (g: Block) =>
    g.path.length +
    g.bullets.length +
    g.terms.length +
    (g.figure ? 1 : 0) +
    g.tables.reduce((n, t) => n + t.rows.length, 0);

  const termHit = (t: CheatsheetTerm) =>
    hit(t.term) || hit(t.meaning) || hit(t.analogy) || hit(t.example) || hit(t.exam);

  /**
   * With a query, keep only the lines that mention it and drop groups left
   * with nothing. A hit on the title or note keeps the whole group, so
   * searching for a heading still shows what sits under it.
   */
  const groups = $derived(
    all
      .map((g): Block => {
        if (!needle) return g;
        if (hit(g.title) || hit(g.note) || hit(g.tip)) return g;
        return {
          ...g,
          figure: undefined,
          path: g.path.filter(([q, a]) => hit(q) || hit(a)),
          terms: g.terms.filter(termHit),
          bullets: g.bullets.filter((b) => (Array.isArray(b) ? b.some(hit) : hit(b))),
          tables: g.tables
            .map((t) => ({ ...t, rows: t.rows.filter((r) => r.some(hit)) }))
            .filter((t) => t.rows.length)
        };
      })
      .filter((g) => lineCount(g) > 0)
  );

  const total = $derived(all.reduce((n, g) => n + lineCount(g), 0));
  const shown = $derived(groups.reduce((n, g) => n + lineCount(g), 0));

  /** Parts in declared order, each with the groups still showing under it. */
  const parts = $derived(
    (sheet.parts ?? [{ id: 'all', title: '', blurb: '' }]).map((part) => ({
      ...part,
      groups: groups.filter((g) => (g.part ?? 'all') === part.id)
    }))
  );

  /** The number beside a heading is its position on the whole sheet. */
  const numberOf = $derived((id: string) => all.findIndex((g) => g.id === id) + 1);

  function jump(id: string) {
    document.getElementById(`cs-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
</script>

<div class="page wrap rise" lang={sheet.lang}>
  <header class="head">
    {#if exam.sheets.length > 1}
      <nav class="sheet-tabs" aria-label="Cheat sheets" lang="en">
        {#each exam.sheets as s (s.id)}
          <button
            class="sheet-tab"
            class:active={s.id === current?.id}
            aria-current={s.id === current?.id ? 'page' : undefined}
            onclick={() => quiz.openSheet(s.id)}
          >
            {s.label}
          </button>
        {/each}
      </nav>
    {/if}
    <p class="eyebrow">{exam.short} · {current?.label ?? 'Cheat sheet'}</p>
    <h1>{sheet.title ?? 'How to pick between the core services'}</h1>
    <p class="lede">{sheet.intro}</p>

    <div class="tools">
      <label class="search">
        <span class="sr-only">Filter the cheat sheet</span>
        <span class="glyph" aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder={sheet.filterHint ?? 'Filter — try “once a month”, “SQL”, “event”, “global”…'}
          bind:value={query}
        />
        {#if needle}
          <span class="count mono">{shown} of {total}</span>
        {/if}
      </label>
    </div>

    <nav class="jump" aria-label="Sections">
      {#each sheet.parts ?? [] as part (part.id)}
        <p class="jump-part">{part.title}</p>
        <div class="jump-row">
          {#each all.filter((g) => g.part === part.id) as g (g.id)}
            <button class="jump-btn" onclick={() => jump(g.id)}>
              <span class="num">{String(numberOf(g.id)).padStart(2, '0')}</span>
              {g.title}
            </button>
          {/each}
        </div>
      {/each}
    </nav>
  </header>

  {#if groups.length === 0}
    <div class="empty card">
      <p>Nothing on this sheet mentions “{query}”. Try a shorter word, or another sheet.</p>
    </div>
  {/if}

  {#snippet notes(list: CheatsheetBullet[])}
    <dl class="notes card">
      {#each list as b, i (i)}
        {#if Array.isArray(b)}
          <div class="note-row">
            <dt>{b[0]}</dt>
            <dd>{b[1]}</dd>
          </div>
        {:else}
          <div class="note-row plain"><dd>{b}</dd></div>
        {/if}
      {/each}
    </dl>
  {/snippet}

  {#each parts as part (part.id)}
    {#if part.groups.length}
      {#if part.title}
        <header class="part-head" id={`cs-part-${part.id}`}>
          <div class="rule"></div>
          <h2>{part.title}</h2>
          <p>{part.blurb}</p>
        </header>
      {/if}

      {#each part.groups as g (g.id)}
        <section class="group" id={`cs-${g.id}`}>
          <header class="group-head">
            <h3><span class="num">{String(numberOf(g.id)).padStart(2, '0')}</span>{g.title}</h3>
            <p>{g.note}</p>
          </header>

          {#if g.figure}
            <figure class="figure card">
              <!-- Figures are authored in the sheet data, never user input. -->
              {@html g.figure}
              {#if g.figureCaption}<figcaption>{g.figureCaption}</figcaption>{/if}
            </figure>
          {/if}

          {#if g.path.length}
            <ol class="path card">
              {#each g.path as [when, pick], i (when)}
                <li class:first={i === 0}>
                  <span class="when">{when}</span>
                  <span class="arrow" aria-hidden="true">→</span>
                  <span class="pick">{pick}</span>
                </li>
              {/each}
            </ol>
          {/if}

          {#if g.bullets.length && g.notesFirst}{@render notes(g.bullets)}{/if}

          {#each g.tables as t, ti (ti)}
            {#if t.caption}
              <p class="table-caption">{t.caption}</p>
            {/if}
            <div class="table-wrap card">
              <table class:mono-values={t.mono}>
                <thead>
                  <tr>
                    {#each t.columns as col (col)}
                      <th>{col}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody>
                  {#each t.rows as row (row[0])}
                    <tr>
                      {#each row as cell, ci (ci)}
                        {#if ci === 0}
                          <th scope="row">{cell}</th>
                        {:else}
                          <td>{cell}</td>
                        {/if}
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}

          {#if g.terms.length}
            <div class="terms">
              {#each g.terms as t (t.term)}
                <article class="term card">
                  <h4>{t.term}</h4>
                  <p class="meaning">{t.meaning}</p>
                  {#if t.analogy}
                    <p class="term-line"><span class="term-label">{labels.analogy}</span>{t.analogy}</p>
                  {/if}
                  {#if t.example}
                    <p class="term-line"><span class="term-label">{labels.example}</span>{t.example}</p>
                  {/if}
                  {#if t.exam}
                    <p class="term-line exam" lang="en"><span class="term-label">{labels.exam}</span>{t.exam}</p>
                  {/if}
                </article>
              {/each}
            </div>
          {/if}

          {#if g.bullets.length && !g.notesFirst}{@render notes(g.bullets)}{/if}

          {#if g.tip}
            <p class="tip"><span class="tip-label">{labels.tip}</span>{g.tip}</p>
          {/if}
        </section>
      {/each}
    {/if}
  {/each}

  <div class="cta">
    <button class="btn btn-primary lg" onclick={() => quiz.startFullTest()}>
      Sit the full exam
    </button>
    <button class="btn btn-ghost lg" onclick={() => (quiz.view = 'home')}>Back to start</button>
  </div>
</div>

<style>
  .wrap {
    padding-top: 52px;
    padding-bottom: 72px;
    max-width: 960px;
  }

  .head h1 {
    margin-top: 12px;
    font-size: var(--type-h1);
    letter-spacing: -0.3px;
  }

  .lede {
    margin-top: 16px;
    max-width: 680px;
    font-size: 16.5px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .tools {
    margin-top: 26px;
  }

  .search {
    display: flex;
    align-items: center;
    gap: 10px;
    max-width: 560px;
    padding: 0 14px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--surface);
    transition: border-color var(--dur-micro) var(--ease);
  }

  .search:focus-within {
    border-color: var(--ink);
    outline: 2px solid var(--ink);
    outline-offset: 2px;
  }

  .glyph {
    color: var(--text-tertiary);
    font-size: 16px;
  }

  .search input {
    flex: 1;
    min-width: 0;
    padding: 11px 0;
    border: none;
    background: none;
    font: inherit;
    font-size: 14.5px;
    color: var(--text);
    outline: none;
  }

  .search input::placeholder {
    color: var(--text-tertiary);
  }

  .search .count {
    font-size: var(--type-label);
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .jump {
    margin-top: 22px;
  }

  .jump-part {
    margin: 14px 0 7px;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .jump-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .jump-btn {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    padding: 5px 11px 5px 9px;
    border: 1px solid var(--line);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-size: 13px;
    color: var(--text-secondary);
    transition: border-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .jump-btn:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .empty {
    margin-top: 32px;
    padding: 36px;
    text-align: center;
    color: var(--text-secondary);
  }

  /* A part is a run of groups: decision tables, then reference, then technique. */
  .part-head {
    margin-top: 56px;
  }

  .part-head h2 {
    margin-top: 26px;
    font-size: var(--type-h2);
    letter-spacing: -0.3px;
  }

  .part-head p {
    margin-top: 8px;
    max-width: 680px;
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .group {
    margin-top: 40px;
  }

  .group-head {
    margin: 26px 0 16px;
  }

  .group-head h3 {
    display: flex;
    align-items: baseline;
    gap: 14px;
    font-size: var(--type-h4);
  }

  .group-head p {
    margin-top: 8px;
    max-width: 680px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* The decision path: read down, stop at the first match. */
  .path {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .path li {
    display: grid;
    grid-template-columns: minmax(0, 1.25fr) auto minmax(0, 1fr);
    align-items: baseline;
    gap: 14px;
    padding: 12px 18px;
    border-top: 1px solid var(--line);
    font-size: 14.5px;
    line-height: 1.5;
  }

  .path li.first {
    border-top: none;
  }

  .path .when {
    color: var(--text-secondary);
  }

  .path .arrow {
    font-family: var(--font);
    color: var(--text-tertiary);
  }

  .path .pick {
    font-weight: 600;
  }

  /* Definition-style notes: a term and its gloss, or a plain line. */
  .notes {
    margin: 0;
    padding: 0;
    overflow: hidden;
  }

  .note-row {
    display: grid;
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.6fr);
    gap: 14px;
    padding: 12px 18px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    line-height: 1.55;
  }

  .note-row.plain {
    grid-template-columns: 1fr;
  }

  .notes .note-row:first-child {
    border-top: none;
  }

  .note-row dt {
    font-weight: 600;
  }

  .note-row dd {
    margin: 0;
    color: var(--text-secondary);
  }

  .table-caption {
    margin: 20px 0 -2px;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  /* The one line worth carrying into the exam room. */
  .tip {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 10px;
    margin-top: 14px;
    padding: 13px 18px;
    border: 0;
    border-left: 4px solid var(--mint);
    border-radius: 0;
    background: var(--mint-soft);
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .tip-label {
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink);
  }

  /* Commands and other literal values read better in the mono face. */
  table.mono-values tbody td {
    font-family: var(--font-mono);
    font-size: 12.5px;
    color: var(--text);
  }

  .table-wrap {
    margin-top: 12px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    line-height: 1.5;
  }

  thead th {
    padding: 10px 16px;
    text-align: left;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    background: var(--bg-sunken);
    border-bottom: 1px solid var(--line);
    white-space: nowrap;
  }

  tbody th,
  tbody td {
    padding: 11px 16px;
    vertical-align: top;
    border-top: 1px solid var(--line);
    min-width: 150px;
  }

  tbody tr:first-child th,
  tbody tr:first-child td {
    border-top: none;
  }

  tbody th {
    text-align: left;
    font-weight: 600;
    white-space: nowrap;
  }

  tbody td {
    color: var(--text-secondary);
  }

  /* One tab per sheet: the exam's own, commands, concepts. */
  .sheet-tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 28px;
    padding: 4px;
    width: fit-content;
    max-width: 100%;
    background: var(--stone);
  }

  .sheet-tab {
    padding: 9px 16px;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: background-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .sheet-tab:hover {
    color: var(--ink);
  }

  .sheet-tab.active {
    background: var(--surface);
    color: var(--ink);
    box-shadow: inset 0 -2px 0 var(--mint);
  }

  .figure {
    margin: 0 0 12px;
    padding: 20px;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--ink);
  }

  .figure {
    overflow-x: auto;
  }

  /* Diagrams keep a readable size on phones and scroll sideways instead. */
  .figure :global(svg) {
    display: block;
    width: 100%;
    min-width: 520px;
    height: auto;
    max-height: 360px;
  }

  .figure figcaption {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  /* Glossary cards: term, meaning, then the supporting lines. */
  .terms {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
  }

  .term {
    padding: 20px;
  }

  .term h4 {
    font-size: var(--type-h4);
  }

  .meaning {
    margin-top: 8px;
    font-size: 15px;
    line-height: 1.55;
  }

  .term-line {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .term-label {
    display: block;
    margin-bottom: 2px;
    font-size: var(--type-label);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .term-line.exam {
    padding: 8px 12px;
    border-left: 3px solid var(--mint);
    background: var(--surface);
    color: var(--ink);
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 52px;
  }

  .lg {
    padding: 13px 26px;
    font-size: 15px;
  }

  @media (max-width: 640px) {
    .wrap {
      padding-top: 36px;
    }

    .path li,
    .note-row {
      grid-template-columns: 1fr;
      gap: 4px;
    }

    .path .arrow {
      display: none;
    }

    tbody th {
      white-space: normal;
    }
  }
</style>
