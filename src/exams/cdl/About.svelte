<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';

  const exam = $derived(quiz.activeExam);

  const facts = [
    ['Duration', '90 minutes.'],
    ['Questions', '50 to 60, multiple choice and multiple select. Multiple select questions say how many to pick, and every pick must be right to score.'],
    ['Sections', 'Six, each worth roughly 16–17%: digital transformation, data, AI, infrastructure and applications, trust and security, and cloud operations.'],
    ['Fee', 'US$99 plus tax. The renewal exam is US$60.'],
    ['Languages', 'English, Japanese, Spanish, Portuguese and French.'],
    ['Where', 'Online with a remote proctor, or at a Kryterion testing centre.'],
    ['Prerequisites', 'None. Google recommends experience collaborating with technical professionals, not hands-on engineering.'],
    ['Pass mark', 'Not published. Community reports cluster around 70%, so the presets here treat that as the bar.'],
    ['Validity', 'Three years. Renew by a 20-question, 45-minute renewal exam or by completing designated courses in the last year of validity.'],
    ['Style', 'Business and product knowledge, not hands-on: "which product would you recommend" and "what is the benefit of" far more than "which command".']
  ];

  const sections = [
    {
      n: '01',
      title: 'Digital transformation with Google Cloud',
      weight: '~17%',
      body: 'Cloud vocabulary; the benefits of cloud over on-premises; public, private, hybrid and multicloud; CapEx to OpEx and TCO; regions, zones, latency and Google\'s network; IaaS, PaaS and SaaS and the shared responsibility model.'
    },
    {
      n: '02',
      title: 'Exploring data transformation',
      weight: '~16%',
      body: 'Databases versus warehouses versus lakes; structured and unstructured data; governance; Cloud Storage and its four classes; Cloud SQL, Spanner, Bigtable, Firestore and BigQuery; Looker, streaming analytics, Pub/Sub and Dataflow.'
    },
    {
      n: '03',
      title: 'Innovating with Google Cloud AI',
      weight: '~16%',
      body: 'AI versus ML versus analytics; problem types; data quality, explainable and responsible AI; the pre-trained API, AutoML and custom-model trade-off; Vision, Natural Language, Translation, Speech APIs; BigQuery ML, Vertex AI, TensorFlow and TPUs.'
    },
    {
      n: '04',
      title: 'Modernize infrastructure and applications',
      weight: '~17%',
      body: 'Retire, retain, rehost, replatform, refactor, reimagine; VMs, containers, microservices, Kubernetes and GKE; Spot VMs, autoscaling, load balancing; Cloud Run, Cloud Functions, App Engine; APIs and Apigee; hybrid and multicloud with Anthos.'
    },
    {
      n: '05',
      title: 'Trust and security',
      weight: '~17%',
      body: 'Threats and the CIA triad; cloud versus on-premises security; defence in depth; encryption at rest, in transit and in use; authentication, authorisation, auditing; 2SV, IAM, Cloud Armor, SecOps; trust principles, transparency reports, audits, data residency and sovereignty, compliance resources.'
    },
    {
      n: '06',
      title: 'Scaling with Google Cloud operations',
      weight: '~17%',
      body: 'Financial governance, the resource hierarchy, quotas, budgets and billing reports; reliability, DevOps and SRE terms, Customer Care and the support case lifecycle; sustainability commitments and the Carbon Footprint tool.'
    }
  ];

  const sources = [
    {
      label: 'Google Cloud — Cloud Digital Leader certification (format, fee, languages, renewal)',
      url: 'https://cloud.google.com/learn/certification/cloud-digital-leader'
    },
    {
      label: 'Google Cloud — Cloud Digital Leader exam guide (the six sections and their sub-topics)',
      url: 'https://cloud.google.com/learn/certification/guides/cloud-digital-leader'
    },
    {
      label: 'Google Cloud Skills Boost — Cloud Digital Leader learning path',
      url: 'https://www.cloudskillsboost.google/paths/9'
    },
    {
      label: 'Google Cloud — sample questions',
      url: 'https://docs.google.com/forms/d/e/1FAIpQLSfsSfkh9PE-HjdRRzJZDLuzOlGaD4Lb2IWgLkxZfSkvQ0FzZg/viewform'
    }
  ];
</script>

<div class="page wrap rise">
  <header class="head">
    <p class="eyebrow">Background</p>
    <h1>What the Cloud Digital Leader exam actually looks like</h1>
    <p class="lede">
      Google publishes the exam guide, so unlike most entry tests there is no guessing at the
      syllabus: six sections, each with its sub-topics listed. What it does not publish is the pass
      mark or the exact question count, which is why the presets here draw 50 and aim you above 70%.
    </p>
  </header>

  <section class="block">
    <h2>Exam facts</h2>
    <dl class="facts card">
      {#each facts as [term, value] (term)}
        <div>
          <dt>{term}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>
  </section>

  <section class="block">
    <h2>The six sections</h2>
    <p class="block-lede">
      Straight from the exam guide. Every section here maps one-to-one onto a section in the app,
      and the {exam.bankSize} questions in the bank are tagged with the guide's sub-topics so you can
      drill them individually.
    </p>
    <div class="stages">
      {#each sections as section (section.n)}
        <div class="stage card">
          <span class="n mono">{section.n} · {section.weight}</span>
          <h3>{section.title}</h3>
          <p>{section.body}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>What gets asked</h2>
    <div class="topics">
      {#each exam.sections as section (section.id)}
        <div class="topic card">
          <div class="topic-head">
            <span class="icon" aria-hidden="true">{section.icon}</span>
            <h3>{section.name}</h3>
            <span class="count mono">{section.questions.length} in bank</span>
          </div>
          <p class="part-label" class:extra={!section.weight}>
            {section.weight ? `About ${section.weight}% of the paper` : 'Extra practice · not an exam-guide domain'}
          </p>
          <p>{section.blurb}</p>
          <div class="tags">
            {#each [...new Set(section.questions.map((q) => q.topic))] as topic (topic)}
              <span class="tag">{topic}</span>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>How the questions are written</h2>
    <div class="shapes">
      <div class="shape card">
        <p class="eyebrow">Product-choice questions</p>
        <p class="shape-body">
          A short business scenario ends in "which Google Cloud product should they use?". The trap
          is two products that sound alike — Cloud SQL and Spanner, Bigtable and BigQuery, Nearline
          and Coldline, Cloud Run and Cloud Functions. Learn each pair as a <em>contrast</em>, not as
          two separate facts.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">Benefit and definition questions</p>
        <p class="shape-body">
          "What is the business value of…" and "which statement best describes…". The correct option
          is usually the one that mentions the outcome — agility, cost predictability, reduced
          lock-in — while the distractors overclaim ("eliminates all security risk") or confuse two
          terms.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">Multiple select</p>
        <p class="shape-body">
          "Choose two" questions score only if both picks are right. The distractors are typically an
          overclaim and an opposite; strike those first, and what remains is usually the pair.
        </p>
      </div>
    </div>
  </section>

  <section class="block">
    <h2>How to prepare</h2>
    <ol class="tips">
      <li>
        <strong>Read the exam guide once, slowly.</strong> It is the syllabus. Any term in it —
        "transformation cloud", "error budget", "Compliance Reports Manager" — is fair game, and
        nothing outside it is.
      </li>
      <li>
        <strong>Do the free learning path on Google Cloud Skills Boost.</strong> The Cloud Digital
        Leader path is five short courses that mirror the six sections. Most people who pass did
        those and little else.
      </li>
      <li>
        <strong>Drill the product pairs.</strong> The section drills here are tagged by sub-topic;
        take "Data management solutions" and "Building with Google Cloud AI" until you can name the
        product from the scenario without reading the options.
      </li>
      <li>
        <strong>Think like a business decision-maker, not an engineer.</strong> When two options are
        technically plausible, the one that talks about business outcome, shared responsibility or
        managed services is the one Google wants.
      </li>
      <li>
        <strong>Sit the full mock under time.</strong> Ninety minutes for fifty questions feels
        generous until a run of multiple-select questions arrives. Practise flagging and moving on.
      </li>
      <li>
        <strong>Answer everything.</strong> There is no penalty for a wrong answer.
      </li>
    </ol>
  </section>

  <section class="block">
    <h2>Sources</h2>
    <ul class="sources">
      {#each sources as source (source.url)}
        <li><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>
      {/each}
    </ul>
    <p class="disclaimer">
      This is an independent study aid. It is not affiliated with, endorsed by, or produced by
      Google LLC, and none of these questions are real exam questions — they are written to the
      topics and sub-topics in the published exam guide. Product names, prices and exam details
      change; check the official page before you book.
    </p>
  </section>

  <div class="cta">
    <button class="btn btn-primary lg" onclick={() => quiz.startMode('full')}>
      Start the 90-minute exam
    </button>
    <button class="btn btn-ghost lg" onclick={() => (quiz.view = 'home')}>Back to start</button>
  </div>
</div>

<style>
  .wrap {
    padding-top: 56px;
    padding-bottom: 72px;
    max-width: 820px;
  }

  .head h1 {
    margin-top: 12px;
    font-size: var(--type-h1);
    letter-spacing: -0.3px;
  }

  .lede {
    margin-top: 18px;
    font-size: 18px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .block {
    margin-top: 52px;
    padding-top: 26px;
    border-top: 1px solid var(--line);
    position: relative;
  }

  .block h2 {
    font-size: var(--type-h2);
    margin-bottom: 16px;
  }

  .block-lede {
    margin-bottom: 20px;
    font-size: 15px;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .stages {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 14px;
  }

  .stage {
    padding: 22px;
  }

  .n {
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 500;
    letter-spacing: 0.08em;
    color: var(--accent);
  }

  .stage h3 {
    margin-top: 8px;
    font-size: 17px;
  }

  .stage p {
    margin-top: 8px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .facts {
    margin: 0;
    overflow: hidden;
  }

  .facts div {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 24px;
    padding: 16px 22px;
    border-top: 1px solid var(--line);
  }

  .facts div:first-child {
    border-top: none;
  }

  .facts dt {
    flex: none;
    width: 170px;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    padding-top: 3px;
  }

  .facts dd {
    flex: 1;
    min-width: 200px;
    margin: 0;
    font-family: var(--font-display);
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
    letter-spacing: -0.3px;
  }

  .topics {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .topic {
    padding: 22px;
  }

  .topic-head {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .icon {
    width: 32px;
    height: 32px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-control);
    background: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 600;
  }

  .topic-head h3 {
    flex: 1;
    font-size: 17px;
  }

  .count {
    font-size: var(--type-label);
    color: var(--text-tertiary);
  }

  .topic p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* Beats `.topic p` on specificity, so it has to stay a two-class selector. */
  .topic .part-label.extra {
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .topic .part-label {
    margin-top: 12px;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .tag {
    padding: 3px 8px;
    border-radius: var(--radius-control);
    border: 1px solid var(--line);
    background: var(--bg-sunken);
    font-size: var(--type-label);
    color: var(--text-secondary);
  }

  .shapes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 14px;
  }

  .shape {
    padding: 22px;
  }

  .shape-body {
    margin-top: 8px;
    font-size: 15px;
    line-height: 1.6;
  }

  .tips {
    margin: 0;
    padding-left: 22px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    font-size: 15px;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .tips strong {
    color: var(--text);
    font-weight: 600;
  }

  .sources {
    margin: 0;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 14px;
    line-height: 1.55;
  }

  .disclaimer {
    margin-top: 24px;
    padding: 16px 18px;
    border-radius: var(--radius);
    background: var(--bg-sunken);
    font-size: 13px;
    line-height: 1.6;
    color: var(--text-tertiary);
  }

  .cta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 48px;
  }

  .lg {
    padding: 13px 26px;
    font-size: 15px;
  }

  @media (max-width: 560px) {
    .facts dt {
      width: 100%;
    }
  }
</style>
