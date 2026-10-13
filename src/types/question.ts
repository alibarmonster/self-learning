export type Difficulty = 'easy' | 'medium' | 'hard';

/**
 * The key of a question: an index into `options` for single choice, or a
 * sorted array of indices for multiple select ("choose two").
 */
export type AnswerKey = number | number[];

/** What the sitter picked — same shape as the key, or null when unanswered. */
export type Given = number | number[] | null;

/** One row of a published community vote: which options, and what share. */
export interface Vote {
  pick: number[];
  pct: number;
}

export interface Question {
  id: string;
  topic: string;
  difficulty: Difficulty;
  prompt: string;
  options: string[];
  answer: AnswerKey;
  explanation: string;
  /** A one-line strategy hint shown with the explanation. */
  tip?: string;
  /** Inline SVG markup drawn above the prompt. */
  figure?: string;
  /** Inline SVG per option, in option order, for picture answers. */
  optionFigures?: string[];
  /** A code listing shown with the prompt, and its language for the label. */
  code?: string;
  lang?: string;
  /** Imported word for word from a community bank — exempt from style checks. */
  verbatim?: boolean;
  votes?: Vote[];
}

/** A question as it sits on a drawn paper: options shuffled, section recorded. */
export interface PaperQuestion extends Question {
  sectionId: string;
}
