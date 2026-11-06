import type { Question } from '@/types';

/**
 * Section 5 — Managing implementation (~12.5%). Advising development and
 * operations teams (deployment, API management, testing, migration tooling,
 * Gemini Cloud Assist) and working with Google Cloud programmatically.
 */
export const implementation: Question[] = [
  // ── Deployment & API management ──────────────────────────────────────────
  {
    id: 'pca-i-001',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'A bank wants to publish APIs to fintech partners, with a self-service developer portal, API keys per app, usage-based billing of partners, and analytics. What should it use?',
    options: ['Apigee with an integrated developer portal and monetization', 'API Gateway with a static website', 'A global external Application Load Balancer with Cloud Armor', 'Cloud Endpoints on a single VM'],
    answer: 0,
    explanation: 'Apigee provides full API management: developer portal, app credentials, quotas, monetization and analytics. API Gateway is lighter and has no monetization, and a load balancer or a single proxy VM does not manage APIs.'
  },
  {
    id: 'pca-i-002',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'Partners integrate with a public orders API. The team must make a breaking change to the response format. What is the best practice?',
    options: [
      'Release it as `/v2`, keep `/v1` running through a published deprecation period, and guide partners to migrate',
      'Change `/v1` in place during a quiet weekend, so that every partner picks up the new format at once',
      'Add a request header that selects the new format on `/v1`, and make it the default without notice',
      "Remove the old format from `/v1` after one week's notice, so that partners are pushed to upgrade",
    ],
    answer: 0,
    explanation: 'Versioning with a published deprecation period lets partners move on their own schedule without breaking. Changing `/v1` in place, switching its default format without notice or removing the old format after a week all break integrations.'
  },
  {
    id: 'pca-i-003',
    topic: 'Deployment & API management',
    difficulty: 'easy',
    prompt: 'One partner\'s buggy client occasionally sends thousands of requests per second and overloads the backend for everyone. What should the API layer apply?',
    options: [
      'Per-app quotas and spike arrest in Apigee',
      'Larger backend VMs to absorb any burst',
      'A longer request timeout on the backend',
      'Cloud CDN caching for every API response',
    ],
    answer: 0,
    explanation: "Quotas and spike arrest cap each consumer's traffic, protecting the backend and the other partners. Bigger VMs or longer timeouts only delay the problem, and a CDN cannot absorb a flood of uncacheable API calls from one client."
  },
  {
    id: 'pca-i-004',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'A small team exposes three Cloud Run services to its own mobile app and needs API keys and simple authentication, with minimal cost and setup. Full API management features are not needed. What fits?',
    options: ['API Gateway in front of the Cloud Run services', 'Apigee with monetization', 'A GKE cluster running an open-source API manager', 'Separate load balancers for each service'],
    answer: 0,
    explanation: 'API Gateway is a fully managed, lightweight gateway for serverless backends with API keys and authentication. Apigee and a self-run API manager are heavier than needed, and separate load balancers add cost without API management.'
  },
  {
    id: 'pca-i-005',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'Users see errors whenever GKE nodes are upgraded or Pods are rescheduled. Which two changes should you advise the development team to make? (Choose two.)',
    options: [
      'Readiness probes and graceful shutdown on SIGTERM, so Pods take and finish traffic cleanly',
      'PodDisruptionBudgets and several replicas, so upgrades never take down every Pod at once',
      'A single replica per service, so that no two Pods conflict while nodes are being upgraded',
      'Automatic node upgrades turned off permanently, with upgrades done by hand once a year',
      'Longer DNS TTLs for the services, so that clients keep using a Pod after it has moved',
    ],
    answer: [0, 1],
    explanation: 'Readiness probes keep traffic away from Pods that are not ready, graceful shutdown finishes in-flight requests, and PodDisruptionBudgets with enough replicas keep the service up during voluntary disruptions such as upgrades. One replica, frozen upgrades or DNS changes do not fix disruption handling.'
  },
  {
    id: 'pca-i-006',
    topic: 'Deployment & API management',
    difficulty: 'easy',
    prompt: 'A developer\'s Cloud Run deployment fails with an unclear error, and the team would like AI help to investigate the logs, recent changes and configuration in plain language. What should they use?',
    options: [
      'Gemini Cloud Assist, starting an investigation from the error',
      "Cloud Asset Inventory exports of the project's resources",
      "Billing reports filtered to the Cloud Run service's SKUs",
      'Personalized Service Health alerts for the region',
    ],
    answer: 0,
    explanation: 'Gemini Cloud Assist can analyse logs, configuration and recent changes and suggest likely causes and fixes in plain language. The other tools inventory resources, show cost or report Google incidents.'
  },
  {
    id: 'pca-i-007',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'Teams build a separate container image for each environment, and bugs appear in production that never showed in staging. What should you advise?',
    options: [
      'Build one immutable image per release and promote it through every environment, adding config at deploy time',
      'Rebuild the image in the production pipeline with production settings, so it always matches production',
      'Skip staging and test only in production behind feature flags, since staging never matches it',
      'Use the `latest` tag in every environment so that all of them always run the newest image',
    ],
    answer: 0,
    explanation: 'Promoting the same tested artifact, with configuration kept separate, removes differences between environments. Rebuilding introduces new variables, testing only in production is risky, and `latest` is a moving target.'
  },
  {
    id: 'pca-i-008',
    topic: 'Deployment & API management',
    difficulty: 'medium',
    prompt: 'Developers want to experiment freely without affecting production, and auditors want strong isolation between environments. How should environments be laid out in Google Cloud?',
    options: [
      'Separate projects per environment (dev, staging, prod), under environment folders with their own policies',
      "One shared project, with labels marking each resource's environment and IAM conditions on them",
      'One VPC subnet per environment inside the production project, with firewall rules between them',
      'Separate GKE namespaces for dev and staging inside the production cluster, with network policies',
    ],
    answer: 0,
    explanation: 'Projects are the isolation boundary for IAM, quotas, billing and policies, and folders apply environment-wide controls. Labels, subnets and namespaces inside production do not isolate access or blast radius.'
  },

  // ── Testing & migration tooling ──────────────────────────────────────────
  {
    id: 'pca-i-009',
    topic: 'Testing & migration tooling',
    difficulty: 'medium',
    prompt: 'A team needs to simulate 200,000 concurrent users against a new API before launch. How should it generate the load?',
    options: [
      'Run a distributed load-testing tool (such as Locust) on GKE, scaling the workers to reach the target',
      'Run a load script from one developer laptop, increasing its thread count until it hits the target',
      'Ask employees across all offices to use the new API at the same time on a chosen morning',
      'Skip load tests and watch how autoscaling copes with the real production traffic on launch day',
    ],
    answer: 0,
    explanation: 'A distributed tool on GKE can scale workers to the required load and repeat tests. A laptop cannot generate that load, staff refreshes are not measurable, and launch day is too late.'
  },
  {
    id: 'pca-i-010',
    topic: 'Testing & migration tooling',
    difficulty: 'easy',
    prompt: 'Developers want to run integration tests for code that publishes to Pub/Sub and reads from Spanner on every pull request, without creating cloud resources or paying for them. What should they use?',
    options: [
      'The Pub/Sub and Spanner emulators in the CI pipeline',
      'A shared production Spanner instance and topic for CI',
      'Mocks of both clients that always return success',
      'Manual tests in the console before each merge',
    ],
    answer: 0,
    explanation: 'Emulators reproduce the services locally, so tests run fast, isolated and at no cost. Using production is risky, mocks that always succeed test nothing, and manual tests do not scale.'
  },
  {
    id: 'pca-i-011',
    topic: 'Testing & migration tooling',
    difficulty: 'medium',
    prompt: 'A company is moving its Teradata data warehouse to BigQuery and has thousands of SQL scripts. Which tooling reduces the effort most?',
    options: [
      'BigQuery Migration Service, with batch SQL translation and data transfer',
      'Rewriting all of the scripts by hand, team by team, in GoogleSQL',
      'Running Teradata on Compute Engine VMs and querying it from BigQuery',
      'Database Migration Service, which converts the warehouse to Cloud SQL',
    ],
    answer: 0,
    explanation: 'BigQuery Migration Service translates SQL dialects in bulk and helps move schemas and data. Manual rewrites are slow, rehosting Teradata keeps the old platform, and DMS targets operational databases.'
  },
  {
    id: 'pca-i-012',
    topic: 'Testing & migration tooling',
    difficulty: 'easy',
    prompt: 'A company must copy 300 TB from Amazon S3 to Cloud Storage and then keep the buckets in sync daily for a month. What should it use?',
    options: ['Storage Transfer Service', 'Transfer Appliance', 'Downloading to laptops and uploading again', 'Database Migration Service'],
    answer: 0,
    explanation: 'Storage Transfer Service moves data directly from S3 and can run recurring sync jobs. Transfer Appliance is for data on-premises with slow links, laptops are impractical, and DMS moves databases.'
  },
  {
    id: 'pca-i-013',
    topic: 'Testing & migration tooling',
    difficulty: 'medium',
    prompt: 'A team wants to move several Java and Tomcat applications from VMs into containers on GKE with as little manual rework as possible. What should it use?',
    options: ['Migrate to Containers', 'Migrate to Virtual Machines', 'Transfer Appliance', 'Cloud Deploy'],
    answer: 0,
    explanation: 'Migrate to Containers analyses workloads on VMs and generates container artifacts for GKE or Cloud Run. Migrate to Virtual Machines keeps them as VMs, Transfer Appliance moves data, and Cloud Deploy releases already-containerised apps.'
  },
  {
    id: 'pca-i-014',
    topic: 'Testing & migration tooling',
    difficulty: 'hard',
    prompt: 'An Oracle database must move to AlloyDB for PostgreSQL. Stored procedures and schema objects need converting, and downtime must be short. What should you use?',
    options: [
      'Database Migration Service with a conversion workspace for schema and code, then continuous migration',
      'Export every table to CSV files and import them into AlloyDB during a planned weekend outage',
      'Run Oracle on Compute Engine permanently, so that the procedures do not need converting',
      'Storage Transfer Service to copy the database files, then convert the schema by hand afterwards',
    ],
    answer: 0,
    explanation: 'DMS conversion workspaces convert Oracle schemas and code (with AI-assisted help), and continuous migration keeps downtime short. CSV exports lose code and need long outages, rehosting Oracle avoids the goal, and copying data files is not a migration.'
  },

  // ── Programmatic access ──────────────────────────────────────────────────
  {
    id: 'pca-i-015',
    topic: 'Programmatic access',
    difficulty: 'easy',
    prompt: 'An application on Cloud Run must read and write objects in Cloud Storage. How should it authenticate and call the API?',
    options: [
      'Use the Cloud Storage client library with Application Default Credentials from the attached service account',
      'Embed a service account key file in the container image and point the client library at it',
      "Call the REST API with a developer's personal OAuth access token stored as an environment variable",
      'Make the bucket public so that the service can read and write objects without any authentication',
    ],
    answer: 0,
    explanation: 'Client libraries pick up the attached service account through ADC, with no keys to manage. Embedded keys leak, user tokens are wrong for services, and public buckets expose the data.'
  },
  {
    id: 'pca-i-016',
    topic: 'Programmatic access',
    difficulty: 'medium',
    prompt: 'A batch job calling a Google API occasionally receives HTTP 429 and 503 errors during busy periods. What is the recommended handling?',
    options: [
      'Retry with exponential backoff and jitter (client libraries do this for retryable errors)',
      'Retry immediately in a tight loop until each call succeeds, so that no time is lost',
      'Treat every error as fatal, stop the job, and rerun the whole batch the next night',
      "Switch the job to a different region's endpoint every time an error is returned",
    ],
    answer: 0,
    explanation: 'Exponential backoff with jitter spreads retries out so the service can recover and quota windows reset. Tight loops make overload worse, failing on transient errors is fragile, and region-hopping is not a retry strategy.'
  },
  {
    id: 'pca-i-017',
    topic: 'Programmatic access',
    difficulty: 'easy',
    prompt: 'Developers want to write, run and debug Kubernetes and Cloud Run applications from their usual IDE, with YAML help and one-click deploys. What should they use?',
    options: ['Cloud Code in the IDE (or in Cloud Shell Editor)', 'The Cloud console only', 'A text editor and manual `kubectl` commands', 'Cloud Scheduler'],
    answer: 0,
    explanation: 'Cloud Code adds Kubernetes and Cloud Run tooling, YAML assistance and deploy and debug workflows to VS Code, JetBrains IDEs and Cloud Shell Editor. The console and manual commands are slower, and Scheduler is unrelated.'
  },
  {
    id: 'pca-i-018',
    topic: 'Programmatic access',
    difficulty: 'medium',
    prompt: 'A script must list the names of all running VMs in a project and feed them to another tool. Which gcloud usage is most reliable for automation?',
    options: [
      '`gcloud compute instances list --filter="status=RUNNING" --format="value(name)"`',
      'Parse the default table output of `gcloud compute instances list` with `cut`',
      "Copy the names from the console's VM instances page into a text file",
      '`gcloud compute instances describe` for each VM name typed in by hand',
    ],
    answer: 0,
    explanation: 'Server-side `--filter` and a machine-readable `--format` give stable output for scripts. Parsing human-oriented tables breaks easily, and manual steps are not automation.'
  },
  {
    id: 'pca-i-019',
    topic: 'Programmatic access',
    difficulty: 'easy',
    prompt: 'Which tool should new scripts use to copy and synchronise objects in Cloud Storage?',
    options: ['`gcloud storage`', '`gsutil`, because it is the only option', '`bq`', '`kubectl`'],
    answer: 0,
    explanation: '`gcloud storage` is the current, faster CLI for Cloud Storage; `gsutil` still works but is legacy. `bq` is for BigQuery and `kubectl` for Kubernetes.'
  },
  {
    id: 'pca-i-020',
    topic: 'Programmatic access',
    difficulty: 'medium',
    prompt: 'A provisioning script calls an API that returns a long-running operation, and the next step sometimes fails because the resource is not ready yet. What should the script do?',
    options: [
      'Wait on (poll) the returned operation until it reports done, then continue',
      'Sleep a fixed ten seconds after every call before starting the next step',
      'Ignore the operation and keep retrying the next step until it succeeds',
      'Run all of the steps in parallel so that the slow ones finish sooner',
    ],
    answer: 0,
    explanation: 'Long-running operations report their own completion, so waiting on them makes the script correct and as fast as possible. Fixed sleeps are either too short or wasteful, and endless retries or parallel steps make it fragile.'
  },
  {
    id: 'pca-i-021',
    topic: 'Programmatic access',
    difficulty: 'medium',
    prompt: 'A nightly job loads 500 CSV files from Cloud Storage into a BigQuery table and must be easy to script and schedule. What is the simplest approach?',
    options: [
      'A `bq load` command (or a client-library load job) with a wildcard URI',
      'Streaming inserts from a VM that reads each file row by row each night',
      'Loading the files into Cloud SQL first, then exporting them to BigQuery',
      "Importing each file through the console's create-table page by hand",
    ],
    answer: 0,
    explanation: 'Load jobs from Cloud Storage are free, scale well and accept wildcards, so one command loads all the files. Streaming row by row costs more, Cloud SQL is a detour, and console imports are manual.'
  },
  {
    id: 'pca-i-022',
    topic: 'Programmatic access',
    difficulty: 'medium',
    prompt: 'Engineers need a browser-based shell with gcloud, kubectl and Terraform already installed, and a lightweight editor, without installing anything locally. What should they use?',
    options: ['Cloud Shell with Cloud Shell Editor', 'A new Compute Engine VM per engineer', 'Cloud Workstations for every quick command', 'The Cloud console only'],
    answer: 0,
    explanation: 'Cloud Shell gives an authenticated terminal with the common tools and an editor in the browser. A VM per engineer or full Cloud Workstations are heavier than needed for quick tasks, and the console has no shell.'
  },

  // ── Infrastructure as code ─────────────────────────────────────────────────
  {
    id: 'pca-i-023',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Several teams write Terraform for similar network and project setups, and their state files live on laptops. Which two practices should the architect standardise? (Choose two.)',
    options: [
      'Shared, versioned Terraform modules for the common network and project patterns',
      'Remote state in a Cloud Storage backend, with object versioning and state locking',
      'Each team keeps its own copies of the code, with state files backed up from laptops',
      'State files committed to the Git repository next to the code, so changes are reviewed',
      'One engineer runs all Terraform for the company, so that the state stays in one place',
    ],
    answer: [0, 1],
    explanation: 'Modules make the patterns reusable and consistent, and a remote Cloud Storage backend keeps state shared, versioned and locked against concurrent runs. Local or committed state leads to conflicts and secrets in Git, and one person is a bottleneck.'
  },
  {
    id: 'pca-i-024',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A company wants Terraform deployments run as a managed Google Cloud service, with previews, state handled for it and deployment history, instead of maintaining its own runners. What should it use?',
    options: ['Infrastructure Manager', 'Deployment Manager', 'Cloud Scheduler running `terraform apply` on a VM', 'Config Connector only'],
    answer: 0,
    explanation: 'Infrastructure Manager runs Terraform for you, with previews, managed state and history. Deployment Manager has reached end of support, a scheduled VM is self-managed, and Config Connector uses Kubernetes resources instead of Terraform.'
  },
  {
    id: 'pca-i-025',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Dozens of resources were created by hand in the console before the team adopted Terraform. They must now be managed as code without recreating them. What should the team do?',
    options: [
      'Write the matching configuration and bring the resources into state with `terraform import` or import blocks',
      'Delete the resources and recreate them from new Terraform code during a planned maintenance window',
      'Leave the existing resources unmanaged and use Terraform only for resources created from now on',
      'Copy a state file from another project that has similar resources and edit the IDs in it',
    ],
    answer: 0,
    explanation: 'Importing attaches existing resources to Terraform state, so they are managed without downtime. Recreating causes outages, leaving them unmanaged keeps the drift, and another project\'s state is wrong.'
  },
  {
    id: 'pca-i-026',
    topic: 'Infrastructure as code',
    difficulty: 'hard',
    prompt: 'Operators sometimes change production settings in the console during incidents, and the Terraform code silently drifts from reality. What should the team put in place?',
    options: [
      'A scheduled `terraform plan` against production that alerts on drift, plus a rule to back-port emergency fixes to code',
      'Disable all console access permanently, including during incidents, so that no change bypasses code',
      'An hourly `terraform apply -auto-approve`, which silently reverts every manual change made in the console',
      'Delete the state file each quarter and re-import every resource, so that the code catches up with reality',
    ],
    answer: 0,
    explanation: 'Regular plans detect drift, and back-porting emergency changes keeps code the source of truth. Blocking all console access hurts incident response, hourly auto-apply can revert emergency fixes blindly, and deleting state loses track of resources.'
  },
  {
    id: 'pca-i-027',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A platform team already manages everything through Kubernetes manifests and GitOps, and wants to declare Cloud SQL instances and buckets the same way. What should it use?',
    options: ['Config Connector', 'Terraform run by hand from laptops', 'Deployment Manager templates', 'gcloud commands in a README'],
    answer: 0,
    explanation: 'Config Connector manages Google Cloud resources as Kubernetes objects, reconciled continuously, which fits a GitOps workflow. Manual Terraform and README commands are not GitOps, and Deployment Manager is retired.'
  }
];
