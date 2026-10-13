/**
 * Section 6 — Scaling with Google Cloud operations (~17%)
 * Financial governance and cost management, operational excellence and
 * reliability at scale (DevOps, SRE, Customer Care), and sustainability.
 */

export const operations = [
  // ── Financial governance and managing cloud costs ────────────────────────
  {
    id: 'ops-01',
    topic: 'Financial governance',
    difficulty: 'easy',
    prompt: 'What is cloud financial governance?',
    options: [
      'The policies, processes and tools that give an organisation visibility, predictability and control over cloud spending.',
      'The accounting rules that determine whether cloud spending is recorded as capital or operating expenditure each year.',
      'The approval workflow that finance must complete before any new cloud resource can be created in a production project.',
      'The discount agreements negotiated with the provider to lower the price of committed usage over one or three years.'
    ],
    answer: 0,
    explanation:
      'Because cloud is pay-as-you-go, anyone with access can create cost. Financial governance — often called FinOps — brings finance, engineering and leadership together to keep spending intentional.'
  },
  {
    id: 'ops-02',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'What is the order of Google Cloud\'s resource hierarchy, from the top down?',
    options: [
      'Project → Organisation → Folder → Resource',
      'Organisation → Folder → Project → Resource',
      'Resource → Project → Folder → Organisation',
      'Folder → Organisation → Project → Resource'
    ],
    answer: 1,
    explanation:
      'The organisation is the root. Folders group projects (by department, say). Projects hold resources such as VMs and buckets. IAM policies and organisation policies set higher up are inherited by everything below.'
  },
  {
    id: 'ops-03',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'What benefit does the resource hierarchy give for access control and cost management?',
    options: [
      'Policies set at a folder or organisation are inherited by everything beneath, and costs can be attributed per project or folder.',
      'Policies set on a project are inherited by its folder and organisation, and costs are always billed at the organisation level.',
      'Each level has its own separate policies that do not inherit, so access can be set independently per resource.',
      'Resources are automatically encrypted at the folder level, and costs are averaged across all projects in the folder.'
    ],
    answer: 0,
    explanation:
      'Grant the finance folder\'s viewers once and every project inside inherits it. Bill each project separately and each team sees its own spend. Structure is what makes governance scale.'
  },
  {
    id: 'ops-04',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'A team sets a Cloud Billing budget of $5,000 with an alert at 90%. What happens when spending reaches $5,000?',
    options: [
      'Nothing stops by itself: a budget sends notifications, and halting spend needs additional automation.',
      'All resources in the project are suspended until the budget is raised or the next period begins.',
      'New resources cannot be created in the project, but existing ones keep running and billing.',
      'The billing account is locked and the project\'s administrators must contact support to unlock it.'
    ],
    answer: 0,
    explanation:
      'A budget is a threshold rule that raises alerts. It is deliberately not a hard cap, because switching off production at midnight is usually worse than the overspend. If you want a cap, you build it.'
  },
  {
    id: 'ops-05',
    topic: 'Financial governance',
    difficulty: 'easy',
    prompt: 'What is a resource quota?',
    options: [
      'A limit on how much of a resource a project can use, protecting against runaway usage.',
      'A reserved amount of a resource that a project is guaranteed to receive at peak times.',
      'A discounted amount of a resource that a project can use before standard pricing applies.',
      'A minimum amount of a resource that a project must keep provisioned to stay supported.'
    ],
    answer: 0,
    explanation:
      'Quotas guard against mistakes and abuse — a script that accidentally launches a thousand VMs hits the quota first. They can be raised on request when growth is real.'
  },
  {
    id: 'ops-06',
    topic: 'Financial governance',
    difficulty: 'easy',
    prompt: 'A finance manager wants to see how cloud spend is trending and which projects and services drive it. Which tool should they use?',
    options: [
      'Cloud Billing reports',
      'Cloud Monitoring dashboards',
      'Recommender',
      'Cloud Audit Logs'
    ],
    answer: 0,
    explanation:
      'Cloud Billing reports visualise cost over time, broken down by project, service, SKU, region or label, and can forecast the month. Exporting billing data to BigQuery allows deeper custom analysis.'
  },
  {
    id: 'ops-07',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'Which TWO practices help an organisation control cloud costs? (Choose two.)',
    options: [
      'Setting budgets with alerts and using quotas to cap accidental over-use.',
      'Granting engineers the Owner role so they can resize resources without waiting.',
      'Labelling resources by team and cost centre so spend can be attributed and reviewed.',
      'Keeping unused resources provisioned so they are ready when demand returns.'
    ],
    answer: [0, 2],
    explanation:
      'Visibility (labels, reports), predictability (budgets, committed-use discounts) and control (quotas, least-privilege access) are the levers. Blanket Owner roles and idle resources are how bills grow.'
  },
  {
    id: 'ops-08',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'A company knows it will run a steady database workload on Compute Engine for the next three years. Which pricing option reduces its cost?',
    options: [
      'Spot VMs, which are discounted because they can be reclaimed',
      'Committed use discounts for a one- or three-year usage commitment',
      'Sustained use discounts earned automatically each month',
      'Preemptible VMs on a long-running managed instance group'
    ],
    answer: 1,
    explanation:
      'Steady, predictable workloads are what commitments are for. Spot VMs are cheaper still but can be interrupted, which a production database cannot tolerate.'
  },

  // ── Operational excellence and reliability at scale ──────────────────────
  {
    id: 'ops-09',
    topic: 'Operational excellence & reliability',
    difficulty: 'easy',
    prompt: 'What does "high availability" mean?',
    options: [
      'The service keeps running with minimal downtime by removing single points of failure through redundancy.',
      'The service can be restored from backups within an agreed time after a failure takes it fully offline.',
      'The service can scale to many times its normal load without a measurable drop in response time.',
      'The service is deployed in several regions so that users everywhere experience low latency.'
    ],
    answer: 0,
    explanation:
      'Availability is usually expressed as a percentage — "four nines" is 99.99%, about 52 minutes of downtime a year. It is achieved with redundancy, health checks and automatic failover.'
  },
  {
    id: 'ops-10',
    topic: 'Operational excellence & reliability',
    difficulty: 'hard',
    prompt: 'In disaster recovery planning, what do RPO and RTO measure?',
    options: [
      'RPO is how much data loss is acceptable, in time; RTO is how quickly the service must be restored.',
      'RPO is how quickly the service must be restored; RTO is how much data loss is acceptable, in time.',
      'RPO is the point at which failover is triggered; RTO is the time the standby takes to become primary.',
      'RPO is the recovery priority of a system; RTO is the team responsible for recovering it.'
    ],
    answer: 0,
    explanation:
      'Recovery Point Objective: "we can lose at most 15 minutes of data" → back up at least every 15 minutes. Recovery Time Objective: "we must be back within an hour" → warm standby, not tape restore. Tighter objectives cost more.'
  },
  {
    id: 'ops-11',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt: 'What is the difference between fault tolerance and disaster recovery?',
    options: [
      'Fault tolerance keeps a system running through component failures; disaster recovery restores service after a major outage.',
      'Fault tolerance restores service after a major outage; disaster recovery keeps a system running through component failures.',
      'Fault tolerance covers software failures; disaster recovery covers hardware and data-centre failures.',
      'Fault tolerance is achieved with backups; disaster recovery is achieved with redundant instances.'
    ],
    answer: 0,
    explanation:
      'Redundant instances behind a load balancer give fault tolerance — one dies, nobody notices. A second region with replicated data gives disaster recovery — a whole region goes down, you fail over.'
  },
  {
    id: 'ops-12',
    topic: 'Operational excellence & reliability',
    difficulty: 'easy',
    prompt: 'What is DevOps?',
    options: [
      'A culture and set of practices that bring development and operations together, using automation and shared responsibility.',
      'An organisational model in which a single operations team owns deployment and monitoring for every development team.',
      'A toolset for continuous integration and delivery that replaces the operations team with fully automated pipelines.',
      'A contract under which operations is outsourced to the cloud provider while development stays with the in-house team.'
    ],
    answer: 0,
    explanation:
      'DevOps replaces "throw it over the wall" with shared ownership, continuous integration and delivery, and infrastructure as code. The measurable results are release frequency and recovery speed.'
  },
  {
    id: 'ops-13',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt: 'In Site Reliability Engineering (SRE), what is the difference between an SLI, an SLO and an SLA?',
    options: [
      'An SLI is a measurement; an SLO is the internal target for it; an SLA is the external commitment to customers.',
      'An SLI is the external commitment to customers; an SLO is a measurement; an SLA is the internal target for it.',
      'An SLI is the internal target; an SLO is the external commitment to customers; an SLA is a measurement.',
      'An SLI is a measurement; an SLO is the external commitment to customers; an SLA is the internal target for it.'
    ],
    answer: 0,
    explanation:
      'SLI: "99.5% of requests under 300 ms this month" is what we measured. SLO: "we aim for 99.9%". SLA: "we promise customers 99.5% or they get credits". SLOs are set tighter than SLAs so you act before the promise breaks.'
  },
  {
    id: 'ops-14',
    topic: 'Operational excellence & reliability',
    difficulty: 'hard',
    prompt: 'What is an "error budget" in SRE?',
    options: [
      'The unreliability an SLO allows, which the team can spend on risky releases until it runs out.',
      'The money set aside each quarter to pay service credits to customers when the SLA is missed.',
      'The number of incidents a service may have per quarter before its SLO is tightened.',
      'The share of engineering time reserved for fixing bugs rather than building new features.'
    ],
    answer: 0,
    explanation:
      'Error budgets turn reliability from an argument into arithmetic. Budget remaining: ship features. Budget exhausted: freeze releases and fix reliability. It aligns developers and operators on one number.'
  },
  {
    id: 'ops-15',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt: 'Which TWO are practices associated with SRE and modern operations? (Choose two.)',
    options: [
      'Blameless postmortems that focus on fixing systems rather than punishing people.',
      'Manual runbooks executed by an on-call engineer for every routine operation.',
      'Automating repetitive operational work so engineers spend time on improvement.',
      'Keeping reliability targets within the operations team so developers are not slowed down.'
    ],
    answer: [0, 2],
    explanation:
      'SRE\'s core moves: measure with SLOs, share the targets, eliminate toil through automation, and learn from incidents without blame. Manual night shifts and secrecy are what it replaces.'
  },
  {
    id: 'ops-16',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt: 'What is the business benefit of Google Cloud Customer Care?',
    options: [
      'Tiered support from Basic to Premium, with faster response times and technical account management as the tier rises.',
      'A single support level for every customer, with response times set by the severity the customer assigns to each case.',
      'Consulting engagements in which Google engineers design, build and hand over the customer\'s cloud architecture.',
      'A managed operations service in which Google runs and monitors the customer\'s workloads on the customer\'s behalf.'
    ],
    answer: 0,
    explanation:
      'Every account has Basic support. Paid tiers add faster target response times, 24/7 coverage for critical issues and, at Premium, a Technical Account Manager who knows your environment.'
  },
  {
    id: 'ops-17',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt: 'A customer opens a support case with Google Cloud. Which statement about the case lifecycle is correct?',
    options: [
      'The customer assigns a priority from P1 to P4, which sets the target response time; the case is worked, updated and closed.',
      'Google assigns a priority based on the affected product, which sets the target response time; the customer cannot change it.',
      'Cases are worked in the order received, and the target response time depends on the customer\'s support tier only.',
      'The customer assigns a priority, but it only affects which team receives the case, not the response time.'
    ],
    answer: 0,
    explanation:
      'Priority drives urgency: a P1 on a Premium plan targets a 15-minute response around the clock. Setting priority honestly matters — escalating everything to P1 slows the real emergencies.'
  },

  // ── Sustainability ───────────────────────────────────────────────────────
  {
    id: 'ops-18',
    topic: 'Sustainability',
    difficulty: 'medium',
    prompt: 'Which statement about Google\'s sustainability commitments is correct?',
    options: [
      'Google has matched 100% of its annual electricity use with renewables since 2017 and aims for 24/7 carbon-free energy by 2030.',
      'Google has run every data centre directly on renewable energy since 2017 and aims to be carbon neutral across operations by 2030.',
      'Google has been carbon neutral since 2017 and aims to match 100% of its annual electricity use with renewable purchases by 2030.',
      'Google aims to match 100% of its electricity use with renewables by 2030 and to run on carbon-free energy 24/7 by 2040.'
    ],
    answer: 0,
    explanation:
      'Carbon neutral since 2007, 100% renewable matching since 2017, and the 2030 goal of 24/7 carbon-free energy — hour by hour, on every grid where it operates — is the ambitious one.'
  },
  {
    id: 'ops-19',
    topic: 'Sustainability',
    difficulty: 'easy',
    prompt: 'A company must report the greenhouse gas emissions associated with its cloud usage. Which Google Cloud tool helps?',
    options: [
      'Carbon Footprint',
      'Cloud Billing reports',
      'Active Assist recommendations',
      'Cloud Monitoring'
    ],
    answer: 0,
    explanation:
      'Carbon Footprint is in the console and can export to BigQuery, so emissions can be tracked, attributed to teams and included in sustainability reporting.'
  },
  {
    id: 'ops-20',
    topic: 'Sustainability',
    difficulty: 'easy',
    prompt: 'How can moving from an on-premises data centre to Google Cloud reduce an organisation\'s environmental impact?',
    options: [
      'Google\'s data centres are far more energy-efficient than typical enterprise facilities and use a high share of carbon-free energy.',
      'Google\'s data centres use the same energy per workload as an enterprise facility, but Google buys carbon offsets on the customer\'s behalf.',
      'Cloud servers are switched off between requests, so a workload running in the cloud uses almost no electricity when it is idle.',
      'Moving to the cloud only reduces impact if the customer also chooses the Archive storage class for all of its long-term data.'
    ],
    answer: 0,
    explanation:
      'Hyperscale data centres achieve much better power usage effectiveness than a company\'s own server room, and Google\'s carbon-free energy sourcing lowers the emissions per unit of compute further.'
  },
  {
    id: 'ops-21',
    topic: 'Sustainability',
    difficulty: 'medium',
    prompt: 'A company wants to lower the carbon emissions of a new workload without changing its code. What is a simple step?',
    options: [
      'Deploy it in a region with a higher carbon-free energy percentage, flagged in the console as low CO₂.',
      'Deploy it in the region closest to the company\'s headquarters to minimise network distance and transit.',
      'Deploy it on the largest available machine type so that the workload finishes as quickly as possible.',
      'Deploy it in two regions so that either one can be switched off whenever its local grid is dirty.'
    ],
    answer: 0,
    explanation:
      'Region choice affects emissions directly. Google marks lower-carbon regions in the console and in the region picker, so placing a flexible workload there is the cheapest sustainability win available.'
  },
  {
    id: 'ops-22',
    topic: 'Sustainability',
    difficulty: 'easy',
    prompt: 'Why does the exam guide list sustainability alongside cost and reliability under "scaling with Google Cloud operations"?',
    options: [
      'Environmental impact has become a business metric that customers, investors and regulators track, and cloud choices affect it.',
      'Sustainability reporting is a legal requirement in every country where Google Cloud operates a region or an edge location.',
      'Sustainable regions are cheaper to run because renewable power costs less, so choosing them is a cost-optimisation decision.',
      'Google requires customers to report their emissions each year as a condition of the Google Cloud service agreement.'
    ],
    answer: 0,
    explanation:
      'A Cloud Digital Leader is expected to explain the business case for cloud, and sustainability commitments are now part of that case for many organisations.'
  },

  {
    id: 'ops-23',
    topic: 'Sustainability',
    difficulty: 'medium',
    prompt: 'Which TWO actions reduce the carbon footprint of a cloud workload? (Choose two.)',
    options: [
      'Choosing a region with a high carbon-free energy percentage.',
      'Keeping development environments running so they do not need to restart.',
      'Deleting idle resources and right-sizing over-provisioned machines.',
      'Replicating every workload to several regions to spread the load.'
    ],
    answer: [0, 2],
    explanation:
      'Emissions follow energy use. Cleaner regions lower the emissions per unit of compute; using less compute — no idle VMs, no oversized instances — lowers the units. Waste in either direction adds carbon and cost together.'
  },
  {
    id: 'ops-24',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt: 'What is the purpose of applying labels (such as team=marketing or env=prod) to Google Cloud resources?',
    options: [
      'Labels let billing data be grouped and filtered, so costs can be attributed to teams, environments or projects.',
      'Labels control which IAM roles apply to a resource, so access can be attributed to teams or environments.',
      'Labels determine which region a resource is deployed to, so latency can be tuned per environment.',
      'Labels are required to create resources, so every resource is guaranteed to have an owner recorded.'
    ],
    answer: 0,
    explanation:
      'Labels are key-value tags that flow into Cloud Billing exports and reports. Without them a bill is one number; with them, each team sees and owns its own share.'
  },
  {
    id: 'ops-25',
    topic: 'Operational excellence & reliability',
    difficulty: 'easy',
    prompt: 'Which product family gives visibility into logs, metrics, traces and uptime for applications on Google Cloud?',
    options: [
      'Cloud Monitoring, Cloud Logging and Cloud Trace',
      'Cloud Audit Logs and Access Transparency',
      'Security Command Center and Cloud Armor',
      'Cloud Billing reports and Recommender'
    ],
    answer: 0,
    explanation:
      'You cannot run a reliable service you cannot see. Cloud Monitoring (metrics, dashboards, alerts), Cloud Logging and Cloud Trace — formerly the "Operations suite" — are the tooling behind SLO-based reliability.'
  },


  // ── Scenario questions: a business situation, four plausible options ─────
  {
    id: 'ops-26',
    topic: 'Financial governance',
    difficulty: 'medium',
    prompt:
      'A university\'s cloud bill tripled in a month. Investigation shows a student project left 50 large VMs running, and nobody was notified until the invoice arrived. The IT director wants early warning and a hard ceiling on what any one project can create. Which TWO should be put in place? (Choose two.)',
    options: [
      'Cloud Billing budgets with alerts at 50%, 90% and 100% of expected spend.',
      'Resource quotas on each project, limiting CPUs and VM counts.',
      'Committed use discounts on the 50 VMs so the same usage costs less.',
      'A single billing account for all projects so spend is visible in one place.'
    ],
    answer: [0, 1],
    explanation:
      'Budgets give the early warning; quotas give the ceiling. Committing to the runaway VMs would lock in the waste, and flattening the hierarchy removes the per-project visibility that would have caught this.'
  },
  {
    id: 'ops-27',
    topic: 'Operational excellence & reliability',
    difficulty: 'hard',
    prompt:
      'A stock-trading platform promises customers 99.95% availability in its contract. Its engineers currently target exactly 99.95% internally. During a quarter they miss it by an hour and owe service credits. What change to their reliability practice would an SRE recommend?',
    options: [
      'Set an internal SLO tighter than the SLA, such as 99.99%, and manage releases against the resulting error budget.',
      'Set the internal SLO equal to the SLA and add a second SLA with customers at 99.99% for premium accounts.',
      'Set an internal SLO looser than the SLA, such as 99.9%, so the team has room to release more often.',
      'Replace the availability SLO with a latency SLO, since availability is already covered by the SLA.'
    ],
    answer: 0,
    explanation:
      'SLOs are meant to sit inside SLAs as an early-warning margin; an SLO equal to the SLA leaves no room to react. The error budget derived from the SLO is the mechanism that slows releases when reliability is at risk.'
  },
  {
    id: 'ops-28',
    topic: 'Operational excellence & reliability',
    difficulty: 'hard',
    prompt:
      'An airline\'s booking system must lose no more than five minutes of bookings in a disaster and be back within thirty minutes. The current plan restores nightly backups to new servers in about six hours. Which statement correctly diagnoses the gap?',
    options: [
      'Both are missed: nightly backups give an RPO of up to 24 hours, and a 6-hour rebuild far exceeds a 30-minute RTO.',
      'Only the RTO is missed: nightly backups satisfy a 5-minute RPO, but a 6-hour rebuild exceeds a 30-minute RTO.',
      'Only the RPO is missed: nightly backups exceed a 5-minute RPO, but a 6-hour rebuild is within a 30-minute RTO.',
      'Neither is missed: nightly backups and a 6-hour rebuild are within both objectives for a booking system.'
    ],
    answer: 0,
    explanation:
      'RPO is data loss (time since last copy), RTO is time to restore. Nightly backups fail the first, a six-hour rebuild fails the second. Tight objectives require replication and standby capacity, which is why they cost more.'
  },
  {
    id: 'ops-29',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt:
      'A retailer\'s website goes down for an hour on the busiest shopping night of the year and the engineering manager wants to "find who is responsible". The CTO, who has read about SRE, objects. What practice is the CTO advocating and why?',
    options: [
      'A blameless postmortem: focus on systemic causes and fixes, because blame drives people to hide problems.',
      'A root-cause review that identifies the engineer responsible, so the same person cannot repeat the error.',
      'A change freeze for the rest of the year, so no further releases can cause an outage.',
      'An external audit of the engineering team, so an independent party assigns accountability.'
    ],
    answer: 0,
    explanation:
      'Blameless postmortems are a core SRE practice: incidents are treated as information about the system, not about individuals, so the organisation learns instead of concealing.'
  },
  {
    id: 'ops-30',
    topic: 'Sustainability',
    difficulty: 'medium',
    prompt:
      'A consumer-goods company has committed to publishing its carbon emissions, including those from IT. It runs most of its workloads on Google Cloud and needs the figures broken down by business unit for the annual report. What should it use?',
    options: [
      'Carbon Footprint in the Cloud console, exported to BigQuery and attributed by project and label.',
      'Cloud Billing reports, with spend converted to emissions using a published factor per dollar.',
      'Cloud Monitoring, with CPU utilisation converted to emissions per region.',
      'Active Assist recommendations, which list the emissions each idle resource produces.'
    ],
    answer: 0,
    explanation:
      'Carbon Footprint reports emissions per project, product and region and can be exported for reporting; labels and the project hierarchy give the business-unit split. Estimating from spend is neither accurate nor auditable.'
  },
  {
    id: 'ops-31',
    topic: 'Operational excellence & reliability',
    difficulty: 'medium',
    prompt:
      'A fintech has a production outage at 2 a.m. and the on-call engineer cannot diagnose it. The company is on the free Basic support plan and finds it cannot reach anyone at Google. Which change would ensure fast expert help for future incidents?',
    options: [
      'Move to a paid Customer Care tier such as Enhanced or Premium, with 24/7 response targets for P1 cases.',
      'Stay on Basic support but open cases earlier in the day so they are answered before the evening.',
      'Buy a Technical Account Manager engagement without changing the support tier.',
      'Raise the case priority to P1 on the Basic tier so that it is answered within an hour.'
    ],
    answer: 0,
    explanation:
      'Basic support is documentation and billing help only. Enhanced and Premium tiers add around-the-clock response times for critical cases, and Premium adds a Technical Account Manager who knows the environment.'
  },
];
