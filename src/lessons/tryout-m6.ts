/**
 * Tryout prep for course Module 6, sessions 23–26 (exam guide Section 4 and
 * the full-blueprint review): IAM policy structure and evaluation, where to
 * attach roles, role types and custom roles; service accounts, impersonation,
 * short-lived credentials, Workload Identity Federation (for GKE and outside
 * Google Cloud) and the other controls questions mix in; the security labs;
 * then blueprint review, question strategy and exam logistics, and a mixed
 * check before the Module 6 mini mock (M6 · Set 1–5 in exams/ace/sets.ts).
 * Checked against the Google Cloud docs in October 2026.
 */
import type { Lesson } from '@/types';

const SA = 'deploy@ace-lab-123.iam.gserviceaccount.com';
const POOL = 'projects/987654321098/locations/global/workloadIdentityPools';

export const lesson: Lesson = {
  id: 'tryout-m6',
  lang: 'en',
  title: 'Tryout Prep · Module 6: Security Deep-Dive & Exam Readiness',
  intro:
    'Module 6 is exam guide Section 4, about a fifth of the exam, plus the final review of everything else. It follows sessions 23 to 26 of the course. First the IAM deep dive: how allow and deny policies are built and evaluated, where to attach roles, and basic, predefined and custom roles. Then service accounts, impersonation and short-lived credentials, Workload Identity Federation for GKE and for workloads outside Google Cloud, and the other controls that questions mix in. The last part is exam readiness: the blueprint and how to turn try-out scores into a revision plan, how to read and eliminate answers, the clock for each format, the logistics, and a final cue sheet across all six modules. Then sit M6 · Set 1 to 5. Each has 20 questions in 24 minutes, with 12 on Section 4 and 8 mixed from Modules 1 to 5.',
  parts: [
    {
      id: 's23',
      title: 'Session 23 · IAM deep dive: policies, role types and inheritance',
      sections: [
        {
          id: 's23-policy',
          title: 'S23-01 · IAM policy structure and evaluation',
          blocks: [
            {
              kind: 'p',
              text: 'An **allow policy** is attached to a resource: an organization, folder, project, or a resource such as a bucket, dataset, topic, service account or secret. It is a list of **bindings**. Each binding joins **members** (principals) to one **role**, optionally with a **condition**. The **etag** guards against two people overwriting each other’s changes, and **version 3** is required when conditions are used.'
            },
            {
              kind: 'code',
              title: 'An allow policy, as `get-iam-policy` shows it',
              lines: [
                'bindings:',
                '- role: roles/storage.objectViewer',
                '  members:',
                '  - group:analysts@example.com',
                '- role: roles/compute.instanceAdmin.v1',
                '  members:',
                '  - user:contractor@example.com',
                '  condition:',
                '    title: until-2027',
                '    expression: request.time < timestamp("2027-01-01T00:00:00Z")',
                'etag: BwX0example=',
                'version: 3'
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Principal access boundary policies', text: 'If any apply to the principal, they limit which resources it is eligible to access at all.' },
                { title: 'Deny policies', text: 'If a deny rule matches the principal and the permission (and its condition is true), access is **denied**, whatever any allow policy says. Exceptions can exempt principals.' },
                { title: 'Allow policies', text: 'The union of the resource’s own policy and **every ancestor’s** policy. Any binding whose role contains the permission, with a true condition, allows it.' },
                { title: 'Otherwise', text: 'Denied. IAM is deny-by-default.' }
              ]
            },
            {
              kind: 'list',
              items: [
                'Prefer `add-iam-policy-binding` and `remove-iam-policy-binding`, which change one binding. `set-iam-policy` replaces the whole policy, and the etag check makes it fail rather than overwrite a concurrent change.',
                'Organization policies (what can be configured) and **VPC Service Controls** (perimeters around APIs) are separate layers on top of IAM. A request can be allowed by IAM and still be blocked by them.',
                '**Policy Troubleshooter** explains why a principal can or cannot use a permission on a resource. **Policy Analyzer** answers "who can access what". The **IAM recommender** proposes removing permissions unused for 90 days, and **Policy Simulator** tests a change against past access first.',
                '**Privileged Access Manager** gives just-in-time, time-limited, approved and audited elevation, instead of standing admin roles.'
              ]
            },
            {
              kind: 'code',
              title: 'Read, troubleshoot, analyse, deny',
              lines: [
                '$ gcloud projects get-iam-policy ace-lab-123 --format=yaml',
                '$ gcloud policy-intelligence troubleshoot-policy iam //cloudresourcemanager.googleapis.com/projects/ace-lab-123 \\',
                '    --principal-email=ana@example.com --permission=compute.instances.start',
                '$ gcloud asset analyze-iam-policy --organization=123456789012 --identity=user:ana@example.com',
                '# deny.json: nobody but the project-admins group may delete projects',
                '{ "displayName": "No project deletes",',
                '  "rules": [{ "denyRule": {',
                '    "deniedPrincipals": ["principalSet://goog/public:all"],',
                '    "exceptionPrincipals": ["principalSet://goog/group/project-admins@example.com"],',
                '    "deniedPermissions": ["cloudresourcemanager.googleapis.com/projects.delete"] } }] }',
                '$ gcloud iam policies create no-project-delete --kind=denypolicies --policy-file=deny.json \\',
                '    --attachment-point=cloudresourcemanager.googleapis.com/organizations/123456789012'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Temporary access that ends by itself" → an IAM condition on `request.time`, or Privileged Access Manager. "Make sure nobody can delete projects, even Owners" → a deny policy. "Why can’t Ana start this VM?" → Policy Troubleshooter. "Who in the org can read this dataset?" → Policy Analyzer. "Remove permissions people do not use" → the IAM recommender.'
            },
            {
              kind: 'quiz',
              q: 'An allow policy on a project grants Ana Storage Admin. A deny policy on the organization denies `storage.buckets.delete` to all users. Can Ana delete a bucket in the project?',
              options: ['Yes: the project-level allow is more specific', 'No: a matching deny rule wins over any allow', 'Yes, if she is a project Owner', 'Only with an IAM condition'],
              answer: 1,
              explain: 'Deny policies are checked before allow policies, and a matching deny blocks the permission whatever the allows grant, unless she is listed as an exception.'
            }
          ]
        },
        {
          id: 's23-inheritance',
          title: 'S23-02 · Attaching roles at the right level, and inheritance',
          blocks: [
            {
              kind: 'table',
              caption: 'Where to grant',
              columns: ['Situation', 'Grant'],
              rows: [
                ['One service writes reports to one bucket', '`storage.objectCreator` on **the bucket**, to its service account'],
                ['Analysts read one dataset', '`bigquery.dataViewer` on **the dataset** (+ `bigquery.jobUser` on the project to run queries)'],
                ['A team deploys in every dev project', 'The role on the **dev folder**, to the team’s group'],
                ['The network team runs every VPC in the company', '`compute.networkAdmin` (or Shared VPC Admin) at the **organization** or the networking folder'],
                ['Auditors look at everything, change nothing', 'Viewer-type roles (Viewer, Security Reviewer) at the **organization**'],
                ['One person needs access for a week', 'A conditional binding with an expiry, or a Privileged Access Manager grant']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Inheritance is additive.** Effective access on a resource is its own policy plus every ancestor’s. A smaller grant lower down never reduces a bigger one above, so remove access **where it was granted**.',
                '**Resource-level policies** exist on many resources: buckets, managed folders, datasets, tables, topics, subscriptions, service accounts, secrets, KMS keys, Cloud Run services and Artifact Registry repositories. They are the narrowest grants.',
                '**Organization-only roles** include Organization Administrator, Organization Policy Administrator, Folder Creator, Project Creator and Billing Account Creator. In a new Cloud Identity organization, everyone in the domain gets Project Creator and Billing Account Creator by default. Remove those to control sprawl.',
                '**Moving a project** to another folder changes its inherited access at once.',
                '**Tags** can drive conditional grants: `resource.matchTag("123456789012/env", "dev")` limits a role to resources tagged `env=dev`.'
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud resource-manager folders add-iam-policy-binding 555444333222 \\',
                '    --member=group:dev-team@example.com --role=roles/run.developer',
                '$ gcloud organizations add-iam-policy-binding 123456789012 \\',
                '    --member=group:net-admins@example.com --role=roles/compute.networkAdmin',
                '# dev-only.yaml: the expression has a comma, so pass the condition as a file',
                'title: dev-only',
                'expression: resource.matchTag("123456789012/env", "dev")',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 --member=group:dev-team@example.com \\',
                '    --role=roles/compute.instanceAdmin.v1 --condition-from-file=dev-only.yaml'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"User has a role at the organization, and removing it from the project has no effect" → inheritance: remove it at the organization. "Grant the minimum to read one bucket" → a role on the bucket, not the project. "Stop everyone creating projects" → remove Project Creator from the domain at the organization.'
            },
            {
              kind: 'quiz',
              q: 'Bob is Viewer on the organization, Editor on folder `apps`, and has no role on project `apps-prod` inside that folder. What does Bob have on `apps-prod`?',
              options: ['Nothing, because there is no binding on the project', 'Viewer only', 'Editor, inherited from the folder (which includes Viewer’s permissions)', 'Owner'],
              answer: 2,
              explain: 'The project inherits from the folder and the organization, and the union is Editor plus Viewer, which is Editor.'
            }
          ]
        },
        {
          id: 's23-roles',
          title: 'S23-03 · Basic, predefined and custom roles; defining a custom role',
          blocks: [
            {
              kind: 'table',
              caption: 'Role types',
              columns: ['Type', 'Examples', 'Notes'],
              rows: [
                ['Basic', 'Owner, Editor, Viewer (and Browser: see the hierarchy only)', 'Thousands of permissions across all services. Avoid in production'],
                ['Predefined', '`roles/run.invoker`, `roles/cloudsql.client`, `roles/pubsub.publisher`', 'Per service, maintained by Google as services add permissions'],
                ['Custom', '`organizations/123456789012/roles/vmOperator`, `projects/ace-lab-123/roles/vmOperator`', 'Exactly the permissions you list, at organization or project level; you maintain it']
              ]
            },
            {
              kind: 'list',
              items: [
                'Predefined roles are named `roles/SERVICE.ROLE`. Find them with `gcloud iam roles list` and see their permissions with `describe`.',
                'Not every permission can go in a custom role. Each has a support level: `SUPPORTED`, `TESTING` (may change) or `NOT_SUPPORTED`. Check them with `list-testable-permissions`.',
                'Custom roles have a **launch stage**: ALPHA, BETA, GA, DEPRECATED or DISABLED. A DISABLED role grants nothing.',
                '**Deleting** a custom role makes its bindings inert. It can be **undeleted within 7 days**, after which it is gone for good.',
                'When Google adds permissions to a service, predefined roles get them and your custom roles do not. That is the cost of custom roles.'
              ]
            },
            {
              kind: 'code',
              title: 'Define, create, update, copy, delete',
              lines: [
                '# vm-operator.yaml',
                'title: VM operator',
                'description: View, start and stop VMs',
                'stage: GA',
                'includedPermissions:',
                '- compute.instances.get',
                '- compute.instances.list',
                '- compute.instances.start',
                '- compute.instances.stop',
                '$ gcloud iam roles create vmOperator --project=ace-lab-123 --file=vm-operator.yaml',
                '$ gcloud iam roles update vmOperator --project=ace-lab-123 --add-permissions=compute.instances.reset',
                '$ gcloud iam roles copy --source=roles/compute.viewer --destination=myViewer --dest-project=ace-lab-123',
                '$ gcloud iam list-testable-permissions //cloudresourcemanager.googleapis.com/projects/ace-lab-123 \\',
                '    --filter="customRolesSupportLevel!=NOT_SUPPORTED"',
                '$ gcloud iam roles describe roles/run.invoker',
                '$ gcloud iam roles delete vmOperator --project=ace-lab-123',
                '$ gcloud iam roles undelete vmOperator --project=ace-lab-123'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"No predefined role is narrow enough; least privilege" → a custom role. Otherwise always prefer predefined. "Custom role for every project in the company" → create it at the organization. "Create a custom role on a folder" → impossible. "Start from a predefined role and remove two permissions" → `gcloud iam roles copy`, then update.'
            },
            {
              kind: 'quiz',
              q: 'An operator must start and stop VMs and see them, but must not create, delete or SSH into them. No predefined role fits. What do you do?',
              options: ['Grant Compute Instance Admin', 'Create a custom role with `compute.instances.get`, `list`, `start` and `stop`, and grant it to the operators’ group', 'Grant Editor with a deny policy', 'Grant Viewer and share a service account key'],
              answer: 1,
              explain: 'A custom role with exactly those permissions is least privilege. Instance Admin can delete, and Editor is far too broad.'
            }
          ]
        }
      ]
    },
    {
      id: 's24',
      title: 'Session 24 · Service accounts and identity federation',
      sections: [
        {
          id: 's24-sa',
          title: 'S24-01 · Service account lifecycle and IAM permissions',
          blocks: [
            {
              kind: 'table',
              caption: 'Three kinds of service account',
              columns: ['Kind', 'Looks like', 'Notes'],
              rows: [
                ['User-managed', '`report-job@ace-lab-123.iam.gserviceaccount.com`', 'Yours: create one per workload, grant narrowly'],
                ['Default', '`PROJECT_NUMBER-compute@developer.gserviceaccount.com`, `PROJECT_ID@appspot.gserviceaccount.com`', 'Created when an API is enabled. They used to get Editor automatically, which `iam.automaticIamGrantsForDefaultServiceAccounts` (default on new organizations) prevents. Do not use them for workloads'],
                ['Service agents (Google-managed)', '`service-PROJECT_NUMBER@gcp-sa-SERVICE.iam.gserviceaccount.com`', 'Used by Google services to act in your project, for example with CMEK keys or Eventarc. Do not remove their roles']
              ]
            },
            {
              kind: 'table',
              caption: 'Roles on a service account (it is also a resource)',
              columns: ['Role', 'Lets a principal'],
              mono: [0],
              rows: [
                ['roles/iam.serviceAccountUser', '**Attach** it to a VM, Cloud Run service or other resource (actAs)'],
                ['roles/iam.serviceAccountTokenCreator', '**Impersonate** it: get access and ID tokens, sign blobs and JWTs'],
                ['roles/iam.serviceAccountAdmin', 'Create, update, disable and delete service accounts and manage their IAM'],
                ['roles/iam.serviceAccountKeyAdmin', 'Create and delete keys (avoid needing it)'],
                ['roles/iam.workloadIdentityUser', 'Let a federated or GKE identity act as it']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Lifecycle**: create → grant roles on the resources it needs → attach → **disable** (reversible, blocks all its access) → **delete** (undeletable for 30 days by its unique ID). A new account with the same name is a different identity, and old bindings do not apply to it.',
                '**Keys**: user-managed JSON keys never expire unless an organization policy sets an expiry. They leak, so avoid them. `iam.disableServiceAccountKeyCreation` blocks them and is enforced on new organizations. Attached service accounts use Google-managed keys that rotate automatically.',
                '**Attaching**: a VM (`--service-account` with the `cloud-platform` scope; the VM must be stopped to change it), Cloud Run, functions, Cloud Build and Dataflow (their own flags). For GKE nodes, use a dedicated node service account with **Kubernetes Engine Default Node Service Account** (`roles/container.defaultNodeServiceAccount`), and give Pods their own identities.'
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud iam service-accounts create report-job --display-name="Nightly report"',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-lab-reports \\',
                '    --member=serviceAccount:report-job@ace-lab-123.iam.gserviceaccount.com --role=roles/storage.objectCreator',
                '$ gcloud iam service-accounts add-iam-policy-binding report-job@ace-lab-123.iam.gserviceaccount.com \\',
                '    --member=group:data-eng@example.com --role=roles/iam.serviceAccountUser',
                '$ gcloud compute instances create report-1 --zone=asia-southeast2-a \\',
                '    --service-account=report-job@ace-lab-123.iam.gserviceaccount.com --scopes=cloud-platform',
                '$ gcloud iam service-accounts disable report-job@ace-lab-123.iam.gserviceaccount.com',
                '$ gcloud iam service-accounts keys list --iam-account=report-job@ace-lab-123.iam.gserviceaccount.com --managed-by=user'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"A developer can create VMs but gets an error choosing the app’s service account" → Service Account User on that service account. "A service account key was leaked" → delete the key (or disable the account), check the audit logs, and move to keyless credentials. "Each microservice needs different access" → one service account per service. "Use the default compute service account" is almost always the wrong answer for production.'
            },
            {
              kind: 'quiz',
              q: 'A team’s deployment pipeline must attach service account `api-sa` to new Cloud Run revisions. The pipeline identity already has Cloud Run Admin. What is missing?',
              options: ['Service Account Token Creator on the project', 'Service Account User on `api-sa`', 'Service Account Admin', 'Owner on the project'],
              answer: 1,
              explain: 'Deploying a service that runs as `api-sa` needs `iam.serviceAccounts.actAs` on it, which Service Account User grants.'
            }
          ]
        },
        {
          id: 's24-impersonation',
          title: 'S24-02 · Impersonation and short-lived credentials',
          blocks: [
            {
              kind: 'p',
              text: '**Impersonation** lets a user or another service account act as a service account for a short time, with no key file. gcloud and client libraries ask the **IAM Service Account Credentials API** for a short-lived token, and audit logs record **both** the caller and the service account. The caller needs **Service Account Token Creator** on the target service account.'
            },
            {
              kind: 'table',
              caption: 'Short-lived credentials',
              columns: ['Credential', 'For', 'Lifetime'],
              rows: [
                ['OAuth 2.0 access token', 'Calling Google APIs', '1 hour by default; up to 12 hours if the organization policy `iam.allowServiceAccountCredentialLifetimeExtension` lists the account'],
                ['OpenID Connect ID token', 'Calling Cloud Run, Cloud Run functions, IAP-protected apps (with an audience)', 'About 1 hour'],
                ['Signed JWT / signed blob', 'Signed URLs, custom auth', 'Your choice, short'],
                ['Service account key (JSON)', 'Legacy only', 'Until deleted. Avoid']
              ]
            },
            {
              kind: 'code',
              lines: [
                `$ gcloud storage ls gs://ace-lab-reports --impersonate-service-account=${SA}`,
                `$ gcloud config set auth/impersonate_service_account ${SA}`,
                '$ gcloud config unset auth/impersonate_service_account',
                `$ gcloud auth print-access-token --impersonate-service-account=${SA}`,
                `$ gcloud auth print-identity-token --impersonate-service-account=${SA} \\`,
                '    --audiences=https://shop-987654321098.asia-southeast2.run.app',
                '# local code (ADC) acting as the service account',
                `$ gcloud auth application-default login --impersonate-service-account=${SA}`,
                '# Terraform: provider "google" { impersonate_service_account = "deploy@ace-lab-123.iam.gserviceaccount.com" }'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Test what a service account can do, without downloading a key" → impersonation. "Admins should run Terraform as the deploy account, not as themselves" → grant them Token Creator on it and impersonate. "Call a private Cloud Run service from a script" → an ID token with the service URL as audience. Any answer that downloads a key is suspect when a keyless option exists.'
            },
            {
              kind: 'quiz',
              q: 'Which role must Ana have, and on what, to run `gcloud … --impersonate-service-account=deploy@…`?',
              options: ['Service Account User on the project', 'Service Account Token Creator on the `deploy` service account', 'Service Account Admin on the organization', 'Owner on the project'],
              answer: 1,
              explain: 'Generating tokens for a service account needs Token Creator on it. Service Account User is for attaching it to resources.'
            }
          ]
        },
        {
          id: 's24-wif',
          title: 'S24-03 · Service accounts with GKE, and Workload Identity Federation',
          blocks: [
            {
              kind: 'p',
              text: '**Workload Identity Federation for GKE** gives each Pod a Google identity through its **Kubernetes service account** (KSA), with no keys in the cluster. Either grant IAM roles **directly** to the KSA’s principal identifier, or let the KSA act as an IAM service account (`roles/iam.workloadIdentityUser` plus an annotation). Autopilot has it on by default. On Standard, enable the workload pool on the cluster and `GKE_METADATA` on node pools.'
            },
            {
              kind: 'code',
              title: 'Workload Identity Federation for GKE',
              lines: [
                '$ gcloud container clusters update shop-std --region=asia-southeast2 --workload-pool=ace-lab-123.svc.id.goog',
                '$ gcloud container node-pools update default-pool --cluster=shop-std --region=asia-southeast2 \\',
                '    --workload-metadata=GKE_METADATA',
                '$ kubectl create serviceaccount orders-ksa -n shop',
                '# Option 1: grant the role straight to the Kubernetes service account',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 --role=roles/pubsub.subscriber \\',
                `    --member=principal://iam.googleapis.com/${POOL}/ace-lab-123.svc.id.goog/subject/ns/shop/sa/orders-ksa`,
                '# Option 2: let it act as an IAM service account',
                '$ gcloud iam service-accounts add-iam-policy-binding orders-gsa@ace-lab-123.iam.gserviceaccount.com \\',
                '    --role=roles/iam.workloadIdentityUser --member="serviceAccount:ace-lab-123.svc.id.goog[shop/orders-ksa]"',
                '$ kubectl annotate serviceaccount orders-ksa -n shop \\',
                '    iam.gke.io/gcp-service-account=orders-gsa@ace-lab-123.iam.gserviceaccount.com',
                '# Pods use it with: spec.serviceAccountName: orders-ksa'
              ]
            },
            {
              kind: 'p',
              text: '**Workload Identity Federation** lets workloads **outside** Google Cloud, such as AWS, Azure, on-premises with OIDC or SAML, or CI systems like GitHub Actions and GitLab, swap their own credentials for short-lived Google tokens. You create a **workload identity pool** and a **provider**. **Attribute mapping** turns the external token’s claims into attributes, and an **attribute condition** limits which identities may use the provider (required for GitHub). Roles go to `principal://…` or `principalSet://…` identifiers, either directly or through a service account they can act as. The credential configuration file contains no secret.'
            },
            {
              kind: 'code',
              title: 'GitHub Actions deploying without a key',
              lines: [
                '$ gcloud iam workload-identity-pools create ci --location=global --display-name="CI"',
                '$ gcloud iam workload-identity-pools providers create-oidc github --location=global --workload-identity-pool=ci \\',
                '    --issuer-uri=https://token.actions.githubusercontent.com \\',
                '    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \\',
                '    --attribute-condition="assertion.repository_owner==\'example-org\'"',
                `$ gcloud iam service-accounts add-iam-policy-binding ${SA} --role=roles/iam.workloadIdentityUser \\`,
                `    --member="principalSet://iam.googleapis.com/${POOL}/ci/attribute.repository/example-org/shop"`,
                '# in the workflow',
                '- uses: google-github-actions/auth@v2',
                '  with:',
                `    workload_identity_provider: ${POOL}/ci/providers/github`,
                `    service_account: ${SA}`
              ]
            },
            {
              kind: 'table',
              caption: 'Three federations, easy to confuse',
              columns: ['', 'WIF for GKE', 'Workload Identity Federation', 'Workforce Identity Federation'],
              rows: [
                ['Who', 'Pods in GKE', 'Software outside Google Cloud', 'People from an external IdP'],
                ['Identity comes from', 'The Kubernetes service account', 'AWS/Azure/OIDC/SAML tokens', 'Entra ID, Okta, any OIDC/SAML IdP'],
                ['Pool', '`PROJECT_ID.svc.id.goog` (automatic)', 'A workload identity pool in a project', 'A workforce pool at the organization'],
                ['Replaces', 'Keys mounted as Kubernetes Secrets', 'Service account keys in CI and other clouds', 'Creating or syncing Google accounts']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Pods must call Cloud Storage with least privilege, no keys" → Workload Identity Federation for GKE with a dedicated KSA. "Pipeline in GitHub Actions or AWS must deploy without a service account key" → Workload Identity Federation. "Employees sign in with Okta" → Workforce Identity Federation. "All Pods share the node’s service account" → the anti-pattern this replaces.'
            },
            {
              kind: 'quiz',
              q: 'An application on AWS EC2 must write to a Pub/Sub topic. Security forbids service account keys. What do you configure?',
              options: ['A service account key stored in AWS Secrets Manager', 'Workload Identity Federation with an AWS provider, granting the role to the federated identity (or a service account it can act as)', 'Workforce Identity Federation', 'Make the topic public'],
              answer: 1,
              explain: 'Workload Identity Federation trusts the AWS identity and issues short-lived Google credentials, with no key at all.'
            }
          ]
        },
        {
          id: 's24-controls',
          title: 'S24-04 · Other access and security controls that questions mix in',
          blocks: [
            {
              kind: 'table',
              columns: ['Need', 'Control'],
              rows: [
                ['Store database passwords and API keys, versioned and audited', '**Secret Manager**, read with `roles/secretmanager.secretAccessor`, mounted into Cloud Run with `--set-secrets`'],
                ['Protect a web app with Google sign-in, no VPN', '**IAP** for web apps (`roles/iap.httpsResourceAccessor`)'],
                ['SSH/RDP to private VMs', '**IAP TCP forwarding** (`roles/iap.tunnelResourceAccessor`)'],
                ['Stop data being copied out of BigQuery or Cloud Storage, even with valid credentials', '**VPC Service Controls** perimeter'],
                ['See misconfigurations, vulnerabilities and threats across the org', '**Security Command Center**'],
                ['Control and rotate encryption keys', '**Cloud KMS** with CMEK (Module 3)'],
                ['Only deploy signed, approved container images', '**Binary Authorization**'],
                ['Find and mask personal data', '**Sensitive Data Protection** (formerly Cloud DLP)'],
                ['Verified boot, encrypted memory', '**Shielded VM**, **Confidential VM**']
              ]
            },
            {
              kind: 'code',
              title: 'Secret Manager',
              lines: [
                '$ gcloud secrets create db-pass --replication-policy=automatic --data-file=db-pass.txt && rm db-pass.txt',
                '$ gcloud secrets add-iam-policy-binding db-pass \\',
                '    --member=serviceAccount:shop-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/secretmanager.secretAccessor',
                '$ gcloud run services update shop --region=asia-southeast2 --set-secrets=DB_PASS=db-pass:latest'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Password in an environment variable or in code" → move it to Secret Manager. "Internal web app for employees, no VPN" → IAP. "Prevent exfiltration from BigQuery to a personal project" → VPC Service Controls. "Stop anyone sharing data with outside accounts" → domain restricted sharing (`iam.allowedPolicyMemberDomains`).'
            },
            {
              kind: 'quiz',
              q: 'A Cloud Run service reads a database password from a plain environment variable set at deploy time. What is the recommended improvement?',
              options: ['Put the password in the container image', 'Store it in Secret Manager, grant the service’s identity Secret Accessor, and reference it with `--set-secrets`', 'Store it in a public bucket', 'Base64-encode the variable'],
              answer: 1,
              explain: 'Secret Manager keeps the value encrypted, versioned and audited. Only the service’s own identity can read it.'
            }
          ]
        }
      ]
    },
    {
      id: 's25',
      title: 'Session 25 · Labs: security fundamentals badge and the capstone',
      sections: [
        {
          id: 's25-lab',
          title: 'Security fundamentals in practice, then an end-to-end secure deployment',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Custom role and least-privilege grants', text: 'Create a narrow custom role, grant it to a group, and verify with Policy Troubleshooter.' },
                { title: 'A dedicated service account per workload', text: 'Grant on resources (bucket, topic) rather than the project; no keys.' },
                { title: 'IAP for SSH and for the web app', text: 'Firewall from 35.235.240.0/20; IAP-secured Tunnel User for admins; IAP-secured Web App User for staff.' },
                { title: 'A private GKE cluster with Workload Identity Federation', text: 'A dedicated node service account; one KSA per app with only its roles.' },
                { title: 'Secrets and keys', text: 'Database password in Secret Manager; CMEK on the bucket that holds customer files.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Capstone checklist (reviewed against the exam guide)',
              columns: ['Area', 'Done when'],
              rows: [
                ['Network', 'Custom VPC, subnets per tier, Cloud NGFW policy with secure tags, Cloud NAT, no external IPs on backends'],
                ['Compute', 'Autoscaled regional MIG behind an external Application Load Balancer, health checks passing'],
                ['Data', 'Managed database with backups and PITR, restore tested'],
                ['Identity', 'Dedicated least-privilege service accounts, no keys, groups for people'],
                ['Operations', 'Dashboards, alerting policies, uptime check, logs routed'],
                ['Cost', 'Budget with alerts on the project']
              ]
            }
          ]
        }
      ]
    },
    {
      id: 's26',
      title: 'Session 26 · Exam readiness: blueprint review and question strategy',
      sections: [
        {
          id: 's26-blueprint',
          title: 'The blueprint, and turning try-out scores into a plan',
          blocks: [
            {
              kind: 'table',
              caption: 'Exam guide sections and where the course covers them',
              columns: ['Section', 'Weight', 'Course modules'],
              rows: [
                ['1 · Setting up a cloud solution environment', '~20%', 'Module 1'],
                ['2 · Planning and implementing a cloud solution', '~30%', 'Modules 2, 3, 4 and 5 (planning and deploying)'],
                ['3 · Ensuring the successful operation of a cloud solution', '~30%', 'Modules 2, 3, 4 and 5 (operating)'],
                ['4 · Configuring access and security', '~20%', 'Module 6']
              ]
            },
            {
              kind: 'list',
              ordered: true,
              items: [
                'Write down your score on each module try-out (M1–M6, five sets each) and on Tryout 1–4.',
                'Multiply each weakness by its weight: a weak Section 2 or 3 topic costs more points than an equally weak Section 1 topic.',
                'Re-read the matching prep lesson’s **cue table** and **traps**, then re-sit that module’s sets. The answers are reshuffled each time, so memory of positions does not help.',
                'Use a topic drill on the home page for the one or two weakest topics.',
                'Aim for **80% or more** on the full mock before booking the real exam. That is the course’s readiness benchmark.'
              ]
            }
          ]
        },
        {
          id: 's26-strategy',
          title: 'Reading, eliminating and the clock',
          blocks: [
            {
              kind: 'list',
              ordered: true,
              items: [
                '**Read the last sentence first.** It says what is being optimised: cost, least privilege, fewest steps, availability, least management, Google-recommended practice.',
                '**Underline the constraints** in the scenario: no external IPs, data stays in a country, no code changes, existing Kubernetes skills, must survive a region outage.',
                '**Cross out two options** that are wrong on a fact: a role that does not exist, a flag on the wrong product, a retired service.',
                '**Choose between the last two on the cue word**, for example "managed" over "self-built", or "a group at the folder" over "ten users on ten projects".',
                '**Multiple select** ("choose two"): both picks must be right, and they usually cover two different parts of the problem.',
                '**Mark and move on** after about 90 seconds; come back at the end. Change an answer only for a concrete reason.'
              ]
            },
            {
              kind: 'table',
              caption: 'The clock',
              columns: ['Format', 'Questions', 'Time', 'Per question'],
              rows: [
                ['Module try-out (M1–M6 sets)', '20', '24 minutes', '72 seconds'],
                ['Tryout 1–4 (Modules 1–2)', '50', '60 minutes', '72 seconds'],
                ['Real exam / full mock', '50–60', '2 hours', 'About 2 minutes, with 15 minutes left to review']
              ]
            },
            {
              kind: 'table',
              caption: 'Options that are usually wrong',
              columns: ['Pattern', 'Why'],
              rows: [
                ['Grant Owner or Editor', 'Never least privilege when a predefined role exists'],
                ['Create or download a service account key', 'Impersonation, attached service accounts or federation exist'],
                ['Do it by hand on every VM / project', 'Templates, MIGs, folders, organization policies, IaC'],
                ['Build it yourself on VMs', 'A managed service meets the need with less operation'],
                ['Create a new project to get around a quota or rule', 'Request the quota; fix the policy'],
                ['Container Registry, Deployment Manager, Cloud Debugger, Pub/Sub Lite, "Anthos", preemptible VMs as the cheap option', 'Retired, renamed or superseded; current answers use Artifact Registry, Terraform/Infrastructure Manager, Cloud Trace/Logging, Pub/Sub or Managed Kafka, GKE fleets, Spot VMs']
              ]
            }
          ]
        },
        {
          id: 's26-logistics',
          title: 'Exam logistics',
          blocks: [
            {
              kind: 'table',
              columns: ['', ''],
              rows: [
                ['Questions', '50–60, multiple choice and multiple select'],
                ['Time', '2 hours'],
                ['Cost', '$125 USD'],
                ['Languages', 'English, Japanese, Spanish, Portuguese'],
                ['Delivery', 'Online-proctored, or at a Pearson VUE test centre'],
                ['Valid for', 'Three years; renew with a 20-question renewal exam or a learning path on Google Skills'],
                ['Recommended', 'At least six months of hands-on Google Cloud experience']
              ]
            },
            {
              kind: 'list',
              items: [
                'For online proctoring, run the system check days before. You need a quiet room, a clear desk, one screen, a webcam, and the ID named on your registration.',
                'Book a time when you are usually sharp, and do not sit a full mock the night before. Read the cue sheets instead.'
              ]
            }
          ]
        },
        {
          id: 's26-final',
          title: 'Last look: one cue sheet across all six modules',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think', 'Module'],
              rows: [
                ['same rule for every project, nobody may override', 'Organization policy', '1'],
                ['same access for a whole team', 'Group at the folder', '1'],
                ['QUOTA_EXCEEDED', 'Request a quota increase', '1'],
                ['budget must stop spending', 'Budget → Pub/Sub → function', '1'],
                ['minimise operational overhead', 'Managed: Cloud Run, Autopilot, managed MIG', '2'],
                ['interruptible, cheapest', 'Spot VMs / Spot node pool', '2'],
                ['no external IP, needs SSH', 'IAP TCP forwarding (35.235.240.0/20)', '2'],
                ['change every VM in a group', 'New template + rolling update', '2'],
                ['canary', 'Cloud Run traffic split / MIG canary', '2'],
                ['rarely read, keep years', 'Archive/Coldline + lifecycle', '3'],
                ['global strongly consistent SQL', 'Spanner', '3'],
                ['restore to just before a mistake', 'Point-in-time recovery', '3'],
                ['query cost before running', '`bq --dry_run`', '3'],
                ['private VMs need internet out', 'Cloud NAT', '4'],
                ['A–B–C peering', 'Not transitive', '4'],
                ['global HTTPS + CDN + WAF', 'Global external Application LB', '4'],
                ['502, backends UNHEALTHY', 'Health check firewall rule', '4'],
                ['who read the data', 'Data Access logs (turn on first)', '5'],
                ['logs from every project', 'Aggregated sink', '5'],
                ['latency across services', 'Cloud Trace', '5'],
                ['review infra changes', '`terraform plan`', '5'],
                ['no predefined role fits', 'Custom role (org or project)', '6'],
                ['test as a service account, no key', 'Impersonation (Token Creator)', '6'],
                ['outside workload, no key', 'Workload Identity Federation', '6'],
                ['Pods need Google access', 'WIF for GKE', '6']
              ]
            }
          ]
        },
        {
          id: 'quiz',
          title: 'Check yourself: Section 4 and mixed review',
          blocks: [
            {
              kind: 'quiz',
              q: 'A contractor needs Compute Viewer on one project until 31 December, and access must end without anyone remembering to remove it. What do you do?',
              options: ['Grant it and set a calendar reminder', 'Grant it with an IAM condition on `request.time` ending 31 December', 'Create a custom role that expires', 'Give them a service account key that expires'],
              answer: 1,
              explain: 'A conditional binding with an expiry stops granting access automatically. Roles themselves do not expire.'
            },
            {
              kind: 'quiz',
              q: 'Security wants to guarantee that no one, including project Owners, can delete projects in the production folder. Which mechanism enforces this regardless of allow policies?',
              options: ['A custom role', 'A deny policy attached to the production folder, with an exception for the break-glass group', 'Removing Owner from the console UI', 'A budget alert'],
              answer: 1,
              explain: 'Deny policies override allow policies for the listed permissions, and exceptions keep a controlled way in.'
            },
            {
              kind: 'quiz',
              q: 'Which statement about custom roles is correct?',
              options: ['They can be created on folders', 'A deleted custom role can be restored within 7 days', 'Google adds new permissions to them automatically', 'They can contain permissions marked NOT_SUPPORTED'],
              answer: 1,
              explain: 'Custom roles live at organization or project level, are maintained by you, and can be undeleted for 7 days after deletion.'
            },
            {
              kind: 'quiz',
              q: 'A batch job on a VM needs read access to one bucket and write access to one BigQuery dataset. What is the best setup?',
              options: ['The default compute service account with Editor', 'A dedicated service account with Storage Object Viewer on the bucket and BigQuery Data Editor on the dataset, plus Job User on the project, attached to the VM', 'A key for a service account with Owner', 'Run the job with a user’s credentials'],
              answer: 1,
              explain: 'A dedicated identity with resource-level predefined roles is least privilege. Job User lets it run the load or query jobs.'
            },
            {
              kind: 'quiz',
              q: 'Engineers should run Terraform as `deploy@` with no key files, and the audit logs must show who ran it. What do you grant, and to whom?',
              options: ['A key for `deploy@` to each engineer', 'Service Account Token Creator on `deploy@` to the engineers’ group, then impersonate', 'Owner on the project to each engineer', 'Workforce Identity Federation for `deploy@`'],
              answer: 1,
              explain: 'Impersonation issues short-lived tokens, and the audit logs record both the engineer and the service account.'
            },
            {
              kind: 'quiz',
              q: 'Pods in a GKE Standard cluster currently use the node service account, which has broad access. What is the recommended change?',
              options: ['Mount a service account key as a Kubernetes Secret per app', 'Enable Workload Identity Federation for GKE and give each app its own Kubernetes service account with only its roles', 'Give the node service account Owner', 'Use one shared service account for all Pods'],
              answer: 1,
              explain: 'WIF for GKE gives each workload its own identity with no keys, and the node account can then stay minimal.'
            },
            {
              kind: 'quiz',
              q: 'Mixed review: a new region rollout fails with "Quota CPUS exceeded". What do you do?',
              options: ['Grant Compute Admin', 'Request a quota increase for CPUs in that region', 'Create the VMs in a new project', 'Switch to Spot VMs'],
              answer: 1,
              explain: 'Quotas are per project and region; the fix is an increase request.'
            },
            {
              kind: 'quiz',
              q: 'Mixed review: data must survive the loss of an entire region, with relational SQL and strong consistency. Which option?',
              options: ['Cloud SQL with HA', 'Spanner multi-region', 'Bigtable single cluster', 'Memorystore'],
              answer: 1,
              explain: 'Only a multi-region configuration survives a region. Spanner multi-region gives strong consistency with SQL.'
            },
            {
              kind: 'quiz',
              q: 'Mixed review: backend VMs behind a new global external Application Load Balancer are all UNHEALTHY. What do you check first?',
              options: ['Cloud NAT', 'An ingress firewall rule from `130.211.0.0/22` and `35.191.0.0/16` to the backend port', 'The Cloud DNS TTL', 'Billing'],
              answer: 1,
              explain: 'Without that rule the health checks cannot reach the backends, so none are ever marked healthy.'
            },
            {
              kind: 'quiz',
              q: 'Mixed review: an auditor needs to know who read objects in a bucket last month. Data Access logs were never enabled. What can you tell them?',
              options: ['Check Admin Activity logs', 'The reads were not logged; enable Data Access logs for Cloud Storage now so future reads are recorded', 'Restore the logs from `_Required`', 'Use VPC Flow Logs to see object names'],
              answer: 1,
              explain: 'Object reads are Data Access events, which are off by default. Nothing recorded them, so the fix only helps from now on.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Terminal: least-privilege service account', href: '#/ace/lab/terminal/iam-sa', note: 'Sessions 23–24' },
    { label: 'Command quiz: credentials, projects and IAM', href: '#/ace/lab/cmd/auth', note: 'roles, bindings, impersonation' },
    { label: 'Command quiz: Cloud SQL, security, build', href: '#/ace/lab/cmd/ops', note: 'KMS, Secret Manager' },
    { label: 'Canvas: fix a Pub/Sub push rejected with 403', href: '#/ace/lab/canvas/fix-push-403', note: 'service account and run.invoker' },
    { label: 'Canvas: CI/CD to Cloud Run', href: '#/ace/lab/canvas/cicd', note: 'pipeline identities' },
    { label: 'Deep dive: the ACE exam guide', href: '#/ace/learn/ace-guide', note: 'all four sections, for the final review' },
    { label: 'Cheat sheet', href: '#/ace/cheatsheet', note: 'the whole exam on one page' }
  ]
};
