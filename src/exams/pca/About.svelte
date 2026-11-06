<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';

  const exam = $derived(quiz.activeExam);

  const facts = [
    ['Duration', 'Two hours.'],
    ['Questions', '50 to 60, multiple choice and multiple select. Multiple select questions say how many to pick, and every pick must be right to score.'],
    ['Case studies', 'Two per sitting, chosen from the four in the guide, making up 20–30% of the questions. They are shown beside the questions during the exam.'],
    ['Fee', 'US$200 plus tax. The renewal exam is US$100.'],
    ['Languages', 'English and Japanese.'],
    ['Where', 'Online with a remote proctor, or at a testing centre.'],
    ['Prerequisites', 'None. Google recommends 3+ years of industry experience, including at least a year designing and managing solutions on Google Cloud.'],
    ['Pass mark', 'Not published. The presets here aim you above 70% on mixed papers.'],
    ['Validity', 'Two years. Renew with the standard exam, a 25-question, one-hour renewal exam built around one gen-AI case study, or a renewal learning path on Google Skills.'],
    ['Style', 'Scenarios with a business goal and constraints: "what should you recommend" far more than "which command". The Well-Architected Framework is the lens throughout.']
  ];

  const sections = [
    { n: '01', title: 'Designing and planning a cloud solution architecture', weight: '~25%', body: 'Business and technical requirements, trade-offs and success metrics, high availability, backup and DR, choosing network, storage, compute, data and AI products, migration plans with Migration Center, licensing, and designing for future change.' },
    { n: '02', title: 'Managing and provisioning a cloud solution infrastructure', weight: '~17.5%', body: 'Hybrid and multicloud networks, security and load balancing; storage retention, lifecycle, replication and protection; compute, Spot, serverless and VMware Engine networking, patching and containers; ML workflows on Gemini Enterprise Agent Platform; prebuilt AI APIs, Gemini Enterprise and Model Garden.' },
    { n: '03', title: 'Designing for security and compliance', weight: '~17.5%', body: 'IAM and the hierarchy, separation of duties, keys and secrets, VPC Service Controls, context-aware access, organization and firewall policies, IAP and Workload Identity Federation, supply chain and AI security (Model Armor), and regulation: health, card data, privacy, sovereignty, audits.' },
    { n: '04', title: 'Analyzing and optimizing technical and business processes', weight: '~15%', body: 'The delivery lifecycle and CI/CD, troubleshooting and testing, disaster recovery, stakeholder and change management, skills, decisions, customer success, and cost optimisation.' },
    { n: '05', title: 'Managing implementation', weight: '~12.5%', body: 'Advising teams on deployment, API management with Apigee, testing and migration tooling, Gemini Cloud Assist; working programmatically with the CLI, SDKs, emulators, client libraries and Terraform.' },
    { n: '06', title: 'Ensuring solution and operations excellence', weight: '~12.5%', body: 'The operational excellence pillar, observability and alerting, release management, support and quality control, and reliability testing — chaos engineering, penetration tests and load tests.' }
  ];

  const caseStudies = [
    {
      name: 'Altostrat Media',
      body: 'A media company with a big audio and video library already on GKE, Cloud Storage and BigQuery, adding gen AI for summaries, metadata, moderation and conversational support, while moving its last on-premises workflows. Reliability and cost come first.',
      url: 'https://services.google.com/fh/files/misc/v6.1_pca_altostrat_media_case_study_english.pdf'
    },
    {
      name: 'Cymbal Retail',
      body: 'An online retailer with a huge catalogue that wants gen AI to enrich product data and images with human review, conversational shopping on its own product search, and to modernise four database engines, file-based supplier feeds and an old call centre.',
      url: 'https://services.google.com/fh/files/misc/v6.1_pca_cymbal_retail_case_study_english.pdf'
    },
    {
      name: 'EHR Healthcare',
      body: 'A health records SaaS provider leaving colocation facilities: containerised apps, mixed databases, insurer integrations that stay on-premises, Active Directory, 99.9% availability, compliance, and consistent monitoring.',
      url: 'https://services.google.com/fh/files/misc/v6.1_pca_ehr_healthcare_case_study_english.pdf'
    },
    {
      name: 'KnightMotives Automotive',
      body: 'A carmaker that wants an AI-driven driving and buying experience, data monetisation and better dealer tools, held back by a mainframe supply chain, siloed data, weak connectivity, past breaches and EU data protection rules.',
      url: 'https://services.google.com/fh/files/misc/v6.1_pca_knightmotives_automotive_case_study_english.pdf'
    }
  ];

  const sources = [
    { label: 'Google Cloud — Professional Cloud Architect certification (format, fee, languages, renewal)', url: 'https://cloud.google.com/learn/certification/cloud-architect' },
    { label: 'Google Cloud — Professional Cloud Architect exam guide (the six sections and the case studies)', url: 'https://services.google.com/fh/files/misc/professional_cloud_architect_exam_guide_english.pdf' },
    { label: 'Google Cloud Well-Architected Framework', url: 'https://cloud.google.com/architecture/framework' },
    { label: 'Google Cloud Architecture Center', url: 'https://cloud.google.com/architecture' }
  ];
</script>

<div class="page wrap rise">
  <header class="head">
    <p class="eyebrow">Background</p>
    <h1>What the Professional Cloud Architect exam actually looks like</h1>
    <p class="lede">
      A design exam: every question describes a business with goals and constraints and asks which architecture, product or
      practice fits best. Two of the four published case studies return in every sitting, so knowing them well before exam day
      is worth as much as any section.
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
      Weights from the exam guide; the descriptions are ours. Each maps onto a section in the app, and the {exam.bankSize} questions
      in the bank are tagged by sub-topic so you can drill them one at a time.
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
    <h2>The four case studies</h2>
    <p class="block-lede">
      Summaries in our own words — read Google's originals before you sit the exam. Several of the businesses use Google Cloud's
      generative AI, so expect questions on Gemini, grounding, Model Armor and responsible AI alongside the classic infrastructure.
    </p>
    <div class="stages">
      {#each caseStudies as study (study.name)}
        <div class="stage card">
          <span class="n mono">Case study</span>
          <h3>{study.name}</h3>
          <p>{study.body}</p>
          <p class="case-link"><a href={study.url} target="_blank" rel="noopener noreferrer">Google's case study (PDF)</a></p>
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
            {section.weight ? `About ${section.weight}% of the paper` : 'Two case studies per sitting · 20–30% of the paper'}
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
        <p class="eyebrow">Requirement to architecture</p>
        <p class="shape-body">
          A company, a goal and one or two hard constraints — an RTO, a residency rule, "no code changes", a deadline. Several
          options would work; the right one meets the stated constraint with the least to build and run. Find the constraint
          before reading the options.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">Case-study questions</p>
        <p class="shape-body">
          They quote a requirement from the case and ask for the best fit. Know each case's business goals, existing systems
          and technical requirements well enough that the requirement in the question points you at the product immediately.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">Process and practice</p>
        <p class="shape-body">
          Not everything is a product choice: SLOs and error budgets, blameless postmortems, canary releases, change management
          and cost practices appear too. The answer is usually the Google-recommended practice, done incrementally.
        </p>
      </div>
    </div>
  </section>

  <section class="block">
    <h2>How to prepare</h2>
    <ol class="tips">
      <li><strong>Read the exam guide and the four case studies first.</strong> Summarise each case in your own words: goals, current systems, technical requirements. Two of them will be on your exam.</li>
      <li><strong>Learn the Well-Architected Framework pillars.</strong> They are the guide's stated lens; when two answers both work, the one that better serves the pillar in question wins.</li>
      <li><strong>Drill by section, then by case study.</strong> The topic drills here are tagged by sub-topic and by case study; take your weakest until the requirement-to-product mapping is automatic.</li>
      <li><strong>Know the 2026 names.</strong> The exam uses current branding — Gemini Enterprise Agent Platform, Agent Search, Knowledge Catalog, Managed Service for Apache Spark, Cloud Run functions. Answers built on retired products are usually wrong.</li>
      <li><strong>Sit the six fixed practice exams under time.</strong> Each has two case studies like the real paper. Review every explanation, including for questions you got right.</li>
      <li><strong>Answer everything.</strong> There is no penalty for a wrong answer; flag the long scenarios and come back.</li>
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
      This is an independent study aid. It is not affiliated with, endorsed by, or produced by Google LLC, and none of these
      questions are real exam questions — they are written to the topics in the published exam guide and its case studies.
      Product names, prices and exam details change; check the official page before you book.
    </p>
  </section>

  <div class="cta">
    <button class="btn btn-primary lg" onclick={() => quiz.startMode('full')}>Start the 2-hour exam</button>
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

  .stage .case-link a {
    color: var(--text);
    text-underline-offset: 3px;
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
