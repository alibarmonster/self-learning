/**
 * Section 1 — Digital transformation with Google Cloud (~17%)
 * Why cloud technology is transforming business, fundamental cloud concepts,
 * and the cloud computing models with their shared responsibility.
 */

export const digitalTransformation = [
  {
    id: 'dt-01',
    topic: 'Why cloud transforms business',
    difficulty: 'easy',
    prompt: 'Which statement best describes digital transformation?',
    options: [
      'Migrating an organisation\'s existing servers and applications to a cloud provider so that IT costs fall.',
      'Using digital technology to fundamentally change how an organisation operates and delivers value to customers.',
      'Digitising an organisation\'s paper records and manual forms so that its existing processes run faster.',
      'Appointing a chief digital officer to own the organisation\'s technology roadmap and vendor relationships.'
    ],
    answer: 1,
    explanation:
      'Digital transformation is about changing how a business works — its processes, culture and customer experience — using technology. Migrating servers or digitising documents can be part of it, but neither is the definition.'
  },
  {
    id: 'dt-02',
    topic: 'Why cloud transforms business',
    difficulty: 'easy',
    prompt:
      'A retailer is worried that its competitors, who moved to the cloud, now release new features every week while it releases twice a year. Which risk of NOT adopting new technology does this illustrate?',
    options: [
      'Rising capital expenditure, because on-premises hardware has to be replaced sooner.',
      'Loss of agility and slower time to market, because releases depend on slow infrastructure change.',
      'Vendor lock-in, because the competitors are now tied to a single cloud provider.',
      'Reduced data sovereignty, because customer data now leaves the retailer\'s own data centre.'
    ],
    answer: 1,
    explanation:
      'Agility — the ability to respond to change quickly — is one of the core reasons organisations move to the cloud. Falling behind on release cadence is the classic symptom of staying on legacy infrastructure.'
  },
  {
    id: 'dt-03',
    topic: 'Why cloud transforms business',
    difficulty: 'medium',
    prompt: 'What does it mean for an application to be "cloud-native"?',
    options: [
      'It has been rehosted onto cloud virtual machines with its original architecture kept intact.',
      'It is designed from the start to use elasticity, managed services, containers and microservices.',
      'It was written using a cloud provider\'s SDK so it can call that provider\'s services directly.',
      'It runs in a single large virtual machine so that it can be moved between clouds easily.'
    ],
    answer: 1,
    explanation:
      'Cloud-native applications are built for the cloud rather than merely hosted in it: they are typically containerised, composed of microservices, managed through automation, and scale horizontally on demand.'
  },
  {
    id: 'dt-04',
    topic: 'Why cloud transforms business',
    difficulty: 'medium',
    prompt: 'What is the difference between open source and an open standard?',
    options: [
      'Open source is code anyone may use and modify; an open standard is a public specification anyone may implement.',
      'Open source is a public specification anyone may implement; an open standard is code anyone may use and modify.',
      'Open source is software licensed free of charge; an open standard is software licensed under a paid agreement.',
      'Open source is maintained by a single vendor; an open standard is maintained jointly by several vendors.'
    ],
    answer: 0,
    explanation:
      'Kubernetes and TensorFlow are open source projects — you can read and change the code. HTTP or SQL are open standards — agreed specifications that many vendors implement. Google Cloud leans on both to reduce lock-in.'
  },
  {
    id: 'dt-05',
    topic: 'Why cloud transforms business',
    difficulty: 'medium',
    prompt:
      'Google describes five benefits of cloud transformation. Which of these is NOT one of the five?',
    options: ['Intelligence', 'Freedom', 'Collaboration', 'Exclusivity'],
    answer: 3,
    explanation:
      'The five transformation benefits Google Cloud cites are intelligence, freedom (avoiding lock-in through open technology), collaboration, trust and sustainability. Exclusivity is the opposite of the "freedom" theme.'
  },
  {
    id: 'dt-06',
    topic: 'Why cloud transforms business',
    difficulty: 'hard',
    prompt:
      'Google Cloud talks about a "transformation cloud". Which set correctly lists its components?',
    options: [
      'Data cloud, open infrastructure cloud, collaboration cloud, trusted cloud, and sustainability.',
      'Data cloud, serverless cloud, collaboration cloud, secure cloud, and cost optimisation.',
      'Analytics cloud, hybrid cloud, productivity cloud, compliance cloud, and sustainability.',
      'Data cloud, open infrastructure cloud, application cloud, identity cloud, and resilience.'
    ],
    answer: 0,
    explanation:
      'The transformation cloud is framed around business outcomes rather than products: a data cloud to unlock insight, an open infrastructure cloud to run anywhere, a collaboration cloud for people, a trusted cloud for security, and sustainability throughout.'
  },
  {
    id: 'dt-07',
    topic: 'Why cloud transforms business',
    difficulty: 'easy',
    prompt:
      'Which TWO of the following are drivers commonly cited for an organisation\'s digital transformation? (Choose two.)',
    options: [
      'Changing customer expectations for fast, personalised digital experiences.',
      'A preference for keeping data and applications in a single on-premises data centre.',
      'Competitive pressure from digitally native rivals that ship faster.',
      'A need to add more manual approval steps to the software release process.'
    ],
    answer: [0, 2],
    explanation:
      'Customer expectations and competitive pressure push organisations to transform. Wanting to stay purely on-premises or add manual steps are reasons transformation stalls, not drivers of it.'
  },

  // ── Fundamental cloud concepts ────────────────────────────────────────────
  {
    id: 'dt-08',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt: 'Moving from CapEx to OpEx is a common financial effect of adopting cloud. What does it mean?',
    options: [
      'Spending shifts from large up-front purchases of hardware to ongoing pay-as-you-go operating costs.',
      'Spending shifts from ongoing operating costs to large up-front investment in owned data centres.',
      'Spending shifts from the IT department\'s budget to each business unit\'s own operating budget.',
      'Spending shifts from hardware depreciation over five years to depreciation over a single year.'
    ],
    answer: 0,
    explanation:
      'On-premises IT is capital expenditure: buy servers up front and depreciate them. Cloud is operating expenditure: pay monthly for what you use. That changes cash flow and lets spending track actual demand.'
  },
  {
    id: 'dt-09',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt: 'What is the difference between scalability and elasticity?',
    options: [
      'Scalability is handling more load by adding resources; elasticity is adding and removing them automatically as demand changes.',
      'Scalability is adding and removing resources automatically as demand changes; elasticity is handling more load by adding resources.',
      'Scalability applies to storage capacity growing over time; elasticity applies to compute capacity growing over time.',
      'Scalability is a property of cloud systems; elasticity is the same property when measured for on-premises systems.'
    ],
    answer: 0,
    explanation:
      'A scalable system can grow. An elastic system grows and shrinks on its own, so you pay for the capacity you need at each moment rather than for the peak all the time.'
  },
  {
    id: 'dt-10',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt: 'Which statement about total cost of ownership (TCO) is correct?',
    options: [
      'TCO counts the purchase price of the hardware plus its depreciation and the support contract over the accounting period.',
      'TCO includes the full cost of running a system over its life: hardware, software, facilities, power, staff and maintenance.',
      'TCO compares the monthly cloud bill against the monthly cost of leasing equivalent hardware and support from a vendor.',
      'TCO includes hardware, software licences and vendor support contracts, but treats staff and facilities as overhead.'
    ],
    answer: 1,
    explanation:
      'Comparing a server\'s sticker price with a cloud bill is misleading. TCO adds the data centre, cooling, networking, the people who patch and replace hardware, and the cost of over-provisioning for peak demand.'
  },
  {
    id: 'dt-11',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt: 'In Google Cloud, what is the relationship between a region and a zone?',
    options: [
      'A region is a geographic location made up of several zones, each an isolated deployment area within it.',
      'A zone is a geographic location made up of several regions, each an isolated deployment area within it.',
      'A region is a continent and a zone is a country within it; resources are placed at the country level.',
      'A region and a zone are the same physical data centre, addressed at different levels of the API.'
    ],
    answer: 0,
    explanation:
      'A region such as asia-southeast2 (Jakarta) contains zones like asia-southeast2-a, -b and -c. Spreading resources across zones protects against a single data-centre failure; spreading across regions protects against a regional one.'
  },
  {
    id: 'dt-12',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt: 'What is latency?',
    options: [
      'The amount of data that can be moved across a connection per second.',
      'The time it takes for data to travel from its source to its destination.',
      'The number of network hops between a user and the nearest region.',
      'The delay added when data is encrypted before it leaves a region.'
    ],
    answer: 1,
    explanation:
      'Latency is delay, usually measured in milliseconds. Bandwidth is capacity — how much data can move per second. A user in Jakarta gets lower latency from a Jakarta region than from one in the United States.'
  },
  {
    id: 'dt-13',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt: 'Why does Google Cloud invest in its own private fibre network and subsea cables?',
    options: [
      'To keep customer traffic on Google\'s own network for longer, reducing latency and improving reliability.',
      'To keep customer traffic inside a single country so that data residency requirements are met by default.',
      'To offer customers a cheaper internet connection than local ISPs provide in each region.',
      'To avoid the need for multiple regions by serving every customer from one central location.'
    ],
    answer: 0,
    explanation:
      'Traffic that stays on Google\'s private backbone avoids the congestion and unpredictable routing of the public internet, which is why Google highlights its global network as a differentiator.'
  },
  {
    id: 'dt-14',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt:
      'A bank must keep a regulated workload on infrastructure dedicated to it alone, but wants to run its customer-facing website in the public cloud. Which infrastructure approach fits?',
    options: ['Public cloud only', 'Private cloud only', 'Hybrid cloud', 'Multicloud'],
    answer: 2,
    explanation:
      'Hybrid cloud combines private (on-premises or dedicated) infrastructure with public cloud. Multicloud, by contrast, means using more than one public cloud provider.'
  },
  {
    id: 'dt-15',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt:
      'A company runs its analytics on Google Cloud and its e-commerce platform on another public cloud provider. What is this strategy called?',
    options: ['Hybrid cloud', 'Multicloud', 'Private cloud', 'Community cloud'],
    answer: 1,
    explanation:
      'Using two or more public cloud providers is multicloud. Organisations do it to pick the best service for each workload, to avoid lock-in, or for resilience.'
  },
  {
    id: 'dt-16',
    topic: 'Fundamental cloud concepts',
    difficulty: 'easy',
    prompt: 'Which TWO are benefits of public cloud compared with a traditional on-premises data centre? (Choose two.)',
    options: [
      'You pay only for the resources you actually use, instead of for capacity bought in advance.',
      'The provider takes over responsibility for all of your security obligations, including access control.',
      'Capacity can be added or removed in minutes rather than in the months a hardware order takes.',
      'Data governance becomes unnecessary because the provider classifies and manages your data.'
    ],
    answer: [0, 2],
    explanation:
      'Pay-as-you-go pricing and near-instant provisioning are the headline benefits. Security stays shared — the provider secures the cloud, the customer secures what they put in it — and governance matters more, not less.'
  },

  // ── Cloud computing models and shared responsibility ─────────────────────
  {
    id: 'dt-17',
    topic: 'Computing models & shared responsibility',
    difficulty: 'easy',
    prompt: 'Compute Engine, which provides virtual machines you configure and manage yourself, is an example of which service model?',
    options: ['SaaS', 'PaaS', 'IaaS', 'FaaS'],
    answer: 2,
    explanation:
      'Infrastructure as a Service gives you the raw building blocks — virtual machines, disks, networks — and leaves the operating system and everything above it to you. Compute Engine is the textbook IaaS product.'
  },
  {
    id: 'dt-18',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt:
      'A development team wants to deploy its own application code without managing servers, operating systems or runtimes. Which service model suits them best?',
    options: ['IaaS', 'PaaS', 'SaaS', 'On-premises'],
    answer: 1,
    explanation:
      'Platform as a Service (App Engine, Cloud Run) takes care of the infrastructure and runtime; the team just supplies code. SaaS would give them a finished application, not a place to run their own.'
  },
  {
    id: 'dt-19',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt:
      'Under the shared responsibility model, a company uses Google Workspace (SaaS). Which of these remains the company\'s responsibility?',
    options: [
      'Patching the operating system of the servers that run Gmail and Drive, and keeping the mail software current.',
      'Controlling physical access to the data centres that host the service, and replacing failed storage hardware.',
      'Deciding who in the company can access which documents, and protecting user credentials.',
      'Running the backups of every mailbox and restoring them when a user deletes a message by mistake.'
    ],
    answer: 2,
    explanation:
      'The higher up the stack you go (IaaS → PaaS → SaaS), the more the provider takes on. But the customer always keeps responsibility for their data, their users\' identities and access decisions.'
  },
  {
    id: 'dt-21',
    topic: 'Computing models & shared responsibility',
    difficulty: 'easy',
    prompt:
      'A ten-person startup needs email, calendars, shared documents and video calls from day one, with nobody to run servers. Which service model fits?',
    options: ['IaaS', 'PaaS', 'SaaS', 'A private cloud'],
    answer: 2,
    explanation:
      'Software as a Service delivers a finished application — Google Workspace here — that the provider runs entirely. The startup signs in and uses it; there is no code to deploy and no infrastructure to manage.'
  },
  {
    id: 'dt-20',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt: 'Which statement correctly compares the trade-offs of IaaS and SaaS?',
    options: [
      'IaaS needs the most in-house expertise but gives the most flexibility; SaaS needs the least but allows the least customisation.',
      'IaaS needs the least in-house expertise but gives the most flexibility; SaaS needs the most but allows the least customisation.',
      'IaaS gives the provider control of the operating system; SaaS gives the customer control of the operating system.',
      'IaaS is billed per user per month; SaaS is billed for the underlying compute and storage consumed.'
    ],
    answer: 0,
    explanation:
      'Flexibility and responsibility go together. IaaS lets you configure everything and requires people who can. SaaS hands you a working product with almost nothing to manage, at the cost of doing things its way.'
  },

  {
    id: 'dt-22',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt:
      'A company runs its own application on Compute Engine virtual machines. Under the shared responsibility model, which of these is the COMPANY responsible for?',
    options: [
      'Physical security of the data centre and the servers on which the VMs are hosted.',
      'Patching the guest operating system and securing the application running on the VM.',
      'Maintaining the hypervisor and the virtualisation layer that isolates the VMs.',
      'Replacing failed disks and network switches beneath the VMs without downtime.'
    ],
    answer: 1,
    explanation:
      'On IaaS the provider secures everything up to and including the hypervisor; the customer owns the guest OS, its patches, the application, the data and the access rules. Move up to PaaS or SaaS and the provider takes over more of that list.'
  },
  {
    id: 'dt-23',
    topic: 'Why cloud transforms business',
    difficulty: 'medium',
    prompt:
      'A CFO argues that the company\'s data centre is "already paid for", so moving to the cloud would only add cost. Which response best reflects the cloud business case?',
    options: [
      'The hardware is a sunk cost, so the comparison should only include the cloud bill against future hardware purchases.',
      'The hardware price is only part of TCO; power, cooling, space, staff, refresh cycles and idle capacity continue every month.',
      'Cloud is cheaper in every scenario because providers buy hardware at scale, so the data centre should be closed now.',
      'Cloud removes the need for most IT staff, so the saving comes mainly from a smaller operations team.'
    ],
    answer: 1,
    explanation:
      'The exam frames cost through total cost of ownership and the CapEx-to-OpEx shift. A "paid-for" data centre still consumes operating budget every month and has to be replaced eventually; cloud converts that into elastic spend.'
  },
  {
    id: 'dt-24',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt:
      'A streaming service wants its application to survive the loss of an entire Google Cloud data centre without downtime. What is the minimum it should do?',
    options: [
      'Run the application in a single zone on larger, more reliable virtual machines.',
      'Deploy the application across multiple zones within a single region.',
      'Deploy the application in one zone and keep nightly backups in a second region.',
      'Run the application in a single zone behind a global load balancer.'
    ],
    answer: 1,
    explanation:
      'A zone is roughly a data centre; zones inside a region are isolated from each other\'s failures but close enough for low latency. Multi-zone deployment is the standard high-availability pattern; multi-region adds protection against a whole-region event.'
  },


  // ── Scenario questions: a business situation, four plausible options ─────
  {
    id: 'dt-25',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt:
      'A ticketing company sells out stadium concerts in minutes a few times a year and sees almost no traffic in between. It currently owns enough servers to survive the peak, which sit idle 95% of the time. Which cloud property directly solves this, and what is the financial effect?',
    options: [
      'Elasticity: capacity scales up for the sale and back down afterwards, so spend follows demand instead of peak provisioning.',
      'Scalability: capacity is provisioned for the largest expected sale, so spend is fixed and predictable across the year.',
      'High availability: capacity is duplicated across zones, so spend doubles but the sale never fails.',
      'Committed use: capacity is reserved for three years at a discount, so spend is lower than on-demand pricing.'
    ],
    answer: 0,
    explanation:
      'Idle capacity bought for a rare peak is the classic on-premises waste; elasticity (autoscaling) is the cure and turns a large CapEx into OpEx that tracks actual usage.'
  },
  {
    id: 'dt-26',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt:
      'A company moved its web application to Compute Engine. Three months later an attacker exploits an unpatched operating-system vulnerability on one of the VMs. The CIO argues Google should have patched it. Under the shared responsibility model, who was responsible, and what model would have shifted that duty to Google?',
    options: [
      'The customer: on IaaS the guest OS is theirs to patch; a PaaS or serverless option would make the runtime Google\'s responsibility.',
      'Google: on IaaS the provider patches the guest OS; only on a bare-metal option would patching become the customer\'s job.',
      'The customer: on every service model the customer patches the OS, so moving to PaaS would not change the responsibility.',
      'Shared equally: Google patches the OS on alternate months and the customer patches it in between.'
    ],
    answer: 0,
    explanation:
      'IaaS gives control of the OS and therefore the duty to maintain it. The further up the stack you move (PaaS, SaaS), the more of that maintenance Google takes on — which is often the business case for modernising.'
  },
  {
    id: 'dt-27',
    topic: 'Why cloud transforms business',
    difficulty: 'medium',
    prompt:
      'A regional bank\'s mobile app is updated twice a year after a lengthy release process. A digital-only competitor ships improvements weekly and is winning younger customers. The board asks what cloud adoption would change. Which answer best captures the business benefit?',
    options: [
      'Agility: managed services, automation and elastic infrastructure let teams release small changes often and respond to the market.',
      'Cost: cloud pricing is lower than the bank\'s data centre, so the savings can fund a larger development team and faster hiring.',
      'Security: the provider takes over the bank\'s security obligations, freeing the security team to work directly on the mobile app.',
      'Compliance: the provider\'s certifications transfer to the bank, shortening the regulatory review that precedes each release.'
    ],
    answer: 0,
    explanation:
      'The exam frames the risk of not adopting cloud as lost agility and slower time to market. Cloud does not remove security responsibilities or guarantee outcomes; it changes how fast an organisation can move.'
  },
  {
    id: 'dt-28',
    topic: 'Fundamental cloud concepts',
    difficulty: 'medium',
    prompt:
      'A retailer with customers in Indonesia and Australia deploys its application in a single US region and receives complaints about slow page loads. What is the primary cause and the fix?',
    options: [
      'Latency from distance: deploy in regions close to users and route each user to the nearest with a global load balancer.',
      'Bandwidth: the US region\'s connection is saturated, so a larger network tier in that region will fix the page loads.',
      'Capacity: the US VMs are too small for the traffic, so larger machine types in that region will fix the page loads.',
      'Availability: the US region has a single zone, so a multi-zone deployment there will fix the page loads.'
    ],
    answer: 0,
    explanation:
      'Every round trip across the Pacific adds tens to hundreds of milliseconds no matter how fast the server is. Regions exist so workloads can sit near users; Google\'s global load balancer directs each user to the closest healthy deployment.'
  },
  {
    id: 'dt-29',
    topic: 'Computing models & shared responsibility',
    difficulty: 'medium',
    prompt:
      'A 200-person consultancy runs its own email server, file server and video-conferencing bridge, maintained by one overworked IT administrator. It wants to stop running this infrastructure entirely and simply use the tools. Which service model and product fit?',
    options: [
      'SaaS: subscribe to Google Workspace and use the tools.',
      'PaaS: deploy open-source mail and file servers on App Engine.',
      'IaaS: run the mail and file servers on Compute Engine VMs.',
      'Hybrid: keep the servers in the office and add cloud backups.'
    ],
    answer: 0,
    explanation:
      'They want the outcome (email, files, meetings), not the platform: that is Software as a Service, and Workspace is the Google product. IaaS or PaaS would still leave them running the software.'
  },
  {
    id: 'dt-30',
    topic: 'Fundamental cloud concepts',
    difficulty: 'hard',
    prompt:
      'A CFO compares a $400,000 server purchase against a $12,000-a-month cloud estimate and concludes the cloud is more expensive over three years ($432,000 versus $400,000). Which TWO costs has the on-premises figure left out that a TCO analysis would add? (Choose two.)',
    options: [
      'Power, cooling, floor space and the staff time to maintain and eventually replace the hardware.',
      'The cost of over-provisioning: hardware sized for peak demand that sits idle most of the time.',
      'The cloud provider\'s data egress charges, which apply equally to traffic leaving an on-premises data centre.',
      'The operating-system licence fees, which are charged on-premises but included in every cloud VM price.'
    ],
    answer: [0, 1],
    explanation:
      'Total cost of ownership adds operating costs and the waste of fixed capacity to the sticker price. Once those are counted the comparison usually reverses — which is the point of the CapEx-to-OpEx argument.'
  },
];
