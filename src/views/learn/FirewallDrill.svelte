<script lang="ts">
  /**
   * A firewall reading exercise: the VMs, the rules in evaluation order, and a
   * list of connections to call allow or deny. Each answer is checked by the
   * same evaluator the lesson check uses, and shows the rule that decided it
   * plus the full trace.
   */
  import { untrack } from 'svelte';
  import { byPriority, evaluate, type FwVerdict } from '@/lessons/net';
  import { read, write } from '@/state/storage';
  import type { FwPacket, FwRule, FwVm } from '@/types';

  let {
    title,
    vms,
    rules,
    packets,
    after,
    store
  }: { title: string; vms: FwVm[]; rules: FwRule[]; packets: FwPacket[]; after?: string; store: string } = $props();

  type Call = 'allow' | 'deny';
  let calls = $state<Record<number, Call>>(untrack(() => read<Record<number, Call>>(store, {})));
  let open = $state<number | null>(null);

  const sorted = $derived([...rules].sort(byPriority));
  const verdicts = $derived(packets.map((p) => evaluate(vms, rules, p)));
  const answered = $derived(packets.filter((_, i) => calls[i]).length);
  const right = $derived(packets.filter((_, i) => calls[i] === verdicts[i].action).length);
  const lit = $derived(open !== null && calls[open] ? verdicts[open].rule : null);

  const IMPLIED = [
    { name: 'implied deny ingress (65535)', direction: 'INGRESS', action: 'deny' },
    { name: 'implied allow egress (65535)', direction: 'EGRESS', action: 'allow' }
  ] as const;

  function call(i: number, c: Call) {
    if (calls[i]) return;
    calls = { ...calls, [i]: c };
    write(store, calls);
    open = i;
  }

  function reset() {
    calls = {};
    write(store, calls);
    open = null;
  }

  const short = (sa: string) => sa.split('@')[0];
  const target = (r: FwRule) => (r.targetSa ? `SA ${short(r.targetSa)}` : r.targetTags?.length ? `tag ${r.targetTags.join(', ')}` : 'semua VM');
  const peerOf = (r: FwRule) =>
    r.direction === 'INGRESS'
      ? [...(r.sources ?? []), ...(r.sourceTags ?? []).map((t) => `tag ${t}`)].join(', ') || '0.0.0.0/0'
      : (r.destinations ?? []).join(', ') || '0.0.0.0/0';
  const port = (p: FwPacket) => (p.proto === 'icmp' ? 'icmp' : `${p.proto}:${p.port}`);
  const label = (name: string) => {
    const v = vms.find((x) => x.name === name);
    return v ? `${name} (${v.ip})` : name;
  };

  /** How a rule's line in the trace reads, given which rule won. */
  function stepNote(v: FwVerdict, s: FwVerdict['steps'][number]) {
    if (!s.match) return s.why;
    if (s.rule === v.rule) return 'cocok → dipakai';
    const win = v.steps.find((x) => x.rule === v.rule)!;
    return win.priority === s.priority ? 'cocok, tapi seri — deny menang' : 'cocok, tapi kalah priority';
  }

  const tie = (v: FwVerdict) => {
    if (v.implied) return false;
    const win = v.steps.find((x) => x.rule === v.rule)!;
    return v.steps.some((x) => x.match && x.priority === win.priority && x.action !== win.action);
  };
</script>

<div class="drill">
  <div class="drill-head">
    <p class="drill-title">{title}</p>
    <p class="score mono">
      {answered}/{packets.length} dijawab · {right} benar
      {#if answered}<button class="link" onclick={reset}>ulangi</button>{/if}
    </p>
  </div>

  <p class="label">VM</p>
  <ul class="vms">
    {#each vms as v (v.name)}
      <li>
        <strong class="mono">{v.name}</strong>
        <span class="mono">{v.ip}</span>
        <span class="tags">{#each v.tags as t (t)}<span class="tag mono">tag {t}</span>{/each}<span class="tag mono">SA {short(v.sa)}</span></span>
      </li>
    {/each}
  </ul>

  <p class="label">Firewall rule, urut seperti dievaluasi</p>
  <div class="table-wrap">
    <table>
      <thead>
        <tr><th>Rule</th><th>Arah</th><th>Priority</th><th>Action</th><th>Berlaku untuk</th><th>Sumber / tujuan</th><th>Port</th></tr>
      </thead>
      <tbody>
        {#each sorted as r (r.name)}
          <tr class:lit={lit === r.name}>
            <td class="mono">{r.name}</td>
            <td class="mono small">{r.direction}</td>
            <td class="mono">{r.priority}</td>
            <td><span class={`act ${r.action}`}>{r.action}</span></td>
            <td class="mono small">{target(r)}</td>
            <td class="mono small">{r.direction === 'INGRESS' ? 'dari' : 'ke'} {peerOf(r)}</td>
            <td class="mono small">{r.ports}</td>
          </tr>
        {/each}
        {#each IMPLIED as r (r.name)}
          <tr class="implied" class:lit={lit === r.name}>
            <td class="mono">implied</td>
            <td class="mono small">{r.direction}</td>
            <td class="mono">65535</td>
            <td><span class={`act ${r.action}`}>{r.action}</span></td>
            <td class="mono small">semua VM</td>
            <td class="mono small">{r.direction === 'INGRESS' ? 'dari' : 'ke'} 0.0.0.0/0</td>
            <td class="mono small">all</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <p class="label">Koneksi — diizinkan atau ditolak?</p>
  <ol class="packets">
    {#each packets as p, i (i)}
      {@const v = verdicts[i]}
      {@const c = calls[i]}
      <li class:done={!!c} class:ok={c === v.action} class:bad={!!c && c !== v.action}>
        <div class="pk-row">
          <span class="dir mono">{p.direction === 'INGRESS' ? 'masuk' : 'keluar'}</span>
          <span class="flow mono">
            {p.direction === 'INGRESS' ? label(p.peer) : label(p.vm)}
            <span aria-hidden="true">→</span><span class="sr">ke</span>
            {p.direction === 'INGRESS' ? label(p.vm) : label(p.peer)}
            <span class="port">{port(p)}</span>
          </span>
          {#if !c}
            <span class="choices">
              <button class="btn sm btn-secondary" onclick={() => call(i, 'allow')}>Allow</button>
              <button class="btn sm btn-secondary" onclick={() => call(i, 'deny')}>Deny</button>
            </span>
          {:else}
            <span class={`verdict ${c === v.action ? 'ok' : 'bad'}`}>{c === v.action ? '✓ ' : '✗ Seharusnya '}{v.action === 'allow' ? 'diizinkan' : 'ditolak'}</span>
          {/if}
        </div>
        {#if c}
          <p class="why">
            <strong>{c === v.action ? 'Benar.' : 'Belum tepat.'}</strong>
            {#if v.implied}
              Tidak ada rule yang cocok, jadi <span class="mono">{v.rule}</span> yang berlaku.
            {:else}
              Diputuskan oleh <span class="mono">{v.rule}</span> (priority {v.steps.find((x) => x.rule === v.rule)?.priority}){#if tie(v)}{' — ada allow dan deny seri di priority itu, deny menang'}{/if}.
            {/if}
            <button class="link" aria-expanded={open === i} onclick={() => (open = open === i ? null : i)}>{open === i ? 'Tutup jejak' : 'Lihat jejak evaluasi'}</button>
          </p>
          {#if open === i}
            <ol class="trace">
              {#each v.steps as s (s.rule)}
                <li class:match={s.match} class:win={s.rule === v.rule}>
                  <span class="mono">{s.priority}</span>
                  <span class="mono">{s.rule}</span>
                  <span class={`act ${s.action}`}>{s.action}</span>
                  <span>{stepNote(v, s)}</span>
                </li>
              {/each}
              {#if v.implied}
                <li class="match win">
                  <span class="mono">65535</span>
                  <span class="mono">implied</span>
                  <span class={`act ${v.action}`}>{v.action}</span>
                  <span>tidak ada yang cocok → dipakai</span>
                </li>
              {/if}
            </ol>
          {/if}
        {/if}
      </li>
    {/each}
  </ol>

  {#if after && answered === packets.length}
    <aside class="after"><p class="label">Pembahasan</p><p>{after}</p></aside>
  {/if}
</div>

<style>
  .drill {
    margin-top: 20px;
    padding: 18px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
  }

  .drill-head {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: baseline;
    gap: 6px 16px;
  }

  .drill-title {
    font-family: var(--font-display);
    font-size: 21px;
    line-height: 1.25;
  }

  .score {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .link {
    border: 0;
    background: none;
    padding: 0;
    color: var(--text);
    text-decoration: underline;
    text-underline-offset: 3px;
    font: inherit;
  }

  .label {
    margin-top: 18px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .vms {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .vms li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    padding: 8px 12px;
    border: 1px solid var(--line);
    background: var(--bg-elevated);
    font-size: 14px;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    padding: 1px 6px;
    font-size: 12px;
    background: var(--surface);
    border: 1px solid var(--line);
    color: var(--text-secondary);
  }

  .table-wrap {
    margin-top: 8px;
    overflow-x: auto;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
    line-height: 1.45;
  }

  th {
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: var(--text-secondary);
    padding: 7px 8px;
    border-bottom: 1px solid var(--line-strong);
    background: var(--bg-elevated);
    white-space: nowrap;
  }

  td {
    padding: 7px 8px;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  td.mono {
    font-size: 13px;
  }

  td.small {
    font-size: 12px;
  }

  tr.implied td {
    color: var(--text-tertiary);
  }

  tr.lit td {
    background: var(--mint-soft);
    color: var(--text);
  }

  tr.lit td:first-child {
    box-shadow: inset 3px 0 0 var(--mint);
  }

  .act {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
  }

  .act.allow {
    color: var(--green);
  }

  .act.deny {
    color: var(--red);
  }

  .packets {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .packets > li {
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-left: 3px solid var(--line-strong);
  }

  .packets > li.ok {
    border-left-color: var(--green);
  }

  .packets > li.bad {
    border-left-color: var(--red);
  }

  .pk-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }

  .dir {
    flex: none;
    width: 4.5em;
    font-size: 11.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .flow {
    flex: 1 1 260px;
    min-width: 0;
    font-size: 13.5px;
    overflow-wrap: anywhere;
  }

  .port {
    margin-left: 6px;
    padding: 1px 6px;
    background: var(--bg-sunken);
  }

  .sr {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }

  .choices {
    display: flex;
    gap: 6px;
  }

  .verdict {
    font-weight: 700;
    font-size: 14px;
  }

  .verdict.ok {
    color: var(--green);
  }

  .verdict.bad {
    color: var(--red);
  }

  .why {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.6;
  }

  .why .mono {
    font-size: 13px;
    padding: 0 4px;
    background: var(--bg-sunken);
  }

  .trace {
    list-style: none;
    margin: 8px 0 0;
    padding: 0;
    font-size: 13px;
  }

  .trace li {
    display: grid;
    grid-template-columns: 3.5em minmax(0, 11em) 4em minmax(0, 1fr);
    gap: 8px;
    padding: 4px 6px;
    border-bottom: 1px solid var(--line);
    color: var(--text-tertiary);
  }

  .trace li.match {
    color: var(--text);
  }

  .trace li.win {
    background: var(--mint-soft);
    font-weight: 600;
  }

  .trace .mono {
    overflow-wrap: anywhere;
  }

  .after {
    margin-top: 14px;
    padding: 12px 14px;
    border-left: 3px solid var(--mint);
    background: var(--mint-soft);
    font-size: 14.5px;
    line-height: 1.6;
  }

  .after .label {
    margin-top: 0;
    margin-bottom: 4px;
  }

  @media (max-width: 640px) {
    .trace li {
      grid-template-columns: 3em minmax(0, 1fr) 3.5em;
    }

    .trace li > span:last-child {
      grid-column: 1 / -1;
      padding-left: 3em;
    }
  }
</style>
