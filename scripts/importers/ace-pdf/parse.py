import re, json, sys
lines = open('ace.txt', encoding='utf-8').read().split('\n')
# drop page-number lines and title
clean = []
for l in lines:
    if re.fullmatch(r'\s*\d{1,3}\s*', l): continue
    if l.strip() == 'Associate Cloud Engineer Exam Questions': continue
    clean.append(l.rstrip())
qs = []; cur = None; expected = 1
qre = re.compile(r'^\s{0,8}(\d{1,3})\.\s+(.*)$')
ore = re.compile(r'^\s+([A-F])\.\s*(.*)$')
are = re.compile(r'^\s*Answers?\s*:\s*([A-F](?:\s*(?:,|and|&|\s)\s*[A-F])*)\s*\.?\s*$')
for l in clean:
    m = qre.match(l)
    if m and int(m.group(1)) == expected and (cur is None or cur.get('answer')):
        cur = {'n': expected, 'stem': [m.group(2)], 'options': [], 'answer': None}
        qs.append(cur); expected += 1; continue
    if cur is None: continue
    a = are.match(l)
    if a and not cur['answer']: cur['answer'] = ''.join(re.findall(r'[A-F]', a.group(1))); continue
    o = ore.match(l)
    if o and not cur['answer'] and (len(cur['options']) == 0 and o.group(1) == 'A' or cur['options'] and ord(o.group(1)) == ord(cur['options'][-1][0]) + 1):
        cur['options'].append([o.group(1), [o.group(2)]]); continue
    if cur['answer']:
        if l.strip(): cur.setdefault('trailing', []).append(l.strip())
        continue
    target = cur['options'][-1][1] if cur['options'] else cur['stem']
    target.append(l)
def join(parts):
    out = []
    for p in parts:
        s = p.strip()
        if not s:
            if out and out[-1] != '': out.append('')
            continue
        if s.startswith(('- ', '• ', '* ', 'o ')) or not out or out[-1] == '':
            out.append(s)
        else:
            out[-1] = out[-1] + ' ' + s
    while out and out[-1] == '': out.pop()
    return '\n'.join(out)
res = []
for q in qs:
    res.append({'n': q['n'], 'prompt': join(q['stem']), 'options': [join(o[1]) for o in q['options']],
                'letters': ''.join(o[0] for o in q['options']), 'answer': q['answer'], 'trailing': q.get('trailing')})
json.dump(res, open('parsed.json', 'w'), indent=1, ensure_ascii=False)
print(len(res))
bad = [r['n'] for r in res if not r['answer'] or len(r['options']) < 2 or any(c not in r['letters'] for c in r['answer'])]
print('bad', bad)
from collections import Counter
print(Counter(len(r['options']) for r in res))
print('trailing', [(r['n'], r['trailing'][:2]) for r in res if r['trailing']][:20])
