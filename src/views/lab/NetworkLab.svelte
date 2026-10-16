<script lang="ts">
  import { untrack } from 'svelte';
  import LabHead from './LabHead.svelte';
  import NetInspector, { type Sel } from './NetInspector.svelte';
  import { describe, probe, type Endpoint, type Trace } from '@/lab/net/engine';
  import { layout, type Point } from '@/lab/net/layout';
  import { checkGoal, goalLabel, type NetScenario } from '@/lab/net/scenarios';
  import { vpcOf, type Proto, type Topology } from '@/lab/net/model';
  import { clearWork, loadWork, markDone, saveWork } from '@/lab/progress';

  let { sc }: { sc: NetScenario } = $props();

  // The lab view remounts per scenario, so reading the prop once is enough.
  const start = untrack(() => sc);
  let topo = $state<Topology>(loadWork<Topology>('network', start.id) ?? start.build());
  let sel = $state<Sel>(null);
  let tab = $state<'inspect' | 'sim'>('sim');
  let undoStack: string[] = [];
  let canUndo = $state(false);
  let hintsShown = $state(0);

  const L = $derived(layout(topo));
  const goals = $derived(sc.goals.map((g) => checkGoal(topo, g)));
  const passCount = $derived(goals.filter((g) => g.pass).length);
  const solved = $derived(sc.goals.length > 0 && passCount === sc.goals.length);

  $effect(() => {
    if (solved) markDone('network', sc.id);
  });

  /** Every change goes through here: snapshot for undo, then save. */
  function commit(before: string) {
    undoStack = [...undoStack, before].slice(-40);
    canUndo = true;
    saveWork('network', sc.id, $state.snapshot(topo));
    trace = null;
  }

  function undo() {
    const last = undoStack.pop();
    canUndo = undoStack.length > 0;
    if (!last) return;
    topo = JSON.parse(last);
    sel = null;
    trace = null;
    saveWork('network', sc.id, $state.snapshot(topo));
  }

  function reset() {
    undoStack = [];
    canUndo = false;
    topo = sc.build();
    sel = null;
    trace = null;
    hintsShown = 0;
    clearWork('network', sc.id);
  }

  function select(s: Sel) {
    sel = s;
    tab = 'inspect';
  }

  // ── simulation ──
  let from = $state('');
  let to = $state('');
  let proto = $state<Proto>('tcp');
  let port = $state(80);
  let trace = $state<Trace | null>(null);
  let traceFor = $state('');

  const sources = $derived([
    ...topo.vms.map((v) => ({ ref: `vm:${v.id}`, label: `${v.name} (${v.internalIp})` })),
    { ref: 'internet', label: 'Internet (klien)' },
    { ref: 'iap', label: 'IAP (SSH di browser)' },
    ...(topo.vpns.length ? [{ ref: 'onprem', label: 'On-prem' }] : [])
  ]);
  const targets = $derived([
    ...topo.vms.map((v) => ({ ref: `vm:${v.id}`, label: `${v.name} (${v.internalIp})` })),
    ...topo.lbs.map((l) => ({ ref: `lb:${l.id}`, label: `${l.name} (LB ${l.ip}:${l.port})` })),
    { ref: 'internet', label: 'Internet' },
    { ref: 'google', label: 'Google APIs' },
    ...(topo.vpns.length ? [{ ref: 'onprem', label: 'On-prem' }] : [])
  ]);

  // Keep the selects pointing at something that exists.
  $effect(() => {
    if (!sources.some((s) => s.ref === from)) from = sources[0]?.ref ?? '';
    if (!targets.some((s) => s.ref === to) || to === from) to = targets.find((t) => t.ref !== from)?.ref ?? '';
  });

  function endpoint(ref: string): Endpoint {
    const [kind, id] = ref.split(':');
    if (kind === 'vm' || kind === 'lb') return { kind, id };
    return { kind: kind as 'internet' | 'google' | 'onprem' | 'iap' };
  }

  function send() {
    const p = { from: endpoint(from), to: endpoint(to), proto, port: Number(port) || 0 };
    trace = probe(topo, p);
    traceFor = `${describe(topo, p.from)} → ${describe(topo, p.to)} ${proto === 'icmp' ? 'ping' : `${proto}:${port}`}`;
    tab = 'sim';
    animate(p.from, p.to, trace);
  }

  function runGoal(i: number) {
    const g = goals[i];
    if (!g.probe) return;
    const ref = (e: Endpoint) => (e.kind === 'vm' || e.kind === 'lb' ? `${e.kind}:${e.id}` : e.kind);
    from = ref(g.probe.from);
    to = ref(g.probe.to);
    proto = g.probe.proto;
    port = g.probe.port;
    send();
  }

  // ── packet animation ──
  let dot = $state<Point | null>(null);
  let dotFail = $state(false);
  let activeHop = $state(-1);
  let raf = 0;

  function nodeOf(e: Endpoint) {
    return e.kind === 'vm' ? `vm:${e.id}` : e.kind === 'lb' ? `lb:${e.id}` : e.kind;
  }

  function animate(a: Endpoint, b: Endpoint, t: Trace) {
    cancelAnimationFrame(raf);
    const pts: { p: Point; hop: number }[] = [];
    const add = (node: string, hop: number) => {
      const p = L.pos[node];
      if (!p) return;
      const last = pts.at(-1);
      if (last && last.p.x === p.x && last.p.y === p.y) {
        last.hop = hop;
        return;
      }
      pts.push({ p, hop });
    };
    add(nodeOf(a), -1);
    t.hops.forEach((h, i) => add(h.node, i));
    if (t.ok) add(nodeOf(b), t.hops.length - 1);
    // The packet comes to rest on the corner of its last node, clear of the label.
    const last = pts.at(-1);
    if (last && pts.length > 1) last.p = { x: last.p.x + 58, y: last.p.y - 18 };
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    dotFail = false;
    if (!pts.length) return;
    if (reduced || pts.length === 1) {
      dot = pts.at(-1)!.p;
      activeHop = t.hops.length - 1;
      dotFail = !t.ok;
      return;
    }
    const seg = 420;
    const start = performance.now();
    const stepFn = (now: number) => {
      const k = (now - start) / seg;
      const i = Math.min(Math.floor(k), pts.length - 1);
      if (i >= pts.length - 1) {
        dot = pts.at(-1)!.p;
        activeHop = t.hops.length - 1;
        dotFail = !t.ok;
        return;
      }
      const f = k - i;
      const p = pts[i].p;
      const q = pts[i + 1].p;
      const e = f < 0.5 ? 2 * f * f : 1 - (-2 * f + 2) ** 2 / 2;
      dot = { x: p.x + (q.x - p.x) * e, y: p.y + (q.y - p.y) * e };
      activeHop = pts[i].hop;
      raf = requestAnimationFrame(stepFn);
    };
    raf = requestAnimationFrame(stepFn);
  }

  $effect(() => () => cancelAnimationFrame(raf));

  const failed = $derived(new Set(trace && !trace.ok ? trace.hops.filter((h) => !h.ok).map((h) => h.node) : []));
  const isSel = (kind: string, id: string) => sel?.kind === kind && sel.id === id;
  const short = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);
</script>

<LabHead {sc} mode="Topologi jaringan" story={sc.story} />

{#if sc.goals.length}
  <section class="goals card" class:solved aria-label="Goal">
    <div class="goals-head">
      <h2>{solved ? '★ Semua goal tercapai' : 'Goal'}</h2>
      <span class="mono count">{passCount}/{sc.goals.length}</span>
    </div>
    <ul>
      {#each goals as g, i (i)}
        <li class:pass={g.pass}>
          <span class="mark" aria-hidden="true">{g.pass ? '✓' : '✗'}</span>
          <span class="text">
            {goalLabel(g.goal)}
            {#if !g.pass}<small>{g.note}</small>{/if}
          </span>
          {#if g.probe}
            <button class="btn btn-ghost sm" onclick={() => runGoal(i)}>Uji</button>
          {/if}
        </li>
      {/each}
    </ul>
    {#if solved}
      <p class="lesson"><strong>Pelajaran.</strong> {sc.lesson}</p>
    {:else}
      <div class="hints">
        {#each sc.hints.slice(0, hintsShown) as h (h)}<p>→ {h}</p>{/each}
        {#if hintsShown < sc.hints.length}
          <button class="btn btn-ghost sm" onclick={() => (hintsShown += 1)}>Petunjuk {hintsShown + 1}/{sc.hints.length}</button>
        {/if}
      </div>
    {/if}
  </section>
{:else}
  <p class="sandbox-note">{sc.hints[0]}</p>
{/if}

<div class="workspace">
  <div class="canvas-col">
    <div class="toolbar">
      <button class="btn btn-secondary sm" onclick={() => select({ kind: 'new', id: '' })}>+ VPC</button>
      <button class="btn btn-ghost sm" onclick={undo} disabled={!canUndo}>↶ Undo</button>
      <button class="btn btn-ghost sm" onclick={reset}>Mulai ulang</button>
      <span class="legend">
        <span><i class="sw ok"></i>peering aktif</span>
        <span><i class="sw off"></i>belum aktif</span>
      </span>
    </div>
    <div class="canvas-scroll">
      <svg viewBox={`0 0 ${L.w} ${L.h}`} class="canvas" role="img" aria-label="Diagram topologi">
        <!-- links first, so nodes draw over them -->
        {#each topo.lbs as lb (lb.id)}
          {@const a = L.pos[`lb:${lb.id}`]}
          {#if a && lb.type.startsWith('external')}
            <line x1={L.pos.internet.x} y1={L.pos.internet.y + 22} x2={a.x} y2={a.y - 22} class="link" />
          {/if}
          {#each lb.backendVmIds as id (id)}
            {@const b = L.pos[`vm:${id}`]}
            {#if a && b}<line x1={a.x} y1={a.y + 22} x2={b.x} y2={b.y - 25} class="link lb-link" />{/if}
          {/each}
        {/each}
        {#each topo.vpns as v (v.id)}
          {@const a = L.pos[`vpn:${v.id}`]}
          {#if a && L.pos.onprem}
            <path d={`M ${a.x} ${a.y} C ${a.x} ${a.y + 60}, ${L.pos.onprem.x + 40} ${L.h - 10}, ${L.pos.onprem.x} ${L.pos.onprem.y + 22}`} class="link vpn-link" />
          {/if}
        {/each}
        {#each L.peers as p (p.a + p.b)}
          <path d={p.d} class="peer" class:active={p.active} />
        {/each}

        {#each L.ext as e (e.id)}
          <g class="node ext" class:fail={failed.has(e.id)}>
            <rect x={e.x} y={e.y} width={e.w} height={e.h} />
            <text x={e.x + e.w / 2} y={e.y + 27} text-anchor="middle">{e.label}</text>
          </g>
        {/each}

        {#each L.vpcs as box (box.id)}
          {@const v = vpcOf(topo, box.id)}
          {#if v}
            <g class="vpc" class:sel={isSel('vpc', v.id)} class:fail={failed.has(`vpc:${v.id}`)}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} class="vpc-box" />
              <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
              <g class="hit" onclick={() => select({ kind: 'vpc', id: v.id })}>
                <rect x={box.x} y={box.y} width={box.w} height={34} class="vpc-head" />
                <text x={box.x + 12} y={box.y + 22} class="vpc-name">VPC {short(v.name, 22)}</text>
                <text x={box.x + box.w - 10} y={box.y + 22} text-anchor="end" class="vpc-meta">{v.mode} · {v.routingMode.toLowerCase()} · {v.firewall.length} rule</text>
              </g>
              {#each box.subnets as sb (sb.id)}
                {@const s = v.subnets.find((x) => x.id === sb.id)}
                {#if s}
                  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                  <g class="subnet hit" class:sel={isSel('subnet', s.id)} onclick={() => select({ kind: 'subnet', id: s.id })}>
                    <rect x={sb.x} y={sb.y} width={sb.w} height={sb.h} />
                    <text x={sb.x + 9} y={sb.y + 20} class="sn-name">{short(s.name, 18)}</text>
                    <text x={sb.x + sb.w - 9} y={sb.y + 20} text-anchor="end" class="sn-meta">{s.region} · {s.cidr}{s.privateGoogleAccess ? ' · PGA' : ''}</text>
                  </g>
                {/if}
              {/each}
              {#each box.chips as c (c.id)}
                <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
                <g class="chip hit" class:sel={isSel(c.kind, c.id)} class:fail={failed.has(`${c.kind}:${c.id}`)} onclick={() => select({ kind: c.kind, id: c.id })}>
                  <rect x={c.x} y={c.y} width={c.w} height={c.h} />
                  <text x={c.x + c.w / 2} y={c.y + 18} text-anchor="middle">{c.label}</text>
                </g>
              {/each}
            </g>
          {/if}
        {/each}

        {#each L.vms as b (b.id)}
          {@const m = topo.vms.find((x) => x.id === b.id)}
          {#if m}
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <g class="node vm hit" class:sel={isSel('vm', m.id)} class:fail={failed.has(`vm:${m.id}`)} onclick={() => select({ kind: 'vm', id: m.id })}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} />
              <text x={b.x + 9} y={b.y + 20} class="vm-name">{short(m.name, 15)}{m.externalIp ? ' ◉' : ''}</text>
              <text x={b.x + 9} y={b.y + 37} class="vm-ip">{m.internalIp}</text>
              <text x={b.x + 9} y={b.y + 51} class="vm-tags">{short(m.tags.join(' ') || 'tanpa tag', 22)}</text>
            </g>
          {/if}
        {/each}

        {#each L.lbs as b (b.id)}
          {@const lb = topo.lbs.find((x) => x.id === b.id)}
          {#if lb}
            <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
            <g class="node lb hit" class:sel={isSel('lb', lb.id)} class:fail={failed.has(`lb:${lb.id}`)} onclick={() => select({ kind: 'lb', id: lb.id })}>
              <rect x={b.x} y={b.y} width={b.w} height={b.h} />
              <text x={b.x + b.w / 2} y={b.y + 19} text-anchor="middle" class="lb-name">{short(lb.name, 16)}</text>
              <text x={b.x + b.w / 2} y={b.y + 34} text-anchor="middle" class="lb-meta">{lb.type} :{lb.port}</text>
            </g>
          {/if}
        {/each}

        {#if dot}
          <circle cx={dot.x} cy={dot.y} r="9" class="packet" class:fail={dotFail} />
          {#if dotFail}
            <text x={dot.x} y={dot.y + 4} text-anchor="middle" class="packet-x">✕</text>
          {/if}
        {/if}
      </svg>
    </div>
    <p class="canvas-note">◉ = punya external IP. Klik VPC, subnet, VM atau chip NAT/VPN untuk mengubahnya.</p>
  </div>

  <aside class="side">
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected={tab === 'sim'} class:on={tab === 'sim'} onclick={() => (tab = 'sim')}>Kirim paket</button>
      <button role="tab" aria-selected={tab === 'inspect'} class:on={tab === 'inspect'} onclick={() => (tab = 'inspect')}>Inspector</button>
    </div>

    {#if tab === 'sim'}
      <div class="sim">
        <label>Dari
          <select bind:value={from}>
            {#each sources as s (s.ref)}<option value={s.ref}>{s.label}</option>{/each}
          </select>
        </label>
        <label>Ke
          <select bind:value={to}>
            {#each targets.filter((t) => t.ref !== from) as s (s.ref)}<option value={s.ref}>{s.label}</option>{/each}
          </select>
        </label>
        <div class="row">
          <label>Protokol
            <select bind:value={proto}>
              <option value="tcp">TCP</option>
              <option value="udp">UDP</option>
              <option value="icmp">ICMP (ping)</option>
            </select>
          </label>
          <label>Port
            <input type="number" min="0" max="65535" bind:value={port} disabled={proto === 'icmp'} />
          </label>
        </div>
        <div class="quick">
          {#each [22, 80, 443, 3389, 5432, 8080] as q (q)}
            <button class:on={port === q && proto === 'tcp'} onclick={() => ((proto = 'tcp'), (port = q))}>{q}</button>
          {/each}
        </div>
        <button class="btn btn-primary send" onclick={send} disabled={!from || !to}>Kirim paket ▸</button>

        {#if trace}
          <div class="trace" class:ok={trace.ok}>
            <p class="verdict"><strong>{trace.ok ? '✓ Tersambung' : '✗ Diblokir'}</strong> <span class="mono">{traceFor}</span></p>
            <p class="summary">{trace.summary}</p>
            <ol>
              {#each trace.hops as h, i (i)}
                <li class:bad={!h.ok} class:now={i === activeHop}>
                  <strong>{h.ok ? '✓' : '✗'} {h.title}</strong>
                  {#if h.detail}<span>{h.detail}</span>{/if}
                </li>
              {/each}
            </ol>
          </div>
        {:else}
          <p class="empty">Pilih dua titik lalu kirim paket. Setiap hop — firewall egress, route, NAT, peering, firewall ingress, aplikasi — dijelaskan seperti Connectivity Tests.</p>
        {/if}
      </div>
    {:else}
      <NetInspector bind:topo bind:sel {commit} />
    {/if}
  </aside>
</div>

<style>
  .goals {
    padding: 18px 20px;
    margin-bottom: 18px;
  }

  .goals.solved {
    background: var(--mint-soft);
  }

  .goals-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .goals h2 {
    font-size: var(--type-h4);
  }

  .count {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .goals ul {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    gap: 6px;
  }

  .goals li {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding: 10px 10px 10px 12px;
    background: var(--surface);
    font-size: 14px;
    line-height: 1.45;
  }

  .goals .mark {
    flex: none;
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    font-size: 12px;
    font-weight: 700;
    color: var(--red);
    border: 1px solid currentColor;
  }

  .goals li.pass .mark {
    color: #1a1a1a;
    background: var(--mint);
    border-color: var(--mint);
  }

  .goals .text {
    flex: 1;
    min-width: 0;
  }

  .goals small {
    display: block;
    margin-top: 2px;
    font-size: 12.5px;
    color: var(--text-tertiary);
  }

  .goals .btn {
    flex: none;
    padding: 4px 10px;
    font-size: 13px;
    border: 1px solid var(--line-strong);
  }

  .lesson {
    margin-top: 14px;
    font-size: 14.5px;
    line-height: 1.55;
  }

  .hints {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    font-size: 14px;
    line-height: 1.5;
    color: var(--text-strong-secondary);
  }

  .hints .btn {
    margin-left: -12px;
  }

  .sandbox-note {
    margin-bottom: 16px;
    font-size: 14px;
    color: var(--text-secondary);
  }

  .workspace {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 18px;
    align-items: start;
  }

  .canvas-col {
    min-width: 0;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    margin-bottom: 8px;
  }

  .legend {
    margin-left: auto;
    display: flex;
    gap: 14px;
    font-size: 12.5px;
    color: var(--text-tertiary);
  }

  .legend span {
    display: inline-flex;
    gap: 6px;
    align-items: center;
  }

  .sw {
    width: 22px;
    height: 0;
    border-top: 2.5px solid var(--green);
  }

  .sw.off {
    border-top: 2px dashed var(--text-tertiary);
  }

  .canvas-scroll {
    overflow-x: auto;
    background: var(--stone);
    border: 1px solid var(--line);
  }

  .canvas {
    display: block;
    width: 100%;
    min-width: 760px;
    height: auto;
    font-family: var(--font);
  }

  .canvas-note {
    margin-top: 8px;
    font-size: 12.5px;
    color: var(--text-tertiary);
  }

  /* SVG skin — strokes follow the theme tokens. */
  .canvas :global(text) {
    fill: var(--ink);
    font-size: 13px;
    letter-spacing: 0;
    pointer-events: none;
  }

  .hit {
    cursor: pointer;
  }

  .ext rect {
    fill: var(--surface);
    stroke: var(--ink);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
  }

  .ext text {
    font-weight: 600;
  }

  .vpc-box {
    fill: var(--bg);
    stroke: var(--ink);
    stroke-width: 1.5;
  }

  .vpc-head {
    fill: var(--ink);
  }

  .canvas .vpc-name {
    fill: var(--accent-text);
    font-weight: 700;
    font-size: 14px;
  }

  .canvas .vpc-meta {
    fill: var(--accent-text);
    opacity: 0.75;
    font-size: 12px;
  }

  .vpc.sel .vpc-box {
    stroke-width: 3;
    stroke: var(--mint);
  }

  .subnet rect {
    fill: var(--stone);
    stroke: var(--line-strong);
  }

  .subnet.sel rect {
    stroke: var(--ink);
    stroke-width: 2;
  }

  .canvas .sn-name {
    font-weight: 600;
  }

  .canvas .sn-meta {
    font-size: 12px;
    fill: var(--text-secondary);
  }

  .vm rect {
    fill: var(--surface);
    stroke: var(--ink);
    stroke-width: 1.2;
  }

  .vm:hover rect,
  .lb:hover rect,
  .chip:hover rect,
  .subnet:hover rect {
    stroke-width: 2;
  }

  .vm.sel rect,
  .lb.sel rect,
  .chip.sel rect {
    stroke: var(--ink);
    stroke-width: 3;
    fill: var(--mint-soft);
  }

  .canvas .vm-name {
    font-weight: 700;
  }

  .canvas .vm-ip {
    font-family: var(--font-mono);
    font-size: 12.5px;
    fill: var(--text-secondary);
  }

  .canvas .vm-tags {
    font-size: 11.5px;
    fill: var(--text-tertiary);
  }

  .lb rect {
    fill: var(--ink);
  }

  .canvas .lb-name {
    fill: var(--accent-text);
    font-weight: 700;
  }

  .canvas .lb-meta {
    fill: var(--accent-text);
    opacity: 0.75;
    font-size: 11.5px;
  }

  .chip rect {
    fill: var(--surface);
    stroke: var(--ink);
    stroke-dasharray: 3 2;
  }

  .canvas .chip text {
    font-size: 12px;
    font-weight: 600;
  }

  .fail rect {
    stroke: var(--red) !important;
    stroke-width: 3 !important;
  }

  .link {
    stroke: var(--text-tertiary);
    stroke-width: 1.2;
    fill: none;
  }

  .vpn-link {
    stroke-dasharray: 6 4;
    stroke: var(--ink);
  }

  .peer {
    fill: none;
    stroke: var(--text-tertiary);
    stroke-width: 2;
    stroke-dasharray: 6 5;
  }

  .peer.active {
    stroke: var(--green);
    stroke-width: 3;
    stroke-dasharray: none;
  }

  .packet {
    pointer-events: none;
    fill: var(--mint);
    stroke: #1a1a1a;
    stroke-width: 2;
  }

  .packet.fail {
    fill: var(--red);
  }

  .canvas .packet-x {
    fill: #fff;
    font-size: 11px;
    font-weight: 700;
  }

  .side {
    position: sticky;
    top: calc(var(--header-h) + 16px);
    max-height: calc(100vh - var(--header-h) - 32px);
    overflow-y: auto;
    background: var(--bg-elevated);
    padding: 0 16px 18px;
  }

  .tabs {
    position: sticky;
    top: 0;
    z-index: 1;
    display: flex;
    gap: 4px;
    margin: 0 -16px 14px;
    padding: 10px 16px 0;
    background: var(--bg-elevated);
    border-bottom: 1px solid var(--line);
  }

  .tabs button {
    padding: 9px 12px;
    border: 0;
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  .tabs button.on {
    color: var(--ink);
    box-shadow: inset 0 -2px 0 var(--mint);
  }

  .sim {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sim label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .sim select,
  .sim input {
    padding: 9px 10px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 14px;
    font-weight: 400;
  }

  .row {
    display: grid;
    grid-template-columns: 1fr 110px;
    gap: 8px;
  }

  .quick {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .quick button {
    padding: 4px 8px;
    border: 1px solid var(--line);
    background: var(--surface);
    font-family: var(--font-mono);
    font-size: 12px;
  }

  .quick button.on {
    border-color: var(--ink);
    background: var(--ink);
    color: var(--accent-text);
  }

  .send {
    width: 100%;
  }

  .empty {
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-tertiary);
  }

  .trace {
    border-top: 3px solid var(--red);
    background: var(--surface);
    padding: 14px;
  }

  .trace.ok {
    border-top-color: var(--mint);
  }

  .trace .verdict {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 15px;
  }

  .trace .verdict .mono {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .trace .summary {
    margin-top: 6px;
    font-size: 13.5px;
    color: var(--text-secondary);
  }

  .trace ol {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .trace li {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding-left: 10px;
    border-left: 2px solid var(--green);
    font-size: 13px;
    line-height: 1.45;
    transition: background-color var(--dur-micro) var(--ease);
  }

  .trace li.bad {
    border-left-color: var(--red);
  }

  .trace li.bad strong {
    color: var(--red);
  }

  .trace li.now {
    background: var(--mint-soft);
  }

  .trace li span {
    color: var(--text-secondary);
  }

  @media (max-width: 1100px) {
    .workspace {
      grid-template-columns: 1fr;
    }

    .side {
      position: static;
      max-height: none;
    }

    .legend {
      display: none;
    }
  }

  @media (max-width: 560px) {
    .goals ul {
      grid-template-columns: 1fr;
    }
  }
</style>
