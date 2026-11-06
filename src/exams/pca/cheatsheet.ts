/**
 * Professional Cloud Architect cheat sheet. Plain data, rendered by
 * Cheatsheet.svelte — the same contract as the ACE and CDL sheets.
 *
 * PCA is a design exam: most questions name a requirement and ask for the
 * architecture that meets it best, so the sheet leads with frameworks and
 * decision tables, then security, delivery and operations, then a one-table
 * map of each case study and the facts about the paper. Product names follow
 * Google's 2026 branding (Gemini Enterprise Agent Platform, Knowledge Catalog,
 * Managed Service for Apache Spark, Cloud Run functions).
 */

import type { Cheatsheet } from '@/types';

export const cheatsheet: Cheatsheet = {
  title: 'Architecture, condensed',
  filterHint: 'e.g. RPO, Interconnect, Model Armor, canary',
  intro:
    'Six parts. The frameworks part is how the exam thinks: requirements, the Well-Architected pillars, disaster recovery tiers. The decision tables pick the product for a requirement — read one top to bottom and stop at the first line that matches. Security, delivery and operations follow, then each case study mapped requirement by requirement, and finally the paper itself. Filter to jump to a term.',
  parts: [
    { id: 'frame', title: 'How architects decide', blurb: 'The lens every question is written through: requirements, trade-offs and the Well-Architected Framework.' },
    { id: 'choose', title: 'Choosing the building blocks', blurb: 'Compute, data, network, AI and migration — Section 1 and 2 decisions, about 40% of the paper.' },
    { id: 'secure', title: 'Security and compliance', blurb: 'Section 3, about 17.5%: identity, keys, perimeters, supply chain, AI safety and regulation.' },
    { id: 'run', title: 'Delivery, operations and cost', blurb: 'Sections 4–6: processes, implementation and operational excellence, about 40% together.' },
    { id: 'cases', title: 'The four case studies', blurb: 'Two of these appear in every sitting, for 20–30% of the paper. Summaries are ours; read Google\'s originals too.' },
    { id: 'sitting', title: 'Sitting the exam', blurb: 'The format, the weights and how to work through a scenario.' }
  ],
  groups: [
    {
      id: 'waf',
      part: 'frame',
      title: 'The Well-Architected Framework pillars',
      note: 'The guide calls familiarity with the framework a key requirement, and its pillars run through every section. When two answers both work, the one that serves more pillars — or the pillar the question stresses — wins.',
      columns: ['Pillar', 'What it asks', 'Typical right answer'],
      rows: [
        ['Operational excellence', 'Can you run, change and improve it safely?', 'IaC, CI/CD, small reversible changes, SLOs, runbooks, blameless postmortems'],
        ['Security, privacy and compliance', 'Is access least-privilege and data protected?', 'Groups and predefined roles, org policies, CMEK where required, VPC Service Controls, audit logs'],
        ['Reliability', 'Does it survive failures and recover within targets?', 'Zonal → regional → multi-region redundancy, autoscaling, tested DR, health checks'],
        ['Cost optimization', 'Do you pay only for value?', 'Managed services, autoscaling to zero, rightsizing, commitments for the baseline, lifecycle rules'],
        ['Performance optimization', 'Does it meet latency and throughput targets?', 'The right machine family, caching and CDN, data close to users, load testing'],
        ['Sustainability', 'Does it use energy and resources efficiently?', 'Low-carbon regions where allowed, high utilisation, scale to zero, efficient data retention']
      ]
    },
    {
      id: 'requirements',
      part: 'frame',
      title: 'Requirements, trade-offs and dispositions',
      bullets: [
        ['Functional', 'What the system does for users: features, workflows, integrations.'],
        ['Non-functional', 'How well and under which constraints: availability, latency, scale, security, residency, cost.'],
        ['KPIs', 'Outcomes the business measures: conversion, deployment frequency, change failure rate, cost per order, time to onboard a partner.'],
        ['Trade-offs', 'Consistency vs latency, cost vs availability, speed of delivery vs control. Record them (architecture decision records).'],
        'Read the business requirement first: "reduce costs", "faster releases", "regulatory compliance" decide between two technically valid designs.'
      ],
      columns: ['Disposition', 'Means', 'Pick it when'],
      rows: [
        ['Retire / deprecate', 'Switch it off', 'Unused or duplicated capability'],
        ['Retain', 'Leave it where it is for now', 'Planned for replacement, or blocked by regulation or contracts'],
        ['Rehost (lift and shift)', 'Move VMs as they are', 'Deadline-driven exits; Migrate to Virtual Machines, VMware Engine'],
        ['Replatform (lift and optimise)', 'Swap parts for managed services', 'Databases to Cloud SQL, apps to GKE Autopilot or Cloud Run'],
        ['Refactor / rebuild', 'Re-architect for cloud-native', 'Differentiating systems that need scale or agility'],
        ['Repurchase / buy', 'Replace with SaaS', 'Commodity capability: CRM, HR, ticketing']
      ]
    },
    {
      id: 'dr',
      part: 'frame',
      title: 'RTO, RPO and the disaster recovery tiers',
      note: 'RPO = how much data you may lose; RTO = how long you may be down. Classify systems by business impact first, then give each tier the cheapest pattern that meets its targets — and test it.',
      path: [
        ['RTO and RPO in days, lowest cost', 'Backup and restore to another region, rebuild with IaC'],
        ['RPO in minutes, RTO in hours', 'Pilot light: data replicated continuously, app tier built on failover'],
        ['RPO near zero, RTO in minutes', 'Warm standby: scaled-down copy running, scale up on failover'],
        ['No data loss, near-zero downtime across regions', 'Active-active: multi-region data (Spanner, Firestore) and a global load balancer']
      ],
      columns: ['Building block', 'Survives a zone', 'Survives a region'],
      rows: [
        ['Compute Engine', 'Regional MIG; regional PD / Hyperdisk Balanced HA', 'MIGs in two regions behind a global load balancer'],
        ['GKE', 'Regional cluster', 'Clusters in two regions in a fleet, multi-cluster Gateway; Backup for GKE'],
        ['Cloud SQL', 'HA (regional) instance', 'Cross-region replica (Enterprise Plus: switchover and write endpoint)'],
        ['Spanner / Firestore', 'Regional configuration', 'Multi-region configuration (Spanner: Enterprise Plus)'],
        ['Cloud Storage', 'Any bucket', 'Dual-region (turbo replication: 15-minute RPO) or multi-region'],
        ['Backups', 'Snapshots, scheduled backups', 'Copies in another region; Backup and DR Service vaults (immutable)']
      ]
    },

    {
      id: 'compute',
      part: 'choose',
      title: 'Which compute?',
      path: [
        ['Native VMware, no time to re-platform', 'Google Cloud VMware Engine'],
        ['Licences tied to physical cores, or host isolation', 'Sole-tenant nodes'],
        ['Specific OS, agents, GPUs with full control, lift and shift', 'Compute Engine (MIGs for scale)'],
        ['Kubernetes features, many services, operators, portability', 'GKE (Autopilot unless node control is needed)'],
        ['Stateless container, request-driven, scale to zero', 'Cloud Run'],
        ['A small function reacting to an event', 'Cloud Run functions'],
        ['Fault-tolerant batch, cheapest', 'Spot VMs (MIG or Batch), Spot node pools']
      ],
      columns: ['Machine need', 'Family'],
      rows: [
        ['General purpose, cost-optimised', 'E2, N4, C4, C4A (Arm)'],
        ['HPC and tightly coupled MPI', 'H3 / compute-optimised, compact placement policy'],
        ['SAP HANA, in-memory databases', 'M3, X4 (memory-optimised, SAP-certified)'],
        ['ML training and inference', 'A3 / A4 (GPU), G2 (L4), Cloud TPU'],
        ['Very large local SSD', 'Z3 (storage-optimised)']
      ]
    },
    {
      id: 'data',
      part: 'choose',
      title: 'Which storage, database or pipeline?',
      tables: [
        {
          caption: 'Storage and databases',
          columns: ['Need', 'Product'],
          rows: [
            ['Objects, media, backups; unknown access pattern', 'Cloud Storage (Autoclass)'],
            ['Shared NFS for Linux VMs', 'Filestore'],
            ['SMB/NFS with Active Directory, snapshots', 'Google Cloud NetApp Volumes'],
            ['Relational, regional, existing MySQL/PostgreSQL/SQL Server', 'Cloud SQL'],
            ['PostgreSQL with analytics on live data and vectors', 'AlloyDB'],
            ['Relational at global scale, strong consistency, 99.999%', 'Spanner (multi-region)'],
            ['Huge throughput, low-latency key lookups, time series', 'Bigtable'],
            ['Mobile/web documents, offline sync; MongoDB apps', 'Firestore (MongoDB compatibility on Enterprise edition)'],
            ['Analytics warehouse, SQL over petabytes', 'BigQuery'],
            ['Cache, sessions, leaderboards', 'Memorystore (Valkey, Redis, Memcached)']
          ]
        },
        {
          caption: 'Data processing and movement',
          columns: ['Need', 'Product'],
          rows: [
            ['Streaming or batch pipelines, windowing, autoscaling', 'Pub/Sub + Dataflow'],
            ['Existing Spark and Hadoop jobs', 'Managed Service for Apache Spark (formerly Dataproc)'],
            ['Change data capture from operational databases', 'Datastream'],
            ['Existing Kafka clients and connectors', 'Managed Service for Apache Kafka'],
            ['Share data with partners without copying', 'BigQuery sharing (Analytics Hub), data clean rooms'],
            ['Govern, discover and trace data across the estate', 'Knowledge Catalog (formerly Dataplex Universal Catalog)']
          ]
        }
      ]
    },
    {
      id: 'network',
      part: 'choose',
      title: 'Which connectivity and network design?',
      columns: ['Need', 'Design'],
      rows: [
        ['Private, high-bandwidth link to a data centre, 99.99%', 'Dedicated Interconnect: 4 connections, 2 metros, Cloud Routers in 2 regions'],
        ['Private link without reaching a Google facility', 'Partner Interconnect'],
        ['Encrypted link fast to set up, modest bandwidth', 'HA VPN (99.99% with two tunnels); also a backup path for Interconnect'],
        ['Dedicated link to AWS, Azure, OCI, Alibaba', 'Cross-Cloud Interconnect'],
        ['Central network team, many projects, one org', 'Shared VPC'],
        ['Two VPCs, non-overlapping, possibly different orgs', 'VPC Network Peering (not transitive)'],
        ['Many VPCs and sites that all reach each other', 'Network Connectivity Center (VPC and hybrid spokes)'],
        ['Consume or publish one service privately, overlapping ranges OK', 'Private Service Connect'],
        ['Private VMs or on-premises reaching Google APIs', 'Private Google Access; private/restricted VIPs over Interconnect'],
        ['Internal API in two regions, one address, regional failover', 'Cross-region internal Application Load Balancer'],
        ['Global users, one IP, edge TLS, CDN, WAF', 'Global external Application Load Balancer + Cloud CDN + Cloud Armor (Premium Tier)'],
        ['Inline intrusion prevention, FQDN egress rules', 'Cloud NGFW Enterprise / Standard (network firewall policies)']
      ],
      tip: 'Plan non-overlapping IP ranges, including GKE Pod and Service secondary ranges, before anything is deployed — ranges cannot shrink.'
    },
    {
      id: 'ai',
      part: 'choose',
      title: 'Which AI approach?',
      note: 'Climb the ladder only as far as the requirement needs: prebuilt beats prompted beats grounded beats tuned beats custom-trained.',
      path: [
        ['A standard task: documents, video, speech, translation, images', 'Prebuilt APIs: Document AI, Video Intelligence, Speech-to-Text, Translation, Vision'],
        ['Generate, summarise or extract from text, images, audio, video', 'Gemini models on Gemini Enterprise Agent Platform (structured output for data)'],
        ['Answers must come from your own documents, with citations', 'Grounding / RAG with Agent Search (formerly Vertex AI Search)'],
        ['A conversational or task agent with little code', 'Agent Builder; Conversational Agents for customer service'],
        ['Open or partner models, or self-hosting for sovereignty', 'Model Garden (managed APIs, or deploy to GKE)'],
        ['Repeatable training, evaluation and deployment', 'Agent Platform Pipelines'],
        ['Large-scale training on thousands of accelerators', 'AI Hypercomputer: TPU/GPU clusters, Dynamic Workload Scheduler, reservations']
      ],
      columns: ['Product', 'What it is'],
      rows: [
        ['Gemini Enterprise', 'The employee-facing AI app (formerly Google Agentspace): enterprise search across sources, agents, NotebookLM'],
        ['NotebookLM', 'Answers grounded in the sources you add; audio overviews'],
        ['Imagen', 'Image generation and editing: variations, backgrounds'],
        ['Model Armor', 'Screens prompts and responses: prompt injection, jailbreaks, harmful content, sensitive data'],
        ['Conversational Agents', 'Voice and chat virtual agents with flows and handoff (Customer Engagement Suite)']
      ],
      tip: 'Cost levers for gen AI: batch prediction for backlogs, smaller models (Flash) where they suffice, and only regenerating what changed.'
    },
    {
      id: 'migration',
      part: 'choose',
      title: 'Which migration tool?',
      columns: ['Need', 'Tool'],
      rows: [
        ['Discover servers, measure utilisation, right-size, TCO', 'Migration Center'],
        ['Rehost VMs with test clones, short cutover, rollback', 'Migrate to Virtual Machines'],
        ['Move VMware estates with the same tooling', 'Google Cloud VMware Engine'],
        ['Turn VM workloads into containers', 'Migrate to Containers'],
        ['Databases with minimal downtime; Oracle conversion', 'Database Migration Service (conversion workspaces)'],
        ['Data warehouse (Teradata, Redshift) to BigQuery', 'BigQuery Migration Service (SQL translation)'],
        ['Object data from S3, Azure, HTTP or on-premises', 'Storage Transfer Service'],
        ['Hundreds of TB over a slow link', 'Transfer Appliance']
      ],
      bullets: [
        'First waves: low-risk, few dependencies. Map dependencies and plan non-overlapping IP ranges before moving anything.',
        'Licensing: compare licence-included images with bringing your own (sole-tenant nodes when licences are per physical core).'
      ]
    },

    {
      id: 'security',
      part: 'secure',
      title: 'Which security control?',
      columns: ['Need', 'Control'],
      rows: [
        ['Same access for a team across many projects', 'Predefined role on a folder, granted to a group'],
        ['Block a permission whatever roles say', 'IAM deny policy (with exceptions)'],
        ['Just-in-time, approved, time-limited admin access', 'Privileged Access Manager'],
        ['Restrict what can be configured anywhere', 'Organization policies (locations, external IPs, domain restricted sharing, no SA keys)'],
        ['Stop data leaving managed services even with valid credentials', 'VPC Service Controls perimeter (dry-run first)'],
        ['Allow access only from managed devices or networks', 'Context-aware access (Access Context Manager)'],
        ['Control the encryption keys', 'CMEK (Cloud KMS); Cloud HSM for FIPS 140-2 L3; Cloud EKM for keys outside Google'],
        ['Store and rotate passwords and API keys', 'Secret Manager'],
        ['Find and de-identify personal data', 'Sensitive Data Protection'],
        ['Web apps or SSH without VPN', 'Identity-Aware Proxy (and IAP TCP forwarding)'],
        ['Zero trust for unmanaged devices, browser DLP', 'Chrome Enterprise Premium'],
        ['CI/CD or other clouds without service account keys', 'Workload Identity Federation'],
        ['Only signed, approved images deploy', 'Binary Authorization + Artifact Analysis + SLSA provenance'],
        ['Posture, vulnerabilities and threats across the org', 'Security Command Center (Google Security Operations for SIEM/SOAR)'],
        ['See and approve Google staff access', 'Access Transparency + Access Approval'],
        ['Encrypt data in use', 'Confidential VMs'],
        ['Protect LLM apps from injection and data leaks', 'Model Armor']
      ]
    },
    {
      id: 'compliance',
      part: 'secure',
      title: 'Regulation → design',
      columns: ['Regime', 'What the design needs'],
      rows: [
        ['HIPAA (health records)', 'BAA with Google, HIPAA-covered services only, access controls, audit logs, encryption'],
        ['PCI DSS (card data)', 'Isolated cardholder environment, tokenisation, minimal scope, logging'],
        ['GDPR (EU personal data)', 'Lawful basis and consent, minimisation, residency choices, erasure across all copies'],
        ['Children\'s privacy (e.g. COPPA)', 'Minimal collection, verifiable parental consent, retention limits, deletion'],
        ['Data sovereignty', 'Regions in the jurisdiction, resource locations policy, Assured Workloads, Cloud EKM'],
        ['SOC 2, ISO 27001', 'Google\'s reports in Compliance Reports Manager; your controls under shared responsibility'],
        ['Audits', 'Data Access logs on, aggregated sink, locked retention bucket in a logging project']
      ],
      tip: 'Compliance is shared: Google certifies the platform, you configure and operate it compliantly.'
    },

    {
      id: 'delivery',
      part: 'run',
      title: 'Delivery and release management',
      columns: ['Need', 'Answer'],
      rows: [
        ['Build, store, promote with approvals', 'Cloud Build → Artifact Registry → Cloud Deploy'],
        ['Managed private Git with IAM', 'Secure Source Manager'],
        ['Builds that reach private resources', 'Cloud Build private pools'],
        ['10% of traffic first, verify, roll back automatically', 'Canary (Cloud Deploy strategy; Cloud Run traffic split)'],
        ['Switch all at once, switch back in seconds', 'Blue/green (two MIGs or backends behind one load balancer)'],
        ['Turn a feature on for 5% without redeploying', 'Feature flags'],
        ['Rename a column during a rolling update', 'Expand and contract migrations'],
        ['No releases during a peak week', 'Cloud Deploy deploy policies'],
        ['Fast rollback', 'Immutable, versioned artifacts; promote the same image everywhere']
      ]
    },
    {
      id: 'sre',
      part: 'run',
      title: 'SRE and observability',
      bullets: [
        ['SLI', 'A measure of user experience, e.g. share of requests served successfully in under 300 ms at the load balancer.'],
        ['SLO and error budget', 'The target, and how much unreliability it allows. Budget spent → reliability work before features.'],
        ['Alerting', 'Page on symptoms (SLO burn rate), not on every cause; attach runbooks; route by severity.'],
        ['Toil', 'Manual, repetitive work that grows with load — measure it and automate it.'],
        ['Incidents', 'Mitigate first (roll back), clear roles (commander, ops, comms), blameless postmortem after.']
      ],
      columns: ['Question', 'Tool'],
      rows: [
        ['Which hop adds latency?', 'Cloud Trace'],
        ['Which function burns CPU or memory?', 'Cloud Profiler'],
        ['Which new exceptions appeared?', 'Error Reporting'],
        ['Prometheus without servers', 'Managed Service for Prometheus'],
        ['Metrics of many projects together', 'Metrics scope'],
        ['Logs of every project, SQL over them', 'Aggregated sink + Log Analytics'],
        ['A journey breaks at night', 'Synthetic monitors / uptime checks'],
        ['An app\'s alerts, incidents, maintenance in one place', 'Cloud Hub; Personalized Service Health for Google incidents']
      ]
    },
    {
      id: 'testing',
      part: 'run',
      title: 'Testing and reliability in production',
      columns: ['Practice', 'Do it like this'],
      rows: [
        ['Testing pyramid', 'Many unit tests, fewer integration tests (emulators for Pub/Sub, Spanner, Bigtable, Firestore), few end-to-end'],
        ['Load testing', 'Production-like environment, ramp past the expected peak, watch quotas and dependencies'],
        ['Chaos engineering', 'Hypothesis, small blast radius, staging first, expand gradually'],
        ['Penetration testing', 'No notice to Google needed; follow the Acceptable Use Policy; your resources only'],
        ['DR tests and game days', 'Regular, measured against RTO/RPO, including secrets, DNS and IAM'],
        ['Infrastructure tests', '`terraform validate` and `plan` in CI, policy checks on the plan, drift detection']
      ]
    },
    {
      id: 'programmatic',
      part: 'run',
      title: 'Working with Google Cloud programmatically',
      columns: ['Need', 'Answer'],
      rows: [
        ['App code calling Google APIs', 'Client libraries + Application Default Credentials from the attached service account'],
        ['429 or 503 errors', 'Exponential backoff with jitter (built into client libraries)'],
        ['Long-running operations', 'Wait on the returned operation, not a fixed sleep'],
        ['Scripts', '`gcloud … --filter --format=json|value(...)`; `gcloud storage` (gsutil is legacy); `bq`'],
        ['IDE support for Kubernetes and Cloud Run', 'Cloud Code (also in Cloud Shell Editor)'],
        ['Infrastructure as code', 'Terraform modules, remote GCS state with locking; Infrastructure Manager to run it managed'],
        ['Kubernetes-native IaC and GitOps', 'Config Connector, Config Sync'],
        ['Partner APIs: keys, quotas, monetisation, portal', 'Apigee (API Gateway for light serverless needs)']
      ]
    },
    {
      id: 'cost',
      part: 'run',
      title: 'Cost levers',
      columns: ['Situation', 'Lever'],
      rows: [
        ['Steady 24/7 baseline', 'Committed use discounts (flexible, spend-based, when machine families change)'],
        ['Interruptible batch', 'Spot VMs'],
        ['Oversized or idle resources', 'Active Assist recommendations'],
        ['Dev VMs idle at night', 'Instance schedules'],
        ['Spiky traffic', 'Autoscaling, scale to zero (Cloud Run)'],
        ['Cold data', 'Lifecycle rules, Autoclass, BigQuery long-term storage'],
        ['Unpredictable BigQuery spend', 'Editions with baseline + autoscaling slots, partitioning and clustering'],
        ['Who spends what', 'Labels + billing export to BigQuery; budgets with forecast alerts per team'],
        ['CapEx vs OpEx', 'Cloud turns upfront hardware purchases into usage-based operating expense']
      ]
    },

    {
      id: 'case-altostrat',
      part: 'cases',
      title: 'Altostrat Media',
      note: 'A media company with a large audio and video library already on GKE, Cloud Storage, BigQuery and Cloud Run functions, with on-premises ingestion and archival still to move. It wants gen AI for engagement and content insight; reliability and cost are the executives\' top priorities.',
      columns: ['Requirement (paraphrased)', 'Likely answer'],
      rows: [
        ['Cut storage cost, keep content highly available', 'Autoclass (and lifecycle) on dual-/multi-region buckets; Media CDN for delivery'],
        ['Secure, fast hybrid ingestion', 'Cloud Interconnect with MACsec or HA VPN over Interconnect'],
        ['Kubernetes on-premises and in the cloud, managed centrally', 'GKE + Google Distributed Cloud in one fleet, Config Sync'],
        ['Modern CI/CD for containers', 'Cloud Build, Artifact Registry, Cloud Deploy'],
        ['Summaries and metadata from audio and video', 'Gemini multimodal on Agent Platform, structured output to BigQuery'],
        ['Detect and filter harmful content', 'Video Intelligence / Vision SafeSearch; Model Armor for the assistant'],
        ['Auditable, explainable AI', 'Log inputs, outputs and model versions; evaluations and explanations'],
        ['24/7 natural-language support', 'Conversational Agents grounded in help content, human handoff'],
        ['Prometheus + ignored email alerts', 'Managed Service for Prometheus, SLO alerts to on-call channels']
      ]
    },
    {
      id: 'case-cymbal',
      part: 'cases',
      title: 'Cymbal Retail',
      note: 'A fast-growing online retailer with a huge catalogue, mixed on-premises and cloud systems, four database engines, file-based supplier integrations and a call centre behind an old IVR. It wants gen AI for catalogue enrichment and conversational commerce, and lower call-centre and hosting costs.',
      columns: ['Requirement (paraphrased)', 'Likely answer'],
      rows: [
        ['Generate attributes that fit the catalogue structure', 'Gemini multimodal with the category schema and a response schema'],
        ['Product image variations and backgrounds', 'Imagen'],
        ['Human review before publishing', 'Review store + IAP-protected review app; publish only approved items'],
        ['Natural-language product search', 'Discovery AI retail search'],
        ['Conversational shopping on web and app', 'Conversational Agents calling retail search as a tool'],
        ['Lower call-centre cost', 'Voice virtual agents + Agent Assist (Customer Engagement Suite)'],
        ['MySQL, SQL Server, Redis, MongoDB', 'Cloud SQL, Memorystore, Firestore with MongoDB compatibility'],
        ['SFTP and nightly ETL', 'Files into Cloud Storage, event-driven processing on Cloud Run'],
        ['Secure, compliant customer data', 'Sensitive Data Protection redaction, VPC Service Controls, CMEK, Model Armor']
      ]
    },
    {
      id: 'case-ehr',
      part: 'cases',
      title: 'EHR Healthcare',
      note: 'An electronic health records SaaS provider growing fast, leaving colocation facilities (one lease is ending soon), with containerised web apps, four database engines, insurer integrations that stay on-premises for years, Active Directory and ignored email alerts.',
      columns: ['Requirement (paraphrased)', 'Likely answer'],
      rows: [
        ['Leave the expiring data centre first', 'Rehost quickly (Migrate to Virtual Machines, GKE for containers)'],
        ['99.9% for customer-facing systems', 'Regional GKE, Cloud SQL HA, load balancer — zone-redundant is enough'],
        ['Secure, fast link to remaining on-premises systems', 'Dedicated or Partner Interconnect, HA VPN backup'],
        ['Keep legacy insurer interfaces, modernise later', 'Apigee in front of on-premises backends (strangler pattern)'],
        ['Ingest data from new providers', 'Cloud Healthcare API (HL7v2, FHIR) + Pub/Sub'],
        ['Consistent management of container environments', 'GKE fleet, Config Sync, Policy Controller'],
        ['Users in Active Directory', 'GCDS + SAML SSO (or Workforce Identity Federation)'],
        ['Consistent logging, monitoring, alerting', 'Aggregated sinks, log buckets with retention, SLO alerts'],
        ['Regulatory compliance; healthcare insights', 'BAA, VPC Service Controls, de-identification, BigQuery + ML']
      ]
    },
    {
      id: 'case-knightmotives',
      part: 'cases',
      title: 'KnightMotives Automotive',
      note: 'A carmaker (electric, hybrid and combustion models) that wants an AI-driven "automotive experience", data monetisation and better dealer tools, but runs mostly on-premises with a mainframe supply chain, siloed data, poor rural and plant connectivity, past breaches and EU data protection duties.',
      columns: ['Requirement (paraphrased)', 'Likely answer'],
      rows: [
        ['Monetise data with partners', 'BigQuery sharing (Analytics Hub), data clean rooms'],
        ['Break down data silos', 'BigQuery/BigLake lakehouse governed by Knowledge Catalog'],
        ['EU data protection', 'EU regions + locations policy, minimisation, consent, erasure'],
        ['Security framework and incident response', 'Guardrails, Security Command Center, Google Security Operations, drills'],
        ['Autonomous-driving simulation and training', 'AI Hypercomputer on GKE, Managed Lustre, Dynamic Workload Scheduler'],
        ['Rural connectivity for vehicles', 'Store-and-forward on the vehicle, ingestion to Pub/Sub; on-device models offline'],
        ['Mainframe and ERP modernisation', 'APIs in front (Apigee), data to BigQuery, replace gradually'],
        ['Plants ↔ headquarters ↔ cloud', 'Interconnect + Network Connectivity Center hybrid spokes'],
        ['Dealer tools without new hardware; CRM', 'Browser-based apps on Google Cloud; buy a SaaS CRM'],
        ['Hybrid and other clouds', 'GKE fleets with attached clusters and Google Distributed Cloud']
      ]
    },

    {
      id: 'exam-format',
      part: 'sitting',
      title: 'What the paper is',
      notesFirst: true,
      bullets: [
        ['Questions', '50–60, multiple choice and multiple select'],
        ['Time', '2 hours'],
        ['Case studies', 'Two per sitting, from the four in the guide, 20–30% of the questions'],
        ['Cost', '$200 USD'],
        ['Languages', 'English, Japanese'],
        ['Valid for', 'Two years'],
        ['Renewal', 'Standard exam; a 25-question, 1-hour renewal exam built around one gen-AI case study ($100); or a renewal path on Google Skills'],
        ['Recommended', '3+ years in industry, including 1+ year designing and managing solutions on Google Cloud'],
        ['Delivered', 'Online-proctored, or at a testing centre']
      ],
      columns: ['Section', 'Weight'],
      rows: [
        ['1 · Designing and planning a cloud solution architecture', '~25%'],
        ['2 · Managing and provisioning a cloud solution infrastructure', '~17.5%'],
        ['3 · Designing for security and compliance', '~17.5%'],
        ['4 · Analyzing and optimizing technical and business processes', '~15%'],
        ['5 · Managing implementation', '~12.5%'],
        ['6 · Ensuring solution and operations excellence', '~12.5%']
      ]
    },
    {
      id: 'strategy',
      part: 'sitting',
      title: 'Working a scenario',
      bullets: [
        'Read the last sentence first: it names what to optimise — cost, availability, least operations, compliance, speed of delivery.',
        'Underline hard constraints: data residency, RTO/RPO numbers, "no code changes", "existing skills", deadlines.',
        'Prefer managed services and Google-recommended practice when both options meet the requirement.',
        'Eliminate options that break a stated constraint, use a retired product, or grant broad roles or keys.',
        'For case studies, map the question to the specific requirement it tests; the "best" answer serves the business requirement, not the most technology.',
        'Two hours for up to 60 questions is two minutes each — read case studies before the exam so you only skim them on the day.'
      ]
    }
  ]
};
