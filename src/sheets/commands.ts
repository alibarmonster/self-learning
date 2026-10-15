/**
 * Command reference shared by the Google Cloud exams: gcloud (built on Google's
 * own gcloud cheat sheet), kubectl, gsutil and gcloud storage, bq, Terraform and
 * Docker. Plain data, rendered by Cheatsheet.svelte as its own tab.
 *
 * Placeholders are in capitals (PROJECT_ID, ZONE, BUCKET). Tables with
 * `mono: true` set the command column in the monospace face.
 */
import type { Cheatsheet } from '@/types';

export const commands: Cheatsheet = {
  title: 'Every command on one page',
  filterHint: 'Filter — try “ssh”, “scale”, “bucket”, “rollout”, “plan”…',
  intro:
    'Six command-line tools, grouped by what you are trying to do. gcloud manages Google Cloud itself, kubectl works inside a Kubernetes cluster, gsutil (and its successor gcloud storage) handles buckets, bq talks to BigQuery, terraform builds infrastructure from code, and docker builds and runs container images. Words in capitals are placeholders. Filter to find a command by what it does.',
  parts: [
    {
      id: 'gcloud',
      title: 'gcloud — Google Cloud CLI',
      blurb:
        'The first four groups follow Google\'s official gcloud cheat sheet; the rest add the services the Associate Cloud Engineer exam asks about.'
    },
    {
      id: 'kubectl',
      title: 'kubectl — inside a Kubernetes cluster',
      blurb: 'gcloud creates the GKE cluster; kubectl manages everything that runs in it.'
    },
    {
      id: 'data',
      title: 'Storage and BigQuery — gsutil, gcloud storage, bq'
    },
    {
      id: 'build',
      title: 'Building and shipping — Terraform and Docker'
    }
  ],
  groups: [
    // ── gcloud ──────────────────────────────────────────────────────────────
    {
      id: 'gcloud-anatomy',
      part: 'gcloud',
      title: 'How a gcloud command is built',
      note: 'gcloud is a tree: groups branch into commands, and tab completion works for both. Read any command left to right and it names the service, the thing, then what to do with it.',
      path: [
        ['gcloud', 'the tool'],
        ['release level (optional)', 'alpha or beta for preview features; GA commands need none'],
        ['component', 'the service — compute, container, app, iam, sql, run…'],
        ['entity', 'the plural noun inside it — instances, disks, firewall-rules, clusters'],
        ['operation', 'the verb — list, describe, create, update, delete, ssh, deploy'],
        ['positional args', 'required, in order — e.g. the instance name'],
        ['flags', 'optional or required, any order — --zone=us-central1-a']
      ],
      tables: [
        {
          caption: 'Read it aloud',
          mono: true,
          columns: ['Example', 'Command'],
          rows: [
            ['Create a VM called web-1', 'gcloud compute instances create web-1 --zone=us-central1-a'],
            ['Same thing in beta', 'gcloud beta compute instances create web-1 --zone=us-central1-a']
          ]
        }
      ],
      tip: 'If an answer option puts the verb before the noun (gcloud create instances…) or skips the component (gcloud instances list), it is wrong.'
    },
    {
      id: 'gcloud-start',
      part: 'gcloud',
      title: 'Getting started and configurations',
      note: 'A configuration is a named set of defaults — account, project, region, zone. Keep one per project or environment and switch between them.',
      tables: [
        {
          caption: 'Getting started',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Initialise, sign in and pick defaults in one go', 'gcloud init'],
            ['Show the version and installed components', 'gcloud version'],
            ['Install a component (kubectl, beta…)', 'gcloud components install COMPONENT'],
            ['Update the CLI', 'gcloud components update'],
            ['Show the current environment details', 'gcloud info'],
            ['Search the reference docs', 'gcloud help TERM'],
            ['Read about filters, formats and more', 'gcloud topic filters / gcloud topic formats']
          ]
        },
        {
          caption: 'Properties and named configurations',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Set the default project', 'gcloud config set project PROJECT_ID'],
            ['Set the default zone or region', 'gcloud config set compute/zone ZONE / compute/region REGION'],
            ['Read one property', 'gcloud config get-value project'],
            ['List the active configuration', 'gcloud config list'],
            ['Create a named configuration', 'gcloud config configurations create NAME'],
            ['List configurations', 'gcloud config configurations list'],
            ['Switch configuration', 'gcloud config configurations activate NAME'],
            ['Inspect one without activating it', 'gcloud config configurations describe NAME']
          ]
        },
        {
          caption: 'Flags that work everywhere',
          mono: true,
          columns: ['Flag', 'Use'],
          rows: [
            ['When in doubt', '--help'],
            ['Run against another project once', '--project=PROJECT_ID'],
            ['No prompts — accept defaults (scripts)', '--quiet'],
            ['Output as json, yaml, table, csv, value…', '--format=json'],
            ['More or less logging', '--verbosity=debug|info|warning|error|critical|none']
          ]
        }
      ]
    },
    {
      id: 'gcloud-auth',
      part: 'gcloud',
      title: 'Credentials, projects and IAM',
      tables: [
        {
          caption: 'Who you are',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Sign in with your Google account', 'gcloud auth login'],
            ['Sign in as a service account', 'gcloud auth activate-service-account --key-file=KEY.json'],
            ['Credentials for local code (ADC)', 'gcloud auth application-default login'],
            ['List signed-in accounts', 'gcloud auth list'],
            ['Print an access token', 'gcloud auth print-access-token'],
            ['Remove credentials', 'gcloud auth revoke ACCOUNT'],
            ['Let Docker push to Artifact Registry', 'gcloud auth configure-docker REGION-docker.pkg.dev']
          ]
        },
        {
          caption: 'Projects, APIs and billing',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['List projects', 'gcloud projects list'],
            ['Show a project (ID, number)', 'gcloud projects describe PROJECT_ID'],
            ['Create a project in a folder', 'gcloud projects create PROJECT_ID --folder=FOLDER_ID'],
            ['Enable an API', 'gcloud services enable compute.googleapis.com'],
            ['List enabled APIs', 'gcloud services list --enabled'],
            ['Link a billing account', 'gcloud billing projects link PROJECT_ID --billing-account=ACCOUNT_ID']
          ]
        },
        {
          caption: 'IAM',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Grant a role on a project', 'gcloud projects add-iam-policy-binding PROJECT_ID --member=user:EMAIL --role=roles/ROLE'],
            ['Remove a role', 'gcloud projects remove-iam-policy-binding PROJECT_ID --member=... --role=...'],
            ['Read the project policy', 'gcloud projects get-iam-policy PROJECT_ID'],
            ['Roles you could grant on a resource', 'gcloud iam list-grantable-roles RESOURCE'],
            ['See what a role contains', 'gcloud iam roles describe roles/ROLE'],
            ['Create a custom role', 'gcloud iam roles create ROLE_ID --project=PROJECT_ID --file=role.yaml'],
            ['Copy a custom role to another project', 'gcloud iam roles copy --source=ROLE --destination=ROLE_ID --dest-project=PROJECT_ID'],
            ['Create a service account', 'gcloud iam service-accounts create NAME'],
            ['List its keys', 'gcloud iam service-accounts keys list --iam-account=SA_EMAIL'],
            ['Create a key (avoid when you can)', 'gcloud iam service-accounts keys create key.json --iam-account=SA_EMAIL'],
            ['Let someone use or impersonate it', 'gcloud iam service-accounts add-iam-policy-binding SA_EMAIL --member=... --role=roles/iam.serviceAccountUser'],
            ['Replace its whole policy', 'gcloud iam service-accounts set-iam-policy SA_EMAIL policy.json']
          ]
        }
      ],
      tip: 'add-iam-policy-binding adds one member to one role; set-iam-policy replaces the entire policy. The exam prefers the binding commands.'
    },
    {
      id: 'gcloud-output',
      part: 'gcloud',
      title: 'Filtering and formatting output',
      note: 'Four flags trim any list command: --filter chooses rows, --format chooses columns and shape, --sort-by orders, --limit stops early.',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['VMs in us-* zones that are not f1-micro', 'gcloud compute instances list --filter="zone ~ ^us AND -machineType:f1-micro"'],
            ['Ten VMs with any value for label my-label', 'gcloud compute instances list --filter="labels.my-label:*" --limit=10'],
            ['Projects as a table, oldest first', 'gcloud projects list --format="table(projectNumber,projectId,createTime.date(tz=LOCAL))" --sort-by=createTime'],
            ['Just one value, for a script', 'gcloud config get-value project / --format="value(name)"'],
            ['Everything as JSON', 'gcloud compute instances describe NAME --format=json']
          ]
        }
      ]
    },
    {
      id: 'gcloud-compute',
      part: 'gcloud',
      title: 'Compute Engine',
      tables: [
        {
          caption: 'VMs',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['List zones', 'gcloud compute zones list'],
            ['List VMs', 'gcloud compute instances list'],
            ['Show one VM', 'gcloud compute instances describe NAME --zone=ZONE'],
            ['Create a VM', 'gcloud compute instances create NAME --zone=ZONE --machine-type=e2-medium --image-family=debian-12 --image-project=debian-cloud'],
            ['Create a Spot VM', 'gcloud compute instances create NAME --provisioning-model=SPOT'],
            ['Start, stop, reset', 'gcloud compute instances start|stop|reset NAME --zone=ZONE'],
            ['Change machine type (VM must be stopped)', 'gcloud compute instances set-machine-type NAME --machine-type=TYPE'],
            ['SSH in', 'gcloud compute ssh NAME --zone=ZONE'],
            ['SSH with no external IP, through IAP', 'gcloud compute ssh NAME --tunnel-through-iap'],
            ['Add a startup script', 'gcloud compute instances add-metadata NAME --metadata-from-file=startup-script=start.sh']
          ]
        },
        {
          caption: 'Disks, snapshots, images',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Snapshot a disk', 'gcloud compute disks snapshot DISK --zone=ZONE'],
            ['Show or delete a snapshot', 'gcloud compute snapshots describe|delete SNAPSHOT'],
            ['Schedule snapshots', 'gcloud compute resource-policies create snapshot-schedule NAME --daily-schedule --start-time=02:00'],
            ['Grow a disk', 'gcloud compute disks resize DISK --size=200GB'],
            ['Image from a disk', 'gcloud compute images create IMAGE --source-disk=DISK --source-disk-zone=ZONE'],
            ['Image from a snapshot', 'gcloud compute images create IMAGE --source-snapshot=SNAPSHOT'],
            ['List public Windows images', 'gcloud compute images list --project=windows-cloud --no-standard-images']
          ]
        },
        {
          caption: 'Instance templates and managed instance groups',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Create a template', 'gcloud compute instance-templates create TEMPLATE --machine-type=TYPE --image-family=...'],
            ['Create a MIG', 'gcloud compute instance-groups managed create MIG --template=TEMPLATE --size=3 --zone=ZONE'],
            ['Regional MIG (spread over zones)', 'gcloud compute instance-groups managed create MIG --template=TEMPLATE --size=3 --region=REGION'],
            ['Autoscale on CPU', 'gcloud compute instance-groups managed set-autoscaling MIG --max-num-replicas=10 --target-cpu-utilization=0.6'],
            ['Roll out a new template', 'gcloud compute instance-groups managed rolling-action start-update MIG --version=template=NEW'],
            ['Resize by hand', 'gcloud compute instance-groups managed resize MIG --size=5']
          ]
        }
      ]
    },
    {
      id: 'gcloud-network',
      part: 'gcloud',
      title: 'Networking',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Custom-mode VPC', 'gcloud compute networks create VPC --subnet-mode=custom'],
            ['Subnet in a region', 'gcloud compute networks subnets create SUBNET --network=VPC --region=REGION --range=10.0.1.0/24'],
            ['Grow a subnet (never shrink)', 'gcloud compute networks subnets expand-ip-range SUBNET --region=REGION --prefix-length=20'],
            ['Allow HTTP to tagged VMs', 'gcloud compute firewall-rules create allow-http --network=VPC --allow=tcp:80 --target-tags=web --source-ranges=0.0.0.0/0'],
            ['List firewall rules', 'gcloud compute firewall-rules list'],
            ['Reserve a static external IP', 'gcloud compute addresses create NAME --region=REGION'],
            ['Reserve a static internal IP', 'gcloud compute addresses create NAME --region=REGION --subnet=SUBNET --addresses=10.0.1.10'],
            ['Peer two VPCs (run on both sides)', 'gcloud compute networks peerings create NAME --network=VPC --peer-network=OTHER'],
            ['Cloud NAT for private VMs', 'gcloud compute routers nats create NAT --router=ROUTER --region=REGION --auto-allocate-nat-external-ips --nat-all-subnet-ip-ranges'],
            ['Create a DNS zone', 'gcloud dns managed-zones create ZONE --dns-name=example.com. --description=...']
          ]
        }
      ]
    },
    {
      id: 'gcloud-gke',
      part: 'gcloud',
      title: 'Google Kubernetes Engine (gcloud side)',
      note: 'gcloud makes and resizes the cluster; get-credentials then hands it to kubectl.',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Autopilot cluster (Google runs the nodes)', 'gcloud container clusters create-auto NAME --region=REGION'],
            ['Standard zonal cluster', 'gcloud container clusters create NAME --zone=ZONE --num-nodes=3'],
            ['List clusters', 'gcloud container clusters list'],
            ['Point kubectl at a cluster', 'gcloud container clusters get-credentials NAME --zone=ZONE (or --region)'],
            ['Add a node pool', 'gcloud container node-pools create POOL --cluster=NAME --machine-type=TYPE --num-nodes=2'],
            ['Resize a node pool', 'gcloud container clusters resize NAME --node-pool=POOL --num-nodes=5'],
            ['Turn on cluster autoscaling', 'gcloud container clusters update NAME --enable-autoscaling --min-nodes=1 --max-nodes=5 --node-pool=POOL'],
            ['Upgrade the control plane', 'gcloud container clusters upgrade NAME --master'],
            ['Image tags and digests', 'gcloud container images list-tags IMAGE (Artifact Registry: gcloud artifacts docker tags list)']
          ]
        }
      ]
    },
    {
      id: 'gcloud-serverless',
      part: 'gcloud',
      title: 'Cloud Run, Cloud Run functions and App Engine',
      tables: [
        {
          caption: 'Cloud Run and functions',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Deploy a container', 'gcloud run deploy SERVICE --image=IMAGE --region=REGION --allow-unauthenticated'],
            ['Deploy straight from source', 'gcloud run deploy SERVICE --source=. --region=REGION'],
            ['Deploy without sending traffic', 'gcloud run deploy SERVICE --image=IMAGE --no-traffic --tag=canary'],
            ['Split traffic between revisions', 'gcloud run services update-traffic SERVICE --to-revisions=REV1=90,REV2=10'],
            ['Send everything to the newest revision', 'gcloud run services update-traffic SERVICE --to-latest'],
            ['Deploy an HTTP function', 'gcloud functions deploy NAME --gen2 --runtime=python312 --trigger-http --region=REGION'],
            ['Function on new bucket objects', 'gcloud functions deploy NAME --gen2 --trigger-bucket=BUCKET ...'],
            ['Function on Pub/Sub messages', 'gcloud functions deploy NAME --gen2 --trigger-topic=TOPIC ...']
          ]
        },
        {
          caption: 'App Engine',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Create the App Engine app (once, picks the region)', 'gcloud app create --region=REGION'],
            ['Deploy code and app.yaml', 'gcloud app deploy'],
            ['Deploy to another project', 'gcloud app deploy --project=PROJECT_ID'],
            ['Deploy a version without moving traffic', 'gcloud app deploy --no-promote --version=v2'],
            ['Split traffic between versions', 'gcloud app services set-traffic default --splits=v1=0.9,v2=0.1'],
            ['List versions', 'gcloud app versions list'],
            ['Open the app', 'gcloud app browse'],
            ['Read logs', 'gcloud app logs read']
          ]
        }
      ]
    },
    {
      id: 'gcloud-misc',
      part: 'gcloud',
      title: 'Logging, Cloud SQL, KMS and Deployment Manager',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['List log names', 'gcloud logging logs list'],
            ['Read recent entries', 'gcloud logging read "severity>=ERROR" --limit=20'],
            ['Route logs to BigQuery, a bucket or Pub/Sub', 'gcloud logging sinks create SINK bigquery.googleapis.com/projects/P/datasets/D --log-filter=...'],
            ['Create a Cloud SQL instance', 'gcloud sql instances create NAME --database-version=MYSQL_8_0 --tier=db-custom-2-7680 --region=REGION'],
            ['Connect with the client', 'gcloud sql connect NAME --user=root'],
            ['Show a backup', 'gcloud sql backups describe BACKUP_ID --instance=NAME'],
            ['Export to a SQL file in a bucket', 'gcloud sql export sql NAME gs://BUCKET/dump.sql --database=DB'],
            ['Decrypt with a KMS key', 'gcloud kms decrypt --key=KEY --keyring=RING --location=LOC --ciphertext-file=in --plaintext-file=out'],
            ['Preview a Deployment Manager change', 'gcloud deployment-manager deployments create NAME --config=config.yaml --preview'],
            ['Update a deployment in place', 'gcloud deployment-manager deployments update NAME --config=config.yaml']
          ]
        }
      ]
    },

    // ── kubectl ─────────────────────────────────────────────────────────────
    {
      id: 'kubectl-context',
      part: 'kubectl',
      title: 'Clusters and contexts',
      note: 'A context is a saved cluster + user + namespace in ~/.kube/config. get-credentials writes one; use-context switches.',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['List contexts', 'kubectl config get-contexts'],
            ['Which one is active', 'kubectl config current-context'],
            ['Switch cluster', 'kubectl config use-context CONTEXT'],
            ['Show the kubeconfig', 'kubectl config view'],
            ['Default namespace for this context', 'kubectl config set-context --current --namespace=NS'],
            ['Cluster and node overview', 'kubectl cluster-info / kubectl get nodes']
          ]
        }
      ]
    },
    {
      id: 'kubectl-look',
      part: 'kubectl',
      title: 'Looking around and debugging',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Pods, with node and IP', 'kubectl get pods -o wide'],
            ['Everything in a namespace', 'kubectl get all -n NS'],
            ['Services and their external IPs', 'kubectl get services'],
            ['Why a pod is Pending or crashing', 'kubectl describe pod POD'],
            ['Logs (follow)', 'kubectl logs POD -f'],
            ['Logs of one container, or the crashed one', 'kubectl logs POD -c CONTAINER / --previous'],
            ['Shell inside a container', 'kubectl exec -it POD -- sh'],
            ['Reach a pod from your laptop', 'kubectl port-forward POD 8080:80'],
            ['CPU and memory use', 'kubectl top pods / kubectl top nodes'],
            ['Recent cluster events', 'kubectl get events --sort-by=.metadata.creationTimestamp']
          ]
        }
      ]
    },
    {
      id: 'kubectl-change',
      part: 'kubectl',
      title: 'Deploying, scaling and updating',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Create or update from YAML', 'kubectl apply -f deployment.yaml'],
            ['Delete what a file created', 'kubectl delete -f deployment.yaml'],
            ['Quick deployment from an image', 'kubectl create deployment NAME --image=IMAGE'],
            ['Expose it on a public load balancer', 'kubectl expose deployment NAME --type=LoadBalancer --port=80 --target-port=8080'],
            ['Set the replica count', 'kubectl scale deployment NAME --replicas=5'],
            ['Pod autoscaling (HPA)', 'kubectl autoscale deployment NAME --min=2 --max=10 --cpu-percent=60'],
            ['Change the image — a rolling update', 'kubectl set image deployment/NAME CONTAINER=IMAGE:TAG'],
            ['Watch, list or undo a rollout', 'kubectl rollout status|history|undo deployment/NAME'],
            ['Store a secret', 'kubectl create secret generic NAME --from-literal=KEY=VALUE'],
            ['Store plain config', 'kubectl create configmap NAME --from-file=app.properties']
          ]
        },
        {
          caption: 'Nodes',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Stop new pods landing on a node', 'kubectl cordon NODE'],
            ['Move pods off it for maintenance', 'kubectl drain NODE --ignore-daemonsets'],
            ['Put it back in service', 'kubectl uncordon NODE']
          ]
        }
      ],
      tip: 'kubectl scale changes pods; gcloud container clusters resize changes nodes. The exam likes to swap the two.'
    },

    // ── data ────────────────────────────────────────────────────────────────
    {
      id: 'gsutil',
      part: 'data',
      title: 'Cloud Storage — gsutil and gcloud storage',
      note: 'gsutil is the older tool; Google now recommends gcloud storage, which is faster and takes the same gs:// paths. The exam still shows both, so learn the pairs.',
      tables: [
        {
          caption: 'Everyday work',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Make a bucket in a location and class', 'gsutil mb -l US -c STANDARD gs://BUCKET  ·  gcloud storage buckets create gs://BUCKET --location=US'],
            ['List buckets or objects', 'gsutil ls gs://BUCKET  ·  gcloud storage ls gs://BUCKET'],
            ['Object metadata (size, type, created)', 'gsutil stat gs://BUCKET/OBJ  ·  gcloud storage objects describe gs://BUCKET/OBJ'],
            ['Upload a folder, in parallel', 'gsutil -m cp -r ./dir gs://BUCKET  ·  gcloud storage cp -r ./dir gs://BUCKET'],
            ['Keep a folder in sync', 'gsutil rsync -r ./dir gs://BUCKET/dir  ·  gcloud storage rsync -r ./dir gs://BUCKET/dir'],
            ['Move or rename', 'gsutil mv gs://B/a gs://B/b  ·  gcloud storage mv'],
            ['Delete objects, or a bucket and its contents', 'gsutil rm gs://B/OBJ / gsutil rm -r gs://BUCKET  ·  gcloud storage rm']
          ]
        },
        {
          caption: 'Settings and access',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Apply lifecycle rules from JSON', 'gsutil lifecycle set rules.json gs://BUCKET'],
            ['Turn on object versioning', 'gsutil versioning set on gs://BUCKET'],
            ['Change the default storage class', 'gsutil defstorageclass set NEARLINE gs://BUCKET'],
            ['Change one object\'s class', 'gsutil rewrite -s COLDLINE gs://BUCKET/OBJ'],
            ['Grant a role on a bucket', 'gsutil iam ch user:EMAIL:objectViewer gs://BUCKET'],
            ['Make objects public', 'gsutil iam ch allUsers:objectViewer gs://BUCKET'],
            ['Time-limited link for one object', 'gsutil signurl -d 10m key.json gs://BUCKET/OBJ'],
            ['Retention lock (cannot delete early)', 'gsutil retention set 30d gs://BUCKET']
          ]
        }
      ]
    },
    {
      id: 'bq',
      part: 'data',
      title: 'BigQuery — bq',
      note: 'Names are PROJECT:dataset.table; the project part can be left off for your current project.',
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Create a dataset in a location', 'bq --location=US mk --dataset PROJECT:DATASET'],
            ['Create a table from a schema file', 'bq mk --table DATASET.TABLE schema.json'],
            ['Partitioned table', 'bq mk --table --time_partitioning_field=ts DATASET.TABLE schema.json'],
            ['Load a CSV from a bucket', 'bq load --source_format=CSV --autodetect DATASET.TABLE gs://BUCKET/file.csv'],
            ['Run a query in standard SQL', "bq query --use_legacy_sql=false 'SELECT ... FROM DATASET.TABLE'"],
            ['Bytes a query would scan (cost check)', "bq query --use_legacy_sql=false --dry_run 'SELECT ...'"],
            ['List datasets or tables', 'bq ls / bq ls DATASET'],
            ['Schema and details', 'bq show DATASET.TABLE'],
            ['Peek at rows without a query', 'bq head -n 10 DATASET.TABLE'],
            ['Export to Cloud Storage', 'bq extract DATASET.TABLE gs://BUCKET/out-*.csv'],
            ['Copy a table', 'bq cp DATASET.A DATASET.B'],
            ['Delete a dataset and everything in it', 'bq rm -r -d DATASET'],
            ['Inspect a job', 'bq show -j JOB_ID']
          ]
        }
      ],
      tip: 'A --dry_run query reports the bytes it would process, which is how you estimate the on-demand cost before running it.'
    },

    // ── build ───────────────────────────────────────────────────────────────
    {
      id: 'terraform',
      part: 'build',
      title: 'Terraform',
      note: 'You describe the infrastructure you want in .tf files; Terraform works out the difference from what exists and makes the changes. State remembers what it built — keep it in a Cloud Storage bucket for a team.',
      path: [
        ['terraform init', 'download providers, set up the backend — once per folder'],
        ['terraform fmt / validate', 'tidy the files and check the syntax'],
        ['terraform plan', 'show what would change, change nothing'],
        ['terraform apply', 'make the changes, after a yes'],
        ['terraform destroy', 'remove everything this configuration built']
      ],
      tables: [
        {
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Save a plan and apply exactly that', 'terraform plan -out=tfplan  →  terraform apply tfplan'],
            ['Apply without the prompt (CI)', 'terraform apply -auto-approve'],
            ['Pass a variable', 'terraform apply -var="region=us-central1" / -var-file=prod.tfvars'],
            ['Only one resource', 'terraform apply -target=google_compute_instance.web'],
            ['What Terraform manages', 'terraform state list / terraform state show ADDRESS'],
            ['Adopt something created by hand', 'terraform import ADDRESS RESOURCE_ID'],
            ['Print outputs (IPs, URLs)', 'terraform output'],
            ['Separate state per environment', 'terraform workspace new|select dev'],
            ['Shared state in a bucket', 'backend "gcs" { bucket = "BUCKET" prefix = "terraform/state" }']
          ]
        }
      ],
      tip: 'For Google-recommended infrastructure as code, the answer is Terraform; Deployment Manager is legacy and Config Connector is for teams that live in Kubernetes.'
    },
    {
      id: 'docker',
      part: 'build',
      title: 'Docker and Artifact Registry',
      note: 'An image is the packaged app; a container is a running copy of it. On Google Cloud, images live in Artifact Registry at REGION-docker.pkg.dev/PROJECT/REPOSITORY/IMAGE:TAG (Container Registry, the old gcr.io home, has been shut down).',
      tables: [
        {
          caption: 'Build and publish',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Create a Docker repository', 'gcloud artifacts repositories create REPO --repository-format=docker --location=REGION'],
            ['Let docker authenticate to it', 'gcloud auth configure-docker REGION-docker.pkg.dev'],
            ['Build an image from a Dockerfile', 'docker build -t REGION-docker.pkg.dev/PROJECT/REPO/app:v1 .'],
            ['Give an image another name or tag', 'docker tag app:v1 REGION-docker.pkg.dev/PROJECT/REPO/app:v1'],
            ['Upload it', 'docker push REGION-docker.pkg.dev/PROJECT/REPO/app:v1'],
            ['Build in the cloud instead (no local Docker)', 'gcloud builds submit --tag=REGION-docker.pkg.dev/PROJECT/REPO/app:v1'],
            ['Download an image', 'docker pull IMAGE']
          ]
        },
        {
          caption: 'Run and inspect',
          mono: true,
          columns: ['What you want', 'Command'],
          rows: [
            ['Run in the background, port 8080 → 80', 'docker run -d -p 8080:80 --name web IMAGE'],
            ['Pass an environment variable', 'docker run -e KEY=VALUE IMAGE'],
            ['Running containers (all with -a)', 'docker ps / docker ps -a'],
            ['Logs', 'docker logs -f web'],
            ['Shell inside', 'docker exec -it web sh'],
            ['Stop and remove', 'docker stop web && docker rm web'],
            ['Local images, remove one', 'docker images / docker rmi IMAGE'],
            ['Start a multi-container app', 'docker compose up -d']
          ]
        }
      ]
    }
  ]
};
