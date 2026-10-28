/**
 * Tryout questions, Configuring access and security — the 41 that join the 9
 * in tryout.ts to make 50: IAM roles, custom and deny policies, service
 * accounts and their credentials, audit logs, secrets and keys. Course
 * module MD1-S1-04, with the access parts of MD2.
 */
import type { Question } from '@/types';

export const tryoutAccess: Question[] = [
  {
    id: 'ace-t91',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'An audit finds that 30 developers have the Editor role on the production project. They only deploy to Cloud Run and read logs. What should you do to follow least privilege?',
    options: [
      'Replace Editor with Cloud Run Developer and Logs Viewer, granted to the developers’ group.',
      'Keep Editor but enable Data Access audit logs so every change they make is recorded.',
      'Replace Editor with Viewer so the developers can still see everything they deploy.',
      'Replace Editor with Owner for the team leads only and remove everyone else from the project.'
    ],
    answer: 0,
    explanation: 'Basic roles such as Editor cover almost every service. Predefined roles matched to the actual work, granted to a group, are least privilege. Auditing does not reduce access, Viewer cannot deploy, and Owner is even broader.'
  },
  {
    id: 'ace-t92',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Security asks which people and service accounts can delete Cloud Storage buckets anywhere in the organization, including through inherited and group grants. What is the most efficient way to answer?',
    options: [
      'Use Policy Analyzer to query which principals have storage.buckets.delete across the organization.',
      'Run gcloud projects get-iam-policy on every project and read through each policy by hand.',
      'Search the Admin Activity audit logs for bucket deletions that happened in the last 30 days.',
      'Ask each project Owner to list who has access to their buckets and combine the answers.'
    ],
    answer: 0,
    explanation: 'Policy Analyzer (part of Cloud Asset Inventory) answers "who can do what on which resource", expanding groups and inheritance across the organization. Per-project policies miss groups and inheritance; audit logs show who did delete, not who can.'
  },
  {
    id: 'ace-t93',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You suspect many principals have roles with far more permissions than they use. You want Google Cloud to suggest smaller roles based on the permissions actually used over the last 90 days. What should you use?',
    options: ['IAM role recommendations', 'Policy Troubleshooter', 'Cloud Asset Inventory export', 'Organization Policy Service'],
    answer: 0,
    explanation: 'IAM role recommendations compare granted permissions with those used and propose removing or replacing roles. Policy Troubleshooter explains why one principal does or does not have one permission; asset export lists resources; organization policies restrict configuration.'
  },
  {
    id: 'ace-t94',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A predefined role is almost right for a team, but it includes two permissions you must not grant. You want a role with everything else it contains, with the least effort. What should you do?',
    options: [
      'Copy the predefined role into a custom role with gcloud iam roles copy, then remove the two permissions.',
      'Grant the predefined role and add an IAM deny policy for the two permissions on every single project.',
      'Write a new custom role by typing every permission of the predefined role by hand except the two.',
      'Edit the predefined role directly in the console and remove the two permissions from it for everyone.'
    ],
    answer: 0,
    explanation: '`gcloud iam roles copy` (or "Create role from selection" in the console) starts a custom role from a predefined one; then remove what you do not want. Predefined roles cannot be edited; typing every permission is slow and error-prone; deny policies for this are more complex than needed.'
  },
  {
    id: 'ace-t95',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The same custom role must be granted in 40 projects across several folders. Where should you create it?',
    options: [
      'At the organization level, so it can be granted on any project in the organization.',
      'On the folder that holds most of the projects, so they inherit the role definition.',
      'In each of the 40 projects, keeping the definitions in sync with a script.',
      'In a dedicated project, and then share the role with the other projects.'
    ],
    answer: 0,
    explanation: 'Custom roles can be defined at the organization or project level. An organization-level custom role can be granted on any resource in the organization. Folders cannot hold custom roles, and a project-level role can only be used in its own project.'
  },
  {
    id: 'ace-t96',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'Many people hold roles that include resourcemanager.projects.delete through various grants. You want nobody except the platform-admins group to be able to delete projects, without editing all the existing grants. What should you do?',
    options: [
      'Create an IAM deny policy at the organization that denies the delete permission, with platform-admins as an exception.',
      'Remove every role that includes the delete permission and grant platform-admins a custom role that contains it.',
      'Set an organization policy constraint that disables project deletion for every user in the whole organization.',
      'Create a log-based alert on project deletions and restore any project deleted by someone who is not an admin.'
    ],
    answer: 0,
    explanation: 'IAM deny policies are evaluated before allow policies and can name exception principals, so one deny rule removes the permission from everyone else regardless of their grants. Re-granting everything is slow and fragile; organization policies do not target IAM permissions; an alert reacts after the damage.'
  },
  {
    id: 'ace-t97',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'A contractor must upload files to the `ace-exports` bucket only. They must not see any other bucket in the project. Where should you grant Storage Object Creator?',
    options: ['On the ace-exports bucket', 'On the project', 'On the folder above the project', 'On the organization'],
    answer: 0,
    explanation: 'Granting on the bucket limits the role to that bucket. A project, folder or organization grant applies to every bucket below it.'
  },
  {
    id: 'ace-t98',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'A bucket holds the images of a public website. Anyone on the internet must be able to read the objects, without signing in. What should you grant?',
    options: [
      'Storage Object Viewer to allUsers on the bucket',
      'Storage Object Viewer to allAuthenticatedUsers on the bucket',
      'Storage Admin to allUsers on the bucket',
      'Storage Object Viewer to allUsers on the project'
    ],
    answer: 0,
    explanation: '`allUsers` means anyone, signed in or not; `allAuthenticatedUsers` requires a Google account. Object Viewer only reads; Admin would let anyone delete. Granting on the project would make every bucket public.'
  },
  {
    id: 'ace-t99',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You want all access to a bucket controlled by IAM alone, so nobody can make individual objects public with ACLs. What should you enable on the bucket?',
    options: ['Uniform bucket-level access', 'Object Versioning', 'A retention policy', 'Requester Pays'],
    answer: 0,
    explanation: 'Uniform bucket-level access disables object ACLs, so only bucket-level IAM decides access. Versioning keeps old versions, retention policies prevent deletion, and Requester Pays changes who pays for reads.'
  },
  {
    id: 'ace-t100',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A security engineer must manage who has which roles on a project, but should not be able to create or change any other resources in it. Which role should you grant?',
    options: ['Project IAM Admin', 'Project Owner', 'Security Reviewer', 'Organization Administrator'],
    answer: 0,
    explanation: 'Project IAM Admin (`roles/resourcemanager.projectIamAdmin`) can view and change the project’s IAM policy and nothing else. Owner can change everything, Security Reviewer can only view policies, and Organization Administrator is organization-wide.'
  },
  {
    id: 'ace-t101',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Developers must deploy and update workloads in an existing GKE cluster through the Kubernetes API, but must not create, delete or resize clusters. Which IAM role should you grant them on the project?',
    options: ['Kubernetes Engine Developer', 'Kubernetes Engine Admin', 'Kubernetes Engine Cluster Admin', 'Kubernetes Engine Viewer'],
    answer: 0,
    explanation: 'Kubernetes Engine Developer gives full access to Kubernetes objects inside clusters. Cluster Admin manages clusters but not their objects, Admin does both, and Viewer is read-only.'
  },
  {
    id: 'ace-t102',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'In one GKE cluster, the payments team must be able to manage Deployments only in the `payments` namespace, not in other teams’ namespaces. What should you do?',
    options: [
      'Create a Kubernetes Role in the payments namespace and bind it to the team’s Google group with a RoleBinding.',
      'Grant the team Kubernetes Engine Developer on the project with an IAM condition on the namespace name.',
      'Create a separate GKE cluster for the payments team and grant them Kubernetes Engine Admin on it.',
      'Grant the team Kubernetes Engine Viewer and ask the platform team to apply their manifests for them.'
    ],
    answer: 0,
    explanation: 'IAM roles on GKE apply to the whole cluster. Kubernetes RBAC (Role + RoleBinding) scopes permissions to a namespace and can bind Google groups. A separate cluster is costly, and IAM conditions do not see Kubernetes namespaces.'
  },
  {
    id: 'ace-t103',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A network team must create and change firewall rules and SSL certificates, but must not create VMs or change VPC networks and subnets. Which role fits best?',
    options: ['Compute Security Admin', 'Compute Network Admin', 'Compute Admin', 'Compute Instance Admin (v1)'],
    answer: 0,
    explanation: 'Compute Security Admin manages firewall rules and SSL certificates. Compute Network Admin manages networks, subnets and routes but can only view firewall rules; Compute Admin covers everything; Instance Admin manages VMs.'
  },
  {
    id: 'ace-t104',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'A Cloud Run service needs to read a database password stored in Secret Manager. Which role should its service account have on that secret?',
    options: ['Secret Manager Secret Accessor', 'Secret Manager Admin', 'Secret Manager Viewer', 'Cloud KMS CryptoKey Decrypter'],
    answer: 0,
    explanation: 'Secret Accessor can read secret payloads. Viewer sees metadata but not the value, Admin can also create and delete secrets, and KMS roles are for keys, not Secret Manager payloads.'
  },
  {
    id: 'ace-t105',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A user reports being denied when trying to start a VM, and you need to find out which permission is missing and which policies apply. What should you use?',
    options: ['Policy Troubleshooter', 'IAM role recommendations', 'Cloud Asset Inventory export', 'Billing reports'],
    answer: 0,
    explanation: 'Policy Troubleshooter takes a principal, a resource and a permission and explains whether access is granted and which allow or deny policies decide it. Role recommendations shrink roles; asset exports list resources.'
  },
  {
    id: 'ace-t106',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'Developers should have Compute Instance Admin only on VMs whose names start with `dev-`, not on production VMs in the same project. What should you do?',
    options: [
      'Grant the role on the project with an IAM condition on the resource name starting with dev-.',
      'Grant the role on the project and add the prefix dev- to the developers’ group name.',
      'Create a custom role named dev-instance-admin and grant it on the project to the group.',
      'Grant the role on each dev- VM by hand whenever a new development VM is created.'
    ],
    answer: 0,
    explanation: 'IAM Conditions can limit a binding to resources whose name matches a prefix (for example `resource.name.startsWith("projects/p/zones/z/instances/dev-")`), so new dev VMs are covered automatically. A role or group name does not restrict anything; per-VM grants are manual.'
  },
  {
    id: 'ace-t107',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Which two principals should you prefer when granting roles in a project? (Choose two.)',
    options: [
      'Google groups that represent job functions',
      'Service accounts for applications and workloads',
      'Individual user accounts of each employee',
      'allAuthenticatedUsers for internal tools',
      'A shared user account used by the whole team'
    ],
    answer: [0, 1],
    explanation: 'People get access through groups, and workloads through their own service accounts. Per-user grants are hard to manage, allAuthenticatedUsers means anyone with a Google account, and shared accounts remove accountability.'
  },
  {
    id: 'ace-t108',
    topic: 'Service accounts',
    difficulty: 'easy',
    prompt: 'New VMs in your project run as the Compute Engine default service account, which has the Editor role in your project. What is the recommended change?',
    options: [
      'Create a user-managed service account per application with only the roles it needs, and use it for the VMs.',
      'Keep the default service account but restrict each VM to read-only access scopes for every API.',
      'Delete the default service account so that the VMs run with no identity and cannot call any API.',
      'Grant the default service account Owner so that applications never fail because of a missing permission.'
    ],
    answer: 0,
    explanation: 'Google recommends dedicated, minimally privileged service accounts per workload; the default one is too broad and shared by every VM. Scopes are a legacy limit and still share one identity; deleting it breaks things that rely on it; Owner is the opposite of least privilege.'
  },
  {
    id: 'ace-t109',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'A VM’s service account has Storage Object Admin on a bucket, but the application gets 403 errors when uploading. The VM was created with the default access scopes. What should you do?',
    options: [
      'Stop the VM, change its access scopes to allow full access to Cloud APIs, and control access with IAM.',
      'Grant the service account Storage Admin on the whole project instead of the role on the bucket.',
      'Create a key for the service account and configure the application to use the downloaded key file.',
      'Restart the VM so that the metadata server refreshes the token with the new IAM permissions.'
    ],
    answer: 0,
    explanation: 'Access scopes limit what a VM’s token may do regardless of IAM; the default scopes give Cloud Storage read-only. Google recommends the cloud-platform scope with IAM deciding access. Scopes can only be changed while the VM is stopped. More IAM, keys or a restart do not lift the scope limit.'
  },
  {
    id: 'ace-t110',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A developer needs to test locally what a deployment service account is allowed to do, without downloading a key for it. What should you do?',
    options: [
      'Grant the developer Service Account Token Creator on that service account and use --impersonate-service-account.',
      'Grant the developer Service Account Admin on the project so they can reset the service account password.',
      'Grant the developer the same roles as the service account and let them test with their own user account.',
      'Create a key for the service account, send it to the developer, and delete the key after the testing ends.'
    ],
    answer: 0,
    explanation: 'Impersonation issues short-lived credentials for the service account to someone with Token Creator on it, with no key file. Service accounts have no passwords; testing as yourself does not test the service account; keys are long-lived secrets.'
  },
  {
    id: 'ace-t111',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'A GitHub Actions workflow must deploy to Cloud Run. Security forbids long-lived service account keys. What should you do?',
    options: [
      'Configure Workload Identity Federation with a pool trusting GitHub’s OIDC tokens, and let the workflow impersonate a deploy service account.',
      'Create a service account key, store it as an encrypted GitHub secret, and rotate the key automatically every 90 days.',
      'Create a Google account for the GitHub workflow and store its password and a recovery code as GitHub secrets.',
      'Make the Cloud Run service accept unauthenticated deploys from GitHub’s published IP address ranges.'
    ],
    answer: 0,
    explanation: 'Workload Identity Federation exchanges the external identity’s token for short-lived Google credentials, with no keys to store. A key in a secret is still a long-lived key; a user account for automation is bad practice; deploys cannot be unauthenticated.'
  },
  {
    id: 'ace-t112',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'Pods in a GKE cluster must read objects from a Cloud Storage bucket. You want each workload to have its own identity and no keys. What should you do?',
    options: [
      'Use Workload Identity Federation for GKE and grant the role to the workload’s Kubernetes service account principal.',
      'Grant the node pool’s service account Storage Object Viewer so every Pod on the nodes can read the bucket.',
      'Create a service account key, store it as a Kubernetes Secret, and mount the Secret into each of the Pods.',
      'Make the bucket readable by allAuthenticatedUsers so any Pod with a Google token can read the objects.'
    ],
    answer: 0,
    explanation: 'Workload Identity Federation for GKE gives each Kubernetes service account its own IAM identity, so one workload’s access does not leak to others. The node service account is shared by every Pod on the node; keys in Secrets are long-lived; allAuthenticatedUsers is effectively public.'
  },
  {
    id: 'ace-t113',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A service account in project A runs a job that must read objects from a bucket in project B. What should you do?',
    options: [
      'Grant the project A service account Storage Object Viewer on the bucket in project B.',
      'Create a copy of the service account in project B and give the job both identities.',
      'Move the bucket into project A, because service accounts only work in their own project.',
      'Grant project A’s Owner the Storage Admin role on project B so the job inherits it.'
    ],
    answer: 0,
    explanation: 'A service account is a principal like any other and can be granted roles on resources in other projects. Service accounts cannot be copied, nothing needs moving, and roles on a person are not inherited by a service account.'
  },
  {
    id: 'ace-t114',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'A Cloud Build pipeline deploys to Cloud Run, where the service runs as `app-sa`. The deploy step fails with a permission error about acting as app-sa. The build already has Cloud Run Admin. What is missing?',
    options: [
      'Service Account User on app-sa for the service account the build runs as',
      'Service Account Admin on the project for the build’s service account',
      'Cloud Run Invoker on the service for the build’s service account',
      'Artifact Registry Writer on the repository for the app-sa service account'
    ],
    answer: 0,
    explanation: 'Deploying a service that runs as another service account requires `iam.serviceAccounts.actAs` on it — Service Account User on app-sa — for the identity doing the deploy. Invoker is for calling the service, Admin is too broad, and the build pushes images, not app-sa.'
  },
  {
    id: 'ace-t115',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A service account key was accidentally committed to a public Git repository an hour ago. What should you do first?',
    options: [
      'Delete or disable that key immediately, then review the audit logs for any use of it.',
      'Remove the commit from the repository history and keep using the same key afterwards.',
      'Wait for the key to expire, because service account keys expire after 24 hours by default.',
      'Delete the whole project to make sure the leaked key can never be used by anyone again.'
    ],
    answer: 0,
    explanation: 'User-managed keys do not expire by default, and anything once public must be considered stolen. Delete or disable the key at once (`gcloud iam service-accounts keys delete`), then check Cloud Audit Logs for activity. Removing the commit does not undo the exposure; deleting the project is excessive.'
  },
  {
    id: 'ace-t116',
    topic: 'Service accounts',
    difficulty: 'easy',
    prompt: 'You suspect a service account is being misused and want to stop all its access right now, but keep it so you can investigate and maybe restore it later. What should you do?',
    options: [
      'Disable the service account.',
      'Delete the service account.',
      'Remove its display name.',
      'Rename the service account.'
    ],
    answer: 0,
    explanation: '`gcloud iam service-accounts disable` blocks the account from authenticating while keeping its roles and keys, and it can be enabled again. Deleting it is hard to undo, and names do not affect access.'
  },
  {
    id: 'ace-t117',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'You need a running VM to use a different service account. What must you do?',
    options: [
      'Stop the VM, set the new service account with gcloud compute instances set-service-account, then start it.',
      'Change the service account in the instance metadata while the VM keeps running, and wait a minute.',
      'Recreate the VM from scratch, because a VM’s service account can never be changed after creation.',
      'Grant the new service account’s roles to the old one, because a VM can only have its original identity.'
    ],
    answer: 0,
    explanation: 'A VM’s service account and scopes can be changed, but only while it is stopped. Metadata does not set the identity, recreation is unnecessary, and copying roles defeats the purpose of separate identities.'
  },
  {
    id: 'ace-t118',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'Cloud Scheduler must call a Cloud Run service every night. The service does not allow unauthenticated requests. How should you configure the job?',
    options: [
      'Have the job send an OIDC token for a service account that has Cloud Run Invoker on the service.',
      'Have the job send an OAuth token for your own user account, which has the Owner role on the project.',
      'Allow unauthenticated requests on the service and check a secret query parameter in the code.',
      'Give the Cloud Scheduler service agent the Cloud Run Admin role on the project and send no token.'
    ],
    answer: 0,
    explanation: 'Cloud Scheduler can attach an OIDC ID token for a chosen service account; Cloud Run accepts it if that account has `roles/run.invoker`. User credentials are wrong for automation, a public endpoint with a secret parameter is weak, and Admin is not needed to invoke.'
  },
  {
    id: 'ace-t119',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A Pub/Sub push subscription delivers to a private Cloud Run service, and every delivery is rejected with 403. What should you do?',
    options: [
      'Configure the subscription to authenticate as a service account and grant it Cloud Run Invoker.',
      'Increase the subscription’s acknowledgement deadline so that Cloud Run has more time to reply.',
      'Grant the Pub/Sub service agent the Pub/Sub Publisher role on the topic of the subscription.',
      'Change the subscription from push to pull and leave the Cloud Run service as it is today.'
    ],
    answer: 0,
    explanation: 'A 403 means the push request is not authorised. Push subscriptions can send an OIDC token for a service account; that account needs `roles/run.invoker` on the service. The ack deadline is about timing, Publisher is for sending to topics, and a pull subscriber needs code that polls.'
  },
  {
    id: 'ace-t120',
    topic: 'Service accounts',
    difficulty: 'easy',
    prompt: 'Three applications in a project all call different Google Cloud APIs. How many service accounts does Google recommend?',
    options: [
      'One per application, each with only the roles that application needs.',
      'One for the whole project, holding the roles of all three applications.',
      'None; the applications should run with the developers’ user accounts.',
      'One per API, shared by every application that calls that API.'
    ],
    answer: 0,
    explanation: 'A service account per workload keeps permissions minimal and makes audit logs show which application did what. Sharing one account combines everyone’s permissions; user accounts are for people.'
  },
  {
    id: 'ace-t121',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'An application outside Google Cloud must call Google APIs, and no federation option is available, so it has to use a service account key. Which practice should you follow?',
    options: [
      'Store the key in a secure secret store, rotate it regularly, and delete keys that are no longer used.',
      'Embed the key in the application’s source code so that it is always available at runtime.',
      'Give the service account Owner so that the key never needs to change when needs grow.',
      'Share one key between all environments so that there is only a single key to manage.'
    ],
    answer: 0,
    explanation: 'When keys cannot be avoided, keep them out of code, store them securely, rotate them and remove unused ones (`gcloud iam service-accounts keys list` shows them). Owner, shared keys and keys in source code all widen the damage of a leak.'
  },
  {
    id: 'ace-t122',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'easy',
    prompt: 'A production VM was deleted last night and nobody admits doing it. Where do you find who deleted it?',
    options: [
      'The Admin Activity audit logs in Logs Explorer',
      'The VM’s serial port output from last night',
      'The Data Access audit logs of Cloud Storage',
      'The billing export for the previous day'
    ],
    answer: 0,
    explanation: 'Admin Activity audit logs record every configuration change, such as deleting a VM, with the caller’s identity. They are always on and cannot be disabled. The serial port shows the guest OS; the billing export shows cost.'
  },
  {
    id: 'ace-t123',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'medium',
    prompt: 'Compliance requires a record of every read of objects in a sensitive Cloud Storage bucket. The logs show no such entries today. What should you do?',
    options: [
      'Enable Data Access audit logs (DATA_READ) for Cloud Storage in the project.',
      'Enable Admin Activity audit logs for Cloud Storage in the project settings.',
      'Turn on Object Versioning so that each read creates a new object version.',
      'Install the Ops Agent on the VMs that read objects from the bucket.'
    ],
    answer: 0,
    explanation: 'Reads of data are Data Access audit logs, which are off by default for most services (BigQuery is the exception) and must be enabled. Admin Activity logs are always on but record configuration changes, not reads.'
  },
  {
    id: 'ace-t124',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'medium',
    prompt: 'Regulations require keeping audit logs for seven years at the lowest cost, in a way that cannot be deleted early. What should you do?',
    options: [
      'Create a log sink to a Cloud Storage bucket using the Archive class with a locked retention policy.',
      'Increase the retention of the _Required log bucket to seven years in the Logging settings.',
      'Export the audit logs to a BigQuery dataset and set the default table expiration to seven years.',
      'Download the audit logs every month and keep the files on a file server in the office.'
    ],
    answer: 0,
    explanation: 'Archive storage is the cheapest for rarely read data, and a locked retention policy prevents deletion before the period ends. The _Required bucket’s 400-day retention cannot be changed; BigQuery storage costs more and does not lock; local copies are manual and unprotected.'
  },
  {
    id: 'ace-t125',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'hard',
    prompt: 'The security team wants the audit logs of every project in the organization, including future projects, collected in one central project. What should you do?',
    options: [
      'Create an aggregated sink at the organization with --include-children, routing audit logs to the central project.',
      'Create a log sink in every project that sends its logs to the central project, adding one for each new project.',
      'Grant the security team Logs Viewer on every project and let them query the logs project by project.',
      'Set the central project as the parent of all other projects so that their logs are inherited by it.'
    ],
    answer: 0,
    explanation: 'An aggregated sink on the organization with `--include-children` collects logs from all current and future projects. Per-project sinks must be created for every new project; viewer access does not centralise anything; projects cannot be parents of projects.'
  },
  {
    id: 'ace-t126',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'easy',
    prompt: 'Where should an application running on Cloud Run keep its third-party API key?',
    options: [
      'In Secret Manager, read at runtime by the service account',
      'In an environment variable written into the Dockerfile',
      'In a file in the container image under /etc/app',
      'In the source code, in a constants file'
    ],
    answer: 0,
    explanation: 'Secret Manager stores secrets encrypted, controls access with IAM, versions them and audits access. Cloud Run can expose a secret as a variable or file at runtime. Anything baked into the image or source is visible to everyone who can read them.'
  },
  {
    id: 'ace-t127',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'medium',
    prompt: 'You rotate a database password stored in Secret Manager every month. You want applications to pick up the new password without code changes. How should the applications refer to the secret?',
    options: [
      'By the latest alias, and add a new secret version on each rotation.',
      'By a fixed version number that you update in each application.',
      'By creating a new secret with a new name every month.',
      'By downloading the value once at deploy time into a file.'
    ],
    answer: 0,
    explanation: 'Adding a version and referring to `latest` lets new reads get the new value; old versions can then be disabled. Fixed versions and new secret names need application changes; a value copied at deploy time never updates.'
  },
  {
    id: 'ace-t128',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'hard',
    prompt: 'You configured a Cloud Storage bucket to use a customer-managed encryption key in Cloud KMS, but uploads fail with a permission error on the key. What should you do?',
    options: [
      'Grant the project’s Cloud Storage service agent the CryptoKey Encrypter/Decrypter role on the key.',
      'Grant the uploading users the Cloud KMS Admin role on the key ring that contains the key.',
      'Make the key ring public so that every Google service can use the keys inside it.',
      'Switch the bucket back to Google-managed encryption and then retry the uploads.'
    ],
    answer: 0,
    explanation: 'With CMEK, Cloud Storage itself encrypts and decrypts with your key, so its service agent (`service-PROJECT_NUMBER@gs-project-accounts.iam.gserviceaccount.com`) needs `roles/cloudkms.cryptoKeyEncrypterDecrypter`. Users do not need KMS Admin, keys are never public, and switching back drops the requirement.'
  },
  {
    id: 'ace-t129',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'medium',
    prompt: 'Your policy requires the encryption key of a Cloud KMS key ring to be rotated every 90 days with no manual work. What should you do?',
    options: [
      'Set an automatic rotation period of 90 days on the symmetric key.',
      'Create a new key ring every 90 days and move the data across.',
      'Delete the key every 90 days so a new one is created automatically.',
      'Write a reminder for the security team to rotate the key by hand.'
    ],
    answer: 0,
    explanation: 'Cloud KMS symmetric keys support automatic rotation: a new primary version is created on schedule while old versions still decrypt existing data. Deleting keys destroys access to data; key rings cannot be deleted and are not rotated.'
  },
  {
    id: 'ace-t130',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'medium',
    prompt: 'Application logs in the _Default log bucket are kept for 30 days, but the team needs 90 days to investigate incidents. What should you do?',
    options: [
      'Change the retention of the _Default log bucket to 90 days.',
      'Change the retention of the _Required log bucket to 90 days.',
      'Create a budget alert on Logging so logs are not deleted.',
      'Enable Data Access audit logs, which are kept for 90 days.'
    ],
    answer: 0,
    explanation: 'The _Default bucket’s retention is configurable (from 1 day to 10 years, longer than 30 days is charged). The _Required bucket holds audit and some system logs with a fixed 400 days; budgets and Data Access logs do not change retention.'
  },
  {
    id: 'ace-t131',
    topic: 'Audit logs, keys & secrets',
    difficulty: 'easy',
    prompt: 'Which audit logs are enabled by default, free, and cannot be turned off?',
    options: ['Admin Activity audit logs', 'Data Access audit logs', 'VPC Flow Logs', 'Firewall Rules Logging'],
    answer: 0,
    explanation: 'Admin Activity (and System Event) audit logs are always written at no charge. Data Access logs must be enabled for most services, and VPC Flow Logs and firewall logging are opt-in per subnet or rule.'
  }
];
