/**
 * Section — Inductive Reasoning (grid of symbols)
 *
 * Modelled on the AssessmentDay / Talent Q / Korn Ferry Elements format, and on
 * Raven's Progressive Matrices before them: a 3x3 grid of symbols with one cell
 * missing, and **twelve** candidate tiles to choose from.
 *
 * The twelve options are deliberately the full cross-product of the two
 * attributes in play (four shapes × three fills, four directions × three
 * frames, and so on). That is what makes the format hard: elimination and
 * guessing barely help, so you have to derive both rules and then build the
 * missing tile in your head before you look at the answers.
 *
 * Every grid below is generated from an explicit (row, col) rule, so the
 * pattern is guaranteed consistent rather than hand-drawn and hoped for.
 */

import {
  grid3,
  motif,
  arrow,
  lines,
  circle,
  square,
  polygon,
  pie,
  solid,
  vLine,
  hLine,
  diagUp,
  diagDown,
  whole,
  type Fill,
  type Shape
} from './svg';
import type { Question } from '@/types';

/** A tile: its screen-reader description and its SVG art. */
type Entry = [description: string, art: string];

/** Every grid question carries a figure and twelve pictured options. */
type GridQuestion = Question & { figure: string; optionFigures: string[] };

// ── Option-bank plumbing ───────────────────────────────────────────────────

/**
 * Builds the twelve options and looks the answer index up by description, so a
 * miscounted index is impossible. The validator rejects an index of -1, which
 * is what a typo in `correct` would produce.
 */
function bank(entries: Entry[], correct: string) {
  return {
    optionFigures: entries.map((e) => e[1]),
    options: entries.map((e) => e[0]),
    answer: entries.findIndex((e) => e[0] === correct)
  };
}

/** Cross-product helper: every combination of `as` and `bs`, in a stable order. */
const cross = <const A, const B>(
  as: readonly A[],
  bs: readonly B[],
  describe: (a: A, b: B) => string,
  draw: (a: A, b: B) => string
): Entry[] =>
  as.flatMap((a) => bs.map((b): Entry => [describe(a, b), draw(a, b)]));

const SHAPE_SET: Shape[] = ['circle', 'square', 'triangle', 'diamond'];
const FILLS: Fill[] = ['none', 'half', 'solid'];
const FILL_WORD: Record<Fill, string> = { none: 'Empty', half: 'Half-filled', solid: 'Solid' };

// Frames that an arrow can sit inside.
const framed = (inner: string, frame: 'none' | 'circle' | 'square') =>
  (frame === 'circle' ? circle(42) : frame === 'square' ? square(84) : '') + inner;

// Overlay bank shared by the union and difference questions.
type Overlay = 'circle' | 'square' | 'triangle' | 'diamond';

const OVERLAY: Record<Overlay, string> = {
  circle: circle(30),
  square: square(62),
  triangle: polygon(3, { r: 38 }),
  diamond: polygon(4, { r: 40 })
};

const overlayEntries = () => {
  const names: Overlay[] = ['circle', 'square', 'triangle', 'diamond'];
  const combos: Overlay[][] = [
    ...names.map((n) => [n]),
    ['circle', 'square'],
    ['circle', 'triangle'],
    ['circle', 'diamond'],
    ['square', 'triangle'],
    ['square', 'diamond'],
    ['triangle', 'diamond'],
    ['circle', 'square', 'triangle'],
    ['circle', 'triangle', 'diamond']
  ];
  const title = (parts: string[]) =>
    parts.length === 1
      ? parts[0][0].toUpperCase() + parts[0].slice(1) + ' alone'
      : parts.map((p) => p[0].toUpperCase() + p.slice(1)).join(' + ');
  return combos.map((parts): Entry => [title(parts), parts.map((p) => OVERLAY[p]).join('')]);
};

// ── Questions ──────────────────────────────────────────────────────────────

const PROMPT = 'Which of the twelve tiles belongs in the empty cell?';

const items: GridQuestion[] = [
  {
    id: 'ind-01',
    topic: 'Shape × fill',
    difficulty: 'easy',
    prompt: PROMPT,
    figure: grid3((r, c) => motif((['circle', 'square', 'triangle'] as const)[r], FILLS[c])),
    ...bank(
      cross(
        SHAPE_SET,
        FILLS,
        (s, f) => `${FILL_WORD[f]} ${s}`,
        (s, f) => motif(s, f)
      ),
      'Solid triangle'
    ),
    explanation:
      'Two independent rules are at work. The row fixes the shape — circles, then squares, then triangles. The column fixes the fill — empty, then half, then solid. The missing cell is in the triangle row and the solid column, so it is a solid triangle.'
  },
  {
    id: 'ind-02',
    topic: 'Shape × count',
    difficulty: 'easy',
    prompt: PROMPT,
    figure: grid3((r, c) => insideDots((['circle', 'square', 'triangle'] as const)[r], c + 1)),
    ...bank(
      cross(
        ['circle', 'square', 'triangle', 'hexagon'],
        [1, 2, 3],
        (s, n) => `${s[0].toUpperCase() + s.slice(1)} containing ${n} dot${n > 1 ? 's' : ''}`,
        (s, n) => insideDots(s, n)
      ),
      'Triangle containing 3 dots'
    ),
    explanation:
      'The row sets the outline (circle, square, triangle) and the column sets how many dots sit inside it (one, two, three). The empty cell is the triangle row and the three-dot column.'
  },
  {
    id: 'ind-03',
    topic: 'Direction × frame',
    difficulty: 'medium',
    prompt: PROMPT,
    figure: grid3((r, c) =>
      framed(arrow(([0, 90, 180] as const)[c]), (['none', 'circle', 'square'] as const)[r])
    ),
    ...bank(
      cross(
        [
          ['up', 0],
          ['right', 90],
          ['down', 180],
          ['left', 270]
        ],
        ['none', 'circle', 'square'],
        ([word], f) =>
          `Arrow pointing ${word}${f === 'none' ? ', no frame' : `, inside a ${f}`}`,
        ([, deg], f) => framed(arrow(deg), f)
      ),
      'Arrow pointing down, inside a square'
    ),
    explanation:
      'The column controls where the arrow points — up, right, then down. The row controls what encloses it — nothing, a circle, then a square. The missing tile needs the third column and the third row: a down arrow inside a square.'
  },
  {
    id: 'ind-04',
    topic: 'Count × fill',
    difficulty: 'medium',
    prompt: PROMPT,
    figure: grid3((r, c) => bars(r + 1, FILLS[c])),
    ...bank(
      cross(
        [1, 2, 3, 4],
        FILLS,
        (n, f) => `${n} ${FILL_WORD[f].toLowerCase()} bar${n > 1 ? 's' : ''}`,
        (n, f) => bars(n, f)
      ),
      '3 solid bars'
    ),
    explanation:
      'Going down, the number of bars increases from one to three. Going across, the fill runs empty, half, solid. The missing cell therefore holds three solid bars.'
  },
  {
    id: 'ind-05',
    topic: 'Combining figures',
    difficulty: 'hard',
    prompt:
      'In every row, the third tile combines the first two. Which of the twelve tiles belongs in the empty cell?',
    figure: grid3((r, c) => {
      const rows = [
        [vLine, hLine, vLine + hLine],
        [diagUp, diagDown, diagUp + diagDown],
        [OVERLAY.circle, OVERLAY.triangle, OVERLAY.circle + OVERLAY.triangle]
      ];
      return rows[r][c];
    }),
    ...bank(overlayEntries(), 'Circle + Triangle'),
    explanation:
      'Row one overlays a vertical and a horizontal line to make a cross; row two overlays two diagonals to make an X. The rule is simple union — everything from both tiles appears in the third. Row three must therefore show the circle and the triangle together.'
  },
  {
    id: 'ind-06',
    topic: 'Combining figures',
    difficulty: 'hard',
    prompt:
      'In every row, the third tile shows what is left when the second tile is removed from the first. Which tile belongs in the empty cell?',
    figure: grid3((r, c) => {
      const rows = [
        [vLine + hLine, vLine, hLine],
        [diagUp + diagDown, diagUp, diagDown],
        [OVERLAY.circle + OVERLAY.square, OVERLAY.square, OVERLAY.circle]
      ];
      return rows[r][c];
    }),
    ...bank(overlayEntries(), 'Circle alone'),
    explanation:
      'This is the mirror image of a union rule: whatever the second tile contains is subtracted from the first. Taking the square away from a circle-and-square tile leaves the circle on its own.'
  },
  {
    id: 'ind-07',
    topic: 'Latin square',
    difficulty: 'hard',
    prompt: PROMPT,
    figure: grid3((r, c) =>
      motif(
        (['triangle', 'circle', 'square'] as const)[(r + c) % 3],
        (['solid', 'none', 'half'] as const)[(r + 2 * c) % 3]
      )
    ),
    ...bank(
      cross(
        SHAPE_SET,
        FILLS,
        (s, f) => `${FILL_WORD[f]} ${s}`,
        (s, f) => motif(s, f)
      ),
      'Solid circle'
    ),
    explanation:
      'Neither rule is a simple left-to-right progression. Instead each of the three shapes appears exactly once in every row and every column, and so does each of the three fills — two independent Latin squares laid on top of each other. The bottom-right cell is the only combination its row and column have not used yet: a solid circle.'
  },
  {
    id: 'ind-08',
    topic: 'Shape × size',
    difficulty: 'medium',
    prompt: PROMPT,
    figure: grid3((r, c) => motif((['circle', 'square', 'hexagon'] as const)[r], 'none', [0.45, 0.7, 1][c])),
    ...bank(
      cross(
        ['circle', 'square', 'hexagon', 'triangle'],
        [
          ['small', 0.45],
          ['medium', 0.7],
          ['large', 1]
        ],
        (s, [word]) => `${word[0].toUpperCase() + word.slice(1)} ${s}`,
        (s, [, scale]) => motif(s, 'none', scale)
      ),
      'Large hexagon'
    ),
    explanation:
      'The row fixes the shape and the column fixes the size, which grows from small to large across each row. The empty cell sits in the hexagon row and the large column.'
  },
  {
    id: 'ind-09',
    topic: 'Shape × position',
    difficulty: 'medium',
    prompt: PROMPT,
    figure: grid3((r, c) =>
      withCornerDot((['square', 'circle', 'triangle'] as const)[r], (['tl', 'tr', 'br'] as const)[c])
    ),
    ...bank(
      cross(
        SHAPE_SET,
        [
          ['top left', 'tl'],
          ['top right', 'tr'],
          ['bottom right', 'br']
        ],
        (s, [word]) => `${s[0].toUpperCase() + s.slice(1)} with a dot at the ${word}`,
        (s, [, pos]) => withCornerDot(s, pos)
      ),
      'Triangle with a dot at the bottom right'
    ),
    explanation:
      'The dot travels clockwise across each row — top left, top right, bottom right — while the row itself decides the shape. The missing tile is a triangle with the dot at the bottom right.'
  },
  {
    id: 'ind-10',
    topic: 'Orientation × count',
    difficulty: 'hard',
    prompt: PROMPT,
    figure: grid3((r, c) => lines(r + c + 2, (['vertical', 'horizontal', 'diagonal'] as const)[r])),
    ...bank(
      cross(
        ['vertical', 'horizontal', 'diagonal'],
        [3, 4, 5, 6],
        (o, n) => `${n} ${o} lines`,
        (o, n) => lines(n, o)
      ),
      '6 diagonal lines'
    ),
    explanation:
      'The row sets the orientation — vertical, horizontal, then diagonal. The count rises by one with every step right and every step down, so the bottom row runs four, five, six. The missing tile is six diagonal lines.'
  },
  {
    id: 'ind-11',
    topic: 'Shape × inner mark',
    difficulty: 'medium',
    prompt: PROMPT,
    figure: grid3((r, c) =>
      withMark((['circle', 'square', 'triangle'] as const)[r], (['dot', 'cross', 'bar'] as const)[c])
    ),
    ...bank(
      cross(
        SHAPE_SET,
        ['dot', 'cross', 'bar'],
        (s, m) => `${s[0].toUpperCase() + s.slice(1)} containing a ${m}`,
        (s, m) => withMark(s, m)
      ),
      'Triangle containing a bar'
    ),
    explanation:
      'The row picks the outer shape and the column picks the mark inside it — a dot, a cross, then a bar. The empty cell needs the triangle row and the bar column.'
  },
  {
    id: 'ind-12',
    topic: 'Rotation × count',
    difficulty: 'hard',
    prompt: PROMPT,
    figure: grid3((r, c) => pie(r + 1, { start: c })),
    ...bank(
      cross(
        [1, 2, 3],
        [0, 1, 2, 3],
        (n, s) =>
          `${n} shaded quarter${n > 1 ? 's' : ''} starting at ${['12', '3', '6', '9'][s]} o'clock`,
        (n, s) => pie(n, { start: s })
      ),
      "3 shaded quarters starting at 6 o'clock"
    ),
    explanation:
      'Two things change at once. Down the grid, the number of shaded quarters grows from one to three. Across each row, the shading rotates one quarter-turn clockwise, so the starting quarter moves from 12 to 3 to 6 o\'clock. The missing tile has three quarters shaded, beginning at 6 o\'clock.'
  }
];

// ── Local motif builders ───────────────────────────────────────────────────

/** A shape with `n` small dots arranged in a row across its middle. */
function insideDots(shape: Shape, n: number): string {
  const y = shape === 'triangle' ? 64 : 50;
  const spread = 13;
  const start = 50 - ((n - 1) * spread) / 2;
  let marks = '';
  for (let i = 0; i < n; i++) {
    marks += `<circle cx="${(start + i * spread).toFixed(1)}" cy="${y}" r="5" ${solid}/>`;
  }
  return motif(shape, 'none') + marks;
}

/** `n` stacked horizontal bars with a fill treatment. */
function bars(n: number, fill: Fill): string {
  const h = 13;
  const gap = 6;
  const totalH = n * h + (n - 1) * gap;
  let body = '';
  for (let i = 0; i < n; i++) {
    const y = 50 - totalH / 2 + i * (h + gap);
    body += `<rect x="22" y="${y.toFixed(1)}" width="56" height="${h}" stroke-width="2.5"/>`;
    if (fill === 'solid') {
      body += `<rect x="22" y="${y.toFixed(1)}" width="56" height="${h}" ${solid}/>`;
    } else if (fill === 'half') {
      body += `<rect x="22" y="${y.toFixed(1)}" width="28" height="${h}" ${solid}/>`;
    }
  }
  return body;
}

/**
 * A centred shape with a dot in one corner of the cell. The dot sits outside the
 * shape rather than inside it, which keeps the position unambiguous for every
 * outline — including the triangle, whose corners are not where you expect.
 */
function withCornerDot(shape: Shape, pos: 'tl' | 'tr' | 'br'): string {
  const at = { tl: [24, 24], tr: [76, 24], br: [76, 76] }[pos];
  return (
    motif(shape, 'none', 0.62) +
    `<circle cx="${at[0]}" cy="${at[1]}" r="6.5" ${solid}/>`
  );
}

/** A shape with a small mark at its centre of gravity. */
function withMark(shape: Shape, mark: 'dot' | 'cross' | 'bar'): string {
  const y = shape === 'triangle' ? 60 : 50;
  const marks = {
    dot: `<circle cx="50" cy="${y}" r="7" ${solid}/>`,
    cross: `<path d="M40,${y - 10} L60,${y + 10} M60,${y - 10} L40,${y + 10}" stroke-width="3.5"/>`,
    bar: `<path d="M37,${y} L63,${y}" stroke-width="4"/>`
  };
  return motif(shape, 'none') + marks[mark];
}

// Grids and option art are authored as fragments; wrap them into whole documents.
export const inductive: Question[] = items.map((q) => ({
  ...q,
  figure: whole(q.figure),
  optionFigures: q.optionFigures.map(whole)
}));
