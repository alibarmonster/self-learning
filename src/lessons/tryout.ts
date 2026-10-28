/**
 * Tryout prep — a cram lesson that follows the course modules one by one:
 * MD1 (cloud fundamentals, hierarchy, projects, IAM, billing and observability)
 * and MD2 (compute choice, VMs, disks and snapshots, MIGs, GKE, Cloud Run and
 * events, accelerators and developer tools). Each section is the short version:
 * the decision table, the commands, and the cue the exam uses to point at the
 * answer. The fixed sets Tryout 1–4 in exams/ace/sets.ts drill the same modules.
 */
import type { Lesson } from '@/types';

export const lesson: Lesson = {
  id: 'tryout',
  lang: 'en',
  title: 'Tryout Prep: Modules MD1–MD2',
  intro:
    'The night-before version of the course: one section per module, each with the decision that the exam turns on, the commands to recognise, and a few checks. Read it top to bottom (about an hour), then sit Tryout 1 to 4 — four sets of 50 different questions, 60 minutes each, on the same modules. In the exam, read the last sentence of the question first: words like least privilege, fewest steps, most cost-effective or no data loss pick the answer.',
  parts: [
    {
      id: 'md1',
      title: 'MD1 · Foundations: hierarchy, projects, IAM, billing',
      sections: [
        {
          id: 'md1-fundamentals',
          title: 'S1-01 · Cloud fundamentals',
          blocks: [
            {
              kind: 'p',
              text: 'Google Cloud resources live in a **zone** (a data centre area, like `asia-southeast2-a`), a **region** (a group of three or more zones, like `asia-southeast2` in Jakarta), or are **global**. Where a resource lives decides what failure it survives: a zonal VM dies with its zone, a regional resource survives a zone, a global one survives a region.'
            },
            {
              kind: 'table',
              caption: 'Scope of common resources',
              columns: ['Scope', 'Examples'],
              rows: [
                ['Zonal', 'VM instance, zonal persistent disk, zonal MIG, zonal GKE cluster'],
                ['Regional', 'Subnet, regional persistent disk, regional MIG, regional GKE cluster, Cloud Run service, Cloud SQL (HA)'],
                ['Multi-region / global', 'VPC network, firewall rules, global load balancer, images, snapshots (multi-region storage), Cloud Storage multi-region bucket']
              ]
            },
            {
              kind: 'table',
              caption: 'Service models: who manages what',
              columns: ['Model', 'You manage', 'Google Cloud example'],
              rows: [
                ['IaaS', 'OS, runtime, app, data', 'Compute Engine'],
                ['Containers (CaaS)', 'Containers and their config', 'GKE'],
                ['PaaS / serverless', 'Code (or a container) and data', 'Cloud Run, Cloud Run functions, App Engine'],
                ['SaaS', 'Only your data and users', 'Google Workspace']
              ]
            },
            {
              kind: 'p',
              text: 'Four ways to drive it: the **Console**, **Cloud Shell** (a browser terminal with `gcloud`, `kubectl`, `terraform` and 5 GB of persistent home), the **gcloud CLI**, and the **APIs / client libraries**. Infrastructure as code (Terraform) sits on top of the APIs.'
            },
            {
              kind: 'code',
              title: 'gcloud configurations: one per project or account',
              lines: [
                '$ gcloud init',
                '$ gcloud config configurations create dev',
                '$ gcloud config set project ace-dev-123',
                '$ gcloud config set compute/region asia-southeast2',
                '$ gcloud config configurations activate prod',
                '$ gcloud config list'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Highly available across zones" → a regional resource (regional MIG, regional disk, regional cluster). "Survive a regional outage" → resources in two regions behind a global load balancer. "Lowest latency for users in Indonesia" → `asia-southeast2`.'
            },
            {
              kind: 'quiz',
              q: 'Which of these is a zonal resource?',
              options: ['A VPC network', 'A Compute Engine VM', 'A subnet', 'A custom image'],
              answer: 1,
              explain: 'A VM runs in one zone. VPC networks and images are global; subnets are regional.'
            }
          ]
        },
        {
          id: 'md1-hierarchy',
          title: 'S1-02 · Resource hierarchy and Cloud Identity',
          blocks: [
            {
              kind: 'p',
              text: 'The hierarchy is **Organization → Folders → Projects → Resources**. The organization node appears once you have **Cloud Identity** or **Google Workspace** for your domain. Folders group projects (by department, environment, team) and can nest. Every resource belongs to exactly one project.'
            },
            {
              kind: 'list',
              items: [
                '**IAM policies inherit downward** and add up: a role granted on a folder applies to every project in it. A grant lower down cannot take away a grant from higher up — only an **IAM deny policy** can.',
                '**Organization policies** restrict *what* can be configured, not *who*: e.g. `constraints/gcp.resourceLocations` (only allowed regions), `constraints/compute.vmExternalIpAccess` (no external IPs), `constraints/iam.disableServiceAccountKeyCreation`, `constraints/compute.requireOsLogin`. A child inherits the parent’s policy unless it overrides or merges it.',
                'Org policy administration needs **Organization Policy Administrator** (`roles/orgpolicy.policyAdmin`) at the organization.',
                'Moving a project to another folder changes what it inherits — immediately.'
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud Identity and getting users in',
              columns: ['Need', 'Use'],
              rows: [
                ['Users and groups without Gmail or Workspace licences', 'Cloud Identity Free (or Premium for device management)'],
                ['Users already in Active Directory / LDAP', '**Google Cloud Directory Sync (GCDS)** — one-way sync from AD to Cloud Identity'],
                ['Keep passwords in your own IdP', 'SAML **SSO** with Cloud Identity as the service provider'],
                ['No Google accounts at all, sign in with your IdP', '**Workforce Identity Federation**'],
                ['Give many people the same access', 'Put them in a **Google group** and grant the role to the group']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Apply the same access to every project of a department" → grant on the **folder**. "Prevent anyone from creating resources outside Jakarta and Singapore" → org policy `gcp.resourceLocations`. "Sync existing Active Directory users" → GCDS. "Employees should use corporate credentials" → SSO/SAML.'
            },
            {
              kind: 'quiz',
              q: 'A user has Editor on a folder. On a project inside it they only have Viewer. What can they do in the project?',
              options: ['Only view — the project grant wins', 'Edit — permissions inherited from the folder add to the project grant', 'Nothing until the grants are reconciled', 'Edit only if the project owner approves'],
              answer: 1,
              explain: 'Allow policies are a union down the hierarchy. The folder grant applies to the project; a smaller project grant does not reduce it.'
            }
          ]
        },
        {
          id: 'md1-projects',
          title: 'S1-03 · Projects, APIs and quotas',
          blocks: [
            {
              kind: 'table',
              caption: 'The three identifiers of a project',
              columns: ['Field', 'Can change?', 'Notes'],
              rows: [
                ['Project name', 'Yes', 'Display only, need not be unique'],
                ['Project ID', '**No**', 'Globally unique, chosen at creation, used in `gcloud` and URLs'],
                ['Project number', 'No', 'Assigned by Google; appears in service agent emails']
              ]
            },
            {
              kind: 'code',
              title: 'Create a project, link billing, enable APIs',
              lines: [
                '$ gcloud projects create ace-lab-123 --folder=123456789 --name="ACE Lab"',
                '$ gcloud billing projects link ace-lab-123 --billing-account=0X0X0X-0X0X0X-0X0X0X',
                '$ gcloud services enable compute.googleapis.com container.googleapis.com run.googleapis.com',
                '$ gcloud services list --enabled',
                '# Deleting a project shuts it down; it can be restored for 30 days',
                '$ gcloud projects delete ace-lab-123'
              ]
            },
            {
              kind: 'list',
              items: [
                'Most services must have their **API enabled** in the project before first use; "API not enabled" errors are fixed with `gcloud services enable`.',
                '**Quotas** cap usage per project (and often per region): **allocation quotas** (how many CPUs, IPs, GPUs) and **rate quotas** (API calls per minute). View and request increases in the console under **IAM & Admin → Quotas & system limits** (Cloud Quotas). GPU quotas often start at 0.',
                'A quota error in a new region → request a quota increase for that region; do not create another project to dodge it.',
                'Use **labels** (`env=prod`, `team=data`) on resources for cost breakdowns in billing reports.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Deploy fails with QUOTA_EXCEEDED for CPUS in asia-southeast2" → request a quota increase. "Error says the API has not been used in the project" → enable the API. "Rename the project ID" → impossible; create a new project.'
            },
            {
              kind: 'quiz',
              q: 'Which project identifier can you change after the project is created?',
              options: ['Project ID', 'Project number', 'Project name', 'None of them'],
              answer: 2,
              explain: 'Only the display name can change. The ID is fixed at creation and the number is assigned by Google.'
            }
          ]
        },
        {
          id: 'md1-iam',
          title: 'S1-04 · IAM foundations',
          blocks: [
            {
              kind: 'p',
              text: 'IAM answers **who** (principal) can do **what** (role = a set of permissions) on **which resource**. A binding joins a principal to a role on a resource; the set of bindings is the resource’s **allow policy**.'
            },
            {
              kind: 'table',
              caption: 'Role types',
              columns: ['Type', 'Example', 'Use when'],
              rows: [
                ['Basic', '`roles/owner`, `roles/editor`, `roles/viewer`', 'Almost never in production — too broad'],
                ['Predefined', '`roles/compute.instanceAdmin.v1`, `roles/storage.objectViewer`', 'Default choice: service-specific, maintained by Google'],
                ['Custom', '`projects/p/roles/vmStarter`', 'No predefined role is narrow enough. Created at **organization or project** level (not folder)']
              ]
            },
            {
              kind: 'table',
              caption: 'Principals',
              columns: ['Prefix', 'Who'],
              rows: [
                ['`user:`', 'A Google account (Cloud Identity / Workspace / Gmail)'],
                ['`group:`', 'A Google group — the recommended way to grant to people'],
                ['`serviceAccount:`', 'An application or VM identity'],
                ['`domain:`', 'Everyone in a Workspace / Cloud Identity domain'],
                ['`allUsers` / `allAuthenticatedUsers`', 'Anyone on the internet / anyone with a Google account — public']
              ]
            },
            {
              kind: 'code',
              title: 'Grant, check, remove',
              lines: [
                '$ gcloud projects add-iam-policy-binding ace-lab-123 \\',
                '    --member=group:data-team@example.com --role=roles/bigquery.dataViewer',
                '$ gcloud projects get-iam-policy ace-lab-123',
                '$ gcloud projects remove-iam-policy-binding ace-lab-123 \\',
                '    --member=user:ana@example.com --role=roles/editor',
                '# A custom role from a list of permissions',
                '$ gcloud iam roles create vmStarter --project=ace-lab-123 \\',
                '    --permissions=compute.instances.start,compute.instances.stop,compute.instances.get'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Least privilege**: the narrowest predefined role, on the lowest resource that works, granted to a group.',
                '**IAM Conditions** add time or resource limits to a binding (e.g. access only until a date, or only to resources whose name starts with `dev-`).',
                '**Service accounts**: for workloads, not people. Prefer attaching them to the VM / service over downloaded keys; to act as one, a user needs **Service Account User** (`roles/iam.serviceAccountUser`) on it, or **Service Account Token Creator** to impersonate it.',
                '**Policy Analyzer** and the **IAM recommender** show who has access and which grants are unused.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Answers that grant **Owner** or **Editor** are almost always wrong when a predefined role exists. "Auditor must view everything but change nothing" → Viewer (or a specific viewer role) — and for logs, **Private Logs Viewer** for Data Access logs. "Ten new analysts" → add them to the group that already has the role.'
            },
            {
              kind: 'quiz',
              q: 'Where can you NOT create a custom role?',
              options: ['Organization', 'Folder', 'Project', 'You can create one at all three'],
              answer: 1,
              explain: 'Custom roles exist at organization or project level only.'
            }
          ]
        },
        {
          id: 'md1-billing',
          title: 'S1-05 · Billing, cost governance and observability setup',
          blocks: [
            {
              kind: 'p',
              text: 'A **Cloud Billing account** pays for one or more projects. A project without a linked billing account cannot use paid services. Billing accounts can sit under the organization; **self-serve** accounts pay by card, **invoiced** accounts are set up with sales.'
            },
            {
              kind: 'table',
              caption: 'Billing roles',
              columns: ['Role', 'Granted on', 'Lets you'],
              rows: [
                ['Billing Account Administrator', 'Billing account', 'Manage the account, payment, users, budgets'],
                ['Billing Account User', 'Billing account', '**Link projects** to this account (with Project Billing Manager or Owner on the project)'],
                ['Billing Account Viewer', 'Billing account', 'See costs and transactions — finance / auditors'],
                ['Project Billing Manager', 'Project / folder / org', 'Link or unlink a project’s billing — without other project rights'],
                ['Billing Account Costs Manager', 'Billing account', 'Budgets and exports, no payment changes']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Budgets and alerts** email at thresholds (e.g. 50%, 90%, 100%, on actual or forecasted spend). They **do not stop spending**. To act automatically (e.g. disable billing, scale down), connect the budget to a **Pub/Sub topic** and react with a Cloud Run function.',
                '**Billing export to BigQuery** (standard usage cost, detailed usage cost, pricing) is how you analyse cost by project, label or SKU over time — enable it early; it is not backfilled.',
                '**Discounts**: sustained use discounts apply automatically to N1/N2 and similar; **committed use discounts** (1 or 3 years) for steady load; **Spot VMs** for interruptible work.',
                '**Observability setup**: Cloud Monitoring and Cloud Logging are on by default. A **metrics scope** lets one project see the metrics of many. Install the **Ops Agent** on VMs for memory, disk and application logs. Alerting policies send to **notification channels** (email, SMS, Slack, PagerDuty, Pub/Sub). Uptime checks probe public endpoints.'
              ]
            },
            {
              kind: 'code',
              title: 'Budget and Ops Agent',
              lines: [
                '$ gcloud billing budgets create --billing-account=0X0X0X-0X0X0X-0X0X0X \\',
                '    --display-name="lab budget" --budget-amount=100USD \\',
                '    --threshold-rule=percent=0.5 --threshold-rule=percent=0.9',
                '# On the VM:',
                '$ curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh',
                '$ sudo bash add-google-cloud-ops-agent-repo.sh --also-install'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Finance must see costs but not change anything" → Billing Account Viewer. "Developer needs to link a new project to billing" → Billing Account User on the billing account. "Analyse spend by team label every month" → billing export to BigQuery (+ Looker Studio). "Memory usage of the VM does not appear in Monitoring" → install the Ops Agent.'
            },
            {
              kind: 'quiz',
              q: 'A budget alert at 100% fires. What happens to the resources?',
              options: ['They are stopped', 'Billing is disabled', 'Nothing — alerts only notify', 'New resources are blocked'],
              answer: 2,
              explain: 'Budgets notify. Any automatic action needs Pub/Sub plus your own code.'
            }
          ]
        },
        {
          id: 'md1-lab',
          title: 'LAB01 · Initialise a project with least privilege',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Create the project in the right folder', text: 'So it inherits the folder’s policies.', code: ['gcloud projects create ace-lab-123 --folder=123456789'] },
                { title: 'Link billing', text: 'Needs Billing Account User on the account.', code: ['gcloud billing projects link ace-lab-123 --billing-account=0X0X0X-0X0X0X-0X0X0X'] },
                { title: 'Enable only the APIs you need', text: 'Fewer APIs, smaller attack surface.', code: ['gcloud services enable compute.googleapis.com'] },
                { title: 'Create a service account for the workload', text: 'Do not use the default Compute Engine service account, which has Editor in older projects.', code: ['gcloud iam service-accounts create web-sa --display-name="web app"'] },
                {
                  title: 'Grant it only what it needs',
                  text: 'For example, write logs and read one bucket.',
                  code: [
                    'gcloud projects add-iam-policy-binding ace-lab-123 --member=serviceAccount:web-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/logging.logWriter',
                    'gcloud storage buckets add-iam-policy-binding gs://ace-lab-assets --member=serviceAccount:web-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/storage.objectViewer'
                  ]
                },
                { title: 'Grant people through groups', text: 'Predefined roles on the project, to groups, never Owner for daily work.', code: ['gcloud projects add-iam-policy-binding ace-lab-123 --member=group:devs@example.com --role=roles/compute.instanceAdmin.v1'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Granting on a **bucket** instead of the project is narrower still — prefer the lowest resource that works.'
            }
          ]
        }
      ]
    },
    {
      id: 'md2-compute',
      title: 'MD2 · Compute Engine',
      sections: [
        {
          id: 's3-choose',
          title: 'S3-01 · Choosing a compute option',
          blocks: [
            {
              kind: 'table',
              caption: 'From most control to most managed',
              columns: ['Option', 'Pick it when', 'Exam cue'],
              rows: [
                ['Compute Engine', 'You need the OS: custom kernel, licences, lift-and-shift, GPUs with full control', '"Legacy app", "specific OS", "install agent", "lift and shift"'],
                ['GKE', 'Many containers, Kubernetes features, portability, stateful sets', '"Microservices on Kubernetes", "already use Kubernetes", "Helm"'],
                ['Cloud Run', 'A stateless container over HTTP or a job; scale to zero; pay per use', '"Container, no infrastructure to manage", "spiky traffic"'],
                ['Cloud Run functions', 'A small piece of code reacting to an event or an HTTP call', '"When a file is uploaded, run code", "lightweight"'],
                ['App Engine', 'Existing App Engine apps; a code-only web app', '"App Engine standard", "versions and traffic split"'],
                ['Agent Runtime', 'Host an AI agent (ADK, LangChain) without servers', '"Deploy an AI agent, managed sessions and memory"']
              ]
            },
            {
              kind: 'table',
              caption: 'Machine families (Compute Engine)',
              columns: ['Family', 'Series', 'Use'],
              rows: [
                ['General purpose', 'E2 (cheapest), N2, N4, C3, C4, Tau T2D', 'Web servers, dev, most apps'],
                ['Compute optimised', 'C2, C2D, H3', 'HPC, gaming, single-thread speed'],
                ['Memory optimised', 'M1, M2, M3', 'SAP HANA, large in-memory DBs'],
                ['Accelerator optimised', 'A2, A3 (NVIDIA A100/H100), G2 (L4)', 'ML training and inference, graphics']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Pick the **most managed** option that still meets the requirement. If the question says "no ops team" or "minimise management", Compute Engine is rarely right.'
            }
          ]
        },
        {
          id: 's3-launch',
          title: 'S3-02 · Launching instances, availability policies, SSH and remote access',
          blocks: [
            {
              kind: 'code',
              title: 'Create a VM',
              lines: [
                '$ gcloud compute instances create web-1 --zone=asia-southeast2-a \\',
                '    --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud \\',
                '    --boot-disk-size=20GB --tags=http-server \\',
                '    --service-account=web-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform \\',
                '    --metadata-from-file=startup-script=startup.sh'
              ]
            },
            {
              kind: 'table',
              caption: 'Availability policy',
              columns: ['Setting', 'Values', 'Meaning'],
              rows: [
                ['On host maintenance', '`MIGRATE` (default) / `TERMINATE`', 'Live-migrate the VM during Google maintenance, or stop it. VMs with GPUs must use **TERMINATE**'],
                ['Automatic restart', '`true` (default) / `false`', 'Restart the VM if it crashes or the host fails'],
                ['Provisioning model', '`STANDARD` / `SPOT`', 'Spot VMs cannot live-migrate or auto-restart']
              ]
            },
            {
              kind: 'table',
              caption: 'Getting into a VM',
              columns: ['Way', 'How', 'Notes'],
              rows: [
                ['SSH in the browser', 'Console → SSH button', 'Uses OS Login or metadata keys for you'],
                ['gcloud', '`gcloud compute ssh web-1 --zone=asia-southeast2-a`', 'Generates and pushes a key'],
                ['IAP TCP forwarding', '`gcloud compute ssh web-1 --tunnel-through-iap`', 'For VMs **without an external IP**. Allow ingress tcp:22 from `35.235.240.0/20`; user needs **IAP-secured Tunnel User**'],
                ['Serial console', '`gcloud compute connect-to-serial-port web-1`', 'When the network or SSH daemon is broken'],
                ['Windows RDP', '`gcloud compute reset-windows-password web-win`', 'Then RDP on tcp:3389']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"VMs have no public IP but admins need SSH" → IAP TCP forwarding + firewall from 35.235.240.0/20. "Run a command on every boot" → startup script in metadata. "SSH times out" → check a firewall rule for tcp:22 first.'
            },
            {
              kind: 'quiz',
              q: 'Which source range must a firewall rule allow for SSH through IAP?',
              options: ['0.0.0.0/0', '35.235.240.0/20', '130.211.0.0/22', '10.128.0.0/9'],
              answer: 1,
              explain: '35.235.240.0/20 is the IAP TCP forwarding range. 130.211.0.0/22 is a health check range.'
            }
          ]
        },
        {
          id: 's3-spot',
          title: 'S3-03 · Spot VMs, custom machine types, OS Login and VM Manager',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Spot VMs**: 60–91% cheaper, can be preempted at any time with a 30-second notice, **no 24-hour limit** (that was the old preemptible VM). On preemption they **STOP** or **DELETE** (`--instance-termination-action`). Good for batch, rendering, CI, fault-tolerant work — never for a single production database.',
                '**Custom machine types**: choose vCPUs and memory yourself when no predefined shape fits (e.g. 6 vCPUs and 20 GB). Extended memory goes past the normal per-vCPU limit.',
                '**OS Login** ties SSH access to IAM instead of keys in metadata. Turn it on with metadata `enable-oslogin=TRUE` (project or instance) or enforce with org policy `compute.requireOsLogin`. Roles: **Compute OS Login** (`roles/compute.osLogin`, normal user) or **Compute OS Admin Login** (`roles/compute.osAdminLogin`, sudo). Supports 2-step verification. Users outside the organization also need `roles/compute.osLoginExternalUser`.',
                '**VM Manager**: **patch management** (patch jobs, scheduled patch deployments), **OS inventory**, **OS policies**. Needs the OS Config agent (in most Google images), the OS Config API, and metadata `enable-osconfig=TRUE`.'
              ]
            },
            {
              kind: 'code',
              title: 'Spot, custom shape, OS Login',
              lines: [
                '$ gcloud compute instances create render-1 --zone=asia-southeast2-a \\',
                '    --provisioning-model=SPOT --instance-termination-action=STOP',
                '$ gcloud compute instances create app-1 --zone=asia-southeast2-a \\',
                '    --custom-cpu=6 --custom-memory=20GB',
                '$ gcloud compute project-info add-metadata --metadata=enable-oslogin=TRUE',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 \\',
                '    --member=group:ops@example.com --role=roles/compute.osAdminLogin'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Cheapest for a fault-tolerant batch job" → Spot VMs (in a MIG so they are recreated). "Revoke SSH for a leaving employee across all VMs at once" → OS Login (remove their IAM role). "Needs sudo" → osAdminLogin. "Patch all VMs every Sunday and report" → VM Manager patch deployment.'
            },
            {
              kind: 'quiz',
              q: 'What happens to a Spot VM after 24 hours of running?',
              options: ['It is preempted', 'It keeps running — Spot VMs have no maximum runtime', 'It converts to a standard VM', 'It is live-migrated'],
              answer: 1,
              explain: 'The 24-hour cap belonged to preemptible VMs. Spot VMs run until Compute Engine needs the capacity back.'
            }
          ]
        }
      ]
    },
    {
      id: 'md2-storage',
      title: 'MD2 · Disks, snapshots and instance groups',
      sections: [
        {
          id: 's4-disks',
          title: 'S4-01 · Persistent Disk and Hyperdisk',
          blocks: [
            {
              kind: 'table',
              caption: 'Block storage for VMs',
              columns: ['Type', 'Performance', 'Use'],
              rows: [
                ['`pd-standard`', 'HDD, cheapest', 'Bulk, sequential, backups'],
                ['`pd-balanced`', 'SSD, balanced price/IOPS (boot default)', 'Most workloads'],
                ['`pd-ssd`', 'SSD, high IOPS', 'Databases'],
                ['`pd-extreme`', 'Provisioned IOPS', 'Very demanding databases (older series)'],
                ['Hyperdisk Balanced / Throughput / Extreme / ML', 'IOPS and throughput **provisioned separately from size**, changeable live', 'Newest series (C3, C4, N4, M3, A3); scale performance without growing capacity'],
                ['Regional PD / Hyperdisk Balanced HA', 'Synchronous copy in **two zones**', 'Survive a zone failure with no data loss'],
                ['Local SSD', 'Physically attached, fastest', '**Ephemeral** — data is lost when the VM stops; scratch and cache only']
              ]
            },
            {
              kind: 'list',
              items: [
                'Disks can be **grown, never shrunk**: `gcloud compute disks resize data-1 --size=500GB`, then grow the partition and file system inside the OS (`resize2fs`, `xfs_growfs`). No reboot needed.',
                'A disk can be attached **read-write to one VM**, or **read-only to many** (multi-writer exists for some types).',
                'Disks are encrypted at rest by default; use **CMEK** (Cloud KMS) or CSEK when you must hold the key.',
                'Moving a VM to another zone: snapshot the disk → create a disk from it in the new zone → create the VM (or `gcloud compute instances move` for some cases).'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Database needs more IOPS without buying more capacity" → Hyperdisk (provision IOPS). "Disk is full" → resize the disk, then the file system. "Fastest temporary scratch space" → Local SSD. "Zone outage must not lose data" → regional disk.'
            }
          ]
        },
        {
          id: 's4-snapshots',
          title: 'S4-02 · Snapshots, images and snapshot schedules',
          blocks: [
            {
              kind: 'table',
              caption: 'Which copy for which job',
              columns: ['Thing', 'What it holds', 'Use for'],
              rows: [
                ['Snapshot', 'One disk, **incremental** after the first', 'Backup and restore, move a disk to another zone/region'],
                ['Snapshot schedule', 'A resource policy: how often, retention, location', 'Automatic backups'],
                ['Instant snapshot', 'Fast in-zone point-in-time copy', 'Quick rollback before a risky change'],
                ['Custom image', 'A bootable disk image', 'Create many identical VMs; share with other projects'],
                ['Image family', 'Points to the newest non-deprecated image', 'Always boot the latest version of your image'],
                ['Machine image', 'A whole VM: all disks, metadata, machine type', 'Clone or back up a complete VM']
              ]
            },
            {
              kind: 'code',
              title: 'Snapshots, a schedule, an image',
              lines: [
                '$ gcloud compute snapshots create db-before-upgrade --source-disk=db-1 --source-disk-zone=asia-southeast2-a',
                '$ gcloud compute resource-policies create snapshot-schedule daily-7d --region=asia-southeast2 \\',
                '    --daily-schedule --start-time=18:00 --max-retention-days=7',
                '$ gcloud compute disks add-resource-policies db-1 --resource-policies=daily-7d --zone=asia-southeast2-a',
                '$ gcloud compute images create web-v2 --source-disk=web-1 --source-disk-zone=asia-southeast2-a --family=web',
                '# Share the image: grant Compute Image User in the other project',
                '$ gcloud compute images add-iam-policy-binding web-v2 \\',
                '    --member=serviceAccount:123@cloudservices.gserviceaccount.com --role=roles/compute.imageUser'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Back up a disk every day, keep 7 days, least effort" → snapshot schedule. "Developers in another project must use our hardened image" → share it with `roles/compute.imageUser`. "Always use the latest image in a template" → image family. Deleting a snapshot never breaks the others — data still needed is moved to the next one.'
            },
            {
              kind: 'quiz',
              q: 'You need a copy of a VM including both its disks and its machine type. What do you create?',
              options: ['A snapshot of the boot disk', 'A custom image', 'A machine image', 'An instance template'],
              answer: 2,
              explain: 'A machine image captures every disk plus configuration. A snapshot or image covers one disk; a template holds configuration only, no data.'
            }
          ]
        },
        {
          id: 's4-mig',
          title: 'S4-03 · Instance templates, MIGs and autoscaling',
          blocks: [
            {
              kind: 'list',
              items: [
                'An **instance template** is the recipe for a VM (machine type, image, disks, network, metadata, service account). Templates are **immutable** — to change, create a new one and roll it out.',
                'A **managed instance group (MIG)** keeps N identical VMs from one template: **autoscaling**, **autohealing** (recreate a VM that fails a health check), **rolling updates**, and load balancer integration. **Zonal** MIG = one zone; **regional** MIG = spread over up to three zones (better availability).',
                '**Unmanaged** instance groups only group different VMs for a load balancer — no autoscaling, no autohealing, no templates.',
                'Autoscaling signals: **CPU utilisation**, **load balancer serving capacity**, **Cloud Monitoring metrics** (e.g. Pub/Sub queue size), and **schedules**. Set an **initialization period** so new VMs are not judged before they boot.',
                'Autohealing needs a **health check** and a firewall rule allowing the health check ranges `35.191.0.0/16` and `130.211.0.0/22`. Give the health check an initial delay long enough for startup.',
                '**Stateful MIGs** keep disks and names for databases and other stateful apps.'
              ]
            },
            {
              kind: 'code',
              title: 'Template → MIG → autoscaling → rolling update',
              lines: [
                '$ gcloud compute instance-templates create web-v1 --machine-type=e2-medium \\',
                '    --image-family=web --tags=http-server',
                '$ gcloud compute instance-groups managed create web-mig --region=asia-southeast2 \\',
                '    --template=web-v1 --size=3 --health-check=web-hc --initial-delay=120',
                '$ gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 \\',
                '    --min-num-replicas=3 --max-num-replicas=10 --target-cpu-utilization=0.6',
                '$ gcloud compute instance-groups managed rolling-action start-update web-mig --region=asia-southeast2 \\',
                '    --version=template=web-v2 --max-surge=3 --max-unavailable=0',
                '# Canary: 10% of VMs on the new template',
                '$ gcloud compute instance-groups managed rolling-action start-update web-mig --region=asia-southeast2 \\',
                '    --version=template=web-v1 --canary-version=template=web-v2,target-size=10%'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Recreate VMs whose application hangs" → autohealing with a health check (not just restart). "Update with no capacity loss" → `--max-unavailable=0` with surge. "Scale on queue length" → autoscale on a Cloud Monitoring metric. "VMs keep being recreated in a loop" → health check initial delay too short or firewall blocking the health checker.'
            },
            {
              kind: 'quiz',
              q: 'What must you do to change the machine type of every VM in a MIG?',
              options: ['Edit the instance template', 'Create a new template and start a rolling update', 'Resize each VM in place', 'Change the autoscaler'],
              answer: 1,
              explain: 'Templates are immutable; make a new one and roll the group onto it.'
            }
          ]
        }
      ]
    },
    {
      id: 'md2-gke',
      title: 'MD2 · Google Kubernetes Engine',
      sections: [
        {
          id: 's6-types',
          title: 'S6-01 · Cluster types: Autopilot, regional, private',
          blocks: [
            {
              kind: 'table',
              caption: 'Autopilot vs Standard',
              columns: ['', 'Autopilot', 'Standard'],
              rows: [
                ['Nodes', 'Managed by Google, you never see node pools', 'You create and size node pools'],
                ['Billing', 'Per Pod **resource requests**', 'Per node (VM), used or not'],
                ['Location', 'Always **regional**', 'Zonal or regional'],
                ['Security defaults', 'Workload Identity Federation for GKE, Shielded nodes, no SSH to nodes', 'You choose'],
                ['Pick when', 'You want Kubernetes without node operations — the recommended default', 'You need node-level control (special kernels, DaemonSets with privileges, specific machine shapes)']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Zonal** cluster: one control plane in one zone — a zone outage takes down the API. **Multi-zonal**: one control plane, nodes in several zones. **Regional**: control plane **and** nodes replicated across three zones — highest availability. With `--num-nodes=1` a regional cluster gets 1 node **per zone** (3 total).',
                '**Private cluster** (private nodes): nodes have only internal IPs. Use **Cloud NAT** for outbound internet (pulling public images). The control plane can have a private endpoint; restrict a public one with **authorized networks**.',
                '**Release channels** (Rapid, Regular, Stable, Extended) handle automatic upgrades; **maintenance windows and exclusions** decide when.'
              ]
            },
            {
              kind: 'code',
              title: 'Create clusters',
              lines: [
                '$ gcloud container clusters create-auto shop --region=asia-southeast2',
                '$ gcloud container clusters create shop-std --region=asia-southeast2 --num-nodes=1 \\',
                '    --enable-private-nodes --master-ipv4-cidr=172.16.0.0/28 --enable-ip-alias \\',
                '    --release-channel=regular',
                '$ gcloud container clusters get-credentials shop --region=asia-southeast2'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Minimise operational overhead" → Autopilot. "Control plane must survive a zone outage" → regional cluster. "Nodes must not have public IPs" → private nodes (+ Cloud NAT to reach the internet). "Pods in a private cluster cannot pull from Docker Hub" → Cloud NAT.'
            }
          ]
        },
        {
          id: 's6-workloads',
          title: 'S6-02 · kubectl, workloads, Services, StatefulSets and Artifact Registry',
          blocks: [
            {
              kind: 'table',
              caption: 'Workload objects',
              columns: ['Object', 'Use'],
              rows: [
                ['Deployment', 'Stateless replicas; rolling updates and rollback'],
                ['StatefulSet', 'Stable names (`db-0`, `db-1`), ordered start, **one PersistentVolumeClaim per Pod** (`volumeClaimTemplates`); databases, Kafka'],
                ['DaemonSet', 'One Pod per node: log or monitoring agents'],
                ['Job / CronJob', 'Run to completion / on a schedule']
              ]
            },
            {
              kind: 'table',
              caption: 'Services and how they are reached',
              columns: ['Type', 'Reachable from', 'Creates'],
              rows: [
                ['ClusterIP (default)', 'Inside the cluster only', 'A virtual IP'],
                ['NodePort', 'Each node’s IP on a port 30000–32767', 'Node ports'],
                ['LoadBalancer', 'Internet (or VPC with the internal annotation)', 'A passthrough **Network Load Balancer**, L4'],
                ['Headless (`clusterIP: None`)', 'DNS per Pod', 'Used with StatefulSets'],
                ['Ingress / Gateway', 'Internet, HTTP(S), path and host rules', 'An **Application Load Balancer**, L7']
              ]
            },
            {
              kind: 'code',
              title: 'kubectl you should recognise',
              lines: [
                '$ kubectl create deployment web --image=asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '$ kubectl scale deployment web --replicas=5',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                '$ kubectl set image deployment/web web=asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v2',
                '$ kubectl rollout status deployment/web',
                '$ kubectl rollout undo deployment/web',
                '$ kubectl get pods -o wide',
                '$ kubectl describe pod web-7d4b9-abcde',
                '$ kubectl logs web-7d4b9-abcde',
                '$ kubectl apply -f statefulset.yaml'
              ]
            },
            {
              kind: 'code',
              title: 'Artifact Registry (Container Registry is retired)',
              lines: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=asia-southeast2',
                '$ gcloud auth configure-docker asia-southeast2-docker.pkg.dev',
                '$ docker push asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '# Or build in the cloud',
                '$ gcloud builds submit --tag asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v1'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Each replica needs its own disk and stable name" → StatefulSet. "Expose on the internet with path-based routing" → Ingress (Application LB). "ImagePullBackOff from another project’s repository" → grant **Artifact Registry Reader** to the node / workload service account. "Roll back a bad release" → `kubectl rollout undo`.'
            },
            {
              kind: 'quiz',
              q: 'A Service of type LoadBalancer on GKE creates which load balancer?',
              options: ['A global external Application Load Balancer', 'A passthrough Network Load Balancer', 'An internal proxy Network Load Balancer', 'No load balancer — only a node port'],
              answer: 1,
              explain: 'LoadBalancer Services get a layer 4 passthrough Network Load Balancer. HTTP(S) routing at layer 7 comes from Ingress or Gateway.'
            }
          ]
        },
        {
          id: 's6-scaling',
          title: 'S6-03 · Node pools, HPA/VPA and Autopilot resource requests',
          blocks: [
            {
              kind: 'list',
              items: [
                'A **node pool** is a group of identical nodes in a Standard cluster. Add one for different needs: GPUs, Spot nodes, more memory. Steer Pods to it with `nodeSelector` / affinity and taints + tolerations.',
                '**Cluster autoscaler** adds and removes **nodes** when Pods cannot be scheduled or nodes are underused (`--enable-autoscaling --min-nodes --max-nodes`, per zone). **Node auto-provisioning** creates whole node pools as needed.',
                '**HPA** (Horizontal Pod Autoscaler) changes the **number of Pods** on CPU, memory or custom metrics. **VPA** (Vertical) changes Pods’ **requests**. Do not run HPA and VPA on the same CPU/memory metric.',
                '**Autopilot** bills on requests: set `resources.requests` on every container. If you leave them out, defaults apply (0.5 vCPU, 2 GiB); limits are set equal to requests. **Compute classes** (e.g. Balanced, Scale-Out, Performance, Accelerator) select hardware.',
                'HPA needs **requests** set, because utilisation is measured as a percentage of the request.'
              ]
            },
            {
              kind: 'code',
              title: 'Node pool and autoscaling',
              lines: [
                '$ gcloud container node-pools create spot-pool --cluster=shop-std --region=asia-southeast2 \\',
                '    --spot --machine-type=e2-standard-4 --enable-autoscaling --min-nodes=0 --max-nodes=5',
                '$ gcloud container clusters update shop-std --region=asia-southeast2 \\',
                '    --enable-autoscaling --node-pool=default-pool --min-nodes=1 --max-nodes=4',
                '$ kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10',
                '$ kubectl get hpa'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Pods stay Pending because nodes are full" → cluster autoscaler (Standard) — Autopilot does this for you. "Traffic spikes, add Pods" → HPA. "Not sure what CPU/memory to request" → VPA in recommendation mode. "Some workloads need GPUs" → a separate GPU node pool.'
            },
            {
              kind: 'quiz',
              q: 'Which autoscaler adds nodes to a GKE Standard cluster?',
              options: ['Horizontal Pod Autoscaler', 'Vertical Pod Autoscaler', 'Cluster autoscaler', 'MIG autoscaler set by you'],
              answer: 2,
              explain: 'HPA and VPA act on Pods; the cluster autoscaler adds and removes nodes.'
            }
          ]
        }
      ]
    },
    {
      id: 'md2-serverless',
      title: 'MD2 · Serverless, events, accelerators and dev tools',
      sections: [
        {
          id: 's7-run',
          title: 'S7-01 · Cloud Run and Cloud Run functions: revisions, traffic, autoscaling',
          blocks: [
            {
              kind: 'list',
              items: [
                'Every deploy or configuration change creates a new **immutable revision**. The service URL stays the same; you choose which revisions get traffic.',
                '**Traffic splitting** for canaries and blue/green; **tags** give a revision its own URL for testing before it gets traffic. **Rollback** = send 100% to the old revision.',
                'Autoscaling: from **0** up to **max instances**; **min instances** removes cold starts (you pay for them idle); **concurrency** (default 80, up to 1000) is how many requests one instance handles at once.',
                'Billing: **request-based** (CPU only during requests, default) or **instance-based** (CPU always allocated — for background work).',
                '**Cloud Run functions** (formerly Cloud Functions 2nd gen) are functions deployed as Cloud Run services: HTTP triggers or event triggers through Eventarc.',
                'Public access: `--allow-unauthenticated` grants `roles/run.invoker` to `allUsers`. Private: grant `roles/run.invoker` to the calling service account.'
              ]
            },
            {
              kind: 'code',
              title: 'Deploy, canary, rollback',
              lines: [
                '$ gcloud run deploy shop --image=asia-southeast2-docker.pkg.dev/ace-lab-123/apps/shop:v1 \\',
                '    --region=asia-southeast2 --allow-unauthenticated --min-instances=1 --max-instances=20',
                '# New version with no traffic, tagged for testing at https://green---shop-xyz.a.run.app',
                '$ gcloud run deploy shop --image=.../shop:v2 --region=asia-southeast2 --no-traffic --tag=green',
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-tags=green=10',
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-latest',
                '# Rollback',
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-revisions=shop-00001-abc=100',
                '# A function from source',
                '$ gcloud functions deploy resize --gen2 --runtime=python312 --region=asia-southeast2 \\',
                '    --trigger-bucket=ace-lab-uploads --entry-point=resize'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Test the new version on 10% of users" → `update-traffic --to-revisions` or `--to-tags`. "Test before any user sees it" → `--no-traffic --tag`. "First request is slow" → min instances. "Database runs out of connections" → lower max instances or concurrency.'
            },
            {
              kind: 'quiz',
              q: 'How do you deploy a new Cloud Run revision without sending it any traffic?',
              options: ['`--max-instances=0`', '`--no-traffic`', '`--min-instances=0`', 'Deploy it to a different region'],
              answer: 1,
              explain: '`--no-traffic` keeps traffic on the current revision; add `--tag` to get a test URL for the new one.'
            }
          ]
        },
        {
          id: 's7-events',
          title: 'S7-02 · Event processing: Pub/Sub, Cloud Storage notifications, Eventarc',
          blocks: [
            {
              kind: 'table',
              caption: 'Pub/Sub subscription types',
              columns: ['Type', 'How messages arrive', 'Use'],
              rows: [
                ['Pull', 'The subscriber asks for messages', 'Workers that control their own pace; high throughput'],
                ['Push', 'Pub/Sub sends HTTPS POST to an endpoint', 'Cloud Run / App Engine endpoints'],
                ['BigQuery', 'Written straight into a table', 'Streaming analytics without code'],
                ['Cloud Storage', 'Written as files to a bucket', 'Archiving streams']
              ]
            },
            {
              kind: 'list',
              items: [
                'Delivery is **at least once**: subscribers must handle duplicates (idempotent). Unacked messages are redelivered after the **ack deadline**. Retention is 7 days by default.',
                '**Dead-letter topics** catch messages that fail repeatedly. **Ordering keys** keep order per key. **Exactly-once delivery** exists for pull subscriptions.',
                'Every subscription gets **every** message (fan-out); several subscribers on **one** subscription share the messages (load balancing).',
                '**Cloud Storage → Pub/Sub notifications** publish an event when an object changes (`OBJECT_FINALIZE` on upload, `OBJECT_DELETE`, …).',
                '**Eventarc** routes events from Google sources (Cloud Storage, Pub/Sub, 100+ services through Cloud Audit Logs) to **Cloud Run, Cloud Run functions, Workflows or GKE**. The trigger’s service account needs `roles/eventarc.eventReceiver` and `roles/run.invoker`; for Cloud Storage triggers, the Cloud Storage service agent needs `roles/pubsub.publisher`.'
              ]
            },
            {
              kind: 'code',
              title: 'Topic, subscription, bucket notification, Eventarc trigger',
              lines: [
                '$ gcloud pubsub topics create orders',
                '$ gcloud pubsub subscriptions create orders-worker --topic=orders --ack-deadline=60 \\',
                '    --dead-letter-topic=orders-dlq --max-delivery-attempts=5',
                '$ gcloud storage buckets notifications create gs://ace-lab-uploads --topic=uploads --event-types=OBJECT_FINALIZE',
                '$ gcloud eventarc triggers create on-upload --location=asia-southeast2 \\',
                '    --destination-run-service=thumbnailer --destination-run-region=asia-southeast2 \\',
                '    --event-filters="type=google.cloud.storage.object.v1.finalized" \\',
                '    --event-filters="bucket=ace-lab-uploads" \\',
                '    --service-account=events-sa@ace-lab-123.iam.gserviceaccount.com'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Decouple the order service from the email service" → Pub/Sub. "Process every uploaded image" → Eventarc / a function triggered on Cloud Storage finalize. "Messages processed twice" → make the handler idempotent (at-least-once). "Push subscription gets 403 from Cloud Run" → give the push service account `run.invoker`.'
            }
          ]
        },
        {
          id: 's7-accel',
          title: 'S7-03 · GPUs vs TPUs, Agent Runtime, Cloud Workstations',
          blocks: [
            {
              kind: 'table',
              caption: 'Accelerators',
              columns: ['', 'GPU', 'TPU'],
              rows: [
                ['What', 'NVIDIA GPUs (L4, A100, H100, …)', 'Google’s chips for matrix maths (Cloud TPU)'],
                ['Good at', 'General ML, graphics, CUDA code, inference, video', 'Training and serving very large models in JAX, TensorFlow, PyTorch/XLA'],
                ['How', 'A2/A3/G2 machine types, or attach to N1; GKE GPU node pools; GPUs on Cloud Run', 'TPU VMs, TPU slices on GKE'],
                ['Watch out', 'Zonal availability, **quota starts at 0**, on-host maintenance must be **TERMINATE**', 'Only some zones; code must use XLA-friendly frameworks']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Agent Runtime** on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine) hosts AI agents built with the Agent Development Kit or LangChain: you deploy from the SDK, it scales and keeps sessions and memory.',
                '**Cloud Workstations**: managed development environments in your VPC, opened in the browser or a local IDE. Admins create a **cluster** (region + VPC) → **configurations** (machine type, container image, persistent disk, idle timeout) → developers create **workstations** from them. Developers need `roles/workstations.user`. Code stays off laptops.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Train a huge TensorFlow/JAX model cost-effectively" → TPU. "Existing CUDA code" → GPU. "GPU VM cannot be created: quota 0" → request GPU quota in that region. "Consistent, secure dev environments, no source on laptops" → Cloud Workstations. "Host an AI agent without managing servers" → Agent Runtime.'
            },
            {
              kind: 'quiz',
              q: 'Which on-host maintenance setting must a VM with an attached GPU use?',
              options: ['MIGRATE', 'TERMINATE', 'RESTART', 'Either — GPUs support live migration'],
              answer: 1,
              explain: 'Most GPU VMs cannot live-migrate, so maintenance terminates them; keep automatic restart on.'
            }
          ]
        }
      ]
    },
    {
      id: 'day',
      title: 'On the day',
      sections: [
        {
          id: 'day-method',
          title: 'Method for 50 questions in 60 minutes',
          blocks: [
            {
              kind: 'list',
              ordered: true,
              items: [
                '**Budget 70 seconds a question.** At question 25 you should be at about 30 minutes.',
                '**Read the last line first** — it says what is being optimised: cost, least privilege, fewest steps, availability, least management.',
                '**Cross out two options** that are wrong on a fact (a role that does not exist, a flag on the wrong product). Choose between the last two on the cue word.',
                '**Mark and move on** when stuck for more than 90 seconds; come back at the end.',
                'For "choose two", both picks must be right; they usually cover two different parts of the problem.'
              ]
            },
            {
              kind: 'table',
              caption: 'Cue → answer, the fast list',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['least privilege', 'Predefined role, lowest resource, to a group or service account'],
                ['minimise operational overhead', 'Managed service: Autopilot, Cloud Run, managed MIG'],
                ['most cost-effective, can be interrupted', 'Spot VMs / Spot node pool'],
                ['no data loss if a zone fails', 'Regional disk / regional cluster / regional MIG'],
                ['no external IP but needs SSH', 'IAP TCP forwarding, 35.235.240.0/20'],
                ['revoke SSH quickly', 'OS Login + IAM'],
                ['daily backup, keep N days', 'Snapshot schedule'],
                ['change every VM in a group', 'New instance template + rolling update'],
                ['canary on Cloud Run', '`update-traffic` with a percentage or tag'],
                ['react to an uploaded file', 'Eventarc or Cloud Storage trigger'],
                ['budget must stop spending', 'Budget → Pub/Sub → function (budgets alone only notify)'],
                ['restrict regions for everyone', 'Organization policy `gcp.resourceLocations`']
              ]
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: Compute Engine', href: '#/ace/lab/cmd/compute', note: 'instances, disks, snapshots, MIGs' },
    { label: 'Command quiz: GKE', href: '#/ace/lab/cmd/gke', note: 'clusters, node pools, kubectl' },
    { label: 'Command quiz: Cloud Run, functions and App Engine', href: '#/ace/lab/cmd/serverless', note: 'deploy, traffic, triggers' },
    { label: 'Deep dive: the ACE exam guide', href: '#/ace/learn/ace-guide', note: 'every consideration, explained' },
    { label: 'Deep dive: Cloud Run', href: '#/ace/learn/cloud-run', note: 'revisions, scaling, IAM' },
    { label: 'Deep dive: GKE', href: '#/ace/learn/gke', note: 'Autopilot, kubectl, case studies' }
  ]
};
