<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import type { Section } from '@/types';

  const exam = $derived(quiz.activeExam);

  function partLabel(section: Section) {
    const part = section.partId ? exam.partById[section.partId] : undefined;
    return part ? `Section ${part.number} · ${part.name}` : 'Extra practice';
  }

  const stages = [
    {
      n: '01',
      title: 'Registration & document screening',
      body: 'You fill in the form on the official site — name, contact, current education — pick the category that best represents your background (Tech, Design, or Others), and upload your CV and portfolio. This is screened before anyone is invited to the test.'
    },
    {
      n: '02',
      title: 'Online test',
      body: 'A timed, remotely proctored multiple-choice test taken on a scheduled day: 120 minutes for around 50 questions, split into Section 1 — Logic Test (about 35) and Section 2 — Programming Test (about 15). Everything is in English.'
    },
    {
      n: '03',
      title: 'Focus group discussion',
      body: 'Held onsite. Applicants are called in groups of around eight, then split into fours for a discussion of roughly 15 minutes. The topics are deliberately non-technical — how you would measure productivity, a social issue — and there is no right answer: assessors sit in and tally how each person participates.'
    },
    {
      n: '04',
      title: 'Announcement',
      body: 'Results are announced by email. Some applicants are placed on a waiting list rather than accepted or rejected outright.'
    }
  ];

  const facts = [
    ['Duration', '120 minutes for roughly 50 questions — about two and a half minutes each.'],
    ['Sections', 'Two: Section 1 — Logic Test, then Section 2 — Programming Test.'],
    ['Design questions', 'None on the Tech-division paper. Design and product sense belong to the Design category, and to the group interview.'],
    ['Language', 'Every question is in English.'],
    ['Programming language', 'None required — questions use pseudocode, so any language background works.'],
    ['Format', 'Multiple choice.'],
    ['Weighting', 'Mostly logic: around 35 logic questions to 15 programming ones.'],
    ['Where', 'From home, on your own device, with webcam monitoring and anti-cheating software running.'],
    ['When', 'After the document screening you are emailed an invitation and given a window of about ten days to sit it.'],
    ['Conditions', 'Quiet room, stable connection, webcam required. If you disconnect the test pauses and can be resumed.']
  ];

  const sources = [
    {
      label: 'Apple Developer Academy Indonesia — Knowledge base: Selection Process',
      url: 'https://contact.developeracademy.id/helpdesk/KB/Category/626842-selection-process'
    },
    {
      label: 'Knowledge base — What will be tested in the Online Test?',
      url: 'https://contact.developeracademy.id/helpdesk/KB/View/95362437-what-will-be-tested-in-the-online-test-'
    },
    {
      label: 'Knowledge base — What is the selection process?',
      url: 'https://contact.developeracademy.id/helpdesk/KB/View/95362494-what-is-the-selection-process-'
    },
    {
      label: 'Apple Developer Academy @ BINUS — FAQ',
      url: 'https://apple.ac.id/faq/'
    },
    {
      label: 'Andi Ardhian — Pengalaman Mengikuti Test Masuk Apple Developer Academy Binus Batch 2',
      url: 'https://medium.com/@andiardhiandg/pengalaman-mengikuti-test-masuk-apple-developer-academy-binus-batch-2-9c09bf6ca30d'
    },
    {
      label: 'Galang Aji Susanto — Jalan Panjang Menuju Apple Developer Academy',
      url: 'https://galangaji.medium.com/jalan-panjang-menuju-apple-developer-academy-be-world-class-developer-e793eba057d4'
    },
    {
      label: 'rzkihdyh — My Experience Applying to Apple Developer Academy',
      url: 'https://medium.com/@rzkihdyh_/my-experience-applying-to-apple-developer-academy-c3578305ca45'
    },
    {
      label: 'AssessmentDay — Logical Reasoning Test 1 (the grid-of-symbols format)',
      url: 'https://www.assessmentday.co.uk/logic/free/LogicalReasoningTest1/LogicalReasoningTest1-Questions.pdf'
    },
    {
      label: 'AssessmentDay — Logical Reasoning Tests overview (Talent Q, Kenexa, Raven’s formats)',
      url: 'https://www.assessmentday.com/logical-reasoning.htm'
    },
    {
      label: 'IndiaBix — Figure Matrix (the 3×3-with-one-cell-missing format)',
      url: 'https://www.indiabix.com/non-verbal-reasoning/figure-matrix/'
    }
  ];
</script>

<div class="page wrap rise">
  <header class="head">
    <p class="eyebrow">Background</p>
    <h1>What the online test actually looks like</h1>
    <p class="lede">
      The Academy does not publish a syllabus. What follows is assembled from its own knowledge
      base plus first-hand accounts written by people who sat the test. Treat it as a well-informed
      picture, not a guarantee — the paper changes between batches and between campuses.
    </p>
  </header>

  <section class="block">
    <h2>The four stages</h2>
    <div class="stages">
      {#each stages as stage (stage.n)}
        <div class="stage card">
          <span class="n mono">{stage.n}</span>
          <h3>{stage.title}</h3>
          <p>{stage.body}</p>
        </div>
      {/each}
    </div>
  </section>

  <section class="block">
    <h2>Test facts</h2>
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
    <h2>What gets asked</h2>
    <p class="block-lede">
      Section 1 is logic, written and picture-based. Section 2 is programming: the official
      knowledge base lists basic programming and object-oriented programming, and elsewhere
      mentions basic code understanding, Git, terminal commands and backend concepts. The bank
      holds {exam.bankSize} questions, including two sets the Tech paper does not ask but that are
      worth drilling anyway.
    </p>
    <div class="topics">
      {#each exam.sections as section (section.id)}
        <div class="topic card">
          <div class="topic-head">
            <span class="icon" aria-hidden="true">{section.icon}</span>
            <h3>{section.name}</h3>
            <span class="count mono">{section.questions.length} in bank</span>
          </div>
          <p class="part-label" class:extra={!section.partId}>{partLabel(section)}</p>
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
    <h2>The paper this simulator follows</h2>
    <p class="block-lede">
      Test duration 120 minutes, two sections, no design block. That is the shape the presets are
      built around:
    </p>
    <div class="shapes">
      <div class="shape card">
        <p class="eyebrow">Section 1 · about 35 questions</p>
        <p class="shape-body">
          <strong>Logic Test.</strong> Described as "very similar to an IQ test": visual patterns —
          a sequence of shapes or circles with one missing — number sequences in the style of SNBT
          quantitative reasoning, probability, and seating-arrangement puzzles with conditional
          constraints. Clear thinking under time pressure, not memorised formulas.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">Section 2 · about 15 questions</p>
        <p class="shape-body">
          <strong>Programming Test.</strong> Variables and data types, if-else, how a loop behaves,
          predicting the output of a snippet, telling a number apart from a numeral stored as text,
          and naming OOP concepts such as inheritance and polymorphism from a piece of code. The
          language is not one you need to know — the syntax is deliberately readable.
        </p>
      </div>
    </div>
    <p class="aside">
      The "IQ test" description matters: a large share of Section 1 is
      <strong>picture-based</strong> rather than written — matrices, shape series, rotations and
      mirrors, folded paper, cube nets. The real paper does not separate the two, and neither does
      a preset here: they are drawn from the same block and shuffled together. They are listed as
      separate sections only so you can drill them one at a time. The same goes for the OOP
      questions inside Section 2.
    </p>
    <p class="aside">
      The two halves are not equal: accounts agree the paper is <strong>mostly logic</strong>, with
      a smaller block of basic programming and OOP — about 35 questions against 15, which is the
      split the presets here follow.
    </p>
    <p class="aside">
      Older write-ups describe a shorter 45-minute paper with a two-question bonus round on design
      and business sense. The Tech-division paper does not include it, so this simulator keeps the
      design questions out of every preset and leaves them as an optional drill.
    </p>
  </section>

  <section class="block">
    <h2>The harder cousin: inductive reasoning grids</h2>
    <p class="block-lede">
      Graduate-scheme test publishers — AssessmentDay, Talent Q, Korn Ferry Elements, and Raven's
      Progressive Matrices before them — use a tougher version of the same skill. You get a 3×3
      grid of symbols with one cell missing and <strong>twelve</strong> candidate tiles, typically
      10 questions in 11 minutes.
    </p>
    <div class="shapes">
      <div class="shape card">
        <p class="eyebrow">Why twelve options change everything</p>
        <p class="shape-body">
          With four options you can often eliminate your way to the answer. With twelve — usually
          the full cross-product of the two attributes in play — elimination collapses. You have to
          read both rules and construct the missing tile in your head <em>before</em> looking at the
          answers.
        </p>
      </div>
      <div class="shape card">
        <p class="eyebrow">How to attack one</p>
        <p class="shape-body">
          Work one attribute at a time. Read across a row to find what the columns control, then
          down a column to find what the rows control. Name the answer out loud — "solid triangle" —
          and only then scan the twelve tiles for it.
        </p>
      </div>
    </div>
    <p class="aside">
      This format is <strong>deliberately kept out of the Academy presets</strong>, which applicants
      consistently describe as four-option questions. It has its own timed paper on the start page,
      because it is excellent training: if you can hold two rules in your head against twelve
      options, the four-option version stops being difficult.
    </p>
  </section>

  <section class="block">
    <h2>How to prepare</h2>
    <ol class="tips">
      <li>
        <strong>Drill logic first — it is the biggest block.</strong> Number and letter series,
        syllogisms and analogies are all pattern recognition, and they get dramatically faster with
        repetition. Applicants who have sat it recommend practising IQ-style questions or SNBT
        logic problems; the Section 1 drill here is built from exactly that material.
      </li>
      <li>
        <strong>Practise the picture questions separately.</strong> Figural items reward a fixed
        checklist — count the sides, count the dots, check the shading, check the rotation, check
        for a mirror — far more than they reward staring. Learning to run that checklist quickly is
        the single biggest time saver on the paper.
      </li>
      <li>
        <strong>Get comfortable reading pseudocode you did not write.</strong> Most programming
        questions are trace-the-output, not write-the-code. Practise stepping through loops on paper.
      </li>
      <li>
        <strong>Learn OOP vocabulary properly.</strong> Constructors, inheritance, polymorphism,
        overloading vs overriding, and value vs reference types come up repeatedly — often as "which
        concept is this snippet showing?". If you have no programming background, a few videos on
        the basics genuinely are enough; applicants describe the level as very learnable.
      </li>
      <li>
        <strong>Treat the FGD as its own exam.</strong> It is offline, about fifteen minutes, in a
        group of four, on a deliberately non-technical topic, and the assessors are marking how you
        participate. Speak early, react to what others said rather than reciting your own point,
        pull the quiet person in, and do not run the whole discussion yourself.
      </li>
      <li>
        <strong>Do not neglect the rest of the application.</strong> The Academy states plainly that
        the test result is not the sole factor — your CV, portfolio, motivation letter and the group
        interview all count. Selection favours people who show proficiency, a real motivation to
        learn, and the ability to collaborate.
      </li>
      <li>
        <strong>Answer everything.</strong> Nothing in any account suggests a penalty for a wrong
        answer, so leaving a blank simply throws away a chance.
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
      Apple Inc. or the Apple Developer Academy, and none of these questions are real test
      questions — they are written to match the reported topics and difficulty.
    </p>
  </section>

  <div class="cta">
    <button class="btn btn-primary lg" onclick={() => quiz.startMode('tech')}>
      Start the 120-minute test
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
    font-size: clamp(30px, 5vw, 44px);
    letter-spacing: -0.03em;
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

  /* container-lines: mini squares where each section rule meets the guides */
  .block::before,
  .block::after {
    content: '';
    position: absolute;
    top: -2.5px;
    width: 5px;
    height: 5px;
    background: var(--line-strong);
  }

  .block::before {
    left: 0;
  }

  .block::after {
    right: 0;
  }

  .block h2 {
    font-size: 23px;
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
    font-family: var(--font-mono);
    font-size: 11px;
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
    font-family: var(--font-mono);
    font-size: 11.5px;
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
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
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
    border-radius: 7px;
    background: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 600;
  }

  .topic-head h3 {
    flex: 1;
    font-size: 17px;
  }

  .count {
    font-size: 11px;
    color: var(--text-tertiary);
  }

  .topic p {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* Beats `.topic p` on specificity, so it has to stay a two-class selector. */
  .topic .part-label {
    margin-top: 12px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .topic .part-label.extra {
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 14px;
  }

  .tag {
    padding: 3px 8px;
    border-radius: 5px;
    border: 1px solid var(--line);
    background: var(--bg-sunken);
    font-size: 11.5px;
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

  .aside {
    margin-top: 16px;
    font-size: 14px;
    line-height: 1.65;
    color: var(--text-secondary);
  }

  .aside strong {
    color: var(--text);
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
