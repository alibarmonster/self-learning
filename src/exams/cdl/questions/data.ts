/**
 * Section 2 — Exploring data transformation with Google Cloud (~16%)
 * The value of data, Google Cloud's data management products, and making data
 * useful and accessible with Looker, streaming analytics and data pipelines.
 */

import type { Question } from '@/types';

export const data: Question[] = [
  // ── The value of data ────────────────────────────────────────────────────
  {
    id: 'data-01',
    topic: 'The value of data',
    difficulty: 'easy',
    prompt: 'Which statement correctly distinguishes a database, a data warehouse and a data lake?',
    options: [
      'A database holds current transactional data; a warehouse holds structured historical data for analysis; a lake holds raw data of any type.',
      'A database holds raw data of any type; a warehouse holds current transactional data; a lake holds structured historical data for analysis.',
      'A database holds structured historical data for analysis; a warehouse holds raw data of any type; a lake holds current transactional data.',
      'A database holds structured data; a warehouse holds the same data compressed for storage; a lake holds the backups of both.'
    ],
    answer: 0,
    explanation:
      'Databases serve applications (an order being placed right now). Warehouses serve analysts (all orders for the last five years, cleaned and structured). Lakes hold everything — logs, files, images — in raw form, cheaply, for later use.'
  },
  {
    id: 'data-02',
    topic: 'The value of data',
    difficulty: 'easy',
    prompt: 'Which of these is an example of unstructured data?',
    options: [
      'A table of customer orders with columns for id, date and amount.',
      'A spreadsheet of monthly sales figures by store and product.',
      'A collection of recorded customer support calls in audio form.',
      'A list of product SKUs with their prices and stock levels.'
    ],
    answer: 2,
    explanation:
      'Structured data fits neatly into rows and columns. Audio, video, images, free-text emails and documents do not — they are unstructured, and were historically hard to analyse until cloud storage and ML made it practical.'
  },
  {
    id: 'data-03',
    topic: 'The value of data',
    difficulty: 'easy',
    prompt: 'Why is data governance important to an organisation adopting cloud analytics?',
    options: [
      'It makes queries run faster by indexing the tables that analysts access most frequently.',
      'It ensures data is accurate, consistent, secure, properly classified and used in line with policy.',
      'It reduces storage cost by archiving data that has not been queried within a set retention period.',
      'It replaces the need for backups by keeping a versioned copy of every table in the warehouse.'
    ],
    answer: 1,
    explanation:
      'Governance is the set of policies and controls that make data trustworthy and compliant: who owns it, who may see it, how long it is kept, how quality is maintained. Without it, analytics produces confident answers from bad inputs.'
  },
  {
    id: 'data-04',
    topic: 'The value of data',
    difficulty: 'medium',
    prompt: 'Which TWO are ways an organisation can create more value from data, as described in the exam guide? (Choose two.)',
    options: [
      'Make better use of the data the organisation already holds.',
      'Delete historical data once it is older than the current reporting period.',
      'Bring in external data sources to enrich the organisation\'s own.',
      'Restrict data access to the IT department to keep it consistent.'
    ],
    answer: [0, 2],
    explanation:
      'The guide lists three routes: use current data better, collect new data, and source external data. Deleting history or locking data away reduces the insight available.'
  },
  {
    id: 'data-05',
    topic: 'The value of data',
    difficulty: 'medium',
    prompt: 'A logistics firm wants to reroute trucks the moment a road closes. Which kind of analytics does that require?',
    options: [
      'Batch analytics run every night on the day\'s completed journeys.',
      'Streaming analytics on road and vehicle events as they arrive.',
      'Predictive analytics on last year\'s traffic patterns by season.',
      'Descriptive analytics on a dashboard refreshed every hour.'
    ],
    answer: 1,
    explanation:
      'Streaming analytics processes events continuously as they happen. Fraud detection, live inventory and vehicle routing are the classic cases where a nightly batch job is too late.'
  },
  {
    id: 'data-06',
    topic: 'The value of data',
    difficulty: 'medium',
    prompt: 'What is the "data value chain"?',
    options: [
      'The steps that turn raw data into business value: collecting, storing, processing, analysing and acting on it.',
      'The steps that move data between systems: extracting, transforming, loading, archiving and deleting it.',
      'The steps that price a dataset for sale: sourcing, cleaning, licensing, packaging and distributing it.',
      'The steps that secure data: classifying, encrypting, backing up, auditing and retiring it.'
    ],
    answer: 0,
    explanation:
      'Data on its own is worthless until it has been ingested, stored, cleaned, analysed and finally used to make a decision. Each link in that chain has Google Cloud products that serve it.'
  },

  // ── Google Cloud data management solutions ───────────────────────────────
  {
    id: 'data-07',
    topic: 'Data management solutions',
    difficulty: 'easy',
    prompt: 'What is BigQuery?',
    options: [
      'A managed relational database for transactional web and mobile applications.',
      'A serverless, fully managed data warehouse for analysing very large datasets with SQL.',
      'A managed NoSQL wide-column store for high-throughput analytical workloads.',
      'A managed data lake service for storing raw files and querying them with Spark.'
    ],
    answer: 1,
    explanation:
      'BigQuery is the analytics warehouse: you load or stream data in, query it with standard SQL, and never provision or manage servers. It scales to petabytes and bills for storage and query processing.'
  },
  {
    id: 'data-08',
    topic: 'Data management solutions',
    difficulty: 'easy',
    prompt: 'Which Cloud Storage class is the cheapest to store and intended for data accessed less than once a year, such as long-term regulatory archives?',
    options: ['Standard', 'Nearline', 'Coldline', 'Archive'],
    answer: 3,
    explanation:
      'The four classes trade storage cost against access cost and minimum storage duration: Standard (frequent), Nearline (about once a month), Coldline (about once a quarter), Archive (less than once a year, the lowest storage price).'
  },
  {
    id: 'data-09',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'A company keeps monthly backups it expects to restore roughly once a month. Which Cloud Storage class balances cost and access best?',
    options: ['Standard', 'Nearline', 'Coldline', 'Archive'],
    answer: 1,
    explanation:
      'Nearline is designed for data accessed about once a month, with a 30-day minimum storage duration and a lower storage price than Standard. Coldline and Archive would charge more per retrieval for data touched this often.'
  },
  {
    id: 'data-10',
    topic: 'Data management solutions',
    difficulty: 'easy',
    prompt: 'A team wants a fully managed MySQL or PostgreSQL database for its web application. Which service should they use?',
    options: ['Cloud SQL', 'Bigtable', 'BigQuery', 'Cloud Storage'],
    answer: 0,
    explanation:
      'Cloud SQL is the managed relational database service for MySQL, PostgreSQL and SQL Server. Google handles patching, backups and replication; the team keeps using the same SQL and drivers.'
  },
  {
    id: 'data-11',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'Which database offers a relational, SQL interface with strong consistency AND horizontal scaling across regions for a global application?',
    options: ['Cloud SQL', 'Spanner', 'Firestore', 'Bigtable'],
    answer: 1,
    explanation:
      'Spanner is Google\'s globally distributed relational database. Unlike Cloud SQL, which scales vertically on one instance, Spanner scales out across nodes and regions while keeping strong consistency and SQL.'
  },
  {
    id: 'data-12',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'An IoT platform ingests millions of sensor readings per second and needs very low-latency reads and writes on a huge table. Which service fits?',
    options: [
      'Cloud SQL',
      'Bigtable',
      'Firestore',
      'Spanner'
    ],
    answer: 1,
    explanation:
      'Bigtable is a NoSQL wide-column database built for massive throughput and low latency — time series, IoT telemetry, ad-tech. It is not relational and does not support SQL joins.'
  },
  {
    id: 'data-13',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'Which service is a NoSQL document database designed for mobile and web apps, with real-time synchronisation and offline support?',
    options: ['Firestore', 'Spanner', 'BigQuery', 'Bigtable'],
    answer: 0,
    explanation:
      'Firestore stores flexible JSON-like documents in collections and keeps client apps in sync automatically, which is why it pairs with Firebase for consumer apps.'
  },
  {
    id: 'data-14',
    topic: 'Data management solutions',
    difficulty: 'easy',
    prompt: 'A media company needs to store terabytes of video files and serve them to a website. Which service is designed for that?',
    options: [
      'Cloud SQL',
      'Cloud Storage',
      'Filestore',
      'Firestore'
    ],
    answer: 1,
    explanation:
      'Cloud Storage is object storage: it holds files (objects) of any size and type in buckets, with global access and multiple storage classes. Databases are the wrong tool for large binary files.'
  },
  {
    id: 'data-15',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'What is the key difference between SQL (relational) and NoSQL databases?',
    options: [
      'Relational databases use fixed-schema tables and support joins; NoSQL databases use flexible models and scale out more easily.',
      'Relational databases use flexible models and scale out more easily; NoSQL databases use fixed-schema tables and support joins.',
      'Relational databases store structured text and numbers; NoSQL databases store only unstructured files and media.',
      'Relational databases run on managed cloud services; NoSQL databases run only on self-managed clusters.'
    ],
    answer: 0,
    explanation:
      'Relational is the right choice when data has a stable structure and needs transactions and joins. NoSQL suits varied or rapidly changing data and very high scale, at the cost of fewer built-in guarantees.'
  },
  {
    id: 'data-16',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt: 'A company wants to move its on-premises MySQL database to Cloud SQL with minimal downtime and little rewriting. Which option is most appropriate?',
    options: [
      'Use Database Migration Service to replicate the database continuously into Cloud SQL, then cut over.',
      'Use Storage Transfer Service to copy the database files into Cloud Storage, then import them into Cloud SQL.',
      'Use Dataflow to stream the tables into BigQuery, then point the application at BigQuery.',
      'Use Database Migration Service to convert the schema for Spanner, then rewrite the queries.'
    ],
    answer: 0,
    explanation:
      'Database Migration Service handles like-for-like migrations (MySQL to Cloud SQL for MySQL, for example) with continuous replication, so the cutover is short. Modernising to a different engine is a separate, later decision.'
  },
  {
    id: 'data-17',
    topic: 'Data management solutions',
    difficulty: 'hard',
    prompt: 'Which TWO of these Google Cloud services are relational databases? (Choose two.)',
    options: [
      'Cloud SQL',
      'Bigtable',
      'Spanner',
      'Firestore'
    ],
    answer: [0, 2],
    explanation:
      'Cloud SQL and Spanner are relational and speak SQL. Bigtable is NoSQL wide-column; Cloud Storage is object storage, not a database at all.'
  },
  {
    id: 'data-18',
    topic: 'Data management solutions',
    difficulty: 'hard',
    prompt: 'Why is BigQuery described as a multicloud analytics engine?',
    options: [
      'BigQuery Omni lets you analyse data stored in AWS and Azure with BigQuery without moving it.',
      'BigQuery replicates every table automatically into AWS and Azure so queries run in any cloud.',
      'BigQuery is licensed to AWS and Azure, which sell it under their own product names.',
      'BigQuery can import data from AWS and Azure into Google Cloud on a nightly schedule.'
    ],
    answer: 0,
    explanation:
      'With BigQuery Omni the same SQL interface reaches data sitting in AWS S3 or Azure Blob Storage. That fits the "open" theme: analyse where the data is rather than being forced to consolidate first.'
  },

  // ── Making data useful and accessible ────────────────────────────────────
  {
    id: 'data-19',
    topic: 'Making data useful',
    difficulty: 'easy',
    prompt: 'What is Looker?',
    options: [
      'A business intelligence platform where users explore data and build dashboards on a governed semantic model.',
      'A data preparation tool where analysts clean and join raw files before loading them into a warehouse.',
      'A managed notebook environment where data scientists train and evaluate machine learning models.',
      'A data catalogue where stewards tag tables with owners, sensitivity levels and retention rules.'
    ],
    answer: 0,
    explanation:
      'Looker sits on top of a warehouse such as BigQuery. Analysts define metrics once in its modelling layer (LookML), and everyone else self-serves dashboards built on those consistent definitions — that is what "democratising data" means.'
  },
  {
    id: 'data-20',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt: 'Which pair of services would you use to ingest a stream of events and process them in real time before loading them into BigQuery?',
    options: [
      'Cloud Storage and Dataproc',
      'Pub/Sub and Dataflow',
      'Pub/Sub and Dataprep',
      'Cloud SQL and Data Fusion'
    ],
    answer: 1,
    explanation:
      'Pub/Sub is the messaging service that receives events from producers and delivers them to subscribers. Dataflow is the managed stream and batch processing service (built on Apache Beam) that transforms them on the way to BigQuery.'
  },
  {
    id: 'data-21',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt: 'A sales team wants a dashboard that updates as new orders land in BigQuery, and wants to trigger a Slack alert when daily revenue drops. Which product delivers both?',
    options: [
      'Looker Studio',
      'Looker',
      'Dataflow',
      'Cloud Monitoring'
    ],
    answer: 1,
    explanation:
      'Looker provides real-time dashboards on BigQuery data and supports scheduled deliveries and alerts into workflow tools, which is the "integrate insights into workflows" benefit the guide calls out.'
  },
  {
    id: 'data-22',
    topic: 'Making data useful',
    difficulty: 'easy',
    prompt: 'What is the role of Pub/Sub in a data pipeline?',
    options: [
      'It stores event data in partitioned tables so that it can be analysed later with SQL.',
      'It is an asynchronous messaging service that decouples event producers from consumers.',
      'It transforms events in flight by applying windowing, enrichment and deduplication logic.',
      'It schedules pipeline runs on a timetable and retries the steps that fail or time out.'
    ],
    answer: 1,
    explanation:
      'Applications publish messages to a topic; any number of subscribers receive them. Because the two sides never talk directly, a slow consumer or a traffic spike does not break the producer.'
  },
  {
    id: 'data-23',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt: 'What business value does streaming analytics offer over batch processing?',
    options: [
      'It is cheaper than batch processing because data is handled in small pieces rather than in large files.',
      'It lets an organisation react to events within seconds: catching fraud, adjusting prices, alerting on failures.',
      'It removes the need for a data warehouse because results are computed before the data is ever stored.',
      'It works on unstructured data such as images and audio, which batch processing is unable to read.'
    ],
    answer: 1,
    explanation:
      'Batch is fine for reports about yesterday. Streaming is for decisions that lose their value if they wait — which is why Pub/Sub and Dataflow feature in the "modernise data pipelines" topic.'
  },

  {
    id: 'data-24',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt: 'What is the difference between Looker and Looker Studio?',
    options: [
      'Looker is the enterprise BI platform with a governed semantic model; Looker Studio is the lighter, free self-serve reporting tool.',
      'Looker is the lighter, free self-serve reporting tool; Looker Studio is the enterprise BI platform with a governed semantic model.',
      'Looker is for dashboards on BigQuery only; Looker Studio connects to any data source including spreadsheets.',
      'Looker is the on-premises edition; Looker Studio is the same product delivered as a cloud service.'
    ],
    answer: 0,
    explanation:
      'Looker (formerly the standalone Looker product) centralises metric definitions so every dashboard agrees. Looker Studio (formerly Data Studio) lets anyone drag together a report from a data source in minutes. Both connect natively to BigQuery. Current names: Data Studio → Looker Studio.'
  },
  {
    id: 'data-25',
    topic: 'The value of data',
    difficulty: 'easy',
    prompt: 'A retailer has ten years of sales history in spreadsheets on individual laptops. What is the first step to getting business value from it?',
    options: [
      'Train a demand-forecasting model on the spreadsheets directly in Gemini Enterprise Agent Platform, using AutoML to handle the cleaning.',
      'Consolidate the data into a central, governed store such as BigQuery so it can be cleaned, queried and shared.',
      'Build a Looker Studio dashboard connected to each spreadsheet so managers can see the full history at once.',
      'Upload the spreadsheets to Cloud Storage in the Archive class so they are preserved cheaply for future analysis.'
    ],
    answer: 1,
    explanation:
      'Scattered, ungoverned data cannot be analysed reliably. Centralising it is the foundation the whole data value chain rests on; analytics and ML come after. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'data-26',
    topic: 'Data management solutions',
    difficulty: 'hard',
    prompt: 'Which Cloud Storage class has a 90-day minimum storage duration and suits data accessed about once a quarter?',
    options: ['Standard', 'Nearline', 'Coldline', 'Archive'],
    answer: 2,
    explanation:
      'The minimum durations step up with the class: Standard none, Nearline 30 days, Coldline 90 days, Archive 365 days. Storage gets cheaper down the list while retrieval gets pricier — so match the class to real access frequency.'
  },


  // ── Scenario questions: a business situation, four plausible products ────
  {
    id: 'data-27',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt:
      'A credit card company has a weekly reporting system in place. They notice a spate of fraudulent transactions that went unnoticed previously; customers had been complaining but even they did not notice until late. The company concludes that fraudulent activity has to be detected and declined very quickly — within a few tens of seconds. What critical data processing technology can be used?',
    options: ['Dataflow', 'Dataprep', 'Dataproc', 'Data Fusion'],
    answer: 0,
    explanation:
      'The requirement is real-time stream processing: score each transaction as it arrives, not in a weekly batch. Dataflow is the managed streaming engine (Apache Beam) that does that, usually fed by Pub/Sub. Dataproc runs Hadoop/Spark clusters, Data Fusion is visual ETL, and Dataprep is a data-cleaning tool — none is built for sub-minute event processing.',
    tip: '"Within seconds" or "as it happens" in a data question points to Pub/Sub + Dataflow.'
  },
  {
    id: 'data-28',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt:
      'An online retailer runs a MySQL database on-premises for orders and inventory. Traffic has grown and the ops team spends most of its time on patching, backups and failover testing. They want to move to Google Cloud with the least application change and hand the maintenance to Google. Which service should they choose?',
    options: [
      'Cloud SQL',
      'Spanner',
      'AlloyDB',
      'BigQuery'
    ],
    answer: 0,
    explanation:
      'Same engine, same SQL, same drivers — Cloud SQL for MySQL is the like-for-like managed move, and Database Migration Service can replicate it in. Spanner would also be relational but means schema and driver changes; Bigtable and BigQuery are not transactional databases.'
  },
  {
    id: 'data-29',
    topic: 'Data management solutions',
    difficulty: 'hard',
    prompt:
      'A ride-hailing company operates in 40 countries. Its trip-booking system needs a relational database with strong consistency for payments, must serve users on every continent with low latency, and expects to grow far beyond what a single database server can handle. Which service fits?',
    options: [
      'Cloud SQL',
      'Spanner',
      'Bigtable',
      'Firestore'
    ],
    answer: 1,
    explanation:
      'Global scale plus relational plus strong consistency is the Spanner sentence. Cloud SQL scales up on one instance and cannot span the world; Firestore is a document store; Memorystore is a cache.',
    tip: 'Cloud SQL versus Spanner turns on one word: global (or "horizontal scale").'
  },
  {
    id: 'data-30',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt:
      'A utility company installs smart meters that each report a reading every ten seconds. The platform must ingest millions of writes per second and let engineers read the last hour of any meter with millisecond latency. The data is simple key-value time series. Which storage service should it use?',
    options: [
      'Bigtable',
      'Cloud SQL',
      'Firestore',
      'Spanner'
    ],
    answer: 0,
    explanation:
      'High-throughput, low-latency, time-series key-value data is Bigtable\'s home ground. Relational databases would buckle under the write rate and do not need to provide SQL here; Cloud Storage is for files, not per-row lookups.'
  },
  {
    id: 'data-31',
    topic: 'Making data useful',
    difficulty: 'medium',
    prompt:
      'A media company\'s analysts each build their own dashboards from BigQuery, and the CFO keeps getting three different "monthly revenue" numbers in the same meeting. The company wants a single governed definition of every metric that every dashboard reuses, with self-service for business users. What should it adopt?',
    options: [
      'Looker',
      'Looker Studio',
      'BigQuery BI Engine',
      'Dataplex'
    ],
    answer: 0,
    explanation:
      'Conflicting metric definitions is the problem Looker\'s semantic model (LookML) solves: define revenue once, every report inherits it. Looker Studio is the lighter self-serve tool without that governance layer; the other two are not BI products.'
  },
  {
    id: 'data-32',
    topic: 'Data management solutions',
    difficulty: 'medium',
    prompt:
      'A hospital must retain scanned patient records for ten years for regulatory reasons. The records are almost never opened after the first year, but when a request does come they must be retrievable within hours, not days. Storage cost should be as low as possible. Which Cloud Storage class fits?',
    options: ['Archive', 'Standard', 'Nearline', 'Coldline'],
    answer: 0,
    explanation:
      'Accessed less than once a year and cost-driven means Archive — the cheapest storage price, with data still available in milliseconds when asked (unlike tape). The retrieval fee only matters if reads are frequent, and they are not.'
  },
];
