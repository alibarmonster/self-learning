/**
 * Design, UX & Product — optional practice, not part of the Tech-division
 * paper, which is Logic then Programming and nothing else. Kept for the Design
 * category, for the group interview, and because older accounts describe a
 * short bonus round of exactly this material. The Academy itself teaches
 * Challenge Based Learning, so a few questions cover that vocabulary too.
 */

export const design = [
  {
    id: 'des-01',
    topic: 'UX fundamentals',
    difficulty: 'easy',
    prompt: 'What is the primary goal of user experience (UX) design?',
    options: [
      'Making the interface look as beautiful as possible.',
      'Making the product genuinely useful and easy to use for real people.',
      'Adding as many features as competitors have.',
      'Reducing the size of the app binary.'
    ],
    answer: 1,
    explanation:
      'Aesthetics matter, but UX is about whether someone can accomplish their goal without friction. A beautiful app nobody can navigate has failed.'
  },
  {
    id: 'des-02',
    topic: 'Design process',
    difficulty: 'medium',
    prompt: 'What is the correct order of the five stages of design thinking?',
    options: [
      'Define → Empathize → Test → Ideate → Prototype',
      'Empathize → Define → Ideate → Prototype → Test',
      'Ideate → Prototype → Empathize → Define → Test',
      'Prototype → Test → Define → Ideate → Empathize'
    ],
    answer: 1,
    explanation:
      'You first understand the user (empathize), frame the real problem (define), generate options (ideate), build something rough (prototype), then learn from users (test) — and loop.'
  },
  {
    id: 'des-03',
    topic: 'Design artefacts',
    difficulty: 'medium',
    prompt: 'What is the difference between a wireframe and a prototype?',
    options: [
      'They are the same thing with different names.',
      'A wireframe is a low-fidelity static layout; a prototype is interactive and can be clicked through.',
      'A wireframe is always in colour; a prototype is always grey.',
      'A prototype is drawn on paper; a wireframe must be digital.'
    ],
    answer: 1,
    explanation:
      'Wireframes settle structure and hierarchy cheaply. Prototypes add interaction so you can actually test a flow with users before writing code.'
  },
  {
    id: 'des-04',
    topic: 'Apple platforms',
    difficulty: 'easy',
    prompt: 'What does HIG stand for in the Apple ecosystem?',
    options: [
      'High Impact Graphics',
      'Human Interface Guidelines',
      'Hierarchical Interaction Grid',
      'Hybrid Interface Generator'
    ],
    answer: 1,
    explanation:
      'The Human Interface Guidelines are Apple’s reference for designing apps that feel native across iOS, iPadOS, macOS, watchOS and visionOS.'
  },
  {
    id: 'des-05',
    topic: 'Apple platforms',
    difficulty: 'medium',
    prompt:
      'Apple’s guidelines recommend a minimum tappable target size on iOS of roughly:',
    options: ['12 × 12 points', '24 × 24 points', '44 × 44 points', '96 × 96 points'],
    answer: 2,
    explanation:
      '44 × 44 points is the long-standing minimum that comfortably fits an adult fingertip. Smaller targets cause mis-taps and frustration.'
  },
  {
    id: 'des-06',
    topic: 'Accessibility',
    difficulty: 'medium',
    prompt: 'Which change most improves accessibility for a user who relies on VoiceOver?',
    options: [
      'Increasing the animation speed of transitions.',
      'Adding meaningful accessibility labels to icon-only buttons.',
      'Using a more decorative font.',
      'Removing all text from the interface.'
    ],
    answer: 1,
    explanation:
      'A screen reader cannot describe a glyph. Without a label, an icon-only button is announced as "button" and its purpose is lost.'
  },
  {
    id: 'des-07',
    topic: 'Accessibility',
    difficulty: 'medium',
    prompt: 'Why is relying on colour alone to convey status a problem?',
    options: [
      'Colour rendering differs slightly between screens.',
      'Users with colour vision deficiency, or in bright sunlight, cannot distinguish the states.',
      'Colours increase the download size of the app.',
      'It is not a problem as long as the colours are bright.'
    ],
    answer: 1,
    explanation:
      'Colour should be reinforced by a second channel — an icon, label or shape — so the meaning survives for everyone in every context.'
  },
  {
    id: 'des-08',
    topic: 'Usability heuristics',
    difficulty: 'medium',
    prompt: 'A user taps "Delete" and nothing visibly happens for four seconds. Which usability principle is violated?',
    options: [
      'Aesthetic and minimalist design',
      'Visibility of system status',
      'Recognition rather than recall',
      'Match between system and the real world'
    ],
    answer: 1,
    explanation:
      'The system should always keep users informed about what is going on, through a spinner, progress indicator or immediate optimistic feedback.'
  },
  {
    id: 'des-09',
    topic: 'Usability heuristics',
    difficulty: 'medium',
    prompt: 'What does "affordance" mean in interface design?',
    options: [
      'How much the product costs to build.',
      'A visual cue that suggests how an element can be used, such as a raised button that looks pressable.',
      'The number of features in a screen.',
      'The loading time of a page.'
    ],
    answer: 1,
    explanation:
      'A good affordance makes the correct action obvious without instructions — an underlined link, a draggable handle, a scroll indicator.'
  },
  {
    id: 'des-10',
    topic: 'Research',
    difficulty: 'medium',
    prompt: 'What is the purpose of a user persona?',
    options: [
      'To describe the developer building the app.',
      'To represent a research-based archetype of a target user so the team designs for a concrete person rather than "everyone".',
      'To list all the app’s features.',
      'To decide the app’s colour palette.'
    ],
    answer: 1,
    explanation:
      'Personas capture goals, context and frustrations drawn from real research, keeping decisions anchored to a specific user rather than assumptions.'
  },
  {
    id: 'des-11',
    topic: 'Research',
    difficulty: 'medium',
    prompt: 'What is A/B testing used for?',
    options: [
      'Checking whether the app compiles on two devices.',
      'Showing two variants to different groups of users to measure which performs better on a chosen metric.',
      'Testing the app in two programming languages.',
      'Comparing two developers’ code quality.'
    ],
    answer: 1,
    explanation:
      'A/B testing replaces opinion with evidence by running a controlled comparison against a real metric such as conversion or retention.'
  },
  {
    id: 'des-12',
    topic: 'Research',
    difficulty: 'hard',
    prompt:
      'You have limited time before a release. What is the most effective first step to find major usability problems?',
    options: [
      'Survey 1,000 users about their favourite colour.',
      'Run a moderated usability test where about five people attempt real tasks while you observe.',
      'Add more features so users have more to explore.',
      'Ask the engineering team whether the app feels easy.'
    ],
    answer: 1,
    explanation:
      'Watching a handful of users attempt real tasks surfaces the large majority of severe usability issues quickly, and far more reliably than asking the team that built it.'
  },
  {
    id: 'des-13',
    topic: 'Product & business',
    difficulty: 'easy',
    prompt: 'What is an MVP (Minimum Viable Product)?',
    options: [
      'A polished version 1.0 with every planned feature.',
      'The smallest version that delivers real value and lets you learn from users.',
      'A prototype that is never shown to anyone.',
      'The most expensive feature in the roadmap.'
    ],
    answer: 1,
    explanation:
      'An MVP is a learning tool: ship the smallest thing that genuinely solves the core problem, then let real usage decide what comes next.'
  },
  {
    id: 'des-14',
    topic: 'Product & business',
    difficulty: 'medium',
    prompt: 'Which best describes a freemium business model?',
    options: [
      'The app is free and contains no way to spend money.',
      'The core app is free, and users pay to unlock advanced features or remove limits.',
      'Users pay once to download the app.',
      'The app is only available to enterprise customers.'
    ],
    answer: 1,
    explanation:
      'Freemium lowers the barrier to trying the product and monetises the smaller group of users who need more than the free tier provides.'
  },
  {
    id: 'des-15',
    topic: 'Product & business',
    difficulty: 'medium',
    prompt: 'What is a value proposition?',
    options: [
      'The price of the product.',
      'A clear statement of the benefit the product delivers, for whom, and why it is better than the alternatives.',
      'The list of technologies used to build the product.',
      'The company’s quarterly revenue target.'
    ],
    answer: 1,
    explanation:
      'It answers "why should this particular person choose this product?" — the foundation of both positioning and prioritisation.'
  },
  {
    id: 'des-16',
    topic: 'Product & business',
    difficulty: 'medium',
    prompt:
      'Your app has 100,000 downloads but only 4% of users open it again after day 7. Which problem should you address first?',
    options: [
      'Acquisition — buy more advertising to increase downloads.',
      'Retention — find out why the product is not delivering enough value to bring people back.',
      'Monetisation — raise the subscription price.',
      'Branding — redesign the app icon.'
    ],
    answer: 1,
    explanation:
      'Pouring more users into a leaky product wastes the spend. Weak day-7 retention signals that the core value is not landing, and that has to be fixed first.'
  },
  {
    id: 'des-17',
    topic: 'Challenge Based Learning',
    difficulty: 'medium',
    prompt:
      'Apple Developer Academy teaches with Challenge Based Learning. What are its three main phases?',
    options: [
      'Plan, Build, Ship',
      'Engage, Investigate, Act',
      'Design, Code, Test',
      'Research, Report, Repeat'
    ],
    answer: 1,
    explanation:
      'CBL moves from Engage (find a big idea and an essential question) to Investigate (research guiding questions) to Act (build, implement and evaluate a solution).'
  },
  {
    id: 'des-18',
    topic: 'Challenge Based Learning',
    difficulty: 'medium',
    prompt:
      'In a team challenge, two members strongly disagree on the app’s direction. What is the most constructive response?',
    options: [
      'Let the loudest person decide so the team can move on.',
      'Turn the disagreement into a testable question and use user research or a quick prototype to decide.',
      'Split the team and build both versions separately.',
      'Escalate to the mentor immediately without discussing it.'
    ],
    answer: 1,
    explanation:
      'Collaboration is explicitly part of what the Academy selects for. Converting an opinion clash into evidence keeps the team aligned and the decision honest.'
  },
  {
    id: 'des-19',
    topic: 'Visual design',
    difficulty: 'medium',
    prompt: 'What does visual hierarchy mean?',
    options: [
      'Placing elements alphabetically.',
      'Arranging size, weight, colour and spacing so the eye reaches the most important content first.',
      'Using only one font size everywhere.',
      'Putting all controls at the bottom of the screen.'
    ],
    answer: 1,
    explanation:
      'Hierarchy tells the user where to look. Without it every element competes equally and the screen becomes exhausting to parse.'
  },
  {
    id: 'des-20',
    topic: 'Visual design',
    difficulty: 'easy',
    prompt: 'Why does consistency matter across the screens of an app?',
    options: [
      'It reduces the number of files in the project.',
      'Users learn a pattern once and can reuse it everywhere, lowering the effort of every later screen.',
      'It is required by the App Store review process.',
      'It makes the app load faster.'
    ],
    answer: 1,
    explanation:
      'Consistent placement, naming and behaviour let users transfer what they already know instead of relearning each screen from scratch.'
  }
];
