# -*- coding: utf-8 -*-
import json, re

qs = json.load(open('parsed.json'))
assert len(qs) == 92

# topic per question, in file order
T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'
TOPICS=[T_FUND,T_COST,T_COST,T_SEC,T_COST,T_FUND,T_FUND,T_COMP,T_HIER,T_FUND,
 T_NET,T_COMP,T_FUND,T_COMP,T_SEC,T_FUND,T_STOR,T_FUND,T_COMP,T_STOR,
 T_DATA,T_OPS,T_SEC,T_NET,T_COMP,T_COMP,T_STOR,T_AI,T_NET,T_SEC,
 T_MIG,T_DATA,T_COMP,T_SEC,T_MIG,T_STOR,T_STOR,T_AI,T_SEC,T_MIG,
 T_HIER,T_MIG,T_MIG,T_OPS,T_SEC,T_AI,T_COST,T_HIER,T_COST,T_SEC,
 T_COST,T_COST,T_MIG,T_SEC,T_COST,T_DATA,T_HIER,T_HIER,T_OPS,T_SEC,
 T_STOR,T_HIER,T_MIG,T_SEC,T_NET,T_HIER,T_AI,T_COST,T_AI,T_DATA,
 T_COMP,T_AI,T_STOR,T_FUND,T_COMP,T_MIG,T_STOR,T_MIG,T_FUND,T_FUND,
 T_FUND,T_FUND,T_COST,T_MIG,T_AI,T_OPS,T_OPS,T_STOR,T_COMP,T_SEC,
 T_DATA,T_AI]

EXPL=[
"Data residency is a location requirement, not a reason to avoid public cloud. A public cloud provider that lets you pin storage to a named region satisfies the regulator while its global network still serves the data worldwide. A provider active only in that region cannot serve customers quickly elsewhere.",
"The need lasts two weeks, so any commitment is wasted. Committed use discounts lock you in for one or three years, and buying hardware is worse still. On-demand pricing costs more per hour but nothing after the fortnight ends.",
"Cloud spend tracks usage, and usage changes daily, so an annual review discovers problems months late. Cloud costs remain part of the budget, and cost decisions need more people involved, not fewer.",
"Security Command Center surfaces vulnerability findings, including VMs running images that are missing security updates. Compliance Reports Manager only supplies Google's own audit reports, and instance age is not evidence of a missing patch.",
"The licences are up for renewal, so there is nothing left to bring. Pay-as-you-go on Compute Engine means you stop paying for the licence while the instances are shut down at the weekend, which BYOL and multi-year renewals cannot do.",
"Zones inside one region are separate failure domains connected by low-latency links, so they give redundancy while staying well under 10 ms. A single zone gives no redundancy; separate regions add tens of milliseconds.",
"On IaaS the provider owns the physical layer: maintaining the hardware and having enough of it. Architecture, deployment automation and application security stay with the customer.",
"Interruptible, restartable work with no completion SLA is the textbook preemptible (Spot) case — a large discount in exchange for a risk the workload already tolerates. Reservations and instance shape do not reduce the rate.",
"Organization policy constraints are inherited down the hierarchy, so setting `constraints/compute.vmExternalIpAccess` at the organization node also covers folders and projects created later. Applying it to today's folders or projects leaves tomorrow's uncovered.",
"Public cloud gives central, consistent management and removes infrastructure work. Co-location and private clouds leave the organisation still managing the servers.",
"Data that cannot cross the public internet needs a private connection. Partner Interconnect provides one through a service provider. Cloud VPN runs over the public internet, and IAP and Private Google Access are access controls, not private circuits.",
"Cloud Run deploys container images, and Container Registry (now Artifact Registry) is the image store the pipeline pushes to and Cloud Run pulls from. Compute Engine images and disks are for VMs.",
"SaaS hands you a finished application, so the customer manages the least. Maximum flexibility is IaaS, and the balance between the two is PaaS.",
"Containers boot in seconds because they share the host kernel instead of starting a guest OS, which is exactly what is slowing the rolling update. Adding resources or automating the rollout does not remove the OS boot time.",
"Single sign-on makes the external identity provider authoritative, so disabling the Active Directory account immediately stops Google access. Removing IAM policies one by one is manual and misses the sign-in itself.",
"One public cloud gives the acquired startups shared infrastructure management, security and quality of service without per-site build-out or extra headcount.",
"The storage classes differ only in price and access pattern, not in durability or API. Coldline is priced for data read roughly once a quarter; retrieval is still immediate.",
"Near-unlimited capacity with no procurement is the defining property of public cloud. Containers and microservices are packaging models, and private cloud still requires you to buy the equipment.",
"A lightweight function triggered by database writes, integrating with Pub/Sub and Firebase, scaling to zero — Cloud Functions. GKE and Compute Engine need infrastructure management, and App Engine flexible does not scale to zero.",
"Huge volumes of sensor readings needing high-speed writes and low-latency reads are Bigtable's workload. Firestore and Cloud SQL do not sustain that write rate, and Data Fusion is an ETL tool.",
"Dataflow is the managed, autoscaling stream and batch processing service. Pub/Sub carries the events but does not process them, and Data Catalog and Dataprep serve other stages of the pipeline.",
"Cloud Build is the managed CI/CD service that runs builds, tests and deployments. Cloud Scheduler runs cron jobs, Cloud Code is an IDE plugin, and Deployment Manager provisions infrastructure.",
"Security Command Center is the organisation-wide posture and compliance dashboard spanning every project. Cloud Logging stores logs, IAM grants access, and Cloud Armor filters traffic.",
"Cloud VPN can be turned up in minutes over the existing internet connection. Interconnect and Direct Peering need physical provisioning that takes weeks.",
"Firebase is the fully featured mobile development platform, bundling auth, database, hosting, analytics and messaging. App Engine hosts the backend but is not mobile-specific.",
"Custom Linux images are imported and run on Compute Engine virtual machines. App Engine and GKE take code and containers, not machine images.",
"Dynamic scaling plus transactional SQL at scale is Spanner. BigQuery is analytical rather than transactional, Bigtable is not relational, and Pub/Sub is messaging.",
"Categorising objects in static images with a ready-made model is the Vision API. AutoML Video is for video, AutoML Tables and BigQuery ML for tabular data.",
"Private Google Access lets instances without external IP addresses reach Google APIs such as BigQuery and Cloud Storage over their public endpoints, using internal routing. Cloud NAT would give outbound internet access, breaking the requirement.",
"Cloud Data Loss Prevention discovers, classifies and de-identifies sensitive data such as PII. Secret Manager stores credentials, and Cloud Armor filters web traffic.",
"Storage Transfer Service is the managed, automated transfer for on-premises data and can use the existing Dedicated Interconnect. Transfer Appliance is a physical shipment, used when no such link exists.",
"BigQuery separates storage from compute and bills for bytes stored and bytes processed, matching the pay-for-what-you-store-and-query requirement. Cloud SQL, Spanner and Dataproc bill for provisioned capacity.",
"Fine-grained control of traffic between containers (network policies) and of scaling behaviour requires the Kubernetes control surface that GKE exposes. Cloud Run and App Engine deliberately hide those controls.",
"Security Command Center generates findings and recommendations for security risks and compliance violations. Firewalls and Cloud Armor enforce rules; Deployment Manager provisions resources.",
"Anthos is the platform that runs and manages applications consistently across Google Cloud, on-premises and other clouds, extending Google Cloud services to those environments.",
"Strong transactional consistency worldwide plus effectively unlimited growth describes Cloud Spanner. Cloud SQL scales vertically on one instance, and Firestore and Cloud Storage are not relational transactional stores.",
"Files, images and video are unstructured objects, which is exactly what Cloud Storage buckets hold, with IAM and signed URLs for secure sharing.",
"BigQuery ML lets people who already know SQL build and run models inside the warehouse, no ML engineering required. TensorFlow needs ML expertise, and LookML is a BI modelling language.",
"IAM is granted to groups, and group membership is managed once. Giving each employee access individually does not scale, and bucket location and IP filtering do not express who may view the data.",
"Database Migration Service performs continuous, encrypted replication into Cloud SQL, so the cutover is short. Batch inserts cause downtime, and the other services move analytics data or orchestrate workflows.",
"A project is the billing and isolation boundary in Google Cloud: separate projects keep development resources isolated and make their costs obvious. Tags, networks and extra billing accounts do not isolate resources.",
"The goal is to modernise as much as possible with cloud-native technology. Migrate for Anthos converts the VM workloads into containers; Migrate for Compute Engine and VMware Engine would only rehost them as VMs.",
"The requirement is minimal change with the maximum managed service, which is Compute Engine: same operating systems, but Google runs the hardware, hypervisor and networking. Note the community is split 50/50 with VMware Engine, which keeps the hypervisor as well.",
"Enhanced Support is the lowest tier that meets a 2-hour response target for high-impact cases. Premium is faster but more expensive; Standard and Basic do not meet it.",
"Identity Platform provides customer identity and access management for public apps: sign-up, sign-in, credential storage and access control for end users, as distinct from IAM for cloud administrators.",
"BigQuery ML builds and runs models with standard SQL against data already in the warehouse.",
"The baseline load runs constantly, so a commitment pays off there; the spikes are intermittent and are better served on demand. Committing to the spike level would leave capacity paid for and idle most of the time.",
"Creating the organization node first gives a single root for policy inheritance, billing and folder structure. Everything else can be arranged underneath afterwards.",
"Committed use discount sharing pools commitments across all projects in the billing account, so a commitment sized to the stable combined usage is consumed wherever it is needed, even as individual projects fluctuate.",
"Each geography imposes its own data protection rules, and none supersedes the others. A multinational has to meet the requirements of every region it operates in.",
"The steady requirement is 200 CPUs for three years, so commit to that at the deepest discount and let the intermittent spikes run on demand.",
"The Standard network service tier routes traffic over the public internet for most of its journey instead of Google's premium backbone, which lowers egress cost at the expense of performance.",
"Container images go to Artifact Registry, and virtual machine disk images are imported through Cloud Storage. The other pairs are analytics and messaging products.",
"Assign the IAM role to a Google Group that mirrors the LDAP group, then manage membership in the directory. Service accounts identify workloads, not people.",
"Visibility comes from seeing the spend (billing dashboards and reports) and from being able to slice it by owner (resource labels). Sustained use discounts and payment profiles affect what you pay, not what you can see.",
"Continuous processing of large data volumes with no servers or clusters to provision is Dataflow. Dataproc and GKE mean managing clusters.",
"Folders group by department and inherit policy; projects are the isolation boundary, so each environment gets its own. Projects cannot contain folders, and a Cloud Identity domain is not a segmentation tool.",
"Development and production belong in separate projects so that IAM, quotas and billing are isolated. Labels and tags do not isolate anything, and a project can span regions, so no extra project is needed per region.",
"Commitments are a billing matter, so Cloud Billing Support handles a mistaken purchase. Technical Support covers products, and Trust and Safety handles abuse.",
"Workloads authenticate as a service account, so the service account is the identity that must appear in the dataset's IAM policy. Instances and instance groups are not IAM principals.",
"Requester Pays moves the cost of downloads to the consumer, so the publishing team pays only for storage while the data stays openly accessible.",
"A top-level folder per team lets teams create and retire projects freely underneath while policy and cost roll up per team. One project per team becomes a bottleneck as the team's work changes.",
"The two tools differ in the target: Migrate for Anthos turns workloads into containers, Migrate for Compute Engine moves them onto virtual machines.",
"Google Cloud Directory Sync reads the LDAP directory and provisions matching Google accounts and groups, keeping them synchronised as the directory changes. It synchronises identities, not passwords.",
"A private connection between the on-premises data centre and the VPC keeps the traffic off the public internet and minimises latency, which one-off transfer tools cannot do. Note the option wording is loose: in practice this is Cloud VPN or Interconnect attached to the VPC.",
"Folders group projects for inherited IAM and organization policy, which is exactly the goal. Labels are metadata only, and separate domains or organizations would fragment administration.",
"Categorising text with a ready-made model is the Natural Language API. Dialogflow builds conversational agents, Recommendations AI suggests products, and TensorFlow requires you to train your own model. The dump's stored answer is wrong here.",
"Cloud costs follow usage, so they have to be reviewed frequently. Cloud spend is operating expenditure, not capital, and SLO breaches are unrelated to cost control.",
"TensorFlow is the open-source machine learning framework, and Cloud TPUs are built to accelerate it. BigQuery ML, Vision API and AutoML are managed services, not open-source platforms.",
"Unstructured data has no predefined schema: free-text comments and image files both qualify. Tags and location arrive as structured fields.",
"App Engine scales automatically with demand, which is what a seasonal sales peak needs. It does not manage inventory or make recommendations.",
"A model learns the labels it is given, so mislabelled training data produces wrong predictions. Privacy, compatibility and training time are not what mislabelling affects.",
"Consistent transactions worldwide plus unlimited growth is Cloud Spanner: relational and strongly consistent, but horizontally scalable across regions.",
"Spreading workloads across more than one cloud removes the single provider as a single point of failure, so demand spikes and outages in one are less likely to take the service down.",
"Kubernetes performs rolling updates, replacing pods gradually so the application keeps serving during a release. GKE does not manage source version control, and monoliths are not its best fit.",
"Apigee's analytics measure and track how APIs perform and are used. It manages APIs rather than marketing them, and it does not measure development speed.",
"A relational database stores structured rows and columns, so inventory records fit without processing. Photographs, video and chat transcripts are unstructured.",
"An API exposes the legacy system's data and functions to the new mobile app, so the old system keeps running untouched. The hotel still has to build the app itself.",
"Public cloud spreads the cost of storage and serving across many tenants, so digitising and sharing large volumes is cheaper at scale. It reduces capital expenditure rather than optimising it, and removes in-house hardware management.",
"Cloud-native applications are built for frequent, incremental releases, so features can ship in small agile increments rather than in large scheduled rewrites.",
"A hypervisor virtualises the hardware so several guest operating systems can share one physical machine. Containers share a single operating system instead.",
"Extending helpline hours responds to the expectation that services are available whenever the customer wants them, which is the always-on expectation cloud services created.",
"Moving off-premises removes the day-to-day work of running the data centre, so infrastructure management and the personnel cost attached to it fall.",
"An API connects the inventory system to the website programmatically, so stock levels shown online reflect what is actually in the store, continuously and without manual work.",
"A model that must predict events anywhere in the country needs data from everywhere, including normal conditions, or it learns a biased picture. Sampling only at-risk cities or only extreme events skews the training set.",
"Cloud Logging aggregates logs from every container, so the relevant application output can be searched in one place. Cloud Trace measures latency, and Cloud Monitoring tracks metrics.",
"Breaking down silos works when both teams are measured on the same business outcome rather than on their own component, which is the core of the DevOps culture. Blame and blanket access do not.",
"A managed cloud database keeps every reservation transaction accurate and consistent at scale, including during peaks, which is what a booking system depends on.",
"An application that requires its own operating system needs a virtual machine; containers share the host's kernel and cannot provide a separate OS.",
"Breaches have to be planned for, not just prevented: an incident response plan limits the damage. Security is a shared responsibility, and weakening authentication would make matters worse.",
"A data warehouse holds structured and semi-structured data from many sources together and is built for querying and analysis. A relational database serves applications, and a data lake keeps data raw.",
"Machine learning improves its suggestions as more data arrives, which is what 'improves over time' asks for. Regression and trend analysis are static analyses.",
]
assert len(EXPL)==92 and len(TOPICS)==92

def js(s):
    return "'" + s.replace('\\','\\\\').replace("'","\\'") + "'"

def difficulty(q):
    if q['votes']:
        top=max(p for _,p in q['votes'])
        return 'easy' if top>=90 else 'medium' if top>=70 else 'hard'
    if q['correct_answer'] and ''.join(q['most_voted'])!=q['correct_answer']: return 'hard'
    return 'medium'

out=["""/**
 * Community exam bank — Cloud Digital Leader questions as they circulate on
 * ExamTopics, kept verbatim so the wording matches what people actually meet.
 *
 * The answer on every question is the community's MOST VOTED choice, not the
 * "Correct Answer" the dumps print: on 15 of these two disagree, and the stored
 * answer is the wrong one. `votes` carries the published vote distribution, and
 * `verbatim` tells the validator not to complain that the options are uneven —
 * they are quoted, not written here.
 */

export const community = ["""]

for n,(q,topic,expl) in enumerate(zip(qs,TOPICS,EXPL), start=1):
    idx={l:i for i,l in enumerate(q['letters'])}
    ans=[idx[l] for l in q['most_voted']]
    answer=str(ans[0]) if len(ans)==1 else '[' + ', '.join(map(str,sorted(ans))) + ']'
    prompt=q['prompt']
    if len(ans)>1 and 'choose' not in prompt.lower():
        prompt += ' (Choose two.)'
    body=[f"  {{",
          f"    id: 'et-{n:02d}',",
          f"    topic: {js(topic)},",
          f"    difficulty: '{difficulty(q)}',",
          f"    verbatim: true,",
          f"    prompt: {js(prompt)},",
          "    options: [",
          *[f"      {js(o)}," for o in q['options']],
          "    ],",
          f"    answer: {answer},",
          f"    explanation: {js(expl)}"]
    if q['votes']:
        rows=[]
        for letters,pct in q['votes']:
            picks=[idx[l] for l in letters if l in idx]
            if picks: rows.append('{ pick: [' + ', '.join(map(str,sorted(picks))) + '], pct: ' + str(pct) + ' }')
        if rows:
            body[-1]+=','
            body.append('    votes: [' + ', '.join(rows) + ']')
    body.append('  },')
    out.append('\n'.join(body))
out.append('];\n')
open('community.js','w').write('\n'.join(out))
print('wrote community.js', len(qs), 'questions')
import collections
print('topics:', dict(collections.Counter(TOPICS)))
print('difficulty:', dict(collections.Counter(difficulty(q) for q in qs)))
print('with vote bars:', sum(1 for q in qs if q['votes']))
