<script lang="ts" module>
  export type Sel = { kind: 'vpc' | 'subnet' | 'vm' | 'lb' | 'nat' | 'vpn' | 'new'; id: string } | null;
</script>

<script lang="ts">
  import { isValidCidr, nextHost, normaliseCidr, overlaps } from '@/lab/net/ip';
  import { peeringState } from '@/lab/net/engine';
  import {
    DEFAULT_SA,
    REGIONS,
    fwRule,
    makeSubnet,
    makeVm,
    makeVpc,
    newExternalIp,
    parseRules,
    rulesText,
    uid,
    type FirewallRule,
    type LbType,
    type Topology,
    type Vpc
  } from '@/lab/net/model';

  let { topo = $bindable(), sel = $bindable(), commit }: { topo: Topology; sel: Sel; commit: (before: string) => void } = $props();

  let error = $state('');

  function change(fn: () => void | string) {
    const before = JSON.stringify($state.snapshot(topo));
    const msg = fn();
    if (typeof msg === 'string') {
      error = msg;
      return false;
    }
    error = '';
    commit(before);
    return true;
  }

  const NAME = /^[a-z]([-a-z0-9]{0,40}[a-z0-9])?$/;
  const list = (v: string) => v.split(',').map((x) => x.trim()).filter(Boolean);

  const vpc = $derived(sel?.kind === 'vpc' ? topo.vpcs.find((v) => v.id === sel!.id) : undefined);
  const subnet = $derived(sel?.kind === 'subnet' ? topo.vpcs.flatMap((v) => v.subnets).find((s) => s.id === sel!.id) : undefined);
  const subnetVpc = $derived(subnet ? topo.vpcs.find((v) => v.subnets.includes(subnet)) : undefined);
  const vm = $derived(sel?.kind === 'vm' ? topo.vms.find((v) => v.id === sel!.id) : undefined);
  const lb = $derived(sel?.kind === 'lb' ? topo.lbs.find((v) => v.id === sel!.id) : undefined);
  const nat = $derived(sel?.kind === 'nat' ? topo.nats.find((v) => v.id === sel!.id) : undefined);
  const vpn = $derived(sel?.kind === 'vpn' ? topo.vpns.find((v) => v.id === sel!.id) : undefined);
  const vpcName = (id: string) => topo.vpcs.find((v) => v.id === id)?.name ?? '?';
  const regionsOf = (v: Vpc) => [...new Set(v.subnets.map((s) => s.region))];

  // ── forms ──
  let newVpc = $state({ name: '', mode: 'custom' as Vpc['mode'] });
  let newSubnet = $state({ name: '', region: 'asia-southeast2', cidr: '' });
  let newVm = $state({ name: '', external: false, tags: '', listens: 'tcp:22', sa: DEFAULT_SA });
  let newRule = $state({ name: '', direction: 'INGRESS' as FirewallRule['direction'], action: 'allow' as FirewallRule['action'], priority: 1000, rules: 'tcp:80', sources: '0.0.0.0/0', sourceTags: '', dests: '', targetTags: '', targetSas: '' });
  let newPeer = $state({ peer: '', exchange: false });
  let natRegion = $state('');
  let vpnForm = $state({ region: '', ha: true });
  let lbForm = $state({ name: '', type: 'external-alb' as LbType, port: 80, backendPort: 80, region: '' });
  let showRuleForm = $state(false);

  // A new selection starts with clean forms and no stale error.
  $effect(() => {
    void sel;
    error = '';
    showRuleForm = false;
    if (vpc) {
      const r = regionsOf(vpc)[0] ?? 'asia-southeast2';
      natRegion = r;
      vpnForm = { region: r, ha: true };
      lbForm = { name: '', type: 'external-alb', port: 80, backendPort: 80, region: r };
      newPeer = { peer: topo.vpcs.find((v) => v.id !== vpc.id)?.id ?? '', exchange: false };
    }
  });

  function addVpc() {
    change(() => {
      const n = newVpc.name.trim();
      if (!NAME.test(n)) return 'Nama VPC: huruf kecil, angka dan tanda hubung, diawali huruf.';
      if (topo.vpcs.some((v) => v.name === n)) return 'Nama VPC sudah dipakai.';
      const v = makeVpc(n, newVpc.mode, ['asia-southeast2', 'us-central1']);
      topo.vpcs.push(v);
      sel = { kind: 'vpc', id: v.id };
      newVpc = { name: '', mode: 'custom' };
    });
  }

  function addSubnet(v: Vpc) {
    change(() => {
      const n = newSubnet.name.trim();
      const c = newSubnet.cidr.trim();
      if (!NAME.test(n)) return 'Nama subnet tidak valid.';
      if (v.subnets.some((s) => s.name === n && s.region === newSubnet.region)) return 'Subnet dengan nama itu sudah ada di region tersebut.';
      if (!c.includes('/') || !isValidCidr(c)) return 'CIDR tidak valid, contoh 10.10.1.0/24.';
      const norm = normaliseCidr(c);
      const bits = Number(norm.split('/')[1]);
      if (bits < 8 || bits > 29) return 'Prefix subnet harus antara /8 dan /29.';
      const clash = v.subnets.find((s) => overlaps(s.cidr, norm));
      if (clash) return `Range ${norm} tumpang tindih dengan subnet ${clash.name} (${clash.cidr}). Dalam satu VPC, range tidak boleh overlap — walau beda region.`;
      v.subnets.push(makeSubnet(n, newSubnet.region, norm));
      newSubnet = { name: '', region: newSubnet.region, cidr: '' };
    });
  }

  function addVm() {
    if (!subnet || !subnetVpc) return;
    const sn = subnet;
    const vp = subnetVpc;
    change(() => {
      const n = newVm.name.trim();
      if (!NAME.test(n)) return 'Nama VM tidak valid.';
      if (topo.vms.some((m) => m.name === n)) return 'Nama VM sudah dipakai.';
      const listens = list(newVm.listens);
      if (listens.some((l) => !/^(tcp|udp):\d{1,5}$/.test(l))) return 'Layanan ditulis seperti tcp:80, udp:53.';
      const m = makeVm(topo, { name: n, vpc: vp, subnet: sn, external: newVm.external, tags: list(newVm.tags), listens, serviceAccount: newVm.sa.trim() || DEFAULT_SA });
      if (m.internalIp === '0.0.0.0') return 'Subnet penuh.';
      topo.vms.push(m);
      newVm = { name: '', external: false, tags: '', listens: 'tcp:22', sa: DEFAULT_SA };
    });
  }

  function addRule(v: Vpc) {
    change(() => {
      const r = newRule;
      const n = r.name.trim();
      if (!NAME.test(n)) return 'Nama rule tidak valid.';
      if (topo.vpcs.some((x) => x.firewall.some((f) => f.name === n))) return 'Nama rule sudah dipakai (unik per project).';
      const specs = parseRules(r.rules);
      if (!specs) return 'Protokol/port tidak valid. Contoh: tcp:80,tcp:443,icmp atau all.';
      const pr = Number(r.priority);
      if (!Number.isInteger(pr) || pr < 0 || pr > 65535) return 'Priority 0–65535.';
      const sources = list(r.sources);
      const dests = list(r.dests);
      for (const c of [...sources, ...dests]) if (!isValidCidr(c)) return `Range tidak valid: ${c}`;
      if (r.direction === 'INGRESS' && !sources.length && !list(r.sourceTags).length) return 'Rule ingress butuh source: range IP atau source tag.';
      if (list(r.targetTags).length && list(r.targetSas).length) return 'Pilih target tag ATAU target service account, tidak keduanya.';
      v.firewall.push(
        fwRule({
          name: n,
          direction: r.direction,
          action: r.action,
          priority: pr,
          rules: specs,
          sourceRanges: r.direction === 'INGRESS' ? sources : [],
          sourceTags: r.direction === 'INGRESS' ? list(r.sourceTags) : [],
          destinationRanges: r.direction === 'EGRESS' ? (dests.length ? dests : ['0.0.0.0/0']) : [],
          targetTags: list(r.targetTags),
          targetServiceAccounts: list(r.targetSas)
        })
      );
      newRule = { ...newRule, name: '' };
      showRuleForm = false;
    });
  }

  function addPeer(v: Vpc) {
    change(() => {
      const other = topo.vpcs.find((x) => x.id === newPeer.peer);
      if (!other) return 'Pilih VPC tujuan.';
      if (topo.peerings.some((p) => p.vpcId === v.id && p.peerVpcId === other.id)) return 'Peering dari sisi ini sudah ada.';
      topo.peerings.push({ id: uid('peer'), name: `${v.name}-to-${other.name}`, vpcId: v.id, peerVpcId: other.id, exchangeCustomRoutes: newPeer.exchange });
    });
  }

  function addNat(v: Vpc) {
    change(() => {
      if (!natRegion) return 'Pilih region.';
      if (topo.nats.some((n) => n.vpcId === v.id && n.region === natRegion)) return 'Sudah ada Cloud NAT di region itu.';
      topo.nats.push({ id: uid('nat'), name: `nat-${natRegion}`, vpcId: v.id, region: natRegion, subnets: 'all' });
    });
  }

  function addVpn(v: Vpc) {
    change(() => {
      if (!vpnForm.region) return 'Pilih region.';
      topo.vpns.push({ id: uid('vpn'), name: `${vpnForm.ha ? 'ha-vpn' : 'vpn'}-${vpnForm.region}`, vpcId: v.id, region: vpnForm.region, ha: vpnForm.ha, remoteCidr: topo.onPremCidr });
    });
  }

  function addLb(v: Vpc) {
    change(() => {
      const n = lbForm.name.trim();
      if (!NAME.test(n)) return 'Nama load balancer tidak valid.';
      if (topo.lbs.some((l) => l.name === n)) return 'Nama sudah dipakai.';
      const external = lbForm.type.startsWith('external');
      const region = lbForm.type === 'external-alb' ? 'global' : lbForm.region;
      let ip = `34.120.${10 + topo.lbs.length}.${20 + topo.lbs.length * 3}`;
      if (!external) {
        const sn = v.subnets.find((s) => s.region === region);
        if (!sn) return `Internal LB butuh subnet di ${region}.`;
        ip = nextHost(sn.cidr, [...topo.vms.filter((m) => m.subnetId === sn.id).map((m) => m.internalIp), ...topo.lbs.map((l) => l.ip)]) ?? ip;
      }
      const lb = { id: uid('lb'), name: n, type: lbForm.type, vpcId: v.id, region, port: Number(lbForm.port), backendPort: Number(lbForm.backendPort), backendVmIds: [] as string[], ip };
      topo.lbs.push(lb);
      sel = { kind: 'lb', id: lb.id };
    });
  }

  function removeVpc(v: Vpc) {
    change(() => {
      if (topo.vms.some((m) => m.vpcId === v.id)) return 'Hapus dulu VM di VPC ini.';
      topo.vpcs = topo.vpcs.filter((x) => x.id !== v.id);
      topo.peerings = topo.peerings.filter((p) => p.vpcId !== v.id && p.peerVpcId !== v.id);
      topo.nats = topo.nats.filter((n) => n.vpcId !== v.id);
      topo.vpns = topo.vpns.filter((n) => n.vpcId !== v.id);
      topo.lbs = topo.lbs.filter((n) => n.vpcId !== v.id);
      sel = null;
    });
  }

  function ruleSummary(r: FirewallRule) {
    const src = r.direction === 'INGRESS' ? [...r.sourceRanges, ...r.sourceTags.map((t) => `tag:${t}`), ...r.sourceServiceAccounts.map((s) => `sa:${s}`)].join(', ') || '0.0.0.0/0' : r.destinationRanges.join(', ');
    const tgt = r.targetTags.length ? r.targetTags.map((t) => `tag:${t}`).join(', ') : r.targetServiceAccounts.length ? r.targetServiceAccounts.map((s) => `sa:${s}`).join(', ') : 'semua VM';
    return `${r.direction === 'INGRESS' ? 'dari' : 'ke'} ${src} · target ${tgt}`;
  }

  const sortedRules = (v: Vpc) => [...v.firewall].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
</script>

<div class="inspector">
  {#if error}<p class="error" role="alert">{error}</p>{/if}

  {#if !sel}
    <p class="empty">Klik elemen di diagram untuk melihat dan mengubah konfigurasinya, atau tambah VPC baru.</p>
    <button class="btn btn-secondary sm" onclick={() => (sel = { kind: 'new', id: '' })}>+ VPC baru</button>
  {:else if sel.kind === 'new'}
    <h3>VPC baru</h3>
    <div class="form">
      <label>Nama <input bind:value={newVpc.name} placeholder="prod-vpc" /></label>
      <label>Mode subnet
        <select bind:value={newVpc.mode}>
          <option value="custom">custom — subnet kamu buat sendiri</option>
          <option value="auto">auto — satu subnet /20 per region</option>
        </select>
      </label>
      <button class="btn btn-primary sm" onclick={addVpc}>Buat VPC</button>
      <p class="note">VPC itu global; subnet-lah yang regional. Mode auto memakai range 10.128.0.0/9 — dua VPC auto selalu bentrok kalau di-peering.</p>
    </div>
  {:else if vpc}
    <div class="title">
      <h3>VPC {vpc.name}</h3>
      <button class="link danger" onclick={() => removeVpc(vpc)}>Hapus</button>
    </div>
    <p class="meta">Mode {vpc.mode} · {vpc.subnets.length} subnet · global</p>

    <section>
      <h4>Routing</h4>
      <label class="inline">Dynamic routing mode
        <select value={vpc.routingMode} onchange={(e) => change(() => void (vpc.routingMode = (e.currentTarget as HTMLSelectElement).value as Vpc['routingMode']))}>
          <option value="REGIONAL">REGIONAL</option>
          <option value="GLOBAL">GLOBAL</option>
        </select>
      </label>
      <label class="check">
        <input type="checkbox" checked={vpc.defaultInternetRoute} onchange={(e) => change(() => void (vpc.defaultInternetRoute = (e.currentTarget as HTMLInputElement).checked))} />
        Default route 0.0.0.0/0 → internet gateway
      </label>
    </section>

    <section>
      <h4>Firewall <span class="sub">{vpc.firewall.length} rule + 2 implied</span></h4>
      <ul class="rules">
        {#each sortedRules(vpc) as r (r.id)}
          <li class:off={r.disabled}>
            <div class="rule-top">
              <span class="pri mono">{r.priority}</span>
              <span class="act" class:deny={r.action === 'deny'}>{r.action.toUpperCase()}</span>
              <span class="mono">{r.direction === 'INGRESS' ? 'IN' : 'OUT'} {rulesText(r.rules)}</span>
              <span class="tools">
                <button class="link" onclick={() => change(() => void (r.disabled = !r.disabled))}>{r.disabled ? 'aktifkan' : 'nonaktifkan'}</button>
                <button class="link danger" onclick={() => change(() => void (vpc.firewall = vpc.firewall.filter((x) => x.id !== r.id)))} aria-label={`Hapus ${r.name}`}>×</button>
              </span>
            </div>
            <div class="rule-name">{r.name}</div>
            <div class="rule-scope">{ruleSummary(r)}</div>
          </li>
        {/each}
        <li class="implied"><span class="pri mono">65535</span> <span class="act">ALLOW</span> <span class="mono">OUT all</span><div class="rule-scope">implied allow egress — selalu ada</div></li>
        <li class="implied"><span class="pri mono">65535</span> <span class="act deny">DENY</span> <span class="mono">IN all</span><div class="rule-scope">implied deny ingress — selalu ada</div></li>
      </ul>
      {#if showRuleForm}
        <div class="form">
          <label>Nama <input bind:value={newRule.name} placeholder="allow-http" /></label>
          <div class="two">
            <label>Arah
              <select bind:value={newRule.direction}>
                <option value="INGRESS">INGRESS (masuk)</option>
                <option value="EGRESS">EGRESS (keluar)</option>
              </select>
            </label>
            <label>Aksi
              <select bind:value={newRule.action}>
                <option value="allow">allow</option>
                <option value="deny">deny</option>
              </select>
            </label>
          </div>
          <div class="two">
            <label>Priority <input type="number" min="0" max="65535" bind:value={newRule.priority} /></label>
            <label>Protokol:port <input class="mono" bind:value={newRule.rules} placeholder="tcp:80,tcp:443" /></label>
          </div>
          {#if newRule.direction === 'INGRESS'}
            <label>Source IP ranges <input class="mono" bind:value={newRule.sources} placeholder="0.0.0.0/0, 130.211.0.0/22" /></label>
            <label>Source tags <input bind:value={newRule.sourceTags} placeholder="web" /></label>
          {:else}
            <label>Destination ranges <input class="mono" bind:value={newRule.dests} placeholder="0.0.0.0/0" /></label>
          {/if}
          <label>Target tags <input bind:value={newRule.targetTags} placeholder="kosong = semua VM" /></label>
          <label>Target service accounts <input bind:value={newRule.targetSas} placeholder="opsional" /></label>
          <div class="row-btns">
            <button class="btn btn-primary sm" onclick={() => addRule(vpc)}>Tambah rule</button>
            <button class="btn btn-ghost sm" onclick={() => (showRuleForm = false)}>Batal</button>
          </div>
          <p class="note">Range penting: IAP 35.235.240.0/20 · health check LB 130.211.0.0/22 dan 35.191.0.0/16.</p>
        </div>
      {:else}
        <button class="btn btn-secondary sm" onclick={() => (showRuleForm = true)}>+ Rule firewall</button>
      {/if}
    </section>

    <section>
      <h4>Subnet</h4>
      <ul class="items">
        {#each vpc.subnets as s (s.id)}
          <li><button class="link" onclick={() => (sel = { kind: 'subnet', id: s.id })}>{s.name}</button> <span class="mono">{s.region} {s.cidr}</span>{#if s.privateGoogleAccess}<span class="tag">PGA</span>{/if}</li>
        {/each}
      </ul>
      <div class="form compact">
        <div class="three">
          <input bind:value={newSubnet.name} placeholder="nama" aria-label="Nama subnet" />
          <select bind:value={newSubnet.region} aria-label="Region">
            {#each REGIONS as r (r)}<option value={r}>{r}</option>{/each}
          </select>
          <input class="mono" bind:value={newSubnet.cidr} placeholder="10.0.1.0/24" aria-label="CIDR" />
        </div>
        <button class="btn btn-secondary sm" onclick={() => addSubnet(vpc)}>+ Subnet</button>
      </div>
    </section>

    <section>
      <h4>VPC peering</h4>
      <ul class="items">
        {#each topo.peerings.filter((p) => p.vpcId === vpc.id) as p (p.id)}
          {@const st = peeringState(topo, p.vpcId, p.peerVpcId)}
          <li>
            <span>→ {vpcName(p.peerVpcId)}</span>
            <span class="tag" class:good={st.active}>{st.active ? 'ACTIVE' : 'INACTIVE'}</span>
            <label class="check small"><input type="checkbox" checked={p.exchangeCustomRoutes} onchange={() => change(() => void (p.exchangeCustomRoutes = !p.exchangeCustomRoutes))} /> custom routes</label>
            <button class="link danger" onclick={() => change(() => void (topo.peerings = topo.peerings.filter((x) => x.id !== p.id)))} aria-label="Hapus peering">×</button>
            {#if !st.active}<small>{st.reason}</small>{/if}
          </li>
        {/each}
      </ul>
      {#if topo.vpcs.length > 1}
        <div class="form compact">
          <div class="two">
            <select bind:value={newPeer.peer} aria-label="VPC tujuan">
              {#each topo.vpcs.filter((v) => v.id !== vpc.id) as v (v.id)}<option value={v.id}>{v.name}</option>{/each}
            </select>
            <label class="check small"><input type="checkbox" bind:checked={newPeer.exchange} /> export/import custom routes</label>
          </div>
          <button class="btn btn-secondary sm" onclick={() => addPeer(vpc)}>+ Peering dari {vpc.name}</button>
        </div>
      {:else}
        <p class="note">Tambah VPC kedua untuk mencoba peering.</p>
      {/if}
    </section>

    <section>
      <h4>Cloud NAT &amp; Cloud VPN</h4>
      <ul class="items">
        {#each topo.nats.filter((n) => n.vpcId === vpc.id) as n (n.id)}
          <li><button class="link" onclick={() => (sel = { kind: 'nat', id: n.id })}>{n.name}</button> <span class="mono">{n.region}</span></li>
        {/each}
        {#each topo.vpns.filter((n) => n.vpcId === vpc.id) as n (n.id)}
          <li><button class="link" onclick={() => (sel = { kind: 'vpn', id: n.id })}>{n.name}</button> <span class="mono">{n.region}</span></li>
        {/each}
      </ul>
      <div class="form compact">
        <div class="two">
          <select bind:value={natRegion} aria-label="Region NAT">
            {#each regionsOf(vpc) as r (r)}<option value={r}>{r}</option>{/each}
          </select>
          <button class="btn btn-secondary sm" onclick={() => addNat(vpc)} disabled={!regionsOf(vpc).length}>+ Cloud NAT</button>
        </div>
        <div class="two">
          <select bind:value={vpnForm.region} aria-label="Region VPN">
            {#each regionsOf(vpc) as r (r)}<option value={r}>{r}</option>{/each}
          </select>
          <button class="btn btn-secondary sm" onclick={() => addVpn(vpc)} disabled={!regionsOf(vpc).length}>+ HA VPN ke on-prem</button>
        </div>
      </div>
    </section>

    <section>
      <h4>Load balancer</h4>
      <div class="form compact">
        <input bind:value={lbForm.name} placeholder="nama, mis. web-lb" aria-label="Nama load balancer" />
        <select bind:value={lbForm.type} aria-label="Jenis">
          <option value="external-alb">External Application LB (global, proxy)</option>
          <option value="external-nlb">External passthrough Network LB (regional)</option>
          <option value="internal-alb">Internal Application LB (regional, proxy)</option>
          <option value="internal-nlb">Internal passthrough Network LB (regional)</option>
        </select>
        <div class="three">
          <label>Port <input type="number" bind:value={lbForm.port} /></label>
          <label>Backend <input type="number" bind:value={lbForm.backendPort} /></label>
          <label>Region
            <select bind:value={lbForm.region} disabled={lbForm.type === 'external-alb'}>
              {#each regionsOf(vpc) as r (r)}<option value={r}>{r}</option>{/each}
            </select>
          </label>
        </div>
        <button class="btn btn-secondary sm" onclick={() => addLb(vpc)}>+ Load balancer</button>
      </div>
    </section>
  {:else if subnet && subnetVpc}
    <div class="title">
      <h3>Subnet {subnet.name}</h3>
      <button
        class="link danger"
        onclick={() =>
          change(() => {
            if (topo.vms.some((m) => m.subnetId === subnet.id)) return 'Hapus dulu VM di subnet ini.';
            subnetVpc.subnets = subnetVpc.subnets.filter((s) => s.id !== subnet.id);
            sel = { kind: 'vpc', id: subnetVpc.id };
          })}>Hapus</button
      >
    </div>
    <p class="meta">VPC <button class="link" onclick={() => (sel = { kind: 'vpc', id: subnetVpc.id })}>{subnetVpc.name}</button> · {subnet.region} · <span class="mono">{subnet.cidr}</span></p>
    <section>
      <label class="check">
        <input type="checkbox" checked={subnet.privateGoogleAccess} onchange={() => change(() => void (subnet.privateGoogleAccess = !subnet.privateGoogleAccess))} />
        Private Google Access
      </label>
      <p class="note">VM tanpa external IP di subnet ini boleh menjangkau Google APIs (Cloud Storage, BigQuery…).</p>
    </section>
    <section>
      <h4>VM di subnet ini</h4>
      <ul class="items">
        {#each topo.vms.filter((m) => m.subnetId === subnet.id) as m (m.id)}
          <li><button class="link" onclick={() => (sel = { kind: 'vm', id: m.id })}>{m.name}</button> <span class="mono">{m.internalIp}</span></li>
        {/each}
      </ul>
      <div class="form">
        <label>Nama VM <input bind:value={newVm.name} placeholder="web-2" /></label>
        <label>Network tags <input bind:value={newVm.tags} placeholder="web, http-server" /></label>
        <label>Layanan yang listen <input class="mono" bind:value={newVm.listens} placeholder="tcp:22,tcp:80" /></label>
        <label>Service account <input bind:value={newVm.sa} /></label>
        <label class="check"><input type="checkbox" bind:checked={newVm.external} /> External IP</label>
        <button class="btn btn-primary sm" onclick={addVm}>+ VM</button>
      </div>
    </section>
  {:else if vm}
    <div class="title">
      <h3>VM {vm.name}</h3>
      <button
        class="link danger"
        onclick={() =>
          change(() => {
            topo.vms = topo.vms.filter((m) => m.id !== vm.id);
            for (const l of topo.lbs) l.backendVmIds = l.backendVmIds.filter((x) => x !== vm.id);
            sel = null;
          })}>Hapus</button
      >
    </div>
    <p class="meta">{vpcName(vm.vpcId)} · {vm.zone} · internal <span class="mono">{vm.internalIp}</span></p>
    <section>
      <label class="check">
        <input
          type="checkbox"
          checked={!!vm.externalIp}
          onchange={() => change(() => void (vm.externalIp = vm.externalIp ? null : newExternalIp()))}
        />
        External IP {vm.externalIp ? vm.externalIp : ''}
      </label>
      <label>Network tags
        <input
          value={vm.tags.join(', ')}
          onchange={(e) => change(() => void (vm.tags = list((e.currentTarget as HTMLInputElement).value)))}
          placeholder="web, http-server"
        />
      </label>
      <label>Service account
        <input value={vm.serviceAccount} onchange={(e) => change(() => void (vm.serviceAccount = (e.currentTarget as HTMLInputElement).value.trim() || DEFAULT_SA))} />
      </label>
      <label>Layanan yang listen
        <input
          class="mono"
          value={vm.listens.join(',')}
          onchange={(e) =>
            change(() => {
              const l = list((e.currentTarget as HTMLInputElement).value);
              if (l.some((x) => !/^(tcp|udp):\d{1,5}$/.test(x))) return 'Tulis seperti tcp:80,udp:53.';
              vm.listens = l;
            })}
        />
      </label>
      <p class="note">Perubahan tersimpan saat kolom ditinggalkan (Enter/Tab). ICMP (ping) selalu dibalas.</p>
    </section>
  {:else if lb}
    <div class="title">
      <h3>LB {lb.name}</h3>
      <button class="link danger" onclick={() => change(() => void ((topo.lbs = topo.lbs.filter((l) => l.id !== lb.id)), (sel = null)))}>Hapus</button>
    </div>
    <p class="meta">{lb.type} · {lb.region} · frontend <span class="mono">{lb.ip}:{lb.port}</span> → backend :{lb.backendPort}</p>
    <section>
      <h4>Backend</h4>
      {#each topo.vms.filter((m) => m.vpcId === lb.vpcId) as m (m.id)}
        <label class="check">
          <input
            type="checkbox"
            checked={lb.backendVmIds.includes(m.id)}
            onchange={() => change(() => void (lb.backendVmIds = lb.backendVmIds.includes(m.id) ? lb.backendVmIds.filter((x) => x !== m.id) : [...lb.backendVmIds, m.id]))}
          />
          {m.name} <span class="mono">{m.internalIp}</span>
        </label>
      {:else}
        <p class="note">Belum ada VM di VPC ini.</p>
      {/each}
      <p class="note">Backend harus mengizinkan health check dari 130.211.0.0/22 dan 35.191.0.0/16 di port backend.</p>
    </section>
  {:else if nat}
    <div class="title">
      <h3>{nat.name}</h3>
      <button class="link danger" onclick={() => change(() => void ((topo.nats = topo.nats.filter((n) => n.id !== nat.id)), (sel = null)))}>Hapus</button>
    </div>
    <p class="meta">Cloud NAT · VPC {vpcName(nat.vpcId)} · {nat.region} · semua subnet di region ini</p>
    <p class="note">Cloud NAT dipasang pada Cloud Router dan bersifat regional. Ia hanya untuk koneksi keluar; tidak pernah menerima koneksi baru dari internet.</p>
  {:else if vpn}
    <div class="title">
      <h3>{vpn.name}</h3>
      <button class="link danger" onclick={() => change(() => void ((topo.vpns = topo.vpns.filter((n) => n.id !== vpn.id)), (sel = null)))}>Hapus</button>
    </div>
    <p class="meta">Cloud VPN · VPC {vpcName(vpn.vpcId)} · {vpn.region} · remote <span class="mono">{vpn.remoteCidr}</span></p>
    <label class="check"><input type="checkbox" checked={vpn.ha} onchange={() => change(() => void (vpn.ha = !vpn.ha))} /> HA VPN (2 tunnel, SLA 99,99%)</label>
    <p class="note">Route on-prem dipelajari Cloud Router lewat BGP. Dengan routing mode REGIONAL, hanya subnet di {vpn.region} yang memakainya.</p>
  {:else}
    <p class="empty">Elemen ini sudah tidak ada.</p>
  {/if}
</div>

<style>
  .inspector {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
  }

  h3 {
    font-size: var(--type-h4);
  }

  h4 {
    font-family: var(--font);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 8px;
  }

  h4 .sub {
    text-transform: none;
    letter-spacing: 0;
    font-weight: 500;
  }

  section {
    padding-top: 12px;
    border-top: 1px solid var(--line);
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 8px;
  }

  .meta,
  .note,
  .empty {
    font-size: 13px;
    line-height: 1.5;
    color: var(--text-secondary);
  }

  .note {
    color: var(--text-tertiary);
    font-size: 12.5px;
  }

  .error {
    padding: 10px 12px;
    background: var(--red-soft);
    color: var(--red);
    font-size: 13px;
    line-height: 1.45;
  }

  label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-secondary);
  }

  label.check {
    flex-direction: row;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: var(--ink);
  }

  label.check.small {
    font-size: 12.5px;
  }

  label.inline {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  input:not([type='checkbox']),
  select {
    width: 100%;
    min-width: 0;
    padding: 8px 9px;
    border: 1px solid var(--line-strong);
    background: var(--surface);
    color: var(--ink);
    font: inherit;
    font-size: 13.5px;
    font-weight: 400;
  }

  label.inline select {
    width: auto;
  }

  input.mono {
    font-family: var(--font-mono);
    font-size: 12.5px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    background: var(--surface);
    border: 1px solid var(--line);
  }

  .form.compact {
    padding: 0;
    background: transparent;
    border: 0;
  }

  .two,
  .three {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px;
    align-items: end;
  }

  .three {
    grid-template-columns: 1fr 1fr 1fr;
  }

  .row-btns {
    display: flex;
    gap: 6px;
  }

  .link {
    border: 0;
    background: none;
    padding: 0;
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--line-strong);
    text-underline-offset: 3px;
    font-size: 13px;
  }

  .link.danger {
    color: var(--red);
    text-decoration: none;
    font-size: 13px;
  }

  .rules,
  .items {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .rules li {
    padding: 8px 10px;
    background: var(--surface);
    border-left: 3px solid var(--ink);
    font-size: 12.5px;
  }

  .rules li.off {
    opacity: 0.5;
  }

  .rules li.implied {
    border-left-color: var(--line-strong);
    color: var(--text-tertiary);
  }

  .rule-top {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
  }

  .rule-top .tools {
    margin-left: auto;
    display: flex;
    gap: 10px;
  }

  .pri {
    font-weight: 700;
  }

  .act {
    font-weight: 700;
    color: var(--green);
  }

  .act.deny {
    color: var(--red);
  }

  .rule-name {
    margin-top: 2px;
    font-weight: 600;
  }

  .rule-scope {
    color: var(--text-tertiary);
    word-break: break-word;
  }

  .items li {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 8px;
    align-items: center;
    font-size: 13px;
  }

  .items small {
    flex-basis: 100%;
    color: var(--text-tertiary);
    font-size: 12px;
  }

  .items .mono {
    color: var(--text-secondary);
    font-size: 12px;
  }

  .tag {
    padding: 1px 6px;
    font-size: 11px;
    font-weight: 700;
    border: 1px solid var(--line-strong);
    color: var(--text-secondary);
  }

  .tag.good {
    border-color: var(--green);
    color: var(--green);
  }
</style>
