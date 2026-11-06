import type { Question } from '@/types';

/**
 * Section 2 — Managing and provisioning a cloud solution infrastructure
 * (~17.5%). Network topologies, storage and compute configuration, ML
 * workflows on Gemini Enterprise Agent Platform, and prebuilt AI solutions.
 */
export const provisioning: Question[] = [
  // ── Network topologies ────────────────────────────────────────────────────
  {
    id: 'pca-p-001',
    topic: 'Network topologies',
    difficulty: 'medium',
    prompt: 'A company connects to Google Cloud with Dedicated Interconnect and adds HA VPN as a backup path. Traffic must use Interconnect normally and fail over to VPN automatically. How do you configure routing?',
    options: [
      'Advertise the same prefixes on both paths, with a worse BGP priority (higher MED) on the VPN sessions',
      'Create static routes to the VPN tunnels with priority 0, alongside the BGP routes',
      'Disable the BGP sessions on the VPN tunnels and re-enable them by hand if Interconnect fails',
      'Use two different VPC networks, one per path, and move workloads between them on failure',
    ],
    answer: 0,
    explanation: 'With both paths learned dynamically through Cloud Router, route priorities steer traffic to Interconnect and BGP withdraws it automatically on failure, leaving VPN. Static priority-0 routes would always win, manual enabling is not automatic, and separate VPCs do not create failover.'
  },
  {
    id: 'pca-p-002',
    topic: 'Network topologies',
    difficulty: 'medium',
    prompt: 'After an acquisition, two Google Cloud organizations need full, low-latency private connectivity between one VPC in each. Their IP ranges do not overlap. What is the simplest option?',
    options: ['VPC Network Peering between the two VPCs', 'Shared VPC spanning both organizations', 'Cloud NAT in both VPCs', 'Public IPs with firewall rules allowing each other'],
    answer: 0,
    explanation: 'VPC Network Peering works across organizations when ranges do not overlap, with internal-IP latency and no gateways. Shared VPC is limited to one organization, NAT gives outbound internet only, and public IPs leave the private network.'
  },
  {
    id: 'pca-p-003',
    topic: 'Network topologies',
    difficulty: 'medium',
    prompt: 'Security requires inspecting traffic between application tiers for known exploits and blocking it inline, without deploying third-party appliances. What should you configure?',
    options: [
      'Cloud NGFW Enterprise intrusion prevention with firewall endpoints and a security profile',
      'VPC Flow Logs with a sampling rate of 1.0 and alerts on suspicious flows',
      'Firewall Rules Logging on every allow rule, reviewed daily by the security team',
      'Cloud Armor policies attached to an internal passthrough Network Load Balancer',
    ],
    answer: 0,
    explanation: 'Cloud NGFW Enterprise inspects traffic with an intrusion prevention service and can block threats inline. Flow logs and firewall logs only record traffic, and Cloud Armor protects load-balanced HTTP(S) traffic at the edge, not east-west traffic.'
  },
  {
    id: 'pca-p-004',
    topic: 'Network topologies',
    difficulty: 'easy',
    prompt: 'The security team must block inbound RDP from the internet to every VM in the organization, and project owners must not be able to override it. What should you use?',
    options: ['A hierarchical firewall policy at the organization with a deny rule', 'A VPC firewall rule in each project', 'An organization policy that restricts external IPs only', 'IAM deny policies on compute permissions'],
    answer: 0,
    explanation: 'Hierarchical firewall policies are evaluated before project rules and cannot be overridden below unless they delegate with goto_next. Per-project rules can be changed by project owners, and the other policies do not filter traffic.'
  },
  {
    id: 'pca-p-005',
    topic: 'Network topologies',
    difficulty: 'hard',
    prompt: 'On-premises servers connected through Interconnect must call Google APIs such as Cloud Storage privately, without going over the internet, and only to services inside a VPC Service Controls perimeter. What should you configure?',
    options: [
      'Advertise restricted.googleapis.com (199.36.153.4/30) over Interconnect and resolve googleapis.com to it',
      'Enable Private Google Access on all subnets of the VPC that the Interconnect attaches to',
      'Route the on-premises API traffic through a Cloud NAT gateway in the connected VPC',
      'Give each on-premises server an external IP and allow those IPs in the firewall rules',
    ],
    answer: 0,
    explanation: 'Advertising the restricted VIP range over Interconnect and resolving googleapis.com to it lets on-premises hosts reach supported APIs privately and inside the perimeter. Private Google Access on subnets affects VMs only, NAT does not route on-premises traffic, and external IPs use the internet.'
  },
  {
    id: 'pca-p-006',
    topic: 'Network topologies',
    difficulty: 'hard',
    prompt: 'On-premises applications reach a VPC over Interconnect, but cannot reach a Cloud SQL instance\'s private IP in that VPC, which uses private services access. What fixes it?',
    options: [
      'Export custom routes on the service peering and advertise the private services access range on-premises',
      'Give the Cloud SQL instance a public IP and add 0.0.0.0/0 as an authorized network',
      'Create a Cloud NAT gateway for the Cloud SQL subnet so on-premises traffic is translated',
      "Add a firewall rule allowing tcp:3306 from on-premises ranges in Google's producer project",
    ],
    answer: 0,
    explanation: 'Private services access is a peering, and peering does not pass routes on by default: the on-premises routes must be exported to the producer network and the allocated range advertised back. A public IP for everything is insecure, NAT is egress only, and you cannot add rules in Google\'s producer project.'
  },
  {
    id: 'pca-p-007',
    topic: 'Network topologies',
    difficulty: 'medium',
    prompt: 'Build servers in a VPC may reach only `pypi.org`, `registry.npmjs.org` and Google APIs on the internet, and nothing else. What should you configure?',
    options: [
      'A firewall policy denying all egress except those FQDNs (Cloud NGFW Standard), plus Private Google Access',
      'VPC firewall rules that allow only the current IP addresses those sites resolve to today',
      'An organization policy that restricts external IP addresses on the build server VMs',
      'Remove the default internet route so that nothing at all can leave the VPC network',
    ],
    answer: 0,
    explanation: 'FQDN objects in network firewall policies follow the sites\' changing addresses, which IP-based rules cannot. Restricting external IPs does not filter destinations, and removing the default route blocks the allowed sites too.'
  },
  {
    id: 'pca-p-008',
    topic: 'Network topologies',
    difficulty: 'easy',
    prompt: 'An internet-facing web application on a global external Application Load Balancer needs protection against SQL injection, abusive clients and layer 7 DDoS attacks. What should you add?',
    options: [
      'Cloud Armor policies with preconfigured WAF rules, rate limiting and Adaptive Protection',
      'Cloud NAT with reserved IP addresses and logging enabled on every connection',
      'VPC Service Controls around the project that hosts the web application',
      'Identity-Aware Proxy requiring every visitor to sign in before reaching the site',
    ],
    answer: 0,
    explanation: 'Cloud Armor provides WAF rules, rate limiting and DDoS protection at Google\'s edge for load-balanced applications. NAT handles egress, VPC Service Controls protect Google APIs, and IAP requires sign-in, which a public site does not want.'
  },
  {
    id: 'pca-p-009',
    topic: 'Network topologies',
    difficulty: 'medium',
    prompt: 'Workloads in Google Cloud must resolve on-premises hostnames, and on-premises servers must resolve names in a Cloud DNS private zone. What do you configure?',
    options: [
      'A forwarding zone for the on-premises domain, and an inbound server policy for on-premises resolvers',
      'Public Cloud DNS zones for both domains, so that every resolver can see all of the names',
      'Hosts files on every VM and on-premises server, kept up to date by a configuration tool',
      "A DNS peering zone between the VPC network and the on-premises network's DNS servers",
    ],
    answer: 0,
    explanation: 'Forwarding zones send queries for on-premises domains to on-premises DNS, and an inbound server policy gives on-premises resolvers an address in the VPC to forward to. Public zones expose internal names, hosts files do not scale, and peering zones link VPC networks, not on-premises.'
  },
  {
    id: 'pca-p-010',
    topic: 'Network topologies',
    difficulty: 'hard',
    prompt: 'An internal API runs in two regions. Clients in both regions and on-premises must reach it through one internal address that keeps working if a whole region fails. Which load balancer fits?',
    options: ['A cross-region internal Application Load Balancer', 'A regional internal passthrough Network Load Balancer', 'A global external Application Load Balancer', 'Two regional internal load balancers with manual DNS changes'],
    answer: 0,
    explanation: 'The cross-region internal Application Load Balancer serves internal clients from backends in several regions and fails over between them. A regional load balancer has no backends elsewhere, an external one exposes the API publicly, and manual DNS changes are slow.'
  },

  // ── Storage configuration ────────────────────────────────────────────────
  {
    id: 'pca-p-011',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'Trading records must be kept unaltered for seven years (WORM), even administrators must not delete them early, and they are rarely read. How do you configure Cloud Storage?',
    options: [
      'A bucket with a locked seven-year retention policy and lifecycle rules to Archive storage',
      'A bucket with object versioning enabled and an IAM deny policy on object deletion',
      'A Standard storage bucket with soft delete set to its 90-day maximum retention',
      'A bucket with a temporary hold placed on every object as soon as it is written',
    ],
    answer: 0,
    explanation: 'A locked retention policy makes the records undeletable until they reach seven years, and lifecycle rules cut the storage cost. IAM can be changed by administrators, soft delete keeps deleted objects only for up to 90 days, and holds can be released by anyone allowed to.'
  },
  {
    id: 'pca-p-012',
    topic: 'Storage configuration',
    difficulty: 'easy',
    prompt: 'A bucket with object versioning enabled is growing fast because old versions are never removed. Old versions are only needed for 30 days. What should you add?',
    options: [
      'A lifecycle rule deleting noncurrent versions 30 days after they become noncurrent',
      'A lifecycle rule deleting all objects, live or not, once they are older than 30 days',
      'Disable object versioning each month and then re-enable it to clear old versions',
      'Move the whole bucket to Archive storage so that the old versions cost less',
    ],
    answer: 0,
    explanation: 'The `daysSinceNoncurrentTime` condition deletes old versions only, keeping live objects. Deleting by age would remove current data, toggling versioning is manual and error-prone, and Archive storage makes the data costly to read.'
  },
  {
    id: 'pca-p-013',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'Objects written in one region must be available in a second, named region within 15 minutes for disaster recovery, without writing any replication code. What should you configure?',
    options: ['A dual-region bucket with turbo replication', 'Two regional buckets and a nightly `gcloud storage rsync`', 'A multi-region bucket with default replication', 'Storage Transfer Service jobs every hour'],
    answer: 0,
    explanation: 'Turbo replication on dual-region buckets replicates objects to the second region within 15 minutes (its RPO target). Nightly or hourly copies miss the target, and default replication in a multi-region bucket has no 15-minute guarantee or named second region.'
  },
  {
    id: 'pca-p-014',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'A BigQuery table grows by 2 TB a day, and almost every query filters on the event date and customer ID. Costs are rising. What should you configure?',
    options: [
      'Partition by event date, cluster by customer ID, and require a partition filter on queries',
      'Export the table to Cloud Storage each night and query the exported files instead',
      'Rewrite all queries as `SELECT *` with `LIMIT 1000` so that each scans less data',
      'Copy the table into a separate dataset for each team so the queries are spread out',
    ],
    answer: 0,
    explanation: 'Partitioning and clustering let BigQuery skip data that queries do not need, and a required partition filter stops accidental full scans. Exporting does not cut query cost, `LIMIT` does not reduce bytes scanned, and copies multiply storage.'
  },
  {
    id: 'pca-p-015',
    topic: 'Storage configuration',
    difficulty: 'easy',
    prompt: 'Customers must download their monthly statement PDFs from a private bucket for up to one hour after clicking a link, without having Google accounts. What should the application generate?',
    options: ['A signed URL for each object with a one-hour expiry', 'A public link to the bucket', 'A service account key for each customer', 'An IAM grant of Storage Object Viewer to `allUsers`'],
    answer: 0,
    explanation: 'Signed URLs grant time-limited access to one object to anyone holding the link. Public access exposes every statement, and keys or IAM grants to `allUsers` are far too broad.'
  },
  {
    id: 'pca-p-016',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'A Firestore database backs a customer-facing app, and the team needs to recover from accidental bulk deletes within the last few days and to keep weekly backups for three months. What should you configure?',
    options: [
      'Point-in-time recovery plus scheduled weekly backups with 14-week retention',
      'Daily exports of the database to BigQuery tables, kept for three months',
      'A second Firestore database that the app writes to in parallel',
      'Soft delete enabled on the Cloud Storage bucket the app uses',
    ],
    answer: 0,
    explanation: 'Firestore point-in-time recovery covers the last seven days, and scheduled backups keep longer restore points. Exports to BigQuery are for analysis, dual writes double cost and bugs, and bucket soft delete has nothing to do with Firestore.'
  },
  {
    id: 'pca-p-017',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'A BigQuery workload uses a predictable amount of compute on weekdays with occasional heavy month-end reports. Finance wants predictable spend with room for the spikes. What should you configure?',
    options: [
      'A BigQuery edition reservation with a baseline of slots and autoscaling up to a maximum',
      'On-demand pricing with no limits, paying per TiB scanned by every query',
      'A Cloud SQL read replica that runs the month-end reports instead of BigQuery',
      'Cluster every table and stay on on-demand pricing, which caps the monthly cost',
    ],
    answer: 0,
    explanation: 'Capacity pricing with baseline slots gives predictable cost, and autoscaling adds slots for the month-end peak within a cap. On-demand cost varies with bytes scanned, Cloud SQL is not a warehouse, and clustering alone does not make spend predictable.'
  },
  {
    id: 'pca-p-018',
    topic: 'Storage configuration',
    difficulty: 'easy',
    prompt: 'A German customer\'s analytics data must stay in Germany. You are creating the BigQuery datasets. What must you get right first?',
    options: [
      "Create the datasets in `europe-west3` (Frankfurt); a dataset's location cannot change later",
      "Use the `EU` multi-region, which keeps all of the data inside Germany's borders",
      'Create them in `US` and copy the data to a German bucket each night for residency',
      'Set a 30-day table expiration so that data leaves no long-term copies abroad',
    ],
    answer: 0,
    explanation: 'Dataset location is fixed at creation, and `europe-west3` keeps the data in Germany. The `EU` multi-region can store data anywhere in the EU, copying to the US breaks residency, and expiration does not control location.'
  },
  {
    id: 'pca-p-019',
    topic: 'Storage configuration',
    difficulty: 'medium',
    prompt: 'A Bigtable instance serves an ad platform whose traffic varies threefold through the day. The team wants enough nodes for peaks without paying for them all day. What should you configure?',
    options: [
      'Bigtable autoscaling with minimum and maximum nodes and a CPU target',
      'A fixed node count sized for the daily peak to avoid any slowdowns',
      'A cluster on HDD storage instead of SSD to reduce the cost of nodes',
      'A nightly script that deletes the instance and recreates it each morning',
    ],
    answer: 0,
    explanation: 'Autoscaling adds and removes nodes based on CPU and storage within the limits you set. A fixed peak size wastes money off-peak, HDD storage hurts latency for serving, and deleting the instance destroys data.'
  },

  // ── Compute configuration ─────────────────────────────────────────────────
  {
    id: 'pca-p-020',
    topic: 'Compute configuration',
    difficulty: 'medium',
    prompt: 'A GKE Standard cluster runs latency-critical services and a large, interruptible batch workload. How should you configure compute to cut cost without risking the critical services?',
    options: [
      'A tainted Spot node pool that only the batch Pods tolerate; critical services stay on standard nodes',
      'Convert all node pools to Spot VMs and rely on Pod disruption budgets for safety',
      'Run the batch work on the standard nodes with a lower PriorityClass, without a separate pool',
      'Use one node pool of larger standard machines shared by the services and the batch',
    ],
    answer: 0,
    explanation: 'A tainted Spot pool takes only the batch Pods, which tolerate it, so interruptions never reach the critical services. All-Spot risks the critical services, priority classes alone save nothing, and larger standard nodes cost more.'
  },
  {
    id: 'pca-p-021',
    topic: 'Compute configuration',
    difficulty: 'easy',
    prompt: 'A Cloud Run service must connect to a Cloud SQL instance and a Memorystore instance on private IPs in a VPC. What is the recommended configuration?',
    options: ['Direct VPC egress on the Cloud Run service', 'Give both databases public IPs', 'Run a proxy VM in the VPC and send traffic through it', 'Use Cloud NAT on the Cloud Run service'],
    answer: 0,
    explanation: 'Direct VPC egress sends the service\'s traffic into the VPC so it can reach private IPs, without extra connectors or VMs. Public IPs expose the databases, a proxy VM adds operations, and Cloud NAT is for internet egress.'
  },
  {
    id: 'pca-p-022',
    topic: 'Compute configuration',
    difficulty: 'easy',
    prompt: 'Operations must patch 2,000 Linux and Windows VMs every month in maintenance windows and report compliance to auditors. What should you use?',
    options: ['VM Manager patch deployments', 'A startup script that runs updates on every boot', 'Recreating each VM from a new image by hand', 'Cloud Scheduler calling SSH on each VM'],
    answer: 0,
    explanation: 'VM Manager schedules patch jobs across fleets, by label or zone, in windows, and reports compliance. Startup scripts patch only on reboot, manual rebuilds do not scale, and scripted SSH has no reporting.'
  },
  {
    id: 'pca-p-023',
    topic: 'Compute configuration',
    difficulty: 'medium',
    prompt: 'A worker fleet on a managed instance group processes messages from a Pub/Sub subscription. The fleet should grow when messages pile up and shrink when the queue drains. How do you configure autoscaling?',
    options: [
      "Autoscale on the subscription's undelivered-messages metric from Cloud Monitoring",
      'Autoscale only on the average CPU utilisation of the worker VMs in the group',
      'Use a fixed group size equal to the busiest hour seen in the last month',
      'Create a scaling schedule that adds workers during business hours each day',
    ],
    answer: 0,
    explanation: 'Scaling on the backlog metric follows the actual work waiting. CPU may stay low while messages wait, a fixed size wastes money, and a schedule does not follow unpredictable bursts.'
  },
  {
    id: 'pca-p-024',
    topic: 'Compute configuration',
    difficulty: 'medium',
    prompt: 'VMs running in Google Cloud VMware Engine must reach Cloud SQL and Compute Engine resources in your VPC over private IPs. What should you configure?',
    options: [
      'A private connection between the VMware Engine network and the VPC network',
      'External IP addresses on every VMware VM, with firewall rules for the VPC',
      'Cloud NAT on the VMware Engine private cloud for traffic towards the VPC',
      'An Identity-Aware Proxy TCP tunnel from each VMware VM to the VPC resources',
    ],
    answer: 0,
    explanation: 'A private connection (VPC peering between the VMware Engine network and your VPC) gives private IP routing both ways. External IPs and NAT use the internet, and IAP tunnels are for administrative access, not application traffic.'
  },
  {
    id: 'pca-p-025',
    topic: 'Compute configuration',
    difficulty: 'medium',
    prompt: 'A retailer needs 64 GPUs guaranteed in one zone during a three-day sales event next month, regardless of other demand. What should you configure?',
    options: ['A future reservation for the GPU capacity in that zone', 'Spot VMs with GPUs', 'A higher GPU quota only', 'On-demand VMs started on the morning of the event'],
    answer: 0,
    explanation: 'Reservations hold capacity in a zone for your use, and future reservations can be booked ahead for a period. Spot capacity can be reclaimed, quota is permission not capacity, and on-demand capacity is not guaranteed.'
  },
  {
    id: 'pca-p-026',
    topic: 'Compute configuration',
    difficulty: 'medium',
    prompt: 'A platform team runs 30 GKE clusters across regions and on-premises and needs the same namespaces, RBAC and policies applied to all of them from Git. What should you use?',
    options: ['Fleet management with Config Sync and Policy Controller', 'A shell script that runs `kubectl apply` against each cluster', 'Separate Helm releases maintained by each cluster owner', 'Cloud Deploy pipelines per cluster'],
    answer: 0,
    explanation: 'Fleets group clusters, Config Sync keeps them in the state stored in Git, and Policy Controller enforces policies. Scripts and per-owner Helm releases drift, and Cloud Deploy promotes application releases rather than governing cluster configuration.'
  },
  {
    id: 'pca-p-027',
    topic: 'Compute configuration',
    difficulty: 'hard',
    prompt: 'Services on GKE sit behind an external Application Load Balancer, and the team sees uneven load and extra hops because traffic goes to node ports first. What should you configure?',
    options: [
      'Container-native load balancing with network endpoint groups (Gateway or Ingress with NEGs)',
      'More nodes in the node pool so that each node port receives less traffic',
      'Client IP session affinity on the Kubernetes Service behind the load balancer',
      'An external passthrough Network Load Balancer in front of the node ports instead',
    ],
    answer: 0,
    explanation: 'With NEGs, the load balancer sends traffic straight to Pod IPs with accurate health checks, removing the node-port hop. More nodes or session affinity do not remove the hop, and a passthrough load balancer loses HTTP routing.'
  },
  {
    id: 'pca-p-028',
    topic: 'Compute configuration',
    difficulty: 'easy',
    prompt: 'A company wants every VM to start from a hardened, patched OS image, rebuilt monthly, and to roll new images onto its managed instance groups safely. What should you set up?',
    options: [
      'An image pipeline building into an image family, then rolling MIG updates to a new template',
      'Manual patching of each running VM over SSH, tracked in a monthly spreadsheet',
      'Snapshots of one hardened VM, restored onto the disks of all the other VMs',
      'Public images with startup scripts that apply the hardening on every boot',
    ],
    answer: 0,
    explanation: 'A golden image pipeline plus image families and rolling MIG updates gives consistent, tested images rolled out safely. Manual patching drifts, snapshots copy one VM\'s state everywhere, and hardening at every boot is slow and inconsistent.'
  },

  // ── ML workflows on Agent Platform ───────────────────────────────────────
  {
    id: 'pca-p-029',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'medium',
    prompt: 'A data science team retrains a demand model by hand each month: prepare data, train, evaluate, and deploy if it beats the current model. They want this repeatable and auditable. What should they use?',
    options: ['Agent Platform Pipelines', 'A notebook run manually each month', 'Cloud Scheduler calling a VM that runs all the steps', 'BigQuery scheduled queries only'],
    answer: 0,
    explanation: 'Agent Platform Pipelines orchestrates each step as a tracked component with lineage and conditional deployment. Manual notebooks are not repeatable, a VM script lacks lineage and step tracking, and scheduled queries cover only the SQL part.'
  },
  {
    id: 'pca-p-030',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'medium',
    prompt: 'New training data arrives in a Cloud Storage bucket at irregular times, and each arrival should start the training pipeline. What is the lightest way to trigger it?',
    options: [
      "A Cloud Run function on the bucket's object finalize event that submits a pipeline run",
      'A small VM with a cron job that checks the bucket for new files every minute',
      'A GKE cluster running a controller that polls the bucket for new objects',
      'Run the pipeline on a schedule every hour, whether new data arrived or not',
    ],
    answer: 0,
    explanation: 'An event-triggered function runs only when data arrives and calls the pipeline API. Polling VMs and controllers cost money while idle, and hourly runs waste compute and still add delay.'
  },
  {
    id: 'pca-p-031',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'hard',
    prompt: 'A team runs many training jobs that can start whenever accelerators are free and must finish within a few days. Capacity is scarce in their region. Which consumption option fits best?',
    options: ['Dynamic Workload Scheduler in flex-start mode', 'Committed use discounts for three years', 'On-demand VMs retried by hand', 'Calendar-mode reservation for every job'],
    answer: 0,
    explanation: 'Flex-start queues jobs and starts them when the requested accelerators become available, suiting flexible training. Long commitments suit steady use, manual retries waste time, and calendar mode is for fixed, known time windows.'
  },
  {
    id: 'pca-p-032',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'medium',
    prompt: 'A research team trains a very large model written in JAX and wants the best price-performance for matrix-heavy training at scale. Which accelerators should you recommend?',
    options: ['Cloud TPUs', 'CPU-only VMs', 'GPUs attached to E2 VMs', 'Memorystore with large instances'],
    answer: 0,
    explanation: 'TPUs are designed for large-scale matrix operations and are well supported by JAX through XLA. CPUs are slow for this, GPUs cannot be attached to E2 machines, and Memorystore is a cache.'
  },
  {
    id: 'pca-p-033',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'medium',
    prompt: 'A model receives a few requests an hour for most of the day and short bursts during campaigns. It needs a GPU for acceptable latency. Which serving option minimises cost?',
    options: ['Cloud Run with a GPU, scaling to zero between requests', 'A GPU VM running all day', 'A GKE node pool of GPUs with a minimum of four nodes', 'A TPU pod slice'],
    answer: 0,
    explanation: 'Cloud Run with GPUs scales to zero, so idle hours cost nothing, and scales out for bursts. Always-on GPU VMs or node pools pay for idle time, and a TPU slice is built for large-scale training rather than light serving.'
  },
  {
    id: 'pca-p-034',
    topic: 'ML workflows on Agent Platform',
    difficulty: 'hard',
    prompt: 'Training data for a fraud model sits in an on-premises database, and the training jobs run on Gemini Enterprise Agent Platform in `europe-west4`. What should you do to prepare the data integration?',
    options: [
      'Land the data in BigQuery or Cloud Storage in the training region through a repeatable pipeline',
      'Have each training job query the on-premises database directly over the VPN connection',
      'Email CSV extracts of the data to the data scientists, who upload them before each run',
      'Store the data in a `US` multi-region bucket for durability and let jobs read it remotely',
    ],
    answer: 0,
    explanation: 'Training reads data far faster and more reliably from BigQuery or Cloud Storage in the same region, and a pipeline keeps it fresh and governed. Querying on-premises from each job is slow and fragile, emailing data breaks governance, and a US bucket adds latency and may breach residency.'
  },

  // ── Prebuilt AI & APIs ───────────────────────────────────────────────────
  {
    id: 'pca-p-035',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'easy',
    prompt: 'A broadcaster wants to find shot changes, detect objects and flag explicit content across thousands of hours of stored video, without training a model. Which API fits?',
    options: ['Video Intelligence API', 'Cloud Vision API', 'Speech-to-Text', 'Natural Language API'],
    answer: 0,
    explanation: 'The Video Intelligence API analyses video for shots, objects and explicit content. Vision works on still images, Speech-to-Text on audio, and Natural Language on text.'
  },
  {
    id: 'pca-p-036',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'medium',
    prompt: 'A utility company wants a virtual agent that handles customer calls and chats in natural language, hands off to human agents with context, and follows defined flows for billing questions. What should it use?',
    options: [
      'Conversational Agents (Dialogflow CX) in Customer Engagement Suite',
      'The Cloud Translation API connected to the phone system',
      'Agent Search over the billing FAQ pages, without any flows',
      'A fine-tuned image model served from Gemini Enterprise Agent Platform',
    ],
    answer: 0,
    explanation: 'Conversational Agents build voice and chat virtual agents with flows, generative responses and handoff to human agents. Translation converts languages, search alone does not run conversations, and an image model is unrelated.'
  },
  {
    id: 'pca-p-037',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'easy',
    prompt: 'Analysts want to upload a set of research reports, ask questions grounded only in those sources, and produce a short audio overview for executives, within their company\'s enterprise controls. What should they use?',
    options: ['NotebookLM in Gemini Enterprise', 'The Cloud Vision API', 'BigQuery ML', 'Cloud Translation API'],
    answer: 0,
    explanation: 'NotebookLM answers questions grounded in the sources you add and can create audio overviews; the enterprise version runs under the company\'s controls. The other services do not work with documents in this way.'
  },
  {
    id: 'pca-p-038',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'medium',
    prompt: 'Employees waste time searching across Google Drive, SharePoint and Jira for answers, and want an assistant that searches all of them with each user\'s permissions and can run agents for common tasks. What should you recommend?',
    options: ['Gemini Enterprise with connectors to those data sources', 'A custom Elasticsearch cluster on Compute Engine', 'BigQuery with all documents loaded as text', 'Cloud Storage with signed URLs'],
    answer: 0,
    explanation: 'Gemini Enterprise (formerly Google Agentspace) connects to enterprise sources, respects each user\'s access, and adds agents for tasks. A self-run search cluster, BigQuery or a bucket would need to rebuild permissions, connectors and AI from scratch.'
  },
  {
    id: 'pca-p-039',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'medium',
    prompt: 'A team wants to use a partner large language model alongside Gemini in its application, through a managed API, without hosting the model itself. Where should it get the model?',
    options: ['Model Garden, using the partner model as a managed API', 'A GPU VM with the model weights downloaded from the internet', 'The Natural Language API', 'Agent Platform Workbench notebooks only'],
    answer: 0,
    explanation: 'Model Garden offers partner and open models, many as fully managed APIs, next to Gemini. Self-hosting on a VM adds operations, the Natural Language API is a fixed task API, and notebooks are a development environment.'
  },
  {
    id: 'pca-p-040',
    topic: 'Prebuilt AI & APIs',
    difficulty: 'medium',
    prompt: 'An online store wants to generate product photo variations, such as new backgrounds and colours, from one supplier photo. Which capability fits?',
    options: [
      'Imagen image generation and editing on Gemini Enterprise Agent Platform',
      'The Cloud Vision API with label and object detection on the photo',
      'Speech-to-Text with a custom model trained on product descriptions',
      'Document AI with a custom processor for product photographs',
    ],
    answer: 0,
    explanation: 'Imagen generates and edits images, including background changes and variations. Vision detects what is in images, and Speech-to-Text and Document AI work on audio and documents.'
  }
];
