<script>
  import { quiz, formatDuration } from './quiz.svelte.js';

  const r = $derived(quiz.results);
  const timedOut = $derived(quiz.deadline > 0 && quiz.submittedAt >= quiz.deadline);

  const verdict = $derived(quiz.exam.verdict(r.percent));

  // Circle geometry for the score ring.
  const R = 52;
  const C = 2 * Math.PI * R;

  function openReview() {
    quiz.view = 'review';
    window.scrollTo(0, 0);
  }
</script>

<div class="page wrap rise">
  <p class="eyebrow">{quiz.label}{timedOut ? ' · time expired' : ''}</p>

  <div class="hero card raised edge bracket">
    <div class="ring-wrap">
      <svg viewBox="0 0 120 120" class="ring" aria-hidden="true">
        <circle cx="60" cy="60" r={R} class="track" />
        <circle
          cx="60"
          cy="60"
          r={R}
          class="value"
          class:good={r.percent >= 70}
          class:bad={r.percent < 50}
          stroke-dasharray="{C}"
          stroke-dashoffset={C - (C * r.percent) / 100}
        />
      </svg>
      <div class="ring-label">
        <strong>{r.percent}<span>%</span></strong>
        <span class="mono">{r.correct} of {r.total}</span>
      </div>
    </div>

    <div class="verdict">
      <h1>{verdict.title}</h1>
      <p>{verdict.note}</p>
      <dl class="facts">
        <div><dt>Correct</dt><dd>{r.correct}</dd></div>
        <div><dt>Incorrect</dt><dd>{r.total - r.correct - r.unanswered}</dd></div>
        <div><dt>Unanswered</dt><dd>{r.unanswered}</dd></div>
        <div><dt>Time used</dt><dd>{formatDuration(r.elapsedMs)}</dd></div>
      </dl>
    </div>
  </div>

  <section class="breakdown">
    <div class="rule"></div>
    <h2><span class="num">01</span>By section</h2>
    {#each r.groups as group (group.key)}
      {@const pct = Math.round((group.correct / group.total) * 100)}
      <div class="group">
        <div class="row">
          <div class="row-head">
            <span class="name">
              {#if group.count > 1}<span class="n mono">Section {group.position}</span>{/if}
              {group.name}
            </span>
            <span class="score mono">{group.correct}/{group.total} · {pct}%</span>
          </div>
          <div class="track-bar">
            <div
              class="fill"
              class:good={pct >= 70}
              class:bad={pct < 50}
              style="width: {pct}%"
            ></div>
          </div>
          {#if group.unanswered}
            <p class="row-note">{group.unanswered} left unanswered</p>
          {/if}
        </div>

        {#if group.buckets.length > 1}
          <!-- The paper does not separate these, but knowing which half of a
               block cost you the marks is what makes the breakdown useful. -->
          <ul class="sub">
            {#each group.buckets as bucket (bucket.section.id)}
              {@const bp = Math.round((bucket.correct / bucket.total) * 100)}
              <li>
                <span class="sub-name">{bucket.section.name}</span>
                <span class="sub-bar" aria-hidden="true">
                  <span
                    class="fill"
                    class:good={bp >= 70}
                    class:bad={bp < 50}
                    style="width: {bp}%"
                  ></span>
                </span>
                <span class="score mono">{bucket.correct}/{bucket.total}</span>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </section>

  <div class="actions">
    <button class="btn btn-primary lg" onclick={openReview}>Review every question</button>
    {#if quiz.lastConfig}
      <button class="btn btn-secondary lg" onclick={() => quiz.restart()}>
        Take a fresh paper
      </button>
    {/if}
    <button class="btn btn-ghost lg" onclick={() => (quiz.view = 'home')}>Back to start</button>
  </div>
</div>

<style>
  .wrap {
    padding-top: 48px;
    padding-bottom: 72px;
    max-width: 800px;
  }

  .hero {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 36px;
    margin-top: 12px;
    padding: 34px;
  }

  .num {
    margin-right: 14px;
  }

  .ring-wrap {
    position: relative;
    flex: none;
    width: 160px;
    height: 160px;
  }

  .ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .ring circle {
    fill: none;
    stroke-width: 10;
    stroke-linecap: round;
  }

  .track {
    stroke: var(--bg-sunken);
  }

  .ring-label .mono {
    font-variant-numeric: tabular-nums;
  }

  .value {
    stroke: var(--amber);
    transition: stroke-dashoffset 0.9s var(--ease);
  }

  .value.good {
    stroke: var(--green);
  }

  .value.bad {
    stroke: var(--red);
  }

  .ring-label {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
  }

  .ring-label strong {
    font-size: 40px;
    font-weight: 600;
    letter-spacing: -0.03em;
    line-height: 1;
  }

  .ring-label strong span {
    font-size: 20px;
    color: var(--text-tertiary);
  }

  .ring-label .mono {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .verdict {
    flex: 1;
    min-width: 240px;
  }

  .verdict h1 {
    font-size: 27px;
  }

  .verdict p {
    margin-top: 10px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
    gap: 4px 16px;
    margin: 24px 0 0;
    padding-top: 18px;
    border-top: 1px solid var(--line);
  }

  .facts div {
    display: flex;
    flex-direction: column-reverse;
  }

  .facts dt {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .facts dd {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
  }

  .breakdown {
    margin-top: 44px;
  }

  .breakdown h2 {
    font-size: 22px;
    margin: 26px 0 18px;
  }

  .group + .group {
    margin-top: 26px;
  }

  .n {
    padding: 2px 7px;
    margin-right: 8px;
    border-radius: 4px;
    background: var(--accent-soft);
    color: var(--accent);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .sub {
    list-style: none;
    margin: 12px 0 0;
    padding: 0 0 0 2px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .sub li {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 13px;
    color: var(--text-secondary);
  }

  .sub-name {
    flex: none;
    width: 190px;
  }

  .sub-bar {
    flex: 1;
    height: 4px;
    border-radius: 1px;
    background: var(--bg-sunken);
    overflow: hidden;
  }

  .sub-bar .fill {
    display: block;
  }

  @media (max-width: 560px) {
    .sub-name {
      width: 120px;
    }
  }

  .row-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;
  }

  .name {
    font-size: 15px;
    font-weight: 500;
  }

  .score {
    font-size: 12.5px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .track-bar {
    height: 6px;
    border-radius: 2px;
    background: var(--bg-sunken);
    border: 1px solid var(--line);
    overflow: hidden;
  }

  .fill {
    height: 100%;
    border-radius: 1px;
    background: var(--amber);
    transition: width 0.8s var(--ease);
  }

  .fill.good {
    background: var(--green);
  }

  .fill.bad {
    background: var(--red);
  }

  .row-note {
    margin-top: 6px;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 44px;
  }

  .lg {
    padding: 13px 26px;
    font-size: 15px;
  }

  @media (max-width: 620px) {
    .hero {
      padding: 26px;
      gap: 24px;
      justify-content: center;
    }
  }
</style>
