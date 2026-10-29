
import { useState } from "react";
import {
  recordTopic,
  recordActivity,
} from "../utils/learningHistory";

const modes = [
  {
    id: "simplify",
    name: "Simplify",
    tagline: "Learn through real-life examples",
    icon: "♡",
    color: "cm-lilac",
    instruction:
      "Explain the concept using a relatable real-life analogy, simple language, and a familiar example.",
  },
  {
    id: "visualize",
    name: "Visualize",
    tagline: "See concepts step by step",
    icon: "◇",
    color: "cm-blue",
    instruction:
      "Break the concept into steps and show the relationships using a diagram or visual representation.",
  },
  {
    id: "practice",
    name: "Practice",
    tagline: "Learn through code and examples",
    icon: "</>",
    color: "cm-mint",
    instruction:
      "Teach the concept through a worked example, practical application, and code when relevant.",
  },
  {
    id: "ace",
    name: "Ace",
    tagline: "Prepare for university exams",
    icon: "✎",
    color: "cm-peach",
    instruction:
      "Give an exam-ready answer with a definition, structured explanation, examples, and key points.",
  },
  {
    id: "master",
    name: "Master",
    tagline: "Understand the logic behind concepts",
    icon: "✦",
    color: "cm-pink",
    instruction:
      "Explain the underlying logic, why the concept works, edge cases, and common misconceptions.",
  },
];

const starterLessons = {
  fraction: {
    title: "Understanding fractions",
    definition: "A fraction represents part of a whole.",
    example:
      "Imagine cutting a pizza into 4 equal slices. If you eat 1 slice, you have eaten 1/4 of the pizza.",
    steps: [
      "Whole pizza",
      "Divide into 4 equal slices",
      "Take 1 slice = 1/4",
    ],
    practice:
      "If you take 3 slices from 4 equal slices, what fraction have you taken?",
    answer: "3/4",
    logic:
      "The denominator tells us how many equal parts make the whole. The numerator tells us how many parts we have.",
  },
  recursion: {
    title: "Understanding recursion",
    definition:
      "Recursion is a programming technique in which a function calls itself to solve a smaller version of a problem.",
    example:
      "Imagine opening a box that contains a smaller box, which contains another smaller box. Eventually, you reach a box with no smaller box inside.",
    steps: [
      "Start a function",
      "Solve a smaller version of the problem",
      "Stop at the base case",
    ],
    practice:
      "What could happen if a recursive function never reaches its base case?",
    answer:
      "It may keep calling itself until the program runs out of resources or reaches a recursion limit.",
    logic:
      "Each recursive call must make progress toward a base case. Without a stopping condition, the problem never finishes.",
  },
  photosynthesis: {
    title: "Understanding photosynthesis",
    definition:
      "Photosynthesis is the process by which plants use light energy to make glucose from carbon dioxide and water.",
    example:
      "Think of a leaf as a tiny solar-powered kitchen. It uses sunlight as energy to help make food for the plant.",
    steps: [
      "Leaves absorb light",
      "Roots supply water and leaves take in carbon dioxide",
      "The plant makes glucose and releases oxygen",
    ],
    practice: "Which source of energy powers photosynthesis?",
    answer: "Light energy, usually from the Sun.",
    logic:
      "Light energy drives the reactions that convert the starting materials into energy-rich sugars.",
  },
};

function getLesson(concept, mode) {
  const normalized = concept.toLowerCase();

  const key = Object.keys(starterLessons).find((item) =>
    normalized.includes(item)
  );

  const lesson = starterLessons[key] || {
    title: `Exploring ${concept}`,
    definition: `${concept} is the topic you chose to study. Its exact definition and details depend on the subject and context.`,
    example: `Begin by identifying the main idea of ${concept}, then connect it to an example from your subject.`,
    steps: [
      `Identify the key idea in ${concept}`,
      "Break the idea into smaller parts",
      "Connect the parts and check your understanding",
    ],
    practice: `In your own words, what is the most important idea behind ${concept}?`,
    answer: `Explain the central idea of ${concept} using its definition and a relevant example from your course material.`,
    logic: `To understand ${concept} deeply, examine its assumptions, how its parts interact, and when the concept applies.`,
  };

  return { ...lesson, mode };
}

function ClearMind() {
  const [concept, setConcept] = useState("");
  const [selectedMode, setSelectedMode] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [helpful, setHelpful] = useState(null);
  const [history, setHistory] = useState({});

  const activeMode = modes.find(
    (mode) => mode.id === selectedMode
  );

  function handleConceptChange(event) {
    setConcept(event.target.value);
    setSelectedMode("");
    setResult(null);
    setHelpful(null);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult(null);
    setHelpful(null);

    if (!concept.trim()) {
      setError("Enter a concept you'd like to understand first.");
      return;
    }

    if (!selectedMode || !activeMode) {
      setError("Choose how you'd like to learn this concept.");
      return;
    }

    const cleanedConcept = concept.trim();

    // Add the concept to My Learning.
    recordTopic({
      title: cleanedConcept,
      subject: "General",
      feature: "Clear Mind",
      progress: 0,
      status: "in-progress",
    });

    // Record the selected learning mode.
    recordActivity({
      title: `${activeMode.name} — ${cleanedConcept}`,
      type: "Concept explanation",
      subject: "General",
      feature: "Clear Mind",
      minutes: 0,
      icon: activeMode.icon,
      details: `Learning mode: ${activeMode.name}. ${activeMode.tagline}`,
    });

    // Display the existing lesson preview.
    setResult(getLesson(cleanedConcept, activeMode));
  }

  function goBack() {
    window.location.hash = "features";
  }

  function rateExplanation(wasHelpful) {
    setHelpful(wasHelpful);

    setHistory((previous) => ({
      ...previous,
      [result.mode.id]: wasHelpful,
    }));
  }

  return (
    <main className="cm-page">
      <header className="cm-topbar">
        <button
          className="cm-back"
          type="button"
          onClick={goBack}
        >
          ← Dashboard
        </button>

        <span className="cm-topbar-label">
          YOUR CONCEPT WORKSPACE
        </span>

        <div className="cm-avatar">T</div>
      </header>

      <section className="cm-hero">
        <div className="cm-hero-copy">
          <span className="cm-eyebrow">
            ✦ UNDERSTAND IT YOUR WAY
          </span>

          <h1>
            One concept.
            <br />
            <span>Five ways to learn.</span>
          </h1>

          <p>
            Learn in the way that makes sense to you.
            Choose a teaching style and start exploring.
          </p>

          <div className="cm-hero-tags">
            <span>♡ Your pace</span>
            <span>✦ Your style</span>
            <span>◎ Your understanding</span>
          </div>
        </div>

        <div className="cm-hero-art" aria-hidden="true">
          <div className="cm-art-orbit cm-art-orbit-one" />
          <div className="cm-art-orbit cm-art-orbit-two" />
          <div className="cm-art-center">✦</div>
          <span className="cm-art-bubble cm-bubble-one">
            Learn
          </span>
          <span className="cm-art-bubble cm-bubble-two">
            Explore
          </span>
          <span className="cm-art-bubble cm-bubble-three">
            Understand
          </span>
        </div>
      </section>

      <section className="cm-workspace">
        <form
          className="cm-input-card"
          onSubmit={handleSubmit}
        >
          <div className="cm-card-icon">✧</div>

          <h2>What would you like to understand?</h2>

          <p>
            Enter any concept, question, or topic from your studies.
          </p>

          <label htmlFor="cm-concept">Your concept</label>

          <textarea
            id="cm-concept"
            value={concept}
            onChange={handleConceptChange}
            placeholder="e.g. Recursion, Photosynthesis, Fractions, Newton's Laws..."
            rows={3}
            maxLength={500}
          />

          <div className="cm-char-count">
            {concept.length}/500
          </div>

          <h3>How would you like to learn this concept? *</h3>

          <p className="cm-mode-prompt">
            Choose one of the five styles for this topic.
          </p>

          <div className="cm-mode-grid">
            {modes.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`cm-mode-card ${mode.color} ${
                  selectedMode === mode.id ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedMode(mode.id);
                  setResult(null);
                  setHelpful(null);
                  setError("");
                }}
                aria-pressed={selectedMode === mode.id}
              >
                <span className="cm-mode-icon">
                  {mode.icon}
                </span>

                <strong>{mode.name}</strong>

                <small>{mode.tagline}</small>

                <span className="cm-mode-check">
                  {selectedMode === mode.id
                    ? "✓ Selected"
                    : "Choose →"}
                </span>
              </button>
            ))}
          </div>

          {error && (
            <p className="cm-error" role="alert">
              {error}
            </p>
          )}

          <button className="cm-submit" type="submit">
            Teach me this concept <span>✦</span>
          </button>

          <p className="cm-footnote">
            ✧ Every new topic starts with your choice.
          </p>
        </form>

        <aside className="cm-side-card">
          <span className="cm-eyebrow">
            YOUR SELECTED STYLE
          </span>

          {activeMode ? (
            <>
              <div className={`cm-side-icon ${activeMode.color}`}>
                {activeMode.icon}
              </div>

              <h3>{activeMode.name}</h3>

              <p>{activeMode.tagline}</p>

              <div className="cm-side-divider" />

              <strong>Your lesson will focus on</strong>

              <p>{activeMode.instruction}</p>
            </>
          ) : (
            <>
              <div className="cm-side-icon cm-lilac">?</div>

              <h3>Choose your style</h3>

              <p>
                Your learning mode will appear here after you select one.
              </p>
            </>
          )}

          <div className="cm-personal-note">
            <span>✦</span>

            <p>
              Clear Mind can learn which explanation styles help you
              succeed as you answer practice questions.
            </p>
          </div>
        </aside>
      </section>

      {result && (
        <section className="cm-result" aria-live="polite">
          <span className="cm-eyebrow">
            YOUR LEARNING SPACE
          </span>

          <h2>{result.title}</h2>

          <div className={`cm-result-mode ${result.mode.color}`}>
            {result.mode.icon} {result.mode.name} mode
          </div>

          <h3>What it means</h3>

          <p>{result.definition}</p>

          {result.mode.id === "simplify" && (
            <div className="cm-example-box">
              <strong>Think of it this way</strong>
              <p>{result.example}</p>
            </div>
          )}

          {result.mode.id === "visualize" && (
            <div className="cm-visual-steps">
              {result.steps.map((step, index) => (
                <div className="cm-visual-step" key={step}>
                  <div>
                    {index + 1}. {step}
                  </div>

                  {index < result.steps.length - 1 && (
                    <span>↓</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {result.mode.id === "practice" && (
            <>
              <div className="cm-example-box">
                <strong>Worked example</strong>
                <p>{result.example}</p>
              </div>

              <div className="cm-example-box">
                <strong>Try it yourself</strong>
                <p>{result.practice}</p>

                <details>
                  <summary>Reveal suggested answer</summary>
                  <p>{result.answer}</p>
                </details>
              </div>
            </>
          )}

          {result.mode.id === "ace" && (
            <div className="cm-example-box">
              <strong>Exam-ready answer structure</strong>

              <p>
                <b>Definition:</b> {result.definition}
              </p>

              <p>
                <b>Example:</b> {result.example}
              </p>

              <p>
                <b>Key point:</b> Explain the main idea clearly
                and support it with an example.
              </p>
            </div>
          )}

          {result.mode.id === "master" && (
            <div className="cm-example-box">
              <strong>Why it works</strong>

              <p>{result.logic}</p>

              <p>
                <b>Check your understanding:</b> What assumptions
                does this concept rely on, and when might it not apply?
              </p>
            </div>
          )}

          <div className="cm-ai-notice">
            <span>✦</span>

            <p>
              Local lesson preview: this version includes starter
              examples and general templates. Connect an AI service
              later for detailed, topic-specific teaching across subjects.
            </p>
          </div>

          <div className="cm-feedback">
            <strong>
              Did this teaching style help you understand?
            </strong>

            <p>
              Your feedback is stored in this page's current session only.
            </p>

            <div className="cm-feedback-buttons">
              <button
                type="button"
                className={helpful === true ? "chosen" : ""}
                onClick={() => rateExplanation(true)}
              >
                ♡ Yes, it helped
              </button>

              <button
                type="button"
                className={helpful === false ? "chosen" : ""}
                onClick={() => rateExplanation(false)}
              >
                ↻ Try another style
              </button>
            </div>

            {helpful !== null && (
              <p className="cm-feedback-message" role="status">
                {helpful
                  ? `Thanks! ${result.mode.name} is marked as helpful in this session.`
                  : "Choose another mode above to compare explanations."}
              </p>
            )}

            {Object.keys(history).length > 0 && (
              <p className="cm-history">
                Feedback this session:{" "}
                {Object.entries(history)
                  .map(([id, value]) => {
                    const mode = modes.find(
                      (item) => item.id === id
                    );

                    return `${mode.name}: ${
                      value ? "helpful" : "try another"
                    }`;
                  })
                  .join(" · ")}
              </p>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default ClearMind;
