import { defineExam } from '@/core';
import { GOOGLE_CLOUD_SHEETS } from '@/sheets';
import type { Mode, Section } from '@/types';
import { digitalTransformation } from './questions/digital-transformation';
import { data } from './questions/data';
import { ai } from './questions/ai';
import { infrastructure } from './questions/infrastructure';
import { security } from './questions/security';
import { operations } from './questions/operations';
import { community } from './questions/community';
import { cheatsheet } from './cheatsheet';

/**
 * The six sections of Google's Cloud Digital Leader exam guide, each worth
 * roughly a sixth of the paper. The real exam does not group questions by
 * section — they arrive interleaved — so the exam is flagged `mixed` and every
 * preset draws one shuffled pile.
 */
const SECTIONS: Section[] = [
  {
    id: 'digital-transformation',
    name: 'Digital transformation',
    short: 'Transformation',
    icon: '01',
    weight: 17,
    blurb:
      'Why cloud technology is transforming business, fundamental cloud concepts — scalability, elasticity, regions and zones, CapEx versus OpEx — and the IaaS, PaaS and SaaS models with their shared responsibility.',
    questions: digitalTransformation
  },
  {
    id: 'data',
    name: 'Data transformation',
    short: 'Data',
    icon: '02',
    weight: 16,
    blurb:
      'The value of data, telling databases, warehouses and lakes apart, the Google Cloud data products — Cloud Storage classes, Cloud SQL, Spanner, Bigtable, Firestore, BigQuery — and making data useful with Looker, Pub/Sub and Dataflow.',
    questions: data
  },
  {
    id: 'ai',
    name: 'Artificial intelligence',
    short: 'AI',
    icon: '03',
    weight: 16,
    blurb:
      'AI and ML fundamentals, responsible and explainable AI, choosing between pre-trained APIs, AutoML and custom models, and the products: Vision, Natural Language, Translation, Speech APIs, BigQuery ML, Vertex AI, TensorFlow and TPUs.',
    questions: ai
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure & applications',
    short: 'Infrastructure',
    icon: '04',
    weight: 17,
    blurb:
      'Migration paths from rehost to reimagine, VMs versus containers, Kubernetes and GKE, serverless with Cloud Run, Cloud Functions and App Engine, APIs and Apigee, and hybrid or multicloud with Anthos.',
    questions: infrastructure
  },
  {
    id: 'security',
    name: 'Trust & security',
    short: 'Security',
    icon: '05',
    weight: 17,
    blurb:
      'Confidentiality, integrity and availability, common threats, defence in depth, encryption in its three states, authentication versus authorisation, IAM, Cloud Armor, SecOps, and Google\'s trust principles, transparency and compliance tooling.',
    questions: security
  },
  {
    id: 'operations',
    name: 'Cloud operations',
    short: 'Operations',
    icon: '06',
    weight: 17,
    blurb:
      'Financial governance — resource hierarchy, budgets, quotas, billing reports — reliability and DevOps/SRE vocabulary, Google Cloud Customer Care, and sustainability commitments and tools.',
    questions: operations
  },
  {
    id: 'community',
    name: 'Community exam bank',
    short: 'Community',
    icon: '07',
    blurb:
      'All 289 real exam-style questions as they circulate in the community question banks, kept word for word. The answer on each one is the community\'s most-voted choice rather than the answer the dumps print — on 15 of them the two disagree. Sit these when you want the phrasing of the real paper rather than the shape of the exam guide.',
    questions: community
  }
];

/**
 * Presets. The real exam is 50–60 questions in 90 minutes; the full mock sits
 * at 50, split in proportion to the guide's weightings. The renewal exam is a
 * real, shorter paper Google offers to existing certificate holders.
 */
const MODES: Mode[] = [
  {
    id: 'full',
    name: 'Full Exam',
    tagline: '50 questions · 90 minutes',
    minutes: 90,
    blueprint: {
      'digital-transformation': 9,
      data: 8,
      ai: 8,
      infrastructure: 9,
      security: 8,
      operations: 8
    },
    description:
      '50 questions in 90 minutes, drawn across all six sections in the guide\'s proportions and shuffled together the way the real paper is. Some are multiple select — every pick must be right to score. Just under two minutes a question — comfortable if you know the material, tight if you are reasoning it out.'
  },
  {
    id: 'renewal',
    name: 'Renewal Exam',
    tagline: '20 questions · 45 minutes',
    minutes: 45,
    blueprint: {
      'digital-transformation': 4,
      data: 3,
      ai: 3,
      infrastructure: 4,
      security: 3,
      operations: 3
    },
    description:
      'The shape of the renewal paper Google offers to current certificate holders: 20 questions in 45 minutes, the same six sections. Also a good first sitting to find your weak sections before the full mock.'
  },
  {
    id: 'community',
    name: 'Community Exam',
    tagline: '50–60 questions · 90 minutes',
    minutes: 90,
    /** The real paper is 50–60 questions, so this one draws a different length every sitting. */
    blueprint: { community: [50, 60] },
    description:
      'A paper the length of the real thing: Google hands out somewhere between 50 and 60 questions in 90 minutes, so this draws a different number in that range every sitting. All of them come from the 289-question community bank, verbatim, each answer following the most-voted community choice with the published vote split shown when you reveal it. Closest to the phrasing you will meet; use the Full Exam for the guide\'s domain balance.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 15,
    blueprint: {
      'digital-transformation': 3,
      data: 2,
      ai: 2,
      infrastructure: 3,
      security: 3,
      operations: 2
    },
    description: '15 mixed questions in 15 minutes, two or three from each section. Good for a daily rep.'
  }
];

export const cdl = defineExam({
  id: 'cdl',
  storagePrefix: 'cdl',
  name: 'Cloud Digital Leader',
  subtitle: 'Google Cloud Certification Prep',
  short: 'CDL',
  tagline: 'Google Cloud · foundational certification',
  blurb:
    'A timed simulator for Google\'s Cloud Digital Leader exam: 50–60 multiple choice and multiple select questions in 90 minutes across six domains.',
  icon: 'GC',
  fullModeId: 'full',
  /** No parts; the six sections are flat, and the paper interleaves them. */
  mixed: true,
  /** Sections hold ~20 questions, so a topic is drillable at five. */
  drillMin: 5,
  sections: SECTIONS,
  modes: MODES,
  home: {
    eyebrow: 'Google Cloud · Cloud Digital Leader',
    title: 'Pass the certification\nbefore you pay for the exam.',
    lede:
      'Six sections, weighted almost evenly — <strong>digital transformation, data, AI, infrastructure, security and operations</strong> — in 50 to 60 multiple choice and multiple select questions over 90 minutes. Every preset here mixes the sections the way the real paper does.',
    startLabel: 'Start the 90-minute exam',
    aboutLabel: 'What is on the exam?',
    sectionsTitle: 'The six sections of the exam guide',
    extraNote:
      'Each section is worth roughly a sixth of the paper. Drill any one of them on its own, untimed, before sitting the mixed mock.'
  },
  verdict(percent) {
    if (percent >= 85)
      return {
        title: 'Ready to book it',
        note: 'Google does not publish the pass mark, but consistent scores in this range on mixed papers are well clear of where people report passing. Sit one more full mock under strict time, then schedule the real exam while it is fresh.'
      };
    if (percent >= 70)
      return {
        title: 'Around the bar — tighten the weak section',
        note: 'Most reports put the pass mark somewhere near here, so you cannot afford a bad section on the day. Find your lowest domain below and drill it until the product-choice questions become automatic.'
      };
    if (percent >= 50)
      return {
        title: 'The map is there, the products are not',
        note: 'You understand the concepts but are mixing up which Google Cloud product does what. Read the explanation on every miss — most of them turn on one distinction, like Nearline versus Coldline or Cloud SQL versus Spanner.'
      };
    return {
      title: 'Work section by section first',
      note: 'Rather than sitting another mixed paper, take each section drill untimed and read every explanation. The exam is broad but not deep; once the vocabulary is in place the score climbs fast.'
    };
  },
  footer:
    'An unofficial practice tool built for personal preparation. Not affiliated with, endorsed by, or produced by Google LLC. None of these questions are real exam questions — they are written to the topics in Google\'s published exam guide.',
  focusTopicIds: [],
  /** Decision tables for the product-choice questions — see Cheatsheet.svelte. */
  cheatsheet,
  /** Command reference and plain-language concepts, as extra tabs. */
  extraSheets: GOOGLE_CLOUD_SHEETS
});
