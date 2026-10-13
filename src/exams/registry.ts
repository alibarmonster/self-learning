/**
 * Every exam the app can prepare for, as plain data — no Svelte imports, so
 * the validator can load this outside the browser. `index.ts` attaches each exam's
 * About page for the browser.
 *
 * To add an exam (JLPT is next): create `exams/<id>/index.ts` exporting a
 * `defineExam({...})`, put its question files under `exams/<id>/questions/`,
 * write an `About.svelte` beside it, and list it in both files. An exam may
 * start with only a cheat sheet — leave `modes` empty and skip the About page,
 * as `ace` does, and the picker and router treat it as study-only until a
 * question bank and presets arrive.
 */
import type { Exam } from '@/types';
import { apple } from './apple';
import { cdl } from './cdl';
import { ace } from './ace';

export const EXAM_DATA: Exam[] = [apple, cdl, ace];
