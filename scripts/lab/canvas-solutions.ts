/**
 * Regression check for the service canvas: every scenario starts unsolved,
 * and its reference fix below solves every goal after a deploy and the test
 * requests "Deploy & uji" would send. Also checks that every node type's
 * default config is valid and every rule produces commands.
 * Run with `bun scripts/lab/canvas-solutions.ts`.
 */
import { CANVAS_SCENARIOS, type CanvasScenario, type GoalCtx } from '../../src/lab/canvas/scenarios';
import { SPEC_LIST, defaults, nodeIssues } from '../../src/lab/canvas/catalog';
import { RULES, edgeDefaults, ruleFor } from '../../src/lab/canvas/rules';
import { deploy, edgeCommands, nodeCommands, testStarts, trace, type Trace } from '../../src/lab/canvas/sim';
import { newId, rows, type CNode, type Doc, type NodeType, type Params } from '../../src/lab/canvas/model';

function tools(d: Doc) {
  const find = (name: string) => {
    const n = d.nodes.find((x) => x.name === name);
    if (!n) throw new Error(`no node ${name}`);
    return n;
  };
  const add = (type: NodeType, name: string, params: Params = {}): CNode => {
    const n: CNode = { id: newId('n'), type, name, x: 0, y: 0, params: { ...defaults(type), ...params } };
    d.nodes.push(n);
    return n;
  };
  const link = (a: CNode | string, b: CNode | string, params: Params = {}) => {
    const x = typeof a === 'string' ? find(a) : a;
    const y = typeof b === 'string' ? find(b) : b;
    const r = ruleFor(x.type, y.type);
    if (!r) throw new Error(`no rule ${x.type}>${y.type}`);
    const e = { id: newId('e'), from: x.id, to: y.id, params: { ...edgeDefaults(r), ...params } };
    d.edges.push(e);
    return e;
  };
  const set = (name: string, params: Params) => Object.assign(find(name).params, params);
  return { find, add, link, set };
}

const SOLUTIONS: Record<string, (d: Doc) => void> = {
  'event-pipeline': (d) => {
    const { add, link } = tools(d);
    const fn = add('fn', 'load-csv');
    const bq = add('bq', 'sales');
    const sa = add('sa', 'loader-runner');
    link('ace-uploads-123', fn);
    link(fn, bq);
    link(sa, fn);
  },
  cron: (d) => {
    const { add, link } = tools(d);
    const s = add('scheduler', 'nightly-report');
    const sa = add('sa', 'report-invoker');
    link(s, 'report-job', { identity: sa.id });
    link(add('sa', 'report-runner'), 'report-job');
  },
  'pubsub-push': (d) => {
    const { add, link } = tools(d);
    const sa = add('sa', 'push-invoker');
    link('orders', 'order-worker', { identity: sa.id, dlq: true, attempts: 5 });
    link(add('sa', 'worker-runner'), 'order-worker');
  },
  'web-serverless': (d) => {
    const { add, link } = tools(d);
    const lb = add('lb', 'shop-lb');
    const run = add('run', 'shop-api', { allowUnauth: true, ingress: 'internal-and-cloud-load-balancing' });
    const sql = add('sql', 'shop-db', { ha: true, publicIp: false, privateIp: true });
    const secret = add('secret', 'db-pass');
    const vpc = add('vpc', 'shop-vpc');
    const sa = add('sa', 'shop-runner');
    link('Internet', lb);
    link(lb, run);
    link(run, sql);
    link(run, secret);
    link(sql, vpc);
    link(run, vpc);
    link(sa, run);
  },
  cicd: (d) => {
    const { add, link } = tools(d);
    const ar = add('ar', 'apps');
    const web = add('run', 'web', { image: 'us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1' });
    link('deploy-main', ar);
    link('deploy-main', web);
    link(ar, web);
    link(add('sa', 'build-runner'), 'deploy-main');
    link(add('sa', 'web-runner'), web);
  },
  'fix-push-403': (d) => {
    const e = d.edges.find((x) => (x.params.grant as Record<string, boolean>)?.invoker === false)!;
    (e.params.grant as Record<string, boolean>).invoker = true;
  },
  'fix-sql-timeout': (d) => {
    const { link, find } = tools(d);
    link('catalog-api', 'prod-vpc');
    rows(find('prod-vpc').params, 'subnets').push({ name: 'jkt-subnet', region: 'asia-southeast2', range: '10.30.0.0/24', pga: true });
  },
  'fix-lb-502': (d) => {
    const { find } = tools(d);
    rows(find('prod-vpc').params, 'firewall').push({ name: 'allow-health-checks', allow: 'tcp:80', sources: '130.211.0.0/22,35.191.0.0/16', tags: 'web' });
  },
  'private-vm': (d) => {
    const { add, link, set, find } = tools(d);
    link(add('nat', 'batch-nat'), 'prod-vpc');
    rows(find('prod-vpc').params, 'subnets')[0].pga = true;
    set('batch-1', { scopes: 'cloud-platform' });
  },
  'log-audit': (d) => {
    const { add, link } = tools(d);
    link(add('sink', 'audit-sink'), add('bq', 'audit_logs'));
  }
};

function evaluate(sc: CanvasScenario, d: Doc): { done: number; total: number; open: string[] } {
  const report = deploy(d);
  const traces: Record<string, Trace> = {};
  for (const s of testStarts(d)) traces[s.id] = trace(d, report, s.id);
  const g: GoalCtx = { d, report, traces };
  const open = sc.goals.filter((x) => !x.check(g)).map((x) => x.label);
  return { done: sc.goals.length - open.length, total: sc.goals.length, open };
}

let failed = 0;

// Every service's defaults must be valid on their own (warnings are fine).
for (const spec of SPEC_LIST) {
  const d: Doc = { version: 1, nodes: [], edges: [], view: { x: 0, y: 0, z: 1 } };
  const n: CNode = { id: 'x', type: spec.type, name: spec.prefix, x: 0, y: 0, params: defaults(spec.type) };
  d.nodes.push(n);
  const errs = nodeIssues(n, d).filter((i) => i.level === 'error' && !/VPC|NAT/.test(i.msg));
  if (errs.length) {
    console.log(`✗ default ${spec.type}: ${errs.map((e) => e.msg).join('; ')}`);
    failed++;
  }
  try {
    nodeCommands(d, n);
  } catch (e) {
    console.log(`✗ commands ${spec.type}: ${(e as Error).message}`);
    failed++;
  }
}
// Every rule renders its commands without throwing.
for (const key of Object.keys(RULES)) {
  const [a, b] = key.split('>') as [NodeType, NodeType];
  const d: Doc = { version: 1, nodes: [], edges: [], view: { x: 0, y: 0, z: 1 } };
  const x: CNode = { id: 'a', type: a, name: 'src-node', x: 0, y: 0, params: defaults(a) };
  const y: CNode = { id: 'b', type: b, name: 'dst-node', x: 0, y: 0, params: defaults(b) };
  d.nodes.push(x, y);
  d.edges.push({ id: 'e', from: 'a', to: 'b', params: edgeDefaults(RULES[key]) });
  try {
    edgeCommands(d, d.edges[0]);
    deploy(d);
    trace(d, deploy(d), 'a');
  } catch (e) {
    console.log(`✗ rule ${key}: ${(e as Error).message}`);
    failed++;
  }
}

for (const sc of CANVAS_SCENARIOS) {
  if (!sc.goals.length) continue;
  const before = evaluate(sc, sc.build());
  if (before.done === before.total) {
    console.log(`✗ ${sc.id}: already solved at start`);
    failed++;
    continue;
  }
  const fix = SOLUTIONS[sc.id];
  if (!fix) {
    console.log(`✗ ${sc.id}: no reference solution`);
    failed++;
    continue;
  }
  const d = sc.build();
  fix(d);
  const after = evaluate(sc, d);
  if (after.open.length) {
    console.log(`✗ ${sc.id}: still open — ${after.open.join('; ')}`);
    const r = deploy(d);
    for (const ev of r.events.filter((e) => e.level === 'error')) console.log(`    deploy: ${ev.text}`);
    for (const s of testStarts(d)) for (const h of trace(d, r, s.id).hops.filter((h) => !h.ok)) console.log(`    trace ${s.name}: ${h.from} → ${h.to}: ${h.text}`);
    failed++;
  } else console.log(`✓ ${sc.id} (${before.done}/${before.total} → ${after.total}/${after.total})`);
}
if (failed) process.exit(1);
