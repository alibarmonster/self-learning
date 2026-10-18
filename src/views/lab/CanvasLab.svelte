<script lang="ts">
  import { onDestroy, untrack } from 'svelte';
  import LabHead from './LabHead.svelte';
  import { CATEGORIES, SPECS, SPEC_LIST, defaults, freshName, nodeIssues, type Field, type Opt } from '@/lab/canvas/catalog';
  import { edgeDefaults, granted, refusal, ruleFor, wiringFor } from '@/lab/canvas/rules';
  import { ctxOf, deploy, edgeCommands, fingerprint, nodeCommands, script, testStarts, trace, type DeployReport, type Trace } from '@/lab/canvas/sim';
  import { incoming, newId, nodeById, outgoing, rows, runtimeSa, type CEdge, type CNode, type Doc, type Issue, type NodeType, type Params } from '@/lab/canvas/model';
  import type { CanvasScenario, GoalCtx } from '@/lab/canvas/scenarios';
  import { clearWork, loadWork, markDone, saveWork } from '@/lab/progress';

  let { sc }: { sc: CanvasScenario } = $props();

  const NODE = 96;
  const GRID = 16;
  const start = untrack(() => sc);
  const saved = loadWork<{ doc: Doc }>('canvas', start.id);
  let doc = $state<Doc>(saved?.doc?.version === 1 ? saved.doc : start.build());

  let selNodes = $state<string[]>([]);
  let selEdge = $state<string | null>(null);
  let report = $state<DeployReport | null>(null);
  let traces = $state<Record<string, Trace>>({});
  let tab = $state<'goals' | 'issues' | 'log' | 'sim' | 'script'>(untrack(() => (sc.goals.length ? 'goals' : 'issues')));
  let advanced = $state(false);
  let search = $state('');
  let hintIdx = $state(0);
  let toast = $state<{ lines: string[]; level: 'ok' | 'error' | 'info' } | null>(null);
  let busy = $state<'' | 'deploy' | 'test'>('');
  let shownEvents = $state(0);
  let running = $state<Set<string>>(new Set());
  let pulses = $state<{ edge: string; ok: boolean; t0: number; dur: number }[]>([]);
  let now = $state(0);
  let copied = $state(false);

  let svg: SVGSVGElement | undefined = $state();
  let wrap: HTMLDivElement | undefined = $state();
  const pathEls: Record<string, SVGPathElement> = {};

  // ── undo / redo ─────────────────────────────────────────────────────────
  let past = $state<string[]>([]);
  let future = $state<string[]>([]);
  const snap = () => JSON.stringify({ nodes: doc.nodes, edges: doc.edges });
  function checkpoint() {
    past = [...past.slice(-99), snap()];
    future = [];
  }
  function restore(s: string) {
    const v = JSON.parse(s) as { nodes: CNode[]; edges: CEdge[] };
    doc.nodes = v.nodes;
    doc.edges = v.edges;
    selNodes = selNodes.filter((id) => v.nodes.some((n) => n.id === id));
    if (selEdge && !v.edges.some((e) => e.id === selEdge)) selEdge = null;
  }
  function undo() {
    const s = past.at(-1);
    if (!s) return;
    future = [...future, snap()];
    past = past.slice(0, -1);
    restore(s);
  }
  function redo() {
    const s = future.at(-1);
    if (!s) return;
    past = [...past, snap()];
    future = future.slice(0, -1);
    restore(s);
  }

  // ── persistence ─────────────────────────────────────────────────────────
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const json = JSON.stringify(doc);
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveWork('canvas', start.id, { doc: JSON.parse(json) }), 300);
  });
  onDestroy(() => clearTimeout(saveTimer));

  // ── derived state ───────────────────────────────────────────────────────
  const fp = $derived(fingerprint(doc));
  const fresh = $derived(report && report.snapshot === fp ? report : null);
  const goalCtx = $derived<GoalCtx>({ d: doc, report: fresh, traces: fresh ? traces : {} });
  const goalState = $derived(sc.goals.map((g) => g.check(goalCtx)));
  const goalsDone = $derived(goalState.filter(Boolean).length);
  const allDone = $derived(sc.goals.length > 0 && goalsDone === sc.goals.length);
  $effect(() => {
    if (allDone) markDone('canvas', sc.id);
  });

  const nodeProblems = $derived(Object.fromEntries(doc.nodes.map((n) => [n.id, nodeIssues(n, doc)])) as Record<string, Issue[]>);
  const edgeProblems = $derived(
    Object.fromEntries(
      doc.edges.map((e) => {
        const c = ctxOf(doc, e);
        return [e.id, c ? (c.rule.check?.(c) ?? []) : [{ level: 'error' as const, msg: 'Koneksi tidak valid.' }]];
      })
    ) as Record<string, Issue[]>
  );
  const allProblems = $derived([
    ...doc.nodes.flatMap((n) => nodeProblems[n.id].filter((i) => i.level !== 'info').map((i) => ({ ...i, node: n.id, edge: null as string | null, at: n.name }))),
    ...doc.edges.flatMap((e) => {
      const a = nodeById(doc, e.from)?.name;
      const b = nodeById(doc, e.to)?.name;
      return edgeProblems[e.id].filter((i) => i.level !== 'info').map((i) => ({ ...i, node: null as string | null, edge: e.id, at: `${a} → ${b}` }));
    })
  ]);

  const node = $derived(selNodes.length === 1 ? nodeById(doc, selNodes[0]) : undefined);
  const edge = $derived(selEdge ? doc.edges.find((e) => e.id === selEdge) : undefined);
  const edgeCtx = $derived(edge ? ctxOf(doc, edge) : null);

  /** Status shown on a node: running during deploy, else the fresh deploy result. */
  function nodeStatus(id: string): string {
    if (running.has(id)) return 'running';
    return fresh?.node[id] ?? (report ? 'stale' : '');
  }
  /** Link-light colour of an edge: last test result, else last deploy result. */
  const hopOf = $derived.by(() => {
    const m: Record<string, boolean> = {};
    if (!fresh) return m;
    for (const t of Object.values(traces)) for (const h of t.hops) if (h.edgeId) m[h.edgeId] = (m[h.edgeId] ?? true) && h.ok;
    return m;
  });
  function edgeLight(e: CEdge): string {
    if (e.id in hopOf) return hopOf[e.id] ? 'ok' : 'error';
    const s = fresh?.edge[e.id];
    return s ?? 'idle';
  }

  // ── geometry ────────────────────────────────────────────────────────────
  const snapTo = (v: number) => Math.round(v / GRID) * GRID;
  function curve(sx: number, sy: number, tx: number, ty: number, loop = false) {
    // A backwards edge loops under both nodes instead of cutting through them, as n8n does.
    if (loop && tx < sx + 24) {
      const pad = 40;
      const below = Math.max(sy, ty) + NODE / 2 + 56;
      return {
        d: `M${sx},${sy} C${sx + pad},${sy} ${sx + pad},${below} ${sx},${below} L${tx},${below} C${tx - pad},${below} ${tx - pad},${ty} ${tx},${ty}`,
        mx: (sx + tx) / 2,
        my: below
      };
    }
    const off = (dd: number) => (dd >= 0 ? 0.5 * dd : 0.25 * 25 * Math.sqrt(-dd));
    const c1x = sx + off(tx - sx);
    const c2x = tx - off(tx - sx);
    return { d: `M${sx},${sy} C${c1x},${sy} ${c2x},${ty} ${tx},${ty}`, mx: 0.125 * sx + 0.375 * c1x + 0.375 * c2x + 0.125 * tx, my: (sy + ty) / 2 };
  }
  function edgeGeo(e: CEdge) {
    const a = nodeById(doc, e.from);
    const b = nodeById(doc, e.to);
    if (!a || !b) return null;
    return curve(a.x + NODE, a.y + NODE / 2, b.x, b.y + NODE / 2, true);
  }
  function toWorld(cx: number, cy: number) {
    const r = svg!.getBoundingClientRect();
    return { x: (cx - r.left - doc.view.x) / doc.view.z, y: (cy - r.top - doc.view.y) / doc.view.z };
  }

  // ── pointer interaction on the canvas ───────────────────────────────────
  type Mode =
    | { kind: 'none' }
    | { kind: 'pan'; sx: number; sy: number; vx: number; vy: number; moved: boolean }
    | { kind: 'drag'; sx: number; sy: number; start: Record<string, [number, number]>; moved: boolean }
    | { kind: 'connect'; from: string; x: number; y: number }
    | { kind: 'marquee'; x0: number; y0: number; x1: number; y1: number };
  let mode = $state<Mode>({ kind: 'none' });
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { d: number; z: number; cx: number; cy: number } | null = null;

  function onDown(e: PointerEvent) {
    if (e.button === 2) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), z: doc.view.z, cx: (p.x + q.x) / 2, cy: (p.y + q.y) / 2 };
      mode = { kind: 'none' };
      return;
    }
    const t = e.target as Element;
    const handle = t.closest('[data-handle]') as HTMLElement | null;
    const nodeEl = t.closest('[data-node]') as HTMLElement | null;
    const edgeEl = t.closest('[data-edge]') as HTMLElement | null;
    svg!.setPointerCapture(e.pointerId);
    if (handle?.dataset.handle === 'out') {
      const w = toWorld(e.clientX, e.clientY);
      mode = { kind: 'connect', from: handle.dataset.id!, x: w.x, y: w.y };
      return;
    }
    if (nodeEl) {
      const id = nodeEl.dataset.node!;
      if (e.shiftKey) selNodes = selNodes.includes(id) ? selNodes.filter((x) => x !== id) : [...selNodes, id];
      else if (!selNodes.includes(id)) selNodes = [id];
      selEdge = null;
      const startPos: Record<string, [number, number]> = {};
      for (const sid of selNodes) {
        const n = nodeById(doc, sid);
        if (n) startPos[sid] = [n.x, n.y];
      }
      mode = { kind: 'drag', sx: e.clientX, sy: e.clientY, start: startPos, moved: false };
      return;
    }
    if (edgeEl) {
      selEdge = edgeEl.dataset.edge!;
      selNodes = [];
      return;
    }
    if (e.shiftKey) {
      const w = toWorld(e.clientX, e.clientY);
      mode = { kind: 'marquee', x0: w.x, y0: w.y, x1: w.x, y1: w.y };
      return;
    }
    mode = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: doc.view.x, vy: doc.view.y, moved: false };
    userMoved = true;
  }

  function onMove(e: PointerEvent) {
    if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pointers.size === 2) {
      const [p, q] = [...pointers.values()];
      const dist = Math.hypot(p.x - q.x, p.y - q.y);
      zoomAt(pinch.cx, pinch.cy, (pinch.z * dist) / pinch.d);
      return;
    }
    const m = mode;
    if (m.kind === 'pan') {
      const dx = e.clientX - m.sx;
      const dy = e.clientY - m.sy;
      if (Math.abs(dx) + Math.abs(dy) > 3) m.moved = true;
      doc.view.x = m.vx + dx;
      doc.view.y = m.vy + dy;
    } else if (m.kind === 'drag') {
      const dx = (e.clientX - m.sx) / doc.view.z;
      const dy = (e.clientY - m.sy) / doc.view.z;
      if (!m.moved && Math.abs(dx) + Math.abs(dy) > 3) {
        m.moved = true;
        checkpoint();
      }
      if (!m.moved) return;
      for (const [id, [x, y]] of Object.entries(m.start)) {
        const n = nodeById(doc, id);
        if (n) {
          n.x = snapTo(x + dx);
          n.y = snapTo(y + dy);
        }
      }
    } else if (m.kind === 'connect' || m.kind === 'marquee') {
      const w = toWorld(e.clientX, e.clientY);
      if (m.kind === 'connect') mode = { ...m, x: w.x, y: w.y };
      else mode = { ...m, x1: w.x, y1: w.y };
    }
  }

  function onUp(e: PointerEvent) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    const m = mode;
    mode = { kind: 'none' };
    if (m.kind === 'pan' && !m.moved) {
      selNodes = [];
      selEdge = null;
    } else if (m.kind === 'connect') {
      const el = document.elementFromPoint(e.clientX, e.clientY)?.closest('[data-node]') as HTMLElement | null;
      if (el && el.dataset.node !== m.from) connect(m.from, el.dataset.node!, e);
    } else if (m.kind === 'marquee') {
      const [x0, x1] = [Math.min(m.x0, m.x1), Math.max(m.x0, m.x1)];
      const [y0, y1] = [Math.min(m.y0, m.y1), Math.max(m.y0, m.y1)];
      selNodes = doc.nodes.filter((n) => n.x + NODE > x0 && n.x < x1 && n.y + NODE > y0 && n.y < y1).map((n) => n.id);
      selEdge = null;
    }
  }

  function zoomAt(cx: number, cy: number, z: number) {
    userMoved = true;
    const r = svg!.getBoundingClientRect();
    const nz = Math.min(2, Math.max(0.3, z));
    const px = cx - r.left;
    const py = cy - r.top;
    doc.view.x = px - ((px - doc.view.x) * nz) / doc.view.z;
    doc.view.y = py - ((py - doc.view.y) * nz) / doc.view.z;
    doc.view.z = nz;
  }

  $effect(() => {
    if (!svg) return;
    const el = svg;
    // The canvas sits inside a page, so a plain wheel scrolls the page; Ctrl/⌘+wheel
    // (and a trackpad pinch, which arrives as Ctrl+wheel) zooms. Dragging pans.
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      zoomAt(e.clientX, e.clientY, doc.view.z * Math.exp(-e.deltaY * 0.0025));
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  });

  function fit() {
    if (!svg || !doc.nodes.length) return;
    const r = svg.getBoundingClientRect();
    const xs = doc.nodes.map((n) => n.x);
    const ys = doc.nodes.map((n) => n.y);
    const x0 = Math.min(...xs) - 40;
    const y0 = Math.min(...ys) - 40;
    const x1 = Math.max(...xs) + NODE + 40;
    const y1 = Math.max(...ys) + NODE + 64;
    const z = Math.min(1.25, Math.max(0.3, Math.min(r.width / (x1 - x0), r.height / (y1 - y0))));
    doc.view.z = z;
    doc.view.x = (r.width - (x1 - x0) * z) / 2 - x0 * z;
    doc.view.y = (r.height - (y1 - y0) * z) / 2 - y0 * z;
  }

  // ── editing ─────────────────────────────────────────────────────────────
  function addNode(type: NodeType, x?: number, y?: number, from?: string) {
    checkpoint();
    let px = x;
    let py = y;
    if (px === undefined || py === undefined) {
      const src = from ? nodeById(doc, from) : undefined;
      if (src) {
        px = src.x + NODE + 128;
        py = src.y;
        while (doc.nodes.some((n) => Math.abs(n.x - px!) < NODE && Math.abs(n.y - py!) < NODE)) py += NODE + 48;
      } else {
        const r = svg!.getBoundingClientRect();
        const c = toWorld(r.left + r.width / 2, r.top + r.height / 2);
        px = c.x - NODE / 2;
        py = c.y - NODE / 2;
        while (doc.nodes.some((n) => Math.abs(n.x - px!) < NODE && Math.abs(n.y - py!) < NODE)) {
          px += 32;
          py += 32;
        }
      }
    }
    const n: CNode = { id: newId('n'), type, name: freshName(doc, type), x: snapTo(px), y: snapTo(py), params: defaults(type) };
    doc.nodes.push(n);
    selNodes = [n.id];
    selEdge = null;
    if (from && ruleFor(nodeById(doc, from)!.type, type)) connect(from, n.id, null, false);
    ensureVisible(n);
    return n;
  }

  /** Pans just enough to bring a node (and its label) into view. */
  function ensureVisible(n: CNode) {
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    const z = doc.view.z;
    const left = n.x * z + doc.view.x;
    const top = n.y * z + doc.view.y;
    const right = (n.x + NODE) * z + doc.view.x;
    const bottom = (n.y + NODE + 40) * z + doc.view.y;
    if (right > r.width - 24) doc.view.x -= right - r.width + 24;
    if (left < 24) doc.view.x += 24 - left;
    if (bottom > r.height - 24) doc.view.y -= bottom - r.height + 24;
    if (top < 24) doc.view.y += 24 - top;
  }

  function connect(fromId: string, toId: string, ev: PointerEvent | null, mark = true) {
    const a = nodeById(doc, fromId);
    const b = nodeById(doc, toId);
    if (!a || !b) return;
    const r = ruleFor(a.type, b.type);
    if (!r) {
      showToast([refusal(a.type, b.type)], 'error');
      return;
    }
    if (doc.edges.some((e) => e.from === fromId && e.to === toId)) {
      showToast([`${a.name} sudah terhubung ke ${b.name}.`], 'info');
      return;
    }
    if (mark) checkpoint();
    const e: CEdge = { id: newId('e'), from: fromId, to: toId, params: edgeDefaults(r) };
    doc.edges.push(e);
    const c = ctxOf(doc, e)!;
    const lines = [`✓ ${r.label}: ${a.name} → ${b.name}`];
    for (const nd of r.needs?.(c) ?? []) lines.push(`+ ${nd.role} untuk ${nd.who}`);
    const env = Object.keys(r.env?.(c) ?? {});
    if (env.length) lines.push(`+ env ${env.join(', ')} di ${a.name}`);
    showToast(lines, 'ok');
    if (ev) {
      selEdge = e.id;
      selNodes = [];
    }
  }

  function removeSelection() {
    if (!selNodes.length && !selEdge) return;
    checkpoint();
    const gone = new Set(selNodes);
    doc.nodes = doc.nodes.filter((n) => !gone.has(n.id));
    doc.edges = doc.edges.filter((e) => e.id !== selEdge && !gone.has(e.from) && !gone.has(e.to));
    selNodes = [];
    selEdge = null;
  }

  function duplicate() {
    if (!selNodes.length) return;
    checkpoint();
    const made: string[] = [];
    for (const id of selNodes) {
      const n = nodeById(doc, id);
      if (!n || SPECS[n.type].fixedName) continue;
      const c: CNode = { ...structuredClone($state.snapshot(n)), id: newId('n'), name: freshName(doc, n.type), x: n.x + 32, y: n.y + 32 };
      doc.nodes.push(c);
      made.push(c.id);
    }
    selNodes = made;
  }

  function tidy() {
    checkpoint();
    const rank: Record<string, number> = {};
    for (const n of doc.nodes) rank[n.id] = 0;
    for (let i = 0; i < doc.nodes.length; i++) for (const e of doc.edges) if (rank[e.to] < rank[e.from] + 1) rank[e.to] = Math.min(rank[e.from] + 1, 12);
    const cols: Record<number, CNode[]> = {};
    for (const n of doc.nodes) (cols[rank[n.id]] ??= []).push(n);
    const yOf: Record<string, number> = {};
    for (const k of Object.keys(cols).map(Number).sort((a, b) => a - b)) {
      const list = cols[k];
      const bary = (n: CNode) => {
        const ps = incoming(doc, n.id).map((e) => yOf[e.from]).filter((v) => v !== undefined);
        return ps.length ? ps.reduce((s, v) => s + v, 0) / ps.length : n.y;
      };
      list.sort((a, b) => bary(a) - bary(b));
      list.forEach((n, i) => {
        n.x = 48 + k * (NODE + 128);
        n.y = 48 + i * (NODE + 80);
        yOf[n.id] = n.y;
      });
    }
    setTimeout(fit, 0);
  }

  function setParam(target: { params: Params }, key: string, v: unknown) {
    target.params[key] = v;
  }

  function resetScenario() {
    checkpoint();
    const d = sc.build();
    doc.nodes = d.nodes;
    doc.edges = d.edges;
    report = null;
    traces = {};
    selNodes = [];
    selEdge = null;
    hintIdx = 0;
    clearWork('canvas', sc.id);
    setTimeout(fit, 0);
  }

  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  function showToast(lines: string[], level: 'ok' | 'error' | 'info') {
    toast = { lines, level };
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (toast = null), level === 'error' ? 9000 : 6000);
  }

  // ── deploy and test ─────────────────────────────────────────────────────
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  async function runDeploy(): Promise<DeployReport> {
    busy = 'deploy';
    const r = deploy($state.snapshot(doc) as Doc);
    report = r;
    traces = {};
    tab = 'log';
    shownEvents = 0;
    running = new Set(doc.nodes.filter((n) => n.type !== 'internet').map((n) => n.id));
    const step = reduced ? 0 : Math.max(25, Math.min(90, 2200 / r.events.length));
    for (let i = 0; i < r.events.length; i++) {
      shownEvents = i + 1;
      const id = r.events[i].nodeId;
      if (id && running.has(id)) {
        const next = new Set(running);
        next.delete(id);
        running = next;
      }
      if (step) await sleep(step);
    }
    running = new Set();
    busy = '';
    return r;
  }

  async function runTests(only?: string) {
    let r = fresh;
    if (!r) r = await runDeploy();
    busy = 'test';
    const starts = only ? [nodeById(doc, only)!] : testStarts(doc);
    const plain = $state.snapshot(doc) as Doc;
    const next: Record<string, Trace> = only ? { ...traces } : {};
    for (const s of starts) next[s.id] = trace(plain, r, s.id);
    traces = next;
    tab = sc.goals.length && !only ? 'goals' : 'sim';
    if (!starts.length) showToast(['Belum ada titik awal yang terhubung — sambungkan Internet, Scheduler, bucket, topic, atau compute ke layanan lain.'], 'info');
    if (!reduced) {
      const t0 = performance.now();
      const list: typeof pulses = [];
      for (const s of starts) next[s.id].hops.forEach((h, i) => h.edgeId && list.push({ edge: h.edgeId, ok: h.ok, t0: t0 + i * 380, dur: 650 }));
      pulses = list;
      animate();
    }
    busy = '';
  }

  async function deployAndTest() {
    await runDeploy();
    await runTests();
  }

  let raf = 0;
  function animate() {
    cancelAnimationFrame(raf);
    const tickFn = (t: number) => {
      now = t;
      if (pulses.some((p) => t < p.t0 + p.dur)) raf = requestAnimationFrame(tickFn);
      else pulses = [];
    };
    raf = requestAnimationFrame(tickFn);
  }
  onDestroy(() => cancelAnimationFrame(raf));

  function pulsePoint(p: { edge: string; t0: number; dur: number }) {
    const el = pathEls[p.edge];
    if (!el || now < p.t0) return null;
    const k = Math.min(1, (now - p.t0) / p.dur);
    const len = el.getTotalLength();
    return el.getPointAtLength(len * k);
  }

  // ── palette drag ────────────────────────────────────────────────────────
  let ghost = $state<{ type: NodeType; x: number; y: number } | null>(null);
  let palPointer = '';
  function paletteDown(e: PointerEvent, type: NodeType) {
    palPointer = e.pointerType;
    if (e.pointerType === 'touch') return; // touch: tap to add, so the list can scroll
    const sx = e.clientX;
    const sy = e.clientY;
    let dragging = false;
    const move = (ev: PointerEvent) => {
      if (!dragging && Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy) > 5) dragging = true;
      if (dragging) ghost = { type, x: ev.clientX, y: ev.clientY };
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      ghost = null;
      if (!dragging) {
        addNode(type, undefined, undefined, selNodes.length === 1 ? selNodes[0] : undefined);
        return;
      }
      const r = svg!.getBoundingClientRect();
      if (ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom) {
        const w = toWorld(ev.clientX, ev.clientY);
        addNode(type, w.x - NODE / 2, w.y - NODE / 2);
      }
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  // ── keyboard ────────────────────────────────────────────────────────────
  function onKey(e: KeyboardEvent) {
    const t = e.target as HTMLElement;
    if (t.closest('input, textarea, select')) return;
    if (!wrap?.contains(t) && t !== document.body) return;
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    } else if (mod && e.key.toLowerCase() === 'y') {
      e.preventDefault();
      redo();
    } else if (mod && e.key === 'Enter') {
      e.preventDefault();
      deployAndTest();
    } else if (mod && e.key.toLowerCase() === 'd') {
      e.preventDefault();
      duplicate();
    } else if (mod && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      selNodes = doc.nodes.map((n) => n.id);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      removeSelection();
    } else if (e.key === 'Escape') {
      selNodes = [];
      selEdge = null;
      mode = { kind: 'none' };
    } else if (e.key === '1') fit();
    else if (e.key === '0') doc.view.z = 1;
    else if (e.key === '+' || e.key === '=') zoomCenter(1.2);
    else if (e.key === '-') zoomCenter(1 / 1.2);
    else if (e.key.startsWith('Arrow') && selNodes.length) {
      e.preventDefault();
      checkpoint();
      const dx = e.key === 'ArrowLeft' ? -GRID : e.key === 'ArrowRight' ? GRID : 0;
      const dy = e.key === 'ArrowUp' ? -GRID : e.key === 'ArrowDown' ? GRID : 0;
      for (const id of selNodes) {
        const n = nodeById(doc, id);
        if (n) {
          n.x += dx;
          n.y += dy;
        }
      }
    }
  }
  function zoomCenter(f: number) {
    const r = svg!.getBoundingClientRect();
    zoomAt(r.left + r.width / 2, r.top + r.height / 2, doc.view.z * f);
  }

  // Fit the design on open, and again while the canvas changes size, until the user pans or zooms.
  let userMoved = false;
  $effect(() => {
    if (!svg) return;
    const ro = new ResizeObserver(() => {
      if (!userMoved) fit();
    });
    ro.observe(svg);
    return () => ro.disconnect();
  });

  // ── inspector helpers ───────────────────────────────────────────────────
  const fieldOpts = (f: Field, n: CNode): Opt[] => (typeof f.options === 'function' ? f.options(doc, n) : (f.options ?? []));
  const visible = (f: Field, target: { params: Params }, n: CNode) => !f.show || f.show(target.params, doc, n);
  const fieldIssues = (list: Issue[], key: string) => list.filter((i) => i.field === key);

  const filtered = $derived(
    SPEC_LIST.filter((s) => {
      const q = search.trim().toLowerCase();
      return !q || s.product.toLowerCase().includes(q) || s.abbr.toLowerCase().includes(q) || s.blurb.toLowerCase().includes(q);
    })
  );

  function addRow(target: { params: Params }, f: Field) {
    checkpoint();
    const row: Record<string, unknown> = {};
    for (const c of f.cols ?? []) row[c.key] = structuredClone(c.def);
    target.params[f.key] = [...rows(target.params, f.key), row];
  }
  function removeRow(target: { params: Params }, f: Field, i: number) {
    checkpoint();
    target.params[f.key] = rows(target.params, f.key).filter((_, k) => k !== i);
  }

  function setGrant(e: CEdge, id: string, v: boolean) {
    checkpoint();
    e.params.grant = { ...((e.params.grant as Record<string, boolean>) ?? {}), [id]: v };
  }

  const shortName = (s: string) => (s.length > 18 ? s.slice(0, 17) + '…' : s);
  const fmtT = (ms: number) => `${(ms / 1000).toFixed(3)}`;

  async function copyScript() {
    try {
      await navigator.clipboard.writeText(script($state.snapshot(doc) as Doc).join('\n'));
      copied = true;
      setTimeout(() => (copied = false), 1600);
    } catch {
      showToast(['Clipboard tidak tersedia — pilih teksnya dan salin manual.'], 'info');
    }
  }

  const traceList = $derived(fresh ? Object.values(traces) : []);
</script>

<svelte:window onkeydown={onKey} />

<LabHead {sc} mode="Kanvas layanan" story={sc.story} />

<div class="studio" bind:this={wrap}>
  <!-- palette -->
  <aside class="palette" aria-label="Palet layanan">
    <input class="search" type="search" placeholder="Cari layanan…" bind:value={search} aria-label="Cari layanan" />
    <div class="pal-scroll">
      {#each CATEGORIES as cat (cat.id)}
        {@const items = filtered.filter((s) => s.category === cat.id)}
        {#if items.length}
          <p class="pal-cat">{cat.label}</p>
          <ul>
            {#each items as s (s.type)}
              <li>
                <button
                  class="pal-item"
                  data-cat={s.category}
                  title={s.blurb}
                  onpointerdown={(e) => paletteDown(e, s.type)}
                  onclick={(e) => {
                    // Mouse adds on pointerup (drag or click); touch taps and keyboard add here.
                    if (palPointer === 'touch' || e.detail === 0) addNode(s.type, undefined, undefined, selNodes.length === 1 ? selNodes[0] : undefined);
                    palPointer = '';
                  }}
                >
                  <span class="chip mono">{s.abbr}</span>
                  <span class="pal-name">{s.product}</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      {/each}
    </div>
    <p class="pal-tip">Seret ke kanvas, atau klik: ditaruh di tengah — atau di kanan layanan terpilih dan langsung disambungkan.</p>
  </aside>

  <!-- canvas -->
  <section class="board">
    <div class="toolbar">
      <button class="btn btn-primary sm" onclick={deployAndTest} disabled={!!busy} title="Ctrl+Enter">
        {busy === 'deploy' ? 'Men-deploy…' : busy === 'test' ? 'Menguji…' : 'Deploy & uji'}
      </button>
      <button class="btn btn-secondary sm" onclick={() => runTests(selNodes[0])} disabled={!!busy || selNodes.length !== 1 || !outgoing(doc, selNodes[0]).length}>Uji dari node terpilih</button>
      <span class="sep" aria-hidden="true"></span>
      <button class="icon-btn" onclick={undo} disabled={!past.length} title="Undo (Ctrl+Z)" aria-label="Undo">↶</button>
      <button class="icon-btn" onclick={redo} disabled={!future.length} title="Redo (Ctrl+Shift+Z)" aria-label="Redo">↷</button>
      <button class="icon-btn" onclick={() => zoomCenter(1 / 1.2)} title="Perkecil (-)" aria-label="Perkecil">−</button>
      <span class="zoom mono">{Math.round(doc.view.z * 100)}%</span>
      <button class="icon-btn" onclick={() => zoomCenter(1.2)} title="Perbesar (+)" aria-label="Perbesar">+</button>
      <button class="btn btn-ghost sm" onclick={fit} title="1">Pas layar</button>
      <button class="btn btn-ghost sm" onclick={tidy}>Rapikan</button>
      <span class="grow"></span>
      {#if sc.goals.length}
        <button class="goal-pill mono" class:done={allDone} onclick={() => (tab = 'goals')}>Tujuan {goalsDone}/{sc.goals.length}</button>
      {/if}
      {#if report && !fresh}<span class="stale">Desain berubah — deploy ulang</span>{/if}
    </div>

    <div class="canvas-wrap">
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <svg
        bind:this={svg}
        class="canvas"
        class:panning={mode.kind === 'pan'}
        onpointerdown={onDown}
        onpointermove={onMove}
        onpointerup={onUp}
        onpointercancel={onUp}
        role="application"
        aria-label="Kanvas desain arsitektur"
      >
        <defs>
          <pattern id="dots" width={GRID * doc.view.z} height={GRID * doc.view.z} patternUnits="userSpaceOnUse" x={doc.view.x} y={doc.view.y}>
            <circle cx="1" cy="1" r="1" class="dot" />
          </pattern>
          {#each ['idle', 'ok', 'warn', 'error', 'sel', 'draft'] as c (c)}
            <marker id={`arrow-${c}`} viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" class={`arrow ${c}`} />
            </marker>
          {/each}
        </defs>
        <rect class="bg" width="100%" height="100%" fill="url(#dots)" />
        <g transform={`translate(${doc.view.x},${doc.view.y}) scale(${doc.view.z})`}>
          {#each doc.edges as e (e.id)}
            {@const g = edgeGeo(e)}
            {@const c = ctxOf(doc, e)}
            {#if g && c}
              {@const light = selEdge === e.id ? 'sel' : edgeLight(e)}
              {@const dashed = c.rule.kind === 'identity' || c.rule.kind === 'network' || c.rule.kind === 'image'}
              <g class="edge" data-edge={e.id} class:selected={selEdge === e.id}>
                <path d={g.d} class="hit" />
                <path d={g.d} class={`line ${light}`} class:dashed bind:this={pathEls[e.id]} marker-end={`url(#arrow-${light})`} />
                {#if selEdge === e.id || light === 'error'}
                  <g transform={`translate(${g.mx},${g.my})`} class="edge-label">
                    <rect x={-c.rule.label.length * 3.3 - 8} y="-11" width={c.rule.label.length * 6.6 + 16} height="22" rx="11" />
                    <text text-anchor="middle" dy="4">{c.rule.label}</text>
                  </g>
                {/if}
              </g>
            {/if}
          {/each}

          {#if mode.kind === 'connect'}
            {@const a = nodeById(doc, mode.from)}
            {#if a}
              <path d={curve(a.x + NODE, a.y + NODE / 2, mode.x, mode.y).d} class="line draft" marker-end="url(#arrow-draft)" />
            {/if}
          {/if}

          {#each doc.nodes as n (n.id)}
            {@const spec = SPECS[n.type]}
            {@const probs = nodeProblems[n.id]}
            {@const errs = probs.filter((i) => i.level === 'error').length}
            {@const warns = probs.filter((i) => i.level === 'warn').length}
            {@const st = nodeStatus(n.id)}
            <g
              class="node"
              data-node={n.id}
              data-cat={spec.category}
              data-status={st}
              class:selected={selNodes.includes(n.id)}
              transform={`translate(${n.x},${n.y})`}
              tabindex="0"
              role="button"
              aria-label={`${spec.product} ${n.name}${errs ? `, ${errs} masalah` : ''}`}
              onkeydown={(e) => {
                if (e.key === 'Enter') selNodes = [n.id];
              }}
            >
              <rect class="halo" x="-6" y="-6" width={NODE + 12} height={NODE + 12} rx="16" />
              <rect class="tile" class:entry={spec.category === 'entry'} width={NODE} height={NODE} rx={spec.category === 'entry' ? 0 : 12} />
              {#if spec.category === 'entry'}<path class="tile-d" d={`M36,0 H${NODE - 12} Q${NODE},0 ${NODE},12 V${NODE - 12} Q${NODE},${NODE} ${NODE - 12},${NODE} H36 A36,36 0 0 1 0,${NODE - 36} V36 A36,36 0 0 1 36,0 Z`} />{/if}
              <rect class="band" x="14" y="14" width="22" height="4" rx="2" />
              <text class="abbr" x={NODE / 2} y={NODE / 2 + 7} text-anchor="middle">{spec.abbr}</text>
              {#if spec.inputs}<circle class="handle in" cx="0" cy={NODE / 2} r="6" data-handle="in" data-id={n.id} />{/if}
              {#if spec.outputs}<circle class="handle out" cx={NODE} cy={NODE / 2} r="7" data-handle="out" data-id={n.id} />{/if}
              {#if errs || warns}
                <g transform={`translate(${NODE - 8},8)`} class="badge" class:warnb={!errs}>
                  <circle r="10" />
                  <text text-anchor="middle" dy="4">{errs || warns}</text>
                </g>
              {/if}
              {#if st === 'ok' || st === 'warn' || st === 'error'}
                <text class={`glyph ${st}`} x={NODE - 12} y={NODE - 10} text-anchor="middle">{st === 'ok' ? '✓' : st === 'warn' ? '!' : '✕'}</text>
              {/if}
              <text class="label" x={NODE / 2} y={NODE + 20} text-anchor="middle">{shortName(n.name)}</text>
              <text class="sublabel" x={NODE / 2} y={NODE + 35} text-anchor="middle">{shortName(spec.product)}</text>
            </g>
          {/each}

          {#each pulses as p, i (i)}
            {@const pt = pulsePoint(p)}
            {#if pt}<circle class="pulse" class:bad={!p.ok} cx={pt.x} cy={pt.y} r="6" />{/if}
          {/each}

          {#if mode.kind === 'marquee'}
            <rect class="marquee" x={Math.min(mode.x0, mode.x1)} y={Math.min(mode.y0, mode.y1)} width={Math.abs(mode.x1 - mode.x0)} height={Math.abs(mode.y1 - mode.y0)} />
          {/if}
        </g>
      </svg>

      {#if !doc.nodes.length}
        <div class="empty">
          <p>Kanvas kosong. Seret layanan dari palet, atau klik salah satunya.</p>
        </div>
      {/if}

      {#if toast}
        <div class="toast" data-level={toast.level} role="status">
          {#each toast.lines as l, i (i)}<p class:head={i === 0}>{l}</p>{/each}
        </div>
      {/if}

      <p class="canvas-help">Seret latar untuk menggeser · Ctrl+scroll untuk zoom · Shift+seret untuk memilih banyak · tarik dari titik kanan ke layanan lain untuk menyambung · Delete menghapus</p>
    </div>
  </section>

  <!-- inspector -->
  <aside class="inspector" aria-label="Konfigurasi">
    {#if node}
      {@const spec = SPECS[node.type]}
      {@const probs = nodeProblems[node.id]}
      <div class="insp-head" data-cat={spec.category}>
        <span class="chip mono">{spec.abbr}</span>
        <div>
          <p class="eyebrow">{spec.product}</p>
          <p class="blurb">{spec.blurb}</p>
        </div>
      </div>

      <label class="field">
        <span class="flabel">Nama</span>
        <input
          type="text"
          value={node.name}
          readonly={spec.fixedName}
          onfocus={checkpoint}
          oninput={(e) => (node.name = e.currentTarget.value.trim())}
          class:bad={fieldIssues(probs, 'name').length > 0}
          spellcheck="false"
        />
        {#each fieldIssues(probs, 'name') as i, k (k)}<span class="fmsg {i.level}">{i.msg}</span>{/each}
      </label>

      {@render form(node, node, spec.fields.filter((f) => !f.advanced), probs)}
      {#if spec.fields.some((f) => f.advanced)}
        <button class="adv-toggle" onclick={() => (advanced = !advanced)} aria-expanded={advanced}>{advanced ? '▾' : '▸'} Setelan lanjutan</button>
        {#if advanced}{@render form(node, node, spec.fields.filter((f) => f.advanced), probs)}{/if}
      {/if}

      {#if spec.runtime}
        {@const sa = runtimeSa(doc, node)}
        <p class="identity">Identitas: <span class="mono">{sa.email}</span>{#if sa.isDefault}<span class="tag warn">default</span>{/if}</p>
      {/if}

      {#if probs.filter((i) => !i.field).length}
        <ul class="issues">
          {#each probs.filter((i) => !i.field) as i, k (k)}<li class={i.level}>{i.msg}</li>{/each}
        </ul>
      {/if}

      {@const outs = outgoing(doc, node.id)}
      {@const ins = incoming(doc, node.id)}
      {#if outs.length || ins.length}
        <p class="sec">Koneksi</p>
        <ul class="conns">
          {#each [...ins, ...outs] as e (e.id)}
            {@const c = ctxOf(doc, e)}
            {#if c}
              <li>
                <button onclick={() => ((selEdge = e.id), (selNodes = []))}>
                  <span class="mono">{c.src.name} → {c.dst.name}</span>
                  <span class="conn-kind">{c.rule.label}</span>
                </button>
              </li>
            {/if}
          {/each}
        </ul>
      {/if}

      {@const wiring = wiringFor(doc, node)}
      {#if Object.keys(wiring.env).length || wiring.secrets.length}
        <p class="sec">Diisi otomatis oleh koneksi</p>
        <ul class="env mono">
          {#each Object.entries(wiring.env) as [k, v] (k)}<li>{k}={v}</li>{/each}
          {#each wiring.secrets as s (s)}<li>secret {s}</li>{/each}
        </ul>
      {/if}

      <p class="sec">Perintah gcloud setara</p>
      <pre class="code">{nodeCommands(doc, node).join('\n')}</pre>

      <div class="insp-actions">
        {#if outs.length}<button class="btn btn-secondary sm" onclick={() => runTests(node.id)} disabled={!!busy}>Uji dari sini</button>{/if}
        {#if !spec.fixedName}<button class="btn btn-ghost sm" onclick={duplicate}>Duplikat</button>{/if}
        <button class="btn btn-ghost sm danger" onclick={removeSelection}>Hapus</button>
      </div>
    {:else if edge && edgeCtx}
      {@const c = edgeCtx}
      <div class="insp-head" data-cat={SPECS[c.src.type].category}>
        <span class="chip mono">{c.rule.proto}</span>
        <div>
          <p class="eyebrow">{c.rule.label}</p>
          <p class="mono route">{c.src.name} → {c.dst.name}</p>
        </div>
      </div>
      <p class="blurb">{c.rule.explain}</p>

      {#if c.rule.fields?.length}
        {@render form(c.src, edge, c.rule.fields, edgeProblems[edge.id])}
      {/if}

      {#each edgeProblems[edge.id] as i, k (k)}<p class="fmsg {i.level}">{i.msg}</p>{/each}

      {@const needs = c.rule.needs?.(c) ?? []}
      {#if needs.length}
        <p class="sec">IAM yang dibutuhkan</p>
        <ul class="needs">
          {#each needs as nd (nd.id)}
            <li class:off={!granted(edge, nd.id)}>
              <label>
                <input type="checkbox" checked={granted(edge, nd.id)} onchange={(e) => setGrant(edge, nd.id, e.currentTarget.checked)} />
                <span>
                  <span class="mono role">{nd.role}</span>
                  <span class="who">untuk {nd.who} di {nd.on}</span>
                  <span class="tag">{nd.phase === 'deploy' ? 'dicek saat deploy' : 'dicek saat request'}</span>
                </span>
              </label>
            </li>
          {/each}
        </ul>
        <p class="note">Dicentang = role diberikan (seperti Application Design Center). Hapus centang untuk melihat apa yang terjadi tanpa role itu.</p>
      {:else if c.rule.kind !== 'network'}
        <p class="note">Koneksi ini tidak butuh role IAM tambahan.</p>
      {/if}

      {@const env = c.rule.env?.(c) ?? {}}
      {#if Object.keys(env).length}
        <p class="sec">Env var untuk {c.src.name}</p>
        <ul class="env mono">
          {#each Object.entries(env) as [k, v] (k)}<li>{k}={v}</li>{/each}
        </ul>
      {/if}

      {@const cmds = edgeCommands(doc, edge)}
      {#if cmds.length}
        <p class="sec">Perintah gcloud setara</p>
        <pre class="code">{cmds.join('\n')}</pre>
      {/if}
      <div class="insp-actions">
        <button class="btn btn-ghost sm danger" onclick={removeSelection}>Hapus koneksi</button>
      </div>
    {:else if selNodes.length > 1}
      <p class="sec">{selNodes.length} layanan dipilih</p>
      <div class="insp-actions">
        <button class="btn btn-ghost sm" onclick={duplicate}>Duplikat</button>
        <button class="btn btn-ghost sm danger" onclick={removeSelection}>Hapus</button>
      </div>
    {:else}
      <p class="eyebrow">Konfigurasi</p>
      <p class="blurb">Pilih layanan untuk mengatur konfigurasinya, atau klik koneksi untuk melihat mekanisme, role IAM, dan perintah gcloud-nya.</p>
      <ul class="legend">
        <li><span class="sw ok"></span>Koneksi/hop berhasil</li>
        <li><span class="sw warn"></span>Berhasil dengan peringatan</li>
        <li><span class="sw error"></span>Gagal — klik untuk alasannya</li>
        <li><span class="sw idle dashed"></span>Identitas, jaringan, sumber image</li>
      </ul>
      <p class="note">Shortcut: Ctrl+Enter deploy & uji · Ctrl+Z/Ctrl+Shift+Z undo/redo · Ctrl+D duplikat · 1 pas layar · panah menggeser.</p>
    {/if}
  </aside>

  <!-- bottom panel -->
  <section class="panel">
    <div class="tabs" role="tablist">
      {#if sc.goals.length}<button role="tab" aria-selected={tab === 'goals'} class:on={tab === 'goals'} onclick={() => (tab = 'goals')}>Tujuan <span class="mono">{goalsDone}/{sc.goals.length}</span></button>{/if}
      <button role="tab" aria-selected={tab === 'issues'} class:on={tab === 'issues'} onclick={() => (tab = 'issues')}>Masalah <span class="mono">{allProblems.length}</span></button>
      <button role="tab" aria-selected={tab === 'log'} class:on={tab === 'log'} onclick={() => (tab = 'log')}>Log deploy</button>
      <button role="tab" aria-selected={tab === 'sim'} class:on={tab === 'sim'} onclick={() => (tab = 'sim')}>Simulasi</button>
      <button role="tab" aria-selected={tab === 'script'} class:on={tab === 'script'} onclick={() => (tab = 'script')}>Skrip gcloud</button>
      <span class="grow"></span>
      <button class="btn btn-ghost sm" onclick={resetScenario}>Mulai ulang</button>
    </div>

    <div class="tab-body">
      {#if tab === 'goals'}
        <div class="goals">
          <div class="bar" aria-hidden="true"><span style:width={`${(goalsDone / Math.max(1, sc.goals.length)) * 100}%`}></span></div>
          <ol>
            {#each sc.goals as g, i (g.label)}
              <li class:ok={goalState[i]}><span class="mark" aria-hidden="true">{goalState[i] ? '✓' : i + 1}</span>{g.label}</li>
            {/each}
          </ol>
          {#if !fresh}<p class="note">Tujuan yang butuh deploy atau uji baru dicek setelah "Deploy & uji".</p>{/if}
          {#if allDone}
            <div class="lesson"><p class="eyebrow">Selesai — pelajarannya</p><p>{sc.lesson}</p></div>
          {:else if sc.hints.length}
            <div class="hints">
              {#each sc.hints.slice(0, hintIdx) as h, i (i)}<p>💡 {h}</p>{/each}
              {#if hintIdx < sc.hints.length}<button class="btn btn-ghost sm" onclick={() => hintIdx++}>Petunjuk {hintIdx + 1}/{sc.hints.length}</button>{/if}
            </div>
          {/if}
        </div>
      {:else if tab === 'issues'}
        {#if allProblems.length}
          <ul class="plist">
            {#each allProblems as p, i (i)}
              <li class={p.level}>
                <button onclick={() => (p.node ? ((selNodes = [p.node]), (selEdge = null)) : ((selEdge = p.edge), (selNodes = [])))}>
                  <span class="mono at">{p.at}</span>
                  <span>{p.msg}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="note">Tidak ada masalah konfigurasi. Tekan Deploy & uji untuk mencoba desainnya.</p>
        {/if}
      {:else if tab === 'log'}
        {#if report}
          {#if !fresh}<p class="note stale-note">Log ini dari desain sebelumnya — deploy ulang setelah mengubah.</p>{/if}
          <ul class="log mono">
            {#each report.events.slice(0, busy === 'deploy' ? shownEvents : report.events.length) as ev, i (i)}
              <li class={ev.level}>
                <button onclick={() => (ev.nodeId ? ((selNodes = [ev.nodeId]), (selEdge = null)) : ev.edgeId ? ((selEdge = ev.edgeId), (selNodes = [])) : null)}>
                  <span class="t">{fmtT(ev.t)}</span>
                  <span>{ev.text}</span>
                </button>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="note">Belum ada deploy.</p>
        {/if}
      {:else if tab === 'sim'}
        {#if traceList.length}
          {#each traceList as tr (tr.start)}
            <div class="trace">
              <p class="trace-head" class:ok={tr.ok}>{tr.ok ? '✓' : '✕'} Dari {nodeById(doc, tr.start)?.name ?? '?'} — {SPECS[nodeById(doc, tr.start)?.type ?? 'internet'].entry ?? 'request'}</p>
              <table class="events">
                <thead><tr><th>Waktu (s)</th><th>Dari</th><th>Ke</th><th>Tipe</th><th>Hasil</th></tr></thead>
                <tbody>
                  {#each tr.hops as h, i (i)}
                    <tr class:bad={!h.ok}>
                      <td class="mono">{fmtT(h.t)}</td>
                      <td class="mono">{h.from}</td>
                      <td class="mono">{h.to}</td>
                      <td>{h.proto}</td>
                      <td>
                        <button class="hop" onclick={() => h.edgeId && ((selEdge = h.edgeId), (selNodes = []))}>{h.text}</button>
                        {#each h.detail as dl, k (k)}<span class="detail">{dl}</span>{/each}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/each}
        {:else}
          <p class="note">Belum ada uji. "Deploy & uji" mengirim request dari setiap titik awal (Internet, Scheduler, bucket, topic, build, sink, atau compute yang memulai alur), lalu menelusurinya hop demi hop — jaringan dan IAM dicek di setiap hop.</p>
        {/if}
      {:else if tab === 'script'}
        <div class="script-head">
          <p class="note">Desain ini sebagai skrip gcloud, berurutan seperti pembuatannya.</p>
          <button class="btn btn-secondary sm" onclick={copyScript}>{copied ? 'Tersalin ✓' : 'Salin'}</button>
        </div>
        <pre class="code big">{script(doc).join('\n')}</pre>
      {/if}
    </div>
  </section>
</div>

{#if ghost}
  <div class="ghost" style:left={`${ghost.x}px`} style:top={`${ghost.y}px`} data-cat={SPECS[ghost.type].category}>
    <span class="chip mono">{SPECS[ghost.type].abbr}</span>{SPECS[ghost.type].product}
  </div>
{/if}

{#snippet form(n: CNode, target: { params: Params }, fields: Field[], probs: Issue[])}
  {#each fields as f (f.key)}
    {#if visible(f, target, n)}
      {#if f.type === 'bool'}
        <label class="field check">
          <input
            type="checkbox"
            checked={target.params[f.key] === true}
            onchange={(e) => {
              checkpoint();
              setParam(target, f.key, e.currentTarget.checked);
            }}
          />
          <span class="flabel">{f.label}</span>
          {#if f.help}<span class="help">{f.help}</span>{/if}
          {#each fieldIssues(probs, f.key) as i, k (k)}<span class="fmsg {i.level}">{i.msg}</span>{/each}
        </label>
      {:else if f.type === 'select'}
        <label class="field">
          <span class="flabel">{f.label}</span>
          <select
            value={String(target.params[f.key] ?? '')}
            onchange={(e) => {
              checkpoint();
              setParam(target, f.key, e.currentTarget.value);
            }}
            class:bad={fieldIssues(probs, f.key).some((i) => i.level === 'error')}
          >
            {#each fieldOpts(f, n) as o (o.value)}<option value={o.value}>{o.label}</option>{/each}
          </select>
          {#if f.help}<span class="help">{f.help}</span>{/if}
          {#each fieldIssues(probs, f.key) as i, k (k)}<span class="fmsg {i.level}">{i.msg}</span>{/each}
        </label>
      {:else if f.type === 'rows'}
        <div class="field">
          <span class="flabel">{f.label}</span>
          <div class="rows">
            {#each rows(target.params, f.key) as row, ri (ri)}
              <div class="row">
                {#each f.cols ?? [] as col (col.key)}
                  {#if col.type === 'bool'}
                    <label class="cell tiny"><input type="checkbox" checked={row[col.key] === true} onchange={(e) => { checkpoint(); row[col.key] = e.currentTarget.checked; }} />{col.label}</label>
                  {:else if col.type === 'select'}
                    <select class="cell" value={String(row[col.key] ?? '')} onchange={(e) => { checkpoint(); row[col.key] = e.currentTarget.value; }} aria-label={col.label}>
                      {#each fieldOpts(col, n) as o (o.value)}<option value={o.value}>{o.value}</option>{/each}
                    </select>
                  {:else}
                    <input class="cell mono" value={String(row[col.key] ?? '')} placeholder={col.label} aria-label={col.label} onfocus={checkpoint} oninput={(e) => (row[col.key] = e.currentTarget.value)} spellcheck="false" />
                  {/if}
                {/each}
                <button class="rm" onclick={() => removeRow(target, f, ri)} aria-label="Hapus baris">×</button>
              </div>
            {/each}
            <button class="btn btn-ghost sm add" onclick={() => addRow(target, f)}>+ Tambah</button>
          </div>
          {#each fieldIssues(probs, f.key) as i, k (k)}<span class="fmsg {i.level}">{i.msg}</span>{/each}
        </div>
      {:else}
        <label class="field">
          <span class="flabel">{f.label}{f.unit ? ` (${f.unit})` : ''}</span>
          <input
            type={f.type === 'number' ? 'number' : 'text'}
            value={target.params[f.key] === undefined ? '' : String(target.params[f.key])}
            min={f.min}
            max={f.max}
            step={f.step}
            placeholder={f.placeholder}
            onfocus={checkpoint}
            oninput={(e) => setParam(target, f.key, f.type === 'number' ? (e.currentTarget.value === '' ? '' : Number(e.currentTarget.value)) : e.currentTarget.value)}
            class:bad={fieldIssues(probs, f.key).some((i) => i.level === 'error')}
            class:mono={f.type === 'text'}
            spellcheck="false"
          />
          {#if f.help}<span class="help">{f.help}</span>{/if}
          {#each fieldIssues(probs, f.key) as i, k (k)}<span class="fmsg {i.level}">{i.msg}</span>{/each}
        </label>
      {/if}
    {/if}
  {/each}
{/snippet}

<style>
  .studio {
    --cat-entry: #8b8a85;
    --cat-compute: #4c7bd9;
    --cat-network: #8b6fd6;
    --cat-data: #2f9e74;
    --cat-messaging: #d9822b;
    --cat-ops: #9a8f6a;
    display: grid;
    grid-template-columns: 210px minmax(0, 1fr) 340px;
    grid-template-areas:
      'pal board insp'
      'pal panel insp';
    gap: 12px;
    align-items: start;
  }

  [data-cat='entry'] {
    --cat: var(--cat-entry);
  }
  [data-cat='compute'] {
    --cat: var(--cat-compute);
  }
  [data-cat='network'] {
    --cat: var(--cat-network);
  }
  [data-cat='data'] {
    --cat: var(--cat-data);
  }
  [data-cat='messaging'] {
    --cat: var(--cat-messaging);
  }
  [data-cat='ops'] {
    --cat: var(--cat-ops);
  }

  /* palette */
  .palette {
    grid-area: pal;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: sticky;
    top: calc(var(--header-h) + 12px);
    max-height: calc(100vh - var(--header-h) - 24px);
  }

  .search {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-size: 13.5px;
    border-radius: var(--radius-control);
  }

  .pal-scroll {
    overflow: auto;
    min-height: 0;
    padding-right: 2px;
  }

  .pal-cat {
    margin: 10px 0 4px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .pal-scroll ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .pal-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 5px 6px;
    border: 1px solid transparent;
    background: transparent;
    text-align: left;
    font-size: 13px;
    line-height: 1.25;
    cursor: grab;
    touch-action: pan-y;
  }

  .pal-item:hover {
    border-color: var(--line-strong);
    background: var(--surface);
  }

  .chip {
    flex: none;
    min-width: 34px;
    padding: 3px 4px;
    font-size: 10.5px;
    font-weight: 700;
    text-align: center;
    color: #fff;
    background: var(--cat, var(--ink));
    border-radius: 4px;
  }

  .pal-tip {
    font-size: 12px;
    line-height: 1.45;
    color: var(--text-tertiary);
  }

  /* board */
  .board {
    grid-area: board;
    min-width: 0;
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 8px;
  }

  .sep {
    width: 1px;
    height: 22px;
    background: var(--line-strong);
    margin: 0 4px;
  }

  .grow {
    flex: 1;
  }

  .icon-btn {
    width: 30px;
    height: 30px;
    display: grid;
    place-items: center;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    font-size: 16px;
    line-height: 1;
    border-radius: var(--radius-control);
  }

  .icon-btn:disabled {
    opacity: 0.4;
    cursor: default;
  }

  .zoom {
    min-width: 42px;
    text-align: center;
    font-size: 12px;
    color: var(--text-secondary);
  }

  .goal-pill {
    padding: 5px 10px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    font-size: 12px;
    border-radius: 999px;
  }

  .goal-pill.done {
    background: var(--mint);
    border-color: var(--mint);
    color: #1a1a1a;
  }

  .stale {
    font-size: 12px;
    color: var(--amber);
  }

  .canvas-wrap {
    position: relative;
    border: 1px solid var(--line-strong);
    background: var(--bg-elevated);
    height: clamp(460px, 64vh, 760px);
    overflow: hidden;
  }

  .canvas {
    display: block;
    width: 100%;
    height: 100%;
    touch-action: none;
    user-select: none;
    cursor: default;
  }

  .canvas.panning {
    cursor: grabbing;
  }

  .bg {
    fill: url(#dots);
  }

  .dot {
    fill: var(--line-strong);
  }

  /* edges — link lights */
  .edge .hit {
    fill: none;
    stroke: transparent;
    stroke-width: 18;
    cursor: pointer;
  }

  .line {
    fill: none;
    stroke-width: 2;
    stroke-linecap: square;
    pointer-events: none;
  }

  .line.dashed {
    stroke-dasharray: 5 6;
  }

  .line.idle {
    stroke: var(--text-tertiary);
  }
  .arrow.idle {
    fill: var(--text-tertiary);
  }
  .line.ok {
    stroke: var(--green);
  }
  .arrow.ok {
    fill: var(--green);
  }
  .line.warn {
    stroke: var(--amber);
  }
  .arrow.warn {
    fill: var(--amber);
  }
  .line.error {
    stroke: var(--red);
  }
  .arrow.error {
    fill: var(--red);
  }
  .line.sel {
    stroke: var(--ink);
  }
  .arrow.sel {
    fill: var(--ink);
  }
  .line.draft {
    stroke: var(--ink);
    stroke-dasharray: 4 4;
  }
  .arrow.draft {
    fill: var(--ink);
  }

  .arrow {
    stroke: none !important;
  }

  .line.sel,
  .edge:hover .line {
    stroke-width: 3;
  }

  .edge-label rect {
    fill: var(--surface);
    stroke: var(--line-strong);
  }

  .edge-label text {
    font-size: 11px;
    fill: var(--text);
    font-family: var(--font);
  }

  /* nodes */
  .node {
    cursor: grab;
    outline: none;
  }

  .node .halo {
    fill: none;
    stroke: transparent;
    stroke-width: 6;
  }

  .node.selected .halo,
  .node:focus-visible .halo {
    stroke: var(--mint-soft);
    stroke-width: 6;
  }

  .tile {
    fill: var(--surface);
    stroke: var(--line-strong);
    stroke-width: 1.5;
  }

  .tile.entry {
    fill: none;
    stroke: none;
  }

  .tile-d {
    fill: var(--surface);
    stroke: var(--line-strong);
    stroke-width: 1.5;
  }

  .node.selected .tile,
  .node.selected .tile-d {
    stroke: var(--ink);
  }

  .node[data-status='ok'] .tile,
  .node[data-status='ok'] .tile-d {
    stroke: var(--green);
    stroke-width: 2;
  }
  .node[data-status='warn'] .tile,
  .node[data-status='warn'] .tile-d {
    stroke: var(--amber);
    stroke-width: 2;
  }
  .node[data-status='error'] .tile,
  .node[data-status='error'] .tile-d {
    stroke: var(--red);
    stroke-width: 2;
  }
  .node[data-status='running'] .tile,
  .node[data-status='running'] .tile-d {
    stroke: #ff6d5a;
    stroke-width: 2.5;
    stroke-dasharray: 10 6;
    animation: march 0.8s linear infinite;
  }

  @keyframes march {
    to {
      stroke-dashoffset: -32;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .node[data-status='running'] .tile,
    .node[data-status='running'] .tile-d {
      animation: none;
    }
  }

  .band {
    fill: var(--cat);
  }

  .abbr {
    font-family: var(--font-mono);
    font-size: 19px;
    font-weight: 700;
    fill: var(--cat);
    pointer-events: none;
  }

  .handle {
    fill: var(--surface);
    stroke: var(--text-tertiary);
    stroke-width: 1.5;
  }

  .handle.out {
    cursor: crosshair;
  }

  .handle.out:hover,
  .node.selected .handle.out {
    fill: var(--mint);
    stroke: var(--ink);
  }

  .badge circle {
    fill: var(--red);
  }

  .badge.warnb circle {
    fill: var(--amber);
  }

  .badge text {
    fill: #fff;
    font-size: 11px;
    font-weight: 700;
    font-family: var(--font);
  }

  .glyph {
    font-size: 14px;
    font-weight: 700;
  }
  .glyph.ok {
    fill: var(--green);
  }
  .glyph.warn {
    fill: var(--amber);
  }
  .glyph.error {
    fill: var(--red);
  }

  .label {
    font-family: var(--font);
    font-size: 13px;
    font-weight: 600;
    fill: var(--text);
    pointer-events: none;
  }

  .sublabel {
    font-family: var(--font);
    font-size: 10.5px;
    fill: var(--text-tertiary);
    pointer-events: none;
  }

  .pulse {
    fill: var(--mint);
    stroke: var(--ink);
    stroke-width: 1.5;
    pointer-events: none;
  }

  .pulse.bad {
    fill: var(--red);
  }

  .marquee {
    fill: var(--mint-soft);
    stroke: var(--ink);
    stroke-dasharray: 4 3;
    stroke-width: 1;
  }

  .empty {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    color: var(--text-tertiary);
    font-size: 14px;
  }

  .toast {
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    max-width: min(560px, 92%);
    padding: 10px 14px;
    background: var(--surface);
    border: 1px solid var(--line-strong);
    border-left: 4px solid var(--green);
    font-size: 13px;
    line-height: 1.45;
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  }

  .toast[data-level='error'] {
    border-left-color: var(--red);
  }

  .toast[data-level='info'] {
    border-left-color: var(--amber);
  }

  .toast p + p {
    margin-top: 2px;
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--text-secondary);
  }

  .toast .head {
    font-weight: 600;
  }

  .canvas-help {
    position: absolute;
    left: 10px;
    bottom: 8px;
    right: 10px;
    font-size: 11.5px;
    color: var(--text-tertiary);
    pointer-events: none;
  }

  /* inspector */
  .inspector {
    grid-area: insp;
    position: sticky;
    top: calc(var(--header-h) + 12px);
    max-height: calc(100vh - var(--header-h) - 24px);
    overflow: auto;
    padding: 14px 14px 18px;
    border: 1px solid var(--line);
    background: var(--surface);
  }

  .insp-head {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    padding-bottom: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--line);
  }

  .insp-head .chip {
    min-width: 42px;
    padding: 6px 4px;
    font-size: 11.5px;
  }

  .blurb {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .route {
    margin-top: 4px;
    font-size: 13px;
    word-break: break-all;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 10px;
  }

  .field.check {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .field.check .help,
  .field.check .fmsg {
    flex-basis: 100%;
  }

  .flabel {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-strong-secondary);
  }

  .field input[type='text'],
  .field input[type='number'],
  .field select,
  .cell {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--line-strong);
    background: var(--bg);
    color: var(--text);
    font: inherit;
    font-size: 13px;
    border-radius: var(--radius-control);
  }

  .field input.mono {
    font-family: var(--font-mono);
    font-size: 12.5px;
  }

  .field .bad {
    border-color: var(--red);
  }

  .help {
    font-size: 12px;
    line-height: 1.4;
    color: var(--text-tertiary);
  }

  .fmsg {
    display: block;
    font-size: 12px;
    line-height: 1.45;
  }

  .fmsg.error {
    color: var(--red);
  }
  .fmsg.warn {
    color: var(--amber);
  }
  .fmsg.info {
    color: var(--text-tertiary);
  }

  .adv-toggle {
    margin-top: 14px;
    border: 0;
    background: none;
    padding: 0;
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
  }

  .rows {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr)) 24px;
    gap: 4px;
    align-items: center;
  }

  .cell {
    padding: 4px 6px;
    font-size: 12px;
  }

  .cell.tiny {
    display: flex;
    align-items: center;
    gap: 3px;
    border: 0;
    padding: 0;
    background: none;
    font-size: 11.5px;
  }

  .rm {
    width: 24px;
    height: 24px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    line-height: 1;
  }

  .add {
    align-self: flex-start;
  }

  .identity {
    margin-top: 12px;
    font-size: 12px;
    color: var(--text-secondary);
    word-break: break-all;
  }

  .tag {
    display: inline-block;
    margin-left: 6px;
    padding: 1px 6px;
    font-size: 10.5px;
    font-weight: 600;
    border: 1px solid var(--line-strong);
    color: var(--text-tertiary);
    font-family: var(--font);
  }

  .tag.warn {
    border-color: var(--amber);
    color: var(--amber);
  }

  .issues,
  .conns,
  .env,
  .needs,
  .legend,
  .plist,
  .log {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
  }

  .issues li {
    margin-top: 6px;
    padding: 6px 8px;
    font-size: 12.5px;
    line-height: 1.45;
    border-left: 3px solid var(--line-strong);
    background: var(--bg-elevated);
  }

  .issues li.error {
    border-left-color: var(--red);
  }
  .issues li.warn {
    border-left-color: var(--amber);
  }

  .sec {
    margin-top: 16px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .conns button {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 1px;
    padding: 5px 6px;
    border: 0;
    background: none;
    text-align: left;
    font-size: 12.5px;
  }

  .conns button:hover {
    background: var(--surface-hover);
  }

  .conn-kind {
    font-size: 11.5px;
    color: var(--text-tertiary);
  }

  .env li {
    font-size: 11.5px;
    word-break: break-all;
    padding: 2px 0;
  }

  .code {
    margin-top: 6px;
    padding: 10px;
    background: #161614;
    color: #e9e6dd;
    font-family: var(--font-mono);
    font-size: 11.5px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-all;
    border-radius: 0;
  }

  .code.big {
    max-height: 360px;
    overflow: auto;
  }

  .needs li {
    margin-top: 6px;
    padding: 6px 8px;
    background: var(--bg-elevated);
    border-left: 3px solid var(--green);
  }

  .needs li.off {
    border-left-color: var(--red);
  }

  .needs label {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    font-size: 12.5px;
  }

  .role {
    display: block;
    font-size: 12px;
  }

  .who {
    display: block;
    color: var(--text-secondary);
    line-height: 1.4;
    word-break: break-word;
  }

  .needs .tag {
    margin: 3px 0 0;
  }

  .note {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.5;
    color: var(--text-tertiary);
  }

  .insp-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 16px;
  }

  .danger {
    color: var(--red);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 12.5px;
  }

  .sw {
    width: 28px;
    height: 0;
    border-top: 2px solid var(--text-tertiary);
  }
  .sw.ok {
    border-color: var(--green);
  }
  .sw.warn {
    border-color: var(--amber);
  }
  .sw.error {
    border-color: var(--red);
  }
  .sw.dashed {
    border-top-style: dashed;
  }

  /* bottom panel */
  .panel {
    grid-area: panel;
    min-width: 0;
    border: 1px solid var(--line);
    background: var(--surface);
  }

  .tabs {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 2px;
    padding: 4px 6px 0;
    border-bottom: 1px solid var(--line);
  }

  .tabs button[role='tab'] {
    padding: 8px 10px;
    border: 0;
    border-bottom: 2px solid transparent;
    background: none;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .tabs button.on {
    color: var(--text);
    border-bottom-color: var(--ink);
    font-weight: 600;
  }

  .tab-body {
    padding: 12px 14px 16px;
    max-height: 420px;
    overflow: auto;
  }

  .goals .bar {
    height: 4px;
    background: var(--line);
  }

  .goals .bar span {
    display: block;
    height: 100%;
    background: var(--mint);
    transition: width var(--dur-ui) var(--ease);
  }

  .goals ol {
    list-style: none;
    margin: 12px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .goals li {
    display: flex;
    gap: 10px;
    font-size: 14px;
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
  }

  .goals li.ok .mark {
    background: var(--mint);
    border-color: var(--mint);
    color: #1a1a1a;
  }

  .goals li.ok {
    color: var(--text-secondary);
  }

  .lesson {
    margin-top: 14px;
    padding: 14px 16px;
    background: var(--mint-soft);
  }

  .lesson p:last-child {
    margin-top: 6px;
    font-size: 14px;
    line-height: 1.55;
  }

  .hints {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 13.5px;
    line-height: 1.5;
  }

  .hints button {
    align-self: flex-start;
  }

  .plist li button,
  .log li button {
    width: 100%;
    display: flex;
    gap: 10px;
    padding: 5px 4px;
    border: 0;
    background: none;
    text-align: left;
    font-size: 12.5px;
    line-height: 1.45;
  }

  .plist li button:hover,
  .log li button:hover {
    background: var(--surface-hover);
  }

  .plist .at {
    flex: none;
    min-width: 120px;
    color: var(--text-secondary);
  }

  .plist li.error {
    box-shadow: inset 3px 0 0 var(--red);
  }

  .plist li.warn {
    box-shadow: inset 3px 0 0 var(--amber);
  }

  .log .t {
    flex: none;
    width: 52px;
    color: var(--text-tertiary);
  }

  .log li.error {
    color: var(--red);
  }
  .log li.warn {
    color: var(--amber);
  }
  .log li.ok {
    color: var(--green);
  }
  .log li.info {
    color: var(--text-secondary);
  }

  .log button {
    font-family: var(--font-mono) !important;
    font-size: 12px !important;
  }

  .stale-note {
    color: var(--amber);
  }

  .trace + .trace {
    margin-top: 16px;
  }

  .trace-head {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--red);
  }

  .trace-head.ok {
    color: var(--green);
  }

  .events {
    width: 100%;
    margin-top: 6px;
    border-collapse: collapse;
    font-size: 12.5px;
  }

  .events th {
    text-align: left;
    font-size: 11px;
    font-weight: 600;
    color: var(--text-tertiary);
    padding: 4px 6px;
    border-bottom: 1px solid var(--line);
  }

  .events td {
    vertical-align: top;
    padding: 5px 6px;
    border-bottom: 1px solid var(--line);
    line-height: 1.45;
  }

  .events tr.bad td {
    background: var(--red-soft);
  }

  .events tr.bad .hop {
    color: var(--red);
  }

  .hop {
    border: 0;
    background: none;
    padding: 0;
    text-align: left;
    font-size: 12.5px;
    line-height: 1.45;
  }

  .detail {
    display: block;
    font-size: 11.5px;
    color: var(--text-tertiary);
  }

  .script-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .ghost {
    position: fixed;
    z-index: 50;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: var(--surface);
    border: 1px solid var(--ink);
    font-size: 13px;
    pointer-events: none;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  }

  @media (max-width: 1240px) {
    .studio {
      grid-template-columns: 190px minmax(0, 1fr);
      grid-template-areas:
        'pal board'
        'pal insp'
        'pal panel';
    }

    .inspector {
      position: static;
      max-height: none;
    }
  }

  @media (max-width: 800px) {
    .studio {
      grid-template-columns: minmax(0, 1fr);
      grid-template-areas:
        'pal'
        'board'
        'insp'
        'panel';
    }

    .palette {
      position: static;
      max-height: none;
      min-width: 0;
    }

    .pal-scroll {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 6px;
    }

    .pal-scroll ul {
      flex-direction: row;
    }

    .pal-cat {
      display: none;
    }

    .pal-item {
      white-space: nowrap;
      border-color: var(--line);
      background: var(--surface);
    }

    .pal-tip,
    .canvas-help {
      display: none;
    }

    .canvas-wrap {
      height: 62vh;
    }

    .field input[type='text'],
    .field input[type='number'],
    .field select,
    .search {
      font-size: 16px;
    }
  }
</style>
