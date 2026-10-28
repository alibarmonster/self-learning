/**
 * Associate Cloud Engineer — the Tryout questions. Fifty new questions written
 * in the exam’s style for the course modules MD1 (fundamentals, hierarchy,
 * projects, IAM, billing and observability) and MD2 (compute choice, VMs,
 * disks and snapshots, MIGs, GKE, Cloud Run and events, accelerators). Each
 * sits in the section of the guide its decision belongs to, so it also turns
 * up in the presets and topic drills; together they are the fixed set Tryout 1
 * in ../sets.ts. Tryout 2–4 come from tryout-setup, -access, -planning and
 * -operating.ts. Companion lesson: src/lessons/tryout.ts.
 */
import type { Question } from '@/types';

type SectionId = 'setup' | 'planning' | 'operating' | 'access';

export const tryout: Record<SectionId, Question[]> = {
  setup: [
    {
      id: 'ace-t01',
      topic: 'Resource hierarchy & org policy',
      difficulty: 'easy',
      prompt: 'Your company has three departments, each with several projects. Each department has its own administrators who must manage every project of that department, including projects created later. You want the least ongoing administration. What should you do?',
      options: [
        'Create a folder per department, move its projects into it, and grant the department’s admin group the role on the folder.',
        'Grant each department’s administrators the role on every project, and add the grant to each new project as it is created.',
        'Create one project per department and run all of that department’s workloads inside that single shared project.',
        'Grant all administrators the role at the organization level and rely on project labels to separate the departments.'
      ],
      answer: 0,
      explanation: 'Folders group projects, and IAM grants made on a folder are inherited by every project inside it — including projects created later. Per-project grants must be repeated forever; one project per department throws away isolation; an organization-level grant gives every admin access to every department, which labels do not restrict.',
      tip: '"Same access for a group of projects, now and later" → a folder.'
    },
    {
      id: 'ace-t02',
      topic: 'Resource hierarchy & org policy',
      difficulty: 'medium',
      prompt: 'A new regulation requires that no Google Cloud resources in your organization are created outside Jakarta (asia-southeast2) and Singapore (asia-southeast1). The rule must apply to all current and future projects. What should you do?',
      options: [
        'Set the resource locations organization policy constraint at the organization node, allowing only those two regions.',
        'Set a default compute region of asia-southeast2 in every gcloud configuration and in the Cloud Console preferences.',
        'Create a custom IAM role without the create permissions for other regions and grant it to every user in the organization.',
        'Create a budget alert on every project that notifies the security team when spend appears in any other region.'
      ],
      answer: 0,
      explanation: 'Organization policies restrict what can be configured, whoever is doing it. The `gcp.resourceLocations` constraint set at the organization is inherited by every folder and project. A default region is only a default; IAM permissions are not region-specific; a budget alert reports after the fact and prevents nothing.'
    },
    {
      id: 'ace-t03',
      topic: 'Resource hierarchy & org policy',
      difficulty: 'medium',
      prompt: 'Your company manages 4,000 employees in Microsoft Active Directory, which must remain the source of truth for users and groups. Employees should sign in to Google Cloud with their existing corporate password. What should you do?',
      options: [
        'Use Google Cloud Directory Sync to provision users and groups into Cloud Identity, and configure SAML single sign-on to your identity provider.',
        'Export the Active Directory users to a CSV file each month and upload it to the Google Admin console to create the accounts.',
        'Ask each employee to create a personal Gmail account and add those accounts to the projects they need as IAM principals.',
        'Create one shared Google account per department and give its password to the employees of that department.'
      ],
      answer: 0,
      explanation: 'GCDS synchronises users and groups one way from Active Directory to Cloud Identity, so AD stays authoritative; SAML SSO lets people use their corporate password. Manual CSV uploads drift out of date, personal Gmail accounts are outside company control, and shared accounts break auditing.'
    },
    {
      id: 'ace-t04',
      topic: 'gcloud CLI, APIs & quotas',
      difficulty: 'easy',
      prompt: 'You run `gcloud compute instances create` in a newly created project and receive an error saying the Compute Engine API has not been used in the project before or is disabled. What should you do?',
      options: [
        'Run `gcloud services enable compute.googleapis.com` in the project and retry.',
        'Ask Google Cloud Support to activate Compute Engine for the project.',
        'Grant yourself the Compute Admin role on the project and retry.',
        'Create the VM in another project that already has VMs running.'
      ],
      answer: 0,
      explanation: 'Most services have to be enabled per project before first use. Enabling the API (which needs a linked billing account for paid services) fixes the error; it is not a permission problem and support is not involved.'
    },
    {
      id: 'ace-t05',
      topic: 'gcloud CLI, APIs & quotas',
      difficulty: 'easy',
      prompt: 'You try to create 30 VMs in asia-southeast2 for a load test, and the request fails with a QUOTA_EXCEEDED error for CPUS in that region. The test must run in that region. What should you do?',
      options: [
        'Request a higher CPUS quota for asia-southeast2 from the Quotas page of the project.',
        'Create a second project and spread the VMs across both projects to stay under quota.',
        'Switch every VM to a Spot VM, because Spot VMs do not count against the CPU quota.',
        'Open a billing support case asking for a higher monthly spending limit on the account.'
      ],
      answer: 0,
      explanation: 'Quotas are per project and usually per region. The intended fix is a quota increase request in IAM & Admin → Quotas & system limits. Splitting projects to dodge quota is not the supported path, Spot VMs use quota too (often a separate preemptible quota), and quota is not a billing limit.'
    },
    {
      id: 'ace-t06',
      topic: 'gcloud CLI, APIs & quotas',
      difficulty: 'easy',
      prompt: 'A teammate created a project with the ID `ace-pord-123` instead of `ace-prod-123`. Nothing has been deployed to it yet. How do you end up with the correct project ID?',
      options: [
        'Create a new project with the correct ID and shut down the misspelled one.',
        'Run `gcloud projects update ace-pord-123 --project-id=ace-prod-123`.',
        'Change the project name in the console; the ID follows the name.',
        'Ask Google Cloud Support to rename the project ID for you.'
      ],
      answer: 0,
      explanation: 'A project ID is permanent once the project is created. Only the display name can be changed, and it does not change the ID. Create a new project and delete the wrong one (it stays restorable for 30 days).'
    },
    {
      id: 'ace-t07',
      topic: 'Billing & budgets',
      difficulty: 'easy',
      prompt: 'The finance team needs to see all costs and invoices of the company’s Cloud Billing account. They must not be able to change payment methods or link projects. Which role should you grant them, and where?',
      options: [
        'Billing Account Viewer on the billing account',
        'Billing Account Administrator on the billing account',
        'Project Viewer on every project linked to the account',
        'Billing Account User on the billing account'
      ],
      answer: 0,
      explanation: 'Billing Account Viewer shows costs and transactions with no ability to change anything. Administrator can change payment and users; Billing Account User exists to link projects; Project Viewer does not show billing account invoices.'
    },
    {
      id: 'ace-t08',
      topic: 'Billing & budgets',
      difficulty: 'medium',
      prompt: 'A developer is Owner of several new projects and needs to link them to the company billing account. They should not be able to manage the billing account itself. What should you grant?',
      options: [
        'Billing Account User on the company billing account',
        'Billing Account Administrator on the billing account',
        'Billing Account Viewer on the company billing account',
        'Organization Administrator on the organization node'
      ],
      answer: 0,
      explanation: 'Linking a project needs permission on both sides: on the project (Owner or Project Billing Manager — the developer already has Owner) and on the billing account, where Billing Account User allows linking without managing payments or users. Viewer cannot link; Administrator and Organization Administrator are far broader than needed.'
    },
    {
      id: 'ace-t09',
      topic: 'Billing & budgets',
      difficulty: 'hard',
      prompt: 'Sandbox projects must not spend more than USD 200 a month. When a sandbox project reaches the budget, its billable resources should stop automatically. What should you do?',
      options: [
        'Create a budget with Pub/Sub notifications, and have a Cloud Run function subscribed to the topic disable billing on the project.',
        'Create a budget with an alert threshold at 100%, because Cloud Billing stops the project’s resources when that threshold fires.',
        'Set a hard project quota of USD 200 on the Quotas page so Google Cloud refuses requests beyond that amount for the month.',
        'Grant the developers only Viewer on the sandbox projects so that they cannot create resources that cost money.'
      ],
      answer: 0,
      explanation: 'Budgets only notify; they never stop spending by themselves. Programmatic budget notifications to Pub/Sub, handled by a function that disables billing (or shuts resources down), are the documented way to cap spend. There is no money-based quota, and Viewer would stop developers using the sandbox at all.',
      tip: 'Budget alone = email. Budget + Pub/Sub + code = action.'
    },
    {
      id: 'ace-t10',
      topic: 'Billing & budgets',
      difficulty: 'medium',
      prompt: 'Management wants to analyse a year of Google Cloud spend broken down by the `team` label, using SQL and a dashboard. What should you set up first?',
      options: [
        'Export Cloud Billing data to a BigQuery dataset, then query it and build the dashboard in Looker Studio.',
        'Download the invoice PDF every month and copy the totals for each team into a shared spreadsheet.',
        'Create one billing account per team and compare the account totals in the billing console each month.',
        'Create a log sink of all audit logs to BigQuery and estimate the cost of each logged operation.'
      ],
      answer: 0,
      explanation: 'Billing export to BigQuery records cost per project, service, SKU and label, ready for SQL and dashboards. It is not backfilled, so enable it early. Invoices have no label detail; separate billing accounts are heavy and still give no SQL; audit logs carry no cost data.'
    }
  ],

  access: [
    {
      id: 'ace-t11',
      topic: 'IAM roles & policies',
      difficulty: 'easy',
      prompt: 'Eight data analysts need to run queries on the BigQuery datasets in the `analytics` project. New analysts join every month. You want to follow Google-recommended practices. What should you do?',
      options: [
        'Add the analysts to a Google group and grant the group BigQuery Data Viewer and BigQuery Job User on the project.',
        'Grant each analyst the Editor role on the project so they can run queries and work with every dataset.',
        'Grant each analyst BigQuery Admin individually and remove the grant when they leave the team.',
        'Create a service account for the team and share its JSON key with every analyst who joins.'
      ],
      answer: 0,
      explanation: 'Grant predefined roles to a group: new joiners only need to be added to the group. Data Viewer reads the data and Job User runs queries. Editor and BigQuery Admin are far broader, per-user grants are hard to maintain, and sharing a service account key breaks accountability.'
    },
    {
      id: 'ace-t12',
      topic: 'IAM roles & policies',
      difficulty: 'medium',
      prompt: 'Support engineers must be able to start, stop and list VMs in a project, but not create, delete or modify them. No predefined role matches exactly. What should you do?',
      options: [
        'Create a custom role with compute.instances.start, stop, get and list, and grant it to the engineers’ group on the project.',
        'Grant the engineers the Compute Instance Admin (v1) role on the project and ask them not to delete any VMs.',
        'Create a custom role at the folder level with the instance permissions and grant it on the folder above the project.',
        'Grant the engineers the Viewer role and let them ask the VM owners to start and stop machines when needed.'
      ],
      answer: 0,
      explanation: 'When no predefined role is narrow enough, a custom role with exactly the needed permissions is the least-privilege answer. Custom roles can be created at the organization or project level only — not on folders. Instance Admin can delete VMs; Viewer cannot start or stop them.'
    },
    {
      id: 'ace-t13',
      topic: 'Audit logs, keys & secrets',
      difficulty: 'hard',
      prompt: 'An external auditor needs read-only access to every project in the organization, including the Data Access audit logs. You want to grant the least privilege needed. What should you do?',
      options: [
        'Grant Viewer and Private Logs Viewer to the auditor on the organization node.',
        'Grant Viewer and Logs Viewer to the auditor on the organization node.',
        'Grant Owner to the auditor on the organization node for the audit period.',
        'Grant Viewer and Private Logs Viewer on each project one by one.'
      ],
      answer: 0,
      explanation: 'Data Access audit logs are private: reading them needs Private Logs Viewer (`roles/logging.privateLogViewer`); Logs Viewer does not include them. Granting at the organization covers every current and future project through inheritance. Owner is far too much; per-project grants miss new projects.'
    },
    {
      id: 'ace-t14',
      topic: 'Service accounts',
      difficulty: 'easy',
      prompt: 'An application on a Compute Engine VM must upload files to one Cloud Storage bucket and do nothing else in Google Cloud. What is the most secure setup?',
      options: [
        'Create a service account, grant it Storage Object Creator on that bucket, and attach it to the VM.',
        'Keep the default Compute Engine service account, which has Editor, and set the scope to full access.',
        'Create a service account key with Storage Admin on the project and copy the JSON file onto the VM.',
        'Make the bucket writable by allUsers so the application can upload without any credentials at all.'
      ],
      answer: 0,
      explanation: 'A dedicated service account attached to the VM gets credentials automatically with no key to leak, and a role on the bucket is narrower than one on the project. The default service account often has Editor; a key file is a secret to steal; public write is never acceptable.'
    },
    {
      id: 'ace-t15',
      topic: 'IAM roles & policies',
      difficulty: 'medium',
      prompt: 'A contractor needs Compute Viewer on a project until 31 December, after which access must end automatically. What should you do?',
      options: [
        'Grant the role with an IAM condition whose expression ends access at that date and time.',
        'Grant the role and create a calendar reminder to remove the binding on 31 December.',
        'Create a service account for the contractor that you plan to delete after the contract.',
        'Add the contractor to a group, then delete the whole group when the contract ends.'
      ],
      answer: 0,
      explanation: 'IAM Conditions can limit a binding in time (`request.time < timestamp("…")`), so access expires on its own. The other options rely on someone remembering, or hand a person a service account.'
    },
    {
      id: 'ace-t16',
      topic: 'Service accounts',
      difficulty: 'medium',
      prompt: 'A developer has Compute Instance Admin (v1) on a project. When they create a VM that runs as the service account `app-sa`, the request is denied. What additional role do they need, and where?',
      options: [
        'Service Account User on the app-sa service account',
        'Service Account Admin on the project',
        'Service Account Key Admin on the app-sa service account',
        'Security Admin on the project'
      ],
      answer: 0,
      explanation: 'Attaching a service account to a resource lets the resource act as it, so the person needs `iam.serviceAccounts.actAs` — Service Account User — on that service account. Admin or Key Admin give far more power (creating accounts or keys) and are not what is checked.'
    },
    {
      id: 'ace-t17',
      topic: 'IAM roles & policies',
      difficulty: 'easy',
      prompt: 'Which two practices follow the principle of least privilege? (Choose two.)',
      options: [
        'Grant roles to Google groups instead of to individual users.',
        'Prefer predefined roles over the basic Owner, Editor and Viewer roles.',
        'Give team leads the Owner role so they can unblock their own team.',
        'Download a service account key for every developer on the team.',
        'Grant every role at the organization level to keep policies in one place.'
      ],
      answer: [0, 1],
      explanation: 'Groups keep grants consistent and easy to remove, and predefined roles are scoped to one service. Owner for convenience, a key per developer, and organization-wide grants all give more access than the work needs.'
    },
    {
      id: 'ace-t18',
      topic: 'Audit logs, keys & secrets',
      difficulty: 'medium',
      prompt: 'Security wants to stop anyone in the organization from creating service account keys, because leaked keys have caused incidents. What should you do?',
      options: [
        'Enforce the organization policy constraint iam.disableServiceAccountKeyCreation at the organization.',
        'Remove the Service Account Key Admin role from all users, and check the IAM policies each week.',
        'Delete the existing keys and ask all developers to sign a policy saying they will not make new ones.',
        'Rotate every existing service account key every 90 days with a scheduled Cloud Run job.'
      ],
      answer: 0,
      explanation: 'The `iam.disableServiceAccountKeyCreation` constraint blocks key creation for everyone below where it is enforced, including project Owners. Removing one role misses Owners and Editors; a signed policy and rotation do not prevent creation.'
    },
    {
      id: 'ace-t19',
      topic: 'IAM roles & policies',
      difficulty: 'medium',
      prompt: 'The operations group needs SSH access with sudo to every Linux VM in a project. When someone leaves the group, their access must end immediately without touching each VM. What should you do?',
      options: [
        'Enable OS Login in project metadata and grant the group the Compute OS Admin Login role.',
        'Add each engineer’s public SSH key to project metadata and remove it when they leave.',
        'Enable OS Login and grant the group the Compute OS Login role on the project.',
        'Create a shared Linux user on each VM and rotate its password whenever someone leaves.'
      ],
      answer: 0,
      explanation: 'OS Login ties Linux accounts to IAM, so removing someone from the group removes their access everywhere at once. Compute OS Admin Login includes sudo; Compute OS Login does not. Metadata keys and shared accounts need manual clean-up and break auditing.'
    }
  ],

  planning: [
    {
      id: 'ace-t20',
      topic: 'Choosing compute',
      difficulty: 'easy',
      prompt: 'You have a stateless REST API packaged as a container. Traffic is near zero at night and spikes during promotions. The team does not want to manage servers or clusters, and wants to pay nothing when idle. Which service should you use?',
      options: ['Cloud Run', 'Compute Engine managed instance group', 'GKE Standard cluster', 'App Engine flexible environment'],
      answer: 0,
      explanation: 'Cloud Run runs containers without infrastructure, scales with requests, and scales to zero. A MIG and GKE Standard need capacity you manage; App Engine flexible always keeps at least one instance running.'
    },
    {
      id: 'ace-t21',
      topic: 'Choosing compute',
      difficulty: 'easy',
      prompt: 'A legacy application runs only on a specific Windows Server version, needs a third-party kernel driver, and uses licences tied to the OS. You are moving it to Google Cloud with minimal changes. Which service should you use?',
      options: ['Compute Engine', 'Cloud Run', 'GKE Autopilot', 'Cloud Run functions'],
      answer: 0,
      explanation: 'Only Compute Engine gives control of the operating system and drivers — a classic lift-and-shift. The serverless and Autopilot options do not let you install kernel drivers or choose the host OS.'
    },
    {
      id: 'ace-t22',
      topic: 'Choosing compute',
      difficulty: 'medium',
      prompt: 'A nightly video-rendering batch takes four hours on 50 VMs. Each frame can be re-rendered if a VM disappears. You want the lowest cost. What should you do?',
      options: [
        'Run the job in a managed instance group of Spot VMs created from an instance template.',
        'Buy a three-year committed use discount for 50 standard VMs and run the job on them.',
        'Run the job on 50 standard VMs and rely on sustained use discounts to lower the bill.',
        'Run the job on a single large memory-optimised VM so that only one machine is billed.'
      ],
      answer: 0,
      explanation: 'Spot VMs are the cheapest compute for fault-tolerant work, and a MIG recreates them after preemption. A commitment pays for 24 hours a day for a 4-hour job; sustained use discounts are small for short runs; one large VM changes the job’s design and is not cheaper.'
    },
    {
      id: 'ace-t23',
      topic: 'Compute Engine',
      difficulty: 'medium',
      prompt: 'Profiling shows your application needs 6 vCPUs and 20 GB of memory. The closest predefined machine types waste a lot of either CPU or memory. What should you do?',
      options: [
        'Create the VM with a custom machine type of 6 vCPUs and 20 GB of memory.',
        'Use the next larger predefined type and accept the unused CPU and memory.',
        'Use two smaller VMs behind an internal load balancer instead of one VM.',
        'Use a memory-optimised M-series machine type, which can be any size.'
      ],
      answer: 0,
      explanation: 'Custom machine types let you choose vCPUs and memory exactly (for example `--custom-cpu=6 --custom-memory=20GB`), so you pay only for what the workload needs. M-series are fixed large shapes; splitting the app changes its architecture.'
    },
    {
      id: 'ace-t24',
      topic: 'Compute Engine',
      difficulty: 'medium',
      prompt: 'You try to create a VM with an attached NVIDIA L4 GPU, and the request fails because the on-host maintenance setting is not supported. What should you change?',
      options: [
        'Set the maintenance policy to TERMINATE and keep automatic restart enabled.',
        'Set the maintenance policy to MIGRATE so the GPU moves during maintenance.',
        'Disable automatic restart and leave the maintenance policy at its default.',
        'Change the provisioning model from STANDARD to SPOT and keep the policy.'
      ],
      answer: 0,
      explanation: 'VMs with attached GPUs generally cannot live-migrate, so on-host maintenance must be TERMINATE; automatic restart brings the VM back after maintenance. MIGRATE is exactly what is unsupported; Spot does not change the requirement.'
    },
    {
      id: 'ace-t25',
      topic: 'Choosing storage & databases',
      difficulty: 'medium',
      prompt: 'A self-managed database runs on a Compute Engine VM in asia-southeast2-a. If that zone fails, you must be able to bring the database up in another zone of the same region with no data loss. What disk should you use?',
      options: [
        'A regional persistent disk replicated to a second zone',
        'A zonal SSD persistent disk with daily snapshots',
        'A Local SSD with a RAID 1 copy on a second Local SSD',
        'A Cloud Storage bucket mounted on the VM with FUSE'
      ],
      answer: 0,
      explanation: 'A regional persistent disk (or Hyperdisk Balanced High Availability) writes synchronously to two zones, so a standby VM in the other zone can attach it with no data lost. Daily snapshots lose up to a day; Local SSD is lost with the VM; Cloud Storage FUSE is not suitable for a database.'
    },
    {
      id: 'ace-t26',
      topic: 'Choosing storage & databases',
      difficulty: 'hard',
      prompt: 'A database on a C3 VM needs 60,000 IOPS but only 500 GB of space. The IOPS need will change over the year, and you want to adjust performance without resizing the disk or restarting the VM. What should you use?',
      options: [
        'Hyperdisk Extreme with provisioned IOPS that you adjust as the load changes',
        'An SSD persistent disk sized large enough to reach 60,000 IOPS',
        'A balanced persistent disk with several replicas attached to the VM',
        'A standard persistent disk striped across several smaller disks'
      ],
      answer: 0,
      explanation: 'Hyperdisk provisions IOPS and throughput separately from capacity and lets you change them while the disk is in use. A persistent disk’s performance scales with its size, so you would pay for space you do not need; balanced and standard disks cannot reach the target this way.'
    },
    {
      id: 'ace-t27',
      topic: 'GKE',
      difficulty: 'easy',
      prompt: 'Your team wants to run containerised microservices on Kubernetes but does not want to manage nodes, node pools or upgrades, and wants to pay for the resources the Pods request. Which option should you choose?',
      options: ['GKE Autopilot cluster', 'GKE Standard zonal cluster', 'Kubernetes on Compute Engine VMs', 'GKE Standard cluster with Spot nodes'],
      answer: 0,
      explanation: 'Autopilot manages the nodes for you and bills on Pod resource requests. Standard clusters, with or without Spot nodes, bill per node and leave node management to you; self-managed Kubernetes is the most work of all.'
    },
    {
      id: 'ace-t28',
      topic: 'GKE',
      difficulty: 'medium',
      prompt: 'A GKE Standard cluster runs a business-critical application. The Kubernetes API and the workloads must stay available if one zone in the region goes down. How should you create the cluster?',
      options: [
        'As a regional cluster, so the control plane and nodes are replicated across the zones of the region',
        'As a zonal cluster with a large node pool and the cluster autoscaler turned on for every pool',
        'As a multi-zonal cluster with nodes in three zones and the control plane in a single zone',
        'As two zonal clusters in the same zone, with a load balancer splitting traffic between them'
      ],
      answer: 0,
      explanation: 'A regional cluster replicates the control plane and nodes across three zones. A zonal or multi-zonal cluster has one control plane in one zone, so a zone outage takes the API down; two clusters in one zone share that zone’s fate.'
    },
    {
      id: 'ace-t29',
      topic: 'GKE',
      difficulty: 'medium',
      prompt: 'You created a GKE cluster with private nodes. Pods fail with ImagePullBackOff when pulling a public image from Docker Hub, while images from Artifact Registry work. What should you do?',
      options: [
        'Configure Cloud NAT for the cluster’s subnet so nodes can reach the internet.',
        'Give every node an external IP address by recreating the node pool.',
        'Add the Docker Hub IP ranges to the control plane authorized networks.',
        'Grant the node service account the Artifact Registry Reader role.'
      ],
      answer: 0,
      explanation: 'Private nodes have no external IPs, so they reach the internet only through Cloud NAT. Artifact Registry works because Private Google Access reaches Google APIs. Authorized networks control who reaches the control plane, not node egress; external IPs defeat the point of private nodes.'
    },
    {
      id: 'ace-t30',
      topic: 'GKE',
      difficulty: 'medium',
      prompt: 'You are deploying a three-replica database on GKE. Each replica needs a stable network identity and its own persistent disk that stays with it if the Pod is rescheduled. Which object should you use?',
      options: [
        'A StatefulSet with volumeClaimTemplates and a headless Service',
        'A Deployment with three replicas sharing one PersistentVolumeClaim',
        'A DaemonSet that runs one database Pod on each of the cluster nodes',
        'A Job with three completions and an emptyDir volume for each Pod'
      ],
      answer: 0,
      explanation: 'A StatefulSet gives Pods stable names (db-0, db-1, db-2) and, through volumeClaimTemplates, one PersistentVolumeClaim per Pod that follows it. A Deployment’s replicas are interchangeable; a DaemonSet follows nodes; emptyDir is deleted with the Pod.'
    },
    {
      id: 'ace-t31',
      topic: 'GKE',
      difficulty: 'easy',
      prompt: 'You created a Docker repository in Artifact Registry in asia-southeast2. On your workstation, `docker push asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v1` fails with an authentication error. What should you run first?',
      options: [
        '`gcloud auth configure-docker asia-southeast2-docker.pkg.dev`',
        '`gcloud container clusters get-credentials web --region=asia-southeast2`',
        '`docker login gcr.io` with your Google account password',
        '`gcloud services enable containerregistry.googleapis.com`'
      ],
      answer: 0,
      explanation: '`gcloud auth configure-docker HOST` registers gcloud as Docker’s credential helper for that registry host. get-credentials configures kubectl, not Docker; gcr.io and the Container Registry API belong to the retired Container Registry.'
    },
    {
      id: 'ace-t32',
      topic: 'Cloud Run, App Engine & Functions',
      difficulty: 'easy',
      prompt: 'Every time a user uploads an image to a Cloud Storage bucket, a thumbnail must be created. You want the least code and no servers to manage. What should you do?',
      options: [
        'Deploy a Cloud Run function triggered by the object finalize event of the bucket.',
        'Run a cron job on a Compute Engine VM that lists the bucket every minute.',
        'Create a GKE CronJob that copies new objects to a second bucket each hour.',
        'Ask users to call a thumbnail API on a VM after each upload completes.'
      ],
      answer: 0,
      explanation: 'An event-driven function (through Eventarc on `google.cloud.storage.object.v1.finalized`) runs only when a file arrives and needs no servers. Polling from a VM or a CronJob wastes resources and adds delay; relying on users is fragile.'
    },
    {
      id: 'ace-t33',
      topic: 'Cloud Run, App Engine & Functions',
      difficulty: 'medium',
      prompt: 'An order service must notify three downstream services — billing, shipping and email — and each must receive every order. The services should be decoupled so that one being slow does not affect the others. What should you do?',
      options: [
        'Publish orders to one Pub/Sub topic and create a separate subscription for each downstream service.',
        'Publish orders to one Pub/Sub topic with a single subscription that all three services pull from.',
        'Have the order service call the three services’ HTTP endpoints one after the other for each order.',
        'Write each order to a Cloud Storage bucket and have the three services poll the bucket every minute.'
      ],
      answer: 0,
      explanation: 'Each subscription receives every message, so one subscription per consumer gives fan-out, and a slow consumer only builds its own backlog. Several consumers on one subscription share the messages, so each order reaches only one of them; synchronous calls couple the services; polling a bucket is slow and wasteful.'
    },
    {
      id: 'ace-t34',
      topic: 'Cloud Run, App Engine & Functions',
      difficulty: 'hard',
      prompt: 'You create an Eventarc trigger that sends Cloud Storage object-finalized events to a Cloud Run service. Creating the trigger fails with an error that the Cloud Storage service agent lacks a permission. What should you do?',
      options: [
        'Grant the project’s Cloud Storage service agent the Pub/Sub Publisher role on the project.',
        'Grant the Cloud Run service’s runtime account the Storage Object Viewer role on the bucket.',
        'Make the Cloud Run service public by granting the Cloud Run Invoker role to allUsers.',
        'Grant your own user account the Eventarc Admin role and then create the trigger again.'
      ],
      answer: 0,
      explanation: 'Cloud Storage events are delivered through Pub/Sub, so the Cloud Storage service agent (`service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com`) needs `roles/pubsub.publisher`. The trigger’s own service account separately needs Eventarc Event Receiver and Cloud Run Invoker; making the service public is not required.'
    },
    {
      id: 'ace-t35',
      topic: 'Choosing compute',
      difficulty: 'medium',
      prompt: 'Your research team is training a very large transformer model written in JAX. Training time and cost matter most, and the code has no CUDA dependencies. Which accelerator should you choose?',
      options: ['Cloud TPU', 'NVIDIA L4 GPUs on G2 VMs', 'Compute-optimised C2 VMs', 'Memory-optimised M3 VMs'],
      answer: 0,
      explanation: 'TPUs are built for the large matrix operations of training big models in JAX, TensorFlow or PyTorch/XLA and are usually the most cost-effective choice there. GPUs suit CUDA code and general workloads; L4 is aimed at inference; CPU-only machines are far slower for training.'
    },
    {
      id: 'ace-t36',
      topic: 'Choosing compute',
      difficulty: 'easy',
      prompt: 'Developers need ready-to-use, consistent development environments that run inside your VPC and can be opened in a browser. Source code must not be stored on their laptops. Which product should you use?',
      options: ['Cloud Workstations', 'Cloud Shell', 'A shared Compute Engine VM', 'Agent Runtime'],
      answer: 0,
      explanation: 'Cloud Workstations provides managed development environments from admin-defined configurations, inside your VPC, opened in the browser or a local IDE. Cloud Shell is a personal temporary shell outside your VPC; a shared VM is not consistent or isolated; Agent Runtime hosts AI agents.'
    }
  ],

  operating: [
    {
      id: 'ace-t37',
      topic: 'Monitoring & logging',
      difficulty: 'easy',
      prompt: 'Cloud Monitoring shows CPU usage for your Compute Engine VMs, but you cannot find memory or disk-space metrics, and the application logs are missing. What should you do?',
      options: [
        'Install the Ops Agent on the VMs.',
        'Enable the Cloud Monitoring API again.',
        'Grant yourself the Monitoring Admin role.',
        'Restart the VMs to refresh their metrics.'
      ],
      answer: 0,
      explanation: 'The hypervisor sees CPU, network and disk I/O, but memory, disk usage and application logs come from inside the guest, collected by the Ops Agent. Permissions, the API and restarts do not add metrics that nothing collects.'
    },
    {
      id: 'ace-t38',
      topic: 'Managing VMs & instance groups',
      difficulty: 'medium',
      prompt: 'Your VMs have no external IP addresses. Administrators must SSH to them from the internet without a bastion host or VPN. Which two steps are needed? (Choose two.)',
      options: [
        'Create a firewall rule that allows ingress on tcp:22 from 35.235.240.0/20.',
        'Grant the administrators the IAP-secured Tunnel User role.',
        'Assign an ephemeral external IP to each VM during maintenance.',
        'Create a firewall rule that allows tcp:22 from 0.0.0.0/0.',
        'Enable Private Google Access on the subnet of the VMs.'
      ],
      answer: [0, 1],
      explanation: 'IAP TCP forwarding (`gcloud compute ssh --tunnel-through-iap`) reaches VMs on their internal IPs. It needs a firewall rule from IAP’s range 35.235.240.0/20 and the IAP-secured Tunnel User role. External IPs and 0.0.0.0/0 expose the VMs; Private Google Access is for reaching Google APIs.'
    },
    {
      id: 'ace-t39',
      topic: 'Managing VMs & instance groups',
      difficulty: 'easy',
      prompt: 'You must back up the data disks of 20 VMs every day and keep the backups for 14 days, with the least administrative effort. What should you do?',
      options: [
        'Create a snapshot schedule with 14-day retention and attach it to the disks.',
        'Write a cron job on each VM that runs gcloud to snapshot its own disk daily.',
        'Create a custom image of every disk each night and delete images after 14 days.',
        'Create a machine image of each VM every week and keep the last two of them.'
      ],
      answer: 0,
      explanation: 'A snapshot schedule is a resource policy that takes snapshots and deletes them after the retention period automatically. Cron jobs must be maintained on every VM, images are not meant for backups, and weekly machine images miss the daily requirement.'
    },
    {
      id: 'ace-t40',
      topic: 'Managing VMs & instance groups',
      difficulty: 'medium',
      prompt: 'The 200 GB data disk of a production VM is almost full. You need more space without stopping the VM. What should you do?',
      options: [
        'Resize the disk with gcloud compute disks resize, then grow the file system inside the VM.',
        'Stop the VM, create a larger disk from a snapshot, and attach it in place of the old disk.',
        'Resize the disk with gcloud compute disks resize; the file system grows automatically.',
        'Create a new VM with a larger disk and move the application to it during a maintenance window.'
      ],
      answer: 0,
      explanation: 'Persistent disks can be enlarged while attached and in use, but the partition and file system must then be extended (for example `resize2fs` or `xfs_growfs`). Stopping or replacing the VM is unnecessary downtime. Disks can be grown, never shrunk.'
    },
    {
      id: 'ace-t41',
      topic: 'Managing VMs & instance groups',
      difficulty: 'medium',
      prompt: 'You want an exact copy of a VM — both of its disks, its machine type and its metadata — to create a clone for testing. What should you create?',
      options: ['A machine image of the VM', 'A snapshot of the boot disk', 'A custom image of the boot disk', 'An instance template from the VM'],
      answer: 0,
      explanation: 'A machine image captures all of a VM’s disks together with its configuration. A snapshot or custom image covers one disk; an instance template holds configuration but no disk data.'
    },
    {
      id: 'ace-t42',
      topic: 'Managing VMs & instance groups',
      difficulty: 'hard',
      prompt: 'A regional managed instance group of 6 VMs serves production traffic. You must move it to a new image without reducing serving capacity at any point. What should you do?',
      options: [
        'Create a new instance template with the new image and start a rolling update with max unavailable 0 and max surge 3.',
        'Edit the existing instance template to use the new image; the MIG then picks it up for every VM automatically.',
        'Create a new template and start a rolling update with max unavailable 3 and max surge 0 to finish faster.',
        'Delete the VMs one by one in the console and let autohealing recreate each one with the new image.'
      ],
      answer: 0,
      explanation: 'Instance templates are immutable, so a change needs a new template and a rolling update. Max unavailable 0 keeps every existing VM serving while surge VMs come up first. Max unavailable 3 removes half the capacity; deleting VMs by hand reduces capacity and recreates them from the old template.'
    },
    {
      id: 'ace-t43',
      topic: 'Managing VMs & instance groups',
      difficulty: 'hard',
      prompt: 'After you enable autohealing on a MIG, its VMs are deleted and recreated in a loop. The application takes about three minutes to start, and the health check’s initial delay is 30 seconds. What should you do?',
      options: [
        'Increase the autohealing initial delay to longer than the application’s startup time.',
        'Disable the health check so the MIG stops judging the VMs that are starting.',
        'Increase the MIG target size so that more VMs are healthy at the same time.',
        'Switch the MIG from a regional group to a zonal group in a single zone.'
      ],
      answer: 0,
      explanation: 'The initial delay tells the MIG to wait before acting on health checks. At 30 seconds every VM is judged unhealthy while still starting and recreated. Also check that a firewall rule allows the health check ranges 35.191.0.0/16 and 130.211.0.0/22. More VMs or another location does not fix the timing.'
    },
    {
      id: 'ace-t44',
      topic: 'Managing GKE',
      difficulty: 'medium',
      prompt: 'On a GKE Standard cluster, new Pods stay Pending with the event "0/3 nodes are available: insufficient cpu" during traffic peaks. You want nodes added and removed automatically. What should you do?',
      options: [
        'Enable the cluster autoscaler on the node pool with suitable minimum and maximum node counts.',
        'Create a Horizontal Pod Autoscaler for the Deployment so that it adds more replicas at peaks.',
        'Create a Vertical Pod Autoscaler that raises the CPU requests of the Pods that are Pending.',
        'Manually resize the node pool to twice its size before each expected traffic peak.'
      ],
      answer: 0,
      explanation: 'Pending Pods with insufficient CPU mean the nodes are full; the cluster autoscaler adds nodes when Pods cannot be scheduled and removes them when they are underused. HPA would add even more Pods that cannot be scheduled, VPA raises requests (making it worse), and manual resizing is not automatic.'
    },
    {
      id: 'ace-t45',
      topic: 'Managing GKE',
      difficulty: 'easy',
      prompt: 'You want the `web` Deployment to run between 2 and 10 replicas, keeping average CPU utilisation around 60% of the Pods’ requests. Which command should you run?',
      options: [
        '`kubectl autoscale deployment web --cpu-percent=60 --min=2 --max=10`',
        '`kubectl scale deployment web --replicas=10`',
        '`gcloud container clusters update web --enable-autoscaling --max-nodes=10`',
        '`kubectl rollout restart deployment web`'
      ],
      answer: 0,
      explanation: '`kubectl autoscale` creates a Horizontal Pod Autoscaler that adjusts replicas to the target utilisation. `kubectl scale` sets a fixed count, the gcloud command scales nodes rather than Pods, and a rollout restart only restarts the Pods.'
    },
    {
      id: 'ace-t46',
      topic: 'Managing GKE',
      difficulty: 'easy',
      prompt: 'A new image version rolled out to the `web` Deployment is returning errors. You need to return to the previous version as quickly as possible. What should you run?',
      options: [
        '`kubectl rollout undo deployment/web`',
        '`kubectl delete deployment web`',
        '`kubectl scale deployment web --replicas=0`',
        '`gcloud container clusters upgrade --rollback`'
      ],
      answer: 0,
      explanation: '`kubectl rollout undo` returns the Deployment to its previous revision with a rolling update. Deleting or scaling to zero causes an outage, and cluster upgrades are unrelated to application versions.'
    },
    {
      id: 'ace-t47',
      topic: 'Serverless operations',
      difficulty: 'medium',
      prompt: 'Revision `shop-00007` of a Cloud Run service is serving 100% of traffic. You have deployed `shop-00008` and want to send it 10% of users while you watch error rates. What should you run?',
      options: [
        '`gcloud run services update-traffic shop --to-revisions=shop-00008=10,shop-00007=90`',
        '`gcloud run deploy shop --max-instances=10` to cap the new revision',
        '`gcloud run services update shop --concurrency=10` on the service',
        '`gcloud run revisions delete shop-00007` to let the new one take over'
      ],
      answer: 0,
      explanation: 'Traffic splitting between revisions is done with `update-traffic --to-revisions` (or `--to-tags`). Max instances and concurrency control scaling, not who gets which version; deleting the old revision removes your rollback path and sends everyone to the new one.'
    },
    {
      id: 'ace-t48',
      topic: 'Serverless operations',
      difficulty: 'medium',
      prompt: 'You want to deploy a new version of a Cloud Run service and test it at its own URL before any user traffic reaches it. What should you do?',
      options: [
        'Deploy with `--no-traffic --tag=green` and test the tagged URL.',
        'Deploy normally and roll back if the new version has problems.',
        'Deploy with `--min-instances=0` so that no instance takes traffic.',
        'Deploy the new version as a separate service in another project.'
      ],
      answer: 0,
      explanation: '`--no-traffic` leaves all traffic on the current revision, and a tag gives the new revision its own URL (`https://green---shop-….run.app`). When it passes, move traffic to it with `update-traffic`. A normal deploy sends traffic immediately; min instances does not route traffic.'
    },
    {
      id: 'ace-t49',
      topic: 'Serverless operations',
      difficulty: 'hard',
      prompt: 'During a traffic spike, your Cloud Run service scales out quickly and the Cloud SQL database begins rejecting connections with "too many connections". Each instance opens a pool of 10 connections. What should you change first?',
      options: [
        'Set a maximum number of instances so instances × pool size stays below the database connection limit.',
        'Set a minimum number of instances so that more instances are ready before the traffic spike arrives.',
        'Lower the request timeout of the service so that each request releases its connection sooner.',
        'Move the service to a region farther from the database so that connections open more slowly.'
      ],
      answer: 0,
      explanation: 'Every new instance opens its own pool, so unbounded scale-out exhausts the database. Capping max instances (and if needed raising concurrency per instance) keeps total connections under the limit. Min instances adds connections; timeouts and distance do not bound the count.'
    },
    {
      id: 'ace-t50',
      topic: 'Serverless operations',
      difficulty: 'medium',
      prompt: 'A Cloud Run service processes messages from a Pub/Sub push subscription. Occasionally the same order is processed twice, and customers are charged twice. What should you do?',
      options: [
        'Make the handler idempotent, for example by recording processed message IDs and skipping duplicates.',
        'Lower the subscription’s acknowledgement deadline so that Pub/Sub waits less before it redelivers.',
        'Create a second subscription on the same topic and have the service read from both of them.',
        'Increase the message retention period of the topic from 7 days to 31 days to avoid losing orders.'
      ],
      answer: 0,
      explanation: 'Pub/Sub delivers at least once, so duplicates can happen — for example when an ack is late. The handler must be idempotent. A shorter ack deadline causes more redelivery; a second subscription doubles every message; retention has nothing to do with duplicates.'
    }
  ]
};
