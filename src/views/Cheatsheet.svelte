<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import type {
    Cheatsheet,
    CheatsheetBullet,
    CheatsheetGroup,
    CheatsheetTable
  } from '@/types';

  /** A group with every optional block filled in, so the markup has one shape. */
  type Block = CheatsheetGroup & {
    path: NonNullable<CheatsheetGroup['path']>;
    bullets: CheatsheetBullet[];
    tables: CheatsheetTable[];
  };

  const exam = $derived(quiz.activeExam);
  // The router only opens this view for an exam that has a sheet.
  const sheet: Cheatsheet = $derived(exam.cheatsheet ?? { groups: [] });

  let query = $state('');

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
    return { ...g, path: g.path ?? [], bullets: g.bullets ?? [], tables };
  }

  const all = $derived(sheet.groups.map(normalise));

  const lineCount = (g: Block) =>
    g.path.length + g.bullets.length + g.tables.reduce((n, t) => n + t.rows.length, 0);

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
          path: g.path.filter(([q, a]) => hit(q) || hit(a)),
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

<div class="page wrap rise">
  <header class="head">
    <p class="eyebrow">{exam.short} · Cheat sheet</p>
    <h1>{sheet.title ?? 'How to pick between the core services'}</h1>
    <p class="lede">{sheet.intro}</p>

    <div class="tools">
      <label class="search">
        <span class="sr-only">Filter the cheat sheet</span>
        <span class="glyph" aria-hidden="true">⌕</span>
        <input
          type="search"
          placeholder="Filter — try “once a month”, “SQL”, “event”, “global”…"
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
      <p>Nothing on the sheet mentions “{query}”. Try a product name or the access pattern in the question.</p>
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

          {#if g.bullets.length && !g.notesFirst}{@render notes(g.bullets)}{/if}

          {#if g.tip}
            <p class="tip"><span class="tip-label">Exam tip</span>{g.tip}</p>
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
    font-size: clamp(30px, 5vw, 44px);
    letter-spacing: -0.03em;
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
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    background: var(--bg-elevated);
    box-shadow: var(--shadow-sm);
    transition: border-color var(--dur-micro) var(--ease), box-shadow var(--dur-micro) var(--ease);
  }

  .search:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-soft);
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
    font-size: 11px;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .jump {
    margin-top: 22px;
  }

  .jump-part {
    margin: 14px 0 7px;
    font-family: var(--font-mono);
    font-size: 10.5px;
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
    border: 1px solid var(--border);
    border-radius: 6px;
    background: var(--bg-elevated);
    font-size: 12.5px;
    color: var(--text-secondary);
    transition: border-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .jump-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
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
    font-size: 27px;
    letter-spacing: -0.02em;
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
    font-size: 21px;
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
    font-family: var(--font-mono);
    color: var(--accent);
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
    font-family: var(--font-mono);
    font-size: 10.5px;
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
    border: 1px solid color-mix(in srgb, var(--accent) 30%, var(--border));
    border-radius: 10px;
    background: var(--accent-soft);
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .tip-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--accent);
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
    font-family: var(--font-mono);
    font-size: 10.5px;
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
