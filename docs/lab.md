# The lab

A browser-only practice lab for the Google Cloud exams, in the spirit of Cisco Packet Tracer:
everything is simulated, so it needs no account, costs nothing, and keeps working under the site's
strict Content Security Policy (`default-src 'self'`, no backend). Route: `#/<exam>/lab`, then
`#/<exam>/lab/<mode>/<scenario>`. Only exams with `lab: true` in their definition show it (CDL and
ACE). The views are lazy-loaded, so the lab costs nothing until it is opened.

The simulators are plain TypeScript in `src/lab/` with no Svelte or DOM, so the regression scripts
in `scripts/lab/` run them directly with Bun. The views in `src/views/lab/` only render state and
forward input.

## Why a simulator and not real cloud

Skills Boost, Killercoda and KodeKloud give you a real VM or project behind a terminal, then grade
by running a check script against it. That needs a backend and a cloud bill. Packet Tracer takes
the other route: an abstract model of the devices that is faithful where the course tests and silent
elsewhere. The lab does the same for Google Cloud — it models exactly the behaviour the ACE and CDL
exams probe, and every decision it makes is explained in words.

## Topologi jaringan (`src/lab/net/`)

- `model.ts` — the data: `Topology` holds VPCs (with their subnets and firewall rules), VMs,
  peerings, Cloud NATs, VPN tunnels and load balancers. Plain JSON, so it can be cloned for undo and
  saved to `localStorage`.
- `engine.ts` — `probe(topology, {from, to, proto, port})` walks the path and returns a `Trace`: a
  list of hops, each with the canvas node it happened at, pass/fail, and the reason. Semantics:
  - VPCs are global, subnets regional; subnet routes reach every subnet in the VPC.
  - Firewall rules are stateful and evaluated per VM: lowest priority number wins, deny beats allow
    at equal priority, and the two implied rules sit at 65535 (deny all ingress, allow all egress).
  - Targets are all instances, target tags or target service accounts; source tags and source
    service accounts match only VMs in the same VPC (so they do not work across peering).
  - Internet egress needs the default route and either an external IP or a Cloud NAT in the VM's
    region; unsolicited inbound needs an external IP — NAT never accepts it.
  - Google APIs are reachable with an external IP, Private Google Access on the subnet, or NAT.
  - Peering needs both sides, refuses overlapping ranges, and is not transitive; routes learned over
    VPN cross a peering only with custom-route export/import on both sides.
  - Cloud VPN routes reach only the Cloud Router's region unless the VPC's dynamic routing mode is
    GLOBAL.
  - IAP TCP forwarding arrives from 35.235.240.0/20 and needs no external IP.
  - Load balancer backends must allow the health-check ranges (130.211.0.0/22, 35.191.0.0/16); the
    Application LBs proxy from those ranges, the passthrough Network LBs keep the client's address.
    A LB works while at least one backend is healthy.
- `layout.ts` — places every node on a 1000-unit-wide canvas (outside endpoints on top, load
  balancers under them, one column per VPC) and records each node's centre, so the packet animation
  can follow a trace's hops.
- `scenarios.ts` — each scenario builds a starting topology and lists goals: probes that must
  connect or must be blocked, plus design checks such as "no external IP" or "no rule opens tcp:22
  to 0.0.0.0/0". Solved means every goal holds at once.

## Terminal (`src/lab/term/`)

- `state.ts` — the fake account: gcloud configurations, projects (billing, enabled APIs, networks,
  firewall rules, routers and NATs, VMs, disks, templates and MIGs, buckets, datasets, GKE clusters
  with their Kubernetes objects, service accounts and IAM bindings, Cloud Run, Cloud SQL, Pub/Sub,
  functions) and the files in the Cloud Shell home directory.
- `shell.ts` and `run.ts` — tokenising with quotes, `&&` and `;`, `$VAR` and
  `$(gcloud config get-value project)` expansion, a handful of builtins, tab completion.
- `gcloud.ts`, `gsutil.ts`, `storage.ts`, `kubectl.ts`, `bq.ts` — the commands. Each validates like
  the real CLI and prints output shaped like it. Errors carry a `hint` in Indonesian, shown under
  the error. `gcloud compute ssh` asks the network engine (through `topology.ts`) whether port 22 is
  reachable, so firewall mistakes made in the terminal show up the same way they do on the canvas.
- `scenarios.ts` — tasks are predicates over the state, not over the typed text, so `gsutil mb`
  and `gcloud storage buckets create` both pass. Each scenario carries a reference `solution`.

## Skenario arsitektur (`src/lab/arch/`)

- `catalog.ts` — about 55 services, each with a one-line "what it is for"; that line doubles as the
  feedback when a service lands in the wrong slot.
- `scenarios.ts` — a case, its requirements, stages laid out left to right, and slots. Each slot has
  `best` answers (2 points), `ok` answers with the caveat that costs a point (1), and `traps` with a
  targeted explanation (0). 80% passes.

## Adding a scenario

1. Add it to the mode's `scenarios.ts` with a unique `id`, a `level` (Dasar, Menengah, Lanjut), a
   one-line `summary` and the exam `topics` it practises.
2. Network: write `build()` and the `goals`, then add a reference fix to
   `scripts/lab/net-solutions.ts`. Terminal: write `build()`, the `tasks` and a `solution` command
   list. Architecture: list the slots and their keys.
3. Run `bun run lab`. Every scenario must start unsolved, and its reference solution must solve it
   without a single error line.

Progress (`ep-lab-done-v1`) and work in progress (`ep-lab-work-v1:<mode>:<id>`) live in
`localStorage`; clearing site data resets them.
