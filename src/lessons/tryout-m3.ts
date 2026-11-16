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
    'Module 3 is the data half of exam guide Sections 2 and 3: choosing where data lives, loading it, querying it, protecting it and getting it back. It follows sessions 9 to 12 of the course. Cloud Storage comes first: buckets, locations and classes, objects, versioning, soft delete and signed URLs, then lifecycle and retention. Then the databases: Cloud SQL, AlloyDB, Spanner, Firestore, Bigtable, Memorystore and BigQuery with its cost model. Session 11 covers messaging and pipelines, encryption keys and multi-region redundancy, and session 12 is the restore drill. Most questions here are a choice between products, decided by one or two words in the scenario. The tables are built to make those words obvious. After each session, check it with that session’s exam (S9 to S12, 20 questions each). Then sit M3 · Set 1 to 5: 20 questions, 24 minutes each.',
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
          title: 'S11-01 · Pub/Sub: topics, subscriptions and delivery',
          blocks: [
            {
              kind: 'p',
              text: '**Pub/Sub** is Google’s global, serverless, asynchronous messaging service. It decouples the code that produces events from the code that consumes them: producers never wait for consumers, and either side can scale or fail on its own.'
            },
            {
              kind: 'table',
              caption: 'The four building blocks',
              columns: ['Piece', 'What it is'],
              rows: [
                ['**Topic**', 'The named resource publishers send to. A message is data (up to **10 MB**) plus optional key-value **attributes**.'],
                ['**Subscription**', 'A named stream of messages from one topic. **Each subscription gets its own copy of every message** (fan-out); consumers sharing one subscription split the messages between them.'],
                ['**Ack and redelivery**', 'The subscriber acknowledges each message within the **ack deadline**. An unacked message is delivered again, so delivery is **at-least-once** by default.'],
                ['**Schema**', 'An optional Avro or Protocol Buffer schema on the topic, which rejects published messages that do not match.']
              ]
            },
            {
              kind: 'table',
              caption: 'How messages are kept and delivered',
              columns: ['Setting', 'Value', 'What it means'],
              rows: [
                ['Durability', 'Stored across zones of a region', 'A message is synchronously written to at least two zones before the publish succeeds'],
                ['Ack deadline', '**10 to 600 seconds**', 'Extend it for slow handlers; when it expires, the message is redelivered'],
                ['Subscription retention', 'Unacked messages up to **7 days**', 'How long a message waits for a slow or broken consumer'],
                ['Topic retention', 'Up to **31 days**', 'Keeps messages on the topic so a subscription can replay them with seek, even ones already acked'],
                ['Message size', '**10 MB**', 'Larger payloads go in Cloud Storage; publish the object path instead'],
                ['Scope', 'Global', 'Publish and subscribe from any region; a **message storage policy** limits where messages rest']
              ]
            },
            {
              kind: 'table',
              caption: 'Subscription types: match the consumer',
              columns: ['Type', 'How it works', 'Best for'],
              rows: [
                ['**Pull**', 'The subscriber calls the API to fetch messages', 'High throughput, batch workers, Dataflow'],
                ['**Push**', 'Pub/Sub sends an HTTPS POST to an endpoint', 'Cloud Run, serverless webhooks'],
                ['**BigQuery**', 'Writes each message straight into a table', 'Ingest into analytics with no code'],
                ['**Cloud Storage**', 'Batches messages into files in a bucket', 'Archive or a data lake landing zone'],
                ['No subscription', 'Nothing is attached to the topic', 'Messages are not delivered or kept (unless topic retention is on)']
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'A new subscription only receives messages published **after** it was created. To read older ones, the topic needs **retention** and the subscription must **seek** back to a time.'
            },
            {
              kind: 'code',
              title: 'Topics, subscriptions and a test message',
              lines: [
                '# A topic and a pull subscription',
                '$ gcloud pubsub topics create orders',
                '$ gcloud pubsub subscriptions create orders-pull --topic=orders \\',
                '    --ack-deadline=60 --message-retention-duration=7d',
                '# Push to a Cloud Run service',
                '$ gcloud pubsub subscriptions create orders-push --topic=orders \\',
                '    --push-endpoint=https://orders-worker-abc123-et.a.run.app/events',
                '# BigQuery subscription: no code at all',
                '$ gcloud pubsub subscriptions create orders-bq --topic=orders \\',
                '    --bigquery-table=ace-lab-123:sales.orders_raw',
                '# Publish and pull a test message',
                `$ gcloud pubsub topics publish orders --message='{"id":1,"total":250}'`,
                '$ gcloud pubsub subscriptions pull orders-pull --auto-ack --limit=5'
              ]
            },
            {
              kind: 'quiz',
              q: 'Billing and shipping both need every order event published to the `orders` topic. How should they consume it?',
              options: ['Both read from one shared subscription', 'Each gets its own subscription on the topic', 'Create a second topic and publish everything twice', 'Use one push subscription that calls both services'],
              answer: 1,
              explain: 'Each subscription receives its own copy of every message, which is how Pub/Sub fans out. Consumers on one shared subscription split the messages between them.'
            }
          ]
        },
        {
          id: 's11-pubsub-reliability',
          title: 'S11-01 · Pub/Sub reliability: dead letters, ordering, exactly-once, replay',
          blocks: [
            {
              kind: 'p',
              text: 'Exam scenarios about Pub/Sub usually hinge on one subscription setting. Learn which problem each one solves.'
            },
            {
              kind: 'table',
              caption: 'The reliability settings',
              columns: ['Setting', 'What it does', 'The scenario'],
              rows: [
                ['**Dead-letter topic**', 'After **5 to 100** failed delivery attempts, the message moves to a separate topic', 'A malformed message is redelivered forever and blocks the consumer'],
                ['**Message ordering**', 'With ordering on the subscription and an **ordering key** on each publish, messages with the same key arrive in publish order', '"Events for the same customer must be processed in order"'],
                ['**Exactly-once delivery**', 'No redelivery after a successful ack; **pull subscriptions only**', '"Duplicates must not be processed"'],
                ['**Retention**', 'Unacked messages kept up to 7 days; topic retention up to 31 days', 'A consumer was down for two days'],
                ['**Seek and snapshots**', 'Move a subscription back to a time or a snapshot to replay messages, or forward to skip them', 'A bug corrupted results; reprocess the last six hours'],
                ['**Filters**', 'Deliver only messages whose attributes match an expression', 'One consumer only cares about `region = "id"`']
              ]
            },
            {
              kind: 'code',
              title: 'Reliability settings with gcloud',
              lines: [
                '# Dead-letter topic after 5 attempts',
                '$ gcloud pubsub topics create orders-dlq',
                '$ gcloud pubsub subscriptions update orders-pull \\',
                '    --dead-letter-topic=orders-dlq --max-delivery-attempts=5',
                '# Exactly-once and ordering are chosen when the subscription is created',
                '$ gcloud pubsub subscriptions create orders-eo --topic=orders --enable-exactly-once-delivery',
                '$ gcloud pubsub subscriptions create orders-ord --topic=orders --enable-message-ordering',
                '# Only matching messages',
                `$ gcloud pubsub subscriptions create orders-id --topic=orders --message-filter='attributes.region = "id"'`,
                '# Replay: keep 7 days on the topic, then seek the subscription back',
                '$ gcloud pubsub topics update orders --message-retention-duration=7d',
                '$ gcloud pubsub subscriptions seek orders-pull --time=2026-10-28T02:00:00Z'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'For dead-lettering to work, the **Pub/Sub service agent** (`service-PROJECT_NUMBER@gcp-sa-pubsub.iam.gserviceaccount.com`) needs **Publisher** on the dead-letter topic and **Subscriber** on the source subscription. The console grants both; with gcloud you grant them yourself.'
            },
            {
              kind: 'list',
              items: [
                '**Single message transforms (SMTs)** run light changes inside Pub/Sub itself, so a separate Dataflow job is not needed for them. A **JavaScript UDF** modifies or filters each message, and the **AI inference** transform adds a model’s prediction to each message.',
                '**Import topics** pull data into Pub/Sub from Amazon Kinesis, Amazon MSK, Azure Event Hubs, Confluent Cloud or Cloud Storage.',
                '**Bigtable subscriptions** (Preview in 2026) write messages straight into a Bigtable table, like BigQuery subscriptions do for BigQuery.'
              ]
            },
            {
              kind: 'quiz',
              q: 'A subscriber keeps failing on one malformed message, which is redelivered endlessly and holds up processing. What should you configure?',
              options: ['A longer ack deadline', 'A dead-letter topic with a maximum number of delivery attempts', 'Message ordering', 'A push subscription instead of pull'],
              answer: 1,
              explain: 'After the set number of attempts (5 to 100) the message moves to the dead-letter topic, where it can be inspected, and the rest of the stream keeps flowing.'
            },
            {
              kind: 'quiz',
              q: 'Messages with the same customer ID must be processed in the order they were published. What should be configured?',
              options: ['Exactly-once delivery', 'A dead-letter topic', 'A longer ack deadline', 'Message ordering on the subscription, and an ordering key on each message'],
              answer: 3,
              explain: 'Ordering is per key: the subscription must have ordering enabled and the publisher must set the customer ID as the ordering key. Exactly-once prevents duplicates; it does not order messages.'
            }
          ]
        },
        {
          id: 's11-dataflow',
          title: 'S11-01 · Dataflow: running, watching and stopping pipelines',
          blocks: [
            {
              kind: 'p',
              text: '**Dataflow** is Google’s fully managed runner for **Apache Beam**. You write a pipeline once, in Java, Python, Go or YAML, and the same code runs as **batch** or **streaming**. Dataflow provisions the workers, fuses and rebalances the steps, and autoscales.'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Write it in Beam', text: 'One programming model for batch and streaming.' },
                { title: 'Read from a source', text: 'Pub/Sub, Managed Kafka, Cloud Storage, BigQuery, JDBC databases and more, through Beam I/O connectors.' },
                { title: 'Transform', text: '`ParDo` for per-element work, `GroupByKey` and combiners, **windows** and **triggers** for streams. Dataflow fuses steps and rebalances work between workers.' },
                { title: 'Write to a sink', text: 'BigQuery, Bigtable, Cloud Storage, Pub/Sub. Workers scale with the backlog.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Batch or streaming',
              columns: ['', 'Batch', 'Streaming'],
              rows: [
                ['Input', 'Bounded: files in Cloud Storage, a BigQuery table', 'Unbounded: a Pub/Sub or Kafka topic'],
                ['End of the job', 'Finishes with state **Done** when all data is processed', 'Runs until you **drain** or **cancel** it'],
                ['Typical use', 'Nightly ETL, backfills, reprocessing', 'Real-time dashboards, enrichment, alerting'],
                ['Special features', '**FlexRS**: cheaper, delay-tolerant batch on a mix of VM types', '**Windows** and **watermarks** handle late data; watch **data freshness** and **system latency**']
              ]
            },
            {
              kind: 'table',
              caption: 'Performance and cost levers: tune before adding workers',
              columns: ['Lever', 'What it does'],
              rows: [
                ['**Streaming Engine**', 'Moves state and shuffle off the workers into the service, so streaming jobs scale faster and use smaller workers'],
                ['**Autoscaling**', 'Adds and removes workers as the backlog and CPU change; set a maximum to cap cost'],
                ['**FlexRS**', 'Runs delay-tolerant batch jobs at a lower price'],
                ['**Templates and job builder**', 'Google-provided classic and Flex templates, and a visual job builder in the console, for common pipelines with no code'],
                ['**Region**', 'Run the job in the same region as its sources and sinks'],
                ['**Worker identity**', 'A dedicated worker service account and private IPs only (`--disable-public-ips`) for security']
              ]
            },
            {
              kind: 'code',
              title: 'Launching a Google-provided template',
              lines: [
                '# Flex template: Pub/Sub subscription -> BigQuery',
                '$ gcloud dataflow flex-template run orders-stream --region=asia-southeast2 \\',
                '    --template-file-gcs-location=gs://dataflow-templates-asia-southeast2/latest/flex/PubSub_to_BigQuery_Flex \\',
                '    --parameters=inputSubscription=projects/ace-lab-123/subscriptions/orders-pull,outputTableSpec=ace-lab-123:sales.orders',
                '# Classic template: Cloud Storage text -> BigQuery uses `gcloud dataflow jobs run --gcs-location=...`'
              ]
            },
            {
              kind: 'code',
              title: 'Reviewing and stopping a job',
              lines: [
                '$ gcloud dataflow jobs list --region=asia-southeast2 --status=active',
                '$ gcloud dataflow jobs describe 2026-10-30_01_02_03-1234567890 --region=asia-southeast2',
                '# Stop a streaming job safely: finish in-flight data first',
                '$ gcloud dataflow jobs drain 2026-10-30_01_02_03-1234567890 --region=asia-southeast2',
                '# Stop immediately: in-flight data is lost',
                '$ gcloud dataflow jobs cancel 2026-10-30_01_02_03-1234567890 --region=asia-southeast2'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Job states**: Queued, Running, Draining, Cancelling, then Done, Failed, Cancelled, Drained or Updated.',
                '**In the console**, the job page shows the **job graph** with each step’s throughput, step metrics, autoscaling history and worker logs. For streaming, **data freshness** and **system latency** tell you whether the job is falling behind.'
              ]
            },
            {
              kind: 'table',
              caption: 'Stopping and updating: decide by what happens to data in flight',
              columns: ['Action', 'Effect', 'Use when'],
              rows: [
                ['**Drain**', 'Stops reading new data, finishes what is in flight, then stops', 'A planned stop or an incompatible code change on a streaming job'],
                ['**Cancel**', 'Stops at once; buffered data is lost', 'A faulty job whose input can be replayed'],
                ['**Update**', 'Replaces a running streaming job with a compatible new version, keeping its state', 'A small pipeline change without a restart'],
                ['**Snapshot**', 'Saves a streaming job’s state for a later restart', 'Before a risky change, or to move the job']
              ]
            },
            {
              kind: 'quiz',
              q: 'A streaming Dataflow job must be stopped for a code change without losing messages it has already read from Pub/Sub. Which action should you take?',
              options: ['`gcloud dataflow jobs cancel`', '`gcloud dataflow jobs drain`', 'Delete the subscription', 'Scale the workers to zero'],
              answer: 1,
              explain: 'Drain finishes processing buffered data before stopping. Cancel drops it.'
            },
            {
              kind: 'quiz',
              q: 'Order events must be parsed, enriched and windowed before they land in BigQuery, with no servers to manage. What fits best?',
              options: ['A Pub/Sub BigQuery subscription', 'A Dataflow streaming pipeline', 'A Cloud Storage subscription', 'Transfer Appliance'],
              answer: 1,
              explain: 'A BigQuery subscription writes messages as they are, with at most simple transforms. Enrichment and windowing need a pipeline, and Dataflow runs it serverlessly.'
            }
          ]
        },
        {
          id: 's11-kafka',
          title: 'S11-01 · Managed Service for Apache Kafka, and which service to pick',
          blocks: [
            {
              kind: 'table',
              caption: 'Managed Service for Apache Kafka in four lines',
              columns: ['', ''],
              rows: [
                ['What you manage', 'Cluster size (vCPUs, minimum 3, and 1–8 GiB of memory per vCPU), topics, partitions and consumer groups. Google runs the brokers, patching and storage.'],
                ['Networking', 'Clients reach the cluster privately, through **Private Service Connect** endpoints in the subnets you list.'],
                ['Compatibility', 'Standard Kafka clients, **Kafka Connect** and existing tooling work unchanged, which makes migrations easy.'],
                ['Security and integration', 'Clients authenticate with **IAM** or mTLS. Connectors move data to and from BigQuery, Cloud Storage and Pub/Sub, and MirrorMaker 2 replicates from other Kafka clusters.']
              ]
            },
            {
              kind: 'code',
              title: 'A cluster, a topic and its consumer groups',
              lines: [
                '$ gcloud managed-kafka clusters create orders-kafka --location=asia-southeast2 \\',
                '    --cpu=3 --memory=3GiB --subnets=projects/ace-lab-123/regions/asia-southeast2/subnetworks/data-jkt',
                '$ gcloud managed-kafka topics create orders --cluster=orders-kafka --location=asia-southeast2 \\',
                '    --partitions=6 --replication-factor=3',
                '$ gcloud managed-kafka consumer-groups list --cluster=orders-kafka --location=asia-southeast2'
              ]
            },
            {
              kind: 'table',
              caption: 'Pub/Sub, Kafka or something else?',
              columns: ['The scenario says…', 'Use'],
              rows: [
                ['New event-driven app, no operations wanted', 'Pub/Sub (serverless, global, no partitions to size)'],
                ['Existing Kafka producers and consumers, no code change', 'Managed Service for Apache Kafka'],
                ['Needs the Kafka Connect or Kafka Streams ecosystem', 'Managed Service for Apache Kafka'],
                ['Push events to Cloud Run, or straight into BigQuery', 'Pub/Sub push or BigQuery subscription'],
                ['Stream transforms, windowing, joins', 'Dataflow, reading from either'],
                ['Existing Spark or Hadoop jobs', 'Managed Service for Apache Spark (formerly Dataproc), not Dataflow'],
                ['Replicate database changes (CDC) into BigQuery', 'Datastream'],
                ['Visual, code-free ETL', 'Cloud Data Fusion'],
                ['Scheduled loads from SaaS sources into BigQuery', 'BigQuery Data Transfer Service']
              ]
            },
            {
              kind: 'p',
              text: '**Pub/Sub Lite** was turned down in March 2026. Its replacements are Pub/Sub, or Managed Service for Apache Kafka for Kafka-style partitioned streams.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Lift existing Kafka producers and consumers with no code change" → Managed Service for Apache Kafka. "Real-time pipeline from Pub/Sub to BigQuery with transformations" → Dataflow. "Stop a streaming pipeline without losing data" → drain. "Run existing Spark jobs" → Managed Service for Apache Spark. "Is the streaming job falling behind?" → system latency and data freshness on the job page.'
            },
            {
              kind: 'quiz',
              q: 'A team runs dozens of Kafka producers and consumers on-premises and wants to move them to Google Cloud with no code change and no brokers to manage. What should they use?',
              options: ['Pub/Sub with a push subscription', 'Managed Service for Apache Kafka', 'Dataflow with a Kafka template', 'Kafka on Compute Engine VMs'],
              answer: 1,
              explain: 'Managed Kafka speaks the Kafka protocol, so the clients only need new connection settings, and Google runs the brokers. Pub/Sub would need code changes; VMs keep the operations work.'
            }
          ]
        },
        {
          id: 's11-cmek',
          title: 'S11-02 · Encryption keys: Google-managed, CMEK or CSEK',
          blocks: [
            {
              kind: 'p',
              text: 'Everything in Google Cloud is **encrypted at rest by default**. The question in an exam scenario is never "is it encrypted?" but **who controls the key**.'
            },
            {
              kind: 'table',
              caption: 'Encryption at rest: the three options',
              columns: ['', 'Google-managed (default)', 'CMEK', 'CSEK'],
              rows: [
                ['Key stored in', 'Google’s internal key management', 'Cloud KMS, in your project', 'Nowhere at Google: you send it with each request'],
                ['Your control', 'None needed', 'Rotate, disable, destroy, audit', 'Full; lose the key and the data is lost'],
                ['Services', 'All', 'Most storage and database services', 'Cloud Storage and Compute Engine only'],
                ['Protection level', 'Software', 'Software, HSM, or external (Cloud EKM)', 'Your own key material'],
                ['Effort', 'Zero', 'Moderate: IAM for the service agent, key location', 'High: you distribute and keep the keys']
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Data key', text: 'The service encrypts your data with a **data encryption key (DEK)**.' },
                { title: 'Wrap', text: 'Cloud KMS encrypts ("wraps") the DEK with your **customer key**, the **key encryption key (KEK)**.' },
                { title: 'Store', text: 'The wrapped DEK is stored next to the data. Your key never leaves Cloud KMS.' },
                { title: 'Read', text: 'To read, the service asks Cloud KMS to unwrap the DEK, acting as its **service agent**. Disable the key and that call fails, so the data is unreadable.' }
              ]
            },
            {
              kind: 'p',
              text: 'This is **envelope encryption**. CMEK keys are symmetric 256-bit AES-GCM keys, and the key material stays inside the Cloud KMS boundary.'
            },
            {
              kind: 'table',
              caption: 'The Cloud KMS hierarchy',
              columns: ['Level', 'What to know'],
              rows: [
                ['**Location**', 'A region or multi-region. Keys stay where they are created, so create them where the protected data lives'],
                ['**Key ring**', 'Groups keys by location and purpose. Key rings can be deleted since August 2026; older material says they cannot'],
                ['**Key**', 'Has a purpose (encryption for CMEK) and a **protection level**, fixed when it is created'],
                ['**Key version**', 'The actual key material. Rotation adds a new **primary** version; older versions still decrypt until destroyed']
              ]
            },
            {
              kind: 'table',
              caption: 'Protection levels: more assurance, more cost and effort',
              columns: ['Level', 'Where the key material lives', 'Notes'],
              rows: [
                ['**Software**', 'Cloud KMS software', 'The default for most CMEK keys, lowest cost'],
                ['**HSM**', 'Multi-tenant Cloud HSM (FIPS 140-2 Level 3)', 'Hardware-backed keys for stricter compliance'],
                ['**Single-tenant HSM**', 'A dedicated HSM instance', 'GA in December 2025 in a few regions; quorum approval; extra cost'],
                ['**External (Cloud EKM)**', 'A partner key manager outside Google', 'The key never enters Google; Google calls the partner for each operation']
              ]
            },
            {
              kind: 'quiz',
              q: 'A bank must be able to make its data in Google Cloud unreadable at any time by revoking the key, and the key must stay in Google Cloud. Which option fits?',
              options: ['Google-managed keys', 'CMEK in Cloud KMS', 'CSEK', 'Client-side encryption in the application'],
              answer: 1,
              explain: 'CMEK keeps the key in Cloud KMS under the bank’s control: disabling the key version blocks every read. Default keys give no such control, and CSEK keeps keys outside Google.'
            }
          ]
        },
        {
          id: 's11-cmek-setup',
          title: 'S11-02 · Setting up CMEK on each service',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Create a key ring', text: 'In the same location as the data, for example `asia-southeast2` for Jakarta resources.', code: ['gcloud kms keyrings create data-keys --location=asia-southeast2'] },
                { title: 'Create a key', text: 'Purpose encryption, a protection level, and an automatic rotation period.', code: ['gcloud kms keys create storage-key --keyring=data-keys --location=asia-southeast2 --purpose=encryption --protection-level=software --rotation-period=90d --next-rotation-time=2026-12-01T00:00:00Z'] },
                { title: 'Grant the service agent', text: 'The **service agent** of the product that will use the key needs **Cloud KMS CryptoKey Encrypter/Decrypter**, granted on the key. You and your app do not need it.' },
                { title: 'Attach the key to the resource', text: 'Set it on the bucket, dataset, instance or disk, often only when the resource is created.' }
              ]
            },
            {
              kind: 'code',
              title: 'Granting a service agent access to the key',
              lines: [
                '# Create (or look up) the service agent of the target service',
                '$ gcloud beta services identity create --service=sqladmin.googleapis.com',
                '# Grant Encrypter/Decrypter on the key, not on the project',
                '$ gcloud kms keys add-iam-policy-binding sql-key --keyring=data-keys --location=asia-southeast2 \\',
                '    --member=serviceAccount:service-123456789012@gcp-sa-cloud-sql.iam.gserviceaccount.com \\',
                '    --role=roles/cloudkms.cryptoKeyEncrypterDecrypter',
                '$ gcloud kms keys get-iam-policy sql-key --keyring=data-keys --location=asia-southeast2'
              ]
            },
            {
              kind: 'table',
              caption: 'Where the key is set in each service',
              columns: ['Service', 'Where', 'Flag or note'],
              rows: [
                ['Cloud Storage', 'Bucket default key', '`--default-encryption-key`; new objects use it. Authorize the service agent first'],
                ['BigQuery', 'Dataset default key (or per table)', '`bq mk -d --default_kms_key`; new tables inherit it'],
                ['Cloud SQL', 'At instance creation only', '`--disk-encryption-key`; cannot be added to an existing instance'],
                ['AlloyDB, Spanner', 'At cluster or database creation', 'Decide before deploying'],
                ['Compute Engine', 'Disk, image or snapshot', '`--kms-key` when it is created'],
                ['Pub/Sub', 'Topic', '`--topic-encryption-key`'],
                ['Dataflow', 'Job', '`--dataflow-kms-key` encrypts job state and temporary data'],
                ['GKE', 'Boot disks and application-layer secrets', 'Node pool `--boot-disk-kms-key`; cluster `--database-encryption-key` for Secrets']
              ]
            },
            {
              kind: 'code',
              title: 'CMEK on six products',
              lines: [
                '# Cloud Storage: authorise its service agent, then set the bucket default',
                `$ gcloud storage service-agent --authorize-cmek=${KEY}/storage-key`,
                `$ gcloud storage buckets update gs://ace-lab-web --default-encryption-key=${KEY}/storage-key`,
                '# BigQuery: a dataset whose new tables use the key',
                `$ bq mk -d --default_kms_key=${KEY}/bq-key ace-lab-123:sales_secure`,
                '# Compute Engine disk',
                `$ gcloud compute disks create secure-1 --zone=asia-southeast2-a --size=100GB --kms-key=${KEY}/disk-key`,
                '# Cloud SQL: only when the instance is created',
                `$ gcloud sql instances create secure-db --database-version=POSTGRES_16 --edition=ENTERPRISE --region=asia-southeast2 --tier=db-custom-2-8192 --disk-encryption-key=${KEY}/sql-key`,
                '# Pub/Sub topic',
                `$ gcloud pubsub topics create orders-secure --topic-encryption-key=${KEY}/pubsub-key`,
                '# Dataflow job',
                `$ gcloud dataflow flex-template run secure-job --region=asia-southeast2 --dataflow-kms-key=${KEY}/df-key \\`,
                '    --template-file-gcs-location=gs://dataflow-templates-asia-southeast2/latest/flex/PubSub_to_BigQuery_Flex'
              ]
            },
            {
              kind: 'table',
              caption: 'Troubleshooting CMEK: identity, location or key state',
              columns: ['Symptom', 'Cause'],
              rows: [
                ['Permission denied on the key, even though you are a KMS admin', 'The **service agent** lacks Encrypter/Decrypter on the key'],
                ['The resource cannot use the key', '**Location mismatch**: the key must be in a location compatible with the resource'],
                ['Data suddenly unreadable', 'The key version was **disabled** or **destroyed**, or the service agent’s role was revoked'],
                ['Cannot switch an existing Cloud SQL instance to CMEK', 'The key is fixed **at creation**: create a new instance and migrate'],
                ['Who used the key, and when?', '**Cloud Audit Logs** for Cloud KMS record encrypt and decrypt calls']
              ]
            },
            {
              kind: 'quiz',
              q: 'You set a CMEK key on a new Cloud SQL instance, and creation fails with a permission error on the key. Your user is a Cloud KMS admin. What is missing?',
              options: ['`roles/cloudkms.admin` for your user', 'Cloud KMS CryptoKey Encrypter/Decrypter for the Cloud SQL service agent, on the key', 'A CSEK key in the request', 'A multi-region key ring'],
              answer: 1,
              explain: 'The service encrypts on your behalf through its service agent, so the agent needs the role. Your own role is irrelevant, and the key must be in the instance’s region.'
            }
          ]
        },
        {
          id: 's11-cmek-lifecycle',
          title: 'S11-02 · Governing keys: Autokey, organization policy, rotation and destruction',
          blocks: [
            {
              kind: 'table',
              caption: 'Manual CMEK or Autokey',
              columns: ['Manual CMEK', 'Cloud KMS Autokey'],
              rows: [
                ['Admins create key rings and keys in advance', 'Keys are created on demand, when the resource is created'],
                ['Service agent grants are made by hand', 'Service agent roles are granted automatically'],
                ['Naming and rotation set key by key', 'Every key follows one consistent pattern'],
                ['Full control over each key and level', 'Keys in a dedicated key project, or in the same project (GA July 2026)'],
                ['Fits small, fixed environments', 'Fits large environments with many teams; enabled per folder or project']
              ]
            },
            {
              kind: 'table',
              caption: 'Enforce CMEK centrally instead of trusting each team',
              columns: ['Control', 'What it does'],
              rows: [
                ['`gcp.restrictNonCmekServices`', 'Organization policy that **denies new resources** in the listed services unless a CMEK key is set'],
                ['`gcp.restrictCmekCryptoKeyProjects`', 'Organization policy that limits **which projects may hold** the keys used for CMEK'],
                ['Cloud Audit Logs', 'Record key use; alert on key **disable** and **destroy** events'],
                ['Separation of duties', 'KMS admins manage keys (often in a separate project); data owners only use them']
              ]
            },
            {
              kind: 'table',
              caption: 'Key version states: treat disable and destroy like deleting data',
              columns: ['State', 'Effect', 'Reversible?'],
              rows: [
                ['**Enabled**', 'Used to encrypt and decrypt', '—'],
                ['**Disabled**', 'Cannot be used; data it protects is unreadable', 'Yes: enable it again'],
                ['**Scheduled for destruction**', 'Disabled during a waiting period, **30 days** by default', 'Yes: **restore** before the wait ends'],
                ['**Destroyed**', 'Key material is gone; the data is permanently unreadable', 'No'],
                ['**Deleted**', 'The key or version resource is removed (GA March 2026)', 'No, and the name cannot be reused']
              ]
            },
            {
              kind: 'code',
              title: 'Rotate, disable, destroy and restore',
              lines: [
                '# Rotate now: add a new primary version (new data uses it; old data is not re-encrypted)',
                '$ gcloud kms keys versions create --key=storage-key --keyring=data-keys --location=asia-southeast2 --primary',
                '# Disable a version (reversible)',
                '$ gcloud kms keys versions disable 1 --key=storage-key --keyring=data-keys --location=asia-southeast2',
                '# Schedule destruction, then cancel it within the waiting period',
                '$ gcloud kms keys versions destroy 1 --key=storage-key --keyring=data-keys --location=asia-southeast2',
                '$ gcloud kms keys versions restore 1 --key=storage-key --keyring=data-keys --location=asia-southeast2'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Rotation** adds a new primary version for new data. Existing data stays readable with the older versions, and nothing is re-encrypted automatically. Destroy an old version only after the data that uses it has been re-encrypted.',
                'Do not put the key in a different region from a regional resource: CMEK needs compatible locations.',
                'Some products take a key only **at creation** (Cloud SQL, AlloyDB clusters, Spanner databases), so decide early.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"The company must control and rotate the encryption keys" → CMEK with Cloud KMS. "Keys must stay outside Google" → Cloud EKM. "Keys in a hardware security module" → HSM protection level. "No bucket may be created without CMEK" → `gcp.restrictNonCmekServices`. "Revoke access to the data immediately" → disable the key version. "A key was scheduled for destruction by mistake" → restore it before the wait ends.'
            },
            {
              kind: 'quiz',
              q: 'A security team requires that no new Cloud Storage bucket in a folder can be created without a customer-managed key. What should be used?',
              options: ['Object Versioning', 'The `gcp.restrictNonCmekServices` organization policy', 'A retention policy', 'Uniform bucket-level access'],
              answer: 1,
              explain: 'The constraint rejects new resources in the listed services that have no CMEK key, enforced for the whole folder.'
            },
            {
              kind: 'quiz',
              q: 'A key version protecting production data was scheduled for destruction by mistake. What should the team do?',
              options: ['Restore the key version before the waiting period ends', 'Create a new key ring', 'Rotate the key', 'Switch the resources to CSEK'],
              answer: 0,
              explain: 'Destruction waits 30 days by default, and `gcloud kms keys versions restore` cancels it. Rotating adds a new version but cannot decrypt data protected by the old one once it is destroyed.'
            }
          ]
        },
        {
          id: 's11-redundancy',
          title: 'S11-03 · RPO, RTO and disaster recovery strategies',
          blocks: [
            {
              kind: 'table',
              caption: 'Every DR design starts with two business numbers',
              columns: ['Term', 'Meaning'],
              rows: [
                ['**RPO** (recovery point objective)', 'How much recent data you can afford to lose, measured in time'],
                ['**RTO** (recovery time objective)', 'How long you can afford to be down'],
                ['**3-2-1 rule**', 'Three copies of the data, on two kinds of media, with one copy off-site or in another region']
              ]
            },
            {
              kind: 'table',
              caption: 'DR strategies: a lower RTO and RPO always costs more',
              columns: ['Pattern', 'State of the recovery region', 'Typical RTO', 'Cost'],
              rows: [
                ['**Backup and restore**', 'Nothing running; backups copied there', 'Hours', 'Lowest'],
                ['**Pilot light**', 'Data replicated; compute switched off', 'Tens of minutes', 'Low'],
                ['**Warm standby**', 'A scaled-down copy is running', 'Minutes', 'Medium'],
                ['**Active-active**', 'Full capacity in two or more regions', 'Near zero', 'Highest']
              ]
            },
            {
              kind: 'table',
              caption: 'Failure domains: choose the smallest one that meets the targets',
              columns: ['Domain', 'What survives'],
              rows: [
                ['**Zone**', 'Nothing zonal: a single VM or zonal disk fails with its zone. Spread instances across zones'],
                ['**Region**', 'Regional MIGs, regional disks and Cloud SQL HA survive the loss of one zone, not the region'],
                ['**Multi-region**', 'Survives a regional outage, at the price of latency, replication cost and design work'],
                ['**Global**', 'Global resources such as the external Application Load Balancer outlive a region; check each one']
              ]
            },
            {
              kind: 'quiz',
              q: 'A regional outage must be survived with minutes of downtime and almost no data loss, and cost is not the main concern. Which pattern fits?',
              options: ['Backup and restore', 'Pilot light', 'Active-active across two regions', 'A single region with HA'],
              answer: 2,
              explain: 'Only active-active (or a very warm standby) gives near-zero RTO and RPO for a region failure. HA in one region survives only a zone.'
            }
          ]
        },
        {
          id: 's11-redundancy-products',
          title: 'S11-03 · Redundancy product by product, and configuring it',
          blocks: [
            {
              kind: 'table',
              caption: 'From zone-safe to region-safe',
              columns: ['Product', 'Survives a zone', 'Survives a region', 'Failover'],
              rows: [
                ['Cloud Storage', 'Any bucket (regional buckets span zones)', 'Dual-region or multi-region bucket', 'Automatic'],
                ['Cloud SQL', 'HA (regional) configuration', 'Cross-region read replica; backups in another region', 'Promote the replica, or DR switchover'],
                ['AlloyDB', 'Primary instance with HA', 'Secondary cluster in another region', 'Promote the secondary'],
                ['Spanner', 'Regional configuration', 'Dual-region or multi-region configuration (Enterprise Plus)', 'Automatic, synchronous'],
                ['Firestore', 'Regional location', 'Multi-region location such as `nam5` or `eur3`', 'Automatic'],
                ['Bigtable', 'Clusters in two zones', 'A cluster in another region with multi-cluster routing', 'Automatic'],
                ['Memorystore for Valkey', 'Replicas across zones', 'Cross-region replication', 'Promote the secondary'],
                ['BigQuery', 'Built in', 'Multi-region dataset, cross-region replica, or managed disaster recovery', 'Promote the replica'],
                ['Pub/Sub', 'Built in', 'Global service; a storage policy limits the regions', 'Automatic within the allowed regions'],
                ['Compute disks', 'Regional persistent disk', 'Snapshots stored in another region', 'Restore the snapshot there']
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'Most locations are chosen **at creation** and cannot be changed later: a bucket, a BigQuery dataset, a Spanner configuration. Plan redundancy before deploying.'
            },
            {
              kind: 'table',
              caption: 'Cloud Storage locations and replication',
              columns: ['Location', 'Replication', 'RPO', 'Notes'],
              rows: [
                ['Region', 'Across zones in one region', 'No cross-region copy', 'Lowest cost; Jakarta (`asia-southeast2`) is a region only'],
                ['Dual-region', 'Asynchronous to the second region', 'Up to 12 hours; usually within an hour', 'Predefined pairs such as `ASIA1` (Tokyo and Osaka), or two regions you choose'],
                ['Dual-region + **turbo replication**', 'Asynchronous, premium', '**15 minutes**, covered by the SLA', 'Dual-region buckets only'],
                ['Multi-region', 'Asynchronous across regions', 'Default replication', 'No turbo option']
              ]
            },
            {
              kind: 'table',
              caption: 'Compute and network redundancy: stateless tiers move with traffic, stateful ones need replicated data',
              columns: ['Layer', 'Pattern', 'On failure'],
              rows: [
                ['Instances', 'Regional managed instance group', 'VMs spread across zones and autoheal'],
                ['Traffic', 'Global load balancer with backends in two regions', 'Health checks move traffic to the healthy region'],
                ['DNS', 'Cloud DNS **failover routing policy**', 'Health-checked records switch to the backup'],
                ['Disks', 'Regional disks; snapshots in another region', 'Restore the snapshot in the recovery region'],
                ['GKE', 'Regional clusters; multi-cluster Gateway', 'Traffic moves between clusters']
              ]
            },
            {
              kind: 'code',
              title: 'Configuring multi-region resources',
              lines: [
                '# Dual-region bucket with turbo replication',
                '$ gcloud storage buckets create gs://ace-lab-dr --location=ASIA1 --rpo=ASYNC_TURBO',
                '# Cloud SQL cross-region read replica, promoted during a regional outage',
                '$ gcloud sql instances create shop-db-sg --master-instance-name=shop-db --region=asia-southeast1',
                '$ gcloud sql instances promote-replica shop-db-sg',
                '# Pub/Sub: only keep messages in Jakarta and Singapore',
                '$ gcloud pubsub topics update orders --message-storage-policy-allowed-regions=asia-southeast2,asia-southeast1',
                '# Regional MIG across zones',
                '$ gcloud compute instance-groups managed create web-mig --region=asia-southeast2 --size=3 --template=web-tpl',
                '# Daily snapshots stored in Singapore',
                '$ gcloud compute resource-policies create snapshot-schedule daily-snap --region=asia-southeast2 \\',
                '    --daily-schedule --start-time=18:00 --storage-location=asia-southeast1 --max-retention-days=14',
                '# Spanner across Tokyo and Osaka (Enterprise Plus)',
                '$ gcloud spanner instances create ledger --config=asia1 --edition=ENTERPRISE_PLUS \\',
                '    --processing-units=1000 --description=Ledger'
              ]
            },
            {
              kind: 'quiz',
              q: 'A dual-region bucket must copy newly written objects to the second region within a guaranteed 15 minutes. What should you enable?',
              options: ['Object Versioning', 'Turbo replication', 'Autoclass', 'Soft delete'],
              answer: 1,
              explain: 'Turbo replication (`--rpo=ASYNC_TURBO`) is the only option with a 15-minute RPO, and only for dual-region buckets. Default replication can take up to 12 hours.'
            },
            {
              kind: 'quiz',
              q: 'A Cloud SQL instance has HA enabled in `asia-southeast2`. Is the database protected if the whole region becomes unavailable?',
              options: ['Yes, HA fails over to another region', 'No, HA is zonal protection; add a cross-region replica', 'Yes, if automated backups are on', 'Only with the Enterprise Plus edition'],
              answer: 1,
              explain: 'The HA standby is in another zone of the same region. A region failure needs a replica, or backups, somewhere else.'
            }
          ]
        },
        {
          id: 's11-dr-ops',
          title: 'S11-03 · Failing over, data residency and DR testing',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Create a replica', text: 'Add a cross-region read replica of the primary in the recovery region.' },
                { title: 'Replicate', text: 'Replication is **asynchronous**, so a failover can lose the latest transactions.' },
                { title: 'Switch over or fail over', text: 'A **switchover** is planned and waits for the replica to catch up, losing nothing. A **failover** (promoting the replica) is for an outage and may lose data.' },
                { title: 'Re-protect', text: 'Afterwards, add a new replica so the new primary is protected again. PITR is re-enabled automatically, but asynchronously.' }
              ]
            },
            {
              kind: 'table',
              caption: 'BigQuery managed disaster recovery (Enterprise Plus only)',
              columns: ['', ''],
              rows: [
                ['Needs', 'An **Enterprise Plus** reservation in the primary region, with the datasets attached to it'],
                ['RPO', 'About **15 minutes** for each replicated dataset (turbo replication)'],
                ['RTO', 'About **5 minutes**: compute capacity is ready in the secondary region once failover starts'],
                ['Cost', 'You pay for primary compute; the secondary’s baseline adds none. Storage and replication are billed']
              ]
            },
            {
              kind: 'table',
              caption: 'Soft or hard failover in BigQuery (no more than one per 10 minutes)',
              columns: ['Soft failover', 'Hard failover'],
              rows: [
                ['Waits until every change has reached the secondary', 'Promotes the secondary immediately'],
                ['Both regions must be available', 'Works even when the primary is offline'],
                ['No data loss', 'Unreplicated data, and access grants, can be lost'],
                ['For planned tests and moves', 'For a real regional outage']
              ]
            },
            {
              kind: 'table',
              caption: 'Data residency against redundancy: the law can rule out DR regions',
              columns: ['Data must stay in Indonesia', 'Cross-region DR is allowed'],
              rows: [
                ['Every resource in `asia-southeast2` (Jakarta)', 'A replica in Singapore (`asia-southeast1`)'],
                ['Spread across zones: regional MIGs and disks, Cloud SQL HA, a regional bucket', 'Dual-region buckets, multi-region configurations'],
                ['Enforce it with the `gcp.resourceLocations` organization policy', 'A Pub/Sub storage policy limits where messages rest'],
                ['Keep backups in Jakarta too', 'Confirm the legal basis first, and document RPO and RTO per region pair']
              ]
            },
            {
              kind: 'list',
              items: [
                'A design counts only when a test has **measured** the recovery. Write **runbooks** with owners, commands and decision points for each step.',
                'Test failover on a schedule and record the measured RTO and RPO. Run **game days**: a zone failure first, then a regional one.',
                'An untested replica is not a plan: check that it can be promoted and that the application can reach it.',
                'Monitor **replication lag** and alert before the RPO is missed. Plan the **failback** to the primary region as its own procedure.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Survive the loss of a whole region" → a cross-region replica or a multi-region configuration; HA alone is zonal. "Lowest RPO for objects across two named regions" → dual-region with turbo replication. "Global relational database with no data loss on a region failure" → Spanner multi-region. "Planned BigQuery failover test with no data loss" → soft failover. "Data may not leave Indonesia" → zonal redundancy inside `asia-southeast2` and `gcp.resourceLocations`.'
            },
            {
              kind: 'quiz',
              q: 'A BigQuery team wants a planned failover test with no data loss. Which option fits?',
              options: ['Hard failover', 'Soft failover', 'A table snapshot', 'A copy job'],
              answer: 1,
              explain: 'Soft failover waits until all changes are replicated, so nothing is lost. It needs both regions available, which a planned test has.'
            },
            {
              kind: 'quiz',
              q: 'Regulation requires all data to stay in Indonesia. Which design keeps redundancy inside that rule?',
              options: ['A dual-region `ASIA1` bucket', 'A cross-region replica in Singapore', 'Resources in `asia-southeast2` spread across zones', 'A `US` multi-region dataset'],
              answer: 2,
              explain: 'Jakarta is the only Google Cloud region in Indonesia, so redundancy has to come from its zones. Every other option stores data abroad.'
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
              lab: true,
              items: [
                {
                  title: 'Create the raw-data bucket',
                  text: 'One bucket for the raw CSV files, in Jakarta, with IAM-only access.',
                  spec: [
                    'Name: `gs://ace-lab-raw`',
                    'Location: `asia-southeast2`',
                    'Uniform bucket-level access: on'
                  ],
                  code: [
                    'gcloud storage buckets create gs://ace-lab-raw --location=asia-southeast2 --uniform-bucket-level-access'
                  ],
                  flags: [
                    { cmd: 'buckets create gs://ace-lab-raw', flags: ['--location=asia-southeast2', '--uniform-bucket-level-access'] }
                  ]
                },
                {
                  title: 'Write the lifecycle file, then apply it',
                  text: 'Lifecycle rules live in a JSON file that you apply to the bucket: Standard for new files, Coldline after 30 days, delete after a year.',
                  spec: [
                    'File: `lifecycle.json`',
                    'Rule 1: `SetStorageClass` to `COLDLINE` when `age` is 30',
                    'Rule 2: `Delete` when `age` is 365',
                    'Apply with `--lifecycle-file`, check with `buckets describe`'
                  ],
                  code: [
                    'cat > lifecycle.json <<\'EOF\'',
                    '{"rule": [',
                    '  {"action": {"type": "SetStorageClass", "storageClass": "COLDLINE"}, "condition": {"age": 30}},',
                    '  {"action": {"type": "Delete"}, "condition": {"age": 365}}',
                    ']}',
                    'EOF',
                    'gcloud storage buckets update gs://ace-lab-raw --lifecycle-file=lifecycle.json',
                    'gcloud storage buckets describe gs://ace-lab-raw --format="default(lifecycle_config)"'
                  ],
                  flags: [
                    { cmd: 'buckets update gs://ace-lab-raw', flags: ['--lifecycle-file=lifecycle.json'] },
                    { cmd: 'buckets describe gs://ace-lab-raw', flags: ['--format="default(lifecycle_config)"'] }
                  ]
                },
                {
                  title: 'Upload the lab files',
                  text: 'Copy both CSV files into the bucket; the next steps load them from there.',
                  spec: [
                    'Files: `orders.csv` and `customers.csv`',
                    'Destination: `gs://ace-lab-raw/`'
                  ],
                  code: [
                    'gcloud storage cp orders.csv customers.csv gs://ace-lab-raw/'
                  ]
                },
                {
                  title: 'Create the BigQuery dataset, then load the orders',
                  text: 'The dataset must be in the same location as the bucket, and that location cannot change later. Loading is free.',
                  spec: [
                    'Dataset: `ace-lab-123:sales`, location `asia-southeast2` (`bq --location=...`)',
                    'Table: `sales.orders` from `gs://ace-lab-raw/orders.csv`',
                    'Format CSV, schema detected for you: `--source_format=CSV --autodetect`'
                  ],
                  code: [
                    'bq --location=asia-southeast2 mk --dataset ace-lab-123:sales',
                    'bq load --source_format=CSV --autodetect sales.orders gs://ace-lab-raw/orders.csv',
                    'bq query --use_legacy_sql=false \'SELECT COUNT(*) FROM sales.orders\''
                  ],
                  flags: [
                    { cmd: 'bq mk ace-lab-123:sales', flags: ['--location=asia-southeast2', '--dataset'] },
                    { cmd: 'bq load sales.orders gs://ace-lab-raw/orders.csv', flags: ['--source_format=CSV', '--autodetect'] },
                    { cmd: 'bq query', flags: ['--use_legacy_sql=false'] }
                  ]
                },
                {
                  title: 'Set up private services access',
                  text: 'A private-IP Cloud SQL instance lives in Google’s network and is reached through a peering. Reserve a range for it and connect the peering before creating the instance.',
                  spec: [
                    'Enable `servicenetworking.googleapis.com` and `sqladmin.googleapis.com`',
                    'Reserved range: `google-managed-services-default`, global, purpose `VPC_PEERING`, `/16`, network `default`',
                    'Peering: `gcloud services vpc-peerings connect` to `servicenetworking.googleapis.com`'
                  ],
                  code: [
                    'gcloud services enable servicenetworking.googleapis.com sqladmin.googleapis.com',
                    'gcloud compute addresses create google-managed-services-default --global --purpose=VPC_PEERING --prefix-length=16 --network=default',
                    'gcloud services vpc-peerings connect --service=servicenetworking.googleapis.com --ranges=google-managed-services-default --network=default'
                  ],
                  flags: [
                    { cmd: 'addresses create google-managed-services-default', flags: ['--global', '--purpose=VPC_PEERING', '--prefix-length=16', '--network=default'] },
                    { cmd: 'vpc-peerings connect', flags: ['--service=servicenetworking.googleapis.com', '--ranges=google-managed-services-default', '--network=default'] }
                  ]
                },
                {
                  title: 'Create the Cloud SQL instance with HA and PITR',
                  text: 'PostgreSQL 16, highly available, private IP only, with point-in-time recovery on.',
                  spec: [
                    'Instance: `shop-db`, `POSTGRES_16`, edition `ENTERPRISE`, tier `db-custom-2-8192`, region `asia-southeast2`',
                    'HA: `--availability-type=REGIONAL`',
                    'PITR: `--enable-point-in-time-recovery` (automated backups are on by default)',
                    'Private IP only: `--network=default --no-assign-ip`'
                  ],
                  code: [
                    'gcloud sql instances create shop-db --database-version=POSTGRES_16 --edition=ENTERPRISE --tier=db-custom-2-8192 --region=asia-southeast2 --availability-type=REGIONAL --enable-point-in-time-recovery --network=default --no-assign-ip'
                  ],
                  flags: [
                    { cmd: 'instances create shop-db', flags: ['--database-version=POSTGRES_16', '--edition=ENTERPRISE', '--tier=db-custom-2-8192', '--region=asia-southeast2', '--availability-type=REGIONAL', '--enable-point-in-time-recovery', '--network=default', '--no-assign-ip'] }
                  ]
                },
                {
                  title: 'Create the database and the table',
                  text: '`gcloud sql import csv` loads into an existing table, so create both first. Without a public IP, create the table in Cloud SQL Studio in the console.',
                  spec: [
                    'Database: `shop`',
                    'Table: `customers`, with the same columns as `customers.csv`'
                  ],
                  code: [
                    'gcloud sql databases create shop --instance=shop-db',
                    '-- in Cloud SQL Studio, database shop',
                    'CREATE TABLE customers (id INT PRIMARY KEY, name TEXT, city TEXT);'
                  ],
                  flags: [
                    { cmd: 'databases create shop', flags: ['--instance=shop-db'] }
                  ]
                },
                {
                  title: 'Let the instance read the bucket, then import',
                  text: 'Cloud SQL reads the file as the instance’s own service account, not as you. Find that account, grant it read on the bucket, then import.',
                  spec: [
                    'Find the account: `serviceAccountEmailAddress` in `gcloud sql instances describe`',
                    'Grant: Storage Object Viewer on `gs://ace-lab-raw`',
                    'Import: `customers.csv` into database `shop`, table `customers`'
                  ],
                  code: [
                    'SA=$(gcloud sql instances describe shop-db --format="value(serviceAccountEmailAddress)")',
                    'gcloud storage buckets add-iam-policy-binding gs://ace-lab-raw --member=serviceAccount:$SA --role=roles/storage.objectViewer',
                    'gcloud sql import csv shop-db gs://ace-lab-raw/customers.csv --database=shop --table=customers'
                  ],
                  flags: [
                    { cmd: 'instances describe shop-db', flags: ['--format="value(serviceAccountEmailAddress)"'] },
                    { cmd: 'buckets add-iam-policy-binding gs://ace-lab-raw', flags: ['--member=serviceAccount:$SA', '--role=roles/storage.objectViewer'] },
                    { cmd: 'sql import csv shop-db gs://ace-lab-raw/customers.csv', flags: ['--database=shop', '--table=customers'] }
                  ]
                },
                {
                  title: 'Take an on-demand backup, then break something',
                  text: 'Back up, count the rows, note the time in UTC, then delete some rows on purpose in Cloud SQL Studio.',
                  spec: [
                    'Backup description: `before drill`',
                    'Record: the row count of `customers` and the time from `date -u`',
                    'Then delete some rows, for example `DELETE FROM customers WHERE city = \'Bandung\';`'
                  ],
                  code: [
                    'gcloud sql backups create --instance=shop-db --description="before drill"',
                    'date -u +%Y-%m-%dT%H:%M:%SZ'
                  ],
                  flags: [
                    { cmd: 'backups create', flags: ['--instance=shop-db', '--description="before drill"'] }
                  ]
                },
                {
                  title: 'Recover to a point in time and verify',
                  text: 'Clone the instance to one minute before the damage; `shop-db` keeps running. Compare row counts, then keep the operation IDs as evidence.',
                  spec: [
                    'Clone: `shop-db-drill` from `shop-db`',
                    'Time: RFC 3339 in UTC, one minute before the delete, for example `2026-10-30T02:59:00Z`',
                    'Evidence: operation IDs and times from `gcloud sql operations list`, plus row counts before and after'
                  ],
                  code: [
                    'gcloud sql instances clone shop-db shop-db-drill --point-in-time="2026-10-30T02:59:00Z"',
                    'gcloud sql operations list --instance=shop-db-drill --limit=5'
                  ],
                  flags: [
                    { cmd: 'instances clone shop-db shop-db-drill', flags: ['--point-in-time=2026-10-30T02:59:00Z'] },
                    { cmd: 'operations list', flags: ['--instance=shop-db-drill', '--limit=5'] }
                  ]
                },
                {
                  title: 'Clean up',
                  text: 'Delete the clone and the instance (a stopped instance still bills storage), the dataset and the bucket.',
                  spec: [
                    'Delete `shop-db-drill` and `shop-db`',
                    'Delete dataset `sales` with its tables (`bq rm -r`)',
                    'Delete bucket `gs://ace-lab-raw` with its objects'
                  ],
                  code: [
                    'gcloud sql instances delete shop-db-drill --quiet',
                    'gcloud sql instances delete shop-db --quiet',
                    'bq rm -r -f ace-lab-123:sales',
                    'gcloud storage rm -r gs://ace-lab-raw'
                  ],
                  flags: [
                    { cmd: 'instances delete shop-db-drill', flags: ['--quiet'] },
                    { cmd: 'instances delete shop-db', flags: ['--quiet'] },
                    { cmd: 'bq rm ace-lab-123:sales', flags: ['-r', '-f'] },
                    { cmd: 'storage rm', flags: ['-r'] }
                  ]
                }
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
