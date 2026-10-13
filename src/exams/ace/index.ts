import { defineExam } from '@/core';
import type { Section } from '@/types';
import { cheatsheet } from './cheatsheet';

/**
 * Associate Cloud Engineer. The five sections and their weights are Google's
 * own, from the published exam guide:
 * https://cloud.google.com/learn/certification/guides/cloud-engineer
 *
 * No question bank yet — this exam ships with its cheat sheet first, so it has
 * no `modes` and `defineExam` marks it `studyOnly`. Adding `questions` to the
 * sections and a `modes` array is all that turns it into a sittable paper.
 */
const SECTIONS: Section[] = [
  {
    id: 'setup',
    name: 'Setting up a cloud solution environment',
    short: 'Setup',
    icon: '01',
    weight: 20,
    blurb:
      'Projects and the resource hierarchy, organisation policy, IAM roles in a project, users and groups in Cloud Identity, enabling APIs, billing accounts, budgets and billing export, and installing and configuring the Cloud SDK.',
    questions: []
  },
  {
    id: 'planning',
    name: 'Planning and configuring a cloud solution',
    short: 'Planning',
    icon: '02',
    weight: 17.5,
    blurb:
      'Pricing Calculator estimates, choosing compute for a workload, preemptible and custom machine types, choosing between the databases and the storage classes, telling the load balancers apart, and placing resources for availability.',
    questions: []
  },
  {
    id: 'deploying',
    name: 'Deploying and implementing a cloud solution',
    short: 'Deploying',
    icon: '03',
    weight: 25,
    blurb:
      'The largest section. Launching instances and managed instance groups, deploying GKE clusters and workloads, Cloud Run and Cloud Functions, loading data, building VPCs, firewall rules, VPNs and load balancers, Marketplace, and infrastructure as code.',
    questions: []
  },
  {
    id: 'operating',
    name: 'Ensuring successful operation of a cloud solution',
    short: 'Operating',
    icon: '04',
    weight: 20,
    blurb:
      'Day-two work: managing instances, snapshots and images, node pools and pods, Cloud Run traffic and scaling, object lifecycle and database backups, growing subnets and reserving addresses, and Cloud Monitoring alerts, custom metrics and log sinks.',
    questions: []
  },
  {
    id: 'access',
    name: 'Configuring access and security',
    short: 'Access',
    icon: '05',
    weight: 17.5,
    blurb:
      'Viewing and writing IAM policies, predefined against custom roles, service accounts and least privilege, assigning and impersonating them, short-lived credentials, and reading audit logs.',
    questions: []
  }
];

export const ace = defineExam({
  id: 'ace',
  storagePrefix: 'ace',
  name: 'Associate Cloud Engineer',
  subtitle: 'Google Cloud Certification Prep',
  short: 'ACE',
  tagline: 'Google Cloud · associate certification',
  blurb:
    'The hands-on Google Cloud certification: 50–60 questions in two hours about deploying, operating and securing real projects. The cheat sheet is here now; the question bank comes next.',
  icon: 'AC',
  mixed: true,
  drillMin: 5,
  sections: SECTIONS,
  /** No presets yet — `studyOnly` follows from this, and the views adapt. */
  modes: [],
  home: {
    eyebrow: 'Google Cloud · Associate Cloud Engineer',
    title: 'Know the console\nbefore you book it.',
    lede:
      'Five sections — <strong>setup, planning, deploying, operating and access</strong> — in 50 to 60 questions over two hours. Unlike the Digital Leader paper, this one expects you to have actually done the work.',
    startLabel: 'Open the cheat sheet',
    aboutLabel: 'What is on the exam?',
    sectionsTitle: 'The five sections of the exam guide',
    extraNote:
      'Deploying is the heaviest section at a quarter of the paper, and operating is a fifth of it — between them, half the exam is about doing rather than choosing.'
  },
  verdict(percent) {
    if (percent >= 85)
      return {
        title: 'Ready to book it',
        note: 'Consistent scores here mean the product choices and the console work are both solid. Sit one more full paper under strict time and schedule the exam.'
      };
    if (percent >= 70)
      return {
        title: 'Around the bar — tighten the weak section',
        note: 'Find your lowest section below. On this paper the gap is usually operating or deploying, which reward time in the console rather than more reading.'
      };
    if (percent >= 50)
      return {
        title: 'The concepts are there, the commands are not',
        note: 'You know which product to choose but not how it is configured. Read the explanation on every miss, then do the same task in the console once.'
      };
    return {
      title: 'Work section by section first',
      note: 'Take each section untimed and read every explanation. This exam is narrower than it looks, but it expects specifics: flags, scopes, access modes, machine families.'
    };
  },
  footer:
    'An unofficial practice tool built for personal preparation. Not affiliated with, endorsed by, or produced by Google LLC. Section weights are quoted from Google\'s published exam guide.',
  focusTopicIds: [],
  cheatsheet
});
