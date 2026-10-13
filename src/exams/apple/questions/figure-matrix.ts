/**
 * Generated figure-matrix questions.
 *
 * A figure matrix is a 3×3 grid with the bottom-right cell missing and four
 * candidate tiles — the format used by IndiaBix, Raven's and most non-verbal
 * papers. None of those questions are reproduced here: every puzzle below is
 * drawn by our own SVG builders from a rule declared in code, which is what
 * lets one family of rules produce many distinct papers.
 *
 * Each entry gives two attribute lists. `rows` runs down the grid, `cols` runs
 * across it, and `draw(rowValue, colValue)` renders one cell — so the rule of
 * the puzzle *is* the pair of lists. The first three values of each list build
 * the grid; a fourth value is a spare that only ever appears as a wrong answer,
 * which stops "the option that is not already in the grid" from being a
 * shortcut to the answer.
 */

import {
  matrix,
  motif,
  polygon,
  circle,
  square,
  dots,
  frame,
  lines,
  pie,
  spun,
  FLAG,
  solid,
  type Fill,
  type Orientation,
  type Shape
} from './svg';
import type { Difficulty, Question } from '@/types';

// ── Vocabulary ─────────────────────────────────────────────────────────────

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const FILL_WORD: Record<Fill, string> = { none: 'an empty', half: 'a half-shaded', solid: 'a solid' };
const SIZE_WORD: Record<number, string> = { 0.55: 'a small', 0.78: 'a medium', 1: 'a large' };
const TURN_WORD: Record<number, string> = {
  0: 'upright',
  90: 'turned a quarter clockwise',
  180: 'upside down',
  270: 'turned a quarter anticlockwise'
};
const QUARTER_WORD: Record<number, string> = {
  0: 'the top-right quarter',
  1: 'the bottom-right quarter',
  2: 'the bottom-left quarter',
  3: 'the top-left quarter'
};
const SIDES_WORD: Record<number, string> = { 3: 'triangle', 4: 'square', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon' };
const COUNT_WORD: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' };

const GLYPH = {
  'F-shape': FLAG,
  arrow: '<path d="M50,82 L50,24"/><polyline points="35,38 50,23 65,38"/>',
  'T-shape': '<path d="M20,30 L80,30 M50,30 L50,82"/>',
  'L-shape': '<path d="M32,20 L32,80 L78,80"/>'
};
type Glyph = keyof typeof GLYPH;

const WRAP = {
  alone: { art: '', word: 'on its own' },
  circle: { art: circle(42), word: 'inside a circle' },
  square: { art: square(84), word: 'inside a square' },
  diamond: { art: polygon(4, { r: 45 }), word: 'inside a diamond' }
};
type Wrap = keyof typeof WRAP;
type Mark = 'nothing' | 'dot' | 'cross' | 'bar';

/** Concentric copies of one shape, shrinking inwards. */
const nested = (shape: Shape, n: number) =>
  Array.from({ length: n }, (_, i) => motif(shape, 'none', 1 - i * 0.3)).join('');

// ── The rules ──────────────────────────────────────────────────────────────

/**
 * Every family renders `draw(row, col)` and names it with `describe(row, col)`.
 *
 * `explain` names the two rules and what each one fixes for the missing cell.
 * It deliberately does not claim a direction of travel — several papers below
 * run their attribute list in a scrambled order, and the puzzle is solved by
 * reading the row and the column the empty cell sits in, not by extrapolating
 * a progression.
 */
/**
 * A rule over two attributes: `R` varies down the grid, `C` across it.
 * Methods (not arrow properties) so a family of any `R`/`C` can be used where
 * the paper builder only needs the shape of the rule.
 */
interface Family<R, C> {
  draw(row: R, col: C): string;
  describe(row: R, col: C): string;
  explain(rows: R[], cols: C[]): string;
  tip: string;
}

const family = <R, C>(rule: Family<R, C>) => rule;

const FAMILIES = {
  shapeFill: family<Fill, Shape>({
    draw: (fill, shape) => motif(shape, fill),
    describe: (fill, shape) => `${FILL_WORD[fill]} ${shape}`,
    explain: (rows, cols) =>
      `Every column holds one shape and every row holds one shading. The empty cell sits in the ${cols[2]} column and in the row that is ${FILL_WORD[rows[2]].replace(/^an? /, '')}.`,
    tip: 'When a shape repeats down a column and a shading repeats across a row, the answer is simply where the two meet.'
  }),

  shapeSize: family<number, Shape>({
    draw: (size, shape) => motif(shape, 'none', size),
    describe: (size, shape) => `${SIZE_WORD[size]} ${shape}`,
    explain: (rows, cols) =>
      `The column fixes the shape and the row fixes the size. The empty cell is in the ${cols[2]} column and in the row of ${SIZE_WORD[rows[2]].replace(/^an? /, '')} figures.`,
    tip: 'Size is a rule like any other. Compare a cell with the one above it before you compare shapes.'
  }),

  sidesDots: family<number, number>({
    draw: (count, sides) => polygon(sides) + dots(count),
    describe: (count, sides) =>
      `a ${SIDES_WORD[sides]} holding ${COUNT_WORD[count]} dot${count > 1 ? 's' : ''}`,
    explain: (rows, cols) =>
      `Two counts run at right angles: the column fixes the number of sides (${cols[2]} here) and the row fixes the number of dots (${rows[2]} here).`,
    tip: 'Count the sides and count the contents separately — a matrix often carries one number in each direction.'
  }),

  rotation: family<Glyph, number>({
    draw: (glyph, angle) => spun(angle, GLYPH[glyph]),
    describe: (glyph, angle) => `the ${glyph} ${TURN_WORD[angle]}`,
    explain: (rows, cols) =>
      `Each row keeps one shape and each column keeps one amount of turn. The empty cell is in the ${rows[2]} row, and its column shows every shape ${TURN_WORD[cols[2]]}.`,
    tip: 'Read the two cells above the gap for the turn and the two beside it for the shape. Never guess the spin.'
  }),

  lineGrid: family<Orientation, number>({
    draw: (orientation, count) => frame() + lines(count, orientation),
    describe: (orientation, count) =>
      `a box with ${COUNT_WORD[count]} ${orientation} line${count > 1 ? 's' : ''}`,
    explain: (rows, cols) =>
      `The row fixes the direction of the lines and the column fixes how many there are. The empty cell is in the ${rows[2]} row and the column of ${COUNT_WORD[cols[2]]} lines.`,
    tip: 'Two rules at once is the normal case. Settle the row rule first, then read the column.'
  }),

  pieTurn: family<number, number>({
    draw: (count, start) => pie(count, { start }),
    describe: (count, start) =>
      count === 1
        ? `a circle with ${QUARTER_WORD[start]} shaded`
        : `a circle with ${COUNT_WORD[count]} quarters shaded, starting at ${QUARTER_WORD[start]}`,
    explain: (rows, cols) =>
      `The row fixes how many quarters are shaded — ${COUNT_WORD[rows[2]]} in this one — and the column fixes where the shading begins, at ${QUARTER_WORD[cols[2]]}.`,
    tip: 'Describe a shaded wedge by where it starts on a clock face; comparing positions is easier than comparing pictures.'
  }),

  wrapper: family<Shape, Wrap>({
    draw: (shape, wrap) => motif(shape, 'none', 0.45) + WRAP[wrap].art,
    describe: (shape, wrap) => `a small ${shape} ${WRAP[wrap].word}`,
    explain: (rows, cols) =>
      `The inner shape never changes along a row — a ${rows[2]} in this one — and the column decides what is drawn around it: here, ${WRAP[cols[2]].word}.`,
    tip: 'If the first cell survives untouched inside the others, the rule is whatever has been added around it.'
  }),

  nesting: family<Shape, number>({
    draw: (shape, depth) => nested(shape, depth),
    describe: (shape, depth) =>
      depth === 1 ? `a single ${shape}` : `${COUNT_WORD[depth]} nested ${shape}s`,
    explain: (rows, cols) =>
      `The row fixes the shape — ${rows[2]} here — and the column fixes how many copies are nested inside one another: ${COUNT_WORD[cols[2]]}.`.replace(
        'one another: one',
        'one another, which in this column is a single outline'
      ),
    tip: 'Count the outlines rather than judging how busy a cell looks.'
  }),

  markedShape: family<Shape, Mark>({
    draw: (shape, mark) => motif(shape, 'none') + MARK[mark].art,
    describe: (shape, mark) => `a ${shape} ${MARK[mark].word}`,
    explain: (rows, cols) =>
      `The row fixes the outline — a ${rows[2]} here — and the column fixes the mark inside it, which in this column is ${MARK[cols[2]].word.replace(/^with /, '').replace(/ inside$/, '')}.`,
    tip: 'Separate the outline from what sits inside it and check whether each follows its own rule.'
  })
};

const MARK: Record<Mark, { art: string; word: string }> = {
  nothing: { art: '', word: 'with nothing inside' },
  dot: { art: `<circle cx="50" cy="52" r="7" ${solid}/>`, word: 'with a dot inside' },
  cross: { art: '<path d="M38,40 L62,64 M62,40 L38,64"/>', word: 'with a cross inside' },
  bar: { art: '<path d="M34,52 L66,52"/>', word: 'with a bar inside' }
};

// ── The papers ─────────────────────────────────────────────────────────────

/**
 * `rows` and `cols` each list four values: three that build the grid and a
 * spare for the wrong answers. `options` names the four candidate tiles as
 * [row, col] index pairs, the correct one first — two of them are combinations
 * already visible in the grid and one uses a spare, so neither "pick the tile
 * I can see" nor "pick the tile I cannot" is a shortcut.
 */
type Families = typeof FAMILIES;

/** A paper of one family: its rows and columns must be values that rule draws. */
type PaperOf<K extends keyof Families> =
  Families[K] extends Family<infer R, infer C>
    ? {
        id: string;
        family: K;
        difficulty: Difficulty;
        rows: R[];
        cols: C[];
        options: [row: number, col: number][];
      }
    : never;

type Paper = { [K in keyof Families]: PaperOf<K> }[keyof Families];

const PAPERS: Paper[] = [
  {
    id: 'fmx-01',
    family: 'shapeFill',
    difficulty: 'easy',
    rows: ['none', 'half', 'solid'],
    cols: ['circle', 'square', 'triangle', 'hexagon'],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-02',
    family: 'shapeFill',
    difficulty: 'medium',
    rows: ['solid', 'none', 'half'],
    cols: ['diamond', 'hexagon', 'circle', 'pentagon'],
    options: [[2, 2], [0, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-03',
    family: 'shapeSize',
    difficulty: 'easy',
    rows: [0.55, 0.78, 1],
    cols: ['triangle', 'square', 'circle', 'diamond'],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-04',
    family: 'shapeSize',
    difficulty: 'medium',
    rows: [1, 0.78, 0.55],
    cols: ['pentagon', 'circle', 'hexagon', 'square'],
    options: [[2, 2], [1, 2], [2, 0], [2, 3]]
  },
  {
    id: 'fmx-05',
    family: 'sidesDots',
    difficulty: 'medium',
    rows: [1, 2, 3],
    cols: [3, 4, 5, 6],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-06',
    family: 'sidesDots',
    difficulty: 'hard',
    rows: [2, 3, 4],
    cols: [4, 5, 6, 7],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-07',
    family: 'rotation',
    difficulty: 'easy',
    rows: ['F-shape', 'arrow', 'T-shape', 'L-shape'],
    cols: [0, 90, 180, 270],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-08',
    family: 'rotation',
    difficulty: 'medium',
    rows: ['L-shape', 'T-shape', 'F-shape', 'arrow'],
    cols: [90, 180, 270, 0],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-09',
    family: 'lineGrid',
    difficulty: 'easy',
    rows: ['horizontal', 'vertical', 'diagonal'],
    cols: [1, 2, 3, 4],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-10',
    family: 'lineGrid',
    difficulty: 'medium',
    rows: ['diagonal', 'horizontal', 'vertical'],
    cols: [2, 3, 4, 5],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-11',
    family: 'lineGrid',
    difficulty: 'hard',
    rows: ['vertical', 'diagonal', 'horizontal'],
    cols: [4, 3, 2, 5],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-12',
    family: 'pieTurn',
    difficulty: 'easy',
    rows: [1, 2, 3],
    cols: [0, 1, 2, 3],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-13',
    family: 'pieTurn',
    difficulty: 'hard',
    rows: [2, 3, 1],
    cols: [3, 0, 1, 2],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-14',
    family: 'wrapper',
    difficulty: 'easy',
    rows: ['triangle', 'circle', 'square', 'diamond'],
    cols: ['alone', 'circle', 'square', 'diamond'],
    options: [[2, 2], [1, 2], [2, 1], [3, 2]]
  },
  {
    id: 'fmx-15',
    family: 'wrapper',
    difficulty: 'medium',
    rows: ['diamond', 'square', 'circle', 'triangle'],
    cols: ['alone', 'square', 'circle', 'diamond'],
    options: [[2, 2], [1, 2], [2, 1], [3, 2]]
  },
  {
    id: 'fmx-16',
    family: 'nesting',
    difficulty: 'medium',
    rows: ['square', 'circle', 'triangle', 'hexagon'],
    cols: [1, 2, 3],
    options: [[2, 2], [1, 2], [2, 1], [3, 2]]
  },
  {
    id: 'fmx-17',
    family: 'nesting',
    difficulty: 'hard',
    rows: ['hexagon', 'diamond', 'pentagon', 'circle'],
    cols: [3, 2, 1],
    options: [[2, 2], [1, 2], [2, 0], [3, 2]]
  },
  {
    id: 'fmx-18',
    family: 'markedShape',
    difficulty: 'easy',
    rows: ['circle', 'square', 'triangle', 'pentagon'],
    cols: ['nothing', 'dot', 'cross', 'bar'],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-19',
    family: 'markedShape',
    difficulty: 'medium',
    rows: ['pentagon', 'triangle', 'diamond', 'square'],
    cols: ['nothing', 'bar', 'cross', 'dot'],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  },
  {
    id: 'fmx-20',
    family: 'shapeFill',
    difficulty: 'hard',
    rows: ['half', 'solid', 'none'],
    cols: ['hexagon', 'triangle', 'diamond', 'circle'],
    options: [[2, 2], [1, 2], [2, 1], [2, 3]]
  }
];

// ── Assembly ───────────────────────────────────────────────────────────────

function build(paper: Paper): Question {
  // Each paper was checked against its own family above; here only the shape matters.
  const rule: Family<unknown, unknown> = FAMILIES[paper.family];
  const { rows, cols }: { rows: unknown[]; cols: unknown[] } = paper;
  const cell = (r: number, c: number) => rule.draw(rows[r], cols[c]);

  const grid = [0, 1, 2].flatMap((r) =>
    [0, 1, 2].map((c) => (r === 2 && c === 2 ? null : cell(r, c)))
  );

  const answer = rule.describe(rows[2], cols[2]);
  return {
    id: paper.id,
    topic: 'Matrix reasoning',
    difficulty: paper.difficulty,
    prompt: 'Which figure belongs in the empty cell?',
    figure: matrix(grid),
    optionFigures: paper.options.map(([r, c]) => cell(r, c)),
    options: paper.options.map(([r, c]) => cap(rule.describe(rows[r], cols[c]))),
    answer: 0,
    explanation: `${rule.explain(rows, cols)} The missing cell is therefore ${answer}.`,
    tip: rule.tip
  };
}

export const figureMatrix: Question[] = PAPERS.map(build);
