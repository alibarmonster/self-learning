/**
 * Tryout questions, Ensuring the successful operation of a cloud solution —
 * the 36 that join the 14 in tryout.ts to make 50: running VMs, images and
 * managed instance groups, day-two GKE, Cloud Run and Pub/Sub operations, and
 * Cloud Monitoring and Logging. Course modules MD1-S1-05 and MD2-S3 to S7.
 */
import type { Question } from '@/types';

export const tryoutOperating: Question[] = [
  {
    id: 'ace-t165',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'A VM running e2-standard-2 needs more memory, so you want to change it to e2-standard-4. What must you do?',
    options: [
      'Stop the VM, change the machine type, then start it again.',
      'Change the machine type while the VM keeps running.',
      'Delete the VM and create a new one from scratch.',
      'Add a second disk, which increases the memory.'
    ],
    answer: 0,
    explanation: 'The machine type of a VM can be changed (`gcloud compute instances set-machine-type`), but only while it is stopped; the disks and IP configuration stay. No recreation is needed, and disks do not add memory.'
  },
  {
    id: 'ace-t166',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You must move a VM with its data from asia-southeast2-a to asia-southeast2-b. What is the recommended approach?',
    options: [
      'Snapshot its disks, create disks from the snapshots in the new zone, and create the VM there.',
      'Edit the VM and change its zone field from asia-southeast2-a to asia-southeast2-b.',
      'Detach the disks and attach them to a new VM created in asia-southeast2-b.',
      'Copy the files over SSH to a new VM, because disks cannot leave their zone.'
    ],
    answer: 0,
    explanation: 'Zonal disks can only attach to VMs in their own zone, and a VM’s zone cannot be edited. Snapshots (or a machine image) are global and can be restored in any zone. Copying files works but is slower and misses configuration.'
  },
  {
    id: 'ace-t167',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'After a bad change to the SSH daemon configuration, nobody can SSH to a VM, although the VM is running. You need to get in and fix the file. What should you use?',
    options: ['The interactive serial console', 'IAP TCP forwarding for port 22', 'A new firewall rule for tcp:22', 'A restart of the VM from the console'],
    answer: 0,
    explanation: 'The serial console gives access to the OS without SSH or the network (it must be enabled on the VM or project). IAP and firewall rules still lead to the broken SSH daemon, and a restart does not repair the configuration.'
  },
  {
    id: 'ace-t168',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You published `web-v3` in the image family `web`. Instance templates use the family. `web-v2` has a security flaw and must not be used for new VMs, but existing VMs keep running. What should you do?',
    options: [
      'Deprecate web-v2 with web-v3 as its replacement.',
      'Delete web-v2 and every VM that was created from it.',
      'Rename web-v2 so the family cannot find it again.',
      'Remove web-v2 from the instance templates by hand.'
    ],
    answer: 0,
    explanation: '`gcloud compute images deprecate web-v2 --state=DEPRECATED --replacement=web-v3` warns anyone who uses it and stops the family from resolving to it; the family already points to the newest image. Images cannot be renamed, and deleting VMs is not required.'
  },
  {
    id: 'ace-t169',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A MIG of worker VMs pulls messages from a Pub/Sub subscription. CPU stays low even when thousands of messages are waiting. You want the group to grow with the backlog. What should you do?',
    options: [
      'Autoscale on the Cloud Monitoring metric for undelivered messages in the subscription.',
      'Autoscale on CPU utilisation with a lower target, such as 20% for every VM in the group.',
      'Autoscale on load balancer serving capacity and put the workers behind a load balancer.',
      'Set the group to a fixed size large enough for the biggest backlog ever recorded.'
    ],
    answer: 0,
    explanation: 'MIG autoscalers can follow Cloud Monitoring metrics, such as `pubsub.googleapis.com/subscription/num_undelivered_messages`, with a target per VM. CPU does not reflect a queue for I/O-bound workers; workers that pull have no load balancer; a fixed size wastes money.'
  },
  {
    id: 'ace-t170',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Traffic to your MIG jumps every weekday at 08:00, and new VMs need 10 minutes to start. CPU-based autoscaling reacts too late. What should you add?',
    options: [
      'A scaling schedule that raises the minimum number of VMs before 08:00 on weekdays.',
      'A shorter initialization period so the autoscaler reacts to CPU sooner in the morning.',
      'A larger machine type for every VM so that fewer VMs are needed during the peak.',
      'A second MIG in another zone that stays stopped until the traffic arrives each day.'
    ],
    answer: 0,
    explanation: 'Schedule-based autoscaling sets a minimum capacity for a time window, so VMs are ready before the known peak. Shortening the initialization period does not make VMs boot faster; bigger VMs or a stopped second group do not solve the timing.'
  },
  {
    id: 'ace-t171',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You want to test a new instance template on about 10% of the VMs in a production MIG before rolling it out to all of them. What should you do?',
    options: [
      'Start a rolling update with the old template as the version and the new one as a canary at 10%.',
      'Create a new MIG with the new template and delete 10% of the VMs from the old group by hand.',
      'Set the autoscaler’s maximum to 10% higher and let the new VMs use the new template.',
      'Edit the template of 10% of the VMs from the console while they are running.'
    ],
    answer: 0,
    explanation: 'A MIG can run two versions: `--version=template=old --canary-version=template=new,target-size=10%`. When the canary is good, update the whole group. Templates are immutable, autoscaling uses the group’s template, and VMs in a MIG are not edited one by one.'
  },
  {
    id: 'ace-t172',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Your web servers are in an unmanaged instance group behind a load balancer. You now need autoscaling and autohealing. What should you do?',
    options: [
      'Create an instance template and a managed instance group, and move the traffic to it.',
      'Enable autoscaling on the unmanaged instance group in the console settings.',
      'Add a health check to the unmanaged group, which turns on autohealing for it.',
      'Add more VMs to the unmanaged group so that it never needs to scale again.'
    ],
    answer: 0,
    explanation: 'Unmanaged instance groups only group existing, possibly different VMs for load balancing; they cannot autoscale, autoheal or roll out updates. Those need a managed instance group built from a template.'
  },
  {
    id: 'ace-t173',
    topic: 'Managing VMs & instance groups',
    difficulty: 'hard',
    prompt: 'A MIG runs a database cluster. When a VM is recreated by autohealing or an update, it must keep its data disk and its instance name. What should you configure?',
    options: [
      'A stateful MIG that preserves the data disk and instance names.',
      'A larger boot disk with a daily snapshot schedule attached.',
      'A regional MIG spread across three zones of the region.',
      'An unmanaged instance group of the database VMs instead.'
    ],
    answer: 0,
    explanation: 'Stateful MIGs keep per-instance state — names, disks, metadata — across recreation and updates. Snapshots restore data only by hand, regional placement does not preserve disks, and an unmanaged group gives up autohealing.'
  },
  {
    id: 'ace-t174',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'Every VM behind your load balancer is reported unhealthy, although the application responds when you test it from inside the VPC. What is the most likely fix?',
    options: [
      'Allow ingress from 35.191.0.0/16 and 130.211.0.0/22 to the serving port.',
      'Allow ingress from 35.235.240.0/20 on tcp:22 to all of the VMs.',
      'Give every VM an external IP address so health checks can reach it.',
      'Lower the health check interval so that it checks the VMs more often.'
    ],
    answer: 0,
    explanation: 'Google health checks come from 35.191.0.0/16 and 130.211.0.0/22, and a firewall rule must allow them to the port being checked. 35.235.240.0/20 is IAP; external IPs and shorter intervals do not let blocked probes through.'
  },
  {
    id: 'ace-t175',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'A user deleted an important file from a VM’s data disk this morning. A snapshot of that disk was taken last night. How do you recover the file with the least disruption?',
    options: [
      'Create a new disk from the snapshot, attach it to the VM, and copy the file back.',
      'Restore the snapshot over the existing data disk while the VM keeps running.',
      'Delete the VM and recreate it from last night’s snapshot of the data disk.',
      'Open the snapshot in Cloud Storage and download the deleted file from it.'
    ],
    answer: 0,
    explanation: 'Snapshots are restored by creating a disk from them; attaching it as an extra disk lets you copy just the file without touching today’s other changes. Snapshots cannot be written over a live disk or browsed like a bucket.'
  },
  {
    id: 'ace-t176',
    topic: 'Managing VMs & instance groups',
    difficulty: 'medium',
    prompt: 'You must apply security patches to 300 Linux VMs every Sunday night and see which VMs failed. What should you use?',
    options: [
      'A VM Manager patch deployment scheduled for Sunday nights',
      'A startup script that runs apt-get upgrade at every boot',
      'An instance template with a newer image for every VM',
      'A Cloud Scheduler job that restarts all VMs on Sunday'
    ],
    answer: 0,
    explanation: 'VM Manager patch deployments run patch jobs on a schedule across a fleet and report results per VM. Startup scripts patch only at boot and report nothing; templates apply to MIGs only; a restart does not patch.'
  },
  {
    id: 'ace-t177',
    topic: 'Managing VMs & instance groups',
    difficulty: 'easy',
    prompt: 'You need to sign in to a Windows Server VM with Remote Desktop for the first time. How do you get a username and password?',
    options: [
      '`gcloud compute reset-windows-password VM_NAME`',
      '`gcloud compute ssh VM_NAME --windows`',
      '`gcloud compute instances describe VM_NAME`',
      '`gcloud compute connect-to-serial-port VM_NAME`'
    ],
    answer: 0,
    explanation: '`gcloud compute reset-windows-password` (or "Set Windows password" in the console) creates or resets a local account and shows its password; then use RDP on tcp:3389. The other commands do not create Windows credentials.'
  },
  {
    id: 'ace-t178',
    topic: 'Managing GKE',
    difficulty: 'easy',
    prompt: 'A Pod is in CrashLoopBackOff. Its current container starts and crashes too quickly to read anything. How do you see the logs of the container that crashed before?',
    options: [
      '`kubectl logs POD --previous`',
      '`kubectl get pods --watch`',
      '`kubectl rollout status deploy/web`',
      '`kubectl top pod POD`'
    ],
    answer: 0,
    explanation: '`kubectl logs --previous` shows the output of the last terminated container, which usually contains the crash reason. `kubectl describe pod` adds events such as OOMKilled. The other commands show status or resource usage.'
  },
  {
    id: 'ace-t179',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'A Pod has been Pending for ten minutes. Which command most directly shows why it cannot be scheduled?',
    options: ['`kubectl describe pod POD`', '`kubectl logs POD`', '`kubectl get nodes`', '`kubectl get svc`'],
    answer: 0,
    explanation: '`kubectl describe pod` lists the Pod’s events, such as "insufficient cpu", an untolerated taint or an unbound volume claim. A Pending Pod has no container yet, so it has no logs; nodes and services do not explain the scheduling decision.'
  },
  {
    id: 'ace-t180',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'GKE auto-upgrades your production cluster’s nodes, but your team wants upgrades only on Saturday nights, and none during the end-of-year sales period. What should you configure?',
    options: [
      'A maintenance window on Saturday nights and a maintenance exclusion for the sales period.',
      'Disable auto-upgrade on all node pools and upgrade them by hand when the team has time.',
      'Move the cluster to the Rapid release channel so upgrades finish faster on any day.',
      'Create the cluster again before each sales period so that no upgrade can be pending.'
    ],
    answer: 0,
    explanation: 'Maintenance windows limit when automatic maintenance may happen, and exclusions block it for a period. Turning auto-upgrade off leaves security patches to you; Rapid upgrades more often; recreating the cluster is pointless.'
  },
  {
    id: 'ace-t181',
    topic: 'Managing GKE',
    difficulty: 'easy',
    prompt: 'You need to grow the `default-pool` node pool of the regional cluster `shop` to 3 nodes per zone, without enabling autoscaling. Which command should you run?',
    options: [
      '`gcloud container clusters resize shop --node-pool=default-pool --num-nodes=3 --region=asia-southeast2`',
      '`kubectl scale nodes --replicas=3 --cluster=shop --namespace=kube-system`',
      '`gcloud compute instance-groups managed resize shop-default-pool --size=3 --region=asia-southeast2`',
      '`gcloud container node-pools create default-pool --num-nodes=3 --cluster=shop --region=asia-southeast2`'
    ],
    answer: 0,
    explanation: '`gcloud container clusters resize` with `--node-pool` sets the node count (per zone in a regional cluster). kubectl scales workloads, not nodes; resizing the underlying instance group bypasses GKE; `node-pools create` would make a new pool.'
  },
  {
    id: 'ace-t182',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'You do not know what CPU and memory requests to set for a new Deployment. You want GKE to suggest values from real usage without changing the running Pods. What should you use?',
    options: [
      'A Vertical Pod Autoscaler with updateMode set to Off',
      'A Horizontal Pod Autoscaler on CPU utilisation',
      'The cluster autoscaler with a higher maximum',
      'Node auto-provisioning on the cluster'
    ],
    answer: 0,
    explanation: 'VPA in recommendation mode (updateMode Off) records suggested requests without evicting Pods; you then set them yourself. HPA changes the number of replicas, and the cluster autoscaler and node auto-provisioning change nodes.'
  },
  {
    id: 'ace-t183',
    topic: 'Managing GKE',
    difficulty: 'hard',
    prompt: 'You created a Horizontal Pod Autoscaler on CPU for a Deployment, but it never scales and shows the CPU target as <unknown>. What is the most likely cause?',
    options: [
      'The containers have no CPU requests, so utilisation cannot be calculated.',
      'The cluster autoscaler is not enabled on the node pool of the cluster.',
      'The Deployment has more than one container in each of its Pods.',
      'The cluster is regional, and HPA works only in zonal clusters.'
    ],
    answer: 0,
    explanation: 'HPA measures CPU utilisation as a percentage of each container’s request; without requests it reports <unknown> and does nothing. The cluster autoscaler is independent, multi-container Pods are fine if every container has requests, and HPA works in regional clusters.'
  },
  {
    id: 'ace-t184',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'On GKE Autopilot, a team deploys Pods without any resource requests, and later finds both their bill and the Pods’ performance surprising. What should you tell them?',
    options: [
      'Autopilot applies default requests and bills on requests, so set requests that match the workload.',
      'Autopilot bills per node, so deploying fewer Pods on each node will lower the cost of the cluster.',
      'Autopilot ignores requests completely and bills a fixed price for each Pod in the cluster.',
      'Autopilot requires every Pod to request at least one full GPU to be scheduled on a node.'
    ],
    answer: 0,
    explanation: 'Autopilot bills on Pod resource requests and fills in defaults when they are missing (with limits equal to requests), so missing requests mean guessed sizes, guessed cost and possibly throttling. Set requests explicitly, or pick a compute class.'
  },
  {
    id: 'ace-t185',
    topic: 'Managing GKE',
    difficulty: 'medium',
    prompt: 'You deployed an ML Pod with a GPU limit to a Standard cluster that has a GPU node pool, but it stays Pending with "node(s) had untolerated taint". What should you do?',
    options: [
      'Add a toleration for the GPU nodes’ taint to the Pod spec.',
      'Remove the GPU limit from the Pod spec and deploy it again.',
      'Delete the GPU node pool and attach GPUs to the default pool.',
      'Scale the Deployment to more replicas so one gets scheduled.'
    ],
    answer: 0,
    explanation: 'GPU node pools carry a taint so that only Pods that tolerate it land there. (GKE normally adds the toleration for Pods requesting GPUs; custom taints need it written.) Removing the GPU limit loses the GPU; more replicas hit the same taint.'
  },
  {
    id: 'ace-t186',
    topic: 'Managing GKE',
    difficulty: 'easy',
    prompt: 'You need to roll out version v2 of the container `web` in the `web` Deployment with a rolling update. Which command does that?',
    options: [
      '`kubectl set image deployment/web web=REGION-docker.pkg.dev/PROJECT/apps/web:v2`',
      '`kubectl create deployment web --image=REGION-docker.pkg.dev/PROJECT/apps/web:v2`',
      '`kubectl rollout undo deployment/web --to-image=web:v2`',
      '`kubectl delete pods -l app=web` after pushing the image again'
    ],
    answer: 0,
    explanation: '`kubectl set image` changes the Pod template, which starts a rolling update (as does applying an updated manifest). `create` fails because the Deployment exists, `rollout undo` goes back, and deleting Pods recreates them from the unchanged template.'
  },
  {
    id: 'ace-t187',
    topic: 'Serverless operations',
    difficulty: 'easy',
    prompt: 'After a Cloud Run deploy, revision shop-00012 returns errors. The previous revision, shop-00011, was fine. How do you roll back immediately?',
    options: [
      'Send 100% of traffic to shop-00011 with gcloud run services update-traffic.',
      'Delete the shop-00012 revision and wait for the service to recover by itself.',
      'Deploy the old source code again so that Cloud Run builds a new revision.',
      'Set max instances to 0 on the service until the bug in the code is fixed.'
    ],
    answer: 0,
    explanation: '`gcloud run services update-traffic shop --to-revisions=shop-00011=100` moves traffic back in seconds; old revisions stay available for exactly this. Rebuilding takes longer, deleting a serving revision is blocked, and max instances 0 is not valid.'
  },
  {
    id: 'ace-t188',
    topic: 'Serverless operations',
    difficulty: 'easy',
    prompt: 'Users complain that the first request after a quiet period on your Cloud Run service is slow, because a new instance has to start. What should you change?',
    options: ['Set a minimum number of instances', 'Lower the maximum number of instances', 'Lower the request timeout', 'Raise the concurrency to 1000'],
    answer: 0,
    explanation: 'Min instances keeps instances warm, so requests do not wait for a cold start; you pay for idle instances. Max instances, timeouts and concurrency do not prevent cold starts (startup CPU boost can also help).'
  },
  {
    id: 'ace-t189',
    topic: 'Serverless operations',
    difficulty: 'medium',
    prompt: 'A legacy application ported to Cloud Run is not thread-safe and returns corrupted results when it handles more than one request at a time. What should you change?',
    options: ['Set concurrency to 1', 'Set max instances to 1', 'Set min instances to 1', 'Set CPU to 1 vCPU'],
    answer: 0,
    explanation: 'Concurrency is how many requests one instance handles at once; setting it to 1 gives each request its own instance. Max instances 1 would force all requests through a single instance at the default concurrency of 80.'
  },
  {
    id: 'ace-t190',
    topic: 'Serverless operations',
    difficulty: 'easy',
    prompt: 'Where do you find the request logs and application output (stdout and stderr) of a Cloud Run service?',
    options: [
      'In Cloud Logging, under the resource type Cloud Run Revision',
      'In a Cloud Storage bucket created for each service',
      'On the instance, by connecting to it with SSH',
      'In Cloud Monitoring, under the uptime checks'
    ],
    answer: 0,
    explanation: 'Cloud Run sends request logs and everything written to stdout and stderr to Cloud Logging automatically (`resource.type="cloud_run_revision"`), also visible on the service’s Logs tab. There is no SSH into Cloud Run instances.'
  },
  {
    id: 'ace-t191',
    topic: 'Serverless operations',
    difficulty: 'medium',
    prompt: 'A few malformed messages in a Pub/Sub subscription make the subscriber fail every time, and they are redelivered forever, slowing everything down. What should you do?',
    options: [
      'Configure a dead-letter topic with a maximum number of delivery attempts on the subscription.',
      'Increase the acknowledgement deadline so that the subscriber has longer to process each message.',
      'Enable message ordering so that the malformed messages are always delivered at the very end.',
      'Reduce the topic’s message retention so that the malformed messages expire after ten minutes.'
    ],
    answer: 0,
    explanation: 'A dead-letter topic receives messages that have failed the set number of delivery attempts, so they stop blocking others and can be inspected. More time or ordering does not fix a message that always fails, and retention below 10 minutes is not possible.'
  },
  {
    id: 'ace-t192',
    topic: 'Serverless operations',
    difficulty: 'medium',
    prompt: 'You want to be alerted when the subscribers of a Pub/Sub subscription fall behind. Which metric should the alert use?',
    options: [
      'The age of the oldest unacknowledged message in the subscription',
      'The number of messages published to the topic per second',
      'The CPU utilisation of the Pub/Sub service in the region',
      'The number of subscriptions attached to the topic'
    ],
    answer: 0,
    explanation: '`oldest_unacked_message_age` (and `num_undelivered_messages`) show a growing backlog, which means subscribers are not keeping up. Publish rate alone says nothing about consumers, Pub/Sub has no CPU metric for you, and the number of subscriptions is static.'
  },
  {
    id: 'ace-t193',
    topic: 'Serverless operations',
    difficulty: 'hard',
    prompt: 'A bug in a subscriber processed the last six hours of messages wrongly, and they were already acknowledged. You have fixed the bug and want those messages processed again. The subscription retains acknowledged messages. What should you do?',
    options: [
      'Seek the subscription to a timestamp six hours ago.',
      'Ask the publishers to send the last six hours again.',
      'Create a new subscription and wait for redelivery.',
      'Increase the ack deadline and restart the subscriber.'
    ],
    answer: 0,
    explanation: 'Seek to a timestamp marks retained messages after that time as unacknowledged again, so they are redelivered. A new subscription only receives messages published after it is created; publishers may not have the data; the ack deadline does not affect acknowledged messages.'
  },
  {
    id: 'ace-t194',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'You want the on-call engineer to get an email and an SMS when a VM’s CPU stays above 80% for 5 minutes. What should you create?',
    options: [
      'A Cloud Monitoring alerting policy on CPU utilisation with email and SMS notification channels.',
      'A log sink that copies the VM’s logs to BigQuery, and a scheduled query that checks the CPU.',
      'A budget alert on the project at 80% of the budget, sent to the on-call engineer’s address.',
      'An uptime check on the VM’s external IP that sends a notification when it fails to answer.'
    ],
    answer: 0,
    explanation: 'Alerting policies watch a metric with a condition (above 80% for 5 minutes) and notify through channels such as email, SMS, Slack or PagerDuty. Budgets are about cost, uptime checks test reachability, and a sink with queries is not real-time.'
  },
  {
    id: 'ace-t195',
    topic: 'Monitoring & logging',
    difficulty: 'easy',
    prompt: 'You want to know within minutes if your public website stops responding from users’ point of view, from several places in the world. What should you configure?',
    options: ['An uptime check with an alerting policy', 'A log-based metric on the web server logs', 'A Data Access audit log on the website', 'A billing alert on the project'],
    answer: 0,
    explanation: 'Uptime checks probe a URL from several global locations and can alert when it fails. Logs only show the requests that arrived, so an outage produces no log lines; audit logs and billing alerts do not test availability.'
  },
  {
    id: 'ace-t196',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'The operations team wants one set of dashboards and alerts covering the metrics of 12 projects. What should you do?',
    options: [
      'Create a scoping project and add the 12 projects to its metrics scope.',
      'Create the same dashboards and alerts in each of the 12 projects.',
      'Move the resources of all 12 projects into a single shared project.',
      'Export the metrics of every project to BigQuery and query them daily.'
    ],
    answer: 0,
    explanation: 'A metrics scope lets one project view and alert on metrics from many monitored projects. Duplicating dashboards is hard to maintain, merging projects breaks isolation, and BigQuery exports are not live monitoring.'
  },
  {
    id: 'ace-t197',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Your application writes "PAYMENT_FAILED" in its logs when a payment fails. You want an alert when more than 20 of these lines appear in five minutes. What should you do?',
    options: [
      'Create a log-based metric counting those entries and an alerting policy on that metric.',
      'Create an uptime check on the payment page that searches the response for the word.',
      'Export the logs to BigQuery and run a scheduled query every five minutes to count them.',
      'Increase the retention of the _Default log bucket so the entries can be counted later.'
    ],
    answer: 0,
    explanation: 'A counter log-based metric turns matching log entries into a metric, and an alerting policy fires when it passes 20 in five minutes. Scheduled queries are slower and more complex; uptime checks and retention do not count log lines.'
  },
  {
    id: 'ace-t198',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Debug-level logs from one noisy service make up most of your Cloud Logging bill, and nobody reads them. You want to stop paying for them while keeping all other logs. What should you do?',
    options: [
      'Add an exclusion filter for that service’s debug logs to the _Default sink.',
      'Delete the _Default log bucket so that no logs are stored in the project.',
      'Lower the retention of the _Required bucket so logs are kept for less time.',
      'Disable the Cloud Logging API in the project that runs the noisy service.'
    ],
    answer: 0,
    explanation: 'Exclusion filters on a sink drop matching entries before they are stored, so they are not charged for storage. Deleting the bucket or disabling Logging loses everything, and _Required retention is fixed and not billed.'
  },
  {
    id: 'ace-t199',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'Analysts want to run SQL over the last year of load balancer request logs. What should you set up?',
    options: [
      'A log sink that routes those logs to a BigQuery dataset',
      'A log-based metric on the load balancer request logs',
      'A longer retention on the _Required log bucket',
      'An uptime check on the load balancer’s frontend IP'
    ],
    answer: 0,
    explanation: 'A sink to BigQuery (or a log bucket upgraded to Log Analytics) makes logs queryable with SQL. Log-based metrics count entries but keep no detail; _Required retention cannot be changed; uptime checks do not collect logs.'
  },
  {
    id: 'ace-t200',
    topic: 'Monitoring & logging',
    difficulty: 'medium',
    prompt: 'You want your web server’s nginx access logs and its memory usage in Cloud Logging and Cloud Monitoring, from 40 Compute Engine VMs. What should you do?',
    options: [
      'Install the Ops Agent on the VMs, for example with a VM Manager OS policy, and configure its nginx receiver.',
      'Enable VPC Flow Logs on the subnet so that the VMs’ HTTP requests and memory appear in Cloud Logging.',
      'Create an uptime check for each VM so that Cloud Monitoring records each request and its memory use.',
      'Enable Data Access audit logs for Compute Engine so the nginx requests are recorded in the audit log.'
    ],
    answer: 0,
    explanation: 'The Ops Agent collects guest metrics such as memory and application logs, with receivers for third-party apps like nginx; VM Manager can install it across many VMs. Flow logs record network flows, uptime checks probe endpoints, and audit logs record API calls, not web requests.'
  }
];
