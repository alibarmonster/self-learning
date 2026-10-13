<script>
  import { quiz } from '@/state/quiz.svelte.js';
  import { formatClock, LETTERS } from '@/utils/format.js';
  import QuestionView from '@/components/QuestionView.svelte';
  import { isMulti } from '@/core';

  let confirming = $state(false);

  const lastLetter = $derived(LETTERS[quiz.question.options.length - 1]);

  const remaining = $derived(quiz.remainingMs);
  const urgent = $derived(remaining !== null && remaining <= 60_000);
  const warning = $derived(remaining !== null && remaining <= 300_000 && !urgent);
  const progress = $derived(((quiz.index + 1) / quiz.paper.length) * 100);
  const sp = $derived(quiz.sectionProgress);
  const isLast = $derived(quiz.index === quiz.paper.length - 1);

  function onKey(e) {
    if (confirming) {
      if (e.key === 'Escape') confirming = false;
      return;
    }
    if (e.target instanceof HTMLInputElement) return;

    const key = e.key.toLowerCase();
    // Letters run to L so the twelve-option inductive grids are fully keyable.
    const letterIndex = 'abcdefghijkl'.indexOf(key);
    const digitIndex = /^[1-9]$/.test(key) ? Number(key) - 1 : -1;
    const pick = letterIndex >= 0 ? letterIndex : digitIndex;

    if (pick >= 0 && pick < quiz.question.options.length) {
      e.preventDefault();
      quiz.select(pick);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      quiz.next();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      quiz.prev();
    } else if (key === 'm' || key === 'f') {
      // F still flags on short questions; on a twelve-option grid it selects
      // option F, which is why M is the shortcut we advertise.
      e.preventDefault();
      quiz.toggleFlag();
    } else if (e.key === 'Escape') {
      quiz.navOpen = false;
    }
  }

  function statusOf(i) {
    if (i === quiz.index) return 'current';
    if (quiz.flagged[i]) return 'flagged';
    if (quiz.answers[i] !== null) return 'answered';
    return 'empty';
  }
</script>

<svelte:window onkeydown={onKey} />

<div class="quizbar">
  <div class="progress" style="width: {progress}%"></div>
  <div class="page bar">
    <div class="left">
      <button class="btn btn-ghost sm" onclick={() => quiz.exitToHome()}>← Save &amp; exit</button>
      <span class="label">{quiz.label}</span>
      {#if sp}
        <span class="section-tag">
          {sp.count > 1 ? `Section ${sp.position} of ${sp.count} · ` : ''}{sp.name}
        </span>
      {/if}
    </div>

    <div class="right">
      <span class="counter mono">{quiz.answeredCount}/{quiz.paper.length} answered</span>
      {#if remaining !== null}
        <span class="clock mono" class:urgent class:warning>{formatClock(remaining)}</span>
      {:else}
        <span class="clock mono untimed">Study mode · untimed</span>
      {/if}
      <button class="btn btn-secondary sm" onclick={() => (quiz.navOpen = !quiz.navOpen)}>
        {quiz.navOpen ? 'Hide' : 'Questions'}
      </button>
    </div>
  </div>
</div>

{#if quiz.navOpen}
  <div class="page">
    <div class="navigator card">
      <div class="grid">
        {#each quiz.paper as _, i (i)}
          <button class="cell {statusOf(i)}" onclick={() => quiz.goTo(i)}>{i + 1}</button>
        {/each}
      </div>
      <div class="legend">
        <span><i class="swatch answered"></i> Answered</span>
        <span><i class="swatch flagged"></i> Flagged</span>
        <span><i class="swatch empty"></i> Not answered</span>
      </div>
    </div>
  </div>
{/if}

<div class="page body rise">
  <div class="card raised sheet bracket">
    {#key quiz.question.id}
      <QuestionView
        question={quiz.question}
        selected={quiz.answers[quiz.index]}
        onselect={(i) => quiz.select(i)}
        revealable={quiz.durationMs === 0}
        number={quiz.index + 1}
        total={quiz.paper.length}
      />
    {/key}
  </div>

  <div class="controls">
    <button class="btn btn-secondary" onclick={() => quiz.prev()} disabled={quiz.index === 0}>
      Previous
    </button>

    <button
      class="btn btn-ghost flag"
      class:on={quiz.flagged[quiz.index]}
      onclick={() => quiz.toggleFlag()}
    >
      {quiz.flagged[quiz.index] ? '⚑ Flagged' : '⚐ Flag for review'}
    </button>

    {#if isLast}
      <button class="btn btn-primary" onclick={() => (confirming = true)}>Finish &amp; score</button>
    {:else}
      <button class="btn btn-primary" onclick={() => quiz.next()}>Next</button>
    {/if}
  </div>

  <p class="hint">
    Shortcuts: <span class="mono">A</span>–<span class="mono">{lastLetter}</span> or
    <span class="mono">1</span>–<span class="mono">{quiz.question.options.length}</span> to
    {isMulti(quiz.question) ? 'toggle a pick' : 'answer'} ·
    <span class="mono">←</span> <span class="mono">→</span> to move ·
    <span class="mono">M</span> to flag
  </p>

  {#if !isLast}
    <button class="finish-early" onclick={() => (confirming = true)}>
      Finish the paper early
    </button>
  {/if}
</div>

{#if confirming}
  <div
    class="backdrop"
    role="button"
    tabindex="-1"
    onclick={() => (confirming = false)}
    onkeydown={() => {}}
  ></div>
  <div class="dialog card" role="dialog" aria-modal="true" aria-label="Confirm submission">
    <h3>Hand in the paper?</h3>
    <p>
      You have answered {quiz.answeredCount} of {quiz.paper.length} questions.
      {#if quiz.answeredCount < quiz.paper.length}
        {quiz.paper.length - quiz.answeredCount} will be marked as unanswered.
      {/if}
      {#if quiz.flaggedCount}
        {quiz.flaggedCount} {quiz.flaggedCount === 1 ? 'question is' : 'questions are'} still flagged.
      {/if}
    </p>
    <div class="dialog-actions">
      <button class="btn btn-secondary" onclick={() => (confirming = false)}>Keep working</button>
      <button
        class="btn btn-primary"
        onclick={() => {
          confirming = false;
          quiz.submit();
        }}
      >
        Hand in
      </button>
    </div>
  </div>
{/if}

<style>
  .quizbar {
    position: sticky;
    top: 58px;
    z-index: 30;
    background: color-mix(in srgb, var(--bg) 90%, transparent);
    backdrop-filter: saturate(160%) blur(16px);
    -webkit-backdrop-filter: saturate(160%) blur(16px);
    border-bottom: 1px solid var(--line);
  }

  .progress {
    height: 2px;
    background: var(--accent);
    transition: width 0.3s var(--ease);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    padding-top: 8px;
    padding-bottom: 8px;
    flex-wrap: wrap;
  }

  .left,
  .right {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }

  .sm {
    padding: 7px 13px;
    font-size: 13px;
  }

  .label {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .section-tag {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    white-space: nowrap;
  }

  .counter {
    font-size: 11.5px;
    color: var(--text-tertiary);
  }

  .clock {
    font-size: 15px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    padding: 4px 10px;
    border: 1px solid var(--border-strong);
    border-radius: 7px;
    background: var(--bg-elevated);
  }

  .clock.untimed {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-tertiary);
  }

  .clock.warning {
    color: var(--amber);
    background: var(--amber-soft);
  }

  .clock.urgent {
    color: var(--red);
    background: var(--red-soft);
    animation: pulse 1s ease-in-out infinite;
  }

  @keyframes pulse {
    50% {
      opacity: 0.55;
    }
  }

  .navigator {
    margin-top: 16px;
    padding: 18px;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 8px;
  }

  .cell {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    border: 1px solid var(--border-strong);
    border-radius: 6px;
    background: var(--bg-elevated);
    font-family: var(--font-mono);
    font-size: 12.5px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    transition: transform var(--dur-micro) var(--ease), border-color var(--dur-micro) var(--ease);
  }

  .cell:hover {
    transform: scale(1.06);
  }

  .cell.answered {
    background: var(--accent-soft);
    border-color: color-mix(in srgb, var(--accent) 45%, transparent);
    color: var(--accent);
  }

  .cell.flagged {
    background: var(--amber-soft);
    border-color: color-mix(in srgb, var(--amber) 55%, transparent);
    color: var(--amber);
  }

  .cell.current {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-text);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.03em;
    color: var(--text-tertiary);
  }

  .legend span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    width: 11px;
    height: 11px;
    border-radius: 3px;
    border: 1px solid var(--border-strong);
  }

  .swatch.answered {
    background: var(--accent-soft);
    border-color: color-mix(in srgb, var(--accent) 45%, transparent);
  }

  .swatch.flagged {
    background: var(--amber-soft);
    border-color: color-mix(in srgb, var(--amber) 55%, transparent);
  }

  .body {
    padding: 32px 24px 64px;
    max-width: 800px;
  }

  .sheet {
    padding: 32px;
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
  }

  .flag.on {
    color: var(--amber);
    background: var(--amber-soft);
  }

  .hint {
    margin-top: 22px;
    text-align: center;
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .hint .mono {
    padding: 1px 6px;
    border: 1px solid var(--border-strong);
    border-bottom-width: 2px;
    border-radius: 4px;
    background: var(--bg-elevated);
    font-size: 11px;
  }

  .finish-early {
    display: block;
    margin: 28px auto 0;
    border: none;
    background: none;
    font-size: 13px;
    color: var(--text-tertiary);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  .finish-early:hover {
    color: var(--text);
  }

  .backdrop {
    position: fixed;
    inset: 0;
    z-index: 50;
    border: none;
    background: rgba(23, 21, 18, 0.5);
    backdrop-filter: blur(3px);
    animation: fade var(--dur-ui) var(--ease) both;
  }

  @keyframes fade {
    from {
      opacity: 0;
    }
  }

  @keyframes pop {
    from {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.97);
    }
  }

  .dialog {
    position: fixed;
    z-index: 51;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: min(440px, calc(100vw - 40px));
    padding: 26px;
    box-shadow: var(--shadow-lg);
    animation: pop 280ms var(--ease) both;
  }

  .dialog h3 {
    font-size: 20px;
  }

  .dialog p {
    margin-top: 10px;
    font-size: 15px;
    line-height: 1.55;
    color: var(--text-secondary);
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  @media (max-width: 700px) {
    .quizbar {
      top: 58px;
    }

    .section-tag,
    .counter {
      display: none;
    }

    .sheet {
      padding: 22px 18px;
    }

    .controls {
      flex-wrap: wrap;
    }

    .flag {
      order: 3;
      width: 100%;
    }
  }
</style>
