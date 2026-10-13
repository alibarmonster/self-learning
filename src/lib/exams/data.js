/**
 * Every exam the app can prepare for, as plain data — no Svelte imports, so
 * the validator can load this under Node. `index.js` attaches each exam's
 * About page for the browser.
 *
 * To add an exam (JLPT is next): create `exams/<id>/index.js` exporting a
 * `defineExam({...})`, put its question files under `exams/<id>/questions/`,
 * write an `About.svelte` beside it, and list it in both files. An exam may
 * start with only a cheat sheet — leave `modes` empty and skip the About page,
 * as `ace` does, and the picker and router treat it as study-only until a
 * question bank and presets arrive.
 */
import { apple } from './apple/index.js';
import { cdl } from './cdl/index.js';
import { ace } from './ace/index.js';

export const EXAM_DATA = [apple, cdl, ace];
