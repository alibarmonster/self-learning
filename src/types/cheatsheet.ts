export interface CheatsheetTable {
  caption?: string;
  columns: string[];
  rows: string[][];
  /** Render the value cells in the monospace face — for commands and flags. */
  mono?: boolean;
}

/** A plain note, or a `[term, explanation]` pair rendered as a definition. */
export type CheatsheetBullet = string | [term: string, text: string];

/** A glossary entry: what a term means, in plain words, with an example. */
export interface CheatsheetTerm {
  term: string;
  /** The plain-language meaning. */
  meaning: string;
  /** An everyday comparison that makes the idea stick. */
  analogy?: string;
  /** A concrete cloud example. */
  example?: string;
  /** How the idea is usually phrased in exam questions. */
  exam?: string;
}

export interface CheatsheetGroup {
  id: string;
  /** The `CheatsheetPart` this group is listed under. */
  part?: string;
  title: string;
  note?: string;
  /** A decision path, read top to bottom: each step is `[situation, choice]`. */
  path?: [situation: string, choice: string][];
  /** A single table may be given inline; it is folded into `tables`. */
  columns?: string[];
  rows?: string[][];
  tables?: CheatsheetTable[];
  bullets?: CheatsheetBullet[];
  /** Glossary cards, rendered after the tables. */
  terms?: CheatsheetTerm[];
  /** Inline SVG markup drawn under the heading; strokes should use currentColor. */
  figure?: string;
  figureCaption?: string;
  /** Show the bullets above the tables rather than below. */
  notesFirst?: boolean;
  tip?: string;
}

export interface CheatsheetPart {
  id: string;
  title: string;
  blurb?: string;
}

export interface Cheatsheet {
  /** Language of the sheet's prose, e.g. 'id'; defaults to the page's English. */
  lang?: string;
  title?: string;
  /** Example searches for the filter box placeholder. */
  filterHint?: string;
  intro?: string;
  parts?: CheatsheetPart[];
  groups: CheatsheetGroup[];
}

/** One of an exam's cheat sheets, shown as a tab on the cheat sheet page. */
export interface NamedSheet {
  /** Route segment: #/<exam>/cheatsheet/<id>. The exam's own sheet is 'exam'. */
  id: string;
  label: string;
  sheet: Cheatsheet;
}
