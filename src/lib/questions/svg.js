/**
 * Shared SVG builders for the picture-based sections.
 *
 * Everything is generated as inline SVG rather than shipped as image files, so
 * the diagrams stay crisp at any size and follow the light/dark theme — each
 * stroke uses currentColor, which the page sets from the theme token.
 *
 * Builders return either a bare *fragment* (drawing commands in a 100x100
 * coordinate space) or a *whole* <svg>. Composers like series() and matrix()
 * take fragments; `whole()` wraps anything that is not already a document.
 */

export function fig(body, { w = 100, h = 100 } = {}) {
  return (
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">` +
    `<g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" ` +
    `stroke-linejoin="round">${body}</g></svg>`
  );
}

export const whole = (art) => (art.trim().startsWith('<svg') ? art : fig(art));

export const solid = 'fill="currentColor" stroke="none"';

export const label = (t, { x = 50, y = 62, size = 46, opacity = 0.55 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" font-family="system-ui, sans-serif" opacity="${opacity}" ${solid}>${t}</text>`;

export const qmark = () => label('?');

/** Unique ids for <clipPath>, which must not collide across figures on a page. */
let uid = 0;
export const nextId = (prefix = 'c') => `${prefix}${++uid}`;

// ── Composition ────────────────────────────────────────────────────────────

/** Lays cells out in a row. Each entry is { body, w }; use cell()/sep(). */
export function layout(items, h = 100, gap = 10) {
  let x = 0;
  let body = '';
  for (const item of items) {
    body += `<g transform="translate(${x} 0)">${item.body}</g>`;
    x += item.w + gap;
  }
  return fig(body, { w: Math.max(x - gap, 1), h });
}

export const cell = (body) => ({ body, w: 100 });
export const sep = (glyph) => ({
  body: label(glyph, { x: 20, y: 60, size: 24, opacity: 0.5 }),
  w: 40
});

/** A left-to-right series ending in a "?" cell. */
export const series = (bodies) => layout([...bodies, qmark()].map(cell));

/** An A : B :: C : ? analogy strip. */
export const analogy = (a, b, c) =>
  layout([cell(a), sep('→'), cell(b), sep('::'), cell(c), sep('→'), cell(qmark())]);

/** A 3x3 matrix of fragments; pass null for the missing cell. */
export function matrix(cells) {
  const step = 104;
  let body = '';
  cells.forEach((content, i) => {
    const x = (i % 3) * step + 4;
    const y = Math.floor(i / 3) * step + 4;
    body += `<rect x="${x}" y="${y}" width="96" height="96" rx="8" stroke-width="1.5" opacity="0.3"/>`;
    body += `<g transform="translate(${x} ${y}) scale(0.96)">${content ?? qmark()}</g>`;
  });
  return fig(body, { w: step * 3 + 4, h: step * 3 + 4 });
}

/** Builds a 3x3 matrix from a (row, col) → fragment function, blanking one cell. */
export const grid3 = (draw, blankRow = 2, blankCol = 2) =>
  matrix(
    [0, 1, 2].flatMap((r) =>
      [0, 1, 2].map((c) => (r === blankRow && c === blankCol ? null : draw(r, c)))
    )
  );

/** An unfolded box net. `cells` are [column, row] pairs. */
export function net(cells, labels = null) {
  const size = 40;
  const pad = 5;
  const cols = Math.max(...cells.map((c) => c[0])) + 1;
  const rows = Math.max(...cells.map((c) => c[1])) + 1;
  let body = '';
  cells.forEach(([c, r], i) => {
    const x = pad + c * size;
    const y = pad + r * size;
    body += `<rect x="${x}" y="${y}" width="${size}" height="${size}" stroke-width="2.5"/>`;
    if (labels) {
      body += label(labels[i], { x: x + size / 2, y: y + size / 2 + 7, size: 20, opacity: 1 });
    }
  });
  return fig(body, { w: cols * size + pad * 2, h: rows * size + pad * 2 });
}

// ── Shape vocabulary ───────────────────────────────────────────────────────

export function polygon(n, { r = 36, cx = 50, cy = 50, rot = -90 } = {}) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(' ')}"/>`;
}

export const frame = () => '<rect x="12" y="12" width="76" height="76" rx="7"/>';
export const circle = (r = 35) => `<circle cx="50" cy="50" r="${r}"/>`;
export const square = (s = 70) =>
  `<rect x="${50 - s / 2}" y="${50 - s / 2}" width="${s}" height="${s}"/>`;

// Dice-style pip positions, so "count the dots" reads instantly.
const PIPS = {
  1: [[50, 50]],
  2: [[33, 33], [67, 67]],
  3: [[31, 31], [50, 50], [69, 69]],
  4: [[33, 33], [67, 33], [33, 67], [67, 67]],
  5: [[33, 33], [67, 33], [50, 50], [33, 67], [67, 67]],
  6: [[33, 29], [67, 29], [33, 50], [67, 50], [33, 71], [67, 71]],
  7: [[33, 29], [67, 29], [33, 50], [50, 50], [67, 50], [33, 71], [67, 71]]
};

export const dots = (n) =>
  PIPS[n].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6.5" ${solid}/>`).join('');

export const boxOfDots = (n) => frame() + dots(n);

/** Circle outline with `count` quarters filled, clockwise from `start` quarters past 12. */
export function pie(count, { start = 0, r = 35 } = {}) {
  let body = circle(r);
  for (let i = 0; i < count; i++) {
    const a0 = ((-90 + (start + i) * 90) * Math.PI) / 180;
    const a1 = ((-90 + (start + i + 1) * 90) * Math.PI) / 180;
    const x0 = (50 + r * Math.cos(a0)).toFixed(1);
    const y0 = (50 + r * Math.sin(a0)).toFixed(1);
    const x1 = (50 + r * Math.cos(a1)).toFixed(1);
    const y1 = (50 + r * Math.sin(a1)).toFixed(1);
    body += `<path d="M50,50 L${x0},${y0} A${r},${r} 0 0,1 ${x1},${y1} Z" ${solid}/>`;
  }
  return body;
}

/** 0 = empty, 0.5 = left half filled, 1 = filled. */
export function shadedSquare(amount) {
  const body = square();
  if (amount === 1) return body + `<rect x="15" y="15" width="70" height="70" ${solid}/>`;
  if (amount === 0.5) return body + `<rect x="15" y="15" width="35" height="70" ${solid}/>`;
  return body;
}

export function shadedCircle(amount) {
  const body = circle();
  if (amount === 1) return body + `<circle cx="50" cy="50" r="35" ${solid}/>`;
  if (amount === 0.5) return body + `<path d="M50,15 A35,35 0 0,0 50,85 Z" ${solid}/>`;
  return body;
}

export const arrow = (deg) =>
  `<g transform="rotate(${deg} 50 50)"><path d="M50,82 L50,24"/><polyline points="35,38 50,23 65,38"/></g>`;

// An asymmetric "flag" glyph — rotations, mirrors and flips are all distinct.
export const FLAG = '<path d="M33,18 L33,82 M33,18 L73,18 M33,47 L63,47"/>';
export const FLAG_MIRROR = '<path d="M67,18 L67,82 M67,18 L27,18 M67,47 L37,47"/>';
export const FLAG_FLIP = '<path d="M33,82 L33,18 M33,82 L73,82 M33,53 L63,53"/>';
export const spun = (deg, glyph = FLAG) => `<g transform="rotate(${deg} 50 50)">${glyph}</g>`;

export const vLine = '<path d="M50,18 L50,82"/>';
export const hLine = '<path d="M18,50 L82,50"/>';
export const diagUp = '<path d="M22,78 L78,22"/>';
export const diagDown = '<path d="M22,22 L78,78"/>';

// ── Filled shapes for the inductive grids ──────────────────────────────────

/**
 * Each entry draws its outline when called with no attributes, or a filled body
 * when given fill attributes — which is what lets `motif` build empty, half and
 * solid variants of any shape from one definition.
 */
export const SHAPES = {
  circle: (a = '', s = 1) => `<circle cx="50" cy="50" r="${(34 * s).toFixed(1)}" ${a}/>`,
  square: (a = '', s = 1) =>
    `<rect x="${(50 - 32 * s).toFixed(1)}" y="${(50 - 32 * s).toFixed(1)}" width="${(64 * s).toFixed(1)}" height="${(64 * s).toFixed(1)}" ${a}/>`,
  triangle: (a = '', s = 1) =>
    `<polygon points="${scalePts('50,16 84,80 16,80', s)}" ${a}/>`,
  diamond: (a = '', s = 1) => `<polygon points="${scalePts('50,14 86,50 50,86 14,50', s)}" ${a}/>`,
  hexagon: (a = '', s = 1) => `<polygon points="${hexPoints(s)}" ${a}/>`,
  pentagon: (a = '', s = 1) => `<polygon points="${pentPoints(s)}" ${a}/>`
};

function scalePts(pts, s) {
  return pts
    .split(' ')
    .map((p) => {
      const [x, y] = p.split(',').map(Number);
      return `${(50 + (x - 50) * s).toFixed(1)},${(50 + (y - 50) * s).toFixed(1)}`;
    })
    .join(' ');
}

function ring(n, r, rot) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = ((rot + (360 / n) * i) * Math.PI) / 180;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)},${(50 + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(' ');
}

const hexPoints = (s) => ring(6, 36 * s, -90);
const pentPoints = (s) => ring(5, 36 * s, -90);

/**
 * A shape with a fill treatment: 'none', 'half' (left half) or 'solid'.
 * The half fill clips a copy of the shape, then redraws the outline on top so
 * the silhouette stays crisp.
 */
export function motif(shape, fill = 'none', scale = 1) {
  const draw = SHAPES[shape];
  if (fill === 'solid') return draw(solid, scale) + draw('', scale);
  if (fill === 'half') {
    const id = nextId('half');
    return (
      `<defs><clipPath id="${id}"><rect x="0" y="0" width="50" height="100"/></clipPath></defs>` +
      draw(`${solid} clip-path="url(#${id})"`, scale) +
      draw('', scale)
    );
  }
  return draw('', scale);
}

/** `n` evenly spaced parallel lines: 'vertical', 'horizontal' or 'diagonal'. */
export function lines(n, orientation) {
  if (orientation === 'diagonal') {
    // Every line satisfies x + y = k. Over the box [17,83]² that runs 34…166,
    // so spacing k evenly inside it spreads the lines across the whole square.
    // A long segment is drawn and clipped, which avoids per-line edge maths.
    const id = nextId('diag');
    let body =
      `<defs><clipPath id="${id}"><rect x="17" y="17" width="66" height="66"/></clipPath></defs>` +
      `<g clip-path="url(#${id})">`;
    for (let i = 1; i <= n; i++) {
      const k = 34 + (132 / (n + 1)) * i;
      body += `<path d="M${(k - 120).toFixed(1)},120 L${(k + 20).toFixed(1)},-20"/>`;
    }
    return body + '</g>';
  }

  const step = 66 / (n + 1);
  let body = '';
  for (let i = 1; i <= n; i++) {
    const p = (17 + step * i).toFixed(1);
    body +=
      orientation === 'vertical'
        ? `<path d="M${p},19 L${p},81"/>`
        : `<path d="M19,${p} L81,${p}"/>`;
  }
  return body;
}
