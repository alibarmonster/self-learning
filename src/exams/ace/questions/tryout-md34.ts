/**
 * Tryout MD3–MD4 — the combined try-out for course Modules 3 and 4, sat on
 * 20 November 2026. Ten sections, two questions each, in course order:
 *
 *   Module 3 · Storage & Data            Module 4 · Cloud Networking
 *   1. Cloud Storage (S9)                6. VPC, subnets, IPs and routes (S13-01)
 *   2. Databases (S10)                   7. Firewall rules and Cloud NGFW (S13-02)
 *   3. Messaging and pipelines (S11-01)  8. Shared VPC, peering and hybrid (S13-01/03)
 *   4. Encryption keys (S11-02)          9. Cloud DNS and Cloud NAT (S13-02)
 *   5. Redundancy and DR (S11-03)       10. Load balancing, CDN and tiers (S16)
 *
 * Like the module try-outs, every question carries its exam-guide section and
 * joins that section's bank; the set itself is in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const tryoutMd34: ModuleQuestion[] = [
  // ── 1 · Cloud Storage ──
  {
    id: 'ace-t34-01',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A media company stores raw footage in Cloud Storage. Files are read heavily for the first 30 days, then about once a quarter for a year, then almost never. Compliance says every file must be kept for seven years and nobody, including admins, may delete one early. What should you set up?',
    options: [
      'Archive from day one, with object versioning turned on so that nobody can delete an object early',
      'Autoclass on the bucket, with the soft delete retention window raised to seven full years',
      'Standard, lifecycle to Coldline at 30 days and Archive at 365, and a locked 7-year retention policy',
      'Nearline for everything, with a lifecycle rule that deletes each object after seven years'
    ],
    answer: 2,
    explanation: 'Lifecycle rules move each object to the class that matches its age: Standard while it is hot, Coldline for quarterly reads (90-day minimum), Archive once it is cold. A retention policy stops deletion before seven years, and locking it with Bucket Lock means nobody can shorten or remove it. Versioning keeps old copies but does not stop deletes, soft delete tops out at 90 days, and Archive from day one would pay retrieval fees on the heavy first month.',
    tip: '"Nobody may delete, not even admins" → retention policy + Bucket Lock.'
  },
  {
    id: 'ace-t34-02',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A contractor who has no Google account must upload one file to a private bucket within the next two hours. The bucket uses uniform bucket-level access. What do you give the contractor?',
    options: [
      'A signed URL for a PUT on that object name, valid for two hours',
      'Storage Object Creator for `allUsers` on the bucket, removed after two hours',
      'An object ACL that grants WRITE to the contractor’s email address',
      'An HMAC key created for your own user account'
    ],
    answer: 0,
    explanation: 'A signed URL grants time-limited access to one object operation without a Google identity. Granting `allUsers` opens the bucket to the whole internet, ACLs are disabled under uniform bucket-level access, and handing out an HMAC key for your account gives away your own access.'
  },

  // ── 2 · Databases ──
  {
    id: 'ace-t34-03',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'A retailer needs one relational inventory database for stores in the US, Europe and Asia. Writes from every continent must be strongly consistent, it must scale horizontally, and the target is 99.999% availability. Which service and configuration fit?',
    options: [
      'Cloud SQL Enterprise Plus with cross-region read replicas',
      'Spanner with a multi-region configuration',
      'AlloyDB for PostgreSQL with cross-region replication',
      'Bigtable with multi-cluster routing'
    ],
    answer: 1,
    explanation: 'Spanner is the globally distributed, strongly consistent relational database, and its multi-region configurations carry the 99.999% SLA. Cloud SQL and AlloyDB replicas are read-only and asynchronous, so writes stay in one region, and Bigtable is NoSQL with eventual consistency across clusters.'
  },
  {
    id: 'ace-t34-04',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'hard',
    prompt: 'At 14:32 a developer ran a `DELETE` without a `WHERE` clause on a Cloud SQL for PostgreSQL instance. Automated backups and point-in-time recovery are on, and the instance is HA with one read replica. You must recover the rows with the least data loss, without overwriting the live instance. What do you do?',
    options: [
      'Restore last night’s automated backup onto the live instance, then replay the app logs',
      'Promote the read replica to a standalone primary and point the app at it',
      'Fail over to the HA standby in the other zone, which still holds the rows',
      'Clone the instance to a point in time just before 14:32, then copy the rows back'
    ],
    answer: 3,
    explanation: 'Point-in-time recovery creates a new instance as of a chosen moment, so you get the data up to 14:31 and the live instance is untouched. Restoring a backup overwrites the target and loses everything since the backup. The read replica and the HA standby both replicated the delete within seconds.',
    tip: 'HA and replicas copy mistakes too. PITR is the undo button.'
  },

  // ── 3 · Messaging and pipelines ──
  {
    id: 'ace-t34-05',
    section: 'planning',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'Thirty on-premises services use Apache Kafka producer and consumer clients. The company wants a managed Google Cloud service and as few code changes as possible. What should they move to?',
    options: [
      'Managed Service for Apache Kafka',
      'Pub/Sub, rewriting each service against the Pub/Sub client libraries',
      'Pub/Sub Lite with zonal topics',
      'Self-managed Kafka brokers on a GKE Autopilot cluster'
    ],
    answer: 0,
    explanation: 'Managed Service for Apache Kafka runs real Kafka clusters, so existing clients only need new bootstrap addresses and credentials. Pub/Sub needs code changes, Pub/Sub Lite is retired, and running brokers yourself on GKE is not a managed service.'
  },
  {
    id: 'ace-t34-06',
    section: 'operating',
    topic: 'Data products',
    difficulty: 'medium',
    prompt: 'A Pub/Sub push subscription keeps redelivering one malformed message that the subscriber can never process, and it delays everything else. What should you configure?',
    options: [
      'Exactly-once delivery on the subscription, so each message is delivered only one time',
      'Message ordering with an ordering key, so the malformed message is always processed last',
      'A dead-letter topic with 5 maximum delivery attempts, with IAM for the Pub/Sub service agent',
      'A 10-second acknowledgement deadline on the subscription, so the message expires sooner'
    ],
    answer: 2,
    explanation: 'After the maximum number of delivery attempts, Pub/Sub forwards the message to the dead-letter topic, where it can be inspected later. The Pub/Sub service agent needs Publisher on the dead-letter topic and Subscriber on the source subscription. Exactly-once and ordering do not drop a poison message, and a shorter deadline only makes it come back faster.'
  },

  // ── 4 · Encryption keys ──
  {
    id: 'ace-t34-07',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Security requires customer-managed keys for a BigQuery dataset in asia-southeast2. You created a Cloud KMS key in asia-southeast2, but creating a table with that key fails with a permission error, even though you are a project Owner. What is missing?',
    options: [
      'Cloud KMS Admin for your own user account on the key ring that holds the key',
      'Cloud KMS CryptoKey Encrypter/Decrypter for the BigQuery service agent on the key',
      'A new key in the `global` location, because BigQuery cannot use regional keys',
      'Customer-supplied keys (CSEK) passed by the client with every load and query'
    ],
    answer: 1,
    explanation: 'With CMEK, the service encrypts and decrypts on your behalf, so its service agent needs Encrypter/Decrypter on the key. Your own roles do not matter for that call. The key location must match the dataset (asia-southeast2 is right), and BigQuery does not take CSEK.',
    tip: 'CMEK permission errors → the service agent, not the user.'
  },
  {
    id: 'ace-t34-08',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'Developers in hundreds of projects create buckets, disks and datasets that must all use CMEK. Security wants a key created automatically for each new resource in the right location, held in a separate key project, without a ticket every time. What fits?',
    options: [
      'One CMEK key in the `global` location, shared by every resource',
      'Customer-supplied encryption keys generated by each developer',
      'The `gcp.restrictNonCmekServices` constraint on its own',
      'Cloud KMS Autokey, which creates keys on demand in a key project'
    ],
    answer: 3,
    explanation: 'Autokey provisions a key when a resource needs one, in the matching location, inside a dedicated key project, keeping separation of duties. The organization policy constraint only enforces CMEK; it creates no keys. One shared global key cannot match regional resources, and CSEK puts key handling on every developer.'
  },

  // ── 5 · Redundancy and DR ──
  {
    id: 'ace-t34-09',
    section: 'planning',
    topic: 'Choosing storage & databases',
    difficulty: 'medium',
    prompt: 'An app on Cloud SQL for MySQL in asia-southeast2 must survive the loss of the whole region with an RPO of minutes and an RTO under an hour. What do you add?',
    options: [
      'The HA configuration, with a synchronous standby in a second zone',
      'Daily exports of the database to a dual-region Cloud Storage bucket',
      'A cross-region read replica in asia-southeast1, promoted on failure',
      'A larger machine type with more vCPUs and a bigger SSD'
    ],
    answer: 2,
    explanation: 'A cross-region replica is continuously updated, so the data loss is minutes, and promoting it takes minutes too. HA protects against a zone failure only, daily exports mean up to a day of lost data, and machine size has nothing to do with region failure.',
    tip: 'HA is not DR: HA = zone, cross-region replica = region.'
  },
  {
    id: 'ace-t34-10',
    section: 'operating',
    topic: 'Managing storage & databases',
    difficulty: 'medium',
    prompt: 'A dual-region bucket must copy every new object to the second region within 15 minutes to meet the DR plan’s RPO. What do you enable?',
    options: [
      'Turbo replication on the bucket',
      'Object versioning on the bucket',
      'Autoclass on the bucket',
      'A Storage Transfer Service job every 15 minutes to a second bucket'
    ],
    answer: 0,
    explanation: 'Turbo replication gives dual-region buckets a 15-minute RPO for new objects. Default replication is asynchronous with a longer target, versioning and Autoclass do not replicate anything, and a scheduled transfer job is more moving parts for a weaker guarantee.'
  },

  // ── 6 · VPC, subnets, IPs and routes ──
  {
    id: 'ace-t34-11',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Subnet `web-jkt` is `10.10.0.0/24` and almost full. The next subnet in the VPC, `app-jkt`, is `10.10.4.0/24`. You want the most room for `web-jkt` with one `gcloud compute networks subnets expand-ip-range` command. Which prefix length works?',
    options: [
      '`--prefix-length=21`, to get the most addresses in one change',
      '`--prefix-length=22`, because 10.10.0.0/22 ends at 10.10.3.255',
      '`--prefix-length=25`, then add a second primary range',
      'None: the subnet must be deleted and recreated as a /22'
    ],
    answer: 1,
    explanation: 'Expanding to /22 gives 10.10.0.0–10.10.3.255, which contains the old range and stops just before `app-jkt`. A /21 (10.10.0.0–10.10.7.255) would overlap `app-jkt` and fail. /25 is smaller, and subnets can never shrink. Expansion happens in place, with no downtime.'
  },
  {
    id: 'ace-t34-12',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A VPC has the default route `0.0.0.0/0` to the internet gateway (priority 1000) and a custom route `0.0.0.0/0` to an internal passthrough Network Load Balancer of firewall appliances (priority 800, tag `inspected`). A VM without any network tags sends traffic to the internet. Which route does it use?',
    options: [
      'The appliance route, because priority 800 is a lower number than 1000 and wins',
      'Both routes, because equal prefixes share the traffic through ECMP hashing',
      'Neither route, so the traffic is dropped by the implied deny egress rule',
      'The default route, since the tagged route covers only VMs tagged `inspected`'
    ],
    answer: 3,
    explanation: 'A route with network tags applies only to VMs that carry one of those tags. For the untagged VM only the default route matches. For a VM tagged `inspected`, both routes have the same prefix, so the lower priority number (800) would win.'
  },

  // ── 7 · Firewall rules and Cloud NGFW ──
  {
    id: 'ace-t34-13',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'An organization-level hierarchical firewall policy has a rule at priority 100 that denies tcp:3389 from `0.0.0.0/0`. A project team adds a VPC firewall rule at priority 0 that allows tcp:3389 from its office range. What happens to RDP from the office?',
    options: [
      'Blocked: the hierarchical policy is evaluated first, and its deny ends evaluation',
      'Allowed: priority 0 is the highest priority there is, so it beats priority 100',
      'Allowed: the office source range is more specific than 0.0.0.0/0, so it wins',
      'Blocked only while Firewall Rules Logging is enabled on the org policy rule'
    ],
    answer: 0,
    explanation: 'Hierarchical policies are evaluated before the network’s own rules, and an allow or deny there stops evaluation. Priorities only compare rules within one policy or level. To let lower levels decide, the org rule would need `goto_next`.'
  },
  {
    id: 'ace-t34-14',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'An allow rule at priority 1000 lets VMs tagged `web` reach VMs tagged `app` on tcp:8080. Everything else to the app tier on 8080 is stopped by the implied deny, and security wants those blocked attempts to appear in Firewall Rules Logging. What do you add?',
    options: [
      'Logging on the implied deny ingress rule',
      'A deny rule for tcp:8080 at priority 500 with `--enable-logging`',
      'A deny rule for tcp:8080 at priority 2000 with `--enable-logging`',
      'Firewall Insights for the project'
    ],
    answer: 2,
    explanation: 'Implied rules cannot be logged, so an explicit deny with logging is needed. It must sit below the allow rule (a higher number such as 2000) so web traffic is still allowed first. At 500 it would block the web VMs too. Firewall Insights analyses rules; it does not log connections. This is the `deny-app` rule from MD4-LAB01.'
  },

  // ── 8 · Shared VPC, peering and hybrid connectivity ──
  {
    id: 'ace-t34-15',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'VPC `hub` reaches the data centre over HA VPN. VPC `spoke` is peered with `hub`, and its VMs cannot reach on-premises. Peering is ACTIVE and firewall rules allow the traffic. What makes the path work?',
    options: [
      'Enable global dynamic routing in `spoke`, then create a second peering from `spoke` to `hub`',
      'Export and import custom routes over the peering, and advertise the spoke range on the hub’s Cloud Router',
      'Nothing: peering never carries traffic towards on-premises, so build a VPN from `spoke` too',
      'Give the spoke VMs external IPs and reach the data centre over the public internet instead'
    ],
    answer: 1,
    explanation: 'The routes to on-premises in `hub` are dynamic (custom) routes, which peering exchanges only when one side exports and the other imports them. On-premises also needs a route back, so the hub’s Cloud Router must advertise the spoke’s range with a custom advertisement. Peering is not transitive between VPCs, but this hub-and-spoke hybrid pattern is supported.'
  },
  {
    id: 'ace-t34-16',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'In a Shared VPC, a service project team has Compute Instance Admin in its own project. Creating a VM in the host project’s subnet `app-jkt` fails with a permission error. What is the least-privilege fix?',
    options: [
      'Grant the team Shared VPC Admin (`compute.xpnAdmin`) on the organization',
      'Grant the team Compute Network Admin on the host project',
      'Attach the host project to the service project as well',
      'Grant the team Compute Network User on the `app-jkt` subnet in the host project'
    ],
    answer: 3,
    explanation: 'Placing a resource in a shared subnet needs `compute.networkUser` on the host project or, more narrowly, on that one subnet. Shared VPC Admin is for enabling hosts and attaching projects, Network Admin can change the whole network, and a host project cannot also be a service project.'
  },

  // ── 9 · Cloud DNS and Cloud NAT ──
  {
    id: 'ace-t34-17',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Cloud NAT is configured on a Cloud Router in asia-southeast2. Private VMs in a new asia-southeast1 subnet of the same VPC cannot reach the internet. What do you do?',
    options: [
      'Create a Cloud Router and a Cloud NAT gateway in asia-southeast1',
      'Switch the VPC to global dynamic routing',
      'Add more NAT IP addresses to the asia-southeast2 gateway',
      'Enable Private Google Access on the asia-southeast1 subnet'
    ],
    answer: 0,
    explanation: 'Cloud NAT is regional: a gateway serves only subnets in its own region. Dynamic routing mode affects BGP routes, not NAT, more IPs do not extend the region, and Private Google Access reaches Google APIs, not the internet.'
  },
  {
    id: 'ace-t34-18',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'A Cloud DNS forwarding zone sends `corp.example.com` queries to the on-premises resolver `192.168.10.53` over HA VPN. Queries time out. The on-premises firewall shows them arriving from `35.199.192.0/19`, but no replies get back. What is missing?',
    options: [
      'An inbound DNS server policy on the VPC, so on-premises can reach Cloud DNS',
      'DNSSEC on the forwarding zone, so the on-premises resolver trusts the replies',
      'A Cloud Router custom advertisement of `35.199.192.0/19`, so replies route back',
      'A Cloud NAT gateway, so the queries leave with a public source address'
    ],
    answer: 2,
    explanation: 'Forwarded queries come from Cloud DNS’s range `35.199.192.0/19`, and on-premises needs a route for it back through the tunnel. Cloud Router does not announce that range by default, so add it as a custom advertisement. An inbound policy is for the other direction (on-premises asking Google Cloud).'
  },

  // ── 10 · Load balancing, CDN and tiers ──
  {
    id: 'ace-t34-19',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'A regional internal Application Load Balancer fronts the app MIG. The proxy-only subnet is `10.129.0.0/23`. `get-health` shows every backend HEALTHY, yet clients get 502 errors. The only ingress rule on the backends allows `130.211.0.0/22` and `35.191.0.0/16`. What do you fix?',
    options: [
      'Change the balancing mode from UTILIZATION to RATE',
      'Recreate the load balancer with the `EXTERNAL_MANAGED` scheme',
      'Move the backends into the proxy-only subnet',
      'Allow ingress from `10.129.0.0/23` on the backend port'
    ],
    answer: 3,
    explanation: 'Health checks come from Google’s probe ranges, which are allowed, so the backends look healthy. Real traffic to an Envoy-based regional load balancer comes from the proxies in the proxy-only subnet, which the firewall blocks. Proxy-only subnets cannot hold VMs, and the scheme of an internal ALB is `INTERNAL_MANAGED`.'
  },
  {
    id: 'ace-t34-20',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'To save money, a project’s default network tier was set to Standard. The company now needs a public HTTPS site for users in Asia and Europe, with one IP address and Cloud CDN. What do you do?',
    options: [
      'Use a regional external Application Load Balancer in Standard Tier and enable Cloud CDN on it',
      'Keep the Standard default and build a global external Application LB on a Premium global IP',
      'Move the whole project back to Premium, because a tier cannot be chosen for a single resource',
      'Use two regional load balancers in Standard Tier, one per continent, behind DNS round robin'
    ],
    answer: 1,
    explanation: 'The project default is only a default: the global static IP and the global external Application Load Balancer use Premium Tier regardless, and Cloud CDN needs that load balancer. A regional Standard Tier design has no single anycast IP or CDN, and two regional IPs are not one address.'
  }
];
