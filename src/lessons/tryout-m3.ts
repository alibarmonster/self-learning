/**
 * Tryout prep for course Module 3, sessions 9–12 (exam guide 2.2 and 3.2):
 * Cloud Storage buckets, classes, objects, versioning, soft delete, signed
 * URLs, lifecycle and retention; Cloud SQL, AlloyDB and Spanner; Firestore,
 * Bigtable, Memorystore and BigQuery; Pub/Sub, Managed Service for Apache
 * Kafka and Dataflow; CMEK and multi-region redundancy — plus the data-stack
 * lab and a check before the module try-out (M3 · Set 1–5 in
 * exams/ace/sets.ts). Names, defaults and flags checked against the Google
 * Cloud docs in October 2026.
 */
import type { Lesson } from '@/types';

const KEY = 'projects/ace-lab-123/locations/asia-southeast2/keyRings/data-keys/cryptoKeys';

export const lesson: Lesson = {
  id: 'tryout-m3',
  lang: 'en',
  title: 'Tryout Prep · Module 3: Storage & Data Solutions',
  intro:
    'Module 3 is the data half of exam guide Sections 2 and 3: choosing where data lives, loading it, querying it, protecting it and getting it back. It follows sessions 9 to 12 of the course. Cloud Storage comes first: buckets, locations and classes, objects, versioning, soft delete and signed URLs, then lifecycle and retention. Then the databases: Cloud SQL, AlloyDB, Spanner, Firestore, Bigtable, Memorystore and BigQuery with its cost model. Session 11 covers messaging and pipelines, encryption keys and multi-region redundancy, and session 12 is the restore drill. Most questions here are a choice between products, decided by one or two words in the scenario. The tables are built to make those words obvious. Then sit M3 · Set 1 to 5: 20 questions, 24 minutes each.',
  parts: [
    {
      id: 's9',
      title: 'Session 9 · Cloud Storage: buckets, classes and the data lifecycle',
      sections: [
        {
          id: 's9-buckets',
          title: 'S9-01 · Buckets, location types and storage classes',
          blocks: [
            {
              kind: 'p',
              text: '**Cloud Storage** keeps objects (files of any type, up to 5 TiB each) in **buckets**. Bucket names are globally unique and DNS-style. The namespace is flat: a "folder" is just a name prefix, unless the bucket uses **hierarchical namespace** for real folders, which analytics and AI workloads often prefer. Objects are immutable, so writing again creates a new **generation**. Every class has the same durability (eleven nines) and millisecond access.'
            },
            {
              kind: 'table',
              caption: 'Location types',
              columns: ['Type', 'Where the data is', 'Pick it when'],
              rows: [
                ['Region', 'One region, such as `asia-southeast2`', 'Data is used by compute in that region, at the lowest cost, or must stay in one region'],
                ['Dual-region', 'Two specific regions: a predefined pair or two you choose on one continent', 'Geo-redundancy with known locations. **Turbo replication** gives a 15-minute RPO'],
                ['Multi-region', 'A large area: `US`, `EU`, `ASIA`', 'Content served widely, highest availability, with no need to name the regions']
              ]
            },
            {
              kind: 'table',
              caption: 'Storage classes',
              columns: ['Class', 'Minimum storage duration', 'Retrieval fee', 'Typical access'],
              rows: [
                ['Standard', 'None', 'None', 'Hot data: websites, active datasets, frequently read'],
                ['Nearline', '30 days', 'Yes', 'About once a month: backups read occasionally'],
                ['Coldline', '90 days', 'Higher', 'About once a quarter: disaster recovery copies'],
                ['Archive', '365 days', 'Highest', 'Less than once a year: compliance archives (still read in milliseconds)']
              ]
            },
            {
              kind: 'list',
              items: [
                '**What you pay for**: storage per GB-month, **operations** (class A writes and lists, class B reads), **retrieval** fees and **early deletion** charges for colder classes, **network egress**, and replication for dual- and multi-region buckets.',
                '**Autoclass** (`--enable-autoclass`) moves each object between classes based on its own access, so you do not have to predict access patterns.',
                'The bucket has a **default class**, and each object can have its own. Lifecycle rules (S9-03) change classes on a schedule.',
                'The location is chosen at creation. A bucket can now be moved with **bucket relocation** (`gcloud storage buckets relocate`). Older material says you must copy into a new bucket.'
              ]
            },
            {
              kind: 'code',
              title: 'Create buckets',
              lines: [
                '$ gcloud storage buckets create gs://ace-lab-web --location=asia-southeast2 \\',
                '    --default-storage-class=STANDARD --uniform-bucket-level-access',
                '$ gcloud storage buckets create gs://ace-lab-dr --location=ASIA --default-storage-class=COLDLINE',
                '$ gcloud storage buckets create gs://ace-lab-mixed --location=asia-southeast2 --enable-autoclass',
                '$ gcloud storage buckets describe gs://ace-lab-web',
                '$ gcloud storage buckets relocate gs://ace-lab-web --location=asia-southeast1 --dry-run'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Read the **access frequency** and the **retention**: "accessed less than once a quarter, kept for years" → Coldline or Archive. "Unknown or changing access" → Autoclass. "Read every day but stored in Archive" costs **more**, because of retrieval fees. "Must survive a regional outage" → dual-region or multi-region. "Data must stay in Indonesia" → the `asia-southeast2` region.'
            },
            {
              kind: 'quiz',
              q: 'Backups are written nightly, kept for 5 years, and read only if there is a disaster (rarely, if ever). Which class is the most cost-effective?',
              options: ['Standard', 'Nearline', 'Coldline', 'Archive'],
              answer: 3,
              explain: 'Archive has the cheapest storage, and its 365-day minimum and retrieval fee do not matter for data almost never read and kept for years.'
            }
          ]
        },
        {
          id: 's9-objects',
          title: 'S9-02 · Uploads and downloads, versioning, soft delete and signed URLs',
          blocks: [
            {
              kind: 'table',
              caption: 'Ways to move objects',
              columns: ['Tool', 'Notes'],
              rows: [
                ['Console', 'Upload and download by hand'],
                ['`gcloud storage`', 'The recommended CLI, parallel by default: `cp`, `rsync`, `mv`, `rm`, `ls`'],
                ['`gsutil`', 'Legacy CLI. It still works, but new answers use `gcloud storage`'],
                ['JSON API / XML API', 'REST APIs. The XML API is S3-compatible, with **HMAC keys** for tools written for S3'],
                ['Storage Transfer Service', 'Large or recurring transfers from other clouds, HTTP sources or on-premises (with agents)'],
                ['Transfer Appliance', 'A physical device for hundreds of TB or more over a slow link']
              ]
            },
            {
              kind: 'code',
              title: 'Everyday object work',
              lines: [
                '$ gcloud storage cp report.pdf gs://ace-lab-web/reports/',
                '$ gcloud storage cp -r ./exports gs://ace-lab-raw/2026-10/',
                '$ gcloud storage rsync ./site gs://ace-lab-web --recursive --delete-unmatched-destination-objects',
                '$ gcloud storage ls -l gs://ace-lab-web/reports/',
                '$ gcloud storage objects describe gs://ace-lab-web/reports/report.pdf',
                '$ gcloud storage cp gs://ace-lab-web/reports/report.pdf .'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Object versioning** keeps the old version as **noncurrent** when an object is overwritten or deleted. You restore by copying the old generation back. Noncurrent versions are billed, so pair versioning with lifecycle rules (`numNewerVersions`, `daysSinceNoncurrentTime`).',
                '**Soft delete** keeps deleted and overwritten objects for **7 days by default** (configurable from 7 to 90 days, or 0 to turn it off), even without versioning, and you can restore them. Deleted buckets can be restored during the window too. Soft-deleted data is billed while it is kept.',
                '**Signed URLs** give anyone holding the URL time-limited access to one object, with no Google account, for **up to 7 days**. They are signed by a service account, through impersonation or a key. **Signed policy documents** let a browser upload straight into a bucket with conditions.'
              ]
            },
            {
              kind: 'code',
              title: 'Versioning, soft delete, a signed URL',
              lines: [
                '$ gcloud storage buckets update gs://ace-lab-web --versioning',
                '$ gcloud storage ls -a gs://ace-lab-web/reports/report.pdf      # all generations',
                '$ gcloud storage cp "gs://ace-lab-web/reports/report.pdf#1729600000000000" gs://ace-lab-web/reports/report.pdf',
                '$ gcloud storage buckets update gs://ace-lab-web --soft-delete-duration=30d',
                '$ gcloud storage ls --soft-deleted gs://ace-lab-web/reports/',
                '$ gcloud storage restore "gs://ace-lab-web/reports/old.pdf#1729500000000000"',
                '$ gcloud storage sign-url gs://ace-lab-web/reports/q3.pdf --duration=1h \\',
                '    --impersonate-service-account=signer@ace-lab-123.iam.gserviceaccount.com'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Let a customer download one file for an hour without a Google account" → a signed URL. "Recover a file someone overwrote yesterday" → object versioning (or soft delete, within its window). "Copy from Amazon S3 every night" → Storage Transfer Service. "500 TB on-premises over a 100 Mbps link" → Transfer Appliance. "An S3 tool must write to Cloud Storage" → the XML API with HMAC keys.'
            },
            {
              kind: 'quiz',
              q: 'A partner without a Google account must upload one file into your private bucket within the next 2 hours. What should you give them?',
              options: ['Make the bucket public for 2 hours', 'A signed URL for that object with the PUT method and a 2-hour duration', 'A service account key', 'Add `allUsers` as Storage Object Creator'],
              answer: 1,
              explain: 'A signed URL grants exactly one operation on one object for a limited time. Public access or keys give far more than needed.'
            }
          ]
        },
        {
          id: 's9-lifecycle',
          title: 'S9-03 · Lifecycle rules, retention policies, Bucket Lock and uniform access',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Object Lifecycle Management** acts on objects automatically. The actions are **Delete**, **SetStorageClass** (only to a colder class), and **AbortIncompleteMultipartUpload**. The conditions are **age**, **createdBefore**, **matchesStorageClass**, **numNewerVersions**, **isLive**, **daysSinceNoncurrentTime** and **matchesPrefix/Suffix**. Changes can take up to 24 hours to apply.',
                'A **retention policy** stops objects being deleted or replaced until they reach a minimum age. **Bucket Lock** makes it permanent: once locked, it can be lengthened but never shortened or removed, and the bucket cannot be deleted while objects are still under retention.',
                '**Object holds**: an **event-based hold** keeps an object until you release it, for example until a contract ends, and then the retention clock starts. A **temporary hold** is for investigations. **Object Retention Lock** sets a retain-until date on individual objects.',
                '**Uniform bucket-level access** means IAM only, with object ACLs turned off. It is the recommended default, and can be reverted within 90 days of enabling it. **Fine-grained** access keeps per-object ACLs and is legacy. **Public access prevention** blocks any public grant. **Managed folders** let you grant IAM on a prefix such as `reports/`.'
              ]
            },
            {
              kind: 'code',
              title: 'Lifecycle, retention and lock, holds, access control',
              lines: [
                '# lifecycle.json',
                '{"rule": [',
                '  {"action": {"type": "SetStorageClass", "storageClass": "COLDLINE"}, "condition": {"age": 90}},',
                '  {"action": {"type": "Delete"}, "condition": {"age": 2555}},',
                '  {"action": {"type": "Delete"}, "condition": {"numNewerVersions": 3, "isLive": false}}',
                ']}',
                '$ gcloud storage buckets update gs://ace-lab-invoices --lifecycle-file=lifecycle.json',
                '$ gcloud storage buckets update gs://ace-lab-invoices --retention-period=2555d   # about 7 years',
                '$ gcloud storage buckets update gs://ace-lab-invoices --lock-retention-period    # permanent!',
                '$ gcloud storage objects update gs://ace-lab-invoices/2026/inv-001.pdf --event-based-hold',
                '$ gcloud storage buckets update gs://ace-lab-web --uniform-bucket-level-access --public-access-prevention',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-lab-web \\',
                '    --member=group:analysts@example.com --role=roles/storage.objectViewer',
                '$ gcloud storage managed-folders create gs://ace-lab-web/reports/'
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud Storage roles',
              columns: ['Role', 'Can'],
              mono: [0],
              rows: [
                ['roles/storage.objectViewer', 'List and read objects'],
                ['roles/storage.objectCreator', 'Create objects only, with no reading, overwriting or deleting. Good for uploaders and log writers'],
                ['roles/storage.objectUser', 'Read, create, overwrite and delete objects'],
                ['roles/storage.objectAdmin', 'Full control of objects, including their IAM'],
                ['roles/storage.admin', 'Full control of buckets and objects']
              ]
            },
            {
              kind: 'case',
              title: 'Invoices kept for seven years that nobody can delete',
              situation: 'Regulation says invoice PDFs must be kept for 7 years, unchangeable, even by administrators. They are rarely read after the first month. Storage cost must be low.',
              diagnose: [
                'Unchangeable even by admins → a retention policy that is **locked** (Bucket Lock). IAM alone can be changed by an admin.',
                'Rarely read after a month → lifecycle to a colder class, Coldline after 30 days or Archive.',
                'Delete after 7 years → a lifecycle Delete rule at the same age as the retention.'
              ],
              fix: [
                '$ gcloud storage buckets create gs://ace-lab-invoices --location=asia-southeast2 --uniform-bucket-level-access',
                '$ gcloud storage buckets update gs://ace-lab-invoices --lifecycle-file=lifecycle.json',
                '$ gcloud storage buckets update gs://ace-lab-invoices --retention-period=2555d',
                '$ gcloud storage buckets update gs://ace-lab-invoices --lock-retention-period'
              ],
              why: 'Retention protects the objects, the lock protects the retention, and lifecycle keeps the cost down. Test with a short retention first, because a lock cannot be undone.',
              exam: '"WORM", "cannot be deleted or modified for N years, even by admins" → retention policy + Bucket Lock.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Move to Coldline after 90 days, delete after a year" → two lifecycle rules. "Keep only the last 3 versions" → `numNewerVersions`. "Simplify permissions, no per-object ACLs" → uniform bucket-level access. "Make sure no bucket is ever made public" → public access prevention (or the organization policy). "An uploader must not read what others uploaded" → `storage.objectCreator`.'
            },
            {
              kind: 'quiz',
              q: 'After a retention policy is locked on a bucket, what can you still do?',
              options: ['Reduce the retention period', 'Remove the retention policy', 'Increase the retention period', 'Delete objects that are younger than the retention period'],
              answer: 2,
              explain: 'A locked retention policy can only be extended. It cannot be shortened or removed, and objects stay protected until they reach the retention age.'
            }
          ]
        }
      ]
    },
    {
      id: 's10',
      title: 'Session 10 · Databases: relational, NoSQL, analytics and caching',
      sections: [
        {
          id: 's10-choose',
          title: 'S10-01 · Choosing a database',
          blocks: [
            {
              kind: 'table',
              caption: 'Match the data to the product',
              columns: ['Product', 'What it is', 'Exam cue'],
              rows: [
                ['Cloud SQL', 'Managed MySQL, PostgreSQL, SQL Server; scales up, one region (plus replicas)', '"Existing MySQL/PostgreSQL app", "lift a relational DB", "up to a few TB"'],
                ['AlloyDB for PostgreSQL', 'High-performance PostgreSQL with a columnar engine and AI features', '"PostgreSQL, faster transactions and analytics on the same data", "vector search in Postgres"'],
                ['Spanner', 'Relational, horizontally scalable, strongly consistent, regional or multi-region', '"Global users", "horizontal scale with SQL and strong consistency", "99.999%"'],
                ['Firestore', 'Serverless document database (Native or Datastore mode; MongoDB compatibility on Enterprise edition)', '"Mobile/web app", "real-time sync", "offline", "JSON documents"'],
                ['Bigtable', 'Wide-column NoSQL for huge throughput at single-digit millisecond latency', '"IoT/time series", "billions of rows", "HBase", "millions of writes per second"'],
                ['BigQuery', 'Serverless analytics warehouse with SQL', '"Analyse petabytes", "data warehouse", "BI dashboards", "ad hoc SQL over logs"'],
                ['Memorystore', 'Managed in-memory Valkey, Redis or Memcached', '"Cache", "session store", "leaderboard", "sub-millisecond"']
              ]
            },
            {
              kind: 'list',
              ordered: true,
              items: [
                'Analytics over large datasets (OLAP)? → **BigQuery**.',
                'Relational and transactional (OLTP)? Global or horizontally scaling → **Spanner**. PostgreSQL needing more performance or AI → **AlloyDB**. Otherwise → **Cloud SQL**.',
                'NoSQL? Documents for apps → **Firestore**. Massive key-based reads and writes → **Bigtable**.',
                'Only a cache in front of something else? → **Memorystore**.'
              ]
            },
            {
              kind: 'p',
              text: '**Database Center** is one dashboard over the whole fleet: Cloud SQL, AlloyDB, Spanner, Bigtable, Firestore and Memorystore instances across projects. It shows inventory, health, performance issues, and security and configuration recommendations, and Gemini can answer questions about the fleet.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Look for the words that eliminate. "SQL" removes Bigtable and Firestore. "Global, strongly consistent, horizontal" picks Spanner. "Analytics, not transactions" picks BigQuery. "Lowest latency cache" picks Memorystore. "Least change to an existing MySQL app" picks Cloud SQL.'
            },
            {
              kind: 'quiz',
              q: 'A mobile game needs a database for player profiles that syncs to devices in real time and works offline. Which do you pick?',
              options: ['Cloud SQL for MySQL', 'Bigtable', 'Firestore in Native mode', 'BigQuery'],
              answer: 2,
              explain: 'Firestore Native mode has real-time listeners and offline support in its mobile and web SDKs.'
            }
          ]
        },
        {
          id: 's10-cloudsql',
          title: 'S10-02 · Cloud SQL: HA, read replicas, backups and point-in-time recovery',
          blocks: [
            {
              kind: 'table',
              caption: 'Cloud SQL editions',
              columns: ['', 'Enterprise', 'Enterprise Plus'],
              rows: [
                ['Availability SLA', '99.95%', '**99.99%**, maintenance included'],
                ['Point-in-time recovery window', 'Up to 7 days of logs', '**Up to 35 days**'],
                ['Planned maintenance', 'Short restart', 'Near-zero downtime'],
                ['Extras', 'Shared-core and custom machine types', 'Performance-optimised machines, data cache, Query Insights extras such as index advisor']
              ]
            },
            {
              kind: 'list',
              items: [
                '**High availability** (`--availability-type=REGIONAL`): a primary and a **standby** in another zone of the same region, with synchronous replication and **automatic failover** to the same IP. The standby does not serve reads.',
                '**Read replicas** copy asynchronously and are read-only. They can be in another region. **Promoting** a replica makes it a standalone primary, which is one-way. Cross-region replicas are the classic **disaster recovery** pattern for a region outage.',
                '**Backups**: automated daily backups in a window you choose, keeping 7 by default (up to 365), plus on-demand backups that stay until you delete them. Restoring a backup **overwrites** the target instance, so restore to a new instance when you need to compare.',
                '**Point-in-time recovery** uses binary logs (MySQL) or WAL archiving (PostgreSQL). It creates a **new instance** (a clone) at the moment you choose.',
                '**Connecting**: **private IP** (private services access or Private Service Connect) with no public exposure, the **Cloud SQL Auth Proxy** or language connectors for IAM-authorised encrypted connections, and **IAM database authentication** instead of passwords.',
                '**Also**: maintenance windows and deny periods, storage auto-increase (which never shrinks), CMEK chosen **at creation**, and export or import through Cloud Storage.'
              ]
            },
            {
              kind: 'code',
              title: 'Create, replicate, back up, recover',
              lines: [
                '$ gcloud sql instances create shop-db --database-version=POSTGRES_16 --edition=ENTERPRISE_PLUS \\',
                '    --tier=db-perf-optimized-N-4 --region=asia-southeast2 --availability-type=REGIONAL \\',
                '    --enable-point-in-time-recovery --backup-start-time=18:00 \\',
                '    --network=projects/ace-lab-123/global/networks/prod-vpc --no-assign-ip',
                '$ gcloud sql instances create shop-db-dr --master-instance-name=shop-db --region=asia-southeast1',
                '$ gcloud sql backups create --instance=shop-db',
                '$ gcloud sql backups list --instance=shop-db',
                '$ gcloud sql instances clone shop-db shop-db-1004 --point-in-time="2026-10-29T03:04:00Z"',
                '$ gcloud sql instances promote-replica shop-db-dr          # region lost: make the replica primary',
                '$ gcloud sql export sql shop-db gs://ace-lab-exports/shop.sql.gz --database=shop',
                '$ gcloud sql import csv shop-db gs://ace-lab-raw/orders.csv --database=shop --table=orders',
                '$ gcloud sql connect shop-db --user=postgres --database=shop'
              ]
            },
            {
              kind: 'case',
              title: 'A bad UPDATE at 10:05',
              situation: 'At 10:05 a script ran an UPDATE without a WHERE clause on the `orders` table of a production Cloud SQL for PostgreSQL instance. It is now 10:40, and new orders kept arriving in between.',
              diagnose: [
                'The last nightly backup is from 01:00, so restoring it loses every order since then.',
                'Point-in-time recovery can rebuild the database as it was at 10:04, because WAL archiving is on.',
                'PITR creates a **new** instance, so production keeps running while you compare.'
              ],
              fix: [
                '$ gcloud sql instances clone shop-db shop-db-1004 --point-in-time="2026-10-29T03:04:00Z"',
                '# 10:04 in Jakarta (UTC+7) is 03:04 UTC',
                '# then copy the correct rows from shop-db-1004 back into shop-db, or switch the app over'
              ],
              why: 'Backups give you whole-day points. PITR gives any second inside the log window, which is 7 days on Enterprise and up to 35 on Enterprise Plus.',
              exam: '"Restore to just before the mistake" → point-in-time recovery, not the last backup.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Survive a zone failure automatically" → HA (regional) configuration. "Offload reporting queries" → a read replica. "Survive a region failure" → a cross-region replica you promote. "Connect from Cloud Run without a public IP" → private IP with Direct VPC egress, or the Cloud SQL connector. "99.99% including maintenance" → Enterprise Plus.'
            },
            {
              kind: 'quiz',
              q: 'Reporting queries slow down a Cloud SQL primary during business hours. What is the recommended fix?',
              options: ['Enable HA so the standby takes the reads', 'Create a read replica and point the reports at it', 'Double the vCPUs every morning', 'Move the reports to Memorystore'],
              answer: 1,
              explain: 'Read replicas exist to offload reads. The HA standby cannot serve traffic.'
            }
          ]
        },
        {
          id: 's10-alloydb-spanner',
          title: 'S10-03 · AlloyDB for PostgreSQL and Spanner',
          blocks: [
            {
              kind: 'list',
              items: [
                '**AlloyDB** is PostgreSQL-compatible, so existing Postgres apps and tools work. A **cluster** holds a **primary instance** (highly available across zones) and **read pool instances** for scale-out reads, on storage replicated across zones. It has a 99.99% SLA.',
                'The **columnar engine** keeps hot columns in memory in column format, so analytical queries on live transactional data run much faster with no ETL. **AlloyDB AI** stores embeddings, builds **ScaNN** vector indexes and calls models from SQL.',
                '**AlloyDB backups**: **continuous backup and recovery** (point in time, 14 days by default and up to 35) plus scheduled backups. **Secondary clusters** in another region provide disaster recovery. **AlloyDB Omni** runs the same engine outside Google Cloud.',
                '**Spanner** is relational with SQL (GoogleSQL or PostgreSQL dialect), **scales horizontally** by adding compute capacity (1 node = 1,000 processing units, from 100), and offers **external (strong) consistency**, even across regions.',
                '**Spanner editions**: Standard, Enterprise and Enterprise Plus. **Multi-region configurations need Enterprise Plus** and give a 99.999% SLA, while regional ones give 99.99%. Managed autoscaling adjusts capacity. Graph, vector and full-text search are built in.',
                '**Spanner schema**: avoid hotspots, so do not use monotonically increasing keys such as timestamps or sequences. Use UUIDv4 or bit-reversed sequences. Use **interleaved tables** for parent-child locality. Backups are kept up to a year, and PITR reads data up to 7 days back.'
              ]
            },
            {
              kind: 'code',
              title: 'AlloyDB and Spanner',
              lines: [
                '$ gcloud alloydb clusters create shop-adb --region=asia-southeast2 \\',
                '    --network=prod-vpc --password="$(gcloud secrets versions access latest --secret=adb-postgres)"',
                '$ gcloud alloydb instances create shop-adb-primary --cluster=shop-adb --region=asia-southeast2 \\',
                '    --instance-type=PRIMARY --cpu-count=4',
                '$ gcloud alloydb instances create shop-adb-read --cluster=shop-adb --region=asia-southeast2 \\',
                '    --instance-type=READ_POOL --read-pool-node-count=2 --cpu-count=4',
                '$ gcloud spanner instances create shop-span --config=regional-asia-southeast2 \\',
                '    --processing-units=1000 --edition=ENTERPRISE --description="shop orders"',
                '$ gcloud spanner databases create orders --instance=shop-span',
                '$ gcloud spanner databases execute-sql orders --instance=shop-span --sql="SELECT COUNT(*) FROM Orders"',
                '$ gcloud spanner backups create orders-20261030 --instance=shop-span --database=orders --retention-period=30d'
              ]
            },
            {
              kind: 'table',
              caption: 'When to justify AlloyDB or Spanner over Cloud SQL',
              columns: ['', 'Cloud SQL', 'AlloyDB', 'Spanner'],
              rows: [
                ['Scale', 'Vertical, plus read replicas', 'Vertical, plus read pools', 'Horizontal, nearly unlimited'],
                ['Availability', '99.95% / 99.99% (Enterprise Plus)', '99.99%', '99.99% regional, 99.999% multi-region'],
                ['Engines', 'MySQL, PostgreSQL, SQL Server', 'PostgreSQL', 'GoogleSQL or PostgreSQL dialect'],
                ['Choose when', 'Standard relational apps, easiest migration', 'Demanding Postgres: mixed OLTP + analytics, AI/vector', 'Global scale, strong consistency across regions, very high write volume']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Global inventory, strong consistency, writes from every continent" → Spanner (multi-region, Enterprise Plus). "PostgreSQL app, analytics on live data are too slow" → AlloyDB columnar engine. "Spanner write hotspot" → change the primary key away from a timestamp or sequence.'
            },
            {
              kind: 'quiz',
              q: 'A Spanner table uses an auto-incrementing order number as its primary key, and writes are slow even after adding nodes. What is the likely cause?',
              options: ['Too few processing units', 'A hotspot: sequential keys send all new writes to the same split', 'Interleaved tables', 'The regional configuration'],
              answer: 1,
              explain: 'Spanner distributes rows by key range. Monotonically increasing keys pile new writes onto one split, so use UUIDs or bit-reversed sequences.'
            }
          ]
        },
        {
          id: 's10-nosql',
          title: 'S10-04 · Firestore, Bigtable and Memorystore',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Firestore** is a serverless document database: collections, documents and subcollections, with strong consistency, automatic scaling and a 99.999% SLA in multi-region locations.',
                '**Firestore modes and editions**: **Native mode** adds real-time listeners and offline mobile and web SDKs. **Datastore mode** serves server apps through the Datastore API. The **Enterprise edition** adds **MongoDB compatibility** and a richer query engine, while the **Standard edition** remains. You can have several databases per project.',
                '**Firestore backups**: scheduled backups, **point-in-time recovery** over 7 days, and managed export/import to Cloud Storage.',
                '**Bigtable** is wide-column NoSQL for massive, low-latency workloads such as IoT, time series, ad tech and financial ticks. It speaks the **HBase API** and has SQL support. An **instance** has **clusters** (one zone each, replicated across zones and regions), and each cluster has nodes, which can autoscale. Storage is **SSD** (usual) or **HDD**, chosen at creation.',
                '**Bigtable row keys**: the **row key** is the only index, so design it for your reads and avoid hotspots. Do not start a key with a timestamp; something like `device42#20261030T1015` works. Transactions are **single-row** only. **App profiles** choose single-cluster or **multi-cluster routing** (automatic failover). **Data Boost** runs analytics without touching serving nodes.',
                '**Memorystore** is a managed in-memory store with sub-millisecond latency. **Memorystore for Valkey** is the open-source Redis fork and the usual choice for new work. **Memorystore for Redis Cluster** and **Memorystore for Redis** run Redis, and **Memorystore for Memcached** runs Memcached. Use it as a cache, session store, leaderboard or rate limiter, never as the only copy of data that matters.'
              ]
            },
            {
              kind: 'code',
              title: 'Firestore, Bigtable (cbt)',
              lines: [
                '$ gcloud firestore databases create --database=orders --location=asia-southeast2 --type=firestore-native',
                '$ gcloud firestore backups schedules create --database=orders --recurrence=daily --retention=7d',
                '$ gcloud firestore export gs://ace-lab-backups/firestore --database=orders',
                '$ gcloud bigtable instances create metrics --display-name="metrics" \\',
                '    --cluster-config=id=metrics-c1,zone=asia-southeast2-a,autoscaling-min-nodes=1,autoscaling-max-nodes=5,autoscaling-cpu-target=60',
                '$ cbt -project=ace-lab-123 -instance=metrics createtable sensor-readings',
                '$ cbt -project=ace-lab-123 -instance=metrics createfamily sensor-readings data',
                '$ cbt -project=ace-lab-123 -instance=metrics set sensor-readings device42#20261030T1015 data:temp=21.5',
                '$ cbt -project=ace-lab-123 -instance=metrics read sensor-readings count=5'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Millions of sensor writes per second, read by device and time" → Bigtable with a `device#time` row key. "Existing HBase workload" → Bigtable. "Real-time sync to phones" → Firestore Native mode. "Existing MongoDB app, serverless" → Firestore with MongoDB compatibility. "Cache query results to cut database load" → Memorystore. "Bigtable cluster slow, one node at 100% CPU" → a hotspot in the row key.'
            },
            {
              kind: 'quiz',
              q: 'Which row key is the best fit for Bigtable data queried by device for recent time ranges?',
              options: ['A timestamp, such as `20261030T1015`', 'A random UUID', '`device42#20261030T1015`', 'An auto-incrementing number'],
              answer: 2,
              explain: 'Leading with the device spreads writes and keeps each device’s readings together for range scans. A leading timestamp or counter creates a hotspot, and random keys break range reads.'
            }
          ]
        },
        {
          id: 's10-bigquery',
          title: 'S10-05 · BigQuery: querying, jobs and cost estimation',
          blocks: [
            {
              kind: 'p',
              text: '**BigQuery** is a serverless data warehouse that keeps storage and compute separate. Data sits in **datasets**, whose location is fixed at creation, as **tables**, **views** and **materialized views**. You load files (load jobs from Cloud Storage are free), stream rows (Storage Write API), schedule transfers (BigQuery Data Transfer Service), or query files in place (**external** and **BigLake** tables). **BigQuery Studio** is the workspace for SQL, notebooks and data preparation.'
            },
            {
              kind: 'table',
              caption: 'How BigQuery is billed',
              columns: ['Part', 'Model', 'Notes'],
              rows: [
                ['Compute, on-demand', 'Per TiB of data **scanned** by queries', 'First 1 TiB a month free. Columns read are what count, not rows returned'],
                ['Compute, capacity', '**Editions** (Standard, Enterprise, Enterprise Plus): slots with autoscaling, reservations, commitments', 'Predictable spend for heavy, steady use'],
                ['Storage', '**Active** vs **long-term**: a table or partition unmodified for 90 days costs about half', 'Logical or physical (compressed) billing, chosen per dataset'],
                ['Free', 'Loading, copying, exporting, deleting, metadata, and previewing a table', 'Previews in the console or `bq head` scan nothing']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Estimate before running**: a **dry run** shows the bytes a query would scan (`bq query --dry_run`, or the console validator). Then multiply by the price, or use the Pricing Calculator.',
                '**Cap spending**: `--maximum_bytes_billed` makes a query fail instead of scanning more. **Custom quotas** limit query bytes per day per project or per user.',
                '**Scan less**: **partition** (by date column, ingestion time or integer range) and **cluster** (up to four columns) so filters prune data. `require_partition_filter` forces a date filter. **Never `SELECT *`** on wide tables: `LIMIT` does not reduce the bytes scanned on an unclustered table.',
                '**Jobs**: every load, query, export and copy is a **job**. List them with `bq ls -j`, inspect with `bq show -j`, stop with `bq cancel`, and analyse history in `INFORMATION_SCHEMA.JOBS`.',
                '**Safety nets**: **time travel** reads or restores a table as it was up to 7 days back (configurable from 2 to 7). **Fail-safe** keeps 7 more days for Google to recover. **Table snapshots and clones** are cheap copies.',
                '**Access**: to run a query, a user needs **BigQuery Job User** (`roles/bigquery.jobUser`) on the project running the job, plus **Data Viewer** on the dataset. Authorized views share query results without sharing the base tables.'
              ]
            },
            {
              kind: 'code',
              title: 'bq you should recognise',
              lines: [
                '$ bq --location=asia-southeast2 mk --dataset ace-lab-123:sales',
                '$ bq mk --table --time_partitioning_field=order_date --time_partitioning_type=DAY \\',
                '    --clustering_fields=customer_id,status sales.orders \\',
                '    order_id:STRING,order_date:DATE,customer_id:STRING,status:STRING,amount:NUMERIC',
                '$ bq load --source_format=CSV --skip_leading_rows=1 sales.orders gs://ace-lab-raw/2026-10/orders.csv',
                "$ bq query --use_legacy_sql=false --dry_run 'SELECT status, SUM(amount) FROM sales.orders GROUP BY status'",
                'Query successfully validated. Assuming the tables are not modified, running this query will process 18874368 bytes of data.',
                "$ bq query --use_legacy_sql=false --maximum_bytes_billed=1000000000 'SELECT ...'",
                '$ bq head -n 10 sales.orders',
                '$ bq ls -j -n 10',
                '$ bq show -j bqjob_r1234_00000190',
                '$ bq cancel bqjob_r1234_00000190',
                "$ bq query --use_legacy_sql=false 'SELECT user_email, SUM(total_bytes_billed) AS bytes FROM `region-asia-southeast2`.INFORMATION_SCHEMA.JOBS WHERE creation_time > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) GROUP BY user_email ORDER BY bytes DESC'"
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Estimate the cost of a query before running it" → dry run. "Analysts keep running huge queries by mistake" → `maximum_bytes_billed` or custom quotas. "Queries always filter by date but scan everything" → partition by that date. "Restore a table overwritten two hours ago" → time travel (`FOR SYSTEM_TIME AS OF`). "User can see the dataset but cannot run queries" → BigQuery Job User on the project.'
            },
            {
              kind: 'quiz',
              q: 'A query `SELECT * FROM logs.events LIMIT 10` on a 4 TB unpartitioned, unclustered table is billed on-demand. Roughly how much data is billed?',
              options: ['About 10 rows’ worth', 'Almost nothing, because LIMIT stops the scan', 'About 4 TB, every column of every row', 'Only the first partition'],
              answer: 2,
              explain: 'On-demand pricing counts the columns scanned, and LIMIT does not reduce it on an unclustered table. Preview the table for free, or select only the columns you need.'
            }
          ]
        }
      ]
    },
    {
      id: 's11',
      title: 'Session 11 · Messaging, pipelines and data protection',
      sections: [
        {
          id: 's11-messaging',
          title: 'S11-01 · Pub/Sub, Managed Service for Apache Kafka and Dataflow',
          blocks: [
            {
              kind: 'table',
              caption: 'Messaging: which service',
              columns: ['', 'Pub/Sub', 'Managed Service for Apache Kafka'],
              rows: [
                ['What', 'Google’s global, serverless messaging', 'Real Apache Kafka clusters that Google runs'],
                ['You size', 'Nothing: it scales on its own', 'vCPUs (minimum 3) and memory (1–8 GiB per vCPU) per cluster; partitions per topic'],
                ['Pick when', 'New event-driven designs, fan-out, push to Cloud Run, BigQuery subscriptions', 'Existing Kafka apps and tools, Kafka APIs, migrations with no code change, Kafka Connect'],
                ['Extras', 'Dead letters, ordering keys, exactly-once (pull), filters, seek and replay, import topics', 'IAM authentication, Private Service Connect in your subnets, Kafka Connect clusters (BigQuery and Cloud Storage sinks, MirrorMaker 2)']
              ]
            },
            {
              kind: 'p',
              text: '**Pub/Sub Lite** was turned down in March 2026. Its replacements are Pub/Sub, or Managed Service for Apache Kafka for Kafka-style partitioned streams.'
            },
            {
              kind: 'code',
              title: 'Managed Kafka',
              lines: [
                '$ gcloud managed-kafka clusters create orders-kafka --location=asia-southeast2 \\',
                '    --cpu=3 --memory=3GiB --subnets=projects/ace-lab-123/regions/asia-southeast2/subnetworks/data-jkt',
                '$ gcloud managed-kafka topics create orders --cluster=orders-kafka --location=asia-southeast2 \\',
                '    --partitions=6 --replication-factor=3'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Dataflow** runs **Apache Beam** pipelines, batch and streaming with the same code, on autoscaled workers you never manage. Start from **Google-provided templates** (Pub/Sub to BigQuery, Cloud Storage text to BigQuery and others), **Flex Templates** or the job builder in the console.',
                '**Reviewing a job**: the console job page shows the **job graph** with each step’s throughput, the **data freshness** and **system lag** for streaming, autoscaling history, worker logs and errors. The job states are Running, Draining, Cancelling, Done, Failed and Cancelled.',
                '**Stopping a streaming job**: **Drain** stops reading new data but finishes what is in flight, with no data loss. **Cancel** stops at once and drops buffered data. A running streaming job can be **updated** in place with new code.'
              ]
            },
            {
              kind: 'code',
              title: 'Dataflow: a template job, then watching it',
              lines: [
                '$ gcloud dataflow jobs run orders-stream --region=asia-southeast2 \\',
                '    --gcs-location=gs://dataflow-templates-asia-southeast2/latest/PubSub_Subscription_to_BigQuery \\',
                '    --parameters=inputSubscription=projects/ace-lab-123/subscriptions/orders-df,outputTableSpec=ace-lab-123:sales.orders_stream',
                '$ gcloud dataflow jobs list --region=asia-southeast2 --status=active',
                '$ gcloud dataflow jobs describe 2026-10-30_01_02_03-1234567890 --region=asia-southeast2',
                '$ gcloud dataflow jobs drain 2026-10-30_01_02_03-1234567890 --region=asia-southeast2'
              ]
            },
            {
              kind: 'table',
              caption: 'Which pipeline tool',
              columns: ['Need', 'Use'],
              rows: [
                ['New batch or streaming pipelines, serverless', 'Dataflow (Apache Beam)'],
                ['Existing Spark or Hadoop jobs', 'Managed Service for Apache Spark (formerly Dataproc), on clusters or serverless'],
                ['Replicate database changes (CDC) into BigQuery', 'Datastream'],
                ['Visual, code-free ETL', 'Cloud Data Fusion'],
                ['Scheduled loads from SaaS sources into BigQuery', 'BigQuery Data Transfer Service'],
                ['Stream Pub/Sub messages into a table with no code', 'A Pub/Sub BigQuery subscription']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Lift existing Kafka producers and consumers with no code change" → Managed Service for Apache Kafka. "Real-time pipeline from Pub/Sub to BigQuery with transformations" → Dataflow. "Stop a streaming pipeline without losing data" → drain. "Run existing Spark jobs" → Managed Service for Apache Spark. "Is the streaming job falling behind?" → system lag and data freshness on the job page.'
            },
            {
              kind: 'quiz',
              q: 'You must replace a streaming Dataflow job with a new version and must not lose in-flight data. The new code is not compatible with an in-place update. What do you do with the old job?',
              options: ['Cancel it', 'Drain it, then start the new job', 'Delete its subscription', 'Scale it to zero workers'],
              answer: 1,
              explain: 'Drain finishes processing buffered data before stopping. Cancel drops it.'
            }
          ]
        },
        {
          id: 's11-cmek',
          title: 'S11-02 · Customer-managed encryption keys (CMEK)',
          blocks: [
            {
              kind: 'table',
              caption: 'Encryption at rest: the options',
              columns: ['Option', 'Who holds the key', 'Use when'],
              rows: [
                ['Google default encryption', 'Google, automatically', 'Always on; nothing to configure'],
                ['**CMEK** (Cloud KMS)', 'You control a key in Cloud KMS (software, Cloud HSM, or external with Cloud EKM)', 'You must control rotation, disable access, or prove key ownership'],
                ['Cloud KMS **Autokey**', 'Cloud KMS creates CMEK keys for you as resources are created', 'CMEK everywhere without managing keys by hand'],
                ['**CSEK**', 'You supply the raw key on every request; Google never stores it', 'Cloud Storage and Compute Engine only. Lose the key, lose the data']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Structure**: a **key ring** in a location holds **keys**, and each key has **versions**. The key’s location must match the data’s location, for example an `asia-southeast2` key for an `asia-southeast2` bucket.',
                '**Who uses the key**: the product’s **service agent** (not you, not your app) needs **Cloud KMS CryptoKey Encrypter/Decrypter** on the key.',
                '**Rotation** makes a new primary version for new data. Old versions still decrypt old data, and nothing is re-encrypted automatically.',
                '**Disabling** a version makes data encrypted with it unreadable until you re-enable it. **Destroying** is scheduled, 30 days by default, so it can still be cancelled.',
                '**When to choose CMEK**: some products take it only **at creation** (Cloud SQL, AlloyDB clusters, Spanner databases), so decide early. Keep keys in a separate project for separation of duties. The organization policies `gcp.restrictNonCmekServices` and `gcp.restrictCmekCryptoKeyProjects` enforce CMEK.'
              ]
            },
            {
              kind: 'code',
              title: 'A key ring, a key, and CMEK on four products',
              lines: [
                '$ gcloud kms keyrings create data-keys --location=asia-southeast2',
                '$ gcloud kms keys create storage-key --keyring=data-keys --location=asia-southeast2 \\',
                '    --purpose=encryption --rotation-period=90d --next-rotation-time=2026-12-01T00:00:00Z',
                '# Cloud Storage: authorise its service agent, then set the bucket default',
                `$ gcloud storage service-agent --authorize-cmek=${KEY}/storage-key`,
                `$ gcloud storage buckets update gs://ace-lab-web --default-encryption-key=${KEY}/storage-key`,
                '# BigQuery dataset default (the BigQuery service agent needs Encrypter/Decrypter on the key)',
                `$ bq update --default_kms_key=${KEY}/bq-key ace-lab-123:sales`,
                '# A Compute Engine disk',
                `$ gcloud compute disks create secure-1 --zone=asia-southeast2-a --size=100GB --kms-key=${KEY}/disk-key`,
                '# Cloud SQL: only when the instance is created',
                `$ gcloud sql instances create secure-db --database-version=MYSQL_8_0 --edition=ENTERPRISE --region=asia-southeast2 --tier=db-custom-2-8192 --disk-encryption-key=${KEY}/sql-key`,
                '$ gcloud kms keys versions disable 1 --key=storage-key --keyring=data-keys --location=asia-southeast2'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"The company must control and rotate the encryption keys" → CMEK with Cloud KMS. "Keys must stay outside Google" → Cloud EKM. "Keys in a hardware security module" → Cloud HSM protection level. "CMEK fails with permission denied" → the service agent lacks Encrypter/Decrypter on the key, or the key is in the wrong location. "Revoke access to the data immediately" → disable the key version.'
            },
            {
              kind: 'quiz',
              q: 'You set a CMEK key as the default for a bucket, and uploads now fail with a permission error on the key. What is missing?',
              options: ['Your user needs Cloud KMS Admin', 'The Cloud Storage service agent needs Cloud KMS CryptoKey Encrypter/Decrypter on the key', 'The bucket must use fine-grained ACLs', 'The key must be in the `global` location'],
              answer: 1,
              explain: 'Cloud Storage encrypts with the key on your behalf through its service agent, which must be granted the encrypter/decrypter role. The key must also be in a matching location.'
            }
          ]
        },
        {
          id: 's11-redundancy',
          title: 'S11-03 · Multi-region redundancy patterns',
          blocks: [
            {
              kind: 'p',
              text: 'Two numbers frame every design. The **RPO** (recovery point objective) is how much recent data you can afford to lose. The **RTO** (recovery time objective) is how long you can be down. Zonal redundancy survives a zone, not a region. For a region failure you need a copy somewhere else.'
            },
            {
              kind: 'table',
              caption: 'From zone-safe to region-safe, product by product',
              columns: ['Product', 'Survives a zone', 'Survives a region'],
              rows: [
                ['Cloud Storage', 'Any bucket (regional buckets span zones)', 'Dual-region (turbo replication for a 15-minute RPO) or multi-region'],
                ['Cloud SQL', 'HA (regional) configuration', 'Cross-region read replica you promote; backups stored in another region'],
                ['AlloyDB', 'Primary instance with HA', 'Secondary cluster in another region'],
                ['Spanner', 'Regional configuration', 'Multi-region configuration (Enterprise Plus)'],
                ['Firestore', 'Regional location', 'Multi-region location'],
                ['Bigtable', 'Clusters in two zones', 'Clusters in other regions with multi-cluster routing'],
                ['BigQuery', 'Built in', 'Multi-region dataset (`US`/`EU`), cross-region replication, or managed disaster recovery'],
                ['Compute', 'Regional MIG, regional disk', 'MIGs in two regions behind a global load balancer; snapshots stored multi-regionally']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Active-passive**: replicate to a second region, then promote and move traffic on failure. It is cheaper, but RTO and RPO are minutes.',
                '**Active-active**: a multi-region database (Spanner, Firestore) and a global load balancer. It has near-zero RPO and RTO, and costs more.',
                '**Backups as the last line**: copies in another region, immutable **backup vaults** in Backup and DR Service, and a tested restore. An untested backup is a hope, not a plan.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Survive the loss of a whole region" → a cross-region replica or a multi-region configuration. HA alone is only zonal. "Lowest RPO for objects across two named regions" → dual-region with turbo replication. "Global relational database with no data loss on a region failure" → Spanner multi-region.'
            },
            {
              kind: 'quiz',
              q: 'A Cloud SQL instance has HA enabled in `asia-southeast2`. Is the database protected if the whole region becomes unavailable?',
              options: ['Yes, HA fails over to another region', 'No, HA is zonal protection; add a cross-region replica in another region', 'Yes, if automated backups are on', 'Only if the instance uses Enterprise Plus'],
              answer: 1,
              explain: 'The HA standby is in another zone of the same region. A region failure needs a replica (or backups) somewhere else.'
            }
          ]
        }
      ]
    },
    {
      id: 's12',
      title: 'Session 12 · Lab: a data stack with a restore drill',
      sections: [
        {
          id: 's12-lab',
          title: 'Cloud SQL + Cloud Storage + BigQuery, then prove the restore',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'A raw-data bucket with lifecycle', text: 'Standard for new files, Coldline after 30 days, delete after a year.', code: ['gcloud storage buckets create gs://ace-lab-raw --location=asia-southeast2 --uniform-bucket-level-access', 'gcloud storage buckets update gs://ace-lab-raw --lifecycle-file=lifecycle.json'] },
                { title: 'Load files into BigQuery', text: 'A dataset in the same location as the bucket, then a load job (free).', code: ['bq --location=asia-southeast2 mk --dataset ace-lab-123:sales', 'bq load --source_format=CSV --autodetect sales.orders gs://ace-lab-raw/orders.csv'] },
                { title: 'A Cloud SQL instance with backups and PITR', text: 'HA on, private IP, PITR enabled.', code: ['gcloud sql instances create shop-db --database-version=POSTGRES_16 --edition=ENTERPRISE --tier=db-custom-2-8192 --region=asia-southeast2 --availability-type=REGIONAL --enable-point-in-time-recovery'] },
                { title: 'Import the application data', text: 'The instance’s service account needs read access on the bucket.', code: ['gcloud sql import csv shop-db gs://ace-lab-raw/customers.csv --database=shop --table=customers'] },
                { title: 'Take an on-demand backup, then break something', text: 'Note the time, then delete some rows on purpose.', code: ['gcloud sql backups create --instance=shop-db --description="before drill"'] },
                { title: 'Recover and verify', text: 'Clone to a point in time just before the damage, check the row counts, then record the evidence.', code: ['gcloud sql instances clone shop-db shop-db-drill --point-in-time="2026-10-30T02:59:00Z"', 'gcloud sql operations list --instance=shop-db-drill --limit=5'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'The deliverable is **restore evidence**: the operation IDs, the times, and row counts before and after. That is also what an auditor or an exam scenario means by a backup "verified to work".'
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Before the Module 3 try-out',
      sections: [
        {
          id: 'm3-cues',
          title: 'Cue → answer',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['rarely accessed, kept for years', 'Archive (or Coldline), lifecycle rules'],
                ['unknown access pattern', 'Autoclass'],
                ['temporary access for someone without a Google account', 'Signed URL'],
                ['recover an overwritten or deleted object', 'Versioning / soft delete'],
                ['cannot be deleted for N years, even by admins', 'Retention policy + Bucket Lock'],
                ['copy from S3 or another cloud, recurring', 'Storage Transfer Service'],
                ['hundreds of TB, slow link', 'Transfer Appliance'],
                ['existing MySQL/PostgreSQL, least change', 'Cloud SQL'],
                ['survive a zone failure (Cloud SQL)', 'HA (regional) instance'],
                ['offload reads', 'Read replica'],
                ['restore to just before a mistake', 'Point-in-time recovery'],
                ['global, strongly consistent SQL', 'Spanner (multi-region = Enterprise Plus)'],
                ['Postgres + fast analytics / vectors', 'AlloyDB'],
                ['IoT, time series, HBase', 'Bigtable'],
                ['mobile, real-time, offline', 'Firestore Native mode'],
                ['cache, sessions', 'Memorystore'],
                ['estimate query cost', '`bq query --dry_run`'],
                ['scan less data', 'Partition + cluster, no `SELECT *`'],
                ['existing Kafka clients', 'Managed Service for Apache Kafka'],
                ['stream processing Pub/Sub → BigQuery', 'Dataflow (or a BigQuery subscription)'],
                ['stop streaming without data loss', 'Drain'],
                ['control the encryption keys', 'CMEK; the service agent needs Encrypter/Decrypter']
              ]
            }
          ]
        },
        {
          id: 'm3-traps',
          title: 'Traps that cost points',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Colder is not always cheaper.** Frequent reads from Nearline, Coldline or Archive pay retrieval fees, and early deletion is charged.',
                '**`LIMIT` does not cut BigQuery cost** on unclustered tables. Columns scanned do.',
                '**HA is not DR.** Cloud SQL HA protects against a zone failure only.',
                '**Restoring a Cloud SQL backup overwrites the target.** PITR makes a new instance.',
                '**A locked retention policy is forever.** It can only grow.',
                '**The service agent needs the KMS role,** not the user and not the app’s service account.',
                '**Bigtable is not for SQL joins or multi-row transactions,** and Firestore is not a warehouse.',
                '**Pub/Sub Lite and Container Registry are retired.** Answers built on them are outdated.',
                '**`gsutil` still works,** but `gcloud storage` is the current tool.'
              ]
            }
          ]
        },
        {
          id: 'quiz',
          title: 'Check yourself',
          blocks: [
            {
              kind: 'quiz',
              q: 'Log files must be kept for 3 years and are almost never read after the first week. What is the most cost-effective setup?',
              options: ['A Standard bucket, deleted by hand each year', 'A bucket with lifecycle rules: to Archive after 7 days, delete after 3 years', 'A Nearline bucket with versioning', 'BigQuery long-term storage'],
              answer: 1,
              explain: 'Lifecycle rules move objects to the cheapest class once reads stop and delete them when retention ends, with no manual work.'
            },
            {
              kind: 'quiz',
              q: 'A bucket must be readable only through IAM, with no object-level ACLs, and nobody may make it public. Which two settings?',
              options: ['Fine-grained access and signed URLs', 'Uniform bucket-level access and public access prevention', 'Object versioning and soft delete', 'A retention policy and Bucket Lock'],
              answer: 1,
              explain: 'Uniform bucket-level access turns ACLs off. Public access prevention blocks `allUsers` and `allAuthenticatedUsers` grants.'
            },
            {
              kind: 'quiz',
              q: 'Your Cloud SQL for MySQL instance must survive a region outage with the least data loss. What should you add?',
              options: ['HA configuration', 'A cross-region read replica, promoted if the region fails', 'More frequent on-demand backups', 'A larger machine type'],
              answer: 1,
              explain: 'A cross-region replica holds a near-current copy in another region and can be promoted. HA stays in one region.'
            },
            {
              kind: 'quiz',
              q: 'An application needs relational tables, SQL and strong consistency for users on three continents, with writes everywhere. Which database?',
              options: ['Cloud SQL with cross-region replicas', 'Bigtable with replication', 'Spanner in a multi-region configuration', 'Firestore in Datastore mode'],
              answer: 2,
              explain: 'Spanner provides strongly consistent, horizontally scaled SQL across regions. Cloud SQL replicas are read-only, and Bigtable has no SQL transactions.'
            },
            {
              kind: 'quiz',
              q: 'Before running a large BigQuery query, you want to know how much it will cost. What do you do?',
              options: ['Run it with `LIMIT 1`', 'Run it with `--dry_run` and price the bytes processed', 'Check the table’s long-term storage size', 'Export the table first'],
              answer: 1,
              explain: 'A dry run validates the query and reports the bytes it would scan, without running it or costing anything.'
            },
            {
              kind: 'quiz',
              q: 'An analyst can open a dataset in the console but gets "Access Denied: User does not have bigquery.jobs.create permission" when querying. What do you grant?',
              options: ['BigQuery Data Owner on the dataset', 'BigQuery Job User on the project', 'BigQuery Admin on the organization', 'Storage Object Viewer'],
              answer: 1,
              explain: 'Reading data needs dataset access, and running a query is a job, which needs `bigquery.jobs.create`, given by Job User on the project.'
            },
            {
              kind: 'quiz',
              q: 'A team runs Kafka on VMs and wants Google to run it, keeping their producers, consumers and Kafka Connect connectors unchanged. What should they use?',
              options: ['Pub/Sub', 'Pub/Sub Lite', 'Managed Service for Apache Kafka', 'Dataflow'],
              answer: 2,
              explain: 'Managed Service for Apache Kafka runs real Kafka, so clients and connectors keep working. Pub/Sub Lite is retired, and Pub/Sub needs code changes.'
            },
            {
              kind: 'quiz',
              q: 'Security wants to be able to make all data in a BigQuery dataset unreadable instantly if a breach is suspected. What do you configure?',
              options: ['Default Google encryption', 'CMEK on the dataset, so disabling the key version blocks access', 'Column-level ACLs', 'Table expiration'],
              answer: 1,
              explain: 'With CMEK, disabling the key version makes the encrypted data unreadable until the version is re-enabled.'
            },
            {
              kind: 'quiz',
              q: 'Thousands of sensors send readings every second, and dashboards read the latest values per device with single-digit millisecond latency. Which store fits best?',
              options: ['Cloud SQL', 'Bigtable', 'BigQuery', 'Cloud Storage'],
              answer: 1,
              explain: 'Bigtable handles very high write throughput and low-latency key lookups. BigQuery is for analytics, not millisecond serving.'
            },
            {
              kind: 'quiz',
              q: 'You need sub-millisecond reads of session data for a web app on Cloud Run, shared by all instances. What do you use?',
              options: ['Local memory in each Cloud Run instance', 'Memorystore for Valkey, reached through Direct VPC egress', 'Firestore', 'A Cloud Storage bucket'],
              answer: 1,
              explain: 'Instances do not share memory and come and go. A managed in-memory store gives every instance the same sessions at sub-millisecond latency.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: Cloud Storage', href: '#/ace/lab/cmd/storage', note: 'gcloud storage and gsutil' },
    { label: 'Terminal: an invoice archive bucket', href: '#/ace/lab/terminal/storage-lifecycle', note: 'lifecycle and retention' },
    { label: 'Command quiz: BigQuery', href: '#/ace/lab/cmd/bq', note: 'bq mk, load, query' },
    { label: 'Terminal: BigQuery load and query', href: '#/ace/lab/terminal/bq-sales', note: 'Session 10' },
    { label: 'Command quiz: Cloud SQL, security, build', href: '#/ace/lab/cmd/ops', note: 'backups, replicas, KMS' },
    { label: 'Canvas: fix Cloud Run → Cloud SQL timeouts', href: '#/ace/lab/canvas/fix-sql-timeout', note: 'private IP and connections' },
    { label: 'Command quiz: Pub/Sub, logging, Scheduler', href: '#/ace/lab/cmd/messaging', note: 'Session 11' }
  ]
};
