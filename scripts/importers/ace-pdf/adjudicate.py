"""Final key decisions after the second-opinion pass (see verify/out_*.json)."""
import json
out = json.load(open('review.json'))
O = {o['n']: o for o in out}
def change(n, ans, conf, expl):
    O[n].update(answer=ans, changed=True, confidence=conf, explanation=expl)
change(33, 'A', 'medium',
 "The PDF's key says to turn autoscaling off and set a minimum and maximum of one, but a managed instance group only has minimum and maximum sizes when autoscaling is on; with it off you just set a fixed number of instances. Autoscaling on with both limits at one keeps exactly one VM, and autohealing recreates it if it fails, so the application keeps running. A maximum of two would allow a second VM and break the one-instance rule. Turning autoscaling off with a target size of one would also work, but that is not what any option describes.")
change(257, 'B', 'medium',
 "The PDF's key says to filter the console Activity log, but that page shows abbreviated Admin Activity entries and hides Data Access entries by default, so it will not show which photos were read. A single Logs Explorer query in Cloud Logging (the old Stackdriver Logging), filtered on the employee's principal email and the three buckets, returns both the Data Access entries for object reads and the Admin Activity entries for label changes. The Storage browser keeps no access history, and Cloud Trace measures latency, not who did what. This matches the original version of this question, which is keyed to the Cloud Logging answer.")
change(530, 'B', 'medium',
 "The PDF's key says Cloud Storage, but Google's storage guidance names a Persistent Disk attached in read-only mode to many VMs as the low-cost, high-performance way to share static data between instances, and it involves no edge caching. Cloud Storage is cheap but is object storage with higher latency, and the 'no edge caching' wording steers away from it. Filestore is a managed NFS share that costs considerably more, and Firebase is an app platform. It stays debatable because Cloud Storage is also low cost and shareable.")
json.dump(out, open('final.json', 'w'), indent=1, ensure_ascii=False)
print(sorted(n for n, o in O.items() if o['changed']))
