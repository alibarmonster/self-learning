/**
 * Tryout prep for course Module 2, sessions 3–8 (exam guide 2.1 and 3.1):
 * choosing compute, launching VMs, Spot and custom shapes, OS Login and VM
 * Manager; disks, snapshots, images and managed instance groups; GKE cluster
 * types, workloads, Artifact Registry and autoscaling; Cloud Run and Cloud
 * Run functions, events, GPUs/TPUs, Agent Runtime and Cloud Workstations —
 * plus both labs and a check before the module try-out (M2 · Set 1–5 in
 * exams/ace/sets.ts). Names and flags checked against the Google Cloud docs
 * in October 2026.
 */
import type { Lesson } from '@/types';

const AR = 'asia-southeast2-docker.pkg.dev/ace-lab-123/apps';

export const lesson: Lesson = {
  id: 'tryout-m2',
  lang: 'en',
  title: 'Tryout Prep · Module 2: Compute Services',
  intro:
    'Module 2 is the compute half of exam guide Sections 2 and 3: choosing where code runs, then deploying and running it. It follows sessions 3 to 8 of the course. Compute Engine comes first: choosing an option, launching instances, Spot and custom machine types, OS Login and VM Manager, disks, snapshots and images, and managed instance groups. Then Google Kubernetes Engine, and then Cloud Run and Cloud Run functions with events, accelerators, Agent Runtime and Cloud Workstations. Each section gives the decision the exam turns on, the commands to recognise, the cue words and one question. Both labs are walked through. Finish with the check, then sit M2 · Set 1 to 5 (20 questions, 24 minutes each), or Tryout 1 to 4 for Modules 1 and 2 together.',
  parts: [
    {
      id: 's3',
      title: 'Session 3 · Compute Engine I: choosing compute, launching VMs, cost and access',
      sections: [
        {
          id: 's3-choose',
          title: 'S3-01 · Choosing a compute option',
          blocks: [
            {
              kind: 'table',
              caption: 'From most control to most managed',
              columns: ['Option', 'Pick it when', 'Exam cue'],
              rows: [
                ['Compute Engine', 'You need the OS: a custom kernel, licences, agents, lift-and-shift, GPUs with full control', '"Legacy app", "specific OS", "install software on the host", "lift and shift"'],
                ['GKE', 'Many containers, Kubernetes features and portability, stateful sets, existing Kubernetes skills', '"Microservices on Kubernetes", "already use Kubernetes", "Helm charts"'],
                ['Cloud Run (services)', 'A stateless container behind HTTP(S) or gRPC, scaling to zero and paid per use', '"Container, no infrastructure to manage", "spiky traffic", "scale to zero"'],
                ['Cloud Run (jobs)', 'A container that runs to completion: batch, migrations, reports', '"Nightly batch in a container", "runs for an hour then stops"'],
                ['Cloud Run functions', 'A small piece of code that reacts to an event or an HTTP call', '"When a file is uploaded, run code", "lightweight glue"'],
                ['App Engine', 'Existing App Engine apps; code-only web apps with versions', '"App Engine standard", "split traffic between versions"'],
                ['Agent Runtime', 'Host an AI agent (Agent Development Kit, LangChain) without servers', '"Deploy an AI agent with managed sessions and memory"']
              ]
            },
            {
              kind: 'list',
              ordered: true,
              items: [
                'Does it need a specific OS, kernel, licence or agent on the host? → **Compute Engine**.',
                'Is it already on Kubernetes, or does it need Kubernetes features? → **GKE**, with Autopilot unless node control is required.',
                'Is it a container answering requests, or a job that runs to completion? → **Cloud Run** service or job.',
                'Is it a single function triggered by an event? → **Cloud Run functions**.',
                'Is it an AI agent? → **Agent Runtime**.'
              ]
            },
            {
              kind: 'table',
              caption: 'Machine families (Compute Engine)',
              columns: ['Family', 'Series', 'Use'],
              rows: [
                ['General purpose', 'E2 (lowest cost, shared-core `e2-micro`/`small`/`medium`), N2, N2D, N4, C3, C3D, C4, C4A (Arm, Google Axion), Tau T2D', 'Web servers, dev, most apps'],
                ['Compute optimised', 'C2, C2D, H3', 'HPC, gaming, single-thread speed'],
                ['Memory optimised', 'M1, M2, M3, X4', 'SAP HANA, large in-memory databases'],
                ['Accelerator optimised', 'A2, A3, A4 (NVIDIA A100, H100, B200), G2 (NVIDIA L4)', 'ML training and inference, graphics'],
                ['Storage optimised', 'Z3', 'Very large local SSD, scale-out databases']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Pick the **most managed** option that still meets the requirement. If the question says "no ops team" or "minimise management", Compute Engine is rarely right. If it names an OS-level need, a managed platform is wrong.'
            },
            {
              kind: 'quiz',
              q: 'A team has a containerised HTTP API with unpredictable traffic, often zero at night. They want to pay nothing when idle and manage no clusters. What should they use?',
              options: ['GKE Standard with cluster autoscaler', 'A managed instance group of Spot VMs', 'Cloud Run', 'App Engine flexible environment'],
              answer: 2,
              explain: 'Cloud Run scales to zero and needs no cluster. GKE and MIGs keep nodes or VMs running, and App Engine flexible does not scale to zero.'
            }
          ]
        },
        {
          id: 's3-launch',
          title: 'S3-02 · Launching instances, availability policies, SSH keys and remote access',
          blocks: [
            {
              kind: 'code',
              title: 'Create a VM',
              lines: [
                '$ gcloud compute instances create web-1 --zone=asia-southeast2-a \\',
                '    --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud \\',
                '    --boot-disk-size=20GB --boot-disk-type=pd-balanced --tags=http-server --labels=env=lab \\',
                '    --service-account=web-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform \\',
                '    --metadata-from-file=startup-script=startup.sh \\',
                '    --shielded-secure-boot --deletion-protection',
                '# A startup script can also come from a bucket',
                '$ gcloud compute instances add-metadata web-1 --zone=asia-southeast2-a \\',
                '    --metadata=startup-script-url=gs://ace-lab-scripts/start.sh'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Image families** (`debian-12`) always resolve to the newest non-deprecated image in the family.',
                '**Network tags** (`http-server`) are what VPC firewall rules target. **Labels** are for cost and filtering.',
                '**Scopes**: set `cloud-platform` and control access with IAM roles on the service account.',
                '**Deletion protection** blocks accidental deletes. **Shielded VM** (Secure Boot, vTPM, integrity monitoring) protects the boot chain, and **Confidential VM** encrypts memory in use.',
                'Changing the machine type or the service account needs the VM **stopped**.'
              ]
            },
            {
              kind: 'table',
              caption: 'Availability policy',
              columns: ['Setting', 'Values', 'Meaning'],
              rows: [
                ['On host maintenance', '`MIGRATE` (default) / `TERMINATE`', 'Live-migrate the VM during Google maintenance, or stop it. VMs with GPUs must use **TERMINATE**'],
                ['Automatic restart', '`true` (default) / `false`', 'Restart the VM if it crashes or its host fails'],
                ['Provisioning model', '`STANDARD` / `SPOT`', 'Spot VMs cannot live-migrate or restart automatically']
              ]
            },
            {
              kind: 'table',
              caption: 'SSH key management',
              columns: ['Method', 'How access is controlled', 'Notes'],
              rows: [
                ['**OS Login** (recommended)', 'IAM roles `roles/compute.osLogin` / `roles/compute.osAdminLogin`; the Linux account follows the Google identity', 'Metadata `enable-oslogin=TRUE`; supports 2-step verification; removing the role revokes access everywhere'],
                ['Project metadata SSH keys', 'Public keys in project metadata reach every VM that does not block them', 'Anyone who can edit project metadata can add a key; hard to audit'],
                ['Instance metadata SSH keys', 'Keys on one VM; `block-project-ssh-keys=TRUE` ignores project keys', 'One-off access to one VM'],
                ['`gcloud compute ssh`', 'Creates `~/.ssh/google_compute_engine` and pushes the public key to OS Login or metadata', 'Easiest; falls back to IAP when the VM has no external IP']
              ]
            },
            {
              kind: 'table',
              caption: 'Getting into a VM',
              columns: ['Way', 'How', 'Notes'],
              rows: [
                ['SSH in the browser', 'Console → SSH button', 'Handles keys for you'],
                ['gcloud', '`gcloud compute ssh web-1 --zone=asia-southeast2-a`', 'Generates and pushes a key'],
                ['IAP TCP forwarding', '`gcloud compute ssh web-1 --tunnel-through-iap`', 'For VMs **without an external IP**. Allow ingress tcp:22 from `35.235.240.0/20`; user needs **IAP-secured Tunnel User**'],
                ['Serial console', '`gcloud compute connect-to-serial-port web-1`', 'When the network or SSH daemon is broken; needs metadata `serial-port-enable=TRUE`'],
                ['Windows RDP', '`gcloud compute reset-windows-password web-win`', 'Then RDP on tcp:3389 (through IAP if there is no external IP)']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"VMs have no public IP but admins need SSH, no bastion" → IAP TCP forwarding with a firewall rule from 35.235.240.0/20. "Run a command on every boot" → a startup script in metadata. "SSH times out" → check for a firewall rule on tcp:22 first. "VM does not boot after a change" → serial console output.'
            },
            {
              kind: 'quiz',
              q: 'Which source range must a firewall rule allow for SSH through IAP?',
              options: ['0.0.0.0/0', '35.235.240.0/20', '130.211.0.0/22', '10.128.0.0/9'],
              answer: 1,
              explain: '35.235.240.0/20 is the IAP TCP forwarding range. 130.211.0.0/22 is a health check range, and 10.128.0.0/9 is the auto mode VPC range.'
            }
          ]
        },
        {
          id: 's3-spot',
          title: 'S3-03 · Spot VMs, custom machine types, OS Login and VM Manager',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Spot VMs** cost up to 91% less than standard. They can be preempted at any time with a 30-second notice and have **no 24-hour limit** (that was the old preemptible VM). When preempted they **STOP** or **DELETE** (`--instance-termination-action`). They suit batch, rendering, CI and fault-tolerant work in a MIG, never a lone production database.',
                '**Custom machine types**: choose vCPUs and memory yourself when no predefined shape fits, within each series’ memory-per-vCPU range. Some series also allow **extended memory** beyond it.',
                '**Sole-tenant nodes** put your VMs on dedicated physical servers, for per-core or per-socket licences (bring your own licence) or isolation rules.',
                '**OS Login**: turn it on with metadata `enable-oslogin=TRUE` on the project or instance, or enforce it with the `compute.requireOsLogin` organization policy. Normal users get **Compute OS Login**, and users who need sudo get **Compute OS Admin Login**. Users from outside the organization also need `roles/compute.osLoginExternalUser`. Add metadata `enable-oslogin-2fa=TRUE` to require 2-step verification.',
                '**VM Manager** has three parts. **Patch** runs patch jobs now and recurring patch deployments with compliance reports. **OS inventory** shows what is installed where. **OS policies** keep packages and config in a desired state. It needs the OS Config agent (in most Google images), the OS Config API, and metadata `enable-osconfig=TRUE`.'
              ]
            },
            {
              kind: 'code',
              title: 'Spot, a custom shape, OS Login, a patch job',
              lines: [
                '$ gcloud compute instances create render-1 --zone=asia-southeast2-a \\',
                '    --provisioning-model=SPOT --instance-termination-action=STOP',
                '$ gcloud compute instances create app-1 --zone=asia-southeast2-a \\',
                '    --custom-vm-type=n2 --custom-cpu=6 --custom-memory=24GB      # = n2-custom-6-24576',
                '$ gcloud compute project-info add-metadata --metadata=enable-oslogin=TRUE',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 \\',
                '    --member=group:ops@example.com --role=roles/compute.osAdminLogin',
                '$ gcloud compute project-info add-metadata --metadata=enable-osconfig=TRUE',
                '$ gcloud compute os-config patch-jobs execute --instance-filter-all --display-name="monthly patch"',
                '$ gcloud compute os-config patch-deployments create sunday-patch --file=sunday.yaml'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Cheapest for a fault-tolerant batch job" → Spot VMs, in a MIG so they are recreated. "Workload needs 6 vCPUs and 24 GB exactly" → a custom machine type. "Revoke SSH for a leaving employee across all VMs at once" → OS Login, by removing their IAM role. "Needs sudo" → osAdminLogin. "Patch all VMs every Sunday and report compliance" → a VM Manager patch deployment. "Licence is per physical core" → sole-tenant nodes.'
            },
            {
              kind: 'quiz',
              q: 'What happens to a Spot VM after 24 hours of running?',
              options: ['It is preempted', 'It keeps running, because Spot VMs have no maximum runtime', 'It converts to a standard VM', 'It is live-migrated'],
              answer: 1,
              explain: 'The 24-hour cap belonged to preemptible VMs. Spot VMs run until Compute Engine needs the capacity back.'
            }
          ]
        }
      ]
    },
    {
      id: 's4',
      title: 'Session 4 · Compute Engine II: disks, images and managed instance groups',
      sections: [
        {
          id: 's4-disks',
          title: 'S4-01 · Persistent Disk (zonal and regional) and Hyperdisk',
          blocks: [
            {
              kind: 'table',
              caption: 'Block storage for VMs',
              columns: ['Type', 'Performance', 'Use'],
              rows: [
                ['`pd-standard`', 'HDD, cheapest', 'Bulk, sequential reads, backups'],
                ['`pd-balanced`', 'SSD, balanced price and IOPS; the usual boot disk', 'Most workloads'],
                ['`pd-ssd`', 'SSD, higher IOPS per GB', 'Databases'],
                ['`pd-extreme`', 'Provisioned IOPS (older series)', 'Very demanding databases'],
                ['Hyperdisk Balanced', 'IOPS and throughput **provisioned separately from size**, changeable while attached', 'General purpose on newer series (C3, C4, N4, M3 and later)'],
                ['Hyperdisk Balanced High Availability', 'Synchronous copy in **two zones**', 'The regional, zero-data-loss option for Hyperdisk'],
                ['Hyperdisk Throughput', 'Throughput-oriented, low cost per GB', 'Analytics, Kafka, Hadoop, streaming'],
                ['Hyperdisk Extreme', 'Highest IOPS', 'Top-tier databases'],
                ['Hyperdisk ML', 'Read-only to many VMs at very high throughput', 'Loading models and data into many AI VMs'],
                ['Regional Persistent Disk', 'Synchronous replication across **two zones**', 'Fail a VM over to the other zone with no data loss'],
                ['Local SSD', 'Physically attached, fastest', '**Ephemeral**: data is lost when the VM stops or is deleted. Scratch and cache only']
              ]
            },
            {
              kind: 'list',
              items: [
                'Disks can be **grown, never shrunk**: `gcloud compute disks resize data-1 --size=500GB`, then grow the partition and file system inside the OS (`growpart`, `resize2fs`, `xfs_growfs`). No reboot is needed.',
                'A disk is attached **read-write to one VM**, or **read-only to many**. Some types support multi-writer mode for clustered software.',
                '**Hyperdisk Storage Pools** buy capacity and performance in bulk and share them across many disks.',
                'Every disk is encrypted at rest. Use **CMEK** (Cloud KMS) when you must control the key (Module 3).',
                'For **shared files** across many VMs, use **Filestore** (managed NFS). To mount a bucket as a file system, use **Cloud Storage FUSE**.',
                'To move a VM to another zone, snapshot its disks, create disks from the snapshots in the new zone, and create the VM there.'
              ]
            },
            {
              kind: 'code',
              title: 'Create, attach, grow',
              lines: [
                '$ gcloud compute disks create data-1 --zone=asia-southeast2-a --type=hyperdisk-balanced \\',
                '    --size=200GB --provisioned-iops=6000 --provisioned-throughput=300',
                '$ gcloud compute instances attach-disk app-1 --disk=data-1 --zone=asia-southeast2-a',
                '$ gcloud compute disks update data-1 --zone=asia-southeast2-a --provisioned-iops=12000',
                '$ gcloud compute disks create db-ha --region=asia-southeast2 --type=pd-ssd --size=500GB \\',
                '    --replica-zones=asia-southeast2-a,asia-southeast2-b',
                '$ gcloud compute disks resize data-1 --zone=asia-southeast2-a --size=500GB'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Database needs more IOPS without buying more capacity" → Hyperdisk, raising provisioned IOPS. "The disk is full" → resize the disk, then the file system. "Fastest temporary scratch space" → Local SSD. "A zone outage must not lose data" → a regional disk or Hyperdisk Balanced HA. "Many VMs share files" → Filestore, not one disk.'
            },
            {
              kind: 'quiz',
              q: 'A VM’s data disk has 2 TB but only needs 500 GB. How do you make it smaller?',
              options: ['`gcloud compute disks resize --size=500GB`', 'Disks cannot shrink: create a 500 GB disk and copy the data', 'Detach it and change its size in the console', 'Snapshot it and restore the snapshot at 500 GB'],
              answer: 1,
              explain: 'Disks only grow. A snapshot restores at least the original size, so the way down is a new, smaller disk and a copy.'
            }
          ]
        },
        {
          id: 's4-snapshots',
          title: 'S4-02 · Snapshots, images and snapshot schedules',
          blocks: [
            {
              kind: 'table',
              caption: 'Which copy for which job',
              columns: ['Thing', 'What it holds', 'Use for'],
              rows: [
                ['Standard snapshot', 'One disk, **incremental** after the first; stored multi-regionally by default (or in a region you choose)', 'Backup and restore; move a disk to another zone or region'],
                ['Archive snapshot', 'The same, cheaper to keep, dearer to restore', 'Long-term retention'],
                ['Instant snapshot', 'A fast, in-zone point-in-time copy', 'Quick rollback before a risky change'],
                ['Snapshot schedule', 'A resource policy: how often, retention, location', 'Automatic backups'],
                ['Custom image', 'A bootable disk image', 'Many identical VMs; share with other projects'],
                ['Image family', 'Points to the newest non-deprecated image in the family', 'Always boot the latest version of your image'],
                ['Machine image', 'A whole VM: every disk, metadata, machine type', 'Clone or back up a complete VM']
              ]
            },
            {
              kind: 'code',
              title: 'Snapshots, a schedule, images, a machine image',
              lines: [
                '$ gcloud compute snapshots create db-before-upgrade --source-disk=db-1 \\',
                '    --source-disk-zone=asia-southeast2-a --storage-location=asia-southeast2',
                '$ gcloud compute resource-policies create snapshot-schedule daily-7d --region=asia-southeast2 \\',
                '    --daily-schedule --start-time=18:00 --max-retention-days=7',
                '$ gcloud compute disks add-resource-policies db-1 --resource-policies=daily-7d --zone=asia-southeast2-a',
                '# Image from a disk that is still attached to a running VM needs --force (better: stop the VM)',
                '$ gcloud compute images create web-v2 --source-disk=web-1 --source-disk-zone=asia-southeast2-a \\',
                '    --family=web --force',
                '$ gcloud compute images deprecate web-v1 --state=DEPRECATED --replacement=web-v2',
                '# Let another project use the image',
                '$ gcloud compute images add-iam-policy-binding web-v2 \\',
                '    --member=group:platform@example.com --role=roles/compute.imageUser',
                '$ gcloud compute machine-images create web-1-mi --source-instance=web-1 \\',
                '    --source-instance-zone=asia-southeast2-a',
                '$ gcloud compute instances create web-1-copy --zone=asia-southeast2-b --source-machine-image=web-1-mi'
              ]
            },
            {
              kind: 'list',
              items: [
                'Deleting a snapshot never breaks the others. Data still needed by later snapshots is kept.',
                'Image states: `DEPRECATED` (still usable, with a warning), `OBSOLETE` (cannot be used for new VMs), `DELETED`.',
                'A snapshot or an image can create a disk in **another zone or region**, which is how VMs move.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Back up a disk every day, keep 7 days, least effort" → a snapshot schedule. "Developers in another project must use our hardened image" → share it with `roles/compute.imageUser`. "Always use the latest image in a template" → an image family. "Copy the whole VM, all disks and settings" → a machine image.'
            },
            {
              kind: 'quiz',
              q: 'You need a copy of a VM including both of its disks and its machine type. What do you create?',
              options: ['A snapshot of the boot disk', 'A custom image', 'A machine image', 'An instance template'],
              answer: 2,
              explain: 'A machine image captures every disk plus configuration. A snapshot or an image covers one disk, and a template holds configuration only, with no data.'
            }
          ]
        },
        {
          id: 's4-mig',
          title: 'S4-03 · Instance templates, managed instance groups and autoscaling',
          blocks: [
            {
              kind: 'list',
              items: [
                'An **instance template** is the recipe for a VM: machine type, image, disks, network, metadata and service account. Templates are **immutable**, so to change one you create a new template and roll it out. Templates are **global** or **regional**.',
                'A **managed instance group (MIG)** keeps N identical VMs from one template. It offers **autoscaling**, **autohealing** (recreating a VM that fails a health check), **rolling updates** and load balancer integration through **named ports**. A **zonal** MIG uses one zone. A **regional** MIG spreads VMs across zones in the region (three by default) and is the high-availability choice.',
                '**Unmanaged** instance groups only collect different VMs behind a load balancer. They have no template, autoscaling or autohealing.',
                '**Autoscaling signals** are CPU utilisation, load balancer serving capacity, a **Cloud Monitoring metric** (for example Pub/Sub backlog) and **schedules**. **Predictive autoscaling** scales out ahead of daily patterns, and **scale-in controls** limit how fast VMs are removed. Set an **initialization period** so new VMs are not judged before they boot.',
                '**Autohealing** needs a **health check**, plus a firewall rule allowing `35.191.0.0/16` and `130.211.0.0/22`. Give it an initial delay longer than the app’s startup.',
                '**Updates** are **proactive** (roll now, controlled by `max-surge` and `max-unavailable`) or **opportunistic** (only when VMs are recreated anyway). A **canary** puts part of the group on the new template. `rolling-action replace` recreates VMs on the same template.',
                '**Stateful MIGs** keep disks, names and IPs for apps that need them.'
              ]
            },
            {
              kind: 'code',
              title: 'Template → MIG → autoscaling → rolling update',
              lines: [
                '$ gcloud compute instance-templates create web-v1 --machine-type=e2-medium \\',
                '    --image-family=web --tags=http-server --service-account=web-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform',
                '$ gcloud compute health-checks create http web-hc --port=80 --request-path=/healthz',
                '$ gcloud compute instance-groups managed create web-mig --region=asia-southeast2 \\',
                '    --template=web-v1 --size=3 --health-check=web-hc --initial-delay=120',
                '$ gcloud compute instance-groups managed set-named-ports web-mig --region=asia-southeast2 --named-ports=http:80',
                '$ gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 \\',
                '    --min-num-replicas=3 --max-num-replicas=10 --target-cpu-utilization=0.6 \\',
                '    --cool-down-period=90 --cpu-utilization-predictive-method=optimize-availability',
                '$ gcloud compute instance-groups managed rolling-action start-update web-mig --region=asia-southeast2 \\',
                '    --version=template=web-v2 --max-surge=3 --max-unavailable=0',
                '# Canary: 10% of VMs on the new template',
                '$ gcloud compute instance-groups managed rolling-action start-update web-mig --region=asia-southeast2 \\',
                '    --version=template=web-v1 --canary-version=template=web-v2,target-size=10%'
              ]
            },
            {
              kind: 'case',
              title: 'The MIG keeps recreating its VMs',
              situation: 'A new MIG with autohealing deletes and recreates every VM every few minutes. The app works when you SSH in and curl it locally.',
              symptom: ['$ gcloud compute instance-groups managed list-instances web-mig --region=asia-southeast2', 'NAME          STATUS   HEALTH_STATE  ACTION', 'web-mig-7k2p  RUNNING  UNHEALTHY     RECREATING'],
              diagnose: [
                'Is there a firewall rule allowing the health check ranges `35.191.0.0/16` and `130.211.0.0/22` on the health check port? Without it every probe fails.',
                'Is the initial delay longer than the boot plus app startup? If not, VMs are judged before they are ready.',
                'Does the health check port and path (`/healthz` on 80) match what the app serves?'
              ],
              fix: [
                '$ gcloud compute firewall-rules create allow-hc --network=prod-vpc --direction=INGRESS \\',
                '    --action=ALLOW --rules=tcp:80 --source-ranges=35.191.0.0/16,130.211.0.0/22 --target-tags=http-server',
                '$ gcloud compute instance-groups managed update web-mig --region=asia-southeast2 \\',
                '    --health-check=web-hc --initial-delay=300'
              ],
              why: 'Autohealing trusts the health check completely: a blocked or premature probe looks exactly like a dead VM.',
              exam: '"VMs are recreated in a loop" → health check firewall rule or initial delay, almost always.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Recreate VMs whose application hangs" → autohealing with a health check, not just automatic restart. "Update with no capacity loss" → `--max-unavailable=0` with surge. "Scale on queue length" → autoscale on a Cloud Monitoring metric. "Survive a zone failure" → a regional MIG. "Busy every weekday at 08:00" → a scaling schedule or predictive autoscaling.'
            },
            {
              kind: 'quiz',
              q: 'What must you do to change the machine type of every VM in a MIG?',
              options: ['Edit the instance template', 'Create a new template and start a rolling update', 'Resize each VM in place', 'Change the autoscaler'],
              answer: 1,
              explain: 'Templates are immutable. Make a new one and roll the group onto it.'
            }
          ]
        }
      ]
    },
    {
      id: 's5',
      title: 'Session 5 · Lab: Compute Engine in practice',
      sections: [
        {
          id: 's5-lab',
          title: 'VMs, disks, snapshots, a template and an autoscaled MIG',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Create and connect to a VM', text: 'No external IP; SSH through IAP after allowing 35.235.240.0/20.', code: ['gcloud compute instances create lab-1 --zone=asia-southeast2-a --machine-type=e2-small --no-address --image-family=debian-12 --image-project=debian-cloud', 'gcloud compute ssh lab-1 --zone=asia-southeast2-a --tunnel-through-iap'] },
                {
                  title: 'Add, format and mount a data disk',
                  text: 'Mount by UUID in `/etc/fstab` so it survives reboots.',
                  code: [
                    'gcloud compute disks create lab-data --zone=asia-southeast2-a --size=50GB --type=pd-balanced',
                    'gcloud compute instances attach-disk lab-1 --disk=lab-data --zone=asia-southeast2-a',
                    '# on the VM',
                    'sudo mkfs.ext4 -m 0 -E lazy_itable_init=0,lazy_journal_init=0,discard /dev/sdb',
                    'sudo mkdir -p /mnt/data && sudo mount -o discard,defaults /dev/sdb /mnt/data'
                  ]
                },
                { title: 'Snapshot it, then schedule snapshots', text: 'An on-demand snapshot now, a daily schedule for later.', code: ['gcloud compute snapshots create lab-data-1 --source-disk=lab-data --source-disk-zone=asia-southeast2-a', 'gcloud compute disks add-resource-policies lab-data --resource-policies=daily-7d --zone=asia-southeast2-a'] },
                { title: 'Build an image and a template', text: 'Stop the VM first, then image its boot disk into a family.', code: ['gcloud compute instances stop lab-1 --zone=asia-southeast2-a', 'gcloud compute images create web-v1 --source-disk=lab-1 --source-disk-zone=asia-southeast2-a --family=web', 'gcloud compute instance-templates create web-t1 --machine-type=e2-small --image-family=web --tags=http-server'] },
                { title: 'Deploy an autoscaled, autohealing MIG', text: 'Health check plus its firewall rule, then autoscaling on CPU.', code: ['gcloud compute instance-groups managed create web-mig --region=asia-southeast2 --template=web-t1 --size=2 --health-check=web-hc --initial-delay=180', 'gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 --min-num-replicas=2 --max-num-replicas=6 --target-cpu-utilization=0.6'] },
                { title: 'Load it and watch it scale', text: 'Run a CPU load on the VMs (for example `stress-ng`), watch the group grow, stop the load, and watch it shrink after the stabilisation period.' }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 's6',
      title: 'Session 6 · Google Kubernetes Engine',
      sections: [
        {
          id: 's6-types',
          title: 'S6-01 · Cluster types (Autopilot, regional, private) and kubectl',
          blocks: [
            {
              kind: 'table',
              caption: 'Autopilot vs Standard',
              columns: ['', 'Autopilot', 'Standard'],
              rows: [
                ['Nodes', 'Managed by Google; you never manage node pools', 'You create, size and upgrade node pools'],
                ['Billing', 'For the Pods’ **resource requests**', 'Per node (VM), whether used or not'],
                ['Location', 'Always **regional**', 'Zonal or regional'],
                ['Security defaults', 'Workload Identity Federation for GKE, Shielded nodes, no SSH to nodes', 'You choose'],
                ['Pick when', 'You want Kubernetes without node operations. This is the recommended default', 'You need node-level control: special kernels, privileged DaemonSets, specific machine shapes']
              ]
            },
            {
              kind: 'list',
              items: [
                'A **zonal** cluster has one control plane in one zone, so a zone outage takes down the API. A **multi-zonal** cluster has one control plane with nodes in several zones. A **regional** cluster replicates the control plane **and** nodes across three zones, the highest availability. In a regional Standard cluster `--num-nodes` is **per zone**: 1 gives 3 nodes.',
                '**Private nodes** (`--enable-private-nodes`) have internal IPs only. They need **Cloud NAT** to reach the internet, for example to pull images from Docker Hub.',
                '**Control plane access**: the **DNS-based endpoint** is reachable from anywhere but only with IAM-authorised credentials, so no bastion or VPN is needed. **IP-based endpoints** (public and/or private) can be limited with **authorized networks**.',
                '**Release channels** (Rapid, Regular, Stable, Extended) handle automatic upgrades. **Maintenance windows and exclusions** decide when they happen.',
                '**kubectl** comes with the `gke-gcloud-auth-plugin`. `get-credentials` writes the cluster into your kubeconfig. Cloud Shell has both already.'
              ]
            },
            {
              kind: 'code',
              title: 'Create clusters and connect',
              lines: [
                '$ gcloud components install kubectl gke-gcloud-auth-plugin',
                '$ gcloud container clusters create-auto shop --region=asia-southeast2 \\',
                '    --enable-private-nodes --enable-dns-access',
                '$ gcloud container clusters create shop-std --region=asia-southeast2 --num-nodes=1 \\',
                '    --enable-private-nodes --enable-dns-access --release-channel=regular \\',
                '    --workload-pool=ace-lab-123.svc.id.goog',
                '$ gcloud container clusters get-credentials shop --region=asia-southeast2 --dns-endpoint',
                '$ kubectl config get-contexts',
                '$ kubectl get nodes -o wide'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Minimise operational overhead" → Autopilot. "The control plane must survive a zone outage" → a regional cluster. "Nodes must not have public IPs" → private nodes, plus Cloud NAT for the internet. "Pods in a private cluster cannot pull from Docker Hub" → Cloud NAT (or mirror the image into Artifact Registry). "Reach the API without a bastion" → the DNS-based endpoint.'
            },
            {
              kind: 'quiz',
              q: 'You run `gcloud container clusters create shop --region=asia-southeast2 --num-nodes=2`. How many nodes does the default node pool get?',
              options: ['2', '3', '6', 'It depends on the cluster autoscaler'],
              answer: 2,
              explain: 'For regional clusters, the node count is per zone. The region has three zones, so 2 × 3 = 6 nodes.'
            }
          ]
        },
        {
          id: 's6-workloads',
          title: 'S6-02 · Workloads (Pods, Services, StatefulSets) and Artifact Registry',
          blocks: [
            {
              kind: 'table',
              caption: 'Workload objects',
              columns: ['Object', 'Use'],
              rows: [
                ['Deployment', 'Stateless replicas; rolling updates and rollback'],
                ['StatefulSet', 'Stable names (`db-0`, `db-1`), ordered start, **one PersistentVolumeClaim per Pod** (`volumeClaimTemplates`); for databases and Kafka'],
                ['DaemonSet', 'One Pod per node, for log and monitoring agents'],
                ['Job / CronJob', 'Run to completion / run on a schedule'],
                ['ConfigMap / Secret', 'Configuration and sensitive values passed to Pods (Secrets can be encrypted with Cloud KMS, or pulled from Secret Manager)'],
                ['Namespace', 'Separates teams or environments inside one cluster']
              ]
            },
            {
              kind: 'table',
              caption: 'Services and how they are reached',
              columns: ['Type', 'Reachable from', 'Creates'],
              rows: [
                ['ClusterIP (default)', 'Inside the cluster only', 'A virtual IP'],
                ['NodePort', 'Each node’s IP on a port 30000–32767', 'Node ports'],
                ['LoadBalancer', 'Internet, or the VPC with the internal annotation', 'A passthrough **Network Load Balancer** (L4)'],
                ['Headless (`clusterIP: None`)', 'DNS per Pod', 'Used with StatefulSets'],
                ['Ingress / Gateway', 'Internet or VPC, HTTP(S), with path and host rules', 'An **Application Load Balancer** (L7)']
              ]
            },
            {
              kind: 'code',
              title: 'kubectl you should recognise',
              lines: [
                `$ kubectl create deployment web --image=${AR}/web:v1 --replicas=3`,
                '$ kubectl scale deployment web --replicas=5',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                `$ kubectl set image deployment/web web=${AR}/web:v2`,
                '$ kubectl rollout status deployment/web',
                '$ kubectl rollout undo deployment/web',
                '$ kubectl get pods -o wide -n shop',
                '$ kubectl describe pod web-7d4b9-abcde',
                '$ kubectl logs web-7d4b9-abcde --previous',
                '$ kubectl apply -f statefulset.yaml',
                '$ kubectl get pvc'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Artifact Registry** stores container images and language packages (Docker, Maven, npm, Python, Go, Apt, Yum). It is regional or multi-regional per repository. Image paths look like `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG`. Container Registry is retired.',
                '**Remote repositories** cache an upstream such as Docker Hub. **Virtual repositories** put one endpoint in front of several. **Cleanup policies** delete old versions. **Artifact Analysis** scans images for vulnerabilities.',
                'Roles: `roles/artifactregistry.reader` to pull, `writer` to push, `repoAdmin` to manage. Nodes pull with the **node service account**, so for a repository in another project, grant that service account reader on the repository.'
              ]
            },
            {
              kind: 'code',
              title: 'Artifact Registry',
              lines: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=asia-southeast2',
                '$ gcloud auth configure-docker asia-southeast2-docker.pkg.dev',
                `$ docker push ${AR}/web:v1`,
                '# Or build in the cloud with Cloud Build',
                `$ gcloud builds submit --tag ${AR}/web:v1`,
                '# Let nodes in another project pull',
                '$ gcloud artifacts repositories add-iam-policy-binding apps --location=asia-southeast2 \\',
                '    --member=serviceAccount:gke-nodes@shop-prod-123.iam.gserviceaccount.com --role=roles/artifactregistry.reader'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Each replica needs its own disk and a stable name" → StatefulSet. "Expose on the internet with path-based routing" → Ingress or Gateway (Application Load Balancer). "`ImagePullBackOff` from another project’s repository" → grant **Artifact Registry Reader** to the node (or workload) service account. "Roll back a bad release" → `kubectl rollout undo`.'
            },
            {
              kind: 'quiz',
              q: 'A Service of type LoadBalancer on GKE creates which load balancer?',
              options: ['A global external Application Load Balancer', 'A passthrough Network Load Balancer', 'An internal proxy Network Load Balancer', 'No load balancer, only a node port'],
              answer: 1,
              explain: 'LoadBalancer Services get a layer 4 passthrough Network Load Balancer. HTTP(S) routing at layer 7 comes from Ingress or Gateway.'
            }
          ]
        },
        {
          id: 's6-scaling',
          title: 'S6-03 · Node pools, HPA/VPA and Autopilot resource requests',
          blocks: [
            {
              kind: 'list',
              items: [
                'A **node pool** is a group of identical nodes in a Standard cluster. Add one for a different need, such as GPUs, Spot nodes or more memory. Steer Pods to it with `nodeSelector` or affinity, and taints with tolerations. To change the machine type, create a new pool, move the workloads, and delete the old pool.',
                'The **cluster autoscaler** adds and removes **nodes** when Pods cannot be scheduled or nodes sit underused (`--enable-autoscaling --min-nodes --max-nodes`, counted per zone). **Node auto-provisioning** creates whole node pools as needed.',
                'The **HPA** (Horizontal Pod Autoscaler) changes the **number of Pods** based on CPU, memory or custom metrics. The **VPA** (Vertical) recommends or applies better Pod **requests**. Do not run both on the same CPU/memory metric.',
                'The HPA needs **requests** set, because utilisation is measured as a percentage of the request.',
                '**Autopilot** bills on requests, so set `resources.requests` on every container. Missing requests get defaults (0.5 vCPU, 2 GiB), requests below the minimums are raised, and limits equal requests. **Compute classes** (such as Balanced, Scale-Out, Performance and Accelerator) choose the hardware.'
              ]
            },
            {
              kind: 'code',
              title: 'Node pool, autoscalers',
              lines: [
                '$ gcloud container node-pools create spot-pool --cluster=shop-std --region=asia-southeast2 \\',
                '    --spot --machine-type=e2-standard-4 --enable-autoscaling --min-nodes=0 --max-nodes=5',
                '$ gcloud container clusters update shop-std --region=asia-southeast2 \\',
                '    --enable-autoscaling --node-pool=default-pool --min-nodes=1 --max-nodes=4',
                '$ kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10',
                '$ kubectl get hpa',
                '$ gcloud container clusters update shop-std --region=asia-southeast2 --enable-vertical-pod-autoscaling',
                '$ gcloud container node-pools delete default-pool --cluster=shop-std --region=asia-southeast2'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Pods stay Pending because nodes are full" → the cluster autoscaler on Standard (Autopilot does it for you). "Traffic spikes, add Pods" → HPA. "Not sure what CPU and memory to request" → VPA in recommendation mode. "Some workloads need GPUs" → a separate GPU node pool. "Reduce the Autopilot bill" → right-size Pod requests.'
            },
            {
              kind: 'quiz',
              q: 'Which autoscaler adds nodes to a GKE Standard cluster?',
              options: ['Horizontal Pod Autoscaler', 'Vertical Pod Autoscaler', 'Cluster autoscaler', 'A MIG autoscaler you configure yourself'],
              answer: 2,
              explain: 'HPA and VPA act on Pods. The cluster autoscaler adds and removes nodes.'
            }
          ]
        }
      ]
    },
    {
      id: 's7',
      title: 'Session 7 · Serverless and modern compute: Cloud Run, events, GPUs/TPUs',
      sections: [
        {
          id: 's7-run',
          title: 'S7-01 · Cloud Run and Cloud Run functions: revisions, traffic splitting, autoscaling',
          blocks: [
            {
              kind: 'list',
              items: [
                'A **service** answers requests at a stable URL. A **job** runs tasks to completion, in parallel and for hours if needed. A **function** is code you deploy as a Cloud Run service: **Cloud Run functions** used to be called Cloud Functions (2nd gen).',
                'Every deploy or configuration change creates a new **immutable revision**. **Traffic splitting** sends percentages to revisions for canaries and blue/green releases. **Tags** give a revision its own URL to test before it gets traffic. To **roll back**, send 100% to the old revision.',
                '**Autoscaling** runs from **0** up to **max instances**. **Min instances** avoids cold starts, but those instances are billed while idle. **Concurrency** is how many requests one instance handles at once (default 80, up to 1000). **Startup CPU boost** shortens cold starts.',
                '**Billing**: **request-based** (CPU only during requests, the default) or **instance-based** (CPU always allocated, for background work). The request timeout defaults to 5 minutes, maximum 60.',
                '**Access**: `--allow-unauthenticated` grants `roles/run.invoker` to `allUsers`. Private services grant `run.invoker` to the caller’s service account. **Ingress** settings (`all`, `internal`, `internal-and-cloud-load-balancing`) decide where requests may come from.',
                '**Networking and secrets**: **Direct VPC egress** (`--network`, `--subnet`) reaches private IPs such as Cloud SQL or Memorystore. Mount **Secret Manager** secrets with `--set-secrets`.'
              ]
            },
            {
              kind: 'code',
              title: 'Deploy, canary, rollback, a job, a function',
              lines: [
                `$ gcloud run deploy shop --image=${AR}/shop:v1 --region=asia-southeast2 \\`,
                '    --allow-unauthenticated --min-instances=1 --max-instances=20 --concurrency=80 --cpu-boost',
                '# From source: Cloud Build builds the image with buildpacks',
                '$ gcloud run deploy shop --source=. --region=asia-southeast2',
                '# New version with no traffic, tagged for testing at https://green---shop-xyz.a.run.app',
                `$ gcloud run deploy shop --image=${AR}/shop:v2 --region=asia-southeast2 --no-traffic --tag=green`,
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-tags=green=10',
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-latest',
                '# Rollback',
                '$ gcloud run services update-traffic shop --region=asia-southeast2 --to-revisions=shop-00001-abc=100',
                '$ gcloud run services update shop --region=asia-southeast2 \\',
                '    --network=prod-vpc --subnet=run-jkt --vpc-egress=private-ranges-only --set-secrets=DB_PASS=db-pass:latest',
                `$ gcloud run jobs create report --image=${AR}/report:v1 --tasks=10 --max-retries=3 --region=asia-southeast2`,
                '$ gcloud run jobs execute report --region=asia-southeast2',
                '$ gcloud functions deploy resize --gen2 --runtime=python312 --region=asia-southeast2 \\',
                '    --source=. --entry-point=resize --trigger-bucket=ace-lab-uploads'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Test the new version on 10% of users" → `update-traffic` with percentages or tags. "Test before any user sees it" → `--no-traffic --tag`. "The first request is slow" → min instances (or startup CPU boost). "The database runs out of connections" → lower max instances or concurrency. "The task runs for two hours" → a Cloud Run job, not a service. "Reach Cloud SQL’s private IP" → Direct VPC egress.'
            },
            {
              kind: 'quiz',
              q: 'How do you deploy a new Cloud Run revision without sending it any traffic?',
              options: ['`--max-instances=0`', '`--no-traffic`', '`--min-instances=0`', 'Deploy it to a different region'],
              answer: 1,
              explain: '`--no-traffic` keeps traffic on the current revision. Add `--tag` to get a test URL for the new one.'
            }
          ]
        },
        {
          id: 's7-events',
          title: 'S7-02 · Event processing: Pub/Sub, Cloud Storage notifications, Eventarc',
          blocks: [
            {
              kind: 'table',
              caption: 'Pub/Sub subscription types',
              columns: ['Type', 'How messages arrive', 'Use'],
              rows: [
                ['Pull', 'The subscriber asks for messages', 'Workers that set their own pace; high throughput'],
                ['Push', 'Pub/Sub sends an HTTPS POST to an endpoint, optionally with an OIDC token', 'Cloud Run and other HTTPS endpoints'],
                ['BigQuery', 'Writes straight into a table', 'Streaming analytics without code'],
                ['Cloud Storage', 'Writes files to a bucket', 'Archiving streams']
              ]
            },
            {
              kind: 'list',
              items: [
                'Delivery is **at least once**, so handlers must be idempotent. Unacked messages are redelivered after the **ack deadline**. Subscriptions keep messages 7 days by default, and topics can retain up to 31 days for replay with **seek**.',
                '**Dead-letter topics** catch messages that keep failing. **Ordering keys** keep order per key. **Exactly-once delivery** is available on pull subscriptions. **Filters** deliver only matching messages.',
                '**Fan-out vs sharing**: every subscription gets **every** message, while several subscribers on **one** subscription share the messages.',
                '**Cloud Storage → Pub/Sub notifications** publish an event when objects change: `OBJECT_FINALIZE` on upload, `OBJECT_DELETE`, `OBJECT_ARCHIVE`, `OBJECT_METADATA_UPDATE`.',
                '**Eventarc** routes events to **Cloud Run, Cloud Run functions, Workflows or GKE**. Sources are direct events (Cloud Storage, Pub/Sub, Firestore and more), **Cloud Audit Logs** entries from 100+ services, and third parties. The trigger’s service account needs `roles/eventarc.eventReceiver` and `roles/run.invoker`. For Cloud Storage triggers, the Cloud Storage service agent needs `roles/pubsub.publisher`.'
              ]
            },
            {
              kind: 'table',
              caption: 'Which tool starts the work',
              columns: ['Need', 'Use'],
              rows: [
                ['Decouple producers and consumers; many subscribers', 'Pub/Sub'],
                ['React to a Google Cloud event (upload, audit log entry)', 'Eventarc (or a Cloud Storage trigger)'],
                ['Run something on a cron schedule', 'Cloud Scheduler (HTTP, Pub/Sub or a Cloud Run job)'],
                ['Queue many HTTP calls with rate limits and retries', 'Cloud Tasks'],
                ['Chain several steps and services with branching and retries', 'Workflows']
              ]
            },
            {
              kind: 'code',
              title: 'Topic, subscriptions, a bucket notification, Eventarc, Scheduler',
              lines: [
                '$ gcloud pubsub topics create orders',
                '$ gcloud pubsub subscriptions create orders-worker --topic=orders --ack-deadline=60 \\',
                '    --dead-letter-topic=orders-dlq --max-delivery-attempts=5',
                '$ gcloud pubsub subscriptions create orders-push --topic=orders \\',
                '    --push-endpoint=https://orders-xyz.a.run.app/ \\',
                '    --push-auth-service-account=push-sa@ace-lab-123.iam.gserviceaccount.com',
                '$ gcloud storage buckets notifications create gs://ace-lab-uploads --topic=uploads --event-types=OBJECT_FINALIZE',
                '$ gcloud eventarc triggers create on-upload --location=asia-southeast2 \\',
                '    --destination-run-service=thumbnailer --destination-run-region=asia-southeast2 \\',
                '    --event-filters="type=google.cloud.storage.object.v1.finalized" \\',
                '    --event-filters="bucket=ace-lab-uploads" \\',
                '    --service-account=events-sa@ace-lab-123.iam.gserviceaccount.com',
                '$ gcloud scheduler jobs create http nightly --location=asia-southeast2 --schedule="0 2 * * *" \\',
                '    --time-zone="Asia/Jakarta" --uri=https://report-xyz.a.run.app/run \\',
                '    --oidc-service-account-email=sched-sa@ace-lab-123.iam.gserviceaccount.com'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Decouple the order service from the email service" → Pub/Sub. "Process every uploaded image" → Eventarc or a function on Cloud Storage finalize. "Messages processed twice" → make the handler idempotent (delivery is at least once). "Push subscription gets 403 from Cloud Run" → give the push service account `run.invoker`. "Run every night at 02:00" → Cloud Scheduler.'
            },
            {
              kind: 'quiz',
              q: 'Two different services must each receive every order message published to a topic. How do you set this up?',
              options: ['One subscription, with both services pulling from it', 'One subscription per service on the same topic', 'Two topics, publishing each message twice', 'One push subscription with two endpoints'],
              answer: 1,
              explain: 'Each subscription gets its own copy of every message. Subscribers sharing one subscription split the messages between them.'
            }
          ]
        },
        {
          id: 's7-accel',
          title: 'S7-03 · GPUs vs TPUs, Agent Runtime, Cloud Workstations',
          blocks: [
            {
              kind: 'table',
              caption: 'Accelerators',
              columns: ['', 'GPU', 'TPU'],
              rows: [
                ['What', 'NVIDIA GPUs (L4, A100, H100, B200, …)', 'Google’s own chips for matrix maths (Cloud TPU)'],
                ['Good at', 'General ML, CUDA code, inference, graphics, video, simulation', 'Training and serving very large models in JAX, TensorFlow, PyTorch/XLA'],
                ['Where', 'A2/A3/A4/G2 VMs, or GPUs attached to N1; GKE GPU node pools; Cloud Run services with an L4', 'Cloud TPU VMs; TPU slices on GKE'],
                ['Watch out', 'Zonal availability, **quota often starts at 0**, on-host maintenance must be **TERMINATE**, drivers needed', 'Only some zones; code must use XLA-friendly frameworks']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Getting capacity**: on-demand, **Spot** (cheap, interruptible), **reservations** (guaranteed capacity in a zone), **committed use discounts**, and **Dynamic Workload Scheduler**. Its **flex-start** mode starts the job when capacity frees up. **Calendar mode** books a fixed future window.',
                '**Drivers**: on Compute Engine, install the NVIDIA driver or start from a Deep Learning VM image. On GKE, the node pool can install it (`gpu-driver-version=latest`). On Cloud Run, there is nothing to install.',
                '**Agent Runtime** on Gemini Enterprise Agent Platform (formerly Vertex AI Agent Engine) hosts AI agents built with the Agent Development Kit or LangChain. You deploy from the SDK, and it scales them and keeps sessions and memory.',
                '**Cloud Workstations** are managed development environments in your VPC, opened in the browser or a local IDE. Admins create a **cluster** (region and VPC), then **configurations** (machine type, container image, persistent disk, idle timeout). Developers with **Workstations Creator** (`roles/workstations.workstationCreator`) and Operation Viewer create their own workstations, and get Workstations User on them automatically. Source code stays off laptops.'
              ]
            },
            {
              kind: 'code',
              title: 'A GPU VM, a GPU node pool, a GPU on Cloud Run',
              lines: [
                '$ gcloud compute instances create infer-1 --zone=us-central1-a --machine-type=g2-standard-8 \\',
                '    --maintenance-policy=TERMINATE --image-family=debian-12 --image-project=debian-cloud',
                '# then install the NVIDIA driver on the VM, or start from a Deep Learning VM image',
                '$ gcloud container node-pools create gpu-pool --cluster=ml-std --region=us-central1 \\',
                '    --machine-type=g2-standard-8 --accelerator=type=nvidia-l4,count=1,gpu-driver-version=latest',
                `$ gcloud run deploy infer --image=${AR}/infer:v1 --region=us-central1 \\`,
                '    --gpu=1 --gpu-type=nvidia-l4 --cpu=4 --memory=16Gi --no-cpu-throttling',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 \\',
                '    --member=group:devs@example.com --role=roles/workstations.workstationCreator'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Train a huge TensorFlow/JAX model cost-effectively" → TPU. "Existing CUDA code" → GPU. "GPU VM cannot be created: quota 0" → request GPU quota in that region. "GPU VM fails to create with a maintenance error" → `--maintenance-policy=TERMINATE`. "Consistent, secure dev environments, no source on laptops" → Cloud Workstations. "Host an AI agent without managing servers" → Agent Runtime.'
            },
            {
              kind: 'quiz',
              q: 'Which on-host maintenance setting must a VM with an attached GPU use?',
              options: ['MIGRATE', 'TERMINATE', 'RESTART', 'Either, because GPUs support live migration'],
              answer: 1,
              explain: 'GPU VMs cannot live-migrate, so maintenance terminates them. Keep automatic restart on.'
            }
          ]
        }
      ]
    },
    {
      id: 's8',
      title: 'Session 8 · Lab: one application, three compute platforms',
      sections: [
        {
          id: 's8-lab',
          title: 'The same container on a MIG, GKE Autopilot and Cloud Run',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Build the image once', text: 'Push it to Artifact Registry; every platform pulls the same image.', code: [`gcloud builds submit --tag ${AR}/web:v1`] },
                {
                  title: 'Platform 1: a managed instance group',
                  text: 'A template on a Container-Optimized OS image whose startup script pulls and runs the container, behind an external Application Load Balancer, with a health check, autoscaling and a firewall rule for the health check ranges.',
                  code: ['gcloud compute instance-templates create web-c1 --machine-type=e2-small --image-family=cos-stable --image-project=cos-cloud --tags=http-server --metadata-from-file=startup-script=run-web.sh', 'gcloud compute instance-groups managed create web-mig --region=asia-southeast2 --template=web-c1 --size=2 --health-check=web-hc']
                },
                {
                  title: 'Platform 2: GKE Autopilot',
                  text: 'A Deployment with requests set, then a Service or Gateway.',
                  code: ['gcloud container clusters create-auto web-ap --region=asia-southeast2', 'kubectl create deployment web --image=' + AR + '/web:v1 --replicas=2', 'kubectl set resources deployment web --requests=cpu=250m,memory=512Mi', 'kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080']
                },
                { title: 'Platform 3: Cloud Run', text: 'One command: no servers, no cluster.', code: ['gcloud run deploy web --image=' + AR + '/web:v1 --region=asia-southeast2 --allow-unauthenticated'] },
                {
                  title: 'Roll out v2 on Cloud Run with a traffic split',
                  text: 'Deploy with no traffic, test the tag URL, then 10% → 50% → 100%.',
                  code: ['gcloud run deploy web --image=' + AR + '/web:v2 --region=asia-southeast2 --no-traffic --tag=v2', 'gcloud run services update-traffic web --region=asia-southeast2 --to-tags=v2=10', 'gcloud run services update-traffic web --region=asia-southeast2 --to-latest']
                },
                { title: 'Compare and write it up', text: 'Note the provisioning effort, scaling behaviour and idle cost of each.' }
              ]
            },
            {
              kind: 'table',
              caption: 'What the comparison usually shows',
              columns: ['', 'MIG', 'GKE Autopilot', 'Cloud Run'],
              rows: [
                ['Provisioning effort', 'Most: template, health check, firewall, LB', 'Medium: cluster, manifests, Service', 'Least: one deploy'],
                ['Scaling', 'VMs in minutes, on CPU/LB/metrics/schedules', 'Pods in seconds, nodes provisioned for you', 'Instances in seconds, down to zero'],
                ['Idle cost', 'Minimum VMs always billed', 'Requests of running Pods', 'Zero with min instances 0'],
                ['Releases', 'Rolling update or canary on templates', '`kubectl set image`, rollout undo', 'Revisions and traffic splitting']
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Before the Module 2 try-out',
      sections: [
        {
          id: 'm2-cues',
          title: 'Cue → answer',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['minimise operational overhead, containers', 'Cloud Run, or GKE Autopilot if it needs Kubernetes'],
                ['specific OS / licence / agent', 'Compute Engine'],
                ['fault-tolerant batch, cheapest', 'Spot VMs (in a MIG) or a Spot node pool'],
                ['exact vCPU and memory', 'Custom machine type'],
                ['no external IP but needs SSH', 'IAP TCP forwarding, 35.235.240.0/20'],
                ['revoke SSH quickly, central control', 'OS Login + IAM'],
                ['patch on a schedule with reports', 'VM Manager patch deployment'],
                ['more IOPS without more GB', 'Hyperdisk provisioned IOPS'],
                ['no data loss if a zone fails (disk)', 'Regional PD / Hyperdisk Balanced HA'],
                ['daily backup, keep N days', 'Snapshot schedule'],
                ['copy a whole VM', 'Machine image'],
                ['change every VM in a group', 'New template + rolling update'],
                ['VMs recreated in a loop', 'Health check firewall rule / initial delay'],
                ['control plane survives a zone outage', 'Regional GKE cluster'],
                ['Pods Pending, nodes full', 'Cluster autoscaler (Standard)'],
                ['ImagePullBackOff, other project', 'Artifact Registry Reader for the node SA'],
                ['canary on Cloud Run', '`--no-traffic --tag`, then `update-traffic`'],
                ['cold starts', 'Min instances / startup CPU boost'],
                ['react to an uploaded file', 'Eventarc or a Cloud Storage trigger'],
                ['every subscriber gets every message', 'One subscription per subscriber'],
                ['huge JAX/TensorFlow training', 'TPU'],
                ['GPU VM create fails', 'Quota in that region / TERMINATE maintenance policy']
              ]
            }
          ]
        },
        {
          id: 'm2-traps',
          title: 'Traps that cost points',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Preemptible ≠ Spot.** Answers mentioning a 24-hour limit describe the legacy preemptible VM.',
                '**Templates cannot be edited.** "Edit the instance template" is always wrong.',
                '**Local SSD data is lost** when the VM stops. It is never the answer for durable data.',
                '**Regional GKE `--num-nodes` is per zone.**',
                '**HPA does not add nodes** and the cluster autoscaler does not add Pods.',
                '**`kubectl expose --type=LoadBalancer` gives an L4 load balancer.** HTTP path routing needs Ingress or Gateway.',
                '**Cloud Run services time out at 60 minutes at most.** Long batch work is a Cloud Run job.',
                '**Pub/Sub is at-least-once.** Duplicates are normal; fix the handler, not Pub/Sub.',
                '**Container Registry is gone.** Answers using `gcr.io` for new work are outdated. Use Artifact Registry.'
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
              q: 'A stateful application on a single VM must keep running with no data loss if its zone fails. The app cannot be rewritten. What do you use?',
              options: ['A snapshot schedule every hour', 'A regional persistent disk, with the VM recreated in the second zone on failure', 'Local SSD in RAID', 'A zonal MIG of size 1'],
              answer: 1,
              explain: 'A regional disk replicates synchronously to a second zone, so a VM there can take it over with no data loss. Snapshots lose recent writes.'
            },
            {
              kind: 'quiz',
              q: 'You must roll a new template onto a regional MIG of 10 VMs without ever having fewer than 10 serving. Which settings?',
              options: ['`--max-surge=0 --max-unavailable=3`', '`--max-surge=3 --max-unavailable=0`', '`rolling-action replace --max-unavailable=10`', 'An opportunistic update'],
              answer: 1,
              explain: 'Surge adds new VMs before old ones go. With max-unavailable 0, capacity never drops.'
            },
            {
              kind: 'quiz',
              q: 'Developers need SSH to Linux VMs, removable in one place when they leave, and with sudo only for the ops team. What should you configure?',
              options: ['Project-wide SSH keys in metadata', 'OS Login, with Compute OS Login for developers and Compute OS Admin Login for ops', 'A shared service account key', 'IAP for web apps'],
              answer: 1,
              explain: 'OS Login ties Linux accounts to IAM. Removing the role removes access everywhere, and the admin role adds sudo.'
            },
            {
              kind: 'quiz',
              q: 'Pods on a new GKE Standard cluster stay `Pending` with "Insufficient cpu". The Deployment has an HPA. What fixes it with the least manual work?',
              options: ['Increase the HPA maximum', 'Enable the cluster autoscaler on the node pool', 'Add a VPA', 'Delete and recreate the Pods'],
              answer: 1,
              explain: 'The HPA wants more Pods, but there is nowhere to put them. The cluster autoscaler adds nodes when Pods cannot be scheduled.'
            },
            {
              kind: 'quiz',
              q: 'On GKE Autopilot, what decides most of the bill for a workload?',
              options: ['The number of nodes in the cluster', 'The CPU, memory and storage the Pods request', 'The size of the control plane', 'The node machine type you selected'],
              answer: 1,
              explain: 'Autopilot charges for Pod resource requests. You do not choose or pay for nodes directly.'
            },
            {
              kind: 'quiz',
              q: 'A Cloud Run service is public. Only the company’s other Cloud Run service should be able to call it. What do you do?',
              options: ['Keep `allUsers` as invoker and check a header', 'Remove `allUsers`, grant `roles/run.invoker` to the caller’s service account, and have it send an ID token', 'Put both services in the same region', 'Use a firewall rule on the service'],
              answer: 1,
              explain: 'Cloud Run authorises callers with IAM. The caller authenticates with an ID token for the service URL. VPC firewall rules do not apply to Cloud Run’s URL.'
            },
            {
              kind: 'quiz',
              q: 'Every image uploaded to a bucket must be resized automatically by a Cloud Run service. What is the most direct way?',
              options: ['A Cloud Scheduler job that lists the bucket every minute', 'An Eventarc trigger on `google.cloud.storage.object.v1.finalized` for that bucket', 'A MIG polling the bucket', 'Object lifecycle rules'],
              answer: 1,
              explain: 'Eventarc delivers the finalize event as soon as the object is written. Polling is slower and wasteful, and lifecycle rules only delete objects or change their storage class.'
            },
            {
              kind: 'quiz',
              q: 'A Pub/Sub subscriber crashes on a malformed message, which is redelivered forever and blocks progress. What should you add?',
              options: ['Exactly-once delivery', 'A dead-letter topic with a maximum number of delivery attempts', 'A longer ack deadline', 'Message ordering'],
              answer: 1,
              explain: 'After the maximum delivery attempts, the message moves to the dead-letter topic for inspection and the subscription keeps flowing.'
            },
            {
              kind: 'quiz',
              q: 'Developers must work in identical, centrally managed environments, and source code must never be stored on laptops. What do you use?',
              options: ['Cloud Shell for everyone', 'Cloud Workstations configurations', 'A shared Compute Engine VM', 'Agent Platform Workbench'],
              answer: 1,
              explain: 'Cloud Workstations gives each developer a managed workstation from an admin-controlled configuration inside your VPC.'
            },
            {
              kind: 'quiz',
              q: 'Which statement about Spot VMs is true?',
              options: ['They are limited to 24 hours', 'They can be preempted at any time with about 30 seconds notice', 'They live-migrate during maintenance', 'They have the same price as standard VMs but lower priority'],
              answer: 1,
              explain: 'Spot VMs can be reclaimed whenever Compute Engine needs the capacity, with a short notice, and have no maximum runtime.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: Compute Engine', href: '#/ace/lab/cmd/compute', note: 'instances, disks, snapshots, MIGs' },
    { label: 'Terminal: template + MIG autoscaling', href: '#/ace/lab/terminal/mig-autoscale', note: 'Session 4 and 5' },
    { label: 'Command quiz: GKE', href: '#/ace/lab/cmd/gke', note: 'clusters, node pools' },
    { label: 'Command quiz: kubectl deploy, scale, update', href: '#/ace/lab/cmd/kubectl-deploy', note: 'Session 6' },
    { label: 'Terminal: GKE deploy, expose, autoscale', href: '#/ace/lab/terminal/gke-deploy', note: 'Session 6' },
    { label: 'Command quiz: Cloud Run, functions and App Engine', href: '#/ace/lab/cmd/serverless', note: 'deploy, traffic, triggers' },
    { label: 'Canvas: upload → function → BigQuery', href: '#/ace/lab/canvas/event-pipeline', note: 'Session 7 events' },
    { label: 'Deep dive: GKE', href: '#/ace/learn/gke', note: 'Autopilot, kubectl, case studies' },
    { label: 'Deep dive: Cloud Run', href: '#/ace/learn/cloud-run', note: 'revisions, scaling, IAM' }
  ]
};
