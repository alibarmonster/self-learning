import type { LessonMeta } from '@/types';

/**
 * Deep-dive lessons shared by the Google Cloud exams. Only this list ships in
 * the main bundle; each lesson's content is fetched when it is opened.
 */
export const GOOGLE_CLOUD_LESSONS: LessonMeta[] = [
  {
    id: 'gke',
    title: 'Getting Started with Google Kubernetes Engine',
    summary: 'Dari nol: konsep Kubernetes, komponen cluster, Autopilot vs Standard, kubectl, introspection, dan 9 studi kasus yang paling sering muncul.',
    minutes: 45,
    level: 'Dasar → Menengah',
    topics: ['GKE', 'Kubernetes', 'kubectl', 'Autopilot', 'Workload Identity'],
    load: () => import('./gke')
  }
];
