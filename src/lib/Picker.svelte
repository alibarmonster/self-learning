<script>
  import { quiz, readHistory, readResumable, formatDate } from './quiz.svelte.js';
  import { EXAMS } from './exams/index.js';
  import { modeQuestionLabel } from './bank.js';

  // Read once per visit to the picker; the numbers only change inside an exam.
  const cards = EXAMS.map((exam) => {
    const history = readHistory(exam);
    const full = exam.modeById[exam.fullModeId] ?? null;
    return {
      exam,
      full,
      history,
      best: history.length ? Math.max(...history.map((h) => h.percent)) : null,
      last: history[0] ?? null,
      resumable: readResumable(exam)
    };
  });
</script>

<div class="page">
  <section class="hero rise">
    <p class="eyebrow">Personal exam prep</p>
    <h1>
      <span class="reveal" style="--i:0"><span>Which test are</span></span>
      <span class="reveal" style="--i:1"><span>you sitting?</span></span>
    </h1>
    <p class="lede">
      One place for every paper you are preparing for. Each exam keeps its own question bank,
      timed presets, topic drills and attempt history.
    </p>
  </section>

  <div class="rule"></div>

  <div class="exams">
    {#each cards as card, i (card.exam.id)}
      <article class="exam card rise" data-exam={card.exam.id} style="--i:{i + 2}">
        <div class="exam-head">
          <span class="exam-mark" aria-hidden="true">{card.exam.icon}</span>
          <div class="exam-title">
            <p class="eyebrow">{card.exam.tagline}</p>
            <h2>{card.exam.name}</h2>
          </div>
        </div>

        <p class="exam-blurb">{card.exam.blurb}</p>

        <dl class="stats">
          {#if card.full}
            <div>
              <dt>Full test</dt>
              <dd>{modeQuestionLabel(card.full)} q · {card.full.minutes}m</dd>
            </div>
            <div><dt>In the bank</dt><dd>{card.exam.bankSize}</dd></div>
            <div><dt>Attempts</dt><dd>{card.history.length}</dd></div>
            <div><dt>Best</dt><dd>{card.best === null ? '—' : card.best + '%'}</dd></div>
          {:else}
            <div><dt>Ready now</dt><dd>Cheat sheet</dd></div>
            <div><dt>Sheet groups</dt><dd>{card.exam.cheatsheet?.groups.length ?? 0}</dd></div>
            <div><dt>Exam sections</dt><dd>{card.exam.sections.length}</dd></div>
            <div><dt>Question bank</dt><dd>Not yet</dd></div>
          {/if}
        </dl>

        <div class="exam-foot">
          {#if !card.full}
            <span class="note">Cheat sheet only — question bank still to come</span>
          {:else if card.resumable}
            <span class="note resume">
              Unfinished · {card.resumable.answers.filter((a) => a !== null).length}/{card
                .resumable.paper.length} answered
            </span>
          {:else if card.last}
            <span class="note">Last sat {formatDate(card.last.at)} · {card.last.percent}%</span>
          {:else}
            <span class="note">Not attempted yet</span>
          {/if}
          <button class="btn btn-primary" onclick={() => quiz.enterExam(card.exam)}>
            {!card.full ? 'Open cheat sheet' : card.resumable ? 'Continue' : 'Open'}
          </button>
        </div>
      </article>
    {/each}
  </div>
</div>

<style>
  .hero {
    padding: 64px 0 36px;
    max-width: 720px;
  }

  .hero h1 {
    margin-top: 16px;
    font-size: clamp(34px, 6vw, 54px);
    letter-spacing: -0.03em;
  }

  .lede {
    margin-top: 18px;
    max-width: 560px;
    font-size: 17px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .exams {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 18px;
    padding: 28px 0 24px;
  }

  .exam {
    display: flex;
    flex-direction: column;
    padding: 24px 26px 22px;
    transition:
      border-color var(--dur-ui) var(--ease),
      transform var(--dur-ui) var(--ease),
      box-shadow var(--dur-ui) var(--ease);
  }

  .exam:hover {
    border-color: var(--border-strong);
    transform: translateY(-3px);
    box-shadow: var(--shadow);
  }

  .exam-head {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .exam-mark {
    width: 42px;
    height: 42px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--text);
    border-radius: 9px;
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
    position: relative;
  }

  .exam-mark::after {
    content: '';
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 9px;
    height: 9px;
    border-radius: 2px;
    background: var(--accent);
    border: 2px solid var(--bg-elevated);
  }

  .exam-title {
    min-width: 0;
  }

  .exam h2 {
    margin-top: 4px;
    font-size: 21px;
  }

  .exam-blurb {
    margin-top: 16px;
    font-size: 14.5px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px 16px;
    margin: 20px 0 0;
    padding-top: 16px;
    border-top: 1px solid var(--line);
  }

  .stats div {
    display: flex;
    flex-direction: column-reverse;
  }

  .stats dt {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .stats dd {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    letter-spacing: -0.02em;
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .exam-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: auto;
    padding-top: 22px;
  }

  .note {
    font-family: var(--font-mono);
    font-size: 11.5px;
    color: var(--text-tertiary);
  }

  .note.resume {
    color: var(--amber);
  }

  @media (max-width: 620px) {
    .hero {
      padding: 40px 0 24px;
    }
  }
</style>
