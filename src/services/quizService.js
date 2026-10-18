/**
 * Professional Quiz Generation Service
 * Uses Google Gemini API with fallback to system stored topics.
 */

import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Comprehensive stored question banks in the system
export const SYSTEM_STORED_TOPICS = {
  javascript: {
    title: "JavaScript",
    aliases: ["js", "javascript", "ecmascript", "es6", "vanilla js", "frontend javascript"],
    questions: [
      {
        question: "Which keyword is used to declare a block-scoped variable in modern JavaScript?",
        correct_answer: "let",
        incorrect_answers: ["var", "def", "dim"],
        explanation: "'let' and 'const' were introduced in ES6 to provide block scoping, unlike 'var' which is function-scoped."
      },
      {
        question: "What is the output of 'typeof NaN' in JavaScript?",
        correct_answer: "number",
        incorrect_answers: ["undefined", "nan", "object"],
        explanation: "In JavaScript, NaN (Not-a-Number) is formally categorized as a numeric data type."
      },
      {
        question: "Which method converts a JavaScript object into a JSON string?",
        correct_answer: "JSON.stringify()",
        incorrect_answers: ["JSON.parse()", "JSON.objectify()", "JSON.toText()"],
        explanation: "JSON.stringify() serializes a JavaScript object into a standard JSON string."
      },
      {
        question: "What is a Closure in JavaScript?",
        correct_answer: "A function bundled together with references to its surrounding lexical environment",
        incorrect_answers: [
          "A method to close browser tabs programmatically",
          "A private class modifier",
          "A loop termination statement"
        ],
        explanation: "A closure gives an inner function access to its outer scope even after the outer function has finished executing."
      },
      {
        question: "Which of the following is NOT a primitive type in JavaScript?",
        correct_answer: "Object",
        incorrect_answers: ["Symbol", "BigInt", "Boolean"],
        explanation: "Primitives in JS are string, number, bigint, boolean, undefined, symbol, and null. Objects are reference types."
      },
      {
        question: "What does the '===' operator check in JavaScript?",
        correct_answer: "Both value and data type without type coercion",
        incorrect_answers: ["Value only with type coercion", "Reference memory address only", "Variable assignment"],
        explanation: "Strict equality (===) compares both operand value and data type without performing implicit type casting."
      },
      {
        question: "Which Array method returns a new array with all elements that pass a test?",
        correct_answer: "filter()",
        incorrect_answers: ["map()", "forEach()", "reduce()"],
        explanation: "The filter() method creates a shallow copy of an array filtered down to just the elements that pass the predicate function."
      },
      {
        question: "What does the Event Loop do in JavaScript runtime?",
        correct_answer: "Coordinates asynchronous execution by moving tasks from the callback queue to the call stack",
        incorrect_answers: [
          "Executes all synchronous code in parallel threads",
          "Compiles JavaScript code to bytecode",
          "Manages DOM CSS reflows exclusively"
        ],
        explanation: "The event loop continuously monitors the call stack and dequeues pending callbacks from the task/microtask queues when the stack is empty."
      },
      {
        question: "Which method removes the last element from an array and returns it?",
        correct_answer: "pop()",
        incorrect_answers: ["push()", "shift()", "slice()"],
        explanation: "pop() removes the last element from an array in place, while shift() removes the first element."
      },
      {
        question: "What is a Promise in JavaScript?",
        correct_answer: "An object representing the eventual completion or failure of an asynchronous operation",
        incorrect_answers: [
          "A contract that guarantees no runtime exceptions will occur",
          "A function that runs synchronously on the main thread",
          "A database transaction handler"
        ],
        explanation: "A Promise is a proxy for a value not necessarily known when the promise is created, handling async states: pending, fulfilled, or rejected."
      }
    ]
  },

  python: {
    title: "Python",
    aliases: ["python", "py", "python3", "python programming"],
    questions: [
      {
        question: "Which data structure in Python is mutable and defined with square brackets?",
        correct_answer: "List",
        incorrect_answers: ["Tuple", "Set", "Dictionary"],
        explanation: "Python lists are ordered, mutable sequences initialized using square brackets []."
      },
      {
        question: "What is the keyword used to define a function in Python?",
        correct_answer: "def",
        incorrect_answers: ["function", "func", "define"],
        explanation: "In Python, functions are defined using the 'def' keyword followed by the function name and parameters."
      },
      {
        question: "What does the PEP 8 document provide for Python developers?",
        correct_answer: "Style guide recommendations for Python code",
        incorrect_answers: [
          "Official security vulnerability reports",
          "A compiled bytecode specification",
          "Package dependency resolution rules"
        ],
        explanation: "PEP 8 is the official Style Guide for Python Code written by Guido van Rossum and colleagues."
      },
      {
        question: "How do you create a virtual environment using Python's standard library?",
        correct_answer: "python -m venv <env_name>",
        incorrect_answers: ["python --make-env", "pip install virtualenv", "python -v env create"],
        explanation: "The built-in 'venv' module creates lightweight virtual environments isolated from system site-packages."
      },
      {
        question: "What is the output of 'bool([])' in Python?",
        correct_answer: "False",
        incorrect_answers: ["True", "None", "TypeError"],
        explanation: "Empty sequences such as lists, tuples, dictionaries, and strings evaluate to False in a boolean context."
      },
      {
        question: "Which Python statement is used for exception handling?",
        correct_answer: "try ... except",
        incorrect_answers: ["try ... catch", "do ... handle", "attempt ... error"],
        explanation: "Python uses 'try' blocks coupled with 'except' clauses to catch and handle runtime exceptions."
      },
      {
        question: "What does the '__init__' method represent in a Python class?",
        correct_answer: "The constructor/initializer method called when a new instance is created",
        incorrect_answers: [
          "The destructor method called on garbage collection",
          "A private static method for class registration",
          "The module import trigger"
        ],
        explanation: "__init__ is called immediately after a new instance of a class is constructed to initialize its attributes."
      },
      {
        question: "Which built-in function returns both index and value while iterating over an iterable?",
        correct_answer: "enumerate()",
        incorrect_answers: ["zip()", "range()", "iter()"],
        explanation: "enumerate() takes a collection and returns an enumerate object yielding tuples of (index, item)."
      }
    ]
  },

  vue: {
    title: "Vue.js",
    aliases: ["vue", "vue.js", "vuejs", "vue 3", "vue3", "vue framework"],
    questions: [
      {
        question: "Which Composition API function is used to create a reactive primitive value in Vue 3?",
        correct_answer: "ref()",
        incorrect_answers: ["reactive()", "computed()", "watch()"],
        explanation: "ref() wraps an inner primitive or object value in a reactive and mutable ref object with a single .value property."
      },
      {
        question: "What directive is used for two-way data binding on form inputs in Vue?",
        correct_answer: "v-model",
        incorrect_answers: ["v-bind", "v-on", "v-sync"],
        explanation: "v-model creates two-way bindings on form inputs, textareas, and select elements."
      },
      {
        question: "Which lifecycle hook is called after the component has been mounted to the DOM in Vue 3?",
        correct_answer: "onMounted()",
        incorrect_answers: ["onCreated()", "onBeforeMount()", "onRendered()"],
        explanation: "onMounted() registers a callback to be called once the component DOM tree has been created and inserted into the container."
      },
      {
        question: "What is the purpose of the '<script setup>' syntactic sugar in Vue 3?",
        correct_answer: "Provides a cleaner, more concise syntax for using Composition API inside Single-File Components",
        incorrect_answers: [
          "Enables synchronous server-side database access",
          "Disables TypeScript compilation errors",
          "Automatically styles the template with TailwindCSS"
        ],
        explanation: "<script setup> compiles away boilerplate, automatically exposes top-level bindings to the template, and offers better runtime performance."
      },
      {
        question: "What directive is used to conditionally render an element with CSS display property toggle?",
        correct_answer: "v-show",
        incorrect_answers: ["v-if", "v-display", "v-visible"],
        explanation: "v-show toggles the CSS 'display' property between none and normal without unmounting the DOM element."
      }
    ]
  },

  react: {
    title: "React",
    aliases: ["react", "react.js", "reactjs", "react native"],
    questions: [
      {
        question: "Which React Hook is used to manage mutable local component state?",
        correct_answer: "useState",
        incorrect_answers: ["useEffect", "useContext", "useRef"],
        explanation: "useState declares a state variable that preserves value across component re-renders."
      },
      {
        question: "What is the Virtual DOM in React?",
        correct_answer: "A lightweight in-memory representation of the real DOM tree",
        incorrect_answers: [
          "A direct browser API for rendering 3D graphics",
          "A shadow DOM implementation for custom elements only",
          "A database engine running inside web workers"
        ],
        explanation: "React keeps a virtual DOM representation in memory and syncs it with the real DOM via reconciliation."
      },
      {
        question: "Which Hook handles side effects such as data fetching and DOM mutations?",
        correct_answer: "useEffect",
        incorrect_answers: ["useMemo", "useCallback", "useReducer"],
        explanation: "useEffect allows you to perform side effects in functional components, running after render."
      }
    ]
  },

  html_css: {
    title: "HTML & CSS",
    aliases: ["html", "css", "html5", "css3", "web design", "frontend", "web development"],
    questions: [
      {
        question: "What does HTML stand for?",
        correct_answer: "HyperText Markup Language",
        incorrect_answers: [
          "Hyperlink Transfer Markup Language",
          "High-level Text Management Language",
          "Home Tool Markup Logic"
        ],
        explanation: "HTML stands for HyperText Markup Language, the standard markup language for web documents."
      },
      {
        question: "Which CSS property specifies the stack order of positioned elements?",
        correct_answer: "z-index",
        incorrect_answers: ["order", "layer-index", "elevation"],
        explanation: "z-index sets the z-order of a positioned element along the z-axis."
      },
      {
        question: "What is the CSS Box Model composed of from inside to outside?",
        correct_answer: "Content, Padding, Border, Margin",
        incorrect_answers: [
          "Content, Margin, Border, Padding",
          "Border, Margin, Padding, Content",
          "Content, Border, Padding, Outline"
        ],
        explanation: "The standard CSS box model starts with the content, surrounded by padding, border, and outermost margin."
      }
    ]
  },

  sql: {
    title: "SQL & Databases",
    aliases: ["sql", "database", "databases", "mysql", "postgresql", "rdbms", "sqlite"],
    questions: [
      {
        question: "Which SQL clause is used to filter rows returned by a SELECT query?",
        correct_answer: "WHERE",
        incorrect_answers: ["HAVING", "ORDER BY", "GROUP BY"],
        explanation: "The WHERE clause filters rows based on a specified condition before grouping."
      },
      {
        question: "What does ACID stand for in database transaction management?",
        correct_answer: "Atomicity, Consistency, Isolation, Durability",
        incorrect_answers: [
          "Accuracy, Concurrency, Integrity, Distribution",
          "Action, Continuity, Indexing, Data",
          "Authentication, Control, Identity, Domain"
        ],
        explanation: "ACID principles guarantee reliable processing of database transactions."
      },
      {
        question: "Which JOIN returns all rows from the left table and matched rows from the right table?",
        correct_answer: "LEFT JOIN",
        incorrect_answers: ["INNER JOIN", "RIGHT JOIN", "FULL JOIN"],
        explanation: "A LEFT JOIN returns all records from the left table and matched records from the right table."
      }
    ]
  },

  history: {
    title: "World History",
    aliases: ["history", "world history", "ancient history", "modern history", "war"],
    questions: [
      {
        question: "In what year did World War II officially end?",
        correct_answer: "1945",
        incorrect_answers: ["1944", "1939", "1948"],
        explanation: "World War II concluded in 1945 following the unconditional surrender of the Axis powers."
      },
      {
        question: "Who was the first President of the United States?",
        correct_answer: "George Washington",
        incorrect_answers: ["Thomas Jefferson", "John Adams", "Benjamin Franklin"],
        explanation: "George Washington served as the first U.S. President from 1789 to 1797."
      },
      {
        question: "Which ancient civilization constructed the Pyramids of Giza?",
        correct_answer: "Ancient Egypt",
        incorrect_answers: ["Mesopotamia", "The Maya Civilization", "Ancient Persia"],
        explanation: "The Pyramids of Giza were built during Egypt's Old Kingdom era, primarily during the Fourth Dynasty."
      }
    ]
  },

  geography: {
    title: "World Geography",
    aliases: ["geography", "world geography", "countries", "capitals", "maps"],
    questions: [
      {
        question: "What is the largest ocean on Earth by surface area?",
        correct_answer: "Pacific Ocean",
        incorrect_answers: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
        explanation: "The Pacific Ocean covers over 63 million square miles, exceeding all of Earth's landmass combined."
      },
      {
        question: "Which is the longest river in the world?",
        correct_answer: "Nile River",
        incorrect_answers: ["Amazon River", "Yangtze River", "Mississippi River"],
        explanation: "The Nile River in northeastern Africa flows approximately 6,650 kilometers (4,132 miles)."
      },
      {
        question: "What is the capital city of Australia?",
        correct_answer: "Canberra",
        incorrect_answers: ["Sydney", "Melbourne", "Brisbane"],
        explanation: "Canberra was chosen as Australia's federal capital in 1908 as a compromise between Sydney and Melbourne."
      }
    ]
  },

  science: {
    title: "Science & Biology",
    aliases: ["science", "biology", "physics", "chemistry", "general science", "nature"],
    questions: [
      {
        question: "What is the chemical formula for water?",
        correct_answer: "H2O",
        incorrect_answers: ["CO2", "H2O2", "NaCl"],
        explanation: "Water molecules consist of two hydrogen atoms bonded covalently to a single oxygen atom."
      },
      {
        question: "What organelle is known as the powerhouse of eukaryotic cells?",
        correct_answer: "Mitochondria",
        incorrect_answers: ["Ribosome", "Endoplasmic Reticulum", "Golgi Apparatus"],
        explanation: "Mitochondria generate most of the cell's chemical energy supply in the form of ATP."
      },
      {
        question: "What element does the symbol 'Au' represent on the periodic table?",
        correct_answer: "Gold",
        incorrect_answers: ["Silver", "Argon", "Aluminum"],
        explanation: "Au is derived from the Latin word 'Aurum', meaning shining dawn or gold."
      }
    ]
  },

  space: {
    title: "Space & Astronomy",
    aliases: ["space", "astronomy", "planets", "universe", "nasa", "solar system"],
    questions: [
      {
        question: "Which planet is known as the 'Red Planet'?",
        correct_answer: "Mars",
        incorrect_answers: ["Venus", "Jupiter", "Mercury"],
        explanation: "Mars appears reddish due to ubiquitous iron oxide (rust) on its surface."
      },
      {
        question: "What is the closest star to planet Earth?",
        correct_answer: "The Sun",
        incorrect_answers: ["Proxima Centauri", "Alpha Centauri A", "Sirius"],
        explanation: "The Sun is our solar system's central star, situated ~149.6 million kilometers from Earth."
      },
      {
        question: "What space telescope was launched on Christmas Day in 2021 as Hubble's successor?",
        correct_answer: "James Webb Space Telescope (JWST)",
        incorrect_answers: ["Spitzer Space Telescope", "Kepler Observatory", "Chandra X-ray Observatory"],
        explanation: "JWST conducts infrared astronomy from the Sun-Earth L2 Lagrange point."
      }
    ]
  }
};

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate questions using Google Gemini API
 */
async function fetchViaGemini(topic, count, difficulty, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);

  const schema = {
    description: "Strictly topic-focused quiz response",
    type: SchemaType.OBJECT,
    properties: {
      results: {
        type: SchemaType.ARRAY,
        description: `Array of exactly ${count} multiple choice questions strictly about ${topic}`,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            question: { type: SchemaType.STRING, description: `Question text strictly focused on ${topic}` },
            correct_answer: { type: SchemaType.STRING, description: "Correct answer choice" },
            incorrect_answers: {
              type: SchemaType.ARRAY,
              description: "Three plausible but incorrect answer choices",
              items: { type: SchemaType.STRING }
            },
            explanation: {
              type: SchemaType.STRING,
              description: "Clear 1-2 sentence explanation of why the correct answer is true"
            },
            difficulty: { type: SchemaType.STRING }
          },
          required: ["question", "correct_answer", "incorrect_answers", "explanation"]
        }
      }
    },
    required: ["results"]
  };

  const model = genAI.getGenerativeModel({
    model: "gemini-3.8-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.3
    }
  });

  const prompt = `Create an examination of EXACTLY ${count} multiple choice questions strictly and solely about the topic: "${topic}".
Difficulty: ${difficulty || "mixed"}.
Every question must be 100% relevant to "${topic}".
Each question must have 1 correct answer, 3 distinct incorrect answers, and a helpful explanation.`;

  const result = await model.generateContent(prompt);
  const data = JSON.parse(result.response.text());
  if (data && data.results && data.results.length > 0) {
    return data.results.slice(0, count);
  }
  throw new Error("Empty results from model");
}

/**
 * Main quiz generation orchestrator:
 * 1. Generates using Google Gemini API with model gemini-3.8-flash
 * 2. If network/API limit occurs, matches previously stored system topics
 */
export async function generateQuiz({ topic, count = 10, difficulty = "mixed" }) {
  const cleanTopic = topic.trim();
  const lowerTopic = cleanTopic.toLowerCase();
  const questionCount = Math.max(1, Math.min(Number(count) || 10, 50));

  const apiKey =
    import.meta.env.VITE_GOOGLE_API_KEY ||
    localStorage.getItem("gemini_api_key") ||
    "";

  // Primary: Generate live via Gemini API
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const liveQuestions = await fetchViaGemini(cleanTopic, questionCount, difficulty, apiKey.trim());
      if (liveQuestions && liveQuestions.length > 0) {
        return {
          topic: cleanTopic,
          questions: liveQuestions
        };
      }
    } catch (err) {
      console.warn("Gemini generation skipped or failed, falling back to system stored topic:", err);
    }
  }

  // Fallback: Check previously stored topics in system
  for (const [key, topicData] of Object.entries(SYSTEM_STORED_TOPICS)) {
    const isDirectKey = lowerTopic === key || lowerTopic.includes(key) || key.includes(lowerTopic);
    const isAliasMatch = topicData.aliases.some(
      (alias) => lowerTopic === alias || lowerTopic.includes(alias) || alias.includes(lowerTopic)
    );

    if (isDirectKey || isAliasMatch) {
      const shuffled = shuffleArray(topicData.questions);
      const selected = [];
      while (selected.length < questionCount) {
        for (const q of shuffled) {
          if (selected.length < questionCount) {
            selected.push({ ...q, category: topicData.title });
          }
        }
      }
      return {
        topic: topicData.title,
        questions: selected
      };
    }
  }

  // Fallback: return default stored questions contextualized with topic
  const fallback = SYSTEM_STORED_TOPICS.javascript.questions.map((q) => ({
    ...q,
    category: cleanTopic,
    question: `[${cleanTopic}] ` + q.question
  }));

  return {
    topic: cleanTopic,
    questions: fallback.slice(0, questionCount)
  };
}
