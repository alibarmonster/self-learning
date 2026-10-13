/**
 * Section 4 — Modernize infrastructure and applications with Google Cloud (~17%)
 * Migration paths, compute options, serverless, containers, APIs, and hybrid
 * and multicloud with Anthos.
 */

import type { Question } from '@/types';

export const infrastructure: Question[] = [
  // ── Cloud modernisation and migration ────────────────────────────────────
  {
    id: 'infra-01',
    topic: 'Migration paths',
    difficulty: 'easy',
    prompt: 'What does "lift and shift" (rehost) mean?',
    options: [
      'Moving an application to the cloud largely as-is, typically onto virtual machines, without changing its code.',
      'Moving an application to the cloud while swapping its database for a managed service such as Cloud SQL.',
      'Moving an application to the cloud by rebuilding it as containers before the migration begins.',
      'Moving an application\'s data to the cloud while the application itself stays on-premises.'
    ],
    answer: 0,
    explanation:
      'Rehosting is the fastest migration: the same application, the same operating system, now on Compute Engine instead of your own servers. It gets you off ageing hardware quickly; modernisation can follow later.'
  },
  {
    id: 'infra-02',
    topic: 'Migration paths',
    difficulty: 'medium',
    prompt: 'Which migration approach is described as "move and improve"?',
    options: [
      'Rehost: move the application as-is onto virtual machines in the cloud.',
      'Replatform: move the application with modest changes to use managed services.',
      'Refactor: rebuild the application as containers and microservices first.',
      'Reimagine: redesign the business process and build a new application.'
    ],
    answer: 1,
    explanation:
      'Replatforming keeps the core application but improves parts of it during the move. It costs more effort than a pure lift-and-shift and less than a full refactor.'
  },
  {
    id: 'infra-03',
    topic: 'Migration paths',
    difficulty: 'medium',
    prompt: 'What distinguishes "refactor" from "reimagine" in cloud migration?',
    options: [
      'Refactor rearchitects an existing application to be cloud-native; reimagine rethinks the business process and builds something new.',
      'Refactor rethinks the business process and builds something new; reimagine rearchitects an existing application to be cloud-native.',
      'Refactor changes the application\'s code; reimagine changes only the infrastructure it runs on.',
      'Refactor is done before migration; reimagine is done after the application is already in the cloud.'
    ],
    answer: 0,
    explanation:
      'Refactoring changes how the application is built. Reimagining questions whether the application should exist in its current form at all — replacing a batch reconciliation with real-time streaming, say.'
  },
  {
    id: 'infra-04',
    topic: 'Migration paths',
    difficulty: 'easy',
    prompt: 'During a migration assessment a team decides one legacy application is no longer used and can be shut down. Which migration term applies?',
    options: ['Retain', 'Retire', 'Rehost', 'Replatform'],
    answer: 1,
    explanation:
      'Retire means decommission. Retain means leave it where it is for now — usually because it cannot move yet. Both are legitimate outcomes of assessing a portfolio of workloads.'
  },

  // ── Computing in the cloud ───────────────────────────────────────────────
  {
    id: 'infra-05',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What is a virtual machine (VM)?',
    options: [
      'A physical server in a Google data centre reserved for a single customer\'s exclusive use and billed monthly.',
      'A software emulation of a computer, with its own operating system, running on shared physical hardware.',
      'A packaged application with its dependencies that shares the host machine\'s operating system kernel.',
      'A managed runtime that executes application code on demand without an operating system to maintain.'
    ],
    answer: 1,
    explanation:
      'Virtualisation lets one physical server host many isolated VMs, each with its own OS. Compute Engine sells VMs by the second in many sizes; this is the IaaS layer.'
  },
  {
    id: 'infra-06',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What is the main difference between a container and a virtual machine?',
    options: [
      'A container includes its own guest operating system; a VM shares the host kernel, so a VM is lighter.',
      'A container packages an app with its dependencies and shares the host kernel; a VM carries its own full OS.',
      'A container runs only on Kubernetes; a VM runs on any hypervisor, so a VM is more portable.',
      'A container is a snapshot of a VM\'s disk; a VM is the running instance started from that snapshot.'
    ],
    answer: 1,
    explanation:
      'A VM virtualises hardware; a container virtualises the operating system. Containers start in seconds, use fewer resources and run identically on a laptop, on-premises or in any cloud.'
  },
  {
    id: 'infra-07',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What is a microservices architecture?',
    options: [
      'An application built as small, independently deployable services that communicate over APIs.',
      'An application built as a single deployable unit, split internally into modules that share a database.',
      'An application built to run on small virtual machines, so that it can be scaled by adding more of them.',
      'An application built from serverless functions, each triggered by an event rather than a request.'
    ],
    answer: 0,
    explanation:
      'Breaking a monolith into microservices lets teams deploy and scale each part on its own. Containers and Kubernetes are the usual packaging and orchestration for them.'
  },
  {
    id: 'infra-08',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What is Kubernetes, and what is GKE?',
    options: [
      'Kubernetes is an open source container orchestrator; GKE is Google Cloud\'s managed Kubernetes service.',
      'Kubernetes is Google Cloud\'s managed container service; GKE is the open source project it is built on.',
      'Kubernetes is a container runtime that starts and stops containers; GKE is the registry that stores their images.',
      'Kubernetes is a serverless container platform; GKE is the version that runs on customer-managed nodes.'
    ],
    answer: 0,
    explanation:
      'Kubernetes — originally created at Google — schedules containers across a cluster, restarts them when they fail and scales them. GKE runs the cluster for you so the team focuses on the workloads.'
  },
  {
    id: 'infra-09',
    topic: 'Compute & containers',
    difficulty: 'medium',
    prompt: 'A research team runs large batch jobs that can be interrupted and restarted. Which Compute Engine option cuts their cost most?',
    options: [
      'Standard on-demand VMs, sized precisely to the job',
      'Spot VMs, heavily discounted but reclaimable by Google at short notice',
      'Sole-tenant nodes, dedicated to the research team\'s jobs alone',
      'Standard VMs under a one-year committed use discount contract'
    ],
    answer: 1,
    explanation:
      'Spot (formerly preemptible) VMs use spare capacity at a large discount. Because they can be stopped at any time, they suit fault-tolerant batch work — rendering, simulations, data processing — not a customer-facing database.'
  },
  {
    id: 'infra-10',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What does autoscaling do?',
    options: [
      'Automatically adds or removes instances in response to load, so capacity matches demand.',
      'Automatically resizes an instance\'s CPU and memory in place as its load changes.',
      'Automatically moves instances to the region with the most spare capacity.',
      'Automatically upgrades instances to newer machine types as they are released.'
    ],
    answer: 0,
    explanation:
      'Autoscaling is elasticity made concrete: a managed instance group or GKE cluster watches CPU or request metrics and changes its size. It is how the cloud avoids provisioning for the worst day of the year.'
  },
  {
    id: 'infra-11',
    topic: 'Compute & containers',
    difficulty: 'easy',
    prompt: 'What does a load balancer do?',
    options: [
      'Distributes incoming requests across multiple healthy instances and routes around failed ones.',
      'Adds or removes instances behind an application as the volume of incoming requests changes.',
      'Caches responses at the network edge so repeated requests never reach the instances.',
      'Inspects incoming requests and blocks those that match known attack signatures.'
    ],
    answer: 0,
    explanation:
      'Load balancing and autoscaling work together: the scaler adds instances, the balancer spreads traffic across them. Google\'s global load balancer can also route each user to the nearest region.'
  },
  {
    id: 'infra-12',
    topic: 'Compute & containers',
    difficulty: 'medium',
    prompt: 'Which TWO are benefits of containers for application modernisation? (Choose two.)',
    options: [
      'Portability: the same image runs on a laptop, on-premises and in any cloud.',
      'Isolation: each container includes its own operating system kernel for security.',
      'Consistency: dependencies travel with the application, so environment differences disappear.',
      'Performance: containers run faster than the same code on a virtual machine.'
    ],
    answer: [0, 2],
    explanation:
      'Containers package an application with everything it needs, which is what makes them portable and consistent across environments. They do nothing about the correctness of the code inside.'
  },

  // ── Serverless computing ─────────────────────────────────────────────────
  {
    id: 'infra-13',
    topic: 'Serverless',
    difficulty: 'easy',
    prompt: 'What does "serverless" mean?',
    options: [
      'The provider manages the servers entirely; you deploy code or containers, it scales automatically and you pay only while it runs.',
      'The provider manages the virtual machines; you deploy code onto them and pay for the machines while they are switched on.',
      'The application runs entirely in the user\'s browser, so no backend servers are needed at all.',
      'The provider runs the servers in a location you do not choose, so you cannot see or select the region.'
    ],
    answer: 0,
    explanation:
      'There are still servers — you just never see, size or patch them. Cloud Run, Cloud Functions and App Engine are Google Cloud\'s serverless compute options.'
  },
  {
    id: 'infra-14',
    topic: 'Serverless',
    difficulty: 'medium',
    prompt: 'A developer has a containerised web service and wants it to scale from zero to thousands of requests with no cluster to manage. Which product fits?',
    options: [
      'GKE Autopilot',
      'Cloud Run',
      'App Engine standard',
      'Compute Engine with autoscaling'
    ],
    answer: 1,
    explanation:
      'Cloud Run runs any container in a serverless way: give it an image, it handles HTTPS, scaling and billing per request. GKE would work too, but there would be a cluster to run.'
  },
  {
    id: 'infra-15',
    topic: 'Serverless',
    difficulty: 'easy',
    prompt: 'A team wants a small piece of code to run every time a file is uploaded to a Cloud Storage bucket, and nothing to run otherwise. Which service is designed for that?',
    options: [
      'Cloud Functions',
      'Cloud Run jobs',
      'App Engine',
      'Cloud Scheduler'
    ],
    answer: 0,
    explanation:
      'Cloud Functions (now Cloud Run functions) is event-driven, function-as-a-service compute: a snippet triggered by an event such as a storage upload, a Pub/Sub message or an HTTP call.'
  },
  {
    id: 'infra-16',
    topic: 'Serverless',
    difficulty: 'hard',
    prompt: 'Which TWO of these are serverless compute products on Google Cloud? (Choose two.)',
    options: [
      'Compute Engine',
      'Cloud Run',
      'App Engine',
      'GKE Standard'
    ],
    answer: [1, 2],
    explanation:
      'Cloud Run and App Engine (along with Cloud Functions) let you deploy without managing servers. Compute Engine is IaaS — you manage the VMs — and Cloud Storage is storage, not compute.'
  },

  // ── The value of APIs ────────────────────────────────────────────────────
  {
    id: 'infra-17',
    topic: 'APIs & Apigee',
    difficulty: 'easy',
    prompt: 'What is an application programming interface (API)?',
    options: [
      'A defined way for one piece of software to request services or data from another, without knowing its internals.',
      'A graphical interface through which administrators configure the services an application depends on at runtime.',
      'A shared database schema that two applications agree on so that each can read and write the other\'s tables.',
      'A network rule that allows one application to reach another through a firewall on an agreed port and protocol.'
    ],
    answer: 0,
    explanation:
      'An API is a contract: send a request in this shape, get a response in that shape. It is how a mobile app talks to a backend, and how a bank can let partners build on its services.'
  },
  {
    id: 'infra-18',
    topic: 'APIs & Apigee',
    difficulty: 'medium',
    prompt: 'What is Apigee used for?',
    options: [
      'Designing, securing, publishing, monitoring and monetising APIs: an API management platform.',
      'Building and deploying serverless APIs from source code without managing infrastructure.',
      'Discovering and cataloguing the APIs that exist across an organisation\'s projects.',
      'Load balancing API traffic across regions and protecting it from DDoS attacks.'
    ],
    answer: 0,
    explanation:
      'Apigee sits in front of your services and handles authentication, rate limiting, analytics, a developer portal and billing. It turns internal capabilities into products that partners can consume.'
  },
  {
    id: 'infra-19',
    topic: 'APIs & Apigee',
    difficulty: 'medium',
    prompt: 'How can exposing public APIs create new business opportunities?',
    options: [
      'Partners and developers can build on your services, extending your reach into new channels, and usage can be monetised.',
      'Public APIs remove the need for a sales team, because customers discover, integrate and pay without any human contact.',
      'Public APIs shift security responsibility to the partners who call them, reducing your own exposure and audit scope.',
      'Public APIs let you pull a partner\'s data into your own systems, enlarging your data estate for analytics and ML.'
    ],
    answer: 0,
    explanation:
      'Payment processors, mapping providers and airlines all earn revenue or distribution through APIs. Managing them well — versioning, quotas, billing — is where Apigee comes in.'
  },

  // ── Hybrid and multicloud ────────────────────────────────────────────────
  {
    id: 'infra-20',
    topic: 'Hybrid & multicloud',
    difficulty: 'medium',
    prompt: 'What is Anthos?',
    options: [
      'A platform for running and managing applications consistently across on-premises, Google Cloud and other clouds.',
      'A platform for migrating virtual machines from on-premises data centres into Compute Engine with minimal downtime.',
      'A platform for hosting containers serverlessly across regions, scaling each service to zero between requests.',
      'A platform for managing API traffic between on-premises systems and cloud services, with quotas and analytics.'
    ],
    answer: 0,
    explanation:
      'Anthos (now part of Google Distributed Cloud / GKE Enterprise) extends Kubernetes-based management to wherever your workloads run, so a hybrid or multicloud estate has one way of deploying, securing and observing.'
  },
  {
    id: 'infra-21',
    topic: 'Hybrid & multicloud',
    difficulty: 'medium',
    prompt: 'Which is a valid reason an organisation might choose a hybrid cloud strategy?',
    options: [
      'Some workloads must stay on-premises for regulatory, latency or legacy reasons while others benefit from public cloud.',
      'Running the same workload in two public clouds at once protects the organisation against a single provider\'s outage.',
      'Keeping a copy of every cloud workload on-premises guarantees the lowest possible total cost over the hardware\'s life.',
      'Public cloud cannot run relational databases with transactions, so those systems must remain on-premises.'
    ],
    answer: 0,
    explanation:
      'Hybrid is usually a practical compromise rather than an ideal: data residency rules, a factory floor that needs local processing, or a mainframe that cannot move yet, alongside cloud for everything else.'
  },
  {
    id: 'infra-22',
    topic: 'Hybrid & multicloud',
    difficulty: 'medium',
    prompt: 'A company runs Kubernetes on-premises and on Google Cloud and struggles to apply the same security policies to both. What is the business value Anthos offers here?',
    options: [
      'A single control plane for configuration, policy and observability across every cluster, reducing effort and inconsistency.',
      'Automatic migration of the on-premises cluster into Google Cloud, so that only one environment remains to be secured.',
      'A managed VPN between the two clusters, so that workloads and their policies can move between them at any time.',
      'A single billing account covering both clusters, so that the cost of each security policy can be compared side by side.'
    ],
    answer: 0,
    explanation:
      'The value of Anthos is uniformity: define a policy once, enforce it everywhere, see everything in one dashboard. That is the "single pane of glass" the exam guide refers to.'
  },

  {
    id: 'infra-23',
    topic: 'Migration paths',
    difficulty: 'medium',
    prompt:
      'A company has 300 VMware virtual machines on-premises and wants them in Google Cloud in three months with almost no application changes. Which path should it take first?',
    options: [
      'Refactor the applications into containers on GKE before moving them, so they arrive cloud-native.',
      'Rehost the VMs to Compute Engine or Google Cloud VMware Engine, then modernise selectively.',
      'Replatform each application onto Cloud Run during the move, swapping databases for Cloud SQL.',
      'Reimagine the applications as serverless functions before the deadline, retiring the VMs.'
    ],
    answer: 1,
    explanation:
      'Timeline and change appetite decide the path. Lift and shift moves fast and lowers risk; the exam guide explicitly ties the rehost path to legacy applications, with "move and improve" as the next step.'
  },
  {
    id: 'infra-24',
    topic: 'Serverless',
    difficulty: 'medium',
    prompt: 'What is the main business benefit of serverless computing?',
    options: [
      'Applications run faster than on other platforms because the provider assigns dedicated hardware to each function.',
      'Teams pay only for actual execution and never manage servers, so effort shifts from infrastructure to features.',
      'Applications can be deployed without a code repository, because the provider stores and versions the source.',
      'Teams get a fixed monthly price for compute regardless of traffic, so budgeting becomes fully predictable.'
    ],
    answer: 1,
    explanation:
      'Serverless is the extreme of the "let the provider manage it" trade-off: no capacity planning, no idle cost, automatic scaling. The price is less control over the runtime environment.'
  },
  {
    id: 'infra-25',
    topic: 'APIs & Apigee',
    difficulty: 'medium',
    prompt: 'A bank wants to let fintech partners access account data under open-banking rules, with strict quotas, authentication and usage analytics. Which product should it use?',
    options: [
      'Apigee',
      'Cloud Endpoints',
      'Cloud Armor',
      'Identity-Aware Proxy'
    ],
    answer: 0,
    explanation:
      'This is textbook API management: expose a controlled interface to outside developers, enforce security and rate limits, and measure use. Apigee is Google Cloud\'s product for it.'
  },
  {
    id: 'infra-26',
    topic: 'Hybrid & multicloud',
    difficulty: 'easy',
    prompt: 'Which is a common business reason for a multicloud strategy?',
    options: [
      'Avoiding dependence on a single provider and choosing best-of-breed services from each.',
      'Reducing operational complexity, because each provider manages part of the estate.',
      'Meeting a legal requirement that critical systems be hosted by two different providers.',
      'Lowering cost, because each provider competes to host the same workload.'
    ],
    answer: 0,
    explanation:
      'Reducing lock-in, resilience against a provider outage, and picking the best service for each workload are the reasons the guide lists. The cost is added operational complexity — which is exactly what Anthos and open standards like Kubernetes aim to reduce.'
  },
  {
    id: 'infra-27',
    topic: 'Compute & containers',
    difficulty: 'medium',
    prompt: 'A team wants Kubernetes but does not want to manage nodes, upgrades or cluster sizing at all. Which option fits?',
    options: [
      'GKE Autopilot',
      'GKE Standard with node auto-provisioning',
      'Cloud Run',
      'Compute Engine with a managed instance group'
    ],
    answer: 0,
    explanation:
      'GKE comes in two modes: Standard, where you configure and pay for node pools, and Autopilot, where Google runs the nodes and bills per workload. Autopilot moves GKE closer to the serverless end of the spectrum.'
  },


  // ── Scenario questions: a business situation, four plausible options ─────
  {
    id: 'infra-28',
    topic: 'Compute & containers',
    difficulty: 'medium',
    prompt:
      'A customer\'s IT team is modernising its customer-facing applications. They have seen others get good results from microservices and want to adopt them. The first application has about ten sub-parts, which they have identified as the services, and each has different scale requirements — user login is used rarely while transactions is used heavily. What technical strategy would you recommend?',
    options: [
      'Containerise the services and orchestrate them with Google Kubernetes Engine.',
      'Retain the original application in Compute Engine and scale it as needed using unmanaged instance groups.',
      'Retain the original application as a backup and, for separately scaling the services, create new application binaries.',
      'Retain the original application in Compute Engine and scale it as needed using managed instance groups.'
    ],
    answer: 0,
    explanation:
      'Independent services with independent scaling is exactly what containers plus an orchestrator give you: each service is its own deployment that GKE scales on its own metrics. Scaling the original monolith — with managed or unmanaged instance groups — scales everything together, which wastes money on the login path to keep up with transactions.',
    tip: 'When services need to scale independently, the answer contains "containers" and "Kubernetes".'
  },
  {
    id: 'infra-29',
    topic: 'Serverless',
    difficulty: 'medium',
    prompt:
      'A start-up has built a small API in a container. Traffic is near zero overnight and spikes unpredictably when a marketing post goes viral. The two developers do not want to size, patch or pay for idle servers, and they have no Kubernetes experience. Which service should they deploy to?',
    options: [
      'Cloud Run',
      'Google Kubernetes Engine',
      'App Engine flexible',
      'Compute Engine with autoscaling'
    ],
    answer: 0,
    explanation:
      'A container, scale to zero, no cluster, pay per request — Cloud Run. GKE would work but hands them a cluster to run; Compute Engine hands them servers; Bigtable is a database.'
  },
  {
    id: 'infra-30',
    topic: 'Migration paths',
    difficulty: 'medium',
    prompt:
      'A manufacturer\'s data-centre lease ends in four months. It runs 200 applications on virtual machines and has no capacity to change code before the deadline, but wants to modernise selectively afterwards. Which migration strategy should it adopt first?',
    options: [
      'Rehost the VMs to Compute Engine now, then replatform or refactor the applications that will benefit.',
      'Replatform each application onto managed services as it moves, so nothing is migrated twice.',
      'Refactor the most critical applications first and rehost the rest after the lease ends.',
      'Retain the applications on-premises by extending the lease, then migrate when code changes are possible.'
    ],
    answer: 0,
    explanation:
      'A hard deadline and no change capacity means lift and shift first — it is the only path that fits four months for 200 workloads. Modernisation is a second phase per application; refactoring or reimagining everything up front would blow both the timeline and the budget.'
  },
  {
    id: 'infra-31',
    topic: 'APIs & Apigee',
    difficulty: 'medium',
    prompt:
      'An insurer wants to let partner brokers quote and bind policies from their own software. It needs to authenticate each partner, cap how many requests each can make, see usage analytics, and eventually charge per call. Which Google Cloud product addresses these needs?',
    options: [
      'Apigee',
      'Cloud Endpoints',
      'Cloud Load Balancing',
      'Identity Platform'
    ],
    answer: 0,
    explanation:
      'Authentication of consumers, quotas, analytics and monetisation are the four pillars of API management, and Apigee is the product. Cloud Armor protects against attacks, Cloud Functions runs code, Pub/Sub carries messages — none manages a partner API programme.'
  },
  {
    id: 'infra-32',
    topic: 'Hybrid & multicloud',
    difficulty: 'hard',
    prompt:
      'A bank must keep its core ledger on-premises for at least five more years under a regulator\'s direction, but wants new digital services in Google Cloud and, for resilience, some workloads on a second public cloud. The operations team is worried about running three environments with three different toolsets. What should the bank adopt?',
    options: [
      'A hybrid and multicloud platform such as Anthos / GKE Enterprise, managing all three environments from one control plane.',
      'A dedicated interconnect between the on-premises ledger and each cloud, with separate tooling per environment.',
      'A managed migration of the ledger into a private region inside Google Cloud to satisfy the regulator.',
      'A single public cloud for everything new, with the second cloud limited to backups.'
    ],
    answer: 0,
    explanation:
      'The constraint (ledger stays) and the goals (cloud services, multi-provider resilience) are both fixed; the problem is operational consistency. Anthos exists to apply one set of policies, deployments and observability across on-prem, Google Cloud and other clouds.'
  },
  {
    id: 'infra-33',
    topic: 'Compute & containers',
    difficulty: 'medium',
    prompt:
      'A pharmaceutical research team runs molecular simulations that take many hours, checkpoint their progress, and can be restarted from the last checkpoint if a machine disappears. The finance team has asked them to cut compute cost sharply. Which option should they use?',
    options: [
      'Spot VMs on Compute Engine',
      'Committed use discounts on standard VMs',
      'Cloud Run jobs',
      'GKE Autopilot'
    ],
    answer: 0,
    explanation:
      'Interruptible, checkpointed batch work is the textbook Spot VM case: a very large discount in exchange for the risk of pre-emption the workload already tolerates. Committed use helps steady workloads; Cloud Run is for request-driven services; sole-tenant nodes cost more, not less.'
  },
];
