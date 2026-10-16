/**
 * Cloud Storage, shared by `gsutil` and `gcloud storage`: the two CLIs differ
 * in spelling and error format, not in what they do to a bucket.
 */
import { CliError, addBinding, removeBinding } from './common';
import { MULTI_REGIONS, REGIONS, type Bucket, type CloudState, type Project } from './state';
import type { Out } from './shell';

export type Style = 'gsutil' | 'gcloud';

export const CLASSES = ['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'];

/** Names someone, somewhere, already owns: bucket names are global. */
const TAKEN = new Set(['test', 'bucket', 'my-bucket', 'data', 'backup', 'example', 'images', 'logs', 'static']);

export interface Fail {
  (code: number, msg: string, hint?: string): never;
}

/** Builds the error thrower for one command, in the style its CLI prints. */
export function failer(style: Style, tag: string): Fail {
  return (code, msg, hint) => {
    if (style === 'gcloud') throw new CliError(`ERROR: ${tag} ${code ? `HTTPError ${code}: ` : ''}${msg}`, hint);
    const kind =
      code === 404 ? 'NotFoundException' : code === 409 ? 'ServiceException' : code === 403 ? 'AccessDeniedException' : code ? 'BadRequestException' : 'CommandException';
    throw new CliError(`${kind}: ${code ? `${code} ` : ''}${msg}`, hint);
  };
}

export function splitUrl(url: string): { bucket: string; path: string } | null {
  const m = /^gs:\/\/([^/]+)\/?(.*)$/.exec(url);
  return m ? { bucket: m[1], path: m[2] } : null;
}

export function findBucket(s: CloudState, name: string): { bucket: Bucket; owner: Project } | null {
  for (const p of s.projects) {
    const b = p.buckets.find((x) => x.name === name);
    if (b) return { bucket: b, owner: p };
  }
  return null;
}

export function needBucket(s: CloudState, url: string, fail: Fail): Bucket {
  const u = splitUrl(url);
  if (!u) fail(0, `"${url}" is not a valid bucket URL; expected gs://BUCKET.`);
  const hit = findBucket(s, u!.bucket);
  if (!hit) fail(404, `gs://${u!.bucket} bucket does not exist.`);
  return hit!.bucket;
}

export function normClass(v: string | undefined, fail: Fail): string | undefined {
  if (!v) return undefined;
  const c = v.toUpperCase().replace('MULTI_REGIONAL', 'STANDARD').replace('REGIONAL', 'STANDARD');
  if (!CLASSES.includes(c)) fail(400, `Invalid storage class '${v}'. Use STANDARD, NEARLINE, COLDLINE or ARCHIVE.`);
  return c;
}

export function normLocation(v: string | undefined, fail: Fail): string {
  const loc = (v ?? 'US').trim();
  const up = loc.toUpperCase();
  if (MULTI_REGIONS.includes(up)) return up;
  if (REGIONS.includes(loc.toLowerCase())) return loc.toUpperCase();
  if (/^[a-z]+-[a-z]+\d-[abc]$/i.test(loc))
    fail(400, `Invalid location '${loc}'. Buckets live in a region, dual-region or multi-region — not a zone.`, 'Lokasi bucket adalah region (asia-southeast2) atau multi-region (US, EU, ASIA), bukan zone.');
  fail(400, `Invalid location '${loc}'.`);
  return up;
}

export function createBucket(
  s: CloudState,
  p: Project,
  url: string,
  opts: { location?: string; storageClass?: string; uniform?: boolean },
  fail: Fail
): Bucket {
  const u = splitUrl(url);
  if (!u || u.path) fail(0, `"${url}" is not a valid bucket URL; expected gs://BUCKET.`);
  const name = u!.bucket;
  if (!/^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/.test(name) || name.includes('..') || name.startsWith('goog'))
    fail(400, `Invalid bucket name: '${name}'.`, 'Nama bucket: 3–63 karakter, huruf kecil, angka, - _ . dan tidak boleh diawali "goog".');
  if (findBucket(s, name) || TAKEN.has(name))
    fail(
      409,
      `A Cloud Storage bucket named '${name}' already exists. Try another name. Bucket names must be globally unique across all Google Cloud projects, including those outside of your organization.`,
      'Nama bucket berlaku global untuk semua orang. Tambahkan ID project atau akhiran unik.'
    );
  const b: Bucket = {
    name,
    location: normLocation(opts.location, fail),
    storageClass: normClass(opts.storageClass, fail) ?? 'STANDARD',
    versioning: false,
    uniformAccess: !!opts.uniform,
    objects: {},
    lifecycle: [],
    iam: [
      { role: 'roles/storage.legacyBucketOwner', member: `projectOwner:${p.id}` },
      { role: 'roles/storage.legacyBucketReader', member: `projectViewer:${p.id}` }
    ],
    retentionSeconds: 0
  };
  p.buckets.push(b);
  return b;
}

/** Turns `*` and `**` into a regex over object names. */
function globRe(pattern: string): RegExp {
  const esc = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '\u0000').replace(/\*/g, '[^/]*').replace(/\u0000/g, '.*');
  return new RegExp(`^${esc}$`);
}

/** Objects named by a URL: an exact name, a prefix "folder", or a wildcard. */
export function matchObjects(b: Bucket, path: string, recursive: boolean): string[] {
  const names = Object.keys(b.objects).sort();
  if (!path) return recursive ? names : names;
  if (path.includes('*')) return names.filter((n) => globRe(path).test(n));
  if (b.objects[path]) return [path];
  const prefix = path.endsWith('/') ? path : `${path}/`;
  return recursive ? names.filter((n) => n.startsWith(prefix)) : [];
}

const today = () => '2026-10-16T09:41:07Z';

export function listUrl(s: CloudState, p: Project, url: string | undefined, long: boolean, o: Out, fail: Fail) {
  if (!url) {
    for (const b of p.buckets) o.out(`gs://${b.name}/`);
    if (!p.buckets.length) o.info('(tidak ada bucket di project ini)');
    return;
  }
  const b = needBucket(s, url, fail);
  const { path } = splitUrl(url)!;
  const names = path ? matchObjects(b, path, true) : Object.keys(b.objects).sort();
  if (path && !names.length) fail(0, `One or more URLs matched no objects.`);
  // Without -r, ls shows the top level and "folders".
  const shown = new Set<string>();
  let total = 0;
  for (const n of names) {
    const rel = path && !path.includes('*') && !b.objects[path] ? n : n;
    const top = !long && !path && rel.includes('/') ? `${rel.split('/')[0]}/` : rel;
    if (shown.has(top)) continue;
    shown.add(top);
    if (long && !top.endsWith('/')) {
      const ob = b.objects[n];
      total += ob.size;
      o.out(`${String(ob.size).padStart(10)}  ${today()}  gs://${b.name}/${n}`);
    } else o.out(`gs://${b.name}/${top}`);
  }
  if (long) o.out(`TOTAL: ${names.length} objects, ${total} bytes (${(total / 1024).toFixed(2)} KiB)`);
}

/** Copies between Cloud Shell files and buckets, either direction. */
export function copy(s: CloudState, src: string[], dest: string, opts: { recursive: boolean; storageClass?: string; move?: boolean }, o: Out, fail: Fail) {
  if (!src.length || !dest) fail(0, 'Usage: cp SOURCE... DESTINATION');
  const destUrl = splitUrl(dest);
  let count = 0;
  for (const one of src) {
    const su = splitUrl(one);
    // Collect [name, size, rows] pairs from the source.
    const items: { name: string; size: number; rows?: number; content?: string }[] = [];
    if (su) {
      const b = needBucket(s, one, fail);
      const names = matchObjects(b, su.path, opts.recursive);
      if (!names.length) fail(0, `No URLs matched: ${one}`);
      for (const n of names) items.push({ name: n.split('/').pop()!, size: b.objects[n].size, rows: b.objects[n].rows });
      if (opts.move) for (const n of names) delete b.objects[n];
    } else {
      const files = one.includes('*') ? Object.keys(s.files).filter((f) => globRe(one).test(f)) : s.files[one] !== undefined ? [one] : [];
      if (!files.length) fail(0, `No URLs matched: ${one}`, 'File itu tidak ada di home Cloud Shell. Cek dengan ls.');
      for (const f of files) {
        const content = s.files[f];
        const lines = content.split('\n').filter((l) => l.trim()).length;
        items.push({ name: f.split('/').pop()!, size: content.length, rows: f.endsWith('.csv') ? Math.max(0, lines - 1) : undefined, content });
        if (opts.move) delete s.files[f];
      }
    }
    for (const it of items) {
      if (destUrl) {
        const b = needBucket(s, dest, fail);
        const multi = items.length > 1 || src.length > 1;
        const key = !destUrl.path || destUrl.path.endsWith('/') || multi ? `${destUrl.path}${destUrl.path && !destUrl.path.endsWith('/') ? '/' : ''}${it.name}` : destUrl.path;
        const prev = b.objects[key];
        if (prev && b.retentionSeconds) fail(403, `Object 'gs://${b.name}/${key}' is subject to bucket's retention policy and cannot be deleted, overwritten or archived until the retention period ends.`);
        b.objects[key] = {
          size: it.size,
          storageClass: normClass(opts.storageClass, fail) ?? b.storageClass,
          rows: it.rows,
          versions: prev && b.versioning ? (prev.versions ?? 0) + 1 : 0
        };
        o.out(`Copying ${su ? one : `file://${it.name}`} [Content-Type=${it.name.endsWith('.csv') ? 'text/csv' : 'application/octet-stream'}]...`);
      } else {
        const name = dest === '.' || dest.endsWith('/') ? it.name : dest;
        s.files[name] = it.content ?? `(isi ${it.name}, ${it.size} byte)`;
        o.out(`Copying gs://…/${it.name}...`);
      }
      count++;
    }
  }
  o.out(`/ [${count} files][  ${count} objects]`, `Operation completed over ${count} objects.`);
}

export function remove(s: CloudState, urls: string[], recursive: boolean, o: Out, fail: Fail) {
  for (const url of urls) {
    const b = needBucket(s, url, fail);
    const { path } = splitUrl(url)!;
    const names = path ? matchObjects(b, path, recursive) : recursive ? Object.keys(b.objects) : [];
    if (!names.length) fail(0, `No URLs matched: ${url}`);
    if (b.retentionSeconds)
      fail(403, `Object 'gs://${b.name}/${names[0]}' is subject to bucket's retention policy and cannot be deleted until the retention period ends.`, 'Retention policy mencegah penghapusan sampai umur objek melewati periode retensi.');
    for (const n of names) {
      if (b.versioning) b.objects[n] = { ...b.objects[n] };
      delete b.objects[n];
      o.out(`Removing gs://${b.name}/${n}...`);
    }
  }
}

export function removeBucket(s: CloudState, url: string, o: Out, fail: Fail) {
  const b = needBucket(s, url, fail);
  if (Object.keys(b.objects).length)
    fail(409, `The bucket you tried to delete is not empty.`, 'Kosongkan dulu (rm -r gs://BUCKET/**) atau pakai gsutil rm -r gs://BUCKET.');
  const owner = findBucket(s, b.name)!.owner;
  owner.buckets = owner.buckets.filter((x) => x !== b);
  o.out(`Removing gs://${b.name}/...`);
}

/** Reads a lifecycle config file in either gsutil (`{rule:[…]}`) or nested (`{lifecycle:{rule:[…]}}`) shape. */
export function readLifecycle(s: CloudState, file: string | undefined, fail: Fail): Bucket['lifecycle'] {
  if (!file) fail(0, 'A lifecycle configuration file is required.');
  const text = s.files[file!];
  if (text === undefined) fail(0, `No such file: ${file}`, 'Cek nama file dengan ls; buat dengan echo \'{…}\' > lifecycle.json.');
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    fail(400, `Invalid JSON in ${file}.`);
  }
  const root = (json as { lifecycle?: unknown }).lifecycle ?? json;
  const rules = (root as { rule?: unknown[] }).rule;
  if (!Array.isArray(rules) || !rules.length) fail(400, `${file} must contain a "rule" list.`);
  return rules!.map((r) => {
    const rule = r as { action?: { type?: string; storageClass?: string }; condition?: { age?: number } };
    const type = rule.action?.type;
    if (type !== 'Delete' && type !== 'SetStorageClass') fail(400, `Unsupported lifecycle action '${type}'. Use Delete or SetStorageClass.`);
    if (type === 'SetStorageClass' && !CLASSES.includes(String(rule.action?.storageClass).toUpperCase()))
      fail(400, 'SetStorageClass needs a storageClass: NEARLINE, COLDLINE or ARCHIVE.');
    const age = Number(rule.condition?.age);
    if (!Number.isFinite(age)) fail(400, 'Each rule needs a condition, e.g. {"age": 30}.');
    return { action: type!, storageClass: rule.action?.storageClass?.toUpperCase(), age };
  });
}

export function lifecycleJson(b: Bucket): string {
  if (!b.lifecycle.length) return `gs://${b.name}/ has no lifecycle configuration.`;
  return JSON.stringify(
    {
      rule: b.lifecycle.map((r) => ({
        action: r.storageClass ? { type: r.action, storageClass: r.storageClass } : { type: r.action },
        condition: { age: r.age }
      }))
    },
    null,
    2
  );
}

/** `30d`, `1y`, `3600s` → seconds. */
export function parseRetention(v: string, fail: Fail): number {
  const m = /^(\d+)\s*(s|d|m|y)?$/.exec(v.trim());
  if (!m) fail(0, `Invalid retention period '${v}'. Use e.g. 30d, 6m, 1y or 3600s.`);
  const n = Number(m![1]);
  return n * ({ s: 1, d: 86400, m: 2592000, y: 31557600 } as Record<string, number>)[m![2] ?? 's'];
}

/** gsutil's short role names. */
const SHORT_ROLES: Record<string, string> = {
  objectviewer: 'roles/storage.objectViewer',
  objectcreator: 'roles/storage.objectCreator',
  objectadmin: 'roles/storage.objectAdmin',
  admin: 'roles/storage.admin',
  legacybucketreader: 'roles/storage.legacyBucketReader',
  legacyobjectreader: 'roles/storage.legacyObjectReader'
};

export function fullStorageRole(r: string): string {
  return r.startsWith('roles/') ? r : (SHORT_ROLES[r.toLowerCase()] ?? `roles/storage.${r}`);
}

export function grant(b: Bucket, member: string, role: string) {
  if (!b.iam.some((x) => x.member === member && x.role === role)) b.iam.push({ role, member });
}

export function revoke(b: Bucket, member: string): boolean {
  const before = b.iam.length;
  b.iam = b.iam.filter((x) => x.member !== member);
  return b.iam.length < before;
}

export function bucketPolicy(b: Bucket) {
  const out: { role: string; members: string[] }[] = [];
  for (const x of b.iam) addBinding(out, x.role, x.member);
  return out;
}

export { removeBinding };

export function describeBucket(b: Bucket, o: Out) {
  o.out(
    `gs://${b.name} :`,
    `\tStorage class:\t\t\t${b.storageClass}`,
    `\tLocation type:\t\t\t${MULTI_REGIONS.includes(b.location) ? 'multi-region' : 'region'}`,
    `\tLocation constraint:\t\t${b.location}`,
    `\tVersioning enabled:\t\t${b.versioning ? 'True' : 'None'}`,
    `\tRetention Policy:\t\t${b.retentionSeconds ? `Duration: ${b.retentionSeconds / 86400} Day(s)` : 'None'}`,
    `\tLifecycle configuration:\t${b.lifecycle.length ? b.lifecycle.map((r) => `${r.action}${r.storageClass ? ` → ${r.storageClass}` : ''} @ age ${r.age}d`).join('; ') : 'None'}`,
    `\tBucket Policy Only enabled:\t${b.uniformAccess ? 'True' : 'False'}`,
    `\tObjects:\t\t\t${Object.keys(b.objects).length}`
  );
}
