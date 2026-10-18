<script lang="ts">
  /**
   * Cloud Run autoscaling calculator: traffic, latency, concurrency and the
   * min/max instance settings in; instances, idle cost, overflow and database
   * connections out. Presets load the situations the lesson talks about.
   */
  import { untrack } from 'svelte';
  import { scalePlan, scaleProblem, SCALE_LIMITS } from '@/lessons/scaling';
  import type { ScaleInput } from '@/types';

  let { start, presets }: { start: ScaleInput; presets: { label: string; values: ScaleInput; note: string }[] } = $props();

  let v = $state<ScaleInput>(untrack(() => ({ ...start })));
  let note = $state('');
  let chosen = $state(-1);

  const problem = $derived(scaleProblem(v));
  const plan = $derived(problem ? null : scalePlan(v));
  const n = (x: number, digits = 0) => x.toLocaleString('id-ID', { maximumFractionDigits: digits });

  function load(i: number) {
    v = { ...presets[i].values };
    note = presets[i].note;
    chosen = i;
  }

  function touched() {
    chosen = -1;
    note = '';
  }

  const FIELDS: { key: keyof ScaleInput; label: string; unit: string }[] = [
    { key: 'rps', label: 'Traffic', unit: 'request/detik' },
    { key: 'latencyMs', label: 'Waktu per request', unit: 'ms' },
    { key: 'concurrency', label: 'Max concurrency', unit: 'request/instance' },
    { key: 'min', label: 'Min instances', unit: 'instance' },
    { key: 'max', label: 'Max instances', unit: 'instance' },
    { key: 'pool', label: 'Koneksi DB', unit: 'per instance' },
    { key: 'dbMax', label: 'Batas koneksi DB', unit: 'total' }
  ];

  /** At most this many squares are drawn; the rest is a count. */
  const SHOWN = 60;
  const uid = $props.id();
</script>

<div class="calc">
  <p class="calc-title">Kalkulator autoscaling</p>

  <div class="presets" role="group" aria-label="Situasi contoh">
    {#each presets as p, i (p.label)}
      <button class:on={chosen === i} aria-pressed={chosen === i} onclick={() => load(i)}>{p.label}</button>
    {/each}
  </div>

  <div class="fields">
    {#each FIELDS as f (f.key)}
      <label for={`${uid}-${f.key}`}>
        <span class="f-label">{f.label}</span>
        <input
          id={`${uid}-${f.key}`}
          class="mono"
          type="number"
          min={SCALE_LIMITS[f.key][0]}
          max={SCALE_LIMITS[f.key][1]}
          bind:value={v[f.key]}
          oninput={touched}
        />
        <span class="f-unit">{f.unit}</span>
      </label>
    {/each}
  </div>

  {#if note}<p class="msg note">{note}</p>{/if}

  {#if problem || !plan}
    <p class="msg warn">{problem}</p>
  {:else}
    <div class="fleet" role="img" aria-label={`${plan.active} instance melayani request, ${plan.idle} instance idle`}>
      {#each { length: Math.min(plan.running, SHOWN) } as _, k (k)}
        <span class="inst" class:idle={k >= plan.active}></span>
      {/each}
      {#if plan.running > SHOWN}<span class="more mono">+{n(plan.running - SHOWN)}</span>{/if}
      {#if plan.running === 0}<span class="none">tidak ada instance — scale to zero</span>{/if}
    </div>
    <p class="legend">
      <span class="sw" aria-hidden="true"></span>melayani request: {n(plan.active)}
      <span class="sw idle" aria-hidden="true"></span>idle karena min instances: {n(plan.idle)}
    </p>

    <dl class="facts">
      <div><dt>Request sedang diproses</dt><dd>{n(plan.inflight, 1)}</dd></div>
      <div><dt>Instance dibutuhkan</dt><dd>{n(plan.needed)}</dd></div>
      <div class="hl"><dt>Instance berjalan</dt><dd>{n(plan.running)}</dd></div>
      <div><dt>Kapasitas di max</dt><dd>{n(plan.capacityRps)} <small>req/s</small></dd></div>
      <div class:over={plan.dbOver}><dt>Koneksi database</dt><dd>{n(plan.connections)} <small>/ {n(v.dbMax)}</small></dd></div>
    </dl>

    {#if plan.overflowRps > 0}
      <p class="msg bad">
        Melebihi kapasitas sekitar <strong>{n(plan.overflowRps)} request/detik</strong>: max instances sudah tercapai, request menunggu di antrean lalu gagal
        dengan <span class="mono">429</span>. Naikkan max instances atau concurrency, atau percepat request.
      </p>
    {/if}
    {#if plan.dbOver}
      <p class="msg bad">
        {n(plan.running)} instance × {n(v.pool)} koneksi = <strong>{n(plan.connections)} koneksi</strong>, melebihi batas database {n(v.dbMax)}. Database mulai
        menolak (<span class="mono">too many connections</span>). Turunkan max instances, naikkan concurrency, atau kecilkan pool.
      </p>
    {/if}
    {#if plan.coldStart}
      <p class="msg warn">Tidak ada instance yang hidup. Request berikutnya menunggu container dinyalakan (cold start). Biayanya nol selama sepi.</p>
    {/if}
    {#if plan.idle > 0}
      <p class="msg warn">{n(plan.idle)} instance tetap hidup tanpa request karena min instances — tidak ada cold start, tapi tetap ditagih.</p>
    {/if}
    {#if plan.needed > 0 && plan.needed === plan.running && plan.overflowRps === 0 && plan.idle === 0 && !plan.dbOver}
      <p class="msg ok">Semua request tertampung. Cloud Run menambah dan mengurangi instance sendiri mengikuti traffic.</p>
    {/if}
  {/if}

  <p class="foot">
    Rumusnya: request sedang diproses = traffic × waktu per request (Little's law), lalu dibagi max concurrency. Angka ini batas bawah — Cloud Run juga menjaga
    CPU sekitar 60%, jadi biasanya menyalakan sedikit lebih banyak.
  </p>
</div>

<style>
  .calc {
    margin-top: 20px;
    padding: 18px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .calc-title {
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .presets {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .presets button {
    padding: 5px 10px;
    font-size: 13px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--text-secondary);
  }

  .presets button:hover {
    border-color: var(--ink);
    color: var(--text);
  }

  .presets button.on {
    background: var(--ink);
    border-color: var(--ink);
    color: var(--accent-text);
  }

  .fields {
    margin-top: 14px;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .fields label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .f-label {
    font-size: 12.5px;
    font-weight: 600;
  }

  .f-unit {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  input {
    width: 100%;
    min-width: 0;
    padding: 7px 10px;
    font-size: 15px;
    border: 1px solid var(--line-strong);
    border-radius: var(--radius-control);
    background: var(--bg);
    color: var(--text);
  }

  input:focus {
    outline: 2px solid var(--mint);
    outline-offset: 1px;
    border-color: var(--ink);
  }

  .fleet {
    margin-top: 18px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 3px;
    min-height: 22px;
  }

  .inst {
    width: 18px;
    height: 18px;
    background: var(--ink);
  }

  .inst.idle {
    background: var(--mint-soft);
    border: 1px solid var(--mint);
  }

  .more {
    margin-left: 6px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .none {
    font-size: 13.5px;
    color: var(--text-tertiary);
  }

  .legend {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 6px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .sw {
    width: 12px;
    height: 12px;
    background: var(--ink);
  }

  .sw.idle {
    margin-left: 10px;
    background: var(--mint-soft);
    border: 1px solid var(--mint);
  }

  .facts {
    margin: 14px 0 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 1px;
    background: var(--line);
    border: 1px solid var(--line);
  }

  .facts div {
    padding: 10px 12px;
    background: var(--surface);
  }

  .facts .hl {
    background: var(--mint-soft);
  }

  .facts .over {
    background: var(--red-soft);
  }

  dt {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  dd {
    margin: 4px 0 0;
    font-size: 18px;
    font-weight: 600;
  }

  dd small {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .msg {
    margin-top: 10px;
    padding: 9px 12px;
    font-size: 14px;
    line-height: 1.55;
  }

  .msg.note {
    border-left: 3px solid var(--ink);
    background: var(--bg-elevated);
  }

  .msg.warn {
    background: var(--amber-soft);
  }

  .msg.bad {
    background: var(--red-soft);
  }

  .msg.ok {
    background: var(--green-soft);
  }

  .foot {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  @media (max-width: 720px) {
    .fields {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .facts {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>
