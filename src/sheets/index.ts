import type { NamedSheet } from '@/types';
import { commands } from './commands';
import { concepts } from './concepts';

/** The ACE and CDL Commands and Concepts tabs, shown after the exam’s own sheet. PCA has its own (exams/pca). */
export const GOOGLE_CLOUD_SHEETS: NamedSheet[] = [
  { id: 'commands', label: 'Commands', sheet: commands },
  { id: 'concepts', label: 'Concepts', sheet: concepts }
];
