/**
 * What an edge between two services means in Google Cloud: the mechanism
 * (push subscription, Eventarc trigger, serverless NEG, Direct VPC egress…),
 * the IAM roles it needs and who must hold them, the env vars it hands to the
 * caller (as Application Design Center does), and the network path a request
 * would take. Pairs with no mechanism are refused with the reason, the way
 * AWS Infrastructure Composer says "this configuration isn't supported".
 *
 * Roles and failure messages follow the service docs collected in
 * docs/lab.md; each `fail` text is what the learner would meet in real GCP.
 */
import type { Field } from './catalog';
import { SPECS } from './catalog';
import {
  PROJECT,
  PROJECT_NUMBER,
  bool,
  nodeById,
  num,
  outgoing,
  parseCidr,
  rows,
  runtimeSa,
  saEmail,
  str,
  vpcOf,
  type CEdge,
  type CNode,
  type Doc,
  type Issue,
  type NodeType
} from './model';

export type EdgeKind = 'invoke' | 'data' | 'event' | 'identity' | 'network' | 'image';

export interface Ctx {
  d: Doc;
  e: CEdge;
  src: CNode;
  dst: CNode;
}

export interface Need {
  id: string;
  /** Who must hold the role, as an IAM member string. */
  principal: string;
  /** Plain-language name of that principal. */
  who: string;
  role: string;
  /** Where the role is granted. */
  on: string;
  /** deploy: the deploy itself fails without it; runtime: requests fail. */
  phase: 'deploy' | 'runtime';
  fail: string;
  gcloud: string;
}

export interface Reach {
  ok: boolean;
  msg: string;
}

export interface Rule {
  kind: EdgeKind;
  label: string;
  explain: string;
  /** Type column of the event list: HTTP, Pub/Sub, Event, SQL, API… */
  proto: string;
  fields?: Field[];
  needs?: (c: Ctx) => Need[];
  env?: (c: Ctx) => Record<string, string>;
  secret?: (c: Ctx) => string;
  sql?: (c: Ctx) => string;
  check?: (c: Ctx) => Issue[];
  reach?: (c: Ctx) => Reach | null;
  gcloud?: (c: Ctx) => string[];
}

const DEPLOYER = 'user:student@ace-lab.dev';
const AGENT = {
  pubsub: `service-${PROJECT_NUMBER}@gcp-sa-pubsub.iam.gserviceaccount.com`,
  gcs: `service-${PROJECT_NUMBER}@gs-project-accounts.iam.gserviceaccount.com`,
  logging: `service-${PROJECT_NUMBER}@gcp-sa-logging.iam.gserviceaccount.com`,
  iap: `service-${PROJECT_NUMBER}@gcp-sa-iap.iam.gserviceaccount.com`
};

const RUNTIMES: NodeType[] = ['run', 'fn', 'gce', 'mig', 'gke'];
const SERVERLESS = (t: NodeType) => t === 'run' || t === 'fn';
const VMISH = (t: NodeType) => t === 'gce' || t === 'mig';

// ── helpers ─────────────────────────────────────────────────────────────────

const member = (email: string) => (email.startsWith('user:') ? email : `serviceAccount:${email}`);

function need(id: string, principal: string, who: string, role: string, on: string, onCmd: string, phase: Need['phase'], fail: string): Need {
  return { id, principal: member(principal), who, role, on, phase, fail, gcloud: onCmd.replace('MEMBER', member(principal)).replace('ROLE', role) };
}

const projectBinding = `gcloud projects add-iam-policy-binding ${PROJECT} --member=MEMBER --role=ROLE`;

/** The service account chosen on an edge for OIDC / triggers, if any. */
export function edgeIdentity(c: Ctx): { email: string; node?: CNode } | null {
  const id = str(c.e.params, 'identity');
  const n = id ? nodeById(c.d, id) : undefined;
  return n && n.type === 'sa' ? { email: saEmail(n.name), node: n } : null;
}

export const isPublic = (n: CNode) => bool(n.params, 'allowUnauth');
const ingress = (n: CNode) => str(n.params, 'ingress', 'all');
export const runUrl = (n: CNode) => (n.type === 'fn' ? `https://${str(n.params, 'region')}-${PROJECT}.cloudfunctions.net/${n.name}` : `https://${n.name}-${PROJECT_NUMBER}.${str(n.params, 'region')}.run.app`);
const regionOf = (n: CNode) => SPECS[n.type].location?.(n) ?? '';

/** Subnet a node would use in its VPC (or the auto/default network). */
function subnetFor(d: Doc, n: CNode): { vpc: string; range: string; pga: boolean; region: string } | null {
  const vpc = vpcOf(d, n);
  const region = regionOf(n);
  if (!vpc) return { vpc: 'default', range: '10.128.0.0/9', pga: false, region };
  if (vpc.params.mode === 'auto') return { vpc: vpc.name, range: '10.128.0.0/9', pga: false, region };
  const s = rows(vpc.params, 'subnets').find((x) => x.region === region);
  return s ? { vpc: vpc.name, range: String(s.range), pga: !!s.pga, region } : null;
}

const hasExternalIp = (n: CNode) => (n.type === 'gce' ? n.params.ip !== 'none' : n.type === 'mig' ? bool(n.params, 'ip') : n.type === 'gke' ? !bool(n.params, 'private') : false);

/** A Cloud NAT attached to the node's VPC in its region. */
function natFor(d: Doc, n: CNode): CNode | undefined {
  const vpc = vpcOf(d, n);
  if (!vpc) return undefined;
  const region = regionOf(n);
  return d.nodes.find((x) => x.type === 'nat' && vpcOf(d, x)?.id === vpc.id && str(x.params, 'region') === region);
}

/** Can a VM-like node reach Google APIs? */
function vmApiPath(d: Doc, n: CNode): Reach {
  if (hasExternalIp(n)) return { ok: true, msg: 'lewat IP eksternal' };
  const s = subnetFor(d, n);
  if (s?.pga) return { ok: true, msg: `lewat Private Google Access di subnet ${s.region}` };
  if (natFor(d, n)) return { ok: true, msg: 'lewat Cloud NAT' };
  return {
    ok: false,
    msg: `${n.name} tidak punya IP eksternal, subnetnya tanpa Private Google Access, dan tidak ada Cloud NAT — request ke Google API timeout. Aktifkan PGA di subnet ${regionOf(n)} atau pasang Cloud NAT.`
  };
}

/** Default access scopes only cover Storage read, Logging and Monitoring. */
function scopeFor(n: CNode, api: 'storage-write' | 'other'): Reach | null {
  if (!VMISH(n.type)) return null;
  if (str(n.params, 'scopes', 'default') === 'cloud-platform') return null;
  return {
    ok: false,
    msg: `Request had insufficient authentication scopes. ${n.name} memakai access scope default (${api === 'storage-write' ? 'Cloud Storage hanya read-only' : 'API ini tidak termasuk'}). Ganti scope ke cloud-platform dan batasi lewat IAM.`
  };
}

/** Does a VPC's firewall let `sources` reach `port` on a node with `tags`? */
export function firewallAllows(d: Doc, target: CNode, port: number, sources: string[]): { ok: boolean; rule?: string } {
  const vpc = vpcOf(d, target);
  const tags = str(target.params, 'tags')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  const rules = vpc
    ? rows(vpc.params, 'firewall')
    : [
        { name: 'default-allow-internal', allow: 'all', sources: '10.128.0.0/9', tags: '' },
        { name: 'default-allow-ssh', allow: 'tcp:22', sources: '0.0.0.0/0', tags: '' },
        { name: 'default-allow-rdp', allow: 'tcp:3389', sources: '0.0.0.0/0', tags: '' },
        { name: 'default-allow-icmp', allow: 'icmp', sources: '0.0.0.0/0', tags: '' }
      ];
  const covers = (allow: string) =>
    allow.split(',').some((a) => {
      if (a === 'all' || a === 'tcp') return true;
      const m = /^tcp:(\d+)(?:-(\d+))?$/.exec(a.trim());
      return !!m && port >= Number(m[1]) && port <= Number(m[2] ?? m[1]);
    });
  const inside = (src: string, rangeList: string) =>
    rangeList
      .split(',')
      .map((r) => r.trim())
      .some((r) => {
        const a = parseCidr(src);
        const b = parseCidr(r);
        if (!a || !b || b.bits > a.bits) return false;
        const mask = b.bits === 0 ? 0 : (~0 << (32 - b.bits)) >>> 0;
        return ((a.base & mask) >>> 0) === b.base;
      });
  for (const src of sources) {
    const hit = rules.find((r) => covers(String(r.allow ?? '')) && inside(src, String(r.sources ?? '')) && (!r.tags || tags.includes(String(r.tags).trim())));
    if (!hit) return { ok: false };
  }
  const first = rules.find((r) => covers(String(r.allow ?? '')) && inside(sources[0], String(r.sources ?? '')));
  return { ok: true, rule: first ? String(first.name) : undefined };
}

/** Serverless egress into a VPC: Direct VPC egress with a subnet in the service's region. */
function serverlessInto(d: Doc, n: CNode, vpcName: string, what: string, ip: string, port: number): Reach {
  const vpc = vpcOf(d, n);
  if (!vpc) return { ok: false, msg: `dial tcp ${ip}:${port}: i/o timeout — ${n.name} tidak punya jalur ke VPC ${vpcName}. Hubungkan ${n.name} ke VPC itu (Direct VPC egress) supaya bisa mencapai ${what}.` };
  if (vpc.name !== vpcName) return { ok: false, msg: `dial tcp ${ip}:${port}: i/o timeout — ${n.name} masuk ke VPC ${vpc.name}, sedangkan ${what} ada di VPC ${vpcName}.` };
  if (vpc.params.mode === 'custom' && !rows(vpc.params, 'subnets').some((s) => s.region === regionOf(n)))
    return { ok: false, msg: `Direct VPC egress butuh subnet di region ${regionOf(n)} pada VPC ${vpc.name}.` };
  return { ok: true, msg: `lewat Direct VPC egress ke ${vpc.name}` };
}

/** Network check for calling Google APIs from any runtime. */
function apiReach(c: Ctx, write = false): Reach | null {
  if (SERVERLESS(c.src.type)) {
    const vpc = vpcOf(c.d, c.src);
    if (vpc && str(c.src.params, 'egress') === 'all-traffic') {
      const s = rows(vpc.params, 'subnets').find((x) => x.region === regionOf(c.src));
      if (!s?.pga && !natFor(c.d, c.src)) return { ok: false, msg: `Egress all-traffic mengirim semua request lewat VPC ${vpc.name}, tapi subnetnya tanpa Private Google Access dan tanpa Cloud NAT — request ke Google API timeout.` };
    }
    return null;
  }
  if (VMISH(c.src.type) || c.src.type === 'gke') {
    const path = vmApiPath(c.d, c.src);
    if (!path.ok) return path;
    return scopeFor(c.src, write ? 'storage-write' : 'other');
  }
  return null;
}

/** The runtime identity of a caller, phrased for the learner. */
function callerSa(c: Ctx) {
  const sa = runtimeSa(c.d, c.src);
  if (c.src.type === 'gke' && !bool(c.src.params, 'wi')) return { ...sa, who: `service account node GKE ${c.src.name}` };
  return { ...sa, who: sa.isDefault ? `default compute SA (dipakai ${c.src.name})` : `${sa.node!.name} (identitas ${c.src.name})` };
}

const invokerNeed = (c: Ctx, principal: string, who: string): Need =>
  need(
    'invoker',
    principal,
    who,
    'roles/run.invoker',
    `${SPECS[c.dst.type].product} ${c.dst.name}`,
    c.dst.type === 'fn'
      ? `gcloud functions add-invoker-policy-binding ${c.dst.name} --region=${str(c.dst.params, 'region')} --member=MEMBER`
      : `gcloud run services add-iam-policy-binding ${c.dst.name} --region=${str(c.dst.params, 'region')} --member=MEMBER --role=ROLE`,
    'runtime',
    `HTTP 403: Forbidden — ${who} tidak punya roles/run.invoker di ${c.dst.name} (Permission 'run.routes.invoke' denied).`
  );

// ── rules for runtimes calling things ───────────────────────────────────────

function callerRules(): Record<string, Rule> {
  const out: Record<string, Rule> = {};
  for (const t of RUNTIMES) {
    out[`${t}>sql`] = {
      kind: 'data',
      label: 'Koneksi database',
      proto: 'SQL',
      explain: 'Aplikasi membuka koneksi ke Cloud SQL. Serverless dan GKE memakai Cloud SQL connector/Auth Proxy (butuh roles/cloudsql.client); VM di VPC yang sama bisa langsung ke IP privat.',
      needs: (c) => {
        const direct = VMISH(c.src.type) && bool(c.dst.params, 'privateIp') && vpcOf(c.d, c.src) && vpcOf(c.d, c.src)?.id === vpcOf(c.d, c.dst)?.id;
        if (direct) return [];
        const sa = callerSa(c);
        return [
          need('sqlclient', sa.email, sa.who, 'roles/cloudsql.client', `project ${PROJECT}`, projectBinding, 'runtime', `Cloud SQL connector: 403 NOT_AUTHORIZED — ${sa.who} tidak punya izin cloudsql.instances.connect (roles/cloudsql.client).`)
        ];
      },
      env: (c) => ({ INSTANCE_CONNECTION_NAME: `${PROJECT}:${str(c.dst.params, 'region')}:${c.dst.name}`, DB_NAME: 'app' }),
      sql: (c) => (SERVERLESS(c.src.type) ? `${PROJECT}:${str(c.dst.params, 'region')}:${c.dst.name}` : ''),
      reach: (c) => {
        const pub = bool(c.dst.params, 'publicIp');
        const priv = bool(c.dst.params, 'privateIp');
        const sqlVpc = vpcOf(c.d, c.dst);
        if (priv && sqlVpc) {
          if (SERVERLESS(c.src.type)) {
            const r = serverlessInto(c.d, c.src, sqlVpc.name, `IP privat ${c.dst.name}`, '10.40.0.3', 5432);
            if (r.ok || !pub) return r;
          } else {
            const mine = vpcOf(c.d, c.src);
            if (mine?.id === sqlVpc.id) return { ok: true, msg: `lewat IP privat di VPC ${sqlVpc.name}` };
            if (!pub) return { ok: false, msg: `dial tcp 10.40.0.3:5432: i/o timeout — ${c.src.name} tidak berada di VPC ${sqlVpc.name}, tempat IP privat ${c.dst.name}.` };
          }
        }
        if (pub) {
          if (VMISH(c.src.type)) {
            const path = vmApiPath(c.d, c.src);
            if (!path.ok) return { ok: false, msg: `${c.src.name} tidak bisa mencapai IP publik Cloud SQL: tanpa IP eksternal dan tanpa Cloud NAT.` };
            const sc = scopeFor(c.src, 'other');
            if (sc) return sc;
          }
          return { ok: true, msg: 'lewat IP publik dengan Cloud SQL connector (terenkripsi, diotorisasi IAM)' };
        }
        return { ok: false, msg: `${c.dst.name} tidak punya IP yang bisa dijangkau.` };
      },
      gcloud: (c) => (SERVERLESS(c.src.type) ? [`# ${c.src.name}: --add-cloudsql-instances=${PROJECT}:${str(c.dst.params, 'region')}:${c.dst.name} (sudah ada di perintah deploy)`] : [`# ${c.src.name}: jalankan Cloud SQL Auth Proxy, atau konek langsung ke IP privat ${c.dst.name}`])
    };

    out[`${t}>secret`] = {
      kind: 'data',
      label: 'Membaca secret',
      proto: 'API',
      explain: 'Aplikasi membaca versi secret — di Cloud Run biasanya dipasang sebagai env var atau volume. Identitasnya butuh roles/secretmanager.secretAccessor pada secret itu.',
      needs: (c) => {
        const sa = callerSa(c);
        return [
          need(
            'accessor',
            sa.email,
            sa.who,
            'roles/secretmanager.secretAccessor',
            `secret ${c.dst.name}`,
            `gcloud secrets add-iam-policy-binding ${c.dst.name} --member=MEMBER --role=ROLE`,
            SERVERLESS(c.src.type) ? 'deploy' : 'runtime',
            SERVERLESS(c.src.type)
              ? `Revision ${c.src.name}-00001 is not ready and cannot serve traffic: Permission denied on secret ${c.dst.name} for ${sa.email} (secretmanager.versions.access). The request failed because the instance could not start successfully.`
              : `PERMISSION_DENIED: Permission 'secretmanager.versions.access' denied for resource 'projects/${PROJECT}/secrets/${c.dst.name}/versions/latest'.`
          )
        ];
      },
      env: () => ({}),
      secret: (c) => `${c.dst.name.toUpperCase().replace(/-/g, '_')}=${c.dst.name}:latest`,
      reach: (c) => apiReach(c),
      gcloud: (c) => [`# ${c.src.name} membaca ${c.dst.name}: gcloud secrets versions access latest --secret=${c.dst.name}`]
    };

    const apiRule = (dst: NodeType, label: string, explain: string, roles: [string, string, string][], env: (c: Ctx) => Record<string, string>, write = true): Rule => ({
      kind: 'data',
      label,
      proto: 'API',
      explain,
      needs: (c) => {
        const sa = callerSa(c);
        return roles.map(([role, on, cmd]) =>
          need(role.split('/')[1], sa.email, sa.who, role, on.replace('$', c.dst.name), cmd.replace(/\$/g, c.dst.name), 'runtime', `403 PERMISSION_DENIED: ${sa.who} tidak punya ${role} (${on.replace('$', c.dst.name)}).`)
        );
      },
      env,
      reach: (c) => apiReach(c, write && dst === 'gcs')
    });

    out[`${t}>bq`] = apiRule(
      'bq',
      'Menulis/membaca BigQuery',
      'Aplikasi menjalankan query dan menulis baris. Butuh roles/bigquery.dataEditor di dataset dan roles/bigquery.jobUser di project (job dibuat di project).',
      [
        ['roles/bigquery.dataEditor', 'dataset $', `bq add-iam-policy-binding --member=MEMBER --role=ROLE ${PROJECT}:$`],
        ['roles/bigquery.jobUser', `project ${PROJECT}`, projectBinding]
      ],
      (c) => ({ BQ_DATASET: `${PROJECT}.${c.dst.name}`, BQ_TABLE: str(c.dst.params, 'table') })
    );
    out[`${t}>gcs`] = apiRule(
      'gcs',
      'Membaca/menulis objek',
      'Aplikasi membaca dan menulis objek di bucket. Application Design Center memberi roles/storage.objectAdmin pada bucket itu.',
      [['roles/storage.objectAdmin', 'bucket $', 'gcloud storage buckets add-iam-policy-binding gs://$ --member=MEMBER --role=ROLE']],
      (c) => ({ BUCKET: c.dst.name })
    );
    out[`${t}>topic`] = apiRule(
      'topic',
      'Publish pesan',
      'Aplikasi mem-publish pesan ke topic. Butuh roles/pubsub.publisher pada topic.',
      [['roles/pubsub.publisher', 'topic $', 'gcloud pubsub topics add-iam-policy-binding $ --member=MEMBER --role=ROLE']],
      (c) => ({ TOPIC: `projects/${PROJECT}/topics/${c.dst.name}` }),
      false
    );
    out[`${t}>firestore`] = apiRule(
      'firestore',
      'Baca/tulis dokumen',
      'Aplikasi memakai Firestore lewat API. Butuh roles/datastore.user di project.',
      [['roles/datastore.user', `project ${PROJECT}`, projectBinding]],
      (c) => ({ FIRESTORE_DATABASE: c.dst.name }),
      false
    );

    out[`${t}>redis`] = {
      kind: 'data',
      label: 'Koneksi Redis',
      proto: 'Redis',
      explain: 'Memorystore hanya punya IP internal di authorized network-nya. Pemanggil harus berada di (atau egress ke) VPC itu; tidak ada role IAM untuk koneksi data.',
      env: (c) => ({ REDIS_HOST: '10.50.0.4', REDIS_PORT: '6379', ...(bool(c.dst.params, 'auth') ? { REDIS_AUTH: '(dari Secret Manager)' } : {}) }),
      reach: (c) => {
        const rv = vpcOf(c.d, c.dst)?.name ?? 'default';
        if (SERVERLESS(c.src.type)) return serverlessInto(c.d, c.src, rv, `Memorystore ${c.dst.name}`, '10.50.0.4', 6379);
        const mine = vpcOf(c.d, c.src)?.name ?? 'default';
        return mine === rv ? { ok: true, msg: `di VPC ${rv} yang sama` } : { ok: false, msg: `dial tcp 10.50.0.4:6379: i/o timeout — ${c.src.name} di VPC ${mine}, sedangkan authorized network ${c.dst.name} adalah ${rv}.` };
      }
    };

    for (const target of ['run', 'fn'] as NodeType[])
      out[`${t}>${target}`] = {
        kind: 'invoke',
        label: 'Panggilan service-to-service',
        proto: 'HTTP',
        explain: 'Pemanggil mengirim request HTTPS dengan ID token (audience = URL tujuan). Untuk tujuan privat, identitas pemanggil butuh roles/run.invoker pada tujuan.',
        needs: (c) => {
          if (isPublic(c.dst)) return [];
          const sa = callerSa(c);
          return [invokerNeed(c, sa.email, sa.who)];
        },
        env: (c) => ({ [`${c.dst.name.toUpperCase().replace(/-/g, '_')}_URL`]: runUrl(c.dst) }),
        reach: (c) => {
          const ing = ingress(c.dst);
          if (ing === 'all') return null;
          const fromVpc = VMISH(c.src.type) || c.src.type === 'gke' || (SERVERLESS(c.src.type) && !!vpcOf(c.d, c.src) && str(c.src.params, 'egress') === 'all-traffic');
          return fromVpc ? { ok: true, msg: 'masuk sebagai trafik internal dari VPC' } : { ok: false, msg: `404 Not Found — ingress ${c.dst.name} adalah "${ing}", dan request dari ${c.src.name} tidak lewat VPC. Hubungkan ${c.src.name} ke VPC dengan egress all-traffic, atau ubah ingress.` };
        }
      };

    out[`${t}>internet`] = {
      kind: 'invoke',
      label: 'Trafik keluar ke internet',
      proto: 'HTTP',
      explain: 'Request keluar ke API pihak ketiga. VM butuh IP eksternal atau Cloud NAT; Cloud Run langsung bisa, kecuali semua egress-nya dipaksa lewat VPC tanpa NAT.',
      reach: (c) => {
        if (SERVERLESS(c.src.type)) {
          const vpc = vpcOf(c.d, c.src);
          if (vpc && str(c.src.params, 'egress') === 'all-traffic' && !natFor(c.d, c.src)) return { ok: false, msg: `Egress all-traffic lewat VPC ${vpc.name} tanpa Cloud NAT di ${regionOf(c.src)} — koneksi keluar timeout.` };
          return { ok: true, msg: vpc && str(c.src.params, 'egress') === 'all-traffic' ? 'lewat Cloud NAT' : 'langsung dari infrastruktur Cloud Run' };
        }
        if (hasExternalIp(c.src)) return { ok: true, msg: 'lewat IP eksternal VM' };
        if (natFor(c.d, c.src)) return { ok: true, msg: 'lewat Cloud NAT' };
        return { ok: false, msg: `${c.src.name} tidak punya IP eksternal dan tidak ada Cloud NAT di ${regionOf(c.src)} — koneksi keluar timeout.` };
      }
    };

    for (const target of ['gce', 'mig'] as NodeType[])
      out[`${t}>${target}`] = {
        kind: 'invoke',
        label: 'Panggilan internal ke VM',
        proto: 'HTTP',
        explain: 'Request ke IP internal VM. Harus di VPC yang sama, dan firewall VPC tujuan harus mengizinkan rentang sumbernya pada port aplikasi.',
        reach: (c) => {
          const tv = vpcOf(c.d, c.dst)?.name ?? 'default';
          const port = num(c.dst.params, 'port', 80);
          if (SERVERLESS(c.src.type)) {
            const r = serverlessInto(c.d, c.src, tv, `VM ${c.dst.name}`, '10.10.0.5', port);
            if (!r.ok) return r;
          } else if ((vpcOf(c.d, c.src)?.name ?? 'default') !== tv) return { ok: false, msg: `Tidak ada route: ${c.src.name} dan ${c.dst.name} di VPC berbeda (peering tidak digambar di sini).` };
          const s = subnetFor(c.d, c.src);
          const fw = firewallAllows(c.d, c.dst, port, [s?.range ?? '10.128.0.0/9']);
          return fw.ok ? { ok: true, msg: `diizinkan firewall ${fw.rule}` } : { ok: false, msg: `Connection timed out — firewall VPC ${tv} tidak mengizinkan ${s?.range ?? 'rentang sumber'} ke tcp:${port} (implied deny ingress).` };
        }
      };

    out[`${t}>vpc`] = {
      kind: 'network',
      label: SERVERLESS(t) ? 'Direct VPC egress' : 'Terhubung ke VPC',
      proto: 'Net',
      explain: SERVERLESS(t)
        ? 'Cloud Run/functions mengirim trafik keluar ke VPC lewat Direct VPC egress (yang kini dianjurkan, menggantikan Serverless VPC Access connector). Butuh subnet di region yang sama.'
        : 'Resource ini mendapat NIC di subnet VPC pada region-nya. Firewall VPC itu yang menentukan trafik masuk.',
      check: (c) => {
        const out: Issue[] = [];
        if (c.dst.params.mode === 'custom' && !rows(c.dst.params, 'subnets').some((s) => s.region === regionOf(c.src)))
          out.push({ level: 'error', msg: `VPC ${c.dst.name} tidak punya subnet di ${regionOf(c.src)}, region ${c.src.name}.` });
        if (outgoing(c.d, c.src.id).filter((e) => nodeById(c.d, e.to)?.type === 'vpc').length > 1) out.push({ level: 'error', msg: `${c.src.name} terhubung ke lebih dari satu VPC — di kanvas ini satu resource satu VPC.` });
        return out;
      }
    };
  }
  return out;
}

// ── entry points, events and attachments ────────────────────────────────────

const identityField: Field = {
  key: 'identity',
  label: 'Service account (OIDC token / trigger)',
  type: 'select',
  def: '',
  options: (d) => [{ value: '', label: '— tidak ada —' }, ...d.nodes.filter((n) => n.type === 'sa').map((n) => ({ value: n.id, label: saEmail(n.name) }))]
};

function serverlessIngressFromLb(c: Ctx): Reach | null {
  const ing = ingress(c.dst);
  if (ing === 'internal') return { ok: false, msg: `404 Not Found — ingress ${c.dst.name} "internal" menolak trafik dari load balancer. Pakai "internal-and-cloud-load-balancing".` };
  if (!isPublic(c.dst) && !bool(c.src.params, 'iap'))
    return { ok: false, msg: `HTTP 403: The request was not authenticated. ${c.dst.name} privat, dan load balancer tidak mengirim ID token. Izinkan akses publik (ingress internal-and-cloud-load-balancing menjaga hanya lewat LB) atau aktifkan IAP.` };
  return { ok: true, msg: bool(c.src.params, 'iap') ? 'lewat IAP (pengguna login Google)' : 'lewat serverless NEG' };
}

const BASE: Record<string, Rule> = {
  'internet>lb': {
    kind: 'invoke',
    label: 'Request HTTP(S)',
    proto: 'HTTP',
    explain: 'Pengguna memanggil IP/domain load balancer. Google Front End menerima request di edge terdekat.',
    reach: (c) => (c.dst.params.protocol === 'HTTPS' && !str(c.dst.params, 'domain') ? { ok: false, msg: 'Sertifikat belum aktif: domain belum diisi.' } : null)
  },
  'internet>run': {
    kind: 'invoke',
    label: 'Request langsung ke run.app',
    proto: 'HTTP',
    explain: 'Pengguna memanggil URL run.app langsung. Butuh ingress "all" dan akses publik.',
    reach: (c) => {
      if (ingress(c.dst) !== 'all') return { ok: false, msg: `404 Not Found — ingress ${c.dst.name} adalah "${ingress(c.dst)}", jadi request langsung dari internet ditolak.` };
      if (!isPublic(c.dst)) return { ok: false, msg: 'HTTP 403: Forbidden: Your client does not have permission to get URL / from this server.' };
      return null;
    }
  },
  'internet>gce': {
    kind: 'invoke',
    label: 'Request ke IP eksternal VM',
    proto: 'HTTP',
    explain: 'Pengguna memanggil IP eksternal VM. Butuh IP eksternal dan firewall yang membuka port aplikasi dari 0.0.0.0/0.',
    reach: (c) => {
      if (!hasExternalIp(c.dst)) return { ok: false, msg: `${c.dst.name} tidak punya IP eksternal — tidak bisa dijangkau dari internet. Taruh load balancer di depannya.` };
      const port = num(c.dst.params, 'port', 80);
      const fw = firewallAllows(c.d, c.dst, port, ['203.0.113.10/32']);
      return fw.ok ? { ok: true, msg: `diizinkan firewall ${fw.rule}` } : { ok: false, msg: `Connection timed out — tidak ada firewall rule yang mengizinkan tcp:${port} dari internet ke ${c.dst.name} (implied deny ingress).` };
    }
  },
  'internet>gcs': {
    kind: 'invoke',
    label: 'Unduh objek publik',
    proto: 'HTTP',
    explain: 'Browser mengambil objek lewat storage.googleapis.com. Hanya berhasil bila bucket memberi allUsers roles/storage.objectViewer.',
    reach: (c) => (bool(c.dst.params, 'public') && !bool(c.dst.params, 'pap') ? null : { ok: false, msg: 'AccessDenied: Anonymous caller does not have storage.objects.get access to the Google Cloud Storage object.' })
  },
  'internet>fn': {
    kind: 'invoke',
    label: 'Request HTTP ke function',
    proto: 'HTTP',
    explain: 'Pengguna memanggil URL function. Function HTTP harus publik untuk dipanggil tanpa token.',
    reach: (c) => {
      if (c.d.edges.some((e) => e.to === c.dst.id && ['gcs', 'topic'].includes(nodeById(c.d, e.from)?.type ?? ''))) return { ok: false, msg: `${c.dst.name} dipicu event, bukan HTTP — tidak punya URL untuk dipanggil.` };
      if (ingress(c.dst) !== 'all') return { ok: false, msg: '404 Not Found — ingress bukan "all".' };
      return isPublic(c.dst) ? null : { ok: false, msg: 'HTTP 403: Forbidden: Your client does not have permission to get URL / from this server.' };
    }
  },

  'lb>run': {
    kind: 'invoke',
    label: 'Serverless NEG',
    proto: 'HTTP',
    explain: 'Load balancer meneruskan ke Cloud Run lewat serverless NEG di region service itu (tanpa health check).',
    needs: (c) => (bool(c.src.params, 'iap') ? [invokerNeed(c, AGENT.iap, 'service agent IAP')] : []),
    check: (c) => (c.src.params.scheme === 'regional' && str(c.src.params, 'region') !== str(c.dst.params, 'region') ? [{ level: 'error', msg: `LB regional di ${str(c.src.params, 'region')} tidak bisa memakai serverless NEG di ${str(c.dst.params, 'region')}.` }] : []),
    reach: serverlessIngressFromLb,
    gcloud: (c) => {
      const g = c.src.params.scheme === 'regional' ? `--region=${str(c.src.params, 'region')}` : '--global';
      return [
        `gcloud compute network-endpoint-groups create ${c.dst.name}-neg --region=${str(c.dst.params, 'region')} --network-endpoint-type=serverless --cloud-run-service=${c.dst.name}`,
        `gcloud compute backend-services create ${c.src.name}-backend ${g} --load-balancing-scheme=${c.src.params.scheme === 'classic' ? 'EXTERNAL' : 'EXTERNAL_MANAGED'}${bool(c.src.params, 'cdn') ? ' --enable-cdn' : ''}${bool(c.src.params, 'iap') ? ' --iap=enabled' : ''}`,
        `gcloud compute backend-services add-backend ${c.src.name}-backend ${g} --network-endpoint-group=${c.dst.name}-neg --network-endpoint-group-region=${str(c.dst.params, 'region')}`
      ];
    }
  },
  'lb>mig': {
    kind: 'invoke',
    label: 'Backend instance group',
    proto: 'HTTP',
    explain: 'Backend service mengirim trafik ke MIG dan memeriksa kesehatannya dari 130.211.0.0/22 dan 35.191.0.0/16 — firewall VPC MIG harus mengizinkan keduanya.',
    reach: (c) => {
      const port = num(c.dst.params, 'port', 80);
      const fw = firewallAllows(c.d, c.dst, port, ['130.211.0.0/22', '35.191.0.0/16']);
      if (!fw.ok)
        return { ok: false, msg: `502 Bad Gateway — semua backend UNHEALTHY: firewall VPC ${vpcOf(c.d, c.dst)?.name ?? 'default'} tidak mengizinkan health check (130.211.0.0/22, 35.191.0.0/16) ke tcp:${port} pada tag ${str(c.dst.params, 'tags') || '(semua)'}.` };
      return { ok: true, msg: `backend HEALTHY (firewall ${fw.rule})` };
    },
    gcloud: (c) => {
      const loc = bool(c.dst.params, 'regional') ? `--instance-group-region=${str(c.dst.params, 'region')}` : `--instance-group-zone=${str(c.dst.params, 'zone')}`;
      return [
        `gcloud compute health-checks create http ${c.src.name}-hc --port=${num(c.dst.params, 'port', 80)}`,
        `gcloud compute backend-services create ${c.src.name}-backend --global --protocol=HTTP --port-name=http --health-checks=${c.src.name}-hc --load-balancing-scheme=${c.src.params.scheme === 'classic' ? 'EXTERNAL' : 'EXTERNAL_MANAGED'}${bool(c.src.params, 'cdn') ? ' --enable-cdn' : ''}`,
        `gcloud compute backend-services add-backend ${c.src.name}-backend --global --instance-group=${c.dst.name} ${loc}`
      ];
    }
  },
  'lb>gcs': {
    kind: 'invoke',
    label: 'Backend bucket',
    proto: 'HTTP',
    explain: 'Situs statis atau aset di bucket disajikan lewat load balancer (sering dengan Cloud CDN). Hanya Application LB global/classic.',
    check: (c) => {
      const out: Issue[] = [];
      if (c.src.params.scheme === 'regional') out.push({ level: 'error', msg: 'Backend bucket hanya didukung Application LB global atau classic, bukan regional.' });
      if (bool(c.src.params, 'iap')) out.push({ level: 'error', msg: 'IAP tidak bisa dipasang pada backend bucket.' });
      return out;
    },
    reach: (c) => (bool(c.dst.params, 'public') && !bool(c.dst.params, 'pap') ? null : { ok: false, msg: `403 AccessDenied — bucket ${c.dst.name} tidak bisa dibaca publik, jadi load balancer tidak bisa menyajikannya.` }),
    gcloud: (c) => [`gcloud compute backend-buckets create ${c.dst.name}-backend --gcs-bucket-name=${c.dst.name}${bool(c.src.params, 'cdn') ? ' --enable-cdn' : ''}`]
  },
  'lb>fn': {
    kind: 'invoke',
    label: 'Serverless NEG',
    proto: 'HTTP',
    explain: 'Load balancer meneruskan ke function lewat serverless NEG.',
    needs: (c) => (bool(c.src.params, 'iap') ? [invokerNeed(c, AGENT.iap, 'service agent IAP')] : []),
    reach: serverlessIngressFromLb,
    gcloud: (c) => [`gcloud compute network-endpoint-groups create ${c.dst.name}-neg --region=${str(c.dst.params, 'region')} --network-endpoint-type=serverless --cloud-function-name=${c.dst.name}`]
  },

  'scheduler>run': {
    kind: 'invoke',
    label: 'Target HTTP + OIDC token',
    proto: 'HTTP',
    explain: 'Cloud Scheduler memanggil URL service sesuai jadwal. Untuk service privat, pilih service account; token OIDC-nya butuh roles/run.invoker.',
    fields: [identityField],
    needs: (c) => {
      const id = edgeIdentity(c);
      return !isPublic(c.dst) && id ? [invokerNeed(c, id.email, id.node!.name)] : [];
    },
    check: (c) => (!isPublic(c.dst) && !edgeIdentity(c) ? [{ level: 'error', msg: `${c.dst.name} privat: pilih service account untuk OIDC token pada koneksi ini, kalau tidak Scheduler memanggil tanpa token (403).` }] : []),
    reach: (c) => (!isPublic(c.dst) && !edgeIdentity(c) ? { ok: false, msg: 'HTTP 403: The request was not authenticated — job dikirim tanpa OIDC token.' } : null),
    gcloud: (c) => {
      const id = edgeIdentity(c);
      return [
        `gcloud scheduler jobs create http ${c.src.name} --location=${str(c.src.params, 'region')} --schedule="${str(c.src.params, 'schedule')}" --time-zone=${str(c.src.params, 'tz')} --uri=${runUrl(c.dst)}/ --http-method=POST${id ? ` --oidc-service-account-email=${id.email}` : ''}`
      ];
    }
  },
  'scheduler>topic': {
    kind: 'invoke',
    label: 'Target Pub/Sub',
    proto: 'Pub/Sub',
    explain: 'Cloud Scheduler mem-publish pesan ke topic sesuai jadwal; service agent Scheduler yang mem-publish.',
    gcloud: (c) => [`gcloud scheduler jobs create pubsub ${c.src.name} --location=${str(c.src.params, 'region')} --schedule="${str(c.src.params, 'schedule')}" --topic=${c.dst.name} --message-body="tick"`]
  },

  'topic>run': {
    kind: 'event',
    label: 'Push subscription',
    proto: 'Pub/Sub',
    explain: 'Pub/Sub mengirim tiap pesan sebagai HTTP POST ke URL service. Untuk service privat, push subscription memakai service account (OIDC) yang butuh roles/run.invoker.',
    fields: [
      identityField,
      { key: 'ack', label: 'Ack deadline', type: 'number', def: 10, min: 10, max: 600, unit: 'detik' },
      { key: 'dlq', label: 'Dead letter topic', type: 'bool', def: false },
      { key: 'attempts', label: 'Maks. percobaan kirim', type: 'number', def: 5, min: 5, max: 100, show: (p) => p.dlq === true }
    ],
    needs: (c) => {
      const id = edgeIdentity(c);
      return !isPublic(c.dst) && id ? [invokerNeed(c, id.email, id.node!.name)] : [];
    },
    check: (c) => {
      const out: Issue[] = [];
      const ack = num(c.e.params, 'ack', 10);
      if (ack < 10 || ack > 600) out.push({ level: 'error', msg: 'Ack deadline 10–600 detik.' });
      if (bool(c.e.params, 'dlq') && (num(c.e.params, 'attempts', 5) < 5 || num(c.e.params, 'attempts', 5) > 100)) out.push({ level: 'error', msg: 'The value must be between 5 and 100.' });
      if (!isPublic(c.dst) && !edgeIdentity(c)) out.push({ level: 'error', msg: `${c.dst.name} privat: pilih service account untuk autentikasi push (OIDC).` });
      return out;
    },
    reach: (c) => (!isPublic(c.dst) && !edgeIdentity(c) ? { ok: false, msg: 'Push gagal 403 — pesan dikirim tanpa token; backlog subscription terus naik.' } : null),
    gcloud: (c) => {
      const id = edgeIdentity(c);
      return [
        `gcloud pubsub subscriptions create ${c.src.name}-${c.dst.name}-push --topic=${c.src.name} --push-endpoint=${runUrl(c.dst)}/${id ? ` --push-auth-service-account=${id.email}` : ''} --ack-deadline=${num(c.e.params, 'ack', 10)}${bool(c.e.params, 'dlq') ? ` --dead-letter-topic=${c.src.name}-dead --max-delivery-attempts=${num(c.e.params, 'attempts', 5)}` : ''}`
      ];
    }
  },
  'topic>fn': {
    kind: 'event',
    label: 'Trigger Eventarc (Pub/Sub)',
    proto: 'Pub/Sub',
    explain: 'Function dipicu setiap pesan di topic lewat trigger Eventarc. Service account trigger butuh roles/eventarc.eventReceiver, dan roles/run.invoker bila function privat.',
    fields: [identityField],
    needs: (c) => {
      const id = edgeIdentity(c);
      const email = id?.email ?? runtimeSa(c.d, c.dst).email;
      const who = id ? id.node!.name : 'default compute SA (trigger)';
      const out = [need('receiver', email, who, 'roles/eventarc.eventReceiver', `project ${PROJECT}`, projectBinding, 'runtime', `Eventarc: event tidak terkirim — ${who} tidak punya roles/eventarc.eventReceiver.`)];
      if (!isPublic(c.dst)) out.push(invokerNeed(c, email, who));
      return out;
    },
    gcloud: (c) => [`# Trigger dibuat oleh: gcloud functions deploy ${c.dst.name} --trigger-topic=${c.src.name}${edgeIdentity(c) ? ` --trigger-service-account=${edgeIdentity(c)!.email}` : ''}`]
  },
  'topic>bq': {
    kind: 'event',
    label: 'BigQuery subscription',
    proto: 'Pub/Sub',
    explain: 'Pub/Sub menulis pesan langsung ke tabel BigQuery tanpa kode. Service agent Pub/Sub butuh roles/bigquery.dataEditor di dataset.',
    needs: (c) => [
      need('bqeditor', AGENT.pubsub, 'service agent Pub/Sub', 'roles/bigquery.dataEditor', `dataset ${c.dst.name}`, `bq add-iam-policy-binding --member=MEMBER --role=ROLE ${PROJECT}:${c.dst.name}`, 'runtime', `Pesan tidak tertulis ke BigQuery: service agent Pub/Sub tidak punya bigquery.tables.updateData di ${c.dst.name} (pesan menumpuk atau masuk dead letter).`)
    ],
    gcloud: (c) => [`gcloud pubsub subscriptions create ${c.src.name}-bq --topic=${c.src.name} --bigquery-table=${PROJECT}:${c.dst.name}.${str(c.dst.params, 'table')}`]
  },
  'topic>gcs': {
    kind: 'event',
    label: 'Cloud Storage subscription',
    proto: 'Pub/Sub',
    explain: 'Pub/Sub menulis batch pesan sebagai file di bucket. Service agent Pub/Sub butuh storage.objectCreator dan storage.legacyBucketReader di bucket.',
    needs: (c) => [
      need('creator', AGENT.pubsub, 'service agent Pub/Sub', 'roles/storage.objectCreator', `bucket ${c.dst.name}`, `gcloud storage buckets add-iam-policy-binding gs://${c.dst.name} --member=MEMBER --role=ROLE`, 'deploy', 'Unable to verify if the Pub/Sub service agent has write permissions on this bucket.'),
      need('bucketreader', AGENT.pubsub, 'service agent Pub/Sub', 'roles/storage.legacyBucketReader', `bucket ${c.dst.name}`, `gcloud storage buckets add-iam-policy-binding gs://${c.dst.name} --member=MEMBER --role=ROLE`, 'deploy', 'Unable to verify if the Pub/Sub service agent has write permissions on this bucket.')
    ],
    gcloud: (c) => [`gcloud pubsub subscriptions create ${c.src.name}-gcs --topic=${c.src.name} --cloud-storage-bucket=${c.dst.name}`]
  },

  'gcs>topic': {
    kind: 'event',
    label: 'Notifikasi bucket',
    proto: 'Event',
    explain: 'Setiap perubahan objek dikirim sebagai pesan ke topic. Service agent Cloud Storage butuh roles/pubsub.publisher di topic.',
    needs: (c) => [
      need('gcspublisher', AGENT.gcs, 'service agent Cloud Storage', 'roles/pubsub.publisher', `topic ${c.dst.name}`, `gcloud pubsub topics add-iam-policy-binding ${c.dst.name} --member=MEMBER --role=ROLE`, 'runtime', 'Notifikasi tidak terkirim: service agent Cloud Storage tidak punya pubsub.topics.publish.')
    ],
    gcloud: (c) => [`gcloud storage buckets notifications create gs://${c.src.name} --topic=${c.dst.name}`]
  }
};

// Eventarc from Cloud Storage to Cloud Run services and functions.
for (const t of ['fn', 'run'] as NodeType[])
  BASE[`gcs>${t}`] = {
    kind: 'event',
    label: 'Trigger Eventarc (object finalized)',
    proto: 'Event',
    explain:
      'Setiap file baru di bucket memicu event google.cloud.storage.object.v1.finalized. Service agent Cloud Storage butuh roles/pubsub.publisher di project; service account trigger butuh roles/eventarc.eventReceiver (dan run.invoker bila tujuannya privat). Lokasi trigger harus sama dengan lokasi bucket.',
    fields: [identityField],
    needs: (c) => {
      const id = edgeIdentity(c);
      const email = id?.email ?? runtimeSa(c.d, c.dst).email;
      const who = id ? id.node!.name : 'default compute SA (trigger)';
      const out = [
        need('gcspub', AGENT.gcs, 'service agent Cloud Storage', 'roles/pubsub.publisher', `project ${PROJECT}`, projectBinding, 'deploy', 'Trigger gagal dibuat: Permission denied while using the Eventarc Service Agent — service agent Cloud Storage butuh roles/pubsub.publisher.'),
        need('receiver', email, who, 'roles/eventarc.eventReceiver', `project ${PROJECT}`, projectBinding, 'runtime', `Event tidak terkirim — ${who} tidak punya roles/eventarc.eventReceiver.`)
      ];
      if (!isPublic(c.dst)) out.push(invokerNeed(c, email, who));
      return out;
    },
    check: (c) => {
      const loc = SPECS.gcs.location!(c.src);
      return [{ level: 'info', msg: `Trigger Eventarc dibuat di lokasi bucket (${loc}); ${c.dst.name} sendiri boleh di ${regionOf(c.dst)}.` }];
    },
    gcloud: (c) =>
      t === 'fn'
        ? [`# Trigger dibuat oleh: gcloud functions deploy ${c.dst.name} --trigger-bucket=${c.src.name}`]
        : [
            `gcloud eventarc triggers create ${c.src.name}-to-${c.dst.name} --location=${SPECS.gcs.location!(c.src)} --destination-run-service=${c.dst.name} --destination-run-region=${str(c.dst.params, 'region')} --event-filters="type=google.cloud.storage.object.v1.finalized" --event-filters="bucket=${c.src.name}"${edgeIdentity(c) ? ` --service-account=${edgeIdentity(c)!.email}` : ''}`
          ]
  };

// Pull subscriptions for VM-based consumers.
for (const t of ['gce', 'mig', 'gke'] as NodeType[])
  BASE[`topic>${t}`] = {
    kind: 'event',
    label: 'Pull subscription',
    proto: 'Pub/Sub',
    explain: 'Konsumen menarik (pull) pesan dari subscription. Push butuh endpoint HTTPS publik, jadi untuk VM/GKE yang lazim adalah pull. Identitasnya butuh roles/pubsub.subscriber.',
    needs: (c) => {
      const sa = runtimeSa(c.d, c.dst);
      const who = sa.isDefault ? `default compute SA (${c.dst.name})` : sa.node!.name;
      return [need('subscriber', sa.email, who, 'roles/pubsub.subscriber', `subscription ${c.src.name}-${c.dst.name}`, `gcloud pubsub subscriptions add-iam-policy-binding ${c.src.name}-${c.dst.name} --member=MEMBER --role=ROLE`, 'runtime', `403 PERMISSION_DENIED: ${who} tidak punya pubsub.subscriptions.consume.`)];
    },
    reach: (c) => {
      if (c.dst.type === 'gke') return null;
      const path = vmApiPath(c.d, c.dst);
      if (!path.ok) return path;
      return scopeFor(c.dst, 'other');
    },
    gcloud: (c) => [`gcloud pubsub subscriptions create ${c.src.name}-${c.dst.name} --topic=${c.src.name}`]
  };

// Log sinks.
for (const [t, role, on, cmd] of [
  ['bq', 'roles/bigquery.dataEditor', 'dataset', `bq add-iam-policy-binding --member=MEMBER --role=ROLE ${PROJECT}:NAME`],
  ['gcs', 'roles/storage.objectCreator', 'bucket', 'gcloud storage buckets add-iam-policy-binding gs://NAME --member=MEMBER --role=ROLE'],
  ['topic', 'roles/pubsub.publisher', 'topic', 'gcloud pubsub topics add-iam-policy-binding NAME --member=MEMBER --role=ROLE']
] as const)
  BASE[`sink>${t}`] = {
    kind: 'event',
    label: 'Tujuan log sink',
    proto: 'Log',
    explain: `Sink menulis entri log yang cocok ke ${on} ini memakai writer identity-nya sendiri, yang butuh ${role} di tujuan.`,
    needs: (c) => [
      need('writer', AGENT.logging, 'writer identity sink', role, `${on} ${c.dst.name}`, cmd.replace('NAME', c.dst.name), 'runtime', `[ACTION REQUIRED] Cloud Logging sink configuration error in ${PROJECT}: writer identity tidak punya ${role} di ${c.dst.name}.`)
    ],
    gcloud: (c) => {
      const dest = t === 'bq' ? `bigquery.googleapis.com/projects/${PROJECT}/datasets/${c.dst.name}` : t === 'gcs' ? `storage.googleapis.com/${c.dst.name}` : `pubsub.googleapis.com/projects/${PROJECT}/topics/${c.dst.name}`;
      return [`gcloud logging sinks create ${c.src.name} ${dest} --log-filter='${str(c.src.params, 'filter')}'`];
    }
  };

// CI/CD.
BASE['build>ar'] = {
  kind: 'data',
  label: 'Push image',
  proto: 'Image',
  explain: 'Build mendorong image ke repository. Service account build butuh roles/artifactregistry.writer di repository.',
  needs: (c) => {
    const sa = runtimeSa(c.d, c.src);
    const who = sa.isDefault ? 'default compute SA (Cloud Build)' : sa.node!.name;
    return [need('arwriter', sa.email, who, 'roles/artifactregistry.writer', `repository ${c.dst.name}`, `gcloud artifacts repositories add-iam-policy-binding ${c.dst.name} --location=${str(c.dst.params, 'location')} --member=MEMBER --role=ROLE`, 'runtime', `denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/${PROJECT}/locations/${str(c.dst.params, 'location')}/repositories/${c.dst.name}" (or it may not exist)`)];
  },
  check: (c) => (c.dst.params.format !== 'docker' ? [{ level: 'error', msg: 'Image container hanya bisa didorong ke repository berformat docker.' }] : [])
};
BASE['build>run'] = {
  kind: 'invoke',
  label: 'Deploy ke Cloud Run',
  proto: 'Deploy',
  explain: 'Langkah terakhir build menjalankan gcloud run deploy. Service account build butuh roles/run.admin dan roles/iam.serviceAccountUser pada service account runtime service itu (actAs).',
  needs: (c) => {
    const sa = runtimeSa(c.d, c.src);
    const who = sa.isDefault ? 'default compute SA (Cloud Build)' : sa.node!.name;
    const target = runtimeSa(c.d, c.dst);
    return [
      need('runadmin', sa.email, who, 'roles/run.admin', `project ${PROJECT}`, projectBinding, 'runtime', `PERMISSION_DENIED: Permission 'run.services.update' denied on resource '${c.dst.name}'.`),
      need('actas', sa.email, who, 'roles/iam.serviceAccountUser', `service account ${target.email}`, `gcloud iam service-accounts add-iam-policy-binding ${target.email} --member=MEMBER --role=ROLE`, 'runtime', `Permission 'iam.serviceAccounts.actAs' denied on service account ${target.email} (or it may not exist).`)
    ];
  }
};
BASE['build>gke'] = {
  kind: 'invoke',
  label: 'Deploy ke GKE',
  proto: 'Deploy',
  explain: 'Build menjalankan kubectl apply ke cluster. Service account build butuh roles/container.developer.',
  needs: (c) => {
    const sa = runtimeSa(c.d, c.src);
    const who = sa.isDefault ? 'default compute SA (Cloud Build)' : sa.node!.name;
    return [need('gkedev', sa.email, who, 'roles/container.developer', `project ${PROJECT}`, projectBinding, 'runtime', `Error from server (Forbidden): deployments.apps is forbidden: User "${sa.email}" cannot patch resource "deployments".`)];
  }
};

// Image sources.
for (const t of ['run', 'gke', 'gce', 'mig'] as NodeType[])
  BASE[`ar>${t}`] = {
    kind: 'image',
    label: 'Sumber image',
    proto: 'Image',
    explain: t === 'run' ? 'Cloud Run menarik image dari repository ini dengan service agent-nya (otomatis bila satu project).' : 'Node/VM menarik image dengan service account-nya, yang butuh roles/artifactregistry.reader.',
    needs: (c) => {
      if (t === 'run') return [];
      const sa = runtimeSa(c.d, c.dst);
      const who = c.dst.type === 'gke' ? `service account node ${c.dst.name}` : sa.isDefault ? `default compute SA (${c.dst.name})` : sa.node!.name;
      return [
        need('arreader', sa.email, who, 'roles/artifactregistry.reader', `repository ${c.src.name}`, `gcloud artifacts repositories add-iam-policy-binding ${c.src.name} --location=${str(c.src.params, 'location')} --member=MEMBER --role=ROLE`, 'deploy', c.dst.type === 'gke' ? 'Pod ImagePullBackOff: 403 Forbidden saat menarik image dari Artifact Registry.' : `Gagal menarik image: denied: Permission "artifactregistry.repositories.downloadArtifacts" denied.`)
      ];
    },
    check: (c) => {
      if (t !== 'run') return [];
      const prefix = `${str(c.src.params, 'location')}-docker.pkg.dev/${PROJECT}/${c.src.name}/`;
      return str(c.dst.params, 'image').startsWith(prefix) ? [] : [{ level: 'warn', msg: `Image ${c.dst.name} belum menunjuk repository ini (harus diawali ${prefix}).` }];
    }
  };

// Service accounts attached to what runs code.
for (const t of ['run', 'fn', 'gce', 'mig', 'gke', 'build'] as NodeType[])
  BASE[`sa>${t}`] = {
    kind: 'identity',
    label: 'Dijalankan sebagai',
    proto: 'IAM',
    explain: 'Resource ini memakai service account tersebut sebagai identitasnya. Orang yang men-deploy butuh roles/iam.serviceAccountUser (actAs) pada service account itu.',
    needs: (c) => [
      need('actas', DEPLOYER, 'kamu (yang men-deploy)', 'roles/iam.serviceAccountUser', `service account ${saEmail(c.src.name)}`, `gcloud iam service-accounts add-iam-policy-binding ${saEmail(c.src.name)} --member=MEMBER --role=ROLE`, 'deploy', `Permission 'iam.serviceAccounts.actAs' denied on service account ${saEmail(c.src.name)} (or it may not exist).`)
    ],
    check: (c) => (c.d.edges.filter((e) => e.to === c.dst.id && nodeById(c.d, e.from)?.type === 'sa').length > 1 ? [{ level: 'error', msg: `${c.dst.name} hanya bisa memakai satu service account.` }] : [])
  };

// Private services access, authorized networks, NAT.
BASE['sql>vpc'] = {
  kind: 'network',
  label: 'Private services access',
  proto: 'Net',
  explain: 'IP privat Cloud SQL tinggal di jaringan milik Google yang di-peer ke VPC ini lewat private services access (rentang IP yang dialokasikan + peering servicenetworking).',
  check: (c) => (bool(c.src.params, 'privateIp') ? [] : [{ level: 'warn', msg: `IP privat ${c.src.name} belum aktif, jadi koneksi ini tidak dipakai.` }]),
  gcloud: (c) => [
    `gcloud compute addresses create google-managed-services-${c.dst.name} --global --purpose=VPC_PEERING --prefix-length=16 --network=${c.dst.name}`,
    `gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=google-managed-services-${c.dst.name} --network=${c.dst.name}`
  ]
};
BASE['redis>vpc'] = { kind: 'network', label: 'Authorized network', proto: 'Net', explain: 'Instance Redis mendapat IP internal yang hanya bisa dijangkau dari VPC ini.' };
BASE['nat>vpc'] = {
  kind: 'network',
  label: 'NAT untuk VPC',
  proto: 'Net',
  explain: 'Cloud Router + Cloud NAT di region ini memberi akses keluar ke resource tanpa IP eksternal di VPC tersebut.',
  check: (c) => (c.dst.params.mode === 'custom' && !rows(c.dst.params, 'subnets').some((s) => s.region === str(c.src.params, 'region')) ? [{ level: 'warn', msg: `VPC ${c.dst.name} tidak punya subnet di ${str(c.src.params, 'region')} — NAT ini tidak melayani apa pun.` }] : [])
};

export const RULES: Record<string, Rule> = { ...callerRules(), ...BASE };

export const ruleFor = (a: NodeType, b: NodeType): Rule | undefined => RULES[`${a}>${b}`];

/** Why a pair cannot be wired, in Indonesian, with what to do instead. */
export function refusal(a: NodeType, b: NodeType): string {
  const A = SPECS[a].product;
  const B = SPECS[b].product;
  if (a === b && a !== 'run' && a !== 'fn') return `${A} tidak dihubungkan ke ${B} lain di kanvas ini.`;
  if (!SPECS[a].outputs) return `${A} adalah tujuan — ia tidak memanggil apa pun. Tarik koneksi dari pemakainya ke ${A}.`;
  if (!SPECS[b].inputs) return `${B} tidak menerima koneksi masuk. ${b === 'sa' ? 'Tarik dari service account ke resource yang dijalankan sebagai akun itu.' : ''}`;
  const special: Record<string, string> = {
    'gcs>sql': 'Cloud Storage tidak menulis ke Cloud SQL sendiri. Pasang Cloud Run function di antaranya (bucket → function → Cloud SQL), atau jalankan `gcloud sql import`.',
    'gcs>bq': 'Bucket tidak mendorong data ke BigQuery sendiri. Pakai function di antaranya, `bq load`, external table, atau BigQuery Data Transfer Service.',
    'topic>sql': 'Pub/Sub hanya punya subscription pull, push, BigQuery dan Cloud Storage — tidak ada yang langsung ke Cloud SQL. Taruh Cloud Run di antaranya.',
    'topic>firestore': 'Pub/Sub tidak menulis ke Firestore langsung. Taruh Cloud Run atau function di antaranya.',
    'topic>redis': 'Push butuh endpoint HTTPS publik, dan tidak ada subscription ke Memorystore. Taruh Cloud Run di antaranya.',
    'lb>sql': 'Backend load balancer hanya instance group, NEG (termasuk serverless) dan backend bucket — database tidak pernah jadi backend LB.',
    'lb>redis': 'Backend load balancer hanya instance group, NEG dan backend bucket.',
    'lb>bq': 'BigQuery bukan backend load balancer.',
    'lb>gce': 'Backend load balancer memakai instance group atau NEG. Bungkus VM dalam managed instance group.',
    'lb>gke': 'Di GKE, load balancer dibuat dari dalam cluster lewat Ingress/Gateway atau Service LoadBalancer — di kanvas ini hubungkan LB ke MIG atau Cloud Run.',
    'internet>mig': 'MIG tidak punya satu alamat publik. Taruh load balancer di depannya.',
    'internet>sql': 'Database tidak dibuka langsung ke internet di desain ini. Akses lewat aplikasi; untuk admin, pakai Cloud SQL Auth Proxy.',
    'internet>gke': 'Trafik ke GKE masuk lewat load balancer yang dibuat Service/Ingress di dalam cluster.',
    'ar>fn': 'Cloud Run functions membangun image-nya sendiri dari source; tidak perlu dihubungkan ke repository.',
    'sa>scheduler': 'Identitas Cloud Scheduler dipilih per tujuan: buka koneksi Scheduler → service dan pilih service account untuk OIDC token.',
    'scheduler>gce': 'Scheduler memanggil URL HTTP(S) publik atau mem-publish ke Pub/Sub. Untuk VM, publish ke topic dan biarkan VM menarik pesannya.',
    'topic>topic': 'Topic tidak meneruskan ke topic lain sendiri — yang ada hanya dead letter topic, diatur di koneksi topic → konsumen.'
  };
  const key = `${a}>${b}`;
  if (special[key]) return special[key];
  if (a === 'sa') return 'Service account dipasang ke resource yang menjalankan kode (Cloud Run, functions, VM, MIG, GKE, Cloud Build). Untuk memberi akses ke layanan lain, tarik koneksi dari pemakainya.';
  if (b === 'vpc') return `${A} tidak dipasang ke VPC. Yang terhubung ke VPC: VM, MIG, GKE, Cloud Run/functions (Direct VPC egress), Cloud SQL (private services access), Redis, dan Cloud NAT.`;
  if (b === 'internet') return `Trafik keluar ke internet hanya dari compute: VM, MIG, GKE, Cloud Run, functions.`;
  if (a === 'internet') return `Dari internet, request masuk lewat load balancer, Cloud Run/functions publik, VM ber-IP eksternal, atau bucket publik — bukan langsung ke ${B}.`;
  return `${A} tidak punya mekanisme untuk terhubung langsung ke ${B}. Biasanya ada Cloud Run atau function di antaranya.`;
}

/** Env vars, secrets and Cloud SQL connections the node gets from its outgoing edges. */
export function wiringFor(d: Doc, n: CNode) {
  const env: Record<string, string> = {};
  const secrets: string[] = [];
  const sql: string[] = [];
  for (const e of outgoing(d, n.id)) {
    const dst = nodeById(d, e.to);
    if (!dst) continue;
    const r = ruleFor(n.type, dst.type);
    if (!r) continue;
    const c = { d, e, src: n, dst };
    Object.assign(env, r.env?.(c) ?? {});
    const s = r.secret?.(c);
    if (s) secrets.push(s);
    const q = r.sql?.(c);
    if (q) sql.push(q);
  }
  return { env, secrets, sql };
}

export const granted = (e: CEdge, id: string) => (e.params.grant as Record<string, boolean> | undefined)?.[id] !== false;

/** Default params for a new edge of this rule. */
export function edgeDefaults(r: Rule): Record<string, unknown> {
  const p: Record<string, unknown> = { grant: {} };
  for (const f of r.fields ?? []) p[f.key] = structuredClone(f.def);
  return p;
}
