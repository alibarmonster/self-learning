/**
 * Tryout prep for course Module 5, sessions 18–22 (exam guide 2.4 and 3.4):
 * Cloud Monitoring metrics, alerts, the Ops Agent and Managed Service for
 * Prometheus; Cloud Logging queries, buckets, the Log Router, Log Analytics,
 * audit, flow and firewall logs; Gemini Cloud Assist, Active Assist, Cloud Hub
 * and Personalized Service Health; Trace, Profiler, Query Insights and index
 * advisor; job and workload status; AI infrastructure; Terraform, Helm,
 * Config Connector, Fabric FAST and the AI-assisted tools — plus both labs and
 * a check before the module try-out (M5 · Set 1–5 in exams/ace/sets.ts).
 * Checked against the Google Cloud docs in October 2026.
 */
import type { Lesson } from '@/types';

export const lesson: Lesson = {
  id: 'tryout-m5',
  lang: 'en',
  title: 'Tryout Prep · Module 5: Operations, Observability & IaC',
  intro:
    'Module 5 covers keeping things running and building them repeatably, which is exam guide 2.4 and 3.4. It follows sessions 18 to 22 of the course. Cloud Monitoring comes first: metrics, alerts, the Ops Agent and Managed Service for Prometheus. Then Cloud Logging: queries, buckets, sinks, Log Analytics, and audit, flow and firewall logs. Then the assistants and dashboards (Gemini Cloud Assist, Active Assist, Cloud Hub, Personalized Service Health), the diagnostic tools, job and workload status, and AI infrastructure. Last come Terraform, Helm, Config Connector and Fabric FAST, and the AI-assisted tools. The exam likes "which tool answers this question" and "where do these logs go", and the tables are built for exactly that. Then sit M5 · Set 1 to 5: 20 questions, 24 minutes each.',
  parts: [
    {
      id: 's18',
      title: 'Session 18 · Cloud Monitoring and Cloud Logging',
      sections: [
        {
          id: 's18-metrics',
          title: 'S18-01 · Metrics, dashboards and alerting policies',
          blocks: [
            {
              kind: 'table',
              caption: 'Where metrics come from',
              columns: ['Source', 'Examples', 'Prefix'],
              rows: [
                ['Google Cloud services (automatic)', 'VM CPU from the hypervisor, load balancer latency, Cloud Run request count', '`compute.googleapis.com/…`, `run.googleapis.com/…`'],
                ['Ops Agent', 'VM memory, disk use, processes, nginx/MySQL metrics', '`agent.googleapis.com/…`, `workload.googleapis.com/…`'],
                ['Your application', 'OpenTelemetry metrics, or the Monitoring API', '`workload.googleapis.com/…`, `custom.googleapis.com/…`'],
                ['Prometheus', 'Managed Service for Prometheus', '`prometheus.googleapis.com/…`'],
                ['Logs', 'Log-based metrics counting or measuring entries', '`logging.googleapis.com/user/…`']
              ]
            },
            {
              kind: 'list',
              items: [
                'A **metrics scope** lets one scoping project chart and alert on metrics from many monitored projects.',
                '**Metrics Explorer** builds charts with the query builder or **PromQL**. MQL is no longer recommended for new work.',
                '**Dashboards**: predefined ones per service, custom ones, and JSON definitions you can keep in source control.',
                'An **alerting policy** has **conditions**, **notification channels** (email, SMS, mobile app, Slack, PagerDuty, Google Chat, webhooks, Pub/Sub) and **documentation** telling the on-call person what to do. Conditions are a **metric threshold** for a duration, **metric absence** (data stopped arriving), **forecast** (will cross soon), **PromQL**, or **log match**. An incident opens when a condition is met and closes when it clears, and you can **snooze** alerts during maintenance.',
                '**Uptime checks** probe HTTP(S) or TCP endpoints from several regions, and **private** checks reach internal endpoints through Service Directory. **Synthetic monitors** run scripted user journeys. **SLO monitoring** tracks a service level objective and alerts on error budget **burn rate**.'
              ]
            },
            {
              kind: 'code',
              title: 'An alerting policy: CPU above 80% for 10 minutes',
              lines: [
                '# cpu-high.json',
                '{ "displayName": "VM CPU > 80% for 10 min", "combiner": "OR",',
                '  "conditions": [{ "displayName": "cpu",',
                '    "conditionThreshold": {',
                '      "filter": "resource.type = \\"gce_instance\\" AND metric.type = \\"compute.googleapis.com/instance/cpu/utilization\\"",',
                '      "comparison": "COMPARISON_GT", "thresholdValue": 0.8, "duration": "600s",',
                '      "aggregations": [{ "alignmentPeriod": "60s", "perSeriesAligner": "ALIGN_MEAN" }] } }],',
                '  "notificationChannels": ["projects/ace-lab-123/notificationChannels/1234567890"],',
                '  "documentation": { "content": "Check the top process; scale the MIG if load is real." } }',
                '$ gcloud alpha monitoring policies create --policy-from-file=cpu-high.json',
                '$ gcloud monitoring uptime create shop-home --resource-type=uptime-url \\',
                '    --resource-labels=host=shop.example.com --protocol=https --path=/healthz',
                '$ gcloud monitoring dashboards create --config-from-file=dashboard.json'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Notify the team when CPU stays above 80% for 10 minutes" → a metric threshold condition with a 10-minute duration. "Tell us if the job stops reporting" → metric absence. "Is the website reachable from outside?" → an uptime check with an alert. "Charts for 30 projects in one place" → a metrics scope. "Alert only when users notice" → an SLO with burn-rate alerting.'
            },
            {
              kind: 'quiz',
              q: 'A batch job writes a heartbeat metric every minute. You must be told if it stops running. Which condition type fits?',
              options: ['Metric threshold below 1', 'Metric absence', 'Uptime check', 'Log match on errors'],
              answer: 1,
              explain: 'A stopped job writes nothing at all, so a threshold never evaluates. Metric absence alerts when data stops arriving.'
            }
          ]
        },
        {
          id: 's18-agents',
          title: 'S18-02 · Custom metrics, the Ops Agent and Managed Service for Prometheus',
          blocks: [
            {
              kind: 'list',
              items: [
                'The **Ops Agent** is the one agent for VMs. It collects **logs** (with Fluent Bit) and **metrics** (with an OpenTelemetry collector) from inside the guest: memory, disk, processes, and third-party apps such as nginx, Apache, MySQL, PostgreSQL, Redis and JVM. It replaces the legacy Monitoring and Logging agents.',
                'Install it per VM, tick it when creating a VM in the console, or roll it out across a fleet with VM Manager policies. The VM’s service account needs `roles/logging.logWriter` and `roles/monitoring.metricWriter`. Configure it in `/etc/google-cloud-ops-agent/config.yaml`.',
                '**Managed Service for Prometheus** is Prometheus-compatible collection and storage in Google’s monitoring backend, with two-year retention and global queries in **PromQL** (Metrics Explorer or Grafana). On GKE, **managed collection** is on by default, and you say what to scrape with `PodMonitoring` resources. On VMs, the Ops Agent can scrape Prometheus endpoints.',
                '**Custom metrics from apps**: instrument with **OpenTelemetry** and send OTLP to the Ops Agent or a collector, or write through the Monitoring API.',
                '**Log-based metrics** count matching log entries (counter) or extract a number (distribution). Alerting on them turns "this error appeared" into a page.'
              ]
            },
            {
              kind: 'code',
              title: 'Ops Agent config, a PodMonitoring, a log-based metric',
              lines: [
                '# /etc/google-cloud-ops-agent/config.yaml: collect nginx logs and metrics',
                'logging:',
                '  receivers:',
                '    nginx_access: { type: nginx_access }',
                '  service:',
                '    pipelines:',
                '      nginx: { receivers: [nginx_access] }',
                'metrics:',
                '  receivers:',
                '    nginx: { type: nginx, stub_status_url: "http://127.0.0.1:80/status" }',
                '  service:',
                '    pipelines:',
                '      nginx: { receivers: [nginx] }',
                '$ sudo systemctl restart google-cloud-ops-agent',
                '# podmonitoring.yaml: scrape the "metrics" port of Pods labelled app=web',
                'apiVersion: monitoring.googleapis.com/v1',
                'kind: PodMonitoring',
                'metadata: { name: web }',
                'spec:',
                '  selector: { matchLabels: { app: web } }',
                '  endpoints: [{ port: metrics, interval: 30s }]',
                '$ kubectl apply -f podmonitoring.yaml',
                '$ gcloud logging metrics create checkout_errors --description="Checkout errors" \\',
                '    --log-filter=\'resource.type="cloud_run_revision" AND severity>=ERROR AND jsonPayload.route="/checkout"\''
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"No memory or disk-usage metrics for VMs" → install the Ops Agent. "Keep Prometheus and PromQL without running Prometheus servers" → Managed Service for Prometheus. "Alert when a specific error appears in logs" → a log-based metric with an alert (or a log-match alert). "Business metric such as orders per minute" → a custom metric through OpenTelemetry.'
            },
            {
              kind: 'quiz',
              q: 'Which data does Cloud Monitoring collect from a Compute Engine VM without any agent?',
              options: ['Memory utilisation', 'CPU utilisation, disk I/O and network traffic seen by the hypervisor', 'Per-process CPU', 'nginx request counts'],
              answer: 1,
              explain: 'The hypervisor sees CPU, disk and network. Memory, processes and application metrics need the Ops Agent inside the guest.'
            }
          ]
        },
        {
          id: 's18-logging',
          title: 'S18-03 · Cloud Logging: queries, log buckets, the Log Router, Log Analytics and exports',
          blocks: [
            {
              kind: 'p',
              text: 'A log entry has a **resource** (what produced it, with labels), a **logName**, a **severity**, a **timestamp**, a payload (`textPayload`, `jsonPayload` or `protoPayload` for audit logs), labels, and often `httpRequest` and a **trace** ID linking it to Cloud Trace. Cloud Run, GKE and App Engine send stdout and stderr automatically, and VMs send logs through the Ops Agent.'
            },
            {
              kind: 'code',
              title: 'Logging query language: the patterns to recognise',
              lines: [
                'resource.type="gce_instance" AND severity>=ERROR',
                'resource.type="cloud_run_revision" AND resource.labels.service_name="shop"',
                'logName="projects/ace-lab-123/logs/cloudaudit.googleapis.com%2Factivity"',
                'protoPayload.methodName="v1.compute.instances.delete"',
                'jsonPayload.status>=500 AND httpRequest.requestUrl:"/checkout"',
                'textPayload:"timeout"            # ":" means contains',
                'timestamp>="2026-10-30T00:00:00Z"',
                'SEARCH("payment failed")',
                '$ gcloud logging read \'resource.type="cloud_run_revision" AND severity>=ERROR\' --freshness=1h --limit=20'
              ]
            },
            {
              kind: 'table',
              caption: 'Where logs are stored',
              columns: ['Bucket', 'Holds', 'Retention'],
              rows: [
                ['`_Required`', 'Admin Activity, System Event and Access Transparency audit logs', '**400 days**, cannot be changed; no storage charge'],
                ['`_Default`', 'Everything else the `_Default` sink routes', '**30 days** by default, settable from 1 to 3,650 days'],
                ['User-defined buckets', 'What your sinks route there', 'Your choice of retention, region and CMEK; can be upgraded to **Log Analytics**']
              ]
            },
            {
              kind: 'list',
              items: [
                'The **Log Router** checks every entry against each **sink**: an inclusion filter plus **exclusion** filters, then a destination. The `_Required` sink cannot be changed. The `_Default` sink can be edited, and adding exclusions is how you stop paying for noisy logs.',
                '**Sink destinations**: a log bucket, **BigQuery**, **Cloud Storage** (cheap long-term), **Pub/Sub** (to Splunk or an on-premises SIEM), or another project. The sink’s **writer identity** must be granted write access on the destination.',
                '**Aggregated sinks** on a folder or the organization (`--include-children`) collect logs from every project below.',
                '**Log Analytics** runs SQL over log buckets, and can link a BigQuery dataset so the logs can be joined with other data. **Log views** grant access to a subset of a bucket.',
                '**Cost**: ingestion is billed beyond a monthly free allotment per project, and retention beyond the default period is billed too. Exclusions and shorter retention save money.'
              ]
            },
            {
              kind: 'code',
              title: 'Buckets, sinks, exclusions, Log Analytics',
              lines: [
                '$ gcloud logging buckets create app-1y --location=asia-southeast2 --retention-days=365 --enable-analytics',
                '$ gcloud logging sinks create app-to-bucket \\',
                '    logging.googleapis.com/projects/ace-lab-123/locations/asia-southeast2/buckets/app-1y \\',
                '    --log-filter=\'resource.type="cloud_run_revision"\'',
                '$ gcloud logging sinks create audit-to-bq bigquery.googleapis.com/projects/sec-123/datasets/audit \\',
                '    --organization=123456789012 --include-children --log-filter=\'logName:"cloudaudit.googleapis.com"\'',
                '$ gcloud logging sinks describe audit-to-bq --organization=123456789012 --format="value(writerIdentity)"',
                '# grant that identity roles/bigquery.dataEditor on the dataset',
                '$ gcloud logging sinks create to-siem pubsub.googleapis.com/projects/ace-lab-123/topics/siem --log-filter="severity>=WARNING"',
                '$ gcloud logging sinks update _Default --add-exclusion=name=no-debug,filter="severity<=DEBUG"',
                '$ gcloud logging buckets update _Default --location=global --retention-days=90',
                '# Log Analytics (SQL)',
                'SELECT severity, COUNT(*) AS n FROM `ace-lab-123.global._Default._AllLogs`',
                'WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR) GROUP BY severity'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Keep audit logs from all projects for analysis" → an aggregated sink at the organization to BigQuery. "Cheapest long-term retention of logs" → a sink to Cloud Storage (Archive class). "Send logs to an on-premises SIEM" → a sink to Pub/Sub. "Logs for a year, queried with SQL" → a log bucket with 365-day retention and Log Analytics. "The sink exists but nothing arrives" → grant the writer identity on the destination. "Reduce Logging cost" → exclusion filters.'
            },
            {
              kind: 'quiz',
              q: 'You created a sink to a BigQuery dataset in another project, but no data arrives. What is the most likely fix?',
              options: ['Enable Data Access audit logs', 'Grant the sink’s writer identity BigQuery Data Editor on the dataset', 'Recreate the dataset in the same region', 'Turn on Log Analytics'],
              answer: 1,
              explain: 'A sink writes as its writer identity, a service account Google creates. It needs permission on the destination, and creating the sink does not grant it.'
            }
          ]
        },
        {
          id: 's18-audit',
          title: 'S18-04 · Audit logs, VPC Flow Logs and firewall logs',
          blocks: [
            {
              kind: 'table',
              caption: 'Cloud Audit Logs',
              columns: ['Type', 'Records', 'On by default?', 'Stored', 'To read'],
              rows: [
                ['Admin Activity', 'Configuration changes and metadata writes (create a VM, change IAM)', 'Always; cannot be turned off', '`_Required`, 400 days', 'Logs Viewer'],
                ['System Event', 'Google-initiated changes (live migration, autoscaler actions)', 'Always', '`_Required`, 400 days', 'Logs Viewer'],
                ['Data Access', 'Reads of configuration and data, and data writes', '**No**, except BigQuery. Turn on per service; can be large and billed', '`_Default`, 30 days', '**Private Logs Viewer**'],
                ['Policy Denied', 'Access refused by VPC Service Controls or organization policy', 'Yes (can be excluded)', '`_Default`', 'Logs Viewer']
              ]
            },
            {
              kind: 'code',
              title: 'Turn on Data Access logs for Cloud Storage (or use IAM & Admin → Audit Logs)',
              lines: [
                '$ gcloud projects get-iam-policy ace-lab-123 --format=yaml > policy.yaml',
                '# add to policy.yaml',
                'auditConfigs:',
                '- service: storage.googleapis.com',
                '  auditLogConfigs:',
                '  - logType: DATA_READ',
                '  - logType: DATA_WRITE',
                '$ gcloud projects set-iam-policy ace-lab-123 policy.yaml',
                '# Who deleted a VM?',
                'logName:"cloudaudit.googleapis.com%2Factivity" AND protoPayload.methodName:"instances.delete"'
              ]
            },
            {
              kind: 'list',
              items: [
                '**VPC Flow Logs** record a **sample** of network flows (source and destination IP and port, protocol, bytes, packets, latency for TCP) for VMs, GKE nodes and more. Turn them on **per subnet** with a sampling rate and aggregation interval. Newer configurations can also cover a whole network, a VPN tunnel or an Interconnect attachment. Use them for network monitoring, forensics and egress cost analysis.',
                '**Firewall Rules Logging** is turned on **per rule** and logs each connection that rule allowed or denied. The **implied** rules cannot log, so to see what the implied deny drops, add an explicit low-priority deny rule with logging.',
                'Both kinds land in Cloud Logging, from where sinks can send them on.'
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud compute networks subnets update web-jkt --region=asia-southeast2 --enable-flow-logs \\',
                '    --logging-flow-sampling=0.5 --logging-aggregation-interval=interval-30-sec --logging-metadata=include-all',
                '$ gcloud compute firewall-rules update allow-web --enable-logging',
                '$ gcloud compute firewall-rules create deny-all-logged --network=prod-vpc --direction=INGRESS \\',
                '    --priority=65534 --action=DENY --rules=all --source-ranges=0.0.0.0/0 --enable-logging'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Who deleted this VM / changed IAM?" → Admin Activity logs, always there. "Who read objects in this bucket?" → Data Access logs, which must be turned on first. "Auditor must read Data Access logs" → Private Logs Viewer. "Which IPs talk to this VM, and how much?" → VPC Flow Logs. "Is my firewall rule matching?" → Firewall Rules Logging on that rule.'
            },
            {
              kind: 'quiz',
              q: 'Security asks who downloaded a confidential file from a bucket last week, but the logs show nothing. Why?',
              options: ['Admin Activity logs were disabled', 'Data Access logs for Cloud Storage were not enabled, so reads were never logged', 'The `_Required` bucket expired', 'Flow logs were off'],
              answer: 1,
              explain: 'Object reads are Data Access events, which are off by default for Cloud Storage. Enabling them now will not bring back last week’s reads.'
            }
          ]
        },
        {
          id: 's18-assist',
          title: 'S18-05 · Gemini Cloud Assist, Active Assist, Cloud Hub and Personalized Service Health',
          blocks: [
            {
              kind: 'table',
              columns: ['Tool', 'What it does', 'Exam cue'],
              rows: [
                ['**Gemini Cloud Assist**', 'The AI assistant in the console. It turns plain language into charts and queries, explains dashboards, and runs **investigations** that pull together logs, metrics, errors and recent changes to suggest a root cause', '"Ask in natural language", "help find the root cause of an incident"'],
                ['**Active Assist**', 'The family of **recommenders**: idle VMs, disks and IPs; VM rightsizing; committed use discounts; the **IAM recommender**; unattended projects; firewall insights; Cloud SQL rightsizing', '"Reduce cost of over-provisioned VMs", "remove unused permissions"'],
                ['**Cloud Hub**', 'The operations home for a project or an **App Hub** application: alerts, active incidents, planned maintenance, and health of the services and workloads involved', '"One place for an SRE to see an application’s alerts, incidents and maintenance"'],
                ['**Personalized Service Health**', 'Google Cloud incidents and planned maintenance that affect **your** projects, products and regions, with alerts to your channels and an API', '"Know when a Google incident affects us", "integrate Google outages into our tooling"']
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud recommender recommendations list --project=ace-lab-123 --location=asia-southeast2-a \\',
                '    --recommender=google.compute.instance.MachineTypeRecommender',
                '$ gcloud recommender recommendations list --project=ace-lab-123 --location=global \\',
                '    --recommender=google.iam.policy.Recommender'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'The tools are easy to mix up. Recommendations about **your** resources come from Active Assist. **Google’s** incidents affecting you come from Personalized Service Health. Your application’s alerts and health in one place is Cloud Hub. An AI helping you investigate is Gemini Cloud Assist.'
            },
            {
              kind: 'quiz',
              q: 'Operations wants an automatic alert in their Slack channel whenever a Google Cloud incident affects the products and regions they use. What should they set up?',
              options: ['An uptime check on google.com', 'Personalized Service Health alerts routed to a Slack notification channel', 'Active Assist recommendations', 'A log-based metric on Admin Activity logs'],
              answer: 1,
              explain: 'Personalized Service Health filters Google incidents to your projects and can alert through Cloud Monitoring notification channels.'
            }
          ]
        }
      ]
    },
    {
      id: 's19',
      title: 'Session 19 · Lab: logging, monitoring and observability in practice',
      sections: [
        {
          id: 's19-lab',
          title: 'Dashboards, alerts, log queries and sinks',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'A dashboard for the app', text: 'Request count, latency and error rate side by side; save it as JSON for source control.', code: ['gcloud monitoring dashboards create --config-from-file=shop-dashboard.json'] },
                { title: 'An alert that pages a person', text: 'Threshold plus duration, an email channel, and documentation that says what to check first.' },
                { title: 'An uptime check with an alert', text: 'HTTPS on `/healthz` from several regions.' },
                { title: 'Query the logs', text: 'Find the errors of the last hour for one service, open an entry, follow its trace ID.', code: ['gcloud logging read \'resource.type="cloud_run_revision" AND severity>=ERROR\' --freshness=1h'] },
                { title: 'Turn an error into a metric', text: 'A log-based counter for checkout errors, then an alert on its rate.' },
                { title: 'Route audit logs to BigQuery', text: 'A sink, then grant its writer identity on the dataset, then query the table that appears.', code: ['gcloud logging sinks create audit-bq bigquery.googleapis.com/projects/ace-lab-123/datasets/audit --log-filter=\'logName:"cloudaudit.googleapis.com"\''] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 's20',
      title: 'Session 20 · Diagnostics and AI-assisted operations',
      sections: [
        {
          id: 's20-diagnostics',
          title: 'S20-01 · Cloud Trace, Cloud Profiler, Error Reporting, Query Insights and index advisor',
          blocks: [
            {
              kind: 'table',
              caption: 'Which tool answers which question',
              columns: ['Question', 'Tool'],
              rows: [
                ['Which service or call in a request adds the latency?', '**Cloud Trace**: spans across services, from OpenTelemetry or built-in integrations'],
                ['Which function burns the CPU or memory in production?', '**Cloud Profiler**: continuous, low-overhead CPU, heap, wall-time and contention profiles (Go, Java, Node.js, Python)'],
                ['Which new exceptions appeared, and how often?', '**Error Reporting**: groups stack traces from logs and notifies on new errors'],
                ['Which SQL query loads the database?', '**Query Insights** (Cloud SQL, AlloyDB): top queries by load, plans, the application tags and clients sending them'],
                ['Which index would speed it up?', '**Index advisor**: index recommendations (Cloud SQL Enterprise Plus, AlloyDB)'],
                ['What exactly happened at 10:05?', '**Cloud Logging**'],
                ['How does it trend, and is it over the limit?', '**Cloud Monitoring**']
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud sql instances patch shop-db --insights-config-query-insights-enabled \\',
                '    --insights-config-record-application-tags --insights-config-record-client-address',
                '# Python: start Cloud Profiler when the app starts',
                'import googlecloudprofiler',
                'googlecloudprofiler.start(service="checkout", service_version="1.4.0")'
              ]
            },
            {
              kind: 'case',
              title: 'Checkout became slow after a release',
              situation: 'Users report that checkout takes 3 seconds instead of 300 ms since yesterday’s release. CPU on the Cloud Run service is normal.',
              diagnose: [
                '**Cloud Trace**: open a slow checkout trace. 2.6 s of it is one span, `SELECT … FROM orders WHERE customer_id = …`.',
                '**Query Insights**: that query now tops the load chart, and its plan shows a full table scan. The release added a filter on `customer_id`.',
                '**Index advisor** recommends an index on `orders(customer_id)`.'
              ],
              fix: ['CREATE INDEX CONCURRENTLY orders_customer_idx ON orders (customer_id);', '# then confirm in Trace that the span is back to milliseconds'],
              why: 'Trace pins the slow hop, Query Insights shows why the query is slow, and the advisor gives the fix. Logs alone would only have shown that requests were slow.',
              exam: '"Find which microservice/database call causes latency" → Cloud Trace first.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Latency between microservices" → Cloud Trace. "High CPU, which code path?" → Cloud Profiler (safe in production). "Be notified of new exceptions" → Error Reporting. "Slow SQL query" → Query Insights. Cloud Debugger is retired, so any answer that uses it is outdated.'
            },
            {
              kind: 'quiz',
              q: 'A Java service uses more CPU after each release, and you want to see which methods are responsible, in production, with minimal overhead. What do you use?',
              options: ['Cloud Trace', 'Cloud Profiler', 'Error Reporting', 'VPC Flow Logs'],
              answer: 1,
              explain: 'Cloud Profiler samples CPU and memory continuously at low overhead and shows which functions consume them. Trace shows where request time goes.'
            }
          ]
        },
        {
          id: 's20-jobs',
          title: 'S20-02 · Job and workload status: Dataflow, BigQuery, GKE and Cloud Run',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Dataflow**: the job page shows the graph and per-step throughput, plus **data freshness** and **system lag** for streaming (alert on `job/system_lag` in Cloud Monitoring), autoscaling, worker logs and errors. From the command line, use `gcloud dataflow jobs list` and `describe`.',
                '**BigQuery**: every query, load, export and copy is a job. Use the console’s job history, `bq ls -j`, `bq show -j` (which includes error details for failed loads), and `INFORMATION_SCHEMA.JOBS` for bytes, slots and users over time.',
                '**GKE**: list clusters and node pools, then use kubectl: nodes, Pods in every namespace, recent events, live usage. The console’s Workloads and Observability tabs show the same.',
                '**Cloud Run**: list services, revisions with their traffic, and job executions.',
                '**Across projects**: Cloud Asset Inventory lists every resource, and Cloud Hub shows an application’s health.'
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud dataflow jobs list --region=asia-southeast2 --status=active',
                '$ bq ls -j -a -n 20',
                '$ bq show -j --format=prettyjson bqjob_r1234_00000190',
                '$ gcloud container clusters list',
                '$ gcloud container node-pools list --cluster=shop-std --region=asia-southeast2',
                '$ kubectl get pods -A',
                '$ kubectl get events -A --sort-by=.lastTimestamp',
                '$ kubectl top pods -n shop',
                '$ gcloud run services list',
                '$ gcloud run revisions list --service=shop --region=asia-southeast2',
                '$ gcloud run jobs executions list --job=report --region=asia-southeast2'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Is the streaming pipeline keeping up?" → system lag and data freshness. "Why did last night’s load into BigQuery fail?" → `bq show -j` on the load job, or the job history. "Which Pods restart?" → `kubectl get pods` (RESTARTS) and events. "Which revision serves traffic?" → `gcloud run revisions list` or `services describe`.'
            },
            {
              kind: 'quiz',
              q: 'A streaming Dataflow job’s output in BigQuery is falling further behind real time. Which metric shows this directly?',
              options: ['Worker CPU', 'System lag / data freshness', 'Number of stages', 'Total vCPU hours'],
              answer: 1,
              explain: 'System lag and data freshness measure how far behind the pipeline is. Rising values mean it is not keeping up.'
            }
          ]
        },
        {
          id: 's20-ai-infra',
          title: 'S20-03 · AI infrastructure: GPUs, TPUs and deployment types',
          blocks: [
            {
              kind: 'table',
              caption: 'Where accelerated workloads run',
              columns: ['Deployment type', 'You manage', 'Fits'],
              rows: [
                ['Compute Engine VMs with GPUs, TPU VMs', 'OS, drivers, frameworks, scaling', 'Full control, custom stacks, long training runs'],
                ['GKE with GPU or TPU node pools (Autopilot accelerator classes)', 'Containers and manifests', 'Many jobs, shared clusters, batch training and inference at scale'],
                ['Cloud Run with a GPU (NVIDIA L4)', 'A container', 'Serverless inference that scales to zero'],
                ['Gemini Enterprise Agent Platform (formerly Vertex AI)', 'Code, data and models', 'Managed training, serving and agents (Agent Runtime) without infrastructure']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Capacity**: on-demand, **Spot** (preemptible quotas are separate), **reservations**, **committed use discounts**, and **Dynamic Workload Scheduler** with **flex-start** (run when capacity frees up) and **calendar mode** (book a future window).',
                '**Watch the basics**: GPU quota per region (often 0 at first), zone availability, `TERMINATE` maintenance for GPU VMs, and drivers. Monitor GPU utilisation (Ops Agent on VMs, GKE metrics), because idle accelerators are the most expensive waste in the bill.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Inference with spiky traffic, pay nothing when idle" → Cloud Run with a GPU. "Large distributed training in JAX at the best price-performance" → TPUs (on GKE or TPU VMs). "Training can wait for capacity, lowest cost" → Spot or Dynamic Workload Scheduler flex-start. "Guaranteed GPUs next Monday 08:00" → a reservation or calendar mode.'
            },
            {
              kind: 'quiz',
              q: 'A model serves a few requests per hour, sometimes none for a day, and needs a GPU. What is the most cost-effective deployment?',
              options: ['A GPU VM running all the time', 'Cloud Run with an L4 GPU, scaling to zero', 'A GKE Standard cluster with a GPU node pool at minimum 1', 'A TPU slice'],
              answer: 1,
              explain: 'Cloud Run scales the GPU instance to zero between requests, so idle hours cost nothing.'
            }
          ]
        }
      ]
    },
    {
      id: 's21',
      title: 'Session 21 · Infrastructure as code and AI-assisted provisioning',
      sections: [
        {
          id: 's21-terraform',
          title: 'S21-01 · Terraform for Google Cloud: plan, apply, destroy',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Terraform** describes resources in HCL. The **provider** `google` talks to the APIs. **Resources** are what you create, **data sources** read existing things, and **variables**, **outputs** and **modules** organise the code.',
                '**State** records what Terraform manages. Keep it remote in a **Cloud Storage bucket** (the `gcs` backend, which locks the state) with versioning on, never on a laptop.',
                '**Workflow**: `init` (download providers, set up the backend) → `fmt` / `validate` → `plan` (shows creates, changes and destroys, and is what you review) → `apply` → later `destroy`. Bring existing resources in with `terraform import` or `import` blocks. Drift (manual changes) shows up in the next plan.',
                'Terraform uses **Application Default Credentials**, ideally impersonating a deployment service account (`impersonate_service_account` in the provider), not a key file. Use Google’s maintained modules (Cloud Foundation Toolkit, `terraform-google-modules`) instead of writing everything yourself.',
                '**Infrastructure Manager** runs Terraform for you as a managed service, with previews, deployments and state handled by Google. **Deployment Manager** reached end of support in 2026, so answers built on it are outdated.'
              ]
            },
            {
              kind: 'code',
              title: 'A first configuration',
              lines: [
                '# main.tf',
                'terraform {',
                '  backend "gcs" {',
                '    bucket = "ace-lab-tfstate"',
                '    prefix = "prod"',
                '  }',
                '}',
                'provider "google" {',
                '  project = "ace-lab-123"',
                '  region  = "asia-southeast2"',
                '}',
                'resource "google_storage_bucket" "reports" {',
                '  name                        = "ace-lab-reports"',
                '  location                    = "ASIA-SOUTHEAST2"',
                '  uniform_bucket_level_access = true',
                '}',
                '$ terraform init',
                '$ terraform fmt && terraform validate',
                '$ terraform plan -out=plan.tfplan',
                '$ terraform apply plan.tfplan',
                '$ terraform destroy',
                '# The managed way: Infrastructure Manager',
                '$ gcloud infra-manager deployments apply projects/ace-lab-123/locations/asia-southeast2/deployments/prod \\',
                '    --service-account=projects/ace-lab-123/serviceAccounts/tf-sa@ace-lab-123.iam.gserviceaccount.com --local-source=./infra'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Create identical environments repeatedly and review changes before applying" → Terraform: `plan`, then `apply`. "Several engineers run Terraform and the state gets corrupted" → remote state in a Cloud Storage backend, which provides locking. "See what will change without changing it" → `terraform plan`. "Run Terraform as a managed Google service" → Infrastructure Manager.'
            },
            {
              kind: 'quiz',
              q: 'Which command shows exactly what Terraform will create, change or destroy, without making any change?',
              options: ['`terraform init`', '`terraform validate`', '`terraform plan`', '`terraform apply -auto-approve`'],
              answer: 2,
              explain: '`plan` compares the configuration with state and the real resources and prints the changes. `validate` only checks syntax.'
            }
          ]
        },
        {
          id: 's21-k8s',
          title: 'S21-02 · Helm, Config Connector and Fabric FAST',
          blocks: [
            {
              kind: 'table',
              caption: 'Which IaC tool for which job',
              columns: ['Tool', 'What it manages', 'Pick it when'],
              rows: [
                ['Terraform', 'Almost any Google Cloud (and other) resource, from HCL with state', 'The general default for infrastructure'],
                ['**Helm**', 'Kubernetes applications as **charts** (templates plus `values.yaml`), installed as releases', 'Packaging, versioning and rolling back apps on GKE'],
                ['**Config Connector**', 'Google Cloud resources as **Kubernetes objects** (`StorageBucket`, `SQLInstance`, `IAMPolicyMember`), continuously reconciled', 'Teams that run everything through Kubernetes and GitOps'],
                ['**Fabric FAST**', 'A staged Terraform landing zone from Cloud Foundation Fabric: bootstrap, resource hierarchy, networking, security, project factory', 'Standing up a whole organization the Google-recommended way']
              ]
            },
            {
              kind: 'code',
              title: 'Helm and Config Connector',
              lines: [
                '$ helm install web ./web-chart -n shop -f values-prod.yaml',
                '$ helm upgrade web ./web-chart -n shop --set image.tag=v2',
                '$ helm history web -n shop',
                '$ helm rollback web 1 -n shop',
                '$ helm push web-chart-0.2.0.tgz oci://asia-southeast2-docker.pkg.dev/ace-lab-123/charts',
                '# bucket.yaml: a Cloud Storage bucket declared as a Kubernetes object (Config Connector)',
                'apiVersion: storage.cnrm.cloud.google.com/v1beta1',
                'kind: StorageBucket',
                'metadata: { name: ace-lab-reports }',
                'spec:',
                '  location: ASIA-SOUTHEAST2',
                '  uniformBucketLevelAccess: true',
                '$ kubectl apply -f bucket.yaml'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Package and version a Kubernetes app, roll back easily" → Helm. "Manage Cloud SQL and buckets with kubectl and GitOps" → Config Connector. "Bootstrap a secure organization: folders, networking, security, project factory" → Fabric FAST. Charts are stored as OCI artifacts in Artifact Registry.'
            },
            {
              kind: 'quiz',
              q: 'A platform team wants developers to request Cloud Storage buckets and Pub/Sub topics by applying YAML to their GKE cluster, with drift corrected automatically. What should they use?',
              options: ['Helm', 'Config Connector', 'Deployment Manager', 'Cloud Build triggers'],
              answer: 1,
              explain: 'Config Connector maps Google Cloud resources to Kubernetes custom resources and keeps reconciling them to the declared state.'
            }
          ]
        },
        {
          id: 's21-ai-tools',
          title: 'S21-03 · AI-assisted tools: Gemini CLI, Google Antigravity, Gemini Cloud Assist, Application Design Center',
          blocks: [
            {
              kind: 'table',
              columns: ['Tool', 'What it is', 'Use for'],
              rows: [
                ['**Gemini CLI**', 'An open-source AI agent in your terminal (`npm install -g @google/gemini-cli`, then `gemini`) that reads code, runs commands and uses tools through MCP servers and extensions', 'Generating and fixing code and configs, scripting gcloud work, explaining errors'],
                ['**Google Antigravity**', 'Google’s agent-first development environment: agents plan and carry out tasks across the editor, terminal and browser, and leave artifacts (plans, diffs, screenshots) for you to review', 'Larger development tasks delegated to agents'],
                ['**Gemini Cloud Assist**', 'The assistant inside the console', 'Designing, troubleshooting, explaining costs, investigating incidents'],
                ['**Application Design Center**', 'Design an application architecture from templates on a canvas (Gemini can draft it from a prompt), generate the Terraform, deploy it and register it in App Hub', 'Repeatable, reviewed architectures for teams'],
                ['**Gemini Code Assist**', 'Code completion and chat in the IDE', 'Day-to-day coding']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Review before applying**: treat AI output like a colleague’s pull request. Read the plan or diff, run `terraform plan`, and test.',
                '**Least privilege for agents**: an agent acts with the credentials you give it, so use a restricted identity or impersonation, never Owner, and never paste secrets into prompts.',
                'Keep generated infrastructure code in **version control** and deploy it through the normal pipeline.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Terminal AI agent that can run commands" → Gemini CLI. "Agent-first IDE" → Google Antigravity. "Draw an architecture from templates and deploy it" → Application Design Center. "Help troubleshoot inside the console" → Gemini Cloud Assist. The safe answer always includes reviewing what the AI proposes.'
            },
            {
              kind: 'quiz',
              q: 'An engineer wants an AI assistant in the terminal that can read the repository, propose a Terraform change and run `terraform plan`. Which tool fits?',
              options: ['Application Design Center', 'Gemini CLI', 'Personalized Service Health', 'Cloud Profiler'],
              answer: 1,
              explain: 'Gemini CLI is the terminal agent that works with local files and commands. Application Design Center is a design canvas in the console.'
            }
          ]
        }
      ]
    },
    {
      id: 's22',
      title: 'Session 22 · Lab: observe it, then automate it',
      sections: [
        {
          id: 's22-lab',
          title: 'Instrument the Module 2 app, find an injected fault, redeploy with Terraform',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Install the Ops Agent on the MIG’s VMs', text: 'In the template’s startup script, or through a VM Manager policy, so new VMs get it too.' },
                { title: 'Add a custom metric and an uptime check', text: 'A log-based metric for application errors and an HTTPS uptime check, each with an alert to email.' },
                { title: 'Investigate the injected fault', text: 'When the alert fires: Logs Explorer for the errors, follow the trace ID into Cloud Trace, find the failing call, and write the root-cause note.' },
                { title: 'Describe the stack in Terraform', text: 'Template, MIG, health check, load balancer and alert policy as resources; state in a Cloud Storage bucket.', code: ['terraform init', 'terraform plan -out=plan.tfplan'] },
                { title: 'Redeploy from code and compare', text: 'Apply, confirm the app and the alerts work, then destroy the manual copy.', code: ['terraform apply plan.tfplan'] }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Before the Module 5 try-out',
      sections: [
        {
          id: 'm5-cues',
          title: 'Cue → answer',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['threshold for N minutes', 'Alerting policy, metric threshold + duration'],
                ['job stopped reporting', 'Metric absence'],
                ['site reachable from outside', 'Uptime check'],
                ['metrics of many projects', 'Metrics scope'],
                ['VM memory/disk metrics', 'Ops Agent'],
                ['Prometheus without servers', 'Managed Service for Prometheus'],
                ['alert on a log message', 'Log-based metric / log-match alert'],
                ['logs from all projects to analyse', 'Aggregated sink → BigQuery'],
                ['cheap long-term logs', 'Sink → Cloud Storage'],
                ['to an on-prem SIEM', 'Sink → Pub/Sub'],
                ['SQL over logs, keep 1 year', 'Log bucket + Log Analytics, 365 days'],
                ['sink delivers nothing', 'Grant the writer identity'],
                ['cut logging cost', 'Exclusion filters'],
                ['who changed/deleted', 'Admin Activity audit logs'],
                ['who read data', 'Data Access logs (enable first) + Private Logs Viewer'],
                ['which IPs talk to a VM', 'VPC Flow Logs'],
                ['latency across services', 'Cloud Trace'],
                ['CPU hot spots in code', 'Cloud Profiler'],
                ['slow SQL query', 'Query Insights (+ index advisor)'],
                ['streaming job behind', 'System lag / data freshness'],
                ['idle or oversized resources', 'Active Assist recommendations'],
                ['Google incident affecting us', 'Personalized Service Health'],
                ['review infra changes first', '`terraform plan`'],
                ['Kubernetes app packaging', 'Helm'],
                ['GCP resources as Kubernetes objects', 'Config Connector'],
                ['organization landing zone', 'Fabric FAST']
              ]
            }
          ]
        },
        {
          id: 'm5-traps',
          title: 'Traps that cost points',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Data Access logs are off by default** (except BigQuery). Past reads cannot be recovered after you turn them on.',
                '**`_Required` cannot be changed or excluded.** Its retention is 400 days.',
                '**Creating a sink does not grant permissions.** The writer identity must be granted on the destination.',
                '**Viewer cannot read Data Access logs.** That needs Private Logs Viewer.',
                '**Implied firewall rules do not log.** Add an explicit deny with logging.',
                '**Memory is not a hypervisor metric.** Without the Ops Agent there is no memory chart.',
                '**Cloud Debugger and Deployment Manager are retired,** and MQL is no longer recommended.',
                '**`terraform apply` without reviewing a plan** is never the best-practice answer.'
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
              q: 'Your company must keep all audit logs from 300 projects for 5 years at the lowest cost and rarely reads them. What do you configure?',
              options: ['Raise `_Default` retention to 5 years in each project', 'An aggregated sink at the organization to a Cloud Storage bucket with Archive class and a retention policy', 'Export each project’s logs to BigQuery', 'Keep them in `_Required`'],
              answer: 1,
              explain: 'One organization-level sink catches every project, and Cloud Storage Archive is the cheapest place to keep rarely read logs for years.'
            },
            {
              kind: 'quiz',
              q: 'An application team wants an alert when the word `PAYMENT_TIMEOUT` appears in their Cloud Run logs more than 5 times in 10 minutes. What do you create?',
              options: ['An uptime check', 'A log-based counter metric on that text, with an alerting policy on its rate', 'A VPC Flow Logs filter', 'An Active Assist recommendation'],
              answer: 1,
              explain: 'A log-based metric turns matching entries into a time series, and an alerting policy can then apply a threshold over a window.'
            },
            {
              kind: 'quiz',
              q: 'Developers need to read application logs in a shared log bucket, but only their own service’s entries. What is the cleanest way?',
              options: ['Give them Logs Viewer on the project', 'Create a log view filtered to their service and grant access to that view', 'Copy the logs to separate projects by hand', 'Give them Private Logs Viewer'],
              answer: 1,
              explain: 'Log views expose a filtered subset of a bucket, and access is granted per view.'
            },
            {
              kind: 'quiz',
              q: 'A GKE team already writes Prometheus metrics and PromQL dashboards, and wants Google to store and scale them with no Prometheus servers to run. What do you enable?',
              options: ['The Ops Agent on nodes', 'Managed Service for Prometheus with PodMonitoring resources', 'Cloud Profiler', 'Log Analytics'],
              answer: 1,
              explain: 'Managed collection scrapes the targets you declare in PodMonitoring and stores them in Google’s backend, queried with PromQL.'
            },
            {
              kind: 'quiz',
              q: 'Users report slow pages. Several microservices are involved, and you need to see which one adds the delay for a given request. What tool helps most?',
              options: ['Cloud Logging', 'Cloud Trace', 'Error Reporting', 'Cloud Asset Inventory'],
              answer: 1,
              explain: 'Trace shows the request as spans across services with their durations, so the slow hop stands out.'
            },
            {
              kind: 'quiz',
              q: 'Finance asks for a list of oversized VMs that could use a smaller machine type. Where do you get it with the least effort?',
              options: ['Write a script over Monitoring metrics', 'Active Assist machine type (rightsizing) recommendations', 'Personalized Service Health', 'Cloud Hub incidents'],
              answer: 1,
              explain: 'The machine type recommender already analyses utilisation and suggests smaller shapes, with estimated savings.'
            },
            {
              kind: 'quiz',
              q: 'Two engineers ran `terraform apply` at the same time and the state file got corrupted. What prevents this?',
              options: ['Keeping state in each engineer’s home directory', 'A remote `gcs` backend, which locks the state during operations', 'Using `-auto-approve`', 'Running `terraform fmt` first'],
              answer: 1,
              explain: 'The Cloud Storage backend stores state centrally and takes a lock, so concurrent runs cannot write over each other.'
            },
            {
              kind: 'quiz',
              q: 'Which statement about Cloud Audit Logs is true?',
              options: ['Admin Activity logs can be disabled to save cost', 'Data Access logs are on by default for every service', 'Admin Activity logs are always on and kept 400 days in `_Required`', 'Policy Denied logs are stored in `_Required`'],
              answer: 2,
              explain: 'Admin Activity and System Event logs are always written to `_Required` for 400 days. Data Access logs are off by default except for BigQuery, and Policy Denied logs go to `_Default`.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: Pub/Sub, logging and Scheduler', href: '#/ace/lab/cmd/messaging', note: 'logging read, sinks' },
    { label: 'Canvas: audit logs to BigQuery', href: '#/ace/lab/canvas/log-audit', note: 'aggregated sink and writer identity' },
    { label: 'Canvas: daily report with Cloud Scheduler', href: '#/ace/lab/canvas/cron', note: 'jobs and status' },
    { label: 'Command quiz: Terraform and Docker', href: '#/ace/lab/cmd/build', note: 'init, plan, apply' },
    { label: 'Deep dive: the ACE exam guide', href: '#/ace/learn/ace-guide', note: 'Sections 2.4 and 3.4' }
  ]
};
