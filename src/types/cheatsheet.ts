export interface CheatsheetTable {
  caption?: string;
  columns: string[];
  rows: string[][];
  /** Render the value cells in the monospace face — for commands and flags. */
  mono?: boolean;
}

/** A plain note, or a `[term, explanation]` pair rendered as a definition. */
export type CheatsheetBullet = string | [term: string, text: string];

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
  title?: string;
  intro?: string;
  parts?: CheatsheetPart[];
  groups: CheatsheetGroup[];
}
