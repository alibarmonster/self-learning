/**
 * Everything the app keeps lives in localStorage, namespaced per exam by its
 * `storagePrefix`. Every access is wrapped: private windows and full quotas
 * throw, and the app must keep working without persistence.
 *
 * When someone is signed in to an account with a database (see sync.ts), keys
 * are scoped to that user (`u<id>:` in front) so two people on one browser
 * never see each other's progress, and every write is also handed to the sync
 * layer to be saved on the server. The theme is the one key that stays per
 * browser.
 */
import type { Attempt, Exam, SavedSession } from '@/types';

export const THEME_KEY = 'ada-quiz-theme-v1';

/**
 * Each exam keeps its own saved session and attempt history, so a half-finished
 * Academy paper is not confused with a Cloud Digital Leader one.
 */
export function storageKeys(exam: Pick<Exam, 'storagePrefix'>) {
  return {
    session: `${exam.storagePrefix}-quiz-session-v1`,
    history: `${exam.storagePrefix}-quiz-history-v1`,
    /** Per-question tally of which option text you picked, across every sitting. */
    picks: `${exam.storagePrefix}-quiz-picks-v1`,
    /** Finished papers, kept so an attempt can be reviewed again later. */
    papers: `${exam.storagePrefix}-quiz-papers-v1`
  };
}

/**
 * How many handed-in papers to keep for review. A paper is stored whole —
 * questions, shuffled option order and what you picked — so it survives edits
 * to the bank, but that is a few tens of kilobytes each, so only the most
 * recent few are kept.
 */
export const REVIEWABLE_ATTEMPTS = 6;

let scope = '';
let onChange: ((key: string, raw: string | null) => void) | null = null;

/** Called by sync.ts once it knows who is signed in. An empty scope is the old, unsynced behaviour. */
export function setStorageScope(prefix: string, changed: ((key: string, raw: string | null) => void) | null) {
  scope = prefix;
  onChange = changed;
}

/** The localStorage key a logical key is stored under right now. */
export const scoped = (key: string) => (key === THEME_KEY ? key : scope + key);

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(scoped(key));
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): boolean {
  const raw = JSON.stringify(value);
  if (key !== THEME_KEY) onChange?.(key, raw);
  try {
    localStorage.setItem(scoped(key), raw);
    return true;
  } catch {
    /* storage unavailable or full — the app still works, it just cannot resume */
    return false;
  }
}

export function remove(key: string): void {
  if (key !== THEME_KEY) onChange?.(key, null);
  try {
    localStorage.removeItem(scoped(key));
  } catch {
    /* ignore */
  }
}

/** The attempt history of an exam, for the picker page — no need to enter it. */
export function readHistory(exam: Exam): Attempt[] {
  return read<Attempt[]>(storageKeys(exam).history, []);
}

/** A resumable paper of an exam, if one is saved and its clock has not run out. */
export function readResumable(exam: Exam): SavedSession | null {
  const saved = read<SavedSession | null>(storageKeys(exam).session, null);
  if (!saved || !saved.paper?.length || saved.submittedAt !== null) return null;
  if (saved.deadline && Date.now() > saved.deadline) return null;
  return saved;
}
