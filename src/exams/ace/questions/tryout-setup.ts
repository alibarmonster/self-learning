/**
 * Tryout questions, Setting up a cloud solution environment — the 40 that
 * join the 10 in tryout.ts to make 50: hierarchy and organization policy,
 * Cloud Identity, projects, gcloud, APIs and quotas, billing and cost.
 * Course modules MD1-S1-01 to S1-05.
 */
import type { Question } from '@/types';

export const tryoutSetup: Question[] = [
  {
    id: 'ace-t51',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A startup created its Google Cloud projects with employees’ personal Gmail accounts. When people leave, the company loses access to their projects. The company owns the domain example.com. What should it do first to take central ownership of its projects?',
    options: [
      'Sign up for Cloud Identity with example.com so an organization resource is created, then move the projects under it.',
      'Ask every employee to add the CEO’s Gmail account as an Owner on each project they created in the past.',
      'Create a shared Gmail account for the company and transfer all projects to it by changing their Owner role.',
      'Create one billing account per employee so that each person is responsible for the projects they created.'
    ],
    answer: 0,
    explanation: 'An organization resource exists only with Cloud Identity or Google Workspace for a domain. Once it exists, projects can be migrated under it, and access is managed through company accounts and groups that survive people leaving. Adding Gmail owners or sharing an account keeps the same problem.'
  },
  {
    id: 'ace-t52',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'A project is moved from the Finance folder to the Marketing folder. Finance analysts had BigQuery Data Viewer granted on the Finance folder, and nothing granted directly on the project. What happens to their access to the project?',
    options: [
      'They lose it, because the project now inherits from the Marketing folder instead of Finance.',
      'They keep it, because inherited grants are copied onto the project when it is moved.',
      'They keep it for 30 days, after which the inherited grant from Finance expires.',
      'Nothing changes until an Owner runs a command to refresh the inherited policies.'
    ],
    answer: 0,
    explanation: 'Inherited permissions come from the project’s current ancestors. After the move the project inherits from Marketing and the organization, so grants made only on the Finance folder no longer apply — immediately. Check inherited roles and organization policies before moving projects.'
  },
  {
    id: 'ace-t53',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Security requires that no Compute Engine VM in the organization has an external IP address. Which organization policy constraint should you enforce?',
    options: [
      'constraints/compute.vmExternalIpAccess',
      'constraints/compute.requireOsLogin',
      'constraints/gcp.resourceLocations',
      'constraints/iam.allowedPolicyMemberDomains'
    ],
    answer: 0,
    explanation: '`compute.vmExternalIpAccess` lists which VMs may have external IPs; set to deny all, no VM can get one. requireOsLogin enforces OS Login, resourceLocations limits regions, and allowedPolicyMemberDomains limits which domains can be granted IAM roles.'
  },
  {
    id: 'ace-t54',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'An organization policy at the organization node blocks external IP addresses on VMs. One project in the Sandbox folder runs a public test server that needs an external IP. What should you do?',
    options: [
      'Have an Organization Policy Administrator set a policy on that project that allows external IPs.',
      'Grant the project’s developers the Owner role so they can ignore the organization policy.',
      'Move the project out of the organization so that it is no longer under any policy.',
      'Give the VM an internal IP and ask testers to connect through a personal VPN client.'
    ],
    answer: 0,
    explanation: 'Organization policies can be overridden lower in the hierarchy by someone with Organization Policy Administrator, so a policy on that one project can allow external IPs while the rest of the organization stays blocked. IAM roles such as Owner do not bypass organization policies.'
  },
  {
    id: 'ace-t55',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Your company wants to make sure IAM roles can only ever be granted to identities from its own Cloud Identity domain, never to outside Gmail accounts. What should you configure?',
    options: [
      'The domain restricted sharing constraint iam.allowedPolicyMemberDomains with your customer ID.',
      'An IAM deny policy that blocks every Gmail account from all permissions in the organization.',
      'A custom role without the setIamPolicy permission, granted to every project Owner.',
      'A VPC Service Controls perimeter around all projects in the organization.'
    ],
    answer: 0,
    explanation: 'Domain restricted sharing (`iam.allowedPolicyMemberDomains`) rejects IAM bindings for principals outside the allowed Cloud Identity customer IDs. A deny policy cannot list every outside account; removing setIamPolicy stops all granting; VPC Service Controls protects data access, not who can be granted roles.'
  },
  {
    id: 'ace-t56',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Several Cloud Storage buckets were accidentally made public. You want to prevent any bucket in the organization from being shared publicly in the future. What should you do?',
    options: [
      'Enforce the storage.publicAccessPrevention organization policy constraint at the organization.',
      'Remove the Storage Admin role from everyone and grant Storage Object Viewer instead.',
      'Enable Object Versioning on every bucket so public objects can be restored later.',
      'Create a log-based alert that fires when a bucket policy grants access to allUsers.'
    ],
    answer: 0,
    explanation: 'Public access prevention blocks allUsers and allAuthenticatedUsers on buckets, and the organization policy applies it everywhere. Changing roles does not stop owners making buckets public, versioning is unrelated, and an alert only reports after the exposure happened.'
  },
  {
    id: 'ace-t57',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'A project hosts the company’s production DNS and must never be deleted by mistake, even by a project Owner, unless the protection is removed first on purpose. What should you do?',
    options: [
      'Place a lien on the project that restricts the resourcemanager.projects.delete permission.',
      'Remove the Owner role from everyone and give the team the Editor role instead.',
      'Enable deletion protection in the project settings so only Google Support can delete it.',
      'Take a daily export of the project configuration so it can be recreated after deletion.'
    ],
    answer: 0,
    explanation: 'A lien blocks project deletion until the lien itself is removed, which is a deliberate extra step. Editors can still delete in some setups and the team may need Owner; there is no project-level deletion protection switch; a recreated project would have a new number and lose its data.'
  },
  {
    id: 'ace-t58',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'An engineer deleted a project by mistake two days ago. Its resources are needed again. What should you do?',
    options: [
      'Run `gcloud projects undelete` with the project ID, because a deleted project can be restored for about 30 days.',
      'Create a new project with the same project ID and restore its data from the most recent backups you have.',
      'Open a support case, because only Google can restore a project after it has been deleted by a user.',
      'Nothing can be done, because deleting a project immediately and permanently removes all of its resources.'
    ],
    answer: 0,
    explanation: 'Deleting a project shuts it down and schedules deletion after about 30 days. During that period an Owner can restore it with `gcloud projects undelete` or from the console. The project ID cannot be reused while the project exists in that state.'
  },
  {
    id: 'ace-t59',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'Your company uses Microsoft Entra ID as its identity provider and does not want to create or sync user accounts into Cloud Identity. Employees still need to sign in to the Google Cloud console with their Entra ID accounts. What should you use?',
    options: [
      'Workforce Identity Federation with a workforce pool that trusts Entra ID.',
      'Google Cloud Directory Sync to copy Entra ID users into Cloud Identity.',
      'Workload Identity Federation for GKE connected to the Entra ID tenant.',
      'A service account key for each employee, stored in their Entra ID profile.'
    ],
    answer: 0,
    explanation: 'Workforce Identity Federation lets people from an external IdP use Google Cloud without Google accounts. GCDS syncs accounts, which is what the company wants to avoid; Workload Identity Federation is for workloads, not people; service account keys for people are a security anti-pattern.'
  },
  {
    id: 'ace-t60',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'You are designing the hierarchy for a company with Retail and Logistics departments, each running development and production workloads. Production must have stricter policies than development. Which structure follows Google-recommended practice?',
    options: [
      'Folders per department, each with Prod and Dev subfolders holding the projects, and stricter policies on the Prod folders.',
      'One project per department containing both production and development resources, separated by resource labels.',
      'All projects directly under the organization node, with policies set on each project individually as needed.',
      'One folder per developer, with each developer creating production and development projects inside their own folder.'
    ],
    answer: 0,
    explanation: 'Folders let you group projects and set policies once where they apply: environment folders under each department carry the stricter production policies. Mixing prod and dev in one project, or setting everything per project, makes isolation and governance hard.'
  },
  {
    id: 'ace-t61',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'The person who created your organization is its only Organization Administrator. You want administration to keep working if that person is unavailable, following Google-recommended practice. What should you do?',
    options: [
      'Grant the Organization Administrator role to a group of trusted administrators.',
      'Share the original administrator’s password with two other senior engineers.',
      'Grant the Owner role on every project to the IT department’s manager directly.',
      'Create a service account with Organization Administrator and keep its key safe.'
    ],
    answer: 0,
    explanation: 'Granting organization-level administration to a group removes the single point of failure and is managed by group membership. Sharing passwords breaks accountability, project Owner does not administer the organization, and a powerful service account key is a security risk.'
  },
  {
    id: 'ace-t62',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'hard',
    prompt: 'You want an organization policy that blocks external IPs to apply only to resources tagged `env=prod`, across many projects and folders. What should you use?',
    options: [
      'Resource Manager tags with a conditional organization policy that matches the env=prod tag.',
      'Resource labels with env=prod and a budget filter that matches those labels on each project.',
      'Network tags named env-prod on the VMs together with an ingress firewall rule for that tag.',
      'A separate organization for production resources with its own copy of the external IP policy.'
    ],
    answer: 0,
    explanation: 'Tags (Resource Manager tags) can be referenced in conditions on organization policies and IAM. Labels are for billing and filtering and cannot drive policy; network tags only target firewall rules and routes; a second organization is heavy and unnecessary.'
  },
  {
    id: 'ace-t63',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'easy',
    prompt: 'Which statement about IAM policy inheritance in Google Cloud is correct?',
    options: [
      'A role granted on a folder applies to all projects and resources below it.',
      'A role granted on a project overrides a stricter role granted on its folder.',
      'Roles granted on the organization apply only to projects created afterwards.',
      'Roles are inherited upward, so a project grant also applies to its folder.'
    ],
    answer: 0,
    explanation: 'Allow policies are inherited downward and combine as a union: the effective policy of a resource is its own policy plus those of all its ancestors. Nothing is inherited upward, organization grants apply to existing and new projects, and a lower grant cannot remove a higher one.'
  },
  {
    id: 'ace-t64',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Your company has 200 Active Directory groups that map to team roles. You want those groups available in Google Cloud so you can grant IAM roles to them, and membership changes in AD should flow through automatically. What should you do?',
    options: [
      'Configure Google Cloud Directory Sync to sync the AD groups and their members to Cloud Identity on a schedule.',
      'Recreate the 200 groups by hand in the Admin console and update their membership whenever AD changes.',
      'Grant IAM roles directly to each AD user’s email address and update the bindings when teams change.',
      'Create one service account per AD group and give team members permission to impersonate it.'
    ],
    answer: 0,
    explanation: 'GCDS syncs both users and groups from AD to Cloud Identity on a schedule, so the synced groups can be used as IAM principals and stay current. Manual groups and per-user grants drift; service accounts per team remove individual accountability.'
  },
  {
    id: 'ace-t65',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You manage a development project and a production project with different accounts, and switch between them many times a day. You want to switch with the fewest steps. What should you do?',
    options: [
      'Create a gcloud configuration for each environment and switch with `gcloud config configurations activate`.',
      'Run `gcloud auth login` and `gcloud config set project` every time you change environments during the day.',
      'Install the Google Cloud CLI twice on your workstation, once for each environment and account you use.',
      'Add `--project` and `--account` to every command you type, and keep a text file with the right values.'
    ],
    answer: 0,
    explanation: 'Named configurations hold the account, project and default region together, and one command switches all of them. Logging in and setting the project each time takes more steps; two installations or long flags on every command are error-prone.'
  },
  {
    id: 'ace-t66',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You want to see which APIs are currently enabled in the project `ace-lab-123`. Which command should you run?',
    options: [
      '`gcloud services list --enabled --project=ace-lab-123`',
      '`gcloud projects describe ace-lab-123 --apis`',
      '`gcloud services list --available --project=ace-lab-123`',
      '`gcloud config list --project=ace-lab-123`'
    ],
    answer: 0,
    explanation: '`gcloud services list --enabled` lists the APIs enabled in a project; `--available` lists every API you could enable. describe shows project metadata and has no --apis flag, and config list shows local gcloud settings.'
  },
  {
    id: 'ace-t67',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You keep typing `--zone=asia-southeast2-a` on every Compute Engine command. How can you make it the default for your current gcloud configuration?',
    options: [
      '`gcloud config set compute/zone asia-southeast2-a`',
      '`gcloud compute zones set-default asia-southeast2-a`',
      '`gcloud projects update --default-zone=asia-southeast2-a`',
      '`gcloud init --zone=asia-southeast2-a --no-prompt`'
    ],
    answer: 0,
    explanation: '`gcloud config set compute/zone` (and `compute/region`) stores a default in the active configuration. The other commands do not exist in that form. A project-wide default can also be set with project metadata `google-compute-default-zone`.'
  },
  {
    id: 'ace-t68',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A developer stores scripts in `/tmp` and in their home directory in Cloud Shell. The next day only the files in the home directory are still there. Why?',
    options: [
      'Only the 5 GB home directory persists between sessions; the rest of the VM is temporary.',
      'Cloud Shell deletes files in /tmp after one hour, but keeps every other directory.',
      'The /tmp files were moved to a Cloud Storage bucket created for the user’s project.',
      'Cloud Shell keeps files only for users who have the Owner role on the project.'
    ],
    answer: 0,
    explanation: 'Cloud Shell runs on a temporary VM; only `$HOME` sits on a 5 GB persistent disk that follows the user between sessions. Anything else, including installed packages outside home, is lost when the session ends.'
  },
  {
    id: 'ace-t69',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You need to create a project inside the folder whose ID is 482190335671. Which command should you use?',
    options: [
      '`gcloud projects create ace-shop-123 --folder=482190335671`',
      '`gcloud resource-manager folders create ace-shop-123 --folder=482190335671`',
      '`gcloud projects create ace-shop-123 --organization=482190335671`',
      '`gcloud projects move ace-shop-123 --folder=482190335671`'
    ],
    answer: 0,
    explanation: '`gcloud projects create` takes `--folder` (or `--organization`) as the parent. `folders create` makes a folder, the folder ID is not an organization ID, and `projects move` moves a project that already exists.'
  },
  {
    id: 'ace-t70',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'A Google service agent email contains a number instead of your project ID. Where can you find your project’s number?',
    options: [
      'Run `gcloud projects describe PROJECT_ID` and read projectNumber.',
      'Run `gcloud config list` and read the project field in the output.',
      'Open the billing account and read the number next to the project.',
      'It is the same as the project ID with the letters removed.'
    ],
    answer: 0,
    explanation: 'The project number is assigned by Google at creation and shown by `gcloud projects describe` and on the console dashboard. It appears in service agent addresses such as `service-123456789@gs-project-accounts.iam.gserviceaccount.com`.'
  },
  {
    id: 'ace-t71',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A script that creates many objects through an API starts failing with RATE_LIMIT_EXCEEDED errors during bursts, although it works most of the time. What should you do first?',
    options: [
      'Retry the failed calls with exponential backoff, and request a rate quota increase if bursts stay above the limit.',
      'Request a higher allocation quota for the number of objects that the project is allowed to store in total.',
      'Run the script from several projects at the same time so that each project uses a smaller share of the calls.',
      'Disable and re-enable the API in the project so that its rate limit counters reset to zero immediately.'
    ],
    answer: 0,
    explanation: 'Rate quotas limit calls per time window; the standard fix is retrying with exponential backoff, then a quota increase if the need is sustained. Allocation quotas cap how many resources exist, not call rate; spreading across projects to dodge quota or resetting the API are not supported fixes.'
  },
  {
    id: 'ace-t72',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You want to check how many CPUs, IP addresses and disks your project has used against its limits in asia-southeast2. Which command shows this?',
    options: [
      '`gcloud compute regions describe asia-southeast2`',
      '`gcloud compute zones list --filter=asia-southeast2`',
      '`gcloud services list --enabled --region=asia-southeast2`',
      '`gcloud billing accounts describe --region=asia-southeast2`'
    ],
    answer: 0,
    explanation: '`gcloud compute regions describe REGION` prints the regional quotas with their limits and current usage. The Quotas & system limits page in the console shows the same. zones list shows zones, services list shows APIs, and billing has no regional quotas.'
  },
  {
    id: 'ace-t73',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You plan to run G2 VMs with NVIDIA L4 GPUs in a zone of asia-southeast2. What should you check before the launch day?',
    options: [
      'That the GPU type is offered in that zone, and that the project’s GPU quota in the region is high enough.',
      'That the billing account has a committed use discount, because GPUs cannot be billed on demand.',
      'That the project is in a folder named GPU, because GPU quota is granted per folder.',
      'That the zone has no Spot VMs running, because GPUs and Spot VMs cannot share a zone.'
    ],
    answer: 0,
    explanation: 'Accelerators and machine series are available only in some zones, and GPU quota usually starts at zero, so both must be checked and a quota increase requested ahead of time. GPUs can be billed on demand, quotas are per project and region, and Spot VMs are unrelated.'
  },
  {
    id: 'ace-t74',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'You disable the Cloud Run Admin API in a project to clean up unused APIs. What is the effect on Cloud Run services already running there?',
    options: [
      'You can no longer manage them, and Cloud Run resources in the project may stop working.',
      'Nothing, because disabling an API only hides it from the APIs and Services page.',
      'They are moved to the default project of the user who disabled the API.',
      'They keep running and can still be updated with gcloud, but not in the console.'
    ],
    answer: 0,
    explanation: 'Disabling a service API stops the project from using that service; existing resources can no longer be managed and may stop serving, and gcloud warns about this. Check what uses an API before disabling it.'
  },
  {
    id: 'ace-t75',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You will deploy a web application for users in Indonesia that needs Cloud Run, Cloud SQL and C3 VMs. What should you confirm when choosing the region?',
    options: [
      'That every product and machine series you need is available in the region, close to the users.',
      'That the region has the largest number of zones of all Google Cloud regions in the world.',
      'That the region is in the United States, because new products always launch there first.',
      'That the region name matches the name of the billing account used by your project.'
    ],
    answer: 0,
    explanation: 'Not every product, machine series or accelerator exists in every region, so check availability, then pick the region nearest the users for latency (asia-southeast2 for Jakarta). Zone count and launch order do not decide the choice, and region names have nothing to do with billing.'
  },
  {
    id: 'ace-t76',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'A CI script must run several gcloud commands against `ace-prod-123` without changing the developer’s active configuration. What is the simplest option?',
    options: [
      'Pass `--project=ace-prod-123` on each command in the script.',
      'Run `gcloud config set project ace-prod-123` at the start of the script.',
      'Edit the project ID in the developer’s active configuration file.',
      'Delete the developer’s configuration before the script starts.'
    ],
    answer: 0,
    explanation: 'The `--project` flag overrides the configured project for that one command and leaves configurations alone. `config set` changes the active configuration for everyone using it; editing or deleting configurations is the opposite of what is wanted.'
  },
  {
    id: 'ace-t77',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Finance wants to see how much the development, staging and production environments cost each month, across many projects and services. What should you do?',
    options: [
      'Apply an env label to resources and group the cost reports or billing export by that label.',
      'Create a separate billing account for each environment and compare their monthly invoices.',
      'Name every resource with an env- prefix and search the invoice PDF for each prefix.',
      'Ask each team to report its own costs in a shared spreadsheet at the end of each month.'
    ],
    answer: 0,
    explanation: 'Labels are key-value pairs that flow into billing reports and the BigQuery billing export, so costs can be grouped by environment, team or application. Separate billing accounts add overhead; invoices do not break down by resource name; manual reports are unreliable.'
  },
  {
    id: 'ace-t78',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'A set of VMs runs 24 hours a day, every day, and will keep doing so for the next three years. You want the biggest discount on them. What should you buy?',
    options: [
      'A three-year committed use discount for the vCPUs and memory these VMs use.',
      'Spot VMs, recreated by a managed instance group whenever they are preempted.',
      'Nothing, because sustained use discounts are larger than any commitment.',
      'A one-month commitment that renews every month for the next three years.'
    ],
    answer: 0,
    explanation: 'Committed use discounts trade a 1- or 3-year commitment for a large discount on steady usage; 3 years gives the largest. Spot VMs suit interruptible work, not always-on services; sustained use discounts are smaller; there are no one-month commitments.'
  },
  {
    id: 'ace-t79',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'A team runs N2 VMs for most of each month without any commitment. At month end they see a discount on the invoice that they never asked for. What is it?',
    options: [
      'A sustained use discount, applied automatically when eligible VMs run for a large part of the month.',
      'A committed use discount, created automatically after a VM has run for more than seven days.',
      'A Spot VM discount, applied because the VMs were not restarted during the whole month.',
      'A free tier credit, applied to every project during its first year of use on Google Cloud.'
    ],
    answer: 0,
    explanation: 'Sustained use discounts apply automatically to eligible machine series (such as N1, N2, N2D, C2) that run for more than a quarter of the month, growing with usage. Commitments are never created automatically, Spot is a provisioning model you choose, and the free tier is a small fixed allowance.'
  },
  {
    id: 'ace-t80',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Before migrating, you want to estimate the monthly cost of 10 VMs, 2 TB of persistent disk and a Cloud SQL instance in asia-southeast2. What should you use?',
    options: [
      'The Google Cloud Pricing Calculator',
      'The billing export to BigQuery',
      'A budget with forecast alerts',
      'The Cost table report in billing'
    ],
    answer: 0,
    explanation: 'The Pricing Calculator estimates the cost of resources before you create them. The billing export, cost table and budgets all work on spend that has already happened in a billing account.'
  },
  {
    id: 'ace-t81',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Several projects share one billing account. The data team wants an alert when its own project, `ace-data-123`, passes USD 500 in a month. What should you create?',
    options: [
      'A budget on the billing account scoped to the ace-data-123 project, with a USD 500 amount and thresholds.',
      'A budget on the billing account covering every project, with a threshold rule set at USD 500 for the month.',
      'A Cloud Monitoring alert on the project’s CPU usage, set so that it fires when costs are likely to be high.',
      'A separate billing account for ace-data-123, with a budget of USD 500 set on that new billing account.'
    ],
    answer: 0,
    explanation: 'Budgets live on the billing account and can be scoped to particular projects, services or labels. A budget on all projects would fire on the total spend; CPU alerts do not measure money; a new billing account is unnecessary.'
  },
  {
    id: 'ace-t82',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'You want a warning early in the month if the current trend means a project will exceed its budget by month end, before the money is actually spent. How should you set the budget threshold?',
    options: [
      'Set the threshold rule to use forecasted spend instead of actual spend.',
      'Set the threshold at 10% of actual spend so that it fires early in the month.',
      'Create a daily budget instead of a monthly one for the same project.',
      'Set the budget amount to the last month’s spend so it always fires early.'
    ],
    answer: 0,
    explanation: 'Threshold rules can trigger on forecasted spend, which warns when the projected month-end cost crosses the threshold. A 10% actual threshold fires every month regardless of trend; budget periods are monthly, quarterly, yearly or custom, not a substitute for forecasting.'
  },
  {
    id: 'ace-t83',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'A team lead must be able to link and unlink their projects to billing accounts they are allowed to use, without getting any other permissions on those projects. Which role should you grant on the projects?',
    options: [
      'Project Billing Manager',
      'Project Owner',
      'Billing Account Administrator',
      'Project Editor'
    ],
    answer: 0,
    explanation: 'Project Billing Manager (`roles/billing.projectManager`) only lets a person change which billing account a project uses. Owner and Editor give far more on the project, and Billing Account Administrator is granted on the billing account, not the project.'
  },
  {
    id: 'ace-t84',
    topic: 'Billing & budgets',
    difficulty: 'hard',
    prompt: 'You must move a project from billing account A to billing account B. You are Project Billing Manager on the project. What else do you need?',
    options: [
      'Billing Account User (or Administrator) on billing account B.',
      'Billing Account Administrator on billing account A.',
      'Billing Account Viewer on both account A and account B.',
      'Nothing else; Project Billing Manager is enough on its own.'
    ],
    answer: 0,
    explanation: 'Linking a project to a billing account needs permission on the project (Project Billing Manager or Owner) and on the target billing account (Billing Account User or Administrator). Nothing is required on the old account, and Viewer cannot link.'
  },
  {
    id: 'ace-t85',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'What happens when you disable billing on a project that runs VMs and has data in Cloud Storage?',
    options: [
      'Billable services stop; the project can no longer use paid resources until billing is linked again.',
      'Nothing changes until the end of the month, when the next invoice is due to be paid in full.',
      'All resources keep running, but they are billed to the organization’s default account instead.',
      'The project is deleted immediately together with all of its VMs, disks and Cloud Storage data.'
    ],
    answer: 0,
    explanation: 'A project without an active billing account cannot use paid services: VMs are stopped and paid APIs fail. Resources may eventually be deleted if billing is not restored, which is why disabling billing is a drastic step, used for example in hard budget caps.'
  },
  {
    id: 'ace-t86',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'For chargeback, finance needs the cost of each individual VM and disk, not just totals per service and SKU. Which billing export should you enable?',
    options: [
      'The detailed usage cost export to BigQuery',
      'The standard usage cost export to BigQuery',
      'The pricing export to BigQuery',
      'A monthly CSV invoice download'
    ],
    answer: 0,
    explanation: 'The detailed usage cost export adds resource-level data (such as individual VM names) to the standard export’s project, service and SKU breakdown. The pricing export lists prices, not usage; invoices carry totals.'
  },
  {
    id: 'ace-t87',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'You suspect several VMs in a project have been idle for weeks and are wasting money. What is the quickest way to find them?',
    options: [
      'Check the idle VM recommendations from the Recommender in the console.',
      'Read each VM’s serial port output for login activity from the last weeks.',
      'Export all audit logs to BigQuery and search for VMs that have no entries.',
      'Stop every VM and wait to see which teams complain about their machines.'
    ],
    answer: 0,
    explanation: 'The Recommender analyses usage and lists idle VMs, idle disks and right-sizing opportunities, with an estimated saving. The other approaches are slow, incomplete or disruptive.'
  },
  {
    id: 'ace-t88',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Your organization has two subsidiaries that must receive separate invoices and pay separately, while their projects stay in the same organization. What should you do?',
    options: [
      'Create a Cloud Billing account for each subsidiary and link each subsidiary’s projects to its own account.',
      'Create a separate organization for each subsidiary and move each one’s projects into its own organization.',
      'Keep one billing account and use labels so finance can split the single invoice between the two later.',
      'Create one folder per subsidiary and set a different payment method on each of the two folders.'
    ],
    answer: 0,
    explanation: 'The billing account is what is invoiced and paid, and an organization can own several. Linking each subsidiary’s projects to its own account gives separate invoices without splitting the organization. Labels split costs on paper only; folders have no payment methods.'
  },
  {
    id: 'ace-t89',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'Budget alert emails go only to billing administrators, but the engineering on-call team must also receive them. What should you do?',
    options: [
      'Add Cloud Monitoring notification channels for the on-call team to the budget’s notifications.',
      'Grant the on-call team Billing Account Administrator so they receive the default emails.',
      'Ask the billing administrators to forward each budget email to the on-call team.',
      'Create an uptime check that fires an alert when the monthly cost passes the threshold.'
    ],
    answer: 0,
    explanation: 'Budgets can send to Cloud Monitoring notification channels (email, and more) in addition to billing admins and users. Granting billing admin just to receive email is excessive, forwarding is manual, and uptime checks probe endpoints, not costs.'
  },
  {
    id: 'ace-t90',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Which of these will a budget alert do on its own when spending reaches 100% of the budget?',
    options: [
      'Send notifications to the configured recipients.',
      'Shut down all VMs in the projects in scope.',
      'Disable billing on the projects in scope.',
      'Block new resources from being created.'
    ],
    answer: 0,
    explanation: 'Budgets only notify. Stopping resources or disabling billing needs programmatic notifications to Pub/Sub and your own code.'
  }
];
