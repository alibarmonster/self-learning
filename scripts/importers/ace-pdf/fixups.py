import json
qs=json.load(open('clean.json'))
Q={q['n']:q for q in qs}
Q[23]['prompt']+="\n\nThe diagram: connected devices (sensors) and standard devices send their data through a gateway into box 1, box 1 feeds box 2, and box 2 feeds two destinations — box 3, labelled Storage, and box 4, labelled Analytics."
Q[254]['prompt']+="\n\nThe diagram: the IoT device (the A.C.) and the smart device (the mobile app) send data over Cloud Pub/Sub into box 1, and box 1 feeds box 2 (Storage) and box 3 (Analytics)."
Q[254]['options']=['Cloud Dataflow, Cloud Datastore, BigQuery','Firebase Messages, Cloud Spanner, BigQuery','BigQuery, Cloud Bigtable, Cloud Storage','Cloud Dataflow, Cloud Bigtable, BigQuery']
p=Q[360]['prompt'].replace('- - - - YAML START','').replace('- - - - YAML END - - - -','').strip()
Q[360]['prompt']=p+"\n\nThe Deployment manifest, with the metadata lines elided:"
Q[360]['code']="""apiVersion: apps/v1
...
spec:
  containers:
  - name: main-container
    image: shopapp.com/app-repo/order-manager:2.3
    env:
    - name: DB_PASSWORD
      value: "securePass123"
    ports:
    - containerPort: 8080"""
Q[360]['lang']='yaml'
# 136 prints the same wrong command as options A and D; keep one copy
Q[136]['options']=Q[136]['options'][:3]; Q[136]['letters']='ABC'
# 567 repeats 419 word for word, options and key included
qs=[q for q in qs if q['n']!=567]
json.dump(qs,open('final-input.json','w'),indent=1,ensure_ascii=False)
print(len(qs))
