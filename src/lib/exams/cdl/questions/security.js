/**
 * Section 5 — Trust and security with Google Cloud (~17%)
 * Security fundamentals, Google's trusted infrastructure (defence in depth,
 * encryption, IAM, Cloud Armor, SecOps) and trust principles and compliance.
 */

export const security = [
  // ── Trust and security in the cloud ──────────────────────────────────────
  {
    id: 'sec-01',
    topic: 'Security fundamentals',
    difficulty: 'easy',
    prompt: 'In the "CIA" triad of information security, what does confidentiality mean?',
    options: [
      'Data is only accessible to the people and systems authorised to see it.',
      'Data cannot be altered without the change being detected.',
      'Data and systems are available whenever authorised users need them.',
      'Data is retained for the period that regulation requires.'
    ],
    answer: 0,
    explanation:
      'The three pillars: confidentiality (only the right people can read it), integrity (it has not been tampered with), availability (it is there when needed). Encryption and access control serve confidentiality.'
  },
  {
    id: 'sec-02',
    topic: 'Security fundamentals',
    difficulty: 'easy',
    prompt: 'An attacker alters figures in a company\'s financial records without being noticed. Which security property has been violated?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Compliance'],
    answer: 1,
    explanation:
      'Integrity is about data being accurate and unmodified except by authorised changes. Hashing, audit logs and access controls protect it; the attacker here did not need to read the data, only change it.'
  },
  {
    id: 'sec-03',
    topic: 'Security fundamentals',
    difficulty: 'easy',
    prompt: 'A distributed denial-of-service (DDoS) attack floods a website with traffic until real customers cannot reach it. Which security property does it attack?',
    options: ['Confidentiality', 'Integrity', 'Availability', 'Privacy'],
    answer: 2,
    explanation:
      'DDoS does not steal or alter data; it makes the service unavailable. Google Cloud Armor is the product built to absorb and filter such attacks.'
  },
  {
    id: 'sec-04',
    topic: 'Security fundamentals',
    difficulty: 'easy',
    prompt: 'An employee receives an email that appears to come from the IT department asking them to "confirm" their password on a linked page. What kind of threat is this?',
    options: ['Ransomware', 'Phishing', 'DDoS', 'SQL injection'],
    answer: 1,
    explanation:
      'Phishing tricks people into handing over credentials or installing malware. It is among the most common cybersecurity threats, and two-step verification limits the damage a stolen password can do.'
  },
  {
    id: 'sec-05',
    topic: 'Security fundamentals',
    difficulty: 'medium',
    prompt: 'How does security in the cloud differ from traditional on-premises security?',
    options: [
      'Responsibility is shared: the provider secures the infrastructure and platform; the customer secures its data, identities and configuration.',
      'Responsibility moves to the provider: it secures the infrastructure, the platform and the customer\'s data, identities and configuration.',
      'Responsibility stays with the customer: the provider secures only the physical buildings, and the customer secures everything else.',
      'Responsibility is divided by region: the provider secures workloads in its home country and the customer secures the rest.'
    ],
    answer: 0,
    explanation:
      'On-premises, you own the whole stack. In the cloud, Google guards the data centres, hardware and platform; you still decide who has access, how data is classified, and whether your storage bucket is public.'
  },
  {
    id: 'sec-06',
    topic: 'Security fundamentals',
    difficulty: 'medium',
    prompt: 'What is the difference between privacy and security?',
    options: [
      'Security protects systems and data from threats; privacy governs the appropriate collection and use of personal information.',
      'Security governs the appropriate collection and use of personal information; privacy protects systems and data from threats.',
      'Security is the technical controls an organisation applies; privacy is the legal contract it signs with its provider.',
      'Security applies to data in transit and in use; privacy applies to data at rest.'
    ],
    answer: 0,
    explanation:
      'A system can be perfectly secure and still violate privacy by collecting data it should not. Security is a means; privacy — along with control and compliance — is one of the ends it serves.'
  },

  // ── Google's trusted infrastructure ──────────────────────────────────────
  {
    id: 'sec-07',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'What is "defence in depth"?',
    options: [
      'Layering multiple independent controls so that a breach of one layer does not compromise the whole.',
      'Concentrating investment in the strongest possible perimeter so that attackers never reach the interior.',
      'Encrypting data with multiple algorithms in sequence so that breaking one leaves the data protected.',
      'Placing data centres deep underground so that physical access is impossible without detection.'
    ],
    answer: 0,
    explanation:
      'Google\'s infrastructure is designed in layers, from custom-designed server hardware and the Titan security chip up through encrypted storage and service-to-service authentication. No single control has to be perfect.'
  },
  {
    id: 'sec-08',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt: 'Data can be encrypted in three states. Which list is correct?',
    options: [
      'At rest, in transit, and in use.',
      'At rest, in transit, and in backup.',
      'On disk, in memory, and in the browser.',
      'In the region, between regions, and at the edge.'
    ],
    answer: 0,
    explanation:
      'At rest (stored on disk), in transit (moving over a network), in use (being processed in memory — protected with Confidential Computing). Google Cloud encrypts data at rest and in transit by default.'
  },
  {
    id: 'sec-09',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'Which statement about encryption at rest on Google Cloud is correct?',
    options: [
      'It is enabled by default for all customer data, with the option to manage your own keys.',
      'It is enabled by default for databases only; object storage requires customer-managed keys.',
      'It is available on request and enabled per project by the customer\'s administrator.',
      'It is enabled by default, but only when the customer supplies its own encryption keys.'
    ],
    answer: 0,
    explanation:
      'Default encryption means a stolen disk is useless. Customers who need control can bring their own keys with Cloud KMS or customer-supplied encryption keys.'
  },
  {
    id: 'sec-10',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'Which statement correctly distinguishes authentication, authorisation and auditing?',
    options: [
      'Authentication proves who you are; authorisation decides what you may do; auditing records what was done.',
      'Authentication decides what you may do; authorisation proves who you are; auditing records what was done.',
      'Authentication proves who you are; authorisation records what was done; auditing decides what you may do.',
      'Authentication records what was done; authorisation proves who you are; auditing decides what you may do.'
    ],
    answer: 0,
    explanation:
      'The "three A\'s". Signing in is authentication. IAM roles are authorisation. Cloud Audit Logs are auditing — the record that lets you find out later who did what.'
  },
  {
    id: 'sec-11',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'What is the main benefit of two-step verification (2SV)?',
    options: [
      'Even if a password is stolen, an attacker still needs a second factor to sign in.',
      'Passwords are no longer needed, because the second factor replaces them entirely.',
      'Passwords are checked twice, so a mistyped password is caught before login.',
      'Sign-in is faster, because the second factor is remembered on the device.'
    ],
    answer: 0,
    explanation:
      'A second factor turns a leaked password from a breach into an inconvenience. Google reports that security keys in particular stop essentially all account takeovers from phishing.'
  },
  {
    id: 'sec-12',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'What does Identity and Access Management (IAM) let an administrator do?',
    options: [
      'Define who has what access to which resource, following the principle of least privilege.',
      'Define which networks can reach which resource, following the principle of segmentation.',
      'Define which encryption keys protect which resource, following the principle of key rotation.',
      'Define which users are billed for which resource, following the principle of chargeback.'
    ],
    answer: 0,
    explanation:
      'IAM binds members (users, groups, service accounts) to roles on resources. Least privilege — granting only the permissions a job needs — is the practice IAM is built to enforce.'
  },
  {
    id: 'sec-13',
    topic: "Google's trusted infrastructure",
    difficulty: 'easy',
    prompt: 'Which product protects applications from DDoS attacks and web-based threats at the edge of Google\'s network?',
    options: [
      'Cloud Armor',
      'Cloud NAT',
      'Identity-Aware Proxy',
      'VPC Service Controls'
    ],
    answer: 0,
    explanation:
      'Google Cloud Armor works with the global load balancer to filter malicious traffic — volumetric DDoS, and, with its web application firewall rules, things like SQL injection — before it reaches your services.'
  },
  {
    id: 'sec-14',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt: 'What is SecOps (security operations), and what is its business benefit?',
    options: [
      'The people, processes and tools that continuously monitor, detect, investigate and respond to threats.',
      'The team that writes security policies and audits the organisation against them once a year.',
      'The set of encryption, key management and access controls that prevent threats from succeeding.',
      'The backup and disaster recovery schedule that restores systems after a security incident.'
    ],
    answer: 0,
    explanation:
      'Prevention alone is never complete. SecOps closes the gap between a breach and its detection, and Google Security Operations (Chronicle) provides the analytics to do it at scale.'
  },
  {
    id: 'sec-15',
    topic: "Google's trusted infrastructure",
    difficulty: 'hard',
    prompt: 'Which TWO are examples of the layers in Google\'s defence-in-depth approach? (Choose two.)',
    options: [
      'Custom-designed server hardware with a Titan security chip that verifies the boot process.',
      'A requirement that customers bring their own physical servers into Google\'s data centres.',
      'Encryption of data in transit between data centres by default.',
      'A single central firewall through which all customer traffic must pass.'
    ],
    answer: [0, 2],
    explanation:
      'Hardware root of trust at the bottom, encrypted traffic across the network, identity-aware access above — each layer assumes the others could fail. Unencrypted storage and customer hardware are the opposite of the model.'
  },

  // ── Google Cloud's trust principles and compliance ───────────────────────
  {
    id: 'sec-16',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt: 'Which TWO of these are among Google Cloud\'s stated trust principles? (Choose two.)',
    options: [
      'You own your data, not Google.',
      'Google may use customer data to improve its advertising models.',
      'Google does not sell customer data to third parties.',
      'Customer data is stored in a single country chosen by Google.'
    ],
    answer: [0, 2],
    explanation:
      'The trust principles include: you own and control your data; Google does not use it for advertising or sell it; data is protected by default and you can see how it is handled. Option four confuses residency with a principle.'
  },
  {
    id: 'sec-17',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt: 'Why does Google publish transparency reports and submit to third-party audits?',
    options: [
      'So customers can verify, rather than take on faith, how Google handles data requests and whether its controls meet standards.',
      'So regulators can approve each new Google Cloud region before customers are permitted to store regulated data there.',
      'So customers can see which other organisations use Google Cloud and benchmark their own security configurations.',
      'So Google can transfer its compliance obligations to the independent auditors who sign the published reports.'
    ],
    answer: 0,
    explanation:
      'Trust is earned with evidence. Transparency reports disclose data requests; independent auditors test controls against recognised frameworks; customers can then rely on those reports for their own compliance.'
  },
  {
    id: 'sec-18',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt: 'What is the difference between data residency and data sovereignty?',
    options: [
      'Residency is where data is physically stored; sovereignty is data being subject to the laws of the country it is in.',
      'Residency is data being subject to the laws of the country it is in; sovereignty is where data is physically stored.',
      'Residency concerns data at rest; sovereignty concerns data in transit between countries.',
      'Residency is a customer choice of region; sovereignty is Google\'s choice of which regions to build.'
    ],
    answer: 0,
    explanation:
      'A bank may require residency (store it in Indonesia) and sovereignty (no foreign access, keys held locally). Google Cloud supports both with region selection, organisation policies and sovereign controls.'
  },
  {
    id: 'sec-19',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt: 'A healthcare company needs to confirm that Google Cloud meets the regulations of its industry before migrating. Where should it look?',
    options: [
      'The Compliance Resource Center and Compliance Reports Manager, which list certifications and provide audit reports.',
      'The Security Command Center, which scans the customer\'s projects and reports which regulations they meet.',
      'Cloud Audit Logs, which record every action Google takes and can be exported to the regulator.',
      'The Trust and Safety team, which issues a compliance certificate for each customer on request.'
    ],
    answer: 0,
    explanation:
      'The Compliance Resource Center maps Google Cloud to industry and regional frameworks (HIPAA, PCI DSS, GDPR and so on). Compliance Reports Manager is where you fetch the actual SOC and ISO reports on demand.'
  },
  {
    id: 'sec-20',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt: 'Under the shared responsibility model, which of these is Google Cloud responsible for?',
    options: [
      'Enforcing strong passwords and two-step verification for the customer\'s own users.',
      'Physical security of the data centres and the security of the underlying infrastructure and services.',
      'Deciding which of the customer\'s data may be made publicly accessible and for how long.',
      'Configuring the customer\'s firewall rules and IAM roles correctly for each project.'
    ],
    answer: 1,
    explanation:
      'Google is responsible for the security of the cloud; the customer is responsible for security in the cloud. Passwords, data classification and firewall configuration are the customer\'s side of the line.'
  },
  {
    id: 'sec-21',
    topic: 'Trust principles & compliance',
    difficulty: 'easy',
    prompt: 'What does "compliance" mean in a cloud context?',
    options: [
      'Accepting the provider\'s terms of service and acceptable-use policy for each product the organisation enables.',
      'Meeting the laws, regulations and industry standards that apply to your data and operations, and being able to demonstrate it.',
      'Configuring every service according to the provider\'s published security best practices and reviewing them annually.',
      'Keeping all software on supported versions so that known vulnerabilities are patched within the vendor\'s window.'
    ],
    answer: 1,
    explanation:
      'Compliance is about proof: not just being secure, but being able to show an auditor or regulator that specific required controls are in place. Google\'s certifications cover its side; the customer must still cover theirs.'
  },

  {
    id: 'sec-22',
    topic: 'Security fundamentals',
    difficulty: 'medium',
    prompt: 'A ransomware attack encrypts a hospital\'s files and demands payment. Which security properties does it attack, and what is the main defence?',
    options: [
      'Availability, and often confidentiality if data is also stolen; the defence is layered: patching, least privilege, isolated backups.',
      'Integrity, because the files are modified without authorisation; the defence is checksums and version control on every file.',
      'Confidentiality, because the attackers can read the files before encrypting them; the defence is stronger encryption at rest.',
      'Availability only, because the files cannot be opened; the defence is a faster network so that files restore more quickly.'
    ],
    answer: 0,
    explanation:
      'Ransomware makes data unavailable, and modern variants exfiltrate it too. Because no single control stops it, the answer is defence in depth plus backups that the attacker cannot reach.'
  },
  {
    id: 'sec-23',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt: 'What does a "zero trust" security model mean, as implemented in Google\'s BeyondCorp approach?',
    options: [
      'Access is never granted just because a request comes from inside the network; every request is verified on identity and context.',
      'Access is granted to any request from inside the corporate network and verified only for requests that come from outside it.',
      'Access is verified once at login, and the resulting session is trusted for all resources on the network until it expires.',
      'Access is denied by default to everyone, and granted only after a manager approves each individual request manually.'
    ],
    answer: 0,
    explanation:
      'The traditional model trusted the network perimeter. Zero trust assumes the network is hostile and authenticates and authorises each access — which is why 2SV, IAM and device policies matter so much.'
  },
  {
    id: 'sec-24',
    topic: 'Trust principles & compliance',
    difficulty: 'hard',
    prompt: 'A European customer must ensure that Google staff cannot access its data without its explicit approval, and that any access is logged. Which capabilities address this?',
    options: [
      'Access Transparency, which logs Google staff access, and Access Approval, which requires customer approval before it.',
      'Cloud Audit Logs, which log customer staff access, and IAM, which requires customer approval before it.',
      'Access Transparency, which requires customer approval, and Access Approval, which logs the access afterwards.',
      'VPC Service Controls, which block Google staff access, and Cloud KMS, which logs key usage.'
    ],
    answer: 0,
    explanation:
      'These two features make the trust principle "you control your data" verifiable: Access Transparency shows when and why a Google employee touched data; Access Approval lets the customer say no in advance.'
  },


  // ── Scenario questions: a business situation, four plausible options ─────
  {
    id: 'sec-25',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt:
      'An e-commerce site is knocked offline for two hours by a flood of traffic from tens of thousands of IP addresses during its biggest sale of the year. The CTO wants protection that absorbs such attacks before they reach the application, plus rules to block common web exploits. Which product should be deployed?',
    options: [
      'Cloud Armor',
      'Cloud Load Balancing alone',
      'VPC firewall rules',
      'Identity-Aware Proxy'
    ],
    answer: 0,
    explanation:
      'Volumetric DDoS plus a web application firewall is Cloud Armor, sitting at Google\'s edge in front of the load balancer. KMS manages keys, Audit Logs record actions, IAM governs permissions — none stops traffic.'
  },
  {
    id: 'sec-26',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt:
      'After an employee\'s password was phished, an attacker logged into the company\'s cloud console from another country and created expensive resources. The security team wants a control that would have stopped the login even with the correct password. What should they enforce?',
    options: [
      'Two-step verification with security keys for all console users.',
      'Longer passwords rotated every 30 days for all console users.',
      'Login alerts sent to the security team for every console sign-in.',
      'Restricting console access to the corporate office IP range.'
    ],
    answer: 0,
    explanation:
      'The password was already compromised; only a second factor makes it insufficient. Longer passwords do not help once phished, budget alerts fire after the damage, and encryption at rest is unrelated to login.'
  },
  {
    id: 'sec-27',
    topic: "Google's trusted infrastructure",
    difficulty: 'medium',
    prompt:
      'A contractor was given the Owner role on a production project "to save time" and accidentally deleted a database. The company wants to prevent a repeat without slowing engineers down. Which principle and mechanism apply?',
    options: [
      'Least privilege: IAM roles granting only the permissions each job needs, set at the right level of the hierarchy.',
      'Separation of duties: every engineer holds the Owner role, but changes need a second engineer\'s approval.',
      'Defence in depth: keep the Owner role but require a VPN and a security key before the console can be used.',
      'Auditing: keep the Owner role but export Cloud Audit Logs so that any deletion can be traced afterwards.'
    ],
    answer: 0,
    explanation:
      'Least privilege through IAM — predefined or custom roles scoped to folder or project — is the answer the exam wants for any over-permissioning story. The other options widen the blast radius or remove accountability.'
  },
  {
    id: 'sec-28',
    topic: 'Trust principles & compliance',
    difficulty: 'hard',
    prompt:
      'A German insurer is negotiating a move to Google Cloud. Its regulator requires that customer data be stored only in the EU, that Google staff cannot access it without the insurer\'s approval, and that every such access is logged. Which TWO capabilities address the last two requirements? (Choose two.)',
    options: [
      'Access Approval, which requires the customer\'s explicit consent before Google personnel can access its data.',
      'Access Transparency, which logs the actions Google personnel take on customer data.',
      'VPC Service Controls, which prevent data from leaving the EU regions.',
      'Cloud Audit Logs, which record the actions the insurer\'s own staff take on its data.'
    ],
    answer: [0, 1],
    explanation:
      'Residency is handled by region choice; the approval and logging requirements map one-to-one onto Access Approval and Access Transparency. Cloud Armor and storage classes are unrelated.'
  },
  {
    id: 'sec-29',
    topic: 'Security fundamentals',
    difficulty: 'medium',
    prompt:
      'A hospital\'s file servers are encrypted by ransomware and the attackers demand payment. Backups were stored on the same network and were encrypted too. Which TWO changes would most reduce the impact of a repeat? (Choose two.)',
    options: [
      'Immutable, isolated backups in Cloud Storage that the production network cannot overwrite.',
      'Least-privilege access and patching so the initial compromise spreads less far.',
      'Encrypting the file servers at rest so that the attackers cannot read the data.',
      'A larger internet connection so that files can be restored from the cloud more quickly.'
    ],
    answer: [0, 1],
    explanation:
      'Ransomware attacks availability; the defence is layered: limit the spread (least privilege, patching) and make recovery possible (backups the attacker cannot reach). The other two options do nothing or make things worse.'
  },
  {
    id: 'sec-30',
    topic: 'Trust principles & compliance',
    difficulty: 'medium',
    prompt:
      'A payments start-up must show its auditor that its cloud provider meets PCI DSS and ISO 27001 before it can launch. The founders are not sure where to find the evidence. What should they use?',
    options: [
      'The Compliance Resource Center and Compliance Reports Manager, to download Google Cloud\'s audit reports and certifications.',
      'Security Command Center, to generate a PCI DSS and ISO 27001 assessment report on the start-up\'s own projects.',
      'A support case with Customer Care, to request that Google issue a compliance certificate naming the start-up.',
      'Cloud Audit Logs exported to BigQuery, to prove to the auditor that no unauthorised access to card data occurred.'
    ],
    answer: 0,
    explanation:
      'Google is already certified against those frameworks; the customer\'s job is to obtain the reports for its own audit — which is what Compliance Reports Manager exists for — and to cover its own side of the shared responsibility.'
  },
];
