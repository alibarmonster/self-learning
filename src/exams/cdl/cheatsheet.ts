/**
 * Cloud Digital Leader cheat sheet. Plain data, rendered by Cheatsheet.svelte.
 *
 * The exam is mostly "which product for this scenario", so every group leads
 * with a decision path (read top to bottom, stop at the first match) and then
 * a comparison table whose "Pick it when" column is the phrase to look for in
 * the question. "Not for" is the distractor the exam will try to sell you.
 */

import type { Cheatsheet } from '@/types';

export const cheatsheet: Cheatsheet = {
  title: 'Everything on one sheet',
  intro:
    'Three passes at the same exam. The decision tables answer "which product for this scenario" — read one top to bottom and stop at the first line that matches. The reference section is the vocabulary and the comparisons the exam asks about directly. The last part is how to sit the paper. Filter to jump straight to a term.',
  /**
   * The sheet runs in three parts: the decision tables that answer "which
   * product", then the concepts and vocabulary the exam defines rather than
   * applies, then how to sit the paper.
   */
  parts: [
    {
      id: 'choose',
      title: 'Choosing between the services',
      blurb:
        'Scenario questions, answered by elimination. Read a decision path top to bottom and stop at the first line that matches.'
    },
    {
      id: 'reference',
      title: 'Concepts and vocabulary',
      blurb:
        'The definitions, comparisons and numbers the exam asks about directly, in the order the exam guide covers them.'
    },
    {
      id: 'sitting',
      title: 'Sitting the exam',
      blurb: 'What the paper looks like, how to work through it, and where to study next.'
    }
  ],
  groups: [
    {
      id: 'compute',
      part: 'choose',
      title: 'Where should the code run?',
      note: 'Compute options from most control to least. The exam rewards the most managed option that still fits the constraint in the question.',
      path: [
        ['Legacy app, needs a specific OS, licence or full control', 'Compute Engine (a VM)'],
        ['Lift-and-shift VMware estate as-is', 'Google Cloud VMware Engine'],
        ['Containers + microservices, team can run a cluster', 'GKE (Standard, or Autopilot if they want no node management)'],
        ['A container, scale to zero, no cluster, pay per request', 'Cloud Run'],
        ['Small piece of code triggered by an event (file upload, Pub/Sub message, HTTP)', 'Cloud Run functions (Cloud Run functions)'],
        ['Web app from source code, classic PaaS, no containers mentioned', 'App Engine'],
        ['Batch job that can be interrupted and restarted, cost matters most', 'Spot / preemptible VMs']
      ],
      columns: ['Product', 'What it is', 'Pick it when', 'Not for'],
      rows: [
        ['Compute Engine', 'IaaS virtual machines', 'You need the OS, full control, legacy or licensed software, or a straight lift-and-shift', 'Anything the question wants "without managing servers"'],
        ['GKE', 'Managed Kubernetes', 'Containerised microservices at scale, portability, the team already speaks Kubernetes', 'A single small service; a team with no ops capacity (use Cloud Run)'],
        ['GKE Autopilot', 'GKE with Google-managed nodes', 'Kubernetes API without node sizing, upgrades or patching; pay per pod', 'Workloads that need custom node configuration'],
        ['Cloud Run', 'Serverless containers', 'Any container, HTTP or event driven, scale to zero, no cluster', 'Long-running stateful servers; workloads that cannot tolerate cold starts'],
        ['Cloud Run functions', 'Serverless functions (FaaS)', 'Glue code: react to an event, run briefly, exit', 'Whole applications; long jobs'],
        ['App Engine', 'Serverless PaaS for apps', 'Deploy source for a web app or API, standard runtimes, versioning and traffic splitting', 'Custom OS-level needs'],
        ['Spot VMs', 'Discounted, reclaimable VMs', 'Fault-tolerant batch: rendering, simulations, data crunching', 'Databases, anything customer-facing']
      ]
    },
    {
      id: 'storage',
      part: 'choose',
      title: 'Where should the data live?',
      note: 'The single most-tested set of distinctions. Decide the shape of the data first, then the scale, then the workload (transactions vs analytics).',
      path: [
        ['Files, images, video, backups, any blob', 'Cloud Storage'],
        ['Relational (tables, SQL, transactions), one region, ordinary scale', 'Cloud SQL (MySQL, PostgreSQL, SQL Server)'],
        ['Relational but global, horizontally scalable, strong consistency', 'Spanner'],
        ['NoSQL, enormous throughput, low latency, time series / IoT / ad-tech', 'Bigtable'],
        ['NoSQL documents for a mobile or web app, real-time sync, offline', 'Firestore'],
        ['In-memory cache or session store', 'Memorystore (Redis / Memcached)'],
        ['Analytics over huge datasets with SQL, no servers, a data warehouse', 'BigQuery'],
        ['A data lake: keep raw data cheaply until needed', 'Cloud Storage (then query it from BigQuery)']
      ],
      columns: ['Product', 'Model', 'Pick it when', 'Not for'],
      rows: [
        ['Cloud Storage', 'Object storage (buckets)', 'Unstructured files of any size; static website assets; archives; data lake landing zone', 'Row-level queries or transactions'],
        ['Cloud SQL', 'Managed relational', 'Existing MySQL/PostgreSQL/SQL Server app; transactional web backends; modest scale', 'Global writes; petabyte analytics'],
        ['Spanner', 'Distributed relational', 'Global users, unlimited horizontal scale, SQL and ACID together (banking, inventory, gaming)', 'Small apps where Cloud SQL is cheaper and simpler'],
        ['Bigtable', 'NoSQL wide-column', 'Millions of writes per second, single-digit-millisecond reads, sparse tables, time series', 'Joins, SQL, transactions across rows'],
        ['Firestore', 'NoSQL document', 'Consumer app data, hierarchical documents, live sync to clients, Firebase', 'Heavy analytics; wide-column throughput'],
        ['BigQuery', 'Serverless data warehouse', 'Analytics and BI on structured data at any scale; streaming inserts; BigQuery ML', 'Serving an app\'s transactions'],
        ['Memorystore', 'Managed Redis / Memcached', 'Caching, leaderboards, sessions, sub-millisecond reads', 'Durable system of record']
      ]
    },
    {
      id: 'storage-classes',
      part: 'choose',
      title: 'Which Cloud Storage class?',
      note: 'All four classes offer the same durability and API; they differ only in price per GB, retrieval cost and minimum storage duration. Match the class to how often the data is read.',
      path: [
        ['Read often — websites, active data, streaming', 'Standard'],
        ['Read about once a month — recent backups, monthly reports', 'Nearline (30-day minimum)'],
        ['Read about once a quarter — older backups, DR copies', 'Coldline (90-day minimum)'],
        ['Read less than once a year — regulatory archives, cold history', 'Archive (365-day minimum, cheapest to store)']
      ],
      columns: ['Class', 'Access frequency', 'Minimum storage', 'Cost trade-off'],
      rows: [
        ['Standard', 'Frequent', 'None', 'Highest storage price, no retrieval fee'],
        ['Nearline', '~ once a month', '30 days', 'Lower storage, small retrieval fee'],
        ['Coldline', '~ once a quarter', '90 days', 'Lower still, higher retrieval fee'],
        ['Archive', '< once a year', '365 days', 'Lowest storage, highest retrieval fee']
      ]
    },
    {
      id: 'data-pipeline',
      part: 'choose',
      title: 'Moving, processing and showing data',
      note: 'The pipeline vocabulary: ingest → process → store → analyse → visualise. Pub/Sub and Dataflow are the pair the guide names for modernising pipelines.',
      path: [
        ['Ingest a stream of events, decouple producers from consumers', 'Pub/Sub'],
        ['Transform data in a stream or batch (Apache Beam), serverless', 'Dataflow'],
        ['Run existing Hadoop / Spark jobs with minimal change', 'Managed Service for Apache Spark (formerly Dataproc)'],
        ['Build ETL pipelines visually, no code', 'Cloud Data Fusion'],
        ['Move an on-prem database to Cloud SQL / Spanner with minimal downtime', 'Database Migration Service'],
        ['Move petabytes of files from on-prem or another cloud', 'Storage Transfer Service (online) or Transfer Appliance (offline)'],
        ['Governed enterprise BI with a semantic layer, embedded analytics', 'Looker'],
        ['Quick self-serve dashboards and reports, free', 'Looker Studio']
      ],
      columns: ['Product', 'Role', 'Pick it when', 'Not for'],
      rows: [
        ['Pub/Sub', 'Messaging / event ingestion', 'Many producers, many consumers, spikes, asynchronous delivery', 'Storing or querying data'],
        ['Dataflow', 'Stream + batch processing', 'Real-time ETL, windowing, enrichment before BigQuery; fully managed', 'Teams that must keep Spark code unchanged (Managed Service for Apache Spark)'],
        ['Managed Service for Apache Spark (formerly Dataproc)', 'Managed Spark / Hadoop, on clusters or serverless', 'Existing Spark/Hadoop jobs, lift-and-shift of a cluster', 'Greenfield streaming (Dataflow is simpler)'],
        ['Cloud Data Fusion', 'Visual ETL', 'Integration pipelines built by analysts without code', 'Custom streaming logic'],
        ['Looker', 'Enterprise BI', 'One definition of every metric (LookML), governed self-service, alerts into workflows', 'A one-off chart in an afternoon'],
        ['Looker Studio', 'Lightweight reporting', 'Fast dashboards on BigQuery, Sheets or Ads data; sharing like a doc', 'Governed metrics across a large organisation']
      ]
    },
    {
      id: 'ai-approach',
      part: 'choose',
      title: 'Which AI approach?',
      note: 'The guide frames this as four trade-offs: speed, effort, differentiation and expertise. Pre-trained wins the first two, custom wins the third and costs the fourth.',
      path: [
        ['Common task (label an image, transcribe audio, translate), no ML team', 'Pre-trained API — call it today'],
        ['Generic model is not accurate enough on YOUR products / documents, you have labelled data, still no ML engineers', 'AutoML in Gemini Enterprise Agent Platform — your data, Google\'s modelling'],
        ['The problem is unique or the model itself is the competitive advantage, and you have ML expertise', 'Custom model on Gemini Enterprise Agent Platform (TensorFlow, PyTorch, TPUs)'],
        ['Analysts want predictions with SQL, data already in BigQuery', 'BigQuery ML'],
        ['Generate or summarise text, images, code; chat over documents', 'Gemini foundation models in Gemini Enterprise Agent Platform (prompt, then tune if needed)'],
        ['Extract fields from invoices, forms, contracts', 'Document AI']
      ],
      columns: ['Approach', 'Speed', 'Effort & expertise', 'Differentiation'],
      rows: [
        ['Pre-trained API', 'Minutes', 'Lowest — an API call', 'None; everyone gets the same model'],
        ['AutoML (Gemini Enterprise Agent Platform)', 'Days', 'Low — supply labelled data, no model code', 'Medium; the model knows your domain'],
        ['Custom model (Gemini Enterprise Agent Platform)', 'Weeks to months', 'High — data scientists, pipelines, tuning', 'Highest; the model is yours'],
        ['BigQuery ML', 'Hours', 'Low — SQL only', 'Medium; standard model types on your data'],
        ['Foundation models (Gemini)', 'Minutes', 'Low to medium — prompt design, optional tuning', 'Medium; grounded on your data']
      ]
    },
    {
      id: 'ai-apis',
      part: 'choose',
      title: 'Which pre-trained API?',
      note: 'Match the input type to the API. Speech-to-Text and Text-to-Speech are named by direction — read the question for which way the data flows.',
      path: [
        ['Images: labels, objects, text in images (OCR), faces, unsafe content', 'Vision API'],
        ['Video: shot changes, objects, labels over time', 'Video Intelligence API'],
        ['Text: sentiment, entities, syntax, classification', 'Natural Language API'],
        ['Text in one language → text in another', 'Cloud Translation API'],
        ['Audio → text (transcribe calls, captions)', 'Speech-to-Text'],
        ['Text → natural audio (read aloud, IVR voices)', 'Text-to-Speech'],
        ['Scanned documents → structured fields', 'Document AI'],
        ['Product recommendations for a retail site', 'Recommendations AI (Retail API)'],
        ['Chatbot / virtual agent for support', 'Dialogflow / Contact Center AI']
      ],
      columns: ['API', 'Input', 'Output', 'Typical scenario'],
      rows: [
        ['Vision', 'Image', 'Labels, text, objects, landmarks', 'Tag product photos; read text off signs'],
        ['Video Intelligence', 'Video', 'Labels per segment, shot detection', 'Index a media archive'],
        ['Natural Language', 'Text', 'Sentiment, entities, categories', 'Score reviews and support tickets'],
        ['Translation', 'Text', 'Translated text', 'Localise listings on the fly'],
        ['Speech-to-Text', 'Audio', 'Transcript', 'Searchable call recordings'],
        ['Text-to-Speech', 'Text', 'Audio', 'Accessibility, voice assistants'],
        ['Document AI', 'PDF / scan', 'Structured fields', 'Invoice and form processing']
      ]
    },
    {
      id: 'migration',
      part: 'choose',
      title: 'Which migration path?',
      note: 'The six R\'s, from least change to most. The question usually gives you a timeline and an appetite for change; short timeline and low appetite means rehost.',
      path: [
        ['Nobody uses it any more', 'Retire'],
        ['Cannot move yet (compliance, dependency, not worth it now)', 'Retain'],
        ['Move it as-is, fastest, no code changes', 'Rehost — "lift and shift"'],
        ['Move it and swap parts for managed services (self-run MySQL → Cloud SQL)', 'Replatform — "move and improve"'],
        ['Rebuild the architecture for the cloud (monolith → containers / microservices)', 'Refactor'],
        ['Rethink the business process itself and build something new', 'Reimagine']
      ],
      columns: ['Path', 'Change to code', 'Speed', 'Cloud benefit unlocked'],
      rows: [
        ['Retire', 'None — decommission', 'Immediate', 'Cost removed entirely'],
        ['Retain', 'None — stays put', 'n/a', 'None yet'],
        ['Rehost', 'None', 'Fast', 'Off old hardware; elasticity at VM level'],
        ['Replatform', 'Small', 'Medium', 'Managed services, less ops'],
        ['Refactor', 'Large', 'Slow', 'Cloud-native scale, resilience, velocity'],
        ['Reimagine', 'New build', 'Slowest', 'New business capability']
      ]
    },
    {
      id: 'service-models',
      part: 'choose',
      title: 'IaaS, PaaS or SaaS — and who is responsible for what',
      note: 'The further right you go, the more the provider manages and the less you can customise. Whatever the model, the customer always owns its data, its users and its access decisions.',
      path: [
        ['They want control of the OS and everything above it', 'IaaS — Compute Engine'],
        ['They want to deploy their own code and nothing else', 'PaaS — App Engine, Cloud Run'],
        ['They want to use a finished application', 'SaaS — Google Workspace']
      ],
      columns: ['Layer', 'On-premises', 'IaaS', 'PaaS', 'SaaS'],
      rows: [
        ['Data, identities, access policy', 'Customer', 'Customer', 'Customer', 'Customer'],
        ['Application code', 'Customer', 'Customer', 'Customer', 'Provider'],
        ['Runtime, middleware', 'Customer', 'Customer', 'Provider', 'Provider'],
        ['Guest OS, patching', 'Customer', 'Customer', 'Provider', 'Provider'],
        ['Virtualisation, servers, network', 'Customer', 'Provider', 'Provider', 'Provider'],
        ['Physical data centre', 'Customer', 'Provider', 'Provider', 'Provider']
      ]
    },
    {
      id: 'deployment-models',
      part: 'choose',
      title: 'Public, private, hybrid or multicloud?',
      note: 'Hybrid = private plus public. Multicloud = more than one public provider. A question can describe both at once.',
      path: [
        ['Everything on a cloud provider\'s shared infrastructure', 'Public cloud'],
        ['Dedicated infrastructure for one organisation (on-prem or hosted)', 'Private cloud'],
        ['Some on-premises / private, some public cloud, working together', 'Hybrid cloud — Anthos / GKE Enterprise manages both'],
        ['Google Cloud plus AWS and/or Azure', 'Multicloud — avoid lock-in, best-of-breed; BigQuery Omni queries across them']
      ],
      columns: ['Model', 'Pick it when', 'Cost of the choice'],
      rows: [
        ['Public', 'Speed, elasticity, lowest ops burden', 'Less physical control'],
        ['Private', 'Strict regulatory or latency requirements, existing investment', 'CapEx, staff, no elasticity'],
        ['Hybrid', 'Gradual migration, data residency, edge / factory-floor processing', 'Two environments to operate consistently'],
        ['Multicloud', 'Lock-in avoidance, resilience, one provider\'s unique service', 'Most operational complexity']
      ]
    },
    {
      id: 'security',
      part: 'choose',
      title: 'Security: which concept, which product?',
      note: 'Know the three A\'s, the three states of data, the CIA triad, and one product per job.',
      path: [
        ['Prove who a user is', 'Authentication — Cloud Identity, 2-step verification, security keys'],
        ['Decide what they may do', 'Authorisation — IAM roles, least privilege, resource hierarchy inheritance'],
        ['Record what was done', 'Auditing — Cloud Audit Logs'],
        ['Absorb DDoS, block web attacks (WAF)', 'Cloud Armor'],
        ['Manage encryption keys yourself', 'Cloud KMS (or customer-supplied keys)'],
        ['Protect data while it is being processed in memory', 'Confidential Computing (encryption in use)'],
        ['See misconfigurations and threats across the organisation', 'Security Command Center'],
        ['Detect, investigate and respond at scale (SecOps / SIEM)', 'Google Security Operations (Chronicle)'],
        ['Access without trusting the network — verify every request', 'Zero trust — BeyondCorp'],
        ['Prove to auditors what Google certifies', 'Compliance Resource Center, Compliance Reports Manager'],
        ['Log or approve Google staff access to your data', 'Access Transparency, Access Approval']
      ],
      columns: ['Term', 'Meaning', 'Attack or example'],
      rows: [
        ['Confidentiality', 'Only authorised people can read it', 'Data breach, leaked bucket'],
        ['Integrity', 'It has not been altered without detection', 'Tampered records'],
        ['Availability', 'It works when needed', 'DDoS, ransomware'],
        ['Encryption at rest', 'Stored data is encrypted (on by default)', 'Stolen disk is useless'],
        ['Encryption in transit', 'Data on the network is encrypted (on by default)', 'Eavesdropping'],
        ['Encryption in use', 'Data stays encrypted while processed', 'Confidential VMs'],
        ['Defence in depth', 'Many independent layers, no single point of trust', 'Titan chip → encrypted storage → IAM'],
        ['Shared responsibility', 'Google secures the cloud; you secure what you put in it', 'Public bucket is on you']
      ]
    },
    {
      id: 'operations',
      part: 'choose',
      title: 'Cost, reliability and support vocabulary',
      note: 'Operations questions are definitions in disguise. Budgets alert, quotas cap; SLOs are internal, SLAs are promises; RPO is data, RTO is time.',
      path: [
        ['Get an alert when spend passes a threshold (does NOT stop spending)', 'Cloud Billing budget + alerts'],
        ['Hard-limit how much of a resource a project can create', 'Quota'],
        ['See and forecast spend by project, service, label', 'Cloud Billing reports (export to BigQuery for more)'],
        ['Attribute cost to teams', 'Labels + separate projects in the resource hierarchy'],
        ['Cheaper steady workload for 1–3 years', 'Committed use discounts'],
        ['Cheaper interruptible workload', 'Spot VMs'],
        ['Survive a zone failure with no downtime', 'Multi-zone (regional) deployment — fault tolerance'],
        ['Recover after a whole region is lost', 'Multi-region + disaster recovery plan (RPO / RTO)'],
        ['Metrics, logs, traces, alerts', 'Cloud Monitoring, Cloud Logging, Cloud Trace'],
        ['Report cloud carbon emissions', 'Carbon Footprint'],
        ['Fast, 24/7 expert help with a TAM', 'Customer Care — Premium tier']
      ],
      columns: ['Term', 'Definition', 'Remember it as'],
      rows: [
        ['Resource hierarchy', 'Organisation → Folder → Project → Resource; policies inherit downward', 'Org / Folder / Project / Resource'],
        ['SLI', 'A measurement (latency, error rate, uptime)', 'Indicator'],
        ['SLO', 'Your internal target for the SLI', 'Objective'],
        ['SLA', 'The commitment to customers, with penalties', 'Agreement'],
        ['Error budget', '100% minus the SLO — reliability you may spend on change', 'Budget for risk'],
        ['RPO', 'Maximum acceptable data loss, in time', 'Point = data'],
        ['RTO', 'Maximum acceptable time to restore', 'Time = downtime'],
        ['High availability', 'Minimal downtime through redundancy', '99.99% = ~52 min/yr'],
        ['DevOps', 'Dev + Ops culture: automation, shared ownership', 'CI/CD'],
        ['SRE', 'Engineering approach to operations: SLOs, toil reduction, blameless postmortems', 'Google\'s DevOps'],
        ['Customer Care tiers', 'Basic → Standard → Enhanced → Premium', 'Faster response as you go up'],
        ['Sustainability', 'Carbon neutral since 2007, 100% renewable match since 2017, 24/7 carbon-free by 2030', '2007 / 2017 / 2030']
      ]
    },
    {
      id: 'exam-format',
      part: 'reference',
      /** Here the facts are the headline, so they sit above the weights table. */
      notesFirst: true,
      title: 'What the paper actually is',
      note: 'The shape of the exam itself. The six domains are weighted almost evenly, so no domain is safe to skip — and the pass mark is not published, which is why practice scores are the only signal you get.',
      bullets: [
        ['Questions', '50–60, multiple choice and multiple select'],
        ['Time', '90 minutes — roughly 90 seconds a question'],
        ['Pass mark', 'Not published by Google'],
        ['Cost', '$99 USD'],
        ['Languages', 'English and Japanese'],
        ['Valid for', 'Three years'],
        ['Audience', 'Business and technical people who need to speak about cloud, not implement it']
      ],
      columns: ['Domain', 'Weight', 'What it keeps asking'],
      rows: [
        ['Digital transformation with Google Cloud', '~17%', 'Why move at all; CapEx to OpEx; cloud vocabulary'],
        ['Exploring data transformation', '~16%', 'Which data product; warehouse vs lake; the data value chain'],
        ['Innovating with AI', '~16%', 'Pre-trained API vs AutoML vs custom; responsible AI'],
        ['Modernising infrastructure and applications', '~17%', 'Which compute; migration paths; containers and APIs'],
        ['Trust and security', '~17%', 'Shared responsibility; threats; Google’s trust principles'],
        ['Scaling with operations', '~17%', 'Budgets and quotas; SLI/SLO/SLA; support tiers']
      ],
      tip: 'The exam tests business value and use cases, not implementation. When two answers are both technically possible, take the one that speaks to the business outcome.'
    },
    {
      id: 'cloud-shift',
      part: 'reference',
      title: 'What changes when you move to the cloud',
      note: 'Whole questions turn on a single row of this table — deployment speed, who maintains the hardware, or which way the spending model moves.',
      tables: [
        {
          caption: 'On-premises against cloud',
          columns: ['Aspect', 'Traditional / on-premises', 'Cloud'],
          rows: [
            ['Infrastructure', 'The organisation owns the hardware', 'The provider owns the hardware'],
            ['Cost model', 'Capital expenditure (CapEx)', 'Operational expenditure (OpEx)'],
            ['Scalability', 'Limited — needs a hardware purchase', 'Virtually unlimited, on demand'],
            ['Maintenance', 'The organisation’s job', 'The provider’s job'],
            ['Deployment speed', 'Weeks to months', 'Minutes to hours'],
            ['Innovation pace', 'Slow, capped by what you own', 'Fast, latest services available immediately']
          ]
        },
        {
          caption: 'CapEx against OpEx',
          columns: ['Capital expenditure', 'Operational expenditure'],
          rows: [
            ['Up-front investment', 'Pay as you go'],
            ['Hardware depreciates', 'Subscription and usage pricing'],
            ['Large initial cost', 'Predictable running cost'],
            ['Long procurement cycles', 'Resources in minutes'],
            ['Capped by the budget round', 'Spending flexes with need']
          ]
        }
      ],
      bullets: [
        ['What cloud buys you', 'Scalability, flexibility, agility, enterprise-grade security, pay for what you use, and attention freed for the business itself'],
        ['Google’s own framing', 'Intelligence (AI and ML), freedom (open, no lock-in), collaboration, trust, sustainability'],
        ['What blocks transformation', 'Cultural resistance, legacy integration, skills gaps, security and compliance worry, migration complexity'],
        ['Cost of standing still', 'Falling behind competitors, missed markets, weaker efficiency, harder hiring, unmet customer expectations']
      ],
      tip: 'Moving to the cloud shifts spending from CapEx to OpEx and hands hardware maintenance to the provider. Both halves of that sentence are examinable.'
    },
    {
      id: 'vocabulary',
      part: 'reference',
      title: 'Vocabulary the exam defines rather than applies',
      note: 'Plain definition questions — "what is X?" — are free marks. These are the terms that come up as the question rather than inside it.',
      columns: ['Term', 'Definition'],
      rows: [
        ['Cloud', 'Delivery of computing services over the internet'],
        ['Cloud-native', 'Applications designed specifically for cloud environments'],
        ['Open source', 'Software whose source anyone may inspect, modify and improve'],
        ['Digital transformation', 'Using digital technology to create or change business processes and culture'],
        ['Region', 'A geographic area containing Google Cloud data centres'],
        ['Zone', 'An isolated location inside a region — a separate failure domain'],
        ['Latency', 'The delay between cause and effect — distance, essentially'],
        ['Bandwidth', 'The maximum rate of data transfer — width of the pipe'],
        ['DNS', 'The system that translates domain names into IP addresses'],
        ['Virtual machine', 'A software emulation of a physical computer'],
        ['Containerisation', 'Packaging code together with its dependencies'],
        ['Microservices', 'An architecture that splits an application into small independent services'],
        ['Serverless', 'An execution model where the provider manages the infrastructure entirely'],
        ['Kubernetes', 'Open-source container orchestration'],
        ['Autoscaling', 'Adjusting resources automatically as demand moves'],
        ['Load balancing', 'Spreading work across several resources'],
        ['Preemptible / Spot VM', 'A cheap VM that can be reclaimed at short notice']
      ]
    },
    {
      id: 'data-concepts',
      part: 'reference',
      title: 'Data: the words before the products',
      note: 'Before "which database", the exam asks "what kind of thing is this". Warehouse against lake is the distinction it returns to most often.',
      tables: [
        {
          caption: 'Ways of holding data',
          columns: ['Concept', 'What it is', 'Used for'],
          rows: [
            ['Database', 'An organised collection of structured data', 'Transactions, record keeping'],
            ['Data warehouse', 'A repository of structured, filtered, modelled data', 'Business intelligence and reporting'],
            ['Data lake', 'Raw data of any structure, kept in its native format', 'Big data analytics, machine learning'],
            ['Data mart', 'A slice of a warehouse for one business area', 'Department-level analytics'],
            ['Data pipeline', 'Processes that move and transform data', 'ETL and ELT workflows']
          ]
        },
        {
          caption: 'How data turns into money',
          columns: ['Value created', 'How', 'Example'],
          rows: [
            ['Business insight', 'Finding patterns and trends', 'Spotting seasonal buying patterns'],
            ['Decision support', 'Evidence instead of instinct', 'Setting inventory levels'],
            ['Process optimisation', 'Running operations better', 'Cutting manufacturing defects'],
            ['Customer understanding', 'Knowing what people prefer', 'Personalised recommendations'],
            ['New revenue', 'Selling data-based products', 'Aggregated market insight'],
            ['Risk management', 'Spotting trouble early', 'Detecting fraudulent transactions']
          ]
        }
      ],
      bullets: [
        ['The data value chain', 'Collect → store → process → analyse → visualise → act. Questions often name one step and ask which comes next.'],
        ['Why governance matters', 'Quality, security, privacy, lifecycle, accessibility and consistency — trustworthy data is the precondition for everything above'],
        ['Structured data', 'Rows and columns: transactions, inventory, coordinates, ratings'],
        ['Unstructured data', 'No schema: documents, images, video, call transcripts, social posts'],
        ['Previously untapped data', 'Logs, IoT sensor readings, clickstreams — the data cloud makes affordable to keep']
      ],
      tip: 'Data questions are about business value — insight, decisions, innovation — far more often than about technical mechanics.'
    },
    {
      id: 'ai-concepts',
      part: 'reference',
      title: 'AI: the ideas behind the product choice',
      note: 'Pair this with the two AI decision tables above. This half is the vocabulary and the judgement — what ML is for, and what responsible use of it means.',
      tables: [
        {
          caption: 'Terms',
          columns: ['Term', 'Definition'],
          rows: [
            ['Artificial intelligence', 'Technology performing tasks that normally need human intelligence'],
            ['Machine learning', 'The subset of AI that learns from data to make predictions'],
            ['Deep learning', 'The subset of ML using many-layered neural networks'],
            ['Neural network', 'A computing system loosely modelled on biological neurons'],
            ['Training data', 'The examples a model learns from'],
            ['Inference', 'Using a trained model to make a prediction'],
            ['Generative AI', 'The branch that creates new content rather than classifying existing content']
          ]
        },
        {
          caption: 'Analytics and BI against AI and ML',
          columns: ['Aspect', 'Analytics & BI', 'AI & ML'],
          rows: [
            ['Purpose', 'Understand what happened', 'Predict what will happen, or generate something new'],
            ['Humans', 'People read the results and decide', 'The system can decide on its own'],
            ['Data', 'Structured, with defined metrics', 'Structured or unstructured — text, images, audio'],
            ['Method', 'Queries and reports', 'Learning patterns from examples'],
            ['Output', 'Dashboards and visualisations', 'Predictions, classifications, recommendations']
          ]
        },
        {
          caption: 'What ML is actually for',
          columns: ['Problem type', 'What it does', 'Example'],
          rows: [
            ['Classification', 'Sorts data into known classes', 'Spam detection, image recognition'],
            ['Regression', 'Predicts a continuous number', 'Price prediction, demand forecasting'],
            ['Clustering', 'Groups similar things without labels', 'Customer segmentation, anomaly detection'],
            ['Recommendation', 'Suggests from past behaviour', 'Product and content recommendations'],
            ['Natural language', 'Reads or writes human language', 'Sentiment analysis, translation, chatbots'],
            ['Computer vision', 'Interprets images and video', 'Object detection, quality inspection']
          ]
        }
      ],
      bullets: [
        ['Good training data is', 'Accurate, complete, relevant, sufficient, diverse and balanced — a question naming a missing demographic field is testing completeness'],
        ['Responsible AI means', 'Transparency, fairness, privacy, security, human oversight and accountability'],
        ['Choosing an approach', 'Weigh speed, effort, differentiation and the expertise the team actually has']
      ],
      tip: 'Traditional analytics looks at what happened; ML predicts what will happen or automates the decision. Sort the question into one of those two before reading the options.'
    },
    {
      id: 'compute-tradeoffs',
      part: 'reference',
      title: 'VMs, containers and serverless, side by side',
      note: 'The compute decision path above says which to pick. This says why — and the rows here are themselves exam answers, especially startup time and who handles scaling.',
      tables: [
        {
          caption: 'The three models',
          columns: ['Aspect', 'Virtual machines', 'Containers', 'Serverless'],
          rows: [
            ['Control', 'High', 'Medium', 'Low'],
            ['Management overhead', 'High', 'Medium', 'Low'],
            ['Scaling', 'Manual or automated', 'Orchestrated', 'Automatic'],
            ['Startup time', 'Minutes', 'Seconds', 'Milliseconds'],
            ['You pay for', 'Allocated resources', 'Cluster resources', 'Only while code runs'],
            ['Portability', 'Limited', 'High', 'Limited'],
            ['Stateful work', 'Good fit', 'Possible with persistent storage', 'Awkward']
          ]
        },
        {
          caption: 'Why a container beats a VM for this',
          columns: ['Aspect', 'Virtual machines', 'Containers'],
          rows: [
            ['Size', 'Gigabytes', 'Megabytes'],
            ['Startup', 'Minutes', 'Seconds'],
            ['Operating system', 'A full OS per VM', 'Shared host OS'],
            ['Isolation', 'Complete', 'Process level'],
            ['Resource efficiency', 'Lower', 'Higher'],
            ['Management', 'VM tooling', 'Orchestration (Kubernetes)']
          ]
        }
      ],
      bullets: [
        ['Serverless suits', 'Variable or unpredictable load, event-driven work, microservices, and teams who want no operational burden'],
        ['Containers give you', 'The same environment in dev, test and production; portability; fast starts; isolation; and a clean fit with CI/CD'],
        ['Microservices give you', 'Independent deployment, per-service technology choices, targeted scaling, isolated failures and reusable parts'],
        ['GKE gives you', 'A managed control plane, Autopilot for managed nodes, auto-scaling, auto-upgrade, auto-repair and multi-zone availability']
      ],
      tip: 'When a question complains about slow rollouts or heavy OS overhead, it is pointing at containers. When it says "no infrastructure to manage", it is pointing at serverless.'
    },
    {
      id: 'apis',
      part: 'reference',
      title: 'APIs and what they unlock',
      note: 'The exam treats APIs as a business instrument: connecting partners, opening revenue, and putting a stable face on a legacy system.',
      columns: ['Term', 'Meaning'],
      rows: [
        ['API', 'An agreed set of rules letting one program talk to another'],
        ['REST API', 'Uses ordinary HTTP requests to read and change data'],
        ['SOAP API', 'An older XML-based messaging protocol'],
        ['GraphQL', 'A query language that returns exactly the fields the client asks for'],
        ['API gateway', 'Sits between clients and a set of backend services'],
        ['API management', 'Creating, publishing, securing and monitoring APIs — Apigee']
      ],
      bullets: [
        ['Business value', 'New revenue from data and services, partner ecosystems, third-party innovation, standard internal integration, consistent omnichannel experiences and faster delivery through reuse'],
        ['Legacy systems', 'An API exposes what the old system knows without rewriting it — the usual answer when modernisation is unaffordable'],
        ['Apigee gives you', 'Security, a developer portal, analytics, monetisation, versioning, traffic management and design tooling']
      ],
      tip: 'Two organisations needing each other’s data in real time is almost always an API question, whatever else the scenario mentions.'
    },
    {
      id: 'threats',
      part: 'reference',
      title: 'Threats, and the words for them',
      note: 'Threat questions give you a description and want the name, or give the name and want the business consequence. Both directions appear.',
      tables: [
        {
          caption: 'Threats and what they cost the business',
          columns: ['Threat', 'What it is', 'Business impact'],
          rows: [
            ['Data breach', 'Unauthorised access to sensitive data', 'Financial loss, reputation damage, regulatory penalties'],
            ['Ransomware', 'Malware that encrypts data and demands payment', 'Operational disruption, financial and data loss'],
            ['Phishing', 'Deception to steal credentials — social engineering', 'Unauthorised access, data theft, fraud'],
            ['Malware', 'Malicious software, often working unnoticed', 'Silent data theft or corruption'],
            ['Insider threat', 'Malicious or careless authorised users', 'Data leakage, intellectual property theft'],
            ['DDoS', 'Flooding a service with traffic', 'Service unavailable, customers lost'],
            ['Supply chain attack', 'Compromise through a trusted partner', 'Wide blast radius, hard to detect']
          ]
        },
        {
          caption: 'Security terms',
          columns: ['Term', 'Definition'],
          rows: [
            ['Authentication', 'Verifying who a user or system is'],
            ['Authorisation', 'Granting or denying what they may do'],
            ['Auditing', 'Recording and reviewing what was done'],
            ['Encryption', 'Encoding data so it cannot be read without the key'],
            ['Firewall', 'Monitors and filters network traffic by rule'],
            ['IAM', 'The framework for managing identities and their access'],
            ['MFA / 2SV', 'Requiring more than one proof of identity'],
            ['VPC', 'An isolated private network for your cloud resources'],
            ['SIEM', 'Security event monitoring and analysis at scale'],
            ['Least privilege', 'Granting only the access the job requires'],
            ['Zero trust', 'Never trust the network; verify every request'],
            ['Defence in depth', 'Many independent layers rather than one perimeter']
          ]
        }
      ],
      tip: 'Cloud security is shared: the provider secures the data centre, the hardware and the network beneath your workload, and what you put on top stays yours to secure.'
    },
    {
      id: 'trust-compliance',
      part: 'reference',
      title: 'Trust, privacy and where data lives',
      note: 'Google publishes commitments about customer data, and the exam quotes them almost verbatim. Data sovereignty against residency is the distinction it likes.',
      bullets: [
        ['You own your data', 'Customers own their data, not Google, and may export or move it at any time'],
        ['Never used for advertising', 'Customer data is not used to target ads — a published commitment, and a stock exam answer'],
        ['Encrypted by default', 'At rest and in transit, with no action required; CMEK exists when you want to hold the keys'],
        ['Access transparency', 'Logs of Google staff access to your content, with Access Approval to require your consent first'],
        ['Audited independently', 'ISO 27001, 27017 and 27018; SOC 1, 2 and 3; PCI DSS; HIPAA; FedRAMP; GDPR — evidence via Compliance Reports Manager'],
        ['Data residency', 'Where the data physically sits — you choose the region'],
        ['Data sovereignty', 'Whose laws govern it, which follows from where it sits'],
        ['Defence in depth', 'Custom hardware and secure boot, physical data-centre security, layered network protection, service isolation, strong identity, encrypted storage and continuous operational monitoring']
      ],
      tip: 'When a question asks how data stays private or safe "by default", the answer is usually encryption that is already on, or a trust principle Google publishes — not a product you have to buy.'
    },
    {
      id: 'cost-terms',
      part: 'reference',
      title: 'Money: the vocabulary and the discounts',
      note: 'The operations table above covers budgets, quotas and the hierarchy. This adds the financial words and the four ways of paying less.',
      tables: [
        {
          caption: 'Cost vocabulary',
          columns: ['Term', 'Definition'],
          rows: [
            ['CapEx', 'Up-front investment in assets you own'],
            ['OpEx', 'Ongoing spending on services you consume'],
            ['TCO', 'The complete cost of owning and running a technology — hardware, licences, power, people'],
            ['ROI', 'Whether the investment pays for itself'],
            ['Cost allocation', 'Attributing spend to business units or projects'],
            ['Chargeback', 'Actually billing departments for their usage'],
            ['Showback', 'Showing departments their usage without billing them'],
            ['Rightsizing', 'Matching allocated resources to what is really used']
          ]
        },
        {
          caption: 'Ways of paying less',
          columns: ['Tool', 'How it works', 'Worth'],
          rows: [
            ['Committed use discounts', 'Commit to usage for one or three years', 'Up to ~70%'],
            ['Sustained use discounts', 'Applied automatically when an instance runs most of the month', 'Up to ~30%, no action needed'],
            ['Spot VMs', 'Reclaimable capacity at dynamic pricing', 'Up to ~91%, interruptible work only'],
            ['Rightsizing recommendations', 'Active Assist points out over-provisioned resources', 'Removes waste'],
            ['Idle resource recommendations', 'Finds resources nobody is using', 'Removes waste'],
            ['Custom machine types', 'Exactly the vCPU and memory you need', 'Pay for nothing spare']
          ]
        }
      ],
      bullets: [
        ['Governance in practice', 'Give costs an owner, label everything, set budgets and alerts, cap with quotas, review regularly, forecast from trends, and use chargeback or showback so teams see their own spend'],
        ['Sustained use is automatic', 'Nothing to sign up for — if a question asks what to do to receive it, the answer is "nothing"']
      ],
      tip: 'Quotas cap what can be created; budgets only notify. A question about preventing runaway usage wants a quota, not a budget alert.'
    },
    {
      id: 'technique',
      part: 'sitting',
      title: 'How to work through the paper',
      note: 'The timing is comfortable if you do not stall: about ninety seconds a question, and every question is worth the same.',
      bullets: [
        ['Read the scenario, not just the question', 'The business context usually contains the clue — who the users are, where the data must stay, how often it is read'],
        ['Eliminate first', 'Two options are usually obviously wrong; choosing between the remaining two is a much better bet'],
        ['Watch for the keyword', 'Phrases like "without managing infrastructure", "once a quarter", "global and strongly consistent" each point at one product'],
        ['Flag and move on', 'Mark anything you are unsure of and come back — do not spend four minutes on one mark'],
        ['Prefer the business answer', 'Where two answers both work technically, the one about business outcome is usually the key'],
        ['Do not overthink', 'This is a foundational exam; the obscure reading of a question is rarely the intended one'],
        ['Trust the first instinct', 'Change an answer only when you can say what you misread the first time'],
        ['Study over weeks, not the night before', 'Spaced review beats cramming, and the vocabulary needs time to settle']
      ],
      tip: 'The commonest way to lose marks is to answer as an engineer: picking the most technically capable option when the question asked which one serves the business.'
    },
    {
      id: 'resources',
      part: 'sitting',
      title: 'Where to study next',
      note: 'The material this sheet condenses, in its original form.',
      bullets: [
        ['Google Cloud Skills Boost', 'The official Cloud Digital Leader learning path'],
        ['Official exam guide', 'The domain list this sheet and the mock papers are built from'],
        ['Google Cloud documentation', 'The product pages, when a distinction here is not enough'],
        ['Architecture Framework and Architecture Center', 'Best practices and reference architectures'],
        ['Official practice exam', 'Google’s own sample questions'],
        ['Community question banks', 'The wording of real questions — the Community Exam in this app is built from them'],
        ['Hands-on labs', 'Qwiklabs and the console itself; even a little clicking around fixes the vocabulary']
      ]
    }
  ]
};
