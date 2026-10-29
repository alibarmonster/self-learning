/**
 * Module 5 try-out — Operations, Observability & Infrastructure as Code (exam
 * guide 2.4 and 3.4). 100 questions: metrics, custom metrics, alerting, the
 * Ops Agent and Managed Service for Prometheus; Cloud Logging queries, audit
 * logs, flow and firewall logs, log buckets, sinks and Log Analytics; Active
 * Assist, Cloud Hub, Personalized Service Health and Gemini Cloud Assist;
 * Cloud Trace, Cloud Profiler, Query Insights and index advisor; job and
 * workload status; Terraform, Helm, Config Connector and Fabric FAST; and
 * AI-assisted tools. Dealt into five sets of 20 in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const module5: ModuleQuestion[] = [
  // ── Cloud Monitoring: metrics, alerting, agents and Prometheus ──
  {
    id: 'ace-m5-001',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'Which Compute Engine VM metric is only available in Cloud Monitoring after you install the Ops Agent?',
    options: ['Memory utilization', 'CPU utilization', 'Network bytes received', 'Disk read operations'],
    answer: 0,
    explanation: 'The hypervisor reports CPU, network and disk I/O without an agent, but memory usage (and disk space usage, processes and application metrics) can only be seen from inside the guest, which is what the Ops Agent collects.'
  },
  {
    id: 'ace-m5-002',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'An application should report the number of items in each shopping cart as a metric, so you can chart it and alert on it. How should it send the metric?',
    options: [
      'Write a custom metric, such as `custom.googleapis.com/cart/items`, with the Monitoring API or OpenTelemetry',
      'Print the number to a local file, which Cloud Monitoring reads automatically every single minute',
      'Add the number as a label on the VM, which Cloud Monitoring turns into a new time series',
      'Store the number in a Cloud Storage object, which Cloud Monitoring scans to build its charts'
    ],
    answer: 0,
    explanation: 'Custom (user-defined) metrics are written through the Cloud Monitoring API, client libraries or OpenTelemetry, and then behave like any other metric in charts and alerts. Monitoring does not read local files or buckets on its own, and labels are metadata rather than measurements. A log-based metric is an alternative if the value is logged.'
  },
  {
    id: 'ace-m5-003',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Each request log line contains a latencyMs field. You want a chart of latency percentiles from these logs without changing the application. What should you create?',
    options: [
      'A distribution log-based metric that extracts latencyMs from the matching entries',
      'A counter log-based metric that counts entries where latencyMs is present',
      'An uptime check that measures the latency of the application every minute',
      'A log sink that copies the request logs to a Pub/Sub topic for charting'
    ],
    answer: 0,
    explanation: 'Distribution log-based metrics extract a numeric value from each matching entry and record its distribution, so you can chart percentiles and alert on them. Counters only count entries, uptime checks measure synthetic requests, and a sink does not create metrics.'
  },
  {
    id: 'ace-m5-004',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'A batch job writes a heartbeat metric every five minutes while it runs. You want to be alerted if the heartbeat stops arriving for 15 minutes. Which kind of alert condition should you use?',
    options: [
      'A metric-absence condition on the heartbeat metric',
      'A metric-threshold condition above zero on the metric',
      'An uptime check on the VM running the batch job',
      'A budget alert on the project that runs the job'
    ],
    answer: 0,
    explanation: 'Metric-absence conditions fire when no data arrives for a time series within a duration, which is how missing heartbeats are detected. A threshold condition only evaluates data that exists, an uptime check tests endpoints rather than the job, and budgets track spend.'
  },
  {
    id: 'ace-m5-005',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want a warning before a data disk fills up, based on the current trend, rather than when it is already 95% full. What should the alerting policy use?',
    options: [
      'A metric-threshold condition with a forecast window, such as one day ahead',
      'A metric-absence condition on the disk usage metric of the VM',
      'A log-based alert on "No space left on device" messages',
      'An uptime check on the application that uses the disk'
    ],
    answer: 0,
    explanation: 'Forecast conditions predict whether a metric will cross the threshold within the forecast window and alert ahead of time. Absence conditions detect missing data, and the log message and uptime check only fire after the disk is already full.'
  },
  {
    id: 'ace-m5-006',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Your team is writing new alerting policies with queries in Cloud Monitoring. Which query language does Google recommend for new policies and dashboards?',
    options: ['PromQL', 'Monitoring Query Language (MQL)', 'GoogleSQL', 'The Logging query language'],
    answer: 0,
    explanation: 'PromQL (or the query builder) is the recommended way to query metrics in Cloud Monitoring, for alerting policies and dashboards alike; MQL is no longer recommended and new MQL charts and alerts cannot be created in the console. SQL and the Logging query language serve BigQuery and logs.'
  },
  {
    id: 'ace-m5-007',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'When a particular alert fires, an automated remediation function should run, in addition to paging the on-call engineer. Which notification channel lets code react to the alert?',
    options: [
      'A Pub/Sub notification channel, with the function subscribed to the topic',
      'An SMS notification channel sent to the function’s phone number',
      'An email channel to a mailbox that the function reads every minute',
      'A mobile app channel for the engineer, who then runs the function'
    ],
    answer: 0,
    explanation: 'Pub/Sub (or webhook) notification channels deliver the incident as a message that code can consume, which suits automated remediation, while other channels page people. Reading email or waiting for a person is slower and fragile.'
  },
  {
    id: 'ace-m5-008',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'On-call engineers want each alert to tell them what the alert means and link to the runbook for fixing it. Where should this go?',
    options: [
      'In the documentation field of the alerting policy, which is sent with the notification',
      'In the display name of each notification channel used by the alerting policy',
      'In a label on the monitored resource that triggered the alerting policy',
      'In a separate wiki page that the engineers search for when they are paged'
    ],
    answer: 0,
    explanation: 'Alerting policies have a documentation section (Markdown, with variables) that is included in notifications and incidents, so the runbook travels with the alert. Channel names and resource labels are not shown that way, and a separate wiki has to be found under pressure.'
  },
  {
    id: 'ace-m5-009',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'During a planned two-hour database migration tonight, you expect latency alerts to fire, and you do not want anyone paged. What should you do?',
    options: [
      'Create a snooze for the affected alerting policies covering the maintenance window',
      'Delete the alerting policies and recreate them from memory after the migration',
      'Remove every notification channel from the project for the evening',
      'Raise the thresholds of all alerting policies to their maximum values'
    ],
    answer: 0,
    explanation: 'Snoozes suppress notifications from chosen policies for a time window and end automatically. Deleting policies or channels risks forgetting to restore them, and changing thresholds everywhere affects unrelated alerts.'
  },
  {
    id: 'ace-m5-010',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'A CPU alert keeps opening and closing incidents because short spikes cross the threshold for a few seconds. You only care about sustained high CPU. What should you change?',
    options: [
      'Increase the condition’s duration (retest window), for example to 10 minutes',
      'Lower the threshold so that the alert fires earlier during spikes',
      'Add more notification channels so that the alerts are noticed',
      'Switch the condition to metric absence on the same CPU metric'
    ],
    answer: 0,
    explanation: 'The duration tells the condition how long the threshold must be violated before it fires, filtering out short spikes; aligning the data over a longer period also helps. A lower threshold adds noise, more channels add more pages, and absence conditions detect missing data.'
  },
  {
    id: 'ace-m5-011',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'An internal API is reachable only on a private IP inside your VPC. You want Cloud Monitoring to check its availability from outside the VM, like an uptime check. What should you use?',
    options: [
      'A private uptime check that targets the service through Service Directory',
      'A public uptime check against the VM’s internal IP address',
      'A metric-threshold alert on the VM’s CPU utilization',
      'An external IP on the VM so that a public uptime check works'
    ],
    answer: 0,
    explanation: 'Private uptime checks reach internal endpoints registered in Service Directory, from Google’s checkers, with a firewall rule allowing them. Public checks cannot reach internal IPs, CPU does not show availability, and an external IP needlessly exposes the service.'
  },
  {
    id: 'ace-m5-012',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want to test the complete checkout journey of your web shop — log in, add to cart, pay — every 10 minutes, and alert if any step fails. What should you use?',
    options: [
      'A synthetic monitor in Cloud Monitoring that runs a scripted test of the journey',
      'An HTTP uptime check on the home page with a response content match',
      'A log-based metric on the payment service’s error messages',
      'Cloud Trace on the checkout service with a high sampling rate'
    ],
    answer: 0,
    explanation: 'Synthetic monitors run test scripts, such as Mocha or Puppeteer code deployed as a Cloud Run function, on a schedule and report each step’s result to Cloud Monitoring, where you can alert on it. An uptime check tests one URL, and logs or traces only show what real users experienced.'
  },
  {
    id: 'ace-m5-013',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'The product team agreed that 99.9% of checkout requests should succeed each month. You want alerts when the error budget is being used up too fast. What should you set up?',
    options: [
      'A service-level objective in Cloud Monitoring with a burn-rate alerting policy',
      'An uptime check with a threshold of 99.9% and an email notification',
      'A budget alert at 99.9% of the project’s monthly spend',
      'A log-based metric counting successful requests every minute'
    ],
    answer: 0,
    explanation: 'Cloud Monitoring SLOs define a service-level indicator and target, track the error budget, and support burn-rate alerts that fire when the budget is being consumed faster than planned. Uptime checks, budgets and plain counters do not compute error budgets.'
  },
  {
    id: 'ace-m5-014',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'An application on a VM writes its logs to /var/log/shop/app.log. With the Ops Agent installed, the file does not appear in Cloud Logging. What should you do?',
    options: [
      'Add a files receiver for /var/log/shop/*.log to a logging pipeline in the Ops Agent config.yaml',
      'Enable Data Access audit logs for Compute Engine so that the file is collected',
      'Move the file to Cloud Storage, which the Ops Agent reads from every hour',
      'Restart the VM, because the Ops Agent picks up new files only at boot'
    ],
    answer: 0,
    explanation: 'The Ops Agent collects syslog and some defaults; other files are added as receivers in `/etc/google-cloud-ops-agent/config.yaml` and wired into a pipeline, then the agent is restarted. Audit logs record API calls, and the agent does not read buckets.'
  },
  {
    id: 'ace-m5-015',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'The Ops Agent is installed and running on a VM, but no metrics or logs arrive. The VM runs as a custom service account. What should you check first?',
    options: [
      'That the account has Logs Writer and Monitoring Metric Writer, and that the VM’s access scopes allow them',
      'That the account has Owner on the project, because the agent writes to several services',
      'That the VM has an external IP address, because the agent cannot use Private Google Access',
      'That Data Access audit logs are enabled for Cloud Monitoring in the project'
    ],
    answer: 0,
    explanation: 'The agent writes with the VM’s service account, so it needs `roles/logging.logWriter` and `roles/monitoring.metricWriter`, and the access scopes must not block those APIs. Owner is excessive, Private Google Access works fine, and audit logs are unrelated.'
  },
  {
    id: 'ace-m5-016',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Older VMs still run the separate legacy Logging agent and Monitoring agent. What does Google recommend?',
    options: [
      'Replace them with the Ops Agent, which combines logging and metrics collection',
      'Keep both legacy agents and install the Ops Agent next to them for safety',
      'Remove all agents and rely only on the metrics the hypervisor reports',
      'Replace them with Managed Service for Prometheus on each VM instead'
    ],
    answer: 0,
    explanation: 'The legacy agents are deprecated; the Ops Agent replaces both with a single agent built on Fluent Bit and OpenTelemetry. Running them side by side causes duplicate data, hypervisor metrics miss guest data, and Managed Service for Prometheus targets Prometheus workloads.'
  },
  {
    id: 'ace-m5-017',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Applications on GKE expose Prometheus metrics, and you want them collected into Cloud Monitoring without running your own Prometheus servers. What should you use?',
    options: [
      'Managed Service for Prometheus with managed collection and PodMonitoring resources',
      'The Ops Agent installed on every GKE node through a DaemonSet you maintain',
      'A self-hosted Prometheus server on a VM, scraping the cluster over the internet',
      'Custom metrics written by a cron job that reads each Pod’s metrics endpoint'
    ],
    answer: 0,
    explanation: 'Managed Service for Prometheus’s managed collection (enabled by default on newer GKE clusters) scrapes targets that you describe with PodMonitoring or ClusterPodMonitoring resources and stores the data in Monarch for PromQL queries. The other options mean running and scaling collectors yourself.'
  },
  {
    id: 'ace-m5-018',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Metrics collected by Managed Service for Prometheus must be shown in existing Grafana dashboards and in Cloud Monitoring. Which query language works for both?',
    options: ['PromQL', 'GoogleSQL', 'The Logging query language', 'Cypher'],
    answer: 0,
    explanation: 'Managed Service for Prometheus is queried with PromQL, both in Cloud Monitoring and from Grafana through the Prometheus-compatible API, so existing dashboards keep working. SQL, the Logging query language and Cypher do not query Prometheus metrics.'
  },
  {
    id: 'ace-m5-019',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'A team already runs the Prometheus Operator with many ServiceMonitor rules and wants to keep that configuration while storing data in Google’s managed backend. Which approach fits?',
    options: [
      'Self-deployed collection, replacing the Prometheus binary with Google’s drop-in build',
      'Managed collection only, rewriting every rule as PodMonitoring resources first',
      'The Ops Agent on each node, reading the operator’s rules automatically',
      'Cloud Logging, exporting Prometheus metrics as log entries for analysis'
    ],
    answer: 0,
    explanation: 'Self-deployed collection keeps your existing Prometheus setup and configuration, swapping in a Google-provided Prometheus binary that writes to Managed Service for Prometheus. Managed collection uses its own resources, the Ops Agent does not read operator rules, and logs are not metrics.'
  },
  {
    id: 'ace-m5-020',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want the same operations dashboard in ten projects, defined as code and reviewed in Git. How can you create it?',
    options: [
      'Keep the dashboard as JSON and run `gcloud monitoring dashboards create --config-from-file`',
      'Build it by hand in each project’s console and take a screenshot as documentation',
      'Export each project’s metrics to BigQuery and build one report in a spreadsheet',
      'Create a log sink in each project that copies charts to a central dashboard'
    ],
    answer: 0,
    explanation: 'Dashboards can be defined in JSON (or with Terraform) and created through gcloud or the API, which makes them repeatable and reviewable; a single metrics scope project can also show many projects. Hand-built dashboards drift, and exports or sinks do not create dashboards.'
  },

  // ── Cloud Logging: queries, audit logs, flow logs, buckets, sinks, analytics ──
  {
    id: 'ace-m5-021',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'In the Logs Explorer, you want only error-level and more severe entries from Compute Engine VMs. Which query should you use?',
    options: [
      '`resource.type="gce_instance" AND severity>=ERROR`',
      '`type=vm AND level=error+`',
      '`SELECT * FROM logs WHERE vm AND severity = "ERROR"`',
      '`resource.type="gce_instance" OR severity="ERROR"`'
    ],
    answer: 0,
    explanation: 'The Logging query language filters on fields such as `resource.type` and compares `severity` levels with operators like `>=`. The second line is not the syntax, SQL is used in Log Analytics rather than here, and OR would return all VM logs plus every error.'
  },
  {
    id: 'ace-m5-022',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'A Cloud Run service writes structured JSON logs with an orderId field. You need every entry for order 8812. Which filter finds them?',
    options: ['`jsonPayload.orderId="8812"`', '`textPayload:orderId=8812`', '`labels.orderId="8812"`', '`protoPayload.orderId="8812"`'],
    answer: 0,
    explanation: 'Structured logs are stored in `jsonPayload`, so its fields can be filtered directly. `textPayload` holds unstructured lines, labels are separate metadata, and `protoPayload` is used by audit logs.'
  },
  {
    id: 'ace-m5-023',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You need to find who changed the IAM policy of project ace-prod-123 last week. Which log query fits best?',
    options: [
      '`protoPayload.methodName="SetIamPolicy" AND resource.type="project"` in the Admin Activity audit logs',
      '`severity>=ERROR AND resource.type="project"` in the _Default bucket for the week',
      '`jsonPayload.user="admin" AND textPayload:"IAM"` across all log buckets',
      '`logName:"data_access" AND protoPayload.methodName="GetIamPolicy"` in the project'
    ],
    answer: 0,
    explanation: 'IAM policy changes are Admin Activity audit log entries with method SetIamPolicy; `protoPayload.authenticationInfo.principalEmail` shows who made them. Errors and free text do not identify the change, and GetIamPolicy only reads the policy.'
  },
  {
    id: 'ace-m5-024',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'A Cloud Run service prints plain text lines, and every entry shows up with DEFAULT severity, so error alerts never fire. What is the simplest fix in the code?',
    options: [
      'Write each log line as a JSON object with a severity field to stdout',
      'Write errors to a local file in /var/log so that Cloud Logging finds them',
      'Prefix each error line with the word ERROR in capital letters',
      'Call the Cloud Monitoring API to report each error as a metric'
    ],
    answer: 0,
    explanation: 'Cloud Run parses JSON written to stdout or stderr as structured logs; special fields such as `severity` and `message` are mapped, so entries get the right level and extra fields land in jsonPayload. Local files are not collected, a text prefix is not parsed as severity, and metrics do not fix log levels.'
  },
  {
    id: 'ace-m5-025',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'You enabled Data Access audit logs for Cloud Storage, and the logging bill jumped because a backup service account reads millions of objects. You still need logs for human users. What should you do?',
    options: [
      'Exempt the backup service account in the Data Access audit configuration',
      'Disable Data Access audit logs for Cloud Storage for the whole project',
      'Delete the _Required log bucket to stop storing audit logs at all',
      'Move the bucket to Archive class so that reads are not logged'
    ],
    answer: 0,
    explanation: 'Audit log configurations can exempt specific principals from Data Access logging, keeping logs for everyone else. Disabling them loses the logs you need, the _Required bucket cannot be deleted (and does not hold Data Access logs), and storage class does not affect logging.'
  },
  {
    id: 'ace-m5-026',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want to know when Google Cloud itself performed actions on your resources, such as live-migrating a VM or preempting a Spot VM. Which audit logs record these?',
    options: ['System Event audit logs', 'Data Access audit logs', 'Policy Denied audit logs', 'VPC Flow Logs'],
    answer: 0,
    explanation: 'System Event audit logs record Google Cloud actions that change resources without a user calling an API, such as host maintenance migrations and preemptions; they are always on and free. Data Access logs record reads, Policy Denied logs record security policy denials, and flow logs record network traffic.'
  },
  {
    id: 'ace-m5-027',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Users report access errors to BigQuery from outside a VPC Service Controls perimeter. Which logs show these denials and the policy that caused them?',
    options: ['Policy Denied audit logs', 'Admin Activity audit logs', 'Firewall Rules Logging', 'System Event audit logs'],
    answer: 0,
    explanation: 'Policy Denied audit logs are written when a Google Cloud service denies access because of a security policy violation, such as a VPC Service Controls perimeter, and include the reason. Admin Activity logs record configuration changes, firewall logs record VM connections, and System Event logs record Google actions.'
  },
  {
    id: 'ace-m5-028',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'VPC Flow Logs on a busy subnet are expensive, but the network team only needs approximate traffic patterns. How can you reduce the volume?',
    options: [
      'Lower the sampling rate and use a longer aggregation interval for the subnet’s flow logs',
      'Turn on flow logs for every subnet so that the cost is spread more evenly',
      'Enable Firewall Rules Logging instead, which records the same data for free',
      'Move the subnet to the Standard network tier, which halves flow log volume'
    ],
    answer: 0,
    explanation: 'Flow logs support sampling (for example 0.1) and aggregation intervals (up to 15 minutes), plus metadata and filter options, which cut volume while keeping patterns visible. More subnets add cost, firewall logs record rule hits rather than all flows, and network tier does not affect flow logs.'
  },
  {
    id: 'ace-m5-029',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'Which question can VPC Flow Logs help you answer?',
    options: [
      'Which VMs talk to which IP addresses and ports, and how much they send',
      'What the HTTP request bodies sent to a web server contained',
      'Which user changed a firewall rule yesterday afternoon',
      'Why a Cloud SQL query is slow during peak hours'
    ],
    answer: 0,
    explanation: 'Flow logs record samples of network flows — 5-tuple, bytes, packets and metadata — for monitoring, forensics and cost analysis. They do not capture payloads (Packet Mirroring does), configuration changes are in audit logs, and Query Insights explains slow queries.'
  },
  {
    id: 'ace-m5-030',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want to know whether the firewall rule deny-legacy is still blocking any connections before you delete it. What should you do?',
    options: [
      'Enable logging on that rule and check its log entries for denied connections',
      'Enable VPC Flow Logs on the network, which also logs firewall decisions',
      'Look at the rule’s creation time in the Admin Activity audit logs',
      'Delete the rule and watch for complaints from the application teams'
    ],
    answer: 0,
    explanation: 'Firewall Rules Logging (`gcloud compute firewall-rules update deny-legacy --enable-logging`) records each connection the rule allows or denies; Firewall Insights also flags unused rules. Flow logs do not attribute traffic to rules, audit logs show changes, and deleting blindly risks exposure.'
  },
  {
    id: 'ace-m5-031',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Application logs must be stored in Jakarta for data residency and kept for 180 days. What should you create?',
    options: [
      'A log bucket in asia-southeast2 with 180-day retention, and a sink routing the logs to it',
      'A Cloud Storage bucket in Jakarta, because log buckets are always stored in the global location',
      'A longer retention on the _Required bucket, whose location can be changed at any time',
      'A BigQuery dataset in the US with a 180-day table expiration on every table'
    ],
    answer: 0,
    explanation: 'User-defined log buckets can be created in a chosen region with a custom retention (`gcloud logging buckets create --location=asia-southeast2 --retention-days=180`), and a sink routes logs to them. A bucket’s location cannot change after creation, the _Required bucket is fixed, and a US dataset breaks residency.'
  },
  {
    id: 'ace-m5-032',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'A central log bucket holds logs from many teams. Each team must see only the logs of its own projects in that bucket. What should you configure?',
    options: [
      'A log view per team on the bucket with a filter on its projects, granting Logs View Accessor on that view',
      'Logs Viewer on the whole central project for every team, with a reminder to look only at their own logs',
      'A copy of the central bucket for each team, refreshed nightly by a scheduled job',
      'An exclusion filter on the bucket for each team, which hides other teams’ logs'
    ],
    answer: 0,
    explanation: 'Log views expose a filtered subset of a bucket, and `roles/logging.viewAccessor` can be granted on a specific view, so teams see only their entries. Project-wide Logs Viewer shows everything, copies cost money and lag, and exclusions drop logs for everyone.'
  },
  {
    id: 'ace-m5-033',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Logs from an application project should also be stored in a log bucket in the central security project. What should you create?',
    options: [
      'A sink in the application project whose destination is the central project’s log bucket',
      'A metrics scope in the central project that lists the application project',
      'An aggregated sink on the application project with --include-children',
      'A log view in the application project granted to the security team'
    ],
    answer: 0,
    explanation: 'Sinks can route matching logs to a log bucket in another project (or to that project’s Log Router), as well as to BigQuery, Cloud Storage or Pub/Sub. Metrics scopes cover metrics, aggregated sinks are created on folders or organizations, and a view grants access in place rather than storing a copy centrally.'
  },
  {
    id: 'ace-m5-034',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'You created a sink that routes logs to a BigQuery dataset in another project, but no tables appear. What is most likely missing?',
    options: [
      'Permission for the sink’s writer identity to write to the dataset, for example BigQuery Data Editor',
      'An exclusion filter on the sink, because sinks without exclusions are paused by default',
      'Data Access audit logs for BigQuery, which sinks need before they can export anything',
      'A Pub/Sub topic between the sink and BigQuery, because sinks cannot write directly'
    ],
    answer: 0,
    explanation: 'Each sink writes with its own writer identity (a service account), which must be granted access on the destination — here BigQuery Data Editor on the dataset; the console does this for same-project destinations. Sinks are not paused without exclusions, need no audit logs, and write to BigQuery directly.'
  },
  {
    id: 'ace-m5-035',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'A service produces huge volumes of INFO logs. You want to keep about 10% of them for trend analysis and drop the rest before they are stored. What should you add to the _Default sink?',
    options: [
      'An exclusion filter matching those entries with `sample(insertId, 0.9)`',
      'An inclusion filter with `severity=INFO` and nothing else',
      'A shorter retention of one day on the _Default bucket',
      'A log view that shows only 10% of the INFO entries'
    ],
    answer: 0,
    explanation: 'Exclusion filters can use the `sample()` function, so excluding a 0.9 sample keeps roughly 10% of matching entries and drops the rest before storage. An inclusion filter keeps them all, retention only shortens how long they are stored, and views do not reduce what is stored.'
  },
  {
    id: 'ace-m5-036',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Analysts want to query application logs with SQL, joined with business data in BigQuery, without exporting them through a separate pipeline. What should you do?',
    options: [
      'Upgrade the log bucket to use Log Analytics and create a linked BigQuery dataset',
      'Create a log-based metric for each column that the analysts need to query',
      'Download the logs as CSV every day and load them into BigQuery by hand',
      'Point BigQuery at the _Required bucket, which BigQuery can read natively'
    ],
    answer: 0,
    explanation: 'Log Analytics lets you query a log bucket with SQL in the console, and a linked dataset exposes the same logs to BigQuery for joins, without copying them. Metrics aggregate rather than keep rows, manual exports are fragile, and the _Required bucket cannot be linked this way.'
  },
  {
    id: 'ace-m5-037',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'The security team’s on-premises SIEM must receive Google Cloud audit logs in near real time. What is the usual way to export them?',
    options: [
      'A sink to a Pub/Sub topic that the SIEM, or a Dataflow pipeline, pulls from',
      'A sink to Cloud Storage that the SIEM downloads as files once a day',
      'A daily export of the _Required bucket to CSV files for the SIEM',
      'An uptime check that posts each new log entry to the SIEM endpoint'
    ],
    answer: 0,
    explanation: 'Routing logs to Pub/Sub gives a streaming feed; many SIEMs pull from Pub/Sub directly, and Google provides Dataflow templates such as Pub/Sub to Splunk. Cloud Storage sinks are batched hourly files rather than near real time, and the other options do not export logs.'
  },
  {
    id: 'ace-m5-038',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'All logs from projects under the Regulated folder must go only to a central bucket, and must not also be stored in each project’s own _Default bucket. What should you create?',
    options: [
      'An intercepting aggregated sink on the folder, with --include-children and --intercept-children',
      'A regular aggregated sink on the folder, which removes logs from the projects automatically',
      'A sink in each project with an exclusion filter for every log on the _Default sink',
      'A log view on the central bucket that hides the projects’ own copies of the logs'
    ],
    answer: 0,
    explanation: 'An intercepting aggregated sink routes matching logs from child resources to its destination and stops them from going through the children’s own sinks (except _Required). A regular aggregated sink copies logs while they still go to project buckets, per-project exclusions are hard to maintain, and views do not change storage.'
  },
  {
    id: 'ace-m5-039',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'What is true about the _Required log bucket in every project?',
    options: [
      'It stores Admin Activity, System Event and some other logs for 400 days, and it cannot be changed or deleted',
      'It stores every log in the project for 30 days, and its retention can be changed freely',
      'It is empty by default and must be filled by a sink that you create yourself',
      'It stores Data Access audit logs only, and it is deleted when billing is disabled'
    ],
    answer: 0,
    explanation: 'The _Required bucket holds Admin Activity, System Event and Access Transparency logs (among others) for 400 days at no charge; its retention and sink cannot be modified. Other logs go to the _Default bucket, whose retention is configurable.'
  },
  {
    id: 'ace-m5-040',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want an alert, with at most one notification every 10 minutes, whenever a log entry with the message "PAYMENT_PROVIDER_DOWN" appears. What is the simplest option?',
    options: [
      'A log-based alerting policy with a filter on the message and a notification rate limit',
      'A distribution log-based metric with a forecast alerting condition on it',
      'A log sink to BigQuery and a scheduled query that emails the result',
      'An uptime check that searches the payment page for the message text'
    ],
    answer: 0,
    explanation: 'Log-based alerting policies fire when matching log entries appear and let you limit how often notifications are sent; a counter log-based metric is the alternative for count thresholds. Distributions and forecasts are for numeric values, a scheduled query is slow, and an uptime check sees only the page.'
  },
  {
    id: 'ace-m5-041',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'hard',
    prompt: 'A service logs exceptions as plain messages such as "Payment failed", but Error Reporting shows nothing. What should the service log so that errors are grouped in Error Reporting?',
    options: [
      'Entries at ERROR severity that include the exception’s stack trace (or a ReportedErrorEvent)',
      'Entries at DEBUG severity, which Error Reporting scans for the word "failed"',
      'Metrics written to Cloud Monitoring with the name of each exception class',
      'Trace spans in Cloud Trace marked with the error status code'
    ],
    answer: 0,
    explanation: 'Error Reporting analyses log entries that contain a stack trace or use the ReportedErrorEvent format (or calls to its API), grouping them by cause. Plain messages, debug logs, metrics and trace spans are not turned into error groups.'
  },
  {
    id: 'ace-m5-042',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Which logging usage is normally charged?',
    options: [
      'Ingestion into log buckets beyond the free allotment, and retention beyond 30 days',
      'Storing Admin Activity audit logs in the _Required bucket for 400 days',
      'Writing System Event audit logs for live migrations and preemptions',
      'Reading logs in the Logs Explorer, which is billed per query that runs'
    ],
    answer: 0,
    explanation: 'Cloud Logging charges for ingestion into buckets (after a monthly free allotment) and for retention beyond 30 days in user-controlled buckets. The _Required bucket’s logs, including Admin Activity and System Event logs, are free, and querying in the Logs Explorer is not billed per query.'
  },
  {
    id: 'ace-m5-043',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'From a terminal, you want the 50 most recent ERROR entries of the last hour in the current project. Which command should you run?',
    options: [
      '`gcloud logging read "severity>=ERROR" --freshness=1h --limit=50`',
      '`gcloud logging logs list --severity=ERROR --last=1h`',
      '`gcloud logging sinks describe _Default --errors=50`',
      '`gcloud monitoring logs tail --level=ERROR --count=50`'
    ],
    answer: 0,
    explanation: '`gcloud logging read` runs a Logging query, with `--freshness` limiting the time range and `--limit` the number of entries. `logs list` lists log names, `sinks describe` shows a sink, and the last command does not exist.'
  },
  {
    id: 'ace-m5-044',
    section: 'operating',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You need the logs of the checkout container in GKE, across all of its Pods. Which filter should you use in the Logs Explorer?',
    options: [
      '`resource.type="k8s_container" AND resource.labels.container_name="checkout"`',
      '`resource.type="gce_instance" AND labels.container="checkout"`',
      '`resource.type="gke_cluster" AND textPayload:"checkout"`',
      '`logName="checkout" AND resource.type="k8s_node"`'
    ],
    answer: 0,
    explanation: 'Container logs from GKE use the k8s_container resource type, labelled with cluster, namespace, Pod and container names. Nodes and the cluster have their own resource types, and a text search on the cluster resource would miss container logs.'
  },

  // ── Active Assist, Cloud Hub, Service Health and Gemini Cloud Assist ──
  {
    id: 'ace-m5-045',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'easy',
    prompt: 'Many VMs seem oversized for their workloads. You want Google Cloud to suggest smaller machine types based on observed CPU and memory use. Where do you find this?',
    options: [
      'In the VM rightsizing recommendations of Active Assist (Recommender)',
      'In the Billing reports, grouped by machine type for the month',
      'In the Quotas page for CPUs in each region',
      'In VPC Flow Logs for each VM’s network interface'
    ],
    answer: 0,
    explanation: 'Active Assist’s machine type recommender analyses utilization and suggests smaller or larger machine types with estimated savings (memory data comes from the Ops Agent). Billing, quotas and flow logs do not recommend sizes.'
  },
  {
    id: 'ace-m5-046',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'The organization has hundreds of projects, and you suspect many were abandoned by teams that left. Which recommender helps identify them?',
    options: [
      'The unattended project recommender',
      'The idle VM recommender',
      'The IAM role recommender',
      'The committed use recommender'
    ],
    answer: 0,
    explanation: 'The unattended project recommender looks at usage and activity to flag projects that are probably abandoned, suggesting cleanup or a new owner. The others look at idle VMs, unused permissions and commitment opportunities.'
  },
  {
    id: 'ace-m5-047',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'FinOps wants a weekly report of all cost-saving recommendations across the organization, analysed with SQL. What should you set up?',
    options: [
      'The Recommender export to BigQuery through the BigQuery Data Transfer Service',
      'A sink of Admin Activity audit logs to BigQuery with a weekly query',
      'The detailed billing export, which contains every recommendation',
      'A Cloud Asset Inventory feed of recommendations to Pub/Sub'
    ],
    answer: 0,
    explanation: 'Recommendations and insights can be exported to BigQuery on a schedule with the Data Transfer Service, giving an organization-wide table to query. Audit logs and the billing export do not hold recommendations, and asset feeds track resource changes.'
  },
  {
    id: 'ace-m5-048',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You want to know quickly when a Google Cloud incident, such as a regional Cloud SQL issue, affects the products and locations your projects actually use. What should you use?',
    options: [
      'Personalized Service Health, with alerts on service health events',
      'A Cloud Monitoring uptime check against status.cloud.google.com',
      'Data Access audit logs for every Google Cloud service',
      'Error Reporting, which shows errors from Google’s own services'
    ],
    answer: 0,
    explanation: 'Personalized Service Health shows Google Cloud incidents relevant to your projects and can notify you through Cloud Monitoring alerting policies or its API. Polling the public status page is coarse, audit logs record your API calls, and Error Reporting groups your application’s errors.'
  },
  {
    id: 'ace-m5-049',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'During an outage, how do Personalized Service Health and your own Cloud Monitoring alerts complement each other?',
    options: [
      'Service Health reports problems on Google’s side, while your alerts show the impact on your workloads',
      'Service Health replaces your alerts, because every outage is caused by Google',
      'Your alerts report Google incidents, while Service Health reports your application errors',
      'They are the same data, shown on two different pages of the console'
    ],
    answer: 0,
    explanation: 'Service Health tells you whether Google Cloud has a known incident in the products and regions you use; your own metrics and alerts show what your users experience. Seeing both helps decide whether to wait, fail over or debug your own change.'
  },
  {
    id: 'ace-m5-050',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'An operations lead wants one place in the console that brings together application health, recent deployments, upcoming maintenance, quota issues and open support cases. What should they use?',
    options: ['Cloud Hub', 'Cloud Asset Inventory', 'The Billing console', 'The Logs Explorer'],
    answer: 0,
    explanation: 'Cloud Hub is a central console view that brings together deployments, health, troubleshooting, optimization, maintenance, quotas and support cases for your applications, building on App Hub. Asset Inventory lists resources, Billing shows cost, and the Logs Explorer searches logs.'
  },
  {
    id: 'ace-m5-051',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A service started returning errors after a change, and you want an AI-assisted root-cause analysis that looks across logs, metrics and recent configuration changes. What should you start?',
    options: [
      'A Gemini Cloud Assist investigation for the affected resources',
      'A Gemini Code Assist chat session inside your local IDE',
      'A Recommender export to BigQuery for the affected project',
      'A Cloud Asset Inventory export of the affected resources'
    ],
    answer: 0,
    explanation: 'Gemini Cloud Assist investigations gather signals such as logs, metrics, errors and changes for the resources involved and suggest likely causes and fixes. Code Assist helps write code, and Recommender or asset exports do not analyse an incident.'
  },
  {
    id: 'ace-m5-052',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'An engineer who does not know PromQL wants a chart of the 95th percentile request latency per Cloud Run service. How can Gemini Cloud Assist help in Cloud Monitoring?',
    options: [
      'By generating the query from a plain-language description, for the engineer to review',
      'By replacing Cloud Monitoring charts with text answers that need no queries',
      'By installing the Ops Agent on Cloud Run so that latency is collected',
      'By exporting the latency metrics to BigQuery and writing SQL instead'
    ],
    answer: 0,
    explanation: 'Gemini Cloud Assist can turn a natural-language request into a metrics query (such as PromQL) and explain charts, which the engineer then checks and saves. It does not replace charts, Cloud Run needs no agent, and an export is unnecessary.'
  },
  {
    id: 'ace-m5-053',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'Your steady Compute Engine usage has grown over the past year, and you wonder whether committing to some of it would save money. Which tool gives a data-based suggestion?',
    options: [
      'The committed use discount recommendations in Active Assist',
      'The pricing calculator, filled in with last year’s usage by hand',
      'The quota adjuster, which raises commitments automatically',
      'The idle VM recommender, which lists VMs to commit to'
    ],
    answer: 0,
    explanation: 'Active Assist analyses your historical usage and recommends commitments with the expected savings. The calculator works but relies on your own estimates, the quota adjuster raises quotas, and the idle VM recommender finds waste rather than commitments.'
  },
  {
    id: 'ace-m5-054',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'To monitor and manage applications as a whole — not as loose resources — you want to group the load balancer, Cloud Run services and database of each app across projects. What should you use?',
    options: [
      'App Hub, registering the services and workloads into applications',
      'Resource labels with the application name on each resource',
      'A separate folder for each application’s resources',
      'A metrics scope that contains every project'
    ],
    answer: 0,
    explanation: 'App Hub models applications from their services and workloads, even across projects, and products such as Cloud Hub and Application Design Center build on it. Labels and folders organise resources but do not define applications, and a metrics scope only aggregates metrics.'
  },

  // ── Diagnostics: Cloud Trace, Cloud Profiler, Query Insights, index advisor ──
  {
    id: 'ace-m5-055',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'easy',
    prompt: 'A request passes through five microservices, and users report that checkout is slow. You need to see how long each service takes for the same request. What should you use?',
    options: ['Cloud Trace', 'Cloud Profiler', 'Error Reporting', 'VPC Flow Logs'],
    answer: 0,
    explanation: 'Cloud Trace records distributed traces — spans for each hop of a request with their timing — so you can see which service adds the latency. Profiler shows CPU and memory use inside code, Error Reporting groups exceptions, and flow logs record network flows.'
  },
  {
    id: 'ace-m5-056',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You are adding tracing to services written in several languages and want a vendor-neutral standard that sends traces to Cloud Trace. What should you use?',
    options: [
      'OpenTelemetry instrumentation with an exporter or collector for Google Cloud',
      'Custom metrics written with the Cloud Monitoring API for each request',
      'Structured log lines containing the start and end time of each call',
      'Firewall Rules Logging with metadata on every service’s rules'
    ],
    answer: 0,
    explanation: 'OpenTelemetry is the open standard for traces (and metrics and logs), with SDKs for many languages and exporters or a collector that send data to Cloud Trace. Metrics and logs lose the parent–child span structure, and firewall logs know nothing about requests.'
  },
  {
    id: 'ace-m5-057',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You want a first look at request latency of a Cloud Run service before instrumenting its code. What do you get without changing anything?',
    options: [
      'Request traces for sampled incoming requests in Cloud Trace, plus latency metrics in Cloud Monitoring',
      'Nothing at all, because Cloud Run sends no latency data until the code is instrumented',
      'Full spans for every database call and outgoing HTTP request inside the code',
      'CPU and heap profiles of the container, produced by Cloud Profiler automatically'
    ],
    answer: 0,
    explanation: 'Cloud Run reports request latency metrics and sends traces for sampled incoming requests, which shows how long requests take end to end. Spans for calls made inside your code need instrumentation such as OpenTelemetry, and profiles need the Profiler agent.'
  },
  {
    id: 'ace-m5-058',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A long-running service’s memory keeps growing in production, and you want to find which functions allocate the most memory, with little overhead. What should you use?',
    options: [
      'Cloud Profiler, looking at heap profiles over time',
      'Cloud Trace, looking at the slowest requests',
      'Cloud Logging, searching for out-of-memory messages',
      'Uptime checks, measuring response times hourly'
    ],
    answer: 0,
    explanation: 'Cloud Profiler continuously samples production code with low overhead and shows CPU, heap and allocation profiles by function, which points at the code responsible. Traces show request latency, logs show symptoms, and uptime checks only test availability.'
  },
  {
    id: 'ace-m5-059',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You added the Cloud Profiler agent library to a service running on a VM, but no profiles appear. What should you check?',
    options: [
      'That the Profiler API is enabled and the service account has the Cloud Profiler Agent role',
      'That the VM has an external IP address, because Profiler needs one to upload data',
      'That Data Access audit logs are enabled for Cloud Profiler in the project',
      'That the VM runs the Ops Agent, which uploads profiles on the library’s behalf'
    ],
    answer: 0,
    explanation: 'The Profiler agent uploads with the workload’s credentials, so the Cloud Profiler API must be enabled and the identity needs `roles/cloudprofiler.agent`. No external IP is required with Private Google Access or NAT, and profiles do not depend on audit logs or the Ops Agent.'
  },
  {
    id: 'ace-m5-060',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A Cloud SQL for PostgreSQL instance shows high CPU every afternoon. You want to see which queries cause the most load, with their plans. What should you open?',
    options: [
      'Query Insights for the Cloud SQL instance',
      'Cloud Trace for the database instance',
      'VPC Flow Logs for the database subnet',
      'The Cloud SQL backups list for the instance'
    ],
    answer: 0,
    explanation: 'Query Insights shows database load by query, normalized query text, execution plans and wait events, so you can find the expensive statements. Traces show application spans, flow logs show network traffic, and backups have no query data.'
  },
  {
    id: 'ace-m5-061',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'hard',
    prompt: 'Query Insights shows a slow query, but many application routes run similar SQL. You want to see which application route or controller sent each query. What should you add?',
    options: [
      'Tags from the application through sqlcommenter, which Query Insights uses to break load down',
      'A separate Cloud SQL user for every route, so that load can be grouped by user name',
      'A read replica for each route, so each one’s queries run on their own instance',
      'A log-based metric that counts every query in the database’s error log'
    ],
    answer: 0,
    explanation: 'Query Insights can show load by application tags such as route, controller or framework, added to SQL as comments by the open-source sqlcommenter libraries. Separate users or replicas per route are heavy workarounds, and error logs do not cover successful queries.'
  },
  {
    id: 'ace-m5-062',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'Several slow queries on a Cloud SQL Enterprise Plus database scan whole tables. You want specific suggestions for which indexes to add and how much they would help. What should you use?',
    options: [
      'The index advisor in Query Insights',
      'The Recommender for idle resources',
      'Cloud Profiler on the database VM',
      'A larger machine type for the instance'
    ],
    answer: 0,
    explanation: 'The index advisor analyses the workload and recommends indexes for slow queries, with the estimated improvement (AlloyDB offers one too). Recommender for idle resources is about cost, you cannot profile the managed database host, and a bigger machine hides the problem.'
  },
  {
    id: 'ace-m5-063',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A BigQuery query became slow, and you want to see which stage takes the longest and whether data is skewed between workers. Where can you see this?',
    options: [
      'The query’s execution graph (query plan) in the job details',
      'The table’s schema page in the BigQuery console',
      'The dataset’s sharing settings in BigQuery',
      'The project’s Billing reports for the last month'
    ],
    answer: 0,
    explanation: 'The execution graph shows each stage of a finished or running query with timings, slot usage, rows processed and signs of skew, which points at the expensive step. Schemas, sharing settings and billing do not show query execution.'
  },
  {
    id: 'ace-m5-064',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'hard',
    prompt: 'A Bigtable table has uneven latency, and you suspect a hotspot caused by the row key design. Which tool shows how reads and writes are spread across the key space over time?',
    options: ['Key Visualizer for Bigtable', 'Query Insights for Cloud SQL', 'Cloud Trace on the client', 'VPC Flow Logs on the cluster'],
    answer: 0,
    explanation: 'Key Visualizer produces heatmaps of access patterns across row key ranges over time, making hotspots and poor key design visible. Query Insights is for Cloud SQL and AlloyDB, traces show client latency, and flow logs show network flows.'
  },
  {
    id: 'ace-m5-065',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'While looking at a slow trace in Cloud Trace, you want to jump straight to the log entries written while that request was handled. What must the logs contain?',
    options: [
      'The trace ID in each entry’s trace field, so logs are correlated with the trace',
      'The word "trace" somewhere in the message text of every log line',
      'A label with the VM’s name and zone on every single log entry',
      'Nothing, because Cloud Trace stores the log lines of each request itself'
    ],
    answer: 0,
    explanation: 'When a log entry’s `trace` (and `spanId`) fields carry the request’s trace context, Cloud Logging and Cloud Trace link them, so you can open the logs of a trace and the other way round. Text or VM labels do not correlate requests, and Trace does not store logs.'
  },
  {
    id: 'ace-m5-066',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'easy',
    prompt: 'You want to be notified when a new kind of exception starts appearing in a production service, without writing one alert per error message. What should you use?',
    options: [
      'Error Reporting notifications for new error groups',
      'An uptime check with a content match on the home page',
      'A budget alert at 50% of the project’s monthly budget',
      'A Cloud Asset Inventory feed of the service’s resources'
    ],
    answer: 0,
    explanation: 'Error Reporting groups exceptions by cause and can notify you when a new error group appears or an old one resurfaces. Uptime checks test availability, budgets track spend, and asset feeds track configuration changes.'
  },

  // ── Job and workload status ──
  {
    id: 'ace-m5-067',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A nightly BigQuery load failed and you need its error message from the command line. Which commands help?',
    options: [
      '`bq ls -j -a` to find the job, then `bq show -j JOB_ID` to see its status and errors',
      '`bq ls -d` to list datasets, then `bq head` on the table that was being loaded',
      '`gcloud logging sinks list` to find the job, then `bq rm -j` to retry it',
      '`gcloud dataflow jobs list` to find the job, then `bq cancel` to see its error'
    ],
    answer: 0,
    explanation: '`bq ls -j` lists jobs (`-a` includes all users’ jobs) and `bq show -j` prints a job’s configuration, status and error result. Listing datasets or reading the table does not show the failure, sinks are unrelated, and BigQuery jobs are not Dataflow jobs.'
  },
  {
    id: 'ace-m5-068',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You want a SQL report of last week’s BigQuery jobs in the US multi-region, showing who ran them, how many bytes they billed, and which failed. Where can you query this?',
    options: [
      'The region-us INFORMATION_SCHEMA.JOBS view',
      'The _Required log bucket with the Logs Explorer',
      'The Cloud Asset Inventory BigQuery export',
      'The detailed billing export, filtered on BigQuery'
    ],
    answer: 0,
    explanation: 'INFORMATION_SCHEMA.JOBS (for example `region-us`.INFORMATION_SCHEMA.JOBS) holds metadata for recent jobs — user, bytes billed, slot use, state and errors — queryable with SQL. Audit logs and billing data hold parts of this but are less convenient, and Asset Inventory does not track jobs.'
  },
  {
    id: 'ace-m5-069',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A streaming Dataflow job is running, but dashboards show stale data. Which job metrics tell you whether the pipeline is falling behind?',
    options: [
      'System lag and data freshness on the job’s metrics page',
      'The number of BigQuery tables in the output dataset',
      'The Compute Engine quota for CPUs in the region',
      'The size of the Pub/Sub topic’s schema definition'
    ],
    answer: 0,
    explanation: 'System lag (how long data waits to be processed) and data freshness (how old the newest fully processed data is) reveal a backlog, alongside the throughput of each step. Table counts, quotas and schemas do not measure lag.'
  },
  {
    id: 'ace-m5-070',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'A Dataflow job failed, and you need the worker logs that explain the exception. Where are they?',
    options: [
      'In Cloud Logging, from the job’s logs panel or with the Dataflow job resource types',
      'Only on the worker VMs’ disks, which you must SSH into after the job fails',
      'In the Pub/Sub dead-letter topic that every Dataflow job creates automatically',
      'In the BigQuery dataset that the job was writing its output data to'
    ],
    answer: 0,
    explanation: 'Dataflow sends job and worker logs to Cloud Logging (with resource types such as dataflow_step), and the job page shows them by step. Worker VMs are temporary, Dataflow does not create dead-letter topics for logs, and output datasets hold data rather than logs.'
  },
  {
    id: 'ace-m5-071',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'easy',
    prompt: 'You took over a project and need an inventory of its GKE clusters and the Deployments running in one of them. Which commands help?',
    options: [
      '`gcloud container clusters list`, then `kubectl get deployments --all-namespaces` on the cluster',
      '`gcloud compute instances list`, then `kubectl describe nodes` on each of the VMs',
      '`gcloud run services list`, then `kubectl get services --all-namespaces` on each service',
      '`gcloud asset feeds list`, then `kubectl get events --all-namespaces` on the cluster'
    ],
    answer: 0,
    explanation: '`gcloud container clusters list` shows the clusters with location, version and status, and after get-credentials, `kubectl get deployments -A` lists the workloads (the GKE Workloads page shows the same). VM lists show nodes, not workloads, and the other commands list Cloud Run services or feeds.'
  },
  {
    id: 'ace-m5-072',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'You want to see which GKE nodes are under the most CPU and memory pressure right now. Which command shows it?',
    options: ['`kubectl top nodes`', '`kubectl get nodes --show-labels`', '`kubectl describe deployments`', '`gcloud container node-pools list`'],
    answer: 0,
    explanation: '`kubectl top nodes` (and `kubectl top pods`) shows current CPU and memory usage from the metrics server. `get nodes` lists nodes and labels, `describe deployments` shows workload specs, and `node-pools list` shows pool configuration.'
  },
  {
    id: 'ace-m5-073',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'easy',
    prompt: 'You need a list of the Cloud Run services in asia-southeast2 and the revisions of the service shop. Which commands should you run?',
    options: [
      '`gcloud run services list --region=REGION`, then `gcloud run revisions list --service=shop`',
      '`gcloud container clusters list`, then `kubectl get revisions -n shop --all`',
      '`gcloud functions list --gen2`, then `gcloud functions describe shop --revisions`',
      '`gcloud run jobs list --region=REGION`, then `gcloud run jobs describe shop`'
    ],
    answer: 0,
    explanation: '`gcloud run services list` inventories services, and `gcloud run revisions list --service` shows each revision with its creation time and whether it is serving. Cloud Run is not a GKE cluster you query with kubectl, and functions or jobs are different resources.'
  },
  {
    id: 'ace-m5-074',
    section: 'operating',
    topic: 'Diagnostics & AI-assisted ops',
    difficulty: 'medium',
    prompt: 'After an incident, you must confirm which revisions of the Cloud Run service shop are receiving traffic, with what percentages, and which image each one runs. What should you run?',
    options: [
      '`gcloud run services describe shop --region=asia-southeast2`',
      '`gcloud run services logs read shop --region=asia-southeast2`',
      '`gcloud artifacts docker images list --include-tags`',
      '`gcloud run services update-traffic shop --to-latest`'
    ],
    answer: 0,
    explanation: '`services describe` prints the service’s traffic split by revision and tag, along with the revisions’ configuration and image digests. Logs show requests, the image list shows registry contents, and update-traffic would change the split rather than report it.'
  },

  // ── Infrastructure as code: Terraform, Helm, Config Connector, Fabric FAST ──
  {
    id: 'ace-m5-075',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'easy',
    prompt: 'You wrote your first Terraform configuration for a VPC and a VM. In which order do you run the basic commands?',
    options: [
      '`terraform init`, then `terraform plan`, then `terraform apply`',
      '`terraform apply`, then `terraform init`, then `terraform plan`',
      '`terraform plan`, then `terraform apply`, then `terraform init`',
      '`terraform validate`, then `terraform destroy`, then `terraform apply`'
    ],
    answer: 0,
    explanation: '`init` prepares the working directory (providers, backend), `plan` shows what will change, and `apply` makes the changes after confirmation. `destroy` removes everything the configuration manages, so it is not part of creating resources.'
  },
  {
    id: 'ace-m5-076',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'easy',
    prompt: 'What does `terraform init` do in a new working directory?',
    options: [
      'Downloads the providers and modules the configuration needs and configures the state backend',
      'Creates every resource in the configuration and records them in the state file',
      'Shows the changes that Terraform would make, without changing any resource',
      'Deletes all resources that are not described in the configuration files'
    ],
    answer: 0,
    explanation: '`terraform init` installs providers (such as hashicorp/google) and modules and sets up the backend where state is kept. Creating resources is `apply`, previewing is `plan`, and Terraform never deletes unmanaged resources.'
  },
  {
    id: 'ace-m5-077',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Several engineers run Terraform against the same project, and state files on laptops keep diverging. What should you configure?',
    options: [
      'A gcs backend that stores the state in a Cloud Storage bucket, with state locking',
      'A Git repository that holds the state file, committed after every run',
      'A shared Cloud Shell session that all engineers use to run Terraform',
      'A separate state file for each engineer, merged together every week'
    ],
    answer: 0,
    explanation: 'The gcs backend keeps state in a bucket (best with Object Versioning) and locks it during operations, so everyone works from the same state without running at the same time. State in Git leaks secrets and conflicts, a shared session is fragile, and merged state files corrupt easily. Infrastructure Manager also manages state for you.'
  },
  {
    id: 'ace-m5-078',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A temporary test environment was created with Terraform, and everything it created must now be removed. What should you run?',
    options: [
      '`terraform destroy` in the same working directory and state',
      '`terraform init -upgrade` to reset the environment',
      '`gcloud projects delete` on the shared project',
      '`terraform plan -out=remove.tfplan` and nothing else'
    ],
    answer: 0,
    explanation: '`terraform destroy` plans and removes every resource tracked in the state, after confirmation. `init -upgrade` updates providers, deleting a shared project removes far more than the environment, and `plan` alone changes nothing.'
  },
  {
    id: 'ace-m5-079',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A Cloud Storage bucket was created by hand, and you now want Terraform to manage it without recreating it. What should you do?',
    options: [
      'Write its resource block and bring it into state with an import block or `terraform import`',
      'Write its resource block and run `terraform apply`, which adopts existing resources by name',
      'Delete the bucket and let Terraform recreate it, because import is not supported',
      'Add the bucket’s name to a .tfignore file so that Terraform tracks it'
    ],
    answer: 0,
    explanation: 'Importing records an existing resource in the state under a resource address, so later plans manage it instead of creating a duplicate. A plain apply would try to create a bucket with the same name and fail, deletion loses data, and there is no .tfignore.'
  },
  {
    id: 'ace-m5-080',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Someone changed a firewall rule in the console that Terraform manages. What happens at the next `terraform plan`?',
    options: [
      'Terraform detects the drift and plans to change the rule back to the configuration',
      'Terraform ignores the change, because it only compares against the old state file',
      'Terraform updates the configuration files to match the console change',
      'Terraform deletes the rule, because it was modified outside of Terraform'
    ],
    answer: 0,
    explanation: 'Plan refreshes the real state of managed resources and shows the changes needed to match the configuration, so drift is reverted on apply unless you update the code. Terraform never rewrites your configuration files, and it does not delete resources just because they were edited.'
  },
  {
    id: 'ace-m5-081',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A resource you want to create in Terraform uses a feature that is still in beta in Google Cloud. What should you use?',
    options: [
      'The google-beta provider for that resource',
      'The google provider with `beta = true` on every resource',
      'A local-exec provisioner running `gcloud alpha`',
      'Terraform Cloud, which enables beta features'
    ],
    answer: 0,
    explanation: 'Beta fields and resources are available through the google-beta provider, which can be used alongside the google provider for specific resources. There is no beta flag on resources, shelling out to gcloud loses state management, and Terraform Cloud does not change the provider.'
  },
  {
    id: 'ace-m5-082',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Every team builds VPCs, GKE clusters and projects with slightly different Terraform. You want reusable, Google-maintained building blocks. What should you use?',
    options: [
      'Terraform modules, such as the Cloud Foundation Toolkit modules',
      'Copies of one team’s main.tf pasted into every repository',
      'Bash scripts of gcloud commands that teams run by hand',
      'One huge configuration that every team edits directly'
    ],
    answer: 0,
    explanation: 'Modules package resources behind inputs and outputs; the Cloud Foundation Toolkit publishes Google-maintained modules for networks, GKE, projects and more. Copy-paste drifts, scripts are imperative and untracked, and one shared configuration couples every team.'
  },
  {
    id: 'ace-m5-083',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'hard',
    prompt: 'Your Terraform state is in a Cloud Storage bucket. Why should access to that bucket be tightly controlled and its objects versioned?',
    options: [
      'State can contain secrets in plain text, and versions let you recover from a corrupted or bad state',
      'State files are executable, so anyone who can read them can run Terraform as you',
      'State files are billed per read, so restricting access keeps the storage bill down',
      'Versioning is required by the gcs backend, which refuses to work without it'
    ],
    answer: 0,
    explanation: 'Terraform state records resource attributes, which can include passwords and keys, so readers of the bucket can see them; versioning lets you roll back after a failed or mistaken write. State is not executable, reads are not the cost issue, and versioning is recommended rather than required.'
  },
  {
    id: 'ace-m5-084',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'easy',
    prompt: 'A CI pipeline should reject Terraform changes that are badly formatted or invalid, before any plan runs. Which commands should it run?',
    options: [
      '`terraform fmt -check` and `terraform validate`',
      '`terraform apply -auto-approve` and `terraform destroy`',
      '`terraform output` and `terraform show`',
      '`terraform state rm` and `terraform import`'
    ],
    answer: 0,
    explanation: '`fmt -check` fails if files are not in canonical format, and `validate` checks syntax and internal consistency without touching any infrastructure. Applying, destroying or editing state are not checks.'
  },
  {
    id: 'ace-m5-085',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A team wants to deploy Terraform configurations from a Git repository with Google running Terraform for them, keeping the state and logs of every deployment. What should they use?',
    options: ['Infrastructure Manager', 'Config Connector', 'Cloud Deploy', 'Cloud Scheduler'],
    answer: 0,
    explanation: 'Infrastructure Manager runs Terraform as a managed service, from a local folder, Git repository or bucket, storing state and keeping deployment revisions and logs. Config Connector manages resources through Kubernetes, Cloud Deploy delivers applications, and Cloud Scheduler runs cron jobs.'
  },
  {
    id: 'ace-m5-086',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'You install a third-party application on GKE from a Helm chart and need to change its replica count and image tag for production. What is the usual way?',
    options: [
      'Pass your own values file, for example `helm install shop ./chart -f values-prod.yaml`',
      'Edit the chart’s templates directly on the cluster after installing it',
      'Run `kubectl edit` on every object the chart created, after each install',
      'Create a second chart that copies the first and changes the numbers'
    ],
    answer: 0,
    explanation: 'Helm charts are parameterised by values; supplying a values file (or `--set`) at install or upgrade customises the release without editing templates. Editing objects by hand is overwritten by the next upgrade, and forking the chart makes updates painful.'
  },
  {
    id: 'ace-m5-087',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'After `helm upgrade shop ./chart`, the application is broken. You want to return to the previous release configuration quickly. What should you run?',
    options: [
      '`helm rollback shop` to the previous revision',
      '`helm uninstall shop` and install it again',
      '`kubectl rollout undo deployment/shop` only',
      '`helm repo update` and upgrade again'
    ],
    answer: 0,
    explanation: 'Helm keeps a history of release revisions, and `helm rollback` restores a previous one (the last by default, or a revision number). Uninstalling causes downtime, `kubectl rollout undo` only reverts one Deployment and leaves Helm’s record inconsistent, and updating repositories does not undo the release.'
  },
  {
    id: 'ace-m5-088',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Your platform team packages internal Helm charts and wants to store them privately in Google Cloud, with IAM-controlled access. Where should they push them?',
    options: [
      'To an Artifact Registry repository, as OCI artifacts with `helm push`',
      'To a public Cloud Storage bucket used as a Helm repository',
      'To Secret Manager, one secret for each version of a chart',
      'To a Cloud SQL table holding each chart as a binary value'
    ],
    answer: 0,
    explanation: 'Artifact Registry stores Helm charts as OCI artifacts in Docker-format repositories (`helm push chart.tgz oci://REGION-docker.pkg.dev/PROJECT/REPO`), with IAM and vulnerability tooling. A public bucket exposes them, and Secret Manager and Cloud SQL are not package registries.'
  },
  {
    id: 'ace-m5-089',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A platform team that runs everything through Kubernetes manifests and GitOps wants to manage Cloud SQL instances and buckets the same way. What should they use?',
    options: ['Config Connector', 'Infrastructure Manager', 'Cloud Build triggers', 'The Ops Agent'],
    answer: 0,
    explanation: 'Config Connector is a Kubernetes add-on that represents Google Cloud resources as Kubernetes objects (KRM), so you manage them with kubectl, manifests and GitOps tools such as Config Sync. Infrastructure Manager uses Terraform, Cloud Build runs builds, and the Ops Agent collects telemetry.'
  },
  {
    id: 'ace-m5-090',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'Config Connector is installed on your cluster. How do you create a Cloud Storage bucket with it?',
    options: [
      'Apply a manifest of kind StorageBucket with `kubectl apply`',
      'Run `gcloud storage buckets create` from inside a Pod',
      'Annotate a Kubernetes Secret with the bucket’s name',
      'Create a PersistentVolumeClaim named after the bucket'
    ],
    answer: 0,
    explanation: 'Config Connector provides custom resources such as StorageBucket (storage.cnrm.cloud.google.com); applying one makes the controller create and reconcile the bucket. Running gcloud in a Pod is imperative, and Secrets or PVCs do not create buckets.'
  },
  {
    id: 'ace-m5-091',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'You want Config Connector, Config Sync and Policy Controller without running and upgrading the cluster that hosts them yourself. What should you use?',
    options: ['Config Controller', 'GKE Autopilot alone', 'Infrastructure Manager', 'Cloud Deploy'],
    answer: 0,
    explanation: 'Config Controller is a hosted service that bundles Config Connector, Config Sync and Policy Controller on a Google-managed control plane. An Autopilot cluster still needs these components installed and managed, Infrastructure Manager runs Terraform, and Cloud Deploy delivers applications.'
  },
  {
    id: 'ace-m5-092',
    section: 'planning',
    topic: 'Infrastructure as code',
    difficulty: 'medium',
    prompt: 'A company wants to build an enterprise landing zone — organization bootstrap, resource hierarchy, security, networking — from opinionated, stage-by-stage Terraform maintained by Google. What fits?',
    options: [
      'Cloud Foundation Fabric FAST',
      'A single Terraform file written from scratch',
      'Config Connector manifests applied by hand',
      'The pricing calculator’s architecture export'
    ],
    answer: 0,
    explanation: 'Fabric FAST, part of the Cloud Foundation Fabric repository, provides staged Terraform for landing zones: bootstrap, resource management, security, networking and project factories. Writing everything from scratch takes longer, manual manifests are not a landing zone design, and the pricing calculator only estimates cost.'
  },

  // ── AI-assisted planning and implementation tools ──
  {
    id: 'ace-m5-093',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'easy',
    prompt: 'An engineer wants an open-source AI agent in the terminal that can read their repository, run commands and help write gcloud and Terraform changes. Which tool fits?',
    options: ['Gemini CLI', 'Gemini Cloud Assist', 'Application Design Center', 'Cloud Hub'],
    answer: 0,
    explanation: 'Gemini CLI is an open-source AI agent that runs in the terminal, with access to local files and shell tools (and extensions through MCP). Gemini Cloud Assist works in the Google Cloud console, Application Design Center designs applications visually, and Cloud Hub is an operations view.'
  },
  {
    id: 'ace-m5-094',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'easy',
    prompt: 'Developers want AI code completion and chat inside VS Code and JetBrains IDEs, with enterprise controls. What should they use?',
    options: ['Gemini Code Assist', 'Gemini Cloud Assist', 'Cloud Shell tutorials', 'Active Assist'],
    answer: 0,
    explanation: 'Gemini Code Assist plugs into IDEs to complete, generate, explain and transform code, with Standard and Enterprise editions. Gemini Cloud Assist helps operate Google Cloud in the console, and Active Assist gives resource recommendations.'
  },
  {
    id: 'ace-m5-095',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'medium',
    prompt: 'A team wants an agent-first development environment where AI agents plan and carry out coding tasks themselves across the editor, terminal and browser, reporting back with artefacts to review. Which tool is this?',
    options: ['Google Antigravity', 'Cloud Shell Editor', 'Gemini Cloud Assist', 'Cloud Workstations'],
    answer: 0,
    explanation: 'Google Antigravity is Google’s agentic development platform: agents get the editor, terminal and browser to plan, implement and verify tasks while developers review their output. Cloud Shell Editor and Cloud Workstations are development environments without that agent model, and Cloud Assist works in the console.'
  },
  {
    id: 'ace-m5-096',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'medium',
    prompt: 'An architect wants to design an application visually from reusable templates — Cloud Run, a database, a load balancer — and then deploy it, with Terraform generated for the design. What should they use?',
    options: ['Application Design Center', 'Cloud Asset Inventory', 'Network Intelligence Center', 'Cloud Deploy'],
    answer: 0,
    explanation: 'Application Design Center provides a canvas and catalogue of templates to design applications, generates Terraform behind them, and deploys them (registering them in App Hub). Asset Inventory lists resources, Network Intelligence Center diagnoses networks, and Cloud Deploy runs delivery pipelines.'
  },
  {
    id: 'ace-m5-097',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'medium',
    prompt: 'You describe an app in plain language — "a web API on Cloud Run with a PostgreSQL database and a public HTTPS endpoint" — and want a first architecture proposal to refine. How can Gemini Cloud Assist help?',
    options: [
      'It drafts the architecture in Application Design Center, which you then review, adjust and deploy',
      'It deploys the application straight to production without any design or review step',
      'It writes a cost estimate only, because it cannot propose any architecture',
      'It opens a support case so that Google engineers design the application for you'
    ],
    answer: 0,
    explanation: 'Gemini Cloud Assist can turn a natural-language description into an application design in Application Design Center, with components and Terraform you can inspect and change before deploying. It does not bypass review, does more than estimate cost, and is not a support channel.'
  },
  {
    id: 'ace-m5-098',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'medium',
    prompt: 'Which two tools are designed mainly to help developers write and change code? (Choose two.)',
    options: [
      'Gemini Code Assist',
      'Gemini CLI',
      'Gemini Cloud Assist',
      'Personalized Service Health',
      'Active Assist'
    ],
    answer: [0, 1],
    explanation: 'Gemini Code Assist (in IDEs) and Gemini CLI (in the terminal) help create and modify code. Gemini Cloud Assist helps operate and troubleshoot Google Cloud in the console, Personalized Service Health reports Google incidents, and Active Assist recommends resource changes.'
  },
  {
    id: 'ace-m5-099',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'easy',
    prompt: 'An AI assistant generated a Terraform change that will modify production networking. What is the responsible next step?',
    options: [
      'Review the code and run `terraform plan` to check exactly what will change before applying',
      'Apply it immediately, because AI-generated Terraform is always validated by Google',
      'Apply it with `-auto-approve` at night, so that problems affect fewer users',
      'Delete the state file first, so that Terraform recreates everything cleanly'
    ],
    answer: 0,
    explanation: 'AI-generated changes are suggestions: read them, run `plan` (and ideally a test environment and code review) and confirm the impact before applying. Nothing guarantees generated code is correct, auto-approving production is risky, and deleting state loses track of resources.'
  },
  {
    id: 'ace-m5-100',
    section: 'planning',
    topic: 'AI-assisted tools',
    difficulty: 'medium',
    prompt: 'A platform team wants application teams to start from approved, standardised architectures when designing new apps. How can Application Design Center support this?',
    options: [
      'By publishing templates to a shared catalogue that teams use in their own design spaces',
      'By locking every project so that only the platform team can create any resources',
      'By emailing a PDF of reference architectures to each team every quarter',
      'By running a nightly job that deletes resources not created from a template'
    ],
    answer: 0,
    explanation: 'Application Design Center organises work in spaces with shared template catalogues, so platform teams can publish approved building blocks that application teams compose and deploy. Locking projects, PDFs and deletion jobs do not give teams reusable designs.'
  }
];
