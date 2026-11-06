import type { Question } from '@/types';

/**
 * The four case studies in the current Professional Cloud Architect guide
 * (v6.1): Altostrat Media, Cymbal Retail, EHR Healthcare and KnightMotives
 * Automotive — 18 questions each. The real exam uses two of them per sitting
 * for 20–30% of the paper. Each prompt restates the facts it relies on in our
 * own words, so a question can be answered without the PDF open; the
 * case-studies lesson summarises each one and links Google's originals.
 */
export const cases: Question[] = [
  // ── Altostrat Media ─────────────────────────────────────────────────────
  {
    id: 'pca-c-alt-01',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. The media library in Cloud Storage keeps growing; new releases are popular for a few weeks, and most older items are rarely played. Leadership wants lower storage costs while keeping content highly available. What should you recommend?',
    options: [
      'Enable Autoclass on the media buckets, keeping their dual- or multi-region locations for availability',
      'Move every object to Archive storage in a single region, since most of the library is rarely played',
      "Delete media older than one year and restore titles from the studios' masters if they are requested",
      'Copy the library to Filestore Enterprise instances, which give faster and more available access',
    ],
    answer: 0,
    explanation: 'Autoclass moves each object to a colder class as its own access drops and back when it is played again, so cost follows popularity without hand-written rules, while the bucket location keeps availability. Archive in one region adds retrieval fees and reduces availability, deleting content loses revenue, and Filestore costs more.'
  },
  {
    id: 'pca-c-alt-02',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Content ingestion still runs on-premises and sends large media files to Google Cloud. The company needs secure, high-performance hybrid connectivity for this ingestion. What should you design?',
    options: [
      'Cloud Interconnect (Dedicated or Partner) with MACsec or HA VPN over Interconnect for encryption',
      'HA VPN over the public internet as the only path, sized with extra tunnels for the large files',
      'Uploads through the Cloud Storage console by operators, using signed URLs for each media file',
      "Direct Peering with Google's edge, which carries private RFC 1918 traffic into the VPC network",
    ],
    answer: 0,
    explanation: 'Interconnect gives private, high-bandwidth, low-latency links, and MACsec or HA VPN over Interconnect adds encryption. VPN alone is limited in throughput, console uploads do not scale, and Direct Peering reaches Google public services rather than the VPC.'
  },
  {
    id: 'pca-c-alt-03',
    topic: 'Altostrat Media',
    difficulty: 'hard',
    prompt: 'Altostrat Media case study. The company wants scalable Kubernetes environments both on-premises and in Google Cloud, managed centrally. Which approach fits?',
    options: [
      'GKE in the cloud and Google Distributed Cloud on-premises, registered to one fleet with Config Sync and Policy Controller',
      'Separate self-managed Kubernetes clusters on-premises and in the cloud, each one configured by hand by its team',
      'Move all of the on-premises workloads to Cloud Run functions immediately and retire the on-premises clusters',
      'A single GKE cluster stretched across the on-premises data centre and a cloud region, managed from the cloud',
    ],
    answer: 0,
    explanation: 'Fleets give one management plane over GKE and Google Distributed Cloud clusters, and Config Sync and Policy Controller keep configuration and policies consistent. Hand-configured clusters drift, an immediate move to functions ignores the on-premises need, and a cluster cannot be stretched that way.'
  },
  {
    id: 'pca-c-alt-04',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. CI/CD for containerised deployments must be modernised and managed centrally across environments. What should you recommend?',
    options: [
      "Cloud Build, Artifact Registry for images, and Cloud Deploy pipelines promoting releases across the fleet's clusters",
      'Each team running its own Jenkins server on a VM, with custom deployment scripts written for every cluster',
      "Images built on developer laptops and pushed by hand to each cluster's registry after local testing",
      'Releases deployed by editing the manifests directly in the production clusters with `kubectl edit`',
    ],
    answer: 0,
    explanation: 'A managed build, registry and delivery pipeline gives one consistent, auditable path to every environment. Per-team servers, laptop builds and hand edits are exactly the inconsistency the requirement wants to remove.'
  },
  {
    id: 'pca-c-alt-05',
    topic: 'Altostrat Media',
    difficulty: 'easy',
    prompt: 'Altostrat Media case study. The company wants concise summaries generated automatically for podcasts, interviews and video documentaries. What should you use?',
    options: [
      'Gemini models on Gemini Enterprise Agent Platform, which accept audio and video directly',
      'The Cloud Translation API, applied to the transcripts that the editors write by hand',
      "A custom summarisation model trained from scratch on GPUs with the company's own media",
      'Natural Language API sentiment analysis on the subtitles of each podcast and video',
    ],
    answer: 0,
    explanation: 'Gemini is multimodal, so it can summarise audio and video content without building a model. Translation changes language, training from scratch is unnecessary, and sentiment analysis does not summarise.'
  },
  {
    id: 'pca-c-alt-06',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Rich metadata (people, topics, scenes, spoken keywords) must be extracted from media assets and stored for search and analytics, with as little custom model training as possible. What should you design?',
    options: [
      'Gemini multimodal prompts that return structured JSON for each asset, written to BigQuery',
      'Manual tagging of every asset by an editorial team',
      'Training separate object, speech and topic models with Agent Platform Pipelines',
      'The Cloud Vision API applied to audio files'
    ],
    answer: 0,
    explanation: 'Gemini can analyse video, audio and text together and return metadata in a defined schema, ready for BigQuery. Manual tagging does not scale, custom training is slow and costly, and Vision analyses images, not audio.'
  },
  {
    id: 'pca-c-alt-07',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. The new conversational assistant must not produce harmful content and must resist users trying to jailbreak it or extract personal data. Which two controls should you add? (Choose two.)',
    options: [
      'Model Armor screening of prompts and responses for jailbreaks and sensitive data',
      "Gemini's configurable safety settings, set to block harmful content categories",
      'A longer, stricter system prompt that asks the model to refuse harmful requests',
      'Rate limiting on the load balancer, so that attackers cannot send many prompts',
      'A larger Gemini model, since larger models resist every jailbreak attempt on their own',
    ],
    answer: [0, 1],
    explanation: "Model Armor detects prompt injection, jailbreaks, harmful content and sensitive data in both directions, and Gemini's safety settings add model-side filtering of harmful categories. Prompt wording alone is easy to bypass, rate limits do not inspect content, and no model is immune."
  },
  {
    id: 'pca-c-alt-08',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. User-uploaded and partner video must be checked for inappropriate content before it is published. What is the most direct approach?',
    options: [
      'Run Video Intelligence explicit content detection, plus SafeSearch on thumbnails, in ingestion and hold flagged items',
      'Publish everything immediately and remove items after viewers or partners send complaints about them',
      'Ask uploaders and partners to confirm in a form that their content is appropriate before publishing',
      'Have the support team watch a random sample of five percent of new uploads each day and remove problems',
    ],
    answer: 0,
    explanation: 'Automated detection in the ingestion pipeline checks every item before publication, and human review handles the flagged ones. Reacting to complaints or self-declaration detects nothing in advance, and a five percent manual sample misses most uploads.'
  },
  {
    id: 'pca-c-alt-09',
    topic: 'Altostrat Media',
    difficulty: 'hard',
    prompt: 'Altostrat Media case study. AI systems must be auditable and their decisions explainable, for example why a video was flagged or recommended. What should the design include?',
    options: [
      "Log each decision's inputs, outputs and model version to BigQuery, version and evaluate models, and add explanations",
      "Keep no records of model decisions, so that no personal data can leak from the AI systems' logs",
      'Let each team decide what to log for its own models, and review those choices centrally once a year',
      'Replace all of the models with manual decisions by editors, which are easier to explain to auditors',
    ],
    answer: 0,
    explanation: 'Auditability needs a durable record of what each model decided, from which inputs and which version, plus evaluation results and explanations where models support them. No records, inconsistent logging or abandoning AI do not meet the requirement.'
  },
  {
    id: 'pca-c-alt-10',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Customers need natural-language help with their accounts and content around the clock, with escalation to staff for complex issues. What should you build?',
    options: [
      'A virtual agent with Conversational Agents, grounded in help content, with handoff to human support',
      'A shared support inbox monitored during office hours, with templated replies for common questions',
      'A static FAQ page with a search box, linked from every page of the streaming apps and website',
      'A Cloud Run function that matches keywords in questions to canned answers, without any handoff',
    ],
    answer: 0,
    explanation: 'Conversational Agents provide 24/7 natural-language support with generative answers grounded in help content, and hand off to staff when needed. Office-hours email and a static FAQ do not converse around the clock, and canned keyword answers with no handoff cannot handle complex issues.'
  },
  {
    id: 'pca-c-alt-11',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Monitoring mixes Cloud Monitoring and self-run Prometheus, and alerts arrive only by email. What should you recommend?',
    options: [
      'Managed Service for Prometheus with Cloud Monitoring, SLO-based alerts and on-call channels such as PagerDuty',
      'Add more email recipients to the existing alerts so that someone on the team always sees them',
      "Turn off Prometheus, keep only Cloud Monitoring's default metrics, and keep the email alerts",
      'Write all metrics to Cloud Storage files each day and review them in a weekly operations meeting',
    ],
    answer: 0,
    explanation: 'Managed Service for Prometheus keeps their Prometheus metrics without running servers, Cloud Monitoring unifies them, and SLO-based alerts to on-call channels make alerts actionable. More email, fewer metrics or weekly files make detection worse.'
  },
  {
    id: 'pca-c-alt-12',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. The on-premises archival system is the first to be retired. Archived media is rarely retrieved but must be kept for years. What should you do?',
    options: [
      'Move the archive to Archive-class Cloud Storage with Storage Transfer Service and on-premises agents',
      'Keep the archive on-premises indefinitely and retire the other systems around it first',
      'Load the archived media into BigQuery tables so that it can be searched and retrieved with SQL',
      'Store the archive on Compute Engine persistent disks, attached to a VM that serves retrievals',
    ],
    answer: 0,
    explanation: 'Archive storage is the cheapest place for rarely retrieved, long-kept data, and Storage Transfer Service agents move it from on-premises. Keeping it blocks retirement, BigQuery is for analytics, and persistent disks are expensive for archives.'
  },
  {
    id: 'pca-c-alt-13',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Viewers sign in today through a mix of Google identities and third-party identity providers, and the platform needs one consistent customer sign-in layer. What should you use?',
    options: [
      'Identity Platform, with the Google and third-party providers configured as sign-in methods',
      'Cloud Identity accounts created for every viewer, synchronised from the old systems',
      'Workforce Identity Federation for all viewers, with a pool per identity provider',
      "Shared service account keys for each partner app that signs in on the viewers' behalf",
    ],
    answer: 0,
    explanation: 'Identity Platform is customer identity and access management that supports Google and third-party OIDC and SAML providers in one layer. Cloud Identity and Workforce Identity Federation are for employees, and shared keys are not user authentication.'
  },
  {
    id: 'pca-c-alt-14',
    topic: 'Altostrat Media',
    difficulty: 'hard',
    prompt: 'Altostrat Media case study. Operational workflows behave differently in each environment because cloud and on-premises clusters are configured by hand. How do you improve their reliability?',
    options: [
      'Keep cluster configuration and policies in Git, apply them to every fleet cluster with Config Sync, and review changes',
      'Document the manual configuration steps in a wiki so that every engineer follows the same procedure',
      'Give every engineer cluster-admin on all clusters so that differences can be fixed as soon as they appear',
      'Freeze all changes to the clusters until a full audit has listed every difference between environments',
    ],
    answer: 0,
    explanation: 'GitOps with Config Sync keeps every cluster in the reviewed, declared state, removing drift. Wikis still rely on manual steps, broad admin rights add risk, and freezing changes blocks the business.'
  },
  {
    id: 'pca-c-alt-15',
    topic: 'Altostrat Media',
    difficulty: 'hard',
    prompt: 'Altostrat Media case study. Analysts want to find trends across the content itself (topics, tone, recurring themes) together with viewing data already in BigQuery, using SQL. What should you design?',
    options: [
      'BigQuery object tables over the media in Cloud Storage, analysed with Gemini from SQL and joined with viewing data',
      "Download a sample of the media to analysts' laptops for manual tagging, then load the tags into BigQuery",
      'Copy every media file into BigQuery as BYTES columns so that analysts can query the content directly',
      "Export the viewing data to spreadsheets and compare it with editors' notes about each title's themes",
    ],
    answer: 0,
    explanation: 'Object tables expose unstructured files to BigQuery, and remote models let SQL call Gemini on them, so content insights join viewing data in place. Manual review does not scale, storing raw media as bytes is impractical, and spreadsheets cannot handle the volume.'
  },
  {
    id: 'pca-c-alt-16',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Summaries are needed for 400,000 existing archive items once, then for new items as they arrive. Cost management is a top priority. What should you recommend?',
    options: [
      'Batch inference with a cost-efficient Gemini model (such as Flash) for the backlog, then online calls for new items',
      'Online requests with the largest Gemini model for every archive item, sent one at a time for quality',
      'Summaries only for archive items that viewers search for or complain about, generated on demand',
      'A team of editors hired to write summaries for the archive, with Gemini used only for new items',
    ],
    answer: 0,
    explanation: 'Batch prediction suits large backlogs at lower cost, and a smaller, faster model is usually enough for summaries. Calling the largest model one by one is slow and expensive, and complaint-driven or manual summaries miss the goal.'
  },
  {
    id: 'pca-c-alt-17',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Transcoding long documentaries in Cloud Run functions sometimes hits time limits and is hard to manage. What should you recommend?',
    options: [
      'Use the Transcoder API, started by an event when a file arrives, and write outputs back to Cloud Storage',
      "Raise the function's memory and timeout to the maximum and retry the jobs that still time out",
      'Transcode on a single large on-premises server that the media team already knows how to run',
      'Split each documentary by hand into short clips first, so that every clip fits the time limit',
    ],
    answer: 0,
    explanation: 'The Transcoder API is a managed service for converting media at scale, so long files are no longer limited by function timeouts. Raised memory and timeout settings still hit a maximum, a single server is a bottleneck, and manual splitting does not scale.'
  },
  {
    id: 'pca-c-alt-18',
    topic: 'Altostrat Media',
    difficulty: 'medium',
    prompt: 'Altostrat Media case study. Viewing is growing worldwide, and streaming large video files must stay reliable and cost-effective at peak. Which delivery service fits?',
    options: ['Media CDN in front of the Cloud Storage origin', 'A single regional load balancer with no caching', 'Serving directly from GKE Pods with public IPs', 'Memorystore as a video cache'],
    answer: 0,
    explanation: 'Media CDN is built for large-scale streaming from Google\'s edge, reducing origin load and egress cost. An uncached regional endpoint, public Pod IPs or an in-memory cache do not deliver video at global scale.'
  },

  // ── Cymbal Retail ──────────────────────────────────────────────────────
  {
    id: 'pca-c-cym-01',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Product attributes must be generated from supplier titles, descriptions and images, and must fit each product category and Cymbal\'s existing catalogue structure. What should you design?',
    options: [
      "Multimodal Gemini prompts with the category's attribute schema and examples, plus a response schema for valid output",
      'Free-text prompts without any schema, accepting whatever attributes the model returns for each product',
      'Keyword rules written by hand for each supplier, mapping words in titles to catalogue attributes',
      'An image-only classifier trained from scratch for each category on the existing product photos',
    ],
    answer: 0,
    explanation: 'Passing the category schema and examples, and constraining the output with a response schema, makes attributes consistent with the catalogue. Unconstrained output drifts, hand rules do not scale across suppliers, and an image-only model ignores the text.'
  },
  {
    id: 'pca-c-cym-02',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Associates must review AI-generated attributes, descriptions and images, and approve, reject or edit them before anything reaches the live catalogue. How should the workflow be designed?',
    options: [
      'Save suggestions with a status, review them in an internal app behind IAP, and publish only approved items',
      'Write the AI output straight into the live catalogue and let associates fix problems after publishing',
      'Email every suggestion to the associates and publish the ones that nobody objects to within a day',
      "Let a second model approve the first model's suggestions, so that no associate time is needed",
    ],
    answer: 0,
    explanation: 'A staging store plus a review app keeps a human in the loop, and only approved changes are published. Direct writes skip review, email does not scale or track decisions, and letting a second model approve removes the human check the requirement asks for.'
  },
  {
    id: 'pca-c-cym-03',
    topic: 'Cymbal Retail',
    difficulty: 'easy',
    prompt: 'Cymbal Retail case study. From one base product photo, the team needs variations in different colours, new backgrounds and added text overlays. Which capability fits?',
    options: [
      'Imagen image generation and editing on Gemini Enterprise Agent Platform',
      'Cloud Vision API object localisation and label detection on the photo',
      'Speech-to-Text with a custom model trained on product descriptions',
      'BigQuery ML clustering of the existing product photos by colour',
    ],
    answer: 0,
    explanation: 'Imagen generates and edits images, including variations and background changes. Vision analyses images rather than creating them, and the other services are unrelated.'
  },
  {
    id: 'pca-c-cym-04',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Today the website finds products by querying relational databases for names and categories, so searches like "waterproof hiking boots under 100 dollars" work poorly. What should you recommend?',
    options: [
      'Discovery AI retail search, which understands natural-language queries and ranks by relevance and behaviour',
      'More SQL `LIKE` patterns and synonyms on product names and categories in the relational database',
      'A larger Cloud SQL instance with read replicas so that the existing search queries run faster',
      'A static category menu with more levels and filters, replacing the free-text search box entirely',
    ],
    answer: 0,
    explanation: 'Google\'s retail search (Discovery AI) handles natural-language, attribute-aware queries and personalised ranking, which is what the case calls for. More SQL patterns, bigger databases or menus do not understand intent.'
  },
  {
    id: 'pca-c-cym-05',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Virtual agents on the website and app should hold natural-language shopping conversations and show relevant products. How should they be built?',
    options: [
      'Conversational Agents that call Discovery AI retail search as a tool to fetch products during the chat',
      'A rules-based chatbot with fixed menus that lists the best-selling products in each category',
      "A generic chatbot with no access to the catalogue, answering from the model's general knowledge",
      "A form on the website that emails each customer's product request to a member of the sales staff",
    ],
    answer: 0,
    explanation: 'Agents that call the retail search during conversation can turn natural language into relevant, current product results. Fixed menus are not conversational, an agent without catalogue access invents answers, and email is not real time.'
  },
  {
    id: 'pca-c-cym-06',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Calls go through an old IVR to human agents, who often enter orders by hand when customers cannot finish online. Cymbal wants lower call-centre costs. What should you recommend?',
    options: [
      'Customer Engagement Suite: voice agents that resolve common requests and take orders, and Agent Assist for the rest',
      'Hire more call-centre staff for peak periods so that callers wait less before reaching a human agent',
      'Remove the phone line entirely and direct every customer to the website and the mobile app instead',
      'Record every call for a weekly quality review, and keep the existing IVR menus and human agents',
    ],
    answer: 0,
    explanation: 'Voice virtual agents handle routine calls end to end, and Agent Assist makes human agents faster on the rest, cutting staffing cost. More staff raises cost, removing the line hurts customers, and recordings alone change nothing.'
  },
  {
    id: 'pca-c-cym-07',
    topic: 'Cymbal Retail',
    difficulty: 'hard',
    prompt: 'Cymbal Retail case study. Catalogue and customer data live in MySQL, SQL Server, Redis and MongoDB. Cymbal wants managed services with the least application change. Which mapping fits?',
    options: [
      'Cloud SQL for MySQL and SQL Server, Memorystore for Redis, and Firestore with MongoDB compatibility for MongoDB',
      "Everything moved into Spanner, with every application's queries rewritten for its SQL dialect",
      'Everything moved into BigQuery, which then serves as the operational database for every application',
      'Self-managed databases on Compute Engine VMs for every engine, kept at the same versions as today',
    ],
    answer: 0,
    explanation: 'Each engine has a managed, compatible target, so applications change little and operations shrink. A single rewrite into Spanner is a large project, BigQuery is not an operational database, and self-managed VMs keep the operations burden.'
  },
  {
    id: 'pca-c-cym-08',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Data silos prevent a unified view of the customer journey across web, app and call centre. What should you design?',
    options: [
      'A central BigQuery analytics platform fed continuously by Datastream from databases and by Pub/Sub events',
      'A nightly CSV export from each system, emailed to the analysts who combine the files by hand',
      'Separate reports for each system, compared by hand in a monthly customer journey review',
      'One shared operational database that every application, from web to call centre, writes into',
    ],
    answer: 0,
    explanation: 'Streaming operational changes and events into BigQuery gives a unified, current view for analysis. Emailed exports and hand-compared reports keep the silos, and one shared operational database couples every application.'
  },
  {
    id: 'pca-c-cym-09',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Suppliers send product files through SFTP for nightly ETL batches, and errors are found days later. How should these integrations be modernised?',
    options: [
      'Land supplier files in Cloud Storage and trigger event-driven validation on Cloud Run that reports errors at once',
      'Run the same nightly ETL on a bigger VM so that the batches finish earlier and errors appear sooner',
      'Ask suppliers to email their files to a shared inbox that the integration team processes each day',
      'Process the supplier files once a week instead, with a larger team checking each batch for errors',
    ],
    answer: 0,
    explanation: 'Event-driven processing handles each file as it arrives and surfaces errors at once. A bigger VM keeps the batch delay, email is unmanageable, and weekly processing makes errors even later.'
  },
  {
    id: 'pca-c-cym-10',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Third-party partners (suppliers, marketplaces, delivery firms) need secure, managed access to catalogue and order APIs, with per-partner keys and quotas. What should you use?',
    options: ['Apigee in front of the internal services', 'Direct access to the databases for each partner', 'A shared admin password for all partners', 'Public endpoints without authentication'],
    answer: 0,
    explanation: 'Apigee manages partner APIs with credentials, quotas, policies and analytics. Database access, shared passwords and open endpoints are insecure and unmanaged.'
  },
  {
    id: 'pca-c-cym-11',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. The storefront must handle Cymbal\'s growth and seasonal peaks without slowing down. Which design fits?',
    options: [
      'Stateless services on Cloud Run or GKE Autopilot, Cloud CDN for static content, and Memorystore for hot data',
      "A fixed number of large VMs sized for today's peak traffic, with more added by hand each season",
      'One database server shared by every component and scaled up by hand before each seasonal peak',
      'Turning off search and recommendations during peak periods to reduce the load on the storefront',
    ],
    answer: 0,
    explanation: 'Autoscaling stateless services, edge caching and an in-memory cache keep performance steady as traffic grows. Fixed capacity and manual scaling fail at peaks, and disabling search hurts sales.'
  },
  {
    id: 'pca-c-cym-12',
    topic: 'Cymbal Retail',
    difficulty: 'hard',
    prompt: 'Cymbal Retail case study. Virtual agent conversations sometimes contain card numbers and home addresses, and these transcripts are stored for quality analysis. How should the data be handled?',
    options: [
      'Redact sensitive data with Sensitive Data Protection before storage, restrict access, and keep payments in a PCI-scoped flow',
      'Store the full transcripts in a restricted bucket and rely on IAM roles alone to protect the card numbers',
      'Delete all transcripts immediately after each conversation, giving up the quality analysis entirely',
      'Ask customers at the start of each conversation not to mention card numbers or any personal details',
    ],
    answer: 0,
    explanation: 'Removing sensitive values before storage and keeping card handling in a separate, tokenised flow protects customers and limits compliance scope while keeping transcripts useful. IAM alone leaves raw data exposed, deleting everything loses value, and asking customers is not a control.'
  },
  {
    id: 'pca-c-cym-13',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Monitoring uses Grafana, Nagios and Elastic, and problems are often found by customers first. Cymbal wants proactive monitoring. What should you recommend?',
    options: [
      'Google Cloud Observability with SLOs and burn-rate alerts on customer journeys, keeping Grafana as a viewer',
      'Add a fourth monitoring tool that collects alerts from Grafana, Nagios and Elastic into one inbox',
      'Review the logs from all three tools manually once a week to spot problems before customers do',
      'Keep the current tools and treat customer complaints as the main alerting signal for incidents',
    ],
    answer: 0,
    explanation: 'Unified metrics, logs and traces with SLO-based alerting detect user-facing problems before customers report them, and Grafana can stay as a front end. Another tool adds fragmentation, and weekly reviews or complaints are too late.'
  },
  {
    id: 'pca-c-cym-14',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. One business goal is to reduce data-centre hosting costs. What should be the first step for the remaining on-premises systems?',
    options: [
      'Assess them with Migration Center to plan right-sized rehosting, replatforming or retirement, with savings',
      'Sign a new long-term data-centre lease at a lower rate while the cloud migration is being planned',
      'Migrate everything as-is in one weekend, without an assessment, to close the data centres sooner',
      'Buy new, denser on-premises servers so that the remaining systems fit into a smaller data centre',
    ],
    answer: 0,
    explanation: 'An assessment shows what each system needs and the expected costs, so migration waves and dispositions can be planned. A new lease or new servers keep the costs, and an unassessed big-bang move is high-risk.'
  },
  {
    id: 'pca-c-cym-15',
    topic: 'Cymbal Retail',
    difficulty: 'hard',
    prompt: 'Cymbal Retail case study. Generated product descriptions sometimes claim features that the supplier data does not mention. What should you change?',
    options: [
      'Ground the prompt in the supplier data, tell the model to use only those facts, check outputs against it, and keep review',
      'Raise the temperature so the model writes more creative descriptions that customers find engaging',
      'Remove the human review step so that descriptions are published faster and corrected after complaints',
      "Switch off generated descriptions entirely and return to suppliers' original text for every product",
    ],
    answer: 0,
    explanation: 'Grounding in source facts, constraining instructions, automated evaluation and human review reduce invented claims. Higher temperature increases variation, removing review publishes errors, and switching off the feature loses the benefit.'
  },
  {
    id: 'pca-c-cym-16',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Enrichment must run for millions of existing products and then only for new or changed ones, at controlled cost. What should you recommend?',
    options: [
      'Batch inference for the existing catalogue, then event-driven calls only when a product or its supplier data changes',
      "Regenerate every product's content every night so that all descriptions always reflect the latest model",
      'Call the largest model for each product on every page view, so that content is always generated fresh',
      'Run the enrichment once for the whole catalogue and never update it, even when supplier data changes',
    ],
    answer: 0,
    explanation: 'Batch processing is efficient for the backlog, and change-driven calls avoid paying again for unchanged products. Nightly regeneration and per-view calls waste money, and never updating lets the catalogue go stale.'
  },
  {
    id: 'pca-c-cym-17',
    topic: 'Cymbal Retail',
    difficulty: 'medium',
    prompt: 'Cymbal Retail case study. Leadership wants to know whether conversational commerce actually improves the business. How should success be measured?',
    options: [
      'Compare conversion, average order value and return rate for assistant users against a control group',
      'Count the messages the assistant sends each day and report the growth in conversations to leadership',
      'Measure the GPU utilisation of the model endpoints, since higher usage means the assistant is valued',
      'Survey the development team on whether they think the assistant helps customers find products',
    ],
    answer: 0,
    explanation: 'Business KPIs compared against a control group show the real impact. Message counts, GPU use and team opinion do not measure business outcomes.'
  },
  {
    id: 'pca-c-cym-18',
    topic: 'Cymbal Retail',
    difficulty: 'hard',
    prompt: 'Cymbal Retail case study. The gen AI services will process customer data and supplier content. Which set of controls best meets the data security and compliance requirement?',
    options: [
      'Least-privilege service accounts, a VPC Service Controls perimeter, CMEK where required, Data Access audit logs and Model Armor',
      'One shared Owner service account for all of the AI services, so that access problems never block a release',
      'Public endpoints for every model with API keys, so that partners and suppliers can test them freely',
      'Audit logging turned off for the AI projects to reduce cost, with access reviews done once a year instead',
    ],
    answer: 0,
    explanation: 'Layered controls cover identity, exfiltration, key control, accountability and AI-specific threats. Shared Owner accounts, public endpoints and no audit logs all weaken security and compliance.'
  },

  // ── EHR Healthcare ──────────────────────────────────────────────────────
  {
    id: 'pca-c-ehr-01',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. The lease on one colocation data centre expires soon, and Google Cloud will replace the colocation facilities. Which migration step should come first?',
    options: [
      'Prioritise the expiring data centre: rehost its VMs with Migrate to Virtual Machines and move its containers to GKE',
      'Start with the legacy insurer integrations, even though they are planned to stay on-premises for years',
      'Refactor every application into microservices first, then move them all to Google Cloud together',
      'Wait until all of the colocation facilities can be moved together in one coordinated cutover',
    ],
    answer: 0,
    explanation: 'The lease deadline drives priority, so the fastest safe path for those workloads comes first, with modernisation later. The insurer integrations are staying put, a full refactor misses the deadline, and waiting risks losing the facility.'
  },
  {
    id: 'pca-c-ehr-02',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Customer-facing applications are containerised and must be managed consistently across several container environments. What should you design?',
    options: [
      'GKE clusters per environment in separate projects, in one fleet with Config Sync applying shared configuration',
      'Each environment on a different container platform, chosen by the team that owns that environment',
      'All environments in one large cluster without separation, so that configuration is shared automatically',
      'Containers run directly on VMs with Docker and cron jobs, configured by a shared set of shell scripts',
    ],
    answer: 0,
    explanation: 'Separate GKE clusters give isolation, and the fleet with Config Sync keeps them consistent. Different platforms per team or Docker on VMs reproduce today\'s inconsistency, and one shared cluster removes environment isolation.'
  },
  {
    id: 'pca-c-ehr-03',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. All customer-facing systems need at least 99.9% availability. What is a sound, cost-aware design?',
    options: [
      'Regional GKE clusters across zones, Cloud SQL with high availability, and a load balancer with health checks',
      'Single-zone clusters and databases, restored from backups in another zone whenever a failure occurs',
      'Active-active deployments in five regions for every system, with Spanner behind all of the applications',
      'One large VM per application with a persistent disk, sized generously so that it rarely fails',
    ],
    answer: 0,
    explanation: 'Zone-redundant compute and databases behind a load balancer meet 99.9% without paying for multi-region everything. Single-zone designs with restores are too slow, five regions is excessive for this target, and single VMs are single points of failure.'
  },
  {
    id: 'pca-c-ehr-04',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. A secure, high-performance connection is needed between the on-premises systems that remain and Google Cloud. Which two should you recommend? (Choose two.)',
    options: [
      'Dedicated or Partner Interconnect in a redundant topology for private, high-throughput links',
      'HA VPN tunnels as a backup path, so traffic fails over if the Interconnect links are lost',
      'HA VPN over the internet as the only link, with four tunnels for extra bandwidth',
      'Public endpoints on both sides, protected by IP allowlists and TLS certificates',
      'Direct Peering with Google, carrying the private traffic between the data centres',
    ],
    answer: [0, 1],
    explanation: "Interconnect gives private, high-throughput, low-latency connectivity, and HA VPN as a lower-priority backup keeps the link up if the Interconnect fails. VPN alone may not meet the performance need, public endpoints raise risk, and Direct Peering reaches Google's public services, not your VPC networks."
  },
  {
    id: 'pca-c-ehr-05',
    topic: 'EHR Healthcare',
    difficulty: 'hard',
    prompt: 'EHR Healthcare case study. Legacy file- and API-based insurer integrations will stay on-premises for years, yet new services in the cloud need to use them, and insurers should eventually call cloud services instead. What should you design?',
    options: [
      'Front the integrations with Apigee, routing to on-premises backends over Interconnect now and to cloud services later',
      'Copy the legacy integration systems into the cloud immediately, so that nothing stays on-premises',
      'Let each cloud service call the legacy systems directly over the internet with its own credentials',
      'Freeze all new insurer features until the legacy integrations have been replaced in the cloud',
    ],
    answer: 0,
    explanation: 'An API layer in front of the legacy systems gives insurers and cloud services one stable interface, and backends can move to the cloud one by one behind it. Copying now contradicts the plan, direct internet calls are insecure and scattered, and freezing features hurts onboarding.'
  },
  {
    id: 'pca-c-ehr-06',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. New healthcare providers send data as HL7v2 messages and FHIR resources, and EHR wants to ingest and process it quickly as new insurers and providers are onboarded. What should you use?',
    options: [
      'The Cloud Healthcare API with HL7v2 and FHIR stores, sending Pub/Sub notifications for processing',
      'Plain text files in a shared Cloud Storage bucket, parsed by a script written for each provider',
      'A custom HL7v2 parser on a single VM, extended by hand for every new provider and insurer',
      'Storing the incoming messages in Memorystore until a nightly job writes them to Cloud SQL',
    ],
    answer: 0,
    explanation: 'The Cloud Healthcare API natively ingests and stores HL7v2 and FHIR, and its Pub/Sub notifications drive processing. Hand parsing and per-provider VM parsers slow onboarding, and Memorystore is not durable storage.'
  },
  {
    id: 'pca-c-ehr-07',
    topic: 'EHR Healthcare',
    difficulty: 'hard',
    prompt: 'EHR Healthcare case study. Data is stored in MySQL, Microsoft SQL Server, Redis and MongoDB, and administration costs must fall. Which migration targets fit with the least application change?',
    options: [
      'Database Migration Service into Cloud SQL for MySQL and SQL Server, Memorystore, and Firestore with MongoDB compatibility',
      'Rewrite every application for Bigtable, so that all of the data lives in one managed NoSQL database',
      'Keep all of the databases self-managed on Compute Engine VMs, moved there as they are with no changes',
      'Move all of the data into BigQuery and use it as the operational store for every application',
    ],
    answer: 0,
    explanation: 'Compatible managed services cut administration while keeping applications nearly unchanged. Rewriting for Bigtable is a huge project, self-managed VMs keep the admin cost, and BigQuery is not an operational database.'
  },
  {
    id: 'pca-c-ehr-08',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Users are managed in Microsoft Active Directory. How should staff access to Google Cloud be set up?',
    options: [
      'Sync users and groups to Cloud Identity with Google Cloud Directory Sync, and use SAML single sign-on with AD FS',
      'Create separate Google accounts with new passwords for every employee, managed by the cloud team',
      'Share one administrator account per team, with its password kept in a team password manager',
      'Issue service account keys to staff, so that each person signs in to Google Cloud with a key file',
    ],
    answer: 0,
    explanation: 'Syncing and SSO keep Active Directory as the source of truth and avoid new passwords; Workforce Identity Federation is the no-sync alternative. Separate passwords, shared accounts and keys for people all break security and auditing.'
  },
  {
    id: 'pca-c-ehr-09',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Monitoring uses various open-source tools, and email alerts are often ignored. EHR needs consistent logging, retention, monitoring and alerting with central visibility. What should you design?',
    options: [
      'Google Cloud Observability: aggregated sinks to log buckets with set retention, SLO alerts to on-call tools, dashboards',
      'More email alerts with clearer subject lines and a higher priority flag so they are noticed sooner',
      'Each team keeps its own open-source tools and retention rules, with a monthly shared status report',
      'Logs deleted after 24 hours to save money, with alerts sent to a shared chat channel instead of email',
    ],
    answer: 0,
    explanation: 'Central routing, defined retention, SLO-based alerting to on-call channels and shared dashboards give consistency and action. More email adds noise, separate tools keep the inconsistency, and 24-hour retention fails audit needs.'
  },
  {
    id: 'pca-c-ehr-10',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. EHR must maintain regulatory compliance while handling protected health information in Google Cloud. What should be in place?',
    options: [
      'A Business Associate Agreement, HIPAA-covered services only, VPC Service Controls, CMEK where required, audit logs',
      'Public buckets with signed URLs for easier sharing of patient records with providers and insurers',
      'Nothing extra: compliance is handled entirely by Google once data is uploaded to a certified region',
      'PHI kept in a test project without extra controls until the production landing zone is ready',
    ],
    answer: 0,
    explanation: 'HIPAA compliance needs a BAA, covered services and the customer\'s own controls under shared responsibility. Public buckets, assuming Google handles everything, and uncontrolled test projects all violate the requirement.'
  },
  {
    id: 'pca-c-ehr-11',
    topic: 'EHR Healthcare',
    difficulty: 'hard',
    prompt: 'EHR Healthcare case study. EHR wants to predict and report healthcare trends from provider data without exposing patient identities to analysts. What should you design?',
    options: [
      'De-identify the data (Healthcare API or Sensitive Data Protection), analyse it in BigQuery, and forecast with BigQuery ML',
      'Give analysts direct access to the identified patient records, with every query recorded in audit logs',
      "Copy the patient data to analysts' laptops for modelling, with full-disk encryption on every laptop",
      'Skip the trend analysis altogether, since privacy rules forbid using any patient data for analysis',
    ],
    answer: 0,
    explanation: 'De-identification protects patients while keeping the data useful, and BigQuery with ML tools supports trend analysis and prediction. Identified access and laptop copies breach privacy, and skipping the work ignores a business requirement.'
  },
  {
    id: 'pca-c-ehr-12',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Customers are multinational, and EHR must reduce latency for all of them. What should you design?',
    options: [
      'A global external Application Load Balancer with Cloud CDN, and backends in regions near large customer groups',
      'One region chosen near the headquarters for every application, with no caching of any content',
      'Separate public IP addresses for each country, with DNS records managed by hand for each one',
      'Larger VMs with more network bandwidth in the existing region, serving every customer from there',
    ],
    answer: 0,
    explanation: 'Global load balancing routes users to the nearest healthy backend, CDN serves static content from the edge, and regional backends cut distance. A single uncached region or bigger VMs do not reduce network distance, and hand-managed IPs do not scale.'
  },
  {
    id: 'pca-c-ehr-13',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. EHR wants continuous deployment to update its software at a fast pace without risking outages. What should you recommend?',
    options: [
      'Cloud Build and Artifact Registry, with Cloud Deploy pipelines using canary releases and automated rollback',
      'Manual releases once a quarter, each tested for several weeks by a dedicated QA team before launch',
      'Developers deploying straight to production from their laptops as soon as a change is ready',
      'Every change deployed to all customers at once, so that all environments always stay identical',
    ],
    answer: 0,
    explanation: 'An automated pipeline with progressive delivery ships often while limiting the impact of bad releases. Quarterly manual releases are slow, laptop deploys are uncontrolled, and all-at-once deploys maximise risk.'
  },
  {
    id: 'pca-c-ehr-14',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. New environments must be provisioned dynamically, for example for a new large customer or a test cycle. How should this be done?',
    options: [
      'Infrastructure as code with Terraform modules (a project factory and cluster templates) run from a pipeline',
      'An engineer clicking through the console for each new environment, following a written checklist',
      'Cloning an existing project by copying each of its resources by hand into a newly created project',
      'One shared environment for every customer and test cycle, separated only by naming conventions',
    ],
    answer: 0,
    explanation: 'IaC creates complete, consistent environments on demand and records how they were built. Console clicks and manual copies are slow and inconsistent, and one shared environment loses isolation.'
  },
  {
    id: 'pca-c-ehr-15',
    topic: 'EHR Healthcare',
    difficulty: 'hard',
    prompt: 'EHR Healthcare case study. EHR must adapt its disaster recovery plan to Google Cloud. What should the plan include?',
    options: [
      'RTO and RPO per system, cross-region replicas and backups, IaC to rebuild in a second region, and regular failover tests',
      'The same plan as the colocation facilities, unchanged, since the applications and teams are the same',
      'Backups kept in the same region as production only, which keeps restores fast and storage cheap',
      'No DR plan for the managed services, because Google Cloud replicates every service across regions',
    ],
    answer: 0,
    explanation: 'Targets per system, data copies in another region, reproducible infrastructure and tested failover make DR real. An unchanged colocation plan does not fit cloud services, same-region backups do not survive a regional event, and many managed services are regional, so they still need a plan.'
  },
  {
    id: 'pca-c-ehr-16',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Infrastructure administration costs must fall. Which choice contributes most?',
    options: [
      'Managed services such as GKE Autopilot, Cloud SQL and Memorystore instead of self-managed clusters and databases',
      'Running every database on Compute Engine VMs managed by the same team, to share skills and tooling',
      'Adding more administrators to share the load, so that each one manages fewer systems than today',
      'Buying more colocation space so that the systems are spread out and easier to administer by hand',
    ],
    answer: 0,
    explanation: 'Managed services remove patching, scaling and failover work. Self-managed databases and more administrators keep or raise costs, and colocation space is what EHR is leaving.'
  },
  {
    id: 'pca-c-ehr-17',
    topic: 'EHR Healthcare',
    difficulty: 'hard',
    prompt: 'EHR Healthcare case study. Many past outages were caused by misconfigured systems. Which approach best prevents this in Google Cloud?',
    options: [
      'Configuration as code with review, organization policies and Policy Controller as guardrails, and Config Sync for drift',
      'Giving more people production access, so that misconfigurations can be fixed faster when they happen',
      'A checklist emailed to the team before each change, signed off by the engineer who makes the change',
      'Disabling noisy monitoring alerts so that engineers can focus on the configuration changes they make',
    ],
    answer: 0,
    explanation: 'Reviewed code, enforced policies and automatic drift correction stop misconfigurations from reaching or staying in production. Broader access, emailed checklists and less monitoring make misconfiguration more likely or less visible.'
  },
  {
    id: 'pca-c-ehr-18',
    topic: 'EHR Healthcare',
    difficulty: 'medium',
    prompt: 'EHR Healthcare case study. Outages have also come from too little capacity during traffic spikes. What should the design include?',
    options: [
      'Horizontal Pod autoscaling and node autoscaling (or GKE Autopilot), quota headroom, and load tests at expected peaks',
      'A fixed number of nodes sized for the average load, with on-call engineers paged when it is exceeded',
      'Rejecting all traffic above the average level with rate limits, so that the systems are never overloaded',
      'Manual scaling by the on-call engineers when the CPU alerts fire, following a runbook for each system',
    ],
    answer: 0,
    explanation: 'Autoscaling at Pod and node level absorbs spikes, quota headroom avoids hard limits, and load tests prove the setup. Fixed capacity fails at peaks, rejecting traffic hurts customers, and manual scaling is slow.'
  },

  // ── KnightMotives Automotive ──────────────────────────────────────────────
  {
    id: 'pca-c-km-01',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. The company wants to monetise curated corporate data by sharing it with partners, without copying data to them and while keeping control. What should you design?',
    options: [
      'Publish curated datasets in BigQuery sharing (Analytics Hub) exchanges, with data clean rooms for private joins',
      'Email extracts of the curated data to each partner every month, encrypted with a shared password',
      'Give partners read access to the production databases, limited to the tables they have paid for',
      'Upload the curated data to public buckets with hard-to-guess names for partners to download',
    ],
    answer: 0,
    explanation: 'BigQuery sharing lets partners subscribe to data in place, with access control and usage tracking, and clean rooms allow joint analysis without exposing raw data. Emailed extracts, production access and public buckets lose control and security.'
  },
  {
    id: 'pca-c-km-02',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. Corporate data is siloed across plants, dealers, vehicles and older systems. A robust data management platform is needed. What should you design?',
    options: [
      'A BigQuery and Cloud Storage lakehouse with BigLake, governed in Knowledge Catalog for discovery, lineage and policy',
      'Separate spreadsheets maintained by each department, merged by hand for the company-wide reports',
      'One VM-hosted relational database for every type of data, from plant telemetry to dealer records',
      'Copies of each silo kept in every other system, synchronised by nightly batch jobs between all of them',
    ],
    answer: 0,
    explanation: 'A governed lakehouse unifies structured and unstructured data with central discovery and policy, ending the silos. Spreadsheets and copies multiply silos, and a single VM database cannot handle the variety and scale.'
  },
  {
    id: 'pca-c-km-03',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. Adherence to EU data protection regulation is critical, especially for data from drivers and the emerging autonomous platform. What should the design include?',
    options: [
      "EU drivers' data kept in EU regions by a resource locations policy, plus minimisation, pseudonymisation, consent and deletion",
      'All data stored in one US region for simplicity, with standard contractual clauses signed for each dealer',
      'Collecting as much personal data as possible now, since it may be useful for future autonomous features',
      'Relying on the dealers to handle data protection, since they hold the direct relationship with drivers',
    ],
    answer: 0,
    explanation: 'EU regulation calls for lawful, minimised processing, residency choices backed by policy, and support for consent and erasure. Central US storage, maximal collection and outsourcing responsibility to dealers all conflict with it.'
  },
  {
    id: 'pca-c-km-04',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. After past data breaches, security is paramount. The company needs a comprehensive security framework and an incident response plan. What should you recommend?',
    options: [
      'Org-wide guardrails and least privilege, Security Command Center, Google Security Operations playbooks, and regular drills',
      'A single next-generation firewall at headquarters that inspects all traffic from plants, dealers and vehicles',
      'Mandatory password changes for all staff every month, plus an annual security awareness presentation',
      'Investigating breaches only after customers report them, using an external forensics firm on retainer',
    ],
    answer: 0,
    explanation: 'Layered preventive controls, continuous posture and threat detection, a SIEM/SOAR with playbooks, and practised response match the requirement. A perimeter firewall, password rotation or reactive investigation do not form a framework.'
  },
  {
    id: 'pca-c-km-05',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. Autonomous driving development needs a large simulation environment and model training on huge sensor datasets. What should you design?',
    options: [
      'AI Hypercomputer GPU or TPU clusters on GKE, Managed Lustre for training data, and Dynamic Workload Scheduler',
      'A few on-premises workstations with consumer GPUs, shared between the simulation and training teams',
      'Cloud Run functions for each simulation step, with the sensor data read from a single regional bucket',
      'A single large VM with many GPUs running every simulation and training job one after another',
    ],
    answer: 0,
    explanation: 'Large-scale simulation and training need many accelerators, fast shared storage and scheduled capacity, which AI Hypercomputer provides. Workstations, functions and a single VM cannot reach the required scale.'
  },
  {
    id: 'pca-c-km-06',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. Vehicles in rural areas lose connectivity often, yet telemetry must reach Google Cloud reliably. How should ingestion be designed?',
    options: [
      'Buffer telemetry on the vehicle and upload when connected, via a scalable endpoint (e.g. MQTT broker) into Pub/Sub',
      'Cloud IoT Core device registries, with each vehicle publishing telemetry whenever it is connected',
      'Require vehicles to stay online while driving, rejecting any telemetry that arrives late or out of order',
      'Send the telemetry by SMS to the nearest dealer, who forwards it to headquarters at the end of the day',
    ],
    answer: 0,
    explanation: 'Store-and-forward on the vehicle tolerates gaps, and a scalable endpoint feeding Pub/Sub absorbs bursts when vehicles reconnect. Cloud IoT Core was retired in 2023, rejecting delayed data loses information, and SMS to dealers is not ingestion.'
  },
  {
    id: 'pca-c-km-07',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. The supply chain runs on an outdated mainframe that cannot be replaced at once. New promotions and dealer discounts need it. What should you recommend?',
    options: [
      'Modernise gradually: expose its functions through Apigee, replicate its data to BigQuery, and replace pieces over time',
      'Rewrite the whole mainframe application on GKE in one release, then switch every plant over at once',
      'Leave the mainframe untouched and block new promotions until a replacement is bought in a few years',
      'Give dealers direct terminal access to the mainframe so that they can apply discounts themselves',
    ],
    answer: 0,
    explanation: 'An incremental, strangler-style approach lets new channels use the mainframe through APIs and data while pieces are replaced safely. A big-bang rewrite is high-risk, blocking promotions hurts sales, and terminal access for dealers is insecure.'
  },
  {
    id: 'pca-c-km-08',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. Connectivity between plants and headquarters needs upgrading for growing data traffic, and plants should also reach Google Cloud. What should you design?',
    options: [
      'Cloud Interconnect at headquarters and major sites, and Network Connectivity Center spokes linking the plants',
      'Public internet links at every plant, without redundancy, each sized for its current data traffic only',
      'One VPN tunnel from each plant to headquarters only, with headquarters forwarding all cloud traffic',
      'Disks shipped between plants and headquarters each week for the largest transfers of production data',
    ],
    answer: 0,
    explanation: 'Interconnect and Network Connectivity Center give high-capacity, centrally managed connectivity, including site-to-site traffic over Google\'s backbone. Unprotected internet links and single tunnels are fragile, and shipped disks are not a network.'
  },
  {
    id: 'pca-c-km-09',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. The online build-to-order system is unreliable: orders fail under load and are lost when dealer systems respond slowly. How should it be re-architected?',
    options: [
      'Autoscaled stateless services, orders stored durably and passed to dealers through Pub/Sub with idempotent processing',
      'A larger single server for the order system, sized for the busiest model launch day the company has had',
      'Synchronous calls to every dealer system before confirming each order, retried in a loop until they succeed',
      'Online ordering disabled during busy periods, with customers asked to place their orders at a dealer instead',
    ],
    answer: 0,
    explanation: 'Durable writes and asynchronous hand-off decouple customers from slow dealer systems, autoscaling handles load, idempotency prevents duplicates and SLOs track reliability. A bigger server, synchronous coupling and disabling orders keep or worsen the problem.'
  },
  {
    id: 'pca-c-km-10',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. Dealers need modern tools for sales, service and inventory, but have no budget for new equipment. What should you recommend?',
    options: [
      "Browser-based dealer apps hosted on Google Cloud, running on dealers' existing devices with secure sign-in",
      'New servers installed at every dealership to run local copies of the sales and inventory systems',
      'A desktop application for sales and service that needs new high-end PCs at every dealership',
      'Paper forms for sales and service, scanned and sent to headquarters for entry at the end of each day',
    ],
    answer: 0,
    explanation: 'Web applications delivered from the cloud need no new hardware at dealerships and are updated centrally. Servers or new PCs cost dealers money they do not have, and paper processes do not modernise anything.'
  },
  {
    id: 'pca-c-km-11',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. A comprehensive CRM is required to track customer interactions and personalise experiences. CRM is not a differentiator for the company. What workload disposition fits?',
    options: [
      'Buy a SaaS CRM and integrate it with vehicle, dealer and data platforms through APIs',
      "Build a custom CRM from scratch on GKE, tailored to every dealer's process",
      'Extend the mainframe with new CRM screens for the dealers and call centre',
      'Track customers in dealer spreadsheets, consolidated at headquarters monthly',
    ],
    answer: 0,
    explanation: 'Buying a proven CRM and integrating it delivers faster and lets engineers focus on differentiating work such as in-vehicle AI. Building from scratch or on the mainframe wastes effort, and spreadsheets cannot meet the requirement.'
  },
  {
    id: 'pca-c-km-12',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. Some in-vehicle AI features must keep working when the vehicle has no connectivity. How should they be designed?',
    options: [
      'Run compact models on the vehicle for offline features, and cloud-hosted models for heavier tasks when connected',
      'Run every AI feature only in the cloud, and show an error message whenever the vehicle is offline',
      'Disable the AI features in rural areas, where connectivity is too unreliable for them to work well',
      'Cache full cloud model responses for every possible question in advance, stored in the vehicle',
    ],
    answer: 0,
    explanation: 'On-device models handle essential features offline, and the cloud adds capability when available. Cloud-only features fail without connectivity, disabling them breaks the cohesive experience, and caching every possible answer is impossible.'
  },
  {
    id: 'pca-c-km-13',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. The company must upskill employees, attract talent and improve communication between business and technical teams. What should the architect recommend?',
    options: [
      'A cloud centre of excellence with role-based training and certifications, plus shared planning with business owners',
      'Outsourcing all technology decisions to a single partner permanently, so internal skills matter less',
      'Hiring only external consultants for every project, and releasing them when each project ends',
      'Keeping business and technical teams separate to avoid conflict, with a monthly status email between them',
    ],
    answer: 0,
    explanation: 'A centre of excellence builds skills and standards, structured learning attracts and grows talent, and joint forums improve communication. Permanent outsourcing and consultant-only staffing keep knowledge outside, and separating teams worsens communication.'
  },
  {
    id: 'pca-c-km-14',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. The current AI infrastructure is obsolete. The data science teams need to train, evaluate, deploy and monitor models at scale. What should you recommend?',
    options: [
      'Gemini Enterprise Agent Platform for training, registry, serving and monitoring, with Agent Platform Pipelines',
      'Buy a new on-premises GPU farm and build the training, serving and monitoring tooling from scratch',
      "Run notebooks on the data scientists' laptops, and copy the trained models to a shared VM for serving",
      'One shared VM with GPUs for all data scientists, with models deployed by hand from that machine',
    ],
    answer: 0,
    explanation: 'A managed ML platform with pipelines covers the full lifecycle at scale without owning hardware. A new GPU farm repeats the obsolescence problem, and laptops or a shared VM cannot scale or govern models.'
  },
  {
    id: 'pca-c-km-15',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. Vehicle software is fragmented across several code bases with heavy technical debt, and the UX must become consistent across all models. What should you recommend?',
    options: [
      'Converge on a shared in-vehicle software platform, built and tested in one CI/CD pipeline and shipped over the air',
      "Keep each model's code base separate and add the new features to each of them by hand in turn",
      "Rewrite every model's software independently and at the same time, each with its own new design",
      'Freeze all vehicle software changes for five years while the technical debt is documented in detail',
    ],
    answer: 0,
    explanation: 'A common platform with shared CI/CD and OTA delivery reduces duplication and makes features consistent across models. Separate code bases keep the fragmentation, parallel independent rewrites multiply it, and freezing changes abandons the goal.'
  },
  {
    id: 'pca-c-km-16',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. To personalise the driver relationship, data about drivers, vehicles and dealer interactions must be combined, while only authorised teams can see sensitive columns. What should you configure?',
    options: [
      'Unified driver profiles in BigQuery with consent attributes, and policy tags for column-level security',
      'Copies of the full driver table for every team, each with the columns that team thinks it needs',
      'Personal data kept in dealer spreadsheets, shared with headquarters teams when they ask for it',
      'A dashboard of all driver data shared with the whole company, so that every team can personalise',
    ],
    answer: 0,
    explanation: 'Central profiles with consent and policy tags give personalisation while restricting sensitive columns to authorised roles. Copies and spreadsheets spread personal data, and a company-wide dashboard exposes it to everyone.'
  },
  {
    id: 'pca-c-km-17',
    topic: 'KnightMotives Automotive',
    difficulty: 'hard',
    prompt: 'KnightMotives Automotive case study. Autonomous features will launch first in regions with favourable regulations, each with its own rules on data and testing. How should the cloud environment be organised?',
    options: [
      'A folder per jurisdiction with its own organization policies (e.g. allowed locations), access controls and audit logs',
      'One project for all of the regions with shared settings, so every team works the same way everywhere',
      'Developers choose regions freely for each test, and record where data was stored in a shared sheet',
      'Data from all of the regions stored together in one multi-region bucket, labelled by its jurisdiction',
    ],
    answer: 0,
    explanation: 'Folders per jurisdiction let policies, residency and access be set to each region\'s rules and inherited by every project. A single shared project, free choice of regions or co-mingled data cannot enforce different rules.'
  },
  {
    id: 'pca-c-km-18',
    topic: 'KnightMotives Automotive',
    difficulty: 'medium',
    prompt: 'KnightMotives Automotive case study. Some applications already run on other major cloud platforms, and the hybrid strategy calls for consistent management of Kubernetes workloads across them, on-premises and in Google Cloud. What should you use?',
    options: [
      "GKE fleets, with GKE attached clusters for the other clouds' Kubernetes and Google Distributed Cloud on-premises",
      'A separate management tool for every platform, each one run by the team that operates that platform',
      'Moving all of the workloads to a single cloud provider over one weekend so that only one platform remains',
      'Unmanaged clusters on every platform with no central view, each configured by its own application team',
    ],
    answer: 0,
    explanation: 'Fleets give one management plane, and attached clusters bring EKS and AKS clusters under it alongside on-premises clusters. Separate tools fragment operations, an overnight move is unrealistic, and unmanaged clusters give no consistency.'
  }
];
