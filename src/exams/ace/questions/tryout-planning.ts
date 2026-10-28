/**
 * Tryout questions, Planning and implementing a cloud solution — the 33 that
 * join the 17 in tryout.ts to make 50: choosing compute, building Compute
 * Engine VMs, block and file storage, GKE clusters and workloads, Cloud Run
 * and functions. Course modules MD2-S3, S4, S6 and S7.
 */
import type { Question } from '@/types';

export const tryoutPlanning: Question[] = [
  {
    id: 'ace-t132',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'A payment provider sends a webhook a few hundred times a day. You need about 40 lines of Python to validate each call and write it to Firestore, with no servers to manage. Which option is the simplest?',
    options: ['Cloud Run functions with an HTTP trigger', 'A Compute Engine VM running Flask', 'A GKE Autopilot Deployment', 'A Cloud Run job run every minute'],
    answer: 0,
    explanation: 'A small piece of code answering HTTP calls is the textbook function: deploy the source and get a URL, with scale to zero. A VM or a cluster is far more to run, and a job is for batch work, not for answering requests.'
  },
  {
    id: 'ace-t133',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'Your team already runs 25 microservices with Kubernetes manifests and Helm charts on-premises, and uses Kubernetes features such as custom controllers. They want to move to Google Cloud with as few changes as possible. Which service should they use?',
    options: ['Google Kubernetes Engine', 'Cloud Run', 'Compute Engine with Docker', 'App Engine flexible environment'],
    answer: 0,
    explanation: 'GKE runs standard Kubernetes, so manifests, Helm charts and custom controllers keep working. Cloud Run runs containers but not Kubernetes objects; plain VMs or App Engine would mean rebuilding the deployment model.'
  },
  {
    id: 'ace-t134',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A containerised data export runs for about two hours every night, processes a file, and exits. It does not serve HTTP requests. You want no servers to manage and to pay only while it runs. What should you use?',
    options: ['A Cloud Run job triggered by Cloud Scheduler', 'A Cloud Run service with min instances set to 1', 'A Compute Engine VM that runs all day', 'An App Engine standard service with cron'],
    answer: 0,
    explanation: 'Cloud Run jobs run containers to completion without listening for requests, and Cloud Scheduler can start them on a schedule. A service is built for requests and min instances would bill all day; an always-on VM wastes money.'
  },
  {
    id: 'ace-t135',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'Your team built a customer-support AI agent with the Agent Development Kit. You want Google Cloud to host it, scale it and keep its conversation sessions, without managing servers or containers yourself. What should you use?',
    options: ['Agent Runtime on Gemini Enterprise Agent Platform', 'A Compute Engine VM with a GPU', 'A GKE Standard cluster with a GPU node pool', 'Cloud Workstations'],
    answer: 0,
    explanation: 'Agent Runtime (formerly Vertex AI Agent Engine) is the managed runtime for agents built with ADK or frameworks such as LangChain: it hosts, scales and keeps sessions and memory. VMs and clusters must be run by you; Cloud Workstations are developer environments.'
  },
  {
    id: 'ace-t136',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'You are moving SAP HANA with a 3 TB in-memory database to Compute Engine. Which machine family is designed for this?',
    options: ['Memory-optimised (M-series)', 'General-purpose (E2)', 'Compute-optimised (C2)', 'Accelerator-optimised (A3)'],
    answer: 0,
    explanation: 'M-series machines offer the most memory per vCPU, up to many terabytes, and are certified for SAP HANA. E2 is cost-optimised general purpose, C2 favours CPU speed, and A3 is for GPU work.'
  },
  {
    id: 'ace-t137',
    topic: 'Choosing compute',
    difficulty: 'easy',
    prompt: 'You need a small always-on VM for a personal test website with very little traffic, at the lowest possible cost. Which machine type fits best?',
    options: ['e2-micro or e2-small', 'n2-standard-8', 'c3-highcpu-4', 'm3-ultramem-32'],
    answer: 0,
    explanation: 'E2 shared-core types (e2-micro, e2-small) are the cheapest for light workloads; e2-micro is also in the free tier in some US regions. The others are far larger or specialised.'
  },
  {
    id: 'ace-t138',
    topic: 'Choosing compute',
    difficulty: 'hard',
    prompt: 'Your existing software licence only allows the software to run on physical servers dedicated to your company. You want to run it on Compute Engine. What should you use?',
    options: ['Sole-tenant nodes', 'Shielded VMs', 'Confidential VMs', 'Spot VMs'],
    answer: 0,
    explanation: 'Sole-tenant nodes are physical servers dedicated to your project, used for bring-your-own-licence terms and isolation requirements. Shielded and Confidential VMs add security features but still share hosts; Spot VMs are about price.'
  },
  {
    id: 'ace-t139',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'You will serve an image-recognition model written for CUDA. Traffic is moderate and you want a cost-effective GPU for inference. Which choice fits best?',
    options: ['G2 VMs with NVIDIA L4 GPUs', 'A3 VMs with NVIDIA H100 GPUs', 'Cloud TPU v5p slices', 'C3 VMs without accelerators'],
    answer: 0,
    explanation: 'L4 GPUs on G2 machines are aimed at cost-effective inference and video. H100 on A3 is for large-scale training and costs far more; TPUs do not run CUDA code; CPUs alone are slow for this.'
  },
  {
    id: 'ace-t140',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'Every new VM must install and start nginx automatically when it boots, without anyone logging in. What should you use?',
    options: ['A startup script in the VM’s metadata', 'A shutdown script in the VM’s metadata', 'A snapshot schedule on the boot disk', 'An OS Login policy on the project'],
    answer: 0,
    explanation: 'A `startup-script` (or `startup-script-url`) in metadata runs at every boot. Shutdown scripts run when the VM stops; snapshot schedules back up disks; OS Login controls SSH access.'
  },
  {
    id: 'ace-t141',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'Security requires VMs to be protected against boot-level malware such as rootkits, and to alert if the boot sequence changes. What should you use?',
    options: [
      'Shielded VMs with Secure Boot, vTPM and integrity monitoring',
      'Spot VMs that are recreated from a clean image every day',
      'Sole-tenant nodes so that no other customer shares the host',
      'OS Login with 2-step verification for every SSH user'
    ],
    answer: 0,
    explanation: 'Shielded VM verifies the boot chain (Secure Boot, measured boot with vTPM) and reports changes through integrity monitoring. The other options address cost, isolation or SSH access, not boot integrity.'
  },
  {
    id: 'ace-t142',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'A partner allow-lists your VM’s external IP address. After a stop and start, the VM got a different IP and the partner blocked it. How do you prevent this?',
    options: [
      'Reserve a static external IP address and assign it to the VM.',
      'Give the VM an internal IP address in a larger subnet range.',
      'Never stop the VM; restart it from inside the operating system.',
      'Enable automatic restart in the VM’s availability policy.'
    ],
    answer: 0,
    explanation: 'Ephemeral external IPs can change when a VM stops. A reserved static address stays with the VM (an existing ephemeral IP can also be promoted to static). Internal IPs are not reachable by the partner, and avoiding stops is not a fix.'
  },
  {
    id: 'ace-t143',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A Spot VM processes long-running jobs. When it is preempted, you want its disks kept so the job can resume from a checkpoint when the VM is started again. How should you create it?',
    options: [
      'With --provisioning-model=SPOT and --instance-termination-action=STOP',
      'With --provisioning-model=SPOT and --instance-termination-action=DELETE',
      'With --preemptible so that it is automatically restarted within 24 hours',
      'With --maintenance-policy=MIGRATE so that it moves instead of stopping'
    ],
    answer: 0,
    explanation: 'A termination action of STOP stops the Spot VM on preemption and keeps its disks (you still pay for them); DELETE removes the VM and its auto-delete disks. Preemptible VMs are the older model and are not restarted automatically; Spot VMs cannot live-migrate.'
  },
  {
    id: 'ace-t144',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'Your batch workers run on Spot VMs. When a VM is preempted, the worker should upload its partial results before it disappears. What should you use?',
    options: ['A shutdown script', 'A startup script', 'An autohealing health check', 'A snapshot schedule'],
    answer: 0,
    explanation: 'Compute Engine sends a preemption notice and runs the shutdown script on a best-effort basis (Spot VMs get about 30 seconds), which is the place to save work. Startup scripts run at boot; autohealing and snapshot schedules do not react to preemption.'
  },
  {
    id: 'ace-t145',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'The security team publishes a hardened image in the project `sec-images`. You want to create a VM in your own project from the newest image of its family `hardened-debian`. Which flags should you use?',
    options: [
      '`--image-family=hardened-debian --image-project=sec-images`',
      '`--image=hardened-debian --project=sec-images`',
      '`--source-snapshot=hardened-debian --image-project=sec-images`',
      '`--image-family=hardened-debian` and nothing else'
    ],
    answer: 0,
    explanation: '`--image-project` points to the project that owns the image, and `--image-family` picks its newest non-deprecated image. `--project` would create the VM in the security project; snapshots are not images; without --image-project gcloud looks in your own project. You also need Compute Image User there.'
  },
  {
    id: 'ace-t146',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'A VM runs the company’s license server. You want to make sure nobody deletes it by mistake from the console or gcloud. What should you do?',
    options: ['Enable deletion protection on the VM', 'Add a label critical=true to the VM', 'Disable automatic restart on the VM', 'Take a snapshot of the VM’s boot disk'],
    answer: 0,
    explanation: 'With `--deletion-protection` set, delete requests fail until the flag is removed. Labels do not protect anything, automatic restart is about crashes, and a snapshot helps recovery but does not prevent deletion.'
  },
  {
    id: 'ace-t147',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'A single VM runs an application that cannot tolerate reboots. Google will do maintenance on the host it runs on. Which availability setting keeps the VM running through host maintenance?',
    options: ['On host maintenance set to MIGRATE', 'On host maintenance set to TERMINATE', 'Automatic restart set to false', 'Provisioning model set to SPOT'],
    answer: 0,
    explanation: 'MIGRATE (the default for most VMs) live-migrates the VM to another host without a reboot. TERMINATE stops it for maintenance; automatic restart only matters after a stop or crash; Spot VMs cannot live-migrate.'
  },
  {
    id: 'ace-t148',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'An application caches temporary files on a Local SSD for speed. What happens to the cached data when you stop the VM?',
    options: [
      'It is lost; Local SSD data does not survive stopping the VM.',
      'It is kept, because Local SSDs are replicated to a second zone.',
      'It is copied to a snapshot automatically before the VM stops.',
      'It is kept for 30 days, then deleted if the VM stays stopped.'
    ],
    answer: 0,
    explanation: 'Local SSDs are physically attached and ephemeral: their data is lost when the VM is stopped or deleted (data can survive a live migration or a reset). Use them only for scratch data and caches that can be rebuilt.'
  },
  {
    id: 'ace-t149',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Twenty VMs must read and write the same set of files at the same time through a standard NFS mount. Which storage should you use?',
    options: ['Filestore', 'A persistent disk attached in read-write mode to all VMs', 'Local SSDs on each VM kept in sync with rsync', 'A snapshot shared with every VM'],
    answer: 0,
    explanation: 'Filestore is a managed NFS file server that many clients can mount read-write. A standard persistent disk can be attached read-write to only one VM (read-only to many); syncing Local SSDs is fragile; snapshots are not mountable.'
  },
  {
    id: 'ace-t150',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A reference dataset of 200 GB is created once and then read, never changed, by 30 VMs in the same zone. You want the simplest and cheapest block storage option. What should you do?',
    options: [
      'Attach one persistent disk to all 30 VMs in read-only mode.',
      'Create 30 copies of the disk and attach one to each VM.',
      'Store the data on a Local SSD in each of the 30 VMs.',
      'Attach the disk read-write to all VMs and mount it carefully.'
    ],
    answer: 0,
    explanation: 'A persistent disk can be attached to many VMs at once in read-only mode, so one disk serves all of them. Thirty copies cost thirty times as much; Local SSDs must be filled on every boot; multi-VM read-write is not supported for standard disks.'
  },
  {
    id: 'ace-t151',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A Hadoop-style analytics cluster on Compute Engine reads large files sequentially and needs high throughput at low cost per GB, not high IOPS. Which disk type fits best?',
    options: ['Hyperdisk Throughput', 'Hyperdisk Extreme', 'Local SSD', 'SSD persistent disk'],
    answer: 0,
    explanation: 'Hyperdisk Throughput is designed for scale-out analytics and other throughput-oriented workloads, with throughput provisioned at a low cost per GB. Hyperdisk Extreme and SSD PD target IOPS-heavy databases; Local SSD is ephemeral.'
  },
  {
    id: 'ace-t152',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'Policy requires that persistent disks holding customer data be encrypted with keys your company controls and can revoke. What should you do when creating the disks?',
    options: [
      'Create them with a customer-managed encryption key (CMEK) from Cloud KMS.',
      'Create them with the default encryption, which Google manages for you.',
      'Encrypt the files inside the guest OS and store the key on the same disk.',
      'Create them as regional disks, which use stronger encryption by default.'
    ],
    answer: 0,
    explanation: 'Every disk is encrypted at rest by default with Google-managed keys. CMEK uses a key in Cloud KMS that you control, rotate and can disable; the Compute Engine service agent needs Encrypter/Decrypter on it. Regional disks use the same encryption; a key on the same disk protects nothing.'
  },
  {
    id: 'ace-t153',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'A VM keeps old log archives that are rarely read, and you want the cheapest persistent disk type for them. Which should you choose?',
    options: ['Standard persistent disk (pd-standard)', 'SSD persistent disk (pd-ssd)', 'Extreme persistent disk (pd-extreme)', 'Hyperdisk Extreme'],
    answer: 0,
    explanation: 'pd-standard (HDD) has the lowest price per GB and suits bulk, sequential, rarely used data. The SSD and Extreme types cost more for IOPS you do not need. (For pure archives, Cloud Storage Archive class is cheaper still.)'
  },
  {
    id: 'ace-t154',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'A GKE cluster runs payment workloads. You want automatic upgrades, but only to versions that have been proven longest in the other channels. Which release channel should you enrol the cluster in?',
    options: ['Stable', 'Rapid', 'Regular', 'No channel, with auto-upgrade off'],
    answer: 0,
    explanation: 'The Stable channel receives versions after they have been validated in Rapid and Regular, trading new features for stability. Rapid gets the newest versions first; Regular is the default middle ground; turning upgrades off leaves you to patch manually.'
  },
  {
    id: 'ace-t155',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'A GKE Standard cluster runs web services on general-purpose nodes. A new ML inference workload needs GPUs, and the web Pods must not land on GPU nodes. What should you do?',
    options: [
      'Add a GPU node pool with a taint, and give only the ML Pods a matching toleration.',
      'Recreate the default node pool with GPUs attached to every node of the cluster.',
      'Create a second cluster for the ML workload and connect the two clusters by VPN.',
      'Add GPUs to the existing nodes with gcloud compute instances attach-accelerator.'
    ],
    answer: 0,
    explanation: 'A separate node pool holds the GPU nodes; a taint keeps other Pods off them, and the ML Pods tolerate the taint (GKE adds a GPU taint automatically). GPUs on every node waste money, a second cluster is heavy, and nodes are managed through node pools, not individually.'
  },
  {
    id: 'ace-t156',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'You need to expose two services of a GKE application on one public IP, with `/api` going to one and `/` to the other, over HTTPS with a Google-managed certificate. What should you create?',
    options: [
      'An Ingress (or Gateway) with path rules and a Google-managed certificate.',
      'Two Services of type LoadBalancer, one for each path of the application.',
      'A Service of type NodePort and firewall rules for each of the node ports.',
      'A Service of type ClusterIP with an external IP added to its spec.'
    ],
    answer: 0,
    explanation: 'Ingress or Gateway on GKE creates an external Application Load Balancer, which routes by host and path and can terminate TLS with a Google-managed certificate. LoadBalancer Services are layer 4 with one IP each; NodePort and ClusterIP do not give managed HTTPS routing.'
  },
  {
    id: 'ace-t157',
    topic: 'GKE',
    difficulty: 'hard',
    prompt: 'A GKE service must be reachable from VMs in the same VPC network, but never from the internet. How should you expose it?',
    options: [
      'A Service of type LoadBalancer with the annotation that makes it an internal load balancer.',
      'A Service of type LoadBalancer with a firewall rule that denies all internet traffic.',
      'A Service of type ClusterIP, which VMs in the VPC can reach on its cluster IP address.',
      'An external Ingress restricted by a Cloud Armor policy that allows only internal ranges.'
    ],
    answer: 0,
    explanation: 'The annotation `networking.gke.io/load-balancer-type: "Internal"` creates an internal passthrough Network Load Balancer with an IP from the VPC. A ClusterIP is only reachable inside the cluster; an external load balancer behind a firewall or Cloud Armor still has a public address.'
  },
  {
    id: 'ace-t158',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'A log-collection agent must run exactly one Pod on every node of a GKE Standard cluster, including nodes added later by the autoscaler. Which object should you use?',
    options: ['DaemonSet', 'Deployment', 'StatefulSet', 'CronJob'],
    answer: 0,
    explanation: 'A DaemonSet runs one copy of a Pod on each node and adds one when a node joins. Deployments and StatefulSets keep a replica count regardless of nodes; CronJobs run on a schedule.'
  },
  {
    id: 'ace-t159',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'A cleanup task must run inside your GKE cluster every night at 02:00 and then exit. Which Kubernetes object should you use?',
    options: ['CronJob', 'DaemonSet', 'Deployment', 'Service'],
    answer: 0,
    explanation: 'A CronJob creates a Job on a cron schedule, and the Job runs Pods to completion. A Deployment keeps Pods running forever, a DaemonSet runs on every node, and a Service exposes Pods.'
  },
  {
    id: 'ace-t160',
    topic: 'GKE',
    difficulty: 'medium',
    prompt: 'Your GKE cluster has private nodes and a public control plane endpoint. You want only your office network, 203.0.113.0/24, to be able to reach the control plane. What should you configure?',
    options: [
      'Control plane authorized networks with 203.0.113.0/24',
      'A VPC firewall rule allowing tcp:443 from 203.0.113.0/24',
      'A Cloud NAT gateway with the office range as its source',
      'An IAM condition on Kubernetes Engine roles by source IP'
    ],
    answer: 0,
    explanation: 'Authorized networks restrict which IP ranges can reach the cluster’s control plane endpoint. VPC firewall rules protect your VMs, not the Google-managed control plane; Cloud NAT is for outbound traffic.'
  },
  {
    id: 'ace-t161',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'A Cloud Run service must connect to a Memorystore for Redis instance that has only a private IP in your VPC. What should you configure?',
    options: [
      'Direct VPC egress (or a Serverless VPC Access connector) on the Cloud Run service.',
      'A public IP on the Redis instance and an allow rule for the Cloud Run address ranges.',
      'Cloud NAT in the region so that Cloud Run can reach the private IP of the Redis instance.',
      'Ingress set to internal on the Cloud Run service so that it joins the VPC network.'
    ],
    answer: 0,
    explanation: 'Cloud Run reaches private IPs in a VPC through Direct VPC egress or a Serverless VPC Access connector. Memorystore does not offer a public IP; Cloud NAT is for reaching the internet; ingress settings control incoming traffic, not outgoing.'
  },
  {
    id: 'ace-t162',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'An internal Cloud Run API must accept requests only from inside your VPC network, never directly from the internet. What should you set?',
    options: ['Ingress to internal', 'Egress to all traffic', 'Max instances to 1', 'Min instances to 0'],
    answer: 0,
    explanation: 'The ingress setting controls where requests may come from: internal accepts traffic only from your VPC networks (and some Google sources), and "internal and Cloud Load Balancing" adds an internal or external load balancer. Egress and scaling settings do not restrict callers.'
  },
  {
    id: 'ace-t163',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'hard',
    prompt: 'After returning a response, a Cloud Run service keeps processing in a background thread for up to a minute. That work is very slow or never finishes. What should you change?',
    options: [
      'Use instance-based billing so CPU stays allocated outside requests.',
      'Increase the request timeout of the service to 60 minutes.',
      'Lower the concurrency of each instance to 1 request at a time.',
      'Increase the memory of each instance to the highest limit.'
    ],
    answer: 0,
    explanation: 'With request-based billing, CPU is throttled to almost nothing outside requests, so background work stalls. Instance-based billing (CPU always allocated) keeps CPU available. Timeouts, concurrency and memory do not change CPU allocation between requests.'
  },
  {
    id: 'ace-t164',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'easy',
    prompt: 'A developer has a Node.js app in a folder with no Dockerfile and wants it running on Cloud Run with a single command. What should they run?',
    options: [
      '`gcloud run deploy web --source . --region=asia-southeast2`',
      '`gcloud run deploy web --image=. --region=asia-southeast2`',
      '`gcloud builds submit --tag=web --region=asia-southeast2`',
      '`docker push web && gcloud run services create web`'
    ],
    answer: 0,
    explanation: '`--source .` uploads the folder, builds it with Cloud Build (using buildpacks when there is no Dockerfile), stores the image in Artifact Registry and deploys it. `--image` needs an existing image; builds submit only builds; there is no `services create` command.'
  }
];
