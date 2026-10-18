# gcloud / gcloud storage / gsutil: exact syntax, output and error shapes (for a typed-command quiz and error simulator)

Research date: 2026-10-17. Primary evidence:

1. The live gcloud reference pages. `cloud.google.com/sdk/...` now 301-redirects to `docs.cloud.google.com/sdk/...`. I scraped the NAME, SYNOPSIS, POSITIONAL ARGUMENTS, REQUIRED FLAGS and EXAMPLES sections of 113 reference pages.
2. The Google Cloud SDK source, from two mirrors:
   - `google-cloud-sdk-unofficial/google-cloud-sdk`, which is at **589.0.0 (2026-10-13)** and includes `lib/surface/*` and `platform/gsutil`.
   - `twistedpair/google-cloud-sdk`, which is at 562.0.0 (2026-03-24) and holds the library only.
3. Release notes.
4. A few real terminal transcripts posted online.

Labels used in this file:
- **[SRC]**: the string is copied verbatim from a format string in the SDK source.
- **[OBSERVED]**: the string was seen in a real posted transcript.
- **[RECONSTRUCTED]**: I assembled the output from format strings and table formats. The placeholder values are invented.

---

## Q1. Exact command syntax: command paths, positionals, required and optional flags, aliases and common mistypes

### Takeaway
Every command below exists in GA gcloud 589.0.0. Their SYNOPSIS lines are reproduced from the live reference pages. Gotchas to grade for:
- **`gcloud config get-value`** is now a *hidden alias* of `gcloud config get`. It still works but has no reference page.
- **`gcloud iam service-accounts set-iam-policy-binding`** is printed on the official cheat sheet but **does not exist**. Its link goes to `set-iam-policy`, and the `-binding` URL returns 404.
- `gcloud container clusters resize --size` is deprecated in favour of `--num-nodes`.
- `gcloud compute networks create --subnet-mode=legacy` is deprecated.
- `--range` on networks applies to legacy networks only.
- Flags accept both `--flag=value` and `--flag value`.

### Cited Findings

**Global / cross-cutting**
- These GCLOUD WIDE FLAGS are accepted by every command: `--access-token-file, --account, --billing-project, --configuration, --flags-file, --flatten, --format, --help, --impersonate-service-account, --log-http, --project, --quiet, --trace-token, --user-output-enabled, --verbosity` — [compute networks create ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/create)
- The official cheat sheet's command list is:
  - init, version, components install/update, config set project, info, help, feedback, topic
  - config set/get/list, config configurations create/list/activate
  - auth login, auth activate-service-account, auth application-default, auth list, auth print-access-token, auth revoke
  - projects describe, projects add-iam-policy-binding
  - iam list-grantable-roles, iam roles create, iam service-accounts create/add-iam-policy-binding/**set-iam-policy-binding**/keys list
  - auth configure-docker, container clusters create/list/get-credentials, container images list-tags
  - compute zones list, instances create/describe/list, disks snapshot, snapshots describe/delete, ssh
  - app deploy/versions list/browse/create/logs read
  - kms decrypt, logging logs list, sql backups describe, sql export sql

  — [Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)
- The cheat-sheet entry `gcloud iam service-accounts set-iam-policy-binding` links to `/sdk/gcloud/reference/iam/service-accounts/set-iam-policy`. The `.../set-iam-policy-binding` reference URL returns HTTP 404 (checked 2026-10-17). — [Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)
- The command anatomy given by the cheat sheet is "gcloud + release level (optional) + component + entity + operation + positional args + flags". Its example is `gcloud + compute + instances + create + example-instance-1 + --zone=us-central1-a`. — [Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)

**Getting started / help**
- `gcloud init [--no-browser] [--console-only, --no-launch-browser] [--skip-diagnostics]`. `--console-only` and `--no-launch-browser` are aliases for the same flag. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/init)
- `gcloud version` takes no arguments. `gcloud info [--anonymize] [--show-log | [--run-diagnostics : --check-certs=HOSTNAME]]`. — [version](https://docs.cloud.google.com/sdk/gcloud/reference/version), [info](https://docs.cloud.google.com/sdk/gcloud/reference/info)
- `gcloud help [COMMAND …] [--filter] [--limit=LIMIT; default=5] … [-- SEARCH_TERMS …]`. Examples: `gcloud help projects describe` and `gcloud help -- project`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/help)
- `gcloud topic` is a group of supplementary help topics, e.g. `gcloud topic filters`, `gcloud topic datetimes` and `gcloud topic configurations`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/topic)
- `gcloud components install COMPONENT-IDS [COMPONENT-IDS …]` requires at least one ID. `gcloud components update [--version=VERSION]`. — [install](https://docs.cloud.google.com/sdk/gcloud/reference/components/install), [update](https://docs.cloud.google.com/sdk/gcloud/reference/components/update)

**config**
- `gcloud config set SECTION/PROPERTY VALUE [--installation]`. "SECTION/ is optional while referring to properties in the core section … Using section names is required for setting other properties like compute/region." Examples: `gcloud config set project PROJECT_ID`, `gcloud config set compute/zone ZONE_NAME`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/config/set)
- `gcloud config get SECTION/PROPERTY`, e.g. `gcloud config get project` and `gcloud config get compute/zone`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/config/get)
- Release 374.0.0 (2022-02-23) said: "Updated `gcloud config get-value` to `gcloud config get` per user feedback. The `get-value` command will remain as a hidden alias for `get`." In 589 source the class is `@base.Hidden class GetValue(get.Get): """Alias for `gcloud config get`, for backwards compatibility."""`. The reference URL `/config/get-value` returns 404. — [release notes](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/RELEASE_NOTES), [get_value.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/config/get_value.py)
- `gcloud config list [SECTION/PROPERTY] [--all] [--filter] [--limit] [--sort-by]`, e.g. `gcloud config list compute/`. `gcloud config unset SECTION/PROPERTY [--installation]`. — [list](https://docs.cloud.google.com/sdk/gcloud/reference/config/list), [unset](https://docs.cloud.google.com/sdk/gcloud/reference/config/unset)
- Configurations commands:
  - `gcloud config configurations create CONFIGURATION_NAME [--no-activate]`. It activates the new configuration by default.
  - `… list`
  - `… activate CONFIGURATION_NAME`
  - `… describe CONFIGURATION_NAME [--all]`

  — [create](https://docs.cloud.google.com/sdk/gcloud/reference/config/configurations/create), [activate](https://docs.cloud.google.com/sdk/gcloud/reference/config/configurations/activate), [describe](https://docs.cloud.google.com/sdk/gcloud/reference/config/configurations/describe)

**auth**
- The visible GA `auth` subcommands in 589.0.0 come from the files in `lib/surface/auth`: activate_service_account, application_default (group), configure_docker, describe, enterprise_certificate_config, list, login, print_access_token, print_identity_token and revoke. The hidden helpers are activate_refresh_token, docker_helper, git_helper and print_refresh_token. **There is no `init`.** — [surface/auth dir](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/tree/master/lib/surface/auth)
- `gcloud auth login [ACCOUNT] [--no-activate] [--brief] [--no-browser] [--cred-file=CRED_FILE] [--enable-gdrive-access] [--force] [--no-launch-browser] [--login-config=LOGIN_CONFIG] [--update-adc]`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/auth/login)
- `gcloud auth activate-service-account [ACCOUNT] --key-file=KEY_FILE [--password-file=PASSWORD_FILE | --prompt-for-password]`. **`--key-file` is REQUIRED.** Example: `gcloud auth activate-service-account SERVICE_ACCOUNT@DOMAIN.COM --key-file=/path/key.json --project=PROJECT_ID`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/auth/activate-service-account)
- `gcloud auth application-default login [ACCOUNT] [--no-browser] [--client-id-file] [--disable-quota-project] [--no-launch-browser] [--login-config] [--scopes=SCOPE,[SCOPE,…]]`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/auth/application-default/login)
- `gcloud auth list [--filter-account=…]`, e.g. `gcloud auth list --filter=status:ACTIVE --format="value(account)"`. `gcloud auth print-access-token [ACCOUNT] [--lifetime=LIFETIME]`. `gcloud auth revoke [ACCOUNTS …] [--all]`. — [list](https://docs.cloud.google.com/sdk/gcloud/reference/auth/list), [print-access-token](https://docs.cloud.google.com/sdk/gcloud/reference/auth/print-access-token), [revoke](https://docs.cloud.google.com/sdk/gcloud/reference/auth/revoke)
- `gcloud auth configure-docker [REGISTRIES]` takes a comma-separated list. Examples: `gcloud auth configure-docker` and `gcloud auth configure-docker gcr.io`. For Artifact Registry, pass e.g. `us-central1-docker.pkg.dev`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/auth/configure-docker)

**projects / services / billing**
- `gcloud projects list [--filter] [--limit] [--page-size] [--sort-by] [--uri]`, e.g. `--sort-by=projectId --limit=5`. `gcloud projects describe PROJECT_ID_OR_NUMBER`. — [list](https://docs.cloud.google.com/sdk/gcloud/reference/projects/list), [describe](https://docs.cloud.google.com/sdk/gcloud/reference/projects/describe)
- `gcloud projects create [PROJECT_ID] [--no-enable-cloud-apis] [--folder=FOLDER_ID] [--labels=…] [--name=NAME] [--organization=ORGANIZATION_ID] [--set-as-default] [--tags=…]`.
  - Project IDs "must start with a lowercase letter and can have lowercase ASCII letters, digits or hyphens. Project IDs must be between 6 and 30 characters."
  - Examples: `--folder=12345` and `--organization=2048`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/projects/create)
- `gcloud projects add-iam-policy-binding PROJECT_ID --member=PRINCIPAL --role=ROLE [--condition=… | --condition-from-file=…]`. **`--member` and `--role` are REQUIRED.**
  - Member must be of the form `user|group|serviceAccount:email` or `domain:domain`, or one of the special values `allUsers` / `allAuthenticatedUsers`.
  - Role is a full path, e.g. `roles/editor`.
  - `remove-iam-policy-binding` has the same shape plus `[--all | --condition…]`.
  - `get-iam-policy PROJECT_ID_OR_NUMBER`.

  — [add](https://docs.cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding), [remove](https://docs.cloud.google.com/sdk/gcloud/reference/projects/remove-iam-policy-binding), [get](https://docs.cloud.google.com/sdk/gcloud/reference/projects/get-iam-policy)
- `gcloud services enable SERVICE [SERVICE …] [--async]`, e.g. `gcloud services enable service1 service2 service3`. `gcloud services list [--available | --enabled]`, where `--enabled` is the "(DEFAULT)". — [enable](https://docs.cloud.google.com/sdk/gcloud/reference/services/enable), [list](https://docs.cloud.google.com/sdk/gcloud/reference/services/list)
- `gcloud billing projects link PROJECT_ID --billing-account=ACCOUNT_ID`. **REQUIRED**, in the format `0X0X0X-0X0X0X-0X0X0X`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/billing/projects/link)

**IAM**
- `gcloud iam roles create ROLE_ID (--organization=ORGANIZATION | --project=PROJECT_ID) [--file=FILE | --description --permissions=PERMISSIONS --stage=STAGE --title=TITLE]`.
  - "Exactly one of" `--organization` or `--project` is required.
  - Stage values: ALPHA, BETA, GA, DEPRECATED, DISABLED, EAP.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/iam/roles/create)
- `gcloud iam roles describe ROLE_ID [--organization | --project]`, e.g. `roles/spanner.databaseAdmin`. `gcloud iam roles copy [--source] [--destination] [--dest-organization | --dest-project] [--source-organization] [--source-project]`. All of these flags are optional in the synopsis. — [describe](https://docs.cloud.google.com/sdk/gcloud/reference/iam/roles/describe), [copy](https://docs.cloud.google.com/sdk/gcloud/reference/iam/roles/copy)
- `gcloud iam list-grantable-roles RESOURCE`, where RESOURCE is a full resource name, e.g. `//cloudresourcemanager.googleapis.com/projects/PROJECT_ID`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/iam/list-grantable-roles)
- Service-account commands:
  - `gcloud iam service-accounts create NAME [--description] [--display-name]`.
  - `keys create OUTPUT-FILE --iam-account=IAM_ACCOUNT [--key-file-type=json|p12; default="json"]`. `--iam-account` is REQUIRED.
  - `keys list --iam-account=… [--managed-by=…; default="any"] [--created-before]`.
  - `add-iam-policy-binding SERVICE_ACCOUNT --member --role`.
  - `set-iam-policy SERVICE_ACCOUNT POLICY_FILE`, with two positionals.

  — [create](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/create), [keys create](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/keys/create), [keys list](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/keys/list), [add-binding](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/add-iam-policy-binding), [set-iam-policy](https://docs.cloud.google.com/sdk/gcloud/reference/iam/service-accounts/set-iam-policy)

**Compute Engine**
- `gcloud compute instances create INSTANCE_NAMES [INSTANCE_NAMES …]`. No flag is strictly required.
  - Common flags: `--zone`, `--machine-type`, `--image-family` with `--image-project` (or `--image`), `--boot-disk-size`, `--network`, `--subnet`, `--tags`, `--metadata`, `--metadata-from-file`, `--preemptible`, `--provisioning-model`, `--service-account`, `--scopes`, `--address`.
  - `--network-tier` takes PREMIUM or STANDARD.
  - The `--machine-type` help says "If unspecified, the default type is n1-standard-1."
  - `--zone`: "If not specified and the compute/zone property isn't set, you might be prompted to select a zone (interactive mode only)."
  - Example: `gcloud compute instances create example-instance --image-family=rhel-8 --image-project=rhel-cloud --zone=us-central1-a`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/create)
- Other instance commands:
  - `instances list [NAME …] [--zones=ZONE,…] [--filter] [--limit] [--sort-by] [--uri]`. The positional NAME is "(DEPRECATED) … Use --filter="name=( 'NAME' … )" instead".
  - `instances describe INSTANCE_NAME [--zone]`.
  - `start` / `stop` / `reset INSTANCE_NAMES … [--zone] [--async]`.
  - `set-machine-type INSTANCE_NAME [--machine-type | --custom-cpu --custom-memory] [--zone]`. The help says "Either this flag, --custom-cpu, or --custom-memory must be specified" and the instance must be stopped.
  - `add-metadata INSTANCE_NAME [--metadata=KEY=VALUE,…] [--metadata-from-file=…]`, where at least one of those must be given.

  — [list](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/list), [stop](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/stop), [set-machine-type](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/set-machine-type), [add-metadata](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/add-metadata)
- `gcloud compute ssh [USER@]INSTANCE [--command=COMMAND] [--zone=ZONE] [--internal-ip | --tunnel-through-iap] [--ssh-flag=…] [--dry-run] … [-- SSH_ARGS …]`. `--internal-ip` and `--tunnel-through-iap` are mutually exclusive. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/ssh)
- `gcloud compute zones list` takes no required arguments. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/zones/list)
- Disk commands:
  - `gcloud compute disks snapshot DISK_NAME [DISK_NAME …] [--snapshot-names=…] [--description] [--guest-flush] [--storage-location] [--region | --zone]`.
  - `disks resize DISK_NAME … --size=SIZE [--region | --zone]`. **`--size` is REQUIRED.** It takes a whole number plus GB or TB (GB is assumed), e.g. `--size=6TB`.

  — [snapshot](https://docs.cloud.google.com/sdk/gcloud/reference/compute/disks/snapshot), [resize](https://docs.cloud.google.com/sdk/gcloud/reference/compute/disks/resize)
- `gcloud compute snapshots list`. `gcloud compute snapshots create NAME --source-disk=… [--source-disk-zone=…]`, e.g. `gcloud compute snapshots create my-snap --source-disk=my-disk --source-disk-zone=us-east1-a`. — [list](https://docs.cloud.google.com/sdk/gcloud/reference/compute/snapshots/list), [create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/snapshots/create)
- `gcloud compute resource-policies create snapshot-schedule NAME --max-retention-days=N (--weekly-schedule-from-file=PATH | --start-time=START_TIME (--daily-schedule | --hourly-schedule=HOURS | --weekly-schedule=WEEKLY_CYCLE)) [--region] [--on-source-disk-delete=apply-retention-policy|keep-auto-snapshots] [--storage-location] [--guest-flush]`.
  - `--weekly-schedule` takes monday–sunday.
  - Example: `… my-resource-policy --region=REGION --start-time=13:00 --daily-schedule --max-retention-days=1`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/resource-policies/create/snapshot-schedule)
- `gcloud compute images create IMAGE_NAME`. REQUIRED is "Exactly one of": `--source-disk` (with `--source-disk-zone`), `--source-image`, `--source-image-family`, `--source-snapshot` or `--source-uri`. Optional: `--family`, `--force` (allow creating from an in-use disk), `--source-image-project`, `--storage-location`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/images/create)
- `gcloud compute instance-templates create NAME` takes the same VM flags as instances create (`--machine-type`, `--image-family`/`--image-project`, `--network`, `--subnet`, `--region`, `--tags`, `--metadata`…). — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-templates/create)
- Managed instance groups:
  - `instance-groups managed create NAME --size=SIZE --template=TEMPLATE [--base-instance-name] [--health-check] [--initial-delay] [--zones=… | --region | --zone]`. **`--size` and `--template` are REQUIRED.**
  - `managed set-autoscaling NAME --max-num-replicas=N [--min-num-replicas] [--target-cpu-utilization=0.0–1.0] [--cool-down-period] [--mode=off|on|only-scale-out]`. `only-up` is deprecated. **`--max-num-replicas` is REQUIRED.**
  - `managed rolling-action start-update NAME --version=template=TEMPLATE[,name=NAME] [--canary-version=…] [--type=opportunistic|proactive; default proactive] [--max-surge] [--max-unavailable]`. **`--version` is REQUIRED.**
  - `managed resize NAME --size=SIZE`. **REQUIRED.**

  — [create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/create), [set-autoscaling](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/set-autoscaling), [start-update](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/rolling-action/start-update), [resize](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/resize)
- `gcloud compute networks create NAME [--bgp-routing-mode=MODE; default="regional"] [--description] [--mtu] [--range=RANGE] [--subnet-mode=MODE] …`.
  - In source, the `--subnet-mode` choices are the dict keys `auto`, `custom` and `legacy`. The flag uses `type=lambda mode: mode.lower()`, so `CUSTOM` is accepted.
  - `legacy` is "[Deprecated]". `--range` "only works if mode is legacy".
  - Example: `--bgp-routing-mode=global --subnet-mode=custom`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/create), [network_utils.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/compute/networks/network_utils.py)
- Subnets:
  - `gcloud compute networks subnets create NAME --network=NETWORK [--range=CIDR] [--region] [--enable-private-ip-google-access] [--secondary-range=NAME=CIDR,…] [--purpose=…] [--stack-type=IPV4_ONLY|IPV4_IPV6|IPV6_ONLY] [--enable-flow-logs]`. **`--network` is REQUIRED.** Example: `subnet-1 --network=network-0 --range=10.10.0.0/24 --region=us-central1`.
  - `subnets expand-ip-range NAME --prefix-length=N [--region]`. **REQUIRED.** The new prefix must be smaller than the original.

  — [subnets create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/subnets/create), [expand-ip-range](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/subnets/expand-ip-range)
- `gcloud compute firewall-rules create NAME (--action=ACTION | --allow=PROTOCOL[:PORT[-PORT]],[…]) [--rules=…] [--direction=INGRESS|EGRESS|IN|OUT] [--network=NETWORK; default="default"] [--priority=0..65535 (default 1000)] [--source-ranges] [--source-tags] [--target-tags] [--destination-ranges] [--target-service-accounts] [--disabled] [--enable-logging]`.
  - **Exactly one of `--action` (ALLOW|DENY, which needs `--rules`) or `--allow`.**
  - The `--allow` protocol names are "(case-sensitive) string values tcp, udp, icmp, esp, ah, sctp, or any IP protocol number".
  - "If neither --source-ranges nor --source-tags are specified, --source-ranges defaults to 0.0.0.0/0".

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/firewall-rules/create)
- `gcloud compute addresses create [NAME …] [--global | --region=REGION] [--subnet] [--addresses=IP,…] [--ip-version=IPV4|IPV6] [--network-tier=PREMIUM|STANDARD] [--purpose=VPC_PEERING|SHARED_LOADBALANCER_VIP|GCE_ENDPOINT|IPSEC_INTERCONNECT|PRIVATE_SERVICE_CONNECT] [--prefix-length] [--network]`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/addresses/create)
- `gcloud compute networks peerings create NAME --network=NETWORK --peer-network=PEER_NETWORK [--peer-project] [--export-custom-routes] [--import-custom-routes] [--stack-type]`. **Both network flags are REQUIRED.** `--auto-create-routes` is "(DEPRECATED)". — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/peerings/create)
- Cloud Router and NAT:
  - `gcloud compute routers create NAME (--ncc-gateway | --network=NETWORK) [--asn=ASN] [--region] [--advertisement-mode]`. Exactly one of the two in parentheses is required.
  - `gcloud compute routers nats create NAME --router=ROUTER [--region] [--auto-allocate-nat-external-ips | --nat-external-ip-pool=IP,…] [--nat-all-subnet-ip-ranges | --nat-custom-subnet-ip-ranges=… | …] [--type=PUBLIC|PRIVATE] [--log-filter=ALL|ERRORS_ONLY|TRANSLATIONS_ONLY] [--enable-logging]`. **`--router` is REQUIRED.**
  - Canonical example: `gcloud compute routers nats create nat1 --router=my-router --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges`.

  — [routers create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/create), [nats create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/routers/nats/create)
- `gcloud dns managed-zones create ZONE_NAME --dns-name=DNS_NAME [--description] [--visibility=public|private; default="public"] [--networks=…] [--dnssec-state] [--forwarding-targets]`. **`--dns-name` is REQUIRED.** Example: `my-zone --dns-name=my.zone.com. --description="My zone!"` (note the trailing dot). — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/dns/managed-zones/create)

**GKE (container)**
- `gcloud container clusters create NAME`. No required flags.
  - Location: `--location` ("Prefer using this flag over the --region or --zone flags"), `--region`, or `--zone`/`-z`.
  - `--num-nodes=NUM_NODES; default=3`.
  - `--machine-type`/`-m`, which "Defaults to e2-medium".
  - `--enable-autoscaling --min-nodes --max-nodes`.
  - `--release-channel=None|extended|rapid|regular|stable`, `--disk-type`, `--enable-ip-alias`, `--node-locations`, `--tier=standard|enterprise`.
  - Name rules: "only lowercase alphanumerics and '-', must start with a letter … no longer than 40 characters".

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create)
- `gcloud container clusters create-auto NAME [--location | --region | --zone] [--release-channel] [--network] …` creates an Autopilot cluster. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create-auto)
- `gcloud container clusters get-credentials NAME [--dns-endpoint] [--internal-ip] [--location | --region | --zone, -z]`, e.g. `get-credentials sample-cluster --location=us-central1-f`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/get-credentials)
- `gcloud container clusters resize NAME (--num-nodes=NUM_NODES | --size=NUM_NODES) [--node-pool] [--async] [location flags]`. "The --size flag is now deprecated. Please use --num-nodes instead." — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/resize)
- `gcloud container clusters update NAME (<exactly one update flag>)`, e.g. `--enable-autoscaling` together with `--min-nodes`/`--max-nodes` and `--node-pool`. The help says "If not already, --max-nodes or --total-max-nodes must also be set." Example: `gcloud container clusters update sample-cluster --enable-autoscaling`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/update)
- `gcloud container clusters upgrade NAME [--master] [--cluster-version] [--node-pool] [--image-type] [location flags]`. Help: "Node pools cannot be upgraded at the same time as the master." Example: `gcloud container clusters upgrade sample-cluster --master`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/upgrade)
- `gcloud container node-pools create NAME [--cluster=CLUSTER] [--num-nodes (default 3)] [--machine-type/-m] [--enable-autoscaling --min-nodes --max-nodes] [--spot|--preemptible] [location flags]`. `--cluster` can come from the `container/cluster` property. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/container/node-pools/create)

**Serverless**
- `gcloud run deploy [[SERVICE] --namespace] [--image=IMAGE | --source=SOURCE] [--[no-]allow-unauthenticated] [--region] [--port] [--memory] [--cpu] [--min-instances] [--max-instances] [--set-env-vars] [--ingress=all|internal|internal-and-cloud-load-balancing] [--service-account] [--timeout] [--concurrency] [--tag=TAG] [--no-traffic] [--function=FUNCTION] [--base-image] …`.
  - SERVICE is optional and gcloud prompts for it.
  - `--region` falls back to the property `[run/region]`, or else prompts.
  - `--function` "Specifies that the deployed object is a function. If a value is provided, that value is used as the entrypoint".
  - Example: `gcloud run deploy my-backend --image=us-docker.pkg.dev/project/image`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy)
- `gcloud run services update-traffic [SERVICE] [--region] [--to-latest | --to-revisions=REVISION-NAME=PERCENTAGE,… | --to-tags=TAG=PERCENTAGE,…] [--set-tags | --update-tags | --remove-tags | --clear-tags]`. `--to-latest` is "Synonymous with '--to-revisions=LATEST=100'". Example: `--to-revisions=myservice-s5sxn=10,myservice-cp9kw=90`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/run/services/update-traffic)
- `gcloud functions deploy (NAME : --region=REGION) [--gen2] [--runtime=RUNTIME] [--entry-point] [--source] [--trigger-http | --trigger-bucket=BUCKET | --trigger-topic=TOPIC | --trigger-event=… --trigger-resource=… | --trigger-event-filters=…] [--[no-]allow-unauthenticated] [--memory] [--timeout] [--max-instances] [--min-instances] [--service-account] [--set-env-vars] [--retry] [--trigger-location]`.
  - "`--runtime` … Required when deploying a new function".
  - `--trigger-topic` "does not accept the format of projects/PROJECT_ID/topics/TOPIC_ID".
  - `--entry-point` "Defaults to the resource name suffix".

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/functions/deploy)
- App Engine:
  - `gcloud app create [--region=REGION] [--service-account] [--ssl-policy]`. With no `--region`, the region is picked interactively. Example: `--region=us-central`.
  - `gcloud app deploy [DEPLOYABLES …] [--version=VERSION, -v VERSION] [--no-promote] [--no-stop-previous-version] [--bucket] [--image-url] [--appyaml] [--ignore-file] [--service-account]`. The default deployable is `app.yaml`.

  — [create](https://docs.cloud.google.com/sdk/gcloud/reference/app/create), [deploy](https://docs.cloud.google.com/sdk/gcloud/reference/app/deploy)
- More App Engine:
  - `gcloud app services set-traffic [SERVICES …] --splits=SPLITS,… [--split-by=cookie|ip|random; default="ip"] [--migrate]`. **`--splits` is REQUIRED**, e.g. `--splits=v2=.5,v1=.5`.
  - `gcloud app versions list [--service/-s] [--hide-no-traffic]`.
  - `gcloud app browse [--no-launch-browser] [--service/-s] [--version/-v]`.
  - `gcloud app logs read [--level=any…] [--limit=200] [--logs=…] [--service] [--version]`.

  — [set-traffic](https://docs.cloud.google.com/sdk/gcloud/reference/app/services/set-traffic), [versions list](https://docs.cloud.google.com/sdk/gcloud/reference/app/versions/list), [browse](https://docs.cloud.google.com/sdk/gcloud/reference/app/browse), [logs read](https://docs.cloud.google.com/sdk/gcloud/reference/app/logs/read)

**Logging / SQL / KMS / DM / Artifact Registry / Build / Pub/Sub**
- Logging:
  - `gcloud logging read [LOG_FILTER] [--freshness=1d] [--order=desc] [--limit] [--project | --folder | --organization | --billing-account] [--bucket --location --view]`, e.g. `gcloud logging read "severity>=ERROR"`.
  - `gcloud logging logs list`.
  - `gcloud logging sinks create SINK_NAME DESTINATION [--log-filter] [--include-children] [--use-partitioned-tables] …`, with two positionals. DESTINATION examples: `storage.googleapis.com/my-bucket` and `bigquery.googleapis.com/projects/P/datasets/D`.

  — [read](https://docs.cloud.google.com/sdk/gcloud/reference/logging/read), [logs list](https://docs.cloud.google.com/sdk/gcloud/reference/logging/logs/list), [sinks create](https://docs.cloud.google.com/sdk/gcloud/reference/logging/sinks/create)
- `gcloud sql instances create INSTANCE [--database-version=…; default="MYSQL_8_0"] [--tier=TIER, -t TIER] [--edition=enterprise|enterprise-plus] [--cpu --memory] [--region=REGION; default="us-central"] [--zone] [--root-password] [--storage-size] [--availability-type=regional|zonal] [--network] …`.
  - Database versions include MYSQL_5_6…MYSQL_9_7, POSTGRES_9_6…POSTGRES_18 and the SQLSERVER_* variants.
  - `--tier` is for shared-core machines such as `db-f1-micro` and `db-g1-small` on the Enterprise edition.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create)
- More Cloud SQL:
  - `gcloud sql connect INSTANCE [--user=USER, -u] [--database/-d] [--port=9470]`, e.g. `gcloud sql connect my-instance --user=root`.
  - `gcloud sql backups describe ID [--instance/-i]`.
  - `gcloud sql export sql INSTANCE URI [--database/-d] [--table/-t] [--offload] [--async]`. URI is `gs://bucketName/fileName`, and a `.gz` suffix compresses the export.

  — [connect](https://docs.cloud.google.com/sdk/gcloud/reference/sql/connect), [backups describe](https://docs.cloud.google.com/sdk/gcloud/reference/sql/backups/describe), [export sql](https://docs.cloud.google.com/sdk/gcloud/reference/sql/export/sql)
- `gcloud kms decrypt --ciphertext-file=… --plaintext-file=… [--key] [--keyring] [--location] [--additional-authenticated-data-file]`. **Both file flags are REQUIRED.** Example: `--key=frodo --keyring=fellowship --location=global`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/kms/decrypt)
- Deployment Manager:
  - `gcloud deployment-manager deployments create DEPLOYMENT_NAME (--composite-type | --config=CONFIG | --template=TEMPLATE) [--preview] [--properties] [--description] [--labels] [--async | --automatic-rollback-on-error]`. Exactly one of the three in parentheses is required.
  - `… deployments update DEPLOYMENT_NAME [--config | --template | --composite-type] [--preview] [--create-policy=acquire|create-or-acquire] [--delete-policy=abandon|delete]`.

  — [create](https://docs.cloud.google.com/sdk/gcloud/reference/deployment-manager/deployments/create), [update](https://docs.cloud.google.com/sdk/gcloud/reference/deployment-manager/deployments/update)
- `gcloud artifacts repositories create (REPOSITORY : --location=LOCATION) --repository-format=FORMAT [--description] [--mode=…] [--kms-key] [--immutable-tags]`.
  - **`--repository-format` is REQUIRED.** Valid values: apt, conda, docker, go, kfp, maven, npm, python, yum.
  - `--location` can fall back to the `artifacts/location` property.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/artifacts/repositories/create)
- `gcloud builds submit [[SOURCE] --no-source] [--tag=TAG, -t TAG | --config=cloudbuild.yaml | --pack=…] [--region] [--substitutions] [--timeout] [--machine-type] [--async]`. The tag "must be in the gcr.io or pkg.dev namespace". Example: `gcloud builds submit "gs://bucket/object.zip" --tag=gcr.io/my-project/image`. — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit)
- Pub/Sub:
  - `gcloud pubsub topics create TOPIC [TOPIC …] [--labels] [--message-retention-duration]`.
  - `gcloud pubsub subscriptions create SUBSCRIPTION [SUBSCRIPTION …] (--topic=TOPIC : --topic-project=…) [--ack-deadline=SECONDS] [--push-endpoint=URL] [--message-retention-duration] [--retain-acked-messages] [--expiration-period] [--message-filter] [--dead-letter-topic --max-delivery-attempts=5..100] [--enable-message-ordering] [--enable-exactly-once-delivery] …`.
  - **`--topic` is REQUIRED.**
  - `--push-endpoint` "will also automatically set the subscription type to PUSH".

  — [topics create](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create), [subscriptions create](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create)

**gcloud storage**
- `gcloud storage buckets create URL [URL …] [--location=LOCATION, -l] [--default-storage-class=CLASS, -c, -s] [--[no-]uniform-bucket-level-access, -b] [--[no-]pap, --[no-]public-access-prevention] [--retention-period] [--soft-delete-duration (default 7 days)] [--lifecycle-file] [--placement=REGION,REGION] [--enable-hierarchical-namespace] [--[no-]enable-autoclass] [--rpo]`.
  - The location defaults to "us" and the storage class to "Standard".
  - Example: `gcloud storage buckets create gs://my-bucket --default-storage-class=nearline --location=asia`.

  — [ref](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create)
- Listing and copying:
  - `gcloud storage ls [PATH …] [--recursive, -R, -r] [--long, -l | --full, -L | --json, -j] [--all-versions, -a] [--buckets, -b] [--readable-sizes] [--soft-deleted]`. `--format=gsutil` gives gsutil-style output.
  - `gcloud storage cp [SOURCE …] DESTINATION [--recursive, -R, -r] [--no-clobber, -n] [--storage-class, -s] [--continue-on-error, -c] [--preserve-posix, -P] [--canned-acl …]`.

  — [ls](https://docs.cloud.google.com/sdk/gcloud/reference/storage/ls), [cp](https://docs.cloud.google.com/sdk/gcloud/reference/storage/cp)
- Sync, move and delete:
  - `gcloud storage rsync SOURCE DESTINATION [--recursive, -R, -r] [--delete-unmatched-destination-objects] [--dry-run] [--exclude=REGEX, -x] [--checksums-only] [--no-clobber, -n] …`. The gsutil `-d` equivalent is the long flag `--delete-unmatched-destination-objects`.
  - `gcloud storage mv [SOURCE …] DESTINATION …`.
  - `gcloud storage rm [URLS …] [--recursive, -R, -r] [--all-versions, -a] [--continue-on-error]`. With `-r`: "If the path is set to a bucket, like gs://bucket, the bucket is also deleted."

  — [rsync](https://docs.cloud.google.com/sdk/gcloud/reference/storage/rsync), [mv](https://docs.cloud.google.com/sdk/gcloud/reference/storage/mv), [rm](https://docs.cloud.google.com/sdk/gcloud/reference/storage/rm)
- Describe, update and sign:
  - `gcloud storage objects describe URL` and `gcloud storage buckets describe URL`.
  - `gcloud storage buckets update URL [--[no-]versioning] [--default-storage-class] [--lifecycle-file | --clear-lifecycle] [--retention-period | --clear-retention-period] [--lock-retention-period] [--[no-]uniform-bucket-level-access] [--soft-delete-duration | --clear-soft-delete] [--update-labels] [--[no-]requester-pays] …`.
  - `gcloud storage objects update URL [--storage-class=CLASS, -s]`. This "triggers a rewrite of underlying object data". Other options: `[--[no-]temporary-hold] [--[no-]event-based-hold] [--recursive]`.
  - `gcloud storage sign-url URL [--duration=DURATION, -d; default=3600] [--http-verb=GET, -m] [--private-key-file] [--headers] [--region, -r]`.
  - `gcloud storage buckets add-iam-policy-binding URL --member --role`. **Both are REQUIRED.**

  — [objects describe](https://docs.cloud.google.com/sdk/gcloud/reference/storage/objects/describe), [buckets update](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/update), [objects update](https://docs.cloud.google.com/sdk/gcloud/reference/storage/objects/update), [sign-url](https://docs.cloud.google.com/sdk/gcloud/reference/storage/sign-url), [add-iam-policy-binding](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/add-iam-policy-binding)

**gsutil (legacy, bundled gsutil 5.37 in SDK 589)**
- Synopses, copied verbatim from the bundled gsutil source:
  - `gsutil mb [-b (on|off)] [-c <class>] [-k <key>] [-l <location>] [-p <project>] [--autoclass] [--retention <time>] [--pap <setting>] [--placement <region1>,<region2>] [--rpo {…}] gs://<bucket_name>...`
  - `gsutil ls [-a] [-b] [-d] [-l] [-L] [-r] [-p proj_id] url...`
  - `gsutil stat url...`
  - `gsutil cp [OPTION]... src_url dst_url`
  - `gsutil rsync [OPTION]... src_url dst_url`
  - `gsutil mv [-p] src_url dst_url`
  - `gsutil rm [-f] [-r] url...`
  - `gsutil lifecycle set <config-json-file> gs://<bucket_name>...`
  - `gsutil versioning set (on|off) gs://<bucket_name>...`
  - `gsutil defstorageclass set <storage-class> gs://<bucket_name>...`
  - `gsutil rewrite -s [-k] [-O] [-f] [-r] url...`
  - `gsutil iam ch [-fRr] binding ... url`, where a binding is `("user"|"serviceAccount"|"domain"|"group"):id:role[,...]`, `-d` removes a binding, and `allUsers` / `allAuthenticatedUsers` are allowed
  - `gsutil signurl [-c <content_type>] [-d <duration>] [-m <http_method>] [-p <password>] [-r <region>] [-b <project>] (-u | <private-key-file>) (gs://<bucket_name> | gs://<bucket_name>/<object_name>)...`
  - `gsutil retention set <retention_period> gs://<bucket_name>...`

  — [mb.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/mb.py), [ls.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/ls.py), [iam.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/iam.py), [signurl.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/signurl.py), [retention.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/retention.py)
- gsutil examples from its own help:
  - `gsutil mb -c nearline gs://some-bucket`
  - `gsutil mb -l asia gs://some-bucket`
  - `gsutil mb -c standard -l us-east1 gs://some-bucket`
  - `gsutil mb --retention 1y gs://some-bucket`
  - `gsutil iam ch user:john.doe@example.com:objectCreator gs://ex-bucket`. The short role name `objectCreator` is accepted.
  - `gsutil iam ch allUsers:objectViewer gs://ex-bucket`
  - `gsutil signurl -d 10m <private-key-file> gs://<bucket>/<object>`. The max is "7 days when private-key-file" is used.
  - `gsutil -m rsync -r -d ./your-dir gs://your-bucket`, where `-m` is a *top-level* option placed before the command.

  — [mb.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/mb.py), [iam.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/iam.py), [signurl.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/signurl.py), [rsync.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/rsync.py)
- Google's transition table maps `cp, mv, rm, ls, rsync, du, cat, hash` to the same verbs under `gcloud storage`. `rewrite` and `setmeta` map to `objects update`, `stat` maps to `objects list --stat --fetch-encrypted-object-hashes`, `compose` maps to `objects compose`, and `acl` / `label` map to describe/update. "For rsync, `gcloud storage` runs in parallel by default, while `gsutil rsync` runs sequentially unless the top-level `-m` flag is used." — [gsutil transition](https://docs.cloud.google.com/storage/docs/gsutil-transition-to-gcloud)

### Inferences
- The grader should treat each of these sets as equivalent:
  - `gsutil mb -l US -c NEARLINE -b on gs://b` ≡ `gcloud storage buckets create gs://b --location=US --default-storage-class=NEARLINE --uniform-bucket-level-access` (or `-l US -c NEARLINE -b`).
  - `gsutil versioning set on gs://b` ≡ `gcloud storage buckets update gs://b --versioning`.
  - `gsutil defstorageclass set X` ≡ `buckets update --default-storage-class=X`.
  - `gsutil lifecycle set f.json gs://b` ≡ `buckets update gs://b --lifecycle-file=f.json`.
  - `gsutil rewrite -s COLDLINE gs://b/o` ≡ `gcloud storage objects update gs://b/o --storage-class=COLDLINE`.
  - `gsutil iam ch user:a@b:objectViewer gs://b` ≡ `gcloud storage buckets add-iam-policy-binding gs://b --member=user:a@b --role=roles/storage.objectViewer`.
  - `gsutil signurl -d 10m key.json gs://b/o` ≡ `gcloud storage sign-url gs://b/o --duration=10m --private-key-file=key.json`.
  - `gsutil retention set 1y gs://b` ≡ `buckets update gs://b --retention-period=1y`.
  - `gsutil stat` ≡ `gcloud storage objects describe`.
  - `gsutil -m cp -r` ≡ `gcloud storage cp -r`.
  - `gsutil rsync -r -d` ≡ `gcloud storage rsync -r --delete-unmatched-destination-objects`.
- Typos the grader should catch:
  - Using `gcloud config get-value` should be accepted but could earn a "legacy alias" hint.
  - `gcloud iam service-accounts set-iam-policy-binding` should be rejected as an Invalid choice, even though the cheat sheet prints it.
  - `container clusters resize --size` should be accepted with a deprecation warning.
  - Mixing `--zone` with `--region` where they are mutually exclusive (disks, MIGs, GKE location flags) should be rejected.
  - Also check for `--allow tcp:22` with no `=` (fine), `--subnet-mode=Custom` (fine because it is lowercased), `--dns-name` missing its trailing dot (accepted by gcloud), and `-b on` (gsutil style) versus `-b` (gcloud storage style, a boolean).
- Flags documented as `--flag=VALUE` also parse as `--flag VALUE`, because gcloud uses argparse. Boolean `--[no-]x` flags take no value.

### Gaps
- I did not scrape the full SYNOPSIS of very long commands (`compute instances create`, `container clusters create/update`, `run deploy`, `sql instances create`) to the end. Only the flags listed above were extracted.
- I did not verify the `gcloud storage` short-flag aliases beyond those shown in the reference synopses.
- The current default machine type for `compute instances create`: the reference text says n1-standard-1, and I did not confirm against live behaviour, which may now be e2-medium.

---

## Q2. Exact error-message formats printed by gcloud (and gsutil), with exit codes

### Takeaway
Every gcloud error goes to stderr as `ERROR: (gcloud.<dotted.command.path>) <message>`.
- Argument and parse errors exit with **status 2**. When the message is one line, gcloud then prints a `Usage:` block; when it is multi-line, it prints hints instead.
- Runtime and API errors exit with **status 1**.
- gcloud **suppresses argparse's own "the following arguments are required" text** and replaces it with `argument X: Must be specified.` or `Exactly one of (...) must be specified.`.
- In SDK 589, an invalid subcommand prints `Maybe you meant:` followed by suggestions and the `To search the help text…` footer.
- gsutil prints `CommandException: …` and exits 1.

### Cited Findings

**Prefix, streams, exit codes**
- Parse errors are logged as `log.error('({prog}) {message}'.format(prog=self.prog, message=message))` and the process then calls `self.exit(2, exception=error)`. The `log.error` console formatter is `'%(levelname)s:' + ' %(message)s'`, which renders as `ERROR: (gcloud.x.y) …`. Warnings render as `WARNING: …`. — [parser_extensions.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py), [log.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/log.py)
- The ArgumentError docstring says these errors are intercepted to "1. reports a failed command to metrics 2. prints a usage diagnostic to the standard error 3. exits with status 2, bypassing gcloud_main exception handling". — [parser_errors.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py)
- Runtime errors go through `msg = '({0}) {1}'.format(command_path, known_exc)`, then `log.error(msg)`, then `sys.exit(getattr(exc, 'exit_code', 1))`. That means **exit 1** by default. — [calliope/exceptions.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/exceptions.py)
- If an `argument …:` prefix exists, it comes from `ArgumentError.__str__`: `'argument {argument}: {message}'`. — [parser_errors.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py)

**Exact templates [SRC]**
- Required argument: `RequiredError` → `'Must be specified.'`. Rendered: `argument <USAGE>: Must be specified.` — [parser_errors.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py)
- Required mutex: `RequiredMutexError` → `'Exactly one of {conflict} must be specified.'`. Optional mutex: `OptionalMutexError` → `'At most one of {conflict} can be specified.'`. Modal group: `ModalGroupError` → `'{conflict} must be specified.'`. — [parser_errors.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_errors.py)
- In usage strings, required groups are wrapped as `(...)` and optional groups as `[...]`. Repeated positionals render with ASCII dots, e.g. `'{var} [{var} ...]'`. — [usage_text.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/usage_text.py)
- gcloud deliberately swallows argparse's built-in required-arg messages: `if re.search('too few arguments', message): return` and `if (re.search('arguments? .* required', message) and …): return`. It does this so that `validate_specified_args()` can produce the "Must be specified." form. **So a real gcloud never prints `the following arguments are required: …`.** — [parser_extensions.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)
- Unrecognized flags/args: `'unrecognized arguments:{0}{1}'.format(separator, separator.join(messages))`.
  - With one bad arg, the separator is `' '` and the help hint is prefixed by `'\n\n'`.
  - With several, each goes on its own `'\n  '`-indented line.
  - A close flag match appends `" (did you mean '{0}'?)"`.
  - If the flag exists in another track, gcloud adds `'\n {} flag is available in one or more alternate release tracks. Try:\n'`.
  - The help hint is always appended: `_HELP_SEARCH_HINT = "To search the help text of gcloud commands, run:\n  gcloud help -- SEARCH_TERMS"`.

  — [parser_extensions.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)
- Invalid choice (`_check_value`):
  - The base message is `"Invalid choice: '{0}'."`.
  - For **flag/enum values** (not subparsers), gcloud adds either `" Did you mean '{0}'?"` (difflib close match) or `'\n\nValid choices are [{0}].'` (comma-joined sorted choices).
  - For an invalid **command/group name** (subparser), it adds no "Valid choices". Instead, if the command exists in another track, it adds `'\nThis command is available in one or more alternate release tracks.  Try:\n  ' + '\n  '.join(alternatives)`. Note the two spaces before "Try".

  — [parser_extensions.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)
- "Maybe you meant" (589): when the message is one line, contains 'Invalid choice' and does not contain 'Valid choices', gcloud computes `similarity_suggestions` (static-completion scoring). For a non-root group it also lists *every visible subcommand of the group* as `'<path> <choice>'`.
  - The list is deduplicated, and a parent group is dropped if one of its subcommands is also suggested.
  - It prints `'\n  '.join(['Maybe you meant:'] + suggestions)` and then `'\n' + _HELP_SEARCH_HINT`.
  - With no suggestions, it prints the usage string instead.
  - The similarity scorer uses `MIN_RATIO = 0.7` and `MAX_SUGGESTIONS = 10`, plus a SYNONYMS map (`'create': 'add'`, `'delete': 'remove'`, `'describe': 'get'`, `'get': 'describe'`, `'show': 'describe'`, `'make': 'create'`, `'modify'/'patch'/'change': 'update'`, `'instance'↔'instances'`…).

  — [parser_extensions.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py), [suggest_commands.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/suggest_commands.py)
- The 589 diff against 562 shows that the subcommand-listing part of "Maybe you meant" is new since 562 (2026-03). — [parser_extensions.py (562)](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/parser_extensions.py) vs [589](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py)
- A group with no subcommand (e.g. `gcloud compute`) produces `'Command name argument expected.'`. gcloud then renders the categorical usage (`# Available {type}s for {group}:`), which is paged with `More` when interactive. — [parser_extensions.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py), [usage_text.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/usage_text.py)
- The usage block is `'Usage: '` + `'{command_path} '` + brief args (`[optional flags]`, or `<group | command>` for groups), followed by:
  - `group may be` / `command may be` / `optional flags may be` lines, wrapped with `|` separators
  - then `'\n' + "For detailed information on this command and its flags, run:\n  {command_path} --help\n"`

  — [usage_text.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/usage_text.py)
- A missing required property raises `RequiredPropertyError`. [SRC] verbatim:

  ```
  The required property [{property_name}] is not currently set.
  It can be set on a per-command basis by re-running your command with the [{flag}] flag.

  You may set it for your current workspace by running:

    $ gcloud config set {section}{property_name} VALUE

  or it can be set temporarily by the environment variable [{env_var}]
  ```

  For project, the flag is `--project` and the env var is `CLOUDSDK_CORE_PROJECT`. — [properties.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/properties.py); the same text is pasted by Skills Boost lab users for `gcloud deployment-manager deployments create`, per [skills.google reviews](https://www.skills.google/focuses/19465/reviews?page=2231)
- A bad property name gives `'Section [{s}] has no property [{p}].'`, e.g. for `gcloud config set zone x`. A bad section gives `'Section "{section}" does not exist.'`. — [properties.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/properties.py)
- `gcloud config set` warnings [SRC]:
  - `WARNING: You do not appear to have access to project [{}] or it does not exist.`
  - `{} is not a valid zone. Run \`gcloud compute zones list\` to get all zones.`
  - Then, when interactive, the prompt `Are you sure you wish to set {0}property [{1}] to {2}?`.
  - The success line is `Updated {0}property [{1}].` (e.g. `Updated property [core/project].`).

  — [config_validators.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/config/config_validators.py), [config/set.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/config/set.py)
- Underspecified resource (compute, when it cannot prompt) [SRC]: `'Underspecified resource [{3}]. Specify {0}the [{1}] {2}.'`. With one flag it reads e.g. `Underspecified resource [vm-1]. Specify the [--zone] flag.`; with several flags it reads "Specify one of the [--region, --zone] flags." — [compute/flags.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/compute/flags.py)
- When it can prompt (interactive), compute instead asks one of three things:
  - `'Did you mean {0} [{1}] for {2}: [{3}]'` with a Y/n prompt
  - `'No {0} specified. Using {0} [{1}] for {2}: [{3}].'`
  - a list: `'For the following {0}:\n {1}\n'` + `'- [name]'` + `'choose a zone:'`

  — [scope_prompter.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/compute/scope_prompter.py)
- Concept-resource errors (run, functions, artifacts, pubsub…) [SRC] are built from these pieces:
  - `'Error parsing [{}].\n{}'`
  - `'The [{}] resource is not properly specified.\n'`
  - `'Failed to find attribute{}. The attribute can be set in the following ways: \n{}'`
  - hints `- provide the argument \`--location\` on the command line` and `- set the property \`artifacts/location\``

  — [concepts/handlers.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/concepts/handlers.py), [concepts.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/concepts/concepts.py), [deps.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/calliope/concepts/deps.py)
- Missing component [SRC]: `'You do not currently have this command group installed.  Using it requires the installation of components: [{missing_components}]'`. In a package-managed install such as Cloud Shell, components update prints `'\nYou cannot perform this action because the Google Cloud CLI component manager \nis disabled for this installation. You can run the following command \nto achieve the same result for this installation: \n\n{correct_command}\n\n'`. — [parser_extensions.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/calliope/parser_extensions.py), [update_manager.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/updater/update_manager.py)
- Prompts [SRC]:
  - Option lines are `' [{index}] {option}\n'`.
  - The choice prompt is `'Please enter your numeric choice:  '`. With freeform input allowed, it is `'Please enter numeric choice or text value (must exactly match list item):  '`.
  - Out of range: `'Please enter a value between 1 and {maximum}:  '`.
  - Y/n prompts end with `' (Y/n)?  '` or `' (y/N)?  '`, and the default text is `'Do you want to continue'`.
  - Cancelling raises `'Aborted by user.'`.

  — [console_io.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/console/console_io.py)

**Observed real transcripts [OBSERVED]**
- Invalid command in the wrong release track:

  ```
  ERROR: (gcloud.beta) Invalid choice: 'components'.
  This command is available in one or more alternate release tracks.  Try:
    gcloud components
  ```

  — [classmethod blog](https://dev.classmethod.jp/articles/gcloud-cli-has-3-release-level/)
- API error shape (compute):

  ```
  ERROR: (gcloud.compute.instances.create) Could not fetch resource:
   - Required 'compute.images.useReadOnly' permission for 'projects/…/global/images/…'
  ```

  The same thread shows the variant "Request had insufficient authentication scopes." — [LF forum](https://forum.linuxfoundation.org/discussion/comment/21045/)
- Other API errors use the service's status prefix, e.g. `ERROR: (gcloud.ml.language.classify-text) INVALID_ARGUMENT: The language ja is not supported for classify_text analysis.` — [classmethod blog](https://dev.classmethod.jp/articles/gcloud-cli-has-3-release-level/)

**gcloud storage errors [SRC]**
- A no-match glob gives `'The following URLs matched no objects or files:\n{}'`. A missing bucket or object gives `'gs://{instance_name} not found: {status_code}.'` (e.g. `gs://nope not found: 404.`). — [name_expansion.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/storage/name_expansion.py), [api_lib/storage/errors.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/api_lib/storage/errors.py)

**gsutil errors [SRC]**
- An unknown command prints `Did you mean this?` and `\t<close match>` to stderr, then raises `'Invalid command "%s".'`. All CommandExceptions print as `'CommandException: %s'`, and `_OutputAndExit` "exits gsutil with code 1". — [command_runner.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/command_runner.py), [__main__.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/__main__.py)
- Wrong argument count: `'The %s command requires at least %d argument%s.'` or `'The %s command accepts at most %d arguments.'`, followed by `' Usage:\n%s\nFor additional help run:\n  gsutil help %s'`. A bad flag gives `'Incorrect option(s) specified. Usage:\n%s\nFor additional help run:\n  gsutil help %s'`. Other errors include `'No URLs matched'` and `'"%s" command does not support "file://" URLs. Did you mean to use a gs:// URL?'`. — [gslib/command.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/command.py)

### Inferences
These outputs are **[RECONSTRUCTED]** from the [SRC] templates above. A simulator can use them as-is.

- `gcloud auth init` (589). It exits 2. The full list of similarity suggestions is not knowable offline; "gcloud init" is plausible.

  ```
  ERROR: (gcloud.auth) Invalid choice: 'init'.
  Maybe you meant:
    gcloud init
    gcloud auth activate-service-account
    gcloud auth application-default
    gcloud auth configure-docker
    gcloud auth describe
    gcloud auth enterprise-certificate-config
    gcloud auth list
    gcloud auth login
    gcloud auth print-access-token
    gcloud auth print-identity-token
    gcloud auth revoke

  To search the help text of gcloud commands, run:
    gcloud help -- SEARCH_TERMS
  ```

  On pre-2026 SDKs, the output showed only the similarity suggestions, or fell back to the usage block:

  ```
  Usage: gcloud auth [optional flags] <group | command>
    group may be           application-default | enterprise-certificate-config
    command may be         activate-service-account | configure-docker | …

  For detailed information on this command and its flags, run:
    gcloud auth --help
  ```

- A mistyped top-level group such as `gcloud comptue instances list` gives `ERROR: (gcloud) Invalid choice: 'comptue'.` followed by "Maybe you meant:" with similarity-only suggestions (for example `gcloud compute instances list`) and the help hint. It exits 2.
- Unknown flag. It exits 2. Note the trailing space after the flag, which comes from the `' '.join`.

  ```
  ERROR: (gcloud.compute.instances.create) unrecognized arguments: --foo 

  To search the help text of gcloud commands, run:
    gcloud help -- SEARCH_TERMS
  ```

  A near-miss such as `--zonee=us-central1-a` gives `unrecognized arguments: --zonee=us-central1-a (did you mean '--zone'?)`.
- Several unknown arguments:

  ```
  ERROR: (gcloud.x) unrecognized arguments:
    --foo
    --bar (did you mean '--baz'?)
    To search the help text of gcloud commands, run:
    gcloud help -- SEARCH_TERMS
  ```

- Missing positional. It exits 2, and the usage block follows because the message is one line:

  ```
  ERROR: (gcloud.compute.instances.create) argument INSTANCE_NAMES [INSTANCE_NAMES ...]: Must be specified.
  Usage: gcloud compute instances create INSTANCE_NAMES [INSTANCE_NAMES ...] [optional flags]
    optional flags may be  --accelerator | --address | … | --zone

  For detailed information on this command and its flags, run:
    gcloud compute instances create --help
  ```

- Missing required flags:
  - `gcloud projects add-iam-policy-binding my-proj` gives `ERROR: (gcloud.projects.add-iam-policy-binding) argument --member --role: Must be specified.`, plus usage.
  - `gcloud auth activate-service-account` gives `argument --key-file: Must be specified.`.
  - `gcloud billing projects link p` gives `argument --billing-account: Must be specified.`.
  - `gcloud compute disks resize d` gives `argument --size: Must be specified.`.
- Required mutex:
  - `gcloud compute firewall-rules create r1` gives `ERROR: (gcloud.compute.firewall-rules.create) Exactly one of (--action | --allow) must be specified.`.
  - `deployment-manager deployments create d` gives `Exactly one of (--composite-type | --config | --template) must be specified.`.
  - `iam roles create R` gives `Exactly one of (--organization | --project) must be specified.`.
- A flag with no value, `--zone` at the end of the line, gives argparse's text: `ERROR: (gcloud.compute.instances.create) argument --zone: expected one argument`, followed by the usage block. It exits 2.
- Bad enum values:
  - `--subnet-mode=x` gives `ERROR: (gcloud.compute.networks.create) argument --subnet-mode: Invalid choice: 'x'.`, then a blank line, then `Valid choices are [auto, custom, legacy].`. There is no usage block because the message is multi-line.
  - `--subnet-mode=customs` gives `argument --subnet-mode: Invalid choice: 'customs'. Did you mean 'custom'?`.
  - Other valid-choice lists for validation: `--key-file-type` [json, p12], `--visibility` [private, public], `--split-by` [cookie, ip, random], `--action` [ALLOW, DENY], and `--direction` [EGRESS, IN, INGRESS, OUT].
- Unset project, e.g. `gcloud compute instances list` with no project: `ERROR: (gcloud.compute.instances.list) The required property [project] is not currently set.` followed by the RequiredPropertyError body above. It exits 1.
- gsutil:
  - `gsutil mb` gives `CommandException: The mb command requires at least 1 argument. Usage:` followed by the mb synopsis, then `For additional help run:\n  gsutil help mb`.
  - `gsutil mkbucket` likely prints `Did you mean this?` and `\tmb`, then `CommandException: Invalid command "mkbucket".`. Exactly which close match difflib returns is not verified.

### Gaps
- I found no live posted transcript of a `Maybe you meant:` block. The output above is source-derived. Its exact suggestion list depends on the static completion tree shipped with the SDK.
- For an *enum* error with a "Did you mean" (single line), the 589 code path may also run the command-similarity suggester and could print a "Maybe you meant:" block instead of usage. Which of the two appears was not verified.
- I did not verify the exact label for modal-group errors (e.g. `logging read --bucket` without `--location`). The template is `{conflict} must be specified.`, prefixed by `argument …:`.
- Server-side error texts (e.g. GCS 409 "bucket already exists", 403 PERMISSION_DENIED bodies) come from APIs, not the CLI. I did not collect verbatim current versions.

---

## Q3. What `gcloud init` prints; is `gcloud auth init` real; `gcloud auth login --no-launch-browser` / `--no-browser` in Cloud Shell

### Takeaway
In 2026 the `gcloud init` wording has changed from the commonly remembered strings:
- It is now "**You must sign in to continue. Would you like to sign in (…)**", not "log in".
- The final line is "**The Google Cloud CLI is configured and ready to use!**", not "Your Google Cloud SDK is configured…".
- The tips now say "features of the CLI", not "the SDK".

`gcloud auth init` is not a command and gives `Invalid choice: 'init'`. In Cloud Shell, `gcloud auth login` first warns that you are already authenticated. After that:
- `--no-launch-browser` / `--console-only` prints a URL and asks for a verification code.
- `--no-browser` prints a `gcloud auth login --remote-bootstrap="…"` command to run on another machine.

### Cited Findings
- `gcloud init` [SRC, 589.0.0]:
  - It first writes `'Welcome! This command will take you through the configuration of gcloud.\n\n'`.
  - If prompts are disabled, it fails with `disable_prompts/--quiet`: `'gcloud init command cannot run with disabled prompts.'`.
  - Given a positional PROJECT argument, it errors: "`gcloud init` has changed and no longer takes a PROJECT argument. Please use `gcloud source repos clone`…".

  — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Configuration picker [SRC]:
  - Header: `'Settings from your current configuration [{0}] are:\n'`, followed by a YAML dump of the properties.
  - Choices: `'Re-initialize this configuration [{0}] with new settings '`, `'Create a new configuration'`, and `'Switch to and re-initialize existing configuration: [{0}]'`.
  - Prompt message: `'Pick configuration to use:'`.
  - Creating a new configuration asks `'Enter configuration name. Names start with a lower case letter and contain only lower case letters a-z, digits 0-9, and hyphens \'-\':  '`.
  - It then confirms with `'Your current configuration has been set to: [{0}]\n\n'`.

  — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Diagnostics [SRC]: `'You can skip diagnostics next time by using the following flag:\n'` then `'  gcloud init --skip-diagnostics\n\n'`. On failure: `'Network errors detected.'` plus `'Would you like to continue anyway'`, then `'  gcloud info --run-diagnostics\n\n'`. — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Account step [SRC]:
  - With existing credentials, the prompt is `'Choose the account you want to use for this configuration.\nTo use a federated user account, exit this command and sign in to the gcloud CLI with your login configuration file, then run this command again.\n\nSelect an account:'`. The options are the accounts plus `'Sign in with a new Google Account'` and `'Skip this step'`.
  - With none, it asks: `'You must sign in to continue. Would you like to sign in (selecting "Y" will open your browser to the sign-in page where you complete authentication)'`, ending in ` (Y/n)?  `.
  - With `--console-only` or `--no-browser`, the parenthetical changes to `selecting "Y" will display a link that can be opened in your browser to complete authentication`.

  — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py), [console_io.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/console/console_io.py)
- Project step [SRC]:
  - The prompt is `'Pick cloud project to use: '`. The list is the project IDs plus `'Enter a project ID'` and `'Create a new project'`.
  - If the account has too many projects: `'This account has a lot of projects! Listing them all can …'` with the choices `['Enter a project ID', 'Create a new project', 'List projects']`.
  - Typing an ID: `'Enter project ID you would like to use:  '`.
  - Result: `'Your current project has been set to: [{0}].\n\n'`.

  — [init_util.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/init_util.py), [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Region/zone step [SRC]:
  - The question is `'Do you want to configure a default Compute Region and Zone?'`. It is asked only if no default zone is found in project metadata.
  - The list prompt is `'Which Google Compute Engine {0} would you like to use as project default?\nIf you do not specify a {0} via a command line flag while working with Compute Engine resources, the default is assumed.'`. The first option is `'Do not set default {0}'`.
  - Confirmation: `'Your project default Compute Engine {0} has been set to [{1}].\nYou can change it by running [gcloud config set compute/{0} NAME].\n\n'`.

  — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Summary [SRC, verbatim order]:

  ```
  The Google Cloud CLI is configured and ready to use!

  * Commands that require authentication will use {account} by default
  * Commands will reference project `{project}` by default
  * Compute Engine commands will use region `{region}` by default
  * Compute Engine commands will use zone `{zone}` by default

  Run `gcloud help config` to learn how to change individual settings

  This gcloud configuration is called [{config}]. You can create additional configurations if you work with multiple accounts and/or projects.
  Run `gcloud topic configurations` to learn more.

  Some things to try next:

  * Run `gcloud --help` to see the Cloud Platform services you can interact with. And run `gcloud help COMMAND` to get help on any gcloud command.
  * Run `gcloud topic --help` to learn about advanced features of the CLI like arg files and output formatting
  * Run `gcloud cheat-sheet` to see a roster of go-to `gcloud` commands.
  ```

  With no account, the first bullet becomes `* Commands that require authentication will fail until you are authenticated`. — [surface/init.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/init.py)
- Older third-party transcripts show legacy wording such as "To continue, you must log in. Would you like to log in (Y/n)?" and "gcloud has now been configured!". **Do not use these for a 2026 simulator.** — [jimbrig notes](https://github.com/jimbrig/obsidian_published/blob/main/docs/GCP/Install%20gcloud%20SDK%20on%20Ubuntu.md)
- The official docs describe the init steps as: authorize; create or select a configuration; pick a project (with >200 projects you can enter an ID, create, or list); set a default zone, which is skipped if the Compute Engine API is disabled or a default already exists; store the properties. The page documents `gcloud init --console-only` for remote sessions. — [Initializing the gcloud CLI](https://docs.cloud.google.com/sdk/docs/initializing)
- `gcloud auth init`: the GA `auth` group has no `init` subcommand. Its files are activate_service_account, application_default, configure_docker, describe, enterprise_certificate_config, list, login, print_access_token, print_identity_token, revoke, plus hidden helpers. — [surface/auth](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/tree/master/lib/surface/auth)
- `gcloud auth login` in Cloud Shell [SRC]: `IsDevshellEnvironment()` triggers `'You are already authenticated with gcloud when running inside the Cloud Shell and so do not need to run this command. Do you wish to proceed anyway?'` followed by `Do you want to continue (Y/n)?  `. On a GCE VM, it instead shows the warning "You are running on a Google Compute Engine virtual machine. It is recommended that you use service accounts for authentication. … Are you sure you want to authenticate with your personal account?". — [surface/auth/login.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/auth/login.py)
- Login flows [SRC]:
  - Default (browser) flow: `'Your browser has been opened to visit:\n\n    {url}\n'`.
  - Console flow (`--no-launch-browser`): `'Go to the following link in your browser, and complete the sign-in prompts:\n\n    {url}\n'` then `'Once finished, enter the verification code provided in your browser: '`.
  - `--no-browser` flow: `'You are authorizing {target} without access to a web browser. Please run the following command on a machine with a web browser and copy its output back here. Make sure the installed gcloud version is {version} or newer.\n\n{command} --remote-bootstrap="{partial_url}"'` then `'Enter the output of the above command: '`. Here target = 'gcloud CLI' (or 'client libraries' for ADC) and version = 372.0.0 (420.0.0 for BYOID, 506.0.0 for TPC).

  — [flow.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/credentials/flow.py)
- Login success [SRC]: `'\nYou are now logged in as [{0}].\nYour current project is [{project}].  You can change this setting by running:\n  $ gcloud config set project PROJECT_ID\n'`. For a service-account key: `'Authenticated with service account credentials for: [{0}].'`. Re-login to an existing account: `"You are already authenticated with '%s'.\nDo you wish to proceed and overwrite existing credentials?"`. — [surface/auth/login.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/auth/login.py)

### Inferences
- A realistic 2026 transcript of `gcloud init` for a first-time user **[RECONSTRUCTED]**:

  ```
  Welcome! This command will take you through the configuration of gcloud.

  Your current configuration has been set to: [default]

  You can skip diagnostics next time by using the following flag:
    gcloud init --skip-diagnostics

  Network diagnostic detects and fixes local network connection issues.
  Checking network connection...done.
  Reachability Check passed.
  Network diagnostic passed (1/1 checks passed).

  You must sign in to continue. Would you like to sign in (selecting "Y" will open your browser to the sign-in page where you complete authentication) (Y/n)?  Y

  Your browser has been opened to visit:

      https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=…

  You are now logged in as [student@example.com].
  Your current project is [None].  You can change this setting by running:
    $ gcloud config set project PROJECT_ID

  Pick cloud project to use:
   [1] my-project-1
   [2] Enter a project ID
   [3] Create a new project
  Please enter numeric choice or text value (must exactly match list item):  1

  Your current project has been set to: [my-project-1].

  Do you want to configure a default Compute Region and Zone? (Y/n)?  Y

  Which Google Compute Engine zone would you like to use as project default?
  If you do not specify a zone via a command line flag while working with Compute Engine resources, the default is assumed.
   [1] Do not set default zone
   [2] us-east1-b
   …
  Please enter numeric choice or text value (must exactly match list item):  2

  Your project default Compute Engine zone has been set to [us-east1-b].
  You can change it by running [gcloud config set compute/zone NAME].

  Your project default Compute Engine region has been set to [us-east1].
  You can change it by running [gcloud config set compute/region NAME].

  The Google Cloud CLI is configured and ready to use!
  …(summary block above)…
  ```

  Notes on this transcript:
  - The network-diagnostic lines come from a separate module and were not verified.
  - The "Pick cloud project to use" options come from `PromptChoice(project_ids + ['Enter a project ID', 'Create a new project'])`, which allows freeform input.
- In Cloud Shell, `gcloud init` sees existing credentials, so the account step shows "Choose the account you want to use…" and does not ask you to sign in.
- In Cloud Shell, `gcloud auth login --no-launch-browser` [RECONSTRUCTED]:

  ```
  You are already authenticated with gcloud when running
  inside the Cloud Shell and so do not need to run this
  command. Do you wish to proceed anyway?

  Do you want to continue (Y/n)?  Y

  Go to the following link in your browser, and complete the sign-in prompts:

      https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=…&token_usage=remote…

  Once finished, enter the verification code provided in your browser:
  ```

  With `--no-browser`, the last block is instead "You are authorizing gcloud CLI without access to a web browser. … `gcloud auth login --remote-bootstrap="https://accounts.google.com/o/oauth2/auth?…"`" followed by "Enter the output of the above command: ".

### Gaps
- I did not fetch the network-diagnostic module's exact strings (`Checking network connection...done.` etc.). They are shown from memory and marked reconstructed.
- No 2026 posted transcript of a full `gcloud init` run was found. The wording comes solely from the 589 source.

---

## Q4. Short realistic sample outputs

### Takeaway
gcloud prints resource changes as `Created [<self-link>].` (status stream), followed by a table defined by each command's `--format`. Long-running ops print `Operation "<name>" finished successfully.`. Cloud Run prints a staged progress tracker and then `Service URL:`. GKE `get-credentials` prints two lines.

### Cited Findings
- `gcloud config list`:
  - It prints INI-style sections, e.g. `[compute]\n region = us-east1\n zone = us-east1-b\n[core]\n account = dana@example.com` per the docs.
  - It then writes `'\nYour active configuration is: [{0}]\n'` [SRC].

  — [Initializing docs](https://docs.cloud.google.com/sdk/docs/initializing), [config/list.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/config/list.py)
- `gcloud auth list`:
  - Format [SRC]: `table[title='Credentialed Accounts'](status.yesno(yes='*', no=''):label=ACTIVE, account)`.
  - Epilog [SRC]: `"\nTo set the active account, run:\n    $ gcloud config set account \`ACCOUNT\`\n"`.
  - With no accounts [SRC]: `"\nNo credentialed accounts.\n\nTo login, run:\n  $ gcloud auth login \`ACCOUNT\`\n"`.
  - A UNIVERSE_DOMAIN column is added only for non-default universes.

  — [store.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/core/credentials/store.py), [auth/list.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/auth/list.py)
- `gcloud projects list` format [SRC]: `table(projectId:sort=1, name, projectNumber, tags.environment:label='ENVIRONMENT')`. — [projects/util.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/projects/util.py)
- `gcloud compute instances create` format [SRC]: `table(name, zone.basename(), machineType.machine_type().basename(), scheduling.preemptible.yesno(yes=true, no=''), networkInterfaces[].networkIP.notnull().list():label=INTERNAL_IP, networkInterfaces[].accessConfigs[0].natIP.notnull().list():label=EXTERNAL_IP, status)`. The resource-change line is built as "Created" + `[resource]` + "." [SRC]. — [instances/flags.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/compute/instances/flags.py), [log.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/core/log.py)
- `gcloud compute networks create` prints this epilog [SRC]:

  ```
  Instances on this network will not be reachable until firewall rules
  are created. As an example, you can allow all internal traffic between
  instances as well as SSH, RDP, and ICMP by running:

  $ gcloud compute firewall-rules create <FIREWALL_NAME> --network {0} --allow tcp,udp,icmp --source-ranges <IP_RANGE>
  $ gcloud compute firewall-rules create <FIREWALL_NAME> --network {0} --allow tcp:22,tcp:3389,icmp
  ```

  — [networks/create.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/compute/networks/create.py)
- `gcloud services enable` (GA, 589):
  - If the operation is already done (the service was already enabled), it returns silently.
  - With `--async`, it prints `'Asynchronous operation is in progress... Use the following command to wait for its completion:\n {cmd}'`.
  - Otherwise it waits and prints [SRC] `'Operation "{0}" finished successfully.'`.

  — [services/enable.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/services/enable.py), [services_util.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/api_lib/services/services_util.py)

  The Service Usage docs instead show "Waiting for async operation operations/OPERATION_ID to complete..." and "Operation finished successfully.". This **conflicts** with the 589 source; the docs may reflect older output. Real IDs begin `operations/acf.` (also seen as `operations/acat.`), per [xebia blog](https://xebia.com/blog/how-to-find-google-cloud-platform-services-dependencies/). — [Service Usage docs](https://docs.cloud.google.com/service-usage/docs/enable-disable)
- `gcloud run deploy` [SRC]:
  - Start line: `'{operation} {operator} {resource_kind} [{resource}] in {ns_label} [{ns}]'` + `' region [{region}]'`. Here operation='Deploying container to', operator='Cloud Run', kind='service' and ns_label='project'.
  - Tracker header: 'Deploying' or 'Building and deploying', plus ' new service' for first deploys, plus '...'.
  - Stages: 'Validating configuration...', 'Uploading sources...', 'Building Container...', 'Creating Revision...', 'Routing traffic...', 'Setting IAM Policy...'. Failures print 'Deployment failed'.
  - Success: `'Service [{serv}] revision [{rev}] has been deployed and is serving {latest_percent_traffic} percent of traffic.'` + `'\nService URL: {url}'`.

  — [messages_util.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/messages_util.py), [stages.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/stages.py), [run/deploy.py (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/run/deploy.py), [connection_context.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/connection_context.py)
- `gcloud run deploy` prompts [SRC]:
  - Region: `'Please specify a region:\n'` (list), then `'To make this the default region, run \`gcloud config set run/region {}\`.\n'`.
  - Unauthenticated access: `'Allow unauthenticated invocations to [{}]'` (y/N).
  - Missing `--image`: `'Deploying from source. To deploy a container use [--image]. See https://cloud.google.com/run/docs/deploying-source-code for more details.'` with the prompt `'Source code location'` (default: current directory).

  — [run/flags.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/command_lib/run/flags.py)
- `gcloud container clusters get-credentials` [SRC]: `'Fetching cluster endpoint and auth data.'` then `'kubeconfig entry generated for {cluster}.'`. If the cluster is not running, it warns `'cluster {0} is not RUNNING. The kubernetes API may or may not be available. Check the cluster status for more information.'`. — [get_credentials.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/container/clusters/get_credentials.py), [container/util.py](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/lib/googlecloudsdk/api_lib/container/util.py)
- `gcloud storage` status lines [SRC]: `'Creating {}...'` (buckets create), `'Copying {} to {}'` (cp), `'Removing {}...'` (rm). — [create_bucket_task.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/storage/tasks/buckets/create_bucket_task.py), [copy_util.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/storage/tasks/cp/copy_util.py), [delete_task.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/googlecloudsdk/command_lib/storage/tasks/rm/delete_task.py)
- gsutil status lines [SRC]: `'Creating %s...'` (mb) and `'Removing %s...'` (rm). — [mb.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/mb.py), [rm.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/gslib/commands/rm.py)

### Inferences
These are **[RECONSTRUCTED]** from the formats above. The values are fake. Column spacing follows gcloud's left-aligned table printer, with two spaces between columns.

```
$ gcloud config list
[core]
account = student@example.com
disable_usage_reporting = True
project = my-project-123

Your active configuration is: [default]

$ gcloud auth list
      Credentialed Accounts
ACTIVE  ACCOUNT
*       student@example.com

To set the active account, run:
    $ gcloud config set account `ACCOUNT`

$ gcloud projects list
PROJECT_ID      NAME        PROJECT_NUMBER  ENVIRONMENT
my-project-123  My Project  123456789012

$ gcloud compute instances create web-1 --zone=us-central1-a --machine-type=e2-medium
Created [https://www.googleapis.com/compute/v1/projects/my-project-123/zones/us-central1-a/instances/web-1].
NAME   ZONE           MACHINE_TYPE  PREEMPTIBLE  INTERNAL_IP  EXTERNAL_IP   STATUS
web-1  us-central1-a  e2-medium                  10.128.0.2   34.27.10.11   RUNNING

$ gcloud services enable run.googleapis.com
Operation "operations/acf.p2-123456789012-1b2c3d4e-5f60-4a1b-9c2d-3e4f5a6b7c8d" finished successfully.

$ gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --allow-unauthenticated
Deploying container to Cloud Run service [hello] in project [my-project-123] region [us-central1]
OK Deploying new service... Done.
  OK Creating Revision...
  OK Routing traffic...
  OK Setting IAM Policy...
Done.
Service [hello] revision [hello-00001-x7k] has been deployed and is serving 100 percent of traffic.
Service URL: https://hello-123456789012.us-central1.run.app

$ gcloud container clusters get-credentials my-cluster --location=us-central1
Fetching cluster endpoint and auth data.
kubeconfig entry generated for my-cluster.

$ gcloud config set project my-project-123
Updated property [core/project].
```

Notes on these samples:
- In `auth list`, the title is centred over the table.
- `projects list` includes the ENVIRONMENT column in its format. Whether gcloud prints it when the column is empty was not verified.
- In `run deploy`, a UTF-8 terminal shows ✓ instead of "OK".
- The `run.app` URL format varies: both `hello-<hash>-uc.a.run.app` and `hello-<projnum>.<region>.run.app` exist.

### Gaps
- The `Created [...]` URL host for compute could be `https://www.googleapis.com/compute/v1/...` or `https://compute.googleapis.com/compute/v1/...`. I did not verify which one the 2026 output uses. The Linux Foundation forum transcript shows `www.googleapis.com` in image URLs.
- I did not verify the progress-tracker glyphs ("OK" vs "✓") or the spinner text.
- I did not verify exactly how `Credentialed Accounts` is centred.
- The operation-ID internals (`acf.p2-<number>-<uuid>`) are reconstructed. Only the `operations/acf.` prefix is sourced.

---

## Q5. Deprecations and renames the quiz should know (2025–2026)

### Takeaway
- **gsutil** is "legacy … minimally maintained" and "not the recommended CLI". Teach `gcloud storage` first.
- **Container Registry** writes have been shut down since 2025-03-18. Use Artifact Registry (`*-docker.pkg.dev`).
- **Cloud Functions** is now **Cloud Run functions**. `gcloud functions deploy` creates 2nd gen by default (GA since 492.0.0, 2024-09-10), and `gcloud run deploy --function` is GA (511.0.0).
- **Deployment Manager** reached end of support on **2026-03-31**, though the `gcloud deployment-manager` reference pages still exist.
- **`gcloud config get-value`** is now a hidden alias of `gcloud config get`.

### Cited Findings
- The bundled gsutil (5.37) README says: "IMPORTANT: gsutil is not the recommended CLI for Cloud Storage. Use gcloud storage commands … instead. The gsutil tool is a legacy Cloud Storage CLI and minimally maintained. The gsutil tool does not support working with newer Cloud Storage features, such as soft delete and managed folders." — [gsutil README](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/platform/gsutil/README.md)
- The transition page says "The Google Cloud CLI is the recommended command-line tool for interacting with Cloud Storage". It also says "`gcloud storage` doesn't support parallel invocations using multiple terminals on the same machine" but "supports parallel processing". — [gsutil transition](https://docs.cloud.google.com/storage/docs/gsutil-transition-to-gcloud)
- gsutil versions in the release notes: 567.0.0 (2026-05-05) "Updated gsutil component to 5.37" and 560.0.0 updated it to 5.36. gsutil is still shipped. — [RELEASE_NOTES (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/RELEASE_NOTES)
- Container Registry timeline:
  - Deprecated May 15, 2023.
  - Since March 18, 2025, "Container Registry is shut down and writing images to Container Registry is unavailable".
  - Reads ended after June 3, 2025 per the deprecation page. A March 2025 release note gives May 20, 2025 instead, so the sources **conflict**.
  - On October 14, 2025, gcr.io traffic was served by Artifact Registry for migrated projects.

  — [Container Registry deprecation](https://docs.cloud.google.com/container-registry/docs/deprecations/container-registry-deprecation), [CR release notes](https://docs.cloud.google.com/container-registry/docs/release-notes)
- The `gcloud auth configure-docker` help still mentions "Container Registry is a service for storing private container images". The `builds submit --tag` help says the tag "must be in the gcr.io or pkg.dev namespace". — [configure-docker ref](https://docs.cloud.google.com/sdk/gcloud/reference/auth/configure-docker), [builds submit ref](https://docs.cloud.google.com/sdk/gcloud/reference/builds/submit)
- Cloud Functions generation defaults, from the release notes:
  - 426.0.0 (2023-04-11): "Updated `gcloud functions deploy` to no longer require the flag `--gen2` when updating an existing 2nd gen function".
  - 463.0.0 (2024-02-06): alpha and beta tracks default to 2nd gen.
  - 492.0.0 (2024-09-10): "Changed `gcloud functions deploy` to deploy _new_ functions via Cloud Functions (2nd gen) by default. 1st gen functions can still be created by specifying `--no-gen2` or by setting the `functions/gen2` property to `off`."

  — [RELEASE_NOTES](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/RELEASE_NOTES)
- 511.0.0 (2025-02-19): "Promoted the following source deploy configuration flags from beta to GA to support the GA release of Cloud Run functions: `--build-env-vars`, `--function`, `--base-image`, `--automatic-updates`, `--build-worker-pool`, and `--build-service-account`." The run deploy reference documents `--function=FUNCTION`. — [RELEASE_NOTES (589)](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/RELEASE_NOTES), [run deploy ref](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy)
- 442.0.0 (2023-08-08) "Warned about on deprecation of Container Registry (used by default by Cloud Functions 1st gen for storing build artifacts)". In the functions deploy reference, `--docker-registry` is "(DEPRECATED)". — [RELEASE_NOTES](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/RELEASE_NOTES), [functions deploy ref](https://docs.cloud.google.com/sdk/gcloud/reference/functions/deploy)
- Deployment Manager: "Cloud Deployment Manager reached end of support on March 31, 2026. If you currently use Deployment Manager, please migrate to Infrastructure Manager or an alternative deployment technology." After that date "you won't be able to use the Deployment Manager service", but existing resources keep working, and you manage them with other tools rather than with "gcloud deployment-manager commands". Some older localized pages say December 31, 2025, so the sources **conflict**; the newer English page says 2026-03-31. — [DM deprecations](https://docs.cloud.google.com/deployment-manager/docs/deprecations)
- In the 589 source, the `deployment_manager` group has no deprecation banner or hidden flag. The reference pages for `deployments create/update` were still served on 2026-10-17. — [deployment_manager/__init__.py](https://github.com/google-cloud-sdk-unofficial/google-cloud-sdk/blob/master/lib/surface/deployment_manager/__init__.py), [DM create ref](https://docs.cloud.google.com/sdk/gcloud/reference/deployment-manager/deployments/create)
- Other deprecated flags in the reference pages:
  - `container clusters resize --size` ("now deprecated. Please use --num-nodes").
  - `container clusters create --additional-zones` ("Use --node-locations").
  - `compute networks create --subnet-mode=legacy`.
  - `compute networks peerings create --auto-create-routes`.
  - `compute instance-groups managed set-autoscaling --mode only-up`.
  - The positional NAME on `compute instances|zones|snapshots list` ("Use --filter").
  - `compute instance-groups managed create --http-health-check` ("Use --health-check").

  — [resize](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/resize), [clusters create](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create), [networks create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/create), [peerings create](https://docs.cloud.google.com/sdk/gcloud/reference/compute/networks/peerings/create), [set-autoscaling](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instance-groups/managed/set-autoscaling), [instances list](https://docs.cloud.google.com/sdk/gcloud/reference/compute/instances/list)
- `gcloud config get-value` became a hidden alias in 374.0.0 (2022-02-23). — [RELEASE_NOTES](https://github.com/twistedpair/google-cloud-sdk/blob/master/google-cloud-sdk/RELEASE_NOTES)
- The docs domain moved: `https://cloud.google.com/sdk/docs/cheatsheet` now returns 301 to `https://docs.cloud.google.com/sdk/docs/cheatsheet`. The same applies to `/sdk/docs/initializing`. — [Cheat sheet](https://docs.cloud.google.com/sdk/docs/cheatsheet)

### Inferences
- Quiz policy suggestions:
  - Accept gsutil answers but label them "legacy (still works)".
  - Accept `gcloud functions deploy … --gen2` (the flag is redundant now), and also accept `gcloud run deploy --source . --function=ENTRY`.
  - Flag `gcr.io/...` image paths in new-build questions as outdated, preferring `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE`.
  - Treat `deployment-manager` items as "syntax still documented, but the service is end-of-support since 2026-03-31". For new IaC questions, prefer Infrastructure Manager or Terraform.
- A realistic simulator may print `WARNING:` lines for deprecated flags, e.g. for `--size` on clusters resize. The exact warning wording was not collected.

### Gaps
- I did not collect the exact runtime `WARNING:` text gcloud prints when deprecated flags (`--size`, `--auto-create-routes`) are used.
- I did not determine whether `gcloud deployment-manager` commands now fail server-side after 2026-03-31, or what error they print.
- I found no verbatim deprecation warning printed by gsutil itself at runtime. The README is the evidence.
