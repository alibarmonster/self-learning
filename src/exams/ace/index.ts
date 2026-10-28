import { defineExam } from '@/core';
import { GOOGLE_CLOUD_SHEETS } from '@/sheets';
import { GOOGLE_CLOUD_LESSONS } from '@/lessons';
import type { Mode, Section } from '@/types';
import { cheatsheet } from './cheatsheet';
import { sets } from './sets';
import { setup } from './questions/setup';
import { planning } from './questions/planning';
import { deploying } from './questions/deploying';
import { operating } from './questions/operating';
import { access } from './questions/access';
import { tryout } from './questions/tryout';
import { tryoutSetup } from './questions/tryout-setup';
import { tryoutPlanning } from './questions/tryout-planning';
import { tryoutOperating } from './questions/tryout-operating';
import { tryoutAccess } from './questions/tryout-access';

/**
 * Associate Cloud Engineer. The four sections and their weights are Google's
 * own, from the current exam guide linked from
 * https://cloud.google.com/learn/certification/cloud-engineer
 *
 * That guide merged the old "Planning and configuring" and "Deploying and
 * implementing" sections into one, "Planning and implementing". Both question
 * files stay; the planning section holds them together, and the retired
 * `deploying` id is aliased to it so papers saved before the change still open.
 *
 * The bank is 666 questions from a community dump, plus 200 written for the
 * course tryout (questions/tryout*.ts, 50 per section), each assigned to the section
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
      'Projects, the resource hierarchy and organization policies, IAM roles in a project, users and groups in Cloud Identity, enabling APIs, quotas and regional availability, first networking and Cloud Observability setup, Cloud Asset Inventory with Gemini Cloud Assist, Workforce Identity Federation, and billing accounts, budgets, alerts and exports.',
    questions: [...setup, ...tryout.setup, ...tryoutSetup]
  },
  {
    id: 'planning',
    name: 'Planning and implementing a cloud solution',
    short: 'Plan & build',
    icon: '02',
    weight: 30,
    blurb:
      'Choosing and building, now one section. Compute — Compute Engine, GKE, Cloud Run and Cloud Run functions, Agent Runtime — with disks, managed instance groups, OS Login, Spot VMs, GPUs or TPUs, Autopilot and private clusters, and event-driven deploys; data and storage products, storage classes and loading data; VPCs, firewall rules and Cloud NGFW policies, VPN, peering and Interconnect, load balancers and network tiers; Terraform, Config Connector and Helm, and AI-assisted tools such as Gemini CLI.',
    questions: [...planning, ...deploying, ...tryout.planning, ...tryoutPlanning]
  },
  {
    id: 'operating',
    name: 'Ensuring the successful operation of a cloud solution',
    short: 'Operating',
    icon: '03',
    weight: 30,
    blurb:
      'Day-two work: connecting to and managing VMs, snapshots and images, GKE inventory, node pools and Pod autoscaling, Cloud Run revisions, traffic splitting and scaling; securing and expiring Cloud Storage objects, querying and backing up databases, CMEK; resizing subnets, static IPs, custom routes, Cloud DNS and Cloud NAT; and Cloud Monitoring alerts, custom metrics, audit and flow logs, log routing and buckets, Ops Agent and diagnostic tools.',
    questions: [...operating, ...tryout.operating, ...tryoutOperating]
  },
  {
    id: 'access',
    name: 'Configuring access and security',
    short: 'Access',
    icon: '04',
    weight: 20,
    blurb:
      'Viewing and creating IAM policies, inheritance down the hierarchy, role types and custom roles; creating service accounts and granting them the least they need, assigning and impersonating them, short-lived credentials, service accounts for GKE workloads, and Workload Identity Federation.',
    questions: [...access, ...tryout.access, ...tryoutAccess]
  }
];

/**
 * Presets follow the published format: 50–60 questions in two hours, drawn in
 * the guide's section weights (20 / 30 / 30 / 20).
 */
const MODES: Mode[] = [
  {
    id: 'full',
    name: 'Full Exam',
    tagline: '50 questions · 2 hours',
    minutes: 120,
    blueprint: { setup: 10, planning: 15, operating: 15, access: 10 },
    description:
      '50 questions in 120 minutes, drawn across the four sections in the guide\'s proportions and shuffled together the way the real paper is. A handful are multiple select — every pick must be right to score. About two and a half minutes a question.'
  },
  {
    id: 'real',
    name: 'Real-length Exam',
    tagline: '50–60 questions · 2 hours',
    minutes: 120,
    /** The real paper is 50–60 questions, so this draws a different length every sitting. */
    blueprint: {
      setup: [10, 12],
      planning: [15, 18],
      operating: [15, 18],
      access: [10, 12]
    },
    description:
      'Google hands out somewhere between 50 and 60 questions in two hours, so this draws a different number in that range every sitting, still in the guide\'s section weights. The closest thing to the real clock pressure.'
  },
  {
    id: 'renewal',
    name: 'Renewal Exam',
    tagline: '20 questions · 1 hour',
    minutes: 60,
    blueprint: { setup: 4, planning: 6, operating: 6, access: 4 },
    description:
      'The shape of the renewal paper for current certificate holders: 20 questions in an hour across the same four sections. A good first sitting to find your weak section before a full mock.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 20,
    blueprint: { setup: 3, planning: 5, operating: 4, access: 3 },
    description: '15 mixed questions in 20 minutes, three to five from each section. Good for a daily rep.'
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
    'A timed simulator for Google\'s hands-on cloud certification: 50–60 questions in two hours about deploying, operating and securing real projects, from an 866-question bank with a reviewed key and an explanation on every question.',
  icon: 'AC',
  fullModeId: 'full',
  mixed: true,
  drillMin: 5,
  sections: SECTIONS,
  sectionAliases: { deploying: 'planning' },
  modes: MODES,
  /** Four tryout sets first, then the community bank in 13 fixed sets of 50 and a final 16 — see sets.ts. */
  sets,
  setMinutesPerQuestion: 2.4,
  home: {
    eyebrow: 'Google Cloud · Associate Cloud Engineer',
    title: 'Know the console\nbefore you book it.',
    lede:
      'Four sections — <strong>setup, planning and implementing, operations, and access</strong> — in 50 to 60 questions over two hours. Unlike the Digital Leader paper, this one expects you to have actually done the work. Every key in the bank has been checked against current documentation.',
    startLabel: 'Start the 2-hour exam',
    aboutLabel: 'What is on the exam?',
    sectionsTitle: 'The four sections of the exam guide',
    extraNote:
      'Planning and implementing, and operations, are 30% each — three-fifths of the paper is building and running things. The current guide merged the old planning and deploying sections, and added AI tooling such as Gemini Cloud Assist.'
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
        note: 'Find your lowest section below. On this paper the gap is usually operations or implementing, which reward time in the console rather than more reading.'
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
  extraSheets: GOOGLE_CLOUD_SHEETS,
  lab: true,
  lessons: GOOGLE_CLOUD_LESSONS
});
