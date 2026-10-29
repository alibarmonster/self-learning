/**
 * Module 2 try-out — Compute Services (exam guide 2.1 and 3.1). 100 questions:
 * choosing compute; launching VMs, availability policies and remote access;
 * Spot VMs, custom machine types, OS Login and VM Manager; Persistent Disk and
 * Hyperdisk; snapshots and images; templates, MIGs and autoscaling; GKE cluster
 * types, kubectl, workloads and Artifact Registry; node pools and Pod
 * autoscaling; Cloud Run and Cloud Run functions; events; GPUs, TPUs, Agent
 * Runtime and Cloud Workstations. Dealt into five sets of 20 in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const module2: ModuleQuestion[] = [
  // ── Choosing compute ──
  {
    id: 'ace-m2-001',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'Whenever a document is written to a Firestore collection, about 20 lines of code must update a counter in another collection. You want no servers and the least code. What should you use?',
    options: [
      'A Cloud Run function with a Firestore document-written trigger',
      'A Compute Engine VM that polls the collection every few seconds',
      'A GKE Deployment that watches the collection with a client library',
      'A Cloud Run job started by Cloud Scheduler every minute'
    ],
    answer: 0,
    explanation: 'Cloud Run functions can be triggered by Firestore events through Eventarc, so the code runs once per write with nothing to manage. Polling from a VM or a Deployment wastes resources and adds delay, and a scheduled job runs on a timer rather than on each write.'
  },
  {
    id: 'ace-m2-002',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A containerised chat backend needs WebSocket connections that stay open for up to 45 minutes and scales with traffic. The team wants no clusters or VMs to manage. Which service fits?',
    options: [
      'Cloud Run, with the request timeout raised to cover the connection length',
      'Cloud Run functions, with an event timeout of 45 minutes on each trigger',
      'App Engine standard environment, with automatic scaling turned on',
      'A Compute Engine managed instance group running the container image'
    ],
    answer: 0,
    explanation: 'Cloud Run supports WebSockets and HTTP/2 streaming, and a request — including a WebSocket connection — can last up to 60 minutes once the timeout is raised. Event-driven functions have shorter limits, App Engine standard does not support WebSockets, and a MIG means managing VMs.'
  },
  {
    id: 'ace-m2-003',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'A vendor’s simulation software runs only on Windows Server and requires installing a kernel-mode driver. Which compute option fits?',
    options: ['Compute Engine', 'Cloud Run', 'GKE Autopilot', 'Cloud Run functions'],
    answer: 0,
    explanation: 'Only Compute Engine gives you the whole operating system, including Windows Server and kernel drivers. Cloud Run and Cloud Run functions run Linux containers on managed infrastructure, and Autopilot does not allow node-level changes such as kernel drivers.'
  },
  {
    id: 'ace-m2-004',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A platform team runs a Kafka operator, a node-level security agent as a privileged DaemonSet, and custom node kernel settings. They want managed Kubernetes. Which option fits?',
    options: [
      'GKE Standard, with node pools configured by the team',
      'GKE Autopilot, with the default compute class',
      'Cloud Run, with sidecar containers for the agent',
      'Cloud Run functions, behind an API gateway'
    ],
    answer: 0,
    explanation: 'GKE Standard gives control of nodes, so privileged DaemonSets and node system configuration (such as sysctl settings) are allowed. Autopilot manages nodes for you and restricts privileged workloads, and Cloud Run runs individual services, not Kubernetes operators.'
  },
  {
    id: 'ace-m2-005',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A team wants Kubernetes without managing nodes, and one of its workloads needs NVIDIA L4 GPUs. Which approach fits?',
    options: [
      'GKE Autopilot, requesting the L4 GPU in the Pod specification',
      'GKE Standard only, because Autopilot cannot run GPU workloads',
      'Compute Engine with GPUs, because GKE does not support the L4',
      'Cloud Workstations with a GPU, connected to the cluster'
    ],
    answer: 0,
    explanation: 'Autopilot supports GPUs: the Pod selects the accelerator (for example with the `cloud.google.com/gke-accelerator: nvidia-l4` node selector and a GPU limit) and Autopilot provisions suitable nodes. Standard also works but means managing node pools, and Cloud Workstations are developer environments.'
  },
  {
    id: 'ace-m2-006',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'Each night, 1,000 independent image-processing tasks must run in containers for about 10 minutes each and then stop. You want no servers to manage and to pay only while tasks run. What should you use?',
    options: [
      'A Cloud Run job with 1,000 tasks and a suitable parallelism',
      'A Cloud Run service with minimum instances set to 1,000',
      'A GKE Standard cluster sized for 1,000 Pods all day long',
      'An App Engine flexible service with manual scaling'
    ],
    answer: 0,
    explanation: 'A Cloud Run job runs a container to completion as many indexed tasks, with the parallelism you choose and retries for failed tasks, and bills only while they run. A service is built for requests and minimum instances bill when idle; an always-on cluster or App Engine flexible keeps paying for idle capacity.'
  },
  {
    id: 'ace-m2-007',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A company wants to move 300 VMware vSphere VMs to Google Cloud quickly, keeping its existing VMware tools and processes, and modernise later. Which option fits?',
    options: [
      'Google Cloud VMware Engine',
      'Compute Engine with imported VMDK images',
      'GKE with Migrate to Containers',
      'Cloud Run with one service per VM'
    ],
    answer: 0,
    explanation: 'Google Cloud VMware Engine runs a dedicated VMware stack (vSphere, vSAN, NSX) on Google Cloud, so VMs move with their existing tooling. Importing into Compute Engine or converting to containers changes the platform, which the company wants to postpone.'
  },
  {
    id: 'ace-m2-008',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A marketing site is plain HTML, CSS and images with no server-side code. You want the cheapest option with nothing to run or patch, served over HTTPS on a custom domain. What should you do?',
    options: [
      'Serve the files from a Cloud Storage bucket behind a load balancer with Cloud CDN',
      'Run nginx on a Compute Engine e2-micro VM with a reserved static external IP address',
      'Run nginx in a GKE Autopilot Deployment exposed by a LoadBalancer Service',
      'Run nginx on a managed instance group of small VMs behind a load balancer'
    ],
    answer: 0,
    explanation: 'Static content needs no compute: a bucket serves the files, the load balancer adds HTTPS with a Google-managed certificate on your domain, and Cloud CDN caches it at the edge. Every nginx option means a machine or cluster to run and patch.'
  },
  {
    id: 'ace-m2-009',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A team built an AI agent with the Agent Development Kit. They want Google to host and scale it and to keep conversation sessions and long-term memory for them, with built-in tracing. Where should they deploy it?',
    options: [
      'Agent Runtime on Gemini Enterprise Agent Platform',
      'A Compute Engine VM with an attached GPU',
      'A Cloud Run job started for each conversation',
      'Cloud Workstations shared by the team'
    ],
    answer: 0,
    explanation: 'Agent Runtime (formerly Vertex AI Agent Engine) is the managed runtime for agents: you deploy from the SDK and it scales them and provides managed sessions, memory and observability. Cloud Run can host an agent too, but you would build session storage yourself; a VM or a job per conversation adds work, and workstations are for developers.'
  },
  {
    id: 'ace-m2-010',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'An old App Engine standard app needs a language version App Engine does not offer. The team wants to package it as a container and keep a serverless, scale-to-zero platform. Where should it move?',
    options: ['Cloud Run', 'Compute Engine', 'GKE Standard', 'App Engine flexible environment'],
    answer: 0,
    explanation: 'Cloud Run runs any container serverlessly and scales to zero, which makes it Google’s recommended path for modernising App Engine apps. Compute Engine and GKE Standard add infrastructure to manage, and App Engine flexible always keeps at least one instance running.'
  },

  // ── Launching instances, availability policies, SSH and remote access ──
  {
    id: 'ace-m2-011',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'A new VM must have no external IP address and must run as the service account app-sa. Which flags should you add to `gcloud compute instances create`?',
    options: [
      '`--no-address --service-account=app-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform`',
      '`--private-ip-only --identity=app-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform`',
      '`--address=none --service-account=app-sa@ace-lab-123.iam.gserviceaccount.com --scopes=default`',
      '`--internal --run-as=app-sa@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform`'
    ],
    answer: 0,
    explanation: '`--no-address` creates the VM without an external IP, and `--service-account` with `--scopes=cloud-platform` attaches the account and lets IAM decide what it can call. The other flags do not exist, and the default scopes would limit the account.'
  },
  {
    id: 'ace-m2-012',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'What does Compute Engine do by default with a standard (non-Spot) VM when Google needs to carry out maintenance on its host?',
    options: [
      'It live-migrates the VM to another host without rebooting it',
      'It stops the VM and restarts it after the maintenance finishes',
      'It deletes the VM and recreates it from its boot disk elsewhere',
      'It pauses the VM until the maintenance window has finished'
    ],
    answer: 0,
    explanation: 'The default availability policy is on-host maintenance MIGRATE with automatic restart on, so most VMs are moved live and keep running. TERMINATE (required for many GPU VMs) stops them instead, and VMs are never deleted for maintenance.'
  },
  {
    id: 'ace-m2-013',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'You want to test how your application behaves when its VM goes through a host maintenance event, before it happens in production. What should you do?',
    options: [
      'Run `gcloud compute instances simulate-maintenance-event` on a test VM',
      'Stop and start the VM from the console to reproduce a live migration',
      'Change the VM’s machine type, which triggers a live migration',
      'Ask Google Cloud Support to schedule maintenance on the VM’s host'
    ],
    answer: 0,
    explanation: '`simulate-maintenance-event` triggers a maintenance event on the VM, so you see what live migration — or termination, for VMs set to TERMINATE — does to your app. A stop and start is a different event, changing the machine type requires a stop, and Support does not schedule host maintenance for tests.'
  },
  {
    id: 'ace-m2-014',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Your team adds SSH keys to project metadata, so every VM accepts them. One sensitive VM must accept only its own instance-level keys. What should you set on it?',
    options: [
      'Instance metadata `block-project-ssh-keys=TRUE`',
      'Instance metadata `enable-oslogin=FALSE`',
      'Instance metadata `serial-port-enable=FALSE`',
      'Project metadata `ssh-keys` with an empty value'
    ],
    answer: 0,
    explanation: '`block-project-ssh-keys` makes the VM ignore the keys in project metadata and accept only those in its own metadata. OS Login is a separate mechanism that ignores metadata keys altogether, serial port settings do not affect SSH, and emptying the project keys affects every VM.'
  },
  {
    id: 'ace-m2-015',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'The first time you run `gcloud compute ssh web-1` in a project that does not use OS Login, what does gcloud do?',
    options: [
      'Creates an SSH key pair on your machine and adds the public key to project or instance metadata',
      'Asks Google Cloud Support to approve your SSH access to the VM before it connects you',
      'Creates a Linux user with a random password on the VM and emails the password to you',
      'Opens a browser window where you paste the VM’s root password to finish connecting'
    ],
    answer: 0,
    explanation: 'gcloud generates a key pair (in ~/.ssh/google_compute_engine), adds the public key to metadata and connects with it. With OS Login enabled, the key goes into your OS Login profile instead. Passwords and Support approvals are not part of it.'
  },
  {
    id: 'ace-m2-016',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'SSH to a VM times out, and you do not know whether IAM, firewall rules or the VM itself is the problem. Which command checks these for you?',
    options: [
      '`gcloud compute ssh web-1 --troubleshoot`',
      '`gcloud compute instances describe web-1 --ssh`',
      '`gcloud compute ssh web-1 --verbosity=none`',
      '`gcloud compute firewall-rules describe --ssh web-1`'
    ],
    answer: 0,
    explanation: 'The SSH troubleshooting tool (`--troubleshoot`) checks network connectivity, firewall rules, IAM permissions and the VM’s state, and suggests fixes. The other flags either do not exist or just hide output.'
  },
  {
    id: 'ace-m2-017',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Administrators need Remote Desktop to a Windows Server VM that has no external IP, from their laptops and without a VPN. What should they run before opening the RDP client?',
    options: [
      '`gcloud compute start-iap-tunnel win-1 3389 --local-host-port=localhost:3389 --zone=asia-southeast2-a`',
      '`gcloud compute ssh win-1 --rdp --tunnel-through-iap --zone=asia-southeast2-a`',
      '`gcloud compute reset-windows-password win-1 --rdp-forward --zone=asia-southeast2-a`',
      '`gcloud compute connect-to-serial-port win-1 --port=3389 --zone=asia-southeast2-a`'
    ],
    answer: 0,
    explanation: '`start-iap-tunnel` forwards a local port through Identity-Aware Proxy to port 3389 on the VM’s internal IP; the RDP client then connects to localhost:3389. It needs IAP-secured Tunnel User and a firewall rule allowing 35.235.240.0/20. The other commands do not forward RDP.'
  },
  {
    id: 'ace-m2-018',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'Your data centre is connected to the VPC by Cloud VPN. Administrators on-premises need SSH to VMs that have only internal IPs. What is the simplest setup?',
    options: [
      'Allow tcp:22 from the on-premises range in a firewall rule and SSH to the VMs’ internal IPs',
      'Give each VM an ephemeral external IP address while the administrators are connected',
      'Create a bastion host with an external IP and allow SSH from 0.0.0.0/0 to the bastion',
      'Enable Private Google Access on the subnet so that SSH sessions reach the VMs'
    ],
    answer: 0,
    explanation: 'With hybrid connectivity, on-premises hosts reach internal IPs directly, so a firewall rule from the on-premises range is all that is needed. External IPs and an open bastion widen exposure, and Private Google Access is about reaching Google APIs.'
  },
  {
    id: 'ace-m2-019',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'A VM is running, but its web service never comes up and SSH fails. You want to see the boot messages without connecting. What should you run?',
    options: [
      '`gcloud compute instances get-serial-port-output web-1`',
      '`gcloud compute instances describe web-1 --boot-log`',
      '`gcloud logging read "boot" --vm=web-1`',
      '`gcloud compute ssh web-1 --boot-only`'
    ],
    answer: 0,
    explanation: 'The serial port output holds the kernel and startup-script messages written during boot, readable without SSH. The other flags do not exist; with the Ops Agent installed, syslog would also be in Cloud Logging.'
  },
  {
    id: 'ace-m2-020',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'An application on a VM must read a custom setting named `db-host` that you set in the instance metadata. How does it read the value?',
    options: [
      'GET `http://metadata.google.internal/computeMetadata/v1/instance/attributes/db-host` with `Metadata-Flavor: Google`',
      'Read the file `/etc/google/metadata/db-host`, which the guest agent keeps up to date on the VM',
      'Call `gcloud compute instances describe` from inside the VM, passing the instance’s own name',
      'Read the `DB_HOST` environment variable, which Compute Engine fills in from the instance metadata'
    ],
    answer: 0,
    explanation: 'The metadata server is reachable from every VM without credentials; custom keys live under `instance/attributes/`, and the `Metadata-Flavor: Google` header is required. Metadata is not written to files or environment variables, and calling gcloud needs credentials and a round trip to the API.'
  },
  {
    id: 'ace-m2-021',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'Development VMs should start at 08:00 and stop at 20:00 on weekdays to save money, without any scripts. What should you use?',
    options: [
      'An instance schedule resource policy attached to the VMs',
      'A snapshot schedule attached to the VMs’ boot disks',
      'A shutdown script in each VM’s metadata set for 20:00',
      'A budget alert that stops the VMs when spending rises'
    ],
    answer: 0,
    explanation: 'Instance schedules (`gcloud compute resource-policies create instance-schedule`) start and stop the VMs they are attached to on a cron-style schedule. Snapshot schedules back up disks, shutdown scripts run when a VM stops rather than on a timetable, and budgets do not stop VMs.'
  },
  {
    id: 'ace-m2-022',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'For a two-day product launch you must be sure that 200 n2-standard-8 VMs can be created in asia-southeast2-a, even if the zone is busy. What should you do in advance?',
    options: [
      'Create a reservation for 200 n2-standard-8 VMs in that zone',
      'Buy a three-year committed use discount for the VMs',
      'Request a CPU quota increase for the region and nothing more',
      'Create the VMs as Spot VMs so that they get priority capacity'
    ],
    answer: 0,
    explanation: 'A reservation holds capacity for a machine type in a zone, so the VMs can be created when needed (you pay for it while it exists, and future reservations can request capacity ahead of time). Quota only permits usage, a commitment is a discount rather than guaranteed capacity, and Spot VMs get the lowest priority.'
  },

  // ── Spot VMs, custom machine types, OS Login, VM Manager ──
  {
    id: 'ace-m2-023',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A batch worker on a Spot VM should check, from inside the VM, whether a preemption has started, so it can stop taking new work. How can it find out?',
    options: [
      'Watch the metadata server value `instance/preempted`, which becomes TRUE on preemption',
      'Read the Cloud Billing export, which records each preemption as it happens',
      'Watch the VM’s CPU usage, which drops to zero shortly before a preemption',
      'Call `gcloud compute instances list` every second and check the VM’s status'
    ],
    answer: 0,
    explanation: 'The metadata server exposes `instance/preempted` (watchable with `?wait_for_change=true`), and a shutdown script also runs at preemption; together they use the roughly 30 seconds of notice. Billing data and CPU usage are not signals, and polling the API every second is slow and wasteful.'
  },
  {
    id: 'ace-m2-024',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'A managed instance group runs Spot VMs for a fault-tolerant batch system. What happens when one of its VMs is preempted?',
    options: [
      'The MIG tries to recreate the VM, which starts again when capacity is available',
      'The MIG shrinks permanently, and you have to resize it again by hand',
      'The VM is converted to a standard VM so the group keeps its target size',
      'The whole group stops until every VM can be started again together'
    ],
    answer: 0,
    explanation: 'A MIG keeps working toward its target size, so preempted Spot VMs are recreated as soon as Compute Engine has capacity. The group does not shrink permanently or stop, and Spot VMs are not silently converted to standard pricing.'
  },
  {
    id: 'ace-m2-025',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'Which workload is the poorest fit for Spot VMs?',
    options: [
      'A single-instance production database that must stay available',
      'A rendering farm that re-queues frames from a lost VM',
      'A CI system that retries builds on another runner',
      'Nightly data processing split into restartable chunks'
    ],
    answer: 0,
    explanation: 'Spot VMs can be stopped at any time with about 30 seconds of notice and have no availability SLA, so a lone production database would go down with them. The other workloads tolerate losing a VM and retry the work.'
  },
  {
    id: 'ace-m2-026',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'hard',
    prompt: 'An in-memory analytics process needs 4 vCPUs and 64 GB of memory on the N2 series. A plain N2 custom machine type rejects that much memory per vCPU. What should you do?',
    options: [
      'Create a custom machine type with extended memory',
      'Use n2-standard-16 and leave the extra vCPUs idle',
      'Attach a Local SSD and use it as swap for the rest',
      'Request a quota increase for memory in the region'
    ],
    answer: 0,
    explanation: 'Custom machine types allow a range of memory per vCPU (up to 8 GB per vCPU on N2); extended memory goes beyond that limit and charges only for the extra memory. A larger standard type pays for unused vCPUs, swap on disk is far slower, and quota has nothing to do with the shape.'
  },
  {
    id: 'ace-m2-027',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'Which machine type value creates an N2 VM with 6 vCPUs and 20 GB of memory?',
    options: ['`n2-custom-6-20480`', '`n2-standard-6-20`', '`custom-n2-6cpu-20gb`', '`n2-highmem-6-20480`'],
    answer: 0,
    explanation: 'Custom machine types are named SERIES-custom-VCPUS-MEMORY_MB, and 20 GB is 20480 MB. The same shape can be requested with `--custom-cpu=6 --custom-memory=20GB --custom-vm-type=n2`. Predefined types such as n2-standard come in fixed sizes.'
  },
  {
    id: 'ace-m2-028',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'OS Login is already enabled. Security now requires a second factor every time someone opens an SSH session to the project’s VMs. What should you set?',
    options: [
      'Project metadata `enable-oslogin-2fa=TRUE`',
      'Project metadata `enable-oslogin=2FA`',
      'An IAM condition on Compute OS Login',
      'The organization policy `compute.requireOsLogin`'
    ],
    answer: 0,
    explanation: '`enable-oslogin-2fa=TRUE`, together with OS Login, makes SSH sessions require the user’s 2-Step Verification. `compute.requireOsLogin` only enforces OS Login itself, IAM conditions cannot ask for a second factor, and `enable-oslogin` takes TRUE or FALSE.'
  },
  {
    id: 'ace-m2-029',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A contractor from another Google Workspace organization must SSH with OS Login to VMs in your project. They already have Compute OS Login on the project but are still denied. What else is needed?',
    options: [
      'Grant them Compute OS Login External User on your organization',
      'Grant them Compute OS Admin Login on every VM individually',
      'Add their public SSH key to project metadata as a fallback',
      'Enable the interactive serial console on the VMs for them'
    ],
    answer: 0,
    explanation: 'Users from outside your organization also need `roles/compute.osLoginExternalUser`, granted on your organization, before OS Login lets them in. Admin login adds sudo but not external access, metadata keys are ignored when OS Login is on, and the serial console is a different access path.'
  },
  {
    id: 'ace-m2-030',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'With OS Login enabled, a developer wants to use their own existing SSH key pair from a terminal instead of letting gcloud create one. How do they register the public key?',
    options: [
      '`gcloud compute os-login ssh-keys add --key-file=~/.ssh/id_ed25519.pub`',
      '`gcloud compute project-info add-metadata --metadata=ssh-keys=...`',
      '`gcloud compute instances add-metadata web-1 --metadata=ssh-keys=...`',
      '`gcloud iam service-accounts keys upload ~/.ssh/id_ed25519.pub`'
    ],
    answer: 0,
    explanation: 'With OS Login, public keys live in the user’s OS Login profile, added with `gcloud compute os-login ssh-keys add` (optionally with a TTL). Metadata keys are ignored when OS Login is on, and service account keys have nothing to do with SSH.'
  },
  {
    id: 'ace-m2-031',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'After a critical OpenSSL advisory, you must find which of your 400 VMs have the affected package version installed. Which VM Manager feature answers this?',
    options: ['OS inventory management', 'OS patch management', 'OS policies', 'Instance schedules'],
    answer: 0,
    explanation: 'OS inventory collects installed packages and available updates from each VM through the OS Config agent, so you can search the whole fleet. Patch management applies updates, OS policies enforce a desired state, and instance schedules start and stop VMs.'
  },
  {
    id: 'ace-m2-032',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Every VM labelled role=web must always have nginx installed and running, and if someone removes it, it should be put back automatically. What should you use?',
    options: [
      'A VM Manager OS policy assignment targeting the role=web label',
      'A startup script that installs nginx each time the VM boots',
      'A patch deployment that installs nginx once every week',
      'An organization policy that requires the nginx package'
    ],
    answer: 0,
    explanation: 'OS policy assignments describe a desired state — packages, files, services — for VMs selected by labels or other filters, and the OS Config agent checks and corrects drift regularly. A startup script only runs at boot, patch jobs update existing packages, and organization policies do not manage guest software.'
  },

  // ── Persistent Disk and Hyperdisk ──
  {
    id: 'ace-m2-033',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'hard',
    prompt: 'A database VM in asia-southeast2-a uses a regional persistent disk replicated to zone b. Zone a fails. How do you bring the database up in zone b?',
    options: [
      'Start a VM in zone b and attach the regional disk to it with `--force-attach`',
      'Restore the latest snapshot into zone b, because a regional disk cannot move',
      'Wait for zone a to recover, because a regional disk only attaches in its first zone',
      'Clone the disk with `gcloud compute disks create --source-disk` in zone b and attach it'
    ],
    answer: 0,
    explanation: 'A regional persistent disk is synchronously replicated to two zones; in a failover you attach it to a VM in the surviving zone, with `gcloud compute instances attach-disk --force-attach` when the old VM cannot release it. Restoring a snapshot loses recent writes, and waiting defeats the purpose.'
  },
  {
    id: 'ace-m2-034',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A new C3 VM needs block storage replicated synchronously across two zones of the region, so that a standby VM can take over with no data loss. Which disk should you choose?',
    options: ['Hyperdisk Balanced High Availability', 'Hyperdisk Throughput', 'Local SSD in RAID 1', 'Zonal pd-ssd with snapshots'],
    answer: 0,
    explanation: 'Hyperdisk Balanced High Availability is the Hyperdisk counterpart of a regional persistent disk: it writes synchronously to two zones and can be attached in either. Hyperdisk Throughput is zonal, Local SSD is ephemeral, and snapshots lose the writes made since the last one.'
  },
  {
    id: 'ace-m2-035',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'hard',
    prompt: 'Fifty VMs each need some IOPS and capacity, but their peaks happen at different times. You want to buy performance and capacity in bulk and let the disks share it. What should you use?',
    options: [
      'A Hyperdisk storage pool, with the disks created inside it',
      'One large pd-ssd disk attached read-write to every VM',
      'Local SSDs on each VM, with data copied between them',
      'Fifty separate pd-extreme disks sized for each peak'
    ],
    answer: 0,
    explanation: 'Hyperdisk storage pools provision capacity and performance in aggregate; disks in the pool draw on the shared pool, so you size for combined demand instead of every disk’s peak. A standard disk cannot be attached read-write to many VMs, Local SSD is ephemeral, and per-disk peak sizing costs the most.'
  },
  {
    id: 'ace-m2-036',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'hard',
    prompt: 'For disaster recovery, a stateful VM’s disk must be continuously copied to another region with a recovery point of about a minute. What should you configure?',
    options: [
      'Persistent Disk Asynchronous Replication to a secondary disk in the other region',
      'A regional persistent disk that spans the two regions synchronously',
      'An hourly snapshot schedule with snapshots stored in a multi-region location',
      'A Hyperdisk storage pool that spans both regions with shared capacity'
    ],
    answer: 0,
    explanation: 'Asynchronous Replication copies a disk to a paired region with an RPO typically under a minute, and you fail over by attaching the secondary disk. Regional disks span two zones of one region, hourly snapshots lose up to an hour, and storage pools are zonal.'
  },
  {
    id: 'ace-m2-037',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A pd-balanced data disk is hitting its IOPS limit. You want the simplest change that raises its performance without changing the disk type or the VM. What should you do?',
    options: [
      'Increase the size of the disk, because persistent disk performance grows with size',
      'Attach a second pd-balanced disk and mirror the data in the operating system',
      'Turn on live migration for the VM so that it moves to a faster host',
      'Change the snapshot schedule so that fewer snapshots are taken in the day'
    ],
    answer: 0,
    explanation: 'Persistent disk IOPS and throughput scale with capacity, up to the limits of the type and the VM’s vCPU count, so a resize raises them online. Mirroring adds complexity, live migration does not change disk limits, and snapshots do not throttle IOPS. Hyperdisk would let you set IOPS on its own.'
  },
  {
    id: 'ace-m2-038',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'You want to add a Local SSD to a running VM for scratch space. What should you know?',
    options: [
      'Local SSDs are set when the VM is created; you cannot attach one to an existing VM',
      'Local SSDs attach to a running VM like any other disk, with attach-disk',
      'Local SSDs can only be added after moving the VM to a sole-tenant node',
      'Local SSDs are attached automatically when the VM’s CPU usage stays high'
    ],
    answer: 0,
    explanation: 'Local SSD disks are physically attached to the host and their number is fixed when the VM is created (some machine series include them automatically). To add one you create a new VM, for example from a machine image. Their data is lost when the VM stops.'
  },
  {
    id: 'ace-m2-039',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A pd-standard data disk turned out to be too slow and must become pd-ssd. Which approach works?',
    options: [
      'Snapshot the disk, create a pd-ssd disk from the snapshot, and attach it in place of the old one',
      'Run `gcloud compute disks resize` with `--type=pd-ssd` while the disk stays attached',
      'Change the VM’s machine type, which converts all of its disks to SSD automatically',
      'Turn on the disk’s auto-upgrade option, which switches it to SSD at the next maintenance'
    ],
    answer: 0,
    explanation: 'Creating a new disk of the target type from a snapshot (or as a clone) is the standard way to change a persistent disk’s type; swap it in during a short window. `resize` only changes size, machine types do not change disk types, and there is no auto-upgrade option.'
  },
  {
    id: 'ace-m2-040',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'You are deleting a VM but must keep its boot disk for later analysis. What should you do?',
    options: [
      'Delete it with `gcloud compute instances delete web-1 --keep-disks=boot`',
      'Delete it normally, because boot disks are never deleted with their VM',
      'Take a screenshot of the VM first, which preserves its disk contents',
      'Stop the VM for 24 hours, after which its boot disk becomes independent'
    ],
    answer: 0,
    explanation: 'Boot disks are auto-deleted with their VM by default; `--keep-disks=boot` (or turning off auto-delete on the disk) keeps it. A snapshot or machine image would also preserve the data, but stopping the VM or taking a screenshot does not.'
  },
  {
    id: 'ace-m2-041',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A 2 TB data disk now holds only 200 GB of data, and you want to stop paying for the unused space. What should you do?',
    options: [
      'Create a smaller disk, copy the data to it inside the VM, and replace the large disk',
      'Run `gcloud compute disks resize` with a smaller size while the disk is attached',
      'Take a snapshot and restore it to a 200 GB disk, which shrinks it automatically',
      'Nothing, because persistent disks are billed only for the space the data uses'
    ],
    answer: 0,
    explanation: 'Persistent disks can grow but never shrink, and a disk created from a snapshot must be at least the size of the snapshot’s source. So you create a smaller disk, copy the files at file-system level and swap it in. Disks are billed for their provisioned size, not the space used.'
  },

  // ── Snapshots, images and schedules ──
  {
    id: 'ace-m2-042',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Snapshots of disks in Jakarta must stay in Indonesia for data residency, but by default they were stored in a multi-region location. What should you do?',
    options: [
      'Create the snapshots, or the snapshot schedule, with `--storage-location=asia-southeast2`',
      'Nothing, because snapshots always stay in the disk’s zone for residency reasons',
      'Encrypt the snapshots with a customer-managed key that was created in Jakarta',
      'Copy each snapshot to a Cloud Storage bucket in Jakarta after it is created'
    ],
    answer: 0,
    explanation: 'The storage location can be set per snapshot or in the snapshot schedule; by default Compute Engine picks the multi-region nearest the disk. A key’s location does not move data, and snapshots are not copied out to buckets.'
  },
  {
    id: 'ace-m2-043',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Monthly disk backups must be kept for seven years and are almost never restored. You want the lowest storage cost for these snapshots. What should you use?',
    options: ['Archive snapshots', 'Instant snapshots', 'Standard snapshots in a multi-region', 'Machine images'],
    answer: 0,
    explanation: 'Archive snapshots cost less to store than standard snapshots, in exchange for retrieval charges and a minimum retention, which suits long-term backups that are rarely restored. Instant snapshots are short-term, in-zone copies for quick rollback, and machine images capture whole VMs at standard cost.'
  },
  {
    id: 'ace-m2-044',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Just before a risky database schema change, you want a point-in-time copy of the disk that takes seconds and can be restored very quickly if the change fails. What should you take?',
    options: [
      'An instant snapshot of the disk',
      'An archive snapshot of the disk',
      'A machine image of the VM in another region',
      'A custom image from the running disk'
    ],
    answer: 0,
    explanation: 'Instant snapshots are captured in seconds next to the disk and restore quickly, which suits rollback before a change. They do not protect against a zone failure, so keep regular snapshots as backups. Archive snapshots and images are slower and meant for other purposes.'
  },
  {
    id: 'ace-m2-045',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'Snapshots of a Linux database server must be application-consistent without stopping the VM. What should you use?',
    options: [
      'Snapshots with guest flush enabled (`--guest-flush`), so the guest flushes writes first',
      'Snapshots taken right after the VM restarts, when nothing is held in memory',
      'Archive snapshots, which are always application-consistent by design',
      'Instant snapshots, because they never include data that is still in memory'
    ],
    answer: 0,
    explanation: 'Guest flush asks the guest environment to flush buffers, and to run any pre- and post-snapshot scripts you define (for example to freeze the database), before the snapshot is taken; on Windows it uses VSS. Other snapshots are crash-consistent unless you quiesce the application yourself.'
  },
  {
    id: 'ace-m2-046',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'A disk has daily snapshots, and you delete the one from last Tuesday. What happens to the later snapshots?',
    options: [
      'They still restore fully; data only in the deleted snapshot is moved to the next one',
      'They become unusable, because each snapshot depends on the one before it',
      'They are deleted as well, because a chain of snapshots is removed together',
      'They restore only the blocks that changed after last Tuesday’s snapshot'
    ],
    answer: 0,
    explanation: 'Snapshots are incremental, but when you delete one, Compute Engine moves any data still needed by later snapshots into the next one, so every remaining snapshot can still restore the full disk.'
  },
  {
    id: 'ace-m2-047',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Your templates use the image family web, which now resolves to web-v3. web-v3 has a bug, and new VMs should use web-v2 again until a fix is ready. What should you do?',
    options: [
      'Deprecate web-v3, so the family resolves to the newest non-deprecated image, web-v2',
      'Rename web-v3 to web-v2, so that the family picks it up under the older name',
      'Edit every instance template to name web-v2 and then delete the image family',
      'Delete the image family, so that new VMs fall back to the previous image'
    ],
    answer: 0,
    explanation: 'An image family always points to its newest image that is not deprecated, so deprecating web-v3 makes the family return web-v2 with no template changes; un-deprecate or add web-v4 when fixed. Images cannot be renamed, and templates referring to the family keep working.'
  },
  {
    id: 'ace-m2-048',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You need a custom image from the boot disk of a running VM, and the image must be consistent. What should you do?',
    options: [
      'Stop the VM, create the image from its boot disk, then start the VM again',
      'Create the image from the running disk; images are always consistent',
      'Take an instant snapshot and convert it while the VM keeps writing',
      'Export the VM in OVF format and import it again as an image'
    ],
    answer: 0,
    explanation: 'Creating an image from a disk that is still being written to risks an inconsistent file system, and gcloud refuses unless you pass `--force`. Stopping the VM (or imaging a snapshot taken with writes flushed) gives a clean image; an OVF round trip is a long detour.'
  },
  {
    id: 'ace-m2-049',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'Security requires that VMs anywhere in the organization boot only from images published in the approved projects sec-images and debian-cloud. What should you configure?',
    options: [
      'The organization policy `compute.trustedImageProjects` allowing only those projects',
      'Compute Image User on those two projects, granted to every developer group',
      'A VPC Service Controls perimeter around the two image projects',
      'A custom role that lacks permission to use images from other projects'
    ],
    answer: 0,
    explanation: '`compute.trustedImageProjects` restricts which projects’ images can be used to create disks and VMs. Granting Image User makes images usable but does not block others (public images need no grant), VPC Service Controls protects data access, and custom roles cannot single out image projects.'
  },
  {
    id: 'ace-m2-050',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'You want to list every snapshot taken from the disk db-1. Which command does that?',
    options: [
      '`gcloud compute snapshots list --filter="sourceDisk~db-1"`',
      '`gcloud compute disks describe db-1 --snapshots`',
      '`gcloud compute snapshots describe db-1`',
      '`gcloud compute resource-policies list --disk=db-1`'
    ],
    answer: 0,
    explanation: 'Snapshots record their source disk, so filtering the snapshot list on `sourceDisk` finds them. `disks describe` has no --snapshots flag, `snapshots describe` takes a snapshot name, and resource policies are the schedules themselves.'
  },

  // ── Instance templates, MIGs and autoscaling ──
  {
    id: 'ace-m2-051',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A regional MIG of GPU VMs often fails to create instances because one zone runs out of GPUs. You want the group to place VMs wherever capacity exists in its zones, without keeping them evenly spread. Which distribution shape should you use?',
    options: ['ANY', 'EVEN', 'BALANCED', 'ANY_SINGLE_ZONE'],
    answer: 0,
    explanation: 'With the ANY shape the MIG creates VMs wherever capacity is available in the selected zones, which suits scarce resources such as GPUs and Spot capacity. EVEN keeps the same number in each zone, BALANCED prefers an even spread but may deviate, and ANY_SINGLE_ZONE keeps every VM in one zone.'
  },
  {
    id: 'ace-m2-052',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'A web tier’s traffic follows the same daily curve, and new VMs take eight minutes to initialise, so CPU-based autoscaling always lags in the morning. What should you enable?',
    options: [
      'Predictive autoscaling on the MIG’s CPU-based autoscaler',
      'A shorter health check interval on the managed instance group',
      'Scale-in controls on the MIG’s CPU-based autoscaler',
      'Autohealing with a longer initial delay on the MIG'
    ],
    answer: 0,
    explanation: 'Predictive autoscaling forecasts load from history and adds VMs ahead of the rise, taking the initialization period into account. Health check timing and autohealing affect repairs, and scale-in controls limit how fast VMs are removed, not how early they are added.'
  },
  {
    id: 'ace-m2-053',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'After a short traffic dip the autoscaler removes many VMs at once, then has to add them back minutes later. You want it to remove at most 10% of the VMs in any 20 minutes. What should you configure?',
    options: [
      'Scale-in controls on the autoscaler',
      'A higher target CPU utilization',
      'Predictive autoscaling mode',
      'A longer initialization period'
    ],
    answer: 0,
    explanation: 'Scale-in controls cap how many VMs can be removed within a time window, which smooths out dips. A higher CPU target makes the group smaller overall, predictive mode adds capacity early, and the initialization period affects how new VMs are judged.'
  },
  {
    id: 'ace-m2-054',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'During a week-long launch you want a MIG to add VMs when load rises but never remove any until the launch is over. Which autoscaling mode should you set?',
    options: ['Only scale out', 'Off', 'On', 'Only scale in'],
    answer: 0,
    explanation: 'The only-scale-out mode lets the autoscaler grow the group but never shrink it. Off disables autoscaling, On both grows and shrinks, and there is no scale-in-only mode.'
  },
  {
    id: 'ace-m2-055',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A MIG autoscaler uses two signals: CPU utilization recommends 6 VMs, and load-balancing capacity recommends 9 VMs. How many VMs does the group run?',
    options: ['9, the largest recommendation', '6, the smallest recommendation', '8, the rounded average', '15, the sum of the two'],
    answer: 0,
    explanation: 'With several signals the autoscaler works out a size for each and uses the largest, so no signal is left under-provisioned (always within the group’s minimum and maximum).'
  },
  {
    id: 'ace-m2-056',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A rolling update of a MIG must keep each VM’s instance name, because other systems refer to the VMs by name. Which replacement method should the update use?',
    options: [
      'RECREATE, which deletes each VM and creates its replacement under the same name',
      'SUBSTITUTE, which creates new VMs with new names before removing the old ones',
      'REFRESH, which updates each VM’s metadata in place without replacing it',
      'A canary version, which keeps the old names for the first 10% of the group'
    ],
    answer: 0,
    explanation: 'The RECREATE replacement method reuses instance names (and is required for stateful MIGs that preserve names), at the cost of having no surge capacity. SUBSTITUTE, the default, creates VMs with new names. REFRESH is a minimal action rather than a replacement method, and a canary is a split between versions.'
  },
  {
    id: 'ace-m2-057',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You set a new instance template on a MIG but want existing VMs to switch to it only when they are recreated for other reasons, such as autohealing or scaling. Which update type should you use?',
    options: [
      'An opportunistic (selective) update',
      'A proactive update with max surge 3',
      'A rolling replace with max unavailable 0',
      'A canary update set to 50%'
    ],
    answer: 0,
    explanation: 'An opportunistic update applies the new template only when a VM is recreated for another reason, while a proactive update starts replacing VMs straight away. Rolling replace and canary updates actively replace VMs.'
  },
  {
    id: 'ace-m2-058',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Your instance template points to the image family web. A new image was just added to the family, and every VM in the MIG should be rebuilt from it without creating a new template. What should you run?',
    options: [
      '`gcloud compute instance-groups managed rolling-action replace web-mig`',
      '`gcloud compute instance-groups managed set-instance-template web-mig`',
      '`gcloud compute instance-groups managed resize web-mig --size=0`',
      '`gcloud compute images deprecate web --family-refresh`'
    ],
    answer: 0,
    explanation: '`rolling-action replace` recreates the VMs in a controlled, rolling way, and each new VM boots from the newest image in the family. Setting the same template changes nothing, resizing to zero causes an outage, and the deprecate flag does not exist.'
  },
  {
    id: 'ace-m2-059',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'A hand-configured VM works well, and you want an instance template with exactly the same machine type, disks and metadata. What is the quickest way?',
    options: [
      '`gcloud compute instance-templates create web-v1 --source-instance=web-1 --source-instance-zone=asia-southeast2-a`',
      '`gcloud compute instances export web-1 --as-template=web-v1 --zone=asia-southeast2-a --format=yaml`',
      '`gcloud compute machine-images create web-v1 --as-template --source-instance=web-1 --zone=asia-southeast2-a`',
      '`gcloud compute instance-templates copy web-1 --to=web-v1 --source-instance-zone=asia-southeast2-a`'
    ],
    answer: 0,
    explanation: '`instance-templates create --source-instance` copies an existing VM’s configuration into a template. The template does not carry the disk data — point it at an image, or build an image from the VM first. The other forms are not valid commands.'
  },
  {
    id: 'ace-m2-060',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Your MIG uses the same health check for the load balancer and for autohealing. During short slowdowns, autohealing recreates VMs that were healthy. What does Google recommend?',
    options: [
      'Use a separate, more tolerant health check for autohealing than for load balancing',
      'Turn off autohealing and rely only on the load balancer’s health check',
      'Shorten the health check interval so that slow VMs are spotted sooner',
      'Raise the MIG’s target size so that the recreated VMs matter less'
    ],
    answer: 0,
    explanation: 'Load balancing should stop sending traffic quickly, but autohealing should only recreate VMs that are really broken, so Google recommends separate health checks, with a more conservative threshold and an initial delay for autohealing. A faster check makes the problem worse.'
  },
  {
    id: 'ace-m2-061',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'One VM in a MIG behaves strangely. You want to keep it running for debugging while the group replaces it with a fresh VM. What should you do?',
    options: [
      'Abandon the instance from the MIG with `abandon-instances`',
      'Delete the instance with `delete-instances` and keep its disk',
      'Stop the instance, so the MIG ignores it until it is started',
      'Set the metadata debug=true so the autohealer skips the VM'
    ],
    answer: 0,
    explanation: '`gcloud compute instance-groups managed abandon-instances` removes the VM from the group without deleting it, and the MIG creates a replacement to keep its target size. Deleting removes the evidence, a MIG restarts stopped members, and there is no debug metadata for the autohealer.'
  },

  // ── GKE cluster types and kubectl ──
  {
    id: 'ace-m2-062',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'After `gcloud container clusters get-credentials`, kubectl fails with "executable gke-gcloud-auth-plugin not found". What should you do?',
    options: [
      'Install the plugin with `gcloud components install gke-gcloud-auth-plugin` and retry',
      'Downgrade kubectl to an older version that authenticates without any plugin',
      'Create a Kubernetes service account token and paste it into the kubeconfig file',
      'Enable the GKE add-on named authentication in the cluster’s settings'
    ],
    answer: 0,
    explanation: 'Current kubectl versions authenticate to GKE through the gke-gcloud-auth-plugin credential plugin, which must be installed (with `gcloud components install` or your package manager). Old kubectl versions are unsupported, long-lived tokens are bad practice, and there is no such add-on.'
  },
  {
    id: 'ace-m2-063',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'You manage two clusters, dev and prod, and kubeconfig has a context for each. How do you make kubectl talk to prod?',
    options: [
      '`kubectl config use-context gke_ace-lab-123_asia-southeast2_prod`',
      '`gcloud config set container/cluster prod`, then run kubectl',
      '`kubectl cluster switch gke_ace-lab-123_asia-southeast2_prod`',
      '`gcloud container clusters activate prod --region=asia-southeast2`'
    ],
    answer: 0,
    explanation: 'kubectl uses the current context in kubeconfig, which `kubectl config use-context` changes (`kubectl config get-contexts` lists them). The gcloud property sets a default for gcloud commands, not kubectl, and the other commands do not exist.'
  },
  {
    id: 'ace-m2-064',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'hard',
    prompt: 'Engineers need kubectl access to a cluster’s control plane from anywhere, controlled by IAM, without a bastion host or authorized network lists. What should you enable?',
    options: [
      'The DNS-based control plane endpoint, with `--enable-dns-access`',
      'A public endpoint with authorized networks set to 0.0.0.0/0',
      'Private nodes plus a bastion VM in each engineer’s region',
      'Cloud NAT for the cluster’s subnet and its control plane'
    ],
    answer: 0,
    explanation: 'The DNS-based endpoint gives the control plane a name served through Google Cloud’s API front end; requests are checked against IAM before Kubernetes RBAC, so no network allow-lists or bastions are needed. Opening authorized networks to everyone removes protection, and Cloud NAT is for outbound traffic.'
  },
  {
    id: 'ace-m2-065',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'hard',
    prompt: 'A cluster was created with private nodes and `--enable-private-endpoint`, so its control plane has only an internal IP. kubectl from Cloud Shell times out. What is a supported fix?',
    options: [
      'Run kubectl from a VM in the cluster’s VPC, or enable the DNS-based endpoint',
      'Add Cloud Shell’s public IP address to the cluster’s authorized networks',
      'Give every node an external IP address so that kubectl reaches the cluster',
      'Recreate the cluster in Autopilot mode, which ignores private endpoints'
    ],
    answer: 0,
    explanation: 'With only an internal endpoint, kubectl must run from somewhere with a route to it — a VM in the VPC, or on-premises over VPN — or you add the DNS-based endpoint. Authorized networks cannot open an endpoint that has no external IP, the nodes’ IPs do not matter, and Autopilot clusters can be private too.'
  },
  {
    id: 'ace-m2-066',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'Which of these is not possible on a GKE Autopilot cluster?',
    options: [
      'SSH into a node to install an agent by hand',
      'Run Pods that request GPUs',
      'Use Workload Identity Federation for GKE',
      'Scale Pods with a Horizontal Pod Autoscaler'
    ],
    answer: 0,
    explanation: 'Autopilot manages and locks down the nodes — no SSH and no node-level changes — while supporting GPUs, Workload Identity Federation for GKE (always on) and the HPA. Node agents run as DaemonSets within Autopilot’s rules.'
  },
  {
    id: 'ace-m2-067',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'You create a regional GKE Standard cluster in asia-southeast2 with `--num-nodes=2`. How many nodes does the default node pool get?',
    options: [
      '6, two in each of the region’s three zones',
      '2, spread across two zones of the region',
      '2, both in the region’s first zone',
      '3, one in each zone plus a spare'
    ],
    answer: 0,
    explanation: 'For regional and multi-zonal clusters, `--num-nodes` counts per zone, so three zones give six nodes. Use `--node-locations` to choose fewer zones if you want fewer nodes.'
  },
  {
    id: 'ace-m2-068',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'To save cost, a regional cluster’s nodes should run in only two of the region’s three zones, while the control plane stays regional. What should you set?',
    options: [
      '`--node-locations` with the two zones',
      '`--zone` instead of `--region`',
      '`--num-nodes=2` on the node pool',
      '`--location-policy=ANY` on the pool'
    ],
    answer: 0,
    explanation: '`--node-locations` chooses which zones the nodes run in, independently of the regional control plane. `--zone` would make the whole cluster zonal, `--num-nodes` is per zone, and the location policy affects how the autoscaler picks zones, not which zones are used.'
  },
  {
    id: 'ace-m2-069',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'You need an interactive shell inside the running container of Pod web-7d4b9-abcde to check a configuration file. Which command should you use?',
    options: [
      '`kubectl exec -it web-7d4b9-abcde -- /bin/sh`',
      '`kubectl attach web-7d4b9-abcde --shell`',
      '`kubectl run web-7d4b9-abcde --interactive`',
      '`kubectl logs web-7d4b9-abcde --shell`'
    ],
    answer: 0,
    explanation: '`kubectl exec -it POD -- COMMAND` runs a command, here a shell, inside the container. `attach` connects to the main process’s input and output, `run` creates a new Pod, and `logs` only shows output.'
  },

  // ── Workloads, Services, StatefulSets and Artifact Registry ──
  {
    id: 'ace-m2-070',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'New Pods of a Deployment receive traffic while the application is still loading its cache, and users see errors after every rollout. What should you add to the container spec?',
    options: [
      'A readiness probe that passes only once the cache is loaded',
      'A liveness probe that restarts the container when it is slow',
      'A larger CPU limit so that the cache loads more quickly',
      'A preStop hook that waits before the Pod is deleted'
    ],
    answer: 0,
    explanation: 'A Pod joins a Service’s endpoints only when its readiness probe succeeds, so a readiness check keeps traffic away until the app is ready. A liveness probe restarts containers (and can make slow starts worse), and CPU limits or preStop hooks do not gate traffic to new Pods.'
  },
  {
    id: 'ace-m2-071',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'An application needs non-secret settings, such as feature flags and a log level, that change between environments without rebuilding the image. What should you use?',
    options: [
      'A ConfigMap, mounted as files or exposed as environment variables',
      'A Secret, because every setting should be encrypted in the same way',
      'A new container image tag for each environment and each change',
      'Annotations on the Deployment, read by the app when it starts'
    ],
    answer: 0,
    explanation: 'ConfigMaps hold non-confidential configuration apart from the image and can be consumed as environment variables or files. Secrets are for confidential data, rebuilding images for configuration is wasteful, and annotations are metadata rather than app configuration.'
  },
  {
    id: 'ace-m2-072',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'Pods of the orders Deployment must call the payments Pods in the same namespace by a stable name that survives Pod restarts. What should you create?',
    options: [
      'A ClusterIP Service named payments, reached as payments or payments.NAMESPACE.svc.cluster.local',
      'A NodePort Service named payments, reached on each node’s IP address at its node port',
      'A Service of type LoadBalancer, reached at its external IP address from inside the cluster',
      'A headless Service, because only headless Services get DNS names inside the cluster'
    ],
    answer: 0,
    explanation: 'A ClusterIP Service gives the Pods behind it one stable virtual IP and a DNS name inside the cluster. NodePort and LoadBalancer also expose the Service outside the cluster, which is unnecessary here, and ordinary Services get DNS names too — headless ones return Pod IPs instead.'
  },
  {
    id: 'ace-m2-073',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'You want L7 routing for several GKE services, with the platform team owning the load balancer and app teams owning their own routes. Which Kubernetes API fits best?',
    options: [
      'The Gateway API: a Gateway owned by the platform team, HTTPRoutes owned by app teams',
      'A single Ingress resource that every team edits in the same shared namespace',
      'One Service of type LoadBalancer per team, each with its own external IP',
      'NodePort Services with a VM running nginx in front of the cluster’s nodes'
    ],
    answer: 0,
    explanation: 'The Gateway API separates roles: a Gateway, backed by a Google Cloud load balancer through a GatewayClass, is run by the platform team, and teams attach HTTPRoutes from their own namespaces. A shared Ingress mixes ownership, LoadBalancer Services are layer 4, and a self-run nginx adds work.'
  },
  {
    id: 'ace-m2-074',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'hard',
    prompt: 'You scale a StatefulSet named db from 3 replicas down to 2. What happens by default to the PersistentVolumeClaim of db-2?',
    options: [
      'It is kept, so db-2 gets the same volume back if you scale up again',
      'It is deleted together with the Pod to free the disk immediately',
      'It is moved to db-1, which then has two volumes attached',
      'It is turned into a snapshot and the disk is deleted'
    ],
    answer: 0,
    explanation: 'By default StatefulSets keep the PVCs of removed replicas, so data survives a scale-down and is reattached when that ordinal returns; delete them yourself (or set a PVC retention policy) when no longer needed. Volumes are not moved or snapshotted automatically.'
  },
  {
    id: 'ace-m2-075',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'Your clusters pull public images from Docker Hub and keep hitting its rate limits. You want those images cached inside Google Cloud, with no change to how they are published upstream. What should you set up?',
    options: [
      'An Artifact Registry remote repository that proxies Docker Hub',
      'A Cloud Storage bucket that mirrors Docker Hub every night',
      'A standard Artifact Registry repository with a cleanup policy',
      'A Cloud NAT gateway with more IP addresses for the clusters'
    ],
    answer: 0,
    explanation: 'A remote repository acts as a caching proxy for an upstream such as Docker Hub: the first pull fetches the image and later pulls are served from Artifact Registry. Buckets are not registries, cleanup policies delete images, and more NAT addresses only spread the rate limit.'
  },
  {
    id: 'ace-m2-076',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'A Docker repository in Artifact Registry is filling up with thousands of old untagged images. You want untagged images older than 30 days removed automatically. What should you configure?',
    options: [
      'A cleanup policy on the repository',
      'Object Lifecycle Management on the repository',
      'A snapshot schedule for the registry',
      'An organization policy on image age'
    ],
    answer: 0,
    explanation: 'Artifact Registry cleanup policies delete (or keep) versions by conditions such as tag state and age. Lifecycle rules belong to Cloud Storage buckets, snapshot schedules to disks, and no organization policy controls image age.'
  },
  {
    id: 'ace-m2-077',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'Security wants every image pushed to Artifact Registry checked for known vulnerabilities, with the results shown next to the image. What should you do?',
    options: [
      'Enable the Container Scanning API so that Artifact Analysis scans images on push',
      'Run a weekly Cloud Build job that downloads every image and searches it for CVEs',
      'Turn on Data Access audit logs for Artifact Registry to record image contents',
      'Enable Binary Authorization, which scans each image as soon as it is pushed'
    ],
    answer: 0,
    explanation: 'With the Container Scanning API enabled, Artifact Analysis scans images automatically when they are pushed and keeps checking them for new vulnerabilities, showing findings in Artifact Registry. Audit logs record API calls, and Binary Authorization enforces deploy-time policies (it can use scan results) rather than scanning.'
  },

  // ── Node pools, HPA/VPA and Autopilot resource requests ──
  {
    id: 'ace-m2-078',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'A batch-heavy GKE Standard cluster leaves nodes underused for a long time before the cluster autoscaler removes them. You want more aggressive scale-down to cut cost. What should you change?',
    options: [
      'Set the cluster autoscaler profile to optimize-utilization',
      'Raise the maximum node count of every node pool',
      'Add a PodDisruptionBudget to every Deployment',
      'Move the cluster from the Regular to the Rapid channel'
    ],
    answer: 0,
    explanation: 'The optimize-utilization profile makes the cluster autoscaler remove underused nodes sooner and pack Pods more tightly (the default profile is balanced). A higher maximum allows more nodes, PodDisruptionBudgets can block scale-down, and release channels govern versions.'
  },
  {
    id: 'ace-m2-079',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'hard',
    prompt: 'A node pool upgrade must be rolled back within minutes if workloads misbehave on the new version. Which node upgrade strategy fits best?',
    options: [
      'A blue-green upgrade, keeping the old nodes until the new pool is validated',
      'A surge upgrade with max surge 1 and max unavailable 0',
      'A surge upgrade with max unavailable 3 so that it finishes faster',
      'A manual upgrade of each node with kubectl drain and SSH'
    ],
    answer: 0,
    explanation: 'Blue-green node pool upgrades create the new nodes, move workloads over in batches with a soak time, and keep the old nodes until you complete the upgrade, so rolling back is quick. Surge upgrades replace nodes as they go, so going back means another upgrade, and GKE nodes are not upgraded by hand.'
  },
  {
    id: 'ace-m2-080',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'Some Pods need machine shapes or GPUs that no existing node pool offers, and they stay Pending. You want GKE Standard to create suitable node pools automatically. What should you enable?',
    options: [
      'Node auto-provisioning on the cluster',
      'Vertical Pod Autoscaling on the workloads',
      'A higher maximum on the existing node pool',
      'Surge upgrades on every node pool'
    ],
    answer: 0,
    explanation: 'Node auto-provisioning lets the cluster autoscaler create (and later delete) node pools that match pending Pods’ requirements, within limits you set. VPA changes requests, a higher maximum only adds nodes of the existing shape, and surge settings concern upgrades.'
  },
  {
    id: 'ace-m2-081',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'During node upgrades, all three replicas of a service were evicted at the same time and the service went down. How do you keep at least two replicas running during voluntary disruptions?',
    options: [
      'Create a PodDisruptionBudget with minAvailable: 2 for the service’s Pods',
      'Set the Deployment’s replicas to 2 so that fewer Pods are evicted',
      'Add a liveness probe so that evicted Pods restart more quickly',
      'Turn off node auto-upgrade for the node pool permanently'
    ],
    answer: 0,
    explanation: 'A PodDisruptionBudget limits how many Pods of a set can be evicted at once by voluntary disruptions such as upgrades and drains. Fewer replicas makes it worse, probes do not prevent eviction, and turning off upgrades leaves nodes unpatched.'
  },
  {
    id: 'ace-m2-082',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'hard',
    prompt: 'Worker Pods pull messages from a Pub/Sub subscription. You want their number to follow the subscription’s backlog rather than CPU. What should you configure?',
    options: [
      'An HPA on an external metric for the subscription’s undelivered messages, read from Cloud Monitoring',
      'An HPA on CPU utilization with a very low target, so that it reacts to the backlog earlier',
      'A Vertical Pod Autoscaler that raises the workers’ CPU requests as the backlog grows',
      'A cluster autoscaler profile that adds nodes whenever messages are waiting in the topic'
    ],
    answer: 0,
    explanation: 'The Horizontal Pod Autoscaler can scale on external metrics such as `pubsub.googleapis.com/subscription/num_undelivered_messages` from Cloud Monitoring, through the metrics adapter. CPU does not reflect a queue, VPA changes Pod size rather than count, and the cluster autoscaler only adds nodes for Pods that cannot be scheduled.'
  },
  {
    id: 'ace-m2-083',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'An Autopilot workload needs a specific machine series for consistent CPU performance, rather than whatever Autopilot picks by default. What should the Pod request?',
    options: [
      'The Performance compute class with the machine family it needs',
      'A node pool of that machine series, created with gcloud',
      'An SSH session to its node to change the machine type',
      'A CPU limit larger than its request, to reach faster machines'
    ],
    answer: 0,
    explanation: 'Autopilot compute classes choose the hardware: the Performance class with a machine family selector runs Pods on that series (billed by node), and the Accelerator class provides GPUs. You do not create node pools or touch nodes in Autopilot, and a larger limit does not change the hardware.'
  },

  // ── Cloud Run and Cloud Run functions ──
  {
    id: 'ace-m2-084',
    section: 'operating',
    topic: 'Serverless operations',
    difficulty: 'easy',
    prompt: 'Cloud Run revision names such as shop-00017-xyz are hard to read in reports. You want the next revision to be called shop-v2. What should you add to the deploy?',
    options: ['`--revision-suffix=v2`', '`--tag=v2`', '`--revision-name=shop-v2`', '`--labels=revision=v2`'],
    answer: 0,
    explanation: '`--revision-suffix` names the new revision SERVICE-SUFFIX, here shop-v2. A tag gives a revision its own URL but does not rename it, `--revision-name` is not a flag, and labels are metadata.'
  },
  {
    id: 'ace-m2-085',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A Java service on Cloud Run starts slowly because the JVM is CPU-hungry during start-up. You want faster cold starts without paying for idle instances. What should you enable?',
    options: [
      'Startup CPU boost on the service',
      'A higher maximum number of instances',
      'A concurrency of 1 request per instance',
      'Session affinity on the service'
    ],
    answer: 0,
    explanation: 'Startup CPU boost gives instances extra CPU while they start, shortening cold starts at little cost. More instances or a lower concurrency mean more cold starts, and session affinity sends a client to the same instance. Minimum instances would remove cold starts but bill idle time.'
  },
  {
    id: 'ace-m2-086',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A data-processing step takes about two hours per run, is triggered once a night and serves no web traffic. Deployed as a Cloud Run service, it keeps failing at the request timeout. What should you do?',
    options: [
      'Run the step as a Cloud Run job, whose tasks are not bound by request timeouts',
      'Raise the service’s request timeout to 120 minutes in the console',
      'Split the work into many HTTP requests sent to the service in parallel',
      'Switch the service to instance-based billing so that requests never time out'
    ],
    answer: 0,
    explanation: 'Services answer requests and allow at most 60 minutes per request; jobs run containers to completion with their own, much longer task timeouts, retries and parallelism. Splitting into many requests adds orchestration, and the billing mode does not change timeouts.'
  },
  {
    id: 'ace-m2-087',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A Cloud Run service must send its traces through an OpenTelemetry collector running next to the app in the same instance and reached on localhost. How can you deploy this?',
    options: [
      'Deploy the collector as a sidecar container in the same Cloud Run service',
      'Run the collector as a separate Cloud Run service called over the internet',
      'Install the collector on the Cloud Run host with a startup script',
      'Use a DaemonSet, because Cloud Run runs only one container per instance'
    ],
    answer: 0,
    explanation: 'Cloud Run supports several containers per instance: one ingress container plus sidecars that share the network namespace (localhost) and can share in-memory volumes. Cloud Run has no hosts you can script, and DaemonSets are a Kubernetes concept.'
  },
  {
    id: 'ace-m2-088',
    section: 'operating',
    topic: 'Serverless operations',
    difficulty: 'hard',
    prompt: 'A partner allow-lists a single IP address. Calls from your Cloud Run service to the partner must always come from that address. What should you configure?',
    options: [
      'Direct VPC egress for all traffic, plus Cloud NAT with a reserved static external IP',
      'A reserved static external IP address attached directly to the Cloud Run service',
      'Ingress set to internal, so that the responses come from the VPC’s address',
      'A global external Application Load Balancer placed in front of the service'
    ],
    answer: 0,
    explanation: 'Cloud Run egress normally uses shared Google addresses. Routing all egress into your VPC (Direct VPC egress or a connector) and through Cloud NAT with a manually assigned static IP gives a fixed source address. Cloud Run services cannot hold external IPs, and ingress settings and load balancers only affect incoming traffic.'
  },
  {
    id: 'ace-m2-089',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A Cloud Run function handles many short HTTP requests, and each instance spends most of its time waiting on network calls. You want fewer instances and fewer cold starts. What should you change?',
    options: [
      'Raise the function’s concurrency so that each instance handles several requests at once',
      'Lower the function’s memory so that more instances fit on each underlying host',
      'Set the maximum instances to 1 so that every request reuses the same instance',
      'Move the function to the 1st generation, which handles more requests per instance'
    ],
    answer: 0,
    explanation: 'Cloud Run functions run on Cloud Run and support a concurrency above 1, so an I/O-bound function can serve many requests per instance. 1st-generation functions handle one request per instance, memory does not change concurrency, and a single instance would queue or reject traffic.'
  },
  {
    id: 'ace-m2-090',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'You deploy a Python function from source with `gcloud functions deploy`. The code defines `handle_upload`, but the deploy fails because no function with the deployed name was found. Which flag fixes this?',
    options: ['`--entry-point=handle_upload`', '`--runtime=handle_upload`', '`--source=handle_upload`', '`--trigger-http=handle_upload`'],
    answer: 0,
    explanation: '`--entry-point` names the function in your code that receives requests or events; by default it is the deployed function’s name. `--runtime` picks the language version, `--source` the code location, and `--trigger-http` takes no value.'
  },
  {
    id: 'ace-m2-091',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'Unless told otherwise, a new Cloud Run service runs as the Compute Engine default service account, which often has broad roles. What does Google recommend?',
    options: [
      'Deploy with `--service-account` set to a dedicated account holding only the roles it needs',
      'Keep the default account and remove its roles so the service cannot call any API',
      'Give the service an API key in an environment variable instead of an identity',
      'Run the service with your own user account so that its access matches yours'
    ],
    answer: 0,
    explanation: 'Each service should run as its own user-managed service account with least privilege, set at deploy time with `--service-account`. Stripping the shared default account affects every other workload that uses it, API keys do not replace identities, and services cannot run as users.'
  },

  // ── Event processing ──
  {
    id: 'ace-m2-092',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'hard',
    prompt: 'You create an Eventarc trigger in asia-southeast2 for object-finalized events of a bucket located in asia-southeast1, and trigger creation fails. Why?',
    options: [
      'A Cloud Storage trigger must be created in the same location as its bucket',
      'Eventarc only supports buckets in multi-region locations such as ASIA',
      'The bucket must have Object Versioning turned on before triggers work',
      'Eventarc triggers can only send events to Cloud Run functions'
    ],
    answer: 0,
    explanation: 'Direct Cloud Storage triggers must live in the bucket’s location — its region, dual-region or multi-region — although the destination service can be elsewhere. Versioning is not required, any bucket location works, and triggers can target Cloud Run services, functions, Workflows or GKE.'
  },
  {
    id: 'ace-m2-093',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'hard',
    prompt: 'You want code to run whenever an object is read from a sensitive bucket, using an Eventarc trigger on Cloud Audit Logs for storage.objects.get. The trigger never fires. What is the most likely cause?',
    options: [
      'Data Access audit logs (DATA_READ) are not enabled for Cloud Storage',
      'Eventarc only supports Cloud Storage and Pub/Sub as direct sources',
      'The trigger must be created in us-central1 for audit log events',
      'Audit log triggers only fire for deletions, never for reads'
    ],
    answer: 0,
    explanation: 'Audit-log triggers fire on audit log entries, so the log type must actually be written: Admin Activity logs always are, but Data Access logs such as object reads must be enabled for the service. Eventarc supports many sources, any supported location works, and reads are fine once logged.'
  },
  {
    id: 'ace-m2-094',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A Pub/Sub topic carries orders from every country, but one subscriber only needs orders whose country attribute is ID. You want Pub/Sub to deliver only those messages to it. What should you configure?',
    options: [
      'A filter on that subscriber’s subscription, such as attributes.country = "ID"',
      'A separate topic per country, with publishers choosing the right topic',
      'Ordering keys on the topic based on the country attribute',
      'A dead-letter topic that receives the other countries’ messages'
    ],
    answer: 0,
    explanation: 'Subscription filters select messages by attribute; messages that do not match are acknowledged automatically and never delivered. Separate topics push the work onto publishers, ordering keys control order, and dead-letter topics catch messages that fail.'
  },
  {
    id: 'ace-m2-095',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'All messages on a topic must be archived as files in a Cloud Storage bucket for auditors, without writing or running any code. What should you create?',
    options: [
      'A Cloud Storage subscription on the topic that writes to the bucket',
      'A push subscription that posts each message to the bucket’s URL',
      'A pull subscription read by a cron script running on a VM',
      'A BigQuery subscription with a table export to the bucket'
    ],
    answer: 0,
    explanation: 'Cloud Storage subscriptions batch messages into files in a bucket directly. Buckets do not accept push deliveries, a VM script is code to run, and going through BigQuery adds a second step.'
  },
  {
    id: 'ace-m2-096',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'hard',
    prompt: 'A bucket has Object Versioning enabled and Pub/Sub notifications for all event types. A user uploads a new version of an existing object. Which notifications are published?',
    options: [
      'OBJECT_ARCHIVE for the old live version and OBJECT_FINALIZE for the new one',
      'Only OBJECT_FINALIZE, because overwrites are not reported on their own',
      'OBJECT_DELETE for the old version and OBJECT_FINALIZE for the new one',
      'Only OBJECT_METADATA_UPDATE, because the object’s name stays the same'
    ],
    answer: 0,
    explanation: 'With versioning on, an overwrite makes the previous live version noncurrent, which is reported as OBJECT_ARCHIVE, while the new version produces OBJECT_FINALIZE. Without versioning the old version is removed and OBJECT_DELETE is sent instead.'
  },

  // ── GPUs, TPUs, Agent Runtime and Cloud Workstations ──
  {
    id: 'ace-m2-097',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A small team serves an open model for inference. Traffic is bursty with long idle periods, and they want GPUs without managing VMs or clusters, scaling to zero when idle. What fits?',
    options: [
      'Cloud Run with an NVIDIA L4 GPU attached to the service',
      'A Compute Engine VM with an L4 GPU running all the time',
      'A GKE Standard GPU node pool with a minimum of two nodes',
      'Cloud TPU VMs reserved for the whole of the month'
    ],
    answer: 0,
    explanation: 'Cloud Run supports GPUs such as the NVIDIA L4 on services, starting instances on demand and scaling to zero, with no infrastructure to manage. A permanent VM, a GPU node pool with a minimum size or reserved TPUs all bill while idle.'
  },
  {
    id: 'ace-m2-098',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'Researchers will train a large JAX model across many TPU chips, and the platform team already runs everything on GKE. What should they use?',
    options: [
      'A GKE node pool with a TPU slice, with the training job scheduled onto it',
      'A Compute Engine MIG of A3 GPU VMs managed outside the cluster',
      'Cloud Run jobs with a TPU attached to each of their tasks',
      'Cloud Workstations with TPUs attached for each researcher'
    ],
    answer: 0,
    explanation: 'GKE supports TPU slice node pools, so training jobs are scheduled like any other workload with Kubernetes tooling. A GPU MIG ignores both the TPU choice and the team’s platform, and Cloud Run and Cloud Workstations do not provide TPU slices.'
  },
  {
    id: 'ace-m2-099',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'hard',
    prompt: 'Several small inference Pods each use only a fraction of an NVIDIA A100 GPU, yet each one reserves a whole GPU. How can they share GPUs on GKE?',
    options: [
      'Use multi-instance GPU partitions or GPU time-sharing on the node pool',
      'Request half a GPU in each Pod with `nvidia.com/gpu: 0.5`',
      'Run all the models in one Pod with a single container',
      'Move to CPU-only nodes and give each Pod more vCPUs'
    ],
    answer: 0,
    explanation: 'GKE can split an A100 or H100 into isolated multi-instance GPU partitions, or let containers time-share a GPU, so several Pods use one physical GPU. Kubernetes GPU requests must be whole numbers, one container loses isolation, and CPUs are far slower for this work.'
  },
  {
    id: 'ace-m2-100',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'Developers often leave their Cloud Workstations running overnight. You want them to stop automatically when nobody is using them. What should you set?',
    options: [
      'An idle timeout in the workstation configuration',
      'A snapshot schedule on each workstation’s disk',
      'A budget alert on the Cloud Workstations SKU',
      'A smaller machine type in the workstation cluster'
    ],
    answer: 0,
    explanation: 'Workstation configurations set an idle timeout (and a maximum running time), after which workstations stop while the persistent home disk keeps the developer’s files. Snapshots, budgets and smaller machines do not stop idle workstations.'
  }
];
