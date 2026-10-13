# -*- coding: utf-8 -*-
"""Merges the four ExamTopics dumps into one 250-question community bank.

Dumps 1-3 (#1-200) keep their topics, difficulties, explanations and published
vote rows exactly as the earlier scripts produced them; dump 4 (#201-250) is
the same shape as dumps 2 and 3 — Most Voted markers only, no printed "Correct
Answer" and no vote percentages — so those difficulties are hand-assigned and
they get no vote bar.
"""
import json, collections

# Everything in the previous merge script above `def js` is pure data, and it
# chains back through the earlier ones, so one exec gives all three earlier
# dumps. Run from this directory with parsed.json … parsed4.json beside it;
# writes community.js.
_src = open('import-examtopics-merge2.py', encoding='utf-8').read()
_ns = {}
exec(compile(_src.split('\ndef js(s):')[0], 'import-examtopics-merge2.py', 'exec'), _ns)
qs1, TOPICS1, EXPL1 = _ns['qs1'], _ns['TOPICS1'], _ns['EXPL1']
qs2, TOPICS2, DIFF2, EXPL2 = _ns['qs2'], _ns['TOPICS2'], _ns['DIFF2'], _ns['EXPL2']
qs3, TOPICS3, DIFF3, EXPL3 = _ns['qs3'], _ns['TOPICS3'], _ns['DIFF3'], _ns['EXPL3']
assert len(qs1) == 92 and len(qs2) == 58 and len(qs3) == 50

qs4 = json.load(open('parsed4.json', encoding='utf-8'))
assert len(qs4) == 50

# #231 carries a Most Voted marker on two options of a single-answer question —
# a scraping artefact, not a "choose two". D is the benefit; C ("cannot be lost
# or deleted") is false of any storage product, so the key is D alone.
assert qs4[30]['most_voted'] == ['C', 'D'], qs4[30]['most_voted']
qs4[30]['most_voted'] = ['D']
assert all(len(q['most_voted']) == 1 for q in qs4)

T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'

# questions 201-250, in file order
TOPICS4=[T_DATA,T_FUND,T_SEC,T_STOR,T_FUND,T_SEC,T_AI,T_OPS,T_STOR,T_DATA,
 T_SEC,T_FUND,T_FUND,T_AI,T_AI,T_FUND,T_SEC,T_AI,T_OPS,T_COST,
 T_COMP,T_HIER,T_MIG,T_COST,T_FUND,T_DATA,T_SEC,T_SEC,T_MIG,T_OPS,
 T_DATA,T_MIG,T_AI,T_AI,T_HIER,T_AI,T_OPS,T_DATA,T_COMP,T_OPS,
 T_MIG,T_AI,T_AI,T_SEC,T_SEC,T_COST,T_OPS,T_AI,T_AI,T_DATA]

DIFF4=['easy','easy','easy','easy','easy','medium','medium','easy','easy','easy',
 'easy','medium','hard','easy','easy','medium','easy','medium','medium','medium',
 'easy','easy','medium','easy','easy','easy','easy','easy','medium','easy',
 'hard','medium','easy','easy','medium','medium','easy','medium','medium','medium',
 'easy','medium','easy','medium','medium','easy','medium','medium','easy','easy']

EXPL4=[
# 201
"The point of a serverless pipeline service such as Dataflow is that the infrastructure is someone else's problem: it is managed and it scales with the job. Full control over the compute is what you give up in exchange, and no pipeline makes analysis unnecessary or guarantees error-free data.",
# 202
"The shift is a chance to rethink how the business works, not merely to run the same processes on rented hardware. It is open to organisations of any size, reaches well beyond the IT department, and treating it as business as usual with a discount is the tactical trap.",
# 203
"Physical access buys an intruder very little because the data is stored encrypted, and the keys are not on the disk. Deleting data on intrusion would be its own disaster, quantum computers are not what stores it, and obscurity through random placement is not a security control.",
# 204
"Firestore is the NoSQL document database built for web and mobile, with offline sync and client SDKs. Spanner is relational, Cloud Storage holds objects, and BigQuery is an analytics warehouse.",
# 205
"Running across three providers at once is multi-cloud by definition. Hybrid means private infrastructure plus public cloud, and on-premises and private cloud describe the estate they have moved beyond. GKE Enterprise — the platform formerly called Anthos — is what makes the Kubernetes deployments consistent across all three.",
# 206
"One of Google's stated trust principles is that the customer owns their data: they can export or move it whenever they like, with no permission to request. There is no console switch to enable and no support ticket to raise.",
# 207
"The skills in the building are SQL, not data science, so BigQuery ML — models created and trained with SQL statements inside the warehouse — is the fit. Custom training in Vertex AI needs ML engineers, AutoML needs a labelled training set prepared for it, and pre-trained APIs cannot predict something specific to this business.",
# 208
"A large provider runs data centres far more efficiently than any single organisation can, and Google matches its consumption with renewable energy, so moving the workload is the sustainable way to scale fast. Refactoring for efficiency, greener power or newer servers all still leave the organisation scaling its own building.",
# 209
"Non-relational databases are defined by a flexible data model: documents or rows need not share a schema. A strictly enforced schema and joins across tables are relational properties, and cross-source reporting is a BI concern.",
# 210
"Call-centre transcripts are free-form language with no schema, which makes them unstructured. Inventory, ratings and orders are all rows and columns.",
# 211
"The physical data centre never moves to the customer: securing the building, the hardware and the network beneath it stays entirely with the provider. What the customer keeps is everything above — data, identities, configuration and access.",
# 212
"Renting the machines themselves and running your own customised servers on them is infrastructure as a service. Platform and software as a service hand over more of the stack, and hybrid cloud describes where things run rather than what is being rented.",
# 213
"The options here are environments rather than products, and the community reads \"a wide range of sources\" as data that already lives with more than one provider, which makes multi-cloud the answer. It is a weak question — the analysis itself would be done in a warehouse such as BigQuery — so learn the vote rather than the reasoning.",
# 214
"Contact Center AI is the purpose-built solution for customer care: virtual agents, agent assist and insights in one place. Text-to-Speech is one piece of it, Document AI reads documents, and Cloud Talent Solution serves recruiting.",
# 215
"TensorFlow is the open-source library with the broad tool ecosystem for building and training your own models. Apache Beam and Dataflow define and run data pipelines, and Cloud Functions runs event-driven code.",
# 216
"Lock-in is avoided by building on open standards and open-source technology — Kubernetes, TensorFlow, open APIs — so the workload can move. An SLA governs service quality rather than portability, and database services and scalable infrastructure exist on every provider without making anything portable.",
# 217
"Security Command Center is the vulnerability and threat-finding service across the whole estate, with recommendations for what to fix. Cloud Armor blocks traffic, VPC networks carry it, and Cloud Storage holds objects.",
# 218
"A model needs one consistent schema, so the 300 theatres' formats have to be reconciled before training — this is the data preparation step, and it is where most of the work in a real project goes. Throwing away two years of history, training 300 models or hoping a model type copes with mixed formats all avoid the real fix.",
# 219
"The service-level indicator is the measurement itself — the actual number, such as the percentage of successful requests. The objective is the target you set for that indicator, and the agreement is the contract written around it.",
# 220
"Cloud spending is typically decentralised, because any team can provision resources, and variable, because the bill follows usage. That combination is exactly why financial governance and visibility matter so much in the cloud.",
# 221
"Paying nothing while idle and scaling up if the launch goes well is the scalability benefit of serverless — capacity follows demand, including down to zero. Disaster recovery, development cost and built-in security are real benefits but none of them is what removes the idle-resource bill.",
# 222
"Policy set on a folder is inherited by every project inside it, which is how one rule covers a department without being applied project by project. Policies are not restricted to the organisation node or to individual projects, and projects certainly are affected by them.",
# 223
"A managed service takes over the routine operational work — patching, upgrades, backups of the platform itself — which is the reason to choose one. User access, archiving policy and cost optimisation remain the customer's decisions.",
# 224
"Migration replaces up-front hardware purchases with metered consumption, so spending moves from capital expenditure to operational expenditure. Cost management does not stay the same: it becomes a continuous, usage-driven discipline rather than an annual purchase.",
# 225
"Using a finished application with no servers to run and no code to write is software as a service. Infrastructure and platform models both leave code or machines with the customer, and functions as a service still means writing the function.",
# 226
"Dataflow is the managed, autoscaling service for transforming data on its way into a warehouse, with no clusters to run. Pub/Sub carries the messages, Cloud Storage holds files, and Bigtable is a database rather than a pipeline.",
# 227
"Google Cloud encrypts customer data both at rest and in transit by default, with no configuration required. Neither one alone is the answer, and it is certainly not off by default.",
# 228
"Verifying who someone is, is authentication. Authorisation is what they may then do, auditing records what they did, and encryption protects the data rather than identifying the user.",
# 229
"GKE Enterprise — the platform previously called Anthos — is the consistent, centralised management plane for Kubernetes across several clouds. Cloud Run and Cloud Functions run workloads in one place, and Compute Engine is virtual machines.",
# 230
"Cloud Logging is where application and platform logs are collected, stored and searched. Cloud Monitoring handles metrics, Cloud Trace latency, and Cloud Profiler resource consumption.",
# 231
"Bringing data together removes the silos, which is what lets teams combine datasets and find something new — the benefit a unified solution actually delivers. The dump marks a second option as most voted as well, but \"backed up and cannot be lost or deleted\" is not true of any storage product, so the key here is the innovation answer alone.",
# 232
"Exposing the data through a paid API lets third parties build on it without ever touching the database, which is the cloud-first way to turn data into a revenue stream. Adding outsiders to the database is a security failure, archived downloads are neither live nor programmable, and moving to NoSQL changes nothing about who can use it.",
# 233
"Recommendations are learned from patterns in past behaviour, which is exactly what machine learning does well. Classification with no prior examples has nothing to learn from, and judgement calls and ethical dilemmas need human experience.",
# 234
"Tensor Processing Units are Google's domain-specific hardware, built to accelerate the matrix arithmetic behind model training. Spot VMs change the price rather than the speed, Bare Metal Solution is for specialised licensed workloads, and containers are a packaging format.",
# 235
"Value, cost control and compliance across many databases are all governance questions, and the answer is a governance programme: who owns what data, how it is classified, who may use it and for how long. Deleting by age, exporting to NoSQL or writing monthly reports are single tactics that leave the framework missing.",
# 236
"A team of data scientists coding a model in Vertex AI Workbench is the custom training path — their own code, their own architecture, trained on Vertex AI. AutoML and prebuilt APIs exist precisely to avoid writing that code, and Compute Engine is just the machines.",
# 237
"Latency is the golden signal for how long a request takes to return. Traffic is demand, errors are failed requests, and saturation is how full the system is.",
# 238
"Turning raw data into a usable format is the processing step of the data value chain, which sits between collecting and storing it and the analysis that follows.",
# 239
"A single container, no servers to manage and automatic scaling is Cloud Run. Kubernetes Engine is more machinery than one container needs, App Engine takes code rather than any container in the fully managed path, and Compute Engine means running virtual machines.",
# 240
"Cloud Monitoring gives the single, fully managed view of the estate, including uptime checks, dashboards and alerts. Cloud Logging stores logs, Cloud Trace measures latency, and Cloud Profiler looks at resource consumption.",
# 241
"Moving the workload as it stands, without touching code or architecture, is a lift and shift — rehosting. Replatforming makes small changes on the way, refactoring rewrites parts of it, and reimagining starts from the business problem again.",
# 242
"Voice recordings have no schema, so deriving sentiment from them is machine learning unlocking value from unstructured data. Tabular defect records and transaction monitoring work on structured data, and purchase-history recommendations are structured too.",
# 243
"Vertex AI is the managed platform that covers the whole custom-model lifecycle: gathering data, building and training, then deploying and monitoring. Document AI and the Natural Language API are pre-trained services, and Kubernetes Engine only runs the containers.",
# 244
"In the confidentiality, integrity and availability triad, availability is the part that says data must be reliably reachable when it is needed — an outage is a security failure, not just an operational one. Restricting access is confidentiality, accuracy is integrity, and meeting standards is compliance.",
# 245
"Data sovereignty means data is governed by the laws of the country it physically sits in, which is why region choice matters so much. A government's right of access and an individual's right over their personal data are related but distinct ideas, and encryption is a control rather than a legal concept.",
# 246
"A budget with a threshold rule sends the alert as spending crosses the line, instead of the bill being the first news. Pausing machines and adjusting quotas control spend but do not notify anyone, and forecasting from history is not an alert.",
# 247
"Premium Support is the tier that comes with a Technical Account Manager and the fastest response targets, which is what critical production workloads need. Enhanced is quick but has no named account manager, and Standard and Basic are slower still.",
# 248
"Detecting passports and credit cards in images is a solved problem with a pre-trained API — Cloud DLP or the Vision API — so a developer can integrate it in days. AutoML and custom training both mean assembling a labelled dataset first, and BigQuery ML works on tabular data rather than photographs.",
# 249
"Generative AI is the branch of AI that produces new content — text, images, code, audio — rather than only classifying or predicting. Translation and image labelling are specific non-generative tasks, and the umbrella term for everything is AI itself.",
# 250
"Streaming analytics processes records continuously as they arrive, rather than waiting for a batch window. Batch processing and one-off backfills are the alternative, and high latency is what streaming is designed to avoid.",
]
assert len(TOPICS4)==50 and len(DIFF4)==50 and len(EXPL4)==50, (len(TOPICS4),len(DIFF4),len(EXPL4))

def js(s):
    return "'" + s.replace('\\','\\\\').replace("'","\\'") + "'"

def difficulty1(q):
    if q['votes']:
        top=max(p for _,p in q['votes'])
        return 'easy' if top>=90 else 'medium' if top>=70 else 'hard'
    if q['correct_answer'] and ''.join(q['most_voted'])!=q['correct_answer']: return 'hard'
    return 'medium'

rows  = [(q, TOPICS1[i], EXPL1[i], difficulty1(q)) for i, q in enumerate(qs1)]
rows += [(q, TOPICS2[i], EXPL2[i], DIFF2[i]) for i, q in enumerate(qs2)]
rows += [(q, TOPICS3[i], EXPL3[i], DIFF3[i]) for i, q in enumerate(qs3)]
rows += [(q, TOPICS4[i], EXPL4[i], DIFF4[i]) for i, q in enumerate(qs4)]
assert len(rows) == 250

out=["""/**
 * Community exam bank — 250 Cloud Digital Leader questions as they circulate on
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
