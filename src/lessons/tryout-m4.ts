/**
 * Tryout prep for course Module 4, sessions 13–17 (exam guide 2.3 and 3.3):
 * custom mode VPCs and subnets, IP addresses and routes, VPC firewall rules
 * and Cloud NGFW policies with secure tags, Shared VPC and peering; hybrid
 * connectivity, Cloud DNS, Cloud NAT and Network Service Tiers; choosing and
 * building load balancers with Cloud CDN and Cloud Armor — plus both labs and
 * a check before the module try-out (M4 · Set 1–5 in exams/ace/sets.ts). The
 * subnet calculator, the firewall exercise and the load balancer picker are
 * the interactive blocks the VPC and load balancing deep dives use. Checked
 * against the Google Cloud docs in October 2026.
 */
import type { Lesson } from '@/types';

const SA_WEB = 'web-sa@ace-lab-123.iam.gserviceaccount.com';
const SA_APP = 'app-sa@ace-lab-123.iam.gserviceaccount.com';
const SA_DB = 'db-sa@ace-lab-123.iam.gserviceaccount.com';

export const lesson: Lesson = {
  id: 'tryout-m4',
  lang: 'en',
  title: 'Tryout Prep · Module 4: Cloud Networking',
  intro:
    'Module 4 is the networking part of exam guide Sections 2 and 3, and it is where small details decide the answer: a range, a priority, a tier, the name of a load balancer. This lesson follows sessions 13 to 17 of the course. It starts with custom mode VPCs, subnets, addresses and routes. Then firewall rules and Cloud NGFW policies with secure tags, and Shared VPC against peering. Then hybrid connectivity, Cloud DNS, Cloud NAT and the network tiers, and finally load balancers with Cloud CDN and Cloud Armor. Three interactive blocks let you practise: a subnet calculator, a firewall exercise that tells you which rule decided, and a picker that names the right load balancer. Then sit M4 · Set 1 to 5: 20 questions, 24 minutes each.',
  parts: [
    {
      id: 's13',
      title: 'Session 13 · VPC fundamentals, network security, Shared VPC and peering',
      sections: [
        {
          id: 's13-vpc',
          title: 'S13-01 · Custom mode VPCs and subnets (including resizing)',
          blocks: [
            {
              kind: 'list',
              items: [
                'A **VPC network** is **global**: one network can have subnets in every region. **Subnets** are **regional**, and their VMs in any zone of that region share the range.',
                '**Auto mode** creates one `/20` subnet per region from `10.128.0.0/9`, so ranges overlap with every other auto mode network. **Custom mode** creates only the subnets you define, and is the right choice for production, peering and hybrid. Auto mode can be converted to custom, but not back.',
                'Every primary range loses **four addresses**: the network address, the default gateway (the second), the second-to-last, and the broadcast address.',
                'A subnet can be **expanded** in place with no downtime (`expand-ip-range`) if the bigger range overlaps nothing. It can **never be shrunk**. **Secondary ranges** give alias IPs, for example GKE Pods and Services.',
                '**Private Google Access** (per subnet) lets VMs with only internal IPs reach Google APIs such as Cloud Storage and BigQuery.',
                'The default **MTU** is 1460 bytes and can be raised up to 8896. Plan ranges that do not overlap on-premises or peered networks, because overlap blocks peering and VPN routing.'
              ]
            },
            {
              kind: 'code',
              title: 'A custom VPC with a tier per subnet',
              lines: [
                '$ gcloud compute networks create prod-vpc --subnet-mode=custom --bgp-routing-mode=global',
                '$ gcloud compute networks subnets create web-jkt --network=prod-vpc --region=asia-southeast2 \\',
                '    --range=10.20.1.0/24 --enable-private-ip-google-access',
                '$ gcloud compute networks subnets create app-jkt --network=prod-vpc --region=asia-southeast2 \\',
                '    --range=10.20.2.0/24 --secondary-range=pods=10.64.0.0/14,services=10.68.0.0/20',
                '$ gcloud compute networks subnets create db-jkt --network=prod-vpc --region=asia-southeast2 --range=10.20.3.0/24',
                '# Running out of addresses: grow web-jkt from /24 to /23 (a /22 would overlap app-jkt and db-jkt)',
                '$ gcloud compute networks subnets expand-ip-range web-jkt --region=asia-southeast2 --prefix-length=23'
              ]
            },
            {
              kind: 'p',
              text: 'Check a plan before you type it. Here, growing `web-jkt` (10.20.1.0/24) to /23 would cover 10.20.0.0–10.20.1.255, which is free, but /22 would swallow `app-jkt` and `db-jkt`, so it would fail. Try a few ranges.'
            },
            { kind: 'cidr', value: '10.20.0.0/23', note: 'Try 10.20.1.0/24 (one tier), 10.20.0.0/22 (overlaps app and db), 10.20.4.0/22 (a free block for growth) or 10.20.3.0/29.' },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Subnet is running out of IPs" → expand its range (it only grows). "Peering fails" → overlapping ranges, which is why custom mode is used. "VMs without external IPs must read Cloud Storage" → Private Google Access on the subnet. "How many usable addresses in a /29?" → 8 − 4 = 4.'
            },
            {
              kind: 'quiz',
              q: 'How many addresses can VMs use in a subnet with primary range `10.20.5.0/28`?',
              options: ['16', '14', '12', '8'],
              answer: 2,
              explain: 'A /28 has 16 addresses, and Google reserves four in every primary range: network, gateway, second-to-last and broadcast. That leaves 12.'
            }
          ]
        },
        {
          id: 's13-ips-routes',
          title: 'S13-02 · Static IP addresses and custom static routes',
          blocks: [
            {
              kind: 'table',
              caption: 'Addresses',
              columns: ['Kind', 'Scope', 'Notes'],
              rows: [
                ['Internal, ephemeral', 'Subnet', 'Assigned automatically; may change if the VM is recreated'],
                ['Internal, static', 'Subnet', 'Reserve a fixed address, for example for a database VM or an internal load balancer'],
                ['External, regional', 'Region', 'For VMs and regional load balancers'],
                ['External, global', 'Global', 'Only for global external load balancers (anycast)'],
                ['Ephemeral → static', 'Same address', '**Promote** the address in use so it survives VM deletion']
              ]
            },
            {
              kind: 'code',
              title: 'Reserve and promote',
              lines: [
                '$ gcloud compute addresses create db-ip --region=asia-southeast2 --subnet=db-jkt --addresses=10.20.3.10',
                '$ gcloud compute addresses create web-ip --region=asia-southeast2',
                '$ gcloud compute addresses create lb-ip --global',
                '# promote the ephemeral external IP 34.101.20.30 that a VM already uses',
                '$ gcloud compute addresses create keep-me --region=asia-southeast2 --addresses=34.101.20.30',
                '$ gcloud compute addresses list'
              ]
            },
            {
              kind: 'list',
              items: [
                'External IPv4 addresses are billed, and a reserved address that is **not attached** to anything is still billed. Release what you do not use.',
                'Every network has **system routes**: one per subnet (to reach it) and a **default route** `0.0.0.0/0` to the default internet gateway. Deleting the default route cuts internet egress.',
                'A **custom static route** sends a destination range to a next hop you choose: a VM (such as a firewall appliance), an **internal passthrough Network Load Balancer**, a VPN tunnel, an IP, or the internet gateway. It can be limited to VMs with certain **network tags**.',
                '**Dynamic routes** are learned over BGP by **Cloud Router** from VPN or Interconnect peers. With `regional` routing mode they reach only that region, and with `global` mode every region.',
                '**Route selection**: the **most specific** prefix wins first. Between equal prefixes, the **lowest priority number** wins, and equal routes share traffic (ECMP). **Policy-based routes** can steer by source or protocol, for example to an inspection appliance.'
              ]
            },
            {
              kind: 'code',
              title: 'Custom static routes',
              lines: [
                '# Send internet-bound traffic of tagged VMs through a firewall appliance behind an internal LB',
                '$ gcloud compute routes create to-inspect --network=prod-vpc --destination-range=0.0.0.0/0 \\',
                '    --next-hop-ilb=fw-ilb --next-hop-ilb-region=asia-southeast2 --priority=800 --tags=inspected',
                '# Reach an on-premises range through a Classic VPN tunnel (HA VPN uses BGP instead)',
                '$ gcloud compute routes create to-office --network=prod-vpc --destination-range=192.168.10.0/24 \\',
                '    --next-hop-vpn-tunnel=office-tunnel --next-hop-vpn-tunnel-region=asia-southeast2',
                '$ gcloud compute routes list --filter="network:prod-vpc" --sort-by=priority'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"The address must not change when the VM is recreated" → reserve (or promote to) a static IP. "Global load balancer address" → a global static external IP. "All egress through an inspection appliance" → a custom route to the appliance (or an internal passthrough load balancer in front of several). "Traffic takes the wrong path" → the more specific route wins before priority.'
            },
            {
              kind: 'quiz',
              q: 'A VPC has a route to `10.0.0.0/8` with priority 100 and a route to `10.1.2.0/24` with priority 1000. Which route carries traffic to `10.1.2.7`?',
              options: ['The /8 route, because its priority number is lower', 'The /24 route, because the most specific prefix wins first', 'Both, with ECMP', 'Neither: the system default route is used'],
              answer: 1,
              explain: 'Google Cloud picks the longest matching prefix first. Priority only decides between routes with the same prefix length.'
            }
          ]
        },
        {
          id: 's13-firewall',
          title: 'S13-03 · VPC firewall rules and Cloud NGFW policies: attributes, secure tags, service accounts',
          blocks: [
            {
              kind: 'table',
              caption: 'Every VPC firewall rule has',
              columns: ['Attribute', 'Values'],
              rows: [
                ['Direction', '`INGRESS` (filter by source) or `EGRESS` (filter by destination)'],
                ['Action', '`allow` or `deny`'],
                ['Priority', '0–65535, **lower number wins**, default 1000. At a tie, **deny wins**'],
                ['Targets', 'All instances, VMs with a **network tag**, or VMs running as a **service account**'],
                ['Source / destination', 'IP ranges; for ingress also source tags or source service accounts (VMs in the same VPC)'],
                ['Protocols and ports', '`tcp:80`, `tcp:8000-8100`, `udp:53`, `icmp`, or all'],
                ['Enforcement and logging', 'Enabled or disabled; Firewall Rules Logging on or off']
              ]
            },
            {
              kind: 'list',
              items: [
                'Rules are **stateful**: if a connection is allowed in, its replies are allowed out, and the other way round.',
                'With no matching rule, the **implied rules** at priority 65535 deny all ingress and allow all egress.',
                'The `default` network adds `default-allow-internal`, `-ssh`, `-rdp` and `-icmp` at 65534. They are convenient but permissive.',
                'A rule **cannot mix** tags and service accounts. Source tags and source service accounts match only VMs’ internal IPs in the same VPC.'
              ]
            },
            {
              kind: 'p',
              text: '**Cloud NGFW** (Cloud Next Generation Firewall) is the name for the whole firewall service. It covers VPC firewall rules and **firewall policies**. **Hierarchical firewall policies** sit on the organization or a folder. **Global and regional network firewall policies** attach to a VPC. Policies can use **secure tags**, address groups and, in the higher tiers, FQDN objects, geolocation, threat intelligence (**Standard** tier) and intrusion prevention with TLS inspection (**Enterprise** tier). **Essentials** covers the basics. Rule actions in policies are `allow`, `deny`, `goto_next` (hand the decision down) and `apply_security_profile_group` (send to inspection).'
            },
            {
              kind: 'steps',
              items: [
                { title: 'Hierarchical firewall policies (organization, then folders)', text: 'Always evaluated first. At most one rule matches per policy. A deny here cannot be opened below.' },
                { title: 'VPC firewall rules', text: 'By default (`AFTER_CLASSIC_FIREWALL`) the network’s own rules come next.' },
                { title: 'Global, then regional network firewall policies', text: 'After the VPC rules by default. Set the enforcement order to `BEFORE_CLASSIC_FIREWALL` to evaluate them before.' },
                { title: 'Implied rules', text: 'Deny ingress, allow egress.' }
              ]
            },
            {
              kind: 'table',
              caption: 'What a rule can target',
              columns: ['', 'Network tag', 'Service account', 'Secure tag'],
              rows: [
                ['Used in', 'VPC firewall rules', 'VPC firewall rules and policies', 'Network and hierarchical firewall policies'],
                ['Who can change which VMs it covers', 'Anyone who can edit the VM', 'Only those with Service Account User on it; the VM must be stopped', 'Only those granted **Tag User** on the tag value (IAM)'],
                ['Strength', 'Weak: a free-form label', 'Strong: tied to identity', 'Strong and central'],
                ['Typical', 'Labs, small teams', 'Workload identity-based rules', 'Organisations separating security from app teams']
              ]
            },
            {
              kind: 'code',
              title: 'A VPC rule, then a network firewall policy with secure tags',
              lines: [
                '$ gcloud compute firewall-rules create allow-web --network=prod-vpc --direction=INGRESS --priority=1000 \\',
                '    --action=ALLOW --rules=tcp:80,tcp:443 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=web --enable-logging',
                '# A secure tag key for this VPC, with values web, app, db',
                '$ gcloud resource-manager tags keys create tier --parent=organizations/123456789012 \\',
                '    --purpose=GCE_FIREWALL --purpose-data=network=ace-lab-123/prod-vpc',
                '$ gcloud resource-manager tags values create web --parent=123456789012/tier',
                '$ gcloud compute network-firewall-policies create prod-policy --global',
                '$ gcloud compute network-firewall-policies rules create 1000 --firewall-policy=prod-policy \\',
                '    --global-firewall-policy --direction=INGRESS --action=allow --layer4-configs=tcp:8080 \\',
                '    --src-secure-tags=tagValues/281480000000001 --target-secure-tags=tagValues/281480000000002',
                '$ gcloud compute network-firewall-policies associations create --firewall-policy=prod-policy \\',
                '    --network=prod-vpc --global-firewall-policy',
                '# Bind the tag value to a VM (needs Tag User on the value)',
                '$ gcloud resource-manager tags bindings create --tag-value=tagValues/281480000000002 \\',
                '    --parent=//compute.googleapis.com/projects/ace-lab-123/zones/asia-southeast2-a/instances/INSTANCE_ID \\',
                '    --location=asia-southeast2-a'
              ]
            },
            {
              kind: 'firewall',
              title: 'Exercise: three tiers, private egress',
              vms: [
                { name: 'web-1', ip: '10.20.1.2', tags: ['web'], sa: SA_WEB },
                { name: 'app-1', ip: '10.20.2.2', tags: ['app'], sa: SA_APP },
                { name: 'db-1', ip: '10.20.3.2', tags: ['db'], sa: SA_DB }
              ],
              rules: [
                { name: 'allow-lb-web', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:80', sources: ['130.211.0.0/22', '35.191.0.0/16'], targetTags: ['web'] },
                { name: 'allow-web-app', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:8080', sourceTags: ['web'], targetTags: ['app'] },
                { name: 'allow-app-db', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:5432', sourceTags: ['app'], targetTags: ['db'] },
                { name: 'allow-iap-ssh', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:22', sources: ['35.235.240.0/20'] },
                { name: 'allow-db-google', direction: 'EGRESS', priority: 900, action: 'allow', ports: 'tcp:443', destinations: ['199.36.153.8/30'], targetTags: ['db'] },
                { name: 'deny-db-egress', direction: 'EGRESS', priority: 1000, action: 'deny', ports: 'all', destinations: ['0.0.0.0/0'], targetTags: ['db'] }
              ],
              packets: [
                { direction: 'INGRESS', peer: '35.191.20.7', vm: 'web-1', proto: 'tcp', port: 80, expect: 'allow' },
                { direction: 'INGRESS', peer: '203.0.113.50', vm: 'web-1', proto: 'tcp', port: 80, expect: 'deny' },
                { direction: 'INGRESS', peer: 'web-1', vm: 'app-1', proto: 'tcp', port: 8080, expect: 'allow' },
                { direction: 'INGRESS', peer: 'web-1', vm: 'db-1', proto: 'tcp', port: 5432, expect: 'deny' },
                { direction: 'INGRESS', peer: 'app-1', vm: 'db-1', proto: 'tcp', port: 5432, expect: 'allow' },
                { direction: 'INGRESS', peer: '35.235.241.10', vm: 'db-1', proto: 'tcp', port: 22, expect: 'allow' },
                { direction: 'EGRESS', peer: '151.101.1.69', vm: 'db-1', proto: 'tcp', port: 443, expect: 'deny' },
                { direction: 'EGRESS', peer: '199.36.153.9', vm: 'db-1', proto: 'tcp', port: 443, expect: 'allow' },
                { direction: 'EGRESS', peer: '151.101.1.69', vm: 'web-1', proto: 'tcp', port: 443, expect: 'allow' }
              ],
              after: 'The second row is the classic one: users reach `web-1` through the load balancer, so only the Google ranges are allowed in. Rows 7 and 8 show a closed internet exit that still lets the database reach Google APIs through `private.googleapis.com`, because priority 900 beats 1000. The last row has no egress rule for `web-1` at all, so the implied allow egress applies.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Only the security team may decide which VMs a rule applies to" → secure tags or service accounts, not network tags. "Block RDP from the internet for every project, no exceptions" → a hierarchical firewall policy deny at the organization. "Allow FQDN `api.partner.com`" → a network firewall policy (Standard tier). "Detect and block exploits" → Enterprise tier intrusion prevention. "Is my rule being hit?" → Firewall Rules Logging.'
            },
            {
              kind: 'quiz',
              q: 'Two VPC firewall rules match the same ingress packet, both at priority 1000: one allows, one denies. What happens?',
              options: ['It is allowed, because allow rules are evaluated first', 'It is denied, because deny wins a tie', 'The rule created first wins', 'Both apply and the packet is logged'],
              answer: 1,
              explain: 'At equal priority, deny takes precedence over allow.'
            }
          ]
        },
        {
          id: 's13-sharedvpc',
          title: 'S13-04 · Shared VPC and VPC Network Peering',
          blocks: [
            {
              kind: 'table',
              caption: 'Connecting VPCs and projects',
              columns: ['', 'Shared VPC', 'VPC Network Peering', 'Network Connectivity Center (VPC spokes)'],
              rows: [
                ['What', 'One VPC in a **host project**, used by **service projects**', 'Two VPCs exchange subnet routes privately', 'A hub that connects many VPCs (mesh or star)'],
                ['Organisation', 'Same organization only', 'Same or different organizations', 'Spokes in the hub’s project or in other projects'],
                ['Who runs the network', 'The central network team (host project)', 'Each side keeps its own network and firewall rules', 'A central hub team'],
                ['Transitive', 'Not applicable: it is one network', '**No**. A–B and B–C does not give A–C', '**Yes**, between spokes'],
                ['Typical', 'Company-wide network with central control', 'Two teams, two companies, or a SaaS producer', 'Many VPCs that must all reach each other']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Shared VPC roles**: the **Shared VPC Admin** (`roles/compute.xpnAdmin`, granted at the organization or folder) enables the host and attaches service projects. Service project admins get **Compute Network User** (`roles/compute.networkUser`) on the host project or on **specific subnets** to place resources there. Firewall rules and routes live in the host project.',
                '**Peering rules**: ranges must not overlap. Each side must create its half of the peering. Firewall rules are not shared. Custom routes are exchanged only when exported and imported. It is not transitive.'
              ]
            },
            {
              kind: 'code',
              title: 'Shared VPC and peering',
              lines: [
                '$ gcloud compute shared-vpc enable net-host-123',
                '$ gcloud compute shared-vpc associated-projects add shop-prod-123 --host-project=net-host-123',
                '$ gcloud compute networks subnets add-iam-policy-binding web-jkt --project=net-host-123 \\',
                '    --region=asia-southeast2 --member=group:shop-devs@example.com --role=roles/compute.networkUser',
                '# Peering needs both halves',
                '$ gcloud compute networks peerings create a-to-b --network=vpc-a --peer-project=proj-b --peer-network=vpc-b',
                '$ gcloud compute networks peerings create b-to-a --project=proj-b --network=vpc-b --peer-project=proj-a --peer-network=vpc-a'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Central network team, many project teams, one organization" → Shared VPC. "Connect to a partner company’s VPC privately" → VPC Network Peering. "A peers with B, B peers with C, A cannot reach C" → peering is not transitive (peer A with C, or use NCC). "Developers may use only the web subnet of the host project" → Network User on that subnet.'
            },
            {
              kind: 'quiz',
              q: 'Teams in 20 service projects must deploy VMs into subnets managed centrally by the network team, all in one organization. What do you set up?',
              options: ['20 VPC peerings to a central VPC', 'Shared VPC with a host project and the 20 service projects attached', 'Cloud VPN between each project', 'A separate auto mode network in each project'],
              answer: 1,
              explain: 'Shared VPC is built for central network control inside one organization. Peering 20 times is harder to manage and gives no central control.'
            }
          ]
        }
      ]
    },
    {
      id: 's14',
      title: 'Session 14 · Lab: build and test a network',
      sections: [
        {
          id: 's14-lab',
          title: 'VPCs, VMs across subnets, firewall rules, connectivity checks',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Two custom networks, two regions', text: 'Plan the ranges first; none may overlap.', code: ['gcloud compute networks create lab-a --subnet-mode=custom', 'gcloud compute networks subnets create a-jkt --network=lab-a --region=asia-southeast2 --range=10.30.1.0/24', 'gcloud compute networks subnets create a-sin --network=lab-a --region=asia-southeast1 --range=10.30.2.0/24'] },
                { title: 'VMs with no external IPs', text: 'One per subnet, tagged by role.', code: ['gcloud compute instances create a1 --zone=asia-southeast2-a --subnet=a-jkt --no-address --tags=lab', 'gcloud compute instances create a2 --zone=asia-southeast1-b --subnet=a-sin --no-address --tags=lab'] },
                { title: 'Minimal firewall rules', text: 'SSH through IAP and ICMP between the lab VMs only.', code: ['gcloud compute firewall-rules create lab-iap --network=lab-a --allow=tcp:22 --source-ranges=35.235.240.0/20 --target-tags=lab', 'gcloud compute firewall-rules create lab-icmp --network=lab-a --allow=icmp --source-tags=lab --target-tags=lab'] },
                { title: 'Test from inside, then explain the result', text: 'Ping across regions (one global VPC, so it works), then check a path with Connectivity Tests.', code: ['gcloud compute ssh a1 --zone=asia-southeast2-a --tunnel-through-iap --command="ping -c 3 10.30.2.2"', 'gcloud network-management connectivity-tests create a1-to-a2 --source-instance=projects/ace-lab-123/zones/asia-southeast2-a/instances/a1 --destination-instance=projects/ace-lab-123/zones/asia-southeast1-b/instances/a2 --protocol=ICMP'] },
                { title: 'Break it on purpose', text: 'Disable the ICMP rule, rerun the test, and read which rule now blocks the traffic.', code: ['gcloud compute firewall-rules update lab-icmp --disabled'] }
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: '**Connectivity Tests** (Network Intelligence Center) simulate a packet through routes and firewall rules and name the rule or route that drops it. It is the quickest answer to "why can’t A reach B?".'
            }
          ]
        }
      ]
    },
    {
      id: 's15',
      title: 'Session 15 · Hybrid connectivity and network services: VPN, Interconnect, DNS, NAT',
      sections: [
        {
          id: 's15-hybrid',
          title: 'S15-01 · Cloud VPN, Cloud Interconnect and peering compared',
          blocks: [
            {
              kind: 'table',
              caption: 'Hybrid and multi-cloud connectivity',
              columns: ['Option', 'Path and bandwidth', 'SLA', 'Pick when'],
              rows: [
                ['**HA VPN**', 'IPsec over the internet, about 3 Gbps per tunnel (add tunnels to scale); BGP through Cloud Router', '**99.99%** with two tunnels to a redundant peer', 'Quick, encrypted, modest bandwidth'],
                ['Classic VPN', 'One interface, static routing; dynamic routing is deprecated', '99.9%', 'Legacy only. New answers use HA VPN'],
                ['**Dedicated Interconnect**', 'Your own 10- or 100-Gbps circuits in a colocation facility', '99.9% or 99.99% depending on topology', 'High bandwidth, private, you can reach a Google facility'],
                ['**Partner Interconnect**', 'Through a service provider, 50 Mbps to 50 Gbps per attachment', '99.9% or 99.99% depending on topology', 'Private links without reaching a Google facility, or smaller bandwidth'],
                ['**Cross-Cloud Interconnect**', 'Dedicated links between Google Cloud and AWS, Azure, Oracle or Alibaba Cloud', '99.9% or 99.99%', 'Multi-cloud with high bandwidth'],
                ['Direct / Carrier Peering', 'To Google’s public edge (Workspace, public APIs), not into a VPC', 'None', 'Cheaper egress to Google public services only'],
                ['VPC Network Peering', 'Between VPCs inside Google Cloud', '—', 'Not hybrid at all: cloud to cloud']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Cloud Router** runs BGP for HA VPN and Interconnect and advertises your subnets. Use a private ASN (64512–65534 or 4200000000–4294967294). With **global** dynamic routing, routes learned in one region reach every region.',
                '**Interconnect traffic is not encrypted** by default. Add **MACsec** for Cloud Interconnect, or run **HA VPN over Cloud Interconnect**.',
                '**99.99% topologies** need redundancy everywhere: HA VPN with two tunnels and a redundant peer, or Interconnect with connections in two metros (and two edge availability domains in each).'
              ]
            },
            {
              kind: 'code',
              title: 'HA VPN, in outline',
              lines: [
                '$ gcloud compute vpn-gateways create ha-gw --network=prod-vpc --region=asia-southeast2',
                '$ gcloud compute routers create vpn-router --network=prod-vpc --region=asia-southeast2 --asn=65001',
                '$ gcloud compute external-vpn-gateways create office-gw --interfaces=0=203.0.113.10,1=203.0.113.11',
                '# two tunnels (gateway interfaces 0 and 1), each with its own BGP session on the router',
                '$ gcloud compute routers add-bgp-peer vpn-router --region=asia-southeast2 --peer-name=office-0 \\',
                '    --interface=if-tunnel-0 --peer-ip-address=169.254.0.2 --peer-asn=65002',
                '$ gcloud compute routers get-status vpn-router --region=asia-southeast2'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Encrypted connection to the office this week, a few Gbps" → HA VPN. "10 Gbps+, private, consistent latency, near a colocation facility" → Dedicated Interconnect. "Not near a Google facility" → Partner Interconnect. "Encrypt Interconnect traffic" → MACsec or HA VPN over Interconnect. "Connect to AWS at high bandwidth" → Cross-Cloud Interconnect. "99.99% VPN" → HA VPN, never Classic VPN.'
            },
            {
              kind: 'quiz',
              q: 'A company needs a private 20 Gbps link to Google Cloud, but its data centre is far from any Google colocation facility. What should it use?',
              options: ['Dedicated Interconnect', 'Partner Interconnect through a provider that reaches them', 'Classic VPN', 'Direct Peering'],
              answer: 1,
              explain: 'Partner Interconnect reaches Google through a service provider’s network, so you do not need to be in a Google facility. Direct Peering does not reach VPCs.'
            }
          ]
        },
        {
          id: 's15-dns-nat',
          title: 'S15-02 · Cloud DNS zones and records, Cloud NAT for private instances',
          blocks: [
            {
              kind: 'table',
              caption: 'Cloud DNS zone types',
              columns: ['Zone', 'Who can resolve it', 'Use'],
              rows: [
                ['Public', 'The whole internet', 'Your domain’s records (`www`, `MX`); DNSSEC available'],
                ['Private', 'Only the VPC networks you authorise', 'Internal names such as `db.corp.internal`'],
                ['Forwarding', 'VPCs; queries are forwarded to target name servers', 'Resolve on-premises names from Google Cloud'],
                ['Peering', 'One VPC uses another VPC’s DNS view', 'Shared VPC or hub-and-spoke DNS'],
                ['Response policy', 'Overrides answers for chosen names', 'Block or redirect names, private API endpoints']
              ]
            },
            {
              kind: 'list',
              items: [
                'For **on-premises → Google Cloud** resolution, create an **inbound server policy**: Cloud DNS gets an address in your subnet that on-premises resolvers forward to. For **Google Cloud → on-premises**, use a **forwarding zone**.',
                'VMs get internal names automatically, `VM.ZONE.c.PROJECT.internal` (zonal DNS). Cloud DNS has a 100% availability SLA.'
              ]
            },
            {
              kind: 'code',
              title: 'Zones and records',
              lines: [
                '$ gcloud dns managed-zones create corp-internal --dns-name=corp.internal. --visibility=private \\',
                '    --networks=prod-vpc --description="internal names"',
                '$ gcloud dns record-sets create db.corp.internal. --zone=corp-internal --type=A --ttl=300 --rrdatas=10.20.3.10',
                '$ gcloud dns managed-zones create office --dns-name=office.example.com. --visibility=private \\',
                '    --networks=prod-vpc --forwarding-targets=192.168.10.53 --description="to on-prem DNS"',
                '$ gcloud dns policies create inbound --networks=prod-vpc --enable-inbound-forwarding --description="on-prem queries"',
                '$ gcloud dns managed-zones create shop-public --dns-name=shop.example.com. --dnssec-state=on --description="public"'
              ]
            },
            {
              kind: 'p',
              text: '**Cloud NAT** gives resources **without external IPs** outbound connections to the internet. These include VMs, GKE private nodes, and Cloud Run with Direct VPC egress. It is **regional** and configured on a **Cloud Router**, which here only holds configuration and is not in the data path. It never allows **inbound** connections. NAT IPs are **automatic**, or **manual** (reserved static IPs) when a partner must allowlist your addresses. Each VM gets a share of ports (64 by default, or dynamic port allocation). Running out shows as dropped connections in the **NAT logs**. **Private NAT** translates between private networks with overlapping ranges.'
            },
            {
              kind: 'code',
              title: 'Cloud NAT',
              lines: [
                '$ gcloud compute routers create nat-router --network=prod-vpc --region=asia-southeast2',
                '$ gcloud compute routers nats create prod-nat --router=nat-router --region=asia-southeast2 \\',
                '    --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges --enable-logging',
                '# partner allowlisting: fixed NAT addresses',
                '$ gcloud compute addresses create nat-ip-1 nat-ip-2 --region=asia-southeast2',
                '$ gcloud compute routers nats update prod-nat --router=nat-router --region=asia-southeast2 \\',
                '    --nat-external-ip-pool=nat-ip-1,nat-ip-2 --enable-dynamic-port-allocation --min-ports-per-vm=128'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"VMs without public IPs must download OS updates" → Cloud NAT. "Partner allowlists our outbound IP" → Cloud NAT with manual static IPs. "Reach Google APIs from private VMs, no internet" → Private Google Access, not NAT. "Names only our VPC can resolve" → a private zone. "Resolve on-premises names from the VPC" → a forwarding zone. "On-premises must resolve our private zone" → an inbound server policy.'
            },
            {
              kind: 'quiz',
              q: 'A private VM (no external IP) must call an external SaaS API that only accepts calls from two known IP addresses. What should you configure?',
              options: ['Private Google Access', 'Cloud NAT with two reserved static IPs as manual NAT addresses', 'An external IP on the VM', 'A forwarding DNS zone'],
              answer: 1,
              explain: 'Manual NAT IPs give the private VMs fixed, known source addresses for the partner to allowlist, with no inbound exposure.'
            }
          ]
        },
        {
          id: 's15-tiers',
          title: 'S15-03 · Network Service Tiers: Premium vs Standard',
          blocks: [
            {
              kind: 'table',
              columns: ['', 'Premium Tier (default)', 'Standard Tier'],
              rows: [
                ['Path', 'Google’s backbone as far as possible, entering and leaving at the edge nearest the user', 'The public internet, handed off in the region'],
                ['Performance', 'Lower latency, more consistent', 'Comparable to other clouds; varies with the internet'],
                ['Price', 'Higher egress', 'Lower egress'],
                ['Load balancers', 'Global and regional; **global anycast IPs**', 'Regional only'],
                ['Set', 'Per project default, or per resource', '`--network-tier=STANDARD` on the IP or forwarding rule']
              ]
            },
            {
              kind: 'code',
              lines: [
                '$ gcloud compute project-info update --default-network-tier=STANDARD',
                '$ gcloud compute addresses create web-std --region=asia-southeast2 --network-tier=STANDARD'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Lower cost, latency not critical, users in one region" → Standard Tier. "Global load balancer, one anycast IP worldwide, Cloud CDN" → Premium Tier (the only one that supports them).'
            },
            {
              kind: 'quiz',
              q: 'Which feature requires Premium Tier?',
              options: ['A regional external Application Load Balancer', 'A global external Application Load Balancer with one anycast IP', 'Cloud NAT', 'A VM with an ephemeral external IP'],
              answer: 1,
              explain: 'Global load balancing and global anycast IPs depend on Google’s backbone, so they need Premium. Standard works only with regional resources.'
            }
          ]
        }
      ]
    },
    {
      id: 's16',
      title: 'Session 16 · Load balancing on Google Cloud',
      sections: [
        {
          id: 's16-choose',
          title: 'S16-01 · Load balancer taxonomy and selection',
          blocks: [
            {
              kind: 'list',
              ordered: true,
              items: [
                '**HTTP(S)?** Use an **Application Load Balancer** (L7, proxy, URL maps). Other TCP → a **proxy Network Load Balancer**. UDP or other protocols, or the backend must see the client IP → a **passthrough Network Load Balancer**.',
                '**From the internet or inside the VPC?** External or internal.',
                '**Users or backends in several regions?** Global (or cross-region internal). One region → regional.'
              ]
            },
            {
              kind: 'table',
              caption: 'Today’s names',
              columns: ['Family', 'Modes', 'Scheme'],
              rows: [
                ['Application Load Balancer (HTTP/HTTPS)', 'Global external, classic, regional external, regional internal, cross-region internal', '`EXTERNAL_MANAGED`, `EXTERNAL` (classic), `INTERNAL_MANAGED`'],
                ['Proxy Network Load Balancer (TCP, optional TLS offload)', 'Global external, classic, regional external, regional internal, cross-region internal', '`EXTERNAL_MANAGED`, `EXTERNAL` (classic), `INTERNAL_MANAGED`'],
                ['Passthrough Network Load Balancer (TCP, UDP, ESP, ICMP…)', 'Regional external, internal (and a global external mode in preview)', '`EXTERNAL`, `INTERNAL`']
              ]
            },
            { kind: 'lbpicker', title: 'Which load balancer?' },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Global HTTPS site, one IP, path-based routing, Cloud CDN, Cloud Armor" → global external Application Load Balancer. "Internal HTTP between microservices in one region" → regional internal Application Load Balancer. "UDP game servers keep the client IP" → external passthrough Network Load Balancer. "Next hop for an appliance route" → internal passthrough Network Load Balancer. Old names (HTTP(S) LB, TCP proxy, Network LB) still appear in older questions.'
            },
            {
              kind: 'quiz',
              q: 'An internal service in one region speaks gRPC over HTTP/2 and needs path-based routing between versions. Which load balancer?',
              options: ['Internal passthrough Network Load Balancer', 'Regional internal Application Load Balancer', 'Global external Application Load Balancer', 'Regional external proxy Network Load Balancer'],
              answer: 1,
              explain: 'Internal + HTTP-based + one region + URL routing points to the regional internal Application Load Balancer.'
            }
          ]
        },
        {
          id: 's16-build',
          title: 'S16-02 · Backend services, health checks and MIG backends',
          blocks: [
            {
              kind: 'p',
              text: 'The parts of an Application Load Balancer, front to back: a **forwarding rule** (IP and port) → a **target proxy** (HTTP or HTTPS, holding the certificate) → a **URL map** (host and path rules) → **backend services** (balancing mode, health check, session affinity, Cloud CDN, Cloud Armor) → **backends**. Backends are **instance groups** (MIGs, with a **named port**) or **NEGs**: zonal for containers, **serverless** for Cloud Run, internet, hybrid or Private Service Connect.'
            },
            {
              kind: 'code',
              title: 'Global external Application Load Balancer in front of a MIG',
              lines: [
                '$ gcloud compute health-checks create http web-hc --port=80 --request-path=/healthz',
                '$ gcloud compute backend-services create web-be --global --load-balancing-scheme=EXTERNAL_MANAGED \\',
                '    --protocol=HTTP --port-name=http --health-checks=web-hc',
                '$ gcloud compute backend-services add-backend web-be --global --instance-group=web-mig \\',
                '    --instance-group-region=asia-southeast2 --balancing-mode=UTILIZATION --max-utilization=0.8',
                '$ gcloud compute url-maps create web-map --default-service=web-be',
                '$ gcloud compute ssl-certificates create web-cert --domains=shop.example.com --global',
                '$ gcloud compute target-https-proxies create web-proxy --url-map=web-map --ssl-certificates=web-cert',
                '$ gcloud compute addresses create web-lb-ip --global',
                '$ gcloud compute forwarding-rules create web-fr --global --load-balancing-scheme=EXTERNAL_MANAGED \\',
                '    --address=web-lb-ip --target-https-proxy=web-proxy --ports=443',
                '# Cloud Run behind the same load balancer: a serverless NEG',
                '$ gcloud compute network-endpoint-groups create shop-neg --region=asia-southeast2 \\',
                '    --network-endpoint-type=serverless --cloud-run-service=shop'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Firewall for health checks**: global and classic load balancers need ingress from `130.211.0.0/22` and `35.191.0.0/16` on the backend port. Envoy-based regional load balancers also need the **proxy-only subnet** range, plus `35.191.0.0/16` for probes.',
                'A **proxy-only subnet** (`--purpose=REGIONAL_MANAGED_PROXY`) is required in each region that has regional or cross-region Envoy-based load balancers.',
                '**Autoscaling on load**: a MIG can scale on the backend service’s serving capacity (`--max-utilization` or `--max-rate-per-instance`).',
                '**Certificates**: use Google-managed certificates (here, or through Certificate Manager). They go ACTIVE only after DNS points at the load balancer’s IP.'
              ]
            },
            {
              kind: 'case',
              title: 'The load balancer returns 502 and every backend is UNHEALTHY',
              situation: 'A new global external Application Load Balancer returns 502 Bad Gateway. The VMs serve the page when you curl them from inside the VPC.',
              symptom: ['$ gcloud compute backend-services get-health web-be --global', '  healthState: UNHEALTHY', '  healthState: UNHEALTHY'],
              diagnose: [
                'Is there an ingress rule from `130.211.0.0/22` and `35.191.0.0/16` to the backend port? This is the most common cause.',
                'Do the health check port and path match what the app serves? Do the MIG’s named port and the backend service’s port name match?',
                'Is the app listening on all interfaces, not only on `localhost`?'
              ],
              fix: [
                '$ gcloud compute firewall-rules create allow-lb-hc --network=prod-vpc --direction=INGRESS --action=ALLOW \\',
                '    --rules=tcp:80 --source-ranges=130.211.0.0/22,35.191.0.0/16 --target-tags=web'
              ],
              why: 'The load balancer only sends traffic to healthy backends. If the probes cannot reach the VMs, there are no healthy backends and every request ends in 502.',
              exam: '"502 + UNHEALTHY backends" → health check firewall rule, first.'
            },
            {
              kind: 'quiz',
              q: 'A regional external Application Load Balancer is created, but backends never get traffic. What is required in that region for this load balancer type?',
              options: ['A Cloud NAT gateway', 'A proxy-only subnet, plus firewall rules allowing it to the backends', 'Premium Tier', 'A global static IP'],
              answer: 1,
              explain: 'Envoy-based regional load balancers run their proxies in a proxy-only subnet. The backends must allow traffic from that subnet’s range.'
            }
          ]
        },
        {
          id: 's16-cdn',
          title: 'S16-03 · Cloud CDN, Cloud Armor and how tiers interact',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Cloud CDN** caches responses at Google’s edge for a **global external (or classic) Application Load Balancer**, so it needs Premium Tier. Enable it on a backend service or a **backend bucket** (Cloud Storage).',
                '**Cache modes**: `CACHE_ALL_STATIC` (the default, which caches static content), `USE_ORIGIN_HEADERS` (honours Cache-Control), and `FORCE_CACHE_ALL`.',
                '**Invalidation** removes stale content after a release. **Signed URLs or cookies** protect paid or private content. **Media CDN** is for large-scale video streaming.',
                '**Cloud Armor** attaches **security policies** to backend services. It offers preconfigured **WAF** rules (SQL injection, XSS), IP allow and deny lists, geo rules, **rate limiting**, bot management and **Adaptive Protection** against layer 7 DDoS. It enforces at the edge for global load balancers.'
              ]
            },
            {
              kind: 'code',
              title: 'CDN and Cloud Armor',
              lines: [
                '$ gcloud compute backend-services update web-be --global --enable-cdn --cache-mode=CACHE_ALL_STATIC',
                '$ gcloud compute url-maps invalidate-cdn-cache web-map --path="/images/*"',
                '$ gcloud compute backend-buckets create static-be --gcs-bucket-name=ace-lab-web --enable-cdn',
                '$ gcloud compute security-policies create web-waf',
                "$ gcloud compute security-policies rules create 1000 --security-policy=web-waf \\",
                "    --expression=\"evaluatePreconfiguredWaf('sqli-v33-stable')\" --action=deny-403",
                '$ gcloud compute security-policies rules create 2000 --security-policy=web-waf --src-ip-ranges="*" \\',
                '    --action=throttle --rate-limit-threshold-count=100 --rate-limit-threshold-interval-sec=60 \\',
                '    --conform-action=allow --exceed-action=deny-429 --enforce-on-key=IP',
                '$ gcloud compute backend-services update web-be --global --security-policy=web-waf'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Static images load slowly for users far away" → Cloud CDN on the backend (or backend bucket). "Users still see the old logo after a release" → invalidate the cache. "Block SQL injection and limit abusive IPs" → Cloud Armor WAF rules and rate limiting. "Standard Tier and Cloud CDN" → not possible; CDN needs the global external load balancer on Premium.'
            },
            {
              kind: 'quiz',
              q: 'Where do you attach a Cloud Armor security policy?',
              options: ['To the VPC network', 'To a backend service of the load balancer', 'To each VM', 'To the Cloud DNS zone'],
              answer: 1,
              explain: 'Cloud Armor policies attach to backend services (and backend buckets for edge policies), so they act before traffic reaches your backends.'
            }
          ]
        }
      ]
    },
    {
      id: 's17',
      title: 'Session 17 · Lab: a load-balanced multi-tier environment',
      sections: [
        {
          id: 's17-lab',
          title: 'Web/app/db subnets, NGFW with secure tags, an external Application Load Balancer, failover',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Three subnets', text: 'web, app and db, as in S13-01.' },
                { title: 'Secure tags for the tiers', text: 'A `tier` key with purpose GCE_FIREWALL for the VPC, values web/app/db; give the platform team Tag User on the values.' },
                { title: 'A global network firewall policy', text: 'Allow the LB and health check ranges to `tier=web` on 80; `web → app` on 8080; `app → db` on 5432; IAP SSH to all; everything else falls to the implied deny.' },
                { title: 'MIGs per tier, web autoscaled', text: 'A regional web MIG with a health check and named port `http:80`.' },
                { title: 'The external Application Load Balancer', text: 'Backend service → URL map → HTTPS proxy → global forwarding rule, as in S16-02.' },
                {
                  title: 'Validate failover',
                  text: 'Stop or delete the VMs in one zone and watch the load balancer keep serving from the others; the MIG recreates what it lost.',
                  code: ['gcloud compute backend-services get-health web-be --global', 'gcloud compute instance-groups managed list-instances web-mig --region=asia-southeast2']
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'check',
      title: 'Before the Module 4 try-out',
      sections: [
        {
          id: 'm4-cues',
          title: 'Cue → answer',
          blocks: [
            {
              kind: 'table',
              columns: ['If the question says…', 'Think'],
              rows: [
                ['subnet out of IPs', '`expand-ip-range` (grow only)'],
                ['usable IPs in a /N', '2^(32−N) − 4'],
                ['address must survive VM recreation', 'Static (or promoted) IP'],
                ['traffic through an appliance', 'Custom static route (next hop VM / internal passthrough LB)'],
                ['most specific vs priority', 'Longest prefix first, then priority'],
                ['same priority allow and deny', 'Deny wins'],
                ['no rule matches', 'Ingress denied, egress allowed'],
                ['only security team controls targets', 'Secure tags / service accounts'],
                ['org-wide rule nobody can override', 'Hierarchical firewall policy'],
                ['FQDN, geo, threat intel rules', 'Cloud NGFW Standard'],
                ['intrusion prevention', 'Cloud NGFW Enterprise'],
                ['central network, many projects', 'Shared VPC'],
                ['A–B, B–C, A cannot reach C', 'Peering is not transitive'],
                ['encrypted link this week', 'HA VPN (99.99%)'],
                ['10+ Gbps private', 'Dedicated (or Partner) Interconnect'],
                ['private VMs need internet out', 'Cloud NAT'],
                ['private VMs need Google APIs', 'Private Google Access'],
                ['resolve on-prem names', 'Forwarding zone'],
                ['cheaper egress, one region', 'Standard Tier'],
                ['global HTTPS, one IP, CDN, WAF', 'Global external Application LB + CDN + Cloud Armor'],
                ['UDP, keep client IP', 'Passthrough Network LB'],
                ['502 / UNHEALTHY', 'Health check firewall rule'],
                ['regional Envoy LB not working', 'Proxy-only subnet']
              ]
            }
          ]
        },
        {
          id: 'm4-traps',
          title: 'Traps that cost points',
          blocks: [
            {
              kind: 'list',
              items: [
                '**Subnets cannot shrink**, and growing one must not overlap a neighbour.',
                '**Firewall priority: lower number wins.** 100 beats 1000.',
                '**Network tags are not a security boundary,** because anyone who can edit the VM can change them.',
                '**Peering is not transitive** and needs both halves. Overlapping ranges block it.',
                '**Cloud NAT is outbound only.** It never makes a VM reachable from the internet.',
                '**Interconnect is not encrypted by default.**',
                '**Classic VPN is not the 99.99% answer.** HA VPN is.',
                '**Global load balancers and Cloud CDN need Premium Tier.**',
                '**`kubectl expose --type=LoadBalancer` and the "Network Load Balancer"** are L4. HTTP routing is the Application Load Balancer.'
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
              q: 'You need a VPC for production that will later peer with on-premises ranges `10.128.0.0/16`. Which mode should it be created in?',
              options: ['Auto mode, because it is simpler', 'Custom mode, with ranges that avoid on-premises', 'Legacy network', 'Either; overlaps are translated automatically'],
              answer: 1,
              explain: 'Auto mode uses 10.128.0.0/9, which overlaps the on-premises range. Custom mode lets you plan ranges that do not collide.'
            },
            {
              kind: 'quiz',
              q: 'A deny rule at priority 500 blocks tcp:22 from `0.0.0.0/0`. An allow rule at priority 1000 allows tcp:22 from `35.235.240.0/20`. Can IAP SSH reach the VM?',
              options: ['Yes, because the allow rule is more specific', 'No, because the deny rule has the lower number and is evaluated first', 'Yes, because IAP bypasses firewall rules', 'Only for users with IAP-secured Tunnel User'],
              answer: 1,
              explain: 'Priority decides, not specificity. Give the allow rule a lower number than the deny, for example 400, to let IAP through.'
            },
            {
              kind: 'quiz',
              q: 'Developers can edit VM network tags, and security wants rules that developers cannot get around by retagging VMs. What should firewall rules target?',
              options: ['Network tags with a naming convention', 'Service accounts, or secure tags in a network firewall policy', 'Instance names', 'Labels'],
              answer: 1,
              explain: 'Changing a VM’s service account needs extra IAM and a stopped VM, and secure tags are bound only by Tag Users. Tags and labels can be changed by anyone who can edit the VM.'
            },
            {
              kind: 'quiz',
              q: 'An application in project A’s VPC must reach a database in project B’s VPC (another organization), privately. What do you configure?',
              options: ['Shared VPC', 'VPC Network Peering with non-overlapping ranges, created on both sides', 'Cloud NAT', 'Public IPs with firewall rules'],
              answer: 1,
              explain: 'Shared VPC works only inside one organization. Peering works across organizations when both sides create the peering.'
            },
            {
              kind: 'quiz',
              q: 'The office must connect to the VPC with an SLA of 99.99% as soon as possible, over the internet. What do you build?',
              options: ['Classic VPN with one tunnel', 'HA VPN with two tunnels and BGP on a Cloud Router', 'Dedicated Interconnect', 'Direct Peering'],
              answer: 1,
              explain: 'HA VPN gives 99.99% with two tunnels to a redundant peer and is quick to set up. Interconnect takes weeks to provision.'
            },
            {
              kind: 'quiz',
              q: 'GKE private nodes cannot pull images from Docker Hub, but pull from Artifact Registry fine. What is missing?',
              options: ['Private Google Access', 'Cloud NAT for the subnet', 'A public control plane endpoint', 'A firewall rule for 35.235.240.0/20'],
              answer: 1,
              explain: 'Artifact Registry is a Google API, reachable with Private Google Access. Docker Hub is on the internet, which private nodes reach only through Cloud NAT.'
            },
            {
              kind: 'quiz',
              q: 'On-premises servers must resolve names in a Cloud DNS private zone. What do you configure?',
              options: ['A forwarding zone', 'An inbound DNS server policy, with on-premises resolvers forwarding to its address', 'DNSSEC', 'A public zone with the same records'],
              answer: 1,
              explain: 'The inbound server policy gives Cloud DNS an address in your VPC that on-premises DNS can forward to. Forwarding zones go the other way.'
            },
            {
              kind: 'quiz',
              q: 'A global HTTPS site needs one IP worldwide, routing `/api` to a MIG and `/static` to a bucket, cached at the edge. What do you build?',
              options: ['A regional external Application Load Balancer', 'A global external Application Load Balancer with a URL map, a backend service, a backend bucket and Cloud CDN', 'An external passthrough Network Load Balancer', 'Two regional load balancers with DNS round robin'],
              answer: 1,
              explain: 'Global anycast IP, path routing and edge caching are all global external Application Load Balancer features.'
            },
            {
              kind: 'quiz',
              q: 'To cut egress cost, a team moves an internet-facing regional service to Standard Tier. What else must change?',
              options: ['Nothing', 'Any global load balancer must become regional, because Standard Tier supports only regional resources', 'Cloud NAT must be removed', 'The VPC must be recreated'],
              answer: 1,
              explain: 'Standard Tier works with regional external IPs and regional load balancers only. Global load balancing needs Premium.'
            }
          ]
        }
      ]
    }
  ],
  practice: [
    { label: 'Command quiz: VPC, subnets and firewall', href: '#/ace/lab/cmd/network', note: 'Session 13' },
    { label: 'Network lab: three tiers web → app → db', href: '#/ace/lab/network/three-tier', note: 'firewall rules by tier' },
    { label: 'Network lab: block one VM with priority', href: '#/ace/lab/network/deny-priority', note: 'priority and deny' },
    { label: 'Network lab: peering is not transitive', href: '#/ace/lab/network/peering-transitive', note: 'Session 13' },
    { label: 'Network lab: private VM needs OS updates', href: '#/ace/lab/network/cloud-nat', note: 'Cloud NAT' },
    { label: 'Network lab: hybrid office to two regions', href: '#/ace/lab/network/hybrid-vpn', note: 'Session 15' },
    { label: 'Network lab: load balancer, all backends UNHEALTHY', href: '#/ace/lab/network/lb-health', note: 'Session 16' },
    { label: 'Command quiz: DNS, load balancing and Cloud Armor', href: '#/ace/lab/cmd/lb', note: 'Sessions 15–16' },
    { label: 'Deep dive: VPC networks and firewall rules', href: '#/ace/learn/vpc', note: 'more scenarios' },
    { label: 'Deep dive: Cloud Load Balancing', href: '#/ace/learn/load-balancing', note: 'every mode, every range' }
  ]
};
