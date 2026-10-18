/**
 * The command trees the quiz knows: gcloud (with gcloud storage), gsutil,
 * kubectl, bq, terraform and docker. Flags and positionals follow each tool's
 * reference pages as of late 2026 (gcloud 589, kubectl 1.34, Docker 29); error
 * strings in the checks are the tools' own where they could be found, and are
 * marked "reconstructed" where they had to be assembled.
 *
 * The tree only has to be complete where the quiz asks, plus enough neighbours
 * that a near miss gets a realistic "Maybe you meant" list.
 */
import { buildTree, cmd, type Parsed, type TreeNode } from './grammar';

type Spec = ReturnType<typeof cmd>;

const one = (p: Parsed, f: string) => p.flags[f]?.[p.flags[f].length - 1];
const has = (p: Parsed, f: string) => f in p.flags;

/** `ERROR: (gcloud.compute.instances.create) message` */
export const gerr = (p: Parsed, msg: string) => `ERROR: (gcloud${p.path.length ? '.' + p.path.join('.') : ''}) ${msg}`;

/** kubectl argument errors end with the -h footer. */
const kerr = (p: Parsed, msg: string) => [`error: ${msg}`, `See 'kubectl ${p.path.join(' ')} -h' for help and examples`];

const bounded = (p: Parsed, flag: string, min: number, max: number, float = false): string | null => {
  const v = one(p, flag);
  if (v === undefined) return null;
  const n = Number(v);
  const shown = float ? (Number.isInteger(n) ? n.toFixed(1) : String(n)) : String(n);
  if (Number.isNaN(n)) return gerr(p, `argument --${flag}: invalid ${float ? 'float' : 'int'} value: '${v}'`);
  if (n < min) return gerr(p, `argument --${flag}: Value must be greater than or equal to ${float ? min.toFixed(1) : min}; received: ${shown}`);
  if (n > max) return gerr(p, `argument --${flag}: Value must be less than or equal to ${float ? max.toFixed(1) : max}; received: ${shown}`);
  return null;
};

// ── gcloud ──────────────────────────────────────────────────────────────────

/** Flags every gcloud command accepts. */
export const GCLOUD_GLOBAL =
  'project account billing-project configuration flags-file flatten format !help/h impersonate-service-account !log-http !quiet/q trace-token !user-output-enabled verbosity:debug,info,warning,error,critical,none access-token-file';
/** Flags every gcloud `list` command adds. */
export const GCLOUD_LIST = 'filter limit page-size sort-by !uri';

/** Properties `gcloud config set` accepts, by section. */
export const PROPERTIES: Record<string, string[]> = {
  core: ['project', 'account', 'disable_usage_reporting', 'verbosity', 'user_output_enabled', 'log_http', 'disable_prompts', 'custom_ca_certs_file', 'pass_credentials_to_gsutil', 'universe_domain', 'format'],
  compute: ['zone', 'region', 'use_new_list_usable_subnets_api'],
  run: ['region', 'platform'],
  container: ['cluster', 'use_application_default_credentials'],
  functions: ['region', 'gen2'],
  artifacts: ['location', 'repository'],
  app: ['promote_by_default', 'stop_previous_version'],
  auth: ['impersonate_service_account', 'disable_credentials'],
  billing: ['quota_project'],
  dataproc: ['region'],
  deploy: ['region'],
  storage: ['parallel_composite_upload_enabled'],
  accessibility: ['screen_reader'],
  survey: ['disable_prompts']
};

function propertyError(p: Parsed): string | null {
  const key = p.pos[0];
  if (!key) return null;
  const [section, prop] = key.includes('/') ? key.split('/', 2) : ['core', key];
  if (!PROPERTIES[section]) return gerr(p, `Section "${section}" does not exist.`);
  if (!PROPERTIES[section].includes(prop)) return gerr(p, `Section [${section}] has no property [${prop}].`);
  return null;
}

const ZONE_RE = /^[a-z]+-[a-z]+\d+-[a-z]$/;
const REGION_RE = /^[a-z]+-[a-z]+\d+$/;
const RFC1035 = /^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/;

/** gcloud container accepts --location for either kind; compare as --zone or --region. */
export function containerLocation(p: Parsed) {
  if (p.path[0] !== 'container') return;
  const loc = one(p, 'location');
  if (!loc) return;
  delete p.flags.location;
  if (ZONE_RE.test(loc)) p.flags.zone = [loc];
  else p.flags.region = [loc];
}

const VM_FLAGS =
  'zone/z machine-type image image-family image-project boot-disk-size~size boot-disk-type network subnet tags~list metadata+ metadata-from-file+ !preemptible provisioning-model~upper:SPOT,STANDARD instance-termination-action~upper:STOP,DELETE service-account scopes~list address !no-address network-tier~upper:PREMIUM,STANDARD labels~list !deletion-protection !shielded-secure-boot custom-cpu custom-memory create-disk+ maintenance-policy~upper:MIGRATE,TERMINATE source-instance-template !can-ip-forward hostname';

const LOC = 'zone/z region';

const gcloudSpecs: Spec[] = [
  // getting started
  cmd('gcloud', 'init', '', '!console-only/no-launch-browser !no-browser !skip-diagnostics', {
    check: (p) =>
      p.pos.length
        ? gerr(p, '`gcloud init` has changed and no longer takes a PROJECT argument. Please use `gcloud source repos clone` to clone this project\'s source repositories.')
        : null
  }),
  cmd('gcloud', 'version'),
  cmd('gcloud', 'info', '', '!anonymize !show-log !run-diagnostics'),
  cmd('gcloud', 'help', '[COMMAND...]', 'limit', { dashArgs: true }),
  cmd('gcloud', 'cheat-sheet'),
  cmd('gcloud', 'feedback'),
  ...['filters', 'formats', 'configurations', 'datetimes', 'escaping', 'flags-file', 'projections', 'resource-keys', 'startup', 'gcloudignore', 'command-conventions'].map((t) =>
    cmd('gcloud', `topic ${t}`)
  ),
  cmd('gcloud', 'components install', 'COMPONENT_IDS...'),
  cmd('gcloud', 'components update', '', 'version'),
  cmd('gcloud', 'components list', '', '!show-versions'),
  cmd('gcloud', 'components remove', 'COMPONENT_IDS...'),

  // config
  cmd('gcloud', 'config set', 'SECTION/PROPERTY VALUE', '!installation', {
    check: propertyError,
    warn: (p) => {
      const [key, value] = p.pos;
      if (key === 'compute/zone' && value && !ZONE_RE.test(value)) return [`WARNING: ${value} is not a valid zone. Run \`gcloud compute zones list\` to get all zones.`];
      if (key === 'compute/region' && value && !REGION_RE.test(value)) return [`WARNING: ${value} is not a valid region. Run \`gcloud compute regions list\` to get all regions.`];
      return [];
    }
  }),
  cmd('gcloud', 'config get', 'SECTION/PROPERTY', '', { check: propertyError }),
  cmd('gcloud', 'config get-value', 'SECTION/PROPERTY', '', { check: propertyError, hidden: true }),
  cmd('gcloud', 'config list', '[SECTION/PROPERTY]', `!all ${GCLOUD_LIST}`),
  cmd('gcloud', 'config unset', 'SECTION/PROPERTY', '!installation', { check: propertyError }),
  cmd('gcloud', 'config configurations create', 'CONFIGURATION_NAME', '!activate'),
  cmd('gcloud', 'config configurations list', '', GCLOUD_LIST),
  cmd('gcloud', 'config configurations activate', 'CONFIGURATION_NAME'),
  cmd('gcloud', 'config configurations describe', 'CONFIGURATION_NAME', '!all'),
  cmd('gcloud', 'config configurations delete', 'CONFIGURATION_NAMES...'),
  cmd('gcloud', 'config configurations rename', 'CONFIGURATION_NAME', '*new-name'),

  // auth
  cmd('gcloud', 'auth activate-service-account', '[ACCOUNT]', '*key-file password-file !prompt-for-password'),
  cmd('gcloud', 'auth application-default login', '', '!no-browser client-id-file !disable-quota-project !launch-browser login-config scopes~list'),
  cmd('gcloud', 'auth application-default print-access-token'),
  cmd('gcloud', 'auth application-default revoke'),
  cmd('gcloud', 'auth application-default set-quota-project', 'QUOTA_PROJECT_ID'),
  cmd('gcloud', 'auth configure-docker', '[REGISTRIES]'),
  cmd('gcloud', 'auth describe', 'ACCOUNT'),
  cmd('gcloud', 'auth enterprise-certificate-config create', '', 'platform'),
  cmd('gcloud', 'auth list', '', `filter-account ${GCLOUD_LIST}`),
  cmd('gcloud', 'auth login', '[ACCOUNT]', '!activate !brief !no-browser cred-file !enable-gdrive-access !force !launch-browser login-config !update-adc'),
  cmd('gcloud', 'auth print-access-token', '[ACCOUNT]', 'lifetime'),
  cmd('gcloud', 'auth print-identity-token', '[ACCOUNT]', 'audiences !include-email'),
  cmd('gcloud', 'auth revoke', '[ACCOUNTS...]', '!all'),

  // projects, services, billing, folders
  cmd('gcloud', 'projects list', '', GCLOUD_LIST),
  cmd('gcloud', 'projects describe', 'PROJECT_ID_OR_NUMBER'),
  cmd('gcloud', 'projects create', '[PROJECT_ID]', '!enable-cloud-apis folder labels~list name organization !set-as-default tags', {
    atMostOne: [['folder', 'organization']],
    check: (p) => {
      const id = p.pos[0];
      if (id && !/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(id))
        return gerr(p, `argument PROJECT_ID: Bad value [${id}]: Project IDs must start with a lowercase letter and can have lowercase ASCII letters, digits or hyphens. Project IDs must be between 6 and 30 characters.`);
      return null;
    }
  }),
  cmd('gcloud', 'projects delete', 'PROJECT_ID_OR_NUMBER'),
  cmd('gcloud', 'projects add-iam-policy-binding', 'PROJECT_ID', '*member *role condition condition-from-file'),
  cmd('gcloud', 'projects remove-iam-policy-binding', 'PROJECT_ID', '*member *role condition !all'),
  cmd('gcloud', 'projects get-iam-policy', 'PROJECT_ID_OR_NUMBER', GCLOUD_LIST),
  cmd('gcloud', 'projects set-iam-policy', 'PROJECT_ID POLICY_FILE'),
  cmd('gcloud', 'resource-manager folders create', '', '*display-name folder organization', { oneOf: [['folder', 'organization']] }),
  cmd('gcloud', 'resource-manager folders list', '', `folder organization ${GCLOUD_LIST}`, { oneOf: [['folder', 'organization']] }),
  cmd('gcloud', 'organizations list', '', GCLOUD_LIST),
  cmd('gcloud', 'organizations add-iam-policy-binding', 'ORGANIZATION', '*member *role'),
  cmd('gcloud', 'services enable', 'SERVICE...', '!async'),
  cmd('gcloud', 'services disable', 'SERVICE...', '!async !force'),
  cmd('gcloud', 'services list', '', `!available !enabled ${GCLOUD_LIST}`, { atMostOne: [['available', 'enabled']] }),
  cmd('gcloud', 'billing accounts list', '', GCLOUD_LIST),
  cmd('gcloud', 'billing projects link', 'PROJECT_ID', '*billing-account'),
  cmd('gcloud', 'billing projects describe', 'PROJECT_ID'),
  cmd('gcloud', 'billing projects unlink', 'PROJECT_ID'),
  cmd('gcloud', 'billing budgets create', '', '*billing-account *display-name *budget-amount threshold-rule+'),

  // IAM
  cmd('gcloud', 'iam roles create', 'ROLE_ID', 'organization project file description permissions~list stage~upper:ALPHA,BETA,GA,DEPRECATED,DISABLED,EAP title', {
    oneOf: [['organization', 'project']]
  }),
  cmd('gcloud', 'iam roles describe', 'ROLE_ID', 'organization project'),
  cmd('gcloud', 'iam roles copy', '', 'source destination dest-organization dest-project source-organization source-project'),
  cmd('gcloud', 'iam roles list', '', `organization project !show-deleted ${GCLOUD_LIST}`),
  cmd('gcloud', 'iam roles update', 'ROLE_ID', 'organization project file add-permissions~list remove-permissions~list stage title'),
  cmd('gcloud', 'iam roles delete', 'ROLE_ID', 'organization project'),
  cmd('gcloud', 'iam list-grantable-roles', 'RESOURCE', GCLOUD_LIST),
  cmd('gcloud', 'iam service-accounts create', 'NAME', 'description display-name', {
    check: (p) => {
      const n = p.pos[0];
      if (n && !/^[a-z]([-a-z0-9]{4,28}[a-z0-9])$/.test(n))
        return gerr(p, `argument NAME: Bad value [${n}]: Service account name must be between 6 and 30 characters (inclusive), must begin with a lowercase letter, and consist of lowercase alphanumeric characters that can be separated by hyphens.`);
      return null;
    }
  }),
  cmd('gcloud', 'iam service-accounts list', '', GCLOUD_LIST),
  cmd('gcloud', 'iam service-accounts describe', 'SERVICE_ACCOUNT'),
  cmd('gcloud', 'iam service-accounts delete', 'SERVICE_ACCOUNT'),
  cmd('gcloud', 'iam service-accounts keys create', 'OUTPUT_FILE', '*iam-account key-file-type:json,p12'),
  cmd('gcloud', 'iam service-accounts keys list', '', `*iam-account managed-by:any,user,system created-before ${GCLOUD_LIST}`),
  cmd('gcloud', 'iam service-accounts keys delete', 'KEY_ID', '*iam-account'),
  cmd('gcloud', 'iam service-accounts add-iam-policy-binding', 'SERVICE_ACCOUNT', '*member *role condition'),
  cmd('gcloud', 'iam service-accounts remove-iam-policy-binding', 'SERVICE_ACCOUNT', '*member *role'),
  cmd('gcloud', 'iam service-accounts get-iam-policy', 'SERVICE_ACCOUNT'),
  cmd('gcloud', 'iam service-accounts set-iam-policy', 'SERVICE_ACCOUNT POLICY_FILE'),

  // Compute Engine
  cmd('gcloud', 'compute zones list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute regions list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute machine-types list', '', `zones~list ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute instances create', 'INSTANCE_NAMES...', VM_FLAGS, {
    check: (p) => {
      const bad = p.pos.find((n) => !RFC1035.test(n));
      if (bad)
        return gerr(p, `Could not fetch resource:\n - Invalid value for field 'resource.name': '${bad}'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?|[1-9][0-9]{0,19})'`);
      return null;
    }
  }),
  cmd('gcloud', 'compute instances list', '[NAME...]', `zones~list ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute instances describe', 'INSTANCE_NAME', 'zone/z'),
  cmd('gcloud', 'compute instances delete', 'INSTANCE_NAMES...', 'zone/z delete-disks:all,boot,data keep-disks:all,boot,data'),
  ...['start', 'reset', 'resume', 'suspend'].map((v) => cmd('gcloud', `compute instances ${v}`, 'INSTANCE_NAMES...', 'zone/z !async')),
  cmd('gcloud', 'compute instances stop', 'INSTANCE_NAMES...', 'zone/z !async !discard-local-ssd'),
  cmd('gcloud', 'compute instances set-machine-type', 'INSTANCE_NAME', 'zone/z machine-type custom-cpu custom-memory', {
    check: (p) => (has(p, 'machine-type') || has(p, 'custom-cpu') || has(p, 'custom-memory') ? null : gerr(p, 'One of [--custom-cpu, --custom-memory, --machine-type] must be supplied.'))
  }),
  cmd('gcloud', 'compute instances set-service-account', 'INSTANCE_NAME', 'zone/z service-account scopes~list !no-service-account !no-scopes'),
  cmd('gcloud', 'compute instances add-metadata', 'INSTANCE_NAME', 'zone/z metadata+ metadata-from-file+', {
    check: (p) => (has(p, 'metadata') || has(p, 'metadata-from-file') ? null : gerr(p, 'At least one of [--metadata] or [--metadata-from-file] must be provided.'))
  }),
  cmd('gcloud', 'compute instances add-tags', 'INSTANCE_NAME', 'zone/z *tags~list'),
  cmd('gcloud', 'compute instances update', 'INSTANCE_NAME', 'zone/z !deletion-protection update-labels~list'),
  cmd('gcloud', 'compute ssh', 'INSTANCE', 'zone/z command !internal-ip !tunnel-through-iap ssh-flag+ !dry-run ssh-key-file', {
    dashArgs: true,
    atMostOne: [['internal-ip', 'tunnel-through-iap']]
  }),
  cmd('gcloud', 'compute scp', 'SOURCES... DESTINATION', 'zone/z !recurse !tunnel-through-iap'),
  cmd('gcloud', 'compute project-info add-metadata', '', 'metadata+ metadata-from-file+'),
  cmd('gcloud', 'compute project-info describe'),
  cmd('gcloud', 'compute disks create', 'DISK_NAMES...', `${LOC} size~size type image image-project source-snapshot`),
  cmd('gcloud', 'compute disks list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute disks describe', 'DISK_NAME', LOC),
  cmd('gcloud', 'compute disks delete', 'DISK_NAMES...', LOC),
  cmd('gcloud', 'compute disks snapshot', 'DISK_NAMES...', `${LOC} snapshot-names~list description !guest-flush storage-location !async`, { atMostOne: [['zone', 'region']] }),
  cmd('gcloud', 'compute disks resize', 'DISK_NAMES...', `*size~size ${LOC}`, { atMostOne: [['zone', 'region']] }),
  cmd('gcloud', 'compute disks add-resource-policies', 'DISK_NAME', `*resource-policies~list ${LOC}`),
  cmd('gcloud', 'compute snapshots list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute snapshots describe', 'SNAPSHOT_NAME'),
  cmd('gcloud', 'compute snapshots delete', 'SNAPSHOT_NAMES...'),
  cmd('gcloud', 'compute snapshots create', 'NAME', 'source-disk source-disk-zone source-disk-region storage-location'),
  cmd(
    'gcloud',
    'compute resource-policies create snapshot-schedule',
    'NAME',
    '*max-retention-days region start-time !daily-schedule hourly-schedule weekly-schedule~lower:monday,tuesday,wednesday,thursday,friday,saturday,sunday weekly-schedule-from-file on-source-disk-delete:apply-retention-policy,keep-auto-snapshots storage-location !guest-flush description',
    {
      check: (p) => {
        if (!has(p, 'weekly-schedule-from-file') && !has(p, 'start-time'))
          return gerr(p, 'Exactly one of (--weekly-schedule-from-file | --start-time=START_TIME (--daily-schedule | --hourly-schedule=HOURS | --weekly-schedule=WEEKLY_CYCLE)) must be specified.');
        if (has(p, 'start-time') && ['daily-schedule', 'hourly-schedule', 'weekly-schedule'].filter((f) => has(p, f)).length !== 1)
          return gerr(p, 'Exactly one of (--daily-schedule | --hourly-schedule=HOURS | --weekly-schedule=WEEKLY_CYCLE) must be specified.');
        return null;
      }
    }
  ),
  cmd('gcloud', 'compute resource-policies list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute resource-policies delete', 'NAME', 'region'),
  cmd('gcloud', 'compute images create', 'IMAGE_NAME', 'source-disk source-disk-zone source-image source-image-family source-image-project source-snapshot source-uri family !force storage-location description', {
    oneOf: [['source-disk', 'source-image', 'source-image-family', 'source-snapshot', 'source-uri']]
  }),
  cmd('gcloud', 'compute images list', '', `!standard-images !show-deprecated ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute images describe', 'IMAGE_NAME'),
  cmd('gcloud', 'compute images describe-from-family', 'FAMILY'),
  cmd('gcloud', 'compute images delete', 'IMAGE_NAMES...'),
  cmd('gcloud', 'compute instance-templates create', 'NAME', `${VM_FLAGS} region instance-template-region`),
  cmd('gcloud', 'compute instance-templates list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute instance-templates describe', 'NAME'),
  cmd('gcloud', 'compute instance-templates delete', 'NAMES...'),
  cmd('gcloud', 'compute instance-groups managed create', 'NAME', '*size *template base-instance-name health-check initial-delay zone/z region zones~list', {
    atMostOne: [['zone', 'region', 'zones']]
  }),
  cmd(
    'gcloud',
    'compute instance-groups managed set-autoscaling',
    'NAME',
    '*max-num-replicas min-num-replicas target-cpu-utilization cool-down-period mode:off,on,only-scale-out,only-up target-load-balancing-utilization zone/z region',
    {
      check: (p) => bounded(p, 'target-cpu-utilization', 0, 1, true),
      deprecated: { mode: '' }
    }
  ),
  cmd('gcloud', 'compute instance-groups managed rolling-action start-update', 'NAME', '*version canary-version type:opportunistic,proactive max-surge max-unavailable zone/z region'),
  cmd('gcloud', 'compute instance-groups managed rolling-action replace', 'NAME', 'max-surge max-unavailable zone/z region'),
  cmd('gcloud', 'compute instance-groups managed resize', 'NAME', '*size zone/z region'),
  cmd('gcloud', 'compute instance-groups managed update', 'NAME', 'health-check initial-delay zone/z region'),
  cmd('gcloud', 'compute instance-groups managed list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute instance-groups managed describe', 'NAME', 'zone/z region'),
  cmd('gcloud', 'compute instance-groups managed list-instances', 'NAME', 'zone/z region'),
  cmd('gcloud', 'compute instance-groups managed delete', 'NAMES...', 'zone/z region'),
  cmd('gcloud', 'compute instance-groups set-named-ports', 'NAME', '*named-ports~list zone/z region'),

  // networking
  cmd('gcloud', 'compute networks create', 'NAME', 'subnet-mode~lower:auto,custom,legacy bgp-routing-mode~lower:global,regional mtu description range', {
    deprecated: { range: '' }
  }),
  cmd('gcloud', 'compute networks list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute networks describe', 'NAME'),
  cmd('gcloud', 'compute networks delete', 'NAMES...'),
  cmd('gcloud', 'compute networks subnets create', 'NAME', '*network range region !enable-private-ip-google-access secondary-range+ purpose stack-type~upper:IPV4_ONLY,IPV4_IPV6,IPV6_ONLY !enable-flow-logs'),
  cmd('gcloud', 'compute networks subnets expand-ip-range', 'NAME', '*prefix-length region'),
  cmd('gcloud', 'compute networks subnets update', 'NAME', 'region !enable-private-ip-google-access !enable-flow-logs add-secondary-ranges+'),
  cmd('gcloud', 'compute networks subnets list', '', `network ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute networks subnets describe', 'NAME', 'region'),
  cmd('gcloud', 'compute networks subnets delete', 'NAMES...', 'region'),
  cmd('gcloud', 'compute networks peerings create', 'NAME', '*network *peer-network peer-project !export-custom-routes !import-custom-routes stack-type !auto-create-routes', {
    deprecated: { 'auto-create-routes': 'WARNING: Flag --auto-create-routes is deprecated and will be removed in a future release.' }
  }),
  cmd('gcloud', 'compute networks peerings list', '', `network ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute networks peerings delete', 'NAME', '*network'),
  cmd(
    'gcloud',
    'compute firewall-rules create',
    'NAME',
    'action~upper:ALLOW,DENY allow~list rules~list direction~upper:INGRESS,EGRESS,IN,OUT network priority source-ranges~list source-tags~list target-tags~list destination-ranges~list target-service-accounts~list source-service-accounts~list !disabled !enable-logging description',
    {
      oneOf: [['action', 'allow']],
      check: (p) => {
        if (has(p, 'action') && !has(p, 'rules')) return gerr(p, 'argument --rules: Must be specified.');
        return bounded(p, 'priority', 0, 65535);
      }
    }
  ),
  cmd('gcloud', 'compute firewall-rules list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute firewall-rules describe', 'NAME'),
  cmd('gcloud', 'compute firewall-rules update', 'NAME', 'allow~list rules~list priority source-ranges~list target-tags~list !disabled !enable-logging'),
  cmd('gcloud', 'compute firewall-rules delete', 'NAMES...'),
  cmd('gcloud', 'compute addresses create', 'NAMES...', '!global region subnet addresses~list ip-version~upper:IPV4,IPV6 network-tier~upper:PREMIUM,STANDARD purpose prefix-length network description', {
    atMostOne: [['global', 'region']]
  }),
  cmd('gcloud', 'compute addresses list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute addresses describe', 'NAME', '!global region'),
  cmd('gcloud', 'compute addresses delete', 'NAMES...', '!global region'),
  cmd('gcloud', 'compute routers create', 'NAME', 'network ncc-gateway asn region advertisement-mode~upper:CUSTOM,DEFAULT', { oneOf: [['network', 'ncc-gateway']] }),
  cmd('gcloud', 'compute routers list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute routers describe', 'NAME', 'region'),
  cmd('gcloud', 'compute routers delete', 'NAMES...', 'region'),
  cmd(
    'gcloud',
    'compute routers nats create',
    'NAME',
    '*router region !auto-allocate-nat-external-ips nat-external-ip-pool~list !nat-all-subnet-ip-ranges nat-custom-subnet-ip-ranges~list !nat-primary-subnet-ip-ranges type~upper:PUBLIC,PRIVATE log-filter~upper:ALL,ERRORS_ONLY,TRANSLATIONS_ONLY !enable-logging min-ports-per-vm',
    {
      oneOf: [
        ['auto-allocate-nat-external-ips', 'nat-external-ip-pool'],
        ['nat-all-subnet-ip-ranges', 'nat-custom-subnet-ip-ranges', 'nat-primary-subnet-ip-ranges']
      ]
    }
  ),
  cmd('gcloud', 'compute routers nats list', '', `*router region ${GCLOUD_LIST}`),
  cmd('gcloud', 'compute health-checks create http', 'NAME', 'port request-path check-interval timeout healthy-threshold unhealthy-threshold !global region'),
  cmd('gcloud', 'compute health-checks create tcp', 'NAME', 'port check-interval timeout !global region'),
  cmd('gcloud', 'compute health-checks list', '', GCLOUD_LIST),
  cmd(
    'gcloud',
    'compute backend-services create',
    'NAME',
    'protocol~upper:HTTP,HTTPS,HTTP2,TCP,SSL,UDP,GRPC,UNSPECIFIED health-checks~list !global region load-balancing-scheme~upper:EXTERNAL,EXTERNAL_MANAGED,INTERNAL,INTERNAL_MANAGED port-name !enable-cdn timeout security-policy',
    { atMostOne: [['global', 'region']] }
  ),
  cmd(
    'gcloud',
    'compute backend-services add-backend',
    'NAME',
    'instance-group instance-group-zone instance-group-region network-endpoint-group network-endpoint-group-region network-endpoint-group-zone !global region balancing-mode~upper:UTILIZATION,RATE,CONNECTION max-utilization max-rate-per-instance',
    { oneOf: [['instance-group', 'network-endpoint-group']] }
  ),
  cmd('gcloud', 'compute backend-services update', 'NAME', '!global region security-policy !enable-cdn !iap'),
  cmd('gcloud', 'compute backend-services list', '', GCLOUD_LIST),
  cmd('gcloud', 'compute url-maps create', 'NAME', 'default-service default-backend-bucket !global region', { oneOf: [['default-service', 'default-backend-bucket']] }),
  cmd('gcloud', 'compute target-http-proxies create', 'NAME', '*url-map !global region'),
  cmd('gcloud', 'compute target-https-proxies create', 'NAME', '*url-map ssl-certificates~list !global region'),
  cmd('gcloud', 'compute ssl-certificates create', 'NAME', 'domains~list certificate private-key !global region'),
  cmd(
    'gcloud',
    'compute forwarding-rules create',
    'NAME',
    '!global region target-http-proxy target-https-proxy ports~list address load-balancing-scheme~upper:EXTERNAL,EXTERNAL_MANAGED,INTERNAL,INTERNAL_MANAGED backend-service network subnet ip-protocol~upper:TCP,UDP,ESP,AH,SCTP,ICMP,L3_DEFAULT'
  ),
  cmd('gcloud', 'compute forwarding-rules list', '', GCLOUD_LIST),
  cmd(
    'gcloud',
    'compute network-endpoint-groups create',
    'NAME',
    'region zone network-endpoint-type~lower:serverless,gce-vm-ip-port,internet-fqdn-port,internet-ip-port,private-service-connect cloud-run-service cloud-function-name !app-engine-app network subnet default-port'
  ),
  cmd('gcloud', 'compute backend-buckets create', 'NAME', '*gcs-bucket-name !enable-cdn'),
  cmd('gcloud', 'compute security-policies create', 'NAME', 'description type'),
  cmd('gcloud', 'compute security-policies rules create', 'PRIORITY', '*security-policy action~lower:allow,deny-403,deny-404,deny-502,redirect,throttle,rate-based-ban src-ip-ranges~list expression description', {
    oneOf: [['src-ip-ranges', 'expression']]
  }),
  cmd('gcloud', 'dns managed-zones create', 'ZONE_NAME', '*dns-name~dns description visibility~lower:private,public networks~list dnssec-state~lower:off,on,transfer forwarding-targets~list'),
  cmd('gcloud', 'dns managed-zones list', '', GCLOUD_LIST),
  cmd('gcloud', 'dns managed-zones describe', 'ZONE_NAME'),
  cmd('gcloud', 'dns managed-zones delete', 'ZONE_NAME'),
  cmd('gcloud', 'dns record-sets create', 'NAME', '*zone *type~upper rrdatas~list ttl'),
  cmd('gcloud', 'dns record-sets list', '', `*zone ${GCLOUD_LIST}`),

  // GKE and Artifact Registry
  cmd(
    'gcloud',
    'container clusters create',
    'NAME',
    'zone/z region location num-nodes machine-type/m !enable-autoscaling min-nodes max-nodes release-channel~lower:none,extended,rapid,regular,stable disk-type disk-size~size !enable-ip-alias node-locations~list tier !enable-private-nodes master-ipv4-cidr network subnetwork workload-pool !spot !preemptible cluster-version !enable-autorepair !enable-autoupgrade scopes~list service-account',
    {
      atMostOne: [['zone', 'region', 'location']],
      check: (p) => {
        const n = p.pos[0];
        if (n && (n.length > 40 || !/^[a-z]([-a-z0-9]*[a-z0-9])?$/.test(n)))
          return gerr(p, `argument NAME: Invalid value for [NAME]: Cluster name must be only lowercase alphanumerics and '-', must start with a letter and end with an alphanumeric, and must be no longer than 40 characters.`);
        return null;
      }
    }
  ),
  cmd('gcloud', 'container clusters create-auto', 'NAME', 'region location zone/z network subnetwork release-channel~lower:extended,rapid,regular,stable !enable-private-nodes', {
    atMostOne: [['region', 'location', 'zone']]
  }),
  cmd('gcloud', 'container clusters get-credentials', 'NAME', 'zone/z region location !internal-ip !dns-endpoint', { atMostOne: [['zone', 'region', 'location']] }),
  cmd('gcloud', 'container clusters list', '', `zone/z region location ${GCLOUD_LIST}`),
  cmd('gcloud', 'container clusters describe', 'NAME', 'zone/z region location'),
  cmd('gcloud', 'container clusters delete', 'NAMES...', 'zone/z region location !async'),
  cmd('gcloud', 'container clusters resize', 'NAME', 'num-nodes size node-pool zone/z region location !async', {
    oneOf: [['num-nodes', 'size']],
    deprecated: { size: 'WARNING: The --size flag is now deprecated. Please use --num-nodes instead.' }
  }),
  cmd(
    'gcloud',
    'container clusters update',
    'NAME',
    '!enable-autoscaling min-nodes max-nodes total-min-nodes total-max-nodes node-pool zone/z region location release-channel~lower:none,extended,rapid,regular,stable !enable-vertical-pod-autoscaling workload-pool node-locations~list'
  ),
  cmd('gcloud', 'container clusters upgrade', 'NAME', '!master cluster-version node-pool image-type zone/z region location'),
  cmd('gcloud', 'container node-pools create', 'NAME', 'cluster num-nodes machine-type/m !enable-autoscaling min-nodes max-nodes !spot !preemptible zone/z region location disk-size~size node-labels~list node-taints~list'),
  cmd('gcloud', 'container node-pools list', '', `cluster zone/z region location ${GCLOUD_LIST}`),
  cmd('gcloud', 'container node-pools delete', 'NAME', 'cluster zone/z region location'),
  cmd('gcloud', 'container node-pools update', 'NAME', 'cluster zone/z region location !enable-autoscaling min-nodes max-nodes'),
  cmd('gcloud', 'container images list-tags', 'IMAGE_NAME', GCLOUD_LIST),
  cmd('gcloud', 'artifacts repositories create', 'REPOSITORY', '*repository-format~lower:apt,conda,docker,go,kfp,maven,npm,python,yum location description mode !immutable-tags kms-key', {
    check: (p) =>
      has(p, 'location')
        ? null
        : gerr(
            p,
            'Error parsing [repository].\nThe [repository] resource is not properly specified.\nFailed to find attribute [location]. The attribute can be set in the following ways: \n- provide the argument `--location` on the command line\n- set the property `artifacts/location`'
          )
  }),
  cmd('gcloud', 'artifacts repositories list', '', `location ${GCLOUD_LIST}`),
  cmd('gcloud', 'artifacts repositories describe', 'REPOSITORY', 'location'),
  cmd('gcloud', 'artifacts repositories add-iam-policy-binding', 'REPOSITORY', '*member *role location'),
  cmd('gcloud', 'artifacts docker images list', 'IMAGE_PATH', `!include-tags ${GCLOUD_LIST}`),
  cmd('gcloud', 'artifacts docker tags list', 'IMAGE', GCLOUD_LIST),
  cmd('gcloud', 'builds submit', '[SOURCE]', 'tag/t config pack region substitutions~list timeout machine-type !async !no-source', {
    atMostOne: [['tag', 'config', 'pack']]
  }),
  cmd('gcloud', 'builds list', '', `region ${GCLOUD_LIST}`),

  // serverless
  cmd(
    'gcloud',
    'run deploy',
    '[SERVICE]',
    'image source region platform port memory cpu min-instances max-instances set-env-vars~list update-env-vars~list ingress~lower:all,internal,internal-and-cloud-load-balancing service-account timeout concurrency tag !traffic !allow-unauthenticated !invoker-iam-check function base-image vpc-connector network subnet vpc-egress~lower:all-traffic,private-ranges-only set-secrets~list add-cloudsql-instances~list execution-environment~lower:gen1,gen2 !cpu-throttling !cpu-boost labels~list !async !iap',
    { atMostOne: [['image', 'source']] }
  ),
  cmd('gcloud', 'run services update-traffic', '[SERVICE]', 'region !to-latest to-revisions~list to-tags~list set-tags~list update-tags~list remove-tags~list !clear-tags', {
    atMostOne: [['to-latest', 'to-revisions', 'to-tags']]
  }),
  cmd('gcloud', 'run services update', '[SERVICE]', 'region min-instances max-instances memory cpu concurrency set-env-vars~list update-env-vars~list ingress~lower:all,internal,internal-and-cloud-load-balancing !cpu-throttling'),
  cmd('gcloud', 'run services list', '', `region ${GCLOUD_LIST}`),
  cmd('gcloud', 'run services describe', 'SERVICE', 'region'),
  cmd('gcloud', 'run services delete', 'SERVICE', 'region'),
  cmd('gcloud', 'run services add-iam-policy-binding', 'SERVICE', '*member *role region'),
  cmd('gcloud', 'run services remove-iam-policy-binding', 'SERVICE', '*member *role region'),
  cmd('gcloud', 'run revisions list', '', `service region ${GCLOUD_LIST}`),
  cmd('gcloud', 'run jobs create', 'JOB', 'image region tasks parallelism max-retries task-timeout set-env-vars~list service-account'),
  cmd('gcloud', 'run jobs execute', 'JOB', 'region !wait !async'),
  cmd('gcloud', 'run jobs list', '', `region ${GCLOUD_LIST}`),
  cmd(
    'gcloud',
    'functions deploy',
    'NAME',
    'region !gen2 runtime entry-point source !trigger-http trigger-bucket trigger-topic trigger-event trigger-resource trigger-event-filters+ !allow-unauthenticated memory timeout max-instances min-instances service-account set-env-vars~list !retry trigger-location',
    { atMostOne: [['trigger-http', 'trigger-bucket', 'trigger-topic', 'trigger-event', 'trigger-event-filters']] }
  ),
  cmd('gcloud', 'functions list', '', `regions~list ${GCLOUD_LIST}`),
  cmd('gcloud', 'functions describe', 'NAME', 'region !gen2'),
  cmd('gcloud', 'functions delete', 'NAME', 'region !gen2'),
  cmd('gcloud', 'functions call', 'NAME', 'region data'),
  cmd('gcloud', 'functions logs read', '[NAME]', 'region limit'),
  cmd('gcloud', 'app create', '', 'region service-account ssl-policy'),
  cmd('gcloud', 'app deploy', '[DEPLOYABLES...]', 'version/v !promote !stop-previous-version bucket image-url appyaml ignore-file service-account'),
  cmd('gcloud', 'app services set-traffic', '[SERVICES...]', '*splits~splits split-by~lower:cookie,ip,random !migrate'),
  cmd('gcloud', 'app services list', '', GCLOUD_LIST),
  cmd('gcloud', 'app versions list', '', `service/s !hide-no-traffic ${GCLOUD_LIST}`),
  cmd('gcloud', 'app versions delete', 'VERSIONS...', 'service/s'),
  cmd('gcloud', 'app versions stop', 'VERSIONS...', 'service/s'),
  cmd('gcloud', 'app versions start', 'VERSIONS...', 'service/s'),
  cmd('gcloud', 'app browse', '', '!launch-browser service/s version/v'),
  cmd('gcloud', 'app logs read', '', 'level limit logs~list service/s version/v'),
  cmd('gcloud', 'app logs tail', '', 'level logs~list service/s version/v'),
  cmd('gcloud', 'app instances list', '', `service/s version/v ${GCLOUD_LIST}`),

  // operations, data, security
  cmd('gcloud', 'logging read', '[LOG_FILTER]', 'freshness order~lower:asc,desc limit folder organization billing-account bucket location view'),
  cmd('gcloud', 'logging logs list', '', GCLOUD_LIST),
  cmd('gcloud', 'logging logs delete', 'LOG_NAME'),
  cmd('gcloud', 'logging sinks create', 'SINK_NAME DESTINATION', 'log-filter !include-children !use-partitioned-tables description exclusion+ organization folder'),
  cmd('gcloud', 'logging sinks list', '', GCLOUD_LIST),
  cmd('gcloud', 'logging sinks describe', 'SINK_NAME'),
  cmd('gcloud', 'logging sinks update', 'SINK_NAME [DESTINATION]', 'log-filter'),
  cmd('gcloud', 'logging sinks delete', 'SINK_NAME'),
  cmd('gcloud', 'logging buckets update', 'BUCKET_ID', '*location retention-days description !locked'),
  cmd('gcloud', 'logging buckets list', '', `location ${GCLOUD_LIST}`),
  cmd('gcloud', 'logging metrics create', 'METRIC_NAME', 'description log-filter config-from-file'),
  cmd(
    'gcloud',
    'sql instances create',
    'INSTANCE',
    'database-version tier/t edition~lower:enterprise,enterprise-plus cpu memory region zone root-password storage-size~size storage-type~upper:SSD,HDD availability-type~lower:regional,zonal network !assign-ip backup-start-time !enable-bin-log master-instance-name !deletion-protection !storage-auto-increase !enable-point-in-time-recovery authorized-networks~list'
  ),
  cmd('gcloud', 'sql instances list', '', GCLOUD_LIST),
  cmd('gcloud', 'sql instances describe', 'INSTANCE'),
  cmd('gcloud', 'sql instances delete', 'INSTANCE'),
  cmd('gcloud', 'sql instances patch', 'INSTANCE', 'authorized-networks~list availability-type~lower:regional,zonal tier/t backup-start-time !enable-bin-log !deletion-protection cpu memory !assign-ip'),
  cmd('gcloud', 'sql instances promote-replica', 'REPLICA'),
  cmd('gcloud', 'sql connect', 'INSTANCE', 'user/u database/d port'),
  cmd('gcloud', 'sql backups create', '', '*instance/i description !async'),
  cmd('gcloud', 'sql backups list', '', `*instance/i ${GCLOUD_LIST}`),
  cmd('gcloud', 'sql backups describe', 'ID', '*instance/i'),
  cmd('gcloud', 'sql backups restore', 'BACKUP_ID', '*restore-instance backup-instance'),
  cmd('gcloud', 'sql export sql', 'INSTANCE URI', 'database/d~list table/t~list !offload !async'),
  cmd('gcloud', 'sql import sql', 'INSTANCE URI', 'database/d'),
  cmd('gcloud', 'sql databases create', 'DATABASE', '*instance/i charset collation'),
  cmd('gcloud', 'sql users create', 'USERNAME', '*instance/i password host'),
  cmd('gcloud', 'kms keyrings create', 'KEYRING', '*location'),
  cmd('gcloud', 'kms keys create', 'KEY', '*keyring *location *purpose~lower:encryption,asymmetric-signing,asymmetric-encryption,mac rotation-period next-rotation-time'),
  cmd('gcloud', 'kms encrypt', '', 'key keyring location *plaintext-file *ciphertext-file additional-authenticated-data-file'),
  cmd('gcloud', 'kms decrypt', '', 'key keyring location *ciphertext-file *plaintext-file additional-authenticated-data-file'),
  cmd('gcloud', 'secrets create', 'SECRET', 'data-file replication-policy~lower:automatic,user-managed locations~list labels~list'),
  cmd('gcloud', 'secrets versions add', 'SECRET', '*data-file'),
  cmd('gcloud', 'secrets versions access', 'VERSION', '*secret'),
  cmd('gcloud', 'secrets list', '', GCLOUD_LIST),
  cmd('gcloud', 'secrets add-iam-policy-binding', 'SECRET', '*member *role'),
  cmd('gcloud', 'deployment-manager deployments create', 'DEPLOYMENT_NAME', 'config template composite-type !preview properties description labels~list !async !automatic-rollback-on-error', {
    oneOf: [['config', 'template', 'composite-type']]
  }),
  cmd('gcloud', 'deployment-manager deployments update', 'DEPLOYMENT_NAME', 'config template composite-type !preview create-policy delete-policy~lower:abandon,delete', {
    atMostOne: [['config', 'template', 'composite-type']]
  }),
  cmd('gcloud', 'deployment-manager deployments delete', 'DEPLOYMENT_NAME'),
  cmd('gcloud', 'deployment-manager deployments list', '', GCLOUD_LIST),
  cmd('gcloud', 'pubsub topics create', 'TOPIC...', 'labels~list message-retention-duration schema kms-key-name'),
  cmd('gcloud', 'pubsub topics list', '', GCLOUD_LIST),
  cmd('gcloud', 'pubsub topics delete', 'TOPIC...'),
  cmd('gcloud', 'pubsub topics publish', 'TOPIC', 'message attribute~list'),
  cmd(
    'gcloud',
    'pubsub subscriptions create',
    'SUBSCRIPTION...',
    '*topic topic-project ack-deadline push-endpoint push-auth-service-account push-auth-token-audience message-retention-duration !retain-acked-messages expiration-period message-filter dead-letter-topic max-delivery-attempts !enable-message-ordering !enable-exactly-once-delivery bigquery-table cloud-storage-bucket min-retry-delay max-retry-delay',
    {
      check: (p) => bounded(p, 'ack-deadline', 10, 600) ?? bounded(p, 'max-delivery-attempts', 5, 100)
    }
  ),
  cmd('gcloud', 'pubsub subscriptions pull', 'SUBSCRIPTION', '!auto-ack limit'),
  cmd('gcloud', 'pubsub subscriptions list', '', GCLOUD_LIST),
  cmd('gcloud', 'pubsub subscriptions update', 'SUBSCRIPTION', 'ack-deadline push-endpoint dead-letter-topic max-delivery-attempts'),
  cmd('gcloud', 'pubsub subscriptions delete', 'SUBSCRIPTION...'),
  cmd('gcloud', 'scheduler jobs create http', 'JOB', '*schedule *uri location http-method~upper:GET,POST,PUT,DELETE,HEAD,PATCH,OPTIONS message-body oidc-service-account-email oidc-token-audience time-zone headers~list'),
  cmd('gcloud', 'scheduler jobs create pubsub', 'JOB', '*schedule *topic location message-body time-zone'),
  cmd('gcloud', 'scheduler jobs list', '', `location ${GCLOUD_LIST}`),
  cmd('gcloud', 'eventarc triggers create', 'TRIGGER', '*location destination-run-service destination-run-region *event-filters+ service-account'),
  cmd('gcloud', 'monitoring dashboards list', '', GCLOUD_LIST),
  cmd('gcloud', 'source repos clone', 'REPOSITORY_NAME [DIRECTORY_NAME]', '', { hidden: true })
];

// ── gsutil ──────────────────────────────────────────────────────────────────

export const GSUTIL_TOP = '!m o+ h+ u !q !D';

const gsutilSpecs: Spec[] = [
  cmd('gsutil', 'mb', 'URLS...', 'b~lower:on,off c~upper k l~upper p !autoclass retention pap placement~list rpo', {
    usage: 'gsutil mb [-b (on|off)] [-c <class>] [-k <key>] [-l <location>] [-p <project>]\n          [--autoclass] [--retention <time>] [--pap <setting>]\n          [--placement <region1>,<region2>]\n          [--rpo {ASYNC_TURBO|DEFAULT}] gs://<bucket_name>...'
  }),
  cmd('gsutil', 'ls', '[URLS...]', '!a !b !d !e !h !l !L !r !R p', { usage: 'gsutil ls [-a] [-b] [-d] [-l] [-L] [-r] [-p proj_id] url...' }),
  cmd('gsutil', 'stat', 'URLS...', '', { usage: 'gsutil stat url...' }),
  cmd('gsutil', 'cp', 'SOURCES... DESTINATION', 'a !A !c !D !e !I j !J L !M !n !p !P !R !r s~upper !U !v z', { usage: 'gsutil cp [OPTION]... src_url dst_url' }),
  cmd('gsutil', 'rsync', 'SOURCE DESTINATION', 'a !c !C !d !e !i j !J !n !P !r !R !U !u x', { usage: 'gsutil rsync [OPTION]... src_url dst_url' }),
  cmd('gsutil', 'mv', 'SOURCES... DESTINATION', '!p', { usage: 'gsutil mv [-p] src_url dst_url' }),
  cmd('gsutil', 'rm', 'URLS...', '!f !r !R !a !I', { usage: 'gsutil rm [-f] [-r] url...' }),
  cmd('gsutil', 'du', '[URLS...]', '!s !h !c !a', { usage: 'gsutil du url...' }),
  cmd('gsutil', 'cat', 'URLS...', '!h r', { usage: 'gsutil cat [-h] url...' }),
  cmd('gsutil', 'lifecycle set', 'CONFIG_FILE URLS...', '', { usage: 'gsutil lifecycle set <config-json-file> gs://<bucket_name>...' }),
  cmd('gsutil', 'lifecycle get', 'URL', '', { usage: 'gsutil lifecycle get gs://<bucket_name>' }),
  cmd('gsutil', 'versioning set', 'MODE URLS...', '', {
    usage: 'gsutil versioning set (on|off) gs://<bucket_name>...',
    check: (p) => (/^(on|off)$/.test(p.pos[0] ?? '') ? null : `CommandException: Argument to "set" must be either <on|off>`)
  }),
  cmd('gsutil', 'versioning get', 'URLS...', '', { usage: 'gsutil versioning get gs://<bucket_name>...' }),
  cmd('gsutil', 'defstorageclass set', 'CLASS URLS...', '', { usage: 'gsutil defstorageclass set <storage-class> gs://<bucket_name>...' }),
  cmd('gsutil', 'defstorageclass get', 'URLS...', '', { usage: 'gsutil defstorageclass get gs://<bucket_name>...' }),
  cmd('gsutil', 'rewrite', 'URLS...', 's~upper !k !O !f !r !R', {
    usage: 'gsutil rewrite -k [-O] [-f] [-r] [-s] url...\ngsutil rewrite -s [-k] [-O] [-f] [-r] url...',
    check: (p) =>
      has(p, 's') || has(p, 'k')
        ? null
        : 'CommandException: rewrite command requires at least one transformation flag. Currently supported transformation flags: -k (encryption key) and -s (storage class).'
  }),
  cmd('gsutil', 'iam ch', 'BINDINGS... URL', '!f !R !r d+', { usage: 'gsutil iam ch [-fRr] binding ... url' }),
  cmd('gsutil', 'iam get', 'URL', '', { usage: 'gsutil iam get url' }),
  cmd('gsutil', 'iam set', 'FILE URLS...', '!R !r e', { usage: 'gsutil iam set [-afRr] [-e <etag>] file url ...' }),
  cmd('gsutil', 'signurl', 'KEYFILE URLS...', 'c d m p r b !u', {
    usage: 'gsutil signurl [-c <content_type>] [-d <duration>] [-m <http_method>] \\\n    [-p <password>] [-r <region>] [-b <project>] (-u | <private-key-file>) \\\n    (gs://<bucket_name> | gs://<bucket_name>/<object_name>)...'
  }),
  cmd('gsutil', 'retention set', 'PERIOD URLS...', '', { usage: 'gsutil retention set <retention_period> gs://<bucket_name>...' }),
  cmd('gsutil', 'retention lock', 'URLS...', '', { usage: 'gsutil retention lock gs://<bucket_name>...' }),
  cmd('gsutil', 'notification create', 'URL', '*f~lower:json,none t e+', { usage: 'gsutil notification create -f (json|none) [-p <prefix>] [-t <topic>] \\\n    [-m <key>:<value>]... [-e <eventType>]... gs://<bucket_name>' }),
  cmd('gsutil', 'web set', 'URLS...', 'm e', { usage: 'gsutil web set [-m <main_page_suffix>] [-e <error_page>] gs://<bucket_name>...' })
];

// gcloud storage lives in the gcloud tree.
gcloudSpecs.push(
  cmd(
    'gcloud',
    'storage buckets create',
    'URLS...',
    'location/l~upper default-storage-class/c/s~upper !uniform-bucket-level-access/b !public-access-prevention/pap retention-period soft-delete-duration lifecycle-file placement~list !enable-hierarchical-namespace !enable-autoclass rpo labels~list'
  ),
  cmd(
    'gcloud',
    'storage buckets update',
    'URLS...',
    '!versioning default-storage-class/c/s~upper lifecycle-file !clear-lifecycle retention-period !clear-retention-period !lock-retention-period !uniform-bucket-level-access soft-delete-duration !clear-soft-delete update-labels~list !requester-pays web-main-page-suffix web-error-page !public-access-prevention/pap'
  ),
  cmd('gcloud', 'storage buckets describe', 'URL'),
  cmd('gcloud', 'storage buckets list', '[URLS...]', GCLOUD_LIST),
  cmd('gcloud', 'storage buckets delete', 'URLS...'),
  cmd('gcloud', 'storage buckets add-iam-policy-binding', 'URL', '*member *role condition'),
  cmd('gcloud', 'storage buckets remove-iam-policy-binding', 'URL', '*member *role'),
  cmd('gcloud', 'storage buckets get-iam-policy', 'URL'),
  cmd('gcloud', 'storage buckets notifications create', 'URL', '*topic payload-format~lower:json,none event-types~list'),
  cmd('gcloud', 'storage ls', '[PATH...]', '!recursive/r/R !long/l !full/L !json/j !all-versions/a !buckets/b !readable-sizes !soft-deleted'),
  cmd('gcloud', 'storage cp', 'SOURCES... DESTINATION', '!recursive/r/R !no-clobber/n storage-class/s~upper !continue-on-error/c !preserve-posix/P canned-acl'),
  cmd('gcloud', 'storage rsync', 'SOURCE DESTINATION', '!recursive/r/R !delete-unmatched-destination-objects !dry-run exclude/x !checksums-only !no-clobber/n'),
  cmd('gcloud', 'storage mv', 'SOURCES... DESTINATION'),
  cmd('gcloud', 'storage rm', 'URLS...', '!recursive/r/R !all-versions/a !continue-on-error'),
  cmd('gcloud', 'storage cat', 'URLS...'),
  cmd('gcloud', 'storage du', '[URLS...]', '!summarize/s !readable-sizes'),
  cmd('gcloud', 'storage objects describe', 'URL'),
  cmd('gcloud', 'storage objects list', 'URLS...', GCLOUD_LIST),
  cmd('gcloud', 'storage objects update', 'URLS...', 'storage-class/s~upper !temporary-hold !event-based-hold !recursive/r/R'),
  cmd('gcloud', 'storage sign-url', 'URL', 'duration/d http-verb/m~upper private-key-file headers~list region/r')
);

// ── kubectl ─────────────────────────────────────────────────────────────────

export const KUBECTL_GLOBAL = 'namespace/n context kubeconfig cluster user server/s v';

/** Resource type spellings → canonical plural. */
export const KUBE_TYPES: Record<string, string> = {};
for (const [canon, ...alts] of [
  ['pods', 'pod', 'po'],
  ['services', 'service', 'svc'],
  ['deployments', 'deployment', 'deploy', 'deployment.apps', 'deployments.apps', 'deployment.v1.apps'],
  ['nodes', 'node', 'no'],
  ['namespaces', 'namespace', 'ns'],
  ['configmaps', 'configmap', 'cm'],
  ['secrets', 'secret'],
  ['horizontalpodautoscalers', 'horizontalpodautoscaler', 'hpa'],
  ['replicasets', 'replicaset', 'rs'],
  ['daemonsets', 'daemonset', 'ds'],
  ['statefulsets', 'statefulset', 'sts'],
  ['jobs', 'job'],
  ['cronjobs', 'cronjob', 'cj'],
  ['ingresses', 'ingress', 'ing'],
  ['events', 'event', 'ev'],
  ['persistentvolumeclaims', 'persistentvolumeclaim', 'pvc'],
  ['persistentvolumes', 'persistentvolume', 'pv'],
  ['serviceaccounts', 'serviceaccount', 'sa'],
  ['endpoints', 'endpoint', 'ep'],
  ['all']
])
  for (const n of [canon, ...alts]) KUBE_TYPES[n] = canon;

/** Commands whose first positional is a resource TYPE (then names, or TYPE/NAME). */
export const KUBE_TYPED = new Set(['get', 'describe', 'delete', 'scale', 'expose', 'autoscale', 'set image', 'rollout status', 'rollout history', 'rollout undo', 'rollout restart', 'label', 'annotate', 'edit']);
/** Commands whose first positional is a pod name or TYPE/NAME. */
export const KUBE_PODLIKE = new Set(['logs', 'exec', 'port-forward']);

const needType = (p: Parsed, verb: string): string[] | null =>
  p.pos.length
    ? null
    : [`error: You must specify the type of resource to ${verb}. Use "kubectl api-resources" for a complete list of supported resources.`];

const needResource = (p: Parsed): string[] | null =>
  p.pos.length || has(p, 'filename')
    ? null
    : [
        'error: You must provide one or more resources by argument or filename.',
        'Example resource specifications include:',
        "   '-f rsrc.yaml'",
        "   '--filename=rsrc.json'",
        "   '<resource> <name>'",
        "   '<resource>'"
      ];

const oneName = (p: Parsed): string[] | null => (p.pos.length === 1 ? null : kerr(p, `exactly one NAME is required, got ${p.pos.length}`));

const kubectlSpecs: Spec[] = [
  cmd('kubectl', 'get', '[TYPE] [NAME...]', 'output/o selector/l !all-namespaces/A !watch/w !show-labels sort-by field-selector filename/f+ !no-headers', {
    check: (p) =>
      p.pos.length || has(p, 'filename')
        ? null
        : [
            'You must specify the type of resource to get. Use "kubectl api-resources" for a complete list of supported resources.',
            '',
            'error: Required resource not specified.',
            'Use "kubectl explain <resource>" for a detailed description of that resource (e.g. kubectl explain pods).',
            "See 'kubectl get -h' for help and examples"
          ]
  }),
  cmd('kubectl', 'describe', '[TYPE] [NAME...]', 'selector/l !all-namespaces/A filename/f+', { check: (p) => needType(p, 'describe') }),
  cmd('kubectl', 'logs', '[POD] [CONTAINER]', '!follow/f !previous/p container/c selector/l !all-containers since tail !timestamps', {
    check: (p) =>
      p.pos.length || has(p, 'selector')
        ? null
        : ["error: expected 'logs [-f] [-p] (POD | TYPE/NAME) [-c CONTAINER]'.", 'POD or TYPE/NAME is a required argument for the logs command', "See 'kubectl logs -h' for help and examples"]
  }),
  cmd('kubectl', 'exec', '[POD] [COMMAND...]', '!stdin/i !tty/t container/c filename/f', {
    dashArgs: true,
    check: (p) => {
      if (p.pos.length > 1 && !p.rest) return kerr(p, 'exec [POD] [COMMAND] is not supported anymore. Use exec [POD] -- [COMMAND] instead');
      if (!p.pos.length) return kerr(p, 'expected \'exec (POD | TYPE/NAME) COMMAND [ARG1] [ARG2] ... [ARGN]\'.\nPOD or TYPE/NAME is a required argument for the exec command');
      if (!p.rest?.length) return ['error: you must specify at least one command for the container'];
      return null;
    }
  }),
  cmd('kubectl', 'port-forward', '[POD] [PORTS...]', 'address', {
    check: (p) => (p.pos.length >= 2 ? null : kerr(p, 'TYPE/NAME and list of ports are required for port-forward'))
  }),
  cmd('kubectl', 'top pod|pods|po', '[NAME]', '!containers sort-by:cpu,memory selector/l !all-namespaces/A'),
  cmd('kubectl', 'top node|nodes|no', '[NAME]', 'sort-by:cpu,memory selector/l'),
  cmd('kubectl', 'apply', '', 'filename/f+ kustomize/k !recursive/R dry-run:none,client,server !prune !server-side selector/l', {
    check: (p) => (has(p, 'filename') || has(p, 'kustomize') ? null : ['error: must specify one of -f and -k'])
  }),
  cmd('kubectl', 'delete', '[TYPE] [NAME...]', 'filename/f+ kustomize/k selector/l !all !force grace-period !now cascade wait', { check: needResource }),
  cmd('kubectl', 'create deployment|deploy', 'NAME', '*image+ replicas/r port dry-run:none,client,server output/o', { dashArgs: true, check: oneName }),
  cmd('kubectl', 'create secret generic', 'NAME', 'from-literal+ from-file+ from-env-file type dry-run:none,client,server output/o', { check: oneName }),
  cmd('kubectl', 'create secret docker-registry', 'NAME', 'docker-server docker-username docker-password docker-email', { check: oneName }),
  cmd('kubectl', 'create secret tls', 'NAME', '*cert *key', { check: oneName }),
  cmd('kubectl', 'create configmap|cm', 'NAME', 'from-literal+ from-file+ from-env-file dry-run:none,client,server output/o', { check: oneName }),
  cmd('kubectl', 'create namespace|ns', 'NAME', 'dry-run:none,client,server', { check: oneName }),
  cmd('kubectl', 'create serviceaccount|sa', 'NAME', '', { check: oneName }),
  cmd('kubectl', 'create job', 'NAME', 'image from', { dashArgs: true, check: oneName }),
  cmd('kubectl', 'create cronjob|cj', 'NAME', '*image *schedule', { dashArgs: true, check: oneName }),
  cmd('kubectl', 'expose', '[TYPE] [NAME]', 'port target-port type name protocol:TCP,UDP,SCTP external-ip selector/l filename/f+', {
    check: (p) => {
      const missing = needResource(p);
      if (missing) return missing;
      const t = one(p, 'type');
      if (t && !['ClusterIP', 'NodePort', 'LoadBalancer', 'ExternalName'].includes(t))
        return [`The Service "${(p.pos[0] ?? '').split('/')[1] ?? ''}" is invalid: spec.type: Unsupported value: "${t}": supported values: "ClusterIP", "ExternalName", "LoadBalancer", "NodePort"`];
      return null;
    }
  }),
  cmd('kubectl', 'scale', '[TYPE] [NAME]', '*replicas current-replicas filename/f+', { check: needResource }),
  cmd('kubectl', 'autoscale', '[TYPE] [NAME]', '*max min cpu~pct cpu-percent~pct memory name', {
    deprecated: { 'cpu-percent': "Flag --cpu-percent has been deprecated, Use --cpu with percentage or resource quantity format (e.g., '70%' for utilization or '500m' for milliCPU)." },
    check: needResource
  }),
  cmd('kubectl', 'set image', '[TYPE] [NAME] [PAIRS...]', '!all selector/l filename/f+', {
    check: (p) => (p.pos.some((x) => x.includes('=')) ? null : kerr(p, 'at least one image update is required'))
  }),
  cmd('kubectl', 'set env', '[TYPE] [NAME] [PAIRS...]', 'from env/e+ !list'),
  cmd('kubectl', 'set resources', '[TYPE] [NAME]', 'limits~list requests~list containers/c'),
  cmd('kubectl', 'rollout status', '[TYPE] [NAME]', '!watch/w timeout revision'),
  cmd('kubectl', 'rollout history', '[TYPE] [NAME]', 'revision'),
  cmd('kubectl', 'rollout undo', '[TYPE] [NAME]', 'to-revision'),
  cmd('kubectl', 'rollout restart', '[TYPE] [NAME]'),
  cmd('kubectl', 'rollout pause', '[TYPE] [NAME]'),
  cmd('kubectl', 'rollout resume', '[TYPE] [NAME]'),
  cmd('kubectl', 'cordon', '[NODE]', 'selector/l', { check: (p) => (p.pos.length ? null : kerr(p, 'USAGE: cordon NODE [flags]')) }),
  cmd('kubectl', 'uncordon', '[NODE]', 'selector/l', { check: (p) => (p.pos.length ? null : kerr(p, 'USAGE: uncordon NODE [flags]')) }),
  cmd('kubectl', 'drain', '[NODE]', '!ignore-daemonsets !delete-emptydir-data !force grace-period timeout !disable-eviction pod-selector selector/l', {
    check: (p) => (p.pos.length ? null : kerr(p, 'USAGE: drain NODE [flags]'))
  }),
  cmd('kubectl', 'config get-contexts', '[NAME]', 'output/o !no-headers'),
  cmd('kubectl', 'config current-context'),
  cmd('kubectl', 'config use-context|use', 'CONTEXT_NAME'),
  cmd('kubectl', 'config view', '', '!minify !raw output/o !flatten'),
  cmd('kubectl', 'config set-context', '[NAME]', '!current cluster user namespace'),
  cmd('kubectl', 'config delete-context', 'NAME'),
  cmd('kubectl', 'config rename-context', 'OLD NEW'),
  cmd('kubectl', 'cluster-info'),
  cmd('kubectl', 'cluster-info dump', '', 'output-directory'),
  cmd('kubectl', 'run', 'NAME', '*image port !rm !stdin/i !tty/t restart', { dashArgs: true }),
  cmd('kubectl', 'label', '[TYPE] [NAME] [PAIRS...]', '!overwrite'),
  cmd('kubectl', 'annotate', '[TYPE] [NAME] [PAIRS...]', '!overwrite'),
  cmd('kubectl', 'edit', '[TYPE] [NAME]'),
  cmd('kubectl', 'explain', 'RESOURCE', '!recursive'),
  cmd('kubectl', 'api-resources', '', '!namespaced output/o'),
  cmd('kubectl', 'version', '', '!client output/o'),
  cmd('kubectl', 'cp', 'SOURCE DESTINATION', 'container/c'),
  cmd('kubectl', 'replace', '', 'filename/f+ !force'),
  cmd('kubectl', 'patch', '[TYPE] [NAME]', 'patch/p type'),
  cmd('kubectl', 'auth can-i', 'VERB [RESOURCE]', 'as !all-namespaces/A'),
  cmd('kubectl', 'wait', '[TYPE] [NAME]', 'for timeout')
];

// ── bq ──────────────────────────────────────────────────────────────────────

export const BQ_GLOBAL = 'location project_id dataset_id format:pretty,sparse,prettyjson,json,csv,none !quiet/q !headless !synchronous_mode/sync api apilog';

const bqSpecs: Spec[] = [
  cmd(
    'bq',
    'mk',
    '[ID] [SCHEMA]',
    '!dataset/d !table/t schema description expiration default_table_expiration time_partitioning_field time_partitioning_type~upper:DAY,HOUR,MONTH,YEAR time_partitioning_expiration range_partitioning clustering_fields~list !require_partition_filter label+ !transfer_config data_source target_dataset display_name params/p view !use_legacy_sql !force/f'
  ),
  cmd('bq', 'ls', '[ID]', '!all/a !datasets/d !jobs/j max_results/n !transfer_config filter'),
  cmd('bq', 'show', '[ID]', '!job/j !schema !dataset/d !view !transfer_config !encryption_service_account'),
  cmd('bq', 'load', 'DESTINATION_TABLE SOURCE [SCHEMA]', 'source_format~upper:CSV,NEWLINE_DELIMITED_JSON,AVRO,DATASTORE_BACKUP,PARQUET,ORC !autodetect skip_leading_rows !replace field_delimiter/F time_partitioning_field time_partitioning_type schema max_bad_records'),
  cmd('bq', 'query', '[SQL...]', '!use_legacy_sql !dry_run destination_table max_rows/n !replace !append_table parameter+ !batch maximum_bytes_billed'),
  cmd('bq', 'head', '[TABLE]', 'max_rows/n start_row/s selected_fields/c~list !job/j !table/t'),
  cmd('bq', 'extract', 'SOURCE DESTINATION', 'destination_format~upper:CSV,NEWLINE_DELIMITED_JSON,AVRO,PARQUET compression~upper:GZIP,DEFLATE,SNAPPY,NONE field_delimiter/F !print_header'),
  cmd('bq', 'cp', 'SOURCES... DESTINATION', '!append_table/a !force/f !no_clobber/n destination_kms_key'),
  cmd('bq', 'rm', 'ID', '!dataset/d !force/f !recursive/r !table/t !job/j !transfer_config !model/m'),
  cmd('bq', 'update', 'ID', 'description expiration default_table_expiration !dataset/d !table/t schema set_label+'),
  cmd('bq', 'cancel', 'JOB_ID'),
  cmd('bq', 'wait', 'JOB_ID'),
  cmd('bq', 'help', '[COMMAND]'),
  cmd('bq', 'version'),
  cmd('bq', 'insert', 'TABLE [FILE]'),
  cmd('bq', 'partition', 'SOURCE DESTINATION', 'time_partitioning_type'),
  cmd('bq', 'init')
];

// ── terraform ───────────────────────────────────────────────────────────────

const tfSpecs: Spec[] = [
  cmd('terraform', 'init', '', '!upgrade !reconfigure !migrate-state backend-config+ !input !get'),
  cmd('terraform', 'fmt', '[DIR]', '!check !recursive !diff !write !list'),
  cmd('terraform', 'validate', '', '!json !no-color'),
  cmd('terraform', 'plan', '', 'out var+ var-file+ target+ !destroy !refresh-only replace+ !input !lock !detailed-exitcode !refresh parallelism !no-color'),
  cmd('terraform', 'apply', '[PLAN]', '!auto-approve var+ var-file+ target+ replace+ !input !lock parallelism !destroy !refresh-only !no-color', {
    check: (p) =>
      p.pos.length && (has(p, 'var') || has(p, 'var-file'))
        ? [
            '╷',
            "│ Error: Can't set variables when applying a saved plan",
            '│ ',
            '│ The -var and -var-file options cannot be used when applying a saved plan',
            '│ file, because a saved plan includes the variable values that were set when',
            '│ it was created.',
            '╵'
          ]
        : null
  }),
  cmd('terraform', 'destroy', '', '!auto-approve var+ var-file+ target+ !input !lock'),
  cmd('terraform', 'show', '[PATH]', '!json !no-color'),
  cmd('terraform', 'output', '[NAME]', '!json !raw !no-color'),
  cmd('terraform', 'state list', '[ADDRESS...]', 'id state'),
  cmd('terraform', 'state show', 'ADDRESS'),
  cmd('terraform', 'state rm', 'ADDRESS...'),
  cmd('terraform', 'state mv', 'SOURCE DESTINATION'),
  cmd('terraform', 'state pull'),
  cmd('terraform', 'import', 'ADDR ID', 'var+ var-file+ config'),
  cmd('terraform', 'workspace new', 'NAME', 'state'),
  cmd('terraform', 'workspace select', 'NAME', '!or-create'),
  cmd('terraform', 'workspace list'),
  cmd('terraform', 'workspace show'),
  cmd('terraform', 'workspace delete', 'NAME', '!force'),
  cmd('terraform', 'providers'),
  cmd('terraform', 'version', '', '!json'),
  cmd('terraform', 'graph'),
  cmd('terraform', 'console'),
  cmd('terraform', 'login', '[HOSTNAME]'),
  cmd('terraform', 'refresh'),
  cmd('terraform', 'taint', 'ADDRESS'),
  cmd('terraform', 'untaint', 'ADDRESS'),
  cmd('terraform', 'get'),
  cmd('terraform', 'test'),
  cmd('terraform', 'force-unlock', 'LOCK_ID', '!force')
];

// ── docker ──────────────────────────────────────────────────────────────────

const lowerImage = (p: Parsed, idx: number[], flag?: string): string | null => {
  const refs = [...idx.map((i) => p.pos[i]).filter(Boolean), ...(flag ? (p.flags[flag] ?? []) : [])];
  const bad = refs.find((r) => /[A-Z]/.test(r.split(':')[0]));
  return bad ? `docker: invalid reference format: repository name (${bad.split(':')[0]}) must be lowercase.` : null;
};

const dockerSpecs: Spec[] = [
  cmd('docker', 'build', 'PATH', 'tag/t+ file/f build-arg+ platform !no-cache !push !load target', {
    usage: 'docker buildx build [OPTIONS] PATH | URL | -',
    check: (p) => lowerImage(p, [], 'tag')
  }),
  cmd('docker', 'tag', 'SOURCE_IMAGE TARGET_IMAGE', '', { usage: 'docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]', check: (p) => lowerImage(p, [0, 1]) }),
  cmd('docker', 'push', 'NAME', '!all-tags/a !quiet/q', { usage: 'docker push [OPTIONS] NAME[:TAG]', check: (p) => lowerImage(p, [0]) }),
  cmd('docker', 'pull', 'NAME', '!all-tags/a !quiet/q platform', { usage: 'docker pull [OPTIONS] NAME[:TAG|@DIGEST]', check: (p) => lowerImage(p, [0]) }),
  cmd('docker', 'run', 'IMAGE [COMMAND...]', '!detach/d env/e+ env-file+ !interactive/i !tty/t name publish/p+ !publish-all/P !rm restart network volume/v+ workdir/w', {
    stopAtPos: true,
    usage: 'docker run [OPTIONS] IMAGE [COMMAND] [ARG...]',
    check: (p) => lowerImage(p, [0])
  }),
  cmd('docker', 'ps', '', '!all/a !quiet/q filter/f+ format last/n !latest/l !size/s', { usage: 'docker ps [OPTIONS]' }),
  cmd('docker', 'container ls|list|ps', '', '!all/a !quiet/q filter/f+ format', { usage: 'docker container ls [OPTIONS]' }),
  cmd('docker', 'logs', 'CONTAINER', '!follow/f tail/n since !timestamps/t', { usage: 'docker logs [OPTIONS] CONTAINER' }),
  cmd('docker', 'exec', 'CONTAINER COMMAND...', '!interactive/i !tty/t !detach/d env/e+ user/u workdir/w', {
    stopAtPos: true,
    usage: 'docker exec [OPTIONS] CONTAINER COMMAND [ARG...]'
  }),
  cmd('docker', 'stop', 'CONTAINER...', 'timeout/t signal/s', { usage: 'docker stop [OPTIONS] CONTAINER [CONTAINER...]' }),
  cmd('docker', 'start', 'CONTAINER...', '!attach/a', { usage: 'docker start [OPTIONS] CONTAINER [CONTAINER...]' }),
  cmd('docker', 'restart', 'CONTAINER...', '', { usage: 'docker restart [OPTIONS] CONTAINER [CONTAINER...]' }),
  cmd('docker', 'rm', 'CONTAINER...', '!force/f !volumes/v', { usage: 'docker rm [OPTIONS] CONTAINER [CONTAINER...]' }),
  cmd('docker', 'images', '[REPOSITORY]', '!all/a !quiet/q', { usage: 'docker images [OPTIONS] [REPOSITORY[:TAG]]' }),
  cmd('docker', 'rmi', 'IMAGE...', '!force/f', { usage: 'docker rmi [OPTIONS] IMAGE [IMAGE...]' }),
  cmd('docker', 'login', '[SERVER]', 'username/u password/p !password-stdin', { usage: 'docker login [OPTIONS] [SERVER]' }),
  cmd('docker', 'inspect', 'NAME...', 'format/f', { usage: 'docker inspect [OPTIONS] NAME|ID [NAME|ID...]' }),
  cmd('docker', 'compose up', '[SERVICE...]', '!detach/d !build !force-recreate !remove-orphans scale+', { usage: 'docker compose up [OPTIONS] [SERVICE...]' }),
  cmd('docker', 'compose down', '', '!volumes/v rmi !remove-orphans', { usage: 'docker compose down [OPTIONS] [SERVICES]' }),
  cmd('docker', 'compose ps', '[SERVICE...]', '!all/a', { usage: 'docker compose ps [OPTIONS] [SERVICE...]' }),
  cmd('docker', 'compose logs', '[SERVICE...]', '!follow/f', { usage: 'docker compose logs [OPTIONS] [SERVICE...]' }),
  cmd('docker', 'version'),
  cmd('docker', 'info')
];

/** Top-level docker compose options, given before the subcommand. */
export const COMPOSE_GLOBAL = 'file/f+ project-name/p';
export const DOCKER_GLOBAL = 'context/c host/H log-level/l !debug/D';
export const TF_GLOBAL = 'chdir !help/h !version/v';

export const SPECS = { gcloud: gcloudSpecs, gsutil: gsutilSpecs, kubectl: kubectlSpecs, bq: bqSpecs, terraform: tfSpecs, docker: dockerSpecs };

export const TREES: Record<keyof typeof SPECS, TreeNode> = {
  gcloud: buildTree(gcloudSpecs),
  gsutil: buildTree(gsutilSpecs),
  kubectl: buildTree(kubectlSpecs),
  bq: buildTree(bqSpecs),
  terraform: buildTree(tfSpecs),
  docker: buildTree(dockerSpecs)
};
