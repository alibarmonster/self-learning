<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import QuestionView from '@/components/QuestionView.svelte';
  import { isCorrect } from '@/core';

  let filter = $state('missed');

  const items = $derived(
    quiz.paper.map((question, i) => ({
      question,
      i,
      selected: quiz.answers[i],
      flagged: quiz.flagged[i],
      correct: isCorrect(question, quiz.answers[i]),
      unanswered: quiz.answers[i] === null
    }))
  );

  const filters = $derived([
    { id: 'missed', label: 'Missed', count: items.filter((it) => !it.correct).length },
    { id: 'flagged', label: 'Flagged', count: items.filter((it) => it.flagged).length },
    { id: 'correct', label: 'Correct', count: items.filter((it) => it.correct).length },
    { id: 'all', label: 'All', count: items.length }
  ]);

  const shown = $derived(
    filter === 'all'
      ? items
      : filter === 'missed'
        ? items.filter((it) => !it.correct)
        : filter === 'flagged'
          ? items.filter((it) => it.flagged)
          : items.filter((it) => it.correct)
  );
</script>

<div class="page wrap rise">
  <header class="head">
    <div>
      <p class="eyebrow">{quiz.label}</p>
      <h1>Review</h1>
      <p class="sub">
        Every question with the correct answer and why it is correct. Reading the explanations for
        the ones you missed is where most of the improvement comes from.
      </p>
    </div>
    <button class="btn btn-secondary" onclick={() => (quiz.view = 'results')}>
      ← Back to score
    </button>
  </header>

  <div class="filters" role="tablist">
    {#each filters as f (f.id)}
      <button
        class="filter"
        class:active={filter === f.id}
        role="tab"
        aria-selected={filter === f.id}
        onclick={() => (filter = f.id)}
      >
        {f.label} <span class="mono count">{f.count}</span>
      </button>
    {/each}
  </div>

  {#if shown.length === 0}
    <div class="empty card">
      <p>
        {#if filter === 'missed'}
          Nothing missed — you answered every question in this paper correctly.
        {:else if filter === 'flagged'}
          You did not flag any questions during this paper.
        {:else}
          Nothing to show here.
        {/if}
      </p>
    </div>
  {:else}
    <div class="list">
      {#each shown as item (item.i)}
        <div class="card sheet" class:flagged={item.flagged}>
          {#if item.flagged}
            <span class="flag-tag">⚑ You flagged this</span>
          {/if}
          <QuestionView
            question={item.question}
            selected={item.selected}
            reveal={true}
            number={item.i + 1}
            total={quiz.paper.length}
          />
        </div>
      {/each}
    </div>
  {/if}

  <div class="actions">
    {#if quiz.lastConfig}
      <button class="btn btn-primary" onclick={() => quiz.restart()}>Take a fresh paper</button>
    {/if}
    <button class="btn btn-ghost" onclick={() => (quiz.view = 'home')}>Back to start</button>
  </div>
</div>

<style>
  .wrap {
    padding-top: 44px;
    padding-bottom: 72px;
    max-width: 820px;
  }

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .head h1 {
    margin-top: 6px;
    font-size: 34px;
  }

  .sub {
    margin-top: 10px;
    max-width: 520px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin: 28px 0 20px;
    padding: 4px;
    border-radius: 10px;
    border: 1px solid var(--line);
    background: var(--bg-sunken);
    width: fit-content;
  }

  .filter {
    padding: 7px 14px;
    border: none;
    border-radius: 7px;
    background: transparent;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text-secondary);
    transition: background var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .filter:hover {
    color: var(--text);
  }

  .filter.active {
    background: var(--bg-elevated);
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }

  .count {
    font-size: 11px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .sheet {
    position: relative;
    padding: 28px;
  }

  .sheet.flagged {
    border-color: color-mix(in srgb, var(--amber) 45%, var(--border));
  }

  .flag-tag {
    display: inline-block;
    margin-bottom: 12px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--amber);
  }

  .empty {
    padding: 40px;
    text-align: center;
    color: var(--text-secondary);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 36px;
  }

  @media (max-width: 620px) {
    .sheet {
      padding: 22px 18px;
    }
  }
</style>
