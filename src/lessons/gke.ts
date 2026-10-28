/**
 * Getting started with Google Kubernetes Engine — the deep-dive lesson, in
 * English with the terms as the exam prints them. Written to GKE as of late
 * 2026: Autopilot as the recommended mode, release channels, VPC-native
 * clusters, Workload Identity Federation for GKE, Artifact Registry.
 */
import type { Lesson } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="gke-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON_MINT = 'style="fill: #1a1a1a"';

const FIG_ARCH = SVG(
  'GKE cluster architecture: kubectl calls kube-apiserver in the Google-managed control plane, which also holds etcd, the scheduler and the controller managers; every node runs kubelet, kube-proxy, containerd and Pods',
  720,
  360,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="150" width="124" height="56" rx="6"/>
    <rect x="168" y="16" width="236" height="328" rx="8" stroke-dasharray="6 4"/>
    <rect x="188" y="106" width="196" height="40" rx="5"/>
    <rect x="188" y="160" width="196" height="40" rx="5"/>
    <rect x="188" y="214" width="196" height="40" rx="5"/>
    <rect x="188" y="268" width="196" height="40" rx="5"/>
    <rect x="432" y="16" width="272" height="156" rx="8"/>
    <rect x="432" y="188" width="272" height="156" rx="8"/>
    <rect x="448" y="50" width="116" height="30" rx="4"/>
    <rect x="574" y="50" width="114" height="30" rx="4"/>
    <rect x="448" y="88" width="240" height="26" rx="4"/>
    <rect x="448" y="124" width="74" height="36" rx="12"/>
    <rect x="531" y="124" width="74" height="36" rx="12"/>
    <rect x="614" y="124" width="74" height="36" rx="12"/>
    <rect x="448" y="222" width="116" height="30" rx="4"/>
    <rect x="574" y="222" width="114" height="30" rx="4"/>
    <rect x="448" y="260" width="240" height="26" rx="4"/>
    <rect x="448" y="296" width="74" height="36" rx="12"/>
    <rect x="531" y="296" width="74" height="36" rx="12"/>
    <path d="M140,172 L186,80" marker-end="url(#gke-arrow)"/>
    <path d="M384,66 L446,65" marker-end="url(#gke-arrow)"/>
    <path d="M384,80 C416,80 414,237 446,237" marker-end="url(#gke-arrow)"/>
    <path d="M286,92 L286,105"/>
  </g>
  <rect x="188" y="52" width="196" height="40" rx="5" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="78" y="174" style="font-weight: 600">kubectl</text>
    <text x="78" y="193" opacity="0.7">Console · CI/CD</text>
    <text x="286" y="40" opacity="0.75">Control plane — run by Google</text>
    <text x="286" y="77" ${ON_MINT} font-weight="600">kube-apiserver</text>
    <text x="286" y="131">etcd · stores state</text>
    <text x="286" y="185">kube-scheduler</text>
    <text x="286" y="239">kube-controller-manager</text>
    <text x="286" y="293">cloud-controller-manager</text>
    <text x="286" y="331" opacity="0.65">zonal: 1 replica · regional: 3</text>
    <text x="568" y="38" opacity="0.75">Node 1 · Compute Engine VM</text>
    <text x="568" y="210" opacity="0.75">Node 2 · Compute Engine VM</text>
    <text x="506" y="70">kubelet</text>
    <text x="631" y="70">kube-proxy</text>
    <text x="568" y="106">containerd (container runtime)</text>
    <text x="485" y="147">Pod</text>
    <text x="568" y="147">Pod</text>
    <text x="651" y="147">Pod</text>
    <text x="506" y="242">kubelet</text>
    <text x="631" y="242">kube-proxy</text>
    <text x="568" y="278">containerd</text>
    <text x="485" y="319">Pod</text>
    <text x="568" y="319">Pod</text>
    <text x="96" y="132" opacity="0.65">HTTPS + IAM</text>
  </g>`
);

const FIG_OBJECTS = SVG(
  'A Deployment creates a ReplicaSet, the ReplicaSet keeps three Pods labelled app=web running, and a Service finds those Pods through the selector app=web',
  720,
  240,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="88" width="150" height="64" rx="6"/>
    <rect x="206" y="88" width="160" height="64" rx="6"/>
    <rect x="416" y="22" width="128" height="44" rx="12"/>
    <rect x="416" y="98" width="128" height="44" rx="12"/>
    <rect x="416" y="174" width="128" height="44" rx="12"/>
    <path d="M166,120 L204,120" marker-end="url(#gke-arrow)"/>
    <path d="M366,112 L414,46" marker-end="url(#gke-arrow)"/>
    <path d="M366,120 L414,120" marker-end="url(#gke-arrow)"/>
    <path d="M366,128 L414,194" marker-end="url(#gke-arrow)"/>
    <path d="M590,112 L546,46" stroke-dasharray="4 4"/>
    <path d="M590,120 L546,120" stroke-dasharray="4 4"/>
    <path d="M590,128 L546,194" stroke-dasharray="4 4"/>
  </g>
  <rect x="590" y="88" width="114" height="64" rx="6" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="91" y="113" font-weight="600">Deployment</text>
    <text x="91" y="134" opacity="0.75">web · replicas: 3</text>
    <text x="286" y="113" font-weight="600">ReplicaSet</text>
    <text x="286" y="134" opacity="0.75">web-7d4b9</text>
    <text x="480" y="41">Pod</text><text x="480" y="58" opacity="0.65">app=web</text>
    <text x="480" y="117">Pod</text><text x="480" y="134" opacity="0.65">app=web</text>
    <text x="480" y="193">Pod</text><text x="480" y="210" opacity="0.65">app=web</text>
    <text x="647" y="113" ${ON_MINT} font-weight="600">Service web</text>
    <text x="647" y="134" ${ON_MINT}>selector app=web</text>
    <text x="186" y="80" opacity="0.6">creates</text>
    <text x="388" y="98" opacity="0.6">keeps</text>
  </g>`
);

const row = (y: number, name: string, desc: string, a: string, b: string, c: string) => `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="186" y="${y}" width="146" height="46" rx="6"/>
    <rect x="574" y="${y}" width="130" height="46" rx="12"/>
    <path d="M332,${y + 23} L378,${y + 23}" marker-end="url(#gke-arrow)"/>
    <path d="M528,${y + 23} L572,${y + 23}" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="380" y="${y}" width="148" height="46" rx="6" ${MINT}/>
  <g fill="currentColor">
    <text x="16" y="${y + 20}" font-weight="600">${name}</text>
    <text x="16" y="${y + 38}" opacity="0.7">${desc}</text>
    <text x="259" y="${y + 28}" text-anchor="middle">${a}</text>
    <text x="454" y="${y + 28}" text-anchor="middle" ${ON_MINT}>${b}</text>
    <text x="639" y="${y + 28}" text-anchor="middle">${c}</text>
  </g>`;

const FIG_TRAFFIC = SVG(
  'Four ways traffic reaches a Pod: ClusterIP from inside the cluster, NodePort through a node IP, LoadBalancer through a public Network Load Balancer, and Ingress or Gateway through an Application Load Balancer',
  720,
  296,
  row(16, 'ClusterIP', 'inside the cluster only', 'frontend Pod', '10.12.5.140:80', 'web Pod') +
    row(88, 'NodePort', 'high port on every node', 'Client in VPC', 'node IP :30080', 'web Pod') +
    row(160, 'LoadBalancer', 'L4, one public IP', 'Internet', 'Network LB', 'web Pod') +
    row(232, 'Ingress / Gateway', 'L7, host & path', 'Internet', 'Application LB', 'web Pod (NEG)')
);

const layer = (x: number, y: number, label: string, kind: 'google' | 'you' | 'shared') =>
  kind === 'google'
    ? `<rect x="${x}" y="${y}" width="300" height="36" rx="5" ${MINT}/><text x="${x + 150}" y="${y + 23}" text-anchor="middle" ${ON_MINT}>${label}</text>`
    : `<rect x="${x}" y="${y}" width="300" height="36" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"${kind === 'shared' ? ' stroke-dasharray="5 4"' : ''}/><text x="${x + 150}" y="${y + 23}" text-anchor="middle" fill="currentColor">${label}</text>`;

const LAYERS: [string, 'google' | 'you' | 'shared', 'google' | 'you' | 'shared'][] = [
  ['Workloads: Pods, Deployments, YAML', 'you', 'you'],
  ['Node security & hardening', 'you', 'google'],
  ['Capacity: node pools, autoscaling', 'you', 'google'],
  ['Nodes: VM, OS, upgrade, repair', 'shared', 'google'],
  ['Control plane', 'google', 'google'],
  ['Google infrastructure', 'google', 'google']
];

const FIG_MODES = SVG(
  'Who looks after what: in GKE Standard you manage node pools, capacity and node security; in Autopilot Google manages everything except your workloads',
  720,
  360,
  `
  <g fill="currentColor" text-anchor="middle" font-weight="600">
    <text x="190" y="30">GKE Standard</text>
    <text x="530" y="30">GKE Autopilot</text>
  </g>
  ${LAYERS.map(([l, s, a], i) => layer(40, 46 + i * 44, l, s) + layer(380, 46 + i * 44, l, a)).join('')}
  <g fill="currentColor" opacity="0.8">
    <rect x="40" y="326" width="16" height="16" rx="3" ${MINT}/><text x="64" y="339">Managed by Google</text>
    <rect x="210" y="326" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="234" y="339">Your job</text>
    <rect x="390" y="326" width="16" height="16" rx="3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/><text x="414" y="339">You set it, Google helps (auto-upgrade, auto-repair)</text>
  </g>`
);

const zoneBox = (x: number, w: number, label: string, cp: boolean, nodes: number) => `
  <rect x="${x}" y="52" width="${w}" height="150" rx="6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-dasharray="5 4"/>
  <text x="${x + w / 2}" y="72" text-anchor="middle" fill="currentColor" opacity="0.7">${label}</text>
  ${cp ? `<rect x="${x + w / 2 - 50}" y="82" width="100" height="32" rx="5" ${MINT}/><text x="${x + w / 2}" y="103" text-anchor="middle" ${ON_MINT}>control plane</text>` : ''}
  ${Array.from({ length: nodes }, (_, i) => {
    const total = nodes * 40 + (nodes - 1) * 10;
    const nx = x + w / 2 - total / 2 + i * 50;
    return `<rect x="${nx}" y="134" width="40" height="40" rx="5" fill="none" stroke="currentColor" stroke-width="1.5"/><text x="${nx + 20}" y="159" text-anchor="middle" fill="currentColor" style="font-size: 11px">node</text>`;
  }).join('')}`;

const FIG_REGIONAL = SVG(
  'A zonal cluster has one control plane and its nodes in one zone; a regional cluster has three control plane replicas and nodes in three zones, so --num-nodes=1 gives three nodes',
  720,
  250,
  `
  <g fill="currentColor" font-weight="600">
    <text x="16" y="30">Zonal</text>
    <text x="300" y="30">Regional</text>
  </g>
  <g fill="currentColor" opacity="0.75" style="font-size: 12px">
    <text x="70" y="30">--zone=us-central1-a --num-nodes=3</text>
    <text x="370" y="30">--region=us-central1 --num-nodes=1 → 3 nodes</text>
  </g>
  ${zoneBox(16, 250, 'us-central1-a', true, 3)}
  ${zoneBox(300, 128, 'us-central1-a', true, 1)}
  ${zoneBox(438, 128, 'us-central1-b', true, 1)}
  ${zoneBox(576, 128, 'us-central1-c', true, 1)}
  <g fill="currentColor" opacity="0.7" style="font-size: 12px">
    <text x="141" y="226" text-anchor="middle">zone down = cluster down</text>
    <text x="502" y="226" text-anchor="middle">one zone down, the cluster keeps serving</text>
  </g>`
);

const FIG_LIFECYCLE = SVG(
  'Pod phases: Pending, then Running, then Succeeded or Failed; Unknown when the node status cannot be read',
  720,
  210,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="24" y="56" width="150" height="50" rx="10"/>
    <rect x="540" y="20" width="160" height="44" rx="10"/>
    <rect x="540" y="98" width="160" height="44" rx="10"/>
    <rect x="290" y="150" width="150" height="44" rx="10" stroke-dasharray="5 4"/>
    <path d="M174,81 L288,81" marker-end="url(#gke-arrow)"/>
    <path d="M440,74 L538,46" marker-end="url(#gke-arrow)"/>
    <path d="M440,88 L538,116" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="290" y="56" width="150" height="50" rx="10" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="99" y="86" font-weight="600">Pending</text>
    <text x="365" y="86" ${ON_MINT} font-weight="600">Running</text>
    <text x="620" y="47" font-weight="600">Succeeded</text>
    <text x="620" y="125" font-weight="600">Failed</text>
    <text x="365" y="177">Unknown</text>
    <text x="99" y="128" opacity="0.7" style="font-size: 12px">not scheduled yet /</text>
    <text x="99" y="144" opacity="0.7" style="font-size: 12px">image not ready</text>
    <text x="231" y="74" opacity="0.6" style="font-size: 12px">scheduled</text>
    <text x="620" y="82" opacity="0.6" style="font-size: 12px">(Job finished)</text>
    <text x="620" y="160" opacity="0.6" style="font-size: 12px">container exited with an error</text>
    <text x="365" y="132" opacity="0.6" style="font-size: 12px">CrashLoopBackOff stays Running,</text>
    <text x="365" y="146" opacity="0.6" style="font-size: 12px">but RESTARTS keeps climbing</text>
  </g>`
);

const FIG_WI = SVG(
  'Workload Identity Federation for GKE: a Pod running as a Kubernetes service account asks the GKE metadata server for a token, which is exchanged through the workload identity pool for a short-lived Google token used to call Cloud Storage',
  720,
  210,
  `
  <g fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="16" y="62" width="140" height="60" rx="10"/>
    <rect x="196" y="62" width="150" height="60" rx="6"/>
    <rect x="586" y="62" width="118" height="60" rx="6"/>
    <path d="M156,92 L194,92" marker-end="url(#gke-arrow)"/>
    <path d="M346,92 L384,92" marker-end="url(#gke-arrow)"/>
    <path d="M546,92 L584,92" marker-end="url(#gke-arrow)"/>
    <path d="M86,122 C86,180 645,180 645,124" stroke-dasharray="5 4" marker-end="url(#gke-arrow)"/>
  </g>
  <rect x="386" y="62" width="160" height="60" rx="6" ${MINT}/>
  <g fill="currentColor" text-anchor="middle">
    <text x="86" y="88" font-weight="600">Pod</text>
    <text x="86" y="107" opacity="0.7">KSA shop/app-ksa</text>
    <text x="271" y="88" font-weight="600">Metadata server</text>
    <text x="271" y="107" opacity="0.7">GKE (on every node)</text>
    <text x="466" y="88" ${ON_MINT} font-weight="600">IAM</text>
    <text x="466" y="107" ${ON_MINT}>pool PROJECT.svc.id.goog</text>
    <text x="645" y="88" font-weight="600">Cloud Storage</text>
    <text x="645" y="107" opacity="0.7">checks the role</text>
    <text x="175" y="52" opacity="0.65" style="font-size: 12px">1 ask for a token</text>
    <text x="365" y="52" opacity="0.65" style="font-size: 12px">2 exchange</text>
    <text x="565" y="52" opacity="0.65" style="font-size: 12px">3 Google token</text>
    <text x="365" y="196" opacity="0.65" style="font-size: 12px">4 call the API with a short-lived token — no key file</text>
  </g>`
);

export const lesson: Lesson = {
  id: 'gke',
  lang: 'en',
  title: 'Getting Started with Google Kubernetes Engine',
  intro:
    'The cheat sheet gives you the shorthand; this page tells the story. We start with why containers need Kubernetes, then the Kubernetes concepts one by one, the parts of a GKE cluster, how Autopilot and Standard differ, kubectl, and introspection — reading what is really happening in a cluster — and finish with the case studies that come up most, on the exam and at work.',
  practice: [
    { label: 'Command quiz: GKE (the gcloud side)', href: '#/ace/lab/cmd/gke', note: '16 questions — create-auto, get-credentials, node pools, resize, autoscaling' },
    { label: 'Command quiz: kubectl, looking inside a cluster', href: '#/ace/lab/cmd/kubectl-look', note: 'get, describe, logs, exec, top, events' },
    { label: 'Command quiz: kubectl, deploy & scale', href: '#/ace/lab/cmd/kubectl-deploy', note: 'apply, expose, scale, autoscale, rollout, drain' },
    { label: 'Terminal: deploy an app to GKE', href: '#/ace/lab/terminal/gke-deploy', note: 'Cluster, get-credentials, deployment, service' },
    { label: 'Terminal: roll back a deployment', href: '#/ace/lab/terminal/gke-rollback', note: 'set image, rollout status, undo' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'start',
      title: 'Getting started',
      sections: [
        {
          id: 'why',
          title: 'GKE in one minute',
          blocks: [
            {
              kind: 'p',
              text: 'Modern applications ship as **containers**: the code, its runtime and its libraries packed into one **image** that runs exactly the same on a laptop, a server or in the cloud. The trouble starts when there are many of them: who decides which container runs on which machine, restarts the ones that die, adds copies when traffic grows, and swaps versions without downtime?'
            },
            {
              kind: 'p',
              text: '**Kubernetes** is the system that does all of that. You write down what you want — "run 3 copies of web version 1.4 and expose them on port 80" — and Kubernetes keeps making reality match it. **Google Kubernetes Engine (GKE)** is Kubernetes run by Google: Google runs, patches, upgrades and keeps the control plane highly available, and in Autopilot mode the nodes too.'
            },
            {
              kind: 'callout',
              tone: 'analogy',
              text: 'A container is a shipping container and the image is its mould. Kubernetes is the harbour master: you say "ship these 3 containers", and it picks the ships (nodes), moves containers when a ship breaks down, and adds ships when cargo piles up. GKE means Google runs the harbour.'
            },
            {
              kind: 'table',
              caption: 'When GKE, when something else',
              columns: ['Need', 'Usually the right choice', 'Why'],
              rows: [
                ['One stateless HTTP service, no ops wanted', 'Cloud Run', 'No cluster to look after; scales to zero.'],
                ['Many microservices that need network control, sidecars, jobs, stateful workloads', 'GKE', 'Kubernetes gives you all of those primitives on one platform.'],
                ['Existing Kubernetes manifests or Helm charts, portable across clouds', 'GKE', 'The Kubernetes API is the same everywhere.'],
                ['Old software that needs a full OS, per-machine licences', 'Compute Engine', 'Full control of the VM.'],
                ['A small piece of code triggered by events', 'Cloud Run functions', 'The least to write.']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'The words "microservices", "containerized application already on Kubernetes", "portability", "hybrid/multicloud" point to GKE. "Without managing infrastructure" plus a single HTTP service points to Cloud Run. "Without managing nodes" but still Kubernetes points to **GKE Autopilot**.'
            }
          ]
        },
        {
          id: 'images',
          title: 'Container images and Artifact Registry',
          blocks: [
            {
              kind: 'p',
              text: 'Before anything can run on GKE there has to be an image. It is built from a `Dockerfile` (with `docker build` on a laptop or `gcloud builds submit` on Cloud Build) and stored in **Artifact Registry**. Its address always looks like `REGION-docker.pkg.dev/PROJECT/REPOSITORY/IMAGE:TAG`.'
            },
            {
              kind: 'code',
              title: 'Building and storing an image without local Docker',
              lines: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=us-central1',
                'Created repository [apps].',
                '$ gcloud builds submit --tag=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '…',
                'DONE',
                'ID            CREATE_TIME                DURATION  SOURCE  IMAGES                                                STATUS',
                '4f2a9c1e-7b3d 2026-10-18T02:40:00+00:00  41S       gs://…  us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1  SUCCESS'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              title: 'Container Registry is shut down',
              text: '`gcr.io/…` addresses in older material belong to Container Registry, which has not accepted new images since 18 March 2025. For new images the answer is always Artifact Registry.'
            },
            {
              kind: 'p',
              text: 'GKE nodes pull images with their node service account. If the repository is in the same project and the node service account has `roles/artifactregistry.reader`, everything works; if not, the Pod ends up in `ImagePullBackOff` (see the case studies).'
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'concepts',
      title: 'Kubernetes concepts',
      sections: [
        {
          id: 'declarative',
          title: 'Thinking declaratively: desired state',
          blocks: [
            {
              kind: 'p',
              text: 'The most important thing about Kubernetes: you do not say "run this container now". You **declare the state you want** in an object (usually a YAML file), send it to the API, and **controllers** in the control plane loop forever: look at reality, compare it with what you asked for, fix the difference. A Pod died? The controller makes a new one. A node disappeared? Its Pods are rescheduled on other nodes.'
            },
            {
              kind: 'callout',
              tone: 'analogy',
              text: 'It is like air conditioning with a thermostat. You do not switch the compressor on and off yourself; you set "24°C" and the thermostat keeps adjusting. `replicas: 3` is the number on that thermostat.'
            },
            {
              kind: 'code',
              title: 'deployment.yaml — read from the top',
              lines: [
                'apiVersion: apps/v1          # API group and version',
                'kind: Deployment             # kind of object',
                'metadata:',
                '  name: web                  # object name',
                'spec:                        # desired state',
                '  replicas: 3                # always 3 Pods',
                '  selector:',
                '    matchLabels: {app: web}  # which Pods belong to this Deployment',
                '  template:                  # the Pod template',
                '    metadata:',
                '      labels: {app: web}',
                '    spec:',
                '      containers:',
                '      - name: web',
                '        image: us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '        ports: [{containerPort: 8080}]',
                '        resources:',
                '          requests: {cpu: 250m, memory: 512Mi}   # guaranteed; what scheduling is based on',
                '          limits: {memory: 512Mi}                # ceiling; going over = OOMKilled',
                '$ kubectl apply -f deployment.yaml',
                'deployment.apps/web created'
              ]
            },
            {
              kind: 'list',
              items: [
                '`kubectl apply -f` is declarative: running it again after editing the file applies only the difference. It is the recommended way and fits Git well.',
                '`kubectl create deployment …` / `kubectl expose …` are imperative: quick for trying things, but they leave no file anyone can review.',
                '**requests** decide which node a Pod fits on (the scheduler only looks at requests). **limits** cap usage; going over the memory limit gets the container killed (`OOMKilled`).'
              ]
            }
          ]
        },
        {
          id: 'objects',
          title: 'The core objects',
          blocks: [
            { kind: 'figure', svg: FIG_OBJECTS, caption: 'You usually only write the Deployment and the Service. The Deployment creates a ReplicaSet, the ReplicaSet keeps the number of Pods, and the Service finds Pods by label — not by name, because a Pod gets a new name every time it is recreated.' },
            {
              kind: 'terms',
              items: [
                {
                  term: 'Pod',
                  meaning: 'The smallest thing Kubernetes runs: one or more containers that are always scheduled together on one node and share an IP and volumes.',
                  analogy: 'A shared flat: the tenants (containers) share an address and a kitchen.',
                  example: 'An app container plus a log-shipping sidecar container in one Pod.'
                },
                {
                  term: 'Deployment / ReplicaSet',
                  meaning: 'A Deployment keeps a number of identical Pods running and handles rolling updates; behind it, it creates a ReplicaSet for each version.',
                  analogy: 'A shift manager who makes sure there are always 3 cashiers, and swaps them one at a time when new uniforms arrive.',
                  example: 'A stateless web frontend with `replicas: 3`.'
                },
                {
                  term: 'Service',
                  meaning: 'A stable address (DNS name + virtual IP) in front of a set of Pods chosen by label; it spreads traffic across the Pods that are Ready.',
                  analogy: 'An office phone number: the staff change, the number stays.',
                  example: '`web.default.svc.cluster.local:80` forwards to Pods labelled `app=web` on port 8080.'
                },
                {
                  term: 'Label & selector',
                  meaning: 'A label is a key=value pair on an object; a selector is a query over labels. Almost every link between objects is made this way.',
                  example: '`app=web, tier=frontend`; `kubectl get pods -l app=web`.'
                },
                {
                  term: 'Namespace',
                  meaning: 'A name space inside one cluster to separate teams or environments; RBAC, quotas and network policies can be set per namespace.',
                  example: '`dev`, `staging`, `shop`; `kube-system` holds the system components.'
                },
                {
                  term: 'ConfigMap & Secret',
                  meaning: 'Configuration kept outside the image and injected as environment variables or files. Secrets are for sensitive data — but Kubernetes itself only base64-encodes them, it does not encrypt them.',
                  example: 'The database URL in a ConfigMap, the password in a Secret (or better: Secret Manager).'
                }
              ]
            }
          ]
        },
        {
          id: 'workloads',
          title: 'Workload types: pick the right controller',
          blocks: [
            {
              kind: 'table',
              columns: ['Controller', 'For', 'Example', 'What sets it apart'],
              rows: [
                ['**Deployment**', 'Stateless applications', 'Web, API', 'Pods are interchangeable; rolling updates'],
                ['**StatefulSet**', 'Stateful applications', 'Databases, Kafka, Elasticsearch', 'Stable names (`db-0`, `db-1`), a disk per replica, ordered start/stop'],
                ['**DaemonSet**', 'One Pod on every node', 'Log agent, monitoring agent, CNI', 'Grows automatically as nodes are added'],
                ['**Job**', 'Work that finishes', 'Database migration, batch', 'Done = Succeeded phase; can run in parallel and retry'],
                ['**CronJob**', 'Scheduled Jobs', 'Daily report, backup', 'Cron-format schedule, creates a new Job each time']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Run a logging agent on every node" → DaemonSet. "Stable network identity and persistent storage per replica" → StatefulSet. "Run a batch task to completion" → Job. "Stateless web tier" → Deployment.'
            },
            {
              kind: 'p',
              text: 'To restart Pods without changing the spec (for example after replacing a ConfigMap), use `kubectl rollout restart deployment/web` — the Pods are replaced gradually, the same way as an image update.'
            }
          ]
        },
        {
          id: 'services',
          title: 'Services: how traffic reaches a Pod',
          blocks: [
            { kind: 'figure', svg: FIG_TRAFFIC, caption: 'Four ways in. On GKE, a LoadBalancer Service creates a passthrough Network Load Balancer (L4) with a public IP; an Ingress or Gateway creates an Application Load Balancer (L7) that goes straight to Pods through NEGs (container-native load balancing).' },
            {
              kind: 'table',
              columns: ['Type', 'Reachable from', 'When to use it'],
              rows: [
                ['`ClusterIP` (default)', 'Inside the cluster only', 'Service-to-service traffic: frontend → backend'],
                ['`NodePort`', 'Node IP + a port in 30000–32767', 'Rarely used directly; the base for other types'],
                ['`LoadBalancer`', 'The internet (or the VPC, when internal)', 'One TCP/UDP service exposed with one IP'],
                ['Ingress / Gateway API', 'The internet through one Application LB', 'Many HTTP(S) services under one IP, routing by host/path, TLS, Cloud Armor, IAP'],
                ['`ExternalName`', '—', 'A DNS alias to a service outside the cluster']
              ]
            },
            {
              kind: 'code',
              title: 'Exposing a Deployment to the internet',
              lines: [
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                'service/web exposed',
                '$ kubectl get service web',
                'NAME   TYPE           CLUSTER-IP    EXTERNAL-IP   PORT(S)        AGE',
                'web    LoadBalancer   10.12.5.140   <pending>     80:31234/TCP   10s',
                '# about a minute later Google has finished creating the load balancer',
                'web    LoadBalancer   10.12.5.140   34.70.88.21   80:31234/TCP   72s'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: '`port` is the Service port (what clients call), `targetPort` is the container port. One of the most common mistakes: the app listens on 8080 but `targetPort` is left at 80.'
            }
          ]
        },
        {
          id: 'storage',
          title: 'Storage: data that survives a Pod',
          blocks: [
            {
              kind: 'p',
              text: 'The disk inside a container is gone when the container is recreated. Data that must survive uses a **PersistentVolumeClaim (PVC)**: the Pod "claims" storage, and a **StorageClass** decides what kind of disk the Compute Engine Persistent Disk CSI driver creates for it automatically (dynamic provisioning).'
            },
            {
              kind: 'table',
              columns: ['Need', 'On GKE', 'Note'],
              rows: [
                ['A disk for one Pod (ReadWriteOnce)', 'StorageClass `standard-rwo` (pd-balanced, default) or `premium-rwo` (pd-ssd)', 'Zonal disk: the Pod must be in the same zone as the disk'],
                ['One volume read and written by many Pods (ReadWriteMany)', 'Filestore (NFS) through the Filestore CSI driver', 'For shared content, uploads'],
                ['A disk per database replica', '`volumeClaimTemplates` in a StatefulSet', 'Each replica gets its own PVC: `data-db-0`, `data-db-1`'],
                ['Large objects and files, a data lake', 'Cloud Storage (through the API or the Cloud Storage FUSE CSI driver)', 'Not block storage']
              ]
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'components',
      title: 'GKE components',
      sections: [
        {
          id: 'architecture',
          title: 'Cluster architecture: control plane and nodes',
          blocks: [
            { kind: 'figure', svg: FIG_ARCH, caption: 'Every command — kubectl, the Console, a CI pipeline — comes in through kube-apiserver. On GKE, Google runs everything in the dashed box; you cannot SSH into it and you do not pay for its VMs.' },
            {
              kind: 'table',
              caption: 'Control plane (run by Google)',
              columns: ['Component', 'Its job'],
              rows: [
                ['kube-apiserver', 'The only way in. Checks authentication (IAM) and authorization (RBAC), then stores objects in etcd.'],
                ['etcd', 'A key-value database holding the whole cluster state: every object and its status.'],
                ['kube-scheduler', 'Picks a node for every new Pod based on requests, affinity, taints/tolerations and zones.'],
                ['kube-controller-manager', 'Runs the controllers (Deployment, ReplicaSet, Node, Job…) that keep making reality match the desired state.'],
                ['cloud-controller-manager', 'The bridge to Google Cloud: creates load balancers for Services, sets up routes, notices nodes that have gone.']
              ]
            },
            {
              kind: 'table',
              caption: 'On every node (a Compute Engine VM)',
              columns: ['Component', 'Its job'],
              rows: [
                ['kubelet', 'The node agent: gets its list of Pods from the API server, tells the runtime to run them, reports status and runs probes.'],
                ['containerd', 'The container runtime that actually pulls images and runs containers.'],
                ['kube-proxy / GKE Dataplane V2', 'Wires Service traffic to Pods on that node (Dataplane V2 uses eBPF/Cilium and also enforces NetworkPolicy).'],
                ['Node image', 'Container-Optimized OS with containerd (the default) or Ubuntu.']
              ]
            },
            {
              kind: 'steps',
              items: [
                { title: 'You send a manifest', text: '`kubectl apply` sends the Deployment to kube-apiserver, which checks who you are and stores it in etcd.' },
                { title: 'Controllers react', text: 'The Deployment controller sees the new Deployment and creates a ReplicaSet; the ReplicaSet controller creates 3 Pod objects with no node yet.' },
                { title: 'The scheduler picks nodes', text: 'For each Pod, the scheduler finds a node with enough spare CPU and memory for its requests and records the choice.' },
                { title: 'kubelet runs it', text: 'The kubelet on the chosen node tells containerd to pull the image and start the container, then reports Running/Ready.' },
                { title: 'The loop never stops', text: 'If a container dies, the kubelet restarts it; if a node disappears, the controllers create replacement Pods and the scheduler places them on other nodes.' }
              ]
            }
          ]
        },
        {
          id: 'location',
          title: 'Node pools, cluster location and upgrades',
          blocks: [
            {
              kind: 'p',
              text: 'In Standard mode, nodes are grouped into **node pools**: sets of nodes with the same configuration (machine type, disk, labels, taints, Spot or not). One cluster can have many node pools — for example `default-pool` for ordinary apps and a `gpu-pool` or `spot-pool` for special work.'
            },
            { kind: 'figure', svg: FIG_REGIONAL, caption: 'Watch the numbers. In a regional cluster `--num-nodes` is per zone: `--num-nodes=1` across three zones gives three nodes, and `--num-nodes=3` gives nine.' },
            {
              kind: 'table',
              columns: ['Location', 'Control plane', 'Nodes', 'Good for'],
              rows: [
                ['Zonal (single-zone)', '1 replica in one zone', 'In that zone', 'Dev/test, lowest cost'],
                ['Zonal multi-zone', '1 replica in one zone', 'In several zones (`--node-locations`)', 'Workloads that survive a zone outage, though the cluster API can be briefly unavailable'],
                ['Regional', '3 replicas in 3 zones', 'In every zone of the region', 'Production; control plane upgrades with no API gap']
              ]
            },
            {
              kind: 'list',
              items: [
                'The **release channel** (`rapid`, `regular` — the default, `stable`, `extended`) decides how quickly the cluster gets new Kubernetes versions. Google upgrades the control plane and nodes automatically to follow the channel.',
                'A **maintenance window** and **maintenance exclusions** control when automatic upgrades may happen (for example, not during Black Friday).',
                '**Surge upgrades** replace nodes gradually: `maxSurge` new nodes are created first, and `maxUnavailable` old nodes may be taken out at once. Pods are moved respecting PodDisruptionBudgets.',
                '**Node auto-repair** recreates nodes that keep failing health checks; **auto-upgrade** keeps node versions in step with the control plane.'
              ]
            },
            {
              kind: 'code',
              title: 'Creating a regional Standard cluster with two node pools',
              lines: [
                '$ gcloud container clusters create shop --region=us-central1 --num-nodes=1 --release-channel=regular --workload-pool=ace-lab-123.svc.id.goog',
                '$ gcloud container node-pools create spot-pool --cluster=shop --region=us-central1 --spot --machine-type=e2-standard-4 --num-nodes=1 --enable-autoscaling --min-nodes=0 --max-nodes=5',
                '$ gcloud container node-pools list --cluster=shop --region=us-central1',
                'NAME          MACHINE_TYPE   DISK_SIZE_GB  NODE_VERSION',
                'default-pool  e2-medium      100           1.34.1-gke.1080000',
                'spot-pool     e2-standard-4  100           1.34.1-gke.1080000'
              ]
            }
          ]
        },
        {
          id: 'networking',
          title: 'Cluster networking',
          blocks: [
            {
              kind: 'p',
              text: 'Modern GKE clusters are **VPC-native**: every Pod gets a real IP from the VPC (an alias IP), so Pods can be reached directly from other VMs and from load balancers. For that, the cluster subnet has three ranges: the primary range for nodes, a secondary range for **Pods**, and a secondary range for **Services**.'
            },
            {
              kind: 'table',
              columns: ['Range', 'Example', 'If it runs out…'],
              rows: [
                ['Nodes (primary)', '10.10.0.0/24', 'No more nodes can be added'],
                ['Pods (secondary)', '10.40.0.0/14', 'New nodes get no block of Pod IPs — the cluster stops growing. On Standard each node takes a /24 (max. 110 Pods) by default.'],
                ['Services (secondary)', '10.12.0.0/20', 'New Services get no ClusterIP']
              ],
              mono: [1]
            },
            {
              kind: 'list',
              items: [
                '**Private nodes** (`--enable-private-nodes`): nodes with no external IP. Safer, but pulling images from the internet (Docker Hub) then needs **Cloud NAT**; images in Artifact Registry still work through Private Google Access.',
                '**Control plane authorized networks**: limit which IPs may call the cluster API (for example only the office and Cloud Shell).',
                '**NetworkPolicy**: a firewall between Pods inside the cluster ("only the frontend may reach the backend on port 8080"), enforced by Dataplane V2.',
                'VPC firewall rules still apply to traffic from outside to the nodes; GKE creates the rules that load balancer health checks need automatically.'
              ]
            }
          ]
        },
        {
          id: 'identity',
          title: 'Identity: IAM, RBAC and Workload Identity Federation for GKE',
          blocks: [
            {
              kind: 'p',
              text: 'Two different questions are often mixed up. First, **who may manage the cluster** — the people and pipelines calling the GKE API. Second, **what the application in a Pod may do** to other Google services (Cloud Storage, BigQuery, Pub/Sub).'
            },
            {
              kind: 'table',
              columns: ['Layer', 'Controls', 'Example'],
              rows: [
                ['IAM (project level)', 'Who may create clusters and use the Kubernetes API', '`roles/container.admin`, `roles/container.developer`, `roles/container.viewer`'],
                ['Kubernetes RBAC', 'Fine-grained rights inside the cluster, per namespace', '`Role` + `RoleBinding`: team A may manage Deployments in the `shop` namespace only'],
                ['Workload Identity Federation for GKE', 'A Google identity for Pods', 'KSA `shop/app-ksa` may read one particular bucket']
              ]
            },
            { kind: 'figure', svg: FIG_WI, caption: 'No key file: the Pod runs as a Kubernetes service account (KSA), GKE exchanges it for a short-lived Google token, and Cloud Storage checks that principal\'s IAM roles.' },
            {
              kind: 'code',
              title: 'Giving a Pod read access to one bucket',
              lines: [
                '# the cluster was created with --workload-pool=ace-lab-123.svc.id.goog (Autopilot: always on)',
                '$ kubectl create serviceaccount app-ksa -n shop',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-assets-123 \\',
                '    --role=roles/storage.objectViewer \\',
                '    --member="principal://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/ace-lab-123.svc.id.goog/subject/ns/shop/sa/app-ksa"',
                '# then in the Pod/Deployment spec: serviceAccountName: app-ksa'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              title: 'The older way you will still see',
              text: 'Before roles could be granted straight to the KSA principal, the pattern was: create a Google service account (GSA), give the GSA the roles it needs, give the KSA `roles/iam.workloadIdentityUser` on that GSA, then annotate the KSA with `iam.gke.io/gcp-service-account=GSA_EMAIL`. Both ways are right; what matters is never keeping a JSON key in a Secret.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Pods need to access Google Cloud APIs following best practices / least privilege" → Workload Identity Federation for GKE. The wrong answers are usually: grant a broad role to the node service account, or store a service account key in a Kubernetes Secret.'
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'modes',
      title: 'Autopilot vs Standard',
      sections: [
        {
          id: 'compare',
          title: 'Who looks after what',
          blocks: [
            { kind: 'figure', svg: FIG_MODES, caption: 'In Standard you buy and look after nodes; in Autopilot you only write workloads and Google provides nodes that fit your Pods.' },
            {
              kind: 'table',
              columns: ['', 'Autopilot', 'Standard'],
              rows: [
                ['Nodes', 'Provisioned, upgraded and secured by Google; not shown as node pools for you to manage', 'You create node pools, choose machine types, set up autoscaling'],
                ['You pay for', 'The CPU, memory and disk your Pods **request**', 'The node VMs, used or not'],
                ['Location', 'Always regional', 'Zonal or regional'],
                ['Release channel', 'Required', 'Optional'],
                ['Default security', 'Hardened: no privileged Pods, no SSH to nodes, Workload Identity Federation for GKE always on', 'Can be made just as strict, but you do it'],
                ['Customisation', 'Through compute classes (e.g. Balanced, Scale-Out, GPU)', 'Anything: privileged DaemonSets, kernel tuning, Ubuntu nodes'],
                ['SLA', 'Control plane and Pods (multi-zone)', 'Control plane (regional 99.95%, zonal 99.5%)'],
                ['Good for', 'The default for most new workloads, small teams without Kubernetes ops', 'Special node needs, per-node licences, privileged security agents']
              ]
            },
            {
              kind: 'list',
              items: [
                'Both modes pay a per-hour cluster management fee; a monthly free credit covers one zonal or Autopilot cluster per billing account.',
                'In Autopilot, Pods without `resources.requests` get defaults from GKE, and requests that are too small are raised to the minimum. Write your own requests so cost and scheduling are predictable.',
                'Autopilot is still ordinary Kubernetes: the same manifests, kubectl, Helm and Services work. The only difference is who looks after the nodes.'
              ]
            }
          ]
        },
        {
          id: 'create',
          title: 'Creating both and connecting kubectl',
          blocks: [
            {
              kind: 'code',
              title: 'Autopilot',
              lines: [
                '$ gcloud container clusters create-auto shop-auto --region=us-central1',
                'Creating cluster shop-auto in us-central1... Cluster is being health-checked (Kubernetes Control Plane is healthy)...done.',
                'Created [https://container.googleapis.com/v1/projects/ace-lab-123/zones/us-central1/clusters/shop-auto].',
                'kubeconfig entry generated for shop-auto.',
                'NAME       LOCATION     MASTER_VERSION      MASTER_IP     MACHINE_TYPE  NODE_VERSION        NUM_NODES  STATUS',
                'shop-auto  us-central1  1.34.1-gke.1080000  34.70.12.9    e2-small      1.34.1-gke.1080000  3          RUNNING'
              ]
            },
            {
              kind: 'code',
              title: 'Standard zonal, then fetch credentials',
              lines: [
                '$ gcloud container clusters create shop-std --zone=us-central1-a --num-nodes=3 --machine-type=e2-medium',
                '$ gcloud container clusters get-credentials shop-std --zone=us-central1-a',
                'Fetching cluster endpoint and auth data.',
                'kubeconfig entry generated for shop-std.',
                '$ kubectl config current-context',
                'gke_ace-lab-123_us-central1-a_shop-std'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Minimize operational overhead", "don\'t want to manage nodes", "pay only for running Pods" → Autopilot. "Need to run privileged DaemonSets / specific node configuration" → Standard. "How many nodes are created" for a regional cluster is always counted per zone.'
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'kubectl',
      title: 'kubectl',
      sections: [
        {
          id: 'connect',
          title: 'Connecting kubectl to a cluster',
          blocks: [
            {
              kind: 'p',
              text: '`kubectl` reads `~/.kube/config` (the kubeconfig). It lists **clusters** (API server addresses), **users** (how to authenticate) and **contexts** (a cluster + user + default namespace). `gcloud container clusters get-credentials` writes one context for a GKE cluster; it authenticates through the `gke-gcloud-auth-plugin` with your gcloud credentials, so your access is still decided by IAM.'
            },
            {
              kind: 'code',
              lines: [
                '$ kubectl get pods',
                'The connection to the server localhost:8080 was refused - did you specify the right host or port?',
                '# no kubeconfig yet — run get-credentials first',
                '$ kubectl config get-contexts',
                'CURRENT   NAME                                     CLUSTER                                  AUTHINFO   NAMESPACE',
                '*         gke_ace-lab-123_us-central1-a_shop-std   gke_ace-lab-123_us-central1-a_shop-std   …          default',
                '          gke_ace-lab-123_us-central1_shop-auto    gke_ace-lab-123_us-central1_shop-auto    …',
                '$ kubectl config use-context gke_ace-lab-123_us-central1_shop-auto',
                'Switched to context "gke_ace-lab-123_us-central1_shop-auto".',
                '$ kubectl config set-context --current --namespace=shop',
                'Context "gke_ace-lab-123_us-central1_shop-auto" modified.'
              ]
            }
          ]
        },
        {
          id: 'anatomy',
          title: 'Anatomy of a kubectl command',
          blocks: [
            {
              kind: 'p',
              text: 'Almost every command has the shape `kubectl [command] [TYPE] [NAME] [flags]`. TYPE can be singular, plural or short (`pod`, `pods`, `po`; `deployment`, `deploy`; `service`, `svc`), and `TYPE NAME` can be written `TYPE/NAME`.'
            },
            {
              kind: 'table',
              columns: ['Group', 'Command', 'What it does'],
              mono: [1],
              rows: [
                ['Look', 'kubectl get pods -o wide', 'List Pods with their IPs and nodes'],
                ['', 'kubectl get all -n shop', 'Pods, Services, Deployments, ReplicaSets in one namespace'],
                ['', 'kubectl describe pod POD', 'Details + **Events** (why Pending, pull failures, failing probes)'],
                ['Change', 'kubectl apply -f FILE.yaml', 'Create/update from a manifest (declarative)'],
                ['', 'kubectl scale deployment web --replicas=5', 'Change the number of Pods'],
                ['', 'kubectl set image deployment/web web=IMAGE:v2', 'Rolling update to a new image'],
                ['', 'kubectl rollout undo deployment/web', 'Go back to the previous revision'],
                ['Debug', 'kubectl logs POD -f / --previous', 'Container logs (the running one / the one that crashed before)'],
                ['', 'kubectl exec -it POD -- sh', 'A shell inside the container'],
                ['', 'kubectl port-forward POD 8080:8080', 'Try a Pod from your laptop without exposing it to the internet'],
                ['Nodes', 'kubectl cordon / drain / uncordon NODE', 'Empty a node for maintenance']
              ]
            },
            {
              kind: 'list',
              items: [
                '`-o yaml` shows the whole object including `status` — the source of truth about what is happening.',
                '`-o jsonpath=\'{.items[*].status.podIP}\'` pulls out one field for scripts.',
                '`-l app=web` selects by label; `-A` looks at every namespace; `-w` watches changes live.',
                '`--dry-run=client -o yaml` turns an imperative command into a manifest — a quick way to write your first YAML.'
              ]
            }
          ]
        },
        {
          id: 'lifecycle-cmds',
          title: 'Deploy, expose, scale and update — end to end',
          blocks: [
            {
              kind: 'code',
              lines: [
                '$ kubectl create deployment web --image=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1 --replicas=3',
                'deployment.apps/web created',
                '$ kubectl get pods',
                'NAME                   READY   STATUS    RESTARTS   AGE',
                'web-7d4b9c8f6d-abcde   1/1     Running   0          20s',
                'web-7d4b9c8f6d-fghij   1/1     Running   0          20s',
                'web-7d4b9c8f6d-klmno   1/1     Running   0          20s',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                'service/web exposed',
                '$ kubectl autoscale deployment web --min=3 --max=10 --cpu=60%',
                'horizontalpodautoscaler.autoscaling/web autoscaled',
                '$ kubectl set image deployment/web web=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v2',
                'deployment.apps/web image updated',
                '$ kubectl rollout status deployment/web',
                'Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...',
                'deployment "web" successfully rolled out',
                '$ kubectl rollout history deployment/web',
                'REVISION  CHANGE-CAUSE',
                '1         <none>',
                '2         <none>'
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              title: 'Three different kinds of scaling',
              text: '`kubectl scale` changes the number of **Pods** once. A HorizontalPodAutoscaler (`kubectl autoscale`) changes the number of Pods **automatically** from CPU/memory. The **cluster autoscaler** (`gcloud container clusters update … --enable-autoscaling`) adds and removes **nodes** when Pods do not fit. `gcloud container clusters resize` changes the number of nodes once. In Autopilot, nodes are entirely automatic.'
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'kubectl 1.34 writes the CPU target as `--cpu=60%`. Older material uses `--cpu-percent=60`; it still works but prints a deprecation warning.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'introspection',
      title: 'Introspection',
      sections: [
        {
          id: 'status',
          title: 'Reading a Pod\'s status',
          blocks: [
            {
              kind: 'p',
              text: '"Introspection" means looking inside: gathering information about running objects to understand why they behave the way they do. It always starts with the Pod status, which has three layers: the Pod **phase**, the **state** of each container (with a **reason**), and the **conditions**.'
            },
            { kind: 'figure', svg: FIG_LIFECYCLE, caption: 'There are only five Pod phases. The most useful detail is in the container state and its reason.' },
            {
              kind: 'table',
              caption: 'The reasons you will see most in the STATUS column',
              columns: ['STATUS', 'Meaning', 'First step'],
              rows: [
                ['`Pending`', 'No node fits yet, or waiting for a volume', '`kubectl describe pod` → look for `FailedScheduling` in Events'],
                ['`ContainerCreating`', 'Pulling the image / mounting volumes', 'Wait; if it takes long, `describe` to check volumes and the image'],
                ['`ImagePullBackOff` / `ErrImagePull`', 'The image cannot be pulled: wrong name/tag or no permission', '`describe` → the "Failed to pull image" message'],
                ['`CrashLoopBackOff`', 'The container starts and dies over and over; the restart delay keeps growing', '`kubectl logs POD --previous`'],
                ['`OOMKilled`', 'The container went over its memory limit', '`describe` → Last State: Terminated, Reason: OOMKilled, Exit Code 137'],
                ['`Running` but READY `0/1`', 'The container runs but its readiness probe fails — it gets no traffic', '`describe` → "Readiness probe failed" in Events'],
                ['`Completed`', 'The container finished with exit code 0 (normal for a Job)', 'Nothing, unless it was meant to keep running']
              ]
            },
            {
              kind: 'code',
              title: 'kubectl describe pod — the parts to read',
              lines: [
                '$ kubectl describe pod web-7d4b9c8f6d-abcde',
                'Name:         web-7d4b9c8f6d-abcde',
                'Namespace:    default',
                'Node:         gke-shop-std-default-pool-1a2b/10.128.0.4',
                'Status:       Running',
                'Containers:',
                '  web:',
                '    Image:          us-central1-docker.pkg.dev/ace-lab-123/apps/web:v2',
                '    State:          Running',
                '    Last State:     Terminated',
                '      Reason:       OOMKilled',
                '      Exit Code:    137',
                '    Restart Count:  4',
                '    Limits:         memory: 512Mi',
                'Conditions:',
                '  Type              Status',
                '  Ready             False',
                'Events:',
                '  Type     Reason   Age   From     Message',
                '  ----     ------   ----  ----     -------',
                '  Warning  BackOff  12s   kubelet  Back-off restarting failed container web in pod web-7d4b9c8f6d-abcde'
              ]
            }
          ]
        },
        {
          id: 'tools',
          title: 'Introspection tools, and the order to use them in',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'The big picture', text: 'What exists and what state it is in.', code: ['kubectl get pods -o wide', 'kubectl get deploy,svc,hpa'] },
                { title: 'Details and Events', text: 'Almost every scheduling, image, volume and probe problem is written in the Events.', code: ['kubectl describe pod POD', 'kubectl get events --sort-by=.metadata.creationTimestamp'] },
                { title: 'Application logs', text: 'For errors inside the application. `--previous` for a container that already died; `-c` to pick a container in a multi-container Pod.', code: ['kubectl logs POD', 'kubectl logs POD --previous', 'kubectl logs -l app=web --tail=50'] },
                { title: 'Step inside', text: 'Check config, files, DNS and connections from the Pod\'s point of view.', code: ['kubectl exec -it POD -- sh', 'kubectl port-forward svc/web 8080:80'] },
                { title: 'Resource usage', text: 'Is a Pod close to its limits, which node is full.', code: ['kubectl top pods', 'kubectl top nodes'] },
                { title: 'The full state', text: 'The raw object status: conditions, IPs, start times.', code: ['kubectl get pod POD -o yaml'] }
              ]
            },
            {
              kind: 'p',
              text: 'Outside kubectl, GKE sends container logs (stdout/stderr) and system logs to **Cloud Logging**, and metrics to **Cloud Monitoring**, by default. The Workloads page in the Console shows the same things as `describe`, and Logs Explorer can filter by namespace, Pod or container — useful for Pods that have already been deleted and can no longer be read with `logs`.'
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Pod is in Pending state, how to find out why" → `kubectl describe pod`. "Application in the Pod is crashing, see the error" → `kubectl logs` (with `--previous` for a crash). "View logs of Pods that were deleted" → Cloud Logging.'
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'cases',
      title: 'Case studies',
      sections: [
        {
          id: 'case-first-deploy',
          title: 'Case 1 — First deployment to Autopilot',
          blocks: [
            {
              kind: 'case',
              title: 'From source code to something you can open in a browser',
              situation: 'A team has a Python web app with a Dockerfile. They want to run it on GKE without managing nodes, reachable from the internet.',
              diagnose: [
                'Pick the mode: no node management wanted → **Autopilot**.',
                'Store the image in Artifact Registry; build it with Cloud Build so no local Docker is needed.',
                'A stateless app → **Deployment**; exposed to the internet → a **LoadBalancer Service** (or an Ingress later, when it needs HTTPS and several paths).'
              ],
              fix: [
                '$ gcloud artifacts repositories create apps --repository-format=docker --location=us-central1',
                '$ gcloud builds submit --tag=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '$ gcloud container clusters create-auto shop --region=us-central1',
                '$ gcloud container clusters get-credentials shop --region=us-central1',
                '$ kubectl create deployment web --image=us-central1-docker.pkg.dev/ace-lab-123/apps/web:v1',
                '$ kubectl expose deployment web --type=LoadBalancer --port=80 --target-port=8080',
                '$ kubectl get service web -w',
                'web    LoadBalancer   10.12.5.140   34.70.88.21   80:31234/TCP   75s',
                '$ curl http://34.70.88.21/'
              ],
              why: 'The order is always: image → cluster → kubectl credentials → workload → Service. On Autopilot the first Pod may sit in Pending briefly while Google brings up capacity; that is normal.',
              exam: 'Questions often shuffle these steps, or leave out `get-credentials` so kubectl is not connected.'
            }
          ]
        },
        {
          id: 'case-pending',
          title: 'Case 2 — Pods stuck in Pending',
          blocks: [
            {
              kind: 'case',
              title: 'A Deployment scaled to 10, but 4 Pods never start',
              situation: 'A Standard cluster with one node pool of 3 e2-medium nodes and no cluster autoscaler. The team raised replicas to 10.',
              symptom: [
                '$ kubectl get pods',
                'NAME                   READY   STATUS    RESTARTS   AGE',
                'web-7d4b9c8f6d-q8m4n   0/1     Pending   0          4m',
                '$ kubectl describe pod web-7d4b9c8f6d-q8m4n',
                'Events:',
                '  Warning  FailedScheduling  4m  default-scheduler  0/3 nodes are available: 3 Insufficient cpu.'
              ],
              diagnose: [
                'Pending = the scheduler found no node. The Events message gives the reason: **Insufficient cpu**.',
                'The scheduler looks at **requests**, not actual usage: 10 Pods × 500m CPU do not fit on 3 × e2-medium.',
                'Other reasons you may see: `didn\'t match Pod\'s node affinity/selector`, `had untolerated taint`, or `pod has unbound immediate PersistentVolumeClaims`.'
              ],
              fix: [
                '# Option A: let GKE add nodes itself',
                '$ gcloud container clusters update shop-std --zone=us-central1-a --enable-autoscaling --node-pool=default-pool --min-nodes=3 --max-nodes=8',
                '# Option B: add nodes by hand',
                '$ gcloud container clusters resize shop-std --zone=us-central1-a --node-pool=default-pool --num-nodes=5',
                '# Option C: the requests really are too big — lower them in the manifest and apply again'
              ],
              why: 'An HPA or `kubectl scale` only adds Pods; when the nodes are full, new Pods stay Pending. What adds nodes is the cluster autoscaler (or you, with resize). On Autopilot this case solves itself because Google adds capacity.',
              exam: '"Pods remain Pending after HPA scales out" → enable the cluster autoscaler on the node pool.'
            }
          ]
        },
        {
          id: 'case-crashloop',
          title: 'Case 3 — CrashLoopBackOff',
          blocks: [
            {
              kind: 'case',
              title: 'The new version keeps restarting',
              situation: 'After deploying image v2, Pods show CrashLoopBackOff and RESTARTS keeps climbing.',
              symptom: [
                '$ kubectl get pods',
                'NAME                   READY   STATUS             RESTARTS      AGE',
                'web-5c9f8d7b6-klmno    0/1     CrashLoopBackOff   5 (40s ago)   6m'
              ],
              diagnose: [
                'The container ran and then died. The logs of a container that **already died** are read with `--previous`.',
                '`kubectl logs web-5c9f8d7b6-klmno --previous` → for example `KeyError: DATABASE_URL` (a missing environment variable) or an application stack trace.',
                'If the log is empty, `describe` → Last State: Terminated, **Reason: OOMKilled, Exit Code: 137** means it went over its memory limit. Exit Code 1 is usually an application error.'
              ],
              fix: [
                '# Missing env var: provide it from a ConfigMap/Secret, then restart',
                '$ kubectl create configmap web-config --from-literal=DATABASE_URL=postgres://10.40.0.3/app',
                '# (add envFrom: configMapRef web-config to the manifest, then kubectl apply)',
                '# OOMKilled: raise the memory limit in the manifest, or fix the memory leak',
                '# In an emergency: go back to the healthy version',
                '$ kubectl rollout undo deployment/web'
              ],
              why: 'CrashLoopBackOff is a symptom, not a cause: the kubelet waits longer each time before trying again. The cause is almost always in the previous container\'s logs or in Last State.',
              exam: '"View the logs of the previous instance of a container" → `kubectl logs POD --previous`.'
            }
          ]
        },
        {
          id: 'case-imagepull',
          title: 'Case 4 — ImagePullBackOff',
          blocks: [
            {
              kind: 'case',
              title: 'The Pod never starts because the image cannot be pulled',
              situation: 'A new Deployment on a Standard cluster with private nodes; the image lives in Artifact Registry in another project.',
              symptom: [
                '$ kubectl describe pod api-6d8f7c9b5-x2k4p',
                'Events:',
                '  Warning  Failed   20s  kubelet  Failed to pull image "us-central1-docker.pkg.dev/shared-images/apps/api:v3": … 403 Forbidden',
                '  Warning  Failed   20s  kubelet  Error: ErrImagePull',
                '  Normal   BackOff  5s   kubelet  Back-off pulling image …'
              ],
              diagnose: [
                '**403 Forbidden** → a permissions problem: the node service account may not read that repository.',
                '**not found / manifest unknown** → a typo in the image name or tag.',
                '**i/o timeout** to a registry on the internet (e.g. Docker Hub) from private nodes → there is no Cloud NAT.'
              ],
              fix: [
                '$ gcloud artifacts repositories add-iam-policy-binding apps --project=shared-images --location=us-central1 \\',
                '    --member=serviceAccount:gke-nodes@ace-lab-123.iam.gserviceaccount.com --role=roles/artifactregistry.reader',
                '# Wrong tag: fix the image in the manifest and kubectl apply again',
                '# Docker Hub from private nodes: add Cloud NAT in the cluster region, or copy the image into Artifact Registry'
              ],
              why: 'The node (kubelet) pulls the image, using the node service account — not the Pod\'s identity and not your account. That is why the permission has to go to the node service account.',
              exam: '"GKE cannot pull images from Artifact Registry in another project" → give the node service account `roles/artifactregistry.reader`.'
            }
          ]
        },
        {
          id: 'case-service',
          title: 'Case 5 — The Service exists, but the app is unreachable',
          blocks: [
            {
              kind: 'case',
              title: 'EXTERNAL-IP is there, but curl times out or gets a 502',
              situation: 'The LoadBalancer Service has a public IP. The Pods are Running. But requests to that IP are never answered.',
              symptom: ['$ kubectl get endpoints web', 'NAME   ENDPOINTS   AGE', 'web    <none>      5m'],
              diagnose: [
                'Empty endpoints means **the Service selector matches no Pod labels** at all.',
                'Compare `kubectl describe svc web` (Selector: `app=web`) with `kubectl get pods --show-labels` (which turn out to be `app=web-app`).',
                'If endpoints are filled in but it still fails: check that `targetPort` is the port the container listens on, and that the readiness probe is not failing (Pods that are not Ready are taken out of the endpoints).',
                'If EXTERNAL-IP stays `<pending>` for long: look at `kubectl describe svc web` → Events (for example an exhausted IP quota).'
              ],
              fix: [
                '# Make the labels match: fix the Service selector or the Pod template labels, then apply',
                '$ kubectl get endpoints web',
                'NAME   ENDPOINTS                                       AGE',
                'web    10.40.0.12:8080,10.40.1.7:8080,10.40.2.3:8080   6m',
                '# Test from inside the cluster without the load balancer',
                '$ kubectl port-forward svc/web 8080:80'
              ],
              why: 'A Service does not know Pod names; it just runs its selector over labels. One character off in a label leaves the Service "empty" while everything looks healthy.',
              exam: '"Pods are running but the Service returns no response" is almost always about selectors/labels or targetPort.'
            }
          ]
        },
        {
          id: 'case-rollback',
          title: 'Case 6 — An update fails halfway',
          blocks: [
            {
              kind: 'case',
              title: 'The rolling update is stuck; get the old version back fast',
              situation: 'The team ran `kubectl set image` to a v3 tag that does not exist. The rollout never finishes.',
              symptom: [
                '$ kubectl rollout status deployment/web',
                'Waiting for deployment "web" rollout to finish: 1 out of 3 new replicas have been updated...',
                '$ kubectl get pods',
                'web-7d4b9c8f6d-abcde   1/1   Running            0   2h',
                'web-7d4b9c8f6d-fghij   1/1   Running            0   2h',
                'web-84f6c7d9b-zz9q1    0/1   ImagePullBackOff   0   3m'
              ],
              diagnose: [
                'The default rolling update (`maxUnavailable: 25%`, `maxSurge: 25%`) only stops old Pods once new Pods are Ready — which is why two old Pods are still serving. That is what makes rolling updates safe.',
                '`kubectl rollout history deployment/web` shows the revisions available.'
              ],
              fix: ['$ kubectl rollout undo deployment/web', 'deployment.apps/web rolled back', '# or to a specific revision:', '$ kubectl rollout undo deployment/web --to-revision=2'],
              why: 'Every change to the Pod template creates a new ReplicaSet; the old ReplicaSet is kept at 0 replicas. Undo just scales the old ReplicaSet back up — fast, with no rebuild.',
              exam: '"Quickly revert a Deployment to the previous version" → `kubectl rollout undo`.'
            }
          ]
        },
        {
          id: 'case-scale',
          title: 'Case 7 — A traffic spike',
          blocks: [
            {
              kind: 'case',
              title: 'Noon promotion: traffic up 5×',
              situation: 'An online shop on GKE Standard. During a promotion the web Pods sit at 95% CPU and responses slow down. The team wants automatic scaling: up when it is busy, back down afterwards.',
              diagnose: [
                'Two layers of scaling: **Pods** (HPA) and **nodes** (cluster autoscaler). An HPA without the cluster autoscaler leaves new Pods Pending once nodes are full (Case 2).',
                'The HPA needs CPU `requests` on the container, because the percentage is measured against requests.',
                'A VerticalPodAutoscaler helps find the right requests, but do not use it alongside an HPA on the same CPU/memory metrics.'
              ],
              fix: [
                '$ kubectl autoscale deployment web --min=3 --max=30 --cpu=60%',
                '$ gcloud container clusters update shop-std --zone=us-central1-a --enable-autoscaling --node-pool=default-pool --min-nodes=3 --max-nodes=15',
                '$ kubectl get hpa',
                'NAME   REFERENCE        TARGETS       MINPODS   MAXPODS   REPLICAS   AGE',
                'web    Deployment/web   cpu: 58%/60%  3         30        14         20m'
              ],
              why: 'The HPA adds Pods when average CPU passes the target; Pods that do not fit make the cluster autoscaler add nodes; when it is quiet both come back down. On Autopilot the HPA is enough — node capacity follows automatically.',
              exam: 'The classic distinction: `kubectl scale`/HPA = Pods, cluster autoscaler/`clusters resize` = nodes.'
            }
          ]
        },
        {
          id: 'case-wi',
          title: 'Case 8 — The app needs to read Cloud Storage',
          blocks: [
            {
              kind: 'case',
              title: 'No keys, least privilege',
              situation: 'The `report` service in the `shop` namespace needs to read files from the bucket `ace-assets-123`. A developer plans to create a JSON service account key and keep it in a Secret.',
              diagnose: [
                'A JSON key is a long-lived credential that can leak; many organisations block creating them.',
                'Granting the role to the node service account gives **every** Pod on that node access too — against least privilege.',
                'The right way: **Workload Identity Federation for GKE** — the role goes to that application\'s KSA identity only.'
              ],
              fix: [
                '$ kubectl create serviceaccount report-ksa -n shop',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-assets-123 --role=roles/storage.objectViewer \\',
                '    --member="principal://iam.googleapis.com/projects/123456789012/locations/global/workloadIdentityPools/ace-lab-123.svc.id.goog/subject/ns/shop/sa/report-ksa"',
                '# in the report Deployment: spec.template.spec.serviceAccountName: report-ksa',
                '$ kubectl rollout restart deployment/report -n shop'
              ],
              why: 'Google client libraries in the Pod pick up a token from the GKE metadata server automatically; the application code does not change at all and no secret is stored.',
              exam: '"Store a service account key as a Kubernetes Secret" is almost always wrong; "use Workload Identity Federation for GKE" is almost always right.'
            }
          ]
        },
        {
          id: 'case-maintenance',
          title: 'Case 9 — Node maintenance without downtime',
          blocks: [
            {
              kind: 'case',
              title: 'Emptying one node safely',
              situation: 'One node in a Standard cluster has to go (for example, to move to another machine type through a new node pool). The application must not go down.',
              diagnose: [
                '`cordon` stops new Pods from being placed on the node; `drain` evicts the existing Pods so they are rescheduled on other nodes.',
                'GKE nodes always run system DaemonSets (logging, metrics, CSI), so `drain` needs `--ignore-daemonsets`.',
                'A **PodDisruptionBudget** (e.g. `minAvailable: 2`) makes the drain wait so replicas never drop below the limit.'
              ],
              fix: [
                '$ kubectl cordon gke-shop-std-default-pool-1a2b',
                'node/gke-shop-std-default-pool-1a2b cordoned',
                '$ kubectl drain gke-shop-std-default-pool-1a2b --ignore-daemonsets --delete-emptydir-data',
                'evicting pod default/web-7d4b9c8f6d-abcde',
                'pod/web-7d4b9c8f6d-abcde evicted',
                'node/gke-shop-std-default-pool-1a2b drained',
                '$ kubectl uncordon gke-shop-std-default-pool-1a2b   # if the node is used again'
              ],
              why: 'GKE automatic upgrades do the same for every node (surge upgrades) and also respect PodDisruptionBudgets — which is why PDBs matter for production apps.',
              exam: '"Safely evict all Pods from a node before maintenance" → `kubectl drain`.'
            }
          ]
        }
      ]
    },

    // ── 8 ─────────────────────────────────────────────────────────────────
    {
      id: 'check',
      title: 'Check yourself',
      sections: [
        {
          id: 'quiz',
          title: 'Ten quick questions',
          blocks: [
            {
              kind: 'quiz',
              q: 'A company wants to run container apps on Kubernetes without managing nodes at all, paying only for the resources Pods use. Which mode?',
              options: ['GKE Standard with the cluster autoscaler', 'GKE Autopilot', 'Cloud Run', 'Compute Engine with a managed instance group'],
              answer: 1,
              explain: 'Autopilot: Google manages the nodes, and you are billed for Pod requests. Cloud Run has no nodes either, but the question says Kubernetes.'
            },
            {
              kind: 'quiz',
              q: '`gcloud container clusters create web --region=us-central1 --num-nodes=2` — how many nodes are created (the region has 3 zones)?',
              options: ['2', '3', '6', '1'],
              answer: 2,
              explain: 'In a regional cluster `--num-nodes` is per zone: 2 × 3 zones = 6 nodes.'
            },
            {
              kind: 'quiz',
              q: 'A Pod is Pending. What is the first command to find out why?',
              options: ['kubectl logs POD', 'kubectl describe pod POD', 'kubectl exec -it POD -- sh', 'kubectl top pod POD'],
              answer: 1,
              explain: 'A Pending Pod has never run, so there are no logs yet. The reason (Insufficient cpu, a taint, a PVC) is in the Events shown by describe.'
            },
            {
              kind: 'quiz',
              q: 'A container keeps restarting (CrashLoopBackOff). How do you see the error from the container that just died?',
              options: ['kubectl logs POD --previous', 'kubectl get pod POD -o wide', 'kubectl rollout status deployment/web', 'kubectl get events -A'],
              answer: 0,
              explain: '`--previous` shows the logs of the previous container instance, the one that crashed. The log of a container that is just starting is often still empty.'
            },
            {
              kind: 'quiz',
              q: 'A log-collecting agent must run exactly once on every node, including new nodes. Which object?',
              options: ['A Deployment with replicas = number of nodes', 'StatefulSet', 'DaemonSet', 'CronJob'],
              answer: 2,
              explain: 'A DaemonSet runs one Pod per node and adds Pods automatically as nodes are added.'
            },
            {
              kind: 'quiz',
              q: 'The HPA raises the number of Pods, but the new Pods stay Pending because the nodes are full. What needs turning on?',
              options: ['VerticalPodAutoscaler', 'The cluster autoscaler on the node pool', 'kubectl scale with more replicas', 'The rapid release channel'],
              answer: 1,
              explain: 'The cluster autoscaler adds nodes when there are Pods that cannot be scheduled. The HPA and kubectl scale only deal with Pods.'
            },
            {
              kind: 'quiz',
              q: 'A Pod needs to read a Cloud Storage bucket following best practice. How?',
              options: [
                'Store a service account JSON key in a Kubernetes Secret',
                'Give roles/storage.admin to the node service account',
                'Use Workload Identity Federation for GKE: grant the role to the app\'s KSA identity',
                'Make the bucket public'
              ],
              answer: 2,
              explain: 'Workload Identity Federation for GKE gives a short-lived token to one particular KSA — no keys, and only that Pod gets access.'
            },
            {
              kind: 'quiz',
              q: 'A LoadBalancer Service has an EXTERNAL-IP and the Pods are Running, but `kubectl get endpoints web` shows `<none>`. The most likely cause?',
              options: ['The IP quota is exhausted', 'The Service selector does not match the Pod labels', 'The cluster autoscaler is off', 'The release channel is too old'],
              answer: 1,
              explain: 'Empty endpoints = no (Ready) Pod matches the Service selector.'
            },
            {
              kind: 'quiz',
              q: 'A new image version breaks the app in production. What is the fastest way back to the previous version?',
              options: ['Delete the Deployment and create it again', 'kubectl rollout undo deployment/web', 'gcloud container clusters upgrade --master', 'kubectl delete pods --all'],
              answer: 1,
              explain: 'Undo scales the previous revision\'s ReplicaSet back up — no rebuild, using a rolling update.'
            },
            {
              kind: 'quiz',
              q: 'In Cloud Shell, `kubectl get pods` answers "The connection to the server localhost:8080 was refused". What was forgotten?',
              options: ['gcloud container clusters get-credentials', 'gcloud services enable container.googleapis.com', 'kubectl apply -f', 'gcloud auth configure-docker'],
              answer: 0,
              explain: 'Without a kubeconfig, kubectl tries localhost:8080. get-credentials writes a context for the GKE cluster.'
            }
          ]
        }
      ]
    }
  ]
};
