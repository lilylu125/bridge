import {
  CourseConfig,
  CourseId,
  HintStep,
  LectureChunk,
  PracticeQuestion,
  TopicReadiness,
} from "../types";

export const SAMPLE_LECTURE_TEXT = `[11:52] A mole is a counting unit, like a dozen, but much bigger. One mole of anything holds about 6.022 × 10^23 particles. This number is called Avogadro's number.
[13:30] The molar mass tells you how many grams one mole of a substance weighs. You find it by adding up the atomic masses of every atom in the formula. For water, H2O, that's two hydrogens at 1.008 and one oxygen at 16.00, so about 18.02 grams per mole.
[14:20] To turn grams into moles, divide the mass by the molar mass. For example, 36 grams of water divided by 18 grams per mole gives 2 moles.
[22:10] In a balanced equation, the coefficients give you the mole ratio. In 2H2 + O2 → 2H2O, two moles of hydrogen react with one mole of oxygen to make two moles of water.`;

export const LECTURE_7_CHUNKS: LectureChunk[] = [
  {
    index: 1,
    total: 9,
    title: "Why chemists count by weight",
    timeRange: "00:00–06:00",
    lines: [
      {
        timestamp: "01:15",
        chip: "Lecture 7 · 01:15",
        text: "Atoms are far too small to count one by one on a lab bench, so we group them into a standard counting unit.",
      },
      {
        timestamp: "04:40",
        chip: "Lecture 7 · 04:40",
        text: "Just like a baker uses a dozen for 12 eggs, chemists use a mole to link mass on a scale to particle counts.",
      },
    ],
  },
  {
    index: 2,
    total: 9,
    title: "Atomic mass on the periodic table",
    timeRange: "06:00–12:00",
    lines: [
      {
        timestamp: "07:25",
        chip: "Lecture 7 · 07:25",
        text: "The decimal number under each element symbol gives its average atomic mass in atomic mass units, and also its mass in grams per mole.",
      },
      {
        timestamp: "10:50",
        chip: "Lecture 7 · 10:50",
        text: "Next, we connect that atomic mass number directly to Avogadro's counting unit.",
      },
    ],
  },
  {
    index: 3,
    total: 9,
    title: "Moles, molar mass, and mole ratios",
    timeRange: "12:00–18:00",
    lines: [
      {
        timestamp: "11:52",
        chip: "Lecture 7 · 11:52",
        text: "A mole is a counting unit, like a dozen, but much bigger. One mole of anything holds about 6.022 × 10^23 particles. This number is called Avogadro's number.",
      },
      {
        timestamp: "13:30",
        chip: "Lecture 7 · 13:30",
        text: "The molar mass tells you how many grams one mole of a substance weighs. You find it by adding up the atomic masses of every atom in the formula. For water, H2O, that's two hydrogens at 1.008 and one oxygen at 16.00, so about 18.02 grams per mole.",
      },
      {
        timestamp: "14:20",
        chip: "Lecture 7 · 14:20",
        text: "To turn grams into moles, divide the mass by the molar mass. For example, 36 grams of water divided by 18 grams per mole gives 2 moles.",
      },
      {
        timestamp: "22:10",
        chip: "Lecture 7 · 22:10",
        text: "In a balanced equation, the coefficients give you the mole ratio. In 2H2 + O2 → 2H2O, two moles of hydrogen react with one mole of oxygen to make two moles of water.",
      },
    ],
  },
  {
    index: 4,
    total: 9,
    title: "Converting moles back to grams",
    timeRange: "18:00–24:00",
    lines: [
      {
        timestamp: "18:45",
        chip: "Lecture 7 · 18:45",
        text: "To go the other direction from moles to grams, multiply the number of moles by the molar mass.",
      },
    ],
  },
  {
    index: 5,
    total: 9,
    title: "Reading mole ratios in reactions",
    timeRange: "24:00–30:00",
    lines: [
      {
        timestamp: "22:10",
        chip: "Lecture 7 · 22:10",
        text: "In a balanced equation, the coefficients give you the mole ratio. In 2H2 + O2 → 2H2O, two moles of hydrogen react with one mole of oxygen to make two moles of water.",
      },
    ],
  },
  {
    index: 6,
    total: 9,
    title: "Two-step stoichiometry setup",
    timeRange: "30:00–36:00",
    lines: [
      {
        timestamp: "31:10",
        chip: "Lecture 7 · 31:10",
        text: "Convert starting grams to moles first, use the mole ratio from coefficients, and convert back to grams if asked.",
      },
    ],
  },
  {
    index: 7,
    total: 9,
    title: "Common unit pitfalls",
    timeRange: "36:00–42:00",
    lines: [
      {
        timestamp: "37:05",
        chip: "Lecture 7 · 37:05",
        text: "Always check that grams cancel out when dividing by grams per mole, leaving moles in the numerator.",
      },
    ],
  },
  {
    index: 8,
    total: 9,
    title: "Checking conservation of mass",
    timeRange: "42:00–48:00",
    lines: [
      {
        timestamp: "43:20",
        chip: "Lecture 7 · 43:20",
        text: "Total grams of reactants equal total grams of products even when the number of moles changes.",
      },
    ],
  },
  {
    index: 9,
    total: 9,
    title: "Preview: limiting reagents",
    timeRange: "48:00–52:00",
    lines: [
      {
        timestamp: "49:00",
        chip: "Lecture 7 · 49:00",
        text: "Next lecture we look at what happens when one reactant runs out before the other.",
      },
    ],
  },
];

export const MIDTERM_TOPICS: TopicReadiness[] = [
  { topic: "Atoms and isotopes", status: "Strong" },
  { topic: "The mole and molar mass", status: "Strong" },
  { topic: "Balancing equations", status: "Shaky" },
  { topic: "Stoichiometry", status: "Shaky" },
  { topic: "Limiting reagents", status: "Not reviewed" },
];

export const PRACTICE_QUESTIONS: PracticeQuestion[] = [
  // Core (3 original questions)
  {
    id: "q1",
    topic: "Moles and mass",
    difficulty: "Core",
    prompt: "How many moles are in 36 g of water (H2O, 18 g/mol)?",
    options: ["0.5 mol", "2 mol", "18 mol", "648 mol"],
    correctAnswer: "2 mol",
    explanation:
      "Dividing 36 grams of water by its molar mass of 18 grams per mole gives 2 moles.",
    sourceChip: "Lecture 7 · 14:20",
    sourceTimestamp: "14:20",
  },
  {
    id: "q2",
    topic: "The mole and Avogadro's number",
    difficulty: "Core",
    prompt: "Avogadro's number is the number of particles in…",
    options: ["one gram", "one mole", "one litre of gas", "one atom"],
    correctAnswer: "one mole",
    explanation:
      "One mole of any substance holds about 6.022 × 10^23 particles, which is called Avogadro's number.",
    sourceChip: "Lecture 7 · 11:52",
    sourceTimestamp: "11:52",
  },
  {
    id: "q3",
    topic: "Stoichiometry and mole ratios",
    difficulty: "Core",
    prompt: "In 2H2 + O2 → 2H2O, how many moles of O2 react with 4 mol of H2?",
    options: ["1", "2", "4", "8"],
    correctAnswer: "2",
    explanation:
      "The balanced equation uses 1 mole of O2 for every 2 moles of H2, so 4 moles of H2 react with 2 moles of O2.",
    sourceChip: "Lecture 7 · 22:10",
    sourceTimestamp: "22:10",
  },

  // Foundation: 2 per topic (3 topics = 6 Foundation)
  {
    id: "chem-f-avogadro-1",
    topic: "The mole and Avogadro's number",
    difficulty: "Foundation",
    prompt: "A mole is used in chemistry as a counting unit, similar to a…",
    options: ["meter", "dozen", "degree", "second"],
    correctAnswer: "dozen",
    explanation:
      "Just like a dozen stands for 12 items, a mole is a counting unit holding about 6.022 × 10^23 particles.",
    sourceChip: "Lecture 7 · 11:52",
    sourceTimestamp: "11:52",
  },
  {
    id: "chem-f-avogadro-2",
    topic: "The mole and Avogadro's number",
    difficulty: "Foundation",
    prompt: "About how many particles are in 1 mole of any substance?",
    options: ["18.02", "100", "6.022 × 10^23", "1.008"],
    correctAnswer: "6.022 × 10^23",
    explanation:
      "One mole of anything holds about 6.022 × 10^23 particles (Avogadro's number).",
    sourceChip: "Lecture 7 · 11:52",
    sourceTimestamp: "11:52",
  },
  {
    id: "chem-f-moles-1",
    topic: "Moles and mass",
    difficulty: "Foundation",
    prompt: "What does molar mass tell you about a substance?",
    options: [
      "How many grams 1 mole weighs",
      "How fast a reaction runs",
      "How many protons are in an atom",
      "The temperature of boiling water",
    ],
    correctAnswer: "How many grams 1 mole weighs",
    explanation:
      "Molar mass tells you how many grams one mole of a substance weighs, found by adding the atomic masses in the formula.",
    sourceChip: "Lecture 7 · 13:30",
    sourceTimestamp: "13:30",
  },
  {
    id: "chem-f-moles-2",
    topic: "Moles and mass",
    difficulty: "Foundation",
    prompt: "To convert grams into moles, you take the sample mass and…",
    options: [
      "multiply by the molar mass",
      "divide by the molar mass",
      "add Avogadro's number",
      "subtract 18.02",
    ],
    correctAnswer: "divide by the molar mass",
    explanation:
      "Dividing the mass in grams by the molar mass gives the number of moles.",
    sourceChip: "Lecture 7 · 14:20",
    sourceTimestamp: "14:20",
  },
  {
    id: "chem-f-stoich-1",
    topic: "Stoichiometry and mole ratios",
    difficulty: "Foundation",
    prompt: "In a balanced chemical equation, what gives you the mole ratio?",
    options: [
      "The atomic numbers",
      "The coefficients in front of formulas",
      "The temperature of the room",
      "The molar mass of water",
    ],
    correctAnswer: "The coefficients in front of formulas",
    explanation:
      "In a balanced equation, the coefficients give the mole ratio between reactants and products.",
    sourceChip: "Lecture 7 · 22:10",
    sourceTimestamp: "22:10",
  },
  {
    id: "chem-f-stoich-2",
    topic: "Stoichiometry and mole ratios",
    difficulty: "Foundation",
    prompt: "In 2H2 + O2 → 2H2O, how many moles of H2O form from 1 mole of O2?",
    options: ["1 mole", "2 moles", "3 moles", "4 moles"],
    correctAnswer: "2 moles",
    explanation:
      "The equation 2H2 + O2 → 2H2O shows 1 mole of O2 makes 2 moles of water.",
    sourceChip: "Lecture 7 · 22:10",
    sourceTimestamp: "22:10",
  },

  // Exam-level: 2 per topic (3 topics = 6 Exam-level)
  {
    id: "chem-e-avogadro-1",
    topic: "The mole and Avogadro's number",
    difficulty: "Exam-level",
    prompt: "How many water molecules are in 36 g of H2O (18 g/mol)?",
    options: [
      "3.011 × 10^23",
      "6.022 × 10^23",
      "1.204 × 10^24",
      "2.168 × 10^25",
    ],
    correctAnswer: "1.204 × 10^24",
    explanation:
      "36 g ÷ 18 g/mol gives 2 moles, and 2 × 6.022 × 10^23 particles equals 1.204 × 10^24 molecules.",
    sourceChip: "Lecture 7 · 11:52",
    sourceTimestamp: "11:52",
  },
  {
    id: "chem-e-avogadro-2",
    topic: "The mole and Avogadro's number",
    difficulty: "Exam-level",
    prompt: "Which sample contains the largest number of particles?",
    options: [
      "18 g of H2O (18 g/mol)",
      "0.5 mol of O2",
      "2.5 mol of H2",
      "9 g of H2O (18 g/mol)",
    ],
    correctAnswer: "2.5 mol of H2",
    explanation:
      "Particle count depends only on moles (1 mol = 6.022 × 10^23 particles), and 2.5 mol is more than 1 mol or 0.5 mol.",
    sourceChip: "Lecture 7 · 11:52",
    sourceTimestamp: "11:52",
  },
  {
    id: "chem-e-moles-1",
    topic: "Moles and mass",
    difficulty: "Exam-level",
    prompt:
      "Hydrogen peroxide has formula H2O2 (H = 1.008, O = 16.00). What is the mass in grams of 0.50 moles of H2O2?",
    options: ["17.01 g", "34.02 g", "68.03 g", "18.02 g"],
    correctAnswer: "17.01 g",
    explanation:
      "Molar mass of H2O2 is 2(1.008) + 2(16.00) = 34.02 g/mol, so 0.50 mol weighs 17.01 g.",
    sourceChip: "Lecture 7 · 13:30",
    sourceTimestamp: "13:30",
  },
  {
    id: "chem-e-moles-2",
    topic: "Moles and mass",
    difficulty: "Exam-level",
    prompt:
      "You weigh out 54 g of water (H2O, 18 g/mol). How many moles of hydrogen atoms (H) are inside that water?",
    options: ["1.5 mol", "3 mol", "6 mol", "9 mol"],
    correctAnswer: "6 mol",
    explanation:
      "54 g ÷ 18 g/mol = 3 mol of H2O, and each H2O molecule contains 2 H atoms, giving 6 mol of H atoms.",
    sourceChip: "Lecture 7 · 14:20",
    sourceTimestamp: "14:20",
  },
  {
    id: "chem-e-stoich-1",
    topic: "Stoichiometry and mole ratios",
    difficulty: "Exam-level",
    prompt:
      "In 2H2 + O2 → 2H2O, how many grams of water (18 g/mol) form when 3.0 moles of O2 react completely with excess H2?",
    options: ["36 g", "54 g", "108 g", "216 g"],
    correctAnswer: "108 g",
    explanation:
      "3.0 mol O2 yields 6.0 mol H2O from the 1:2 ratio, and 6.0 mol × 18 g/mol = 108 g.",
    sourceChip: "Lecture 7 · 22:10",
    sourceTimestamp: "22:10",
  },
  {
    id: "chem-e-stoich-2",
    topic: "Stoichiometry and mole ratios",
    difficulty: "Exam-level",
    prompt:
      "To produce 90 g of H2O (18 g/mol) via 2H2 + O2 → 2H2O, how many moles of O2 are required?",
    options: ["1.25 mol", "2.5 mol", "5.0 mol", "10.0 mol"],
    correctAnswer: "2.5 mol",
    explanation:
      "90 g ÷ 18 g/mol = 5.0 mol H2O, and the 1 O2 : 2 H2O ratio means 2.5 mol O2 are required.",
    sourceChip: "Lecture 7 · 22:10",
    sourceTimestamp: "22:10",
  },
];

export const CO2_HINT_LADDER: HintStep[] = [
  {
    step: 1,
    label: "Nudge",
    text: "Which atoms are in CO2, and how many of each?",
  },
  {
    step: 2,
    label: "Concept",
    text: "Molar mass adds each atom's mass times how many there are.",
    sourceChip: "Lecture 7 · 13:30",
  },
  {
    step: 3,
    label: "Worked example (different molecule)",
    text: "Using H2O instead: 2 × 1.008 + 16.00 = 18.02 g/mol",
  },
  {
    step: 4,
    label: "Self-check",
    text: "Did you count 1 carbon and 2 oxygens? Are your units g/mol?",
  },
];

const CS_LECTURE_TEXT = `[04:10] Every recursive function needs a base case that stops the calls from repeating forever. Without a base case, the call stack fills up and crashes.
[09:15] In a recursive step, the function calls itself on a smaller piece of the original problem, moving closer to the base case each time.
[14:30] Tracing a call stack means writing down each active call from bottom to top until the base case returns a value back up the chain.
[19:45] An array search that splits a sorted list in half each step runs in O(log n) time, which is much faster than checking items one by one in O(n).`;

const BUS_LECTURE_TEXT = `[06:20] Fixed costs stay the same each month no matter how many units you sell, such as rent or equipment leases.
[11:40] Variable cost per unit is the expense tied to each extra item made, like materials or packaging.
[15:10] Contribution margin per unit equals selling price minus variable cost per unit. It shows how much each sale contributes toward covering fixed costs.
[21:05] The break-even quantity is fixed costs divided by contribution margin per unit. At that point, total revenue equals total cost and profit is zero.`;

export const COURSES: Record<CourseId, CourseConfig> = {
  chem101: {
    id: "chem101",
    code: "CHEM 101",
    name: "Intro Chemistry",
    shortTitle: "Moles and stoichiometry",
    currentLectureLabel: "Lecture 7",
    lecturePrefix: "Lecture 7",
    bannerTitle: "Lecture 7 is up: Moles and stoichiometry",
    stats: {
      lecturesReviewed: "6 of 7",
      upcomingLabel: "Midterm 1",
      upcomingValue: "in 7 days",
    },
    readinessTitle: "Readiness for Midterm 1",
    defaultUnderstanding: 4,
    defaultDailyChecks: [1, 2, 0, 2, 1, 0, 0],
    topics: MIDTERM_TOPICS,
    sampleLectureText: SAMPLE_LECTURE_TEXT,
    defaultChunkIndex: 2,
    chunks: LECTURE_7_CHUNKS,
    practiceQuestions: PRACTICE_QUESTIONS,
    calculationProblem: {
      id: "chem-co2",
      prompt: "What is the molar mass of CO2? (C = 12.01, O = 16.00 g/mol)",
      placeholder: "Enter g/mol (e.g. 44.0)",
      acceptedRange: [43.95, 44.05],
      successExplanation:
        "One carbon (12.01) plus two oxygens (2 × 16.00) is 44.01 g/mol.",
      sourceChip: "Lecture 7 · 13:30",
      sourceTimestamp: "13:30",
      hints: CO2_HINT_LADDER,
    },
    wordProblem: {
      id: "chem-word-1",
      title: "Stoichiometry lab word problem",
      prompt:
        "During lab, you run the reaction 2H2 + O2 → 2H2O and collect 72 g of water (molar mass 18 g/mol). How many moles of O2 gas were needed to form that water? Show your steps in words or draw them with Apple Pencil.",
      unitLabel: "mol O2",
      placeholder: "Enter moles of O2 (e.g. 2)",
      acceptedRange: [1.95, 2.05],
      successExplanation:
        "72 g ÷ 18 g/mol = 4 mol H2O. Since 2 mol H2O require 1 mol O2, 4 mol H2O require 2 mol O2.",
      sourceChip: "Lecture 7 · 22:10",
      sourceTimestamp: "22:10",
      quickSymbols: ["÷", "×", "→", "=", "mol", "g/mol", "H2O", "O2"],
      hints: [
        {
          step: 1,
          label: "Nudge",
          text: "Break this into two smaller steps: first convert 72 g of water into moles, then use the balanced equation ratio.",
        },
        {
          step: 2,
          label: "Concept",
          text: "Divide grams by molar mass to get moles, then compare the coefficients of O2 and H2O.",
          sourceChip: "Lecture 7 · 14:20",
        },
        {
          step: 3,
          label: "Worked example (different numbers)",
          text: "If you had 36 g of H2O (18 g/mol), that is 36 ÷ 18 = 2 mol H2O, which uses 1 mol O2 because the ratio is 1 O2 : 2 H2O.",
          sourceChip: "Lecture 7 · 22:10",
        },
        {
          step: 4,
          label: "Self-check",
          text: "Did you divide 72 by 18 first, and then divide those moles of H2O by 2 for O2?",
        },
      ],
    },
  },
  cs110: {
    id: "cs110",
    code: "CS 110",
    name: "Computer Science",
    shortTitle: "Recursion and search",
    currentLectureLabel: "Lecture 5",
    lecturePrefix: "Lecture 5",
    bannerTitle: "Lecture 5 is up: Recursion and binary search",
    stats: {
      lecturesReviewed: "4 of 5",
      upcomingLabel: "Lab Quiz 2",
      upcomingValue: "in 4 days",
    },
    readinessTitle: "Readiness for Lab Quiz 2",
    defaultUnderstanding: 3,
    defaultDailyChecks: [1, 0, 2, 1, 0, 0, 0],
    topics: [
      { topic: "Functions & scope", status: "Strong" },
      { topic: "Loops & arrays", status: "Strong" },
      { topic: "Recursion & base cases", status: "Shaky" },
      { topic: "Binary search", status: "Shaky" },
      { topic: "Trees & traversal", status: "Not reviewed" },
    ],
    sampleLectureText: CS_LECTURE_TEXT,
    defaultChunkIndex: 0,
    chunks: [
      {
        index: 1,
        total: 6,
        title: "Base cases, recursive steps, and binary search",
        timeRange: "04:00–21:00",
        lines: [
          {
            timestamp: "04:10",
            chip: "Lecture 5 · 04:10",
            text: "Every recursive function needs a base case that stops the calls from repeating forever. Without a base case, the call stack fills up and crashes.",
          },
          {
            timestamp: "09:15",
            chip: "Lecture 5 · 09:15",
            text: "In a recursive step, the function calls itself on a smaller piece of the original problem, moving closer to the base case each time.",
          },
          {
            timestamp: "14:30",
            chip: "Lecture 5 · 14:30",
            text: "Tracing a call stack means writing down each active call from bottom to top until the base case returns a value back up the chain.",
          },
          {
            timestamp: "19:45",
            chip: "Lecture 5 · 19:45",
            text: "An array search that splits a sorted list in half each step runs in O(log n) time, which is much faster than checking items one by one in O(n).",
          },
        ],
      },
    ],
    practiceQuestions: [
      // Core (3)
      {
        id: "cs-q1",
        topic: "Recursion & base cases",
        difficulty: "Core",
        prompt: "What happens if a recursive function is missing a base case?",
        options: [
          "It runs in O(log n) time",
          "It keeps calling itself until the stack overflows",
          "It returns 0 automatically",
          "It turns into a for-loop",
        ],
        correctAnswer: "It keeps calling itself until the stack overflows",
        explanation:
          "Without a base case to stop recursion, new calls keep piling onto the call stack until it crashes.",
        sourceChip: "Lecture 5 · 04:10",
        sourceTimestamp: "04:10",
      },
      {
        id: "cs-q2",
        topic: "Binary search",
        difficulty: "Core",
        prompt: "Which search method runs in O(log n) time on a sorted array?",
        options: [
          "Checking each item from index 0",
          "Splitting the sorted list in half each step",
          "Sorting the array every step",
          "Scanning backwards from the end",
        ],
        correctAnswer: "Splitting the sorted list in half each step",
        explanation:
          "Halving a sorted list at every step eliminates half the remaining items at once, giving O(log n) time.",
        sourceChip: "Lecture 5 · 19:45",
        sourceTimestamp: "19:45",
      },
      {
        id: "cs-q3",
        topic: "Recursion & base cases",
        difficulty: "Core",
        prompt: "What must each recursive step do relative to the original input?",
        options: [
          "Make the problem larger",
          "Move closer to the base case on a smaller piece",
          "Copy the entire call stack",
          "Skip the return statement",
        ],
        correctAnswer: "Move closer to the base case on a smaller piece",
        explanation:
          "Each recursive step calls the function on a smaller piece of the problem so it eventually reaches the base case.",
        sourceChip: "Lecture 5 · 09:15",
        sourceTimestamp: "09:15",
      },
      // Foundation (2 per topic = 4)
      {
        id: "cs-f-rec-1",
        topic: "Recursion & base cases",
        difficulty: "Foundation",
        prompt: "What is the purpose of a base case in recursion?",
        options: [
          "To stop the recursive calls",
          "To sort an unsorted array",
          "To double the stack size",
          "To speed up printing",
        ],
        correctAnswer: "To stop the recursive calls",
        explanation:
          "The base case provides the stopping condition so recursion ends cleanly.",
        sourceChip: "Lecture 5 · 04:10",
        sourceTimestamp: "04:10",
      },
      {
        id: "cs-f-rec-2",
        topic: "Recursion & base cases",
        difficulty: "Foundation",
        prompt: "Tracing a call stack means tracking active calls until…",
        options: [
          "the base case returns a value",
          "the computer restarts",
          "a list is halved",
          "all loops finish",
        ],
        correctAnswer: "the base case returns a value",
        explanation:
          "Active calls stay on the stack until the base case returns a value back up the chain.",
        sourceChip: "Lecture 5 · 14:30",
        sourceTimestamp: "14:30",
      },
      {
        id: "cs-f-bin-1",
        topic: "Binary search",
        difficulty: "Foundation",
        prompt: "Before running binary search, an array must be…",
        options: ["empty", "sorted", "odd-length", "reversed"],
        correctAnswer: "sorted",
        explanation:
          "Binary search requires a sorted list so splitting in half can discard the wrong side.",
        sourceChip: "Lecture 5 · 19:45",
        sourceTimestamp: "19:45",
      },
      {
        id: "cs-f-bin-2",
        topic: "Binary search",
        difficulty: "Foundation",
        prompt: "Checking items one by one from start to end runs in…",
        options: ["O(1)", "O(log n)", "O(n)", "O(n^2)"],
        correctAnswer: "O(n)",
        explanation:
          "Checking items one by one takes linear O(n) time, slower than O(log n).",
        sourceChip: "Lecture 5 · 19:45",
        sourceTimestamp: "19:45",
      },
      // Exam-level (2 per topic = 4)
      {
        id: "cs-e-rec-1",
        topic: "Recursion & base cases",
        difficulty: "Exam-level",
        prompt:
          "In f(n): if n <= 1 return 1; else return n + f(n - 2). What does f(5) return?",
        options: ["6", "8", "9", "15"],
        correctAnswer: "9",
        explanation:
          "f(5) = 5 + f(3) = 5 + 3 + f(1) = 5 + 3 + 1 = 9.",
        sourceChip: "Lecture 5 · 14:30",
        sourceTimestamp: "14:30",
      },
      {
        id: "cs-e-rec-2",
        topic: "Recursion & base cases",
        difficulty: "Exam-level",
        prompt:
          "In countSteps(n): if n == 0 return 0; else return 1 + countSteps(n / 2). If n = 8 (integer division), how many stack frames exist at peak depth?",
        options: ["3 frames", "4 frames", "5 frames", "8 frames"],
        correctAnswer: "5 frames",
        explanation:
          "Calls are countSteps(8), (4), (2), (1), and (0) — 5 active frames at peak depth.",
        sourceChip: "Lecture 5 · 14:30",
        sourceTimestamp: "14:30",
      },
      {
        id: "cs-e-bin-1",
        topic: "Binary search",
        difficulty: "Exam-level",
        prompt:
          "What is the maximum number of halving steps binary search needs on a sorted list of 1,024 items?",
        options: ["8 steps", "10 steps", "16 steps", "512 steps"],
        correctAnswer: "10 steps",
        explanation:
          "Since 2^10 = 1,024, halving 1,024 items takes at most 10 steps in O(log n) time.",
        sourceChip: "Lecture 5 · 19:45",
        sourceTimestamp: "19:45",
      },
      {
        id: "cs-e-bin-2",
        topic: "Binary search",
        difficulty: "Exam-level",
        prompt:
          "If a sorted dataset grows from 1,000 items to 1,000,000 items, roughly how many extra steps does O(log n) binary search add?",
        options: [
          "About 10 extra steps",
          "About 1,000 extra steps",
          "About 500,000 extra steps",
          "It doubles the runtime",
        ],
        correctAnswer: "About 10 extra steps",
        explanation:
          "Multiplying size by 1,000 (about 2^10) adds only ~10 halving steps in O(log n) search.",
        sourceChip: "Lecture 5 · 19:45",
        sourceTimestamp: "19:45",
      },
    ],
    calculationProblem: {
      id: "cs-calc-1",
      prompt:
        "If binary search starts with a sorted list of 64 items and cuts it in half each step, how many items remain after 3 splits?",
      placeholder: "Enter number of items",
      acceptedRange: [8, 8],
      successExplanation:
        "64 → 32 → 16 → 8 items remain after 3 halving steps.",
      sourceChip: "Lecture 5 · 19:45",
      sourceTimestamp: "19:45",
      hints: [
        {
          step: 1,
          label: "Nudge",
          text: "Divide 64 by 2 once for each of the 3 steps.",
        },
        {
          step: 2,
          label: "Concept",
          text: "Binary search cuts the remaining search space in half on every comparison.",
          sourceChip: "Lecture 5 · 19:45",
        },
        {
          step: 3,
          label: "Worked example (different size)",
          text: "Starting from 16 items: after 1 split → 8, after 2 splits → 4, after 3 splits → 2 items.",
        },
        {
          step: 4,
          label: "Self-check",
          text: "Did you divide by 2 three separate times (64 ÷ 2 ÷ 2 ÷ 2)?",
        },
      ],
    },
    wordProblem: {
      id: "cs-word-1",
      title: "Recursive call-stack word problem",
      prompt:
        "A recursive function sumDown(n) adds n + sumDown(n - 1), with a base case returning 0 when n is 0. If you call sumDown(4), how many total calls to sumDown are placed on the stack (including sumDown(0))? Show the call chain in words or sketch the stack with Apple Pencil.",
      unitLabel: "calls",
      placeholder: "Enter number of calls",
      acceptedRange: [5, 5],
      successExplanation:
        "sumDown(4) → sumDown(3) → sumDown(2) → sumDown(1) → sumDown(0) makes 5 calls in total.",
      sourceChip: "Lecture 5 · 14:30",
      sourceTimestamp: "14:30",
      quickSymbols: ["→", "()", "+", "-", "=", "base", "return"],
      hints: [
        {
          step: 1,
          label: "Nudge",
          text: "Write out each call starting at 4 and stepping down by 1 until you hit the base case 0.",
        },
        {
          step: 2,
          label: "Concept",
          text: "Each recursive call waits on the call stack until the base case returns.",
          sourceChip: "Lecture 5 · 14:30",
        },
        {
          step: 3,
          label: "Worked example (different input)",
          text: "For sumDown(2): sumDown(2) calls sumDown(1), which calls sumDown(0) — that is 3 calls total.",
        },
        {
          step: 4,
          label: "Self-check",
          text: "Did you remember to count both the starting call sumDown(4) and the base case sumDown(0)?",
        },
      ],
    },
  },
  bus105: {
    id: "bus105",
    code: "BUS 105",
    name: "Business",
    shortTitle: "Costs and break-even",
    currentLectureLabel: "Lecture 6",
    lecturePrefix: "Lecture 6",
    bannerTitle: "Lecture 6 is up: Break-even and contribution margin",
    stats: {
      lecturesReviewed: "5 of 6",
      upcomingLabel: "Case Check",
      upcomingValue: "in 5 days",
    },
    readinessTitle: "Readiness for Case Check",
    defaultUnderstanding: 3,
    defaultDailyChecks: [0, 1, 1, 1, 0, 0, 0],
    topics: [
      { topic: "Fixed vs. variable costs", status: "Strong" },
      { topic: "Revenue & pricing", status: "Strong" },
      { topic: "Contribution margin", status: "Shaky" },
      { topic: "Break-even volume", status: "Shaky" },
      { topic: "Cash flow statements", status: "Not reviewed" },
    ],
    sampleLectureText: BUS_LECTURE_TEXT,
    defaultChunkIndex: 0,
    chunks: [
      {
        index: 1,
        total: 7,
        title: "Fixed costs, contribution margin, and break-even",
        timeRange: "06:00–22:00",
        lines: [
          {
            timestamp: "06:20",
            chip: "Lecture 6 · 06:20",
            text: "Fixed costs stay the same each month no matter how many units you sell, such as rent or equipment leases.",
          },
          {
            timestamp: "11:40",
            chip: "Lecture 6 · 11:40",
            text: "Variable cost per unit is the expense tied to each extra item made, like materials or packaging.",
          },
          {
            timestamp: "15:10",
            chip: "Lecture 6 · 15:10",
            text: "Contribution margin per unit equals selling price minus variable cost per unit. It shows how much each sale contributes toward covering fixed costs.",
          },
          {
            timestamp: "21:05",
            chip: "Lecture 6 · 21:05",
            text: "The break-even quantity is fixed costs divided by contribution margin per unit. At that point, total revenue equals total cost and profit is zero.",
          },
        ],
      },
    ],
    practiceQuestions: [
      // Core (3)
      {
        id: "bus-q1",
        topic: "Fixed vs. variable costs",
        difficulty: "Core",
        prompt: "Which of these is a fixed cost for a campus coffee stand?",
        options: [
          "Paper cups per drink",
          "Coffee beans per cup",
          "Monthly kiosk rent",
          "Milk per latte",
        ],
        correctAnswer: "Monthly kiosk rent",
        explanation:
          "Monthly rent stays the same whether you sell 10 drinks or 500 drinks.",
        sourceChip: "Lecture 6 · 06:20",
        sourceTimestamp: "06:20",
      },
      {
        id: "bus-q2",
        topic: "Contribution margin",
        difficulty: "Core",
        prompt: "Contribution margin per unit is calculated as…",
        options: [
          "Fixed costs ÷ selling price",
          "Selling price − variable cost per unit",
          "Total revenue + fixed costs",
          "Variable cost × units sold",
        ],
        correctAnswer: "Selling price − variable cost per unit",
        explanation:
          "Subtracting variable cost per unit from selling price tells you how much each unit contributes toward fixed costs.",
        sourceChip: "Lecture 6 · 15:10",
        sourceTimestamp: "15:10",
      },
      {
        id: "bus-q3",
        topic: "Break-even volume",
        difficulty: "Core",
        prompt: "At the exact break-even quantity, what is total profit?",
        options: [
          "Equal to fixed costs",
          "Zero (total revenue equals total cost)",
          "Double the variable cost",
          "Negative one unit",
        ],
        correctAnswer: "Zero (total revenue equals total cost)",
        explanation:
          "At break-even, total revenue exactly equals total cost, so profit is zero.",
        sourceChip: "Lecture 6 · 21:05",
        sourceTimestamp: "21:05",
      },
      // Foundation (2 per topic = 4)
      {
        id: "bus-f-cost-1",
        topic: "Fixed vs. variable costs",
        difficulty: "Foundation",
        prompt: "Expenses tied to each extra unit made, like packaging, are called…",
        options: [
          "fixed costs",
          "variable costs",
          "profit margins",
          "leases",
        ],
        correctAnswer: "variable costs",
        explanation:
          "Variable cost per unit is the expense tied to each extra item made.",
        sourceChip: "Lecture 6 · 11:40",
        sourceTimestamp: "11:40",
      },
      {
        id: "bus-f-cost-2",
        topic: "Fixed vs. variable costs",
        difficulty: "Foundation",
        prompt: "If you sell zero units this month, which cost do you still pay?",
        options: [
          "Packaging per item",
          "Fixed costs like rent",
          "Shipping labels per order",
          "Materials per unit",
        ],
        correctAnswer: "Fixed costs like rent",
        explanation:
          "Fixed costs stay the same each month no matter how many units you sell.",
        sourceChip: "Lecture 6 · 06:20",
        sourceTimestamp: "06:20",
      },
      {
        id: "bus-f-be-1",
        topic: "Break-even volume",
        difficulty: "Foundation",
        prompt: "What does contribution margin per unit help cover?",
        options: [
          "Only variable costs",
          "Fixed costs",
          "Next year's taxes",
          "Employee commutes",
        ],
        correctAnswer: "Fixed costs",
        explanation:
          "Contribution margin shows how much each sale contributes toward covering fixed costs.",
        sourceChip: "Lecture 6 · 15:10",
        sourceTimestamp: "15:10",
      },
      {
        id: "bus-f-be-2",
        topic: "Break-even volume",
        difficulty: "Foundation",
        prompt: "Break-even quantity is fixed costs divided by…",
        options: [
          "selling price",
          "variable cost",
          "contribution margin per unit",
          "number of employees",
        ],
        correctAnswer: "contribution margin per unit",
        explanation:
          "You divide fixed costs by contribution margin per unit to find break-even quantity.",
        sourceChip: "Lecture 6 · 21:05",
        sourceTimestamp: "21:05",
      },
      // Exam-level (2 per topic = 4)
      {
        id: "bus-e-cost-1",
        topic: "Fixed vs. variable costs",
        difficulty: "Exam-level",
        prompt:
          "A print shop pays $1,200/month rent and $4 per poster in ink and paper. What is total monthly cost for 250 posters?",
        options: ["$1,000", "$1,200", "$2,200", "$3,200"],
        correctAnswer: "$2,200",
        explanation:
          "Total cost = $1,200 fixed + (250 × $4) variable = $1,200 + $1,000 = $2,200.",
        sourceChip: "Lecture 6 · 11:40",
        sourceTimestamp: "11:40",
      },
      {
        id: "bus-e-cost-2",
        topic: "Fixed vs. variable costs",
        difficulty: "Exam-level",
        prompt:
          "If variable cost per unit drops from $6 to $4 while price stays $14, what happens to contribution margin per unit?",
        options: [
          "It drops by $2",
          "It rises by $2 to $10",
          "It stays $8",
          "It drops to $4",
        ],
        correctAnswer: "It rises by $2 to $10",
        explanation:
          "Contribution margin = $14 − $4 = $10, which is $2 higher than $14 − $6 = $8.",
        sourceChip: "Lecture 6 · 15:10",
        sourceTimestamp: "15:10",
      },
      {
        id: "bus-e-be-1",
        topic: "Break-even volume",
        difficulty: "Exam-level",
        prompt:
          "Fixed costs are $1,500/month, selling price is $25, and variable cost is $10/unit. How many units are needed to earn $300 profit?",
        options: ["100 units", "120 units", "150 units", "180 units"],
        correctAnswer: "120 units",
        explanation:
          "Contribution margin is $15/unit. Covering $1,500 fixed + $300 target profit requires $1,800 ÷ $15 = 120 units.",
        sourceChip: "Lecture 6 · 21:05",
        sourceTimestamp: "21:05",
      },
      {
        id: "bus-e-be-2",
        topic: "Break-even volume",
        difficulty: "Exam-level",
        prompt:
          "If fixed costs double from $500 to $1,000 while contribution margin per unit stays $5, how does break-even quantity change?",
        options: [
          "Stays 100 units",
          "Increases by 50 units",
          "Doubles from 100 to 200 units",
          "Halves to 50 units",
        ],
        correctAnswer: "Doubles from 100 to 200 units",
        explanation:
          "Since break-even = fixed costs ÷ contribution margin, doubling fixed costs doubles break-even from 100 to 200 units.",
        sourceChip: "Lecture 6 · 21:05",
        sourceTimestamp: "21:05",
      },
    ],
    calculationProblem: {
      id: "bus-calc-1",
      prompt:
        "A tote bag sells for $20 and has a variable cost of $8 per bag. What is the contribution margin per bag in dollars?",
      placeholder: "Enter dollars (e.g. 12)",
      acceptedRange: [12, 12],
      successExplanation:
        "$20 selling price minus $8 variable cost gives $12 contribution margin per bag.",
      sourceChip: "Lecture 6 · 15:10",
      sourceTimestamp: "15:10",
      hints: [
        {
          step: 1,
          label: "Nudge",
          text: "Subtract the per-unit variable cost from the selling price.",
        },
        {
          step: 2,
          label: "Concept",
          text: "Contribution margin per unit = selling price − variable cost per unit.",
          sourceChip: "Lecture 6 · 15:10",
        },
        {
          step: 3,
          label: "Worked example (different item)",
          text: "For a $15 mug with $5 variable cost: $15 − $5 = $10 contribution margin.",
        },
        {
          step: 4,
          label: "Self-check",
          text: "Did you use the price ($20) minus the variable cost ($8)?",
        },
      ],
    },
    wordProblem: {
      id: "bus-word-1",
      title: "Break-even café word problem",
      prompt:
        "A student-run smoothie cart pays $600/month in fixed cart rent. Each smoothie sells for $7 and costs $3 in fruit and cups. How many smoothies must the cart sell in a month to break even? Show your steps in words or sketch them with Apple Pencil.",
      unitLabel: "smoothies",
      placeholder: "Enter number of smoothies",
      acceptedRange: [150, 150],
      successExplanation:
        "Contribution margin is $7 − $3 = $4 per smoothie. Dividing $600 fixed costs by $4 gives 150 smoothies.",
      sourceChip: "Lecture 6 · 21:05",
      sourceTimestamp: "21:05",
      quickSymbols: ["$", "−", "÷", "=", "units", "FC", "CM"],
      hints: [
        {
          step: 1,
          label: "Nudge",
          text: "First find how much profit each smoothie brings in after fruit and cups ($7 − $3).",
        },
        {
          step: 2,
          label: "Concept",
          text: "Break-even units = fixed costs ÷ contribution margin per unit.",
          sourceChip: "Lecture 6 · 21:05",
        },
        {
          step: 3,
          label: "Worked example (different numbers)",
          text: "If fixed costs were $400 and contribution margin was $2 per item, break-even would be $400 ÷ $2 = 200 items.",
        },
        {
          step: 4,
          label: "Self-check",
          text: "Did you divide $600 by the contribution margin ($4), rather than dividing by the $7 price?",
        },
      ],
    },
  },
};

export const COURSE_LIST: CourseConfig[] = [
  COURSES.chem101,
  COURSES.cs110,
  COURSES.bus105,
];

export function getCourseById(id: CourseId): CourseConfig {
  return COURSES[id] ?? COURSES.chem101;
}
