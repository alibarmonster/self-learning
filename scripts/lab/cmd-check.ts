/**
 * Regression check for the command quiz: every answer pattern parses, its
 * shown form is accepted, ids are unique, and a few classic wrong answers are
 * still rejected. Run with `bun scripts/lab/cmd-check.ts`.
 */
import { ALL_ITEMS, ITEM_BY_ID } from '../../src/lab/cmd/bank';
import { judge, selfCheck } from '../../src/lab/cmd/grade';
import { parseLine } from '../../src/lab/cmd/parse';

let failed = 0;
const ids = new Set<string>();
for (const it of ALL_ITEMS) {
  if (ids.has(it.id)) {
    console.log(`✗ duplicate id ${it.id}`);
    failed++;
  }
  ids.add(it.id);
}
for (const e of selfCheck(ALL_ITEMS)) {
  console.log(`✗ ${e}`);
  failed++;
}

/** [item, typed line, should it be accepted?] */
const CASES: [string, string, boolean][] = [
  ['start-init', 'gcloud init', true],
  ['start-init', 'gcloud auth init', false],
  ['start-init', 'gcloud auth login', false],
  ['start-zone', 'gcloud config set zone us-central1-a', false],
  ['start-get', 'gcloud config get-value project', true],
  ['start-quiet', 'gcloud compute instances delete web-1 -q --zone us-central1-a', true],
  ['auth-grant', 'gcloud projects add-iam-policy-binding ace-lab-123 --role roles/viewer --member user:ana@example.com', true],
  ['auth-grant', 'gcloud projects add-iam-policy-binding ace-lab-123 --member=ana@example.com --role=roles/viewer', false],
  ['auth-setpolicy', 'gcloud iam service-accounts set-iam-policy-binding app-runner@ace-lab-123.iam.gserviceaccount.com policy.json', false],
  ['vm-create', 'gcloud compute instances create web-1 --image-project debian-cloud --image-family debian-12 --machine-type e2-medium', true],
  ['vm-create', 'gcloud compute instances create web-1 --zone=us-east1-b --image-project debian-cloud --image-family debian-12 --machine-type e2-medium', false],
  ['vm-autoscale', 'gcloud compute instance-groups managed set-autoscaling web-mig --max-num-replicas 10 --min-num-replicas 2 --target-cpu-utilization 0.6', true],
  ['vm-autoscale', 'gcloud compute instance-groups managed set-autoscaling web-mig --max-num-replicas 10 --min-num-replicas 2 --target-cpu-utilization 60', false],
  ['vm-resize', 'gcloud compute disks resize data-1 --size 200', true],
  ['net-hc', 'gcloud compute firewall-rules create allow-hc --network prod-vpc --allow tcp:80 --source-ranges 35.191.0.0/16,130.211.0.0/22 --target-tags web', true],
  ['net-http', 'gcloud compute firewall-rules create allow-http --network=prod-vpc --allow=http --target-tags=web', false],
  ['gke-std', 'gcloud container clusters create std-1 --location us-central1-a', true],
  ['gke-auto', 'gcloud container clusters create-auto auto-1 --location=us-central1', true],
  ['gke-resize', 'gcloud container clusters resize std-1 --node-pool default-pool --size 5', true],
  ['run-private', 'gcloud run deploy api --image=us-central1-docker.pkg.dev/ace-lab-123/apps/api:v1 --region=us-central1', true],
  ['run-private', 'gcloud run deploy api --image=us-central1-docker.pkg.dev/ace-lab-123/apps/api:v1 --region=us-central1 --allow-unauthenticated', false],
  ['run-split', 'gcloud run services update-traffic api --region us-central1 --to-revisions api-00002-xyz=10,api-00001-abc=90', true],
  ['gae-split', 'gcloud app services set-traffic default --splits v2=10,v1=90', true],
  ['kc-wide', 'kubectl get po -o wide', true],
  ['kc-exec', 'kubectl exec -it web-7d4b9 -- /bin/bash', true],
  ['kc-exec', 'kubectl exec -it web-7d4b9 sh', false],
  ['kc-pf', 'kubectl port-forward pod/web-7d4b9 8080:80', true],
  ['kd-hpa', 'kubectl autoscale deployment web --min=2 --max=10 --cpu-percent=60', true],
  ['kd-image', 'kubectl set image deploy web nginx=nginx:1.28', true],
  ['kd-scale', 'kubectl scale deploy/web --replicas 5', true],
  ['kd-scale', 'gcloud container clusters resize std-1 --num-nodes=5', false],
  ['gcs-mb', 'gsutil mb -l us gs://ace-assets-123', true],
  ['gcs-mb', 'gcloud storage buckets create gs://ace-assets-123/ --location us', true],
  ['gcs-cp', 'gsutil cp -r ./site gs://ace-assets-123', false],
  ['gcs-cp', 'gcloud storage cp --recursive site gs://ace-assets-123/', true],
  ['gcs-iam', 'gsutil iam ch user:ana@example.com:objectViewer gs://ace-assets-123', true],
  ['bq-mkds', 'bq --location=US mk -d sales', true],
  ['bq-query', "bq query --nouse_legacy_sql 'SELECT COUNT(*) FROM sales.orders'", true],
  ['bq-query', "bq query 'SELECT COUNT(*) FROM sales.orders'", false],
  ['bq-head', 'bq head --max_rows=10 sales.orders', true],
  ['tf-var', "terraform plan -var 'region=us-central1'", true],
  ['tf-import', 'terraform import ace-assets-123 google_storage_bucket.assets', false],
  ['dk-run', 'docker run --name=web -p 8080:80 -d nginx', true],
  ['dk-run', 'docker run nginx -d -p 8080:80 --name web', false],
  ['dk-run', 'docker run -d -p 80:8080 --name web nginx', false],
  ['dk-compose', 'docker-compose up -d', true]
];
for (const [id, line, want] of CASES) {
  const item = ITEM_BY_ID[id];
  if (!item) {
    console.log(`✗ case for unknown item ${id}`);
    failed++;
    continue;
  }
  const r = parseLine(line)!;
  const v = judge(item, line, r);
  if (v.correct !== want) {
    console.log(`✗ ${id}: "${line}" was ${v.correct ? 'accepted' : 'rejected'}${r.ok ? '' : ` (CLI error: ${r.lines[0]})`} — ${v.feedback.join(' ')}`);
    failed++;
  }
}
console.log(failed ? `${failed} problem(s)` : `✓ ${ALL_ITEMS.length} questions, ${CASES.length} grading cases`);
if (failed) process.exit(1);
