/**
 * Tryout MD3–MD4 — the combined try-out for course Modules 3 and 4, sat on
 * 20 November 2026. Ten sets of 20 questions; each set takes two questions
 * from each of the ten sections, in course order (Set 1 is ace-t34-01–20,
 * Sets 2–10 deal out ace-t34-021–200, 18 per section, two at a time):
 *
 *   Module 3 · Storage & Data            Module 4 · Cloud Networking
 *   1. Cloud Storage (S9)                6. VPC, subnets, IPs and routes (S13-01)
 *   2. Databases (S10)                   7. Firewall rules and Cloud NGFW (S13-02)
 *   3. Messaging and pipelines (S11-01)  8. Shared VPC, peering and hybrid (S13-01/03)
 *   4. Encryption keys (S11-02)          9. Cloud DNS and Cloud NAT (S13-02)
 *   5. Redundancy and DR (S11-03)       10. Load balancing, CDN and tiers (S16)
 *
 * Like the module try-outs, every question carries its exam-guide section and
 * joins that section's bank; the sets themselves are in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const tryoutMd34: ModuleQuestion[] = [
  // ── 1 · Cloud Storage ──
  {
    id: 'ace-t34-01',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A media company stores raw footage in Cloud Storage. Files are read heavily for the first 30 days, then about once a quarter for a year, then almost never. Compliance says every file must be kept for seven years and nobody, including admins, may delete one early. What should you set up?',
    options: [
      'Archive from day one, with object versioning turned on so that nobody can delete an object early',
      'Autoclass on the bucket, with the soft delete retention window raised to seven full years',
      'Standard, lifecycle to Coldline at 30 days and Archive at 365, and a locked 7-year retention policy',
      'Nearline for everything, with a lifecycle rule that deletes each object after seven years'
    ],
    answer: 2,
    explanation: 'Lifecycle rules move each object to the class that matches its age: Standard while it is hot, Coldline for quarterly reads (90-day minimum), Archive once it is cold. A retention policy stops deletion before seven years, and locking it with Bucket Lock means nobody can shorten or remove it. Versioning keeps old copies but does not stop deletes, soft delete tops out at 90 days, and Archive from day one would pay retrieval fees on the heavy first month.',
    tip: '"Nobody may delete, not even admins" → retention policy + Bucket Lock.'
  },
  {
    id: 'ace-t34-02',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A contractor who has no Google account must upload one file to a private bucket within the next two hours. The bucket uses uniform bucket-level access. What do you give the contractor?',
    options: [
      'A signed URL for a PUT on that object name, valid for two hours',
      'Storage Object Creator for `allUsers` on the bucket, removed after two hours',
      'An object ACL that grants WRITE to the contractor’s email address',
      'An HMAC key created for your own user account'
    ],
    answer: 0,
    explanation: 'A signed URL grants time-limited access to one object operation without a Google identity. Granting `allUsers` opens the bucket to the whole internet, ACLs are disabled under uniform bucket-level access, and handing out an HMAC key for your account gives away your own access.'
  },
  {
    id: 'ace-t34-021',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A team keeps nightly database dumps in a Coldline bucket and a lifecycle rule deletes each dump after 30 days. The storage bill is far higher than the stored volume suggests. What explains it, and what is the better choice?',
    options: [
      'Coldline bills a 90-day minimum, so each dump is charged for 60 extra days; Nearline’s 30-day minimum fits',
      'Coldline charges for every read, so the nightly restores cost more than storage; Archive avoids read charges',
      'Lifecycle deletes count as Class A operations, so the deletions cost more; Autoclass removes those fees',
      'Coldline replicates to a second region by default; a regional Standard bucket would avoid the copy'
    ],
    answer: 0,
    explanation: 'Nearline, Coldline and Archive have minimum storage durations of 30, 90 and 365 days. Deleting earlier still bills the remainder as an early-deletion charge. A 30-day life matches Nearline (or Standard). Archive has the highest retrieval fees and a 365-day minimum, and Coldline is not replicated across regions by default.',
    tip: 'Minimums: Nearline 30 · Coldline 90 · Archive 365 days.'
  },
  {
    id: 'ace-t34-022',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Security wants a guarantee that no bucket in the organization can ever be made public, even if a project owner grants `allUsers` a role by mistake. What do you configure?',
    options: [
      'Uniform bucket-level access on every existing bucket, set by a weekly Cloud Scheduler job',
      'The organization policy constraint `storage.publicAccessPrevention`, enforced at the organization',
      'A VPC Service Controls perimeter around all projects that contain Cloud Storage buckets',
      'An IAM deny policy at the organization that denies `storage.objects.get` to all principals'
    ],
    answer: 1,
    explanation: 'Public access prevention blocks any grant to `allUsers` or `allAuthenticatedUsers` from taking effect, and the organization policy enforces it for every current and future bucket. Uniform bucket-level access only disables ACLs, a perimeter controls API access from outside but is not a public-sharing switch, and denying `get` to everyone would block legitimate users too.'
  },
  {
    id: 'ace-t34-023',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bucket has object versioning on. You want to keep at most three older versions of each object and delete any older version once it has been noncurrent for 30 days. What lifecycle configuration does this?',
    options: [
      'A `SetStorageClass` to Archive with `age: 30`, which then expires old versions automatically',
      'A single Delete action with `age: 30` and `isLive: true`, applied to every object',
      'Delete actions with the conditions `numNewerVersions: 3` and `daysSinceNoncurrentTime: 30`',
      'A retention policy of 30 days, which removes versions once they are older than that'
    ],
    answer: 2,
    explanation: '`numNewerVersions` counts how many newer versions exist, so 3 keeps three older copies, and `daysSinceNoncurrentTime` ages a version from the moment it became noncurrent. `isLive: true` targets the current version, which would delete live data. A retention policy prevents deletion rather than causing it.',
    tip: 'Noncurrent cleanup = `numNewerVersions` and `daysSinceNoncurrentTime`.'
  },
  {
    id: 'ace-t34-024',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Yesterday someone deleted an important object from a bucket that has versioning off. The bucket kept the default soft delete policy. What can you do?',
    options: [
      'Nothing; without object versioning, a deleted object is gone and cannot be brought back',
      'Open a support case so Google can restore the object from its internal backups of the bucket',
      'Turn on object versioning now; the previous generation of the object becomes live again',
      'List soft-deleted objects and restore it with `gcloud storage restore`, within the 7-day default window'
    ],
    answer: 3,
    explanation: 'Soft delete keeps deleted objects for a retention window (7 days by default, up to 90) whether or not versioning is on, and `gcloud storage restore` brings them back. Turning on versioning later does not recover anything, and Google does not restore customer objects from internal backups.'
  },
  {
    id: 'ace-t34-025',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A company must move 400 TB from its data centre to Cloud Storage within three weeks. Its internet link is 200 Mbps and is already busy in working hours. Which option fits?',
    options: [
      'Transfer Appliance, shipped to the data centre and returned to Google',
      'Storage Transfer Service for on-premises data, using agents on the link',
      '`gcloud storage cp -r` from several machines in parallel over the link',
      'Partner Interconnect at 1 Gbps, then a copy with `gcloud storage rsync`'
    ],
    answer: 0,
    explanation: '400 TB over 200 Mbps would take more than half a year even at full speed, so any network-based option misses the deadline. Transfer Appliance is built for large offline moves. A new Interconnect takes weeks to provision and 1 Gbps would still need about five weeks.',
    tip: 'Huge data + slow link + short deadline → Transfer Appliance.'
  },
  {
    id: 'ace-t34-026',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Every night, new files land in an Amazon S3 bucket, and they must be copied into Cloud Storage. Nobody wants to run or patch servers for this. What do you use?',
    options: [
      'A Compute Engine VM with a cron job that runs `gcloud storage rsync`',
      'Storage Transfer Service with a daily scheduled job from S3 to the bucket',
      'Transfer Appliance, re-shipped each month with the latest S3 files',
      'A Cloud Storage FUSE mount of the S3 bucket inside Cloud Run'
    ],
    answer: 1,
    explanation: 'Storage Transfer Service is a managed service that copies from S3 (and other clouds or HTTP sources) on a schedule, copying only new or changed objects. A VM needs patching, Transfer Appliance is for offline bulk moves, and Cloud Storage FUSE mounts Cloud Storage buckets, not S3.'
  },
  {
    id: 'ace-t34-027',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'A developer edits a few files in a 50,000-file local directory every day and wants the bucket copy to match, uploading only what changed. Which command fits?',
    options: [
      '`gcloud storage cp -r ./site gs://site-bucket`',
      '`gcloud storage mv ./site gs://site-bucket`',
      '`gcloud storage rsync -r ./site gs://site-bucket`',
      '`gcloud storage objects update gs://site-bucket/**`'
    ],
    answer: 2,
    explanation: '`rsync` compares source and destination and copies only new or changed files (with `--delete-unmatched-destination-objects` it also removes extras). `cp -r` uploads everything every time, `mv` removes the local files, and `objects update` changes metadata only.'
  },
  {
    id: 'ace-t34-028',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bank must keep each customer’s statements for five years after the customer closes the account, not five years after upload. Statements are uploaded monthly to one bucket. What setup does this with the least custom code?',
    options: [
      'Object versioning plus a lifecycle rule that deletes noncurrent versions after five years',
      'A temporary hold on every object, released at account closure, with a lifecycle rule of `age: 1825`',
      'A locked retention policy of five years, starting from the bucket’s creation date',
      'A 5-year bucket retention policy with default event-based holds, released on each object when the account closes'
    ],
    answer: 3,
    explanation: 'With an event-based hold, an object’s retention clock does not start until the hold is released. Releasing it when the account closes starts the five years at that moment. A temporary hold does not reset the retention clock, a plain retention policy counts from upload, and versioning does not stop deletes.'
  },
  {
    id: 'ace-t34-029',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Data must stay inside Indonesia, keep serving if one zone fails, and cost as little as possible. Which bucket location do you choose?',
    options: [
      'A regional bucket in `asia-southeast2` (Jakarta)',
      'A multi-region bucket in `ASIA`',
      'A dual-region bucket of Jakarta and Singapore',
      'A zonal bucket in `asia-southeast2-a`'
    ],
    answer: 0,
    explanation: 'A regional bucket already stores data redundantly across zones in that region, so a zone failure does not affect it, and Jakarta keeps the data in Indonesia. `ASIA` and the Jakarta–Singapore pair place copies outside the country, and Cloud Storage has no zonal buckets.'
  },
  {
    id: 'ace-t34-030',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A research group publishes a 20 TB dataset in Cloud Storage for external universities. The group does not want to pay the egress and operation charges when others download it. What do you enable?',
    options: [
      'A signed URL per university, with a short expiry and a quota',
      'Requester Pays on the bucket, so callers name their own billing project',
      'Autoclass on the bucket, so popular objects move to a cheaper class',
      'Cloud CDN in front of the bucket, so downloads are served from cache'
    ],
    answer: 1,
    explanation: 'Requester Pays bills network, operation and retrieval charges to the requester’s project. Signed URLs control who may download but the owner still pays. Autoclass changes storage costs, not egress, and Cloud CDN lowers some egress but the owner still pays for it.'
  },
  {
    id: 'ace-t34-031',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A static marketing site is stored in a bucket. It must be served over HTTPS on `www.example.com` with a Google-managed certificate. What do you build?',
    options: [
      'A CNAME for `www` to `c.storage.googleapis.com` with website settings on',
      'A bucket named `www.example.com` with uniform access and `allUsers` read',
      'A global external Application Load Balancer with the bucket as a backend bucket',
      'A Cloud Run service that proxies requests to the bucket through a signed URL'
    ],
    answer: 2,
    explanation: 'Cloud Storage’s website endpoint via a CNAME only serves HTTP on a custom domain. For HTTPS with your own domain, put the bucket behind an external Application Load Balancer as a backend bucket and attach a Google-managed certificate. A proxy on Cloud Run adds code and cost for no benefit.'
  },
  {
    id: 'ace-t34-032',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Every time a file is uploaded to the `invoices` bucket, a processing service must be told about the new object within seconds. What is the simplest way to emit that event?',
    options: [
      'A Cloud Scheduler job that lists the bucket every minute for new names',
      'Object versioning on the bucket, with Cloud Logging showing each version',
      'A lifecycle rule with `age: 0` that moves each new object to a queue',
      'A Pub/Sub notification on the bucket for `OBJECT_FINALIZE` events'
    ],
    answer: 3,
    explanation: 'Pub/Sub notifications for Cloud Storage publish a message when an object is finalized (created or overwritten), and Eventarc builds on the same events. Polling with a schedule is slower and costs list operations, versioning does not notify anyone, and lifecycle rules only delete or change storage class.'
  },
  {
    id: 'ace-t34-033',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bucket uses uniform bucket-level access. The finance team should read only objects under `reports/`, and nothing else in the bucket. What do you set up?',
    options: [
      'A managed folder `reports/` with a Storage Object Viewer binding for the finance group',
      'An object ACL on each `reports/` object granting READER to the finance group',
      'Storage Object Viewer on the bucket, with an IAM condition on `resource.name` in the `reports/` prefix',
      'A second bucket for reports, kept in sync with Storage Transfer Service'
    ],
    answer: 0,
    explanation: 'Managed folders let you grant IAM roles on a prefix in a bucket that uses uniform bucket-level access. ACLs are disabled under uniform access. An IAM condition on the object name also works but is clumsier and harder to audit, and copying data to a second bucket doubles storage and adds lag.'
  },
  {
    id: 'ace-t34-034',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A data lake has millions of objects with unpredictable access: some are read daily, some never again. The team does not want to write lifecycle rules or pay retrieval fees. What do you enable?',
    options: [
      'A lifecycle rule to Archive at 30 days',
      'Autoclass on the bucket',
      'Nearline as the default storage class',
      'Object versioning with soft delete'
    ],
    answer: 1,
    explanation: 'Autoclass moves each object between classes based on its own access, moving it back to Standard when read, and charges no retrieval or early-deletion fees. A fixed lifecycle rule guesses the pattern and Archive charges retrieval fees, and Nearline charges for every read.'
  },
  {
    id: 'ace-t34-035',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A single-page app on `https://app.example.com` fetches images from a bucket with signed URLs. The browser blocks the responses with a CORS error. What do you change?',
    options: [
      'Grant `allUsers` Storage Object Viewer so the browser no longer needs CORS',
      'Turn off uniform bucket-level access so object ACLs can add CORS headers',
      'Set a CORS configuration on the bucket allowing that origin and the GET method',
      'Create the signed URLs with V2 signing instead of V4 so CORS is skipped'
    ],
    answer: 2,
    explanation: 'Browsers need CORS headers from the bucket for cross-origin requests, which you set with `gcloud storage buckets update --cors-file`. Making objects public does not add CORS headers and exposes data, ACLs do not set CORS, and the signing version has nothing to do with CORS.'
  },
  {
    id: 'ace-t34-036',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'An upload service must create new objects in a bucket but must never overwrite or delete existing ones. Which role do you grant its service account?',
    options: [
      'Storage Object User (`roles/storage.objectUser`)',
      'Storage Object Admin (`roles/storage.objectAdmin`)',
      'Storage Legacy Bucket Writer (`roles/storage.legacyBucketWriter`)',
      'Storage Object Creator (`roles/storage.objectCreator`)'
    ],
    answer: 3,
    explanation: 'Object Creator has `storage.objects.create` only. Overwriting an existing object also needs `storage.objects.delete`, so the service cannot replace or delete anything. Object User and Object Admin both include delete, and Legacy Bucket Writer can delete objects too.',
    tip: 'Overwrite needs delete permission, so Object Creator cannot overwrite.'
  },
  {
    id: 'ace-t34-037',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A legacy analysis tool can only read files from a local directory path. Its 30 TB input dataset sits in Cloud Storage and is read once per job. What lets the tool read it with no code change and no full copy?',
    options: [
      'Mount the bucket with Cloud Storage FUSE on the VM',
      'Copy the dataset onto a Hyperdisk attached to the VM',
      'Move the dataset to a Filestore Zonal instance',
      'Rewrite the tool to call the Cloud Storage JSON API'
    ],
    answer: 0,
    explanation: 'Cloud Storage FUSE mounts a bucket as a file system, so the tool reads paths while data stays in the bucket. Copying to a disk or Filestore duplicates 30 TB and costs more, and rewriting the tool is the code change you wanted to avoid.'
  },
  {
    id: 'ace-t34-038',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bucket has a locked 5-year retention policy. New regulations require seven years instead. What can you do?',
    options: [
      'Nothing; once a retention policy is locked it cannot be changed in any direction',
      'Raise the retention period to seven years; a locked policy can be lengthened but never shortened',
      'Unlock the policy, change it to seven years, then lock it again',
      'Delete the bucket and create a new one with a locked 7-year retention policy'
    ],
    answer: 1,
    explanation: 'Locking with Bucket Lock is permanent: the policy cannot be removed or reduced, but its period can be increased. There is no unlock, and you cannot delete a bucket while objects are still under retention.'
  },


  // ── 2 · Databases ──
  {
    id: 'ace-t34-03',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A retailer needs one relational inventory database for stores in the US, Europe and Asia. Writes from every continent must be strongly consistent, it must scale horizontally, and the target is 99.999% availability. Which service and configuration fit?',
    options: [
      'Cloud SQL Enterprise Plus with cross-region read replicas',
      'Spanner with a multi-region configuration',
      'AlloyDB for PostgreSQL with cross-region replication',
      'Bigtable with multi-cluster routing'
    ],
    answer: 1,
    explanation: 'Spanner is the globally distributed, strongly consistent relational database, and its multi-region configurations carry the 99.999% SLA. Cloud SQL and AlloyDB replicas are read-only and asynchronous, so writes stay in one region, and Bigtable is NoSQL with eventual consistency across clusters.'
  },
  {
    id: 'ace-t34-04',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'At 14:32 a developer ran a `DELETE` without a `WHERE` clause on a Cloud SQL for PostgreSQL instance. Automated backups and point-in-time recovery are on, and the instance is HA with one read replica. You must recover the rows with the least data loss, without overwriting the live instance. What do you do?',
    options: [
      'Restore last night’s automated backup onto the live instance, then replay the app logs',
      'Promote the read replica to a standalone primary and point the app at it',
      'Fail over to the HA standby in the other zone, which still holds the rows',
      'Clone the instance to a point in time just before 14:32, then copy the rows back'
    ],
    answer: 3,
    explanation: 'Point-in-time recovery creates a new instance as of a chosen moment, so you get the data up to 14:31 and the live instance is untouched. Restoring a backup overwrites the target and loses everything since the backup. The read replica and the HA standby both replicated the delete within seconds.',
    tip: 'HA and replicas copy mistakes too. PITR is the undo button.'
  },
  {
    id: 'ace-t34-039',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL for PostgreSQL instance must keep serving if its zone fails, with failover that needs no manual step. What do you configure?',
    options: [
      'A read replica in another zone, promoted by an on-call engineer',
      'High availability (regional), with a standby in another zone of the region',
      'Daily automated backups, restored to a new zone when an outage happens',
      'A cross-region replica, with the app pointing at both instances'
    ],
    answer: 1,
    explanation: 'HA keeps a synchronously replicated standby in a second zone and fails over automatically to the same IP address. A read replica must be promoted by hand and is asynchronous, backups take far longer to restore, and an app cannot write to a replica.'
  },
  {
    id: 'ace-t34-040',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Heavy monthly reporting queries slow down a Cloud SQL for MySQL primary that serves the web shop. What do you add?',
    options: [
      'High availability, and point the reports at the standby',
      'A bigger machine type during the reporting week only',
      'A read replica, and point the reporting tool at it',
      'A second primary in another zone to share the writes'
    ],
    answer: 2,
    explanation: 'A read replica serves read-only queries from its own copy, taking the load off the primary. The HA standby does not accept connections, resizing restarts the instance and treats the symptom, and Cloud SQL has no multi-primary option.'
  },
  {
    id: 'ace-t34-041',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'An app on GKE must connect to Cloud SQL with IAM-based authorization and encrypted connections, without managing SSL certificates or authorized networks. What do you use?',
    options: [
      'Authorized networks listing the node IP ranges, with SSL disabled inside the VPC',
      'A public IP on the instance, with the database password stored in a ConfigMap',
      'A Cloud NAT gateway for the cluster, with the NAT addresses as authorized networks',
      'The Cloud SQL Auth Proxy as a sidecar, with the pod’s service account holding Cloud SQL Client'
    ],
    answer: 3,
    explanation: 'The Auth Proxy (or a Cloud SQL language connector) authorizes with IAM via `roles/cloudsql.client` and encrypts traffic with TLS, so you manage no certificates or IP lists. Authorized networks are an IP allowlist and need certificate management for TLS, and a password in a ConfigMap is not a secret.'
  },
  {
    id: 'ace-t34-042',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Creating a Cloud SQL instance with a private IP fails, saying the network has no private services connection. What do you do first?',
    options: [
      'Allocate an internal range and create a private connection with `gcloud services vpc-peerings connect`',
      'Enable Private Google Access on every subnet that the application VMs and the instance use',
      'Create a Cloud NAT gateway so the instance can reach the VPC from outside',
      'Create a Private Service Connect endpoint for `all-apis` in the VPC'
    ],
    answer: 0,
    explanation: 'Private IP Cloud SQL uses private services access: you reserve an IP range for Google services and peer your VPC with the service producer network through Service Networking. Private Google Access is for reaching Google APIs, NAT is for outbound internet, and an `all-apis` endpoint does not provide this connection.'
  },
  {
    id: 'ace-t34-043',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A fleet of 2 million sensors sends readings every second. The app writes at very high throughput and reads the latest readings for one device in single-digit milliseconds. No joins are needed. Which database fits?',
    options: [
      'Cloud SQL',
      'Bigtable',
      'Firestore',
      'BigQuery'
    ],
    answer: 1,
    explanation: 'Bigtable is a wide-column NoSQL store built for massive write throughput and low-latency key lookups, which suits time-series data. Cloud SQL does not scale writes this far, Firestore has lower per-database write limits, and BigQuery is for analytics, not millisecond lookups.'
  },
  {
    id: 'ace-t34-044',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A Bigtable table uses the row key `timestamp#deviceId`. Monitoring shows all writes landing on one node while the others sit idle. What fixes it?',
    options: [
      'Add more nodes so each one holds a smaller key range',
      'Use the SSD storage type instead of HDD for the table',
      'Put the device ID first, such as `deviceId#timestamp`',
      'Make the timestamp the only part of the row key'
    ],
    answer: 2,
    explanation: 'Rows are sorted by key, so a key that starts with a timestamp sends every new write to the end of the table, a hotspot on one node. Leading with the device ID spreads writes while keeping each device’s readings together. More nodes do not help a hotspot, and storage type has nothing to do with it.'
  },
  {
    id: 'ace-t34-045',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A mobile app needs a database that syncs data to the phone in real time and keeps working offline, with security rules per user. Which service fits?',
    options: [
      'Bigtable',
      'Cloud SQL',
      'Spanner',
      'Firestore'
    ],
    answer: 3,
    explanation: 'Firestore is a document database with client SDKs for real-time listeners, offline caching and security rules. Bigtable, Cloud SQL and Spanner are server-side databases with none of those mobile features built in.'
  },
  {
    id: 'ace-t34-046',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A web app must cache session data and hot product lookups with sub-millisecond latency, without running cache servers yourself. Which service fits?',
    options: [
      'Memorystore (for Valkey or Redis)',
      'Cloud SQL with a large memory machine',
      'Firestore in Native mode',
      'Cloud Storage with Cloud CDN'
    ],
    answer: 0,
    explanation: 'Memorystore is a managed in-memory store with sub-millisecond reads, designed for caches and sessions. Cloud SQL and Firestore are disk-backed databases with higher latency, and Cloud CDN caches HTTP responses at the edge, not app sessions.'
  },
  {
    id: 'ace-t34-047',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An order system needs PostgreSQL compatibility and high transaction throughput, and analysts want fast queries on the live data without exporting it. Which service fits best?',
    options: [
      'Cloud SQL for PostgreSQL with a read replica',
      'AlloyDB for PostgreSQL, with its columnar engine',
      'Spanner with the GoogleSQL dialect',
      'BigQuery with a nightly load job'
    ],
    answer: 1,
    explanation: 'AlloyDB is PostgreSQL-compatible, built for high throughput, and its columnar engine speeds up analytical queries on operational data. Cloud SQL is fine but slower for heavy analytics, Spanner’s GoogleSQL dialect is not PostgreSQL, and a nightly load is not live data.'
  },
  {
    id: 'ace-t34-048',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'Before running a large BigQuery query under on-demand pricing, you want to know how many bytes it will scan, without running it. What do you do?',
    options: [
      'Run it with `LIMIT 10` added',
      'Run it in a sandbox project',
      'Run it with `bq query --dry_run`',
      'Check the table’s row count'
    ],
    answer: 2,
    explanation: 'A dry run validates the query and returns the bytes it would process, at no cost. `LIMIT` does not reduce bytes scanned in BigQuery, a sandbox still scans, and row count says nothing about which columns are read.'
  },
  {
    id: 'ace-t34-049',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A 40 TB BigQuery events table is queried almost always for the last seven days, but every query scans the whole table. What do you change?',
    options: [
      'Add `LIMIT 1000` to queries so they read fewer rows',
      'Export older rows to Cloud Storage as CSV files',
      'Copy the table to a dataset in a cheaper region',
      'Partition the table by the event date column and filter on it'
    ],
    answer: 3,
    explanation: 'Partitioning by date lets a `WHERE` on that column prune the partitions it does not need, so a 7-day query scans 7 days. Setting `require_partition_filter` enforces it. `LIMIT` does not cut scanned bytes, exports make the data harder to query, and region does not change bytes scanned.'
  },
  {
    id: 'ace-t34-050',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A development team wants a Spanner instance for testing a schema, at the lowest cost. What size do you create?',
    options: [
      '100 processing units',
      '1 node with autoscaling',
      '3 nodes in a multi-region',
      '1,000 processing units'
    ],
    answer: 0,
    explanation: 'Spanner capacity can be set in processing units, where 1,000 equal one node, and the smallest size is 100. That is enough for a test schema at a tenth of a node’s cost. A multi-region with three nodes is far more expensive.'
  },
  {
    id: 'ace-t34-051',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'An on-premises MySQL 8 database must move to Cloud SQL with only minutes of downtime. Writes continue during the migration. What do you use?',
    options: [
      'A `mysqldump` export to Cloud Storage, then a Cloud SQL import',
      'Database Migration Service, with continuous replication and a short cutover',
      'Storage Transfer Service copying the MySQL data files to a bucket',
      'Transfer Appliance, then an import into Cloud SQL from the bucket'
    ],
    answer: 1,
    explanation: 'Database Migration Service seeds Cloud SQL and keeps replicating changes until you cut over, so downtime is just the switch. A dump and import misses writes made during the copy, and copying raw data files or shipping an appliance cannot keep up with ongoing writes.'
  },
  {
    id: 'ace-t34-052',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'A Cloud SQL instance restarted for maintenance at 10:00 on a Tuesday, during peak sales. How do you prevent this next time?',
    options: [
      'Turn on high availability so maintenance never causes a restart',
      'Turn off automated backups so the instance skips maintenance',
      'Set a maintenance window for a quiet hour, such as Sunday at 02:00',
      'Use a read replica so maintenance runs on the replica only'
    ],
    answer: 2,
    explanation: 'A maintenance window tells Cloud SQL when it may apply updates, and deny periods can block maintenance for set dates. HA reduces but does not remove the brief downtime, backups have nothing to do with it, and maintenance also updates the primary.'
  },
  {
    id: 'ace-t34-053',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: '`gcloud sql export sql` from a Cloud SQL instance to `gs://exports` fails with a 403 error. You have Cloud SQL Admin. What is missing?',
    options: [
      'Your user account needs Storage Admin on the bucket because you started the export',
      'The bucket must be in the same zone as the instance before exports are allowed',
      'The export must target a bucket with a `.sql` suffix in its name',
      'The instance’s service account needs write access, such as Storage Object Creator, on the bucket'
    ],
    answer: 3,
    explanation: 'Cloud SQL writes the export file using the instance’s own service account, so that account needs object create permission on the bucket. Your own Storage role is not used for the write. Buckets are not zonal, and bucket names carry no suffix requirement.'
  },
  {
    id: 'ace-t34-054',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL instance stopped accepting writes when its disk filled up overnight. How do you prevent a repeat?',
    options: [
      'Turn on automatic storage increase for the instance',
      'Schedule a weekly job that shrinks the disk after cleanup',
      'Add a read replica so the primary’s disk fills more slowly',
      'Switch the instance’s storage type from SSD to HDD'
    ],
    answer: 0,
    explanation: 'Automatic storage increase grows the disk when free space runs low. Cloud SQL disks cannot be shrunk, a replica copies all data and does not lighten the primary’s disk, and HDD changes speed, not capacity.'
  },
  {
    id: 'ace-t34-055',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'Analysts want changes from an Oracle database replicated into BigQuery within seconds, without writing a pipeline or loading nightly dumps. What do you use?',
    options: [
      'Database Migration Service, migrating Oracle to BigQuery',
      'Datastream, streaming change data capture into BigQuery',
      'BigQuery Data Transfer Service, with an hourly schedule',
      'Pub/Sub, with a BigQuery subscription on a new topic'
    ],
    answer: 1,
    explanation: 'Datastream reads the source database’s change log and streams changes into BigQuery with low latency, with no pipeline code. Database Migration Service targets Cloud SQL and AlloyDB, not BigQuery, the Data Transfer Service runs batch loads, and Pub/Sub would need something to publish the changes.'
  },
  {
    id: 'ace-t34-056',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A Bigtable instance with one cluster in `us-central1-a` must keep serving if that zone fails, with automatic failover. What do you do?',
    options: [
      'Move the cluster to SSD storage and raise the node count to three',
      'Take a Bigtable backup every hour and restore it in another zone when the outage starts',
      'Add a second cluster in another zone and use an app profile with multi-cluster routing',
      'Create a second instance and copy the data with a Dataflow job'
    ],
    answer: 2,
    explanation: 'Adding a cluster replicates the instance, and an app profile with multi-cluster routing sends requests to the nearest healthy cluster, failing over automatically. Storage type and node count stay in one zone, and backups or separate copies need manual work during an outage.'
  },


  // ── 3 · Messaging and pipelines ──
  {
    id: 'ace-t34-05',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Thirty on-premises services use Apache Kafka producer and consumer clients. The company wants a managed Google Cloud service and as few code changes as possible. What should they move to?',
    options: [
      'Managed Service for Apache Kafka',
      'Pub/Sub, rewriting each service against the Pub/Sub client libraries',
      'Pub/Sub Lite with zonal topics',
      'Self-managed Kafka brokers on a GKE Autopilot cluster'
    ],
    answer: 0,
    explanation: 'Managed Service for Apache Kafka runs real Kafka clusters, so existing clients only need new bootstrap addresses and credentials. Pub/Sub needs code changes, Pub/Sub Lite is retired, and running brokers yourself on GKE is not a managed service.'
  },
  {
    id: 'ace-t34-06',
    section: 'operating',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A Pub/Sub push subscription keeps redelivering one malformed message that the subscriber can never process, and it delays everything else. What should you configure?',
    options: [
      'Exactly-once delivery on the subscription, so each message is delivered only one time',
      'Message ordering with an ordering key, so the malformed message is always processed last',
      'A dead-letter topic with 5 maximum delivery attempts, with IAM for the Pub/Sub service agent',
      'A 10-second acknowledgement deadline on the subscription, so the message expires sooner'
    ],
    answer: 2,
    explanation: 'After the maximum number of delivery attempts, Pub/Sub forwards the message to the dead-letter topic, where it can be inspected later. The Pub/Sub service agent needs Publisher on the dead-letter topic and Subscriber on the source subscription. Exactly-once and ordering do not drop a poison message, and a shorter deadline only makes it come back faster.'
  },
  {
    id: 'ace-t34-057',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Messages from a Pub/Sub topic must be handled by a Cloud Run service that scales to zero when idle. The endpoint must only accept authenticated calls. Which subscription fits?',
    options: [
      'A pull subscription, with the Cloud Run service polling the topic every second',
      'A BigQuery subscription, with Cloud Run reading rows from the table',
      'A push subscription to the service URL, with an OIDC token from a service account',
      'A push subscription to the URL, with the service left open to `allUsers`'
    ],
    answer: 2,
    explanation: 'A push subscription calls the HTTPS endpoint when messages arrive, which suits Cloud Run’s scale-to-zero model, and an OIDC token lets the service require an authenticated caller. Constant polling keeps instances running, a BigQuery subscription writes rows instead of calling the service, and `allUsers` removes authentication.'
  },
  {
    id: 'ace-t34-058',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Subscribers take about three minutes to process each message, and the same messages keep being delivered twice. The subscription uses the default ack deadline. What do you change?',
    options: [
      'Turn on message ordering so each message is delivered only once',
      'Lower the message retention so old copies expire sooner',
      'Switch to a push subscription so acknowledgements become automatic',
      'Raise the ack deadline, or let the client library extend it while processing'
    ],
    answer: 3,
    explanation: 'The default ack deadline is 10 seconds; if a message is not acknowledged in time, Pub/Sub redelivers it. A longer deadline (up to 600 seconds) or lease extension by the client stops the duplicates. Ordering does not stop redelivery, retention affects unacknowledged storage, and push also redelivers if the endpoint is slow.'
  },
  {
    id: 'ace-t34-059',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Events for each customer account must be processed in the order they were published, while different accounts can be processed in parallel. What do you set up?',
    options: [
      'Message ordering on the subscription, publishing with the account ID as the ordering key',
      'One topic per customer account, each with its own pull subscription and subscriber',
      'Exactly-once delivery on the subscription, with one subscriber only',
      'A dead-letter topic, so out-of-order events are moved aside'
    ],
    answer: 0,
    explanation: 'With ordering enabled, messages that share an ordering key are delivered in publish order, while different keys proceed in parallel. One topic per account does not scale, exactly-once delivery is about duplicates rather than order, and a dead-letter topic handles failures.'
  },
  {
    id: 'ace-t34-060',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'A payments consumer uses a pull subscription and must not receive a message again after it has successfully acknowledged it. Which feature do you enable?',
    options: [
      'Message ordering with a single ordering key',
      'Exactly-once delivery on the subscription',
      'A longer message retention on the topic',
      'A filter on the subscription’s attributes'
    ],
    answer: 1,
    explanation: 'Exactly-once delivery (pull subscriptions, in one region) guarantees that a successfully acknowledged message is not redelivered, and the client can check whether an ack succeeded. Ordering and retention do not prevent redelivery, and filters only select which messages arrive.'
  },
  {
    id: 'ace-t34-061',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A bug in a subscriber processed the last six hours of messages wrongly, and they were all acknowledged. The fix is deployed. How do you reprocess those messages?',
    options: [
      'Create a new subscription; it receives every message published in the last seven days',
      'Open the dead-letter topic and republish the messages from there to the topic',
      'Seek the subscription to a time six hours ago; this needs acked-message retention or topic retention',
      'Nothing; acknowledged messages are always deleted and cannot be replayed'
    ],
    answer: 2,
    explanation: 'Seeking to a timestamp marks messages after that time as unacknowledged again, but only if they were kept: either `retain-acked-messages` on the subscription or message retention on the topic. A new subscription starts from its creation time, and dead-lettering only applies to failed deliveries.'
  },
  {
    id: 'ace-t34-062',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Before deploying a new version of a subscriber, the team wants a way to return to the current backlog state if the new version breaks. What do you do first?',
    options: [
      'Detach the subscription so no new messages are delivered',
      'Pause publishing to the topic until the deploy has finished',
      'Create a second topic that copies the first one’s messages',
      'Create a snapshot of the subscription, and seek to it if needed'
    ],
    answer: 3,
    explanation: 'A snapshot captures which messages are unacknowledged at that moment, and seeking to it restores that state. Detaching a subscription disconnects it from the topic, pausing publishing harms producers, and a copy topic needs extra plumbing.'
  },
  {
    id: 'ace-t34-063',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Clickstream events published to Pub/Sub should land in a BigQuery table with no transformation and no code or pipeline to maintain. What do you use?',
    options: [
      'A BigQuery subscription on the topic, writing to the table',
      'A Dataflow streaming job using the Pub/Sub-to-BigQuery template',
      'A Cloud Run service that pulls messages and streams them in',
      'A Cloud Storage subscription, then a nightly BigQuery load job'
    ],
    answer: 0,
    explanation: 'A BigQuery subscription writes each message straight into a table, with nothing to deploy or scale. A Dataflow template works but is a running job to pay for and maintain, a Cloud Run service is custom code, and a nightly load is not continuous.'
  },
  {
    id: 'ace-t34-064',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Many teams publish to one topic, and malformed messages keep breaking consumers. You want every message checked against an agreed format when it is published. What do you use?',
    options: [
      'A subscription filter that drops messages with unknown attributes',
      'A Pub/Sub schema (Avro or Protocol Buffer) attached to the topic',
      'A dead-letter topic on every consumer’s subscription',
      'A Cloud Function that validates each message after delivery'
    ],
    answer: 1,
    explanation: 'A schema on the topic makes Pub/Sub reject publishes that do not match it, so bad messages never enter. Filters select by attributes, not message body format, and dead-lettering or a validating function deal with bad messages only after they are already in the topic.'
  },
  {
    id: 'ace-t34-065',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Streaming events need five-minute windowed aggregations, late-data handling and automatic scaling, written with Apache Beam. Which service runs the pipeline?',
    options: [
      'Cloud Composer',
      'Cloud Scheduler',
      'Dataflow',
      'Cloud Data Fusion'
    ],
    answer: 2,
    explanation: 'Dataflow is the managed runner for Apache Beam, with windowing, watermarks for late data and autoscaling. Composer orchestrates workflows but does not process the stream itself, Scheduler only triggers jobs, and Data Fusion is a visual ETL builder.'
  },
  {
    id: 'ace-t34-066',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'A team has hundreds of existing Apache Spark jobs and wants to run them on Google Cloud with the fewest code changes. Which service fits?',
    options: [
      'Dataflow with the Apache Beam SDK',
      'Cloud Data Fusion with its visual editor',
      'BigQuery with scheduled SQL queries',
      'Managed Service for Apache Spark'
    ],
    answer: 3,
    explanation: 'Managed Service for Apache Spark (formerly Dataproc) runs Spark and Hadoop jobs as they are, on clusters or serverless. Dataflow needs the jobs rewritten in Beam, Data Fusion means rebuilding them visually, and BigQuery would mean rewriting them in SQL.'
  },
  {
    id: 'ace-t34-067',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A nightly process must run a BigQuery load, then a Dataflow job, then a Spark job, with retries and dependencies between steps, and the team already writes Apache Airflow DAGs. Which service fits?',
    options: [
      'Cloud Composer',
      'Cloud Scheduler',
      'Pub/Sub',
      'Cloud Tasks'
    ],
    answer: 0,
    explanation: 'Cloud Composer is managed Apache Airflow, built for DAGs with dependencies, retries and operators for BigQuery, Dataflow and Spark. Scheduler fires single jobs on a timetable, Pub/Sub carries messages, and Cloud Tasks dispatches individual tasks.'
  },
  {
    id: 'ace-t34-068',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'An app must call a partner API that allows at most 10 requests per second, scheduling some calls for later and avoiding duplicates by giving each task a name. Which service fits?',
    options: [
      'Pub/Sub, with a push subscription to the partner API',
      'Cloud Tasks, with a queue rate limit of 10 per second',
      'Cloud Scheduler, with one job for each API request',
      'Eventarc, with a trigger on each new request'
    ],
    answer: 1,
    explanation: 'Cloud Tasks queues give explicit dispatch rate limits, scheduled delivery times and named-task deduplication. Pub/Sub has no per-second dispatch cap, Scheduler is for recurring jobs, and Eventarc routes events without rate control.'
  },
  {
    id: 'ace-t34-069',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'Every night at 01:00 Jakarta time a message must be published to the `nightly-report` topic to start a job. What is the simplest way?',
    options: [
      'A Compute Engine VM running cron and `gcloud pubsub topics publish`',
      'A Cloud Tasks queue with a task scheduled for each night',
      'A Cloud Scheduler job with a Pub/Sub target and a cron schedule',
      'A Pub/Sub subscription with a delivery delay of 24 hours'
    ],
    answer: 2,
    explanation: 'Cloud Scheduler is a managed cron service that can publish to a topic at a set time and time zone. A VM needs upkeep, Cloud Tasks schedules one-off tasks rather than a recurring cron, and Pub/Sub has no delay setting.'
  },
  {
    id: 'ace-t34-070',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'A Cloud Run service must run whenever a new BigQuery table is created in a project, and BigQuery has no direct notification for this. What do you use?',
    options: [
      'A Pub/Sub notification configured on the BigQuery dataset',
      'A Cloud Scheduler job that lists the project’s tables every minute',
      'A Cloud Storage notification on the dataset’s bucket',
      'An Eventarc trigger on the Cloud Audit Logs event for the BigQuery API call'
    ],
    answer: 3,
    explanation: 'Eventarc can trigger on any Admin Activity audit log entry, such as the BigQuery table insert method, and deliver it to Cloud Run. BigQuery datasets have no Pub/Sub notification setting and are not stored in a bucket you control, and polling is slow.'
  },
  {
    id: 'ace-t34-071',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Analysts with no coding skills need to build ETL pipelines from SaaS apps and databases into BigQuery using a drag-and-drop editor and ready-made connectors. Which service fits?',
    options: [
      'Cloud Data Fusion',
      'Dataflow',
      'Cloud Composer',
      'Pub/Sub'
    ],
    answer: 0,
    explanation: 'Cloud Data Fusion is a visual, no-code integration service with a library of connectors. Dataflow and Composer need code, and Pub/Sub is a messaging service, not an ETL tool.'
  },
  {
    id: 'ace-t34-072',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'An app’s service account gets `PERMISSION_DENIED` when it publishes to the `orders` topic. Which role should you grant, and where?',
    options: [
      'Pub/Sub Subscriber on the `orders` topic',
      'Pub/Sub Publisher on the `orders` topic',
      'Pub/Sub Viewer on the whole project',
      'Pub/Sub Editor on the whole organization'
    ],
    answer: 1,
    explanation: '`roles/pubsub.publisher` on the topic is the least privilege for publishing. Subscriber allows pulling, not publishing, Viewer is read-only, and Editor at the organization is far too broad.'
  },
  {
    id: 'ace-t34-073',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A new analytics subscription must also receive the messages published to an existing topic over the past three days. What makes that possible?',
    options: [
      'Create the subscription with a longer ack deadline, so earlier messages are included',
      'Create the subscription with exactly-once delivery, which replays the topic’s history',
      'Topic message retention covering three days, then seek the new subscription to that time',
      'Copy the other subscription’s backlog to the new subscription with a snapshot'
    ],
    answer: 2,
    explanation: 'A new subscription normally starts with messages published after it was created. If the topic retains messages, you can seek the new subscription to an earlier time and receive them. Ack deadlines and exactly-once delivery do not replay history, and a snapshot only captures the backlog another subscription had when it was taken.'
  },
  {
    id: 'ace-t34-074',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'One topic carries events for all regions, and the EU service should receive only messages with the attribute `region=eu`. What is the simplest way?',
    options: [
      'A separate topic for EU, with publishers changed to use it',
      'A Cloud Function that forwards only EU messages to the EU service',
      'A subscription with ordering, using the region as ordering key',
      'A filter on the EU subscription: `attributes.region = `eu``'
    ],
    answer: 3,
    explanation: 'A subscription filter delivers only messages whose attributes match, and Pub/Sub acknowledges the rest automatically. A filter is set when the subscription is created and cannot be changed. A second topic or a forwarding function adds work, and ordering keys do not filter.'
  },


  // ── 4 · Encryption keys ──
  {
    id: 'ace-t34-07',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Security requires customer-managed keys for a BigQuery dataset in asia-southeast2. You created a Cloud KMS key in asia-southeast2, but creating a table with that key fails with a permission error, even though you are a project Owner. What is missing?',
    options: [
      'Cloud KMS Admin for your own user account on the key ring that holds the key',
      'Cloud KMS CryptoKey Encrypter/Decrypter for the BigQuery service agent on the key',
      'A new key in the `global` location, because BigQuery cannot use regional keys',
      'Customer-supplied keys (CSEK) passed by the client with every load and query'
    ],
    answer: 1,
    explanation: 'With CMEK, the service encrypts and decrypts on your behalf, so its service agent needs Encrypter/Decrypter on the key. Your own roles do not matter for that call. The key location must match the dataset (asia-southeast2 is right), and BigQuery does not take CSEK.',
    tip: 'CMEK permission errors → the service agent, not the user.'
  },
  {
    id: 'ace-t34-08',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Developers in hundreds of projects create buckets, disks and datasets that must all use CMEK. Security wants a key created automatically for each new resource in the right location, held in a separate key project, without a ticket every time. What fits?',
    options: [
      'One CMEK key in the `global` location, shared by every resource',
      'Customer-supplied encryption keys generated by each developer',
      'The `gcp.restrictNonCmekServices` constraint on its own',
      'Cloud KMS Autokey, which creates keys on demand in a key project'
    ],
    answer: 3,
    explanation: 'Autokey provisions a key when a resource needs one, in the matching location, inside a dedicated key project, keeping separation of duties. The organization policy constraint only enforces CMEK; it creates no keys. One shared global key cannot match regional resources, and CSEK puts key handling on every developer.'
  },
  {
    id: 'ace-t34-075',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'An auditor asks whether data in Cloud Storage and on persistent disks is encrypted at rest, given that the project has no Cloud KMS keys. What is the answer?',
    options: [
      'No; data is only encrypted at rest after you create a CMEK for it',
      'Only Cloud Storage data; disks need customer-supplied keys to be encrypted',
      'Only if the organization policy for default encryption has been enforced',
      'Yes; Google encrypts all data at rest by default with Google-owned keys'
    ],
    answer: 3,
    explanation: 'All customer data at rest in Google Cloud is encrypted by default (AES-256) with keys Google manages, with no setup. CMEK, CSEK and Cloud EKM give you more control over the keys; they are not what turns encryption on.'
  },
  {
    id: 'ace-t34-076',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A regulator requires that the keys protecting a workload’s data are held in the company’s own external key manager, outside Google Cloud, and that the company can cut off access at any time. Which option fits?',
    options: [
      'Cloud External Key Manager (Cloud EKM) keys used as CMEK',
      'Cloud HSM keys, with the protection level set to HSM',
      'Customer-supplied encryption keys sent with each request',
      'Software Cloud KMS keys with a 30-day rotation period'
    ],
    answer: 0,
    explanation: 'With Cloud EKM, the key material stays in a supported external key manager and Google calls it to wrap and unwrap data keys, so revoking access there makes the data unreadable. Cloud HSM keys live in Google’s HSMs, CSEKs are supplied per request and supported by only a few services, and rotation does not move the key out of Google.'
  },
  {
    id: 'ace-t34-077',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Compliance requires keys to be generated and used only inside FIPS 140-2 Level 3 validated hardware, but the team does not want to run its own HSMs. What do you create?',
    options: [
      'A Cloud KMS key with protection level `SOFTWARE`',
      'A Cloud KMS key with protection level `HSM` (Cloud HSM)',
      'A customer-supplied key generated on a laptop',
      'A Secret Manager secret holding the key bytes'
    ],
    answer: 1,
    explanation: 'Cloud HSM keys are created and used inside Google-managed, FIPS 140-2 Level 3 HSMs, through the same Cloud KMS API. Software keys are validated at Level 1, a key from a laptop is outside any HSM, and Secret Manager stores secrets but performs no cryptography.'
  },
  {
    id: 'ace-t34-078',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Policy says every encryption key must change every 90 days, and existing data must stay readable. What do you configure on the Cloud KMS key?',
    options: [
      'A new key ring every 90 days, deleting the old key ring',
      'A 90-day scheduled destruction of the primary key version',
      'Automatic rotation with a 90-day rotation period',
      'A lifecycle rule on the key that disables it after 90 days'
    ],
    answer: 2,
    explanation: 'Automatic rotation creates a new primary version on schedule; new data uses it, and older versions stay enabled to decrypt older data. Key rings cannot be deleted, destroying or disabling versions makes data encrypted with them unreadable, and keys have no lifecycle rules.'
  },
  {
    id: 'ace-t34-079',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A key was rotated yesterday. A cleanup script now wants to destroy every non-primary key version to tidy up. What happens to data encrypted with those versions?',
    options: [
      'Nothing; Cloud KMS re-encrypts all data automatically when a key rotates',
      'It is decrypted with the new primary version, which inherits the old material',
      'It moves to Google-managed encryption until a new CMEK is assigned',
      'It becomes unreadable unless it was re-encrypted with the new version first'
    ],
    answer: 3,
    explanation: 'Rotation does not re-encrypt existing data. Data written with an older version needs that version to decrypt, so destroying it makes the data unreadable. Re-encrypt (for example rewrite objects) before destroying old versions.'
  },
  {
    id: 'ace-t34-080',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Someone scheduled the only key version used by a production database for destruction an hour ago. What can you do?',
    options: [
      'Restore the key version; it stays scheduled for destruction for 30 days by default',
      'Nothing; scheduling destruction makes the key material unusable and permanent at once',
      'Create a new key with the same name, which recovers the old key material',
      'Import the key version again from Cloud KMS’s automatic backups'
    ],
    answer: 0,
    explanation: 'A destroyed version first enters the `DESTROY_SCHEDULED` state, 30 days by default, and can be restored during that time. A new key with the same name has new material, and Cloud KMS has no customer-visible backups of key material.'
  },
  {
    id: 'ace-t34-081',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The security team must manage keys but must not be able to decrypt data. An app’s service account must encrypt and decrypt with one key but must not change it. Which roles fit?',
    options: [
      'Security team: Owner on the key project. Service account: Cloud KMS Admin on that key',
      'Security team: Cloud KMS Admin. Service account: Cloud KMS CryptoKey Encrypter/Decrypter on that key',
      'Both: Cloud KMS CryptoKey Encrypter/Decrypter on the key ring, plus Viewer',
      'Security team: Editor on the project. Service account: Cloud KMS Viewer on the key'
    ],
    answer: 1,
    explanation: 'Cloud KMS Admin can manage keys but has no permission to encrypt or decrypt, and the Encrypter/Decrypter role on one key lets the service account use it without managing it. That splits duties. Owner and Editor are basic roles that grant far too much, and Viewer cannot use a key.'
  },
  {
    id: 'ace-t34-082',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Creating a bucket in `asia-southeast2` with a CMEK fails. The key is in a key ring in `us-central1`. What do you do?',
    options: [
      'Grant the Cloud Storage service agent Cloud KMS Admin on the `us-central1` key',
      'Move the bucket to the `US` multi-region so any US key can be used',
      'Create the key in a key ring in `asia-southeast2`, matching the bucket’s location',
      'Create the key ring in the `global` location so every region can use it'
    ],
    answer: 2,
    explanation: 'Cloud Storage requires the CMEK to be in the same location as the bucket (a regional bucket needs a key in that region). Admin rights do not fix a location mismatch, moving data to the US may break residency, and `global` keys are not accepted for regional buckets.'
  },
  {
    id: 'ace-t34-083',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A running Cloud SQL instance uses Google-managed encryption. Compliance now requires CMEK for it. What do you do?',
    options: [
      'Edit the instance and select the CMEK; it re-encrypts during the next maintenance',
      'Enable CMEK on the instance’s backups; the instance then switches over',
      'Add a read replica with CMEK and keep the current instance as the primary',
      'Create a new Cloud SQL instance with CMEK and move the data into it'
    ],
    answer: 3,
    explanation: 'CMEK for Cloud SQL can only be chosen when an instance is created. You create a new CMEK instance and move the data, for example with export and import or Database Migration Service. Existing instances cannot be switched, and a replica uses the primary’s encryption setting.'
  },
  {
    id: 'ace-t34-084',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The organization wants to block anyone from creating BigQuery datasets or Cloud Storage buckets that are not protected by a CMEK. What do you use?',
    options: [
      'The organization policy constraint `gcp.restrictNonCmekServices` listing those services',
      'The constraint `gcp.restrictCmekCryptoKeyProjects` naming the central key project',
      'An IAM deny policy on `storage.buckets.create` for all users without a key',
      'A Cloud KMS key with an IAM condition that applies to all new resources'
    ],
    answer: 0,
    explanation: '`restrictNonCmekServices` requires CMEK for the listed services, so creating a resource without one is denied. `restrictCmekCryptoKeyProjects` limits which projects keys can come from but does not require CMEK, and IAM deny or conditions cannot check whether a resource uses a key.'
  },
  {
    id: 'ace-t34-085',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'All CMEKs must come from the central `kms-prod` project, so teams cannot use keys from their own projects. What do you enforce?',
    options: [
      'The organization policy constraint `gcp.restrictNonCmekServices` for all services',
      'The organization policy constraint `gcp.restrictCmekCryptoKeyProjects` allowing only `kms-prod`',
      'The Cloud KMS Admin role granted only to the security team in `kms-prod`',
      'A VPC Service Controls perimeter around the `kms-prod` project and nothing else'
    ],
    answer: 1,
    explanation: '`restrictCmekCryptoKeyProjects` limits which projects may supply CMEKs for new resources. `restrictNonCmekServices` makes CMEK mandatory but does not say where keys come from, admin roles do not stop teams creating keys in their own projects, and a perimeter controls API access.'
  },
  {
    id: 'ace-t34-086',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'An app must encrypt 5 GB files with a Cloud KMS key, but the `encrypt` API accepts at most 64 KiB of plaintext. How should the app do it?',
    options: [
      'Split each file into 64 KiB chunks and send every chunk to the Cloud KMS `encrypt` API',
      'Upload the file to Cloud KMS through a signed URL, which raises the size limit',
      'Envelope encryption: encrypt each file locally with a data key and wrap that key with Cloud KMS',
      'Store the file in Secret Manager, which encrypts large payloads with the key'
    ],
    answer: 2,
    explanation: 'Envelope encryption uses a local data encryption key (DEK) for the bulk data and Cloud KMS only to encrypt (wrap) the small DEK with the key encryption key. Chunking through the API is slow and costly, Cloud KMS has no signed upload, and Secret Manager has a 64 KiB secret limit.'
  },
  {
    id: 'ace-t34-087',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'An app needs a database password and an API token at runtime, with versioning, IAM access control and audit logs. Where should they be kept?',
    options: [
      'Cloud KMS',
      'A Cloud Storage bucket',
      'Environment variables in the build',
      'Secret Manager'
    ],
    answer: 3,
    explanation: 'Secret Manager stores secret values with versions, IAM per secret and audit logging. Cloud KMS manages keys and performs cryptographic operations but does not store your secrets, and a bucket or build variables are easy to leak.'
  },
  {
    id: 'ace-t34-088',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A default CMEK was set on a bucket last week. An audit finds that objects uploaded earlier are still encrypted with Google-managed keys. What brings them under the CMEK?',
    options: [
      'Rewrite those objects, such as with `gcloud storage objects update --encryption-key`',
      'Nothing; a default key applies to old objects at the next daily maintenance',
      'Rotate the CMEK, which re-encrypts every object in the bucket with the new version',
      'Turn on object versioning so new versions are created with the default key'
    ],
    answer: 0,
    explanation: 'A bucket’s default key applies only to objects written after it is set. Existing objects must be rewritten to be encrypted with the CMEK. Rotation affects only new writes, and versioning does not rewrite anything by itself.'
  },
  {
    id: 'ace-t34-089',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Security wants an emergency switch that makes a project’s CMEK-protected data unreadable right away, but can be undone if the alarm was false. What do they use?',
    options: [
      'Destroy the key version, and restore it within the 24-hour grace period',
      'Disable the key version, and enable it again if the alarm was false',
      'Delete the key ring, and recreate it with the same name if needed',
      'Remove the service agent’s role, and grant Cloud KMS Admin again later'
    ],
    answer: 1,
    explanation: 'Disabling a key version stops all encrypt and decrypt operations with it, and enabling it reverses that. Destruction is meant to be permanent (with a 30-day default wait, not 24 hours), key rings cannot be deleted, and Cloud KMS Admin is not a role a service agent needs to use a key.'
  },
  {
    id: 'ace-t34-090',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Policy says key material must be generated on the company’s own on-premises HSM, but the keys should then be used through Cloud KMS like any other key. What do you use?',
    options: [
      'Cloud External Key Manager, with the HSM as the external manager',
      'A customer-supplied key on each Cloud Storage request',
      'Key import, using a Cloud KMS import job to wrap and upload the key',
      'A software key created with a seed taken from the HSM'
    ],
    answer: 2,
    explanation: 'Key import lets you bring your own key material into Cloud KMS (software or HSM protection) through an import job, after which it behaves like any other key. Cloud EKM keeps the key outside Google, CSEK is passed per request, and Cloud KMS has no seeded key generation.'
  },
  {
    id: 'ace-t34-091',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'After an incident, you need to know which service accounts used a particular key to decrypt data last week. What must have been turned on?',
    options: [
      'Admin Activity audit logs for Cloud KMS',
      'VPC Flow Logs on the app subnets',
      'Access Transparency for the organization',
      'Data Access audit logs for Cloud KMS'
    ],
    answer: 3,
    explanation: 'Encrypt and decrypt calls are data access, recorded only if Data Access audit logs are enabled for Cloud KMS. Admin Activity logs cover key creation and changes, flow logs record network traffic, and Access Transparency records Google staff access.'
  },
  {
    id: 'ace-t34-092',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A project is being cleaned up, and the team wants to delete its Cloud KMS key ring and keys. What is true?',
    options: [
      'Key rings and keys cannot be deleted; destroy the key versions instead',
      'Delete the key ring with `gcloud kms keyrings delete` after disabling all keys',
      'Delete the keys first, then the key ring becomes deletable after 30 days',
      'Key rings are deleted automatically once all keys inside them are destroyed'
    ],
    answer: 0,
    explanation: 'Cloud KMS key rings and keys are permanent so their names cannot be reused, but only key versions hold key material and cost money. Destroying the versions removes the material and the cost.'
  },


  // ── 5 · Redundancy and DR ──
  {
    id: 'ace-t34-09',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An app on Cloud SQL for MySQL in asia-southeast2 must survive the loss of the whole region with an RPO of minutes and an RTO under an hour. What do you add?',
    options: [
      'The HA configuration, with a synchronous standby in a second zone',
      'Daily exports of the database to a dual-region Cloud Storage bucket',
      'A cross-region read replica in asia-southeast1, promoted on failure',
      'A larger machine type with more vCPUs and a bigger SSD'
    ],
    answer: 2,
    explanation: 'A cross-region replica is continuously updated, so the data loss is minutes, and promoting it takes minutes too. HA protects against a zone failure only, daily exports mean up to a day of lost data, and machine size has nothing to do with region failure.',
    tip: 'HA is not DR: HA = zone, cross-region replica = region.'
  },
  {
    id: 'ace-t34-10',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A dual-region bucket must copy every new object to the second region within 15 minutes to meet the DR plan’s RPO. What do you enable?',
    options: [
      'Turbo replication on the bucket',
      'Object versioning on the bucket',
      'Autoclass on the bucket',
      'A Storage Transfer Service job every 15 minutes to a second bucket'
    ],
    answer: 0,
    explanation: 'Turbo replication gives dual-region buckets a 15-minute RPO for new objects. Default replication is asynchronous with a longer target, versioning and Autoclass do not replicate anything, and a scheduled transfer job is more moving parts for a weaker guarantee.'
  },
  {
    id: 'ace-t34-093',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'The business says it can lose at most 15 minutes of data in a disaster, and the service must be running again within one hour. How are these stated as DR targets?',
    options: [
      'RPO of 15 minutes and RTO of one hour',
      'RTO of 15 minutes and RPO of one hour',
      'SLO of 15 minutes and SLA of one hour',
      'MTTR of 15 minutes and MTBF of one hour'
    ],
    answer: 0,
    explanation: 'Recovery point objective (RPO) is how much data, measured in time, you can afford to lose. Recovery time objective (RTO) is how long you can be down. SLOs, SLAs, MTTR and MTBF measure availability and repair, not DR targets.',
    tip: 'RPO = data lost (point in time) · RTO = time to recover.'
  },
  {
    id: 'ace-t34-094',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A self-managed database runs on a single Compute Engine VM. It must survive a zone outage with no data loss, and you can fail over to a standby VM in a second zone. What disk setup fits?',
    options: [
      'A zonal SSD Persistent Disk with snapshots every hour stored in a multi-region',
      'A regional disk (regional Persistent Disk or Hyperdisk Balanced HA), force-attached to the standby',
      'A Local SSD on each VM, with the database copying files to the other VM',
      'A zonal Hyperdisk Extreme disk, with asynchronous replication to another region'
    ],
    answer: 1,
    explanation: 'A regional disk is replicated synchronously across two zones, so after a zone failure you force-attach it to a VM in the other zone with no data loss. Hourly snapshots and asynchronous replication can lose recent writes, and Local SSD data does not survive the VM.'
  },
  {
    id: 'ace-t34-095',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Every disk of a fleet must be snapshotted daily at 02:00, with snapshots kept for 14 days and removed automatically. What do you use?',
    options: [
      'A Cloud Scheduler job running `gcloud compute disks snapshot`',
      'An instance template that includes a nightly snapshot setting',
      'A snapshot schedule (resource policy) attached to each disk',
      'A Cloud Storage lifecycle rule on the snapshot bucket'
    ],
    answer: 2,
    explanation: 'Snapshot schedules create snapshots on a timetable and apply a retention policy, so old ones are removed automatically. A Scheduler job needs extra cleanup logic, templates have no snapshot setting, and snapshots are not stored in a bucket you manage.'
  },
  {
    id: 'ace-t34-096',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The primary region is down, and you must rebuild a disk from last night’s snapshot in another region. What is true?',
    options: [
      'Snapshots are regional, so you must first copy it to the new region',
      'Snapshots only restore in the source zone, so you must wait for the region',
      'Snapshots must be exported as images before they can cross regions',
      'Snapshots are global resources, so you can create a disk from it in any region'
    ],
    answer: 3,
    explanation: 'Disk snapshots are global resources, stored by default in a multi-region (or a location you choose), and you can create a disk from one in any zone. Nothing needs to be copied or converted first.'
  },
  {
    id: 'ace-t34-097',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'For DR, you want one backup that captures a VM’s configuration, metadata and all of its attached disks, so you can recreate the whole VM. What do you create?',
    options: [
      'A machine image',
      'A disk snapshot',
      'A custom image',
      'An instance template'
    ],
    answer: 0,
    explanation: 'A machine image stores the VM’s properties, metadata, permissions and the data of every attached disk. A snapshot covers one disk, a custom image is a boot disk for new VMs, and an instance template holds configuration but no disk data.'
  },
  {
    id: 'ace-t34-098',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A stateless web tier on a managed instance group must keep serving if any single zone in the region fails, and replace crashed VMs automatically. What do you use?',
    options: [
      'A zonal MIG with autoscaling set to a high maximum of instances',
      'A regional MIG across three zones, with an autohealing health check',
      'A zonal MIG in each zone, each behind its own external IP address',
      'An unmanaged instance group with VMs placed in different zones'
    ],
    answer: 1,
    explanation: 'A regional MIG spreads instances across zones and recreates them if a zone fails, and autohealing replaces VMs that fail a health check. A single zonal MIG still dies with its zone, separate IPs need manual failover, and unmanaged groups do not heal or recreate VMs.'
  },
  {
    id: 'ace-t34-099',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An internal tool has an RTO of 24 hours and an RPO of 24 hours, and the budget is minimal. Which DR pattern fits?',
    options: [
      'Warm: a scaled-down copy of the stack running in a second region at all times',
      'Hot: active-active in two regions behind a global load balancer',
      'Cold: daily backups to another region and a rebuild from IaC after a disaster',
      'Pilot light: databases replicating live, with app servers ready to start'
    ],
    answer: 2,
    explanation: 'Generous RTO and RPO allow the cheapest pattern: back up regularly and rebuild only when needed. Warm, pilot light and hot keep resources running in the second region, which costs more than this tool’s targets justify.'
  },
  {
    id: 'ace-t34-100',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A customer portal needs an RTO under one hour and an RPO of minutes, but the company cannot afford full capacity in two regions. Which pattern fits?',
    options: [
      'Cold: weekly backups copied to Cloud Storage in a second region, restored on demand',
      'Hot: full active-active capacity in both regions all the time',
      'Single region with a regional MIG and an HA Cloud SQL instance',
      'Warm standby: data replicated live and a small copy of the app running in the second region'
    ],
    answer: 3,
    explanation: 'Warm standby replicates data continuously (RPO minutes) and keeps a scaled-down app ready to scale up (RTO under an hour), at lower cost than hot. Weekly backups miss the RPO, hot is ruled out by budget, and a single region does not survive a regional outage.'
  },
  {
    id: 'ace-t34-101',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A ransomware review finds that an attacker with project owner rights could delete all VM and database backups. Backups must be immutable and undeletable until their retention expires. What do you use?',
    options: [
      'Backup and DR Service, storing backups in a backup vault with enforced retention',
      'Snapshot schedules in the same project, with a 30-day retention policy',
      'Cloud Storage soft delete on the bucket where database exports are written',
      'Machine images copied every day to a second project owned by the same team'
    ],
    answer: 0,
    explanation: 'Backup and DR Service backup vaults keep backups immutable and indelible for their enforced minimum retention, even for privileged users. Snapshots and machine images can be deleted by owners, and soft delete only keeps deleted objects for a short time.'
  },
  {
    id: 'ace-t34-102',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Three days ago a job deleted thousands of rows from a BigQuery table by mistake. The dataset uses the default settings. How do you get the rows back?',
    options: [
      'Restore the dataset from the last Cloud Storage export, which runs daily by default',
      'Query the table `FOR SYSTEM_TIME AS OF` a time before the delete and save the result',
      'Open a support case to recover the rows from the fail-safe period',
      'Nothing; BigQuery deletes are permanent unless a snapshot exists'
    ],
    answer: 1,
    explanation: 'BigQuery time travel lets you query a table as it was at any point in the window, 7 days by default, and write the result to a table. There is no default export, and fail-safe (the 7 days after time travel) is only for Google-assisted recovery after the window.'
  },
  {
    id: 'ace-t34-103',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Auditors want a read-only copy of a BigQuery table as of the last day of every month, kept for a year. Time travel only covers seven days. What do you use?',
    options: [
      'A table clone each month, kept in the same dataset',
      'A daily copy of the table into a new dataset',
      'A table snapshot each month, with a 365-day expiration',
      'A materialized view refreshed on the first of each month'
    ],
    answer: 2,
    explanation: 'A table snapshot is a read-only, cheap point-in-time copy that can have an expiration time. A clone is writable, daily copies cost full storage each time, and a materialized view reflects current data rather than a frozen past state.'
  },
  {
    id: 'ace-t34-104',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Cloud SQL keeps seven automated backups by default. Policy now requires 30 days of backups, stored outside the instance’s region. What do you change?',
    options: [
      'Create a read replica in another region and keep it for 30 days',
      'Schedule a daily export to Cloud Storage with a 30-day lifecycle rule',
      'Take an on-demand backup every day and copy it with Storage Transfer',
      'Set retained backups to 30 and choose a custom backup location in another region'
    ],
    answer: 3,
    explanation: 'Cloud SQL lets you raise the number of retained automated backups (up to 365) and set a custom backup location. A replica is not a backup, exports are a separate process to maintain, and on-demand backups cannot be copied with Storage Transfer.'
  },
  {
    id: 'ace-t34-105',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Disks of a critical VM in `asia-southeast2` must be replicated to `asia-southeast1` for DR with an RPO under one minute, without changing the application. What do you use?',
    options: [
      'Persistent Disk Asynchronous Replication to a secondary disk in the second region',
      'A regional Persistent Disk spanning the two regions with synchronous writes',
      'A snapshot schedule every minute, stored in the `asia` multi-region',
      'A machine image every hour copied into the second region'
    ],
    answer: 0,
    explanation: 'Asynchronous Replication copies a disk to another region with an RPO typically under a minute, and you fail over to the secondary disk. Regional disks span two zones, not regions, snapshots cannot run every minute, and hourly images miss the RPO.'
  },
  {
    id: 'ace-t34-106',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Static assets must stay readable during a full regional outage, with no change to bucket names or URLs in the app. What do you use?',
    options: [
      'A regional bucket, plus a nightly copy to another region',
      'A dual-region or multi-region bucket',
      'Two regional buckets with DNS failover',
      'A regional bucket fronted by Cloud CDN'
    ],
    answer: 1,
    explanation: 'Dual-region and multi-region buckets store data in more than one region under one bucket name, so reads keep working when a region is down. A second bucket has a different name and lags behind, and Cloud CDN only serves objects that are already cached.'
  },
  {
    id: 'ace-t34-107',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A VM running a long batch job must stay up when Google performs host maintenance, and come back by itself if it crashes. Which availability policy fits?',
    options: [
      'On host maintenance: `TERMINATE`; automatic restart: off',
      'Provisioning model: Spot; automatic restart: on',
      'On host maintenance: `MIGRATE`; automatic restart: on',
      'Provisioning model: Standard; deletion protection: on'
    ],
    answer: 2,
    explanation: 'Live migration moves the VM to another host during maintenance without a reboot, and automatic restart brings it back after a crash. `TERMINATE` stops the VM for maintenance, Spot VMs can be preempted at any time, and deletion protection only blocks deletion.'
  },
  {
    id: 'ace-t34-108',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A GKE cluster’s control plane must keep working if one zone fails, so deployments can continue during an outage. What kind of cluster do you create?',
    options: [
      'A zonal cluster, with node pools spread over several zones',
      'A zonal cluster, with node auto-repair turned on',
      'A zonal cluster, with a second cluster ready to restore',
      'A regional cluster, with control plane replicas in several zones'
    ],
    answer: 3,
    explanation: 'A regional cluster runs control plane replicas across zones in the region, so it survives a zone failure. A multi-zonal cluster has nodes in several zones but a single-zone control plane, and auto-repair heals nodes, not the control plane.'
  },
  {
    id: 'ace-t34-109',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A Filestore share holds files that a team edits all day. They need daily point-in-time copies that can be restored to a new instance if the original is lost. What do you use?',
    options: [
      'Filestore backups, scheduled daily',
      'Persistent Disk snapshots of the share',
      'Cloud Storage soft delete on the share',
      'Object versioning on the Filestore instance'
    ],
    answer: 0,
    explanation: 'Filestore backups are copies of a share stored separately, which can be restored to a new instance. Filestore is not a Persistent Disk you can snapshot, and soft delete and versioning are Cloud Storage features.'
  },
  {
    id: 'ace-t34-110',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'The team has nightly backups and a written DR plan, but has never restored anything. Management asks how they know the one-hour RTO can be met. What should they do?',
    options: [
      'Raise backup frequency from nightly to hourly to lower the RTO',
      'Run regular DR drills that restore into the second region and time them',
      'Buy a higher support tier so Google guarantees the recovery time',
      'Add a second copy of every backup to another storage class'
    ],
    answer: 1,
    explanation: 'Only an actual restore test shows whether the RTO is realistic and the plan works. Backup frequency affects RPO, support plans do not run your recovery, and more copies prove nothing about the recovery time.'
  },


  // ── 6 · VPC, subnets, IPs and routes ──
  {
    id: 'ace-t34-11',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Subnet `web-jkt` is `10.10.0.0/24` and almost full. The next subnet in the VPC, `app-jkt`, is `10.10.4.0/24`. You want the most room for `web-jkt` with one `gcloud compute networks subnets expand-ip-range` command. Which prefix length works?',
    options: [
      '`--prefix-length=21`, to get the most addresses in one change',
      '`--prefix-length=22`, because 10.10.0.0/22 ends at 10.10.3.255',
      '`--prefix-length=25`, then add a second primary range',
      'None: the subnet must be deleted and recreated as a /22'
    ],
    answer: 1,
    explanation: 'Expanding to /22 gives 10.10.0.0–10.10.3.255, which contains the old range and stops just before `app-jkt`. A /21 (10.10.0.0–10.10.7.255) would overlap `app-jkt` and fail. /25 is smaller, and subnets can never shrink. Expansion happens in place, with no downtime.'
  },
  {
    id: 'ace-t34-12',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A VPC has the default route `0.0.0.0/0` to the internet gateway (priority 1000) and a custom route `0.0.0.0/0` to an internal passthrough Network Load Balancer of firewall appliances (priority 800, tag `inspected`). A VM without any network tags sends traffic to the internet. Which route does it use?',
    options: [
      'The appliance route, because priority 800 is a lower number than 1000 and wins',
      'Both routes, because equal prefixes share the traffic through ECMP hashing',
      'Neither route, so the traffic is dropped by the implied deny egress rule',
      'The default route, since the tagged route covers only VMs tagged `inspected`'
    ],
    answer: 3,
    explanation: 'A route with network tags applies only to VMs that carry one of those tags. For the untagged VM only the default route matches. For a VM tagged `inspected`, both routes have the same prefix, so the lower priority number (800) would win.'
  },
  {
    id: 'ace-t34-111',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'You create a subnet with the range `10.20.0.0/28`. How many addresses can VMs use?',
    options: [
      '14',
      '12',
      '16',
      '11'
    ],
    answer: 1,
    explanation: 'A /28 holds 16 addresses, and Google Cloud reserves four in every primary range: the network address, the default gateway (the second address), the second-to-last address and the broadcast address. That leaves 12 for VMs.',
    tip: 'Usable = range size − 4.'
  },
  {
    id: 'ace-t34-112',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A new project still has the auto mode `default` network. Its ranges in `10.128.0.0/9` overlap the on-premises `10.140.0.0/16`, and HA VPN to on-premises is next. What is the best plan?',
    options: [
      'Convert the default network to custom mode, which renumbers its subnets automatically',
      'Keep the default network and filter the overlapping routes on the Cloud Router',
      'Create a custom mode VPC with planned, non-overlapping ranges and build the VPN on it',
      'Expand every auto mode subnet so it no longer collides with the on-premises range'
    ],
    answer: 2,
    explanation: 'Auto mode creates a subnet in every region from `10.128.0.0/9`, so on-premises routes in that block collide. A custom mode VPC lets you choose ranges that do not overlap. Converting to custom mode keeps the existing ranges, route filtering hides the conflict without fixing it, and expansion makes overlap worse.'
  },
  {
    id: 'ace-t34-113',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A VPC-native GKE cluster needs separate IP ranges for its Pods and Services within the node subnet. What do you add to the subnet?',
    options: [
      'Two more primary ranges, one each for the Pods and the Services',
      'A second VPC peered with the first, holding the Pod and Service ranges',
      'Two static internal addresses reserved for the Pod and Service networks',
      'Two secondary IP ranges, used as alias IP ranges for Pods and Services'
    ],
    answer: 3,
    explanation: 'VPC-native clusters take Pod and Service IPs from secondary ranges on the node subnet, assigned as alias IP ranges. A subnet has only one primary range, and peering or single static addresses do not provide Pod ranges.'
  },
  {
    id: 'ace-t34-114',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'VMs without external IP addresses in `subnet-app` must read objects from Cloud Storage through its public API names. Outbound internet access is not allowed. What do you enable?',
    options: [
      'Private Google Access on `subnet-app`',
      'A Cloud NAT gateway for `subnet-app`',
      'An external IP on each VM',
      'VPC peering with Google’s API network'
    ],
    answer: 0,
    explanation: 'Private Google Access lets VMs with only internal IPs reach Google APIs and services. Cloud NAT would give general internet access, which is not allowed, and there is no VPC peering with Google for APIs.'
  },
  {
    id: 'ace-t34-115',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A database VM’s internal IP must never change, even if the VM is deleted and recreated. What do you do?',
    options: [
      'Set the VM’s hostname to its current internal IP address',
      'Reserve a static internal IP address and assign it to the VM',
      'Create the VM with an ephemeral internal IP and no other setting',
      'Use a /32 subnet so only one address can be handed out there'
    ],
    answer: 1,
    explanation: 'A reserved static internal address stays in the project until released and can be given to a new VM. An ephemeral address is released when the VM is deleted, the hostname does not reserve anything, and the smallest subnet is /29.'
  },
  {
    id: 'ace-t34-116',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A VM’s ephemeral external IP is allowlisted by a partner. You need to stop the VM for maintenance without losing that address. What do you do first?',
    options: [
      'Take a machine image so the IP is saved with the VM’s settings',
      'Set the VM’s deletion protection so the IP is not released',
      'Promote the ephemeral external IP to a static external address',
      'Change the network tier to Standard so the address is kept'
    ],
    answer: 2,
    explanation: 'An ephemeral external IP is released when the VM stops, so promoting it to static keeps that exact address. Machine images and deletion protection do not reserve IPs, and the network tier does not change whether an address is kept.'
  },
  {
    id: 'ace-t34-117',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A Cloud Router in `us-east1` learns on-premises routes over HA VPN. VMs in the same VPC’s `europe-west1` subnet cannot reach on-premises, while VMs in `us-east1` can. What do you change?',
    options: [
      'Create another HA VPN gateway in `europe-west1`',
      'Add static routes in `europe-west1` with priority 0',
      'Enable Private Google Access in the Europe subnet',
      'Set the VPC’s dynamic routing mode to global'
    ],
    answer: 3,
    explanation: 'With regional dynamic routing, routes a Cloud Router learns apply only to its own region. Global routing mode makes them usable from all regions of the VPC. A second VPN works but is unnecessary, static routes add upkeep, and Private Google Access is unrelated.'
  },
  {
    id: 'ace-t34-118',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'A VPC has a route `10.0.0.0/8` to a VPN tunnel with priority 100 and a route `10.1.0.0/16` to an appliance with priority 1000. Which next hop is used for a packet to `10.1.2.3`?',
    options: [
      'The appliance, because the most specific prefix is chosen first',
      'The VPN tunnel, because priority 100 beats priority 1000',
      'Both, with traffic split by ECMP between the next hops',
      'Neither, because overlapping routes are rejected'
    ],
    answer: 0,
    explanation: 'Route selection picks the longest matching prefix first; priority only breaks ties between routes with the same prefix length. `10.1.0.0/16` is more specific than `/8`, so the appliance wins. ECMP applies only to routes with the same prefix and priority.',
    tip: 'Longest prefix first, then priority.'
  },
  {
    id: 'ace-t34-119',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A firewall appliance VM must sit between three VPCs, routing traffic between them. What do you configure?',
    options: [
      'Three VMs, one per VPC, connected to each other through VPC peering',
      'A VM with three NICs, each in a different VPC, and IP forwarding on',
      'One NIC in a Shared VPC, with alias IPs from each of the three VPCs',
      'One NIC in the first VPC, and routes to the other VPCs’ ranges'
    ],
    answer: 1,
    explanation: 'A multi-NIC VM can have each interface in a different VPC (set when the VM is created), and `--can-ip-forward` lets it pass traffic that is not addressed to itself. Peering does not insert an appliance, alias IPs come from one subnet’s VPC, and one NIC cannot reach unconnected VPCs.'
  },
  {
    id: 'ace-t34-120',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A workload uses large packets and the team wants jumbo frames inside the VPC. What is the VPC’s default MTU, and what can it be raised to?',
    options: [
      'The default is 1500 bytes, and it cannot be changed at all',
      'The default is 9000 bytes, and it is already set for jumbo frames',
      'The default is 1460 bytes, and it can be set as high as 8896',
      'The default is 1280 bytes, and it can only be raised to 1500'
    ],
    answer: 2,
    explanation: 'New VPCs default to an MTU of 1460 bytes, and you can set it from 1300 up to 8896 bytes. All VMs in the VPC should use the same MTU.'
  },
  {
    id: 'ace-t34-121',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A subnet was created as `10.30.0.0/20`, but the plan says it should be `/24`. It has no VMs yet. What do you do?',
    options: [
      'Run `gcloud compute networks subnets expand-ip-range` with `/24`',
      'Edit the subnet’s range in the console to `10.30.0.0/24`',
      'Add a /24 secondary range and mark it as the primary',
      'Delete the subnet and create it again as a /24'
    ],
    answer: 3,
    explanation: 'A subnet’s primary range can be expanded but never shrunk, so a smaller range means recreating the subnet. `expand-ip-range` only accepts a shorter prefix, and secondary ranges cannot replace the primary.'
  },
  {
    id: 'ace-t34-122',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'A VPC has `subnet-a` in `asia-southeast2` and `subnet-b` in `us-central1`. The team plans an HA VPN between them so VMs can talk. What do you tell them?',
    options: [
      'Not needed; a VPC is global, so its subnets reach each other by internal IP',
      'Needed; subnets in different regions can only connect through Cloud VPN',
      'Not needed if both subnets are first moved into the same region',
      'Needed unless VPC peering is set up between the two subnets'
    ],
    answer: 0,
    explanation: 'A VPC network is a global resource, and subnet routes let VMs in any region of it talk over internal IPs with no VPN or peering, subject to firewall rules. Peering connects different VPCs, not subnets in one VPC.'
  },
  {
    id: 'ace-t34-123',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Security wants VMs to reach Google APIs through an internal IP inside the VPC, such as `10.255.255.254`, rather than Google’s public API addresses. What do you create?',
    options: [
      'Private Google Access on every subnet, with the address set as a custom route',
      'A Private Service Connect endpoint for Google APIs with that internal address',
      'A private services access range for `servicenetworking.googleapis.com`',
      'A Cloud NAT gateway whose address is set to `10.255.255.254`'
    ],
    answer: 1,
    explanation: 'A Private Service Connect endpoint for Google APIs is a global internal address in your VPC that forwards to Google APIs, and you point DNS at it. Private Google Access uses Google’s public addresses, private services access is for producer services such as Cloud SQL, and NAT uses external addresses.'
  },
  {
    id: 'ace-t34-124',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'VMs in a subnet must get public IPv6 addresses as well as their IPv4 addresses. What do you change on the subnet?',
    options: [
      'Add an IPv6 secondary range and assign it to the VMs as alias IPs',
      'Set the stack type to IPv6-only and keep the IPv4 range unused',
      'Set the stack type to dual-stack (`IPV4_IPV6`) with external IPv6 access',
      'Create a Cloud NAT gateway with NAT64 for that subnet'
    ],
    answer: 2,
    explanation: 'A dual-stack subnet with external IPv6 access gives VMs a public IPv6 address alongside IPv4. Secondary ranges are IPv4 only, an IPv6-only subnet removes IPv4, and NAT64 lets IPv6-only VMs reach IPv4 destinations rather than giving them public IPv6.'
  },
  {
    id: 'ace-t34-125',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'To block internet access, security deleted the `0.0.0.0/0` default route. Now private VMs in a subnet with Private Google Access can no longer reach `storage.googleapis.com` through `private.googleapis.com`. What restores API access without opening the internet?',
    options: [
      'Recreate `0.0.0.0/0` to the default internet gateway, with priority 65535',
      'Turn off Private Google Access, then turn it on again for the subnet',
      'Add a route for `0.0.0.0/0` to a VPN tunnel with priority 1000',
      'Add a route for `199.36.153.8/30` to the default internet gateway, and point DNS at it'
    ],
    answer: 3,
    explanation: 'Private Google Access still needs a route to the default internet gateway for the API addresses it uses. A route for the `private.googleapis.com` range (`199.36.153.8/30`) with DNS pointing API names there restores access while other internet destinations stay unroutable.'
  },
  {
    id: 'ace-t34-126',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The organization does not want the auto mode `default` network created in any new project. What do you set?',
    options: [
      'The organization policy constraint `compute.skipDefaultNetworkCreation`',
      'An IAM deny policy on `compute.networks.create` for all users',
      'A Cloud Asset Inventory feed that deletes every default network',
      'The constraint `compute.vmExternalIpAccess` set to deny all'
    ],
    answer: 0,
    explanation: '`compute.skipDefaultNetworkCreation` stops new projects from getting the default network. Denying network creation would block custom VPCs too, deleting after the fact leaves a window, and `vmExternalIpAccess` controls external IPs on VMs.'
  },
  {
    id: 'ace-t34-127',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'An enterprise has used up its RFC 1918 space across on-premises and cloud. It needs a large new range for a VPC that will not clash with anything. Which range can a VPC subnet use?',
    options: [
      '`169.254.0.0/16`, the link-local range used by Cloud Router',
      '`100.64.0.0/10`, the shared address space that VPC subnets accept',
      '`127.0.0.0/8`, since loopback space is never routed',
      '`224.0.0.0/4`, since multicast space is otherwise unused'
    ],
    answer: 1,
    explanation: 'VPC subnets accept RFC 6598 shared address space (`100.64.0.0/10`) and several other non-RFC 1918 ranges, and privately used public IPs too. Link-local, loopback and multicast ranges are not valid subnet ranges.',
    tip: 'Valid non-RFC 1918 choice: `100.64.0.0/10`.'
  },
  {
    id: 'ace-t34-128',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Containers on one VM each need their own IP address from the VPC, routable without NAT, without adding NICs. What do you use?',
    options: [
      'A static external IP address for each of the containers',
      'One NIC per container, each NIC in the same VPC',
      'Alias IP ranges on the VM’s NIC, taken from the subnet',
      'Cloud NAT, with one NAT address per container'
    ],
    answer: 2,
    explanation: 'Alias IP ranges assign extra internal IPs (from the primary or a secondary range) to one NIC, so each container gets a routable VPC address. External IPs are public, a VM can have only one NIC per VPC, and NAT hides containers behind shared addresses.'
  },


  // ── 7 · Firewall rules and Cloud NGFW ──
  {
    id: 'ace-t34-13',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'An organization-level hierarchical firewall policy has a rule at priority 100 that denies tcp:3389 from `0.0.0.0/0`. A project team adds a VPC firewall rule at priority 0 that allows tcp:3389 from its office range. What happens to RDP from the office?',
    options: [
      'Blocked: the hierarchical policy is evaluated first, and its deny ends evaluation',
      'Allowed: priority 0 is the highest priority there is, so it beats priority 100',
      'Allowed: the office source range is more specific than 0.0.0.0/0, so it wins',
      'Blocked only while Firewall Rules Logging is enabled on the org policy rule'
    ],
    answer: 0,
    explanation: 'Hierarchical policies are evaluated before the network’s own rules, and an allow or deny there stops evaluation. Priorities only compare rules within one policy or level. To let lower levels decide, the org rule would need `goto_next`.'
  },
  {
    id: 'ace-t34-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'An allow rule at priority 1000 lets VMs tagged `web` reach VMs tagged `app` on tcp:8080. Everything else to the app tier on 8080 is stopped by the implied deny, and security wants those blocked attempts to appear in Firewall Rules Logging. What do you add?',
    options: [
      'Logging on the implied deny ingress rule',
      'A deny rule for tcp:8080 at priority 500 with `--enable-logging`',
      'A deny rule for tcp:8080 at priority 2000 with `--enable-logging`',
      'Firewall Insights for the project'
    ],
    answer: 2,
    explanation: 'Implied rules cannot be logged, so an explicit deny with logging is needed. It must sit below the allow rule (a higher number such as 2000) so web traffic is still allowed first. At 500 it would block the web VMs too. Firewall Insights analyses rules; it does not log connections. This is the `deny-app` rule from MD4-LAB01.'
  },
  {
    id: 'ace-t34-129',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'An ingress rule allows tcp:443 from the internet to VMs tagged `web`. There are no egress rules besides the implied ones. Do the responses to those requests need an egress rule?',
    options: [
      'Yes; an egress rule for tcp:443 to `0.0.0.0/0` must be added for replies',
      'Yes; an egress rule for high ports 1024–65535 must be added for replies',
      'No; VPC firewall rules are stateful, so replies to allowed traffic are allowed',
      'No; but only because the VM tagged `web` also has an external IP address'
    ],
    answer: 2,
    explanation: 'Firewall rules track connections, so return traffic for an allowed connection is permitted in the other direction. The implied egress allow does not matter here, and the external IP has nothing to do with it.'
  },
  {
    id: 'ace-t34-130',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Admins connect to private VMs with IAP TCP forwarding, and SSH times out. Which ingress rule do you add?',
    options: [
      'Allow tcp:22 from `0.0.0.0/0`',
      'Allow tcp:443 from `35.235.240.0/20`',
      'Allow tcp:22 from `130.211.0.0/22`',
      'Allow tcp:22 from `35.235.240.0/20`'
    ],
    answer: 3,
    explanation: 'IAP TCP forwarding connects from the range `35.235.240.0/20`, so the rule must allow that source on the target port, 22 for SSH. Opening SSH to the whole internet defeats the point of IAP, 443 is the wrong port, and `130.211.0.0/22` is a health check range.',
    tip: 'IAP = `35.235.240.0/20`.'
  },
  {
    id: 'ace-t34-131',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'A new external Application Load Balancer shows every backend as UNHEALTHY, but the app answers when tested from inside the VPC. Which ingress rule is missing?',
    options: [
      'Allow the health check port from `130.211.0.0/22` and `35.191.0.0/16`',
      'Allow the health check port from `35.235.240.0/20` only',
      'Allow tcp:80 from the load balancer’s external IP address',
      'Allow all protocols from `0.0.0.0/0` to the backend VMs'
    ],
    answer: 0,
    explanation: 'Google’s health check probes come from `130.211.0.0/22` and `35.191.0.0/16`, so the backends must allow them on the health check port. `35.235.240.0/20` is IAP, the forwarding rule’s IP is not the source of probes, and opening everything is far too broad.'
  },
  {
    id: 'ace-t34-132',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Firewall rules target VMs by network tag. Developers with Compute Instance Admin keep adding the `db` tag to their VMs to get database access. How do you stop that?',
    options: [
      'Rename the tag to something hard to guess and keep it out of the docs',
      'Target rules by service account, since using an account requires its own permission',
      'Set an IAM deny policy on `compute.instances.get` for the developers',
      'Raise the priority of the rule so tags added later are ignored'
    ],
    answer: 1,
    explanation: 'Anyone who can edit an instance can change its network tags, so tags are not a security boundary. Targeting by service account means a VM must run as that account, which needs `iam.serviceAccountUser` on it. A secret name is not a control, and priority does not care when a tag was added.'
  },
  {
    id: 'ace-t34-133',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Two VPC firewall rules have the same priority, 1000: one allows tcp:22 from `10.0.0.0/8`, the other denies tcp:22 from `10.1.0.0/16`. What happens to SSH from `10.1.5.5`?',
    options: [
      'It is allowed; the rule with the wider range wins',
      'It is allowed; the rule created first takes effect',
      'It is denied; when priorities are equal, deny wins',
      'It depends on which rule appears first in the list'
    ],
    answer: 2,
    explanation: 'Both rules match. When matching rules share a priority, a deny rule takes precedence over an allow rule. Range size and creation order do not matter.'
  },
  {
    id: 'ace-t34-134',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'You created a custom mode VPC and a VM in it, but you cannot SSH to the VM from anywhere. Why?',
    options: [
      'Custom VPCs block port 22 at the platform level for all VMs',
      'The VM needs a network tag before any traffic can reach it',
      'SSH only works on the default network until IAP is enabled',
      'Custom VPCs start with only the implied rules, so all ingress is denied'
    ],
    answer: 3,
    explanation: 'Every VPC has an implied deny-all ingress and allow-all egress rule. The `default-allow-ssh` and similar rules exist only in the default network, so a custom VPC needs you to add an ingress rule. Port 22 is not blocked by Google, and tags are optional.'
  },
  {
    id: 'ace-t34-135',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'After years of changes, a VPC has 400 firewall rules. You suspect many are never matched or are fully covered by higher-priority rules. What helps you find them?',
    options: [
      'Firewall Insights, which reports shadowed and unused rules',
      'VPC Flow Logs, filtered by each rule’s name over a month',
      'Connectivity Tests, run once for every one of the 400 rules',
      'Cloud Asset Inventory, exporting the rules to BigQuery'
    ],
    answer: 0,
    explanation: 'Firewall Insights (part of Network Intelligence Center) analyses rules and logs to flag shadowed, overly permissive and unused rules. Flow logs do not name rules, running a test per rule is slow and incomplete, and an asset export lists rules without saying whether they are used.'
  },
  {
    id: 'ace-t34-136',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Private VMs may reach Google APIs through `private.googleapis.com` (`199.36.153.8/30`) but nothing else on the internet. Which egress rules do this?',
    options: [
      'Deny egress to `0.0.0.0/0` at priority 1000, and allow egress to `199.36.153.8/30` at 65000',
      'Allow egress to `199.36.153.8/30` at priority 1000, and deny egress to `0.0.0.0/0` at 65000',
      'Allow egress to `199.36.153.8/30` only, relying on the implied egress deny',
      'Deny ingress from `0.0.0.0/0` at priority 0, and allow ingress from `199.36.153.8/30`'
    ],
    answer: 1,
    explanation: 'The allow must have a higher priority (a smaller number) than the broad deny so it is evaluated first. The implied egress rule allows everything, so there is no implied deny to rely on, and ingress rules do not control outbound traffic.'
  },
  {
    id: 'ace-t34-137',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'An org-level hierarchical policy should not decide tcp:443; each VPC’s own rules should. What action does the org rule for tcp:443 use?',
    options: [
      '`allow`',
      '`deny`',
      '`goto_next`',
      '`apply_security_profile_group`'
    ],
    answer: 2,
    explanation: '`goto_next` passes evaluation down to the next level (a lower policy or the VPC’s rules), so the VPC decides. `allow` and `deny` end evaluation at the org level, and `apply_security_profile_group` sends traffic for inspection.'
  },
  {
    id: 'ace-t34-138',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'A hierarchical firewall policy is associated with the `prod` folder. A project is moved from `prod` to the `sandbox` folder. What happens to its traffic?',
    options: [
      'The `prod` policy keeps applying, since it was in force when the VMs were made',
      'Both folders’ policies apply until the project is detached and reattached',
      'Nothing changes until the VMs in the project have been restarted',
      'The `prod` policy no longer applies; policies on `sandbox` and above now do'
    ],
    answer: 3,
    explanation: 'Hierarchical policies apply to the resources under the node they are associated with, so the project now inherits from `sandbox` and the organization. The change takes effect without restarting VMs.'
  },
  {
    id: 'ace-t34-139',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Security wants firewall targets that only an approved group can attach to VMs, controlled by IAM rather than by anyone who can edit an instance. What do you use?',
    options: [
      'Secure tags in a network firewall policy, with tag user rights granted only to that group',
      'Network tags in VPC firewall rules, documented in a team wiki that lists approved VMs',
      'Instance labels in VPC firewall rules, with a label policy',
      'Target service accounts in VPC rules, with every VM using one account'
    ],
    answer: 0,
    explanation: 'Secure tags (Resource Manager tags with the firewall purpose) are IAM-controlled: binding one to a VM needs the tag user role. Network tags can be changed by any instance editor, labels are not firewall targets, and one shared account removes the separation you wanted.'
  },
  {
    id: 'ace-t34-140',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'VMs must call `api.partner.com`, whose IP addresses change often, and no other external host. How do you allow it in a network firewall policy?',
    options: [
      'An egress allow rule with today’s IPs, updated by a script every hour',
      'An egress allow rule using an FQDN object for `api.partner.com`',
      'An egress allow rule to `0.0.0.0/0` with the tag `partner`',
      'An ingress allow rule from the partner’s current CIDR block'
    ],
    answer: 1,
    explanation: 'FQDN objects in network firewall policies (Cloud NGFW Standard) resolve the name through Cloud DNS and keep the rule in step with the addresses. A scripted list lags behind, allowing `0.0.0.0/0` opens everything, and ingress rules do not control outbound calls.'
  },
  {
    id: 'ace-t34-141',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'A company is required to block inbound traffic to its VMs from certain countries, at the VPC level. What do you use?',
    options: [
      'A list of each country’s IP ranges in a VPC firewall rule',
      'Cloud NAT rules that drop sessions from those countries',
      'Geolocation objects in an ingress rule of a network firewall policy',
      'Cloud DNS response policies for clients in those countries'
    ],
    answer: 2,
    explanation: 'Network firewall policy rules (Cloud NGFW Standard) can match source geolocations by country code. Hand-maintained country ranges go stale, Cloud NAT handles outbound traffic, and DNS policies do not filter packets. For load-balanced apps, Cloud Armor offers the same at the edge.'
  },
  {
    id: 'ace-t34-142',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Security wants to block traffic to and from IP addresses known for malware and botnets, with the lists kept up to date by Google. What do you use?',
    options: [
      'A deny rule with addresses copied from public blocklists each week',
      'Cloud Armor rules attached to every VM in the network',
      'VPC Flow Logs with an alert on suspicious source addresses',
      'Google Threat Intelligence lists in network firewall policy rules'
    ],
    answer: 3,
    explanation: 'Cloud NGFW Standard can match Google-maintained threat intelligence lists such as known malicious IPs and Tor exit nodes. Copied lists go stale, Cloud Armor attaches to load balancer backends rather than VMs, and logs only report traffic after it happens.'
  },
  {
    id: 'ace-t34-143',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Security needs to detect and block exploits inside allowed traffic, by inspecting the payload, for VMs in one zone. What do you set up?',
    options: [
      'Cloud NGFW Enterprise: a firewall endpoint in that zone, and a rule that applies a security profile group',
      'Cloud NGFW Standard: a rule that uses FQDN objects and geolocation for that traffic',
      'VPC firewall rules with logging, plus an alert on unusual traffic volumes',
      'Cloud Armor preconfigured WAF rules attached to the VMs’ network interfaces in that zone'
    ],
    answer: 0,
    explanation: 'Intrusion prevention needs Cloud NGFW Enterprise: a zonal firewall endpoint associated with the VPC and a rule with `apply_security_profile_group` that sends traffic to it for inspection. Standard features match addresses and names, logs only record traffic, and Cloud Armor protects load balancers.'
  },
  {
    id: 'ace-t34-144',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'A VPC has both legacy VPC firewall rules and a new global network firewall policy. You want the policy evaluated before the VPC rules. What do you change?',
    options: [
      'Give every network policy rule a priority lower than the VPC rules’',
      'Set the network’s firewall policy enforcement order to `BEFORE_CLASSIC_FIREWALL`',
      'Move the policy into a hierarchical policy on the project’s folder',
      'Delete the VPC rules; a network can only use one of the two kinds'
    ],
    answer: 1,
    explanation: 'By default, VPC firewall rules are evaluated before network firewall policies (`AFTER_CLASSIC_FIREWALL`). The network’s `networkFirewallPolicyEnforcementOrder` setting can switch that. Priorities only order rules within one policy or rule set, and both kinds can coexist.'
  },
  {
    id: 'ace-t34-145',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'An app on a VM fails to send email to an external mail server on tcp:25, even though an egress rule allows it. Why, and what is the fix?',
    options: [
      'The implied egress deny overrides the rule; give the rule priority 0',
      'Port 25 needs an ingress rule for replies; add one for the mail server',
      'Google Cloud blocks egress to external tcp:25; use port 587 or 465, or a relay',
      'Cloud NAT drops SMTP by default; add a NAT rule for port 25'
    ],
    answer: 2,
    explanation: 'Outbound connections to tcp:25 on external addresses are always blocked, and no firewall rule changes that. Use submission ports 587 or 465, or a third-party relay. There is no implied egress deny, rules are stateful, and NAT does not filter by port.'
  },
  {
    id: 'ace-t34-146',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'VMs in VPC `a` are peered with VPC `b`. A rule in `b` allows traffic from source tag `frontend`, and the frontend VMs in `a` carry that tag, but their traffic is denied. Why?',
    options: [
      'Peering needs the export and import of custom routes before any source tags will match',
      'The rule in `b` needs a target service account instead of a source tag',
      'Tags only match traffic from external IPs, not from peered internal IPs',
      'Source tags do not cross VPC peering; the rule in `b` must use `a`’s source ranges'
    ],
    answer: 3,
    explanation: 'Network tags and service accounts in firewall rules only refer to VMs in the same VPC. For traffic from a peered network, the rule in `b` must match `a`’s IP ranges. Route exchange does not carry tags.'
  },


  // ── 8 · Shared VPC, peering and hybrid connectivity ──
  {
    id: 'ace-t34-15',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'VPC `hub` reaches the data centre over HA VPN. VPC `spoke` is peered with `hub`, and its VMs cannot reach on-premises. Peering is ACTIVE and firewall rules allow the traffic. What makes the path work?',
    options: [
      'Enable global dynamic routing in `spoke`, then create a second peering from `spoke` to `hub`',
      'Export and import custom routes over the peering, and advertise the spoke range on the hub’s Cloud Router',
      'Nothing: peering never carries traffic towards on-premises, so build a VPN from `spoke` too',
      'Give the spoke VMs external IPs and reach the data centre over the public internet instead'
    ],
    answer: 1,
    explanation: 'The routes to on-premises in `hub` are dynamic (custom) routes, which peering exchanges only when one side exports and the other imports them. On-premises also needs a route back, so the hub’s Cloud Router must advertise the spoke’s range with a custom advertisement. Peering is not transitive between VPCs, but this hub-and-spoke hybrid pattern is supported.'
  },
  {
    id: 'ace-t34-16',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'In a Shared VPC, a service project team has Compute Instance Admin in its own project. Creating a VM in the host project’s subnet `app-jkt` fails with a permission error. What is the least-privilege fix?',
    options: [
      'Grant the team Shared VPC Admin (`compute.xpnAdmin`) on the organization',
      'Grant the team Compute Network Admin on the host project',
      'Attach the host project to the service project as well',
      'Grant the team Compute Network User on the `app-jkt` subnet in the host project'
    ],
    answer: 3,
    explanation: 'Placing a resource in a shared subnet needs `compute.networkUser` on the host project or, more narrowly, on that one subnet. Shared VPC Admin is for enabling hosts and attaching projects, Network Admin can change the whole network, and a host project cannot also be a service project.'
  },
  {
    id: 'ace-t34-147',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A network team must turn a project into a Shared VPC host project and attach service projects to it. Which role do they need, and where?',
    options: [
      'Compute Network Admin (`roles/compute.networkAdmin`) on the host project',
      'Compute Network User (`roles/compute.networkUser`) on each service project',
      'Project Owner on the host project and on every service project to attach',
      'Compute Shared VPC Admin (`roles/compute.xpnAdmin`) at the organization or folder'
    ],
    answer: 3,
    explanation: 'Enabling a host project and attaching service projects needs the Shared VPC Admin role, granted at the organization or a folder. Network Admin manages network resources inside a project, Network User lets service project principals use subnets, and Owner is not the intended role.'
  },
  {
    id: 'ace-t34-148',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'VPC `a` is peered with `b`, and `b` is peered with `c`. VMs in `a` cannot reach VMs in `c`. What is the cause?',
    options: [
      'VPC peering is not transitive; `a` and `c` need their own connection',
      'The peering from `b` to `c` must export custom routes to `a` as well',
      'Firewall rules in `b` block traffic that is passing through it',
      'Peering only works between VPCs in the same region of a project'
    ],
    answer: 0,
    explanation: 'Peered networks exchange only their own subnet routes, so `a` never learns `c`’s ranges through `b`. You need a direct peering between `a` and `c`, or a hub design such as Network Connectivity Center. Peering is global and not limited to one region or project.'
  },
  {
    id: 'ace-t34-149',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'Peering VPC `x` (`10.1.0.0/16`) with VPC `y` (`10.1.128.0/20`) fails. Why?',
    options: [
      'Peered VPCs must be in different organizations, and these are not',
      'Their subnet ranges overlap, and peered VPCs cannot have overlapping ranges',
      'Peering needs both VPCs to use auto mode subnet creation',
      'Peering needs a Cloud Router in each VPC before it can be created'
    ],
    answer: 1,
    explanation: '`10.1.128.0/20` is inside `10.1.0.0/16`, and VPC peering rejects overlapping subnet ranges. Peering works within or across organizations, with custom or auto mode, and does not use Cloud Router.'
  },
  {
    id: 'ace-t34-150',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'An HA VPN to an on-premises router must qualify for the 99.99% SLA. How many tunnels are needed, and how?',
    options: [
      'One tunnel from interface 0, with a second gateway kept as a cold standby',
      'Two tunnels, both from interface 0, to two different peer addresses',
      'Two tunnels, one from each HA VPN gateway interface, to the peer’s gateway',
      'Four tunnels, two from a Classic VPN gateway and two from HA VPN'
    ],
    answer: 2,
    explanation: 'HA VPN has two interfaces, and the 99.99% SLA needs a tunnel from each of them to the peer (with BGP on both). One tunnel, or both from one interface, leaves a single point of failure, and Classic VPN tunnels do not count towards the HA SLA.'
  },
  {
    id: 'ace-t34-151',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A company has no equipment in a colocation facility. It needs a private, SLA-backed 2 Gbps connection to Google Cloud. Which option fits?',
    options: [
      'Dedicated Interconnect, with one 10 Gbps circuit at Google',
      'HA VPN over the internet, with two tunnels at 1 Gbps each',
      'Direct Peering with Google at a public peering location',
      'Partner Interconnect through a supported service provider'
    ],
    answer: 3,
    explanation: 'Partner Interconnect connects through a provider, so you do not need to meet Google in a colocation facility, and offers capacities from 50 Mbps to 50 Gbps. Dedicated Interconnect requires your own router in a colocation facility, HA VPN runs over the internet, and Direct Peering reaches Google public services, not your VPC.'
  },
  {
    id: 'ace-t34-152',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A company already has routers in a colocation facility where Google is present. It needs 20 Gbps of private capacity to its VPC at the lowest per-GB cost. Which option fits?',
    options: [
      'Dedicated Interconnect with two 10 Gbps circuits',
      'Partner Interconnect with a 20 Gbps VLAN attachment',
      'HA VPN with eight tunnels over the internet',
      'Carrier Peering through a Google partner ISP'
    ],
    answer: 0,
    explanation: 'With equipment already in a colocation facility, Dedicated Interconnect gives a direct physical link with the lowest egress pricing. Partner Interconnect adds the provider’s cost, VPN tunnels cap out per tunnel and run over the internet, and Carrier Peering reaches Google public services only.'
  },
  {
    id: 'ace-t34-153',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Workloads in Google Cloud and in AWS must talk privately over a high-bandwidth, dedicated link, without the company managing its own colocation routers. What do you use?',
    options: [
      'HA VPN to an AWS virtual gateway',
      'Cross-Cloud Interconnect to AWS',
      'VPC peering with the AWS VPC',
      'Partner Interconnect to AWS'
    ],
    answer: 1,
    explanation: 'Cross-Cloud Interconnect provides a dedicated physical connection between Google and another cloud provider, managed by Google. HA VPN works but runs over the internet with lower bandwidth, VPC peering only connects Google Cloud VPCs, and Partner Interconnect links on-premises networks through a provider.'
  },
  {
    id: 'ace-t34-154',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Traffic over Dedicated Interconnect must be encrypted with IPsec to meet a policy, while still using the Interconnect bandwidth. What do you deploy?',
    options: [
      'HA VPN over the internet, with Interconnect kept only as a backup',
      'Cloud NAT on the Interconnect, which encrypts traffic leaving the VPC',
      'HA VPN over Cloud Interconnect, with tunnels on encrypted VLAN attachments',
      'Private Google Access on the subnets that use the Interconnect'
    ],
    answer: 2,
    explanation: 'HA VPN over Cloud Interconnect runs IPsec tunnels across Interconnect VLAN attachments, so traffic is encrypted and still uses the private link. Cloud Interconnect traffic is not encrypted by default (MACsec is the link-layer option). VPN over the internet abandons the Interconnect, and NAT and Private Google Access do not encrypt.'
  },
  {
    id: 'ace-t34-155',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'On-premises hosts reach Google APIs over Interconnect through `restricted.googleapis.com`. The Cloud Router advertises only the subnet routes. What must you add on the Cloud Router?',
    options: [
      'A custom route advertisement for `0.0.0.0/0`',
      'A static route to `199.36.153.4/30` in the VPC',
      'A BGP session to Google’s public API servers',
      'A custom route advertisement for `199.36.153.4/30`'
    ],
    answer: 3,
    explanation: 'On-premises routers must learn the `restricted.googleapis.com` range from the Cloud Router, so you add it as a custom advertised range (alongside the subnets). On-premises DNS must also point API names at those addresses. Advertising a default route sends all traffic to Google, and a VPC route does not reach on-premises by itself.'
  },
  {
    id: 'ace-t34-156',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'In a Shared VPC, a VM in the `analytics` service project sends 50 TB to the internet. Which project is billed for that egress?',
    options: [
      'The `analytics` service project, which owns the VM',
      'The host project, which owns the VPC network',
      'Split equally between the host and service project',
      'The organization’s default billing project'
    ],
    answer: 0,
    explanation: 'In Shared VPC, egress is billed to the project that owns the resource sending it, here the service project’s VM, even though the network belongs to the host project. That keeps costs with each team.'
  },
  {
    id: 'ace-t34-157',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'In a Shared VPC, an application team in a service project wants to create firewall rules for its VMs. Its members have Compute Admin on the service project only. What is true?',
    options: [
      'They can create the rules in their service project, which then apply to the shared network',
      'Firewall rules live in the host project, so they need a role such as Compute Security Admin there',
      'They need Compute Network User on the subnet, which also allows firewall rule changes',
      'They need Compute Shared VPC Admin at the organization to edit any firewall rules'
    ],
    answer: 1,
    explanation: 'Firewall rules belong to the VPC, which is in the host project, so creating them needs a role like `roles/compute.securityAdmin` in the host project. That is usually kept with the central network team. Network User only allows using subnets, and Shared VPC Admin is for setting up host and service projects.'
  },
  {
    id: 'ace-t34-158',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'VPCs `a` and `b` were peered successfully, and the routes appear in both VPCs, but pings from `a` to `b` fail. What is the most likely cause?',
    options: [
      'Peering needs a VPN tunnel before any traffic can flow',
      'Ping is not supported across peered VPC networks',
      '`b` has no ingress rule allowing traffic from `a`’s ranges',
      'The peering must be recreated with a higher priority'
    ],
    answer: 2,
    explanation: 'Peering exchanges routes but not firewall rules. Each VPC still applies its own rules, and the implied rule denies ingress, so `b` needs a rule that allows ICMP from `a`’s ranges. ICMP works across peering, which uses no VPN and has no priority.'
  },
  {
    id: 'ace-t34-159',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'An old on-premises firewall cannot run BGP, but the company wants an IPsec VPN to its VPC. Which option works?',
    options: [
      'HA VPN with static routes and no Cloud Router',
      'HA VPN with a Cloud Router and BGP disabled',
      'Partner Interconnect with a static VLAN attachment',
      'Classic VPN with static (route-based or policy-based) routing'
    ],
    answer: 3,
    explanation: 'HA VPN requires BGP through a Cloud Router, so a peer without BGP can only use Classic VPN with static routing (Classic VPN with dynamic routing is deprecated). Partner Interconnect is not an IPsec VPN and still uses BGP.'
  },
  {
    id: 'ace-t34-160',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Thirty VPCs must all reach each other and the on-premises network, and full-mesh peering is becoming unmanageable. What do you use?',
    options: [
      'Network Connectivity Center with the VPCs attached as VPC spokes',
      'VPC peering between each VPC and one hub, which passes traffic through',
      'Shared VPC, with each of the thirty VPCs set as a service project',
      'Cloud NAT in each VPC, translating traffic to the other VPCs'
    ],
    answer: 0,
    explanation: 'Network Connectivity Center gives a hub-and-spoke model in which VPC spokes and hybrid spokes reach each other through the hub. Peering is not transitive, so one hub does not pass traffic through. Service projects are projects, not VPCs, and NAT does not connect networks.'
  },
  {
    id: 'ace-t34-161',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'Ten projects in the same organization should share one centrally managed network, with the network team controlling subnets and firewall rules. What fits best?',
    options: [
      'A VPC in each project, with full-mesh peering between all ten',
      'Shared VPC with one host project and ten service projects',
      'A VPC in each project, joined by HA VPN tunnels',
      'One VPC in a project, with every VM created in that project'
    ],
    answer: 1,
    explanation: 'Shared VPC lets service projects use subnets in a central host project, so the network team manages one network while teams keep their own projects for resources and billing. Peering and VPN give separate networks with separate rules, and one project removes the team boundaries.'
  },
  {
    id: 'ace-t34-162',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A partner company, in a different Google Cloud organization, needs private connectivity between its VPC and yours. Which option works without the internet?',
    options: [
      'Shared VPC with the partner as a service project',
      'Private Google Access on both VPCs',
      'VPC peering between the two VPCs',
      'Cloud NAT between the two VPCs'
    ],
    answer: 2,
    explanation: 'VPC peering works across projects and organizations. Shared VPC requires the host and service projects to be in the same organization, Private Google Access reaches Google APIs, and Cloud NAT handles outbound internet access.'
  },
  {
    id: 'ace-t34-163',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Both HA VPN tunnels show `ESTABLISHED`, but no on-premises routes appear in the VPC. What is most likely wrong?',
    options: [
      'The VPC needs a static route to on-premises before BGP routes appear',
      'The tunnels need Cloud NAT, so the on-premises router can reach them',
      'The VPC uses regional routing, which blocks all learned BGP routes',
      'The BGP sessions are down, such as from a wrong peer ASN or BGP peer IP'
    ],
    answer: 3,
    explanation: 'The tunnel carries traffic, but routes come from the BGP sessions on the Cloud Router. Mismatched ASNs or link-local peer addresses (`169.254.x.x`) keep them down, so no routes are learned. Static routes are not needed, NAT has no role here, and regional mode still allows routes in the router’s region.'
  },
  {
    id: 'ace-t34-164',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'On-premises users need private, high-bandwidth access to Google Workspace and other Google public services, and nothing in a VPC. A colocation presence is available. What fits?',
    options: [
      'Direct Peering with Google',
      'Dedicated Interconnect to a VPC',
      'HA VPN to a VPC',
      'Partner Interconnect to a VPC'
    ],
    answer: 0,
    explanation: 'Direct Peering connects your network to Google’s edge to reach Google public services such as Workspace, with no VPC involved. Interconnect and HA VPN connect to a VPC, which is not what is needed here.'
  },


  // ── 9 · Cloud DNS and Cloud NAT ──
  {
    id: 'ace-t34-17',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Cloud NAT is configured on a Cloud Router in asia-southeast2. Private VMs in a new asia-southeast1 subnet of the same VPC cannot reach the internet. What do you do?',
    options: [
      'Create a Cloud Router and a Cloud NAT gateway in asia-southeast1',
      'Switch the VPC to global dynamic routing',
      'Add more NAT IP addresses to the asia-southeast2 gateway',
      'Enable Private Google Access on the asia-southeast1 subnet'
    ],
    answer: 0,
    explanation: 'Cloud NAT is regional: a gateway serves only subnets in its own region. Dynamic routing mode affects BGP routes, not NAT, more IPs do not extend the region, and Private Google Access reaches Google APIs, not the internet.'
  },
  {
    id: 'ace-t34-18',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'A Cloud DNS forwarding zone sends `corp.example.com` queries to the on-premises resolver `192.168.10.53` over HA VPN. Queries time out. The on-premises firewall shows them arriving from `35.199.192.0/19`, but no replies get back. What is missing?',
    options: [
      'An inbound DNS server policy on the VPC, so on-premises can reach Cloud DNS',
      'DNSSEC on the forwarding zone, so the on-premises resolver trusts the replies',
      'A Cloud Router custom advertisement of `35.199.192.0/19`, so replies route back',
      'A Cloud NAT gateway, so the queries leave with a public source address'
    ],
    answer: 2,
    explanation: 'Forwarded queries come from Cloud DNS’s range `35.199.192.0/19`, and on-premises needs a route for it back through the tunnel. Cloud Router does not announce that range by default, so add it as a custom advertisement. An inbound policy is for the other direction (on-premises asking Google Cloud).'
  },
  {
    id: 'ace-t34-165',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A private Cloud DNS zone `corp.internal.` resolves for VMs in VPC `prod` but not for VMs in VPC `analytics`. What do you change?',
    options: [
      'Add `analytics` to the private zone’s list of authorized networks',
      'Create a public zone `corp.internal.` so all networks can resolve it',
      'Peer the two VPCs so the zone is visible across the peering',
      'Lower the zone’s TTL so the records reach the other network'
    ],
    answer: 0,
    explanation: 'A private zone is only visible to the VPCs listed as authorized networks. Adding `analytics` (even from another project) makes it resolvable there. A public zone exposes internal names, VPC peering does not share private zones, and TTL has nothing to do with visibility.'
  },
  {
    id: 'ace-t34-166',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'On-premises servers must resolve names in a Cloud DNS private zone over the HA VPN. What do you set up?',
    options: [
      'An outbound forwarding zone in the VPC that points at the on-premises DNS servers',
      'A DNS server policy with inbound forwarding, and on-premises forwarding to its entry addresses',
      'A public zone holding the same records as the private zone',
      'A Cloud NAT gateway so on-premises can reach `169.254.169.254`'
    ],
    answer: 1,
    explanation: 'An inbound server policy creates entry-point addresses in your subnets, and on-premises resolvers forward the zone’s queries to them over the VPN. A forwarding zone sends queries from Google Cloud to on-premises, the opposite direction. A public zone exposes internal records, and the metadata server is not reachable from on-premises.'
  },
  {
    id: 'ace-t34-167',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: '`app.example.com` must resolve to a public load balancer IP for internet users, but to an internal IP for VMs in the company VPC. How do you set this up in Cloud DNS?',
    options: [
      'One public zone with two A records for `app`, used in round robin',
      'A private zone only, with the public IP added as a second A record',
      'A public zone and a private zone for `example.com`, each with its own `app` record',
      'A forwarding zone that sends queries from the VPC to a public resolver'
    ],
    answer: 2,
    explanation: 'Split-horizon DNS uses a public zone for the internet and a private zone of the same name authorized for the VPC, and VMs get the private answer first. Two records in one zone are returned to everyone, and a forwarding zone would give VMs the public answer.'
  },
  {
    id: 'ace-t34-168',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A company wants to protect its public domain hosted in Cloud DNS against spoofed DNS answers. What do you do?',
    options: [
      'Enable DNSSEC on a private zone and authorize every VPC to use it',
      'Lower the TTL of every record in the zone to 60 seconds',
      'Create a response policy that rewrites answers for the domain',
      'Enable DNSSEC on the public zone and add the DS record at the registrar'
    ],
    answer: 3,
    explanation: 'DNSSEC signs the zone’s records, and the DS record at the registrar links the signatures into the chain of trust so resolvers can validate them. Private zones are not resolved on the internet, a low TTL does not prevent spoofing, and response policies change answers inside your VPC.'
  },
  {
    id: 'ace-t34-169',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A VM named `db-1` in zone `asia-southeast2-a` of project `shop-prod` uses zonal internal DNS. Which name do other VMs in the VPC use to reach it?',
    options: [
      '`db-1.asia-southeast2-a.c.shop-prod.internal`',
      '`db-1.shop-prod.asia-southeast2.internal`',
      '`db-1.c.asia-southeast2-a.googleapis.com`',
      '`shop-prod.db-1.internal.asia-southeast2-a`'
    ],
    answer: 0,
    explanation: 'Zonal internal DNS names have the form `VM_NAME.ZONE.c.PROJECT_ID.internal`, resolved by the metadata server at `169.254.169.254` for VMs in the same VPC.'
  },
  {
    id: 'ace-t34-170',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'For VPC Service Controls, every VM in a VPC must resolve `*.googleapis.com` to the `restricted.googleapis.com` addresses, without editing each VM. What do you set up?',
    options: [
      'A Cloud NAT rule that rewrites the API addresses to `199.36.153.4/30`',
      'A Cloud DNS response policy (or private zone) mapping `*.googleapis.com` to the restricted VIP',
      'A custom static route for `googleapis.com` towards the restricted range in every VPC',
      'An `/etc/hosts` entry pushed to every VM with a startup script'
    ],
    answer: 1,
    explanation: 'A response policy rule (or a private `googleapis.com` zone with a CNAME to `restricted.googleapis.com`) changes answers for the whole VPC. NAT does not rewrite DNS, routes work on IP ranges rather than names, and hosts files have to be maintained on each VM.'
  },
  {
    id: 'ace-t34-171',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'You want `example.com` itself (the zone apex) to point at your load balancer’s IP. Which record do you create?',
    options: [
      'A `CNAME` record for `example.com` to the load balancer’s name',
      'An `NS` record for `example.com` with the load balancer’s IP',
      'An `A` record for `example.com` with the load balancer’s IP',
      'A `PTR` record for `example.com` with the load balancer’s IP'
    ],
    answer: 2,
    explanation: 'A CNAME cannot exist at the zone apex, because the apex already holds the SOA and NS records. An A record with the load balancer’s IP works. NS records delegate zones, and PTR records are for reverse lookups.'
  },
  {
    id: 'ace-t34-172',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Next Saturday a website moves to a new IP address. Its A record has a TTL of 86,400 seconds. How do you make the switch take effect quickly for users?',
    options: [
      'Change the A record on Saturday; TTLs are ignored for A records',
      'Delete the zone on Saturday and recreate it with the new IP',
      'Add the new IP as a second A record and remove the old one later',
      'Lower the TTL to a few minutes a day or more before the move'
    ],
    answer: 3,
    explanation: 'Resolvers cache a record for its TTL. Lowering it well before the change (at least one old TTL ahead) means caches expire quickly after the switch. Resolvers do honor A-record TTLs, deleting the zone breaks resolution, and two A records send some users to the old IP.'
  },
  {
    id: 'ace-t34-173',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A forwarding zone sends `corp.example.com` to an on-premises DNS server that has a public IP address but is only reachable over HA VPN. Queries time out. What do you change?',
    options: [
      'Set the forwarding target’s path to private, so queries go through the VPC',
      'Change the target to the server’s hostname instead of its public IP address',
      'Convert the forwarding zone into a peering zone pointing at on-premises',
      'Add Cloud NAT so the forwarded queries can reach the public address'
    ],
    answer: 0,
    explanation: 'Cloud DNS sends forwarded queries for RFC 1918 targets through the VPC, but for other targets it uses the internet unless you set the forwarding path to private. Targets are IP addresses, peering zones point at VPCs, and NAT would still send queries over the internet.'
  },
  {
    id: 'ace-t34-174',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A partner allowlists only two fixed source IPs for API calls from your private VMs. How do you configure Cloud NAT?',
    options: [
      'Use automatic NAT IP allocation, then share the current addresses',
      'Reserve two static external IPs and use manual NAT IP allocation',
      'Give each VM a static external IP and remove Cloud NAT',
      'Set the NAT minimum ports per VM so it uses two addresses'
    ],
    answer: 1,
    explanation: 'Manual allocation pins NAT to reserved addresses you choose, so the source IPs stay fixed. Automatic allocation can add or change addresses, external IPs on every VM defeat the private design, and port settings do not control which addresses are used.'
  },
  {
    id: 'ace-t34-175',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'NAT logs show `OUT_OF_RESOURCES` drops when many VMs open thousands of connections to the same API endpoint. What helps?',
    options: [
      'Turn off endpoint-independent mapping and shorten the NAT timeouts only',
      'Switch the NAT gateway to the Standard network tier',
      'Raise the minimum ports per VM or turn on dynamic port allocation',
      'Move all the VMs to one subnet so they share a NAT pool'
    ],
    answer: 2,
    explanation: 'Each VM gets a fixed number of source ports per NAT IP (64 by default). Many connections to the same destination use them up, causing drops. Raising the minimum or using dynamic port allocation (and adding NAT IPs if needed) gives VMs more ports. Network tier and subnet layout do not change the port count.'
  },
  {
    id: 'ace-t34-176',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Cloud NAT serves a subnet, but a partner sees one VM’s calls coming from an address that is not a NAT IP. Why?',
    options: [
      'Cloud NAT only translates TCP, so that VM’s UDP traffic skips it',
      'NAT addresses rotate each hour, and the partner saw an old one',
      'The VM is in a second zone, which uses a different NAT gateway',
      'That VM has its own external IP, so it does not use Cloud NAT'
    ],
    answer: 3,
    explanation: 'Cloud NAT only translates traffic from VMs without an external IP address. A VM with one sends from its own IP. NAT handles TCP, UDP and ICMP, does not rotate addresses on its own, and is regional, not per zone.'
  },
  {
    id: 'ace-t34-177',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A team wants the internet to open connections to a web app on private VMs, and suggests Cloud NAT. What do you tell them?',
    options: [
      'Cloud NAT is outbound only; use a load balancer for inbound traffic',
      'Cloud NAT works if you add a port forwarding rule on the gateway',
      'Cloud NAT works if the VMs are placed in a dual-stack subnet',
      'Cloud NAT works once its logging is set to log all translations'
    ],
    answer: 0,
    explanation: 'Cloud NAT only lets private VMs start outbound connections and receive the replies. It has no port forwarding, so inbound traffic needs an external load balancer or an external IP.'
  },
  {
    id: 'ace-t34-178',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Connections from private VMs fail intermittently, and you need to see whether Cloud NAT is dropping them. What do you turn on?',
    options: [
      'VPC Flow Logs on the subnet with a 100% sample rate',
      'Cloud NAT logging for errors (or for translations and errors)',
      'Firewall rules logging on the implied egress rule',
      'Data Access audit logs for the Compute Engine API'
    ],
    answer: 1,
    explanation: 'NAT logging records translations and drops such as `OUT_OF_RESOURCES`. Flow logs show flows but not NAT decisions, implied rules cannot be logged, and audit logs record API calls rather than packets.'
  },
  {
    id: 'ace-t34-179',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'In a region with three subnets, only `subnet-batch` should get internet access through Cloud NAT. What do you configure?',
    options: [
      'A NAT gateway on all subnets, with a firewall deny on the other two',
      'A NAT gateway in a different region, linked to `subnet-batch`',
      'A NAT gateway that applies to the listed subnet range `subnet-batch` only',
      'One NAT gateway per subnet, with the other two left without IPs'
    ],
    answer: 2,
    explanation: 'A Cloud NAT gateway can serve all subnets in the region or only chosen subnet ranges. Firewall rules would work but are a workaround, NAT is regional so another region cannot serve the subnet, and gateways need IPs to work.'
  },
  {
    id: 'ace-t34-180',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Nodes in a private GKE cluster have no external IPs and fail to pull images from Docker Hub. What do you add?',
    options: [
      'Private Google Access on the nodes’ subnet',
      'An external passthrough Network Load Balancer',
      'A Cloud DNS forwarding zone for `docker.io`',
      'A Cloud NAT gateway for the nodes’ subnet in that region'
    ],
    answer: 3,
    explanation: 'Docker Hub is on the internet, so private nodes need Cloud NAT for outbound access. Private Google Access reaches Google APIs and Artifact Registry, not third-party registries, a load balancer handles inbound traffic, and DNS alone does not give a route out.'
  },
  {
    id: 'ace-t34-181',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Two VPC spokes in Network Connectivity Center have overlapping subnet ranges and must still communicate. What do you use?',
    options: [
      'Private NAT, translating the overlapping ranges to non-overlapping ones',
      'Public NAT on both spokes, with traffic sent over the internet',
      'VPC peering between the spokes, with custom routes exported',
      'A Cloud Router custom advertisement for the overlapping range'
    ],
    answer: 0,
    explanation: 'Private NAT translates between private networks, so workloads in overlapping ranges can reach each other through NCC. Public NAT goes to the internet, peering rejects overlapping ranges, and route advertisements cannot resolve an address conflict.'
  },
  {
    id: 'ace-t34-182',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'You must stop using one of three manual NAT IPs because a partner is removing it from an allowlist, without cutting existing connections. What do you do?',
    options: [
      'Release the external IP address so the gateway picks one of the other two',
      'Move the IP to the gateway’s drain list, then remove it once connections end',
      'Delete the NAT gateway and recreate it with the two remaining addresses',
      'Set the NAT minimum ports to zero on that address only'
    ],
    answer: 1,
    explanation: 'Draining a NAT IP stops new connections from using it while existing ones finish. Releasing it or recreating the gateway drops live connections, and ports are not set per address.'
  },


  // ── 10 · Load balancing, CDN and tiers ──
  {
    id: 'ace-t34-19',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A regional internal Application Load Balancer fronts the app MIG. The proxy-only subnet is `10.129.0.0/23`. `get-health` shows every backend HEALTHY, yet clients get 502 errors. The only ingress rule on the backends allows `130.211.0.0/22` and `35.191.0.0/16`. What do you fix?',
    options: [
      'Change the balancing mode from UTILIZATION to RATE',
      'Recreate the load balancer with the `EXTERNAL_MANAGED` scheme',
      'Move the backends into the proxy-only subnet',
      'Allow ingress from `10.129.0.0/23` on the backend port'
    ],
    answer: 3,
    explanation: 'Health checks come from Google’s probe ranges, which are allowed, so the backends look healthy. Real traffic to an Envoy-based regional load balancer comes from the proxies in the proxy-only subnet, which the firewall blocks. Proxy-only subnets cannot hold VMs, and the scheme of an internal ALB is `INTERNAL_MANAGED`.'
  },
  {
    id: 'ace-t34-20',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'To save money, a project’s default network tier was set to Standard. The company now needs a public HTTPS site for users in Asia and Europe, with one IP address and Cloud CDN. What do you do?',
    options: [
      'Use a regional external Application Load Balancer in Standard Tier and enable Cloud CDN on it',
      'Keep the Standard default and build a global external Application LB on a Premium global IP',
      'Move the whole project back to Premium, because a tier cannot be chosen for a single resource',
      'Use two regional load balancers in Standard Tier, one per continent, behind DNS round robin'
    ],
    answer: 1,
    explanation: 'The project default is only a default: the global static IP and the global external Application Load Balancer use Premium Tier regardless, and Cloud CDN needs that load balancer. A regional Standard Tier design has no single anycast IP or CDN, and two regional IPs are not one address.'
  },
  {
    id: 'ace-t34-183',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'Multiplayer game servers in one region use UDP, and they must see each player’s real source IP. Which load balancer fits?',
    options: [
      'Global external Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Global external proxy Network Load Balancer',
      'Regional internal Application Load Balancer'
    ],
    answer: 1,
    explanation: 'A passthrough NLB forwards packets without proxying, so backends see the client IP, and it supports UDP. Application Load Balancers are HTTP(S) proxies, and the proxy NLB supports TCP only and terminates the connection.'
  },
  {
    id: 'ace-t34-184',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'A global, non-HTTP TCP service must terminate TLS at Google’s edge close to users worldwide, then pass traffic to backends in two regions. Which load balancer fits?',
    options: [
      'External passthrough Network Load Balancer in each of the two regions',
      'Global external Application Load Balancer with an HTTPS target proxy',
      'Global external proxy Network Load Balancer, with an SSL proxy target',
      'Internal passthrough Network Load Balancer behind an HA VPN tunnel'
    ],
    answer: 2,
    explanation: 'The global external proxy NLB handles TCP traffic, can offload TLS (SSL proxy) at the edge, and routes to backends in several regions. Passthrough NLBs are regional and do not terminate TLS, and the Application Load Balancer is for HTTP(S) only.'
  },
  {
    id: 'ace-t34-185',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'VMs in one region must reach a pool of database proxies over TCP through one internal IP, and the proxies must see the clients’ IPs. Which load balancer fits?',
    options: [
      'Regional internal Application Load Balancer',
      'Regional internal proxy Network Load Balancer',
      'Global external proxy Network Load Balancer',
      'Internal passthrough Network Load Balancer'
    ],
    answer: 3,
    explanation: 'The internal passthrough NLB gives a private IP in the region and passes packets straight through, so backends see the client IP. Proxy-based load balancers (internal ALB and proxy NLB) replace the source with a proxy address, and an external one would expose the service.'
  },
  {
    id: 'ace-t34-186',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'On `shop.example.com`, `/api/*` must go to a Cloud Run service and `/static/*` to a Cloud Storage bucket, behind one global IP. What do you build?',
    options: [
      'A global external ALB with a URL map: a serverless NEG for `/api/*` and a backend bucket for `/static/*`',
      'Two external passthrough NLBs, one for each path, behind the same DNS name',
      'A Cloud Run domain mapping for `/api/*`, with the bucket served under a separate hostname',
      'A global external proxy NLB with two TCP backend services selected by path'
    ],
    answer: 0,
    explanation: 'Only an Application Load Balancer routes by path. Its URL map can send `/api/*` to a backend service with a serverless NEG and `/static/*` to a backend bucket. NLBs work at layer 4 and cannot see paths, and a domain mapping does not combine the two behind one IP.'
  },
  {
    id: 'ace-t34-187',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A Google-managed certificate on a new HTTPS load balancer has been stuck in `PROVISIONING` for hours. What is the most likely cause?',
    options: [
      'The backend service has no healthy backends to answer the challenge',
      'The domain’s DNS A record does not yet point to the load balancer’s IP',
      'The certificate needs a self-signed copy uploaded alongside it',
      'The load balancer uses the Premium network tier'
    ],
    answer: 1,
    explanation: 'For load balancer authorization, Google checks that the domain resolves to the load balancer’s IP before issuing the certificate. Fix the DNS record (or use DNS authorization with Certificate Manager). Backend health and network tier do not block issuance, and no self-signed copy is needed.'
  },
  {
    id: 'ace-t34-188',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'An HTTPS load balancer serves a site, and users who type `http://` must be redirected to `https://`. What do you configure?',
    options: [
      'A Cloud Armor rule that blocks every request on port 80 at the edge',
      'A backend service that answers port 80 with an app-level redirect',
      'An HTTP forwarding rule on the same IP with a URL map that only redirects to HTTPS',
      'A firewall rule that forwards tcp:80 traffic to tcp:443 on the backends'
    ],
    answer: 2,
    explanation: 'A second forwarding rule on port 80, pointing to a target HTTP proxy with a redirect-only URL map, sends a 301 to HTTPS without touching backends. Blocking port 80 gives users an error, app-level redirects need code, and firewall rules cannot rewrite ports.'
  },
  {
    id: 'ace-t34-189',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A web shop keeps each user’s cart in the memory of the backend VM that served them, so a user must keep reaching the same backend. What do you set on the backend service?',
    options: [
      'Connection draining timeout of 300 seconds',
      'Balancing mode `UTILIZATION` at 80%',
      'A capacity scaler of 1.0 on each backend',
      'Session affinity using a generated cookie'
    ],
    answer: 3,
    explanation: 'Generated cookie affinity has the load balancer set a cookie and send later requests with it to the same backend. Connection draining, balancing mode and capacity scaler control shutdown and load spreading, not stickiness. Storing carts in Memorystore would remove the need entirely.'
  },
  {
    id: 'ace-t34-190',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'During rolling updates, users see errors because in-flight requests are cut off when instances are removed from the group. What do you configure?',
    options: [
      'A connection draining timeout on the backend service',
      'A shorter health check interval on the instance group',
      'Session affinity based on the client IP address',
      'A lower autoscaling target for CPU utilization'
    ],
    answer: 0,
    explanation: 'Connection draining lets existing requests finish, up to a timeout, before an instance is removed. Faster health checks, affinity and autoscaling targets do not protect in-flight requests.'
  },
  {
    id: 'ace-t34-191',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A global ALB has backends in two regions. You want to stop sending new traffic to the `europe` instance group for maintenance without deleting it. What do you change?',
    options: [
      'Set the balancing mode of the `europe` backend to `RATE`',
      'Set the capacity scaler of the `europe` backend to 0',
      'Turn off the health check on the backend service',
      'Remove the global forwarding rule for a few minutes'
    ],
    answer: 1,
    explanation: 'The capacity scaler multiplies a backend’s configured capacity, so 0 stops new traffic to it while keeping it attached. Changing the balancing mode alone still sends traffic, disabling health checks is not possible and would hide failures, and removing the forwarding rule takes down the whole site.'
  },
  {
    id: 'ace-t34-192',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A wrong logo image was cached by Cloud CDN. You fixed the file at the origin, but users still see the old one. What do you do?',
    options: [
      'Restart all the backend VMs to clear their caches',
      'Change the load balancer’s IP to force new lookups',
      'Invalidate the cache for that path, such as `/img/logo.png`',
      'Turn Cloud CDN off and on again on the backend'
    ],
    answer: 2,
    explanation: 'Cache invalidation removes the cached object at every edge, so the next request fetches the new one. Restarting backends does not clear Cloud CDN, a new IP breaks DNS, and toggling CDN is disruptive and not guaranteed to purge everything.'
  },
  {
    id: 'ace-t34-193',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Paid video content is delivered through Cloud CDN, and only logged-in subscribers may fetch a set of files for a limited time, without per-file URLs. What do you use?',
    options: [
      'Cloud Storage signed URLs, one for every file',
      'Cloud Armor rules allowing subscriber IPs only',
      'IAP on the backend bucket for each subscriber',
      'Cloud CDN signed cookies, issued after login'
    ],
    answer: 3,
    explanation: 'Signed cookies grant time-limited access to many files under a URL prefix, so one cookie covers a whole video’s segments. Per-file signed URLs are clumsy for many segments, subscriber IPs change, and IAP does not support backend buckets.'
  },
  {
    id: 'ace-t34-194',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'An API behind Cloud CDN sets `Cache-Control: private` on user-specific responses and `public, max-age=60` on shared ones. CDN must follow exactly what the origin says. Which cache mode do you choose?',
    options: [
      '`USE_ORIGIN_HEADERS`',
      '`FORCE_CACHE_ALL`',
      '`CACHE_ALL_STATIC`',
      'Negative caching only'
    ],
    answer: 0,
    explanation: '`USE_ORIGIN_HEADERS` caches only responses with valid caching headers, honoring `private`. `FORCE_CACHE_ALL` caches everything, including private responses, which is dangerous here. `CACHE_ALL_STATIC` adds static content types even without headers, and negative caching is about error codes.'
  },
  {
    id: 'ace-t34-195',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A login endpoint behind an external ALB is being hit by credential-stuffing bots. You want to limit each client IP to 100 requests per minute at the edge. What do you use?',
    options: [
      'A firewall rule on the backend VMs with a per-IP connection limit',
      'A Cloud Armor rate-limiting (throttle) rule on the backend service',
      'Cloud CDN with a 60-second TTL on the login responses',
      'Autoscaling of the backend instance group to absorb the load'
    ],
    answer: 1,
    explanation: 'Cloud Armor rate-limiting rules count requests per client and throttle or ban those over the threshold before they reach backends. VPC firewall rules have no rate limits, caching a login page is wrong, and autoscaling just pays for the attack.'
  },
  {
    id: 'ace-t34-196',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A site’s origin runs on servers outside Google Cloud, and you want to serve it through a global external ALB with Cloud CDN. What backend do you use?',
    options: [
      'A hybrid connectivity NEG using the origin’s public address',
      'A serverless NEG pointing to the origin’s public hostname',
      'An internet NEG pointing to the external origin’s FQDN or IP',
      'A backend bucket that mirrors the origin each night'
    ],
    answer: 2,
    explanation: 'Internet NEGs point a backend service at endpoints outside Google Cloud reached over the internet, which works with Cloud CDN. Hybrid NEGs are for private endpoints reached over VPN or Interconnect, serverless NEGs are for Cloud Run and similar services, and a mirror adds lag.'
  },
  {
    id: 'ace-t34-197',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'Some app servers still run on-premises, reachable over Interconnect, and should sit behind the same Google Cloud load balancer as the cloud VMs during a migration. What backend type do you add?',
    options: [
      'An internet NEG with the on-premises servers’ public addresses',
      'An unmanaged instance group with the on-premises servers',
      'A zonal NEG with the on-premises servers’ private addresses',
      'A hybrid connectivity NEG with the on-premises IP:port endpoints'
    ],
    answer: 3,
    explanation: 'Hybrid connectivity NEGs (type `NON_GCP_PRIVATE_IP_PORT`) hold private endpoints reached over Cloud VPN or Interconnect. Internet NEGs use the public internet, instance groups only contain Compute Engine VMs, and zonal NEGs hold VM endpoints in Google Cloud.'
  },
  {
    id: 'ace-t34-198',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A regional web app serves users only in Indonesia, and cost matters more than global performance. A regional external ALB is enough. Which network tier fits?',
    options: [
      'Standard tier',
      'Premium tier',
      'Either; regional load balancers ignore the tier',
      'Premium tier with Cloud CDN turned on'
    ],
    answer: 0,
    explanation: 'Standard tier sends traffic over the public internet to the region and costs less, which suits a regional audience. Premium is needed for global load balancers and gives better performance across continents. Tier does apply to the regional load balancer’s external IP.'
  },
  {
    id: 'ace-t34-199',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'Internal clients in two regions use an internal HTTP service, and if the backends in one region fail, clients there must be served by the other region automatically. Which load balancer fits?',
    options: [
      'A regional internal Application Load Balancer in each region',
      'A cross-region internal Application Load Balancer',
      'An internal passthrough Network Load Balancer with global access',
      'A global external Application Load Balancer with internal backends'
    ],
    answer: 1,
    explanation: 'The cross-region internal ALB has backends and frontends in several regions with automatic failover between them. Two regional ALBs fail over only through DNS changes, global access lets clients in other regions reach a regional NLB but does not add backends elsewhere, and an external ALB exposes the service.'
  },
  {
    id: 'ace-t34-200',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Security requires the external HTTPS load balancer to refuse TLS 1.0 and 1.1 connections and weak ciphers. What do you configure?',
    options: [
      'A Cloud Armor rule that blocks requests using older TLS versions',
      'A firewall rule that blocks TLS 1.0 traffic arriving at the backends',
      'An SSL policy with minimum TLS 1.2, attached to the target HTTPS proxy',
      'A Google-managed certificate, which only supports TLS 1.3'
    ],
    answer: 2,
    explanation: 'SSL policies set the minimum TLS version and cipher profile that the load balancer negotiates with clients. Cloud Armor and firewall rules do not see the TLS version, and the certificate type does not decide which protocol versions are allowed.'
  }
];
