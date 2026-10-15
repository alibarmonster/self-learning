import type { NamedSheet } from '@/types';
import { commands } from './commands';

/** Sheets shared by the Google Cloud exams, shown as tabs after each exam's own sheet. */
export const GOOGLE_CLOUD_SHEETS: NamedSheet[] = [{ id: 'commands', label: 'Commands', sheet: commands }];
