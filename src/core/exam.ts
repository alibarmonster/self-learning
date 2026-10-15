/**
 * Exam definitions. An exam (see `src/exams`) declares its parts, sections and
 * modes; `defineExam` derives everything the app needs from that — lookup
 * tables, the topic list, which topics are thick enough to drill.
 */
import type { Difficulty, Exam, ExamDefinition, Topic } from '@/types';

/** How many questions a topic needs before it is worth sitting on its own. */
export const DEFAULT_DRILL_MIN = 8;

/** How many questions a topic card draws — a short, repeatable sitting. */
export const DEFAULT_DRILL_SIZE = 10;

/**
 * Fills in the derived tables of an exam definition. Everything the views need
 * to look up by id lives here, so an exam file only has to declare its data.
 */
export function defineExam(def: ExamDefinition): Exam {
  const parts = def.parts ?? [];
  // An exam may arrive with only a cheat sheet — its bank and presets come
  // later — so both lists default to empty and everything derived copes with
  // that. `studyOnly` is what the views check before offering a paper.
  const sections = def.sections ?? [];
  const modes = def.modes ?? [];
  const sets = def.sets ?? [];
  const sheets = [
    ...(def.cheatsheet ? [{ id: 'exam', label: 'Cheat sheet', sheet: def.cheatsheet }] : []),
    ...(def.extraSheets ?? [])
  ];
  const drillMin = def.drillMin ?? DEFAULT_DRILL_MIN;
  const drillSize = def.drillSize ?? DEFAULT_DRILL_SIZE;

  const topics: Topic[] = sections.flatMap((section) => {
    const counts = new Map<string, Record<'count' | Difficulty, number>>();
    for (const q of section.questions) {
      const entry = counts.get(q.topic) ?? { count: 0, easy: 0, medium: 0, hard: 0 };
      entry.count += 1;
      entry[q.difficulty] += 1;
      counts.set(q.topic, entry);
    }
    return [...counts].map(([topic, entry]) => ({
      id: `${section.id}:${topic}`,
      section,
      topic,
      ...entry
    }));
  });

  const drillTopics = sections.flatMap((section) =>
    topics
      .filter((t) => t.section.id === section.id && t.count >= drillMin)
      .sort((a, b) => b.count - a.count)
  );

  return {
    ...def,
    parts,
    sections,
    modes,
    sets,
    setById: Object.fromEntries(sets.map((s) => [s.id, s])),
    sheets,
    sheetById: Object.fromEntries(sheets.map((s) => [s.id, s])),
    drillMin,
    drillSize,
    partById: Object.fromEntries(parts.map((p) => [p.id, p])),
    sectionById: Object.fromEntries(sections.map((s) => [s.id, s])),
    modeById: Object.fromEntries(modes.map((m) => [m.id, m])),
    bankSize: sections.reduce((n, s) => n + s.questions.length, 0),
    studyOnly: modes.length === 0,
    topics,
    topicById: Object.fromEntries(topics.map((t) => [t.id, t])),
    drillTopics,
    focusTopicIds: def.focusTopicIds ?? []
  };
}
