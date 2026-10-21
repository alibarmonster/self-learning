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

/** A VPC firewall rule as the exercise block shows it. `ports` is `all`, `icmp`, or `tcp:80,tcp:8000-8100`. */
export interface FwRule {
  name: string;
  direction: 'INGRESS' | 'EGRESS';
  priority: number;
  action: 'allow' | 'deny';
  ports: string;
  /** Ingress: source ranges. Neither ranges nor tags means 0.0.0.0/0. */
  sources?: string[];
  sourceTags?: string[];
  /** Egress: destination ranges; empty means 0.0.0.0/0. */
  destinations?: string[];
  targetTags?: string[];
  targetSa?: string;
}

export interface FwVm {
  name: string;
  ip: string;
  tags: string[];
  sa: string;
}

/** One connection to judge. `vm` is the VM the rule is applied to; `peer` is an IP or another VM's name. */
export interface FwPacket {
  direction: 'INGRESS' | 'EGRESS';
  vm: string;
  peer: string;
  proto: 'tcp' | 'udp' | 'icmp';
  port?: number;
  /** The intended answer; the lesson check confirms the evaluator agrees. */
  expect: 'allow' | 'deny';
}

/** The knobs of the Cloud Run autoscaling calculator. */
export interface ScaleInput {
  /** Requests per second arriving at the service. */
  rps: number;
  /** How long one request takes, in milliseconds. */
  latencyMs: number;
  /** Maximum concurrent requests per instance. */
  concurrency: number;
  min: number;
  max: number;
  /** Database connections each instance keeps open. */
  pool: number;
  /** Connections the database accepts in total. */
  dbMax: number;
}

/** One "consideration" of an exam guide subsection, explained. */
export interface GuideItem {
  /** The consideration, in our own words. */
  topic: string;
  /** What it means and why it matters. */
  what: string;
  /** How it is done — usually commands. */
  how?: string[];
  /** How the exam tends to ask about it. */
  exam?: string;
  /** Where to go deeper in the app. */
  see?: LessonLink[];
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
  | { kind: 'quiz'; q: string; options: string[]; answer: number; explain: string }
  /** An interactive subnet calculator, starting from `value`. */
  | { kind: 'cidr'; value: string; note?: string }
  /** Judge each connection allow or deny, then see which rule decided it. */
  | { kind: 'firewall'; title: string; vms: FwVm[]; rules: FwRule[]; packets: FwPacket[]; after?: string }
  /** Play with traffic, latency, concurrency and min/max instances; presets load a situation. */
  | { kind: 'scaling'; start: ScaleInput; presets: { label: string; values: ScaleInput; note: string }[] }
  /** Answer the questions that pick a load balancer; shows today's name, the old one, and what it needs. */
  | { kind: 'lbpicker'; title: string }
  /** The considerations of one exam guide subsection (`ref` like "1.1"), each opening to an explanation. */
  | { kind: 'guide'; ref: string; items: GuideItem[] };

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
