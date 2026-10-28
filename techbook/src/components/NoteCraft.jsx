import { useState } from "react";
import {
  recordTopic,
  recordActivity,
} from "../utils/learningHistory";

const contentTypes = [
  "Revision Notes",
  "Flashcards",
  "MCQs",
  "Descriptive Questions",
  "Quick Revision Sheet",
  "Viva Q&A",
  "Mind Map",
];

const goals = [
  { id: "exam", icon: "🎓", title: "Exam prep", subtitle: "Prepare with focus" },
  { id: "quick", icon: "⚡", title: "Quick revision", subtitle: "Key points only" },
  { id: "deep", icon: "🧠", title: "Understand deeply", subtitle: "Learn the concepts" },
  { id: "viva", icon: "💬", title: "Viva practice", subtitle: "Be ready to explain" },
];

const formats = [
  { type: "Revision Notes", icon: "📝", title: "Revision notes", detail: "Organized key points", color: "lilac" },
  { type: "Flashcards", icon: "🗂️", title: "Flashcards", detail: "Remember more", color: "pink" },
  { type: "MCQs", icon: "✓", title: "Practice quiz", detail: "Test your knowledge", color: "mint" },
];

function NoteCraft() {
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [contentType, setContentType] = useState("Revision Notes");
  const [level, setLevel] = useState("Beginner");
  const [goal, setGoal] = useState("exam");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  
  function generateContent(event) {
      event.preventDefault();
      setError("");
      setResult("");
      
      const cleanTopic = topic.trim();
      const cleanSubject = subject.trim() || "General";
      
      if (!cleanTopic) {
    setError("Add a topic first, and we'll prepare your study workspace.");
    return;
  }

  const selectedGoal = goals.find((item) => item.id === goal);

  // Record that the student started studying this topic.
  recordTopic({
    title: cleanTopic,
    subject: cleanSubject,
    feature: "Note Craft",
    progress: 0,
    status: "in-progress",
  });

  // Record the study-material creation attempt.
  recordActivity({
    title: `${contentType} — ${cleanTopic}`,
    type: "Study material requested",
    subject: cleanSubject,
    feature: "Note Craft",
    minutes: 0,
    icon: "📝",
    details: `Level: ${level}; Goal: ${
      selectedGoal?.title || "General learning"
    }`,
  });

  setResult(
    `Your ${contentType.toLowerCase()}\n\n` +
    `Topic: ${cleanTopic}\n` +
    `Subject: ${cleanSubject}\n` +
    `Learning level: ${level}\n` +
    `Study goal: ${selectedGoal?.title || "General learning"}\n\n` +
    `Your topic has been added to My Learning. ` +
    `AI-generated study material will be available when the AI service is connected.`
  );
}


  function goBack() {
    window.location.hash = "";
  }

  return (
    <main className="nc-page">
      <header className="nc-topbar">
        <button className="nc-back" type="button" onClick={goBack}>
          ← Dashboard
        </button>
        <span className="nc-topbar-label">YOUR LEARNING WORKSPACE</span>
        <div className="nc-avatar">T</div>
      </header>

      <section className="nc-hero">
        <div className="nc-hero-copy">
          <span className="nc-eyebrow">✦ YOUR PERSONAL STUDY ASSISTANT</span>
          <h1>
            Turn learning into
            <br />
            something that <span>sticks.</span>
          </h1>
          <p>
            Create study materials that match your goals, your subject,
            and the way you learn best.
          </p>

          <div className="nc-benefits">
            <div>
              <span className="nc-benefit-icon">✦</span>
              <div><strong>Save time</strong><small>Focus on what matters</small></div>
            </div>
            <div>
              <span className="nc-benefit-icon">◎</span>
              <div><strong>Learn better</strong><small>Study with a purpose</small></div>
            </div>
            <div>
              <span className="nc-benefit-icon">↗</span>
              <div><strong>Build confidence</strong><small>One topic at a time</small></div>
            </div>
          </div>
        </div>

        <div className="nc-hero-art" aria-hidden="true">
          <div className="nc-orbit nc-orbit-one" />
          <div className="nc-orbit nc-orbit-two" />
          <div className="nc-float-card nc-float-notes">✎ Notes</div>
          <div className="nc-float-card nc-float-flash">✦ Flashcards</div>
          <div className="nc-book-stack">
            <div className="nc-book nc-book-back" />
            <div className="nc-book nc-book-middle" />
            <div className="nc-book nc-book-front">
              <span>✧</span>
              <strong>Note Craft</strong>
              <small>Make knowledge yours</small>
            </div>
          </div>
          <div className="nc-pencil">✎</div>
          <span className="nc-spark nc-spark-one">✦</span>
          <span className="nc-spark nc-spark-two">✧</span>
        </div>
      </section>

      <section className="nc-workspace">
        <form className="nc-form-card" onSubmit={generateContent}>
          <div className="nc-card-heading">
            <div className="nc-heading-icon">▤</div>
            <div>
              <h2>Create your study material</h2>
              <p>Start with a topic. We'll take it from there.</p>
            </div>
          </div>

          <label htmlFor="nc-topic">What do you want to learn?</label>
          <textarea
            id="nc-topic"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Binary Search Trees, Photosynthesis, Linear Algebra..."
            rows={3}
            maxLength={300}
          />
          <div className="nc-character-count">{topic.length}/300</div>

          <label htmlFor="nc-subject">Subject <span>(optional)</span></label>
          <input
            id="nc-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Data Structures, Biology, Mathematics"
          />

          <div className="nc-select-grid">
            <div>
              <label htmlFor="nc-type">Study material</label>
              <select
                id="nc-type"
                value={contentType}
                onChange={(event) => setContentType(event.target.value)}
              >
                {contentTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="nc-level">Your current level</label>
              <select
                id="nc-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          {error && <p className="nc-error" role="alert">{error}</p>}

          <button className="nc-submit" type="submit">
            Create study material <span>✦</span>
          </button>
          <p className="nc-form-footnote">✧ Your study session starts with one topic.</p>
        </form>

        <aside className="nc-side-column">
          <section className="nc-goal-card">
            <div className="nc-side-heading">
              <span className="nc-side-icon">◎</span>
              <div>
                <h3>What are you preparing for?</h3>
                <p>Choose a goal to guide your study session.</p>
              </div>
            </div>

            <div className="nc-goal-grid">
              {goals.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`nc-goal-option ${goal === item.id ? "selected" : ""}`}
                  onClick={() => setGoal(item.id)}
                  aria-pressed={goal === item.id}
                >
                  <span className="nc-goal-emoji">{item.icon}</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.subtitle}</small>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="nc-formats-card">
            <div className="nc-side-heading">
              <span className="nc-side-icon warm">✦</span>
              <div>
                <h3>Popular formats</h3>
                <p>Pick a format to get started quickly.</p>
              </div>
            </div>

            <div className="nc-format-grid">
              {formats.map((item) => (
                <button
                  type="button"
                  key={item.type}
                  className={`nc-format-option ${item.color} ${contentType === item.type ? "selected" : ""}`}
                  onClick={() => setContentType(item.type)}
                  aria-pressed={contentType === item.type}
                >
                  <span className="nc-format-emoji">{item.icon}</span>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </button>
              ))}
            </div>
          </section>

          <div className="nc-tip-card">
            <span>💡</span>
            <div>
              <strong>A little tip</strong>
              <p>Start with one topic and choose a format that fits your goal.</p>
            </div>
          </div>
        </aside>
      </section>

      {result && (
        <section className="nc-result" aria-live="polite">
          <div>
            <span className="nc-eyebrow">YOUR STUDY WORKSPACE</span>
            <h2>You're ready to learn ✨</h2>
          </div>
          <pre>{result}</pre>
          <p>Preview only — AI generation isn't connected yet.</p>
        </section>
      )}
    </main>
  );
}

export default NoteCraft;
