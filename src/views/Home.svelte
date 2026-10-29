<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import { REVIEWABLE_ATTEMPTS } from '@/state/storage';
  import { formatDate, formatDuration } from '@/utils/format';
  import { modeQuestionLabel, blueprintLabel } from '@/core';
  import type { PaperSet, Section } from '@/types';

  const exam = $derived(quiz.activeExam);

  const best = $derived(
    quiz.history.length ? Math.max(...quiz.history.map((h) => h.percent)) : null
  );

  const fullTest = $derived(exam.fullModeId ? exam.modeById[exam.fullModeId] : undefined);

  // Block numbers follow the blocks actually shown, so an exam without sets
  // still reads 01, 02, 03.
  const hasSets = $derived(exam.sets.length > 0);
  const ordinal = (n: number) => String(n).padStart(2, '0');
  const blockNo = $derived({
    papers: ordinal(1),
    sets: ordinal(2),
    topics: ordinal(hasSets ? 3 : 2),
    sections: ordinal(hasSets ? 4 : 3),
    attempts: ordinal(hasSets ? 5 : 4)
  });

  /** Best score and sitting count per fixed set, from the attempt history. */
  const setStats = $derived.by(() => {
    const stats: Record<string, { best: number; sat: number }> = {};
    for (const h of quiz.history) {
      if (!h.setId) continue;
      const s = (stats[h.setId] ??= { best: 0, sat: 0 });
      s.best = Math.max(s.best, h.percent);
      s.sat += 1;
    }
    return stats;
  });

  const setMinutes = (count: number) => Math.round(count * (exam.setMinutesPerQuestion ?? 2.4));
  const setsDone = $derived(exam.sets.filter((s) => setStats[s.id]).length);

  /** Sets under their group headings, in the order the exam lists them; ungrouped sets come last. */
  const BANK_GROUP = 'Community bank';
  const setGroups = $derived.by(() => {
    const groups: { name: string; sets: PaperSet[] }[] = [];
    for (const set of exam.sets) {
      const name = set.group ?? BANK_GROUP;
      let group = groups.find((g) => g.name === name);
      if (!group) groups.push((group = { name, sets: [] }));
      group.sets.push(set);
    }
    return groups;
  });
  const grouped = $derived(exam.sets.some((s) => s.group));

  // Drills follow the paper's own parts when it has them, with everything the
  // paper does not ask collected under one clearly-labelled extra group. An
  // exam without parts — one flat list of domains — gets a single group.
  const drillGroups = $derived.by(() => {
    const groups = exam.parts.map((part) => ({
      key: part.id,
      title: `Section ${part.number} · ${part.name}`,
      note: part.blurb,
      sections: exam.sections.filter((s) => s.partId === part.id)
    }));
    const loose = exam.sections.filter((s) => !s.partId);
    if (loose.length) {
      groups.push({
        key: 'extra',
        title: exam.parts.length ? 'Extra practice' : exam.home.sectionsTitle ?? 'Sections',
        note: exam.home.extraNote ?? '',
        sections: loose
      });
    }
    return groups;
  });

  // One block of topic cards per section that has any topic worth drilling.
  const topicGroups = $derived(
    exam.sections
      .map((section) => ({
        section,
        topics: exam.drillTopics.filter((t) => t.section.id === section.id)
      }))
      .filter((g) => g.topics.length)
  );

  /** The topics still too thin for a card of their own — chips on the section row. */
  function smallTopicsOf(section: Section) {
    return exam.topics.filter((t) => t.section.id === section.id && t.count < exam.drillMin);
  }

  function practiceCounts(section: Section) {
    const n = section.questions.length;
    return [10, 20, n].filter((c, i, arr) => c <= n && arr.indexOf(c) === i);
  }
</script>

<div class="page">
  {#if quiz.resumable}
    <div class="resume card">
      <div>
        <p class="eyebrow">Unfinished paper</p>
        <p class="resume-title">{quiz.resumable.label}</p>
        <p class="resume-meta">
          {quiz.resumable.answers.filter((a) => a !== null).length} of
          {quiz.resumable.paper.length} answered
          {#if quiz.resumable.deadline}
            · {formatDuration(Math.max(0, quiz.resumable.deadline - Date.now()))} left on the clock
          {/if}
        </p>
      </div>
      <div class="resume-actions">
        <button class="btn btn-secondary" onclick={() => quiz.discardResumable()}>Discard</button>
        <button class="btn btn-primary" onclick={() => quiz.resume()}>Resume</button>
      </div>
    </div>
  {/if}

  <section class="hero rise">
    <p class="eyebrow">{exam.home.eyebrow}</p>
    <h1>
      {#each exam.home.title.split('\n') as line, i (i)}
        <span class="reveal" style="--i:{i}"><span>{line}</span></span>
      {/each}
    </h1>
    <!-- Home copy is authored in the exam definition, never user input. -->
    <p class="lede">
      {@html exam.home.lede}
      {exam.bankSize} questions in the bank, every one with a written explanation.
    </p>
    <div class="hero-actions">
      <button class="btn btn-primary lg" onclick={() => quiz.startFullTest()}>
        {exam.home.startLabel}
      </button>
      {#if exam.about}
        <button class="btn btn-secondary lg" onclick={() => (quiz.view = 'about')}>
          {exam.home.aboutLabel}
        </button>
      {/if}
      {#if exam.cheatsheet}
        <button class="btn btn-ghost lg" onclick={() => (quiz.view = 'cheatsheet')}>
          Cheat sheet →
        </button>
      {/if}
    </div>

    <dl class="stats">
      <div><dt>Questions in bank</dt><dd>{exam.bankSize}</dd></div>
      {#if fullTest}
        <div><dt>Full test</dt><dd>{modeQuestionLabel(fullTest)} q · {fullTest.minutes}m</dd></div>
      {/if}
      <div><dt>Papers attempted</dt><dd>{quiz.history.length}</dd></div>
      <div><dt>Best score</dt><dd>{best === null ? '—' : best + '%'}</dd></div>
    </dl>
  </section>

  <section class="block">
    <div class="rule"></div>
    <header class="block-head">
      <h2><span class="num">{blockNo.papers}</span>Choose a paper</h2>
      <p>Questions and answer options are shuffled on every attempt.</p>
    </header>

    <div class="modes">
      {#each exam.modes as mode, i (mode.id)}
        <article class="mode card rise" style="--i:{i + 3}">
          <p class="eyebrow">{mode.tagline}</p>
          <h3>{mode.name}</h3>
          <p class="mode-desc">{mode.description}</p>

          <ul class="blueprint">
            {#each exam.sections as section (section.id)}
              {#if mode.blueprint[section.id]}
                <li>
                  <span>{section.short}</span>
                  <span class="mono">{blueprintLabel(mode.blueprint[section.id])}</span>
                </li>
              {/if}
            {/each}
          </ul>

          <div class="mode-foot">
            <span class="mono">{modeQuestionLabel(mode)} questions · {mode.minutes} min</span>
            <button class="btn btn-primary" onclick={() => quiz.startMode(mode.id)}>Start</button>
          </div>
        </article>
      {/each}
    </div>
  </section>

  {#if hasSets}
    <section class="block">
      <div class="rule"></div>
      <header class="block-head">
        <h2><span class="num">{blockNo.sets}</span>Practice sets</h2>
        <p>
          Fixed papers: a set always holds the same questions — mixed across the sections it covers,
          never in bank order — but they come in a new order, with the options reshuffled, each sitting.
          {#if grouped}Sets are grouped by where they come from.{/if}
          Work through them one by one; {setsDone} of {exam.sets.length} sat so far.
        </p>
      </header>

      {#snippet setCard(set: PaperSet)}
        {@const stat = setStats[set.id]}
        {@const count = set.questionIds.length}
        {@const minutes = set.minutes ?? setMinutes(count)}
        <article class="set card" class:done={stat && stat.best >= 70}>
          <div class="set-head">
            <h4>{set.name}</h4>
            <span class="mono">{count} q</span>
          </div>
          {#if set.note}<p class="set-note">{set.note}</p>{/if}
          <p class="set-meta">
            {#if stat}
              Best <strong>{stat.best}%</strong> · sat {stat.sat}×
            {:else}
              Not sat yet
            {/if}
          </p>
          <div class="set-actions">
            <button class="btn btn-primary sm" onclick={() => quiz.startSet(set.id, minutes)}>
              Timed · {minutes} min
            </button>
            <button class="btn btn-ghost sm" onclick={() => quiz.startSet(set.id, 0)}>Study</button>
          </div>
        </article>
      {/snippet}

      {#if grouped}
        {#each setGroups as group (group.name)}
          {@const sat = group.sets.filter((s) => setStats[s.id]).length}
          <details class="set-group" open={group.name !== BANK_GROUP}>
            <summary>
              <h3>{group.name}</h3>
              <span class="mono">{group.sets.length} sets · {sat} sat</span>
            </summary>
            <div class="sets">
              {#each group.sets as set (set.id)}{@render setCard(set)}{/each}
            </div>
          </details>
        {/each}
      {:else}
        <div class="sets">
          {#each exam.sets as set (set.id)}{@render setCard(set)}{/each}
        </div>
      {/if}
    </section>
  {/if}

  <section class="block">
    <div class="rule"></div>
    <header class="block-head">
      <h2><span class="num">{blockNo.topics}</span>Topic drills <span class="tag">study mode</span></h2>
      <p>
        One topic at a time, untimed, every question with a written explanation — and a method tip
        where the question has one. Nothing here runs a clock: each question carries a
        <strong>Show suggested answer</strong> button, so you can check yourself as you go instead of
        waiting for the score. A drill draws {exam.drillSize} at random from the topic's pool, so two
        sittings are never the same paper. Any topic holding {exam.drillMin} questions or more gets a
        card; E/M/H is the easy, medium and hard split of the pool behind it.
      </p>
    </header>

    {#each topicGroups as group (group.section.id)}
      <div class="drill-group">
        <div class="drill-head">
          <h3>{group.section.name}</h3>
          <p>{group.topics.length} topics · {group.section.questions.length} questions</p>
        </div>
        <div class="focus">
          {#each group.topics as topic (topic.id)}
            <article class="focus-card card">
              <span class="focus-name">{topic.topic}</span>
              <span class="focus-meta">
                {topic.count} in the pool · {topic.easy}E {topic.medium}M {topic.hard}H
              </span>
              <div class="focus-actions">
                <button
                  class="btn btn-primary sm"
                  onclick={() => quiz.startTopicPractice(topic.id, exam.drillSize)}
                >
                  Drill {Math.min(exam.drillSize, topic.count)}
                </button>
                {#if topic.count > exam.drillSize}
                  <button
                    class="btn btn-ghost sm"
                    onclick={() => quiz.startTopicPractice(topic.id, topic.count)}
                  >
                    All {topic.count}
                  </button>
                {/if}
              </div>
            </article>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  <section class="block">
    <div class="rule"></div>
    <header class="block-head">
      <h2><span class="num">{blockNo.sections}</span>Or drill a whole section <span class="tag">study mode</span></h2>
      <p>Untimed too — the whole mixed section, or the few topics too small for a card above.</p>
    </header>

    {#each drillGroups as group (group.key)}
      <div class="drill-group">
        <div class="drill-head">
          <h3>{group.title}</h3>
          <p>{group.note}</p>
        </div>
        <div class="sections card">
          {#each group.sections as section, i (section.id)}
            <div class="section-row" class:first={i === 0}>
              <div class="section-icon" aria-hidden="true">{section.icon}</div>
              <div class="section-copy">
                <h4>{section.name}</h4>
                <p>{section.blurb}</p>
                {#if smallTopicsOf(section).length}
                  <details class="topic-list">
                    <summary>Smaller topics ({smallTopicsOf(section).length})</summary>
                    <div class="topic-chips">
                      {#each smallTopicsOf(section) as topic (topic.id)}
                        <button
                          class="chip-btn"
                          onclick={() => quiz.startTopicPractice(topic.id, topic.count)}
                        >
                          {topic.topic} <span class="mono">{topic.count}</span>
                        </button>
                      {/each}
                    </div>
                  </details>
                {/if}
              </div>
              <div class="section-actions">
                {#each practiceCounts(section) as count}
                  <button
                    class="btn btn-secondary sm"
                    onclick={() => quiz.startPractice(section.id, count, 0)}
                  >
                    {count === section.questions.length ? `All ${count}` : count}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </section>

  {#if quiz.history.length}
    <section class="block">
      <div class="rule"></div>
      <header class="block-head">
        <h2><span class="num">{blockNo.attempts}</span>Your attempts</h2>
        <button class="btn btn-ghost sm" onclick={() => quiz.clearHistory()}>Clear history</button>
      </header>
      <p class="block-note">
        The last {REVIEWABLE_ATTEMPTS} papers are kept in full, so you can reopen one and read every
        question and explanation again. Older rows keep their score only.
      </p>

      <div class="history card">
        {#each quiz.history as attempt, i (attempt.at)}
          <div class="history-row" class:first={i === 0}>
            <div class="history-main">
              <p class="history-label">{attempt.label}</p>
              <p class="history-meta">
                {formatDate(attempt.at)} · {formatDuration(attempt.elapsedMs)}
                {#if attempt.auto}· time expired{/if}
              </p>
            </div>
            <div class="history-score">
              {#if quiz.canReview(attempt.at)}
                <button class="btn btn-ghost sm" onclick={() => quiz.reviewAttempt(attempt.at)}>
                  Review
                </button>
              {/if}
              <span class="pct" class:good={attempt.percent >= 70} class:bad={attempt.percent < 50}>
                {attempt.percent}%
              </span>
              <span class="mono raw">{attempt.correct}/{attempt.total}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</div>

<style>
  .resume {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-top: 28px;
    padding: 18px 22px;
    border-left: 4px solid var(--mint);
    background: var(--stone);
  }

  .resume-title {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 400;
    margin-top: 2px;
    letter-spacing: -0.3px;
  }

  .resume-meta {
    font-family: var(--font);
    font-size: 12px;
    color: var(--text-secondary);
  }

  .resume-actions {
    display: flex;
    gap: 8px;
  }

  .hero {
    padding: 64px 0 48px;
    max-width: 780px;
  }

  .hero h1 {
    margin-top: 16px;
    font-size: var(--type-hero);
    line-height: 1.15;
    letter-spacing: -0.4px;
  }

  .lede {
    margin-top: 20px;
    max-width: 620px;
    font-size: var(--type-lead);
    line-height: 1.4;
    color: var(--text-secondary);
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 30px;
  }

  .lg {
    padding: 13px 26px;
    font-size: 15.5px;
  }

  .sm {
    padding: 7px 14px;
    font-size: 13px;
  }

  /* Key figures on a bracketed strip of slightly darker paper. */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
    gap: 8px 28px;
    margin: 44px 0 0;
    padding: 24px;
    background: var(--stone);
  }

  .stats div {
    display: flex;
    flex-direction: column-reverse;
  }

  .stats dt {
    font-family: var(--font);
    font-size: var(--type-label);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .stats dd {
    margin: 0;
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 400;
    letter-spacing: -0.3px;
    font-variant-numeric: tabular-nums;
  }

  .block {
    padding: 8px 0 36px;
  }

  .block-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px 16px;
    margin: 28px 0 20px;
  }

  .block-head h2 {
    display: flex;
    align-items: baseline;
    gap: 14px;
    font-size: var(--type-h2);
  }

  /* Names the untimed mode on the page itself, so "study mode" is findable
     before you are already inside a paper. */
  .block-head h2 .tag {
    padding: 3px 9px;
    border-radius: var(--radius-control);
    background: var(--mint);
    color: #1a1a1a;
    font-family: var(--font);
    font-size: var(--type-label);
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .block-head p {
    font-size: 13.5px;
    color: var(--text-tertiary);
    max-width: 640px;
  }

  .modes {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  .mode {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: 24px;
    transition: background-color var(--dur-micro) var(--ease);
  }

  .mode:hover {
    background: var(--stone-strong);
  }

  .mode h3 {
    margin-top: 6px;
    font-size: var(--type-h4);
  }

  .mode-desc {
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .blueprint {
    list-style: none;
    margin: 18px 0 0;
    padding: 14px 0 0;
    border-top: 1px solid var(--line);
  }

  .blueprint li {
    display: flex;
    justify-content: space-between;
    padding: 3px 0;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .mode-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 20px;
  }

  .mode-foot span {
    font-size: var(--type-label);
    color: var(--text-tertiary);
  }

  .sections,
  .block-note {
    margin: -6px 0 18px;
    max-width: 620px;
    font-size: 13.5px;
    line-height: 1.6;
    color: var(--text-tertiary);
  }

  .history {
    overflow: hidden;
  }

  .focus {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(188px, 1fr));
    gap: 12px;
  }

  .focus-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 16px 18px;
    text-align: left;
    transition: background-color var(--dur-micro) var(--ease);
  }

  .focus-card:hover {
    background: var(--stone-strong);
  }

  .focus-name {
    font-family: var(--font-display);
    font-size: 15.5px;
    font-weight: 400;
    letter-spacing: -0.3px;
  }

  .focus-meta {
    font-family: var(--font);
    font-size: var(--type-label);
    color: var(--text-tertiary);
  }

  .focus-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .topic-list {
    margin-top: 10px;
  }

  .topic-list summary {
    display: inline-block;
    font-family: var(--font);
    font-size: var(--type-label);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--ink);
    text-decoration: underline;
    text-decoration-color: var(--mint);
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    cursor: pointer;
  }

  .topic-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }

  .chip-btn {
    padding: 5px 11px;
    border: 1px solid var(--line);
    border-radius: var(--radius-control);
    background: var(--surface);
    font-size: 13px;
    color: var(--text-secondary);
    transition: border-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .chip-btn:hover {
    border-color: var(--ink);
    color: var(--ink);
  }

  .chip-btn .mono {
    margin-left: 4px;
    font-size: var(--type-label);
    color: var(--text-tertiary);
  }

  .drill-group + .drill-group {
    margin-top: 26px;
  }

  .drill-head {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 14px;
    margin-bottom: 10px;
  }

  .drill-head h3 {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: -0.3px;
  }

  .drill-head p {
    flex: 1;
    min-width: 200px;
    font-size: 13px;
    color: var(--text-tertiary);
  }

  .section-row {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 20px 22px;
    border-top: 1px solid var(--line);
  }

  .section-row.first,
  .history-row.first {
    border-top: none;
  }

  .section-icon {
    width: 40px;
    height: 40px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1px solid var(--border-strong);
    border-radius: 0;
    background: var(--bg-sunken);
    color: var(--text);
    font-family: var(--font);
    font-size: 12.5px;
    font-weight: 600;
  }

  .section-copy {
    flex: 1;
    min-width: 0;
  }

  .section-copy h4 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 400;
    letter-spacing: -0.3px;
  }

  .section-copy p {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .section-actions {
    display: flex;
    flex: none;
    gap: 6px;
  }

  .history-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 14px 22px;
    border-top: 1px solid var(--line);
  }

  .history-label {
    font-size: 15px;
    font-weight: 500;
  }

  .history-meta {
    font-family: var(--font);
    font-size: var(--type-label);
    color: var(--text-tertiary);
  }

  .history-score {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pct {
    font-family: var(--font-display);
    font-size: 19px;
    font-weight: 400;
    color: var(--amber);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.3px;
  }

  .pct.good {
    color: var(--green);
  }

  .pct.bad {
    color: var(--red);
  }

  .raw {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  @media (max-width: 620px) {
    .hero {
      padding: 40px 0 28px;
    }

    .section-row {
      flex-wrap: wrap;
    }

    .section-actions {
      width: 100%;
      padding-left: 58px;
    }
  }

  .sets {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .set {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px;
    border-left: 4px solid transparent;
    transition: background-color var(--dur-micro) var(--ease);
  }

  .set:hover {
    background: var(--stone-strong);
  }

  /* A set passed at the usual bar gets the highlighter edge. */
  .set.done {
    border-left-color: var(--mint);
  }

  .set-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .set-head h4 {
    font-size: var(--type-h4);
  }

  /* Groups of sets — the course modules, the tryouts, the community bank. */
  .set-group + .set-group {
    margin-top: 24px;
  }

  .set-group summary {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 0;
    margin-bottom: 14px;
    border-bottom: 1px solid var(--line);
    cursor: pointer;
    list-style: none;
  }

  .set-group summary::-webkit-details-marker {
    display: none;
  }

  .set-group summary h3 {
    font-size: var(--type-h4);
  }

  .set-group summary h3::before {
    content: '▸';
    display: inline-block;
    width: 1.1em;
    color: var(--text-tertiary);
    transition: transform var(--dur-micro) var(--ease);
  }

  .set-group[open] summary h3::before {
    transform: rotate(90deg);
  }

  .set-group summary .mono {
    flex-shrink: 0;
    color: var(--text-tertiary);
    font-size: var(--type-label);
  }

  .set-head .mono {
    color: var(--text-tertiary);
    font-size: var(--type-label);
  }

  .set-meta {
    font-size: var(--type-small);
    color: var(--text-secondary);
  }

  .set-meta strong {
    color: var(--ink);
    font-weight: 600;
  }

  .set-note {
    margin-top: -4px;
    font-size: var(--type-small);
    color: var(--text-secondary);
  }

  .set-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
</style>
