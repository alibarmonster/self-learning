import type { Question } from '@/types';

/**
 * Section 4 — Analyzing and optimizing technical and business processes
 * (~15%). Delivery lifecycle and CI/CD, troubleshooting and testing, disaster
 * recovery as a process, stakeholders and change, and cost optimisation.
 */
export const processes: Question[] = [
  // ── SDLC & CI/CD ───────────────────────────────────────────────────────────
  {
    id: 'pca-o-001',
    topic: 'SDLC & CI/CD',
    difficulty: 'easy',
    prompt: 'A team wants a managed pipeline that builds container images on every commit, stores them, and promotes releases from staging to production on GKE with an approval step. Which combination fits?',
    options: ['Cloud Build, Artifact Registry and Cloud Deploy', 'Cloud Scheduler, Cloud Storage and Compute Engine', 'Cloud Run functions, Firestore and Pub/Sub', 'Dataflow, BigQuery and Looker'],
    answer: 0,
    explanation: 'Cloud Build runs the CI steps, Artifact Registry stores the images, and Cloud Deploy manages promotion between targets with approvals. The other combinations are not delivery tools.'
  },
  {
    id: 'pca-o-002',
    topic: 'SDLC & CI/CD',
    difficulty: 'medium',
    prompt: 'Releases happen once a quarter, bundle hundreds of changes, and often fail. Which change to the development process lowers the change failure rate most?',
    options: [
      'Smaller, more frequent releases from short-lived branches, with automated tests on every merge',
      'Longer release cycles with a dedicated regression-testing phase before each quarterly release',
      'A change advisory board that reviews and approves every release bundle for a week before it ships',
      'A change freeze for a month before each release, so that only bug fixes reach the release branch',
    ],
    answer: 0,
    explanation: 'Small batches with automated testing make each change easier to verify and to roll back, which lowers failure rates. Longer cycles, heavier review boards and freezes increase batch size and delay feedback.'
  },
  {
    id: 'pca-o-003',
    topic: 'SDLC & CI/CD',
    difficulty: 'medium',
    prompt: 'Infrastructure changes are currently made by hand in the console and often cause outages. What process should the architect introduce?',
    options: [
      'Infrastructure as code in Git: pull requests showing the plan, peer review, and apply from the pipeline',
      'A change log in a shared spreadsheet, filled in by each engineer after every console change',
      'Restrict console access to a few senior engineers, who make all changes by hand with a checklist',
      'A monthly maintenance window in which all console changes are batched and made together',
    ],
    answer: 0,
    explanation: 'IaC with reviewed pull requests makes every change visible, tested and repeatable before it is applied. Spreadsheets, fewer people or monthly windows still leave changes manual and error-prone.'
  },
  {
    id: 'pca-o-004',
    topic: 'SDLC & CI/CD',
    difficulty: 'medium',
    prompt: 'A company wants a private, managed Git service in Google Cloud, in a chosen region, with access controlled through IAM and integrated with Cloud Build. What should it use?',
    options: ['Secure Source Manager', 'Cloud Source Repositories', 'A Git server on a Compute Engine VM', 'A Cloud Storage bucket of zipped repositories'],
    answer: 0,
    explanation: 'Secure Source Manager is the regional, managed Git service with IAM. Cloud Source Repositories is closed to new customers, a self-run Git server adds operations, and a bucket of zips is not version control.'
  },
  {
    id: 'pca-o-005',
    topic: 'SDLC & CI/CD',
    difficulty: 'medium',
    prompt: 'Builds need to reach a private artifact server and a database inside a VPC that has no public access. What should the CI platform use?',
    options: ['Cloud Build private pools connected to the VPC', 'Default Cloud Build workers with public IP allowlisting', 'A developer laptop running the builds over VPN', 'Making the artifact server public during builds'],
    answer: 0,
    explanation: 'Private pools run builds on workers peered to your network, so they reach private resources without exposing them. Allowlisting public addresses or exposing the server weakens security, and laptops are not a CI platform.'
  },
  {
    id: 'pca-o-006',
    topic: 'SDLC & CI/CD',
    difficulty: 'easy',
    prompt: 'Product managers want to launch a feature to 5% of users and turn it off instantly if problems appear, without a redeploy. What should the delivery process include?',
    options: [
      'Feature flags that decouple releasing a feature from deploying code',
      'A separate GKE cluster for each feature, deleted if problems appear',
      'Longer manual testing in staging before each production deploy',
      'Blue/green deployment of every release, switching all users at once',
    ],
    answer: 0,
    explanation: 'Feature flags let a deployed feature be enabled for a share of users and switched off instantly, with no redeploy. A cluster per feature adds cost, more manual testing gives no kill switch, and blue/green moves every user at once rather than 5%.'
  },
  {
    id: 'pca-o-007',
    topic: 'SDLC & CI/CD',
    difficulty: 'medium',
    prompt: 'Security reviews happen only at the end of each project and keep delaying launches. Which process change helps most?',
    options: [
      'Shift security left: dependency and image scanning, policy checks and secret detection in each pipeline',
      'Skip the security review for internal applications so that only public launches need one',
      'Add a second, earlier security review by the same team, halfway through each project',
      'Let developers mark scanner findings as accepted themselves, so reviews no longer block launches',
    ],
    answer: 0,
    explanation: 'Automated checks in the pipeline find issues while they are cheap to fix and keep releases flowing. Skipping, doubling or waiving reviews either increases risk or adds delay.'
  },

  // ── Troubleshooting & testing ─────────────────────────────────────────────
  {
    id: 'pca-o-008',
    topic: 'Troubleshooting & testing',
    difficulty: 'easy',
    prompt: 'After a major outage, management wants the organisation to learn from it and prevent repeats. Which practice should the architect recommend?',
    options: ['A blameless postmortem with timeline, root causes and tracked action items', 'Identifying and disciplining the engineer who made the change', 'Closing the incident as soon as service is restored', 'Adding a manual approval to every future change'],
    answer: 0,
    explanation: 'Blameless postmortems uncover systemic causes and produce owned follow-up actions. Blame discourages honesty, closing without analysis learns nothing, and blanket approvals slow delivery without fixing root causes.'
  },
  {
    id: 'pca-o-009',
    topic: 'Troubleshooting & testing',
    difficulty: 'medium',
    prompt: 'Error rates jumped 20 minutes ago. Dashboards show the increase started right after a new revision was deployed. What should the on-call engineer do first?',
    options: [
      'Roll back to the previous revision to restore service, then investigate',
      'Start a full root-cause analysis before changing anything in production',
      'Scale the service to twice as many instances to absorb the extra errors',
      'Open a support case with Google and wait for its analysis before acting',
    ],
    answer: 0,
    explanation: 'When a change clearly correlates with the incident, mitigate first by rolling back, then investigate calmly. Analysing first prolongs impact, scaling does not fix a bad release, and the release is the company\'s own.'
  },
  {
    id: 'pca-o-010',
    topic: 'Troubleshooting & testing',
    difficulty: 'medium',
    prompt: 'A team wants confidence that its Terraform changes are valid and comply with company rules (for example, no public buckets) before they are applied. What should the pipeline do?',
    options: [
      'Run `terraform validate` and `terraform plan`, check the plan against policies, and fail on violations',
      'Apply the changes to a production project, then check the console for public buckets afterwards',
      'Have two reviewers read the HCL files in each pull request, without running any Terraform commands',
      'Run `terraform destroy` and a fresh `terraform apply` for every change, so the state is always clean',
    ],
    answer: 0,
    explanation: 'Validating, planning and policy-checking the plan catches mistakes and violations before any change is made. Checking afterwards is too late, reading HCL alone misses computed changes, and destroying first causes outages.'
  },
  {
    id: 'pca-o-011',
    topic: 'Troubleshooting & testing',
    difficulty: 'easy',
    prompt: 'Which test strategy gives fast feedback while still catching integration problems in a microservices application?',
    options: [
      'Many fast unit tests, a smaller set of integration tests, and a few end-to-end tests',
      'Mostly end-to-end tests through the user interface, which exercise every service together',
      'Manual exploratory testing of the whole application by a QA team before each release',
      'Load tests in production after each release, since they reveal integration problems',
    ],
    answer: 0,
    explanation: 'The testing pyramid keeps feedback fast with unit tests and still verifies service interaction and key journeys. Relying only on slow end-to-end, manual or production load tests delays feedback and misses defects.'
  },
  {
    id: 'pca-o-012',
    topic: 'Troubleshooting & testing',
    difficulty: 'medium',
    prompt: 'A retailer expects ten times its normal traffic on launch day. How should the team validate the platform beforehand?',
    options: [
      'Load test a production-like environment at and beyond the expected peak, and fix the bottlenecks found',
      'Rely on autoscaling, which adds capacity automatically for any load, so no load testing is needed',
      'Run a load script with ten concurrent users from a developer laptop against the staging environment',
      'Raise every quota tenfold on launch morning, then watch the dashboards as the traffic arrives',
    ],
    answer: 0,
    explanation: 'Testing at and beyond expected peak in a realistic environment reveals limits such as quotas, database connections and cold starts before customers do. Untested autoscaling, tiny tests and last-minute quota changes leave the risk in place.'
  },
  {
    id: 'pca-o-013',
    topic: 'Troubleshooting & testing',
    difficulty: 'hard',
    prompt: 'Intermittent timeouts appear only in production, in a request path that crosses six services and a database. Logs on each service look normal. What is the most effective first step for root-cause analysis?',
    options: [
      'Use distributed traces (Cloud Trace) of slow requests to find the hop that adds latency, then check its logs and metrics',
      'Add more replicas to all six services and a read replica to the database, then see if the timeouts stop',
      'Restart each of the six services in sequence during a quiet period, watching which restart stops the timeouts',
      'Raise the client timeouts in all six services to five minutes so that slow requests complete instead of failing',
    ],
    answer: 0,
    explanation: 'Traces show the whole request path with timings, so the slow hop stands out and the investigation can focus there. Scaling, restarting or raising timeouts hides the symptom without finding the cause.'
  },

  // ── Disaster recovery processes ──────────────────────────────────────────
  {
    id: 'pca-o-014',
    topic: 'Disaster recovery processes',
    difficulty: 'easy',
    prompt: 'A company has a documented DR plan but has never executed it. What should it do?',
    options: [
      'Schedule regular DR tests that fail over real workloads and measure the actual RTO and RPO',
      'Treat the plan as valid because it was reviewed and signed off by the architecture board',
      'Keep the plan up to date and validate it during the first real disaster, when it matters',
      "Run a yearly tabletop reading of the plan's document, without failing over any systems",
    ],
    answer: 0,
    explanation: 'Only regular tests that fail over real workloads show whether recovery works and how long it really takes. A reviewed or read-through plan is still untested, and a real disaster is the worst time to find its gaps.'
  },
  {
    id: 'pca-o-015',
    topic: 'Disaster recovery processes',
    difficulty: 'medium',
    prompt: 'Workloads on GKE include stateful applications with persistent volumes. The team needs scheduled backups of cluster configuration and volumes, and restores into another cluster. What should it use?',
    options: ['Backup for GKE', 'Snapshots of the node boot disks', 'A copy of the Kubernetes manifests in Git only', 'Exporting Pod logs to Cloud Storage'],
    answer: 0,
    explanation: 'Backup for GKE backs up Kubernetes resources and persistent volume data on a schedule and restores them, including to another cluster. Node disks hold no application data, manifests lack volume data, and logs are not backups.'
  },
  {
    id: 'pca-o-016',
    topic: 'Disaster recovery processes',
    difficulty: 'medium',
    prompt: 'During a DR test, the application started in the DR region but could not reach its database password or its third-party API keys. What should the DR process add?',
    options: [
      'Replicate secrets and configuration to the DR region (e.g. Secret Manager replication) and test them in DR drills',
      'Email the database password and the API keys to the on-call engineers before each DR test or failover',
      "Hard-code the secrets into the DR region's VM images so that they are available at boot without lookups",
      'Leave secrets out of the DR tests, because the operators will copy them by hand in a real disaster',
    ],
    answer: 0,
    explanation: 'Recovery depends on everything the application needs, including secrets, configuration, DNS and IAM, so these must be replicated and tested. Emailing or hard-coding secrets is insecure, and skipping them hides the gap.'
  },
  {
    id: 'pca-o-017',
    topic: 'Disaster recovery processes',
    difficulty: 'medium',
    prompt: 'Failover takes 6 hours because operators follow a 40-step manual runbook. The RTO is 1 hour. What should the architect recommend?',
    options: [
      'Automate the failover with infrastructure as code and scripts, and rehearse it until it meets the RTO',
      'Add more operators so that the 40 runbook steps can be split between them and run in parallel',
      'Raise the RTO to six hours in the plan, since that is what the current runbook achieves',
      'Shorten the runbook by removing the verification steps, which take the most time',
    ],
    answer: 0,
    explanation: 'Automation makes recovery fast and repeatable, and rehearsals prove it meets the target. More operators or a relaxed target do not fix a slow manual process, and skipping the verification steps makes failover riskier without making it automatic.'
  },
  {
    id: 'pca-o-018',
    topic: 'Disaster recovery processes',
    difficulty: 'hard',
    prompt: 'A DR test of a payments service met its RTO, but transactions from the last 20 minutes were missing although the RPO is 5 minutes. What is the most likely process gap?',
    options: [
      'Replication lag was not monitored or alerted on, so the replica fell behind the RPO unnoticed',
      'The RTO target was too short, so the failover was rushed before the data had arrived',
      'The DR region had too few vCPUs to replay the incoming transactions during failover',
      'The load balancer used the Premium Tier, which routes writes to the nearest region',
    ],
    answer: 0,
    explanation: 'An RPO is only met if replication keeps up, so replica lag must be monitored with alerts tied to the RPO. RTO, compute size and network tier do not explain missing data.'
  },

  // ── Business processes & change ───────────────────────────────────────────
  {
    id: 'pca-o-019',
    topic: 'Business processes & change',
    difficulty: 'medium',
    prompt: 'The security team wants every service behind strict controls, while the product team wants to launch a pilot in two weeks. As the architect, how do you move forward?',
    options: [
      "Agree the pilot's risk level and minimum controls with both teams, and what must follow before general availability",
      'Side with the product team and launch without extra controls, since the pilot is small and revenue matters',
      'Side with the security team and postpone the pilot until every service meets all of the strict controls',
      'Let both teams proceed in parallel and reconcile the security findings some time after the pilot launches',
    ],
    answer: 0,
    explanation: 'Architects influence by aligning stakeholders on business risk and documenting trade-offs, giving a path that satisfies both. Taking one side ignores legitimate concerns, and working without coordination creates conflict later.'
  },
  {
    id: 'pca-o-020',
    topic: 'Business processes & change',
    difficulty: 'easy',
    prompt: 'Thirty application teams must move to a new internal developer platform on GKE. Several teams resist the change. What helps adoption most?',
    options: [
      'Explain the why early, train the teams, start with willing pilot teams as champions, and roll out in phases',
      'Announce a hard deadline and turn off the old platform on that date, so that every team has to move',
      'Let each team decide whether and when to adopt the platform, without any target date or support',
      'Move all thirty teams in one weekend so that nobody runs two platforms, with training afterwards',
    ],
    answer: 0,
    explanation: 'Change management succeeds with clear reasons, skills, visible early wins and a supported phased rollout. Forcing a cliff-edge, leaving it optional forever or moving everyone untrained all raise risk and resistance.'
  },
  {
    id: 'pca-o-021',
    topic: 'Business processes & change',
    difficulty: 'easy',
    prompt: 'Operations staff know on-premises virtualisation well but have little cloud experience, and a migration starts in six months. What should the architect do first?',
    options: [
      "Assess the team's skills against the target platform and build a training plan with hands-on labs",
      'Replace the operations team with experienced cloud engineers hired before the migration starts',
      'Delay the migration until every member of the team has learned Google Cloud in their own time',
      'Outsource all operations to a partner permanently, without any knowledge transfer to the team',
    ],
    answer: 0,
    explanation: 'A skills assessment and targeted training prepare the existing team in time. Replacing people loses business knowledge, waiting stalls the programme, and outsourcing without knowledge transfer creates lasting dependency.'
  },
  {
    id: 'pca-o-022',
    topic: 'Business processes & change',
    difficulty: 'medium',
    prompt: 'Teams keep revisiting the same architecture debates, and new members do not know why past choices were made. What lightweight practice helps?',
    options: ['Architecture decision records stored with the code', 'A weekly meeting to repeat past decisions', 'Letting each engineer document decisions privately', 'Avoiding decisions until all options are fully known'],
    answer: 0,
    explanation: 'Short decision records capture context, options and the reason for a choice, so decisions are not reopened without cause. Meetings and private notes do not create a shared record, and waiting for perfect information blocks progress.'
  },
  {
    id: 'pca-o-023',
    topic: 'Business processes & change',
    difficulty: 'medium',
    prompt: 'A company has finished migrating its main platform. Business sponsors ask whether the project was worth it. Which customer success practice should the architect put in place?',
    options: [
      'Agree measurable outcomes (cost, release speed, availability) up front and review them with sponsors regularly',
      'Report the number of migrated VMs and applications, which shows how much of the estate has moved',
      'Declare success once the old data centre is closed and its lease ends, since that was the main goal',
      'Send the sponsors the monthly cloud invoice so they can compare it with the old data centre costs',
    ],
    answer: 0,
    explanation: 'Success should be measured against the outcomes the business wanted, reviewed regularly so gaps can be addressed. VM counts or a closed data centre are milestones, and an invoice shows cost alone, not the value delivered.'
  },
  {
    id: 'pca-o-024',
    topic: 'Business processes & change',
    difficulty: 'easy',
    prompt: 'The CFO asks how moving from owned data centres to Google Cloud changes the company\'s spending model. What is the best explanation?',
    options: [
      'Upfront capital expenditure on hardware becomes operating expenditure that follows actual usage',
      'Operating expenditure on staff becomes capital expenditure on long-term cloud contracts',
      'Costs become fixed monthly fees that stay the same no matter how much capacity is used',
      'Hardware costs disappear, so the IT budget falls by the value of the old data centres',
    ],
    answer: 0,
    explanation: 'Cloud replaces upfront hardware purchases (CapEx) with pay-as-you-go spending (OpEx) that scales with use. Costs are not fixed or eliminated, and the shift is the other way round.'
  },
  {
    id: 'pca-o-025',
    topic: 'Business processes & change',
    difficulty: 'medium',
    prompt: 'Several departments are starting cloud projects independently and repeating mistakes in security, networking and cost. What organisational step should the architect recommend?',
    options: [
      'A cloud centre of excellence that sets standards, provides landing zones and shares patterns across teams',
      'A ban on departmental cloud projects until a central team has migrated every workload itself',
      'Letting each department build and run its own landing zone, with its own standards and patterns',
      "Centralising all application development in one team that builds every department's projects",
    ],
    answer: 0,
    explanation: 'A cloud centre of excellence spreads good practice and shared foundations while teams keep delivering. Bans and full centralisation slow the business, and separate landing zones repeat the mistakes.'
  },
  {
    id: 'pca-o-026',
    topic: 'Business processes & change',
    difficulty: 'medium',
    prompt: 'For business continuity, a plan covers the technical failover but nobody knows who declares a disaster or how customers are told. What should be added?',
    options: [
      'Clear roles and decision authority, escalation paths and a communication plan for staff and customers',
      'A second, more detailed technical runbook covering every step of the failover in each region',
      'More monitoring dashboards and alerts, so that everyone can see when a disaster is under way',
      'Longer backup retention and more frequent snapshots, so less data is lost if a disaster occurs',
    ],
    answer: 0,
    explanation: 'Business continuity needs people and process: who decides, who acts and how stakeholders are informed. More runbooks, dashboards or retention do not answer those questions.'
  },

  // ── Cost optimisation ───────────────────────────────────────────────────
  {
    id: 'pca-o-027',
    topic: 'Cost optimisation',
    difficulty: 'easy',
    prompt: 'Many VMs average 10% CPU utilisation. What is the lowest-effort way to find which machine types to downsize?',
    options: [
      'Machine type (rightsizing) recommendations from Active Assist',
      "A weekly manual review of each VM's CPU graphs in Monitoring",
      'A script that deletes any VM whose CPU stays below 20 percent',
      'Moving every VM to Spot VMs and letting preemption trim usage',
    ],
    answer: 0,
    explanation: 'The recommender already analyses utilisation and suggests smaller shapes with estimated savings. Manual reviews do not scale, deleting VMs breaks services, and Spot is not suitable for every workload.'
  },
  {
    id: 'pca-o-028',
    topic: 'Cost optimisation',
    difficulty: 'medium',
    prompt: 'Finance wants monthly cloud costs broken down by team and environment for chargeback. Which two should the architect put in place? (Choose two.)',
    options: [
      'Consistent `team` and `environment` labels on every resource, enforced in the IaC modules',
      'Cloud Billing export to BigQuery, with chargeback reports built on the labelled cost data',
      "A separate billing account for every VM, so that each invoice shows one machine's cost",
      'Monthly emails from each team estimating its own spend, collected by finance in a sheet',
      'A spreadsheet of all resources and owners, maintained by hand by the platform team',
    ],
    answer: [0, 1],
    explanation: 'Labels flow into the billing data, and the BigQuery export lets finance group cost by any label, so together they produce the chargeback report. Separate accounts per VM are unmanageable, and estimates or hand-kept spreadsheets are inaccurate.'
  },
  {
    id: 'pca-o-029',
    topic: 'Cost optimisation',
    difficulty: 'medium',
    prompt: 'A company runs a steady mix of Compute Engine, GKE and Cloud Run workloads whose machine families change often. It wants a commitment discount that follows the spend rather than specific machines. What fits?',
    options: [
      'Compute flexible (spend-based) committed use discounts',
      'Resource-based commitments for one machine series',
      'Sustained use discounts, applied automatically',
      'Spot VMs for every workload to cut the hourly rate',
    ],
    answer: 0,
    explanation: 'Flexible CUDs commit to an hourly spend that applies across eligible compute services and machine families. Resource-based CUDs tie you to specific resources, sustained use discounts are small and limited, and Spot does not suit every workload.'
  },
  {
    id: 'pca-o-030',
    topic: 'Cost optimisation',
    difficulty: 'easy',
    prompt: 'Development VMs run 24 hours a day but are used only during office hours on weekdays. What saves the most with little effort?',
    options: ['Instance schedules that stop the VMs outside working hours', 'Committed use discounts for the development VMs', 'Larger VMs so work finishes faster', 'Moving the VMs to another region'],
    answer: 0,
    explanation: 'Stopping VMs for nights and weekends removes about 70% of their compute hours. Committing to idle capacity locks in waste, and bigger VMs or another region do not address idle time.'
  },
  {
    id: 'pca-o-031',
    topic: 'Cost optimisation',
    difficulty: 'medium',
    prompt: 'Each product team has its own projects. Leadership wants teams warned when they are on track to exceed their monthly budget, and wants a way to act automatically for sandbox projects. Which two should you configure? (Choose two.)',
    options: [
      "A budget per team with alert thresholds on forecasted spend, emailed to the team's leads",
      'Pub/Sub budget notifications that trigger a function to stop sandbox resources over budget',
      'One budget for the whole organization, with an email alert to the CFO when actual spend passes 100%',
      'Quotas set to zero in every project, raised by request whenever a team needs more capacity',
      'A monthly review of the invoice by finance, who then ask the teams over budget to cut their spend',
    ],
    answer: [0, 1],
    explanation: 'Per-team budgets with forecast thresholds warn before the money is spent, and programmatic Pub/Sub notifications let code act, for example by stopping sandbox resources. Budgets alone never stop spending. A single organization budget hides who overspends, zero quotas stop work, and invoice reviews come too late.'
  },
  {
    id: 'pca-o-032',
    topic: 'Cost optimisation',
    difficulty: 'medium',
    prompt: 'Logs and media files in Cloud Storage are written once, read heavily for a month, and then rarely touched but kept for three years. How do you cut storage cost without slowing the first month?',
    options: [
      'Lifecycle rules: Nearline after 30 days, Coldline or Archive later, and deletion after three years',
      'Store everything in Archive storage from the start, since it is the cheapest class per GiB',
      'Delete the objects after 30 days, and restore them from backups if anyone needs them later',
      'Keep everything in Standard storage, which avoids retrieval fees and minimum durations',
    ],
    answer: 0,
    explanation: 'Lifecycle rules match the storage class to the access pattern over time and delete data when retention ends. Archive from day one adds retrieval fees during the busy month, deleting breaks retention, and Standard overpays for cold data.'
  },
  {
    id: 'pca-o-033',
    topic: 'Cost optimisation',
    difficulty: 'hard',
    prompt: 'A data platform\'s BigQuery bill doubled in two months. You need to find which users and queries drive the cost before changing anything. What should you do first?',
    options: [
      'Query `INFORMATION_SCHEMA.JOBS` for bytes billed by user and query over the period',
      'Switch the whole organization to capacity-based pricing immediately to cap the bill',
      'Delete or archive the largest tables, which are the most likely cause of the cost',
      'Ask each analyst to estimate their own usage and report it back for the period',
    ],
    answer: 0,
    explanation: 'The jobs views show exactly who ran which queries and how many bytes each billed, so fixes can target the real cause. Changing pricing or deleting tables blindly may not address it, and estimates are unreliable.'
  }
];
