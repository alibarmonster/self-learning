/**
 * Regression check for the network lab: every scenario must start unsolved,
 * and its reference solution must solve it. Run with `bun scripts/lab/net-solutions.ts`.
 */
import { NET_SCENARIOS, checkGoal } from '../../src/lab/net/scenarios';
import { fwRule, uid, vmByName, vpcByName, type Topology } from '../../src/lab/net/model';

const SOLUTIONS: Record<string, (t: Topology) => void> = {
  'web-open'(t) {
    vmByName(t, 'web-1')!.tags.push('http-server');
    vpcByName(t, 'prod-vpc')!.firewall.push(
      fwRule({ name: 'allow-http', sourceRanges: ['0.0.0.0/0'], targetTags: ['http-server'], rules: [{ proto: 'tcp', ports: [[80, 80]] }] })
    );
  },
  'three-tier'(t) {
    const v = vpcByName(t, 'shop-vpc')!;
    v.firewall.push(fwRule({ name: 'web-to-app', sourceTags: ['web'], targetTags: ['app'], rules: [{ proto: 'tcp', ports: [[8080, 8080]] }] }));
    v.firewall.push(fwRule({ name: 'app-to-db', sourceTags: ['app'], targetTags: ['db'], rules: [{ proto: 'tcp', ports: [[5432, 5432]] }] }));
  },
  'cloud-nat'(t) {
    const v = vpcByName(t, 'batch-vpc')!;
    t.nats.push({ id: uid('nat'), name: 'nat-jkt', vpcId: v.id, region: 'asia-southeast2', subnets: 'all' });
  },
  'private-google-access'(t) {
    vpcByName(t, 'data-vpc')!.subnets.find((s) => s.name === 'data-subnet')!.privateGoogleAccess = true;
  },
  'iap-ssh'(t) {
    const v = vpcByName(t, 'default')!;
    v.firewall = v.firewall.filter((r) => r.name !== 'default-allow-ssh');
    v.firewall.push(fwRule({ name: 'allow-iap-ssh', sourceRanges: ['35.235.240.0/20'], rules: [{ proto: 'tcp', ports: [[22, 22]] }] }));
  },
  'peering-transitive'(t) {
    const a = vpcByName(t, 'spoke-a')!;
    const b = vpcByName(t, 'spoke-b')!;
    t.peerings.push({ id: uid('p'), name: 'b-to-a', vpcId: b.id, peerVpcId: a.id, exchangeCustomRoutes: false });
  },
  'lb-health'(t) {
    vpcByName(t, 'web-vpc')!.firewall.push(
      fwRule({ name: 'allow-hc', sourceRanges: ['130.211.0.0/22', '35.191.0.0/16'], targetTags: ['web'], rules: [{ proto: 'tcp', ports: [[80, 80]] }] })
    );
  },
  'deny-priority'(t) {
    vpcByName(t, 'default')!.firewall.push(
      fwRule({ name: 'deny-test-db', action: 'deny', sourceTags: ['test'], targetTags: ['db'], rules: [{ proto: 'tcp', ports: [[5432, 5432]] }] })
    );
  },
  'hybrid-vpn'(t) {
    const v = vpcByName(t, 'corp-vpc')!;
    v.routingMode = 'GLOBAL';
    v.firewall.push(fwRule({ name: 'allow-onprem', sourceRanges: ['192.168.0.0/16'], rules: [{ proto: 'tcp', ports: [[443, 443]] }] }));
  }
};

let failed = 0;
for (const s of NET_SCENARIOS) {
  if (!s.goals.length) continue;
  const t = s.build();
  const before = s.goals.map((g) => checkGoal(t, g));
  if (before.every((r) => r.pass)) {
    console.log(`✗ ${s.id}: already solved at start`);
    failed++;
  }
  const fix = SOLUTIONS[s.id];
  if (!fix) {
    console.log(`✗ ${s.id}: no reference solution`);
    failed++;
    continue;
  }
  fix(t);
  const after = s.goals.map((g) => checkGoal(t, g));
  const bad = after.filter((r) => !r.pass);
  if (bad.length) {
    failed++;
    console.log(`✗ ${s.id}`);
    for (const r of bad) console.log('   ', r.goal.kind === 'probe' ? `${r.goal.from}→${r.goal.to}:${r.goal.port}` : r.goal.label, '—', r.note);
  } else console.log(`✓ ${s.id} (${before.filter((r) => !r.pass).length} goals open at start)`);
}
if (failed) process.exit(1);
