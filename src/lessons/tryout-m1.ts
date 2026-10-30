/**
 * Tryout prep for course Module 1, sessions 1–2 (exam guide Section 1):
 * regions and the tools, the resource hierarchy and organization policies,
 * projects, APIs and quotas, IAM with Cloud Identity and Workforce Identity
 * Federation, billing, observability and Cloud Asset Inventory — then the
 * LAB01 walkthrough and a check before the module try-out (M1 · Set 1–5 in
 * exams/ace/sets.ts). Names and defaults checked against the Google Cloud docs
 * in October 2026.
 */
import type { Lesson } from '@/types';

const FIG_HIERARCHY = `<svg viewBox="0 0 640 232" role="img" aria-label="Organization, folders, projects, resources">
  <g fill="none" stroke="currentColor" stroke-width="1.2">
    <rect x="250" y="10" width="140" height="34" rx="2"/>
    <rect x="90" y="80" width="160" height="34" rx="2"/>
    <rect x="390" y="80" width="160" height="34" rx="2"/>
    <rect x="20" y="150" width="130" height="34" rx="2"/>
    <rect x="170" y="150" width="130" height="34" rx="2"/>
    <rect x="340" y="150" width="130" height="34" rx="2"/>
    <rect x="490" y="150" width="130" height="34" rx="2"/>
    <path d="M320 44 V62 H170 V80 M320 62 H470 V80 M170 114 V132 H85 V150 M170 132 H235 V150 M470 114 V132 H405 V150 M470 132 H555 V150"/>
  </g>
  <g fill="currentColor" font-size="13" text-anchor="middle">
    <text x="320" y="32">Organization</text>
    <text x="170" y="102">Folder: prod</text>
    <text x="470" y="102">Folder: dev</text>
    <text x="85" y="172">shop-prod</text>
    <text x="235" y="172">data-prod</text>
    <text x="405" y="172">shop-dev</text>
    <text x="555" y="172">sandbox</text>
    <text x="320" y="216" font-size="12">Allow policies and organization policies flow down; resources live in projects</text>
  </g>
</svg>`;

export const lesson: Lesson = {
  id: 'tryout-m1',
  lang: 'en',
  title: 'Tryout Prep · Module 1: Cloud Foundations & Environment Setup',
  intro:
    'Module 1 is exam guide Section 1, about a fifth of the exam: getting an environment ready before anything runs in it. This lesson follows sessions 1 and 2 of the course in order. It covers regions and the tools, the resource hierarchy and organization policies, and projects, APIs and quotas. Then IAM with Cloud Identity and Workforce Identity Federation, and billing, observability and Cloud Asset Inventory. Each section gives the decision the topic turns on, the commands to recognise, the words the exam uses to point at the answer, and one question. Finish with the LAB01 walkthrough and the check before the try-out. Then sit M1 · Set 1 to 5 on the home page: five fixed sets of 20 questions, 24 minutes each.',
  parts: [
    {
      id: 's1',
      title: 'Session 1 · Cloud foundations, hierarchy, IAM and billing',
      sections: [
        {
          id: 'm1-regions',
          title: 'S1-01 · Regions, zones, product availability and the tools',
          blocks: [
            {
              kind: 'p',
              text: 'Google Cloud resources live in a **zone** (a deployment area inside a region, like `asia-southeast2-a`), a **region** (three or more zones, like `asia-southeast2` in Jakarta), a **multi-region** (`US`, `EU`, `ASIA` for some storage and data products), or are **global**. Where a resource lives decides which failure it survives. A zonal VM goes down with its zone. A regional resource survives the loss of a zone, and a multi-region or global one survives the loss of a region.'
            },
            {
              kind: 'table',
              caption: 'Scope of common resources',
              columns: ['Scope', 'Examples'],
              rows: [
                ['Zonal', 'VM instance, zonal persistent disk and Hyperdisk, zonal MIG, zonal GKE cluster, Local SSD'],
                ['Regional', 'Subnet, static external IP (regional), regional disk, regional MIG, regional GKE cluster, Cloud Run service, Cloud SQL instance, Cloud NAT'],
                ['Multi-region', 'Cloud Storage `US` / `EU` / `ASIA` buckets, BigQuery `US` / `EU` datasets, Spanner and Firestore multi-region configurations'],
                ['Global', 'VPC network, VPC firewall rules, routes, images, instance templates (global ones), global external Application Load Balancer, Cloud DNS']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Pick a region** for latency to users, data residency rules, and price, which differs between regions. Also check that the products you need are offered there.',
                '**Not everything is everywhere.** Machine series, GPUs, TPUs and some products are only in some regions or zones, so check before you promise a location.',
                '**High availability** means spreading across zones in one region. **Disaster recovery** means a second region.'
              ]
            },
            {
              kind: 'code',
              title: 'Check what a location offers',
              lines: [
                '$ gcloud compute regions list',
                '$ gcloud compute zones list --filter="region:asia-southeast2"',
                '$ gcloud compute machine-types list --filter="zone:asia-southeast2-a AND name~^c3"',
                '$ gcloud compute accelerator-types list --filter="zone:asia-southeast1-b"'
              ]
            },
            {
              kind: 'table',
              caption: 'Four ways to drive Google Cloud',
              columns: ['Tool', 'What it is', 'Use when'],
              rows: [
                ['Google Cloud console', 'The web UI', 'Exploring, one-off changes, dashboards'],
                ['Cloud Shell', 'A browser terminal on a temporary VM with `gcloud`, `kubectl`, `terraform`, `docker` and 5 GB of persistent `$HOME`; Cloud Shell Editor included', 'Quick work from any browser, nothing to install'],
                ['Google Cloud CLI', '`gcloud` plus `bq`, `gsutil` (legacy) and components such as `kubectl`', 'Scripts and repeatable admin work'],
                ['APIs and client libraries', 'REST/gRPC APIs; Terraform and SDKs sit on top', 'Applications and infrastructure as code']
              ]
            },
            {
              kind: 'code',
              title: 'gcloud basics: sign-in, configurations, output',
              lines: [
                '$ gcloud init',
                '$ gcloud auth login                       # credentials for gcloud itself',
                '$ gcloud auth application-default login   # credentials for code you run locally (ADC)',
                '$ gcloud auth list',
                '$ gcloud config configurations create dev',
                '$ gcloud config set project ace-dev-123',
                '$ gcloud config set compute/region asia-southeast2',
                '$ gcloud config configurations activate prod',
                '$ gcloud config list',
                '$ gcloud compute instances list --project=ace-prod-123 \\',
                '    --filter="status=RUNNING" --format="table(name, zone.basename(), status)"',
                '$ gcloud components install kubectl gke-gcloud-auth-plugin'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Highly available across zones" → a regional resource (regional MIG, regional disk, regional cluster). "Survive a regional outage" → resources in two regions. "Lowest latency for users in Indonesia" → `asia-southeast2`. "Switch quickly between projects and accounts" → gcloud **configurations**. "Code on my laptop gets permission errors but gcloud works" → run `gcloud auth application-default login`, because ADC is separate from `gcloud auth login`.'
            },
            {
              kind: 'quiz',
              q: 'You switch many times a day between a dev project in Jakarta and a prod project in Singapore, each with its own account. What is the least effort way to change all defaults at once?',
              options: ['Run `gcloud init` each time', 'Create one gcloud configuration per environment and activate the one you need', 'Add `--project` and `--region` to every command', 'Open a separate Cloud Shell session per project'],
              answer: 1,
              explain: 'A configuration stores account, project, region and zone together; `gcloud config configurations activate` switches them all in one command.'
            }
          ]
        },
        {
          id: 'm1-hierarchy',
          title: 'S1-02 · Resource hierarchy, organization policies and a standalone organization',
          blocks: [
            {
              kind: 'p',
              text: 'The hierarchy is **Organization → Folders → Projects → Resources**. The organization is the root node for a company. **Folders** group projects by department, environment or team and can nest up to 10 levels. **Projects** hold the resources and are the unit for APIs, quotas, billing links and most IAM. Every resource belongs to exactly one project.'
            },
            { kind: 'figure', svg: FIG_HIERARCHY, caption: 'Grant a role or set an organization policy on the `prod` folder and it applies to `shop-prod`, `data-prod` and everything in them.' },
            {
              kind: 'list',
              items: [
                '**IAM allow policies inherit downward and add up.** A role granted on a folder applies to every project in it. A grant lower down cannot take away a grant from higher up. Only an **IAM deny policy** can block it.',
                '**Organization policies** restrict **what** can be configured, whoever does it. IAM decides **who** can act. A child inherits its parent’s policy unless a policy set on the child **overrides** it, or **merges** with it for list constraints (`inheritFromParent: true`).',
                'Changing organization policies needs **Organization Policy Administrator** (`roles/orgpolicy.policyAdmin`), granted at the organization. Project owners do not have it.',
                'New policies can run in **dry-run** mode first, to show what would be blocked. **Custom constraints** (CEL on resource fields) cover cases the predefined constraints do not.',
                'Moving a project to another folder changes what it inherits, immediately.'
              ]
            },
            {
              kind: 'table',
              caption: 'Constraints the exam likes',
              columns: ['Constraint', 'Effect'],
              mono: [0],
              rows: [
                ['gcp.resourceLocations', 'Resources only in the allowed locations, for data residency'],
                ['compute.vmExternalIpAccess', 'No external IPs on VMs, or only on the listed VMs'],
                ['iam.allowedPolicyMemberDomains', 'Domain restricted sharing: only identities from your Cloud Identity customer IDs can be granted roles'],
                ['iam.disableServiceAccountKeyCreation', 'No downloadable service account keys (enforced on new organizations through its managed form `iam.managed.disableServiceAccountKeyCreation`)'],
                ['compute.requireOsLogin', 'OS Login on every VM'],
                ['compute.skipDefaultNetworkCreation', 'New projects do not get the `default` network'],
                ['storage.uniformBucketLevelAccess', 'Buckets must use uniform bucket-level access, with no object ACLs'],
                ['storage.publicAccessPrevention', 'Buckets cannot be made public'],
                ['sql.restrictPublicIp', 'Cloud SQL instances cannot have a public IP'],
                ['iam.automaticIamGrantsForDefaultServiceAccounts', 'Default service accounts are not given Editor when created']
              ]
            },
            {
              kind: 'code',
              title: 'Folders, moving a project, a location policy',
              lines: [
                '$ gcloud resource-manager folders create --display-name=prod --organization=123456789012',
                '$ gcloud projects move shop-dev-123 --folder=555444333222',
                '# locations.yaml: only Jakarta and Singapore',
                'name: organizations/123456789012/policies/gcp.resourceLocations',
                'spec:',
                '  rules:',
                '  - values:',
                '      allowedValues: [in:asia-southeast2-locations, in:asia-southeast1-locations]',
                '$ gcloud org-policies set-policy locations.yaml',
                '$ gcloud org-policies describe gcp.resourceLocations --project=ace-lab-123 --effective',
                '$ gcloud org-policies list --organization=123456789012'
              ]
            },
            {
              kind: 'table',
              caption: 'Which kind of organization',
              columns: ['', 'Cloud Identity / Google Workspace organization', 'Standalone organization'],
              rows: [
                ['Created by', 'Signing up Cloud Identity or Workspace for a domain you verify', 'Signing up for Google Cloud with a Google account, with no domain needed'],
                ['Users', 'Managed accounts in your domain', 'The people you add as owners, federated identities included'],
                ['Good for', 'Companies with a domain and a directory', 'Getting folders, organization policies and org-wide IAM without a domain']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Secure by default:** organizations created on or after 3 May 2024 start with a set of enforced policies. They block service account key creation and upload, give no automatic Editor to default service accounts, restrict sharing to your own domain, require uniform bucket-level access, limit contact domains and restrict protocol forwarding.'
              ]
            },
            {
              kind: 'case',
              title: 'One project needs an exception to an org-wide rule',
              situation: 'The organization denies external IPs on every VM (`compute.vmExternalIpAccess`). The network team needs exactly one VM with a public IP, `vpn-1` in project `edge-prod`, for a partner appliance.',
              diagnose: [
                'The constraint is a **list** constraint, so it can name the instances that are allowed.',
                'A policy set on the project overrides the one it would inherit from the organization.',
                'Only someone with Organization Policy Administrator can set it. A project owner cannot.'
              ],
              fix: [
                '# edge.yaml',
                'name: projects/edge-prod/policies/compute.vmExternalIpAccess',
                'spec:',
                '  rules:',
                '  - values:',
                '      allowedValues: [projects/edge-prod/zones/asia-southeast2-a/instances/vpn-1]',
                '$ gcloud org-policies set-policy edge.yaml'
              ],
              why: 'The lowest policy that sets the constraint decides for its part of the tree, so a narrow exception on one project keeps the rule everywhere else.',
              exam: '"Allow one exception without weakening the rule for everyone" → a project-level (or folder-level) policy naming only that resource.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Apply the same access to every project of a department" → grant on the **folder**. "Nobody may create resources outside Jakarta and Singapore, owners included" → `gcp.resourceLocations`. "Stop people sharing resources with Gmail accounts" → `iam.allowedPolicyMemberDomains`. "Prevent anyone from …" usually means an organization policy, not IAM.'
            },
            {
              kind: 'quiz',
              q: 'A user has Editor on a folder. On a project inside it they were given only Viewer. What can they do in the project?',
              options: ['Only view: the project grant wins', 'Edit: the folder grant is inherited and adds to the project grant', 'Nothing until the grants are reconciled', 'Edit only after the project owner approves'],
              answer: 1,
              explain: 'Allow policies are a union down the hierarchy. To take Editor away you must remove it on the folder, or block it with a deny policy.'
            }
          ]
        },
        {
          id: 'm1-projects',
          title: 'S1-03 · Projects, APIs, quotas and the first network',
          blocks: [
            {
              kind: 'table',
              caption: 'The three identifiers of a project',
              columns: ['Field', 'Can change?', 'Notes'],
              rows: [
                ['Project name', 'Yes', 'Display only, need not be unique'],
                ['Project ID', '**No**', 'Globally unique, chosen at creation, used in `gcloud`, URLs and bucket defaults'],
                ['Project number', 'No', 'Assigned by Google; appears in default service account and service agent emails']
              ]
            },
            {
              kind: 'code',
              title: 'Create, link billing, enable APIs, delete and restore',
              lines: [
                '$ gcloud projects create ace-lab-123 --folder=123456789 --name="ACE Lab" --labels=env=lab,team=ops',
                '$ gcloud billing projects link ace-lab-123 --billing-account=0X0X0X-0X0X0X-0X0X0X',
                '$ gcloud services enable compute.googleapis.com container.googleapis.com run.googleapis.com',
                '$ gcloud services list --enabled',
                '# Deleting shuts the project down; it can be restored for 30 days',
                '$ gcloud projects delete ace-lab-123',
                '$ gcloud projects undelete ace-lab-123'
              ]
            },
            {
              kind: 'list',
              items: [
                'Most services need their **API enabled** in the project before first use. "API has not been used in project … or it is disabled" is fixed with `gcloud services enable`. Enabling an API can create that service’s **service agent** in the project.',
                '**Quotas** cap usage per project, and often per region. **Allocation quotas** cap how much you can hold, such as CPUs, IPs and GPUs. **Rate quotas** cap API calls per minute. **System limits** are fixed and cannot be raised.',
                'See quotas and ask for more in **IAM & Admin → Quotas & system limits** (Cloud Quotas). The **quota adjuster** can watch usage and request increases on its own when you get close. GPU quotas often start at 0.',
                'A quota error is not a permissions problem, and creating another project to get around it is never the answer.',
                '**Labels** (`env=prod`, `team=data`) are key/value pairs for filtering and for cost breakdowns in billing exports. **Tags** (Resource Manager tags) are different: they are governed by IAM and can be used in policy conditions and firewall policies.'
              ]
            },
            {
              kind: 'code',
              title: 'Read quotas from the command line',
              lines: [
                '$ gcloud compute regions describe asia-southeast2 --flatten=quotas \\',
                '    --format="table(quotas.metric, quotas.limit, quotas.usage)"',
                '$ gcloud compute project-info describe --flatten=quotas \\',
                '    --format="table(quotas.metric, quotas.limit, quotas.usage)"'
              ]
            },
            {
              kind: 'p',
              text: 'The **first network** is part of setting up a project. Every new project gets an auto mode `default` network with permissive rules, unless the `compute.skipDefaultNetworkCreation` policy stops it. Production uses a **custom mode VPC** with planned, non-overlapping ranges, subnets only in the regions you use, baseline firewall rules (such as SSH only from the IAP range), Cloud NAT for private VMs, and often **Shared VPC** so one team runs the network for many projects. Module 4 goes deep on all of it.'
            },
            {
              kind: 'code',
              title: 'A first custom network',
              lines: [
                '$ gcloud compute networks create prod-vpc --subnet-mode=custom',
                '$ gcloud compute networks subnets create web-jkt --network=prod-vpc \\',
                '    --region=asia-southeast2 --range=10.10.0.0/24 --enable-private-ip-google-access',
                '$ gcloud compute firewall-rules create allow-iap-ssh --network=prod-vpc \\',
                '    --direction=INGRESS --action=ALLOW --rules=tcp:22 --source-ranges=35.235.240.0/20'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Deploy fails with QUOTA_EXCEEDED for CPUS in asia-southeast2" → request a quota increase for that region. "The API has not been used in the project" → enable the API. "Rename the project ID" → impossible; create a new project and move the workloads. "Project deleted by mistake yesterday" → `gcloud projects undelete` (within 30 days).'
            },
            {
              kind: 'quiz',
              q: 'A team creating GPU VMs in a new project gets an error that the quota for `NVIDIA_L4_GPUS` in the region is 0. What should they do?',
              options: ['Grant the team Compute Admin', 'Request a quota increase for that GPU in that region', 'Enable the Compute Engine API again', 'Create the VMs in another project'],
              answer: 1,
              explain: 'GPU quotas often start at zero in new projects. The fix is a quota increase request, not a role or another project.'
            }
          ]
        },
        {
          id: 'm1-iam',
          title: 'S1-04 · IAM, Cloud Identity users and groups, Workforce Identity Federation',
          blocks: [
            {
              kind: 'p',
              text: 'IAM answers **who** (a principal) can do **what** (a role, which is a set of permissions) on **which resource**. A **binding** joins principals to a role on a resource, and the bindings on a resource make up its **allow policy**. Permissions look like `service.resource.verb`, for example `compute.instances.start`.'
            },
            {
              kind: 'table',
              caption: 'Principals',
              columns: ['Written as', 'Who'],
              rows: [
                ['`user:ana@example.com`', 'A Google account: Cloud Identity, Workspace or Gmail'],
                ['`group:data-team@example.com`', 'A Google group, the recommended way to grant to people'],
                ['`serviceAccount:web-sa@ace-lab-123.iam.gserviceaccount.com`', 'A workload identity'],
                ['`domain:example.com`', 'Everyone in a Workspace or Cloud Identity domain'],
                ['`principalSet://iam.googleapis.com/locations/global/workforcePools/staff/group/admins`', 'A group from an external IdP through Workforce Identity Federation'],
                ['`allUsers` / `allAuthenticatedUsers`', 'Anyone on the internet / anyone with a Google account (public)']
              ]
            },
            {
              kind: 'table',
              caption: 'Role types',
              columns: ['Type', 'Example', 'Use when'],
              rows: [
                ['Basic', '`roles/owner`, `roles/editor`, `roles/viewer`', 'Almost never in production, because they are too broad'],
                ['Predefined', '`roles/compute.instanceAdmin.v1`, `roles/storage.objectViewer`', 'The default choice: per service and maintained by Google'],
                ['Custom', '`projects/ace-lab-123/roles/vmStarter`', 'No predefined role is narrow enough. Created at **organization or project** level, never on a folder']
              ]
            },
            {
              kind: 'code',
              title: 'Grant, read, remove',
              lines: [
                '$ gcloud projects add-iam-policy-binding ace-lab-123 \\',
                '    --member=group:data-team@example.com --role=roles/bigquery.dataViewer',
                '$ gcloud projects get-iam-policy ace-lab-123 --flatten="bindings[].members" \\',
                '    --filter="bindings.members:group:data-team@example.com" --format="value(bindings.role)"',
                '$ gcloud projects remove-iam-policy-binding ace-lab-123 \\',
                '    --member=user:ana@example.com --role=roles/editor'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Least privilege** means the narrowest predefined role, on the lowest resource that works, granted to a group.',
                '**Groups**: when ten analysts join, add them to the group that already has the role. Do not add ten bindings.',
                '**IAM Conditions** limit a binding by time or by resource, for example access until 31 December or only to resources whose name starts with `dev-`.',
                'The **IAM recommender** and **Policy Analyzer** show which grants go unused and who can reach a resource. Module 6 goes deeper.'
              ]
            },
            {
              kind: 'p',
              text: '**Cloud Identity** is where Google accounts and groups for your domain live, managed in the Admin console. Cloud Identity Free covers users and groups; Premium adds device and security management. **Google Workspace** includes it. A **super admin** manages the directory, which is separate from Google Cloud IAM roles.'
            },
            {
              kind: 'table',
              caption: 'Getting people in: manual and automated provisioning',
              columns: ['Need', 'Use'],
              rows: [
                ['A few users, by hand', 'Add them in the Admin console, or bulk upload a CSV'],
                ['Users and groups already in Active Directory or LDAP', '**Google Cloud Directory Sync (GCDS)**: a one-way, scheduled sync from AD/LDAP into Cloud Identity, run on your own server'],
                ['Users already in an IdP such as Microsoft Entra ID or Okta', '**Automatic provisioning (SCIM)** from the IdP into Cloud Identity'],
                ['Keep passwords in your own IdP', '**SSO** with SAML or OIDC: the accounts still exist in Cloud Identity, but sign-in happens at the IdP'],
                ['No Google accounts at all; sign in straight from the IdP', '**Workforce Identity Federation**']
              ]
            },
            {
              kind: 'p',
              text: '**Workforce Identity Federation** lets staff use the console, gcloud and APIs with identities from an external IdP (Entra ID, Okta, any OIDC or SAML provider), with nothing created or synced in Cloud Identity. You create a **workforce pool** at the organization, add a **provider** with an **attribute mapping** (for example `google.subject=assertion.sub`, `google.groups=assertion.groups`), then grant roles to `principal://` or `principalSet://` identifiers. A few products do not support federated users yet, so check before choosing it.'
            },
            {
              kind: 'code',
              title: 'Workforce pool, provider, role for an IdP group',
              lines: [
                '$ gcloud iam workforce-pools create staff --organization=123456789012 --location=global',
                '$ gcloud iam workforce-pools providers create-oidc entra --workforce-pool=staff --location=global \\',
                '    --issuer-uri=https://login.microsoftonline.com/TENANT_ID/v2.0 --client-id=CLIENT_ID \\',
                '    --attribute-mapping="google.subject=assertion.sub,google.groups=assertion.groups" \\',
                '    --web-sso-response-type=id-token --web-sso-assertion-claims-behavior=only-id-token-claims',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 --role=roles/viewer \\',
                '    --member="principalSet://iam.googleapis.com/locations/global/workforcePools/staff/group/cloud-viewers"'
              ]
            },
            {
              kind: 'table',
              caption: 'Workforce or Workload Identity Federation?',
              columns: ['', 'Workforce Identity Federation', 'Workload Identity Federation'],
              rows: [
                ['For', 'People: employees, partners', 'Software: AWS, Azure, on-premises, GitHub Actions'],
                ['Created at', 'Organization (workforce pool)', 'Project (workload identity pool)'],
                ['Replaces', 'Creating or syncing Google accounts', 'Service account keys'],
                ['Module', '1 (Section 1)', '6 (Section 4)']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'Answers that grant **Owner** or **Editor** are almost always wrong when a predefined role exists. "Users and groups live in on-premises Active Directory" → GCDS, plus SSO so passwords stay on-premises. "Use corporate Okta logins and do not create Google accounts" → Workforce Identity Federation. "Ten new analysts" → add them to the existing group.'
            },
            {
              kind: 'quiz',
              q: 'Your company signs in to everything with Okta and does not want to create or sync any user accounts in Google. Engineers need console and gcloud access. What should you configure?',
              options: ['Google Cloud Directory Sync from Okta', 'A service account key per engineer', 'Workforce Identity Federation with an Okta provider', 'Workload Identity Federation with an OIDC provider'],
              answer: 2,
              explain: 'Workforce Identity Federation is for people signing in from an external IdP with no Google accounts. Workload Identity Federation is for software, and GCDS creates accounts.'
            }
          ]
        },
        {
          id: 'm1-billing',
          title: 'S1-05 · Billing accounts, budgets and exports',
          blocks: [
            {
              kind: 'p',
              text: 'A **Cloud Billing account** pays for one or more projects. A **self-serve** account pays by card or bank account. An **invoiced** account is set up with Google’s sales team. A project with no linked billing account cannot use paid services. If billing is disabled, its resources are stopped and some may be deleted.'
            },
            {
              kind: 'table',
              caption: 'Billing roles',
              columns: ['Role', 'Granted on', 'Lets you'],
              rows: [
                ['Billing Account Creator', 'Organization', 'Create new billing accounts'],
                ['Billing Account Administrator', 'Billing account', 'Manage the account, payment methods, users and budgets'],
                ['Billing Account User', 'Billing account', '**Link projects** to this account (with Project Billing Manager or Owner on the project)'],
                ['Billing Account Viewer', 'Billing account', 'See costs and transactions, for finance and auditors'],
                ['Billing Account Costs Manager', 'Billing account', 'Budgets, cost views and exports, with no payment changes'],
                ['Project Billing Manager', 'Project, folder or organization', 'Link or unlink a project’s billing, with no other project rights']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Linking** needs permission on both sides: Billing Account User on the account, and Owner or Project Billing Manager on the project.',
                '**Budgets** can cover the whole billing account or be scoped to projects, services or labels. The amount is fixed or last month’s spend, with thresholds such as 50%, 90% and 100% of **actual** or **forecasted** spend. Alerts email the billing admins and users, and can also go to Cloud Monitoring notification channels or a **Pub/Sub topic**.',
                '**Budgets never stop spending.** To act automatically, send the budget to Pub/Sub and let a Cloud Run function react, for example by scaling down or by disabling billing as a last resort (which can delete resources).',
                '**Billing export to BigQuery** writes **standard usage cost**, **detailed usage cost** (per resource) and **pricing** data into a dataset, so you can query spend by project, label or SKU and chart it in Looker Studio. Turn it on early: an export does not give you the full history from before it was enabled.',
                '**Reports and the cost table** in the console answer quick questions. Use the **Pricing Calculator** before you build.',
                '**Discounts**: sustained use discounts apply automatically on series such as N1 and N2 (not E2). **Committed use discounts** cover steady load for 1 or 3 years. **Spot VMs** are for interruptible work.'
              ]
            },
            {
              kind: 'code',
              title: 'A budget with thresholds and a Pub/Sub topic',
              lines: [
                '$ gcloud billing budgets create --billing-account=0X0X0X-0X0X0X-0X0X0X \\',
                '    --display-name="lab budget" --budget-amount=100USD \\',
                '    --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 \\',
                '    --threshold-rule=percent=1.0,basis=forecasted-spend \\',
                '    --notifications-rule-pubsub-topic=projects/ace-lab-123/topics/budget-alerts',
                '$ gcloud billing projects describe ace-lab-123'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Finance must see costs but change nothing" → Billing Account Viewer. "A developer can create projects but cannot attach billing" → Billing Account User on the billing account. "Analyse spend by team label every month" → billing export to BigQuery. "Be warned before the month goes over" → a budget with a forecasted-spend threshold. "Stop spending automatically" → budget → Pub/Sub → function.'
            },
            {
              kind: 'quiz',
              q: 'A budget alert at 100% fires. What happens to the resources in the project?',
              options: ['They are stopped', 'Billing is disabled', 'Nothing: budget alerts only notify', 'New resources are blocked'],
              answer: 2,
              explain: 'Budgets notify. Any automatic action needs a Pub/Sub notification and your own code.'
            }
          ]
        },
        {
          id: 'm1-observe',
          title: 'S1-05 · Observability, Cloud Asset Inventory and Gemini Cloud Assist',
          blocks: [
            {
              kind: 'p',
              text: '**Google Cloud Observability** is Cloud Monitoring, Cloud Logging, Cloud Trace, Cloud Profiler and Error Reporting. Google services report metrics and logs on their own; provisioning observability means deciding what to collect and where it goes.'
            },
            {
              kind: 'table',
              caption: 'Day-one observability setup',
              columns: ['Decide', 'How'],
              rows: [
                ['See metrics of many projects in one place', 'Add them to the **metrics scope** of one scoping project'],
                ['Memory, disk and app logs from VMs', 'Install the **Ops Agent** on each VM, or across the fleet with VM Manager policies'],
                ['Who gets told when something breaks', 'Alerting policies with **notification channels** such as email, SMS, Slack, PagerDuty, Pub/Sub and webhooks'],
                ['Is the site up from outside', '**Uptime checks** on public endpoints, with an alert on failure'],
                ['How long logs are kept, and where', 'Log buckets, sinks and exclusions (Module 5)'],
                ['Who read the data', 'Turn on **Data Access audit logs** for the services that matter, since they are off by default except for BigQuery']
              ]
            },
            {
              kind: 'code',
              title: 'Ops Agent on a VM',
              lines: [
                '$ curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh',
                '$ sudo bash add-google-cloud-ops-agent-repo.sh --also-install',
                '$ sudo systemctl status google-cloud-ops-agent"*"'
              ]
            },
            {
              kind: 'p',
              text: '**Cloud Asset Inventory** is a searchable, time-stamped inventory of resources, IAM policies and organization policies across a project, folder or organization, with 35 days of history. It can **search**, **export** to BigQuery or Cloud Storage, and send **feeds** of changes to Pub/Sub. **Gemini Cloud Assist** is the AI assistant in the console. Ask it in plain language which VMs have external IPs, why a deployment failed, or what drives this month’s cost. It works with your permissions, and you review what it proposes before applying it.'
            },
            {
              kind: 'code',
              title: 'Cloud Asset Inventory',
              lines: [
                '$ gcloud asset search-all-resources --scope=organizations/123456789012 \\',
                '    --asset-types=compute.googleapis.com/Instance --query="state:RUNNING"',
                '$ gcloud asset search-all-iam-policies --scope=organizations/123456789012 --query="policy:roles/owner"',
                '$ gcloud asset export --organization=123456789012 --content-type=resource \\',
                '    --bigquery-table=projects/ace-lab-123/datasets/assets/tables/all --output-bigquery-force',
                '$ gcloud asset feeds create vm-changes --project=ace-lab-123 --content-type=resource \\',
                '    --asset-types=compute.googleapis.com/Instance --pubsub-topic=projects/ace-lab-123/topics/asset-changes'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Find every VM / everyone with Owner across the organization" → Cloud Asset Inventory search. "Analyse the inventory with SQL" → export to BigQuery. "React when someone creates a resource" → an asset feed to Pub/Sub. "Memory usage of the VM does not appear in Monitoring" → install the Ops Agent. "One dashboard for ten projects" → metrics scope.'
            },
            {
              kind: 'quiz',
              q: 'Security asks for a list of every principal that holds `roles/owner` anywhere in the organization, today. What is the fastest way?',
              options: ['Run `gcloud projects get-iam-policy` on every project', 'Search IAM policies with Cloud Asset Inventory at the organization scope', 'Read the Admin Activity audit logs', 'Ask each project owner'],
              answer: 1,
              explain: '`gcloud asset search-all-iam-policies --scope=organizations/… --query="policy:roles/owner"` searches every allow policy in the tree at once.'
            }
          ]
        }
      ]
    },
    {
      id: 's2',
      title: 'Session 2 · LAB01: initialise a project with least privilege',
      sections: [
        {
          id: 'm1-lab',
          title: 'LAB01 walkthrough',
          blocks: [
            {
              kind: 'p',
              text: 'The lab’s deliverable is a working sandbox project with documented IAM bindings and an active budget alert. The order matters: hierarchy first, then billing and APIs, then identities and roles, then guardrails.'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Create the project in the right folder', text: 'So it inherits the folder’s IAM and organization policies from the start.', code: ['gcloud projects create ace-lab-123 --folder=123456789 --labels=env=lab'] },
                { title: 'Link billing', text: 'Needs Billing Account User on the account.', code: ['gcloud billing projects link ace-lab-123 --billing-account=0X0X0X-0X0X0X-0X0X0X'] },
                { title: 'Enable only the APIs you need', text: 'Fewer APIs means a smaller attack surface and fewer surprise costs.', code: ['gcloud services enable compute.googleapis.com logging.googleapis.com monitoring.googleapis.com'] },
                { title: 'Create groups for people', text: 'In the Admin console (or synced from your directory): for example `lab-devs@` and `lab-viewers@`.' },
                {
                  title: 'Grant predefined roles to the groups',
                  text: 'Never Owner for daily work.',
                  code: [
                    'gcloud projects add-iam-policy-binding ace-lab-123 --member=group:lab-devs@example.com --role=roles/compute.instanceAdmin.v1',
                    'gcloud projects add-iam-policy-binding ace-lab-123 --member=group:lab-viewers@example.com --role=roles/viewer'
                  ]
                },
                { title: 'Create a dedicated service account for the workload', text: 'Do not use the Compute Engine default service account, which has Editor in older projects.', code: ['gcloud iam service-accounts create web-sa --display-name="web app"'] },
                {
                  title: 'Grant it only what it needs, on the resource',
                  text: 'For example, write logs on the project and read one bucket.',
                  code: [
                    'gcloud projects add-iam-policy-binding ace-lab-123 --member=serviceAccount:web-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/logging.logWriter',
                    'gcloud storage buckets add-iam-policy-binding gs://ace-lab-assets --member=serviceAccount:web-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/storage.objectViewer'
                  ]
                },
                { title: 'Add a budget with alerts', text: 'Thresholds at 50%, 90% and 100%, emailed to billing admins, optionally to Pub/Sub.', code: ['gcloud billing budgets create --billing-account=0X0X0X-0X0X0X-0X0X0X --display-name="lab" --budget-amount=50USD --threshold-rule=percent=0.5 --threshold-rule=percent=0.9 --threshold-rule=percent=1.0'] },
                { title: 'Document and verify the bindings', text: 'Save the allow policy; use Policy Troubleshooter to confirm a teammate can (or cannot) do something.', code: ['gcloud projects get-iam-policy ace-lab-123 --format=json > iam-bindings.json'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Granting on a **bucket**, dataset or topic is narrower than granting on the project. Prefer the lowest resource that works.'
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'The Compute Engine default service account (`PROJECT_NUMBER-compute@developer.gserviceaccount.com`) got the Editor role automatically in older projects. In a least-privilege lab, create your own service account and leave the default one unused.'
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Before the Module 1 try-out',
      sections: [
        {
          id: 'm1-cues',
          title: 'Cue → answer',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['same access for every project of a team', 'Grant on the folder, to a group'],
                ['nobody, owners included, may …', 'Organization policy constraint'],
                ['resources only in certain regions', '`gcp.resourceLocations`'],
                ['only our domain’s identities may be granted', '`iam.allowedPolicyMemberDomains`'],
                ['no service account keys', '`iam.disableServiceAccountKeyCreation`'],
                ['QUOTA_EXCEEDED', 'Request a quota increase in that region'],
                ['API not enabled', '`gcloud services enable`'],
                ['change the project ID', 'Impossible: new project'],
                ['users in Active Directory', 'GCDS (+ SAML SSO)'],
                ['external IdP, no Google accounts', 'Workforce Identity Federation'],
                ['link a project to billing', 'Billing Account User on the account + Project Billing Manager / Owner on the project'],
                ['finance views costs only', 'Billing Account Viewer'],
                ['analyse cost by label', 'Billing export to BigQuery'],
                ['budget must stop spending', 'Budget → Pub/Sub → function'],
                ['find all resources / owners across the org', 'Cloud Asset Inventory'],
                ['metrics from many projects', 'Metrics scope'],
                ['VM memory metrics missing', 'Ops Agent'],
                ['custom role on a folder', 'Not possible: organization or project']
              ]
            }
          ]
        },
        {
          id: 'm1-traps',
          title: 'Traps that cost points',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Removing a project-level role does nothing** when the same role is inherited from a folder or the organization. Remove it where it was granted.',
                '**Budgets only notify.** Answers claiming a budget "stops" or "caps" spending are wrong.',
                '**Organization policy vs IAM**: "who can" is IAM; "what is allowed at all" is an organization policy.',
                '**GCDS syncs one way**, from AD/LDAP to Cloud Identity, and does not sync passwords for sign-in. SSO keeps passwords at the IdP.',
                '**Billing Account User is not enough on its own** to link a project. You also need rights on the project.',
                '**Basic roles** (Owner, Editor) are a wrong answer whenever a predefined role fits.',
                '**`gcloud auth login` ≠ ADC.** Local code uses Application Default Credentials (`gcloud auth application-default login`).',
                '**Creating a new project to dodge a quota** is never the intended answer.'
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
              q: 'Each department must manage its own projects, and the security team must apply rules to all production projects at once. How should you structure the hierarchy?',
              options: ['One project per department with all environments inside it', 'Folders per department with prod and non-prod folders under them, and policies set on the folders', 'Separate organizations per department', 'Labels on projects, with IAM granted per label'],
              answer: 1,
              explain: 'Folders group projects for both inheritance and delegation. Policies on a prod folder reach every production project under it.'
            },
            {
              kind: 'quiz',
              q: 'Which identifier must you choose carefully because it can never be changed?',
              options: ['Project name', 'Project ID', 'Billing account name', 'Folder display name'],
              answer: 1,
              explain: 'The project ID is fixed for the life of the project. Names can be changed.'
            },
            {
              kind: 'quiz',
              q: 'A developer can create projects in a folder but gets a permission error when linking them to the company billing account. What should you grant?',
              options: ['Billing Account Administrator on the billing account', 'Billing Account User on the billing account', 'Project Billing Manager on the organization', 'Owner on the organization'],
              answer: 1,
              explain: 'They already own the projects they create. The missing half is Billing Account User on the billing account.'
            },
            {
              kind: 'quiz',
              q: 'An auditor must be able to read every IAM policy and resource configuration in the organization, but change nothing. Which is the best grant?',
              options: ['Viewer on each project', 'Editor on the organization with a deny policy', 'A viewer-type role such as Security Reviewer and Viewer, granted on the organization to the auditors’ group', 'Organization Administrator'],
              answer: 2,
              explain: 'Read-only roles granted once at the organization reach everything below it. Granting on each project misses new projects, and Editor is far too broad.'
            },
            {
              kind: 'quiz',
              q: 'You need to be warned when spending is on track to exceed the monthly budget, before it does. What do you configure?',
              options: ['A threshold rule on forecasted spend', 'A threshold rule on actual spend at 100%', 'A quota on the billing account', 'Billing export to BigQuery'],
              answer: 0,
              explain: 'Forecasted-spend thresholds alert when Google projects you will cross the amount. Actual-spend thresholds fire only after you do.'
            },
            {
              kind: 'quiz',
              q: 'New projects must not get the auto mode `default` network. What is the most efficient control?',
              options: ['Delete the default network in each new project', 'Set the `compute.skipDefaultNetworkCreation` organization policy', 'Remove Compute Network Admin from everyone', 'Create a firewall rule that denies all traffic'],
              answer: 1,
              explain: 'The organization policy stops the network being created at all, in every project below where it is set.'
            },
            {
              kind: 'quiz',
              q: 'Your users and groups live in on-premises Active Directory, and passwords must stay on-premises. What is the standard setup?',
              options: ['Workload Identity Federation', 'GCDS to sync users and groups, plus SAML SSO to AD FS', 'Create the users by hand in Cloud Identity', 'Give each user a service account'],
              answer: 1,
              explain: 'GCDS provisions accounts and groups, while SSO keeps authentication, and so the passwords, at your identity provider.'
            },
            {
              kind: 'quiz',
              q: 'Which statement about IAM custom roles is true?',
              options: ['They can be created on folders', 'They are maintained by Google when permissions change', 'They are created at organization or project level and you maintain them', 'They can include any permission, including those marked not supported'],
              answer: 2,
              explain: 'Custom roles live at organization or project level. You keep them up to date, and only supported (or testing) permissions can be used.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: getting started', href: '#/ace/lab/cmd/start', note: 'gcloud init, configurations, projects' },
    { label: 'Command quiz: credentials, projects and IAM', href: '#/ace/lab/cmd/auth', note: 'auth, bindings, roles' },
    { label: 'Terminal: day one — project, zone, VM', href: '#/ace/lab/terminal/first-vm', note: 'gcloud from zero' },
    { label: 'Terminal: a project without billing', href: '#/ace/lab/terminal/billing', note: 'link billing, enable APIs' },
    { label: 'Terminal: least-privilege service account', href: '#/ace/lab/terminal/iam-sa', note: 'the LAB01 idea, hands-on' },
    { label: 'Deep dive: the ACE exam guide', href: '#/ace/learn/ace-guide', note: 'Section 1, consideration by consideration' }
  ]
};
