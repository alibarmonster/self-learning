import type { NamedSheet } from '@/types';
import { commands } from './commands';
import { concepts } from './concepts';

/** Sheets shared by the Google Cloud exams, shown as tabs after each exam's own sheet. */
export const GOOGLE_CLOUD_SHEETS: NamedSheet[] = [
  { id: 'commands', label: 'Commands', sheet: commands },
  { id: 'concepts', label: 'Concepts', sheet: concepts }
];
