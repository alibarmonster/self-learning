/**
 * The Associate Cloud Engineer exam guide, explained consideration by
 * consideration. Follows the structure of Google's current guide (four
 * sections, twelve subsections); the headings are paraphrased, never copied,
 * and each one opens to what it means, how it is done, how the exam asks it,
 * and where the app goes deeper. Checked against the guide and the product
 * docs in October 2026.
 */
import type { GuideItem, Lesson } from '@/types';

const GUIDE = 'https://services.google.com/fh/files/misc/associate_cloud_engineer_exam_guide_english.pdf';

const L = {
  gke: { label: 'GKE deep dive', href: '#/ace/learn/gke' },
  vpc: { label: 'VPC & firewall deep dive', href: '#/ace/learn/vpc' },
  run: { label: 'Cloud Run deep dive', href: '#/ace/learn/cloud-run' },
  lb: { label: 'Load balancing deep dive', href: '#/ace/learn/load-balancing' },
  sheet: { label: 'Cheat sheet', href: '#/ace/cheatsheet' },
  cmdStart: { label: 'Command quiz: getting started', href: '#/ace/lab/cmd/start' },
  cmdAuth: { label: 'Command quiz: credentials, projects and IAM', href: '#/ace/lab/cmd/auth' },
  cmdCompute: { label: 'Command quiz: Compute Engine', href: '#/ace/lab/cmd/compute' },
  cmdNet: { label: 'Command quiz: VPC and firewalls', href: '#/ace/lab/cmd/network' },
  cmdLb: { label: 'Command quiz: DNS and load balancing', href: '#/ace/lab/cmd/lb' },
  cmdGke: { label: 'Command quiz: GKE', href: '#/ace/lab/cmd/gke' },
  cmdServerless: { label: 'Command quiz: serverless', href: '#/ace/lab/cmd/serverless' },
  cmdMsg: { label: 'Command quiz: Pub/Sub, logging, Scheduler', href: '#/ace/lab/cmd/messaging' },
  cmdOps: { label: 'Command quiz: Cloud SQL, security, build', href: '#/ace/lab/cmd/ops' },
  cmdStorage: { label: 'Command quiz: Cloud Storage', href: '#/ace/lab/cmd/storage' },
  cmdBq: { label: 'Command quiz: BigQuery', href: '#/ace/lab/cmd/bq' },
  cmdBuild: { label: 'Command quiz: Terraform and Docker', href: '#/ace/lab/cmd/build' },
  termIam: { label: 'Terminal: least-privilege service account', href: '#/ace/lab/terminal/iam-sa' },
  termMig: { label: 'Terminal: template + MIG autoscaling', href: '#/ace/lab/terminal/mig-autoscale' },
  termBq: { label: 'Terminal: BigQuery load and query', href: '#/ace/lab/terminal/bq-sales' },
  canvasLogs: { label: 'Canvas: audit logs to BigQuery', href: '#/ace/lab/canvas/log-audit' },
  canvasEvents: { label: 'Canvas: upload → function → BigQuery', href: '#/ace/lab/canvas/event-pipeline' },
  canvasCicd: { label: 'Canvas: CI/CD to Cloud Run', href: '#/ace/lab/canvas/cicd' }
};

// ── Section 1 ──────────────────────────────────────────────────────────────

const S11: GuideItem[] = [
  {
    topic: 'Build the resource hierarchy: organization, folders, projects',
    what: 'Everything in Google Cloud sits in a tree. The **organization** is the root (one per company), **folders** group projects by department or environment, and **projects** hold the actual resources and are the unit for APIs, billing, quotas and most IAM. Policies set high in the tree are inherited by everything below.',
    how: ['gcloud resource-manager folders create --display-name=prod --organization=123456789012', 'gcloud projects create shop-prod-4821 --folder=987654321098 --name="Shop prod"', 'gcloud projects move shop-dev-4821 --folder=555444333222'],
    exam: 'A project ID is globally unique and can never be changed; the display name can. Granting a role on a folder covers every project in it.',
    see: [L.cmdStart]
  },
  {
    topic: 'Apply organization policies to the hierarchy',
    what: 'An **organization policy** limits **what** can be configured, whoever does it — unlike IAM, which decides **who** may act. Constraints such as "no external IPs on VMs", "no service account keys", "resources only in these regions" or "only identities from our domain" are set on the organization, a folder or a project and inherited downward.',
    how: ['gcloud org-policies set-policy no-external-ip.yaml', '# no-external-ip.yaml', '#   name: organizations/123456789012/policies/compute.vmExternalIpAccess', '#   spec: { rules: [ { denyAll: true } ] }'],
    exam: '"Prevent anyone in the company from …" (creating external IPs, using regions outside the EU, creating keys) → an organization policy constraint, not an IAM role.'
  },
  {
    topic: 'Grant IAM roles inside a project',
    what: 'Access is a **binding**: a principal (user, group, service account) gets a role on a resource. Prefer **groups** over individual users, and **predefined** roles over the broad basic roles (Owner, Editor, Viewer).',
    how: ['gcloud projects add-iam-policy-binding shop-prod-4821 --member=group:web-devs@example.com --role=roles/compute.instanceAdmin.v1', 'gcloud projects get-iam-policy shop-prod-4821 --flatten="bindings[].members" --format="table(bindings.role, bindings.members)"'],
    exam: 'Answers that hand out Owner or Editor are almost always wrong. Look for the narrowest predefined role, granted to a group.',
    see: [L.cmdAuth]
  },
  {
    topic: 'Manage users and groups in Cloud Identity, by hand and automatically',
    what: '**Cloud Identity** (or Google Workspace) is where Google accounts and groups for your domain live. Small teams add them by hand in the Admin console. Larger ones automate: **Google Cloud Directory Sync** copies users and groups from Active Directory or LDAP, an identity provider can provision them with **SCIM**, and **SAML SSO** lets people sign in with the existing company password.',
    exam: '"Users and groups are managed in on-premises Active Directory" → Google Cloud Directory Sync (plus SSO). "Do not want to copy identities at all" → Workforce Identity Federation (below).'
  },
  {
    topic: 'Turn on the APIs a project needs',
    what: 'Every service has an API that must be **enabled** in a project before anything can use it — through the Console, Terraform, or gcloud. Calls to a disabled API fail with "API has not been used in project … before or it is disabled".',
    how: ['gcloud services enable compute.googleapis.com container.googleapis.com run.googleapis.com', 'gcloud services list --enabled'],
    exam: 'If a question\'s first step is about a brand-new project, enabling the API is often it.',
    see: [L.cmdStart]
  },
  {
    topic: 'Set up Google Cloud Observability products',
    what: '**Google Cloud Observability** is the family of Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler and Error Reporting. Setting it up means deciding where data goes: a **metrics scope** lets one project see the metrics of many, log buckets and sinks decide where logs land, and the **Ops Agent** collects VM logs and metrics.',
    exam: '"View metrics from several projects in one place" → add them to the metrics scope of one scoping project.'
  },
  {
    topic: 'Check quotas and ask for more',
    what: '**Quotas** cap how much of a resource a project can use — CPUs per region, external IPs, GPUs, API calls per minute. When a create fails with "Quota … exceeded", you request an increase (Console → IAM & Admin → Quotas, or the Cloud Quotas API). Some quotas grow automatically with usage history.',
    how: ['gcloud compute regions describe us-central1 --flatten=quotas --format="table(quotas.metric, quotas.limit, quotas.usage)"', 'gcloud compute project-info describe --flatten=quotas --format="table(quotas.metric, quotas.limit, quotas.usage)"'],
    exam: '"Could not create VMs: quota CPUS exceeded in region" → request a quota increase; it is not an IAM problem.'
  },
  {
    topic: 'Set up a standalone organization',
    what: 'A **standalone organization** is an organization resource created for you when you sign up for Google Cloud with a Google account — no Cloud Identity, no Google Workspace and no domain verification needed. You become its Organization Owner, can add other owners (federated identities included) and change them later. The alternative, a Cloud Identity or Workspace organization, is tied to a verified domain.',
    exam: 'Know that an organization resource is what unlocks folders, organization policies and org-wide IAM — and that you no longer need a domain to get one.'
  },
  {
    topic: 'Lay down the first network',
    what: 'Part of setting up an environment is deciding the network before workloads arrive: a **custom mode VPC** with planned, non-overlapping ranges instead of the default network, subnets in the regions you use, baseline firewall rules, Cloud NAT for private VMs, and usually **Shared VPC** so one team runs the network for many projects.',
    how: ['gcloud compute networks create prod-vpc --subnet-mode=custom', 'gcloud compute networks subnets create web-us --network=prod-vpc --region=us-central1 --range=10.10.0.0/24'],
    exam: 'An organization policy (`compute.skipDefaultNetworkCreation`) stops new projects getting the default network.',
    see: [L.vpc]
  },
  {
    topic: 'Check that a product is offered where you need it',
    what: 'Not every product, machine family, GPU or TPU is available in every region or zone. Before you choose a location — especially for data residency — check that what you need is there.',
    how: ['gcloud compute machine-types list --filter="zone:asia-southeast2-a AND name~^c3"', 'gcloud compute accelerator-types list --filter="zone:us-central1-a"'],
    exam: '"Data must stay in a country" → pick a region there, then confirm each product is offered in it.'
  },
  {
    topic: 'Use Cloud Asset Inventory, and ask Gemini Cloud Assist about resources',
    what: '**Cloud Asset Inventory** is a searchable, historical list of every resource and IAM policy across a project, folder or organization. You can search it, export it to BigQuery, or get a feed of changes to Pub/Sub. **Gemini Cloud Assist** is the AI assistant in the Console: ask it in plain language which VMs have external IPs, why a deployment failed, or how to configure something.',
    how: ['gcloud asset search-all-resources --scope=organizations/123456789012 --query="state:RUNNING" --asset-types=compute.googleapis.com/Instance', 'gcloud asset search-all-iam-policies --scope=organizations/123456789012 --query="policy:roles/owner"'],
    exam: '"Find every resource / everyone with Owner across the organization" → Cloud Asset Inventory.'
  },
  {
    topic: 'Configure Workforce Identity Federation',
    what: '**Workforce Identity Federation** lets your staff use Google Cloud (Console, gcloud, APIs) signing in with an external identity provider — Microsoft Entra ID, Okta, any OIDC or SAML IdP — without creating or syncing Google accounts. You create a **workforce pool** at the organization with a **provider**, then grant IAM roles to its principals.',
    how: ['gcloud iam workforce-pools create staff --organization=123456789012 --location=global', '# then a provider (OIDC or SAML), and roles granted to principalSet://iam.googleapis.com/locations/global/workforcePools/staff/group/cloud-admins'],
    exam: 'Do not mix it up with **Workload** Identity Federation (section 4.2), which is for software, not people.'
  }
];

const S12: GuideItem[] = [
  {
    topic: 'Create billing accounts',
    what: 'A **Cloud Billing account** pays for one or more projects: self-serve (card or bank account) or invoiced. Creating one needs `roles/billing.creator` on the organization; managing it needs `roles/billing.admin`.',
    how: ['gcloud billing accounts list'],
    exam: 'Keep the billing roles straight: Billing Account Administrator manages the account, Billing Account User may link projects to it, Billing Account Viewer only reads.'
  },
  {
    topic: 'Link projects to a billing account',
    what: 'A project with no billing account cannot use paid services, and unlinking stops them. Linking needs permission on both sides: `roles/billing.user` on the billing account and owner (or `roles/billing.projectManager`) on the project.',
    how: ['gcloud billing projects link shop-prod-4821 --billing-account=0X0X0X-0X0X0X-0X0X0X', 'gcloud billing projects describe shop-prod-4821'],
    exam: '"A developer can create projects but cannot attach billing" → give them Billing Account User on the billing account.'
  },
  {
    topic: 'Set budgets and budget alerts',
    what: 'A **budget** watches spend on a billing account (optionally per project, service or label) and alerts at thresholds — for example 50%, 90% and 100%, of actual or forecast spend. A budget **does not stop spending** by itself; to react automatically, send budget notifications to Pub/Sub and let a function act on them.',
    how: ['gcloud billing budgets create --billing-account=0X0X0X-0X0X0X-0X0X0X --display-name="shop monthly" --budget-amount=500USD --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0'],
    exam: '"Be told before spending goes over" → a budget with alert thresholds. "Automatically stop" → budget + Pub/Sub + a function that disables billing or shuts resources down.'
  },
  {
    topic: 'Export billing data',
    what: '**Billing export to BigQuery** writes detailed usage and cost data (and pricing data) into a dataset, so you can query spend by project, service, SKU or label and build dashboards in Looker Studio. Turn it on early: it only contains data from the day it is enabled.',
    exam: '"Analyse costs by team / label over time" → billing export to BigQuery, then query or chart it.'
  }
];

// ── Section 2 ──────────────────────────────────────────────────────────────

const S21: GuideItem[] = [
  {
    topic: 'Pick the right compute for a workload',
    what: 'The choice runs from most control to least: **Compute Engine** VMs (full OS control), **GKE** (Kubernetes, many containers), **Cloud Run** (containers without servers), **Cloud Run functions** (a single function triggered by events), and **Agent Runtime** on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine) for hosting AI agents. Take the most managed option that still meets the constraints.',
    exam: 'A specific OS, licence or GPU driver forces a VM; "needs Kubernetes" means GKE; "stateless container, scale to zero" means Cloud Run.',
    see: [L.gke, L.run]
  },
  {
    topic: 'Launch a VM: availability policy and SSH keys',
    what: 'Creating a VM means choosing a machine type, boot image, disks and network — and two less obvious settings. The **availability policy** decides what happens on host maintenance (live **MIGRATE** or **TERMINATE**) and whether the VM restarts automatically after a crash. **SSH access** is either OS Login (IAM-controlled, recommended) or SSH keys in project or instance metadata.',
    how: ['gcloud compute instances create web-1 --zone=us-central1-a --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud --maintenance-policy=MIGRATE --restart-on-failure'],
    exam: 'VMs with GPUs cannot live-migrate: they need `--maintenance-policy=TERMINATE`.',
    see: [L.cmdCompute]
  },
  {
    topic: 'Choose storage for a VM: zonal PD, regional PD, Hyperdisk',
    what: '**Persistent Disk** comes in standard (HDD), balanced and SSD; a **zonal** disk lives in one zone, a **regional** disk replicates synchronously to a second zone so a VM can fail over. **Hyperdisk** (Balanced, Throughput, Extreme, ML) lets you provision performance separately from size and is what the newest machine series use. **Local SSD** is fastest but loses its data when the VM stops.',
    exam: '"A stateful VM must survive a zone failure with no data loss" → a regional persistent disk (or Hyperdisk Balanced High Availability). "Scratch space, highest IOPS" → Local SSD.'
  },
  {
    topic: 'Create an autoscaled managed instance group from a template',
    what: 'An **instance template** describes a VM once (and cannot be edited — you make a new one). A **managed instance group** creates identical VMs from it, keeps the target size, recreates failed VMs (**autohealing** with a health check), rolls out new templates, and **autoscales** on CPU, load balancer use, a Monitoring metric or a schedule. A regional MIG spreads VMs across zones.',
    how: ['gcloud compute instance-templates create web-t1 --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud --tags=web', 'gcloud compute instance-groups managed create web-mig --region=us-central1 --template=web-t1 --size=2', 'gcloud compute instance-groups managed set-autoscaling web-mig --region=us-central1 --min-num-replicas=2 --max-num-replicas=10 --target-cpu-utilization=0.6'],
    exam: 'To change the VMs in a MIG, create a new template and start a rolling update — you do not edit the template.',
    see: [L.termMig]
  },
  {
    topic: 'Turn on OS Login',
    what: '**OS Login** ties SSH access to IAM instead of keys in metadata: people get `roles/compute.osLogin` (or `osAdminLogin` for sudo), their Linux account follows their Google identity, removing the role removes access, and two-step verification can be required.',
    how: ['gcloud compute project-info add-metadata --metadata=enable-oslogin=TRUE', 'gcloud projects add-iam-policy-binding shop-prod-4821 --member=group:ops@example.com --role=roles/compute.osAdminLogin'],
    exam: '"Manage SSH access centrally, revoke instantly when someone leaves" → OS Login.'
  },
  {
    topic: 'Configure VM Manager',
    what: '**VM Manager** is a set of tools for fleets of VMs: **patch management** (patch jobs and recurring patch deployments), **OS inventory** (what is installed where) and **OS policies** (keep packages and configuration in a desired state). It relies on the OS Config agent, present in most Google-provided images.',
    how: ['gcloud compute project-info add-metadata --metadata=enable-osconfig=TRUE', 'gcloud compute os-config patch-jobs execute --instance-filter-all --display-name="monthly patch"'],
    exam: '"Patch all Linux VMs on a schedule and report compliance" → VM Manager patch deployments.'
  },
  {
    topic: 'Use Spot VMs and custom machine types',
    what: '**Spot VMs** use spare capacity at a large discount but can be stopped at any moment with a 30-second notice — good for batch jobs and anything that can be interrupted. **Custom machine types** let you pick vCPUs and memory yourself when no predefined type fits, so you do not pay for what you do not need.',
    how: ['gcloud compute instances create batch-1 --zone=us-central1-a --provisioning-model=SPOT --instance-termination-action=DELETE', 'gcloud compute instances create app-1 --zone=us-central1-a --custom-cpu=6 --custom-memory=24GB'],
    exam: '"Fault-tolerant batch work, lowest cost" → Spot VMs. "Workload needs 6 vCPUs and 24 GB exactly" → a custom machine type.'
  },
  {
    topic: 'Install and set up kubectl',
    what: '**kubectl** is the Kubernetes command line. Install it with gcloud components (or your package manager) along with the `gke-gcloud-auth-plugin`, then let gcloud write the cluster connection into your kubeconfig. Cloud Shell has both already.',
    how: ['gcloud components install kubectl gke-gcloud-auth-plugin', 'gcloud container clusters get-credentials shop --region=us-central1'],
    see: [L.gke, L.cmdGke]
  },
  {
    topic: 'Create GKE clusters in different configurations',
    what: 'The main choices: **Autopilot** (Google runs the nodes, you pay for Pod requests) or **Standard** (you run node pools); **zonal** or **regional** (control plane and nodes across three zones); and **private nodes** (no external IPs, optionally a private control plane endpoint).',
    how: ['gcloud container clusters create-auto shop --region=us-central1', 'gcloud container clusters create shop-std --region=us-central1 --num-nodes=1 --enable-private-nodes --master-ipv4-cidr=172.16.0.0/28'],
    exam: 'In a regional Standard cluster `--num-nodes` is per zone: 1 gives 3 nodes.',
    see: [L.gke]
  },
  {
    topic: 'Deploy a containerized app to GKE',
    what: 'The order is always: image in Artifact Registry → cluster → kubectl credentials → a **Deployment** for the app → a **Service** (or Ingress/Gateway) to reach it.',
    how: ['kubectl create deployment web --image=us-central1-docker.pkg.dev/shop-prod-4821/apps/web:v1 --replicas=3', 'kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080'],
    see: [L.gke]
  },
  {
    topic: 'Deploy to serverless, including apps triggered by Google Cloud events',
    what: 'Cloud Run services and Cloud Run functions deploy from an image or straight from source. They can be triggered over HTTP, by **Pub/Sub** messages, by **Cloud Storage** object changes, or by **Eventarc**, which delivers events from many Google services (and audit logs) to a Cloud Run service.',
    how: ['gcloud run deploy thumbs --source=. --region=us-central1', 'gcloud eventarc triggers create on-upload --location=us-central1 --destination-run-service=thumbs --event-filters="type=google.cloud.storage.object.v1.finalized" --event-filters="bucket=shop-uploads" --service-account=events@shop-prod-4821.iam.gserviceaccount.com'],
    exam: '"Process every file uploaded to a bucket" → an Eventarc (or Cloud Storage) trigger to Cloud Run or a Cloud Run function.',
    see: [L.run, L.canvasEvents]
  },
  {
    topic: 'Decide between GPUs and TPUs',
    what: '**GPUs** are general-purpose accelerators that run almost any framework (CUDA, PyTorch, TensorFlow) for training, inference, rendering and simulation, on Compute Engine, GKE and Cloud Run. **TPUs** are Google\'s own chips for large-scale machine learning with JAX, TensorFlow or PyTorch/XLA, offered as Cloud TPU VMs and on GKE.',
    exam: '"Large-scale training of a TensorFlow/JAX model, best price-performance" → TPU. "Needs CUDA" or a general GPU workload → GPU.'
  }
];

const S22: GuideItem[] = [
  {
    topic: 'Choose and deploy data products',
    what: 'Match the data to the product: **Cloud SQL** (managed MySQL, PostgreSQL, SQL Server; one region), **AlloyDB** (high-performance PostgreSQL), **Spanner** (relational at global scale, strongly consistent), **Bigtable** (wide-column NoSQL for huge, low-latency throughput such as time series and IoT), **Firestore** (document database for web and mobile apps), **BigQuery** (analytics warehouse), **Memorystore** (managed Redis, Valkey, Memcached), **Pub/Sub** and **Managed Service for Apache Kafka** (messaging and streams), **Dataflow** (Apache Beam batch and stream processing).',
    exam: 'The cue words decide it: "global, horizontally scalable SQL" → Spanner; "petabyte analytics with SQL" → BigQuery; "millisecond reads, billions of rows, IoT" → Bigtable; "existing MySQL app" → Cloud SQL; "caching / sessions" → Memorystore.',
    see: [L.sheet, L.cmdBq]
  },
  {
    topic: 'Choose and deploy storage products, and the Cloud Storage classes',
    what: '**Cloud Storage** holds objects; **Filestore** is managed NFS for shared files; **Google Cloud NetApp Volumes** is enterprise NFS/SMB; **Google Cloud Managed Lustre** is a parallel file system for HPC and AI. Cloud Storage classes trade storage price against access cost: **Standard** (hot), **Nearline** (about monthly, 30-day minimum), **Coldline** (about quarterly, 90 days), **Archive** (yearly, 365 days) — or **Autoclass** to move objects automatically.',
    how: ['gcloud storage buckets create gs://shop-backups-4821 --location=us-central1 --default-storage-class=COLDLINE'],
    exam: 'Read the access frequency: "accessed less than once a quarter, kept for years" → Coldline or Archive.',
    see: [L.cmdStorage]
  },
  {
    topic: 'Load data',
    what: 'Small to medium data goes up from the command line (`gcloud storage cp`, `rsync`) or straight into BigQuery from files in Cloud Storage. **Storage Transfer Service** moves large or recurring transfers from other clouds, HTTP sources or on-premises (with agents); **Transfer Appliance** is a physical device for petabytes over slow links; the **BigQuery Data Transfer Service** schedules loads from SaaS sources.',
    how: ['gcloud storage cp -r ./exports gs://shop-raw-4821/2026-10/', 'bq load --source_format=CSV --autodetect sales.orders gs://shop-raw-4821/2026-10/orders.csv'],
    exam: '"Hundreds of TB from on-premises, limited bandwidth" → Transfer Appliance. "Copy from S3 every night" → Storage Transfer Service.',
    see: [L.termBq, L.cmdBq]
  },
  {
    topic: 'Keep data redundant across regions',
    what: 'Each product has its own way: Cloud Storage **dual-region and multi-region** buckets (with turbo replication), Cloud SQL **cross-region read replicas** that can be promoted, **Spanner** and **Firestore** multi-region configurations, **Bigtable** replication between clusters in different regions, **AlloyDB** secondary clusters, and **BigQuery** multi-region datasets or cross-region replication.',
    exam: '"Survive the loss of a whole region" → a multi-region configuration or a cross-region replica — zonal or regional redundancy is not enough.'
  }
];

const S23: GuideItem[] = [
  {
    topic: 'Create VPCs and subnets: custom mode, Shared VPC, peering',
    what: 'A custom mode VPC with subnets you plan; **Shared VPC** to share one VPC from a host project with service projects; **VPC Network Peering** to join two VPCs privately (not transitive, no overlapping ranges).',
    see: [L.vpc, L.cmdNet]
  },
  {
    topic: 'Write VPC firewall rules and Cloud NGFW policies',
    what: '**Cloud Next Generation Firewall (Cloud NGFW)** is the name for Google Cloud\'s firewall service: VPC firewall rules plus hierarchical and network **firewall policies**, in Essentials, Standard (FQDN and geo objects, threat intelligence) and Enterprise (intrusion prevention) tiers. A rule has a direction, action, priority, target, source or destination, and protocols and ports.',
    how: ['gcloud compute firewall-rules create allow-http --network=prod-vpc --direction=INGRESS --action=ALLOW --rules=tcp:80,tcp:443 --source-ranges=0.0.0.0/0 --target-tags=web'],
    exam: 'Lowest priority number wins; deny wins a tie; with no match, ingress is denied and egress allowed.',
    see: [L.vpc]
  },
  {
    topic: 'Use secure tags and service accounts in firewall policy rules',
    what: '**Secure tags** (Resource Manager tags with a firewall purpose) are key/value labels whose use is controlled by IAM. Bound to VMs, they can be the source or target of **network firewall policy** rules — unlike network tags, which anyone who can edit a VM can change. Service accounts can also be targets, for the same reason.',
    how: ['gcloud resource-manager tags keys create env --parent=organizations/123456789012 --purpose=GCE_FIREWALL --purpose-data=network=shop-prod-4821/prod-vpc', 'gcloud resource-manager tags values create prod --parent=123456789012/env'],
    exam: '"Only the security team may decide which VMs a rule applies to" → secure tags or service accounts, not network tags.',
    see: [L.vpc]
  },
  {
    topic: 'Connect networks: Cloud VPN, peering, Cloud Interconnect',
    what: '**HA VPN** (IPsec over the internet, 99.99% with two tunnels) for quick encrypted links; **Dedicated** or **Partner Interconnect** for private, high-bandwidth links; **VPC Network Peering** between VPCs. Cloud Router exchanges routes over BGP.',
    see: [L.vpc]
  },
  {
    topic: 'Choose and deploy a load balancer',
    what: 'Three families — Application Load Balancers (HTTP(S)), proxy Network Load Balancers (TCP) and passthrough Network Load Balancers (any IP protocol, client IP kept) — each external or internal, global or regional.',
    see: [L.lb, L.cmdLb]
  },
  {
    topic: 'Tell the Network Service Tiers apart',
    what: '**Premium Tier** (the default) carries traffic on Google\'s private backbone as far as possible and is required for global load balancers and global anycast IPs. **Standard Tier** hands traffic to the public internet in the region, costs less for egress, and only works with regional resources.',
    how: ['gcloud compute project-info update --default-network-tier=STANDARD', 'gcloud compute addresses create web-ip --region=us-central1 --network-tier=STANDARD'],
    exam: '"Lower cost, latency is not critical, one region" → Standard Tier. "Global load balancer" → Premium only.',
    see: [L.lb]
  }
];

const S24: GuideItem[] = [
  {
    topic: 'Use infrastructure-as-code tools: Fabric FAST, Config Connector, Terraform, Helm',
    what: '**Terraform** describes resources in HCL and applies changes from a plan, keeping state (Google\'s Infrastructure Manager can run it for you). **Config Connector** manages Google Cloud resources as Kubernetes objects. **Helm** packages Kubernetes applications as charts. **Fabric FAST** is Google\'s set of Terraform blueprints (from Cloud Foundation Fabric) that bootstrap a whole organization — hierarchy, networking, security — in stages.',
    how: ['terraform init', 'terraform plan -out=plan.tfplan', 'terraform apply plan.tfplan'],
    exam: '"Create identical environments repeatedly and review changes before applying" → Terraform (plan, then apply).',
    see: [L.cmdBuild]
  },
  {
    topic: 'Plan and build with AI help: Gemini CLI, Google Antigravity, Gemini Cloud Assist, Application Design Center',
    what: '**Gemini CLI** is an open-source AI agent in your terminal that can read code, run commands and use tools. **Google Antigravity** is Google\'s agent-first development environment. **Gemini Cloud Assist** helps inside the Console: designing, troubleshooting, explaining costs. **Application Design Center** lets you design an application architecture from templates on a canvas and deploy it (it produces the infrastructure code for you).',
    exam: 'Expect questions on what each tool is for, and on reviewing what an AI assistant proposes before applying it.'
  }
];

// ── Section 3 ──────────────────────────────────────────────────────────────

const S31: GuideItem[] = [
  {
    topic: 'Connect to a VM remotely',
    what: '`gcloud compute ssh` handles keys (or OS Login) for you and falls back to **IAP tunnelling** when the VM has no external IP. There is also SSH-in-browser in the Console, the **serial console** for VMs that do not boot properly, and RDP for Windows after setting a password.',
    how: ['gcloud compute ssh web-1 --zone=us-central1-a --tunnel-through-iap', 'gcloud compute reset-windows-password win-1 --zone=us-central1-a --user=admin'],
    exam: '"SSH to VMs without external IPs and without a bastion" → IAP TCP forwarding with a firewall rule for 35.235.240.0/20.',
    see: [L.vpc]
  },
  {
    topic: 'See which VMs are running',
    what: 'List and filter VMs in a project with gcloud or the Console; across many projects, use Cloud Asset Inventory.',
    how: ['gcloud compute instances list --filter="status=RUNNING" --format="table(name, zone.basename(), machineType.basename(), status)"'],
    see: [L.cmdCompute]
  },
  {
    topic: 'Work with snapshots and images',
    what: 'A **snapshot** is an incremental backup of one disk; **snapshot schedules** take them automatically and delete old ones. An **image** is a bootable template you create from a disk, snapshot or another image, grouped in **image families** so "latest" is easy to use. A **machine image** captures a whole VM — all its disks and configuration.',
    how: ['gcloud compute snapshots create web-1-before-upgrade --source-disk=web-1 --source-disk-zone=us-central1-a', 'gcloud compute resource-policies create snapshot-schedule daily-2am --region=us-central1 --daily-schedule --start-time=02:00 --max-retention-days=14', 'gcloud compute disks add-resource-policies web-1 --zone=us-central1-a --resource-policies=daily-2am', 'gcloud compute images create web-v2 --source-disk=web-1 --source-disk-zone=us-central1-a --family=web'],
    exam: '"Back up a disk every day automatically" → a snapshot schedule. "Template for new VMs with software pre-installed" → a custom image (family).',
    see: [L.cmdCompute]
  },
  {
    topic: 'See what a GKE cluster is running: nodes, Pods, Services',
    what: 'kubectl lists what is in the cluster; the Console\'s Workloads and Services pages show the same.',
    how: ['kubectl get nodes -o wide', 'kubectl get pods -A', 'kubectl get services'],
    see: [L.gke]
  },
  {
    topic: 'Let GKE pull images from Artifact Registry',
    what: 'Nodes pull images with the **node service account**. In the same project it usually works out of the box; for a repository in another project, give the node service account `roles/artifactregistry.reader` on it.',
    how: ['gcloud artifacts repositories add-iam-policy-binding apps --project=shared-images --location=us-central1 --member=serviceAccount:gke-nodes@shop-prod-4821.iam.gserviceaccount.com --role=roles/artifactregistry.reader'],
    exam: '`ImagePullBackOff` with 403 → the node service account lacks reader on the repository.',
    see: [L.gke]
  },
  {
    topic: 'Add, change and remove node pools, and autoscale them',
    what: 'In Standard clusters, **node pools** group nodes with the same configuration. You add one for new needs (bigger machines, GPUs, Spot), drain and delete old ones, and turn on the cluster autoscaler per pool.',
    how: ['gcloud container node-pools create spot-pool --cluster=shop-std --region=us-central1 --spot --machine-type=e2-standard-4 --enable-autoscaling --min-nodes=0 --max-nodes=5', 'gcloud container node-pools delete default-pool --cluster=shop-std --region=us-central1'],
    exam: 'Changing the machine type of nodes means a new node pool, not editing the old one.',
    see: [L.gke, L.cmdGke]
  },
  {
    topic: 'Work with Kubernetes objects: Pods, Services, StatefulSets',
    what: 'Deployments for stateless apps, **StatefulSets** for apps that need stable names and their own disks, Services for stable addresses. Most work is `kubectl apply`, `get` and `describe`.',
    see: [L.gke]
  },
  {
    topic: 'Configure horizontal and vertical Pod autoscaling',
    what: 'The **HorizontalPodAutoscaler** changes the number of Pods based on CPU, memory or custom metrics. The **VerticalPodAutoscaler** recommends — or applies — better CPU and memory requests. Do not let both act on the same CPU/memory metric.',
    how: ['kubectl autoscale deployment web --min=3 --max=20 --cpu=60%', 'gcloud container clusters update shop-std --region=us-central1 --enable-vertical-pod-autoscaling'],
    see: [L.gke]
  },
  {
    topic: 'Manage Pod resource requests on Autopilot',
    what: 'Autopilot bills for the CPU, memory and storage Pods **request**, applies defaults when none are set, and raises requests below its minimums. Set requests deliberately in your manifests — and use **compute classes** when a workload needs particular hardware.',
    exam: '"Reduce Autopilot cost" → right-size Pod requests.',
    see: [L.gke]
  },
  {
    topic: 'Deploy new versions of a Cloud Run app',
    what: 'Every deploy creates an immutable **revision**. You can send it all traffic at once, or deploy it with no traffic and a tag, test it at the tag URL, then move traffic over.',
    how: ['gcloud run deploy shop --image=us-central1-docker.pkg.dev/shop-prod-4821/apps/shop:1.5 --region=us-central1 --no-traffic --tag=canary'],
    see: [L.run, L.cmdServerless]
  },
  {
    topic: 'Split traffic between versions: Cloud Run, Cloud Run functions, GKE',
    what: 'Cloud Run (and Cloud Run functions, which are Cloud Run services) split traffic between revisions by percentage or tag. On GKE, a Gateway `HTTPRoute` can weight traffic between two Services (or run a canary Deployment behind the same Service).',
    how: ['gcloud run services update-traffic shop --region=us-central1 --to-revisions=shop-00008-wfx=10,shop-00007-plq=90'],
    exam: '"Send 10% of users to the new version" → traffic splitting; "roll back fast" → move traffic back to the previous revision.',
    see: [L.run]
  },
  {
    topic: 'Configure autoscaling for a Cloud Run app',
    what: 'Cloud Run scales on its own; you shape it with **min instances** (no cold starts, billed while idle), **max instances** (protects downstream systems and cost) and **concurrency** (requests per instance).',
    how: ['gcloud run services update shop --region=us-central1 --min-instances=1 --max-instances=20 --concurrency=80'],
    see: [L.run]
  },
  {
    topic: 'Attach GPUs and TPUs',
    what: 'On Compute Engine, either use an accelerator-optimized machine type (GPUs included, like G2 or A3) or attach GPUs to N1 VMs — with `TERMINATE` on host maintenance. On GKE, create GPU or TPU node pools (Autopilot picks them from Pod requests). Cloud Run services can also have a GPU. Check zone availability first.',
    how: ['gcloud compute instances create infer-1 --zone=us-central1-a --machine-type=g2-standard-8 --maintenance-policy=TERMINATE --image-family=debian-12 --image-project=debian-cloud', '# then install the NVIDIA driver on the VM (or start from a Deep Learning VM image)', 'gcloud container node-pools create gpu-pool --cluster=shop-std --region=us-central1 --machine-type=g2-standard-8 --accelerator=type=nvidia-l4,count=1'],
    exam: '"GPU VM creation fails with a maintenance error" → set the maintenance policy to TERMINATE.'
  },
  {
    topic: 'Deploy an AI agent to Agent Runtime',
    what: '**Agent Runtime** on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine) is a managed runtime for AI agents built with the Agent Development Kit or frameworks such as LangChain. You deploy the agent code from the SDK; the platform hosts and scales it, keeps sessions and memory, and handles identity and monitoring.',
    exam: '"Host a custom AI agent without managing servers" → Agent Runtime.'
  },
  {
    topic: 'Manage notebooks in Agent Platform Workbench and BigQuery',
    what: '**Agent Platform Workbench** (formerly Vertex AI Workbench) gives managed JupyterLab instances — you choose the machine type and GPUs, stop them when idle (or let idle shutdown do it) and control who can open them. **BigQuery Studio** notebooks (Colab Enterprise) run Python next to your SQL data without managing a VM.',
    exam: '"Data scientists leave notebook VMs running and costs grow" → idle shutdown on Workbench instances.'
  },
  {
    topic: 'Manage developer environments with Cloud Workstations',
    what: '**Cloud Workstations** gives developers managed, secure development machines inside your VPC, opened in the browser or from a local IDE. An admin creates a cluster, then **configurations** (container image, machine type, disk, idle timeout), and developers create workstations from them — so source code never sits on laptops.',
    exam: '"Developers need consistent, secure environments with code kept off their laptops" → Cloud Workstations.'
  }
];

const S32: GuideItem[] = [
  {
    topic: 'Manage and secure objects in Cloud Storage',
    what: 'Use **uniform bucket-level access** (IAM only, no per-object ACLs) and **public access prevention** unless a bucket really is public. Give temporary access to one object with a **signed URL**. Protect data with **object versioning**, **retention policies** (optionally locked) and holds.',
    how: ['gcloud storage buckets update gs://shop-private-4821 --uniform-bucket-level-access --public-access-prevention', 'gcloud storage buckets update gs://shop-private-4821 --versioning', 'gcloud storage sign-url gs://shop-private-4821/invoice.pdf --duration=1h --impersonate-service-account=signer@shop-prod-4821.iam.gserviceaccount.com'],
    exam: '"Let a customer download one file for an hour without a Google account" → a signed URL.',
    see: [L.cmdStorage]
  },
  {
    topic: 'Set object lifecycle rules on buckets',
    what: '**Lifecycle rules** act on objects automatically: **Delete** them or **SetStorageClass** to a colder class, when conditions match — age, creation date, storage class, number of newer versions, or whether the version is live.',
    how: ['# lifecycle.json: {"rule": [{"action": {"type": "SetStorageClass", "storageClass": "COLDLINE"}, "condition": {"age": 90}}, {"action": {"type": "Delete"}, "condition": {"age": 365}}]}', 'gcloud storage buckets update gs://shop-logs-4821 --lifecycle-file=lifecycle.json'],
    exam: '"Move to Coldline after 90 days, delete after a year" → two lifecycle rules.',
    see: [L.cmdStorage]
  },
  {
    topic: 'Query data in the database products',
    what: 'Each product has its own client: `gcloud sql connect` (or the Cloud SQL Auth Proxy, or Cloud SQL Studio) for Cloud SQL, `bq query` or the console for BigQuery, `cbt` for Bigtable, `gcloud spanner databases execute-sql` for Spanner, client libraries or the console for Firestore, psql or AlloyDB Studio for AlloyDB.',
    how: ['gcloud sql connect shop-db --user=postgres --database=shop', "bq query --use_legacy_sql=false 'SELECT status, COUNT(*) FROM sales.orders GROUP BY status'", 'gcloud spanner databases execute-sql orders --instance=shop-span --sql="SELECT COUNT(*) FROM Orders"', 'cbt -project=shop-prod-4821 -instance=metrics read sensor-readings count=5'],
    see: [L.cmdBq, L.cmdOps]
  },
  {
    topic: 'Estimate what data storage will cost',
    what: 'Storage cost is more than GB-months: Cloud Storage adds **operation charges** (class A/B), **retrieval** and **early-deletion** fees for colder classes, and network egress; BigQuery separates active and long-term storage and charges queries by bytes scanned. Use the **Pricing Calculator**, and a **dry run** to see what a query would scan.',
    how: ["bq query --dry_run --use_legacy_sql=false 'SELECT * FROM sales.orders'"],
    exam: '"Data read often but stored in Archive" costs more, not less — retrieval fees.'
  },
  {
    topic: 'Back up and restore databases',
    what: '**Cloud SQL**: automated daily backups, on-demand backups and **point-in-time recovery**. **Firestore**: scheduled backups, point-in-time recovery, export/import. **Spanner**: backups and point-in-time recovery. **AlloyDB**: continuous backup with point-in-time recovery. **Bigtable**: table backups. Restoring usually creates or overwrites an instance — know which.',
    how: ['gcloud sql backups create --instance=shop-db', 'gcloud sql backups list --instance=shop-db', 'gcloud sql backups restore 1739000000000 --restore-instance=shop-db-restored --backup-instance=shop-db', 'gcloud spanner backups create orders-20261021 --instance=shop-span --database=orders --retention-period=7d'],
    exam: '"Recover the database to 10 minutes before a bad update" → point-in-time recovery.',
    see: [L.cmdOps]
  },
  {
    topic: 'Check the status of data jobs',
    what: 'Dataflow jobs show their graph, throughput, watermark and errors in the console, and through gcloud. BigQuery jobs (loads, queries, exports) are listed with `bq ls -j`, inspected with `bq show -j`, and queryable in `INFORMATION_SCHEMA.JOBS`.',
    how: ['gcloud dataflow jobs list --region=us-central1 --status=active', 'bq ls -j -n 10', 'bq show -j bqjob_r1234_00000190'],
    see: [L.cmdBq]
  },
  {
    topic: 'Use Database Center for the whole database fleet',
    what: '**Database Center** is one dashboard over every database instance in your projects — Cloud SQL, AlloyDB, Spanner, Bigtable, Firestore, Memorystore — showing inventory, health and performance issues, and security and configuration recommendations (with Gemini to ask questions about the fleet).',
    exam: '"See all database instances and their risks across projects in one place" → Database Center.'
  },
  {
    topic: 'Configure customer-managed encryption keys (CMEK)',
    what: 'Data is always encrypted with Google-managed keys. With **CMEK** you use your own key in **Cloud KMS** instead: you control rotation, and disabling the key makes the data unreadable. The service\'s own service agent needs `roles/cloudkms.cryptoKeyEncrypterDecrypter` on the key. (CSEK — keys you supply yourself — exists only for Cloud Storage and Compute Engine.)',
    how: ['gcloud kms keyrings create shop-keys --location=us-central1', 'gcloud kms keys create storage-key --keyring=shop-keys --location=us-central1 --purpose=encryption --rotation-period=90d --next-rotation-time=2026-12-01T00:00:00Z', 'gcloud storage service-agent --authorize-cmek=projects/shop-prod-4821/locations/us-central1/keyRings/shop-keys/cryptoKeys/storage-key', 'gcloud storage buckets update gs://shop-private-4821 --default-encryption-key=projects/shop-prod-4821/locations/us-central1/keyRings/shop-keys/cryptoKeys/storage-key'],
    exam: '"Company must control and rotate the encryption keys" → CMEK with Cloud KMS.',
    see: [L.cmdOps]
  }
];

const S33: GuideItem[] = [
  {
    topic: 'Grow a subnet\'s IPv4 range',
    what: 'A subnet can be expanded in place with no downtime — but never shrunk — as long as the larger range overlaps nothing.',
    how: ['gcloud compute networks subnets expand-ip-range web-us --region=us-central1 --prefix-length=22'],
    see: [L.vpc]
  },
  {
    topic: 'Reserve static external or internal IPs',
    what: 'Reserve an address so it does not change when a VM is recreated or a load balancer is rebuilt — regional or global external, or a specific internal address in a subnet. An ephemeral address in use can be **promoted** to static.',
    how: ['gcloud compute addresses create web-ip --region=us-central1', 'gcloud compute addresses create db-ip --region=us-central1 --subnet=app-us --addresses=10.10.1.10', 'gcloud compute addresses create keep-me --region=us-central1 --addresses=34.123.45.67'],
    exam: 'Reserved addresses that are not attached are still billed.',
    see: [L.vpc, L.cmdNet]
  },
  {
    topic: 'Add custom static routes',
    what: 'A **static route** sends a destination range to a next hop you choose — a VM (such as a firewall appliance), an internal passthrough load balancer, a VPN tunnel or an IP — optionally only for VMs with certain tags. The most specific route wins, then the lowest priority.',
    how: ['gcloud compute routes create to-appliance --network=prod-vpc --destination-range=0.0.0.0/0 --next-hop-ilb=fw-ilb --next-hop-ilb-region=us-central1 --priority=800 --tags=inspected'],
    see: [L.vpc]
  },
  {
    topic: 'Use Cloud DNS and Cloud NAT',
    what: '**Cloud DNS** hosts **public zones** (your domain on the internet) and **private zones** (names visible only to chosen VPCs), plus **forwarding zones** to on-premises DNS and DNS peering. **Cloud NAT** gives VMs without external IPs outbound internet access, per region, through a Cloud Router.',
    how: ['gcloud dns managed-zones create internal --dns-name=corp.example.internal. --visibility=private --networks=prod-vpc --description="internal names"', 'gcloud dns record-sets create db.corp.example.internal. --zone=internal --type=A --ttl=300 --rrdatas=10.10.1.10', 'gcloud compute routers nats create prod-nat --router=nat-router --region=us-central1 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges'],
    exam: '"Internal names that only our VMs can resolve" → a private zone. "Resolve on-premises names from the VPC" → a forwarding zone.',
    see: [L.vpc, L.cmdLb]
  },
  {
    topic: 'Look after firewall rules and Cloud NGFW policies',
    what: 'Day-two firewall work: list rules in priority order, turn on **logging** to see what a rule matches, disable instead of delete while testing, use **Firewall Insights** to find shadowed and unused rules, and manage hierarchical and network firewall policies and their associations.',
    how: ['gcloud compute firewall-rules list --filter="network:prod-vpc" --sort-by=priority', 'gcloud compute firewall-rules update allow-http --enable-logging', 'gcloud compute firewall-rules update old-rule --disabled'],
    see: [L.vpc]
  }
];

const S34: GuideItem[] = [
  {
    topic: 'Create alerts on resource metrics',
    what: 'An **alerting policy** has a condition (a metric over or under a threshold for some time, or a metric that stops arriving), **notification channels** (email, SMS, Slack, PagerDuty, Pub/Sub, webhooks) and documentation telling the on-call person what to do.',
    exam: '"Notify the team when CPU stays above 80% for 10 minutes" → an alerting policy with a threshold condition and a duration.'
  },
  {
    topic: 'Create custom metrics, from apps or from logs',
    what: 'Applications can write their own metrics (OpenTelemetry or the Monitoring API, as `custom.googleapis.com/...`), the Ops Agent can collect Prometheus or StatsD metrics, and **log-based metrics** count or measure log entries that match a filter.',
    how: ['gcloud logging metrics create checkout_errors --description="Checkout errors" --log-filter=\'resource.type="cloud_run_revision" AND severity>=ERROR AND jsonPayload.route="/checkout"\''],
    exam: '"Alert when a particular error appears in logs" → a log-based metric, then an alert on it.'
  },
  {
    topic: 'Configure audit logs, VPC Flow Logs and firewall logs',
    what: '**Cloud Audit Logs** come in four kinds: **Admin Activity** (always on, free), **Data Access** (off by default except BigQuery — turn on per service in the IAM audit configuration, it can be large), **System Event** and **Policy Denied**. **VPC Flow Logs** are turned on per subnet; **Firewall Rules Logging** per rule.',
    how: ['gcloud compute networks subnets update web-us --region=us-central1 --enable-flow-logs', 'gcloud compute firewall-rules update allow-http --enable-logging'],
    exam: '"Who read this bucket\'s objects?" → Data Access audit logs, which must be enabled first. "Who deleted this VM?" → Admin Activity logs, always there.',
    see: [L.canvasLogs]
  },
  {
    topic: 'Export logs to other systems: BigQuery, on-premises',
    what: 'A **sink** in the Log Router copies matching log entries to BigQuery, Cloud Storage, Pub/Sub (and from there to Splunk or an on-premises SIEM) or another log bucket. **Aggregated sinks** on a folder or organization collect logs from every project below. The sink\'s **writer identity** must be allowed to write to the destination.',
    how: ['gcloud logging sinks create audit-to-bq bigquery.googleapis.com/projects/shop-sec-4821/datasets/audit --organization=123456789012 --include-children --log-filter=\'logName:"cloudaudit.googleapis.com"\'', '# then grant the writer identity it prints roles/bigquery.dataEditor on the dataset'],
    exam: '"Keep audit logs from all projects for analysis" → an aggregated sink at the organization to BigQuery (or to Cloud Storage for cheap long-term retention).',
    see: [L.canvasLogs, L.cmdMsg]
  },
  {
    topic: 'Configure log buckets, Log Analytics and the Log Router',
    what: 'Every project has a **_Required** bucket (audit logs, 400 days, unchangeable) and a **_Default** bucket (30 days by default, adjustable). You can create your own buckets with longer retention and a chosen region, and upgrade a bucket to **Log Analytics** to query logs with SQL. The **Log Router** decides which entries go where, and **exclusions** drop noisy entries to save cost.',
    how: ['gcloud logging buckets create audit-1y --location=global --retention-days=365 --enable-analytics', 'gcloud logging buckets update _Default --location=global --retention-days=90'],
    exam: '"Keep logs for a year and query them with SQL" → a log bucket with 365-day retention and Log Analytics.'
  },
  {
    topic: 'View and filter logs in Cloud Logging',
    what: 'Logs Explorer filters with the Logging query language — by resource, log name, severity, labels, text and time. The same filter works from the command line.',
    how: ['gcloud logging read \'resource.type="cloud_run_revision" AND resource.labels.service_name="shop" AND severity>=ERROR\' --freshness=1h --limit=20'],
    see: [L.cmdMsg]
  },
  {
    topic: 'Read the details of one log entry',
    what: 'Expanding an entry shows its full structure: `textPayload` or `jsonPayload`, `severity`, the `resource` and its labels, `httpRequest` for request logs, and the **trace** ID that ties it to Cloud Trace and to the other entries of the same request.',
    exam: 'Know where to look: the error text is in the payload; what produced it is in `resource`.'
  },
  {
    topic: 'Investigate with Cloud Trace, Cloud Profiler, Query Insights and index advisor',
    what: '**Cloud Trace** shows where time goes in a request across services. **Cloud Profiler** profiles CPU and memory of running code continuously at low overhead. **Query Insights** (Cloud SQL, AlloyDB) finds the slow queries and shows their plans and who sent them; the **index advisor** suggests indexes that would speed them up.',
    exam: '"Which microservice adds the latency?" → Cloud Trace. "Which function uses the CPU?" → Cloud Profiler. "Which SQL query is slow?" → Query Insights.'
  },
  {
    topic: 'Watch the Personalized Service Health dashboard',
    what: '**Personalized Service Health** shows Google Cloud incidents and planned maintenance that affect **your** projects, regions and products — with alerts you can route to your notification channels and an API for your own tooling.',
    exam: '"Know quickly when a Google Cloud incident affects our services" → Personalized Service Health alerts.'
  },
  {
    topic: 'Install and configure the Ops Agent',
    what: 'The **Ops Agent** collects logs and metrics from inside a VM — memory, disk use, processes, application logs and third-party apps such as nginx or MySQL — which the hypervisor cannot see. Install it per VM, or across a fleet with VM Manager policies; configure it in `/etc/google-cloud-ops-agent/config.yaml`.',
    how: ['curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh', 'sudo bash add-google-cloud-ops-agent-repo.sh --also-install'],
    exam: '"No memory utilization metric for the VMs" → install the Ops Agent.'
  },
  {
    topic: 'Deploy Google Cloud Managed Service for Prometheus',
    what: 'A fully managed, Prometheus-compatible way to collect and store metrics — in Google\'s global monitoring store, with long retention — and query them with PromQL in Cloud Monitoring or Grafana. On GKE, **managed collection** is on by default; you tell it what to scrape with `PodMonitoring` resources.',
    exam: '"Keep using Prometheus and PromQL without running Prometheus servers" → Managed Service for Prometheus.'
  },
  {
    topic: 'Use Gemini Cloud Assist with Cloud Monitoring',
    what: 'In Cloud Monitoring, Gemini Cloud Assist can turn plain-language questions into queries and charts, explain what a dashboard shows, and help investigate an alert or incident by pulling together related metrics, logs and changes.'
  },
  {
    topic: 'Use Active Assist to use resources better',
    what: '**Active Assist** is the family of **recommenders**: idle VMs, disks and IP addresses, right-sizing machine types, committed use discounts, and the **IAM recommender**, which suggests removing permissions nobody uses.',
    how: ['gcloud recommender recommendations list --recommender=google.compute.instance.MachineTypeRecommender --location=us-central1-a --project=shop-prod-4821'],
    exam: '"Reduce cost of over-provisioned VMs" → machine type recommendations. "Tighten roles to what is actually used" → IAM recommender.'
  },
  {
    topic: 'Watch events and application health in Cloud Hub',
    what: '**Cloud Hub** is the operations home in the Console for a project or an App Hub application: open Monitoring alerts, active Google Cloud incidents, planned maintenance, and health and performance of the products, services and workloads involved, in one place.',
    exam: '"One place for an SRE to see an application\'s alerts, incidents and maintenance" → Cloud Hub.'
  }
];

// ── Section 4 ──────────────────────────────────────────────────────────────

const S41: GuideItem[] = [
  {
    topic: 'View and create IAM policies',
    what: 'An **allow policy** is the list of bindings on a resource. Read it with `get-iam-policy`; change it one binding at a time with `add-` / `remove-iam-policy-binding` (safe), or replace it whole with `set-iam-policy` (careful — it uses an etag to avoid overwriting concurrent changes). **IAM Conditions** add rules such as "only until a date" or "only for this resource name"; **deny policies** block permissions whatever allow policies say. Policy Troubleshooter explains why someone can or cannot do something.',
    how: ['gcloud projects get-iam-policy shop-prod-4821 --flatten="bindings[].members" --filter="bindings.members:user:ana@example.com" --format="value(bindings.role)"', 'gcloud projects add-iam-policy-binding shop-prod-4821 --member=user:contractor@example.com --role=roles/viewer --condition=\'expression=request.time < timestamp("2026-12-31T00:00:00Z"),title=until-2027\''],
    exam: '"Temporary access that ends by itself" → an IAM condition with an expiry.',
    see: [L.cmdAuth]
  },
  {
    topic: 'Attach roles where they belong, and know how inheritance works',
    what: 'A resource\'s effective access is the **union** of its own policy and every policy above it (project, folders, organization). You cannot take away at a lower level what was granted higher up — only a **deny policy** can. So grant as low as possible, and grant at a folder when a team really owns everything in it.',
    exam: '"User has a role at the organization; removing it from the project has no effect" → inheritance; remove it where it was granted.'
  },
  {
    topic: 'Know the role types, and define custom roles',
    what: '**Basic** roles (Owner, Editor, Viewer) cover nearly every service and are too broad for production. **Predefined** roles are per service and maintained by Google. **Custom** roles list exactly the permissions you want, at organization or project level — but you maintain them, and not every permission can be used in them.',
    how: ['gcloud iam roles create vmOperator --project=shop-prod-4821 --title="VM operator" --permissions=compute.instances.get,compute.instances.list,compute.instances.start,compute.instances.stop --stage=GA', 'gcloud iam roles copy --source=roles/compute.viewer --destination=myViewer --dest-project=shop-prod-4821'],
    exam: '"No predefined role fits; least privilege" → a custom role. Otherwise prefer predefined.',
    see: [L.cmdAuth]
  }
];

const S42: GuideItem[] = [
  {
    topic: 'Create service accounts, and recognise the Google-managed ones',
    what: 'A **service account** is an identity for software. **User-managed** ones are yours to create and grant. **Default** service accounts (like the Compute Engine default) are created automatically and historically got the Editor role — an organization policy can stop that. **Service agents** (`service-PROJECT_NUMBER@gcp-sa-….iam.gserviceaccount.com`) are managed by Google and used by services to act in your project; leave their roles alone.',
    how: ['gcloud iam service-accounts create report-job --display-name="Nightly report"'],
    see: [L.termIam]
  },
  {
    topic: 'Give service accounts only the permissions they need',
    what: 'Grant a service account the narrowest predefined (or custom) role, on the specific resource rather than the whole project where you can — a bucket, a dataset, a topic. Use the IAM recommender to remove what goes unused.',
    how: ['gcloud storage buckets add-iam-policy-binding gs://shop-reports-4821 --member=serviceAccount:report-job@shop-prod-4821.iam.gserviceaccount.com --role=roles/storage.objectCreator'],
    see: [L.termIam]
  },
  {
    topic: 'Attach service accounts to resources',
    what: 'Workloads run **as** a service account: a VM (`--service-account`, with the `cloud-platform` scope so IAM alone decides), a Cloud Run service or function (`--service-account`), a GKE Pod through Workload Identity. Attaching one requires `roles/iam.serviceAccountUser` on it. Changing a VM\'s service account requires stopping it.',
    how: ['gcloud compute instances create report-1 --zone=us-central1-a --service-account=report-job@shop-prod-4821.iam.gserviceaccount.com --scopes=cloud-platform', 'gcloud run services update shop --region=us-central1 --service-account=shop-sa@shop-prod-4821.iam.gserviceaccount.com'],
    exam: '"Use access scopes or IAM?" → set the scope to cloud-platform and control access with IAM roles.',
    see: [L.run]
  },
  {
    topic: 'Control who may use a service account',
    what: 'A service account is also a **resource** with its own policy, which decides who may attach it (`roles/iam.serviceAccountUser`), impersonate it (`roles/iam.serviceAccountTokenCreator`), manage it (`serviceAccountAdmin`) or manage its keys (`serviceAccountKeyAdmin`). Granting these at the project level covers every service account in it.',
    how: ['gcloud iam service-accounts add-iam-policy-binding report-job@shop-prod-4821.iam.gserviceaccount.com --member=group:data-eng@example.com --role=roles/iam.serviceAccountUser'],
    exam: '"Developer can deploy a VM but not with a particular service account" → they need Service Account User on that service account.'
  },
  {
    topic: 'Impersonate a service account',
    what: '**Impersonation** lets a person (or another service account) act as a service account for a while, with no key file: gcloud gets short-lived tokens on their behalf, and audit logs record both identities. It needs `roles/iam.serviceAccountTokenCreator` on the service account.',
    how: ['gcloud storage ls gs://shop-reports-4821 --impersonate-service-account=report-job@shop-prod-4821.iam.gserviceaccount.com', 'gcloud config set auth/impersonate_service_account report-job@shop-prod-4821.iam.gserviceaccount.com'],
    exam: '"Test what a service account can do, without downloading a key" → impersonation.',
    see: [L.cmdAuth]
  },
  {
    topic: 'Create and manage short-lived service account credentials',
    what: 'Prefer credentials that expire: OAuth **access tokens** (one hour by default), **ID tokens** for calling Cloud Run and IAP, and signed JWTs — all issued by the IAM Service Account Credentials API through impersonation. Long-lived JSON keys are the risk; the `iam.disableServiceAccountKeyCreation` organization policy blocks them.',
    how: ['gcloud auth print-access-token --impersonate-service-account=report-job@shop-prod-4821.iam.gserviceaccount.com', 'gcloud auth print-identity-token --impersonate-service-account=report-job@shop-prod-4821.iam.gserviceaccount.com --audiences=https://shop-123456789012.us-central1.run.app'],
    exam: 'Any answer that downloads a service account key is suspect when a keyless option exists.'
  },
  {
    topic: 'Give a GKE application a Google Cloud identity',
    what: '**Workload Identity Federation for GKE** gives Pods a Google identity through their Kubernetes service account — roles are granted to that principal (or to a Google service account it may act as), and no key is ever stored in the cluster.',
    see: [L.gke]
  },
  {
    topic: 'Set up Workload Identity Federation',
    what: '**Workload Identity Federation** lets workloads outside Google Cloud — on AWS, Azure, on-premises with an OIDC or SAML identity provider, or a CI system such as GitHub Actions — exchange their own credentials for short-lived Google credentials. You create a **workload identity pool** and a **provider** with attribute mappings and conditions, then grant roles to identities in the pool.',
    how: ['gcloud iam workload-identity-pools create ci --location=global --display-name="CI"', 'gcloud iam workload-identity-pools providers create-oidc github --location=global --workload-identity-pool=ci --issuer-uri=https://token.actions.githubusercontent.com --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" --attribute-condition="assertion.repository_owner==\'example-org\'"'],
    exam: '"Pipeline in GitHub Actions / AWS must deploy to Google Cloud without a service account key" → Workload Identity Federation.',
    see: [L.canvasCicd]
  }
];

export const lesson: Lesson = {
  id: 'ace-guide',
  lang: 'en',
  title: 'The ACE Exam Guide, Explained',
  intro:
    'Google\'s Associate Cloud Engineer exam guide lists, for each section, the "considerations" the exam may test — around ninety short phrases with no explanation. This page goes through every one of them in order: what it means, how it is done (usually the gcloud command), how the exam tends to ask about it, and where in this app to go deeper. The headings are written in our own words; the official guide is the source of truth.',
  practice: [
    { label: 'Command quiz: getting started', href: '#/ace/lab/cmd/start', note: 'gcloud init, config, projects' },
    { label: 'Command quiz: credentials, projects and IAM', href: '#/ace/lab/cmd/auth', note: 'Section 1 and 4 commands' },
    { label: 'Command quiz: Compute Engine', href: '#/ace/lab/cmd/compute', note: 'Section 2 and 3 commands' },
    { label: 'Terminal: least-privilege service account', href: '#/ace/lab/terminal/iam-sa', note: 'Section 4.2' }
  ],
  parts: [
    {
      id: 'about',
      title: 'About the guide',
      sections: [
        {
          id: 'read',
          title: 'How to use this page',
          blocks: [
            {
              kind: 'p',
              text: 'The current guide has **four sections**: setting up a cloud solution environment (~20%), planning and implementing a cloud solution (~30%), ensuring the successful operation of a cloud solution (~30%), and configuring access and security (~20%). Each section has numbered subsections, and each subsection a list of considerations. The parts below follow that numbering, so `2.3.4` here is the fourth consideration of subsection 2.3 in the guide.'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Skim the headings first', text: 'Open nothing yet: read the list of a subsection and mark the ones you could not explain to a colleague.' },
                { title: 'Open the ones you marked', text: 'Each opens to an explanation, the commands, and how the exam asks about it. **Open all** opens a whole subsection.' },
                { title: 'Go deeper where linked', text: 'Many items link to a deep dive or a lab exercise in this app — do the exercise, not just the reading.' },
                { title: 'Come back before the exam', text: 'The exam cues ("On the exam") are the fastest revision pass.' }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              title: 'The source',
              text: `The official guide is a PDF linked from Google\'s Associate Cloud Engineer certification page: \`${GUIDE}\`. When it changes, it wins over this page.`
            }
          ]
        }
      ]
    },
    {
      id: 's1',
      title: 'Section 1 · Setting up a cloud solution environment (~20%)',
      sections: [
        { id: 's1-1', title: '1.1 Projects and accounts', blocks: [{ kind: 'guide', ref: '1.1', items: S11 }] },
        { id: 's1-2', title: '1.2 Billing', blocks: [{ kind: 'guide', ref: '1.2', items: S12 }] }
      ]
    },
    {
      id: 's2',
      title: 'Section 2 · Planning and implementing a cloud solution (~30%)',
      sections: [
        { id: 's2-1', title: '2.1 Compute resources', blocks: [{ kind: 'guide', ref: '2.1', items: S21 }] },
        { id: 's2-2', title: '2.2 Storage and data solutions', blocks: [{ kind: 'guide', ref: '2.2', items: S22 }] },
        { id: 's2-3', title: '2.3 Networking resources', blocks: [{ kind: 'guide', ref: '2.3', items: S23 }] },
        { id: 's2-4', title: '2.4 Tooling', blocks: [{ kind: 'guide', ref: '2.4', items: S24 }] }
      ]
    },
    {
      id: 's3',
      title: 'Section 3 · Ensuring the successful operation of a cloud solution (~30%)',
      sections: [
        { id: 's3-1', title: '3.1 Managing compute resources', blocks: [{ kind: 'guide', ref: '3.1', items: S31 }] },
        { id: 's3-2', title: '3.2 Managing storage and data solutions', blocks: [{ kind: 'guide', ref: '3.2', items: S32 }] },
        { id: 's3-3', title: '3.3 Managing networking resources', blocks: [{ kind: 'guide', ref: '3.3', items: S33 }] },
        { id: 's3-4', title: '3.4 Monitoring and logging', blocks: [{ kind: 'guide', ref: '3.4', items: S34 }] }
      ]
    },
    {
      id: 's4',
      title: 'Section 4 · Configuring access and security (~20%)',
      sections: [
        { id: 's4-1', title: '4.1 Managing IAM', blocks: [{ kind: 'guide', ref: '4.1', items: S41 }] },
        { id: 's4-2', title: '4.2 Managing service accounts', blocks: [{ kind: 'guide', ref: '4.2', items: S42 }] }
      ]
    }
  ]
};
