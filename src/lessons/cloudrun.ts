/**
 * Cloud Run — the deep-dive lesson. Follows the life of a container on the
 * platform: what you hand over, how a service is modelled, what happens to an
 * instance from start to stop, how it scales, how releases move traffic, and
 * who may reach it. Built from the "Fundamentals of Cloud Run" module (overview,
 * resource model, container lifecycle, autoscaling, access control), updated to
 * current names — request-based and instance-based billing, Direct VPC egress.
 */
import type { Lesson, ScaleInput } from '@/types';

const SVG = (label: string, w: number, h: number, body: string) =>
  `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}" style="font: 13px var(--font); letter-spacing: 0">
  <defs>
    <marker id="run-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor"/>
    </marker>
  </defs>${body}
</svg>`;

const MINT = 'style="fill: var(--mint)" stroke="currentColor" stroke-width="1.5"';
const ON = 'style="fill: #1a1a1a"';
const ON_SM = 'style="fill: #1a1a1a; font-size: 12px"';
const BOX = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const LINE = 'fill="none" stroke="currentColor" stroke-width="1.5"';
const A = 'marker-end="url(#run-arrow)"';
const SM = 'style="font-size: 12px"';

const FIG_CONTRACT = SVG(
  'A client sends HTTPS to the run.app endpoint; Cloud Run handles TLS and forwards HTTP to port 8080 of your container',
  720,
  220,
  `
  <rect x="16" y="70" width="156" height="60" rx="6" ${BOX}/>
  <rect x="216" y="56" width="180" height="88" rx="8" ${MINT}/>
  <rect x="488" y="36" width="216" height="128" rx="8" ${BOX} stroke-dasharray="6 4"/>
  <rect x="504" y="66" width="184" height="36" rx="5" ${BOX}/>
  <rect x="504" y="112" width="184" height="36" rx="5" ${BOX}/>
  <path d="M172,100 L214,100" ${LINE} ${A}/>
  <path d="M396,100 L486,100" ${LINE} ${A}/>
  <path d="M16,170 L396,170 M16,164 L16,176 M396,164 L396,176" ${LINE} opacity="0.5"/>
  <path d="M488,170 L704,170 M488,164 L488,176 M704,164 L704,176" ${LINE} opacity="0.5"/>
  <g fill="currentColor" text-anchor="middle">
    <text x="94" y="97" font-weight="600">Client</text>
    <text x="94" y="115" opacity="0.7" ${SM}>browser, app, service</text>
    <text x="193" y="90" ${SM}>HTTPS</text>
    <text x="306" y="86" ${ON} font-weight="600">Cloud Run</text>
    <text x="306" y="106" ${ON_SM}>*.run.app · TLS · HTTP/2</text>
    <text x="306" y="124" ${ON_SM}>gRPC · WebSockets</text>
    <text x="441" y="90" ${SM}>HTTP :8080</text>
    <text x="596" y="56" opacity="0.7" ${SM}>revision · instance</text>
    <text x="596" y="89">your container</text>
    <text x="596" y="135">your container</text>
    <text x="206" y="196" ${SM}>Cloud Run handles: endpoint, certificate, load balancing, scaling</text>
    <text x="596" y="196" ${SM}>You handle: code listening on $PORT</text>
  </g>`
);

const FIG_MODEL = SVG(
  'The Cloud Run resource model: a regional service holds revisions; the serving revision has instances. A job holds executions that run several tasks in parallel',
  720,
  300,
  `
  <rect x="16" y="16" width="688" height="268" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="36" y="44" width="320" height="226" rx="8" ${BOX} opacity="0.55"/>
  <rect x="374" y="44" width="310" height="226" rx="8" ${BOX} opacity="0.55"/>
  <rect x="52" y="80" width="288" height="176" rx="6" ${BOX}/>
  <rect x="68" y="114" width="256" height="40" rx="5" ${BOX} opacity="0.6"/>
  <rect x="68" y="164" width="256" height="80" rx="5" ${MINT}/>
  <g fill="#1a1a1a">
    <rect x="80" y="204" width="24" height="24"/><rect x="112" y="204" width="24" height="24"/><rect x="144" y="204" width="24" height="24"/>
  </g>
  <rect x="390" y="80" width="278" height="176" rx="6" ${BOX}/>
  <rect x="406" y="114" width="246" height="130" rx="5" ${MINT}/>
  <g fill="none" stroke="#1a1a1a" stroke-width="1.5">
    <rect x="418" y="146" width="52" height="36"/><rect x="476" y="146" width="52" height="36"/><rect x="534" y="146" width="52" height="36"/><rect x="592" y="146" width="52" height="36"/>
  </g>
  <g fill="currentColor">
    <text x="32" y="36" font-weight="600">Project ace-lab-123</text>
    <text x="52" y="66" opacity="0.75">Region asia-southeast2</text>
    <text x="390" y="66" opacity="0.75">Region us-central1</text>
    <text x="64" y="102" font-weight="600">Service shop · stable URL</text>
    <text x="80" y="139" opacity="0.7">shop-00001-abc · 0% traffic</text>
    <text x="80" y="186" ${ON} font-weight="600">shop-00002-xyz · 100%</text>
    <text x="178" y="221" ${ON_SM}>3 active instances</text>
    <text x="402" y="102" font-weight="600">Job nightly-report</text>
    <text x="418" y="134" ${ON} font-weight="600">Execution 02:00</text>
    <g text-anchor="middle" ${ON_SM}>
      <text x="444" y="168">task 0</text><text x="502" y="168">task 1</text><text x="560" y="168">task 2</text><text x="618" y="168">task 3</text>
      <text x="529" y="208">each task = 1 container, in parallel</text>
      <text x="529" y="226">succeeds when every task succeeds</text>
    </g>
  </g>`
);

const FIG_LIFECYCLE = SVG(
  'The container lifecycle: Starting, Serving, Idle, Shutting down, Stopped. Idle after 100 ms with no requests, back to Serving when a request arrives, SIGTERM gives 10 seconds, a crash or full memory stops it at once',
  720,
  240,
  `
  <rect x="16" y="94" width="128" height="52" rx="8" ${BOX}/>
  <rect x="200" y="30" width="150" height="52" rx="8" ${MINT}/>
  <rect x="200" y="158" width="150" height="52" rx="8" ${BOX}/>
  <rect x="420" y="158" width="150" height="52" rx="8" ${BOX}/>
  <rect x="596" y="94" width="108" height="52" rx="8" ${BOX}/>
  <g ${LINE}>
    <path d="M144,110 C172,96 176,60 198,58" ${A}/>
    <path d="M258,82 L258,156" ${A}/>
    <path d="M292,158 L292,84" ${A}/>
    <path d="M350,184 L418,184" ${A}/>
    <path d="M570,178 C606,174 636,164 646,148" ${A}/>
    <path d="M350,48 C470,38 610,46 646,92" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="80" y="116" font-weight="600">Starting</text>
    <text x="80" y="134" opacity="0.7" ${SM}>app booting</text>
    <text x="275" y="52" ${ON} font-weight="600">Serving</text>
    <text x="275" y="70" ${ON_SM}>full CPU</text>
    <text x="275" y="180" font-weight="600">Idle</text>
    <text x="275" y="198" opacity="0.7" ${SM}>CPU near zero</text>
    <text x="495" y="180" font-weight="600">Shutting down</text>
    <text x="495" y="198" opacity="0.7" ${SM}>cleaning up</text>
    <text x="650" y="125" font-weight="600">Stopped</text>
    <text x="252" y="124" text-anchor="end" ${SM}>quiet 100 ms</text>
    <text x="298" y="124" text-anchor="start" ${SM}>request arrives</text>
    <text x="384" y="176" ${SM}>SIGTERM</text>
    <text x="616" y="200" ${SM}>10 s at most</text>
    <text x="490" y="30" ${SM}>crash / memory full</text>
  </g>`
);

const FIG_IMAGE = SVG(
  'On deploy, Cloud Run copies the image from Artifact Registry into its own internal storage; every new instance pulls from that internal storage',
  720,
  190,
  `
  <rect x="16" y="66" width="170" height="56" rx="6" ${BOX}/>
  <rect x="276" y="66" width="190" height="56" rx="6" ${MINT}/>
  <rect x="556" y="24" width="148" height="36" rx="5" ${BOX}/>
  <rect x="556" y="76" width="148" height="36" rx="5" ${BOX}/>
  <rect x="556" y="128" width="148" height="36" rx="5" ${BOX}/>
  <g ${LINE}>
    <path d="M186,94 L274,94" ${A}/>
    <path d="M466,90 C500,80 520,44 554,42" ${A}/>
    <path d="M466,94 L554,94" ${A}/>
    <path d="M466,98 C500,108 520,144 554,146" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="101" y="91" font-weight="600">Artifact Registry</text>
    <text x="101" y="109" opacity="0.7" ${SM}>your image</text>
    <text x="230" y="84" ${SM}>deploy: copied</text>
    <text x="371" y="91" ${ON} font-weight="600">Internal storage</text>
    <text x="371" y="109" ${ON_SM}>Cloud Run</text>
    <text x="630" y="47">new instance</text>
    <text x="630" y="99">new instance</text>
    <text x="630" y="151">new instance</text>
    <text x="230" y="150" opacity="0.7" ${SM}>large and small images</text>
    <text x="230" y="166" opacity="0.7" ${SM}>load just as fast</text>
  </g>`
);

const sq = (x: number, y: number, kind: 'on' | 'idle' | 'off') =>
  kind === 'on'
    ? `<rect x="${x}" y="${y}" width="40" height="40" fill="currentColor" opacity="0.85"/>`
    : kind === 'idle'
      ? `<rect x="${x}" y="${y}" width="40" height="40" ${MINT}/>`
      : `<rect x="${x}" y="${y}" width="40" height="40" ${BOX} stroke-dasharray="4 4" opacity="0.6"/>`;

const FIG_SCALE = SVG(
  'Autoscaling: requests reach an internal load balancer that spreads them across active instances; idle instances are kept by min instances; new instances can be added up to max instances; requests wait in a queue while no instance is ready',
  720,
  230,
  `
  <g ${LINE}>
    <path d="M16,76 L96,96" ${A}/><path d="M16,104 L96,104" ${A}/><path d="M16,132 L96,112" ${A}/>
    <path d="M170,104 L206,104" ${A}/>
    <path d="M336,90 C350,70 356,66 370,66" ${A}/>
    <path d="M336,100 C352,84 410,80 418,86"/>
    <path d="M336,110 C352,110 452,96 466,86"/>
  </g>
  <rect x="98" y="82" width="72" height="44" rx="5" ${BOX} stroke-dasharray="5 4"/>
  <rect x="208" y="64" width="128" height="80" rx="6" ${MINT}/>
  ${sq(372, 46, 'on')}${sq(420, 46, 'on')}${sq(468, 46, 'on')}${sq(516, 46, 'on')}${sq(564, 46, 'idle')}${sq(612, 46, 'idle')}
  ${sq(372, 118, 'off')}${sq(420, 118, 'off')}${sq(468, 118, 'off')}${sq(516, 118, 'off')}${sq(564, 118, 'off')}${sq(612, 118, 'off')}${sq(660, 118, 'off')}
  <g fill="currentColor">
    <text x="16" y="62" ${SM}>requests</text>
    <text x="134" y="108" text-anchor="middle" ${SM}>queue</text>
    <text x="272" y="98" text-anchor="middle" ${ON} font-weight="600">Load balancer</text>
    <text x="272" y="116" text-anchor="middle" ${ON_SM}>internal</text>
    <text x="372" y="34" ${SM}>active (≤ concurrency requests each)</text>
    <text x="604" y="104" text-anchor="middle" ${SM}>idle · min instances</text>
    <text x="372" y="176" ${SM}>not started — can be added up to max instances</text>
    <text x="360" y="212" text-anchor="middle" opacity="0.7">With no requests at all, every instance is shut down (scale to zero) — except those kept by min instances.</text>
  </g>`
);

const FIG_TRAFFIC = SVG(
  'Traffic splitting: the service URL sends 90 percent to the old revision and 10 percent to the new revision tagged canary; the tag URL goes straight to the canary revision',
  720,
  230,
  `
  <rect x="16" y="84" width="120" height="56" rx="6" ${BOX}/>
  <rect x="196" y="82" width="160" height="60" rx="6" ${MINT}/>
  <rect x="452" y="30" width="252" height="56" rx="6" ${BOX}/>
  <rect x="452" y="118" width="252" height="56" rx="6" ${BOX}/>
  <g ${LINE}>
    <path d="M136,112 L194,112" ${A}/>
    <path d="M356,102 C400,98 410,60 450,58" ${A}/>
    <path d="M356,122 C400,126 410,146 450,146" ${A}/>
    <path d="M600,204 L600,176" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="76" y="117" font-weight="600">Users</text>
    <text x="276" y="108" ${ON} font-weight="600">Service URL</text>
    <text x="276" y="126" ${ON_SM}>traffic split</text>
    <text x="410" y="66" ${SM}>90%</text>
    <text x="410" y="160" ${SM}>10%</text>
    <text x="578" y="55" font-weight="600">shop-00007-plq</text>
    <text x="578" y="73" opacity="0.7" ${SM}>stable version</text>
    <text x="578" y="143" font-weight="600">shop-00008-wfx</text>
    <text x="578" y="161" opacity="0.7" ${SM}>new version · tag canary</text>
    <text x="400" y="218" ${SM}>A tag URL goes straight to that revision: https://canary---shop-…run.app</text>
  </g>`
);

const FIG_VPC = SVG(
  'Cloud Run reaching a VPC: Direct VPC egress puts an interface straight in a subnet (recommended); a Serverless VPC Access connector uses relay VMs in a /28 range',
  720,
  240,
  `
  <rect x="16" y="86" width="150" height="64" rx="6" ${BOX}/>
  <rect x="230" y="36" width="190" height="40" rx="6" ${MINT}/>
  <rect x="230" y="160" width="190" height="40" rx="6" ${BOX} stroke-dasharray="5 4"/>
  <rect x="480" y="24" width="224" height="192" rx="10" ${BOX} stroke-dasharray="7 5"/>
  <rect x="496" y="62" width="192" height="38" rx="5" ${BOX}/>
  <rect x="496" y="112" width="192" height="38" rx="5" ${BOX}/>
  <rect x="496" y="162" width="192" height="38" rx="5" ${BOX}/>
  <g ${LINE}>
    <path d="M166,108 C200,100 204,58 228,56" ${A}/>
    <path d="M420,56 C450,56 456,80 478,84" ${A}/>
    <path d="M166,130 C200,140 204,180 228,180" stroke-dasharray="5 4" ${A}/>
    <path d="M420,180 C450,180 456,170 478,166" stroke-dasharray="5 4" ${A}/>
  </g>
  <g fill="currentColor" text-anchor="middle">
    <text x="91" y="114" font-weight="600">Cloud Run</text>
    <text x="91" y="132" opacity="0.7" ${SM}>service / job</text>
    <text x="325" y="61" ${ON} font-weight="600">Direct VPC egress</text>
    <text x="325" y="96" opacity="0.7" ${SM}>recommended · subnet ≥ /26</text>
    <text x="325" y="185">Connector</text>
    <text x="325" y="222" opacity="0.7" ${SM}>older way · relay VMs in a /28</text>
    <text x="592" y="48" font-weight="600">VPC prod-vpc</text>
    <text x="592" y="86">Memorystore 10.20.0.5</text>
    <text x="592" y="136">Cloud SQL · private IP</text>
    <text x="592" y="186">Internal VM</text>
  </g>`
);

/** Every preset talks to the same small Cloud SQL instance, which takes about 100 connections. */
const S = (rps: number, latencyMs: number, concurrency: number, min: number, max: number, pool: number): ScaleInput => ({
  rps,
  latencyMs,
  concurrency,
  min,
  max,
  pool,
  dbMax: 100
});

const IMG = 'asia-southeast2-docker.pkg.dev/ace-lab-123/apps';
const REGION = '--region=asia-southeast2';

export const lesson: Lesson = {
  id: 'cloud-run',
  lang: 'en',
  title: 'Fundamentals of Cloud Run',
  intro:
    'Cloud Run runs containers with no servers for you to look after: you hand over an image, and Google provides an HTTPS endpoint, starts containers when requests arrive, and adds and removes them as traffic changes. This lesson follows the life of a container on Cloud Run — how its resources are shaped, its lifecycle from start to stop, how it scales, how releases move traffic, and who is allowed to call it. An autoscaling calculator lets you try out concurrency, min and max instances for yourself.',
  practice: [
    { label: 'Terminal: a public Cloud Run service with no cold starts', href: '#/ace/lab/terminal/cloud-run', note: 'deploy, allow-unauthenticated, min instances' },
    { label: 'Command quiz: Cloud Run, functions and App Engine', href: '#/ace/lab/cmd/serverless', note: '21 gcloud run questions' },
    { label: 'Canvas: a serverless online shop', href: '#/ace/lab/canvas/web-serverless', note: 'Cloud Run + database + storage' },
    { label: 'Canvas: CI/CD to Cloud Run', href: '#/ace/lab/canvas/cicd', note: 'Cloud Build → Artifact Registry → Cloud Run' },
    { label: 'Canvas: fix a Pub/Sub push 403', href: '#/ace/lab/canvas/fix-push-403', note: 'run.invoker for the push account' },
    { label: 'Canvas: fix a timeout to Cloud SQL', href: '#/ace/lab/canvas/fix-sql-timeout', note: 'Private connectivity from Cloud Run' },
    { label: 'Canvas: a scheduled daily report', href: '#/ace/lab/canvas/cron', note: 'Cloud Scheduler calling Cloud Run' }
  ],
  parts: [
    // ── 1 ─────────────────────────────────────────────────────────────────
    {
      id: 'intro',
      title: 'What Cloud Run is',
      sections: [
        {
          id: 'what',
          title: 'A simple contract: you bring a container, Google brings the rest',
          blocks: [
            {
              kind: 'p',
              text: '**Cloud Run** is a managed compute platform that runs **containers** directly on Google\'s infrastructure. As long as your application can be packaged as a container image — any language, any framework — it can run on Cloud Run. There are no VMs, nodes or clusters to provision, patch or scale.'
            },
            { kind: 'figure', svg: FIG_CONTRACT, caption: 'The split is clear: Cloud Run provides an HTTPS endpoint with a valid TLS certificate, decrypts requests, and forwards them to the container as HTTP. Your only job is making sure the app listens on the port it is given and answers requests.' },
            {
              kind: 'table',
              columns: ['Cloud Run handles', 'You handle'],
              rows: [
                ['A unique HTTPS endpoint on `*.run.app` (or your own domain), the TLS certificate', 'A container image built for 64-bit Linux'],
                ['Starting containers when requests arrive, shutting them down when it is quiet', 'An app that listens on `$PORT` (8080 by default) on `0.0.0.0`'],
                ['Load balancing and autoscaling to hundreds of instances', 'A **stateless** app — data goes to a database or Cloud Storage, not the container disk'],
                ['Spreading instances across several zones of a region', 'Choosing the region, memory, CPU, concurrency, and who may call it'],
                ['Logs and error reporting to Cloud Logging automatically', 'Writing logs to stdout/stderr']
              ]
            },
            {
              kind: 'callout',
              tone: 'analogy',
              text: 'Cloud Run is like a shared cloud kitchen. You bring a neatly packed recipe (the image). The operator provides the kitchen, the stoves, the till and the couriers. A stove is only lit when an order comes in, more are lit when orders pile up, and they go out when it is quiet — you pay only while a stove is on.'
            },
            {
              kind: 'list',
              items: [
                '**Pay for what you use**: with the default settings, you are only billed while a container is handling requests.',
                '**Every deployment creates a new revision** that cannot be changed — which makes rollbacks and traffic splitting easy.',
                'It works with the rest of Google Cloud: Cloud SQL, Firestore, Cloud Storage, Pub/Sub, Secret Manager, IAM, Cloud Logging.',
                'It supports continuous deployment from repositories such as GitHub through Cloud Build.'
              ]
            }
          ]
        },
        {
          id: 'service-job',
          title: 'Two shapes: services and jobs',
          blocks: [
            {
              kind: 'p',
              text: 'Code on Cloud Run runs either as a **service** or as a **job**. Both use the same environment and the same integrations; the difference is when the code stops.'
            },
            {
              kind: 'table',
              columns: ['', 'Service', 'Job'],
              rows: [
                ['For', 'Code that **answers** web requests or events', 'Code that **does** a piece of work and then finishes'],
                ['Has a URL', 'Yes, a stable HTTPS URL', 'No'],
                ['When it runs', 'When requests arrive; scaled automatically', 'When executed: by hand, on a schedule (Cloud Scheduler), or from Workflows'],
                ['Parallelism', 'Many instances, following traffic', 'One or many parallel **tasks** (an array job)'],
                ['Examples', 'REST API, website, webhook, gRPC microservice', 'Database migration, nightly report, processing thousands of images in a bucket']
              ]
            },
            {
              kind: 'code',
              title: 'A job that processes images with 20 tasks, 5 at a time',
              lines: [
                `$ gcloud run jobs create resize-images --image=${IMG}/resize:1.0 ${REGION} --tasks=20 --parallelism=5 --max-retries=3 --task-timeout=15m`,
                `$ gcloud run jobs execute resize-images ${REGION}`,
                '# inside the container, CLOUD_RUN_TASK_INDEX (0–19) and CLOUD_RUN_TASK_COUNT (20)',
                '# decide which slice of the work that task takes'
              ]
            }
          ]
        },
        {
          id: 'container',
          title: 'What the container needs, and how to deploy it',
          blocks: [
            {
              kind: 'list',
              items: [
                'The image must contain a binary for **64-bit Linux** — and everything the app needs comes with it: code, runtime, libraries, system packages.',
                'The app must **listen on the port in the `PORT` variable** (8080 by default) on `0.0.0.0`, not `localhost`.',
                'Open that port **only once the app is really ready** — as soon as the port accepts connections, Cloud Run starts sending requests.',
                'The container filesystem is writable, but it lives **in memory** (it counts against the memory limit) and is gone when the instance stops.',
                'Images are usually stored in **Artifact Registry**.'
              ]
            },
            {
              kind: 'code',
              title: 'The two most common ways to deploy',
              lines: [
                '# from an image already in Artifact Registry',
                `$ gcloud run deploy shop --image=${IMG}/shop:1.4 ${REGION} --allow-unauthenticated`,
                '# straight from source: Cloud Build builds the image from a Dockerfile or buildpacks',
                `$ gcloud run deploy shop --source=. ${REGION}`,
                'Service [shop] revision [shop-00001-x7d] has been deployed and is serving 100 percent of traffic.',
                'Service URL: https://shop-123456789012.asia-southeast2.run.app'
              ]
            },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Besides gcloud, a service can be created from the Console, from a YAML file (`gcloud run services replace service.yaml`), or with Terraform. **Cloud Run functions** (formerly Cloud Functions) run on Cloud Run too: you just write a function and the image is built for you.'
            }
          ]
        },
        {
          id: 'invoke',
          title: 'Ways to call a service',
          blocks: [
            {
              kind: 'table',
              columns: ['How', 'Good for'],
              rows: [
                ['**HTTPS** to the service URL', 'REST APIs, websites, webhooks, reverse proxies, private microservices'],
                ['**gRPC** (HTTP/2)', 'Fast communication between internal microservices, streaming'],
                ['**WebSockets**', 'Chat, real-time notifications — no extra configuration'],
                ['**Pub/Sub push**', 'Messages delivered as HTTP requests: processing uploads, handling exported logs, your own events'],
                ['**Cloud Scheduler**', 'Like cron: regular backups, regenerating a sitemap, deleting old data, producing invoices'],
                ['**Cloud Tasks**', 'An asynchronous task queue with retries and rate limits'],
                ['**Eventarc**', 'Events from Google services, for example a new object in Cloud Storage or a finished BigQuery job']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Run a containerized task every night at 2 AM" → Cloud Scheduler calls a service or executes a job. "Process each file uploaded to a bucket" → Eventarc (or a Pub/Sub notification) to Cloud Run. "Long-running batch that finishes and exits" → a Cloud Run job, not a service.'
            }
          ]
        },
        {
          id: 'when',
          title: 'When to choose Cloud Run',
          blocks: [
            {
              kind: 'table',
              columns: ['Need', 'Usually the right choice'],
              rows: [
                ['Stateless containers over HTTP or events, traffic that rises and falls, scale to zero wanted', '**Cloud Run**'],
                ['One small function reacting to events, written straight from source', '**Cloud Run functions**'],
                ['Many microservices that need the Kubernetes API, StatefulSets, node control, or special GPUs in a node pool', '**GKE**'],
                ['OS and kernel control, per-VM licensed software, old apps that cannot be containerised', '**Compute Engine**'],
                ['An existing web app that already runs there', 'App Engine (for new work, Cloud Run is preferred)']
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: 'The words "containerized", "stateless", "without managing infrastructure", "scale to zero", "pay only when requests are processed" almost always point to Cloud Run. If you see "needs Kubernetes" or "node-level control", choose GKE.'
            }
          ]
        }
      ]
    },

    // ── 2 ─────────────────────────────────────────────────────────────────
    {
      id: 'model',
      title: 'The resource model',
      sections: [
        {
          id: 'resources',
          title: 'Service, revision, instance — and job, execution, task',
          blocks: [
            { kind: 'figure', svg: FIG_MODEL, caption: 'The service is the main resource and it is regional. Every deployment adds a revision; requests go to the revisions that receive traffic, and each is scaled into a number of instances. Jobs have their own chain: every execution runs all of its tasks.' },
            {
              kind: 'terms',
              items: [
                {
                  term: 'Service',
                  meaning: 'The main Cloud Run resource. It lives in one region and has an HTTPS URL that **stays the same** for as long as the service exists. Everyday work — deploying, rolling back, changing environment variables or scaling — is done on the service.',
                  analogy: 'The name over a shop door; what is inside can change, the address does not.',
                  example: '`shop` in asia-southeast2 with the URL `https://shop-123456789012.asia-southeast2.run.app`.'
                },
                {
                  term: 'Revision',
                  meaning: 'An **unchangeable** snapshot of one container image plus its configuration: environment variables, memory, CPU, concurrency, service account. Every deployment, and every configuration change, creates a new revision.',
                  analogy: 'A book edition: the 2nd edition does not change the 1st, and both stay on the shelf.',
                  example: '`shop-00001-abc`, `shop-00002-xyz`.'
                },
                {
                  term: 'Instance',
                  meaning: 'One running container of a revision. One instance can handle many requests at once, up to its **concurrency** limit.',
                  analogy: 'One cashier who can serve several customers in turn.',
                  example: 'At peak, revision `shop-00002-xyz` has 12 instances; at midnight, none.'
                },
                {
                  term: 'Job · execution · task',
                  meaning: 'A job is regional too. Executing a job creates an **execution**, which runs all of its **tasks**; each task is one container. An execution succeeds only if every task succeeds; failed tasks are retried up to `--max-retries` and bounded by `--task-timeout`.',
                  analogy: 'One shift (the execution) with several workers (the tasks) splitting a pile of work.',
                  example: 'Execution `nightly-report-x8k2p` with 4 tasks.'
                }
              ]
            }
          ]
        },
        {
          id: 'regions',
          title: 'Regional, but resilient to a zone failure',
          blocks: [
            {
              kind: 'p',
              text: 'A region is a geographic location (for example `asia-southeast2` in Jakarta or `us-central1` in Iowa) made of three or more zones. A zone is one failure domain. Cloud Run services are created **per region**, and their instances can start in any zone of that region — a busy service is spread across several zones automatically, so it keeps serving if one zone has problems.'
            },
            {
              kind: 'list',
              items: [
                'One project can have many services in many regions.',
                'Want to serve from **several regions** at once? Deploy the same service to each region and put a **global external Application Load Balancer** with serverless NEGs in front.',
                'Pick a region close to your users and to your database — latency to a Cloud SQL instance in another region is felt on every request.'
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Cloud Run must survive a zone outage" → nothing to do, it is already multi-zone. "Must survive a region outage / serve users globally with one IP" → several regions + a global load balancer.'
            }
          ]
        },
        {
          id: 'settings',
          title: 'The revision settings you will use most',
          blocks: [
            {
              kind: 'table',
              columns: ['Flag', 'Default', 'Limit / notes'],
              mono: [0],
              rows: [
                ['--memory', '512Mi', 'Up to 32Gi; includes files written to the container filesystem'],
                ['--cpu', '1', 'Up to 8'],
                ['--concurrency', '80', '1 to 1000 requests at once per instance'],
                ['--timeout', '300s', 'Up to 3600s per request'],
                ['--min-instances', '0', 'Instances always kept running (billed even when idle)'],
                ['--max-instances', '100', 'Upper limit on the number of instances'],
                ['--port', '8080', 'The port the app opens; passed to the container as `PORT`'],
                ['--set-env-vars / --set-secrets', '—', 'Plain environment variables, or values from Secret Manager'],
                ['--service-account', 'Default compute SA', 'The identity the code uses when it calls Google APIs'],
                ['--cpu-throttling / --no-cpu-throttling', 'throttling', 'Request-based or instance-based billing'],
                ['--cpu-boost', 'off', 'Extra CPU at startup to shorten cold starts']
              ]
            },
            {
              kind: 'code',
              lines: [
                `$ gcloud run services update shop ${REGION} --memory=1Gi --cpu=2 --concurrency=40 --set-env-vars=LOG_LEVEL=info`,
                '# a configuration change creates a new revision too: shop-00003-...'
              ]
            }
          ]
        }
      ]
    },

    // ── 3 ─────────────────────────────────────────────────────────────────
    {
      id: 'lifecycle',
      title: 'The container lifecycle',
      sections: [
        {
          id: 'states',
          title: 'The five states of a container',
          blocks: [
            { kind: 'figure', svg: FIG_LIFECYCLE, caption: 'A container can go back and forth between Serving and Idle many times. It only stops from Idle — or suddenly, if the app crashes or memory fills up.' },
            {
              kind: 'table',
              columns: ['State', 'What happens', 'CPU', 'Billed (request-based)'],
              rows: [
                ['Starting', 'The image becomes a filesystem, the app is started, Cloud Run waits for the port to open', 'Full', 'Yes'],
                ['Serving', 'Handling requests', 'Full', 'Yes'],
                ['Idle', 'No requests for 100 ms', 'Throttled to nearly zero', 'No'],
                ['Shutting down', 'The app receives `SIGTERM` and has 10 seconds to clean up', 'Full', 'Yes'],
                ['Stopped', 'The container is gone', '—', 'No']
              ]
            }
          ]
        },
        {
          id: 'start',
          title: 'Starting: from image to first request',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Materialise the image', text: 'Cloud Run builds the container\'s root filesystem from the image.' },
                { title: 'Run the entrypoint', text: 'The image\'s main program — your app — is started.' },
                { title: 'Wait for the port', text: 'Cloud Run keeps probing port 8080 (or the port you set). You can also add an HTTP, TCP or gRPC **startup probe**, and a **liveness probe** to check containers that are already running.' },
                { title: 'Forward requests', text: 'As soon as the app accepts TCP connections, requests start flowing. So do not open the port before database connections and caches are ready.' }
              ]
            },
            { kind: 'figure', svg: FIG_IMAGE, caption: 'The image is pulled twice, from two different places: once from Artifact Registry at deploy time, then from Cloud Run\'s internal storage every time a new instance starts. A nice side effect: deleting the image from Artifact Registry does not break revisions that already exist.' },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'What makes cold starts slow is usually not the image size but **app initialisation**: loading a large framework, opening connections, reading configuration. Do only what you must at startup, the rest on demand, and consider `--cpu-boost`.'
            }
          ]
        },
        {
          id: 'idle',
          title: 'Idle: cheap, but the CPU almost stops',
          blocks: [
            {
              kind: 'p',
              text: 'After 100 ms with no requests, a container goes **idle**. With the default settings (**request-based billing**), an idle container is not billed, but its CPU is throttled to almost zero, outbound network calls tend to fail, and it can be shut down at any time. Cloud Run may keep idle instances for up to about 15 minutes to meet the next spike without a cold start; when a request comes, the CPU is given back in full at once.'
            },
            {
              kind: 'table',
              caption: 'Two billing modes',
              columns: ['', 'Request-based (default)', 'Instance-based'],
              rows: [
                ['Flag', '`--cpu-throttling`', '`--no-cpu-throttling`'],
                ['CPU outside requests', 'Nearly zero', 'Still available'],
                ['Billed', 'Only while handling requests (plus startup and shutdown)', 'For as long as the instance is running'],
                ['Good for', 'Rare, bursty or spiky traffic', 'Steady traffic, or background work after the response is sent']
              ]
            },
            {
              kind: 'callout',
              tone: 'warn',
              text: 'The pattern "send the response first, finish the rest in the background" is not reliable with request-based billing. Do the work before answering, hand it to **Cloud Tasks** or Pub/Sub, or use instance-based billing.'
            }
          ]
        },
        {
          id: 'stop',
          title: 'Stopping: gracefully or suddenly',
          blocks: [
            {
              kind: 'p',
              text: 'You cannot decide when a container is shut down, but you can be ready for it. Before shutting down an idle container, Cloud Run sends a **`SIGTERM`** signal. If the app catches it, it has **10 seconds** to close database connections and files, send any data still sitting in buffers (telemetry, for example), and write a final log line. If it does not, the process simply disappears.'
            },
            {
              kind: 'code',
              title: 'Catching SIGTERM in Node.js',
              lines: [
                "process.on('SIGTERM', async () => {",
                "  console.log('SIGTERM received, closing connections');",
                '  await pool.end();      // close database connections',
                '  await metrics.flush(); // send data still in the buffer',
                '  process.exit(0);',
                '});'
              ]
            },
            {
              kind: 'list',
              items: [
                'Under normal conditions, Cloud Run **never shuts down a container that is handling requests**.',
                'A container can stop suddenly if **the app exits** (for example, an unhandled error) or **goes over its memory limit** (512 MiB by default, up to 32 GiB). Every request in flight fails, and new requests may wait for a replacement instance.',
                'Closing connections cleanly matters: if instances scale up and down a lot, connections left dangling on the database can use up its connection limit.'
              ]
            }
          ]
        }
      ]
    },

    // ── 4 ─────────────────────────────────────────────────────────────────
    {
      id: 'scaling',
      title: 'Autoscaling',
      sections: [
        {
          id: 'how',
          title: 'How Cloud Run adds and removes instances',
          blocks: [
            { kind: 'figure', svg: FIG_SCALE, caption: 'An internal load balancer spreads requests across a revision\'s instances. If they are all busy, instances are added; when demand drops, some stop getting traffic and are shut down.' },
            {
              kind: 'list',
              items: [
                'The number of instances depends on the **request rate**, the **CPU use** of existing instances (the target is about 60%), **max concurrency**, and **min and max instances**.',
                'The default max instances is **100** per service. The number of instances per region in a project is limited by quota, which you can ask to raise.',
                'All of this is per revision: when traffic is split between two revisions, each one scales on its own.'
              ]
            }
          ]
        },
        {
          id: 'zero',
          title: 'Scale to zero, the queue, and cold starts',
          blocks: [
            {
              kind: 'p',
              text: 'With no requests at all, even the last instance is shut down — **scale to zero**. Financially that is attractive: nothing is paid when nothing is used. The price is paid by the first request after a quiet spell: it waits in a **queue** until an instance has finished starting. That is a **cold start**.'
            },
            {
              kind: 'p',
              text: 'The cure is **min instances**: Cloud Run always keeps that many instances running and ready, even when idle. When requests come, active instances go up and idle ones go down. Instances kept this way **are billed**.'
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --min-instances=1`] }
          ]
        },
        {
          id: 'limits',
          title: 'Max instances and concurrency: the brake and the capacity',
          blocks: [
            {
              kind: 'p',
              text: '**Max instances** caps how many instances may be started. It does two jobs: it controls cost, and it **protects the systems behind you** — a database that only takes so many connections, or a third-party API with a rate limit. Set it too low, and requests that do not fit will fail.'
            },
            {
              kind: 'p',
              text: '**Max concurrency** decides how many requests one instance may handle at the same time — **80** by default, **1000** at most. Higher concurrency means fewer instances (cheaper), but each request needs some extra memory, and a spike can be passed straight on to downstream systems.'
            },
            {
              kind: 'table',
              caption: 'When to lower concurrency to 1',
              columns: ['Sign', 'Why'],
              rows: [
                ['One request uses almost all of the instance\'s CPU or memory', 'A second request would slow both down or run out of memory'],
                ['The code is not designed to handle many requests at once', 'For example, a library that is not thread-safe'],
                ['The code relies on global state that must not be shared between requests', 'Requests overwrite each other\'s data']
              ]
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --max-instances=20 --concurrency=80`] },
            {
              kind: 'callout',
              tone: 'tip',
              text: 'Find the right concurrency with a **load test** that lets you set the number of parallel requests. Start from the default and raise it while latency and memory stay healthy.'
            }
          ]
        },
        {
          id: 'calc',
          title: 'Try it yourself: how many instances run?',
          blocks: [
            {
              kind: 'p',
              text: 'The rough sum: **requests in flight = traffic × time per request**. 200 requests/second that each take 0.5 seconds means about 100 requests being handled at any moment. Divide by max concurrency and you have the fewest instances needed. Pick a situation, then change the numbers.'
            },
            {
              kind: 'scaling',
              start: S(40, 250, 80, 0, 100, 5),
              presets: [
                { label: 'Ordinary afternoon', values: S(40, 250, 80, 0, 100, 5), note: '40 requests/second × 0.25 seconds = 10 requests in flight. One instance with concurrency 80 is plenty.' },
                { label: 'Promotion spike', values: S(2000, 400, 80, 0, 100, 5), note: 'Traffic goes up 50 times. Cloud Run adds instances on its own, to about 10 — nothing to touch.' },
                { label: 'Concurrency 1', values: S(300, 500, 1, 0, 100, 1), note: 'An app that can only take one request at a time needs one instance per request. With max 100, the excess is refused.' },
                { label: 'Small database', values: S(2000, 400, 10, 0, 100, 10), note: 'This small Cloud SQL instance only takes about 100 connections, but 80 instances × 10 connections = 800. Try max instances 10 and concurrency 80.' },
                { label: 'Night, min 0', values: S(0, 250, 80, 0, 100, 5), note: 'No traffic: every instance is off and the cost is zero, but tomorrow morning\'s first visitor gets a cold start.' },
                { label: 'Night, min 2', values: S(0, 250, 80, 2, 100, 5), note: 'Two instances stay up all night: no cold start, but both are billed while serving nobody.' }
              ]
            }
          ]
        }
      ]
    },

    // ── 5 ─────────────────────────────────────────────────────────────────
    {
      id: 'release',
      title: 'Releases and traffic',
      sections: [
        {
          id: 'revisions',
          title: 'Revisions make releases reversible',
          blocks: [
            {
              kind: 'p',
              text: 'Because revisions cannot change and old revisions are kept, releasing a new version is really just a matter of **which revision gets the traffic**. By default, traffic moves straight to the newest healthy revision. You can split it across several revisions at once, or send it back to an old revision in seconds.'
            },
            { kind: 'figure', svg: FIG_TRAFFIC, caption: 'One service URL, two revisions. A tag gives a revision its own URL, so the team can try the new version before it gets user traffic.' },
            {
              kind: 'code',
              title: 'Seeing revisions and traffic',
              lines: [
                `$ gcloud run revisions list --service=shop ${REGION}`,
                '   REVISION        ACTIVE  SERVICE  DEPLOYED                 DEPLOYED BY',
                '✔  shop-00008-wfx  yes     shop     2026-10-18 09:12:40 UTC  dev@example.com',
                '✔  shop-00007-plq  yes     shop     2026-10-17 15:02:11 UTC  dev@example.com',
                `$ gcloud run services describe shop ${REGION} --format="yaml(status.traffic)"`
              ]
            }
          ]
        },
        {
          id: 'canary',
          title: 'Gradual (canary) releases and rollbacks',
          blocks: [
            {
              kind: 'steps',
              items: [
                { title: 'Deploy with no traffic, add a tag', text: 'The new revision is created and can be tried through its tag URL, but users do not see it yet.', code: [`gcloud run deploy shop --image=${IMG}/shop:1.5 ${REGION} --no-traffic --tag=canary`] },
                { title: 'Send a small share of traffic', text: 'Watch the error rate and latency in Cloud Monitoring.', code: [`gcloud run services update-traffic shop ${REGION} --to-tags=canary=10`] },
                { title: 'Raise it gradually', text: '10% → 50% → 100% while the metrics stay healthy.', code: [`gcloud run services update-traffic shop ${REGION} --to-latest`] },
                { title: 'Trouble? Send it back', text: 'A rollback just moves traffic to the old revision — no rebuild.', code: [`gcloud run services update-traffic shop ${REGION} --to-revisions=shop-00007-plq=100`] }
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Test a new version with 5% of users" → `update-traffic` with a percentage (or a tag). "Roll back quickly after a bad release" → point traffic at the previous revision; there is no need to redeploy the old image.'
            }
          ]
        }
      ]
    },

    // ── 6 ─────────────────────────────────────────────────────────────────
    {
      id: 'access',
      title: 'Access and networking',
      sections: [
        {
          id: 'iam',
          title: 'Everything is an API call, and IAM decides',
          blocks: [
            {
              kind: 'p',
              text: 'Google Cloud is essentially a set of **APIs**. The Console, gcloud, Terraform and client libraries are just ways of calling them. Even `gcloud run deploy` is just a call to `run.googleapis.com`. **IAM** checks every call: who is calling, and whether they have permission for that action — whether you are deploying a revision or your app is publishing a message to Pub/Sub.'
            },
            {
              kind: 'steps',
              items: [
                { title: 'A policy is attached to a resource', text: 'Every resource (a project, a Cloud Run service, a Pub/Sub topic) has an **IAM policy**.' },
                { title: 'The policy holds bindings', text: 'A **binding** grants one **role** to one or more **members** (users, groups, service accounts, `allUsers`).' },
                { title: 'A role holds permissions', text: 'For example, `roles/run.invoker` holds the permission to call a service.' },
                { title: 'Access is granted', text: 'You may do something to a resource when a binding in that resource\'s policy (or one above it: project, folder, organisation) gives you a role with that permission.' }
              ]
            },
            {
              kind: 'table',
              caption: 'Cloud Run roles to know',
              columns: ['Role', 'For'],
              mono: [0],
              rows: [
                ['roles/run.admin', 'Managing everything, including the IAM policies of services and jobs'],
                ['roles/run.developer', 'Creating and changing services and jobs, without managing IAM'],
                ['roles/run.invoker', 'Calling a service'],
                ['roles/run.viewer', 'Viewing only'],
                ['roles/iam.serviceAccountUser', 'Granted on the service account a service runs as — required to deploy with `--service-account`']
              ]
            }
          ]
        },
        {
          id: 'invoke-auth',
          title: 'Public or private: who may call it',
          blocks: [
            {
              kind: 'p',
              text: 'A new service is **private**: only identities with permission to invoke it (Owner, Editor, or `roles/run.invoker`) get through. For a public website, grant `roles/run.invoker` to **`allUsers`** — or use `--allow-unauthenticated` when deploying.'
            },
            {
              kind: 'code',
              title: 'Opening, restricting, and calling a service',
              lines: [
                '# public',
                `$ gcloud run services add-iam-policy-binding web ${REGION} --member=allUsers --role=roles/run.invoker`,
                '# only another service, through its service account',
                `$ gcloud run services add-iam-policy-binding orders ${REGION} --member=serviceAccount:checkout-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/run.invoker`,
                '# for every service in the project',
                '$ gcloud projects add-iam-policy-binding ace-lab-123 --member=group:qa@example.com --role=roles/run.invoker',
                '# calling a private service from a terminal: include an ID token',
                '$ curl -H "Authorization: Bearer $(gcloud auth print-identity-token)" https://orders-123456789012.asia-southeast2.run.app'
              ]
            },
            {
              kind: 'list',
              items: [
                '**Service to service**: give the calling service\'s service account `roles/run.invoker` on the target service; the caller sends an ID token in the `Authorization` header.',
                '**Pub/Sub push, Cloud Scheduler, Cloud Tasks**: configure them with a service account (an OIDC token) that has `roles/run.invoker`.',
                'Removing access: `gcloud run services remove-iam-policy-binding` (or `gcloud run jobs remove-iam-policy-binding` for a job).'
              ]
            }
          ]
        },
        {
          id: 'identity',
          title: 'Service identity: who your app is to Google',
          blocks: [
            {
              kind: 'p',
              text: 'The flip side of who may call a service is **who the service is when it calls other APIs** — reading a bucket, writing to Firestore, publishing a message. The answer is the revision\'s **service account**. If you do not set one, Cloud Run uses the Compute Engine default service account, which often has far too much access.'
            },
            {
              kind: 'code',
              title: 'Least privilege: a dedicated service account per service',
              lines: [
                '$ gcloud iam service-accounts create shop-sa --display-name="Cloud Run shop"',
                '$ gcloud storage buckets add-iam-policy-binding gs://ace-shop-images --member=serviceAccount:shop-sa@ace-lab-123.iam.gserviceaccount.com --role=roles/storage.objectViewer',
                `$ gcloud run services update shop ${REGION} --service-account=shop-sa@ace-lab-123.iam.gserviceaccount.com`
              ]
            },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Cloud Run service needs to read from a bucket following least privilege" → a dedicated service account with a narrow role on that bucket, set with `--service-account`. Not a JSON key inside the image, and not the default compute SA.'
            }
          ]
        },
        {
          id: 'ingress',
          title: 'Ingress: which networks requests may come from',
          blocks: [
            {
              kind: 'p',
              text: 'IAM answers **who**, ingress answers **from where**. They are independent; use both for defence in depth. Ingress is set per service with `--ingress`.'
            },
            {
              kind: 'table',
              columns: ['Source of the request', 'all (default)', 'internal-and-cloud-load-balancing', 'internal'],
              rows: [
                ['The internet straight to the run.app URL or a custom domain', '✓', '✗', '✗'],
                ['An external Application Load Balancer', '✓', '✓', '✗'],
                ['An internal Application Load Balancer, VPCs in the same project or VPC SC perimeter', '✓', '✓', '✓'],
                ['Pub/Sub, Eventarc, Cloud Tasks, Workflows in the same project or perimeter', '✓', '✓', '✓']
              ]
            },
            { kind: 'code', lines: [`$ gcloud run services update shop ${REGION} --ingress=internal-and-cloud-load-balancing`] },
            {
              kind: 'callout',
              tone: 'exam',
              text: '"Traffic must go through the load balancer (with Cloud Armor), not directly to the run.app URL" → `--ingress=internal-and-cloud-load-balancing`. "Only reachable from inside the VPC" → `--ingress=internal`.'
            }
          ]
        },
        {
          id: 'vpc',
          title: 'Out to the VPC: reaching private IPs',
          blocks: [
            {
              kind: 'p',
              text: 'By default Cloud Run is not inside your VPC, so it cannot reach resources with private IPs — Memorystore, Cloud SQL with a private IP, internal VMs. For that a service or job needs a way **out to the VPC**.'
            },
            { kind: 'figure', svg: FIG_VPC, caption: 'Two ways out to the VPC. Both are for outbound traffic only; requests coming from the VPC to Cloud Run still go through ingress.' },
            {
              kind: 'table',
              columns: ['', 'Direct VPC egress', 'Serverless VPC Access connector'],
              rows: [
                ['Status', 'Recommended', 'The older way, still supported'],
                ['How it works', 'Instances get an IP straight from the subnet', 'Traffic goes through relay VMs owned by the connector'],
                ['Needs', 'A subnet in the same region, at least /26', 'A connector in the same region, a dedicated /28 range'],
                ['Cost', 'Only network traffic', 'Plus the connector VMs, even when idle'],
                ['Flags', '`--network --subnet --vpc-egress`', '`--vpc-connector`']
              ]
            },
            {
              kind: 'code',
              lines: [
                `$ gcloud run services update cart ${REGION} --network=prod-vpc --subnet=run-jkt --vpc-egress=private-ranges-only`,
                '# private-ranges-only: only private IP destinations go through the VPC',
                '# all-traffic: all outbound traffic goes through the VPC — e.g. to leave with a static Cloud NAT IP'
              ]
            }
          ]
        }
      ]
    },

    // ── 7 ─────────────────────────────────────────────────────────────────
    {
      id: 'scenarios',
      title: 'Troubleshooting scenarios',
      sections: [
        {
          id: 'sc-port',
          title: 'Scenario 1 — The deploy fails: the container is not listening on the port',
          blocks: [
            {
              kind: 'case',
              title: 'The revision never becomes ready',
              situation: 'The team deploys a Node.js API that runs on `localhost:3000` on a laptop.',
              symptom: [
                `$ gcloud run deploy orders --image=${IMG}/orders:1.0 ${REGION}`,
                'Deploying container to Cloud Run service [orders] in project [ace-lab-123] region [asia-southeast2]',
                "ERROR: (gcloud.run.deploy) Revision 'orders-00001-k2m' is not ready and cannot serve traffic. The user-provided container failed to start and listen on the port defined provided by the PORT=8080 environment variable within the allocated timeout."
              ],
              diagnose: [
                'Cloud Run waits for TCP connections on port 8080 (`$PORT`), but the app opens port 3000 — and only on `localhost`.',
                'Open the revision logs in Cloud Logging: if the app crashes at startup (a missing environment variable, a failed database connection), the message is there.',
                'Was the image built on an ARM laptop? Cloud Run needs a `linux/amd64` image; an image for the wrong architecture also fails to start.'
              ],
              fix: [
                '# in the code: read PORT and listen on every interface',
                'const port = process.env.PORT || 8080;',
                "app.listen(port, '0.0.0.0');",
                '# or tell Cloud Run which port the app uses',
                `$ gcloud run deploy orders --image=${IMG}/orders:1.0 ${REGION} --port=3000`
              ],
              why: 'Cloud Run only treats a container as ready once the configured port accepts connections. Until then the revision gets no traffic, and the deploy fails after the timeout.',
              exam: 'The message "failed to start and listen on the port defined by the PORT environment variable" is always about the port, or an app crashing at startup.'
            }
          ]
        },
        {
          id: 'sc-403',
          title: 'Scenario 2 — A public website answers 403',
          blocks: [
            {
              kind: 'case',
              title: 'The deploy succeeded, visitors are refused',
              situation: 'A landing page is deployed without `--allow-unauthenticated`. The team opens its URL in a browser.',
              symptom: ['$ curl -i https://web-123456789012.asia-southeast2.run.app', 'HTTP/2 403', 'Error: Forbidden', 'Your client does not have permission to get URL / from this server.'],
              diagnose: [
                'A new service is private. IAM checks for `roles/run.invoker`, and anonymous visitors do not have it.',
                'Ingress is already `all` — the problem is in the IAM layer, not the network.',
                'If adding `allUsers` is itself refused with a message about members not being allowed, the organisation uses the **domain restricted sharing** org policy: you need an exception, or a load balancer + IAP in front.'
              ],
              fix: [`$ gcloud run services add-iam-policy-binding web ${REGION} --member=allUsers --role=roles/run.invoker`],
              why: 'Permission to call a service is ordinary IAM: a binding of the invoker role to a member. `allUsers` means anyone, without signing in.',
              exam: '"Make a Cloud Run service publicly accessible" → `allUsers` + `roles/run.invoker`, or `--allow-unauthenticated`.'
            }
          ]
        },
        {
          id: 'sc-cold',
          title: 'Scenario 3 — The first request every morning is slow',
          blocks: [
            {
              kind: 'case',
              title: 'Six seconds for the first user',
              situation: 'An internal API is only used during working hours. The first request each morning takes about 6 seconds; the next ones 80 ms.',
              symptom: ['$ curl -s -o /dev/null -w "%{time_total}\\n" https://reports-123456789012.asia-southeast2.run.app/health', '6.214', '$ curl -s -o /dev/null -w "%{time_total}\\n" https://reports-123456789012.asia-southeast2.run.app/health', '0.083'],
              diagnose: [
                'No requests all night → scaled to zero. The first request waits for a cold start.',
                'Cold start = starting the container + initialising the app. Check the startup logs to see which part is slow: loading the framework, connecting to the database, downloading configuration.'
              ],
              fix: [
                `$ gcloud run services update reports ${REGION} --min-instances=1 --cpu-boost`,
                '# and in the code: defer initialisation the first request does not need'
              ],
              why: 'Min instances keeps an instance warm so there is no cold start (at the cost of an idle instance). Startup CPU boost gives extra CPU at startup so the cold starts that remain are shorter.',
              exam: '"Reduce cold start latency for a Cloud Run service" → min instances.'
            }
          ]
        },
        {
          id: 'sc-db',
          title: 'Scenario 4 — The database runs out of connections during a promotion',
          blocks: [
            {
              kind: 'case',
              title: 'A traffic spike, and the database refuses',
              situation: 'The `checkout` service uses a small Cloud SQL PostgreSQL instance (about 100 connections). Each instance opens a pool of 10 connections, and concurrency was set to 10. During a promotion, 500 errors pour in.',
              symptom: ['FATAL:  sorry, too many clients already'],
              diagnose: [
                'High traffic + low concurrency → Cloud Run starts dozens of instances. 80 instances × 10 connections = 800 connections.',
                'Try the "Small database" situation in the autoscaling calculator above.'
              ],
              fix: [
                `$ gcloud run services update checkout ${REGION} --max-instances=10 --concurrency=80`,
                '# shrink the pool per instance; for more traffic, grow the database or use a connection pooler'
              ],
              why: 'Max instances is the brake that protects downstream systems. Higher concurrency lets fewer instances carry the same traffic.',
              exam: '"Cloud Run overwhelms the database during traffic spikes" → limit max instances.'
            }
          ]
        },
        {
          id: 'sc-background',
          title: 'Scenario 5 — Confirmation emails sometimes never arrive',
          blocks: [
            {
              kind: 'case',
              title: 'Work after the response disappears',
              situation: 'The order handler answers 200 straight away, then sends the confirmation email "in the background" without waiting.',
              symptom: ['Order 4812 created', 'Sending confirmation email to customer…', '# no "email sent" log line, sometimes a network timeout'],
              diagnose: [
                'With request-based billing, the CPU is throttled to nearly zero as soon as no request is being handled — background work crawls.',
                'An idle instance can be shut down at any time, and network calls while idle tend to fail.'
              ],
              fix: [
                '# option 1: send the email before answering',
                '# option 2: put it on Cloud Tasks / Pub/Sub, which calls an email-sending endpoint',
                '# option 3: keep the CPU available (billed for as long as the instance runs)',
                `$ gcloud run services update orders ${REGION} --no-cpu-throttling`
              ],
              why: 'Cloud Run guarantees CPU while a request is being handled. Outside that, only instance-based billing keeps the CPU there.',
              exam: '"Background processing after the response is unreliable" → Cloud Tasks, or CPU always allocated (instance-based billing).'
            }
          ]
        },
        {
          id: 'sc-oom',
          title: 'Scenario 6 — Instances die while processing large files',
          blocks: [
            {
              kind: 'case',
              title: 'Small files work, large files fail',
              situation: 'A service turns uploaded PDFs into images, doing everything in memory and writing temporary files to the container filesystem.',
              symptom: ['Memory limit of 512 MiB exceeded with 731 MiB used. Consider increasing the memory limit, see https://cloud.google.com/run/docs/configuring/memory-limits'],
              diagnose: [
                'The default memory is 512 MiB. Files written to the container filesystem use memory too.',
                'Concurrency 80 means several large files can be processed at once on the same instance.',
                'When an instance is stopped for memory, every request on it fails as well.'
              ],
              fix: [
                `$ gcloud run services update pdf2img ${REGION} --memory=2Gi --cpu=2 --concurrency=4`,
                '# in the code: process as a stream, save results to Cloud Storage, not the container filesystem'
              ],
              why: 'The memory limit is per instance, shared by every request it is handling. More memory and lower concurrency leave room for heavy requests.',
              exam: 'A container stopping with "memory limit exceeded" → raise `--memory` (up to 32 GiB), lower concurrency.'
            }
          ]
        },
        {
          id: 'sc-rollback',
          title: 'Scenario 7 — A new release raises the error rate',
          blocks: [
            {
              kind: 'case',
              title: 'Back in one command',
              situation: 'Version 1.5 is deployed and gets 100% of traffic at once. The error rate jumps to 20%.',
              symptom: [
                `$ gcloud run revisions list --service=shop ${REGION}`,
                '   REVISION        ACTIVE  SERVICE  DEPLOYED',
                '✔  shop-00008-wfx  yes     shop     2026-10-18 09:12:40 UTC',
                '✔  shop-00007-plq          shop     2026-10-17 15:02:11 UTC'
              ],
              diagnose: ['The old revision `shop-00007-plq` still exists, unchanged.', 'A rollback needs no build or redeploy — just move the traffic.'],
              fix: [
                `$ gcloud run services update-traffic shop ${REGION} --to-revisions=shop-00007-plq=100`,
                '# next time: --no-traffic --tag=canary, then raise the percentage gradually'
              ],
              why: 'Immutable revisions mean every version ever deployed is ready to use again. Traffic splitting is the control for it.',
              exam: '"Quickly roll back a Cloud Run deployment" → `update-traffic` to the previous revision.'
            }
          ]
        },
        {
          id: 'sc-vpc',
          title: 'Scenario 8 — Cannot connect to Redis on a private IP',
          blocks: [
            {
              kind: 'case',
              title: 'A timeout to Memorystore',
              situation: 'The `cart` service needs Memorystore for Redis at `10.20.0.5`, on the `prod-vpc` network in asia-southeast2.',
              symptom: ['Error: connect ETIMEDOUT 10.20.0.5:6379'],
              diagnose: [
                'Cloud Run is not inside the VPC; packets to a private IP have no path.',
                'It needs Direct VPC egress (or a connector) in the same region as the service.',
                'Once connected, the VPC firewall must also allow traffic from the subnet Cloud Run uses.'
              ],
              fix: [`$ gcloud run services update cart ${REGION} --network=prod-vpc --subnet=run-jkt --vpc-egress=private-ranges-only`, '# the run-jkt subnet must be at least /26, in the same region'],
              why: 'Direct VPC egress gives instances an address in a VPC subnet, so they can reach internal resources over private IPs without going through the internet.',
              exam: '"Cloud Run must connect to Memorystore / a VM with an internal IP" → Direct VPC egress or a Serverless VPC Access connector.'
            }
          ]
        },
        {
          id: 'sc-push',
          title: 'Scenario 9 — Pub/Sub push to a private service is refused',
          blocks: [
            {
              kind: 'case',
              title: 'Messages pile up, the service is never called',
              situation: 'The `orders-worker` service is deliberately private. A push subscription was created to its URL with no authentication settings.',
              symptom: ['The request was not authenticated. Either allow unauthenticated invocations or set the proper Authorization header.'],
              diagnose: [
                'A push with no OIDC token → the request arrives with no identity → 403.',
                'What it needs: a service account for the push, with `roles/run.invoker` on the target service.'
              ],
              fix: [
                '$ gcloud iam service-accounts create push-invoker',
                `$ gcloud run services add-iam-policy-binding orders-worker ${REGION} --member=serviceAccount:push-invoker@ace-lab-123.iam.gserviceaccount.com --role=roles/run.invoker`,
                '$ gcloud pubsub subscriptions update orders-push --push-endpoint=https://orders-worker-123456789012.asia-southeast2.run.app --push-auth-service-account=push-invoker@ace-lab-123.iam.gserviceaccount.com'
              ],
              why: 'Pub/Sub signs an OIDC token as that service account; Cloud Run checks the token and IAM just as it does for any other caller.',
              exam: 'The same pattern applies to Cloud Scheduler and Cloud Tasks: a service account with `roles/run.invoker`, not opening the service to `allUsers`.'
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
          title: 'Twelve quick questions',
          blocks: [
            { kind: 'quiz', q: 'What happens every time you deploy a new image to a Cloud Run service?', options: ['The existing revision is updated in place', 'A new revision that cannot be changed is created', 'A new service with a new URL is created', 'Every instance is restarted with the new image'], answer: 1, explain: 'Every deploy (and every configuration change) creates a new immutable revision; the service URL stays the same.' },
            { kind: 'quiz', q: 'What is the default max concurrency per instance?', options: ['1', '10', '80', '1000'], answer: 2, explain: '80 by default, settable from 1 to 1000.' },
            { kind: 'quiz', q: 'A deploy fails with the container "failed to start and listen on the port defined by the PORT environment variable". The most likely cause?', options: ['The service account has no role', 'The app listens on another port, or only on localhost', 'Max instances is too small', 'Ingress is set to internal'], answer: 1, explain: 'Cloud Run waits for TCP connections on `$PORT` (8080 by default) on every interface.' },
            { kind: 'quiz', q: 'The first request after a quiet night takes several seconds. Which setting removes that most directly?', options: ['--max-instances', '--concurrency=1', '--min-instances=1', '--timeout=3600'], answer: 2, explain: 'Min instances keeps an instance warm so there is no cold start — at the cost of an idle instance.' },
            { kind: 'quiz', q: 'At peak traffic, Cloud SQL refuses connections because there are too many clients. Which Cloud Run setting limits that?', options: ['--min-instances', '--max-instances', '--cpu-boost', '--ingress'], answer: 1, explain: 'Max instances caps the number of instances, and with it the number of database connections.' },
            { kind: 'quiz', q: 'An app is not safe with many simultaneous requests because it uses global state. What do you change?', options: ['Concurrency to 1', 'Memory to 32Gi', 'Min instances to 0', 'Ingress to internal'], answer: 0, explain: 'Concurrency 1 makes each instance handle one request at a time.' },
            { kind: 'quiz', q: 'How do you make a Cloud Run service publicly reachable without signing in?', options: ['Give roles/run.admin to allAuthenticatedUsers', 'Give roles/run.invoker to allUsers', 'Set ingress to all', 'Turn off IAM in the project'], answer: 1, explain: '`allUsers` + `roles/run.invoker`, or `--allow-unauthenticated` when deploying.' },
            { kind: 'quiz', q: 'Service A must call the private service B. What does it need?', options: ['Open B to allUsers', 'A\'s service account gets roles/run.invoker on B, and A sends an ID token', 'Put both in the same region', 'Give A roles/editor on the project'], answer: 1, explain: 'Service-to-service calls use IAM: invoker on the target service, an ID token in the Authorization header.' },
            { kind: 'quiz', q: 'A script that processes every file in a bucket each night and then finishes is best run as…', options: ['A Cloud Run service with min instances 1', 'A Cloud Run job triggered by Cloud Scheduler', 'A service with concurrency 1000', 'A VM that is always on'], answer: 1, explain: 'A job runs its tasks to completion and then stops; Cloud Scheduler schedules it.' },
            { kind: 'quiz', q: 'Work started after the response is sent often never finishes. Why?', options: ['The request timeout is too short', 'With request-based billing, the CPU is throttled to nearly zero outside requests', 'Concurrency is too high', 'The image is too big'], answer: 1, explain: 'Use Cloud Tasks / Pub/Sub, do the work before answering, or use instance-based billing (`--no-cpu-throttling`).' },
            { kind: 'quiz', q: 'A service may only be reached through an external Application Load Balancer (with Cloud Armor), never straight at the run.app URL. The setting?', options: ['--ingress=all', '--ingress=internal', '--ingress=internal-and-cloud-load-balancing', '--no-allow-unauthenticated'], answer: 2, explain: 'This setting accepts requests from load balancers and internal sources, but refuses the internet directly.' },
            { kind: 'quiz', q: 'You want 10% of users to try a new revision before the full release. The command?', options: ['gcloud run deploy --traffic=10', 'gcloud run services update-traffic … --to-revisions=REV=10', 'gcloud run revisions update REV --percent=10', 'gcloud run services update … --max-instances=10'], answer: 1, explain: '`update-traffic` splits traffic between revisions (or tags) by percentage.' }
          ]
        }
      ]
    }
  ]
};
