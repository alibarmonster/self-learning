/**
 * Section — Visual & Figural Reasoning
 *
 * On the real paper these sit inside the logic block: applicants describe it as
 * "very close to an IQ test", and the pattern-recognition items are pictures,
 * not words — matrices, shape series, rotations, mirrors, odd-one-out, folded
 * paper and cube nets.
 *
 * Every figure here is generated as inline SVG rather than shipped as an image
 * file, so the diagrams stay crisp at any size and follow the light/dark theme
 * (each stroke uses currentColor). Questions whose ANSWERS are pictures carry
 * `optionFigures`; their `options` strings are the screen-reader descriptions.
 */

import {
  grid3,
  frame,
  lines,
  motif,
  fig,
  whole,
  solid,
  series,
  analogy,
  matrix,
  net,
  polygon,
  circle,
  square,
  dots,
  boxOfDots,
  pie,
  shadedSquare,
  shadedCircle,
  arrow,
  FLAG,
  FLAG_MIRROR,
  FLAG_FLIP,
  spun,
  vLine,
  hLine,
  diagUp,
  diagDown
} from './svg';
import { figureMatrix } from './figure-matrix';
import type { Question } from '@/types';

// ── Questions ──────────────────────────────────────────────────────────────

const items: Question[] = [
  {
    id: 'fgr-01',
    topic: 'Figure series',
    difficulty: 'easy',
    prompt: 'Which figure comes next in the series?',
    figure: series([boxOfDots(1), boxOfDots(2), boxOfDots(3), boxOfDots(4)]),
    optionFigures: [boxOfDots(5), boxOfDots(3), boxOfDots(6), boxOfDots(4)],
    options: [
      'A box containing five dots',
      'A box containing three dots',
      'A box containing six dots',
      'A box containing four dots'
    ],
    answer: 0,
    explanation: 'Each box gains one dot: 1, 2, 3, 4 — so the next box holds 5.'
  },
  {
    id: 'fgr-02',
    topic: 'Rotation',
    difficulty: 'easy',
    prompt: 'The arrow turns by the same amount each step. Which figure comes next?',
    figure: series([arrow(0), arrow(45), arrow(90), arrow(135)]),
    optionFigures: [arrow(180), arrow(225), arrow(90), arrow(270)],
    options: [
      'An arrow pointing straight down',
      'An arrow pointing down and to the left',
      'An arrow pointing right',
      'An arrow pointing left'
    ],
    answer: 0,
    explanation:
      'The arrow rotates 45° clockwise each step: up, up-right, right, down-right. The next position is 180°, pointing straight down.'
  },
  {
    id: 'fgr-03',
    topic: 'Figure series',
    difficulty: 'easy',
    prompt: 'Which figure completes the series?',
    figure: series([polygon(3), polygon(4), polygon(5)]),
    optionFigures: [polygon(6), polygon(7), polygon(3), polygon(8)],
    options: ['A hexagon', 'A heptagon', 'A triangle', 'An octagon'],
    answer: 0,
    explanation:
      'Each shape has one more side than the last: 3, 4, 5. The next has 6 sides — a hexagon.'
  },
  {
    id: 'fgr-04',
    topic: 'Figure series',
    difficulty: 'easy',
    prompt: 'Which figure comes next?',
    figure: series([pie(1), pie(2), pie(3)]),
    optionFigures: [pie(4), pie(2), pie(0), pie(1)],
    options: [
      'A completely filled circle',
      'A half-filled circle',
      'An empty circle',
      'A quarter-filled circle'
    ],
    answer: 0,
    explanation:
      'One more quarter is shaded each step — a quarter, a half, three quarters. The next circle is fully shaded.'
  },
  {
    id: 'fgr-05',
    topic: 'Figure series',
    difficulty: 'medium',
    prompt: 'Which figure continues the pattern?',
    figure: series([
      shadedSquare(0),
      shadedSquare(0.5),
      shadedSquare(1),
      shadedCircle(0),
      shadedCircle(0.5)
    ]),
    optionFigures: [shadedCircle(1), shadedSquare(1), shadedCircle(0), polygon(3)],
    options: [
      'A completely filled circle',
      'A completely filled square',
      'An empty circle',
      'A triangle'
    ],
    answer: 0,
    explanation:
      'The shading runs empty → half → full within each shape, and the shape then changes. The circle has been empty and half-filled, so it is now fully filled.'
  },
  {
    id: 'fgr-06',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which figure does not belong with the others?',
    optionFigures: [polygon(6), polygon(5), polygon(5, { rot: -50 }), polygon(5, { rot: 20 })],
    options: [
      'The six-sided figure',
      'The upright five-sided figure',
      'The slightly tilted five-sided figure',
      'The rotated five-sided figure'
    ],
    answer: 0,
    explanation:
      'Three of the figures are pentagons at different rotations. The remaining one has six sides.'
  },
  {
    id: 'fgr-07',
    topic: 'Odd one out',
    difficulty: 'medium',
    prompt: 'Three of these figures share a property the fourth does not. Which is the odd one out?',
    optionFigures: [
      '<polyline points="25,25 75,25 75,75 25,75"/>',
      square(),
      polygon(3),
      circle(34)
    ],
    options: [
      'The figure with a gap in its outline',
      'The square',
      'The triangle',
      'The circle'
    ],
    answer: 0,
    explanation:
      'The square, the triangle and the circle are all closed outlines. The first figure is left open — its path never returns to where it started.'
  },
  {
    id: 'fgr-08',
    topic: 'Odd one out',
    difficulty: 'medium',
    prompt: 'Which figure does not belong?',
    optionFigures: [
      circle(30) + `<circle cx="50" cy="14" r="6.5" ${solid}/>`,
      circle(30) + `<circle cx="50" cy="50" r="6.5" ${solid}/>`,
      square(60) + `<circle cx="50" cy="50" r="6.5" ${solid}/>`,
      polygon(3, { r: 40 }) + `<circle cx="50" cy="58" r="6.5" ${solid}/>`
    ],
    options: [
      'The shape whose dot sits outside it',
      'The circle with a dot at its centre',
      'The square with a dot at its centre',
      'The triangle with a dot inside it'
    ],
    answer: 0,
    explanation:
      'In three of the figures the dot lies inside the shape. In the odd one it sits outside the outline.'
  },
  {
    id: 'fgr-09',
    topic: 'Odd one out',
    difficulty: 'hard',
    prompt:
      'Three of these figures are the same shape simply turned around. Which one is not?',
    optionFigures: [FLAG_MIRROR, FLAG, spun(90), spun(180)],
    options: [
      'The mirrored figure',
      'The upright figure',
      'The figure turned a quarter turn',
      'The figure turned half a turn'
    ],
    answer: 0,
    explanation:
      'Three of the figures are the same glyph rotated by 0°, 90° and 180°. The odd one is a mirror image — no amount of turning in the plane will produce it.'
  },
  {
    id: 'fgr-10',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt: 'Which figure belongs in the empty cell?',
    figure: matrix([
      boxOfDots(1), boxOfDots(2), boxOfDots(3),
      boxOfDots(2), boxOfDots(3), boxOfDots(4),
      boxOfDots(3), boxOfDots(4), null
    ]),
    optionFigures: [boxOfDots(5), boxOfDots(4), boxOfDots(6), boxOfDots(3)],
    options: [
      'A box containing five dots',
      'A box containing four dots',
      'A box containing six dots',
      'A box containing three dots'
    ],
    answer: 0,
    explanation:
      'The dot count rises by one along every row and down every column. The bottom-right cell follows 3, 4 → 5.'
  },
  {
    id: 'fgr-11',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt: 'Which figure belongs in the empty cell?',
    figure: matrix([
      polygon(3), polygon(4), polygon(5),
      polygon(4), polygon(5), polygon(6),
      polygon(5), polygon(6), null
    ]),
    optionFigures: [polygon(7), polygon(6), polygon(8), polygon(5)],
    options: ['A heptagon', 'A hexagon', 'An octagon', 'A pentagon'],
    answer: 0,
    explanation:
      'Each step right or down adds one side. The bottom row runs 5, 6 → 7 sides, a heptagon.'
  },
  {
    id: 'fgr-12',
    topic: 'Matrix reasoning',
    difficulty: 'hard',
    prompt: 'Which figure belongs in the empty cell?',
    figure: matrix([
      arrow(0), arrow(90), arrow(180),
      arrow(90), arrow(180), arrow(270),
      arrow(180), arrow(270), null
    ]),
    optionFigures: [arrow(0), arrow(180), arrow(270), arrow(90)],
    options: [
      'An arrow pointing up',
      'An arrow pointing down',
      'An arrow pointing left',
      'An arrow pointing right'
    ],
    answer: 0,
    explanation:
      'The arrow turns 90° clockwise with every step right. The bottom row goes down, left, and then a further 90° brings it back to pointing up.'
  },
  {
    id: 'fgr-13',
    topic: 'Matrix reasoning',
    difficulty: 'hard',
    prompt:
      'In each row, the third figure combines the first two. Which figure belongs in the empty cell?',
    figure: matrix([
      vLine, hLine, vLine + hLine,
      diagUp, diagDown, diagUp + diagDown,
      circle(26), square(64), null
    ]),
    optionFigures: [circle(26) + square(64), circle(26), square(64), polygon(3) + circle(26)],
    options: [
      'A circle inside a square',
      'A circle on its own',
      'A square on its own',
      'A circle inside a triangle'
    ],
    answer: 0,
    explanation:
      'Row one overlays a vertical and a horizontal line to make a cross; row two overlays two diagonals to make an X. Row three must overlay the circle and the square.'
  },
  {
    id: 'fgr-14',
    topic: 'Analogy',
    difficulty: 'easy',
    prompt: 'Complete the analogy: the first figure is to the second as the third is to which option?',
    figure: analogy(square(34), square(74), circle(17)),
    optionFigures: [circle(37), circle(17), square(74), polygon(3, { r: 37 })],
    options: ['A large circle', 'A small circle', 'A large square', 'A large triangle'],
    answer: 0,
    explanation:
      'The relationship is simply "the same shape, made much larger". A small circle therefore maps to a large circle.'
  },
  {
    id: 'fgr-15',
    topic: 'Analogy',
    difficulty: 'medium',
    prompt: 'Complete the analogy: the first figure is to the second as the third is to which option?',
    figure: analogy(shadedSquare(0), shadedSquare(0.5), shadedCircle(0)),
    optionFigures: [shadedCircle(0.5), shadedCircle(1), shadedSquare(0.5), circle(35)],
    options: [
      'A circle with its left half filled',
      'A completely filled circle',
      'A square with its left half filled',
      'An empty circle'
    ],
    answer: 0,
    explanation:
      'The transformation fills the left half of the shape. Applied to the empty circle, it produces a circle with its left half filled.'
  },
  {
    id: 'fgr-16',
    topic: 'Mirror image',
    difficulty: 'medium',
    prompt: 'Which figure is the mirror image of the figure below, reflected in a vertical line?',
    figure: fig(FLAG),
    optionFigures: [FLAG_MIRROR, FLAG, FLAG_FLIP, spun(180)],
    options: [
      'The figure flipped left-to-right',
      'The original figure unchanged',
      'The figure flipped top-to-bottom',
      'The figure turned half a turn'
    ],
    answer: 0,
    explanation:
      'A vertical mirror swaps left and right while leaving top and bottom alone: the upright stroke moves to the right-hand side and both arms now point left.'
  },
  {
    id: 'fgr-17',
    topic: 'Rotation',
    difficulty: 'medium',
    prompt: 'Which figure shows the figure below turned a quarter turn clockwise?',
    figure: fig(FLAG),
    optionFigures: [spun(90), spun(-90), spun(180), FLAG_MIRROR],
    options: [
      'The figure turned a quarter turn clockwise',
      'The figure turned a quarter turn anticlockwise',
      'The figure turned half a turn',
      'The figure reflected left-to-right'
    ],
    answer: 0,
    explanation:
      'Rotating 90° clockwise sends the tall stroke to the top edge and the arms downward. Note the mirror image can never be produced by rotation alone.'
  },
  {
    id: 'fgr-18',
    topic: 'Paper folding',
    difficulty: 'medium',
    prompt:
      'A square sheet is folded exactly in half along the dashed line, then a single hole is punched through both layers. How many holes are in the sheet when it is unfolded?',
    figure: fig(
      square(72) +
        '<path d="M50,14 L50,86" stroke-dasharray="6 6" opacity="0.6"/>' +
        `<circle cx="30" cy="42" r="7" ${solid}/>`
    ),
    options: ['1', '2', '3', '4'],
    answer: 1,
    explanation:
      'One fold means two layers, so a single punch makes one hole in each layer. Unfolded, the two holes sit as a mirror pair either side of the fold line.'
  },
  {
    id: 'fgr-19',
    topic: 'Paper folding',
    difficulty: 'hard',
    prompt:
      'A square sheet is folded in half, then in half again, and one hole is punched through all the layers. How many holes appear when it is unfolded?',
    figure: fig(
      square(72) +
        '<path d="M50,14 L50,86 M14,50 L86,50" stroke-dasharray="6 6" opacity="0.6"/>' +
        `<circle cx="30" cy="32" r="7" ${solid}/>`
    ),
    options: ['2', '3', '4', '8'],
    answer: 2,
    explanation:
      'Each fold doubles the number of layers: one fold gives 2, two folds give 4. A single punch therefore pierces 4 layers and leaves 4 holes.'
  },
  {
    id: 'fgr-20',
    topic: 'Cube nets',
    difficulty: 'hard',
    prompt: 'Which of these flat shapes can be folded into a closed cube?',
    optionFigures: [
      net([[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]]),
      net([[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]]),
      net([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]]),
      net([[0, 0], [1, 0], [0, 1], [1, 1], [0, 2], [0, 3]])
    ],
    options: [
      'The cross-shaped net',
      'The two-by-three block of squares',
      'The single row of six squares',
      'The two-by-two block with a two-square tail'
    ],
    answer: 0,
    explanation:
      'The cross is the classic cube net: the vertical strip of four wraps around as a band, and the two side squares close the remaining faces. A solid block or a straight strip of six always leaves faces overlapping and others uncovered.'
  },
  {
    id: 'fgr-21',
    topic: 'Cube nets',
    difficulty: 'hard',
    prompt:
      'This net is folded into a cube. Which number ends up on the face opposite the face marked 1?',
    figure: net(
      [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [1, 3]],
      ['1', '2', '3', '4', '5', '6']
    ),
    options: ['2', '3', '5', '6'],
    answer: 2,
    explanation:
      'The squares 1, 3, 5 and 6 form the vertical strip, which wraps into a band of four faces. In such a band, faces two apart end up opposite each other — so 1 faces 5, and 3 faces 6. The side flaps 2 and 4 are the remaining opposite pair.'
  },
  {
    id: 'fgr-22',
    topic: 'Figure counting',
    difficulty: 'medium',
    prompt: 'How many triangles of any size are in this figure?',
    figure: fig(square(72) + '<path d="M14,14 L86,86 M86,14 L14,86"/>'),
    options: ['4', '6', '8', '10'],
    answer: 2,
    explanation:
      'The two diagonals cut the square into 4 small triangles. Each pair of adjacent small triangles also forms a larger triangle — one on each side of the square, giving 4 more. 4 + 4 = 8.'
  },
  {
    id: 'fgr-23',
    topic: 'Figure counting',
    difficulty: 'medium',
    prompt: 'How many squares of any size are in this figure?',
    figure: fig(square(72) + '<path d="M50,14 L50,86 M14,50 L86,50"/>'),
    options: ['4', '5', '6', '8'],
    answer: 1,
    explanation: 'There are 4 small squares plus the large square that contains them: 5 in total.'
  },
  {
    id: 'fgr-24',
    topic: 'Symmetry',
    difficulty: 'medium',
    prompt: 'Which figure has exactly one line of symmetry?',
    optionFigures: [
      '<polygon points="50,14 82,86 18,86"/>',
      square(70),
      '<rect x="14" y="30" width="72" height="40"/>',
      circle(35)
    ],
    options: ['The triangle', 'The square', 'The rectangle', 'The circle'],
    answer: 0,
    explanation:
      'The isosceles triangle can only be folded onto itself down its vertical axis — one line. The rectangle has two, the square has four, and the circle has infinitely many.'
  },
  {
    id: 'fgr-25',
    topic: 'Figure series',
    difficulty: 'hard',
    prompt: 'Which figure comes next in the series?',
    figure: series([
      polygon(3) + dots(1),
      polygon(4) + dots(2),
      polygon(5) + dots(3)
    ]),
    optionFigures: [
      polygon(6) + dots(4),
      polygon(6) + dots(3),
      polygon(7) + dots(4),
      polygon(5) + dots(4)
    ],
    options: [
      'A hexagon containing four dots',
      'A hexagon containing three dots',
      'A heptagon containing four dots',
      'A pentagon containing four dots'
    ],
    answer: 0,
    explanation:
      'Two things advance together: the number of sides (3, 4, 5) and the number of dots (1, 2, 3). The next figure needs 6 sides and 4 dots.'
  },
  {
    id: 'fgr-26',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt:
      'In each row, the third figure keeps only what the first two have in common. Which figure belongs in the empty cell?',
    figure: matrix([
      circle(30) + vLine, square(64) + vLine, vLine,
      circle(30) + hLine, polygon(3) + hLine, hLine,
      square(64) + diagUp, circle(30) + diagUp, null
    ]),
    optionFigures: [diagUp, diagDown, diagUp + diagDown, vLine],
    options: [
      'A single line rising to the right',
      'A single line falling to the right',
      'Two crossed diagonal lines',
      'A single vertical line'
    ],
    answer: 0,
    explanation:
      'The shapes differ in every row, so they cannot be the pattern. What survives into the third cell is the element both figures share — here the diagonal rising to the right.',
    tip: 'Ask what the first two cells have in common and what they do not. One of the two is almost always the rule.'
  },
  {
    id: 'fgr-27',
    topic: 'Matrix reasoning',
    difficulty: 'hard',
    prompt:
      'In each row, the third figure keeps only the parts that the first two do NOT have in common. Which figure belongs in the empty cell?',
    figure: matrix([
      vLine + hLine + diagUp, diagUp, vLine + hLine,
      diagUp + diagDown + vLine, vLine, diagUp + diagDown,
      hLine + diagUp + diagDown, diagUp, null
    ]),
    optionFigures: [hLine + diagDown, hLine + diagUp, diagUp + diagDown, vLine + hLine],
    options: [
      'A horizontal line with a line falling to the right',
      'A horizontal line with a line rising to the right',
      'Two crossed diagonal lines',
      'A cross of one vertical and one horizontal line'
    ],
    answer: 0,
    explanation:
      'The second cell names one line to delete. Removing the rising diagonal from the third row leaves the horizontal line and the falling diagonal.',
    tip: 'Count the strokes in each cell. When the third has fewer than the first, the rule is subtraction, not addition.'
  },
  {
    id: 'fgr-28',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt: 'Which figure belongs in the empty cell?',
    figure: grid3((r, c) => frame() + lines(c + 1, (['vertical', 'horizontal', 'diagonal'] as const)[r])),
    optionFigures: [
      frame() + lines(3, 'diagonal'),
      frame() + lines(2, 'diagonal'),
      frame() + lines(3, 'horizontal'),
      frame() + lines(4, 'diagonal')
    ],
    options: [
      'A box with three diagonal lines',
      'A box with two diagonal lines',
      'A box with three horizontal lines',
      'A box with four diagonal lines'
    ],
    answer: 0,
    explanation:
      'Two rules run at once: the row fixes the direction of the lines — vertical, horizontal, then diagonal — and the column fixes how many there are: one, two, then three.',
    tip: 'Check the rows and the columns separately. A matrix usually carries one rule in each direction.'
  },
  {
    id: 'fgr-29',
    topic: 'Matrix reasoning',
    difficulty: 'easy',
    prompt: 'Which figure belongs in the empty cell?',
    figure: grid3((r, c) => spun(((r + c) * 90) % 360, FLAG)),
    optionFigures: [spun(0, FLAG), spun(90, FLAG), spun(180, FLAG), spun(270, FLAG)],
    options: [
      'The shape upright, arms pointing right',
      'The shape turned a quarter clockwise',
      'The shape upside down',
      'The shape turned a quarter anticlockwise'
    ],
    answer: 0,
    explanation:
      'Each step to the right turns the shape a quarter clockwise, and so does each step down. Three quarter-turns from the top-left cell of the last row brings it back upright.',
    tip: 'With rotations, count quarter-turns rather than trying to picture the whole spin at once. Four brings you back to the start.'
  },
  {
    id: 'fgr-30',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt: 'The rule runs down the columns as well as across. Which figure belongs in the empty cell?',
    figure: grid3((r, c) =>
      motif((['triangle', 'square', 'pentagon'] as const)[c], (['none', 'half', 'solid'] as const)[r])
    ),
    optionFigures: [
      motif('pentagon', 'solid'),
      motif('pentagon', 'half'),
      motif('square', 'solid'),
      motif('hexagon', 'solid')
    ],
    options: ['A solid pentagon', 'A half-shaded pentagon', 'A solid square', 'A solid hexagon'],
    answer: 0,
    explanation:
      'The shape is constant down each column — triangle, square, pentagon — while the shading deepens down the rows: empty, half, solid. The missing cell is the pentagon at full shading.',
    tip: 'When the shapes change across a row and repeat down a column, read the column for one rule and the row for the other.'
  },
  {
    id: 'fgr-31',
    topic: 'Matrix reasoning',
    difficulty: 'medium',
    prompt: 'Which figure belongs in the empty cell?',
    figure: matrix([
      polygon(3, { r: 24 }), polygon(3, { r: 24 }) + circle(40), polygon(3, { r: 24 }) + square(80),
      circle(24), circle(24) + circle(40), circle(24) + square(80),
      square(34), square(34) + circle(40), null
    ]),
    optionFigures: [
      square(34) + square(80),
      square(34) + circle(40),
      circle(24) + square(80),
      square(34)
    ],
    options: [
      'A small square inside a large square',
      'A small square inside a circle',
      'A small circle inside a square',
      'A small square on its own'
    ],
    answer: 0,
    explanation:
      'Nothing about the inner shape changes along a row. The second cell puts a circle around it and the third puts a square around it, so the missing cell is the small square inside a large square.',
    tip: 'If the first cell reappears untouched inside the others, the rule is what has been added around it.'
  },
  {
    id: 'fgr-32',
    topic: 'Matrix reasoning',
    difficulty: 'easy',
    prompt: 'Which figure belongs in the empty cell?',
    figure: grid3((r, c) => pie(1, { start: (r + c) % 4 })),
    optionFigures: [
      pie(1, { start: 0 }),
      pie(1, { start: 1 }),
      pie(1, { start: 2 }),
      pie(1, { start: 3 })
    ],
    options: [
      'A circle with the top-right quarter shaded',
      'A circle with the bottom-right quarter shaded',
      'A circle with the bottom-left quarter shaded',
      'A circle with the top-left quarter shaded'
    ],
    answer: 0,
    explanation:
      'The shaded quarter moves one step clockwise with every cell to the right and with every cell down. From the bottom-left cell, two more steps clockwise land back on the top-right quarter.',
    tip: 'Track a moving element by its position on a clock face, then count the steps rather than redrawing it.'
  },
  {
    id: 'fgr-33',
    topic: 'Matrix reasoning',
    difficulty: 'hard',
    prompt:
      'In each row, the number of dots in the third box is the difference between the first two. Which figure belongs in the empty cell?',
    figure: matrix([
      boxOfDots(5), boxOfDots(2), boxOfDots(3),
      boxOfDots(7), boxOfDots(3), boxOfDots(4),
      boxOfDots(6), boxOfDots(4), null
    ]),
    optionFigures: [boxOfDots(2), boxOfDots(1), boxOfDots(3), boxOfDots(4)],
    options: [
      'A box with two dots',
      'A box with one dot',
      'A box with three dots',
      'A box with four dots'
    ],
    answer: 0,
    explanation:
      'Row one gives 5 − 2 = 3 and row two gives 7 − 3 = 4, so row three gives 6 − 4 = 2.',
    tip: 'Counting matrices hide arithmetic. Write the three numbers of each row down and test +, − and × on them.'
  }
];

/*
 * Most art above is authored as a bare shape fragment, because that is what the
 * series/matrix/analogy builders compose. whole() wraps anything that is not
 * already a complete <svg> in its own 100x100 frame, so a question can mix
 * builder output with raw fragments without caring which is which.
 */
export const figural: Question[] = [...items, ...figureMatrix].map((q) => ({
  ...q,
  ...(q.figure ? { figure: whole(q.figure) } : {}),
  ...(q.optionFigures ? { optionFigures: q.optionFigures.map(whole) } : {})
}));
