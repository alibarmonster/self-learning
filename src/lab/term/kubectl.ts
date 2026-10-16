/**
 * `kubectl` against the cluster `get-credentials` pointed at. Pods are
 * derived from deployments (replicas × image health), so scaling, rolling out
 * a broken image and undoing it all show up the way they would on GKE.
 */
import { CliError } from './common';
import { bool, flag, parseArgs, type Ctx } from './shell';
import { hash, kubeCluster, type CloudState, type Cluster, type Deployment, type Kube } from './state';
import type { Out } from './shell';

const BOOLS = new Set(['A', 'all-namespaces', 'watch', 'w', 'record', 'client', 'dry-run', 'help', 'h', 'overwrite']);

export const KUBECTL_COMMANDS = [
  'get',
  'describe',
  'create deployment',
  'create namespace',
  'create configmap',
  'apply',
  'expose',
  'scale',
  'set image',
  'rollout status',
  'rollout history',
  'rollout undo',
  'rollout restart',
  'autoscale',
  'delete',
  'logs',
  'label',
  'config current-context',
  'config get-contexts',
  'cluster-info',
  'version'
];

const KIND: Record<string, string> = {
  po: 'pods',
  pod: 'pods',
  pods: 'pods',
  deploy: 'deployments',
  deployment: 'deployments',
  deployments: 'deployments',
  svc: 'services',
  service: 'services',
  services: 'services',
  no: 'nodes',
  node: 'nodes',
  nodes: 'nodes',
  ns: 'namespaces',
  namespace: 'namespaces',
  namespaces: 'namespaces',
  hpa: 'hpa',
  horizontalpodautoscaler: 'hpa',
  horizontalpodautoscalers: 'hpa',
  cm: 'configmaps',
  configmap: 'configmaps',
  configmaps: 'configmaps',
  all: 'all'
};

function fail(msg: string, hint?: string): never {
  throw new CliError(msg, hint);
}

function cluster(s: CloudState): Cluster {
  const k = kubeCluster(s);
  if (!k)
    fail(
      'E1016 09:41:07.000000    1234 memcache.go:265] couldn\'t get current server API group list: Get "http://localhost:8080/api?timeout=32s": dial tcp 127.0.0.1:8080: connect: connection refused\nThe connection to the server localhost:8080 was refused - did you specify the right host or port?',
      'kubectl belum punya kredensial cluster. Jalankan gcloud container clusters get-credentials NAMA --zone/--region ….'
    );
  return k;
}

/** `deployment/web` or (`deployment`, `web`) → ['deployments', 'web']. */
function target(pos: string[]): [kind: string, name: string] {
  const [a, b] = pos;
  if (a?.includes('/')) {
    const [k, n] = a.split('/');
    return [KIND[k] ?? k, n];
  }
  return [KIND[a] ?? a, b];
}

const ns = (a: ReturnType<typeof parseArgs>) => flag(a, 'n', 'namespace') ?? 'default';

function needNs(k: Kube, n: string) {
  if (!k.namespaces.includes(n)) fail(`Error from server (NotFound): namespaces "${n}" not found`);
}

function dep(k: Kube, name: string, n: string): Deployment {
  const d = k.deployments.find((x) => x.name === name && x.ns === n);
  if (!d) fail(`Error from server (NotFound): deployments.apps "${name}" not found${n !== 'default' ? '' : ''}`, n === 'default' ? 'Cek namespace: tambahkan -n NAMESPACE kalau deployment ada di namespace lain.' : undefined);
  return d!;
}

/** Pod names stay stable per deployment+image, like a ReplicaSet hash. */
function pods(s: CloudState, k: Kube) {
  return k.deployments.flatMap((d) => {
    const rs = (hash(`${d.name}:${d.image}`).toString(16).padStart(8, '0') + hash(d.image).toString(16).slice(0, 2)).slice(0, 10);
    const broken = s.brokenImages.includes(d.image);
    return Array.from({ length: d.replicas }, (_, i) => ({
      name: `${d.name}-${rs}-${(hash(`${d.name}${i}${d.image}`) % 60466176).toString(36).padStart(5, 'q')}`,
      ns: d.ns,
      ready: broken ? '0/1' : '1/1',
      status: broken ? (i % 2 ? 'ErrImagePull' : 'ImagePullBackOff') : 'Running',
      restarts: 0,
      ip: `10.8.${i}.${(hash(d.name) % 200) + 10}`,
      dep: d
    }));
  });
}

function available(s: CloudState, d: Deployment) {
  return s.brokenImages.includes(d.image) ? 0 : d.replicas;
}

function get(s: CloudState, o: Out, a: ReturnType<typeof parseArgs>, pos: string[]) {
  const k = cluster(s).kube;
  const [kindRaw, name] = pos;
  const kind = KIND[kindRaw] ?? '';
  if (!kind) fail(`error: the server doesn't have a resource type "${kindRaw ?? ''}"`, 'Contoh: kubectl get pods, deployments, services, nodes, hpa, namespaces.');
  const all = bool(a, 'A', 'all-namespaces');
  const n = ns(a);
  if (!all && kind !== 'nodes' && kind !== 'namespaces') needNs(k, n);
  const inNs = <T extends { ns: string }>(x: T) => all || x.ns === n;
  const named = <T extends { name: string }>(x: T) => !name || x.name === name;
  const nsCol = (x: { ns: string }) => (all ? [x.ns] : []);
  const head = (cols: string[]) => (all ? ['namespace', ...cols] : cols);

  const show = (what: string) => {
    if (what === 'pods') {
      const rows = pods(s, k).filter(inNs).filter(named);
      if (name && !rows.length) fail(`Error from server (NotFound): pods "${name}" not found`);
      if (!rows.length) return o.info(`No resources found in ${all ? 'any' : n} namespace.`);
      o.table(head(['name', 'ready', 'status', 'restarts', 'age', ...(flag(a, 'o') === 'wide' ? ['ip'] : [])]), rows.map((p) => [...nsCol(p), p.name, p.ready, p.status, p.restarts, '2m', ...(flag(a, 'o') === 'wide' ? [p.ip] : [])]));
    } else if (what === 'deployments') {
      const rows = k.deployments.filter(inNs).filter(named);
      if (name && !rows.length) fail(`Error from server (NotFound): deployments.apps "${name}" not found`);
      if (!rows.length) return o.info(`No resources found in ${all ? 'any' : n} namespace.`);
      o.table(head(['name', 'ready', 'up-to-date', 'available', 'age']), rows.map((d) => [...nsCol(d), d.name, `${available(s, d)}/${d.replicas}`, d.replicas, available(s, d), '5m']));
    } else if (what === 'services') {
      const rows = k.services.filter(inNs).filter(named);
      if (name && !rows.length) fail(`Error from server (NotFound): services "${name}" not found`);
      o.table(head(['name', 'type', 'cluster-ip', 'external-ip', 'port(s)', 'age']), rows.map((v) => [...nsCol(v), v.name, v.type, `34.118.${(hash(v.name) % 200) + 10}.${(hash(v.ns) % 200) + 1}`, v.type === 'LoadBalancer' ? (v.externalIp ?? '<pending>') : '<none>', `${v.port}${v.type !== 'ClusterIP' ? `:3${String(hash(v.name) % 2767).padStart(4, '0')}` : ''}/TCP`, '1m']));
    } else if (what === 'nodes') {
      const c = cluster(s);
      const count = c.mode === 'autopilot' ? Math.max(1, Math.ceil(k.deployments.reduce((x, d) => x + d.replicas, 0) / 4)) : c.nodes;
      o.table(['name', 'status', 'roles', 'age', 'version'], Array.from({ length: count }, (_, i) => [`gke-${c.name}-${c.mode === 'autopilot' ? 'pool-1' : 'default-pool'}-${(hash(c.name + i) % 0xffffff).toString(16).padStart(8, '0').slice(0, 8)}-${'abcdefgh'[i % 8]}${i}`, 'Ready', '<none>', '20m', 'v1.33.4-gke.1000']));
    } else if (what === 'namespaces') {
      o.table(['name', 'status', 'age'], k.namespaces.filter((x) => !name || x === name).map((x) => [x, 'Active', '20m']));
    } else if (what === 'hpa') {
      const rows = k.hpas.filter(inNs).filter(named);
      if (!rows.length) return o.info(`No resources found in ${all ? 'any' : n} namespace.`);
      o.table(head(['name', 'reference', 'targets', 'minpods', 'maxpods', 'replicas', 'age']), rows.map((h) => [...nsCol(h), h.name, `Deployment/${h.target}`, `cpu: 23%/${h.cpu}%`, h.min, h.max, k.deployments.find((d) => d.name === h.target && d.ns === h.ns)?.replicas ?? 0, '1m']));
    } else if (what === 'configmaps') {
      o.table(head(['name', 'data', 'age']), k.configmaps.filter(inNs).filter(named).map((c) => [...nsCol(c), c.name, c.keys.length, '1m']));
    }
  };

  if (kind === 'all') {
    show('pods');
    o.out('');
    show('services');
    o.out('');
    show('deployments');
  } else show(kind);
}

function rolloutTo(d: Deployment, image: string) {
  if (d.image === image) return;
  d.history.push(d.image);
  d.image = image;
}

/** Reads the handful of fields a Deployment or Service manifest needs. */
function applyManifest(s: CloudState, o: Out, file: string, a: ReturnType<typeof parseArgs>) {
  const text = s.files[file];
  if (text === undefined) fail(`error: the path "${file}" does not exist`, 'Cek nama file dengan ls.');
  const k = cluster(s).kube;
  for (const doc of text.split(/^---\s*$/m)) {
    const kind = /^kind:\s*(\S+)/m.exec(doc)?.[1];
    if (!kind) continue;
    const name = /^metadata:\s*\n(?:\s+.*\n)*?\s+name:\s*(\S+)/m.exec(doc)?.[1] ?? /name:\s*(\S+)/.exec(doc)?.[1];
    const n = /^\s+namespace:\s*(\S+)/m.exec(doc)?.[1] ?? ns(a);
    if (!name) fail(`error: error validating "${file}": metadata.name is required`);
    needNs(k, n);
    if (kind === 'Deployment') {
      const image = /image:\s*(\S+)/.exec(doc)?.[1];
      if (!image) fail(`error: error validating "${file}": spec.template.spec.containers[0].image is required`);
      const replicas = Number(/replicas:\s*(\d+)/.exec(doc)?.[1] ?? 1);
      const existing = k.deployments.find((d) => d.name === name && d.ns === n);
      if (existing) {
        existing.replicas = replicas;
        rolloutTo(existing, image!);
        o.out(`deployment.apps/${name} configured`);
      } else {
        k.deployments.push({ name: name!, ns: n, image: image!, replicas, history: [], labels: { app: name! } });
        o.out(`deployment.apps/${name} created`);
      }
    } else if (kind === 'Service') {
      const type = (/type:\s*(\S+)/.exec(doc)?.[1] ?? 'ClusterIP') as 'ClusterIP' | 'NodePort' | 'LoadBalancer';
      const port = Number(/\bport:\s*(\d+)/.exec(doc)?.[1] ?? 80);
      const targetPort = Number(/targetPort:\s*(\d+)/.exec(doc)?.[1] ?? port);
      const selector = /selector:\s*\n\s+app:\s*(\S+)/.exec(doc)?.[1] ?? name!;
      k.services = k.services.filter((v) => !(v.name === name && v.ns === n));
      k.services.push({ name: name!, ns: n, type, port, targetPort, selector, externalIp: type === 'LoadBalancer' ? `34.${120 + (hash(name!) % 20)}.${hash(n) % 250}.${(s.seq++ % 250) + 2}` : null });
      o.out(`service/${name} created`);
    } else fail(`error: resource mapping not found for name: "${name}" kind: "${kind}": lab ini hanya membaca Deployment dan Service`);
  }
}

export function kubectl({ s, o, words }: Ctx) {
  const a = parseArgs(words, BOOLS);
  const [cmd, ...pos] = a.pos;
  if (!cmd || cmd === 'help' || bool(a, 'help', 'h')) {
    o.out('kubectl controls the Kubernetes cluster manager.', '', `Perintah di lab ini: ${KUBECTL_COMMANDS.join(', ')}`);
    return;
  }
  if (cmd === 'version') {
    o.out('Client Version: v1.33.4', 'Kustomize Version: v5.6.0');
    if (!bool(a, 'client')) {
      cluster(s);
      o.out('Server Version: v1.33.4-gke.1000');
    }
    return;
  }
  if (cmd === 'config') {
    const sub = pos[0];
    if (sub === 'current-context') {
      if (!s.kubeContext) fail('error: current-context is not set');
      const [c, p] = s.kubeContext!.split('@');
      const k = kubeCluster(s)!;
      o.out(`gke_${p}_${k?.location ?? '-'}_${c}`);
      return;
    }
    if (sub === 'get-contexts') {
      const rows = s.projects.flatMap((p) => p.clusters.map((c) => [s.kubeContext === `${c.name}@${p.id}` ? '*' : '', `gke_${p.id}_${c.location}_${c.name}`, `gke_${p.id}_${c.location}_${c.name}`, `gke_${p.id}_${c.location}_${c.name}`, '']));
      o.table(['current', 'name', 'cluster', 'authinfo', 'namespace'], rows);
      return;
    }
    fail(`error: unknown command "config ${sub ?? ''}"`, 'Di lab ini: kubectl config current-context / get-contexts.');
  }
  if (cmd === 'cluster-info') {
    const c = cluster(s);
    o.out(`Kubernetes control plane is running at https://34.101.${hash(c.name) % 250}.${hash(c.location) % 250}`, `GLBCDefaultBackend is running at https://…/api/v1/namespaces/kube-system/services/default-http-backend:http/proxy`);
    return;
  }

  const k = cluster(s).kube;
  const n = ns(a);

  switch (cmd) {
    case 'get':
      return get(s, o, a, pos);
    case 'describe': {
      const [kind, name] = target(pos);
      needNs(k, n);
      if (kind === 'deployments') {
        const d = dep(k, name, n);
        o.out(`Name:                   ${d.name}`, `Namespace:              ${d.ns}`, `Selector:               app=${d.name}`, `Replicas:               ${d.replicas} desired | ${d.replicas} updated | ${d.replicas} total | ${available(s, d)} available | ${d.replicas - available(s, d)} unavailable`, `StrategyType:           RollingUpdate`, `RollingUpdateStrategy:  25% max unavailable, 25% max surge`, `Pod Template:`, `  Containers:`, `   ${d.name}:`, `    Image:        ${d.image}`);
        return;
      }
      if (kind === 'pods') {
        const p = pods(s, k).find((x) => x.name === name && x.ns === n);
        if (!p) fail(`Error from server (NotFound): pods "${name}" not found`);
        o.out(`Name:         ${p!.name}`, `Namespace:    ${p!.ns}`, `Status:       ${p!.status === 'Running' ? 'Running' : 'Pending'}`, `IP:           ${p!.ip}`, `Containers:`, `  ${p!.dep.name}:`, `    Image:          ${p!.dep.image}`, `    State:          ${p!.status === 'Running' ? 'Running' : 'Waiting'}`, ...(p!.status !== 'Running' ? [`      Reason:       ${p!.status}`, 'Events:', `  Warning  Failed  12s  kubelet  Failed to pull image "${p!.dep.image}": rpc error: code = NotFound desc = failed to pull and unpack image: not found`] : []));
        return;
      }
      if (kind === 'services') {
        const v = k.services.find((x) => x.name === name && x.ns === n);
        if (!v) fail(`Error from server (NotFound): services "${name}" not found`);
        o.out(`Name:                     ${v!.name}`, `Namespace:                ${v!.ns}`, `Selector:                 app=${v!.selector}`, `Type:                     ${v!.type}`, ...(v!.externalIp ? [`LoadBalancer Ingress:     ${v!.externalIp}`] : []), `Port:                     <unset>  ${v!.port}/TCP`, `TargetPort:               ${v!.targetPort}/TCP`);
        return;
      }
      fail(`error: the server doesn't have a resource type "${pos[0] ?? ''}"`);
      return;
    }
    case 'create': {
      const [what, name] = pos;
      if (what === 'namespace' || what === 'ns') {
        if (!name) fail('error: exactly one NAME is required, got 0');
        if (k.namespaces.includes(name)) fail(`Error from server (AlreadyExists): namespaces "${name}" already exists`);
        k.namespaces.push(name);
        o.out(`namespace/${name} created`);
        return;
      }
      if (what === 'deployment' || what === 'deploy') {
        if (!name) fail('error: exactly one NAME is required, got 0');
        const image = flag(a, 'image');
        if (!image) fail('error: required flag(s) "image" not set');
        needNs(k, n);
        if (k.deployments.some((d) => d.name === name && d.ns === n)) fail(`error: failed to create deployment: deployments.apps "${name}" already exists`, 'Ubah deployment yang ada dengan kubectl set image / scale, atau hapus dulu.');
        k.deployments.push({ name, ns: n, image: image!, replicas: Number(flag(a, 'replicas', 'r') ?? 1), history: [], labels: { app: name } });
        o.out(`deployment.apps/${name} created`);
        return;
      }
      if (what === 'configmap' || what === 'cm') {
        if (!name) fail('error: exactly one NAME is required, got 0');
        const lit = words.filter((w) => w.startsWith('--from-literal=')).map((w) => w.split('=')[1]);
        k.configmaps.push({ name, ns: n, keys: lit });
        o.out(`configmap/${name} created`);
        return;
      }
      fail(`error: unknown command "create ${what ?? ''}"`, 'Di lab ini: kubectl create deployment | namespace | configmap.');
      return;
    }
    case 'apply': {
      const file = flag(a, 'f', 'filename');
      if (!file) fail('error: must specify one of -f and -k');
      return applyManifest(s, o, file!, a);
    }
    case 'expose': {
      const [kind, name] = target(pos);
      if (kind !== 'deployments') fail(`error: cannot expose a ${pos[0] ?? ''}`, 'Expose sebuah deployment: kubectl expose deployment NAMA --type=LoadBalancer --port=80.');
      const d = dep(k, name, n);
      const port = Number(flag(a, 'port'));
      if (!port) fail("error: couldn't find port via --port flag or introspection\nSee 'kubectl expose -h' for help and examples");
      const type = (flag(a, 'type') ?? 'ClusterIP') as 'ClusterIP' | 'NodePort' | 'LoadBalancer';
      if (!['ClusterIP', 'NodePort', 'LoadBalancer'].includes(type)) fail(`The Service "${name}" is invalid: spec.type: Unsupported value: "${type}"`);
      const svcName = flag(a, 'name') ?? d.name;
      if (k.services.some((v) => v.name === svcName && v.ns === n)) fail(`Error from server (AlreadyExists): services "${svcName}" already exists`);
      k.services.push({ name: svcName, ns: n, type, port, targetPort: Number(flag(a, 'target-port') ?? port), selector: d.name, externalIp: type === 'LoadBalancer' ? `34.${120 + (hash(svcName) % 20)}.${hash(n) % 250}.${(s.seq++ % 250) + 2}` : null });
      o.out(`service/${svcName} exposed`);
      return;
    }
    case 'scale': {
      const [kind, name] = target(pos);
      if (kind !== 'deployments') fail(`error: cannot scale ${pos[0] ?? ''}`);
      const d = dep(k, name, n);
      const r = Number(flag(a, 'replicas'));
      if (!Number.isInteger(r) || r < 0) fail('error: --replicas=COUNT is required, and COUNT must be greater than or equal to 0');
      if (k.hpas.some((h) => h.target === d.name && h.ns === n)) o.warn(`Catatan lab: ada HPA untuk ${d.name}; autoscaler bisa mengubah jumlah replika lagi.`);
      d.replicas = r;
      o.out(`deployment.apps/${d.name} scaled`);
      return;
    }
    case 'set': {
      if (pos[0] !== 'image') fail(`error: unknown command "set ${pos[0] ?? ''}"`);
      const [kind, name] = target(pos.slice(1));
      if (kind !== 'deployments') fail('error: lab ini hanya mendukung set image pada deployment');
      const d = dep(k, name, n);
      const pair = pos.slice(1).find((w) => w.includes('='));
      if (!pair) fail('error: at least one image update is required');
      const [container, image] = pair!.split('=');
      if (container !== d.name && container !== '*') fail(`error: unable to find container named "${container}"`, `Nama container di deployment ini adalah "${d.name}".`);
      rolloutTo(d, image);
      o.out(`deployment.apps/${d.name} image updated`);
      return;
    }
    case 'rollout': {
      const sub = pos[0];
      const [, name] = target(pos.slice(1));
      const d = dep(k, name, n);
      if (sub === 'status') {
        if (s.brokenImages.includes(d.image)) {
          o.out(`Waiting for deployment "${d.name}" rollout to finish: 1 out of ${d.replicas} new replicas have been updated...`);
          fail(`error: deployment "${d.name}" exceeded its progress deadline`, 'Image baru gagal di-pull. Lihat kubectl describe pod …, lalu kubectl rollout undo.');
        }
        o.out(`deployment "${d.name}" successfully rolled out`);
        return;
      }
      if (sub === 'history') {
        o.out(`deployment.apps/${d.name}`);
        o.table(['revision', 'change-cause'], [...d.history, d.image].map((img, i) => [i + 1, `image=${img}`]));
        return;
      }
      if (sub === 'undo') {
        const prev = d.history.pop();
        if (!prev) fail(`error: no rollout history found for deployment "${d.name}"`);
        s.events.push(`rollout-undo:${d.name}:${d.image}`);
        d.image = prev!;
        o.out(`deployment.apps/${d.name} rolled back`);
        return;
      }
      if (sub === 'restart') {
        o.out(`deployment.apps/${d.name} restarted`);
        return;
      }
      fail(`error: unknown command "rollout ${sub ?? ''}"`);
      return;
    }
    case 'autoscale': {
      const [kind, name] = target(pos);
      if (kind !== 'deployments') fail('error: lab ini hanya mendukung autoscale deployment');
      const d = dep(k, name, n);
      const max = Number(flag(a, 'max'));
      if (!max) fail('error: --max=MAXPODS is required and must be at least 1 and --min=MINPODS');
      const min = Number(flag(a, 'min') ?? 1);
      if (min > max) fail(`error: --max=MAXPODS must be larger or equal to --min=MINPODS`);
      if (k.hpas.some((h) => h.name === d.name && h.ns === n)) fail(`Error from server (AlreadyExists): horizontalpodautoscalers.autoscaling "${d.name}" already exists`);
      k.hpas.push({ name: d.name, ns: n, target: d.name, min, max, cpu: Number(flag(a, 'cpu-percent') ?? 80) });
      if (d.replicas < min) d.replicas = min;
      o.out(`horizontalpodautoscaler.autoscaling/${d.name} autoscaled`);
      return;
    }
    case 'delete': {
      const [kind, name] = target(pos);
      if (!name) fail('error: resource(s) were provided, but no name was specified');
      if (kind === 'deployments') {
        dep(k, name, n);
        k.deployments = k.deployments.filter((d) => !(d.name === name && d.ns === n));
        k.hpas = k.hpas.filter((h) => !(h.target === name && h.ns === n));
        o.out(`deployment.apps "${name}" deleted`);
      } else if (kind === 'services') {
        if (!k.services.some((v) => v.name === name && v.ns === n)) fail(`Error from server (NotFound): services "${name}" not found`);
        k.services = k.services.filter((v) => !(v.name === name && v.ns === n));
        o.out(`service "${name}" deleted`);
      } else if (kind === 'pods') {
        const p = pods(s, k).find((x) => x.name === name);
        if (!p) fail(`Error from server (NotFound): pods "${name}" not found`);
        o.out(`pod "${name}" deleted`);
        o.info('Petunjuk: Deployment langsung membuat Pod pengganti — jumlah replika tetap.');
      } else if (kind === 'namespaces') {
        if (['default', 'kube-system'].includes(name)) fail(`Error from server (Forbidden): namespaces "${name}" is forbidden: this namespace may not be deleted`);
        k.namespaces = k.namespaces.filter((x) => x !== name);
        k.deployments = k.deployments.filter((d) => d.ns !== name);
        k.services = k.services.filter((v) => v.ns !== name);
        o.out(`namespace "${name}" deleted`);
      } else if (kind === 'hpa') {
        k.hpas = k.hpas.filter((h) => !(h.name === name && h.ns === n));
        o.out(`horizontalpodautoscaler.autoscaling "${name}" deleted`);
      } else fail(`error: the server doesn't have a resource type "${pos[0] ?? ''}"`);
      return;
    }
    case 'logs': {
      const p = pods(s, k).find((x) => x.name === pos[0] || x.dep.name === pos[0]?.replace(/^deployment\//, ''));
      if (!p) fail(`Error from server (NotFound): pods "${pos[0] ?? ''}" not found`);
      if (p!.status !== 'Running') fail(`Error from server (BadRequest): container "${p!.dep.name}" in pod "${p!.name}" is waiting to start: trying and failing to pull image`);
      o.out(`2026/10/16 09:40:12 Listening on :8080`, `2026/10/16 09:41:02 GET / 200 3.1ms`, `2026/10/16 09:41:05 GET /healthz 200 0.4ms`);
      return;
    }
    case 'label': {
      const [kind, name] = target(pos);
      if (kind !== 'deployments') fail('error: lab ini hanya mendukung label deployment');
      const d = dep(k, name, n);
      for (const pair of pos.slice(kind === pos[0] ? 2 : 1).filter((w) => w.includes('='))) {
        const [key, v] = pair.split('=');
        d.labels[key] = v;
      }
      o.out(`deployment.apps/${d.name} labeled`);
      return;
    }
    default:
      fail(`error: unknown command "${cmd}" for "kubectl"`, `Perintah kubectl di lab ini: ${KUBECTL_COMMANDS.join(', ')}.`);
  }
}
