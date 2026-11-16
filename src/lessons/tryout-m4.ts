/**
 * Tryout prep for course Module 4, sessions 13–17 (exam guide 2.3 and 3.3):
 * custom mode VPCs and subnets, IP addresses and routes, VPC firewall rules
 * and Cloud NGFW policies with secure tags, Shared VPC and peering; hybrid
 * connectivity, Cloud DNS, Cloud NAT and Network Service Tiers; choosing and
 * building load balancers with Cloud CDN and Cloud Armor — plus both labs and
 * a check before the module try-out (M4 · Set 1–5 in exams/ace/sets.ts). The
 * subnet calculator, the firewall exercise and the load balancer picker are
 * the interactive blocks the VPC and load balancing deep dives use. Checked
 * against the Google Cloud docs in October 2026, then filled out in November
 * 2026 from the course's MD4 slides (S13-01 to S16-03): subnet purposes, route
 * types and next hops, policy types and actions, Shared VPC roles and org
 * policies, peering route exchange, Interconnect provisioning and topologies,
 * DNS resolution order, NAT ports, tier support, LB schemes and backends,
 * health checks and CDN cache policy — and Session 14 now walks MD4-LAB01,
 * the segmented VPC lab, with its rules as a firewall exercise.
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
    'Module 4 is the networking part of exam guide Sections 2 and 3, and it is where small details decide the answer: a range, a priority, a tier, the name of a load balancer. This lesson follows sessions 13 to 17 of the course. It starts with custom mode VPCs, subnets, addresses and routes. Then firewall rules and Cloud NGFW policies with secure tags, and Shared VPC against peering. Then hybrid connectivity, Cloud DNS, Cloud NAT and the network tiers, and finally load balancers with Cloud CDN and Cloud Armor. Session 14 walks the MD4-LAB01 segmented network lab step by step. Interactive blocks let you practise: a subnet calculator, two firewall exercises that tell you which rule decided, and a picker that names the right load balancer. After each session, check it with that session’s exam (S13 to S17, 20 questions each). Then sit M4 · Set 1 to 5 (20 questions, 24 minutes each), and the combined Tryout MD3–MD4 (10 sets of 20).',
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
                'The default **MTU** is 1460 bytes and can be raised up to 8896. Plan ranges that do not overlap on-premises or peered networks, because overlap blocks peering and VPN routing.',
                'A VPC belongs to **one project** (or is shared through Shared VPC), and a project can hold several VPCs. VMs in different regions of the same VPC talk over internal IPs with no VPN or peering.',
                'New projects may come with an auto mode **`default` network** whose firewall rules allow SSH, RDP and ICMP from anywhere. Do not use it in production.'
              ]
            },
            {
              kind: 'table',
              caption: 'Subnet IP range rules',
              columns: ['Rule', 'Detail'],
              rows: [
                ['Reserved addresses', '4 per primary IPv4 range: network, gateway (`.1`), second-to-last and broadcast. A /24 such as `10.10.0.0/24` loses `.0`, `.1`, `.254` and `.255`, leaving **252**'],
                ['Smallest range', '**/29** for a primary IPv4 range (8 − 4 = 4 usable)'],
                ['Valid ranges', 'RFC 1918 (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`) plus other private ranges such as `100.64.0.0/10`'],
                ['No overlap', 'Inside the VPC, and with peered VPC subnet routes'],
                ['Expand', 'A smaller prefix, with no downtime. The **new range must contain the old one**. Never shrink: that needs a new subnet'],
                ['Secondary ranges', 'Extra ranges for alias IPs, for example GKE Pods and Services']
              ]
            },
            {
              kind: 'table',
              caption: 'Subnet purposes (`--purpose`, set when the subnet is created)',
              columns: ['Purpose', 'Used for', 'Notes'],
              rows: [
                ['`PRIVATE`', 'Regular subnets for VMs, GKE nodes and internal endpoints', 'The default'],
                ['`REGIONAL_MANAGED_PROXY`', 'Proxy-only subnet for regional Envoy-based load balancers', 'Size it for proxy scaling'],
                ['`GLOBAL_MANAGED_PROXY`', 'Proxy-only subnet for cross-region internal Application Load Balancers', 'One in each region with backends'],
                ['`PRIVATE_SERVICE_CONNECT`', 'NAT subnet for Private Service Connect service attachments', 'Producer side of a published service'],
                ['`PRIVATE_NAT`', 'Source ranges for Private NAT', 'Not for regular VMs']
              ]
            },
            {
              kind: 'code',
              title: 'Network options and converting auto mode',
              lines: [
                '$ gcloud compute networks create prod-vpc --subnet-mode=custom --bgp-routing-mode=regional --mtu=1460',
                '# Convert an auto mode VPC to custom mode (one way, cannot go back)',
                '$ gcloud compute networks update default --switch-to-custom-subnet-mode',
                '# Private Google Access is a per-subnet switch',
                '$ gcloud compute networks subnets update web-jkt --region=asia-southeast2 --enable-private-ip-google-access'
              ]
            },
            {
              kind: 'table',
              caption: 'Course example: 3 tiers × 2 regions, on-premises uses 192.168.0.0/16',
              columns: ['Tier', 'Jakarta (asia-southeast2)', 'Singapore (asia-southeast1)'],
              rows: [
                ['Region block', '`10.10.0.0/16`', '`10.20.0.0/16`'],
                ['web subnet', '`10.10.0.0/24`', '`10.20.0.0/24`'],
                ['app subnet', '`10.10.4.0/24`', '`10.20.4.0/24`'],
                ['db subnet', '`10.10.8.0/24`', '`10.20.8.0/24`'],
                ['GKE nodes / Pods', '`10.10.16.0/22` · `10.100.0.0/16`', '`10.20.16.0/22` · `10.110.0.0/16`'],
                ['GKE Services', '`10.101.0.0/20`', '`10.111.0.0/20`']
              ]
            },
            {
              kind: 'p',
              text: 'The gaps between the /24s (`.0`, then `.4`, then `.8`) let each subnet grow to a /22 later without touching its neighbour. Plan once: one block per region, a subnet per tier so firewall rules and routes can target it, room for GKE Pods (they use many addresses), and free space after every subnet. Subnets can also be dual-stack (`IPV4_IPV6`).'
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
            },
            {
              kind: 'quiz',
              q: 'Your company tries to peer two VPC networks that were both created in auto mode. The peering fails. Why?',
              options: ['Peering needs Shared VPC first', 'Auto mode subnet ranges are the same in every auto mode network, so they overlap', 'Peered VPCs must be in one region', 'Peering needs a Cloud Router'],
              answer: 1,
              explain: 'Every auto mode network takes a /20 per region from `10.128.0.0/9`, so two auto mode networks always overlap, and peering refuses overlapping ranges.'
            },
            {
              kind: 'quiz',
              q: 'On-premises uses `10.10.0.0/16`. You will connect it to a new VPC with HA VPN. Which subnet range is safe for the VPC?',
              options: ['10.10.4.0/24', '10.10.0.0/20', '10.30.0.0/24', '10.0.0.0/8'],
              answer: 2,
              explain: '`10.10.4.0/24` and `10.10.0.0/20` sit inside the on-premises /16, and `10.0.0.0/8` contains it. Only `10.30.0.0/24` stays clear.'
            },
            {
              kind: 'callout',
              tone: 'tip',
              title: 'What changed recently (from the course slides)',
              text: '**Hybrid Subnets** went GA in April 2026, so a VPC can share a CIDR block with on-premises. Static external IPv4 addresses can come from BYOIP prefixes (GA, February 2026), and regional IPv6 addresses can be reserved from a /96 (GA, October 2025). Multiple network interfaces in the same VPC are in Preview. Bangkok got a new auto mode subnet, `10.232.0.0/20`.'
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
              kind: 'p',
              text: 'Lifetimes matter: an **ephemeral internal** IP is kept until the VM is deleted, but an **ephemeral external** IP **can change after a stop and start**. Static addresses stay until you release them. Use `--global` only for global load balancer frontends; every other address is regional, and internal ones take `--subnet` (and optionally `--addresses`).'
            },
            {
              kind: 'table',
              caption: 'Which address should I use?',
              columns: ['Situation', 'Address'],
              rows: [
                ['Public website behind a global HTTPS load balancer', 'Global static external IP (`--global`)'],
                ['Single VM with a DNS record pointing at it', 'Regional static external IP'],
                ['Database VM whose IP is written in app configs', 'Static internal IP in the db subnet'],
                ['Internal load balancer frontend', 'Static internal IP (regional)'],
                ['Batch workers with no inbound traffic', 'Ephemeral internal only, plus Cloud NAT'],
                ['VM IP must survive a stop and start', 'Promote the ephemeral external IP to static']
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
                '$ gcloud compute routes list --filter="network:prod-vpc" --sort-by=priority',
                '# Through an appliance VM: the VM must be created with --can-ip-forward',
                '$ gcloud compute routes create to-onprem --network=prod-vpc --destination-range=192.168.0.0/16 \\',
                '    --next-hop-instance=fw-1 --next-hop-instance-zone=asia-southeast2-a --priority=800 --tags=app',
                '# Internet egress only for VMs tagged web (after deleting the default route)',
                '$ gcloud compute routes create web-egress --network=prod-vpc --destination-range=0.0.0.0/0 \\',
                '    --next-hop-gateway=default-internet-gateway --tags=web'
              ]
            },
            {
              kind: 'table',
              caption: 'Route types in a VPC (routes are VPC-wide; each VM uses the ones that match it)',
              columns: ['Type', 'What it is'],
              rows: [
                ['Subnet routes', 'Created for every subnet range. Cannot be deleted while the subnet exists'],
                ['Default route', '`0.0.0.0/0` to the default internet gateway, priority 1000. Delete it to isolate a VPC'],
                ['Static routes', 'Yours: a destination, **exactly one next hop**, a priority, optional network tags'],
                ['Dynamic routes', 'Learned over BGP by Cloud Router from Cloud VPN or Cloud Interconnect peers'],
                ['Peering routes', 'Subnet routes exchanged with a peered VPC. Not transitive'],
                ['Policy-based routes', 'Route by source, protocol or destination, for example through a firewall appliance']
              ]
            },
            {
              kind: 'table',
              caption: 'Next hop options',
              columns: ['Next hop', 'Flag', 'Typical use'],
              rows: [
                ['Internet gateway', '`--next-hop-gateway`', 'Internet egress, Private Google Access'],
                ['VM instance', '`--next-hop-instance`', 'NAT or firewall appliance (needs `--can-ip-forward`)'],
                ['Internal IP', '`--next-hop-address`', 'Appliance addressed by IP'],
                ['Internal passthrough NLB', '`--next-hop-ilb`', 'Several HA appliances behind a load balancer'],
                ['Classic VPN tunnel', '`--next-hop-vpn-tunnel`', 'Static-routed VPN (legacy). HA VPN and Interconnect use BGP routes instead']
              ]
            },
            {
              kind: 'table',
              caption: 'Dynamic routing mode, set per VPC with `--bgp-routing-mode`',
              columns: ['Regional (default)', 'Global'],
              rows: [
                ['Cloud Router learns routes for its own region only', 'Learned routes apply in every region of the VPC'],
                ['Advertises only the subnets in its region', 'Advertises subnets from every region'],
                ['VMs in other regions cannot use those routes', 'One VPN or Interconnect serves the whole VPC'],
                ['Suits single-region hybrid connectivity', 'Cross-region routes get a worse (higher) priority']
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Match the destination', text: 'Collect every route whose range contains the destination IP.' },
                { title: 'Most specific wins', text: 'Longest prefix first: a /24 beats a /16, which beats `0.0.0.0/0`.' },
                { title: 'Then priority', text: 'Among equal prefixes, the lowest number wins (0 is highest, 1000 the default).' },
                { title: 'Tie → ECMP', text: 'Same prefix and priority: traffic is spread across the next hops by hash.' }
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
            },
            {
              kind: 'quiz',
              q: 'A VM’s public IP changed after a maintenance stop and start, and customers lost access. How do you prevent this next time?',
              options: ['Use a larger machine type', 'Reserve (or promote to) a static external IP for the VM', 'Enable Private Google Access', 'Add a custom static route'],
              answer: 1,
              explain: 'Ephemeral external IPs can change on stop and start. A static external IP stays with the project until you release it.'
            },
            {
              kind: 'quiz',
              q: 'You create a route whose next hop is a firewall appliance VM, but traffic is dropped at the appliance. What did the VM most likely miss?',
              options: ['A network tag', 'IP forwarding (`--can-ip-forward`) when it was created', 'An external IP', 'Private Google Access'],
              answer: 1,
              explain: 'A VM that forwards packets not addressed to itself must be created with IP forwarding enabled.'
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
                'A rule **cannot mix** tags and service accounts. Source tags and source service accounts match only VMs’ internal IPs in the same VPC.',
                'Rules are **distributed**: the Andromeda SDN enforces them at each VM’s network interface, so there is no box in the path and no bandwidth bottleneck. VPC firewall rules belong to **one network**; firewall policies can span networks, folders or the organization.',
                'The implied rules exist in **every** VPC, are not shown in the rule list, **cannot be deleted** (override them with a lower number) and **cannot be logged**. To see denied traffic in the logs, add an explicit deny rule with logging, as LAB01 does.',
                'The `default` network rules are: `default-allow-internal` (`10.128.0.0/9`, all ports), `default-allow-ssh` (tcp:22), `default-allow-rdp` (tcp:3389) and `default-allow-icmp`, the last three from `0.0.0.0/0`. They are editable and deletable: remove them for production.',
                'Egress on **TCP 25** (SMTP) to external addresses is always blocked by Google Cloud.',
                'Leaving out ports matches every port of that protocol. Logging adds Cloud Logging cost, so turn it on for critical rules and while troubleshooting. **Firewall Insights** finds shadowed, overly permissive and unused rules.',
                'Ranges to remember: IAP TCP forwarding `35.235.240.0/20`; load balancer health checks `130.211.0.0/22` and `35.191.0.0/16`.'
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Match the direction', text: 'Ingress rules cover incoming connections, egress rules outgoing ones.' },
                { title: 'Same network?', text: 'The rule must belong to the VPC of the VM’s network interface.' },
                { title: 'Check the target', text: 'The tag or service account must be on the receiving VM.' },
                { title: 'Check priority', text: 'Lower number wins, and deny wins a tie.' },
                { title: 'Look above the network', text: 'Hierarchical policy rules can allow or deny first.' },
                { title: 'Prove it', text: 'Run a Connectivity Test and read Firewall Rules Logging to see which rule matched.' }
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
              caption: 'Cloud NGFW policy types',
              columns: ['Type', 'Attached to', 'Use'],
              rows: [
                ['Hierarchical policy', 'Organization or folder', 'Applies to every VPC below it. The central security team’s guardrails'],
                ['Global network policy (`--global`)', 'One or more VPC networks', 'Rules in all regions. Supports secure tags'],
                ['Regional network policy (`--region`)', 'A VPC network in one region', 'Region-specific rules'],
                ['VPC firewall rules (classic)', 'One network', 'Still supported, but policies are the recommended model']
              ]
            },
            {
              kind: 'table',
              caption: 'Policy rule actions (VPC firewall rules know only allow and deny)',
              columns: ['Action', 'Effect', 'Typical use'],
              rows: [
                ['`allow`', 'Permit and stop evaluating', 'Open app ports to known sources'],
                ['`deny`', 'Drop and stop evaluating', 'Block bad ranges org-wide'],
                ['`goto_next`', 'Skip to the next policy level', 'Let project teams decide lower down'],
                ['`apply_security_profile_group`', 'Send to inspection (IPS)', 'Enterprise tier threat prevention']
              ]
            },
            {
              kind: 'table',
              caption: 'Secure tags vs network tags',
              columns: ['Secure tags (policies)', 'Network tags (legacy)'],
              rows: [
                ['Key/value resources in Resource Manager, purpose `GCE_FIREWALL`', 'Free-form strings on the instance'],
                ['Binding controlled by IAM (`roles/resourcemanager.tagUser`)', 'Anyone with instance admin can change them'],
                ['Targets and sources in policy rules', 'Only in classic VPC firewall rules'],
                ['Scoped to one VPC through `--purpose-data`', 'No central governance or inventory'],
                ['Work as sources across VPC Network Peering (GA, March 2026)', 'Not supported in firewall policies']
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud NGFW tiers',
              columns: ['Tier', 'Adds'],
              rows: [
                ['Essentials', 'Stateful L3/L4 rules, hierarchical and network policies, secure tags, address groups, logging'],
                ['Standard', 'FQDN objects, geolocation objects, Google Threat Intelligence lists'],
                ['Enterprise', 'Intrusion prevention (IPS) through firewall endpoints and security profiles, plus TLS inspection']
              ]
            },
            {
              kind: 'table',
              caption: 'Which firewall construct?',
              columns: ['Need', 'Answer'],
              rows: [
                ['Block a range in every project of the org', 'Hierarchical policy on the organization'],
                ['Same rules for several VPC networks', 'Global network firewall policy'],
                ['IAM-controlled identity for rule targets', 'Secure tags (`GCE_FIREWALL` purpose)'],
                ['Allow egress only to `*.googleapis.com`', 'FQDN objects (Standard)'],
                ['Block traffic from certain countries', 'Geolocation objects (Standard)'],
                ['Detect exploits inside allowed traffic', 'IPS security profile (Enterprise)']
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
            },
            {
              kind: 'quiz',
              q: 'A custom mode VPC has no firewall rules you created. A VM with a public IP runs a web server on port 80. What happens to HTTP traffic from the internet?',
              options: ['Allowed by the implied allow rule', 'Blocked by the implied deny ingress rule', 'Allowed because the VM has a public IP', 'Blocked only if logging is enabled'],
              answer: 1,
              explain: 'A custom VPC has only the implied rules: deny all ingress, allow all egress. A public IP does not open anything.'
            },
            {
              kind: 'quiz',
              q: 'An organization-level hierarchical policy has a rule that matches tcp:22 with action `goto_next`. What happens to SSH traffic?',
              options: ['It is allowed immediately', 'It is denied immediately', 'Evaluation continues at the next level down', 'It is sent to IPS inspection'],
              answer: 2,
              explain: '`goto_next` hands the decision to the next level: child folders, then the VPC rules and network policies, then the implied rules.'
            },
            {
              kind: 'quiz',
              q: 'Private VMs have no external IPs, and admins must SSH with IAP TCP forwarding. Which source range must the ingress rule allow on tcp:22?',
              options: ['130.211.0.0/22', '35.191.0.0/16', '35.235.240.0/20', '0.0.0.0/0'],
              answer: 2,
              explain: '`35.235.240.0/20` is the IAP range. The other two Google ranges are for load balancer health checks.'
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
              kind: 'table',
              caption: 'Shared VPC IAM roles: network duty apart from workload duty',
              columns: ['Role', 'Granted at', 'Allows'],
              rows: [
                ['Shared VPC Admin (`compute.xpnAdmin`)', 'Organization or folder', 'Enable host projects and attach service projects'],
                ['Network Admin (`compute.networkAdmin`)', 'Host project', 'Manage subnets, routes and other network resources'],
                ['Security Admin (`compute.securityAdmin`)', 'Host project', 'Manage firewall rules and policies'],
                ['Network User (`compute.networkUser`)', 'Host project or **one subnet**', 'Create VMs and other resources that use the shared subnets']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Organization required**: Shared VPC needs a Google Cloud organization.',
                '**One host per service project**: a service project attaches to one host at a time, and a host cannot also be a service project.',
                '**The host owns the network**: firewall rules, routes and Cloud Routers live in the host project.',
                '**Each project pays its own**: resources are billed to the service project that owns them.',
                '**Addresses**: resources in a service project use internal IPs from a shared subnet in the **same region**.'
              ]
            },
            {
              kind: 'table',
              caption: 'Controlling networks with organization policy',
              columns: ['Constraint', 'Effect'],
              rows: [
                ['`compute.restrictSharedVpcHostProjects`', 'Limits which host projects service projects can attach to'],
                ['`compute.restrictSharedVpcSubnetworks`', 'Limits which shared subnets a project can use'],
                ['`compute.restrictVpcPeering`', 'Limits which networks can be peered'],
                ['`compute.vmExternalIpAccess`', 'Limits which VMs can have external IP addresses']
              ]
            },
            {
              kind: 'table',
              caption: 'Route exchange between peered networks (a route is shared only if one side exports it and the other imports it)',
              columns: ['Route type', 'Exchanged', 'How to change'],
              rows: [
                ['Subnet routes, private IPv4', 'Always, both sides', 'Cannot be turned off'],
                ['Subnet routes, public IP ranges', 'Not by default', '`--export-subnet-routes-with-public-ip` / `--import-subnet-routes-with-public-ip`'],
                ['Custom static and dynamic routes', 'Not by default', '`--export-custom-routes` / `--import-custom-routes`']
              ]
            },
            {
              kind: 'list',
              items: [
                'A peering is **ACTIVE** only after both networks create a matching peering; until then it shows INACTIVE. The peering name is local to each network.',
                '**Network tags and service accounts do not cross a peering**: use IP ranges, or secure tags with purpose-data, in the other side’s firewall rules.',
                'Peering-group quotas limit the total VMs and routes. **Consensus-mode** peering (GA, November 2025) needs both sides to agree before deletion.'
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
                '$ gcloud compute networks peerings create b-to-a --project=proj-b --network=vpc-b --peer-project=proj-a --peer-network=vpc-a',
                '# Exchange custom (static and BGP) routes too: both flags, on the sides that need them',
                '$ gcloud compute networks peerings update a-to-b --network=vpc-a --export-custom-routes --import-custom-routes',
                '# Verify the state and the routes learned from the peer',
                '$ gcloud compute networks peerings list --network=vpc-a',
                '$ gcloud compute networks peerings list-routes a-to-b --network=vpc-a --direction=INCOMING --region=asia-southeast2'
              ]
            },
            {
              kind: 'table',
              caption: 'Connectivity options compared: pick the simplest one that meets the need',
              columns: ['Option', 'Best for', 'Key point'],
              rows: [
                ['Shared VPC', 'One organization with a central network team', 'One network; firewall and routes in the host project'],
                ['VPC Network Peering', 'Separately managed networks (partners, SaaS, M&A)', 'Non-transitive; ranges must not overlap'],
                ['Network Connectivity Center', 'Many VPCs through one hub', 'Avoids a full mesh of peerings'],
                ['Private Service Connect', 'Publishing one service to consumers', 'An endpoint with an internal IP; ranges may overlap'],
                ['Cloud VPN', 'Encrypted tunnels between networks or sites', 'When peering limits do not fit']
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
            },
            {
              kind: 'quiz',
              q: 'Which role lets a project team create VMs in one shared subnet only?',
              options: ['Shared VPC Admin on the organization', 'Network Admin on the host project', 'Compute Network User on that subnet', 'Security Admin on the service project'],
              answer: 2,
              explain: 'Network User granted on a single subnet is the least privilege for placing resources there. Shared VPC Admin attaches projects, Network Admin manages the network, Security Admin manages firewall rules.'
            },
            {
              kind: 'quiz',
              q: 'VPC A and VPC B are peered and the peering shows ACTIVE. A firewall rule in B allows source tag `frontend`, which the VMs in A carry, yet A’s VMs are blocked. Why?',
              options: ['Peering is not transitive', 'Network tags do not cross a peering; allow A’s IP ranges instead', 'Custom routes were not exported', 'The ranges overlap'],
              answer: 1,
              explain: 'Source tags and service accounts match only VMs in the same network. Across a peering, write the rule with the peer’s ranges (or secure tags with purpose-data).'
            }
          ]
        }
      ]
    },
    {
      id: 's14',
      title: 'Session 14 · Lab MD4-LAB01: build a segmented VPC network',
      sections: [
        {
          id: 's14-lab',
          title: 'The layout: two custom networks, three subnets, four VMs',
          blocks: [
            {
              kind: 'p',
              text: 'The lab builds the network of a Jakarta courier company in your own project in `asia-southeast2`, from Cloud Shell, without the default network. Tasks 1 to 3 build the networks, VMs and firewall rules. Tasks 4 and 5 prove which paths are allowed and which are blocked, then clean up. The deliverable is one document of captioned screenshots: networks, VM list, firewall rules, six test results, logs and cleanup.'
            },
            {
              kind: 'table',
              caption: 'What each VM is for (write down the internal IPs: Task 4 needs them)',
              columns: ['VM', 'Network / subnet', 'Tags and IP', 'Role'],
              rows: [
                ['`$PFX-web`', 'prod / web `10.10.1.0/24`', 'Tag `web`; external IP', 'Public entry point on port 80'],
                ['`$PFX-probe`', 'prod / web `10.10.1.0/24`', 'No tags; no external IP', 'Control VM that must be blocked'],
                ['`$PFX-app`', 'prod / app `10.10.2.0/24`', 'Tag `app`; no external IP', 'Private tier that only web may call'],
                ['`$PFX-db`', 'data / db `10.20.1.0/24`', 'No tags; no external IP', 'Proves the two networks are isolated']
              ]
            },
            {
              kind: 'p',
              text: '**Setup in Cloud Shell.** Check which account is active, set the lab project, export three variables (`PFX` as `terra-` plus your name, `REGION=asia-southeast2`, `ZONE=asia-southeast2-a`), make the region and zone the gcloud defaults, and enable the Compute Engine and Network Management APIs.'
            },
            {
              kind: 'code',
              reveal: true,
              title: 'Setup in Cloud Shell',
              lines: [
                '$ gcloud auth list',
                '$ gcloud config set project PROJECT_ID',
                '# prefix: terra- plus your name, lowercase, dashes',
                '$ export PFX=terra-nama REGION=asia-southeast2 ZONE=asia-southeast2-a',
                '$ gcloud config set compute/region $REGION && gcloud config set compute/zone $ZONE',
                '$ gcloud services enable compute.googleapis.com networkmanagement.googleapis.com'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'You need Editor (or equivalent) on the lab project, billing, the Compute Engine API, and **IAP-secured Tunnel User** for SSH to the VMs without external IPs.'
            }
          ]
        },
        {
          id: 's14-build',
          title: 'Tasks 1–3: networks, VMs and six firewall rules',
          blocks: [
            {
              kind: 'steps',
              lab: true,
              items: [
                {
                  title: 'Task 1a · The prod network, custom mode',
                  text: 'Create the `prod` network with no automatic subnets, then add the web and app subnets yourself. Each /24 keeps 252 usable addresses, and ranges must not overlap inside one network.',
                  spec: [
                    'Network: `$PFX-prod`, `--subnet-mode=custom`',
                    'Subnet `$PFX-web`: `10.10.1.0/24`, region `$REGION`',
                    'Subnet `$PFX-app`: `10.10.2.0/24`, region `$REGION`'
                  ],
                  code: [
                    'gcloud compute networks create $PFX-prod --subnet-mode=custom',
                    'gcloud compute networks subnets create $PFX-web --network=$PFX-prod --region=$REGION --range=10.10.1.0/24',
                    'gcloud compute networks subnets create $PFX-app --network=$PFX-prod --region=$REGION --range=10.10.2.0/24'
                  ]
                },
                {
                  title: 'Task 1b · The data network, then verify',
                  text: 'A second, separate network for the database. It has no route to `prod`; `10.10.x.x` and `10.20.x.x` do not overlap, so the two could be peered later. List both networks and all subnets to check.',
                  spec: [
                    'Network: `$PFX-data`, custom mode',
                    'Subnet `$PFX-db`: `10.20.1.0/24`, region `$REGION`',
                    'Verify with a list filtered on `name~^$PFX`'
                  ],
                  code: [
                    'gcloud compute networks create $PFX-data --subnet-mode=custom',
                    'gcloud compute networks subnets create $PFX-db --network=$PFX-data --region=$REGION --range=10.20.1.0/24',
                    'gcloud compute networks list --filter="name~^$PFX"',
                    'gcloud compute networks subnets list --filter="name~^$PFX"'
                  ]
                },
                {
                  title: 'Task 2a · A test server on every VM',
                  text: 'Write a startup script that serves the VM’s hostname on ports 80 and 8080 with the python3 already on Debian, so no internet access is needed. The firewall, not the VMs, decides who connects.',
                  spec: [
                    'File: `serve.sh`',
                    'Write the hostname to `/tmp/index.html`',
                    'Two `python3 -m http.server` processes, on 80 and on 8080, started with `systemd-run`'
                  ],
                  code: [
                    'cat > serve.sh <<\'EOF\'',
                    '#!/bin/bash',
                    'hostname > /tmp/index.html',
                    'systemd-run --working-directory=/tmp python3 -m http.server 80',
                    'systemd-run --working-directory=/tmp python3 -m http.server 8080',
                    'EOF'
                  ]
                },
                {
                  title: 'Task 2b · Four VMs',
                  text: 'The subnet decides each VM’s internal IP; the tag decides which rules match it. Check that all four are RUNNING and write down their internal IPs.',
                  spec: [
                    'All four: `e2-micro`, image family `debian-12` from `debian-cloud`, startup script `serve.sh`',
                    '`$PFX-web`: subnet `$PFX-web`, tag `web`, keeps an external IP',
                    '`$PFX-app`: subnet `$PFX-app`, tag `app`, `--no-address`',
                    '`$PFX-probe`: subnet `$PFX-web`, no tags, `--no-address`',
                    '`$PFX-db`: subnet `$PFX-db`, no tags, `--no-address`'
                  ],
                  code: [
                    'gcloud compute instances create $PFX-web --machine-type=e2-micro --subnet=$PFX-web --tags=web --image-family=debian-12 --image-project=debian-cloud --metadata-from-file=startup-script=serve.sh',
                    'gcloud compute instances create $PFX-app --machine-type=e2-micro --subnet=$PFX-app --tags=app --no-address --image-family=debian-12 --image-project=debian-cloud --metadata-from-file=startup-script=serve.sh',
                    'gcloud compute instances create $PFX-probe --machine-type=e2-micro --subnet=$PFX-web --no-address --image-family=debian-12 --image-project=debian-cloud --metadata-from-file=startup-script=serve.sh',
                    'gcloud compute instances create $PFX-db --machine-type=e2-micro --subnet=$PFX-db --no-address --image-family=debian-12 --image-project=debian-cloud --metadata-from-file=startup-script=serve.sh',
                    'gcloud compute instances list --filter="name~^$PFX"'
                  ]
                },
                {
                  title: 'Task 3a · Three allow rules at the default priority 1000',
                  text: 'In the prod network: SSH only from the IAP range, port 80 only to the web tag, ping only from inside the prod ranges. Direction defaults to ingress.',
                  spec: [
                    '`$PFX-allow-iap`: allow `tcp:22` from `35.235.240.0/20`, all VMs',
                    '`$PFX-allow-http`: allow `tcp:80` from `0.0.0.0/0`, target tag `web`',
                    '`$PFX-allow-icmp`: allow `icmp` from `10.10.0.0/16`, all VMs'
                  ],
                  code: [
                    'gcloud compute firewall-rules create $PFX-allow-iap --network=$PFX-prod --allow=tcp:22 --source-ranges=35.235.240.0/20',
                    'gcloud compute firewall-rules create $PFX-allow-http --network=$PFX-prod --allow=tcp:80 --source-ranges=0.0.0.0/0 --target-tags=web',
                    'gcloud compute firewall-rules create $PFX-allow-icmp --network=$PFX-prod --allow=icmp --source-ranges=10.10.0.0/16'
                  ]
                },
                {
                  title: 'Task 3b · The app, deny and data rules',
                  text: '`allow-app` uses a source tag (which only matches VMs in the same network). `deny-app` at 2000 loses to 1000 and exists so blocked traffic shows up in the logs, which the implied deny never does. The data network needs its own IAP rule.',
                  spec: [
                    '`$PFX-allow-app`: allow `tcp:8080`, source tag `web`, target tag `app`, logging on',
                    '`$PFX-deny-app`: deny `tcp:8080`, priority 2000, from `0.0.0.0/0`, target tag `app`, logging on',
                    '`$PFX-data-iap`: in `$PFX-data`, allow `tcp:22` from `35.235.240.0/20`'
                  ],
                  code: [
                    'gcloud compute firewall-rules create $PFX-allow-app --network=$PFX-prod --allow=tcp:8080 --enable-logging --source-tags=web --target-tags=app',
                    'gcloud compute firewall-rules create $PFX-deny-app --network=$PFX-prod --action=DENY --rules=tcp:8080 --priority=2000 --enable-logging --source-ranges=0.0.0.0/0 --target-tags=app',
                    'gcloud compute firewall-rules create $PFX-data-iap --network=$PFX-data --allow=tcp:22 --source-ranges=35.235.240.0/20'
                  ]
                }
              ]
            },
            {
              kind: 'firewall',
              title: 'Exercise: the LAB01 rules in the prod network',
              vms: [
                { name: 'web', ip: '10.10.1.2', tags: ['web'], sa: SA_WEB },
                { name: 'probe', ip: '10.10.1.3', tags: [], sa: SA_WEB },
                { name: 'app', ip: '10.10.2.2', tags: ['app'], sa: SA_APP }
              ],
              rules: [
                { name: 'allow-iap', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:22', sources: ['35.235.240.0/20'] },
                { name: 'allow-http', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:80', sources: ['0.0.0.0/0'], targetTags: ['web'] },
                { name: 'allow-icmp', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'icmp', sources: ['10.10.0.0/16'] },
                { name: 'allow-app', direction: 'INGRESS', priority: 1000, action: 'allow', ports: 'tcp:8080', sourceTags: ['web'], targetTags: ['app'] },
                { name: 'deny-app', direction: 'INGRESS', priority: 2000, action: 'deny', ports: 'tcp:8080', sources: ['0.0.0.0/0'], targetTags: ['app'] }
              ],
              packets: [
                { direction: 'INGRESS', peer: '203.0.113.25', vm: 'web', proto: 'tcp', port: 80, expect: 'allow' },
                { direction: 'INGRESS', peer: 'web', vm: 'app', proto: 'tcp', port: 8080, expect: 'allow' },
                { direction: 'INGRESS', peer: 'web', vm: 'app', proto: 'icmp', expect: 'allow' },
                { direction: 'INGRESS', peer: 'web', vm: 'app', proto: 'tcp', port: 80, expect: 'deny' },
                { direction: 'INGRESS', peer: 'probe', vm: 'app', proto: 'tcp', port: 8080, expect: 'deny' },
                { direction: 'INGRESS', peer: '35.235.241.7', vm: 'app', proto: 'tcp', port: 22, expect: 'allow' },
                { direction: 'INGRESS', peer: '203.0.113.25', vm: 'app', proto: 'tcp', port: 8080, expect: 'deny' }
              ],
              after: 'Rows 1 to 5 are the lab’s Tests 1, 2, 3, 4 and 6. Test 4 falls to the implied deny, because no rule opens port 80 on `app`. Test 6 is the point of the probe VM: it sits in the same subnet as `web` but has no `web` tag, so `allow-app` skips it and `deny-app` catches it, and the deny is logged. Test 5 (web → db) cannot be drawn here: there is no route between the two networks at all, so the firewall never sees it.'
            },
            {
              kind: 'quiz',
              q: 'Rule A allows tcp:8080 from tag `web` at priority 1000. Rule B denies tcp:8080 from all sources at priority 2000. A web VM connects to the app VM on 8080. What happens?',
              options: ['Allowed, because rule A has the lower priority number', 'Blocked, because a deny rule always wins', 'Blocked, because rule B was created later', 'Allowed, but only if logging is on for rule A'],
              answer: 0,
              explain: 'Deny wins only a tie. At 1000 against 2000, rule A is evaluated first and matches.'
            }
          ]
        },
        {
          id: 's14-validate',
          title: 'Tasks 4–5: six tests, logs, Connectivity Tests and cleanup',
          blocks: [
            {
              kind: 'table',
              caption: 'Test matrix: three succeed, three are blocked',
              columns: ['Test', 'Path', 'Expected', 'Decided by'],
              rows: [
                ['1', 'Cloud Shell → web, port 80', 'Page returns', '`allow-http`'],
                ['2', 'web → app, port 8080', 'Page returns', '`allow-app`'],
                ['3', 'web → app, ping', 'Replies', '`allow-icmp`'],
                ['4', 'web → app, port 80', 'Timeout', 'Implied deny ingress'],
                ['5', 'web → db, ping and 8080', 'No reply', 'No route between the networks'],
                ['6', 'probe → app, port 8080', 'Timeout', '`deny-app`']
              ]
            },
            {
              kind: 'p',
              text: '**Task 4.** List the VMs to get their IPs. Open two Cloud Shell tabs and SSH through IAP into `$PFX-web` and `$PFX-probe` (`--tunnel-through-iap`). Run Test 1 from Cloud Shell, Tests 2 to 5 inside the web VM and Test 6 inside the probe VM, with `curl -m 5` for ports and `ping -c 3` for ICMP.'
            },
            {
              kind: 'code',
              reveal: true,
              title: 'Connect with IAP and run the tests',
              lines: [
                '$ gcloud compute instances list --filter="name~^$PFX"',
                '$ gcloud compute ssh $PFX-web --tunnel-through-iap      # tab 1',
                '$ gcloud compute ssh $PFX-probe --tunnel-through-iap    # tab 2',
                '# Test 1, from Cloud Shell',
                '$ curl -m 5 http://WEB_EXTERNAL_IP',
                '# Tests 2 to 5, in the web VM',
                '$ curl -m 5 http://APP_INTERNAL_IP:8080',
                '$ ping -c 3 APP_INTERNAL_IP',
                '$ curl -m 5 http://APP_INTERNAL_IP:80',
                '$ ping -c 3 DB_INTERNAL_IP; curl -m 5 http://DB_INTERNAL_IP:8080',
                '# Test 6, in the probe VM',
                '$ curl -m 5 http://APP_INTERNAL_IP:8080'
              ]
            },
            {
              kind: 'table',
              caption: 'Reading the results',
              columns: ['Allowed looks like', 'Blocked looks like'],
              rows: [
                ['curl prints the target VM’s hostname', '`curl: (28) Connection timed out after 5 seconds`'],
                ['ping shows 0% packet loss', 'ping shows 100% packet loss'],
                ['The connection opens within a second', 'A silent timeout points to the firewall']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '**Timeout vs refused**: a silent timeout means the firewall dropped the packet. "Connection refused" means the firewall **allowed** it and nothing is listening on that port, so look at the server, not the rules.'
            },
            {
              kind: 'p',
              text: '**Task 5.** In Logs Explorer, filter the firewall log (`compute.googleapis.com/firewall`) for entries whose rule is `deny-app`. Then create one Connectivity Test per path, all TCP to port 8080: `web → app`, `probe → app` and `web → db`, named `$PFX-web-app` and so on, and read each result.'
            },
            {
              kind: 'code',
              reveal: true,
              title: 'Task 5: firewall logs, then Connectivity Tests',
              lines: [
                '# Logs Explorer query (entries take a minute or two)',
                'resource.type="gce_subnetwork"',
                'logName:"compute.googleapis.com%2Ffirewall"',
                'jsonPayload.rule_details.reference:"deny-app"',
                '# The same filter with gcloud',
                "$ gcloud logging read 'resource.type=\"gce_subnetwork\" AND jsonPayload.rule_details.reference:\"deny-app\"' --limit=3 --freshness=1h",
                '# One Connectivity Test per path, analysed without sending traffic',
                '$ B=projects/$(gcloud config get-value project)/zones/$ZONE/instances',
                '$ t() { gcloud network-management connectivity-tests create $PFX-$1-$2 --protocol=TCP --destination-port=8080 \\',
                '    --source-instance=$B/$PFX-$1 --destination-instance=$B/$PFX-$2; }',
                '$ t web app; t probe app; t web db',
                '$ gcloud network-management connectivity-tests describe $PFX-web-app --format="value(reachabilityDetails.result)"'
              ]
            },
            {
              kind: 'table',
              caption: 'Results to expect',
              columns: ['Test', 'Result', 'Why'],
              rows: [
                ['`$PFX-web-app`', 'REACHABLE', '`allow-app` permits tcp:8080 from the web tag'],
                ['`$PFX-probe-app`', 'UNREACHABLE', 'Dropped by the `deny-app` rule'],
                ['`$PFX-web-db`', 'UNREACHABLE', 'Dropped: no route to the data network']
              ]
            },
            {
              kind: 'p',
              text: 'In the log entries, `disposition` shows ALLOWED or DENIED, `connection` shows the source and destination IP and port, and `rule_details.reference` names the rule that matched. Expect ALLOWED for `allow-app` and DENIED for `deny-app`.'
            },
            {
              kind: 'p',
              text: '**Clean up in reverse order**, because a network cannot go while anything uses it: the three Connectivity Tests, then the four VMs, then the six firewall rules, then the three subnets, and the two networks last.'
            },
            {
              kind: 'code',
              reveal: true,
              title: 'Clean up in reverse order (a network cannot go while anything uses it)',
              lines: [
                '$ for T in web-app probe-app web-db; do gcloud network-management connectivity-tests delete $PFX-$T --quiet; done',
                '$ gcloud compute instances delete $PFX-web $PFX-app $PFX-probe $PFX-db --quiet',
                '$ gcloud compute firewall-rules delete $PFX-allow-iap $PFX-allow-http $PFX-allow-icmp $PFX-allow-app $PFX-deny-app $PFX-data-iap --quiet',
                '$ gcloud compute networks subnets delete $PFX-web $PFX-app $PFX-db --region=$REGION --quiet',
                '$ gcloud compute networks delete $PFX-prod $PFX-data --quiet'
              ]
            },
            {
              kind: 'table',
              caption: 'Troubleshooting',
              columns: ['Symptom', 'Cause'],
              rows: [
                ['SSH fails', '`allow-iap` missing, or IAP-secured Tunnel User not granted'],
                ['Test 1 times out', '`allow-http` missing, or the web VM lacks the `web` tag'],
                ['Subnet create fails', 'The range overlaps another subnet in the same network'],
                ['Test 6 succeeds', 'The probe VM has the `web` tag, so `allow-app` matches it'],
                ['No log entries yet', 'Wait a minute or two, then repeat Tests 2 and 6'],
                ['Test 4 times out', 'Expected: only 8080 is open from the web tag']
              ]
            },
            {
              kind: 'quiz',
              q: 'The probe VM and the web VM share a subnet, but only the web VM can reach the app VM on 8080. Why?',
              options: ['The probe VM has no external IP address', 'ICMP is blocked between the two VMs', '`allow-app` matches the `web` source tag, which the probe VM lacks', 'Subnets filter traffic by network tag'],
              answer: 2,
              explain: 'Firewall rules, not subnets, filter traffic. The source tag is what separates the two VMs.'
            },
            {
              kind: 'quiz',
              q: 'A VM has no external IP and you need an SSH session from Cloud Shell. What is the recommended approach?',
              options: ['Open tcp:22 to 0.0.0.0/0', 'Assign a temporary external IP address', 'Create a Cloud VPN tunnel to Cloud Shell', 'Use IAP TCP forwarding with `--tunnel-through-iap`'],
              answer: 3,
              explain: 'IAP TCP forwarding reaches private VMs from `35.235.240.0/20`, checked against IAM, with no public exposure.'
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
              kind: 'table',
              caption: 'HA VPN vs Classic VPN',
              columns: ['HA VPN (recommended)', 'Classic VPN (legacy)'],
              rows: [
                ['Gateway with **two interfaces** and two external IPs', 'One interface, one external IP'],
                ['**99.99%** SLA with two tunnels configured', '99.9% SLA'],
                ['Dynamic routing only: BGP through Cloud Router', 'Static routing (route-based or policy-based)'],
                ['Active/active or active/passive tunnels', 'No redundancy within one gateway'],
                ['IPv6 (dual-stack) and HA VPN over Interconnect', 'Keep only for existing or static-only peers']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Active/active**: both tunnels carry traffic at equal route priority and failover is automatic. **Active/passive**: different priorities make one tunnel preferred; the other takes over after a failure.',
                '**Capacity**: about 3 Gbps per tunnel. Add tunnels and let ECMP spread the traffic.',
                'The peer can be an on-premises device, another cloud, or another HA VPN gateway. Cipher options (GA, September 2025) and predefined monitoring dashboards (GA, December 2025) are recent additions.'
              ]
            },
            {
              kind: 'code',
              title: 'HA VPN, in outline',
              lines: [
                '$ gcloud compute vpn-gateways create ha-gw --network=prod-vpc --region=asia-southeast2',
                '$ gcloud compute routers create vpn-router --network=prod-vpc --region=asia-southeast2 --asn=65001',
                '$ gcloud compute external-vpn-gateways create office-gw --interfaces=0=203.0.113.10,1=203.0.113.11',
                '$ gcloud compute vpn-tunnels create tun-0 --region=asia-southeast2 --vpn-gateway=ha-gw --interface=0 \\',
                '    --peer-external-gateway=office-gw --peer-external-gateway-interface=0 --router=vpn-router \\',
                '    --ike-version=2 --shared-secret=SECRET',
                '# repeat tun-1 on interface 1; then, per tunnel, routers add-interface and add-bgp-peer',
                '$ gcloud compute routers add-bgp-peer vpn-router --region=asia-southeast2 --peer-name=office-0 \\',
                '    --interface=if-tunnel-0 --peer-ip-address=169.254.0.2 --peer-asn=65002',
                '$ gcloud compute routers get-status vpn-router --region=asia-southeast2'
              ]
            },
            {
              kind: 'table',
              caption: 'Numbers to remember',
              columns: ['Number', 'Meaning'],
              rows: [
                ['**99.99%**', 'HA VPN SLA with two tunnels on two interfaces'],
                ['**3 Gbps**', 'Approximate throughput per VPN tunnel'],
                ['**10 / 100 Gbps**', 'Dedicated or Cross-Cloud Interconnect circuits (400 Gbps connections are now GA too)'],
                ['**50 Mbps – 50 Gbps**', 'One Partner Interconnect VLAN attachment'],
                ['**64512–65534**', 'Private ASN range for Cloud Router; Partner Interconnect uses Google’s ASN **16550** on the attachment']
              ]
            },
            {
              kind: 'table',
              caption: 'The Cloud Interconnect family',
              columns: ['Product', 'How you get it'],
              rows: [
                ['Dedicated Interconnect', 'You meet Google in a colocation facility. Order circuits, receive the **LOA-CFA**, have the cross-connect run, then add VLAN attachments'],
                ['Partner Interconnect', 'A provider already connects to Google. Create a VLAN attachment and share its **pairing key** with the partner'],
                ['Cross-Cloud Interconnect', 'Google provisions dedicated links into AWS, Azure, OCI or Alibaba Cloud for multicloud data and apps']
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Order', text: 'Pick a colocation facility and 10 or 100 Gbps circuits.' },
                { title: 'LOA-CFA', text: 'Google issues the Letter of Authorization and Connecting Facility Assignment; the cross-connect is run.' },
                { title: 'Test', text: 'Google tests the circuit, then it goes live.' },
                { title: 'VLAN attachment', text: 'Attach a VLAN to a Cloud Router in the region.' },
                { title: 'BGP', text: 'Configure BGP on your router to exchange routes.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Interconnect availability depends on the topology, not the product name',
              columns: ['Level', 'Topology', 'Notes'],
              rows: [
                ['Non-critical', 'One connection', 'No SLA'],
                ['Production, 99.9%', 'Redundant connections in **one metro**, different edge availability domains', 'Two VLAN attachments on two Cloud Routers'],
                ['Critical production, 99.99%', 'Redundant connections across **two metros**', 'A single-region Critical SLA went GA in June 2026']
              ]
            },
            {
              kind: 'table',
              caption: 'Encrypting Interconnect traffic (private, but not encrypted by default)',
              columns: ['Option', 'Layer', 'Notes'],
              rows: [
                ['**MACsec**', 'Layer 2, between your router and Google', 'Dedicated and Cross-Cloud Interconnect'],
                ['**HA VPN over Cloud Interconnect**', 'IPsec over the VLAN attachments', 'Stays on the private path and adds encryption'],
                ['Application TLS', 'Layer 7', 'Independent of the network path']
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud Router and BGP settings that matter',
              columns: ['Setting', 'What it does', 'Notes'],
              rows: [
                ['What it is', 'Regional, managed BGP control plane', '**Not in the data path**: traffic never flows through it'],
                ['Advertised route priority', 'Ranks routes from the same peer', 'Default 100; lower is preferred'],
                ['Custom advertisements', 'Choose which ranges are announced', 'Default is all subnets; add ranges such as the Private Google Access VIPs'],
                ['BFD', 'Detects link failure faster than BGP timers', 'Optional, per BGP session'],
                ['Dynamic routing mode', 'Where learned routes apply', 'Regional by default; global for every region']
              ]
            },
            {
              kind: 'terms',
              items: [
                { term: 'Network Connectivity Center (NCC)', meaning: 'A global **hub** that connects **spokes** and exchanges routes between them.', analogy: 'An airport hub: fly every route through one place instead of building a direct flight between every pair of cities.', example: 'VPC spokes give many VPCs transitive reachability, which peering lacks. Hybrid spokes (HA VPN, Interconnect VLAN attachments, router appliances) allow site-to-site transfer.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Connectivity decision framework',
              columns: ['Need', 'Answer'],
              rows: [
                ['Encrypted, quick to set up, a few Gbps', 'HA VPN (99.99% with 2 tunnels)'],
                ['10+ Gbps, near a colocation facility', 'Dedicated Interconnect'],
                ['Under 10 Gbps, or far from a colocation facility', 'Partner Interconnect'],
                ['High bandwidth to AWS or Azure', 'Cross-Cloud Interconnect'],
                ['Two VPCs with separate admins', 'VPC Network Peering'],
                ['Many VPCs and sites that need transit', 'Network Connectivity Center']
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
            },
            {
              kind: 'quiz',
              q: 'Traffic on a 10 Gbps Dedicated Interconnect must be encrypted at layer 2. What should be enabled?',
              options: ['MACsec', 'Classic VPN with static routes', 'Cloud NAT', 'VPC Network Peering'],
              answer: 0,
              explain: 'MACsec encrypts at layer 2 between your router and Google’s edge on Dedicated and Cross-Cloud Interconnect. HA VPN over Interconnect would encrypt at layer 3 instead.'
            },
            {
              kind: 'quiz',
              q: 'Several VPC networks and branch sites must exchange routes through one central hub. Which service fits?',
              options: ['VPC Network Peering between each pair', 'Network Connectivity Center', 'Cloud NAT', 'Classic VPN'],
              answer: 1,
              explain: 'NCC is the hub-and-spoke service: VPC spokes and hybrid spokes reach each other through the hub, transitively.'
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
                'VMs get internal names automatically, `VM.ZONE.c.PROJECT.internal` (zonal DNS). Cloud DNS has a 100% availability SLA.',
                '**Return path**: queries forwarded to on-premises come from `35.199.192.0/19`. Your on-premises network must route the replies back (advertise that range over the VPN or Interconnect).',
                'An **inbound server policy** creates entry-point IPs in each subnet region. On-premises DNS forwards `corp.internal` to those IPs, and the private zones answer.',
                'For a **public zone**, update the registrar’s NS records to Cloud DNS. Zone DNS names end with a trailing dot.'
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Response policy', text: 'Response policy rules that match the name are applied first.' },
                { title: 'Zones', text: 'Private, forwarding and peering zones. The longest matching suffix wins.' },
                { title: 'Internal DNS', text: 'Compute Engine internal DNS answers the names of VMs in the project.' },
                { title: 'Public DNS', text: 'Everything else is resolved through public DNS.' }
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
                '$ gcloud dns managed-zones create shop-public --dns-name=shop.example.com. --dnssec-state=on --description="public"',
                '# Peering zone: the spoke uses the hub VPC’s DNS view',
                '$ gcloud dns managed-zones create hub-peer --dns-name=corp.internal. --description="peer" --visibility=private \\',
                '    --networks=spoke-vpc --target-network=hub-vpc --target-project=hub-prj',
                '$ gcloud dns record-sets create app.corp.internal. --zone=corp-internal --type=CNAME --ttl=300 --rrdatas=db.corp.internal.',
                '$ gcloud dns record-sets list --zone=corp-internal'
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud DNS features beyond zones and records',
              columns: ['Feature', 'What it does'],
              rows: [
                ['DNSSEC', 'Signs public zone records so resolvers can validate the answers'],
                ['Response policies', 'Override answers for chosen names inside VPCs, for example to block a domain'],
                ['DNS Armor', 'Watches internet-bound DNS queries for malicious activity (GA, January 2026)'],
                ['Alias records', 'CNAME-like mapping at the zone apex (GA, September 2025)'],
                ['DNS64', 'Synthesizes IPv6 addresses for IPv4-only destinations'],
                ['Query logging', '`--enable-logging` on a VPC DNS server policy'],
                ['Record types', 'A, AAAA, CNAME, MX, TXT, SRV, PTR… TTL controls how long resolvers cache']
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
              kind: 'table',
              caption: 'NAT gateway types',
              columns: ['Type', 'Translates', 'Use'],
              rows: [
                ['Public NAT', 'Private VM addresses → external NAT IPs', 'Internet egress'],
                ['Private NAT', 'Between private ranges', 'Overlapping networks (NCC spokes, hybrid)'],
                ['NAT64 (Private NAT)', 'IPv6 → IPv4', 'GA in October 2026']
              ]
            },
            {
              kind: 'table',
              caption: 'Ports and tuning: tune the gateway before adding IPs',
              columns: ['Setting', 'Value'],
              rows: [
                ['Ports per NAT IP', 'About 64,000 (1024–65535) per protocol'],
                ['Minimum ports per VM', 'Default **64**. Raise it for VMs that open many connections'],
                ['Dynamic port allocation', 'Ports per VM grow and shrink with demand between a minimum and a maximum'],
                ['TCP TIME_WAIT', '30 seconds by default on new gateways (March 2026)'],
                ['NAT rules', 'Choose which NAT IPs are used; source-based rules for IPv4 are GA (April 2026)'],
                ['Logging', 'Translations and errors, or errors only, to find dropped connections']
              ]
            },
            {
              kind: 'table',
              caption: 'Private Google Access vs Cloud NAT: both help VMs without external IPs, to different destinations',
              columns: ['Private Google Access', 'Cloud NAT'],
              rows: [
                ['Reaches Google APIs (Cloud Storage, BigQuery…)', 'Reaches the public internet (repos, SaaS APIs)'],
                ['Enabled per **subnet**', 'Configured per **region** on a Cloud Router'],
                ['No NAT IPs; traffic stays on Google’s network', 'Uses NAT external IPs (auto or manual)'],
                ['`--enable-private-ip-google-access`', '`gcloud compute routers nats create`'],
                ['On-premises variant: `private.googleapis.com` / `restricted.googleapis.com`', 'Outbound only: no inbound connections']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Cloud NAT ignores VMs that already have an external IP**: they use their own address.',
                '**Port exhaustion** shows as dropped connections: raise the minimum ports per VM or add NAT IPs, and check the NAT logs.',
                '**No inbound**: for inbound access use a load balancer or IAP.',
                '**Firewall egress rules still apply**: if you tightened the implied allow egress, allow egress to `0.0.0.0/0` for the NATed VMs.',
                'A NAT gateway serves **one region**: create one per region you use. There is no proxy VM and no single point of failure.'
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
            },
            {
              kind: 'quiz',
              q: 'A spoke VPC must resolve names in a private zone owned by a hub VPC. What should the spoke use?',
              options: ['A public zone', 'A DNS peering zone that targets the hub network', 'A forwarding zone to a public resolver', 'Cloud NAT'],
              answer: 1,
              explain: 'A peering zone lets one VPC resolve names with another VPC’s DNS configuration, which is the usual hub-and-spoke or Shared VPC pattern.'
            },
            {
              kind: 'quiz',
              q: 'VMs without external IPs must reach only Google APIs such as Cloud Storage. What is the simplest setting?',
              options: ['Cloud NAT with auto-allocated IPs', 'Private Google Access on the subnet', 'An external IP on each VM', 'Classic VPN'],
              answer: 1,
              explain: 'Private Google Access is a per-subnet switch for Google APIs. NAT is for the wider internet.'
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
                '$ gcloud compute project-info describe --format="value(defaultNetworkTier)"',
                '$ gcloud compute project-info update --default-network-tier=STANDARD',
                '$ gcloud compute instances create web-1 --zone=asia-southeast2-a --network-tier=PREMIUM',
                '$ gcloud compute addresses create web-std --region=asia-southeast2 --network-tier=STANDARD',
                '# Audit the tier of every address',
                '$ gcloud compute addresses list --format="table(name,region,networkTier)"'
              ]
            },
            {
              kind: 'table',
              caption: 'Which resources support which tier',
              columns: ['Resource', 'Tier', 'Notes'],
              rows: [
                ['VM external IP', 'Premium or Standard', 'Per address, or the project default'],
                ['Regional external IP', 'Premium or Standard', '`--network-tier`'],
                ['Global external IP', '**Premium only**', 'Used by global external load balancers'],
                ['Global external ALB and proxy NLB', '**Premium only**', 'One anycast IP, backends in many regions'],
                ['Classic ALB and proxy NLB', 'Premium or Standard', 'Global in Premium, regional in Standard'],
                ['Regional external ALB and proxy NLB', 'Premium or Standard', 'Tier follows the forwarding rule address'],
                ['Regional external passthrough NLB', 'Premium or Standard', 'Keeps the client IP'],
                ['Internal load balancers', 'Premium', 'Used inside a VPC']
              ]
            },
            {
              kind: 'table',
              caption: 'Where tiers apply: only external traffic between the internet and Google Cloud',
              columns: ['Traffic path', 'Tier applies?'],
              rows: [
                ['Internet users to external IP addresses', 'Yes'],
                ['VM to VM inside a VPC network', 'No'],
                ['On-premises over Cloud VPN or Interconnect', 'No'],
                ['VMs reaching Google APIs with Private Google Access', 'No']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Changing the project default does not change existing resources**: it applies only to new ones.',
                'Ingress is generally not charged in either tier; Standard egress is cheaper for most destinations. Prices change, so check the pricing page before comparing.',
                'Decide with four questions: where are the users, how latency-sensitive is the app, which load balancer, and how much egress. Global or latency-sensitive → Premium; one region, dev/test or cost-sensitive → Standard; a mixed estate → set a default and override per address.',
                'External IPv6 for Standard Tier entered Preview in October 2026.'
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
            },
            {
              kind: 'quiz',
              q: 'The project default tier is changed from Premium to Standard. What happens to existing external IP addresses?',
              options: ['All are converted immediately', 'They keep their tier; the default applies to new resources', 'They are released', 'They move to another region'],
              answer: 1,
              explain: 'The default is only a default. Existing addresses keep the tier they were created with.'
            },
            {
              kind: 'quiz',
              q: 'Traffic between two VMs in the same VPC is slow. A teammate suggests switching to Premium Tier. Will it help?',
              options: ['Yes, Premium uses the backbone for all traffic', 'No, tiers apply only to traffic between the internet and Google Cloud', 'Yes, but only across regions', 'No, internal traffic always uses Standard'],
              answer: 1,
              explain: 'Network Service Tiers affect only internet-facing traffic. VM-to-VM, VPN, Interconnect and Private Google Access traffic are not tiered.'
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
            {
              kind: 'p',
              text: 'Cloud Load Balancing is **software-defined**: no instances to manage and no pre-warming. Global load balancers expose **one anycast IP** worldwide; health checks take unhealthy backends out and traffic fails over to other zones or regions; Cloud CDN, Cloud Armor, Google-managed certificates and IAP plug into the same load balancer. The course selection order has five steps: **protocol → exposure → scope → proxy or passthrough → network tier**.'
            },
            {
              kind: 'table',
              caption: 'Two families: what protocol does the client speak?',
              columns: ['Application Load Balancers (L7)', 'Network Load Balancers (L4)'],
              rows: [
                ['HTTP, HTTPS, HTTP/2, gRPC, WebSockets', 'TCP, UDP, SSL/TLS and other IP protocols'],
                ['Content-based routing with URL maps (host and path)', 'Proxy: terminates TCP/SSL, then opens a new connection'],
                ['TLS termination, Cloud CDN, Cloud Armor, IAP', 'Passthrough: packets reach backends unchanged'],
                ['Always a proxy (GFE or Envoy)', 'Passthrough keeps the client source IP; backends reply directly'],
                ['Backends: MIGs, zonal NEGs, serverless NEGs, buckets', 'Non-HTTP apps, gaming, databases, UDP']
              ]
            },
            {
              kind: 'table',
              caption: 'Application Load Balancer variants',
              columns: ['Variant', 'Scope', 'Exposure', 'Scheme · proxy'],
              rows: [
                ['Global external ALB', 'Global', 'Internet', '`EXTERNAL_MANAGED` · Envoy'],
                ['Classic ALB', 'Global (Premium)', 'Internet', '`EXTERNAL` · GFE (legacy)'],
                ['Regional external ALB', 'Regional', 'Internet', '`EXTERNAL_MANAGED` · Envoy'],
                ['Regional internal ALB', 'Regional', 'VPC only', '`INTERNAL_MANAGED` · Envoy'],
                ['Cross-region internal ALB', 'Global', 'VPC only', '`INTERNAL_MANAGED` · Envoy']
              ]
            },
            {
              kind: 'table',
              caption: 'Network Load Balancer variants',
              columns: ['Variant', 'Kind', 'Notes'],
              rows: [
                ['External proxy NLB', 'Proxy', 'Global or regional TCP proxy; optional SSL offload with a target SSL proxy (TLS ends at Google’s edge)'],
                ['Internal proxy NLB', 'Proxy', 'Regional or cross-region TCP proxy for private clients'],
                ['External passthrough NLB', 'Passthrough', 'Regional. TCP, UDP, ESP, ICMP. Keeps the client IP; backends reply directly'],
                ['Internal passthrough NLB', 'Passthrough', 'Regional private IP for TCP/UDP. Can be a **next hop** for routes (appliances)'],
                ['Target pools', 'Legacy', 'Older external passthrough backend; prefer backend-service-based NLBs']
              ]
            },
            {
              kind: 'table',
              caption: 'Load balancing schemes: the frontend and the backend service must match',
              columns: ['Scheme', 'Used by'],
              rows: [
                ['`EXTERNAL_MANAGED`', 'Global and regional external ALBs, external proxy NLBs (Envoy, current generation)'],
                ['`EXTERNAL`', 'Classic ALB, classic proxy NLB, regional external passthrough NLB'],
                ['`INTERNAL_MANAGED`', 'Regional and cross-region internal ALBs and proxy NLBs (needs a proxy-only subnet)'],
                ['`INTERNAL`', 'Internal passthrough NLB']
              ]
            },
            {
              kind: 'list',
              items: [
                '**Proxy-only subnets**: regional Envoy-based load balancers need one `REGIONAL_MANAGED_PROXY` subnet per region and VPC. Cross-region internal ALBs need a `GLOBAL_MANAGED_PROXY` subnet in each region they use. Backend firewall rules must allow the proxy-only range.',
                '**Only external load balancers can be global**. Internal and multi-region means the cross-region internal variant.'
              ]
            },
            {
              kind: 'table',
              caption: 'Backend types: pick the backend before the load balancer',
              columns: ['Backend', 'Used with', 'Typical use'],
              rows: [
                ['Managed instance group', 'Application and Network LBs', 'VMs with autoscaling and autohealing'],
                ['Zonal NEG', 'ALBs and proxy NLBs', 'GKE Pods or VM IP:port endpoints'],
                ['Serverless NEG', 'ALBs', 'Cloud Run, Cloud Run functions, App Engine'],
                ['Hybrid NEG', 'ALBs and proxy NLBs', 'On-premises or other-cloud endpoints'],
                ['Internet NEG', 'External ALBs', 'Endpoints outside Google Cloud, by IP or name'],
                ['Backend bucket', 'ALBs', 'Static content in Cloud Storage (regional ALBs too since April 2026)']
              ]
            },
            {
              kind: 'table',
              caption: 'Quick selection guide',
              columns: ['Need', 'Load balancer'],
              rows: [
                ['Global website with HTTPS and CDN', 'Global external Application LB'],
                ['Internal microservices over HTTP, one region', 'Regional internal Application LB'],
                ['Internet TCP app, TLS offload, global users', 'Global external proxy NLB (SSL proxy)'],
                ['UDP, or client IP preserved, from the internet', 'External passthrough NLB'],
                ['Private TCP/UDP, or next hop to firewall VMs', 'Internal passthrough NLB'],
                ['Internal HTTP with multi-region failover', 'Cross-region internal Application LB'],
                ['Public HTTPS, data must stay in one region, Standard Tier', 'Regional external Application LB']
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
            },
            {
              kind: 'quiz',
              q: 'A multiplayer game server uses UDP and must see each player’s original source IP. Players connect from the internet to servers in one region. Which load balancer fits?',
              options: ['Global external Application Load Balancer', 'External proxy Network Load Balancer', 'External passthrough Network Load Balancer', 'Regional internal Application Load Balancer'],
              answer: 2,
              explain: 'UDP and the client IP both point to passthrough: packets reach the backends unchanged. Proxies terminate the connection and do not carry UDP.'
            },
            {
              kind: 'quiz',
              q: 'All traffic processing must stay in asia-southeast2 for data residency, and the team wants the cheaper Standard Tier for a public HTTPS site. Which load balancer?',
              options: ['Global external Application LB', 'Classic Application LB', 'Regional external Application LB', 'Cross-region internal Application LB'],
              answer: 2,
              explain: 'Regional keeps processing in the region and works with Standard Tier. The global ALB needs Premium, and the cross-region internal ALB is not public.'
            },
            {
              kind: 'quiz',
              q: 'Firewall appliance VMs must be used as the next hop of a route. Which load balancer fits?',
              options: ['Global external Application Load Balancer', 'Internal passthrough Network Load Balancer', 'Regional external Application Load Balancer', 'Cross-region internal Application Load Balancer'],
              answer: 1,
              explain: 'Only the internal passthrough NLB can be a route next hop (`--next-hop-ilb`), spreading traffic across healthy appliances.'
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
              title: 'Step 1 · Template, regional MIG, named port and autoscaling',
              lines: [
                '$ gcloud compute instance-templates create web-tmpl --machine-type=e2-small --tags=web \\',
                '    --image-family=debian-12 --image-project=debian-cloud \\',
                "    --metadata=startup-script='apt-get update; apt-get install -y nginx'",
                '$ gcloud compute instance-groups managed create web-mig --template=web-tmpl --size=2 --region=asia-southeast2',
                '# The named port links the backend service’s port name to the VM port',
                '$ gcloud compute instance-groups set-named-ports web-mig --named-ports=http:80 --region=asia-southeast2',
                '$ gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 \\',
                '    --min-num-replicas=2 --max-num-replicas=6 --target-cpu-utilization=0.6'
              ]
            },
            {
              kind: 'code',
              title: 'Steps 2–3 · Health check, backend service, URL map, proxy and frontend',
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
                '    --network-endpoint-type=serverless --cloud-run-service=shop',
                '$ gcloud compute backend-services add-backend api-be --global --network-endpoint-group=shop-neg \\',
                '    --network-endpoint-group-region=asia-southeast2',
                '# Path rules: /api/* to Cloud Run, the rest to the MIG',
                '$ gcloud compute url-maps add-path-matcher web-map --path-matcher-name=api-paths --default-service=web-be \\',
                '    --path-rules="/api/*=api-be" --new-hosts=shop.example.com',
                '# Edit the whole map as YAML, and keep it in version control',
                '$ gcloud compute url-maps export web-map --destination=map.yaml --global',
                '$ gcloud compute url-maps import web-map --source=map.yaml --global'
              ]
            },
            {
              kind: 'table',
              caption: 'Health check settings',
              columns: ['Setting', 'Value'],
              rows: [
                ['Protocols', 'gRPC, gRPC with TLS, TCP, SSL, HTTP, HTTPS, HTTP/2'],
                ['Interval and timeout', '5 seconds by default; the timeout cannot exceed the interval'],
                ['Thresholds', '2 successes mark a backend healthy, 2 failures unhealthy'],
                ['Firewall', 'An ingress allow rule for the probe ranges, or the implied deny blocks them'],
                ['Serverless and PSC NEGs', '**No health checks**']
              ]
            },
            {
              kind: 'table',
              caption: 'Backend service settings',
              columns: ['Setting', 'Options', 'When to use'],
              rows: [
                ['Balancing mode', '`UTILIZATION`', 'VM instance groups; balance on CPU'],
                ['Balancing mode', '`RATE`', 'A target of requests per second per instance or endpoint'],
                ['Balancing mode', '`CONNECTION`', 'Network (TCP) load balancers'],
                ['Capacity scaler', '0.0 – 1.0', 'Drain a backend (0), or send a canary less traffic'],
                ['Session affinity', 'Client IP, cookie, header', 'Stateful apps that need sticky sessions'],
                ['Connection draining', 'Timeout in seconds', 'Let in-flight requests finish when a backend is removed']
              ]
            },
            {
              kind: 'table',
              caption: 'HTTPS: TLS terminates at the target HTTPS proxy',
              columns: ['Option', 'What it is'],
              rows: [
                ['Google-managed certificates', 'Google issues and renews them. The DNS A record must point at the LB IP (PROVISIONING → ACTIVE). Validity moves from 90 to 45 days (October 2026)'],
                ['Certificate Manager', 'Scales to many certificates: DNS authorization, wildcards, certificate maps'],
                ['Self-managed certificates', 'Upload your own certificate and key; you renew before expiry'],
                ['SSL policies', 'Minimum TLS version and a profile: COMPATIBLE, MODERN or RESTRICTED']
              ]
            },
            {
              kind: 'table',
              caption: 'Load balancer health check vs MIG autohealing: configure both',
              columns: ['', 'Load balancer health check', 'MIG autohealing'],
              rows: [
                ['Purpose', 'Decide which backends receive traffic', 'Recreate VMs that fail the application check'],
                ['On failure', 'Traffic stops going to the backend', 'The MIG deletes and recreates the VM'],
                ['Configured on', 'The backend service', 'The managed instance group'],
                ['Key setting', 'Interval and thresholds', '**Initial delay** longer than the app’s boot time']
              ]
            },
            {
              kind: 'list',
              items: [
                'A **regional MIG** spreads VMs across zones, so one zone failure does not remove all capacity. **Rolling updates** roll out a new template while the load balancer keeps serving; **connection draining** finishes in-flight requests.',
                'Use a lightweight `/healthz` that checks the app, not just the web server.',
                'If the autohealing initial delay is shorter than boot time, the MIG recreates VMs in a loop.',
                'Do not mix schemes: an `EXTERNAL_MANAGED` frontend needs an `EXTERNAL_MANAGED` backend service. Allow a few minutes for a global load balancer to propagate.'
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
            },
            {
              kind: 'quiz',
              q: 'Which balancing mode targets a number of requests per second for each backend instance?',
              options: ['UTILIZATION', 'RATE', 'CONNECTION', 'AFFINITY'],
              answer: 1,
              explain: '`RATE` balances on requests per second. `UTILIZATION` uses CPU, `CONNECTION` is for TCP load balancers, and affinity is not a balancing mode.'
            },
            {
              kind: 'quiz',
              q: 'A MIG keeps recreating VMs just after boot, because the application needs three minutes to start. What should change?',
              options: ['Increase the autohealing initial delay', 'Disable the load balancer', 'Switch to a zonal MIG', 'Use Standard Tier'],
              answer: 0,
              explain: 'The initial delay tells autohealing to wait before judging a new VM. Set it longer than the boot time.'
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
                '$ gcloud compute backend-services update web-be --global --security-policy=web-waf',
                '# Block a known abusive CIDR',
                '$ gcloud compute security-policies rules create 900 --security-policy=web-waf --action=deny-403 \\',
                '    --src-ip-ranges=198.51.100.0/24'
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'Request', text: 'The client reaches a Google edge location near the user.' },
                { title: 'Cache lookup', text: 'The **cache key** is built from the protocol, host, path and query string settings.' },
                { title: 'Hit', text: 'A fresh cached copy is returned from the edge.' },
                { title: 'Miss', text: 'The request goes to the backend; a cacheable response is stored for later.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Cache policy settings (per backend service or backend bucket)',
              columns: ['Setting', 'Purpose'],
              rows: [
                ['Default TTL', 'Freshness for responses that carry no max-age'],
                ['Max TTL', 'Upper limit; caps long Cache-Control values from the origin'],
                ['Client TTL', 'Freshness sent to browsers'],
                ['Negative caching', 'Caches error responses briefly to protect the origin'],
                ['Serve while stale', 'Serves expired content while the cache revalidates'],
                ['Cache key', 'Include or exclude protocol, host and query string to raise the hit ratio']
              ]
            },
            {
              kind: 'code',
              title: 'Cache keys, TTLs and checking the policy',
              lines: [
                '# Drop the query string from the cache key (tracking parameters split the cache)',
                '$ gcloud compute backend-services update web-be --global --no-cache-key-include-query-string',
                '$ gcloud compute backend-services update web-be --global --default-ttl=3600 --max-ttl=86400 --client-ttl=3600',
                '$ gcloud compute backend-services update web-be --global --serve-while-stale=86400',
                '$ gcloud compute backend-services describe web-be --global --format="yaml(cdnPolicy)"'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Low cache hit ratio checklist**: query strings that change per user (`?utm_id=…`) split the cache key; `private` or `no-store` responses are not cached in `CACHE_ALL_STATIC`; use `USE_ORIGIN_HEADERS` when the origin sends accurate Cache-Control; short TTLs expire objects before the next request. Check the predefined Cloud CDN dashboards.',
                '**`FORCE_CACHE_ALL` ignores private directives**: never use it for per-user content.',
                'New in 2026: cache policies in URL maps (by host, path, header or query), Cloud CDN with GKE Gateway, and **Private Bucket Access** to serve Cloud Storage without a public bucket.',
                '**Cloud Armor** also has CEL custom rules, organization-level (hierarchical) security policies, organization address groups and ModSecurity CRS 4.22 rulesets. Volumetric DDoS is absorbed at the edge before it reaches backends.'
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
            },
            {
              kind: 'quiz',
              q: 'An image-heavy site behind a global external ALB has a low CDN cache hit ratio. Its URLs carry a random tracking parameter (`?utm_id=…`). What is the best fix?',
              options: ['Switch to Standard Tier', 'Exclude the query string from the cache key', 'Use FORCE_CACHE_ALL for all content', 'Invalidate the cache every hour'],
              answer: 1,
              explain: 'Every distinct query string is a separate cache entry. Leaving it out of the key lets one cached image serve every visitor.'
            },
            {
              kind: 'quiz',
              q: 'Which cache mode caches content only when the origin sends valid caching headers?',
              options: ['CACHE_ALL_STATIC', 'USE_ORIGIN_HEADERS', 'FORCE_CACHE_ALL', 'NO_CACHE'],
              answer: 1,
              explain: '`USE_ORIGIN_HEADERS` trusts the origin’s Cache-Control. `CACHE_ALL_STATIC` also caches static types on its own, and `FORCE_CACHE_ALL` caches everything.'
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
              lab: true,
              items: [
                {
                  title: 'The VPC and three subnets',
                  text: 'A custom mode VPC with one subnet per tier, as in S13-01, all in Jakarta.',
                  spec: [
                    'Network: `prod-vpc`, `--subnet-mode=custom`, `--bgp-routing-mode=global`',
                    '`web-jkt`: `10.20.1.0/24`; `app-jkt`: `10.20.2.0/24`; `db-jkt`: `10.20.3.0/24`',
                    'Region: `asia-southeast2`; Private Google Access on all three'
                  ],
                  code: [
                    'gcloud compute networks create prod-vpc --subnet-mode=custom --bgp-routing-mode=global',
                    'gcloud compute networks subnets create web-jkt --network=prod-vpc --region=asia-southeast2 --range=10.20.1.0/24 --enable-private-ip-google-access',
                    'gcloud compute networks subnets create app-jkt --network=prod-vpc --region=asia-southeast2 --range=10.20.2.0/24 --enable-private-ip-google-access',
                    'gcloud compute networks subnets create db-jkt --network=prod-vpc --region=asia-southeast2 --range=10.20.3.0/24 --enable-private-ip-google-access'
                  ]
                },
                {
                  title: 'Cloud Router first, then Cloud NAT',
                  text: 'No VM in this lab gets an external IP, but they still need to install packages. Cloud NAT is a setting on a Cloud Router, so create the router, then the NAT gateway on it.',
                  spec: [
                    'Cloud Router: `prod-router`, network `prod-vpc`, region `asia-southeast2`',
                    'Cloud NAT: `prod-nat` on `prod-router`',
                    'NAT IPs: automatic; subnets: all ranges in the region'
                  ],
                  code: [
                    'gcloud compute routers create prod-router --network=prod-vpc --region=asia-southeast2',
                    'gcloud compute routers nats create prod-nat --router=prod-router --region=asia-southeast2 --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges'
                  ]
                },
                {
                  title: 'Secure tags for the tiers',
                  text: 'A tag key with the firewall purpose, bound to `prod-vpc`, and one value per tier. The platform team gets Tag User on the values, so only they can attach them.',
                  spec: [
                    'Key: `tier`, parent the project, `--purpose=GCE_FIREWALL`, `--purpose-data=network=PROJECT_ID/prod-vpc`',
                    'Values: `web`, `app`, `db`',
                    'Tag User (`roles/resourcemanager.tagUser`) on each value for `platform@example.com`'
                  ],
                  code: [
                    'gcloud resource-manager tags keys create tier --parent=projects/PROJECT_ID --purpose=GCE_FIREWALL --purpose-data=network=PROJECT_ID/prod-vpc',
                    'for V in web app db; do gcloud resource-manager tags values create $V --parent=PROJECT_ID/tier; done',
                    'for V in web app db; do gcloud resource-manager tags values add-iam-policy-binding PROJECT_ID/tier/$V --member=group:platform@example.com --role=roles/resourcemanager.tagUser; done'
                  ]
                },
                {
                  title: 'A global network firewall policy with four rules',
                  text: 'Only what is listed is allowed; everything else falls to the implied deny. Rules use secure tags, not network tags.',
                  spec: [
                    'Policy: `tier-policy`, global',
                    '1000: allow `tcp:80` from `130.211.0.0/22`, `35.191.0.0/16` to `tier=web` (load balancer and health checks)',
                    '1100: allow `tcp:8080` from `tier=web` to `tier=app`',
                    '1200: allow `tcp:5432` from `tier=app` to `tier=db`',
                    '1300: allow `tcp:22` from `35.235.240.0/20` to all VMs (IAP)'
                  ],
                  code: [
                    'gcloud compute network-firewall-policies create tier-policy --global',
                    'gcloud compute network-firewall-policies rules create 1000 --firewall-policy=tier-policy --global-firewall-policy --direction=INGRESS --action=allow --layer4-configs=tcp:80 --src-ip-ranges=130.211.0.0/22,35.191.0.0/16 --target-secure-tags=PROJECT_ID/tier/web',
                    'gcloud compute network-firewall-policies rules create 1100 --firewall-policy=tier-policy --global-firewall-policy --direction=INGRESS --action=allow --layer4-configs=tcp:8080 --src-secure-tags=PROJECT_ID/tier/web --target-secure-tags=PROJECT_ID/tier/app',
                    'gcloud compute network-firewall-policies rules create 1200 --firewall-policy=tier-policy --global-firewall-policy --direction=INGRESS --action=allow --layer4-configs=tcp:5432 --src-secure-tags=PROJECT_ID/tier/app --target-secure-tags=PROJECT_ID/tier/db',
                    'gcloud compute network-firewall-policies rules create 1300 --firewall-policy=tier-policy --global-firewall-policy --direction=INGRESS --action=allow --layer4-configs=tcp:22 --src-ip-ranges=35.235.240.0/20'
                  ]
                },
                {
                  title: 'Associate the policy with the VPC',
                  text: 'A policy does nothing until it is associated with a network.',
                  spec: [
                    'Policy `tier-policy` → network `prod-vpc`',
                    'Check: the policy shows under the VPC’s firewall policies'
                  ],
                  code: [
                    'gcloud compute network-firewall-policies associations create --firewall-policy=tier-policy --network=prod-vpc --global-firewall-policy',
                    'gcloud compute networks get-effective-firewalls prod-vpc'
                  ]
                },
                {
                  title: 'An instance template per tier, with its secure tag',
                  text: 'Templates carry the secure tag, so every VM a group creates is tagged from boot. No template gets an external IP.',
                  spec: [
                    '`web-t`: subnet `web-jkt`, tag `tier=web`, startup script that installs a web server on 80',
                    '`app-t`: subnet `app-jkt`, tag `tier=app`; `db-t`: subnet `db-jkt`, tag `tier=db`',
                    'All: `e2-small`, `debian-12`, `--no-address`, tags as `--resource-manager-tags=tagKeys/KEY_ID=tagValues/VALUE_ID` (IDs from `tags values list`)'
                  ],
                  code: [
                    'gcloud resource-manager tags values list --parent=PROJECT_ID/tier',
                    'gcloud compute instance-templates create web-t --machine-type=e2-small --image-family=debian-12 --image-project=debian-cloud --network=prod-vpc --subnet=web-jkt --region=asia-southeast2 --no-address --resource-manager-tags=tagKeys/KEY_ID=tagValues/WEB_ID --metadata-from-file=startup-script=web.sh',
                    '# app-t and db-t the same way, with their subnet and tag value'
                  ]
                },
                {
                  title: 'Health check, then the regional web MIG',
                  text: 'The health check must exist before the group that uses it. The group spreads over the zones of Jakarta, has a named port for the load balancer, and autoscales on CPU.',
                  spec: [
                    'Health check: `web-hc`, HTTP port 80',
                    'MIG: `web-mig`, regional, template `web-t`, size 3, autohealing on `web-hc`',
                    'Named port: `http:80`',
                    'Autoscaling: 3 to 6 VMs at 60% CPU',
                    'App and db groups: `app-mig` (size 2) and `db-mig` (size 1) from their templates'
                  ],
                  code: [
                    'gcloud compute health-checks create http web-hc --port=80',
                    'gcloud compute instance-groups managed create web-mig --region=asia-southeast2 --template=web-t --size=3 --health-check=web-hc --initial-delay=120',
                    'gcloud compute instance-groups set-named-ports web-mig --region=asia-southeast2 --named-ports=http:80',
                    'gcloud compute instance-groups managed set-autoscaling web-mig --region=asia-southeast2 --min-num-replicas=3 --max-num-replicas=6 --target-cpu-utilization=0.6'
                  ]
                },
                {
                  title: 'The external Application Load Balancer, back to front',
                  text: 'Backend service, URL map, certificate and HTTPS proxy, then a static IP and the forwarding rule. Point your domain’s A record at the IP so the certificate can be issued.',
                  spec: [
                    'Backend service: `web-be`, global, HTTP, port name `http`, health check `web-hc`, scheme `EXTERNAL_MANAGED`, backend `web-mig`',
                    'URL map `web-map`; Google-managed certificate `web-cert` for your domain',
                    'HTTPS proxy `web-proxy`; global address `web-ip`; forwarding rule `web-fr` on port 443',
                    'DNS: A record for the domain → `web-ip`'
                  ],
                  code: [
                    'gcloud compute backend-services create web-be --global --protocol=HTTP --port-name=http --health-checks=web-hc --load-balancing-scheme=EXTERNAL_MANAGED',
                    'gcloud compute backend-services add-backend web-be --global --instance-group=web-mig --instance-group-region=asia-southeast2',
                    'gcloud compute url-maps create web-map --default-service=web-be',
                    'gcloud compute ssl-certificates create web-cert --domains=shop.example.com --global',
                    'gcloud compute target-https-proxies create web-proxy --url-map=web-map --ssl-certificates=web-cert',
                    'gcloud compute addresses create web-ip --global',
                    'gcloud compute forwarding-rules create web-fr --global --load-balancing-scheme=EXTERNAL_MANAGED --address=web-ip --target-https-proxy=web-proxy --ports=443'
                  ]
                },
                {
                  title: 'Validate failover',
                  text: 'Delete the web VMs in one zone and watch the load balancer keep serving from the others, while the MIG recreates what it lost.',
                  spec: [
                    'Before: all backends HEALTHY in `get-health`',
                    'Delete the web VMs in one zone (names from `list-instances`)',
                    'After: traffic still served; the group shows `CREATING` until it is back to size'
                  ],
                  code: [
                    'gcloud compute backend-services get-health web-be --global',
                    'gcloud compute instance-groups managed list-instances web-mig --region=asia-southeast2',
                    'gcloud compute instances delete VM_NAME --zone=asia-southeast2-a --quiet'
                  ]
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
                ['regional Envoy LB not working', 'Proxy-only subnet'],
                ['smallest primary range', '/29'],
                ['public IP changed after stop/start', 'It was ephemeral: reserve a static IP'],
                ['route next hop is a VM', '`--can-ip-forward` on that VM'],
                ['routes from VPN needed in every region', '`--bgp-routing-mode=global`'],
                ['`goto_next`', 'Hand the decision to the next policy level'],
                ['see denied traffic in the logs', 'Explicit deny rule with logging (implied rules cannot log)'],
                ['SMTP out on tcp:25', 'Always blocked by Google Cloud'],
                ['team may use only one shared subnet', 'Network User on that subnet'],
                ['restrict which subnets / peerings', '`restrictSharedVpcSubnetworks` / `restrictVpcPeering`'],
                ['peered network ignores my static routes', 'Export and import custom routes'],
                ['source tag rule across a peering', 'Does not work: use IP ranges'],
                ['Interconnect far from a colo', 'Partner Interconnect (pairing key)'],
                ['Dedicated Interconnect paperwork', 'LOA-CFA'],
                ['encrypt Interconnect at layer 2', 'MACsec'],
                ['many VPCs + sites, transit', 'Network Connectivity Center'],
                ['spoke resolves hub’s private zone', 'DNS peering zone'],
                ['NAT dropping connections', 'Port exhaustion: min ports per VM, more NAT IPs'],
                ['VM with external IP not using NAT', 'Expected: NAT ignores it'],
                ['changed default tier, old IPs same', 'Default applies to new resources only'],
                ['UDP / client IP from internet', 'External passthrough NLB'],
                ['requests per second per instance', '`RATE` balancing mode'],
                ['MIG recreates VMs right after boot', 'Longer autohealing initial delay'],
                ['low cache hit ratio, tracking params', 'Exclude the query string from the cache key'],
                ['curl times out vs connection refused', 'Firewall dropped it vs nothing listening']
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
                '**`kubectl expose --type=LoadBalancer` and the "Network Load Balancer"** are L4. HTTP routing is the Application Load Balancer.',
                '**Implied rules cannot be deleted or logged.** Override them with a lower number, and log with an explicit rule.',
                '**Network tags and service accounts do not work across a peering.**',
                '**Shared VPC needs an organization**, and a service project attaches to only one host.',
                '**Cloud Router is not in the data path**; it only exchanges routes (and holds the NAT config).',
                '**Changing the default network tier does not move existing addresses.** Tiers never apply to VM-to-VM or VPN traffic.',
                '**Serverless NEGs have no health checks**, and an `EXTERNAL_MANAGED` frontend needs an `EXTERNAL_MANAGED` backend.'
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
