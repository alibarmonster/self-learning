# -*- coding: utf-8 -*-
"""Merges the three ExamTopics dumps into one 200-question community bank.

Dumps 1 (#1-92) and 2 (#93-150) keep their topics, difficulties, explanations
and published vote rows exactly as gen.py/gen2.py produced them; dump 3
(#151-200) is the same shape as dump 2 — Most Voted markers only, no printed
"Correct Answer" and no vote percentages — so those difficulties are
hand-assigned and they get no vote bar.
"""
import json, re, collections

# Everything in the first merge script above `def js` is pure data, and it in
# turn pulls in import-examtopics.py's tables, so one exec gives both earlier
# dumps. Run from this directory with parsed.json, parsed2.json and parsed3.json
# beside it; writes community.js.
_src = open('import-examtopics-merge.py', encoding='utf-8').read()
_ns = {}
exec(compile(_src.split('\ndef js(s):')[0], 'import-examtopics-merge.py', 'exec'), _ns)
qs1, TOPICS1, EXPL1 = _ns['qs1'], _ns['TOPICS1'], _ns['EXPL1']
qs2, TOPICS2, DIFF2, EXPL2 = _ns['qs2'], _ns['TOPICS2'], _ns['DIFF2'], _ns['EXPL2']
assert len(qs1) == 92 and len(qs2) == 58

qs3 = json.load(open('parsed3.json', encoding='utf-8'))
assert len(qs3) == 50

# The third dump was scanned badly in three places: a capital I read as a
# lowercase L in two product names, and a dropped letter. Everything else is
# left exactly as published.
OCR = [('Recommendations Al', 'Recommendations AI'),
       ('Contact Center Al', 'Contact Center AI'),
       ('machine learn ng', 'machine learning'),
       ('modem platform', 'modern platform')]
for q in qs3:
    for a, b in OCR:
        q['prompt'] = q['prompt'].replace(a, b)
        q['options'] = [o.replace(a, b) for o in q['options']]

T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'

# questions 151-200, in file order
TOPICS3=[T_COMP,T_AI,T_AI,T_AI,T_DATA,T_SEC,T_OPS,T_MIG,T_STOR,T_AI,
 T_FUND,T_COMP,T_FUND,T_AI,T_SEC,T_FUND,T_SEC,T_MIG,T_AI,T_OPS,
 T_STOR,T_AI,T_MIG,T_OPS,T_COMP,T_DATA,T_DATA,T_OPS,T_COMP,T_MIG,
 T_MIG,T_MIG,T_DATA,T_FUND,T_MIG,T_STOR,T_FUND,T_STOR,T_FUND,T_MIG,
 T_COST,T_OPS,T_OPS,T_OPS,T_COMP,T_COST,T_OPS,T_STOR,T_MIG,T_COST]

DIFF3=['easy','medium','easy','easy','easy','medium','medium','medium','easy','medium',
 'medium','medium','medium','medium','medium','easy','medium','hard','medium','easy',
 'medium','medium','easy','hard','medium','medium','medium','medium','easy','medium',
 'easy','medium','easy','medium','medium','easy','easy','medium','medium','easy',
 'medium','easy','medium','easy','hard','medium','easy','easy','medium','medium']

EXPL3=[
# 151
"Small pieces of code that run in response to an event, with nothing to provision, is the Cloud Functions description almost word for word. GKE and Compute Engine leave you managing clusters or machines, and Bare Metal Solution is dedicated hardware.",
# 152
"An API such as Document AI reads the scans, turns them into machine-readable text and pulls out the entities — dates, names, key terms. Replacing the documents with a survey loses the archive, encryption is not the goal, and the transformation runs from unstructured toward structured, not the other way.",
# 153
"Vertex AI is the single platform for building custom models end to end: data, training, tuning, deployment and monitoring. Dataproc runs Spark and Hadoop, Compute Engine is raw virtual machines, and Recommendations AI is a finished application rather than a platform.",
# 154
"Accuracy is a function of the data the model learns from, so more — and more representative — training data is the lever. Storage, bandwidth and faster processors change how quickly you can train, not how well the model predicts.",
# 155
"Blood pressure readings are numbers in named fields with a fixed shape, which is what makes data structured. X-rays, video and free-text physician notes carry no schema and are unstructured.",
# 156
"The transformational posture is zero trust: no implicit trust in the network, with identity and policy checked at every layer. Trusting the private perimeter is the traditional model being left behind, one authentication source is too narrow, and owner/editor/viewer are the primitive roles that fine-grained IAM replaces.",
# 157
"An SLA is a contract, and the remedy for missing it is normally a service credit or refund for the affected period. Fees do not rise, the service is not shut down, and the error budget is an internal SRE measure rather than something the provider grants.",
# 158
"Apigee is the API management platform: design, publish, secure, version and document APIs so they can be discovered and reused across projects. AppSheet builds no-code applications, App Engine hosts code, and application migration is unrelated.",
# 159
"Nearline, Coldline and Archive are storage classes within Cloud Storage, so one product covers the hot subset and the colder tiers, with lifecycle rules moving objects between them. Filestore is network file storage, Spanner is relational, and Data Catalog holds metadata.",
# 160
"Contact Center AI combines virtual agents with agent assist, so routine contacts are handled automatically while conversations stay natural. Text-to-Speech is one component of that, Recommendations AI serves retail, and Cloud Identity is not a contact-centre product.",
# 161
"Legacy infrastructure has to be bought for the busiest hour, so growth means provisioning hardware for peak and paying for it all year. There are no serverless functions or platform services in a legacy estate to blame, and perimeter security is not what caps growth.",
# 162
"App Engine is the fully managed platform for web applications: deploy the code and it scales automatically with no infrastructure to run. Anthos manages clusters, Apigee manages APIs, and AutoML trains models.",
# 163
"Under SaaS the provider runs everything down to the data centre, and what stays exclusively with the customer is their own content and data. System operability, servers and networks all sit on the provider's side.",
# 164
"Training on your own labelled text without writing a model is AutoML Natural Language. Recommendations AI is pre-built for retail, and Anthos and Pub/Sub are not machine learning products.",
# 165
"Malware can sit quietly on a system, stealing or corrupting data without announcing itself. Ransomware is the opposite — it makes itself known by demanding payment — and an SLA violation or bad input is not a cybersecurity threat of this kind.",
# 166
"People now reach services from a phone as readily as a laptop, and meeting that expectation is what drives a mobile app. Customers do not expect mobile-only access, and neither stronger security nor running test versions is exclusive to mobile.",
# 167
"A breach six months after buying a new system shows the gap is expertise and process, not product: people who can develop and maintain the security plan are what close it. Spending more, extending retention or waiting for better technology all leave the same gap.",
# 168
"Adopting cloud is not only building new things: the legacy estate has to move as well, at least in part, or the organisation ends up running two worlds indefinitely. Giving partners privileged access is a risk, and maintaining legacy hardware or raising capital expenditure moves away from cloud.",
# 169
"Classifying submitted images to suggest a diagnosis is a machine learning model doing image recognition. Cloud Logging and Cloud Profiler are operations tools, and App Engine only hosts the application around the model.",
# 170
"Cloud Debugger inspects the state of code while it runs in production, which is how bugs that never reproduce in test get found. Profiler looks at resource consumption, Trace at latency, and Cloud Monitoring at metrics.",
# 171
"A relational database holds transactional records in tables that applications read and write electronically. Raw data in its original format is a data lake, and rapid multi-dimensional analysis is a warehouse.",
# 172
"AI Hub is a repository of ready-made, plug-and-play components — pipelines, notebooks and models — so teams start from something that works instead of a blank page. It neither writes your model code nor sources and prepares your data.",
# 173
"The new value comes from the two systems talking: an API connects the booking system to the partner's catering form so a booking carries the catering order with it. An API does not redesign the system, spot opportunities by itself, or serve as a way to move data into a model.",
# 174
"Performance below the SLO but above the SLA means no contract has been broken yet — it is the early warning that says stop shipping and spend effort on reliability. Users are not yet in prolonged downtime, and it is certainly not a reason to push more updates.",
# 175
"Cloud Run takes a container built with whatever language and tools the team prefers and runs it without any infrastructure to manage. Dataproc runs Spark clusters, Pub/Sub carries messages, and Bare Metal Solution is hardware.",
# 176
"A very large volume of raw activity records kept in its native form for analysis later is what a data lake is for. A warehouse wants the data modelled up front, a database is for transactions, and a data field is not a storage solution.",
# 177
"Looker is the business intelligence platform where individual employees and end users explore governed data and build their own insights. BigQuery is the warehouse underneath it, Spanner is transactional, and Dataflow processes pipelines.",
# 178
"Out-of-the-box observability means the platform watches your infrastructure and applications — metrics, logs and traces — with no instrumentation to build. Project timelines, customer satisfaction and subscription costs are tracked elsewhere.",
# 179
"A serverless environment that glues cloud services together and scales without a capacity estimate is Cloud Functions, which runs from zero to many instances on demand. Compute Engine and GKE need capacity planning, and Bare Metal Solution for SAP is dedicated hardware.",
# 180
"An API puts a stable interface in front of the legacy system, so new needs are met by new consumers of that interface rather than by changing the system underneath — flexibility that lasts. Exposing all underlying data is a security failure, and re-architecting is exactly what the API defers.",
# 181
"Anthos is the one platform that covers all three: build new applications, modernise existing ones, and run them on Google Cloud, on-premises or on another provider. Apigee Hybrid manages APIs, and Cloud Run and Compute Engine run in one place.",
# 182
"Modernising is off the table, so the answer has to leave the legacy system where it is: an API exposes its data to the partner's platform without rewriting anything. Anthos, GKE and Compute Engine all require the migration the organisation cannot afford.",
# 183
"BigQuery is the serverless data warehouse, with built-in machine learning and BI for smart analytics and no clusters to size. Spanner is transactional, Dataflow processes pipelines, and Compute Engine is virtual machines.",
# 184
"The value compounds because the undifferentiated infrastructure work moves to the provider and the organisation's people spend their time on the solutions only they can build. Expanding internal hosting is the opposite move, and relaxing security is never the benefit.",
# 185
"Modernised applications ship on a short cycle, so a fix or a feature reaches users in days instead of at the next quarterly release — which is what \"demand for change\" means here. Tailored content, toil automation and industry metrics describe other benefits.",
# 186
"A multi-regional bucket stores the data redundantly in several regions and serves it from the closest one, which is both the availability and the worldwide-audience requirement. Versioning protects against overwrites, encryption is on regardless, and metadata is not an availability feature.",
# 187
"Hybrid cloud is private infrastructure — usually the organisation's own data centre — combined with public cloud services. A combination of several public providers is multi-cloud, and virtualisation alone is neither.",
# 188
"Cloud Storage keeps geographically separated copies, so a failure in one location does not take the HR data with it — the property that matters when branches everywhere depend on the same files. Encryption is included rather than an upgrade, placement is deliberate rather than random, and there is no minimum volume.",
# 189
"Underutilised at quiet times and overprovisioned at peak is precisely the problem elasticity solves: capacity follows traffic and you pay for what you use when you use it. Predictable total cost, unlimited storage and shared responsibility are real ideas but none of them addresses the traffic peaks.",
# 190
"Anthos is the hybrid and multicloud management platform for building and running applications both on-premises and in the cloud, with one control plane over the lot. Cloud Functions, App Engine and Compute Engine run only in the cloud.",
# 191
"Active Assist's intelligent recommendations spot idle resources and wrong-sized machines and say what to change, so spend follows real usage even when revenue does not. Decentralising decisions without data does not optimise anything, shared ownership blurs accountability, and more capital expenditure is the wrong direction.",
# 192
"Small, frequent changes keep the blast radius small and make the fix — or the rollback — quick when something breaks. Pausing production until every bug is gone never ships, and batching large changes together makes the cause of a failure harder to find.",
# 193
"SRE's efficiency lever is automating toil: the repetitive, manual operational work that scales with traffic and teaches nobody anything. Data should drive more decisions, production ownership is shared rather than handed to developers, and measuring outage impact is how you learn.",
# 194
"Cloud Logging ingests platform and custom logs from GKE, Compute Engine virtual machines and Google Cloud services, then stores and searches them. Dialogflow builds conversational agents, the Cloud SDK is command-line tooling, and Data Catalog indexes metadata.",
# 195
"Containers on GKE deploy, roll back and redeploy in seconds, so a developer chasing an error can try several fixes in the time one traditional release would take. It does not remove the need to containerise, offers no recommendation engine, and is not a place to store code.",
# 196
"What moves to the customer is the consumption model itself: spend becomes variable and someone has to plan and govern it. The underlying network stays the provider's responsibility, downtime is covered by the SLA, and storage optimisation is a task rather than the responsibility being asked about.",
# 197
"Duplicating critical components so that no single one can take the system down is redundancy. Backups protect the data rather than the availability, and latency and security are different design concerns.",
# 198
"Read once a year, so the cheapest class with the longest minimum storage duration wins: Archive, priced for data touched less than once a year. Coldline is for quarterly access, Nearline for monthly, and Standard for frequent.",
# 199
"Database Migration Service performs a managed, largely automatic migration of SQL Server into Cloud SQL, which ends the capacity and patching work without rewriting the application. Refactoring to Firestore is a long project, exporting tables to Cloud Storage gives up the database, and BigQuery is for analytics rather than the transactional workload.",
# 200
"Under OpEx the security capability comes with the service and is paid for as it is used, so there is no up-front capital outlay for appliances. Customers still configure their own controls, custom security hardware is not something you deploy in the provider's data centre, and no provider guarantees security on its own.",
]
assert len(TOPICS3)==50 and len(DIFF3)==50 and len(EXPL3)==50, (len(TOPICS3),len(DIFF3),len(EXPL3))

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
assert len(rows) == 200

out=["""/**
 * Community exam bank — 200 Cloud Digital Leader questions as they circulate on
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
