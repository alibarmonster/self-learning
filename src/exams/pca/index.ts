import { defineExam } from '@/core';
import { GOOGLE_CLOUD_SHEETS } from '@/sheets';
import { PCA_LESSONS } from '@/lessons';
import type { Mode, Section } from '@/types';
import { cheatsheet } from './cheatsheet';
import { sets } from './sets';
import { design } from './questions/design';
import { provisioning } from './questions/provisioning';
import { security } from './questions/security';
import { processes } from './questions/processes';
import { implementation } from './questions/implementation';
import { operations } from './questions/operations';
import { cases } from './questions/cases';

/**
 * Professional Cloud Architect. The six sections and their weights are
 * Google's own, from the current exam guide:
 * https://services.google.com/fh/files/misc/professional_cloud_architect_exam_guide_english.pdf
 *
 * Every question is written for this app: 228 across the six sections, plus
 * 72 on the guide's four case studies (Altostrat Media, Cymbal Retail, EHR
 * Healthcare, KnightMotives Automotive), kept as their own section so they can
 * be drilled per case study and drawn at the real paper's 20–30% share. The
 * paper interleaves everything, so the exam is `mixed`.
 */
const SECTIONS: Section[] = [
  {
    id: 'design',
    name: 'Designing and planning a cloud solution architecture',
    short: 'Design',
    icon: '01',
    weight: 25,
    blurb:
      'Turning business and technical requirements into an architecture: trade-offs, KPIs and workload dispositions, high availability and disaster recovery, choosing compute, storage, databases, data processing, networks and AI solutions, migration planning with Migration Center, licensing and network planning, and designing for what comes next.',
    questions: design
  },
  {
    id: 'provisioning',
    name: 'Managing and provisioning a cloud solution infrastructure',
    short: 'Provision',
    icon: '02',
    weight: 17.5,
    blurb:
      'Hybrid and multicloud network topologies, firewalls and load balancing; configuring storage for retention, lifecycle, replication, growth and protection; compute provisioning, Spot capacity, serverless and VMware Engine networking, patching and container orchestration; ML workflows on Gemini Enterprise Agent Platform and AI Hypercomputer; and prebuilt AI APIs, Gemini Enterprise and Model Garden.',
    questions: provisioning
  },
  {
    id: 'security',
    name: 'Designing for security and compliance',
    short: 'Security',
    icon: '03',
    weight: 17.5,
    blurb:
      'IAM and the resource hierarchy, separation of duties, Cloud KMS, Cloud HSM and Cloud EKM, secrets and Sensitive Data Protection, VPC Service Controls, context-aware access, organization and hierarchical firewall policies, IAP, Chrome Enterprise Premium and Workload Identity Federation, supply chain security, Model Armor, and designing for HIPAA, PCI DSS, GDPR, children\'s privacy, SOC 2 and audits.',
    questions: security
  },
  {
    id: 'processes',
    name: 'Analyzing and optimizing technical and business processes',
    short: 'Processes',
    icon: '04',
    weight: 15,
    blurb:
      'The software delivery lifecycle and CI/CD, root-cause analysis and testing, disaster recovery as a practised process, stakeholder and change management, skills readiness, decision records and customer success, and cost optimisation from CapEx/OpEx to commitments, rightsizing and chargeback.',
    questions: processes
  },
  {
    id: 'implementation',
    name: 'Managing implementation',
    short: 'Implement',
    icon: '05',
    weight: 12.5,
    blurb:
      'Advising teams on deployment, API management with Apigee, testing frameworks and migration tooling, and Gemini Cloud Assist; and working programmatically — Cloud Shell, Cloud Code, the Google Cloud CLI, emulators, client libraries and API best practices, and infrastructure as code with Terraform and Infrastructure Manager.',
    questions: implementation
  },
  {
    id: 'operations',
    name: 'Ensuring solution and operations excellence',
    short: 'Operations',
    icon: '06',
    weight: 12.5,
    blurb:
      'The operational excellence pillar and SRE practice — SLOs, error budgets, toil and incidents — observability, profiling, benchmarking and alerting strategy, deployment and release management, supporting live solutions and quality control, and reliability testing with chaos engineering, penetration tests and load tests.',
    questions: operations
  },
  {
    id: 'cases',
    name: 'Case studies',
    short: 'Case studies',
    icon: 'CS',
    blurb:
      'Altostrat Media, Cymbal Retail, EHR Healthcare and KnightMotives Automotive — the four case studies in the current guide, 18 questions each. The real paper picks two of them for 20–30% of its questions, drawing on every section; each fixed practice exam here does the same, and each case study can be drilled on its own.',
    questions: cases
  }
];

/**
 * Presets follow the published format: 50–60 questions in two hours, drawn in
 * the guide's section weights with about a fifth to a quarter from the case
 * studies, as on the real paper.
 */
const MODES: Mode[] = [
  {
    id: 'full',
    name: 'Full Exam',
    tagline: '50 questions · 2 hours',
    minutes: 120,
    blueprint: { design: 10, provisioning: 7, security: 7, processes: 5, implementation: 5, operations: 5, cases: 11 },
    description:
      '50 questions in 120 minutes: 39 across the six sections in the guide\'s proportions and 11 case-study questions, shuffled together the way the real paper is. Some are multiple select — every pick must be right to score. About two and a half minutes a question.'
  },
  {
    id: 'real',
    name: 'Real-length Exam',
    tagline: '50–60 questions · 2 hours',
    minutes: 120,
    /** The real paper is 50–60 questions, so this draws a different length every sitting. */
    blueprint: {
      design: [10, 12],
      provisioning: [7, 8],
      security: [7, 8],
      processes: [5, 6],
      implementation: [5, 6],
      operations: [5, 6],
      cases: [11, 14]
    },
    description:
      'Google hands out between 50 and 60 questions in two hours, so this draws a different number in that range every sitting, in the guide\'s section weights and with a fifth to a quarter from the case studies. The closest thing to the real clock pressure.'
  },
  {
    id: 'cases',
    name: 'Case Study Exam',
    tagline: '25 questions · 1 hour',
    minutes: 60,
    blueprint: { cases: 25 },
    description:
      '25 case-study questions in an hour, from all four case studies. The renewal exam is built the same way around a single gen-AI case study, and the full paper uses two — read the case studies first, then sit this until the requirement-to-product mapping is automatic.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 20,
    blueprint: { design: 3, provisioning: 2, security: 2, processes: 2, implementation: 1, operations: 1, cases: 4 },
    description: '15 mixed questions in 20 minutes, including four from the case studies. Good for a daily rep.'
  }
];

export const pca = defineExam({
  id: 'pca',
  storagePrefix: 'pca',
  name: 'Professional Cloud Architect',
  subtitle: 'Google Cloud Certification Prep',
  short: 'PCA',
  tagline: 'Google Cloud · professional certification',
  blurb:
    'A timed simulator for Google\'s architecture certification: 50–60 scenario questions in two hours on designing, securing and running solutions, with two of the four current case studies in every paper. 306 original questions, each with an explanation, written to the current guide and 2026 product names.',
  icon: 'CA',
  fullModeId: 'full',
  mixed: true,
  drillMin: 5,
  sections: SECTIONS,
  modes: MODES,
  /** Six fixed practice exams of 51, each with two case studies — see sets.ts. */
  sets,
  setMinutesPerQuestion: 2.4,
  home: {
    eyebrow: 'Google Cloud · Professional Cloud Architect',
    title: 'Design for the business,\nnot just for the cloud.',
    lede:
      'Six sections — <strong>design and planning, provisioning, security and compliance, processes, implementation, and operations</strong> — in 50 to 60 scenario questions over two hours, with two of the four case studies making up 20–30% of the paper. The right answer is usually the one that meets the stated business requirement with the least to run.',
    startLabel: 'Start the 2-hour exam',
    aboutLabel: 'What is on the exam?',
    sectionsTitle: 'The six exam-guide sections, and the case studies',
    extraNote:
      'Design and planning is a quarter of the paper on its own. Case-study questions draw on every section; read the four case studies before you sit them, then drill each one separately.'
  },
  verdict(percent) {
    if (percent >= 85)
      return {
        title: 'Ready to book it',
        note: 'Scores like this on mixed papers mean the requirement-to-architecture reasoning is solid. Re-read the four case studies, sit one more full paper under strict time, and schedule the exam.'
      };
    if (percent >= 70)
      return {
        title: 'Around the bar — tighten the weak section',
        note: 'Find your lowest section below. On this paper the gaps are usually security and compliance details or the case studies, where one requirement decides between two good designs.'
      };
    if (percent >= 50)
      return {
        title: 'The products are there, the trade-offs are not',
        note: 'You recognise the services but pick answers that over-engineer or miss a constraint. Read every explanation, and before choosing, name the requirement the question is really testing.'
      };
    return {
      title: 'Work section by section first',
      note: 'Take each section untimed with the cheat sheet open, then the case studies one at a time. This exam rewards knowing why one design beats another, not memorising commands.'
    };
  },
  footer:
    'An unofficial practice tool built for personal preparation. Not affiliated with, endorsed by, or produced by Google LLC. Section weights and case-study names come from Google\'s published exam guide; the case studies are summarised in our own words with links to Google\'s originals. Every question is original, written to the guide.',
  focusTopicIds: [],
  cheatsheet,
  /** Command reference and plain-language concepts, as extra tabs. */
  extraSheets: GOOGLE_CLOUD_SHEETS,
  lab: true,
  lessons: PCA_LESSONS
});
