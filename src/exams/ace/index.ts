import { defineExam } from '@/core';
import { GOOGLE_CLOUD_SHEETS } from '@/sheets';
import type { Mode, Section } from '@/types';
import { cheatsheet } from './cheatsheet';
import { sets } from './sets';
import { setup } from './questions/setup';
import { planning } from './questions/planning';
import { deploying } from './questions/deploying';
import { operating } from './questions/operating';
import { access } from './questions/access';

/**
 * Associate Cloud Engineer. The five sections and their weights are Google's
 * own, from the published exam guide:
 * https://cloud.google.com/learn/certification/guides/cloud-engineer
 *
 * The bank is 666 questions from a community dump, each assigned to the section
 * its decision belongs to, with every key reviewed — see questions/*.ts. The
 * real paper interleaves the sections, so the exam is `mixed`.
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
    questions: setup
  },
  {
    id: 'planning',
    name: 'Planning and configuring a cloud solution',
    short: 'Planning',
    icon: '02',
    weight: 17.5,
    blurb:
      'Pricing Calculator estimates, choosing compute for a workload, preemptible and custom machine types, choosing between the databases and the storage classes, telling the load balancers apart, and placing resources for availability.',
    questions: planning
  },
  {
    id: 'deploying',
    name: 'Deploying and implementing a cloud solution',
    short: 'Deploying',
    icon: '03',
    weight: 25,
    blurb:
      'The largest section. Launching instances and managed instance groups, deploying GKE clusters and workloads, Cloud Run and Cloud Functions, loading data, building VPCs, firewall rules, VPNs and load balancers, Marketplace, and infrastructure as code.',
    questions: deploying
  },
  {
    id: 'operating',
    name: 'Ensuring successful operation of a cloud solution',
    short: 'Operating',
    icon: '04',
    weight: 20,
    blurb:
      'Day-two work: managing instances, snapshots and images, node pools and pods, Cloud Run traffic and scaling, object lifecycle and database backups, growing subnets and reserving addresses, and Cloud Monitoring alerts, custom metrics and log sinks.',
    questions: operating
  },
  {
    id: 'access',
    name: 'Configuring access and security',
    short: 'Access',
    icon: '05',
    weight: 17.5,
    blurb:
      'Viewing and writing IAM policies, predefined against custom roles, service accounts and least privilege, assigning and impersonating them, short-lived credentials, and reading audit logs.',
    questions: access
  }
];

/**
 * Presets follow the published format: 50–60 questions in two hours, drawn in
 * the guide's section weights (20 / 17.5 / 25 / 20 / 17.5).
 */
const MODES: Mode[] = [
  {
    id: 'full',
    name: 'Full Exam',
    tagline: '50 questions · 2 hours',
    minutes: 120,
    blueprint: { setup: 10, planning: 9, deploying: 12, operating: 10, access: 9 },
    description:
      '50 questions in 120 minutes, drawn across the five sections in the guide\'s proportions and shuffled together the way the real paper is. A handful are multiple select — every pick must be right to score. About two and a half minutes a question.'
  },
  {
    id: 'real',
    name: 'Real-length Exam',
    tagline: '50–60 questions · 2 hours',
    minutes: 120,
    /** The real paper is 50–60 questions, so this draws a different length every sitting. */
    blueprint: {
      setup: [10, 12],
      planning: [9, 10],
      deploying: [12, 15],
      operating: [10, 12],
      access: [9, 11]
    },
    description:
      'Google hands out somewhere between 50 and 60 questions in two hours, so this draws a different number in that range every sitting, still in the guide\'s section weights. The closest thing to the real clock pressure.'
  },
  {
    id: 'renewal',
    name: 'Renewal Exam',
    tagline: '20 questions · 1 hour',
    minutes: 60,
    blueprint: { setup: 4, planning: 4, deploying: 5, operating: 4, access: 3 },
    description:
      'The shape of the renewal paper for current certificate holders: 20 questions in an hour across the same five sections. A good first sitting to find your weak section before a full mock.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 20,
    blueprint: { setup: 3, planning: 3, deploying: 4, operating: 3, access: 2 },
    description: '15 mixed questions in 20 minutes, two to four from each section. Good for a daily rep.'
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
    'A timed simulator for Google\'s hands-on cloud certification: 50–60 questions in two hours about deploying, operating and securing real projects, from a 666-question bank with a reviewed key and an explanation on every question.',
  icon: 'AC',
  fullModeId: 'full',
  mixed: true,
  drillMin: 5,
  sections: SECTIONS,
  modes: MODES,
  /** The whole bank split into 13 fixed sets of 50 and a final 16 — see sets.ts. */
  sets,
  setMinutesPerQuestion: 2.4,
  home: {
    eyebrow: 'Google Cloud · Associate Cloud Engineer',
    title: 'Know the console\nbefore you book it.',
    lede:
      'Five sections — <strong>setup, planning, deploying, operating and access</strong> — in 50 to 60 questions over two hours. Unlike the Digital Leader paper, this one expects you to have actually done the work. Every key in the bank has been checked against current documentation.',
    startLabel: 'Start the 2-hour exam',
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
    'An unofficial practice tool built for personal preparation. Not affiliated with, endorsed by, or produced by Google LLC. Section weights are quoted from Google\'s published exam guide. Questions come from a community dump; where its answer key was wrong it has been corrected and the explanation says so.',
  focusTopicIds: [],
  cheatsheet,
  /** Command reference and plain-language concepts, as extra tabs. */
  extraSheets: GOOGLE_CLOUD_SHEETS
});
