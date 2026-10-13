<script>
  import { quiz } from '@/state/quiz.svelte.js';
  import { LETTERS } from '@/utils/format.js';
  import { isMulti, pickCount, isCorrect, isAnswerOption, isChosen } from '@/core';

  let {
    question,
    selected = null,
    onselect = null,
    reveal = false,
    /** Untimed sittings may open the answer per question, ExamTopics-style. */
    revealable = false,
    number = null,
    total = null
  } = $props();

  // A local reveal for study mode. Resets when the question changes because
  // Quiz.svelte keys this component on the question id.
  let peeked = $state(false);
  const shown = $derived(reveal || peeked);

  const answerLetters = $derived(
    (isMulti(question) ? question.answer : [question.answer]).map((i) => LETTERS[i]).join(', ')
  );

  /** The published community vote split, when the question carries one. */
  const communityBar = $derived.by(() => {
    if (!question.votes?.length) return null;
    const rows = question.votes.map((v) => ({
      label: v.pick.map((i) => LETTERS[i]).join(''),
      pct: v.pct,
      right: isCorrect(question, multi ? v.pick : v.pick[0])
    }));
    const rest = 100 - rows.reduce((n, r) => n + r.pct, 0);
    if (rest >= 1) rows.push({ label: 'Other', pct: rest, right: false });
    return rows;
  });

  /** Your own picks on this question across sittings, as a share per option. */
  const pickBar = $derived.by(() => {
    const tally = quiz.picks[question.id];
    if (!tally) return null;
    const total = Object.values(tally).reduce((a, b) => a + b, 0);
    if (!total) return null;
    return question.options
      .map((text, i) => ({ i, text, n: tally[text] ?? 0 }))
      .filter((x) => x.n > 0)
      .map((x) => ({ ...x, pct: Math.round((x.n / total) * 100) }))
      .sort((a, b) => b.n - a.n);
  });

  const section = $derived(quiz.exam.sectionById[question.sectionId]);
  const multi = $derived(isMulti(question));
  const need = $derived(pickCount(question));
  const chosenCount = $derived(Array.isArray(selected) ? selected.length : selected === null ? 0 : 1);
  const correct = $derived(isCorrect(question, selected));

  function stateOf(i) {
    if (!shown) return isChosen(selected, i) ? 'chosen' : 'idle';
    if (isAnswerOption(question, i)) return 'correct';
    if (isChosen(selected, i)) return 'wrong';
    return 'idle';
  }

  /** On reveal, how many of the sitter's picks were right — for the "1 of 2" note. */
  const hits = $derived(
    multi && Array.isArray(selected)
      ? selected.filter((i) => question.answer.includes(i)).length
      : 0
  );
</script>

<article class="q">
  <div class="meta">
    {#if number !== null}
      <span class="num mono">{number}{total ? ` / ${total}` : ''}</span>
    {/if}
    <span class="chip">{section.short}</span>
    <span class="chip subtle">{question.topic}</span>
    <span class="chip difficulty {question.difficulty}">{question.difficulty}</span>
  </div>

  <h2 class="prompt">{question.prompt}</h2>

  {#if multi}
    <p class="pick-note" class:done={!reveal && chosenCount === need}>
      Choose {need === 2 ? 'two' : need === 3 ? 'three' : need}
      {#if !reveal}· {chosenCount} of {need} selected{/if}
    </p>
  {/if}

  {#if question.code}
    <div class="code-wrap">
      <span class="lang">{question.lang}</span>
      <pre><code>{question.code}</code></pre>
    </div>
  {/if}

  {#if question.figure}
    <!-- Figures are hand-authored SVG from the local question bank, never user input. -->
    <figure class="stem">{@html question.figure}</figure>
  {/if}

  {#if question.optionFigures}
    <!-- Twelve-option grids get a denser, smaller tile so the whole bank is
         visible at once — scrolling between options defeats the format. -->
    <ul class="options visual" class:dense={question.optionFigures.length > 6}>
      {#each question.optionFigures as figure, i (i)}
        <li>
          <button
            class="option tile {stateOf(i)}"
            disabled={shown || !onselect}
            aria-pressed={isChosen(selected, i)}
            onclick={() => onselect?.(i)}
          >
            <span class="letter">{LETTERS[i]}</span>
            <span class="art">{@html figure}</span>
            <span class="sr-only">{question.options[i]}</span>
            {#if shown && isAnswerOption(question, i)}
              <span class="tag correct-tag">Correct</span>
            {:else if shown && isChosen(selected, i)}
              <span class="tag wrong-tag">Your answer</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {:else}
    <ul class="options">
      {#each question.options as option, i (i)}
        <li>
          <button
            class="option {stateOf(i)}"
            class:multi
            disabled={shown || !onselect}
            aria-pressed={isChosen(selected, i)}
            onclick={() => onselect?.(i)}
          >
            <span class="letter">{LETTERS[i]}</span>
            <span class="text">{option}</span>
            {#if shown && isAnswerOption(question, i)}
              <span class="tag correct-tag">Correct</span>
            {:else if shown && isChosen(selected, i)}
              <span class="tag wrong-tag">Your answer</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}

  {#if revealable && !shown}
    <button class="peek" onclick={() => (peeked = true)}>Show suggested answer</button>
  {/if}

  {#if shown}
    <div class="verdict" class:missed={selected !== null && !correct}>
      <p class="suggested">
        <span class="suggested-label">Suggested answer</span>
        <span class="suggested-letter mono">{answerLetters}</span>
        {#if selected === null}
          <span class="suggested-note">not answered</span>
        {:else if correct}
          <span class="suggested-note ok">your answer is correct</span>
        {:else if multi}
          <span class="suggested-note bad">{hits} of {need} right — every pick has to be correct to score</span>
        {:else}
          <span class="suggested-note bad">you chose {(Array.isArray(selected) ? selected : [selected]).map((i) => LETTERS[i]).join(', ')}</span>
        {/if}
      </p>

      {#if communityBar}
        <div class="votes">
          <p class="votes-label">Community vote distribution</p>
          <div class="votes-bar" aria-hidden="true">
            {#each communityBar as v (v.label)}
              <span
                class="votes-seg"
                class:right={v.right}
                style="width: {v.pct}%"
                title="{v.label} · {v.pct}%"
              >{v.label} {v.pct}%</span>
            {/each}
          </div>
        </div>
      {/if}

      {#if pickBar}
        <div class="votes">
          <p class="votes-label">Your picks on this question across {pickBar.reduce((n, x) => n + x.n, 0)} sittings</p>
          <div class="votes-bar" aria-hidden="true">
            {#each pickBar as v (v.i)}
              <span
                class="votes-seg"
                class:right={isAnswerOption(question, v.i)}
                style="width: {v.pct}%"
                title="{LETTERS[v.i]} · {v.pct}%"
              >{LETTERS[v.i]} {v.pct}%</span>
            {/each}
          </div>
        </div>
      {/if}

      <div class="discussion">
        <p class="discussion-head">
          <span class="eyebrow">Explanation</span>
        </p>
        <p>{question.explanation}</p>
        {#if question.tip}
          <p class="tip"><span class="tip-label">Tip</span>{question.tip}</p>
        {/if}
      </div>
    </div>
  {/if}
</article>

<style>
  .meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }

  .num {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    color: var(--text-tertiary);
    margin-right: 4px;
    font-variant-numeric: tabular-nums;
  }

  /* Mono utility chips — the metadata line reads as an instrument label. */
  .chip {
    padding: 3px 9px;
    border-radius: 5px;
    background: var(--accent-soft);
    color: var(--accent);
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .chip.subtle {
    background: var(--bg-sunken);
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0.02em;
  }

  .chip.difficulty {
    text-transform: uppercase;
    background: transparent;
    border: 1px solid var(--border-strong);
    color: var(--text-tertiary);
    font-weight: 500;
  }

  .chip.difficulty.hard {
    border-color: color-mix(in srgb, var(--red) 45%, transparent);
    color: var(--red);
  }

  .chip.difficulty.medium {
    border-color: color-mix(in srgb, var(--amber) 55%, transparent);
    color: var(--amber);
  }

  .prompt {
    font-size: clamp(20px, 2.4vw, 25px);
    font-weight: 600;
    line-height: 1.35;
    white-space: pre-line;
  }

  .pick-note {
    display: inline-block;
    margin-top: 12px;
    padding: 4px 10px;
    border-radius: 5px;
    border: 1px dashed var(--border-strong);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .pick-note.done {
    border-style: solid;
    border-color: var(--accent);
    color: var(--accent);
  }

  /* Multi-select options get a square marker, the checkbox convention. */
  .option.multi .letter {
    border-radius: 4px;
  }

  .code-wrap {
    position: relative;
    margin-top: 20px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-sunken);
    overflow: hidden;
  }

  .lang {
    display: block;
    padding: 7px 16px;
    border-bottom: 1px solid var(--line);
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  pre {
    margin: 0;
    padding: 16px;
    overflow-x: auto;
    font-family: var(--font-mono);
    font-size: 13.5px;
    line-height: 1.65;
    tab-size: 4;
  }

  /* ── Figures ──
     Question art is inline SVG injected with {@html}, so its rules have to be
     :global to survive Svelte's style scoping. Every stroke uses currentColor,
     which is why the diagrams follow the theme for free. */

  .stem {
    margin: 24px 0 0;
    padding: 20px 16px;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-sunken);
    display: flex;
    justify-content: center;
    overflow-x: auto;
  }

  .stem :global(svg) {
    display: block;
    color: var(--text);
    width: auto;
    max-width: 100%;
    max-height: 230px;
    height: auto;
  }

  .options {
    list-style: none;
    margin: 24px 0 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .options.visual {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .options.visual.dense {
    grid-template-columns: repeat(auto-fit, minmax(92px, 1fr));
    gap: 8px;
  }

  .option.tile {
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 16px 12px 14px;
    min-height: 150px;
  }

  .dense .option.tile {
    gap: 6px;
    padding: 10px 8px 8px;
    min-height: 106px;
    border-width: 1.5px;
  }

  .dense .letter {
    width: 20px;
    height: 20px;
    font-size: 10.5px;
  }

  .dense .art :global(svg) {
    max-height: 62px;
  }

  .dense .tag {
    font-size: 9.5px;
    line-height: 1.2;
    text-align: center;
  }

  .art {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 0;
  }

  .art :global(svg) {
    display: block;
    color: var(--text);
    width: auto;
    max-width: 100%;
    max-height: 92px;
    height: auto;
  }

  .option {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 13px 16px;
    text-align: left;
    border: 1px solid var(--border-strong);
    border-radius: 10px;
    background: var(--bg-elevated);
    font-size: 15.5px;
    line-height: 1.45;
    transition:
      border-color var(--dur-micro) var(--ease),
      background var(--dur-micro) var(--ease),
      box-shadow var(--dur-micro) var(--ease),
      transform var(--dur-micro) var(--ease);
  }

  .option:not(:disabled):hover {
    border-color: var(--text-tertiary);
    background: var(--surface-hover);
    box-shadow: var(--shadow-sm);
  }

  .option:not(:disabled):active {
    transform: scale(0.995);
  }

  .option:disabled {
    cursor: default;
  }

  .letter {
    flex: none;
    width: 26px;
    height: 26px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    border: 1px solid var(--border-strong);
    font-family: var(--font-mono);
    font-size: 11.5px;
    font-weight: 600;
    color: var(--text-secondary);
    transition: inherit;
  }

  .text {
    flex: 1;
    min-width: 0;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .option.chosen {
    border-color: var(--accent);
    background: var(--accent-soft);
    box-shadow: 0 0 0 1px var(--accent);
  }

  .option.chosen .letter {
    background: var(--accent);
    border-color: var(--accent);
    color: var(--accent-text);
  }

  .option.correct {
    border-color: var(--green);
    background: var(--green-soft);
  }

  .option.correct .letter {
    background: var(--green);
    border-color: var(--green);
    color: var(--bg-elevated);
  }

  .option.wrong {
    border-color: var(--red);
    background: var(--red-soft);
  }

  .option.wrong .letter {
    background: var(--red);
    border-color: var(--red);
    color: var(--bg-elevated);
  }

  .tag {
    flex: none;
    align-self: center;
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .correct-tag {
    color: var(--green);
  }

  .wrong-tag {
    color: var(--red);
  }

  .peek {
    margin-top: 18px;
    padding: 9px 14px;
    border: 1px solid var(--border-strong);
    border-radius: 8px;
    background: var(--bg-elevated);
    font-family: var(--font-mono);
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-secondary);
    box-shadow: var(--shadow-sm);
    transition: border-color var(--dur-micro) var(--ease), color var(--dur-micro) var(--ease);
  }

  .peek:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  /* The ExamTopics-style verdict: a suggested-answer strip, your vote bar,
     then the discussion. Green frame when right, amber when missed. */
  .verdict {
    margin-top: 18px;
    border: 1px solid color-mix(in srgb, var(--green) 35%, transparent);
    border-radius: 10px;
    overflow: hidden;
    font-size: 15px;
    line-height: 1.6;
  }

  .verdict.missed {
    border-color: color-mix(in srgb, var(--amber) 40%, transparent);
  }

  .suggested {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    padding: 12px 16px;
    background: var(--green-soft);
    border-bottom: 1px solid color-mix(in srgb, var(--green) 25%, transparent);
  }

  .verdict.missed .suggested {
    background: var(--amber-soft);
    border-bottom-color: color-mix(in srgb, var(--amber) 30%, transparent);
  }

  .suggested-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-secondary);
  }

  .suggested-letter {
    display: inline-grid;
    place-items: center;
    min-width: 28px;
    height: 28px;
    padding: 0 8px;
    border-radius: 6px;
    background: var(--green);
    color: var(--bg-elevated);
    font-size: 14px;
    font-weight: 700;
  }

  .verdict.missed .suggested-letter {
    background: var(--amber);
  }

  .suggested-note {
    font-size: 13px;
    color: var(--text-secondary);
  }

  .suggested-note.ok {
    color: var(--green);
    font-weight: 500;
  }

  .suggested-note.bad {
    color: var(--amber);
    font-weight: 500;
  }

  .votes {
    padding: 12px 16px 0;
  }

  .votes-label {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
    margin-bottom: 8px;
  }

  .votes-bar {
    display: flex;
    height: 22px;
    border-radius: 5px;
    overflow: hidden;
    background: var(--bg-sunken);
    border: 1px solid var(--line);
  }

  .votes-seg {
    display: grid;
    place-items: center;
    min-width: 0;
    overflow: hidden;
    white-space: nowrap;
    background: var(--red-soft);
    color: var(--red);
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    border-right: 1px solid var(--bg-elevated);
  }

  .votes-seg.right {
    background: var(--green-soft);
    color: var(--green);
  }

  .discussion {
    padding: 14px 16px 16px;
    color: var(--text);
  }

  .discussion-head {
    margin-bottom: 6px;
  }

  /* Only the questions that ship with one carry a tip — a short method note
     that generalises past the single question. */
  .discussion .tip {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid var(--line);
    font-size: 14px;
    color: var(--text-secondary);
  }

  .tip-label {
    display: inline-block;
    margin-right: 8px;
    font-family: var(--font-mono);
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }
</style>
