/**
 * Everything the app keeps lives in localStorage, namespaced per exam by its
 * `storagePrefix`. Every access is wrapped: private windows and full quotas
 * throw, and the app must keep working without persistence.
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

export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    /* storage unavailable or full — the app still works, it just cannot resume */
    return false;
  }
}

export function remove(key: string): void {
  try {
    localStorage.removeItem(key);
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
