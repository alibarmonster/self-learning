/**
 * Answer checking. A question's `answer` is either an index into `options`
 * (single choice) or a sorted array of indices (multiple select, "choose two").
 * A sitter's answer follows the same shape; `isCorrect` compares the two.
 */

export function isMulti(question) {
  return Array.isArray(question.answer);
}

/** How many options a question expects the sitter to pick. */
export function pickCount(question) {
  return isMulti(question) ? question.answer.length : 1;
}

export function isCorrect(question, given) {
  if (given === null || given === undefined) return false;
  if (!isMulti(question)) return given === question.answer;
  if (!Array.isArray(given) || given.length !== question.answer.length) return false;
  const want = new Set(question.answer);
  return given.every((i) => want.has(i));
}

/** True when option `i` is one of the correct answers. */
export function isAnswerOption(question, i) {
  return isMulti(question) ? question.answer.includes(i) : question.answer === i;
}

/** True when option `i` is among what the sitter chose. */
export function isChosen(given, i) {
  return Array.isArray(given) ? given.includes(i) : given === i;
}
