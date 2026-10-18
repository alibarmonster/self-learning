import type { Component } from 'svelte';
import type { Cheatsheet, NamedSheet } from './cheatsheet';
import type { LessonMeta } from './lesson';
import type { Question } from './question';

/** A block of the real paper, e.g. "Section 1 — Logic Test". */
export interface Part {
  id: string;
  number: number;
  name: string;
  blurb: string;
}

export interface Section {
  id: string;
  /** The part this section is sat in; sections without one stand alone. */
  partId?: string;
  name: string;
  short: string;
  icon: string;
  /** Share of the real exam, in percent, when the exam guide publishes one. */
  weight?: number;
  blurb: string;
  questions: Question[];
}

/** How many questions a mode draws from a section: fixed, or `[min, max]`. */
export type BlueprintCount = number | [min: number, max: number];

/** Section id → how many questions to draw from it. */
export type Blueprint = Record<string, BlueprintCount>;

export interface Mode {
  id: string;
  name: string;
  tagline: string;
  /** Time allowed; 0 for untimed. */
  minutes: number;
  blueprint: Blueprint;
  description: string;
}

/**
 * A fixed paper: the same questions every time it is sat, in a new order with
 * the options reshuffled. Lets a large bank be worked through set by set.
 */
export interface PaperSet {
  id: string;
  name: string;
  /** Question ids from any section of the exam. */
  questionIds: string[];
}

export interface ExamHome {
  eyebrow: string;
  /** Line breaks (`\n`) are kept when the title is rendered. */
  title: string;
  /** Trusted HTML from the exam definition. */
  lede: string;
  startLabel: string;
  aboutLabel: string;
  sectionsTitle?: string;
  extraNote?: string;
}

export interface Verdict {
  title: string;
  note: string;
}

/** What an exam file declares. `defineExam` turns it into an `Exam`. */
export interface ExamDefinition {
  id: string;
  /** Namespaces this exam's localStorage keys. */
  storagePrefix: string;
  name: string;
  subtitle: string;
  short: string;
  tagline: string;
  blurb: string;
  icon: string;
  /** The mode the home page's main button starts. */
  fullModeId?: string;
  /** Interleave every section into one pile, as certification exams do. */
  mixed?: boolean;
  /** Questions a topic needs before it is offered as a drill. */
  drillMin?: number;
  /** Questions a topic drill draws. */
  drillSize?: number;
  parts?: Part[];
  sections?: Section[];
  /**
   * Retired section ids → the section that took over their questions, so
   * papers saved, drills started and "take it again" configs recorded before
   * an exam guide changed still resolve.
   */
  sectionAliases?: Record<string, string>;
  modes?: Mode[];
  /** Fixed numbered papers, shown as their own block on the home page. */
  sets?: PaperSet[];
  /** Minutes per question when a set is sat timed (2.4 is the ACE pace: 50 in 120). */
  setMinutesPerQuestion?: number;
  home: ExamHome;
  verdict(percent: number): Verdict;
  footer: string;
  /** Topics surfaced first on the home page. */
  focusTopicIds?: string[];
  cheatsheet?: Cheatsheet;
  /** Further sheets after the exam's own one — command references, glossaries. */
  extraSheets?: NamedSheet[];
  /** Offer the simulated Google Cloud lab (terminal, topology, architecture). */
  lab?: boolean;
  /** Deep-dive lessons, one service each, at #/<exam>/learn/<id>. */
  lessons?: LessonMeta[];
}

/** A topic within a section, with its question counts by difficulty. */
export interface Topic {
  id: string;
  section: Section;
  topic: string;
  count: number;
  easy: number;
  medium: number;
  hard: number;
}

export interface Exam
  extends Omit<
    ExamDefinition,
    | 'parts'
    | 'sections'
    | 'modes'
    | 'sets'
    | 'drillMin'
    | 'drillSize'
    | 'focusTopicIds'
    | 'extraSheets'
  > {
  parts: Part[];
  sections: Section[];
  modes: Mode[];
  sets: PaperSet[];
  setById: Record<string, PaperSet>;
  /** Every cheat sheet, the exam's own first (id 'exam'). */
  sheets: NamedSheet[];
  sheetById: Record<string, NamedSheet>;
  drillMin: number;
  drillSize: number;
  focusTopicIds: string[];
  partById: Record<string, Part>;
  sectionById: Record<string, Section>;
  modeById: Record<string, Mode>;
  bankSize: number;
  /** No modes yet — only a cheat sheet to read. */
  studyOnly: boolean;
  topics: Topic[];
  topicById: Record<string, Topic>;
  /** Topics with enough questions to sit on their own, biggest first per section. */
  drillTopics: Topic[];
}

/** An exam as the app shows it: the derived data plus its About page, if any. */
export interface ExamEntry extends Exam {
  about?: Component;
}
