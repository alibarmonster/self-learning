<script>
  import { quiz } from './lib/quiz.svelte.js';
  import { EXAMS, EXAM_BY_ID } from './lib/exams/index.js';
  import Picker from './lib/Picker.svelte';
  import Home from './lib/Home.svelte';
  import Quiz from './lib/Quiz.svelte';
  import Results from './lib/Results.svelte';
  import Review from './lib/Review.svelte';
  import Cheatsheet from './lib/Cheatsheet.svelte';

  quiz.init();

  const themeLabel = $derived(
    quiz.theme === 'system' ? 'Auto' : quiz.theme === 'light' ? 'Light' : 'Dark'
  );

  // ── Hash routing ──
  // `#/` is the exam picker, `#/apple` an exam's start page, `#/apple/about`
  // its background page. A paper in progress is not addressable — a refresh
  // lands on the start page with the resume card, as before.
  function parseHash() {
    const [examId = '', sub = ''] = location.hash.replace(/^#\/?/, '').split('/');
    return { examId, sub };
  }

  function applyHash() {
    const { examId, sub } = parseHash();
    const exam = EXAM_BY_ID[examId];
    if (!exam) {
      if (quiz.exam) quiz.leaveExam();
      if (location.hash && location.hash !== '#/') history.replaceState(null, '', '#/');
      return;
    }
    quiz.enterExam(exam);
    // A paper in progress is never interrupted by a hash edit; every other
    // view follows the URL so typed or bookmarked links land where they say.
    const wanted =
      sub === 'about' && exam.about
        ? 'about'
        : sub === 'cheatsheet' && exam.cheatsheet
          ? 'cheatsheet'
          : exam.studyOnly && exam.cheatsheet
            ? 'cheatsheet'
            : 'home';
    if (quiz.view !== 'quiz' && quiz.view !== wanted) quiz.view = wanted;
  }

  applyHash();

  $effect(() => {
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  });

  // Reflect in-app navigation back into the hash so refresh and back work.
  $effect(() => {
    const exam = quiz.exam;
    const view = quiz.view;
    const target = !exam
      ? '#/'
      : view === 'about' || view === 'cheatsheet'
        ? `#/${exam.id}/${view}`
        : `#/${exam.id}`;
    if (location.hash !== target) {
      // First load with a bare URL should not leave a spare history entry.
      if (!location.hash) history.replaceState(null, '', target);
      else history.pushState(null, '', target);
    }
    document.title = exam
      ? `${exam.name} — ${exam.subtitle}`
      : 'Exam Prep — practice tests';
  });

  // Colour the accent per exam so the two feel like different rooms.
  $effect(() => {
    const root = document.documentElement;
    if (quiz.exam) root.setAttribute('data-exam', quiz.exam.id);
    else root.removeAttribute('data-exam');
  });

  // Warn before a refresh or tab close while a timed paper is running.
  $effect(() => {
    if (quiz.view !== 'quiz') return;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  });

  function brandClick() {
    if (!quiz.exam) return;
    if (quiz.view === 'quiz') quiz.exitToHome();
    else quiz.view = 'home';
  }

  function toPicker() {
    if (quiz.view === 'quiz') quiz.exitToHome();
    quiz.leaveExam();
  }
</script>

<div class="frame">
<div class="shell">
  <header class="topbar">
    <div class="page bar">
      <div class="brand-group">
        {#if quiz.exam}
          <button class="btn btn-ghost back" onclick={toPicker} title="All exams">
            <span aria-hidden="true">‹</span> Exams
          </button>
        {/if}
        <button class="brand" onclick={brandClick} disabled={!quiz.exam}>
          <span class="mark" aria-hidden="true">{quiz.exam ? quiz.exam.icon : '§'}</span>
          <span class="brand-text">
            <strong>{quiz.exam ? quiz.exam.name : 'Exam Prep'}</strong>
            <span>{quiz.exam ? quiz.exam.subtitle : `${EXAMS.length} practice tests`}</span>
          </span>
        </button>
      </div>

      <nav class="actions">
        {#if quiz.exam && quiz.view !== 'quiz'}
          {#if quiz.exam.cheatsheet}
            <button
              class="btn btn-ghost"
              class:active={quiz.view === 'cheatsheet'}
              onclick={() => (quiz.view = quiz.view === 'cheatsheet' ? 'home' : 'cheatsheet')}
            >
              Cheat sheet
            </button>
          {/if}
          {#if quiz.exam.about}
            <button
              class="btn btn-ghost"
              class:active={quiz.view === 'about'}
              onclick={() => (quiz.view = quiz.view === 'about' ? 'home' : 'about')}
            >
              About the test
            </button>
          {/if}
        {/if}
        <button class="btn btn-ghost theme" onclick={() => quiz.cycleTheme()}>
          <span class="dot" aria-hidden="true"></span>
          {themeLabel}
        </button>
      </nav>
    </div>
  </header>

  <main class="lines">
    {#if !quiz.exam}
      <Picker />
    {:else if quiz.view === 'home'}
      <Home />
    {:else if quiz.view === 'quiz'}
      <Quiz />
    {:else if quiz.view === 'results'}
      <Results />
    {:else if quiz.view === 'review'}
      <Review />
    {:else if quiz.view === 'cheatsheet'}
      <Cheatsheet />
    {:else if quiz.exam.about}
      {@const About = quiz.exam.about}
      <About />
    {:else}
      <Cheatsheet />
    {/if}
  </main>

  {#if quiz.view !== 'quiz'}
    <footer class="page foot">
      <div class="rule"></div>
      <p>
        {quiz.exam?.footer ??
          'Unofficial practice tools built for personal preparation. Not affiliated with, endorsed by, or produced by any of the organisations whose exams they simulate.'}
      </p>
    </footer>
  {/if}
</div>
</div>

<style>
  /* The dark outer field. The paper shell sits inside it with a small gap on
     every side, so the whole app reads as one framed, elevated sheet. */
  .frame {
    min-height: 100vh;
    padding: var(--frame-gap);
    background: var(--frame);
  }

  .shell {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - var(--frame-gap) * 2);
    border-radius: var(--radius-shell);
    background-color: var(--bg);
    /* subtle diagonal texture so the paper reads as material */
    background-image: repeating-linear-gradient(
      135deg,
      transparent 0 7px,
      var(--texture) 7px 8px
    );
    box-shadow: var(--shadow-lg);
    /* clip (not hidden) so the sticky header keeps working */
    overflow: clip;
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    backdrop-filter: saturate(160%) blur(16px);
    -webkit-backdrop-filter: saturate(160%) blur(16px);
    border-bottom: 1px solid var(--line);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: 58px;
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .back {
    padding: 7px 10px 7px 8px;
    margin-left: -8px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .back span {
    font-size: 17px;
    line-height: 1;
    margin-top: -2px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 6px 10px 6px 6px;
    margin-left: -6px;
    border: none;
    background: none;
    border-radius: 10px;
    transition: background var(--dur-micro) var(--ease);
    min-width: 0;
  }

  .brand:disabled {
    cursor: default;
  }

  .brand:not(:disabled):hover {
    background: var(--surface-hover);
  }

  /* A bracketed monogram: the exam's initials inside a thin square. */
  .mark {
    width: 28px;
    height: 28px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--text);
    border-radius: 7px;
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--text);
    position: relative;
  }

  .mark::after {
    content: '';
    position: absolute;
    right: -3px;
    bottom: -3px;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: var(--accent);
    border: 1.5px solid var(--bg);
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
    min-width: 0;
  }

  .brand-text strong {
    font-size: 14.5px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .brand-text span {
    font-family: var(--font-mono);
    font-size: 10.5px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-tertiary);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
  }

  .actions :global(.active) {
    color: var(--text);
    background: var(--surface-hover);
  }

  .theme {
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .theme .dot {
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: var(--accent);
  }

  main {
    flex: 1;
    position: relative;
    isolation: isolate;
  }

  /* container-lines: thin vertical guides at the content container's edges,
     behind content, never intercepting input. */
  .lines::before,
  .lines::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: -1;
    width: 1px;
    background: var(--line);
    pointer-events: none;
  }

  .lines::before {
    left: max(var(--page-pad), calc((100% - var(--page)) / 2 + var(--page-pad)));
  }

  .lines::after {
    right: max(var(--page-pad), calc((100% - var(--page)) / 2 + var(--page-pad)));
  }

  .foot {
    width: 100%;
    padding: 0 var(--page-pad) 36px;
  }

  .foot p {
    max-width: 560px;
    margin: 0 auto;
    padding-top: 22px;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: 11px;
    line-height: 1.7;
    text-align: center;
    letter-spacing: 0.01em;
  }

  @media (max-width: 720px) {
    .frame {
      padding: 6px;
    }

    .shell {
      min-height: calc(100vh - 12px);
      border-radius: 14px;
    }

    .lines::before,
    .lines::after {
      display: none;
    }
  }

  @media (max-width: 560px) {
    /* The monogram alone identifies the exam; the buttons need the room. */
    .brand-text {
      display: none;
    }

    .brand {
      padding-right: 10px;
    }

    .back {
      padding: 7px 8px 7px 6px;
    }

    .actions {
      gap: 2px;
    }

    .actions .btn {
      padding: 7px 9px;
      font-size: 12.5px;
    }
  }
</style>
