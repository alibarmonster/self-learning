import type { LessonMeta } from '@/types';

/**
 * Lessons shared by the Google Cloud exams: tryout prep for each of the six
 * course modules (each one names the practice set groups it prepares for),
 * then the deep dives. Only this list ships in the main bundle; each lesson's
 * content is fetched when it is opened.
 */
const PREP = 'Tryout prep';
const TRYOUT_MD1_MD2 = 'Tryout · MD1–MD2';

export const GOOGLE_CLOUD_LESSONS: LessonMeta[] = [
  {
    id: 'tryout-m1',
    title: 'Tryout Prep · Module 1: Cloud Foundations & Environment Setup',
    summary: 'Sessions 1–2, exam guide Section 1: regions and gcloud, the hierarchy and organization policies, projects, APIs and quotas, IAM with Cloud Identity and Workforce Identity Federation, billing, observability and Cloud Asset Inventory — then LAB01 and the cue sheet for the try-out.',
    minutes: 45,
    level: 'Module 1',
    topics: ['Section 1', 'Resource hierarchy', 'Org policies', 'IAM', 'Cloud Identity', 'Billing', 'Asset Inventory'],
    group: PREP,
    prepares: ['Module 1 · Cloud Foundations & Environment Setup', TRYOUT_MD1_MD2],
    load: () => import('./tryout-m1')
  },
  {
    id: 'tryout-m2',
    title: 'Tryout Prep · Module 2: Compute Services',
    summary: 'Sessions 3–8: choosing compute, VMs, Spot and custom shapes, OS Login and VM Manager, disks, snapshots and MIGs, GKE clusters, workloads and autoscaling, Cloud Run and events, GPUs/TPUs, Agent Runtime and Cloud Workstations — with both labs.',
    minutes: 75,
    level: 'Module 2',
    topics: ['Compute Engine', 'MIGs', 'GKE', 'Cloud Run', 'Eventarc', 'GPUs/TPUs'],
    group: PREP,
    prepares: ['Module 2 · Compute Services', TRYOUT_MD1_MD2],
    load: () => import('./tryout-m2')
  },
  {
    id: 'tryout-m3',
    title: 'Tryout Prep · Module 3: Storage & Data Solutions',
    summary: 'Sessions 9–12: Cloud Storage classes, versioning, soft delete, signed URLs, lifecycle and Bucket Lock; Cloud SQL, AlloyDB, Spanner, Firestore, Bigtable, Memorystore and BigQuery costs; Pub/Sub, Managed Kafka and Dataflow; CMEK and multi-region designs.',
    minutes: 70,
    level: 'Module 3',
    topics: ['Cloud Storage', 'Cloud SQL', 'Spanner', 'BigQuery', 'Dataflow', 'CMEK'],
    group: PREP,
    prepares: ['Module 3 · Storage & Data Solutions'],
    load: () => import('./tryout-m3')
  },
  {
    id: 'tryout-m4',
    title: 'Tryout Prep · Module 4: Cloud Networking',
    summary: 'Sessions 13–17: custom VPCs, IPs and routes, firewall rules and Cloud NGFW with secure tags, Shared VPC vs peering, VPN and Interconnect, Cloud DNS and NAT, network tiers, load balancers with CDN and Cloud Armor — with a subnet calculator, a firewall exercise and a load balancer picker.',
    minutes: 70,
    level: 'Module 4',
    topics: ['VPC', 'Cloud NGFW', 'Shared VPC', 'HA VPN', 'Cloud NAT', 'Load balancing'],
    group: PREP,
    prepares: ['Module 4 · Cloud Networking'],
    load: () => import('./tryout-m4')
  },
  {
    id: 'tryout-m5',
    title: 'Tryout Prep · Module 5: Operations, Observability & IaC',
    summary: 'Sessions 18–22: alerts, the Ops Agent and Managed Prometheus, log buckets, sinks and Log Analytics, audit and flow logs, Active Assist, Cloud Hub and Personalized Service Health, Trace, Profiler and Query Insights, Terraform, Helm, Config Connector, Fabric FAST and the AI tools.',
    minutes: 65,
    level: 'Module 5',
    topics: ['Monitoring', 'Logging', 'Audit logs', 'Cloud Trace', 'Terraform', 'Gemini CLI'],
    group: PREP,
    prepares: ['Module 5 · Operations, Observability & IaC'],
    load: () => import('./tryout-m5')
  },
  {
    id: 'tryout-m6',
    title: 'Tryout Prep · Module 6: Security Deep-Dive & Exam Readiness',
    summary: 'Sessions 23–26, exam guide Section 4: policy evaluation, deny policies and inheritance, custom roles, service accounts, impersonation, short-lived credentials, Workload Identity Federation — then the blueprint, question strategy, logistics and one cue sheet for all six modules.',
    minutes: 65,
    level: 'Module 6',
    topics: ['Section 4', 'IAM', 'Custom roles', 'Service accounts', 'Workload Identity Federation', 'Exam strategy'],
    group: PREP,
    prepares: ['Module 6 · Security & Full-Blueprint Mini Mock'],
    load: () => import('./tryout-m6')
  },
  {
    id: 'ace-guide',
    title: 'The ACE Exam Guide, Explained',
    summary: 'Every consideration in Google’s current Associate Cloud Engineer guide — all four sections, 94 items — explained with the commands, how the exam asks it, and where to go deeper.',
    minutes: 90,
    level: 'All levels',
    topics: ['Exam guide', 'Section 1–4', 'gcloud', 'Exam cues'],
    load: () => import('./aceguide')
  },
  {
    id: 'gke',
    title: 'Getting Started with Google Kubernetes Engine',
    summary: 'From zero: Kubernetes concepts, cluster components, Autopilot vs Standard, kubectl, introspection, and the 9 case studies that come up most.',
    minutes: 45,
    level: 'Beginner → Intermediate',
    topics: ['GKE', 'Kubernetes', 'kubectl', 'Autopilot', 'Workload Identity Federation for GKE'],
    load: () => import('./gke')
  },
  {
    id: 'vpc',
    title: 'VPC Networks and Firewall Rules',
    summary: 'IP addresses and CIDR, routing, how the firewall decides allow or deny, the ways out of a private VM, peering, Shared VPC, hybrid, and 9 troubleshooting scenarios.',
    minutes: 50,
    level: 'Beginner → Intermediate',
    topics: ['VPC', 'Firewall', 'CIDR', 'Cloud NAT', 'Peering', 'Shared VPC', 'Cloud VPN'],
    load: () => import('./vpc')
  },
  {
    id: 'cloud-run',
    title: 'Fundamentals of Cloud Run',
    summary: 'Services and jobs, the resource model, the container lifecycle, autoscaling (with a calculator), gradual releases, IAM, ingress, VPC egress, and 9 troubleshooting scenarios.',
    minutes: 50,
    level: 'Beginner → Intermediate',
    topics: ['Cloud Run', 'Autoscaling', 'Revisions', 'IAM', 'Ingress', 'Direct VPC egress'],
    load: () => import('./cloudrun')
  },
  {
    id: 'load-balancing',
    title: "Cloud Load Balancing: Today's Names and How to Choose",
    summary: 'The 2023 renames mapped old to new, the three families, a picker that names the right load balancer, URL maps, NEGs, Cloud Armor, health check ranges, proxy-only subnets, and 9 troubleshooting scenarios.',
    minutes: 50,
    level: 'Beginner → Intermediate',
    topics: ['Application LB', 'Network LB', 'Cloud Armor', 'Cloud CDN', 'Health checks', 'Proxy-only subnet'],
    load: () => import('./loadbalancing')
  }
];
