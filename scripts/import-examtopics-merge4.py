# -*- coding: utf-8 -*-
"""Merges the five ExamTopics dumps into one 279-question community bank.

Dumps 1-4 (#1-250) keep their topics, difficulties, explanations and published
vote rows exactly as the earlier scripts produced them; dump 5 is the same
shape as dumps 2-4 — Most Voted markers only, no printed "Correct Answer" and
no vote percentages — so those difficulties are hand-assigned and they get no
vote bar. That dump also skips from question 259 to 270 in its own numbering;
the ten it leaves out simply are not in it, and our ids stay sequential.
"""
import json, collections

# Everything in the previous merge script above `def js` is pure data, and it
# chains back through the earlier ones, so one exec gives all four earlier
# dumps. Run from this directory with parsed.json … parsed5.json beside it;
# writes community.js.
_src = open('import-examtopics-merge3.py', encoding='utf-8').read()
_ns = {}
exec(compile(_src.split('\ndef js(s):')[0], 'import-examtopics-merge3.py', 'exec'), _ns)
qs1, TOPICS1, EXPL1 = _ns['qs1'], _ns['TOPICS1'], _ns['EXPL1']
qs2, TOPICS2, DIFF2, EXPL2 = _ns['qs2'], _ns['TOPICS2'], _ns['DIFF2'], _ns['EXPL2']
qs3, TOPICS3, DIFF3, EXPL3 = _ns['qs3'], _ns['TOPICS3'], _ns['DIFF3'], _ns['EXPL3']
qs4, TOPICS4, DIFF4, EXPL4 = _ns['qs4'], _ns['TOPICS4'], _ns['DIFF4'], _ns['EXPL4']
assert len(qs1) == 92 and len(qs2) == 58 and len(qs3) == 50 and len(qs4) == 50

qs5 = json.load(open('parsed5.json', encoding='utf-8'))
assert len(qs5) == 29

# Two scan defects in this dump. A stray character on the end of one stem, and
# a lost apostrophe. Everything else is left exactly as published.
for q in qs5:
    if q['prompt'].endswith(' z'):
        q['prompt'] = q['prompt'][:-2]
    q['prompt'] = q['prompt'].replace('an organization s desired', "an organization's desired")

# The TPU question was scanned with "CPUs" twice; dropping the duplicate leaves
# the three real choices (TPUs, CPUs, GPUs) and the same key.
tpu = next(q for q in qs5 if q['options'].count('CPUs') > 1)
keep = [i for i, o in enumerate(tpu['options']) if not (o == 'CPUs' and tpu['options'].index(o) != i)]
tpu['letters'] = [tpu['letters'][i] for i in keep]
tpu['options'] = [tpu['options'][i] for i in keep]
assert tpu['most_voted'] == ['A'] and len(tpu['options']) == 3
assert all(len(set(q['options'])) == len(q['options']) for q in qs5)

T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'

# The dump's own numbering: 251-259, then 270-289.
TOPICS5=[T_HIER,T_STOR,T_NET,T_STOR,T_DATA,T_DATA,T_FUND,T_OPS,T_COMP,
 T_SEC,T_OPS,T_DATA,T_SEC,T_FUND,T_FUND,T_COST,T_SEC,T_MIG,T_AI,
 T_AI,T_MIG,T_AI,T_COST,T_MIG,T_FUND,T_COMP,T_FUND,T_DATA,T_SEC]

DIFF5=['easy','easy','easy','easy','medium','easy','medium','easy','easy',
 'easy','easy','medium','medium','easy','medium','medium','easy','easy','easy',
 'medium','easy','medium','easy','medium','easy','medium','easy','easy','medium']

EXPL5=[
# 251
"Policy set on a folder flows down the whole subtree: the projects inside it and the resources inside those projects. That inheritance is the reason the hierarchy exists — it is not stopped at the project boundary, and it does not leap sideways to other folders.",
# 252
"One region and a tight budget point at Cloud SQL, the managed relational database for ordinary transactional workloads. Spanner's global consistency costs far more than a single-region shop needs, Bigtable is not relational, and BigQuery is for analytics.",
# 253
"Deciding which traffic may enter and leave the network is what firewall rules do. Two-step verification and privileged access govern who a user is and what they may do, and encryption protects the data rather than the traffic flow.",
# 254
"Video and audio files are unstructured objects, which is exactly what Cloud Storage buckets hold, at archive prices when the data is cold. Spanner and Cloud SQL are relational, and Bigtable is for wide-column records.",
# 255
"The demographic fields the model needed were simply absent, which is a completeness problem. Accuracy is about values being wrong, validity about them breaking the rules of their field, and timeliness about them being stale.",
# 256
"Petabytes, fast, scalable, fully managed, built for analysis — BigQuery. Cloud SQL and Firestore are operational databases, and Cloud Storage holds the files without analysing them.",
# 257
"Google designs its own servers for the jobs they actually run, stripping out what a general-purpose machine carries and tuning what matters, which makes them more efficient per watt and per rack. They are not about legacy disk compatibility, and they run ordinary software.",
# 258
"The service-level objective is the target: the level of reliability the organisation intends to deliver. The indicator is what you measure against it, and support tiers and infrastructure are not SRE terms at all.",
# 259
"Multiple containerised workloads plus full control of how they are configured is Kubernetes Engine — the control surface is the point. Cloud Run and Cloud Functions deliberately hide it, and Compute Engine drops you back to managing machines.",
# 270
"Granting exactly the permissions a job needs and nothing more is least privilege. Zero trust is the broader posture of never trusting the network, cyber resilience is about withstanding attack, and security by default is about safe starting configuration.",
# 271
"Recovering to a previous state after loss or attack needs backups taken regularly — nothing else on the list can restore data that is gone. Monitoring tells you it happened, SLOs set targets, and autoscaling adds capacity.",
# 272
"Waiting for month end is the constraint, so the fix is to process the events as they arrive: stream processing instead of batch. Changing database type or filtering reports makes the same monthly cycle faster, not nearer to real time, and weekly batches are still batches.",
# 273
"Compliance Reports Manager is where Google publishes its own certifications and audit reports — ISO 27001 among them — for customers to download. Security Command Center assesses the customer's own posture, and the others are network and metrics tools.",
# 274
"Data must stay in the organisation's own data centre while the analysis happens in Google Cloud, and that combination is hybrid cloud. Multi-cloud is several public providers, and pure public or private would break one half of the requirement.",
# 275
"Running your own custom application with no infrastructure to manage is platform as a service. Infrastructure as a service leaves the machines with you, software as a service means you are not writing the application at all, and network as a service is not one of the three models.",
# 276
"Sustained use discounts need no action: Compute Engine applies them automatically once an instance runs for a large enough share of the month. Committed use discounts are the ones you sign up for, and Spot instances are a different discount entirely.",
# 277
"Social engineering attacks the person rather than the system, and phishing email is its most common form. SQL injection and denial-of-service attack the software, and physical damage is not social engineering.",
# 278
"Google Cloud VMware Engine runs the VMware stack itself in Google Cloud, so the existing tools, processes and skills carry over untouched. Compute Engine and Bare Metal Solution would mean rebuilding the operational model, and vSphere is the software they already run rather than a migration target.",
# 279
"Tensor Processing Units are Google's purpose-built accelerators for TensorFlow workloads, which is what makes training faster than general-purpose silicon. GPUs help too but are not purpose-built for this, and CPUs are the baseline being improved on. The published options list \"CPUs\" twice — the duplicate is dropped here.",
# 280
"Identifying who is about to leave means learning the pattern from the customers who already did, which is a machine learning model built on their demographics and behaviour. A dashboard, a survey and a feedback report all describe the past without predicting the individuals at risk.",
# 281
"An API is the agreed set of calls one program uses to talk to another, hiding everything behind it. IDE plugins, network interconnects and container orchestration are other things entirely.",
# 282
"The data is already in BigQuery, so building a model there to predict when each charger will need attention turns that data into fewer wasted visits and longer-lived equipment. Securing access, publishing an API and cutting storage costs are all worthwhile but none of them reduces waste in the network.",
# 283
"The Google Cloud Pricing Calculator prices a configured workload before anything is deployed, which is what an estimate means here. Deploying to observe costs money and time, another workload's history is not this workload, and manual arithmetic on list prices is what the calculator exists to replace.",
# 284
"Breaking the application into microservices lets each part scale and deploy on its own, which is the payoff for the work of refactoring. It certainly requires code changes, it is not the fastest path — rehosting is — and no architecture makes an application compliant by itself.",
# 285
"Changing processes, culture and customer experience with new technology is the definition of digital transformation. Moving a data centre, tuning operations and personalising for users are pieces that may be part of it, not the name for it.",
# 286
"GKE Autopilot runs the cluster for you — nodes, scaling and much of the configuration — so the team works on the application instead. GKE Standard leaves that management with them, Cloud Run is not Kubernetes, and Compute Engine is further down still.",
# 287
"Some systems stay on-premises, the rest go to the cloud, and both are managed together: that is hybrid cloud. Multi-cloud means several public providers, and virtual machines and containers describe how workloads are packaged rather than where they live.",
# 288
"Petabytes from many sources, gathered for strategic analysis, is the data warehouse case — BigQuery being the Google Cloud one. An object store keeps the files without analysing them, and the two database types serve operational workloads. Note that an earlier question with this same stem offers only environment types as options and the community answers multi-cloud there; here the right option is present.",
# 289
"Under platform as a service the provider runs the platform and the infrastructure, but who may reach the data is never theirs to decide — data access policies stay with the customer. Operations, physical security and network security all sit on the provider's side of this model.",
]
assert len(TOPICS5)==29 and len(DIFF5)==29 and len(EXPL5)==29, (len(TOPICS5),len(DIFF5),len(EXPL5))

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
rows += [(q, TOPICS5[i], EXPL5[i], DIFF5[i]) for i, q in enumerate(qs5)]
assert len(rows) == 279

out=["""/**
 * Community exam bank — 279 Cloud Digital Leader questions as they circulate on
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
