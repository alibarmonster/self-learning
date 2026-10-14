import json,re
qs=json.load(open('parsed.json'))
def fix(t):
    t=re.sub(r'\s*(Your (?:answer|selection) is (?:in)?correct|Correct answer)\s*$','',t)
    t=t.replace('‫ג‬€"-preview','--preview').replace('‫ג‬€',"'")
    t=re.sub(r'^\*','',t)
    t=re.sub(r'[ \t]+',' ',t)
    return t.strip()
for q in qs:
    q['prompt']=fix(q['prompt']); q['options']=[fix(o) for o in q['options']]
    q.pop('trailing',None)
json.dump(qs,open('clean.json','w'),indent=1,ensure_ascii=False)
