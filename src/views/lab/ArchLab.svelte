<script lang="ts">
  import { untrack } from 'svelte';
  import LabHead from './LabHead.svelte';
  import { CATEGORIES, SERVICES, SERVICE_BY_ID, type Category } from '@/lab/arch/catalog';
  import { PASS_PERCENT, grade, type ArchScenario } from '@/lab/arch/scenarios';
  import { clearWork, loadWork, markDone, saveWork } from '@/lab/progress';

  let { sc }: { sc: ArchScenario } = $props();

  const empty = () => Object.fromEntries(sc.slots.map((s) => [s.id, null])) as Record<string, string | null>;

  // The lab view remounts per scenario, so reading the prop once is enough.
  let picks = $state<Record<string, string | null>>(untrack(() => ({ ...empty(), ...(loadWork<Record<string, string | null>>('arch', sc.id) ?? {}) })));
  let selected = $state<string | null>(null);
  let target = $state<string | null>(null);
  let checked = $state(false);
  let cat = $state<Category | 'all'>('all');
  let query = $state('');
  let over = $state<string | null>(null);
  let palette: HTMLElement | undefined = $state();

  const result = $derived(grade(sc, picks));
  const byId = $derived(Object.fromEntries(result.results.map((r) => [r.slot.id, r])));
  const filled = $derived(Object.values(picks).filter(Boolean).length);
  const passed = $derived(result.percent >= PASS_PERCENT);

  const needle = $derived(query.trim().toLowerCase());
  const shown = $derived(
    SERVICES.filter((s) => (cat === 'all' || s.category === cat) && (!needle || `${s.name} ${s.blurb}`.toLowerCase().includes(needle)))
  );
  const used = $derived(new Set(Object.values(picks).filter(Boolean)));

  function place(slotId: string, serviceId: string) {
    picks[slotId] = serviceId;
    checked = false;
    selected = null;
    target = null;
    saveWork('arch', sc.id, $state.snapshot(picks));
  }

  function clearSlot(slotId: string) {
    picks[slotId] = null;
    checked = false;
    saveWork('arch', sc.id, $state.snapshot(picks));
  }

  function tapSlot(slotId: string) {
    if (selected) return place(slotId, selected);
    target = target === slotId ? null : slotId;
    if (target && palette && window.matchMedia('(max-width: 1000px)').matches) palette.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function tapService(id: string) {
    if (target) return place(target, id);
    selected = selected === id ? null : id;
  }

  function check() {
    checked = true;
    target = null;
    selected = null;
    if (passed) markDone('arch', sc.id);
  }

  function reset() {
    picks = empty();
    checked = false;
    selected = null;
    target = null;
    clearWork('arch', sc.id);
  }

  function drop(e: DragEvent, slotId: string) {
    e.preventDefault();
    over = null;
    const id = e.dataTransfer?.getData('text/plain');
    if (id && SERVICE_BY_ID[id]) place(slotId, id);
  }
</script>

<LabHead {sc} mode="Skenario arsitektur" story={sc.story}>
  <ul class="reqs">
    {#each sc.requirements as r, i (r)}
      <li><span class="num">{String(i + 1).padStart(2, '0')}</span>{r}</li>
    {/each}
  </ul>
</LabHead>

<div class="layout">
  <section class="board-wrap" aria-label="Papan desain">
    <div class="board-head">
      <p class="hint">
        {#if selected}
          <strong>{SERVICE_BY_ID[selected].name}</strong> dipilih — klik kotak tujuan.
        {:else if target}
          Pilih layanan dari palet untuk kotak ini.
        {:else}
          Seret layanan ke kotak, atau klik layanan lalu klik kotaknya.
        {/if}
      </p>
      <span class="mono count">{filled}/{sc.slots.length} terisi</span>
    </div>

    <div class="board" style:--stages={sc.stages.length}>
      {#each sc.stages as st, si (st.id)}
        <div class="stage">
          <p class="eyebrow">{st.label}</p>
          {#each sc.slots.filter((s) => s.stage === st.id) as slot (slot.id)}
            {@const pick = picks[slot.id]}
            {@const r = byId[slot.id]}
            <div
              class="slot"
              class:filled={!!pick}
              class:over={over === slot.id}
              class:target={target === slot.id}
              class:armed={!!selected && !pick}
              data-verdict={checked ? r.verdict : undefined}
              role="group"
              aria-label={slot.label}
              ondragover={(e) => {
                e.preventDefault();
                over = slot.id;
              }}
              ondragleave={() => (over = over === slot.id ? null : over)}
              ondrop={(e) => drop(e, slot.id)}
            >
              <button class="slot-body" onclick={() => tapSlot(slot.id)}>
                <span class="slot-label">{slot.label}</span>
                <span class="slot-need">{slot.need}</span>
                {#if pick}
                  <span class="picked">{SERVICE_BY_ID[pick]?.name}</span>
                {:else}
                  <span class="drop">+ taruh layanan</span>
                {/if}
              </button>
              {#if pick}
                <button class="remove" onclick={() => clearSlot(slot.id)} aria-label={`Kosongkan ${slot.label}`}>×</button>
              {/if}
              {#if checked}
                <p class="verdict">
                  <strong>{r.verdict === 'best' ? '✓ Tepat' : r.verdict === 'ok' ? '◐ Bisa, tapi…' : r.verdict === 'empty' ? '○ Kosong' : '✗ Kurang tepat'}</strong>
                  {r.note}
                </p>
              {/if}
            </div>
          {/each}
        </div>
        {#if si < sc.stages.length - 1}<span class="arrow" aria-hidden="true">→</span>{/if}
      {/each}
    </div>

    <div class="grade-row">
      <button class="btn btn-primary" onclick={check} disabled={!filled}>Periksa desain</button>
      <button class="btn btn-ghost" onclick={reset}>Kosongkan</button>
      {#if checked}
        <p class="score" class:pass={passed}>
          <span class="mono">{result.points}/{result.max} poin · {result.percent}%</span>
          {passed ? 'Lulus — desainmu memenuhi kebutuhan kasus.' : `Butuh ${PASS_PERCENT}% untuk lulus. Baca catatan di tiap kotak, lalu perbaiki.`}
        </p>
      {/if}
    </div>
    {#if checked && passed}
      <div class="lesson card">
        <p class="eyebrow">Pelajaran</p>
        <p>{sc.lesson}</p>
      </div>
    {/if}
  </section>

  <aside class="palette" bind:this={palette} aria-label="Palet layanan">
    <label class="search">
      <span class="sr-only">Cari layanan</span>
      <input type="search" placeholder="Cari layanan atau kegunaan…" bind:value={query} />
    </label>
    <div class="cats" role="tablist" aria-label="Kategori">
      <button role="tab" aria-selected={cat === 'all'} class:on={cat === 'all'} onclick={() => (cat = 'all')}>Semua</button>
      {#each CATEGORIES as c (c.id)}
        <button role="tab" aria-selected={cat === c.id} class:on={cat === c.id} onclick={() => (cat = c.id)}>{c.label}</button>
      {/each}
    </div>
    <ul class="services">
      {#each shown as s (s.id)}
        <li>
          <button
            class="svc"
            class:sel={selected === s.id}
            class:used={used.has(s.id)}
            draggable="true"
            ondragstart={(e) => {
              e.dataTransfer?.setData('text/plain', s.id);
              selected = null;
            }}
            onclick={() => tapService(s.id)}
            title={s.blurb}
          >
            <strong>{s.name}</strong>
            <span>{s.blurb}</span>
          </button>
        </li>
      {:else}
        <li class="none">Tidak ada layanan yang cocok.</li>
      {/each}
    </ul>
  </aside>
</div>

<style>
  .reqs {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 6px 20px;
  }

  .reqs li {
    display: flex;
    gap: 10px;
    font-size: 14.5px;
    line-height: 1.45;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 320px;
    gap: 20px;
    align-items: start;
  }

  .board-head {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    align-items: baseline;
    margin-bottom: 12px;
  }

  .hint {
    font-size: 14px;
    color: var(--text-secondary);
  }

  .count {
    font-size: 13px;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .board {
    display: grid;
    grid-template-columns: repeat(var(--stages), minmax(0, 1fr));
    gap: 14px;
    padding: 18px;
    background: var(--stone);
    position: relative;
  }

  .stage {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .arrow {
    display: none;
  }

  .slot {
    position: relative;
    background: var(--surface);
    border: 1.5px dashed var(--line-strong);
    transition:
      border-color var(--dur-micro) var(--ease),
      background-color var(--dur-micro) var(--ease);
  }

  .slot.filled {
    border-style: solid;
    border-color: var(--ink);
  }

  .slot.over,
  .slot.target {
    border-color: var(--ink);
    background: var(--mint-soft);
  }

  .slot.armed {
    border-color: var(--ink);
  }

  .slot[data-verdict='best'] {
    border-color: var(--green);
    box-shadow: inset 3px 0 0 var(--mint);
  }

  .slot[data-verdict='ok'] {
    border-color: var(--amber);
  }

  .slot[data-verdict='wrong'],
  .slot[data-verdict='empty'] {
    border-color: var(--red);
  }

  .slot-body {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 12px 34px 12px 12px;
    border: 0;
    background: transparent;
    text-align: left;
  }

  .slot-label {
    font-weight: 600;
    font-size: 14.5px;
  }

  .slot-need {
    font-size: 12.5px;
    color: var(--text-tertiary);
    line-height: 1.4;
  }

  .picked {
    margin-top: 6px;
    padding: 4px 8px;
    background: var(--ink);
    color: var(--accent-text);
    font-size: 13px;
    font-weight: 600;
  }

  .drop {
    margin-top: 6px;
    font-size: 12.5px;
    color: var(--text-tertiary);
  }

  .remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 24px;
    height: 24px;
    border: 0;
    background: transparent;
    color: var(--text-tertiary);
    font-size: 18px;
    line-height: 1;
  }

  .remove:hover {
    color: var(--ink);
    background: var(--stone);
  }

  .verdict {
    padding: 0 12px 12px;
    font-size: 12.5px;
    line-height: 1.5;
    color: var(--text-strong-secondary);
  }

  .verdict strong {
    display: block;
    margin-bottom: 2px;
  }

  .slot[data-verdict='best'] .verdict strong {
    color: var(--green);
  }

  .slot[data-verdict='ok'] .verdict strong {
    color: var(--amber);
  }

  .slot[data-verdict='wrong'] .verdict strong,
  .slot[data-verdict='empty'] .verdict strong {
    color: var(--red);
  }

  .grade-row {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
  }

  .score {
    font-size: 14px;
    color: var(--red);
    display: flex;
    flex-wrap: wrap;
    gap: 4px 10px;
  }

  .score.pass {
    color: var(--green);
  }

  .score .mono {
    font-weight: 600;
  }

  .lesson {
    margin-top: 14px;
    padding: 18px 20px;
    background: var(--mint-soft);
  }

  .lesson p:last-child {
    margin-top: 6px;
    line-height: 1.55;
  }

  .palette {
    position: sticky;
    top: calc(var(--header-h) + 16px);
    max-height: calc(100vh - var(--header-h) - 32px);
    display: flex;
    flex-direction: column;
    gap: 10px;
    scroll-margin-top: calc(var(--header-h) + 12px);
  }

  .search input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
  }

  .search input:focus {
    outline: 2px solid var(--ink);
    outline-offset: -1px;
  }

  .cats {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .cats button {
    padding: 5px 9px;
    border: 1px solid var(--line);
    background: transparent;
    font-size: 12.5px;
    color: var(--text-secondary);
  }

  .cats button.on {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--accent-text);
  }

  .services {
    list-style: none;
    margin: 0;
    padding: 0 4px 0 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .svc {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 9px 11px;
    border: 1px solid var(--line);
    background: var(--surface);
    text-align: left;
    cursor: grab;
  }

  .svc:hover {
    border-color: var(--ink);
  }

  .svc.sel {
    border-color: var(--ink);
    background: var(--mint-soft);
  }

  .svc.used strong::after {
    content: ' ·  dipakai';
    font-weight: 500;
    color: var(--text-tertiary);
    font-size: 12px;
  }

  .svc strong {
    font-size: 14px;
  }

  .svc span {
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-tertiary);
  }

  .none {
    font-size: 14px;
    color: var(--text-tertiary);
    padding: 8px;
  }

  @media (max-width: 1000px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .palette {
      position: static;
      max-height: none;
    }

    .services {
      max-height: 60vh;
    }
  }

  @media (max-width: 720px) {
    .board {
      grid-template-columns: 1fr;
      padding: 12px;
    }
  }
</style>
