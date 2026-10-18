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

## Kuis perintah (`src/lab/cmd/`)

A drill on the Commands sheet: each question is a task, answered by typing the command. The
interesting part is that a typed line is never compared as text.

- `grammar.ts` — a compact DSL for command trees. A command is a path (`compute instances create`,
  with aliases as `top pod|pods|po`), positionals (`NAME`, `[NAME]`, `NAME...`) and flags
  (`*required !boolean name/z:choice,choice~norm+`). Also value normalisers (sizes, lists, splits,
  DNS names, percentages) and the `<ANY>` / `{a|b}` value patterns.
- `specs.ts` — the trees for gcloud (including gcloud storage), gsutil, kubectl, bq, terraform and
  docker, as of gcloud 589, kubectl 1.34 and Docker 29. Only as complete as the quiz needs, plus
  neighbours so that a near miss gets a realistic suggestion list. Checks that need values live here
  too: `gcloud config set zone` → `Section [core] has no property [zone].`, a target CPU of 60 →
  `Value must be less than or equal to 1.0; received: 60.0`, Terraform `apply tfplan -var …`.
- `parse.ts` — walks the tree and reads flags in each tool's style (argparse, pflag, getopt, absl, Go
  flags), then either returns the error that tool prints or a canonical `Parsed`: aliases resolved,
  `TYPE/NAME` split and pluralised, `--location` mapped to `--zone`/`--region`, `--cpu-percent`
  mapped to `--cpu`. Error shapes follow the tools' own format strings — gcloud's `Invalid choice`
  with the 589 "Maybe you meant" list, `unrecognized arguments` with `(did you mean '--zone'?)`,
  `argument --member --role: Must be specified.` and the usage block; kubectl's two footers; docker's
  `requires 1 argument`; terraform's `Did you mean "plan"?`. Strings that could not be found in a
  source are marked reconstructed in the code.
- `grade.ts` — answer patterns are commands with `<ANY>`, `{a|b}` and `[--optional=value]`. Both the
  pattern and the typed line are parsed, then compared: path, positionals, `--` args, every flag the
  pattern needs with its value; extra known flags are allowed unless an item forbids one. Feedback
  names the first difference in Indonesian. `traps` add targeted messages for classic mistakes
  (`gcloud auth init`, `set-iam-policy-binding`, `-p 80:8080`).
- `outputs.ts` — what a right answer prints, built from the typed values (the 2026 `gcloud init`
  wording, `Created [...]` tables, the Cloud Shell component-manager message, kubectl and docker
  tables, Terraform's plan and apply text).
- `bank.ts` — 14 sections, 271 questions, prompts in English as the sheet words them, explanations in
  Indonesian. The mixed paper draws 20 at random.

To add a question, add a `q(id, prompt, answers, explain, { hint, traps, forbid, display })` to a
section and run `bun run lab`: `scripts/lab/cmd-check.ts` parses every pattern, checks that each
answer's shown form is accepted by its own pattern, and runs a list of right and wrong lines.

## Kanvas layanan (`src/lab/canvas/`)

A design canvas in the style of n8n (96px tiles on a 16px grid, labels under the tile, bezier wires,
state colours on the border) with Packet Tracer's feedback loop (link lights, an equivalent-command
pane, step-by-step simulation, an activity checklist).

- `model.ts` — the design: nodes (type, name, position, params) and edges (from, to, params), plain
  JSON. An edge points from the caller to what it calls, from an event source to its consumer, or
  from an attachment to what it attaches to (service account → Cloud Run, VM → VPC).
- `catalog.ts` — 21 services. Each has its config fields (the Console create form, basic and
  advanced, with the documented defaults), validation (naming rules, Cloud Run CPU/memory pairs,
  Cloud SQL tiers, soft-delete range, subnet overlaps, firewall syntax…) and the gcloud command that
  would create it, which the inspector shows live.
- `rules.ts` — what each pair means. A rule names the mechanism, the IAM roles it needs and who must
  hold them (runtime service account, push or trigger identity, a Google service agent, or the
  deployer for actAs), the env vars it hands the caller (as Application Design Center does), the
  network path a request takes (Direct VPC egress, private services access, PGA, Cloud NAT, firewall
  rules including the health-check ranges) and its gcloud commands. Pairs with no mechanism are
  refused with the reason — Cloud Storage → Cloud SQL, Pub/Sub → Firestore, LB → database.
- `sim.ts` — `deploy` creates everything in dependency order and reports per node and edge; roles
  marked as deploy-time (actAs, secrets read at start-up, image pulls, Eventarc's agent) fail the
  deploy. `trace` sends one request or event from a start node and follows it hop by hop, checking
  the target's deploy state, the network path and each runtime role. `script` renders the whole
  design as a gcloud script.
- `scenarios.ts` — goals are assertions over the design, the fresh deploy and the fresh test runs,
  graded live like Packet Tracer's Activity Wizard. Some scenarios start empty, some start broken.

Every role starts granted, as ADC does when it wires a connection; unticking one in the edge's IAM
list shows what happens without it. Broken scenarios set a grant to false in their `build`.

To add a scenario, write `build()` and `goals` in `scenarios.ts` and a reference fix in
`scripts/lab/canvas-solutions.ts`. `bun run lab` checks that it starts unsolved and that the fix
solves every goal after a deploy and the default test runs; it also checks that every service's
defaults are valid and every rule renders.

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
`localStorage`; clearing site data resets them. The command quiz also keeps each section's best
score under `ep-lab-cmd-best-v1`.

## Sources

The CLI grammars and error strings, the config limits and the connection rules come from the
research in `reports/GCP lab command quiz and canvas.md`, with every finding cited in
`research_notes/GCP lab command quiz and canvas/` (gcloud SDK 589 source, kubectl 1.34 and Docker 29
run locally, Terraform source, Google Cloud docs as of October 2026).
