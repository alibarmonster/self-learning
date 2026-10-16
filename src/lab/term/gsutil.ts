/** `gsutil`: the classic Cloud Storage CLI, still all over the ACE exam. */
import { needProject, printPolicy } from './common';
import type { Ctx } from './shell';
import {
  bucketPolicy,
  copy,
  createBucket,
  describeBucket,
  failer,
  fullStorageRole,
  grant,
  lifecycleJson,
  listUrl,
  matchObjects,
  needBucket,
  normClass,
  parseRetention,
  readLifecycle,
  remove,
  removeBucket,
  revoke,
  splitUrl
} from './storage';

export const GSUTIL_COMMANDS = [
  'mb',
  'rb',
  'ls',
  'cp',
  'mv',
  'rm',
  'du',
  'cat',
  'versioning set',
  'versioning get',
  'lifecycle set',
  'lifecycle get',
  'iam ch',
  'iam get',
  'acl ch',
  'defstorageclass set',
  'defstorageclass get',
  'rewrite',
  'retention set',
  'uniformbucketlevelaccess set',
  'ubla set'
];

export function gsutil({ s, o, words }: Ctx) {
  const [cmd, ...rest] = words;
  // The single-letter flags that take a value depend on the command.
  const valueFlags = new Set(cmd === 'mb' ? ['l', 'c', 'p', 'b'] : cmd === 'rewrite' ? ['s'] : []);
  const fail = failer('gsutil', `gsutil ${cmd ?? ''}`);
  if (!cmd || cmd === 'help' || cmd === '--help') {
    o.out('Usage: gsutil [-m] COMMAND [options] args', '', 'Commands: ' + GSUTIL_COMMANDS.join(', '));
    return;
  }

  // gsutil flags are single letters; -l/-c/-b/-p/-s take a value.
  const args: string[] = [];
  const f: Record<string, string | true> = {};
  for (let i = 0; i < rest.length; i++) {
    const w = rest[i];
    if (/^-[A-Za-z]$/.test(w)) {
      const k = w.slice(1);
      const next = rest[i + 1];
      if (valueFlags.has(k) && next !== undefined && !next.startsWith('-') && !(k === 'b' && next.startsWith('gs://'))) {
        f[k] = next;
        i++;
      } else f[k] = true;
    } else args.push(w);
  }
  const recursive = !!(f.r || f.R);
  const p = () => needProject(s, `(gsutil)`, typeof f.p === 'string' ? f.p : undefined);

  switch (cmd) {
    case 'mb': {
      if (!args.length) fail(0, 'The mb command requires at least 1 argument.');
      for (const url of args) {
        const b = createBucket(s, p(), url, { location: f.l as string | undefined, storageClass: f.c as string | undefined, uniform: f.b === 'on' }, fail);
        o.out(`Creating gs://${b.name}/...`);
        if (!f.l) o.info('Petunjuk: tanpa -l, bucket dibuat di multi-region US. Pakai -l asia-southeast2 untuk data di Jakarta.');
      }
      return;
    }
    case 'rb':
      for (const url of args) removeBucket(s, url, o, fail);
      return;
    case 'ls': {
      if (f.L && f.b) {
        for (const url of args) describeBucket(needBucket(s, url, fail), o);
        return;
      }
      if (!args.length) return listUrl(s, p(), undefined, false, o, fail);
      for (const url of args) listUrl(s, p(), url, !!(f.l || f.L), o, fail);
      return;
    }
    case 'cp':
    case 'mv': {
      if (args.length < 2) fail(0, `Wrong number of arguments for "${cmd}" command.`);
      p();
      copy(s, args.slice(0, -1), args.at(-1)!, { recursive, move: cmd === 'mv' }, o, fail);
      return;
    }
    case 'rm':
      if (!args.length) fail(0, 'The rm command requires at least 1 argument.');
      remove(s, args, recursive || args.some((a) => a.endsWith('**')), o, fail);
      // gsutil rm -r gs://bucket also removes the bucket itself.
      for (const url of args) if (recursive && splitUrl(url) && !splitUrl(url)!.path) removeBucket(s, url, o, fail);
      return;
    case 'du': {
      for (const url of args) {
        const b = needBucket(s, url, fail);
        const names = matchObjects(b, splitUrl(url)!.path, true);
        const total = names.reduce((n, k) => n + b.objects[k].size, 0);
        if (f.s) o.out(`${total}  gs://${b.name}`);
        else for (const n of names) o.out(`${b.objects[n].size}  gs://${b.name}/${n}`);
      }
      return;
    }
    case 'cat': {
      for (const url of args) {
        const b = needBucket(s, url, fail);
        const path = splitUrl(url)!.path;
        if (!b.objects[path]) fail(404, `${url} does not exist.`);
        o.out(`(isi ${path}: ${b.objects[path].size} byte)`);
      }
      return;
    }
    case 'versioning': {
      const [sub, val, url] = args;
      if (sub === 'set' && (val === 'on' || val === 'off') && url) {
        const b = needBucket(s, url, fail);
        b.versioning = val === 'on';
        o.out(`${val === 'on' ? 'Enabling' : 'Suspending'} versioning for gs://${b.name}/...`);
        return;
      }
      if (sub === 'get' && val) {
        const b = needBucket(s, val, fail);
        o.out(`gs://${b.name}: ${b.versioning ? 'Enabled' : 'Suspended'}`);
        return;
      }
      fail(0, 'Usage: gsutil versioning set (on|off) gs://BUCKET  |  gsutil versioning get gs://BUCKET');
      return;
    }
    case 'lifecycle': {
      const [sub, a, b2] = args;
      if (sub === 'set' && a && b2) {
        const b = needBucket(s, b2, fail);
        b.lifecycle = readLifecycle(s, a, fail);
        o.out(`Setting lifecycle configuration on gs://${b.name}/...`);
        return;
      }
      if (sub === 'get' && a) {
        o.out(lifecycleJson(needBucket(s, a, fail)));
        return;
      }
      fail(0, 'Usage: gsutil lifecycle set CONFIG_FILE gs://BUCKET  |  gsutil lifecycle get gs://BUCKET');
      return;
    }
    case 'iam': {
      const [sub, ...more] = args;
      if (sub === 'get') {
        printPolicy(o, bucketPolicy(needBucket(s, more[0] ?? '', fail)), 'CAE=');
        return;
      }
      if (sub === 'ch') {
        const urls = more.filter((x) => x.startsWith('gs://'));
        const specs = more.filter((x) => !x.startsWith('gs://'));
        if (typeof f.d === 'string') specs.push(`-d:${f.d}`);
        if (!urls.length || !specs.length) fail(0, 'Usage: gsutil iam ch MEMBER:ROLE gs://BUCKET  (contoh: user:ana@example.com:objectViewer)');
        for (const url of urls) {
          const b = needBucket(s, url, fail);
          for (const spec of specs) {
            if (f.d === true) {
              revoke(b, spec);
              continue;
            }
            const cut = spec.lastIndexOf(':');
            const member = spec.slice(0, cut);
            const role = spec.slice(cut + 1);
            if (cut < 0 || !member || !role) fail(0, `Invalid member:role pair '${spec}'.`);
            const m = member === 'allUsers' || member === 'allAuthenticatedUsers' ? member : member.replace(/^(user|serviceAccount|group|domain|projectViewer|projectEditor|projectOwner):/, (x) => x);
            if (!/^(allUsers|allAuthenticatedUsers|(user|serviceAccount|group|domain|projectViewer|projectEditor|projectOwner):.+)$/.test(m))
              fail(0, `Incorrect member type for binding ${spec}.`, 'Awali member dengan user:, serviceAccount:, group:, domain:, atau pakai allUsers.');
            grant(b, m, fullStorageRole(role));
          }
        }
        return;
      }
      fail(0, 'Usage: gsutil iam (get|ch) ...');
      return;
    }
    case 'acl': {
      const url = args.find((x) => x.startsWith('gs://'));
      const b = needBucket(s, url ?? '', fail);
      if (b.uniformAccess)
        fail(400, `Cannot get/set ACLs on gs://${b.name} because uniform bucket-level access is enabled.`, 'Bucket dengan uniform bucket-level access hanya memakai IAM. Pakai gsutil iam ch.');
      if (f.u === true || typeof f.u === 'string') grant(b, 'allUsers', 'roles/storage.legacyObjectReader');
      o.out(`Updated ACL on gs://${b.name}`);
      return;
    }
    case 'defstorageclass': {
      const [sub, a, b2] = args;
      if (sub === 'set' && a && b2) {
        const b = needBucket(s, b2, fail);
        b.storageClass = normClass(a, fail)!;
        o.out(`Setting default storage class to "${b.storageClass}" for bucket gs://${b.name}`);
        return;
      }
      if (sub === 'get' && a) {
        o.out(`gs://${needBucket(s, a, fail).name}: ${needBucket(s, a, fail).storageClass}`);
        return;
      }
      fail(0, 'Usage: gsutil defstorageclass set CLASS gs://BUCKET');
      return;
    }
    case 'rewrite': {
      const cls = normClass(typeof f.s === 'string' ? f.s : undefined, fail);
      if (!cls) fail(0, 'rewrite needs -s STORAGE_CLASS.');
      for (const url of args) {
        const b = needBucket(s, url, fail);
        const names = matchObjects(b, splitUrl(url)!.path, recursive);
        if (!names.length) fail(0, `No URLs matched: ${url}`);
        for (const n of names) {
          b.objects[n].storageClass = cls!;
          o.out(`Rewriting gs://${b.name}/${n}...`);
        }
      }
      return;
    }
    case 'retention': {
      const [sub, period, url] = args;
      if (sub !== 'set' || !period || !url) fail(0, 'Usage: gsutil retention set PERIOD gs://BUCKET');
      const b = needBucket(s, url, fail);
      b.retentionSeconds = parseRetention(period, fail);
      o.out(`Setting Retention Policy on gs://${b.name}/...`);
      return;
    }
    case 'uniformbucketlevelaccess':
    case 'ubla': {
      const [sub, val, url] = args;
      if (sub !== 'set' || (val !== 'on' && val !== 'off') || !url) fail(0, `Usage: gsutil ${cmd} set (on|off) gs://BUCKET`);
      const b = needBucket(s, url, fail);
      b.uniformAccess = val === 'on';
      o.out(`${val === 'on' ? 'Enabling' : 'Disabling'} Uniform bucket-level access for gs://${b.name}...`);
      return;
    }
    default:
      fail(0, `Invalid command "${cmd}".`, `Perintah gsutil yang tersedia di lab: ${GSUTIL_COMMANDS.map((c) => c.split(' ')[0]).filter((c, i, a) => a.indexOf(c) === i).join(', ')}.`);
  }
}
