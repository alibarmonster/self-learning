/**
 * Session exams for course Modules 3 and 4: twenty questions on each of
 * sessions 9 to 17, so every session can be checked on its own before the
 * combined Tryout MD3–MD4. Where the try-outs ask which service fits, these
 * go into the session's detail: the gcloud command and flag, the default and
 * the limit, and for the lab sessions (12, 14, 17) each step of the lab.
 *
 * Every question carries its exam-guide section and joins that section's
 * bank; the sets (one per session) are in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const sessionsMd34: ModuleQuestion[] = [
  // ── Session 9 · Cloud Storage: buckets, classes and the data lifecycle ──
  {
    id: 'ace-s09-01',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which command creates a bucket in Jakarta whose new objects are stored as Nearline by default, with ACLs turned off?',
    options: [
      '`gcloud storage buckets create gs://b --region=asia-southeast2 --storage-class=nearline --no-acl`',
      '`gcloud storage mb gs://b --zone=asia-southeast2-a --class=NEARLINE --uniform-access`',
      '`gcloud storage buckets create gs://b --location=asia-southeast2 --default-storage-class=NEARLINE --uniform-bucket-level-access`',
      '`gcloud storage buckets create gs://b --location=ASIA --default-storage-class=NEARLINE --public-access-prevention`'
    ],
    answer: 2,
    explanation: '`--location` sets where the bucket lives, `--default-storage-class` sets the class for new objects, and `--uniform-bucket-level-access` disables ACLs so only IAM applies. Buckets have no zone, `ASIA` is a multi-region, and public access prevention is a different setting.'
  },
  {
    id: 'ace-s09-02',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'A bucket was created with the wrong name. How do you rename it?',
    options: [
      'You cannot; create a new bucket with the right name and copy the objects over',
      'Run `gcloud storage buckets update gs://old --name=new`',
      'Rename it in the console under the bucket’s Configuration tab',
      'Use `gcloud storage mv gs://old gs://new`, which renames it in place'
    ],
    answer: 0,
    explanation: 'Bucket names are permanent. You create a bucket with the new name, copy the data (for example with `gcloud storage cp -r` or Storage Transfer Service), then delete the old bucket. `mv` between buckets copies and deletes objects; it does not rename a bucket.'
  },
  {
    id: 'ace-s09-03',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A bucket in `us-central1` must move to `asia-southeast2` for data residency. What is the right approach?',
    options: [
      'Create a new bucket in `asia-southeast2` and move the data with Storage Transfer Service',
      'Edit the bucket’s location to `asia-southeast2`; objects migrate in the background',
      'Change the bucket to the `ASIA` multi-region, then narrow it to one region',
      'Turn on turbo replication to `asia-southeast2`, then delete the US copy'
    ],
    answer: 0,
    explanation: 'A bucket’s location is fixed at creation. Moving regions means a new bucket and a copy (Storage Transfer Service handles large ones). There is no location edit, multi-regions cannot be narrowed, and turbo replication only applies within a dual-region.'
  },
  {
    id: 'ace-s09-04',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You changed a bucket’s default storage class from Standard to Coldline. What happens to the 2 million objects already in it?',
    options: [
      'They are moved to Coldline in the background within 24 hours',
      'They are moved to Coldline and billed early-deletion fees',
      'They are copied to Coldline and the Standard copies are kept',
      'They stay Standard; only objects written afterwards get Coldline'
    ],
    answer: 3,
    explanation: 'The default class only applies to new objects. To change existing ones, rewrite them with `gcloud storage objects update --storage-class` or use a lifecycle `SetStorageClass` rule.'
  },
  {
    id: 'ace-s09-05',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A team avoids Archive because it believes restoring an object takes hours, like tape. What is true?',
    options: [
      'Archive objects need a restore request first, which completes in up to 12 hours',
      'Archive reads take milliseconds; you pay retrieval fees and a 365-day minimum',
      'Archive objects can only be read after changing their class back to Standard',
      'Archive objects are readable only from the same region as the bucket'
    ],
    answer: 1,
    explanation: 'All Cloud Storage classes give millisecond access through the same API. Archive trades a low storage price for retrieval fees, a higher operation cost and a 365-day minimum storage duration, not for slow access.'
  },
  {
    id: 'ace-s09-06',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Versioning is on. A bad deploy overwrote `config.json`. Which steps bring the previous content back as the live object?',
    options: [
      'Run `gcloud storage restore gs://b/config.json`, which promotes the last soft-deleted copy',
      'Turn versioning off; the bucket then rolls each object back to its previous version',
      'Delete the live object; the newest noncurrent version is then deleted as well',
      'Find it with `gcloud storage ls -a`, then copy `gs://b/config.json#GEN` over the live object'
    ],
    answer: 3,
    explanation: '`ls -a` shows every generation. Copying an older generation onto the same name makes it the live version again. `restore` is for soft-deleted objects, turning versioning off does not roll anything back, and deleting the live object just makes it noncurrent.'
  },
  {
    id: 'ace-s09-07',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which command turns on object versioning for an existing bucket?',
    options: [
      '`gcloud storage buckets create gs://b --versioning`',
      '`gcloud storage buckets update gs://b --versioning`',
      '`gcloud storage objects update gs://b/** --versioning`',
      '`gcloud storage buckets update gs://b --soft-delete-duration=7d`'
    ],
    answer: 1,
    explanation: 'Versioning is a bucket setting changed with `buckets update --versioning` (and `--no-versioning` to turn it off). `create` makes a new bucket, objects have no versioning flag, and soft delete is a separate feature.'
  },
  {
    id: 'ace-s09-08',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bucket holds scratch files that are rewritten and deleted every hour. The bill shows large charges for soft-deleted storage. What do you change?',
    options: [
      'Turn on object versioning so deleted files become noncurrent',
      'Add a lifecycle rule that deletes objects older than one hour',
      'Set the bucket’s soft delete duration to 0 with `--clear-soft-delete`',
      'Move the bucket to Nearline so deleted data costs less to keep'
    ],
    answer: 2,
    explanation: 'Soft delete keeps every deleted object for its retention window (7 days by default) and bills it as storage. For short-lived scratch data, turning soft delete off for that bucket removes the charge. Versioning keeps even more data, a lifecycle delete still goes through soft delete, and Nearline adds minimum-duration fees.'
  },
  {
    id: 'ace-s09-09',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You create a V4 signed URL for a partner. What is the longest expiry it can have?',
    options: [
      '24 hours',
      '30 days',
      '7 days',
      'No limit'
    ],
    answer: 2,
    explanation: 'V4 signed URLs can be valid for at most 604,800 seconds, which is 7 days. For longer access, issue new URLs or grant IAM access.'
  },
  {
    id: 'ace-s09-10',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Only objects under `tmp/` should be deleted one day after they are created; everything else stays. Which lifecycle rule does this?',
    options: [
      'Action `Delete`, conditions `age: 1` and `matchesPrefix: ["tmp/"]`',
      'Action `Delete`, condition `age: 1`, with the bucket’s default class set',
      'Action `SetStorageClass` to Archive, condition `matchesPrefix: ["tmp/"]`',
      'Action `Delete`, conditions `age: 1` and `isLive: false` only'
    ],
    answer: 0,
    explanation: 'Conditions in one rule are combined with AND, so `age` plus `matchesPrefix` limits the delete to new-enough `tmp/` objects. Without the prefix, the rule deletes everything after a day, and `isLive: false` only touches noncurrent versions.'
  },
  {
    id: 'ace-s09-11',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A team wants a lifecycle rule that moves old objects into a different bucket in another project. What do you tell them?',
    options: [
      'Lifecycle cannot do that; its actions are Delete, SetStorageClass and AbortIncompleteMultipartUpload',
      'Lifecycle can do it with a `CopyToBucket` action that names the destination bucket and project',
      'Lifecycle can do it if both buckets are in the same location type',
      'Lifecycle can do it once the destination grants Storage Object Creator'
    ],
    answer: 0,
    explanation: 'Lifecycle management only deletes objects, changes their storage class, or aborts incomplete multipart uploads. Moving data to another bucket needs Storage Transfer Service or your own job.'
  },
  {
    id: 'ace-s09-12',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Which lifecycle transition can a `SetStorageClass` rule perform?',
    options: [
      'Coldline to Nearline',
      'Archive to Standard',
      'Archive to Coldline',
      'Nearline to Coldline'
    ],
    answer: 3,
    explanation: 'Lifecycle can only move objects to a colder class: Standard to Nearline, Coldline or Archive; Nearline to Coldline or Archive; Coldline to Archive. Moving to a warmer class means rewriting the object yourself, or using Autoclass.'
  },
  {
    id: 'ace-s09-13',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'You added a lifecycle rule that deletes objects older than 30 days. Ten minutes later the old objects are still there. Why?',
    options: [
      'Lifecycle rules only apply to objects uploaded after the rule was added',
      'Lifecycle rules need object versioning turned on before they can act',
      'Lifecycle actions run asynchronously and can take up to 24 hours to apply',
      'Lifecycle rules only run on buckets that use uniform bucket-level access'
    ],
    answer: 2,
    explanation: 'Cloud Storage evaluates lifecycle rules in the background, and a new or changed configuration can take up to 24 hours to take effect. Rules do apply to existing objects, and they need neither versioning nor uniform access.'
  },
  {
    id: 'ace-s09-14',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Uniform bucket-level access was enabled on a bucket last week, and an old app that relies on object ACLs broke. What can you do?',
    options: [
      'Turn it off again; uniform access can be reverted within 90 days',
      'Nothing; uniform access is permanent as soon as it is turned on',
      'Recreate the ACLs; they work again alongside uniform access',
      'Lock the bucket; locked buckets accept both IAM and ACLs'
    ],
    answer: 0,
    explanation: 'Uniform bucket-level access can be disabled within 90 days of enabling it, which restores the old ACLs. After 90 days it becomes permanent. While it is on, ACLs are ignored.'
  },
  {
    id: 'ace-s09-15',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Which command makes a bucket’s 7-year retention policy permanent, so nobody can reduce or remove it?',
    options: [
      '`gcloud storage buckets update gs://b --retention-period=7y`',
      '`gcloud storage buckets update gs://b --default-event-based-hold`',
      '`gcloud storage objects update gs://b/** --temporary-hold`',
      '`gcloud storage buckets update gs://b --lock-retention-period`'
    ],
    answer: 3,
    explanation: '`--retention-period` sets the policy, and `--lock-retention-period` locks it (Bucket Lock), which cannot be undone. Holds are per-object controls, not locks on the policy.'
  },
  {
    id: 'ace-s09-16',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Legal says one specific object must not be deleted until a lawsuit ends, and the date is unknown. The bucket has no retention policy. What do you place on it?',
    options: [
      'A locked retention policy of ten years',
      'An object ACL that removes all delete rights',
      'Object versioning on the whole bucket',
      'A temporary hold, released when legal says so'
    ],
    answer: 3,
    explanation: 'A temporary hold blocks deletion and replacement of that one object until it is released, with no fixed time. A locked policy affects every object for a fixed period, ACLs cannot stop owners, and versioning keeps copies but still allows deletion.'
  },
  {
    id: 'ace-s09-17',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Uploading one 200 GB file with `gcloud storage cp` is slow. What setting lets gcloud upload it in parallel pieces?',
    options: [
      '`gcloud config set storage/multi_region_upload_enabled True`',
      '`gcloud config set storage/parallel_composite_upload_enabled True`',
      '`gcloud storage cp --turbo-replication` on the upload',
      '`gcloud storage cp --storage-class=STANDARD` on the upload'
    ],
    answer: 1,
    explanation: 'Parallel composite uploads split a large file into parts, upload them at once and compose them into one object. Turbo replication is about dual-region copies, and storage class has nothing to do with upload speed.'
  },
  {
    id: 'ace-s09-18',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Browsers download `index.html` from a public bucket instead of showing it as a page. What is the likely fix?',
    options: [
      'Change the bucket’s default storage class from Nearline back to Standard',
      'Turn on uniform bucket-level access for the bucket',
      'Set the object’s Content-Type to `text/html` with `gcloud storage objects update`',
      'Create a signed URL for the file with a 7-day expiry'
    ],
    answer: 2,
    explanation: 'The browser decides how to handle a file from its Content-Type metadata. If it was uploaded as `application/octet-stream`, it is downloaded instead of rendered. Storage class, access mode and signing do not affect rendering.'
  },
  {
    id: 'ace-s09-19',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Raw CSV files must be loaded into a BigQuery dataset in `asia-southeast2`. Where should the bucket be?',
    options: [
      'In the `US` multi-region, which every dataset can read',
      'In `asia-southeast2`, the same location as the dataset',
      'In any location, since BigQuery copies files between regions',
      'In a dual-region that excludes `asia-southeast2`'
    ],
    answer: 1,
    explanation: 'For a dataset in a single region, BigQuery load jobs read from a bucket in that same location. Keeping them together also avoids cross-region network charges.'
  },
  {
    id: 'ace-s09-20',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Which statement about durability and availability across storage classes is true?',
    options: [
      'Standard has 11 nines of durability; Archive has much lower durability to save cost',
      'All classes have the same 11 nines of durability; availability differs by class and location',
      'Durability depends on the class; availability is the same for all of them',
      'Only dual-region and multi-region buckets reach 11 nines of durability'
    ],
    answer: 1,
    explanation: 'Cloud Storage is designed for 99.999999999% annual durability in every class and location. The SLA for availability varies by storage class and location type, which is why colder classes are cheaper.'
  },

  // ── Session 10 · Databases: relational, NoSQL, analytics and caching ──
  {
    id: 'ace-s10-01',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL workload needs a 99.99% availability SLA that includes maintenance, and planned maintenance must cause under a second of downtime. Which edition fits?',
    options: [
      'Cloud SQL Enterprise with HA',
      'Cloud SQL Enterprise with a read replica',
      'Cloud SQL Enterprise Plus',
      'Cloud SQL Enterprise with a larger machine'
    ],
    answer: 2,
    explanation: 'Enterprise Plus offers a 99.99% SLA inclusive of maintenance and near-zero-downtime maintenance, plus a data cache and higher performance machines. Enterprise with HA gives 99.95%, and replicas or bigger machines do not change the SLA.'
  },
  {
    id: 'ace-s10-02',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You want to prove that an HA Cloud SQL instance really fails over before go-live. Which command starts a manual failover?',
    options: [
      '`gcloud sql instances promote-replica shop-db`',
      '`gcloud sql instances restart shop-db --zone=b`',
      '`gcloud sql instances failover shop-db`',
      '`gcloud sql instances patch shop-db --availability-type=ZONAL`'
    ],
    answer: 2,
    explanation: '`failover` switches an HA instance to its standby in the other zone, which is how you test it. `promote-replica` is for read replicas, `restart` stays in the same zone, and patching to `ZONAL` removes HA.'
  },
  {
    id: 'ace-s10-03',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Point-in-time recovery cannot be enabled on a Cloud SQL for MySQL instance. What else must be on?',
    options: [
      'High availability, because PITR replays logs from the standby',
      'A read replica, because PITR copies data from the replica',
      'Cloud SQL Insights, because PITR reads its query history',
      'Automated backups, which PITR builds on together with the binary logs'
    ],
    answer: 3,
    explanation: 'PITR restores the latest automated backup and replays the transaction logs (binary logs for MySQL, WAL for PostgreSQL) up to the time you choose, so automated backups must be enabled. HA, replicas and Insights are not required.'
  },
  {
    id: 'ace-s10-04',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You run a point-in-time recovery on `shop-db` to 10:04. What does it produce?',
    options: [
      'The same `shop-db` instance, rolled back in place to 10:04',
      'A backup file in Cloud Storage holding the data as of 10:04',
      'A read replica of `shop-db` that lags 10:04 behind the primary',
      'A new instance cloned to 10:04; `shop-db` itself is left unchanged'
    ],
    answer: 3,
    explanation: 'PITR is a clone to a point in time: it creates a new instance and leaves the source untouched, so you can compare data or switch the app over. Restoring a backup in place is a separate operation that overwrites the instance.'
  },
  {
    id: 'ace-s10-05',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'You restore last night’s automated backup onto the same Cloud SQL instance it came from. What happens?',
    options: [
      'Only rows deleted since the backup are put back',
      'The backup is restored to a new instance named after it',
      'All current data on the instance is overwritten with the backup',
      'Nothing until you also promote the instance’s replica'
    ],
    answer: 2,
    explanation: 'Restoring a backup to an instance replaces everything on it, including data written after the backup. To recover without losing newer data, restore to a different instance or use a point-in-time clone.'
  },
  {
    id: 'ace-s10-06',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Creating a read replica of a Cloud SQL for MySQL primary fails. Which settings must the primary have?',
    options: [
      'High availability and a private IP address',
      'Automated backups and binary logging enabled',
      'Enterprise Plus edition and a data cache',
      'A maintenance window and a deny period'
    ],
    answer: 1,
    explanation: 'MySQL replicas replicate from the primary’s binary log, so binary logging (which needs automated backups) must be on. HA, private IP, edition and maintenance settings are not prerequisites.'
  },
  {
    id: 'ace-s10-07',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Users in Europe read from a Cloud SQL primary in Jakarta and see high latency. The app could send reads to a nearby copy. What do you add?',
    options: [
      'High availability with the standby placed in Europe',
      'A second primary in Europe with two-way replication',
      'A larger machine type for the Jakarta primary',
      'A cross-region read replica in a European region'
    ],
    answer: 3,
    explanation: 'A cross-region read replica serves reads close to European users and also helps DR. An HA standby must be in the same region and serves no reads, Cloud SQL has no multi-primary, and a bigger machine does not shorten the distance.'
  },
  {
    id: 'ace-s10-08',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'An analyst can see tables in a BigQuery dataset but every query fails with a permission error about creating jobs. What is missing?',
    options: [
      'BigQuery Data Editor on the dataset that holds the tables',
      'BigQuery Metadata Viewer on the project',
      'BigQuery Admin on the organization',
      'BigQuery Job User on the project where queries run'
    ],
    answer: 3,
    explanation: 'Running a query creates a job, which needs `bigquery.jobs.create`, granted by Job User on the project. Data Viewer on the dataset already lets them read tables. Data Editor and Admin grant far more than needed.'
  },
  {
    id: 'ace-s10-09',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'You change a Cloud SQL instance’s machine type from 2 to 8 vCPUs. What should you expect?',
    options: [
      'The change applies live with no interruption',
      'The instance restarts, causing a short outage',
      'The change waits for the next maintenance window',
      'A new instance is created and the old one is kept'
    ],
    answer: 1,
    explanation: 'Changing the tier (machine type) of a Cloud SQL instance restarts it, so plan a short window. Storage increases do not need a restart, but machine changes do.'
  },
  {
    id: 'ace-s10-10',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An AlloyDB cluster’s primary is saturated by read-only reporting queries. How do you add read capacity?',
    options: [
      'Add a cross-region replica cluster for the reporting team',
      'Add a read pool instance with one or more nodes to the cluster',
      'Enable high availability on the primary instance',
      'Increase the storage size of the AlloyDB cluster'
    ],
    answer: 1,
    explanation: 'AlloyDB clusters have one primary instance and can have read pool instances with several nodes that share the same storage, scaling reads without copying data. A secondary cluster is for DR, HA adds a standby, and storage grows automatically.'
  },
  {
    id: 'ace-s10-11',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A Spanner table uses an auto-incrementing integer as its primary key, and inserts all land on one split. What do you change?',
    options: [
      'Add more nodes so the single hot split gets more CPU and memory',
      'Create a secondary index on the integer key column',
      'Move the instance from regional to multi-region',
      'Use a key that spreads writes, such as a UUIDv4 or a bit-reversed sequence'
    ],
    answer: 3,
    explanation: 'Spanner stores rows in key order, so increasing keys send all inserts to the last split, a hotspot. Random or bit-reversed keys spread writes across splits. More nodes and indexes do not fix a hot key, and configuration does not change ordering.'
  },
  {
    id: 'ace-s10-12',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Spanner database must keep all data in Indonesia and needs a 99.99% availability SLA. Which instance configuration fits?',
    options: [
      'The regional configuration `regional-asia-southeast2`',
      'A multi-region configuration covering Asia',
      'A dual-region configuration with Singapore',
      'Any configuration; Spanner data never leaves its leader'
    ],
    answer: 0,
    explanation: 'A regional configuration keeps replicas in three zones of one region and gives a 99.99% SLA. Multi-region and dual-region configurations reach 99.999% but place replicas in other countries.'
  },
  {
    id: 'ace-s10-13',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A server-side app was built on the Datastore API and needs a Firestore database. Which mode do you create?',
    options: [
      'Firestore in Native mode',
      'Bigtable with a Datastore adapter',
      'Firestore in Datastore mode',
      'Cloud SQL with a Datastore schema'
    ],
    answer: 2,
    explanation: 'Datastore mode is the Firestore database that serves the Datastore API for server apps. Native mode adds real-time listeners and mobile SDKs with a different API. Bigtable and Cloud SQL do not speak the Datastore API.'
  },
  {
    id: 'ace-s10-14',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which command-line tool is built for creating Bigtable tables and column families and reading rows?',
    options: [
      '`cbt`',
      '`bq`',
      '`gsutil`',
      '`psql`'
    ],
    answer: 0,
    explanation: '`cbt` is the Bigtable CLI (`cbt createtable`, `cbt createfamily`, `cbt read`). `bq` is for BigQuery, `gsutil` for Cloud Storage, and `psql` for PostgreSQL.'
  },
  {
    id: 'ace-s10-15',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An app stores 20 GB of relational order data and needs joins and transactions. A developer suggests Bigtable for speed. What do you advise?',
    options: [
      'Use Cloud SQL; Bigtable has no joins and suits far larger data',
      'Use Bigtable; it supports SQL joins through the `cbt` tool',
      'Use Bigtable with HDD storage to keep the cost low',
      'Use Memorystore as the main database for speed'
    ],
    answer: 0,
    explanation: 'Bigtable is a wide-column store for very large, high-throughput key access, with no relational joins, and it is costly for small data. Cloud SQL fits a small relational workload. Memorystore is a cache, not a system of record.'
  },
  {
    id: 'ace-s10-16',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Memorystore for Redis cache must keep serving if its node fails, with automatic failover to a replica. Which tier do you choose?',
    options: [
      'Standard Tier',
      'Basic Tier',
      'Basic Tier with persistence',
      'Any tier with a larger size'
    ],
    answer: 0,
    explanation: 'Standard Tier keeps a replica in another zone and fails over automatically. Basic Tier is a single node with no replication, so a failure means an empty cache; size does not change that.'
  },
  {
    id: 'ace-s10-17',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A BigQuery dataset was created in `US` by mistake; it should be in `asia-southeast2`. What do you do?',
    options: [
      'Create a new dataset in `asia-southeast2` and copy the data into it',
      'Edit the dataset’s location in its details page',
      'Run `bq update --location=asia-southeast2` on the existing dataset',
      'Move it with `bq mv` to the new location'
    ],
    answer: 0,
    explanation: 'A dataset’s location is fixed at creation. You create a dataset in the right location and copy the tables (a dataset copy or the Data Transfer Service), then delete the old one. There is no location update or move.'
  },
  {
    id: 'ace-s10-18',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A company runs heavy BigQuery queries all day and wants a predictable monthly bill instead of paying per terabyte scanned. What do you choose?',
    options: [
      'On-demand pricing with a daily custom quota per user',
      'Capacity-based pricing: a BigQuery edition with a slot reservation',
      'On-demand pricing with `--maximum_bytes_billed` on each query',
      'Flat storage pricing with long-term storage discounts'
    ],
    answer: 1,
    explanation: 'Capacity-based pricing (Standard, Enterprise or Enterprise Plus edition) bills for reserved slots, so cost depends on capacity, not bytes scanned. Quotas and byte limits cap on-demand spend but keep per-TB billing, and storage pricing is separate.'
  },
  {
    id: 'ace-s10-19',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which change lowers the bytes scanned by a BigQuery query on a wide table?',
    options: [
      'Add `LIMIT 100` at the end of the query to cap the rows',
      'Add `ORDER BY` on the primary key',
      'Select only the columns you need instead of `SELECT *`',
      'Run the query twice to use the cache'
    ],
    answer: 2,
    explanation: 'BigQuery is columnar and bills for the columns it reads, so naming only needed columns cuts bytes. `LIMIT` and `ORDER BY` do not reduce what is scanned. A cached repeat is free, but the first run still scans everything.'
  },
  {
    id: 'ace-s10-20',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL instance needs to accept connections on its public IP from the office network `203.0.113.0/24`, without the Auth Proxy. What do you configure?',
    options: [
      'Create a VPC firewall rule allowing `203.0.113.0/24` to the instance',
      'Add `203.0.113.0/24` to the instance’s authorized networks and require SSL',
      'Enable Private Google Access for `203.0.113.0/24` on the VPC',
      'Add `203.0.113.0/24` as a secondary range on the instance'
    ],
    answer: 1,
    explanation: 'Without the Auth Proxy or connectors, Cloud SQL public IP access is controlled by authorized networks, and you should enforce SSL. The instance is not in your VPC, so VPC firewall rules and Private Google Access do not apply.'
  },

  // ── Session 11 · Messaging, pipelines and data protection ──
  {
    id: 'ace-s11-01',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'Which command creates a pull subscription `orders-sub` on the topic `orders` with a 60-second ack deadline?',
    options: [
      '`gcloud pubsub topics create orders-sub --subscription=orders --ack-deadline=60`',
      '`gcloud pubsub subscriptions create orders-sub --topic=orders --ack-deadline=60`',
      '`gcloud pubsub subscriptions create orders --topic=orders-sub --push-endpoint=60`',
      '`gcloud pubsub subscriptions update orders-sub --topic=orders --retention=60s`'
    ],
    answer: 1,
    explanation: 'Subscriptions are created with `subscriptions create NAME --topic=TOPIC`, and without a push endpoint they are pull subscriptions. `--ack-deadline` is in seconds (10 to 600).'
  },
  {
    id: 'ace-s11-02',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'You want to read and acknowledge five test messages from `orders-sub` in Cloud Shell. Which command does it?',
    options: [
      '`gcloud pubsub topics publish orders-sub --limit=5`',
      '`gcloud pubsub subscriptions pull orders-sub --auto-ack --limit=5`',
      '`gcloud pubsub subscriptions seek orders-sub --limit=5`',
      '`gcloud pubsub topics list-subscriptions orders-sub --ack`'
    ],
    answer: 1,
    explanation: '`subscriptions pull` fetches messages, and `--auto-ack` acknowledges them so they are not redelivered. `publish` sends messages, `seek` resets acknowledgement state, and `list-subscriptions` lists names.'
  },
  {
    id: 'ace-s11-03',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A subscriber was offline for a few days. By default, how long does a subscription keep unacknowledged messages?',
    options: [
      '1 day',
      '31 days',
      'Forever',
      '7 days'
    ],
    answer: 3,
    explanation: 'The default message retention for a subscription is 7 days, configurable from 10 minutes up to 31 days. Messages left unacknowledged longer than that are discarded.'
  },
  {
    id: 'ace-s11-04',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A rarely used subscription disappeared after a month with no subscriber activity. Why, and how do you prevent it?',
    options: [
      'Subscriptions are deleted when the topic has no new messages; publish a heartbeat message',
      'Subscriptions are removed when their messages expire; raise retention to 31 days',
      'Subscriptions need a dead-letter topic or they are cleaned up after 30 days',
      'Subscriptions expire after 31 days of inactivity by default; set `--expiration-period=never`'
    ],
    answer: 3,
    explanation: 'The default expiration policy deletes a subscription after 31 days without subscriber activity. Setting the expiration period to `never` keeps it. Message retention and dead-letter topics do not affect expiration.'
  },
  {
    id: 'ace-s11-05',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'A dead-letter topic is configured with 5 maximum delivery attempts, but failed messages never arrive there. What is the most likely cause?',
    options: [
      'The dead-letter topic must be in a different project from the source topic and subscription',
      'Dead-lettering only works on push subscriptions with an OIDC token',
      'The maximum delivery attempts must be at least 100 for dead-lettering',
      'The Pub/Sub service agent lacks Publisher on the dead-letter topic and Subscriber on the source'
    ],
    answer: 3,
    explanation: 'Pub/Sub forwards messages using its own service agent, which needs `roles/pubsub.publisher` on the dead-letter topic and `roles/pubsub.subscriber` on the source subscription. The console grants these, but the CLI does not. Attempts can be 5 to 100, and both push and pull work.'
  },
  {
    id: 'ace-s11-06',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Failed messages are redelivered immediately and hammer a struggling backend. What subscription setting spaces out the retries?',
    options: [
      'A longer message retention duration on the subscription',
      'Exactly-once delivery, which waits a fixed time between delivery attempts',
      'A filter that drops messages after their first failed attempt',
      'A retry policy with exponential backoff, using minimum and maximum retry delays'
    ],
    answer: 3,
    explanation: 'An exponential backoff retry policy (`--min-retry-delay` and `--max-retry-delay`) waits longer between each redelivery of a nacked or expired message. Retention, exactly-once delivery and filters do not change retry timing.'
  },
  {
    id: 'ace-s11-07',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A streaming Dataflow job must be stopped for a schema change, without losing any data already read from Pub/Sub. What do you do?',
    options: [
      'Cancel the job, so it stops at once and Pub/Sub redelivers everything',
      'Delete the job’s workers from Compute Engine to stop it immediately',
      'Pause the Pub/Sub subscription and leave the job running idle',
      'Drain the job, so it finishes processing buffered data before stopping'
    ],
    answer: 3,
    explanation: 'Drain stops reading new input but completes in-flight work and windows, so nothing is lost. Cancel stops immediately and discards buffered data. Deleting workers fights the service, and Pub/Sub subscriptions cannot be paused.'
  },
  {
    id: 'ace-s11-08',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'A new version of a streaming Beam pipeline must replace the running one while keeping its in-flight state, with no gap. What do you use?',
    options: [
      'Launch the new version as an update of the existing job, with the same job name',
      'Drain the old job, then start the new version as a fresh job',
      'Run both versions side by side on the same subscription',
      'Snapshot the Pub/Sub subscription, then cancel the job and start the new one'
    ],
    answer: 0,
    explanation: 'Updating a streaming job (`--update` with the same job name, plus a transform mapping if names changed) replaces the pipeline code while preserving state and buffered data. Draining and restarting loses state, and two jobs on one subscription split the messages.'
  },
  {
    id: 'ace-s11-09',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'You want to stream messages from a Pub/Sub topic into BigQuery with a Dataflow job, without writing any Beam code. What do you use?',
    options: [
      'A Google-provided Dataflow template, launched with `gcloud dataflow flex-template run`',
      'A Cloud Composer DAG that calls the BigQuery streaming insert API for each message',
      'A Managed Service for Apache Spark job that reads the topic',
      'A Cloud Scheduler job that runs `bq load` every minute'
    ],
    answer: 0,
    explanation: 'Google-provided templates (such as Pub/Sub to BigQuery) run a ready-made pipeline from the console or with `gcloud dataflow flex-template run` (or `jobs run` for classic templates). The other options need custom code or are batch.'
  },
  {
    id: 'ace-s11-10',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Dataflow workers fail to start with permission errors. Which role does the worker service account need for the workers to run?',
    options: [
      'Dataflow Admin (`roles/dataflow.admin`)',
      'Dataflow Developer (`roles/dataflow.developer`)',
      'Dataflow Worker (`roles/dataflow.worker`)',
      'Compute Instance Admin (`roles/compute.instanceAdmin.v1`)'
    ],
    answer: 2,
    explanation: 'The worker service account needs `roles/dataflow.worker` to run work items, plus access to the job’s sources and sinks. Dataflow Admin and Developer are for people who create and manage jobs, and instance admin is not needed by the workers.'
  },
  {
    id: 'ace-s11-11',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A team needs topic partitions, consumer offsets they manage themselves, log-compacted topics and Kafka Connect. Which service fits?',
    options: [
      'Managed Service for Apache Kafka',
      'Pub/Sub with message ordering',
      'Dataflow with a Kafka template',
      'Cloud Tasks with named queues'
    ],
    answer: 0,
    explanation: 'These are Apache Kafka features, and Managed Service for Apache Kafka runs real Kafka clusters with them. Pub/Sub has no partitions, offsets or log compaction, and Dataflow and Cloud Tasks are not message brokers.'
  },
  {
    id: 'ace-s11-12',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Before granting a key to Cloud Storage for CMEK, you need the email address of the project’s Cloud Storage service agent. Which command shows it?',
    options: [
      '`gcloud iam service-accounts list --filter=storage`',
      '`gcloud projects describe PROJECT_ID --format=storage`',
      '`gcloud storage service-agent --project=PROJECT_ID`',
      '`gcloud kms keys describe KEY --show-agent`'
    ],
    answer: 2,
    explanation: '`gcloud storage service-agent` prints (and can authorize) the Cloud Storage service agent. Service agents are Google-managed and not listed among your project’s service accounts.'
  },
  {
    id: 'ace-s11-13',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which flag creates a Compute Engine persistent disk encrypted with a Cloud KMS key?',
    options: [
      '`gcloud compute disks create d1 --csek-key-file=projects/p/keyRings/r/cryptoKeys/k`',
      '`gcloud compute disks create d1 --encryption=projects/p/keyRings/r/cryptoKeys/k`',
      '`gcloud compute disks create d1 --kms-key=projects/p/locations/l/keyRings/r/cryptoKeys/k`',
      '`gcloud compute disks create d1 --kms-keyring=r --type=pd-ssd --kms-version=1`'
    ],
    answer: 2,
    explanation: '`--kms-key` takes the full key resource name and makes the disk use that CMEK. `--csek-key-file` is for customer-supplied keys, and the other flags do not exist.'
  },
  {
    id: 'ace-s11-14',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A team uses customer-supplied encryption keys (CSEK) for Cloud Storage objects and loses the key. What happens?',
    options: [
      'The data cannot be recovered; Google never stores the key',
      'Google support restores access from the stored key copy',
      'The objects fall back to Google-managed encryption',
      'The key can be restored within 30 days from Cloud KMS'
    ],
    answer: 0,
    explanation: 'With CSEK you send the key with each request and Google discards it after use, keeping only a hash to verify it. Without the key, the data cannot be decrypted by anyone. Cloud KMS is not involved.'
  },
  {
    id: 'ace-s11-15',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'Autokey is enabled on a folder. When a developer creates a CMEK-protected bucket in a project under it, where is the key created?',
    options: [
      'In the developer’s own project, next to the new bucket',
      'In a Google-owned project that customers cannot see',
      'In the dedicated key project configured for Autokey on that folder',
      'In the organization’s default key ring in the `global` location'
    ],
    answer: 2,
    explanation: 'Autokey creates a key on demand in the key project set for the folder, in the resource’s location, and grants the service agent access. That keeps keys separate from workloads. Keys are not hidden in Google-owned projects or created in `global` for regional resources.'
  },
  {
    id: 'ace-s11-16',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'During a regional outage you promote the cross-region Cloud SQL replica. What is true afterwards?',
    options: [
      'The old primary becomes a read replica of the promoted instance automatically',
      'The replica can be demoted later, which resumes replication from the old primary',
      'The promoted instance is a standalone primary; the old primary no longer replicates to it',
      'Both instances accept writes and keep each other in sync'
    ],
    answer: 2,
    explanation: 'Promoting a read replica is one-way: replication stops and it becomes an independent primary. After the outage you rebuild replication, for example by creating a new replica from it. Cloud SQL never runs two writable instances in sync.'
  },
  {
    id: 'ace-s11-17',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A relational database must survive the loss of an entire region with an RPO of zero and an RTO of near zero. Which service fits?',
    options: [
      'Cloud SQL with a cross-region read replica',
      'Spanner with a multi-region configuration',
      'Cloud SQL Enterprise Plus with HA in one region',
      'AlloyDB with a read pool in a second zone'
    ],
    answer: 1,
    explanation: 'Spanner multi-region replicates synchronously across regions, so committed data is not lost and service continues automatically. Cross-region Cloud SQL replicas are asynchronous and need promotion, and single-region HA does not survive a regional outage.'
  },
  {
    id: 'ace-s11-18',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Platform engineers want VM backups scheduled centrally across many projects, with retention rules that app teams cannot change. What do you use?',
    options: [
      'Snapshot schedules created by each app team',
      'Backup and DR Service backup plans applied to the VMs',
      'A Cloud Scheduler job running `gcloud compute images create`',
      'Machine images created by each team before every release'
    ],
    answer: 1,
    explanation: 'Backup and DR Service lets a central team define backup plans (schedule and retention) and apply them to VMs, with vault protection. Per-team snapshot schedules and ad-hoc images are not centrally enforced.'
  },
  {
    id: 'ace-s11-19',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A database is backed up every four hours, and nothing else protects it. In the worst case, how much data could be lost?',
    options: [
      'Up to fifteen minutes of writes',
      'Up to four hours of writes',
      'Up to one full day of writes',
      'None, because backups are continuous'
    ],
    answer: 1,
    explanation: 'If the failure happens just before the next backup, everything written since the last one is lost, so the worst-case RPO equals the backup interval: four hours. Continuous log shipping or PITR would lower it.'
  },
  {
    id: 'ace-s11-20',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Analysts need data from Cloud SQL in BigQuery for dashboards, refreshed within minutes, and the database team does not want nightly exports. What do you use?',
    options: [
      'Datastream from Cloud SQL into BigQuery',
      'A Cloud SQL read replica inside BigQuery',
      'Cloud SQL exports to Cloud Storage every hour',
      'BigQuery Data Transfer Service from Cloud SQL'
    ],
    answer: 0,
    explanation: 'Datastream reads Cloud SQL’s change log and keeps BigQuery tables up to date with low latency. Replicas cannot live in BigQuery, hourly exports are batch, and the Data Transfer Service does not stream changes from Cloud SQL.'
  },

  // ── Session 12 · Lab: a data stack with a restore drill ──
  {
    id: 'ace-s12-01',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'In the lab, raw files in `gs://ace-lab-raw` stay Standard when new, move to Coldline after 30 days and are deleted after a year. Which lifecycle rules do that?',
    options: [
      '`SetStorageClass` to COLDLINE with `age: 365`, and `Delete` with `age: 30`',
      '`SetStorageClass` to NEARLINE with `age: 30`, and `Delete` with `age: 90`',
      '`SetStorageClass` to COLDLINE with `age: 30`, and `Delete` with `age: 365`',
      '`Delete` with `age: 30`, and `SetStorageClass` to ARCHIVE with `age: 365`'
    ],
    answer: 2,
    explanation: 'Two rules: one changes the class at 30 days, the other deletes at 365 days. The others swap the ages, pick the wrong class, or delete before the class change.'
  },
  {
    id: 'ace-s12-02',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'How is the lifecycle configuration in `lifecycle.json` applied to the lab bucket?',
    options: [
      '`gcloud storage buckets update gs://ace-lab-raw --lifecycle-file=lifecycle.json`',
      '`gcloud storage cp lifecycle.json gs://ace-lab-raw/.lifecycle`',
      '`gcloud storage objects update gs://ace-lab-raw/** --lifecycle-file=lifecycle.json`',
      '`gcloud storage buckets create gs://ace-lab-raw --lifecycle=lifecycle.json --force`'
    ],
    answer: 0,
    explanation: 'Lifecycle is a bucket setting, set with `buckets update --lifecycle-file`. Copying a file into the bucket does nothing, objects have no lifecycle flag, and `create` cannot change an existing bucket.'
  },
  {
    id: 'ace-s12-03',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The lab creates the dataset with `bq --location=asia-southeast2 mk --dataset ace-lab-123:sales`. Why does `--location` matter here?',
    options: [
      'The dataset must be in the same location as the bucket it loads from, and it cannot be moved later',
      'Without it, the dataset is created in every region at once and billed for each copy',
      'It sets where query results are cached, and has no effect on loading',
      'It is required only for datasets that hold more than 1 TB of data'
    ],
    answer: 0,
    explanation: 'A dataset’s location is fixed at creation, and loading from a regional bucket needs the dataset in that same location. Without `--location`, it may land in the default `US` location, and the load from Jakarta fails.'
  },
  {
    id: 'ace-s12-04',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'In `bq load --source_format=CSV --autodetect sales.orders gs://ace-lab-raw/orders.csv`, what does `--autodetect` do?',
    options: [
      'Detects the file’s location and creates the dataset there',
      'Detects duplicate rows and skips them during the load',
      'Detects the compression format and decompresses the file',
      'Infers the table schema (column names and types) from the file'
    ],
    answer: 3,
    explanation: 'Schema auto-detection samples the file to infer column names and types, so you do not have to supply a schema. Location, deduplication and compression are not what the flag does.'
  },
  {
    id: 'ace-s12-05',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'What does the lab’s `bq load` job cost?',
    options: [
      'The bytes in the CSV file, billed at the on-demand query rate per TB',
      'A flat fee per load job, plus the bytes in the file',
      'Nothing for the load itself; you pay for the table’s storage afterwards',
      'Network egress for reading the file from Cloud Storage'
    ],
    answer: 2,
    explanation: 'Batch load jobs that use the shared slot pool are free. You pay for storing the data in BigQuery, and there is no egress charge when the bucket and dataset share a location.'
  },
  {
    id: 'ace-s12-06',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The lab creates `shop-db` with `--availability-type=REGIONAL`. What does that flag give the instance?',
    options: [
      'A read replica in a second region that serves the reporting queries',
      'High availability: a standby in a second zone with automatic failover',
      'Backups stored in a multi-region location',
      'A regional IP address instead of a zonal one'
    ],
    answer: 1,
    explanation: '`REGIONAL` turns on HA: a synchronously replicated standby in another zone of the region, which takes over automatically. `ZONAL` means no standby. Replicas, backup location and IP addresses are set separately.'
  },
  {
    id: 'ace-s12-07',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: '`gcloud sql import csv shop-db gs://ace-lab-raw/customers.csv --database=shop --table=customers` fails with a 403 error. What fixes it?',
    options: [
      'Grant your own account Storage Admin on the bucket',
      'Grant the instance’s service account Storage Object Viewer on the bucket',
      'Turn off uniform bucket-level access so the CSV file’s ACL applies',
      'Make the CSV file public for the length of the import'
    ],
    answer: 1,
    explanation: 'Cloud SQL reads the file with the instance’s own service account, so that account needs read access on the bucket. Your own role is not used for the read, uniform access is fine with IAM, and making data public is never the answer.'
  },
  {
    id: 'ace-s12-08',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Before breaking data on purpose, the lab runs `gcloud sql backups create --instance=shop-db --description="before drill"`. How long is this on-demand backup kept?',
    options: [
      'Seven days, the same as the automated backups',
      'Only until the next automated backup replaces it',
      'Thirty days, after which it moves to Archive storage',
      'Until you delete it; the retention count does not apply'
    ],
    answer: 3,
    explanation: 'On-demand backups are kept until you delete them (or the instance is deleted). The retained-backups count only applies to automated backups.'
  },
  {
    id: 'ace-s12-09',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Rows were deleted at 10:00 WIB (UTC+7). Which value do you pass to `--point-in-time` to clone the database just before the damage?',
    options: [
      '`2026-10-30T09:59:00Z`',
      '`2026-10-30T02:59:00Z`',
      '`2026-10-30T10:00:00+00:00`',
      '`2026-10-30T17:00:00Z`'
    ],
    answer: 1,
    explanation: 'The time is RFC 3339, usually in UTC. 10:00 WIB is 03:00 UTC, so one minute before is 02:59Z. 09:59Z would be 16:59 WIB, after the damage, and 10:00+00:00 is 17:00 WIB.'
  },
  {
    id: 'ace-s12-10',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The lab recovers with `gcloud sql instances clone shop-db shop-db-drill --point-in-time=...`. What happens to `shop-db` during this?',
    options: [
      'Nothing; the clone is a new instance and `shop-db` keeps serving',
      'It is stopped until the clone finishes, then restarted',
      'It is rolled back to the chosen time along with the clone',
      'It becomes a read replica of `shop-db-drill`'
    ],
    answer: 0,
    explanation: 'Cloning creates a separate instance from the backup and logs. The source keeps running, so you can verify the clone first and then decide how to bring data back.'
  },
  {
    id: 'ace-s12-11',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The lab’s deliverable is “restore evidence”. What does that consist of?',
    options: [
      'A screenshot of the Backups tab showing that recent backups exist',
      'The lifecycle JSON file and the bucket’s storage class',
      'The operation IDs, the times, and row counts before and after the restore',
      'The IAM policy of the instance and its service account'
    ],
    answer: 2,
    explanation: 'A backup is only proven when a restore succeeds. The operation IDs (from `gcloud sql operations list`), timestamps and before/after row counts show it worked, which is what an auditor asks for.'
  },
  {
    id: 'ace-s12-12',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which command lists the recent operations on the cloned instance, so you can record their IDs and status?',
    options: [
      '`gcloud sql instances describe shop-db-drill --operations`',
      '`gcloud sql operations list --instance=shop-db-drill --limit=5`',
      '`gcloud logging read shop-db-drill --limit=5`',
      '`gcloud sql backups list --instance=shop-db-drill`'
    ],
    answer: 1,
    explanation: '`gcloud sql operations list` shows each operation (create, clone, import, backup) with its ID, type, status and times. `backups list` shows backups only, and `describe` has no operations flag.'
  },
  {
    id: 'ace-s12-13',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'The drill tries to clone `shop-db` to a point ten days ago, and it fails. The instance is Enterprise edition with default settings. Why?',
    options: [
      'Point-in-time clones can only go back 24 hours on any edition',
      'Logs are kept 7 days by default, so that point is outside the window',
      'The instance has HA, and HA instances do not support clones',
      'The clone name must match the source name for older points in time'
    ],
    answer: 1,
    explanation: 'PITR needs logs back to the chosen time. Enterprise keeps transaction logs for 7 days by default (1 to 7 days), and Enterprise Plus up to 35. HA instances can be cloned, and the clone must have a new name.'
  },
  {
    id: 'ace-s12-14',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'After the lab you want to stop all Cloud SQL charges. What do you do?',
    options: [
      'Delete the instances; a stopped instance still bills for storage and its IP',
      'Stop the instances; stopped instances are not billed for anything',
      'Remove HA from the instances, which ends the charges',
      'Delete the on-demand backups only, which ends the charges'
    ],
    answer: 0,
    explanation: 'Stopping an instance ends CPU and memory charges, but storage, backups and reserved IPs are still billed. Deleting the instances (and their clones) stops the charges.'
  },
  {
    id: 'ace-s12-15',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Analysts want to query the CSV files in `gs://ace-lab-raw` from BigQuery without loading them into BigQuery storage. What do you create?',
    options: [
      'A scheduled query that copies the files every hour',
      'A materialized view over the bucket’s objects',
      'An external table (or BigLake table) that points to the files',
      'A dataset snapshot that includes the bucket'
    ],
    answer: 2,
    explanation: 'External and BigLake tables read data where it sits in Cloud Storage. Scheduled queries and materialized views work on data already in BigQuery, and snapshots copy tables, not buckets.'
  },
  {
    id: 'ace-s12-16',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'The lab bucket is created with `--uniform-bucket-level-access`. What does that change?',
    options: [
      'Access is controlled only by IAM; object ACLs are disabled',
      'Every object becomes readable by all users of the project',
      'Every object gets the same storage class as the bucket',
      'The bucket can only be read from inside the same region'
    ],
    answer: 0,
    explanation: 'Uniform bucket-level access turns off ACLs so that IAM on the bucket (or managed folders) is the single source of access. It does not grant access, change classes, or restrict regions.'
  },
  {
    id: 'ace-s12-17',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Someone deletes `orders.csv` from the lab bucket by mistake. Versioning is off, soft delete is on at its default. How do you include this in the restore drill?',
    options: [
      'Clone the Cloud SQL instance, which also restores bucket objects',
      'Rerun the BigQuery load, which writes the original file back to the bucket',
      'Nothing; without versioning a deleted object cannot be restored',
      'Restore it from soft delete with `gcloud storage restore` and record the operation'
    ],
    answer: 3,
    explanation: 'Soft delete keeps deleted objects for 7 days by default, and `gcloud storage restore` brings them back. Cloud SQL clones do not touch Cloud Storage, and a BigQuery load reads files rather than writing them.'
  },
  {
    id: 'ace-s12-18',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Why does the lab place the bucket, the BigQuery dataset and the Cloud SQL instance all in `asia-southeast2`?',
    options: [
      'Google Cloud requires all resources in a project to be in the same region',
      'Cloud SQL can only import from buckets in a single region in its zone',
      'BigQuery datasets in other regions cannot be queried from Cloud Shell',
      'It keeps loads in one location, avoids cross-region charges and keeps data in-country'
    ],
    answer: 3,
    explanation: 'Keeping data in one location satisfies residency, avoids inter-region network costs, and meets BigQuery’s rule that loads read from a bucket in the dataset’s location. Projects can span regions, and Cloud Shell can query any dataset.'
  },
  {
    id: 'ace-s12-19',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'After the clone checks out, the team must bring the deleted rows back into `shop-db` without losing orders written since the incident. What is the safest approach?',
    options: [
      'Restore last night’s backup onto `shop-db` to replace its data',
      'Promote `shop-db-drill` and delete `shop-db` straight away',
      'Run PITR on `shop-db` itself to roll it back in place',
      'Export the missing rows from `shop-db-drill` and import them into `shop-db`'
    ],
    answer: 3,
    explanation: 'Copying only the missing rows from the clone keeps newer orders in production. Restoring a backup over `shop-db` or switching to the clone loses everything written after the chosen time, and PITR does not roll back in place.'
  },
  {
    id: 'ace-s12-20',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Which command confirms that the lab bucket’s lifecycle and uniform access settings were applied?',
    options: [
      '`gcloud storage ls -L gs://ace-lab-raw/orders.csv`',
      '`gcloud storage buckets list --filter=lifecycle`',
      '`gcloud storage buckets describe gs://ace-lab-raw`',
      '`gcloud storage objects describe gs://ace-lab-raw`'
    ],
    answer: 2,
    explanation: '`buckets describe` shows the bucket’s settings, including its lifecycle rules, uniform access, location and default class. `ls -L` on an object shows that object’s metadata, not the bucket’s rules.'
  },

  // ── Session 13 · VPC fundamentals, network security, Shared VPC and peering ──
  {
    id: 'ace-s13-01',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command creates a custom mode VPC whose Cloud Routers share learned routes with every region?',
    options: [
      '`gcloud compute networks create prod --subnet-mode=auto --bgp-routing-mode=regional`',
      '`gcloud compute networks create prod --mode=custom --routing=all-regions`',
      '`gcloud compute networks create prod --subnet-mode=custom --bgp-routing-mode=global`',
      '`gcloud compute networks create prod --subnet-mode=custom --global-access`'
    ],
    answer: 2,
    explanation: '`--subnet-mode=custom` creates no subnets, and `--bgp-routing-mode=global` sets dynamic routing to global. The other flags either choose auto mode, regional routing, or do not exist.'
  },
  {
    id: 'ace-s13-02',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'What is the scope of a subnet in a Google Cloud VPC?',
    options: [
      'Zonal: it lives in exactly one zone',
      'Global: it spans every region of the VPC',
      'Project-wide: it is shared by all VPCs',
      'Regional: it spans all zones of one region'
    ],
    answer: 3,
    explanation: 'The VPC is global, and each subnet belongs to one region but can hold VMs in any zone of that region.'
  },
  {
    id: 'ace-s13-03',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which command grows subnet `web` in `asia-southeast2` from /24 to /22?',
    options: [
      '`gcloud compute networks subnets update web --region=asia-southeast2 --range=10.10.0.0/22`',
      '`gcloud compute networks subnets resize web --region=asia-southeast2 --size=1024`',
      '`gcloud compute networks update prod --subnet=web --prefix-length=22`',
      '`gcloud compute networks subnets expand-ip-range web --region=asia-southeast2 --prefix-length=22`'
    ],
    answer: 3,
    explanation: '`expand-ip-range` with a smaller `--prefix-length` widens the primary range in place, as long as the new range does not overlap anything. There is no `resize`, and `update` cannot change the range.'
  },
  {
    id: 'ace-s13-04',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which command converts the auto mode `default` network to custom mode?',
    options: [
      '`gcloud compute networks update default --subnet-mode=custom --force`',
      '`gcloud compute networks convert default --to=custom`',
      '`gcloud compute networks update default --switch-to-custom-subnet-mode`',
      '`gcloud compute networks subnets update default --mode=custom`'
    ],
    answer: 2,
    explanation: '`--switch-to-custom-subnet-mode` converts an auto mode network. It keeps the existing subnets, stops new regions getting subnets automatically, and cannot be reversed.'
  },
  {
    id: 'ace-s13-05',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command reserves the internal address `10.10.2.10` in subnet `app` for a database VM?',
    options: [
      '`gcloud compute addresses create db-ip --global --subnet=app --addresses=10.10.2.10`',
      '`gcloud compute instances create db --private-network-ip=reserve:10.10.2.10`',
      '`gcloud compute addresses create db-ip --region=asia-southeast2 --subnet=app --addresses=10.10.2.10`',
      '`gcloud compute networks subnets update app --reserve=10.10.2.10`'
    ],
    answer: 2,
    explanation: 'Static internal addresses are regional and tied to a subnet, created with `addresses create --region --subnet --addresses`. Global addresses are for global load balancers, and there is no `reserve:` syntax or subnet flag for it.'
  },
  {
    id: 'ace-s13-06',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Assigning a reserved global static external IP to a VM fails. Why?',
    options: [
      'Global addresses must first be promoted with `addresses promote`',
      'VMs use regional external addresses; global addresses are for global load balancers',
      'The VM must use the Standard network tier before it can accept a global address',
      'The address must be released and reserved again in the VM’s zone'
    ],
    answer: 1,
    explanation: 'Global static external addresses serve global external load balancers. A VM’s external IP must be a regional address in the VM’s region. There is no promote step for this and addresses are never zonal.'
  },
  {
    id: 'ace-s13-07',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A reserved static external IP has not been attached to anything for three months. What does it cost?',
    options: [
      'It is free until it is attached to a resource',
      'It is free for 90 days, then billed',
      'It is billed while reserved and unused',
      'It is released automatically after 30 days'
    ],
    answer: 2,
    explanation: 'Static external addresses are charged when they are reserved but not in use, so release ones you do not need. Reserved addresses are never released automatically.'
  },
  {
    id: 'ace-s13-08',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Two firewall appliance VMs sit behind an internal passthrough Network Load Balancer. You want a default route that sends traffic to the healthy appliances. What next hop do you use?',
    options: [
      '`--next-hop-instance` pointing to the first appliance only',
      '`--next-hop-gateway=default-internet-gateway` with appliance tags',
      '`--next-hop-vpn-tunnel` pointing to a tunnel to the appliances',
      '`--next-hop-ilb` pointing to the load balancer’s forwarding rule'
    ],
    answer: 3,
    explanation: 'A route can use an internal passthrough NLB as its next hop, so traffic is spread across healthy appliances and fails over automatically. A single instance next hop has no failover, and the internet gateway or VPN tunnel do not reach the appliances.'
  },
  {
    id: 'ace-s13-09',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'You need to switch off a firewall rule for an hour to test something, without losing its settings. What do you do?',
    options: [
      '`gcloud compute firewall-rules delete RULE --keep-config`',
      '`gcloud compute firewall-rules update RULE --priority=65535`',
      '`gcloud compute firewall-rules update RULE --no-enable-logging`',
      '`gcloud compute firewall-rules update RULE --disabled`'
    ],
    answer: 3,
    explanation: 'A disabled rule stays in place with all its settings but is not enforced; `--no-disabled` turns it back on. Changing priority still enforces the rule, logging does not affect enforcement, and there is no keep-config delete.'
  },
  {
    id: 'ace-s13-10',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'Which statement about VPC firewall rule priority is true?',
    options: [
      'Priorities run from 0 to 65535, and the lowest number is evaluated first',
      'Priorities run from 1 to 1000, and the highest number is evaluated first',
      'Priorities run from 0 to 65535, and the highest number is evaluated first',
      'Priorities only matter between rules with the same target tag'
    ],
    answer: 0,
    explanation: 'Priority is an integer from 0 (highest) to 65535 (lowest), with 1000 as the default. The implied rules sit at 65535, so any rule you create is evaluated before them.'
  },
  {
    id: 'ace-s13-11',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Which rule blocks VMs from sending any traffic to `203.0.113.0/24`?',
    options: [
      '`--direction=INGRESS --action=DENY --rules=all --source-ranges=203.0.113.0/24`',
      '`--direction=EGRESS --action=DENY --rules=all --destination-ranges=203.0.113.0/24`',
      '`--direction=EGRESS --action=DENY --rules=all --source-ranges=203.0.113.0/24`',
      '`--direction=INGRESS --action=DENY --rules=all --destination-ranges=203.0.113.0/24`'
    ],
    answer: 1,
    explanation: 'Outbound traffic is controlled by an egress rule, and egress rules match where traffic goes, so they use `--destination-ranges`. An ingress rule from that range would only block traffic coming from it.'
  },
  {
    id: 'ace-s13-12',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'You try to create a firewall rule with both `--target-tags=web` and `--target-service-accounts=web-sa`. What happens?',
    options: [
      'It is created and applies to VMs that match either target',
      'It is created and applies only to VMs that match both targets',
      'It is rejected; a rule targets tags or service accounts, not both',
      'It is created, and the service account target is ignored'
    ],
    answer: 2,
    explanation: 'A firewall rule can target all instances, network tags, or service accounts, but cannot mix tags and service accounts. The same applies to sources: source tags and source service accounts cannot be combined.'
  },
  {
    id: 'ace-s13-13',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'You created a global network firewall policy with several rules, but none of them affect traffic. What step is missing?',
    options: [
      'Setting every rule in the policy to priority 0',
      'Associating the policy with the VPC network',
      'Enabling logging on the policy’s rules',
      'Deleting the VPC firewall rules for the same ports'
    ],
    answer: 1,
    explanation: 'A network firewall policy does nothing until it is associated with a network (`gcloud compute network-firewall-policies associations create`). Priority and logging do not activate it, and it can coexist with VPC rules.'
  },
  {
    id: 'ace-s13-14',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'You create a tag key `tier` to use as a secure tag in firewall policy rules for VPC `prod`. Which settings does the key need?',
    options: [
      '`--purpose=NETWORK_TAG` with purpose data naming the project',
      '`--purpose=GCE_FIREWALL` with purpose data naming the `prod` network',
      'No purpose; any tag key can be used in firewall rules',
      '`--purpose=IAM_CONDITION` with purpose data naming the organization'
    ],
    answer: 1,
    explanation: 'Tag keys meant for firewall rules are created with the `GCE_FIREWALL` purpose and purpose data that names the VPC network (or organization). A key without it can be used for IAM conditions and policies but not as a firewall secure tag.'
  },
  {
    id: 'ace-s13-15',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which two commands set up a Shared VPC host project `net-host` and attach service project `app-1`?',
    options: [
      '`gcloud compute shared-vpc enable net-host`, then `gcloud compute shared-vpc associated-projects add app-1 --host-project=net-host`',
      '`gcloud compute networks share net-host`, then `gcloud compute networks attach app-1 --host=net-host`',
      '`gcloud projects update net-host --shared-vpc`, then `gcloud projects update app-1 --host=net-host`',
      '`gcloud compute shared-vpc enable app-1`, then `gcloud compute shared-vpc associated-projects add net-host --host-project=app-1`'
    ],
    answer: 0,
    explanation: 'You enable the host project first, then add each service project as an associated project of that host. The last option reverses the roles.'
  },
  {
    id: 'ace-s13-16',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which statement about Shared VPC projects is true?',
    options: [
      'A service project can be attached to only one host project at a time',
      'A service project can be attached to several host projects at once',
      'A host project can also be a service project of another host',
      'Host and service projects can be in different organizations'
    ],
    answer: 0,
    explanation: 'Each service project attaches to one host project, a host project cannot also be a service project, and all of them must be in the same organization. A host project can, however, have many service projects.'
  },
  {
    id: 'ace-s13-17',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'After you run `gcloud compute networks peerings create` in VPC `a`, the peering shows `INACTIVE`. What is missing?',
    options: [
      'A matching peering created from VPC `b` back to `a`',
      'A Cloud Router in each VPC to exchange the routes',
      'Firewall rules that allow traffic between the two VPCs',
      'An org policy that allows peering between projects'
    ],
    answer: 0,
    explanation: 'VPC peering only becomes `ACTIVE` once both sides have created a peering to each other. Peering does not use Cloud Router, and firewall rules affect traffic, not the peering state.'
  },
  {
    id: 'ace-s13-18',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'VPC `spoke` is peered with VPC `hub`, which has Cloud NAT. VMs in `spoke` without external IPs want to use the hub’s NAT for internet access. What is true?',
    options: [
      'It does not work; Cloud NAT only serves its own VPC, so `spoke` needs its own NAT',
      'It works once the hub exports custom routes, including its default route',
      'It works if the spoke’s VMs are given the tag that the NAT gateway uses',
      'It works if both VPCs are in the same region as the NAT gateway'
    ],
    answer: 0,
    explanation: 'Cloud NAT translates traffic only for subnets in its own VPC, and the default route to the internet gateway is never exchanged over peering. The spoke needs its own Cloud NAT.'
  },
  {
    id: 'ace-s13-19',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: '`gcloud compute firewall-rules list` on a new custom VPC shows no rules. Where are the deny-all ingress and allow-all egress rules?',
    options: [
      'They are only created when the first VM is launched',
      'They are created in the default network only',
      'They are hidden until logging is enabled on the VPC',
      'They are implied rules, so they apply but are not listed'
    ],
    answer: 3,
    explanation: 'The implied rules exist in every VPC at priority 65535 but are not shown as firewall rule resources and cannot be deleted or logged. You add your own rules above them.'
  },
  {
    id: 'ace-s13-20',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A VM needs an external IP that stays the same, and it is currently using an ephemeral one. Which command promotes it?',
    options: [
      '`gcloud compute instances update web --static-ip`',
      '`gcloud compute addresses create web-ip --addresses=EPHEMERAL_IP --region=asia-southeast2`',
      '`gcloud compute addresses promote web-ip --instance=web --region=asia-southeast2`',
      '`gcloud compute instances add-access-config web --static`'
    ],
    answer: 1,
    explanation: 'Creating an address resource with the VM’s current ephemeral IP in `--addresses` promotes that IP to static while it stays attached. There is no `promote` command or `--static-ip` flag.'
  },

  // ── Session 14 · Lab MD4-LAB01: build a segmented VPC network ──
  {
    id: 'ace-s14-01',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Task 1a runs `gcloud compute networks create $PFX-prod --subnet-mode=custom`. How many subnets does the network have right after that command?',
    options: [
      'None; you create each subnet yourself',
      'One in every region, from `10.128.0.0/9`',
      'One in the region set in `compute/region`',
      'Two: one for web and one for app'
    ],
    answer: 0,
    explanation: 'Custom mode creates an empty network. Auto mode would create a subnet in every region. The lab then adds `web` and `app` explicitly.'
  },
  {
    id: 'ace-s14-02',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'The lab’s subnets are /24. How many addresses in each one can VMs use?',
    options: [
      '254',
      '256',
      '252',
      '248'
    ],
    answer: 2,
    explanation: 'A /24 has 256 addresses, and Google Cloud reserves 4 (network, gateway, second-to-last and broadcast), leaving 252.'
  },
  {
    id: 'ace-s14-03',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: '`$PFX-db` is in the `data` network and the others are in `prod`. Why can no VM in `prod` reach it?',
    options: [
      'The data network’s implied rule blocks all egress traffic',
      'Separate VPCs have no routes to each other unless connected',
      'The db VM has no network tag, so it receives nothing',
      'The `10.20.1.0/24` range is reserved for Google services'
    ],
    answer: 1,
    explanation: 'Each VPC is isolated. Without peering, VPN or similar, `prod` has no route to `10.20.1.0/24`, so traffic never arrives. Tags and implied rules are not the reason.'
  },
  {
    id: 'ace-s14-04',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'From `$PFX-probe` (no tags, in the web subnet), you run `curl` against `$PFX-app` on port 8080. Which rule decides, and what happens?',
    options: [
      '`allow-app` (priority 1000) allows it, because probe is in the web subnet',
      'The implied deny blocks it, and nothing appears in the logs',
      '`allow-icmp` allows it, because probe is inside `10.10.0.0/16`',
      '`deny-app` (priority 2000) blocks it, because `allow-app` only matches the source tag `web`'
    ],
    answer: 3,
    explanation: '`allow-app` matches only sources tagged `web`, and probe has no tags. The next match is `deny-app` at 2000, which denies tcp:8080 to `app` and logs it. `allow-icmp` covers ICMP, not TCP.'
  },
  {
    id: 'ace-s14-05',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'From `$PFX-web` you run `curl` against `$PFX-app` on port 8080. What happens?',
    options: [
      'It is denied by `deny-app`, priority 2000',
      'It is allowed by `allow-http`, priority 1000',
      'It is denied by the implied ingress rule',
      'It is allowed by `allow-app`, priority 1000'
    ],
    answer: 3,
    explanation: 'web carries the `web` tag, so `allow-app` (source tag `web`, target tag `app`, tcp:8080) matches at priority 1000 and wins over `deny-app` at 2000. `allow-http` covers port 80 to the web tag.'
  },
  {
    id: 'ace-s14-06',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'The implied ingress rule already blocks unmatched traffic. Why does the lab add `deny-app` at priority 2000?',
    options: [
      'So the rule overrides `allow-app` for any VM without a tag',
      'So blocked attempts are logged; the implied deny cannot be logged',
      'So that `app` also blocks its outbound traffic on port 8080',
      'So that the IAP range cannot reach `app` on port 22'
    ],
    answer: 1,
    explanation: 'Implied rules cannot have logging. An explicit deny with `--enable-logging` makes blocked attempts visible for Task 5. At 2000 it sits below `allow-app` (1000), so allowed traffic is unaffected.'
  },
  {
    id: 'ace-s14-07',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'From `$PFX-probe` you `ping` `$PFX-app`. What happens?',
    options: [
      'It fails, blocked by `deny-app` at priority 2000',
      'It fails, because probe has no network tag',
      'It fails, because app has no external IP',
      'It succeeds, allowed by `allow-icmp` from `10.10.0.0/16`'
    ],
    answer: 3,
    explanation: '`allow-icmp` allows ICMP from `10.10.0.0/16` to all VMs in `prod`, and probe’s address is in that range. `deny-app` only covers tcp:8080, and internal pings need no external IP.'
  },
  {
    id: 'ace-s14-08',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'From your laptop you open `http://` plus the external IP of `$PFX-web`. Which rule lets the request in?',
    options: [
      '`allow-iap`: tcp:22 from `35.235.240.0/20`',
      '`allow-app`: tcp:8080 from source tag `web` to target tag `app`',
      'No rule is needed; port 80 is open by default',
      '`allow-http`: tcp:80 from `0.0.0.0/0` to target tag `web`'
    ],
    answer: 3,
    explanation: '`allow-http` opens port 80 from anywhere, but only to VMs tagged `web`. A custom VPC has no default allow rules.'
  },
  {
    id: 'ace-s14-09',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'How do you SSH to `$PFX-app`, which has no external IP?',
    options: [
      '`gcloud compute ssh $PFX-app --tunnel-through-iap`, with `allow-iap` and IAP-secured Tunnel User',
      '`gcloud compute ssh $PFX-app` after giving the VM an ephemeral external IP for the lab',
      '`gcloud compute ssh $PFX-web`, then `ssh` on to app with a password',
      '`gcloud compute ssh $PFX-app --internal-ip` directly from your laptop'
    ],
    answer: 0,
    explanation: 'IAP TCP forwarding tunnels SSH through Google without an external IP. It needs the firewall to allow `35.235.240.0/20` on port 22 and the user to have the IAP-secured Tunnel User role. `--internal-ip` only works from inside the network.'
  },
  {
    id: 'ace-s14-10',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'SSH through IAP works for VMs in `prod` but not for `$PFX-db`. What does the lab add to fix it?',
    options: [
      'A second target tag on `allow-iap` so it also matches the db VM',
      'A peering between `prod` and `data` so the IAP rule is shared',
      'A `data-iap` rule in the `data` network allowing tcp:22 from `35.235.240.0/20`',
      'An external IP on `$PFX-db` for the length of the lab'
    ],
    answer: 2,
    explanation: 'Firewall rules belong to one network. `allow-iap` lives in `prod`, so the `data` network needs its own IAP rule. Peering would not share rules, and an external IP is unnecessary with IAP.'
  },
  {
    id: 'ace-s14-11',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The VMs run python3’s HTTP server from a startup script, and `$PFX-app` has no external IP and no Cloud NAT. Why does that still work?',
    options: [
      'Startup scripts always run with temporary internet access',
      'Private Google Access downloads packages for the VM',
      'python3 is already on the Debian image, so nothing has to be downloaded',
      'IAP provides internet access to VMs while they boot'
    ],
    answer: 2,
    explanation: 'The script uses tools already in the Debian 12 image, so the VM never needs the internet. Without an external IP or NAT, `apt-get` from the internet would hang. Startup scripts and IAP do not grant internet access, and Private Google Access reaches Google APIs only.'
  },
  {
    id: 'ace-s14-12',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'In Task 5 you look for the blocked probe attempts in Logs Explorer. What do you filter on?',
    options: [
      'The log `cloudaudit.googleapis.com/activity` for the firewall API',
      'The log `compute.googleapis.com/firewall`, with the rule name `deny-app` in the rule details',
      'The VM’s serial port output for dropped packets',
      'The log `compute.googleapis.com/vpc_flows`, filtered on the action DENIED for app'
    ],
    answer: 1,
    explanation: 'Firewall Rules Logging writes to `compute.googleapis.com/firewall`, and each entry names the rule (`jsonPayload.rule_details.reference`) and its disposition. Audit logs record configuration changes, and flow logs do not name firewall rules.'
  },
  {
    id: 'ace-s14-13',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Task 5 also uses Connectivity Tests from probe to app on tcp:8080. What does a Connectivity Test do?',
    options: [
      'It analyses routes and firewall rules and reports where a packet would be dropped',
      'It sends real packets between the two VMs and measures the latency',
      'It runs `curl` on the source VM through the guest agent',
      'It replays the firewall logs to recreate the flow'
    ],
    answer: 0,
    explanation: 'Connectivity Tests model the path using your network configuration and report the result and the rule or route that decides it, such as `deny-app`. Live data-plane checks are a separate feature, and it does not run commands on VMs.'
  },
  {
    id: 'ace-s14-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'During cleanup, `gcloud compute networks delete $PFX-prod` fails. What is the correct order?',
    options: [
      'Delete the network first with `--force`, which removes everything inside',
      'Delete the VMs, then the firewall rules, then the subnets, then the network',
      'Delete the subnets first, then the VMs, then the network',
      'Delete the firewall rules first; the network then deletes the VMs'
    ],
    answer: 1,
    explanation: 'A network cannot be deleted while VMs, firewall rules or subnets still use it, and a subnet cannot be deleted while VMs use it. Work in reverse: VMs, rules, subnets, then the network.'
  },
  {
    id: 'ace-s14-15',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Someone changes `allow-app` to use `--source-ranges=10.10.1.0/24` instead of `--source-tags=web`. What changes in the tests?',
    options: [
      'Nothing; a source range and a source tag match the same VMs here',
      'Web can no longer reach app, since ranges do not match tagged VMs',
      'Probe can now reach app on 8080, since it is in the same subnet as web',
      'Probe can now ping the db VM in the `data` network'
    ],
    answer: 2,
    explanation: 'Probe is also in `10.10.1.0/24`, so a range-based source lets it through. The source tag was what separated web from probe. Ranges do match tagged VMs, and the data network stays unreachable.'
  },
  {
    id: 'ace-s14-16',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Someone changes `deny-app` to priority 500. What happens to traffic from web to app on 8080?',
    options: [
      'It is blocked, because the deny at 500 is evaluated before the allow at 1000',
      'It is still allowed, because allow rules always win over deny rules',
      'It is still allowed, because `allow-app` has a more specific source',
      'It is blocked only for VMs without the `web` tag'
    ],
    answer: 0,
    explanation: 'Lower numbers win. At 500, `deny-app` (source `0.0.0.0/0`, target `app`) matches web’s traffic before `allow-app` is reached. Specificity does not matter between rules, only priority (then deny over allow when equal).'
  },
  {
    id: 'ace-s14-17',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'The lab notes that `prod` (10.10.x.x) and `data` (10.20.x.x) could be peered later. What makes that possible?',
    options: [
      'They are in the same project',
      'They are both custom mode networks',
      'They are in the same region',
      'Their subnet ranges do not overlap'
    ],
    answer: 3,
    explanation: 'VPC peering requires non-overlapping subnet ranges. Same project, mode or region are not requirements; peering works across projects and regions.'
  },
  {
    id: 'ace-s14-18',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which flag in Task 2b creates `$PFX-app` without an external IP?',
    options: [
      '`--network-tier=STANDARD`',
      '`--private-network-ip`',
      '`--no-address`',
      '`--tags=app`'
    ],
    answer: 2,
    explanation: '`--no-address` skips the external IP, so the VM is reachable only internally (or through IAP). Network tier affects external IPs it would have had, `--private-network-ip` sets the internal IP, and tags label it for rules.'
  },
  {
    id: 'ace-s14-19',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'How does each lab VM get its internal IP address?',
    options: [
      'From the network tag, which maps each tag to a fixed address',
      'From the subnet named in `--subnet`, automatically unless one is specified',
      'From the zone, which hands out addresses in order',
      'From Cloud DNS, which assigns one when the VM boots for the first time'
    ],
    answer: 1,
    explanation: 'A VM takes an internal IP from the primary range of its subnet. You can choose a specific one with `--private-network-ip`, but otherwise it is assigned automatically. Tags, zones and DNS do not assign IPs.'
  },
  {
    id: 'ace-s14-20',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command checks that all four lab VMs are running, with their internal IPs, before Task 4?',
    options: [
      '`gcloud compute instances list --filter="name~^$PFX"`',
      '`gcloud compute networks list --filter="name~^$PFX"`',
      '`gcloud compute firewall-rules list --filter="name~^$PFX"`',
      '`gcloud compute addresses list --filter="name~^$PFX"`'
    ],
    answer: 0,
    explanation: '`instances list` shows each VM’s zone, status and internal and external IPs. The other commands list networks, rules and reserved addresses, none of which show VM status.'
  },

  // ── Session 15 · Hybrid connectivity and network services: VPN, Interconnect, DNS, NAT ──
  {
    id: 'ace-s15-01',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'When you build an HA VPN to an on-premises router, which Google Cloud resource describes the on-premises device and its public IP addresses?',
    options: [
      'A target VPN gateway (`gcloud compute target-vpn-gateways create`)',
      'An external VPN gateway (`gcloud compute external-vpn-gateways create`)',
      'A Cloud Router with the on-premises ASN (`gcloud compute routers create`)',
      'A VLAN attachment (`gcloud compute interconnects attachments create`)'
    ],
    answer: 1,
    explanation: 'The external VPN gateway resource records the peer device’s interfaces and IPs, and HA VPN tunnels point to it. Target VPN gateways belong to Classic VPN, the Cloud Router handles BGP, and VLAN attachments are for Interconnect.'
  },
  {
    id: 'ace-s15-02',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'In which order do you create the pieces of an HA VPN with dynamic routing?',
    options: [
      'Tunnels first, then the HA VPN gateway, then the BGP peers, and the Cloud Router last',
      'HA VPN gateway and external VPN gateway, Cloud Router, tunnels, then BGP interfaces and peers',
      'Cloud Router, BGP peers, tunnels, then the HA VPN gateway last',
      'External VPN gateway, BGP peers, Cloud Router, then the HA VPN gateway'
    ],
    answer: 1,
    explanation: 'The tunnels reference both gateways and the Cloud Router, so those come first. Each tunnel then gets a Cloud Router interface and a BGP peer. BGP peers cannot exist before the tunnels they run over.'
  },
  {
    id: 'ace-s15-03',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A data centre needs about 10 Gbps to Google Cloud over HA VPN. What do you plan for?',
    options: [
      'Several tunnels with ECMP, because each tunnel carries only a few Gbps',
      'One tunnel, because each HA VPN tunnel carries up to 100 Gbps',
      'One tunnel on each gateway interface, which always totals 10 Gbps',
      'A Classic VPN tunnel, which has a higher bandwidth limit than HA VPN'
    ],
    answer: 0,
    explanation: 'Each Cloud VPN tunnel has a limited throughput (around 3 Gbps at most), so you add tunnels and let BGP spread traffic across them with ECMP. For sustained high bandwidth, Cloud Interconnect is usually the better fit.'
  },
  {
    id: 'ace-s15-04',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which addresses are used for the BGP sessions between Cloud Router and the on-premises router over HA VPN?',
    options: [
      'Addresses from the VPC’s subnet ranges',
      'The public IPs of the VPN gateway interfaces',
      'Addresses from `100.64.0.0/10`',
      'Link-local addresses from `169.254.0.0/16`'
    ],
    answer: 3,
    explanation: 'Cloud Router BGP sessions over VPN or Interconnect use link-local IPv4 addresses in `169.254.0.0/16`, one on each side of the tunnel. They are not taken from subnets or the gateways’ public IPs.'
  },
  {
    id: 'ace-s15-05',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'You are setting up Cloud Router for a Partner Interconnect VLAN attachment. Which ASN must the Cloud Router use?',
    options: [
      '64512',
      '65534',
      'The service provider’s ASN',
      '16550'
    ],
    answer: 3,
    explanation: 'For Partner Interconnect, the Cloud Router must use ASN 16550. For VPN and Dedicated Interconnect you choose a private ASN, such as one in 64512–65534.'
  },
  {
    id: 'ace-s15-06',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'Which circuit sizes can you order for Dedicated Interconnect?',
    options: [
      '50 Mbps to 50 Gbps in small steps',
      '1 Gbps and 10 Gbps circuits only',
      'Any size up to 3 Gbps per tunnel',
      '10 Gbps, 100 Gbps and 400 Gbps circuits'
    ],
    answer: 3,
    explanation: 'Dedicated Interconnect provides 10, 100 and 400 Gbps circuits, which you can bundle. Partner Interconnect offers capacities from 50 Mbps to 50 Gbps per attachment, and per-tunnel limits belong to VPN.'
  },
  {
    id: 'ace-s15-07',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'What Dedicated Interconnect topology qualifies for the 99.99% SLA?',
    options: [
      'Four connections: two in each of two metros, in different edge availability domains',
      'Two connections in one metro, in different edge availability domains',
      'One 100 Gbps connection plus an HA VPN as a backup path',
      'Two connections in the same edge availability domain of one metro'
    ],
    answer: 0,
    explanation: '99.99% needs connections in two metros, with two per metro in separate edge availability domains, and Cloud Routers in two regions. Two connections in one metro (different domains) give 99.9%. A VPN backup is good practice but not part of the SLA topology.'
  },
  {
    id: 'ace-s15-08',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Which resource connects a Dedicated Interconnect connection to a VPC network?',
    options: [
      'An HA VPN gateway attached to the connection',
      'A VPC peering between the connection and the VPC',
      'A VLAN attachment linked to a Cloud Router in a region',
      'A static route with the connection as next hop'
    ],
    answer: 2,
    explanation: 'A VLAN attachment (InterconnectAttachment) carves out a VLAN on the connection and ties it to a Cloud Router in one region of the VPC, which then exchanges routes with BGP.'
  },
  {
    id: 'ace-s15-09',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'After you order a Dedicated Interconnect, Google sends an LOA-CFA. What do you do with it?',
    options: [
      'Upload it to the Cloud Router so it can enable the BGP session with Google',
      'Give it to the colocation facility so they can run the cross-connect to Google',
      'Import it into Certificate Manager to encrypt the link',
      'Send it to your ISP so they can advertise your routes'
    ],
    answer: 1,
    explanation: 'The Letter of Authorization and Connecting Facility Assignment tells the colocation provider which Google port to connect your equipment to. After the cross-connect is in place, you test the link and create VLAN attachments.'
  },
  {
    id: 'ace-s15-10',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'With default settings, which routes does a Cloud Router advertise to on-premises?',
    options: [
      'Only the subnets you list in a custom advertisement',
      'The default route `0.0.0.0/0` and nothing else',
      'The VPC’s subnet routes (all regions in global mode, its own region in regional mode)',
      'Every route in the VPC, including static routes and the default route to the internet'
    ],
    answer: 2,
    explanation: 'Default advertisement mode advertises subnet routes that the dynamic routing mode makes visible. Custom mode lets you add ranges such as `restricted.googleapis.com` or replace them with a chosen list.'
  },
  {
    id: 'ace-s15-11',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command creates a private zone for `corp.example.` that only VPC `prod` can see?',
    options: [
      '`gcloud dns managed-zones create corp --dns-name=corp.example. --visibility=private --networks=prod --description=corp`',
      '`gcloud dns managed-zones create corp --dns-name=corp.example. --visibility=public --networks=prod --description=corp`',
      '`gcloud dns record-sets create corp.example. --zone=prod --private --type=SOA`',
      '`gcloud dns policies create corp --networks=prod --enable-inbound-forwarding`'
    ],
    answer: 0,
    explanation: 'Private zones are created with `--visibility=private` and `--networks` listing the authorized VPCs. Public zones have no network list, record sets live inside a zone, and DNS server policies are a different feature.'
  },
  {
    id: 'ace-s15-12',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which command adds an A record `www.example.com` pointing to `203.0.113.10` with a five-minute TTL?',
    options: [
      '`gcloud dns managed-zones create www.example.com. --type=A --ttl=300 --ip=203.0.113.10`',
      '`gcloud dns record-sets create www.example.com --zone=example --type=CNAME --ttl=5 --rrdatas=203.0.113.10`',
      '`gcloud dns record-sets create www.example.com. --zone=example --type=A --ttl=300 --rrdatas=203.0.113.10`',
      '`gcloud compute addresses create www --addresses=203.0.113.10 --dns-name=www.example.com.`'
    ],
    answer: 2,
    explanation: 'Records are created with `record-sets create`, giving the fully qualified name with a trailing dot, the zone, type, TTL in seconds, and `--rrdatas`. A CNAME cannot hold an IP, and TTLs are in seconds, not minutes.'
  },
  {
    id: 'ace-s15-13',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A VPC has a private zone for `example.com`, and the same name has a public zone on the internet. What does a VM in the VPC get for `www.example.com`?',
    options: [
      'The answer from the private zone, which is checked before public DNS',
      'The answer from the public zone, because public zones take priority',
      'Both answers, returned together in round-robin order',
      'No answer, because the two zones conflict'
    ],
    answer: 0,
    explanation: 'The VPC’s resolver checks response policies, then private zones, forwarding and peering zones that match, and only then goes to public DNS. That order is what makes split-horizon DNS work.'
  },
  {
    id: 'ace-s15-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which statement about Cloud NAT’s architecture is true?',
    options: [
      'It runs on NAT VMs in each zone, so it is a throughput bottleneck for the VPC',
      'It uses the Cloud Router to forward every packet between subnets',
      'It needs a VPN tunnel to send traffic out to the internet',
      'It is software-defined with no proxy VMs; Cloud Router only holds its configuration'
    ],
    answer: 3,
    explanation: 'Cloud NAT is implemented in the network fabric, not by proxy instances, so it adds no choke point. The Cloud Router is only the control-plane object that holds the NAT configuration; it does not carry traffic.'
  },
  {
    id: 'ace-s15-15',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command creates Cloud NAT for every subnet in the region with automatically allocated external IPs?',
    options: [
      '`gcloud compute nats create nat --router=r --region=asia-southeast2 --all-subnet-ip-ranges --auto-allocate-ips`',
      '`gcloud compute routers create nat --network=prod --region=asia-southeast2 --enable-nat --nat-all-subnets`',
      '`gcloud compute addresses create nat --region=asia-southeast2 --purpose=NAT`',
      '`gcloud compute routers nats create nat --router=r --region=asia-southeast2 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges`'
    ],
    answer: 3,
    explanation: 'NAT gateways are created under a Cloud Router with `routers nats create`. `--auto-allocate-nat-external-ips` lets Google pick the IPs, and `--nat-all-subnet-ip-ranges` covers every subnet range in the region.'
  },
  {
    id: 'ace-s15-16',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Long-running database connections from private VMs through Cloud NAT drop after about 20 minutes of idle time. What do you change?',
    options: [
      'Raise the minimum ports per VM to 4,096 so idle connections are kept open',
      'Turn on endpoint-independent mapping on the NAT gateway',
      'Raise the NAT gateway’s TCP established idle timeout above its 1,200-second default',
      'Switch the NAT gateway to manual IP allocation'
    ],
    answer: 2,
    explanation: 'Cloud NAT drops a mapping after the TCP established connection idle timeout, 1,200 seconds (20 minutes) by default. Raising it, or sending keepalives, keeps idle connections open. Port counts and IP allocation do not affect idle time.'
  },
  {
    id: 'ace-s15-17',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Cloud NAT uses one external IP with the default 64 minimum ports per VM. About how many VMs can that one IP serve?',
    options: [
      'About 1,008',
      'About 64',
      'About 65,536',
      'About 4,096'
    ],
    answer: 0,
    explanation: 'Each NAT IP has 64,512 usable source ports. Divided by 64 ports per VM, that gives 1,008 VMs. Raising the ports per VM lowers that number, so you may need more NAT IPs.'
  },
  {
    id: 'ace-s15-18',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which command makes Standard the default network tier for new resources in a project?',
    options: [
      '`gcloud compute networks update prod --network-tier=STANDARD`',
      '`gcloud compute project-info update --default-network-tier=STANDARD`',
      '`gcloud config set compute/network_tier STANDARD`',
      '`gcloud compute addresses update --all --network-tier=STANDARD`'
    ],
    answer: 1,
    explanation: 'The project default tier is set with `project-info update --default-network-tier`. Tiers are not a VPC setting, the gcloud config property is not the project default, and existing addresses keep their tier.'
  },
  {
    id: 'ace-s15-19',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'With which tier does user traffic enter Google’s network at the edge location closest to the user and travel on Google’s backbone to the region?',
    options: [
      'Standard Tier',
      'Both tiers, at different prices',
      'Premium Tier',
      'Neither; this needs Cloud Interconnect'
    ],
    answer: 2,
    explanation: 'Premium Tier uses Google’s global network from the nearest point of presence. Standard Tier carries traffic over the public internet and enters Google’s network near the region, which is cheaper but slower over long distances.'
  },
  {
    id: 'ace-s15-20',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'You try to enable Cloud CDN on a load balancer whose frontend uses a Standard Tier IP. What happens?',
    options: [
      'It works, but cache fill traffic is billed at Premium rates',
      'It is not supported; Cloud CDN needs a Premium Tier frontend',
      'It works only for objects smaller than 10 MB',
      'It works once the backend bucket is moved to a dual-region'
    ],
    answer: 1,
    explanation: 'Cloud CDN is served from Google’s edge and works with the global external Application Load Balancer, which uses Premium Tier. A Standard Tier frontend cannot use Cloud CDN.'
  },

  // ── Session 16 · Load balancing on Google Cloud ──
  {
    id: 'ace-s16-01',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'easy',
    prompt: 'A request to a global external Application Load Balancer passes through its components in which order?',
    options: [
      'URL map, forwarding rule, backend service, target proxy, backends',
      'Target proxy, forwarding rule, backend service, URL map, backends',
      'Backend service, URL map, target proxy, forwarding rule, backends',
      'Forwarding rule, target proxy, URL map, backend service, backends'
    ],
    answer: 3,
    explanation: 'The forwarding rule holds the IP and port, the target proxy terminates HTTP(S), the URL map picks a backend service by host and path, and the backend service sends the request to a healthy backend.'
  },
  {
    id: 'ace-s16-02',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The backend service uses `--port-name=http`, but the MIG’s VMs never receive traffic on port 80. What did you forget on the instance group?',
    options: [
      '`gcloud compute instance-groups managed set-autoscaling web-mig --port=80`',
      '`gcloud compute backend-services update web-be --health-checks-port=http`',
      '`gcloud compute firewall-rules create http --allow=tcp:80 --port-name=http`',
      '`gcloud compute instance-groups set-named-ports web-mig --named-ports=http:80`'
    ],
    answer: 3,
    explanation: 'A backend service sends traffic to the port that the named port maps to on each instance group. Without `http:80` on the group, it does not know which port to use.'
  },
  {
    id: 'ace-s16-03',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A health check probes every 5 seconds, with a 5-second timeout and an unhealthy threshold of 2. A backend stops answering. About how soon is it marked unhealthy?',
    options: [
      'About 5 seconds, after the first failed probe',
      'About 10 seconds, after two failed probes in a row',
      'About 25 seconds, after five failed probes in a row',
      'About 60 seconds, after the default grace period'
    ],
    answer: 1,
    explanation: 'The unhealthy threshold is the number of consecutive failed probes before a backend is marked unhealthy. Two failures at a 5-second interval take about 10 seconds.'
  },
  {
    id: 'ace-s16-04',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'Which command shows whether each instance behind global backend service `web-be` is HEALTHY or UNHEALTHY?',
    options: [
      '`gcloud compute health-checks describe web-hc --global`',
      '`gcloud compute instance-groups managed list-instances web-mig`',
      '`gcloud compute backend-services get-health web-be --global`',
      '`gcloud compute backend-services describe web-be --global`'
    ],
    answer: 2,
    explanation: '`get-health` reports the health state of each backend as the load balancer sees it. `health-checks describe` shows the check’s settings, `list-instances` shows the MIG’s view, and `describe` shows configuration.'
  },
  {
    id: 'ace-s16-05',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which command creates the proxy-only subnet a regional internal Application Load Balancer needs?',
    options: [
      '`gcloud compute networks subnets create proxy --purpose=PRIVATE --role=BACKUP --network=prod --region=asia-southeast2 --range=10.129.0.0/23`',
      '`gcloud compute networks subnets create proxy --purpose=REGIONAL_MANAGED_PROXY --role=ACTIVE --network=prod --region=asia-southeast2 --range=10.129.0.0/23`',
      '`gcloud compute networks subnets create proxy --purpose=PRIVATE_SERVICE_CONNECT --network=prod --region=asia-southeast2 --range=10.129.0.0/23`',
      '`gcloud compute networks subnets create proxy --purpose=GLOBAL_MANAGED_PROXY --role=ACTIVE --network=prod --region=global --range=10.129.0.0/23`'
    ],
    answer: 1,
    explanation: 'Regional Envoy-based load balancers use a proxy-only subnet with purpose `REGIONAL_MANAGED_PROXY` and role `ACTIVE` in that region (a /23 is recommended). `GLOBAL_MANAGED_PROXY` is for cross-region load balancers and still needs a real region, and the other purposes are for VMs or Private Service Connect.'
  },
  {
    id: 'ace-s16-06',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'Which load balancer does not need a proxy-only subnet?',
    options: [
      'Internal passthrough Network Load Balancer',
      'Regional internal Application Load Balancer',
      'Regional external Application Load Balancer',
      'Regional internal proxy Network Load Balancer'
    ],
    answer: 0,
    explanation: 'Passthrough load balancers forward packets without proxies, so they need no proxy-only subnet. Regional Envoy-based load balancers (internal and external ALB, internal and external proxy NLB) do.'
  },
  {
    id: 'ace-s16-07',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'You want one public IP address worldwide that sends each user to the nearest region with healthy capacity. Which load balancer gives you that?',
    options: [
      'Global external Application Load Balancer with a single anycast IP',
      'One regional external ALB per region behind a DNS round robin',
      'External passthrough Network Load Balancer with a global IP',
      'Regional external ALB with backends in several regions'
    ],
    answer: 0,
    explanation: 'The global external ALB announces one anycast IP from Google’s edge and routes requests to the closest backend with capacity, failing over between regions. Regional load balancers have one region each, and passthrough NLBs are regional.'
  },
  {
    id: 'ace-s16-08',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'You want 10% of requests to go to a new version (backend service `web-v2`) and 90% to the current one. What do you configure?',
    options: [
      'A capacity scaler of 0.1 on `web-v2` inside the same backend service',
      'Session affinity with 10% of cookies assigned to `web-v2`',
      'Weighted backend services in the URL map route action: 90 to `web-v1`, 10 to `web-v2`',
      'Two forwarding rules, with DNS returning the second one 10% of the time'
    ],
    answer: 2,
    explanation: 'Advanced traffic management in the URL map can split traffic by weight between backend services, which is the standard canary setup. Capacity scaler affects one backend service’s groups, affinity keeps users sticky, and DNS weighting is imprecise.'
  },
  {
    id: 'ace-s16-09',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A web MIG should add VMs when the load balancer’s serving capacity is 80% used. What autoscaling signal do you choose?',
    options: [
      'CPU utilization, with a target of 0.8',
      'A Cloud Monitoring metric for disk throughput',
      'A schedule that adds VMs at 80% of business hours',
      'HTTP load balancing utilization, with a target of 0.8'
    ],
    answer: 3,
    explanation: 'Autoscaling on load balancing utilization scales based on the backend’s configured capacity (from its balancing mode) at the target you set. CPU, disk metrics and schedules measure other things.'
  },
  {
    id: 'ace-s16-10',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which balancing modes can a zonal NEG backend of a global external ALB use?',
    options: [
      '`UTILIZATION` (CPU of the endpoints)',
      '`CONNECTION` only',
      '`RATE` (requests per second per endpoint)',
      'Any of the three, chosen per endpoint'
    ],
    answer: 2,
    explanation: 'For an Application Load Balancer, zonal NEG backends support `RATE`. `UTILIZATION` is available only for instance group backends, and `CONNECTION` is for TCP load balancers.'
  },
  {
    id: 'ace-s16-11',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'An internal passthrough NLB has backends in two instance groups. The second group must receive traffic only when the first has no healthy VMs. What do you configure?',
    options: [
      'The second group as a failover backend, with a failover policy on the backend service',
      'A capacity scaler of 0 on the second group, raised by a script when needed',
      'Session affinity on the client IP so traffic stays on the first group',
      'A second forwarding rule pointing to the second instance group'
    ],
    answer: 0,
    explanation: 'Internal passthrough NLBs support failover backends: traffic goes to primary backends, and only moves to failover backends when primaries are unhealthy (or below a threshold you set). A scripted scaler is slow, and affinity or extra rules do not give failover.'
  },
  {
    id: 'ace-s16-12',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A site needs a Google-managed wildcard certificate for `*.example.com`. What do you use?',
    options: [
      'A classic Google-managed SSL certificate with load balancer authorization',
      'A self-managed certificate generated with `openssl` on a VM',
      'Certificate Manager with DNS authorization for `example.com`',
      'A Cloud KMS key attached to the target HTTPS proxy'
    ],
    answer: 2,
    explanation: 'Wildcard Google-managed certificates need DNS authorization, which Certificate Manager provides. Load balancer authorization cannot validate wildcards, a self-signed certificate is not trusted by browsers, and KMS keys are not certificates.'
  },
  {
    id: 'ace-s16-13',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A company has an extended validation certificate bought from a commercial CA. How do you use it on the load balancer?',
    options: [
      'Request a Google-managed certificate for the same domain',
      'Store it in Secret Manager and point the URL map to it',
      'Attach it to the backend VMs, which pass it to the load balancer',
      'Upload it as a self-managed SSL certificate with its private key'
    ],
    answer: 3,
    explanation: 'Certificates from your own CA are uploaded as self-managed certificates (classic SSL certificates or in Certificate Manager), with the private key. Google-managed certificates come from Google’s CAs, and the load balancer does not read Secret Manager or backend certificates.'
  },
  {
    id: 'ace-s16-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The app listens on port 8080, but the health check probes port 80. What does the load balancer show and return?',
    options: [
      'All backends HEALTHY, but clients get 404 errors',
      'All backends UNHEALTHY, and clients get 502 errors',
      'All backends HEALTHY, and requests reach port 80',
      'All backends UNKNOWN, and clients get 301 redirects'
    ],
    answer: 1,
    explanation: 'Nothing answers on port 80, so every probe fails and every backend is unhealthy, and the load balancer returns 502. Fix the health check port (or named port) to 8080 and allow it in the firewall.'
  },
  {
    id: 'ace-s16-15',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which flag turns on Cloud CDN for a global backend service `web-be`?',
    options: [
      '`gcloud compute url-maps update web-map --enable-cdn`',
      '`gcloud compute backend-services update web-be --global --enable-cdn`',
      '`gcloud compute forwarding-rules update web-fr --global --cdn`',
      '`gcloud compute target-https-proxies update web-proxy --enable-cdn`'
    ],
    answer: 1,
    explanation: 'Cloud CDN is enabled per backend service (or backend bucket) with `--enable-cdn`. URL maps, forwarding rules and target proxies have no CDN setting.'
  },
  {
    id: 'ace-s16-16',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The same image is requested with many different `?utm_source=` values, and the cache hit ratio is low. What do you change?',
    options: [
      'The default TTL, raised from one hour to one day',
      'The cache key policy, to leave out those query parameters',
      'The cache mode, set to `FORCE_CACHE_ALL`',
      'Negative caching, turned on for 404 responses'
    ],
    answer: 1,
    explanation: 'By default the full query string is part of the cache key, so each `utm` value is a separate cache entry. Excluding those parameters from the key lets all of them hit one entry. TTL and cache mode do not merge different keys.'
  },
  {
    id: 'ace-s16-17',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'With cache mode `CACHE_ALL_STATIC`, a static image comes back from the origin with no `Cache-Control` header. How long does Cloud CDN cache it by default?',
    options: [
      '3,600 seconds, the default TTL',
      '86,400 seconds, the maximum TTL',
      'It is not cached without a header',
      'Until the cache is invalidated'
    ],
    answer: 0,
    explanation: 'For responses without caching headers, `CACHE_ALL_STATIC` caches static content for the default TTL, one hour unless you change it. The max TTL (one day by default) caps what origin headers can ask for.'
  },
  {
    id: 'ace-s16-18',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Security wants SQL injection attempts blocked before they reach the backends of an external ALB. What do you add?',
    options: [
      'A Cloud Armor security policy rule using the preconfigured WAF rule `sqli-v33-stable`',
      'A VPC firewall rule on the backends denying requests that contain SQL keywords',
      'An SSL policy with the `RESTRICTED` profile on the HTTPS proxy',
      'A Cloud NGFW Standard rule with an FQDN object for the site'
    ],
    answer: 0,
    explanation: 'Cloud Armor’s preconfigured WAF rules (based on the OWASP ModSecurity Core Rule Set) inspect HTTP requests at the edge. VPC firewall rules and FQDN objects work on addresses, not request content, and SSL policies control TLS versions.'
  },
  {
    id: 'ace-s16-19',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A Cloud Armor policy should allow only the company’s office ranges and block everyone else. What else must you change besides adding an allow rule for the offices?',
    options: [
      'Nothing; Cloud Armor denies all traffic not explicitly allowed',
      'The backend service’s session affinity to client IP',
      'The allow rule’s priority to 2147483647 so it runs last',
      'The default rule (priority 2147483647), from allow to deny'
    ],
    answer: 3,
    explanation: 'Every Cloud Armor policy ends with a default rule at the lowest priority, and it allows traffic unless you change it. Setting it to deny makes the office rule an allowlist.'
  },
  {
    id: 'ace-s16-20',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'Users in one region only need an external HTTPS load balancer, and the team wants regional resources (forwarding rule, proxy, URL map, backend service) created with `--region`. Which load balancer is this?',
    options: [
      'Global external Application Load Balancer',
      'Classic Application Load Balancer',
      'Regional external Application Load Balancer',
      'External passthrough Network Load Balancer'
    ],
    answer: 2,
    explanation: 'The regional external ALB is built from regional resources, needs a proxy-only subnet and can use Standard Tier. The global and classic ALBs use global resources, and the passthrough NLB does not handle HTTPS.'
  },

  // ── Session 17 · Lab: a load-balanced multi-tier environment ──
  {
    id: 'ace-s17-01',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'In the lab you create the secure tag key `tier` for the VPC. What makes it usable in network firewall policy rules?',
    options: [
      'A network tag with the same name added to each instance template',
      'The tag key being created in the same project as the VMs',
      'An IAM condition on the firewall policy that names the key',
      'The `GCE_FIREWALL` purpose, with the VPC network in its purpose data'
    ],
    answer: 3,
    explanation: 'Secure tags for firewalls need tag keys with the `GCE_FIREWALL` purpose and purpose data scoped to the network. Network tags are a different mechanism, and IAM conditions do not make a key usable in rules.'
  },
  {
    id: 'ace-s17-02',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The platform team must attach `tier=web`, `tier=app` and `tier=db` to VMs, but must not create or change the tags. Which role do they get, and where?',
    options: [
      'Tag Admin on the organization',
      'Tag User on the tag values',
      'Compute Instance Admin on the project only',
      'Tag Viewer on the tag key'
    ],
    answer: 1,
    explanation: 'Binding a tag to a resource needs Tag User on the tag value (plus rights on the resource). Tag Admin can create and change tags, and Tag Viewer can only read them.'
  },
  {
    id: 'ace-s17-03',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'The lab’s policy allows traffic to `tier=web` on port 80 from which sources, so the external ALB and its health checks reach the web VMs?',
    options: [
      '`35.235.240.0/20` only',
      '`130.211.0.0/22` and `35.191.0.0/16`',
      '`0.0.0.0/0`, the whole internet',
      'The load balancer’s external IP'
    ],
    answer: 1,
    explanation: 'Both health check probes and proxied traffic from the global external ALB come from Google’s front ends in `130.211.0.0/22` and `35.191.0.0/16`. The web VMs do not need the internet open, and the forwarding rule’s IP is not the source.'
  },
  {
    id: 'ace-s17-04',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Which policy rule lets the web tier call the app tier and nothing else reach it on that port?',
    options: [
      'Ingress allow, tcp:8080, source secure tag `tier=web`, target secure tag `tier=app`',
      'Ingress allow, tcp:8080, source `10.0.0.0/8`, target secure tag `tier=app`',
      'Egress allow, tcp:8080, source secure tag `tier=app`, target `tier=web`',
      'Ingress allow, tcp:80, source secure tag `tier=app`, target `tier=web`'
    ],
    answer: 0,
    explanation: 'An ingress rule on the app VMs, matching only sources tagged `tier=web` on 8080, limits the app tier to web callers. A whole private range lets any VM in, and the others have the direction or roles reversed.'
  },
  {
    id: 'ace-s17-05',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'Which rule lets the app tier reach the PostgreSQL database tier?',
    options: [
      'Ingress allow, tcp:5432, source `tier=app`, target `tier=db`',
      'Ingress allow, tcp:3306, source `tier=app`, target `tier=db`',
      'Ingress allow, tcp:5432, source `tier=web`, target `tier=db`',
      'Ingress allow, tcp:8080, source `tier=db`, target `tier=app`'
    ],
    answer: 0,
    explanation: 'PostgreSQL listens on 5432, and only the app tier should reach the database. 3306 is MySQL, and web should never talk to the database directly.'
  },
  {
    id: 'ace-s17-06',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Traffic in the lab’s VPC matches no rule in the network firewall policy and no VPC firewall rule. What happens to it?',
    options: [
      'Ingress and egress are both denied by the policy itself',
      'Ingress and egress are both allowed until a deny is added',
      'Ingress is denied and egress is allowed by the implied rules',
      'It is sent to a firewall endpoint for inspection first'
    ],
    answer: 2,
    explanation: 'Unmatched traffic falls through to the VPC’s implied rules: deny ingress, allow egress. That is why the lab only lists what is allowed.'
  },
  {
    id: 'ace-s17-07',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Someone tries to write a lab policy rule that targets the network tag `web` instead of the secure tag. What happens?',
    options: [
      'It works, and it applies to both network tags and secure tags',
      'It works only if the network tag has the same name as the tag value',
      'It works only in a regional network firewall policy',
      'It does not work; network firewall policy rules use secure tags, not network tags'
    ],
    answer: 3,
    explanation: 'Network firewall policies (global and regional) match secure tags and service accounts; network tags are only used by VPC firewall rules. That is one reason the lab uses secure tags.'
  },
  {
    id: 'ace-s17-08',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'The policy and its rules exist, but the web VMs still get no traffic from the load balancer. Which step is missing?',
    options: [
      'Creating a second policy for the health check ranges',
      'Restarting each VM so it reads the new rules',
      'Associating the global network firewall policy with the VPC',
      'Enabling logging on every rule in the policy'
    ],
    answer: 2,
    explanation: 'A network firewall policy only applies after it is associated with the network. Rules apply to running VMs without restarts, and logging does not affect enforcement.'
  },
  {
    id: 'ace-s17-09',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'VMs in the web MIG must carry the secure tag `tier=web` from the moment they are created. Where do you set it?',
    options: [
      'In the MIG, with `--tags=web` on the managed group',
      'In the instance template, with `--resource-manager-tags`',
      'In the backend service, as a backend label',
      'In a startup script that adds the tag after boot'
    ],
    answer: 1,
    explanation: 'Instance templates can include resource manager (secure) tags, so every VM the MIG creates has `tier=web` at boot. `--tags` sets network tags, backend services have no tags, and a startup script leaves a gap and needs extra rights.'
  },
  {
    id: 'ace-s17-10',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Which named port does the lab set on the regional web MIG, and why?',
    options: [
      '`http:80`, so the backend service knows which port to send to',
      '`http:8080`, so the health check can reach the app tier',
      '`https:443`, so the VMs terminate TLS themselves',
      '`ssh:22`, so IAP can reach every instance'
    ],
    answer: 0,
    explanation: 'The backend service refers to a port name, and the MIG maps `http` to 80 where the web VMs listen. TLS ends at the HTTPS proxy, and IAP does not use named ports.'
  },
  {
    id: 'ace-s17-11',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'To validate failover, you stop the VMs in one zone. What should you see?',
    options: [
      'The load balancer keeps sending traffic there until the VMs come back by hand',
      'The MIG moves the whole group to a new region',
      'The load balancer sends traffic only to the other zones, and the MIG recreates the lost VMs',
      'The site goes down until the forwarding rule is recreated'
    ],
    answer: 2,
    explanation: 'Failed health checks take those VMs out of rotation, so traffic shifts to healthy zones, and the regional MIG brings its size back. Nothing moves regions, and the frontend is untouched.'
  },
  {
    id: 'ace-s17-12',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'During the failover test, which command shows the MIG’s view of each VM, including ones being recreated?',
    options: [
      '`gcloud compute instance-groups managed list-instances web-mig --region=asia-southeast2`',
      '`gcloud compute instances list --filter=status=TERMINATED`',
      '`gcloud compute instance-groups list-instances web-mig --zone=asia-southeast2-a`',
      '`gcloud compute instance-groups list --zones=asia-southeast2-a`'
    ],
    answer: 0,
    explanation: '`list-instances` shows each managed VM with its status and current action, such as `RECREATING`. Pair it with `backend-services get-health` for the load balancer’s view.'
  },
  {
    id: 'ace-s17-13',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The web tier must call the app tier through one internal address on tcp:8080, spread across the app MIG, and the app VMs log client IPs. Which load balancer fits?',
    options: [
      'Global external Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Global external proxy Network Load Balancer',
      'Internal passthrough Network Load Balancer'
    ],
    answer: 3,
    explanation: 'An internal passthrough NLB gives a private IP in the region and keeps the client IP. External load balancers would expose the app tier. An internal Application Load Balancer also works, but then the app VMs see proxy addresses.'
  },
  {
    id: 'ace-s17-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The HTTPS frontend’s Google-managed certificate stays in `PROVISIONING`. What do you check first?',
    options: [
      'That the web MIG has at least three healthy VMs',
      'That the secure tag `tier=web` is on every web VM',
      'That the domain’s A record points to the forwarding rule’s IP',
      'That the backend service has Cloud CDN enabled'
    ],
    answer: 2,
    explanation: 'A Google-managed certificate with load balancer authorization is issued only when the domain resolves to the load balancer’s IP. Backend health, tags and CDN do not affect issuance.'
  },
  {
    id: 'ace-s17-15',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'The web MIG should keep average CPU around 60%. What autoscaling setting do you use?',
    options: [
      'Load balancing utilization with a target of 6.0',
      'A fixed size of six instances',
      'CPU utilization with a target of 0.6',
      'A schedule that adds 60% more VMs'
    ],
    answer: 2,
    explanation: 'CPU-based autoscaling adds or removes VMs to keep average CPU near the target, given as a fraction (0.6). Load balancing targets are also fractions up to 1.0, and fixed sizes or schedules do not react to load.'
  },
  {
    id: 'ace-s17-16',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'When cleaning up the lab’s load balancer, in which order do you delete its parts?',
    options: [
      'Forwarding rule, target proxy, URL map, backend service, then the MIG and template',
      'MIG and template, backend service, URL map, target proxy, then forwarding rule',
      'URL map, forwarding rule, backend service, target proxy, then the MIG',
      'Backend service, forwarding rule, target proxy, URL map, then the MIG'
    ],
    answer: 0,
    explanation: 'Each part is referenced by the one in front of it, so you delete from the frontend backwards: forwarding rule, proxy, URL map, backend service, then the MIG it uses, the template and the health check.'
  },
  {
    id: 'ace-s17-17',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Admins must SSH to VMs in every tier through IAP. Which single policy rule covers it?',
    options: [
      'Ingress allow, tcp:22, source `0.0.0.0/0`, target `tier=web` only',
      'Ingress allow, tcp:22, source `35.235.240.0/20`, applied to all tiers',
      'Ingress allow, tcp:3389, source `35.235.240.0/20`, all tiers',
      'Egress allow, tcp:22, destination `35.235.240.0/20`, all tiers'
    ],
    answer: 1,
    explanation: 'IAP TCP forwarding connects from `35.235.240.0/20`, so one ingress rule for tcp:22 from that range with no target (or all tier values) covers every VM. Port 3389 is RDP, and an egress rule does not allow incoming SSH.'
  },
  {
    id: 'ace-s17-18',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Why does the lab use a regional MIG for the web tier rather than one zonal MIG?',
    options: [
      'It spreads VMs across regions, so a regional outage is survived',
      'It spreads VMs across zones, so losing one zone leaves the others serving',
      'It lets the load balancer skip health checks for the group',
      'It removes the need for a named port on the backend service'
    ],
    answer: 1,
    explanation: 'A regional MIG distributes instances across zones of one region, so a zone failure only removes part of the capacity, and the group rebuilds it elsewhere. It does not span regions or change health check or named port needs.'
  },
  {
    id: 'ace-s17-19',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'A developer with Compute Instance Admin but no Tag User rights tries to bind `tier=app` to a test VM, so it can reach the database. What happens?',
    options: [
      'The binding succeeds, because any instance editor can add tags to a VM',
      'The binding succeeds, but only after the VM is restarted',
      'The binding succeeds, but the rule ignores tags added later',
      'The binding is denied, because attaching a secure tag needs Tag User on the value'
    ],
    answer: 3,
    explanation: 'Secure tags are IAM-controlled, so without Tag User on `tier=app` the binding fails, and the VM never matches the app rules. That is the advantage over network tags, which any instance editor can change.'
  },
  {
    id: 'ace-s17-20',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'The lab puts the database tier on VMs in a `db` subnet. If the team later moves to a managed database with no public exposure, which choice fits the same design?',
    options: [
      'Cloud SQL with a public IP and `0.0.0.0/0` in authorized networks',
      'Cloud SQL behind the external Application Load Balancer',
      'Cloud SQL with the `tier=db` secure tag bound to the instance',
      'Cloud SQL with a private IP through private services access'
    ],
    answer: 3,
    explanation: 'A private IP Cloud SQL instance stays off the internet and is reached from the VPC over private services access. A public IP open to everyone breaks the design, load balancers do not front Cloud SQL, and secure tags apply to VMs, not Cloud SQL instances.'
  }
];
