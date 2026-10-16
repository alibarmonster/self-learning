/**
 * The terminal lab's fake Google Cloud: one account, a few projects, and the
 * resources the ACE exam asks you to create from the CLI. Plain JSON, so a
 * scenario can deep-copy its starting state and the checker can read it.
 */

export interface Instance {
  name: string;
  zone: string;
  machineType: string;
  status: 'RUNNING' | 'TERMINATED';
  internalIp: string;
  externalIp: string | null;
  network: string;
  subnet: string;
  tags: string[];
  serviceAccount: string;
  scopes: string[];
  labels: Record<string, string>;
  spot: boolean;
  image: string;
  bootDiskGb: number;
  startupScript: boolean;
}

export interface Network {
  name: string;
  mode: 'auto' | 'custom';
  routingMode: 'REGIONAL' | 'GLOBAL';
}

export interface SubnetRes {
  name: string;
  network: string;
  region: string;
  range: string;
  pga: boolean;
}

export interface FirewallRes {
  name: string;
  network: string;
  direction: 'INGRESS' | 'EGRESS';
  priority: number;
  action: 'ALLOW' | 'DENY';
  rules: string;
  sourceRanges: string[];
  sourceTags: string[];
  targetTags: string[];
  targetServiceAccounts: string[];
  destinationRanges: string[];
  disabled: boolean;
}

export interface Router {
  name: string;
  network: string;
  region: string;
}

export interface Nat {
  name: string;
  router: string;
  region: string;
  allSubnets: boolean;
}

export interface PeeringRes {
  name: string;
  network: string;
  peerNetwork: string;
}

export interface BucketObject {
  size: number;
  storageClass: string;
  /** Data rows, when the object is a CSV a `bq load` could read. */
  rows?: number;
  /** Older generations kept by versioning. */
  versions?: number;
}

export interface Bucket {
  name: string;
  location: string;
  storageClass: string;
  versioning: boolean;
  uniformAccess: boolean;
  objects: Record<string, BucketObject>;
  lifecycle: { action: string; storageClass?: string; age: number }[];
  iam: { role: string; member: string }[];
  retentionSeconds: number;
}

export interface Table {
  schema: string;
  rows: number;
  source?: string;
}

export interface Dataset {
  id: string;
  location: string;
  tables: Record<string, Table>;
}

export interface Deployment {
  name: string;
  ns: string;
  image: string;
  replicas: number;
  /** Images rolled out so far, oldest first; `rollout undo` pops one. */
  history: string[];
  labels: Record<string, string>;
}

export interface KService {
  name: string;
  ns: string;
  type: 'ClusterIP' | 'NodePort' | 'LoadBalancer';
  port: number;
  targetPort: number;
  selector: string;
  externalIp: string | null;
}

export interface Hpa {
  name: string;
  ns: string;
  target: string;
  min: number;
  max: number;
  cpu: number;
}

export interface Kube {
  namespaces: string[];
  deployments: Deployment[];
  services: KService[];
  hpas: Hpa[];
  configmaps: { name: string; ns: string; keys: string[] }[];
}

export interface Cluster {
  name: string;
  location: string;
  mode: 'standard' | 'autopilot';
  nodes: number;
  machineType: string;
  autoscaling: { min: number; max: number } | null;
  release: string;
  kube: Kube;
}

export interface ServiceAccount {
  email: string;
  name: string;
  displayName: string;
  keys: number;
}

export interface Binding {
  role: string;
  members: string[];
}

export interface Template {
  name: string;
  machineType: string;
  tags: string[];
  image: string;
}

export interface Mig {
  name: string;
  location: string;
  template: string;
  size: number;
  autoscaling: { min: number; max: number; cpu: number } | null;
}

export interface RunService {
  name: string;
  region: string;
  image: string;
  allowUnauthenticated: boolean;
  revision: number;
  minInstances: number;
  maxInstances: number;
  url: string;
}

export interface SqlInstance {
  name: string;
  version: string;
  tier: string;
  region: string;
  availability: 'ZONAL' | 'REGIONAL';
  backups: boolean;
}

export interface Project {
  id: string;
  name: string;
  number: string;
  billing: boolean;
  services: string[];
  instances: Instance[];
  networks: Network[];
  subnets: SubnetRes[];
  firewalls: FirewallRes[];
  routers: Router[];
  nats: Nat[];
  peerings: PeeringRes[];
  disks: { name: string; zone: string; sizeGb: number; type: string }[];
  snapshots: { name: string; source: string }[];
  buckets: Bucket[];
  datasets: Dataset[];
  clusters: Cluster[];
  serviceAccounts: ServiceAccount[];
  iam: Binding[];
  templates: Template[];
  migs: Mig[];
  run: RunService[];
  topics: string[];
  subscriptions: { name: string; topic: string }[];
  sql: SqlInstance[];
  functions: { name: string; region: string; runtime: string; trigger: string }[];
}

export interface Config {
  project?: string;
  region?: string;
  zone?: string;
  account?: string;
}

export interface CloudState {
  account: string;
  configurations: Record<string, Config>;
  activeConfig: string;
  projects: Project[];
  /** `cluster@project` of the kubectl context, set by get-credentials. */
  kubeContext: string | null;
  /** Files in the Cloud Shell home directory. */
  files: Record<string, string>;
  /** Monotonic counter used to hand out fake IPs. */
  seq: number;
  /** Things a command did that leave no resource behind, e.g. `bq.query.standard`. */
  events: string[];
  /** Container images that crash when deployed, for rollback drills. */
  brokenImages: string[];
  /** Shell variables set with `export`. */
  env: Record<string, string>;
}

export const ACCOUNT = 'student@example.com';

/** APIs on by default in a new project, as on the real console. */
export const DEFAULT_SERVICES = [
  'bigquery.googleapis.com',
  'storage.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'iam.googleapis.com',
  'logging.googleapis.com',
  'monitoring.googleapis.com'
];

export function newProject(id: string, opts: { compute?: boolean; billing?: boolean } = {}): Project {
  const number = String(100000000000 + (hash(id) % 899999999999));
  const p: Project = {
    id,
    name: id,
    number,
    billing: opts.billing ?? true,
    services: [...DEFAULT_SERVICES, ...(opts.compute ? ['compute.googleapis.com'] : [])],
    instances: [],
    networks: [],
    subnets: [],
    firewalls: [],
    routers: [],
    nats: [],
    peerings: [],
    disks: [],
    snapshots: [],
    buckets: [],
    datasets: [],
    clusters: [],
    serviceAccounts: [],
    iam: [{ role: 'roles/owner', members: [`user:${ACCOUNT}`] }],
    templates: [],
    migs: [],
    run: [],
    topics: [],
    subscriptions: [],
    sql: [],
    functions: []
  };
  if (opts.compute) addDefaultNetwork(p);
  return p;
}

/** The `default` network and its four rules, which appear when Compute Engine is enabled. */
export function addDefaultNetwork(p: Project) {
  if (p.networks.some((n) => n.name === 'default')) return;
  p.networks.push({ name: 'default', mode: 'auto', routingMode: 'REGIONAL' });
  for (const [region, range] of Object.entries(AUTO_RANGES))
    p.subnets.push({ name: 'default', network: 'default', region, range, pga: false });
  const rule = (name: string, rules: string, src: string[]): FirewallRes => ({
    name,
    network: 'default',
    direction: 'INGRESS',
    priority: 65534,
    action: 'ALLOW',
    rules,
    sourceRanges: src,
    sourceTags: [],
    targetTags: [],
    targetServiceAccounts: [],
    destinationRanges: [],
    disabled: false
  });
  p.firewalls.push(
    rule('default-allow-internal', 'tcp:0-65535,udp:0-65535,icmp', ['10.128.0.0/9']),
    rule('default-allow-ssh', 'tcp:22', ['0.0.0.0/0']),
    rule('default-allow-rdp', 'tcp:3389', ['0.0.0.0/0']),
    rule('default-allow-icmp', 'icmp', ['0.0.0.0/0'])
  );
  if (!p.serviceAccounts.some((s) => s.name === 'compute'))
    p.serviceAccounts.push({
      email: `${p.number}-compute@developer.gserviceaccount.com`,
      name: 'compute',
      displayName: 'Compute Engine default service account',
      keys: 0
    });
}

export const AUTO_RANGES: Record<string, string> = {
  'us-central1': '10.128.0.0/20',
  'us-east1': '10.142.0.0/20',
  'europe-west1': '10.132.0.0/20',
  'asia-southeast1': '10.148.0.0/20',
  'asia-southeast2': '10.184.0.0/20',
  'us-west1': '10.138.0.0/20',
  'europe-west4': '10.164.0.0/20',
  'asia-northeast1': '10.146.0.0/20'
};

export const REGIONS = Object.keys(AUTO_RANGES);

/** Multi-regions and dual-regions accepted as bucket and dataset locations. */
export const MULTI_REGIONS = ['US', 'EU', 'ASIA', 'NAM4', 'EUR4', 'ASIA1'];

export function newState(projects: Project[], config: Config = {}): CloudState {
  return {
    account: ACCOUNT,
    configurations: { default: { account: ACCOUNT, ...config } },
    activeConfig: 'default',
    projects,
    kubeContext: null,
    files: {},
    seq: 1,
    events: [],
    brokenImages: [],
    env: {}
  };
}

export function cloneState(s: CloudState): CloudState {
  return JSON.parse(JSON.stringify(s)) as CloudState;
}

export function config(s: CloudState): Config {
  return s.configurations[s.activeConfig] ?? {};
}

export function project(s: CloudState, id?: string): Project | undefined {
  const want = id ?? config(s).project;
  return s.projects.find((p) => p.id === want);
}

export function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export const zoneRegion = (zone: string) => zone.replace(/-[a-z]$/, '');

/** The cluster kubectl talks to. */
export function kubeCluster(s: CloudState): Cluster | undefined {
  if (!s.kubeContext) return undefined;
  const [name, pid] = s.kubeContext.split('@');
  return s.projects.find((p) => p.id === pid)?.clusters.find((c) => c.name === name);
}

export function emptyKube(): Kube {
  return {
    namespaces: ['default', 'kube-system', 'kube-public', 'kube-node-lease'],
    deployments: [],
    services: [{ name: 'kubernetes', ns: 'default', type: 'ClusterIP', port: 443, targetPort: 443, selector: '', externalIp: null }],
    hpas: [],
    configmaps: []
  };
}

/** Members bound to a role on a project. */
export function membersOf(p: Project, role: string): string[] {
  return p.iam.find((b) => b.role === role)?.members ?? [];
}

export function hasBinding(p: Project, role: string, member: string): boolean {
  return membersOf(p, role).includes(member);
}
