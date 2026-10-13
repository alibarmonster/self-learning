# -*- coding: utf-8 -*-
"""Merges the two ExamTopics dumps into one 150-question community bank.

Run from this directory, with parsed.json and parsed2.json (the outputs of
import-examtopics-parse.py and import-examtopics-parse2.py) beside it. Writes
community.js, which is copied to src/lib/exams/cdl/questions/community.js.

The first 92 keep their topics, difficulties, explanations and published vote
rows exactly as gen.py produced them; the 58 in the second dump carry no
"Correct Answer" line and no vote percentages — only Most Voted markers — so
their difficulty is hand-assigned and they get no vote bar.
"""
import json, collections

# Reuse the first dump's tables verbatim: everything in gen.py above `def js`
# is pure data (loads parsed.json, defines TOPICS and EXPL, asserts lengths).
_src = open('import-examtopics.py', encoding='utf-8').read()
_ns = {}
exec(compile(_src.split('def js(s):')[0], 'import-examtopics.py', 'exec'), _ns)
qs1, TOPICS1, EXPL1 = _ns['qs'], _ns['TOPICS'], _ns['EXPL']
assert len(qs1) == 92

qs2 = json.load(open('parsed2.json', encoding='utf-8'))
assert len(qs2) == 58

T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'

# questions 93-150, in file order
TOPICS2=[T_OPS,T_FUND,T_FUND,T_OPS,T_STOR,T_DATA,T_COMP,T_OPS,T_DATA,T_COMP,
 T_DATA,T_DATA,T_STOR,T_SEC,T_FUND,T_SEC,T_AI,T_OPS,T_SEC,T_MIG,
 T_AI,T_MIG,T_MIG,T_AI,T_MIG,T_FUND,T_MIG,T_COMP,T_AI,T_DATA,
 T_OPS,T_AI,T_FUND,T_OPS,T_OPS,T_OPS,T_SEC,T_COMP,T_MIG,T_FUND,
 T_SEC,T_COST,T_OPS,T_MIG,T_COST,T_SEC,T_FUND,T_OPS,T_STOR,T_COST,
 T_COST,T_SEC,T_OPS,T_SEC,T_FUND,T_AI,T_OPS,T_SEC]

DIFF2=['medium','easy','medium','easy','medium','medium','easy','easy','easy','medium',
 'easy','easy','medium','easy','hard','medium','medium','easy','medium','easy',
 'medium','medium','medium','easy','medium','medium','easy','easy','easy','easy',
 'medium','medium','medium','medium','easy','medium','medium','hard','hard','medium',
 'medium','medium','easy','hard','medium','hard','easy','easy','easy','medium',
 'easy','easy','hard','medium','easy','easy','easy','medium']

EXPL2=[
# 93
"SRE treats failure as normal and expected: you learn from it rather than punish it. Postmortems are deliberately blameless, ignoring a known bug is not learning, and no process eliminates all future bugs.",
# 94
"On-premises scaling means buying, racking and provisioning more hardware — a long lead time and a large up-front cost, which is precisely what cloud elasticity removes. Compliance and multi-cloud complexity are separate problems, and an on-premises estate has no serverless functions to blame.",
# 95
"Keeping most systems on-premises while moving some data into a Google Cloud service is the definition of hybrid cloud. Multi-cloud means several public providers; private cloud and on-premises would keep the data out of BigQuery entirely.",
# 96
"Logging is the recording of events from applications and the operating system as text entries. Watching resource limits is monitoring, version control tracks source code, and expenditure is billing.",
# 97
"Cloud SQL is a managed relational database that connects to the business intelligence and analytics tools that produce insight — it stores and serves the data rather than analysing it itself. Predictions come from ML products, and charts come from Looker or Data Studio.",
# 98
"A cloud data warehouse such as BigQuery ingests and analyses structured and unstructured data at scale in real time, which is what a flood of text and speech transcripts needs. Visualisation is a separate tool's job, and no warehouse turns structured data into unstructured data.",
# 99
"Writing only the code and leaving the infrastructure to the provider is serverless computing. Virtual machines and Bare Metal leave the organisation managing servers, and Container Registry only stores images.",
# 100
"DevOps tooling and automation take the repetitive manual work out of the delivery pipeline so that people are not the bottleneck. Supervision of creative work, supply chains and faulty equipment are not what automation addresses here.",
# 101
"A data lake holds structured, semi-structured and unstructured data together in its raw, native format. A data warehouse and a database both require the data to be modelled first, and a data field is not a storage solution.",
# 102
"App Engine can serve several versions of an application at once and split traffic between them, so one group of users validates the new features while everyone else stays on the current version. A single user does not get different versions, and containerisation is not required in the standard environment.",
# 103
"Looker is Google Cloud's business intelligence platform: modelling, dashboards and embedded analytics. The serverless warehouse underneath it is BigQuery, and identity and rollback are unrelated.",
# 104
"Efficient and automatic means the patient does nothing: wearable IoT devices stream readings in real time. Every other option adds a manual step — uploading daily, self-assessing, or visiting a nurse.",
# 105
"Spanner's distinguishing feature is synchronous replication across regions with strong consistency, so a global organisation reads and writes the same data everywhere. Cold storage, unstructured ingestion and real-time visualisation describe other products.",
# 106
"Asking for banking credentials by impersonating a trusted sender is phishing. Ransomware encrypts data for payment, a DDoS floods a service with traffic, and spam is unsolicited bulk mail without the impersonation.",
# 107
"A transformational approach is a leadership change: visible executive sponsorship from the top and a blameless culture so teams can take risks. Moving back to capital expenditure or on-premises infrastructure is the opposite direction, and transformation is an organisational effort rather than an individual one.",
# 108
"Google Cloud encrypts customer data at rest by default, with no action or tag required from the customer. Security Command Center reports on posture and Cloud DLP classifies and masks sensitive data; neither is what performs the encryption.",
# 109
"Forecasting from several marketing datasets means joining them first — the signal lies in the combination — and then training a model on the combined set. Keeping them separate loses the cross-dataset relationships, and archiving is a storage decision, not an insight.",
# 110
"Cloud Monitoring collects metrics and metadata from applications and infrastructure and renders them as dashboards, charts and alerts. Cloud Logging stores log entries, Cloud Trace measures latency, and Cloud Debugger inspects running code.",
# 111
"Under the shared responsibility model, who may see which data is always the customer's decision — their own IT team sets the access policies. Cloud Identity and IAM are the tools that enforce those policies, and Customer Care never defines them.",
# 112
"Months to update and deploy is the classic driver for application modernisation: cloud-native delivery cuts release cycles to days or hours. Autoscaling on-premises would be an advantage, a move to capital expenditure is the wrong direction, and source code does not change by itself.",
# 113
"Categorising a large set of photographs with a model that already exists is the Vision API — pre-trained, no training data required. AutoML Vision is for training your own model on custom labels, and BigQuery ML and Looker work on tabular data.",
# 114
"APIs are how two organisations' systems exchange live data, so points earned at a partner store appear on the customer's balance immediately. Analytics, recommendations and disaster recovery are other products' jobs.",
# 115
"Sharing content with partner systems in a controlled, repeatable way is exactly what an API is for. A NoSQL database stores the content, App Engine hosts the code, and Anthos Config Management governs clusters.",
# 116
"Pre-trained APIs are usable by ordinary developers because the model is already built — no data science specialist and no training run required. They still need input data, they carry the usual permissions, and requiring custom training is precisely what they avoid.",
# 117
"Bare Metal Solution provides dedicated, non-virtualised hardware next to Google Cloud for specialised workloads — typically Oracle — whose licensing and architecture cannot be changed. Compute Engine virtualises, and the serverless products require the application to be rewritten.",
# 118
"A cloud-based payment system leaves a transaction record for every sale, so the takings can be reconciled against what the machine sold — the missing-cash problem disappears. Relaxing access permissions is a risk, not a benefit, and error budgets and perimeter security are unrelated.",
# 119
"Two parties needing each other's data in real time — menus out, orders in — is the textbook API integration. SRE is a discipline, an ML model predicts rather than exchanges, and a multi-regional database does not connect two organisations' systems.",
# 120
"GKE orchestrates containers so that teams can deploy, test and roll back many applications quickly and consistently. It manages containers rather than tuning virtual machines, does not connect legacy systems, and ships no source code.",
# 121
"Google Cloud's AI story is a ladder: pre-trained APIs for non-specialists, AutoML for people with data but no ML background, and Vertex AI and TensorFlow for practitioners. TPUs are cloud hardware, quantum computing is not the answer here, and custom training is not always required.",
# 122
"Free-text survey comments have no fixed schema, which makes them unstructured. Coordinates, sales trends and inventory records all fit neatly into rows and columns.",
# 123
"A missed availability SLA means real downtime for real users, and the business risk of that is customers leaving. The error budget is an internal SRE construct, not something the provider consumes, and a missed SLA implies neither data loss nor a renegotiation.",
# 124
"Training a model on your own labelled photographs, without writing the model, is AutoML Vision. The Vision API cannot learn new categories, the Video Intelligence API works on video, and BigQuery ML and Looker are tabular.",
# 125
"Public cloud decouples access from place: the data and the compute are reachable from anywhere over Google's network. Hardware maintenance is no longer the customer's concern at all, no provider promises 100% availability, and migrations still need security.",
# 126
"Five nines is 99.999% of a year, which leaves about 5.26 minutes of downtime — roughly five minutes. Three nines would be about 500 minutes, and two nines about 5,000.",
# 127
"SRE rolls changes out progressively — a canary group first — so that a fault is caught while its blast radius is small. Releasing to everyone at once maximises the damage, and refusing to ship at all is not an SRE principle.",
# 128
"Cloud Debugger inspects the state of running application code in production without stopping it or slowing it down for users. It does not deploy code updates, and it works on live traffic rather than during downtime.",
# 129
"Compliance regimes such as GDPR turn on how personally identifiable information is protected, and Google Cloud encrypts it automatically. A business licence is not a cloud control, disabling two-factor authentication weakens compliance, and following only the head office's rules ignores every other jurisdiction.",
# 130
"Full control of the virtual machines points at Compute Engine, where managed instance groups provide autoscaling and automatic rolling updates on top of that control. Cloud Run and App Engine take the machines away, and Cloud Build is a CI/CD service.",
# 131
"Nothing exists yet — new infrastructure, new applications — so this is inventing in greenfield. Compare question 136, where a new cloud application replaces an existing on-premises one: Google's course calls that brownfield, and the two questions are written to test exactly that difference. The first two options describe lift-and-shift and refactor-then-move.",
# 132
"Transformational upskilling is cultural and continuous: peers teaching each other against official curricula, rather than each person studying alone. Choosing between training and hiring is a staffing decision, and handing privileged access to contractors is a security problem, not a learning strategy.",
# 133
"Predefined IAM roles are written around job functions, so mapping each department to the roles it needs is both quick and precise. Primitive roles are far too broad, per-employee grants do not scale, and one shared service account destroys accountability.",
# 134
"Cost control in the cloud starts with visibility and ownership: when each department sees its own spend, the spend changes. Hardware procurement is no longer the cost driver, a move to capital expenditure is backwards, and one tag for everything gives no breakdown at all.",
# 135
"Monitoring is the collection of predefined and custom metrics from applications and infrastructure, which is what then feeds dashboards and alerts. Watching budgets is billing, and tracking users is auditing.",
# 136
"Google's course defines inventing in brownfield as building a new cloud application that replaces an existing legacy one — this scenario almost word for word — and keeps greenfield for building where nothing exists yet, which is question 131. Be careful here: general software-engineering usage runs the other way, calling a wholesale replacement greenfield and reserving brownfield for new work that must live alongside systems still running. Answer the exam's definition, not the industry one.",
# 137
"Total cost of ownership counts everything the estate costs — hardware, licences, power, people — so that the saving from moving can be weighed against the cost of moving: return on investment. Error budgets, availability and sizing are separate calculations.",
# 138
"Of the options offered, independent auditing of Google's privacy practices against industry standards is the one that speaks to how data is protected at rest. The real mechanism is that data at rest is encrypted by default — see question 108 — which is not among these four, so the community settles on the audit answer.",
# 139
"Cloud technology hands developers managed services, elastic capacity and modern tooling, so they can experiment instead of waiting on hardware. No provider offers 100% availability, and optimising the on-premises estate is what they are trying to escape.",
# 140
"Availability is expressed as the percentage of time a service is up over a period — the nines in an SLA. Region count, response time and incident count measure other things.",
# 141
"Cloud SQL is the managed relational database for standard MySQL, PostgreSQL and SQL Server workloads, and is far cheaper than Spanner for a single-region application. BigQuery is an analytics warehouse, Cloud Storage holds objects, and Dataflow processes pipelines.",
# 142
"Cloud replaces up-front hardware purchases with metered consumption, so the spend shifts from capital expenditure to operational expenditure. Responsibilities change under the shared responsibility model, hardware maintenance goes away, and nothing forces the data to become structured.",
# 143
"The same shift seen from the TCO side: what was capital expenditure on owned equipment becomes operational expenditure on consumed services. The remaining options invert that direction or mix in cost management, which is a practice rather than an expenditure model.",
# 144
"Google's published privacy commitment is that customer data is not used for advertising. Customers can manage their own encryption keys, Google does not test customer applications' availability, and there is no offline migration on threat.",
# 145
"The SLO is being missed but the error budget still has room, which is the signal to stop shipping features and spend the remaining budget on making the service stable again. Innovation and speed are what the budget funds when it is healthy, and hardware reliability is not a cloud-native lever.",
# 146
"Moving off-premises means the perimeter is no longer the control, so what matters is the security built into the platform and how the data is protected there. Encryption keys supplement perimeter security rather than replacing it, the cost model moves toward operational expenditure, and hardware capacity ceases to be the customer's concern.",
# 147
"Failing repeatedly at peak usage and only at peak is a capacity problem: the on-premises server fleet is sized for the average, not the spike. There are no serverless functions on-premises, and unclean data or configuration would not correlate with load.",
# 148
"Artificial intelligence is the umbrella term for systems performing tasks that would normally require human cognition. Machine learning is the subset that learns those tasks from data; ingesting or structuring data is not intelligence.",
# 149
"Cloud Logging collects, stores and lets you search and analyse log entries, which is how troubleshooting gets faster. Live code inspection is Cloud Debugger, infrastructure as code is Deployment Manager or Terraform, and VM images live in Compute Engine.",
# 150
"Privacy is about control over data: who may access it and with whom it is shared. Authentication proves identity, breach susceptibility is a security risk, and regulatory compliance is the obligation that follows from privacy rather than its definition.",
]
assert len(TOPICS2)==58 and len(DIFF2)==58 and len(EXPL2)==58, (len(TOPICS2),len(DIFF2),len(EXPL2))

def js(s):
    return "'" + s.replace('\\','\\\\').replace("'","\\'") + "'"

def difficulty1(q):
    if q['votes']:
        top=max(p for _,p in q['votes'])
        return 'easy' if top>=90 else 'medium' if top>=70 else 'hard'
    if q['correct_answer'] and ''.join(q['most_voted'])!=q['correct_answer']: return 'hard'
    return 'medium'

rows = [(q, TOPICS1[i], EXPL1[i], difficulty1(q)) for i, q in enumerate(qs1)]
rows += [(q, TOPICS2[i], EXPL2[i], DIFF2[i]) for i, q in enumerate(qs2)]
assert len(rows) == 150

out=["""/**
 * Community exam bank — 150 Cloud Digital Leader questions as they circulate on
 * ExamTopics, kept verbatim so the wording matches what people actually meet.
 *
 * The answer on every question is the community's MOST VOTED choice, not the
 * "Correct Answer" the dumps print: on 15 of these two disagree, and the stored
 * answer is the wrong one. `votes` carries the published vote distribution where
 * the dump included one — the later questions were published without vote
 * percentages, so they reveal without a bar. `verbatim` tells the validator not
 * to complain that the options are uneven: they are quoted, not written here.
 */

export const community = ["""]

for n,(q,topic,expl,diff) in enumerate(rows, start=1):
    idx={l:i for i,l in enumerate(q['letters'])}
    ans=[idx[l] for l in q['most_voted']]
    answer=str(ans[0]) if len(ans)==1 else '[' + ', '.join(map(str,sorted(ans))) + ']'
    prompt=q['prompt']
    if len(ans)>1 and 'choose' not in prompt.lower():
        prompt += ' (Choose two.)'
    body=[f"  {{",
          f"    id: 'et-{n:03d}',",
          f"    topic: {js(topic)},",
          f"    difficulty: '{diff}',",
          f"    verbatim: true,",
          f"    prompt: {js(prompt)},",
          "    options: [",
          *[f"      {js(o)}," for o in q['options']],
          "    ],",
          f"    answer: {answer},",
          f"    explanation: {js(expl)}"]
    if q['votes']:
        vrows=[]
        for letters,pct in q['votes']:
            picks=[idx[l] for l in letters if l in idx]
            if picks: vrows.append('{ pick: [' + ', '.join(map(str,sorted(picks))) + '], pct: ' + str(pct) + ' }')
        if vrows:
            body[-1]+=','
            body.append('    votes: [' + ', '.join(vrows) + ']')
    body.append('  },')
    out.append('\n'.join(body))
out.append('];\n')
open('community.js','w',encoding='utf-8').write('\n'.join(out))
print('wrote community.js', len(rows), 'questions')
print('topics:', dict(collections.Counter(t for _,t,_,_ in rows)))
print('difficulty:', dict(collections.Counter(d for _,_,_,d in rows)))
print('with vote bars:', sum(1 for q,_,_,_ in rows if q['votes']))
print('multi-select:', sum(1 for q,_,_,_ in rows if len(q['most_voted'])>1))
