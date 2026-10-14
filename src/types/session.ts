import type { Given, PaperQuestion } from './question';

/** How a paper was drawn, so "Take it again" can draw another of the same shape. */
export type PaperConfig =
  | { kind: 'mode'; modeId: string }
  | { kind: 'practice'; sectionId: string; count: number; minutes: number }
  | { kind: 'topic'; topicId: string; count: number; minutes: number }
  | { kind: 'set'; setId: string; minutes: number };

/** A paper in progress, as saved after every answer so it can be resumed. */
export interface SavedSession {
  paper: PaperQuestion[];
  answers: Given[];
  flagged: boolean[];
  index: number;
  label: string;
  durationMs: number;
  /** Epoch ms when the paper must be handed in; 0 when untimed. */
  deadline: number;
  startedAt: number;
  submittedAt: null;
}

/** A handed-in paper, kept whole so the attempt can be reviewed later. */
export interface SavedPaper {
  paper: PaperQuestion[];
  answers: Given[];
  flagged: boolean[];
  label: string;
  durationMs: number;
  startedAt: number;
  submittedAt: number;
  config: PaperConfig | null;
}

/** One row of an exam's attempt history. */
export interface Attempt {
  /** Epoch ms of hand-in; also the key of the saved paper. */
  at: number;
  label: string;
  correct: number;
  total: number;
  percent: number;
  elapsedMs: number;
  /** Handed in by the clock rather than the sitter. */
  auto: boolean;
  /** The fixed set this attempt sat, so each set can show its best score. */
  setId?: string;
}

/** Question id → option text → times picked, across every sitting. */
export type PickTally = Record<string, Record<string, number>>;

/** Hand-in time → saved paper. */
export type SavedPapers = Record<string, SavedPaper>;

export type Theme = 'system' | 'light' | 'dark';
