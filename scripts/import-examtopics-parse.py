import re, json, unicodedata

SRC='/root/.claude/uploads/94c12760-c161-5b59-b186-94405cdee713/2e346242-examtopics.txt'
raw=open(SRC, encoding='utf-8').read()
raw=raw.replace('ג€œ','"').replace('ג€','"')
lines=[l.rstrip() for l in raw.split('\n')]

NOISE=re.compile(r'^\s*(uestion|Discussion\d*|ChatGPT|Statistics|Share|Reference:|https?://\S+|Question #\d+(Topic \d+)?|Community vote distribution|Other|\d+%|[A-G]{1,4} \(\d+%\)|🗳️)\s*$')
CA_INLINE=re.compile(r'^\s*Correct Answer:\s*([A-G]{1,4})?\s*.*$')
OPT1=re.compile(r'^([A-G])\.\s+(.*)$')          # "A. text"  (and maybe trailing Most Voted)
OPT2=re.compile(r'^([A-G])$')                    # bare letter, text on following lines
MV=re.compile(r'\s*Most Voted\s*$', re.I)
VOTE=re.compile(r'^([A-G]{1,4}) \((\d+)%\)$')

def norm(t):
    t=re.sub(r'\s+',' ',t).strip()
    t=re.sub(r'(\d)-\s+(\w)', r'\1-\2', t)      # "2- hour" -> "2-hour"
    return t

questions=[]; i=0; stem=[]; pending_ca=None
def flush_stem():
    global stem
    s=norm(' '.join(stem)); stem=[]
    s=re.sub(r'\s*change to multi answer\s*$','',s, flags=re.I)
    return s

while i < len(lines):
    ln=lines[i]
    m1=OPT1.match(ln); m2=OPT2.match(ln)
    starts = (m1 and m1.group(1)=='A') or (m2 and m2.group(1)=='A')
    if not starts:
        if ln.strip() and not NOISE.match(ln) and not CA_INLINE.match(ln) \
           and not ln.strip().startswith('Correct Answer'):
            stem.append(ln)
        i+=1; continue

    prompt=flush_stem()
    opts=[]; letters=[]; voted=set()
    fmt = 1 if m1 else 2
    while i < len(lines):
        ln=lines[i]
        m1=OPT1.match(ln); m2=OPT2.match(ln)
        if fmt==1 and m1:
            letter, text = m1.group(1), m1.group(2)
            if MV.search(text): voted.add(letter); text=MV.sub('', text)
            letters.append(letter); opts.append(norm(text)); i+=1; continue
        if fmt==2 and m2:
            letter=m2.group(1); i+=1; buf=[]
            while i < len(lines):
                nxt=lines[i]
                if OPT2.match(nxt) or nxt.strip().startswith('Correct Answer') \
                   or NOISE.match(nxt) or re.match(r'^Question #', nxt): break
                if re.fullmatch(r'\s*Most Voted\s*', nxt, re.I): voted.add(letter); i+=1; continue
                if nxt.strip(): buf.append(nxt)
                i+=1
                if buf and i<len(lines) and not lines[i].strip(): break
            letters.append(letter); opts.append(norm(' '.join(buf))); continue
        break

    # trailing metadata: consume only blank/noise/answer/vote lines, so a
    # question whose "Question #N" header is missing keeps its own stem.
    ca=None; votes=[]; j=i
    while j < len(lines):
        s_=lines[j].strip()
        if re.match(r'^Question #', s_): break
        if not s_: j+=1; continue
        m=CA_INLINE.match(lines[j])
        if m:
            if m.group(1): ca=m.group(1)
            elif j+1 < len(lines) and re.fullmatch(r'[A-G]{1,4}', lines[j+1].strip()):
                ca=lines[j+1].strip(); j+=1
            j+=1; continue
        v=VOTE.match(s_)
        if v: votes.append((v.group(1), int(v.group(2)))); j+=1; continue
        if NOISE.match(lines[j]): j+=1; continue
        break
    i=j
    questions.append(dict(prompt=prompt, letters=letters, options=opts,
                          most_voted=sorted(voted), correct_answer=ca, votes=votes))

json.dump(questions, open('parsed.json','w'), indent=1)
print('parsed:', len(questions))
bad=[q for q in questions if len(q['options'])<2 or any(not o for o in q['options'])]
print('malformed:', len(bad))
for q in bad: print('  !', q['prompt'][:70], q['letters'], q['options'])
print('no Most Voted:', sum(1 for q in questions if not q['most_voted']))
for q in questions:
    if not q['most_voted']: print('   -', q['prompt'][:80], '| CA:', q['correct_answer'])
print('multi (2+ Most Voted):', sum(1 for q in questions if len(q['most_voted'])>1))
dis=[q for q in questions if q['correct_answer'] and ''.join(q['most_voted'])!=q['correct_answer']]
print('Most Voted disagrees with dump CorrectAnswer:', len(dis))
