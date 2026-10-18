# Google Cloud compute and networking config fields, allowed values, defaults and validation rules (for a browser simulator)

Scope note: Google moved its docs from cloud.google.com to **docs.cloud.google.com** (301 redirects seen in Oct 2026). All links below use the new host. "Verbatim" means the text was quoted from the page. "(reconstructed)" means a suggested simulator message that is not verbatim.

---

## 1. Shared resource naming rule, and region/zone format

### Takeaway
Most Compute Engine resources use the RFC 1035 rule: 1 to 63 characters, matching `[a-z]([-a-z0-9]*[a-z0-9])?`. The API rejects bad names with `Invalid value for field 'resource.name': '<name>'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'`. Zones are named `<region>-<letter>`. Zone letters are not always a/b/c: us-central1 has a, b, c and f, and us-east1 and europe-west1 have b, c and d (no "a").

### Cited Findings
**Naming rule (Compute Engine)**
- Names must "Be 1-63 characters in length", "Comply with RFC 1035 conventions" and "Match the regular expression `^[a-z]([-a-z0-9]*[a-z0-9])?`". In words: the first character is a lowercase letter, the rest are lowercase letters, digits or hyphens, and the last character cannot be a hyphen. These rules apply "unless specified differently in the documentation for creating that resource." — [Naming resources](https://docs.cloud.google.com/compute/docs/naming-resources)
- Uniqueness: "resource names must be unique within a location within a project"; "you can reuse names across locations". If the project's `vmDnsSetting` is not `ZonalOnly`, "all VM names must be unique across the project." — [Naming resources](https://docs.cloud.google.com/compute/docs/naming-resources)
- **Verbatim API error** for a bad name: `Invalid value for field 'resource.name': 'test-BZ-retire-api'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'`. Here a Fog wrapper surfaced the Compute API error. — [Red Hat Bugzilla 1330982](https://bugzilla.redhat.com/show_bug.cgi?id=1330982)
- The same message appears for names with uppercase letters or underscores, and when a gcloud flag is passed as the name by accident. — [Search summary of Skills Boost review / Pulumi / MongoDB threads](https://www.skills.google/focuses/32756/reviews?page=819)

**Zone naming format**
- A standard zone name is the region plus a zone letter, for example `us-central1-a`. AI zones use a different form, for example `us-west4-ai2b`. — [Regions and zones](https://docs.cloud.google.com/compute/docs/regions-zones)

**Region to zone table (verbatim from the available-zones table)** — [Regions and zones](https://docs.cloud.google.com/compute/docs/regions-zones)

| Region | Zones | Location |
|---|---|---|
| us-central1 | a, b, c, **f** | Council Bluffs, Iowa |
| us-east1 | **b, c, d** | Moncks Corner, South Carolina |
| us-east4 | a, b, c | Ashburn, Virginia |
| us-east5 | a, b, c | Columbus, Ohio |
| us-south1 | a, b, c | Dallas, Texas |
| us-west1 | a, b, c | The Dalles, Oregon |
| us-west2 | a, b, c | Los Angeles |
| us-west3 | a, b, c | Salt Lake City |
| us-west4 | a, b, c | Las Vegas |
| northamerica-northeast1 | a, b, c | Montréal |
| southamerica-east1 | a, b, c | Osasco, São Paulo |
| europe-west1 | **b, c, d** | St. Ghislain, Belgium |
| europe-west2 | a, b, c | London |
| europe-west3 | a, b, c | Frankfurt |
| europe-west4 | a, b, c | Eemshaven, Netherlands |
| europe-north1 | a, b, c | Hamina, Finland |
| asia-east1 | a, b, c | Changhua County, Taiwan |
| asia-east2 | a, b, c | Hong Kong |
| asia-northeast1 | a, b, c | Tokyo |
| asia-northeast3 | a, b, c | Seoul |
| asia-south1 | a, b, c | Mumbai |
| asia-southeast1 | a, b, c | Jurong West, Singapore |
| asia-southeast2 | a, b, c | Jakarta |
| australia-southeast1 | a, b, c | Sydney |
| me-west1 | a, b, c | Tel Aviv |
| africa-south1 | a, b, c | Johannesburg |

### Inferences
- Simulator validator: `/^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/`. Add the `$` anchor, because the documented regex has none. A 1-character name such as `a` is valid.
- Suggested gcloud-style message (reconstructed; the inner message is verbatim from the API): `ERROR: (gcloud.compute.instances.create) Could not fetch resource:\n - Invalid value for field 'resource.name': 'My_VM'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'`
- A suggested Console inline hint (reconstructed) paraphrases the doc: "Name must start with a lowercase letter followed by up to 62 lowercase letters, numbers, or hyphens, and cannot end with a hyphen."
- Zone validator: reject `us-east1-a` and `europe-west1-a`. They do not exist and make good exam traps.

### Gaps
- I did not see a verbatim Console inline error string for an invalid name. The gcloud "Could not fetch resource:" prefix comes from memory and is not verified this session.
- The total count of regions and zones was not in the fetched part of the page.

---

## 2. Compute Engine VM instance create form

### Takeaway
The main validated fields are: name (RFC 1035), zone, machine type (predefined or custom with series-specific vCPU and memory rules), provisioning model (Standard/Spot, with Spot termination action STOP default or DELETE), boot disk (Console defaults to pd-balanced; gcloud/API default to pd-standard), service account and scopes, network tags (≤64, ≤63 chars), labels (≤64, keys ≤63), and availability policy (live migrate by default; Spot cannot restart automatically).

### Cited Findings
**Predefined machine types (exact)** — [General-purpose machines](https://docs.cloud.google.com/compute/docs/general-purpose-machines)

| Type | vCPU | Memory GB | Notes |
|---|---|---|---|
| e2-micro | 2 (0.25 fractional) | 1 | bursts about 30 s |
| e2-small | 2 (0.5 fractional) | 2 | bursts about 60 s |
| e2-medium | 2 (1 fractional) | 4 | bursts about 120 s |
| e2-standard-2/4/8/16/32 | 2–32 | 8/16/32/64/128 (4 GB per vCPU) | |
| e2-highmem-2/4/8/16 | 2–16 | 16/32/64/128 (8 GB per vCPU) | no e2-highmem-32 |
| e2-highcpu-2/4/8/16/32 | 2–32 | 2/4/8/16/32 (1 GB per vCPU) | |
| n2-standard-2..128 | 2,4,8,16,32,48,64,80,96,128 | 4 GB per vCPU (8…512) | |
| n2-highmem-2..128 | same sizes | 8 GB per vCPU, but n2-highmem-128 = 864 | |
| n2-highcpu-2..96 | up to 96 | 1 GB per vCPU | |
| n4-standard/highcpu/highmem | 2,4,8,16,32,48,64,80 | 4 / 2 / 8 GB per vCPU | Hyperdisk only |
| t2d-standard-1..60 | 1,2,4,8,16,32,48,60 | 4 GB per vCPU | |
| c4d-* | 2–384 | standard 7 GB at 2 vCPU … | "Supports only Hyperdisk volumes." |

- Disk support by series. E2: pd-balanced, pd-ssd, pd-standard, hyperdisk-balanced. N2: pd-standard, pd-balanced, pd-ssd, pd-extreme, hyperdisk-*. T2D: pd-standard, pd-balanced, pd-ssd, hyperdisk-throughput. N4: "N4 doesn't support Persistent Disk or Local SSD" (Hyperdisk Balanced/Throughput only, NVMe only). — [General-purpose machines](https://docs.cloud.google.com/compute/docs/general-purpose-machines)

**Custom machine types** — [Custom machine type](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)

| Series | vCPU range | Allowed counts | GB per vCPU | Extended memory |
|---|---|---|---|---|
| E2 | 2–32 | any multiple of 2 | 0.5–8 | No |
| E2 shared-core | 0.25 / 0.5 / 1 | micro/small/medium | (table garbled) | No |
| N1 | 1–96 | 1 or any multiple of 2 | 0.9–6.5 | Yes (624 GB) |
| N2 | 2–80 (table) | multiples of 2 up to 32, multiples of 4 from 32–80 | 0.5–8 | Yes |
| N2D | 2–96 | 2,4,8,16,32,48,64,80,96 | 0.5–8 | Yes (768 GB) |
| N4 | 2–80 | any multiple of 2 | 2–8 | Yes (640 GB) |
| N4D | 2–96 | 2,4,8,16,32,48,64,80,96 | 0.5–8 | Yes |

- Memory "must be a multiple of 256 MB" and is given in MB. Formats: `n2-custom-48-317440`. N1 starts with `custom-` (for example `custom-4-15360`). Extended memory appends `-ext`. Flag form: `--custom-cpu=48 --custom-memory=317440 --custom-extensions --custom-vm-type=n2`. E2 shared-core: `e2-custom-small-2304`. — [Custom machine type](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)
- Error strings from the doc's validation sample code (verbatim from the sample, not necessarily from the API): "Invalid number of cores requested.", "requested memory must be a multiple of 256 MB", "Requested memory is too low.", "Requested memory is too large.", "extra memory is available only for N1, N2 and N2D CPUs", "Incorrect CPU type". — [Custom machine type](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)
- Conflict inside the same doc: the table caps N2 at 80 vCPU and lists extended memory as 864 GB, but the sample code allows N2 up to 128 cores and caps extended memory at 624 GB. — [Custom machine type](https://docs.cloud.google.com/compute/docs/instances/creating-instance-with-custom-machine-type)

**Provisioning model and Spot**
- gcloud: `--provisioning-model=SPOT`. `--instance-termination-action` is optional: STOP or DELETE, with Stop as the Console default. `--preemption-notice-duration` is 0 s (default) or 120 s. In REST: `"provisioningModel": "SPOT"`. — [Create Spot VMs](https://docs.cloud.google.com/compute/docs/instances/create-use-spot)
- "If the termination action is set to `STOP` or not specified, then Compute Engine stops the VM." The shutdown period "is best effort and up to 30 seconds." Spot VMs have no minimum or maximum runtime unless you limit it. They "might not always be available" and are excluded from the SLA. — [Spot VMs](https://docs.cloud.google.com/compute/docs/instances/spot)

**Availability policy (host maintenance)**
- By default, most instances live migrate. Automatic restart is the default; a restart typically happens in about 3 minutes and can take up to 5.5 minutes. VMs with GPUs, bare metal, H4D, X4/X5, most Confidential VMs and TPUs can't live migrate. — [Host maintenance overview](https://docs.cloud.google.com/compute/docs/instances/host-maintenance-overview)
- Console labels: "On host maintenance" and "Automatic restart" ("On (recommended)" or "Off"). gcloud: `--restart-on-failure` / `--no-restart-on-failure`. API fields: `onHostMaintenance` and `automaticRestart`. "Spot VMs and preemptible VMs can't automatically restart after host errors or programmed stops." Instances that can't live migrate must be set to Terminate. Spot and preemptible VMs default to Terminate. — [Set VM host options](https://docs.cloud.google.com/compute/docs/instances/setting-vm-host-options)

**Boot disk**
- PD types: `pd-balanced`, `pd-ssd`, `pd-standard` (HDD) and `pd-extreme`. Volumes go up to 64 TiB. The default type is `pd-balanced` in the Console and `pd-standard` with gcloud or the API. "Small, 10 GiB Persistent Disk volumes can work for basic boot." — [Persistent Disk](https://docs.cloud.google.com/compute/docs/disks/persistent-disks)

**Service account and access scopes**
- The default SA is `PROJECT_NUMBER-compute@developer.gserviceaccount.com`. It is attached by default to VMs created with gcloud or the Console. Default scopes: `devstorage.read_only`, `logging.write`, `monitoring.write`, `service.management.readonly`, `servicecontrol`, `trace.append`. Google recommends setting the `cloud-platform` scope and controlling access with IAM. A restrictive scope (such as Storage read-only) blocks actions even when the SA has an admin role. — [Service accounts](https://docs.cloud.google.com/compute/docs/access/service-accounts)

**Network tags**
- "You can assign up to 64 different tags per VM". Each tag is up to 63 characters, using "lowercase letters, numbers, dashes". "Tags must start with a lowercase letter" and "must end with either a number or a lowercase letter." Set with `--tags` (comma-delimited). — [Network tags](https://docs.cloud.google.com/vpc/docs/add-remove-network-tags)

**Labels**
- "Each resource can have up to 64 labels." Keys are 1–63 characters "and cannot be empty". Values can be empty and are up to 63 characters. "Keys and values can contain only lowercase letters, numeric characters, underscores, and dashes." UTF-8 international characters are allowed. "Keys must start with a lowercase letter or international character." — [Labels](https://docs.cloud.google.com/compute/docs/labeling-resources)

### Inferences
- Simulator rule: when Provisioning model is Spot, force On host maintenance = TERMINATE and Automatic restart = Off, and show Termination action [Stop|Delete] with Stop as the default.
- Simulator rule: with an N4, C4 or C4D machine type, reject the pd-* disk types (Hyperdisk only).
- Simulator rule: custom N2 must have an even vCPU count up to 32, then multiples of 4. Memory must be a multiple of 256 MB, from 0.5 to 8 GB per vCPU.
- For external IPv4 (Ephemeral / static / None), Shielded VM (Secure Boot, vTPM, integrity monitoring), deletion protection and the metadata `startup-script` key, see Gaps.

### Gaps
- I did not fetch: the hard minimum boot disk size (the commonly cited 10 GB, and the "smaller than image size" error text), Shielded VM defaults, the deletion-protection error text ("resource is protected"), and the exact `--maintenance-policy=MIGRATE|TERMINATE` flag text (seen only as API field names). The `--network-tier`, `--no-address` and `--address` flags and their semantics were not verified.

---

## 3. Instance templates and managed instance groups (MIGs)

### Takeaway
MIG updates are either proactive (automatic) or opportunistic (selective). maxSurge and maxUnavailable both default to 1 for zonal MIGs and to the number of zones (3 by default) for regional MIGs. Regional fixed values must be 0 or at least the number of zones. The autoscaler's initialization ("cool-down") period defaults to 60 s, and the autohealing initial delay is 0–3600 s (Console default 300 s, gcloud/REST default 0).

### Cited Findings
**Autoscaling** — [Scaling on CPU](https://docs.cloud.google.com/compute/docs/autoscaler/scaling-cpu)
- The target is a fraction in gcloud/REST (`--target-cpu-utilization 0.60`, `"utilizationTarget": 0.6`) but a percentage in the Console. `--max-num-replicas` is required with `--target-cpu-utilization`. `--cool-down-period` sets the initialization period: "The default initialization period is 60 seconds." `--stabilization-period` ranges 0–3600 s and defaults to 600 s. Predictive autoscaling is optional ("Off" by default).

**Update policy** — [Rolling updates](https://docs.cloud.google.com/compute/docs/instance-groups/rolling-out-updates-to-managed-instance-groups)
- Types: "Automatic, or **proactive**" and opportunistic (selective).
- maxSurge: "For zonal MIGs, the default for `maxSurge` is `1`"; "For regional MIGs, the default is the number of zones associated with the group, by default `3`". It can be a fixed number, or a percentage for groups of 10 or more instances (rounded up).
- maxUnavailable: zonal default `1`; regional default is the number of zones (3).
- If both resolve to 0, "the Updater automatically sets `maxUnavailable=1`".
- Regional fixed value: "the fixed number must be either `0` or equal to or greater than the number of zones associated with the regional MIG". So with 3 zones, maxSurge 1 or 2 is invalid.
- Minimal action and most-disruptive action: `REFRESH`, `RESTART`, `REPLACE` (default REPLACE). Most-disruptive "can't be less disruptive than the minimal action."
- Replacement method: `SUBSTITUTE` (default) or `RECREATE`, which keeps instance names. "To use this mode, you must set `maxSurge` to `0`."
- gcloud: `gcloud compute instance-groups managed rolling-action start-update NAME --version=template=TEMPLATE [--max-surge=5|10%] [--max-unavailable=3] [--replacement-method=recreate] (--zone|--region)`.

**Autohealing** — [Autohealing](https://docs.cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs)
- Initial delay: Console default `300` s; for gcloud and REST "The default value is `0`". The value "must be between `0` and `3600` seconds." Flags: `--health-check URL --initial-delay N`. One autohealing policy per MIG, using a regional or global health check.
- Google advises: "Use separate health checks for load balancing and for autohealing". The autohealing check should be more conservative (for example healthy threshold 1, unhealthy threshold 3).
- Example firewall rule: `gcloud compute firewall-rules create allow-health-check --allow tcp:80 --source-ranges 130.211.0.0/22,35.191.0.0/16 --network default`.

### Inferences
- Simulator validation: for a regional MIG with N zones, reject fixed maxSurge or maxUnavailable values between 1 and N−1. Reject RECREATE when maxSurge > 0. Reject a most-disruptive action that is less disruptive than the minimal action.
- Simulator target-CPU rule: accept 0.01–1.0 in the CLI and 1–100% in the Console. The range itself was not documented on the fetched page (see Gaps).

### Gaps
- Not found: the exact allowed range and error text for `--target-cpu-utilization`, min/max replicas limits (for example the max of 1000 per zonal MIG), instance template global vs regional scope rules, and target size limits.

---

## 4. GKE (Autopilot vs Standard)

### Takeaway
A cluster name is at most 40 characters: lowercase letters, digits and hyphens, starting with a letter and ending with a letter or digit. Autopilot is regional only, always on a release channel (default Regular), and always has Workload Identity. In gcloud, Standard defaults to `--num-nodes=3`, `e2-medium` and a 100 GB pd-balanced disk. The autoscaling `--min-nodes` and `--max-nodes` values are **per zone**.

### Cited Findings
- Name: "may be no longer than 40 characters". — [gcloud container clusters create](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create). The API adds: lowercase letters, numbers and hyphens; first character a letter; last a letter or number; unique per project and location. — [Cluster API type](https://docs.cloud.google.com/python/docs/reference/container/latest/google.cloud.container_v1.types.Cluster)
- A name starting with a digit fails at create time with a generic "Invalid request". — [GitLab issue 22655](https://gitlab.com/gitlab-org/gitlab/-/work_items/22655)
- gcloud defaults and values — [gcloud container clusters create](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create):
  - `--num-nodes` defaults to 3. `--machine-type` "Defaults to e2-medium." `--disk-size` "Defaults to 100GB". `--disk-type` is one of pd-standard, pd-ssd, pd-balanced, hyperdisk-balanced, hyperdisk-extreme or hyperdisk-throughput, with pd-balanced the default from 1.24.
  - `--release-channel` takes `None`, `extended`, `rapid`, `regular` or `stable`.
  - `--location` takes a zone or region. `--region` makes a regional cluster and `--zone` a zonal one, and "At most one" may be given.
  - `--enable-autoscaling`, `--min-nodes` ("Minimum number of nodes per zone") and `--max-nodes` ("Maximum number of nodes per zone"). The node limits are "Ignored unless --enable-autoscaling is also specified."
  - `--enable-private-nodes` means "no public IP addresses on the cluster nodes". `--master-ipv4-cidr` "should have a netmask of size /28".
  - `--workload-pool=PROJECT_ID.svc.id.goog`: "the only accepted workload pool is the workload pool of the Cloud project containing the cluster."
  - Omitting the IP alias flags gives a VPC-native cluster. `--spot` creates Spot nodes.
- Release channels: Rapid, Regular (default), Stable and Extended. "No channel (deprecated)" is Standard-only, and new customers can't use it (removal planned June 14, 2027). "Autopilot clusters can only be enrolled in a release channel." Extended gives up to 24 months of support. — [Release channels](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/release-channels)
- Autopilot vs Standard — [Feature comparison](https://docs.cloud.google.com/kubernetes-engine/docs/resources/autopilot-standard-feature-comparison):
  - Autopilot location is regional and pre-configured; Standard can be zonal or regional.
  - Workload Identity Federation is pre-configured on Autopilot and optional on Standard.
  - Shielded nodes and Secure Boot are pre-configured on Autopilot. On Standard, Shielded nodes are the default and Secure Boot is optional.
  - Max pods per node: 256 on Autopilot; 512 on Standard (default 110).
  - Dataplane V2 is the default on Autopilot and optional on Standard.
  - Standard: "you pay for node capacity regardless of whether Pods use the resources".

### Inferences
- In a regional Standard cluster, `--num-nodes 3` across 3 zones gives 9 nodes, because the node flags are per zone. This is a classic exam trap. The per-zone wording is verified for min/max-nodes and inferred for num-nodes.
- Simulator name validator: `/^[a-z]([-a-z0-9]{0,38}[a-z0-9])?$/`.
- Simulator rule: Autopilot hides machine type, node count and node-pool fields, forces a region, and blocks "No channel".

### Gaps
- Not found: a verbatim gcloud error for an invalid cluster name or a wrong `--master-ipv4-cidr` size. Autopilot pricing wording was not on the comparison page.

---

## 5. Cloud Run services (and jobs)

### Takeaway
A service name is under 50 characters, starts with a letter and doesn't end with a hyphen. The CPU and memory pairing is the main validation rule:
- 0.08 vCPU: up to 512 MiB
- 0.5 vCPU: up to 1 GiB
- 1 vCPU: up to 4 GiB
- 2 vCPU: up to 8 GiB
- 4 vCPU: 2–16 GiB
- 6 vCPU: 4–24 GiB
- 8 vCPU: 4–32 GiB

Defaults are 1 vCPU, 512 MiB, concurrency 80 (max 1000), timeout 300 s (max 3600 s), max instances 100, request-based billing, and ingress `all`. CPU below 1 requires concurrency 1, request-based billing and gen1.

### Cited Findings
**Name**
- "Service names must be 49 characters or less and must be unique per region and project." "A service name cannot be changed later and is publicly visible." — [Deploying](https://docs.cloud.google.com/run/docs/deploying)
- API `serviceId`: "It must begin with letter, and cannot end with hyphen; must contain fewer than 50 characters." — [Admin API v2 services.create](https://docs.cloud.google.com/run/docs/reference/rest/v2/projects.locations.services/create)

**Console create form**
- Choose between "Deploy one revision from an existing container image" and "Continuously deploy new revisions from a source repository". Then set Service name, Region, Authentication ("Allow public access" / "Require authentication"), Billing, Service scaling (autoscaling min/max, or manual instance count) and Ingress. The Containers / Networking / Security tabs hold port, CPU, memory, timeout, concurrency, env vars, secrets, execution environment, HTTP/2, service account, Cloud SQL and VPC. — [Deploying](https://docs.cloud.google.com/run/docs/deploying)
- Image URL: `LOCATION-docker.pkg.dev/PROJECT_ID/REPO_NAME/PATH:TAG` or `@sha256:` digest. Public Docker Hub and ghcr.io images are supported. Other registries need an Artifact Registry remote repo. Layers above 9.9 GB are not supported from Docker Hub or remote repos. — [Deploying](https://docs.cloud.google.com/run/docs/deploying)

**CPU** — [CPU limits](https://docs.cloud.google.com/run/docs/configuring/services/cpu)
- Values are 1, 2, 4, 6 or 8; "Values greater than 1 must be integer values." Fractional values run from 0.08 to below 1, in increments of 0.01 (another section of the page says 0.001, so the page is inconsistent).
- "By default, each instance is limited to 1 vCPU."
- Below 1 vCPU: "Maximum concurrency must be set to 1", "The billing settings must be set to request-based billing", "You must use the first generation execution environment". "A minimum of 0.5 vCPU is needed to set a memory limit greater than 512MiB", and at least 1 vCPU for more than 1 GiB.
- Flags: `--cpu`, `--cpu-boost` / `--no-cpu-boost`. YAML: `resources.limits.cpu`.

**Memory** — [Memory limits](https://docs.cloud.google.com/run/docs/configuring/services/memory-limits)
- "By default, the memory allocated to each instance of a revision is 512 MiB". The maximum is `32 Gi`. The minimum is "128 MiB for first generation" and "512 MiB for second generation". Units are `G`, `M`, `Gi`, `Mi`. Flag: `--memory`.

| vCPU | Memory allowed |
|---|---|
| 0.08 | up to 512 MiB |
| 0.5 | up to 1 GiB |
| 1 | up to 4 GiB |
| 2 | up to 8 GiB |
| 4 | 2 to 16 GiB |
| 6 | 4 to 24 GiB |
| 8 | 4 to 32 GiB |

- **Verbatim error** (from a user report): "Invalid value specified for memory with cpu unthrottled. For 1.0 CPU, memory must be between 512Mi and 4Gi inclusive." The field was `spec.template.spec.containers[0].resources.limits.memory`. — [zenn.dev article](https://zenn.dev/uma002/articles/94d100b44230d8)

**Billing (CPU allocation)** — [Billing settings](https://docs.cloud.google.com/run/docs/configuring/billing-settings)
- Request-based billing is the default, formerly "CPU only allocated during request processing"; flag `--cpu-throttling`. Instance-based billing was formerly "CPU always allocated"; flag `--no-cpu-throttling`.
- Instance-based billing requires at least 512 MiB of memory. Health-check probes require instance-based billing. Jobs always use instance-based billing.

**Concurrency, timeout and scaling**
- Default concurrency is `80`. Use `--concurrency N` or `--concurrency default`. — [Concurrency](https://docs.cloud.google.com/run/docs/configuring/concurrency)
- The quotas page lists a maximum of 1,000 concurrent requests per instance. — [Quotas](https://docs.cloud.google.com/run/quotas)
- "The timeout is set by default to 5 minutes (300 seconds)" and it "can be extended up to 60 minutes (3600 seconds)". `--timeout` takes an integer (seconds) or a duration such as `1m20s`. Retries are recommended for timeouts over 15 minutes. — [Request timeout](https://docs.cloud.google.com/run/docs/configuring/request-timeout)
- "By default, Cloud Run revisions are configured to scale up to a maximum of 100 instances." `--max` sets the service-level maximum and `--max-instances` the revision-level maximum. If both are set, the lower one wins. — [Max instances](https://docs.cloud.google.com/run/docs/configuring/max-instances)

**Ingress and authentication**
- Values are `all` (the least restrictive, which "Allows all requests, including requests directly from the internet to the `run.app` URL"), `internal`, and `internal-and-cloud-load-balancing`. The default setting allows any resource on the internet. "Internal" covers: internal ALB, VPC Service Controls perimeter, same-project VPC (even with an external IP), Shared VPC, VPN/Interconnect, and Scheduler / Tasks / Eventarc / Pub/Sub / Workflows / BigQuery in the same project or perimeter. — [Ingress](https://docs.cloud.google.com/run/docs/securing/ingress)
- gcloud flags — [gcloud run deploy](https://docs.cloud.google.com/sdk/gcloud/reference/run/deploy):
  - `--port`: "Must be a number between 1 and 65535, inclusive"; also sets `$PORT`.
  - `--allow-unauthenticated` / `--no-allow-unauthenticated`.
  - `--execution-environment gen1|gen2`.
  - `--vpc-connector`, or Direct VPC egress with `--network` / `--subnet` (the subnet "must be /26 or larger").
  - `--vpc-egress all-traffic|private-ranges-only`, where private-ranges-only is the "Default option".
  - `--add-cloudsql-instances` uses `project:region:instance` for other projects or regions.
  - `--set-env-vars` replaces all existing env vars.
  - `--set-secrets` takes `NAME=SECRET:VERSION`; keys starting with `/` are mount paths.
  - `--min-instances` / `--max-instances` accept `default` to clear.

**Limits** — [Quotas](https://docs.cloud.google.com/run/quotas)
- Per project and region: 1,000 services, 1,000 jobs, 4,000 revisions serving traffic.
- Per container: 8 vCPU / 32 GiB max, 4-minute startup timeout, 1,000 env vars (32 KB each).
- Requests: 60-minute max request time; 32 MiB HTTP/1 request and response size (no limit on HTTP/2); 100 streams per HTTP/2 connection.

**Jobs**
- Task timeout defaults to 10 minutes; the maximum is 168 hours (7 days), or 1 hour with GPUs. Flag: `--task-timeout`. — [Task timeout](https://docs.cloud.google.com/run/docs/configuring/task-timeout)
- Up to 10,000 tasks per execution and 10 task retries. Parallelism depends on region, CPU and memory. — [Quotas](https://docs.cloud.google.com/run/quotas)
- Jobs: "you must specify a minimum of 512Mi". 1 vCPU allows 128 MiB to 4 GiB. — [Jobs memory limits (search snippet)](https://docs.cloud.google.com/run/docs/configuring/jobs/memory-limits)

### Inferences
- Correction to the brief's assumption ("more than 16Gi needs 8 CPU"). Per the table, more than 16 GiB needs at least 6 vCPU and more than 24 GiB needs 8. 4 vCPU also has a 2 GiB minimum, and 6 or 8 vCPU a 4 GiB minimum.
- Suggested simulator messages (reconstructed, modeled on the verbatim one): "Invalid value specified for memory. For 2.0 CPU, memory must be between 128Mi and 8Gi inclusive." and "Invalid value specified for container concurrency. For CPU < 1, concurrency must be 1." Only the first verbatim pattern is confirmed. The exact lower bounds in other messages are not.
- In the Console, "Allow public access" grants `allUsers` the `roles/run.invoker` role. That role name is from training knowledge and was not fetched this session.
- The default container port is 8080 (training knowledge, see Gaps).

### Gaps
- Not verified this session: the default container port 8080 (the gcloud page gave only the 1–65535 range), the min-instances default (0), the execution environment default, the max allowed max-instances value (a separate "max instances limits" page), and the job defaults `--max-retries` 3, `--tasks` 1 and `--parallelism`.

---

## 6. Cloud Run functions (formerly Cloud Functions 2nd gen)

### Takeaway
New functions default to 256 MB memory and a 60 s timeout. The maximum timeout is 3600 s for HTTP and 540 s (9 min) for event-driven functions. Instances go up to 16 GiB and 4 vCPU with up to 1000 concurrency. The Eventarc trigger location must match the bucket's region, dual-region or multi-region; the function itself may live elsewhere.

### Cited Findings
- Naming: "Cloud Run functions" was formerly Cloud Functions (2nd gen), and "Cloud Run functions (1st gen)" was formerly Cloud Functions (1st gen). — [Comparison](https://docs.cloud.google.com/run/docs/functions/comparison)
- Limits (current gen vs 1st gen) — [Comparison](https://docs.cloud.google.com/run/docs/functions/comparison):
  - Timeout: "Up to 60 minutes for HTTP-triggered functions" and "Up to 9 minutes for event-driven functions". 1st gen allows up to 9 minutes for both.
  - Size: "Up to 16 GiB RAM with 4 vCPU" (1st gen: 8 GB / 2 vCPU).
  - Concurrency: "Up to 1000 concurrent requests per function instance" (1st gen: 1).
  - Triggers: any Eventarc event type.
- `gcloud functions deploy` — [gcloud functions deploy](https://docs.cloud.google.com/sdk/gcloud/reference/functions/deploy):
  - `--runtime` is required for new functions; list values with `gcloud functions runtimes list`.
  - `--entry-point` defaults to the function ID.
  - Triggers: `--trigger-http`, `--trigger-topic` (topic ID only, not the `projects/…/topics/…` format), `--trigger-bucket` (fires on create or overwrite), `--trigger-event-filters` (must include `type`), and `--trigger-location`.
  - `--memory` defaults to 256MB. 1st gen allows 128MB, 256MB, 512MB, 1024MB, 2048MB, 4096MB or 8192MB. 2nd gen takes a number plus k/M/G/Ki/Mi/Gi.
  - `--cpu` requires `--memory`.
  - `--timeout` defaults to 60 s; the max is 540 s (1st gen) or 3600 s (2nd gen).
  - `--min-instances` defaults to 0.
  - Generation: `--gen2` / `--no-gen2`.
- Runtime IDs (page updated 2026-10-13) — [Function runtimes](https://docs.cloud.google.com/run/docs/runtimes/function-runtimes):
  - Node.js: nodejs26 (Preview), nodejs24, nodejs22, nodejs20 (decommissioned 2026-10-30)
  - Python: python314, python313, python312, python311, python310
  - Go: go127, go126, go125, go124
  - Java: java25, java21, java17
  - Ruby: ruby40, ruby34, ruby33, ruby32
  - PHP: php85, php84, php83, php82
  - .NET: dotnet10, dotnet8
  - OS only: osonly24
  - Older runtimes (nodejs18, go121–123, java11 and others) are deprecated or decommissioned.
- Storage trigger location: "The Cloud Storage bucket must reside in the same Google Cloud project and region or multi-region as the Eventarc trigger". Single-region, dual-region (for example `nam4` = US-CENTRAL1 + US-EAST1, `eur4` = EUROPE-NORTH1 + EUROPE-WEST4) and multi-region are supported, but a global trigger is not. The receiving service can be in any Cloud Run location. — [Storage triggers](https://docs.cloud.google.com/functions/docs/calling/storage); [Eventarc locations](https://docs.cloud.google.com/eventarc/docs/locations); [Route Cloud Storage events](https://docs.cloud.google.com/eventarc/standard/docs/run/route-trigger-cloud-storage) (from search summaries)

### Inferences
- Simulator rule: reject a Storage trigger when the trigger location ≠ the bucket location. Offer the event types finalized / deleted / archived / metadataUpdated (`google.cloud.storage.object.v1.*`, training knowledge).
- Simulator rule: for event-driven functions, cap the timeout at 540 s; for HTTP functions, cap it at 3600 s.

### Gaps
- Not fetched: the exact Eventarc Storage event type strings and the Firestore trigger fields. The function name rules (the commonly cited 63 characters) were not on the gcloud page.

---

## 7. App Engine (standard vs flexible)

### Takeaway
The app's region is permanent: "You cannot change an app's region after you set it." Standard instance classes are F1–F4_1G (automatic scaling, default F1) and B1–B8 (basic/manual scaling, default B2).

### Cited Findings
- "You cannot change an app's region after you set it." App Engine uses `us-central` and `europe-west`, which are called `us-central1` and `europe-west1` elsewhere. — [App Engine locations](https://docs.cloud.google.com/appengine/docs/standard/locations)
- Instance classes — [App Engine standard](https://docs.cloud.google.com/appengine/docs/standard):

| Class | Memory | CPU | Scaling |
|---|---|---|---|
| F1 (default) | 384 MB | 600 MHz | automatic |
| F2 | 768 MB | 1.2 GHz | automatic |
| F4 | 1536 MB | 2.4 GHz | automatic |
| F4_1G | 3072 MB | 2.4 GHz | automatic |
| B1 | 384 MB | 600 MHz | manual, basic |
| B2 (default) | 768 MB | 1.2 GHz | manual, basic |
| B4 | 1536 MB | 2.4 GHz | manual, basic |
| B4_1G | 3072 MB | 2.4 GHz | manual, basic |
| B8 | 3072 MB | 4.8 GHz | manual, basic |

### Inferences
- Simulator rule: reject an F class with basic or manual scaling, and a B class with automatic scaling. Lock the region after `gcloud app create --region`.

### Gaps
- Not fetched: the app.yaml key list (`runtime`, `instance_class`, `automatic_scaling`, `basic_scaling`, `manual_scaling`, `env: flex`, `handlers`, `entrypoint`), the flexible resource settings, and "one App Engine app per project" (not stated on the fetched page).

---

## 8. Networking (VPC, subnets, firewall rules, Cloud Router, Cloud NAT, peering, DNS)

### Takeaway
- VPC: auto mode (/20 per region from 10.128.0.0/9) or custom mode. Auto-to-custom conversion is one-way. MTU is 1300–8896 (default 1460). Dynamic routing is REGIONAL (default) or GLOBAL.
- Subnets: ranges from /29 (min) up to a recommended /8; primary ranges can only be expanded, and 4 addresses are reserved.
- Firewall rules: priority 0–65535 (default 1000), with implied allow-egress and deny-ingress.
- Cloud Router: needs a private ASN (64512–65534 or 4200000000–4294967294), or 16550 for Partner Interconnect.
- Cloud NAT: minimum ports per VM default 64 (static) or 32 (dynamic); each IP has 64,512 ports.
- Peering: non-transitive, with no overlapping ranges.

### Cited Findings
**VPC network**
- Auto mode creates one subnet per region within 10.128.0.0/9. Custom mode creates none. "This is a one-way conversion; custom mode VPC networks cannot be changed to auto mode VPC networks." The default network is auto mode with pre-populated IPv4 firewall rules. — [VPC](https://docs.cloud.google.com/vpc/docs/vpc)
- "You can set a VPC network's MTU to any value between 1,300 bytes and 8,896 bytes (inclusive)". The default is 1,460, and 1,500 and 8,896 are common. The MTU can be changed later, but VMs must be stopped first. — [MTU](https://docs.cloud.google.com/vpc/docs/mtu)
- Dynamic routing mode is REGIONAL (default) or GLOBAL, with flag `--bgp-routing-mode`. It can be set at creation or updated. Best path selection is legacy (default) or standard. — [Routing modes](https://docs.cloud.google.com/network-connectivity/docs/router/how-to/configuring-routing-mode)

**Subnets** — [Subnets](https://docs.cloud.google.com/vpc/docs/subnets)
- Valid IPv4 ranges:
  - RFC 1918: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16
  - RFC 6598: 100.64.0.0/10
  - 192.0.0.0/24
  - Documentation ranges: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
  - 192.88.99.0/24 and 198.18.0.0/15
  - Class E: 240.0.0.0/4
  - Privately used public IPs
- Prohibited ranges: Google public ranges, 199.36.153.4/30, 199.36.153.8/30, 0.0.0.0/8, 127.0.0.0/8, 169.254.0.0/16, 224.0.0.0/4 and 255.255.255.255/32.
- Size: "The minimum primary or secondary range size is eight IPv4 addresses" (/29). The shortest mask is /4, but /8 is the recommended maximum.
- "the primary IPv4 range for the subnet can be expanded but not replaced or shrunk". A secondary range can be removed only when unused.
- Reserved addresses: the network address, the gateway (.1), second-to-last and broadcast. Secondary ranges have no reserved addresses.
- Names are unique per region in a project. A subnet can't be renamed or moved to another region.
- Purposes: PRIVATE ("None"), PRIVATE_SERVICE_CONNECT, GLOBAL_MANAGED_PROXY / REGIONAL_MANAGED_PROXY (proxy-only), PRIVATE_NAT and PEER_MIGRATION.
- Stack types: IPv4-only, dual-stack and IPv6-only. IPv6 requires custom mode.
- Each VPC needs unique, non-overlapping primary and secondary ranges, and each primary range has 4 unusable addresses. Two auto mode networks can't be peered or connected by VPN. — [VPC](https://docs.cloud.google.com/vpc/docs/vpc)

**Firewall rules** — [VPC firewall rules](https://docs.cloud.google.com/vpc/docs/firewalls)
- Direction: ingress (default) or egress.
- Priority: 0–65535, default 1000; lower numbers win. At equal priority, deny wins over allow.
- Action: `allow` or `deny`. Enforcement: enabled (default) or disabled.
- Targets: all instances (default), target tags, or target service accounts.
- Filters: source ranges, tags or service accounts. The default source is 0.0.0.0/0 for ingress and the default destination is 0.0.0.0/0 for egress.
- Protocols: tcp, udp, icmp, esp, ah, sctp, ipip, or an IANA number. Ports apply only to tcp and udp, for example `tcp:80`, `tcp:20-22` or `icmp,tcp:80`. A bare number is read as a protocol number.
- Implied rules: allow all egress and deny all ingress.
- Default network rules (ingress, priority **65534**):
  - `default-allow-internal`: 10.128.0.0/9, tcp/udp 0-65535 and icmp
  - `default-allow-ssh`: 0.0.0.0/0, tcp:22
  - `default-allow-rdp`: 0.0.0.0/0, tcp:3389
  - `default-allow-icmp`: 0.0.0.0/0, icmp
- Egress to TCP 25 on external IPs is blocked. Metadata server traffic (169.254.169.254) is always allowed.
- Mixing rules: target service accounts can't be combined with target tags. With target tags, source service accounts are invalid. With target service accounts, source tags are invalid.

**Cloud Router** — [Create Cloud Router](https://docs.cloud.google.com/network-connectivity/docs/router/how-to/create-router-vpc-network)
- "Any private ASN (64512-65534, 4200000000-4294967294) that you aren't already using in the on-premises network." "Cloud Router requires that you use a private ASN, but your on-premises ASN can be public or private." For Partner Interconnect, "you must specify the Google-owned public ASN `16550`".
- `--asn` is required. `--advertisement-mode` is DEFAULT (when omitted) or CUSTOM. `--keepalive-interval` takes 20–60 s, default 20.

**Cloud NAT** — [NAT ports and addresses](https://docs.cloud.google.com/nat/docs/ports-and-addresses)
- Minimum ports per VM default: "`64` for static port allocation and `32` for dynamic port allocation". Public NAT uses static allocation by default. Private NAT uses dynamic allocation by default.
- IP allocation is automatic or manual. With manual allocation, packets drop when the IPs run out.
- Each NAT IP provides 64,512 TCP and 64,512 UDP ports. One IP supports 1,008 VMs at 64 ports each.
- Ports 0–1023 are not used. Endpoint-independent mapping requires static allocation.

**VPC Network Peering** — [VPC Peering](https://docs.cloud.google.com/vpc/docs/vpc-peering)
- "VPC Network Peering does not provide transitive routing."
- "No subnet IP range can exactly match, contain, or fit within another subnet IP range in a peered VPC network."
- Custom routes are exchanged only with `--export-custom-routes` / `--import-custom-routes`. Firewall rules aren't exchanged. Tags and service accounts can't be referenced across a peering. Internal DNS names aren't resolvable across a peering.
- Two auto mode networks can't peer.

**Cloud DNS** — [Managed zones](https://docs.cloud.google.com/dns/docs/zones)
- `gcloud dns managed-zones create NAME --dns-name --description --visibility=public|private [--networks=…] [--labels]`.
- For private zones, "Only the VPC networks that you select are authorized to query records in the zone." DNSSEC can be Off, On or Transfer.
- The Terraform examples use a trailing dot (`private.example.com.`).
- Zone types: public, private, forwarding, peering, reverse lookup, Service Directory and cross-project binding.

### Inferences
- Simulator subnet validator, in order:
  1. Parse the CIDR.
  2. Require a prefix of /8 to /29 (practically).
  3. Reject the prohibited ranges.
  4. Reject overlaps within the VPC and with peered VPCs.
  5. On edit, allow only a shorter prefix that contains the old range.
  6. Show usable hosts as 2^(32−prefix) − 4.
- Firewall port-syntax validator: `^(all|tcp|udp|icmp|esp|ah|sctp|ipip|\d{1,3})(:\d{1,5}(-\d{1,5})?(,\d{1,5}(-\d{1,5})?)*)?$`. Ports are only allowed on tcp, udp (and sctp, per training knowledge).
- Cloud Router ASN validator: 64512 ≤ asn ≤ 65534, or 4200000000 ≤ asn ≤ 4294967294, or asn = 16550 (Partner Interconnect).

### Gaps
- Not found: the verbatim errors for an overlapping subnet ("…conflicts with…") or an invalid range, and the per-network secondary range limit (the doc points to quotas). The allowed range for Cloud NAT min ports per VM wasn't stated. Static address regional vs global rules and internal address reservation weren't fetched, and the managed zone name rules weren't stated.

---

## 9. Load balancing

### Takeaway
The current family has three groups:
- Application LB (L7 proxy): global external, regional external, classic, regional internal, cross-region internal.
- Proxy Network LB (L4 TCP proxy): global/regional external, classic, regional/cross-region internal.
- Passthrough Network LB: regional external, global external (Preview), internal.

Health-check probes come from 35.191.0.0/16, plus 130.211.0.0/22 for the GFE-based LBs. Serverless NEGs don't support health checks.

### Cited Findings
- Product table — [Choosing a load balancer](https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer):

| Product | Deployment modes | Scheme | Tier |
|---|---|---|---|
| Application LB | Global external | EXTERNAL_MANAGED | Premium |
| | Regional external | EXTERNAL_MANAGED | Premium or Standard |
| | Classic | EXTERNAL | Premium or Standard |
| | Regional internal | INTERNAL_MANAGED | Premium |
| | Cross-region internal | INTERNAL_MANAGED | Premium |
| Proxy Network LB | Same five modes, TCP; SSL offload only on external global/classic | as above | as above |
| Passthrough Network LB | Global external (Preview) | EXTERNAL_PASSTHROUGH | Premium |
| | Regional external | EXTERNAL | Premium or Standard |
| | Internal | INTERNAL | Premium |

- "Passthrough load balancers don't terminate client connections." Only external LBs can be global; internal LBs reach multiple regions only through the cross-region option. Pick passthrough for UDP/ESP/ICMP or to keep the client IP. — [Choosing a load balancer](https://docs.cloud.google.com/load-balancing/docs/choosing-load-balancer)
- Health checks — [Health check concepts](https://docs.cloud.google.com/load-balancing/docs/health-check-concepts):
  - Defaults: interval 5 s, timeout 5 s, healthy threshold 2, unhealthy threshold 2.
  - Protocols: gRPC, gRPC with TLS, TCP, SSL, HTTP, HTTPS, HTTP/2. Legacy HTTP/HTTPS health checks are for target pools.
  - "Serverless NEGs and Private Service Connect NEGs do not support health checks". Global internet NEGs don't support health checks on GFE-based LBs.
- Firewall needs per LB type — [LB firewall rules](https://docs.cloud.google.com/load-balancing/docs/firewall-rules):
  - Global external and classic ALB: the health check range 35.191.0.0/16, plus the GFE proxy ranges **35.191.0.0/16 and 130.211.0.0/22**.
  - Regional external and internal ALB, and Envoy-based proxy NLBs: 35.191.0.0/16 plus the **proxy-only subnet**.
  - Internal passthrough NLB: 35.191.0.0/16 plus the client ranges.
  - Regional external passthrough NLB: 35.191.0.0/16, 209.85.152.0/22 (target pools) and 209.85.204.0/22.
  - Global external passthrough NLB: 136.124.104.0/22 and 136.124.108.0/22.
- Conflicting sources on 130.211.0.0/22: the health-check-concepts page lists only 35.191.0.0/16 as the probe source for GFE LBs, but the autohealing page still says probes come from both 130.211.0.0/22 and 35.191.0.0/16. — [Health check concepts](https://docs.cloud.google.com/load-balancing/docs/health-check-concepts); contradicted by [Autohealing](https://docs.cloud.google.com/compute/docs/instance-groups/autohealing-instances-in-migs)

### Inferences
- Simulator rule: when a MIG or zonal NEG backend sits behind a global ALB, require an ingress allow rule from both 35.191.0.0/16 and 130.211.0.0/22 on the serving port. Exam answers still expect both ranges, and the firewall-rules page requires them as GFE proxy ranges.
- Simulator rule: a serverless NEG (Cloud Run, functions or App Engine) needs no health check and no firewall rule. Block attaching a health check to it.
- Simulator rule: regional or internal Envoy-based LBs require a proxy-only subnet (purpose REGIONAL_MANAGED_PROXY) in the region.
- Component chain for the canvas: forwarding rule → target HTTP(S) proxy (plus SSL cert) → URL map → backend service (plus Cloud CDN and Cloud Armor policy) or backend bucket → backends (MIG, zonal NEG, serverless NEG, internet NEG). That Cloud CDN and Cloud Armor attach at the backend service, and that Google-managed certs need DNS pointing at the LB, comes from training knowledge and was not verified this session.

### Gaps
- Not fetched: the serverless NEG docs, the Google-managed SSL certificate provisioning rules (domains per cert, PROVISIONING / FAILED_NOT_VISIBLE states), Cloud Armor and CDN attachment points, and backend service balancing modes (UTILIZATION / RATE / CONNECTION, with max-utilization default 0.8).
