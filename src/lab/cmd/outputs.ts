/**
 * What a correct command prints, so a right answer looks and feels like the
 * real thing. Shapes follow the CLIs' own format strings (gcloud 589,
 * kubectl 1.34, Docker 29, Terraform 1.x); names and numbers come from what
 * was typed, everything else is invented but plausible.
 */
import type { Parsed } from './grammar';

export interface QuizEnv {
  project: string;
  account: string;
  config: string;
  zone: string;
  region: string;
}

export const newEnv = (): QuizEnv => ({ project: 'ace-lab-123', account: 'student@ace-lab.dev', config: 'default', zone: 'us-central1-a', region: 'us-central1' });

const PROJECT_NUMBER = '123456789012';

/** gcloud-style table: upper-case headers, columns two spaces apart. */
function table(headers: string[], rows: (string | number)[][], gap = 2): string[] {
  const cells = rows.map((r) => r.map(String));
  const widths = headers.map((h, i) => Math.max(h.length, ...cells.map((r) => (r[i] ?? '').length)));
  const fmt = (r: string[]) => r.map((c, i) => (i === r.length - 1 ? c : c.padEnd(widths[i] + gap - 2))).join('  ').trimEnd();
  return [fmt(headers), ...cells.map(fmt)];
}
const ktable = (headers: string[], rows: (string | number)[][]) => table(headers, rows, 3);

const one = (p: Parsed, f: string) => p.flags[f]?.[p.flags[f].length - 1];
const on = (p: Parsed, f: string) => one(p, f) === 'true';
const tail = (s: string) => s.split('/').pop() ?? s;

const compute = (e: QuizEnv, path: string) => `https://www.googleapis.com/compute/v1/projects/${e.project}/${path}`;
const zoneOf = (p: Parsed, e: QuizEnv) => one(p, 'zone') ?? e.zone;
const regionOf = (p: Parsed, e: QuizEnv) => one(p, 'region') ?? e.region;

const op = () => `operations/acf.p2-${PROJECT_NUMBER}-1b2c3d4e-5f60-4a1b-9c2d-3e4f5a6b7c8d`;

const binding = (role: string, member: string) => ['bindings:', '- members:', `  - ${member}`, `  role: ${role}`, 'etag: BwYk3x2c1aQ=', 'version: 1'];

type Gen = (p: Parsed, e: QuizEnv) => string[];

const G: Record<string, Gen> = {
  // ── gcloud: getting started ──
  'gcloud init': (_, e) => [
    'Welcome! This command will take you through the configuration of gcloud.',
    '',
    `Settings from your current configuration [${e.config}] are:`,
    'core:',
    `  account: ${e.account}`,
    '  disable_usage_reporting: \'True\'',
    '',
    'Pick configuration to use:',
    ` [1] Re-initialize this configuration [${e.config}] with new settings `,
    ' [2] Create a new configuration',
    'Please enter your numeric choice:  1',
    '',
    `Your current configuration has been set to: [${e.config}]`,
    '',
    'Choose the account you want to use for this configuration.',
    'To use a federated user account, exit this command and sign in to the gcloud CLI with your login configuration file, then run this command again.',
    '',
    'Select an account:',
    ` [1] ${e.account}`,
    ' [2] Sign in with a new Google Account',
    ' [3] Skip this step',
    'Please enter your numeric choice:  1',
    '',
    `You are signed in as: [${e.account}].`,
    '',
    'Pick cloud project to use: ',
    ` [1] ${e.project}`,
    ' [2] ace-prod-123',
    ' [3] Enter a project ID',
    ' [4] Create a new project',
    'Please enter numeric choice or text value (must exactly match list item):  1',
    '',
    `Your current project has been set to: [${e.project}].`,
    '',
    'Do you want to configure a default Compute Region and Zone? (Y/n)?  Y',
    '',
    `Your project default Compute Engine zone has been set to [${e.zone}].`,
    'You can change it by running [gcloud config set compute/zone NAME].',
    '',
    `Your project default Compute Engine region has been set to [${e.region}].`,
    'You can change it by running [gcloud config set compute/region NAME].',
    '',
    'The Google Cloud CLI is configured and ready to use!',
    '',
    `* Commands that require authentication will use ${e.account} by default`,
    `* Commands will reference project \`${e.project}\` by default`,
    `* Compute Engine commands will use region \`${e.region}\` by default`,
    `* Compute Engine commands will use zone \`${e.zone}\` by default`,
    '',
    'Run `gcloud help config` to learn how to change individual settings',
    '',
    `This gcloud configuration is called [${e.config}]. You can create additional configurations if you work with multiple accounts and/or projects.`,
    'Run `gcloud topic configurations` to learn more.'
  ],
  'gcloud version': () => ['Google Cloud SDK 589.0.0', 'alpha 2026.10.13', 'beta 2026.10.13', 'bq 2.1.25', 'bundled-python3-unix 3.12.9', 'core 2026.10.13', 'gcloud-crc32c 1.0.0', 'gsutil 5.37', 'kubectl 1.34.1'],
  'gcloud info': (_, e) => [
    'Google Cloud SDK [589.0.0]',
    '',
    'Platform: [Linux, x86_64] uname_result(system=\'Linux\', node=\'cs-1234-default\', machine=\'x86_64\')',
    'Locale: (\'en_US\', \'UTF-8\')',
    'Python Version: [3.12.9]',
    '',
    'Installation Root: [/usr/lib/google-cloud-sdk]',
    'Installed Components:',
    '  core: [2026.10.13]',
    '  gsutil: [5.37]',
    '  bq: [2.1.25]',
    '',
    'Installation Properties: [/usr/lib/google-cloud-sdk/properties]',
    'User Config Directory: [/home/student/.config/gcloud]',
    `Active Configuration Name: [${e.config}]`,
    `Active Configuration Path: [/home/student/.config/gcloud/configurations/config_${e.config}]`,
    '',
    `Account: [${e.account}]`,
    `Project: [${e.project}]`
  ],
  'gcloud help': (p) =>
    p.rest
      ? [`Search results for "${p.rest.join(' ')}" (top 5):`, '', 'gcloud compute disks snapshot', '    Create snapshots of Compute Engine persistent disks.', 'gcloud compute snapshots list', '    List Compute Engine snapshots.', 'gcloud compute resource-policies create snapshot-schedule', '    Create a Compute Engine Snapshot Schedule Resource Policy.']
      : manPage(p.pos),
  'gcloud topic filters': () => ['NAME', '    gcloud topic filters - resource filters supplementary help', '', 'DESCRIPTION', '    Most gcloud commands return a list of resources on success. By default', '    they are pretty-printed on the standard output. The --filter=EXPRESSION', '    flag ... selects resources to be listed.'],
  'gcloud components install': (p) => componentManagerOff(`sudo apt-get install ${p.pos.map((c) => `google-cloud-cli-${c}`).join(' ')}`),
  'gcloud components update': () => componentManagerOff('sudo apt-get update && sudo apt-get --only-upgrade install google-cloud-cli'),

  // ── config ──
  'gcloud config set': (p, e) => {
    const [key, value] = p.pos;
    const full = key.includes('/') ? key : `core/${key}`;
    if (full === 'core/project') e.project = value;
    if (full === 'compute/zone') e.zone = value;
    if (full === 'compute/region') e.region = value;
    return [`Updated property [${full}].`];
  },
  'gcloud config get': (p, e) => [propValue(p.pos[0], e)],
  'gcloud config get-value': (p, e) => [propValue(p.pos[0], e)],
  'gcloud config list': (_, e) => ['[compute]', `region = ${e.region}`, `zone = ${e.zone}`, '[core]', `account = ${e.account}`, 'disable_usage_reporting = True', `project = ${e.project}`, '', `Your active configuration is: [${e.config}]`],
  'gcloud config configurations create': (p, e) => {
    const out = [`Created [${p.pos[0]}].`];
    if (one(p, 'activate') !== 'false') {
      e.config = p.pos[0];
      out.push(`Activated [${p.pos[0]}].`);
    }
    return out;
  },
  'gcloud config configurations list': (_, e) =>
    table(
      ['NAME', 'IS_ACTIVE', 'ACCOUNT', 'PROJECT', 'COMPUTE_DEFAULT_ZONE', 'COMPUTE_DEFAULT_REGION'],
      [
        ['default', String(e.config === 'default'), e.account, 'ace-lab-123', 'us-central1-a', 'us-central1'],
        ['dev', String(e.config === 'dev'), e.account, 'ace-dev-2026', 'us-central1-a', 'us-central1'],
        ['prod', String(e.config === 'prod'), e.account, 'ace-prod-123', 'us-east1-b', 'us-east1']
      ]
    ),
  'gcloud config configurations activate': (p, e) => {
    e.config = p.pos[0];
    return [`Activated [${p.pos[0]}].`];
  },
  'gcloud config configurations describe': (p, e) => [`is_active: ${e.config === p.pos[0]}`, `name: ${p.pos[0]}`, 'properties:', '  compute:', '    region: us-east1', '    zone: us-east1-b', '  core:', `    account: ${e.account}`, '    project: ace-prod-123'],

  // ── auth ──
  'gcloud auth login': (p, e) => [
    'You are already authenticated with gcloud when running',
    'inside the Cloud Shell and so do not need to run this',
    'command. Do you wish to proceed anyway?',
    '',
    'Do you want to continue (Y/n)?  Y',
    '',
    ...(one(p, 'launch-browser') === 'false' || on(p, 'no-browser')
      ? ['Go to the following link in your browser, and complete the sign-in prompts:', '', '    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=32555940559.apps…&token_usage=remote', '', 'Once finished, enter the verification code provided in your browser: ••••••••']
      : ['Your browser has been opened to visit:', '', '    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=32555940559.apps…']),
    '',
    `You are now logged in as [${p.pos[0] ?? e.account}].`,
    `Your current project is [${e.project}].  You can change this setting by running:`,
    '  $ gcloud config set project PROJECT_ID'
  ],
  'gcloud auth activate-service-account': (p) => [`Activated service account credentials for: [${p.pos[0] ?? 'app-runner@ace-lab-123.iam.gserviceaccount.com'}]`],
  'gcloud auth application-default login': () => [
    'Go to the following link in your browser, and complete the sign-in prompts:',
    '',
    '    https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=764086051850-…',
    '',
    'Once finished, enter the verification code provided in your browser: ••••••••',
    '',
    'Credentials saved to file: [/home/student/.config/gcloud/application_default_credentials.json]',
    '',
    'These credentials will be used by any library that requests Application Default Credentials (ADC).'
  ],
  'gcloud auth list': (_, e) => ['      Credentialed Accounts', 'ACTIVE  ACCOUNT', `*       ${e.account}`, '        old@example.com', '', 'To set the active account, run:', '    $ gcloud config set account `ACCOUNT`'],
  'gcloud auth print-access-token': () => ['ya29.****************************** (contoh, bukan token asli)'],
  'gcloud auth revoke': (p) => ['Revoked credentials:', ...p.pos.map((a) => ` - ${a}`)],
  'gcloud auth configure-docker': (p) => {
    const host = p.pos[0] ?? 'gcr.io';
    return [
      `Adding credentials for: ${host}`,
      'After update, the following will be written to your Docker config file located at [/home/student/.docker/config.json]:',
      ' {',
      '  "credHelpers": {',
      `    "${host}": "gcloud"`,
      '  }',
      '}',
      '',
      'Do you want to continue (Y/n)?  Y',
      '',
      'Docker configuration file updated.'
    ];
  },

  // ── projects, services, billing, IAM ──
  'gcloud projects list': () => table(['PROJECT_ID', 'NAME', 'PROJECT_NUMBER'], [['ace-lab-123', 'ACE Lab', PROJECT_NUMBER], ['ace-prod-123', 'ACE Prod', '987654321098']]),
  'gcloud projects describe': (p) => [`createTime: '2026-09-01T03:12:44.120Z'`, 'lifecycleState: ACTIVE', 'name: ACE Lab', 'parent:', "  id: '123456789012'", '  type: organization', `projectId: ${p.pos[0]}`, `projectNumber: '${PROJECT_NUMBER}'`],
  'gcloud projects create': (p) => [
    `Create in progress for [https://cloudresourcemanager.googleapis.com/v1/projects/${p.pos[0]}].`,
    'Waiting for [operations/cp.6412893027516480123] to finish...done.',
    `Enabling service [cloudapis.googleapis.com] on project [${p.pos[0]}]...`,
    `Operation "${op()}" finished successfully.`
  ],
  'gcloud resource-manager folders create': (p) => ['Waiting for [operations/cf.4428175063214] to finish...done.', 'Created [<Folder', ` createTime: '2026-10-18T02:11:09.511Z'`, ` displayName: '${one(p, 'display-name')}'`, " name: 'folders/987654321'", ` parent: 'organizations/${one(p, 'organization') ?? one(p, 'folder')}'>].`],
  'gcloud services enable': () => [`Operation "${op()}" finished successfully.`],
  'gcloud services list': () => table(['NAME', 'TITLE'], [['bigquery.googleapis.com', 'BigQuery API'], ['compute.googleapis.com', 'Compute Engine API'], ['logging.googleapis.com', 'Cloud Logging API'], ['run.googleapis.com', 'Cloud Run Admin API'], ['storage.googleapis.com', 'Cloud Storage API']]),
  'gcloud billing projects link': (p) => [`billingAccountName: billingAccounts/${one(p, 'billing-account')}`, 'billingEnabled: true', `name: projects/${p.pos[0]}/billingInfo`, `projectId: ${p.pos[0]}`],
  'gcloud billing budgets create': (p) => [`amount:`, '  specifiedAmount:', '    currencyCode: USD', "    units: '100'", `displayName: ${one(p, 'display-name')}`, `name: billingAccounts/${one(p, 'billing-account')}/budgets/1a2b3c4d-5e6f`, 'thresholdRules:', '- spendBasis: CURRENT_SPEND', '  thresholdPercent: 0.9'],
  'gcloud projects add-iam-policy-binding': (p) => [`Updated IAM policy for project [${p.pos[0]}].`, ...binding(one(p, 'role')!, one(p, 'member')!)],
  'gcloud projects remove-iam-policy-binding': (p) => [`Updated IAM policy for project [${p.pos[0]}].`, 'bindings:', '- members:', '  - user:student@ace-lab.dev', '  role: roles/owner', 'etag: BwYk3x9mQ2E=', 'version: 1'],
  'gcloud projects get-iam-policy': () => ['bindings:', '- members:', '  - serviceAccount:app-runner@ace-lab-123.iam.gserviceaccount.com', '  role: roles/logging.logWriter', '- members:', '  - user:student@ace-lab.dev', '  role: roles/owner', '- members:', '  - user:ana@example.com', '  role: roles/viewer', 'etag: BwYk3x2c1aQ=', 'version: 1'],
  'gcloud iam roles describe': (p) => ['description: Read access to GCS objects.', 'etag: AA==', 'includedPermissions:', '- resourcemanager.projects.get', '- resourcemanager.projects.list', '- storage.folders.get', '- storage.folders.list', '- storage.managedFolders.get', '- storage.managedFolders.list', '- storage.objects.get', '- storage.objects.list', `name: ${p.pos[0]}`, 'stage: GA', 'title: Storage Object Viewer'],
  'gcloud iam list-grantable-roles': () => ['---', 'description: Full access to all resources.', 'name: roles/owner', 'title: Owner', '---', 'description: View most Google Cloud resources.', 'name: roles/viewer', 'title: Viewer', '…'],
  'gcloud iam roles create': (p) => [`Created role [${p.pos[0]}].`, 'etag: BwYk3yq3xg8=', `name: projects/${one(p, 'project') ?? 'ace-lab-123'}/roles/${p.pos[0]}`, 'stage: GA', `title: ${p.pos[0]}`],
  'gcloud iam roles copy': (p) => [`Created role [${one(p, 'destination')}].`, `name: projects/${one(p, 'dest-project')}/roles/${one(p, 'destination')}`],
  'gcloud iam service-accounts create': (p) => [`Created service account [${p.pos[0]}].`],
  'gcloud iam service-accounts keys list': () => table(['KEY_ID', 'CREATED_AT', 'EXPIRES_AT', 'DISABLED'], [['3f1c2a9b7d8e6f50413ab21c9d7e8f60a1b2c3d4', '2026-10-01T04:20:11Z', '9999-12-31T23:59:59Z', ''], ['9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b', '2026-09-30T10:00:00Z', '2026-10-02T10:00:00Z', '']]),
  'gcloud iam service-accounts keys create': (p) => [`created key [5c1e0f3a2b9d8c7e6f5a4b3c2d1e0f9a8b7c6d5e] of type [json] as [${p.pos[0]}] for [${one(p, 'iam-account')}]`],
  'gcloud iam service-accounts add-iam-policy-binding': (p) => [`Updated IAM policy for serviceAccount [${p.pos[0]}].`, ...binding(one(p, 'role')!, one(p, 'member')!)],
  'gcloud iam service-accounts set-iam-policy': (p) => [`Updated IAM policy for serviceAccount [${p.pos[0]}].`, 'bindings:', '- members:', '  - user:ana@example.com', '  role: roles/iam.serviceAccountUser', 'etag: BwYk40Q9l1k=', 'version: 1'],

  // ── compute ──
  'gcloud compute zones list': () => table(['NAME', 'REGION', 'STATUS', 'NEXT_MAINTENANCE', 'TURNDOWN_DATE'], [['us-central1-a', 'us-central1', 'UP', '', ''], ['us-central1-b', 'us-central1', 'UP', '', ''], ['us-central1-c', 'us-central1', 'UP', '', ''], ['us-central1-f', 'us-central1', 'UP', '', ''], ['us-east1-b', 'us-east1', 'UP', '', ''], ['asia-southeast2-a', 'asia-southeast2', 'UP', '', '']]),
  'gcloud compute instances list': (p) =>
    one(p, 'format') === 'json'
      ? ['[', '  {', '    "name": "web-1",', '    "machineType": "https://www.googleapis.com/compute/v1/projects/ace-lab-123/zones/us-central1-a/machineTypes/e2-medium",', '    "status": "RUNNING",', '    "zone": "https://www.googleapis.com/compute/v1/projects/ace-lab-123/zones/us-central1-a"', '  }', ']']
      : table(['NAME', 'ZONE', 'MACHINE_TYPE', 'PREEMPTIBLE', 'INTERNAL_IP', 'EXTERNAL_IP', 'STATUS'], [['web-1', 'us-central1-a', 'e2-medium', '', '10.128.0.2', '34.27.10.11', 'RUNNING'], ['db-1', 'us-central1-a', 'e2-standard-2', '', '10.128.0.3', '', 'RUNNING']]),
  'gcloud compute instances describe': (p, e) => ['canIpForward: false', 'cpuPlatform: Intel Broadwell', `id: '4815162342108'`, `machineType: ${compute(e, `zones/${zoneOf(p, e)}/machineTypes/e2-medium`)}`, `name: ${p.pos[0]}`, 'networkInterfaces:', '- network: …/global/networks/default', '  networkIP: 10.128.0.2', 'serviceAccounts:', `- email: ${PROJECT_NUMBER}-compute@developer.gserviceaccount.com`, 'status: RUNNING', `zone: ${compute(e, `zones/${zoneOf(p, e)}`)}`],
  'gcloud compute instances create': (p, e) => [
    ...p.pos.map((n) => `Created [${compute(e, `zones/${zoneOf(p, e)}/instances/${n}`)}].`),
    ...table(
      ['NAME', 'ZONE', 'MACHINE_TYPE', 'PREEMPTIBLE', 'INTERNAL_IP', 'EXTERNAL_IP', 'STATUS'],
      p.pos.map((n, i) => [n, zoneOf(p, e), one(p, 'machine-type') ?? 'e2-medium', one(p, 'provisioning-model') === 'SPOT' || on(p, 'preemptible') ? 'true' : '', `10.128.0.${10 + i}`, on(p, 'no-address') ? '' : `34.27.10.${20 + i}`, 'RUNNING'])
    )
  ],
  'gcloud compute instances delete': (p, e) => [
    'The following instances will be deleted. Any attached disks configured to be auto-deleted will be deleted unless they are attached to any other instances or the `--keep-disks` flag is given and specifies them for keeping. Deleting a disk is irreversible and any data on the disk will be lost.',
    ...p.pos.map((n) => ` - [${n}] in [${zoneOf(p, e)}]`),
    '',
    ...(on(p, 'quiet') ? [] : ['Do you want to continue (Y/n)?  Y', '']),
    ...p.pos.map((n) => `Deleted [${compute(e, `zones/${zoneOf(p, e)}/instances/${n}`)}].`)
  ],
  'gcloud compute instances stop': (p, e) => [`Stopping instance(s) ${p.pos.join(', ')}...done.`, ...p.pos.map((n) => `Updated [${compute(e, `zones/${zoneOf(p, e)}/instances/${n}`)}].`)],
  'gcloud compute instances start': (p, e) => [`Starting instance(s) ${p.pos.join(', ')}...done.`, ...p.pos.map((n) => `Updated [${compute(e, `zones/${zoneOf(p, e)}/instances/${n}`)}].`)],
  'gcloud compute instances set-machine-type': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/instances/${p.pos[0]}`)}].`],
  'gcloud compute instances set-service-account': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/instances/${p.pos[0]}`)}].`],
  'gcloud compute instances add-metadata': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/instances/${p.pos[0]}`)}].`],
  'gcloud compute project-info add-metadata': (_, e) => [`Updated [https://www.googleapis.com/compute/v1/projects/${e.project}].`],
  'gcloud compute ssh': (p) => [
    ...(on(p, 'tunnel-through-iap') || p.pos[0] === 'db-1' ? ['External IP address was not found; defaulting to using IAP tunneling.'] : []),
    "Warning: Permanently added 'compute.4815162342108' (ED25519) to the list of known hosts.",
    `Linux ${p.pos[0]} 6.1.0-26-cloud-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.112-1 x86_64`,
    '',
    `student@${p.pos[0]}:~$ exit`,
    'logout',
    `Connection to compute.4815162342108 closed. (sesi SSH disimulasikan)`
  ],
  'gcloud compute disks snapshot': (p) => [`Creating snapshot(s) ${one(p, 'snapshot-names') ?? `${p.pos[0]}-20261018021500`}...done.`],
  'gcloud compute snapshots delete': (p, e) => ['The following snapshots will be deleted:', ...p.pos.map((n) => ` - [${n}]`), '', 'Do you want to continue (Y/n)?  Y', '', ...p.pos.map((n) => `Deleted [${compute(e, `global/snapshots/${n}`)}].`)],
  'gcloud compute resource-policies create snapshot-schedule': (p, e) => [`Created [${compute(e, `regions/${regionOf(p, e)}/resourcePolicies/${p.pos[0]}`)}].`],
  'gcloud compute disks add-resource-policies': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/disks/${p.pos[0]}`)}].`],
  'gcloud compute disks resize': (p, e) => ['This command increases disk size. This change is not reversible.', 'For more information, see:', 'https://cloud.google.com/sdk/gcloud/reference/compute/disks/resize', '', 'Do you want to continue (Y/n)?  Y', '', `Updated [${compute(e, `zones/${zoneOf(p, e)}/disks/${p.pos[0]}`)}].`],
  'gcloud compute images create': (p, e) => [`Created [${compute(e, `global/images/${p.pos[0]}`)}].`, ...table(['NAME', 'PROJECT', 'FAMILY', 'DEPRECATED', 'STATUS'], [[p.pos[0], e.project, one(p, 'family') ?? '', '', 'READY']])],
  'gcloud compute images list': () => table(['NAME', 'PROJECT', 'FAMILY', 'DEPRECATED', 'STATUS'], [['windows-server-2025-dc-v20261008', 'windows-cloud', 'windows-2025', '', 'READY'], ['windows-server-2022-dc-v20261008', 'windows-cloud', 'windows-2022', '', 'READY'], ['windows-server-2019-dc-v20261008', 'windows-cloud', 'windows-2019', '', 'READY']]),
  'gcloud compute instance-templates create': (p, e) => [`Created [${compute(e, `global/instanceTemplates/${p.pos[0]}`)}].`, ...table(['NAME', 'MACHINE_TYPE', 'PREEMPTIBLE', 'CREATION_TIMESTAMP'], [[p.pos[0], one(p, 'machine-type') ?? 'n1-standard-1', '', '2026-10-18T02:20:41.118-07:00']])],
  'gcloud compute instance-groups managed create': (p, e) => {
    const loc = one(p, 'region') ? `regions/${one(p, 'region')}` : `zones/${zoneOf(p, e)}`;
    return [`Created [${compute(e, `${loc}/instanceGroupManagers/${p.pos[0]}`)}].`, ...table(['NAME', 'LOCATION', 'SCOPE', 'BASE_INSTANCE_NAME', 'SIZE', 'TARGET_SIZE', 'INSTANCE_TEMPLATE', 'AUTOSCALED'], [[p.pos[0], tail(loc), one(p, 'region') ? 'region' : 'zone', p.pos[0], '0', one(p, 'size')!, one(p, 'template')!, 'no']])];
  },
  'gcloud compute instance-groups managed set-autoscaling': (p, e) => [`Created [${compute(e, `zones/${zoneOf(p, e)}/autoscalers/${p.pos[0]}-x7k2`)}].`, '---', 'autoscalingPolicy:', `  coolDownPeriodSec: 60`, '  cpuUtilization:', `    utilizationTarget: ${one(p, 'target-cpu-utilization')}`, `  maxNumReplicas: ${one(p, 'max-num-replicas')}`, `  minNumReplicas: ${one(p, 'min-num-replicas') ?? 1}`, '  mode: ON'],
  'gcloud compute instance-groups managed rolling-action start-update': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/instanceGroupManagers/${p.pos[0]}`)}].`, '---', 'updatePolicy:', '  maxSurge:', '    fixed: 1', '  maxUnavailable:', '    fixed: 1', '  type: PROACTIVE', 'versions:', `- instanceTemplate: ${compute(e, `global/instanceTemplates/${one(p, 'version')!.split(',')[0].split('=')[1]}`)}`],
  'gcloud compute instance-groups managed resize': (p, e) => table(['NAME', 'LOCATION', 'SCOPE', 'BASE_INSTANCE_NAME', 'SIZE', 'TARGET_SIZE', 'INSTANCE_TEMPLATE', 'AUTOSCALED'], [[p.pos[0], zoneOf(p, e), 'zone', p.pos[0], '3', one(p, 'size')!, 'web-tpl', 'no']]),
  'gcloud compute instance-groups managed update': (p, e) => [`Updated [${compute(e, `zones/${zoneOf(p, e)}/instanceGroupManagers/${p.pos[0]}`)}].`],

  // ── network ──
  'gcloud compute networks create': (p, e) => [
    `Created [${compute(e, `global/networks/${p.pos[0]}`)}].`,
    ...table(['NAME', 'SUBNET_MODE', 'BGP_ROUTING_MODE', 'IPV4_RANGE', 'GATEWAY_IPV4'], [[p.pos[0], (one(p, 'subnet-mode') ?? 'auto').toUpperCase(), (one(p, 'bgp-routing-mode') ?? 'regional').toUpperCase(), '', '']]),
    '',
    'Instances on this network will not be reachable until firewall rules',
    'are created. As an example, you can allow all internal traffic between',
    'instances as well as SSH, RDP, and ICMP by running:',
    '',
    `$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${p.pos[0]} --allow tcp,udp,icmp --source-ranges <IP_RANGE>`,
    `$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${p.pos[0]} --allow tcp:22,tcp:3389,icmp`
  ],
  'gcloud compute networks subnets create': (p, e) => [`Created [${compute(e, `regions/${regionOf(p, e)}/subnetworks/${p.pos[0]}`)}].`, ...table(['NAME', 'REGION', 'NETWORK', 'RANGE', 'STACK_TYPE', 'IPV6_ACCESS_TYPE', 'INTERNAL_IPV6_PREFIX', 'EXTERNAL_IPV6_PREFIX'], [[p.pos[0], regionOf(p, e), one(p, 'network')!, one(p, 'range') ?? '', 'IPV4_ONLY', '', '', '']])],
  'gcloud compute networks subnets expand-ip-range': (p, e) => [`Updated [${compute(e, `regions/${regionOf(p, e)}/subnetworks/${p.pos[0]}`)}].`],
  'gcloud compute networks subnets update': (p, e) => [`Updated [${compute(e, `regions/${regionOf(p, e)}/subnetworks/${p.pos[0]}`)}].`],
  'gcloud compute firewall-rules create': (p, e) => {
    const allow = one(p, 'allow') ?? '';
    const deny = one(p, 'action') === 'DENY' ? (one(p, 'rules') ?? '') : '';
    const dir = (one(p, 'direction') ?? 'INGRESS').toUpperCase().replace(/^IN$/, 'INGRESS').replace(/^OUT$/, 'EGRESS');
    return [`Creating firewall...⠹Created [${compute(e, `global/firewalls/${p.pos[0]}`)}].`, 'done.', ...table(['NAME', 'NETWORK', 'DIRECTION', 'PRIORITY', 'ALLOW', 'DENY', 'DISABLED'], [[p.pos[0], one(p, 'network') ?? 'default', dir, one(p, 'priority') ?? '1000', one(p, 'action') === 'DENY' ? '' : allow || (one(p, 'rules') ?? ''), deny, 'False']])];
  },
  'gcloud compute firewall-rules list': () => [
    ...table(['NAME', 'NETWORK', 'DIRECTION', 'PRIORITY', 'ALLOW', 'DENY', 'DISABLED'], [['allow-http', 'prod-vpc', 'INGRESS', '1000', 'tcp:80', '', 'False'], ['allow-iap-ssh', 'prod-vpc', 'INGRESS', '1000', 'tcp:22', '', 'False'], ['default-allow-internal', 'default', 'INGRESS', '65534', 'tcp:0-65535,udp:0-65535,icmp', '', 'False']]),
    '',
    'To show all fields of the firewall, please show in JSON format: --format=json',
    'To show all fields in table format, please see the examples in --help.'
  ],
  'gcloud compute addresses create': (p, e) => p.pos.map((n) => `Created [${compute(e, on(p, 'global') ? `global/addresses/${n}` : `regions/${regionOf(p, e)}/addresses/${n}`)}].`),
  'gcloud compute networks peerings create': (p, e) => [`Updated [${compute(e, `global/networks/${one(p, 'network')}`)}].`, '---', 'peerings:', `- name: ${p.pos[0]}`, `  network: ${compute(e, `global/networks/${one(p, 'peer-network')}`)}`, '  state: INACTIVE', '  stateDetails: \'[2026-10-18T02:31:10.116-07:00]: Waiting for peer network to connect.\''],
  'gcloud compute routers create': (p, e) => [`Creating router [${p.pos[0]}]...done.`, ...table(['NAME', 'REGION', 'NETWORK'], [[p.pos[0], regionOf(p, e), one(p, 'network')!]])],
  'gcloud compute routers nats create': (p) => [`Creating NAT [${p.pos[0]}] in router [${one(p, 'router')}]...done.`],
  'gcloud dns managed-zones create': (p, e) => [`Created [https://dns.googleapis.com/dns/v1/projects/${e.project}/managedZones/${p.pos[0]}].`],
  'gcloud dns record-sets create': (p) => table(['NAME', 'TYPE', 'TTL', 'DATA'], [[p.pos[0].endsWith('.') ? p.pos[0] : `${p.pos[0]}.`, one(p, 'type')!, one(p, 'ttl') ?? '300', one(p, 'rrdatas') ?? '']]),
  'gcloud compute health-checks create http': (p, e) => [`Created [${compute(e, `global/healthChecks/${p.pos[0]}`)}].`, ...table(['NAME', 'PROTOCOL'], [[p.pos[0], 'HTTP']])],
  'gcloud compute backend-services create': (p, e) => [`Created [${compute(e, `global/backendServices/${p.pos[0]}`)}].`, ...table(['NAME', 'BACKENDS', 'PROTOCOL'], [[p.pos[0], '', one(p, 'protocol') ?? 'HTTP']])],
  'gcloud compute backend-services add-backend': (p, e) => [`Updated [${compute(e, `global/backendServices/${p.pos[0]}`)}].`],
  'gcloud compute url-maps create': (p, e) => [`Created [${compute(e, `global/urlMaps/${p.pos[0]}`)}].`, ...table(['NAME', 'DEFAULT_SERVICE'], [[p.pos[0], `backendServices/${one(p, 'default-service')}`]])],
  'gcloud compute target-http-proxies create': (p, e) => [`Created [${compute(e, `global/targetHttpProxies/${p.pos[0]}`)}].`, ...table(['NAME', 'URL_MAP'], [[p.pos[0], one(p, 'url-map')!]])],
  'gcloud compute forwarding-rules create': (p, e) => [`Created [${compute(e, `global/forwardingRules/${p.pos[0]}`)}].`],
  'gcloud compute network-endpoint-groups create': (p, e) => [`Created [${compute(e, `regions/${regionOf(p, e)}/networkEndpointGroups/${p.pos[0]}`)}].`, `Created network endpoint group [${p.pos[0]}].`],
  'gcloud compute security-policies rules create': (p, e) => [`Updated [${compute(e, `global/securityPolicies/${one(p, 'security-policy')}`)}].`],

  // ── GKE and Artifact Registry ──
  'gcloud container clusters create-auto': (p, e) => clusterCreate(p.pos[0], one(p, 'region') ?? e.region, e, 'Autopilot'),
  'gcloud container clusters create': (p, e) => clusterCreate(p.pos[0], one(p, 'region') ?? zoneOf(p, e), e, one(p, 'machine-type') ?? 'e2-medium', one(p, 'num-nodes') ?? '3'),
  'gcloud container clusters list': () => table(['NAME', 'LOCATION', 'MASTER_VERSION', 'MASTER_IP', 'MACHINE_TYPE', 'NODE_VERSION', 'NUM_NODES', 'STATUS'], [['std-1', 'us-central1-a', '1.34.1-gke.1080000', '34.118.40.12', 'e2-medium', '1.34.1-gke.1080000', '3', 'RUNNING'], ['auto-1', 'us-central1', '1.34.1-gke.1080000', '34.70.12.9', 'e2-small', '1.34.1-gke.1080000', '3', 'RUNNING']]),
  'gcloud container clusters get-credentials': (p) => ['Fetching cluster endpoint and auth data.', `kubeconfig entry generated for ${p.pos[0]}.`],
  'gcloud container node-pools create': (p, e) => [`Creating node pool ${p.pos[0]}...done.`, `Created [https://container.googleapis.com/v1/projects/${e.project}/zones/${zoneOf(p, e)}/clusters/${one(p, 'cluster')}/nodePools/${p.pos[0]}].`, ...table(['NAME', 'MACHINE_TYPE', 'DISK_SIZE_GB', 'NODE_VERSION'], [[p.pos[0], one(p, 'machine-type') ?? 'e2-medium', '100', '1.34.1-gke.1080000']])],
  'gcloud container clusters resize': (p, e) => [`Pool [${one(p, 'node-pool') ?? 'default-pool'}] for [${p.pos[0]}] will be resized to ${one(p, 'num-nodes') ?? one(p, 'size')} node(s) in each zone it spans.`, '', 'Do you want to continue (Y/n)?  Y', '', `Resizing ${p.pos[0]}...done.`, `Updated [https://container.googleapis.com/v1/projects/${e.project}/zones/${zoneOf(p, e)}/clusters/${p.pos[0]}].`],
  'gcloud container clusters update': (p, e) => [`Updating ${p.pos[0]}...done.`, `Updated [https://container.googleapis.com/v1/projects/${e.project}/zones/${zoneOf(p, e)}/clusters/${p.pos[0]}].`],
  'gcloud container node-pools update': (p) => [`Updating node pool ${p.pos[0]}...done.`],
  'gcloud container clusters upgrade': (p) => [`Master of cluster [${p.pos[0]}] will be upgraded from version [1.33.5-gke.1080000] to version [1.34.1-gke.1080000]. This operation is long-running and will block other operations on the cluster (including delete) until it has run to completion.`, '', 'Do you want to continue (Y/n)?  Y', '', `Upgrading ${p.pos[0]}...done.`],
  'gcloud container clusters delete': (p, e) => ['The following clusters will be deleted.', ...p.pos.map((n) => ` - [${n}] in [${zoneOf(p, e)}]`), '', 'Do you want to continue (Y/n)?  Y', '', ...p.pos.map((n) => `Deleting cluster ${n}...done.`), ...p.pos.map((n) => `Deleted [https://container.googleapis.com/v1/projects/${e.project}/zones/${zoneOf(p, e)}/clusters/${n}].`)],
  'gcloud artifacts repositories create': (p, e) => [`Create request issued for: [${p.pos[0]}]`, `Waiting for operation [projects/${e.project}/locations/${one(p, 'location')}/operations/7d2c1b0a-9f8e] to complete...done.`, `Created repository [${p.pos[0]}].`],
  'gcloud artifacts docker tags list': (p) => {
    const [loc, project, repo, pkg] = p.pos[0].replace('-docker.pkg.dev', '').split('/');
    return [`Listing items under project ${project}, location ${loc}, repository ${repo}, package ${pkg}.`, '', ...table(['TAG', 'IMAGE', 'DIGEST'], [['v1', p.pos[0], 'sha256:3f6a1b2c4d5e…'], ['v2', p.pos[0], 'sha256:9c8b7a6d5e4f…']])];
  },
  'gcloud artifacts repositories add-iam-policy-binding': (p) => [`Updated IAM policy for repository [${p.pos[0]}].`, ...binding(one(p, 'role')!, one(p, 'member')!)],
  'gcloud builds submit': (p, e) => [
    'Creating temporary archive of 6 file(s) totalling 4.1 KiB before compression.',
    `Uploading tarball of [${p.pos[0] ?? '.'}] to [gs://${e.project}_cloudbuild/source/1760754600.1-4f2a.tgz]`,
    `Created [https://cloudbuild.googleapis.com/v1/projects/${e.project}/locations/global/builds/4f2a9c1e-7b3d].`,
    'Step #0: Successfully built 8e1f0c2a7b3d',
    `Step #0: Successfully tagged ${one(p, 'tag')}`,
    'PUSH',
    `Pushing ${one(p, 'tag')}`,
    'DONE',
    '----------------------------------------------------------------------------------------------',
    ...table(['ID', 'CREATE_TIME', 'DURATION', 'SOURCE', 'IMAGES', 'STATUS'], [['4f2a9c1e-7b3d', '2026-10-18T02:40:00+00:00', '41S', `gs://${e.project}_cloudbuild/source/1760754600.1-4f2a.tgz`, one(p, 'tag') ?? '-', 'SUCCESS']])
  ],

  // ── serverless ──
  'gcloud run deploy': (p, e) => runDeploy(p, e),
  'gcloud run services update-traffic': (p) => ['Updating traffic...done.', `URL: https://${p.pos[0]}-${PROJECT_NUMBER}.us-central1.run.app`, 'Traffic:', ...(on(p, 'to-latest') ? ['  100% LATEST (currently api-00002-xyz)'] : (one(p, 'to-revisions') ?? '').split(',').map((x) => `  ${x.split('=')[1].padStart(3)}% ${x.split('=')[0]}`))],
  'gcloud run services add-iam-policy-binding': (p) => [`Updated IAM policy for service [${p.pos[0]}].`, ...binding(one(p, 'role')!, one(p, 'member')!)],
  'gcloud run services update': (p) => [`Deploying...`, '  Creating Revision...done', '  Routing traffic...done', 'Done.', `Service [${p.pos[0]}] revision [${p.pos[0]}-00003-q8m] has been deployed and is serving 100 percent of traffic.`, `Service URL: https://${p.pos[0]}-${PROJECT_NUMBER}.us-central1.run.app`],
  'gcloud run jobs create': (p, e) => [`Creating Cloud Run job [${p.pos[0]}] in project [${e.project}] region [${one(p, 'region')}]`, 'OK Creating job... Done.', 'Done.', `Job [${p.pos[0]}] has successfully been created.`, '', 'To execute this job, use:', `gcloud run jobs execute ${p.pos[0]}`],
  'gcloud run jobs execute': (p) => [`OK Creating execution... Done.`, 'Done.', `Execution [${p.pos[0]}-x7k2p] has successfully started running.`],
  'gcloud functions deploy': (p, e) => [
    'Preparing function...done.',
    'Deploying function...',
    '  [Build] Logs are available at [https://console.cloud.google.com/cloud-build/builds;region=us-central1/…]',
    '  [Service]',
    '  [Trigger]',
    'Done.',
    `You can view your function in the Cloud Console here: https://console.cloud.google.com/functions/details/${one(p, 'region')}/${p.pos[0]}?project=${e.project}`,
    '',
    'buildConfig:',
    `  runtime: ${one(p, 'runtime')}`,
    'environment: GEN_2',
    `name: projects/${e.project}/locations/${one(p, 'region')}/functions/${p.pos[0]}`,
    'state: ACTIVE',
    ...(on(p, 'trigger-http')
      ? [`url: https://${one(p, 'region')}-${e.project}.cloudfunctions.net/${p.pos[0]}`]
      : ['eventTrigger:', `  eventType: ${one(p, 'trigger-bucket') ? 'google.cloud.storage.object.v1.finalized' : 'google.cloud.pubsub.topic.v1.messagePublished'}`])
  ],
  'gcloud app create': (p, e) => [`You are creating an app for project [${e.project}].`, 'WARNING: Creating an App Engine application for a project is irreversible and the region', 'cannot be changed. More information about regions is at', '<https://cloud.google.com/appengine/docs/locations>.', '', `Creating App Engine application in project [${e.project}] and region [${one(p, 'region')}]....done.`, 'Success! The app is now created. Please use `gcloud app deploy` to deploy your first app.'],
  'gcloud app deploy': (p, e) => {
    const project = one(p, 'project') ?? e.project;
    const v = one(p, 'version') ?? '20261018t024500';
    const promote = one(p, 'promote') !== 'false';
    const url = promote ? `https://${project}.uc.r.appspot.com` : `https://${v}-dot-${project}.uc.r.appspot.com`;
    return [
      'Services to deploy:',
      '',
      'descriptor:                  [/home/student/app.yaml]',
      'source:                      [/home/student]',
      `target project:              [${project}]`,
      'target service:              [default]',
      `target version:              [${v}]`,
      `target url:                  [${url}]`,
      `target service account:      [${project}@appspot.gserviceaccount.com]`,
      '',
      ...(promote ? [] : ['     (add --promote if you also want to make this service available from', `     [https://${project}.uc.r.appspot.com])`, '']),
      'Do you want to continue (Y/n)?  Y',
      '',
      'Beginning deployment of service [default]...',
      'Uploading 3 files to Google Cloud Storage',
      'File upload done.',
      'Updating service [default]...done.',
      ...(promote ? ['Setting traffic split for service [default]...done.'] : []),
      `Deployed service [default] to [${url}]`
    ];
  },
  'gcloud app services set-traffic': (p, e) => [
    'Setting the following traffic allocation:',
    ...(one(p, 'splits') ?? '').split(',').map((s) => ` - ${e.project}/${p.pos[0] ?? 'default'}/${s.split('=')[0]}: ${s.split('=')[1]}`),
    'NOTE: Splitting traffic by origin IP address.',
    'Any other versions of the specified service will receive zero traffic.',
    'Do you want to continue (Y/n)?  Y',
    '',
    `Setting traffic split for service [${p.pos[0] ?? 'default'}]...done.`
  ],
  'gcloud app versions list': () => table(['SERVICE', 'VERSION.ID', 'TRAFFIC_SPLIT', 'LAST_DEPLOYED', 'SERVING_STATUS'], [['default', 'v1', '0.90', '2026-10-10T09:12:01+00:00', 'SERVING'], ['default', 'v2', '0.10', '2026-10-18T02:45:00+00:00', 'SERVING']]),
  'gcloud app browse': (_, e) => ['Did not detect your browser. Go to this link to view your app:', `https://${e.project}.uc.r.appspot.com`],
  'gcloud app logs read': () => ['2026-10-18 02:46:01 default[v2]  "GET / HTTP/1.1" 200', '2026-10-18 02:46:03 default[v2]  INFO:root:Handled request in 12 ms', '2026-10-18 02:46:09 default[v1]  "GET /favicon.ico HTTP/1.1" 404'],

  // ── Pub/Sub, logging, scheduler ──
  'gcloud pubsub topics create': (p, e) => p.pos.map((t) => `Created topic [projects/${e.project}/topics/${t}].`),
  'gcloud pubsub subscriptions create': (p, e) => p.pos.map((s) => `Created subscription [projects/${e.project}/subscriptions/${s}].`),
  'gcloud pubsub topics publish': () => ['messageIds:', "- '17406539821904512'"],
  'gcloud pubsub subscriptions pull': () => table(['DATA', 'MESSAGE_ID', 'ORDERING_KEY', 'ATTRIBUTES', 'DELIVERY_ATTEMPT', 'ACK_STATUS'], [['hello', '17406539821904512', '', '', '', 'SUCCESS'], ['order 4471 paid', '17406539821904513', '', 'source=web', '', 'SUCCESS']]),
  'gcloud scheduler jobs create http': (p, e) => [`httpTarget:`, `  httpMethod: ${one(p, 'http-method') ?? 'POST'}`, '  oidcToken:', `    serviceAccountEmail: ${one(p, 'oidc-service-account-email')}`, `  uri: ${one(p, 'uri')}`, `name: projects/${e.project}/locations/${one(p, 'location')}/jobs/${p.pos[0]}`, `schedule: ${one(p, 'schedule')}`, 'state: ENABLED', 'timeZone: Etc/UTC'],
  'gcloud logging logs list': (_, e) => ['NAME', `projects/${e.project}/logs/cloudaudit.googleapis.com%2Factivity`, `projects/${e.project}/logs/cloudaudit.googleapis.com%2Fdata_access`, `projects/${e.project}/logs/run.googleapis.com%2Frequests`, `projects/${e.project}/logs/run.googleapis.com%2Fstderr`, `projects/${e.project}/logs/syslog`],
  'gcloud logging read': (_, e) => ['---', 'insertId: 1n2b3c4d5e', `logName: projects/${e.project}/logs/run.googleapis.com%2Fstderr`, 'resource:', '  labels:', '    service_name: api', '  type: cloud_run_revision', 'severity: ERROR', "textPayload: 'ConnectionError: could not reach orders-db (i/o timeout)'", "timestamp: '2026-10-18T02:47:12.442Z'"],
  'gcloud logging sinks create': (p, e) => [`Created [https://logging.googleapis.com/v2/projects/${e.project}/sinks/${p.pos[0]}].`, `Please remember to grant \`serviceAccount:service-${PROJECT_NUMBER}@gcp-sa-logging.iam.gserviceaccount.com\` the BigQuery Data Editor role on the dataset.`, 'More information about sinks can be found at https://cloud.google.com/logging/docs/export/configure_export'],
  'gcloud logging buckets update': (p) => [`Updated bucket [${p.pos[0]}].`],
  'gcloud logging metrics create': (p) => [`Created [${p.pos[0]}].`],

  // ── SQL, KMS, secrets, DM ──
  'gcloud sql instances create': (p, e) => [
    `Creating Cloud SQL instance for ${one(p, 'database-version') ?? 'MYSQL_8_0'}...done.`,
    `Created [https://sqladmin.googleapis.com/sql/v1beta4/projects/${e.project}/instances/${p.pos[0]}].`,
    ...table(['NAME', 'DATABASE_VERSION', 'LOCATION', 'TIER', 'PRIMARY_ADDRESS', 'PRIVATE_ADDRESS', 'STATUS'], [[p.pos[0], one(p, 'database-version') ?? 'MYSQL_8_0', `${one(p, 'region') ?? 'us-central1'}-b`, one(p, 'tier') ?? 'db-custom-2-7680', '34.67.21.180', '-', 'RUNNABLE']])
  ],
  'gcloud sql instances patch': (p, e) => ['The following message will be used for the patch API method.', `{"name": "${p.pos[0]}", "project": "${e.project}", "settings": {…}}`, 'Patching Cloud SQL instance...done.', `Updated [https://sqladmin.googleapis.com/sql/v1beta4/projects/${e.project}/instances/${p.pos[0]}].`],
  'gcloud sql connect': (p) => ['Allowlisting your IP for incoming connection for 5 minutes...done.', `Connecting to database with SQL user [${one(p, 'user') ?? 'root'}].Enter password: ••••••••`, 'Welcome to the MySQL monitor.  Commands end with ; or \\g.', 'mysql> exit', 'Bye'],
  'gcloud sql backups create': (p) => [`Backing up Cloud SQL instance...done.`, `[https://sqladmin.googleapis.com/sql/v1beta4/projects/ace-lab-123/instances/${one(p, 'instance')}] backed up.`],
  'gcloud sql export sql': (p, e) => ['Exporting Cloud SQL instance...done.', `Exported [https://sqladmin.googleapis.com/sql/v1beta4/projects/${e.project}/instances/${p.pos[0]}] to [${p.pos[1]}].`],
  'gcloud sql import sql': (p, e) => [`Data from [${p.pos[1]}] will be imported to [${p.pos[0]}].`, '', 'Do you want to continue (Y/n)?  Y', '', 'Importing data into Cloud SQL instance...done.', `Imported data from [${p.pos[1]}] into [https://sqladmin.googleapis.com/sql/v1beta4/projects/${e.project}/instances/${p.pos[0]}].`],
  'gcloud kms decrypt': (p) => [`(tidak ada output — plaintext ditulis ke ${one(p, 'plaintext-file')})`],
  'gcloud kms keys create': () => [],
  'gcloud secrets create': (p) => [`Created version [1] of the secret [${p.pos[0]}].`],
  'gcloud secrets versions access': () => ['s3cr3t-Pa55w0rd'],
  'gcloud secrets add-iam-policy-binding': (p) => [`Updated IAM policy for secret [${p.pos[0]}].`, ...binding(one(p, 'role')!, one(p, 'member')!)],
  'gcloud deployment-manager deployments create': (p, e) => [
    'WARNING: Cloud Deployment Manager reached end of support on March 31, 2026. (catatan lab)',
    `The fingerprint of the deployment is b'8XhOAqk3Jq…'`,
    `Waiting for create [operation-1760755000123-6412f-${e.project}]...done.`,
    `Create operation operation-1760755000123-6412f completed successfully.`,
    ...table(['NAME', 'TYPE', 'STATE', 'ERRORS', 'INTENT'], [[`${p.pos[0]}-vm`, 'compute.v1.instance', on(p, 'preview') ? 'IN_PREVIEW' : 'COMPLETED', '[]', on(p, 'preview') ? 'CREATE_OR_ACQUIRE' : '']])
  ],
  'gcloud deployment-manager deployments update': (p) => [`Waiting for update [operation-1760755111222-6412f]...done.`, 'Update operation operation-1760755111222-6412f completed successfully.', ...table(['NAME', 'TYPE', 'STATE', 'ERRORS', 'INTENT'], [[`${p.pos[0]}-vm`, 'compute.v1.instance', 'COMPLETED', '[]', '']])],

  // ── gcloud storage ──
  'gcloud storage buckets create': (p) => p.pos.map((b) => `Creating ${b.replace(/\/?$/, '/')}...`),
  'gcloud storage ls': (p) => (one(p, 'impersonate-service-account') ? ['gs://ace-assets-123/', 'gs://ace-backups/'] : ['gs://ace-assets-123/logo.png', 'gs://ace-assets-123/report.pdf', 'gs://ace-assets-123/site/']),
  'gcloud storage objects describe': (p) => ['bucket: ace-assets-123', 'content_type: image/png', "crc32c_hash: 'yZRlqg=='", "creation_time: 2026-10-17T03:12:44+0000", "md5_hash: '3kV0bqNEuQ5KJ7yjQ3Xg9w=='", `name: ${p.pos[0].replace(/^gs:\/\/[^/]+\//, '')}`, 'size: 20480', 'storage_class: STANDARD', `storage_url: ${p.pos[0]}#1760670764120411`],
  'gcloud storage cp': (p) => [`Copying file://${p.pos[0].replace(/^\.\//, '')}/index.html to ${p.pos[p.pos.length - 1].replace(/\/$/, '')}/site/index.html`, `Copying file://${p.pos[0].replace(/^\.\//, '')}/style.css to ${p.pos[p.pos.length - 1].replace(/\/$/, '')}/site/style.css`, '  Completed files 3/3 | 12.4kiB/12.4kiB'],
  'gcloud storage rsync': () => ['Building synchronization state...', 'Starting synchronization...', 'Copying file://./site/index.html to gs://ace-assets-123/site/index.html', '  Completed files 1 | 4.1kiB'],
  'gcloud storage mv': (p) => [`Copying ${p.pos[0]} to ${p.pos[1]}`, `Removing ${p.pos[0]}...`, '  Completed files 1/1 | 18.0B/18.0B'],
  'gcloud storage rm': (p) => ['Removing objects:', `Removing ${p.pos[0]}/a.txt#1760670764120411...`, `Removing ${p.pos[0]}/b.txt#1760670764120412...`, '  Completed 2/2', 'Removing buckets:', `Removing ${p.pos[0]}/...`, '  Completed 1/1'],
  'gcloud storage buckets update': (p) => [`Updating ${p.pos[0].replace(/\/?$/, '/')}...`, '  Completed 1'],
  'gcloud storage objects update': (p) => [`Patching ${p.pos[0]}#1760670764120411...`, '  Completed 1'],
  'gcloud storage buckets add-iam-policy-binding': (p) => ['bindings:', '- members:', '  - projectEditor:ace-lab-123', '  - projectOwner:ace-lab-123', '  role: roles/storage.legacyBucketOwner', '- members:', `  - ${one(p, 'member')}`, `  role: ${one(p, 'role')}`, 'etag: CAI=', 'version: 1'],
  'gcloud storage sign-url': (p) => ['---', `expiration: '2026-10-18 03:05:00'`, 'http_verb: GET', `resource: ${p.pos[0]}`, `signed_url: https://storage.googleapis.com/${p.pos[0].replace('gs://', '')}?x-goog-signature=7a3c…&x-goog-algorithm=GOOG4-RSA-SHA256&x-goog-expires=600`],
  'gcloud storage buckets notifications create': (p, e) => ['etag: \'1\'', `id: '1'`, 'kind: storage#notification', 'payload_format: JSON_API_V1', `selfLink: https://www.googleapis.com/storage/v1/b/${p.pos[0].replace('gs://', '')}/notificationConfigs/1`, `topic: //pubsub.googleapis.com/projects/${e.project}/topics/${one(p, 'topic')}`],
  'gcloud storage du': (p) => [`48.2MiB      ${p.pos[0]}`],

  // ── gsutil ──
  'gsutil mb': (p) => p.pos.map((b) => `Creating ${b.replace(/\/?$/, '/')}...`),
  'gsutil ls': () => ['gs://ace-assets-123/logo.png', 'gs://ace-assets-123/report.pdf', 'gs://ace-assets-123/site/'],
  'gsutil stat': (p) => [`${p.pos[0]}:`, '    Creation time:          Fri, 17 Oct 2026 03:12:44 GMT', '    Update time:            Fri, 17 Oct 2026 03:12:44 GMT', '    Storage class:          STANDARD', '    Content-Length:         20480', '    Content-Type:           image/png', '    Hash (crc32c):          yZRlqg==', '    Hash (md5):             3kV0bqNEuQ5KJ7yjQ3Xg9w==', '    ETag:                   CJuP5+/0hpEDEAE=', '    Generation:             1760670764120411', '    Metageneration:         1'],
  'gsutil cp': (p) => [`Copying file://${p.pos[0]}/index.html [Content-Type=text/html]...`, `Copying file://${p.pos[0]}/style.css [Content-Type=text/css]...`, '/ [3/3 files][ 12.4 KiB/ 12.4 KiB] 100% Done', 'Operation completed over 3 objects/12.4 KiB.'],
  'gsutil rsync': () => ['Building synchronization state...', 'Starting synchronization...', 'Copying file://./site/index.html [Content-Type=text/html]...', '/ [1 files][  4.1 KiB/  4.1 KiB]', 'Operation completed over 1 objects/4.1 KiB.'],
  'gsutil mv': (p) => [`Copying ${p.pos[0]} [Content-Type=text/plain]...`, `Removing ${p.pos[0]}...`, '/ [1 files][   18.0 B/   18.0 B]', 'Operation completed over 1 objects/18.0 B.'],
  'gsutil rm': (p) => [`Removing ${p.pos[0]}/a.txt#1760670764120411...`, `Removing ${p.pos[0]}/b.txt#1760670764120412...`, '/ [2 objects]', 'Operation completed over 2 objects.', `Removing ${p.pos[0].replace(/\/?$/, '/')}...`],
  'gsutil lifecycle set': (p) => [`Setting lifecycle configuration on ${p.pos[1].replace(/\/?$/, '/')}...`],
  'gsutil versioning set': (p) => [`${p.pos[0] === 'on' ? 'Enabling' : 'Suspending'} versioning for ${p.pos[1].replace(/\/?$/, '/')}...`],
  'gsutil defstorageclass set': (p) => [`Setting default storage class to "${p.pos[0].toUpperCase()}" for bucket ${p.pos[1].replace(/\/$/, '')}`],
  'gsutil rewrite': () => ['- [1 files][ 20.0 KiB/ 20.0 KiB]', 'Operation completed over 1 objects/20.0 KiB.'],
  'gsutil iam ch': () => [],
  'gsutil signurl': (p) => ['URL\tHTTP Method\tExpiration\tSigned URL', `${p.pos[1]}\tGET\t2026-10-18 03:05:00\thttps://storage.googleapis.com/${p.pos[1].replace('gs://', '')}?x-goog-signature=7a3c…`],
  'gsutil retention set': (p) => [`Setting Retention Policy on ${p.pos[1].replace(/\/?$/, '/')}...`],
  'gsutil notification create': (p, e) => [`Created Cloud Pub/Sub topic projects/${e.project}/topics/${one(p, 't')}`, `Created notification config projects/_/buckets/${p.pos[0].replace('gs://', '').replace(/\/$/, '')}/notificationConfigs/1`],
  'gsutil web set': (p) => [`Setting website configuration on ${p.pos[0].replace(/\/?$/, '/')}...`],
  'gsutil du': (p) => [`50573312     ${p.pos[0]}`],

  // ── kubectl ──
  'kubectl config get-contexts': () => ktable(['CURRENT', 'NAME', 'CLUSTER', 'AUTHINFO', 'NAMESPACE'], [['*', 'gke_ace-lab-123_us-central1-a_std-1', 'gke_ace-lab-123_us-central1-a_std-1', 'gke_ace-lab-123_us-central1-a_std-1', 'default'], ['', 'gke_ace-lab-123_us-central1_auto-1', 'gke_ace-lab-123_us-central1_auto-1', 'gke_ace-lab-123_us-central1_auto-1', '']]),
  'kubectl config current-context': () => ['gke_ace-lab-123_us-central1-a_std-1'],
  'kubectl config use-context': (p) => [`Switched to context "${p.pos[0]}".`],
  'kubectl config view': () => ['apiVersion: v1', 'clusters:', '- cluster:', '    certificate-authority-data: DATA+OMITTED', '    server: https://34.118.40.12', '  name: gke_ace-lab-123_us-central1-a_std-1', 'contexts:', '- context:', '    cluster: gke_ace-lab-123_us-central1-a_std-1', '    user: gke_ace-lab-123_us-central1-a_std-1', '  name: gke_ace-lab-123_us-central1-a_std-1', 'current-context: gke_ace-lab-123_us-central1-a_std-1', 'kind: Config', 'users:', '- name: gke_ace-lab-123_us-central1-a_std-1', '  user:', '    exec:', '      command: gke-gcloud-auth-plugin'],
  'kubectl config set-context': () => ['Context "gke_ace-lab-123_us-central1-a_std-1" modified.'],
  'kubectl cluster-info': () => ['Kubernetes control plane is running at https://34.118.40.12', 'GLBCDefaultBackend is running at https://34.118.40.12/api/v1/namespaces/kube-system/services/default-http-backend:http/proxy', 'KubeDNS is running at https://34.118.40.12/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy', 'Metrics-server is running at https://34.118.40.12/api/v1/namespaces/kube-system/services/https:metrics-server:/proxy', '', "To further debug and diagnose cluster problems, use 'kubectl cluster-info dump'."],
  'kubectl get': (p) => kubeGet(p),
  'kubectl describe': () => ['Name:             web-7d4b9', 'Namespace:        default', 'Priority:         0', 'Service Account:  default', 'Node:             <none>', 'Labels:           app=web', 'Status:           Pending', 'IP:', 'Containers:', '  nginx:', '    Image:      nginx:1.27', '    Requests:', '      cpu:     4', '      memory:  2Gi', 'Conditions:', '  Type           Status', '  PodScheduled   False', 'Events:', '  Type     Reason            Age   From               Message', '  ----     ------            ----  ----               -------', '  Warning  FailedScheduling  41s   default-scheduler  0/3 nodes are available: 3 Insufficient cpu. preemption: 0/3 nodes are available: 3 No preemption victims found for incoming pod.'],
  'kubectl logs': (p) =>
    on(p, 'previous')
      ? ['Starting server on :8080', 'panic: runtime error: invalid memory address or nil pointer dereference', '[signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x6b3c21]', 'goroutine 1 [running]:', 'main.loadConfig(...)']
      : ['10.8.0.1 - - [18/Oct/2026:02:51:01 +0000] "GET / HTTP/1.1" 200 615 "-" "kube-probe/1.34"', '10.8.0.1 - - [18/Oct/2026:02:51:11 +0000] "GET / HTTP/1.1" 200 615 "-" "kube-probe/1.34"', '(mengikuti log… Ctrl+C untuk berhenti — disimulasikan)'],
  'kubectl exec': (p) => [`(shell ${p.rest?.join(' ')} di ${p.pos[0].replace(/^pods\//, '')} — disimulasikan)`, '# hostname', p.pos[0].replace(/^pods\//, ''), '# exit'],
  'kubectl port-forward': (p) => {
    const [local, remote] = (p.pos[1] ?? '8080:80').split(':');
    return [`Forwarding from 127.0.0.1:${local} -> ${remote ?? local}`, `Forwarding from [::1]:${local} -> ${remote ?? local}`];
  },
  'kubectl top pod': () => ktable(['NAME', 'CPU(cores)', 'MEMORY(bytes)'], [['web-7d4b9c8f6d-abcde', '2m', '12Mi'], ['web-7d4b9c8f6d-fghij', '3m', '13Mi'], ['api-5c9f8d7b6-klmno', '41m', '96Mi']]),
  'kubectl apply': (p) => (p.flags.filename ?? []).map(() => 'deployment.apps/web created'),
  'kubectl delete': () => ['deployment.apps "web" deleted', 'service "web" deleted'],
  'kubectl create deployment': (p) => [`deployment.apps/${p.pos[0]} created`],
  'kubectl create secret generic': (p) => [`secret/${p.pos[0]} created`],
  'kubectl create configmap': (p) => [`configmap/${p.pos[0]} created`],
  'kubectl create namespace': (p) => [`namespace/${p.pos[0]} created`],
  'kubectl expose': (p) => [`service/${p.pos[0].split('/')[1]} exposed`],
  'kubectl scale': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} scaled`],
  'kubectl autoscale': (p) => [`horizontalpodautoscaler.autoscaling/${p.pos[0].split('/')[1]} autoscaled`],
  'kubectl set image': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} image updated`],
  'kubectl rollout status': (p) => [`Waiting for deployment "${p.pos[0].split('/')[1]}" rollout to finish: 1 out of 3 new replicas have been updated...`, `Waiting for deployment "${p.pos[0].split('/')[1]}" rollout to finish: 2 out of 3 new replicas have been updated...`, `deployment "${p.pos[0].split('/')[1]}" successfully rolled out`],
  'kubectl rollout history': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} `, 'REVISION  CHANGE-CAUSE', '1         <none>', '2         <none>', '3         <none>'],
  'kubectl rollout undo': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} rolled back`],
  'kubectl rollout restart': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} restarted`],
  'kubectl cordon': (p) => [`node/${p.pos[0]} cordoned`],
  'kubectl drain': (p) => [`node/${p.pos[0]} already cordoned`, 'Warning: ignoring DaemonSet-managed Pods: kube-system/fluentbit-gke-x7k2p, kube-system/gke-metrics-agent-q8m4n, kube-system/kube-proxy-gke-std-1-default-pool-1a2b, kube-system/pdcsi-node-9vtz2', 'evicting pod default/web-7d4b9c8f6d-abcde', 'pod/web-7d4b9c8f6d-abcde evicted', `node/${p.pos[0]} drained`],
  'kubectl uncordon': (p) => [`node/${p.pos[0]} uncordoned`],
  'kubectl label': (p) => [`deployment.apps/${p.pos[0].split('/')[1]} labeled`],
  'kubectl auth can-i': () => ['yes'],

  // ── bq ──
  'bq mk': (p, e) => {
    const id = p.pos[0] ?? '';
    const full = id.includes(':') ? id : `${e.project}:${id}`;
    if (p.flags.view) return [`View '${full}' successfully created.`];
    return on(p, 'table') || id.includes('.') ? [`Table '${full}' successfully created.`] : [`Dataset '${full}' successfully created.`];
  },
  'bq load': () => ['Upload complete.', 'Waiting on bqjob_r3c045d7cbe5ca6d2_0000019a2f0815f_1 ... (2s) Current status: DONE'],
  'bq query': (p) =>
    on(p, 'dry_run')
      ? ['Query successfully validated. Assuming the tables are not modified, running this query will process 48213504 bytes of data.']
      : ['Waiting on bqjob_r1a2b3c4d5e6f7_0000019a2f0a11c_1 ... (0s) Current status: DONE', '+-------+', '|  f0_  |', '+-------+', '| 12840 |', '+-------+'],
  'bq ls': (p) => (p.pos.length ? ['     tableId       Type    Labels   Time Partitioning   Clustered Fields', ' ---------------- ------- -------- ------------------- ------------------', '  events           TABLE            DAY (field: ts)', '  orders           TABLE', '  orders_backup    TABLE'] : ['  datasetId', ' -----------', '  audit_logs', '  sales']),
  'bq show': (p) =>
    on(p, 'job')
      ? [`Job ace-lab-123:${p.pos[0]}`, '', '  Job Type    State      Start Time         Duration     User Email           Bytes Processed   Bytes Billed', ' ---------- --------- ----------------- ---------------- -------------------- ----------------- --------------', '  query      SUCCESS   18 Oct 02:55:01   0:00:01.913000   student@ace-lab.dev   48213504          48234496']
      : ['Table ace-lab-123:sales.orders', '', '   Last modified          Schema          Total Rows   Total Bytes   Expiration   Time Partitioning   Clustered Fields   Labels', ' ----------------- ----------------------- ------------ ------------- ------------ ------------------- ------------------ --------', '  18 Oct 02:40:12   |- order_id: STRING     12840        48213504', '                    |- customer: STRING', '                    |- total: NUMERIC', '                    |- created: TIMESTAMP'],
  'bq head': () => ['+----------+----------+--------+---------------------+', '| order_id | customer | total  |       created       |', '+----------+----------+--------+---------------------+', '| A-1001   | ana      | 129.00 | 2026-10-01 08:12:00 |', '| A-1002   | budi     |  42.50 | 2026-10-01 08:15:41 |', '+----------+----------+--------+---------------------+'],
  'bq extract': () => ['Waiting on bqjob_r7f6e5d4c3b2a1_0000019a2f0c3d1_1 ... (3s) Current status: DONE'],
  'bq cp': (p, e) => ['Waiting on bqjob_r2b3c4d5e6f7a8_0000019a2f0d4e2_1 ... (0s) Current status: DONE', `Table '${p.pos[0].includes(':') ? p.pos[0] : `${e.project}:${p.pos[0]}`}' successfully copied to '${p.pos[1].includes(':') ? p.pos[1] : `${e.project}:${p.pos[1]}`}'`],
  'bq rm': (p, e) => (on(p, 'force') ? [] : [`rm: remove dataset '${p.pos[0].includes(':') ? p.pos[0] : `${e.project}:${p.pos[0]}`}'? (y/N) y`]),

  // ── terraform ──
  'terraform init': () => [
    'Initializing the backend...',
    '',
    'Initializing provider plugins...',
    '- Finding hashicorp/google versions matching "~> 7.0"...',
    '- Installing hashicorp/google v7.8.0...',
    '- Installed hashicorp/google v7.8.0 (signed by HashiCorp)',
    '',
    'Terraform has created a lock file .terraform.lock.hcl to record the provider',
    'selections it made above. Include this file in your version control repository',
    'so that Terraform can guarantee to make the same selections by default when',
    'you run "terraform init" in the future.',
    '',
    'Terraform has been successfully initialized!',
    '',
    'You may now begin working with Terraform. Try running "terraform plan" to see',
    'any changes that are required for your infrastructure. All Terraform commands',
    'should now work.'
  ],
  'terraform fmt': () => ['main.tf', 'variables.tf'],
  'terraform validate': () => ['Success! The configuration is valid.'],
  'terraform plan': (p) => [
    ...planBody(),
    '',
    ...(one(p, 'out')
      ? ['─────────────────────────────────────────────────────────────────────────────', '', `Saved the plan to: ${one(p, 'out')}`, '', 'To perform exactly these actions, run the following command to apply:', `    terraform apply "${one(p, 'out')}"`]
      : ['─────────────────────────────────────────────────────────────────────────────', '', 'Note: You didn\'t use the -out option to save this plan, so Terraform can\'t', 'guarantee to take exactly these actions if you run "terraform apply" now.'])
  ],
  'terraform apply': (p) => [
    ...(p.pos.length ? [] : [...planBody(), '', ...(on(p, 'auto-approve') ? [] : ['Do you want to perform these actions?', '  Terraform will perform the actions described above.', "  Only 'yes' will be accepted to approve.", '', '  Enter a value: yes', ''])]),
    'google_compute_instance.web: Creating...',
    'google_compute_instance.web: Still creating... [10s elapsed]',
    'google_compute_instance.web: Creation complete after 14s [id=projects/ace-lab-123/zones/us-central1-a/instances/web-1]',
    '',
    'Apply complete! Resources: 1 added, 0 changed, 0 destroyed.'
  ],
  'terraform destroy': () => ['google_compute_instance.web: Refreshing state... [id=projects/ace-lab-123/zones/us-central1-a/instances/web-1]', '', 'Plan: 0 to add, 0 to change, 2 to destroy.', '', 'Do you really want to destroy all resources?', '  Terraform will destroy all your managed infrastructure, as shown above.', "  There is no undo. Only 'yes' will be accepted to confirm.", '', '  Enter a value: yes', '', 'google_compute_instance.web: Destroying...', 'google_storage_bucket.assets: Destroying...', 'google_compute_instance.web: Destruction complete after 32s', '', 'Destroy complete! Resources: 2 destroyed.'],
  'terraform state list': () => ['google_compute_instance.web', 'google_compute_network.prod', 'google_storage_bucket.assets'],
  'terraform state show': (p) => [`# ${p.pos[0]}:`, `resource "google_storage_bucket" "assets" {`, '    force_destroy               = false', '    id                          = "ace-assets-123"', '    location                    = "US"', '    name                        = "ace-assets-123"', '    storage_class               = "STANDARD"', '    uniform_bucket_level_access = true', '}'],
  'terraform import': (p) => [`${p.pos[0]}: Importing from ID "${p.pos[1]}"...`, `${p.pos[0]}: Import prepared!`, `  Prepared ${p.pos[0].split('.')[0]} for import`, `${p.pos[0]}: Refreshing state... [id=${p.pos[1]}]`, '', 'Import successful!', '', 'The resources that were imported are shown above. These resources are now in', 'your Terraform state and will henceforth be managed by Terraform.'],
  'terraform output': () => ['bucket_url = "gs://ace-assets-123"', 'instance_ip = "34.27.10.11"'],
  'terraform workspace new': (p) => [`Created and switched to workspace "${p.pos[0]}"!`, '', "You're now on a new, empty workspace. Workspaces isolate their state,", 'so if you run "terraform plan" Terraform will not see any existing state', 'for this configuration.'],

  // ── docker ──
  'docker build': (p) => ['[+] Building 18.4s (9/9) FINISHED                                    docker:default', ' => [internal] load build definition from Dockerfile                     0.0s', ' => [internal] load metadata for docker.io/library/python:3.12-slim      1.2s', ' => [1/4] FROM docker.io/library/python:3.12-slim@sha256:…              4.8s', ' => [2/4] COPY requirements.txt .                                         0.1s', ' => [3/4] RUN pip install -r requirements.txt                            10.9s', ' => [4/4] COPY . .                                                        0.1s', ' => exporting to image                                                    1.1s', ` => => naming to ${(p.flags.tag ?? ['app'])[0]}                          0.0s`],
  'docker push': (p) => [`The push refers to repository [${p.pos[0].split(':')[0]}]`, '5f70bf18a086: Pushed', 'a3ed95caeb02: Pushed', 'c4d3b2a1f0e9: Layer already exists', `${p.pos[0].split(':')[1] ?? 'latest'}: digest: sha256:4b2a9c1e7d3f8a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b size: 1570`],
  'docker tag': () => [],
  'docker run': (p) => (on(p, 'detach') ? ['3f2a1b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f70'] : ['(container berjalan di foreground — disimulasikan)']),
  'docker ps': (p) => dockerPs(on(p, 'all')),
  'docker container ls': (p) => dockerPs(on(p, 'all')),
  'docker logs': () => ['/docker-entrypoint.sh: Configuration complete; ready for start up', '2026/10/18 02:58:01 [notice] 1#1: nginx/1.27.2', '172.17.0.1 - - [18/Oct/2026:02:58:12 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.5.0"'],
  'docker exec': (p) => [`(shell ${p.pos.slice(1).join(' ')} di container ${p.pos[0]} — disimulasikan)`, '# hostname', '3f2a1b4c5d6e', '# exit'],
  'docker stop': (p) => p.pos,
  'docker rm': (p) => p.pos,
  'docker images': () => ['REPOSITORY                                          TAG       IMAGE ID       CREATED          SIZE', 'us-central1-docker.pkg.dev/ace-lab-123/apps/web    v1        8e1f0c2a7b3d   2 minutes ago    152MB', 'web                                                 v1        8e1f0c2a7b3d   2 minutes ago    152MB', 'nginx                                               1.27      a5c2f1e0d9b8   9 days ago       192MB'],
  'docker compose up': () => ['[+] Running 3/3', ' ✔ Network app_default  Created                                       0.1s', ' ✔ Container app-db-1   Started                                       0.6s', ' ✔ Container app-web-1  Started                                       0.9s'],
  'docker pull': (p) => [`${p.pos[0].split(':')[1] ?? 'latest'}: Pulling from library/${p.pos[0].split(':')[0]}`, 'Digest: sha256:a5c2f1e0d9b8c7a6f5e4d3c2b1a09f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a', `Status: Downloaded newer image for ${p.pos[0]}`, `docker.io/library/${p.pos[0]}`]
};

function manPage(words: string[]): string[] {
  const path = ['gcloud', ...words].join(' ');
  return ['NAME', `    ${path} - (halaman bantuan disingkat)`, '', 'SYNOPSIS', `    ${path} [FLAGS…]`, '', 'DESCRIPTION', '    Halaman lengkap ada di https://cloud.google.com/sdk/gcloud/reference'];
}

const componentManagerOff = (cmd: string) => ['', 'You cannot perform this action because the Google Cloud CLI component manager ', 'is disabled for this installation. You can run the following command ', 'to achieve the same result for this installation: ', '', cmd, ''];

function propValue(key: string, e: QuizEnv): string {
  const k = key.includes('/') ? key : `core/${key}`;
  return { 'core/project': e.project, 'core/account': e.account, 'compute/zone': e.zone, 'compute/region': e.region }[k] ?? '(unset)';
}

function clusterCreate(name: string, loc: string, e: QuizEnv, machine: string, nodes = '3'): string[] {
  return [
    `Creating cluster ${name} in ${loc}... Cluster is being health-checked (Kubernetes Control Plane is healthy)...done.`,
    `Created [https://container.googleapis.com/v1/projects/${e.project}/zones/${loc}/clusters/${name}].`,
    `To inspect the contents of your cluster, go to: https://console.cloud.google.com/kubernetes/workload_/gcloud/${loc}/${name}?project=${e.project}`,
    `kubeconfig entry generated for ${name}.`,
    ...table(['NAME', 'LOCATION', 'MASTER_VERSION', 'MASTER_IP', 'MACHINE_TYPE', 'NODE_VERSION', 'NUM_NODES', 'STATUS'], [[name, loc, '1.34.1-gke.1080000', '34.118.40.12', machine, '1.34.1-gke.1080000', nodes, 'RUNNING']])
  ];
}

function runDeploy(p: Parsed, e: QuizEnv): string[] {
  const svc = p.pos[0] ?? 'service';
  const region = one(p, 'region') ?? 'us-central1';
  const source = !!one(p, 'source');
  const noTraffic = one(p, 'traffic') === 'false';
  const pub = on(p, 'allow-unauthenticated') || one(p, 'invoker-iam-check') === 'false';
  const asked = !pub && one(p, 'allow-unauthenticated') === undefined;
  const rev = `${svc}-0000${noTraffic ? 2 : 1}-${noTraffic ? 'xyz' : 'x7k'}`;
  return [
    ...(source ? ['Building using Dockerfile and deploying container to Cloud Run service [' + svc + '] in project [' + e.project + '] region [' + region + ']'] : [`Deploying container to Cloud Run service [${svc}] in project [${e.project}] region [${region}]`]),
    ...(asked ? [`Allow unauthenticated invocations to [${svc}] (y/N)?  N`, ''] : []),
    `OK ${source ? 'Building and deploying' : 'Deploying'}${noTraffic ? '' : ' new service'}... Done.`,
    ...(source ? ['  OK Uploading sources...', '  OK Building Container... Logs are available at [https://console.cloud.google.com/cloud-build/builds/…].'] : []),
    '  OK Creating Revision...',
    '  OK Routing traffic...',
    ...(pub ? ['  OK Setting IAM Policy...'] : []),
    'Done.',
    `Service [${svc}] revision [${rev}] has been deployed and is serving ${noTraffic ? 0 : 100} percent of traffic.`,
    ...(noTraffic && one(p, 'tag') ? [`The revision can be reached directly at https://${one(p, 'tag')}---${svc}-${PROJECT_NUMBER}.${region}.run.app`] : [`Service URL: https://${svc}-${PROJECT_NUMBER}.${region}.run.app`])
  ];
}

function kubeGet(p: Parsed): string[] {
  const t = p.pos[0]?.split('/')[0];
  const wide = one(p, 'output') === 'wide';
  if (t === 'nodes')
    return ktable(['NAME', 'STATUS', 'ROLES', 'AGE', 'VERSION'], [['gke-std-1-default-pool-1a2b', 'Ready', '<none>', '12d', 'v1.34.1-gke.1080000'], ['gke-std-1-default-pool-3c4d', 'Ready', '<none>', '12d', 'v1.34.1-gke.1080000'], ['gke-std-1-default-pool-5e6f', 'Ready', '<none>', '12d', 'v1.34.1-gke.1080000']]);
  if (t === 'services')
    return ktable(['NAME', 'TYPE', 'CLUSTER-IP', 'EXTERNAL-IP', 'PORT(S)', 'AGE'], [['kubernetes', 'ClusterIP', '10.12.0.1', '<none>', '443/TCP', '12d'], ['web', 'LoadBalancer', '10.12.5.140', '34.70.88.21', '80:31234/TCP', '3m']]);
  if (t === 'events')
    return ktable(['LAST SEEN', 'TYPE', 'REASON', 'OBJECT', 'MESSAGE'], [['5m', 'Normal', 'Scheduled', 'pod/web-7d4b9c8f6d-abcde', 'Successfully assigned default/web-7d4b9c8f6d-abcde to gke-std-1-default-pool-1a2b'], ['5m', 'Normal', 'Pulled', 'pod/web-7d4b9c8f6d-abcde', 'Container image "nginx:1.27" already present on machine'], ['41s', 'Warning', 'FailedScheduling', 'pod/web-7d4b9', '0/3 nodes are available: 3 Insufficient cpu.']]);
  if (t === 'all')
    return [
      ...ktable(['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'], [['pod/cart-6b8f9c7d5-2xk4p', '1/1', 'Running', '0', '2d']]),
      '',
      ...ktable(['NAME', 'TYPE', 'CLUSTER-IP', 'EXTERNAL-IP', 'PORT(S)', 'AGE'], [['service/cart', 'ClusterIP', '10.12.9.31', '<none>', '80/TCP', '2d']]),
      '',
      ...ktable(['NAME', 'READY', 'UP-TO-DATE', 'AVAILABLE', 'AGE'], [['deployment.apps/cart', '1/1', '1', '1', '2d']])
    ];
  const pods: string[][] = [
    ['web-7d4b9c8f6d-abcde', '1/1', 'Running', '0', '5m', '10.8.0.12', 'gke-std-1-default-pool-1a2b'],
    ['web-7d4b9c8f6d-fghij', '1/1', 'Running', '0', '5m', '10.8.1.7', 'gke-std-1-default-pool-3c4d'],
    ['web-7d4b9', '0/1', 'Pending', '0', '41s', '<none>', '<none>']
  ];
  const ns = on(p, 'all-namespaces');
  const rows = ns ? [['default', ...pods[0].slice(0, 5)], ['kube-system', 'kube-dns-5c4f8b7d6-q2w3e', '4/4', 'Running', '0', '12d'], ['shop', 'cart-6b8f9c7d5-2xk4p', '1/1', 'Running', '0', '2d']] : pods.map((r) => (wide ? [...r, '<none>', '<none>'] : r.slice(0, 5)));
  const head = ns ? ['NAMESPACE', 'NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'] : wide ? ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE', 'IP', 'NODE', 'NOMINATED NODE', 'READINESS GATES'] : ['NAME', 'READY', 'STATUS', 'RESTARTS', 'AGE'];
  return ktable(head, rows);
}

function planBody(): string[] {
  return [
    'Terraform used the selected providers to generate the following execution',
    'plan. Resource actions are indicated with the following symbols:',
    '  + create',
    '',
    'Terraform will perform the following actions:',
    '',
    '  # google_compute_instance.web will be created',
    '  + resource "google_compute_instance" "web" {',
    '      + machine_type = "e2-medium"',
    '      + name         = "web-1"',
    '      + zone         = "us-central1-a"',
    '      + id           = (known after apply)',
    '    }',
    '',
    'Plan: 1 to add, 0 to change, 0 to destroy.'
  ];
}

function dockerPs(all: boolean): string[] {
  const rows = [['3f2a1b4c5d6e', 'nginx', '"/docker-entrypoint.…"', '5 minutes ago', 'Up 5 minutes', '0.0.0.0:8080->80/tcp, [::]:8080->80/tcp', 'web']];
  if (all) rows.push(['9b8c7d6e5f4a', 'app:v1', '"python main.py"', '2 hours ago', 'Exited (0) 2 hours ago', '', 'batch']);
  return ktable(['CONTAINER ID', 'IMAGE', 'COMMAND', 'CREATED', 'STATUS', 'PORTS', 'NAMES'], rows);
}

/** What a correct command prints, or nothing if there is no generator for it. */
export function simulate(p: Parsed, e: QuizEnv): string[] {
  if (p.tool === 'gcloud' && p.flags.help?.[0] === 'true') return manPage(p.path);
  const key = `${p.tool} ${p.path.join(' ')}`;
  return G[key]?.(p, e) ?? [];
}
