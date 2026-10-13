/**
 * Sanity checks for every exam's question bank. Run with: node scripts/validate-bank.js
 * Catches the failure modes that are easy to introduce by hand — an answer
 * index pointing past the end of the options, duplicate ids, duplicate option
 * text, or a preset asking for more questions than a section actually holds.
 */
import { EXAM_DATA } from '../src/lib/exams/data.js';
import { modeQuestionCount, modeQuestionLabel } from '../src/lib/bank.js';

const problems = [];
let total = 0;

/**
 * The figures are built by string concatenation, so the two ways they can break
 * silently are an unbalanced tag and a coordinate that computed to NaN or
 * undefined. Both render as an invisible or mangled diagram rather than an
 * error, so check for them here.
 */
function svgProblem(svg) {
  if (/NaN|undefined|Infinity/.test(svg)) return 'contains a NaN/undefined coordinate';
  const stack = [];
  const tag = /<(\/?)([a-zA-Z][\w:-]*)([^>]*?)(\/?)>/g;
  let m;
  while ((m = tag.exec(svg)) !== null) {
    const [, closing, name, attrs, selfClosing] = m;
    if (closing) {
      if (stack.pop() !== name) return `unbalanced </${name}>`;
    } else if (!selfClosing && !attrs.trimEnd().endsWith('/')) {
      stack.push(name);
    }
  }
  if (stack.length) return `unclosed <${stack[stack.length - 1]}>`;
  return null;
}

for (const exam of EXAM_DATA) {
  const seenIds = new Set();
  for (const section of exam.sections) {
  for (const q of section.questions) {
    total += 1;
    const where = `${exam.id}/${section.id}/${q.id}`;

    if (seenIds.has(q.id)) problems.push(`${where}: duplicate id`);
    seenIds.add(q.id);

    if (!q.prompt?.trim()) problems.push(`${where}: empty prompt`);
    if (!q.explanation?.trim()) problems.push(`${where}: missing explanation`);
    if (!q.topic?.trim()) problems.push(`${where}: missing topic`);
    if (!['easy', 'medium', 'hard'].includes(q.difficulty))
      problems.push(`${where}: bad difficulty "${q.difficulty}"`);

    if (!Array.isArray(q.options) || q.options.length < 2)
      problems.push(`${where}: needs at least 2 options`);
    else {
      const inRange = (a) => Number.isInteger(a) && a >= 0 && a < q.options.length;
      if (Array.isArray(q.answer)) {
        // Multiple select: two or more distinct correct options, never all of them.
        if (q.answer.length < 2) problems.push(`${where}: multi-select answer needs 2+ indices`);
        if (q.answer.length >= q.options.length)
          problems.push(`${where}: multi-select answer cannot include every option`);
        if (!q.answer.every(inRange)) problems.push(`${where}: answer index out of range`);
        if (new Set(q.answer).size !== q.answer.length)
          problems.push(`${where}: duplicate answer index`);
        if (q.optionFigures) problems.push(`${where}: multi-select with picture options is unsupported`);
      } else if (!inRange(q.answer)) {
        problems.push(`${where}: answer index ${q.answer} is out of range`);
      }
      if (new Set(q.options.map((o) => o.trim())).size !== q.options.length)
        problems.push(`${where}: duplicate option text`);
      if (q.options.some((o) => typeof o !== 'string' || !o.trim()))
        problems.push(`${where}: blank option`);
    }

    if (q.code && !q.lang) problems.push(`${where}: has code but no lang label`);
    if (q.tip !== undefined && (typeof q.tip !== 'string' || !q.tip.trim()))
      problems.push(`${where}: tip must be a non-empty string when present`);

    const isSvg = (s) => typeof s === 'string' && s.trim().startsWith('<svg');
    if (q.figure !== undefined) {
      if (!isSvg(q.figure)) problems.push(`${where}: figure is not an SVG string`);
      else {
        const bad = svgProblem(q.figure);
        if (bad) problems.push(`${where}: figure ${bad}`);
      }
    }
    if (q.optionFigures !== undefined) {
      if (!Array.isArray(q.optionFigures) || q.optionFigures.length !== q.options.length)
        problems.push(`${where}: optionFigures must match the number of options`);
      else if (!q.optionFigures.every(isSvg))
        problems.push(`${where}: every optionFigure must be an SVG string`);
      else if (new Set(q.optionFigures).size !== q.optionFigures.length)
        problems.push(`${where}: two option figures are identical`);
      else
        q.optionFigures.forEach((f, k) => {
          const bad = svgProblem(f);
          if (bad) problems.push(`${where}: option ${k} figure ${bad}`);
        });
    }
  }
  }
}

/**
 * Two questions on the same topic that ask nearly the same thing make a drill
 * repeat itself. Questions are compared as sets of word pairs over the prompt,
 * the code and the options together, because that is where a question actually
 * lives: "Which one does not belong?" is the same prompt in a dozen questions,
 * and the struct/class pair in the OOP section is two different questions
 * sharing a prompt, a set of options and everything but the code.
 *
 * Word pairs rather than single words, because whole families here are built
 * from one sentence pattern — seating clues, clock angles, series prompts — and
 * single words cannot tell a family apart from a repeat.
 */
function bigrams(question) {
  const words = [question.prompt, question.code ?? '', question.options.join(' ')]
    .join(' ')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
  return new Set(words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`));
}

function similarity(a, b) {
  let shared = 0;
  for (const w of a) if (b.has(w)) shared += 1;
  return shared / (a.size + b.size - shared);
}

const warnings = [];
const byTopic = new Map();
for (const exam of EXAM_DATA) {
  for (const section of exam.sections) {
    for (const q of section.questions) {
      const key = `${exam.id}/${section.id}:${q.topic}`;
      byTopic.set(key, [...(byTopic.get(key) ?? []), q]);
    }
  }
}
for (const [key, questions] of byTopic) {
  const grams = questions.map(bigrams);
  for (let i = 0; i < questions.length; i++) {
    // A picture question asks its question in the figure, not in the text, so
    // comparing words would flag every one of them against all the rest.
    if (questions[i].figure || questions[i].optionFigures) continue;
    for (let j = i + 1; j < questions.length; j++) {
      if (questions[j].figure || questions[j].optionFigures) continue;
      if (grams[i].size < 8 || grams[j].size < 8) continue;
      const score = similarity(grams[i], grams[j]);
      if (score >= 0.68)
        warnings.push(
          `${key}: ${questions[i].id} and ${questions[j].id} are ${Math.round(score * 100)}% the same question`
        );
    }
  }
}

for (const exam of EXAM_DATA) {
  for (const mode of exam.modes) {
    for (const [sectionId, want] of Object.entries(mode.blueprint)) {
      const section = exam.sectionById[sectionId];
      // A blueprint entry is a count, or [min, max] for a variable-length paper.
      const most = Array.isArray(want) ? want[1] : want;
      if (!section) {
        problems.push(`${exam.id}/mode ${mode.id}: unknown section "${sectionId}"`);
      } else if (Array.isArray(want) && (want.length !== 2 || want[0] > want[1])) {
        problems.push(`${exam.id}/mode ${mode.id}: ${sectionId} range must be [min, max]`);
      } else if (most > section.questions.length) {
        problems.push(
          `${exam.id}/mode ${mode.id}: wants ${most} from ${sectionId} but only ${section.questions.length} exist`
        );
      }
    }
  }
  // A cheat-sheet-only exam has no presets yet; it just has to say so.
  if (exam.studyOnly) {
    if (!exam.cheatsheet)
      problems.push(`${exam.id}: has no modes and no cheat sheet — nothing to show`);
  } else if (!exam.modeById[exam.fullModeId]) {
    problems.push(`${exam.id}: fullModeId "${exam.fullModeId}" is not a mode`);
  }

  // A pinned drill whose topic was renamed would silently vanish from the home
  // page, so check the ids still resolve and still hold enough to be a drill.
  for (const id of exam.focusTopicIds) {
    const entry = exam.topicById[id];
    if (!entry) problems.push(`${exam.id}/focus topic "${id}": no question carries that topic`);
    else if (entry.count < exam.drillMin)
      problems.push(`${exam.id}/focus topic "${id}": only ${entry.count} questions — too thin for a drill`);
  }

  console.log(`\n${exam.name} (${exam.id})`);
  if (exam.studyOnly) {
    console.log(`  cheat sheet only — ${exam.cheatsheet.groups.length} groups, no question bank yet`);
    for (const section of exam.sections) {
      console.log(`  ${section.id.padEnd(16)} ${String(section.weight ?? '?').padStart(5)}% of the paper`);
    }
    continue;
  }
  for (const section of exam.sections) {
    console.log(`  ${section.id.padEnd(16)} ${String(section.questions.length).padStart(3)} questions`);
  }
  for (const section of exam.sections) {
    const drillable = exam.drillTopics.filter((t) => t.section.id === section.id);
    const all = exam.topics.filter((t) => t.section.id === section.id);
    console.log(
      `  drills ${section.id.padEnd(15)} ${String(drillable.length).padStart(3)} of ${all.length} topics have ${exam.drillMin}+ questions`
    );
  }
  for (const mode of exam.modes) {
    console.log(`  mode ${mode.id.padEnd(11)} ${modeQuestionLabel(mode).padStart(6)} questions / ${mode.minutes} min`);
  }
  const multi = exam.sections.flatMap((s) => s.questions).filter((q) => Array.isArray(q.answer)).length;
  console.log(`  ${'total'.padEnd(16)} ${String(exam.bankSize).padStart(3)} questions (${multi} multiple select)`);
}
console.log(`\n  all exams: ${total} questions`);

// A key that is much longer than every distractor gives the answer away to a
// sitter who never reads the question. Report sentence-style options where the
// correct one is more than a quarter longer than the longest wrong one.
for (const exam of EXAM_DATA) {
  for (const section of exam.sections) {
    for (const q of section.questions) {
      if (q.optionFigures || q.verbatim) continue;
      const lens = q.options.map((o) => o.length);
      if (Math.max(...lens) < 40) continue; // product names and short labels
      const keys = Array.isArray(q.answer) ? q.answer : [q.answer];
      const wrongMax = Math.max(...lens.filter((_, i) => !keys.includes(i)));
      const keyMin = Math.min(...keys.map((i) => lens[i]));
      if (keyMin > wrongMax * 1.25)
        warnings.push(
          `${exam.id}/${q.id}: the correct option is ${Math.round((keyMin / wrongMax - 1) * 100)}% longer than every distractor — give the answer away`
        );
    }
  }
}

// Near-duplicates are a judgement call, not a defect — report, do not fail.
if (warnings.length) {
  console.warn(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ! ${w}`);
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`  ✗ ${p}`);
  process.exit(1);
}
console.log('\n✓ question bank is valid');
