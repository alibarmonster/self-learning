/**
 * Module 6 try-out — Security Deep-Dive & Exam Readiness (exam guide Section 4
 * plus a mixed review). 100 questions: 60 on IAM policy structure and
 * evaluation, deny and principal access boundary policies, conditions and
 * Privileged Access Manager, role inheritance, basic, predefined and custom
 * roles, service accounts and service agents, impersonation and short-lived
 * credentials, and Workload Identity Federation (for GKE and for external
 * workloads); then 40 mixed review questions across Modules 1–5. Dealt into
 * five sets of 20 in ../sets.ts, each with 12 security and 8 review questions.
 */
import type { ModuleQuestion } from './module-types';

export const module6: ModuleQuestion[] = [
  // ── IAM policy structure and evaluation ──
  {
    id: 'ace-m6-001',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'What does an IAM allow policy attached to a resource contain?',
    options: [
      'Bindings that each pair one role with a list of principals, optionally with a condition',
      'A list of permissions for each principal, with an expiry date on every permission',
      'A list of APIs enabled on the resource and the quotas that apply to each of them',
      'A list of organization policy constraints and whether each one is enforced'
    ],
    answer: 0,
    explanation: 'An allow policy is a list of bindings — a role plus members, optionally with a condition — along with an etag and a version. Permissions come from the roles, and APIs, quotas and organization policies are separate features.'
  },
  {
    id: 'ace-m6-002',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A script must add one binding to a project’s policy. Why is `gcloud projects add-iam-policy-binding` safer than editing a JSON file and running `set-iam-policy`?',
    options: [
      'set-iam-policy replaces the whole policy, so a stale or partial file removes other bindings',
      'set-iam-policy only works on organization nodes, so it always fails on projects',
      'add-iam-policy-binding skips permission checks, so it can never fail with an error',
      'set-iam-policy needs YAML, which gcloud cannot read when it is run from a script'
    ],
    answer: 0,
    explanation: '`set-iam-policy` overwrites the entire allow policy with the file’s contents, so any binding missing from the file is removed; `add-iam-policy-binding` does a read-modify-write of one binding for you. Both need the same permissions, and both work on projects.'
  },
  {
    id: 'ace-m6-003',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: '`gcloud projects set-iam-policy` fails with a concurrency error after you spent twenty minutes editing policy.json. What happened, and what should you do?',
    options: [
      'Someone changed the policy meanwhile and its etag changed; read it again, reapply your edit, then set it',
      'Your session expired after twenty minutes; sign in again and run the same command with the old file',
      'The policy has too many bindings; split them across several projects before setting it again',
      'set-iam-policy is rate limited to once per hour; wait and run the same command later'
    ],
    answer: 0,
    explanation: 'Allow policies carry an etag, and set-iam-policy only succeeds if the etag in your file matches the current one — which stops you from silently overwriting someone else’s change. Re-read the policy, merge your edit and retry.'
  },
  {
    id: 'ace-m6-004',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You add a binding with an IAM condition to a policy file, but some tools drop or misread the condition. What must the policy specify?',
    options: ['Policy version 3', 'Policy version 1', 'An etag of zero', 'A deny rule'],
    answer: 0,
    explanation: 'Policies that contain conditional bindings must use version 3; reading and writing them with an older version can lose or misrepresent conditions. The etag is for concurrency control, and deny rules live in separate deny policies.'
  },
  {
    id: 'ace-m6-005',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Ana has Viewer on the organization and Compute Instance Admin on project ace-web-123. What can she do in ace-web-123?',
    options: [
      'View everything and administer Compute Engine instances, because both grants apply',
      'Only view, because the organization-level grant overrides the project grant',
      'Only administer instances, because a project grant replaces inherited roles',
      'Nothing, because grants at two different levels cancel each other out'
    ],
    answer: 0,
    explanation: 'A resource’s effective allow policy is the union of its own policy and those of its ancestors, so both roles apply in the project. Allow grants never cancel each other; only deny policies remove permissions.'
  },
  {
    id: 'ace-m6-006',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A developer holds Owner on a project, but a deny policy on its folder denies `compute.googleapis.com/instances.delete` to all principals. Can the developer delete VMs in the project?',
    options: [
      'No; deny policies are checked before allow policies and override the Owner grant',
      'Yes; Owner always wins, because it is the most powerful of the basic roles',
      'Yes; deny policies set on folders do not apply to the projects inside them',
      'Only from the console, because deny policies only apply to API requests'
    ],
    answer: 0,
    explanation: 'IAM evaluates deny policies first: if a deny rule covers the principal and permission, access is denied whatever the allow grants say, and deny policies are inherited down the hierarchy. The console calls the same APIs.'
  },
  {
    id: 'ace-m6-007',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'You want to deny deletion of resources tagged env=prod to everyone except the group break-glass@example.com. How should the deny rule be written?',
    options: [
      'Denied: all principals; exception: the break-glass group; condition: resources tagged env=prod',
      'Denied: the break-glass group; exception: everyone else; and no condition at all',
      'An allow binding for the break-glass group with an env=prod condition, and nothing else',
      'An organization policy constraint that lists the break-glass group as an allowed value'
    ],
    answer: 0,
    explanation: 'Deny rules list denied principals, optional exception principals and denied permissions, with an optional denial condition on tags, so all principals except break-glass are denied on env=prod resources. Allow bindings cannot take away other people’s access, and organization policies do not work on principals this way.'
  },
  {
    id: 'ace-m6-008',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'In an IAM deny policy, how is the permission to delete projects written?',
    options: [
      '`cloudresourcemanager.googleapis.com/projects.delete`',
      '`resourcemanager.projects.delete`',
      '`resourcemanager.googleapis.com/projects.delete`',
      '`projects.delete@cloudresourcemanager.googleapis.com`'
    ],
    answer: 0,
    explanation: 'Deny policies use the fully qualified form SERVICE_FQDN/RESOURCE.ACTION, such as `cloudresourcemanager.googleapis.com/projects.delete`, while roles and allow policies use `resourcemanager.projects.delete`. Deny policies list permissions, not roles.'
  },
  {
    id: 'ace-m6-009',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'Users from your workforce pool must only ever be able to access resources in your own organization, even if someone in another organization grants them a role. What should you use?',
    options: [
      'A principal access boundary policy bound to the workforce pool’s principals',
      'An IAM deny policy on your own organization for those federated users',
      'Domain restricted sharing enforced on your own organization',
      'A VPC Service Controls perimeter around every project you own'
    ],
    answer: 0,
    explanation: 'Principal access boundary policies define which resources a set of principals is eligible to access; outside the boundary their grants have no effect. A deny policy on your organization only affects your own resources, domain restricted sharing limits who can be granted roles here, and VPC Service Controls protects data by perimeter.'
  },
  {
    id: 'ace-m6-010',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'An on-call engineer should get Compute Instance Admin only on VMs in zone asia-southeast2-a, and only until the end of the month. What can express this?',
    options: [
      'One conditional binding whose CEL expression uses resource.name and request.time',
      'Two separate bindings, one with the zone in the role name and one with the date',
      'A custom role whose title includes the zone and the end date of the access',
      'An organization policy that limits the engineer to that zone until the end date'
    ],
    answer: 0,
    explanation: 'IAM Conditions are CEL expressions on request and resource attributes — for example `resource.name.startsWith("projects/p/zones/asia-southeast2-a/")` and `request.time < timestamp("…")` — combined in one binding. Role names and titles restrict nothing, and organization policies do not target principals.'
  },
  {
    id: 'ace-m6-011',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Engineers should not hold production admin rights all the time, but must be able to request them for a few hours, with a justification and an approval. What should you use?',
    options: [
      'Privileged Access Manager entitlements with approval and a maximum duration',
      'Permanent Owner grants with a reminder to remove them after each incident',
      'A shared break-glass account whose password is kept in an office safe',
      'Service account keys that the engineers download during incidents'
    ],
    answer: 0,
    explanation: 'Privileged Access Manager provides just-in-time, temporary role grants: users request an entitlement with a justification, approvers grant it, and the access expires automatically and is audited. Permanent grants, shared accounts and keys all break least privilege or accountability.'
  },
  {
    id: 'ace-m6-012',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'In Privileged Access Manager, where do you configure who may request access, which roles they get, who approves, and for how long?',
    options: [
      'In the entitlement, which defines eligible principals, roles, resource, approvers and maximum duration',
      'In each user’s Cloud Identity profile, as custom attributes set by an administrator',
      'In an organization policy constraint that lists every engineer who is eligible',
      'In the project’s IAM policy, as a binding of the Owner role with a long condition'
    ],
    answer: 0,
    explanation: 'A PAM entitlement says which principals can request it, which roles on which resource it grants, how long a grant may last, and whether approval — and by whom — is required. Requests and grants are recorded in audit logs.'
  },
  {
    id: 'ace-m6-013',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Before an audit you must know every resource in the organization that lee@example.com can access, including through groups and inheritance. What should you use?',
    options: [
      'Policy Analyzer, with an access query for that principal',
      'The IAM page of each project, filtered on the user',
      'Admin Activity audit logs for the user over a year',
      'Policy Troubleshooter for one permission on one resource'
    ],
    answer: 0,
    explanation: 'Policy Analyzer answers which resources a principal can access and with which roles, expanding group membership and inheritance across the organization. Per-project pages miss groups and inheritance, logs show actions rather than access, and Troubleshooter checks a single permission on a single resource.'
  },
  {
    id: 'ace-m6-014',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'From the command line, you need the principals that hold roles/owner on project ace-prod-123. Which command produces them?',
    options: [
      '`gcloud projects get-iam-policy ace-prod-123 --flatten="bindings[].members" --filter="bindings.role:roles/owner"`',
      '`gcloud iam roles describe roles/owner --project=ace-prod-123 --show-members --format=list`',
      '`gcloud projects describe ace-prod-123 --format="value(iamPolicy.owners[].email)"`',
      '`gcloud asset search-all-resources --scope=projects/ace-prod-123 --query="policy:roles/owner"`'
    ],
    answer: 0,
    explanation: 'Flattening the bindings lets you filter on one role and see its members (add `--format="value(bindings.members)"` for a plain list). `roles describe` shows a role’s permissions, project metadata holds no policy, and resource search looks at resources rather than IAM bindings.'
  },

  // ── Role attachment and inheritance ──
  {
    id: 'ace-m6-015',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'A reporting job must publish to the Pub/Sub topic reports, and nothing else in its project. Where should you grant Pub/Sub Publisher?',
    options: ['On the reports topic', 'On the project', 'On the folder', 'On the organization'],
    answer: 0,
    explanation: 'Many resources, including Pub/Sub topics, buckets, secrets and service accounts, accept their own allow policies; granting there limits the role to that resource. Higher grants reach every topic below them.'
  },
  {
    id: 'ace-m6-016',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A user was granted Storage Object Viewer on a project. Can they read objects in every bucket of that project?',
    options: [
      'Yes; roles granted on a project are inherited by the buckets and objects in it',
      'No; bucket roles must always be granted separately on each bucket',
      'Only in buckets created after the role was granted to the user',
      'Only if uniform bucket-level access is turned off on the buckets'
    ],
    answer: 0,
    explanation: 'Resources inherit the allow policies of their parents, so a project-level role applies to every bucket and object in it, existing or new — which is why granting on the bucket is preferred when access should be narrower. Uniform access makes IAM the only mechanism; it does not stop inheritance.'
  },
  {
    id: 'ace-m6-017',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You removed Editor from a user on project ace-web-123, but they can still change resources there. What is the most likely reason?',
    options: [
      'They still hold a role inherited from a folder or the organization, or through a group',
      'Role removals take 24 hours to take effect in every Google Cloud service',
      'Editor can only be removed by the person who originally granted it',
      'The user’s permissions are cached in Cloud Shell, which keeps them for a week'
    ],
    answer: 0,
    explanation: 'Effective access combines grants on the resource, on its ancestors and to the user’s groups; removing one binding leaves the others. Policy Troubleshooter or Policy Analyzer shows where access comes from. IAM changes usually take effect within minutes.'
  },
  {
    id: 'ace-m6-018',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Which two resource types let you grant IAM roles on the individual resource, rather than only on its project? (Choose two.)',
    options: [
      'Cloud Storage buckets',
      'Secret Manager secrets',
      'VPC firewall rules',
      'Cloud Monitoring uptime checks',
      'Compute Engine routes'
    ],
    answer: [0, 1],
    explanation: 'Buckets and secrets — like Pub/Sub topics, service accounts and Cloud KMS keys — support their own allow policies. Firewall rules, routes and uptime checks are controlled by roles granted on the project.'
  },
  {
    id: 'ace-m6-019',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Who can grant roles on a folder?',
    options: [
      'Principals with setIamPolicy on it, such as Folder IAM Admin, Folder Admin or Organization Administrator',
      'Anyone with Viewer on the organization, because folder policies are open to everyone inside it',
      'Only the person who created the folder, for as long as that folder continues to exist',
      'Only Google Cloud Support, after an organization administrator files a support request'
    ],
    answer: 0,
    explanation: 'Changing a folder’s allow policy needs `resourcemanager.folders.setIamPolicy`, included in roles such as Folder IAM Admin, Folder Admin and Organization Administrator (on the folder or above). Viewer cannot change policies, creators have no special rights, and Support does not edit IAM.'
  },
  {
    id: 'ace-m6-020',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A security team must review the IAM policies and security settings of every project in the organization, without being able to change anything. What should you grant, and where?',
    options: [
      'Security Reviewer on the organization node',
      'Owner on the organization node',
      'Security Admin on each project separately',
      'Organization Policy Viewer on each folder'
    ],
    answer: 0,
    explanation: 'Security Reviewer can list resources and read their IAM policies, and granting it on the organization covers current and future projects. Owner and Security Admin can make changes, per-project grants miss new projects, and Organization Policy Viewer only shows organization policies.'
  },
  {
    id: 'ace-m6-021',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A finance user needs to view costs for the company billing account. Where is Billing Account Viewer granted?',
    options: [
      'On the billing account resource itself, or on the organization above it',
      'On every project that is linked to the billing account',
      'On the folder that contains the most expensive projects',
      'On the Cloud Billing API in the finance user’s own project'
    ],
    answer: 0,
    explanation: 'Billing roles are granted on the billing account (or inherited from its organization), which is separate from the project hierarchy it pays for. Project roles do not reveal billing account data, and APIs are not IAM resources.'
  },
  {
    id: 'ace-m6-022',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A CI pipeline must be able to deploy services that run as app-sa, and as no other service account. Where should you grant Service Account User?',
    options: [
      'On the app-sa service account only',
      'On the project, to cover every account',
      'On the folder above the project',
      'On the pipeline’s own service account'
    ],
    answer: 0,
    explanation: 'Service accounts are resources too: granting Service Account User on app-sa lets the pipeline act as that one account. A project-level grant lets it act as every service account in the project, including powerful ones.'
  },

  // ── Basic, predefined and custom roles ──
  {
    id: 'ace-m6-023',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'Why does Google recommend avoiding the basic roles Owner, Editor and Viewer in production?',
    options: [
      'They contain thousands of permissions across almost every service, far more than most jobs need',
      'They are deprecated and stop working in projects that are more than one year old',
      'They cannot be granted to groups, only to individual users of the domain',
      'They are billed per user per month, unlike predefined roles, which are free'
    ],
    answer: 0,
    explanation: 'Basic roles predate fine-grained IAM and grant very broad access; predefined roles scoped to a service are safer. Basic roles still work, can be granted to groups, and roles are never billed.'
  },
  {
    id: 'ace-m6-024',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'Which of these is a predefined role?',
    options: [
      'roles/pubsub.subscriber',
      'roles/owner',
      'projects/ace-lab-123/roles/subscriberLite',
      'organizations/123456/roles/auditor'
    ],
    answer: 0,
    explanation: 'Predefined roles are named `roles/SERVICE.ROLE` and maintained by Google. `roles/owner` is a basic role, and names under `projects/…/roles/` and `organizations/…/roles/` are custom roles.'
  },
  {
    id: 'ace-m6-025',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Custom role definitions are kept in Git as YAML. You want to create the role vmOperator in project ace-ops-123 from vm-operator.yaml. Which command should you use?',
    options: [
      '`gcloud iam roles create vmOperator --project=ace-ops-123 --file=vm-operator.yaml`',
      '`gcloud iam roles copy vmOperator --project=ace-ops-123 --source=vm-operator.yaml`',
      '`gcloud projects add-iam-policy-binding ace-ops-123 --role-file=vm-operator.yaml`',
      '`gcloud iam custom-roles apply vm-operator.yaml --project=ace-ops-123`'
    ],
    answer: 0,
    explanation: '`gcloud iam roles create` accepts a YAML or JSON file with the title, description, stage and permissions. `roles copy` copies an existing role, `add-iam-policy-binding` grants roles rather than defining them, and there is no `custom-roles` group.'
  },
  {
    id: 'ace-m6-026',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'The custom role vmOperator needs one more permission, compute.instances.reset. How do you add it without redefining the role?',
    options: [
      '`gcloud iam roles update vmOperator --project=ace-ops-123 --add-permissions=compute.instances.reset`',
      '`gcloud iam roles create vmOperator --project=ace-ops-123 --permissions=compute.instances.reset`',
      '`gcloud projects add-iam-policy-binding ace-ops-123 --permission=compute.instances.reset`',
      '`gcloud iam roles describe vmOperator --project=ace-ops-123 --append=compute.instances.reset`'
    ],
    answer: 0,
    explanation: '`roles update --add-permissions` (or `--remove-permissions`) changes an existing custom role, and every binding of the role picks up the change. Creating it again fails because it exists, bindings grant roles rather than permissions, and describe only reads.'
  },
  {
    id: 'ace-m6-027',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A custom role turned out to grant too much and is used in many bindings. You want it to stop granting anything right away, without deleting the bindings, while you fix it. What should you do?',
    options: [
      'Set the role’s stage to DISABLED',
      'Set the role’s stage to BETA',
      'Rename the role’s title to OLD',
      'Remove the role’s description'
    ],
    answer: 0,
    explanation: 'A DISABLED custom role stays in place but grants no permissions in any binding, and can be enabled again. The other launch stages (ALPHA, BETA, GA, DEPRECATED) are labels that do not change access, and titles and descriptions do nothing.'
  },
  {
    id: 'ace-m6-028',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'hard',
    prompt: 'gcloud refuses to add a particular permission to your custom role. What is the most likely reason?',
    options: [
      'The permission’s custom role support level is NOT_SUPPORTED',
      'Custom roles can hold at most ten permissions each',
      'The permission belongs to an API you have never called',
      'Custom roles cannot contain any write permissions'
    ],
    answer: 0,
    explanation: 'Each permission has a custom role support level: SUPPORTED, TESTING (allowed but may change) or NOT_SUPPORTED (cannot be added). Custom roles can hold thousands of permissions, including write permissions, and calling the API before does not matter.'
  },
  {
    id: 'ace-m6-029',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Before writing a custom role for project resources, you want to know which permissions apply at that level and can be used in custom roles. What should you run?',
    options: [
      '`gcloud iam list-testable-permissions //cloudresourcemanager.googleapis.com/projects/ace-ops-123`',
      '`gcloud iam roles list --project=ace-ops-123 --show-deleted --format="value(includedPermissions)"`',
      '`gcloud services list --enabled --project=ace-ops-123 --format="value(config.permissions)"`',
      '`gcloud projects get-iam-policy ace-ops-123 --flatten="bindings[].permissions"`'
    ],
    answer: 0,
    explanation: '`list-testable-permissions` takes a full resource name and lists the permissions that apply to it, with their custom role support levels. `roles list` lists the custom roles that already exist, and services and IAM policies have no permission fields to print.'
  },
  {
    id: 'ace-m6-030',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You deleted a custom role by mistake three days ago, and the bindings that used it stopped working. What can you do?',
    options: [
      'Undelete the role; within 7 days it can be restored and its bindings work again',
      'Create a new role with the same ID straight away; the bindings attach to it',
      'Nothing; deleted custom roles and their bindings are removed immediately',
      'Ask Google Cloud Support, who can restore custom roles for up to a year'
    ],
    answer: 0,
    explanation: 'Deleted custom roles can be undeleted for 7 days, and their bindings, which remain but are inactive, work again. After that the role is permanently deleted, and its ID cannot be reused for a while.'
  },
  {
    id: 'ace-m6-031',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'Two years ago your team copied a predefined role into a custom role. A new feature of the service now fails for users who hold the custom role. Why?',
    options: [
      'Custom roles are not updated when Google adds permissions, so new ones must be added by you',
      'Custom roles expire after one year and have to be recreated with the same permissions',
      'Predefined roles block custom copies of themselves once the service changes',
      'The service disables every custom role whenever it releases a new feature'
    ],
    answer: 0,
    explanation: 'Google maintains predefined roles and adds permissions as services evolve, but custom roles are yours: new permissions are never added automatically — the maintenance cost of custom roles. They do not expire and are not disabled by services.'
  },
  {
    id: 'ace-m6-032',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'easy',
    prompt: 'You want to see exactly which permissions the predefined role Compute Instance Admin (v1) contains. Which command shows them?',
    options: [
      '`gcloud iam roles describe roles/compute.instanceAdmin.v1`',
      '`gcloud compute instances describe --role=instanceAdmin`',
      '`gcloud projects get-iam-policy --role=instanceAdmin.v1`',
      '`gcloud iam service-accounts describe compute.instanceAdmin`'
    ],
    answer: 0,
    explanation: '`gcloud iam roles describe` prints a role’s title, stage and permissions (the IAM Roles page in the console shows the same). The other commands describe instances, policies or service accounts.'
  },
  {
    id: 'ace-m6-033',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'You created the custom role dbReader in project A and now want to grant it to a group on project B. Why can’t you find it there?',
    options: [
      'Project-level custom roles only exist in their project; define it on the organization to reuse it',
      'Custom roles take 24 hours to replicate to the other projects of the organization',
      'Custom roles can only be granted to service accounts, never to groups of users',
      'Custom roles must first be shared with other projects using `gcloud iam roles share`'
    ],
    answer: 0,
    explanation: 'A custom role created in a project exists only there; to reuse it across projects, define it at the organization level. Roles are available immediately, can be granted to any principal type, and there is no share command.'
  },
  {
    id: 'ace-m6-034',
    section: 'access',
    topic: 'IAM roles & policies',
    difficulty: 'medium',
    prompt: 'A support engineer must see the folder and project structure of the organization, but must not read the resources inside the projects. Which role fits?',
    options: ['Browser', 'Viewer', 'Organization Administrator', 'Project IAM Admin'],
    answer: 0,
    explanation: 'The Browser role allows browsing the hierarchy — organization, folders and projects — without reading resources such as VMs or buckets. Viewer reads resources, Organization Administrator manages IAM, and Project IAM Admin edits project policies.'
  },

  // ── Service accounts and service agents ──
  {
    id: 'ace-m6-035',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'easy',
    prompt: 'Which command creates a service account named report-sa in the current project?',
    options: [
      '`gcloud iam service-accounts create report-sa --display-name="Report job"`',
      '`gcloud iam roles create report-sa --project=ace-lab-123 --title="Report job"`',
      '`gcloud auth activate-service-account report-sa`',
      '`gcloud projects add-iam-policy-binding --member=report-sa`'
    ],
    answer: 0,
    explanation: '`gcloud iam service-accounts create` makes a user-managed service account (report-sa@PROJECT_ID.iam.gserviceaccount.com). `roles create` defines a role, `activate-service-account` signs gcloud in with a key, and a binding grants roles to an account that already exists.'
  },
  {
    id: 'ace-m6-036',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'easy',
    prompt: 'You created the service account report-sa in project ace-data-123. What is its email address?',
    options: [
      'report-sa@ace-data-123.iam.gserviceaccount.com',
      'report-sa@ace-data-123.google.com',
      'report-sa@developer.gserviceaccount.com',
      'service-report-sa@iam.google.com'
    ],
    answer: 0,
    explanation: 'User-managed service accounts are named ACCOUNT_ID@PROJECT_ID.iam.gserviceaccount.com. Addresses ending in developer.gserviceaccount.com belong to default accounts, such as the Compute Engine default service account (PROJECT_NUMBER-compute@…).'
  },
  {
    id: 'ace-m6-037',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'While cleaning up IAM you find service-123456789012@container-engine-robot.iam.gserviceaccount.com with roles in your project. What is it, and what should you do?',
    options: [
      'A Google-managed service agent that GKE uses to act in your project; leave its roles in place',
      'An account added by an attacker, because Google never adds accounts to projects; remove it',
      'A default service account you created yourself, which you should delete and recreate',
      'An account used only by Google Cloud Support, which you can remove when no case is open'
    ],
    answer: 0,
    explanation: 'Service agents are Google-managed service accounts that services such as GKE, Cloud Build or Pub/Sub use to work with your resources, with roles granted automatically. Removing their roles breaks those services.'
  },
  {
    id: 'ace-m6-038',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'In older projects the Compute Engine default service account was automatically granted Editor. Which organization policy stops this automatic grant?',
    options: [
      'constraints/iam.automaticIamGrantsForDefaultServiceAccounts',
      'constraints/iam.disableServiceAccountKeyCreation',
      'constraints/iam.allowedPolicyMemberDomains',
      'constraints/compute.requireOsLogin'
    ],
    answer: 0,
    explanation: 'Enforcing `iam.automaticIamGrantsForDefaultServiceAccounts` (on by default in new organizations) stops default service accounts from receiving the Editor role automatically. The others block keys, restrict member domains and enforce OS Login.'
  },
  {
    id: 'ace-m6-039',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A service account used by a nightly job was deleted by mistake yesterday, and the job now fails. What can you do?',
    options: [
      'Undelete it within 30 days with `gcloud iam service-accounts undelete` and its unique ID',
      'Create a new account with the same name, which inherits the old account’s roles',
      'Nothing; deleted service accounts can never be recovered once they are gone',
      'Restore yesterday’s project snapshot, which includes every service account'
    ],
    answer: 0,
    explanation: 'Deleted service accounts can be undeleted for 30 days using their numeric unique ID, which you can find in audit logs. A new account with the same name is a different principal without the old roles, and projects have no snapshots.'
  },
  {
    id: 'ace-m6-040',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'A service account’s ID is report-sa-old, which confuses people. What can you change?',
    options: [
      'Only its display name and description; the account ID in its email cannot change',
      'Its account ID, with `gcloud iam service-accounts update --account-id`',
      'Its email domain, so that it ends in your company’s own domain name',
      'Its project, by moving it to another project together with its roles'
    ],
    answer: 0,
    explanation: 'A service account’s ID, and therefore its email, is fixed at creation; you can update the display name and description, or create a new account and migrate to it. Service accounts cannot move between projects or change domain.'
  },
  {
    id: 'ace-m6-041',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'An external system needs a service account key, and policy says such keys must stop working automatically after 90 days. What should you configure?',
    options: [
      'The organization policy constraints/iam.serviceAccountKeyExpiryHours',
      'A calendar reminder to delete the key after 90 days',
      'A Cloud KMS rotation period of 90 days for the key',
      'A lifecycle rule on the bucket where the key file is kept'
    ],
    answer: 0,
    explanation: '`iam.serviceAccountKeyExpiryHours` makes new user-managed keys expire after the configured time. Reminders are manual, KMS rotation applies to KMS keys rather than service account keys, and lifecycle rules delete files, not the key itself.'
  },
  {
    id: 'ace-m6-042',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'You want to find service account keys that have not been used for months, so that you can delete them safely. What should you use?',
    options: [
      'Activity Analyzer and service account insights, which show when keys were last used',
      'The billing export, which lists the monthly cost of each service account key',
      'VPC Flow Logs for the IP addresses that authenticated with the keys',
      'The Secret Manager page, where every key is stored automatically'
    ],
    answer: 0,
    explanation: 'Policy Intelligence shows when service accounts and their keys last authenticated, and service account insights flag unused accounts. Keys have no cost, flow logs do not identify keys, and keys are not stored in Secret Manager automatically.'
  },
  {
    id: 'ace-m6-043',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'Cloud Build deploys to production and should run with a dedicated, minimally privileged identity rather than a default one. What should you do?',
    options: [
      'Set a user-specified service account on the build trigger, holding only the roles the build needs',
      'Grant the Cloud Build service agent Owner so that builds never fail on missing permissions',
      'Download a key for a deploy account and store it in the build’s source repository',
      'Run the build as your own user account by entering your email address in the trigger'
    ],
    answer: 0,
    explanation: 'Builds and triggers can run as a user-specified service account, granted just the deployment roles (plus Service Account User on any runtime account). Owner is excessive, keys in source control leak, and builds cannot run as your user account.'
  },
  {
    id: 'ace-m6-044',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'The security team wants to find service accounts that have not authenticated in the last 90 days, so it can disable them. Where can it see this?',
    options: [
      'Service account insights, which report service accounts that are unused',
      'The Compute Engine VM list, filtered on each VM’s service account',
      'The billing export, which records every service account that made calls',
      'The Admin console, which tracks service account sign-ins like users’'
    ],
    answer: 0,
    explanation: 'Service account insights identify service accounts with no authentication activity during the observation period, and activity data shows last-used times. VM lists and billing data are incomplete, and service accounts are not Admin console users.'
  },

  // ── Impersonation and short-lived credentials ──
  {
    id: 'ace-m6-045',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'You want a short-lived access token for deploy-sa to call an API from your terminal, without a key. Which command should you run?',
    options: [
      '`gcloud auth print-access-token --impersonate-service-account=deploy-sa@ace-lab-123.iam.gserviceaccount.com`',
      '`gcloud iam service-accounts keys create token.json --iam-account=deploy-sa@ace-lab-123.iam.gserviceaccount.com`',
      '`gcloud auth activate-service-account deploy-sa@ace-lab-123.iam.gserviceaccount.com --print-token`',
      '`gcloud iam service-accounts describe deploy-sa@ace-lab-123.iam.gserviceaccount.com --token`'
    ],
    answer: 0,
    explanation: 'With Service Account Token Creator on deploy-sa, `print-access-token --impersonate-service-account` returns an OAuth access token for it, valid for one hour by default. Creating a key is what you want to avoid, and the other flags do not exist.'
  },
  {
    id: 'ace-m6-046',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'Which role lets a principal create OAuth access tokens and ID tokens for a service account, and which lets it attach the account to resources?',
    options: [
      'Token Creator creates tokens; Service Account User attaches the account to resources',
      'Service Account User creates tokens; Token Creator attaches the account to resources',
      'Service Account Admin does both, and no other role is needed for either task',
      'Workload Identity User does both, for any service account in the project'
    ],
    answer: 0,
    explanation: 'Service Account Token Creator includes getAccessToken, getOpenIdToken, signBlob and signJwt; Service Account User includes actAs, which deploying a VM, function or service that runs as the account requires. Service Account Admin manages accounts, and Workload Identity User is for federated identities.'
  },
  {
    id: 'ace-m6-047',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'A long data migration needs an impersonated access token valid for six hours, but tokens expire after one hour. What can make a longer lifetime possible?',
    options: [
      'Listing the service account in the policy iam.allowServiceAccountCredentialLifetimeExtension',
      'A larger lifetime flag only, because any lifetime up to a day is allowed by default',
      'A service account key, because key-based tokens never expire while the key exists',
      'Workforce Identity Federation, because federated tokens last as long as the session'
    ],
    answer: 0,
    explanation: 'Short-lived access tokens last up to one hour by default; listing the service account in `iam.allowServiceAccountCredentialLifetimeExtension` allows up to 12 hours, and longer requests are rejected without it. Tokens obtained with keys also last an hour, and workforce federation is for people.'
  },
  {
    id: 'ace-m6-048',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'You need to call a private Cloud Run service from your terminal as invoker-sa, which has Cloud Run Invoker. What should the Authorization header carry?',
    options: [
      'An ID token for invoker-sa, from `gcloud auth print-identity-token --impersonate-service-account`',
      'An access token from `gcloud auth print-access-token` for your own Google user account',
      'The contents of a key file downloaded for invoker-sa, encoded in base64 for the header',
      'The service account’s email address, which Cloud Run checks against the IAM policy'
    ],
    answer: 0,
    explanation: 'Cloud Run authenticates callers with Google-signed ID tokens whose audience is the service URL; impersonation produces one for invoker-sa. Access tokens are for Google APIs, keys must never be sent, and an email address alone is not a credential.'
  },
  {
    id: 'ace-m6-049',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'You can impersonate ci-sa, and ci-sa can impersonate deploy-sa, but you cannot impersonate deploy-sa directly. How can you get a token for deploy-sa?',
    options: [
      'Use a delegation chain, for example `--impersonate-service-account=ci-sa@…,deploy-sa@…`',
      'Run gcloud twice, pasting the first token into the second command as a password',
      'Create a key for ci-sa and use it to create a key for deploy-sa',
      'Grant yourself Owner on the project, because delegation is not supported'
    ],
    answer: 0,
    explanation: 'The IAM Credentials API supports delegation chains: each identity needs Token Creator on the next, and gcloud accepts a comma-separated list of service accounts to impersonate in order. Pasting tokens is not the mechanism, keys break the keyless design, and Owner is excessive.'
  },
  {
    id: 'ace-m6-050',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'You must create Cloud Storage signed URLs from a laptop, and your organization blocks service account keys. How can you still sign them?',
    options: [
      'Impersonate a signer account: `gcloud storage sign-url --impersonate-service-account=…`',
      'Ask the organization admin to allow key creation for one day, then delete the key',
      'Make the bucket public during the download window instead of signing URLs',
      'Use your own account’s password, which gcloud uses to sign the URL directly'
    ],
    answer: 0,
    explanation: 'With impersonation, signing goes through the IAM Credentials signBlob API, which needs Token Creator on the signing account and no key file. A temporary key or a public bucket defeats the controls, and passwords are never used for signing.'
  },
  {
    id: 'ace-m6-051',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'When a user impersonates a service account to make an API call, what do Cloud Audit Logs record?',
    options: [
      'The service account as the caller, plus delegation details naming the original user',
      'Only the service account, with no record of the user who impersonated it',
      'Only the user, because impersonation hides the service account in logs',
      'Nothing, because impersonated calls are never written to audit logs'
    ],
    answer: 0,
    explanation: 'Audit log entries for impersonated calls show the service account as the principal and include the delegation chain (serviceAccountDelegationInfo) with the original user, so actions stay traceable. Token generation can be logged by the IAM Credentials API too.'
  },
  {
    id: 'ace-m6-052',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'Terraform on an engineer’s laptop should run as tf-deployer@ace-lab-123.iam.gserviceaccount.com without any key file. What should they configure?',
    options: [
      'Provider impersonation, with impersonate_service_account or GOOGLE_IMPERSONATE_SERVICE_ACCOUNT',
      'A key file for tf-deployer, referenced by the credentials argument of the google provider',
      'The engineer’s own password in a variable that the provider reads at runtime',
      'A Workload Identity Federation pool for the laptop with an AWS provider'
    ],
    answer: 0,
    explanation: 'The Google provider can impersonate a service account using the engineer’s ADC, so Terraform runs with the deployer’s roles and short-lived tokens. Key files are what the policy avoids, passwords are not used, and workload federation is for external workloads, not laptops with Google identities.'
  },

  // ── Service accounts with GKE and Workload Identity Federation ──
  {
    id: 'ace-m6-053',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'New GKE node pools should run as a minimal custom service account instead of the Compute Engine default account. Which role gives the nodes what they need for logging and monitoring?',
    options: [
      'Kubernetes Engine Default Node Service Account (`roles/container.defaultNodeServiceAccount`)',
      'Kubernetes Engine Admin (`roles/container.admin`) on the project that hosts the cluster',
      'Editor (`roles/editor`) on the project that hosts the cluster and its nodes',
      'Service Account Token Creator (`roles/iam.serviceAccountTokenCreator`) on itself'
    ],
    answer: 0,
    explanation: 'Google provides a predefined role with the permissions nodes need, such as writing logs and metrics; add Artifact Registry Reader if they pull private images. Admin and Editor are far too broad, and Token Creator is for impersonation.'
  },
  {
    id: 'ace-m6-054',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'How do you turn on Workload Identity Federation for GKE on an existing Standard cluster?',
    options: [
      'Update the cluster with `--workload-pool=PROJECT_ID.svc.id.goog`, and node pools with the GKE metadata server',
      'Create a workload identity pool in IAM and attach the cluster to it through a new OIDC provider',
      'Enable the IAM Service Account Credentials API, which turns the feature on for every cluster',
      'Install the Ops Agent on each node and configure it to issue Google tokens to the Pods'
    ],
    answer: 0,
    explanation: 'Workload Identity Federation for GKE uses the project’s fixed pool PROJECT_ID.svc.id.goog: update the cluster with `--workload-pool` and node pools with `--workload-metadata=GKE_METADATA` (new pools then get it by default). No custom pool, API switch or agent is involved, and Autopilot has it on already.'
  },
  {
    id: 'ace-m6-055',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'With Workload Identity Federation for GKE, the Kubernetes service account orders in namespace shop must read a bucket, without any IAM service account. Which member should the bucket binding use?',
    options: [
      '`principal://iam.googleapis.com/projects/NUM/locations/global/workloadIdentityPools/ID.svc.id.goog/subject/ns/shop/sa/orders`',
      '`serviceAccount:orders@ID.iam.gserviceaccount.com`, the IAM service account with the same name',
      '`serviceAccount:ID.svc.id.goog[shop/orders]`, bound directly with Storage Object Viewer on the bucket',
      '`principalSet://iam.googleapis.com/locations/global/workforcePools/shop-pool/group/orders-team`'
    ],
    answer: 0,
    explanation: 'Kubernetes service accounts can be granted roles directly with their principal identifier in the workload pool. An IAM service account named orders is a different identity, the bracketed form is used for the older Workload Identity User binding on an IAM service account, and workforce pools are for people.'
  },
  {
    id: 'ace-m6-056',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'Instead of granting roles to the Kubernetes service account directly, a team links it to the IAM service account orders-gsa. Which two steps are needed? (Choose two.)',
    options: [
      'Grant the KSA Workload Identity User on orders-gsa',
      'Annotate the KSA with iam.gke.io/gcp-service-account',
      'Create a key for orders-gsa and mount it as a Secret',
      'Grant orders-gsa Kubernetes Engine Admin on the cluster',
      'Add the node pool’s service account to orders-gsa’s group'
    ],
    answer: [0, 1],
    explanation: 'The linking method binds `roles/iam.workloadIdentityUser` on the IAM service account for the member `serviceAccount:PROJECT_ID.svc.id.goog[NAMESPACE/KSA]`, and annotates the KSA with the IAM account’s email. Keys defeat the purpose, and cluster admin rights or node accounts are unrelated.'
  },
  {
    id: 'ace-m6-057',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'An application on AWS EC2 must write to a Cloud Storage bucket without a Google service account key. What should you set up?',
    options: [
      'A workload identity pool with an AWS provider, granting access to the mapped AWS identity',
      'A Workforce Identity Federation pool for the AWS account’s IAM users and roles',
      'A service account key stored in AWS Secrets Manager and rotated every 30 days',
      'Cross-Cloud Interconnect, which lets AWS roles call Google APIs directly'
    ],
    answer: 0,
    explanation: 'Workload Identity Federation trusts AWS (and Azure or OIDC and SAML providers): the app exchanges its AWS credentials for short-lived Google credentials, with roles granted to the pool principal or to an impersonated service account. Workforce federation is for people, keys are what you avoid, and Interconnect is networking.'
  },
  {
    id: 'ace-m6-058',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'hard',
    prompt: 'A workload identity pool trusts GitHub’s OIDC issuer. Only workflows from the repository acme/payments may get Google credentials. What should you configure?',
    options: [
      'An attribute condition such as `assertion.repository == "acme/payments"` on the provider',
      'An IAM deny policy that blocks every GitHub user except the payments team',
      'A firewall rule allowing only GitHub’s IP ranges to reach the token endpoint',
      'A separate Google group for the repository with its members added by hand'
    ],
    answer: 0,
    explanation: 'Attribute conditions on a provider reject tokens that do not match, for example by repository or organization, and attribute mappings let you grant access to a principalSet such as the repository. Deny policies, firewall rules and manual groups do not inspect OIDC claims.'
  },
  {
    id: 'ace-m6-059',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'An application on Azure will use Workload Identity Federation through the Google client libraries. What tells the libraries how to exchange its Azure token?',
    options: [
      'A credential configuration file from `gcloud iam workload-identity-pools create-cred-config`',
      'A service account JSON key file downloaded from the console for the workload pool',
      'An API key restricted to the Security Token Service API in the pool’s project',
      'A Workforce Identity Federation login configuration created for each Azure VM'
    ],
    answer: 0,
    explanation: 'The credential configuration file tells client libraries, through ADC, which pool provider and token source to use, and which service account to impersonate if any; it contains no secrets. A key file is a secret, API keys do not authenticate this way, and workforce configurations are for people.'
  },
  {
    id: 'ace-m6-060',
    section: 'access',
    topic: 'Service accounts',
    difficulty: 'medium',
    prompt: 'With Workload Identity Federation, what is the difference between direct resource access and service account impersonation?',
    options: [
      'Direct access grants roles to the federated identity itself; impersonation uses a service account’s roles',
      'Direct access needs a service account key on the workload; impersonation needs no credentials',
      'Direct access only works for people; impersonation is the only option for workloads',
      'They are the same thing with two names, and both need a key file on the workload'
    ],
    answer: 0,
    explanation: 'Federated identities can be granted roles directly as principal:// or principalSet:// members on supported resources, or they can impersonate a service account through Workload Identity User and use its roles. Neither approach needs a key.'
  },

  // ── Mixed review: Module 1 — foundations ──
  {
    id: 'ace-m6-061',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'easy',
    prompt: 'Which command links project ace-new-123 to billing account 0X0X0X-0X0X0X-0X0X0X?',
    options: [
      '`gcloud billing projects link ace-new-123 --billing-account=0X0X0X-0X0X0X-0X0X0X`',
      '`gcloud projects update ace-new-123 --billing=0X0X0X-0X0X0X-0X0X0X`',
      '`gcloud billing accounts add-project 0X0X0X-0X0X0X-0X0X0X ace-new-123`',
      '`gcloud services enable billing.googleapis.com --account=0X0X0X-0X0X0X-0X0X0X`'
    ],
    answer: 0,
    explanation: '`gcloud billing projects link` sets a project’s billing account, which needs permissions on both the project and the billing account. The other commands do not exist in that form, and enabling an API does not link billing.'
  },
  {
    id: 'ace-m6-062',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Which statement about labels, tags and network tags is correct?',
    options: [
      'Labels sort resources and costs, tags drive policy conditions, network tags target VPC firewall rules',
      'Labels drive IAM conditions, tags appear in billing reports, network tags group projects in folders',
      'All three are one feature with three names, shown on different console pages',
      'Network tags are the only kind that can be attached to projects and folders'
    ],
    answer: 0,
    explanation: 'Labels are key-value metadata for filtering and cost breakdowns; tags (Resource Manager tags) are IAM-governed and usable in IAM conditions, organization policies and firewall policies; network tags are strings on VMs used by VPC firewall rules and routes.'
  },
  {
    id: 'ace-m6-063',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Project leads may create projects only inside their own department’s folder. What should you grant them?',
    options: [
      'Project Creator on the department’s folder',
      'Project Creator on the organization node',
      'Folder Admin on the organization node',
      'Owner on an existing project in the folder'
    ],
    answer: 0,
    explanation: 'Project Creator granted on a folder lets people create projects in that folder only. On the organization it allows projects anywhere, Folder Admin manages folders broadly, and owning one project does not allow creating others.'
  },
  {
    id: 'ace-m6-064',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'medium',
    prompt: 'Enabling the Compute Engine API in a new project fails with an error about billing. What is the cause?',
    options: [
      'The project has no active billing account linked, which paid APIs require',
      'The Compute Engine API can only be enabled by Google Cloud Support',
      'The project ID is too long for the Compute Engine API to accept',
      'The organization requires every project to keep the default network'
    ],
    answer: 0,
    explanation: 'Paid services such as Compute Engine can only be enabled in projects linked to an active billing account, so link one with `gcloud billing projects link` and retry. Enabling APIs does not depend on the length of the project ID or on networks.'
  },
  {
    id: 'ace-m6-065',
    section: 'setup',
    topic: 'gcloud CLI, APIs & quotas',
    difficulty: 'easy',
    prompt: 'You have several gcloud configurations and want to see which ones exist and which is active. Which command should you run?',
    options: [
      '`gcloud config configurations list`',
      '`gcloud config list --all-configs`',
      '`gcloud auth list --configurations`',
      '`gcloud projects list --configs`'
    ],
    answer: 0,
    explanation: '`gcloud config configurations list` shows every named configuration with its account and project and marks the active one. The other flags do not exist, and `gcloud auth list` shows credentialed accounts.'
  },
  {
    id: 'ace-m6-066',
    section: 'setup',
    topic: 'Resource hierarchy & org policy',
    difficulty: 'medium',
    prompt: 'Security wants every VM in the organization to use OS Login, whatever metadata project owners set. Which organization policy constraint enforces this?',
    options: [
      'constraints/compute.requireOsLogin',
      'constraints/compute.disableSerialPortAccess',
      'constraints/compute.vmExternalIpAccess',
      'constraints/iam.disableServiceAccountKeyCreation'
    ],
    answer: 0,
    explanation: '`compute.requireOsLogin` forces OS Login on for all VMs in scope, regardless of their `enable-oslogin` metadata. The other constraints cover the serial console, external IPs and service account keys.'
  },
  {
    id: 'ace-m6-067',
    section: 'setup',
    topic: 'Observability & asset inventory',
    difficulty: 'medium',
    prompt: 'You must find every resource in the organization whose IAM policy grants access to allUsers. What is the quickest way?',
    options: [
      '`gcloud asset search-all-iam-policies --scope=organizations/ORG_ID --query="policy:allUsers"`',
      'Open the Permissions tab of every bucket in every project of the organization',
      '`gcloud storage buckets list --public --all-projects`',
      'Export the billing data and look for buckets with download charges'
    ],
    answer: 0,
    explanation: 'Cloud Asset Inventory searches allow policies across the organization for principals such as allUsers and allAuthenticatedUsers and returns the resources that grant them. Checking by hand does not scale, those flags do not exist, and billing data shows no permissions.'
  },
  {
    id: 'ace-m6-068',
    section: 'setup',
    topic: 'Billing & budgets',
    difficulty: 'medium',
    prompt: 'You want to start exporting Cloud Billing data to BigQuery. What must you choose when you enable the export?',
    options: [
      'A BigQuery dataset in a project you can access, set as the destination in the Billing export page',
      'A Cloud Storage bucket where billing files are written before being loaded into BigQuery',
      'A Pub/Sub topic that streams each charge from Cloud Billing to BigQuery in real time',
      'A Dataflow pipeline that copies invoices from the Billing console every day'
    ],
    answer: 0,
    explanation: 'Billing export writes directly to a BigQuery dataset you select on the Billing export page. No bucket, topic or pipeline is needed, and data is exported from the time the export is enabled, so turn it on early.'
  },

  // ── Mixed review: Module 2 — compute ──
  {
    id: 'ace-m6-069',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'easy',
    prompt: 'A web tier must survive a zone failure with no manual action. What should you deploy?',
    options: [
      'A regional managed instance group across several zones, behind a load balancer',
      'A zonal managed instance group with autohealing and a larger target size',
      'One large VM with live migration and automatic restart enabled',
      'An unmanaged instance group of VMs that are all in the same zone'
    ],
    answer: 0,
    explanation: 'A regional MIG spreads VMs across zones and keeps its target size if one zone fails, while the load balancer sends traffic to healthy VMs. A zonal group, a single VM or an unmanaged group in one zone go down with that zone.'
  },
  {
    id: 'ace-m6-070',
    section: 'operating',
    topic: 'Managing GKE',
    difficulty: 'easy',
    prompt: 'After `kubectl set image`, you want to follow the rollout until it finishes or fails. Which command shows its progress?',
    options: [
      '`kubectl rollout status deployment/web`',
      '`kubectl rollout history deployment/web --watch`',
      '`kubectl get events --rollout=web`',
      '`kubectl describe nodes --rollout`'
    ],
    answer: 0,
    explanation: '`kubectl rollout status` follows a Deployment’s rollout and reports when it completes or stalls. `rollout history` lists past revisions, and the other flags do not exist.'
  },
  {
    id: 'ace-m6-071',
    section: 'operating',
    topic: 'Serverless operations',
    difficulty: 'medium',
    prompt: 'You deployed a revision of the Cloud Run service shop with `--no-traffic --tag=green`. Where can testers reach it?',
    options: [
      'At the tag’s own URL, such as https://green---shop-abc123-et.a.run.app',
      'At the normal service URL with an X-Revision: green header added',
      'At the normal service URL, because tagged revisions get 10% of traffic',
      'Nowhere, until some traffic is moved to the green revision'
    ],
    answer: 0,
    explanation: 'A tag gives a revision its own URL of the form TAG---SERVICE-HASH-REGION.a.run.app, reachable even with 0% of traffic, so testers can try it before users do. The normal URL keeps serving the current revisions.'
  },
  {
    id: 'ace-m6-072',
    section: 'planning',
    topic: 'Compute Engine',
    difficulty: 'medium',
    prompt: 'Stateless batch workers on Spot VMs write all their results to Cloud Storage, so nothing on a preempted worker’s disk is needed. Which termination action keeps cost lowest?',
    options: [
      'DELETE, so preempted VMs and their disks stop being billed',
      'STOP, so the stopped VMs keep their disks for a restart',
      'RESTART, so Compute Engine brings each VM back right away',
      'MIGRATE, so each VM moves to another host before preemption'
    ],
    answer: 0,
    explanation: 'With DELETE, a preempted Spot VM and its auto-delete disks are removed, so no disk charges remain, and a MIG can create replacements. STOP keeps the disks and their cost, and RESTART and MIGRATE are not Spot termination actions.'
  },
  {
    id: 'ace-m6-073',
    section: 'operating',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A disk that has a snapshot schedule is deleted. What happens to the snapshots the schedule created?',
    options: [
      'It depends on the schedule’s on-source-disk-delete rule: keep them, or apply the retention policy',
      'They are always deleted together with the disk, because snapshots belong to the disk',
      'They are converted into custom images that you then have to delete by hand',
      'Snapshots keep being taken every day from the deleted disk’s last known state'
    ],
    answer: 0,
    explanation: 'Snapshot schedules have an on-source-disk-delete rule: keep the automatic snapshots (the default) or apply the retention policy so they age out. Snapshots are independent resources, are not converted to images, and no new ones are taken without a disk.'
  },
  {
    id: 'ace-m6-074',
    section: 'planning',
    topic: 'Cloud Run, App Engine & Functions',
    difficulty: 'medium',
    prompt: 'When a file lands in a bucket, a Cloud Run service must process it, and you want Google to handle event delivery and filtering. What is the most direct option?',
    options: [
      'An Eventarc trigger on the bucket’s object-finalized event that targets the service',
      'A Cloud Scheduler job that calls the service every minute to check the bucket',
      'A Pub/Sub topic that the service publishes to after it finishes processing',
      'A Compute Engine VM that watches the bucket and forwards new file names'
    ],
    answer: 0,
    explanation: 'Eventarc delivers Cloud Storage events (through Pub/Sub under the hood) to Cloud Run services, functions, Workflows or GKE, filtered by event type and bucket. Polling wastes work and adds delay, and publishing after processing is the wrong direction.'
  },
  {
    id: 'ace-m6-075',
    section: 'planning',
    topic: 'GKE',
    difficulty: 'easy',
    prompt: 'Which path refers to the image web, tag v3, in the Artifact Registry Docker repository apps of project ace-lab-123 in Jakarta?',
    options: [
      '`asia-southeast2-docker.pkg.dev/ace-lab-123/apps/web:v3`',
      '`gcr.io/ace-lab-123/apps/web:v3`',
      '`docker.io/ace-lab-123/apps/web:v3`',
      '`asia-southeast2.artifactregistry.io/apps/web:v3`'
    ],
    answer: 0,
    explanation: 'Artifact Registry Docker images use LOCATION-docker.pkg.dev/PROJECT/REPOSITORY/IMAGE:TAG. gcr.io paths belong to the retired Container Registry, docker.io is Docker Hub, and the last host does not exist.'
  },
  {
    id: 'ace-m6-076',
    section: 'planning',
    topic: 'Choosing compute',
    difficulty: 'medium',
    prompt: 'A containerised report generator must run every night at 01:00 for about 40 minutes and then exit; it serves no HTTP traffic. What should you use?',
    options: [
      'A Cloud Run job started by Cloud Scheduler',
      'A Cloud Run function with an HTTP trigger',
      'A GKE Standard Deployment with one replica',
      'An App Engine standard service with cron'
    ],
    answer: 0,
    explanation: 'Cloud Run jobs run containers to completion and can be started on a schedule by Cloud Scheduler, billing only while they run. Functions suit short request or event handling, a Deployment keeps a Pod running all day, and App Engine cron calls a web handler.'
  },

  // ── Mixed review: Module 3 — storage and data ──
  {
    id: 'ace-m6-077',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'easy',
    prompt: 'Monthly backups are restored about once a month for testing and kept for six months. Which storage class fits best?',
    options: ['Nearline', 'Archive', 'Coldline', 'Standard'],
    answer: 0,
    explanation: 'Nearline suits data accessed about once a month, with a 30-day minimum storage duration. Coldline and Archive are cheaper to store but cost more to read and have longer minimum durations, and Standard is the most expensive to store.'
  },
  {
    id: 'ace-m6-078',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A BigQuery dataset was created in the US multi-region by mistake and must be in asia-southeast2. What should you do?',
    options: [
      'Create a dataset in asia-southeast2, copy the tables into it, then delete the old dataset',
      'Edit the dataset’s location in its settings, which moves the tables in the background',
      'Run `bq update --location=asia-southeast2` on the dataset and wait for it to finish',
      'Change the project’s default location, which moves every dataset automatically'
    ],
    answer: 0,
    explanation: 'A dataset’s location is fixed at creation, so you create a new dataset in the right location and copy the data across (for example with a dataset copy, or export and load), then repoint queries. There is no way to update the location.'
  },
  {
    id: 'ace-m6-079',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Session documents in Firestore should be deleted automatically after their expireAt time, without a cleanup job. What should you configure?',
    options: [
      'A TTL policy on the expireAt field for the collection group',
      'A lifecycle rule on the Firestore database’s storage bucket',
      'A Cloud Scheduler job that deletes old documents hourly',
      'A composite index on expireAt with a built-in expiry'
    ],
    answer: 0,
    explanation: 'Firestore TTL policies delete documents some time after the timestamp in a chosen field has passed. Firestore has no bucket lifecycle, a scheduled job is the code you want to avoid, and indexes do not expire data.'
  },
  {
    id: 'ace-m6-080',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Analysts in another team should query only aggregated sales figures, without access to the customer-level tables behind them. What should you set up in BigQuery?',
    options: [
      'An authorized view (or authorized dataset) exposing the aggregates to the analysts',
      'BigQuery Data Viewer on the source dataset, with a request not to read raw tables',
      'A daily copy of the raw tables in the analysts’ own project',
      'Row-level security on every table with a filter that returns no rows'
    ],
    answer: 0,
    explanation: 'Authorized views and authorized datasets let users query a view’s results without access to the tables behind it. Viewer on the source exposes everything, copies leak raw data, and hiding every row would hide the aggregates too.'
  },
  {
    id: 'ace-m6-081',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A team runs Apache Spark jobs on-premises and wants to move them to Google Cloud with as few code changes as possible. Which service fits?',
    options: ['Managed Service for Apache Spark', 'Dataflow', 'BigQuery Data Transfer Service', 'Cloud Composer'],
    answer: 0,
    explanation: 'Managed Service for Apache Spark (formerly Dataproc) runs Spark and Hadoop on managed clusters or serverless, so existing jobs move with little change. Dataflow runs Apache Beam pipelines, so the jobs would need rewriting, the BigQuery Data Transfer Service only schedules loads into BigQuery, and Cloud Composer orchestrates rather than processes.'
  },
  {
    id: 'ace-m6-082',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Messages on a Pub/Sub topic must land in a BigQuery table as they arrive, with no transformation and no pipeline to run. What should you create?',
    options: [
      'A BigQuery subscription on the topic',
      'A Dataflow job from a custom template',
      'A Cloud Run service that pulls messages',
      'A daily load job from Cloud Storage'
    ],
    answer: 0,
    explanation: 'BigQuery subscriptions write messages straight into a table, using the table’s schema or the topic schema, with nothing to run. Dataflow and Cloud Run are for when processing is needed, and a daily load is not "as they arrive".'
  },
  {
    id: 'ace-m6-083',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A game needs a real-time leaderboard whose ranks update thousands of times per second, with sub-millisecond reads. Which service fits best?',
    options: [
      'Memorystore (Redis or Valkey), using sorted sets',
      'Cloud SQL, with an index on the score column',
      'BigQuery, with a scheduled query every minute',
      'Cloud Storage, with one object per player'
    ],
    answer: 0,
    explanation: 'In-memory sorted sets give fast rank updates and range reads, a classic Memorystore use case (with the source of truth kept elsewhere if needed). A relational index struggles at this rate, BigQuery is analytical, and object storage is far too slow.'
  },
  {
    id: 'ace-m6-084',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'You rotate the Cloud KMS key that protects a Cloud Storage bucket. What happens to objects written before the rotation?',
    options: [
      'They stay protected by the old key version, which must remain enabled to read them',
      'They are re-encrypted with the new key version automatically within 24 hours',
      'They become unreadable until they are rewritten with the new key version',
      'They are moved to a new bucket that uses the new key version by default'
    ],
    answer: 0,
    explanation: 'Rotation creates a new primary key version for new data; existing objects keep the version they were written with, so old versions must stay enabled (rewriting an object re-encrypts it with the new version). Nothing is re-encrypted or moved automatically.'
  },

  // ── Mixed review: Module 4 — networking ──
  {
    id: 'ace-m6-085',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Private VMs need to download packages from the internet and also call Cloud Storage. What is the recommended combination?',
    options: [
      'Cloud NAT for internet egress and Private Google Access for Google APIs',
      'An external IP on every VM, with firewall rules limiting ingress',
      'Cloud NAT only, because NAT is the best path to Google APIs too',
      'Private Google Access only, because it also reaches the internet'
    ],
    answer: 0,
    explanation: 'Cloud NAT gives private VMs outbound internet access, and Private Google Access keeps traffic to Google APIs on Google’s network. External IPs expose the VMs, and Private Google Access does not reach the general internet.'
  },
  {
    id: 'ace-m6-086',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'An internal passthrough Network Load Balancer in asia-southeast2 must be reachable from clients in a us-central1 subnet of the same VPC. What should you enable?',
    options: [
      'Global access on the load balancer’s forwarding rule',
      'A second internal load balancer in us-central1',
      'Cloud NAT in us-central1 for the client VMs',
      'The Premium Tier on the internal forwarding rule'
    ],
    answer: 0,
    explanation: 'By default internal load balancers only accept clients in their own region; global access lets clients in any region of the VPC, and in connected networks, reach them. A second load balancer would need its own backends, NAT is internet egress, and tiers do not apply to internal traffic.'
  },
  {
    id: 'ace-m6-087',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Production and non-production must use separate networks with different security rules, and each environment needs central network control. Which Shared VPC design fits?',
    options: [
      'A Shared VPC host project per environment, with that environment’s service projects attached',
      'One Shared VPC host for everything, with production and test VMs on the same subnets',
      'No Shared VPC; give each project its own VPC and peer all of them together',
      'One host project per application team, shared by its production and test workloads'
    ],
    answer: 0,
    explanation: 'A common pattern is one host project per environment, such as prod and non-prod, so environments are isolated while each stays centrally managed. Shared subnets mix environments, and a mesh of peerings loses central control.'
  },
  {
    id: 'ace-m6-088',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Traffic over an HA VPN stopped, although both tunnels show ESTABLISHED. What should you check next?',
    options: [
      'The Cloud Router’s BGP sessions and learned routes, with `gcloud compute routers get-status`',
      'The VPN gateway’s machine type, which may be too small for the traffic it carries',
      'The project’s billing account, because VPNs are the first service stopped on failure',
      'The Private Google Access setting on the subnets behind the VPN tunnels'
    ],
    answer: 0,
    explanation: 'Tunnels can be up while BGP sessions are down or routes are missing; `routers get-status` shows each BGP peer’s state and the routes learned and advertised. VPN gateways have no machine type, and the other options do not explain lost routes.'
  },
  {
    id: 'ace-m6-089',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'You created a Cloud DNS public zone for example.com, but the internet still resolves the domain through the old DNS provider. What is missing?',
    options: [
      'Pointing the domain at the zone’s Cloud DNS name servers at your registrar',
      'Enabling DNSSEC, which publishes the zone to internet resolvers',
      'Making the zone private and authorising every VPC in the project',
      'Waiting one week, after which Google takes over the domain'
    ],
    answer: 0,
    explanation: 'A public zone only answers once the domain is delegated to it, so set the name servers shown for the zone (its NS records) at your registrar. DNSSEC adds signing, private zones are internal, and delegation never happens on its own.'
  },
  {
    id: 'ace-m6-090',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A network intrusion detection appliance must receive a copy of all traffic to and from the web VMs, without sitting in the traffic path. What should you configure?',
    options: [
      'Packet Mirroring for the web VMs, sending copies to the appliance behind an internal load balancer',
      'VPC Flow Logs on the web subnet with sampling set to 1.0 and metadata included',
      'Firewall Rules Logging enabled on every firewall rule that applies to the web VMs',
      'A custom static route that sends web traffic through the appliance as next hop'
    ],
    answer: 0,
    explanation: 'Packet Mirroring clones packets, payloads included, from chosen instances, tags or subnets to collectors behind an internal passthrough load balancer, without affecting the original traffic. Flow and firewall logs record metadata only, and a route would put the appliance in the path.'
  },
  {
    id: 'ace-m6-091',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'HTTPS clients of a global external Application Load Balancer must use TLS 1.2 or later with modern ciphers. What should you attach to the target HTTPS proxy?',
    options: [
      'An SSL policy with minimum TLS 1.2 and the MODERN or RESTRICTED profile',
      'A Cloud Armor rule that blocks requests with outdated user agents',
      'A self-managed certificate that was generated for TLS 1.2 only',
      'A firewall rule that only allows TLS 1.2 traffic on port 443'
    ],
    answer: 0,
    explanation: 'SSL policies set the minimum TLS version and cipher profile negotiated by a load balancer’s HTTPS or SSL proxy. Certificates do not pick protocol versions, Cloud Armor inspects requests rather than the TLS handshake, and firewall rules cannot see TLS versions.'
  },
  {
    id: 'ace-m6-092',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A public API uses gRPC over HTTP/2 and runs in two regions. Which load balancer supports it with global routing?',
    options: [
      'A global external Application Load Balancer, with HTTP/2 to the backends',
      'An external passthrough Network Load Balancer in each of the regions',
      'A regional internal Application Load Balancer in one of the regions',
      'A global external proxy Network Load Balancer carrying plain TCP'
    ],
    answer: 0,
    explanation: 'Application Load Balancers support HTTP/2 and gRPC, from clients and to backends, and the global external ALB routes across regions. Passthrough load balancers are regional and unaware of gRPC, internal ones are private, and a TCP proxy loses layer 7 routing.'
  },

  // ── Mixed review: Module 5 — operations and IaC ──
  {
    id: 'ace-m6-093',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Windows Server VMs must send their Windows Event Log entries to Cloud Logging. What should you install?',
    options: [
      'The Ops Agent, which collects Windows Event Logs on Windows VMs',
      'The legacy Monitoring agent, the only agent made for Windows',
      'Nothing, because event logs reach Cloud Logging without an agent',
      'Managed Service for Prometheus on each Windows VM'
    ],
    answer: 0,
    explanation: 'The Ops Agent runs on supported Windows Server versions and collects Windows Event Logs and metrics by default. The legacy agents are deprecated, guest logs need an agent, and Managed Service for Prometheus collects Prometheus metrics.'
  },
  {
    id: 'ace-m6-094',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A Terraform change must be applied exactly as it was reviewed, without Terraform recalculating the plan. How should you run it?',
    options: [
      '`terraform plan -out=change.tfplan`, then `terraform apply change.tfplan`',
      '`terraform plan`, then `terraform apply -auto-approve` an hour later',
      '`terraform apply -refresh-only`, then `terraform plan` to review it',
      '`terraform show`, then `terraform apply` with no arguments at all'
    ],
    answer: 0,
    explanation: 'Saving the plan with `-out` and applying that file applies exactly the reviewed changes, and it fails if the state changed in between. A fresh apply re-plans and may differ, and refresh-only or show do not make the planned changes.'
  },
  {
    id: 'ace-m6-095',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want one dashboard and one alert covering every VM labelled app=shop, across several projects in a metrics scope, including VMs added later. What should you define?',
    options: [
      'A Cloud Monitoring group with a filter on the app=shop label',
      'A separate dashboard for each VM, kept in a shared folder',
      'A log sink for each VM to a shared BigQuery table',
      'A network tag app-shop on every VM in each project'
    ],
    answer: 0,
    explanation: 'Groups collect resources by criteria such as labels or names across the metrics scope, and dashboards and alerting policies can target a group, which keeps up as VMs come and go. Per-VM dashboards do not scale, and sinks or network tags do not define monitoring scopes.'
  },
  {
    id: 'ace-m6-096',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Audit logs must be kept for two years, but the _Required bucket keeps them for 400 days. What should you do?',
    options: [
      'Route them with a sink to a log bucket, or Cloud Storage, with two-year retention',
      'Change the _Required bucket’s retention to two years in the Logging settings',
      'Enable Data Access audit logs, which are kept for two years by default',
      'Ask Google Cloud Support to extend the _Required retention for the project'
    ],
    answer: 0,
    explanation: 'The _Required bucket’s retention is fixed, so longer retention needs a sink copying the logs to a user-defined log bucket (retention up to 10 years) or to Cloud Storage. Data Access logs follow the _Default bucket’s retention, and Support does not change _Required.'
  },
  {
    id: 'ace-m6-097',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You want a script to list the machine type recommendations for VMs in one zone. Which command should it use?',
    options: [
      '`gcloud recommender recommendations list --recommender=google.compute.instance.MachineTypeRecommender --location=ZONE`',
      '`gcloud compute instances list --recommendations --zone=asia-southeast2-a`',
      '`gcloud billing accounts recommendations list --zone=asia-southeast2-a`',
      '`gcloud monitoring recommendations list --recommender-type=machine-type --location=asia-southeast2-a`'
    ],
    answer: 0,
    explanation: 'The Recommender API exposes recommendations by recommender ID and location; `gcloud recommender recommendations list` lists them, and `mark-claimed` or `mark-succeeded` record what you did. The other commands do not exist.'
  },
  {
    id: 'ace-m6-098',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'hard',
    prompt: 'With Config Connector in namespaced mode, resources in the namespace shop-dev must be created in project ace-shop-dev. How do you tell Config Connector which project to use?',
    options: [
      'Annotate the namespace with cnrm.cloud.google.com/project-id: ace-shop-dev',
      'Name every resource with the prefix ace-shop-dev- so it lands there',
      'Set the project in each Pod’s environment variables in the namespace',
      'Run gcloud config set project ace-shop-dev on every cluster node'
    ],
    answer: 0,
    explanation: 'The `cnrm.cloud.google.com/project-id` annotation on a namespace, or on an individual resource, tells Config Connector which project to manage resources in. Name prefixes, Pod variables and node gcloud settings are not read by Config Connector.'
  },
  {
    id: 'ace-m6-099',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A deployment script should install a Helm release if it does not exist yet, or upgrade it if it does, in one command. What should it run?',
    options: [
      '`helm upgrade --install shop ./chart -f values.yaml`',
      '`helm install shop ./chart --replace-if-exists`',
      '`helm rollback shop 0 --install`',
      '`helm create shop --upgrade ./chart`'
    ],
    answer: 0,
    explanation: '`helm upgrade --install` upgrades an existing release or installs it when missing, which makes scripts idempotent. The other flags do not exist; `helm create` scaffolds a new chart, and rollback restores a revision.'
  },
  {
    id: 'ace-m6-100',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'An alert should fire only when CPU is above 80% and the request error rate is above 5% at the same time. How do you configure the alerting policy?',
    options: [
      'Put both conditions in one policy and combine them with AND',
      'Create two policies and ask on-call to check if both fired',
      'Create one condition on CPU and add the errors later',
      'Use a log-based metric that adds CPU and error rate together'
    ],
    answer: 0,
    explanation: 'An alerting policy can hold several conditions combined with AND or OR (or one PromQL condition expressing both), so it fires only when both are true. Two separate policies page twice, leaving out errors misses the requirement, and adding unrelated numbers makes no sense.'
  }
];
