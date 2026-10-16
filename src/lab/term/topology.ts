/**
 * Bridges the terminal lab to the network engine: a project's networks,
 * subnets, VMs, firewall rules and NATs become a Topology, so `gcloud compute
 * ssh` and the scenario checks can ask the same reachability questions the
 * topology lab answers.
 */
import { parseRules, type FwProtoSpec, type Topology } from '../net/model';
import type { Project } from './state';

export function toTopology(p: Project): Topology {
  const t: Topology = { vpcs: [], vms: [], peerings: [], nats: [], vpns: [], lbs: [], onPremCidr: '192.168.0.0/16' };
  for (const n of p.networks) {
    t.vpcs.push({
      id: `net:${n.name}`,
      name: n.name,
      mode: n.mode,
      routingMode: n.routingMode,
      defaultInternetRoute: true,
      subnets: p.subnets
        .filter((s) => s.network === n.name)
        .map((s) => ({ id: `sn:${s.network}:${s.region}:${s.name}`, name: s.name, region: s.region, cidr: s.range, privateGoogleAccess: s.pga })),
      firewall: p.firewalls
        .filter((r) => r.network === n.name)
        .map((r) => ({
          id: `fw:${r.name}`,
          name: r.name,
          direction: r.direction,
          action: r.action === 'ALLOW' ? 'allow' : 'deny',
          priority: r.priority,
          rules: parseRules(r.rules) ?? ([{ proto: 'all', ports: [] }] as FwProtoSpec[]),
          sourceRanges: r.sourceRanges,
          sourceTags: r.sourceTags,
          sourceServiceAccounts: [],
          destinationRanges: r.destinationRanges,
          targetTags: r.targetTags,
          targetServiceAccounts: r.targetServiceAccounts,
          disabled: r.disabled
        }))
    });
  }
  for (const i of p.instances) {
    if (i.status !== 'RUNNING') continue;
    const region = i.zone.slice(0, -2);
    t.vms.push({
      id: `vm:${i.name}`,
      name: i.name,
      vpcId: `net:${i.network}`,
      subnetId: `sn:${i.network}:${region}:${i.subnet}`,
      zone: i.zone,
      internalIp: i.internalIp,
      externalIp: i.externalIp,
      tags: i.tags,
      serviceAccount: i.serviceAccount,
      listens: ['tcp:22', ...(i.startupScript ? ['tcp:80'] : [])]
    });
  }
  for (const nat of p.nats) {
    const router = p.routers.find((r) => r.name === nat.router && r.region === nat.region);
    if (router) t.nats.push({ id: `nat:${nat.name}`, name: nat.name, vpcId: `net:${router.network}`, region: nat.region, subnets: 'all' });
  }
  for (const pe of p.peerings)
    t.peerings.push({ id: `peer:${pe.name}`, name: pe.name, vpcId: `net:${pe.network}`, peerVpcId: `net:${pe.peerNetwork}`, exchangeCustomRoutes: false });
  return t;
}
