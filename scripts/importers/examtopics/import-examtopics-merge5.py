# -*- coding: utf-8 -*-
"""Merges all six ExamTopics dumps into one 289-question community bank.

Dump 6 is the ten questions (#260-269) that dump 5 skipped, so they are spliced
into the middle of dump 5's rows rather than appended. With those in place the
bank covers ExamTopics #1-289 with no gaps, and `et-NNN` is that question's
number on the site.

Dumps 1-5 keep their topics, difficulties, explanations and published vote rows
exactly as the earlier scripts produced them. Dump 6 has the same shape as
dumps 2-5 — Most Voted markers only, no printed "Correct Answer" and no vote
percentages — so its difficulties are hand-assigned and it gets no vote bar.
"""
import json, collections

# Everything in the previous merge script above `def js` is pure data, and it
# chains back through the earlier ones, so one exec gives all five earlier
# dumps. Run from this directory with parsed.json … parsed6.json beside it;
# writes community.js.
_src = open('import-examtopics-merge4.py', encoding='utf-8').read()
_ns = {}
exec(compile(_src.split('\ndef js(s):')[0], 'import-examtopics-merge4.py', 'exec'), _ns)
qs1, TOPICS1, EXPL1 = _ns['qs1'], _ns['TOPICS1'], _ns['EXPL1']
qs2, TOPICS2, DIFF2, EXPL2 = _ns['qs2'], _ns['TOPICS2'], _ns['DIFF2'], _ns['EXPL2']
qs3, TOPICS3, DIFF3, EXPL3 = _ns['qs3'], _ns['TOPICS3'], _ns['DIFF3'], _ns['EXPL3']
qs4, TOPICS4, DIFF4, EXPL4 = _ns['qs4'], _ns['TOPICS4'], _ns['DIFF4'], _ns['EXPL4']
qs5, TOPICS5, DIFF5, EXPL5 = _ns['qs5'], _ns['TOPICS5'], _ns['DIFF5'], _ns['EXPL5']
assert [len(qs1), len(qs2), len(qs3), len(qs4), len(qs5)] == [92, 58, 50, 50, 29]

qs6 = json.load(open('parsed6.json', encoding='utf-8'))
assert len(qs6) == 10
assert all(len(q['most_voted']) == 1 and len(q['options']) == 4 for q in qs6)
assert all(len(set(q['options'])) == len(q['options']) for q in qs6)

T_FUND='Cloud fundamentals'; T_COST='Cost management'; T_HIER='Resource hierarchy & governance'
T_COMP='Compute'; T_STOR='Storage & databases'; T_DATA='Data analytics'; T_AI='AI & machine learning'
T_NET='Networking'; T_SEC='Security & identity'; T_MIG='Migration & modernisation'; T_OPS='Operations & support'

# questions 260-269, in file order
TOPICS6=[T_SEC,T_SEC,T_COST,T_NET,T_SEC,T_STOR,T_NET,T_AI,T_AI,T_DATA]
DIFF6=['easy','easy','easy','medium','easy','easy','easy','medium','easy','medium']

EXPL6=[
# 260
"Customer data belongs to the customer — that is one of Google's published trust principles, and it is why you can export or delete it whenever you like. Google processes the data on your instructions; it does not co-own it, and no third party has a claim on it.",
# 261
"Infrastructure as a service is the model where the customer takes the most on, but the building itself is never theirs: the provider secures the data centre and the hardware in it. The guest operating system, the software on top and who may reach the data all stay with the customer.",
# 262
"Restartable, not time critical, cheapest possible — that is the Spot (formerly preemptible) VM case exactly: a deep discount in exchange for interruptions the workload already tolerates. Standard and custom VMs at list price cost more, and Cloud Functions is the wrong shape for a long batch job.",
# 263
"Latency is distance, so the fix is to put a copy of the application near the users complaining — a replica in a United States region. More zones or more European regions keep the traffic crossing the Atlantic, and billing accounts have nothing to do with it.",
# 264
"Google Cloud Armor is the DDoS and web application firewall service, absorbing volumetric attacks at the edge of Google's network. Security Command Center reports on posture rather than blocking traffic, Cloud VPN is a private link, and Cloud Build is CI/CD.",
# 265
"A consistent schema with records that cross-reference each other is the definition of relational data, so a relational database it is. A warehouse serves analysis rather than daily transactions, a data lake keeps raw data unmodelled, and non-relational stores drop the schema that is doing the work here.",
# 266
"A fast connection does not shorten the distance: the packets still cross from Asia to Europe and back, and that round trip is latency. Bandwidth is how much fits through the pipe rather than how long it takes, and nothing here points at server capacity or configuration.",
# 267
"They have the labelled images but no data science skills, which is precisely the gap AutoML fills — it trains a custom model on your own labels without any model code. Pre-trained APIs cannot learn what this company calls defective, Document AI reads documents, and Discovery AI serves retail.",
# 268
"Pulling the themes out of free-text conversation transcripts is the Natural Language API — entity and content classification over text that already exists. Speech-to-Text would be needed only if these were audio, and Vision and Translation solve other problems.",
# 269
"A warehouse holds structured and semi-structured data in a form that supports ad-hoc queries and custom reports, which is what analysing it means. Transactional tables and relationships describe an operational database, an object store leaves the data unqueryable, and a time-series database is a narrower tool.",
]
assert len(TOPICS6)==10 and len(DIFF6)==10 and len(EXPL6)==10

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

# Dump 5 runs #251-259 then #270-289; dump 6 is the #260-269 it skipped, so the
# ten go in at the seam rather than on the end.
five = [(q, TOPICS5[i], EXPL5[i], DIFF5[i]) for i, q in enumerate(qs5)]
six  = [(q, TOPICS6[i], EXPL6[i], DIFF6[i]) for i, q in enumerate(qs6)]
SEAM = 9
assert five[SEAM - 1][0]['prompt'].startswith('An organization is operating multiple workloads in containers')
assert five[SEAM][0]['prompt'].startswith('An organization wants to ensure that they grant users only')
rows += five[:SEAM] + six + five[SEAM:]
assert len(rows) == 289

out=["""/**
 * Community exam bank — 289 Cloud Digital Leader questions as they circulate on
 * ExamTopics, kept verbatim so the wording matches what people actually meet.
 * The numbering has no gaps, so `et-NNN` is that question's number on the site.
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
