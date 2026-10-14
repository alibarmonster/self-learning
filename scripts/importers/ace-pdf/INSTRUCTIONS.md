# Reviewing Associate Cloud Engineer practice questions

You are reviewing questions from a community "dump" for Google Cloud's
Associate Cloud Engineer (ACE) exam. They will go into a personal study app.
For each question in your chunk you produce: a checked answer key, an exam
section, a topic, a difficulty, and an explanation.

## Input

`/home/claude/work/ace/chunks/chunk_NN.json` — a list of
`{ n, prompt, options: {A: "...", B: "...", ...}, pdf_answer, code? }`.
`pdf_answer` is one or more letters, e.g. `"C"` or `"AE"` (multiple select).

## Output

Write `/home/claude/work/ace/out/chunk_NN.json`: a JSON array with exactly one
object per input question, same order:

```json
{
  "n": 12,
  "answer": "C",
  "changed": false,
  "confidence": "high",
  "section": "deploying",
  "topic": "GKE",
  "difficulty": "easy",
  "explanation": "…",
  "tip": "…"
}
```

- `answer`: the correct letter(s), alphabetical, same count as `pdf_answer`
  (a "choose two" stays two letters).
- `changed`: true only if `answer` differs from `pdf_answer`.
- `confidence`: `high` | `medium` | `low` — how sure you are of `answer`.
- `tip`: optional, one short sentence with a reusable rule of thumb. Omit the
  key when there is nothing worth saying. Use it on at most a third of questions.

Validate the file parses as JSON before you finish (e.g. `python3 -c "import json;json.load(open(...))"`).

## Checking the key

Judge against **current** Google Cloud documentation and Google-recommended
practice (2025–2026), as the exam does. Use your own knowledge; if you are
unsure about a specific fact and web search is available, check
cloud.google.com docs.

- Change the key **only when the PDF's answer is clearly wrong** — a factual
  error, a deprecated product the question cannot have meant, or an option
  that plainly fails a stated requirement while another meets it. Typical dump
  errors: wrong letter copied, outdated answers (e.g. Container Registry vs
  Artifact Registry is fine to keep when the options only offer one of them).
- If the question is ambiguous or two options are defensible, **keep the PDF
  key**, set `confidence: "medium"` or `"low"`, and say in the explanation what
  makes it debatable.
- Read the stem's constraints carefully: "fewest steps", "least privilege",
  "Google-recommended", "cost-effective", "without downtime" usually decide it.
- Where a product was renamed (Stackdriver → Cloud Monitoring/Logging, Cloud
  Source Repositories, Container Registry → Artifact Registry, Data Studio →
  Looker Studio, Deployment Manager), explain in today's names but answer the
  question as asked.

## Explanation style

2–4 sentences, plain English, no markdown, no bullet lists, no headings.
Say why the right answer is right, then why the tempting distractor(s) are
wrong — name options by their content, not only by letter ("Coldline would…").
Option letters are shuffled in the app, so **never write "A is wrong" or
"option C"**; refer to what the option says.

When `changed` is true, start with: "The PDF's key says <short paraphrase of
the old option>, but …" and give the reason.

When confidence is medium/low, include one sentence on why it is debatable.

No filler ("Great question", "In summary"). Write like a concise senior
cloud engineer. Use straight ASCII quotes and apostrophes.

## Section (the five ACE exam guide sections)

- `setup` — Setting up a cloud solution environment: resource hierarchy,
  projects, organisation policies, Cloud Identity users/groups, billing
  accounts, budgets and billing export, enabling APIs, quotas, installing and
  configuring the gcloud CLI and Cloud Shell.
- `planning` — Planning and configuring: choosing compute (CE vs GKE vs Cloud
  Run vs Functions vs App Engine), choosing storage/databases and storage
  classes, choosing network resources and load balancer types, pricing
  calculator and cost estimates, Spot/preemptible and committed use choices.
- `deploying` — Deploying and implementing: creating VMs, MIGs, templates,
  GKE clusters and workloads, Cloud Run/Functions/App Engine deployments,
  data products (Cloud SQL, BigQuery, Pub/Sub, Dataflow, Bigtable, Spanner,
  Cloud Storage loads), VPCs/subnets/firewall rules/VPN/peering/Cloud DNS,
  infrastructure as code (Terraform, Deployment Manager, Config Connector),
  Marketplace.
- `operating` — Ensuring successful operation: managing running VMs
  (snapshots, images, SSH, resizing), managing GKE (node pools, autoscaling,
  rolling updates, kubectl), managing serverless versions/traffic splitting,
  managing storage and databases (lifecycle, backups, queries, exports),
  network operations, Cloud Monitoring/Logging/alerts/log sinks, troubleshooting.
- `access` — Configuring access and security: IAM roles and policies, custom
  roles, least privilege, groups, service accounts (keys, impersonation,
  scopes, workload identity), audit logs, Secret Manager, Cloud KMS, IAP,
  OS Login.

If a question touches several, pick the one the **decision** is about.

## Topic — use exactly one of these strings

setup: `Resource hierarchy & org policy`, `Billing & budgets`, `gcloud CLI, APIs & quotas`
planning: `Choosing compute`, `Choosing storage & databases`, `Choosing networking & load balancing`, `Pricing & cost`
deploying: `Compute Engine`, `GKE`, `Cloud Run, App Engine & Functions`, `Data products`, `VPC, DNS & connectivity`, `Infrastructure as code`
operating: `Managing VMs & instance groups`, `Managing GKE`, `Managing storage & databases`, `Monitoring & logging`, `Serverless operations`
access: `IAM roles & policies`, `Service accounts`, `Audit logs, keys & secrets`

The topic must belong to the chosen section's list.

## Difficulty

`easy` — recall of one fact or command. `medium` — two constraints to weigh or
a plausible distractor. `hard` — several constraints, close distractors, or
a detail most candidates miss.
