/**
 * Module 3 try-out — Storage & Data Solutions (exam guide 2.2 and 3.2). 100
 * questions: Cloud Storage location types and classes; objects, versioning,
 * soft delete and signed URLs; lifecycle rules, retention and access control;
 * Cloud SQL high availability, replicas, backups and PITR; AlloyDB and Spanner;
 * Firestore, Bigtable, Memorystore and BigQuery; Pub/Sub, Dataflow and Managed
 * Service for Apache Kafka; CMEK; multi-region redundancy. Dealt into five sets
 * of 20 in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const module3: ModuleQuestion[] = [
  // ── Buckets, location types and storage classes ──
  {
    id: 'ace-m3-001',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Quarterly audit exports are read about once every three months and must be kept for two years. Which storage class is the most cost-effective?',
    options: ['Coldline', 'Standard', 'Nearline', 'Archive'],
    answer: 0,
    explanation: 'Coldline targets data read about once a quarter, with a 90-day minimum storage duration. Standard costs more to store, Nearline suits monthly access, and Archive suits data read less than once a year, where frequent reads would add retrieval fees.'
  },
  {
    id: 'ace-m3-002',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Signed contracts must be kept for ten years for legal reasons and will probably never be read. Which storage class gives the lowest storage cost?',
    options: ['Archive', 'Coldline', 'Nearline', 'Standard'],
    answer: 0,
    explanation: 'Archive has the lowest storage price for data accessed less than once a year, with a 365-day minimum duration and retrieval fees. Data is still available in milliseconds when needed, so there is no restore wait.'
  },
  {
    id: 'ace-m3-003',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A team stores temporary files in a Coldline bucket and deletes them after 30 days. The bill is higher than expected. Why?',
    options: [
      'Coldline has a 90-day minimum storage duration, so early deletes are charged as if stored 90 days',
      'Coldline charges a separate fee for every delete request on top of the storage price',
      'Coldline stores three copies of each object, which triples the price of storage',
      'Coldline charges for the full year whenever an object is deleted within the year'
    ],
    answer: 0,
    explanation: 'Nearline, Coldline and Archive have minimum storage durations of 30, 90 and 365 days; deleting or moving an object earlier incurs an early deletion charge for the remaining days. Short-lived data belongs in Standard.'
  },
  {
    id: 'ace-m3-004',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Data must stay within one continent and in two regions you choose, and the bucket must keep serving if one of those regions fails. Which location type should you use?',
    options: ['A dual-region bucket', 'A regional bucket', 'A multi-region bucket', 'Two regional buckets synced by cron'],
    answer: 0,
    explanation: 'A dual-region bucket stores data redundantly in two specific regions and keeps serving if one becomes unavailable. A regional bucket lives in one region, a multi-region spans a large area chosen by Google, and syncing two buckets yourself means two names and your own failover.'
  },
  {
    id: 'ace-m3-005',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A dual-region bucket must have new objects replicated to the second region within 15 minutes, as a recovery point objective. What should you enable?',
    options: ['Turbo replication', 'Object Versioning', 'Autoclass', 'Soft delete'],
    answer: 0,
    explanation: 'Turbo replication gives dual-region buckets a 15-minute RPO for replicating new objects; default replication is asynchronous with no time guarantee for every object. Versioning, Autoclass and soft delete do not affect replication.'
  },
  {
    id: 'ace-m3-006',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Game assets are downloaded by players all over Asia, and the storage must stay available even if a whole region goes down. You do not need control over which regions hold the data. Which location fits?',
    options: ['The ASIA multi-region', 'The asia-southeast2 region', 'A dual-region in Jakarta and Mumbai', 'A Local SSD on each game server'],
    answer: 0,
    explanation: 'A multi-region bucket stores data across several regions in a large area, giving the highest availability for broadly distributed access when you do not need to pick regions. A single region does not survive a regional outage, a dual-region is for two chosen regions, and Local SSD is not shared storage. Cloud CDN can be added for latency.'
  },
  {
    id: 'ace-m3-007',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A bucket’s default storage class is Standard. Can some objects in the same bucket be stored as Archive?',
    options: [
      'Yes; each object has its own storage class, and the default only applies to new objects',
      'No; every object in a bucket must use the bucket’s default storage class',
      'Only if the bucket is a multi-region, because classes are fixed per location',
      'Only for objects larger than 1 GB, which can be set to Archive manually'
    ],
    answer: 0,
    explanation: 'Storage class is a property of each object: the bucket default applies when nothing else is specified, and objects can be changed with `gcloud storage objects update --storage-class` or lifecycle rules. There is no location or size restriction on mixing classes.'
  },
  {
    id: 'ace-m3-008',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A data lake bucket holds millions of objects whose access patterns nobody can predict. You want each object moved to cheaper classes when it goes cold and back when it is read, with no rules to maintain. What should you enable?',
    options: ['Autoclass on the bucket', 'A lifecycle rule moving objects to Archive', 'Turbo replication on the bucket', 'Requester Pays on the bucket'],
    answer: 0,
    explanation: 'Autoclass moves each object between classes based on its own access, and returns objects to Standard when they are read, without retrieval or early deletion fees. Age-based lifecycle rules cannot react to reads, turbo replication is about replication, and Requester Pays shifts who pays for access.'
  },
  {
    id: 'ace-m3-009',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A bucket was moved to Coldline to save money, but a reporting job reads most of its objects every day. The monthly bill went up. What is the most likely reason and fix?',
    options: [
      'Coldline charges per GB retrieved; move frequently read data back to Standard',
      'Coldline stores data in another region; move the job to that region instead',
      'Coldline throttles reads, so the job retries; add more parallel threads',
      'Coldline charges a monthly minimum per bucket; merge the bucket with another'
    ],
    answer: 0,
    explanation: 'Colder classes trade a lower storage price for retrieval and higher operation costs, so data read daily costs more there than in Standard. Coldline is not stored elsewhere or throttled, and there is no per-bucket minimum.'
  },
  {
    id: 'ace-m3-010',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'You need a configurable dual-region bucket in us-central1 and us-east1. Which command creates it?',
    options: [
      '`gcloud storage buckets create gs://ace-media-123 --location=US --placement=us-central1,us-east1`',
      '`gcloud storage buckets create gs://ace-media-123 --location=us-central1,us-east1`',
      '`gcloud storage buckets create gs://ace-media-123 --dual-region --regions=us-central1,us-east1`',
      '`gcloud storage buckets create gs://ace-media-123 --location=US --turbo-replication`'
    ],
    answer: 0,
    explanation: 'A configurable dual-region is created with the multi-region code as location and the two regions in `--placement`. The location flag does not take a list, the `--dual-region` and `--regions` flags do not exist, and `--location=US` alone creates a multi-region bucket.'
  },
  {
    id: 'ace-m3-011',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A bucket created in the US multi-region must now be in asia-southeast2 for data residency. What should you do?',
    options: [
      'Create a new bucket in asia-southeast2, copy the objects with Storage Transfer Service, then delete the old one',
      'Change the location of the existing bucket in its settings, which moves the data in the background',
      'Run `gcloud storage buckets update gs://bucket --location=asia-southeast2` and wait for it to finish',
      'Enable turbo replication to asia-southeast2, then remove the US locations from the bucket'
    ],
    answer: 0,
    explanation: 'A bucket’s name and location are fixed at creation, so you create a new bucket in the right location and move the data (Storage Transfer Service or `gcloud storage cp`/`rsync`), then update applications and delete the old bucket. There is no location update, and turbo replication only applies within a dual-region.'
  },
  {
    id: 'ace-m3-012',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An analytics team renames and moves whole folders of millions of objects, which is slow in a flat bucket. They want real folders with fast, atomic renames. What should you create?',
    options: [
      'A new bucket with hierarchical namespace enabled at creation',
      'A bucket with Object Versioning enabled, so renames are tracked',
      'A bucket with Autoclass, which reorganises folders automatically',
      'A dual-region bucket, which renames folders in both regions at once'
    ],
    answer: 0,
    explanation: 'Buckets with hierarchical namespace store folders as real resources, so folder renames are fast and atomic, which helps data lakes and AI pipelines. It must be enabled when the bucket is created (with uniform bucket-level access). Versioning, Autoclass and location type do not change folder behaviour.'
  },
  {
    id: 'ace-m3-013',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Every night, new files in an Amazon S3 bucket must be copied to Cloud Storage, with retries and a record of each run, and no servers to manage. What should you use?',
    options: [
      'Storage Transfer Service with a scheduled S3-to-Cloud Storage transfer job',
      'A cron job on a Compute Engine VM running `gcloud storage rsync` from S3',
      'BigQuery Data Transfer Service writing the S3 files into a dataset',
      'Transfer Appliance shipped every night between the two clouds'
    ],
    answer: 0,
    explanation: 'Storage Transfer Service moves data from other clouds, HTTP sources and file systems on a schedule, handling retries and keeping logs of each run, with nothing for you to host. A VM cron job means managing a server, the BigQuery service loads tables rather than copying files, and Transfer Appliance is a physical device for one-off bulk moves.'
  },
  {
    id: 'ace-m3-014',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Marketing wants Google Ads and YouTube Analytics data loaded into BigQuery every day, without writing any pipeline code. What should you use?',
    options: ['BigQuery Data Transfer Service', 'Storage Transfer Service', 'Transfer Appliance', 'A Dataflow streaming job'],
    answer: 0,
    explanation: 'BigQuery Data Transfer Service schedules managed loads from Google SaaS products (such as Google Ads and YouTube), other clouds and some third-party sources straight into BigQuery. Storage Transfer Service copies files into Cloud Storage, Transfer Appliance is hardware, and Dataflow means building a pipeline.'
  },

  // ── Objects: uploads, versioning, soft delete and signed URLs ──
  {
    id: 'ace-m3-015',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'You need to upload the local folder ./site, including all its subfolders, to gs://ace-web-123/. Which command does it?',
    options: [
      '`gcloud storage cp -r ./site gs://ace-web-123/`',
      '`gcloud storage cp ./site gs://ace-web-123/`',
      '`gcloud storage buckets upload ./site gs://ace-web-123`',
      '`gcloud storage mv --all ./site gs://ace-web-123/`'
    ],
    answer: 0,
    explanation: '`gcloud storage cp -r` (recursive) copies a directory tree. Without `-r` a directory is skipped, there is no `buckets upload` command, and `mv` would delete the local files after copying.'
  },
  {
    id: 'ace-m3-016',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A bucket must mirror the local folder ./reports exactly: new and changed files are copied, and files removed locally are removed from the bucket. Which command should you schedule?',
    options: [
      '`gcloud storage rsync -r ./reports gs://ace-reports-123 --delete-unmatched-destination-objects`',
      '`gcloud storage cp -r ./reports gs://ace-reports-123 --no-clobber --continue-on-error`',
      '`gcloud storage rsync -r gs://ace-reports-123 ./reports --delete-unmatched-destination-objects`',
      '`gcloud storage mv -r ./reports gs://ace-reports-123 --overwrite --preserve-posix`'
    ],
    answer: 0,
    explanation: '`rsync` copies only what changed, and `--delete-unmatched-destination-objects` removes objects that no longer exist in the source, giving an exact mirror. `cp --no-clobber` never deletes or updates, the third command syncs in the wrong direction, and `mv` deletes the local files.'
  },
  {
    id: 'ace-m3-017',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'An application uploads 20 GB video files through the Cloud Storage JSON API over an unreliable network, and failed uploads start again from zero. What should the application use?',
    options: ['Resumable uploads', 'Single-request (simple) uploads', 'Signed URLs that expire every minute', 'Requester Pays buckets'],
    answer: 0,
    explanation: 'Resumable uploads let a client continue an interrupted upload from where it stopped, which is recommended for large files or unreliable connections. Simple uploads must be retried in full, and signed URLs and Requester Pays do not change how uploads recover.'
  },
  {
    id: 'ace-m3-018',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A backup tool only speaks the Amazon S3 API. You want it to write to a Cloud Storage bucket without changing the tool. What should you do?',
    options: [
      'Point it at the Cloud Storage XML API endpoint and give it an HMAC key for a service account',
      'Point it at the JSON API endpoint and give it a downloaded service account JSON key',
      'Run the tool inside Cloud Shell, which converts S3 calls into Cloud Storage calls',
      'Create the bucket with S3 compatibility mode, which can only be set at creation'
    ],
    answer: 0,
    explanation: 'The XML API is interoperable with many S3 tools and libraries: change the endpoint to storage.googleapis.com and authenticate with HMAC keys, ideally tied to a service account. The JSON API is not S3-compatible, Cloud Shell does not translate calls, and there is no compatibility mode setting.'
  },
  {
    id: 'ace-m3-019',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Object Versioning is enabled on a bucket. Someone overwrote report.pdf with a bad version yesterday. How do you bring back the previous version?',
    options: [
      'Copy the noncurrent generation over the live object, for example `gcloud storage cp gs://b/report.pdf#GEN gs://b/report.pdf`',
      'Run `gcloud storage restore gs://b/report.pdf --previous`, which swaps the live and previous versions in place',
      'Open a support case, because noncurrent versions of objects can only be read by Google Cloud Support',
      'Turn off Object Versioning on the bucket, which promotes the previous version back to the live object'
    ],
    answer: 0,
    explanation: 'With versioning, an overwrite keeps the old data as a noncurrent version with its own generation number (`gcloud storage ls -a` lists them); copying that generation onto the name makes it live again. Turning versioning off does not restore anything, and you can read noncurrent versions yourself.'
  },
  {
    id: 'ace-m3-020',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A user deleted an object two days ago in a bucket that has the default soft delete policy but no versioning. Can you get it back?',
    options: [
      'Yes: soft-deleted objects are kept for 7 days by default and can be restored with `gcloud storage restore`',
      'No: without Object Versioning, deleted objects are gone the moment they are deleted from the bucket',
      'Yes, but only by asking Google Cloud Support, who can recover any object for up to 30 days',
      'Only if the object was in the Archive class, because only Archive keeps deleted data for a while'
    ],
    answer: 0,
    explanation: 'Soft delete keeps deleted objects for a retention window — 7 days by default, configurable from 7 to 90 days — during which they can be listed and restored. It works without versioning and applies to every storage class; restoring is self-service.'
  },
  {
    id: 'ace-m3-021',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A scratch bucket holds temporary files that are rewritten constantly, and soft-deleted data now makes up a large part of its bill. Recovery of deleted files is never needed. What should you do?',
    options: [
      'Set the bucket’s soft delete retention to 0 to turn soft delete off for that bucket',
      'Enable Object Versioning, which replaces soft delete and stores data more cheaply',
      'Move the bucket to Archive, where soft-deleted data is billed at a lower rate',
      'Add a lifecycle rule that deletes soft-deleted objects after one hour'
    ],
    answer: 0,
    explanation: 'Soft-deleted objects are billed for their retention period, so for buckets of short-lived data where recovery is not needed, setting the retention to 0 disables soft delete. Versioning keeps even more data, Archive makes frequent writes and deletes more expensive, and lifecycle rules do not act on soft-deleted objects.'
  },
  {
    id: 'ace-m3-022',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You want protection against accidental deletion of objects for two weeks, but you do not want to keep a copy of every overwrite of every object. Which feature fits best?',
    options: [
      'Soft delete with a 14-day retention duration',
      'Object Versioning with no lifecycle rules',
      'A locked retention policy of 14 days',
      'Autoclass with a 14-day transition'
    ],
    answer: 0,
    explanation: 'Soft delete keeps deleted (and overwritten) data only for the retention window and needs no version management. Versioning with no rules keeps every noncurrent version forever, a locked retention policy blocks deletes entirely, and Autoclass changes storage classes.'
  },
  {
    id: 'ace-m3-023',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'A customer without a Google account must download one invoice from a private bucket within the next hour. What should you give them?',
    options: [
      'A signed URL for the object that expires in one hour',
      'The object’s public URL after granting allUsers access',
      'A copy of a service account key for the bucket',
      'Storage Object Viewer on the bucket for their email address'
    ],
    answer: 0,
    explanation: 'A signed URL embeds a time-limited credential for one object, so anyone with the link can download it until it expires (created with `gcloud storage sign-url`, using a key or impersonation). Making it public exposes it to everyone, keys must never be shared, and IAM grants need a Google identity.'
  },
  {
    id: 'ace-m3-024',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A partner asks for a V4 signed URL that stays valid for 30 days. What should you tell them?',
    options: [
      'V4 signed URLs can be valid for at most 7 days, so a new URL is needed weekly',
      'Signed URLs never expire unless you revoke them from the bucket settings',
      'Signed URLs last 30 days by default, so the default settings already work',
      'Signed URLs can last up to one year if the bucket uses the Standard class'
    ],
    answer: 0,
    explanation: 'The maximum expiration for V4 signed URLs is 7 days (604,800 seconds). For longer access, issue new URLs on a schedule or give the partner a proper identity with IAM. Expiration does not depend on storage class.'
  },
  {
    id: 'ace-m3-025',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Users of a mobile app should upload photos directly to a private bucket without the files passing through your backend, and without having Google identities. What should the backend give each upload?',
    options: [
      'A short-lived signed URL that allows a PUT of that one object',
      'The bucket name, after granting allUsers Storage Object Creator',
      'A service account key embedded in the mobile application',
      'An HMAC key created for each user of the mobile app'
    ],
    answer: 0,
    explanation: 'Signed URLs can authorise writes as well as reads, so the backend signs a PUT for one object name and the app uploads straight to Cloud Storage. Public write access, embedded keys and per-user HMAC keys would all expose long-lived credentials or the whole bucket.'
  },
  {
    id: 'ace-m3-026',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Images served from a bucket through Cloud CDN should be cached for one day by browsers and the CDN. How should you set this on the existing objects?',
    options: [
      '`gcloud storage objects update gs://ace-img-123/** --cache-control="public, max-age=86400"`',
      '`gcloud storage buckets update gs://ace-img-123 --cache-control-default="max-age=86400"`',
      '`gcloud storage objects describe gs://ace-img-123/** --format="value(cacheControl)"`',
      '`gcloud storage cp gs://ace-img-123/** gs://ace-img-123/ --ttl=24h --recursive`'
    ],
    answer: 0,
    explanation: 'Cache-Control is object metadata and can be updated in place with `gcloud storage objects update --cache-control`; CDNs and browsers honour it. Buckets have no default Cache-Control setting, `describe` only reads metadata, and `cp` has no TTL flag.'
  },
  {
    id: 'ace-m3-027',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A legacy application on GKE expects to read model files from a local directory path, but the files live in a Cloud Storage bucket. You do not want to change the code. What should you use?',
    options: [
      'Cloud Storage FUSE, mounting the bucket as a volume through the GKE CSI driver',
      'A Filestore instance with a copy of the bucket’s files refreshed every hour',
      'A persistent disk created from the bucket with `gcloud compute disks create`',
      'An init container that downloads the whole bucket at every Pod start'
    ],
    answer: 0,
    explanation: 'Cloud Storage FUSE mounts a bucket as a file system, and on GKE the Cloud Storage FUSE CSI driver exposes it as a Pod volume, so the code reads files from a path. A Filestore copy or init downloads duplicate data and drift, and disks cannot be created from buckets.'
  },

  // ── Lifecycle rules, retention and access control ──
  {
    id: 'ace-m3-028',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Logs land in Standard storage. They should move to Nearline after 30 days, to Coldline after 90 days, and be deleted after 365 days. How do you configure this?',
    options: [
      'Lifecycle rules: SetStorageClass NEARLINE at age 30, SetStorageClass COLDLINE at age 90, Delete at age 365',
      'Lifecycle rules: SetStorageClass NEARLINE at age 30, COLDLINE at age 60, Delete at age 275',
      'Autoclass with a 30-day transition, plus a retention policy of 365 days on the bucket',
      'A daily Cloud Run job that rewrites each object into the next class and deletes old ones'
    ],
    answer: 0,
    explanation: 'Lifecycle age is measured from each object’s creation time, so the rules use 30, 90 and 365 directly — not time since the last change of class. Autoclass ignores your schedule and a retention policy blocks deletion rather than performing it, and a custom job is unnecessary.'
  },
  {
    id: 'ace-m3-029',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A versioned bucket keeps every old version of frequently updated files, and storage keeps growing. You want to keep only the three most recent noncurrent versions of each object. Which lifecycle condition should you use?',
    options: [
      'Delete with numNewerVersions: 3',
      'Delete with age: 3',
      'SetStorageClass with isLive: true',
      'Delete with matchesStorageClass: STANDARD'
    ],
    answer: 0,
    explanation: '`numNewerVersions` counts how many newer versions an object version has; deleting versions with 3 or more newer ones keeps the latest three noncurrent versions plus the live one. Age is in days, `isLive: true` targets live objects, and a storage class match would delete live objects too.'
  },
  {
    id: 'ace-m3-030',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'In a versioned bucket, noncurrent versions should be deleted 30 days after they stop being the live version, no matter how old the object itself is. Which lifecycle condition fits?',
    options: [
      'Delete with daysSinceNoncurrentTime: 30',
      'Delete with age: 30 and isLive: true',
      'Delete with createdBefore set to 30 days ago',
      'Delete with daysSinceCustomTime: 30'
    ],
    answer: 0,
    explanation: '`daysSinceNoncurrentTime` counts days since a version became noncurrent, which is exactly the requirement. `age` counts from creation (and isLive: true would target the current version), `createdBefore` is a fixed date, and custom time is a field you set yourself.'
  },
  {
    id: 'ace-m3-031',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A tool using the XML API leaves behind parts of multipart uploads that never finish, and you pay for them. What lifecycle action cleans these up?',
    options: [
      'AbortIncompleteMultipartUpload with an age condition',
      'Delete with an isLive: false condition',
      'SetStorageClass ARCHIVE with an age condition',
      'Delete with a numNewerVersions condition'
    ],
    answer: 0,
    explanation: 'The AbortIncompleteMultipartUpload lifecycle action removes multipart uploads that were started but not completed after the given age. Ordinary delete rules act on objects, and unfinished upload parts are not objects yet.'
  },
  {
    id: 'ace-m3-032',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'You added a lifecycle rule to delete objects older than 30 days. An hour later, objects that are 40 days old are still in the bucket. What should you do?',
    options: [
      'Wait: lifecycle actions run asynchronously and can take up to 24 hours to apply',
      'Re-create the rule with `--force`, because new rules need a manual trigger',
      'Enable Object Versioning, which lifecycle rules need in order to delete',
      'Run `gcloud storage rm` on the objects, because rules only apply to new objects'
    ],
    answer: 0,
    explanation: 'Lifecycle management evaluates objects asynchronously, and a new or changed configuration can take up to 24 hours to take effect; rules apply to existing objects as well as new ones. No versioning or manual trigger is needed.'
  },
  {
    id: 'ace-m3-033',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Financial records in a bucket must not be deleted or overwritten by anyone for five years after they are written. What should you configure on the bucket?',
    options: ['A five-year retention policy', 'Object Versioning with no rules', 'A five-year soft delete duration', 'Uniform bucket-level access'],
    answer: 0,
    explanation: 'A retention policy blocks deleting or replacing any object until it is older than the retention period, for every user. Versioning keeps old copies but allows deletion, soft delete retention cannot be set to five years and still allows deletes, and uniform access controls who can access, not for how long data is kept.'
  },
  {
    id: 'ace-m3-034',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Regulators require that the five-year retention policy on a bucket can never be shortened or removed, not even by an administrator. What should you do, and what is the consequence?',
    options: [
      'Lock the retention policy; it can then only be increased, and the bucket cannot be deleted until all objects expire',
      'Lock the retention policy; it can be unlocked later by a project Owner within 30 days of locking',
      'Enable public access prevention, which makes the retention policy permanent for the bucket',
      'Create an IAM deny policy on the bucket that blocks storage.buckets.update for everyone'
    ],
    answer: 0,
    explanation: 'Bucket Lock makes the retention policy permanent: it can be lengthened but never reduced or removed, and the bucket can only be deleted once every object has met the retention period. Locking cannot be undone. Public access prevention and deny policies do not lock retention.'
  },
  {
    id: 'ace-m3-035',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Insurance documents must be kept for seven years after a claim closes, but the closing date is not known when the document is uploaded. What should you use?',
    options: [
      'An event-based hold, released when the claim closes, with a seven-year retention policy',
      'A temporary hold that is removed after exactly seven years by a scheduled job',
      'A lifecycle rule that deletes each document seven years after it is created',
      'A soft delete duration of seven years on the bucket'
    ],
    answer: 0,
    explanation: 'With an event-based hold, the retention period starts counting only when the hold is released, so releasing it at claim closure gives seven years from that event. Temporary holds do not affect the retention clock, age-based rules count from upload, and soft delete cannot last seven years.'
  },
  {
    id: 'ace-m3-036',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Objects in one bucket need different retention periods — some one year, others ten years — each enforced so that it cannot be deleted early. What should you use?',
    options: [
      'Object Retention Lock, setting a retention configuration on each object',
      'One bucket retention policy set to the longest period of ten years',
      'Two lifecycle rules with different age conditions on the bucket',
      'Temporary holds on the objects that need the longer period'
    ],
    answer: 0,
    explanation: 'Object Retention Lock (enabled on the bucket) lets each object carry its own retain-until time, in unlocked or locked mode. A bucket-wide policy applies one period to everything, lifecycle rules delete rather than protect, and temporary holds have no end date.'
  },
  {
    id: 'ace-m3-037',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You enabled uniform bucket-level access on a bucket, and an old application that relied on object ACLs broke. Can you go back?',
    options: [
      'Yes, within 90 days of enabling it; after that, uniform access is permanent for the bucket',
      'No; uniform bucket-level access can never be turned off once it has been enabled',
      'Yes, at any time, and the original ACLs are rebuilt from the bucket’s IAM policy',
      'Only by deleting the bucket and recreating it with the same name and old ACLs'
    ],
    answer: 0,
    explanation: 'Uniform bucket-level access can be disabled within 90 days, and object ACLs that existed before are restored; after 90 days the setting becomes permanent. Plan migrations away from ACLs before relying on uniform access.'
  },
  {
    id: 'ace-m3-038',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A legacy workflow must grant read access to individual objects for different users, inside the same bucket. Which access control model supports this?',
    options: [
      'Fine-grained access with object ACLs, with uniform bucket-level access off',
      'Uniform bucket-level access with a separate IAM binding for each object',
      'Uniform bucket-level access with public access prevention enforced',
      'Bucket-level IAM roles granted to each user on the whole bucket'
    ],
    answer: 0,
    explanation: 'Per-object permissions are what ACLs provide, so the bucket must use fine-grained access. With uniform access, IAM applies to the whole bucket (or managed folders), not to individual objects. Google recommends uniform access for new designs, often with signed URLs or separate buckets instead.'
  },
  {
    id: 'ace-m3-039',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'easy',
    prompt: 'One bucket holds customer data and must never be made public, even if someone tries to grant allUsers. What should you set on the bucket?',
    options: [
      'Public access prevention set to enforced',
      'Object Versioning turned on for the bucket',
      'A retention policy of one year on the bucket',
      'The Standard storage class on every object'
    ],
    answer: 0,
    explanation: 'Enforced public access prevention (`gcloud storage buckets update --public-access-prevention`) blocks allUsers and allAuthenticatedUsers grants and public ACLs on the bucket. The organization policy of the same name applies it more widely. Versioning, retention and storage class do not affect exposure.'
  },
  {
    id: 'ace-m3-040',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A team should manage access separately for two prefixes of one bucket — invoices/ and receipts/ — with IAM, and uniform bucket-level access is enabled. What can they use?',
    options: [
      'Managed folders for the two prefixes, each with its own IAM policy',
      'Object ACLs on every object under each prefix, set by a script',
      'IAM conditions on each user’s personal email address in the bucket',
      'Two retention policies on the bucket, one for each of the prefixes'
    ],
    answer: 0,
    explanation: 'Managed folders let you attach IAM policies to a folder-like prefix inside a bucket that uses uniform access. ACLs are disabled under uniform access, retention policies do not grant access, and conditions on emails are not how prefixes are scoped.'
  },

  // ── Cloud SQL ──
  {
    id: 'ace-m3-041',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A company is moving an on-premises application that uses Microsoft SQL Server and wants a managed database with minimal changes. What should it choose?',
    options: ['Cloud SQL for SQL Server', 'Spanner with the PostgreSQL interface', 'AlloyDB for PostgreSQL', 'Firestore in Datastore mode'],
    answer: 0,
    explanation: 'Cloud SQL runs managed MySQL, PostgreSQL and SQL Server, so a SQL Server application can move with few changes. Spanner and AlloyDB would need the schema and code ported, and Firestore is a document database.'
  },
  {
    id: 'ace-m3-042',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL instance is configured for high availability (regional). What happens if its primary zone fails?',
    options: [
      'It fails over automatically to the standby in another zone and keeps the same IP address',
      'Read replicas in the region are promoted one by one until one of them takes over',
      'The instance stays down until you restore the latest backup into another zone',
      'Traffic is split between the primary and standby until the zone recovers'
    ],
    answer: 0,
    explanation: 'An HA Cloud SQL instance has a primary and a standby in different zones of the region with synchronous replication; on failure it fails over automatically and clients reconnect to the same IP. Read replicas are not part of HA, and the standby does not serve traffic until a failover.'
  },
  {
    id: 'ace-m3-043',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Reporting queries are slowing down a Cloud SQL for PostgreSQL primary. You want to offload them without changing the write path. What should you add?',
    options: [
      'A read replica and point the reporting tool at it',
      'High availability, so the standby serves the reports',
      'A larger disk, so that reports read from more IOPS',
      'A second primary instance kept in sync by a cron job'
    ],
    answer: 0,
    explanation: 'Read replicas receive changes asynchronously and serve read-only traffic, which takes reporting load off the primary. The HA standby does not accept connections, disk size does not remove the contention, and Cloud SQL has no multi-primary option.'
  },
  {
    id: 'ace-m3-044',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'A Cloud SQL for MySQL database must be recoverable quickly if its whole region becomes unavailable, with minimal data loss. What should you set up?',
    options: [
      'A cross-region read replica that can be promoted in the other region',
      'High availability with the standby in another zone of the same region',
      'Daily on-demand backups kept in the same region as the instance',
      'A larger machine type with automatic storage increase turned on'
    ],
    answer: 0,
    explanation: 'A cross-region replica keeps an asynchronously updated copy in another region; in a regional outage you promote it (Enterprise Plus also offers managed disaster recovery switchover with a DR replica). Zonal HA does not survive a regional outage, same-region backups share its fate, and sizing does not help.'
  },
  {
    id: 'ace-m3-045',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Policy requires 30 daily automated backups of a Cloud SQL instance to be retained, but only 7 are kept. What should you change?',
    options: [
      'Set the number of retained automated backups to 30',
      'Take 23 extra on-demand backups every month by hand',
      'Enable point-in-time recovery with 30 days of logs',
      'Export the database to Cloud Storage once a month'
    ],
    answer: 0,
    explanation: 'Cloud SQL keeps 7 automated backups by default and lets you retain up to 365 (`--retained-backups-count`). Manual on-demand backups work but are error-prone, PITR log retention is a separate, shorter window, and a monthly export does not meet a daily requirement.'
  },
  {
    id: 'ace-m3-046',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A developer dropped a table at 14:05 by mistake. You need the Cloud SQL for MySQL data as it was at 14:04. Point-in-time recovery is enabled. What happens when you use it?',
    options: [
      'A new instance is created with the data as of 14:04, which you can then use or copy from',
      'The existing instance is rewound in place to 14:04, and changes after that are discarded',
      'Only the dropped table is restored into the existing instance at its 14:04 state',
      'The latest automated backup from before 14:04 overwrites the existing instance'
    ],
    answer: 0,
    explanation: 'Point-in-time recovery clones the instance to a new instance at the chosen time, using backups and binary logs (WAL on PostgreSQL); the original keeps running untouched. You then repoint the app or copy the table back. It does not rewind or partially restore the original instance.'
  },
  {
    id: 'ace-m3-047',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'A team needs point-in-time recovery to any moment in the last 30 days for a Cloud SQL instance. What must be true?',
    options: [
      'The instance uses Enterprise Plus edition, which keeps up to 35 days of transaction logs',
      'The instance uses Enterprise edition, which keeps up to 35 days of transaction logs',
      'The instance has high availability enabled, which doubles the PITR window to 30 days',
      'The instance has 30 read replicas, one for each of the days in the window'
    ],
    answer: 0,
    explanation: 'Point-in-time recovery can reach back as far as the transaction logs are retained: up to 7 days on Enterprise edition and up to 35 days on Enterprise Plus. High availability and replicas do not extend the window.'
  },
  {
    id: 'ace-m3-048',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You need to load last night’s backup of the instance orders-db into a separate test instance, orders-test, to check a fix. Which command should you use?',
    options: [
      '`gcloud sql backups restore BACKUP_ID --restore-instance=orders-test --backup-instance=orders-db`',
      '`gcloud sql instances clone orders-db orders-test --backup-id=BACKUP_ID --async`',
      '`gcloud sql backups restore BACKUP_ID --restore-instance=orders-db --backup-instance=orders-db`',
      '`gcloud sql import sql orders-test BACKUP_ID --database=orders --async`'
    ],
    answer: 0,
    explanation: 'A backup can be restored into a different instance by naming it as the restore instance; its current data is overwritten with the backup. Restoring into orders-db would overwrite production, the clone syntax is wrong, and `sql import` takes a SQL file in Cloud Storage, not a backup ID.'
  },
  {
    id: 'ace-m3-049',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A payments database on Cloud SQL needs a 99.99% availability SLA and maintenance downtime of under a second. Which configuration meets this?',
    options: [
      'Cloud SQL Enterprise Plus edition with high availability',
      'Cloud SQL Enterprise edition with two read replicas',
      'Cloud SQL Enterprise edition with a larger machine type',
      'Cloud SQL Enterprise edition with daily on-demand backups'
    ],
    answer: 0,
    explanation: 'Enterprise Plus offers a 99.99% SLA (with HA) and near-zero-downtime maintenance, plus a data cache and higher performance. Enterprise edition’s SLA is 99.95%, and replicas, size or backups do not change it.'
  },
  {
    id: 'ace-m3-050',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Applications on GKE must connect securely to a Cloud SQL instance with IAM-based authorisation and encryption, without managing SSL certificates or allow-listing IPs. What should they use?',
    options: [
      'The Cloud SQL Auth Proxy (or a Cloud SQL language connector) in the application',
      'A public IP on the instance with the cluster’s node IPs as authorized networks',
      'An SSH tunnel through a bastion VM that forwards the database port',
      'A self-signed certificate copied into every Pod at deploy time'
    ],
    answer: 0,
    explanation: 'The Cloud SQL Auth Proxy and the language connectors authorise connections with IAM and encrypt them with automatically rotated certificates, over private or public IP. Authorized networks with node IPs are fragile, bastions add infrastructure, and hand-managed certificates are what the proxy removes.'
  },
  {
    id: 'ace-m3-051',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Security wants database users on Cloud SQL for PostgreSQL to be the same identities as in Google Cloud, with no database passwords to rotate. What should you enable?',
    options: [
      'IAM database authentication, adding IAM users and service accounts as database users',
      'A stronger password policy on the instance with 30-day password rotation',
      'SSL mode "require" on the instance with client certificates for every user',
      'Private IP for the instance so that only VPC clients can reach it at all'
    ],
    answer: 0,
    explanation: 'IAM database authentication lets IAM principals log in with short-lived OAuth tokens instead of passwords, so access follows IAM and leavers are removed in one place. Password policies, SSL modes and private IP are useful, but none of them removes database passwords.'
  },
  {
    id: 'ace-m3-052',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Cloud SQL maintenance must never happen on weekday business hours, and not at all during the two weeks of the annual sale. What should you configure?',
    options: [
      'A maintenance window on Sunday night plus a deny maintenance period for the sale',
      'High availability, because HA instances are never taken down for maintenance',
      'A read replica, so that maintenance is applied to the replica instead',
      'Nothing: Cloud SQL only performs maintenance when you request it'
    ],
    answer: 0,
    explanation: 'The maintenance window sets the preferred day and hour for updates, and a deny maintenance period blocks maintenance for up to 90 days around critical events. HA reduces but does not remove maintenance impact, replicas are updated too, and Google does schedule maintenance.'
  },
  {
    id: 'ace-m3-053',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A Cloud SQL instance with automatic storage increase grew to 2 TB during a data import, and only 300 GB is used now. Can you shrink the storage back?',
    options: [
      'No; Cloud SQL storage can only grow, so you would migrate to a new, smaller instance',
      'Yes; set a smaller size with `gcloud sql instances patch --storage-size`',
      'Yes; turn automatic storage increase off and the disk shrinks overnight',
      'Yes; restart the instance, which releases the space that is not used'
    ],
    answer: 0,
    explanation: 'Cloud SQL storage can be increased (manually or automatically) but never decreased. To reduce it, export the data and import it into a new instance with smaller storage (or use Database Migration Service). Consider setting a limit on automatic increases.'
  },
  {
    id: 'ace-m3-054',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'You export a large Cloud SQL database to gs://ace-exports-123 every night. The export fails with a permission error, and it also slows the production instance down. What should you do?',
    options: [
      'Grant the instance’s service account write access on the bucket, and use serverless export',
      'Grant your own user account Storage Admin on the bucket, and run the export at midday',
      'Make the bucket public for the duration of the export, and add a read replica',
      'Grant the Cloud Build service account Cloud SQL Admin, and export with Cloud Build'
    ],
    answer: 0,
    explanation: 'Cloud SQL writes exports with the instance’s own service account, so that account needs write access (for example Storage Object Creator) on the bucket. Serverless export runs the export on a temporary instance, so the primary is not slowed down. Your own permissions are not what writes the file, and public buckets are never the answer.'
  },

  // ── AlloyDB and Spanner ──
  {
    id: 'ace-m3-055',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A PostgreSQL application runs heavy transactions and, on the same data, analytical queries that are too slow on Cloud SQL. The team wants to stay PostgreSQL-compatible. What should they consider?',
    options: [
      'AlloyDB for PostgreSQL, using its columnar engine for the analytical queries',
      'Spanner with the GoogleSQL dialect, rewriting the schema and queries',
      'Bigtable, because wide-column tables answer analytical queries faster',
      'Memorystore for Redis, caching the results of every analytical query'
    ],
    answer: 0,
    explanation: 'AlloyDB is PostgreSQL-compatible and adds a columnar engine that accelerates analytical queries on transactional data, alongside higher transactional performance and a 99.99% SLA. Spanner and Bigtable mean redesigning, and caching every query is not a substitute for faster analytics.'
  },
  {
    id: 'ace-m3-056',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An AlloyDB cluster’s primary instance is busy, and most of the load is read-only queries from dashboards. How should you scale out the reads?',
    options: [
      'Add a read pool instance with several nodes and point the dashboards at it',
      'Create a second primary instance in the cluster to share the read load',
      'Increase the primary’s storage size, which raises its read throughput',
      'Export the data to BigQuery every minute and query it there instead'
    ],
    answer: 0,
    explanation: 'AlloyDB read pool instances serve read-only traffic from one or more nodes behind a single endpoint, offloading the primary. A cluster has one primary, storage size does not change compute, and a minute-by-minute export is a pipeline to run.'
  },
  {
    id: 'ace-m3-057',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A product catalogue in PostgreSQL needs semantic search: finding similar products from vector embeddings, next to normal SQL queries, without another database. Which option fits best?',
    options: [
      'AlloyDB AI, storing embeddings and running vector search inside the database',
      'Memorystore for Redis, holding the embeddings in memory for each query',
      'Cloud Storage, keeping the embeddings as JSON files read by the app',
      'Firestore in Datastore mode, with a composite index on the embeddings'
    ],
    answer: 0,
    explanation: 'AlloyDB AI supports vector embeddings (generated in the database through model integration) and fast vector search with SQL, so semantic search sits next to the transactional data. Caches, files and document databases would mean building the similarity search yourself.'
  },
  {
    id: 'ace-m3-058',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'An AlloyDB cluster in asia-southeast2 must be recoverable in another region if the whole region is lost. What should you configure?',
    options: [
      'A secondary cluster in another region with cross-region replication',
      'A read pool instance in a second zone of the same region',
      'High availability on the primary instance across two zones',
      'Daily exports of the cluster to a bucket in the same region'
    ],
    answer: 0,
    explanation: 'AlloyDB cross-region replication keeps a secondary cluster in another region, which can be promoted in a regional disaster. Read pools and primary HA stay within one region, and same-region exports share the region’s fate.'
  },
  {
    id: 'ace-m3-059',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A global ledger needs a relational schema with SQL, strongly consistent transactions across continents, and horizontal scaling to very high write volumes. Which database fits?',
    options: ['Spanner', 'Cloud SQL for MySQL', 'Bigtable', 'Firestore'],
    answer: 0,
    explanation: 'Spanner combines relational schemas and SQL with external consistency across regions and horizontal scale. Cloud SQL scales vertically within a region, Bigtable is wide-column NoSQL without multi-row SQL transactions, and Firestore is a document database.'
  },
  {
    id: 'ace-m3-060',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A new Spanner database is small today but must use Spanner’s guarantees from the start. You want to begin with the smallest compute capacity. What can you provision?',
    options: [
      '100 processing units, a tenth of a node, and add more as it grows',
      'At least three nodes, because Spanner needs one node per zone',
      'At least one node, because capacity is sold only in whole nodes',
      'Zero capacity, because Spanner bills purely per query it runs'
    ],
    answer: 0,
    explanation: 'Spanner capacity is measured in processing units: 1,000 PU equals one node, and instances can start at 100 PU and grow in steps. Spanner is not billed per query, and zones are handled for you.'
  },
  {
    id: 'ace-m3-061',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Spanner instance’s load rises sharply during business hours and drops at night. You want compute capacity to follow CPU utilization automatically, within limits. What should you use?',
    options: [
      'Spanner’s managed autoscaler, with minimum and maximum processing units',
      'A Cloud Scheduler job that doubles the node count every morning',
      'A read replica that is added in each region during the day',
      'A larger fixed capacity, sized for the busiest hour of the day'
    ],
    answer: 0,
    explanation: 'The managed autoscaler adjusts an instance’s compute capacity between limits you set, based on CPU and storage utilization targets. Scheduled jobs guess at load, read replicas are about locations, and a fixed peak size wastes money at night.'
  },
  {
    id: 'ace-m3-062',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'Writes to a Spanner table are concentrated on one server, because the primary key is an ever-increasing order number. How should you redesign the key?',
    options: [
      'Use a UUID (version 4) or a bit-reversed sequence, so new keys spread across the key space',
      'Use the current timestamp as the key, so that new rows are always sorted by time',
      'Add a secondary index on the order number, which spreads the writes automatically',
      'Increase the number of nodes, which removes hotspots for any key design'
    ],
    answer: 0,
    explanation: 'Spanner splits data by key ranges, so monotonically increasing keys send every new write to the same split. Random UUIDs or bit-reversed sequences distribute writes. A timestamp key has the same problem, indexes do not change where rows are written, and more nodes cannot split a single hot range.'
  },
  {
    id: 'ace-m3-063',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Spanner database must use a multi-region configuration for a 99.999% availability SLA. Which edition is required?',
    options: ['Enterprise Plus', 'Enterprise', 'Standard', 'Any edition'],
    answer: 0,
    explanation: 'Spanner editions differ in features and SLAs: multi-region (and dual-region) configurations with up to 99.999% availability come with Enterprise Plus, while Standard and Enterprise are regional with 99.99%. Moving down an edition requires a regional configuration first.'
  },
  {
    id: 'ace-m3-064',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A regional web shop uses MySQL with a few hundred transactions per second and a 200 GB database. Someone suggests Spanner. What is the most cost-effective choice?',
    options: [
      'Cloud SQL for MySQL with high availability, which fits this scale at lower cost',
      'Spanner with multiple regions, because every relational database belongs there',
      'Bigtable, because it is cheaper than relational databases at any scale',
      'AlloyDB, because MySQL applications can connect to it without changes'
    ],
    answer: 0,
    explanation: 'Spanner is justified for very large scale, global strong consistency or 99.999% availability; a modest regional MySQL workload is well served by Cloud SQL. Bigtable is NoSQL, and AlloyDB is PostgreSQL-compatible, not MySQL.'
  },

  // ── Firestore, Bigtable, Memorystore and BigQuery ──
  {
    id: 'ace-m3-065',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A mobile app needs a serverless database with real-time updates to clients, offline support and per-user documents. Which database fits?',
    options: ['Firestore', 'Cloud SQL', 'Bigtable', 'BigQuery'],
    answer: 0,
    explanation: 'Firestore is a serverless document database with real-time listeners and offline support in its mobile and web SDKs. Cloud SQL is relational, Bigtable targets massive analytical and time-series workloads, and BigQuery is a data warehouse.'
  },
  {
    id: 'ace-m3-066',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'You are creating a new Firestore database for a new application. When would you choose Datastore mode over Native mode?',
    options: [
      'When server code already uses the Datastore API and does not need real-time listeners',
      'When the app needs real-time listeners and offline support for mobile clients',
      'When the database must hold more than 1 TB of documents at the same time',
      'When the data must be stored in a multi-region location for availability'
    ],
    answer: 0,
    explanation: 'Datastore mode keeps the Datastore API and behaviour for server workloads, without Native mode’s real-time and mobile features; Native mode is recommended for new apps. Size and location are available in both.'
  },
  {
    id: 'ace-m3-067',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Firestore query filters on status and sorts by createdAt, and it fails with an error containing a link. What is needed?',
    options: [
      'A composite index on status and createdAt, which the link helps create',
      'A larger Firestore instance size, because the query is too expensive',
      'A Datastore mode database, because Native mode cannot sort results',
      'A BigQuery export of the collection, because Firestore cannot filter'
    ],
    answer: 0,
    explanation: 'Firestore creates single-field indexes automatically, but queries combining filters and ordering on several fields need a composite index; the error links to a pre-filled index definition. Firestore has no instance sizes and both modes support sorting.'
  },
  {
    id: 'ace-m3-068',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Millions of sensors send readings every second, and the application reads recent readings per sensor with single-digit millisecond latency. Which database fits best?',
    options: ['Bigtable', 'Cloud SQL', 'Firestore', 'Cloud Storage'],
    answer: 0,
    explanation: 'Bigtable is a wide-column NoSQL database built for very high write throughput and low-latency reads by row key, typical of time-series and IoT data. Cloud SQL and Firestore do not scale writes like this, and Cloud Storage is object storage.'
  },
  {
    id: 'ace-m3-069',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'In Bigtable, readings are written with row keys that start with the timestamp, and one node is overloaded. Which row key design spreads the load while keeping one sensor’s data together?',
    options: [
      'sensorId#reverseTimestamp',
      'timestamp#sensorId',
      'A random number for every row',
      'The date only, such as 2026-10-29'
    ],
    answer: 0,
    explanation: 'Leading with the sensor ID spreads writes across the key space, and a reversed timestamp keeps each sensor’s newest readings first for efficient scans. A leading timestamp sends all new writes to one place, random keys break range reads per sensor, and a date-only key creates huge hot rows.'
  },
  {
    id: 'ace-m3-070',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Bigtable instance must keep serving if a zone fails, with traffic automatically routed to a healthy cluster. What should you configure?',
    options: [
      'A second cluster in another zone, and an app profile with multi-cluster routing',
      'A larger single cluster with more nodes, all in the same zone as today',
      'Daily Bigtable backups stored in a different zone of the same region',
      'A read replica of the table in Cloud SQL, used as a fallback for reads'
    ],
    answer: 0,
    explanation: 'Bigtable replication copies data between clusters in different zones or regions, and multi-cluster routing sends requests to the nearest available cluster, failing over automatically. More nodes in one zone do not survive that zone, and backups need a restore.'
  },
  {
    id: 'ace-m3-071',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You want to check, from the command line, the contents of the row with key sensor-42#9999 in the Bigtable table readings. Which tool and command fit?',
    options: [
      '`cbt -instance=iot lookup readings sensor-42#9999`',
      '`bq query "SELECT * FROM readings WHERE key=\'sensor-42#9999\'"`',
      '`gcloud bigtable rows describe sensor-42#9999 --table=readings`',
      '`gcloud firestore documents get readings/sensor-42#9999`'
    ],
    answer: 0,
    explanation: '`cbt` is the command-line tool for Bigtable, and `lookup` reads a single row by key (`read` scans ranges). Bigtable Studio in the console offers a query builder and GoogleSQL too. bq queries BigQuery, there is no `rows describe` command, and Firestore is a different database.'
  },
  {
    id: 'ace-m3-072',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A web application needs a managed in-memory store for user sessions that survives the failure of a single node with automatic failover. Which option fits?',
    options: [
      'Memorystore for Redis, Standard tier',
      'Memorystore for Redis, Basic tier',
      'A Local SSD on each application VM',
      'A Cloud Storage bucket with Autoclass'
    ],
    answer: 0,
    explanation: 'The Standard tier adds a replica in another zone with automatic failover, while the Basic tier is a single node without replication. Local SSDs are not shared between VMs, and object storage is far too slow for session lookups.'
  },
  {
    id: 'ace-m3-073',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A cache must scale beyond a single node’s memory by sharding data across many nodes, using an open-source, Redis-compatible engine. Which managed service fits?',
    options: [
      'Memorystore for Valkey (or Memorystore for Redis Cluster)',
      'Memorystore for Redis, Basic tier with a larger node',
      'Memorystore for Memcached with one node per zone',
      'Firestore in Native mode with a TTL policy'
    ],
    answer: 0,
    explanation: 'Memorystore for Valkey and for Redis Cluster are cluster-mode services that shard data across nodes and scale out, with replicas for availability; Valkey is the open-source fork of Redis. A bigger Basic node still has one node’s limits, Memcached is a different protocol, and Firestore is not an in-memory cache.'
  },
  {
    id: 'ace-m3-074',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Analysts need to run SQL over 40 TB of sales history, with no servers or clusters to manage. Which product fits?',
    options: ['BigQuery', 'Cloud SQL for PostgreSQL', 'Bigtable', 'Memorystore'],
    answer: 0,
    explanation: 'BigQuery is a serverless data warehouse that runs SQL over terabytes to petabytes without provisioning. Cloud SQL is built for transactional workloads, Bigtable has no full SQL warehouse semantics, and Memorystore is a cache.'
  },
  {
    id: 'ace-m3-075',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Before running an expensive BigQuery query on on-demand pricing, you want to know how many bytes it will process, without running it. What should you do?',
    options: [
      'Run it as a dry run, for example `bq query --dry_run --use_legacy_sql=false "..."`',
      'Run it with `LIMIT 10`, which makes BigQuery scan only ten rows of each table',
      'Run it on a copy of the table in another dataset to compare the bill afterwards',
      'Check the size of the dataset in the console, which equals the cost of any query'
    ],
    answer: 0,
    explanation: 'A dry run validates the query and returns the bytes it would process, at no cost; the console shows the same estimate as you type. `LIMIT` does not reduce bytes scanned on regular tables, copies cost money, and dataset size is only an upper bound.'
  },
  {
    id: 'ace-m3-076',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You want to make sure a scheduled BigQuery query never processes more than 1 TB, failing instead of running up a bill if the data grows. What should you set?',
    options: [
      'A maximum bytes billed limit on the query',
      'A table expiration of one day on the dataset',
      'A budget alert at 1 TB on the billing account',
      'A `LIMIT 1000` clause at the end of the query'
    ],
    answer: 0,
    explanation: 'With maximum bytes billed (`--maximum_bytes_billed`), a query that would process more fails without being charged. Expiration deletes tables, budgets only notify after the fact, and `LIMIT` does not reduce the bytes scanned. Custom quotas can cap usage per user or project as well.'
  },
  {
    id: 'ace-m3-077',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Most queries on a 10 TB events table filter on the event date and the customer ID, yet each query scans the whole table. How should you reorganise the table to cut cost?',
    options: [
      'Partition the table by event date and cluster it by customer ID',
      'Split the table into one table for each customer ID',
      'Add a view that selects only the columns queries need',
      'Move the table to a dataset in a multi-region location'
    ],
    answer: 0,
    explanation: 'Partitioning by date lets queries skip partitions outside the filter, and clustering by customer ID sorts the data within partitions so less is read. Thousands of per-customer tables are hard to manage, views do not reduce bytes unless they prune, and location does not change bytes scanned.'
  },
  {
    id: 'ace-m3-078',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A data team runs heavy BigQuery workloads all day, and finance wants a predictable monthly cost rather than paying per byte scanned. What should they use?',
    options: [
      'BigQuery editions with a slot reservation (capacity pricing)',
      'On-demand pricing with a daily quota on bytes scanned',
      'Long-term storage pricing for all of the team’s tables',
      'Flat-rate storage pricing on the team’s datasets'
    ],
    answer: 0,
    explanation: 'Capacity pricing through BigQuery editions buys slots (with autoscaling and commitments), so compute cost is predictable regardless of bytes scanned. On-demand charges per TiB processed, quotas only cap usage, and storage pricing does not affect query cost.'
  },
  {
    id: 'ace-m3-079',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Several large BigQuery tables have not been modified for months. What happens to their storage cost?',
    options: [
      'Tables or partitions unmodified for 90 days move to long-term storage at about half the price',
      'Nothing changes; BigQuery charges the same storage price for all data at all times',
      'They are moved to Cloud Storage Archive automatically and must be loaded again later',
      'They are deleted after 90 days unless a retention policy is set on the dataset'
    ],
    answer: 0,
    explanation: 'BigQuery switches a table or partition to long-term storage pricing after 90 consecutive days without modification, roughly halving its storage cost, with no change in performance or availability. Nothing is moved or deleted.'
  },
  {
    id: 'ace-m3-080',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A faulty job overwrote rows in a BigQuery table two hours ago. You need the table as it was before the job ran. What should you use?',
    options: [
      'Time travel: query or copy the table with FOR SYSTEM_TIME AS OF a time before the job',
      'Cloud Storage soft delete, which keeps previous versions of every BigQuery table',
      'A point-in-time recovery clone, created with `gcloud sql instances clone`',
      'The billing export, which records the old values of every changed row'
    ],
    answer: 0,
    explanation: 'BigQuery time travel keeps changed and deleted data for a window (7 days by default, configurable from 2 to 7), so you can query the table as of an earlier time and restore it with a copy or CREATE TABLE AS SELECT. Soft delete and PITR belong to other products.'
  },

  // ── Pub/Sub, Dataflow and Managed Service for Apache Kafka ──
  {
    id: 'ace-m3-081',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'easy',
    prompt: 'You need a managed service that runs the same Apache Beam pipeline in batch and in streaming mode, scaling workers automatically. Which product is it?',
    options: ['Dataflow', 'Managed Service for Apache Spark', 'Cloud Composer', 'BigQuery Data Transfer Service'],
    answer: 0,
    explanation: 'Dataflow is the managed runner for Apache Beam pipelines, batch and streaming, with autoscaling. Managed Service for Apache Spark (formerly Dataproc) runs Spark and Hadoop, Cloud Composer orchestrates workflows with Airflow, and the transfer service schedules loads into BigQuery.'
  },
  {
    id: 'ace-m3-082',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Messages arriving on a Pub/Sub topic must be streamed into a BigQuery table with light transformations, and the team does not want to write a pipeline from scratch. What is the quickest option?',
    options: [
      'A Google-provided Dataflow template from Pub/Sub to BigQuery',
      'A Compute Engine VM running a custom consumer service',
      'A Cloud Composer DAG that polls the topic every minute',
      'A Cloud SQL instance that buffers the messages first'
    ],
    answer: 0,
    explanation: 'Google-provided Dataflow templates such as Pub/Sub to BigQuery deploy a managed streaming pipeline with a few parameters (and a JavaScript or Python UDF for light transforms). If no transformation were needed, a BigQuery subscription would do it without Dataflow. A VM, a polling DAG or a database buffer is more work.'
  },
  {
    id: 'ace-m3-083',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You need to check which Dataflow jobs are currently running in a region and whether any has failed today. What should you use?',
    options: [
      '`gcloud dataflow jobs list --region=asia-southeast2 --status=active` and the Dataflow jobs page in the console',
      '`gcloud compute instances list --filter="dataflow"` to count the worker VMs of every job',
      '`bq ls -j` in the project, because Dataflow jobs are listed as BigQuery jobs',
      '`kubectl get jobs -n dataflow`, because Dataflow runs its jobs on a GKE cluster'
    ],
    answer: 0,
    explanation: 'gcloud and the Dataflow console list jobs with their state (running, done, failed, cancelled, drained), and the job page shows the graph, metrics and logs. Worker VMs are an implementation detail, bq lists BigQuery jobs, and Dataflow is not run on a GKE cluster you can query.'
  },
  {
    id: 'ace-m3-084',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'You must stop a streaming Dataflow job to deploy a new version, without losing the data that is already being processed. What should you do?',
    options: [
      'Drain the job, so it stops reading new input but finishes processing what it has',
      'Cancel the job, which saves all buffered data to Cloud Storage automatically',
      'Delete the job’s worker VMs, so the job pauses until new workers start',
      'Stop the Pub/Sub topic, so the job runs out of data and stops by itself'
    ],
    answer: 0,
    explanation: 'Draining stops ingestion and lets the pipeline finish processing buffered data before the job stops; cancelling stops immediately and can lose in-flight data. Some updates can also be done in place with `--update`. Deleting workers or the topic is disruptive.'
  },
  {
    id: 'ace-m3-085',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A streaming Dataflow pipeline falls behind during traffic peaks, and you want it to add workers automatically and remove them afterwards. What should you configure?',
    options: [
      'Horizontal autoscaling with a suitable maximum number of workers',
      'A larger fixed number of workers for the whole day',
      'A Cloud Scheduler job that restarts the pipeline hourly',
      'A second pipeline reading the same subscription at peaks'
    ],
    answer: 0,
    explanation: 'Dataflow horizontal autoscaling adds and removes workers based on backlog and utilization, within the maximum you set (Streaming Engine makes it more responsive). A fixed size wastes money off-peak, restarts lose progress, and a second pipeline duplicates logic.'
  },
  {
    id: 'ace-m3-086',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'An event platform built on Apache Kafka, with Kafka clients and Kafka Connect, is moving to Google Cloud. The team wants managed Kafka with no client changes. What should they use?',
    options: [
      'Google Cloud Managed Service for Apache Kafka',
      'Pub/Sub, rewriting the producers and consumers',
      'Dataflow, reading from a self-managed Kafka on VMs',
      'Memorystore for Redis Streams as a replacement'
    ],
    answer: 0,
    explanation: 'Managed Service for Apache Kafka runs real Apache Kafka (and Kafka Connect clusters), so existing clients keep using the Kafka protocol while Google manages the brokers. Pub/Sub would mean rewriting clients, and self-managed Kafka or Redis Streams are not the managed Kafka the team asked for.'
  },
  {
    id: 'ace-m3-087',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'You are creating a Managed Service for Apache Kafka cluster with gcloud. What do you size it by?',
    options: [
      'Total vCPUs and memory for the cluster, plus the subnets it connects to',
      'The number of brokers and the disk size of each individual broker',
      'Messages per second, which Google converts into brokers for you',
      'Topics and partitions only, because the compute is fully serverless'
    ],
    answer: 0,
    explanation: '`gcloud managed-kafka clusters create` takes `--cpu` (at least 3 vCPUs), `--memory` (1 to 8 GiB per vCPU) and `--subnets`; the service decides the brokers and storage. Topics and partitions are created separately.'
  },
  {
    id: 'ace-m3-088',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A new application needs global, serverless messaging between services, with no partitions or brokers to size and automatic scaling. It has no existing Kafka code. What should you choose?',
    options: ['Pub/Sub', 'Managed Service for Apache Kafka', 'Cloud Tasks', 'Memorystore'],
    answer: 0,
    explanation: 'Pub/Sub is serverless and global: you create topics and subscriptions and it scales without capacity planning. Managed Kafka fits teams that need the Kafka API, Cloud Tasks dispatches individual tasks to one handler, and Memorystore is a cache.'
  },
  {
    id: 'ace-m3-089',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'hard',
    prompt: 'Events for each customer must be processed in the order they were published, while different customers can be processed in parallel. How do you achieve this with Pub/Sub?',
    options: [
      'Publish with the customer ID as the ordering key and enable message ordering on the subscription',
      'Create one topic per customer and run one subscriber thread for each topic',
      'Enable exactly-once delivery, which also guarantees the order of every message',
      'Set the acknowledgement deadline to the maximum so that messages arrive in order'
    ],
    answer: 0,
    explanation: 'Messages with the same ordering key are delivered in publish order to subscriptions with ordering enabled, while different keys are delivered in parallel. Per-customer topics do not scale, exactly-once is about duplicates, not order, and the ack deadline does not order messages.'
  },
  {
    id: 'ace-m3-090',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A new analytics subscriber, added today, must process the messages of the last two weeks that were published before its subscription existed. What makes this possible?',
    options: [
      'Topic message retention set to at least 14 days, then seeking the new subscription to that time',
      'A dead-letter topic, which keeps every message that was never delivered to anyone',
      'Exactly-once delivery, which stores every message until all subscribers have read it',
      'Message ordering, which keeps a copy of messages for each ordering key'
    ],
    answer: 0,
    explanation: 'With topic retention (up to 31 days), Pub/Sub keeps published messages on the topic, and a subscription can seek to a time within that window, even if it was created later. Dead-letter topics hold failed messages, and exactly-once and ordering do not retain history.'
  },

  // ── Customer-managed encryption keys ──
  {
    id: 'ace-m3-091',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'You try to create a bucket in asia-southeast2 that uses a Cloud KMS key from the us-central1 key ring, and it fails. Why?',
    options: [
      'The key’s location must be compatible with the bucket’s location, here asia-southeast2',
      'Cloud KMS keys can only be used by resources in the global location, not in regions',
      'CMEK for Cloud Storage only works with keys that are stored in Cloud HSM',
      'The key must be in the same project as the bucket that is using it for encryption'
    ],
    answer: 0,
    explanation: 'For CMEK, the key must be in a location that matches the resource — a bucket in asia-southeast2 needs a key in asia-southeast2 (multi-region buckets need a matching multi-region key). Keys can be in another project and do not need HSM.'
  },
  {
    id: 'ace-m3-092',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A BigQuery dataset is protected with a customer-managed key. What happens if an administrator disables that key version?',
    options: [
      'The data protected by that key version can no longer be read until the version is enabled again',
      'BigQuery re-encrypts the data automatically with a Google-managed key to keep it readable',
      'Nothing changes for existing data; the key is only used when new data is written',
      'The dataset is deleted after 24 hours unless the key version is restored'
    ],
    answer: 0,
    explanation: 'With CMEK, Google can only decrypt the data while the key version is usable, so disabling it makes the data inaccessible (and destroying it makes the loss permanent, a form of crypto-shredding). Nothing is re-encrypted with Google keys or deleted automatically.'
  },
  {
    id: 'ace-m3-093',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Teams create many buckets, disks and datasets, and policy says each must have its own customer-managed key, created consistently. You want the keys provisioned automatically when resources are created. What should you use?',
    options: [
      'Cloud KMS Autokey, with a dedicated key project for the folder',
      'One shared CMEK key for every resource in the organization',
      'A nightly script that creates keys for new resources',
      'Google-managed keys, which are already one per resource'
    ],
    answer: 0,
    explanation: 'Autokey creates key rings and keys on demand, with the right location and settings, when a CMEK-enabled resource is created, and grants the service agent access. A single shared key concentrates risk, scripts lag behind, and Google-managed keys are not customer-managed.'
  },
  {
    id: 'ace-m3-094',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'Compliance requires that new BigQuery datasets and Cloud Storage buckets in the organization can only be created with customer-managed keys. What should you enforce?',
    options: [
      'The organization policy `gcp.restrictNonCmekServices` listing those services',
      'The organization policy `gcp.resourceLocations` for the key locations',
      'An IAM deny policy on creating datasets and buckets without a key',
      'A Cloud KMS key rotation period of 90 days on every key ring'
    ],
    answer: 0,
    explanation: '`gcp.restrictNonCmekServices` requires CMEK for resources of the listed services, rejecting creation without a key; `gcp.restrictCmekCryptoKeyProjects` can also limit which key projects are allowed. Location policies and rotation periods do not require CMEK, and deny policies cannot inspect encryption settings.'
  },
  {
    id: 'ace-m3-095',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'An existing Cloud SQL instance uses Google-managed encryption, and auditors now require a customer-managed key for it. What must you do?',
    options: [
      'Create a new instance with CMEK and migrate the data, because CMEK is set only at creation',
      'Patch the instance with `--disk-encryption-key`, which re-encrypts it in place',
      'Enable CMEK on the instance’s backups only, which also covers the primary',
      'Restart the instance after granting the Cloud SQL service agent the key'
    ],
    answer: 0,
    explanation: 'For Cloud SQL, CMEK has to be chosen when the instance is created; an existing instance cannot be switched. Create a CMEK instance (granting its service agent Encrypter/Decrypter on the key) and migrate, for example by restoring a backup or using Database Migration Service.'
  },
  {
    id: 'ace-m3-096',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A team wants Cloud Storage to encrypt objects with a key that Google never stores, supplied by the client with every request. What is this called?',
    options: [
      'Customer-supplied encryption keys (CSEK)',
      'Customer-managed encryption keys (CMEK)',
      'Google default encryption at rest',
      'Cloud External Key Manager with Autokey'
    ],
    answer: 0,
    explanation: 'With CSEK you provide the AES-256 key in each request; Google uses it and keeps only a hash, so losing the key loses the data. CMEK keys live in Cloud KMS, default encryption uses Google-managed keys, and Cloud EKM keeps keys in an external key manager.'
  },

  // ── Multi-region redundancy ──
  {
    id: 'ace-m3-097',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Firestore database backs a global app and must keep accepting reads and writes even if a whole region fails. Which location should you choose when you create it?',
    options: [
      'A multi-region location such as nam5 or eur3',
      'A regional location such as asia-southeast2',
      'Any regional location plus daily exports',
      'Two regional databases synced by a function'
    ],
    answer: 0,
    explanation: 'Multi-region Firestore locations replicate synchronously across regions and offer a 99.999% SLA; the location cannot be changed after creation. A regional database does not survive a regional outage, exports need a restore, and self-synced databases are not consistent.'
  },
  {
    id: 'ace-m3-098',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A BigQuery dataset in asia-southeast2 must be available in a second region for disaster recovery. What should you set up?',
    options: [
      'Cross-region dataset replication to the second region',
      'A daily table snapshot kept in the same dataset',
      'Time travel with the maximum window of 7 days',
      'A larger slot reservation in the same region'
    ],
    answer: 0,
    explanation: 'Cross-region replication keeps a replica of the dataset in another region that can be promoted (Enterprise Plus adds managed disaster recovery with failover). Snapshots and time travel stay in the same region, and slots are compute capacity.'
  },
  {
    id: 'ace-m3-099',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'hard',
    prompt: 'An application stores orders in Cloud SQL and user uploads in Cloud Storage. Both must survive a regional outage, with uploads replicated within 15 minutes. Which design fits?',
    options: [
      'A cross-region read replica for Cloud SQL, and a dual-region bucket with turbo replication',
      'High availability for Cloud SQL, and a regional bucket with Object Versioning',
      'Daily Cloud SQL backups, and a regional bucket with a lifecycle rule to Archive',
      'A larger Cloud SQL instance, and a bucket with Autoclass in the same region'
    ],
    answer: 0,
    explanation: 'A cross-region replica can be promoted if the region is lost, and turbo replication gives dual-region buckets a 15-minute RPO. Zonal HA, versioning and lifecycle rules all stay inside one region, and daily backups lose up to a day.'
  },
  {
    id: 'ace-m3-100',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Backups of VMs and databases must be immutable and protected from deletion even by project administrators, and stored away from the production region. What should you use?',
    options: [
      'Backup and DR Service, writing to a backup vault in another region with enforced retention',
      'Snapshots in the same project, with a label that marks them as protected backups',
      'A Cloud Storage bucket without a retention policy, owned by the production project',
      'Cloud SQL on-demand backups, kept in the instance’s own region and project'
    ],
    answer: 0,
    explanation: 'Backup and DR Service backup vaults store backups separately from the source project with an enforced minimum retention that administrators cannot shorten, and can be placed in another region. Labels protect nothing, and backups in the same project and region share its risks.'
  }
];
