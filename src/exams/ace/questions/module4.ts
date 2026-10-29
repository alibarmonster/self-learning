/**
 * Module 4 try-out — Cloud Networking (exam guide 2.3 and 3.3). 100 questions:
 * custom VPCs, subnets and their expansion, static IPs and routes; VPC firewall
 * rules, hierarchical and network firewall policies, secure tags and Cloud NGFW
 * features; Shared VPC, VPC Network Peering and Network Connectivity Center;
 * Cloud VPN and Cloud Interconnect; Cloud DNS and Cloud NAT; Network Service
 * Tiers; load balancer selection, backends, health checks and Cloud CDN. Dealt
 * into five sets of 20 in ../sets.ts.
 */
import type { ModuleQuestion } from './module-types';

export const module4: ModuleQuestion[] = [
  // ── Custom VPCs, subnets, static IPs and routes ──
  {
    id: 'ace-m4-001',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'You are designing a VPC that will later connect to on-premises networks, and you want full control over which IP ranges exist in which regions. Which VPC mode should you choose?',
    options: ['Custom mode', 'Auto mode', 'The default network', 'A legacy network'],
    answer: 0,
    explanation: 'Custom mode networks start with no subnets; you create each regional subnet with ranges you plan, avoiding overlaps with on-premises. Auto mode creates a /20 in every region from 10.128.0.0/9, which can clash, the default network is an auto mode network, and legacy networks are deprecated.'
  },
  {
    id: 'ace-m4-002',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'An auto mode VPC now needs subnets with your own ranges, and you do not want to rebuild it. What can you do?',
    options: [
      'Switch it to custom mode with `gcloud compute networks update NET --switch-to-custom-subnet-mode`',
      'Delete the auto-created subnets one by one while the network stays in auto mode',
      'Switch it to custom mode now and back to auto mode later if plans change',
      'Nothing, because a network’s mode is fixed when it is created and cannot change'
    ],
    answer: 0,
    explanation: 'An auto mode network can be switched to custom mode once: the existing subnets stay, and you can then add or remove subnets freely. The change is one-way, and auto-created subnets cannot be deleted while the network is in auto mode.'
  },
  {
    id: 'ace-m4-003',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'You are choosing subnet ranges for a VPC that will connect to the data centre over Interconnect and peer with a partner’s VPC. What matters most?',
    options: [
      'The ranges must not overlap with on-premises ranges or the peered network’s ranges',
      'Every subnet must use a range from 10.128.0.0/9, like auto mode networks do',
      'Each subnet must be at least a /16 so that it never needs to be expanded',
      'All subnets in all regions must use the same range for routing to work'
    ],
    answer: 0,
    explanation: 'Routing between connected networks needs unique address space: overlapping ranges cannot be routed, and peering refuses them. Ranges can come from any private space, should be sized for growth (they can be expanded later), and subnets in one VPC must not overlap each other.'
  },
  {
    id: 'ace-m4-004',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'How many usable IPv4 addresses for VMs does a /29 subnet have in Google Cloud?',
    options: ['4', '6', '8', '2'],
    answer: 0,
    explanation: 'Google Cloud reserves four addresses in every primary subnet range — the network address, the default gateway, the second-to-last address and the broadcast address — so a /29 (eight addresses) leaves four for VMs.'
  },
  {
    id: 'ace-m4-005',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'The 10.10.0.0/24 subnet web in asia-southeast2 is running out of addresses. You want to grow it to a /22 without downtime. Which command should you run?',
    options: [
      '`gcloud compute networks subnets expand-ip-range web --region=asia-southeast2 --prefix-length=22`',
      '`gcloud compute networks subnets update web --region=asia-southeast2 --range=10.10.0.0/22`',
      '`gcloud compute networks subnets create web-2 --region=asia-southeast2 --merge-with=web`',
      '`gcloud compute networks update prod-vpc --subnet=web --size=1024`'
    ],
    answer: 0,
    explanation: '`expand-ip-range` widens a subnet’s primary range in place without affecting running VMs; the new range must contain the old one and not overlap anything else. Subnets cannot be shrunk, and the other commands do not exist in that form.'
  },
  {
    id: 'ace-m4-006',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'You try to expand subnet web from 10.10.0.0/24 to 10.10.0.0/20, and the command is rejected. What is the most likely cause?',
    options: [
      'The /20 would overlap another subnet in the VPC or a range in a peered network',
      'Subnets can only grow one prefix step at a time, for example from /24 to /23',
      'The subnet has running VMs, and a subnet can only be expanded while it is empty',
      'Expansion is only possible for subnets that were created by auto mode networks'
    ],
    answer: 0,
    explanation: 'An expanded range must not overlap other subnets, secondary ranges, static routes or ranges in peered networks. You can jump several prefix steps at once, VMs keep running, and both custom and auto mode subnets can be expanded.'
  },
  {
    id: 'ace-m4-007',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'You are creating a VPC-native GKE cluster in a subnet. Which ranges does it need besides the subnet’s primary range used by the nodes?',
    options: [
      'Secondary ranges for Pods and for Services (alias IP ranges)',
      'A second VPC network for Pods and a third for Services',
      'A /8 range reserved by organization policy for Kubernetes',
      'Nothing more; Pods and Services share the nodes’ addresses'
    ],
    answer: 0,
    explanation: 'VPC-native clusters use alias IPs: Pods and Services get addresses from secondary ranges of the subnet, created by you or by GKE, which makes them routable in the VPC. No extra networks are needed, and Pods do not share node addresses.'
  },
  {
    id: 'ace-m4-008',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'A database VM must always keep the internal address 10.10.0.50 in subnet db, even if it is recreated. What should you do?',
    options: [
      'Reserve it with `gcloud compute addresses create db-ip --region=asia-southeast2 --subnet=db --addresses=10.10.0.50`',
      'Set the VM’s hostname to 10.10.0.50, so that DHCP always hands out the same internal address to it',
      'Create a Cloud DNS record for 10.10.0.50, which also reserves that address in the subnet automatically',
      'Give the VM an ephemeral internal IP address and record the address in the instance metadata for reuse'
    ],
    answer: 0,
    explanation: 'Reserving a static internal IP keeps the address allocated to you, so a recreated VM can use it again (with `--private-network-ip` or in the console). Hostnames, DNS records and metadata do not reserve addresses, and ephemeral internal IPs are released when the VM is deleted.'
  },
  {
    id: 'ace-m4-009',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A VM’s ephemeral external IP has been given to partners, and you must recreate the VM next week without the address changing. What should you do first?',
    options: [
      'Promote the ephemeral address to a static address while the VM still holds it',
      'Stop the VM, because ephemeral addresses are kept for 30 days after a stop',
      'Write the address in the VM’s metadata so that it is reassigned at creation',
      'Reserve a new static address and ask Google to copy the old value into it'
    ],
    answer: 0,
    explanation: 'An ephemeral IP in use can be promoted to a static address (`gcloud compute addresses create NAME --addresses=IP --region=REGION`), after which it survives the VM. Ephemeral IPs are released when a VM stops or is deleted, and metadata cannot pick an IP.'
  },
  {
    id: 'ace-m4-010',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A cost review shows charges for static external IP addresses, although few VMs are running. Why?',
    options: [
      'Reserved external IPs that are not attached to a running resource are still billed',
      'Every static IP is billed at double the rate of an ephemeral IP at all times',
      'Static IPs keep being billed for the whole month after they are released',
      'Static IPs are only billed for traffic, so the addresses must carry heavy traffic'
    ],
    answer: 0,
    explanation: 'External IP addresses are charged, and reserved addresses not in use by a running VM or forwarding rule are a common source of waste. Release the addresses you no longer need; released addresses stop billing.'
  },
  {
    id: 'ace-m4-011',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'All traffic from a subnet to 192.168.0.0/16 must pass through a firewall appliance VM in the VPC. What do you need?',
    options: [
      'A custom static route for 192.168.0.0/16 with the appliance as next hop, and IP forwarding on the appliance',
      'A Cloud NAT gateway whose NAT IP address is set to the appliance’s internal IP address',
      'A firewall rule that redirects traffic for 192.168.0.0/16 to VMs with the appliance’s tag',
      'A VPC Network Peering connection between the subnet and the appliance’s own VPC'
    ],
    answer: 0,
    explanation: 'Custom static routes can send a destination range to a next-hop instance (or to an internal passthrough load balancer in front of several appliances); the appliance must have `--can-ip-forward` to forward packets not addressed to it. NAT, firewall rules and peering do not redirect traffic like this.'
  },
  {
    id: 'ace-m4-012',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Two custom routes match traffic to 10.50.0.0/16: one with priority 900 for VMs with the network tag fw, one with priority 1000 for all VMs. Which route does a VM with the tag fw use?',
    options: [
      'The priority 900 route, because the lower number wins among equally specific routes',
      'The priority 1000 route, because routes without tags always take precedence',
      'Both of them, with traffic split equally across the two next hops',
      'Neither, because overlapping routes are rejected when they are created'
    ],
    answer: 0,
    explanation: 'The most specific prefix wins first; among routes with the same prefix length the lowest priority number wins (equal priorities share traffic with ECMP). The tagged route applies only to VMs with that tag, so tagged VMs use priority 900 and the others use 1000.'
  },
  {
    id: 'ace-m4-013',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'For security you deleted the VPC’s default route to the internet. VMs without external IPs, on a subnet with Private Google Access, can no longer reach Cloud Storage. What fixes it?',
    options: [
      'Add a route for private.googleapis.com (199.36.153.8/30) and DNS that points the APIs to it',
      'Give the VMs ephemeral external IP addresses, which Private Google Access requires',
      'Create a Cloud NAT gateway, because Private Google Access only works through NAT',
      'Restore the default route, because Google APIs can never be reached privately'
    ],
    answer: 0,
    explanation: 'Private Google Access sends API traffic through the default internet gateway next hop, so a route must still cover the API addresses. A common pattern is a route for private.googleapis.com (or restricted.googleapis.com) plus a Cloud DNS zone that maps googleapis.com to it. External IPs or NAT are not needed.'
  },
  {
    id: 'ace-m4-014',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A VPC has HA VPN tunnels in asia-southeast2, and VMs in us-central1 of the same VPC cannot reach on-premises; the BGP routes only apply in asia-southeast2. What should you change?',
    options: [
      'Set the VPC’s dynamic routing mode to global',
      'Create another HA VPN gateway in every region',
      'Add static routes in us-central1 to the tunnels',
      'Enable Private Google Access in us-central1'
    ],
    answer: 0,
    explanation: 'With regional dynamic routing, routes learned by a Cloud Router apply only in its region; global mode makes them available to subnets in every region of the VPC. Extra gateways or static routes are workarounds, and Private Google Access is unrelated.'
  },
  {
    id: 'ace-m4-015',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A new subnet must give VMs both IPv4 and public IPv6 addresses. How should you create it?',
    options: [
      'With `--stack-type=IPV4_IPV6 --ipv6-access-type=EXTERNAL` on the subnet',
      'With an IPv6 /64 range typed into `--range` in place of the IPv4 range',
      'With a second VPC for IPv6, peered to the existing IPv4 network',
      'With `--enable-ipv6` on each VM, leaving the subnet as it is'
    ],
    answer: 0,
    explanation: 'Dual-stack subnets are created with the IPV4_IPV6 stack type and an internal or external IPv6 access type; VMs’ network interfaces then use a dual stack too. The primary range stays IPv4, peering is not needed, and IPv6 starts at the subnet, not at the VM alone.'
  },
  {
    id: 'ace-m4-016',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A security appliance VM must have one interface in the external VPC and one in the internal VPC. How is this configured?',
    options: [
      'Create the VM with two network interfaces, each in a subnet of a different VPC',
      'Create it with one interface and run `gcloud compute networks attach` for the second',
      'Peer the two VPCs and give the VM an alias IP range from the second VPC',
      'Create two VMs and connect them with a VPN tunnel between the two networks'
    ],
    answer: 0,
    explanation: 'A VM can have several network interfaces, each in a different VPC network, defined when the VM is created (the maximum depends on vCPU count). Peering and alias ranges do not give the VM a leg in another network, and two VMs with a VPN is a different design.'
  },
  {
    id: 'ace-m4-017',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'VMs without external IP addresses must read objects from Cloud Storage and call other Google APIs, with no general internet access at all. What should you enable?',
    options: [
      'Private Google Access on the VMs’ subnet',
      'Cloud NAT for the VMs’ region',
      'An external IP on one VM used as a proxy',
      'VPC Network Peering with Google’s network'
    ],
    answer: 0,
    explanation: 'Private Google Access lets VMs with only internal IPs reach Google APIs and services through Google’s network. Cloud NAT gives general internet egress, which is not wanted; a proxy VM is extra infrastructure; and you cannot peer with Google’s API network.'
  },
  {
    id: 'ace-m4-018',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A SaaS vendor publishes its service from its own Google Cloud project. Your VMs should reach it on a private IP in your VPC, without peering or exposing your network. What should you create?',
    options: [
      'A Private Service Connect endpoint for the vendor’s service attachment',
      'A VPC Network Peering connection to the vendor’s VPC network',
      'A Cloud NAT gateway with the vendor’s IP range as the destination',
      'An internet NEG pointing at the vendor’s public endpoint'
    ],
    answer: 0,
    explanation: 'Private Service Connect lets a consumer create an endpoint — an internal IP in its own subnet — that connects to a producer’s service attachment, with no route exchange and no overlapping-range concerns. Peering joins whole networks, NAT is egress to the internet, and an internet NEG uses the public internet.'
  },

  // ── Firewall rules, firewall policies and Cloud NGFW ──
  {
    id: 'ace-m4-019',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'You create a new custom mode VPC and add no firewall rules. Which traffic is allowed?',
    options: [
      'All egress is allowed and all ingress is denied by the implied rules',
      'All ingress and egress is allowed until you add the first rule',
      'All ingress and egress is denied until you add allow rules',
      'Only SSH, RDP and ICMP ingress is allowed by default'
    ],
    answer: 0,
    explanation: 'Every VPC has two implied rules at the lowest priority (65535): allow all egress and deny all ingress. The SSH, RDP and ICMP allow rules belong to the auto-created default network, not to new custom networks.'
  },
  {
    id: 'ace-m4-020',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'An ingress rule with priority 1000 denies tcp:22 from 0.0.0.0/0, and another with priority 900 allows tcp:22 from 35.235.240.0/20. What happens to SSH through IAP?',
    options: [
      'It is allowed, because the priority 900 rule is evaluated first and matches',
      'It is denied, because deny rules always win over allow rules',
      'It is denied, because the wider 0.0.0.0/0 range takes precedence',
      'It depends on which of the two rules was created first'
    ],
    answer: 0,
    explanation: 'VPC firewall rules are evaluated by priority, lowest number first, and the first match decides (at equal priority, deny wins). IAP traffic from 35.235.240.0/20 matches the 900 allow; all other SSH hits the 1000 deny.'
  },
  {
    id: 'ace-m4-021',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Firewall rules target VMs by network tag, but anyone with Compute Instance Admin can add a tag to a VM and open it up. What does Google recommend instead?',
    options: [
      'Target rules by service account, or use secure tags in network firewall policies',
      'Use longer, harder-to-guess network tag names for the sensitive rules',
      'Target rules by VM name, which can only change when a VM is recreated',
      'Give every VM the same tag and control access with priorities instead'
    ],
    answer: 0,
    explanation: 'Changing a VM’s service account means stopping it and needs Service Account User on the account, and secure tags are bound under IAM control, so both are stronger than network tags, which any instance editor can change. Names and priorities are not identities.'
  },
  {
    id: 'ace-m4-022',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'You want one firewall rule to apply to VMs that have the tag web or that run as the service account web-sa. Why does gcloud reject the rule?',
    options: [
      'A rule can target network tags or service accounts, but not both',
      'A rule can only name one target tag, never a list of tags',
      'Service accounts can only be sources, never targets, of a rule',
      'Rules with targets must use secure tags at the same time'
    ],
    answer: 0,
    explanation: 'A VPC firewall rule uses one target type — all instances, network tags, or service accounts — and cannot mix tags with service accounts, so create two rules. Rules can list several tags, and service accounts can be both sources and targets.'
  },
  {
    id: 'ace-m4-023',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'easy',
    prompt: 'An egress rule allows a VM to call an external API on tcp:443. Do you also need an ingress rule for the responses?',
    options: [
      'No; firewall rules are stateful, so the replies of an allowed connection are allowed',
      'Yes; every response needs an ingress rule from the API’s address range',
      'Yes, but only when the API is hosted outside Google Cloud',
      'No, because egress rules also open every ingress port on the VM'
    ],
    answer: 0,
    explanation: 'Cloud firewalls track connections: once a connection is allowed in one direction, its return packets are allowed automatically. An egress allow does not open unrelated ingress ports.'
  },
  {
    id: 'ace-m4-024',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'VMs in a VPC may reach only 203.0.113.0/24 on the internet and nothing else outside the VPC. Which pair of egress rules achieves this?',
    options: [
      'Allow egress to 203.0.113.0/24 at priority 900, and deny egress to 0.0.0.0/0 at priority 1000',
      'Deny egress to 0.0.0.0/0 at priority 900, and allow egress to 203.0.113.0/24 at priority 1000',
      'Allow ingress from 203.0.113.0/24 at priority 900, and deny ingress from 0.0.0.0/0',
      'Rely on the implied deny-egress rule and add one allow rule for 203.0.113.0/24'
    ],
    answer: 0,
    explanation: 'Egress is allowed by default, so you need an explicit deny for everything plus a higher-priority (lower-number) allow for the permitted range; reversed priorities would block the range too. Ingress rules do not limit outbound traffic, and the implied egress rule allows. A broad deny also blocks Google APIs unless their ranges are allowed.'
  },
  {
    id: 'ace-m4-025',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Security must block inbound RDP to every VM in the organization, but let each team decide everything else in its own VPC rules. What should you configure?',
    options: [
      'A hierarchical firewall policy on the organization that denies tcp:3389 and sends other traffic to goto_next',
      'A VPC firewall rule in every project that denies tcp:3389 at priority 0, created by a script',
      'An organization policy constraint that disables RDP on every Windows image in the organization',
      'A Cloud Armor policy that blocks port 3389 on every external load balancer in the organization'
    ],
    answer: 0,
    explanation: 'Hierarchical firewall policies on the organization or folders are evaluated before VPC rules; a deny for 3389 there applies everywhere, and goto_next hands everything else down to the lower levels. Per-project rules can be changed by project admins, no constraint disables RDP, and Cloud Armor only protects load balancers.'
  },
  {
    id: 'ace-m4-026',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'In which order are firewall rules evaluated for a VM by default?',
    options: [
      'Hierarchical policies (organization, then folders), then the VPC’s rules and network policies, then implied rules',
      'VPC firewall rules first, then the hierarchical policies, and the implied rules last of all',
      'The regional network policy first, then the global network policy, then hierarchical policies',
      'All rules from every level merged together and evaluated purely by priority number'
    ],
    answer: 0,
    explanation: 'Hierarchical policies are evaluated first (organization, then folders top-down), then the network’s VPC firewall rules and global network firewall policy (VPC rules first by default, which is configurable), then the regional network firewall policy, and finally the implied rules. goto_next passes a decision down a level.'
  },
  {
    id: 'ace-m4-027',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Your team wants to manage firewall rules for a VPC as one object, update many rules in one operation, and target VMs with IAM-controlled tags. What should you use?',
    options: [
      'A global network firewall policy associated with the VPC',
      'VPC firewall rules copied into the network by a script',
      'A hierarchical firewall policy attached to the project',
      'Cloud Armor security policies attached to the VMs'
    ],
    answer: 0,
    explanation: 'Network firewall policies group rules into one resource associated with networks, support batch updates and secure tags, and unlock Cloud NGFW Standard and Enterprise features. Scripted rules drift, hierarchical policies attach to the organization or folders, and Cloud Armor protects load balancers.'
  },
  {
    id: 'ace-m4-028',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'Why are secure tags safer than network tags for targeting firewall rules?',
    options: [
      'Binding a secure tag to a VM needs IAM permission on the tag, so instance editors cannot just add it',
      'Secure tags are encrypted with a customer-managed key, while network tags are stored as plain text',
      'Secure tags apply to all VMs in the organization at once, so nobody can forget to add them',
      'Secure tags are checked by Cloud Armor, while network tags are only checked inside the VM'
    ],
    answer: 0,
    explanation: 'Secure tags are IAM-governed Resource Manager tags: attaching one needs Tag User on the tag value as well as rights on the VM, and policies reference them by ID. Network tags are free-form strings any instance editor can change. Encryption and Cloud Armor are unrelated.'
  },
  {
    id: 'ace-m4-029',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'You are creating a secure tag key to use in firewall policies for the VPC prod-vpc. What must the tag key specify?',
    options: [
      'The purpose GCE_FIREWALL, with purpose data naming the VPC network',
      'The purpose BILLING, so that tagged VMs appear in cost reports',
      'A network tag with the same name, so both are matched by rules',
      'A Cloud KMS key that encrypts traffic for the tagged VMs'
    ],
    answer: 0,
    explanation: 'Tag keys for Cloud NGFW are created with `--purpose=GCE_FIREWALL` and `--purpose-data=network=PROJECT/NETWORK`, tying them to a network so their values can be used as sources and targets. There is no billing purpose, network tags are separate, and tags do not encrypt anything.'
  },
  {
    id: 'ace-m4-030',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'VMs may make outbound HTTPS calls only to api.partner.example, whose IP addresses change often. What should you use?',
    options: [
      'A network firewall policy egress rule with an FQDN object for api.partner.example',
      'A VPC firewall rule with the partner’s current addresses, updated weekly by a script',
      'A Cloud DNS response policy that blocks every domain except the partner’s',
      'A Cloud NAT rule that only translates traffic sent to the partner’s domain'
    ],
    answer: 0,
    explanation: 'Cloud NGFW Standard supports FQDN objects in network firewall policy rules; the firewall resolves the name and keeps the addresses current. Static IP lists go stale, DNS response policies do not stop direct IP connections, and Cloud NAT does not filter by domain.'
  },
  {
    id: 'ace-m4-031',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'An internet-facing application must not accept connections from countries where the company does not operate. What can a network firewall policy rule use?',
    options: [
      'Geolocation objects as source criteria in ingress rules',
      'Network tags named after each allowed country',
      'Secure tags assigned to each country’s users',
      'Address groups holding the company’s office IPs'
    ],
    answer: 0,
    explanation: 'Cloud NGFW Standard supports geolocation objects, matching traffic by source or destination country (Cloud Armor offers similar controls on load balancers). Tags identify VMs, not senders, and office addresses do not cover every user in the allowed countries.'
  },
  {
    id: 'ace-m4-032',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'Security wants to block traffic from IP addresses known to be malicious, using a list that Google keeps up to date. What should you add to the network firewall policy?',
    options: [
      'A rule using Google Threat Intelligence lists as the source',
      'A rule with 0.0.0.0/0 as the source and priority 0',
      'An address group that the team updates by hand monthly',
      'A secure tag that marks VMs as protected from attacks'
    ],
    answer: 0,
    explanation: 'Threat Intelligence lists in Cloud NGFW Standard cover categories such as known malicious IPs, Tor exit nodes and public cloud ranges, maintained by Google. A 0.0.0.0/0 rule blocks everything, manual lists lag behind, and tags mark targets rather than senders.'
  },
  {
    id: 'ace-m4-033',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'hard',
    prompt: 'You must inspect east-west and internet traffic inline for exploits and malware, blocking threats automatically. What do you need in Cloud NGFW?',
    options: [
      'Enterprise: a firewall endpoint, a security profile group, and rules with apply_security_profile_group',
      'Essentials: a VPC firewall rule with logging enabled for every connection to the VMs',
      'Standard: FQDN objects and geolocation objects in a hierarchical firewall policy',
      'Cloud Armor Adaptive Protection attached directly to the VMs’ network interfaces'
    ],
    answer: 0,
    explanation: 'Intrusion prevention is in the Enterprise tier: create a firewall endpoint in the zone, associate it with the VPC, and send matching traffic to a security profile group from a network firewall policy rule. Logging records but does not inspect, Standard adds FQDN, geolocation and threat lists, and Cloud Armor protects load balancers.'
  },
  {
    id: 'ace-m4-034',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A VPC has hundreds of firewall rules collected over years, and you suspect many are never hit or are shadowed by other rules. Which tool helps you clean them up?',
    options: [
      'Firewall Insights in Network Intelligence Center',
      'A Cloud Asset Inventory resource search',
      'Connectivity Tests between every pair of VMs',
      'Packet Mirroring to a collector VM'
    ],
    answer: 0,
    explanation: 'Firewall Insights analyses rule usage, with firewall logging, to show shadowed, overly permissive and unused rules. Asset Inventory lists rules but not whether they are hit, Connectivity Tests check single paths, and Packet Mirroring copies traffic for inspection.'
  },
  {
    id: 'ace-m4-035',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A VM cannot reach a database VM in a peered network. You want to know which route or firewall rule blocks the path, without sending real traffic. What should you use?',
    options: [
      'Connectivity Tests in Network Intelligence Center',
      'Firewall Rules Logging on every rule in both VPCs',
      'VPC Flow Logs on both of the subnets involved',
      'Cloud Trace on the application that connects'
    ],
    answer: 0,
    explanation: 'Connectivity Tests analyse configuration — routes, firewall rules, peering — and report where a simulated packet would be dropped, and can add a live data-plane check. Logs need real traffic and show what happened rather than why, and Cloud Trace measures application latency.'
  },
  {
    id: 'ace-m4-036',
    section: 'planning',
    topic: 'Firewalls & Cloud NGFW',
    difficulty: 'medium',
    prompt: 'The same list of 40 partner IP ranges appears in many firewall policy rules, and every change means editing all of them. What should you use?',
    options: [
      'An address group referenced by the rules',
      'A secure tag on each partner IP range',
      'A network tag on each partner’s VMs',
      'One larger CIDR covering all the ranges'
    ],
    answer: 0,
    explanation: 'Address groups are reusable lists of IP ranges that firewall policy rules can reference, so a change is made once. Tags identify your own VMs, and a wider range would also allow addresses that are not partners.'
  },

  // ── Shared VPC, VPC Network Peering and Network Connectivity Center ──
  {
    id: 'ace-m4-037',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'A central network team must own the VPC, subnets and firewall rules, while application teams create VMs in their own projects on those subnets. What should you use?',
    options: [
      'Shared VPC, with a host project and the teams’ projects attached as service projects',
      'VPC Network Peering between the network team’s VPC and a VPC for each application team',
      'One VPC per project, with the network team granted Owner in every project',
      'Cloud VPN tunnels between each application project and the network project'
    ],
    answer: 0,
    explanation: 'Shared VPC lets service projects deploy resources into subnets of a host project’s network, so network administration stays central while resources and billing stay with each team. Peering keeps separate networks and administration, and Owner everywhere or VPN tunnels add risk and complexity.'
  },
  {
    id: 'ace-m4-038',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Which role lets a person enable Shared VPC host projects and attach service projects, and where is it granted?',
    options: [
      'Shared VPC Admin (`roles/compute.xpnAdmin`), on the organization or a folder',
      'Compute Network Admin, on each service project that will be attached',
      'Project Owner, on the host project and nowhere else',
      'Compute Network User, on the host project’s subnets'
    ],
    answer: 0,
    explanation: 'Shared VPC Admin is granted on the organization or a folder and allows configuring host projects and attaching service projects. Network Admin manages networks within one project, Owner of the host project cannot attach other projects, and Network User is for deploying into subnets.'
  },
  {
    id: 'ace-m4-039',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Developers in a service project get a permission error when creating a VM on a Shared VPC subnet, although they are Compute Instance Admin in their own project. What is missing?',
    options: [
      'Compute Network User on the host project or on that subnet',
      'Compute Network Admin on their own service project',
      'Shared VPC Admin on the organization node',
      'Compute Security Admin on the host project'
    ],
    answer: 0,
    explanation: 'Using a Shared VPC subnet needs `compute.subnetworks.use`, which Compute Network User grants on the host project or on specific subnets. Network or Security Admin would let them change the network, and Shared VPC Admin configures the Shared VPC itself.'
  },
  {
    id: 'ace-m4-040',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Team A may deploy only into the subnet team-a-web of a Shared VPC, never into other teams’ subnets. How should you grant access?',
    options: [
      'Compute Network User on the team-a-web subnet only',
      'Compute Network User on the whole host project',
      'Compute Network Admin on the team-a-web subnet',
      'Compute Network Viewer on the host project'
    ],
    answer: 0,
    explanation: 'Network User can be granted on individual subnets, limiting service project admins to the subnets they own. A project-level grant covers every subnet, Network Admin allows changes, and Viewer cannot deploy anything.'
  },
  {
    id: 'ace-m4-041',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'Two companies, each with its own organization, need private connectivity between their VPCs over internal IPs, while each keeps full control of its own network. What fits?',
    options: ['VPC Network Peering', 'Shared VPC', 'Cloud NAT', 'Private Google Access'],
    answer: 0,
    explanation: 'VPC Network Peering connects two VPC networks, even across organizations, with internal routing, while each side administers its own network and firewall rules. Shared VPC works inside one organization with central control, and NAT and Private Google Access are about egress.'
  },
  {
    id: 'ace-m4-042',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'VPC A peers with B, and B peers with C. Can VMs in A reach VMs in C through B?',
    options: [
      'No; peering is not transitive, so A and C need their own connection',
      'Yes; routes pass automatically to every network in the chain',
      'Yes, but only if B has Cloud NAT set up for traffic from A',
      'Only if all three networks are in the same Google Cloud project'
    ],
    answer: 0,
    explanation: 'Peered networks exchange their own subnet routes but do not re-export routes learned from other peers, so A cannot reach C through B. Use a direct peering, appliances or VPN in a hub, or Network Connectivity Center for transitive designs.'
  },
  {
    id: 'ace-m4-043',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'You try to peer prod-vpc (10.0.0.0/16) with a partner network that uses 10.0.128.0/20 for one of its subnets. The peering fails. Why?',
    options: [
      'The ranges overlap, and peered networks cannot have overlapping subnet ranges',
      'Peering requires both networks to be in auto mode with the default ranges',
      'Peering only works between networks that are in the same region',
      'The partner must first enable Private Google Access on that subnet'
    ],
    answer: 0,
    explanation: 'Peering exchanges subnet routes, so overlapping ranges would be ambiguous and Google Cloud refuses them. Re-address one side, or consume the service through Private Service Connect. Networks are global, so regions do not matter.'
  },
  {
    id: 'ace-m4-044',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'After two VPCs are peered, VMs still cannot connect across the peering, although the routes are present. What is the most likely reason?',
    options: [
      'Each network’s firewall rules must allow the traffic; rules are not shared through peering',
      'Peering also needs a VPN tunnel to carry traffic between the two networks',
      'Peered networks only pass ICMP until a support case enables TCP and UDP',
      'Peering must be switched on in each VM with a metadata key on both sides'
    ],
    answer: 0,
    explanation: 'Peering exchanges routes only; each network keeps its own firewall rules, so the receiving side needs ingress rules allowing the other network’s ranges. No VPN, metadata or support case is involved.'
  },
  {
    id: 'ace-m4-045',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'VPC A reaches on-premises through its HA VPN. VPC B is peered with A, and B’s VMs must reach on-premises over A’s VPN. What must be configured?',
    options: [
      'A exports custom routes and B imports them, and A’s Cloud Router advertises B’s ranges to on-premises',
      'Nothing; peered networks automatically use each other’s VPN tunnels and learned routes',
      'A second HA VPN in B, because peering can never carry traffic bound for on-premises',
      'Private Google Access in B, which forwards on-premises traffic through network A'
    ],
    answer: 0,
    explanation: 'Dynamic and static routes cross a peering only when A exports custom routes and B imports them; on-premises must also learn B’s ranges, so A’s Cloud Router needs custom route advertisements for them. Without this the peering carries only subnet routes.'
  },
  {
    id: 'ace-m4-046',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'All application projects are in one organization, and security wants one team to control firewall rules and IP allocation for all of them. Which fits better than peering?',
    options: [
      'Shared VPC, which keeps one network under central administration',
      'VPC Network Peering, so each project keeps its own firewall rules',
      'Cloud Interconnect, which connects all the projects privately',
      'A VPN between every pair of projects in the organization'
    ],
    answer: 0,
    explanation: 'When projects share an organization and need central network control, Shared VPC gives one network with central firewall and IP management. Peering keeps separate administration in each network, and Interconnect or a VPN mesh solve different problems.'
  },
  {
    id: 'ace-m4-047',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Twenty VPC networks in different projects must all reach each other privately, and a full mesh of peerings is unmanageable. What should you use?',
    options: [
      'Network Connectivity Center, with the VPCs attached as VPC spokes',
      'One Shared VPC host project that all twenty VPCs are merged into',
      'Cloud NAT in each VPC, with routes to the other VPCs’ NAT IPs',
      'An HA VPN gateway in each VPC, connected over the internet'
    ],
    answer: 0,
    explanation: 'Network Connectivity Center VPC spokes connect many VPC networks through a hub with transitive full-mesh (or star) connectivity, without per-pair peering. Merging everything into one Shared VPC is a large redesign, and NAT or internet VPNs are not private VPC routing.'
  },
  {
    id: 'ace-m4-048',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'In a Shared VPC, a service project team creates a VM on a host project subnet. Which project is billed for the VM?',
    options: [
      'The service project in which the VM is created',
      'The host project that owns the network',
      'Both projects, each paying half',
      'The organization’s default billing project'
    ],
    answer: 0,
    explanation: 'Resources belong to, and are billed to, the project they are created in; the host project only provides the network. Network charges such as egress also follow the resource that sends the traffic.'
  },

  // ── Cloud VPN and Cloud Interconnect ──
  {
    id: 'ace-m4-049',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'You need an encrypted connection between your data centre and a VPC this week, over the existing internet link, with a 99.99% SLA. What should you set up?',
    options: [
      'HA VPN with two tunnels and BGP through Cloud Router',
      'Dedicated Interconnect with two 10 Gbps circuits',
      'Classic VPN with one static-routed tunnel',
      'Direct Peering with Google at an exchange point'
    ],
    answer: 0,
    explanation: 'HA VPN runs IPsec over the internet, can be set up in hours, and offers a 99.99% SLA in the recommended topology. Dedicated Interconnect takes weeks and needs a colocation facility, Classic VPN offers at most 99.9%, and Direct Peering is not VPC connectivity.'
  },
  {
    id: 'ace-m4-050',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Your HA VPN gateway has two interfaces, but only one tunnel is configured to the on-premises device. What does this mean?',
    options: [
      'There is no 99.99% SLA; that needs tunnels from both interfaces, each with BGP',
      'Nothing; one tunnel per gateway is enough for the full 99.99% SLA',
      'The gateway falls back to Classic VPN and offers 99.9% instead',
      'Traffic is blocked until the second tunnel is created as well'
    ],
    answer: 0,
    explanation: 'HA VPN’s 99.99% SLA requires the recommended topology: tunnels from both gateway interfaces to the peer gateway (with one or two peer interfaces), each with a BGP session on Cloud Router. A single tunnel works but has no availability SLA.'
  },
  {
    id: 'ace-m4-051',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A new site-to-site VPN needs dynamic routing with BGP. Someone proposes Classic VPN, based on old documentation. What should you use?',
    options: [
      'HA VPN, because creating Classic VPN tunnels with BGP is deprecated',
      'Classic VPN, because it is the only Cloud VPN type that supports BGP',
      'Classic VPN with static routes now, switching it to BGP later on',
      'Partner Interconnect, because no VPN type can use BGP at all'
    ],
    answer: 0,
    explanation: 'Dynamic routing for Classic VPN is deprecated, and Google recommends HA VPN for production traffic that needs BGP. Classic VPN remains only for some static-routed setups, with at most a 99.9% SLA.'
  },
  {
    id: 'ace-m4-052',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'What is Cloud Router’s role in a hybrid connection?',
    options: [
      'It runs BGP with your on-premises router to exchange routes dynamically',
      'It is a VM you deploy that forwards packets between the two networks',
      'It encrypts the traffic that crosses Dedicated Interconnect links',
      'It translates internal IPs to public IPs for on-premises users'
    ],
    answer: 0,
    explanation: 'Cloud Router is a managed control plane that speaks BGP over HA VPN and Interconnect, learning on-premises routes and advertising VPC ranges. It does not forward packets itself, encrypt traffic or translate addresses for users, although Cloud NAT configurations live on it.'
  },
  {
    id: 'ace-m4-053',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Replication between the data centre and Google Cloud needs about 8 Gbps, but one HA VPN tunnel carries roughly 3 Gbps at most. What should you consider?',
    options: [
      'Several tunnels with equal-cost multipath routing, or Cloud Interconnect for more bandwidth',
      'A larger VM for the VPN gateway, which raises each tunnel’s maximum throughput',
      'Classic VPN, which carries more traffic per tunnel than HA VPN does',
      'Cloud NAT on the VPN subnet, which increases the bandwidth of the tunnels'
    ],
    answer: 0,
    explanation: 'Each tunnel has a throughput limit, so more bandwidth means several tunnels with ECMP or, for steady high throughput, Dedicated or Partner Interconnect. VPN gateways are managed with no VM size, Classic VPN is not faster, and NAT adds no bandwidth.'
  },
  {
    id: 'ace-m4-054',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Your data centre is in a colocation facility where Google has a point of presence, and you need 20 Gbps of private connectivity to your VPCs. Which option fits?',
    options: [
      'Dedicated Interconnect with two 10 Gbps connections',
      'HA VPN with two tunnels over the internet',
      'Partner Interconnect through a service provider',
      'Carrier Peering through your internet provider'
    ],
    answer: 0,
    explanation: 'Dedicated Interconnect provides physical 10 Gbps or 100 Gbps connections between your router and Google in a colocation facility, with private addressing to VPCs. Partner Interconnect is for when you cannot reach such a facility, VPN tunnels go over the internet, and Carrier Peering reaches Google services, not VPCs.'
  },
  {
    id: 'ace-m4-055',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Your office is far from any Google colocation facility, and you need 500 Mbps of private connectivity to a VPC that does not cross the public internet. What should you use?',
    options: [
      'Partner Interconnect through a supported service provider',
      'Dedicated Interconnect with one 10 Gbps connection',
      'Direct Peering at the nearest internet exchange',
      'Cloud NAT with a static IP address for the office'
    ],
    answer: 0,
    explanation: 'Partner Interconnect connects through a service provider that is already connected to Google, with capacities from 50 Mbps to 50 Gbps. Dedicated Interconnect needs your equipment in a colocation facility, Direct Peering is for Google services, and NAT does not connect networks.'
  },
  {
    id: 'ace-m4-056',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'A trading platform needs a 99.99% SLA on Dedicated Interconnect. Which topology is required?',
    options: [
      'Four connections, two in each of two metro areas, with Cloud Routers in two regions',
      'Two connections in the same edge availability domain of one metro area',
      'One 100 Gbps connection with a second VLAN attachment on the same connection',
      'Two connections in one metro area plus a Classic VPN tunnel as a backup'
    ],
    answer: 0,
    explanation: 'The 99.99% topology uses four connections across two metros (two edge availability domains in each) and Cloud Routers in two regions with global routing. Two connections in different domains of one metro give 99.9%; a single connection or a single domain has no SLA.'
  },
  {
    id: 'ace-m4-057',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Security requires all traffic over your Dedicated Interconnect to be encrypted, and Interconnect traffic is not encrypted by default. What can you use?',
    options: [
      'MACsec on the Interconnect connections, or HA VPN over Cloud Interconnect',
      'Cloud NAT on the VLAN attachments, which encrypts the traffic it translates',
      'Private Google Access on the subnets that are used over the Interconnect',
      'A Cloud Armor security policy attached to the VLAN attachments'
    ],
    answer: 0,
    explanation: 'MACsec encrypts traffic at layer 2 on supported Interconnect connections, and HA VPN over Cloud Interconnect runs IPsec tunnels across the private link; applications can also use TLS. NAT, Private Google Access and Cloud Armor do not encrypt Interconnect traffic.'
  },
  {
    id: 'ace-m4-058',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Workloads in AWS must exchange large volumes of data with VPCs in Google Cloud over a dedicated private link rather than the internet. What fits?',
    options: [
      'Cross-Cloud Interconnect between Google Cloud and AWS',
      'HA VPN between the two clouds over the internet',
      'VPC Network Peering between the VPC and the AWS VPC',
      'Direct Peering with AWS at an exchange point'
    ],
    answer: 0,
    explanation: 'Cross-Cloud Interconnect provides dedicated physical connections between Google Cloud and other clouds such as AWS, Azure and Oracle. HA VPN works but runs over the internet, VPC peering only connects Google Cloud networks, and Direct Peering reaches Google services.'
  },
  {
    id: 'ace-m4-059',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'What is Direct Peering with Google used for?',
    options: [
      'Reaching Google’s public services, such as Workspace and Google APIs, over a direct link',
      'Connecting your router to a VPC with private addresses and a 99.99% SLA',
      'Linking two VPC networks that belong to different Google Cloud organizations',
      'Encrypting traffic between on-premises and Google Cloud at layer 2'
    ],
    answer: 0,
    explanation: 'Direct and Carrier Peering exchange routes for Google’s public IP space at peering locations, without an SLA, so they help reach Google services; they are not VPC connectivity. Private access to VPCs uses Interconnect or VPN, VPC peering links VPCs, and MACsec encrypts Interconnect.'
  },
  {
    id: 'ace-m4-060',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A new Dedicated Interconnect connection is up. What connects it to a specific VPC network?',
    options: [
      'A VLAN attachment linked to a Cloud Router in that VPC’s region',
      'A VPC Network Peering between the Interconnect and the VPC',
      'A Cloud NAT gateway created on the Interconnect connection',
      'A static external IP reserved for the Interconnect connection'
    ],
    answer: 0,
    explanation: 'VLAN attachments map a VLAN on the connection to a VPC network through a Cloud Router, which runs BGP with your router. Peering, NAT and external IPs are not part of attaching Interconnect.'
  },
  {
    id: 'ace-m4-061',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'Servers on-premises, connected over Interconnect, must call Cloud Storage APIs privately without using the internet. What should you configure?',
    options: [
      'Advertise private.googleapis.com from Cloud Router and resolve googleapis.com to it on-premises',
      'Private Google Access on the VPC subnets, which also covers on-premises hosts automatically',
      'A Cloud NAT gateway for the on-premises address ranges in the VPC’s region',
      'An external Application Load Balancer in front of Cloud Storage with a private IP'
    ],
    answer: 0,
    explanation: 'On-premises hosts reach Google APIs over hybrid links when Cloud Router advertises the private.googleapis.com (or restricted.googleapis.com) range and on-premises DNS resolves the API names to it; a Private Service Connect endpoint for Google APIs is another option. Subnet-level Private Google Access only covers VMs.'
  },
  {
    id: 'ace-m4-062',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A company sends a steady 5 Gbps between its data centre and Google Cloud all day. Compared with HA VPN, what is the main advantage of Cloud Interconnect here?',
    options: [
      'Higher, more predictable bandwidth and lower egress prices for traffic sent over it',
      'Built-in encryption of all traffic, which HA VPN tunnels do not provide',
      'No need for BGP or Cloud Router, which VPN connections always require',
      'No charges at all for its ports, attachments or the traffic it carries'
    ],
    answer: 0,
    explanation: 'Interconnect gives dedicated capacity with consistent latency, and data sent from Google Cloud over it is billed at reduced egress rates, which matters at steady high volume. It is not encrypted by default (VPN is), it uses Cloud Router and BGP, and ports and attachments are charged.'
  },

  // ── Cloud DNS and Cloud NAT ──
  {
    id: 'ace-m4-063',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'easy',
    prompt: 'VMs in prod-vpc should resolve names such as db.corp.internal, which must not be visible on the internet. What should you create?',
    options: [
      'A Cloud DNS private zone for corp.internal, visible to prod-vpc',
      'A Cloud DNS public zone for corp.internal, with DNSSEC enabled',
      'A hosts file entry on every VM, pushed by a startup script',
      'A Cloud NAT gateway with a DNS name for each internal VM'
    ],
    answer: 0,
    explanation: 'Private zones resolve only from the VPC networks they are authorised for, so internal names stay internal. A public zone is on the internet, hosts files do not scale, and NAT has nothing to do with name resolution.'
  },
  {
    id: 'ace-m4-064',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Add an A record db.corp.internal pointing to 10.10.0.5, with a 300-second TTL, to the private zone corp. Which command does it?',
    options: [
      '`gcloud dns record-sets create db.corp.internal. --zone=corp --type=A --ttl=300 --rrdatas=10.10.0.5`',
      '`gcloud dns managed-zones create db.corp.internal --type=A --address=10.10.0.5`',
      '`gcloud compute addresses create db --dns-name=db.corp.internal --addresses=10.10.0.5`',
      '`gcloud dns records add db --zone=corp --value=10.10.0.5 --ttl=5m`'
    ],
    answer: 0,
    explanation: '`gcloud dns record-sets create` adds a record set to a managed zone, with the fully qualified name (trailing dot), type, TTL and data. `managed-zones create` creates zones, reserving an address creates no DNS record, and the last command does not exist.'
  },
  {
    id: 'ace-m4-065',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'VMs in Google Cloud must resolve names in the on-premises domain corp.example, which is served by DNS servers in the data centre. What should you create?',
    options: [
      'A Cloud DNS forwarding zone for corp.example targeting the on-premises DNS servers',
      'A Cloud DNS private zone for corp.example holding copies of the on-premises records',
      'An inbound server policy on the VPC that points VMs at the on-premises servers',
      'A DNS peering zone between the VPC and the data centre’s own network'
    ],
    answer: 0,
    explanation: 'A forwarding zone sends queries for a domain to target name servers, such as on-premises DNS reachable over VPN or Interconnect. Copied records drift, inbound policies let on-premises query Cloud DNS (the other direction), and DNS peering is between VPC networks.'
  },
  {
    id: 'ace-m4-066',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'hard',
    prompt: 'On-premises servers must resolve names in a Cloud DNS private zone that is visible to prod-vpc. What should you configure?',
    options: [
      'An inbound server policy on prod-vpc, with on-premises DNS forwarding the zone to its entry points',
      'A public zone with the same names, published for the on-premises resolvers to query',
      'A forwarding zone in Cloud DNS that targets the on-premises DNS servers',
      'Firewall rules that allow UDP 53 from on-premises to the public resolver 8.8.8.8'
    ],
    answer: 0,
    explanation: 'An inbound server policy creates entry-point addresses in the VPC’s subnets; on-premises resolvers forward the private domain to them over the hybrid link. A public zone exposes the names, a forwarding zone resolves on-premises names from the VPC, and public resolvers cannot see private zones.'
  },
  {
    id: 'ace-m4-067',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'A private zone apps.internal is used by the Shared VPC network, and a separate VPC in another project must resolve its names too, without duplicating the zone. What should you use?',
    options: [
      'A DNS peering zone in the other VPC that targets the Shared VPC network for apps.internal',
      'A forwarding zone that sends the queries to 169.254.169.254 in the host project',
      'An inbound server policy in the other VPC that copies the zone every hour',
      'A Cloud DNS public zone for apps.internal that both networks can query'
    ],
    answer: 0,
    explanation: 'DNS peering lets one network resolve a namespace using another network’s resolution order, including its private zones, without copying records. Forwarding to the metadata server only resolves locally, inbound policies are for on-premises clients, and a public zone exposes the names. Authorising the zone for both networks also works within one project.'
  },
  {
    id: 'ace-m4-068',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'Your public zone example.com in Cloud DNS must be protected against spoofed responses and cache poisoning. What should you enable?',
    options: [
      'DNSSEC on the managed zone, adding the DS record at your registrar',
      'A private zone for example.com that mirrors the public records',
      'Cloud Armor in front of the zone’s name servers',
      'A response policy that rewrites every answer to a fixed address'
    ],
    answer: 0,
    explanation: 'DNSSEC signs the zone’s records so that resolvers can validate them; the registrar needs the DS record to complete the chain of trust. Private zones, Cloud Armor and response policies do not authenticate public answers.'
  },
  {
    id: 'ace-m4-069',
    section: 'planning',
    topic: 'VPC, DNS & connectivity',
    difficulty: 'medium',
    prompt: 'api.example.com should resolve to an address in Jakarta for users in Asia and to an address in Iowa for users in the Americas, failing over if one is unhealthy. What should you configure in Cloud DNS?',
    options: [
      'A geolocation routing policy with health-checked failover on the record set',
      'Two separate public zones, one for Asia and one for the Americas',
      'One record with both addresses and a TTL of one second',
      'A private zone visible only to the networks in each region'
    ],
    answer: 0,
    explanation: 'Cloud DNS routing policies — geolocation, weighted round robin and failover — return different answers by source location or weight and can use health checks. Two zones cannot share one name, multiple A records are answered in rotation, and private zones are internal.'
  },
  {
    id: 'ace-m4-070',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'VMs with no external IPs in asia-southeast2 must download OS updates from the internet. What should you create?',
    options: [
      'A Cloud Router and a Cloud NAT gateway in asia-southeast2',
      'An external IP address on each VM in the region',
      'Private Google Access on the subnet, and nothing else',
      'An internal load balancer with a public IP address'
    ],
    answer: 0,
    explanation: 'Cloud NAT, configured on a Cloud Router in the region (`gcloud compute routers nats create`), gives private VMs outbound internet access without exposing them to inbound connections. External IPs expose each VM, Private Google Access only reaches Google APIs, and internal load balancers do not provide egress.'
  },
  {
    id: 'ace-m4-071',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Behind Cloud NAT, a VM that opens thousands of connections to one API starts failing, and the NAT logs show drops due to port exhaustion. What should you change?',
    options: [
      'Raise the minimum ports per VM, or enable dynamic port allocation on the gateway',
      'Give the VM a larger machine type so that it can hold more open connections',
      'Add a second Cloud Router in the region with the same NAT configuration',
      'Lower the TCP idle timeout of the application on the VM to one second'
    ],
    answer: 0,
    explanation: 'Each VM gets a block of NAT source ports (64 by default), which heavy clients exhaust. Raising the minimum or enabling dynamic port allocation gives busy VMs more ports, and more NAT IPs raise the total. Machine size does not change NAT ports, and a duplicate router is not how NAT scales.'
  },
  {
    id: 'ace-m4-072',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A partner allow-lists the IP addresses your private VMs use for outbound calls, but Cloud NAT’s automatically allocated addresses can change. What should you do?',
    options: [
      'Reserve static external IPs and assign them to the NAT gateway with manual allocation',
      'Keep automatic allocation and send the partner the new addresses every month',
      'Give every VM a static external IP and turn Cloud NAT off for those VMs',
      'Use Private Google Access so that outbound calls keep the subnet’s range'
    ],
    answer: 0,
    explanation: 'With manual NAT IP allocation you choose the reserved static addresses Cloud NAT uses, so egress IPs stay fixed. Automatic allocation can change, external IPs on every VM expose them, and Private Google Access only reaches Google services.'
  },
  {
    id: 'ace-m4-073',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A team wants internet users to reach a web server on a private VM through Cloud NAT. What should you tell them?',
    options: [
      'Cloud NAT only handles outbound connections and their replies; use a load balancer for inbound',
      'Add a NAT rule mapping port 443 on the NAT IP to the VM’s internal IP address',
      'Enable endpoint-independent mapping, which lets internet clients connect inbound',
      'Give the NAT gateway a static IP, and inbound traffic is then forwarded automatically'
    ],
    answer: 0,
    explanation: 'Cloud NAT does not accept unsolicited inbound connections; it only translates outbound connections and their responses. Expose services with an external load balancer (or an external IP) instead. NAT rules choose source addresses for egress, not port forwarding.'
  },
  {
    id: 'ace-m4-074',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Some outbound connections from private VMs fail intermittently. You want to see which connections Cloud NAT dropped and why. What should you enable?',
    options: [
      'Cloud NAT logging for errors (or for all translations)',
      'Firewall Rules Logging on the implied egress rule',
      'Data Access audit logs for the Compute Engine API',
      'Uptime checks against the API from every VM'
    ],
    answer: 0,
    explanation: 'Cloud NAT logging records translations and errors, such as drops from port exhaustion, in Cloud Logging. The implied rules cannot be logged, audit logs record API calls, and uptime checks run from Google’s probes rather than from your VMs.'
  },

  // ── Network Service Tiers ──
  {
    id: 'ace-m4-075',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'easy',
    prompt: 'What is the main difference between the Premium and Standard network service tiers?',
    options: [
      'Premium carries traffic over Google’s backbone to the edge near the user; Standard uses the public internet',
      'Premium encrypts all traffic between regions; Standard sends traffic between regions unencrypted',
      'Premium is required for internal traffic between VMs; Standard only applies to external addresses',
      'Premium includes Cloud Armor on every IP address; Standard has no DDoS protection at all'
    ],
    answer: 0,
    explanation: 'Premium Tier routes traffic over Google’s network and enters or leaves it at the point of presence closest to the user, giving lower latency and global services; Standard Tier uses ISP networks for most of the path and is regional, at a lower price. Tiers concern external traffic, not encryption or internal traffic.'
  },
  {
    id: 'ace-m4-076',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'Why can’t you create a global external Application Load Balancer with a Standard Tier IP address?',
    options: [
      'Global load balancers depend on Google’s global network and anycast, which only Premium Tier provides',
      'Standard Tier addresses are internal only and cannot be used for any external load balancer',
      'Global load balancers need IPv6 addresses, and Standard Tier only supports IPv4 addresses',
      'Standard Tier needs a separate support contract before a load balancer can use its addresses'
    ],
    answer: 0,
    explanation: 'Global external load balancers serve a single anycast IP from Google’s edge, which is a Premium Tier capability; with the Standard Tier you use regional external load balancers instead. Standard Tier addresses are external, and support contracts are unrelated.'
  },
  {
    id: 'ace-m4-077',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A cost-sensitive project serves users mostly in one region and accepts slightly higher latency. New external resources should use the Standard Tier unless stated otherwise. What should you run?',
    options: [
      '`gcloud compute project-info update --default-network-tier=STANDARD`',
      '`gcloud compute networks update default --tier=STANDARD`',
      '`gcloud config set compute/network_tier standard`',
      '`gcloud services enable standard-tier.googleapis.com`'
    ],
    answer: 0,
    explanation: 'The project’s default network tier applies to new resources that do not specify one, and individual addresses and forwarding rules can override it with `--network-tier`. Tiers are not a VPC setting, the gcloud property shown does not exist, and there is no tier API.'
  },
  {
    id: 'ace-m4-078',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A web app in asia-southeast2 serves only local users. The team wants the lowest network cost while keeping a layer 7 load balancer with HTTPS. What fits?',
    options: [
      'A regional external Application Load Balancer on the Standard Tier',
      'A global external Application Load Balancer on the Standard Tier',
      'An external passthrough Network Load Balancer on the Premium Tier',
      'A cross-region internal Application Load Balancer on the Premium Tier'
    ],
    answer: 0,
    explanation: 'Regional external Application Load Balancers support the Standard Tier, combining layer 7 features with lower egress pricing for a regional audience. Global external ALBs need Premium, a passthrough NLB is layer 4, and an internal load balancer is not reachable from the internet.'
  },
  {
    id: 'ace-m4-079',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'easy',
    prompt: 'Is the network service tier chosen per project, per VPC network, or per resource?',
    options: [
      'Per resource, such as an external IP or forwarding rule, with a project-level default',
      'Per VPC network, and every external resource in the network uses that tier',
      'Per organization, set once by the organization administrator for every project',
      'Per region, so every resource in the region uses the same tier automatically'
    ],
    answer: 0,
    explanation: 'The tier is a property of each external IP address or forwarding rule; the project default only applies when none is specified, so one project can mix Premium and Standard resources.'
  },
  {
    id: 'ace-m4-080',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'A team uses the Standard Tier to save money and now wants Cloud CDN in front of its website. What do they need to change?',
    options: [
      'Use a global external Application Load Balancer, which needs the Premium Tier',
      'Nothing, because Cloud CDN works with every load balancer on either tier',
      'Move the website to Cloud Storage, because Cloud CDN only caches buckets',
      'Use an external passthrough Network Load Balancer with caching turned on'
    ],
    answer: 0,
    explanation: 'Cloud CDN is enabled on backend services or backend buckets of global external Application Load Balancers served from Google’s edge, which requires the Premium Tier. CDN can cache instance groups, NEGs and buckets, and passthrough load balancers do not cache.'
  },

  // ── Load balancing: choosing, backends, health checks and Cloud CDN ──
  {
    id: 'ace-m4-081',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'easy',
    prompt: 'A web application with users worldwide needs one IP address, HTTPS termination, URL-based routing, and backends in several regions. Which load balancer fits?',
    options: [
      'Global external Application Load Balancer',
      'Regional external Application Load Balancer',
      'External passthrough Network Load Balancer',
      'Regional internal Application Load Balancer'
    ],
    answer: 0,
    explanation: 'The global external Application Load Balancer gives a single anycast IP, terminates TLS at Google’s edge, routes by host and path with URL maps, and sends users to the nearest healthy backend in any region. Regional and passthrough load balancers stay in one region, and internal ones are private.'
  },
  {
    id: 'ace-m4-082',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A multiplayer game server receives UDP traffic and must see each player’s real source IP address. Which load balancer fits?',
    options: [
      'External passthrough Network Load Balancer',
      'Global external Application Load Balancer',
      'Global external proxy Network Load Balancer',
      'Regional internal Application Load Balancer'
    ],
    answer: 0,
    explanation: 'Passthrough Network Load Balancers forward packets — TCP, UDP and more — without proxying, so backends see the original client IP. Application and proxy load balancers terminate connections and do not carry UDP game traffic, and internal ones are not internet-facing.'
  },
  {
    id: 'ace-m4-083',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A non-HTTP TCP service for global clients needs TLS offloaded at the load balancer and the nearest healthy backend chosen automatically. Which load balancer fits?',
    options: [
      'Global external proxy Network Load Balancer',
      'External passthrough Network Load Balancer',
      'Regional external Application Load Balancer',
      'Internal passthrough Network Load Balancer'
    ],
    answer: 0,
    explanation: 'The global external proxy Network Load Balancer proxies TCP, optionally terminating TLS, at Google’s edge and routes to backends in several regions. Passthrough load balancers are regional and cannot offload TLS, Application Load Balancers are for HTTP(S), and internal ones are private.'
  },
  {
    id: 'ace-m4-084',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'Microservices inside a VPC call each other over HTTP, and you want path-based routing between them on private IPs within one region. Which load balancer fits?',
    options: [
      'Regional internal Application Load Balancer',
      'Global external Application Load Balancer',
      'Internal passthrough Network Load Balancer',
      'External passthrough Network Load Balancer'
    ],
    answer: 0,
    explanation: 'Internal Application Load Balancers are Envoy-based layer 7 proxies on private IPs, with URL maps for host and path routing. External ALBs face the internet, and passthrough load balancers work at layer 4 with no HTTP routing.'
  },
  {
    id: 'ace-m4-085',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'hard',
    prompt: 'Internal clients in two regions call an HTTP service deployed in both regions. If one region’s backends fail, traffic must move to the other region automatically, on private IPs. Which load balancer fits?',
    options: [
      'Cross-region internal Application Load Balancer',
      'A regional internal Application Load Balancer in each region',
      'Internal passthrough Network Load Balancer with global access',
      'Global external Application Load Balancer with a private IP'
    ],
    answer: 0,
    explanation: 'The cross-region internal Application Load Balancer has frontends in several regions and global backend services, failing over between regions on private IPs. Separate regional ALBs do not fail over to each other, global access lets other regions reach a passthrough load balancer whose backends stay in one region, and external load balancers are not private.'
  },
  {
    id: 'ace-m4-086',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A pair of database VMs in one region needs a single internal IP for TCP clients, with the client IP preserved and no proxying. Which load balancer fits?',
    options: [
      'Internal passthrough Network Load Balancer',
      'Regional internal Application Load Balancer',
      'Global external proxy Network Load Balancer',
      'Global external Application Load Balancer'
    ],
    answer: 0,
    explanation: 'Internal passthrough Network Load Balancers spread TCP and UDP across backends in a region on an internal IP without proxying, so client IPs are preserved. Application and proxy load balancers terminate connections, and external ones face the internet.'
  },
  {
    id: 'ace-m4-087',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'Creating a regional internal Application Load Balancer fails because the region has no subnet for the load balancer’s proxies. What must you create first?',
    options: [
      'A proxy-only subnet with purpose REGIONAL_MANAGED_PROXY in that region and VPC',
      'A Cloud NAT gateway for the region so that the proxies can reach the internet',
      'A secondary range on the backend subnet reserved for the health check probes',
      'A static internal IP address in every zone of the region for the proxy instances'
    ],
    answer: 0,
    explanation: 'Envoy-based regional load balancers run their proxies in a proxy-only subnet of the region; backends see traffic from that range, so firewall rules must allow it. Cross-region internal load balancers use GLOBAL_MANAGED_PROXY subnets instead. NAT, secondary ranges and per-zone IPs are not required.'
  },
  {
    id: 'ace-m4-088',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A Cloud Run service needs a custom domain with a Google-managed certificate, Cloud Armor protection and Cloud CDN. How do you put it behind a global external Application Load Balancer?',
    options: [
      'Create a serverless NEG pointing to the Cloud Run service and use it as a backend',
      'Create an instance group from the Cloud Run instances and use it as a backend',
      'Give the Cloud Run service a static IP and point the load balancer at that IP',
      'Create a zonal NEG with the Cloud Run URL as an endpoint in each of the zones'
    ],
    answer: 0,
    explanation: 'Serverless NEGs let Application Load Balancers send traffic to Cloud Run, App Engine and Cloud Run functions, adding custom domains, certificates, Cloud Armor and CDN. Cloud Run instances are not VMs, services have no static IPs, and zonal NEGs hold VM endpoints.'
  },
  {
    id: 'ace-m4-089',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'During a migration, some backends of a global external Application Load Balancer still run in the data centre, reachable over Interconnect on private IPs. How can the load balancer send traffic to them?',
    options: [
      'Add a hybrid connectivity NEG with the on-premises IP:port endpoints to a backend service',
      'Add the on-premises servers to an unmanaged instance group in the VPC network',
      'Create a serverless NEG that points to the on-premises servers’ host names',
      'Point the URL map directly at the on-premises IP addresses as its backends'
    ],
    answer: 0,
    explanation: 'Hybrid connectivity NEGs hold IP:port endpoints outside Google Cloud that are reachable over hybrid connectivity, so a backend service can mix cloud and on-premises backends. Instance groups hold Compute Engine VMs, serverless NEGs point to Google serverless products, and URL maps reference backend services.'
  },
  {
    id: 'ace-m4-090',
    section: 'planning',
    topic: 'Choosing networking & load balancing',
    difficulty: 'medium',
    prompt: 'A public web app behind a global external Application Load Balancer receives SQL injection attempts and bursts of abusive requests from a few IPs. What should you attach?',
    options: [
      'A Cloud Armor security policy with preconfigured WAF rules and rate limiting',
      'A VPC firewall rule that denies the attacking IPs on the backend VMs',
      'Cloud NAT with a static IP address placed in front of the load balancer',
      'Identity-Aware Proxy, so that every user of the public app must sign in'
    ],
    answer: 0,
    explanation: 'Cloud Armor policies on the backend service filter requests at Google’s edge with preconfigured WAF rules (such as SQL injection), IP and geography rules, and rate limiting. Firewall rules only see the load balancer’s proxies, NAT is for egress, and IAP would require every user to sign in.'
  },
  {
    id: 'ace-m4-091',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Backends of an external Application Load Balancer should take up to 80 requests per second per VM before traffic spills to other zones. Which balancing mode should the backend service use?',
    options: [
      'RATE, with a maximum rate of 80 per instance',
      'UTILIZATION, with a maximum utilization of 80%',
      'CONNECTION, with a maximum of 80 connections',
      'SESSION, with a maximum of 80 user sessions'
    ],
    answer: 0,
    explanation: 'The RATE balancing mode measures requests per second against a target per instance or endpoint; UTILIZATION uses CPU-based utilization, and CONNECTION applies to TCP-based load balancers. SESSION is not a balancing mode. Autoscaling on load-balancing capacity follows the same target.'
  },
  {
    id: 'ace-m4-092',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'When a VM is removed from a backend service during a rolling update, users in the middle of long downloads get cut off. What should you configure?',
    options: [
      'Connection draining with a timeout long enough for in-flight requests',
      'Session affinity with a generated cookie on the backend service',
      'A shorter health check interval on the backend service',
      'A larger maximum surge on the managed instance group'
    ],
    answer: 0,
    explanation: 'Connection draining keeps existing connections to a backend that is being removed open for up to the timeout, so in-flight requests can finish. Session affinity pins clients to backends, health checks detect failures, and surge controls how many new VMs are added.'
  },
  {
    id: 'ace-m4-093',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A legacy application keeps user sessions in memory on each VM, so each user must keep reaching the same backend behind an external Application Load Balancer. What should you configure?',
    options: [
      'Session affinity, such as a generated cookie, on the backend service',
      'Connection draining with a 60-minute timeout on the backend service',
      'The UTILIZATION balancing mode with a capacity scaler of 0.5',
      'A single-zone managed instance group with one very large VM'
    ],
    answer: 0,
    explanation: 'Session affinity sends a client’s requests to the same backend while it stays healthy, for example with a load balancer cookie or the client IP. Draining, balancing modes and a single big VM do not keep a user on one instance. Moving sessions into Memorystore would remove the need altogether.'
  },
  {
    id: 'ace-m4-094',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'hard',
    prompt: 'Your VMs serve the app on port 8080, and the backend service sends traffic to the port name http. The load balancer cannot reach the app. What should you check?',
    options: [
      'That the instance group’s named port http maps to 8080, set with `set-named-ports --named-ports=http:8080`',
      'That every VM has an external IP address so that the load balancer can reach port 8080',
      'That the URL map rewrites every request path to port 8080 before forwarding it',
      'That Cloud NAT is configured for port 8080 in the region of the backends'
    ],
    answer: 0,
    explanation: 'For instance group backends, the backend service sends traffic to a named port, which each instance group maps to a number; if http still maps to 80, traffic misses the app. Load balancers reach VMs on internal IPs, URL maps choose backend services rather than ports, and NAT is for egress.'
  },
  {
    id: 'ace-m4-095',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Requests to example.com/api/* must go to the api backend service, and everything else to the web backend service. Where do you configure this?',
    options: [
      'In the URL map, with a path matcher that sends /api/* to the api backend service',
      'In the backend services, with a regular expression set on each health check',
      'In the forwarding rules, with one forwarding rule for each URL path',
      'In Cloud DNS, with a separate record for each path of the website'
    ],
    answer: 0,
    explanation: 'URL maps route requests by host and path to backend services or buckets, with a default service for everything else. Health checks probe backends, forwarding rules match IP, port and protocol, and DNS works with host names, not paths.'
  },
  {
    id: 'ace-m4-096',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A Google-managed certificate for shop.example.com stays in the PROVISIONING state for hours after you attach it to the load balancer. What is the most likely cause?',
    options: [
      'The domain’s DNS record does not yet point to the load balancer’s IP address',
      'The certificate must be uploaded as a PEM file before Google can activate it',
      'The load balancer uses the Premium Tier, which delays managed certificates',
      'Managed certificates only work for domains bought through a Google registrar'
    ],
    answer: 0,
    explanation: 'Google-managed certificates are issued once the domain resolves to the load balancer (or a DNS authorization is set up with Certificate Manager). Self-managed certificates are the ones you upload, the tier does not matter, and any registrar works.'
  },
  {
    id: 'ace-m4-097',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'easy',
    prompt: 'You want static assets served by a global external Application Load Balancer to be cached at Google’s edge, close to users. What should you do?',
    options: [
      'Enable Cloud CDN on the backend service or backend bucket',
      'Add more zones to the backend instance group',
      'Turn on session affinity for the backend service',
      'Create a regional load balancer in each user region'
    ],
    answer: 0,
    explanation: 'Cloud CDN is a setting on the backend service or backend bucket of an external Application Load Balancer; cacheable responses are then served from Google’s edge caches. More zones, affinity or extra regional load balancers do not cache content.'
  },
  {
    id: 'ace-m4-098',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'After deploying new CSS files, users keep receiving the old versions from Cloud CDN for hours. You need the new files served now. What should you run?',
    options: [
      '`gcloud compute url-maps invalidate-cdn-cache web-map --path="/css/*"`',
      '`gcloud compute backend-services update web --no-enable-cdn`, then enable it again',
      '`gcloud storage rm gs://web-assets/css/**`, then upload the files a second time',
      '`gcloud compute url-maps update web-map --cache-ttl=0`'
    ],
    answer: 0,
    explanation: 'Cache invalidation removes cached content for a path pattern across the CDN; versioned file names avoid the need for it next time. Turning CDN off and on is disruptive, re-uploading does not clear edge caches, and URL maps have no TTL flag.'
  },
  {
    id: 'ace-m4-099',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'Premium videos served through Cloud CDN must be viewable only by paying customers for a limited time, while still being cached at the edge. What should you use?',
    options: [
      'Cloud CDN signed URLs or signed cookies with an expiry time',
      'Cloud Storage signed URLs issued for each video segment',
      'Identity-Aware Proxy in front of the CDN-enabled backend',
      'A Cloud Armor rule that allows only the customers’ IP addresses'
    ],
    answer: 0,
    explanation: 'Cloud CDN signed URLs and signed cookies grant time-limited access to cached content and are checked at the edge, so content stays cached but private. Cloud Storage signed URLs are validated by Cloud Storage rather than the CDN, IAP cannot be combined with Cloud CDN on a backend, and customers’ IPs change constantly.'
  },
  {
    id: 'ace-m4-100',
    section: 'operating',
    topic: 'Managing networking',
    difficulty: 'medium',
    prompt: 'A backend’s CDN cache mode is FORCE_CACHE_ALL, and pages that differ per user are being cached. You want only responses with explicit cache directives from the origin to be cached. Which cache mode should you set?',
    options: ['USE_ORIGIN_HEADERS', 'CACHE_ALL_STATIC', 'FORCE_CACHE_ALL', 'CACHE_EVERYTHING'],
    answer: 0,
    explanation: 'USE_ORIGIN_HEADERS caches only responses that carry valid caching headers from the origin. CACHE_ALL_STATIC, the default, also caches static content types without headers; FORCE_CACHE_ALL caches everything regardless of headers; CACHE_EVERYTHING does not exist.'
  }
];
