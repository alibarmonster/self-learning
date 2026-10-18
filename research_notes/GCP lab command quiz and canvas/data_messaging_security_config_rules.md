# GCP storage, database, messaging, security and DevOps resources: config fields, allowed values, defaults and validation rules (for a browser simulator, ACE-level)

Research date: 2026-10-17. Note for the writer: Google moved the docs host. `cloud.google.com/<product>/docs/...` now answers with a 301 to `docs.cloud.google.com/<product>/docs/...`, so all links below use the new host. One exception: Memorystore pricing redirected back to cloud.google.com.

Legend for the tables: **Req** = required at create. **Imm** = immutable after create. "[verbatim]" means the text was quoted from the doc. "[reconstructed]" means a plausible message for the simulator that no Google source confirms.

---

## 1. Cloud Storage bucket

### Takeaway
A bucket name is the main validation target. It must be 3–63 chars (up to 222 with dots, each dot-part ≤63), use lowercase letters, digits, `-`, `_` and `.`, and start and end with a letter or digit. It must not be an IP address, must not start with `goog`, must not contain "google" or look-alikes, and is globally unique. Several settings come with tight defaults:
- gcloud default location: `us`
- Default storage class: STANDARD
- Soft delete: 7 days by default; 0 disables it, otherwise 7–90 days
- Retention: up to 100 years, and a lock is irreversible
- Uniform bucket-level access: locks in after 90 days enabled
- Autoclass: incompatible with SetStorageClass lifecycle rules

### Cited Findings

**Spec table: bucket create**

| Field (Console label / gcloud flag / JSON field) | Type | Allowed values / rule | Default | Req | Imm | Src |
|---|---|---|---|---|---|---|
| Name / positional `gs://NAME` / `name` | string | 3–63 chars. With dots up to 222, each dot-separated part ≤63. Only lowercase letters, digits, `-`, `_`, `.` ("Bucket names can only contain lowercase letters, numeric characters, dashes (-), underscores (_), and dots (.)" [verbatim]). "must start and end with a number or letter" [verbatim]. Not a dotted-decimal IP. "cannot begin with the "goog" prefix" [verbatim]. Cannot contain "google" or near-misspellings such as "g00gle". Global namespace. Dotted names need domain verification. | — | Yes | Yes ("You cannot change the name of an existing bucket" [verbatim]) | [buckets](https://docs.cloud.google.com/storage/docs/buckets) |
| Location type + Location / `--location` (`-l`) / `location` | enum | Region (e.g. `US-CENTRAL1`), dual-region (predefined `ASIA1`, `EUR4`, `EUR5`, `EUR7`, `EUR8`, `NAM4`, or configurable via `--placement`), multi-region (`US`, `EU`, `ASIA`), zone (Rapid Bucket only) | gcloud: "If not specified, the location used by Cloud Storage is `us`." [verbatim] | Console: yes | Yes (gcloud ref says "Cannot be changed after creation"; but see the relocation note below) | [locations](https://docs.cloud.google.com/storage/docs/locations), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Custom dual-region / `--placement` | list of 2 regions | Both regions must share the same location code (e.g. both `EU` or both `US`), otherwise error. `EUROPE-NORTH1`+`EUROPE-WEST4` and `US-CENTRAL1`+`US-EAST1` are predefined-only pairs. `US-EAST5` must pair with `US-CENTRAL1` or `US-EAST1`. | — | No | — | [locations](https://docs.cloud.google.com/storage/docs/locations) |
| Turbo replication / `--recovery-point-objective` (`--rpo`) | enum | `ASYNC_TURBO` (dual-region only), `DEFAULT`. Turbo replicates within 15 minutes. | `DEFAULT` | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create), [locations](https://docs.cloud.google.com/storage/docs/locations) |
| Default storage class / `--default-storage-class` (`-c`,`-s`) / `storageClass` | enum | `STANDARD`, `NEARLINE`, `COLDLINE`, `ARCHIVE` (plus `RAPID` for zonal; legacy `MULTI_REGIONAL`, `REGIONAL`, `DURABLE_REDUCED_AVAILABILITY`) | "Standard" | No | No (changing it does not affect existing objects) | [storage-classes](https://docs.cloud.google.com/storage/docs/storage-classes), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Autoclass / `--enable-autoclass`, `--autoclass-terminal-storage-class` | bool + enum | Terminal class `NEARLINE` (default) or `ARCHIVE`. The terminal-class flag is valid only if Autoclass is on. | off | No | No (can enable, disable or reconfigure; changes take up to 1 day; re-enable blocked for 1 day after disable) | [autoclass](https://docs.cloud.google.com/storage/docs/autoclass) |
| Access control / `--uniform-bucket-level-access` (`-b`) / `iamConfiguration.uniformBucketLevelAccess.enabled` | bool | Uniform (IAM only, ACLs disabled) vs fine-grained (IAM + ACLs) | gcloud: False | No | Becomes fixed: "cannot be disabled after it has been active on a bucket for 90 consecutive days" [verbatim] | [ubla](https://docs.cloud.google.com/storage/docs/uniform-bucket-level-access), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Public access prevention / `--pap` / `--public-access-prevention` / `iamConfiguration.publicAccessPrevention` | enum | `enforced` or `inherited` (inherited follows the org policy `storage.publicAccessPrevention`) | not stated | No | No | [pap](https://docs.cloud.google.com/storage/docs/public-access-prevention) |
| Soft delete policy / `--soft-delete-duration` / `softDeletePolicy.retentionDurationSeconds` | duration | `0` disables; otherwise 7–90 days ("anywhere between 7 to 90 days" [verbatim]). gcloud duration format like `2w1d` (see `gcloud topic datetimes`). | 7 days | No | No (changes apply only to later deletions; propagate ≤30 s) | [soft-delete](https://docs.cloud.google.com/storage/docs/soft-delete), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Retention policy / `--retention-period` / `retentionPolicy.retentionPeriod` | duration (ISO 8601 `P#Y#M#W#DT#H#M#S`, e.g. `P1Y1M1DT5S`) | ≤ 3,155,760,000 s (100 years). 1 month = 31 days; 1 year = 365.25 days. | none | No | Locked policy: can increase, cannot reduce or remove | [bucket-lock](https://docs.cloud.google.com/storage/docs/bucket-lock), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Object retention (per object) / `--enable-per-object-retention` | flag | — | off | No | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Hierarchical namespace / `--enable-hierarchical-namespace` | flag | Requires `--uniform-bucket-level-access` | off | No | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Encryption / `--default-encryption-key` (`-k`) / `encryption.defaultKmsKeyName` | KMS key path `projects/P/locations/L/keyRings/R/cryptoKeys/K` | Google-managed (default) or CMEK | Google-managed | No | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) |
| Lifecycle / `--lifecycle-file` (JSON) / `lifecycle.rule[]` | JSON | See the lifecycle table below | none | No | No (changes take ≤24 h) | [lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle) |

**Storage classes**

| Class | API | Min storage duration | Retrieval fee | SLA region / multi- or dual-region |
|---|---|---|---|---|
| Standard | `STANDARD` | none | none | 99.9% / 99.95% |
| Nearline | `NEARLINE` | 30 days | yes | 99.0% / 99.9% |
| Coldline | `COLDLINE` | 90 days | yes | 99.0% / 99.9% |
| Archive | `ARCHIVE` | 365 days | yes | 99.0% / 99.9% |
| Rapid (zonal) | `RAPID` | none | none | 99.9% (zone) |

Source: [storage-classes](https://docs.cloud.google.com/storage/docs/storage-classes)

**Autoclass behaviour** (all from [autoclass](https://docs.cloud.google.com/storage/docs/autoclass))
- Every object starts in Standard.
- Objects of 128 KiB or more move to Nearline after 30 days without access.
- If the terminal class is Archive, they then move to Coldline at 90 days and Archive at 365 days.
- Reading an object returns it to Standard.
- Objects under 128 KiB stay in Standard.
- No retrieval or early-deletion fees; a management fee and a one-time enablement charge apply.
- A bucket can't have Autoclass together with lifecycle rules that use `SetStorageClass` or `matchesStorageClass`. "Requests that would create that combination fail."

**Lifecycle rules** (all from [lifecycle](https://docs.cloud.google.com/storage/docs/lifecycle))

| Action | Notes |
|---|---|
| `Delete` | A live object in a versioned bucket becomes noncurrent. A deleted live object is soft-deleted (7 days by default). |
| `SetStorageClass` | Allowed transitions: Standard (and legacy Multi-Regional/Regional) to Nearline, Coldline or Archive; Nearline to Coldline or Archive; Coldline to Archive. Regional buckets can't go to Multi-Regional, and multi/dual-region buckets can't go to Regional. "Cloud Storage doesn't validate transitions", so an invalid one silently doesn't happen. Not allowed on Autoclass buckets. |
| `AbortIncompleteMultipartUpload` | Only combinable with `age`, `matchesPrefix`, `matchesSuffix`. |

| Condition | Type |
|---|---|
| `age` | int, days since creation |
| `createdBefore` | date, midnight UTC |
| `customTimeBefore` | date `YYYY-MM-DD` |
| `daysSinceCustomTime` | int |
| `daysSinceNoncurrentTime` | int (versioning) |
| `isLive` | bool (`true` = live, `false` = noncurrent) |
| `matchesStorageClass` | list of `STANDARD`, `NEARLINE`, `COLDLINE`, `ARCHIVE`, `MULTI_REGIONAL`, `REGIONAL`, `DURABLE_REDUCED_AVAILABILITY` |
| `matchesPrefix` / `matchesSuffix` | string list, case-sensitive; up to 1,000 prefixes+suffixes across all rules |
| `noncurrentTimeBefore` | date `YYYY-MM-DD` |
| `numNewerVersions` | int (XML name `NumberOfNewerVersions`) |

Every rule needs at least one condition.

**Soft delete details** (from [soft-delete](https://docs.cloud.google.com/storage/docs/soft-delete))
- Soft-deleted objects keep billing until retention expires.
- Early-deletion charges apply to non-Standard classes.
- Restored objects go to Standard.
- The CLI or API restores only the empty bucket; the Console restores the bucket and its objects.
- A soft-deleted bucket can't be restored while a live bucket holds its name.
- Org policy constraint: `storage.softDeletePolicySeconds`.

**Retention and lock** (from [bucket-lock](https://docs.cloud.google.com/storage/docs/bucket-lock))
- Removing or reducing a locked policy returns `400 BadRequestException`.
- Deleting or overwriting an object still under retention returns `403 retentionPolicyNotMet`.
- A locked bucket can't be deleted until every object meets retention.
- Locking places a lien on the project that blocks `resourcemanager.projects.delete`.
- Event-based holds reset the retention clock when released.

**Public access prevention errors** (from [pap](https://docs.cloud.google.com/storage/docs/public-access-prevention))
- Requests that rely on `allUsers` or `allAuthenticatedUsers` fail with 401/403.
- Adding those principals to IAM or an ACL is rejected with `412`.

**Location can now change (nuance)**
- The locations page says you "can relocate a bucket after creation, but only if you've configured Storage Intelligence" — [locations](https://docs.cloud.google.com/storage/docs/locations).
- The gcloud reference still says `--location` "Cannot be changed after creation" — [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create).

**Verbatim error strings**

| Code / reason | HTTP | Message (verbatim) | Source |
|---|---|---|---|
| `BucketNameUnavailable` | 409 | "The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again." | [XML status](https://docs.cloud.google.com/storage/docs/xml-api/reference-status) |
| `BucketAlreadyExists` | 403 | Same text as above | [XML status](https://docs.cloud.google.com/storage/docs/xml-api/reference-status) |
| `BucketAlreadyOwnedByYou` | 409 | "Your previous request to create the named bucket succeeded and you already own it." | [XML status](https://docs.cloud.google.com/storage/docs/xml-api/reference-status) |
| JSON API `conflict` (already owned) | 409 | "You already own this bucket. Please select another name." | [JSON status](https://docs.cloud.google.com/storage/docs/json_api/v1/status-codes) |
| `InvalidBucketName` | 400 | "The specified bucket is not valid." | [XML status](https://docs.cloud.google.com/storage/docs/xml-api/reference-status) |
| `BucketNotEmpty` | 409 | "The bucket you tried to delete is not empty." | [XML status](https://docs.cloud.google.com/storage/docs/xml-api/reference-status) |
| `retentionPolicyNotMet` | 403 | "The object is under retention and cannot be replaced or deleted until the date and time indicated." | [JSON status](https://docs.cloud.google.com/storage/docs/json_api/v1/status-codes) |
| `forbidden` | 403 | "According to access control policy, the current user does not have access to perform the requested action." | [JSON status](https://docs.cloud.google.com/storage/docs/json_api/v1/status-codes) |
| `usageLimits.rateLimitExceeded` | 429 | "A Cloud Storage JSON API usage limit was exceeded." | [JSON status](https://docs.cloud.google.com/storage/docs/json_api/v1/status-codes) |
| "404-Bucket Not Found" | 404 | Can occur for up to 10 min after a same-named bucket is deleted and recreated in another location | [buckets](https://docs.cloud.google.com/storage/docs/buckets) |

### Inferences
- **Name validator regex:** `^(?=.{3,222}$)(?!goog)(?!.*g[o0]{2}gle)(?!\d{1,3}(\.\d{1,3}){3}$)[a-z0-9]([a-z0-9._-]*[a-z0-9])?$`, plus a per-label check (split on `.`, each part 1–63 chars). Without dots, enforce ≤63.
  - The "google" look-alike set is only partly documented (the docs give "g00gle"), so blocking `google` and `g00gle` is a reasonable approximation.
- **Error messages to show:**
  - Taken name: the 409 `BucketNameUnavailable` text above.
  - Syntactic failures: `InvalidBucketName` / "The specified bucket is not valid."
  - [reconstructed] Console inline hints, e.g. "Bucket names must be between 3 and 63 characters" and "Bucket names can only contain lowercase letters, numeric characters, dashes (-), underscores (_), and dots (.)". The second string is the doc wording reused as UI text.
- **Exam reasoning:**
  - Minimum durations of 30/90/365 days drive the early-deletion-fee questions.
  - Lifecycle can only go "colder". Moving back to Standard requires a rewrite.
  - Retention policy plus lock gives WORM compliance.
  - Uniform access has a 90-day revert window.
  - `gcloud storage buckets create` defaults to `us` and STANDARD.

### Gaps
- The gcloud flag for object versioning on create isn't in the fetched page. It is normally set after create via `gcloud storage buckets update --versioning`; unverified here.
- Labels flag rules for buckets were not fetched.
- Maximum lifecycle rules per bucket is not on the lifecycle page (commonly cited as 100; unverified).
- The exact Console inline validation strings were not found in any public doc.
- Bucket create/delete rate limit numbers are on the quotas page, which was not fetched (commonly ~1 create/delete per 2 s per project; unverified).

---

## 2. Cloud SQL instance

### Takeaway
- **Instance ID:** lowercase letters, digits and hyphens, starting with a letter, with `project-ID:instance-ID` ≤98 chars.
- **Fixed at create:** ID, region, DB version, storage type and encryption type.
- **Edition:** Enterprise Plus allows only predefined N2/C4A/C4 types. Enterprise allows custom types (1 or even vCPUs up to 96; 0.9–6.5 GB per vCPU in 256 MB steps, min 3.75 GB).
- **Storage:** can only grow.
- **Private IP:** needs private services access (an allocated range plus `servicenetworking` peering) and can't be turned off once enabled.
- **Defaults:** gcloud and Console differ on the default version and edition.

### Cited Findings

**Spec table: instance create**

| Field (Console / gcloud / API) | Type | Allowed values / rule | Default | Req | Imm | Src |
|---|---|---|---|---|---|---|
| Instance ID / `INSTANCE` / `name` | string | lowercase letters, numbers, hyphens; must start with a letter; `project-ID:instance-ID` ≤98 chars | — | Yes | Yes | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [pg settings](https://docs.cloud.google.com/sql/docs/postgres/instance-settings) |
| Database version / `--database-version` / `databaseVersion` | enum | MySQL Enterprise Plus: `MYSQL_8_4`, `MYSQL_8_0` (8.0.31+). MySQL Enterprise adds `MYSQL_5_7`, `MYSQL_5_6`. Postgres Enterprise Plus: `POSTGRES_12`…`POSTGRES_18`. Postgres Enterprise adds `POSTGRES_11`, `POSTGRES_10`, `POSTGRES_9_6`. The gcloud ref lists MYSQL_5_6…MYSQL_9_7, POSTGRES_9_6…POSTGRES_18, SQLSERVER_2017…SQLSERVER_2025 (Express/Web/Standard/Enterprise; no 2025 Web). | Console/docs: `MYSQL_8_4` for MySQL. gcloud ref: `MYSQL_8_0`. Postgres: docs say PG18 in the table but PG16 in the text (inconsistent). | Yes (Console) | Yes | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [pg settings](https://docs.cloud.google.com/sql/docs/postgres/instance-settings), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Edition / `--edition` / `settings.edition` | enum | `enterprise`, `enterprise-plus` (API `ENTERPRISE`, `ENTERPRISE_PLUS`) | Enterprise Plus when MySQL 8.4 or PostgreSQL 16+ (docs); gcloud states no default | No | — | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [pg settings](https://docs.cloud.google.com/sql/docs/postgres/instance-settings) |
| Machine type / `--tier` or `--cpu`+`--memory` / `settings.tier` | string | Shared-core `db-f1-micro`, `db-g1-small` (Enterprise only, no SLA, test/dev). Custom `db-custom-<vCPU>-<MB>`: vCPU 1 or even, 1–96; memory 0.9–6.5 GB per vCPU, multiple of 256 MB, min 3.75 GB. Enterprise Plus: predefined only, e.g. `db-perf-optimized-N-2`; 2–128 vCPU; 8 GB per vCPU (6.75 for `-N-128`). "Both --cpu and --memory must be specified if a custom machine type is desired." [verbatim]. `--memory` takes units like `3072MiB`/`9GiB`; no unit means GiB. `--cpu`/`--memory` are not compatible with Enterprise Plus. | not stated | — | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Storage type / `--storage-type` / `settings.dataDiskType` | enum | `SSD`, `HDD` (Enterprise only), `HYPERDISK_BALANCED`; the machine series decides which are allowed | SSD | No | Yes | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Storage capacity / `--storage-size` / `settings.dataDiskSizeGb` | int GB | max 64 TB (dedicated cores); 3054 GB for shared-core; increase only | 10 GB (gcloud) | No | Can't decrease | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create), [pg settings](https://docs.cloud.google.com/sql/docs/postgres/instance-settings) |
| Automatic storage increase / `--[no-]storage-auto-increase`, `--storage-auto-increase-limit` | bool, int | Limit ≥10 GB and ≥ current size; `unlimited` in gcloud (API `0`). Checks every 30 s. SSD/HDD threshold 5 GB + provisioned/25 (cap 25 GB). | on; limit unlimited | No | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Availability / `--availability-type` / `settings.availabilityType` | enum | `zonal` / `regional` (HA). Zonal "Provides no failover capability." [verbatim] | zonal | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create), [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Region, Zone / `--region`, `--zone`, `--secondary-zone` | string | `--gce-zone` is deprecated in favour of `--zone` | gcloud ref lists `us-central` (looks truncated/legacy) | — | Region yes | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Automated backups / `--[no-]backup`, `--backup-start-time HH:MM` (UTC), `--retained-backups-count` | | count 1–365 | on; 7 (Enterprise) / 15 (Enterprise Plus) | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| PITR / `--enable-point-in-time-recovery` (PG), `--enable-bin-log` (MySQL), `--retained-transaction-log-days` | | Both require automatic backups. Log days 1–35: Enterprise default and max 7; Enterprise Plus default 14, max 35. Toggling PITR restarts the instance. Postgres uses write-ahead logs. | varies by instance | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create), [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [pg settings](https://docs.cloud.google.com/sql/docs/postgres/instance-settings) |
| Maintenance window / `--maintenance-window-day` (`SUN`…`SAT`), `--maintenance-window-hour` (UTC) | | Timing: Any, Canary/Week 1, Stable/Week 2, Week 5. Not supported on read replicas. | "Any" | No | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Public IP + Authorized networks / `--[no-]assign-ip`, `--authorized-networks=CIDR,...` | CIDR list | e.g. `192.168.100.0/24`. Public IP blocks all traffic until networks are authorized. | — | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create), [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Private IP / `--network`, `--allocated-ip-range-name` | VPC | Requires private services access; Shared VPC needs a full network URL | — | No | Can't be disabled once enabled | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings), [private-ip](https://docs.cloud.google.com/sql/docs/mysql/configure-private-ip) |
| Private Service Connect / `--enable-private-service-connect`, `--allowed-psc-projects` | | list of project IDs or numbers | off | No | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| SSL mode / `--ssl-mode` | enum | `ALLOW_UNENCRYPTED_AND_ENCRYPTED` (default), `ENCRYPTED_ONLY`, `TRUSTED_CLIENT_CERTIFICATE_REQUIRED` | ALLOW_UNENCRYPTED_AND_ENCRYPTED | No | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Root password / `--root-password` | string | password policy options (min length, complexity, reuse, no username) | — | Console: yes | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create), [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Deletion protection / `--[no-]deletion-protection` | bool | must be turned off before delete | not stated in gcloud | No | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Data cache / `--[no-]enable-data-cache` | bool | Enterprise Plus only | enabled | No | No | [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings) |
| Database flags / `--database-flags=FLAG=VALUE,...` | map | booleans `on`/`off` | — | No | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |
| Read replica / `--master-instance-name=PRIMARY` | | creates a read replica | — | — | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/sql/instances/create) |

The docs list the settings that can't be modified: "instance ID, region, database version, storage type, and data encryption method. Private IP can't be turned off once enabled. Storage capacity can only be increased." [paraphrase of the doc list] — [mysql settings](https://docs.cloud.google.com/sql/docs/mysql/instance-settings)

**Private IP prerequisites, commands and errors** (all from [private-ip](https://docs.cloud.google.com/sql/docs/mysql/configure-private-ip))
- "Cloud SQL requires private services access for each VPC network that's used for private IP connections." [verbatim]
- Enable the Service Networking and Compute Engine APIs.
- Grant `roles/compute.networkAdmin`.
- The Console auto-allocates a /24 named `default-ip-range`. Each additional region or DB type needs a free /24.
- Commands:
  - `gcloud compute addresses create google-managed-services-VPC --global --purpose=VPC_PEERING --prefix-length=16 --network=...`
  - `gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=... --network=...`
- Possible peering names: `servicenetworking-googleapis-com`, `cloudsql-mysql-googleapis-com`, `cloudsql-postgres-googleapis-com`.
- Error codes:
  - `SERVICE_NETWORKING_NOT_ENABLED`: Service Networking API is off.
  - `NETWORK_NOT_PEERED`: no peering established.
  - Console banner: "Private service connection required".
  - Success: "Private service connection for network VPC_NETWORK_NAME has been successfully created".
  - Permission errors on `compute.globalAddresses.list`: grant `roles/servicenetworking.serviceAgent`.

### Inferences
- **Custom-tier validator:** `vcpu ∈ {1} ∪ {2,4,…,96}`; `mem_mb % 256 == 0`; `mem_mb ≥ 3840` (3.75 GB); `0.9*vcpu*1024 ≤ mem_mb ≤ 6.5*vcpu*1024`. Reject custom tiers when edition is Enterprise Plus.
- **Instance ID validator:** `^[a-z][a-z0-9-]*$` with `len(project)+1+len(id) ≤ 98`. The docs don't say whether a trailing hyphen is allowed. Rejecting it, as other GCP IDs do, is a [reconstructed] choice.
- **[reconstructed] gcloud-style errors:**
  - `ERROR: (gcloud.sql.instances.create) HTTPError 400: Invalid request: Invalid Tier (db-custom-3-4096) for (MYSQL_8_0)...`
  - "Invalid request: instance name (X) is invalid." Not found verbatim in docs; treat as illustrative only.
- **Exam points:**
  - HA (REGIONAL) provides a standby in another zone of the same region. Cross-region DR uses read replicas.
  - PITR on MySQL needs binary logging plus backups.
  - Private IP needs a PSA allocated range and peering.
  - The Cloud SQL Auth Proxy / connectors authenticate with IAM (`roles/cloudsql.client`). Not fetched; see Gaps.

### Gaps
- The Cloud SQL Auth Proxy / language connectors page was not fetched (needs `roles/cloudsql.client`; unverified here).
- Cross-region read replica specifics (max replicas, cascading) were not fetched.
- Minimum storage size is not stated explicitly beyond the gcloud default of 10 GB. The 10 GB minimum is widely cited but not verified on the fetched pages.
- SQL Server editions and defaults were not detailed.

---

## 3. Pub/Sub topic and subscription

### Takeaway
- **IDs (topics, subscriptions, schemas, snapshots):** 3–255 chars, start with a letter, use only letters, digits, `- _ . ~ + %`, and must not start with `goog`.
- **Ack deadline:** 10–600 s, default 10.
- **Subscription retention:** now 10 min–31 days (default 7 days). This is a change from the older 7-day maximum.
- **Expiration:** default 31 days, min 1 day, or `never`, and must be ≥ retention.
- **Retry backoff:** 0–600 s (min defaults to 10 s, max to 600 s).
- **Dead-lettering:** 5–100 attempts (default 5), and the Pub/Sub service agent needs publisher on the DLQ topic and subscriber on the source subscription.
- **Filter:** immutable after create.

### Cited Findings

**ID rule.** 3–255 chars; "Start with a letter"; must not begin with `goog`; letters, digits, dashes, underscores, periods, tildes, plus and percent signs. Other characters must be percent-encoded: "mi-tópico" is invalid, "mi-t%C3%B3pico" is valid. Full name `projects/PROJECT/topics/ID`. — [pubsub-basics](https://docs.cloud.google.com/pubsub/docs/pubsub-basics)

**Topic create**

| Field | gcloud flag | Rule | Default | Src |
|---|---|---|---|---|
| Topic ID | positional | ID rule above | — | [basics](https://docs.cloud.google.com/pubsub/docs/pubsub-basics) |
| Message retention | `--message-retention-duration` | "The minimum is 10 minutes and the maximum is 31 days." [verbatim]; format `INTEGER[s/m/h/d]`, bare number = seconds | unset (subscriptions control retention) | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |
| Schema | `--schema`, `--message-encoding` (`json`/`binary`), `--first-revision-id`, `--last-revision-id` | schema and encoding are required if any schema flag is set | none | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |
| Message storage policy | `--message-storage-policy-allowed-regions`, `--message-storage-policy-enforce-in-transit` | list of regions | — | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |
| Encryption | `--topic-encryption-key` (+ keyring/location/project) | key purpose `ENCRYPT_DECRYPT`; Pub/Sub SA needs cryptoKeyEncrypterDecrypter | Google-managed | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |
| Ingestion source | MSK / Azure Event Hubs / Cloud Storage (`text`,`avro`,`pubsub_avro`) / Confluent / Kinesis flag groups | at most one source | none | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |
| Labels | `--labels` | "Keys must start with a lowercase character and contain only hyphens (-), underscores (_), lowercase characters, and numbers." | — | [gcloud topics](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/topics/create) |

**Subscription create**

| Field | gcloud flag | Rule | Default | Src |
|---|---|---|---|---|
| Topic | `--topic` | required | — | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Delivery type | none = Pull; `--push-endpoint` = Push; `--bigquery-table={project}:{dataset}.{table}` = BigQuery; `--cloud-storage-bucket` = Cloud Storage | Push endpoint: "A URL to use as the endpoint"; without it the subscription is PULL | Pull | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Ack deadline | `--ack-deadline` | 10–600 s | 10 s | [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Message retention | `--message-retention-duration` | "The default value is 7 days, the minimum is 10 minutes, and the maximum is 31 days." [verbatim] | 7 d | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create), [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Retain acked messages | `--[no-]retain-acked-messages` | "Acknowledged messages are not retained by default." [verbatim] | off | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Expiration period | `--expiration-period` | min 1 day; "never"; must be ≥ retention duration | 31 days | [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Retry policy | `--min-retry-delay`, `--max-retry-delay` | "Value should be between 0 and 600 seconds. Defaults to 10 seconds." / "...Defaults to 600 seconds." [verbatim] | retry immediately | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create), [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Dead letter | `--dead-letter-topic`, `--max-delivery-attempts`, `--dead-letter-topic-project` | "The value must be between 5 and 100. Defaults to 5." [verbatim]; the topic flag is required when attempts are set | off | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Message ordering | `--[no-]enable-message-ordering` | publishers must set an ordering key | off | [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Exactly-once delivery | `--[no-]enable-exactly-once-delivery` | — | off | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Filter | `--message-filter` | "must be a non-empty string in the Pub/Sub filtering language" [verbatim]; attributes only; non-matching messages are auto-acked | none | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create), [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties) |
| Push auth | `--push-auth-service-account`, `--push-auth-token-audience` | audience "If not specified, it will be set to the push-endpoint." [verbatim] | none | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Push unwrap | `--push-no-wrapper` | message data delivered directly as the HTTP body | off | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| BigQuery opts | `--use-topic-schema` (exclusive with `--use-table-schema`), `--write-metadata` | — | — | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |
| Cloud Storage opts | `--cloud-storage-file-prefix`, `--cloud-storage-max-duration` ("between 1m and 10m"), `--cloud-storage-max-bytes` ("between 1000B and 10GB"; no unit = KB) | — | — | [gcloud subs](https://docs.cloud.google.com/sdk/gcloud/reference/pubsub/subscriptions/create) |

**Immutability.** Only the filter is immutable: "The filter cannot be changed or removed after it is applied." The other properties can be updated. — [sub props](https://docs.cloud.google.com/pubsub/docs/subscription-properties)

**Dead-letter IAM** (from [handling-failures](https://docs.cloud.google.com/pubsub/docs/handling-failures))
- The service agent `service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com` needs `roles/pubsub.publisher` on the DLQ topic and `roles/pubsub.subscriber` on the source subscription.
- The DLQ must be a different topic and needs its own subscription, otherwise forwarded messages are lost.
- Forwarding is best-effort.

**Push behaviour** (from [push](https://docs.cloud.google.com/pubsub/docs/push) and [auth push](https://docs.cloud.google.com/pubsub/docs/authenticate-push-subscriptions))
- Success codes are 102, 200, 201, 202 and 204; anything else is a nack.
- Push backoff runs 100 ms–60 s and isn't configurable.
- The per-message ack deadline can't be modified for push.
- Auth:
  - The caller needs `iam.serviceAccounts.actAs` (e.g. `roles/iam.serviceAccountUser`) on the push SA.
  - The Pub/Sub service agent needs `roles/iam.serviceAccountTokenCreator` on that SA or the project.
  - For Cloud Run, the push SA needs `roles/run.invoker`.
  - The JWT carries `email` and `aud` claims.

### Inferences
- **Topic/subscription ID validator:** `^(?!goog)[A-Za-z][A-Za-z0-9\-_.~+%]{2,254}$`.
- **Cross-field checks for the simulator:**
  - expiration ≥ retention (unless `never`)
  - minRetryDelay ≤ maxRetryDelay, both within 0–600 s
  - attempts 5–100 only when a DLQ is set
  - DLQ topic ≠ source topic
- The prompt's "subscription retention 10 min–7 days" is outdated. The current maximum is 31 days.
- **[reconstructed] API error style:** `INVALID_ARGUMENT: Invalid resource name given (name=projects/p/topics/go). Refer to https://cloud.google.com/pubsub/docs/pubsub-basics#resource_names for more information.` This matches the commonly seen Pub/Sub wording but was not verified in this session.

### Gaps
- The verbatim API error strings for invalid IDs or out-of-range durations were not found in the docs.
- Maximum filter expression length was not stated (the page gives no maximum).
- Topic schema types (Avro/Protocol Buffer) and schema ID rules were not fetched in detail.

---

## 4. BigQuery dataset and table

### Takeaway
- **Dataset IDs:** letters, digits and underscores, ≤1,024 chars, case-sensitive by default, no `-`. Leading `_` makes the dataset hidden.
- **Location:** fixed at creation.
- **Time travel:** 48–168 h in multiples of 24 (default 168).
- **Default table expiration:** min 3600 s.
- **Storage billing:** LOGICAL by default; after a change, it can't be changed again for 14 days.
- **Partitioning:** time-unit column (DATE/TIMESTAMP/DATETIME), ingestion time, or integer range.
- **Clustering:** ≤4 top-level non-repeated columns.
- **Location matching:** jobs must match dataset locations. A region mixed with a multi-region now runs as a "global query".

### Cited Findings

| Field (Console / bq flag) | Rule | Default | Imm | Src |
|---|---|---|---|---|
| Dataset ID / `bq mk -d PROJECT:DATASET` | ≤1,024 chars; letters (upper or lower), numbers, underscores; spaces and `- & @ %` not allowed; case-sensitive unless case-insensitive is enabled; leading `_` = hidden dataset; unique per project | — | Yes | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Location / `--location` | Multi-regions `US`, `EU` (US data stays in us-central1/us-west1/us-central2; EU data in europe-west1/europe-west4) or a region. Multi-region gives no cross-region redundancy. | if no job location can be inferred and no default is set, `US` | Yes | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets), [bq locations](https://docs.cloud.google.com/bigquery/docs/locations) |
| Default table expiration / `--default_table_expiration` (s) | min 3600 s (SQL min 0.042 days); projects without billing get an automatic default | none | No | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Default partition expiration / `--default_partition_expiration` (s) | — | none | No | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Time travel window / `--max_time_travel_hours` | 48–168, multiples of 24 | 168 | No | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Storage billing model / `--storage_billing_model` | `LOGICAL`, `PHYSICAL`; takes 24 h to apply; 14-day wait before changing again; physical blocked if legacy flat-rate commitments exist in the region | LOGICAL | No | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Encryption / `--default_kms_key` | CMEK; tables then can't use Google-managed keys | Google-managed | — | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Labels / `--label=K:V`; tags `--add_tags` | — | — | No | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |
| Permission | `bigquery.datasets.create` (dataEditor, dataOwner, user, admin); the creator gets `roles/bigquery.dataOwner` | — | — | [datasets](https://docs.cloud.google.com/bigquery/docs/datasets) |

**Partitioning** (from [partitioned-tables](https://docs.cloud.google.com/bigquery/docs/partitioned-tables))
- Integer range: an `INTEGER` column with start (inclusive), end (exclusive) and interval.
- Time-unit column:
  - `DATE`: DAY/MONTH/YEAR.
  - `TIMESTAMP`/`DATETIME`: HOUR/DAY/MONTH/YEAR.
  - Default granularity: daily.
- Ingestion time: pseudocolumns `_PARTITIONTIME` and `_PARTITIONDATE`.
- Partition boundaries are in UTC.
- Special partitions:
  - `__NULL__`
  - `__UNPARTITIONED__` (out-of-range integers, or dates before 1960-01-01 or after 2159-12-31)
- Partition expiration deletes whole partitions.

**Clustering** (from [clustered](https://docs.cloud.google.com/bigquery/docs/clustered-tables))
- "You can only specify up to four clustering columns." [verbatim]
- Columns must be top-level and non-repeated, of type BIGNUMERIC, BOOL, DATE, DATETIME, GEOGRAPHY, INT64, NUMERIC, RANGE, STRING or TIMESTAMP.
- Order matters.
- Automatic reclustering runs in the background.
- Altering a non-clustered table to clustered doesn't recluster existing data.

**Locations for jobs and loads** (from [bq locations](https://docs.cloud.google.com/bigquery/docs/locations))
- "BigQuery returns an error if the specified location does not match the location of the datasets in the request." [verbatim]
- A single region doesn't match the multi-region that contains it; mixing the two runs a global query.
- Load data from colocated Cloud Storage buckets. A `US` dataset works with an Iowa bucket or a NAM4 dual-region, and an `EU` dataset with EUR4.

### Inferences
- **Dataset ID validator:** `^[A-Za-z0-9_]{1,1024}$`.
- **[reconstructed] bq error:** `BigQuery error in mk operation: Dataset names must contain only letters, numbers, and underscores` (illustrative).
- Exam: "dataset in the wrong location" means copying the dataset or recreating it. Dataset location can't be edited.
- The prompt's claim that cross-location joins are impossible needs a nuance: region versus multi-region now falls back to global queries, but the default behaviour is still an error on location mismatch.

### Gaps
- The quotas page (max partitions per table, commonly 10,000) wasn't readable in the first 100k chars, so this is unverified.
- bq table flags (`--time_partitioning_type`, `--time_partitioning_field`, `--range_partitioning`, `--clustering_fields`, `--require_partition_filter`) aren't on the fetched pages. They exist in `bq mk` but were not verified here.
- No verbatim dataset-ID error message was found.

---

## 5. Memorystore for Redis, Valkey and Memcached

### Takeaway
- **Redis tiers:** `BASIC` (single node, no failover) or `STANDARD_HA` (primary plus replica with automatic failover). You can't switch tiers after create.
- **Size:** up to 300 GB; the gcloud default is 1 GiB.
- **Connect mode:** `DIRECT_PEERING` by default or `PRIVATE_SERVICE_ACCESS` (needed for Shared VPC). It can't be changed after create.
- **IP range:** /29 by default, /28 with read replicas.
- **Read replicas:** 1–5 (default 2) on Standard instances of 5 GB or more.
- **AUTH and in-transit TLS:** both off by default.
- **Valkey:** shard-based (0–5 replicas per shard), versions 7.2, 8.0, 9.0 and 9.1.

### Cited Findings

| Field | gcloud / API | Rule | Default | Imm | Src |
|---|---|---|---|---|---|
| Instance ID | positional / `name` | path `projects/{p}/locations/{l}/instances/{id}` | — | Yes | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances) |
| Tier | `--tier basic\|standard` / `tier: BASIC\|STANDARD_HA` | "It is not possible to upgrade from Basic Tier to Standard Tier or the other way around." [verbatim] | basic | Yes | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create), [tiers](https://docs.cloud.google.com/memorystore/docs/redis/redis-tiers) |
| Capacity | `--size` / `memorySizeGb` (required in the API) | max 300 GB primary; scalable | "If not provided, size of 1 GiB will be used." [verbatim] | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create), [tiers](https://docs.cloud.google.com/memorystore/docs/redis/redis-tiers) |
| Version | `--redis-version` | `redis_3_2`, `redis_4_0`, `redis_5_0`, `redis_6_x`, `redis_7_0`, `redis_7_2` | REST marks REDIS_7_0 default; Console shows "7.2 (Recommended)" | upgrade only | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create), [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances), [console](https://docs.cloud.google.com/memorystore/docs/redis/create-instance-console) |
| Region / Zone / Alternative zone | `--region`, `--zone`, `--alternative-zone` | the alternative zone is Standard only and must differ from `--zone` | random zone | Yes | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |
| Authorized network | `--network` / `authorizedNetwork` | VPC network (legacy networks not supported) | `default` | — | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances), [console](https://docs.cloud.google.com/memorystore/docs/redis/create-instance-console) |
| Connect mode | `--connect-mode direct-peering\|private-service-access` | "If not provided, the connect mode defaults to DIRECT_PEERING." [verbatim]; PSA required for Shared VPC and on-prem over VPN | DIRECT_PEERING | Yes ("You cannot switch the connection mode of an existing instance.") | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances), [networking](https://docs.cloud.google.com/memorystore/docs/redis/networking) |
| Reserved IP range | `--reserved-ip-range` | direct peering: a unique non-overlapping CIDR; PSA: the allocated-range name | unused /29 (/28 with read replicas) | — | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances) |
| Read replicas | `--read-replicas-mode`, `--replica-count` | "valid range for the Standard Tier with read replicas enabled is [1-5] and defaults to 2"; Basic = 0 [verbatim]; "Only works against standard tier instances with 5GB and above provisioned capacity." [verbatim] | READ_REPLICAS_DISABLED | — | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances), [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |
| AUTH | `--enable-auth` / `authEnabled` | bool | false ("If omitted AUTH is disabled.") | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |
| In-transit encryption | `--transit-encryption-mode disabled\|server-authentication` | — | "If not provided, TLS is disabled for the instance." [verbatim] | not verified | [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances) |
| Persistence | `--persistence-mode disabled\|rdb`, `--rdb-snapshot-period 1h\|6h\|12h\|24h` | — | RDB period 24 h | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create), [REST](https://docs.cloud.google.com/memorystore/docs/redis/reference/rest/v1/projects.locations.instances) |
| Maintenance window | `--maintenance-window-day`, `--maintenance-window-hour` (0–23 UTC) | — | — | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |
| Redis config | `--redis-config` | keys such as `maxmemory-policy`, `notify-keyspace-events`, `timeout`, `databases`, `maxmemory-gb` and others, depending on version | — | No | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |
| CMEK | `--customer-managed-key` | — | Google-managed | — | [gcloud](https://docs.cloud.google.com/sdk/gcloud/reference/redis/instances/create) |

- The client port is 6379. — [console](https://docs.cloud.google.com/memorystore/docs/redis/create-instance-console)
- Max network bandwidth is 16 Gbps. — [tiers](https://docs.cloud.google.com/memorystore/docs/redis/redis-tiers)
- On-prem access goes through VPN or Interconnect with PSA and custom-route exchange. — [networking](https://docs.cloud.google.com/memorystore/docs/redis/networking)

**Valkey** (from [valkey overview](https://docs.cloud.google.com/memorystore/docs/valkey/product-overview))
- Runs in Cluster Mode Enabled or Disabled.
- "Each shard can have 0-5 replica nodes." [verbatim]
- Nodes are spread across zones automatically.
- Supports Valkey 7.2, 8.0, 9.0 and 9.1.

### Inferences
- **Instance ID validator (Memorystore convention):** `^[a-z]([a-z0-9-]{0,38}[a-z0-9])?$`, i.e. 1–40 chars. This is [reconstructed] from the common rule; the fetched pages didn't state it.
- **Exam points:**
  - Basic = cache that may be flushed. Standard = HA.
  - Shared VPC means PRIVATE_SERVICE_ACCESS.
  - Cloud Run reaches the instance via Direct VPC egress or a Serverless VPC Access connector.

### Gaps
- M1–M5 capacity-tier GB ranges weren't returned (the pricing page was truncated).
- Valkey node types, PSC service-connection-policy requirement and engine enum names weren't on the overview page.
- Memorystore for Memcached was not researched (node count, CPU and memory per node). Not covered.
- The Redis instance ID rules weren't found verbatim.

---

## 6. Firestore

### Takeaway
- **Database ID:** 4–63 chars, lowercase letters, digits and hyphens, starting with a letter and ending with a letter or digit. It must not look like a UUID. `(default)` is created when no ID is given.
- **Mode:** `firestore-native` or `datastore-mode`.
- **Edition:** Standard or Enterprise.
- **Location:** a region or multi-region (`nam5`, `nam7`, `eur3`), unchangeable.
- **Limits:** up to 100 databases per project; delete protection is off by default.

### Cited Findings

| Field | gcloud | Rule | Default | Src |
|---|---|---|---|---|
| Database ID | `--database` | lowercase letters, numbers, hyphens; start with a letter; end with a letter or number; 4–63 chars; "Must not be a UUID or resemble a UUID." [verbatim]; `(default)` if no ID is entered (Standard edition); a deleted ID can't be reused for about 5 min | `(default)` | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| Mode | `--type=firestore-native\|datastore-mode` | — | — | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| Edition | `--edition=standard\|enterprise` | Enterprise can toggle real-time updates and MongoDB-compatible access | — | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| Location | `--location` | multi-region `eur3` (europe-west1+west4, witness europe-north1), `nam5` (us-central1+us-central2, witness us-east1), `nam7` (us-central1+us-east4, witness us-central2), or a region; "once you provision a database instance, you cannot change its location setting" [verbatim] | — | [locations](https://docs.cloud.google.com/firestore/native/docs/locations) |
| Delete protection | `--[no-]delete-protection` | — | disabled | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| Security rules (Console, Native) | — | initial rules choice; "Restrictive" if not using the Firebase mobile/web SDKs | — | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| CMEK | Console encryption options; clone with `--encryption-type`, `--kms-key-name` | — | Google-managed | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |
| PITR | — | clone any minute in the last 7 days with PITR, else the last hour | off | [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases) |

- SLA: multi-region 99.999%, regional 99.99%. — [locations](https://docs.cloud.google.com/firestore/native/docs/locations)
- The default database's location may be tied to the project's "location for default Google Cloud resources" (App Engine); named databases are not. — [locations](https://docs.cloud.google.com/firestore/native/docs/locations)
- Max 100 databases per project. — [manage-dbs](https://docs.cloud.google.com/firestore/native/docs/manage-databases)

### Inferences
- **Database ID validator:** `^[a-z][a-z0-9-]{2,61}[a-z0-9]$`, plus a UUID-shape rejection, with `(default)` special-cased.
- Exam: choosing Native versus Datastore mode is a create-time decision per database. Datastore mode suits server-side apps; Native mode suits mobile and web clients with security rules and real-time listeners.

### Gaps
- Firestore triggers (Cloud Run functions / Eventarc event types such as `google.cloud.firestore.document.v1.written`) were not fetched.
- Whether mode can be switched on an empty database was not verified.

---

## 7. Secret Manager (plus Cloud Run usage)

### Takeaway
- **Secret IDs:** letters, digits, `-` and `_`, ≤255 chars.
- **Value size:** ≤64 KiB.
- **Replication:** automatic (the default) or user-managed. The locations can't be updated after create.
- **Roles:** creating needs `roles/secretmanager.admin`; reading needs `roles/secretmanager.secretAccessor`.
- **Versions:** referenced by number or `latest`.
- **Cloud Run:** mounts secrets as env vars (resolved at startup, so pin a version) or volumes (always fetch the latest).

### Cited Findings

| Field | gcloud | Rule | Default | Src |
|---|---|---|---|---|
| Name (secret ID) | `gcloud secrets create SECRET_ID` | "A secret name can contain uppercase and lowercase letters, numerals, hyphens, and underscores." [verbatim]; max 255 chars | — | [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets) |
| Secret value | `--data-file` | "must not be larger than 64 KiB" [verbatim] | — | [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets) |
| Replication policy | `--replication-policy=automatic\|user-managed` (+ locations) | "The locations in the replication policy can't be updated." [verbatim]; user-managed bills each location | automatic | [replication](https://docs.cloud.google.com/secret-manager/docs/choosing-replication) |
| Expiration / TTL | API `ttl` (e.g. `"7776000s"`) | — | none | [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets) |
| Secret type (Preview) | Console | Other DB credentials / Access key / Certificate / Other; settable only at creation | — | [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets) |
| Access | `gcloud secrets versions access VERSION_ID --secret=SECRET_ID` (`latest` allowed) | role `roles/secretmanager.secretAccessor` | — | [access](https://docs.cloud.google.com/secret-manager/docs/access-secret-version) |
| Create permission | — | `roles/secretmanager.admin` | — | [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets) |

The REST create endpoint is `POST https://secretmanager.googleapis.com/v1/projects/PROJECT_ID/secrets?secretId=SECRET_ID`. — [create](https://docs.cloud.google.com/secret-manager/docs/creating-and-accessing-secrets)

**Cloud Run secrets** (from [run secrets](https://docs.cloud.google.com/run/docs/configuring/services/secrets))
- Env var form: `--update-secrets=ENV=SECRET:VERSION`. "Environment variables are resolved at instance startup time." [verbatim]; pinning a version is recommended.
- Volume form: `--update-secrets=/path=SECRET:VERSION`. "When reading a volume, Cloud Run always fetches the secret value from the Secret Manager to use the value with the latest version." [verbatim]
- `--set-secrets` replaces all secrets; `--clear-secrets` and `--remove-secrets` remove them.
- You can't mount at `/dev`, `/proc` or `/sys`, and you can't mount two secrets at the same path.
- Cross-project form: `projects/PROJECT_NUMBER/secrets/NAME:VERSION`.
- The service identity needs `secretAccessor`. The deployer needs `roles/run.admin` and `roles/iam.serviceAccountUser`.
- Regional secrets aren't supported.

### Inferences
- **Secret ID validator:** `^[A-Za-z0-9_-]{1,255}$`.
- Exam: "app can't read the secret" means granting `secretAccessor` to the runtime service account, not to the user. A rotated env-var secret needs a new revision; a volume mount picks it up.

### Gaps
- Version state semantics (ENABLED/DISABLED/DESTROYED, destroy irreversible) and the error text when accessing a disabled version were not on the fetched page.
- Rotation (`--next-rotation-time`, `--rotation-period`, which require a Pub/Sub topic) was not fetched.

---

## 8. Artifact Registry (and Container Registry)

### Takeaway
- **Formats:** DOCKER, MAVEN, NPM, PYTHON, APT, YUM, GO, KFP, GENERIC, GOOGET, RUBY (Ruby and Conda are in Preview).
- **Modes:** standard, remote, virtual (plus Assured OSS).
- **Fixed at create:** format, mode, location and encryption.
- **Immutable tags:** Docker only, off by default.
- **Cleanup policies:** support dry run.
- **Container Registry:** shut down for writes since March 18, 2025. gcr.io URLs work via Artifact Registry gcr.io repositories.

### Cited Findings

| Field | gcloud | Rule | Default | Imm | Src |
|---|---|---|---|---|---|
| Repository name | `gcloud artifacts repositories create REPO` | "For each repository location in a project, repository names must be unique." | — | Yes | [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos) |
| Format | `--repository-format` | `DOCKER, MAVEN, NPM, APT, YUM, GOOGET, PYTHON, KFP, GO, GENERIC, RUBY` | — | Yes | [REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories) |
| Mode | `--mode` | `STANDARD_REPOSITORY`, `VIRTUAL_REPOSITORY`, `REMOTE_REPOSITORY`, `ASSURED_OSS_REPOSITORY` | standard | Yes | [REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories) |
| Location | `--location` | region or multi-region | — | Yes | [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos) |
| Encryption | `--kms-key` | "This value may not be changed after the Repository has been created." [verbatim] | Google-owned and Google-managed | Yes | [REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories) |
| Immutable tags | `--immutable-tags` | "prevents all tags from being modified, moved or deleted. This does not prevent tags from being created." [verbatim] | disabled | No (an admin can change it) | [REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories), [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos) |
| Cleanup policies | Console / policy file | Conditional delete, Conditional keep, Keep most recent versions; policy IDs unique and under 128 chars; dry run: "No artifacts are deleted in dry run mode." | dry run optional | No | [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos), [REST](https://docs.cloud.google.com/artifact-registry/docs/reference/rest/v1/projects.locations.repositories) |
| Vulnerability scanning | `--allow-vulnerability-scanning` / `--disable-vulnerability-scanning` | requires the Container Scanning API | — | No | [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos) |
| Maven options | `--version-policy`, `--allow-snapshot-overwrites` | — | — | — | [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos) |

- Creating a repository requires `roles/artifactregistry.admin` per the create page. — [create-repos](https://docs.cloud.google.com/artifact-registry/docs/repositories/create-repos)
- "Effective March 18, 2025, Container Registry is shut down and writing images to Container Registry is unavailable." [verbatim] — [transition](https://docs.cloud.google.com/artifact-registry/docs/transition/transition-from-gcr)
- Repository paths look like `us-docker.pkg.dev/my-project/team1`. — [transition](https://docs.cloud.google.com/artifact-registry/docs/transition/transition-from-gcr)

### Inferences
- The image path is `LOCATION-docker.pkg.dev/PROJECT-ID/REPOSITORY/IMAGE:TAG` (or `@sha256:DIGEST`). This is consistent with the `us-docker.pkg.dev/my-project/team1` examples but wasn't stated as a template on the fetched page.
- Exam roles: `roles/artifactregistry.reader` to pull (e.g. GKE node SA, Cloud Run service agent), `roles/artifactregistry.writer` to push (Cloud Build SA). These are standard role names but were not fetched in this session.
- **[reconstructed] repo-name validator:** lowercase letters, digits and hyphens, starting with a letter, ≤63 chars. Unverified.

### Gaps
- The exact repository ID regex and length were not found.
- The reader/writer/repoAdmin role descriptions were not fetched.
- The Container Registry read-shutdown date was not stated on the transition page.

---

## 9. Cloud Scheduler, Cloud Tasks, Eventarc, Workflows

### Takeaway
**Cloud Scheduler**
- Job IDs: letters, digits, `-` and `_`, ≤500 chars.
- Schedule: 5-field unix-cron (or English-like groc via CLI/API only), tz-database time zone, default UTC.
- Targets: HTTP (OIDC or OAuth token from a same-project SA; the caller needs actAs), Pub/Sub, or App Engine HTTP.
- Retries: 0–5 (default 0); min backoff 5 s, max 1 h, 5 doublings.
- HTTP attempt deadline: 15 s–30 min (default 3 min).

**Eventarc (Cloud Storage triggers)**
- Event types are `google.cloud.storage.object.v1.{finalized,deleted,archived,metadataUpdated}`.
- The trigger location must match the bucket's location.
- The trigger SA needs `roles/eventarc.eventReceiver`; the GCS service agent needs `roles/pubsub.publisher`.
- Triggers can take up to 2 minutes to become active.

### Cited Findings

**Cloud Scheduler job (HTTP target)**

| Field | gcloud | Rule | Default | Src |
|---|---|---|---|---|
| Name | `JOB` | JOB_ID: letters, numbers, hyphens, underscores; "The maximum length is 500 characters." [verbatim] | — | [REST](https://docs.cloud.google.com/scheduler/docs/reference/rest/v1/projects.locations.jobs) |
| Region | `--location` | defaults to the App Engine app location if one exists, otherwise required | — | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| Frequency | `--schedule` | minute 0-59, hour 0-23, day of month 1-31, month 1-12 or JAN-DEC, day of week 0-6 or SUN-SAT (7 = Sunday); `* - , /`; no `L`; DOM and DOW combine with OR unless one is `*` | — | [cron](https://docs.cloud.google.com/scheduler/docs/configuring/cron-job-schedules) |
| Timezone | `--time-zone` | tz database name | UTC (the gcloud ref says both "Etc/UTC" and "utc", which is inconsistent) | [cron](https://docs.cloud.google.com/scheduler/docs/configuring/cron-job-schedules), [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| URL | `--uri` | must begin with "http://" or "https://"; ≤2083 chars after encoding | — | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| HTTP method | `--http-method` | "HTTP_METHOD must be one of: delete, get, head, post, put." [verbatim] | post | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| Body / headers | `--message-body` (PUT/POST only), `--headers` | — | — | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| Auth header | `--oidc-service-account-email` + `--oidc-token-audience` (defaults to the URI), or `--oauth-service-account-email` + `--oauth-token-scope` (default `https://www.googleapis.com/auth/cloud-platform`) | mutually exclusive; the SA must be in the same project; the caller needs `iam.serviceAccounts.actAs` | — | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |
| Attempt deadline | `--attempt-deadline` | HTTP: "[15 seconds, 30 minutes]"; App Engine: up to 24 h 15 s; ignored for Pub/Sub | HTTP 3 min | [REST](https://docs.cloud.google.com/scheduler/docs/reference/rest/v1/projects.locations.jobs) |
| Retry | `--max-retry-attempts` ("Must be in range 0-5 inclusive. Default is 0." [verbatim]), `--max-retry-duration` (0 = unlimited), `--min-backoff` (5s), `--max-backoff` (3600s), `--max-doublings` (5) | — | see left | [gcloud http](https://docs.cloud.google.com/sdk/gcloud/reference/scheduler/jobs/create/http) |

- Job states: ENABLED, PAUSED, DISABLED (system-set because of errors), UPDATE_FAILED. — [REST](https://docs.cloud.google.com/scheduler/docs/reference/rest/v1/projects.locations.jobs)
- Target types: `httpTarget`, `pubsubTarget`, `appEngineHttpTarget`. — [REST](https://docs.cloud.google.com/scheduler/docs/reference/rest/v1/projects.locations.jobs)
- Cloud Scheduler runs on wall-clock time, so daylight-saving changes can make jobs run unexpectedly or not at all; UTC is recommended. — [cron](https://docs.cloud.google.com/scheduler/docs/configuring/cron-job-schedules)

**Cloud Tasks queue** (from [gcloud tasks](https://docs.cloud.google.com/sdk/gcloud/reference/tasks/queues/create))
- `--location` defaults to the App Engine app location.
- Flags: `--max-attempts`, `--max-retry-duration`, `--min-backoff`, `--max-backoff` (values must end in "s"), `--max-doublings`, `--max-dispatches-per-second`, `--max-concurrent-dispatches`.
- `--log-sampling-ratio` takes 0.0–1.0 (default 0.0).
- `--http-uri-override` mode is ALWAYS (default) or IF_NOT_EXISTS.

**Eventarc**
- Destinations: Cloud Run, Cloud Run functions, GKE, internal HTTP endpoints in a VPC, Workflows. — [providers](https://docs.cloud.google.com/eventarc/standard/docs/event-providers-targets)
- Direct event types: `google.cloud.storage.object.v1.finalized`, `.deleted`, `.archived`, `.metadataUpdated`, and `google.cloud.pubsub.topic.v1.messagePublished`. Audit-log triggers filter on `serviceName` and `methodName`. — [supported events](https://docs.cloud.google.com/eventarc/docs/reference/supported-events)
- Example create command for a Cloud Storage trigger (from [eventarc storage](https://docs.cloud.google.com/eventarc/standard/docs/run/create-trigger-storage-gcloud)):
  `gcloud eventarc triggers create NAME --destination-run-service=SVC --destination-run-region=REGION --event-filters="type=google.cloud.storage.object.v1.finalized" --event-filters="bucket=BUCKET" --service-account=PROJECT_NUMBER-compute@developer.gserviceaccount.com`
- Permissions for that trigger (same source):
  - The trigger SA needs `roles/eventarc.eventReceiver`.
  - The Cloud Storage service agent (`gcloud storage service-agent`) needs `roles/pubsub.publisher`.
  - The Pub/Sub service agent needs `roles/iam.serviceAccountTokenCreator`, only if it was enabled on or before April 8, 2021.
- The bucket must be in the same project and the same region or multi-region as the trigger.
- "it can take up to two minutes for triggers to be fully functional" [verbatim].
- Eventarc Advanced doesn't support Cloud Storage or Pub/Sub as Google event sources. — [supported events](https://docs.cloud.google.com/eventarc/docs/reference/supported-events)

### Inferences
- **Cron validator:** split into exactly 5 whitespace-separated fields and validate each field's range, `*`, ranges, lists and steps.
- **[reconstructed] invalid schedule error:** `ERROR: (gcloud.scheduler.jobs.create.http) INVALID_ARGUMENT: Schedule or time zone is invalid.` This matches the commonly seen API wording but wasn't verified in the docs.
- Exam:
  - Scheduler calling a private Cloud Run service = OIDC token plus `roles/run.invoker` for the SA.
  - Calling Google APIs (`*.googleapis.com`) = OAuth token.

### Gaps
- Workflows (YAML/JSON syntax, `gcloud workflows deploy --source`, service account) was not researched.
- Cloud Tasks queue name rules and numeric default ranges weren't on the gcloud page.
- The Eventarc trigger name rules and the `roles/run.invoker` requirement for the trigger SA were not confirmed on the fetched page.

---

## 10. IAM service accounts

### Takeaway
- **Account ID:** 6–30 chars matching `[a-z]([-a-z0-9]*[a-z0-9])`. It starts with a lowercase letter, can't end with a hyphen, and can't be renamed.
- **Email:** `NAME@PROJECT_ID.iam.gserviceaccount.com`.
- **Default Compute SA:** `PROJECT_NUMBER-compute@developer.gserviceaccount.com`. It may get Editor automatically unless `iam.automaticIamGrantsForDefaultServiceAccounts` is enforced (by default for orgs created on or after May 3, 2024; key-creation constraints follow the same date).
- **Keys:** avoid them and prefer Workload Identity Federation.
- **Roles:** `serviceAccountUser` = actAs/attach; `serviceAccountTokenCreator` = mint short-lived tokens.

### Cited Findings
- `accountId`: "must be 6-30 characters long, and match the regular expression `[a-z]([-a-z0-9]*[a-z0-9])` to comply with RFC1035." [verbatim]. Only `displayName` and `description` are user-assignable on the body. — [IAM REST create](https://docs.cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/create)
- "After you create a service account, you cannot change its name." [verbatim] — [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- Email format and numeric unique ID. — [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- Required roles: `roles/iam.serviceAccountCreator` to create, plus `roles/resourcemanager.projectIamAdmin` to grant project roles. — [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- Propagation: you "might need to wait for 60 seconds or more before you use the service account". — [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- The quota ("Service Account Count") varies per project. — [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- Commands:
  - `gcloud iam service-accounts create NAME --description=... --display-name=...`
  - `gcloud iam service-accounts add-iam-policy-binding EMAIL --member=user:... --role=roles/iam.serviceAccountUser`
  - Source: [sa-create](https://docs.cloud.google.com/iam/docs/service-accounts-create)
- The default Compute SA (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) is created when the Compute Engine API is enabled and attached to VMs by default. It "might automatically be granted the Editor role on your project". "If you created your organization after May 3, 2024, this constraint is enforced by default." — [compute SA](https://docs.cloud.google.com/compute/docs/access/service-accounts)
- Best practices (from [SA best practices](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)):
  - "We recommend that you avoid using service account keys whenever possible."
  - The "Disable service account key creation" and "Disable service account key upload" constraints are enforced by default for orgs created on or after May 3, 2024.
  - Use `constraints/iam.automaticIamGrantsForDefaultServiceAccounts` to stop the Editor grants.
  - Workload Identity Federation is recommended for on-prem and other-cloud workloads.
  - Token Creator lets a principal "request short-lived access tokens".

### Inferences
- **Validator:** `^[a-z]([-a-z0-9]{4,28}[a-z0-9])$` (6–30 total).
- **[reconstructed] gcloud message:** `ERROR: (gcloud.iam.service-accounts.create) argument NAME: Bad value [ab]: Service account name must be between 6 and 30 characters (inclusive), must begin with a lowercase letter, and consist of lowercase alphanumeric characters that can be separated by hyphens.` This is the widely seen gcloud wording but was not verified on a fetched page in this session.
- **Exam:**
  - Deploying Cloud Run or a VM "as" an SA requires `roles/iam.serviceAccountUser` on that SA.
  - Impersonation via `--impersonate-service-account` requires `roles/iam.serviceAccountTokenCreator`.

### Gaps
- The constraint IDs `iam.disableServiceAccountKeyCreation` / `iam.managed.disableServiceAccountKeyCreation` were not named verbatim on the fetched page; only the display names were.
- The max of 10 keys per SA was not verified.
- Display name and description length limits (commonly 100 chars and 256 UTF-8 bytes) were not verified.
- Workload Identity Federation pool and provider field rules were not researched.

---

## 11. Cloud Logging sinks / log buckets and Cloud Monitoring alerting

### Takeaway
**Logging sinks**
- Destinations: Cloud Storage, BigQuery, Pub/Sub, a log bucket, or another project (one hop only).
- The writer identity needs a destination role:
  - `storage.objectCreator` (Cloud Storage)
  - `bigquery.dataEditor` (BigQuery)
  - `pubsub.publisher` (Pub/Sub)
  - `logging.bucketWriter` (log bucket)
- Limits: 200 sinks per project (raisable to 4,000), 50 exclusions per sink, 20,000-char filters.

**Log buckets**
- `_Required`: 400 days, not configurable, sink can't be edited.
- `_Default`: 30 days, configurable 1–3650 days; its sink can be edited or disabled.

**Monitoring alert policies**
- Up to 6 conditions.
- Combiner AND by default (also OR and AND_WITH_MATCHING_RESOURCE).
- Auto-close defaults to 7 days.

### Cited Findings
- Destination URI formats (from [export](https://docs.cloud.google.com/logging/docs/export/configure_export_v2)):
  - `storage.googleapis.com/BUCKET`
  - `bigquery.googleapis.com/projects/P/datasets/D`
  - `pubsub.googleapis.com/projects/P/topics/T`
  - `logging.googleapis.com/projects/P/locations/L/buckets/B`
  - `logging.googleapis.com/projects/P`
- Sink command: `gcloud logging sinks create SINK_NAME SINK_DESTINATION [--log-filter=...] [--exclusion=...] [--description=...]`. If the response has `writerIdentity`, grant it the destination role. A sink name can't be changed. — [export](https://docs.cloud.google.com/logging/docs/export/configure_export_v2)
- Destination roles: Logs Bucket Writer, Storage Object Creator, BigQuery Data Editor, Pub/Sub Publisher. A sink to a same-project log bucket has no writer identity. — [export](https://docs.cloud.google.com/logging/docs/export/configure_export_v2)
- With no inclusion filter, all entries are routed. — [export](https://docs.cloud.google.com/logging/docs/export/configure_export_v2)
- "You can't modify or delete the `_Required` log sink." / "You can modify and disable the `_Default` log sink." [verbatim] — [routing](https://docs.cloud.google.com/logging/docs/routing/overview)
- Routing behaviour (from [routing](https://docs.cloud.google.com/logging/docs/routing/overview)):
  - Sinks don't route entries received before they were created.
  - A project destination allows only one hop.
  - New Cloud Storage sinks can take hours, since they are processed hourly.
  - Exclusions don't reduce `entries.write` quota.
- Quotas (from [logging quotas](https://docs.cloud.google.com/logging/quotas)):
  - `_Required`: 400 days, not configurable.
  - Project `_Default` and user buckets: 30 days default, 1–3650 days.
  - Folder/org `_Default`: 30 days, not configurable.
  - LogEntry max 256 KiB.
  - 200 sinks per project (up to 4,000).
  - 50 exclusion filters per sink (not increasable).
  - 20,000-char filters.
  - 100 log buckets per project (up to 2,500).
- Alerting (from [alerts in-depth](https://docs.cloud.google.com/monitoring/alerts/concepts-indepth)):
  - "An alerting policy can contain up to 6 conditions." [verbatim]
  - Combiners: OR ("Any condition is met"), AND (default), AND_WITH_MATCHING_RESOURCE.
  - Condition types: metric-threshold, metric-absence, forecast, PromQL/MQL.
  - Retest window (duration), e.g. 0, 3, 5, 15 or 20 min, or "No retest".
  - Alignment period plus per-series aligner (`aggregations.alignmentPeriod`, `perSeriesAligner`).
  - Missing-data handling options.
  - Auto-close defaults to 7 days.
  - Up to 1,000 open alerts per policy.
  - Notifications go to every channel on the policy (email, SMS and Slack are mentioned; SMS and Slack delivery isn't guaranteed).

### Inferences
- **Simulator checks:**
  - A sink to a GCS, BigQuery or Pub/Sub destination in another project should warn until the writer identity has the role.
  - `_Required` should be read-only.
  - Retention on `_Default` and custom buckets should accept 1–3650.
- **Exam:**
  - Logs kept longer than 30 days for audits = sink to Cloud Storage (Archive class plus bucket lock) or raise the retention of a custom log bucket.
  - Analytics on logs = BigQuery sink or Log Analytics.

### Gaps
- Sink name character rules and the 100-char limit were not found.
- Aggregated sinks (`--organization`/`--folder` with `--include-children`) were not fetched.
- Log bucket location immutability and Log Analytics upgrade details were not fetched.
- Uptime check fields (protocol HTTP/HTTPS/TCP, check frequency 1/5/10/15 min, regions, timeout) and notification channel type list were not researched in this session.
- Monitoring alert-policy gcloud flags were not covered.
