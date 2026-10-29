
import { useEffect, useState } from "react";
import {
  recordQuiz,
  recordActivity,
} from "../utils/learningHistory";

const formats = [
  { id: "mixed", icon: "✦", name: "Mixed Quiz", desc: "10 questions · Multiple formats" },
  { id: "mcq", icon: "◉", name: "MCQ", desc: "Test your concepts with choices" },
  { id: "truefalse", icon: "↔", name: "True / False", desc: "Identify facts and misconceptions" },
  { id: "written", icon: "✎", name: "Write It", desc: "Recall answers in your own words" },
  { id: "hots", icon: "⌘", name: "HOTS", desc: "Apply, analyse and solve problems" },
  { id: "recall", icon: "↻", name: "Quick Recall", desc: "A short memory check" },
];

const demoQuestions = [
  {
    type: "mcq",
    question: "In a Binary Search Tree, where are smaller values generally stored?",
    options: [
      "In the left subtree",
      "In the right subtree",
      "Only at leaf nodes",
      "In a separate array",
    ],
    answer: "In the left subtree",
    explanation:
      "In a standard BST, values smaller than a node are placed in its left subtree, while larger values go in its right subtree.",
  },
  {
    type: "truefalse",
    question: "An inorder traversal of a BST visits its values in sorted order.",
    options: ["True", "False"],
    answer: "True",
    explanation:
      "Inorder traversal visits the left subtree, the node, and then the right subtree. This produces sorted values in a BST.",
  },
  {
    type: "written",
    question: "What is the average search time complexity of a balanced BST?",
    answer: "O(log n)",
    explanation:
      "A balanced BST reduces the search space at each step, giving average search time of O(log n). An unbalanced BST can take O(n).",
  },
  {
    type: "hots",
    question:
      "A BST becomes a chain after inserting sorted values. What is the main consequence?",
    options: [
      "Search can become O(n)",
      "Search always becomes O(1)",
      "The tree becomes a heap",
      "All values are deleted",
    ],
    answer: "Search can become O(n)",
    explanation:
      "A highly unbalanced BST can resemble a linked list. Searching may then visit every node, taking O(n) time.",
  },
  {
    type: "mcq",
    question: "Which traversal visits the root between the left and right subtrees?",
    options: ["Preorder", "Inorder", "Postorder", "Level order"],
    answer: "Inorder",
    explanation: "Inorder traversal follows Left → Root → Right.",
  },
  {
    type: "truefalse",
    question: "Every binary tree is automatically a Binary Search Tree.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "A binary tree allows up to two children per node. A BST additionally follows an ordering rule for values.",
  },
  {
    type: "written",
    question: "Name the three main depth-first traversals of a binary tree.",
    answer: "Preorder, inorder, and postorder",
    explanation:
      "Preorder visits Root–Left–Right, inorder visits Left–Root–Right, and postorder visits Left–Right–Root.",
  },
  {
    type: "hots",
    question:
      "You need to print the values of a BST in ascending order. Which traversal should you use?",
    options: ["Inorder", "Preorder", "Postorder", "Random traversal"],
    answer: "Inorder",
    explanation:
      "Inorder traversal visits the left subtree before the root and the right subtree afterward, producing ascending values in a standard BST.",
  },
  {
    type: "mcq",
    question: "What is the maximum number of children a binary tree node can have?",
    options: ["One", "Two", "Three", "Unlimited"],
    answer: "Two",
    explanation:
      "A binary tree node has at most two children, conventionally called the left and right child.",
  },
  {
    type: "truefalse",
    question: "Searching an unbalanced BST is guaranteed to take O(log n) time.",
    options: ["True", "False"],
    answer: "False",
    explanation:
      "An unbalanced BST may have height proportional to n, making search take O(n) in the worst case.",
  },
];

const formatTypes = {
  mixed: [
    "mcq",
    "truefalse",
    "written",
    "hots",
    "mcq",
    "truefalse",
    "written",
    "hots",
    "mcq",
    "truefalse",
  ],
  mcq: ["mcq"],
  truefalse: ["truefalse"],
  written: ["written"],
  hots: ["hots"],
  recall: ["written", "mcq", "truefalse"],
};

const badges = [
  {
    name: "First Recall",
    icon: "✦",
    detail: "Complete your first assessment",
    target: 1,
  },
  {
    name: "On a Roll",
    icon: "⚡",
    detail: "Complete 5 assessments in a row",
    target: 5,
  },
  {
    name: "Memory Builder",
    icon: "◈",
    detail: "Complete 10 assessments in a row",
    target: 10,
  },
  {
    name: "Sharp Mind",
    icon: "♛",
    detail: "Score at least 90% on an assessment",
    target: 90,
  },
];

function readSaved(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function normalize(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.,!?]/g, "")
    .replace(/\s+/g, " ");
}

function evaluateAnswer(question, response) {
  if (!response.trim()) {
    return false;
  }

  if (question.type === "written") {
    const expected = normalize(question.answer);
    const actual = normalize(response);

    // Basic demo matching. AI evaluation can replace this later.
    return (
      actual === expected ||
      actual.includes(expected) ||
      (expected.includes(actual) && actual.length > 5)
    );
  }

  return normalize(response) === normalize(question.answer);
}

export default function ReMind() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState("mixed");
  const [difficulty, setDifficulty] = useState("Medium");
  const [questionCount, setQuestionCount] = useState("10");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const [history, setHistory] = useState(() =>
    readSaved("techbook-remind-history", [])
  );

  const [streak, setStreak] = useState(() =>
    readSaved("techbook-remind-streak", 0)
  );

  const [earned, setEarned] = useState(() =>
    readSaved("techbook-remind-badges", [])
  );

  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState([]);

  useEffect(() => {
    try {
      localStorage.setItem(
        "techbook-remind-history",
        JSON.stringify(history)
      );
      localStorage.setItem(
        "techbook-remind-streak",
        JSON.stringify(streak)
      );
      localStorage.setItem(
        "techbook-remind-badges",
        JSON.stringify(earned)
      );
    } catch (storageError) {
      console.error("Could not save ReMind progress:", storageError);
    }
  }, [history, streak, earned]);

  const accuracy = history.length
    ? Math.round(
        history.reduce((sum, item) => sum + item.percent, 0) /
          history.length
      )
    : 0;

  function generateAssessment(event) {
    event.preventDefault();
    setError("");

    if (!topic.trim()) {
      setError("Enter the topic you want to practise.");
      return;
    }

    // Demo mode supports Binary Search Trees and stacks.
    const isBST = /binary search tree|\bbst\b/i.test(topic);
    const isStack = /\bstack\b/i.test(topic);

    let bank = demoQuestions;

    if (isStack) {
      bank = [
        {
          type: "mcq",
          question: "Which principle does a stack follow?",
          options: [
            "FIFO",
            "LIFO",
            "Random access",
            "Priority order",
          ],
          answer: "LIFO",
          explanation:
            "A stack follows Last In, First Out. The most recently pushed item is removed first.",
        },
        {
          type: "truefalse",
          question: "A push operation adds an item to the top of a stack.",
          options: ["True", "False"],
          answer: "True",
          explanation: "Push inserts an item at the top of the stack.",
        },
        {
          type: "written",
          question:
            "What is the name of the operation that removes the top stack item?",
          answer: "Pop",
          explanation: "Pop removes and returns the top element of a stack.",
        },
        {
          type: "hots",
          question:
            "A stack contains A, then B, then C is pushed. Which item is popped first?",
          options: ["A", "B", "C", "All at once"],
          answer: "C",
          explanation:
            "C was pushed last, so LIFO requires C to be removed first.",
        },
      ];
    }

    if (!isBST && !isStack) {
      setError(
        "Demo mode currently supports Binary Search Trees and stacks. Topic-specific generation for other subjects will be enabled when we connect the AI model."
      );
      return;
    }

    const desiredTypes = formatTypes[format];
    const matching = bank.filter((question) =>
      desiredTypes.includes(question.type)
    );

    if (matching.length === 0) {
      setError(
        "No questions are available for this format and topic. Please choose another format."
      );
      return;
    }

    const chosen = [];

    for (let i = 0; i < Number(questionCount); i++) {
      const wanted = desiredTypes[i % desiredTypes.length];
      const pool = matching.filter((question) => question.type === wanted);
      const source = pool.length > 0 ? pool : matching;

      chosen.push({
        ...source[i % source.length],
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 8)}`,
      });
    }

    setQuestions(chosen);
    setAnswers({});
    setSubmitted(false);
    setReviewed([]);
    setError("");
  }

  function submitAssessment() {
    if (!questions.length) {
      setError("Generate an assessment before submitting.");
      return;
    }

    const results = questions.map((question, index) => ({
      ...question,
      userAnswer: answers[index] || "",
      correct: evaluateAnswer(question, answers[index] || ""),
    }));

    const score = results.filter((item) => item.correct).length;
    const percent = Math.round((score / results.length) * 100);
    const newStreak = score === results.length ? streak + 1 : 0;

    // Update the existing ReMind streak.
    setStreak(newStreak);

    // Update the existing achievement badges.
    const newBadges = [...earned];

    if (!newBadges.includes("First Recall")) {
      newBadges.push("First Recall");
    }

    if (newStreak >= 5 && !newBadges.includes("On a Roll")) {
      newBadges.push("On a Roll");
    }

    if (newStreak >= 10 && !newBadges.includes("Memory Builder")) {
      newBadges.push("Memory Builder");
    }

    if (percent >= 90 && !newBadges.includes("Sharp Mind")) {
      newBadges.push("Sharp Mind");
    }

    setEarned(newBadges);

    // Preserve ReMind's own assessment history.
    setHistory((previous) => [
      {
        topic: topic.trim(),
        format,
        percent,
        score,
        total: results.length,
        date: new Date().toISOString(),
      },
      ...previous,
    ]);

    // Show results independently of My Learning storage.
    setQuestions(results);
    setSubmitted(true);
    setError("");

    // Save the completed quiz to My Learning.
    try {
      recordQuiz({
        title: `${topic.trim()} — ${format.toUpperCase()} Assessment`,
        topic: topic.trim(),
        subject: "General",
        score: percent,
        totalQuestions: results.length,
        correctAnswers: score,
        feature: "ReMind",
      });

      recordActivity({
        title: `Assessment completed — ${topic.trim()}`,
        type: "Quiz assessment",
        subject: "General",
        feature: "ReMind",
        minutes: 0,
        icon: "↻",
        details: `Score: ${score}/${results.length} (${percent}%). Format: ${format}. Difficulty: ${difficulty}.`,
      });
    } catch (trackingError) {
      console.error(
        "Could not save ReMind activity to My Learning:",
        trackingError
      );
    }
  }

  function finishReview() {
    setReviewed((previous) => [...previous, topic.trim()]);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  function cancelAssessment() {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setError("");
  }

  return (
    <main className="rm-page">
      <header className="rm-topbar">
        <a className="rm-back" href="#features">
          ← Dashboard
        </a>
        <span className="rm-brand">TechBook / ReMind</span>
      </header>

      <section className="rm-hero">
        <span className="rm-eyebrow">YOUR PERSONAL RECALL SPACE</span>
        <h1>
          Learn it today.
          <br />
          <span>Remember it tomorrow.</span>
        </h1>
        <p>
          Test what you know, understand your mistakes, and earn rewards as
          your memory gets stronger.
        </p>
        <div className="rm-hero-chips">
          <span>✦ Active recall</span>
          <span>↻ Spaced revision</span>
          <span>♛ Achievement badges</span>
        </div>
      </section>

      <section className="rm-stats">
        <article className="rm-stat">
          <span>Assessments completed</span>
          <strong>{history.length}</strong>
        </article>
        <article className="rm-stat">
          <span>Average accuracy</span>
          <strong>{accuracy}%</strong>
        </article>
        <article className="rm-stat">
          <span>Perfect-score streak</span>
          <strong>{streak} ✦</strong>
        </article>
      </section>

      {!questions.length && (
        <form className="rm-card rm-builder" onSubmit={generateAssessment}>
          <span className="rm-eyebrow">READY WHEN YOU ARE</span>
          <h2>What do you want to remember?</h2>
          <p className="rm-muted">
            Choose a topic and how you want to test yourself.
          </p>

          <label htmlFor="rm-topic">Topic or concept</label>
          <input
            id="rm-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Binary Search Trees"
          />

          <div className="rm-builder-heading">
            <h3>Choose your challenge</h3>
            <span>Test format</span>
          </div>

          <div className="rm-format-grid">
            {formats.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`rm-format-card ${
                  format === item.id ? "selected" : ""
                }`}
                onClick={() => setFormat(item.id)}
              >
                <span className="rm-format-icon">{item.icon}</span>
                <strong>{item.name}</strong>
                <small>{item.desc}</small>
                {format === item.id && (
                  <span className="rm-format-check">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="rm-builder-options">
            <div>
              <label htmlFor="rm-difficulty">Difficulty</label>
              <select
                id="rm-difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value)}
              >
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>

            <div>
              <label htmlFor="rm-count">Number of questions</label>
              <select
                id="rm-count"
                value={questionCount}
                onChange={(event) => setQuestionCount(event.target.value)}
              >
                <option value="3">3 questions</option>
                <option value="5">5 questions</option>
                <option value="10">10 questions</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="rm-error" role="alert">
              {error}
            </p>
          )}

          <button className="rm-primary" type="submit">
            Generate my assessment <span>✦</span>
          </button>

          <p className="rm-demo-note">
            Demo mode: topic-specific AI generation will be connected later.
          </p>
        </form>
      )}

      {questions.length > 0 && !submitted && (
        <section className="rm-card rm-assessment">
          <div className="rm-assessment-heading">
            <div>
              <span className="rm-eyebrow">
                {format.toUpperCase()} · {difficulty.toUpperCase()}
              </span>
              <h2>{topic}</h2>
              <p className="rm-muted">
                Choose or write your answer for every question.
              </p>
            </div>
            <span className="rm-question-count">
              {questions.length} questions
            </span>
          </div>

          {error && (
            <p className="rm-error" role="alert">
              {error}
            </p>
          )}

          <div className="rm-question-list">
            {questions.map((question, index) => (
              <article className="rm-question" key={question.id}>
                <span className="rm-question-label">
                  QUESTION {index + 1} ·{" "}
                  {question.type === "mcq"
                    ? "MCQ"
                    : question.type === "truefalse"
                    ? "TRUE / FALSE"
                    : question.type === "hots"
                    ? "HOTS"
                    : "WRITTEN"}
                </span>

                <h3>{question.question}</h3>

                {question.options ? (
                  <div className="rm-answer-options">
                    {question.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={`rm-answer-option ${
                          answers[index] === option ? "selected" : ""
                        }`}
                        onClick={() =>
                          setAnswers((previous) => ({
                            ...previous,
                            [index]: option,
                          }))
                        }
                      >
                        <span>
                          {answers[index] === option ? "◉" : "○"}
                        </span>
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[index] || ""}
                    onChange={(event) =>
                      setAnswers((previous) => ({
                        ...previous,
                        [index]: event.target.value,
                      }))
                    }
                    placeholder="Write your answer here..."
                  />
                )}
              </article>
            ))}
          </div>

          <button
            type="button"
            className="rm-primary"
            onClick={submitAssessment}
          >
            Submit answers and see results
          </button>

          <button
            type="button"
            className="rm-text-button"
            onClick={cancelAssessment}
          >
            Cancel assessment
          </button>
        </section>
      )}

      {submitted && (
        <section className="rm-card rm-results">
          <span className="rm-eyebrow">ASSESSMENT COMPLETE</span>
          <h2>Your effort builds your memory.</h2>

          <div className="rm-result-score">
            <strong>
              {questions.filter((question) => question.correct).length}/
              {questions.length}
            </strong>
            <span>Correct answers</span>
          </div>

          <div className="rm-result-bar">
            <span
              style={{
                width: `${
                  questions.length
                    ? Math.round(
                        (questions.filter((question) => question.correct)
                          .length /
                          questions.length) *
                          100
                      )
                    : 0
                }%`,
              }}
            />
          </div>

          <p className="rm-muted">
            Review every explanation below, especially the questions you
            missed.
          </p>

          {questions.map((question, index) => (
            <article
              className={`rm-result-question ${
                question.correct ? "correct" : "incorrect"
              }`}
              key={question.id}
            >
              <div className="rm-result-title">
                <strong>
                  {index + 1}. {question.question}
                </strong>
                <span>{question.correct ? "✓ Correct" : "↻ Review"}</span>
              </div>

              {!question.correct && (
                <p>
                  <strong>Your answer:</strong>{" "}
                  {question.userAnswer || "No answer submitted"}
                </p>
              )}

              <p>
                <strong>Correct answer:</strong> {question.answer}
              </p>
              <p>{question.explanation}</p>
            </article>
          ))}

          <div className="rm-next-review">
            <span>↻ NEXT STEP</span>
            <h3>
              {questions.some((question) => !question.correct)
                ? "Let's strengthen the weak spots."
                : "Great work. Keep the memory fresh."}
            </h3>
            <p>
              {questions.some((question) => !question.correct)
                ? "Revisit missed questions and try this topic again later."
                : "Your result has been recorded. Revisit the topic to strengthen recall."}
            </p>
          </div>

          <button
            type="button"
            className="rm-primary"
            onClick={finishReview}
          >
            Back to ReMind
          </button>
        </section>
      )}

      <section className="rm-card rm-achievements">
        <span className="rm-eyebrow">YOUR PROGRESS</span>
        <h2>Little wins. Stronger memory.</h2>
        <p className="rm-muted">
          Complete assessments and build your learning streak to unlock
          badges.
        </p>

        <div className="rm-badge-grid">
          {badges.map((badge) => {
            const unlocked = earned.includes(badge.name);

            return (
              <article
                className={`rm-badge ${
                  unlocked ? "unlocked" : "locked"
                }`}
                key={badge.name}
              >
                <span className="rm-badge-icon">{badge.icon}</span>
                <strong>{badge.name}</strong>
                <p>{badge.detail}</p>
                <span className="rm-badge-state">
                  {unlocked ? "✓ Unlocked" : "🔒 Locked"}
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rm-card rm-history">
        <span className="rm-eyebrow">YOUR LEARNING JOURNEY</span>
        <h2>Recent assessments</h2>

        {history.length === 0 ? (
          <p className="rm-muted">
            Your completed assessments will appear here.
          </p>
        ) : (
          history.slice(0, 5).map((item, index) => (
            <div
              className="rm-history-row"
              key={`${item.date}-${index}`}
            >
              <div>
                <strong>{item.topic}</strong>
                <p>
                  {item.format.toUpperCase()} ·{" "}
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
              <strong>{item.percent}%</strong>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
