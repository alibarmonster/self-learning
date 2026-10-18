/**
 * Associate Cloud Engineer cheat sheet. Plain data, rendered by
 * Cheatsheet.svelte — same contract as the CDL sheet: a group may carry a
 * decision `path`, one table as `columns`/`rows`, several captioned `tables`,
 * `bullets` (a string or a [term, text] pair) and a closing `tip`.
 *
 * ACE is a doing exam rather than a choosing exam, so the decision tables are
 * shorter than the CDL ones and the reference half is much longer: limits,
 * flags, states, access modes and the commands themselves.
 */

import type { Cheatsheet } from '@/types';

export const cheatsheet: Cheatsheet = {
  title: 'The console, condensed',
  intro:
    'Three parts. The decision tables answer "which service for this workload" — read one top to bottom and stop at the first line that matches. The reference half is the detail this exam actually turns on: role types, machine families, instance states, route order, access modes, log types and the commands. The last part is the paper itself. Filter to jump to a term.',
  parts: [
    {
      id: 'choose',
      title: 'Choosing between the services',
      blurb:
        'Choosing is now half of the planning-and-implementing section, the joint-largest at 30% of the paper — and these choices come up inside the build questions too.'
    },
    {
      id: 'reference',
      title: 'Configuration and operations',
      blurb:
        'Implementing and operating make up most of the paper. This is the part you cannot answer from first principles — it has to be known.'
    },
    {
      id: 'sitting',
      title: 'Sitting the exam',
      blurb: 'What the paper is, how it is weighted, and how to work through it.'
    }
  ],
  groups: [
    {
      id: 'compute',
      part: 'choose',
      title: 'Which compute service?',
      note: 'From most control to least. Take the most managed option that still meets the constraint in the question — but watch for a constraint that forces a VM, like a specific kernel, a licence or a GPU.',
      path: [
        ['Needs a specific OS, kernel, licence, GPU or full control', 'Compute Engine'],
        ['Existing containers, needs the Kubernetes API, node-level control', 'GKE'],
        ['A container, scale to zero, no cluster to run', 'Cloud Run'],
        ['A single function reacting to an event (Pub/Sub, Cloud Storage, HTTP)', 'Cloud Functions'],
        ['Web app from source, versions and traffic splitting, no containers named', 'App Engine'],
        ['Batch work that tolerates being interrupted, cheapest possible', 'Preemptible / Spot VMs'],
        ['Licensing needs a whole physical host to itself', 'Sole-tenant nodes']
      ],
      columns: ['Service', 'Model', 'Pick it when', 'Watch for'],
      rows: [
        ['Compute Engine', 'IaaS VMs', 'OS-level control, legacy or licensed software, GPUs, lift and shift', 'Anything worded "without managing servers"'],
        ['GKE', 'Managed Kubernetes (CaaS)', 'Container orchestration, node pools, autoscaling, hybrid portability', 'A single small service — Cloud Run is less work'],
        ['Cloud Run', 'Serverless containers', 'Any container, HTTP or event driven, scales to zero, per-request billing', 'Long-lived stateful processes'],
        ['Cloud Functions', 'FaaS', 'One small function per event; Python, Node, Go, Java, .NET', 'Whole applications; long-running jobs'],
        ['App Engine Standard', 'PaaS sandbox', 'Sudden spiky traffic, free tier, instance-hour pricing', 'Custom runtimes or native libraries'],
        ['App Engine Flexible', 'PaaS on containers', 'Steady traffic, any runtime version, background processes', 'No free quota; slower to scale']
      ]
    },
    {
      id: 'storage',
      part: 'choose',
      title: 'Which storage or database?',
      note: 'Decide the shape of the data first — objects, files, blocks, rows, documents — then the scale, then transactional against analytical.',
      path: [
        ['Objects: files, images, video, backups, static assets', 'Cloud Storage'],
        ['A filesystem several VMs mount at once (NFS)', 'Filestore'],
        ['A disk attached to one VM', 'Persistent Disk (or Local SSD for scratch)'],
        ['Relational, one region, ordinary scale, MySQL / PostgreSQL / SQL Server', 'Cloud SQL'],
        ['Relational, global, horizontally scalable, strong consistency', 'Cloud Spanner'],
        ['NoSQL wide-column, huge write throughput, time series or IoT', 'Bigtable'],
        ['NoSQL documents for a web or mobile app, live sync, offline', 'Firestore'],
        ['Cache or session store in memory', 'Memorystore (Redis / Memcached)'],
        ['Analytics over huge datasets with SQL, serverless warehouse', 'BigQuery']
      ],
      columns: ['Product', 'Model', 'Pick it when', 'Not for'],
      rows: [
        ['Cloud Storage', 'Object', 'Unstructured data of any size, lifecycle rules, content delivery', 'Row queries or transactions; it is not mountable or bootable'],
        ['Filestore', 'File (NFS)', 'Managed NAS shared across instances or GKE pods', 'Object data; single-VM disks'],
        ['Persistent Disk', 'Block', 'Boot and data disks; zonal or regional; standard, balanced or SSD', 'Sharing one disk read-write across many VMs'],
        ['Cloud SQL', 'Managed relational', 'Existing relational app, read replicas, HA, point-in-time recovery', 'Global writes; petabyte analytics; 30 TB ceiling'],
        ['Cloud Spanner', 'Distributed relational', 'Global ACID and SQL together; up to 99.999% availability', 'Small apps — Cloud SQL is far cheaper'],
        ['Bigtable', 'NoSQL wide-column', 'Terabytes to petabytes, low latency, single-keyed rows, regional', 'Joins, SQL, multi-row transactions'],
        ['Firestore', 'NoSQL document', 'Mobile and web app data, realtime updates, offline support', 'Heavy analytics; wide-column throughput'],
        ['Memorystore', 'In-memory', 'Caching, leaderboards, sessions', 'A durable system of record'],
        ['BigQuery', 'Serverless warehouse', 'Standard SQL analytics at scale, streaming inserts, external tables', 'Serving an application’s transactions']
      ]
    },
    {
      id: 'storage-classes',
      part: 'choose',
      title: 'Which Cloud Storage class?',
      note: 'Same durability, same API, same immediate access on all four. They differ in price per GB, retrieval cost and minimum storage duration — match the class to how often the data is read, and remember the minimum is charged even if you delete early.',
      path: [
        ['Read often — active content, analytics, transcoding', 'Standard (no minimum)'],
        ['Read about once a month — backups, long-tail media', 'Nearline (30-day minimum)'],
        ['Read about once a quarter — DR copies, older backups', 'Coldline (90-day minimum)'],
        ['Read less than once a year — archives, compliance', 'Archive (365-day minimum)']
      ],
      tables: [
        {
          caption: 'The four classes',
          columns: ['Class', 'Access', 'Minimum duration', 'Storage price', 'Retrieval'],
          rows: [
            ['Standard', 'Frequent', 'None', 'Highest', 'Free'],
            ['Nearline', '~ monthly', '30 days', 'Lower', 'Charged'],
            ['Coldline', '~ quarterly', '90 days', 'Lower still', 'Charged more'],
            ['Archive', '< yearly', '365 days', 'Lowest', 'Charged most']
          ]
        },
        {
          caption: 'Where the bucket lives — chosen at creation, never changed',
          columns: ['Location type', 'What it is', 'Pick it when'],
          rows: [
            ['Region', 'One region', 'Lowest latency to compute in the same region; cheapest'],
            ['Dual-region', 'A named pair of regions', 'Regional redundancy with predictable placement'],
            ['Multi-region', 'A large geographic area', 'Serving users worldwide; highest availability']
          ]
        }
      ],
      tip: 'Bucket name and location are permanent. The storage class is not — lifecycle rules can move objects down the tiers, and SetStorageClass is one of only two lifecycle actions, the other being Delete.'
    },
    {
      id: 'load-balancing',
      part: 'choose',
      title: 'Which load balancer?',
      note: 'Answer three questions in order: internal or external, which protocol, and global or regional. That combination names the balancer.',
      path: [
        ['External HTTP or HTTPS traffic, global, URL-based routing', 'HTTP(S) Load Balancing — global, Layer 7, proxy'],
        ['External SSL/TLS that is not HTTP', 'SSL Proxy — global'],
        ['External plain TCP that is not HTTP', 'TCP Proxy — global'],
        ['External TCP or UDP, keep the client IP, no proxy', 'Network Load Balancing — regional, pass-through'],
        ['Traffic between your own services inside the VPC', 'Internal TCP/UDP Load Balancing — regional'],
        ['Internal HTTP routing between services', 'Internal HTTP(S) Load Balancing — regional']
      ],
      columns: ['Balancer', 'Layer', 'Scope', 'Traffic'],
      rows: [
        ['HTTP(S)', '7 (proxy)', 'Global', 'HTTP, HTTPS; one anycast IP; URL maps, Cloud CDN, Cloud Armor'],
        ['SSL Proxy', '4 (proxy)', 'Global', 'Encrypted non-HTTP TCP'],
        ['TCP Proxy', '4 (proxy)', 'Global', 'Unencrypted non-HTTP TCP'],
        ['Network', '4 (pass-through)', 'Regional', 'TCP and UDP, client IP preserved'],
        ['Internal TCP/UDP', '4 (pass-through)', 'Regional', 'Private traffic inside the VPC'],
        ['Internal HTTP(S)', '7 (proxy)', 'Regional', 'Private HTTP between services']
      ],
      tip: 'Only the proxy balancers are global. If the question says UDP, or says the backend must see the real client IP, it is Network Load Balancing and therefore regional.'
    },
    {
      id: 'connectivity',
      part: 'choose',
      title: 'How should on-premises connect?',
      note: 'Encrypted over the internet, or a private physical circuit. Price, bandwidth and whether traffic may touch the public internet decide it.',
      path: [
        ['Cheap, quick, encrypted, modest bandwidth', 'Cloud VPN (HA VPN for the 99.99% SLA)'],
        ['Private circuit, high bandwidth, no public internet, near a colocation facility', 'Dedicated Interconnect'],
        ['Private connectivity but no colocation presence, or under 10 Gbps', 'Partner Interconnect'],
        ['Only cheaper egress to Google services, no private RFC 1918 access', 'Direct Peering'],
        ['A CDN provider peering with Google’s edge', 'CDN Interconnect']
      ],
      columns: ['Option', 'Encrypted', 'Over the internet', 'Notes'],
      rows: [
        ['HA VPN', 'Yes (IPsec)', 'Yes', 'Dynamic routing only, two interfaces and two external IPs, 99.99% SLA'],
        ['Classic VPN', 'Yes (IPsec)', 'Yes', 'Static or dynamic, one interface, 99.9% SLA, being retired'],
        ['Dedicated Interconnect', 'No', 'No', 'Direct physical link, 10 or 100 Gbps circuits, colocation required'],
        ['Partner Interconnect', 'No', 'No', 'Through a service provider, 50 Mbps to 50 Gbps'],
        ['Direct Peering', 'No', 'No', 'Edge network only — no access to internal IPs, outside the SLA']
      ],
      tip: 'Cloud VPN is regional and tops out around 3 Gbps per tunnel. Interconnect is the answer whenever the question insists traffic must not cross the public internet, or asks for internal IP reachability from on-premises.'
    },
    {
      id: 'machine-types',
      part: 'choose',
      title: 'Which machine type, and which discount?',
      note: 'Pick the family from the shape of the workload, then the discount from how predictable the usage is. Sustained use needs no action at all — that is often the whole question.',
      tables: [
        {
          caption: 'Machine families',
          columns: ['Family', 'Shape', 'Use it for'],
          rows: [
            ['E2', 'General purpose, lowest cost', 'Day-to-day workloads, small services'],
            ['N1 / N2 / N2D', 'Balanced price and performance', 'Most general workloads'],
            ['Standard / High-memory / High-CPU', 'Ratio of memory to vCPU', 'Tuning within a family'],
            ['C2 (compute-optimised)', 'Highest per-core performance', 'Gaming servers, HPC, single-threaded work'],
            ['M (memory-optimised)', 'Very large memory', 'SAP HANA, big in-memory databases'],
            ['Shared-core (e2-micro, f1-micro)', 'Fraction of a core', 'Tiny, bursty, non-critical services'],
            ['Custom machine type', 'Your own vCPU and memory', 'Between two predefined sizes; costs slightly more']
          ]
        },
        {
          caption: 'Ways of paying less',
          columns: ['Discount', 'How it works', 'Worth'],
          rows: [
            ['Sustained use', 'Automatic once an instance runs a large share of the month', 'Up to ~30%, nothing to do'],
            ['Committed use', 'Commit to vCPU and memory for 1 or 3 years', 'Up to ~57% (up to ~70% with resources)'],
            ['Preemptible / Spot', 'Reclaimable capacity, 24-hour cap on preemptible', 'Up to ~80–91%, interruptible work only'],
            ['Rightsizing recommendations', 'Active Assist spots over-provisioned VMs', 'Removes waste'],
            ['Reservations', 'Hold capacity for when you need it', 'No discount alone; combines with CUD and SUD']
          ]
        }
      ],
      tip: 'Sustained use discounts apply automatically and cannot be purchased. Committed use is a contract you buy. If a question asks what to do to receive sustained use discounts, the answer is nothing.'
    },
    {
      id: 'hierarchy-iam',
      part: 'reference',
      title: 'Resource hierarchy and IAM',
      note: 'Policy is inherited downward and the effective policy is the union of everything above — a permission granted higher up cannot be taken away lower down. That single sentence answers a lot of questions.',
      tables: [
        {
          caption: 'The hierarchy',
          columns: ['Level', 'What it is'],
          rows: [
            ['Organization', 'The root node, tied to a Cloud Identity or Workspace domain'],
            ['Folders', 'Grouping and isolation — departments, environments; may nest'],
            ['Projects', 'The core unit: billing, APIs, quotas and IAM all attach here'],
            ['Resources', 'The service-level things themselves — instances, buckets, datasets'],
            ['Labels', 'Key/value tags for grouping and cost breakdown, not for access control']
          ]
        },
        {
          caption: 'Role types',
          columns: ['Type', 'What it is', 'When'],
          rows: [
            ['Basic (primitive)', 'Owner, Editor, Viewer — project-wide and very broad', 'Avoid; they are the wrong answer in almost every security question'],
            ['Predefined', 'Per-service roles curated by Google, e.g. roles/compute.instanceAdmin', 'The normal answer — closest fit to the job'],
            ['Custom', 'Your own list of permissions', 'Only when no predefined role is close enough']
          ]
        },
        {
          caption: 'Members you can bind',
          columns: ['Member', 'Meaning'],
          rows: [
            ['Google account', 'A person, by email address'],
            ['Service account', 'An application or VM identity'],
            ['Google group', 'A named collection — grant to groups, not people'],
            ['Cloud Identity / Workspace domain', 'Everyone in the domain'],
            ['allAuthenticatedUsers', 'Anyone signed in to any Google account — rarely right'],
            ['allUsers', 'Anyone on the internet — public, and the answer only for public content']
          ]
        }
      ],
      bullets: [
        ['Policy structure', 'A policy is a list of bindings (member + role + optional condition), plus audit config and metadata; an etag prevents two edits overwriting each other'],
        ['Permissions', 'Map one-to-one to API methods, like compute.instances.list, and are never granted directly — only through a role'],
        ['Limits worth knowing', 'One policy per resource; 1,500 members or 250 groups per policy; up to 100 conditional bindings; changes can take up to 7 minutes to propagate'],
        ['Conditions', 'Attribute-based rules (time, resource, request IP); not supported on basic roles and not usable with allUsers or allAuthenticatedUsers'],
        ['Least privilege', 'Grant the narrowest role at the lowest level that does the job — this is the default correct answer whenever a question offers Editor at project level']
      ],
      tip: 'Grant roles to groups rather than individuals, and at the lowest level that works. "Give them Editor on the project" is almost always a distractor.'
    },
    {
      id: 'service-accounts',
      part: 'reference',
      title: 'Service accounts, keys and scopes',
      note: 'A service account is both an identity and a resource: you grant roles to it, and you grant roles on it. That double life is what the trickier access questions test.',
      tables: [
        {
          caption: 'Kinds',
          columns: ['Kind', 'Who makes it', 'Watch for'],
          rows: [
            ['User-managed', 'You do, with a name you choose', 'The one to use for workloads'],
            ['Default', 'Created by some services automatically', 'Comes with the Editor role — too broad; replace it'],
            ['Google-managed (service agents)', 'Google, for its own services', 'Names end in "Service Agent"; keys handled by Google']
          ]
        },
        {
          caption: 'Keys',
          columns: ['Key type', 'Managed by', 'Notes'],
          rows: [
            ['Google-managed', 'Google', 'Rotated automatically; nothing to store — prefer this'],
            ['User-managed', 'You', 'You own storage, distribution, rotation and revocation — a liability, and the wrong answer unless the workload is outside Google Cloud']
          ]
        }
      ],
      bullets: [
        ['Attach, do not embed', 'Give the VM, the Cloud Run service or the GKE workload a service account; do not ship a key file'],
        ['Impersonation', 'roles/iam.serviceAccountTokenCreator lets a principal mint short-lived credentials for a service account — the modern answer to "how do I let this person act as that identity"'],
        ['Short-lived credentials', 'Prefer tokens over downloaded keys wherever a question offers both'],
        ['Access scopes', 'The legacy per-VM limit on which APIs the default service account may reach; they cap what IAM allows, so a wrong scope blocks access even with the right role'],
        ['Scopes vs IAM', 'Scopes are set on the instance and need a stop/start to change; IAM roles are the real permission model — new work should rely on IAM with the cloud-platform scope'],
        ['Workload Identity (GKE)', 'The supported way to give pods a Google service account, instead of mounting keys as Secrets']
      ],
      tip: 'If a VM cannot reach an API even though the service account has the role, look at the access scopes. If a person needs to run something "as" the application, look at impersonation.'
    },
    {
      id: 'billing',
      part: 'reference',
      title: 'Billing, budgets and quotas',
      note: 'Budgets notify; quotas stop. Confusing the two is the single most common mistake in this part of the paper.',
      bullets: [
        ['Billing account', 'Defines who pays; a project links to exactly one; a billing account can pay for many projects'],
        ['Roles', 'Billing Account Administrator manages the account; Billing Account User links projects to it; Project Billing Manager changes a project’s billing link'],
        ['Budgets and alerts', 'Set thresholds as percentages of a budget and notify — they never stop spending on their own. To cap spend you need a programmatic budget notification into Pub/Sub plus a function that disables billing'],
        ['Quotas', 'Hard limits on resources or API rate per project; raise them by requesting an increase. Quotas are what actually prevent runaway usage'],
        ['Billing export', 'Send billing data to BigQuery for detailed analysis; standard and custom reports live in the console'],
        ['Labels', 'The way to break a bill down by team, environment or cost centre'],
        ['Committed use', 'Billed monthly for the whole term whether or not you use it']
      ],
      tip: 'A question about being told when spending crosses a line wants a budget alert. A question about stopping a project creating more resources wants a quota.'
    },
    {
      id: 'compute-detail',
      part: 'reference',
      title: 'Compute Engine in practice',
      note: 'Instance states, how you get in, what survives a stop, and how instance groups behave. This is the deployment and operations core.',
      tables: [
        {
          caption: 'Instance lifecycle',
          columns: ['State', 'What is happening', 'Billing'],
          rows: [
            ['PROVISIONING', 'Resources being allocated', 'Not yet'],
            ['STAGING', 'Booting toward running', 'Yes'],
            ['RUNNING', 'Up; SSH or RDP available shortly after', 'Yes'],
            ['STOPPING', 'Shutting down, on request or after a failure', 'Winding down'],
            ['TERMINATED', 'Stopped; can be restarted or deleted', 'No CPU or memory — you still pay for disks and reserved static IPs']
          ]
        },
        {
          caption: 'Getting in',
          columns: ['Method', 'Needs', 'Notes'],
          rows: [
            ['SSH', 'Firewall allow tcp:22', 'Console, Cloud Shell, gcloud compute ssh, or your own key pair'],
            ['OS Login', 'Firewall allow tcp:22', 'Ties SSH access to IAM roles and supports 2SV — the manageable answer at scale'],
            ['RDP', 'Firewall allow tcp:3389', 'Windows only; set the Windows password first']
          ]
        }
      ],
      bullets: [
        ['Live migration', 'Google moves running VMs during host maintenance with no downtime — the reason maintenance rarely appears as an outage'],
        ['Shielded VM', 'Secure Boot, vTPM, measured boot and integrity monitoring against boot-level rootkits'],
        ['Snapshots', 'Global resources, incremental and compressed, stored in Cloud Storage; work on zonal and regional disks; use a schedule in the same region as the disk, off-peak'],
        ['Images vs snapshots', 'An image is for creating new instances from a known build; a snapshot is for backup and restore'],
        ['Instance template', 'Immutable definition — machine type, image, disks, labels, network; a MIG is built from one, and changing it means a new template'],
        ['Managed instance group', 'Identical VMs managed as one: autoscaling, autohealing on a health check, rolling updates, regional (recommended) or zonal'],
        ['Autohealing', 'Recreates a VM that fails its application health check, not merely one that is powered off'],
        ['Unmanaged group', 'A bag of dissimilar VMs behind a balancer — no autoscaling, no autohealing, no rolling updates']
      ],
      tip: 'A stopped VM still costs money for its persistent disks and any static external IP it holds. Releasing the IP or deleting the disk is the answer when a question asks why a stopped instance is still billing.'
    },
    {
      id: 'vpc',
      part: 'reference',
      title: 'VPC, subnets, routes and firewall rules',
      note: 'A VPC is global and holds no IP range itself; subnets are regional and do. Route order and firewall precedence are worth memorising exactly.',
      bullets: [
        ['VPC', 'Global, lives in a project, IPv4; auto mode creates a subnet in every region, custom mode creates none until you do'],
        ['Subnet', 'Regional, holds the primary range plus optional secondary ranges; you can expand a subnet but never shrink it, and the name and region are fixed at creation'],
        ['Reserved addresses', 'Four per subnet range: network, default gateway, second-to-last, and broadcast'],
        ['Route order', 'Most specific destination wins; subnet routes are considered first, then static and dynamic routes by priority. The default route carries internet traffic and has the lowest priority'],
        ['Firewall rules', 'Stateful, applied per direction — a rule is ingress or egress, never both. Priority 0–65535, lowest number wins. Implied rules: allow all egress, deny all ingress'],
        ['Targeting', 'By network tag, by service account, or all instances — service accounts are the more manageable choice'],
        ['VPC Peering', 'Private RFC 1918 connectivity between two VPCs in any project or organisation; non-transitive, and ranges must not overlap'],
        ['Shared VPC', 'A host project owns the network, service projects attach to it — the answer for central network control across teams'],
        ['Private Google Access', 'Lets a VM with no external IP reach Google APIs; enabled per subnet'],
        ['Cloud NAT', 'Outbound internet for instances without external IPs; regional, and inbound connections stay blocked'],
        ['VPC Flow Logs', 'Sampled flow records for monitoring, forensics and cost analysis; enabled per subnet'],
        ['Static vs ephemeral IP', 'A reserved static IP survives a stop and keeps billing while unattached']
      ],
      tip: 'Subnets can grow but never shrink, and their region is permanent. If a question needs a different region or a smaller range, the answer is a new subnet.'
    },
    {
      id: 'dns',
      part: 'reference',
      title: 'Cloud DNS and record types',
      note: 'Cloud DNS is the authoritative, 100% SLA name service. The exam mostly wants the record types and the public/private zone split.',
      columns: ['Record', 'What it does'],
      rows: [
        ['A', 'Points a name at an IPv4 address'],
        ['AAAA', 'Points a name at an IPv6 address'],
        ['CNAME', 'Aliases one name to another name'],
        ['MX', 'Directs mail to a mail server'],
        ['NS', 'Names the authoritative servers for the zone'],
        ['SOA', 'Authoritative parameters, created with the zone'],
        ['TXT', 'Arbitrary text — domain verification, SPF'],
        ['PTR', 'Reverse lookup: address back to name']
      ],
      bullets: [
        ['Public zone', 'Resolvable from the internet'],
        ['Private zone', 'Resolvable only from the VPC networks you authorise'],
        ['Split horizon', 'The same name answering differently inside and outside the VPC']
      ]
    },
    {
      id: 'gke',
      part: 'reference',
      title: 'GKE: clusters, upgrades and objects',
      note: 'Cluster shape decides availability; the object types decide what you deploy. Both are examined directly.',
      tables: [
        {
          caption: 'Cluster types',
          columns: ['Type', 'Control plane', 'Nodes', 'Consequence'],
          rows: [
            ['Single-zone', 'One replica, one zone', 'Same zone', 'Cheapest; zone loss takes everything'],
            ['Multi-zonal', 'One replica, one zone', 'Several zones', 'Workloads survive a zone loss, but you cannot change the cluster while the control plane is down'],
            ['Regional', 'Replicas in several zones', 'Several zones', 'Control plane stays available through upgrades and zone failures — Google’s recommendation']
          ]
        },
        {
          caption: 'Workload objects',
          columns: ['Object', 'What it is for'],
          rows: [
            ['Pod', 'The smallest deployable unit; ephemeral, never brought back once terminated'],
            ['Deployment', 'Runs and replaces N replicas of a stateless app'],
            ['StatefulSet', 'Stable identities and persistent storage per replica'],
            ['DaemonSet', 'One pod on every node — agents, log shippers'],
            ['Job', 'Runs a finite task to completion'],
            ['CronJob', 'A Job on a schedule'],
            ['ConfigMap / Secret', 'Configuration and sensitive values injected into pods']
          ]
        },
        {
          caption: 'Service types',
          columns: ['Type', 'Reachable from', 'Notes'],
          rows: [
            ['ClusterIP', 'Inside the cluster only', 'The default'],
            ['NodePort', 'Every node on a static port', 'Port from 30000–32767'],
            ['LoadBalancer', 'The internet (or internal clients)', 'Provisions a Google Cloud load balancer'],
            ['ExternalName', 'Internal alias to an external DNS name', 'No proxying'],
            ['Headless', 'Direct pod addresses', 'clusterIP: None, for your own discovery'],
            ['Ingress', 'HTTP(S) routing to several Services', 'Needs the HTTP load balancing add-on']
          ]
        }
      ],
      bullets: [
        ['Control plane', 'API server, scheduler, controller manager, etcd — Google runs it; kubelet and kube-proxy run on each node'],
        ['Node pool', 'A group of nodes sharing one configuration; scale and upgrade pools, not individual nodes'],
        ['Release channels', 'Rapid (weeks after upstream GA), Regular (default, 2–3 months later), Stable (2–3 months after Regular)'],
        ['Upgrade order', 'The control plane is always upgraded before its nodes, and a manual control-plane upgrade may not skip a minor version'],
        ['Auto-upgrade and auto-repair', 'On by default and the recommended practice; maintenance windows and exclusions control when'],
        ['Surge upgrades', 'How many nodes may be upgraded at once, and how disruptive that is allowed to be'],
        ['Autopilot', 'Google manages nodes entirely and you pay per pod; Standard leaves node sizing and upgrades with you'],
        ['Namespaces', 'default, kube-system, kube-public, kube-node-lease']
      ],
      tip: 'Regional clusters buy control-plane availability, not just node availability. A question about being unable to change workloads during an upgrade is pointing at zonal or multi-zonal.'
    },
    {
      id: 'gke-storage',
      part: 'reference',
      title: 'GKE storage and volumes',
      note: 'Access modes are examined almost word for word, and the regional-versus-zonal disk distinction decides whether a pod can be rescheduled.',
      tables: [
        {
          caption: 'Access modes',
          columns: ['Mode', 'Meaning'],
          rows: [
            ['ReadWriteOnce', 'Mounted read-write by a single node — what a Persistent Disk supports'],
            ['ReadOnlyMany', 'Mounted read-only by many nodes'],
            ['ReadWriteMany', 'Mounted read-write by many nodes — needs Filestore, not a Persistent Disk']
          ]
        },
        {
          caption: 'Volume types',
          columns: ['Type', 'What it holds'],
          rows: [
            ['emptyDir', 'Scratch space for the life of the pod'],
            ['ConfigMap', 'Configuration data injected into the pod'],
            ['Secret', 'Sensitive values injected into the pod'],
            ['PersistentVolumeClaim', 'A request for durable storage, bound to a PersistentVolume'],
            ['Downward API', 'Pod metadata exposed to the container']
          ]
        }
      ],
      bullets: [
        ['PV and PVC', 'A PersistentVolume is the storage; a PersistentVolumeClaim asks for a size, an access mode and a StorageClass. Unclaimed defaults use the default StorageClass'],
        ['Zonal persistent disk', 'Lives in one zone; pods that use it are scheduled into that zone'],
        ['Regional persistent disk', 'Replicated across two zones so a workload can fail over'],
        ['Which product', 'Database → Cloud SQL, Firestore or Spanner; objects → Cloud Storage; shared filesystem → Filestore; block → Persistent Disk']
      ]
    },
    {
      id: 'serverless-ops',
      part: 'reference',
      title: 'App Engine, Cloud Run and Cloud Functions',
      note: 'Versions and traffic splitting are the App Engine answers; triggers and scaling are the Cloud Functions and Cloud Run ones.',
      columns: ['', 'App Engine Standard', 'App Engine Flexible'],
      rows: [
        ['Runs in', 'A sandbox', 'Docker containers on managed VMs'],
        ['Runtimes', 'Specific supported versions', 'Any version, custom runtimes allowed'],
        ['Scaling', 'To zero, very fast', 'Minimum one instance, slower'],
        ['Suits', 'Sudden spiky traffic', 'Steady traffic, background processes'],
        ['Pricing', 'Instance hours, free tier', 'VM resources, no free quota']
      ],
      bullets: [
        ['App Engine scaling', 'Automatic (by request rate and latency), basic (spin up on request), or manual (a fixed number of instances)'],
        ['Versions and traffic', 'Deploy a new version, then migrate traffic or split it by percentage — this is how App Engine does canaries and rollbacks'],
        ['Deploying', 'gcloud app deploy; one App Engine application per project and its region is permanent'],
        ['Cloud Functions triggers', 'HTTP, Pub/Sub, Cloud Storage object changes, Firestore and Firebase events'],
        ['Cloud Functions billing', 'Invocations plus time and provisioned memory; free tier available'],
        ['Cloud Run', 'Any container, any language; set concurrency, CPU, memory and min/max instances; revisions carry traffic splits just like App Engine versions']
      ]
    },
    {
      id: 'storage-ops',
      part: 'reference',
      title: 'Running Cloud Storage',
      note: 'Access control and lifecycle are the operational half of Cloud Storage, and both come up as scenario questions.',
      bullets: [
        ['IAM vs ACL', 'IAM is the recommended model and works at project or bucket level; ACLs are per-object and finer-grained. Uniform bucket-level access turns ACLs off entirely'],
        ['Signed URL', 'A time-limited URL granting read or write to one object, for people with no Google credentials'],
        ['Signed policy document', 'Constrains what may be uploaded to a bucket'],
        ['Public access', 'Granting Storage Object Viewer to allUsers is what makes a bucket public — and the usual cause of an accidental leak'],
        ['Objects are immutable', 'An upload replaces; it never edits in place. Versioning keeps the superseded copies'],
        ['Lifecycle rules', 'Conditions (age, creation date, number of newer versions, storage class) and exactly two actions: Delete or SetStorageClass'],
        ['Retention policy', 'Prevents deletion for a set period; a lock makes the policy permanent'],
        ['Moving data in', 'gsutil for ad-hoc and scripted copies, Storage Transfer Service for large or scheduled transfers, Transfer Appliance when the network is the bottleneck']
      ]
    },
    {
      id: 'operations',
      part: 'reference',
      title: 'Monitoring, logging and diagnostics',
      note: 'Know which tool answers which question, and which log types exist. Sinks and custom metrics are the configuration details the exam asks about.',
      tables: [
        {
          caption: 'The Operations suite',
          columns: ['Tool', 'Answers'],
          rows: [
            ['Cloud Monitoring', 'Is it healthy? Metrics, dashboards, uptime checks, alerting policies'],
            ['Cloud Logging', 'What happened? Central log storage, search, sinks and retention'],
            ['Error Reporting', 'What is breaking? Counts and groups application errors, alerts on new ones'],
            ['Cloud Trace', 'Why is it slow? Latency across requests'],
            ['Cloud Profiler', 'What is it spending? Continuous CPU and memory profiling'],
            ['Cloud Debugger', 'What is the state? Inspects running code without stopping it']
          ]
        },
        {
          caption: 'Log types',
          columns: ['Type', 'Records'],
          rows: [
            ['Admin Activity audit logs', 'Configuration changes — always on, cannot be disabled'],
            ['Data Access audit logs', 'Reads and writes of data — off by default except BigQuery, and chargeable'],
            ['System Event audit logs', 'Google-initiated actions on your resources'],
            ['Policy Denied audit logs', 'Access denied by a security policy'],
            ['Access Transparency logs', 'Actions taken by Google staff on your content'],
            ['Agent logs', 'Sent by the Ops Agent from inside a VM']
          ]
        }
      ],
      bullets: [
        ['Agents', 'VMs need the Ops Agent installed to report memory, disk and application logs; CPU and network come free'],
        ['Log sink', 'Routes matching entries to Cloud Storage, BigQuery, Pub/Sub or another project — the answer for long retention and analysis'],
        ['Custom metrics', 'Defined and written through the Monitoring API, or extracted from logs as log-based metrics'],
        ['Alerting policy', 'A condition plus notification channels; uptime checks are the probe from outside'],
        ['Scope of the Logs Viewer', 'Shows one project at a time — cross-project analysis means a sink into BigQuery']
      ],
      tip: 'Admin Activity logs are free and always on; Data Access logs must be turned on and cost money. A question about capturing who read a bucket is asking you to enable Data Access logging.'
    },
    {
      id: 'cli',
      part: 'reference',
      title: 'The command line',
      note: 'ACE asks you to recognise commands as often as to choose products. Four tools, and one rule: gcloud for Google Cloud, gsutil for buckets, bq for BigQuery, kubectl for anything inside a cluster.',
      tables: [
        {
          caption: 'The tools',
          columns: ['Tool', 'For'],
          rows: [
            ['gcloud', 'Google Cloud resources — projects, instances, networks, IAM'],
            ['gsutil', 'Cloud Storage buckets and objects'],
            ['bq', 'BigQuery datasets, tables and queries'],
            ['kubectl', 'Kubernetes objects inside a cluster']
          ]
        },
        {
          caption: 'Commands worth recognising',
          mono: true,
          columns: ['Task', 'Command'],
          rows: [
            ['Set up the SDK, log in, choose a project', 'gcloud init'],
            ['Authorise with your own account', 'gcloud auth login'],
            ['Authorise as a service account', 'gcloud auth activate-service-account --key-file=KEY.json'],
            ['See or change defaults', 'gcloud config list / gcloud config set project PROJECT_ID'],
            ['Install or update components', 'gcloud components install / update'],
            ['Create a VM', 'gcloud compute instances create NAME --zone=ZONE --machine-type=TYPE'],
            ['Connect to a VM', 'gcloud compute ssh NAME --zone=ZONE'],
            ['Open a port', 'gcloud compute firewall-rules create NAME --allow=tcp:80 --target-tags=web'],
            ['Grant a role', 'gcloud projects add-iam-policy-binding PROJECT --member=... --role=...'],
            ['Read the policy', 'gcloud projects get-iam-policy PROJECT'],
            ['Make a cluster and get credentials', 'gcloud container clusters create NAME / get-credentials NAME'],
            ['Deploy and expose in Kubernetes', 'kubectl create deployment NAME --image=IMAGE / kubectl expose deployment NAME --type=LoadBalancer --port=80'],
            ['Scale a deployment', 'kubectl scale deployment NAME --replicas=3'],
            ['Inspect', 'kubectl get pods / kubectl describe pod NAME / kubectl logs POD'],
            ['Copy to a bucket', 'gsutil cp FILE gs://BUCKET/ (gsutil -m for parallel)'],
            ['Set a lifecycle policy', 'gsutil lifecycle set config.json gs://BUCKET'],
            ['Make an object public', 'gsutil iam ch allUsers:objectViewer gs://BUCKET'],
            ['Deploy an App Engine app', 'gcloud app deploy'],
            ['Deploy infrastructure as code', 'gcloud deployment-manager deployments create NAME --config=config.yaml']
          ]
        }
      ],
      bullets: [
        ['Cloud Shell', 'A browser VM with the SDK already installed and authenticated, 5 GB of persistent home directory'],
        ['Deployment Manager', 'Google’s own IaC: a configuration must have a resources section, each with name, type and properties; a manifest is the read-only record of a deployment'],
        ['Config Connector', 'Manages Google Cloud resources as Kubernetes objects from inside GKE']
      ]
    },
    {
      id: 'exam-format',
      part: 'sitting',
      title: 'What the paper is',
      notesFirst: true,
      note: 'Weights are Google’s own, from the current exam guide. It has four sections, not five: the old planning and deploying sections are now one, and together with operations they are 60% of the paper — most of the exam is about building and running things.',
      bullets: [
        ['Questions', '50–60, multiple choice and multiple select'],
        ['Time', '2 hours'],
        ['Cost', '$125 USD'],
        ['Languages', 'English, Japanese, Spanish, Portuguese'],
        ['Valid for', 'Three years'],
        ['Renewal exam', '20 questions in 1 hour, $75, English and Japanese — or renew through a learning path on Google Skills (one more year)'],
        ['Recommended', 'At least six months of hands-on Google Cloud experience'],
        ['Delivered', 'Remotely proctored, or at a Pearson VUE test centre']
      ],
      columns: ['Section', 'Weight', 'What it asks'],
      rows: [
        ['1 · Setting up a cloud solution environment', '~20%', 'Projects, hierarchy and org policies, IAM in a project, Cloud Identity, APIs and quotas, Cloud Asset Inventory, Workforce Identity Federation, billing accounts, budgets and exports'],
        ['2 · Planning and implementing a cloud solution', '~30%', 'Choosing and deploying compute (VMs, MIGs, GKE, Cloud Run, Agent Runtime), data and storage products, VPCs, firewall rules and Cloud NGFW policies, connectivity, load balancers, IaC and AI-assisted tooling'],
        ['3 · Ensuring the successful operation of a cloud solution', '~30%', 'Managing VMs, snapshots, GKE node pools and autoscaling, Cloud Run traffic; buckets, queries, backups, CMEK; subnets, routes, DNS and NAT; monitoring, logging and audit logs'],
        ['4 · Configuring access and security', '~20%', 'IAM policies and inheritance, role types and custom roles, service accounts, impersonation, short-lived credentials, Workload Identity Federation']
      ],
      tip: 'This exam rewards having clicked through the console. Where the Digital Leader paper wants the business answer, this one wants the one that actually works — the right role, the right access mode, the right flag.'
    },
    {
      id: 'guide-changes',
      part: 'sitting',
      title: 'What the current guide changed',
      note: 'The guide was rewritten around four sections and now names newer products. The question bank here was built against the older five-section guide, so it is thin on the items below — read the docs for those.',
      bullets: [
        ['Sections', 'Planning and configuring (~17.5%) and Deploying and implementing (~25%) merged into Planning and implementing (~30%); operations grew to ~30%, access to ~20%'],
        ['AI tooling', 'Gemini Cloud Assist (resource analysis, monitoring), Gemini CLI, Google Antigravity, Application Design Center'],
        ['Agents and notebooks', 'Agent Runtime on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine), Agent Platform Workbench notebooks, Cloud Workstations'],
        ['Setup', 'Standalone organizations, quotas, checking regional availability, Cloud Asset Inventory, Workforce Identity Federation'],
        ['Compute and data', 'Hyperdisk, VM Manager, GPUs vs TPUs, Eventarc, AlloyDB, Managed Service for Apache Kafka, NetApp Volumes, Managed Lustre, Database Center'],
        ['Networking', 'Cloud NGFW policies with secure tags and service accounts, Network Service Tiers, Fabric FAST for IaC'],
        ['Operations', 'Personalized Service Health, Managed Service for Prometheus, Active Assist, Cloud Hub, Query Insights, log analytics'],
        ['Renamed', 'Cloud Functions is Cloud Run functions; Vertex AI Agent Engine is Agent Runtime']
      ]
    },
    {
      id: 'technique',
      part: 'sitting',
      title: 'How to work through it',
      note: 'Two hours for 50–60 questions is about two minutes each, which is comfortable if you do not stall on the long scenarios.',
      bullets: [
        ['Read for the constraint', 'Most questions hinge on one phrase: "without managing servers", "must not traverse the internet", "read-write by many nodes", "once a quarter"'],
        ['Eliminate the over-broad answer', 'Anything granting Owner or Editor, or opening a firewall to 0.0.0.0/0, is nearly always wrong'],
        ['Prefer managed over manual', 'Where two answers both work, the managed service or the automatic feature is usually the key'],
        ['Prefer the smallest change', 'Growing a subnet beats rebuilding a VPC; a new node pool beats a new cluster'],
        ['Watch the scope words', 'Global or regional, zonal or regional, project or organisation — these decide half the networking and GKE questions'],
        ['Flag and move on', 'Mark anything you are unsure of and return; every question is worth the same'],
        ['Multiple select says how many', 'If it says choose two, exactly two are right — and a wrong pick loses the whole mark']
      ]
    }
  ]
};
