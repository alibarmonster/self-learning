<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import { LAB_MODES, type LabMeta, type LabMode } from '@/lab/types';
  import { NET_BY_ID, NET_SCENARIOS } from '@/lab/net/scenarios';
  import { TERM_BY_ID, TERM_SCENARIOS } from '@/lab/term/scenarios';
  import { ARCH_BY_ID, ARCH_SCENARIOS } from '@/lab/arch/scenarios';
  import { CMD_BY_ID, CMD_LIST, MIX_SIZE } from '@/lab/cmd/bank';
  import { CANVAS_BY_ID, CANVAS_SCENARIOS } from '@/lab/canvas/scenarios';
  import { doneMap } from '@/lab/progress';
  import TerminalLab from './TerminalLab.svelte';
  import NetworkLab from './NetworkLab.svelte';
  import ArchLab from './ArchLab.svelte';
  import CmdQuiz from './CmdQuiz.svelte';
  import CanvasLab from './CanvasLab.svelte';

  const LISTS: Record<LabMode, LabMeta[]> = {
    cmd: CMD_LIST,
    terminal: TERM_SCENARIOS,
    network: NET_SCENARIOS,
    canvas: CANVAS_SCENARIOS,
    arch: ARCH_SCENARIOS
  };

  const exam = $derived(quiz.activeExam);
  const parts = $derived(quiz.labPath.split('/'));
  const mode = $derived(parts[0] as LabMode);
  const id = $derived(parts[1] ?? '');

  const term = $derived(mode === 'terminal' ? TERM_BY_ID[id] : undefined);
  const net = $derived(mode === 'network' ? NET_BY_ID[id] : undefined);
  const arch = $derived(mode === 'arch' ? ARCH_BY_ID[id] : undefined);
  const cmd = $derived(mode === 'cmd' ? CMD_BY_ID[id] : undefined);
  const canvas = $derived(mode === 'canvas' ? CANVAS_BY_ID[id] : undefined);
  const open = $derived(term ?? net ?? arch ?? cmd ?? canvas);

  // Re-read progress whenever the hub comes back into view.
  let done = $state(doneMap());
  $effect(() => {
    void quiz.labPath;
    done = doneMap();
  });

  const total = Object.values(LISTS).reduce((n, l) => n + l.filter((s) => s.id !== 'sandbox').length, 0);
  const finished = $derived(Object.keys(done).filter((k) => !k.endsWith('/sandbox')).length);

  // A stale or mistyped scenario link falls back to the hub.
  $effect(() => {
    if (quiz.labPath && !open) quiz.labPath = '';
  });

  const back = () => quiz.openLab();
</script>

{#if open}
  {#key quiz.labPath}
    <div class="scenario rise" class:wide={mode !== 'terminal' && mode !== 'cmd'} class:full={mode === 'canvas'} lang="id">
      <button class="btn btn-ghost crumb" onclick={back}><span aria-hidden="true">‹</span> Semua lab</button>
      {#if term}
        <TerminalLab sc={term} />
      {:else if net}
        <NetworkLab sc={net} />
      {:else if arch}
        <ArchLab sc={arch} />
      {:else if cmd}
        <CmdQuiz sc={cmd} />
      {:else if canvas}
        <CanvasLab sc={canvas} />
      {/if}
    </div>
  {/key}
{:else}
  <div class="page hub rise" lang="id">
    <header class="head">
      <p class="eyebrow">{exam.short} · Lab</p>
      <h1>Lab simulasi Google Cloud</h1>
      <p class="lede">
        Latihan tangan seperti Packet Tracer, tapi untuk Google Cloud — semuanya disimulasikan di browser. Tidak ada akun,
        biaya, atau resource sungguhan; salah ketik pun aman. Tiap skenario dicek otomatis dan menjelaskan kenapa sesuatu
        berhasil atau gagal.
      </p>
      <p class="progress mono">{finished} / {total} skenario selesai</p>
    </header>

    {#each LAB_MODES as m, mi (m.id)}
      <section class="mode" style:--i={mi}>
        <div class="mode-head">
          <span class="icon mono" aria-hidden="true">{m.icon}</span>
          <div>
            <h2>{m.title}</h2>
            <p>{m.blurb}</p>
          </div>
        </div>
        <ul class="cards">
          {#each LISTS[m.id] as s (s.id)}
            {@const isDone = !!done[`${m.id}/${s.id}`]}
            <li>
              <button class="card scenario-card" class:done={isDone} onclick={() => quiz.openLab(`${m.id}/${s.id}`)}>
                <span class="meta">
                  <span class="level" data-level={s.level}>{s.level}</span>
                  {#if m.id === 'cmd'}<span class="qcount mono">{CMD_BY_ID[s.id].items.length || MIX_SIZE} soal</span>{/if}
                  {#if isDone}<span class="tick">✓ Selesai</span>{/if}
                </span>
                <strong>{s.title}</strong>
                <span class="summary">{s.summary}</span>
                <span class="topics">
                  {#each s.topics as t (t)}<span>{t}</span>{/each}
                </span>
              </button>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </div>
{/if}

<style>
  .hub {
    padding-top: 52px;
    padding-bottom: 72px;
  }

  .head {
    max-width: 760px;
  }

  .head h1 {
    margin-top: 12px;
    font-size: var(--type-h1);
  }

  .lede {
    margin-top: 16px;
    font-size: 16.5px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .progress {
    margin-top: 18px;
    display: inline-block;
    padding: 6px 10px;
    background: var(--mint-soft);
    color: var(--ink);
    font-size: 13px;
  }

  .mode {
    margin-top: var(--space-block);
    animation: rise var(--dur-enter) var(--ease-enter) both;
    animation-delay: calc(var(--i, 0) * var(--stagger) + 120ms);
  }

  .mode-head {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    padding-bottom: 18px;
    border-bottom: 1px solid var(--line);
  }

  .icon {
    flex: none;
    width: 44px;
    height: 44px;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--ink);
    font-size: 15px;
    font-weight: 600;
  }

  .mode-head h2 {
    font-size: var(--type-h3);
  }

  .mode-head p {
    margin-top: 6px;
    max-width: 720px;
    color: var(--text-secondary);
    line-height: 1.55;
    font-size: 15px;
  }

  .cards {
    list-style: none;
    margin: 20px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
  }

  .scenario-card {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 20px;
    border: 1px solid transparent;
    text-align: left;
    transition:
      border-color var(--dur-micro) var(--ease),
      background-color var(--dur-micro) var(--ease);
  }

  .scenario-card:hover {
    border-color: var(--ink);
    background: var(--surface);
  }

  .scenario-card.done {
    box-shadow: inset 3px 0 0 var(--mint);
  }

  .scenario-card strong {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 21px;
    line-height: 1.2;
  }

  .summary {
    color: var(--text-secondary);
    font-size: 14.5px;
    line-height: 1.5;
  }

  .meta {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .level {
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 3px 7px;
    border: 1px solid var(--line-strong);
    color: var(--text-strong-secondary);
  }

  .level[data-level='Lanjut'] {
    border-color: var(--ink);
    color: var(--ink);
  }

  .qcount {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .tick {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--green);
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

  .scenario {
    max-width: 1120px;
    margin: 0 auto;
    padding: 20px var(--page-pad) 72px;
  }

  .scenario.wide {
    max-width: 1360px;
  }

  .scenario.full {
    max-width: 1680px;
  }

  .crumb {
    margin-left: -12px;
    font-size: 14px;
  }

  .crumb span {
    font-size: 18px;
    line-height: 1;
    margin-top: -2px;
  }
</style>
