import {
  buildPaper,
  buildSectionPaper,
  buildTopicPaper,
  isCorrect,
  isMulti,
  pickCount
} from '@/core';
import {
  REVIEWABLE_ATTEMPTS,
  THEME_KEY,
  read,
  readHistory,
  remove,
  storageKeys,
  write
} from './storage';
import type {
  Attempt,
  ExamEntry,
  Given,
  PaperConfig,
  PaperQuestion,
  PickTally,
  SavedPaper,
  SavedPapers,
  SavedSession,
  Section,
  Theme
} from '@/types';

export type View = 'home' | 'quiz' | 'results' | 'review' | 'about' | 'cheatsheet';

export interface SectionScore {
  section: Section;
  correct: number;
  total: number;
  unanswered: number;
}

export interface BlockScore {
  key: string;
  name: string;
  buckets: SectionScore[];
  correct: number;
  total: number;
  unanswered: number;
  position: number;
  count: number;
}

export interface Results {
  total: number;
  correct: number;
  percent: number;
  elapsedMs: number;
  unanswered: number;
  sections: SectionScore[];
  groups: BlockScore[];
}

class Quiz {
  /** The exam being prepared for; null on the picker page. */
  exam = $state<ExamEntry | null>(null);

  view = $state<View>('home');

  paper = $state<PaperQuestion[]>([]);
  /** Per question: null, an option index, or (multi-select) a sorted array of indices. */
  answers = $state<Given[]>([]);
  flagged = $state<boolean[]>([]);
  index = $state(0);

  /** Label shown in the quiz header, e.g. "Full Simulation". */
  label = $state('');
  /** Total allowed milliseconds; 0 means untimed practice. */
  durationMs = $state(0);
  /** Epoch ms when the paper must be handed in; 0 when untimed. */
  deadline = $state(0);
  startedAt = $state(0);
  submittedAt = $state<number | null>(null);

  now = $state(Date.now());
  navOpen = $state(false);
  resumable = $state<SavedSession | null>(null);
  history = $state<Attempt[]>([]);
  theme = $state<Theme>('system');
  /** { [questionId]: { [optionText]: count } } — the "how did I vote before" bar. */
  picks = $state<PickTally>({});
  /** { [submittedAt]: saved paper } — the handed-in papers still open to review. */
  papers = $state<SavedPapers>({});

  /** Remembers the last paper drawn so "Take it again" can redraw the same shape. */
  lastConfig = $state<PaperConfig | null>(null);

  #ticker: ReturnType<typeof setInterval> | null = null;

  // ── lifecycle ────────────────────────────────────────────────────────────

  init() {
    this.theme = read<Theme>(THEME_KEY, 'system');
    this.applyTheme();
  }

  /** The exam being prepared for; only call where an exam is open. */
  get activeExam(): ExamEntry {
    if (!this.exam) throw new Error('No exam is open');
    return this.exam;
  }

  /** Switches to an exam: loads its history and any paper left unfinished. */
  enterExam(exam: ExamEntry) {
    if (this.exam?.id === exam.id) return;
    if (this.exam) this.leaveExam();
    this.exam = exam;
    // Nothing to sit yet on a cheat-sheet-only exam, so open the sheet itself.
    this.view = exam.studyOnly ? 'cheatsheet' : 'home';
    this.history = readHistory(exam);
    this.picks = read<PickTally>(storageKeys(exam).picks, {});
    this.papers = read<SavedPapers>(storageKeys(exam).papers, {});
    this.lastConfig = null;
    const keys = storageKeys(exam);
    const saved = read<SavedSession | null>(keys.session, null);
    if (saved && saved.paper?.length && saved.submittedAt === null) {
      // A timed paper whose clock ran out while the tab was closed is dead.
      if (saved.deadline && Date.now() > saved.deadline) remove(keys.session);
      else this.resumable = saved;
    } else {
      this.resumable = null;
    }
    scrollTop();
  }

  /** Back to the picker. A paper in progress is kept so it can be resumed. */
  leaveExam() {
    this.#stopTicker();
    if (this.exam && this.submittedAt === null && this.paper.length) this.#persist();
    this.exam = null;
    this.paper = [];
    this.answers = [];
    this.flagged = [];
    this.index = 0;
    this.resumable = null;
    this.history = [];
    this.picks = {};
    this.papers = {};
    this.lastConfig = null;
    this.view = 'home';
    scrollTop();
  }

  applyTheme() {
    const root = document.documentElement;
    if (this.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', this.theme);
  }

  cycleTheme() {
    const order: Theme[] = ['system', 'light', 'dark'];
    this.theme = order[(order.indexOf(this.theme) + 1) % order.length];
    write(THEME_KEY, this.theme);
    this.applyTheme();
  }

  #startTicker() {
    this.#stopTicker();
    this.#ticker = setInterval(() => {
      this.now = Date.now();
      if (this.deadline && this.now >= this.deadline) this.submit(true);
    }, 250);
  }

  #stopTicker() {
    if (this.#ticker) clearInterval(this.#ticker);
    this.#ticker = null;
  }

  #persist() {
    if (this.submittedAt !== null || !this.exam) return;
    write(storageKeys(this.exam).session, {
      paper: this.paper,
      answers: this.answers,
      flagged: this.flagged,
      index: this.index,
      label: this.label,
      durationMs: this.durationMs,
      deadline: this.deadline,
      startedAt: this.startedAt,
      submittedAt: null
    });
  }

  // ── starting a paper ─────────────────────────────────────────────────────

  #begin(paper: PaperQuestion[], label: string, minutes: number) {
    this.paper = paper;
    this.answers = new Array(paper.length).fill(null);
    this.flagged = new Array(paper.length).fill(false);
    this.index = 0;
    this.label = label;
    this.durationMs = minutes > 0 ? minutes * 60_000 : 0;
    this.startedAt = Date.now();
    this.deadline = this.durationMs ? this.startedAt + this.durationMs : 0;
    this.submittedAt = null;
    this.now = Date.now();
    this.resumable = null;
    this.navOpen = false;
    this.view = 'quiz';
    this.#persist();
    if (this.deadline) this.#startTicker();
    scrollTop();
  }

  startMode(modeId: string) {
    const exam = this.activeExam;
    const mode = exam.modeById[modeId];
    this.lastConfig = { kind: 'mode', modeId };
    this.#begin(buildPaper(exam, mode), mode.name, mode.minutes);
  }

  /** Starts the exam's headline paper — the one the home page leads with. */
  startFullTest() {
    const id = this.activeExam.fullModeId;
    if (id) this.startMode(id);
  }

  startPractice(sectionId: string, count: number, minutes: number) {
    const exam = this.activeExam;
    const section = exam.sectionById[sectionId];
    this.lastConfig = { kind: 'practice', sectionId, count, minutes };
    this.#begin(
      buildSectionPaper(exam, sectionId, count),
      `${section.name} practice`,
      minutes
    );
  }

  /** A drill on one topic — "Blood relations", "Probability" — nothing else. */
  startTopicPractice(topicId: string, count: number, minutes = 0) {
    const exam = this.activeExam;
    const entry = exam.topicById[topicId];
    if (!entry) return;
    this.lastConfig = { kind: 'topic', topicId, count, minutes };
    this.#begin(
      buildTopicPaper(exam, entry.section.id, entry.topic, count),
      `${entry.topic} drill`,
      minutes
    );
  }

  restart() {
    const c = this.lastConfig;
    if (!c) return;
    if (c.kind === 'mode') this.startMode(c.modeId);
    else if (c.kind === 'topic') this.startTopicPractice(c.topicId, c.count, c.minutes);
    else this.startPractice(c.sectionId, c.count, c.minutes);
  }

  resume() {
    const s = this.resumable;
    if (!s) return;
    this.paper = s.paper;
    this.answers = s.answers;
    this.flagged = s.flagged;
    this.index = s.index;
    this.label = s.label;
    this.durationMs = s.durationMs;
    this.deadline = s.deadline;
    this.startedAt = s.startedAt;
    this.submittedAt = null;
    this.now = Date.now();
    this.resumable = null;
    this.view = 'quiz';
    if (this.deadline) this.#startTicker();
    scrollTop();
  }

  discardResumable() {
    this.resumable = null;
    remove(storageKeys(this.activeExam).session);
  }

  // ── answering ────────────────────────────────────────────────────────────

  select(optionIndex: number) {
    const q = this.question;
    const current = this.answers[this.index];
    if (isMulti(q)) {
      // Toggle the option in the chosen set; the set can hold at most as many
      // options as the question asks for, so a fourth tap on a "choose two"
      // is ignored until one is withdrawn.
      const chosen = Array.isArray(current) ? [...current] : [];
      const at = chosen.indexOf(optionIndex);
      if (at >= 0) chosen.splice(at, 1);
      else if (chosen.length < pickCount(q)) chosen.push(optionIndex);
      else return;
      this.answers[this.index] = chosen.length ? chosen.sort((a, b) => a - b) : null;
    } else {
      // Tapping the chosen option again clears it, so a guess can be withdrawn.
      this.answers[this.index] = current === optionIndex ? null : optionIndex;
    }
    this.#persist();
  }

  toggleFlag() {
    this.flagged[this.index] = !this.flagged[this.index];
    this.#persist();
  }

  goTo(i: number) {
    if (i < 0 || i >= this.paper.length) return;
    this.index = i;
    this.navOpen = false;
    this.#persist();
    scrollTop();
  }

  next() {
    this.goTo(this.index + 1);
  }

  prev() {
    this.goTo(this.index - 1);
  }

  // ── finishing ────────────────────────────────────────────────────────────

  submit(auto = false) {
    if (this.submittedAt !== null) return;
    const at = Date.now();
    this.submittedAt = at;
    this.#stopTicker();
    const keys = storageKeys(this.activeExam);
    remove(keys.session);

    // Tally every answered question by option text, so the review can show
    // how you have voted on it across sittings (indices differ per shuffle).
    const picks: PickTally = { ...this.picks };
    this.paper.forEach((q, i) => {
      const a = this.answers[i];
      if (a === null) return;
      const chosen = Array.isArray(a) ? a : [a];
      const tally = { ...(picks[q.id] ?? {}) };
      for (const idx of chosen) tally[q.options[idx]] = (tally[q.options[idx]] ?? 0) + 1;
      picks[q.id] = tally;
    });
    this.picks = picks;
    write(keys.picks, picks);

    const r = this.results;
    this.history = [
      {
        at,
        label: this.label,
        correct: r.correct,
        total: r.total,
        percent: r.percent,
        elapsedMs: r.elapsedMs,
        auto
      },
      ...this.history
    ].slice(0, 25);
    write(keys.history, this.history);

    // Keep the paper itself, so this attempt can be reopened from the history
    // list after leaving the results screen or closing the tab.
    let papers: SavedPapers = { ...this.papers };
    papers[at] = {
      paper: $state.snapshot(this.paper),
      answers: $state.snapshot(this.answers),
      flagged: $state.snapshot(this.flagged),
      label: this.label,
      durationMs: this.durationMs,
      startedAt: this.startedAt,
      submittedAt: at,
      config: $state.snapshot(this.lastConfig)
    };
    const newestFirst = () => Object.keys(papers).sort((a, b) => Number(b) - Number(a));
    for (const stale of newestFirst().slice(REVIEWABLE_ATTEMPTS)) delete papers[stale];
    // Storage can still refuse the write when the quota is tight. Drop the
    // oldest papers until it fits, so the rows that do offer a Review button
    // are the ones that will still have a paper behind them after a reload.
    while (!write(keys.papers, papers)) {
      const keysLeft = newestFirst();
      if (keysLeft.length <= 1) {
        papers = {};
        write(keys.papers, papers);
        break;
      }
      delete papers[keysLeft[keysLeft.length - 1]];
    }
    this.papers = papers;

    this.view = 'results';
    scrollTop();
  }

  exitToHome() {
    this.#stopTicker();
    // Leaving mid-paper keeps the session so it can be picked up again.
    if (this.submittedAt === null && this.paper.length) {
      this.#persist();
      this.resumable = read<SavedSession | null>(storageKeys(this.activeExam).session, null);
    }
    this.view = 'home';
    scrollTop();
  }

  /** True when a finished attempt can still be reopened. */
  canReview(at: number): boolean {
    return Boolean(this.papers[at]?.paper?.length);
  }

  /**
   * Reopens a handed-in paper on the review screen. The score is recomputed
   * from the stored answers rather than trusted from the history row, so the
   * two can never disagree.
   */
  reviewAttempt(at: number) {
    const saved: SavedPaper | undefined = this.papers[at];
    if (!saved?.paper?.length) return;
    this.#stopTicker();
    this.paper = saved.paper;
    this.answers = saved.answers;
    this.flagged = saved.flagged;
    this.index = 0;
    this.label = saved.label;
    this.durationMs = saved.durationMs ?? 0;
    this.deadline = 0;
    this.startedAt = saved.startedAt;
    this.submittedAt = saved.submittedAt ?? at;
    this.lastConfig = saved.config ?? null;
    this.navOpen = false;
    this.view = 'review';
    scrollTop();
  }

  clearHistory() {
    this.history = [];
    this.papers = {};
    const keys = storageKeys(this.activeExam);
    write(keys.history, []);
    write(keys.papers, {});
  }

  // ── derived ──────────────────────────────────────────────────────────────

  get question(): PaperQuestion {
    return this.paper[this.index];
  }

  get answeredCount() {
    return this.answers.filter((a) => a !== null).length;
  }

  get flaggedCount() {
    return this.flagged.filter(Boolean).length;
  }

  get remainingMs(): number | null {
    if (!this.deadline) return null;
    return Math.max(0, this.deadline - this.now);
  }

  /** Which block of the paper a question belongs to. */
  #blockKey(item: PaperQuestion): string {
    const section = this.activeExam.sectionById[item.sectionId];
    return section.partId ?? `section:${section.id}`;
  }

  #blockName(key: string): string {
    const exam = this.activeExam;
    return exam.partById[key]?.name ?? exam.sectionById[key.slice('section:'.length)].name;
  }

  /** Block boundaries so the quiz header can show "Section 1 of 2 · Logic Test". */
  get sectionProgress() {
    const q = this.question;
    if (!q || this.activeExam.mixed) return null;
    const keys: string[] = [];
    for (const item of this.paper) {
      const key = this.#blockKey(item);
      if (!keys.includes(key)) keys.push(key);
    }
    const key = this.#blockKey(q);
    return {
      name: this.#blockName(key),
      position: keys.indexOf(key) + 1,
      count: keys.length
    };
  }

  get results(): Results {
    const total = this.paper.length;
    let correct = 0;
    const bySection: Record<string, SectionScore> = {};

    for (const section of this.activeExam.sections) {
      bySection[section.id] = { section, correct: 0, total: 0, unanswered: 0 };
    }

    this.paper.forEach((q, i) => {
      const bucket = bySection[q.sectionId];
      bucket.total += 1;
      if (this.answers[i] === null) bucket.unanswered += 1;
      else if (isCorrect(q, this.answers[i])) {
        correct += 1;
        bucket.correct += 1;
      }
    });

    const percent = total ? Math.round((correct / total) * 100) : 0;
    const elapsedMs = (this.submittedAt ?? Date.now()) - this.startedAt;
    const sections = Object.values(bySection).filter((b) => b.total > 0);

    // Group the sections back into the blocks the paper was sat in, so the
    // breakdown reads "Section 1 · Logic Test" before it reads "Visual".
    const groups: BlockScore[] = [];
    for (const bucket of sections) {
      const key = bucket.section.partId ?? `section:${bucket.section.id}`;
      let group = groups.find((g) => g.key === key);
      if (!group) {
        group = {
          position: 0,
          count: 0,
          key,
          name: this.#blockName(key),
          buckets: [],
          correct: 0,
          total: 0,
          unanswered: 0
        };
        groups.push(group);
      }
      group.buckets.push(bucket);
      group.correct += bucket.correct;
      group.total += bucket.total;
      group.unanswered += bucket.unanswered;
    }
    groups.forEach((g, i) => {
      g.position = i + 1;
      g.count = groups.length;
    });

    return {
      total,
      correct,
      percent,
      elapsedMs,
      unanswered: total - this.answeredCount,
      sections,
      groups
    };
  }
}

function scrollTop() {
  if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
}

export const quiz = new Quiz();
