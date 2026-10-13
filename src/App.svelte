<script lang="ts">
  import { quiz } from '@/state/quiz.svelte';
  import { EXAMS, EXAM_BY_ID } from '@/exams';
  import Picker from '@/views/Picker.svelte';
  import Home from '@/views/Home.svelte';
  import Quiz from '@/views/Quiz.svelte';
  import Results from '@/views/Results.svelte';
  import Review from '@/views/Review.svelte';
  import Cheatsheet from '@/views/Cheatsheet.svelte';

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
    const handler = (e: BeforeUnloadEvent) => {
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

  <main>
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

<style>
  .shell {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--bg);
  }

  .topbar {
    position: sticky;
    top: 0;
    z-index: 40;
    background: var(--cream);
    border-bottom: 1px solid var(--line);
  }

  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    height: var(--header-h);
  }

  .brand-group {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
  }

  .back {
    margin-left: -12px;
    font-size: 14px;
  }

  .back span {
    font-size: 18px;
    line-height: 1;
    margin-top: -2px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px 8px 8px;
    margin-left: -8px;
    border: none;
    background: none;
    transition: background-color var(--dur-micro) var(--ease);
    min-width: 0;
  }

  .brand:disabled {
    cursor: default;
  }

  .brand:not(:disabled):hover {
    background: var(--stone);
  }

  /* The exam's initials in an ink square, with its tint in the corner. */
  .mark {
    width: 32px;
    height: 32px;
    flex: none;
    display: grid;
    place-items: center;
    border: 1.5px solid var(--ink);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.02em;
    color: var(--ink);
    position: relative;
  }

  .mark::after {
    content: '';
    position: absolute;
    right: -4px;
    bottom: -4px;
    width: 9px;
    height: 9px;
    background: var(--exam-tint);
    border: 1.5px solid var(--cream);
  }

  .brand-text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    line-height: 1.2;
    min-width: 0;
  }

  .brand-text strong {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }

  .brand-text span {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex: none;
  }

  .actions .btn {
    font-size: 14px;
  }

  .actions :global(.active) {
    color: var(--ink);
    background: var(--stone);
    box-shadow: inset 0 -2px 0 var(--mint);
  }

  .theme .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid currentColor;
    background: linear-gradient(90deg, currentColor 50%, transparent 50%);
  }

  main {
    flex: 1;
    position: relative;
    isolation: isolate;
  }

  .foot {
    width: 100%;
    padding: 0 var(--page-pad) 40px;
  }

  .foot p {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 24px;
    color: var(--text-tertiary);
    font-size: 13px;
    line-height: 1.6;
    text-align: center;
    letter-spacing: -0.1px;
  }

  @media (max-width: 560px) {
    /* The monogram alone identifies the exam; the buttons need the room. */
    .brand-text {
      display: none;
    }

    .back {
      padding: 8px 8px 8px 6px;
    }

    .actions {
      gap: 0;
    }

    .actions .btn {
      padding: 8px;
      font-size: 13px;
    }
  }
</style>
