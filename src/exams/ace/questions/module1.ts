/**
 * Module 1 try-out — Cloud Foundations & Environment Setup (exam guide
 * Section 1). 100 questions: regions, zones and the CLI; the resource
 * hierarchy and organization policies; project setup, APIs and quotas;
 * Cloud Identity, IAM basics and Workforce Identity Federation; billing,
 * observability provisioning, Cloud Asset Inventory and Gemini Cloud Assist.
 * Dealt into five sets of 20 in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const module1: ModuleQuestion[] = [
  // ── Regions, zones, Cloud Shell and the gcloud CLI ──
  {
    id: 'ace-m1-001',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You are planning a deployment in Jakarta and need the names of every zone in the asia-southeast2 region for a script. Which command lists them?',
    options: [
      '`gcloud compute zones list --filter="region:asia-southeast2"`',
      '`gcloud compute zones describe asia-southeast2`',
      '`gcloud compute regions list --zones=asia-southeast2`',
      '`gcloud config list compute/zones --region=asia-southeast2`'
    ],
    answer: 0,
    explanation: '`gcloud compute zones list` with a region filter prints the zones (asia-southeast2-a, -b and -c) and their status. `zones describe` takes a single zone name, `regions list` has no --zones flag, and `gcloud config list` shows local settings, not Google Cloud resources.'
  },
  {
    id: 'ace-m1-002',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'Before migrating, you must confirm that C3 machine types are offered in the zone asia-southeast2-b. What is the most direct check?',
    options: [
      '`gcloud compute machine-types list --filter="zone:asia-southeast2-b AND name~^c3-"`',
      '`gcloud compute regions describe asia-southeast2` and read the CPUS quota for the region',
      'Create a test VM in every zone and keep the zones where the creation succeeds',
      '`gcloud services list --available --filter="name~c3"` in the project'
    ],
    answer: 0,
    explanation: 'Machine types are listed per zone, so filtering by zone and name shows exactly which C3 shapes exist there (the regions and zones page in the documentation shows the same). A quota says how much you may use, not what is offered; trial VMs waste time and money; services list shows APIs, not machine types.'
  },
  {
    id: 'ace-m1-003',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A team wants NVIDIA L4 GPUs in Jakarta. How can they find which zones offer this accelerator?',
    options: [
      '`gcloud compute accelerator-types list --filter="name=nvidia-l4 AND zone~asia-southeast2"`',
      '`gcloud compute machine-types list --filter="gpu=nvidia-l4"`',
      '`gcloud compute regions describe asia-southeast2 --format="value(gpus)"`',
      '`gcloud compute zones list --filter="accelerators:nvidia-l4"`'
    ],
    answer: 0,
    explanation: 'Accelerator types are listed per zone by `gcloud compute accelerator-types list`; the zones in the output are where that GPU can be used. Machine types and zones have no GPU field to filter on, and a region description shows quotas rather than accelerator availability. The project’s GPU quota in the region must also be raised before use.'
  },
  {
    id: 'ace-m1-004',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Regulations require customer data to stay in Indonesia, and the application must keep running if one data centre fails. Where should you place the VMs?',
    options: [
      'In two or more zones of asia-southeast2, in a regional managed instance group',
      'In a single zone of asia-southeast2, on a larger machine type with live migration',
      'In asia-southeast2 and asia-southeast1, so that a whole region can fail over',
      'In one zone of asia-southeast2, with a nightly snapshot copied to another region'
    ],
    answer: 0,
    explanation: 'A zone is roughly one data centre; spreading VMs across zones of the Jakarta region survives a zone failure while the data stays in Indonesia. A single zone fails with its zone, Singapore is outside Indonesia, and nightly snapshots copied to another region both lose data and leave the country.'
  },
  {
    id: 'ace-m1-005',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You are comparing regions for a new workload. Which two statements should shape your choice? (Choose two.)',
    options: [
      'The same resource can cost a different amount in different regions.',
      'Not every product, machine series and accelerator is offered in every region.',
      'Every region has exactly two zones, so zonal redundancy is the same everywhere.',
      'Global resources such as VPC networks must be created in us-central1.',
      'A project can only hold resources in the region chosen when it was created.'
    ],
    answer: [0, 1],
    explanation: 'Prices differ by region, and product, machine-series and accelerator availability varies, so both belong in the decision next to latency and data residency. Regions usually have three or more zones, global resources are not tied to a region, and a project can hold resources in any region.'
  },
  {
    id: 'ace-m1-006',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'A new team member’s locked-down laptop cannot install software, but they must run gcloud and kubectl commands against your project today. What is the quickest option?',
    options: [
      'Open Cloud Shell from the console; gcloud and kubectl are already installed and signed in.',
      'Create a Compute Engine VM, install the Google Cloud CLI on it, and connect over SSH.',
      'Ask IT to approve installing the Google Cloud CLI, and use the console until they do.',
      'Use the console only, because kubectl commands cannot run from a browser session.'
    ],
    answer: 0,
    explanation: 'Cloud Shell is a browser terminal on a temporary VM with gcloud, kubectl, Terraform and other tools preinstalled, already authenticated as you, with a 5 GB persistent home directory. A VM works but needs setup, waiting for IT misses "today", and kubectl does run in Cloud Shell.'
  },
  {
    id: 'ace-m1-007',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A developer returns after five months away and finds that their Cloud Shell home directory has been reset and their scripts are gone. What is the most likely reason?',
    options: [
      'Cloud Shell removes a home directory after about 120 days without use.',
      'Cloud Shell clears every home directory at the start of each month.',
      'The project’s Cloud Shell quota ran out and the disk was recycled.',
      'Their account lost the Owner role, which Cloud Shell requires.'
    ],
    answer: 0,
    explanation: 'The 5 GB home disk persists between sessions, but if Cloud Shell is not used for about 120 days the home directory can be deleted (Google sends a warning email first). Keep important files in source control or Cloud Storage. Cloud Shell is per user and does not depend on project roles or monthly resets.'
  },
  {
    id: 'ace-m1-008',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'Your Python code uses the Google Cloud client libraries on your workstation. gcloud commands work, but the code fails with "Could not automatically determine credentials". What should you run?',
    options: [
      '`gcloud auth application-default login`',
      '`gcloud auth login --no-launch-browser`',
      '`gcloud init --skip-diagnostics`',
      '`gcloud config set account you@example.com`'
    ],
    answer: 0,
    explanation: 'Client libraries look for Application Default Credentials (ADC). `gcloud auth application-default login` stores ADC for your user, while `gcloud auth login` only authorises the gcloud CLI itself. On Google Cloud resources, ADC comes from the attached service account instead.'
  },
  {
    id: 'ace-m1-009',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Before running a script that deletes test VMs, you want to confirm which project your current gcloud configuration points to. Which command shows it?',
    options: [
      '`gcloud config get-value project`',
      '`gcloud projects list --active`',
      '`gcloud auth list --project`',
      '`gcloud compute project-info get`'
    ],
    answer: 0,
    explanation: '`gcloud config get-value project` prints the project of the active configuration (`gcloud config list` shows every property). `projects list` lists all projects you can see, `auth list` shows signed-in accounts, and there is no `project-info get` command.'
  },
  {
    id: 'ace-m1-010',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A script needs only the names of the VMs that are currently running, one per line. Which command produces that output?',
    options: [
      '`gcloud compute instances list --filter="status=RUNNING" --format="value(name)"`',
      '`gcloud compute instances list --status=RUNNING --names-only`',
      '`gcloud compute instances describe --all --filter=RUNNING`',
      '`gcloud compute instances list --format=names --where="RUNNING"`'
    ],
    answer: 0,
    explanation: '`--filter` keeps the matching resources and `--format="value(name)"` prints just that field without headers, which suits scripts. The other flags do not exist, and `describe` works on one named instance.'
  },
  {
    id: 'ace-m1-011',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'A CI job runs `gcloud compute instances delete` and hangs waiting for an answer to "Do you want to continue (Y/n)?". What should you add to the command?',
    options: ['`--quiet`', '`--async`', '`--no-user-output-enabled`', '`--verbosity=none`'],
    answer: 0,
    explanation: '`--quiet` (or `-q`) turns off interactive prompts and accepts the defaults, which unattended scripts need. `--async` only returns before the operation finishes, and the other flags change output, not prompting.'
  },
  {
    id: 'ace-m1-012',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'On a workstation where the Google Cloud CLI was installed with the standalone installer, a `gcloud beta` command fails because the beta command group is missing. What should you do?',
    options: [
      'Run `gcloud components install beta`.',
      'Run `gcloud services enable beta.googleapis.com`.',
      'Run `gcloud init --enable-beta` and sign in again.',
      'Reinstall the CLI with the beta option turned on.'
    ],
    answer: 0,
    explanation: 'Release tracks such as alpha and beta are installable components of the CLI (`gcloud components install beta`; `gcloud components update` brings everything up to date). They are not APIs. Where the CLI came from a package manager such as apt, as in Cloud Shell, install the matching package instead.'
  },
  {
    id: 'ace-m1-013',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You reserved a static external IP address in asia-southeast2 for a new global external Application Load Balancer, but the address does not appear when you create the frontend. Why?',
    options: [
      'A global external Application Load Balancer needs a global static address, created with --global.',
      'Static addresses must be promoted from ephemeral ones before a load balancer can use them.',
      'The address must first be attached to a VM in the region before a load balancer takes it over.',
      'External addresses for load balancers can only be reserved in the us-central1 region.'
    ],
    answer: 0,
    explanation: 'Global load balancers use global anycast addresses (`gcloud compute addresses create NAME --global`); regional addresses are for regional resources such as VMs and regional load balancers. Promotion is just one way to get a static address, and nothing has to be attached first.'
  },
  {
    id: 'ace-m1-014',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Which of these Google Cloud resources is regional?',
    options: ['A VPC subnet', 'A VPC network', 'A Compute Engine VM', 'A custom image'],
    answer: 0,
    explanation: 'Subnets belong to one region. VPC networks and images are global, and a VM lives in a single zone. Knowing a resource’s scope tells you what an outage takes down and where the resource can be used.'
  },
  {
    id: 'ace-m1-015',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You want to edit a Terraform file in the browser with syntax highlighting and then run it, without setting anything up locally. What should you use?',
    options: [
      'The Cloud Shell Editor, opened from Cloud Shell',
      'The Cloud Storage console object viewer',
      'The Compute Engine serial console',
      'The Logs Explorer in Cloud Logging'
    ],
    answer: 0,
    explanation: 'Cloud Shell includes a browser-based code editor over the same home directory, so you can edit files and run terraform or gcloud in the terminal next to it. The other tools view objects, guest consoles or logs; none of them edits and runs code.'
  },
  {
    id: 'ace-m1-016',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'hard',
    prompt: 'For one gcloud configuration, every command should run as the deploy-sa service account, without downloading a key. What should you do?',
    options: [
      'Get Service Account Token Creator on deploy-sa and run `gcloud config set auth/impersonate_service_account` with its email.',
      'Create a key for deploy-sa and run `gcloud auth activate-service-account` with the downloaded key file.',
      'Get Service Account User on deploy-sa and run `gcloud config set account` with the service account’s email.',
      'Add deploy-sa to your Google group, so that gcloud runs your commands with the group’s service account.'
    ],
    answer: 0,
    explanation: 'The `auth/impersonate_service_account` property makes gcloud request short-lived tokens for that service account on every command, which needs Service Account Token Creator on it. Activating a key works but creates a long-lived secret, Service Account User (actAs) is for attaching the account to resources, and group membership does not change who gcloud runs as.'
  },

  // ── Resource hierarchy and organization policies ──
  {
    id: 'ace-m1-017',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'The organization’s resource locations policy allows `in:asia-locations`. The Dev folder sets its own policy that allows `in:us-locations` and keeps inheritance from the parent turned on. Where can projects in Dev create resources?',
    options: [
      'In Asian and US locations, because the two allowed lists are merged',
      'Only in US locations, because the folder policy replaces the organization’s',
      'Only in Asian locations, because the organization policy always wins',
      'Nowhere, because the two allowed lists conflict and block each other'
    ],
    answer: 0,
    explanation: 'With inheritance on, a list policy is merged with its parent: allowed values from both levels apply (denied values would still win). To use only the folder’s list you would turn inheritance off, which makes the folder’s policy replace its parent’s.'
  },
  {
    id: 'ace-m1-018',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A folder for a regulated subsidiary must allow only Jakarta locations, although the organization policy allows all of Asia. How should you configure the folder’s resource locations policy?',
    options: [
      'Allow only the Jakarta value group and turn off inheritance from the parent policy.',
      'Allow only the Jakarta value group and keep inheritance from the parent policy on.',
      'Deny the Asia value group at the folder and leave the organization policy as it is.',
      'Remove the organization policy so the folder’s policy is the only one that applies.'
    ],
    answer: 0,
    explanation: 'Turning off inheritance makes the folder’s policy replace its parent’s, so only the listed values apply to the folder and its projects. With inheritance on, Jakarta would be merged with all of Asia; denying all of Asia would also deny Jakarta; removing the organization policy loosens every other folder.'
  },
  {
    id: 'ace-m1-019',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'Last year a project was given its own policy for a list constraint. You now want the project to follow its folder’s policy again. What should you do?',
    options: [
      'Delete the project’s policy for that constraint with `gcloud org-policies delete`.',
      'Reset the project’s policy for that constraint with `gcloud org-policies reset`.',
      'Copy the folder’s policy into the project with `gcloud org-policies set-policy`.',
      'Move the project out of the folder and back so it picks up the folder policy.'
    ],
    answer: 0,
    explanation: 'A resource with no policy of its own inherits its parent’s effective policy, so deleting the project’s policy restores inheritance. `reset` is different: it applies the constraint’s Google-managed default and ignores the parent. A copied policy drifts when the folder changes, and moving the project leaves its own policy in place.'
  },
  {
    id: 'ace-m1-020',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'You plan to enforce a new organization policy constraint across the organization, but you are not sure which existing workloads would violate it. What should you do first?',
    options: [
      'Create the policy in dry-run mode and review the violations it reports before enforcing it.',
      'Enforce it on the whole organization and roll it back if teams report that something broke.',
      'Enforce it on one test project and assume the rest of the organization behaves the same way.',
      'Create an IAM deny policy with the same intent and watch the Policy Denied audit logs.'
    ],
    answer: 0,
    explanation: 'A dry-run policy is evaluated but not enforced, and would-be violations are logged, so you can measure the impact first. Enforcing everywhere risks outages, one test project is not representative, and IAM deny policies govern permissions, not resource configuration.'
  },
  {
    id: 'ace-m1-021',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'Security wants every new GKE cluster in the organization to use private nodes, and no predefined organization policy constraint covers that setting. What should you do?',
    options: [
      'Create a custom organization policy constraint with a CEL condition on the cluster’s private nodes setting.',
      'Create an IAM condition on Kubernetes Engine Admin that only allows clusters with private nodes.',
      'Create a VPC Service Controls perimeter around GKE so that clusters with public nodes are blocked.',
      'Create a Cloud Monitoring alert that fires when a cluster with public nodes appears in any project.'
    ],
    answer: 0,
    explanation: 'Custom constraints let you write a CEL condition on fields of supported resources, such as GKE clusters, and enforce it like any organization policy. IAM conditions cannot inspect request fields like node settings, VPC Service Controls protects API data access, and an alert only reacts after the fact.'
  },
  {
    id: 'ace-m1-022',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Every new project gets an auto mode network named default, with permissive firewall rules. You want new projects created without it. Which constraint should you enforce?',
    options: [
      'constraints/compute.skipDefaultNetworkCreation',
      'constraints/compute.restrictVpcPeering',
      'constraints/compute.vmExternalIpAccess',
      'constraints/compute.restrictSharedVpcHostProjects'
    ],
    answer: 0,
    explanation: '`compute.skipDefaultNetworkCreation` stops the default network and its default firewall rules from being created in new projects, so teams build custom VPCs on purpose. The other constraints restrict peering, external IPs and Shared VPC host projects.'
  },
  {
    id: 'ace-m1-023',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Policy says every new Compute Engine VM must use Shielded VM features — Secure Boot, vTPM and integrity monitoring. Which constraint enforces this across the organization?',
    options: [
      'constraints/compute.requireShieldedVm',
      'constraints/compute.requireOsLogin',
      'constraints/compute.disableSerialPortAccess',
      'constraints/compute.vmCanIpForward'
    ],
    answer: 0,
    explanation: '`compute.requireShieldedVm` requires new VMs to use Shielded VM images with Secure Boot, vTPM and integrity monitoring enabled. OS Login, serial port access and IP forwarding are separate controls.'
  },
  {
    id: 'ace-m1-024',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A data protection rule says no Cloud SQL instance may ever be given a public IP address. Which organization policy constraint should you enforce?',
    options: [
      'constraints/sql.restrictPublicIp',
      'constraints/sql.restrictAuthorizedNetworks',
      'constraints/compute.vmExternalIpAccess',
      'constraints/gcp.restrictNonCmekServices'
    ],
    answer: 0,
    explanation: '`sql.restrictPublicIp` blocks public IPs on Cloud SQL instances, so they are reached over private IP. `sql.restrictAuthorizedNetworks` only stops adding authorized networks, `vmExternalIpAccess` covers VMs, and `restrictNonCmekServices` is about encryption keys.'
  },
  {
    id: 'ace-m1-025',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Auditors note that interactive serial console access to VMs bypasses network controls. You want it turned off for every VM in the organization. Which constraint should you enforce?',
    options: [
      'constraints/compute.disableSerialPortAccess',
      'constraints/compute.disableGuestAttributesAccess',
      'constraints/compute.requireOsLogin',
      'constraints/compute.skipDefaultNetworkCreation'
    ],
    answer: 0,
    explanation: 'Enforcing `compute.disableSerialPortAccess` makes the `serial-port-enable` metadata ineffective, so nobody can open the interactive serial console. Guest attributes, OS Login and the default network are unrelated settings.'
  },
  {
    id: 'ace-m1-026',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Every new Cloud Storage bucket in the organization must use IAM only, with object ACLs disabled. Which constraint should you enforce?',
    options: [
      'constraints/storage.uniformBucketLevelAccess',
      'constraints/storage.publicAccessPrevention',
      'constraints/storage.retentionPolicySeconds',
      'constraints/iam.allowedPolicyMemberDomains'
    ],
    answer: 0,
    explanation: 'The `storage.uniformBucketLevelAccess` constraint requires uniform bucket-level access, which disables ACLs so IAM alone decides access. Public access prevention blocks public grants, `retentionPolicySeconds` governs retention periods, and allowed domains restricts who can be granted roles.'
  },
  {
    id: 'ace-m1-027',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'Several folders and the organization all set policies for the resource locations constraint. You need to know which locations actually apply to the project ace-data-123. What should you run?',
    options: [
      '`gcloud org-policies describe gcp.resourceLocations --project=ace-data-123 --effective`',
      '`gcloud org-policies describe gcp.resourceLocations --organization=ORG_ID`',
      '`gcloud projects get-iam-policy ace-data-123 --flatten=locations`',
      '`gcloud org-policies list --project=ace-data-123 --show-unset`'
    ],
    answer: 0,
    explanation: '`describe --effective` evaluates the whole chain — organization, folders and project, with inheritance and merging — and prints the policy that really applies. The organization’s own policy is only one layer, IAM policies hold no locations, and `list` shows policies set on the resource itself.'
  },
  {
    id: 'ace-m1-028',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A project Owner tries to change an organization policy on their own project and gets a permission error. Why?',
    options: [
      'Organization policies need the Organization Policy Administrator role, which Owner does not include.',
      'Organization policies can only be changed by Google Cloud Support once they are set on a resource.',
      'Owners can change organization policies only after enabling the Cloud Asset API in the project.',
      'Organization policies can only be changed in Cloud Shell, never from the console or the API.'
    ],
    answer: 0,
    explanation: 'Organization policies are deliberately separate from project ownership: only principals with organization policy permissions, such as Organization Policy Administrator (normally granted on the organization), can change them — otherwise any Owner could switch off the guardrails. They are managed from the console, gcloud or the API.'
  },
  {
    id: 'ace-m1-029',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Right after your organization resource was created, you notice that every user in the domain can create projects and billing accounts. What should you do to tighten this?',
    options: [
      'Remove Project Creator and Billing Account Creator from the domain on the organization, and grant them to an admin group.',
      'Enforce domain restricted sharing so that users outside the domain cannot be granted any roles at all.',
      'Delete the default organization policies so that nobody can create projects until you add them back.',
      'Ask each user to sign an acceptable-use policy, and audit any new projects once every month.'
    ],
    answer: 0,
    explanation: 'When an organization is created, the whole domain is granted Project Creator and Billing Account Creator on it. Removing those bindings and granting the roles to a small group restores control. Domain restricted sharing limits who can be granted roles, not who already has them, and there are no default policies to delete for this.'
  },
  {
    id: 'ace-m1-030',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'You try to delete an old folder and get an error, although you are Folder Admin on it. What is the most likely cause?',
    options: [
      'The folder still contains projects or subfolders; it must be empty to be deleted.',
      'Folders can only be deleted by Google Cloud Support after a 30-day waiting period.',
      'Folders cannot be deleted at all; they can only be renamed or moved elsewhere.',
      'The folder has labels, and labelled folders cannot be deleted until they expire.'
    ],
    answer: 0,
    explanation: 'A folder can only be deleted when it holds no projects or folders, so move or delete its contents first. Folders can be deleted by anyone with the right permission, and labels do not affect deletion.'
  },
  {
    id: 'ace-m1-031',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Developers should hold Compute Instance Admin only on development projects across a large folder, including development projects added later. What should you do?',
    options: [
      'Attach an env=dev tag to the development projects and grant the role with an IAM condition on that tag.',
      'Add an env=dev label to the development projects and grant the role with an IAM condition on that label.',
      'Grant the role on the folder and ask developers not to change the production projects inside it.',
      'Grant the role on each development project by hand whenever a new development project is created.'
    ],
    answer: 0,
    explanation: 'Tags can be referenced in IAM conditions (for example `resource.matchTag("ORG_ID/env", "dev")`) and are inherited by resources below where they are attached. Labels are metadata for filtering and billing and cannot drive IAM, an unconditional folder grant includes production, and per-project grants must be repeated forever.'
  },
  {
    id: 'ace-m1-032',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Important Google Cloud security and technical notices go to individual project Owners, some of whom have left. You want them delivered to the cloud team’s mailbox for the whole organization. What should you configure?',
    options: [
      'Essential Contacts on the organization, with the team mailbox for those notification categories',
      'A Cloud Monitoring alerting policy that forwards all Google Cloud emails to the team mailbox',
      'A budget whose alert recipients include the team mailbox for every project in the organization',
      'An aggregated log sink that sends all audit logs to a Pub/Sub topic read by the team'
    ],
    answer: 0,
    explanation: 'Essential Contacts decides who receives Google Cloud notifications by category (security, technical, billing, legal and more) at the organization, folder or project level, instead of whoever happens to be Owner. Alerts, budgets and log sinks handle your own signals, not Google’s notices.'
  },
  {
    id: 'ace-m1-033',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'Your company uses Microsoft 365 for email and does not want Google Workspace licences, but it needs a standalone Google Cloud organization for its domain. What should you do?',
    options: [
      'Sign up for Cloud Identity Free with the company domain and verify that you own the domain.',
      'Buy Google Workspace for one user, because an organization requires a Workspace subscription.',
      'Run `gcloud organizations create` with the company domain from Cloud Shell.',
      'Create a billing account for the domain, which creates the organization resource for you.'
    ],
    answer: 0,
    explanation: 'Cloud Identity Free provides managed Google identities without Workspace services; once the domain is verified, the organization resource is created and email stays on Microsoft 365. Workspace is not required, there is no gcloud command that creates an organization, and billing accounts do not create one.'
  },
  {
    id: 'ace-m1-034',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'During Cloud Identity sign-up you are asked to prove that you own example.com. How is this normally done?',
    options: [
      'Add the verification TXT record that Google provides to the domain’s DNS.',
      'Upload the company’s registration documents to Google Cloud Support.',
      'Send an email from an address at the domain to Google’s verification team.',
      'Create a Cloud DNS public zone for the domain in any Google Cloud project.'
    ],
    answer: 0,
    explanation: 'Google gives you a TXT (or CNAME) value to publish at your DNS host; once it is visible, the domain is verified. Documents and emails are not the mechanism, and the zone does not have to be hosted in Cloud DNS — the record just has to be published wherever the domain’s DNS lives.'
  },
  {
    id: 'ace-m1-035',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Which practice does Google recommend for super administrator accounts in Cloud Identity?',
    options: [
      'Keep a few dedicated super admin accounts protected by security keys, and do daily work with other accounts.',
      'Make every Google Cloud administrator a super admin so that someone is always available to help out.',
      'Use one shared super admin account whose password is kept in the team’s password manager.',
      'Remove all super admin accounts after setup and grant Owner on every project to a group instead.'
    ],
    answer: 0,
    explanation: 'Super admins control every identity, so they should be few, dedicated, protected with strong 2-Step Verification such as security keys, and not used for everyday work; Google Cloud administration is granted through IAM roles to groups. Sharing or spreading the role widens the blast radius, and at least one must always exist.'
  },
  {
    id: 'ace-m1-036',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A new organization administrator wants a guided way to put the recommended foundation in place — admin groups, an initial folder structure, shared networking and central logging — with the option of getting it as Terraform. What should they use?',
    options: [
      'The Google Cloud setup guided flow in the console',
      'The Organization policies page in the console',
      'A Cloud Shell tutorial from Cloud Marketplace',
      'The Recommender page of Active Assist'
    ],
    answer: 0,
    explanation: 'Google Cloud setup walks administrators through the organization, users and groups, administrative access, billing, the resource hierarchy, networking, logging and security settings, and can deploy the result or provide it as Terraform. Organization policies are only one part of it, and Recommender suggests changes to what already exists.'
  },
  {
    id: 'ace-m1-037',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Why does Google recommend separate projects for development and production, rather than one project with labels for each environment?',
    options: [
      'Projects are a boundary for IAM, quotas, APIs and billing, so each environment is controlled separately.',
      'Labels cannot be applied to more than one resource type, so they cannot mark a whole environment.',
      'Resources in one project cannot talk to each other unless they carry the same label.',
      'A project can only hold resources in a single region, so each environment needs its own.'
    ],
    answer: 0,
    explanation: 'Access, quotas, enabled APIs and billing are scoped to projects, so separate projects keep a development mistake or a broad grant away from production. Labels are only metadata; they do not control access or communication, and projects are not tied to one region.'
  },
  {
    id: 'ace-m1-038',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'You must allow resources only in the Jakarta region, including all of its zones, with the resource locations constraint. Which value should you allow?',
    options: ['in:asia-southeast2-locations', 'asia-southeast2-a', 'in:asia-locations', 'region:asia-southeast2'],
    answer: 0,
    explanation: 'Value groups such as `in:asia-southeast2-locations` cover a region and its zones, and grow when Google adds locations. A single zone value would block the other zones, `in:asia-locations` allows all of Asia, and `region:` is not valid syntax for this constraint.'
  },
  {
    id: 'ace-m1-039',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A platform engineer must be able to move projects between folders, and nothing more. Which predefined role fits?',
    options: ['Project Mover', 'Folder Admin', 'Project Creator', 'Organization Administrator'],
    answer: 0,
    explanation: 'Project Mover (`roles/resourcemanager.projectMover`), granted where the projects are and on the destination, allows moving projects. Folder Admin manages folders themselves, Project Creator creates projects, and Organization Administrator controls IAM for the whole organization.'
  },
  {
    id: 'ace-m1-040',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'An Organization Administrator who also has Compute Admin tries to create a VM in us-east1, and the request fails with a constraint violation. What explains this?',
    options: [
      'Organization policies apply to everyone, whatever roles they hold, and a locations policy blocks us-east1.',
      'Organization Administrators are not allowed to create VMs, even when they also hold Compute Admin.',
      'VMs in us-east1 need a quota that only Google Cloud Support can grant to a new organization.',
      'The administrator’s session has expired, and that is reported to gcloud as a constraint violation.'
    ],
    answer: 0,
    explanation: 'IAM decides who may call an API; organization policies decide which configurations are allowed, and they apply whatever the caller’s roles are — that is why they work as guardrails. The error names a constraint, which points at policy, not permissions or quota.'
  },
  {
    id: 'ace-m1-041',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Which statement correctly contrasts organization policies with IAM?',
    options: [
      'IAM controls who can act on resources; organization policies restrict how resources may be configured.',
      'IAM controls how resources are configured; organization policies control who can sign in to the console.',
      'Organization policies replace IAM at the organization level, so IAM only applies inside projects.',
      'They are the same mechanism; organization policies are simply IAM roles that are granted on folders.'
    ],
    answer: 0,
    explanation: 'IAM answers who can do what; organization policies set guardrails on what is allowed — locations, external IPs, key creation — for everyone below where they are set. Both are inherited down the hierarchy and work together.'
  },
  {
    id: 'ace-m1-042',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'In an organization created in 2026, a developer cannot create a key for a service account even with Service Account Key Admin, and nobody on the team has set any policy. What is the most likely reason?',
    options: [
      'New organizations get secure-by-default policies, including one that blocks service account key creation.',
      'Service account keys can only be created by Google Cloud Support for organizations created after 2024.',
      'Key creation needs the Owner role on the organization, which developers do not normally receive.',
      'Service account keys were retired, and only Workload Identity Federation works for new accounts.'
    ],
    answer: 0,
    explanation: 'Organizations created since May 2024 have a set of organization policies enforced by default, including `iam.disableServiceAccountKeyCreation`. An Organization Policy Administrator can make an exception if a key is truly needed, but impersonation or Workload Identity Federation is usually the better route.'
  },

  // ── Project setup, APIs, quotas and the first network ──
  {
    id: 'ace-m1-043',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Which of these is a valid project ID?',
    options: ['ace-shop-prod-01', 'ACE_Shop_Prod', '1-ace-shop-prod', 'ace'],
    answer: 0,
    explanation: 'Project IDs are 6 to 30 characters of lowercase letters, digits and hyphens, must start with a letter and cannot end with a hyphen. Uppercase letters and underscores, a leading digit, and fewer than six characters are all rejected.'
  },
  {
    id: 'ace-m1-044',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A developer with Compute Admin on a project cannot enable the Cloud Run Admin API there. Which role gives them the missing permission without broad project access?',
    options: ['Service Usage Admin', 'Cloud Run Admin', 'Project IAM Admin', 'Compute Network Admin'],
    answer: 0,
    explanation: 'Enabling and disabling APIs needs `serviceusage.services.enable`, which is in Service Usage Admin (and in Owner and Editor). Cloud Run Admin manages Cloud Run resources once the API is on, and the other roles are about IAM and networks.'
  },
  {
    id: 'ace-m1-045',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You run `gcloud services enable container.googleapis.com` in a new project. Afterwards the Compute Engine API is also enabled, although you never enabled it. Why?',
    options: [
      'Enabling an API also enables the APIs it depends on, and GKE depends on Compute Engine.',
      'The Compute Engine API is always enabled in every project and cannot be turned off.',
      'gcloud enables every Google Cloud API in the project the first time any API is enabled.',
      'A default organization policy enables Compute Engine whenever a project is created.'
    ],
    answer: 0,
    explanation: 'Services declare dependencies, and enabling one also enables what it needs — GKE runs its nodes on Compute Engine, so that API comes with it. Compute Engine is not on by default, gcloud does not enable everything, and organization policies do not enable APIs.'
  },
  {
    id: 'ace-m1-046',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'In a brand-new project you can already write logs with the Cloud Logging API and run BigQuery queries without enabling anything. Why?',
    options: [
      'A few APIs, such as Cloud Logging, Cloud Monitoring and BigQuery, are enabled by default.',
      'All Google Cloud APIs are enabled by default and only need disabling when not used.',
      'Logging and BigQuery are free services that are used without going through any API.',
      'The organization administrator enabled every API in advance for all new projects.'
    ],
    answer: 0,
    explanation: 'New projects come with a small set of APIs already enabled (for example Cloud Logging, Cloud Monitoring, BigQuery and Cloud Storage); most others, such as Compute Engine or Cloud Run, must be enabled first. Every service, free or not, is used through its API.'
  },
  {
    id: 'ace-m1-047',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'What is the difference between a quota and a system limit in Google Cloud?',
    options: [
      'Quotas can be adjusted, usually by request; system limits are fixed values that cannot be changed.',
      'Quotas apply to billing accounts, while system limits apply to individual Google Cloud projects.',
      'System limits can be raised by any project Owner, but quotas need Google Cloud Support to approve.',
      'Quotas only cover API request rates, while system limits cover every resource count in a project.'
    ],
    answer: 0,
    explanation: 'Quotas — such as CPUs per region or API requests per minute — protect shared capacity and can be raised (or lowered) for a project. System limits are hard values, such as the maximum size of a resource, that apply to everyone and cannot be changed.'
  },
  {
    id: 'ace-m1-048',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A fast-growing project keeps hitting its regional CPU quota, and the team forgets to request increases. You want Google Cloud to request increases automatically as usage approaches the limit. What should you do?',
    options: [
      'Enable the quota adjuster for the project.',
      'Set the quota to unlimited on the Quotas page.',
      'Create a budget that raises quotas at 90%.',
      'Move the project into a dedicated folder.'
    ],
    answer: 0,
    explanation: 'The quota adjuster watches usage of supported quotas and files increase requests on your behalf when usage nears the limit (approval is still not guaranteed). Quotas cannot be set to unlimited, budgets track money, and folders do not change quotas.'
  },
  {
    id: 'ace-m1-049',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You want an email before the project runs out of static IP addresses in a region, so the team can request more in time. What should you set up?',
    options: [
      'A Cloud Monitoring alert on the quota usage metric for that quota, at 80% of the limit',
      'A budget alert at 80% of the monthly budget of the project that owns the addresses',
      'An uptime check on each static IP address that fires when an address stops answering',
      'A log-based metric that counts how often the addresses appear in VPC Flow Logs'
    ],
    answer: 0,
    explanation: 'Quota usage and limits are exposed as Cloud Monitoring metrics, so an alerting policy (or the "Create usage alert" option on the Quotas page) can warn at a chosen percentage. Budgets measure money, uptime checks measure availability, and flow logs measure traffic.'
  },
  {
    id: 'ace-m1-050',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'Your project has used all of its CPU quota in asia-southeast2, and the requirements also allow asia-southeast1. Can you run more VMs right now?',
    options: [
      'Yes, in asia-southeast1, because regional quotas are counted separately for each region.',
      'No, because CPU quota is a single global total that all regions in the project share.',
      'No, because a project can only use one region until its first quota increase is approved.',
      'Yes, but only Spot VMs, because Spot VMs never count against any CPU quota.'
    ],
    answer: 0,
    explanation: 'Regional quotas such as CPUS apply per region, so another region has its own allowance (a few global quotas also exist). Projects are not tied to one region, and Spot VMs use quota too, often a separate preemptible CPU quota.'
  },
  {
    id: 'ace-m1-051',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Which of these is an allocation quota rather than a rate quota?',
    options: [
      'The number of static external IP addresses in a region',
      'The number of API requests allowed per minute',
      'The number of queries allowed per day to an API',
      'The number of read requests per second to a service'
    ],
    answer: 0,
    explanation: 'Allocation quotas cap how many resources you can hold at once — CPUs, IP addresses, disks — and are freed when the resource is deleted. Rate quotas cap how often you can call an API in a time window.'
  },
  {
    id: 'ace-m1-052',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A security review of a new project finds SSH and RDP open to 0.0.0.0/0, but nobody created those rules. What explains it, and what should you do?',
    options: [
      'They belong to the auto mode default network; replace it with a custom VPC and allow SSH only from IAP’s 35.235.240.0/20.',
      'They are the implied firewall rules of every VPC network; open a support case to have them disabled.',
      'They come from the organization’s hierarchical firewall policy; ask the organization admin to remove them.',
      'Cloud Shell added them the first time someone opened an SSH session; delete them after each session.'
    ],
    answer: 0,
    explanation: 'The default network ships with default-allow-ssh, default-allow-rdp, default-allow-icmp and default-allow-internal rules. Deleting it (or skipping its creation by policy) and building a custom VPC with tight rules — SSH only through IAP — closes the gap. The implied rules deny all ingress and allow egress; they never open SSH.'
  },
  {
    id: 'ace-m1-053',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You are building the first network for a new project. Which pair of commands creates a custom mode VPC and a subnet in Jakarta?',
    options: [
      '`gcloud compute networks create prod-vpc --subnet-mode=custom`, then `gcloud compute networks subnets create web --network=prod-vpc --region=asia-southeast2 --range=10.10.0.0/24`',
      '`gcloud compute networks create prod-vpc --subnet-mode=auto`, then `gcloud compute networks subnets create web --network=prod-vpc --zone=asia-southeast2-a --range=10.10.0.0/24`',
      '`gcloud compute networks create prod-vpc --region=asia-southeast2`, then `gcloud compute networks subnets create web --network=prod-vpc --range=10.10.0.0/24`',
      '`gcloud compute networks subnets create prod-vpc --mode=custom`, then `gcloud compute networks create web --subnet=prod-vpc --range=10.10.0.0/24`'
    ],
    answer: 0,
    explanation: 'Custom mode creates the network with no subnets; you then add regional subnets with your own ranges. Auto mode creates a subnet in every region, subnets are regional rather than zonal, and networks are global, so they take no region.'
  },
  {
    id: 'ace-m1-054',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Can one VPC network have subnets in both asia-southeast2 and us-central1?',
    options: [
      'Yes; a VPC network is global, and each of its subnets is regional.',
      'No; a VPC network belongs to one region, so each region needs its own.',
      'Only through VPC Network Peering between two regional VPC networks.',
      'Only when the network is in auto mode, never in custom mode.'
    ],
    answer: 0,
    explanation: 'VPC networks are global resources and subnets are regional, so one network can span regions, and VMs in different regions talk over Google’s network with internal IPs. Peering connects separate networks, and custom mode networks can have subnets in any region.'
  },
  {
    id: 'ace-m1-055',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'A new project needs the Compute Engine, Cloud Run and Artifact Registry APIs. What is the simplest way to enable all three?',
    options: [
      '`gcloud services enable compute.googleapis.com run.googleapis.com artifactregistry.googleapis.com`',
      'Three separate `gcloud services enable` commands, because each call accepts only one API',
      '`gcloud services enable --all`, which turns on every API the project might use later',
      '`gcloud components install compute run artifactregistry` in Cloud Shell'
    ],
    answer: 0,
    explanation: '`gcloud services enable` accepts several service names in one call. Separate commands work but are not required, there is no `--all`, and `gcloud components` manages CLI components on your machine, not project APIs.'
  },
  {
    id: 'ace-m1-056',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A public web page calls a Google API with an API key embedded in its JavaScript. How should you limit the damage if someone copies the key?',
    options: [
      'Restrict the key to the one API it needs and to your website’s HTTP referrers.',
      'Rotate the key every hour with a scheduled job that updates the web page.',
      'Grant the key the Viewer role so that it can only read data, never change it.',
      'Store the key in Secret Manager and read it from the browser at page load.'
    ],
    answer: 0,
    explanation: 'API key restrictions limit which APIs a key can call and where it can be used from (HTTP referrers, IP addresses or apps). Hourly rotation is fragile, API keys are not principals that take IAM roles, and anything a browser reads is exposed anyway.'
  },
  {
    id: 'ace-m1-057',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You need a list of the projects directly inside the folder with ID 482190335671. Which command gives it?',
    options: [
      '`gcloud projects list --filter="parent.id=482190335671 AND parent.type=folder"`',
      '`gcloud resource-manager folders list --folder=482190335671 --projects`',
      '`gcloud projects describe 482190335671 --children`',
      '`gcloud config list --folder=482190335671`'
    ],
    answer: 0,
    explanation: '`gcloud projects list` can filter on the parent, so this prints the projects whose parent is that folder. `folders list` lists subfolders, `projects describe` takes a project, and `config list` shows local settings.'
  },
  {
    id: 'ace-m1-058',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'Before disabling APIs you think are unused, you want to see which enabled APIs actually received requests in the last 30 days. Where do you look?',
    options: [
      'The APIs & Services dashboard, which charts traffic and errors per enabled API',
      'The Billing reports, which list every API that was enabled during the month',
      'The IAM page, which shows which APIs each principal is allowed to use',
      'The Quotas page, which lists APIs in the order they were enabled'
    ],
    answer: 0,
    explanation: 'The APIs & Services dashboard shows request counts, errors and latency for each enabled API, so idle ones stand out. Billing shows cost (many APIs are free), IAM shows permissions, and the Quotas page shows limits.'
  },
  {
    id: 'ace-m1-059',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You are setting up a new project for a team. Which step has to happen before the team can create Compute Engine VMs?',
    options: [
      'Link the project to an active Cloud Billing account.',
      'Create a budget for the project with an alert at 100%.',
      'Export the project’s billing data to BigQuery.',
      'Add labels for the team and cost centre to the project.'
    ],
    answer: 0,
    explanation: 'Paid services such as Compute Engine need the project to be linked to a billing account — even enabling the API requires it. Budgets, billing export and labels are good practice, but none of them is required to create resources.'
  },
  {
    id: 'ace-m1-060',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'hard',
    prompt: 'Code on your laptop uses Application Default Credentials and fails with "API has not been used in project 123456789 before or it is disabled" — but 123456789 is not the project you work in. What should you do?',
    options: [
      'Set the quota project of ADC to your project with `gcloud auth application-default set-quota-project`.',
      'Enable the API in project 123456789, because every API call is always billed to that project.',
      'Run `gcloud config set project` with your project; client libraries always use gcloud’s project.',
      'Delete project 123456789, after which client libraries fall back to the right project automatically.'
    ],
    answer: 0,
    explanation: 'User credentials in ADC carry a quota project that receives the quota and billing of client library calls; if it points elsewhere, the API would have to be enabled there. Setting it to your own project, where the API is enabled, fixes the error. Client libraries do not take this from gcloud’s project property.'
  },

  // ── Cloud Identity, IAM basics and Workforce Identity Federation ──
  {
    id: 'ace-m1-061',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'The data team’s Google group needs read-only access to Compute Engine resources in project ace-data-123. Which command grants it?',
    options: [
      '`gcloud projects add-iam-policy-binding ace-data-123 --member=group:data-team@example.com --role=roles/compute.viewer`',
      '`gcloud projects add-iam-policy-binding ace-data-123 --member=data-team@example.com --role=compute.viewer`',
      '`gcloud iam roles grant roles/compute.viewer --group=data-team@example.com --project=ace-data-123`',
      '`gcloud projects set-iam-policy ace-data-123 --member=group:data-team@example.com --role=roles/compute.viewer`'
    ],
    answer: 0,
    explanation: 'A binding names the principal with its type prefix (`group:`, `user:`, `serviceAccount:`) and the full role name (`roles/…`). There is no `gcloud iam roles grant`, and `set-iam-policy` takes a whole policy file that replaces the existing policy.'
  },
  {
    id: 'ace-m1-062',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'You need to see quickly who holds the Editor role on a project. Where can you do this in the console?',
    options: [
      'On the project’s IAM page, viewed by role or filtered on Editor',
      'On the Service Accounts page, filtered on the Editor role',
      'On the Audit Logs page, filtered on SetIamPolicy calls',
      'On the Roles page, by opening the Editor role’s details'
    ],
    answer: 0,
    explanation: 'The IAM page lists the project’s allow policy and can group or filter it by role, including roles inherited from folders and the organization. The Roles page describes what a role contains, not who has it, and audit logs show changes rather than the current state.'
  },
  {
    id: 'ace-m1-063',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'A storage team must create, configure and delete Cloud Storage buckets and objects in a project, and should get nothing outside Cloud Storage. Which role fits best?',
    options: ['Storage Admin', 'Editor', 'Storage Object Admin', 'Storage Legacy Bucket Owner'],
    answer: 0,
    explanation: 'Storage Admin gives full control of buckets and objects and nothing else. Editor reaches almost every service, Storage Object Admin manages objects but not bucket settings, and the legacy roles mirror ACLs on a single bucket.'
  },
  {
    id: 'ace-m1-064',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'A contractor who joins for six months needs a managed Google identity in your Cloud Identity domain. Where do you create it?',
    options: [
      'In the Google Admin console, under Directory > Users',
      'In the Google Cloud console, on the IAM page',
      'In the Google Cloud console, on the Service Accounts page',
      'In Cloud Shell, with `gcloud iam users create`'
    ],
    answer: 0,
    explanation: 'Users and groups of a Cloud Identity or Workspace account are managed in the Google Admin console (or synced from another directory). The IAM page grants roles to identities that already exist, service accounts are for workloads, and gcloud has no command to create users.'
  },
  {
    id: 'ace-m1-065',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'You must create 300 user accounts for a new subsidiary in Cloud Identity this afternoon. Their directory is a spreadsheet, not Active Directory. What is the most efficient way?',
    options: [
      'Upload the users from a CSV file with the bulk upload feature of the Admin console.',
      'Create each user by hand in the Admin console, adding them to groups as you go.',
      'Install Google Cloud Directory Sync and point it at the spreadsheet as its source.',
      'Grant each person’s personal Gmail address roles in the projects they need.'
    ],
    answer: 0,
    explanation: 'The Admin console can add or update many users at once from a CSV file. Creating 300 by hand is slow, GCDS syncs from LDAP directories such as Active Directory rather than spreadsheets, and personal accounts are outside company control.'
  },
  {
    id: 'ace-m1-066',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Your employees are managed in Microsoft Entra ID. New hires should get a Cloud Identity account automatically and leavers should be suspended, without running any servers. What should you configure?',
    options: [
      'Automatic user provisioning from Entra ID to Cloud Identity, together with SAML single sign-on.',
      'Google Cloud Directory Sync on a VM in your data centre, reading from Entra ID over LDAP.',
      'A daily export of Entra ID users to CSV that an administrator uploads to the Admin console.',
      'Workload Identity Federation between Entra ID and Google Cloud for each employee account.'
    ],
    answer: 0,
    explanation: 'Entra ID, like Okta and other identity providers, can provision and deprovision users in Cloud Identity automatically through its Google connector, and SAML SSO keeps passwords in Entra ID. GCDS needs a server and an LDAP source, CSV uploads are manual, and Workload Identity Federation is for workloads, not people.'
  },
  {
    id: 'ace-m1-067',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Where does Google Cloud Directory Sync (GCDS) run, and in which direction does it sync?',
    options: [
      'On a server in your network that can read your LDAP directory; it syncs one way, into Google.',
      'As a managed Google Cloud service; it syncs both ways between Google and your directory.',
      'Inside Cloud Shell; it syncs one way, from Google into your Active Directory.',
      'On every employee laptop; it syncs each user’s password both ways at sign-in.'
    ],
    answer: 0,
    explanation: 'GCDS is a tool you install on a machine with access to your LDAP or Active Directory server. It reads users and groups there and updates Cloud Identity or Workspace to match; it never writes back to your directory.'
  },
  {
    id: 'ace-m1-068',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'hard',
    prompt: 'After setting up Cloud Identity for example.com, you discover that 40 employees had already created personal Google accounts with their @example.com addresses. How do you bring these accounts under company management?',
    options: [
      'Use the transfer tool for unmanaged users, which invites them to move their accounts into your account.',
      'Delete the accounts from the Admin console, because personal accounts on your domain are not allowed.',
      'Create new accounts with the same addresses, and Google merges the personal accounts into them.',
      'Ask Google Cloud Support to reassign the 40 accounts to your organization without the users’ consent.'
    ],
    answer: 0,
    explanation: 'Accounts that use your domain but sit outside your Cloud Identity account are unmanaged (conflicting) accounts. The Admin console’s transfer tool sends each user an invitation; once they accept, the account becomes managed and keeps its data. You cannot delete them yourself, creating a duplicate leaves a conflicting account, and transfers need the user to accept.'
  },
  {
    id: 'ace-m1-069',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Team leads should add and remove members of their own team’s Google group, which holds roles in several projects, without becoming Google Cloud or Admin console administrators. What should you do?',
    options: [
      'Make each team lead a manager of their team’s Google group.',
      'Grant each team lead Project IAM Admin on the team’s projects.',
      'Make each team lead a super administrator in the Admin console.',
      'Grant each team lead Organization Administrator on the domain.'
    ],
    answer: 0,
    explanation: 'Group owners and managers can change membership, and because the IAM roles are granted to the group, a membership change changes access with no IAM edits. Project IAM Admin, super admin and Organization Administrator all give far more power than managing one team.'
  },
  {
    id: 'ace-m1-070',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'hard',
    prompt: 'Everyone whose department attribute is Finance should automatically be in the finance-analysts group, and leave it when they change department. What should you use?',
    options: [
      'A dynamic group whose membership query matches department = Finance',
      'A static group that an administrator updates from HR reports every week',
      'An IAM condition that grants roles when the user’s department is Finance',
      'An organizational unit named Finance, granted roles in the IAM policy'
    ],
    answer: 0,
    explanation: 'Dynamic groups (in Cloud Identity Premium and the Workspace editions that include them) calculate membership from a query on user attributes and keep it current automatically. Manual groups drift, IAM conditions cannot read directory attributes, and organizational units cannot be granted IAM roles.'
  },
  {
    id: 'ace-m1-071',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Beyond managed identities and single sign-on, your security team needs device management and advanced security policies for employees’ laptops and phones. What do you need?',
    options: ['Cloud Identity Premium', 'Cloud Identity Free', 'Google Cloud Directory Sync', 'Workforce Identity Federation'],
    answer: 0,
    explanation: 'Cloud Identity Free covers users, groups, 2-Step Verification and SSO; Premium adds advanced endpoint (device) management, security controls and reporting. GCDS and Workforce Identity Federation bring identities into Google or federate them; neither manages devices.'
  },
  {
    id: 'ace-m1-072',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'Every administrator in your Cloud Identity account must sign in with 2-Step Verification, ideally with a security key. Where is this enforced?',
    options: [
      'In the Admin console security settings, for the administrators’ organizational unit or group',
      'In the IAM page of each project, with a condition that requires 2-Step Verification',
      'With an organization policy constraint that requires security keys for all API calls',
      'In Cloud Shell, by setting an auth/require_2sv property in every gcloud configuration'
    ],
    answer: 0,
    explanation: '2-Step Verification is an identity setting: enforce it, and the allowed methods such as security keys, in the Admin console for an organizational unit or group. IAM and organization policies govern access to resources and their configuration, not how users sign in, and the gcloud property does not exist.'
  },
  {
    id: 'ace-m1-073',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'What is the difference between organizational units in the Google Admin console and folders in Google Cloud?',
    options: [
      'Organizational units group users and devices for identity settings; folders group projects for IAM and policies.',
      'Organizational units group projects for billing; folders group users and devices for security settings.',
      'They are the same structure shown in two places, so changing one changes the other.',
      'Organizational units replace folders when Cloud Identity Premium is enabled for the domain.'
    ],
    answer: 0,
    explanation: 'Organizational units structure users and devices so that Admin console settings, such as 2-Step Verification or app access, can differ; folders structure Google Cloud projects so that IAM and organization policies can be inherited. They are independent hierarchies.'
  },
  {
    id: 'ace-m1-074',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Your organization enforces domain restricted sharing. You must grant a consultant from partner.example, which has its own Cloud Identity account, access to one project. What should you do?',
    options: [
      'Add the partner’s Cloud Identity customer ID to the allowed values of the constraint, then grant the role.',
      'Grant the role anyway, because domain restricted sharing only applies to principals in your domain.',
      'Create a service account for the consultant and send them a key to use with the project.',
      'Turn off the constraint for the whole organization while the consultant works on the project.'
    ],
    answer: 0,
    explanation: '`iam.allowedPolicyMemberDomains` lists the customer IDs whose identities may be granted roles; adding the partner’s ID where it is needed allows the grant. Otherwise grants to outside identities are rejected, keys for people are bad practice, and disabling the guardrail everywhere is excessive.'
  },
  {
    id: 'ace-m1-075',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'Which statement about Workforce Identity Federation is correct?',
    options: [
      'It lets people from an external identity provider use Google Cloud without Cloud Identity accounts.',
      'It lets workloads on AWS or Azure call Google Cloud APIs without service account keys.',
      'It copies users from an external identity provider into Cloud Identity every hour.',
      'It lets Kubernetes service accounts in GKE act as IAM principals for Google APIs.'
    ],
    answer: 0,
    explanation: 'Workforce Identity Federation federates your workforce — employees and partners — from an IdP such as Entra ID or Okta, so they use Google Cloud with their existing identities and no synced accounts. Workloads use Workload Identity Federation, copying users is GCDS or automatic provisioning, and GKE uses Workload Identity Federation for GKE.'
  },
  {
    id: 'ace-m1-076',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'You are setting up Workforce Identity Federation. Where is the workforce identity pool created?',
    options: [
      'In the organization, with a global location: `gcloud iam workforce-pools create POOL --organization=ORG_ID --location=global`',
      'In each project the federated users work in: `gcloud iam workforce-pools create POOL --project=PROJECT_ID`',
      'In a folder above the projects: `gcloud iam workforce-pools create POOL --folder=FOLDER_ID --location=global`',
      'In the billing account that pays for the projects: `gcloud iam workforce-pools create POOL --billing-account=ID`'
    ],
    answer: 0,
    explanation: 'Workforce pools belong to the organization (location global) because they represent the organization’s users across every project; you then add providers and grant roles to pool principals on any resource. Workload identity pools, by contrast, live in projects.'
  },
  {
    id: 'ace-m1-077',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Which kinds of identity providers can a workforce identity pool provider trust?',
    options: [
      'OIDC and SAML 2.0 identity providers',
      'Only Google Workspace and Cloud Identity',
      'Only LDAP directories such as Active Directory',
      'Only AWS IAM and Azure managed identities'
    ],
    answer: 0,
    explanation: 'Workforce pool providers support OpenID Connect and SAML 2.0, which covers Entra ID, Okta, Ping and most enterprise IdPs. LDAP directories are synced with GCDS instead, and AWS or Azure workload identities belong to Workload Identity Federation.'
  },
  {
    id: 'ace-m1-078',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'hard',
    prompt: 'You want to grant roles to groups defined in your identity provider through Workforce Identity Federation. What must the provider’s attribute mapping include?',
    options: [
      'A mapping from the IdP’s group claim to `google.groups`, alongside `google.subject`',
      'A mapping from the IdP’s group claim to `google.subject`, which then holds the group',
      'A mapping of every group name to a Google group email address in Cloud Identity',
      'Nothing, because Google reads group membership from the IdP when roles are checked'
    ],
    answer: 0,
    explanation: '`google.subject` identifies each user, and mapping the assertion’s group claim to `google.groups` lets IAM bindings refer to `principalSet://iam.googleapis.com/locations/global/workforcePools/POOL/group/GROUP`. Putting the group in subject loses the user’s identity, Cloud Identity groups are not involved, and Google only knows what the mapped token or assertion carries.'
  },
  {
    id: 'ace-m1-079',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'hard',
    prompt: 'All members of the IdP group cloud-admins, federated through the workforce pool corp-pool, need Compute Admin on a project. Which member should the IAM binding use?',
    options: [
      '`principalSet://iam.googleapis.com/locations/global/workforcePools/corp-pool/group/cloud-admins`',
      '`group:cloud-admins@corp-pool.iam.gserviceaccount.com`',
      '`principal://iam.googleapis.com/locations/global/workforcePools/corp-pool/subject/cloud-admins`',
      '`domain:corp-pool.workforce.goog`'
    ],
    answer: 0,
    explanation: '`principalSet://…/group/GROUP_ID` refers to everyone in the pool whose mapped `google.groups` contains that group. `principal://…/subject/…` names a single user, and the other two forms are not valid federated identifiers.'
  },
  {
    id: 'ace-m1-080',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'An employee leaves the company. Your Google Cloud access is federated from Okta through Workforce Identity Federation. What removes their access?',
    options: [
      'Deactivating the user in Okta, because there is no separate Google account to delete.',
      'Deleting the user’s Cloud Identity account in the Google Admin console.',
      'Removing the user’s service account keys in every project they worked in.',
      'Deleting the workforce pool, because a pool cannot remove a single user.'
    ],
    answer: 0,
    explanation: 'With Workforce Identity Federation the IdP stays the source of truth: once the user can no longer authenticate there, they cannot obtain new Google Cloud credentials, and existing sessions end when they expire. No Cloud Identity account exists, people should not have keys, and deleting the pool would lock everyone out.'
  },
  {
    id: 'ace-m1-081',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'Your company wants employees to use Google Workspace apps such as Drive as well as Google Cloud. Which approach to identities fits?',
    options: [
      'Managed Google accounts in Cloud Identity or Workspace, synced or provisioned from your directory',
      'Workforce Identity Federation only, with no Google accounts for the employees at all',
      'Personal Gmail accounts added to Workspace through an invitation to a company group',
      'One service account per employee, impersonated from each employee’s laptop'
    ],
    answer: 0,
    explanation: 'Workspace apps need managed Google accounts; Workforce Identity Federation covers Google Cloud products but not Workspace services such as Drive or Gmail. Provisioning from your directory (GCDS or IdP provisioning) plus SSO keeps one source of truth.'
  },
  {
    id: 'ace-m1-082',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'A developer needs to read logs in project ace-web-123 only. Where should you grant Logs Viewer?',
    options: [
      'On the project ace-web-123',
      'On the folder that contains ace-web-123',
      'On the organization node',
      'On the developer’s own user account'
    ],
    answer: 0,
    explanation: 'Grant roles on the lowest resource that covers the need. A folder or organization grant also reaches every other project below it, and roles are granted to principals on resources, not on a principal.'
  },
  {
    id: 'ace-m1-083',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'easy',
    prompt: 'Which member value grants a role to every user in your Cloud Identity domain example.com?',
    options: ['domain:example.com', 'group:all@example.com', 'allAuthenticatedUsers', 'user:*@example.com'],
    answer: 0,
    explanation: '`domain:` refers to every identity in a Google Workspace or Cloud Identity domain. A group only covers its members, `allAuthenticatedUsers` means anyone with any Google account, and wildcards are not allowed in `user:`.'
  },
  {
    id: 'ace-m1-084',
    section: 'setup',
    topic: 'Cloud Identity & IAM basics',
    difficulty: 'medium',
    prompt: 'You want to see everything a particular group can do in one project, including roles granted directly and those inherited from folders. Which console view helps most?',
    options: [
      'The project’s IAM page, viewed by principal, with inherited roles shown',
      'The Admin console group page, which lists the projects the group is in',
      'A Cloud Asset Inventory resource search, filtered on the project’s VMs',
      'The Billing reports page, filtered on the group’s email address'
    ],
    answer: 0,
    explanation: 'The project IAM page lists principals with their roles and marks those inherited from folders or the organization. The Admin console knows group membership, not Google Cloud roles; a resource search lists resources; billing shows cost. Policy Analyzer goes further, across many projects.'
  },

  // ── Billing, observability provisioning, Cloud Asset Inventory, Gemini Cloud Assist ──
  {
    id: 'ace-m1-085',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Your company wants to pay for Google Cloud by monthly invoice and bank transfer instead of a credit card. What kind of Cloud Billing account does it need?',
    options: ['An invoiced billing account', 'A self-serve billing account', 'A billing sub-account', 'A free trial billing account'],
    answer: 0,
    explanation: 'Invoiced (offline) billing accounts are paid by invoice and require meeting eligibility criteria, usually arranged with Google Cloud sales. Self-serve accounts are charged automatically to a card or bank account, and sub-accounts are for resellers.'
  },
  {
    id: 'ace-m1-086',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Spending varies from month to month. You want an alert whenever this month’s cost passes last month’s total, without editing the budget every month. How should you set the budget amount?',
    options: [
      'Use last month’s spend as the budget amount, with a threshold at 100%.',
      'Set a fixed amount equal to the highest month of the past year.',
      'Set the budget to zero so that every charge triggers an alert.',
      'Create twelve budgets, one per month, each with a fixed amount.'
    ],
    answer: 0,
    explanation: 'A budget amount can be a specified value or last period’s spend, which adjusts itself every period. A fixed peak misses smaller increases, a zero budget alerts on everything, and twelve budgets are needless upkeep.'
  },
  {
    id: 'ace-m1-087',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'The analytics team wants an alert that tracks only BigQuery spend across their three projects. How should you scope the budget?',
    options: [
      'Scope it to the three projects and filter it to the BigQuery service.',
      'Scope it to the whole billing account and give it a lower amount.',
      'Create it in each project, because a budget cannot span projects.',
      'Put labels on the datasets, because budgets cannot filter by service.'
    ],
    answer: 0,
    explanation: 'Budgets are created on the billing account and can be filtered by projects, services, labels and more, so one budget can watch BigQuery spend in exactly those projects. A budget can span several projects, and a billing-account-wide one would count everything.'
  },
  {
    id: 'ace-m1-088',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'hard',
    prompt: 'Each time Cloud Billing sends a cost update for a project, the current cost and budget amount should be posted to the team’s chat channel. What should you build?',
    options: [
      'Connect the budget to a Pub/Sub topic and have a Cloud Run function post each notification to the channel.',
      'Add the chat channel’s email address as a budget recipient and lower the alert threshold to 1%.',
      'Schedule a daily query on the billing export in BigQuery and email the results to the channel.',
      'Create an uptime check against the Billing console page that notifies the chat channel.'
    ],
    answer: 0,
    explanation: 'Programmatic budget notifications publish a JSON message with the cost and budget amount to Pub/Sub several times a day; a function subscribed to the topic can post it anywhere. Email alerts only fire at thresholds, a daily query is not per update, and uptime checks test availability.'
  },
  {
    id: 'ace-m1-089',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Finance wants a table of list prices and your account’s contract prices for each SKU, kept up to date in BigQuery. Which export should you enable?',
    options: ['The pricing data export', 'The standard usage cost export', 'The detailed usage cost export', 'The Cost table CSV download'],
    answer: 0,
    explanation: 'The pricing export writes SKU prices, including any discounted or contract prices, to BigQuery. The usage cost exports record what was consumed and charged, and a CSV download is a one-off snapshot.'
  },
  {
    id: 'ace-m1-090',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'A FinOps analyst must view costs, create budgets and manage billing exports for a billing account, but must not change payment methods or link projects. Which role fits?',
    options: ['Billing Account Costs Manager', 'Billing Account Administrator', 'Billing Account User', 'Billing Account Viewer'],
    answer: 0,
    explanation: 'Billing Account Costs Manager can view and export cost information and manage budgets, without payment or project-linking rights. Administrator can do everything, User links projects, and Viewer cannot create budgets.'
  },
  {
    id: 'ace-m1-091',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Your Compute Engine spend is steady at about USD 10,000 a month, but teams keep changing machine series and regions. Which committed use discount follows that spend best?',
    options: [
      'A spend-based (flexible) committed use discount for Compute Engine',
      'A resource-based commitment for one machine series in one region',
      'Sustained use discounts, which apply once you sign a one-year contract',
      'Spot VMs for every workload, because Spot never needs a commitment'
    ],
    answer: 0,
    explanation: 'Compute flexible committed use discounts commit to an hourly spend and apply across machine series and regions, so they suit changing fleets. Resource-based commitments are tied to a region and resource type, sustained use discounts are automatic and need no contract, and Spot only suits interruptible work.'
  },
  {
    id: 'ace-m1-092',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Which role, granted on the organization, lets someone create new Cloud Billing accounts?',
    options: ['Billing Account Creator', 'Billing Account Administrator', 'Project Billing Manager', 'Organization Viewer'],
    answer: 0,
    explanation: 'Billing Account Creator (`roles/billing.creator`) allows creating billing accounts in the organization. Billing Account Administrator manages an existing account, Project Billing Manager links projects, and Organization Viewer is read-only.'
  },
  {
    id: 'ace-m1-093',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Your manager asks which projects cost the most last month. Where can you see this quickly?',
    options: [
      'In Billing reports, grouped by project for last month',
      'In each project’s Compute Engine dashboard page',
      'On the Quotas and system limits page of each project',
      'In Cloud Monitoring, under the uptime checks list'
    ],
    answer: 0,
    explanation: 'Billing reports chart cost by project, service, SKU or label over any time range, straight from the console. Product dashboards and quota pages do not show money, and uptime checks measure availability.'
  },
  {
    id: 'ace-m1-094',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'You are provisioning a new GKE cluster and want system and workload logs in Cloud Logging and system metrics in Cloud Monitoring from day one. What do you need to do?',
    options: [
      'Nothing extra; GKE sends system and workload logs and system metrics by default.',
      'Install the Ops Agent on every node with a startup script after the node pool is created.',
      'Create a log sink from each node to Cloud Logging, because GKE sends no logs by default.',
      'Enable Data Access audit logs for GKE, which is how container logs reach Cloud Logging.'
    ],
    answer: 0,
    explanation: 'GKE integrates with Google Cloud Observability out of the box: system and workload logs go to Cloud Logging and system metrics to Cloud Monitoring, adjustable with `--logging` and `--monitoring` (Managed Service for Prometheus can be enabled too). The Ops Agent is for VMs, and audit logs record API calls, not container output.'
  },
  {
    id: 'ace-m1-095',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'You need a list of every Compute Engine VM across all projects in the organization, with its name, project and location. What is the most efficient way?',
    options: [
      '`gcloud asset search-all-resources --scope=organizations/ORG_ID --asset-types=compute.googleapis.com/Instance`',
      'Run `gcloud compute instances list` in each project and combine the outputs in a spreadsheet',
      '`gcloud compute instances list --organization=ORG_ID --all-projects`',
      'Read the billing export, which has one row for every VM that exists right now'
    ],
    answer: 0,
    explanation: 'Cloud Asset Inventory searches resource metadata across an organization, folder or project in one call. Looping over projects is slow, `instances list` has no organization flag, and the billing export lists charges, not the current inventory.'
  },
  {
    id: 'ace-m1-096',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'Security wants to analyse with SQL the configuration of every resource in the organization as it is right now. What should you do?',
    options: [
      'Export a Cloud Asset Inventory snapshot of resources to a BigQuery table and query it.',
      'Route Admin Activity audit logs to BigQuery and query the entries of the last 30 days.',
      'Query the billing export in BigQuery, which records each resource’s full configuration.',
      'Use the Logs Explorer with a filter that matches every resource type in the organization.'
    ],
    answer: 0,
    explanation: '`gcloud asset export` writes a point-in-time snapshot of resource (or IAM policy) metadata to Cloud Storage or BigQuery, ready for SQL. Audit logs record changes, not the full current state, billing data holds costs, and the Logs Explorer searches logs.'
  },
  {
    id: 'ace-m1-097',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'hard',
    prompt: 'The security team must be notified within minutes whenever a firewall rule is created or changed anywhere in the organization, with the new configuration included. What should you set up?',
    options: [
      'A Cloud Asset Inventory feed for firewall assets on the organization, publishing changes to Pub/Sub.',
      'A daily Cloud Asset Inventory export of firewall rules to BigQuery with a scheduled diff query.',
      'A budget on the networking SKUs that alerts the security team whenever spending changes.',
      'An uptime check against every VM that alerts the team when a firewall rule blocks it.'
    ],
    answer: 0,
    explanation: 'Asset feeds send real-time notifications of changes to the chosen asset types, including the new state, to a Pub/Sub topic that a function or SIEM can consume. A daily export is not "within minutes", and budgets and uptime checks do not see configuration changes. Audit logs routed to Pub/Sub are another valid signal.'
  },
  {
    id: 'ace-m1-098',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'You need to see what a particular firewall rule looked like two weeks ago, before someone changed it. Which tool can show this?',
    options: [
      'Cloud Asset Inventory asset history, which keeps changes for the last 35 days',
      'The VPC firewall rules page, which shows every past version of each rule',
      'Firewall Rules Logging, which stores the rule’s configuration with each entry',
      'Recommender, which keeps old versions of resources so they can be rolled back'
    ],
    answer: 0,
    explanation: '`gcloud asset get-history` (or the console) returns an asset’s past states for up to 35 days. The firewall page shows only the current rule, firewall logs record connections, and Recommender suggests changes. Admin Activity audit logs would show who made the change.'
  },
  {
    id: 'ace-m1-099',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'An employee is leaving and you must find every resource in the organization where their user account appears in an IAM policy. What should you run?',
    options: [
      '`gcloud asset search-all-iam-policies --scope=organizations/ORG_ID --query="policy:user:ana@example.com"`',
      '`gcloud projects get-iam-policy --all --filter="ana@example.com"`',
      '`gcloud iam roles list --member=user:ana@example.com --organization=ORG_ID`',
      '`gcloud asset search-all-resources --scope=organizations/ORG_ID --query="ana@example.com"`'
    ],
    answer: 0,
    explanation: '`search-all-iam-policies` searches the allow policies of every resource in the scope for a principal, role or permission. `get-iam-policy` works on one project at a time, `roles list` lists roles, and resource search looks at resource metadata, not IAM bindings.'
  },
  {
    id: 'ace-m1-100',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'easy',
    prompt: 'An engineer new to the project wants to ask, in plain language in the console, which VMs have external IP addresses and why yesterday’s deployment failed. Which tool is designed for this?',
    options: ['Gemini Cloud Assist', 'Gemini Code Assist', 'Cloud Shell tutorials', 'Recommender'],
    answer: 0,
    explanation: 'Gemini Cloud Assist is the AI assistant in the Google Cloud console: it answers questions about your resources (drawing on sources such as Cloud Asset Inventory), helps troubleshoot with logs and metrics, and suggests optimisations. Gemini Code Assist helps write code in IDEs, and Recommender gives specific recommendations rather than answering questions.'
  }
];
