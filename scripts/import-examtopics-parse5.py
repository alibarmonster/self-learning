import re, json
SRC='/root/.claude/uploads/94c12760-c161-5b59-b186-94405cdee713/ea0dc59c-examtopics.txt'
raw=open(SRC, encoding='utf-8').read()
raw=raw.replace('ג€œ','"').replace('ג€','"').replace('`','"')
lines=[l.rstrip() for l in raw.split('\n')]

NOISE=re.compile(r"^\s*(Actual exam question from Google's Cloud Digital Leader"
                 r"|Question #:\s*\d+|Topic #:\s*\d+|\[All Cloud Digital Leader Questions\]"
                 r"|Exam Cloud Digital Leader topic \d+ question \d+ discussion)\s*$")
OPT=re.compile(r'^([A-E])\.\s+(.*)$')
MV=re.compile(r'\s*Most Voted\s*$', re.I)

def norm(t):
    t=re.sub(r'\s+',' ',t).strip()
    return re.sub(r'(\d)-\s+(\w)', r'\1-\2', t)

out=[]; stem=[]; i=0
while i < len(lines):
    m=OPT.match(lines[i])
    if not (m and m.group(1)=='A'):
        if lines[i].strip() and not NOISE.match(lines[i]): stem.append(lines[i])
        i+=1; continue
    prompt=norm(' '.join(stem)); stem=[]
    letters=[]; opts=[]; voted=[]
    while i < len(lines):
        m=OPT.match(lines[i])
        if not m: break
        letter,text=m.group(1),m.group(2)
        if MV.search(text): voted.append(letter); text=MV.sub('',text)
        letters.append(letter); opts.append(norm(text)); i+=1
    out.append(dict(prompt=prompt, letters=letters, options=opts,
                    most_voted=sorted(voted), correct_answer=None, votes=[]))
json.dump(out, open('parsed5.json','w'), indent=1)
print('parsed:', len(out))
import collections
print('options:', dict(collections.Counter(len(q['options']) for q in out)))
print('answers:', dict(collections.Counter(len(q['most_voted']) for q in out)))
bad=[q for q in out if len(q['options'])<2 or not q['prompt'] or not q['most_voted']]
print('malformed:', len(bad))
for q in bad: print('  !', q)
print('\nfirst:', out[0]['prompt'][:80], out[0]['most_voted'])
print('last :', out[-1]['prompt'][:80], out[-1]['most_voted'])
# the two headerless ones
for q in out:
    if q['prompt'].startswith('An organization wants full control') or q['prompt'].startswith('What does Cloud Logging'):
        print('headerless ok:', q['prompt'][:70], q['most_voted'])
