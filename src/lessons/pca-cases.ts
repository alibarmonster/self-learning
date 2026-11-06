/**
 * The four case studies of the current Professional Cloud Architect guide
 * (v6.1), explained: how to read a case study, then each one summarised in
 * our own words — never copied — with what its existing environment implies,
 * a requirement-to-architecture map and a few checks. Google's originals are
 * linked from the PCA About page; read them too.
 */
import type { Lesson } from '@/types';

export const lesson: Lesson = {
  id: 'pca-cases',
  lang: 'en',
  title: 'The PCA Case Studies, Explained',
  intro:
    'Every Professional Cloud Architect exam uses two of the four case studies in the guide, and they make up a fifth to almost a third of the questions. This lesson shows how to read a case study, then takes each one in turn: what the company is like, what its current environment implies, and which architecture answers each requirement. The summaries are ours. Read Google\'s originals as well (linked from the About page), then drill each case study on the home page.',
  parts: [
    {
      id: 'approach',
      title: 'Reading a case study',
      sections: [
        {
          id: 'read',
          title: 'Five passes, one table',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Company overview', text: 'What the business does and what is going wrong. This tells you what "success" means for every answer.' },
                { title: 'Solution concept', text: 'What they want to build. Expect questions on each part of it.' },
                { title: 'Existing technical environment', text: 'Every system named here is a migration or integration question waiting to happen: map each one to its Google Cloud target, and note what must stay where it is.' },
                { title: 'Business and technical requirements', text: 'The heart of the case. Number them; most questions test exactly one of them.' },
                { title: 'Executive statement', text: 'The priorities that break ties between two good designs, for example "reliability and cost first" or "security is paramount".' }
              ]
            },
            {
              kind: 'table',
              caption: 'Phrases and what they point to',
              columns: ['If the case says…', 'Think'],
              rows: [
                ['reduce administration / operational costs', 'Managed services: GKE Autopilot, Cloud Run, Cloud SQL, Memorystore'],
                ['remains on-premises for years', 'Hybrid connectivity (Interconnect, HA VPN) and an API façade such as Apigee'],
                ['secure, high-performance connection', 'Dedicated or Partner Interconnect, with encryption (MACsec or HA VPN over Interconnect)'],
                ['consistent management of containers / Kubernetes everywhere', 'GKE fleets, Config Sync, Policy Controller, Google Distributed Cloud'],
                ['reduce latency to all customers', 'Global external Application Load Balancer, Cloud CDN, backends near users'],
                ['regulatory compliance, privacy', 'BAA or regime controls, VPC Service Controls, CMEK, Data Access logs, de-identification'],
                ['proactive monitoring, alerts ignored', 'Google Cloud Observability, SLOs and burn-rate alerts to on-call channels'],
                ['auditable, explainable AI', 'Logged inputs, outputs and model versions, evaluations, explanations'],
                ['human review of AI output', 'A staging store and a review UI; publish only approved items'],
                ['monetise data', 'BigQuery sharing (Analytics Hub), data clean rooms, governance']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'A case-study question usually quotes or paraphrases one requirement. Find which one, then pick the answer that meets it with the least to build and run. Options that meet a requirement the question did not ask about are distractors.'
            }
          ]
        }
      ]
    },
    {
      id: 'altostrat',
      title: 'Altostrat Media',
      sections: [
        {
          id: 'alt-summary',
          title: 'The company and what it already runs',
          blocks: [
            {
              kind: 'p',
              text: 'A media company with a large catalogue of podcasts, interviews, news and documentaries. It is already well into Google Cloud and now wants **generative AI** to drive engagement: personalised recommendations, natural-language interaction, self-service support, plus revenue features such as dynamic pricing and targeted marketing. Its executives name **reliability and cost management** as the top priorities.'
            },
            {
              kind: 'table',
              caption: 'Existing environment → implication',
              columns: ['Today', 'What it implies'],
              rows: [
                ['Delivery platform on **GKE**', 'Stay on GKE; manage it with fleets; on-premises clusters join through Google Distributed Cloud'],
                ['Media library in **Cloud Storage**', 'Storage cost is a lever: Autoclass and lifecycle, Media CDN for delivery'],
                ['**BigQuery** as the warehouse', 'Analytics and AI over content and viewing data in place (object tables, remote models)'],
                ['**Cloud Run functions** for transcoding, metadata, recommendations', 'Event-driven already; heavy transcodes fit the Transcoder API better'],
                ['On-premises ingestion and archival, to be modernised', 'Hybrid connectivity now; archive to Cloud Storage Archive class'],
                ['Google identities plus third-party IdPs', 'Identity Platform for a single customer sign-in layer'],
                ['Cloud Monitoring + self-run Prometheus, email alerts', 'Managed Service for Prometheus, SLO alerts to on-call tools']
              ]
            }
          ]
        },
        {
          id: 'alt-map',
          title: 'Requirements → architecture',
          blocks: [
            {
              kind: 'table',
              columns: ['Requirement (paraphrased)', 'Architecture'],
              rows: [
                ['Reliable operational workflows across cloud and on-premises', 'Config Sync from Git to every fleet cluster; Cloud Deploy pipelines'],
                ['Simpler infrastructure for fast deployment', 'Managed services; Cloud Build → Artifact Registry → Cloud Deploy'],
                ['Cheaper storage, still highly available', 'Autoclass on dual-/multi-region buckets; batch work off-peak'],
                ['24/7 natural-language support', 'Conversational Agents grounded in help content, handoff to people'],
                ['Summaries and rich metadata of media', 'Gemini multimodal on Gemini Enterprise Agent Platform, structured output to BigQuery'],
                ['Detect and filter inappropriate content', 'Video Intelligence explicit content, Vision SafeSearch; Model Armor on the assistant'],
                ['Auditable, explainable AI', 'Decisions logged with inputs, outputs and model version; evaluations; explanations'],
                ['Secure, fast hybrid ingestion', 'Interconnect with MACsec or HA VPN over Interconnect'],
                ['Personalisation and content virality with LLMs', 'Gemini grounded in catalogue and viewing data; recommendations from BigQuery']
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Cost matters as much as capability here: batch prediction and a smaller model (Flash) for the back catalogue, online calls only for new items.'
            },
            {
              kind: 'quiz',
              q: 'Altostrat wants its media buckets to cost less as content ages, without predicting which items stay popular. What fits best?',
              options: ['Autoclass on the buckets', 'Moving everything to Archive storage', 'Deleting content after a year', 'Filestore'],
              answer: 0,
              explain: 'Autoclass moves each object between classes based on its own access, so popular items stay fast and the long tail gets cheaper.'
            },
            {
              kind: 'quiz',
              q: 'Altostrat\'s assistant must resist jailbreaks and must not leak personal data in its answers. What do you add?',
              options: ['Model Armor on prompts and responses', 'A larger model', 'Cloud Armor rate limiting only', 'Longer prompts'],
              answer: 0,
              explain: 'Model Armor screens both directions for prompt injection, jailbreaks, harmful content and sensitive data.'
            }
          ]
        }
      ]
    },
    {
      id: 'cymbal',
      title: 'Cymbal Retail',
      sections: [
        {
          id: 'cym-summary',
          title: 'The company and what it already runs',
          blocks: [
            {
              kind: 'p',
              text: 'A fast-growing online retailer whose huge, multi-category catalogue is hard to manage by hand. It wants gen AI in three areas: **catalogue and content enrichment** (attributes, descriptions and images from supplier data), **conversational commerce** with AI shopping agents that find products through Google\'s retail search (Discovery AI), and **modernising its technical stack** to cut manual work, data transfer and error handling.'
            },
            {
              kind: 'table',
              caption: 'Existing environment → implication',
              columns: ['Today', 'What it implies'],
              rows: [
                ['Mixed on-premises and cloud', 'Migration Center assessment; hosting costs fall as the data centre empties'],
                ['MySQL, SQL Server, Redis, MongoDB', 'Cloud SQL, Memorystore, Firestore with MongoDB compatibility — least change'],
                ['Kubernetes clusters', 'GKE (Autopilot) for the containerised apps'],
                ['SFTP files and batch ETL with on-premises systems', 'Files into Cloud Storage, event-driven processing, APIs for partners'],
                ['Web app searching relational tables by name and category', 'Retail search with natural-language understanding'],
                ['IVR and agents typing orders by hand', 'Voice virtual agents and Agent Assist (Customer Engagement Suite)'],
                ['Grafana, Nagios, Elastic', 'Google Cloud Observability; Grafana can read Cloud Monitoring']
              ]
            }
          ]
        },
        {
          id: 'cym-map',
          title: 'Requirements → architecture',
          blocks: [
            {
              kind: 'table',
              columns: ['Requirement (paraphrased)', 'Architecture'],
              rows: [
                ['Attributes that fit categories and the catalogue structure', 'Gemini multimodal with the category schema, examples and a response schema'],
                ['Image variations, backgrounds, colours, overlays', 'Imagen generation and editing'],
                ['Natural-language product discovery', 'Discovery AI retail search; Conversational Agents calling it as a tool'],
                ['Scale with the catalogue and growth', 'Autoscaling services, CDN, Memorystore; batch enrichment, then only changes'],
                ['Human review before the catalogue changes', 'Suggestions in a review store, IAP-protected review app, publish approved only'],
                ['Secure, compliant data and conversations', 'Sensitive Data Protection redaction, VPC Service Controls, CMEK, Model Armor, audit logs'],
                ['Lower call-centre and hosting costs', 'Virtual agents and Agent Assist; migrate and close the data centre']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Generated content must be grounded in supplier facts and pass human review: answers that write AI output straight into the live catalogue are wrong for Cymbal.'
            },
            {
              kind: 'quiz',
              q: 'Cymbal\'s generated descriptions sometimes invent product features. What is the best fix?',
              options: [
                'Ground generation in the supplier data, constrain the output, check it automatically and keep human review',
                'Raise the model temperature',
                'Remove human review to move faster',
                'Train a model from scratch on random web text'
              ],
              answer: 0,
              explain: 'Grounding, constraints, automated evaluation and human-in-the-loop review together keep descriptions factual.'
            },
            {
              kind: 'quiz',
              q: 'Which targets move Cymbal\'s MySQL, SQL Server, Redis and MongoDB data with the least application change?',
              options: [
                'Cloud SQL, Memorystore and Firestore with MongoDB compatibility',
                'Spanner for everything',
                'BigQuery for everything',
                'Self-managed VMs for everything'
              ],
              answer: 0,
              explain: 'Each engine has a compatible managed target, which cuts operations without rewriting applications.'
            }
          ]
        }
      ]
    },
    {
      id: 'ehr',
      title: 'EHR Healthcare',
      sections: [
        {
          id: 'ehr-summary',
          title: 'The company and what it already runs',
          blocks: [
            {
              kind: 'p',
              text: 'A provider of electronic health record software, sold as a service to medical offices, hospitals and insurers in many countries. Growth is rapid, so it needs to scale, rethink disaster recovery and release continuously. Google Cloud replaces its **colocation facilities**, and the lease on one of them ends soon. Leadership blames past outages on **misconfigured systems, missing capacity for spikes and inconsistent monitoring**.'
            },
            {
              kind: 'table',
              caption: 'Existing environment → implication',
              columns: ['Today', 'What it implies'],
              rows: [
                ['Several colocation sites, one lease ending', 'That site migrates first, fast (rehost, then modernise)'],
                ['Web apps, many containerised on Kubernetes', 'GKE clusters per environment, managed as a fleet'],
                ['MySQL, SQL Server, Redis, MongoDB', 'Cloud SQL, Memorystore, Firestore with MongoDB compatibility via DMS'],
                ['Legacy file and API integrations with insurers, staying on-premises', 'Interconnect plus an API façade (Apigee) in front of them'],
                ['Microsoft Active Directory', 'GCDS + SAML SSO, or Workforce Identity Federation'],
                ['Open-source monitoring, ignored email alerts', 'Central logging and monitoring, SLO alerts to on-call tools']
              ]
            }
          ]
        },
        {
          id: 'ehr-map',
          title: 'Requirements → architecture',
          blocks: [
            {
              kind: 'table',
              columns: ['Requirement (paraphrased)', 'Architecture'],
              rows: [
                ['Onboard insurers quickly; ingest data from new providers', 'Apigee for partner APIs; Cloud Healthcare API (HL7v2, FHIR) + Pub/Sub'],
                ['At least 99.9% for customer-facing systems', 'Regional GKE, Cloud SQL HA, load balancer — zone-redundant suffices'],
                ['Central visibility and proactive action', 'Aggregated sinks, log buckets, dashboards, SLO alerts'],
                ['Healthcare trends, predictions and reports', 'De-identified data in BigQuery, BigQuery ML or Agent Platform'],
                ['Lower latency for all customers', 'Global external Application Load Balancer, Cloud CDN, regional backends'],
                ['Regulatory compliance', 'BAA, covered services, VPC Service Controls, CMEK where required, Data Access logs'],
                ['Lower administration costs', 'Managed databases and GKE Autopilot'],
                ['Secure, high-performance on-premises link', 'Dedicated or Partner Interconnect, HA VPN backup'],
                ['Provision new environments dynamically', 'Terraform project factory, cluster templates, pipelines']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '99.9% is a modest target: regional, zone-redundant designs meet it. Multi-region active-active everywhere is usually the over-engineered distractor.'
            },
            {
              kind: 'quiz',
              q: 'EHR\'s insurer integrations stay on-premises for years, but insurers should eventually call cloud services. What do you put in place?',
              options: ['Apigee in front of the on-premises backends, over Interconnect', 'Copy the legacy systems to the cloud now', 'Direct internet calls to the legacy systems', 'Freeze insurer features'],
              answer: 0,
              explain: 'An API façade gives insurers one interface while backends move to the cloud one by one behind it.'
            },
            {
              kind: 'quiz',
              q: 'Which migration should EHR start with?',
              options: ['The workloads in the data centre whose lease is ending', 'The insurer integrations', 'A full microservices rewrite first', 'Everything at once next year'],
              answer: 0,
              explain: 'The lease deadline sets the priority; rehost first, modernise after.'
            }
          ]
        }
      ]
    },
    {
      id: 'knightmotives',
      title: 'KnightMotives Automotive',
      sections: [
        {
          id: 'km-summary',
          title: 'The company and what it already runs',
          blocks: [
            {
              kind: 'p',
              text: 'A manufacturer of autonomous-capable electric, hybrid and combustion vehicles. Its electric models have a modern in-vehicle experience; the others lag and sell poorly. It wants a consistent, **AI-driven "automotive experience"** across all models within five years, **revenue from data**, a reliable online build-to-order system and better tools for dealers and technicians. **Security is paramount after past breaches**, and **EU data protection** applies.'
            },
            {
              kind: 'table',
              caption: 'Existing environment → implication',
              columns: ['Today', 'What it implies'],
              rows: [
                ['Mostly on-premises, some apps on other major clouds', 'Hybrid and multicloud: GKE fleets, attached clusters, Google Distributed Cloud'],
                ['Supply chain on an old mainframe; old ERP', 'Modernise gradually: APIs in front, data to BigQuery, replace pieces'],
                ['Dealers with no budget for equipment', 'Browser-based dealer tools on existing devices'],
                ['Many vehicle code bases, heavy technical debt', 'A shared software platform with common CI/CD and OTA updates'],
                ['Weak plant and rural vehicle connectivity', 'Interconnect + Network Connectivity Center; store-and-forward and on-device AI'],
                ['Obsolete AI infrastructure, siloed data', 'Gemini Enterprise Agent Platform; a governed lakehouse with Knowledge Catalog']
              ]
            }
          ]
        },
        {
          id: 'km-map',
          title: 'Requirements → architecture',
          blocks: [
            {
              kind: 'table',
              columns: ['Requirement (paraphrased)', 'Architecture'],
              rows: [
                ['Consistent, AI-powered in-vehicle experience', 'Shared platform; on-device models offline, cloud models when connected'],
                ['Autonomous development, simulation and compliance', 'AI Hypercomputer on GKE, Managed Lustre, Dynamic Workload Scheduler; folders per jurisdiction'],
                ['Monetise data securely', 'BigQuery sharing (Analytics Hub), clean rooms, policy tags, de-identification'],
                ['EU data protection', 'EU regions with a locations policy, minimisation, consent and erasure'],
                ['Security framework and incident response', 'Guardrails, Security Command Center, Google Security Operations, drills and training'],
                ['Better build-to-order and dealer tools', 'Decoupled, autoscaling order services with Pub/Sub; web dealer apps; a SaaS CRM'],
                ['Network upgrades, plants to headquarters', 'Interconnect and Network Connectivity Center hybrid spokes'],
                ['Upskilling and business/technical communication', 'Cloud centre of excellence, training paths, shared planning']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Cloud IoT Core was retired in 2023. Vehicle telemetry answers use store-and-forward on the vehicle and an ingestion endpoint that feeds Pub/Sub.'
            },
            {
              kind: 'quiz',
              q: 'KnightMotives wants partners to use curated data without receiving copies, while keeping control. What fits?',
              options: ['BigQuery sharing (Analytics Hub) with data clean rooms', 'Monthly CSV emails', 'Read access to production databases', 'Public buckets'],
              answer: 0,
              explain: 'Partners subscribe to shared datasets in place, and clean rooms allow joint analysis without exposing raw data.'
            },
            {
              kind: 'quiz',
              q: 'Some in-vehicle AI features must work without connectivity. What is the right design?',
              options: ['Compact models on the vehicle, cloud models when connected', 'Cloud-only AI', 'Disable AI in rural areas', 'Pre-cache every possible answer'],
              answer: 0,
              explain: 'On-device models keep essential features working offline; the cloud adds capability when the connection is there.'
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Across the four',
      sections: [
        {
          id: 'quiz',
          title: 'Check yourself',
          blocks: [
            {
              kind: 'quiz',
              q: 'Which two case studies have database estates of MySQL, SQL Server, Redis and MongoDB?',
              options: ['Cymbal Retail and EHR Healthcare', 'Altostrat Media and KnightMotives Automotive', 'Altostrat Media and Cymbal Retail', 'EHR Healthcare and KnightMotives Automotive'],
              answer: 0,
              explain: 'Both Cymbal and EHR run those four engines, so the same managed targets apply: Cloud SQL, Memorystore and Firestore with MongoDB compatibility.'
            },
            {
              kind: 'quiz',
              q: 'Which case study names reliability and cost management as the executives\' top priorities?',
              options: ['Altostrat Media', 'Cymbal Retail', 'EHR Healthcare', 'KnightMotives Automotive'],
              answer: 0,
              explain: 'Altostrat\'s executive statement puts reliability and cost first, which breaks ties toward simpler, cheaper designs.'
            },
            {
              kind: 'quiz',
              q: 'In which case study must some legacy integrations deliberately stay on-premises for years?',
              options: ['EHR Healthcare', 'Altostrat Media', 'Cymbal Retail', 'KnightMotives Automotive'],
              answer: 0,
              explain: 'EHR\'s insurer integrations are not being moved, which is why hybrid connectivity and an API façade appear in its answers.'
            },
            {
              kind: 'quiz',
              q: 'Which requirement appears in Cymbal Retail and is a strong hint for workflow design?',
              options: ['Human-in-the-loop review of gen AI output', 'Autonomous vehicle simulation', 'HL7v2 ingestion', 'Mainframe modernisation'],
              answer: 0,
              explain: 'Cymbal asks for associates to approve, reject or edit generated content before it reaches the catalogue.'
            },
            {
              kind: 'quiz',
              q: 'For KnightMotives, which statement about security fits the case best?',
              options: [
                'Security is paramount after past breaches, so answers need preventive guardrails, detection and a practised incident response',
                'Security is a low priority compared with speed',
                'Dealers handle security for the company',
                'Security can wait until the five-year plan is finished'
              ],
              answer: 0,
              explain: 'The case stresses security after breaches; layered controls and incident readiness are the expected direction.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'PCA cheat sheet', href: '#/pca/cheatsheet', note: 'one table per case study' },
    { label: 'Network lab: hybrid office to two regions', href: '#/pca/lab/network/hybrid-vpn', note: 'EHR and KnightMotives connectivity' },
    { label: 'Canvas: upload → function → BigQuery', href: '#/pca/lab/canvas/event-pipeline', note: 'event-driven ingestion (Cymbal, Altostrat)' },
    { label: 'Deep dive: VPC networks and firewall rules', href: '#/pca/learn/vpc', note: 'hybrid, Shared VPC, peering' },
    { label: 'Deep dive: Cloud Load Balancing', href: '#/pca/learn/load-balancing', note: 'global and internal designs' }
  ]
};
