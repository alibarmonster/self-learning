/**
 * Lab progress and saved work, in localStorage. Shared by every exam that
 * offers the lab: the scenarios are the same Google Cloud, whichever exam
 * you are preparing for.
 */
import { read, remove, write } from '@/state/storage';
import type { LabMode } from './types';

const DONE_KEY = 'ep-lab-done-v1';
const workKey = (mode: LabMode, id: string) => `ep-lab-work-v1:${mode}:${id}`;

export type DoneMap = Record<string, number>;

export function doneMap(): DoneMap {
  return read<DoneMap>(DONE_KEY, {});
}

export function markDone(mode: LabMode, id: string) {
  const m = doneMap();
  if (m[`${mode}/${id}`]) return;
  m[`${mode}/${id}`] = Date.now();
  write(DONE_KEY, m);
}

export function loadWork<T>(mode: LabMode, id: string): T | null {
  return read<T | null>(workKey(mode, id), null);
}

export function saveWork(mode: LabMode, id: string, value: unknown) {
  write(workKey(mode, id), value);
}

export function clearWork(mode: LabMode, id: string) {
  remove(workKey(mode, id));
}
