/**
 * Section 1 — Logic & Reasoning
 * The largest section of the real Online Test. Candidates describe it as
 * "very close to an IQ test": number/letter series, syllogisms, analogies,
 * odd-one-out, arithmetic reasoning and small deduction puzzles.
 */

import type { Question } from '@/types';

export const logic: Question[] = [
  {
    id: 'log-01',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next in the series?\n\n2, 6, 12, 20, 30, ?',
    options: ['38', '40', '42', '44'],
    answer: 2,
    explanation:
      'The gaps grow by 2 each time: +4, +6, +8, +10. The next gap is +12, so 30 + 12 = 42.'
  },
  {
    id: 'log-02',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next in the series?\n\n3, 6, 11, 18, 27, ?',
    options: ['36', '38', '39', '40'],
    answer: 1,
    explanation: 'Differences are the odd numbers 3, 5, 7, 9. The next is 11, so 27 + 11 = 38.'
  },
  {
    id: 'log-03',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n1, 1, 2, 3, 5, 8, 13, ?',
    options: ['18', '20', '21', '26'],
    answer: 2,
    explanation: 'This is the Fibonacci sequence — each term is the sum of the two before it: 8 + 13 = 21.'
  },
  {
    id: 'log-04',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n2, 3, 5, 7, 11, 13, ?',
    options: ['15', '17', '19', '21'],
    answer: 1,
    explanation: 'These are consecutive prime numbers. After 13 comes 17 (15 = 3 × 5 is not prime).'
  },
  {
    id: 'log-05',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next?\n\n1, 2, 6, 24, 120, ?',
    options: ['240', '360', '600', '720'],
    answer: 3,
    explanation: 'Each term is multiplied by the next integer (×2, ×3, ×4, ×5). So 120 × 6 = 720. These are the factorials.'
  },
  {
    id: 'log-06',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next?\n\n5, 11, 23, 47, ?',
    options: ['71', '82', '94', '95'],
    answer: 3,
    explanation: 'Each term is doubled and increased by 1: 5×2+1 = 11, 11×2+1 = 23, 23×2+1 = 47, 47×2+1 = 95.'
  },
  {
    id: 'log-07',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next in this alternating series?\n\n3, 7, 6, 10, 9, 13, 12, ?',
    options: ['11', '14', '15', '16'],
    answer: 3,
    explanation: 'The pattern alternates +4, −1, +4, −1 … After 12 the next step is +4, giving 16.'
  },
  {
    id: 'log-08',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number is missing?\n\n4, 9, 19, 39, ?, 159',
    options: ['59', '69', '79', '89'],
    answer: 2,
    explanation: 'Each term is doubled and increased by 1: 39 × 2 + 1 = 79, and 79 × 2 + 1 = 159 confirms it.'
  },
  {
    id: 'log-09',
    topic: 'Letter series',
    difficulty: 'medium',
    prompt: 'Which letter comes next?\n\nA, C, F, J, O, ?',
    options: ['S', 'T', 'U', 'V'],
    answer: 2,
    explanation:
      'The step grows by one each time: A(+2)C(+3)F(+4)J(+5)O. The next step is +6, and O is the 15th letter, so 15 + 6 = 21 → U.'
  },
  {
    id: 'log-10',
    topic: 'Letter series',
    difficulty: 'easy',
    prompt: 'Which letter comes next?\n\nZ, X, V, T, ?',
    options: ['S', 'R', 'Q', 'P'],
    answer: 1,
    explanation: 'The series skips one letter backwards each time (Z, X, V, T), so the next is R.'
  },
  {
    id: 'log-11',
    topic: 'Letter series',
    difficulty: 'hard',
    prompt: 'Which letter comes next?\n\nB, D, G, K, P, ?',
    options: ['T', 'U', 'V', 'W'],
    answer: 2,
    explanation:
      'Positions are 2, 4, 7, 11, 16 — the steps are +2, +3, +4, +5. The next step is +6, so 16 + 6 = 22 → V.'
  },
  {
    id: 'log-12',
    topic: 'Coding & decoding',
    difficulty: 'easy',
    prompt: 'In a certain code MOBILE is written as NPCJMF. How is APPLE written in the same code?',
    options: ['BQQMF', 'BQPMF', 'ZOOKD', 'BRRNG'],
    answer: 0,
    explanation: 'Every letter moves forward one position in the alphabet. A→B, P→Q, P→Q, L→M, E→F gives BQQMF.'
  },
  {
    id: 'log-13',
    topic: 'Coding & decoding',
    difficulty: 'medium',
    prompt:
      'If SWIFT is coded as TXJGU, how is XCODE coded in the same system?',
    options: ['YDPEF', 'WBNCD', 'YDQFF', 'ZEQGG'],
    answer: 0,
    explanation: 'Each letter is shifted +1. X→Y, C→D, O→P, D→E, E→F gives YDPEF.',
    tip:
      'Check whether the shift is uniform across all letters. If it is not, the pattern is probably alternating.'
  },
  {
    id: 'log-14',
    topic: 'Coding & decoding',
    difficulty: 'medium',
    prompt:
      'In a code language, "pen tab lok" means "apples are sweet", "tab mor sun" means "oranges are sour", and "lok sun rid" means "sweet sour drink". Which word means "sour"?',
    options: ['tab', 'lok', 'sun', 'mor'],
    answer: 2,
    explanation:
      '"sour" appears in phrases 2 and 3. The only word common to both is "sun" (phrase 2: tab mor sun, phrase 3: lok sun rid).'
  },
  {
    id: 'log-15',
    topic: 'Syllogism',
    difficulty: 'medium',
    prompt:
      'Statements:\n1. All developers are problem solvers.\n2. Some problem solvers are designers.\n\nWhich conclusion definitely follows?',
    options: [
      'Some developers are designers.',
      'All problem solvers are developers.',
      'Some problem solvers are developers.',
      'No designer is a developer.'
    ],
    answer: 2,
    explanation:
      'From "all developers are problem solvers" it follows that at least some problem solvers are developers. Nothing links developers to designers, so the overlap in statement 2 may sit entirely outside the developer group.'
  },
  {
    id: 'log-16',
    topic: 'Syllogism',
    difficulty: 'easy',
    prompt:
      'Statements:\n1. All Swift files are source files.\n2. No source file is an image.\n\nWhich conclusion definitely follows?',
    options: [
      'Some Swift files are images.',
      'No Swift file is an image.',
      'All source files are Swift files.',
      'Some images are source files.'
    ],
    answer: 1,
    explanation:
      'Swift files sit entirely inside source files, and source files are entirely separate from images. So no Swift file can be an image.'
  },
  {
    id: 'log-17',
    topic: 'Syllogism',
    difficulty: 'easy',
    prompt:
      'Statements:\n1. Some students are engineers.\n2. All engineers are graduates.\n\nWhich conclusion definitely follows?',
    options: [
      'All students are graduates.',
      'Some students are graduates.',
      'All graduates are engineers.',
      'No student is a graduate.'
    ],
    answer: 1,
    explanation:
      'The students who are engineers must also be graduates, so at least some students are graduates. Nothing is known about the rest.'
  },
  {
    id: 'log-18',
    topic: 'Propositional logic',
    difficulty: 'medium',
    prompt:
      '"If it rains, the outdoor demo is cancelled."\nThe outdoor demo was NOT cancelled.\n\nWhat can you conclude?',
    options: [
      'It rained.',
      'It did not rain.',
      'It may or may not have rained.',
      'The demo was rescheduled.'
    ],
    answer: 1,
    explanation:
      'This is modus tollens: if P → Q and Q is false, then P must be false. Since the demo was not cancelled, it did not rain.',
    tip:
      'Only two moves are valid: P true means Q true, and Q false means P false. Everything else is undetermined.'
  },
  {
    id: 'log-19',
    topic: 'Propositional logic',
    difficulty: 'medium',
    prompt:
      'What is the contrapositive of: "If a user is a premium subscriber, then they see no ads."?',
    options: [
      'If a user sees no ads, then they are a premium subscriber.',
      'If a user is not a premium subscriber, then they see ads.',
      'If a user sees ads, then they are not a premium subscriber.',
      'If a user sees ads, then they are a premium subscriber.'
    ],
    answer: 2,
    explanation:
      'The contrapositive of P → Q is ¬Q → ¬P, and it is always logically equivalent to the original. "Sees ads" (¬Q) implies "not premium" (¬P).'
  },
  {
    id: 'log-20',
    topic: 'Propositional logic',
    difficulty: 'medium',
    prompt: 'What is the correct negation of "All bugs are reproducible"?',
    options: [
      'No bug is reproducible.',
      'All bugs are irreproducible.',
      'At least one bug is not reproducible.',
      'Some bugs are reproducible.'
    ],
    answer: 2,
    explanation:
      'The negation of a universal claim ("all A are B") is an existential one: there exists at least one A that is not B. It does not claim anything about the rest.'
  },
  {
    id: 'log-21',
    topic: 'Analogy',
    difficulty: 'easy',
    prompt: 'Class : Object :: Blueprint : ?',
    options: ['Architect', 'Building', 'Paper', 'Design'],
    answer: 1,
    explanation:
      'A class is the template from which objects are made, exactly as a blueprint is the template from which a building is made.'
  },
  {
    id: 'log-22',
    topic: 'Analogy',
    difficulty: 'medium',
    prompt: 'Bug : Program :: Symptom : ?',
    options: ['Doctor', 'Medicine', 'Disease', 'Patient'],
    answer: 2,
    explanation:
      'A bug is an observable defect that reveals a problem in a program, just as a symptom is an observable sign that reveals a disease.'
  },
  {
    id: 'log-23',
    topic: 'Analogy',
    difficulty: 'medium',
    prompt: 'Compiler : Source Code :: Chef : ?',
    options: ['Kitchen', 'Ingredients', 'Restaurant', 'Recipe'],
    answer: 1,
    explanation:
      'A compiler takes source code as its raw input and transforms it into something executable; a chef takes ingredients as raw input and transforms them into a dish.'
  },
  {
    id: 'log-24',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which one does not belong with the others?',
    options: ['Swift', 'Kotlin', 'Python', 'Xcode'],
    answer: 3,
    explanation: 'Swift, Kotlin and Python are programming languages. Xcode is an IDE — a tool, not a language.'
  },
  {
    id: 'log-25',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which number does not belong?\n\n8, 27, 64, 100, 125',
    options: ['27', '64', '100', '125'],
    answer: 2,
    explanation: 'All the others are perfect cubes (2³, 3³, 4³, 5³). 100 is a perfect square but not a cube.'
  },
  {
    id: 'log-26',
    topic: 'Odd one out',
    difficulty: 'medium',
    prompt: 'Which number does not belong?\n\n121, 144, 169, 196, 200',
    options: ['144', '169', '196', '200'],
    answer: 3,
    explanation: 'All the others are perfect squares (11², 12², 13², 14²). 200 is not.',
    tip:
      'When a set contains tidy three-digit numbers, check whether they are all perfect squares.'
  },
  {
    id: 'log-27',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which one does not belong with the others?',
    options: ['Circle', 'Square', 'Triangle', 'Cube'],
    answer: 3,
    explanation: 'A cube is a three-dimensional solid; the rest are two-dimensional shapes.'
  },
  {
    id: 'log-28',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'A team of 6 developers finishes a feature in 12 days. Working at the same rate, how long would 8 developers take?',
    options: ['8 days', '9 days', '10 days', '16 days'],
    answer: 1,
    explanation:
      'The total work is 6 × 12 = 72 developer-days. Divided among 8 developers: 72 ÷ 8 = 9 days.'
  },
  {
    id: 'log-29',
    topic: 'Arithmetic reasoning',
    difficulty: 'hard',
    prompt:
      'If 3 machines make 3 widgets in 3 minutes, how long do 100 machines take to make 100 widgets?',
    options: ['3 minutes', '33 minutes', '100 minutes', '300 minutes'],
    answer: 0,
    explanation:
      'Each machine makes 1 widget in 3 minutes. 100 machines working in parallel each make 1 widget in the same 3 minutes.'
  },
  {
    id: 'log-30',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'An app subscription costs Rp 120,000 after a 20% discount. What was the original price?',
    options: ['Rp 140,000', 'Rp 144,000', 'Rp 150,000', 'Rp 160,000'],
    answer: 2,
    explanation:
      'Rp 120,000 represents 80% of the original price. Original = 120,000 ÷ 0.8 = Rp 150,000.'
  },
  {
    id: 'log-31',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt:
      'A student averages 78 across 4 tests. After a fifth test scoring 88, what is the new average?',
    options: ['79', '80', '82', '83'],
    answer: 1,
    explanation: 'The first four tests total 4 × 78 = 312. Adding 88 gives 400, and 400 ÷ 5 = 80.'
  },
  {
    id: 'log-32',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt: 'An app grows from 250 to 300 daily users. What is the percentage increase?',
    options: ['16.7%', '20%', '25%', '50%'],
    answer: 1,
    explanation: 'The increase is 50 users on a base of 250. 50 ÷ 250 = 0.2 = 20%.'
  },
  {
    id: 'log-33',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'In a cohort the ratio of designers to developers is 3 : 5. If there are 64 people in total, how many are developers?',
    options: ['24', '32', '40', '45'],
    answer: 2,
    explanation: 'The ratio has 3 + 5 = 8 parts, so one part is 64 ÷ 8 = 8 people. Developers = 5 × 8 = 40.'
  },
  {
    id: 'log-34',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'One pipe fills a tank in 6 hours, another fills the same tank in 3 hours. Working together, how long do they take?',
    options: ['1.5 hours', '2 hours', '2.5 hours', '4.5 hours'],
    answer: 1,
    explanation:
      'Combined rate = 1/6 + 1/3 = 1/2 tank per hour. The tank therefore takes 2 hours.'
  },
  {
    id: 'log-35',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt: 'A train covers 180 km in 2 hours 30 minutes. What is its average speed?',
    options: ['64 km/h', '70 km/h', '72 km/h', '75 km/h'],
    answer: 2,
    explanation: 'Speed = distance ÷ time = 180 ÷ 2.5 = 72 km/h.'
  },
  {
    id: 'log-36',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'In a class of 40 students, 25 own an iPhone, 20 own a MacBook, and 10 own both. How many own neither?',
    options: ['0', '5', '10', '15'],
    answer: 1,
    explanation:
      'Students owning at least one device = 25 + 20 − 10 = 35. So 40 − 35 = 5 own neither.'
  },
  {
    id: 'log-37',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'Of 60 applicants, 35 took a Swift course and 30 took a Design course. 12 took both. How many took Swift only?',
    options: ['18', '20', '23', '25'],
    answer: 2,
    explanation: 'Swift only = 35 − 12 = 23.'
  },
  {
    id: 'log-38',
    topic: 'Direction sense',
    difficulty: 'easy',
    prompt:
      'You walk 5 km north, then 3 km east, then 5 km south. How far are you from your starting point?',
    options: ['0 km', '3 km', '5 km', '13 km'],
    answer: 1,
    explanation:
      'The 5 km north and 5 km south cancel out, leaving only the 3 km eastward displacement.'
  },
  {
    id: 'log-39',
    topic: 'Direction sense',
    difficulty: 'medium',
    prompt:
      'You are facing north. You turn 90° clockwise twice, then 90° counter-clockwise once. Which direction are you facing?',
    options: ['North', 'East', 'South', 'West'],
    answer: 1,
    explanation:
      'North → (clockwise) East → (clockwise) South → (counter-clockwise) East.'
  },
  {
    id: 'log-40',
    topic: 'Ordering puzzle',
    difficulty: 'medium',
    prompt:
      'P scored higher than Q. R scored lower than Q but higher than S. T scored higher than P.\n\nWho scored the lowest?',
    options: ['P', 'Q', 'R', 'S'],
    answer: 3,
    explanation: 'The full order is T > P > Q > R > S, so S is lowest.'
  },
  {
    id: 'log-41',
    topic: 'Ordering puzzle',
    difficulty: 'hard',
    prompt:
      'Five buildings stand in a row, numbered 1 to 5 from left to right.\n• The bank is at number 1.\n• The park is at number 5.\n• The library is not at either end.\n• The gym is immediately to the left of the library.\n• The café is immediately to the right of the library.\n\nWhich number is the café?',
    options: ['2', '3', '4', '5'],
    answer: 2,
    explanation:
      'The bank takes 1 and the park takes 5, so the gym, library and café fill 2–4 in that order. The library is 3 and the café is 4.'
  },
  {
    id: 'log-42',
    topic: 'Truth & lies',
    difficulty: 'hard',
    prompt:
      'A says: "B is lying."\nB says: "C is lying."\nC says: "A and B are both lying."\n\nWho is telling the truth?',
    options: ['A only', 'B only', 'C only', 'A and C'],
    answer: 1,
    explanation:
      'If C were truthful, A would be lying, which would make B truthful — contradicting C. So C lies. If A were truthful then B lies, making C truthful — contradiction again. So A lies, which means B is truthful, and B correctly says C is lying. Only B tells the truth.',
    tip:
      'Test each possibility one at a time until one produces no contradiction. This is the only reliable method.'
  },
  {
    id: 'log-43',
    topic: 'Matrix pattern',
    difficulty: 'medium',
    prompt:
      'Find the missing number.\n\n| 2 | 3 | 6  |\n| 4 | 5 | 20 |\n| 6 | 7 | ?  |',
    options: ['13', '36', '42', '48'],
    answer: 2,
    explanation:
      'The third column is the product of the first two: 2 × 3 = 6, 4 × 5 = 20, so 6 × 7 = 42.',
    tip:
      'For a matrix, read across the rows first. If nothing fits, read down the columns, then try the diagonals.'
  },
  {
    id: 'log-44',
    topic: 'Spatial reasoning',
    difficulty: 'medium',
    prompt:
      'A shape sequence goes: triangle, square, pentagon, hexagon, … How many sides does the 7th shape have?',
    options: ['7', '8', '9', '10'],
    answer: 2,
    explanation:
      'The first shape has 3 sides and each shape adds one. The 7th shape has 3 + 6 = 9 sides.'
  },
  {
    id: 'log-45',
    topic: 'Spatial reasoning',
    difficulty: 'hard',
    prompt:
      'A wooden cube is painted red on all six faces, then cut into 27 identical smaller cubes. How many small cubes have exactly two red faces?',
    options: ['6', '8', '12', '18'],
    answer: 2,
    explanation:
      'Cubes with exactly two painted faces sit along the edges but not at corners. A 3×3×3 cube has 12 edges with exactly one such cube each, so 12.'
  },
  {
    id: 'log-46',
    topic: 'Clocks',
    difficulty: 'medium',
    prompt: 'What is the angle between the hour and minute hands at 3:30?',
    options: ['65°', '70°', '75°', '90°'],
    answer: 2,
    explanation:
      'The minute hand is at 180°. The hour hand is at 3 × 30 + 30 × 0.5 = 105°. The difference is 75°.'
  },
  {
    id: 'log-47',
    topic: 'Calendars',
    difficulty: 'medium',
    prompt: 'If 1 January 2024 was a Monday, what day was 1 February 2024?',
    options: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    answer: 2,
    explanation:
      'January has 31 days, and 31 ÷ 7 leaves a remainder of 3. Three days after Monday is Thursday.'
  },
  {
    id: 'log-48',
    topic: 'Probability',
    difficulty: 'medium',
    prompt:
      'A bag holds 3 red and 2 blue marbles. You draw one marble at random. What is the probability it is blue?',
    options: ['1/5', '2/5', '1/2', '3/5'],
    answer: 1,
    explanation: 'There are 2 blue marbles out of 5 total, so the probability is 2/5.'
  },
  {
    id: 'log-49',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing at a photograph, a man says: "She is the daughter of my grandfather\'s only son." How is she related to him?',
    options: ['His daughter', 'His sister', 'His cousin', 'His niece'],
    answer: 1,
    explanation:
      "His grandfather's only son is his own father. The father's daughter is therefore his sister."
  },
  {
    id: 'log-50',
    topic: 'Deduction',
    difficulty: 'hard',
    prompt:
      'Four cards on a table show: A, K, 4, 7. Each card has a letter on one side and a number on the other. To test the rule "if a card has a vowel on one side, it has an even number on the other", which cards must you turn over?',
    options: ['A and 4', 'A and 7', 'A, K and 7', 'A, 4 and 7'],
    answer: 1,
    explanation:
      'Turn A to check it has an even number. Turn 7 because a vowel behind it would break the rule. K is irrelevant (the rule says nothing about consonants) and 4 cannot falsify the rule whatever is behind it.'
  },
  {
    id: 'log-51',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Five friends — P, Q, R, S and T — sit in a row of five chairs, all facing north.\n\n• S sits exactly in the middle.\n• R sits immediately to the right of P.\n• Q sits at one of the two ends.\n• T sits immediately to the right of Q.\n\nWho sits at the far right end?',
    options: ['P', 'R', 'S', 'T'],
    answer: 1,
    explanation:
      'S holds chair 3, so the P–R pair can only take chairs 1–2 or 4–5. If they took 1–2, then Q and T would take chairs 4 and 5; Q must be at an end, so Q would be chair 5 — leaving no chair to its right for T. So P and R take chairs 4 and 5, Q takes chair 1 and T chair 2: Q, T, S, P, R. R is at the far right.'
  },
  {
    id: 'log-52',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Five candidates are interviewed from Monday to Friday, one per day.\n\n• Citra is interviewed before Nadia, and Nadia before Bima.\n• Dewi is interviewed on Friday.\n• Citra is not interviewed on Monday.\n\nWho is interviewed on Monday?',
    options: ['Citra', 'Nadia', 'Eka', 'Bima'],
    answer: 2,
    explanation:
      'Dewi takes Friday, so Citra, Nadia and Bima sit inside Monday–Thursday in that order. Citra cannot be Monday, so the only run that fits is Citra Tuesday, Nadia Wednesday, Bima Thursday — which leaves Monday for Eka.'
  },
  {
    id: 'log-53',
    topic: 'Probability',
    difficulty: 'medium',
    prompt: 'Two fair six-sided dice are rolled. What is the probability that the total is 7?',
    options: ['1/6', '1/9', '5/36', '1/12'],
    answer: 0,
    explanation:
      'Six of the 36 equally likely pairs total 7 — (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) — so the probability is 6/36 = 1/6. Seven is the most likely total on two dice.'
  },
  {
    id: 'log-54',
    topic: 'Probability',
    difficulty: 'hard',
    prompt:
      'A box holds 4 red pens and 6 blue pens. Two pens are drawn one after the other, without putting the first back. What is the probability that both are red?',
    options: ['2/15', '4/25', '1/6', '3/20'],
    answer: 0,
    explanation:
      'The first draw is red with probability 4/10. After it, 3 red pens remain out of 9, so the second is red with probability 3/9. Multiply: 4/10 × 3/9 = 12/90 = 2/15. Drawing without replacement is what makes the second fraction change.'
  },
  {
    id: 'log-55',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n7, 14, 28, 56, ?',
    options: ['84', '96', '112', '120'],
    answer: 2,
    explanation:
      'Every term is double the one before it, so the step keeps growing: 56 × 2 = 112. Looking for a constant difference here leads you to 84.'
  },
  {
    id: 'log-56',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n1, 4, 9, 16, 25, ?',
    options: ['30', '32', '36', '49'],
    answer: 2,
    explanation:
      'These are the square numbers 1², 2², 3², 4², 5², so the next is 6² = 36. 49 is the square after that — the trap if you count the position wrong.'
  },
  {
    id: 'log-57',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next?\n\n100, 96, 88, 76, 60, ?',
    options: ['36', '40', '44', '48'],
    answer: 1,
    explanation:
      'The amount subtracted grows by 4 each time: −4, −8, −12, −16, so the next step is −20. 60 − 20 = 40.'
  },
  {
    id: 'log-58',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next?\n\n1, 5, 2, 10, 3, 15, ?',
    options: ['4', '6', '20', '25'],
    answer: 0,
    explanation:
      'Two series are interleaved. The odd positions count 1, 2, 3, … and the even positions run 5, 10, 15, …. The next term sits in an odd position, so it is 4.'
  },
  {
    id: 'log-59',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n1, 3, 6, 10, 15, ?',
    options: ['18', '20', '21', '24'],
    answer: 2,
    explanation:
      'The differences are 2, 3, 4, 5, so the next is 6: 15 + 6 = 21. These are the triangular numbers — worth recognising on sight.'
  },
  {
    id: 'log-60',
    topic: 'Number series',
    difficulty: 'easy',
    prompt: 'What number comes next?\n\n729, 243, 81, 27, ?',
    options: ['3', '9', '12', '18'],
    answer: 1,
    explanation: 'Each term is the previous one divided by 3. 27 ÷ 3 = 9.'
  },
  {
    id: 'log-61',
    topic: 'Number series',
    difficulty: 'medium',
    prompt: 'What number comes next?\n\n3, 4, 7, 11, 18, 29, ?',
    options: ['40', '45', '47', '50'],
    answer: 2,
    explanation:
      'Each term is the sum of the two before it — a Fibonacci-style rule with a different starting pair: 18 + 29 = 47.'
  },
  {
    id: 'log-62',
    topic: 'Number series',
    difficulty: 'hard',
    prompt: 'What number is missing?\n\n8, 12, 20, 36, ?, 132',
    options: ['64', '68', '72', '76'],
    answer: 1,
    explanation:
      'The differences double each step: +4, +8, +16, +32, +64. The missing term is 36 + 32 = 68, and 68 + 64 = 132 confirms it.'
  },
  {
    id: 'log-63',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'A jacket is priced at Rp 400,000. The shop takes 25% off, then adds 10% tax on the discounted price. What do you pay?',
    options: ['Rp 300,000', 'Rp 330,000', 'Rp 340,000', 'Rp 360,000'],
    answer: 1,
    explanation:
      '25% off 400,000 leaves 300,000. The tax is charged on that, not on the original price: 300,000 × 1.10 = 330,000. A percentage always applies to whatever the current amount is.'
  },
  {
    id: 'log-64',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt: 'A printer produces 45 pages a minute. How long does it take to print 1,080 pages?',
    options: ['22 minutes', '24 minutes', '26 minutes', '30 minutes'],
    answer: 1,
    explanation: '1,080 ÷ 45 = 24 minutes.'
  },
  {
    id: 'log-65',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'The average age of 5 students is 21. A sixth student joins and the average becomes 22. How old is the sixth student?',
    options: ['25', '26', '27', '28'],
    answer: 2,
    explanation:
      'Work with totals rather than averages: 5 × 21 = 105 and 6 × 22 = 132. The newcomer accounts for the difference, 132 − 105 = 27.'
  },
  {
    id: 'log-66',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt: 'A price rises by 20% and then falls by 20%. What is the net change?',
    options: ['Unchanged', 'Down 4%', 'Up 4%', 'Down 2%'],
    answer: 1,
    explanation:
      'The fall is taken from the larger amount: 1.20 × 0.80 = 0.96, so the price ends 4% below where it started. A rise and a fall of the same percentage never cancel out.'
  },
  {
    id: 'log-67',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt:
      'Rp 900,000 is divided between two people in the ratio 4 : 5. What is the larger share?',
    options: ['Rp 400,000', 'Rp 450,000', 'Rp 500,000', 'Rp 540,000'],
    answer: 2,
    explanation:
      'The ratio has 4 + 5 = 9 parts, so one part is 900,000 ÷ 9 = 100,000. The larger share is 5 parts = 500,000.'
  },
  {
    id: 'log-68',
    topic: 'Arithmetic reasoning',
    difficulty: 'hard',
    prompt:
      'A car drives 60 km at 60 km/h, then another 60 km at 30 km/h. What is its average speed for the whole journey?',
    options: ['35 km/h', '40 km/h', '45 km/h', '50 km/h'],
    answer: 1,
    explanation:
      'Average speed is total distance ÷ total time, never the average of the two speeds. The legs take 1 hour and 2 hours, so it is 120 km ÷ 3 h = 40 km/h. 45 km/h is the trap.'
  },
  {
    id: 'log-69',
    topic: 'Arithmetic reasoning',
    difficulty: 'easy',
    prompt:
      'A phone is bought for Rp 2,000,000 and sold for Rp 2,300,000. What is the profit as a percentage?',
    options: ['13%', '15%', '23%', '30%'],
    answer: 1,
    explanation:
      'The profit is 300,000, and profit percentage is measured against the cost price: 300,000 ÷ 2,000,000 = 15%.'
  },
  {
    id: 'log-70',
    topic: 'Arithmetic reasoning',
    difficulty: 'medium',
    prompt:
      'Ayu is three times as old as her brother. In 5 years she will be twice as old as he is. How old is Ayu now?',
    options: ['12', '15', '18', '20'],
    answer: 1,
    explanation:
      'Let the brother be b, so Ayu is 3b. In 5 years: 3b + 5 = 2(b + 5), which gives b = 5. Ayu is 3 × 5 = 15.'
  },
  {
    id: 'log-71',
    topic: 'Probability',
    difficulty: 'medium',
    prompt: 'Three fair coins are tossed. What is the probability of getting exactly two heads?',
    options: ['1/8', '1/4', '3/8', '1/2'],
    answer: 2,
    explanation:
      'There are 8 equally likely outcomes. Three of them have exactly two heads — HHT, HTH, THH — so the probability is 3/8.'
  },
  {
    id: 'log-72',
    topic: 'Probability',
    difficulty: 'easy',
    prompt:
      'A fair six-sided die is rolled. What is the probability of getting a number greater than 4?',
    options: ['1/6', '1/3', '1/2', '2/3'],
    answer: 1,
    explanation: 'Only 5 and 6 are greater than 4, so the probability is 2/6 = 1/3.'
  },
  {
    id: 'log-73',
    topic: 'Probability',
    difficulty: 'easy',
    prompt:
      'A bag holds 5 red, 3 green and 2 yellow balls. One ball is drawn at random. What is the probability that it is NOT red?',
    options: ['1/5', '3/10', '1/2', '2/5'],
    answer: 2,
    explanation:
      'There are 10 balls and 5 of them are red, so 5 are not: 5/10 = 1/2. Counting the complement is usually faster than adding the other colours up.'
  },
  {
    id: 'log-74',
    topic: 'Probability',
    difficulty: 'easy',
    prompt: 'Two fair coins are tossed. What is the probability of getting at least one head?',
    options: ['1/4', '1/2', '3/4', '1'],
    answer: 2,
    explanation:
      'The only outcome without a head is tails-tails, with probability 1/4. So at least one head has probability 1 − 1/4 = 3/4. "At least one" almost always means: work out the opposite and subtract it from 1.'
  },
  {
    id: 'log-75',
    topic: 'Probability',
    difficulty: 'medium',
    prompt:
      'A student passes maths with probability 0.8 and English with probability 0.6, and the two results are independent. What is the probability of passing both?',
    options: ['0.14', '0.48', '0.7', '1.4'],
    answer: 1,
    explanation:
      'Independent events that must both happen are multiplied: 0.8 × 0.6 = 0.48. Adding them gives 1.4, which is impossible for a probability — a useful sanity check.'
  },
  {
    id: 'log-76',
    topic: 'Probability',
    difficulty: 'medium',
    prompt:
      'Two fair six-sided dice are rolled. What is the probability that both show the same number?',
    options: ['1/12', '1/6', '5/36', '1/3'],
    answer: 1,
    explanation:
      'There are 36 equally likely pairs and 6 of them are doubles — (1,1) through (6,6) — so 6/36 = 1/6. Quicker still: the first die can be anything, and the second simply has to match it.'
  },
  {
    id: 'log-77',
    topic: 'Probability',
    difficulty: 'hard',
    prompt:
      'A box holds 3 blue and 5 red pens. Two are drawn one after the other without replacement. What is the probability that the first is blue and the second is red?',
    options: ['15/56', '15/64', '5/14', '3/8'],
    answer: 0,
    explanation:
      'The first draw is blue with probability 3/8. One pen is now gone, so 7 remain and 5 of them are red: 5/7. Multiply: 3/8 × 5/7 = 15/56. Using 8 again for the second draw gives 15/64, the trap answer.'
  },
  {
    id: 'log-78',
    topic: 'Probability',
    difficulty: 'hard',
    prompt:
      'Two names are drawn at random from a hat holding five names. What is the probability that one particular pair of names is the pair drawn?',
    options: ['1/10', '1/5', '2/5', '1/25'],
    answer: 0,
    explanation:
      'There are 5 × 4 ÷ 2 = 10 possible pairs, all equally likely, so one particular pair has probability 1/10. Dividing by 2 matters: the order of the two names does not count.'
  },
  {
    id: 'log-79',
    topic: 'Probability',
    difficulty: 'medium',
    prompt:
      'A spinner has eight equal sectors numbered 1 to 8. What is the probability of landing on a prime number?',
    options: ['3/8', '1/2', '5/8', '4/7'],
    answer: 1,
    explanation:
      'The primes up to 8 are 2, 3, 5 and 7 — four of the eight sectors, so 4/8 = 1/2. Remember that 1 is not prime and 2 is.'
  },
  {
    id: 'log-80',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing to a woman, Rudi says, "She is the only daughter of my mother’s only sister." How is she related to Rudi?',
    options: ['His sister', 'His cousin', 'His niece', 'His aunt'],
    answer: 1,
    explanation:
      'His mother’s sister is his aunt, and the aunt’s daughter is his cousin. Walk the chain one link at a time: mother → her sister → her daughter.'
  },
  {
    id: 'log-81',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'A is B’s brother. C is A’s mother. D is C’s father. How is B related to D?',
    options: ["D's grandchild", "D's child", "D's nephew or niece", "D's grandparent"],
    answer: 0,
    explanation:
      'C is the mother of both A and B, and D is C’s father, so D is their grandfather. Nothing states B’s gender, so "grandchild" is as specific as the puzzle allows.'
  },
  {
    id: 'log-82',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt:
      'Introducing a man, a woman says, "His wife is the only daughter of my father." How is the man related to her?',
    options: ['Her husband', 'Her brother', 'Her father', 'Her brother-in-law'],
    answer: 0,
    explanation:
      'The only daughter of her father is the speaker herself. So the man’s wife is the speaker — he is her husband. Spotting when a description loops back to the speaker is the whole trick in these puzzles.'
  },
  {
    id: 'log-83',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing to a boy, Sinta says, "He is the son of my grandfather’s only child." How is the boy related to Sinta?',
    options: ['Her brother', 'Her cousin', 'Her nephew', 'Her uncle'],
    answer: 0,
    explanation:
      'Her grandfather’s only child must be her own parent, and that parent’s son is therefore her brother.'
  },
  {
    id: 'log-84',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'P is the sister of Q. Q is the wife of R. R is the father of S. How is P related to S?',
    options: ["S's aunt", "S's mother", "S's sister", "S's grandmother"],
    answer: 0,
    explanation:
      'Q is married to S’s father, so Q is S’s mother. P is Q’s sister, which makes P the aunt of S.'
  },
  {
    id: 'log-85',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'X is the father of Y. Y is the sister of Z. Z is the mother of W. How is X related to W?',
    options: ["W's grandfather", "W's father", "W's uncle", "W's great-grandfather"],
    answer: 0,
    explanation:
      'Y and Z are siblings, so X is the father of Z as well. Z is W’s mother, which makes X the grandfather of W.'
  },
  {
    id: 'log-86',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'A man says, "That woman’s mother is the only daughter of my mother." How is the woman related to him?',
    options: ['His niece', 'His daughter', 'His sister', 'His cousin'],
    answer: 0,
    explanation:
      'The speaker is a man, so he cannot be his mother’s daughter — the only daughter is his sister. The woman’s mother is that sister, so the woman is his niece.'
  },
  {
    id: 'log-87',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Deni introduces Rina as the daughter of the only son of his father’s wife. How is Rina related to Deni?',
    options: ['His daughter', 'His sister', 'His niece', 'His cousin'],
    answer: 0,
    explanation:
      'His father’s wife is his mother, and her only son is Deni himself. Rina is therefore Deni’s own daughter — the long phrasing exists purely to hide that.'
  },
  {
    id: 'log-88',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Q is the brother of R. S is the sister of Q. T is the brother of S. How many brothers does R have?',
    options: ['One', 'Two', 'Three', 'It cannot be determined'],
    answer: 1,
    explanation:
      'The four are siblings. S is stated to be a sister while Q and T are stated to be brothers, so R has two brothers — Q and T — whatever R’s own gender is.'
  },
  {
    id: 'log-89',
    topic: 'Number series',
    difficulty: 'hard',
    prompt: 'What number comes next?\n\n2, 3, 5, 9, 17, 33, ?',
    options: ['49', '64', '65', '66'],
    answer: 2,
    explanation:
      'The differences are 1, 2, 4, 8, 16, doubling each time. The next difference is 32, so 33 + 32 = 65. Equivalently, each term equals twice the previous term minus 1.',
    tip:
      'If the differences themselves form a geometric sequence, also test a recursive rule such as 2n - 1.'
  },
  {
    id: 'log-90',
    topic: 'Letter series',
    difficulty: 'easy',
    prompt: 'What letter comes next?\n\nA, C, E, G, ?',
    options: ['H', 'I', 'J', 'K'],
    answer: 1,
    explanation:
      'The letter positions are 1, 3, 5, 7, skipping one letter each time. The next position is 9, which is I.',
    tip: 'Convert letters to numbers first: A = 1, B = 2, and so on.'
  },
  {
    id: 'log-91',
    topic: 'Coding & decoding',
    difficulty: 'easy',
    prompt: 'If CAT is coded as DBU, how is DOG coded?',
    options: ['EPH', 'EPI', 'FQI', 'CNF'],
    answer: 0,
    explanation:
      'Each letter shifts forward by one position. D becomes E, O becomes P, and G becomes H, giving EPH.',
    tip: 'Compare the original and the code letter by letter to work out the size of the shift.'
  },
  {
    id: 'log-93',
    topic: 'Syllogism',
    difficulty: 'easy',
    prompt: 'All roses are flowers. All flowers are plants. Which conclusion is valid?',
    options: [
      'All plants are roses',
      'All roses are plants',
      'Some plants are not flowers',
      'No valid conclusion'
    ],
    answer: 1,
    explanation:
      'The all-to-all chain is the one syllogism form that is always valid. Roses sit inside flowers, and flowers sit inside plants, so roses must sit inside plants.',
    tip: 'Draw nested circles. The conclusion is only valid in the same direction, never reversed.'
  },
  {
    id: 'log-94',
    topic: 'Syllogism',
    difficulty: 'medium',
    prompt:
      'Some designers are coders. All coders are logical thinkers.\n\nI. Some designers are logical thinkers.\nII. All designers are logical thinkers.\n\nWhich conclusion follows?',
    options: ['Only I', 'Only II', 'Both I and II', 'Neither I nor II'],
    answer: 0,
    explanation:
      'Some designers are coders, and every coder is a logical thinker, so some designers must be logical thinkers. Conclusion II is too strong, because the designers who are not coders have unknown status.',
    tip: 'If one premise uses the word some, the conclusion must use some as well.'
  },
  {
    id: 'log-96',
    topic: 'Propositional logic',
    difficulty: 'hard',
    prompt: 'What is the correct negation of: “All students passed and nobody cheated”?',
    options: [
      'No student passed and everyone cheated',
      'At least one student did not pass, or at least one person cheated',
      'All students failed or nobody cheated',
      'Some students passed and some students cheated'
    ],
    answer: 1,
    explanation:
      'The negation of A and B is not A or not B. Negating all students passed gives at least one did not pass, and negating nobody cheated gives at least one cheated. The connector and flips to or.',
    tip:
      'Remember two rules: the negation of all is at least one is not, and and becomes or under negation.'
  },
  {
    id: 'log-97',
    topic: 'Analogy',
    difficulty: 'easy',
    prompt: 'Book : Reading :: Fork : ?',
    options: ['Kitchen', 'Eating', 'Metal', 'Spoon'],
    answer: 1,
    explanation:
      'The relationship is tool to purpose. A book is used for reading, and a fork is used for eating.',
    tip:
      'State the relationship as one short sentence, then test that sentence against every option.'
  },
  {
    id: 'log-98',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which one does not belong?\n\nApple, Banana, Carrot, Mango',
    options: ['Apple', 'Banana', 'Carrot', 'Mango'],
    answer: 2,
    explanation: 'Apple, banana and mango are fruits, while carrot is a vegetable.',
    tip:
      'Look for what the other three share, rather than hunting for what makes one item strange.'
  },
  {
    id: 'log-100',
    topic: 'Arithmetic reasoning',
    difficulty: 'hard',
    prompt:
      'A can finish a task in 10 days and B can finish the same task in 15 days. Working together, how many days do they need?',
    options: ['5 days', '6 days', '7.5 days', '12.5 days'],
    answer: 1,
    explanation:
      'Use units with an LCM of 30. A does 30 ÷ 10, which is 3 units per day, and B does 30 ÷ 15, which is 2 units per day. Together that is 5 units per day, so 30 ÷ 5 gives 6 days.',
    tip:
      'Never add the days themselves. Combined work is always faster than the fastest worker alone.'
  },
  {
    id: 'log-101',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'In a group of 50 students, 30 like tea, 25 like coffee, and 10 like both. How many like neither?',
    options: ['5', '10', '15', '20'],
    answer: 0,
    explanation:
      'The number who like at least one drink is 30 plus 25 minus 10, which is 45. So 50 minus 45 leaves 5 who like neither.',
    tip: 'The overlap gets counted twice in the sum, so it must be subtracted once.'
  },
  {
    id: 'log-102',
    topic: 'Direction sense',
    difficulty: 'medium',
    prompt:
      'A person walks 5 km east, turns left and walks 5 km, turns left again and walks 8 km, then turns left again and walks 5 km. Where is the person relative to the starting point?',
    options: ['3 km east', '3 km west', '5 km north', 'Back at the starting point'],
    answer: 1,
    explanation:
      'Track coordinates from the origin. East 5 gives (5, 0). Turning left from east faces north, so 5 km gives (5, 5). Turning left faces west, so 8 km gives (-3, 5). Turning left faces south, so 5 km gives (-3, 0). That is 3 km west of the start.',
    tip:
      'Turning left or right always depends on the current facing, not on a fixed direction. Record the facing after every turn.'
  },
  {
    id: 'log-103',
    topic: 'Direction sense',
    difficulty: 'hard',
    prompt:
      'A person walks 9 km north, 4 km east, 5 km south, 4 km west, then 4 km north. How far and in which direction is the person from the starting point?',
    options: ['8 km north', '8 km south', '4 km east', '10 km northeast'],
    answer: 0,
    explanation:
      'Add up each axis separately. East against west is 4 minus 4, which is 0. North against south is 9 minus 5 plus 4, which is 8. So the person ends 8 km north of the start.',
    tip:
      'When only the final position is asked, do not trace the route. Just total the movement along each axis.'
  },
  {
    id: 'log-104',
    topic: 'Ordering puzzle',
    difficulty: 'medium',
    prompt:
      'Five books are stacked. A is above B. C is below B. D is above A. E is between A and B. Which book is at the bottom?',
    options: ['A', 'B', 'C', 'E'],
    answer: 2,
    explanation: 'The order from top to bottom is D, A, E, B, C. The bottom book is C.',
    tip:
      'Draw a vertical line and start from the most definite clue, not from the first clue given.'
  },
  {
    id: 'log-107',
    topic: 'Spatial reasoning',
    difficulty: 'medium',
    prompt:
      'A wooden cube is painted red on all six faces, then cut into 27 identical smaller cubes. How many small cubes have exactly one red face?',
    options: ['1', '6', '8', '12'],
    answer: 1,
    explanation:
      'Cubes with exactly one painted face sit at the centre of each face. A cube has 6 faces, and a 3×3×3 cut leaves exactly one such cube per face, giving 6.',
    tip:
      'Memorise the four formulas. Corners are always 8, edges are 12(n-2), faces are 6(n-2) squared, and the hidden core is (n-2) cubed.'
  },
  {
    id: 'log-108',
    topic: 'Clocks',
    difficulty: 'easy',
    prompt: 'What is the angle between the hour and minute hands at 3:00?',
    options: ['60°', '90°', '120°', '180°'],
    answer: 1,
    explanation:
      'The minute hand points at 12 and the hour hand sits exactly on 3. Three number gaps times 30 degrees gives 90 degrees. Since the minutes are zero, the hour hand has not drifted.',
    tip: 'Each number on a clock face is 30 degrees apart, because 360 ÷ 12 equals 30.'
  },
  {
    id: 'log-109',
    topic: 'Clocks',
    difficulty: 'medium',
    prompt: 'What is the angle between the hour and minute hands at 4:20?',
    options: ['0°', '10°', '20°', '30°'],
    answer: 1,
    explanation:
      'Apply the absolute value of 30H minus 5.5M. That gives 30 × 4 minus 5.5 × 20, which is 120 minus 110, or 10 degrees. The minute hand is on the 4 and the hour hand has already drifted 10 degrees past it.',
    tip:
      'The hour hand is never still. It moves 0.5 degrees per minute, so the correction is simply the minutes divided by two.'
  },
  {
    id: 'log-110',
    topic: 'Calendars',
    difficulty: 'medium',
    prompt: 'If 15 March 2024 was a Friday, what day was 15 April 2024?',
    options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
    answer: 1,
    explanation:
      'March has 31 days, and 31 ÷ 7 leaves a remainder of 3. Moving 3 days forward from Friday gives Saturday, Sunday, Monday.',
    tip:
      'Memorise the remainder for each month length: 31 days leaves 3, 30 days leaves 2, a normal February leaves 0, and a leap February leaves 1.'
  },
  {
    id: 'log-111',
    topic: 'Probability',
    difficulty: 'medium',
    prompt:
      'A bag holds 5 green marbles and 7 yellow marbles. Two are drawn one after another without replacement. What is the probability that both are yellow?',
    options: ['7/22', '49/144', '7/12', '1/3'],
    answer: 0,
    explanation:
      'The first draw is yellow with probability 7/12. One yellow marble is now gone, so the second is 6/11. Multiplying gives 42/132, which is 7/22. The 49/144 option is the answer you would get with replacement.',
    tip:
      'The word both means multiply. Without replacement means both the numerator and the denominator drop by one.'
  },
  {
    id: 'log-112',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing to a woman, a man says: “Her mother is the only daughter of my grandmother.” How is the woman related to the man?',
    options: ['His daughter', 'His sister', 'His niece', 'His cousin'],
    answer: 1,
    explanation:
      'The only daughter of the man’s grandmother is his own mother. So the woman’s mother is the same as the man’s mother, which makes the woman his sister.',
    tip:
      'Work from the innermost phrase outwards, replacing each phrase with a single word before moving on.'
  },
  {
    id: 'log-113',
    topic: 'Deduction',
    difficulty: 'medium',
    prompt:
      'All employees who joined before 2020 received a bonus. Rina received a bonus. What can be concluded?',
    options: [
      'Rina joined before 2020',
      'Rina joined after 2020',
      'It cannot be determined when Rina joined',
      'Rina is not an employee'
    ],
    answer: 2,
    explanation:
      'The premise only says that joining before 2020 guarantees a bonus, not the reverse. Someone who joined later could still receive a bonus for another reason. This is the affirming the consequent trap.',
    tip:
      'Knowing that the consequence is true does not prove the cause. Only the contrapositive is valid.'
  },
  {
    id: 'log-114',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends A, B, C, D, E, F sit around a circular table facing the centre. A is second to the right of B. C sits opposite B. D is immediately to the left of B. E is immediately to the left of A. Who sits immediately to the right of C?',
    options: ['A', 'D', 'E', 'F'],
    answer: 3,
    explanation:
      'Number the seats 1 to 6 clockwise and place B in seat 1. Facing the centre means right equals anticlockwise. Two steps right of B lands A in seat 5. C sits opposite B in seat 4. D sits left of B in seat 2, and E sits left of A in seat 6. That leaves seat 3 for F. Right of C means anticlockwise from seat 4, which is seat 3, occupied by F.',
    tip:
      'Number the seats before placing anyone. With numbers, right becomes an arithmetic step rather than a visual guess.'
  },
  {
    id: 'log-115',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row facing south. P sits at the exact centre. Q sits third to the left of P. R sits immediately to the right of Q. S sits at the extreme right end. T sits second to the right of P. U sits immediately to the left of P. Who sits at the extreme left end, and is that end east or west?',
    options: [
      'Q, and that end is east',
      'Q, and that end is west',
      'S, and that end is east',
      'R, and that end is west'
    ],
    answer: 0,
    explanation:
      'Number the positions 1 to 7 from their left to their right. P takes the centre at position 4. Q sits three steps left at position 1, and R sits right of Q at position 2. S takes the right end at position 7, T sits two steps right of P at position 6, and U sits left of P at position 3, leaving position 5 for the seventh friend. The extreme left end is Q. Because they face south, their left side points east.',
    tip:
      'Settle the left and right order first, then translate to compass directions as the final step. Facing south reverses the sides compared with facing north.'
  },
  {
    id: 'log-116',
    topic: 'Odd one out',
    difficulty: 'easy',
    prompt: 'Which one does not belong?\n\nSwift, Python, Linux, JavaScript',
    options: ['Swift', 'Python', 'Linux', 'JavaScript'],
    answer: 2,
    explanation:
      'Swift, Python and JavaScript are programming languages. Linux is an operating system.',
    tip: 'Name the category the majority share before you look for what is strange about one item.'
  },
  {
    id: 'log-117',
    topic: 'Odd one out',
    difficulty: 'medium',
    prompt: 'Which number does not belong?\n\n3, 5, 7, 9, 11',
    options: ['3', '7', '9', '11'],
    answer: 2,
    explanation:
      'All of them are odd, so oddness is not the rule. 3, 5, 7 and 11 are prime; 9 = 3 × 3 is not.',
    tip: 'If every number shares the obvious property, look one level deeper — primes, squares or cubes.'
  },
  {
    id: 'log-118',
    topic: 'Odd one out',
    difficulty: 'medium',
    prompt: 'Which one does not belong?\n\nRectangle, Rhombus, Trapezium, Square',
    options: ['Rectangle', 'Rhombus', 'Trapezium', 'Square'],
    answer: 2,
    explanation:
      'A rectangle, a rhombus and a square are all parallelograms — both pairs of opposite sides are parallel. A trapezium has only one pair.',
    tip: 'With shapes, test one property at a time: number of sides, parallel sides, equal sides, right angles.'
  },
  {
    id: 'log-119',
    topic: 'Coding & decoding',
    difficulty: 'easy',
    prompt: 'If FRIEND is coded as HTKGPF, how is CANDLE coded?',
    options: ['ECPFNG', 'EDPFNH', 'ECPFOG', 'DBOEMF'],
    answer: 0,
    explanation:
      'Every letter moves two places forward: F → H, R → T, I → K. Applying +2 to CANDLE gives E, C, P, F, N, G.',
    tip: 'Work out the shift from the first two letters, then check it against the last letter before you trust it.'
  },
  {
    id: 'log-120',
    topic: 'Coding & decoding',
    difficulty: 'easy',
    prompt: 'If LOGIC is coded as CIGOL, how is BRAIN coded?',
    options: ['NIARB', 'NIABR', 'RBAIN', 'NAIRB'],
    answer: 0,
    explanation:
      'The code is the word written backwards. BRAIN reversed, letter by letter, is N-I-A-R-B.',
    tip: 'Before testing shifts, check whether the code is simply the word reversed — the letter set is identical.'
  },
  {
    id: 'log-121',
    topic: 'Coding & decoding',
    difficulty: 'medium',
    prompt:
      'In a certain code PALE is written as 2134 and EARTH is written as 41590. How is PEARL written?',
    options: ['24153', '25413', '24513', '21453'],
    answer: 0,
    explanation:
      'Read the letter-to-digit pairs off both words: P = 2, A = 1, L = 3, E = 4, R = 5, T = 9, H = 0. PEARL is therefore 2-4-1-5-3.',
    tip: 'Build the letter-to-digit table first, and check that the letters shared by both words agree.'
  },
  {
    id: 'log-122',
    topic: 'Coding & decoding',
    difficulty: 'hard',
    prompt: 'In a certain code EARTH is written as FCUXM. How is MOON written in that code?',
    options: ['NQRR', 'NPQR', 'NQRS', 'NQQR'],
    answer: 0,
    explanation:
      'The shift grows along the word: +1, +2, +3, +4, +5 (E → F, A → C, R → U, T → X, H → M). Applying +1, +2, +3, +4 to MOON gives N, Q, R, R.',
    tip: 'When the first letters shift by different amounts, check whether the shift itself follows a series.'
  },
  {
    id: 'log-123',
    topic: 'Syllogism',
    difficulty: 'easy',
    prompt:
      'Statements:\n\n1. All cats are mammals.\n2. No mammal is a fish.\n\nWhich conclusion definitely follows?',
    options: ['No cat is a fish.', 'Some cats are fish.', 'All mammals are cats.', 'Some fish are mammals.'],
    answer: 0,
    explanation:
      'Cats sit entirely inside mammals, and mammals are entirely outside fish. So no cat can be a fish.',
    tip: 'An “all” inside a “no” always yields a “no”. Draw the circles: one inside, the other separate.'
  },
  {
    id: 'log-124',
    topic: 'Syllogism',
    difficulty: 'medium',
    prompt:
      'Statements:\n\n1. Some pens are books.\n2. All books are papers.\n\nWhich conclusion definitely follows?',
    options: ['Some pens are papers.', 'All pens are papers.', 'No pen is a paper.', 'Some papers are not pens.'],
    answer: 0,
    explanation:
      'The pens that are books are also papers, because every book is a paper. That guarantees “some”, never “all” — the other pens are unaccounted for.',
    tip: 'A conclusion can never be stronger than the weakest premise. One “some” means a “some” conclusion.'
  },
  {
    id: 'log-125',
    topic: 'Syllogism',
    difficulty: 'hard',
    prompt:
      'Statements:\n\n1. All engineers are graduates.\n2. Some interns are not graduates.\n\nWhich conclusion definitely follows?',
    options: [
      'Some interns are not engineers.',
      'Some interns are engineers.',
      'No intern is an engineer.',
      'Nothing definite follows.'
    ],
    answer: 0,
    explanation:
      'Every engineer is a graduate, so anyone who is not a graduate cannot be an engineer. The interns who are not graduates are therefore not engineers.',
    tip: 'A negative premise forces a negative conclusion. Push the “not” through the chain rather than guessing.'
  },
  {
    id: 'log-126',
    topic: 'Propositional logic',
    difficulty: 'easy',
    prompt: 'If the tests pass, the app is deployed. The tests passed. Therefore:',
    options: [
      'The app is deployed.',
      'The app is not deployed.',
      'The tests were skipped.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      'This is modus ponens, the simplest valid move: the condition is met, so the consequence holds.',
    tip: 'Two moves are valid — condition true gives consequence true, consequence false gives condition false.'
  },
  {
    id: 'log-127',
    topic: 'Propositional logic',
    difficulty: 'medium',
    prompt: 'If a file is public, it is readable. A certain file is readable. What follows?',
    options: [
      'The file is public.',
      'The file is not public.',
      'Nothing follows about whether the file is public.',
      'The file is both public and private.'
    ],
    answer: 2,
    explanation:
      'This is the affirming-the-consequent trap. Public guarantees readable, but readable can have other causes, so the file’s visibility is undetermined.',
    tip: 'Reading the arrow backwards is never valid. If P → Q, knowing Q tells you nothing about P.'
  },
  {
    id: 'log-128',
    topic: 'Propositional logic',
    difficulty: 'medium',
    prompt: 'What is the negation of: “The server is down or the network is slow”?',
    options: [
      'The server is not down and the network is not slow.',
      'The server is not down or the network is not slow.',
      'The server is down and the network is slow.',
      'If the server is down, the network is slow.'
    ],
    answer: 0,
    explanation:
      'By De Morgan’s law, not (A or B) is the same as (not A) and (not B). For the “or” to fail, both parts must fail.',
    tip: 'Under negation, “or” becomes “and” and “and” becomes “or”, and every part is negated.'
  },
  {
    id: 'log-129',
    topic: 'Propositional logic',
    difficulty: 'hard',
    prompt: 'Only members can borrow books. Sinta borrowed a book. What follows?',
    options: [
      'Sinta is a member.',
      'Sinta is not a member.',
      'Every member borrows books.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      '“Only members can borrow” means borrowing implies membership — the arrow runs from borrowing to membership, not the other way. It does not say every member borrows.',
    tip: 'Rewrite “only A can B” as “if B then A”. The word only reverses the direction you expect.'
  },
  {
    id: 'log-130',
    topic: 'Letter series',
    difficulty: 'easy',
    prompt: 'Which letter comes next?\n\nA, D, G, J, ?',
    options: ['K', 'L', 'M', 'N'],
    answer: 2,
    explanation:
      'The positions are 1, 4, 7, 10 — three steps each time. The next position is 13, which is M.',
    tip: 'Convert to numbers first: A = 1 … Z = 26. Letter series are number series in disguise.'
  },
  {
    id: 'log-131',
    topic: 'Letter series',
    difficulty: 'medium',
    prompt: 'Which letter comes next?\n\nB, E, I, N, ?',
    options: ['S', 'T', 'U', 'V'],
    answer: 1,
    explanation:
      'The positions are 2, 5, 9, 14 — the steps are +3, +4, +5. The next step is +6, giving position 20, which is T.',
    tip: 'When the steps are not constant, take the differences of the differences before guessing.'
  },
  {
    id: 'log-132',
    topic: 'Letter series',
    difficulty: 'medium',
    prompt: 'What comes next?\n\nAZ, BY, CX, ?',
    options: ['DV', 'DW', 'EW', 'DX'],
    answer: 1,
    explanation:
      'The first letter runs forward from A, and the second runs backwards from Z. After CX comes D paired with W.',
    tip: 'In a two-letter series, track each position as its own series rather than as one pattern.'
  },
  {
    id: 'log-133',
    topic: 'Letter series',
    difficulty: 'hard',
    prompt: 'Which letter comes next?\n\nZ, W, S, N, ?',
    options: ['H', 'I', 'J', 'G'],
    answer: 0,
    explanation:
      'The positions are 26, 23, 19, 14 — the steps are −3, −4, −5. The next step is −6, giving position 8, which is H.',
    tip: 'A shrinking series counts down; the widening gap is the pattern, not the letters themselves.'
  },
  {
    id: 'log-134',
    topic: 'Analogy',
    difficulty: 'easy',
    prompt: 'Doctor : Patient :: Teacher : ?',
    options: ['School', 'Student', 'Book', 'Lesson'],
    answer: 1,
    explanation:
      'The relationship is professional to the person they serve. A doctor treats a patient; a teacher teaches a student.',
    tip: 'Say the relationship out loud as a sentence, then read the sentence again with each option.'
  },
  {
    id: 'log-135',
    topic: 'Analogy',
    difficulty: 'medium',
    prompt: 'Ice : Water :: Water : ?',
    options: ['Steam', 'Rain', 'Cloud', 'Ocean'],
    answer: 0,
    explanation:
      'The relationship is one state of matter to the next as heat is added: solid to liquid, liquid to gas.',
    tip: 'When both halves use the same word, the relationship is usually a sequence — keep going in the same direction.'
  },
  {
    id: 'log-136',
    topic: 'Analogy',
    difficulty: 'medium',
    prompt: 'Function : Returns :: Loop : ?',
    options: ['Repeats', 'Compiles', 'Declares', 'Stores'],
    answer: 0,
    explanation:
      'The relationship is a construct to what it characteristically does. A function returns a value; a loop repeats a block.',
    tip: 'Pick the verb that only the first item does. “Compiles” is true of a whole program, not of a loop.'
  },
  {
    id: 'log-137',
    topic: 'Analogy',
    difficulty: 'hard',
    prompt: 'Kilometre : Distance :: Decibel : ?',
    options: ['Loudness', 'Frequency', 'Brightness', 'Temperature'],
    answer: 0,
    explanation:
      'The relationship is unit to the quantity it measures. A kilometre measures distance; a decibel measures loudness.',
    tip: 'For unit analogies, name the quantity, not the field. Frequency is sound too, but its unit is the hertz.'
  },
  {
    id: 'log-138',
    topic: 'Direction sense',
    difficulty: 'easy',
    prompt: 'A boy walks 3 km south, then 4 km west. How far is he from his starting point?',
    options: ['5 km', '6 km', '7 km', '1 km'],
    answer: 0,
    explanation:
      'The two legs are at right angles, so the straight-line distance is the hypotenuse: √(3² + 4²) = 5 km.',
    tip: 'Perpendicular legs mean Pythagoras. Learn the 3-4-5 and 5-12-13 triples — tests reuse them constantly.'
  },
  {
    id: 'log-139',
    topic: 'Direction sense',
    difficulty: 'medium',
    prompt:
      'Rani faces north and walks 10 m. She turns right and walks 10 m, then turns right again and walks 10 m. Where is she, and which way is she facing?',
    options: [
      '10 m east of the start, facing south',
      '10 m west of the start, facing south',
      '10 m east of the start, facing north',
      'Back at the start, facing west'
    ],
    answer: 0,
    explanation:
      'North 10 puts her at (0, 10). A right turn faces east, so she reaches (10, 10). A second right faces south, ending at (10, 0) — level with the start but 10 m east, still facing south.',
    tip: 'Track two things separately: the coordinates and the current facing. Turns change only the facing.'
  },
  {
    id: 'log-140',
    topic: 'Direction sense',
    difficulty: 'medium',
    prompt:
      'Early in the morning, a man walks straight towards the sun and his shadow falls behind him. In which direction is he walking?',
    options: ['East', 'West', 'North', 'South'],
    answer: 0,
    explanation:
      'The sun rises in the east, so walking towards it in the morning means walking east; the shadow is cast the opposite way, behind him to the west.',
    tip: 'Shadows point away from the sun: west in the morning, east in the late afternoon.'
  },
  {
    id: 'log-141',
    topic: 'Direction sense',
    difficulty: 'hard',
    prompt:
      'A car is heading north. It takes a left turn, then a right turn, then a U-turn, then another right turn. Which direction is it heading now?',
    options: ['West', 'East', 'North', 'South'],
    answer: 0,
    explanation:
      'North, left → west. West, right → north. A U-turn → south. South, right → west.',
    tip: 'Write the facing after every single turn. Trying to hold four turns in your head is where these go wrong.'
  },
  {
    id: 'log-142',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt: 'In a row of people, Andi is 7th from the left end and 9th from the right end. How many people are in the row?',
    options: ['14', '15', '16', '17'],
    answer: 1,
    explanation:
      'Adding the two positions counts Andi twice, so the total is 7 + 9 − 1 = 15.',
    tip: 'Positions from both ends always overlap by one person — add them and subtract 1.'
  },
  {
    id: 'log-143',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit in a row facing north.\n\n• C sits at the far left end.\n• B is third from the left.\n• A sits between C and B.\n• D sits at the far right end.\n• E sits immediately to the left of D.\n\nWho is third from the right?',
    options: ['A', 'D', 'E', 'F'],
    answer: 3,
    explanation:
      'Numbering the seats 1 to 6 from the left: C is 1, B is 3, A is 2, D is 6 and E is 5, so F takes seat 4. Third from the right is seat 4 — F.',
    tip: 'Fill the fixed seats first — the ends and the “nth from” clues — and let the last person fall into the gap.'
  },
  {
    id: 'log-144',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit around a circular table, all facing away from the centre.\n\n• A sits opposite D.\n• B sits immediately to the right of A.\n• C sits immediately to the right of B.\n\nWho sits immediately to the left of D?',
    options: ['A', 'B', 'C', 'E'],
    answer: 2,
    explanation:
      'Number the seats 1 to 6 clockwise. Facing outwards, a person’s right is the clockwise neighbour — the opposite of facing inwards. A is 1, so D is 4; B is 2 and C is 3. D’s left is the anticlockwise seat, 3, which is C.',
    tip: 'Settle which way the group faces before anything else: facing outwards, right is clockwise; facing the centre, it is anticlockwise.'
  },
  {
    id: 'log-145',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit evenly spaced around a circular table, all facing the centre.\n\n• P sits opposite S.\n• Q sits third to the left of P.\n• T sits opposite Q.\n• R sits immediately to the left of S.\n\nWho sits immediately to the left of T?',
    options: ['P', 'Q', 'R', 'S'],
    answer: 0,
    explanation:
      'Number the seats 1 to 8 clockwise; facing the centre, left is clockwise. P is 1, so S is 5. Three seats clockwise from P puts Q at 4, so T is at 8. R sits at 6. One seat clockwise from T at 8 is seat 1 — P.',
    tip: 'With eight seats, “opposite” means add four. Convert every clue to seat arithmetic before drawing anything.'
  },
  {
    id: 'log-146',
    topic: 'Sets & Venn diagrams',
    difficulty: 'easy',
    prompt:
      'In a class of 30 students, 20 play football and 15 play basketball. Every student plays at least one of the two. How many play both?',
    options: ['3', '5', '7', '10'],
    answer: 1,
    explanation:
      'If nobody is outside the two sets, then 20 + 15 − both = 30, so both = 35 − 30 = 5.',
    tip: 'Write the formula |A| + |B| − |both| = |at least one| and put in what you know; the unknown falls out.'
  },
  {
    id: 'log-147',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'Of 100 people, 60 read newspaper A, 50 read newspaper B and 30 read both. How many read exactly one newspaper?',
    options: ['50', '30', '80', '20'],
    answer: 0,
    explanation:
      'Only A is 60 − 30 = 30, and only B is 50 − 30 = 20. Exactly one is 30 + 20 = 50 — the same as 60 + 50 − 2 × 30.',
    tip: '“Exactly one” subtracts the overlap twice, not once. That double subtraction is the whole question.'
  },
  {
    id: 'log-148',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'In a survey of 120 students, 70 like Swift, 60 like Python and 20 like neither. How many like both?',
    options: ['10', '20', '30', '40'],
    answer: 2,
    explanation:
      'Remove the 20 who like neither: 100 like at least one. Then both = 70 + 60 − 100 = 30.',
    tip: 'Subtract the “neither” group from the total first — everything after that is a plain two-set formula.'
  },
  {
    id: 'log-149',
    topic: 'Sets & Venn diagrams',
    difficulty: 'hard',
    prompt:
      'Of 40 students: 22 study Maths, 20 study Physics, 18 study Chemistry, 10 study Maths and Physics, 8 study Physics and Chemistry, 9 study Maths and Chemistry, and 5 study all three. How many study none of them?',
    options: ['2', '3', '5', '8'],
    answer: 0,
    explanation:
      'Inclusion–exclusion: 22 + 20 + 18 = 60, minus the three pair overlaps (10 + 8 + 9 = 27) gives 33, plus the triple overlap 5 gives 38 studying at least one. So 40 − 38 = 2 study none.',
    tip: 'Three sets: add the singles, subtract the pairs, add the triple back. The signs alternate.'
  },
  {
    id: 'log-150',
    topic: 'Sets & Venn diagrams',
    difficulty: 'medium',
    prompt:
      'In a class every student likes tea, coffee or both. 25 like tea, 20 like coffee and 8 like both. How many students are in the class?',
    options: ['35', '37', '45', '53'],
    answer: 1,
    explanation:
      'The union is 25 + 20 − 8 = 37. Nobody is outside the two sets, so the class has 37 students.',
    tip: 'The same formula answers the total, the overlap or the “neither” — whichever term is the unknown.'
  },
  {
    id: 'log-151',
    topic: 'Ordering puzzle',
    difficulty: 'easy',
    prompt:
      'Anita is taller than Budi. Budi is taller than Citra. Dedi is taller than Anita. Who is the tallest?',
    options: ['Anita', 'Budi', 'Citra', 'Dedi'],
    answer: 3,
    explanation: 'The chain is Dedi > Anita > Budi > Citra, so Dedi is the tallest.',
    tip: 'Write everyone on one line with > signs. Never keep the chain in your head.'
  },
  {
    id: 'log-152',
    topic: 'Ordering puzzle',
    difficulty: 'medium',
    prompt:
      'In a race, Rina finished before Sari but after Tono. Umi finished before Tono. Who finished first?',
    options: ['Rina', 'Sari', 'Tono', 'Umi'],
    answer: 3,
    explanation:
      'The finishing order is Umi, Tono, Rina, Sari. “Before” means earlier, so the leftmost name is the winner.',
    tip: 'Fix one direction — earliest on the left — and keep it. Mixing “before” and “above” is the usual mistake.'
  },
  {
    id: 'log-153',
    topic: 'Ordering puzzle',
    difficulty: 'medium',
    prompt:
      'Five boxes are stacked. The red box is above the blue one. The green box is below the blue one. The yellow box is on top. The white box is between the blue and the green. Which box is directly below the red box?',
    options: ['Blue', 'Green', 'White', 'Yellow'],
    answer: 0,
    explanation:
      'From the top: yellow, red, blue, white, green. The box directly below red is blue.',
    tip: 'Draw a vertical stack and start from the clue that fixes an end — “on top” or “at the bottom”.'
  },
  {
    id: 'log-154',
    topic: 'Ordering puzzle',
    difficulty: 'medium',
    prompt:
      'P is heavier than Q but lighter than R. S is lighter than Q. T is heavier than R. Who is the second heaviest?',
    options: ['P', 'Q', 'R', 'T'],
    answer: 2,
    explanation: 'The order from heaviest is T > R > P > Q > S, so R is second.',
    tip: 'Count the ranking from the end the question asks about, not from the end you built first.'
  },
  {
    id: 'log-155',
    topic: 'Ordering puzzle',
    difficulty: 'hard',
    prompt:
      'Five events run Monday to Friday, one per day.\n\n• The demo is on Monday.\n• The workshop is on Friday.\n• The retro is the day before the workshop.\n• The review is the day after the launch.\n\nWhich event is on Wednesday?',
    options: ['The launch', 'The review', 'The retro', 'The demo'],
    answer: 1,
    explanation:
      'The demo takes Monday and the workshop Friday, so the retro is Thursday. Only Tuesday and Wednesday are left, and the review follows the launch, so the launch is Tuesday and the review Wednesday.',
    tip: 'Place the fixed days first. A “day after” pair then has only one gap wide enough to hold it.'
  },
  {
    id: 'log-156',
    topic: 'Spatial reasoning',
    difficulty: 'medium',
    prompt:
      'A cube of side 5 cm is painted on all six faces and then cut into 1 cm cubes. How many of them have no paint at all?',
    options: ['8', '18', '27', '64'],
    answer: 2,
    explanation:
      'The unpainted cubes form the hidden core, a cube of side n − 2. Here that is 3 × 3 × 3 = 27.',
    tip: 'The core is always (n − 2)³ — the block you would see if you peeled one layer off every face.'
  },
  {
    id: 'log-157',
    topic: 'Spatial reasoning',
    difficulty: 'medium',
    prompt:
      'A die has faces numbered 1 to 6, and opposite faces always add up to 7. Which number is on the face opposite 3?',
    options: ['2', '4', '5', '6'],
    answer: 1,
    explanation: 'Opposite faces sum to 7, so the face opposite 3 is 7 − 3 = 4.',
    tip: 'On a standard die the pairs are 1-6, 2-5 and 3-4. Two faces that meet at an edge are never opposite.'
  },
  {
    id: 'log-158',
    topic: 'Spatial reasoning',
    difficulty: 'easy',
    prompt: 'How many faces, edges and vertices does a cube have?',
    options: [
      '6 faces, 12 edges, 8 vertices',
      '6 faces, 8 edges, 12 vertices',
      '8 faces, 12 edges, 6 vertices',
      '12 faces, 6 edges, 8 vertices'
    ],
    answer: 0,
    explanation:
      'A cube has 6 square faces, 12 edges where two faces meet, and 8 corners. They satisfy Euler’s formula: 6 + 8 − 12 = 2.',
    tip: 'Check any answer with Euler’s formula for solids: faces + vertices − edges = 2.'
  },
  {
    id: 'log-159',
    topic: 'Spatial reasoning',
    difficulty: 'medium',
    prompt:
      'A rectangular sheet of paper measures 8 cm by 6 cm. It is folded exactly in half twice. What is the area of the folded shape?',
    options: ['12 cm²', '24 cm²', '6 cm²', '16 cm²'],
    answer: 0,
    explanation:
      'The full sheet is 8 × 6 = 48 cm². Each fold halves the area, so two folds give 48 ÷ 4 = 12 cm².',
    tip: 'Work in area, not in side lengths — the answer does not depend on which way each fold runs.'
  },
  {
    id: 'log-160',
    topic: 'Spatial reasoning',
    difficulty: 'hard',
    prompt:
      'A cube of side 4 cm is painted on all six faces and then cut into 1 cm cubes. How many of the small cubes have exactly one painted face?',
    options: ['8', '12', '24', '36'],
    answer: 2,
    explanation:
      'One-face cubes sit in the middle of each face: 6 × (n − 2)² = 6 × 2² = 24.',
    tip: 'Memorise the family: corners 8, edges 12(n − 2), faces 6(n − 2)², core (n − 2)³.'
  },
  {
    id: 'log-161',
    topic: 'Clocks',
    difficulty: 'easy',
    prompt: 'How many degrees does the minute hand sweep in 20 minutes?',
    options: ['60', '90', '120', '180'],
    answer: 2,
    explanation:
      'The minute hand covers 360° in 60 minutes, so 6° per minute. In 20 minutes it sweeps 20 × 6 = 120°.',
    tip: 'Two rates run every clock question: the minute hand at 6° per minute, the hour hand at 0.5°.'
  },
  {
    id: 'log-162',
    topic: 'Clocks',
    difficulty: 'medium',
    prompt: 'What is the angle between the hour and minute hands at 6:30?',
    options: ['0°', '15°', '30°', '180°'],
    answer: 1,
    explanation:
      'The minute hand is at 180°. The hour hand has drifted half an hour past 6: 6 × 30 + 30 × 0.5 = 195°. The difference is 15°.',
    tip: 'At half past, the hands are never exactly aligned — the hour hand has already moved 15° on.'
  },
  {
    id: 'log-163',
    topic: 'Clocks',
    difficulty: 'medium',
    prompt: 'A clock seen in a mirror shows 8:20. What is the actual time?',
    options: ['3:40', '4:40', '2:40', '3:20'],
    answer: 0,
    explanation:
      'Subtract the mirrored time from 11:60. 11:60 − 8:20 = 3:40.',
    tip: 'Use 11:60 minus the shown time. Only when the time is exactly on the hour does 12:00 work instead.'
  },
  {
    id: 'log-164',
    topic: 'Clocks',
    difficulty: 'hard',
    prompt: 'At what time between 3 and 4 o’clock do the hour and minute hands overlap exactly?',
    options: ['3:15', '3:16 and 4/11 minutes', '3:17 and 1/11 minutes', '3:18'],
    answer: 1,
    explanation:
      'The minute hand gains 5.5° per minute on the hour hand and starts 90° behind it, so it needs 90 ÷ 5.5 = 180/11 = 16 4/11 minutes.',
    tip: 'The relative speed of the hands is 5.5° per minute. Every “when do the hands…” question divides by 5.5.'
  },
  {
    id: 'log-165',
    topic: 'Clocks',
    difficulty: 'hard',
    prompt: 'How many times do the hour and minute hands overlap in 24 hours?',
    options: ['22', '23', '24', '44'],
    answer: 0,
    explanation:
      'The hands meet 11 times every 12 hours, not 12 — between 11 and 12 the overlap happens exactly at 12 o’clock, which is shared with the next cycle. That gives 22 in a day.',
    tip: 'The answer is 11 per 12 hours, not 12. The same off-by-one applies to the hands being opposite.'
  },
  {
    id: 'log-166',
    topic: 'Truth & lies',
    difficulty: 'easy',
    prompt:
      'Every statement Ali makes is false. Ali says: “The meeting is at 9.” What can you conclude?',
    options: [
      'The meeting is at 9.',
      'The meeting is not at 9.',
      'The meeting is at 10.',
      'Nothing at all can be concluded.'
    ],
    answer: 1,
    explanation:
      'A false statement tells you its opposite is true: the meeting is not at 9. It does not tell you when it actually is.',
    tip: 'Negating a liar gives you one fact, never the whole truth — “not 9” is not the same as “at 10”.'
  },
  {
    id: 'log-167',
    topic: 'Truth & lies',
    difficulty: 'medium',
    prompt:
      'Exactly one of these three is lying.\n\nX: “Y broke the cup.”\nY: “I did not break it.”\nZ: “X broke it.”\n\nWho broke the cup?',
    options: ['X', 'Y', 'Z', 'It cannot be determined'],
    answer: 0,
    explanation:
      'If X broke it, then X’s claim is false and both Y and Z are truthful — exactly one liar, as required. Assuming Y broke it makes both X and Z’s statements disagree with Y, giving two liars.',
    tip: 'Assume each person is guilty in turn and count the liars. Only the count that matches the rule survives.'
  },
  {
    id: 'log-168',
    topic: 'Truth & lies',
    difficulty: 'medium',
    prompt:
      'On an island, knights always tell the truth and knaves always lie.\n\nA says: “B is a knight.”\nB says: “A and I are of different kinds.”\n\nWhat are they?',
    options: [
      'Both are knights',
      'Both are knaves',
      'A is a knight, B is a knave',
      'A is a knave, B is a knight'
    ],
    answer: 1,
    explanation:
      'If A were a knight, B would be a knight too, but then B’s claim that they differ would be false — impossible for a knight. So A is a knave, B is a knave, and B’s claim that they differ is indeed false.',
    tip: 'Assume the first speaker is a knight. If that leads to a contradiction, they are a knave and you continue from there.'
  },
  {
    id: 'log-169',
    topic: 'Truth & lies',
    difficulty: 'medium',
    prompt:
      'Exactly one of these four is lying.\n\nW: “X did it.”\nX: “W did it.”\nY: “I did not do it.”\nZ: “X did it.”\n\nWho did it?',
    options: ['W', 'X', 'Y', 'Z'],
    answer: 1,
    explanation:
      'If X did it, W, Y and Z are all telling the truth and only X is lying — exactly one liar. Every other culprit makes at least two statements false.',
    tip: 'Two people saying the same thing are either both right or both wrong, so they cannot be the single liar.'
  },
  {
    id: 'log-170',
    topic: 'Truth & lies',
    difficulty: 'medium',
    prompt:
      'P says: “Q and R are both lying.” Q says: “P is lying.” If Q is telling the truth, what can you say about R?',
    options: [
      'R is lying',
      'R is telling the truth',
      'It cannot be determined',
      'R must be silent'
    ],
    answer: 2,
    explanation:
      'Q being truthful makes P a liar, so “Q and R are both lying” is false — at least one of them is truthful. Q already is, so R’s status is unconstrained.',
    tip: 'The negation of “both are lying” is “at least one is truthful”, not “both are truthful”.'
  },
  {
    id: 'log-171',
    topic: 'Truth & lies',
    difficulty: 'hard',
    prompt:
      'On an island where knights always tell the truth and knaves always lie, a person says: “I am a knave.” What are they?',
    options: [
      'A knight',
      'A knave',
      'Either is possible',
      'Neither — no islander could say that'
    ],
    answer: 3,
    explanation:
      'A knight cannot say it, because the statement would then be false. A knave cannot say it either, because the statement would then be true. No islander can make that claim.',
    tip: 'Test both roles against the sentence. When both produce a contradiction, the correct answer is that the situation is impossible.'
  },
  {
    id: 'log-172',
    topic: 'Truth & lies',
    difficulty: 'hard',
    prompt:
      'Three islanders — knights always tell the truth, knaves always lie.\n\nA says: “All three of us are knaves.”\nB says: “Exactly one of us is a knight.”\n\nWhat is B?',
    options: ['A knight', 'A knave', 'It cannot be determined', 'The statements are contradictory'],
    answer: 0,
    explanation:
      'A cannot be a knight, since that would make his own claim false, so A is a knave and at least one of B and C is a knight. If B were a knave, the number of knights would not be one, forcing C to be a knight and making it exactly one after all — a contradiction. So B is a knight.',
    tip: 'A claim of the form “all of us are knaves” always marks the speaker as a knave. That is the free move to start with.'
  },
  {
    id: 'log-173',
    topic: 'Matrix pattern',
    difficulty: 'easy',
    prompt: 'Find the missing number.\n\n| 1 | 2 | 3 |\n| 4 | 5 | 9 |\n| 7 | 8 | ? |',
    options: ['12', '14', '15', '56'],
    answer: 2,
    explanation: 'The third column is the sum of the first two: 1 + 2 = 3, 4 + 5 = 9, so 7 + 8 = 15.',
    tip: 'Test the simplest operations across a row first — add, subtract, multiply — before looking at columns.'
  },
  {
    id: 'log-174',
    topic: 'Matrix pattern',
    difficulty: 'medium',
    prompt: 'Find the missing number.\n\n| 3 | 5 | 16 |\n| 4 | 6 | 20 |\n| 7 | 9 | ? |',
    options: ['27', '30', '32', '36'],
    answer: 2,
    explanation:
      'The third entry is twice the sum of the first two: (3 + 5) × 2 = 16, (4 + 6) × 2 = 20, so (7 + 9) × 2 = 32.',
    tip: 'If the plain sum is close but too small, check for a multiplier — doubling is the most common.'
  },
  {
    id: 'log-175',
    topic: 'Matrix pattern',
    difficulty: 'medium',
    prompt: 'Find the missing number.\n\n| 6 | 3 | 2 |\n| 12 | 4 | 3 |\n| 20 | 5 | ? |',
    options: ['3', '4', '5', '6'],
    answer: 1,
    explanation:
      'The third entry is the first divided by the second: 6 ÷ 3 = 2, 12 ÷ 4 = 3, so 20 ÷ 5 = 4.',
    tip: 'When the third number is much smaller than the first two, try division before anything else.'
  },
  {
    id: 'log-176',
    topic: 'Matrix pattern',
    difficulty: 'medium',
    prompt: 'Find the missing number.\n\n| 4 | 12 | 3 |\n| 5 | 20 | 4 |\n| 6 | ? | 7 |',
    options: ['36', '42', '48', '13'],
    answer: 1,
    explanation:
      'The middle entry is the product of the two outer ones: 4 × 3 = 12, 5 × 4 = 20, so 6 × 7 = 42.',
    tip: 'A missing middle usually combines its neighbours. Read the row as outer-operation-outer.'
  },
  {
    id: 'log-177',
    topic: 'Matrix pattern',
    difficulty: 'medium',
    prompt: 'Find the missing number.\n\n| 5 | 7 | 6 |\n| 8 | 4 | 6 |\n| 9 | ? | 3 |',
    options: ['5', '6', '7', '8'],
    answer: 1,
    explanation:
      'Every row adds up to 18: 5 + 7 + 6 and 8 + 4 + 6 both give 18, so the missing number is 18 − 9 − 3 = 6.',
    tip: 'If no operation links the entries, total each complete row or column — a constant sum is the next thing to test.'
  },
  {
    id: 'log-178',
    topic: 'Matrix pattern',
    difficulty: 'hard',
    prompt: 'Find the missing number.\n\n| 2 | 3 | 7 |\n| 3 | 5 | 14 |\n| 4 | 6 | ? |',
    options: ['20', '22', '24', '26'],
    answer: 1,
    explanation:
      'The third entry is the first squared plus the second: 2² + 3 = 7, 3² + 5 = 14, so 4² + 6 = 22.',
    tip: 'When the third number grows faster than a sum but slower than a product, try squaring the first entry.'
  },
  {
    id: 'log-179',
    topic: 'Matrix pattern',
    difficulty: 'hard',
    prompt: 'Find the missing number.\n\n| 3 | 4 | 25 |\n| 5 | 12 | 169 |\n| 6 | 8 | ? |',
    options: ['96', '100', '104', '48'],
    answer: 1,
    explanation:
      'The third entry is the sum of the squares: 3² + 4² = 25, 5² + 12² = 169, so 6² + 8² = 36 + 64 = 100.',
    tip: 'Recognising 3-4-5 and 5-12-13 triples makes this instant: the third entry is the hypotenuse squared.'
  },
  {
    id: 'log-180',
    topic: 'Calendars',
    difficulty: 'easy',
    prompt: 'If today is Wednesday, what day will it be 15 days from now?',
    options: ['Wednesday', 'Thursday', 'Friday', 'Saturday'],
    answer: 1,
    explanation:
      '15 ÷ 7 leaves a remainder of 1, so the answer is one day past Wednesday — Thursday.',
    tip: 'Only the remainder after dividing by 7 matters. Whole weeks never change the day.'
  },
  {
    id: 'log-181',
    topic: 'Calendars',
    difficulty: 'easy',
    prompt: 'The 10th of a month falls on a Monday. What day is the 31st of the same month?',
    options: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'],
    answer: 1,
    explanation: '31 − 10 = 21 days, which is exactly three weeks, so the 31st is a Monday too.',
    tip: 'Dates 7, 14, 21 or 28 apart always land on the same weekday — check the gap before counting.'
  },
  {
    id: 'log-182',
    topic: 'Calendars',
    difficulty: 'medium',
    prompt: 'Which of these is a leap year?',
    options: ['1900', '2000', '2100', '2200'],
    answer: 1,
    explanation:
      'A century year is a leap year only if it divides by 400. 2000 does; 1900, 2100 and 2200 do not.',
    tip: 'Divisible by 4 is a leap year, unless divisible by 100, unless divisible by 400.'
  },
  {
    id: 'log-183',
    topic: 'Calendars',
    difficulty: 'medium',
    prompt: 'If 1 March 2025 is a Saturday, what day is 1 March 2026?',
    options: ['Saturday', 'Sunday', 'Monday', 'Friday'],
    answer: 1,
    explanation:
      'No 29 February falls between the two dates, so the gap is 365 days. 365 ÷ 7 leaves 1, moving the day forward once to Sunday.',
    tip: 'An ordinary year shifts the weekday by 1, a leap year by 2. Check which 29 February the gap actually contains.'
  },
  {
    id: 'log-184',
    topic: 'Calendars',
    difficulty: 'hard',
    prompt: 'If 26 January 2024 was a Friday, what day was 26 January 2025?',
    options: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
    answer: 1,
    explanation:
      '29 February 2024 falls inside this gap, so it spans 366 days. 366 ÷ 7 leaves 2, moving Friday forward twice to Sunday.',
    tip: 'It is not enough that the year is a leap year — the leap day has to lie between the two dates.'
  },
  {
    id: 'log-185',
    topic: 'Calendars',
    difficulty: 'hard',
    prompt: 'If 1 January 2024 was a Monday, what day was 31 December 2024?',
    options: ['Monday', 'Tuesday', 'Wednesday', 'Sunday'],
    answer: 1,
    explanation:
      '2024 has 366 days, so 31 December is 365 days after 1 January. 365 ÷ 7 leaves 1, giving Tuesday.',
    tip: 'Count the gap between the dates, not the length of the year — they differ by one day.'
  },
  {
    id: 'log-186',
    topic: 'Deduction',
    difficulty: 'medium',
    prompt: 'No student who failed the test was admitted. Sinta was admitted. What follows?',
    options: [
      'Sinta did not fail the test.',
      'Sinta scored the highest mark.',
      'Sinta failed the test.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      'Failing rules out admission, so anyone who was admitted cannot have failed. It says nothing about how well she did.',
    tip: 'A “no A is B” premise is the contrapositive machine: being B proves you are not A.'
  },
  {
    id: 'log-187',
    topic: 'Deduction',
    difficulty: 'medium',
    prompt:
      'To enter the lab you need both a badge and a booking. Dimas has a badge but no booking. Can he enter?',
    options: ['Yes', 'No', 'Only with permission', 'It cannot be determined'],
    answer: 1,
    explanation:
      'Both conditions are necessary. Failing either one is enough to block entry, so a missing booking settles it.',
    tip: 'With an “and” requirement, one missing part decides the answer. With an “or”, one present part does.'
  },
  {
    id: 'log-188',
    topic: 'Deduction',
    difficulty: 'medium',
    prompt:
      'Everyone on the team who knows Swift also knows Git. Bima is on the team and does not know Git. What follows?',
    options: [
      'Bima does not know Swift.',
      'Bima knows Swift.',
      'Bima knows another language.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      'Knowing Swift would guarantee knowing Git. Bima does not know Git, so he cannot know Swift — the contrapositive.',
    tip: 'Deny the consequence and you may deny the condition. That is the only backwards move logic allows.'
  },
  {
    id: 'log-189',
    topic: 'Deduction',
    difficulty: 'medium',
    prompt: 'A shop gives a discount only to members. Dita received a discount. What follows?',
    options: [
      'Dita is a member.',
      'Dita is not a member.',
      'Every member receives a discount.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      '“Only members” means the discount implies membership. It does not promise that members always get one.',
    tip: 'Compare this with “all members get a discount”, where the same fact would prove nothing. The word only flips the arrow.'
  },
  {
    id: 'log-190',
    topic: 'Deduction',
    difficulty: 'hard',
    prompt:
      'All A are B. All B are C. Some C are D. Which statement must be true?',
    options: ['All A are C.', 'Some A are D.', 'All C are A.', 'Some B are D.'],
    answer: 0,
    explanation:
      'The two “all” statements chain: A sits inside B, which sits inside C. The D overlap touches C somewhere, but nothing forces it to touch A or B.',
    tip: 'Chains of “all” always transmit. A “some” never travels back down a chain.'
  },
  {
    id: 'log-191',
    topic: 'Deduction',
    difficulty: 'hard',
    prompt:
      'Given:\n\n1. If the tests pass, the build is released.\n2. The build was not released.\n3. Either the tests passed or the server was down.\n\nWhat follows?',
    options: [
      'The server was down.',
      'The tests passed.',
      'The build was released late.',
      'Nothing can be concluded.'
    ],
    answer: 0,
    explanation:
      'From 1 and 2, the tests did not pass. Statement 3 offers two possibilities and one has just been eliminated, so the server was down.',
    tip: 'Chain the contrapositive first, then use it to knock out one side of an “either/or”.'
  },
  {
    id: 'log-192',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'A is the son of B. C is the brother of B. How is C related to A?',
    options: ['A’s uncle', 'A’s father', 'A’s cousin', 'A’s nephew'],
    answer: 0,
    explanation:
      'C is a brother of A’s parent, and C is male, so C is A’s uncle.',
    tip: 'A parent’s brother is an uncle, a parent’s sister an aunt — whichever parent it runs through.'
  },
  {
    id: 'log-193',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Mira is the daughter of Hasan. Hasan is the son of Karim. How is Karim related to Mira?',
    options: ['Her grandfather', 'Her father', 'Her uncle', 'Her brother'],
    answer: 0,
    explanation: 'Karim is the father of Mira’s father, which makes him her grandfather.',
    tip: 'Two “parent of” steps in the same direction always make a grandparent.'
  },
  {
    id: 'log-194',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Rina’s mother is the sister of Budi. How is Budi related to Rina?',
    options: ['Her uncle', 'Her father', 'Her cousin', 'Her grandfather'],
    answer: 0,
    explanation: 'Budi is the brother of Rina’s mother, so he is her maternal uncle.',
    tip: 'Read the sentence backwards: if her mother is his sister, then he is her mother’s brother.'
  },
  {
    id: 'log-195',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Tono is the brother of Sari. Sari is the mother of Dika. How is Tono related to Dika?',
    options: ['His uncle', 'His father', 'His grandfather', 'His cousin'],
    answer: 0,
    explanation: 'Tono is the brother of Dika’s mother — Dika’s uncle.',
    tip: 'Sibling of a parent is one generation up and to the side: uncle or aunt, never a cousin.'
  },
  {
    id: 'log-196',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Someone is the son of your father, and he is not you. How is he related to you?',
    options: ['Your brother', 'Your cousin', 'Your uncle', 'Your nephew'],
    answer: 0,
    explanation: 'Sharing a father and being a different person makes him your brother.',
    tip: '“The son of my father” is the classic disguise for “my brother” — or for the speaker himself.'
  },
  {
    id: 'log-197',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Ani is the wife of Bayu. Bayu is the son of Chandra. How is Chandra related to Ani?',
    options: ['Her father-in-law', 'Her father', 'Her brother-in-law', 'Her uncle'],
    answer: 0,
    explanation: 'Chandra is the father of Ani’s husband, which makes him her father-in-law.',
    tip: 'A relation reached through a marriage takes the “-in-law” suffix, never the plain name.'
  },
  {
    id: 'log-198',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Dewi is the daughter of the sister of my mother. How is Dewi related to me?',
    options: ['My cousin', 'My sister', 'My niece', 'My aunt'],
    answer: 0,
    explanation:
      'My mother’s sister is my aunt, and an aunt’s daughter is my cousin — the same generation as me.',
    tip: 'Aunt or uncle one step up, their children one step back down: that lands on your own generation, a cousin.'
  },
  {
    id: 'log-199',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'A is the mother of B. B is the mother of C. How is A related to C?',
    options: ['C’s grandmother', 'C’s mother', 'C’s aunt', 'C’s sister'],
    answer: 0,
    explanation: 'A is the mother of C’s mother, so A is C’s grandmother.',
    tip: 'Count the generations before naming the relation: two steps up is always a grandparent.'
  },
  {
    id: 'log-200',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Anwar is the only brother of Rudi’s father. How is Rudi related to Anwar?',
    options: ['His nephew', 'His son', 'His cousin', 'His brother'],
    answer: 0,
    explanation:
      'Anwar is Rudi’s uncle, so looking the other way along the same link, Rudi is Anwar’s nephew.',
    tip: 'Questions often ask for the reverse direction. Name the relation both ways before you answer.'
  },
  {
    id: 'log-201',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt:
      'Siti is the granddaughter of Pak Hasan. Pak Hasan has only one child, Ibu Ratna. How is Ratna related to Siti?',
    options: ['Her mother', 'Her aunt', 'Her grandmother', 'Her sister'],
    answer: 0,
    explanation:
      'A grandchild has to come through a child, and Hasan has only one — Ratna. So Ratna is Siti’s mother.',
    tip: 'The word “only” is never decoration. It closes the one alternative route through the family.'
  },
  {
    id: 'log-202',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'How is your mother’s brother’s wife related to you?',
    options: ['Your aunt', 'Your mother', 'Your cousin', 'Your sister-in-law'],
    answer: 0,
    explanation:
      'Your mother’s brother is your uncle, and his wife is your aunt — an aunt by marriage.',
    tip: 'Walk the chain one word at a time: mother → brother → wife. Never jump two links at once.'
  },
  {
    id: 'log-203',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Beni is the son of Cahya. Cahya is the daughter of Dedi. How is Beni related to Dedi?',
    options: ['His grandson', 'His son', 'His nephew', 'His brother'],
    answer: 0,
    explanation: 'Beni is the child of Dedi’s daughter, so Beni is Dedi’s grandson.',
    tip: 'Whether the middle link is a son or a daughter does not change the answer — only the generation count does.'
  },
  {
    id: 'log-204',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'A woman introduces a girl as the daughter of her only sister. How is the girl related to the woman?',
    options: ['Her niece', 'Her daughter', 'Her cousin', 'Her sister'],
    answer: 0,
    explanation: 'A sister’s daughter is a niece.',
    tip: 'A sibling’s child is a niece or nephew; your own child’s child is a grandchild. Keep the two apart.'
  },
  {
    id: 'log-205',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'Anton’s mother is Ratna. Ratna’s husband is Bagas. How is Bagas related to Anton?',
    options: ['His father', 'His uncle', 'His grandfather', 'His brother'],
    answer: 0,
    explanation: 'Bagas is married to Anton’s mother, so in these puzzles he is Anton’s father.',
    tip: '“The husband of my mother” is the standard way of writing “my father”.'
  },
  {
    id: 'log-206',
    topic: 'Blood relations',
    difficulty: 'easy',
    prompt: 'How is your sister’s daughter related to you?',
    options: ['Your niece', 'Your nephew', 'Your cousin', 'Your granddaughter'],
    answer: 0,
    explanation: 'A sibling’s daughter is your niece; a sibling’s son would be your nephew.',
    tip: 'The gender in the answer comes from the person being named, not from the person speaking.'
  },
  {
    id: 'log-207',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'P is the father of Q. Q is the sister of R. R is the son of S. How is S related to P?',
    options: ['P’s wife', 'P’s sister', 'P’s daughter', 'P’s mother'],
    answer: 0,
    explanation:
      'Q and R are siblings. P is their father and S is their mother, so S is P’s wife.',
    tip: 'When two people are siblings, every parent of one is a parent of the other. That is how you link the couple.'
  },
  {
    id: 'log-208',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing to a man, a woman said, “His mother is the only daughter of my father.” How is the woman related to the man?',
    options: ['His mother', 'His sister', 'His aunt', 'His grandmother'],
    answer: 0,
    explanation:
      'The only daughter of her father is the woman herself. So his mother is her — she is his mother.',
    tip: 'Whenever “the only daughter of my father” appears, check first whether it points back at the speaker.'
  },
  {
    id: 'log-209',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'A − B means A is the brother of B.\nA + B means A is the mother of B.\nA × B means A is the father of B.\n\nWhich expression shows that P is the maternal uncle of Q?',
    options: ['P − R + Q', 'P + R − Q', 'P × R + Q', 'P − R × Q'],
    answer: 0,
    explanation:
      'A maternal uncle is the mother’s brother. P − R makes P the brother of R, and R + Q makes R the mother of Q.',
    tip: 'Translate the target relation into a chain first — “brother of the mother of” — then find the expression that spells it.'
  },
  {
    id: 'log-210',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Introducing a woman, Adi says, “She is the wife of the only son of my mother.” How is she related to Adi?',
    options: ['His wife', 'His mother', 'His sister', 'His daughter'],
    answer: 0,
    explanation:
      'The only son of Adi’s mother is Adi himself, so the woman is Adi’s wife.',
    tip: 'If the speaker is male and the clue names “my mother’s only son”, the phrase means the speaker.'
  },
  {
    id: 'log-211',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'M is the son of N. N is the daughter of O. O is the mother of P. P is the brother of Q. How is Q related to M?',
    options: ['M’s uncle or aunt', 'M’s brother', 'M’s cousin', 'M’s grandmother'],
    answer: 0,
    explanation:
      'N, P and Q are all children of O, so Q is a sibling of M’s mother. Q’s gender is never stated, so the answer has to keep both options open.',
    tip: 'If nothing fixes a person’s gender, an answer that names one is wrong. Look for the both-ways option.'
  },
  {
    id: 'log-212',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Deni is the brother of Eka. Eka is the daughter of Fajar. Gita is the mother of Deni. How is Fajar related to Gita?',
    options: ['Her husband', 'Her brother', 'Her father', 'Her son'],
    answer: 0,
    explanation:
      'Deni and Eka are siblings, so Fajar is the father of both and Gita the mother of both. Fajar is therefore Gita’s husband.',
    tip: 'Siblings are the bridge between the two parents. Find the sibling pair and the couple falls out.'
  },
  {
    id: 'log-213',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Rani is the daughter-in-law of Sinta. Bagus is the brother of Rani’s husband. How is Bagus related to Sinta?',
    options: ['Her son', 'Her son-in-law', 'Her brother', 'Her nephew'],
    answer: 0,
    explanation:
      'Rani’s husband is Sinta’s son. Bagus is his brother, so Bagus is another son of Sinta.',
    tip: 'A daughter-in-law is married to your son. Unfold the “-in-law” into the blood link behind it.'
  },
  {
    id: 'log-214',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing to a photograph, Anwar said, “He is the only son of my mother’s only son.” How is the boy related to Anwar?',
    options: ['His son', 'His brother', 'His nephew', 'His cousin'],
    answer: 0,
    explanation:
      'Anwar’s mother’s only son is Anwar, so the boy is Anwar’s only son.',
    tip: 'Resolve the innermost phrase to a single person, write that name down, and only then read the rest.'
  },
  {
    id: 'log-215',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'A family is made up of a man, his wife, their four sons, the wife of each son, and one child per son. How many members does the family have?',
    options: ['12', '14', '16', '18'],
    answer: 1,
    explanation: 'Two parents + four sons + four wives + four grandchildren = 14.',
    tip: 'Count generation by generation and write the running total. Counting people at random is where these go wrong.'
  },
  {
    id: 'log-216',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'A family has a husband, his wife, their two sons and one daughter. Each son is married. How many women are in the family?',
    options: ['3', '4', '5', '6'],
    answer: 1,
    explanation: 'The wife, the daughter and the two sons’ wives make four women.',
    tip: 'Marriages add people who are easy to forget. List every person before you start counting a subset.'
  },
  {
    id: 'log-217',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'How is your mother’s mother’s only son related to you?',
    options: ['Your maternal uncle', 'Your father', 'Your paternal uncle', 'Your cousin'],
    answer: 0,
    explanation:
      'Your mother’s mother is your grandmother, and her only son is your mother’s brother — your maternal uncle.',
    tip: 'Maternal or paternal is decided by which parent the chain runs through, not by the gender of the relative.'
  },
  {
    id: 'log-218',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Kiki said, “That girl’s mother is the only sister of my father.” How is the girl related to Kiki’s father?',
    options: ['His niece', 'His daughter', 'His sister', 'His granddaughter'],
    answer: 0,
    explanation:
      'The girl’s mother is the sister of Kiki’s father, so the girl is the daughter of his sister — his niece.',
    tip: 'Notice who the question asks about. It is often not the speaker but someone one step further along.'
  },
  {
    id: 'log-219',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'A × B means A is the sister of B.\nA + B means A is the husband of B.\nA − B means A is the son of B.\n\nIn P + Q × R, how is P related to R?',
    options: ['R’s brother-in-law', 'R’s brother', 'R’s father', 'R’s uncle'],
    answer: 0,
    explanation:
      'P is the husband of Q, and Q is the sister of R. A sister’s husband is a brother-in-law.',
    tip: 'Read a coded chain left to right, replacing each symbol with its words before you name the ends.'
  },
  {
    id: 'log-220',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'A is the father of B, but B is not the son of A. How is B related to A?',
    options: ['A’s daughter', 'A’s son', 'A’s wife', 'The two statements contradict each other'],
    answer: 0,
    explanation:
      'Being someone’s child without being their son means being their daughter. Nothing here is contradictory.',
    tip: 'Puzzles lean on the assumption that a child is a son. Never assume a gender the question has not given.'
  },
  {
    id: 'log-221',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Pointing at a photograph, Bimo said, “His father is the only brother of my mother.” How is the man in the photograph related to Bimo?',
    options: ['His cousin', 'His brother', 'His nephew', 'His uncle'],
    answer: 0,
    explanation:
      'The only brother of Bimo’s mother is Bimo’s maternal uncle, and an uncle’s son is Bimo’s cousin.',
    tip: 'Resolve the phrase to a relation first — “my uncle” — then apply the last step to it.'
  },
  {
    id: 'log-222',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Anisa is the sister of Bagas. Bagas is the son of Cinta. Cinta is the daughter of Doni. Doni is the father of Eka, a woman. How is Eka related to Anisa?',
    options: ['Her aunt', 'Her mother', 'Her cousin', 'Her grandmother'],
    answer: 0,
    explanation:
      'Cinta and Eka are both children of Doni, so Eka is the sister of Anisa’s mother — her aunt.',
    tip: 'Two people who share a parent are siblings. That is usually the link the chain is hiding.'
  },
  {
    id: 'log-223',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'Yuni’s father is the only son of Pak Karim. Pak Karim’s only daughter is Ratna. How is Yuni related to Ratna?',
    options: ['Her niece', 'Her daughter', 'Her sister', 'Her cousin'],
    answer: 0,
    explanation:
      'Karim’s children are Yuni’s father and Ratna, so they are siblings. Yuni is the daughter of Ratna’s brother — her niece.',
    tip: 'Two “only child” clues about the same parent tell you exactly how many children there are, and that they are siblings.'
  },
  {
    id: 'log-224',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'P is the brother of Q. Q is the father of R. R is the sister of S. How is P related to S?',
    options: ['S’s uncle', 'S’s father', 'S’s brother', 'S’s cousin'],
    answer: 0,
    explanation:
      'R and S are siblings, so Q is the father of both. P is Q’s brother, which makes him S’s uncle.',
    tip: 'Push a sibling link back onto the parent: whatever holds for one of them holds for the other.'
  },
  {
    id: 'log-225',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'A man has three daughters, and each daughter has exactly one brother. How many children does the man have?',
    options: ['4', '6', '7', '3'],
    answer: 0,
    explanation:
      'The daughters share the same brother, so there is one boy, not three. Three girls plus one boy is four children.',
    tip: 'Ask whether the relatives are shared or separate. “Each has one brother” usually means the same brother.'
  },
  {
    id: 'log-226',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'Q is the son of P. R is the daughter of Q. S is the wife of R’s brother. How is S related to P?',
    options: ['P’s granddaughter-in-law', 'P’s daughter-in-law', 'P’s granddaughter', 'P’s niece'],
    answer: 0,
    explanation:
      'R’s brother is another child of Q, so he is P’s grandson. S is married to him, which makes her P’s granddaughter-in-law.',
    tip: 'Work out the blood relation first, then add the marriage. Marrying in never changes the generation.'
  },
  {
    id: 'log-227',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt:
      'A is the mother of B and C. D is the husband of C. E is the father of A. How many generations does this family span?',
    options: ['2', '3', '4', '5'],
    answer: 1,
    explanation:
      'E is the oldest generation, A the next, and B, C and D the youngest — D by marriage to C. That is three.',
    tip: 'A husband or wife sits in the same generation as their partner, so a marriage never adds a layer.'
  },
  {
    id: 'log-228',
    topic: 'Blood relations',
    difficulty: 'medium',
    prompt: 'P is the brother of Q. R is the daughter of Q. S is the sister of P. T is the brother of S. How is T related to R?',
    options: ['R’s uncle', 'R’s father', 'R’s brother', 'R’s cousin'],
    answer: 0,
    explanation:
      'P, Q, S and T are all siblings. R is Q’s daughter, so T is R’s uncle.',
    tip: 'Collect everyone who is a sibling of a sibling into one group — they are all on the same level.'
  },
  {
    id: 'log-229',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Aisyah has as many sisters as brothers. Her brother Rafi has twice as many sisters as brothers. How many children are in the family?',
    options: ['5', '6', '7', '8'],
    answer: 2,
    explanation:
      'With b boys and g girls: Aisyah sees g − 1 sisters and b brothers, so g − 1 = b. Rafi sees g sisters and b − 1 brothers, so g = 2(b − 1). Substituting gives b = 3 and g = 4 — seven children.',
    tip: 'A child is never their own sibling. Subtract one from their own gender’s count before writing the equation.'
  },
  {
    id: 'log-230',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Pointing to a man in a photograph, a woman said, “His mother’s only daughter is my mother.” How is the man related to the woman?',
    options: ['Her maternal uncle', 'Her father', 'Her brother', 'Her grandfather'],
    answer: 0,
    explanation:
      'His mother’s only daughter is his sister, and she is the woman’s mother. So the man is the brother of her mother — her maternal uncle.',
    tip: '“His mother’s daughter” is his sister. Collapse these phrases into one word before joining them up.'
  },
  {
    id: 'log-231',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'A × B means A is the father of B.\nA ÷ B means A is the daughter of B.\nA + B means A is the sister of B.\n\nIn P ÷ Q × R + S, how is P related to S?',
    options: ['S’s sister', 'S’s mother', 'S’s aunt', 'S’s cousin'],
    answer: 0,
    explanation:
      'P is the daughter of Q, and Q is the father of R, so P and R are sisters. R is the sister of S, so all three are siblings — P is S’s sister.',
    tip: 'Chains that meet at the same parent make siblings. Draw the family as a tree, not as a line.'
  },
  {
    id: 'log-232',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Pointing to a man, a woman said, “His son is my son’s uncle.” How is the woman related to the man?',
    options: ['His daughter', 'His sister', 'His wife', 'His mother'],
    answer: 0,
    explanation:
      'Her son’s uncle is her own brother. So the man’s son is her brother, which means the man is her father and she is his daughter.',
    tip: 'Your child’s uncle is your brother. Translate a relation stated through a third person back onto yourself.'
  },
  {
    id: 'log-233',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'In a family of six, A is the son of C but C is not the mother of A. B is the daughter of C. D is the wife of C. E is the son of B. F is the brother of A. How is E related to D?',
    options: ['D’s grandson', 'D’s son', 'D’s nephew', 'D’s brother'],
    answer: 0,
    explanation:
      'C is the father of A, B and F, and D is his wife, so D is their mother. E is B’s son, which makes E the grandson of D.',
    tip: 'A clue like “C is not the mother” exists to fix a gender, not to confuse you. Mark it down and move on.'
  },
  {
    id: 'log-234',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Pointing to a photograph, a man said, “I have no brother or sister, but that man’s father is my father’s son.” Who is in the photograph?',
    options: ['His son', 'His father', 'His nephew', 'He himself'],
    answer: 0,
    explanation:
      'With no siblings, “my father’s son” can only be the speaker. So the man in the photograph has the speaker as his father — the photograph is of his son.',
    tip: '“I have no brother or sister” is the key that turns “my father’s son” into “me”.'
  },
  {
    id: 'log-235',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt: 'M is the son of N. P is the daughter of M. Q is the husband of P. R is the son of Q. How is R related to N?',
    options: ['N’s great-grandson', 'N’s grandson', 'N’s son-in-law', 'N’s nephew'],
    answer: 0,
    explanation:
      'N, M, P and R are four generations: R is the son of P, who is the daughter of M, who is the son of N.',
    tip: 'Count the layers rather than naming each step. Three steps down is a great-grandchild.'
  },
  {
    id: 'log-236',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Two fathers and two sons went fishing. They caught three fish and each of them took exactly one home. How is that possible?',
    options: [
      'They were a grandfather, his son and his grandson',
      'One of them caught nothing and bought a fish',
      'One fish was split between two of them',
      'Only two of them actually went'
    ],
    answer: 0,
    explanation:
      'Only three people went. The middle man is both a father to the youngest and a son to the oldest, so he is counted in both pairs.',
    tip: 'One person can fill two roles at once. When a count seems one too many, look for the person counted twice.'
  },
  {
    id: 'log-237',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt: 'The son of my mother’s only brother is called X. How is X related to my father?',
    options: ['His nephew', 'His son', 'His brother-in-law', 'His cousin'],
    answer: 0,
    explanation:
      'My mother’s only brother is my maternal uncle, and X is his son. Since that uncle is my father’s brother-in-law, X is my father’s nephew — by marriage rather than by blood.',
    tip: 'Answer for the person the question names. The relation to you and the relation to your parent are rarely the same.'
  },
  {
    id: 'log-238',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Ratna’s father Bagus has a sister, Citra. Citra’s daughter is Dewi, and Dewi’s son is Eko. How is Eko related to Ratna?',
    options: ['Her cousin’s son', 'Her nephew', 'Her brother', 'Her uncle'],
    answer: 0,
    explanation:
      'Citra is Ratna’s aunt, so Dewi is Ratna’s cousin, and Eko is that cousin’s son — not her nephew, because Dewi is not her sister.',
    tip: 'Niece and nephew belong to a sibling’s children only. A cousin’s child needs the longer name.'
  },
  {
    id: 'log-239',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'Introducing a man, Rina said, “He is the only son of the mother of my mother’s only daughter.” How is he related to Rina?',
    options: ['Her brother', 'Her father', 'Her uncle', 'Her son'],
    answer: 0,
    explanation:
      'Rina is her mother’s only daughter, so “the mother of my mother’s only daughter” is Rina’s own mother. Her only son is Rina’s brother.',
    tip: 'Unwrap nested phrases from the inside out, replacing each one with a single name as you go.'
  },
  {
    id: 'log-240',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'P × Q means P is the father of Q.\nP + Q means P is the mother of Q.\nP − Q means P is the daughter of Q.\n\nWhich expression means that S is the granddaughter of R?',
    options: ['S − T + R', 'S − T − R', 'S × T − R', 'S + T − R'],
    answer: 1,
    explanation:
      'S − T makes S the daughter of T, and T − R makes T the daughter of R. Two daughter links in a row put S two generations below R.',
    tip: 'Build the chain you need first, then read the options. Searching the options first wastes the time you have.'
  },
  {
    id: 'log-241',
    topic: 'Blood relations',
    difficulty: 'hard',
    prompt:
      'A family of six — P, Q, R, S, T and U — contains exactly two married couples.\n\n• Q is the father of T.\n• U is the grandfather of R.\n• S is the grandmother of T.\n• R and T are the only grandchildren.\n\nHow is R related to Q?',
    options: ['Q’s child', 'Q’s wife', 'Q’s mother', 'Q’s brother'],
    answer: 0,
    explanation:
      'U and S are the grandparents and the first couple. R and T are the grandchildren, which leaves Q and P as the second couple — the parents. So R, like T, is a child of Q.',
    tip: 'Sort everyone into generations before you try to name a single relation. Six people and two couples fixes the layout.'
  },
  {
    id: 'log-242',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Five friends sit in a row of five chairs, all facing north.\n\n• S sits exactly in the middle.\n• Exactly three people sit between Q and T.\n• Q sits immediately to the left of P.\n\nWho sits immediately to the left of T?',
    options: ['R', 'P', 'Q', 'S'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: Q, P, S, R, T from left to right. That gives R.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-243',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Five friends sit in a row of five chairs, all facing north.\n\n• D sits immediately to the left of E.\n• Exactly three people sit between A and C.\n• D sits between C and E.\n\nWho sits exactly in the middle?',
    options: ['E', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: C, D, E, B, A from left to right. That gives E.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-244',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Five friends sit in a row of five chairs, all facing north.\n\n• P is second from the left end.\n• Exactly two people sit between P and T.\n• S sits second to the left of R.\n\nWho sits at the extreme right end?',
    options: ['T', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: S, P, R, Q, T from left to right. That gives T.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-245',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Five friends sit in a row of five chairs, all facing north.\n\n• C is third from the left end.\n• D is fourth from the left end.\n• E sits second to the right of C.\n• Exactly one person sits between D and B.\n\nWho sits third to the right of A?',
    options: ['D', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: A, B, C, D, E from left to right. That gives D.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-246',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• B is fifth from the right end.\n• C sits between B and D.\n• D sits third to the right of A.\n• Exactly two people sit between B and E.\n\nWho sits immediately to the right of C?',
    options: ['D', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: A, B, C, D, E, F from left to right. That gives D.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-247',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• Exactly one person sits between Andi and Citra.\n• Andi sits third to the left of Dewi.\n• Exactly one person sits between Budi and Eko.\n• Citra sits immediately to the left of Budi.\n\nWho sits immediately to the left of Dewi?',
    options: ['Fitri', 'Andi', 'Budi', 'Citra'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: Citra, Budi, Andi, Eko, Fitri, Dewi from left to right. That gives Fitri.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-248',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• K sits at one of the two ends.\n• Exactly one person sits between L and K.\n• Exactly three people sit between N and P.\n• N sits third to the left of O.\n\nWhat is O\'s position from the left end?',
    options: ['fifth from the left', 'first from the left', 'second from the left', 'third from the left'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: K, N, L, M, O, P from left to right. That gives fifth from the left.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-249',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• A sits between B and D.\n• D and C sit next to each other.\n• F sits second to the right of D.\n• Exactly one person sits between E and C.\n\nWho sits at the extreme right end?',
    options: ['E', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: B, A, D, C, F, E from left to right. That gives E.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-250',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• U is fifth from the left end.\n• Exactly one person sits between T and S.\n• Q and T sit next to each other.\n• Exactly two people sit between U and R.\n• R and P sit next to each other.\n\nWho sits immediately to the right of R?',
    options: ['Q', 'P', 'R', 'S'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: P, R, Q, T, U, S from left to right. That gives Q.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-251',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• E is third from the right end.\n• A does not sit next to E.\n• B sits between C and E.\n• B sits third to the left of F.\n\nWhat is E\'s position from the left end?',
    options: ['fourth from the left', 'first from the left', 'second from the left', 'third from the left'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: A, C, B, E, D, F from left to right. That gives fourth from the left.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-252',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• Cinta sits third to the left of Fajar.\n• Endah does not sit next to Bima.\n• Exactly two people sit between Ayu and Endah.\n• Fajar sits second to the left of Dodi.\n\nWho sits immediately to the right of Cinta?',
    options: ['Ayu', 'Bima', 'Cinta', 'Dodi'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: Cinta, Ayu, Bima, Fajar, Endah, Dodi from left to right. That gives Ayu.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-253',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit in a row of six chairs, all facing north.\n\n• N and M sit next to each other.\n• Exactly one person sits between L and P.\n• P does not sit next to K.\n• L sits third to the right of K.\n• Exactly two people sit between P and M.\n\nHow many people sit between N and O?',
    options: ['Two', 'None', 'One', 'Three'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: K, N, M, L, O, P from left to right. That gives Two.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-254',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• F is sixth from the left end.\n• Exactly three people sit between E and F.\n• D sits immediately to the left of C.\n• F does not sit next to B.\n• D sits third to the right of A.\n\nWho sits immediately to the right of A?',
    options: ['E', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: A, E, B, D, C, F, G from left to right. That gives E.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-255',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• P sits at the extreme left end.\n• Exactly two people sit between V and Q.\n• V sits between S and U.\n• P sits immediately to the left of Q.\n• R does not sit next to U.\n• R sits second to the left of V.\n\nWho sits immediately to the right of S?',
    options: ['V', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: P, Q, R, S, V, U, T from left to right. That gives V.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-256',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• G sits at the extreme right end.\n• Exactly three people sit between A and B.\n• B sits immediately to the right of F.\n• E does not sit next to B.\n• Exactly two people sit between C and G.\n• Exactly three people sit between G and E.\n\nWho sits at the extreme right end?',
    options: ['G', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: D, A, E, C, F, B, G from left to right. That gives G.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-257',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• R and S sit next to each other.\n• Exactly one person sits between S and P.\n• T does not sit next to S.\n• T sits second to the left of Q.\n• U sits between R and V.\n\nWho sits exactly in the middle?',
    options: ['S', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: T, P, Q, S, R, U, V from left to right. That gives S.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-258',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• S sits at one of the two ends.\n• Exactly two people sit between V and R.\n• Q sits immediately to the left of R.\n• T sits third to the right of Q.\n• P sits third to the left of S.\n\nWho sits at the extreme left end?',
    options: ['U', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: U, Q, R, P, T, V, S from left to right. That gives U.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-259',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• F and G sit next to each other.\n• B sits third to the left of G.\n• A sits immediately to the right of D.\n• D sits second to the left of G.\n• Exactly two people sit between D and C.\n\nHow many people sit between B and A?',
    options: ['One', 'None', 'Two', 'Three'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: C, E, B, D, A, G, F from left to right. That gives One.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-260',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing north.\n\n• O is fifth from the left end.\n• N sits immediately to the right of O.\n• Exactly one person sits between K and N.\n• L sits third to the left of O.\n• K does not sit next to M.\n• O sits second to the left of Q.\n\nWho sits third to the left of N?',
    options: ['P', 'K', 'L', 'M'],
    answer: 0,
    explanation:
      'They face north, away from you, so their left and right agree with yours. Only one seating satisfies every clue: M, L, P, K, O, N, Q from left to right. That gives P.',
    tip:
      'Fill the fixed seats first — the ends, the middle and any “nth from” clue — and let the rest fall into the gaps.'
  },
  {
    id: 'log-261',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Five friends sit in a row of five chairs, all facing south.\n\n• Exactly two people sit between Q and T.\n• P sits immediately to the right of Q.\n• T does not sit next to R.\n• T sits immediately to the right of S.\n\nWho sits immediately to the left of P?',
    options: ['Q', 'P', 'R', 'S'],
    answer: 0,
    explanation:
      'They face south, towards you, so every left and right in the clues is the mirror of yours — that reversal is the whole difficulty. Only one seating satisfies every clue: T, S, P, Q, R from left to right. That gives Q.',
    tip:
      'Write down which way the row faces before placing anyone. In a south-facing row every left and right is the mirror of yours.'
  },
  {
    id: 'log-262',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Five friends sit in a row of five chairs, all facing south.\n\n• Exactly one person sits between C and B.\n• A does not sit next to E.\n• C sits second to the left of E.\n\nWho sits immediately to the left of D?',
    options: ['C', 'A', 'B', 'D'],
    answer: 0,
    explanation:
      'They face south, towards you, so every left and right in the clues is the mirror of yours — that reversal is the whole difficulty. Only one seating satisfies every clue: E, D, C, A, B from left to right. That gives C.',
    tip:
      'Write down which way the row faces before placing anyone. In a south-facing row every left and right is the mirror of yours.'
  },
  {
    id: 'log-263',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit in a row of six chairs, all facing south.\n\n• Exactly three people sit between P and T.\n• S sits between R and T.\n• T sits immediately to the left of U.\n\nWho sits immediately to the right of R?',
    options: ['S', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face south, towards you, so every left and right in the clues is the mirror of yours — that reversal is the whole difficulty. Only one seating satisfies every clue: U, T, S, R, Q, P from left to right. That gives S.',
    tip:
      'Write down which way the row faces before placing anyone. In a south-facing row every left and right is the mirror of yours.'
  },
  {
    id: 'log-264',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing south.\n\n• B sits at one of the two ends.\n• G sits at one of the two ends.\n• Exactly one person sits between D and A.\n• Exactly one person sits between C and A.\n• Exactly three people sit between E and G.\n• E sits third to the right of D.\n\nWho sits third to the left of A?',
    options: ['G', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'They face south, towards you, so every left and right in the clues is the mirror of yours — that reversal is the whole difficulty. Only one seating satisfies every clue: B, C, E, A, F, D, G from left to right. That gives G.',
    tip:
      'Write down which way the row faces before placing anyone. In a south-facing row every left and right is the mirror of yours.'
  },
  {
    id: 'log-265',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Seven friends sit in a row of seven chairs, all facing south.\n\n• R sits third to the left of U.\n• R does not sit at either end.\n• Exactly two people sit between S and P.\n• Q sits between P and R.\n• T sits immediately to the right of S.\n• V does not sit next to P.\n\nWho sits immediately to the right of S?',
    options: ['T', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'They face south, towards you, so every left and right in the clues is the mirror of yours — that reversal is the whole difficulty. Only one seating satisfies every clue: V, U, T, S, R, Q, P from left to right. That gives T.',
    tip:
      'Write down which way the row faces before placing anyone. In a south-facing row every left and right is the mirror of yours.'
  },
  {
    id: 'log-266',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• B sits third to the right of E.\n• C sits directly opposite F.\n• A does not sit next to E.\n• A sits immediately to the left of F.\n\nWho sits immediately to the right of D?',
    options: ['C', 'A', 'B', 'D'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: A, B, C, D, E, F clockwise. That gives C.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-267',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• R sits between Q and S.\n• T sits immediately to the left of U.\n• Q sits second to the right of U.\n\nWho sits immediately to the right of T?',
    options: ['U', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: P, U, T, S, R, Q clockwise. That gives U.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-268',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• E does not sit next to B.\n• A does not sit next to B.\n• C sits third to the right of A.\n• E does not sit next to D.\n• E sits second to the left of C.\n\nWho sits immediately to the right of C?',
    options: ['B', 'A', 'C', 'D'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: A, D, B, C, F, E clockwise. That gives B.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-269',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• Cici does not sit next to Bayu.\n• Dian sits immediately to the right of Eka.\n• Fina sits second to the left of Cici.\n\nWho sits directly opposite Cici?',
    options: ['Bayu', 'Ali', 'Cici', 'Dian'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: Ali, Fina, Bayu, Dian, Eka, Cici clockwise. That gives Bayu.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-270',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• N sits immediately to the right of P.\n• P and L sit next to each other.\n• O sits between M and N.\n\nWho sits immediately to the left of P?',
    options: ['L', 'K', 'M', 'N'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: K, M, O, N, P, L clockwise. That gives L.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-271',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Eight friends sit around a circular table, all facing the centre.\n\n• G sits directly opposite C.\n• F sits third to the right of H.\n• F does not sit next to E.\n• D sits immediately to the left of G.\n• E sits directly opposite A.\n\nWho sits immediately to the left of F?',
    options: ['A', 'B', 'C', 'D'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: A, C, H, B, E, G, D, F clockwise. That gives A.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-272',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit around a circular table, all facing the centre.\n\n• T sits immediately to the left of Q.\n• V sits between R and T.\n• W sits immediately to the left of S.\n• T sits directly opposite P.\n\nWho sits second to the right of U?',
    options: ['V', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: P, S, W, Q, T, V, R, U clockwise. That gives V.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-273',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit around a circular table, all facing the centre.\n\n• B sits second to the left of F.\n• F sits immediately to the left of C.\n• H and A sit next to each other.\n• E sits third to the right of C.\n• D sits third to the left of H.\n\nWho sits immediately to the right of G?',
    options: ['B', 'A', 'C', 'D'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: A, H, C, F, D, B, G, E clockwise. That gives B.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-274',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit around a circular table, all facing the centre.\n\n• D sits third to the left of C.\n• B does not sit next to E.\n• C sits immediately to the right of B.\n• A sits third to the left of B.\n\nWho sits immediately to the left of B?',
    options: ['F', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'Facing the centre, a person’s left is their clockwise neighbour and their right the anticlockwise one. Only one seating satisfies every clue: A, E, C, B, F, D clockwise. That gives F.',
    tip:
      'Turn each clue into seat arithmetic: opposite means add half the seats, and “nth to the left” is n steps clockwise.'
  },
  {
    id: 'log-275',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit around a circular table, all facing away from the centre.\n\n• A sits immediately to the left of B.\n• D sits second to the left of F.\n• B sits third to the right of E.\n\nWho sits immediately to the left of D?',
    options: ['C', 'A', 'B', 'D'],
    answer: 0,
    explanation:
      'Facing outwards reverses the usual rule: a person’s right is now their clockwise neighbour. Only one seating satisfies every clue: A, B, C, D, E, F clockwise. That gives C.',
    tip:
      'Facing outwards flips left and right. Note the direction once at the top of your sketch and then trust it.'
  },
  {
    id: 'log-276',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit around a circular table, all facing away from the centre.\n\n• T and S sit next to each other.\n• T sits third to the left of R.\n• U sits directly opposite Q.\n• Q sits second to the right of S.\n\nWho sits directly opposite R?',
    options: ['T', 'P', 'Q', 'R'],
    answer: 0,
    explanation:
      'Facing outwards reverses the usual rule: a person’s right is now their clockwise neighbour. Only one seating satisfies every clue: P, R, U, S, T, Q clockwise. That gives T.',
    tip:
      'Facing outwards flips left and right. Note the direction once at the top of your sketch and then trust it.'
  },
  {
    id: 'log-277',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit around a circular table, all facing away from the centre.\n\n• D sits immediately to the right of F.\n• G sits second to the right of H.\n• E sits immediately to the right of H.\n• E sits second to the right of B.\n• C sits second to the right of D.\n\nWho sits immediately to the right of E?',
    options: ['G', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'Facing outwards reverses the usual rule: a person’s right is now their clockwise neighbour. Only one seating satisfies every clue: A, C, B, H, E, G, F, D clockwise. That gives G.',
    tip:
      'Facing outwards flips left and right. Note the direction once at the top of your sketch and then trust it.'
  },
  {
    id: 'log-278',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Six friends sit in two rows of three, facing each other. The near row faces south and the far row faces north, so each person faces exactly one person opposite.\n\n• F sits in the far row.\n• A does not sit next to F.\n• D does not sit next to B.\n• A does not sit next to C.\n• E faces B.\n• F sits immediately to the right of E.\n• C sits immediately to the left of B.\n\nWho faces C?',
    options: ['F', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'The two rows read in opposite directions, because they face opposite ways. Only one seating satisfies every clue: near row A, B, C, far row D, E, F. That gives F.',
    tip:
      'Fix one row completely before you touch the other, then use the facing pairs to carry it across.'
  },
  {
    id: 'log-279',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit in two rows of four, facing each other. The near row faces south and the far row faces north, so each person faces exactly one person opposite.\n\n• D sits in the near row.\n• A sits second to the right of C.\n• E sits second to the left of G.\n• B sits immediately to the right of C.\n• D sits second to the left of B.\n• E does not sit next to H.\n\nWho faces D?',
    options: ['H', 'A', 'B', 'C'],
    answer: 0,
    explanation:
      'The two rows read in opposite directions, because they face opposite ways. Only one seating satisfies every clue: near row A, B, C, D, far row E, F, G, H. That gives H.',
    tip:
      'Fix one row completely before you touch the other, then use the facing pairs to carry it across.'
  },
  {
    id: 'log-280',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt: 'In a row of chairs, Dimas is 12th from the left end and 9th from the right end. How many people are in the row?',
    options: ['20', '21', '19', '22'],
    answer: 0,
    explanation:
      'Adding the two positions counts Dimas twice, so the total is 12 + 9 − 1 = 20.',
    tip: 'Position from one end plus position from the other always overlaps by exactly one person.'
  },
  {
    id: 'log-281',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt: 'Twenty-five people sit in a row. Rani is 11th from the left end. What is her position from the right end?',
    options: ['15th', '14th', '16th', '13th'],
    answer: 0,
    explanation: 'Her position from the right is 25 − 11 + 1 = 15th.',
    tip: 'Converting between ends is total − position + 1. Forgetting the “+ 1” is the usual slip.'
  },
  {
    id: 'log-282',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt: 'In a queue, Ayu is 10th from the front and 5th from the back. How many people are in the queue?',
    options: ['14', '15', '13', '16'],
    answer: 0,
    explanation: 'Ayu is counted in both figures, so the queue holds 10 + 5 − 1 = 14 people.',
    tip: 'A queue is a row. The same overlap rule applies to front and back as to left and right.'
  },
  {
    id: 'log-283',
    topic: 'Seating arrangement',
    difficulty: 'easy',
    prompt: 'Nine chairs stand in a row. How many chairs are there between the 3rd and the 8th chair?',
    options: ['4', '5', '3', '6'],
    answer: 0,
    explanation: 'The chairs strictly between them are numbers 4, 5, 6 and 7 — four of them, or 8 − 3 − 1.',
    tip: '“Between” excludes both endpoints: subtract the positions and then subtract one more.'
  },
  {
    id: 'log-284',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt: 'Thirty people sit in a row. Adit is 10th from the left end and Bela is 12th from the right end. How many people sit between them?',
    options: ['8', '7', '9', '10'],
    answer: 0,
    explanation:
      'Bela’s position from the left is 30 − 12 + 1 = 19. Between seats 10 and 19 there are 19 − 10 − 1 = 8 people.',
    tip: 'Put both people on the same scale — usually positions from the left — before you subtract.'
  },
  {
    id: 'log-285',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt: 'Twenty people sit in a row. Kiki is 6th from the left end and Rani is 6th from the right end. How many people sit between them?',
    options: ['8', '9', '7', '10'],
    answer: 0,
    explanation:
      'Rani is 20 − 6 + 1 = 15th from the left. Between seats 6 and 15 there are 15 − 6 − 1 = 8 people.',
    tip: 'Symmetric positions do not mean the gap is symmetric — convert both to the same end and subtract.'
  },
  {
    id: 'log-286',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'In a row, Sinta is 3rd from the left end, Tio is 3rd from the right end, and exactly 4 people sit between them. How many people are in the row?',
    options: ['10', '9', '11', '12'],
    answer: 0,
    explanation:
      'Counting across the row: 2 people to Sinta’s left, Sinta, 4 between, Tio, and 2 to Tio’s right — 2 + 1 + 4 + 1 + 2 = 10.',
    tip: 'When neither end position is known, count the row in blocks: outside, person, gap, person, outside.'
  },
  {
    id: 'log-287',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Sixteen people sit around a circular table facing the centre, numbered 1 to 16 clockwise. Which seat is directly opposite seat 5?',
    options: ['Seat 13', 'Seat 12', 'Seat 11', 'Seat 14'],
    answer: 0,
    explanation: 'Opposite means half the table away: 5 + 8 = 13.',
    tip: 'At a circular table of n people, the seat opposite is always n ÷ 2 seats further round.'
  },
  {
    id: 'log-288',
    topic: 'Seating arrangement',
    difficulty: 'medium',
    prompt:
      'Twelve people sit around a circular table. Counting along one side only, how many people sit between two people who are directly opposite each other?',
    options: ['5', '6', '4', '7'],
    answer: 0,
    explanation:
      'The two of them split the remaining ten people into two equal arcs, so each side holds 10 ÷ 2 = 5 people.',
    tip: 'Take the two named people out of the count first, then divide what is left between the two arcs.'
  },
  {
    id: 'log-289',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Nadia is 5th from the left end of a row and Bagas is 6th from the right end. They exchange seats, after which Nadia is 12th from the left end. How many people are in the row?',
    options: ['17', '16', '18', '15'],
    answer: 0,
    explanation:
      'After the swap Nadia occupies Bagas’s old seat, so that seat is 12th from the left. Bagas was also 6th from the right, giving 12 + 6 − 1 = 17.',
    tip: 'A swap tells you one seat by two different measurements. Combine those two, and ignore where the person started.'
  },
  {
    id: 'log-290',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Forty people sit in a row. Rio is 16th from the left end, and Sari sits 8 places to his right. What is Sari’s position from the right end?',
    options: ['17th', '16th', '18th', '25th'],
    answer: 0,
    explanation:
      'Sari is 16 + 8 = 24th from the left, so from the right she is 40 − 24 + 1 = 17th.',
    tip: 'Do the two steps separately: move along the row first, then convert to the other end.'
  },
  {
    id: 'log-291',
    topic: 'Seating arrangement',
    difficulty: 'hard',
    prompt:
      'Eight friends sit around a circular table facing the centre. Who is the person sitting third to the left of the person sitting second to the right of Andi?',
    options: [
      'The person immediately to Andi’s left',
      'Andi himself',
      'The person immediately to Andi’s right',
      'The person directly opposite Andi'
    ],
    answer: 0,
    explanation:
      'Two seats to the right and then three to the left is a net movement of one seat to the left, whatever the table size. So it is Andi’s immediate left-hand neighbour.',
    tip: 'Chained directions cancel. Add the steps as signed numbers before you touch the seating plan.'
  }
];
