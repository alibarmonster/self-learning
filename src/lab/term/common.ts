/**
 * Helpers every simulated CLI shares: the active project, API gating, the
 * exact error shapes gcloud prints, and a short hint in Indonesian under them.
 */
import { config, project, REGIONS, type CloudState, type Project } from './state';
import type { Out } from './shell';

/** Raised by a handler to stop with an error; the runner prints it. */
export class CliError extends Error {
  constructor(
    message: string,
    public hint?: string
  ) {
    super(message);
  }
}

/** `compute instances create` → `(gcloud.compute.instances.create)`. */
export const gcloudTag = (key: string) => `(gcloud.${key.replace(/ /g, '.')})`;

/** The active project, or the error gcloud prints when none is set. */
export function needProject(s: CloudState, tag: string, override?: string): Project {
  const id = override ?? config(s).project;
  if (!id)
    throw new CliError(
      `ERROR: ${tag} The required property [project] is not currently set.\nIt can be set on a per-command basis by re-running your command with the [--project] flag.\nYou may set it for your current workspace by running:\n\n  $ gcloud config set project VALUE`,
      'Belum ada project aktif. Jalankan gcloud config set project PROJECT_ID.'
    );
  const p = project(s, id);
  if (!p)
    throw new CliError(
      `ERROR: ${tag} PERMISSION_DENIED: Project '${id}' not found or permission denied.`,
      'Cek ID project dengan gcloud projects list — yang dipakai adalah PROJECT_ID, bukan nama.'
    );
  return p;
}

const API_NAMES: Record<string, string> = {
  'compute.googleapis.com': 'Compute Engine API',
  'container.googleapis.com': 'Kubernetes Engine API',
  'run.googleapis.com': 'Cloud Run Admin API',
  'sqladmin.googleapis.com': 'Cloud SQL Admin API',
  'pubsub.googleapis.com': 'Cloud Pub/Sub API',
  'cloudfunctions.googleapis.com': 'Cloud Functions API',
  'bigquery.googleapis.com': 'BigQuery API',
  'storage.googleapis.com': 'Cloud Storage API'
};

/** APIs that cost money and so need a billing account before they can be enabled. */
export const BILLED_APIS = new Set([
  'compute.googleapis.com',
  'container.googleapis.com',
  'run.googleapis.com',
  'sqladmin.googleapis.com',
  'cloudfunctions.googleapis.com'
]);

export function needApi(p: Project, api: string, tag: string) {
  if (p.services.includes(api)) return;
  throw new CliError(
    `ERROR: ${tag} PERMISSION_DENIED: ${API_NAMES[api] ?? api} has not been used in project ${p.number} before or it is disabled. Enable it by visiting https://console.developers.google.com/apis/api/${api}/overview?project=${p.number} then retry.`,
    `Aktifkan dulu API-nya: gcloud services enable ${api}`
  );
}

export function region(s: CloudState, explicit: string | undefined, tag: string, what = 'region'): string {
  const r = explicit ?? config(s).region;
  if (!r)
    throw new CliError(
      `ERROR: ${tag} Underspecified resource. Specify the [--${what}] flag or set the [compute/region] property.`,
      'Tambahkan --region=… atau gcloud config set compute/region asia-southeast2.'
    );
  if (!REGIONS.includes(r)) throw new CliError(`ERROR: ${tag} Invalid value for [--region]: Unknown region '${r}'.`);
  return r;
}

export function zone(s: CloudState, explicit: string | undefined, tag: string): string {
  const z = explicit ?? config(s).zone;
  if (!z)
    throw new CliError(
      `ERROR: ${tag} Underspecified resource [--zone]. Specify the [--zone] flag or set the [compute/zone] property.`,
      'Tambahkan --zone=… atau gcloud config set compute/zone asia-southeast2-a.'
    );
  if (!isZone(z)) throw new CliError(`ERROR: ${tag} Invalid value for [--zone]: Unknown zone '${z}'.`);
  return z;
}

export const isZone = (z: string) => /^[a-z]+-[a-z]+\d-[abc]$/.test(z) && REGIONS.includes(z.slice(0, -2));

export const MACHINE_RE = /^(e2|n1|n2|n2d|n4|c2|c2d|c3|c4|t2a|t2d|m1|m2|m3|a2|a3|g2)-(micro|small|medium|standard|highmem|highcpu|ultramem|megamem|highgpu)(-\d+)?$/;

export function machineType(v: string | undefined, tag: string): string {
  const m = v ?? 'e2-medium';
  if (!MACHINE_RE.test(m) && !/^custom-\d+-\d+$/.test(m))
    throw new CliError(`ERROR: ${tag} Could not fetch resource:\n - Invalid value for field 'resource.machineType': '${m}'. Machine type with name '${m}' does not exist.`);
  return m;
}

/** A fake but well-formed external address, unique within the session. */
export function nextExternalIp(s: CloudState): string {
  s.seq += 1;
  return `34.${100 + (s.seq % 50)}.${(s.seq * 37) % 250}.${(s.seq * 11) % 250 + 2}`;
}

/** A short random-looking suffix, deterministic per session counter. */
export function suffix(s: CloudState, len = 5): string {
  s.seq += 1;
  let n = Math.imul(s.seq + 7, 2654435761) >>> 0;
  let out = '';
  const abc = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < len; i++) {
    out += abc[n % 36];
    n = Math.floor(n / 36) + i * 7919;
  }
  return out;
}

export function selfLink(p: Project, path: string): string {
  return `https://www.googleapis.com/compute/v1/projects/${p.id}/${path}`;
}

/** Asks gcloud's "Do you want to continue (Y/n)?" and assumes yes, like `--quiet`. */
export function confirm(o: Out, what: string) {
  o.out(what, '', 'Do you want to continue (Y/n)?  Y', '');
}

export const MEMBER_RE = /^(user|serviceAccount|group|domain):[^\s]+$|^(allUsers|allAuthenticatedUsers)$/;

export function needMember(m: string | undefined, tag: string): string {
  if (!m) throw new CliError(`ERROR: ${tag} argument --member: Must be specified.`);
  if (!MEMBER_RE.test(m))
    throw new CliError(
      `ERROR: ${tag} INVALID_ARGUMENT: Invalid member '${m}'. Members must be of the form type:id, e.g. user:alice@example.com.`,
      'Format member: user:email, serviceAccount:email, group:email, domain:example.com, atau allUsers.'
    );
  return m;
}

export function needRole(r: string | undefined, tag: string): string {
  if (!r) throw new CliError(`ERROR: ${tag} argument --role: Must be specified.`);
  if (!/^(roles\/[A-Za-z0-9_.]+|projects\/[^/]+\/roles\/[A-Za-z0-9_.]+)$/.test(r))
    throw new CliError(`ERROR: ${tag} INVALID_ARGUMENT: Role (${r}) does not exist in the resource's hierarchy.`, 'Nama role selalu diawali roles/, misalnya roles/storage.objectViewer.');
  return r;
}

export function addBinding(bindings: { role: string; members: string[] }[], role: string, member: string) {
  const b = bindings.find((x) => x.role === role);
  if (!b) bindings.push({ role, members: [member] });
  else if (!b.members.includes(member)) b.members.push(member);
}

export function removeBinding(bindings: { role: string; members: string[] }[], role: string, member: string): boolean {
  const b = bindings.find((x) => x.role === role);
  if (!b || !b.members.includes(member)) return false;
  b.members = b.members.filter((m) => m !== member);
  if (!b.members.length) bindings.splice(bindings.indexOf(b), 1);
  return true;
}

export function printPolicy(o: Out, bindings: { role: string; members: string[] }[], etag = 'BwYk3x2c1aQ=') {
  o.out('bindings:');
  for (const b of [...bindings].sort((a, z) => a.role.localeCompare(z.role))) {
    o.out('- members:');
    for (const m of b.members) o.out(`  - ${m}`);
    o.out(`  role: ${b.role}`);
  }
  o.out(`etag: ${etag}`, 'version: 1');
}

/** `env=prod,team=web` → { env: 'prod', team: 'web' }. */
export function parseLabels(v: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const pair of (v ?? '').split(',').filter(Boolean)) {
    const [k, val = ''] = pair.split('=');
    out[k.trim()] = val.trim();
  }
  return out;
}

/** `20GB`, `20` → 20. */
export function parseGb(v: string | undefined, fallback: number): number {
  if (!v) return fallback;
  const m = /^(\d+)\s*(GB|G|TB|T)?$/i.exec(v.trim());
  if (!m) return fallback;
  return Number(m[1]) * (/^t/i.test(m[2] ?? '') ? 1024 : 1);
}
