/**
 * A blueprint entry is either a fixed count or `[min, max]` — a paper whose
 * length varies from sitting to sitting, the way the real Cloud Digital Leader
 * exam hands out somewhere between 50 and 60 questions.
 */

function blueprintMin(want) {
  return Array.isArray(want) ? want[0] : want;
}

function blueprintMax(want) {
  return Array.isArray(want) ? want[1] : want;
}

export function drawCount(want) {
  if (!Array.isArray(want)) return want;
  const [min, max] = want;
  return min + Math.floor(Math.random() * (max - min + 1));
}

/** The longest a paper can run — what capacity checks should use. */
export function modeQuestionCount(mode) {
  return Object.values(mode.blueprint).reduce((n, want) => n + blueprintMax(want), 0);
}

/** How the length reads on a card: "50" for a fixed paper, "50–60" for a range. */
export function modeQuestionLabel(mode) {
  const min = Object.values(mode.blueprint).reduce((n, want) => n + blueprintMin(want), 0);
  const max = modeQuestionCount(mode);
  return min === max ? `${max}` : `${min}–${max}`;
}

/** The same, per section, for the blueprint list on a mode card. */
export function blueprintLabel(want) {
  return Array.isArray(want) ? `${want[0]}–${want[1]}` : `${want}`;
}
