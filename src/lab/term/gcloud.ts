/**
 * `gcloud`: the commands the ACE exam expects you to know, acting on the fake
 * project in `state.ts`. Each handler validates the way gcloud does — missing
 * project, disabled API, wrong region, overlapping range — and prints output
 * shaped like the real thing, so muscle memory transfers.
 */
import { isValidCidr, nextHost, normaliseCidr, overlaps } from '../net/ip';
import { parseRules } from '../net/model';
import { probe } from '../net/engine';
import {
  BILLED_APIS,
  CliError,
  addBinding,
  confirm,
  gcloudTag,
  isZone,
  machineType,
  needApi,
  needMember,
  needProject,
  needRole,
  nextExternalIp,
  parseGb,
  parseLabels,
  printPolicy,
  region as needRegion,
  removeBinding,
  selfLink,
  suffix,
  zone as needZone
} from './common';
import { bool, flag, list, parseArgs, route, type Args, type Ctx } from './shell';
import {
  AUTO_RANGES,
  REGIONS,
  addDefaultNetwork,
  config,
  emptyKube,
  newProject,
  project as findProject,
  type CloudState,
  type FirewallRes,
  type Instance,
  type Project,
  type RunService
} from './state';
import {
  bucketPolicy,
  copy,
  createBucket,
  describeBucket,
  failer,
  fullStorageRole,
  grant,
  listUrl,
  matchObjects,
  needBucket,
  normClass,
  parseRetention,
  readLifecycle,
  remove,
  removeBucket,
  splitUrl
} from './storage';
import { toTopology } from './topology';
import type { Out } from './shell';

const BOOLEANS = new Set([
  'no-address',
  'enable-private-ip-google-access',
  'no-enable-private-ip-google-access',
  'preemptible',
  'spot',
  'allow-unauthenticated',
  'no-allow-unauthenticated',
  'enable-autoscaling',
  'no-enable-autoscaling',
  'auto-allocate-nat-external-ips',
  'nat-all-subnet-ip-ranges',
  'export-custom-routes',
  'import-custom-routes',
  'uniform-bucket-level-access',
  'versioning',
  'no-versioning',
  'recursive',
  'r',
  'quiet',
  'q',
  'enabled',
  'available',
  'async',
  'disabled',
  'no-disabled',
  'shielded-secure-boot',
  'enable-ip-alias',
  'trigger-http',
  'gen2',
  'global',
  'tunnel-through-iap',
  'internal-ip',
  'long',
  'l',
  'help',
  'h',
  'enable-autorepair',
  'enable-autoupgrade',
  'clear-labels',
  'all'
]);

interface C {
  s: CloudState;
  o: Out;
  a: Args;
  /** The positionals after the command path, e.g. the instance names. */
  pos: string[];
  key: string;
  tag: string;
}

type Handler = (c: C) => void;

const err = (c: C, msg: string, hint?: string): never => {
  throw new CliError(`ERROR: ${c.tag} ${msg}`, hint);
};

const proj = (c: C) => needProject(c.s, c.tag, flag(c.a, 'project'));

function computeProject(c: C): Project {
  const p = proj(c);
  needApi(p, 'compute.googleapis.com', c.tag);
  return p;
}

function needName(c: C, what = 'NAME'): string {
  const n = c.pos[0];
  if (!n) err(c, `argument ${what}: Must be specified.`);
  if (!/^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/.test(n))
    err(c, `Invalid value for [${what.toLowerCase()}]: '${n}'. Names must start with a lowercase letter and contain only lowercase letters, digits and hyphens.`, 'Nama resource Compute: huruf kecil, angka dan tanda hubung, diawali huruf.');
  return n;
}

function created(c: C, path: string) {
  c.o.out(`Created [${selfLink(proj(c), path)}].`);
}

function instance(c: C, p: Project, name: string): Instance {
  const z = flag(c.a, 'zone') ?? config(c.s).zone;
  const hits = p.instances.filter((i) => i.name === name && (!z || i.zone === z));
  if (!hits.length) err(c, `HTTPError 404: The resource 'projects/${p.id}/zones/${z ?? '-'}/instances/${name}' was not found`, 'Cek nama dan zone dengan gcloud compute instances list.');
  return hits[0];
}

function instanceRow(i: Instance) {
  return [i.name, i.zone, i.machineType, i.spot ? 'true' : '', i.internalIp, i.externalIp ?? '', i.status];
}

const INSTANCE_HEAD = ['name', 'zone', 'machine_type', 'preemptible', 'internal_ip', 'external_ip', 'status'];

function firewallRow(r: FirewallRes) {
  return [r.name, r.network, r.direction, r.priority, r.action === 'ALLOW' ? r.rules : '', r.action === 'DENY' ? r.rules : '', r.disabled ? 'True' : 'False'];
}

/** `gcloud services enable` and friends. */
function enable(c: C, p: Project, apis: string[]) {
  if (!apis.length) err(c, 'argument SERVICE: Must be specified.');
  for (const api of apis) {
    if (!/\.googleapis\.com$/.test(api)) err(c, `INVALID_ARGUMENT: Invalid service name '${api}'.`, 'Nama service lengkap, misalnya compute.googleapis.com.');
    if (BILLED_APIS.has(api) && !p.billing)
      err(
        c,
        `FAILED_PRECONDITION: Billing account for project '${p.number}' is not found. Billing must be enabled for activation of service(s) '${api}' to proceed.`,
        'Project belum terhubung ke billing account. Lihat gcloud billing accounts list lalu gcloud billing projects link.'
      );
  }
  c.o.out(`Operation "operations/acf.p2-${p.number}-${suffix(c.s, 8)}" finished successfully.`);
  for (const api of apis) {
    if (!p.services.includes(api)) p.services.push(api);
    if (api === 'compute.googleapis.com') addDefaultNetwork(p);
  }
}

// ── handlers ─────────────────────────────────────────────────────────────

const H: Record<string, Handler> = {
  // config
  'config set'(c) {
    const [prop, value] = c.pos;
    if (!prop || value === undefined) err(c, 'argument PROPERTY VALUE: Must be specified.');
    const cfg = c.s.configurations[c.s.activeConfig];
    const key = prop.replace(/^core\//, '');
    if (key === 'project') {
      cfg.project = value;
      if (!findProject(c.s, value)) c.o.warn(`WARNING: You do not appear to have access to project [${value}] or it does not exist.`);
    } else if (key === 'compute/region') {
      if (!REGIONS.includes(value)) err(c, `Invalid value for [compute/region]: '${value}' is not a valid region.`);
      cfg.region = value;
    } else if (key === 'compute/zone') {
      if (!isZone(value)) err(c, `Invalid value for [compute/zone]: '${value}' is not a valid zone.`, 'Zone = region + huruf, misalnya asia-southeast2-a.');
      cfg.zone = value;
    } else if (key === 'account') cfg.account = value;
    else if (key === 'run/region') cfg.region = cfg.region ?? value;
    else err(c, `Section [${key.split('/')[0]}] has no property [${key.split('/')[1] ?? key}].`);
    c.o.info(`Updated property [${key.includes('/') ? key : `core/${key}`}].`);
  },
  'config unset'(c) {
    const cfg = c.s.configurations[c.s.activeConfig];
    const key = (c.pos[0] ?? '').replace(/^core\//, '');
    if (key === 'project') delete cfg.project;
    else if (key === 'compute/region') delete cfg.region;
    else if (key === 'compute/zone') delete cfg.zone;
    else err(c, `Unknown property [${key}].`);
    c.o.info(`Unset property [${key}].`);
  },
  'config get-value'(c) {
    const cfg = config(c.s);
    const key = (c.pos[0] ?? '').replace(/^core\//, '');
    const v = { project: cfg.project, account: cfg.account ?? c.s.account, 'compute/region': cfg.region, 'compute/zone': cfg.zone }[key];
    if (v) c.o.out(v);
    else c.o.info('(unset)');
  },
  'config list'(c) {
    const cfg = config(c.s);
    c.o.out('[compute]');
    if (cfg.region) c.o.out(`region = ${cfg.region}`);
    if (cfg.zone) c.o.out(`zone = ${cfg.zone}`);
    c.o.out('[core]', `account = ${cfg.account ?? c.s.account}`, 'disable_usage_reporting = True');
    if (cfg.project) c.o.out(`project = ${cfg.project}`);
    c.o.out('', `Your active configuration is: [${c.s.activeConfig}]`);
  },
  'config configurations create'(c) {
    const n = c.pos[0];
    if (!n) err(c, 'argument NAME: Must be specified.');
    if (c.s.configurations[n]) err(c, `Cannot create configuration [${n}], it already exists.`);
    c.s.configurations[n] = { account: c.s.account };
    c.s.activeConfig = n;
    c.o.info(`Created [${n}].\nActivated [${n}].`);
  },
  'config configurations activate'(c) {
    const n = c.pos[0];
    if (!c.s.configurations[n]) err(c, `Cannot activate configuration [${n}], it does not exist.`);
    c.s.activeConfig = n;
    c.o.info(`Activated [${n}].`);
  },
  'config configurations list'(c) {
    c.o.table(
      ['name', 'is_active', 'account', 'project', 'compute_default_zone', 'compute_default_region'],
      Object.entries(c.s.configurations).map(([n, cfg]) => [n, n === c.s.activeConfig ? 'True' : 'False', cfg.account ?? c.s.account, cfg.project, cfg.zone, cfg.region])
    );
  },
  'auth list'(c) {
    c.o.out('       Credentialed Accounts', 'ACTIVE  ACCOUNT', `*       ${c.s.account}`, '', 'To set the active account, run:', '    $ gcloud config set account `ACCOUNT`');
  },
  'auth login'(c) {
    c.o.info(`Lab: kamu sudah login sebagai ${c.s.account} (Cloud Shell otomatis memakai akun console).`);
  },
  init(c) {
    c.o.info('Lab: gcloud init interaktif tidak disimulasikan. Pakai gcloud config set project …, compute/region …, compute/zone ….');
  },

  // projects & billing
  'projects list'(c) {
    c.o.table(['project_id', 'name', 'project_number'], c.s.projects.map((p) => [p.id, p.name, p.number]));
  },
  'projects create'(c) {
    const id = c.pos[0];
    if (!id) err(c, 'argument PROJECT_ID: Must be specified.');
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id))
      err(c, `Invalid value for [PROJECT_ID]: Project IDs must be 6 to 30 lowercase letters, digits, or hyphens, start with a letter and not end with a hyphen.`);
    if (c.s.projects.some((p) => p.id === id)) err(c, `HTTPError 409: Requested entity already exists`, 'Project ID unik secara global dan tidak bisa dipakai ulang.');
    const p = newProject(id, { billing: false });
    p.name = flag(c.a, 'name') ?? id;
    c.s.projects.push(p);
    c.o.out(`Create in progress for [https://cloudresourcemanager.googleapis.com/v1/projects/${id}].`, `Waiting for [operations/cp.${suffix(c.s, 10)}] to finish...done.`);
    c.o.info('Petunjuk: project baru belum punya billing account dan belum jadi project aktif.');
  },
  'projects describe'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `HTTPError 403: The caller does not have permission`);
    c.o.out(`createTime: '2026-10-01T08:00:00.000Z'`, 'lifecycleState: ACTIVE', `name: ${p!.name}`, `projectId: ${p!.id}`, `projectNumber: '${p!.number}'`);
  },
  'projects delete'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `HTTPError 403: The caller does not have permission`);
    confirm(c.o, `Your project will be deleted.`);
    c.s.projects = c.s.projects.filter((x) => x !== p);
    c.o.out(`Deleted [https://cloudresourcemanager.googleapis.com/v1/projects/${p!.id}].`, '', 'You can undo this operation for a limited period by running the command below.', `    $ gcloud projects undelete ${p!.id}`);
  },
  'projects add-iam-policy-binding'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!c.pos[0]) err(c, 'argument PROJECT_ID: Must be specified.');
    if (!p) err(c, `HTTPError 403: Project '${c.pos[0]}' not found or permission denied.`);
    const member = needMember(flag(c.a, 'member'), c.tag);
    const role = needRole(flag(c.a, 'role'), c.tag);
    if (member.startsWith('serviceAccount:') && !c.s.projects.some((x) => x.serviceAccounts.some((sa) => `serviceAccount:${sa.email}` === member)))
      err(c, `INVALID_ARGUMENT: Service account ${member.slice(15)} does not exist.`, 'Buat dulu service account-nya, dan pakai email lengkap NAME@PROJECT.iam.gserviceaccount.com.');
    if (role === 'roles/owner' && member.startsWith('serviceAccount:')) c.o.warn('WARNING: Granting roles/owner to a service account violates least privilege.');
    addBinding(p!.iam, role, member);
    c.o.info(`Updated IAM policy for project [${p!.id}].`);
    printPolicy(c.o, p!.iam);
  },
  'projects remove-iam-policy-binding'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `HTTPError 403: Project '${c.pos[0]}' not found or permission denied.`);
    const member = needMember(flag(c.a, 'member'), c.tag);
    const role = needRole(flag(c.a, 'role'), c.tag);
    if (!removeBinding(p!.iam, role, member)) err(c, `Policy binding with the specified principal, role, and condition not found!`);
    c.o.info(`Updated IAM policy for project [${p!.id}].`);
    printPolicy(c.o, p!.iam);
  },
  'projects get-iam-policy'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `HTTPError 403: Project '${c.pos[0]}' not found or permission denied.`);
    printPolicy(c.o, p!.iam);
  },
  'billing accounts list'(c) {
    c.o.table(['account_id', 'name', 'open', 'master_account_id'], [['0X0X0X-0X0X0X-0X0X0X', 'Akun Billing Utama', 'True', '']]);
  },
  'billing projects link'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `argument PROJECT_ID: project '${c.pos[0] ?? ''}' not found.`);
    const acct = flag(c.a, 'billing-account', 'account-id');
    if (acct !== '0X0X0X-0X0X0X-0X0X0X') err(c, `INVALID_ARGUMENT: Billing account '${acct ?? ''}' not found.`, 'Ambil ID dari gcloud billing accounts list.');
    p!.billing = true;
    c.o.out(`billingAccountName: billingAccounts/${acct}`, 'billingEnabled: true', `name: projects/${p!.id}/billingInfo`, `projectId: ${p!.id}`);
  },
  'billing projects describe'(c) {
    const p = findProject(c.s, c.pos[0]);
    if (!p) err(c, `project not found.`);
    c.o.out(`billingEnabled: ${p!.billing}`, `projectId: ${p!.id}`);
  },

  // services
  'services list'(c) {
    const p = proj(c);
    if (bool(c.a, 'available')) {
      c.o.table(['name', 'title'], Object.entries({ 'compute.googleapis.com': 'Compute Engine API', 'container.googleapis.com': 'Kubernetes Engine API', 'run.googleapis.com': 'Cloud Run Admin API', 'sqladmin.googleapis.com': 'Cloud SQL Admin API', 'pubsub.googleapis.com': 'Cloud Pub/Sub API', 'cloudfunctions.googleapis.com': 'Cloud Functions API' }));
      return;
    }
    c.o.table(['name', 'title'], p.services.map((x) => [x, '']));
  },
  'services enable'(c) {
    enable(c, proj(c), c.pos);
  },
  'services disable'(c) {
    const p = proj(c);
    for (const api of c.pos) p.services = p.services.filter((x) => x !== api);
    c.o.out(`Operation "operations/acat.p2-${p.number}-${suffix(c.s, 8)}" finished successfully.`);
  },

  // compute: instances
  'compute instances create'(c) {
    const p = computeProject(c);
    if (!c.pos.length) err(c, 'argument INSTANCE_NAMES: Must be specified.');
    const z = needZone(c.s, flag(c.a, 'zone'), c.tag);
    const r = z.slice(0, -2);
    const mt = machineType(flag(c.a, 'machine-type'), c.tag);
    const netName = flag(c.a, 'network') ?? 'default';
    const net = p.networks.find((n) => n.name === netName);
    if (!net) err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/global/networks/${netName}' was not found`, netName === 'default' ? 'Network default sudah dihapus. Pakai --network dan --subnet milikmu.' : 'Cek gcloud compute networks list.');
    const subName = flag(c.a, 'subnet') ?? (net!.mode === 'auto' ? netName : undefined);
    if (!subName) err(c, `Could not fetch resource:\n - Network '${netName}' is in custom subnet mode; specify --subnet.`, 'VPC custom tidak punya subnet otomatis — sebutkan --subnet di region yang sama dengan zone.');
    const sub = p.subnets.find((s) => s.network === netName && s.name === subName && s.region === r);
    if (!sub)
      err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/regions/${r}/subnetworks/${subName}' was not found`, `Subnet itu regional. Pastikan subnet ${subName} ada di region ${r} (zone ${z}).`);
    const sa = flag(c.a, 'service-account') ?? p.serviceAccounts.find((x) => x.name === 'compute')?.email ?? 'default';
    if (flag(c.a, 'service-account') && !c.s.projects.some((x) => x.serviceAccounts.some((y) => y.email === sa)))
      err(c, `Could not fetch resource:\n - The user does not have access to service account '${sa}'.`);
    const spot = bool(c.a, 'spot', 'preemptible') || flag(c.a, 'provisioning-model')?.toUpperCase() === 'SPOT';
    const rows: (string | number)[][] = [];
    for (const name of c.pos) {
      if (!/^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/.test(name)) err(c, `Invalid value for [instance name]: '${name}'.`);
      if (p.instances.some((i) => i.name === name && i.zone === z)) err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/zones/${z}/instances/${name}' already exists`);
      const taken = p.instances.filter((i) => i.network === netName && i.zone.startsWith(r)).map((i) => i.internalIp);
      const inst: Instance = {
        name,
        zone: z,
        machineType: mt,
        status: 'RUNNING',
        internalIp: nextHost(sub!.range, taken) ?? '0.0.0.0',
        externalIp: bool(c.a, 'no-address') ? null : nextExternalIp(c.s),
        network: netName,
        subnet: sub!.name,
        tags: list(flag(c.a, 'tags')),
        serviceAccount: sa,
        scopes: list(flag(c.a, 'scopes')).length ? list(flag(c.a, 'scopes')) : ['default'],
        labels: parseLabels(flag(c.a, 'labels')),
        spot,
        image: flag(c.a, 'image-family', 'image') ?? 'debian-12',
        bootDiskGb: parseGb(flag(c.a, 'boot-disk-size'), 10),
        startupScript: /startup-script/.test(flag(c.a, 'metadata', 'metadata-from-file', 'metadata-file') ?? '')
      };
      p.instances.push(inst);
      p.disks.push({ name, zone: z, sizeGb: inst.bootDiskGb, type: flag(c.a, 'boot-disk-type') ?? 'pd-balanced' });
      created(c, `zones/${z}/instances/${name}`);
      rows.push(instanceRow(inst));
    }
    c.o.table(INSTANCE_HEAD, rows);
  },
  'compute instances list'(c) {
    const p = computeProject(c);
    const z = flag(c.a, 'zones');
    c.o.table(INSTANCE_HEAD, p.instances.filter((i) => !z || z.split(',').includes(i.zone)).map(instanceRow));
  },
  'compute instances describe'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    c.o.out(
      `machineType: ${selfLink(p, `zones/${i.zone}/machineTypes/${i.machineType}`)}`,
      `name: ${i.name}`,
      'networkInterfaces:',
      ...(i.externalIp ? ['- accessConfigs:', `  - name: External NAT`, `    natIP: ${i.externalIp}`] : ['- accessConfigs: []']),
      `  network: ${selfLink(p, `global/networks/${i.network}`)}`,
      `  networkIP: ${i.internalIp}`,
      `scheduling:`,
      `  provisioningModel: ${i.spot ? 'SPOT' : 'STANDARD'}`,
      'serviceAccounts:',
      `- email: ${i.serviceAccount}`,
      '  scopes:',
      ...i.scopes.map((s) => `  - ${s}`),
      `status: ${i.status}`,
      'tags:',
      `  items: [${i.tags.join(', ')}]`,
      `labels: {${Object.entries(i.labels).map(([k, v]) => `${k}: ${v}`).join(', ')}}`,
      `zone: ${selfLink(p, `zones/${i.zone}`)}`
    );
  },
  'compute instances stop'(c) {
    const p = computeProject(c);
    for (const n of c.pos) {
      const i = instance(c, p, n);
      i.status = 'TERMINATED';
      c.o.info(`Stopping instance(s) ${n}...done.`);
      c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${n}`)}].`);
    }
  },
  'compute instances start'(c) {
    const p = computeProject(c);
    for (const n of c.pos) {
      const i = instance(c, p, n);
      i.status = 'RUNNING';
      c.o.info(`Starting instance(s) ${n}...done.`);
      c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${n}`)}].`);
    }
  },
  'compute instances delete'(c) {
    const p = computeProject(c);
    if (!c.pos.length) err(c, 'argument INSTANCE_NAMES: Must be specified.');
    const doomed = c.pos.map((n) => instance(c, p, n));
    confirm(c.o, `The following instances will be deleted. Any attached disks configured to be auto-deleted will be deleted unless they are attached to any other instances or the \`--keep-disks\` flag is given and specifies them for keeping. Deleting a disk is irreversible and any data on the disk will be lost.\n - [${doomed.map((i) => i.name).join(', ')}]`);
    for (const i of doomed) {
      p.instances = p.instances.filter((x) => x !== i);
      p.disks = p.disks.filter((d) => !(d.name === i.name && d.zone === i.zone));
      c.o.out(`Deleted [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
    }
  },
  'compute instances add-tags'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    const tags = list(flag(c.a, 'tags'));
    if (!tags.length) err(c, 'argument --tags: Must be specified.');
    for (const t of tags) if (!i.tags.includes(t)) i.tags.push(t);
    c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
  },
  'compute instances remove-tags'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    const tags = list(flag(c.a, 'tags'));
    i.tags = i.tags.filter((t) => !tags.includes(t));
    c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
  },
  'compute instances add-labels'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    Object.assign(i.labels, parseLabels(flag(c.a, 'labels')));
    c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
  },
  'compute instances set-machine-type'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    const mt = machineType(flag(c.a, 'machine-type'), c.tag);
    if (i.status === 'RUNNING')
      err(c, `Could not fetch resource:\n - The resource '${i.name}' is not ready: Instance is running. Stop the instance before changing the machine type.`, 'Ganti machine type hanya bisa saat VM berhenti: instances stop → set-machine-type → instances start.');
    i.machineType = mt;
    c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
  },
  'compute instances set-service-account'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE_NAME'));
    if (i.status === 'RUNNING') err(c, `The instance must be stopped before its service account can be changed.`, 'Stop VM dulu, ganti service account, lalu start lagi.');
    i.serviceAccount = flag(c.a, 'service-account') ?? i.serviceAccount;
    if (flag(c.a, 'scopes')) i.scopes = list(flag(c.a, 'scopes'));
    c.o.out(`Updated [${selfLink(p, `zones/${i.zone}/instances/${i.name}`)}].`);
  },
  'compute ssh'(c) {
    const p = computeProject(c);
    const i = instance(c, p, needName(c, 'INSTANCE'));
    if (i.status !== 'RUNNING') err(c, `Instance [${i.name}] in zone [${i.zone}] is not running.`, 'Start VM dulu.');
    const t = toTopology(p);
    const via = bool(c.a, 'tunnel-through-iap') || !i.externalIp ? 'iap' : 'internet';
    const r = probe(t, { from: { kind: via }, to: { kind: 'vm', id: `vm:${i.name}` }, proto: 'tcp', port: 22 });
    if (via === 'iap' && !bool(c.a, 'tunnel-through-iap')) c.o.info(`External IP address was not found; defaulting to using IAP tunneling.`);
    if (!r.ok) {
      const viaIap = via === 'internet' && probe(t, { from: { kind: 'iap' }, to: { kind: 'vm', id: `vm:${i.name}` }, proto: 'tcp', port: 22 }).ok;
      if (viaIap) {
        c.o.err(`ssh: connect to host ${i.externalIp} port 22: Connection timed out`);
        throw new CliError(`ERROR: ${c.tag} [/usr/bin/ssh] exited with return code [255].`, 'Port 22 hanya dibuka untuk IAP (35.235.240.0/20). Tambahkan --tunnel-through-iap.');
      }
      c.o.err(via === 'iap' ? `ERROR: (gcloud.compute.start-iap-tunnel) Error while connecting [4003: 'failed to connect to backend'].` : `ssh: connect to host ${i.externalIp} port 22: Connection timed out`);
      throw new CliError(`ERROR: ${c.tag} [/usr/bin/ssh] exited with return code [255].`, `${r.summary} ${r.hops.find((h) => !h.ok)?.detail ?? ''}`.trim());
    }
    c.o.out(`Linux ${i.name} 6.1.0-26-cloud-amd64 #1 SMP Debian x86_64`, '', `student@${i.name}:~$ exit`, 'logout', `Connection to ${via === 'iap' ? 'compute.' + i.name : i.externalIp} closed.`);
    c.s.events.push(`ssh:${i.name}:${via}`);
  },
  'compute zones list'(c) {
    computeProject(c);
    c.o.table(['name', 'region', 'status'], REGIONS.flatMap((r) => ['a', 'b', 'c'].map((z) => [`${r}-${z}`, r, 'UP'])));
  },
  'compute regions list'(c) {
    computeProject(c);
    c.o.table(['name', 'cpus', 'disks_gb', 'addresses', 'reserved_addresses'], REGIONS.map((r) => [r, '0/24', '0/4096', '0/8', '0/8']));
  },

  // compute: networking
  'compute networks create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    if (p.networks.some((x) => x.name === n)) err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/global/networks/${n}' already exists`);
    const mode = (flag(c.a, 'subnet-mode') ?? 'auto').toLowerCase();
    if (mode !== 'auto' && mode !== 'custom') err(c, `argument --subnet-mode: Invalid choice: '${mode}'. Valid choices are [auto, custom, legacy].`);
    const routing = (flag(c.a, 'bgp-routing-mode') ?? 'regional').toUpperCase();
    p.networks.push({ name: n, mode: mode as 'auto' | 'custom', routingMode: routing === 'GLOBAL' ? 'GLOBAL' : 'REGIONAL' });
    if (mode === 'auto') for (const [r, range] of Object.entries(AUTO_RANGES)) p.subnets.push({ name: n, network: n, region: r, range, pga: false });
    created(c, `global/networks/${n}`);
    c.o.table(['name', 'subnet_mode', 'bgp_routing_mode', 'ipv4_range', 'gateway_ipv4'], [[n, mode.toUpperCase(), routing, '', '']]);
    c.o.info(`\nInstances on this network will not be reachable until firewall rules\nare created. As an example, you can allow all internal traffic between\ninstances as well as SSH, RDP, and ICMP by running:\n\n$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${n} --allow tcp,udp,icmp --source-ranges <IP_RANGE>\n$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${n} --allow tcp:22,tcp:3389,icmp`);
  },
  'compute networks list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'subnet_mode', 'bgp_routing_mode', 'ipv4_range', 'gateway_ipv4'], p.networks.map((n) => [n.name, n.mode.toUpperCase(), n.routingMode, '', '']));
  },
  'compute networks update'(c) {
    const p = computeProject(c);
    const n = p.networks.find((x) => x.name === c.pos[0]);
    if (!n) err(c, `The resource 'projects/${p.id}/global/networks/${c.pos[0] ?? ''}' was not found`);
    const mode = flag(c.a, 'bgp-routing-mode');
    if (mode) n!.routingMode = mode.toUpperCase() === 'GLOBAL' ? 'GLOBAL' : 'REGIONAL';
    if (flag(c.a, 'switch-to-custom-subnet-mode') !== undefined || bool(c.a, 'switch-to-custom-subnet-mode')) n!.mode = 'custom';
    c.o.out(`Updated [${selfLink(p, `global/networks/${n!.name}`)}].`);
  },
  'compute networks delete'(c) {
    const p = computeProject(c);
    for (const name of c.pos) {
      if (!p.networks.some((n) => n.name === name)) err(c, `The resource 'projects/${p.id}/global/networks/${name}' was not found`);
      const users = p.instances.filter((i) => i.network === name);
      if (users.length) err(c, `Could not fetch resource:\n - The network resource 'projects/${p.id}/global/networks/${name}' is already being used by 'projects/${p.id}/zones/${users[0].zone}/instances/${users[0].name}'`);
      const rules = p.firewalls.filter((f) => f.network === name);
      if (rules.length) err(c, `Could not fetch resource:\n - The network resource '${name}' is already being used by firewall '${rules[0].name}'`, 'Hapus firewall rule dan subnet di network itu dulu.');
      confirm(c.o, `The following networks will be deleted:\n - [${name}]`);
      p.networks = p.networks.filter((n) => n.name !== name);
      p.subnets = p.subnets.filter((s) => s.network !== name);
      c.o.out(`Deleted [${selfLink(p, `global/networks/${name}`)}].`);
    }
  },
  'compute networks subnets create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    const netName = flag(c.a, 'network');
    if (!netName) err(c, 'argument --network: Must be specified.');
    const net = p.networks.find((x) => x.name === netName);
    if (!net) err(c, `The resource 'projects/${p.id}/global/networks/${netName}' was not found`);
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    const range = flag(c.a, 'range');
    if (!range) err(c, 'argument --range: Must be specified.');
    if (!isValidCidr(range!) || !range!.includes('/')) err(c, `argument --range: Invalid CIDR '${range}'.`);
    const norm = normaliseCidr(range!);
    const bits = Number(norm.split('/')[1]);
    if (bits > 29) err(c, `Invalid IPCidrRange: ${norm}. The prefix length must be 29 or shorter.`, 'Subnet IPv4 terkecil di VPC adalah /29.');
    if (p.subnets.some((s) => s.network === netName && s.region === r && s.name === n)) err(c, `The resource 'projects/${p.id}/regions/${r}/subnetworks/${n}' already exists`);
    const clash = p.subnets.find((s) => s.network === netName && overlaps(s.range, norm));
    if (clash)
      err(c, `Could not fetch resource:\n - Invalid IPCidrRange: ${norm} conflicts with existing subnetwork '${clash.name}' in region '${clash.region}'.`, 'Range subnet dalam satu VPC tidak boleh tumpang tindih — walau beda region.');
    p.subnets.push({ name: n, network: netName!, region: r, range: norm, pga: bool(c.a, 'enable-private-ip-google-access') });
    created(c, `regions/${r}/subnetworks/${n}`);
    c.o.table(['name', 'region', 'network', 'range', 'stack_type'], [[n, r, netName, norm, 'IPV4_ONLY']]);
  },
  'compute networks subnets list'(c) {
    const p = computeProject(c);
    const net = flag(c.a, 'network');
    c.o.table(['name', 'region', 'network', 'range'], p.subnets.filter((s) => !net || s.network === net).map((s) => [s.name, s.region, s.network, s.range]));
  },
  'compute networks subnets describe'(c) {
    const p = computeProject(c);
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    const sn = p.subnets.find((s) => s.name === c.pos[0] && s.region === r);
    if (!sn) err(c, `The resource 'projects/${p.id}/regions/${r}/subnetworks/${c.pos[0] ?? ''}' was not found`);
    c.o.out(`ipCidrRange: ${sn!.range}`, `name: ${sn!.name}`, `network: ${selfLink(p, `global/networks/${sn!.network}`)}`, `privateIpGoogleAccess: ${sn!.pga}`, `region: ${selfLink(p, `regions/${r}`)}`);
  },
  'compute networks subnets update'(c) {
    const p = computeProject(c);
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    const sn = p.subnets.find((s) => s.name === c.pos[0] && s.region === r);
    if (!sn) err(c, `The resource 'projects/${p.id}/regions/${r}/subnetworks/${c.pos[0] ?? ''}' was not found`, 'Subnet itu regional: sebutkan --region tempat subnet berada.');
    if (bool(c.a, 'enable-private-ip-google-access')) sn!.pga = true;
    if (bool(c.a, 'no-enable-private-ip-google-access')) sn!.pga = false;
    const expand = flag(c.a, 'range');
    if (expand) err(c, 'Use `gcloud compute networks subnets expand-ip-range --prefix-length` to grow a subnet.');
    c.o.out(`Updated [${selfLink(p, `regions/${r}/subnetworks/${sn!.name}`)}].`);
  },
  'compute networks subnets expand-ip-range'(c) {
    const p = computeProject(c);
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    const sn = p.subnets.find((s) => s.name === c.pos[0] && s.region === r);
    if (!sn) err(c, `The resource 'projects/${p.id}/regions/${r}/subnetworks/${c.pos[0] ?? ''}' was not found`);
    const len = Number(flag(c.a, 'prefix-length'));
    const cur = Number(sn!.range.split('/')[1]);
    if (!(len < cur)) err(c, `Invalid prefix length ${len}: a subnet can only be expanded (new prefix must be shorter than /${cur}).`, 'Subnet hanya bisa diperbesar (prefix lebih kecil), tidak bisa diperkecil.');
    const next = normaliseCidr(`${sn!.range.split('/')[0]}/${len}`);
    const clash = p.subnets.find((s) => s !== sn && s.network === sn!.network && overlaps(s.range, next));
    if (clash) err(c, `Invalid IPCidrRange: ${next} conflicts with existing subnetwork '${clash.name}'.`);
    confirm(c.o, `The IP range of subnetwork [${sn!.name}] will be expanded from ${sn!.range} to ${next}. This operation may take several minutes to complete and cannot be undone.`);
    sn!.range = next;
    c.o.out(`Updated [${selfLink(p, `regions/${r}/subnetworks/${sn!.name}`)}].`);
  },
  'compute networks peerings create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    const net = flag(c.a, 'network');
    const peer = flag(c.a, 'peer-network');
    if (!net || !peer) err(c, 'arguments --network and --peer-network: Must be specified.');
    if (!p.networks.some((x) => x.name === net)) err(c, `Network '${net}' not found.`);
    if (!p.networks.some((x) => x.name === peer)) err(c, `Network '${peer}' not found.`);
    const a = p.subnets.filter((s) => s.network === net);
    const b = p.subnets.filter((s) => s.network === peer);
    const clash = a.find((x) => b.some((y) => overlaps(x.range, y.range)));
    if (clash) err(c, `Could not fetch resource:\n - An IP range in the peer network overlaps with an IP range in the local network (${clash.range}).`, 'Peering menolak range yang tumpang tindih. Network auto-mode selalu bentrok satu sama lain.');
    p.peerings.push({ name: n, network: net!, peerNetwork: peer! });
    const back = p.peerings.some((x) => x.network === peer && x.peerNetwork === net);
    c.o.out(`Updated [${selfLink(p, `global/networks/${net}`)}].`);
    c.o.table(['name', 'network', 'peer_project', 'peer_network', 'state', 'state_details'], [[n, net, p.id, peer, back ? 'ACTIVE' : 'INACTIVE', back ? '[2026-10-16T09:41:07Z]: Connected.' : `[2026-10-16T09:41:07Z]: Waiting for peer network to connect.`]]);
  },
  'compute networks peerings list'(c) {
    const p = computeProject(c);
    c.o.table(
      ['name', 'network', 'peer_network', 'state'],
      p.peerings.map((x) => [x.name, x.network, x.peerNetwork, p.peerings.some((y) => y.network === x.peerNetwork && y.peerNetwork === x.network) ? 'ACTIVE' : 'INACTIVE'])
    );
  },
  'compute firewall-rules create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    if (p.firewalls.some((f) => f.name === n)) err(c, `The resource 'projects/${p.id}/global/firewalls/${n}' already exists`, 'Nama firewall rule unik per project (bukan per network).');
    const netName = flag(c.a, 'network') ?? 'default';
    if (!p.networks.some((x) => x.name === netName)) err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/global/networks/${netName}' was not found`);
    const allow = flag(c.a, 'allow');
    const rulesText = flag(c.a, 'rules');
    const actionFlag = flag(c.a, 'action')?.toUpperCase();
    if (allow && (rulesText || actionFlag)) err(c, 'argument --allow: At most one of --allow | --action --rules may be specified.');
    if (rulesText && !actionFlag) err(c, 'Exactly one of (--action | --allow) must be specified.', '--rules butuh --action=ALLOW atau --action=DENY.');
    if (!allow && !rulesText && actionFlag !== 'DENY') err(c, 'Exactly one of (--action | --allow) must be specified.');
    const spec = allow ?? rulesText ?? 'all';
    const parsed = parseRules(spec);
    if (!parsed) err(c, `Invalid value for [--rules]: '${spec}'. Use e.g. tcp:80,tcp:443,icmp.`);
    const direction = (flag(c.a, 'direction') ?? 'INGRESS').toUpperCase().replace(/^IN$/, 'INGRESS').replace(/^OUT$/, 'EGRESS');
    if (direction !== 'INGRESS' && direction !== 'EGRESS') err(c, `argument --direction: Invalid choice: '${direction}'.`);
    const priority = Number(flag(c.a, 'priority') ?? 1000);
    if (!Number.isInteger(priority) || priority < 0 || priority > 65535) err(c, `argument --priority: Value must be between 0 and 65535.`);
    const src = list(flag(c.a, 'source-ranges'));
    for (const r of [...src, ...list(flag(c.a, 'destination-ranges'))]) if (!isValidCidr(r)) err(c, `Invalid IP range '${r}'.`);
    if (direction === 'EGRESS' && (src.length || flag(c.a, 'source-tags'))) err(c, 'Source ranges and source tags are only valid for INGRESS rules.', 'Rule EGRESS memakai --destination-ranges.');
    if (flag(c.a, 'target-tags') && flag(c.a, 'target-service-accounts')) err(c, 'argument --target-tags: At most one of --target-service-accounts | --target-tags may be specified.', 'Tidak bisa mencampur target tag dan target service account dalam satu rule.');
    const rule: FirewallRes = {
      name: n,
      network: netName,
      direction: direction as FirewallRes['direction'],
      priority,
      action: allow ? 'ALLOW' : (actionFlag as 'ALLOW' | 'DENY'),
      rules: spec.toLowerCase(),
      sourceRanges: direction === 'INGRESS' && !src.length && !flag(c.a, 'source-tags') ? ['0.0.0.0/0'] : src,
      sourceTags: list(flag(c.a, 'source-tags')),
      targetTags: list(flag(c.a, 'target-tags')),
      targetServiceAccounts: list(flag(c.a, 'target-service-accounts')),
      destinationRanges: direction === 'EGRESS' ? (list(flag(c.a, 'destination-ranges')).length ? list(flag(c.a, 'destination-ranges')) : ['0.0.0.0/0']) : [],
      disabled: bool(c.a, 'disabled')
    };
    p.firewalls.push(rule);
    c.o.info(`Creating firewall...done.`);
    created(c, `global/firewalls/${n}`);
    c.o.table(['name', 'network', 'direction', 'priority', 'allow', 'deny', 'disabled'], [firewallRow(rule)]);
  },
  'compute firewall-rules list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'network', 'direction', 'priority', 'allow', 'deny', 'disabled'], p.firewalls.map(firewallRow));
    c.o.info('\nTo show all fields of the firewall, please show in JSON format: --format=json');
  },
  'compute firewall-rules describe'(c) {
    const p = computeProject(c);
    const r = p.firewalls.find((f) => f.name === c.pos[0]);
    if (!r) err(c, `The resource 'projects/${p.id}/global/firewalls/${c.pos[0] ?? ''}' was not found`);
    c.o.out(
      `${r!.action === 'ALLOW' ? 'allowed' : 'denied'}: ${r!.rules}`,
      `direction: ${r!.direction}`,
      `disabled: ${r!.disabled}`,
      `name: ${r!.name}`,
      `network: ${r!.network}`,
      `priority: ${r!.priority}`,
      ...(r!.sourceRanges.length ? [`sourceRanges: [${r!.sourceRanges.join(', ')}]`] : []),
      ...(r!.sourceTags.length ? [`sourceTags: [${r!.sourceTags.join(', ')}]`] : []),
      ...(r!.destinationRanges.length ? [`destinationRanges: [${r!.destinationRanges.join(', ')}]`] : []),
      ...(r!.targetTags.length ? [`targetTags: [${r!.targetTags.join(', ')}]`] : []),
      ...(r!.targetServiceAccounts.length ? [`targetServiceAccounts: [${r!.targetServiceAccounts.join(', ')}]`] : [])
    );
  },
  'compute firewall-rules update'(c) {
    const p = computeProject(c);
    const r = p.firewalls.find((f) => f.name === c.pos[0]);
    if (!r) err(c, `The resource 'projects/${p.id}/global/firewalls/${c.pos[0] ?? ''}' was not found`);
    if (bool(c.a, 'disabled')) r!.disabled = true;
    if (bool(c.a, 'no-disabled')) r!.disabled = false;
    if (flag(c.a, 'priority')) r!.priority = Number(flag(c.a, 'priority'));
    if (flag(c.a, 'source-ranges') !== undefined) r!.sourceRanges = list(flag(c.a, 'source-ranges'));
    if (flag(c.a, 'target-tags') !== undefined) r!.targetTags = list(flag(c.a, 'target-tags'));
    if (flag(c.a, 'rules', 'allow')) {
      if (!parseRules(flag(c.a, 'rules', 'allow')!)) err(c, 'Invalid value for [--rules].');
      r!.rules = flag(c.a, 'rules', 'allow')!.toLowerCase();
    }
    c.o.info(`Updating firewall...done.`);
    c.o.out(`Updated [${selfLink(p, `global/firewalls/${r!.name}`)}].`);
  },
  'compute firewall-rules delete'(c) {
    const p = computeProject(c);
    if (!c.pos.length) err(c, 'argument NAME: Must be specified.');
    for (const n of c.pos) if (!p.firewalls.some((f) => f.name === n)) err(c, `The resource 'projects/${p.id}/global/firewalls/${n}' was not found`);
    confirm(c.o, `The following firewalls will be deleted:\n - [${c.pos.join(', ')}]`);
    p.firewalls = p.firewalls.filter((f) => !c.pos.includes(f.name));
    for (const n of c.pos) c.o.out(`Deleted [${selfLink(p, `global/firewalls/${n}`)}].`);
  },
  'compute routers create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    const net = flag(c.a, 'network');
    if (!net) err(c, 'argument --network: Must be specified.');
    if (!p.networks.some((x) => x.name === net)) err(c, `Network '${net}' not found.`);
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    if (p.routers.some((x) => x.name === n && x.region === r)) err(c, `The resource 'projects/${p.id}/regions/${r}/routers/${n}' already exists`);
    p.routers.push({ name: n, network: net!, region: r });
    c.o.info(`Creating router [${n}]...done.`);
    c.o.table(['name', 'region', 'network'], [[n, r, net]]);
  },
  'compute routers list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'region', 'network'], p.routers.map((r) => [r.name, r.region, r.network]));
  },
  'compute routers nats create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    const routerName = flag(c.a, 'router');
    if (!routerName) err(c, 'argument --router: Must be specified.', 'Cloud NAT dipasang pada Cloud Router: buat router dulu (gcloud compute routers create).');
    const r = needRegion(c.s, flag(c.a, 'region', 'router-region'), c.tag);
    const router = p.routers.find((x) => x.name === routerName && x.region === r);
    if (!router) err(c, `The resource 'projects/${p.id}/regions/${r}/routers/${routerName}' was not found`, 'Router dan NAT harus di region yang sama dengan VM yang memakainya.');
    if (!bool(c.a, 'nat-all-subnet-ip-ranges') && !flag(c.a, 'nat-custom-subnet-ip-ranges') && !bool(c.a, 'nat-primary-subnet-ip-ranges'))
      err(c, 'Exactly one of (--nat-all-subnet-ip-ranges | --nat-custom-subnet-ip-ranges | --nat-primary-subnet-ip-ranges) must be specified.');
    if (!bool(c.a, 'auto-allocate-nat-external-ips') && !flag(c.a, 'nat-external-ip-pool'))
      err(c, 'Exactly one of (--auto-allocate-nat-external-ips | --nat-external-ip-pool) must be specified.');
    p.nats.push({ name: n, router: routerName!, region: r, allSubnets: bool(c.a, 'nat-all-subnet-ip-ranges') });
    c.o.info(`Creating NAT [${n}] in router [${routerName}]...done.`);
  },
  'compute routers nats list'(c) {
    const p = computeProject(c);
    const router = flag(c.a, 'router');
    c.o.table(['name', 'nat_ip_allocate_option', 'source_subnetwork_ip_ranges_to_nat'], p.nats.filter((x) => !router || x.router === router).map((x) => [x.name, 'AUTO_ONLY', x.allSubnets ? 'ALL_SUBNETWORKS_ALL_IP_RANGES' : 'LIST_OF_SUBNETWORKS']));
  },
  'compute addresses create'(c) {
    computeProject(c);
    const n = needName(c);
    const global = bool(c.a, 'global');
    const r = global ? 'global' : needRegion(c.s, flag(c.a, 'region'), c.tag);
    created(c, global ? `global/addresses/${n}` : `regions/${r}/addresses/${n}`);
    c.s.events.push(`address:${n}:${r}:${nextExternalIp(c.s)}`);
  },
  'compute addresses list'(c) {
    computeProject(c);
    c.o.table(
      ['name', 'address/range', 'type', 'region', 'status'],
      c.s.events.filter((e) => e.startsWith('address:')).map((e) => {
        const [, n, r, ip] = e.split(':');
        return [n, ip, 'EXTERNAL', r === 'global' ? '' : r, 'RESERVED'];
      })
    );
  },
  'compute disks list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'location', 'location_scope', 'size_gb', 'type', 'status'], p.disks.map((d) => [d.name, d.zone, 'zone', d.sizeGb, d.type, 'READY']));
  },
  'compute disks snapshot'(c) {
    const p = computeProject(c);
    const d = p.disks.find((x) => x.name === c.pos[0]);
    if (!d) err(c, `The resource 'projects/${p.id}/zones/${flag(c.a, 'zone') ?? '-'}/disks/${c.pos[0] ?? ''}' was not found`);
    const n = flag(c.a, 'snapshot-names') ?? `${d!.name}-${suffix(c.s, 6)}`;
    p.snapshots.push({ name: n, source: d!.name });
    c.o.info(`Creating snapshot(s) ${n}...done.`);
  },
  'compute snapshots list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'disk_size_gb', 'src_disk', 'status'], p.snapshots.map((x) => [x.name, p.disks.find((d) => d.name === x.source)?.sizeGb ?? 10, x.source, 'READY']));
  },
  'compute instance-templates create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    if (p.templates.some((t) => t.name === n)) err(c, `The resource 'projects/${p.id}/global/instanceTemplates/${n}' already exists`, 'Instance template tidak bisa diubah; buat template baru dengan nama lain.');
    const t = { name: n, machineType: machineType(flag(c.a, 'machine-type'), c.tag), tags: list(flag(c.a, 'tags')), image: flag(c.a, 'image-family') ?? 'debian-12' };
    p.templates.push(t);
    created(c, `global/instanceTemplates/${n}`);
    c.o.table(['name', 'machine_type', 'preemptible', 'creation_timestamp'], [[n, t.machineType, '', '2026-10-16T02:41:07.000-07:00']]);
  },
  'compute instance-templates list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'machine_type', 'preemptible'], p.templates.map((t) => [t.name, t.machineType, '']));
  },
  'compute instance-groups managed create'(c) {
    const p = computeProject(c);
    const n = needName(c);
    const tpl = flag(c.a, 'template');
    if (!tpl) err(c, 'argument --template: Must be specified.');
    if (!p.templates.some((t) => t.name === tpl)) err(c, `Could not fetch resource:\n - The resource 'projects/${p.id}/global/instanceTemplates/${tpl}' was not found`);
    const size = Number(flag(c.a, 'size'));
    if (!Number.isInteger(size)) err(c, 'argument --size: Must be specified.');
    const loc = flag(c.a, 'region') ? needRegion(c.s, flag(c.a, 'region'), c.tag) : needZone(c.s, flag(c.a, 'zone'), c.tag);
    p.migs.push({ name: n, location: loc, template: tpl!, size, autoscaling: null });
    created(c, `${flag(c.a, 'region') ? 'regions' : 'zones'}/${loc}/instanceGroupManagers/${n}`);
    c.o.table(['name', 'location', 'scope', 'base_instance_name', 'size', 'target_size', 'instance_template', 'autoscaled'], [[n, loc, flag(c.a, 'region') ? 'region' : 'zone', n, '', size, tpl, 'no']]);
  },
  'compute instance-groups managed list'(c) {
    const p = computeProject(c);
    c.o.table(['name', 'location', 'size', 'target_size', 'instance_template', 'autoscaled'], p.migs.map((m) => [m.name, m.location, m.size, m.size, m.template, m.autoscaling ? 'yes' : 'no']));
  },
  'compute instance-groups managed set-autoscaling'(c) {
    const p = computeProject(c);
    const m = p.migs.find((x) => x.name === c.pos[0]);
    if (!m) err(c, `The resource instanceGroupManagers/${c.pos[0] ?? ''} was not found`);
    const max = Number(flag(c.a, 'max-num-replicas'));
    if (!Number.isInteger(max)) err(c, 'argument --max-num-replicas: Must be specified.');
    const min = Number(flag(c.a, 'min-num-replicas') ?? 1);
    const cpu = Number(flag(c.a, 'target-cpu-utilization') ?? 0.6);
    if (cpu <= 0 || cpu > 1) err(c, `argument --target-cpu-utilization: Value must be between 0.0 and 1.0 (got ${cpu}).`, 'Target CPU ditulis sebagai pecahan: 0.6 berarti 60%.');
    if (min > max) err(c, 'min-num-replicas cannot be greater than max-num-replicas.');
    m!.autoscaling = { min, max, cpu };
    if (m!.size < min) m!.size = min;
    c.o.out(`Created [${selfLink(p, `zones/${m!.location}/autoscalers/${m!.name}-${suffix(c.s, 4)}`)}].`);
  },
  'compute instance-groups managed resize'(c) {
    const p = computeProject(c);
    const m = p.migs.find((x) => x.name === c.pos[0]);
    if (!m) err(c, `The resource instanceGroupManagers/${c.pos[0] ?? ''} was not found`);
    m!.size = Number(flag(c.a, 'size'));
    if (m!.autoscaling) c.o.warn('WARNING: This group is autoscaled; the autoscaler may change its size again.');
    c.o.out(`Updated [${selfLink(p, `zones/${m!.location}/instanceGroupManagers/${m!.name}`)}].`);
  },

  // GKE
  'container clusters create'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const n = needName(c);
    if (p.clusters.some((x) => x.name === n)) err(c, `ResponseError: code=409, message=Already exists: projects/${p.id}/locations/-/clusters/${n}.`);
    const regional = !!flag(c.a, 'region');
    const loc = regional ? needRegion(c.s, flag(c.a, 'region'), c.tag) : needZone(c.s, flag(c.a, 'zone'), c.tag);
    const perZone = Number(flag(c.a, 'num-nodes') ?? 3);
    const auto = bool(c.a, 'enable-autoscaling');
    if (auto && !flag(c.a, 'max-nodes')) err(c, 'Must specify --max-nodes when autoscaling is enabled.');
    const nodes = perZone * (regional ? 3 : 1);
    p.clusters.push({
      name: n,
      location: loc,
      mode: 'standard',
      nodes,
      machineType: machineType(flag(c.a, 'machine-type'), c.tag),
      autoscaling: auto ? { min: Number(flag(c.a, 'min-nodes') ?? 1), max: Number(flag(c.a, 'max-nodes')) } : null,
      release: (flag(c.a, 'release-channel') ?? 'regular').toLowerCase(),
      kube: emptyKube()
    });
    c.s.kubeContext = `${n}@${p.id}`;
    c.o.info(`Creating cluster ${n} in ${loc}...done.`);
    c.o.out(`Created [https://container.googleapis.com/v1/projects/${p.id}/${regional ? 'locations' : 'zones'}/${loc}/clusters/${n}].`);
    c.o.info(`kubeconfig entry generated for ${n}.`);
    c.o.table(['name', 'location', 'master_version', 'machine_type', 'num_nodes', 'status'], [[n, loc, '1.33.4-gke.1000', p.clusters.at(-1)!.machineType, nodes, 'RUNNING']]);
    if (regional) c.o.info(`Petunjuk: cluster regional menaruh --num-nodes=${perZone} di SETIAP zone (3 zone), jadi total ${nodes} node.`);
  },
  'container clusters create-auto'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const n = needName(c);
    if (p.clusters.some((x) => x.name === n)) err(c, `ResponseError: code=409, message=Already exists.`);
    const loc = needRegion(c.s, flag(c.a, 'region'), c.tag);
    p.clusters.push({ name: n, location: loc, mode: 'autopilot', nodes: 0, machineType: 'autopilot', autoscaling: null, release: 'regular', kube: emptyKube() });
    c.s.kubeContext = `${n}@${p.id}`;
    c.o.info(`Creating cluster ${n} in ${loc}...done.`);
    c.o.info(`kubeconfig entry generated for ${n}.`);
    c.o.table(['name', 'location', 'master_version', 'num_nodes', 'status'], [[n, loc, '1.33.4-gke.1000', '', 'RUNNING']]);
  },
  'container clusters list'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    c.o.table(['name', 'location', 'master_version', 'machine_type', 'num_nodes', 'status'], p.clusters.map((k) => [k.name, k.location, '1.33.4-gke.1000', k.mode === 'autopilot' ? '' : k.machineType, k.mode === 'autopilot' ? '' : k.nodes, 'RUNNING']));
  },
  'container clusters get-credentials'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const k = p.clusters.find((x) => x.name === c.pos[0]);
    const loc = flag(c.a, 'zone', 'region', 'location');
    if (!k) err(c, `ResponseError: code=404, message=Not found: projects/${p.id}/locations/${loc ?? '-'}/clusters/${c.pos[0] ?? ''}.`);
    if (loc && loc !== k!.location) err(c, `ResponseError: code=404, message=Not found: projects/${p.id}/locations/${loc}/clusters/${k!.name}.`, `Cluster ini ada di ${k!.location}. Pakai --${k!.location.match(/-[abc]$/) ? 'zone' : 'region'}=${k!.location}.`);
    c.s.kubeContext = `${k!.name}@${p.id}`;
    c.o.info(`Fetching cluster endpoint and auth data.\nkubeconfig entry generated for ${k!.name}.`);
  },
  'container clusters resize'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const k = p.clusters.find((x) => x.name === c.pos[0]);
    if (!k) err(c, `ResponseError: code=404, message=Not found.`);
    if (k!.mode === 'autopilot') err(c, 'Autopilot clusters manage nodes automatically; resize is not supported.', 'Di Autopilot, Google yang mengatur node. Atur jumlah Pod, bukan node.');
    const n = Number(flag(c.a, 'num-nodes', 'size'));
    if (!Number.isInteger(n)) err(c, 'argument --num-nodes: Must be specified.');
    confirm(c.o, `Pool [default-pool] for [${k!.name}] will be resized to ${n} node(s) in each zone it spans.`);
    k!.nodes = n * (/-[abc]$/.test(k!.location) ? 1 : 3);
    c.o.info(`Resizing ${k!.name}...done.`);
    c.o.out(`Updated [https://container.googleapis.com/v1/projects/${p.id}/zones/${k!.location}/clusters/${k!.name}].`);
  },
  'container clusters update'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const k = p.clusters.find((x) => x.name === c.pos[0]);
    if (!k) err(c, `ResponseError: code=404, message=Not found.`);
    if (bool(c.a, 'enable-autoscaling')) {
      if (!flag(c.a, 'max-nodes')) err(c, 'Must specify --max-nodes when autoscaling is enabled.');
      k!.autoscaling = { min: Number(flag(c.a, 'min-nodes') ?? 1), max: Number(flag(c.a, 'max-nodes')) };
    }
    if (bool(c.a, 'no-enable-autoscaling')) k!.autoscaling = null;
    if (flag(c.a, 'release-channel')) k!.release = flag(c.a, 'release-channel')!.toLowerCase();
    c.o.info(`Updating ${k!.name}...done.`);
    c.o.out(`Updated [https://container.googleapis.com/v1/projects/${p.id}/zones/${k!.location}/clusters/${k!.name}].`);
  },
  'container clusters delete'(c) {
    const p = proj(c);
    needApi(p, 'container.googleapis.com', c.tag);
    const k = p.clusters.find((x) => x.name === c.pos[0]);
    if (!k) err(c, `ResponseError: code=404, message=Not found.`);
    confirm(c.o, `The following clusters will be deleted.\n - [${k!.name}] in [${k!.location}]`);
    p.clusters = p.clusters.filter((x) => x !== k);
    if (c.s.kubeContext === `${k!.name}@${p.id}`) c.s.kubeContext = null;
    c.o.out(`Deleted [https://container.googleapis.com/v1/projects/${p.id}/zones/${k!.location}/clusters/${k!.name}].`);
  },

  // IAM
  'iam service-accounts create'(c) {
    const p = proj(c);
    const n = c.pos[0];
    if (!n) err(c, 'argument NAME: Must be specified.');
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(n)) err(c, `Invalid value for [NAME]: '${n}'. Service account IDs must be 6–30 characters: lowercase letters, digits and hyphens.`, 'Yang diberikan adalah ID (bagian sebelum @), bukan email lengkap.');
    if (p.serviceAccounts.some((x) => x.name === n)) err(c, `Resource in projects [${p.id}] is the subject of a conflict: Service account ${n} already exists within project projects/${p.id}.`);
    const email = `${n}@${p.id}.iam.gserviceaccount.com`;
    p.serviceAccounts.push({ email, name: n, displayName: flag(c.a, 'display-name') ?? '', keys: 0 });
    c.o.info(`Created service account [${n}].`);
  },
  'iam service-accounts list'(c) {
    const p = proj(c);
    c.o.table(['display_name', 'email', 'disabled'], p.serviceAccounts.map((x) => [x.displayName, x.email, 'False']));
  },
  'iam service-accounts delete'(c) {
    const p = proj(c);
    const sa = p.serviceAccounts.find((x) => x.email === c.pos[0]);
    if (!sa) err(c, `NOT_FOUND: Unknown service account`, 'Pakai email lengkap service account.');
    p.serviceAccounts = p.serviceAccounts.filter((x) => x !== sa);
    c.o.info(`deleted service account [${sa!.email}]`);
  },
  'iam service-accounts keys create'(c) {
    const p = proj(c);
    const file = c.pos[0];
    const email = flag(c.a, 'iam-account');
    if (!file || !email) err(c, 'arguments OUTPUT-FILE --iam-account: Must be specified.');
    const sa = c.s.projects.flatMap((x) => x.serviceAccounts).find((x) => x.email === email);
    if (!sa) err(c, `NOT_FOUND: Service account ${email} does not exist.`);
    sa!.keys += 1;
    c.s.files[file] = `{ "type": "service_account", "project_id": "${p.id}", "client_email": "${email}", "private_key": "-----BEGIN PRIVATE KEY-----…" }`;
    c.o.info(`created key [${suffix(c.s, 12)}] of type [json] as [${file}] for [${email}]`);
    c.o.warn('Lab: kunci JSON adalah rahasia jangka panjang. Untuk workload di Google Cloud, lebih aman pakai service account terpasang atau Workload Identity daripada file kunci.');
  },
  'iam service-accounts keys list'(c) {
    const sa = c.s.projects.flatMap((x) => x.serviceAccounts).find((x) => x.email === flag(c.a, 'iam-account'));
    if (!sa) err(c, 'NOT_FOUND: service account not found.');
    c.o.table(['key_id', 'created_at', 'expires_at', 'disabled'], [['(system-managed)', '2026-10-01T00:00:00Z', '9999-12-31T23:59:59Z', ''], ...Array.from({ length: sa!.keys }, (_, i) => [`k${i + 1}${suffix(c.s, 10)}`, '2026-10-16T09:41:07Z', '9999-12-31T23:59:59Z', ''])]);
  },
  'iam service-accounts add-iam-policy-binding'(c) {
    const p = proj(c);
    const sa = p.serviceAccounts.find((x) => x.email === c.pos[0]);
    if (!sa) err(c, `NOT_FOUND: Service account ${c.pos[0] ?? ''} does not exist.`);
    const member = needMember(flag(c.a, 'member'), c.tag);
    const role = needRole(flag(c.a, 'role'), c.tag);
    c.s.events.push(`sa-binding:${sa!.email}:${role}:${member}`);
    c.o.info(`Updated IAM policy for serviceAccount [${sa!.email}].`);
    c.o.out('bindings:', '- members:', `  - ${member}`, `  role: ${role}`, 'etag: BwYk3x2c1aQ=', 'version: 1');
  },

  // Cloud Run
  'run deploy'(c) {
    const p = proj(c);
    needApi(p, 'run.googleapis.com', c.tag);
    const n = needName(c, 'SERVICE');
    const image = flag(c.a, 'image');
    if (!image) err(c, 'argument --image: Must be specified.', 'Lab ini tidak membangun dari source; berikan --image, misalnya us-docker.pkg.dev/cloudrun/container/hello.');
    const r = flag(c.a, 'region') ?? config(c.s).region;
    if (!r) err(c, 'Missing required argument [--region]: Specify the region with --region or set run/region.');
    if (!REGIONS.includes(r!)) err(c, `Invalid region '${r}'.`);
    const existing = p.run.find((x) => x.name === n && x.region === r);
    const svc: RunService = existing ?? { name: n, region: r!, image: image!, allowUnauthenticated: false, revision: 0, minInstances: 0, maxInstances: 100, url: `https://${n}-${suffix(c.s, 10)}-${r!.split('-')[0].slice(0, 2)}.a.run.app` };
    svc.image = image!;
    svc.revision += 1;
    if (bool(c.a, 'allow-unauthenticated')) svc.allowUnauthenticated = true;
    if (bool(c.a, 'no-allow-unauthenticated')) svc.allowUnauthenticated = false;
    if (flag(c.a, 'min-instances')) svc.minInstances = Number(flag(c.a, 'min-instances'));
    if (flag(c.a, 'max-instances')) svc.maxInstances = Number(flag(c.a, 'max-instances'));
    if (!existing) p.run.push(svc);
    c.o.out(`Deploying container to Cloud Run service [${n}] in project [${p.id}] region [${r}]`, 'OK Deploying... Done.', '  OK Creating Revision...', '  OK Routing traffic...', ...(svc.allowUnauthenticated ? ['  OK Setting IAM Policy...'] : []), 'Done.', `Service [${n}] revision [${n}-${String(svc.revision).padStart(5, '0')}-${suffix(c.s, 3)}] has been deployed and is serving 100 percent of traffic.`, `Service URL: ${svc.url}`);
    if (!svc.allowUnauthenticated) c.o.info('Petunjuk: tanpa --allow-unauthenticated, URL ini menolak pengunjung anonim (403).');
  },
  'run services list'(c) {
    const p = proj(c);
    needApi(p, 'run.googleapis.com', c.tag);
    c.o.table(['service', 'region', 'url', 'last_deployed_by'], p.run.map((x) => [x.name, x.region, x.url, c.s.account]));
  },
  'run services describe'(c) {
    const p = proj(c);
    needApi(p, 'run.googleapis.com', c.tag);
    const x = p.run.find((y) => y.name === c.pos[0]);
    if (!x) err(c, `Cannot find service [${c.pos[0] ?? ''}]`);
    c.o.out(`✔ Service ${x!.name} in region ${x!.region}`, '', `URL:     ${x!.url}`, `Ingress: all`, `Traffic:`, `  100% LATEST (currently ${x!.name}-${String(x!.revision).padStart(5, '0')})`, '', `Image:   ${x!.image}`, `Min instances: ${x!.minInstances}  Max instances: ${x!.maxInstances}`, `Unauthenticated access: ${x!.allowUnauthenticated ? 'allowed' : 'not allowed'}`);
  },
  'run services update'(c) {
    const p = proj(c);
    needApi(p, 'run.googleapis.com', c.tag);
    const x = p.run.find((y) => y.name === c.pos[0] && (!flag(c.a, 'region') || y.region === flag(c.a, 'region')));
    if (!x) err(c, `Cannot find service [${c.pos[0] ?? ''}]`);
    if (flag(c.a, 'min-instances')) x!.minInstances = Number(flag(c.a, 'min-instances'));
    if (flag(c.a, 'max-instances')) x!.maxInstances = Number(flag(c.a, 'max-instances'));
    if (flag(c.a, 'image')) x!.image = flag(c.a, 'image')!;
    x!.revision += 1;
    c.o.out('OK Deploying... Done.', `Service [${x!.name}] revision [${x!.name}-${String(x!.revision).padStart(5, '0')}-${suffix(c.s, 3)}] has been deployed and is serving 100 percent of traffic.`);
  },
  'run services add-iam-policy-binding'(c) {
    const p = proj(c);
    needApi(p, 'run.googleapis.com', c.tag);
    const x = p.run.find((y) => y.name === c.pos[0]);
    if (!x) err(c, `Cannot find service [${c.pos[0] ?? ''}]`);
    const member = needMember(flag(c.a, 'member'), c.tag);
    const role = needRole(flag(c.a, 'role'), c.tag);
    if (member === 'allUsers' && role === 'roles/run.invoker') x!.allowUnauthenticated = true;
    c.o.info(`Updated IAM policy for service [${x!.name}].`);
    c.o.out('bindings:', '- members:', `  - ${member}`, `  role: ${role}`);
  },

  // Cloud SQL
  'sql instances create'(c) {
    const p = proj(c);
    needApi(p, 'sqladmin.googleapis.com', c.tag);
    const n = needName(c, 'INSTANCE');
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    const version = flag(c.a, 'database-version') ?? 'MYSQL_8_0';
    if (!/^(MYSQL_\d+_\d+|POSTGRES_\d+|SQLSERVER_\d+_\w+)$/.test(version)) err(c, `argument --database-version: Invalid choice: '${version}'.`);
    const tier = flag(c.a, 'tier') ?? (flag(c.a, 'cpu') ? `db-custom-${flag(c.a, 'cpu')}-${Number(parseGb(flag(c.a, 'memory'), 4)) * 1024}` : 'db-n1-standard-1');
    const availability = (flag(c.a, 'availability-type') ?? 'ZONAL').toUpperCase();
    p.sql.push({ name: n, version, tier, region: r, availability: availability === 'REGIONAL' ? 'REGIONAL' : 'ZONAL', backups: !!flag(c.a, 'backup-start-time') });
    c.o.info(`Creating Cloud SQL instance for ${version}...done.`);
    c.o.out(`Created [https://sqladmin.googleapis.com/sql/v1beta4/projects/${p.id}/instances/${n}].`);
    c.o.table(['name', 'database_version', 'location', 'tier', 'primary_address', 'status'], [[n, version, `${r}-a`, tier, `34.${101}.${c.s.seq % 250}.7`, 'RUNNABLE']]);
  },
  'sql instances list'(c) {
    const p = proj(c);
    needApi(p, 'sqladmin.googleapis.com', c.tag);
    c.o.table(['name', 'database_version', 'location', 'tier', 'availability', 'status'], p.sql.map((x) => [x.name, x.version, x.region, x.tier, x.availability, 'RUNNABLE']));
  },

  // Pub/Sub
  'pubsub topics create'(c) {
    const p = proj(c);
    needApi(p, 'pubsub.googleapis.com', c.tag);
    for (const t of c.pos) {
      if (p.topics.includes(t)) err(c, `Failed to create topic [projects/${p.id}/topics/${t}]: Resource already exists in the project (resource=${t}).`);
      p.topics.push(t);
      c.o.out(`Created topic [projects/${p.id}/topics/${t}].`);
    }
  },
  'pubsub topics list'(c) {
    const p = proj(c);
    needApi(p, 'pubsub.googleapis.com', c.tag);
    for (const t of p.topics) c.o.out('---', `name: projects/${p.id}/topics/${t}`);
  },
  'pubsub topics publish'(c) {
    const p = proj(c);
    needApi(p, 'pubsub.googleapis.com', c.tag);
    if (!p.topics.includes(c.pos[0])) err(c, `NOT_FOUND: Requested entity was not found.`);
    c.o.out('messageIds:', `- '${100000 + c.s.seq++}'`);
  },
  'pubsub subscriptions create'(c) {
    const p = proj(c);
    needApi(p, 'pubsub.googleapis.com', c.tag);
    const topic = flag(c.a, 'topic');
    if (!topic) err(c, 'argument --topic: Must be specified.');
    if (!p.topics.includes(topic!)) err(c, `NOT_FOUND: Requested entity was not found.`, 'Buat topic dulu: gcloud pubsub topics create.');
    for (const n of c.pos) {
      p.subscriptions.push({ name: n, topic: topic! });
      c.o.out(`Created subscription [projects/${p.id}/subscriptions/${n}].`);
    }
  },
  'pubsub subscriptions list'(c) {
    const p = proj(c);
    needApi(p, 'pubsub.googleapis.com', c.tag);
    for (const s of p.subscriptions) c.o.out('---', `name: projects/${p.id}/subscriptions/${s.name}`, `topic: projects/${p.id}/topics/${s.topic}`);
  },

  // Cloud Functions
  'functions deploy'(c) {
    const p = proj(c);
    needApi(p, 'cloudfunctions.googleapis.com', c.tag);
    const n = needName(c);
    const runtime = flag(c.a, 'runtime');
    if (!runtime) err(c, 'argument --runtime: Must be specified for new functions.');
    const trigger = bool(c.a, 'trigger-http') ? 'http' : flag(c.a, 'trigger-topic') ? `topic:${flag(c.a, 'trigger-topic')}` : flag(c.a, 'trigger-bucket') ? `bucket:${flag(c.a, 'trigger-bucket')}` : '';
    if (!trigger) err(c, 'You must specify a trigger when deploying a new function: --trigger-http, --trigger-topic or --trigger-bucket.');
    const r = needRegion(c.s, flag(c.a, 'region'), c.tag);
    p.functions = p.functions.filter((f) => f.name !== n);
    p.functions.push({ name: n, region: r, runtime: runtime!, trigger });
    c.o.out(`Deploying function (may take a while - up to 2 minutes)...done.`, `name: projects/${p.id}/locations/${r}/functions/${n}`, `state: ACTIVE`);
  },
  'functions list'(c) {
    const p = proj(c);
    needApi(p, 'cloudfunctions.googleapis.com', c.tag);
    c.o.table(['name', 'state', 'trigger', 'region'], p.functions.map((f) => [f.name, 'ACTIVE', f.trigger, f.region]));
  },

  // gcloud storage
  'storage buckets create'(c) {
    const p = proj(c);
    const fail = failer('gcloud', c.tag);
    if (!c.pos[0]) err(c, 'argument URL: Must be specified.');
    const b = createBucket(c.s, p, c.pos[0], { location: flag(c.a, 'location', 'l'), storageClass: flag(c.a, 'default-storage-class', 'c'), uniform: bool(c.a, 'uniform-bucket-level-access', 'b') }, fail);
    c.o.out(`Creating gs://${b.name}/...`);
  },
  'storage buckets list'(c) {
    const p = proj(c);
    for (const b of p.buckets) c.o.out('---', `name: ${b.name}`, `location: ${b.location}`, `default_storage_class: ${b.storageClass}`);
  },
  'storage buckets describe'(c) {
    describeBucket(needBucket(c.s, c.pos[0] ?? '', failer('gcloud', c.tag)), c.o);
  },
  'storage buckets update'(c) {
    const fail = failer('gcloud', c.tag);
    const b = needBucket(c.s, c.pos[0] ?? '', fail);
    if (bool(c.a, 'versioning')) b.versioning = true;
    if (bool(c.a, 'no-versioning')) b.versioning = false;
    if (flag(c.a, 'lifecycle-file')) b.lifecycle = readLifecycle(c.s, flag(c.a, 'lifecycle-file'), fail);
    if (flag(c.a, 'default-storage-class')) b.storageClass = normClass(flag(c.a, 'default-storage-class'), fail)!;
    if (flag(c.a, 'retention-period')) b.retentionSeconds = parseRetention(flag(c.a, 'retention-period')!, fail);
    if (bool(c.a, 'uniform-bucket-level-access')) b.uniformAccess = true;
    c.o.out(`Updating gs://${b.name}/...`, '  Completed 1');
  },
  'storage buckets delete'(c) {
    const fail = failer('gcloud', c.tag);
    for (const u of c.pos) removeBucket(c.s, u, c.o, fail);
  },
  'storage buckets add-iam-policy-binding'(c) {
    const fail = failer('gcloud', c.tag);
    const b = needBucket(c.s, c.pos[0] ?? '', fail);
    const member = needMember(flag(c.a, 'member'), c.tag);
    const role = needRole(fullStorageRole(flag(c.a, 'role') ?? ''), c.tag);
    grant(b, member, role);
    c.o.info(`Updated IAM policy for bucket [${b.name}].`);
    printPolicy(c.o, bucketPolicy(b), 'CAI=');
  },
  'storage buckets get-iam-policy'(c) {
    printPolicy(c.o, bucketPolicy(needBucket(c.s, c.pos[0] ?? '', failer('gcloud', c.tag))), 'CAE=');
  },
  'storage ls'(c) {
    const p = proj(c);
    const fail = failer('gcloud', c.tag);
    if (!c.pos.length) return listUrl(c.s, p, undefined, false, c.o, fail);
    for (const u of c.pos) listUrl(c.s, p, u, bool(c.a, 'long', 'l'), c.o, fail);
  },
  'storage cp'(c) {
    proj(c);
    if (c.pos.length < 2) err(c, 'argument SOURCE DESTINATION: Must be specified.');
    copy(c.s, c.pos.slice(0, -1), c.pos.at(-1)!, { recursive: bool(c.a, 'recursive', 'r'), storageClass: flag(c.a, 'storage-class', 's') }, c.o, failer('gcloud', c.tag));
  },
  'storage mv'(c) {
    proj(c);
    if (c.pos.length < 2) err(c, 'argument SOURCE DESTINATION: Must be specified.');
    copy(c.s, c.pos.slice(0, -1), c.pos.at(-1)!, { recursive: true, move: true }, c.o, failer('gcloud', c.tag));
  },
  'storage rm'(c) {
    const fail = failer('gcloud', c.tag);
    remove(c.s, c.pos, bool(c.a, 'recursive', 'r') || c.pos.some((u) => u.endsWith('**')), c.o, fail);
    for (const u of c.pos) if (bool(c.a, 'recursive', 'r') && splitUrl(u) && !splitUrl(u)!.path) removeBucket(c.s, u, c.o, fail);
  },
  'storage du'(c) {
    const fail = failer('gcloud', c.tag);
    for (const u of c.pos) {
      const b = needBucket(c.s, u, fail);
      const names = matchObjects(b, splitUrl(u)!.path, true);
      c.o.out(`${names.reduce((n, k) => n + b.objects[k].size, 0)}  gs://${b.name}`);
    }
  },
  'storage objects update'(c) {
    const fail = failer('gcloud', c.tag);
    const cls = normClass(flag(c.a, 'storage-class'), fail);
    for (const u of c.pos) {
      const b = needBucket(c.s, u, fail);
      const names = matchObjects(b, splitUrl(u)!.path, bool(c.a, 'recursive', 'r'));
      if (!names.length) fail(404, `${u} not found.`);
      for (const n of names) if (cls) b.objects[n].storageClass = cls;
      c.o.out(`Patching gs://${b.name}/...`, `  Completed ${names.length}`);
    }
  },
  version(c) {
    c.o.out('Google Cloud SDK 540.0.0 (lab)', 'bq 2.1.24', 'core 2026.10.03', 'gcloud-crc32c 1.0.0', 'gsutil 5.35', 'kubectl 1.33.4');
  }
};

/** Every gcloud command the lab understands, for tab completion and help. */
export const GCLOUD_COMMANDS = Object.keys(H);

/** Groups shown by `gcloud help`. */
const GROUPS = [...new Set(GCLOUD_COMMANDS.map((k) => k.split(' ')[0]))];

export function gcloud({ s, o, words }: Ctx) {
  const args = parseArgs(words, BOOLEANS);
  if (!args.pos.length || args.pos[0] === 'help' || (bool(args, 'help', 'h') && args.pos.length < 2)) {
    o.out('Usage: gcloud GROUP [SUBGROUP...] COMMAND [FLAGS]', '', `Groups di lab ini: ${GROUPS.join(', ')}`, '', 'Contoh: gcloud compute instances list', "Ketik 'gcloud compute' untuk melihat perintah di dalam grup.");
    return;
  }
  const hit = route(H, args.pos);
  if (!hit) {
    const typed = args.pos.join(' ');
    // A group name on its own: list what's inside, one level down.
    const inside = GCLOUD_COMMANDS.filter((k) => k.startsWith(typed + ' '));
    if (inside.length) {
      const depth = args.pos.length;
      const next = [...new Set(inside.map((k) => k.split(' ')[depth]))];
      o.err(`ERROR: (gcloud.${args.pos.join('.')}) Command name argument expected.`);
      o.info(`Di dalam gcloud ${typed}: ${next.join(', ')}`);
      return;
    }
    const i = args.pos.findIndex((_, j) => !GCLOUD_COMMANDS.some((k) => k.split(' ').slice(0, j + 1).join(' ') === args.pos.slice(0, j + 1).join(' ')));
    const bad = args.pos[Math.max(0, i)];
    const base = args.pos.slice(0, Math.max(0, i)).join(' ');
    const near = [...new Set(GCLOUD_COMMANDS.filter((k) => k.startsWith(base ? base + ' ' : '')).map((k) => k.split(' ')[Math.max(0, i)]))].filter((w) => w.startsWith(bad.slice(0, 3)) || bad.startsWith(w.slice(0, 3)) || distance(w, bad) <= 2);
    o.err(`ERROR: (gcloud${base ? '.' + base.replace(/ /g, '.') : ''}) Invalid choice: '${bad}'.`);
    if (near.length) o.info(`Maybe you meant:\n${near.map((w) => `  gcloud ${base ? base + ' ' : ''}${w}`).join('\n')}`);
    return;
  }
  if (bool(args, 'help', 'h')) {
    o.out(`NAME\n    gcloud ${hit.key}\n\n(Lab: halaman bantuan lengkap ada di cheat sheet Commands.)`);
    return;
  }
  hit.handler({ s, o, a: args, pos: hit.rest, key: hit.key, tag: gcloudTag(hit.key) });
}

/** Edit distance, for "did you mean" on typos like `lst`. */
function distance(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
