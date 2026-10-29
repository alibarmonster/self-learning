/**
 * Fixed practice sets for Associate Cloud Engineer: 13 sets of 50 and a final set of 16,
 * no question in two sets, every section spread across them. Written by
 * scripts/tools/make-sets.ts (seed 2026); this file is now the source, so the
 * sets stay the same when the bank is edited.
 *
 * The module try-outs come first: the six modules of the course syllabus (ACE-2-01),
 * 100 questions each in questions/module1-6.ts, dealt into five sets of 20 timed at
 * 24 minutes (the tryout's pace). Then the four Tryout sets: 200 questions written for the course modules
 * (questions/tryout*.ts), 50 per set, every set mixing all four sections, on the
 * tryout's own clock of 60 minutes. Tryout 1 is questions/tryout.ts; Tryout 2–4
 * deal the other 150 out section by section, so each gets an even share.
 */
import type { PaperSet } from '@/types';

export const sets: PaperSet[] = [
  {
    id: 'm1-set-1',
    name: 'M1 · Set 1',
    group: 'Module 1 · Cloud Foundations & Environment Setup',
    minutes: 24,
    questionIds: ['ace-m1-001', 'ace-m1-006', 'ace-m1-011', 'ace-m1-016', 'ace-m1-021', 'ace-m1-026', 'ace-m1-031', 'ace-m1-036', 'ace-m1-041', 'ace-m1-046', 'ace-m1-051', 'ace-m1-056', 'ace-m1-061', 'ace-m1-066', 'ace-m1-071', 'ace-m1-076', 'ace-m1-081', 'ace-m1-086', 'ace-m1-091', 'ace-m1-096']
  },
  {
    id: 'm1-set-2',
    name: 'M1 · Set 2',
    group: 'Module 1 · Cloud Foundations & Environment Setup',
    minutes: 24,
    questionIds: ['ace-m1-002', 'ace-m1-007', 'ace-m1-012', 'ace-m1-017', 'ace-m1-022', 'ace-m1-027', 'ace-m1-032', 'ace-m1-037', 'ace-m1-042', 'ace-m1-047', 'ace-m1-052', 'ace-m1-057', 'ace-m1-062', 'ace-m1-067', 'ace-m1-072', 'ace-m1-077', 'ace-m1-082', 'ace-m1-087', 'ace-m1-092', 'ace-m1-097']
  },
  {
    id: 'm1-set-3',
    name: 'M1 · Set 3',
    group: 'Module 1 · Cloud Foundations & Environment Setup',
    minutes: 24,
    questionIds: ['ace-m1-003', 'ace-m1-008', 'ace-m1-013', 'ace-m1-018', 'ace-m1-023', 'ace-m1-028', 'ace-m1-033', 'ace-m1-038', 'ace-m1-043', 'ace-m1-048', 'ace-m1-053', 'ace-m1-058', 'ace-m1-063', 'ace-m1-068', 'ace-m1-073', 'ace-m1-078', 'ace-m1-083', 'ace-m1-088', 'ace-m1-093', 'ace-m1-098']
  },
  {
    id: 'm1-set-4',
    name: 'M1 · Set 4',
    group: 'Module 1 · Cloud Foundations & Environment Setup',
    minutes: 24,
    questionIds: ['ace-m1-004', 'ace-m1-009', 'ace-m1-014', 'ace-m1-019', 'ace-m1-024', 'ace-m1-029', 'ace-m1-034', 'ace-m1-039', 'ace-m1-044', 'ace-m1-049', 'ace-m1-054', 'ace-m1-059', 'ace-m1-064', 'ace-m1-069', 'ace-m1-074', 'ace-m1-079', 'ace-m1-084', 'ace-m1-089', 'ace-m1-094', 'ace-m1-099']
  },
  {
    id: 'm1-set-5',
    name: 'M1 · Set 5',
    group: 'Module 1 · Cloud Foundations & Environment Setup',
    minutes: 24,
    questionIds: ['ace-m1-005', 'ace-m1-010', 'ace-m1-015', 'ace-m1-020', 'ace-m1-025', 'ace-m1-030', 'ace-m1-035', 'ace-m1-040', 'ace-m1-045', 'ace-m1-050', 'ace-m1-055', 'ace-m1-060', 'ace-m1-065', 'ace-m1-070', 'ace-m1-075', 'ace-m1-080', 'ace-m1-085', 'ace-m1-090', 'ace-m1-095', 'ace-m1-100']
  },
  {
    id: 'm2-set-1',
    name: 'M2 · Set 1',
    group: 'Module 2 · Compute Services',
    minutes: 24,
    questionIds: ['ace-m2-001', 'ace-m2-006', 'ace-m2-011', 'ace-m2-016', 'ace-m2-021', 'ace-m2-026', 'ace-m2-031', 'ace-m2-036', 'ace-m2-041', 'ace-m2-046', 'ace-m2-051', 'ace-m2-056', 'ace-m2-061', 'ace-m2-066', 'ace-m2-071', 'ace-m2-076', 'ace-m2-081', 'ace-m2-086', 'ace-m2-091', 'ace-m2-096']
  },
  {
    id: 'm2-set-2',
    name: 'M2 · Set 2',
    group: 'Module 2 · Compute Services',
    minutes: 24,
    questionIds: ['ace-m2-002', 'ace-m2-007', 'ace-m2-012', 'ace-m2-017', 'ace-m2-022', 'ace-m2-027', 'ace-m2-032', 'ace-m2-037', 'ace-m2-042', 'ace-m2-047', 'ace-m2-052', 'ace-m2-057', 'ace-m2-062', 'ace-m2-067', 'ace-m2-072', 'ace-m2-077', 'ace-m2-082', 'ace-m2-087', 'ace-m2-092', 'ace-m2-097']
  },
  {
    id: 'm2-set-3',
    name: 'M2 · Set 3',
    group: 'Module 2 · Compute Services',
    minutes: 24,
    questionIds: ['ace-m2-003', 'ace-m2-008', 'ace-m2-013', 'ace-m2-018', 'ace-m2-023', 'ace-m2-028', 'ace-m2-033', 'ace-m2-038', 'ace-m2-043', 'ace-m2-048', 'ace-m2-053', 'ace-m2-058', 'ace-m2-063', 'ace-m2-068', 'ace-m2-073', 'ace-m2-078', 'ace-m2-083', 'ace-m2-088', 'ace-m2-093', 'ace-m2-098']
  },
  {
    id: 'm2-set-4',
    name: 'M2 · Set 4',
    group: 'Module 2 · Compute Services',
    minutes: 24,
    questionIds: ['ace-m2-004', 'ace-m2-009', 'ace-m2-014', 'ace-m2-019', 'ace-m2-024', 'ace-m2-029', 'ace-m2-034', 'ace-m2-039', 'ace-m2-044', 'ace-m2-049', 'ace-m2-054', 'ace-m2-059', 'ace-m2-064', 'ace-m2-069', 'ace-m2-074', 'ace-m2-079', 'ace-m2-084', 'ace-m2-089', 'ace-m2-094', 'ace-m2-099']
  },
  {
    id: 'm2-set-5',
    name: 'M2 · Set 5',
    group: 'Module 2 · Compute Services',
    minutes: 24,
    questionIds: ['ace-m2-005', 'ace-m2-010', 'ace-m2-015', 'ace-m2-020', 'ace-m2-025', 'ace-m2-030', 'ace-m2-035', 'ace-m2-040', 'ace-m2-045', 'ace-m2-050', 'ace-m2-055', 'ace-m2-060', 'ace-m2-065', 'ace-m2-070', 'ace-m2-075', 'ace-m2-080', 'ace-m2-085', 'ace-m2-090', 'ace-m2-095', 'ace-m2-100']
  },
  {
    id: 'm3-set-1',
    name: 'M3 · Set 1',
    group: 'Module 3 · Storage & Data Solutions',
    minutes: 24,
    questionIds: ['ace-m3-001', 'ace-m3-006', 'ace-m3-011', 'ace-m3-016', 'ace-m3-021', 'ace-m3-026', 'ace-m3-031', 'ace-m3-036', 'ace-m3-041', 'ace-m3-046', 'ace-m3-051', 'ace-m3-056', 'ace-m3-061', 'ace-m3-066', 'ace-m3-071', 'ace-m3-076', 'ace-m3-081', 'ace-m3-086', 'ace-m3-091', 'ace-m3-096']
  },
  {
    id: 'm3-set-2',
    name: 'M3 · Set 2',
    group: 'Module 3 · Storage & Data Solutions',
    minutes: 24,
    questionIds: ['ace-m3-002', 'ace-m3-007', 'ace-m3-012', 'ace-m3-017', 'ace-m3-022', 'ace-m3-027', 'ace-m3-032', 'ace-m3-037', 'ace-m3-042', 'ace-m3-047', 'ace-m3-052', 'ace-m3-057', 'ace-m3-062', 'ace-m3-067', 'ace-m3-072', 'ace-m3-077', 'ace-m3-082', 'ace-m3-087', 'ace-m3-092', 'ace-m3-097']
  },
  {
    id: 'm3-set-3',
    name: 'M3 · Set 3',
    group: 'Module 3 · Storage & Data Solutions',
    minutes: 24,
    questionIds: ['ace-m3-003', 'ace-m3-008', 'ace-m3-013', 'ace-m3-018', 'ace-m3-023', 'ace-m3-028', 'ace-m3-033', 'ace-m3-038', 'ace-m3-043', 'ace-m3-048', 'ace-m3-053', 'ace-m3-058', 'ace-m3-063', 'ace-m3-068', 'ace-m3-073', 'ace-m3-078', 'ace-m3-083', 'ace-m3-088', 'ace-m3-093', 'ace-m3-098']
  },
  {
    id: 'm3-set-4',
    name: 'M3 · Set 4',
    group: 'Module 3 · Storage & Data Solutions',
    minutes: 24,
    questionIds: ['ace-m3-004', 'ace-m3-009', 'ace-m3-014', 'ace-m3-019', 'ace-m3-024', 'ace-m3-029', 'ace-m3-034', 'ace-m3-039', 'ace-m3-044', 'ace-m3-049', 'ace-m3-054', 'ace-m3-059', 'ace-m3-064', 'ace-m3-069', 'ace-m3-074', 'ace-m3-079', 'ace-m3-084', 'ace-m3-089', 'ace-m3-094', 'ace-m3-099']
  },
  {
    id: 'm3-set-5',
    name: 'M3 · Set 5',
    group: 'Module 3 · Storage & Data Solutions',
    minutes: 24,
    questionIds: ['ace-m3-005', 'ace-m3-010', 'ace-m3-015', 'ace-m3-020', 'ace-m3-025', 'ace-m3-030', 'ace-m3-035', 'ace-m3-040', 'ace-m3-045', 'ace-m3-050', 'ace-m3-055', 'ace-m3-060', 'ace-m3-065', 'ace-m3-070', 'ace-m3-075', 'ace-m3-080', 'ace-m3-085', 'ace-m3-090', 'ace-m3-095', 'ace-m3-100']
  },
  {
    id: 'm4-set-1',
    name: 'M4 · Set 1',
    group: 'Module 4 · Cloud Networking',
    minutes: 24,
    questionIds: ['ace-m4-001', 'ace-m4-006', 'ace-m4-011', 'ace-m4-016', 'ace-m4-021', 'ace-m4-026', 'ace-m4-031', 'ace-m4-036', 'ace-m4-041', 'ace-m4-046', 'ace-m4-051', 'ace-m4-056', 'ace-m4-061', 'ace-m4-066', 'ace-m4-071', 'ace-m4-076', 'ace-m4-081', 'ace-m4-086', 'ace-m4-091', 'ace-m4-096']
  },
  {
    id: 'm4-set-2',
    name: 'M4 · Set 2',
    group: 'Module 4 · Cloud Networking',
    minutes: 24,
    questionIds: ['ace-m4-002', 'ace-m4-007', 'ace-m4-012', 'ace-m4-017', 'ace-m4-022', 'ace-m4-027', 'ace-m4-032', 'ace-m4-037', 'ace-m4-042', 'ace-m4-047', 'ace-m4-052', 'ace-m4-057', 'ace-m4-062', 'ace-m4-067', 'ace-m4-072', 'ace-m4-077', 'ace-m4-082', 'ace-m4-087', 'ace-m4-092', 'ace-m4-097']
  },
  {
    id: 'm4-set-3',
    name: 'M4 · Set 3',
    group: 'Module 4 · Cloud Networking',
    minutes: 24,
    questionIds: ['ace-m4-003', 'ace-m4-008', 'ace-m4-013', 'ace-m4-018', 'ace-m4-023', 'ace-m4-028', 'ace-m4-033', 'ace-m4-038', 'ace-m4-043', 'ace-m4-048', 'ace-m4-053', 'ace-m4-058', 'ace-m4-063', 'ace-m4-068', 'ace-m4-073', 'ace-m4-078', 'ace-m4-083', 'ace-m4-088', 'ace-m4-093', 'ace-m4-098']
  },
  {
    id: 'm4-set-4',
    name: 'M4 · Set 4',
    group: 'Module 4 · Cloud Networking',
    minutes: 24,
    questionIds: ['ace-m4-004', 'ace-m4-009', 'ace-m4-014', 'ace-m4-019', 'ace-m4-024', 'ace-m4-029', 'ace-m4-034', 'ace-m4-039', 'ace-m4-044', 'ace-m4-049', 'ace-m4-054', 'ace-m4-059', 'ace-m4-064', 'ace-m4-069', 'ace-m4-074', 'ace-m4-079', 'ace-m4-084', 'ace-m4-089', 'ace-m4-094', 'ace-m4-099']
  },
  {
    id: 'm4-set-5',
    name: 'M4 · Set 5',
    group: 'Module 4 · Cloud Networking',
    minutes: 24,
    questionIds: ['ace-m4-005', 'ace-m4-010', 'ace-m4-015', 'ace-m4-020', 'ace-m4-025', 'ace-m4-030', 'ace-m4-035', 'ace-m4-040', 'ace-m4-045', 'ace-m4-050', 'ace-m4-055', 'ace-m4-060', 'ace-m4-065', 'ace-m4-070', 'ace-m4-075', 'ace-m4-080', 'ace-m4-085', 'ace-m4-090', 'ace-m4-095', 'ace-m4-100']
  },
  {
    id: 'm5-set-1',
    name: 'M5 · Set 1',
    group: 'Module 5 · Operations, Observability & IaC',
    minutes: 24,
    questionIds: ['ace-m5-001', 'ace-m5-006', 'ace-m5-011', 'ace-m5-016', 'ace-m5-021', 'ace-m5-026', 'ace-m5-031', 'ace-m5-036', 'ace-m5-041', 'ace-m5-046', 'ace-m5-051', 'ace-m5-056', 'ace-m5-061', 'ace-m5-066', 'ace-m5-071', 'ace-m5-076', 'ace-m5-081', 'ace-m5-086', 'ace-m5-091', 'ace-m5-096']
  },
  {
    id: 'm5-set-2',
    name: 'M5 · Set 2',
    group: 'Module 5 · Operations, Observability & IaC',
    minutes: 24,
    questionIds: ['ace-m5-002', 'ace-m5-007', 'ace-m5-012', 'ace-m5-017', 'ace-m5-022', 'ace-m5-027', 'ace-m5-032', 'ace-m5-037', 'ace-m5-042', 'ace-m5-047', 'ace-m5-052', 'ace-m5-057', 'ace-m5-062', 'ace-m5-067', 'ace-m5-072', 'ace-m5-077', 'ace-m5-082', 'ace-m5-087', 'ace-m5-092', 'ace-m5-097']
  },
  {
    id: 'm5-set-3',
    name: 'M5 · Set 3',
    group: 'Module 5 · Operations, Observability & IaC',
    minutes: 24,
    questionIds: ['ace-m5-003', 'ace-m5-008', 'ace-m5-013', 'ace-m5-018', 'ace-m5-023', 'ace-m5-028', 'ace-m5-033', 'ace-m5-038', 'ace-m5-043', 'ace-m5-048', 'ace-m5-053', 'ace-m5-058', 'ace-m5-063', 'ace-m5-068', 'ace-m5-073', 'ace-m5-078', 'ace-m5-083', 'ace-m5-088', 'ace-m5-093', 'ace-m5-098']
  },
  {
    id: 'm5-set-4',
    name: 'M5 · Set 4',
    group: 'Module 5 · Operations, Observability & IaC',
    minutes: 24,
    questionIds: ['ace-m5-004', 'ace-m5-009', 'ace-m5-014', 'ace-m5-019', 'ace-m5-024', 'ace-m5-029', 'ace-m5-034', 'ace-m5-039', 'ace-m5-044', 'ace-m5-049', 'ace-m5-054', 'ace-m5-059', 'ace-m5-064', 'ace-m5-069', 'ace-m5-074', 'ace-m5-079', 'ace-m5-084', 'ace-m5-089', 'ace-m5-094', 'ace-m5-099']
  },
  {
    id: 'm5-set-5',
    name: 'M5 · Set 5',
    group: 'Module 5 · Operations, Observability & IaC',
    minutes: 24,
    questionIds: ['ace-m5-005', 'ace-m5-010', 'ace-m5-015', 'ace-m5-020', 'ace-m5-025', 'ace-m5-030', 'ace-m5-035', 'ace-m5-040', 'ace-m5-045', 'ace-m5-050', 'ace-m5-055', 'ace-m5-060', 'ace-m5-065', 'ace-m5-070', 'ace-m5-075', 'ace-m5-080', 'ace-m5-085', 'ace-m5-090', 'ace-m5-095', 'ace-m5-100']
  },
  {
    id: 'm6-set-1',
    name: 'M6 · Set 1',
    group: 'Module 6 · Security & Full-Blueprint Mini Mock',
    minutes: 24,
    questionIds: ['ace-m6-001', 'ace-m6-006', 'ace-m6-011', 'ace-m6-016', 'ace-m6-021', 'ace-m6-026', 'ace-m6-031', 'ace-m6-036', 'ace-m6-041', 'ace-m6-046', 'ace-m6-051', 'ace-m6-056', 'ace-m6-061', 'ace-m6-066', 'ace-m6-071', 'ace-m6-076', 'ace-m6-081', 'ace-m6-086', 'ace-m6-091', 'ace-m6-096']
  },
  {
    id: 'm6-set-2',
    name: 'M6 · Set 2',
    group: 'Module 6 · Security & Full-Blueprint Mini Mock',
    minutes: 24,
    questionIds: ['ace-m6-002', 'ace-m6-007', 'ace-m6-012', 'ace-m6-017', 'ace-m6-022', 'ace-m6-027', 'ace-m6-032', 'ace-m6-037', 'ace-m6-042', 'ace-m6-047', 'ace-m6-052', 'ace-m6-057', 'ace-m6-062', 'ace-m6-067', 'ace-m6-072', 'ace-m6-077', 'ace-m6-082', 'ace-m6-087', 'ace-m6-092', 'ace-m6-097']
  },
  {
    id: 'm6-set-3',
    name: 'M6 · Set 3',
    group: 'Module 6 · Security & Full-Blueprint Mini Mock',
    minutes: 24,
    questionIds: ['ace-m6-003', 'ace-m6-008', 'ace-m6-013', 'ace-m6-018', 'ace-m6-023', 'ace-m6-028', 'ace-m6-033', 'ace-m6-038', 'ace-m6-043', 'ace-m6-048', 'ace-m6-053', 'ace-m6-058', 'ace-m6-063', 'ace-m6-068', 'ace-m6-073', 'ace-m6-078', 'ace-m6-083', 'ace-m6-088', 'ace-m6-093', 'ace-m6-098']
  },
  {
    id: 'm6-set-4',
    name: 'M6 · Set 4',
    group: 'Module 6 · Security & Full-Blueprint Mini Mock',
    minutes: 24,
    questionIds: ['ace-m6-004', 'ace-m6-009', 'ace-m6-014', 'ace-m6-019', 'ace-m6-024', 'ace-m6-029', 'ace-m6-034', 'ace-m6-039', 'ace-m6-044', 'ace-m6-049', 'ace-m6-054', 'ace-m6-059', 'ace-m6-064', 'ace-m6-069', 'ace-m6-074', 'ace-m6-079', 'ace-m6-084', 'ace-m6-089', 'ace-m6-094', 'ace-m6-099']
  },
  {
    id: 'm6-set-5',
    name: 'M6 · Set 5',
    group: 'Module 6 · Security & Full-Blueprint Mini Mock',
    minutes: 24,
    questionIds: ['ace-m6-005', 'ace-m6-010', 'ace-m6-015', 'ace-m6-020', 'ace-m6-025', 'ace-m6-030', 'ace-m6-035', 'ace-m6-040', 'ace-m6-045', 'ace-m6-050', 'ace-m6-055', 'ace-m6-060', 'ace-m6-065', 'ace-m6-070', 'ace-m6-075', 'ace-m6-080', 'ace-m6-085', 'ace-m6-090', 'ace-m6-095', 'ace-m6-100']
  },
  {
    id: 'tryout-1',
    name: 'Tryout 1',
    group: 'Tryout · MD1–MD2',
    note: 'Modules MD1–MD2 · 60 min',
    minutes: 60,
    questionIds: ['ace-t01', 'ace-t02', 'ace-t03', 'ace-t04', 'ace-t05', 'ace-t06', 'ace-t07', 'ace-t08', 'ace-t09', 'ace-t10', 'ace-t11', 'ace-t12', 'ace-t13', 'ace-t14', 'ace-t15', 'ace-t16', 'ace-t17', 'ace-t18', 'ace-t19', 'ace-t20', 'ace-t21', 'ace-t22', 'ace-t23', 'ace-t24', 'ace-t25', 'ace-t26', 'ace-t27', 'ace-t28', 'ace-t29', 'ace-t30', 'ace-t31', 'ace-t32', 'ace-t33', 'ace-t34', 'ace-t35', 'ace-t36', 'ace-t37', 'ace-t38', 'ace-t39', 'ace-t40', 'ace-t41', 'ace-t42', 'ace-t43', 'ace-t44', 'ace-t45', 'ace-t46', 'ace-t47', 'ace-t48', 'ace-t49', 'ace-t50']
  },
  {
    id: 'tryout-2',
    name: 'Tryout 2',
    group: 'Tryout · MD1–MD2',
    note: 'Modules MD1–MD2 · 60 min',
    minutes: 60,
    questionIds: ['ace-t51', 'ace-t54', 'ace-t57', 'ace-t60', 'ace-t63', 'ace-t66', 'ace-t69', 'ace-t72', 'ace-t75', 'ace-t78', 'ace-t81', 'ace-t84', 'ace-t87', 'ace-t90', 'ace-t93', 'ace-t96', 'ace-t99', 'ace-t102', 'ace-t105', 'ace-t108', 'ace-t111', 'ace-t114', 'ace-t117', 'ace-t120', 'ace-t123', 'ace-t126', 'ace-t129', 'ace-t132', 'ace-t135', 'ace-t138', 'ace-t141', 'ace-t144', 'ace-t147', 'ace-t150', 'ace-t153', 'ace-t156', 'ace-t159', 'ace-t162', 'ace-t165', 'ace-t168', 'ace-t171', 'ace-t174', 'ace-t177', 'ace-t180', 'ace-t183', 'ace-t186', 'ace-t189', 'ace-t192', 'ace-t195', 'ace-t198']
  },
  {
    id: 'tryout-3',
    name: 'Tryout 3',
    group: 'Tryout · MD1–MD2',
    note: 'Modules MD1–MD2 · 60 min',
    minutes: 60,
    questionIds: ['ace-t52', 'ace-t55', 'ace-t58', 'ace-t61', 'ace-t64', 'ace-t67', 'ace-t70', 'ace-t73', 'ace-t76', 'ace-t79', 'ace-t82', 'ace-t85', 'ace-t88', 'ace-t91', 'ace-t94', 'ace-t97', 'ace-t100', 'ace-t103', 'ace-t106', 'ace-t109', 'ace-t112', 'ace-t115', 'ace-t118', 'ace-t121', 'ace-t124', 'ace-t127', 'ace-t130', 'ace-t133', 'ace-t136', 'ace-t139', 'ace-t142', 'ace-t145', 'ace-t148', 'ace-t151', 'ace-t154', 'ace-t157', 'ace-t160', 'ace-t163', 'ace-t166', 'ace-t169', 'ace-t172', 'ace-t175', 'ace-t178', 'ace-t181', 'ace-t184', 'ace-t187', 'ace-t190', 'ace-t193', 'ace-t196', 'ace-t199']
  },
  {
    id: 'tryout-4',
    name: 'Tryout 4',
    group: 'Tryout · MD1–MD2',
    note: 'Modules MD1–MD2 · 60 min',
    minutes: 60,
    questionIds: ['ace-t53', 'ace-t56', 'ace-t59', 'ace-t62', 'ace-t65', 'ace-t68', 'ace-t71', 'ace-t74', 'ace-t77', 'ace-t80', 'ace-t83', 'ace-t86', 'ace-t89', 'ace-t92', 'ace-t95', 'ace-t98', 'ace-t101', 'ace-t104', 'ace-t107', 'ace-t110', 'ace-t113', 'ace-t116', 'ace-t119', 'ace-t122', 'ace-t125', 'ace-t128', 'ace-t131', 'ace-t134', 'ace-t137', 'ace-t140', 'ace-t143', 'ace-t146', 'ace-t149', 'ace-t152', 'ace-t155', 'ace-t158', 'ace-t161', 'ace-t164', 'ace-t167', 'ace-t170', 'ace-t173', 'ace-t176', 'ace-t179', 'ace-t182', 'ace-t185', 'ace-t188', 'ace-t191', 'ace-t194', 'ace-t197', 'ace-t200']
  },
  {
    id: 'set-01',
    name: 'Set 01',
    questionIds: ['ace-338', 'ace-383', 'ace-297', 'ace-346', 'ace-323', 'ace-628', 'ace-060', 'ace-469', 'ace-543', 'ace-199', 'ace-083', 'ace-417', 'ace-540', 'ace-012', 'ace-465', 'ace-108', 'ace-615', 'ace-608', 'ace-295', 'ace-052', 'ace-155', 'ace-377', 'ace-532', 'ace-218', 'ace-245', 'ace-242', 'ace-398', 'ace-492', 'ace-103', 'ace-078', 'ace-586', 'ace-173', 'ace-561', 'ace-288', 'ace-335', 'ace-533', 'ace-444', 'ace-038', 'ace-634', 'ace-065', 'ace-024', 'ace-196', 'ace-512', 'ace-095', 'ace-101', 'ace-415', 'ace-035', 'ace-605', 'ace-491', 'ace-147']
  },
  {
    id: 'set-02',
    name: 'Set 02',
    questionIds: ['ace-047', 'ace-049', 'ace-449', 'ace-190', 'ace-599', 'ace-559', 'ace-141', 'ace-436', 'ace-640', 'ace-618', 'ace-191', 'ace-542', 'ace-525', 'ace-166', 'ace-397', 'ace-230', 'ace-447', 'ace-261', 'ace-595', 'ace-342', 'ace-093', 'ace-252', 'ace-584', 'ace-208', 'ace-538', 'ace-406', 'ace-667', 'ace-352', 'ace-555', 'ace-039', 'ace-409', 'ace-350', 'ace-565', 'ace-069', 'ace-311', 'ace-016', 'ace-276', 'ace-289', 'ace-189', 'ace-348', 'ace-305', 'ace-603', 'ace-148', 'ace-446', 'ace-428', 'ace-304', 'ace-439', 'ace-660', 'ace-562', 'ace-363']
  },
  {
    id: 'set-03',
    name: 'Set 03',
    questionIds: ['ace-495', 'ace-357', 'ace-580', 'ace-171', 'ace-333', 'ace-572', 'ace-125', 'ace-096', 'ace-606', 'ace-157', 'ace-571', 'ace-441', 'ace-102', 'ace-557', 'ace-082', 'ace-373', 'ace-175', 'ace-023', 'ace-365', 'ace-197', 'ace-448', 'ace-294', 'ace-637', 'ace-395', 'ace-131', 'ace-209', 'ace-210', 'ace-045', 'ace-324', 'ace-042', 'ace-007', 'ace-601', 'ace-056', 'ace-612', 'ace-489', 'ace-420', 'ace-629', 'ace-240', 'ace-349', 'ace-387', 'ace-213', 'ace-135', 'ace-094', 'ace-203', 'ace-302', 'ace-550', 'ace-156', 'ace-085', 'ace-602', 'ace-351']
  },
  {
    id: 'set-04',
    name: 'Set 04',
    questionIds: ['ace-374', 'ace-343', 'ace-185', 'ace-379', 'ace-656', 'ace-097', 'ace-524', 'ace-419', 'ace-330', 'ace-006', 'ace-152', 'ace-328', 'ace-516', 'ace-651', 'ace-597', 'ace-424', 'ace-233', 'ace-528', 'ace-220', 'ace-655', 'ace-204', 'ace-460', 'ace-664', 'ace-652', 'ace-150', 'ace-238', 'ace-250', 'ace-292', 'ace-073', 'ace-019', 'ace-072', 'ace-200', 'ace-198', 'ace-053', 'ace-163', 'ace-609', 'ace-472', 'ace-234', 'ace-098', 'ace-283', 'ace-581', 'ace-434', 'ace-511', 'ace-413', 'ace-051', 'ace-013', 'ace-064', 'ace-384', 'ace-386', 'ace-326']
  },
  {
    id: 'set-05',
    name: 'Set 05',
    questionIds: ['ace-508', 'ace-128', 'ace-074', 'ace-217', 'ace-298', 'ace-143', 'ace-624', 'ace-301', 'ace-255', 'ace-118', 'ace-539', 'ace-355', 'ace-486', 'ace-004', 'ace-325', 'ace-090', 'ace-178', 'ace-186', 'ace-435', 'ace-315', 'ace-212', 'ace-137', 'ace-411', 'ace-231', 'ace-378', 'ace-471', 'ace-121', 'ace-008', 'ace-529', 'ace-307', 'ace-277', 'ace-202', 'ace-087', 'ace-423', 'ace-645', 'ace-493', 'ace-022', 'ace-014', 'ace-635', 'ace-478', 'ace-010', 'ace-481', 'ace-267', 'ace-318', 'ace-188', 'ace-392', 'ace-497', 'ace-649', 'ace-088', 'ace-626']
  },
  {
    id: 'set-06',
    name: 'Set 06',
    questionIds: ['ace-089', 'ace-037', 'ace-536', 'ace-454', 'ace-658', 'ace-466', 'ace-515', 'ace-184', 'ace-059', 'ace-194', 'ace-452', 'ace-146', 'ace-451', 'ace-522', 'ace-650', 'ace-370', 'ace-061', 'ace-112', 'ace-475', 'ace-278', 'ace-180', 'ace-381', 'ace-487', 'ace-268', 'ace-514', 'ace-547', 'ace-282', 'ace-031', 'ace-585', 'ace-110', 'ace-161', 'ace-300', 'ace-291', 'ace-594', 'ace-501', 'ace-026', 'ace-154', 'ace-299', 'ace-506', 'ace-578', 'ace-453', 'ace-270', 'ace-172', 'ace-164', 'ace-151', 'ace-401', 'ace-369', 'ace-009', 'ace-046', 'ace-126']
  },
  {
    id: 'set-07',
    name: 'Set 07',
    questionIds: ['ace-124', 'ace-028', 'ace-509', 'ace-549', 'ace-265', 'ace-554', 'ace-616', 'ace-179', 'ace-367', 'ace-192', 'ace-140', 'ace-385', 'ace-483', 'ace-450', 'ace-247', 'ace-425', 'ace-499', 'ace-467', 'ace-254', 'ace-262', 'ace-080', 'ace-170', 'ace-145', 'ace-086', 'ace-296', 'ace-427', 'ace-334', 'ace-625', 'ace-564', 'ace-284', 'ace-092', 'ace-032', 'ace-340', 'ace-470', 'ace-575', 'ace-461', 'ace-339', 'ace-389', 'ace-030', 'ace-394', 'ace-071', 'ace-169', 'ace-279', 'ace-025', 'ace-457', 'ace-416', 'ace-485', 'ace-160', 'ace-336', 'ace-517']
  },
  {
    id: 'set-08',
    name: 'Set 08',
    questionIds: ['ace-587', 'ace-633', 'ace-593', 'ace-569', 'ace-167', 'ace-139', 'ace-003', 'ace-579', 'ace-144', 'ace-258', 'ace-107', 'ace-317', 'ace-232', 'ace-235', 'ace-402', 'ace-443', 'ace-136', 'ace-490', 'ace-331', 'ace-433', 'ace-400', 'ace-259', 'ace-558', 'ace-570', 'ace-445', 'ace-266', 'ace-002', 'ace-286', 'ace-021', 'ace-327', 'ace-636', 'ace-430', 'ace-513', 'ace-463', 'ace-619', 'ace-368', 'ace-535', 'ace-246', 'ace-269', 'ace-248', 'ace-224', 'ace-553', 'ace-018', 'ace-666', 'ace-521', 'ace-256', 'ace-223', 'ace-281', 'ace-408', 'ace-222']
  },
  {
    id: 'set-09',
    name: 'Set 09',
    questionIds: ['ace-138', 'ace-310', 'ace-195', 'ace-134', 'ace-442', 'ace-113', 'ace-070', 'ace-576', 'ace-273', 'ace-237', 'ace-496', 'ace-468', 'ace-526', 'ace-646', 'ace-566', 'ace-356', 'ace-332', 'ace-639', 'ace-015', 'ace-182', 'ace-614', 'ace-414', 'ace-312', 'ace-573', 'ace-162', 'ace-149', 'ace-432', 'ace-062', 'ace-360', 'ace-225', 'ace-527', 'ace-638', 'ace-621', 'ace-058', 'ace-607', 'ace-647', 'ace-390', 'ace-111', 'ace-662', 'ace-613', 'ace-429', 'ace-591', 'ace-473', 'ace-201', 'ace-130', 'ace-641', 'ace-214', 'ace-551', 'ace-382', 'ace-027']
  },
  {
    id: 'set-10',
    name: 'Set 10',
    questionIds: ['ace-590', 'ace-109', 'ace-257', 'ace-544', 'ace-459', 'ace-375', 'ace-458', 'ace-221', 'ace-215', 'ace-263', 'ace-308', 'ace-657', 'ace-075', 'ace-412', 'ace-251', 'ace-583', 'ace-494', 'ace-020', 'ace-314', 'ace-537', 'ace-380', 'ace-563', 'ace-530', 'ace-347', 'ace-050', 'ace-405', 'ace-293', 'ace-099', 'ace-329', 'ace-534', 'ace-474', 'ace-354', 'ace-665', 'ace-552', 'ace-500', 'ace-229', 'ace-604', 'ace-067', 'ace-241', 'ace-319', 'ace-362', 'ace-105', 'ace-510', 'ace-115', 'ace-322', 'ace-479', 'ace-119', 'ace-546', 'ace-306', 'ace-132']
  },
  {
    id: 'set-11',
    name: 'Set 11',
    questionIds: ['ace-174', 'ace-275', 'ace-104', 'ace-077', 'ace-183', 'ace-630', 'ace-187', 'ace-498', 'ace-422', 'ace-054', 'ace-116', 'ace-396', 'ace-376', 'ace-617', 'ace-388', 'ace-556', 'ace-239', 'ace-507', 'ace-560', 'ace-518', 'ace-120', 'ace-361', 'ace-631', 'ace-589', 'ace-464', 'ace-153', 'ace-044', 'ace-048', 'ace-582', 'ace-648', 'ace-290', 'ace-168', 'ace-623', 'ace-418', 'ace-364', 'ace-477', 'ace-523', 'ace-081', 'ace-531', 'ace-117', 'ace-480', 'ace-243', 'ace-391', 'ace-244', 'ace-176', 'ace-622', 'ace-205', 'ace-371', 'ace-403', 'ace-426']
  },
  {
    id: 'set-12',
    name: 'Set 12',
    questionIds: ['ace-404', 'ace-236', 'ace-353', 'ace-610', 'ace-206', 'ace-456', 'ace-653', 'ace-127', 'ace-253', 'ace-541', 'ace-285', 'ace-620', 'ace-659', 'ace-341', 'ace-421', 'ace-321', 'ace-216', 'ace-133', 'ace-068', 'ace-505', 'ace-337', 'ace-372', 'ace-627', 'ace-455', 'ace-040', 'ace-611', 'ace-316', 'ace-017', 'ace-079', 'ace-041', 'ace-123', 'ace-272', 'ace-661', 'ace-057', 'ace-280', 'ace-440', 'ace-274', 'ace-596', 'ace-519', 'ace-219', 'ace-287', 'ace-520', 'ace-462', 'ace-226', 'ace-055', 'ace-488', 'ace-644', 'ace-313', 'ace-100', 'ace-320']
  },
  {
    id: 'set-13',
    name: 'Set 13',
    questionIds: ['ace-476', 'ace-211', 'ace-503', 'ace-264', 'ace-122', 'ace-632', 'ace-076', 'ace-359', 'ace-271', 'ace-577', 'ace-407', 'ace-084', 'ace-545', 'ace-358', 'ace-114', 'ace-568', 'ace-036', 'ace-588', 'ace-600', 'ace-033', 'ace-437', 'ace-260', 'ace-063', 'ace-034', 'ace-066', 'ace-106', 'ace-227', 'ace-654', 'ace-011', 'ace-029', 'ace-574', 'ace-303', 'ace-399', 'ace-249', 'ace-129', 'ace-043', 'ace-484', 'ace-091', 'ace-410', 'ace-005', 'ace-142', 'ace-345', 'ace-001', 'ace-366', 'ace-592', 'ace-504', 'ace-431', 'ace-165', 'ace-502', 'ace-228']
  },
  {
    id: 'set-14',
    name: 'Set 14',
    questionIds: ['ace-393', 'ace-663', 'ace-482', 'ace-309', 'ace-181', 'ace-548', 'ace-207', 'ace-177', 'ace-344', 'ace-598', 'ace-643', 'ace-159', 'ace-438', 'ace-642', 'ace-158', 'ace-193']
  }
];
