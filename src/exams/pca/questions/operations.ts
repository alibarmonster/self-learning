import type { Question } from '@/types';

/**
 * Section 6 — Ensuring solution and operations excellence (~12.5%). The
 * operational excellence pillar and SRE practice, observability and alerting,
 * release management, support and quality, and reliability testing.
 */
export const operations: Question[] = [
  // ── Operational excellence ───────────────────────────────────────────────
  {
    id: 'pca-x-001',
    topic: 'Operational excellence',
    difficulty: 'medium',
    prompt: 'A service has used its entire error budget for the quarter two weeks early. Under SRE practice, what should happen?',
    options: [
      'Pause risky feature releases and spend engineering effort on reliability until the budget recovers',
      'Lower the SLO target for the rest of the quarter so that the remaining budget covers the releases',
      'Keep releasing as planned, because the error budget resets automatically at the start of next quarter',
      'Remove the SLO until the service is stable enough to meet it, then reinstate it next quarter',
    ],
    answer: 0,
    explanation: 'An exhausted error budget means reliability work takes priority over new risk until the service is back within its objective. Changing or dropping the SLO, or ignoring it, removes the very signal the budget provides.'
  },
  {
    id: 'pca-x-002',
    topic: 'Operational excellence',
    difficulty: 'medium',
    prompt: 'Which service level indicator best reflects what users of a public checkout API experience?',
    options: [
      'The proportion of checkout requests, measured at the load balancer, that succeed within 300 ms',
      'The average CPU utilisation of the checkout Pods, measured every minute by Cloud Monitoring',
      'The number of healthy nodes in the cluster that runs the checkout service, sampled each minute',
      "The mean query latency of the checkout database, measured on the database's primary instance",
    ],
    answer: 0,
    explanation: 'A good SLI measures user-visible success and latency as close to the user as possible. CPU, node counts and database query latency are internal signals that do not show what users feel.'
  },
  {
    id: 'pca-x-003',
    topic: 'Operational excellence',
    difficulty: 'easy',
    prompt: 'An operations team spends most of each week manually resizing disks, restarting stuck jobs and copying logs. What should the architect recommend first?',
    options: [
      'Measure and automate this repetitive toil, so engineers can spend their time on lasting improvements',
      'Hire more operators to share the same tasks, so each engineer spends less of the week on them',
      'Do the tasks less often and accept a few more incidents in exchange for the time saved',
      'Move the manual work to a weekend shift so that it no longer disrupts the working week',
    ],
    answer: 0,
    explanation: 'Repetitive manual work that scales with load is toil; automating it frees time for engineering and reduces errors. More people or shifted schedules keep the toil, and doing it less often hurts reliability.'
  },
  {
    id: 'pca-x-004',
    topic: 'Operational excellence',
    difficulty: 'medium',
    prompt: 'A new customer-facing service is two weeks from launch. Which two should an operational readiness review confirm? (Choose two.)',
    options: [
      "SLOs with alerts and dashboards for the service's main user journeys",
      'Runbooks, a tested rollback and a named on-call team that owns the service',
      'Full unit-test coverage and documentation comments on every function',
      'A user interface that matches the brand guide and the marketing review',
      'Owner on the production project for every engineer, so anyone can fix issues',
    ],
    answer: [0, 1],
    explanation: 'Readiness means the service can be observed, operated and rolled back by a clear owner: SLO-based alerts and dashboards, runbooks, a proven rollback and on-call ownership, with capacity and quota headroom checked too. Test coverage and branding are not operational readiness, and broad Owner access weakens security.'
  },
  {
    id: 'pca-x-005',
    topic: 'Operational excellence',
    difficulty: 'medium',
    prompt: 'During major incidents, several engineers change things at once, nobody updates customers, and work is duplicated. What should the incident process define?',
    options: [
      'Clear roles, such as incident commander, operations lead and communications lead, with one coordinator',
      'A rule that only the CTO may make changes to production during any incident, however small it is',
      'A shared chat channel where every engineer posts what they are changing and acts independently',
      'A full postmortem written before mitigation starts, so that the cause is understood first',
    ],
    answer: 0,
    explanation: 'Structured incident management assigns command, hands-on work and communication to distinct roles so effort is coordinated. Bottlenecking on one executive, uncoordinated action or analysis before mitigation all prolong the impact.'
  },
  {
    id: 'pca-x-006',
    topic: 'Operational excellence',
    difficulty: 'medium',
    prompt: 'Which practice best reflects the operational excellence pillar of the Google Cloud Well-Architected Framework?',
    options: [
      'Automate deployments and infrastructure, make changes small and reversible, and learn from incidents',
      'Make large, infrequent changes so that there are fewer deployments that could cause incidents',
      'Rely on careful manual checks in the console after each change, done by a senior engineer',
      'Keep monitoring to a minimum to reduce costs, and investigate only when users report problems',
    ],
    answer: 0,
    explanation: 'The pillar centres on operational readiness, automation, small reversible changes, incident management and continuous improvement. Large infrequent changes, manual checks and no monitoring work against it.'
  },

  // ── Observability & alerting ─────────────────────────────────────────────
  {
    id: 'pca-x-007',
    topic: 'Observability & alerting',
    difficulty: 'medium',
    prompt: 'On-call engineers receive hundreds of alerts a week, mostly about high CPU on single nodes, and have started ignoring them. Which two changes should the alerting strategy make? (Choose two.)',
    options: [
      'Page on user-facing symptoms such as SLO burn rate, and keep cause metrics like CPU on dashboards',
      'Route alerts by severity, so only urgent ones page, and attach a runbook to every alerting policy',
      'Add more CPU alerts with lower thresholds so that problems are caught before nodes become saturated',
      'Turn off all of the alerts and rely on customer support tickets to report problems to the on-call team',
      'Send every alert to the whole engineering organization so that someone always responds quickly',
    ],
    answer: [0, 1],
    explanation: 'Symptom-based, SLO-driven paging fires only when users are affected, and severity routing with runbooks makes each page actionable, which restores trust in alerts. More cause alerts add noise, no alerts means customers find problems first, and broadcasting alerts helps no one.'
  },
  {
    id: 'pca-x-008',
    topic: 'Observability & alerting',
    difficulty: 'easy',
    prompt: 'Teams running workloads on GKE already use Prometheus exporters and PromQL dashboards, but are tired of running and scaling Prometheus servers. What should you recommend?',
    options: [
      'Google Cloud Managed Service for Prometheus',
      'A larger, self-managed Prometheus VM per cluster',
      'Cloud Profiler agents in every container',
      'A Prometheus federation server on Compute Engine',
    ],
    answer: 0,
    explanation: 'Managed Service for Prometheus collects and stores Prometheus metrics at global scale and supports PromQL, so the servers go away while the dashboards stay. A bigger VM or a federation server is still a Prometheus server to run, and Cloud Profiler profiles code rather than storing metrics.'
  },
  {
    id: 'pca-x-009',
    topic: 'Observability & alerting',
    difficulty: 'medium',
    prompt: 'Security and operations need logs from 200 projects in one place, queryable with SQL, and project owners must not be able to opt out. What should you configure?',
    options: [
      'An aggregated sink at the organization routing logs to a central log bucket with Log Analytics enabled',
      'A log sink in each project, created by its owner, exporting the logs to a shared BigQuery dataset',
      'Logs Explorer saved queries in each project, shared with the security and operations teams',
      'A longer `_Default` bucket retention in every project, with Log Analytics turned on in each one',
    ],
    answer: 0,
    explanation: 'An organization-level aggregated sink collects from every project, and Log Analytics allows SQL over the central bucket. Per-project exports and views are scattered and optional, and longer retention does not centralise anything.'
  },
  {
    id: 'pca-x-010',
    topic: 'Observability & alerting',
    difficulty: 'medium',
    prompt: 'A Go service\'s CPU cost rose 40% after recent releases, but latency is fine. Which tool shows which functions consume the CPU in production with low overhead?',
    options: ['Cloud Profiler', 'Cloud Trace', 'Uptime checks', 'VPC Flow Logs'],
    answer: 0,
    explanation: 'Cloud Profiler continuously samples CPU and memory in production and shows the costliest functions. Trace shows where request time goes, uptime checks test availability, and flow logs record network traffic.'
  },
  {
    id: 'pca-x-011',
    topic: 'Observability & alerting',
    difficulty: 'hard',
    prompt: 'A company wants to choose between two machine series for a database tier based on price-performance for its own workload, not vendor claims. What should it do?',
    options: [
      'Benchmark both with a representative workload, such as replayed production traffic, and compare cost per unit of work',
      'Pick the newest machine series, since each new generation is faster per vCPU than the one before it',
      'Compare the published vCPU counts and memory sizes of the two series at the same hourly price',
      'Run each series in production for a week with half of the traffic and compare CPU utilisation only',
    ],
    answer: 0,
    explanation: 'Benchmarking with a representative workload measures the price-performance that matters to you. Newest-is-best and published specifications are assumptions, and CPU utilisation alone says nothing about the work done per dollar.'
  },
  {
    id: 'pca-x-012',
    topic: 'Observability & alerting',
    difficulty: 'easy',
    prompt: 'An SRE team wants the metrics of 25 production projects on shared dashboards and alerting policies. What should it configure?',
    options: [
      'A metrics scope in one scoping project that includes the 25 projects',
      'A separate copy of each dashboard and alert in all 25 projects',
      'A BigQuery export of every metric, queried by a shared dashboard',
      'VPC Network Peering between the 25 projects and a monitoring project',
    ],
    answer: 0,
    explanation: 'A metrics scope lets one project chart and alert on metrics from many monitored projects. Separate dashboards fragment the view, exporting metrics is unnecessary, and peering is about networks, not monitoring.'
  },
  {
    id: 'pca-x-013',
    topic: 'Observability & alerting',
    difficulty: 'medium',
    prompt: 'The business wants to know within minutes if the "search, add to cart, pay" journey breaks, even at night when real traffic is low. What should you set up?',
    options: [
      'A synthetic monitor that scripts the journey on a schedule, with an alert on failure',
      'An alert on the average CPU utilisation of the web tier, checked every five minutes',
      'A daily manual test of the journey by the support team at the start of each shift',
      'Longer log retention, so that failed journeys can be investigated the next morning',
    ],
    answer: 0,
    explanation: 'Synthetic monitors exercise the critical journey continuously, so failures are detected even without real traffic. CPU says nothing about the journey, a daily manual test is too slow, and retention detects nothing.'
  },
  {
    id: 'pca-x-014',
    topic: 'Observability & alerting',
    difficulty: 'medium',
    prompt: 'Developers want to be told when a new kind of exception starts appearing in production, grouped with its stack trace and count, without writing log queries. What should they use?',
    options: ['Error Reporting', 'Cloud Profiler', 'Cloud Asset Inventory', 'Billing alerts'],
    answer: 0,
    explanation: 'Error Reporting groups exceptions from logs by stack trace, counts them and can notify on new errors. Profiler measures resource use, Asset Inventory lists resources, and billing alerts track spend.'
  },

  // ── Release management ──────────────────────────────────────────────────
  {
    id: 'pca-x-015',
    topic: 'Release management',
    difficulty: 'medium',
    prompt: 'A team deploying to GKE wants each release to go to 10% of traffic first, be verified automatically, and either continue or roll back. What should it use?',
    options: [
      'A Cloud Deploy delivery pipeline with a canary strategy and verification',
      'A manual `kubectl apply` to one Pod, followed by watching the dashboards',
      'A new GKE cluster for every release, with DNS switched after testing',
      'A nightly batch deployment of all services, verified the next morning',
    ],
    answer: 0,
    explanation: 'Cloud Deploy canary strategies shift a share of traffic, run verification, and then advance or roll back. Manual applies rely on people watching, new clusters per release are wasteful, and nightly batches increase risk.'
  },
  {
    id: 'pca-x-016',
    topic: 'Release management',
    difficulty: 'medium',
    prompt: 'A VM-based application must switch from the old version to the new version all at once with the ability to switch back within seconds. Which pattern fits?',
    options: [
      'Blue/green: deploy to a second managed instance group, switch the load balancer to it, and keep the old group ready',
      'A rolling update of the existing managed instance group, replacing a few VMs at a time over an hour',
      'Delete the old VMs first, then create the new ones from an updated instance template in the same group',
      'Point a DNS record at the new VMs with a one-week TTL, and point it back at the old VMs if needed',
    ],
    answer: 0,
    explanation: 'Blue/green keeps both versions running, so cutover and rollback are just a backend switch. A rolling update changes VMs gradually rather than all at once, deleting first causes downtime, and long DNS TTLs make switching slow.'
  },
  {
    id: 'pca-x-017',
    topic: 'Release management',
    difficulty: 'hard',
    prompt: 'A release renames a database column that both the old and new versions of the application read during a rolling update. How should the change be made without downtime?',
    options: [
      'Expand and contract: add the new column, write to both, backfill, switch reads, and drop the old column later',
      'Rename the column first in a quick migration, then deploy the new version of the application',
      'Stop the application in a maintenance window, rename the column, and redeploy the new version',
      'Deploy the new application version first everywhere, then rename the column once it is live',
    ],
    answer: 0,
    explanation: 'Backward-compatible, multi-step schema changes keep both versions working during the rollout. Renaming before or after the deploy breaks one of the versions, and stopping the app means downtime.'
  },
  {
    id: 'pca-x-018',
    topic: 'Release management',
    difficulty: 'easy',
    prompt: 'On Cloud Run, the team wants testers to try a new revision at its own URL before any customer traffic reaches it. What should it do?',
    options: [
      "Deploy the revision with no traffic and a tag, then test at the tag's URL",
      'Deploy the revision normally and ask customers to report any problems',
      'Create a second project with a copy of the service for every test run',
      'Set the minimum instances to zero so that the new revision gets no users',
    ],
    answer: 0,
    explanation: 'A tagged revision with no traffic gets its own URL for testing, and traffic can then be shifted gradually. Deploying straight to customers skips testing, extra projects add overhead, and minimum instances do not control traffic.'
  },
  {
    id: 'pca-x-019',
    topic: 'Release management',
    difficulty: 'medium',
    prompt: 'A retailer must prevent production deployments during its Black Friday week, except for approved emergency fixes. How can the delivery platform enforce this?',
    options: [
      'A Cloud Deploy deploy policy that blocks production rollouts in that window, overridable for approved fixes',
      'An email to all teams asking them not to deploy to production at all during Black Friday week',
      "Removing every developer's IAM roles for the week, then granting them back after the event",
      'Deleting the delivery pipelines for the week and recreating them from code after Black Friday',
    ],
    answer: 0,
    explanation: 'Deploy policies stop rollouts during defined periods and can be overridden deliberately. Emails are not enforced, removing IAM blocks emergency fixes, and deleting pipelines loses history and configuration.'
  },
  {
    id: 'pca-x-020',
    topic: 'Release management',
    difficulty: 'medium',
    prompt: 'Rollbacks take hours because teams must rebuild the previous version from source. What should the release process guarantee?',
    options: [
      'Every release is an immutable, versioned artifact in Artifact Registry, so rollback redeploys the last one',
      'Rollbacks are done by editing the changed files directly on the servers, which avoids a rebuild',
      'Only the latest image is kept in the registry, to save storage and avoid deploying an old version',
      'Every release is tagged `latest`, so that the deployment always pulls the newest working image',
    ],
    answer: 0,
    explanation: 'Keeping immutable, versioned artifacts makes rollback a quick redeploy of a known-good build. Editing servers is risky, deleting old images removes the rollback target, and `latest` cannot identify a version.'
  },

  // ── Support & quality ───────────────────────────────────────────────────
  {
    id: 'pca-x-021',
    topic: 'Support & quality',
    difficulty: 'easy',
    prompt: 'A production outage affects all customers, and the team suspects a problem on Google\'s side. The company has an Enhanced or Premium Customer Care plan. What should it do?',
    options: [
      'Open a P1 (critical impact) case with details and evidence, while running its own incident process',
      'Post the details on a public community forum and wait for a Google engineer to reply there',
      'Open a P4 case with the details, since lower priorities are handled with less paperwork',
      'Wait until the next business day, then contact the account team with a summary of the outage',
    ],
    answer: 0,
    explanation: 'A P1 case gets the fastest response for business-critical outages, and good evidence speeds diagnosis. Forums and low priorities delay help, and waiting extends the outage.'
  },
  {
    id: 'pca-x-022',
    topic: 'Support & quality',
    difficulty: 'medium',
    prompt: 'Defects keep reaching production because changes are merged without tests or review. Which quality control should the architect introduce?',
    options: [
      'Required code review and passing automated tests as merge gates in the pipeline',
      'A quarterly code audit by an external firm, reported to the leadership team',
      'A rule that only senior engineers may write or merge production code',
      'Manual testing in production by the whole team after every deployment',
    ],
    answer: 0,
    explanation: 'Merge gates enforce review and testing on every change, before it reaches users. Quarterly audits are too late, restricting who codes does not ensure quality, and testing in production finds defects after customers do.'
  },
  {
    id: 'pca-x-023',
    topic: 'Support & quality',
    difficulty: 'medium',
    prompt: 'Leadership asks how to evaluate whether a platform\'s quality is improving over time. Which measures should the regular review use?',
    options: [
      'SLO attainment, change failure rate and customer-reported incidents, tracked over time',
      'Lines of code written and pull requests merged per engineer, tracked monthly',
      'The number of meetings held and decisions recorded by the platform team',
      'The number of dashboards and alert policies created across all projects',
    ],
    answer: 0,
    explanation: 'Reliability against objectives, the safety of changes and customer-visible problems measure quality from the outcome side. Code volume, meetings and dashboard counts measure activity, not quality.'
  },
  {
    id: 'pca-x-024',
    topic: 'Support & quality',
    difficulty: 'medium',
    prompt: 'A support team needs to see an application\'s current alerts, active Google Cloud incidents and planned maintenance in one place, without broad project permissions. What helps most?',
    options: [
      'Cloud Hub for the application, with read-only roles for the support team',
      'Owner on every project for the support team, so nothing is hidden',
      'A shared login to one administrator account for the whole team',
      'Weekly email summaries of alerts and incidents from engineering',
    ],
    answer: 0,
    explanation: 'Cloud Hub brings an application\'s alerts, incidents and maintenance together, and read-only roles keep least privilege. Owner rights and shared accounts are insecure, and weekly emails are too slow for support.'
  },
  {
    id: 'pca-x-029',
    topic: 'Support & quality',
    difficulty: 'medium',
    prompt: 'A company wants a named Technical Account Manager, the fastest response for critical cases and proactive guidance on its most important workloads. Which Google Cloud support offering fits?',
    options: [
      'Premium Support, which includes a named Technical Account Manager',
      'Standard Support, which assigns a Technical Account Manager on request',
      'Enhanced Support, which adds a Technical Account Manager for P1 cases',
      'Basic Support, with community forums and billing questions only',
    ],
    answer: 0,
    explanation: 'Premium Support adds a Technical Account Manager, the fastest response for critical cases and proactive guidance for important workloads. Standard and Enhanced Support do not include a TAM, and Basic Support covers billing and documentation only.'
  },

  // ── Reliability testing ─────────────────────────────────────────────────
  {
    id: 'pca-x-025',
    topic: 'Reliability testing',
    difficulty: 'medium',
    prompt: 'A team wants to start chaos engineering on its microservices platform. What is the recommended way to begin?',
    options: [
      'Form a hypothesis, inject a small controlled fault (e.g. kill one Pod) in staging, observe, then expand gradually',
      'Shut down a whole production region at peak time without warning, to see how the platform copes',
      'Delete a random production database during business hours to prove that the restores really work',
      'Wait for the next real outage, then run chaos experiments that repeat the same failure afterwards',
    ],
    answer: 0,
    explanation: 'Chaos engineering is controlled experimentation: hypothesis, small blast radius, observation and gradual expansion. Unannounced region shutdowns or deleting data are reckless, and waiting for outages is not experimentation.'
  },
  {
    id: 'pca-x-026',
    topic: 'Reliability testing',
    difficulty: 'easy',
    prompt: 'A company wants to commission a penetration test of its own applications running on Google Cloud. What is required regarding Google?',
    options: [
      'No notice to Google is needed, but the test must follow the Acceptable Use Policy and target only its own resources',
      "Written approval from Google's security team is required before every test, at least two weeks ahead",
      "The test may also target Google's shared infrastructure, as long as the company's projects are in scope",
      "Penetration testing is not allowed on Google Cloud; only Google's own security scanners may be used",
    ],
    answer: 0,
    explanation: 'Customers may test their own deployments without notifying Google, as long as they follow the Acceptable Use Policy and terms. Testing Google\'s infrastructure or other customers is not allowed.'
  },
  {
    id: 'pca-x-027',
    topic: 'Reliability testing',
    difficulty: 'medium',
    prompt: 'Before a product launch, the team wants to know at what load the system breaks and whether autoscaling and quotas keep up. Which test answers this?',
    options: [
      'A load test ramping past the expected peak in a production-like environment, watching scaling and quotas',
      'A full unit-test suite run with code coverage reports on every commit before the launch',
      'A penetration test of the public endpoints by an external security firm in the week before launch',
      'A code review of the autoscaling settings and the quota requests by two senior engineers',
    ],
    answer: 0,
    explanation: 'Ramping load past expected peak shows the breaking point and whether autoscaling, quotas and dependencies keep up. Unit tests, penetration tests and reviews do not measure capacity.'
  },
  {
    id: 'pca-x-028',
    topic: 'Reliability testing',
    difficulty: 'medium',
    prompt: 'The incident process exists on paper, but responders have never practised it together. What should the team run?',
    options: [
      'Regular game days that simulate realistic failures and rehearse detection, escalation and recovery',
      'A yearly reading of the incident policy by every responder, with a signed acknowledgement',
      'Nothing until a real incident happens, since that is when the process will be learned best',
      'An online quiz about the incident process, repeated each quarter for every on-call engineer',
    ],
    answer: 0,
    explanation: 'Game days rehearse the whole response under realistic conditions and reveal gaps safely. Reading the policy, waiting for a real incident or a quiz do not build the practised response.'
  },
  {
    id: 'pca-x-030',
    topic: 'Reliability testing',
    difficulty: 'medium',
    prompt: 'A company runs an active-passive setup across two regions. Which two practices best prove that a regional failover will actually work when it is needed? (Choose two.)',
    options: [
      'Planned failover drills to the second region that measure the real RTO and RPO',
      'Chaos experiments that simulate a zone or region outage in a production-like setup',
      'A review of the architecture diagram by the team that originally designed it',
      'Unit tests that mock the database client in every service on each commit',
      'Monthly checks that backup files exist in the second region\'s storage bucket',
    ],
    answer: [0, 1],
    explanation: 'Only exercising the failover, through planned drills or controlled fault injection, shows that it works and how long it takes. A diagram review, mocked unit tests and checking that backups exist do not prove that the second region can take over.'
  }
];
