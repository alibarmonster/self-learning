import type { Question } from '@/types';

/**
 * Section 3 — Designing for security and compliance (~17.5%). IAM and the
 * resource hierarchy, keys and data protection, security controls, secure
 * remote access, software supply chain and AI security, and compliance.
 */
export const security: Question[] = [
  // ── IAM & resource hierarchy ─────────────────────────────────────────────
  {
    id: 'pca-s-001',
    topic: 'IAM & resource hierarchy',
    difficulty: 'easy',
    prompt: 'The data engineering team must be able to create and manage BigQuery datasets in every project of the "analytics" folder, now and in future projects. What is the least-privilege, lowest-effort grant?',
    options: ['BigQuery Data Owner on each project, granted to each engineer', 'BigQuery Admin on the analytics folder, granted to the team\'s group', 'Project Owner on the analytics folder, granted to the team\'s group', 'Editor on the organization, granted to the team\'s group'],
    answer: 1,
    explanation: 'A predefined BigQuery role on the folder, granted to the group, covers current and future projects in it. Per-project, per-person grants need upkeep, and Owner or Editor give far more than BigQuery.'
  },
  {
    id: 'pca-s-002',
    topic: 'IAM & resource hierarchy',
    difficulty: 'medium',
    prompt: 'A bank requires that the people who administer encryption keys can never use them to read customer data, and the people who read data can never change the keys. How should you design this?',
    options: [
      'A separate key project: KMS Admin for the security team, Encrypter/Decrypter only for service accounts',
      'Give one trusted platform group Owner on both the key project and every data project',
      'Keep keys and data in the same project, and rely on audit logs to spot any misuse',
      'Let each application team create, administer and use its own keys in its project',
    ],
    answer: 0,
    explanation: 'A separate key project with administration and use given to different principals enforces separation of duties. A single Owner group, co-located keys or self-managed keys per team all let the same people both manage and use the keys.'
  },
  {
    id: 'pca-s-003',
    topic: 'IAM & resource hierarchy',
    difficulty: 'easy',
    prompt: 'Production projects need stricter organization policies and fewer people with access than development projects. How should you structure the resource hierarchy?',
    options: ['Folders for production and non-production, with policies and IAM set on each folder', 'All projects directly under the organization, with policies set project by project', 'One project for everything, separated by labels', 'Separate organizations for production and development'],
    answer: 0,
    explanation: 'Environment folders let policies and access be set once and inherited by every project in them. Per-project settings drift, labels do not enforce anything, and separate organizations duplicate identity and governance.'
  },
  {
    id: 'pca-s-004',
    topic: 'IAM & resource hierarchy',
    difficulty: 'medium',
    prompt: 'An auditor found that a developer granted a role on a sensitive project to a personal Gmail account. How do you prevent any grant to identities outside the company\'s domain?',
    options: [
      'Set domain restricted sharing (`iam.allowedPolicyMemberDomains`) on the organization',
      'Remove the Project IAM Admin role from all developers in every production project',
      'Turn on Data Access audit logs for IAM so that new grants are recorded',
      'Create a custom developer role without the `setIamPolicy` permission',
    ],
    answer: 0,
    explanation: 'Domain restricted sharing makes IAM reject members outside the allowed Cloud Identity customers, whoever tries. Removing roles or custom roles limits who can grant, not to whom, and logs only record the grant afterwards.'
  },
  {
    id: 'pca-s-005',
    topic: 'IAM & resource hierarchy',
    difficulty: 'medium',
    prompt: 'On-call engineers occasionally need production admin rights during incidents. Standing admin access is not allowed, and every elevation must be approved, time-limited and audited. What should you use?',
    options: [
      'Privileged Access Manager entitlements with approval and a maximum grant duration',
      'Permanent Owner grants for on-call staff, removed by hand after each incident',
      'A shared break-glass account whose password is posted in the incident chat',
      'Service account keys with Owner rights handed out to engineers during incidents',
    ],
    answer: 0,
    explanation: 'Privileged Access Manager grants just-in-time, time-bound access with approval workflows and audit records. Permanent grants, shared accounts and handed-out keys all break least privilege and accountability.'
  },
  {
    id: 'pca-s-006',
    topic: 'IAM & resource hierarchy',
    difficulty: 'hard',
    prompt: 'Even project Owners must not be able to delete projects in the production folder, except a small platform group. Allow policies already grant Owner widely. What should you use?',
    options: [
      'An IAM deny policy on the production folder for project deletion, excepting the platform group',
      'A custom role like Owner but without the project delete permission, granted to owners',
      'An organization policy on the production folder that restricts resource locations',
      'Removing the Owner role from every project and granting Editor to former owners',
    ],
    answer: 0,
    explanation: 'Deny policies override allow policies for the listed permissions, so they block deletion whatever roles exist, and exceptions keep a controlled path. A custom role does not remove existing Owner grants, locations policies are unrelated, and removing Owner everywhere goes beyond the requirement.'
  },
  {
    id: 'pca-s-007',
    topic: 'IAM & resource hierarchy',
    difficulty: 'medium',
    prompt: 'Security wants to know every principal that can read a sensitive BigQuery dataset, including through group membership and inherited roles, across the organization. What should you use?',
    options: [
      'Policy Analyzer (Cloud Asset Inventory IAM policy analysis)',
      'The IAM permissions page of the dataset in the console',
      'VPC Flow Logs for the subnets that reach BigQuery',
      "Billing reports filtered to the BigQuery dataset's SKU",
    ],
    answer: 0,
    explanation: 'Policy Analyzer resolves inherited policies and group memberships to answer who can access a resource. The dataset page shows only direct grants, and flow logs and billing data do not describe access rights.'
  },

  // ── Data protection & keys ───────────────────────────────────────────────
  {
    id: 'pca-s-008',
    topic: 'Data protection & keys',
    difficulty: 'medium',
    prompt: 'Regulators require that encryption keys for customer data are held outside Google\'s infrastructure, in the company\'s own key management system, and that access can be cut off there. What should you use?',
    options: ['Cloud External Key Manager (Cloud EKM)', 'Default Google-managed encryption', 'Cloud KMS software keys with automatic rotation', 'Customer-supplied encryption keys on BigQuery'],
    answer: 0,
    explanation: 'Cloud EKM uses keys that stay in a supported external key manager, and revoking them there stops decryption. Default encryption and Cloud KMS keys live in Google, and customer-supplied keys work only with Cloud Storage and Compute Engine.'
  },
  {
    id: 'pca-s-009',
    topic: 'Data protection & keys',
    difficulty: 'medium',
    prompt: 'A payments company needs CMEK keys whose cryptographic operations happen in FIPS 140-2 Level 3 validated hardware, without operating any HSMs itself. What should you choose?',
    options: [
      'Cloud KMS keys with the HSM protection level (Cloud HSM)',
      'Software-protected keys in Cloud KMS with automatic rotation',
      'Secret Manager secrets holding the key material for each service',
      'Customer-supplied encryption keys sent with each API request',
    ],
    answer: 0,
    explanation: 'Cloud HSM keys are managed through Cloud KMS but live in FIPS 140-2 Level 3 HSMs run by Google. Software keys are not HSM-backed, Secret Manager stores secrets, not encryption keys, and customer-supplied keys are held by the customer.'
  },
  {
    id: 'pca-s-010',
    topic: 'Data protection & keys',
    difficulty: 'easy',
    prompt: 'Applications on Cloud Run and GKE use third-party API keys and database passwords that must be rotated regularly and never stored in code or images. What should you use?',
    options: [
      "Secret Manager with rotation schedules, read by each workload's own service account",
      'Environment variables committed to the repository and injected at deploy time',
      'A shared Cloud Storage bucket of text files that each workload reads at startup',
      'Kubernetes ConfigMaps in each namespace, updated by the platform team',
    ],
    answer: 0,
    explanation: 'Secret Manager stores versioned secrets, controls access per identity, audits reads and can schedule rotation notifications. Repositories, buckets and ConfigMaps are not designed for secrets.'
  },
  {
    id: 'pca-s-011',
    topic: 'Data protection & keys',
    difficulty: 'medium',
    prompt: 'A company does not know where personal data such as national ID numbers and phone numbers is stored across hundreds of BigQuery tables and buckets. What should it use first?',
    options: [
      'Sensitive Data Protection discovery to profile the data and find sensitive types',
      'VPC Service Controls around every project that might hold personal data',
      'Cloud Armor rules that detect personal data in requests to the applications',
      "Object versioning on every bucket so that each file's history can be reviewed",
    ],
    answer: 0,
    explanation: 'Sensitive Data Protection discovery scans and profiles data across BigQuery, Cloud Storage and more, reporting where sensitive data types live. The other controls protect or retain data but do not find it.'
  },
  {
    id: 'pca-s-012',
    topic: 'Data protection & keys',
    difficulty: 'hard',
    prompt: 'Analysts need to join customer records across tables by customer email, but must never see the real addresses. Which approach meets both needs?',
    options: [
      'Tokenise the emails deterministically with Sensitive Data Protection, so equal emails get equal tokens',
      'Delete the email column from every table and join the records on customer names instead',
      'Mask all but the first letter of each email with a random value generated per row',
      'Give analysts access to the tables only through a VPN from managed company laptops',
    ],
    answer: 0,
    explanation: 'Deterministic tokenisation hides the real value but keeps it consistent, so joins still work. Deleting the column breaks the joins, random masking breaks consistency, and a VPN does not hide the data.'
  },
  {
    id: 'pca-s-013',
    topic: 'Data protection & keys',
    difficulty: 'hard',
    prompt: 'A SaaS provider stores data for many tenants in shared databases. When a tenant leaves, contracts require that its data become unrecoverable quickly, including in backups. Which design supports this?',
    options: [
      "Encrypt each tenant's data with its own Cloud KMS key and destroy its key versions when it leaves",
      "Delete the tenant's rows from every table and wait for the backups to expire on their own",
      "Move the tenant's data to Archive storage in a separate locked bucket when it leaves",
      "Revoke all of the tenant's user accounts and API keys, leaving the stored data in place",
    ],
    answer: 0,
    explanation: 'With per-tenant keys, destroying the key versions makes every copy encrypted with them unreadable, backups included (crypto-shredding). Deleting rows leaves backups for their whole retention, archiving keeps the data, and revoking accounts leaves it readable.'
  },

  // ── Security controls ───────────────────────────────────────────────────
  {
    id: 'pca-s-014',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'Security fears that a stolen credential could be used to copy BigQuery data to a project outside the company. IAM is already least-privilege. What adds protection against this exfiltration?',
    options: [
      'A VPC Service Controls perimeter around the data projects',
      'More detailed Data Access audit logging on the datasets',
      'Cloud Armor rules in front of the BigQuery API endpoint',
      'A Cloud NAT gateway with a fixed egress IP for the analysts',
    ],
    answer: 0,
    explanation: 'VPC Service Controls block API calls that move data across the perimeter, even with valid credentials. Audit logs only record the copy, Cloud Armor protects load-balanced apps, and NAT is for VM egress.'
  },
  {
    id: 'pca-s-015',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'Administrators may use the Google Cloud console only from company-managed devices on the corporate network. Which control enforces this?',
    options: ['Context-aware access with Access Context Manager access levels', 'An organization policy restricting VM external IPs', 'A hierarchical firewall policy', 'Two-step verification only'],
    answer: 0,
    explanation: 'Access levels describe device and network conditions, and context-aware access applies them to console and API access. Firewall policies filter VM traffic, external-IP policies restrict VMs, and 2SV checks identity, not device or location.'
  },
  {
    id: 'pca-s-016',
    topic: 'Security controls',
    difficulty: 'easy',
    prompt: 'Regulators require a record of who read patient records in Cloud Storage and BigQuery, kept for six years and protected from tampering. What should you configure?',
    options: [
      'Data Access audit logs, routed by an aggregated sink to a bucket with locked retention',
      "Admin Activity audit logs only, kept in each project's default log bucket for six years",
      'VPC Flow Logs for every subnet, exported to BigQuery and kept for six years',
      'Billing export to BigQuery, which records each read of the patient data',
    ],
    answer: 0,
    explanation: 'Reads are Data Access events, which must be turned on, and a locked retention policy keeps the copies tamper-proof for six years. Admin Activity logs cover configuration changes, flow logs show traffic, and billing data shows cost.'
  },
  {
    id: 'pca-s-017',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'A security team wants one place to find misconfigurations, vulnerabilities and active threats across all projects in the organization, with prioritised findings. What should it use?',
    options: ['Security Command Center', 'Cloud Monitoring dashboards', 'Cloud Asset Inventory exports only', 'Error Reporting'],
    answer: 0,
    explanation: 'Security Command Center aggregates misconfigurations, vulnerabilities and threat detections across the organization. Monitoring and Error Reporting watch application health, and Asset Inventory lists resources without assessing risk.'
  },
  {
    id: 'pca-s-018',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'You are about to add 40 existing projects to a VPC Service Controls perimeter and fear breaking production integrations. What should you do first?',
    options: [
      'Run the perimeter in dry-run mode and review the violations it logs',
      'Enforce the perimeter directly and fix whatever breaks afterwards',
      'Add one project per day to the perimeter in enforced mode',
      'Disable audit logging while the perimeter change is rolled out',
    ],
    answer: 0,
    explanation: 'Dry-run mode logs what would be blocked without blocking it, so you can add access levels or ingress and egress rules before enforcing. Enforcing blind causes outages, and turning off logs hides the evidence you need.'
  },
  {
    id: 'pca-s-019',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'A bank wants to approve explicitly any access by Google personnel to its data before it happens, and to see logs of such access. What should it enable?',
    options: [
      'Access Approval together with Access Transparency',
      'Data Access audit logs for every Google service',
      'VPC Service Controls around all of its projects',
      'Context-aware access for all Google support staff',
    ],
    answer: 0,
    explanation: 'Access Transparency logs Google personnel actions on your content, and Access Approval requires your explicit approval first. The other controls govern your own users and services.'
  },
  {
    id: 'pca-s-020',
    topic: 'Security controls',
    difficulty: 'medium',
    prompt: 'A healthcare analytics workload must keep data encrypted even while it is being processed in memory on the VM. What should you use?',
    options: ['Confidential VMs', 'Shielded VMs only', 'Customer-supplied encryption keys on the boot disk', 'Sole-tenant nodes'],
    answer: 0,
    explanation: 'Confidential VMs encrypt memory while data is in use. Shielded VMs protect the boot chain, disk keys protect data at rest, and sole-tenancy isolates hardware without encrypting memory.'
  },
  {
    id: 'pca-s-021',
    topic: 'Security controls',
    difficulty: 'easy',
    prompt: 'No Cloud SQL instance anywhere in the organization may have a public IP address. What is the most reliable control?',
    options: ['The `sql.restrictPublicIp` organization policy', 'A note in the architecture standards', 'A firewall rule denying port 3306', 'A weekly script that removes public IPs'],
    answer: 0,
    explanation: 'The organization policy stops public IPs being configured at all. Standards rely on people, firewall rules do not govern Cloud SQL public endpoints, and scripts react only after the exposure.'
  },

  // ── Secure access ───────────────────────────────────────────────────────
  {
    id: 'pca-s-022',
    topic: 'Secure access',
    difficulty: 'easy',
    prompt: 'Employees must reach an internal web application running on GKE from anywhere, without a VPN, signing in with their corporate identity. What should you use?',
    options: [
      "Identity-Aware Proxy in front of the application's load balancer",
      'A public load balancer with no authentication, but an obscure URL',
      'A bastion host that employees reach through personal SSH tunnels',
      'Cloud NAT with fixed IP addresses that employees connect through',
    ],
    answer: 0,
    explanation: 'IAP authenticates and authorises each request with the user\'s identity (and context, if configured) before it reaches the app. An open load balancer exposes it, bastions are VPN-like and clumsy, and NAT is outbound only.'
  },
  {
    id: 'pca-s-023',
    topic: 'Secure access',
    difficulty: 'medium',
    prompt: 'A GitHub Actions pipeline deploys to Google Cloud using a downloaded service account key stored as a repository secret. Security wants no long-lived keys. What should you implement?',
    options: [
      'Workload Identity Federation with a GitHub OIDC provider limited to the repository',
      'Keep the key as a repository secret but rotate it automatically every 90 days',
      'Store the key in Secret Manager and have the pipeline download it at each run',
      "Use a senior engineer's user credentials in the pipeline instead of a key",
    ],
    answer: 0,
    explanation: 'Workload Identity Federation exchanges GitHub\'s OIDC tokens for short-lived Google credentials, so no key exists. Rotation and Secret Manager still rely on a key, and user credentials break accountability.'
  },
  {
    id: 'pca-s-024',
    topic: 'Secure access',
    difficulty: 'medium',
    prompt: 'Platform engineers should run Terraform with the permissions of a deployment service account, never with their own broad rights, and audit logs must show who ran it. What should you configure?',
    options: [
      'Give engineers Token Creator on the deployment account and have Terraform impersonate it',
      "Download a key for the deployment account to each engineer's laptop, rotated monthly",
      'Grant every engineer Owner on the projects so Terraform never lacks permissions',
      'Share one user account for all Terraform runs, with its password in Secret Manager',
    ],
    answer: 0,
    explanation: 'Impersonation gives short-lived tokens for the deployment account, and the logs record both the engineer and the account. Keys leak, Owner is excessive, and shared accounts lose accountability.'
  },
  {
    id: 'pca-s-025',
    topic: 'Secure access',
    difficulty: 'medium',
    prompt: 'Contractors use their own unmanaged laptops to reach several internal web applications. The company wants zero-trust access decisions and protection against copying or downloading sensitive data in the browser. What should you use?',
    options: ['Chrome Enterprise Premium', 'A site-to-site VPN for each contractor', 'Cloud Armor', 'VPC Network Peering'],
    answer: 0,
    explanation: 'Chrome Enterprise Premium (formerly BeyondCorp Enterprise) applies context-aware, zero-trust access to apps and adds data-loss protections in the browser. VPNs grant network-level access, Cloud Armor protects against web attacks, and peering joins networks.'
  },
  {
    id: 'pca-s-026',
    topic: 'Secure access',
    difficulty: 'easy',
    prompt: 'Administrators need SSH access to VMs that have no external IP addresses, without a bastion host or VPN. What should you configure?',
    options: [
      'IAP TCP forwarding, allowing 35.235.240.0/20 and granting the admins IAP-secured Tunnel User',
      'Temporary external IPs on the VMs during maintenance windows, removed afterwards',
      'Cloud NAT configured to forward inbound SSH connections to the private VMs',
      "VPC Network Peering between the VPC and a network on the admins' laptops",
    ],
    answer: 0,
    explanation: 'IAP tunnels SSH through Google using the admin\'s identity, so the VMs need no public address. Temporary external IPs expose the VMs, NAT does not accept inbound connections, and laptops cannot be peered.'
  },

  // ── Supply chain & AI security ──────────────────────────────────────────
  {
    id: 'pca-s-027',
    topic: 'Supply chain & AI security',
    difficulty: 'medium',
    prompt: 'Only container images built by the company\'s CI pipeline and approved by security may run on production GKE clusters. What enforces this at deploy time?',
    options: [
      'Binary Authorization with a policy requiring attestations',
      'Artifact Registry cleanup policies for unapproved images',
      'A naming convention that marks approved images in their tags',
      'A firewall rule on the cluster nodes blocking other registries',
    ],
    answer: 0,
    explanation: 'Binary Authorization admits only images with the required attestations, such as signatures from the build pipeline and security review. Cleanup policies delete old images, naming conventions are not enforced, and firewalls do not check images.'
  },
  {
    id: 'pca-s-028',
    topic: 'Supply chain & AI security',
    difficulty: 'easy',
    prompt: 'The security team wants every container image pushed to Artifact Registry checked for known vulnerabilities in its OS packages and language dependencies. What should you enable?',
    options: ['Artifact Analysis vulnerability scanning', 'Cloud Armor preconfigured WAF rules', 'VPC Flow Logs', 'Uptime checks'],
    answer: 0,
    explanation: 'Artifact Analysis scans images in Artifact Registry and reports vulnerabilities, which policies can then act on. The other services work on traffic or availability, not image contents.'
  },
  {
    id: 'pca-s-029',
    topic: 'Supply chain & AI security',
    difficulty: 'hard',
    prompt: 'Auditors ask how the company can prove that a container running in production was built from a specific commit by its trusted build system, untampered. What should the pipeline produce and check?',
    options: [
      'Signed SLSA provenance from Cloud Build, verified (e.g. by Binary Authorization) before deploy',
      'A screenshot of the build log, attached to the change ticket for every release',
      'The image tag `latest` on every release, plus the commit message in the image label',
      'A spreadsheet of commit hashes and image names kept up to date by the release manager',
    ],
    answer: 0,
    explanation: 'Signed provenance links the image digest to its source and build process and can be verified automatically before deploy. Screenshots, mutable tags and manual spreadsheets prove nothing reliably.'
  },
  {
    id: 'pca-s-030',
    topic: 'Supply chain & AI security',
    difficulty: 'medium',
    prompt: 'A customer-facing chatbot built on Gemini must detect and block prompt-injection and jailbreak attempts, and stop personal data from appearing in responses. What should you add?',
    options: [
      'Model Armor screening of prompts and responses, with Sensitive Data Protection templates',
      'Cloud Armor rate limiting and geographic blocking in front of the chatbot endpoint',
      'A larger Gemini model with a longer context window and a stricter system prompt',
      'VPC Flow Logs on the chatbot subnet, with alerts on unusual traffic volumes',
    ],
    answer: 0,
    explanation: 'Model Armor screens prompts and responses for prompt injection, jailbreaks, harmful content and sensitive data, using Sensitive Data Protection for the latter. Rate limiting and flow logs do not inspect content, and a bigger model is not a safeguard.'
  },
  {
    id: 'pca-s-031',
    topic: 'Supply chain & AI security',
    difficulty: 'hard',
    prompt: 'A model trained on confidential data will be served from Gemini Enterprise Agent Platform. Which set of measures best secures the deployment?',
    options: [
      'A private endpoint, a VPC Service Controls perimeter, and a least-privilege service account',
      "A public endpoint protected by an API key embedded in the company's mobile app",
      'A private endpoint, but with the serving service account granted Editor so it never fails',
      'Serving the model from a notebook instance on a public IP behind a firewall rule',
    ],
    answer: 0,
    explanation: 'Private networking, a service perimeter and a narrowly scoped identity reduce exposure and exfiltration risk. Embedded API keys leak, Editor violates least privilege, and a notebook on a public IP is not a secure serving platform.'
  },

  // ── Compliance ──────────────────────────────────────────────────────────
  {
    id: 'pca-s-032',
    topic: 'Compliance',
    difficulty: 'easy',
    prompt: 'A US clinic will store protected health information in Google Cloud. What must be in place before any PHI is uploaded?',
    options: [
      'A Business Associate Agreement with Google, and only HIPAA-covered services, properly configured',
      "A SOC 2 Type II report on the clinic's own processes, shared with Google before upload",
      'All data stored only in the `US` multi-region, which is HIPAA-certified by default',
      'Customer-supplied encryption keys configured on every service that will hold PHI',
    ],
    answer: 0,
    explanation: 'Under HIPAA, Google acts as a business associate, so a BAA is required, and only covered products may hold PHI, configured under the shared responsibility model. The other items may help but do not satisfy HIPAA on their own.'
  },
  {
    id: 'pca-s-033',
    topic: 'Compliance',
    difficulty: 'medium',
    prompt: 'An online shop wants to reduce the scope of its PCI DSS assessment. Which design helps most?',
    options: [
      'Isolate the cardholder environment in its own projects and network, and tokenise card numbers',
      "Store full card numbers in every microservice's own database so that lookups are fast",
      'Give all developers access to the payment project so that urgent fixes are quick',
      'Keep card numbers in the application logs so that support can troubleshoot payments',
    ],
    answer: 0,
    explanation: 'Segmentation plus tokenisation keeps card data out of most systems, shrinking what must be assessed. Spreading card numbers, broad access and logging card data all widen the scope and the risk.'
  },
  {
    id: 'pca-s-034',
    topic: 'Compliance',
    difficulty: 'medium',
    prompt: 'A European bank must keep customer data in EU regions and limit Google support access to EU personnel, with controls applied consistently to a set of projects. What should you use?',
    options: [
      'Assured Workloads with an EU control package, plus a resource locations policy',
      'A naming convention and labels that mark the EU projects for auditors',
      'Cloud CDN configured to cache content only in EU edge locations',
      'Spanner in a `nam` multi-region configuration with CMEK for every database',
    ],
    answer: 0,
    explanation: 'Assured Workloads applies data residency and personnel access controls to a folder of projects, and the locations policy blocks resources elsewhere. Naming conventions enforce nothing, and CDN caching and a North American Spanner configuration do not keep data in the EU.'
  },
  {
    id: 'pca-s-035',
    topic: 'Compliance',
    difficulty: 'medium',
    prompt: 'An education app collects data from children under 13 in the United States. Which architectural principle best supports compliance with children\'s privacy law?',
    options: [
      'Collect only what is needed, record verifiable parental consent, and limit retention',
      'Collect everything now, in case the data is useful for future AI features later',
      "Store children's data together with adults' data to keep the analytics simple",
      "Rely on the app store's privacy policy rather than building the app's own controls",
    ],
    answer: 0,
    explanation: 'Children\'s privacy rules centre on data minimisation, parental consent and deletion, which the architecture must support. Collecting extra data, mixing it with adult data or relying on someone else\'s policy all increase risk.'
  },
  {
    id: 'pca-s-036',
    topic: 'Compliance',
    difficulty: 'easy',
    prompt: 'A customer\'s procurement team asks for Google Cloud\'s SOC 2 report before signing. Where should you direct them?',
    options: [
      "Compliance Reports Manager, which provides Google Cloud's audit reports",
      'The Google Cloud status dashboard, with its full incident history',
      "Cloud Monitoring dashboards showing the platform's availability",
      "A screenshot of the project's IAM page and its audit log settings",
    ],
    answer: 0,
    explanation: 'Compliance Reports Manager is where Google publishes certifications and audit reports such as SOC 2. The status dashboard shows incidents, Monitoring shows your metrics, and IAM screenshots are not attestations.'
  },
  {
    id: 'pca-s-037',
    topic: 'Compliance',
    difficulty: 'medium',
    prompt: 'Which statement about compliance on Google Cloud is correct?',
    options: [
      'Google certifies its platform; the customer stays responsible for compliant configuration and use',
      'Using a certified service makes any application built on it compliant automatically',
      "Compliance becomes entirely Google's responsibility once the data is in the cloud",
      "Google's certifications apply only to customers who have bought Premium Support",
    ],
    answer: 0,
    explanation: 'Under the shared responsibility model, Google\'s certifications cover its part, and customers must configure and operate their workloads compliantly. The other statements misplace responsibility.'
  },
  {
    id: 'pca-s-038',
    topic: 'Compliance',
    difficulty: 'hard',
    prompt: 'Under GDPR, a customer asks a retailer to delete all their personal data. The data sits in Cloud SQL, BigQuery tables and Cloud Storage exports, plus backups. What should the design provide?',
    options: [
      'A data map and deletion process covering every store, with bounded backup retention or crypto-shredding',
      "Deleting the customer's row in Cloud SQL, which is the system of record for customers",
      "Keeping the data for analytics but removing the customer's login and marketing consent",
      "Copying the customer's data to a separate locked bucket before deleting it elsewhere",
    ],
    answer: 0,
    explanation: 'Erasure needs knowing where the data lives and a repeatable process covering every copy, with bounded backup retention or crypto-shredding where needed. Deleting in one place, disabling the login or copying the data elsewhere do not erase it.'
  },
  {
    id: 'pca-s-039',
    topic: 'Compliance',
    difficulty: 'medium',
    prompt: 'Internal audit requires that logs from every project be retained for seven years in one place and that nobody, including project owners, can stop the collection. What should you configure?',
    options: [
      'An organization-level aggregated sink to a locked-retention bucket in a logging project',
      "A log sink in each project, created and maintained by that project's owner",
      'The `_Default` log bucket in each project, with its retention set to seven years',
      "Daily manual exports of each project's logs by its team to a shared bucket",
    ],
    answer: 0,
    explanation: 'An organization-level aggregated sink captures every project, project owners cannot remove it, and a locked retention policy protects the stored logs. Per-project sinks and buckets can be changed by project owners, and manual exports are unreliable.'
  }
];
