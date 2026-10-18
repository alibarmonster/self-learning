/**
 * A deep-dive lesson: one service taught from the ground up — concepts,
 * components, the commands, and worked case studies — where a cheat sheet
 * only lists the shorthand. Plain data, rendered by views/Learn.svelte.
 *
 * Inline text in `p`, list items, table cells and case fields may use
 * `code` and **bold**.
 */

/** A glossary card: plain meaning, an everyday comparison, a concrete example. */
export interface LessonTerm {
  term: string;
  meaning: string;
  analogy?: string;
  example?: string;
}

/** A command walkthrough: `$ ` lines are typed, `# ` lines are comments, the rest is output. */
export interface LessonCode {
  title?: string;
  lines: string[];
}

export type LessonBlock =
  | { kind: 'p'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'terms'; items: LessonTerm[] }
  | { kind: 'table'; caption?: string; columns: string[]; rows: string[][]; mono?: number[] }
  | { kind: 'figure'; svg: string; caption: string }
  | ({ kind: 'code' } & LessonCode)
  | { kind: 'callout'; tone: 'analogy' | 'exam' | 'tip' | 'warn'; title?: string; text: string }
  | { kind: 'steps'; items: { title: string; text: string; code?: string[] }[] }
  | {
      kind: 'case';
      title: string;
      situation: string;
      /** What you see first, usually kubectl output. */
      symptom?: string[];
      /** How to find the cause, step by step. */
      diagnose: string[];
      /** The fix, as commands or text. */
      fix: string[];
      why: string;
      exam?: string;
    }
  | { kind: 'quiz'; q: string; options: string[]; answer: number; explain: string };

export interface LessonSection {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

export interface LessonPart {
  id: string;
  title: string;
  sections: LessonSection[];
}

/** Where to practise what a lesson teaches, as an in-app hash route. */
export interface LessonLink {
  label: string;
  href: string;
  note?: string;
}

export interface Lesson {
  id: string;
  /** Language of the prose; the terms stay as the exam prints them. */
  lang: string;
  title: string;
  intro: string;
  parts: LessonPart[];
  practice: LessonLink[];
}

/** What the exam lists; the lesson itself is fetched when opened. */
export interface LessonMeta {
  id: string;
  title: string;
  /** One line for the card. */
  summary: string;
  minutes: number;
  level: string;
  topics: string[];
  load: () => Promise<{ lesson: Lesson }>;
}
