/**
 * The try-outs for the six modules of the Associate Cloud Engineer course
 * syllabus (ACE-2-01). Each question carries the exam-guide section its
 * decision belongs to, so it joins that section's bank (and its presets and
 * topic drills) as well as its module's fixed try-out sets in ../sets.ts.
 */
import type { Question } from '@/types';

export type SectionId = 'setup' | 'planning' | 'operating' | 'access';

export interface ModuleQuestion extends Question {
  section: SectionId;
}

/** The questions of one section, for the exam definition. */
export const inSection = (questions: ModuleQuestion[], section: SectionId): Question[] =>
  questions.filter((q) => q.section === section);
