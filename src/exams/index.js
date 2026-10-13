import { EXAM_DATA } from './registry.js';
import AppleAbout from './apple/About.svelte';
import CdlAbout from './cdl/About.svelte';

/** Exams with no About page yet simply do not appear here. */
const ABOUT = { apple: AppleAbout, cdl: CdlAbout };

/** The exams with their About pages attached, in picker order. */
export const EXAMS = EXAM_DATA.map((exam) => ({ ...exam, about: ABOUT[exam.id] }));

export const EXAM_BY_ID = Object.fromEntries(EXAMS.map((e) => [e.id, e]));
