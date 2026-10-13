import { defineExam } from '@/core';
import { logic } from './questions/logic.js';
import { figural } from './questions/figural.js';
import { inductive } from './questions/inductive.js';
import { programming } from './questions/programming.js';
import { oop } from './questions/oop.js';
import { design } from './questions/design.js';

/**
 * The two parts the real paper is split into for the Tech division:
 * Section 1 — Logic Test, Section 2 — Programming Test, 120 minutes in total.
 * Sections of the bank map onto a part; the ones with no `partId` (inductive
 * reasoning, design) are extra practice that the Tech paper does not include.
 */
const PARTS = [
  {
    id: 'logic-test',
    number: 1,
    name: 'Logic Test',
    blurb:
      'Written and picture-based reasoning, mixed together. Applicants describe it as very close to an IQ test.'
  },
  {
    id: 'programming-test',
    number: 2,
    name: 'Programming Test',
    blurb:
      'Variables and data types, if-else, loops, output prediction and OOP concepts. Applicants call the level "still very learnable" even without an IT background.'
  }
];

/**
 * Section metadata. `partId` says which half of the real paper a section
 * belongs to; on the paper itself the two sections inside a part are not
 * separated, which is why `buildPaper` mixes them.
 */
const SECTIONS = [
  {
    id: 'logic',
    partId: 'logic-test',
    name: 'Logic & Reasoning',
    short: 'Logic',
    icon: '◇',
    blurb:
      'Number and letter series in the style of SNBT quantitative reasoning, syllogisms, analogies, odd-one-out, probability, and seating-and-ordering puzzles with conditional constraints. Applicants describe this part as feeling like an IQ test.',
    questions: logic
  },
  {
    id: 'figural',
    partId: 'logic-test',
    name: 'Visual & Figural Reasoning',
    short: 'Visual',
    icon: '▣',
    blurb:
      'The picture half of the logic block: matrix puzzles, shape series, rotations and mirrors, odd-one-out, folded paper and cube nets. On the real paper these are mixed in with the written logic questions.',
    questions: figural
  },
  {
    id: 'inductive',
    name: 'Inductive Reasoning',
    short: 'Inductive',
    icon: '⠿',
    blurb:
      'The hardest picture format: a 3×3 grid of symbols with one cell missing and twelve candidate tiles. Two rules run at once — one down the rows, one across the columns — and with twelve options, guessing is close to worthless.',
    questions: inductive
  },
  {
    id: 'programming',
    partId: 'programming-test',
    name: 'Programming Fundamentals',
    short: 'Programming',
    icon: '{ }',
    blurb:
      'Language-agnostic pseudocode plus some Swift. Variables, data types, conditionals, loops, arrays, recursion, complexity, and a little Git, terminal and backend.',
    questions: programming
  },
  {
    id: 'oop',
    partId: 'programming-test',
    name: 'Object-Oriented Programming',
    short: 'OOP',
    icon: '◻︎',
    blurb:
      'The four pillars, constructors, inheritance, polymorphism, protocols, access control and value vs reference types.',
    questions: oop
  },
  {
    id: 'design',
    name: 'Design, UX & Product',
    short: 'Design',
    icon: '✳︎',
    blurb:
      'Not on the Tech-division paper — kept as optional practice. Design thinking, usability, accessibility, Apple’s Human Interface Guidelines, product sense and Challenge Based Learning. Useful for the group interview, and for the Design category paper.',
    questions: design
  }
];

/**
 * Test presets. The Tech-division paper is two sections in 120 minutes — Logic
 * then Programming — with no design or product block, so that is the shape the
 * presets follow; the shorter ones are the same paper scaled down.
 */
const MODES = [
  {
    id: 'tech',
    name: 'Tech Division · Full Test',
    tagline: '50 questions · 120 minutes',
    minutes: 120,
    blueprint: { logic: 25, figural: 10, programming: 10, oop: 5 },
    description:
      '50 questions in 120 minutes, in the real running order: 35 in Section 1 Logic, then 15 in Section 2 Programming. That is roughly 2½ minutes a question, so the clock is not the hard part — the reasoning is. No design questions. This is the one to sit under exam conditions.'
  },
  {
    id: 'half',
    name: 'Half Sitting',
    tagline: 'Same shape, half the clock',
    minutes: 60,
    blueprint: { logic: 13, figural: 5, programming: 5, oop: 2 },
    description:
      '25 questions in 60 minutes — the full paper cut in half, section for section. For a weeknight rep when two hours is too much.'
  },
  {
    id: 'quick',
    name: 'Quick Drill',
    tagline: 'A short warm-up',
    minutes: 12,
    blueprint: { logic: 7, figural: 3, programming: 3, oop: 2 },
    description: '15 mixed questions in 12 minutes, in the same 7:3 ratio as the real paper. Good for a daily rep.'
  },
  {
    id: 'inductive',
    name: 'Inductive Reasoning',
    tagline: 'Grid of symbols · 12 options',
    minutes: 11,
    blueprint: { inductive: 10 },
    description:
      '10 questions in 11 minutes, in the AssessmentDay / Talent Q format: a grid of symbols with one cell missing and twelve possible answers. Deliberately kept out of the Academy presets, which applicants describe as four-option questions.'
  }
];

export const apple = defineExam({
  id: 'apple',
  /** localStorage prefix — kept as the original key so existing history survives. */
  storagePrefix: 'ada',
  name: 'Apple Developer Academy',
  subtitle: 'Online Test Simulator',
  short: 'Academy',
  tagline: 'Indonesia · Tech division entry test',
  blurb:
    'A timed simulator for the 120-minute online entry test: 35 logic questions, written and picture-based, then 15 on programming and OOP.',
  icon: 'A',
  fullModeId: 'tech',
  parts: PARTS,
  sections: SECTIONS,
  modes: MODES,
  home: {
    eyebrow: 'Apple Developer Academy Indonesia · Tech division',
    title: 'Sit the online entry test\nbefore you sit the real one.',
    lede:
      '50 questions in 120 minutes, two sections — <strong>35 in Section 1 Logic</strong>, written <em>and</em> picture-based, then <strong>15 in Section 2 Programming</strong>, pseudocode and object-oriented programming. No design questions: the Tech paper does not ask them.',
    startLabel: 'Start the 120-minute test',
    aboutLabel: 'What is on the test?',
    extraNote:
      'Not on the Tech-division paper. The inductive grids are the hardest training there is for the picture questions; the design set is for the group interview and the Design category.'
  },
  verdict(percent) {
    if (percent >= 85)
      return {
        title: 'Comfortably above the bar',
        note: 'This is the range where the test stops being the thing standing between you and the next stage. Keep the streak going and spend your remaining time on the CV, portfolio and motivation letter — the Academy weighs those heavily too.'
      };
    if (percent >= 70)
      return {
        title: 'Solid, with room to tighten',
        note: 'You are answering most of the paper correctly. Look at your weakest section below and drill it until the mistakes stop being about the concept and start being about speed.'
      };
    if (percent >= 50)
      return {
        title: 'The foundation is there',
        note: 'You know a good part of the material but the gaps are costing real marks. Work through the explanations for every question you missed, then take a section drill on your weakest area.'
      };
    return {
      title: 'Worth going back to fundamentals',
      note: 'Rather than sitting another full paper immediately, drill single sections untimed and read every explanation. Speed comes after accuracy.'
    };
  },
  footer:
    'An unofficial practice tool built for personal preparation. Not affiliated with, endorsed by, or produced by Apple Inc. or the Apple Developer Academy.',
  /** The topics that must stay drillable — the validator fails if one goes thin. */
  focusTopicIds: [
    'logic:Number series',
    'logic:Arithmetic reasoning',
    'logic:Probability',
    'logic:Blood relations'
  ]
});
