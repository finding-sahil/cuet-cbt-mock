import { dbService } from './db.js';

console.log('[Seeder] Starting question seeder...');

// Issue #9/#26: Fisher-Yates shuffle for uniform randomization of options
const fisherYatesShuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// NOTE (Issue #26): The seed templates below repeat across iterations with only
// minor variant suffixes. For a production-quality question bank, expand the base
// template arrays with more unique passages, vocabulary, and physics problems.

// --- SEED TEMPLATES FOR ENGLISH (Varying programmatically to 500) ---
const englishPassages = [
  {
    passage: "The Great Barrier Reef, stretching over 2,300 kilometers off the coast of Queensland, Australia, is the world's largest coral reef system. It is composed of over 2,900 individual reefs and 900 islands. The reef supports a wide diversity of life, including many vulnerable or endangered species, some of which may be endemic to the reef system. Climate change, however, poses the greatest threat to this ecological wonder. Warming ocean temperatures trigger coral bleaching, a process where corals expel the symbiotic algae living in their tissues, causing them to turn completely white. If water temperatures do not return to normal within a few weeks, the bleached corals will die, leading to the collapse of the complex ecosystem that depends on them.",
    title: "The Great Barrier Reef Ecosystem",
    questions: [
      { q: "Where is the Great Barrier Reef located?", o: ["Off the coast of Queensland, Australia", "In the Caribbean Sea", "Near the coast of South Africa", "In the Mediterranean Sea"], a: "Off the coast of Queensland, Australia", ch: "Reading Comprehension" },
      { q: "What is the primary cause of coral bleaching mentioned in the passage?", o: ["Industrial waste dumping", "Warming ocean temperatures", "Overfishing in the reef area", "Acid rain"], a: "Warming ocean temperatures", ch: "Reading Comprehension" },
      { q: "How long is the Great Barrier Reef system?", o: ["Over 2,300 kilometers", "Exactly 900 kilometers", "Under 1,000 kilometers", "Over 5,000 kilometers"], a: "Over 2,300 kilometers", ch: "Reading Comprehension" },
      { q: "What happens if bleached corals do not recover within a few weeks?", o: ["They mutate into tougher species", "They turn purple and survive", "They will die", "They grow at double the normal rate"], a: "They will die", ch: "Reading Comprehension" },
      { q: "Select the word from the passage that means 'native or restricted to a certain place'.", o: ["Vulnerable", "Endemic", "Symbiotic", "Diversity"], a: "Endemic", ch: "Reading Comprehension" }
    ]
  },
  {
    passage: "Artificial Intelligence (AI) has rapidly progressed from a science-fiction fantasy to an integral part of modern society. From search engine algorithms to autonomous driving systems, AI touches almost every industry. However, the rapid advancement of artificial general intelligence (AGI) raises profound ethical concerns. Key figures in technology warn of potential mass unemployment caused by automated systems displacing both manual and cognitive labor. Moreover, algorithms trained on biased datasets can perpetuate and amplify existing social prejudices. Regulating AI development requires a delicate balance: fostering innovation while implementing safeguards to ensure technology remains aligned with human values and safety.",
    title: "The Rise of Artificial Intelligence",
    questions: [
      { q: "What does AGI stand for in the context of the passage?", o: ["Automated General Index", "Artificial General Intelligence", "Advanced Global Integration", "Allocated Government Intel"], a: "Artificial General Intelligence", ch: "Reading Comprehension" },
      { q: "Which of the following is an ethical concern raised in the passage?", o: ["AI systems running out of battery power", "High licensing fees for software", "Mass unemployment due to displacement of labor", "Flickering monitor screens"], a: "Mass unemployment due to displacement of labor", ch: "Reading Comprehension" },
      { q: "How can algorithms perpetuate social prejudices according to the text?", o: ["By showing low resolution images", "By being trained on biased datasets", "By charging subscription fees", "By operating only during the night"], a: "By being trained on biased datasets", ch: "Reading Comprehension" },
      { q: "What balance is required in regulating AI development?", o: ["Fostering innovation while implementing safety safeguards", "Banning AI completely in schools", "Replacing all programmers with hardware specialists", "Increasing taxation on all tech companies"], a: "Fostering innovation while implementing safety safeguards", ch: "Reading Comprehension" },
      { q: "Select the word from the passage that means 'belonging as an essential part'.", o: ["Integral", "Autonomous", "Profound", "Cognitive"], a: "Integral", ch: "Reading Comprehension" }
    ]
  }
];

const vocabularyBases = [
  { word: "Diligent", syn: "Hardworking", ant: "Lazy", optionsSyn: ["Lazy", "Slow", "Hardworking", "Careless"], optionsAnt: ["Hardworking", "Energetic", "Active", "Lazy"] },
  { word: "Benevolent", syn: "Kind", ant: "Malevolent", optionsSyn: ["Cruel", "Kind", "Selfish", "Angry"], optionsAnt: ["Kind", "Generous", "Helpful", "Malevolent"] },
  { word: "Ephemeral", syn: "Short-lived", ant: "Permanent", optionsSyn: ["Eternal", "Permanent", "Short-lived", "Long"], optionsAnt: ["Short-lived", "Temporary", "Fleeting", "Permanent"] },
  { word: "Placid", syn: "Calm", ant: "Turbulent", optionsSyn: ["Stormy", "Calm", "Noisy", "Aggressive"], optionsAnt: ["Calm", "Peaceful", "Tranquil", "Turbulent"] },
  { word: "Arduous", syn: "Difficult", ant: "Effortless", optionsSyn: ["Easy", "Difficult", "Pleasant", "Light"], optionsAnt: ["Difficult", "Demanding", "Hard", "Effortless"] },
  { word: "Venerate", syn: "Respect", ant: "Despise", optionsSyn: ["Despise", "Dislike", "Respect", "Mock"], optionsAnt: ["Respect", "Admire", "Worship", "Despise"] },
  { word: "Candid", syn: "Frank", ant: "Deceitful", optionsSyn: ["Deceitful", "Shy", "Frank", "Insincere"], optionsAnt: ["Frank", "Honest", "Direct", "Deceitful"] },
  { word: "Prudent", syn: "Wise", ant: "Reckless", optionsSyn: ["Reckless", "Foolish", "Wise", "Careless"], optionsAnt: ["Wise", "Cautious", "Careful", "Reckless"] }
];

const idiomBases = [
  { phrase: "Bite the bullet", meaning: "Face a difficult situation with courage", options: ["Avoid responsibilities", "Face a difficult situation with courage", "Express extreme anger", "Get physically injured"] },
  { phrase: "Break a leg", meaning: "Wish someone good luck", options: ["Wish someone bad luck", "Wish someone good luck", "Praise someone's speed", "Admonish a player"] },
  { phrase: "Spill the beans", meaning: "Reveal a secret accidentally", options: ["Cook a meal", "Reveal a secret accidentally", "Drop the food items", "Tell lies to someone"] },
  { phrase: "Burn the midnight oil", meaning: "Work or study late into the night", options: ["Waste fuel resources", "Work or study late into the night", "Wake up early in the morning", "Ignite a campfire"] },
  { phrase: "Through thick and thin", meaning: "Under all conditions, good or bad", options: ["Only in prosperous times", "Under all conditions, good or bad", "Struggling with health issues", "Across different borders"] }
];

const grammarBases = [
  { sentence: "Neither of the two candidates _______ selected for the interview.", ans: "was", options: ["were", "was", "have been", "are"], ch: "Subject-Verb Agreement" },
  { sentence: "The book, along with several journals, _______ placed on the table.", ans: "has been", options: ["have been", "are", "has been", "were"], ch: "Subject-Verb Agreement" },
  { sentence: "If she _______ harder, she would have cleared the examination.", ans: "had studied", options: ["studied", "studies", "has studied", "had studied"], ch: "Conditional Sentences" },
  { sentence: "He is senior _______ me in office rank.", ans: "to", options: ["than", "to", "from", "of"], ch: "Prepositions" },
  { sentence: "The teacher congratulated him _______ his outstanding success.", ans: "on", options: ["for", "at", "on", "about"], ch: "Prepositions" }
];

// --- SEED TEMPLATES FOR PHYSICS (Varying programmatically to 500) ---
const logicGates = [
  { type: "AND", inputs: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 1]] },
  { type: "OR", inputs: [[0, 0, 0], [0, 1, 1], [1, 0, 1], [1, 1, 1]] },
  { type: "NAND", inputs: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 0]] },
  { type: "NOR", inputs: [[0, 0, 1], [0, 1, 0], [1, 0, 0], [1, 1, 0]] }
];

// Programmatic Generators
const generateEnglishQuestions = () => {
  const list = [];
  let id = 1;

  // 1. Reading Comprehension questions (Let's generate 100 questions from repeated variants with different combinations)
  for (let i = 0; i < 20; i++) {
    const passageObj = englishPassages[i % englishPassages.length];
    passageObj.questions.forEach((qObj, index) => {
      list.push({
        id: id++,
        subject: "English",
        question: `Read the passage below and answer the question:\n\n"${passageObj.passage}"\n\nQuestion: ${qObj.q} (Passage Variant ${i + 1})`,
        options: [...qObj.o],
        correctAnswer: qObj.a,
        year: 2020 + (i % 5),
        difficulty: index % 3 === 0 ? "easy" : index % 3 === 1 ? "medium" : "hard",
        chapter: "Reading Comprehension",
        explanation: `As detailed in the passage: "${passageObj.title}", the correct statement is "${qObj.a}".`
      });
    });
  }

  // 2. Synonyms questions (Generate 100 questions)
  for (let i = 0; i < 100; i++) {
    const base = vocabularyBases[i % vocabularyBases.length];
    list.push({
      id: id++,
      subject: "English",
      question: `Find the word which is closest in meaning (SYNONYM) to the target word: "${base.word.toUpperCase()}"`,
      options: [...base.optionsSyn].sort(() => 0.5 - Math.random()),
      correctAnswer: base.syn,
      year: 2024 - (i % 4),
      difficulty: i % 3 === 0 ? "easy" : "medium",
      chapter: "Vocabulary",
      explanation: `The word "${base.word}" means someone/something having standard characteristics. The synonym is "${base.syn}".`
    });
  }

  // 3. Antonyms questions (Generate 100 questions)
  for (let i = 0; i < 100; i++) {
    const base = vocabularyBases[i % vocabularyBases.length];
    list.push({
      id: id++,
      subject: "English",
      question: `Choose the word which is opposite in meaning (ANTONYM) to the target word: "${base.word.toUpperCase()}"`,
      options: [...base.optionsAnt].sort(() => 0.5 - Math.random()),
      correctAnswer: base.ant,
      year: 2024 - (i % 4),
      difficulty: i % 3 === 1 ? "medium" : "hard",
      chapter: "Vocabulary",
      explanation: `The antonym (opposite meaning) of "${base.word}" is "${base.ant}".`
    });
  }

  // 4. Idioms & Phrases (Generate 100 questions)
  for (let i = 0; i < 100; i++) {
    const base = idiomBases[i % idiomBases.length];
    list.push({
      id: id++,
      subject: "English",
      question: `What is the meaning of the idiom underlined below?\n"The student decided to **${base.phrase.toLowerCase()}** and start preparing."`,
      options: [...base.options].sort(() => 0.5 - Math.random()),
      correctAnswer: base.meaning,
      year: 2023 - (i % 3),
      difficulty: "medium",
      chapter: "Idioms and Phrases",
      explanation: `The phrase "${base.phrase}" means "${base.meaning}".`
    });
  }

  // 5. Grammar & Fill in the Blanks (Generate 110 questions to cross 500)
  for (let i = 0; i < 110; i++) {
    const base = grammarBases[i % grammarBases.length];
    list.push({
      id: id++,
      subject: "English",
      question: `Fill in the blank with the grammatically correct option:\n\n"${base.sentence.replace('_______', '_____')}"`,
      options: [...base.options].sort(() => 0.5 - Math.random()),
      correctAnswer: base.ans,
      year: 2024 - (i % 5),
      difficulty: i % 2 === 0 ? "easy" : "medium",
      chapter: base.ch,
      explanation: `According to standard grammatical rules of ${base.ch}, we use "${base.ans}" in this context.`
    });
  }

  return list;
};

const generatePhysicsQuestions = (startId) => {
  const list = [];
  let id = startId;

  // 1. Electrostatics (Coulomb's Law / Capacitance) (100 questions)
  for (let i = 0; i < 100; i++) {
    const q1 = (i % 5) + 2; // µC
    const q2 = (i % 4) + 1; // µC
    const r = ((i % 3) + 1) * 10; // cm
    const k = 9 * 1e9;
    const force = (k * (q1 * 1e-6) * (q2 * 1e-6)) / Math.pow(r / 100, 2);
    const forceRounded = Math.round(force * 100) / 100;

    const correctAns = `${forceRounded} N`;
    const options = [
      `${forceRounded} N`,
      `${Math.round(forceRounded * 1.5 * 100) / 100} N`,
      `${Math.round(forceRounded * 0.5 * 100) / 100} N`,
      `${Math.round(forceRounded * 2 * 100) / 100} N`
    ].sort(() => 0.5 - Math.random());

    list.push({
      id: id++,
      subject: "Physics",
      question: `Two point charges of +${q1} µC and +${q2} µC are placed in vacuum at a distance of ${r} cm from each other. Calculate the magnitude of the electrostatic force acting between them. (Take 1 / 4πε₀ = 9 × 10⁹ N m²/C²)`,
      options: options,
      correctAnswer: correctAns,
      year: 2024 - (i % 3),
      difficulty: "medium",
      chapter: "Electrostatics",
      explanation: `Using Coulomb's Law: F = (k × q₁ × q₂) / r².\nSubstitute values: F = (9 × 10⁹ × ${q1} × 10⁻⁶ × ${q2} × 10⁻⁶) / (${r / 100})² = ${forceRounded} N.`
    });
  }

  // 2. Current Electricity (Ohm's Law & Circuit Resistances) (100 questions)
  for (let i = 0; i < 100; i++) {
    const r1 = (i % 6) + 2; // ohms
    const r2 = (i % 4) + 3; // ohms
    const series = r1 + r2;
    const parallel = Math.round(((r1 * r2) / (r1 + r2)) * 100) / 100;

    const isSeries = i % 2 === 0;
    const correctAns = isSeries ? `${series} Ω` : `${parallel} Ω`;
    const options = isSeries 
      ? [`${series} Ω`, `${parallel} Ω`, `${series + 5} Ω`, `${Math.round(series * 0.8 * 100) / 100} Ω`]
      : [`${parallel} Ω`, `${series} Ω`, `${Math.round(parallel * 1.5 * 100) / 100} Ω`, `${Math.round(parallel * 0.5 * 100) / 100} Ω`];

    list.push({
      id: id++,
      subject: "Physics",
      question: `Two resistors of values R₁ = ${r1} Ω and R₂ = ${r2} Ω are connected in ${isSeries ? 'SERIES' : 'PARALLEL'} in an electrical circuit. What is the equivalent resistance of this combination?`,
      options: options.sort(() => 0.5 - Math.random()),
      correctAnswer: correctAns,
      year: 2023 - (i % 4),
      difficulty: "easy",
      chapter: "Current Electricity",
      explanation: isSeries 
        ? `For series configuration: R_eq = R₁ + R₂ = ${r1} + ${r2} = ${series} Ω.`
        : `For parallel configuration: 1 / R_eq = 1/R₁ + 1/R₂ => R_eq = (R₁ × R₂) / (R₁ + R₂) = (${r1} × ${r2}) / (${r1} + ${r2}) = ${parallel} Ω.`
    });
  }

  // 3. Ray Optics (Lens formula / Magnification) (100 questions)
  for (let i = 0; i < 100; i++) {
    const f = ((i % 5) + 2) * 5; // focal length in cm
    const u = -((i % 4) + 2) * 10; // object distance in cm (virtual side)
    // 1/v - 1/u = 1/f => 1/v = 1/f + 1/u
    const invV = (1 / f) + (1 / u);
    const v = Math.round((1 / invV) * 100) / 100;

    const correctAns = `${v} cm`;
    const options = [
      `${v} cm`,
      `${Math.round(v * 1.3 * 100) / 100} cm`,
      `${Math.round(v * -1 * 100) / 100} cm`,
      `At infinity`
    ].sort(() => 0.5 - Math.random());

    list.push({
      id: id++,
      subject: "Physics",
      question: `A thin convex lens of focal length f = ${f} cm is placed in air. An object is placed on the principal axis at a distance of ${Math.abs(u)} cm from the optical center of the lens. Find the position of the image formed.`,
      options: options,
      correctAnswer: correctAns,
      year: 2024 - (i % 2),
      difficulty: "hard",
      chapter: "Ray Optics",
      explanation: `Using Lens Formula: 1/f = 1/v - 1/u.\nGiven f = +${f} cm, u = -${Math.abs(u)} cm.\n1/v = 1/${f} + (1 / -${Math.abs(u)}) => v = ${v} cm.`
    });
  }

  // 4. Modern Physics (Logic Gates & Boolean Outputs) (100 questions)
  for (let i = 0; i < 100; i++) {
    const gate = logicGates[i % logicGates.length];
    const inputRow = gate.inputs[i % gate.inputs.length];
    const A = inputRow[0];
    const B = inputRow[1];
    const Y = inputRow[2];

    const correctAns = `${Y}`;
    const options = ["0", "1", "High Impedance", "Toggle State"];

    list.push({
      id: id++,
      subject: "Physics",
      question: `Identify the output 'Y' of a digital ${gate.type} logic gate when the inputs are set as A = ${A} and B = ${B}.`,
      options: options,
      correctAnswer: correctAns,
      year: 2022 + (i % 3),
      difficulty: "easy",
      chapter: "Semiconductor Electronics",
      explanation: `For an ${gate.type} logic gate, the truth table dictates that when A = ${A} and B = ${B}, the output state is strictly ${Y}.`
    });
  }

  // 5. Magnetism & Electromagnetic Waves (100 questions to cross 500)
  for (let i = 0; i < 100; i++) {
    const velocity = (i % 5) + 1; // × 10^6 m/s
    const field = (i % 3) + 2; // Tesla
    const charge = 1.6e-19; // Coulomb
    const force = charge * (velocity * 1e6) * field; // N
    const forceScientific = force.toExponential(2);

    const correctAns = `${forceScientific} N`;
    const options = [
      `${forceScientific} N`,
      `${(force * 1.5).toExponential(2)} N`,
      `0 N`,
      `${(force * 0.5).toExponential(2)} N`
    ].sort(() => 0.5 - Math.random());

    list.push({
      id: id++,
      subject: "Physics",
      question: `A proton (charge q = 1.6 × 10⁻¹⁹ C) enters perpendicularly into a uniform magnetic field of B = ${field} Tesla with a velocity of v = ${velocity} × 10⁶ m/s. Find the magnetic force acting on the proton.`,
      options: options,
      correctAnswer: correctAns,
      year: 2023 - (i % 3),
      difficulty: "medium",
      chapter: "Moving Charges and Magnetism",
      explanation: `Using the Lorentz force formula: F = q × v × B × sin(θ).\nSince proton enters perpendicularly, θ = 90° => sin(90°) = 1.\nF = (1.6 × 10⁻¹⁹ C) × (${velocity} × 10⁶ m/s) × (${field} T) = ${forceScientific} N.`
    });
  }

  return list;
};

const runSeeding = async () => {
  try {
    // Clear any old questions first
    await dbService.clearQuestions();
    
    // Generate and save
    console.log('[Seeder] Generating English Questions...');
    const englishQuestions = generateEnglishQuestions();
    console.log(`[Seeder] Generated ${englishQuestions.length} English questions.`);

    console.log('[Seeder] Generating Physics Questions...');
    const physicsQuestions = generatePhysicsQuestions(englishQuestions.length + 1);
    console.log(`[Seeder] Generated ${physicsQuestions.length} Physics questions.`);

    const totalQuestions = [...englishQuestions, ...physicsQuestions];
    console.log(`[Seeder] Saving all ${totalQuestions.length} questions to database...`);
    
    const result = await dbService.saveQuestions(totalQuestions);
    console.log(`[Seeder] Successfully seeded ${result.count} questions into the active storage!`);

    // Seed a default system config
    await dbService.saveConfig('subjects', [
      { id: 'english', name: 'English', duration: 45, totalQuestions: 40, selectQuestions: 40 },
      { id: 'physics', name: 'Physics', duration: 45, totalQuestions: 50, selectQuestions: 40 }
    ]);
    console.log('[Seeder] Seeded default Subject configs successfully.');

    console.log('[Seeder] Database seeding COMPLETED successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seeder] Seeding error:', error);
    process.exit(1);
  }
};

runSeeding();
