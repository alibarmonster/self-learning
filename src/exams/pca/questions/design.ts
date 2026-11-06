import type { Question } from '@/types';

/**
 * Section 1 — Designing and planning a cloud solution architecture (~25%).
 * Business and technical requirements, resilience, choosing network, storage,
 * compute, data and AI products, migration planning and future-proofing.
 * Written for the current guide; product names checked in October 2026.
 */
export const design: Question[] = [
  // ── Requirements & trade-offs ─────────────────────────────────────────────
  {
    id: 'pca-d-001',
    topic: 'Requirements & trade-offs',
    difficulty: 'easy',
    prompt: 'A retailer says its new platform "must absorb holiday traffic peaks without paying for idle capacity the rest of the year." How should an architect classify this statement?',
    options: [
      'A functional requirement (a feature the platform offers)',
      'A non-functional requirement (elasticity and cost)',
      'A compliance requirement (an external rule to satisfy)',
      'A success metric (a KPI to report after launch)',
    ],
    answer: 1,
    explanation: 'It describes how the system must behave, scaling with demand and paying for use, not what it does for users, so it is a non-functional requirement. Functional requirements describe features, compliance requirements come from regulation, and a KPI measures outcomes after launch.'
  },
  {
    id: 'pca-d-002',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'An insurer plans to build its own HR ticketing system on GKE. A SaaS product covers about 90% of the needs, and the remaining 10% are integrations with the insurer\'s claims system. Which workload disposition should you recommend?',
    options: [
      'Build the whole system on GKE so every requirement is met exactly',
      'Buy the SaaS product and build only the integrations, through its APIs',
      'Modify the current on-premises tool and rehost it on Compute Engine',
      'Deprecate HR ticketing and handle requests by email until a later phase'
    ],
    answer: 1,
    explanation: 'HR ticketing is not a differentiating capability, so buying the SaaS product and building only the integrations delivers fastest at the lowest total cost. Building everything spends engineering on commodity features; rehosting keeps the old tool\'s gaps; deprecating ignores a real need.',
    tip: 'Build what differentiates the business; buy commodity capabilities and integrate them.'
  },
  {
    id: 'pca-d-003',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'Leadership says the goal of moving an application platform to Google Cloud is "to ship features to customers faster and more safely." Which pair of measurements best shows whether that goal is met?',
    options: [
      'Average CPU utilisation and the number of VMs retired',
      'Deployment frequency and change failure rate',
      'Monthly cloud spend and storage growth',
      'Number of Google Cloud services in use and open support cases'
    ],
    answer: 1,
    explanation: 'Deployment frequency measures how fast changes reach customers and change failure rate measures how safely; both are DORA delivery metrics tied directly to the stated goal. Utilisation, spend and service counts describe infrastructure, not delivery outcomes.'
  },
  {
    id: 'pca-d-004',
    topic: 'Requirements & trade-offs',
    difficulty: 'easy',
    prompt: 'A logistics company is writing a business continuity plan for 40 applications. What should the architect do first?',
    options: [
      'Replicate every application to a second region with the same configuration and cost',
      'Classify the applications by business impact and agree an RTO and RPO for each tier',
      'Buy committed use discounts now for the disaster recovery capacity in a second region',
      'Run a full region failover test of all 40 applications at once to find the weak points',
    ],
    answer: 1,
    explanation: 'Recovery targets come from business impact, and they decide the design and cost of each tier. Replicating everything equally overspends on low-impact systems, discounts and tests come after the targets and design exist.'
  },
  {
    id: 'pca-d-005',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'A distributor wants its 300 partners to submit orders in real time instead of nightly SFTP files. Each partner needs its own credentials and rate limits, and the business wants usage analytics per partner. What should you design?',
    options: [
      'Publish the order API through Apigee with per-partner API keys, quotas and analytics',
      'Give each partner a service account key to publish directly to a Pub/Sub topic',
      'Keep SFTP but run it on a Compute Engine VM with a larger disk',
      'Expose the order service directly on a public external IP with firewall rules per partner'
    ],
    answer: 0,
    explanation: 'Apigee manages partner-facing APIs: developer apps and keys per partner, quotas and spike arrest, and analytics. Sharing service account keys is insecure and gives no per-partner analytics, SFTP stays batch, and per-partner firewall rules do not scale or provide API management.'
  },
  {
    id: 'pca-d-006',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'A research institute must move 2 PB from its data centre into Cloud Storage within three weeks. Its only internet link is 1 Gbps and is shared with daily work. What should you recommend?',
    options: ['Storage Transfer Service over the existing link', 'Transfer Appliance', '`gcloud storage rsync` run in parallel from many hosts', 'A new HA VPN tunnel dedicated to the transfer'],
    answer: 1,
    explanation: 'At 1 Gbps, 2 PB takes about six months even at full line rate, so no online method meets three weeks. Transfer Appliance ships the data on Google-provided hardware. Parallel copies and VPN still share the same 1 Gbps.',
    tip: 'Do the arithmetic: 1 Gbps moves roughly 10 TB a day at best.'
  },
  {
    id: 'pca-d-007',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'A media company runs a steady baseline of 200 vCPUs around the clock and adds up to 600 vCPUs for a few hours on weekday evenings. Which purchasing approach minimises cost?',
    options: [
      'Committed use discounts for all 800 vCPUs, so the evening peaks are discounted too',
      'Commitments for the 200-vCPU baseline, and autoscaled on-demand capacity for the evening peaks',
      'On-demand capacity for everything, relying only on sustained use discounts for the baseline',
      'Reservations for 800 vCPUs so that the evening peak capacity is always guaranteed',
    ],
    answer: 1,
    explanation: 'Commitments pay off for capacity used all the time; committing to the peak means paying for 600 idle vCPUs most of the day. Pure on-demand overpays for the steady baseline, and reservations guarantee capacity without lowering its price.'
  },
  {
    id: 'pca-d-008',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'A payments start-up must know within five minutes when more than 1% of checkout requests fail, without paging engineers for single short spikes. What should the design include from the start?',
    options: [
      'A dashboard of request counts that the on-call engineer checks every five minutes',
      'An availability SLO for checkout and alerting on its error-budget burn rate',
      'An uptime check on the home page with email notifications',
      'Log retention of 400 days for all application logs'
    ],
    answer: 1,
    explanation: 'An SLO turns "1% failures" into a measurable target, and burn-rate alerts fire fast for real degradation while ignoring brief blips. Watching dashboards is manual, a home-page uptime check misses checkout errors, and retention does not detect anything.'
  },
  {
    id: 'pca-d-009',
    topic: 'Requirements & trade-offs',
    difficulty: 'easy',
    prompt: 'Which two of these are non-functional requirements? (Choose two.)',
    options: [
      'Customers can download a PDF of each invoice',
      'The checkout page responds within 300 ms at the 95th percentile',
      'Managers can approve expense claims from a mobile app',
      'Order data is kept in the EU and encrypted with company-managed keys',
      'The catalogue shows stock levels for each store'
    ],
    answer: [1, 3],
    explanation: 'Latency targets and data residency or encryption constraints describe qualities and constraints of the system. Downloading invoices, approving claims and showing stock levels are features: functional requirements.'
  },
  {
    id: 'pca-d-010',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'A team of four developers must launch a new booking application in three months, iterate on it weekly, and spend little time on operations. Architects disagree on the first design. What do you recommend?',
    options: [
      'Twenty microservices on GKE Standard with a service mesh, so every team can scale independently',
      'A modular containerised application on Cloud Run, split into services later only where needed',
      'A monolith on self-managed Compute Engine VMs, scaled by hand when bookings grow',
      'An event-sourced design across Pub/Sub, Bigtable and Dataflow for every booking feature',
    ],
    answer: 1,
    explanation: 'For a small team and a fixed deadline, a modular application on a fully managed platform keeps operations low and delivery fast, and leaves room to split services when there is a reason. Many microservices on GKE Standard, self-managed VMs and an event-sourced design all add complexity the requirements do not justify.'
  },
  {
    id: 'pca-d-011',
    topic: 'Requirements & trade-offs',
    difficulty: 'hard',
    prompt: 'An e-commerce platform needs product pages to load fast worldwide. Prices change several times a day and must never be shown more than 60 seconds out of date. Which design balances latency and freshness best?',
    options: [
      'Cache whole product pages, prices included, in Cloud CDN for 24 hours and invalidate them nightly',
      'Cache static assets and page shells in Cloud CDN; fetch prices from an API with a short cache TTL',
      'Serve everything from a single region without any caching, so that prices are always fresh',
      'Replicate the full product database to every region with Spanner and turn off all caching',
    ],
    answer: 1,
    explanation: 'Separating content by how often it changes gives edge latency for static parts and bounded staleness for prices. A 24-hour page cache breaks the 60-second rule, a single uncached region is slow far away, and a global database for read-mostly prices is costly overkill.'
  },
  {
    id: 'pca-d-012',
    topic: 'Requirements & trade-offs',
    difficulty: 'medium',
    prompt: 'During design review, the security team insists on encrypting all data with customer-managed keys, while the product owner worries about extra latency and cost. What is the architect\'s best next step?',
    options: [
      "Reject CMEK for all data, because Google's default encryption already protects everything",
      'Classify the data and the need for key control, apply CMEK where required, and record the trade-off',
      'Apply CMEK with external keys (Cloud EKM) to every resource in every project to be safe',
      'Ask each development team to decide on encryption per service and document it themselves',
    ],
    answer: 1,
    explanation: 'Design decisions should follow requirements: classify the data, apply CMEK where regulation or policy needs key control, and document the decision. Rejecting or maximising CMEK everywhere ignores the actual need, and leaving it to each team leads to inconsistency.'
  },

  // ── Technical requirements & resilience ───────────────────────────────────
  {
    id: 'pca-d-013',
    topic: 'Technical requirements & resilience',
    difficulty: 'easy',
    prompt: 'A stateless web tier must keep serving if a single zone fails. What is the simplest design on Compute Engine?',
    options: ['A zonal managed instance group sized for peak', 'A regional managed instance group behind a load balancer', 'Two unmanaged instance groups in one zone', 'One large VM with a regional persistent disk'],
    answer: 1,
    explanation: 'A regional MIG spreads identical VMs across zones and the load balancer routes around a failed zone. A zonal MIG or unmanaged groups in one zone die with that zone, and a single VM is a single point of failure.'
  },
  {
    id: 'pca-d-014',
    topic: 'Technical requirements & resilience',
    difficulty: 'medium',
    prompt: 'An order database on Cloud SQL for PostgreSQL must recover from a regional outage within 15 minutes, losing at most a few seconds of data. Which design fits at the lowest complexity?',
    options: [
      'Daily automated backups stored in a multi-region location, restored in the second region',
      'An HA (regional) instance with its standby in a second zone of the same region',
      'A cross-region read replica that is promoted (or switched over) if the primary region fails',
      'Hourly exports to a dual-region Cloud Storage bucket and a tested restore script',
    ],
    answer: 2,
    explanation: 'A cross-region replica keeps an almost current copy in another region and can take over in minutes; Enterprise Plus adds switchover with a write endpoint that follows the primary. Backups and exports lose hours of data and take longer to restore, and HA protects only against a zone failure.'
  },
  {
    id: 'pca-d-015',
    topic: 'Technical requirements & resilience',
    difficulty: 'medium',
    prompt: 'After a ransomware incident at a peer company, a bank wants VM and database backups that even a compromised administrator account cannot delete or shorten. What should you design?',
    options: [
      'Snapshots in the same project with a strict IAM policy',
      'Backup and DR Service writing to a backup vault with an enforced minimum retention',
      'Nightly copies to a Cloud Storage bucket without a retention policy',
      'A second set of snapshots taken by a cron job on a VM'
    ],
    answer: 1,
    explanation: 'Backup vaults keep backups immutable and indelible for their enforced retention, so even privileged users cannot remove them early. IAM alone can be changed by an administrator, buckets without retention can be emptied, and cron-driven snapshots share the same blast radius.'
  },
  {
    id: 'pca-d-016',
    topic: 'Technical requirements & resilience',
    difficulty: 'easy',
    prompt: 'A news site serves the same images and videos to readers on every continent. Which design reduces latency and origin load most?',
    options: [
      'A multi-region bucket behind a global external Application Load Balancer with Cloud CDN',
      'A regional bucket in each continent, kept in sync, with DNS round robin across them',
      'Larger VMs with more network bandwidth in one region, serving files from local disks',
      'Memorystore in front of a regional bucket to cache the most popular images and videos',
    ],
    answer: 0,
    explanation: 'Cloud CDN caches the content at Google\'s edge close to readers, behind one global anycast address, and the multi-region bucket is a durable origin. DNS round robin is crude and per-continent buckets add copying work, bigger VMs do not move data closer, and Memorystore is not an edge cache.'
  },
  {
    id: 'pca-d-017',
    topic: 'Technical requirements & resilience',
    difficulty: 'medium',
    prompt: 'A legacy stateful application runs on a single VM and cannot be clustered. It must survive a zone failure with no data loss, and a few minutes of downtime is acceptable. What should you use?',
    options: [
      'Hourly snapshots, and a script that recreates the VM and its disk in another zone on failure',
      'A regional persistent disk (or Hyperdisk Balanced HA), attached to a new VM in the other zone on failure',
      'Two Local SSDs in RAID 1 on the VM, so the data survives the loss of one device',
      'A zonal managed instance group of size one with autohealing and a persistent disk',
    ],
    answer: 1,
    explanation: 'A regional disk replicates writes synchronously to a second zone, so a new VM there can attach it with zero data loss. Snapshots lose up to an hour, Local SSD is lost with the VM, and a zonal MIG cannot recreate the VM outside the failed zone.'
  },
  {
    id: 'pca-d-018',
    topic: 'Technical requirements & resilience',
    difficulty: 'hard',
    prompt: 'A microservices platform on GKE must keep serving users if an entire region fails. The data layer already uses a multi-region Spanner instance. How should you design the application tier?',
    options: [
      'One regional Autopilot cluster with its control plane and nodes spread across three zones',
      'GKE clusters in two regions registered to one fleet, behind a multi-cluster Gateway',
      'One zonal cluster in each region, with DNS records switched by hand when a region fails',
      'A single regional cluster with a larger node pool so it has headroom during failures',
    ],
    answer: 1,
    explanation: 'Clusters in two regions in one fleet, behind a multi-cluster Gateway (a global load balancer), keep serving when a region is lost. A regional cluster survives only a zone; manual DNS failover is slow and error-prone; extra nodes in one region do not help when that region fails.'
  },
  {
    id: 'pca-d-019',
    topic: 'Technical requirements & resilience',
    difficulty: 'easy',
    prompt: 'An internal reporting tool can be down for 24 hours and lose up to a day of data after a regional disaster. The business wants the cheapest DR approach. What should you choose?',
    options: [
      'An active-active deployment serving users from two regions behind a global load balancer',
      'A warm standby in the second region, with replicated databases and scaled-down servers',
      'Backups copied to another region, rebuilding the environment from infrastructure as code if needed',
      'A pilot light environment in the second region, with a running database replica',
    ],
    answer: 2,
    explanation: 'With a 24-hour RTO and RPO, backup and restore is enough and costs least: nothing runs in the second region until it is needed. Active-active, warm standby and pilot light all pay for running capacity that these targets do not require.'
  },
  {
    id: 'pca-d-020',
    topic: 'Technical requirements & resilience',
    difficulty: 'medium',
    prompt: 'An application has an RTO of 2 hours and an RPO of 5 minutes. Running full capacity in a second region is too expensive. Which pattern fits?',
    options: [
      'Backup and restore: nightly snapshots copied to the DR region and restored on failover',
      'Pilot light: replicate the database to the DR region continuously and build the app tier from IaC on failover',
      'Active-active: full capacity in both regions behind a global external Application Load Balancer',
      'Cold standby: weekly exports to the DR region, with servers installed by hand on failover',
    ],
    answer: 1,
    explanation: 'Continuous database replication meets the 5-minute RPO, and building the stateless tier from IaC in under two hours meets the RTO without paying for idle application capacity. Nightly or weekly copies miss the RPO, and active-active costs more than needed.'
  },
  {
    id: 'pca-d-021',
    topic: 'Technical requirements & resilience',
    difficulty: 'medium',
    prompt: 'An architect wants AI help to turn a written description of a three-tier application into a first architecture diagram and deployable infrastructure code, and then review it with the team. Which tool fits?',
    options: [
      'Application Design Center with Gemini Cloud Assist',
      'Cloud Asset Inventory with a BigQuery export',
      'Active Assist recommendations for the project',
      'Personalized Service Health with custom alerts',
    ],
    answer: 0,
    explanation: 'Application Design Center, with Gemini Cloud Assist, can draft an architecture from a prompt, show it on a canvas and generate the infrastructure code for review and deployment. Asset Inventory lists existing resources, Active Assist recommends changes to running ones, and Personalized Service Health reports Google incidents.'
  },
  {
    id: 'pca-d-022',
    topic: 'Technical requirements & resilience',
    difficulty: 'hard',
    prompt: 'A trading application needs strongly consistent writes from users in North America and Europe, survival of a full region outage with no data loss, and 99.999% availability for the database. What should you choose?',
    options: [
      'Cloud SQL Enterprise Plus with a cross-region replica and switchover',
      'Spanner with a multi-region configuration (Enterprise Plus edition)',
      'Bigtable with replication and multi-cluster routing across two regions',
      'AlloyDB with a secondary cluster in another region',
    ],
    answer: 1,
    explanation: 'Multi-region Spanner gives externally consistent reads and writes across regions with zero-RPO failover and a 99.999% SLA. Cloud SQL and AlloyDB replicate asynchronously to another region, and Bigtable replication is eventually consistent.'
  },

  // ── Compute selection ────────────────────────────────────────────────────
  {
    id: 'pca-d-023',
    topic: 'Compute selection',
    difficulty: 'easy',
    prompt: 'A containerised REST API has unpredictable traffic that drops to zero most nights. The team does not want to manage clusters or VMs. Which platform fits best?',
    options: ['Cloud Run', 'GKE Standard', 'A managed instance group', 'Google Cloud VMware Engine'],
    answer: 0,
    explanation: 'Cloud Run runs containers without clusters, scales on requests and scales to zero, so idle nights cost nothing. GKE Standard and MIGs keep nodes running, and VMware Engine is for VMware workloads.'
  },
  {
    id: 'pca-d-024',
    topic: 'Compute selection',
    difficulty: 'medium',
    prompt: 'A company wants to bring its existing Windows Server licences, which are licensed per physical core, to Google Cloud. Which compute option lets it stay compliant?',
    options: ['Spot VMs', 'Sole-tenant nodes', 'Cloud Run', 'Shared-core E2 VMs'],
    answer: 1,
    explanation: 'Sole-tenant nodes dedicate physical servers to your VMs, which is what bring-your-own-licence terms tied to physical cores require. The other options run on shared hosts.'
  },
  {
    id: 'pca-d-025',
    topic: 'Compute selection',
    difficulty: 'easy',
    prompt: 'An animation studio renders frames overnight. Each frame is independent and can simply be retried if interrupted. What minimises the cost of this compute?',
    options: [
      'Committed use discounts on standard VMs sized for the nightly work',
      'Spot VMs, for example through a managed instance group or Batch',
      'Memory-optimized VMs so each frame renders faster overnight',
      'Sole-tenant nodes reserved for the render farm each night',
    ],
    answer: 1,
    explanation: 'Spot VMs cost up to 91% less and suit interruptible, retryable work; a MIG or Batch recreates or retries what is preempted. Commitments suit steady load, and memory-optimized machines or sole-tenancy cost more.'
  },
  {
    id: 'pca-d-026',
    topic: 'Compute selection',
    difficulty: 'medium',
    prompt: 'A platform team runs 60 microservices that need mutual TLS between services, traffic splitting and custom Kubernetes operators. Which compute platform fits?',
    options: ['Cloud Run functions', 'GKE with Cloud Service Mesh', 'App Engine standard environment', 'Compute Engine VMs managed with startup scripts'],
    answer: 1,
    explanation: 'Custom operators need Kubernetes, and Cloud Service Mesh adds mTLS and traffic management between services. Functions and App Engine cannot run operators, and VMs with scripts would mean building all of it by hand.'
  },
  {
    id: 'pca-d-027',
    topic: 'Compute selection',
    difficulty: 'medium',
    prompt: 'A company must leave its data centre in four months. It runs 400 VMware VMs with vSphere-based operations and tooling, and there is no time to re-platform. What is the fastest path?',
    options: ['Google Cloud VMware Engine', 'Migrate to Containers for every VM', 'Rewrite the applications for Cloud Run', 'Export each VM as an image into Compute Engine by hand'],
    answer: 0,
    explanation: 'VMware Engine runs native VMware in Google Cloud, so VMs move with the same tools and operations, fastest. Containerising, rewriting or hand-importing 400 VMs cannot meet four months.'
  },
  {
    id: 'pca-d-028',
    topic: 'Compute selection',
    difficulty: 'easy',
    prompt: 'Whenever a document lands in a Cloud Storage bucket, a short piece of Python must extract its text and write it to BigQuery. Which compute option is the simplest fit?',
    options: ['A Cloud Run function triggered by the object finalize event', 'A GKE CronJob that lists the bucket every minute', 'A Compute Engine VM polling the bucket', 'A Managed Service for Apache Spark cluster'],
    answer: 0,
    explanation: 'An event-triggered function runs only when a file arrives and needs no infrastructure. Polling with a CronJob or a VM wastes resources and adds delay, and a Spark cluster is far too heavy for per-file work.'
  },
  {
    id: 'pca-d-029',
    topic: 'Compute selection',
    difficulty: 'hard',
    prompt: 'A tightly coupled MPI simulation spends much of its time exchanging messages between nodes. Which configuration reduces inter-node latency most on Compute Engine?',
    options: [
      'Spot VMs spread across three zones for capacity and cost',
      'HPC-optimised VMs (such as H3) in a compact placement policy',
      'General-purpose E2 VMs in a regional managed instance group',
      'Memory-optimised VMs split between two regions for scale',
    ],
    answer: 1,
    explanation: 'Compact placement keeps VMs physically close for low network latency, and HPC-optimised machines are built for this kind of work. Spreading across zones or regions adds latency, and E2 machines are cost-optimised rather than HPC-optimised.'
  },
  {
    id: 'pca-d-030',
    topic: 'Compute selection',
    difficulty: 'medium',
    prompt: 'A manufacturer is moving an 18 TB SAP HANA database to Google Cloud. Which compute choice fits?',
    options: [
      'Certified memory-optimised machines (M3 or X4)',
      'C2 compute-optimised VMs with large SSDs',
      'A GKE Autopilot cluster with a StatefulSet',
      'Cloud Run services with 32 GiB of memory each',
    ],
    answer: 0,
    explanation: 'SAP HANA keeps its data in memory and must run on SAP-certified machines with enough RAM; M3 and X4 are built for that. Compute-optimised VMs lack the memory, and containers or serverless platforms are not supported for HANA.'
  },

  // ── Storage, database & data processing ───────────────────────────────────
  {
    id: 'pca-d-031',
    topic: 'Storage & database selection',
    difficulty: 'easy',
    prompt: 'Analysts need ad hoc SQL over 3 PB of clickstream data with no servers or clusters to manage. Which product fits?',
    options: ['BigQuery', 'Cloud SQL', 'Bigtable', 'Firestore'],
    answer: 0,
    explanation: 'BigQuery is the serverless warehouse for SQL analytics at petabyte scale. Cloud SQL is transactional and far smaller, Bigtable has no SQL joins for analysis, and Firestore is a document database for apps.'
  },
  {
    id: 'pca-d-032',
    topic: 'Storage & database selection',
    difficulty: 'easy',
    prompt: 'A fleet of 2 million sensors writes readings every second, and dashboards read recent values per device with single-digit millisecond latency. Which database fits?',
    options: ['Bigtable', 'BigQuery', 'Cloud SQL for MySQL', 'Memorystore'],
    answer: 0,
    explanation: 'Bigtable handles very high write throughput and low-latency key lookups, ideal for time series keyed by device. BigQuery is for analysis, Cloud SQL cannot take this write rate, and Memorystore is a cache, not a durable store.'
  },
  {
    id: 'pca-d-033',
    topic: 'Storage & database selection',
    difficulty: 'medium',
    prompt: 'Thirty Linux VMs running a legacy application need a shared POSIX file system with NFS. The application cannot be changed to use object storage. Which service fits?',
    options: ['Filestore', 'Cloud Storage with signed URLs', 'A persistent disk attached read-write to all VMs', 'Firestore'],
    answer: 0,
    explanation: 'Filestore is managed NFS for shared file systems. Object storage needs code changes, a persistent disk cannot be mounted read-write by many VMs for an ordinary file system, and Firestore is a document database.'
  },
  {
    id: 'pca-d-034',
    topic: 'Storage & database selection',
    difficulty: 'medium',
    prompt: 'Windows application servers need SMB file shares joined to the company\'s Active Directory, with snapshots and high performance. Which managed service fits?',
    options: ['Google Cloud NetApp Volumes', 'Filestore Basic HDD', 'Cloud Storage FUSE', 'A Compute Engine VM running a file server'],
    answer: 0,
    explanation: 'NetApp Volumes provides managed NFS and SMB volumes with Active Directory integration and snapshots. Filestore is NFS, Cloud Storage FUSE does not give SMB semantics, and a self-managed file server adds operations work.'
  },
  {
    id: 'pca-d-035',
    topic: 'Storage & database selection',
    difficulty: 'medium',
    prompt: 'A PostgreSQL application now needs fast analytical queries on its live transactional data and vector similarity search for a new AI feature, while staying PostgreSQL-compatible. Which database fits?',
    options: ['AlloyDB for PostgreSQL', 'Cloud SQL for MySQL', 'Firestore', 'Bigtable'],
    answer: 0,
    explanation: 'AlloyDB is PostgreSQL-compatible, with a columnar engine for analytics on live data and vector search built in. The others are not PostgreSQL, and Firestore and Bigtable are NoSQL stores.'
  },
  {
    id: 'pca-d-036',
    topic: 'Storage & database selection',
    difficulty: 'easy',
    prompt: 'A media library of 800 TB has unpredictable access: some files are popular for a week, others are untouched for years. The company wants storage costs to follow actual access without writing lifecycle rules. What should you configure?',
    options: ['Cloud Storage with Autoclass', 'All objects in Archive storage', 'All objects in Standard storage', 'Filestore with snapshots'],
    answer: 0,
    explanation: 'Autoclass moves each object between storage classes based on its own access, so cold data gets cheaper and hot data stays fast. Archive charges retrieval for the popular files, Standard overpays for cold ones, and Filestore is file storage at a higher price.'
  },
  {
    id: 'pca-d-037',
    topic: 'Storage & database selection',
    difficulty: 'medium',
    prompt: 'A mobile banking app needs per-user data that syncs to phones in real time and keeps working offline, with no servers to manage. Which database fits?',
    options: ['Firestore', 'Spanner', 'Cloud SQL', 'Bigtable'],
    answer: 0,
    explanation: 'Firestore has real-time listeners and offline support in its mobile SDKs and is serverless. Spanner, Cloud SQL and Bigtable have no client-side sync or offline mode.'
  },
  {
    id: 'pca-d-038',
    topic: 'Data processing selection',
    difficulty: 'medium',
    prompt: 'Clickstream events must be cleaned, enriched and aggregated in one-minute windows before landing in BigQuery, at a volume that varies tenfold during the day. Which combination fits?',
    options: ['Pub/Sub and Dataflow', 'Cloud Storage and Cloud Run functions', 'Cloud SQL and Cloud Scheduler', 'Bigtable and Cloud Composer'],
    answer: 0,
    explanation: 'Pub/Sub absorbs the stream and Dataflow does windowed, stateful processing with autoscaling. Functions handle single events without windowing, and the other pairs are not stream processors.'
  },
  {
    id: 'pca-d-039',
    topic: 'Data processing selection',
    difficulty: 'easy',
    prompt: 'A bank has 400 Apache Spark jobs on an on-premises Hadoop cluster and wants to move them with as little code change as possible. What should it use?',
    options: ['Managed Service for Apache Spark', 'Dataflow', 'BigQuery scheduled queries', 'Cloud Run jobs'],
    answer: 0,
    explanation: 'Managed Service for Apache Spark (formerly Dataproc) runs Spark and Hadoop jobs on managed clusters or serverless, so existing jobs move largely unchanged. Dataflow needs Apache Beam, and rewriting in SQL or containers takes far more effort.'
  },
  {
    id: 'pca-d-040',
    topic: 'Data processing selection',
    difficulty: 'medium',
    prompt: 'Analysts want changes from the production MySQL order database in BigQuery within minutes, without adding load-heavy batch exports to the source. What should you use?',
    options: ['Datastream change data capture into BigQuery', 'A nightly `mysqldump` copied to Cloud Storage', 'BigQuery Data Transfer Service from Google Ads', 'A Cloud Run job that runs `SELECT *` every five minutes'],
    answer: 0,
    explanation: 'Datastream reads the MySQL binary log and streams changes into BigQuery continuously with little source load. Dumps are batch and heavy, the Ads connector is unrelated, and repeated full selects load the database.'
  },
  {
    id: 'pca-d-062',
    topic: 'Data processing selection',
    difficulty: 'medium',
    prompt: 'A logistics company receives 50,000 GPS events per second from its trucks. It needs per-truck aggregates every minute, and events that arrive up to 10 minutes late must still count in the right minute. Which processing service fits?',
    options: [
      'Dataflow streaming with event-time windows, watermarks and allowed lateness',
      'Hourly Managed Service for Apache Spark batch jobs over the raw events in Cloud Storage',
      'Cloud Run functions that update a Cloud SQL row for every truck on every event',
      'BigQuery scheduled queries every minute over a table loaded by a nightly batch',
    ],
    answer: 0,
    explanation: 'Dataflow (Apache Beam) windows data by event time, and watermarks with allowed lateness put late events into the right window, at this scale and with no servers to manage. Hourly batches and nightly loads are far too slow, and a database write per event will not keep up with 50,000 a second.'
  },
  {
    id: 'pca-d-063',
    topic: 'Data processing selection',
    difficulty: 'medium',
    prompt: 'A company runs hundreds of Apache Spark jobs on an ageing on-premises Hadoop cluster. It wants to move them to Google Cloud with minimal code changes and stop maintaining a long-running cluster. What should you recommend?',
    options: [
      'Managed Service for Apache Spark, running the existing jobs on clusters created per job',
      'Rewriting every job as an Apache Beam pipeline on Dataflow before any migration starts',
      'A self-managed Hadoop cluster on Compute Engine VMs, sized like the on-premises one',
      'BigQuery scheduled queries that replace each Spark job with a hand-written SQL query',
    ],
    answer: 0,
    explanation: 'Managed Service for Apache Spark runs existing Spark and Hadoop jobs with few changes, and short-lived clusters created for each job, with the data in Cloud Storage, leave no long-running cluster to maintain. Rewriting for Beam or SQL is a large project, and a self-managed cluster keeps the maintenance.'
  },

  // ── Network & hybrid design ───────────────────────────────────────────────
  {
    id: 'pca-d-041',
    topic: 'Network & hybrid design',
    difficulty: 'medium',
    prompt: 'A hospital group needs a private 20 Gbps connection between its data centre and Google Cloud with a 99.99% availability SLA. Its data centre is in a colocation facility where Google is present. What should you design?',
    options: [
      'Dedicated Interconnect: four connections in two metros, with Cloud Routers in two regions',
      'Two Dedicated Interconnect connections in a single edge availability domain of one metro',
      'HA VPN with two tunnels over the internet to two on-premises VPN gateways',
      'Partner Interconnect with a single 20 Gbps VLAN attachment through one provider',
    ],
    answer: 0,
    explanation: 'The 99.99% Interconnect topology needs four connections in two metros (two edge availability domains each) with Cloud Routers in two regions. A single edge availability domain is a single point of failure, a pair of HA VPN tunnels carries only a few Gbps and runs over the internet, and a single attachment has no SLA.'
  },
  {
    id: 'pca-d-042',
    topic: 'Network & hybrid design',
    difficulty: 'medium',
    prompt: 'A company has 25 VPC networks in different projects that all need to reach each other and on-premises, and VPC Network Peering is becoming unmanageable. What should you design?',
    options: [
      'Network Connectivity Center with VPC spokes and hybrid spokes',
      'A full mesh of 300 VPC peerings managed with Terraform',
      'Cloud NAT gateways in every VPC to route between them',
      'Public IPs and firewall rules between all of the VPCs',
    ],
    answer: 0,
    explanation: 'Network Connectivity Center gives transitive connectivity between VPC spokes and to hybrid connections from one hub. Peering is not transitive and a full mesh is unmanageable, NAT is egress only, and public IPs expose traffic.'
  },
  {
    id: 'pca-d-043',
    topic: 'Network & hybrid design',
    difficulty: 'medium',
    prompt: 'Your application must call a partner\'s service that runs in the partner\'s own Google Cloud organization. Both companies use overlapping 10.0.0.0/8 ranges, and the partner only wants to expose that one service, not its network. What should you use?',
    options: [
      'Private Service Connect: the partner publishes a service attachment; you add an endpoint',
      'VPC Network Peering between the two VPCs, exporting only the needed routes',
      'Shared VPC across the two organizations with the partner as a service project',
      'HA VPN between the two VPCs with custom route advertisements for the service',
    ],
    answer: 0,
    explanation: 'Private Service Connect exposes a single service through an endpoint in your VPC, works across organizations and tolerates overlapping ranges. Peering and VPN need non-overlapping ranges and connect whole networks, and Shared VPC works only inside one organization.'
  },
  {
    id: 'pca-d-044',
    topic: 'Network & hybrid design',
    difficulty: 'easy',
    prompt: 'A central network team must control subnets, firewall rules and hybrid connectivity for 40 application projects in one organization, while application teams deploy their own VMs and clusters. Which design fits?',
    options: ['Shared VPC with a host project and the application projects attached as service projects', 'A separate VPC per project, peered by each team', 'One project for all applications', 'Network Connectivity Center between 40 independent networks managed by each team'],
    answer: 0,
    explanation: 'Shared VPC centralises the network in a host project while service projects keep their own resources and billing. The other designs either hand network control to every team or remove project separation.'
  },
  {
    id: 'pca-d-045',
    topic: 'Network & hybrid design',
    difficulty: 'hard',
    prompt: 'You are planning IP ranges for VPC-native GKE clusters that will grow to 500 nodes with up to 110 Pods per node. What matters most when you size the ranges?',
    options: [
      'The Pod range must fit a Pod CIDR block for every node, each larger than the Pods it holds',
      'Only the node subnet matters, because Pods share the IP address of their node',
      'The Services range must be at least as large as the Pod range for routing',
      'Secondary ranges can be shrunk later, so start with the smallest blocks possible',
    ],
    answer: 0,
    explanation: 'Each node gets its own Pod CIDR block (a /24 for 110 Pods), so 500 nodes need room for 500 such blocks in the Pod range, and running out stops scaling. Pods get their own alias IPs, Services need far fewer addresses, and ranges cannot shrink.'
  },
  {
    id: 'pca-d-046',
    topic: 'Network & hybrid design',
    difficulty: 'medium',
    prompt: 'Analytics jobs in Google Cloud must read data from Amazon S3 and AWS databases at sustained multi-gigabit rates over a private, dedicated connection. What should you design?',
    options: ['Cross-Cloud Interconnect to AWS', 'HA VPN over the internet to AWS', 'Direct Peering', 'Cloud CDN in front of the S3 bucket'],
    answer: 0,
    explanation: 'Cross-Cloud Interconnect provides dedicated, high-bandwidth physical links between Google Cloud and other clouds such as AWS. VPN rides the internet with lower throughput, Direct Peering reaches Google public services only, and CDN caches content for end users.'
  },
  {
    id: 'pca-d-047',
    topic: 'Network & hybrid design',
    difficulty: 'easy',
    prompt: 'A global SaaS product needs one IP address for users worldwide, TLS termination near users, and routing to the closest healthy backend region. What should you use?',
    options: ['A global external Application Load Balancer on Premium Tier', 'Regional external Application Load Balancers on Standard Tier', 'An external passthrough Network Load Balancer', 'Cloud DNS with geolocation routing only'],
    answer: 0,
    explanation: 'The global external Application Load Balancer gives one anycast IP, terminates TLS at Google\'s edge and routes to the nearest healthy backend; it needs Premium Tier. Regional and passthrough load balancers are regional, and DNS alone does not terminate TLS or health-route per request.'
  },

  // ── AI & ML solution design ───────────────────────────────────────────────
  {
    id: 'pca-d-048',
    topic: 'AI & ML solution design',
    difficulty: 'medium',
    prompt: 'An insurer wants employees to ask questions in natural language about 200,000 internal policy documents and get answers with citations. The documents change weekly. What is the most effective design?',
    options: [
      'Fine-tune a Gemini model on all 200,000 documents every week so its answers stay current',
      "Index the documents with Agent Search and ground Gemini's answers in the retrieved passages",
      'Train a custom language model from scratch on the documents with Agent Platform Pipelines',
      'Load the documents into BigQuery and answer questions with keyword `LIKE` queries in SQL',
    ],
    answer: 1,
    explanation: 'Grounding Gemini on retrieved passages gives current, cited answers, and the index updates as documents change. Weekly fine-tuning is costly and still cannot cite sources, training from scratch is unnecessary, and keyword search does not answer questions.'
  },
  {
    id: 'pca-d-049',
    topic: 'AI & ML solution design',
    difficulty: 'medium',
    prompt: 'For data sovereignty reasons, a company must run an open-weight language model inside its own GKE clusters rather than call a hosted API. Where should the team start?',
    options: [
      'Model Garden, choosing an open model such as Gemma and deploying it to GKE',
      "The Cloud Vision API, called from Pods in the company's GKE clusters",
      "Gemini Enterprise with NotebookLM, connected to the company's documents",
      "Document AI processors deployed next to the company's GKE workloads",
    ],
    answer: 0,
    explanation: 'Model Garden catalogues open models and offers deployment options, including to your own GKE clusters. Vision API and Document AI are hosted task APIs, and Gemini Enterprise is an end-user application, not a self-hosted model.'
  },
  {
    id: 'pca-d-050',
    topic: 'AI & ML solution design',
    difficulty: 'hard',
    prompt: 'A research lab will train a very large model for several weeks and needs thousands of accelerators with fast interconnect, reliable scheduling of capacity, and good price-performance. Which approach fits?',
    options: [
      'AI Hypercomputer: TPU or GPU clusters on GKE, with capacity from Dynamic Workload Scheduler',
      'Hundreds of independent Spot GPU VMs, started by hand in whichever regions have capacity',
      'Thousands of Cloud Run service instances, each with one GPU, coordinated through Pub/Sub',
      'Managed Service for Apache Spark clusters with GPU workers running the training loop',
    ],
    answer: 0,
    explanation: 'AI Hypercomputer combines accelerators, high-speed networking, storage and scheduling for large-scale training, and capacity can be secured with reservations or Dynamic Workload Scheduler. Ad hoc Spot VMs lack coordinated capacity and interconnect, and Cloud Run and Spark are not built for multi-week distributed training.'
  },
  {
    id: 'pca-d-051',
    topic: 'AI & ML solution design',
    difficulty: 'easy',
    prompt: 'A logistics company receives 50,000 supplier invoices a month as PDFs and wants totals, dates and line items extracted automatically. What should it use first?',
    options: ['Document AI with a prebuilt invoice processor', 'A custom model trained from scratch on GPUs', 'Speech-to-Text', 'The Translation API'],
    answer: 0,
    explanation: 'Document AI has prebuilt processors that already extract invoice fields, so no training is needed. A custom model is slower and costlier to build, and speech and translation APIs do not parse documents.',
    tip: 'Prefer a prebuilt API or model when it meets the need; customise only when it does not.'
  },
  {
    id: 'pca-d-052',
    topic: 'AI & ML solution design',
    difficulty: 'medium',
    prompt: 'A business team wants to create a customer-support agent that answers from the company\'s website and knowledge base, with minimal code, and then improve it over time. Which option fits?',
    options: ['Agent Builder on Gemini Enterprise Agent Platform', 'A custom transformer model trained with Agent Platform Pipelines', 'Cloud Translation API', 'A BigQuery ML linear regression model'],
    answer: 0,
    explanation: 'Agent Builder creates agents grounded in your data sources with little code. Training a model from scratch is unnecessary for this, and translation or regression models do not build conversational agents.'
  },

  // ── Migration planning ───────────────────────────────────────────────────
  {
    id: 'pca-d-053',
    topic: 'Migration planning',
    difficulty: 'easy',
    prompt: 'Before migrating 800 servers, a company needs an inventory, utilisation data, right-sized machine recommendations and a cost estimate for Google Cloud. What should it use?',
    options: ['Migration Center', 'Cloud Asset Inventory', 'Storage Transfer Service', 'Database Migration Service'],
    answer: 0,
    explanation: 'Migration Center discovers on-premises assets, collects performance data, and produces right-sizing and total cost of ownership reports. Asset Inventory lists Google Cloud resources, and the transfer and database services move data rather than assess servers.'
  },
  {
    id: 'pca-d-054',
    topic: 'Migration planning',
    difficulty: 'medium',
    prompt: 'A migration plan covers 120 applications. Which approach to the first migration wave reduces risk most?',
    options: [
      'Start with the most critical, most connected application so the hardest problems surface early',
      'Start with a few low-risk applications with few dependencies, then use what is learned for later waves',
      'Migrate all 120 at once over one weekend',
      'Order the waves alphabetically so that teams can plan ahead'
    ],
    answer: 1,
    explanation: 'Early waves of simple, loosely coupled applications build skills, tooling and patterns with little business risk. Starting with the most critical system or migrating everything at once maximises risk, and alphabetical order ignores dependencies.'
  },
  {
    id: 'pca-d-055',
    topic: 'Migration planning',
    difficulty: 'medium',
    prompt: 'A company is rehosting 200 VMs from vSphere to Compute Engine and wants test clones, cutover with minimal downtime and rollback if needed, without rebuilding the VMs. Which tool should it use?',
    options: ['Migrate to Virtual Machines', 'Migrate to Containers', 'Transfer Appliance', 'Database Migration Service'],
    answer: 0,
    explanation: 'Migrate to Virtual Machines replicates VMs continuously, lets you test clones, cuts over with little downtime and supports rollback. Migrate to Containers modernises into containers, Transfer Appliance moves bulk data, and DMS moves databases.'
  },
  {
    id: 'pca-d-056',
    topic: 'Migration planning',
    difficulty: 'medium',
    prompt: 'A 4 TB MySQL database must move to Cloud SQL with less than 10 minutes of downtime. What is the recommended approach?',
    options: ['Database Migration Service with continuous replication, then a short cutover', 'Export with `mysqldump`, copy the file and import it during a long outage', 'Storage Transfer Service for the data files', 'Rebuild the schema by hand and re-enter the data'],
    answer: 0,
    explanation: 'Database Migration Service performs an initial load and keeps replicating changes, so the cutover only waits for the last changes to apply. A dump and import of 4 TB takes hours of downtime, and copying raw data files or retyping data is not a database migration.'
  },
  {
    id: 'pca-d-057',
    topic: 'Migration planning',
    difficulty: 'hard',
    prompt: 'Before migrating, a company discovers that its on-premises networks use 10.0.0.0/8 throughout, and the cloud landing zone must connect to them over Interconnect. What should the network plan do first?',
    options: [
      'Plan cloud subnets in ranges that do not overlap on-premises (or are reclaimed from it) before deploying',
      'Use auto mode VPC networks so that Google picks suitable, non-conflicting ranges automatically',
      'Deploy the workloads now and resolve any overlapping ranges later by adding Cloud NAT',
      'Reuse the same 10.0.0.0/8 range in the cloud so that every address stays identical',
    ],
    answer: 0,
    explanation: 'Routing between on-premises and Google Cloud needs non-overlapping ranges, and fixing overlaps after workloads exist is painful. Auto mode uses 10.128.0.0/9, which overlaps, NAT is not a clean fix for routed hybrid traffic, and reusing the same range makes routing impossible.'
  },
  {
    id: 'pca-d-058',
    topic: 'Migration planning',
    difficulty: 'medium',
    prompt: 'During planning, the finance team asks how moving Microsoft SQL Server to Google Cloud affects licensing costs. Which statement should guide the plan?',
    options: [
      'Licensing does not change when workloads move, so it can be left out of the cost model',
      'Compare licence-included images with bringing your own licences where mobility rights allow',
      'Microsoft licences are included for free with every Google Cloud VM, so costs fall',
      'SQL Server may only run on sole-tenant nodes, so plan dedicated hosts for all of it',
    ],
    answer: 1,
    explanation: 'Licensing is often a large part of migration cost: on-demand licence-included images are simple, while bringing licences depends on the contract\'s mobility rights and sometimes on sole-tenant hosts. It must be modelled, not ignored, and neither of the other claims is true.'
  },

  // ── Future improvements ───────────────────────────────────────────────────
  {
    id: 'pca-d-059',
    topic: 'Future improvements',
    difficulty: 'medium',
    prompt: 'Six months after rehosting its VMs to Compute Engine, a company wants to cut operations work further. Which next step follows a cloud-first approach?',
    options: [
      'Replatform suitable parts onto managed services, e.g. databases to Cloud SQL, apps to Cloud Run',
      'Move the VMs back on-premises, where the operations team already has the right tools',
      'Buy more and larger VMs to add headroom, so that fewer operations tasks are urgent',
      'Freeze the architecture until the next hardware refresh cycle and revisit it then',
    ],
    answer: 0,
    explanation: 'Rehosting is usually the first step; replatforming onto managed services then removes patching and scaling work. Moving back, overprovisioning or freezing the design give up the cloud\'s benefits.'
  },
  {
    id: 'pca-d-060',
    topic: 'Future improvements',
    difficulty: 'medium',
    prompt: 'A retailer expects to add new sales channels (marketplaces, social commerce) over the next three years but does not know which ones yet. Which design choice best prepares for that?',
    options: [
      'Expose catalogue, pricing and orders as well-defined APIs, decoupled with events',
      'Hard-code each new channel integration directly into the web application',
      'Build one large shared database that every sales channel queries directly',
      'Wait until the channels are chosen before designing any of the integrations',
    ],
    answer: 0,
    explanation: 'Stable APIs and event-driven decoupling let new channels plug in without rewriting the core. Hard-coded integrations and shared databases couple everything together, and waiting delays the business.'
  },
  {
    id: 'pca-d-061',
    topic: 'Future improvements',
    difficulty: 'easy',
    prompt: 'An architect wants a regular, low-effort way to spot idle resources, oversized VMs and unused permissions in a growing Google Cloud estate. What should be built into operations?',
    options: ['Regular review of Active Assist recommendations', 'A yearly manual audit of every project', 'Turning off Cloud Monitoring to save cost', 'Doubling quotas so nothing ever blocks'],
    answer: 0,
    explanation: 'Active Assist continuously recommends right-sizing, idle-resource clean-up and IAM tightening from actual usage. A yearly manual audit is slow, and turning off monitoring or raising quotas does nothing for efficiency.'
  },
  {
    id: 'pca-d-064',
    topic: 'Future improvements',
    difficulty: 'easy',
    prompt: 'The architecture board asks how to keep a two-year-old platform from falling behind as Google Cloud services and the business evolve. What should the architect put in place?',
    options: [
      'Regular reviews against the Well-Architected Framework, informed by Active Assist and release notes',
      'A freeze on the architecture after launch, revisited only when a major outage forces a change',
      'Adoption of every new product as soon as it is announced, replacing components that still work',
      'Leaving each team to decide when to upgrade, without any shared review or technology roadmap',
    ],
    answer: 0,
    explanation: 'A recurring review against the Well-Architected Framework, fed by recommendations and product changes, keeps the design current on purpose. Freezing it lets it age, chasing every announcement adds risk without a reason, and leaving it to each team produces drift.'
  },
  {
    id: 'pca-d-065',
    topic: 'Future improvements',
    difficulty: 'medium',
    prompt: 'Which two design choices make it easiest to adopt new managed services later without rewriting the platform? (Choose two.)',
    options: [
      'Loose coupling between components through well-defined APIs and events',
      'Infrastructure as code for every environment, kept in version control',
      'Service endpoints and credentials hard-coded into the application code',
      'One shared database schema that every component reads and writes directly',
      'Custom-built replacements for managed services, to avoid any provider lock-in',
    ],
    answer: [0, 1],
    explanation: 'Components behind stable APIs and events can be swapped one at a time, and infrastructure as code makes each change repeatable and reviewable. Hard-coded endpoints and a shared schema couple everything together, and building your own replacements adds the very operations work that managed services remove.'
  }
];
