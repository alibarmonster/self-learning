/**
 * Community exam bank — 289 Cloud Digital Leader questions as they circulate on
 * ExamTopics, kept verbatim so the wording matches what people actually meet.
 * The numbering has no gaps, so `et-NNN` is that question's number on the site.
 *
 * The answer on every question is the community's MOST VOTED choice, not the
 * "Correct Answer" the dumps print: on 15 of these two disagree, and the stored
 * answer is the wrong one. `votes` carries the published vote distribution where
 * the dump included one — the later questions were published without vote
 * percentages, so they reveal without a bar. `verbatim` tells the validator not
 * to complain that the options are uneven: they are quoted, not written here.
 */

import type { Question } from '@/types';

export const community: Question[] = [
  {
    id: 'et-001',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'You are migrating workloads to the cloud. The goal of the migration is to serve customers worldwide as quickly as possible According to local regulations, certain data is required to be stored in a specific geographic area, and it can be served worldwide. You need to design the architecture and deployment for your workloads. What should you do?',
    options: [
      'Select a public cloud provider that is only active in the required geographic area',
      'Select a private cloud provider that globally replicates data storage for fast data access',
      'Select a public cloud provider that guarantees data location in the required geographic area',
      'Select a private cloud provider that is only active in the required geographic area',
    ],
    answer: 2,
    explanation: 'Data residency is a location requirement, not a reason to avoid public cloud. A public cloud provider that lets you pin storage to a named region satisfies the regulator while its global network still serves the data worldwide. A provider active only in that region cannot serve customers quickly elsewhere.',
    votes: [{ pick: [2], pct: 99 }]
  },
  {
    id: 'et-002',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization needs a large amount of extra computing power within the next two weeks. After those two weeks, the need for the additional resources will end. Which is the most cost-effective approach?',
    options: [
      'Use a committed use discount to reserve a very powerful virtual machine',
      'Purchase one very powerful physical computer',
      'Start a very powerful virtual machine without using a committed use discount',
      'Purchase multiple physical computers and scale workload across them',
    ],
    answer: 2,
    explanation: 'The need lasts two weeks, so any commitment is wasted. Committed use discounts lock you in for one or three years, and buying hardware is worse still. On-demand pricing costs more per hour but nothing after the fortnight ends.',
    votes: [{ pick: [2], pct: 96 }]
  },
  {
    id: 'et-003',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to plan its cloud infrastructure expenditures. Which should your organization do?',
    options: [
      'Review cloud resource costs frequently, because costs change often based on use',
      'Review cloud resource costs annually as part of planning your organization\'s overall budget',
      'If your organization uses only cloud resources, infrastructure costs are no longer part of your overall budget',
      'Involve fewer people in cloud resource planning than your organization did for on-premises resource planning',
    ],
    answer: 0,
    explanation: 'Cloud spend tracks usage, and usage changes daily, so an annual review discovers problems months late. Cloud costs remain part of the budget, and cost decisions need more people involved, not fewer.',
    votes: [{ pick: [0], pct: 81 }]
  },
  {
    id: 'et-004',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'The operating systems of some of your organization\'s virtual machines may have a security vulnerability. How can your organization most effectively identify all virtual machines that do not have the latest security update?',
    options: [
      'View the Security Command Center to identify virtual machines running vulnerable disk images',
      'View the Compliance Reports Manager to identify and download a recent PCI audit',
      'View the Security Command Center to identify virtual machines started more than 2 weeks ago',
      'View the Compliance Reports Manager to identify and download a recent SOC 1 audit',
    ],
    answer: 0,
    explanation: 'Security Command Center surfaces vulnerability findings, including VMs running images that are missing security updates. Compliance Reports Manager only supplies Google\'s own audit reports, and instance age is not evidence of a missing patch.',
    votes: [{ pick: [0], pct: 98 }]
  },
  {
    id: 'et-005',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'You are currently managing workloads running on Windows Server for which your company owns the licenses. Your workloads are only needed during working hours, which allows you to shut down the instances during the weekend. Your Windows Server licenses are up for renewal in a month, and you want to optimize your license cost. What should you do?',
    options: [
      'Renew your licenses for an additional period of 3 years. Renew your licenses for an additional period of 3 years. Negotiate a cost reduction with your current hosting provider wherein infrastructure cost is reduced when workloads are not in use',
      'Renew your licenses for an additional period of 2 years. Negotiate a cost reduction by committing to an automatic renewal of the licenses at the end of the 2 year period',
      'Migrate the workloads to Compute Engine with a bring-your-own-license (BYOL) model',
      'Migrate the workloads to Compute Engine with a pay-as-you-go (PAYG) model',
    ],
    answer: 3,
    explanation: 'The licences are up for renewal, so there is nothing left to bring. Pay-as-you-go on Compute Engine means you stop paying for the licence while the instances are shut down at the weekend, which BYOL and multi-year renewals cannot do.',
    votes: [{ pick: [3], pct: 80 }, { pick: [2], pct: 20 }]
  },
  {
    id: 'et-006',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization runs a distributed application in the Compute Engine virtual machines. Your organization needs redundancy, but it also needs extremely fast communication (less than 10 milliseconds) between the parts of the application in different virtual machines. Where should your organization locate this virtual machines?',
    options: [
      'In a single zone within a single region',
      'In different zones within a single region',
      'In multiple regions, using one zone per region',
      'In multiple regions, using multiple zones per region',
    ],
    answer: 1,
    explanation: 'Zones inside one region are separate failure domains connected by low-latency links, so they give redundancy while staying well under 10 ms. A single zone gives no redundancy; separate regions add tens of milliseconds.',
    votes: [{ pick: [1], pct: 78 }, { pick: [3], pct: 16 }]
  },
  {
    id: 'et-007',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization decides to migrate their on-premises environment to the cloud. They need to determine which resource components still need to be assigned ownership. Which two functions does a public cloud provider own? (Choose two.)',
    options: [
      'Hardware maintenance',
      'Infrastructure architecture',
      'Infrastructure deployment automation',
      'Hardware capacity management',
      'Fixing application security issues',
    ],
    answer: [0, 3],
    explanation: 'On IaaS the provider owns the physical layer: maintaining the hardware and having enough of it. Architecture, deployment automation and application security stay with the customer.',
    votes: [{ pick: [0, 3], pct: 97 }]
  },
  {
    id: 'et-008',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'You are a program manager within a Software as a Service (SaaS) company that offers rendering software for animation studios. Your team needs the ability to allow scenes to be scheduled at will and to be interrupted at any time to restart later. Any individual scene rendering takes less than 12 hours to complete, and there is no service-level agreement (SLA) for the completion time for all scenes. Results will be stored in a global Cloud Storage bucket. The compute resources are not bound to any single geographical location. This software needs to run on Google Cloud in a cost-optimized way. What should you do?',
    options: [
      'Deploy the application on Compute Engine using Spot instances',
      'Develop the application so it can run in an unmanaged instance group',
      'Create a reservation for the minimum number of Compute Engine instances you will use',
      'Start more instances with fewer virtual centralized processing units (vCPUs) instead of fewer instances with more vCPUs'
    ],
    answer: 0,
    explanation: 'Interruptible, restartable work with no completion SLA is the textbook Spot VM case — a large discount in exchange for a risk the workload already tolerates. Reservations and instance shape do not reduce the rate. Current names: preemptible VMs are the legacy model; Spot VMs replace them, with no 24-hour limit.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-009',
    topic: 'Resource hierarchy & governance',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your manager wants to restrict communication of all virtual machines with internet access; with resources in another network; or with a resource outside Compute Engine. It is expected that different teams will create new folders and projects in the near future. How would you restrict all virtual machines from having an external IP address?',
    options: [
      'Define an organization policy at the root organization node to restrict virtual machine instances from having an external IP address',
      'Define an organization policy on all existing folders to define a constraint to restrict virtual machine instances from having an external IP address',
      'Define an organization policy on all existing projects to restrict virtual machine instances from having an external IP address',
      'Communicate with the different teams and agree that each time a virtual machine is created, it must be configured without an external IP address',
    ],
    answer: 0,
    explanation: 'Organization policy constraints are inherited down the hierarchy, so setting `constraints/compute.vmExternalIpAccess` at the organization node also covers folders and projects created later. Applying it to today\'s folders or projects leaves tomorrow\'s uncovered.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-010',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your multinational organization has servers running mission-critical workloads on its premises around the world. You want to be able to manage these workloads consistently and centrally, and you want to stop managing infrastructure. What should your organization do?',
    options: [
      'Migrate the workloads to a public cloud',
      'Migrate the workloads to a central office building',
      'Migrate the workloads to multiple local co-location facilities',
      'Migrate the workloads to multiple local private clouds',
    ],
    answer: 0,
    explanation: 'Public cloud gives central, consistent management and removes infrastructure work. Co-location and private clouds leave the organisation still managing the servers.'
  },
  {
    id: 'et-011',
    topic: 'Networking',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your organization stores highly sensitive data on-premises that cannot be sent over the public internet. The data must be processed both on-premises and in the cloud. What should your organization do?',
    options: [
      'Configure Identity-Aware Proxy (IAP) in your Google Cloud VPC network',
      'Create a Cloud VPN tunnel between Google Cloud and your data center',
      'Order a Partner Interconnect connection with your network provider',
      'Enable Private Google Access in your Google Cloud VPC network',
    ],
    answer: 2,
    explanation: 'Data that cannot cross the public internet needs a private connection. Partner Interconnect provides one through a service provider. Cloud VPN runs over the public internet, and IAP and Private Google Access are access controls, not private circuits.',
    votes: [{ pick: [2], pct: 68 }, { pick: [1], pct: 28 }]
  },
  {
    id: 'et-012',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your company\'s development team is building an application that will be deployed on Cloud Run. You are designing a CI/CD pipeline so that any new version of the application can be deployed in the fewest number of steps possible using the CI/CD pipeline you are designing. You need to select a storage location for the images of the application after the CI part of your pipeline has built them. What should you do?',
    options: [
      'Create a Compute Engine image containing the application',
      'Store the images in Artifact Registry',
      'Store the images in Cloud Storage',
      'Create a Compute Engine disk containing the application'
    ],
    answer: 1,
    explanation: 'Cloud Run deploys container images, and Artifact Registry is the image store the pipeline pushes to and Cloud Run pulls from. Compute Engine images and disks are for VMs. Current names: Container Registry was shut down in 2025; Artifact Registry replaces it.',
    votes: [{ pick: [1], pct: 75 }, { pick: [2], pct: 25 }]
  },
  {
    id: 'et-013',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Each of the three cloud service models - infrastructure as a service (IaaS), platform as a service (PaaS), and software as a service (SaaS) - offers benefits between flexibility and levels of management by the cloud provider and the customer. Why would SaaS be the right choice of service model?',
    options: [
      'You want a balance between flexibility for the customer and the level of management by the cloud provider',
      'You want to minimize the level of management by the customer',
      'You want to maximize flexibility for the customer.',
      'You want to be able to shift your emphasis between flexibility and management by the cloud provider as business needs change',
    ],
    answer: 1,
    explanation: 'SaaS hands you a finished application, so the customer manages the least. Maximum flexibility is IaaS, and the balance between the two is PaaS.',
    votes: [{ pick: [1], pct: 94 }]
  },
  {
    id: 'et-014',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'As your organization increases its release velocity, the VM-based application upgrades take a long time to perform rolling updates due to OS boot times. You need to make the application deployments faster. What should your organization do?',
    options: [
      'Migrate your VMs to the cloud, and add more resources to them',
      'Convert your applications into containers',
      'Increase the resources of your VMs',
      'Automate your upgrade rollouts',
    ],
    answer: 1,
    explanation: 'Containers boot in seconds because they share the host kernel instead of starting a guest OS, which is exactly what is slowing the rolling update. Adding resources or automating the rollout does not remove the OS boot time.',
    votes: [{ pick: [1], pct: 94 }]
  },
  {
    id: 'et-015',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization uses Active Directory to authenticate users. Users\' Google account access must be removed when their Active Directory account is terminated. How should your organization meet this requirement?',
    options: [
      'Configure two-factor authentication in the Google domain',
      'Remove the Google account from all IAM policies',
      'Configure BeyondCorp and Identity-Aware Proxy in the Google domain',
      'Configure single sign-on in the Google domain',
    ],
    answer: 3,
    explanation: 'Single sign-on makes the external identity provider authoritative, so disabling the Active Directory account immediately stops Google access. Removing IAM policies one by one is manual and misses the sign-in itself.',
    votes: [{ pick: [3], pct: 95 }]
  },
  {
    id: 'et-016',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your company has recently acquired three growing startups in three different countries. You want to reduce overhead in infrastructure management and keep your costs low without sacrificing security and quality of service to your customers. How should you meet these requirements?',
    options: [
      'Host all your subsidiaries\' services on-premises together with your existing services.',
      'Host all your subsidiaries\' services together with your existing services on the public cloud.',
      'Build a homogenous infrastructure at each subsidiary, and invest in training their engineers.',
      'Build a homogenous infrastructure at each subsidiary, and invest in hiring more engineers.',
    ],
    answer: 1,
    explanation: 'One public cloud gives the acquired startups shared infrastructure management, security and quality of service without per-site build-out or extra headcount.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-017',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is the difference between Standard and Coldline storage?',
    options: [
      'Coldline storage is for data for which a slow transfer rate is acceptable.',
      'Standard and Coldline storage have different durability guarantees.',
      'Standard and Coldline storage use different APIs.',
      'Coldline storage is for infrequently accessed data.',
    ],
    answer: 3,
    explanation: 'The storage classes differ only in price and access pattern, not in durability or API. Coldline is priced for data read roughly once a quarter; retrieval is still immediate.',
    votes: [{ pick: [3], pct: 100 }]
  },
  {
    id: 'et-018',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What would provide near-unlimited availability of computing resources without requiring your organization to procure and provision new equipment?',
    options: [
      'Public cloud',
      'Containers',
      'Private cloud',
      'Microservices',
    ],
    answer: 0,
    explanation: 'Near-unlimited capacity with no procurement is the defining property of public cloud. Containers and microservices are packaging models, and private cloud still requires you to buy the equipment.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-019',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'You are a program manager for a team of developers who are building an event-driven application to allow users to follow one another\'s activities in the app. Each time a user adds himself as a follower of another user, a write occurs in the real-time database. The developers will develop a lightweight piece of code that can respond to database writes and generate a notification to let the appropriate users know that they have gained new followers. The code should integrate with other cloud services such as Pub/Sub, Firebase, and Cloud APIs to streamline the orchestration process. The application requires a platform that automatically manages underlying infrastructure and scales to zero when there is no activity. Which primary compute resource should your developers select, given these requirements?',
    options: [
      'Google Kubernetes Engine',
      'Cloud Run functions',
      'App Engine flexible environment',
      'Compute Engine',
    ],
    answer: 1,
    explanation: 'A lightweight function triggered by database writes, integrating with Pub/Sub and Firebase, scaling to zero — Cloud Run functions. GKE and Compute Engine need infrastructure management, and App Engine flexible does not scale to zero. Current names: Cloud Functions → Cloud Run functions.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-020',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization is developing an application that will capture a large amount of data from millions of different sensor devices spread all around the world. Your organization needs a database that is suitable for worldwide, high-speed data storage of a large amount of unstructured data. Which Google Cloud product should your organization choose?',
    options: [
      'Firestore',
      'Cloud Data Fusion',
      'Cloud SQL',
      'Bigtable',
    ],
    answer: 3,
    explanation: 'Huge volumes of sensor readings needing high-speed writes and low-latency reads are Bigtable\'s workload. Firestore and Cloud SQL do not sustain that write rate, and Data Fusion is an ETL tool.'
  },
  {
    id: 'et-021',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization needs to build streaming data pipelines. You don\'t want to manage the individual servers that do the data processing in the pipelines. Instead, you want a managed service that will automatically scale with the amount of data to be processed. Which Google Cloud product or feature should your organization choose?',
    options: [
      'Pub/Sub',
      'Dataflow',
      'Knowledge Catalog',
      'Dataprep by Trifacta',
    ],
    answer: 1,
    explanation: 'Dataflow is the managed, autoscaling stream and batch processing service. Pub/Sub carries the events but does not process them, and Knowledge Catalog and Dataprep serve other stages of the pipeline. Current names: Data Catalog → Knowledge Catalog (formerly Dataplex Universal Catalog).',
    votes: [{ pick: [1], pct: 97 }]
  },
  {
    id: 'et-022',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is building an application running in Google Cloud. Currently, software builds, tests, and regular deployments are done manually, but you want to reduce work for the team. Your organization wants to use Google Cloud managed solutions to automate your build, testing, and deployment process. Which Google Cloud product or feature should your organization use?',
    options: [
      'Cloud Scheduler',
      'Cloud Code',
      'Cloud Build',
      'Infrastructure Manager'
    ],
    answer: 2,
    explanation: 'Cloud Build is the managed CI/CD service that runs builds, tests and deployments. Cloud Scheduler runs cron jobs, Cloud Code is an IDE plugin, and Infrastructure Manager provisions infrastructure from Terraform. Current names: Deployment Manager reached end of support in 2026; Infrastructure Manager (managed Terraform) replaces it.',
    votes: [{ pick: [2], pct: 100 }]
  },
  {
    id: 'et-023',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Which Google Cloud product can report on and maintain compliance on your entire Google Cloud organization to cover multiple projects?',
    options: [
      'Cloud Logging',
      'Identity and Access Management',
      'Google Cloud Armor',
      'Security Command Center',
    ],
    answer: 3,
    explanation: 'Security Command Center is the organisation-wide posture and compliance dashboard spanning every project. Cloud Logging stores logs, IAM grants access, and Cloud Armor filters traffic.',
    votes: [{ pick: [3], pct: 84 }, { pick: [1], pct: 16 }]
  },
  {
    id: 'et-024',
    topic: 'Networking',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization needs to establish private network connectivity between its on-premises network and its workloads running in Google Cloud. You need to be able to set up the connection as soon as possible. Which Google Cloud product or feature should you use?',
    options: [
      'Cloud Interconnect',
      'Direct Peering',
      'Cloud VPN',
      'Cloud CDN',
    ],
    answer: 2,
    explanation: 'Cloud VPN can be turned up in minutes over the existing internet connection. Interconnect and Direct Peering need physical provisioning that takes weeks.',
    votes: [{ pick: [2], pct: 90 }]
  },
  {
    id: 'et-025',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization is developing a mobile app and wants to select a fully featured cloud-based compute platform for it. Which Google Cloud product or feature should your organization use?',
    options: [
      'Google Kubernetes Engine',
      'Firebase',
      'Cloud Run functions',
      'App Engine',
    ],
    answer: 1,
    explanation: 'Firebase is the fully featured mobile development platform, bundling auth, database, hosting, analytics and messaging. App Engine hosts the backend but is not mobile-specific. Current names: Cloud Functions → Cloud Run functions.',
    votes: [{ pick: [1], pct: 77 }, { pick: [3], pct: 23 }]
  },
  {
    id: 'et-026',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your company has been using a shared facility for data storage and will be migrating to Google Cloud. One of the internal applications uses Linux custom images that need to be migrated. Which Google Cloud product should you use to maintain the custom images?',
    options: [
      'App Engine flexible environment',
      'Compute Engine',
      'App Engine standard environment',
      'Google Kubernetes Engine',
    ],
    answer: 1,
    explanation: 'Custom Linux images are imported and run on Compute Engine virtual machines. App Engine and GKE take code and containers, not machine images.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-027',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization wants to migrate its data management solutions to Google Cloud because it needs to dynamically scale up or down and to run transactional SQL queries against historical data at scale. Which Google Cloud product or service should your organization use?',
    options: [
      'BigQuery',
      'Bigtable',
      'Pub/Sub',
      'Spanner',
    ],
    answer: 3,
    explanation: 'Dynamic scaling plus transactional SQL at scale is Spanner. BigQuery is analytical rather than transactional, Bigtable is not relational, and Pub/Sub is messaging.',
    votes: [{ pick: [3], pct: 76 }, { pick: [0], pct: 24 }]
  },
  {
    id: 'et-028',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization needs to categorize objects in a large group of static images using machine learning. Which Google Cloud product or service should your organization use?',
    options: [
      'BigQuery ML',
      'Agent Platform AutoML (video)',
      'Cloud Vision API',
      'Agent Platform AutoML (tabular)'
    ],
    answer: 2,
    explanation: 'Categorising objects in static images with a ready-made model is the Vision API. Agent Platform AutoML (video) is for video, Agent Platform AutoML (tabular) and BigQuery ML for tabular data. Current names: AutoML Vision, Tables and Video are now Agent Platform AutoML (image, tabular, video) in Gemini Enterprise Agent Platform.',
    votes: [{ pick: [2], pct: 97 }]
  },
  {
    id: 'et-029',
    topic: 'Networking',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization runs all its workloads on Compute Engine virtual machine instances. Your organization has a security requirement: the virtual machines are not allowed to access the public internet. The workloads running on those virtual machines need to access BigQuery and Cloud Storage, using their publicly accessible interfaces, without violating the security requirement. Which Google Cloud product or feature should your organization use?',
    options: [
      'Identity-Aware Proxy',
      'Cloud NAT (network address translation)',
      'VPC internal load balancers',
      'Private Google Access',
    ],
    answer: 3,
    explanation: 'Private Google Access lets instances without external IP addresses reach Google APIs such as BigQuery and Cloud Storage over their public endpoints, using internal routing. Cloud NAT would give outbound internet access, breaking the requirement.',
    votes: [{ pick: [3], pct: 92 }]
  },
  {
    id: 'et-030',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Which Google Cloud product is designed to reduce the risks of handling personally identifiable information (PII)?',
    options: [
      'Cloud Storage',
      'Google Cloud Armor',
      'Cloud Data Loss Prevention',
      'Secret Manager',
    ],
    answer: 2,
    explanation: 'Cloud Data Loss Prevention discovers, classifies and de-identifies sensitive data such as PII. Secret Manager stores credentials, and Cloud Armor filters web traffic.'
  },
  {
    id: 'et-031',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is migrating to Google Cloud. As part of that effort, it needs to move terabytes of data from on-premises file servers to Cloud Storage. Your organization wants the migration process to be automated and to be managed by Google. Your organization has an existing Dedicated Interconnect connection that it wants to use. Which Google Cloud product or feature should your organization use?',
    options: [
      'Storage Transfer Service',
      'Migrate to Containers',
      'BigQuery Data Transfer Service',
      'Transfer Appliance'
    ],
    answer: 0,
    explanation: 'Storage Transfer Service is the managed, automated transfer for on-premises data and can use the existing Dedicated Interconnect. Transfer Appliance is a physical shipment, used when no such link exists. Current names: Migrate for Anthos → Migrate to Containers; Migrate for Compute Engine → Migrate to Virtual Machines.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-032',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization needs to analyze data in order to gather insights into its daily operations. You only want to pay for the data you store and the queries you perform. Which Google Cloud product should your organization choose for its data analytics warehouse?',
    options: [
      'Cloud SQL',
      'Dataproc',
      'Spanner',
      'BigQuery',
    ],
    answer: 3,
    explanation: 'BigQuery separates storage from compute and bills for bytes stored and bytes processed, matching the pay-for-what-you-store-and-query requirement. Cloud SQL, Spanner and Dataproc bill for provisioned capacity.',
    votes: [{ pick: [3], pct: 100 }]
  },
  {
    id: 'et-033',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization wants to run a container-based application on Google Cloud. This application is expected to increase in complexity. You have a security need for fine-grained control of traffic between the containers. You also have an operational need to exercise fine-grained control over the application\'s scaling policies. What Google Cloud product or feature should your organization use?',
    options: [
      'Google Kubernetes Engine cluster',
      'App Engine',
      'Cloud Run',
      'Compute Engine virtual machines',
    ],
    answer: 0,
    explanation: 'Fine-grained control of traffic between containers (network policies) and of scaling behaviour requires the Kubernetes control surface that GKE exposes. Cloud Run and App Engine deliberately hide those controls.',
    votes: [{ pick: [0], pct: 97 }]
  },
  {
    id: 'et-034',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Which Google Cloud product or feature makes specific recommendations based on security risks and compliance violations?',
    options: [
      'Google Cloud firewalls',
      'Security Command Center',
      'Infrastructure Manager',
      'Google Cloud Armor'
    ],
    answer: 1,
    explanation: 'Security Command Center generates findings and recommendations for security risks and compliance violations. Firewalls and Cloud Armor enforce rules; Infrastructure Manager provisions resources. Current names: Deployment Manager reached end of support in 2026; Infrastructure Manager (managed Terraform) replaces it.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-035',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Which Google Cloud product provides a consistent platform for multi-cloud application deployments and extends other Google Cloud services to your organization\'s environment?',
    options: [
      'Cloud Run',
      'Virtual Public Cloud',
      'Compute Engine',
      'GKE with fleet management'
    ],
    answer: 3,
    explanation: 'GKE fleet management runs and manages applications consistently across Google Cloud, on-premises (Google Distributed Cloud) and other clouds, extending Google Cloud services to those environments. Cloud Run and Compute Engine run in Google Cloud only. Current names: Anthos became GKE Enterprise in 2023, and since September 2025 its features are part of GKE itself (fleet management), with Google Distributed Cloud for on-premises.',
    votes: [{ pick: [3], pct: 96 }]
  },
  {
    id: 'et-036',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is developing an application that will manage payments and online bank accounts located around the world. The most critical requirement for your database is that each transaction is handled consistently. Your organization anticipates almost unlimited growth in the amount of data stored. Which Google Cloud product should your organization choose?',
    options: [
      'Cloud SQL',
      'Cloud Storage',
      'Firestore',
      'Spanner',
    ],
    answer: 3,
    explanation: 'Strong transactional consistency worldwide plus effectively unlimited growth describes Spanner. Cloud SQL scales vertically on one instance, and Firestore and Cloud Storage are not relational transactional stores.',
    votes: [{ pick: [3], pct: 90 }]
  },
  {
    id: 'et-037',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization wants an economical solution to store data such as files, graphical images, and videos and to access and share them securely. Which Google Cloud product or service should your organization use?',
    options: [
      'Cloud Storage',
      'Cloud SQL',
      'Spanner',
      'BigQuery',
    ],
    answer: 0,
    explanation: 'Files, images and video are unstructured objects, which is exactly what Cloud Storage buckets hold, with IAM and signed URLs for secure sharing.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-038',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization wants to predict the behavior of visitors to its public website. To do that, you have decided to build a machine learning model. Your team has database-related skills but only basic machine learning skills, and would like to use those database skills. Which Google Cloud product or feature should your organization choose?',
    options: [
      'BigQuery ML',
      'LookML',
      'TensorFlow',
      'Cloud SQL',
    ],
    answer: 0,
    explanation: 'BigQuery ML lets people who already know SQL build and run models inside the warehouse, no ML engineering required. TensorFlow needs ML expertise, and LookML is a BI modelling language.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-039',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to restrict access to a Cloud Storage bucket. Only employees who are based in Canada should be allowed to view the contents. What is the most effective and efficient way to satisfy this requirement?',
    options: [
      'Deploy the Cloud Storage bucket to a Google Cloud region in Canada',
      'Configure Google Cloud Armor to allow access to the bucket only from IP addresses based in Canada',
      'Give each employee who is based in Canada access to the bucket',
      'Create a group consisting of all Canada-based employees, and give the group access to the bucket',
    ],
    answer: 3,
    explanation: 'IAM is granted to groups, and group membership is managed once. Giving each employee access individually does not scale, and bucket location and IP filtering do not express who may view the data.',
    votes: [{ pick: [3], pct: 86 }]
  },
  {
    id: 'et-040',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization is moving an application to Google Cloud. As part of that effort, it needs to migrate the application\'s working database from another cloud provider to Cloud SQL. The database runs on the MySQL engine. The migration must cause minimal disruption to users. Data must be secured while in transit. Which should your organization use?',
    options: [
      'BigQuery Data Transfer Service',
      'MySQL batch insert',
      'Database Migration Service',
      'Cloud Composer',
    ],
    answer: 2,
    explanation: 'Database Migration Service performs continuous, encrypted replication into Cloud SQL, so the cutover is short. Batch inserts cause downtime, and the other services move analytics data or orchestrate workflows.'
  },
  {
    id: 'et-041',
    topic: 'Resource hierarchy & governance',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is developing and deploying an application on Google Cloud. Tracking your Google Cloud spending needs to stay as simple as possible. What should you do to ensure that workloads in the development environment are fully isolated from production workloads?',
    options: [
      'Apply a unique tag to development resources',
      'Associate the development resources with their own network',
      'Associate the development resources with their own billing account',
      'Put the development resources in their own project',
    ],
    answer: 3,
    explanation: 'A project is the billing and isolation boundary in Google Cloud: separate projects keep development resources isolated and make their costs obvious. Tags, networks and extra billing accounts do not isolate resources.',
    votes: [{ pick: [3], pct: 96 }]
  },
  {
    id: 'et-042',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your company is running the majority of its workloads in a co-located data center. The workloads are running on virtual machines (VMs) on top of a hypervisor and use either Linux or Windows server editions. As part of your company\'s transformation strategy, you need to modernize workloads as much as possible by adopting cloud-native technologies. You need to migrate the workloads into Google Cloud. What should you do?',
    options: [
      'Export the VMs into VMDK format, and import them into Compute Engine',
      'Export the VMs into VMDK format, and import them into Google Cloud VMware Engine',
      'Migrate the workloads using Migrate to Virtual Machines',
      'Migrate the workloads using Migrate to Containers'
    ],
    answer: 3,
    explanation: 'The goal is to modernise as much as possible with cloud-native technology. Migrate to Containers converts the VM workloads into containers; Migrate to Virtual Machines and VMware Engine would only rehost them as VMs. Current names: Migrate for Anthos → Migrate to Containers; Migrate for Compute Engine → Migrate to Virtual Machines.',
    votes: [{ pick: [3], pct: 58 }, { pick: [2], pct: 40 }]
  },
  {
    id: 'et-043',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your organization is running all its workloads in a private cloud on top of a hypervisor. Your organization has decided it wants to move to Google Cloud as quickly as possible. Your organization wants minimal changes to the current environment, while using the maximum amount of managed services Google offers. What should your organization do?',
    options: [
      'Migrate the workloads to Google Cloud VMware Engine',
      'Migrate the workloads to Compute Engine',
      'Migrate the workloads to Bare Metal Solution',
      'Migrate the workloads to Google Kubernetes Engine',
    ],
    answer: 1,
    explanation: 'The requirement is minimal change with the maximum managed service, which is Compute Engine: same operating systems, but Google runs the hardware, hypervisor and networking. Note the community is split 50/50 with VMware Engine, which keeps the hypervisor as well.',
    votes: [{ pick: [0], pct: 50 }, { pick: [1], pct: 50 }]
  },
  {
    id: 'et-044',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is releasing its first publicly available application in Google Cloud. The application is critical to your business and customers and requires a 2-hour SLA. How should your organization set up support to minimize costs?',
    options: [
      'Enroll in Premium Support',
      'Enroll in Enhanced Support',
      'Enroll in Standard Support',
      'Enroll in Basic Support',
    ],
    answer: 1,
    explanation: 'Enhanced Support is the lowest tier that meets a 2-hour response target for high-impact cases. Premium is faster but more expensive; Standard and Basic do not meet it.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-045',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization offers public mobile apps and websites. You want to migrate to a Google Cloud-based solution for checking and maintaining your users\' usernames and passwords and controlling their access to different resources based on their identity. Which should your organization choose?',
    options: [
      'VPN tunnels',
      'Identity Platform',
      'Compute Engine firewall rules',
      'Private Google Access',
    ],
    answer: 1,
    explanation: 'Identity Platform provides customer identity and access management for public apps: sign-up, sign-in, credential storage and access control for end users, as distinct from IAM for cloud administrators.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-046',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Which Google Cloud service or feature lets you build machine learning models using Standard SQL and data in a data warehouse?',
    options: [
      'BigQuery ML',
      'TensorFlow',
      'Agent Platform AutoML (tabular)',
      'Bigtable ML'
    ],
    answer: 0,
    explanation: 'BigQuery ML builds and runs models with standard SQL against data already in the warehouse. Current names: AutoML Vision, Tables and Video are now Agent Platform AutoML (image, tabular, video) in Gemini Enterprise Agent Platform.',
    votes: [{ pick: [0], pct: 100 }]
  },
  {
    id: 'et-047',
    topic: 'Cost management',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your organization runs an application on virtual machines in Google Cloud. This application processes incoming images. This activity takes hours to create a result for each image. The workload for this application normally stays at a certain baseline level, but at regular intervals it spikes to a much greater workload. Your organization needs to control the cost to run this application. What should your organization do?',
    options: [
      'Purchase committed use discounts for the baseline load',
      'Purchase committed use discounts for the expected spike load',
      'Leverage sustained use discounts for your virtual machines',
      'Run the workload on Spot VM instances'
    ],
    answer: 0,
    explanation: 'The baseline load runs constantly, so a commitment pays off there; the spikes are intermittent and are better served on demand. Committing to the spike level would leave capacity paid for and idle most of the time. Current names: preemptible VMs are the legacy model; Spot VMs replace them, with no 24-hour limit.',
    votes: [{ pick: [0], pct: 42 }, { pick: [2], pct: 41 }, { pick: [3], pct: 17 }]
  },
  {
    id: 'et-048',
    topic: 'Resource hierarchy & governance',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization is developing a plan for migrating to Google Cloud. What is a best practice when initially configuring your Google Cloud environment?',
    options: [
      'Create a project via Google Cloud Console per department in your company',
      'Define your resource hierarchy with an organization node on top',
      'Create projects based on team members\' requests',
      'Make every member of your company the project owner',
    ],
    answer: 1,
    explanation: 'Creating the organization node first gives a single root for policy inheritance, billing and folder structure. Everything else can be arranged underneath afterwards.',
    votes: [{ pick: [1], pct: 100 }]
  },
  {
    id: 'et-049',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Your organization runs many workloads in different Google Cloud projects, each linked to the same billing account. Each project\'s workload costs can vary from month to month, but the overall combined cost of all projects is relatively stable. Your organization needs to optimize its cost. What should your organization do?',
    options: [
      'Purchase a commitment per project for each project\'s usual minimum',
      'Create a billing account per project, and link each project to a different billing account',
      'Turn on committed use discount sharing, and create a commitment for the combined usage',
      'Move all workloads from all different projects into one single consolidated project',
    ],
    answer: 2,
    explanation: 'Committed use discount sharing pools commitments across all projects in the billing account, so a commitment sized to the stable combined usage is consumed wherever it is needed, even as individual projects fluctuate.',
    votes: [{ pick: [2], pct: 100 }]
  },
  {
    id: 'et-050',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How should a multinational organization that is migrating to Google Cloud consider security and privacy regulations to ensure that it is in compliance with global standards?',
    options: [
      'Comply with data security and privacy regulations in each geographical region',
      'Comply with regional standards for data security and privacy, because they supersede all international regulations',
      'Comply with international standards for data security and privacy, because they supersede all regional regulations',
      'Comply with regional data security regulations, because they\'re more complex than privacy standards',
    ],
    answer: 0,
    explanation: 'Each geography imposes its own data protection rules, and none supersedes the others. A multinational has to meet the requirements of every region it operates in.'
  },
  {
    id: 'et-051',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization wants to optimize its use of Google Cloud\'s discounts on virtual machine-based workloads. You plan to use 200 CPUs constantly for the next 3 years, and you forecast that spikes of up to 300 CPUs will occur approximately 30% of the time. What should you choose?',
    options: [
      '1-year committed use discount for 200 CPUs',
      '3-year committed use discount for 300 CPUs',
      '3-year committed use discount for 200 CPUs',
      'Regular pay-as-you-go pricing',
    ],
    answer: 2,
    explanation: 'The steady requirement is 200 CPUs for three years, so commit to that at the deepest discount and let the intermittent spikes run on demand.'
  },
  {
    id: 'et-052',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to minimize how much it pays for data traffic from the Google network to the internet. What should your organization do?',
    options: [
      'Choose the Standard network service tier.',
      'Choose the Premium network service tier.',
      'Deploy Cloud VPN.',
      'Deploy Cloud NAT.',
    ],
    answer: 0,
    explanation: 'The Standard network service tier routes traffic over the public internet for most of its journey instead of Google\'s premium backbone, which lowers egress cost at the expense of performance.'
  },
  {
    id: 'et-053',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization wants to migrate your on-premises environment to Google Cloud. The on-premises environment consists of containers and virtual machine instances. Which Google Cloud products can help to migrate the container images and the virtual machine disks?',
    options: [
      'Compute Engine and Filestore',
      'Artifact Registry and Cloud Storage',
      'Dataflow and BigQuery',
      'Pub/Sub and Cloud Storage',
    ],
    answer: 1,
    explanation: 'Container images go to Artifact Registry, and virtual machine disk images are imported through Cloud Storage. The other pairs are analytics and messaging products.'
  },
  {
    id: 'et-054',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your company security team manages access control to production systems using an LDAP directory group. How is this access control managed in the Google Cloud production project?',
    options: [
      'Assign the proper role to the Service Account in the project\'s IAM Policy',
      'Grant each user the roles/iam.serviceAccountUser role on a service account that exists in the Google Group.',
      'Assign the proper role to the Google Group in the project\'s IAM Policy.',
      'Create the project in a folder with the same name as the LDAP directory group.',
    ],
    answer: 2,
    explanation: 'Assign the IAM role to a Google Group that mirrors the LDAP group, then manage membership in the directory. Service accounts identify workloads, not people.'
  },
  {
    id: 'et-055',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization wants to be sure that is expenditures on cloud services are in line with the budget. Which two Google Cloud cost management features help your organization gain greater visibility into its cloud resource costs? (Choose two.)',
    options: [
      'Billing dashboards',
      'Resource labels',
      'Sustained use discounts',
      'Financial governance policies',
      'Payments profile',
    ],
    answer: [0, 1],
    explanation: 'Visibility comes from seeing the spend (billing dashboards and reports) and from being able to slice it by owner (resource labels). Sustained use discounts and payment profiles affect what you pay, not what you can see.'
  },
  {
    id: 'et-056',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to process large amounts of data from an online application that operates continuously. You do not want to be required to provision infrastructure or create server clusters. What should your organization choose?',
    options: [
      'Compute Engine with BigQuery',
      'Dataproc',
      'Google Kubernetes Engine with Bigtable',
      'Dataflow',
    ],
    answer: 3,
    explanation: 'Continuous processing of large data volumes with no servers or clusters to provision is Dataflow. Dataproc and GKE mean managing clusters.'
  },
  {
    id: 'et-057',
    topic: 'Resource hierarchy & governance',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to ensure that the Google Cloud resources of each of your departments are segregated from one another. Each department has several environments of its own: development, testing, and production. Which strategy should your organization choose?',
    options: [
      'Create a project per department, and create a folder per environment in each project.',
      'Create a folder per department, and create a project per environment in each folder.',
      'Create a Cloud Identity domain per department, and create a project per environment in each domain.',
      'Create a Cloud Identity domain per environment, and create a project per department in each domain.',
    ],
    answer: 1,
    explanation: 'Folders group by department and inherit policy; projects are the isolation boundary, so each environment gets its own. Projects cannot contain folders, and a Cloud Identity domain is not a segmentation tool.'
  },
  {
    id: 'et-058',
    topic: 'Resource hierarchy & governance',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization is defining the resource hierarchy for its new application in Google Cloud. You need separate development and production environments. The production environment will be deployed in Compute Engine in two regions. Which structure should your organization choose?',
    options: [
      'Create a single project for all environments. Use labels to segregate resources by environment.',
      'Create a single project for all environments. Use tags to segregate resources by environment.',
      'Create one project for the development environment and one project for the production environment.',
      'Create two projects for the development environment and two projects for the production environment (one for each region).',
    ],
    answer: 2,
    explanation: 'Development and production belong in separate projects so that IAM, quotas and billing are isolated. Labels and tags do not isolate anything, and a project can span regions, so no extra project is needed per region.'
  },
  {
    id: 'et-059',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization meant to purchase a 3-year Committed Use Discount, but accidentally purchased a 1-year Committed Use Discount instead. What should your organization do?',
    options: [
      'Contact your financial institution.',
      'Contact Trust and Safety.',
      'Contact Cloud Billing Support.',
      'Contact Technical Support.',
    ],
    answer: 2,
    explanation: 'Commitments are a billing matter, so Cloud Billing Support handles a mistaken purchase. Technical Support covers products, and Trust and Safety handles abuse.'
  },
  {
    id: 'et-060',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your organization needs to allow a production job to have access to a BigQuery dataset. The production job is running on a Compute Engine instance that is part of an instance group. What should be included in the IAM Policy on the BigQuery dataset?',
    options: [
      'The Compute Engine instance group',
      'The project that owns the Compute Engine instance',
      'The Compute Engine service account',
      'The Compute Engine instance',
    ],
    answer: 2,
    explanation: 'Workloads authenticate as a service account, so the service account is the identity that must appear in the dataset\'s IAM policy. Instances and instance groups are not IAM principals.'
  },
  {
    id: 'et-061',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your team is publishing research results and needs to make large amounts of data available to other researchers within the professional community and the public at minimum cost. How should you host the data?',
    options: [
      'Use a Cloud Storage bucket and enable "Requester Pays."',
      'Use a Cloud Storage bucket and provide Signed URLs for the data files.',
      'Use a Cloud Storage bucket and set up a Cloud Interconnect connection to allow access to the data.',
      'Host the data on-premises, and set up a Cloud Interconnect connection to allow access to the data.',
    ],
    answer: 0,
    explanation: 'Requester Pays moves the cost of downloads to the consumer, so the publishing team pays only for storage while the data stays openly accessible.'
  },
  {
    id: 'et-062',
    topic: 'Resource hierarchy & governance',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your company needs to segment Google Cloud resources used by each team from the others. The teams\' efforts are changing frequently, and you need to reduce operational risk and maintain cost visibility. Which approach does Google recommend?',
    options: [
      'One project per team.',
      'One organization per team.',
      'One project that contains all of each team\'s resources.',
      'One top-level folder per team.',
    ],
    answer: 3,
    explanation: 'A top-level folder per team lets teams create and retire projects freely underneath while policy and cost roll up per team. One project per team becomes a bottleneck as the team\'s work changes.'
  },
  {
    id: 'et-063',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How do Migrate to Virtual Machines and Migrate to Containers differ?',
    options: [
      'Unlike Migrate to Containers, Migrate to Virtual Machines assumes that the migration source is VMware vSphere.',
      'Migrate to Virtual Machines charges for ingress, but Migrate to Containers does not.',
      'Migrate to Virtual Machines is closed source, and Migrate to Containers is open source.',
      'Migrate to Containers migrates to containers, and Migrate to Virtual Machines migrates to virtual machines.'
    ],
    answer: 3,
    explanation: 'The two tools differ in the target: Migrate to Containers turns workloads into containers, Migrate to Virtual Machines moves them onto virtual machines. Current names: Migrate for Anthos → Migrate to Containers; Migrate for Compute Engine → Migrate to Virtual Machines.'
  },
  {
    id: 'et-064',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Your large and frequently changing organization\'s user information is stored in an on-premises LDAP database. The database includes user passwords and group and organization membership. How should your organization provision Google accounts and groups to access Google Cloud resources?',
    options: [
      'Replicate the LDAP infrastructure on Compute Engine',
      'Use the Firebase Authentication REST API to create users',
      'Use Google Cloud Directory Sync to create users',
      'Use the Identity Platform REST API to create users',
    ],
    answer: 2,
    explanation: 'Google Cloud Directory Sync reads the LDAP directory and provisions matching Google accounts and groups, keeping them synchronised as the directory changes. It synchronises identities, not passwords.'
  },
  {
    id: 'et-065',
    topic: 'Networking',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'You can run a single instance of Google Cloud Directory Sync to synchronize user accounts and groups to Google Cloud. Your organization recently migrated its compute workloads to Google Cloud. You want these workloads in Google Cloud to privately and securely access your large volume of on-premises data, and you also want to minimize latency. What should your organization do?',
    options: [
      'Use Storage Transfer Service to securely make your data available to Google Cloud',
      'Create a VPC between your on-premises data center and your Google resources',
      'Peer your on-premises data center to Google\'s Edge Network',
      'Use Transfer Appliance to securely make your data available to Google Cloud',
    ],
    answer: 1,
    explanation: 'A private connection between the on-premises data centre and the VPC keeps the traffic off the public internet and minimises latency, which one-off transfer tools cannot do. Note the option wording is loose: in practice this is Cloud VPN or Interconnect attached to the VPC.'
  },
  {
    id: 'et-066',
    topic: 'Resource hierarchy & governance',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'Your organization consists of many teams. Each team has many Google Cloud projects. Your organization wants to simplify the management of identity and access policies for these projects. How can you group these projects to meet this goal?',
    options: [
      'Group each team\'s projects into a separate domain',
      'Assign labels based on the virtual machines that are part of each team\'s projects',
      'Use folders to group each team\'s projects',
      'Group each team\'s projects into a separate organization node',
    ],
    answer: 2,
    explanation: 'Folders group projects for inherited IAM and organization policy, which is exactly the goal. Labels are metadata only, and separate domains or organizations would fragment administration.'
  },
  {
    id: 'et-067',
    topic: 'AI & machine learning',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization needs to categorize text-based customer reviews on their website using a pre-trained machine learning model. Which Google Cloud product or service should the organization use?',
    options: [
      'Cloud Natural Language API',
      'Dialogflow',
      'Recommendations AI',
      'TensorFlow',
    ],
    answer: 0,
    explanation: 'Categorising text with a ready-made model is the Natural Language API. Dialogflow builds conversational agents, Recommendations AI suggests products, and TensorFlow requires you to train your own model. The dump\'s stored answer is wrong here.'
  },
  {
    id: 'et-068',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is planning its cloud expenditure. What should the organization do to control costs?',
    options: [
      'Consider cloud resource costs as capital expenditure in annual planning.',
      'Use only cloud resources; they have no cloud infrastructure costs.',
      'Review cloud resource costs frequently because costs depend on usage.',
      'Assess cloud resources costs only when SLO is not met by their cloud provider.',
    ],
    answer: 2,
    explanation: 'Cloud costs follow usage, so they have to be reviewed frequently. Cloud spend is operating expenditure, not capital, and SLO breaches are unrelated to cost control.'
  },
  {
    id: 'et-069',
    topic: 'AI & machine learning',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization is searching for an open-source machine learning platform to build and deploy their own custom machine learning applications using TPUs. Which Google Cloud product or service should the organization use?',
    options: [
      'TensorFlow',
      'BigQuery ML',
      'Vision API',
      'Agent Platform AutoML (image)'
    ],
    answer: 0,
    explanation: 'TensorFlow is the open-source machine learning framework, and Cloud TPUs are built to accelerate it. BigQuery ML, Vision API and AutoML are managed services, not open-source platforms. Current names: AutoML Vision, Tables and Video are now Agent Platform AutoML (image, tabular, video) in Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-070',
    topic: 'Data analytics',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'What is an example of unstructured data that organizations can capture from social media? (Choose two.)',
    options: [
      'Post comments',
      'Tagging',
      'Profile picture',
      'Location',
    ],
    answer: [0, 2],
    explanation: 'Unstructured data has no predefined schema: free-text comments and image files both qualify. Tags and location arrive as structured fields.'
  },
  {
    id: 'et-071',
    topic: 'Compute',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization relies on online seasonal sales for the majority of their annual revenue. Why should the organization use App Engine for their customer app?',
    options: [
      'Automatically adjusts physical inventory in real time',
      'Autoscales during peaks in demand',
      'Runs maintenance during seasonal sales',
      'Recommends the right products to customers',
    ],
    answer: 1,
    explanation: 'App Engine scales automatically with demand, which is what a seasonal sales peak needs. It does not manage inventory or make recommendations.'
  },
  {
    id: 'et-072',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is using machine learning to make predictions. One of their datasets mistakenly includes mislabeled data. How will the prediction be impacted?',
    options: [
      'Increased risk of privacy leaks',
      'Increased risk of inaccuracy',
      'Decreased model compatibility',
      'Decreased model training time',
    ],
    answer: 1,
    explanation: 'A model learns the labels it is given, so mislabelled training data produces wrong predictions. Privacy, compatibility and training time are not what mislabelling affects.'
  },
  {
    id: 'et-073',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A global organization is developing an application to manage payments and online bank accounts in multiple regions. Each transaction must be handled consistently in their database, and they anticipate almost unlimited growth in the amount of data stored. Which Google Cloud product should the organization choose?',
    options: [
      'Cloud SQL',
      'Spanner',
      'Cloud Storage',
      'BigQuery',
    ],
    answer: 1,
    explanation: 'Consistent transactions worldwide plus unlimited growth is Spanner: relational and strongly consistent, but horizontally scalable across regions.'
  },
  {
    id: 'et-074',
    topic: 'Cloud fundamentals',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization has servers running mission-critical workloads on-premises around the world. They want to modernize their infrastructure with a multi-cloud architecture. What benefit could the organization experience?',
    options: [
      'Ability to disable regional network connectivity during cyber attacks',
      'Ability to keep backups of their data on-premises in case of failure',
      'Full management access to their regional infrastructure',
      'Reduced likelihood of system failure during high demand events',
    ],
    answer: 3,
    explanation: 'Spreading workloads across more than one cloud removes the single provider as a single point of failure, so demand spikes and outages in one are less likely to take the service down.'
  },
  {
    id: 'et-075',
    topic: 'Compute',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization needs to run frequent updates for their business app. Why should the organization use Google Kubernetes Engine (GKE)?',
    options: [
      'Customer expectations can be adjusted without using marketing tools',
      'Seamless changes can be made without causing any application downtime.',
      'GKE handles version control seamlessly and out of the box',
      'GKE is well suited for all monolithic applications',
    ],
    answer: 1,
    explanation: 'Kubernetes performs rolling updates, replacing pods gradually so the application keeps serving during a release. GKE does not manage source version control, and monoliths are not its best fit.'
  },
  {
    id: 'et-076',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants to use Apigee to manage all their application programming interfaces (APIs). What will Apigee enable the organization to do?',
    options: [
      'Increase application privacy',
      'Measure and track API performance',
      'Analyze application development speed',
      'Market and sell APIs',
    ],
    answer: 1,
    explanation: 'Apigee\'s analytics measure and track how APIs perform and are used. It manages APIs rather than marketing them, and it does not measure development speed.'
  },
  {
    id: 'et-077',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An e-commerce organization is reviewing their cloud data storage. What type of raw data can they store in a relational database without any processing?',
    options: [
      'Product inventory',
      'Product photographs',
      'Instructional videos',
      'Customer chat history',
    ],
    answer: 0,
    explanation: 'A relational database stores structured rows and columns, so inventory records fit without processing. Photographs, video and chat transcripts are unstructured.'
  },
  {
    id: 'et-078',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'A hotel wants to modernize their legacy systems so that customers can make reservations through a mobile app. What\'s the benefit of using an application programming interface (API) to do this?',
    options: [
      'They do not have to develop the end-user application',
      'They can deprecate their legacy systems',
      'They can transform their systems to be cloud-native',
      'They do not have to rewrite the legacy system',
    ],
    answer: 3,
    explanation: 'An API exposes the legacy system\'s data and functions to the new mobile app, so the old system keeps running untouched. The hotel still has to build the app itself.'
  },
  {
    id: 'et-079',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to digitize and share large volumes of historical text and images. Why is a public cloud a better option than an on-premises solution?',
    options: [
      'In-house hardware management',
      'Provides physical encryption key',
      'Cost-effective at scale',
      'Optimizes capital expenditure',
    ],
    answer: 2,
    explanation: 'Public cloud spreads the cost of storage and serving across many tenants, so digitising and sharing large volumes is cheaper at scale. It reduces capital expenditure rather than optimising it, and removes in-house hardware management.'
  },
  {
    id: 'et-080',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to develop an application that can be personalized to user preferences throughout the year. Why should they build a cloud-native application instead of modernizing their existing on-premises application?',
    options: [
      'Developers can rely on the cloud provider for all source code',
      'Developers can launch new features in an agile way',
      'IT managers can migrate existing application architecture without needing updates',
      'IT managers can accelerate capital expenditure planning',
    ],
    answer: 1,
    explanation: 'Cloud-native applications are built for frequent, incremental releases, so features can ship in small agile increments rather than in large scheduled rewrites.'
  },
  {
    id: 'et-081',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Which technology allows organizations to run multiple computer operating systems on a single piece of physical hardware?',
    options: [
      'Hypervisor',
      'Containers',
      'Serverless computing',
      'Open source',
    ],
    answer: 0,
    explanation: 'A hypervisor virtualises the hardware so several guest operating systems can share one physical machine. Containers share a single operating system instead.'
  },
  {
    id: 'et-082',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is making a strategic change to customer support in response to feedback. They plan to extend their helpline availability hours. Why is the organization making this change?',
    options: [
      'Users expect professional expertise',
      'Users require personalization',
      'Users expect always-on services',
      'Users require regional access',
    ],
    answer: 2,
    explanation: 'Extending helpline hours responds to the expectation that services are available whenever the customer wants them, which is the always-on expectation cloud services created.'
  },
  {
    id: 'et-083',
    topic: 'Cost management',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization is migrating their business applications from on-premises to the cloud. How could this impact their operations and personnel costs?',
    options: [
      'Reduced on-premises infrastructure management costs',
      'Increased on-premises hardware maintenance costs',
      'Reduced cloud software licensing costs',
      'Increased cloud hardware management costs',
    ],
    answer: 0,
    explanation: 'Moving off-premises removes the day-to-day work of running the data centre, so infrastructure management and the personnel cost attached to it fall.'
  },
  {
    id: 'et-084',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'A retail company stores their product inventory in a legacy system. Often, customers find products on the company\'s website and want to purchase them in-store. However, when they arrive, they discover that the products are out of stock. How could the company benefit from using an application programming interface (API)?',
    options: [
      'To create personalized product recommendations for customers',
      'To optimize their on-premises legacy system stability',
      'By manually linking each inventory system to the website on a case-by-case basis',
      'By programmatically connecting the inventory system to their website',
    ],
    answer: 3,
    explanation: 'An API connects the inventory system to the website programmatically, so stock levels shown online reflect what is actually in the store, continuously and without manual work.'
  },
  {
    id: 'et-085',
    topic: 'AI & machine learning',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization is training a machine learning model to predict extreme weather events in their country. How should they collect data to maximize prediction accuracy?',
    options: [
      'Collect all weather data evenly across all cities',
      'Collect all weather data primarily from at-risk cities',
      'Collect extreme weather data evenly across all cities',
      'Collect extreme weather data primarily from at-risk cities',
    ],
    answer: 0,
    explanation: 'A model that must predict events anywhere in the country needs data from everywhere, including normal conditions, or it learns a biased picture. Sampling only at-risk cities or only extreme events skews the training set.'
  },
  {
    id: 'et-086',
    topic: 'Operations & support',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization needs to search an application\'s source code to identify a potential issue. The application is distributed across multiple containers. Which Google Cloud product should the organization use?',
    options: [
      'Google Cloud Console',
      'Cloud Trace',
      'Cloud Monitoring',
      'Cloud Logging',
    ],
    answer: 3,
    explanation: 'Cloud Logging aggregates logs from every container, so the relevant application output can be searched in one place. Cloud Trace measures latency, and Cloud Monitoring tracks metrics.'
  },
  {
    id: 'et-087',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization\'s web developers and operations personnel use different systems. How will increasing communication between the teams reduce issues caused by silos?',
    options: [
      'By assigning blame for failures and establishing consequences',
      'By combining job role responsibilities to ensure that everyone has shared access',
      'By increasing data encryption to strengthen workflows',
      'By emphasizing shared ownership of business outcomes',
    ],
    answer: 3,
    explanation: 'Breaking down silos works when both teams are measured on the same business outcome rather than on their own component, which is the core of the DevOps culture. Blame and blanket access do not.'
  },
  {
    id: 'et-088',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How does a large hotel chain benefit from storing their customer reservation data in the cloud?',
    options: [
      'On-premises hardware access to transaction data',
      'Real-time data transformation at scale within an on-premises database',
      'Real-time business transaction accuracy at scale',
      'Physical hardware access during peak demand',
    ],
    answer: 2,
    explanation: 'A managed cloud database keeps every reservation transaction accurate and consistent at scale, including during peaks, which is what a booking system depends on.'
  },
  {
    id: 'et-089',
    topic: 'Compute',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants to migrate legacy applications currently hosted in their data center to the cloud. The current architecture dictates that each application needs its own operating system (OS) instead of sharing an OS. Which infrastructure solution should they choose?',
    options: [
      'Virtual machines',
      'Open source',
      'Serverless computing',
      'Containers',
    ],
    answer: 0,
    explanation: 'An application that requires its own operating system needs a virtual machine; containers share the host\'s kernel and cannot provide a separate OS.'
  },
  {
    id: 'et-090',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization operates their entire IT infrastructure from Google Cloud. What should they do to prepare for data breaches?',
    options: [
      'Reduce reliance on multi-factor authentication',
      'Data security is Google\'s responsibility, so preparation is minimal',
      'Create an incident plan to mitigate impacts',
      'Strengthen their data center perimeter security',
    ],
    answer: 2,
    explanation: 'Breaches have to be planned for, not just prevented: an incident response plan limits the damage. Security is a shared responsibility, and weakening authentication would make matters worse.'
  },
  {
    id: 'et-091',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to transform multiple types of structured and unstructured data in the cloud from various sources. The data must be readily accessible for analysis and insights. Which cloud data storage system should the organization use?',
    options: [
      'Relational database',
      'Private data center',
      'Data field',
      'Data warehouse',
    ],
    answer: 3,
    explanation: 'A data warehouse holds structured and semi-structured data from many sources together and is built for querying and analysis. A relational database serves applications, and a data lake keeps data raw.'
  },
  {
    id: 'et-092',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to use all available data to offer predictive suggestions on their website that improve over time. Which method should the organization use?',
    options: [
      'Data automation',
      'Trends analysis',
      'Machine learning',
      'Multiple regression',
    ],
    answer: 2,
    explanation: 'Machine learning improves its suggestions as more data arrives, which is what \'improves over time\' asks for. Regression and trend analysis are static analyses.'
  },
  {
    id: 'et-093',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'After rolling out a new update, an organization found a minor bug in its online video game. How should the organization approach this bug while following SRE principles?',
    options: [
      'Accept and learn from the bug because failure is normal',
      'Accept and ignore the bug because it is only minor',
      'Hold a postmortem to reprimand the employee responsible for the bug',
      'Document bug correction to eliminate all future bugs',
    ],
    answer: 0,
    explanation: 'SRE treats failure as normal and expected: you learn from it rather than punish it. Postmortems are deliberately blameless, ignoring a known bug is not learning, and no process eliminates all future bugs.'
  },
  {
    id: 'et-094',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Why do organizations often struggle to scale their on-premises application infrastructure?',
    options: [
      'Scaling compute instances could breach compliance and/or regulation',
      'Increasing compute capacity is time-consuming and costly',
      'Their serverless compute functions struggle to meet the demand',
      'Their multi-cloud architecture is complex and expensive',
    ],
    answer: 1,
    explanation: 'On-premises scaling means buying, racking and provisioning more hardware — a long lead time and a large up-front cost, which is precisely what cloud elasticity removes. Compliance and multi-cloud complexity are separate problems, and an on-premises estate has no serverless functions to blame.'
  },
  {
    id: 'et-095',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to use BigQuery data analytics to understand their website performance, but wants to move only some data into the cloud. Which environment should the organization use?',
    options: [
      'Private cloud',
      'On-premises',
      'Multi-cloud',
      'Hybrid cloud',
    ],
    answer: 3,
    explanation: 'Keeping most systems on-premises while moving some data into a Google Cloud service is the definition of hybrid cloud. Multi-cloud means several public providers; private cloud and on-premises would keep the data out of BigQuery entirely.'
  },
  {
    id: 'et-096',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is logging within the context of cloud technology?',
    options: [
      'Writing application and operating system events as text',
      'Monitoring network and resource limitations',
      'Tracking source code across an organization',
      'Recording infrastructure and hardware expenditure',
    ],
    answer: 0,
    explanation: 'Logging is the recording of events from applications and the operating system as text entries. Watching resource limits is monitoring, version control tracks source code, and expenditure is billing.'
  },
  {
    id: 'et-097',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How does Cloud SQL help organizations create business insights?',
    options: [
      'Integrates with business intelligence and analytics platforms',
      'Generates predictions using machine learning models',
      'Generates real-time charts and intelligent analytics',
      'Transforms business data from unstructured to structured',
    ],
    answer: 0,
    explanation: 'Cloud SQL is a managed relational database that connects to the business intelligence and analytics tools that produce insight — it stores and serves the data rather than analysing it itself. Predictions come from ML products, and charts come from Looker or Looker Studio. Current names: Data Studio → Looker Studio.'
  },
  {
    id: 'et-098',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization recently launched a virtual customer support agent, generating vast amounts of text and speech data. Why should they use a cloud data warehouse to interpret this data?',
    options: [
      'To natively visualize both types of data using a dashboard in real time',
      'To ingest and analyze structured and unstructured data at scale, in real time',
      'To secure data transmission between cloud and on-premises environments',
      'To transform data from structured to unstructured',
    ],
    answer: 1,
    explanation: 'A cloud data warehouse such as BigQuery ingests and analyses structured and unstructured data at scale in real time, which is what a flood of text and speech transcripts needs. Visualisation is a separate tool\'s job, and no warehouse turns structured data into unstructured data.'
  },
  {
    id: 'et-099',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to add a new function to their application. They want to write the code and let the public cloud provider handle the infrastructure. Which infrastructure solution should they use?',
    options: [
      'Virtual machines',
      'Bare Metal Solution',
      'Serverless computing',
      'Artifact Registry'
    ],
    answer: 2,
    explanation: 'Writing only the code and leaving the infrastructure to the provider is serverless computing. Virtual machines and Bare Metal leave the organisation managing servers, and Artifact Registry only stores images. Current names: Container Registry was shut down in 2025; Artifact Registry replaces it.'
  },
  {
    id: 'et-100',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to leverage tooling and automation as part of its new DevOps philosophy. Which operational challenge will this resolve?',
    options: [
      'Repetitive manual tasks that hinder workflows',
      'Time-consuming supervision of creative tasks',
      'Distribution and supply-chain issues',
      'Defective technical equipment that limits innovation',
    ],
    answer: 0,
    explanation: 'DevOps tooling and automation take the repetitive manual work out of the delivery pipeline so that people are not the bottleneck. Supervision of creative work, supply chains and faulty equipment are not what automation addresses here.'
  },
  {
    id: 'et-101',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs to store structured, semi-structured, and unstructured data in its raw, native format in the same repository. Which cloud data management solution should the organization use?',
    options: [
      'Data field',
      'Data lake',
      'Database',
      'Data warehouse',
    ],
    answer: 1,
    explanation: 'A data lake holds structured, semi-structured and unstructured data together in its raw, native format. A data warehouse and a database both require the data to be modelled first, and a data field is not a storage solution.'
  },
  {
    id: 'et-102',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants its users to validate a series of new features for their app. Why should they use App Engine?',
    options: [
      'Because their app is containerized and enabled by microservices',
      'Because the updated app will only include new features',
      'To run different versions of the app for different users',
      'To run different versions of the app for the same user',
    ],
    answer: 2,
    explanation: 'App Engine can serve several versions of an application at once and split traffic between them, so one group of users validates the new features while everyone else stays on the current version. A single user does not get different versions, and containerisation is not required in the standard environment.'
  },
  {
    id: 'et-103',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'How would an organization benefit from using Looker?',
    options: [
      'Optimal identity and access management',
      'Leading serverless warehousing technology',
      'Robust data roll-back accuracy',
      'Advanced business intelligence and analytics',
    ],
    answer: 3,
    explanation: 'Looker is Google Cloud\'s business intelligence platform: modelling, dashboards and embedded analytics. The serverless warehouse underneath it is BigQuery, and identity and rollback are unrelated.'
  },
  {
    id: 'et-104',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization delivers a proactive healthcare service. They want to efficiently and automatically collect patient data. What should the organization encourage the patients to do?',
    options: [
      'Use at-home health screening devices and then upload their health data daily',
      'Wear Internet of Things (IoT) devices that upload their health data in real time',
      'Self-assess their health data and then document and upload it in real time',
      'Visit a nurse who will use Internet of Things (IoT) devices to collect and upload their health data',
    ],
    answer: 1,
    explanation: 'Efficient and automatic means the patient does nothing: wearable IoT devices stream readings in real time. Every other option adds a manual step — uploading daily, self-assessing, or visiting a nurse.'
  },
  {
    id: 'et-105',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How would a global organization benefit from managing their data with Spanner?',
    options: [
      'Spanner is optimized for cold storage',
      'Spanner replicates data across regions in real time',
      'Spanner is optimized to ingest unstructured data',
      'Spanner visualizes and analyzes data in real time',
    ],
    answer: 1,
    explanation: 'Spanner\'s distinguishing feature is synchronous replication across regions with strong consistency, so a global organisation reads and writes the same data everywhere. Cold storage, unstructured ingestion and real-time visualisation describe other products.'
  },
  {
    id: 'et-106',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An employee receives an email from their internet service provider asking for their bank account number and password. Which cybersecurity threat is this?',
    options: [
      'Ransomware',
      'Distributed Denial of Service',
      'Spamming',
      'Phishing',
    ],
    answer: 3,
    explanation: 'Asking for banking credentials by impersonating a trusted sender is phishing. Ransomware encrypts data for payment, a DDoS floods a service with traffic, and spam is unsolicited bulk mail without the impersonation.'
  },
  {
    id: 'et-107',
    topic: 'Cloud fundamentals',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants to move from a tactical cloud adoption approach to a transformational approach. How should they adapt the way they lead the organization?',
    options: [
      'Increase top-down visibility and foster a culture of blamelessness',
      'Shift from an operational expenditure model to capital expenditure',
      'Drive cloud adoption with an individual contributor focus',
      'Invest in on-premises infrastructure to redesign relationships between IT and employees',
    ],
    answer: 0,
    explanation: 'A transformational approach is a leadership change: visible executive sponsorship from the top and a blameless culture so teams can take risks. Moving back to capital expenditure or on-premises infrastructure is the opposite direction, and transformation is an organisational effort rather than an individual one.'
  },
  {
    id: 'et-108',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Why is data stored in Google Cloud secure and private?',
    options: [
      'Data is encrypted by the Security Command Center',
      'Data is encrypted by Cloud Data Loss Prevention',
      'Data is encrypted by default',
      'Data is encrypted when an appropriate tag is applied',
    ],
    answer: 2,
    explanation: 'Google Cloud encrypts customer data at rest by default, with no action or tag required from the customer. Security Command Center reports on posture and Cloud DLP classifies and masks sensitive data; neither is what performs the encryption.'
  },
  {
    id: 'et-109',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to use multiple marketing datasets to forecast user acquisition. How should they use cloud technology to gain new insights from the data?',
    options: [
      'Import the datasets into a custom data warehouse, and then archive old data',
      'Import and selectively archive the datasets in a custom data lake',
      'Separate the datasets and make predictions using machine learning',
      'Combine the datasets and make predictions using machine learning',
    ],
    answer: 3,
    explanation: 'Forecasting from several marketing datasets means joining them first — the signal lies in the combination — and then training a model on the combined set. Keeping them separate loses the cross-dataset relationships, and archiving is a storage decision, not an insight.'
  },
  {
    id: 'et-110',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to collect metrics and metadata from their cloud applications and put them into dashboards. Which Google Cloud tool should they use?',
    options: [
      'Cloud Monitoring',
      'Cloud Trace',
      'Cloud Logging',
      'Cloud Profiler'
    ],
    answer: 0,
    explanation: 'Cloud Monitoring collects metrics and metadata from applications and infrastructure and renders them as dashboards, charts and alerts. Cloud Logging stores log entries, Cloud Trace measures latency, and Cloud Profiler shows which code uses the most CPU and memory.'
  },
  {
    id: 'et-111',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A manager wants to review Google Cloud data access among their employees. Who is responsible for defining data access policies?',
    options: [
      'Cloud Identity',
      'Google Cloud Customer Care team',
      'Their organization\'s IT team',
      'Their organization\'s end users',
    ],
    answer: 2,
    explanation: 'Under the shared responsibility model, who may see which data is always the customer\'s decision — their own IT team sets the access policies. Cloud Identity and IAM are the tools that enforce those policies, and Customer Care never defines them.'
  },
  {
    id: 'et-112',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has decided to modernize their applications in the cloud to keep up with their customers\' needs. What may have prompted this business decision?',
    options: [
      'Their on-premises applications only autoscale to meet demand.',
      'They want to change from a pay-as-you-go model to a capital expenditure model.',
      'Their source code changes erroneously without developer interaction.',
      'Their on-premises applications take months to update and deploy.',
    ],
    answer: 3,
    explanation: 'Months to update and deploy is the classic driver for application modernisation: cloud-native delivery cuts release cycles to days or hours. Autoscaling on-premises would be an advantage, a move to capital expenditure is the wrong direction, and source code does not change by itself.'
  },
  {
    id: 'et-113',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization needs to categorize a large group of photographs using pre-trained machine learning. Which Google Cloud product or service should the organization use?',
    options: [
      'Vision API',
      'BigQuery ML',
      'Agent Platform AutoML (image)',
      'Looker'
    ],
    answer: 0,
    explanation: 'Categorising a large set of photographs with a model that already exists is the Vision API — pre-trained, no training data required. Agent Platform AutoML (image) is for training your own model on custom labels, and BigQuery ML and Looker work on tabular data. Current names: AutoML Vision, Tables and Video are now Agent Platform AutoML (image, tabular, video) in Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-114',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization provides a loyalty program for its customers. It recently partnered with other businesses so that customers can get loyalty points at a range of other stores. Why should the organization use application programming interfaces (APIs)?',
    options: [
      'To migrate all partner data for disaster recovery',
      'To analyze and publish loyalty program statistics to a dashboard',
      'To personalize recommendations for loyalty card users',
      'To connect third-party systems to ensure up-to-date information',
    ],
    answer: 3,
    explanation: 'APIs are how two organisations\' systems exchange live data, so points earned at a partner store appear on the customer\'s balance immediately. Analytics, recommendations and disaster recovery are other products\' jobs.'
  },
  {
    id: 'et-115',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A travel agency wants to seamlessly share their social media content with partners. What should the organization use?',
    options: [
      'A NoSQL database',
      'Config Sync',
      'The App Engine standard environment',
      'An application programming interface (API)'
    ],
    answer: 3,
    explanation: 'Sharing content with partner systems in a controlled, repeatable way is exactly what an API is for. A NoSQL database stores the content, App Engine hosts the code, and Config Sync governs clusters. Current names: Anthos Config Management → Config Sync and Policy Controller.'
  },
  {
    id: 'et-116',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'How do out-of-the-box APIs make artificial intelligence and machine learning more accessible for all Google Cloud customers?',
    options: [
      'They don\'t require technical specialists.',
      'They don\'t require data input and validation.',
      'They require fewer security permissions.',
      'They all require custom training models.',
    ],
    answer: 0,
    explanation: 'Pre-trained APIs are usable by ordinary developers because the model is already built — no data science specialist and no training run required. They still need input data, they carry the usual permissions, and requiring custom training is precisely what they avoid.'
  },
  {
    id: 'et-117',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization needs to migrate specialized workloads to the cloud while maintaining their existing complex licensing and architecture. What Google Cloud solution should the organization use?',
    options: [
      'Compute Engine',
      'Bare Metal Solution',
      'Cloud Run',
      'Cloud Run functions',
    ],
    answer: 1,
    explanation: 'Bare Metal Solution provides dedicated, non-virtualised hardware next to Google Cloud for specialised workloads — typically Oracle — whose licensing and architecture cannot be changed. Compute Engine virtualises, and the serverless products require the application to be rewritten. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-118',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization finds that the amount of cash in their vending machines doesn\'t match the value of items sold. They have decided to upgrade their vending machines with cloud-based mobile payment systems. How could the organization benefit from this upgrade?',
    options: [
      'They could relax data access permissions.',
      'They could reduce their error budget overspend.',
      'They could improve their perimeter security.',
      'They could view data history to see transactions.',
    ],
    answer: 3,
    explanation: 'A cloud-based payment system leaves a transaction record for every sale, so the takings can be reconciled against what the machine sold — the missing-cash problem disappears. Relaxing access permissions is a risk, not a benefit, and error budgets and perimeter security are unrelated.'
  },
  {
    id: 'et-119',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'A food delivery service needs access to real-time menu information from all partner restaurants. They also need to share customer order information with the restaurants in real time. What should the organization use?',
    options: [
      'Site reliability engineering (SRE)',
      'An application programming interface (API)',
      'A customized machine learning model',
      'A multi-regional database',
    ],
    answer: 1,
    explanation: 'Two parties needing each other\'s data in real time — menus out, orders in — is the textbook API integration. SRE is a discipline, an ML model predicts rather than exchanges, and a multi-regional database does not connect two organisations\' systems.'
  },
  {
    id: 'et-120',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is planning to create many new applications and needs a system for managing and orchestrating their containers. Why should they use Google Kubernetes Engine?',
    options: [
      'It enables rapid application deployment and testing.',
      'It optimizes virtual machine performance.',
      'It connects legacy systems to an application.',
      'It provides pre-written source code for application development.',
    ],
    answer: 0,
    explanation: 'GKE orchestrates containers so that teams can deploy, test and roll back many applications quickly and consistently. It manages containers rather than tuning virtual machines, does not connect legacy systems, and ships no source code.'
  },
  {
    id: 'et-121',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'How does Google Cloud enable customers to leverage the power of artificial intelligence and machine learning?',
    options: [
      'With scalable on-premises tensor processing units',
      'With APIs and tools for users at different levels of expertise',
      'With affordable and scalable quantum computing',
      'With machine learning models that always require custom training',
    ],
    answer: 1,
    explanation: 'Google Cloud\'s AI story is a ladder: pre-trained APIs for non-specialists, AutoML for people with data but no ML background, and Gemini Enterprise Agent Platform and TensorFlow for practitioners. TPUs are cloud hardware, quantum computing is not the answer here, and custom training is not always required. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-122',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An online retail organization wants to optimize their service. What is an example of unstructured data that they can use to make decisions?',
    options: [
      'Customer survey comments',
      'Seller location coordinates',
      'Product sales trends',
      'Warehouse inventory records',
    ],
    answer: 0,
    explanation: 'Free-text survey comments have no fixed schema, which makes them unstructured. Coordinates, sales trends and inventory records all fit neatly into rows and columns.'
  },
  {
    id: 'et-123',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization\'s public cloud provider failed to meet their SLA of 99.99% availability. What is the potential impact on the organization?',
    options: [
      'The organization risks using up their error budget.',
      'Renegotiation of the SLA to put less emphasis on uptime could be necessary.',
      'Unexpected downtime could risk the loss of customers.',
      'All data stored in their database could be unexpectedly lost.',
    ],
    answer: 2,
    explanation: 'A missed availability SLA means real downtime for real users, and the business risk of that is customers leaving. The error budget is an internal SRE construct, not something the provider consumes, and a missed SLA implies neither data loss nor a renegotiation.'
  },
  {
    id: 'et-124',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization needs to train a machine learning model to categorize photographs. Which Google Cloud product or service should the organization use?',
    options: [
      'Video Intelligence API',
      'Agent Platform AutoML (image)',
      'BigQuery ML',
      'Looker'
    ],
    answer: 1,
    explanation: 'Training a model on your own labelled photographs, without writing the model, is Agent Platform AutoML (image). The Vision API cannot learn new categories, the Video Intelligence API works on video, and BigQuery ML and Looker are tabular. Current names: AutoML Vision, Tables and Video are now Agent Platform AutoML (image, tabular, video) in Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-125',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A multinational organization has decided to use public cloud services to modernize their IT infrastructure. What is one benefit of doing this?',
    options: [
      'They can perform hardware maintenance outside of normal business hours.',
      'They can expect 100% service availability in all regions.',
      'Built-in security is no longer required during data migrations.',
      'Access to data and computer resources is not tied to a geographical location.',
    ],
    answer: 3,
    explanation: 'Public cloud decouples access from place: the data and the compute are reachable from anywhere over Google\'s network. Hardware maintenance is no longer the customer\'s concern at all, no provider promises 100% availability, and migrations still need security.'
  },
  {
    id: 'et-126',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization meets their service level objective (SLO) of 99.999% ("five nines"). How much downtime do their end users experience per year?',
    options: [
      '5 minutes',
      '500 minutes',
      '5 hours',
      '5 days',
    ],
    answer: 0,
    explanation: 'Five nines is 99.999% of a year, which leaves about 5.26 minutes of downtime — roughly five minutes. Three nines would be about 500 minutes, and two nines about 5,000.'
  },
  {
    id: 'et-127',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to introduce a new image recognition login system. What should the organization do to follow SRE principles?',
    options: [
      'Roll out the new system to a subset of employees to test it out.',
      'Roll out the new system to all employees to collect as much data as possible.',
      'Avoid rolling out the new system because it may have security flaws.',
      'Avoid rolling out the new system because it may violate privacy policy.',
    ],
    answer: 0,
    explanation: 'SRE rolls changes out progressively — a canary group first — so that a fault is caught while its blast radius is small. Releasing to everyone at once maximises the damage, and refusing to ship at all is not an SRE principle.'
  },
  {
    id: 'et-128',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What does Cloud Profiler help an organization do?',
    options: [
      'Implement code updates in real time without affecting the service level objective (SLO).',
      'Continuously analyze the CPU and memory use of code running in production, with very low overhead.',
      'Manage source code and accelerate application development.',
      'Analyze live source code only during scheduled user downtime.'
    ],
    answer: 1,
    explanation: 'Cloud Profiler samples running production code continuously and shows which functions use the most CPU, memory and other resources, with overhead low enough to leave it on. It does not deploy code or manage source, and it works on live traffic rather than during downtime. Current names: Cloud Debugger was shut down in 2023.'
  },
  {
    id: 'et-129',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How can a streaming service meet global compliance requirements using the cloud?',
    options: [
      'By automatically encrypting personally identifiable information',
      'By obtaining a business license to operate in a new market',
      'By allowing users to disable two-factor authentication',
      'By adhering only to data polices of the country in which the head office is registered',
    ],
    answer: 0,
    explanation: 'Compliance regimes such as GDPR turn on how personally identifiable information is protected, and Google Cloud encrypts it automatically. A business licence is not a cloud control, disabling two-factor authentication weakens compliance, and following only the head office\'s rules ignores every other jurisdiction.'
  },
  {
    id: 'et-130',
    topic: 'Compute',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants full control of their virtual machine infrastructure for a custom home-grown application with a product that autoscales and automatically updates. Which Google Cloud product or solution should the organization use?',
    options: [
      'Cloud Build',
      'Cloud Run',
      'Compute Engine',
      'App Engine',
    ],
    answer: 2,
    explanation: 'Full control of the virtual machines points at Compute Engine, where managed instance groups provide autoscaling and automatic rolling updates on top of that control. Cloud Run and App Engine take the machines away, and Cloud Build is a CI/CD service.'
  },
  {
    id: 'et-131',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants to build an entirely new infrastructure and applications in the cloud. Which application modernization approach should the organization use?',
    options: [
      'Move the application to the cloud, and then change it.',
      'Change their application, and then move it to the cloud.',
      'Invent in greenfield.',
      'Invent in brownfield.',
    ],
    answer: 2,
    explanation: 'Nothing exists yet — new infrastructure, new applications — so this is inventing in greenfield. Compare question 136, where a new cloud application replaces an existing on-premises one: Google\'s course calls that brownfield, and the two questions are written to test exactly that difference. The first two options describe lift-and-shift and refactor-then-move.'
  },
  {
    id: 'et-132',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to upskill their IT staff. How can they do this in a transformational way?',
    options: [
      'Prioritize training current employees instead of hiring new recruits with cloud experience.',
      'Prioritize giving privileged access to third-party partners and contractors to fill IT knowledge gaps.',
      'Create a culture of self-motivated, isolated learning with official training materials.',
      'Create a culture of continuous peer-to-peer learning with official training materials.',
    ],
    answer: 3,
    explanation: 'Transformational upskilling is cultural and continuous: peers teaching each other against official curricula, rather than each person studying alone. Choosing between training and hiring is a staffing decision, and handing privileged access to contractors is a security problem, not a learning strategy.'
  },
  {
    id: 'et-133',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Several departments in an organization are working together on a project. The organization wants to customize access to resources for each department. What is the quickest and most efficient way to achieve this?',
    options: [
      'By mapping IAM roles to job functions for each department',
      'By assigning IAM primitive roles to each employee',
      'By applying "least-privilege" to roles for each employee',
      'By creating a single shared service account for all departments',
    ],
    answer: 0,
    explanation: 'Predefined IAM roles are written around job functions, so mapping each department to the roles it needs is both quick and precise. Primitive roles are far too broad, per-employee grants do not scale, and one shared service account destroys accountability.'
  },
  {
    id: 'et-134',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization notices that some of their cloud expenditures are too high. What should the organization do to control costs?',
    options: [
      'Streamline the hardware procurement process to reduce costs.',
      'Share cost views with the departments to establish more accountability.',
      'Change the cost model from operational expenditure to capital expenditure.',
      'Ensure that all could resources are tagged with a single tag.',
    ],
    answer: 1,
    explanation: 'Cost control in the cloud starts with visibility and ownership: when each department sees its own spend, the spend changes. Hardware procurement is no longer the cost driver, a move to capital expenditure is backwards, and one tag for everything gives no breakdown at all.'
  },
  {
    id: 'et-135',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is monitoring within the context of cloud operations?',
    options: [
      'Observing cloud expenditure in real time to ensure that budgets are not exceeded',
      'Collecting predefined and custom metrics from applications and infrastructure',
      'Tracking user activities to guarantee compliance with privacy regulations',
      'Tracing user location to document regional access and utilization',
    ],
    answer: 1,
    explanation: 'Monitoring is the collection of predefined and custom metrics from applications and infrastructure, which is what then feeds dashboards and alerts. Watching budgets is billing, and tracking users is auditing.'
  },
  {
    id: 'et-136',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization wants to create a new application in the cloud to replace an existing on-premises application. Which application modernization approach should the organization use?',
    options: [
      'Move the application to the cloud, and then change it.',
      'Change their application, and then move it to the cloud.',
      'Invent in greenfield.',
      'Invent in brownfield.',
    ],
    answer: 3,
    explanation: 'Google\'s course defines inventing in brownfield as building a new cloud application that replaces an existing legacy one — this scenario almost word for word — and keeps greenfield for building where nothing exists yet, which is question 131. Be careful here: general software-engineering usage runs the other way, calling a wholesale replacement greenfield and reserving brownfield for new work that must live alongside systems still running. Answer the exam\'s definition, not the industry one.'
  },
  {
    id: 'et-137',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Why should an organization consider the total cost of ownership (TCO) when moving from on-premises to the cloud?',
    options: [
      'To evaluate error budget',
      'To understand service level availability',
      'To evaluate return on investment',
      'To calculate required compute power',
    ],
    answer: 2,
    explanation: 'Total cost of ownership counts everything the estate costs — hardware, licences, power, people — so that the saving from moving can be weighed against the cost of moving: return on investment. Error budgets, availability and sizing are separate calculations.'
  },
  {
    id: 'et-138',
    topic: 'Security & identity',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'How does Google Cloud ensure that customer data remains secure and private when at rest?',
    options: [
      'By aggregating training data for customers within each industry',
      'By automatically locking files containing suspicious code',
      'By auditing platform privacy practices against industry standards',
      'By providing privacy reviews for critical customer applications',
    ],
    answer: 2,
    explanation: 'Of the options offered, independent auditing of Google\'s privacy practices against industry standards is the one that speaks to how data is protected at rest. The real mechanism is that data at rest is encrypted by default — see question 108 — which is not among these four, so the community settles on the audit answer.'
  },
  {
    id: 'et-139',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization\'s developers are growing increasingly frustrated by the limitations of their on-premises infrastructure. How would they benefit from leveraging cloud technology?',
    options: [
      'They can expect 100% service availability.',
      'They can avoid the limitations of serverless computing.',
      'They can have new tools to innovate and optimize resource usage.',
      'They can optimize maintenance for their on-premises infrastructure.',
    ],
    answer: 2,
    explanation: 'Cloud technology hands developers managed services, elastic capacity and modern tooling, so they can experiment instead of waiting on hardware. No provider offers 100% availability, and optimising the on-premises estate is what they are trying to escape.'
  },
  {
    id: 'et-140',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'How is service availability measured in the context of cloud technology?',
    options: [
      'Number of available regions',
      'Percentage of uptime',
      'Speed of response time',
      'Number of downtime incidents',
    ],
    answer: 1,
    explanation: 'Availability is expressed as the percentage of time a service is up over a period — the nines in an SLA. Region count, response time and incident count measure other things.'
  },
  {
    id: 'et-141',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants a cost-effective relational database. Which Google Cloud service should the organization use?',
    options: [
      'Cloud Storage',
      'BigQuery',
      'Cloud SQL',
      'Dataflow',
    ],
    answer: 2,
    explanation: 'Cloud SQL is the managed relational database for standard MySQL, PostgreSQL and SQL Server workloads, and is far cheaper than Spanner for a single-region application. BigQuery is an analytics warehouse, Cloud Storage holds objects, and Dataflow processes pipelines.'
  },
  {
    id: 'et-142',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is altering their gaming product so that it is compatible with cloud technology. What can they expect when moving from traditional technology to cloud technology?',
    options: [
      'No change to existing responsibilities',
      'A shift toward OpEx',
      'A shift toward using structured data',
      'Increased hardware maintenance',
    ],
    answer: 1,
    explanation: 'Cloud replaces up-front hardware purchases with metered consumption, so the spend shifts from capital expenditure to operational expenditure. Responsibilities change under the shared responsibility model, hardware maintenance goes away, and nothing forces the data to become structured.'
  },
  {
    id: 'et-143',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'When an organization adopts cloud technology, how does their total cost of ownership (TCO) shift?',
    options: [
      'Away from cost management toward capital expenditure',
      'Away from operational expenditure toward cost management',
      'Away from capital expenditure toward operational expenditure',
      'Away from operational expenditure toward capital expenditure',
    ],
    answer: 2,
    explanation: 'The same shift seen from the TCO side: what was capital expenditure on owned equipment becomes operational expenditure on consumed services. The remaining options invert that direction or mix in cost management, which is a practice rather than an expenditure model.'
  },
  {
    id: 'et-144',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Which policy helps Google Cloud keep customer data private?',
    options: [
      'Google tests the service availability of customer applications.',
      'Google does not use customer data for advertising purposes.',
      'Google migrates customer data to an offline server when a threat is detected.',
      'Google does not allow customers to change encryption keys.',
    ],
    answer: 1,
    explanation: 'Google\'s published privacy commitment is that customer data is not used for advertising. Customers can manage their own encryption keys, Google does not test customer applications\' availability, and there is no offline migration on threat.'
  },
  {
    id: 'et-145',
    topic: 'Operations & support',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'A cloud-native organization is not meeting their service level objective (SLO) but has not exhausted their error budget. What should the organization prioritize?',
    options: [
      'Innovation to improve user experience',
      'Hardware reliability to improve availability',
      'Stability to avoid prolonged user downtime',
      'Speed to release new features',
    ],
    answer: 2,
    explanation: 'The SLO is being missed but the error budget still has room, which is the signal to stop shipping features and spend the remaining budget on making the service stable again. Innovation and speed are what the budget funds when it is healthy, and hardware reliability is not a cloud-native lever.'
  },
  {
    id: 'et-146',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is moving away from an on-premises infrastructure. Instead, they want to create, access, and share information virtually in the cloud. What should the organization consider?',
    options: [
      'Built-in security when moving their data to the cloud',
      'Replacing their perimeter security with data encryption keys',
      'Optimizing cost-management with a capital expenditure model',
      'Increased hardware capacity when moving their data to the cloud',
    ],
    answer: 0,
    explanation: 'Moving off-premises means the perimeter is no longer the control, so what matters is the security built into the platform and how the data is protected there. Encryption keys supplement perimeter security rather than replacing it, the cost model moves toward operational expenditure, and hardware capacity ceases to be the customer\'s concern.'
  },
  {
    id: 'et-147',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has an on-premises IT infrastructure. Their customer-facing application repeatedly fails during peak usage. What could be causing this issue?',
    options: [
      'A serverless compute function struggles to scale.',
      'The application contains unclean data.',
      'They don\'t have enough servers to meet the demand.',
      'The application is only configurable on-premises.',
    ],
    answer: 2,
    explanation: 'Failing repeatedly at peak usage and only at peak is a capacity problem: the on-premises server fleet is sized for the average, not the spike. There are no serverless functions on-premises, and unclean data or configuration would not correlate with load.'
  },
  {
    id: 'et-148',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is artificial intelligence?',
    options: [
      'Any system that ingests data in real time',
      'Any system that automatically structures data',
      'Any system capable of a task that requires smart analytics to generate predictions',
      'Any system capable of a task that normally requires human cognition',
    ],
    answer: 3,
    explanation: 'Artificial intelligence is the umbrella term for systems performing tasks that would normally require human cognition. Machine learning is the subset that learns those tasks from data; ingesting or structuring data is not intelligence.'
  },
  {
    id: 'et-149',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What does Cloud Logging help an organization do?',
    options: [
      'Analyze live source code and log code updates.',
      'Deploy infrastructure as code.',
      'Analyze logs and accelerate application troubleshooting.',
      'Manage storage of custom VM images.',
    ],
    answer: 2,
    explanation: 'Cloud Logging collects, stores and lets you search and analyse log entries, which is how troubleshooting gets faster. finding expensive code is Cloud Profiler, infrastructure as code is Infrastructure Manager (Terraform), and VM images live in Compute Engine.'
  },
  {
    id: 'et-150',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How is privacy defined in the context of cloud technology?',
    options: [
      'Restrictions on data access and sharing',
      'Procedures to authenticate user identity',
      'Susceptibility to data breaches and cyber attacks',
      'Compliance with regulatory standards',
    ],
    answer: 0,
    explanation: 'Privacy is about control over data: who may access it and with whom it is shared. Authentication proves identity, breach susceptibility is a security risk, and regulatory compliance is the obligation that follows from privacy rather than its definition.'
  },
  {
    id: 'et-151',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to write and run small pieces of code in a serverless way that respond to events like huge discounts. Which Google Cloud compute solution should the organization use?',
    options: [
      'Google Kubernetes Engine',
      'Cloud Run functions',
      'Bare Metal Solution',
      'Compute Engine',
    ],
    answer: 1,
    explanation: 'Small pieces of code that run in response to an event, with nothing to provision, is the Cloud Run functions description almost word for word. GKE and Compute Engine leave you managing clusters or machines, and Bare Metal Solution is dedicated hardware. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-152',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to search hundreds of scanned documents for key information like dates, names, and other specific words. Why should the organization use application programming interfaces (APIs)?',
    options: [
      'To replace the scanned documents with an online survey',
      'To ingest data in real time and encrypt unmatched words',
      'To create digital versions of the documents and locate key information',
      'To transform the documents into unstructured data.',
    ],
    answer: 2,
    explanation: 'An API such as Document AI reads the scans, turns them into machine-readable text and pulls out the entities — dates, names, key terms. Replacing the documents with a survey loses the archive, encryption is not the goal, and the transformation runs from unstructured toward structured, not the other way.'
  },
  {
    id: 'et-153',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs a platform to create custom end-to-end artificial intelligence models. Which Google Cloud product or service should the organization use?',
    options: [
      'Dataproc',
      'Compute Engine',
      'Recommendations AI',
      'Gemini Enterprise Agent Platform',
    ],
    answer: 3,
    explanation: 'Gemini Enterprise Agent Platform is the single platform for building custom models end to end: data, training, tuning, deployment and monitoring. Dataproc runs Spark and Hadoop, Compute Engine is raw virtual machines, and Recommendations AI is a finished application rather than a platform. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-154',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is training a machine learning model to make predictions. What could improve the prediction accuracy of their model?',
    options: [
      'An increase in storage capacity',
      'Higher network bandwidth',
      'An increase in training data',
      'Faster CPU processors',
    ],
    answer: 2,
    explanation: 'Accuracy is a function of the data the model learns from, so more — and more representative — training data is the lever. Storage, bandwidth and faster processors change how quickly you can train, not how well the model predicts.'
  },
  {
    id: 'et-155',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is an example of structured data that a healthcare facility stores in their system?',
    options: [
      'X-ray images',
      'Surgery video recordings',
      'Blood pressure history',
      'Physician-written notes',
    ],
    answer: 2,
    explanation: 'Blood pressure readings are numbers in named fields with a fixed shape, which is what makes data structured. X-rays, video and free-text physician notes carry no schema and are unstructured.'
  },
  {
    id: 'et-156',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to move from a tactical cloud adoption approach to a transformational approach. How should they change their cloud security?',
    options: [
      'Provide staff identities using only Google Cloud authentication.',
      'Provide multiple layers of network security using a zero-trust model.',
      'Emphasize strong perimeter security and trust in their private network.',
      'Emphasize three main Identity Access Management roles: owner, editor, and viewer.',
    ],
    answer: 1,
    explanation: 'The transformational posture is zero trust: no implicit trust in the network, with identity and policy checked at every layer. Trusting the private perimeter is the traditional model being left behind, one authentication source is too narrow, and owner/editor/viewer are the primitive roles that fine-grained IAM replaces.'
  },
  {
    id: 'et-157',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What can customers expect if their cloud provider doesn\'t meet their service level agreement (SLA)?',
    options: [
      'Increase in subscription fees',
      'Cloud service shutdown',
      'Refund for service interruption',
      'Error budget expansion',
    ],
    answer: 2,
    explanation: 'An SLA is a contract, and the remedy for missing it is normally a service credit or refund for the affected period. Fees do not rise, the service is not shut down, and the error budget is an internal SRE measure rather than something the provider grants.'
  },
  {
    id: 'et-158',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to ensure that their developers can easily use application programming interfaces (APIs) in future projects. Which Google product or solution should they use?',
    options: [
      'Application migration',
      'Apigee',
      'The App Engine flexible environment',
      'AppSheet',
    ],
    answer: 1,
    explanation: 'Apigee is the API management platform: design, publish, secure, version and document APIs so they can be discovered and reused across projects. AppSheet builds no-code applications, App Engine hosts code, and application migration is unrelated.'
  },
  {
    id: 'et-159',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs frequent access to only a subset of their data. They want to reduce costs by depositing the rest of their data across Nearline, Coldline, and Archive repositories. Which Google Cloud product should the organization use?',
    options: [
      'Filestore',
      'Cloud Storage',
      'Knowledge Catalog',
      'Spanner',
    ],
    answer: 1,
    explanation: 'Nearline, Coldline and Archive are storage classes within Cloud Storage, so one product covers the hot subset and the colder tiers, with lifecycle rules moving objects between them. Filestore is network file storage, Spanner is relational, and Knowledge Catalog holds metadata. Current names: Data Catalog → Knowledge Catalog (formerly Dataplex Universal Catalog).'
  },
  {
    id: 'et-160',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A customer service department wants to increase their operational efficiency while maintaining personalized dialog with their customers. What Google Cloud product or service should the organization use?',
    options: [
      'Recommendations AI',
      'Cloud Identity',
      'Contact Center AI',
      'Text-to-Speech',
    ],
    answer: 2,
    explanation: 'Contact Center AI combines virtual agents with agent assist, so routine contacts are handled automatically while conversations stay natural. Text-to-Speech is one component of that, Recommendations AI serves retail, and Cloud Identity is not a contact-centre product.'
  },
  {
    id: 'et-161',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is struggling to keep up with the growth of their application which is running on legacy infrastructure. What might be holding them back?',
    options: [
      'The time it takes their serverless compute function to scale',
      'The overreliance on platform as a service',
      'The inaccessibility of their data due to perimeter security',
      'The cost of provisioning hardware for peak usage',
    ],
    answer: 3,
    explanation: 'Legacy infrastructure has to be bought for the busiest hour, so growth means provisioning hardware for peak and paying for it all year. There are no serverless functions or platform services in a legacy estate to blame, and perimeter security is not what caps growth.'
  },
  {
    id: 'et-162',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to build autoscaling web applications without having to manage application infrastructure Which Google Cloud product should they use?',
    options: [
      'GKE with fleet management',
      'Apigee',
      'AutoML',
      'App Engine'
    ],
    answer: 3,
    explanation: 'App Engine is the fully managed platform for web applications: deploy the code and it scales automatically with no infrastructure to run. GKE fleet management manages clusters, Apigee manages APIs, and AutoML trains models. Current names: Anthos became GKE Enterprise in 2023, and since September 2025 its features are part of GKE itself (fleet management), with Google Distributed Cloud for on-premises.'
  },
  {
    id: 'et-163',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is an organization exclusively responsible for when they access an application through a software as a service (SaaS) model?',
    options: [
      'Maintaining overall system operability',
      'Maintaining customer-facing content',
      'Monitoring data center servers',
      'Monitoring computer networks',
    ],
    answer: 1,
    explanation: 'Under SaaS the provider runs everything down to the data centre, and what stays exclusively with the customer is their own content and data. System operability, servers and networks all sit on the provider\'s side.'
  },
  {
    id: 'et-164',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization needs to train a custom machine learning model to categorize customer responses from their website\'s contact form. Which Google Cloud product or service should the organization use?',
    options: [
      'GKE with fleet management',
      'Recommendations AI',
      'Supervised tuning of a Gemini model in Agent Platform',
      'Pub/Sub'
    ],
    answer: 2,
    explanation: 'Teaching a model your own labelled text categories without building one from scratch is supervised tuning of a Gemini model in Gemini Enterprise Agent Platform (Supervised tuning of a Gemini model in Agent Platform, which used to do this, has been retired). Recommendations AI is pre-built for retail, and GKE with fleet management and Pub/Sub are not machine learning products.'
  },
  {
    id: 'et-165',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Which cybersecurity threat can lead to information being stolen or damaged without a user ever being aware?',
    options: [
      'SLA policy violation',
      'Malware attack',
      'Ransomware attack',
      'Incomplete data input',
    ],
    answer: 1,
    explanation: 'Malware can sit quietly on a system, stealing or corrupting data without announcing itself. Ransomware is the opposite — it makes itself known by demanding payment — and an SLA violation or bad input is not a cybersecurity threat of this kind.'
  },
  {
    id: 'et-166',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has decided to create a mobile app for their customer-facing service. What may have prompted this business decision?',
    options: [
      'Customers expect information to be easily accessible on any device.',
      'Customers expect mobile-only access to information in the cloud era',
      'Developers can apply increased data security on a mobile app.',
      'Developers can run different versions of the service to test features only through a mobile app.',
    ],
    answer: 0,
    explanation: 'People now reach services from a phone as readily as a laptop, and meeting that expectation is what drives a mobile app. Customers do not expect mobile-only access, and neither stronger security nor running test versions is exclusive to mobile.'
  },
  {
    id: 'et-167',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization suffers a major data leak only six months after upgrading its security system. What should the organization do to ensure long-term security?',
    options: [
      'Extend data retention policy lengths to at least seven years.',
      'Pay more to get the best security system available on the market.',
      'Hire cybersecurity experts to further develop their data security plan',
      'Wait for a more advanced security system to be released',
    ],
    answer: 2,
    explanation: 'A breach six months after buying a new system shows the gap is expertise and process, not product: people who can develop and maintain the security plan are what close it. Spending more, extending retention or waiting for better technology all leave the same gap.'
  },
  {
    id: 'et-168',
    topic: 'Migration & modernisation',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization has started to develop cloud-native applications to replace their legacy applications. What else should the organization do to adopt the cloud?',
    options: [
      'Provide privileged cloud network access to third-party partners.',
      'Migrate some of their legacy infrastructure to the cloud.',
      'Conduct maintenance on their legacy hardware.',
      'Increase CapEx on existing projects.',
    ],
    answer: 1,
    explanation: 'Adopting cloud is not only building new things: the legacy estate has to move as well, at least in part, or the organisation ends up running two worlds indefinitely. Giving partners privileged access is a risk, and maintaining legacy hardware or raising capital expenditure moves away from cloud.'
  },
  {
    id: 'et-169',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has created an application that can diagnose different medical conditions when users submit images of their affected body parts. Which Google Cloud product or service did the organization use?',
    options: [
      'Cloud Logging',
      'Cloud Profiler',
      'App Engine',
      'Machine learning',
    ],
    answer: 3,
    explanation: 'Classifying submitted images to suggest a diagnosis is a machine learning model doing image recognition. Cloud Logging and Cloud Profiler are operations tools, and App Engine only hosts the application around the model.'
  },
  {
    id: 'et-170',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to be alerted to the errors its code throws in production, with identical crashes grouped together and their stack traces, to find hard-to-reproduce programming errors. Which Google Cloud tool should the organization use?',
    options: [
      'Error Reporting',
      'Cloud Profiler',
      'Cloud Monitoring',
      'Cloud Trace'
    ],
    answer: 0,
    explanation: 'Error Reporting groups exceptions from running services, shows stack traces and counts, and notifies you of new errors. Profiler looks at resource consumption, Trace at latency between services, and Cloud Monitoring at metrics. Current names: Cloud Debugger was shut down in 2023.'
  },
  {
    id: 'et-171',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A retail organization has moved all of their inventory data to a relational database in the cloud. What functionality does a relational database offer?',
    options: [
      'It stores large amounts of raw data in its original format',
      'It stores transactional data, which can then be accessed electronically',
      'It rapidly analyzes large and multi-dimensional datasets',
      'It analyzes unstructured data, which can then be accessed in multiple regions',
    ],
    answer: 1,
    explanation: 'A relational database holds transactional records in tables that applications read and write electronically. Raw data in its original format is a data lake, and rapid multi-dimensional analysis is a warehouse.'
  },
  {
    id: 'et-172',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How does Google Cloud AI Hub make machine learning easy and accessible for Google Cloud customers to get started?',
    options: [
      'It deploys artificial intelligence models in real time',
      'It automatically codes users’ machine learning models',
      'It automatically sources and prepares users’ machine learning data',
      'It includes a repository of plug-and-play artificial intelligence tools',
    ],
    answer: 3,
    explanation: 'AI Hub is a repository of ready-made, plug-and-play components — pipelines, notebooks and models — so teams start from something that works instead of a blank page. It neither writes your model code nor sources and prepares your data.'
  },
  {
    id: 'et-173',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'A venue with an online booking system has partnered with a catering business. How can the venue leverage application programming interfaces (APIs) to create new business value?',
    options: [
      'Use an API to redesign their booking system to appeal to targeted customers',
      'Use an API to identify opportunities for new business collaboration',
      'Use an API to migrate all their customer data to a machine learning model to predict food requests',
      'Use an API to connect their booking system with the partner\'s catering form',
    ],
    answer: 3,
    explanation: 'The new value comes from the two systems talking: an API connects the booking system to the partner\'s catering form so a booking carries the catering order with it. An API does not redesign the system, spot opportunities by itself, or serve as a way to move data into a model.'
  },
  {
    id: 'et-174',
    topic: 'Operations & support',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'A public cloud provider\'s service level performance has moved below the service level objective (SLO), but remains above the service level agreement (SLA). What is an outcome of this change in service level performance?',
    options: [
      'The public cloud provider is encouraged to push out new updates',
      'The public cloud provider is encouraged to prioritize service reliability',
      'End users face unexpected or prolonged downtime',
      'End users face a decrease in service latency',
    ],
    answer: 1,
    explanation: 'Performance below the SLO but above the SLA means no contract has been broken yet — it is the early warning that says stop shipping and spend effort on reliability. Users are not yet in prolonged downtime, and it is certainly not a reason to push more updates.'
  },
  {
    id: 'et-175',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is looking for a solution to help them build applications using their preferred programming language and tools. They also want to minimize time spent on infrastructure management. What solution should the organization use?',
    options: [
      'Cloud Run',
      'Dataproc',
      'Pub/Sub',
      'Bare Metal Solution',
    ],
    answer: 0,
    explanation: 'Cloud Run takes a container built with whatever language and tools the team prefers and runs it without any infrastructure to manage. Dataproc runs Spark clusters, Pub/Sub carries messages, and Bare Metal Solution is hardware.'
  },
  {
    id: 'et-176',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has created a medical fitness app and wants to store a very large amount of data about exercise times, activity, and calories burned for later analysis. Which data management solution should the organization use?',
    options: [
      'Data lake',
      'Data warehouse',
      'Data field',
      'Database',
    ],
    answer: 0,
    explanation: 'A very large volume of raw activity records kept in its native form for analysis later is what a data lake is for. A warehouse wants the data modelled up front, a database is for transactions, and a data field is not a storage solution.'
  },
  {
    id: 'et-177',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is looking for a business intelligence solution that allows individual employees and end users to analyze business data and generate insights. Which Google Cloud product or service should the organization use?',
    options: [
      'Spanner',
      'BigQuery',
      'Looker',
      'Dataflow',
    ],
    answer: 2,
    explanation: 'Looker is the business intelligence platform where individual employees and end users explore governed data and build their own insights. BigQuery is the warehouse underneath it, Spanner is transactional, and Dataflow processes pipelines.'
  },
  {
    id: 'et-178',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is out-of-the-box observability within the context of cloud operations?',
    options: [
      'Monitoring project development timelines',
      'Monitoring IT infrastructure and applications',
      'Monitoring customer satisfaction and feedback',
      'Monitoring cloud subscription costs',
    ],
    answer: 1,
    explanation: 'Out-of-the-box observability means the platform watches your infrastructure and applications — metrics, logs and traces — with no instrumentation to build. Project timelines, customer satisfaction and subscription costs are tracked elsewhere.'
  },
  {
    id: 'et-179',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants a serverless execution environment for building and connecting cloud services. They can\'t predict how many resources they\'ll need. Which Google Cloud solution should they use?',
    options: [
      'Compute Engine',
      'Google Kubernetes Engine',
      'Cloud Run functions',
      'Bare Metal Solution for SAP',
    ],
    answer: 2,
    explanation: 'A serverless environment that glues cloud services together and scales without a capacity estimate is Cloud Run functions, which runs from zero to many instances on demand. Compute Engine and GKE need capacity planning, and Bare Metal Solution for SAP is dedicated hardware. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-180',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is struggling to ensure that their legacy systems meet rapidly changing IT needs. Why should the organization use application programming interfaces (APIs)?',
    options: [
      'To expose all underlying data so third parties can make amends',
      'To completely re-architect legacy applications',
      'To achieve long-term operational flexibility',
      'To operate on a pay-as-you go model so IT can scale flexibly',
    ],
    answer: 2,
    explanation: 'An API puts a stable interface in front of the legacy system, so new needs are met by new consumers of that interface rather than by changing the system underneath — flexibility that lasts. Exposing all underlying data is a security failure, and re-architecting is exactly what the API defers.'
  },
  {
    id: 'et-181',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is looking for a solution that will allow them to build new applications, modernize old ones, and run applications across different cloud providers. What solution should the organization use?',
    options: [
      'Apigee Hybrid',
      'GKE with fleet management',
      'Cloud Run',
      'Compute Engine'
    ],
    answer: 1,
    explanation: 'GKE with fleet management is the one platform that covers all three: build new applications, modernise existing ones, and run them on Google Cloud, on-premises (Google Distributed Cloud) or on another provider. Apigee Hybrid manages APIs, and Cloud Run and Compute Engine run in one place. Current names: GKE with fleet management became GKE Enterprise in 2023, and since September 2025 its features are part of GKE itself (fleet management), with Google Distributed Cloud for on-premises.'
  },
  {
    id: 'et-182',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization cannot afford to modernize their infrastructure, but they want to process data from their legacy system in a modern platform hosted by a business partner. What solution should the organization choose to make their data accessible?',
    options: [
      'Compute Engine',
      'GKE with fleet management',
      'An application programming interface',
      'Google Kubernetes Engine'
    ],
    answer: 2,
    explanation: 'Modernising is off the table, so the answer has to leave the legacy system where it is: an API exposes its data to the partner\'s platform without rewriting anything. GKE fleets, GKE and Compute Engine all require the migration the organisation cannot afford.'
  },
  {
    id: 'et-183',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An international bank is looking for a serverless warehouse solution that lets them perform smart analytics. Which Google Cloud product or service should the bank use?',
    options: [
      'Spanner',
      'Compute Engine',
      'BigQuery',
      'Dataflow',
    ],
    answer: 2,
    explanation: 'BigQuery is the serverless data warehouse, with built-in machine learning and BI for smart analytics and no clusters to size. Spanner is transactional, Dataflow processes pipelines, and Compute Engine is virtual machines.'
  },
  {
    id: 'et-184',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How does switching from on-premises to the cloud help organizations gain value over time?',
    options: [
      'They can expand their internal application hosting infrastructure',
      'They can focus their efforts on solution development',
      'They can increase development of data recovery systems',
      'They can relax their on-premises data security protocols',
    ],
    answer: 1,
    explanation: 'The value compounds because the undifferentiated infrastructure work moves to the provider and the organisation\'s people spend their time on the solutions only they can build. Expanding internal hosting is the opposite move, and relaxing security is never the benefit.'
  },
  {
    id: 'et-185',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is struggling to meet user demand for change and wants to modernize their legacy applications by moving the applications to the cloud. Why would this help the organization satisfy user expectations?',
    options: [
      'Customer data can be used to offer tailored content',
      'Toil automation helps make automatic updates',
      'Updates can be pushed out more quickly to repair bugs',
      'DevOps requires that industry trends be measured and tracked',
    ],
    answer: 2,
    explanation: 'Modernised applications ship on a short cycle, so a fix or a feature reaches users in days instead of at the next quarterly release — which is what "demand for change" means here. Tailored content, toil automation and industry metrics describe other benefits.'
  },
  {
    id: 'et-186',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is looking for a storage solution that will help them serve content to users worldwide. They need a solution that offers a high level of availability. What feature of Cloud Storage would they benefit from?',
    options: [
      'Multi-regional storage',
      'Global metadata',
      'Data encryption',
      'Object versioning',
    ],
    answer: 0,
    explanation: 'A multi-regional bucket stores the data redundantly in several regions and serves it from the closest one, which is both the availability and the worldwide-audience requirement. Versioning protects against overwrites, encryption is on regardless, and metadata is not an availability feature.'
  },
  {
    id: 'et-187',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What kind of architecture does a hybrid cloud offer organizations?',
    options: [
      'A combination of different virtualized servers',
      'A combination of serverless computing and public cloud services',
      'A combination of private cloud infrastructure and public cloud services',
      'A combination of multiple public cloud provider services',
    ],
    answer: 2,
    explanation: 'Hybrid cloud is private infrastructure — usually the organisation\'s own data centre — combined with public cloud services. A combination of several public providers is multi-cloud, and virtualisation alone is neither.'
  },
  {
    id: 'et-188',
    topic: 'Storage & databases',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An international law firm needs their HR application to be able to share and access varying amounts of sensitive data across their branch offices. Why would using Cloud Storage be beneficial for them?',
    options: [
      'It stores geographically dispersed copies of data to prevent loss.',
      'It offers an affordable upgrade that enables data encryption.',
      'It randomly allocates data to different storage locations to protect against threats.',
      'It has a low minimum storage amount requirement.',
    ],
    answer: 0,
    explanation: 'Cloud Storage keeps geographically separated copies, so a failure in one location does not take the HR data with it — the property that matters when branches everywhere depend on the same files. Encryption is included rather than an upgrade, placement is deliberate rather than random, and there is no minimum volume.'
  },
  {
    id: 'et-189',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A large retail organization uses traditional technology for their ecommerce website. During peaks in traffic, resources are often underutilized or overprovisioned. They have decided to migrate to cloud technology. What aspect of cloud technology will benefit their ecommerce business?',
    options: [
      'Agile infrastructure means that they only pay for what they need, when they need it.',
      'Operational expenditure means that their total cost of ownership is more predictable.',
      'Unlimited storage means that their website will never experience downtime.',
      'Shared responsibility means that the cloud provider brings increased visibility during peaks in traffic.',
    ],
    answer: 0,
    explanation: 'Underutilised at quiet times and overprovisioned at peak is precisely the problem elasticity solves: capacity follows traffic and you pay for what you use when you use it. Predictable total cost, unlimited storage and shared responsibility are real ideas but none of them addresses the traffic peaks.'
  },
  {
    id: 'et-190',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is looking for a hybrid-cloud management solution that will help them build and run applications on-premises and in the cloud. What solution should the organization use?',
    options: [
      'GKE with fleet management',
      'Cloud Run functions',
      'App Engine',
      'Compute Engine'
    ],
    answer: 0,
    explanation: 'GKE with fleet management, running on-premises through Google Distributed Cloud, is the hybrid and multicloud platform for building and running applications both on-premises and in the cloud, with one control plane over the lot. Cloud Run functions, App Engine and Compute Engine run only in the cloud. Current names: GKE with fleet management became GKE Enterprise in 2023, and since September 2025 its features are part of GKE itself (fleet management), with Google Distributed Cloud for on-premises.'
  },
  {
    id: 'et-191',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization with a commissions-based business model is struggling to predict cloud costs due to fluctuating revenue. How can the organization optimize the use of their cloud resources?',
    options: [
      'By applying intelligent recommendations',
      'By decentralizing financial decision making',
      'By sharing project ownership across all teams',
      'By increasing their capital expenditure',
    ],
    answer: 0,
    explanation: 'Active Assist\'s intelligent recommendations spot idle resources and wrong-sized machines and say what to change, so spend follows real usage even when revenue does not. Decentralising decisions without data does not optimise anything, shared ownership blurs accountability, and more capital expenditure is the wrong direction.'
  },
  {
    id: 'et-192',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What DevOps practice should an organization use when developing their application to help minimize disruption caused by bugs?',
    options: [
      'Pause production until all bugs have been eliminated',
      'Prioritize fixing large bugs during production because they are easier to review',
      'Implement small changes incrementally to reduce recovery time when bugs appear',
      'Implement large changes together to make rolling back easier when bugs appear',
    ],
    answer: 2,
    explanation: 'Small, frequent changes keep the blast radius small and make the fix — or the rollback — quick when something breaks. Pausing production until every bug is gone never ships, and batching large changes together makes the cause of a failure harder to find.'
  },
  {
    id: 'et-193',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has been struggling to make operations more efficient. What site reliability engineering (SRE) best practice should the organization follow to increase efficiency?',
    options: [
      'Decrease over-reliance on data to make decisions.',
      'Assign exclusive production ownership to developers.',
      'Spend less time measuring outage impact.',
      'Focus on increasing toil automation.',
    ],
    answer: 3,
    explanation: 'SRE\'s efficiency lever is automating toil: the repetitive, manual operational work that scales with traffic and teaches nobody anything. Data should drive more decisions, production ownership is shared rather than handed to developers, and measuring outage impact is how you learn.'
  },
  {
    id: 'et-194',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to ingest custom log data from GKE environments, virtual machines, and Google Cloud services. Which Google Cloud tool should the organization use?',
    options: [
      'Dialogflow',
      'Cloud Logging',
      'Google Cloud CLI',
      'Knowledge Catalog',
    ],
    answer: 1,
    explanation: 'Cloud Logging ingests platform and custom logs from GKE, Compute Engine virtual machines and Google Cloud services, then stores and searches them. Dialogflow builds conversational agents, the Google Cloud CLI is command-line tooling, and Knowledge Catalog indexes metadata. Current names: Cloud SDK → Google Cloud CLI; Data Catalog → Knowledge Catalog (formerly Dataplex Universal Catalog).'
  },
  {
    id: 'et-195',
    topic: 'Compute',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'What makes Google Kubernetes Engine (GKE) an effective solution for developers working to resolve application errors?',
    options: [
      'It reduces the time needed to iterate on various solutions.',
      'It provides intelligent recommendations to optimize application development.',
      'It removes the need for containerizing applications.',
      'It stores application code on multiple servers to facilitate collaboration across silos.',
    ],
    answer: 0,
    explanation: 'Containers on GKE deploy, roll back and redeploy in seconds, so a developer chasing an error can try several fixes in the time one traditional release would take. It does not remove the need to containerise, offers no recommendation engine, and is not a place to store code.'
  },
  {
    id: 'et-196',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is an organization responsible for when migrating from on-premises to the cloud?',
    options: [
      'Covering the cost of cloud service downtime',
      'Managing underlying network infrastructure',
      'Adapting to a pay-as-you-go cloud expenditure model',
      'Optimizing cloud storage systems',
    ],
    answer: 2,
    explanation: 'What moves to the customer is the consumption model itself: spend becomes variable and someone has to plan and govern it. The underlying network stays the provider\'s responsibility, downtime is covered by the SLA, and storage optimisation is a task rather than the responsibility being asked about.'
  },
  {
    id: 'et-197',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to duplicate critical system components to enhance reliability and mitigate single points of failure. Which design consideration should the organization use?',
    options: [
      'Redundancy',
      'Backups',
      'Latency',
      'Security',
    ],
    answer: 0,
    explanation: 'Duplicating critical components so that no single one can take the system down is redundancy. Backups protect the data rather than the availability, and latency and security are different design concerns.'
  },
  {
    id: 'et-198',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization stores backup files in Cloud Storage. The files will be accessed annually to test the disaster recovery plans. Which storage class is the most cost-effective?',
    options: [
      'Coldline class',
      'Standard class',
      'Nearline class',
      'Archive class',
    ],
    answer: 3,
    explanation: 'Read once a year, so the cheapest class with the longest minimum storage duration wins: Archive, priced for data touched less than once a year. Coldline is for quarterly access, Nearline for monthly, and Standard for frequent.'
  },
  {
    id: 'et-199',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is running SQL Server on-premises and is struggling with capacity and management overhead. They want to modernize this database quickly by using Google products or services. What should the organization do?',
    options: [
      'Refactor applications to use a cloud first database like Firestore.',
      'Perform a managed database migration to Cloud SQL.',
      'Export old tables from SQL Server to Cloud Storage.',
      'Migrate all SQL Server data to BigQuery.',
    ],
    answer: 1,
    explanation: 'Database Migration Service performs a managed, largely automatic migration of SQL Server into Cloud SQL, which ends the capacity and patching work without rewriting the application. Refactoring to Firestore is a long project, exporting tables to Cloud Storage gives up the database, and BigQuery is for analytics rather than the transactional workload.'
  },
  {
    id: 'et-200',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is a benefit of the OpEx model for cloud security?',
    options: [
      'Organizations do not need to make upfront capital investments in cloud security.',
      'Organizations can deploy custom security hardware.',
      'Organizations do not need to configure any security settings for cloud resources.',
      'The cloud provider guarantees security.',
    ],
    answer: 0,
    explanation: 'Under OpEx the security capability comes with the service and is paid for as it is used, so there is no up-front capital outlay for appliances. Customers still configure their own controls, custom security hardware is not something you deploy in the provider\'s data centre, and no provider guarantees security on its own.'
  },
  {
    id: 'et-201',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is the benefit of using a serverless data processing pipeline service?',
    options: [
      'Full control over compute resources is provided.',
      'Processed data will not require analysis.',
      'Pipeline infrastructure is fully managed and scalable.',
      'Processed data is guaranteed to be free of errors.',
    ],
    answer: 2,
    explanation: 'The point of a serverless pipeline service such as Dataflow is that the infrastructure is someone else\'s problem: it is managed and it scales with the job. Full control over the compute is what you give up in exchange, and no pipeline makes analysis unnecessary or guarantees error-free data.'
  },
  {
    id: 'et-202',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What does the shift toward cloud computing represent for an organization\'s transformation?',
    options: [
      'An opportunity that is limited to large enterprises',
      'An opportunity to redefine existing business processes and services',
      'An opportunity that is only relevant to the IT department',
      'An opportunity to continue business as usual with new cost savings',
    ],
    answer: 1,
    explanation: 'The shift is a chance to rethink how the business works, not merely to run the same processes on rented hardware. It is open to organisations of any size, reaches well beyond the IT department, and treating it as business as usual with a discount is the tactical trap.'
  },
  {
    id: 'et-203',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is concerned about the unlikely event that Google Cloud infrastructure is physically accessed by someone with malicious intent. How is data protected in Google Cloud?',
    options: [
      'Data is immediately deleted whenever an intrusion is detected.',
      'Data is stored on quantum computers with unbreakable encryption.',
      'Data is stored using robust encryption.',
      'Data is stored in random locations around the world to prevent it being found.',
    ],
    answer: 2,
    explanation: 'Physical access buys an intruder very little because the data is stored encrypted, and the keys are not on the disk. Deleting data on intrusion would be its own disaster, quantum computers are not what stores it, and obscurity through random placement is not a security control.'
  },
  {
    id: 'et-204',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs a flexible and scalable NoSQL database with strong web and mobile application support. Which Google Cloud product or service should the organization use?',
    options: [
      'Spanner',
      'Cloud Storage',
      'BigQuery',
      'Firestore',
    ],
    answer: 3,
    explanation: 'Firestore is the NoSQL document database built for web and mobile, with offline sync and client SDKs. Spanner is relational, Cloud Storage holds objects, and BigQuery is an analytics warehouse.'
  },
  {
    id: 'et-205',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is using three cloud vendors to maximize their available deployment locations worldwide. They are using GKE Enterprise to deploy Kubernetes applications across different clouds. What type is this deployment?',
    options: [
      'On-premises',
      'Multi-cloud',
      'Hybrid-cloud',
      'Private cloud',
    ],
    answer: 1,
    explanation: 'Running across three providers at once is multi-cloud by definition. Hybrid means private infrastructure plus public cloud, and on-premises and private cloud describe the estate they have moved beyond. GKE fleet management (formerly Anthos, then GKE Enterprise) is what makes the Kubernetes deployments consistent across all three.'
  },
  {
    id: 'et-206',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to transfer some of its data from Google Cloud. Which of these statements is true?',
    options: [
      'Customer data may not be transferred out of Google Cloud.',
      'Customers have full control of their data and may transfer it at any time.',
      'Outgoing data transfer must be enabled in the Google Cloud console.',
      'A technical support ticket must be raised with the correct department.',
    ],
    answer: 1,
    explanation: 'One of Google\'s stated trust principles is that the customer owns their data: they can export or move it whenever they like, with no permission to request. There is no console switch to enable and no support ticket to raise.'
  },
  {
    id: 'et-207',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A vacation home rental organization wants to predict the popularity of properties in their upcoming busy season. They do not have a data science team, and want to use their in-house database administration skills to create a machine learning model. What should the organization do?',
    options: [
      'Use custom training in Gemini Enterprise Agent Platform with TensorFlow.',
      'Integrate pre-trained APIs into their application.',
      'Use BigQuery ML and create models using SQL.',
      'Build a model in AutoML using labeled data.',
    ],
    answer: 2,
    explanation: 'The skills in the building are SQL, not data science, so BigQuery ML — models created and trained with SQL statements inside the warehouse — is the fit. Custom training in Gemini Enterprise Agent Platform needs ML engineers, AutoML needs a labelled training set prepared for it, and pre-trained APIs cannot predict something specific to this business. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-208',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs to rapidly scale its use of computing resources and honor its commitment to environmental sustainability. What should the organization do?',
    options: [
      'Refactor application software to use less energy.',
      'Use a public cloud provider with energy-efficient data centers.',
      'Use a carbon-neutral energy provider for an existing on-premises data center.',
      'Purchase energy-efficient servers for an existing on-premises data center.',
    ],
    answer: 1,
    explanation: 'A large provider runs data centres far more efficiently than any single organisation can, and Google matches its consumption with renewable energy, so moving the workload is the sustainable way to scale fast. Refactoring for efficiency, greener power or newer servers all still leave the organisation scaling its own building.'
  },
  {
    id: 'et-209',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is a defining feature of a non-relational database?',
    options: [
      'Reporting across multiple data sources',
      'A strictly enforced schema',
      'A flexible data model',
      'Queries that join multiple tables',
    ],
    answer: 2,
    explanation: 'Non-relational databases are defined by a flexible data model: documents or rows need not share a schema. A strictly enforced schema and joins across tables are relational properties, and cross-source reporting is a BI concern.'
  },
  {
    id: 'et-210',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is an example of unstructured data?',
    options: [
      'Historical stock inventory',
      'Product ratings',
      'Customer orders',
      'Call center transcripts',
    ],
    answer: 3,
    explanation: 'Call-centre transcripts are free-form language with no schema, which makes them unstructured. Inventory, ratings and orders are all rows and columns.'
  },
  {
    id: 'et-211',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has migrated all workloads to the cloud and is reviewing their cloud security posture. Who is now responsible for securing the physical infrastructure of the data centers?',
    options: [
      'The organization and the cloud service provider',
      'Third-party security service providers',
      'The cloud service provider',
      'The organization',
    ],
    answer: 2,
    explanation: 'The physical data centre never moves to the customer: securing the building, the hardware and the network beneath it stays entirely with the provider. What the customer keeps is everything above — data, identities, configuration and access.'
  },
  {
    id: 'et-212',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to lease the resources they need for their customized servers from a cloud provider on a pay-as-you-go basis, instead of paying one time for hardware. Which service model should they use?',
    options: [
      'Hybrid cloud',
      'Software as a service',
      'Infrastructure as a service',
      'Platform as a service',
    ],
    answer: 2,
    explanation: 'Renting the machines themselves and running your own customised servers on them is infrastructure as a service. Platform and software as a service hand over more of the stack, and hybrid cloud describes where things run rather than what is being rented.'
  },
  {
    id: 'et-213',
    topic: 'Cloud fundamentals',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'An organization has petabytes of data gathered from a wide range of sources. They want to use the data for strategic analysis and to guide business decisions. What type of service should they use?',
    options: [
      'Multi cloud environment',
      'Virtual machine environment',
      'Hybrid cloud environment',
      'Container environment',
    ],
    answer: 0,
    explanation: 'The options here are environments rather than products, and the community reads "a wide range of sources" as data that already lives with more than one provider, which makes multi-cloud the answer. It is a weak question — the analysis itself would be done in a warehouse such as BigQuery — so learn the vote rather than the reasoning.'
  },
  {
    id: 'et-214',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants a purpose-built AI solution to increase efficiency and provide personalized interactions for their customer care team. Which Google Cloud AI solution should they use?',
    options: [
      'Text-to-Speech API',
      'Cloud Talent Solution',
      'Document AI',
      'Contact Center AI',
    ],
    answer: 3,
    explanation: 'Contact Center AI is the purpose-built solution for customer care: virtual agents, agent assist and insights in one place. Text-to-Speech is one piece of it, Document AI reads documents, and Cloud Talent Solution serves recruiting.'
  },
  {
    id: 'et-215',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to use an open source library with a flexible ecosystem of tools to create and train its own machine learning models. Which product or solution should the organization use?',
    options: [
      'Cloud Run functions',
      'Apache Beam',
      'Dataflow',
      'TensorFlow',
    ],
    answer: 3,
    explanation: 'TensorFlow is the open-source library with the broad tool ecosystem for building and training your own models. Apache Beam and Dataflow define and run data pipelines, and Cloud Run functions runs event-driven code. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-216',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to leverage cloud technologies but is concerned about vendor lock-in. What would mitigate this concern?',
    options: [
      'Open standards',
      'Database services',
      'Service level agreements',
      'Scalable infrastructure',
    ],
    answer: 0,
    explanation: 'Lock-in is avoided by building on open standards and open-source technology — Kubernetes, TensorFlow, open APIs — so the workload can move. An SLA governs service quality rather than portability, and database services and scalable infrastructure exist on every provider without making anything portable.'
  },
  {
    id: 'et-217',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization must identify and fix security vulnerabilities in its cloud infrastructure and applications. Which Google Cloud service should they use?',
    options: [
      'Security Command Center',
      'Google Cloud Armor',
      'Cloud Storage',
      'VPC networks',
    ],
    answer: 0,
    explanation: 'Security Command Center is the vulnerability and threat-finding service across the whole estate, with recommendations for what to fix. Cloud Armor blocks traffic, VPC networks carry it, and Cloud Storage holds objects.'
  },
  {
    id: 'et-218',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A cinema company wants to build a model to predict customer visit patterns for the coming year. They have three years of customer visit data across 300 theaters; however, the data has been stored in different formats by different theaters. They must train the ML model. What should they do?',
    options: [
      'Use the last year of data so there are fewer inconsistencies for the model to handle.',
      'Transform the data into a consistent format.',
      'Group different format types and train a different model for each group.',
      'Choose an ML model type that can process different formats of input data.',
    ],
    answer: 1,
    explanation: 'A model needs one consistent schema, so the 300 theatres\' formats have to be reconciled before training — this is the data preparation step, and it is where most of the work in a real project goes. Throwing away two years of history, training 300 models or hoping a model type copes with mixed formats all avoid the real fix.'
  },
  {
    id: 'et-219',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Within Google’s Site Reliability Engineering framework, which concept measures how well a system is performing?',
    options: [
      'Service-level agreement',
      'Service-level indicator',
      'Error reporting',
      'Service-level objective',
    ],
    answer: 1,
    explanation: 'The service-level indicator is the measurement itself — the actual number, such as the percentage of successful requests. The objective is the target you set for that indicator, and the agreement is the contract written around it.'
  },
  {
    id: 'et-220',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is the typical cloud spending behavior of most organizations?',
    options: [
      'Decentralized and variable',
      'Centralized and variable',
      'Decentralized and fixed',
      'Centralized and fixed',
    ],
    answer: 0,
    explanation: 'Cloud spending is typically decentralised, because any team can provision resources, and variable, because the bill follows usage. That combination is exactly why financial governance and visibility matter so much in the cloud.'
  },
  {
    id: 'et-221',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is developing a new container-based application. They do not know how popular the application will be when launched and they do not want to pay for idle infrastructure resources. Which benefit of serverless computing will address this concern?',
    options: [
      'Disaster recovery',
      'Reduced development costs',
      'Scalability',
      'Built-in security',
    ],
    answer: 2,
    explanation: 'Paying nothing while idle and scaling up if the launch goes well is the scalability benefit of serverless — capacity follows demand, including down to zero. Disaster recovery, development cost and built-in security are real benefits but none of them is what removes the idle-resource bill.'
  },
  {
    id: 'et-222',
    topic: 'Resource hierarchy & governance',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'How does the resource hierarchy in Google Cloud help organizations implement security policies?',
    options: [
      'Policies can be applied at the folder level and are inherited by projects inside the folder.',
      'Projects in the resource hierarchy are not affected by security policies.',
      'Policies can only be applied at the organization level and affect all projects.',
      'Policies can only be applied to individual projects.',
    ],
    answer: 0,
    explanation: 'Policy set on a folder is inherited by every project inside it, which is how one rule covers a department without being applied project by project. Policies are not restricted to the organisation node or to individual projects, and projects certainly are affected by them.'
  },
  {
    id: 'et-223',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is considering the use of managed services when migrating to the cloud. Which routine tasks are typically provided automatically by a managed services platform?',
    options: [
      'Managing user access',
      'Patching and upgrades',
      'Data archiving',
      'Cost optimization',
    ],
    answer: 1,
    explanation: 'A managed service takes over the routine operational work — patching, upgrades, backups of the platform itself — which is the reason to choose one. User access, archiving policy and cost optimisation remain the customer\'s decisions.'
  },
  {
    id: 'et-224',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has recently completed a migration from on-premises to Google Cloud. How has cost management been affected?',
    options: [
      'Costs will primarily shift from CapEx to OpEx.',
      'Costs will primarily shift from OpEx to CapEx.',
      'Cost management will stay the same, but the total cost of ownership (TCO) will be lower.',
      'Cost management will stay the same, but the total cost of ownership (TCO) will be higher.',
    ],
    answer: 0,
    explanation: 'Migration replaces up-front hardware purchases with metered consumption, so spending moves from capital expenditure to operational expenditure. Cost management does not stay the same: it becomes a continuous, usage-driven discipline rather than an annual purchase.'
  },
  {
    id: 'et-225',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to access a software application from a cloud vendor without the need to manage their own servers or write their own code. Which service model does this represent?',
    options: [
      'Infrastructure as a service',
      'Platform as a service',
      'Software as a service',
      'Functions as a service',
    ],
    answer: 2,
    explanation: 'Using a finished application with no servers to run and no code to write is software as a service. Infrastructure and platform models both leave code or machines with the customer, and functions as a service still means writing the function.'
  },
  {
    id: 'et-226',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to build a data pipeline to transform its data so it can be reconciled in a data warehouse. The solution must be scalable and require little or no management. Which Google product or service should the organization choose?',
    options: [
      'Bigtable',
      'Cloud Storage',
      'Pub/Sub',
      'Dataflow',
    ],
    answer: 3,
    explanation: 'Dataflow is the managed, autoscaling service for transforming data on its way into a warehouse, with no clusters to run. Pub/Sub carries the messages, Cloud Storage holds files, and Bigtable is a database rather than a pipeline.'
  },
  {
    id: 'et-227',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'When is data automatically encrypted in Google Cloud?',
    options: [
      'When it is in transit only,',
      'When it is at rest and in transit.',
      'Data is not automatically encrypted by default.',
      'When it is at rest only.',
    ],
    answer: 1,
    explanation: 'Google Cloud encrypts customer data both at rest and in transit by default, with no configuration required. Neither one alone is the answer, and it is certainly not off by default.'
  },
  {
    id: 'et-228',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization must verify the identity of a user seeking access to a system. Which aspect of cloud identity management does this action describe?',
    options: [
      'Authorization',
      'Authentication',
      'Auditing',
      'Encrypting',
    ],
    answer: 1,
    explanation: 'Verifying who someone is, is authentication. Authorisation is what they may then do, auditing records what they did, and encryption protects the data rather than identifying the user.'
  },
  {
    id: 'et-229',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is running Kubernetes applications across multiple cloud environments. They want a consistent and centralized management platform. Which service should they choose?',
    options: [
      'Cloud Run functions',
      'GKE Enterprise',
      'Cloud Run',
      'Compute Engine',
    ],
    answer: 1,
    explanation: 'GKE fleet management (formerly Anthos, then GKE Enterprise) is the consistent, centralised management plane for Kubernetes across several clouds. Cloud Run and Cloud Run functions run workloads in one place, and Compute Engine is virtual machines. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-230',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to collect and store all logs generated by applications running in Google Cloud. Which service should they use?',
    options: [
      'Cloud Profiler',
      'Cloud Monitoring',
      'Cloud Trace',
      'Cloud Logging',
    ],
    answer: 3,
    explanation: 'Cloud Logging is where application and platform logs are collected, stored and searched. Cloud Monitoring handles metrics, Cloud Trace latency, and Cloud Profiler resource consumption.'
  },
  {
    id: 'et-231',
    topic: 'Data analytics',
    difficulty: 'hard',
    verbatim: true,
    prompt: 'What is the benefit of using a unified cloud data solution?',
    options: [
      'Data will always cost less to store.',
      'Data can be automatically secured from external threats.',
      'Data will always be backed up and cannot be lost or deleted.',
      'Data can enable innovation because it\'s no longer siloed.',
    ],
    answer: 3,
    explanation: 'Bringing data together removes the silos, which is what lets teams combine datasets and find something new — the benefit a unified solution actually delivers. The dump marks a second option as most voted as well, but "backed up and cannot be lost or deleted" is not true of any storage product, so the key here is the innovation answer alone.'
  },
  {
    id: 'et-232',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization stores its important industry data in a relational database. They want to create a new revenue stream by enabling third parties to use that data in their applications. Which cloud first approach should the organization choose?',
    options: [
      'Add third-party users to their database.',
      'Offer chargeable downloads of archived data.',
      'Expose data through a chargeable API.',
      'Transfer data into a non-relational database.',
    ],
    answer: 2,
    explanation: 'Exposing the data through a paid API lets third parties build on it without ever touching the database, which is the cloud-first way to turn data into a revenue stream. Adding outsiders to the database is a security failure, archived downloads are neither live nor programmable, and moving to NoSQL changes nothing about who can use it.'
  },
  {
    id: 'et-233',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'Which scenario is a good use case for machine learning?',
    options: [
      'Classifying data with no prior examples',
      'Tasks that require human experience and intuition',
      'Creating customer recommendations',
      'Solving ethical dilemmas',
    ],
    answer: 2,
    explanation: 'Recommendations are learned from patterns in past behaviour, which is exactly what machine learning does well. Classification with no prior examples has nothing to learn from, and judgement calls and ethical dilemmas need human experience.'
  },
  {
    id: 'et-234',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs to increase the speed at which they can train machine learning models. Which domain-specific hardware is designed for this task?',
    options: [
      'Bare Metal Solution',
      'Spot VMs',
      'Cloud TPUs',
      'Containers'
    ],
    answer: 2,
    explanation: 'Tensor Processing Units are Google\'s domain-specific hardware, built to accelerate the matrix arithmetic behind model training. Spot VMs change the price rather than the speed, Bare Metal Solution is for specialised licensed workloads, and containers are a packaging format. Current names: preemptible VMs are the legacy model; Spot VMs replace them, with no 24-hour limit.'
  },
  {
    id: 'et-235',
    topic: 'Resource hierarchy & governance',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has migrated several large databases to the cloud. It wants to increase the value of its data, improve cost controls and strengthen regulatory compliance. What should the organization do?',
    options: [
      'Delete data stored for over a year.',
      'Export relational data to modern NoSQL databases.',
      'Create monthly reports on data access and uses.',
      'Establish an effective data governance program.',
    ],
    answer: 3,
    explanation: 'Value, cost control and compliance across many databases are all governance questions, and the answer is a governance programme: who owns what data, how it is classified, who may use it and for how long. Deleting by age, exporting to NoSQL or writing monthly reports are single tactics that leave the framework missing.'
  },
  {
    id: 'et-236',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has hired a team of data scientists and developers. They want to create unique value in their business by coding an advanced machine learning model in Agent Platform Workbench. Which service should the organization use to train the model?',
    options: [
      'Custom training',
      'AutoML',
      'Compute Engine',
      'Prebuilt APIs',
    ],
    answer: 0,
    explanation: 'A team of data scientists coding a model in Agent Platform Workbench is the custom training path — their own code, their own architecture, trained on Gemini Enterprise Agent Platform. AutoML and prebuilt APIs exist precisely to avoid writing that code, and Compute Engine is just the machines. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-237',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is concerned that one of their applications takes too long to return a result. According to Google’s “Four Golden Signals,” which signal measures this aspect of the application’s performance?',
    options: [
      'Saturation',
      'Errors',
      'Latency',
      'Traffic',
    ],
    answer: 2,
    explanation: 'Latency is the golden signal for how long a request takes to return. Traffic is demand, errors are failed requests, and saturation is how full the system is.'
  },
  {
    id: 'et-238',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is transforming their raw data into a format that can be used to derive business insights. Which step of the data value chain does this action represent?',
    options: [
      'Data analysis',
      'Data collection',
      'Data storage',
      'Data processing',
    ],
    answer: 3,
    explanation: 'Turning raw data into a usable format is the processing step of the data value chain, which sits between collecting and storing it and the analysis that follows.'
  },
  {
    id: 'et-239',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization has a small development team that has created a web application which runs in a single container. They need a simple, serverless, and scalable way to host their container. Which Google service should the organization use?',
    options: [
      'Compute Engine',
      'App Engine',
      'Kubernetes Engine',
      'Cloud Run',
    ],
    answer: 3,
    explanation: 'A single container, no servers to manage and automatic scaling is Cloud Run. Kubernetes Engine is more machinery than one container needs, App Engine takes code rather than any container in the fully managed path, and Compute Engine means running virtual machines.'
  },
  {
    id: 'et-240',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants a centralized view of their cloud infrastructure in a fully managed system that includes uptime checks. Which Google Cloud service should they use?',
    options: [
      'Cloud Trace',
      'Cloud Monitoring',
      'Cloud Logging',
      'Cloud Profiler',
    ],
    answer: 1,
    explanation: 'Cloud Monitoring gives the single, fully managed view of the estate, including uptime checks, dashboards and alerts. Cloud Logging stores logs, Cloud Trace measures latency, and Cloud Profiler looks at resource consumption.'
  },
  {
    id: 'et-241',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to migrate a workload to the cloud without changing the application code or architecture. Which migration path describes this approach?',
    options: [
      'Rehosted',
      'Reimagined',
      'Replatformed',
      'Refactored',
    ],
    answer: 0,
    explanation: 'Moving the workload as it stands, without touching code or architecture, is a lift and shift — rehosting. Replatforming makes small changes on the way, refactoring rewrites parts of it, and reimagining starts from the business problem again.'
  },
  {
    id: 'et-242',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Which scenario uses machine learning to unlock business value from unstructured data?',
    options: [
      'Analyzing tabular records of product defects to predict future maintenance cycles.',
      'Recommending new products based on previous purchases.',
      'Monitoring financial transactions to identify potential fraud and risk.',
      'Determining customer sentiments from call center voice recordings.',
    ],
    answer: 3,
    explanation: 'Voice recordings have no schema, so deriving sentiment from them is machine learning unlocking value from unstructured data. Tabular defect records and transaction monitoring work on structured data, and purchase-history recommendations are structured too.'
  },
  {
    id: 'et-243',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to build custom machine learning models. They require a managed platform that provides services to gather data, build models, and then deploy and monitor those models. Which service should they use?',
    options: [
      'Document AI',
      'Natural Language API',
      'Kubernetes Engine',
      'Gemini Enterprise Agent Platform',
    ],
    answer: 3,
    explanation: 'Gemini Enterprise Agent Platform is the managed platform that covers the whole custom-model lifecycle: gathering data, building and training, then deploying and monitoring. Document AI and the Natural Language API are pre-trained services, and Kubernetes Engine only runs the containers. Current names: Vertex AI → Gemini Enterprise Agent Platform.'
  },
  {
    id: 'et-244',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'In Google’s cloud security model, how does availability contribute to a robust security posture for data?',
    options: [
      'By restricting data access to authorized users',
      'By ensuring data meets industry standards',
      'By checking that data is accurate and trustworthy',
      'By ensuring data is reliable and accessible',
    ],
    answer: 3,
    explanation: 'In the confidentiality, integrity and availability triad, availability is the part that says data must be reliably reachable when it is needed — an outage is a security failure, not just an operational one. Restricting access is confidentiality, accuracy is integrity, and meeting standards is compliance.'
  },
  {
    id: 'et-245',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'How does the legal concept of data sovereignty affect data?',
    options: [
      'Data is subject to the laws and regulations of the country where it resides.',
      'A country has the right to access the data generated within its borders.',
      'An individual has the right to control their personal data.',
      'Data must always be encrypted in transit and at rest.',
    ],
    answer: 0,
    explanation: 'Data sovereignty means data is governed by the laws of the country it physically sits in, which is why region choice matters so much. A government\'s right of access and an individual\'s right over their personal data are related but distinct ideas, and encryption is a control rather than a legal concept.'
  },
  {
    id: 'et-246',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is concerned about their cloud costs. They want to be informed when their spending exceeds a specific threshold, rather than waiting to see their bill at the end of the month. What should the organization do?',
    options: [
      'Pause virtual machines during non-business hours.',
      'Configure a budget threshold rule and alert.',
      'Adjust project resource quota policies.',
      'Use historical cost data to predict future overspend.',
    ],
    answer: 1,
    explanation: 'A budget with a threshold rule sends the alert as spending crosses the line, instead of the bill being the first news. Pausing machines and adjusting quotas control spend but do not notify anyone, and forecasting from history is not an alert.'
  },
  {
    id: 'et-247',
    topic: 'Operations & support',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is running critical workloads in production and requires a Google Cloud support service with fast response times and a dedicated Technical Account Manager. Which customer care service level should the organization choose?',
    options: [
      'Enhanced',
      'Basic',
      'Premium',
      'Standard',
    ],
    answer: 2,
    explanation: 'Premium Support is the tier that comes with a Technical Account Manager and the fastest response targets, which is what critical production workloads need. Enhanced is quick but has no named account manager, and Standard and Basic are slower still.'
  },
  {
    id: 'et-248',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A real estate organization processes photos of properties uploaded by their agents to an internal application. They must manually check and remove photos that contain personally identifiable information like passports and credit cards. They want a solution that their developer can use to integrate with their app as quickly as possible. Which solution should they use?',
    options: [
      'Pre-trained APIs',
      'AutoML',
      'Custom training',
      'BigQuery ML',
    ],
    answer: 0,
    explanation: 'Detecting passports and credit cards in images is a solved problem with a pre-trained API — Cloud DLP or the Vision API — so a developer can integrate it in days. AutoML and custom training both mean assembling a labelled dataset first, and BigQuery ML works on tabular data rather than photographs.'
  },
  {
    id: 'et-249',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is generative AI?',
    options: [
      'A machine learning model for language translation',
      'A specific field of AI that can be used to create content',
      'An umbrella term that includes all types of machine learning algorithms',
      'An AI model for labeling images',
    ],
    answer: 1,
    explanation: 'Generative AI is the branch of AI that produces new content — text, images, code, audio — rather than only classifying or predicting. Translation and image labelling are specific non-generative tasks, and the umbrella term for everything is AI itself.'
  },
  {
    id: 'et-250',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is a defining function of streaming analytics?',
    options: [
      'Processing data records continuously',
      'Processing data records in batches',
      'Processing a one-off data backfill',
      'Accessing data with high latency',
    ],
    answer: 0,
    explanation: 'Streaming analytics processes records continuously as they arrive, rather than waiting for a batch window. Batch processing and one-off backfills are the alternative, and high latency is what streaming is designed to avoid.'
  },
  {
    id: 'et-251',
    topic: 'Resource hierarchy & governance',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is deciding on the layout of their resource hierarchy in Google Cloud. They have several projects within a folder. What will happen when user access policies are applied to the folder?',
    options: [
      'The policy will be inherited by the projects in the folder but will not affect their resources.',
      'The policy will be inherited by the projects and their resources within the folder.',
      'The policy will be applied to all folders within the organization.',
      'The policy applies to the folder only, and will not be inherited by any projects.',
    ],
    answer: 1,
    explanation: 'Policy set on a folder flows down the whole subtree: the projects inside it and the resources inside those projects. That inheritance is the reason the hierarchy exists — it is not stopped at the project boundary, and it does not leap sideways to other folders.'
  },
  {
    id: 'et-252',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has an ecommerce application that requires a cost-effective, transactional database. The application will only serve customers in a single region. Which service should they use?',
    options: [
      'BigQuery',
      'Bigtable',
      'Spanner',
      'Cloud SQL',
    ],
    answer: 3,
    explanation: 'One region and a tight budget point at Cloud SQL, the managed relational database for ordinary transactional workloads. Spanner\'s global consistency costs far more than a single-region shop needs, Bigtable is not relational, and BigQuery is for analytics.'
  },
  {
    id: 'et-253',
    topic: 'Networking',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to control what types of network traffic are allowed to enter and leave its network and access its applications. Which security measure should the organization use?',
    options: [
      '2-Step Verification',
      'Privileged access',
      'Encryption keys',
      'Firewall rules',
    ],
    answer: 3,
    explanation: 'Deciding which traffic may enter and leave the network is what firewall rules do. Two-step verification and privileged access govern who a user is and what they may do, and encryption protects the data rather than the traffic flow.'
  },
  {
    id: 'et-254',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has a large archive of unstructured data, including video and audio files. Which storage solution should the organization use?',
    options: [
      'Spanner',
      'Cloud Storage',
      'Bigtable',
      'Cloud SQL',
    ],
    answer: 1,
    explanation: 'Video and audio files are unstructured objects, which is exactly what Cloud Storage buckets hold, at archive prices when the data is cold. Spanner and Cloud SQL are relational, and Bigtable is for wide-column records.'
  },
  {
    id: 'et-255',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A retail organization is training a model to recommend products to customers for an ecommerce website. The model was trained on previous purchases, but did not include demographic information on each buyer. What dimension of the data is responsible for the model\'s poor performance?',
    options: [
      'Validity',
      'Accuracy',
      'Timeliness',
      'Completeness',
    ],
    answer: 3,
    explanation: 'The demographic fields the model needed were simply absent, which is a completeness problem. Accuracy is about values being wrong, validity about them breaking the rules of their field, and timeliness about them being stale.'
  },
  {
    id: 'et-256',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has collected petabytes of historical data. They need an advanced analysis solution that is fast, scalable, and fully managed. Which Google product or service should the organization use?',
    options: [
      'BigQuery',
      'Cloud SQL',
      'Firestore',
      'Cloud Storage',
    ],
    answer: 0,
    explanation: 'Petabytes, fast, scalable, fully managed, built for analysis — BigQuery. Cloud SQL and Firestore are operational databases, and Cloud Storage holds the files without analysing them.'
  },
  {
    id: 'et-257',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'What is a benefit of Google’s purpose-built servers compared to standard servers?',
    options: [
      'They are optimized for specific tasks making them more efficient.',
      'They are backward compatible with legacy disk drives.',
      'They are cheaper to build than standard servers.',
      'They run software that cannot be deployed on standard servers.',
    ],
    answer: 0,
    explanation: 'Google designs its own servers for the jobs they actually run, stripping out what a general-purpose machine carries and tuning what matters, which makes them more efficient per watt and per rack. They are not about legacy disk compatibility, and they run ordinary software.'
  },
  {
    id: 'et-258',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is the Site Reliability Engineering (SRE) term for an organization\'s desired level of reliability and performance?',
    options: [
      'Service-level objective',
      'Enhanced support',
      'Scalable infrastructure',
      'Service-level indicator',
    ],
    answer: 0,
    explanation: 'The service-level objective is the target: the level of reliability the organisation intends to deliver. The indicator is what you measure against it, and support tiers and infrastructure are not SRE terms at all.'
  },
  {
    id: 'et-259',
    topic: 'Compute',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is operating multiple workloads in containers and requires full control of how the workloads are configured. Which Google Cloud service should the organization use?',
    options: [
      'Cloud Run',
      'Compute Engine',
      'Kubernetes Engine',
      'Cloud Run functions',
    ],
    answer: 2,
    explanation: 'Multiple containerised workloads plus full control of how they are configured is Kubernetes Engine — the control surface is the point. Cloud Run and Cloud Run functions deliberately hide it, and Compute Engine drops you back to managing machines. Current names: Cloud Functions → Cloud Run functions.'
  },
  {
    id: 'et-260',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'When customer data is uploaded to Google Cloud, who owns the data?',
    options: [
      'A third party',
      'The customer and Google share ownership',
      'Google',
      'The customer',
    ],
    answer: 3,
    explanation: 'Customer data belongs to the customer — that is one of Google\'s published trust principles, and it is why you can export or delete it whenever you like. Google processes the data on your instructions; it does not co-own it, and no third party has a claim on it.'
  },
  {
    id: 'et-261',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is deploying their servers to the cloud using the infrastructure as a service model. In the shared responsibility model, what is the cloud provider responsible for?',
    options: [
      'Data access policies',
      'Security of the operating system',
      'Security of the software',
      'Physical security',
    ],
    answer: 3,
    explanation: 'Infrastructure as a service is the model where the customer takes the most on, but the building itself is never theirs: the provider secures the data centre and the hardware in it. The guest operating system, the software on top and who may reach the data all stay with the customer.'
  },
  {
    id: 'et-262',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization runs a batch data analysis workload on a virtual machine (VM). The workload can be easily restarted without losing work, and is not time critical. Organizations must choose the lowest cost option to run the workload. What option should they choose?',
    options: [
      'A Spot VM on Compute Engine',
      'A custom VM in a pay-as-you-go model on Compute Engine',
      'A standard VM in a pay-as-you-go model on Compute Engine',
      'A Cloud Run function with a small memory limit'
    ],
    answer: 0,
    explanation: 'Restartable, not time critical, cheapest possible — that is the Spot (formerly preemptible) VM case exactly: a deep discount in exchange for interruptions the workload already tolerates. Standard and custom VMs at list price cost more, and Cloud Run functions is the wrong shape for a long batch job. Current names: Cloud Functions → Cloud Run functions; preemptible VMs are the legacy model; Spot VMs replace them, with no 24-hour limit.'
  },
  {
    id: 'et-263',
    topic: 'Networking',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'Customers are reporting very high latencies when accessing an application from the United States. The application is currently running in a single region in Europe. What should the organization do?',
    options: [
      'Set up a new billing account in the United States.',
      'Run the application in additional zones in the European region.',
      'Run the application in additional regions in Europe.',
      'Run a replica of the application in a region in the United States.',
    ],
    answer: 3,
    explanation: 'Latency is distance, so the fix is to put a copy of the application near the users complaining — a replica in a United States region. More zones or more European regions keep the traffic crossing the Atlantic, and billing accounts have nothing to do with it.'
  },
  {
    id: 'et-264',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs protection against distributed denial-of-service (DDoS) attacks. Which Google Cloud service should the organization use?',
    options: [
      'Google Cloud Armor',
      'Cloud Build',
      'Cloud VPN',
      'Security Command Center',
    ],
    answer: 0,
    explanation: 'Google Cloud Armor is the DDoS and web application firewall service, absorbing volumetric attacks at the edge of Google\'s network. Security Command Center reports on posture rather than blocking traffic, Cloud VPN is a private link, and Cloud Build is CI/CD.'
  },
  {
    id: 'et-265',
    topic: 'Storage & databases',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization needs to store daily transactional data such as customer records and purchase history. The data follows a consistent schema and is cross-referenced. Which type of service should the organization use?',
    options: [
      'Non-relational database',
      'Data warehouse',
      'Relational database',
      'Data lake',
    ],
    answer: 2,
    explanation: 'A consistent schema with records that cross-reference each other is the definition of relational data, so a relational database it is. A warehouse serves analysis rather than daily transactions, a data lake keeps raw data unmodelled, and non-relational stores drop the schema that is doing the work here.'
  },
  {
    id: 'et-266',
    topic: 'Networking',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is hosting an application in Europe, and customers in Asia are reporting slow response times despite their fast internet connection. What is the problem?',
    options: [
      'Not enough application servers',
      'Network bandwidth',
      'Network latency',
      'Misconfigured application servers',
    ],
    answer: 2,
    explanation: 'A fast connection does not shorten the distance: the packets still cross from Asia to Europe and back, and that round trip is latency. Bandwidth is how much fits through the pipe rather than how long it takes, and nothing here points at server capacity or configuration.'
  },
  {
    id: 'et-267',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A manufacturing organization has a large collection of images labeled as intact or defective parts. They want to use this data to build a simple solution to detect faulty parts on their production line. They have no data science expertise. Which solution should they use?',
    options: [
      'Pre-trained APIs',
      'Document AI',
      'AutoML',
      'Discovery AI for Retail',
    ],
    answer: 2,
    explanation: 'They have the labelled images but no data science skills, which is precisely the gap AutoML fills — it trains a custom model on your own labels without any model code. Pre-trained APIs cannot learn what this company calls defective, Document AI reads documents, and Discovery AI serves retail.'
  },
  {
    id: 'et-268',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has a large dataset that contains text transcripts of conversations between their customers and service representatives. They want an automated solution to identify the topics their customers care most about. Which service should the organization use?',
    options: [
      'Vision API',
      'Speech-to-Text API',
      'Cloud Translation API',
      'Natural Language API',
    ],
    answer: 3,
    explanation: 'Pulling the themes out of free-text conversation transcripts is the Natural Language API — entity and content classification over text that already exists. Speech-to-Text would be needed only if these were audio, and Vision and Translation solve other problems.'
  },
  {
    id: 'et-269',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to analyze data in a data warehouse. How should they proceed?',
    options: [
      'Import data into a semi-structured time-series database.',
      'Choose a system to store structured and semi-structured data that supports ad-hoc analysis and custom reporting.',
      'Copy unstructured data into a single large object store.',
      'Ensure data is stored in structured tables and rows to support transactional queries and relationships.',
    ],
    answer: 1,
    explanation: 'A warehouse holds structured and semi-structured data in a form that supports ad-hoc queries and custom reports, which is what analysing it means. Transactional tables and relationships describe an operational database, an object store leaves the data unqueryable, and a time-series database is a narrower tool.'
  },
  {
    id: 'et-270',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to ensure that they grant users only the permissions they require to perform their job responsibilities. Which security principle describes this approach?',
    options: [
      'Cyber resilience',
      'Zero-trust',
      'Least privilege',
      'Security by default',
    ],
    answer: 2,
    explanation: 'Granting exactly the permissions a job needs and nothing more is least privilege. Zero trust is the broader posture of never trusting the network, cyber resilience is about withstanding attack, and security by default is about safe starting configuration.'
  },
  {
    id: 'et-271',
    topic: 'Operations & support',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is concerned about the risk of data loss that may occur due to hardware failures or cyber attacks. They want to restore their systems to a previous state if such an event occurs. What should the organization do?',
    options: [
      'Set service level objectives (SLOs).',
      'Use Cloud Monitoring.',
      'Back up data regularly.',
      'Enable autoscaling.',
    ],
    answer: 2,
    explanation: 'Recovering to a previous state after loss or attack needs backups taken regularly — nothing else on the list can restore data that is gone. Monitoring tells you it happened, SLOs set targets, and autoscaling adds capacity.'
  },
  {
    id: 'et-272',
    topic: 'Data analytics',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization processes batch sales data at the end of every month to analyze sales trends and derive business insights. They want to improve accuracy and make near real-time decisions. What should the organization do?',
    options: [
      'Change from a relational database to a NoSQL database.',
      'Filter the data so reports are generated faster.',
      'Switch from batch processing to stream processing.',
      'Process batch reports weekly instead of monthly.',
    ],
    answer: 2,
    explanation: 'Waiting for month end is the constraint, so the fix is to process the events as they arrive: stream processing instead of batch. Changing database type or filtering reports makes the same monthly cycle faster, not nearer to real time, and weekly batches are still batches.'
  },
  {
    id: 'et-273',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An information security organization must ensure that its service providers have ISO 27001 certification. They must also access supporting documentation. Which Google Cloud tool should they use?',
    options: [
      'Compliance Reports Manager',
      'Security Command Center',
      'Network Intelligence Center',
      'Cloud Monitoring',
    ],
    answer: 0,
    explanation: 'Compliance Reports Manager is where Google publishes its own certifications and audit reports — ISO 27001 among them — for customers to download. Security Command Center assesses the customer\'s own posture, and the others are network and metrics tools.'
  },
  {
    id: 'et-274',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to adopt the advanced machine learning capabilities of the Google Cloud. However, regulations require data to be stored in an on-premises data center. Which approach should the organization use?',
    options: [
      'A hybrid-cloud approach',
      'A multi-cloud approach',
      'A public-cloud approach',
      'A private-cloud approach',
    ],
    answer: 0,
    explanation: 'Data must stay in the organisation\'s own data centre while the analysis happens in Google Cloud, and that combination is hybrid cloud. Multi-cloud is several public providers, and pure public or private would break one half of the requirement.'
  },
  {
    id: 'et-275',
    topic: 'Cloud fundamentals',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to run their custom application in the cloud in a flexible and scalable way without managing any infrastructure. Which service model should they use?',
    options: [
      'Infrastructure as a service',
      'Platform as a service',
      'Software as a service',
      'Network as a service',
    ],
    answer: 1,
    explanation: 'Running your own custom application with no infrastructure to manage is platform as a service. Infrastructure as a service leaves the machines with you, software as a service means you are not writing the application at all, and network as a service is not one of the three models.'
  },
  {
    id: 'et-276',
    topic: 'Cost management',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is using Compute Engine and wants to receive sustained-use discounts. What should the organization do?',
    options: [
      'Choose Spot instances when creating virtual machines.',
      'Choose low-powered virtual machines.',
      'Nothing. Sustained use discounts are automatically applied.',
      'Commit to virtual machine usage for a one or three-year period.'
    ],
    answer: 2,
    explanation: 'Sustained use discounts need no action: Compute Engine applies them automatically once an instance runs for a large enough share of the month. Committed use discounts are the ones you sign up for, and Spot instances are a different discount entirely. Current names: preemptible VMs are the legacy model; Spot VMs replace them, with no 24-hour limit.'
  },
  {
    id: 'et-277',
    topic: 'Security & identity',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is evaluating its defenses against cyber security threats and is concerned about the risks of social engineering by cyber criminals. How might these attacks happen?',
    options: [
      'SQL injection attacks',
      'Physical damage to hardware',
      'Phishing emails',
      'Distributed denial-of-service attacks',
    ],
    answer: 2,
    explanation: 'Social engineering attacks the person rather than the system, and phishing email is its most common form. SQL injection and denial-of-service attack the software, and physical damage is not social engineering.'
  },
  {
    id: 'et-278',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has a large VMWare environment that they want to migrate to the cloud. They want to retain existing operational processes and tools. Which Google Cloud service should the organization use?',
    options: [
      'Compute Engine',
      'Google Cloud VMware Engine',
      'VMWare vSphere',
      'Bare Metal Solution',
    ],
    answer: 1,
    explanation: 'Google Cloud VMware Engine runs the VMware stack itself in Google Cloud, so the existing tools, processes and skills carry over untouched. Compute Engine and Bare Metal Solution would mean rebuilding the operational model, and vSphere is the software they already run rather than a migration target.'
  },
  {
    id: 'et-279',
    topic: 'AI & machine learning',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is building advanced machine learning models in Google Cloud by using TensorFlow. They want to develop their models faster with purpose-built hardware. Which solution should the organization use?',
    options: [
      'TPUs',
      'CPUs',
      'GPUs',
    ],
    answer: 0,
    explanation: 'Tensor Processing Units are Google\'s purpose-built accelerators for TensorFlow workloads, which is what makes training faster than general-purpose silicon. GPUs help too but are not purpose-built for this, and CPUs are the baseline being improved on. The published options list "CPUs" twice — the duplicate is dropped here.'
  },
  {
    id: 'et-280',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'A financial organization has many customers who close their accounts every year. The organization wants to use data and AI to identify at-risk customers, so they can retain customers by offering discounts and improved services. What should the organization do?',
    options: [
      'Create a dashboard of previous customers that have exited, and look for obvious correlations in the visualization.',
      'Create a ML model based on the demographics and activities of previous customers that exited.',
      'Create a survey for all customers to identify their current level of satisfaction.',
      'Create a report based on last year’s customer feedback.',
    ],
    answer: 1,
    explanation: 'Identifying who is about to leave means learning the pattern from the customers who already did, which is a machine learning model built on their demographics and behaviour. A dashboard, a survey and a feedback report all describe the past without predicting the individuals at risk.'
  },
  {
    id: 'et-281',
    topic: 'Migration & modernisation',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'What is the purpose of an application programming interface (API)?',
    options: [
      'To provide a set of instructions that allow computer programs to communicate with each other',
      'To provide cloud plugins for integrated development environments',
      'To connect networks from different cloud providers',
      'To manage multiple containerized workloads',
    ],
    answer: 0,
    explanation: 'An API is the agreed set of calls one program uses to talk to another, hiding everything behind it. IDE plugins, network interconnects and container orchestration are other things entirely.'
  },
  {
    id: 'et-282',
    topic: 'AI & machine learning',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization supplies electric car chargers in a nationwide network. They store customer and charging data in BigQuery. They want to efficiently upgrade and maintain their network to reduce waste and achieve their sustainability goals. How can Google Cloud services help the organization?',
    options: [
      'Secure data access by using Identity and Access Management.',
      'Provide access to third-party developers by creating an API using Apigee.',
      'Create a model in BigQuery to predict future maintenance schedules.',
      'Move data from BigQuery to Cloud Storage to reduce storage costs.',
    ],
    answer: 2,
    explanation: 'The data is already in BigQuery, so building a model there to predict when each charger will need attention turns that data into fewer wasted visits and longer-lived equipment. Securing access, publishing an API and cutting storage costs are all worthwhile but none of them reduces waste in the network.'
  },
  {
    id: 'et-283',
    topic: 'Cost management',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is planning to deploy a new workload to Google Cloud. They need an accurate estimate of the likely costs of running the workload. How should the organization create this estimate?',
    options: [
      'Use the Google Cloud Pricing Calculator.',
      'Deploy workload to test environment to observe costs.',
      'Use historic costs of an existing similar workload.',
      'Refer to pricing information and manually calculate an estimate.',
    ],
    answer: 0,
    explanation: 'The Google Cloud Pricing Calculator prices a configured workload before anything is deployed, which is what an estimate means here. Deploying to observe costs money and time, another workload\'s history is not this workload, and manual arithmetic on list prices is what the calculator exists to replace.'
  },
  {
    id: 'et-284',
    topic: 'Migration & modernisation',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization wants to refactor their application by using a microservices architecture when migrating to the cloud. Which benefit would this action provide?',
    options: [
      'The refactored application is more efficient and scalable.',
      'No code changes will be required.',
      'This migration pattern provides the fastest path to the cloud.',
      'The application will become PCI-DSS compliant by default.',
    ],
    answer: 0,
    explanation: 'Breaking the application into microservices lets each part scale and deploy on its own, which is the payoff for the work of refactoring. It certainly requires code changes, it is not the fastest path — rehosting is — and no architecture makes an application compliant by itself.'
  },
  {
    id: 'et-285',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization is using new technologies to change its business processes and culture to develop new customer experiences and adapt to market dynamics. What is the name of this approach?',
    options: [
      'Digital transformation',
      'Data center migration',
      'Operations optimization',
      'User personalization',
    ],
    answer: 0,
    explanation: 'Changing processes, culture and customer experience with new technology is the definition of digital transformation. Moving a data centre, tuning operations and personalising for users are pieces that may be part of it, not the name for it.'
  },
  {
    id: 'et-286',
    topic: 'Compute',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is developing applications by using Kubernetes. They want their teams to spend more time developing rather than managing clusters. Which Google Cloud service should the organization choose?',
    options: [
      'GKE Autopilot',
      'Compute Engine',
      'Cloud Run',
      'GKE Standard',
    ],
    answer: 0,
    explanation: 'GKE Autopilot runs the cluster for you — nodes, scaling and much of the configuration — so the team works on the application instead. GKE Standard leaves that management with them, Cloud Run is not Kubernetes, and Compute Engine is further down still.'
  },
  {
    id: 'et-287',
    topic: 'Cloud fundamentals',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization wants to deploy new workloads to the cloud but must keep some systems on-premises for compliance reasons. Both environments must be managed centrally. Which type of environment should the organization use?',
    options: [
      'Virtual machine environment',
      'Multi cloud environment',
      'Hybrid cloud environment',
      'Container environment',
    ],
    answer: 2,
    explanation: 'Some systems stay on-premises, the rest go to the cloud, and both are managed together: that is hybrid cloud. Multi-cloud means several public providers, and virtual machines and containers describe how workloads are packaged rather than where they live.'
  },
  {
    id: 'et-288',
    topic: 'Data analytics',
    difficulty: 'easy',
    verbatim: true,
    prompt: 'An organization has petabytes of data gathered from a wide range of sources. They want to use the data for strategic analysis and to guide business decisions. What type of service should they use?',
    options: [
      'Object store',
      'Non-relational document database',
      'Data warehouse',
      'Relational transactional database',
    ],
    answer: 2,
    explanation: 'Petabytes from many sources, gathered for strategic analysis, is the data warehouse case — BigQuery being the Google Cloud one. An object store keeps the files without analysing them, and the two database types serve operational workloads. Note that an earlier question with this same stem offers only environment types as options and the community answers multi-cloud there; here the right option is present.'
  },
  {
    id: 'et-289',
    topic: 'Security & identity',
    difficulty: 'medium',
    verbatim: true,
    prompt: 'An organization is deploying applications to the cloud using platform as a service. In the shared responsibility model, what remains the responsibility of the customer organization?',
    options: [
      'Operations',
      'Data access policies',
      'Physical security',
      'Network security',
    ],
    answer: 1,
    explanation: 'Under platform as a service the provider runs the platform and the infrastructure, but who may reach the data is never theirs to decide — data access policies stay with the customer. Operations, physical security and network security all sit on the provider\'s side of this model.'
  },
];
