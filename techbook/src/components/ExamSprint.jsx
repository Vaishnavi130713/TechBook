
import { useState } from "react";

const confidenceLevels = ["Need help", "Somewhat confident", "Confident"];

function ExamSprint() {
  const [subject, setSubject] = useState("");
  const [examDate, setExamDate] = useState("");
  const [dailyHours, setDailyHours] = useState("2");
  const [topics, setTopics] = useState([
    { name: "", importance: "Important", level: "Need help" },
  ]);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  function updateTopic(index, field, value) {
    setTopics((previous) =>
      previous.map((topic, i) =>
        i === index ? { ...topic, [field]: value } : topic
      )
    );
  }

  function addTopic() {
    setTopics((previous) => [
      ...previous,
      { name: "", importance: "Important", level: "Need help" },
    ]);
  }

  function removeTopic(index) {
    setTopics((previous) => previous.filter((_, i) => i !== index));
  }

  function createPlan(event) {
    event.preventDefault();
    setError("");
    setPlan(null);

    const validTopics = topics.filter((topic) => topic.name.trim());

    if (!subject.trim()) {
      setError("Enter the subject or exam name first.");
      return;
    }

    if (!examDate) {
      setError("Choose your exam date.");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadline = new Date(`${examDate}T00:00:00`);
    const daysLeft = Math.ceil(
      (deadline.getTime() - today.getTime()) / 86400000
    ) + 1;

    if (daysLeft < 1) {
      setError("Choose today or a future date for your exam.");
      return;
    }

    if (validTopics.length === 0) {
      setError("Add at least one topic to build your plan.");
      return;
    }

    const hoursPerDay = Number(dailyHours);
    const availableHours = daysLeft * hoursPerDay;

    const rankedTopics = validTopics
      .map((topic) => ({
        ...topic,
        score:
          (topic.level === "Need help" ? 3 : 0) +
          (topic.level === "Somewhat confident" ? 1 : 0) +
          (topic.importance === "Very important" ? 3 : 0) +
          (topic.importance === "Important" ? 2 : 0),
      }))
      .sort((a, b) => b.score - a.score);

    const topicHours = Math.max(
      0.5,
      Math.round((availableHours / rankedTopics.length) * 2) / 2
    );

    const sessions = rankedTopics.map((topic, index) => ({
      ...topic,
      hours: topicHours,
      order: index + 1,
    }));

    const totalPlanned = sessions.reduce(
      (sum, topic) => sum + topic.hours,
      0
    );

    setPlan({
      daysLeft,
      hoursPerDay,
      availableHours,
      sessions,
      totalPlanned,
      subject,
    });
  }

  return (
    <main className="es-page">
      <header className="es-topbar">
        <button
          className="es-back"
          type="button"
          onClick={() => {
            window.location.hash = "features";
          }}
        >
          ← Dashboard
        </button>
        <span className="es-topbar-label">YOUR EXAM WORKSPACE</span>
        <div className="es-avatar">T</div>
      </header>

      <section className="es-hero">
        <div>
          <span className="es-eyebrow">✦ YOUR TIME. YOUR PLAN.</span>
          <h1>
            Make every
            <br />
            <span>study session count.</span>
          </h1>
          <p>
            From tomorrow's exam to a three-month preparation journey,
            build a plan that respects your time and your priorities.
          </p>
          <div className="es-hero-tags">
            <span>◷ Realistic schedules</span>
            <span>✦ Weak topics first</span>
            <span>✓ Your pace</span>
          </div>
        </div>

        <div className="es-hero-art" aria-hidden="true">
          <div className="es-orbit es-orbit-one" />
          <div className="es-orbit es-orbit-two" />
          <div className="es-clock-art">
            <span>◷</span>
          </div>
          <span className="es-float es-float-one">One topic at a time</span>
          <span className="es-float es-float-two">You've got this ✦</span>
        </div>
      </section>

      <section className="es-layout">
        <form className="es-form-card" onSubmit={createPlan}>
          <div className="es-section-icon">✦</div>
          <h2>Build your study plan</h2>
          <p className="es-muted">
            Tell us what you're preparing for and how much time you have.
          </p>

          <label htmlFor="es-subject">Subject or exam</label>
          <input
            id="es-subject"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. CA Foundation, Mathematics, Biology"
          />

          <div className="es-card-heading">
            <div>
              <h3>Your topics</h3>
              <p className="es-muted">
                Add topics and identify your priorities.
              </p>
            </div>
            <button className="es-add" type="button" onClick={addTopic}>
              + Add topic
            </button>
          </div>

          <div className="es-topic-list">
            {topics.map((topic, index) => (
              <div className="es-topic-row" key={index}>
                <div className="es-topic-number">{index + 1}</div>
                <div className="es-topic-fields">
                  <label htmlFor={`es-topic-${index}`}>Topic name</label>
                  <input
                    id={`es-topic-${index}`}
                    value={topic.name}
                    onChange={(event) =>
                      updateTopic(index, "name", event.target.value)
                    }
                    placeholder="e.g. Accounting fundamentals"
                  />

                  <div className="es-topic-selects">
                    <div>
                      <label htmlFor={`es-importance-${index}`}>
                        Importance
                      </label>
                      <select
                        id={`es-importance-${index}`}
                        value={topic.importance}
                        onChange={(event) =>
                          updateTopic(index, "importance", event.target.value)
                        }
                      >
                        <option>Very important</option>
                        <option>Important</option>
                        <option>Lower priority</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`es-level-${index}`}>
                        Your confidence
                      </label>
                      <select
                        id={`es-level-${index}`}
                        value={topic.level}
                        onChange={(event) =>
                          updateTopic(index, "level", event.target.value)
                        }
                      >
                        {confidenceLevels.map((level) => (
                          <option key={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {topics.length > 1 && (
                  <button
                    type="button"
                    className="es-remove"
                    onClick={() => removeTopic(index)}
                    aria-label={`Remove topic ${index + 1}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="es-clock-level">
            <div className="es-clock-card">
              <span className="es-mini-icon">◷</span>
              <label htmlFor="es-date">Clock · Exam date</label>
              <input
                id="es-date"
                type="date"
                value={examDate}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(event) => setExamDate(event.target.value)}
                required
              />
              <small>We'll calculate your remaining days.</small>
            </div>

            <div className="es-clock-card">
              <span className="es-mini-icon">◴</span>
              <label htmlFor="es-hours">Level · Daily study time</label>
              <select
                id="es-hours"
                value={dailyHours}
                onChange={(event) => setDailyHours(event.target.value)}
              >
                <option value="0.5">30 minutes</option>
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="3">3 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="8">8 hours</option>
              </select>
              <small>Choose time you can realistically manage.</small>
            </div>
          </div>

          {error && <p className="es-error" role="alert">{error}</p>}

          <button className="es-submit" type="submit">
            Build my study plan <span>✦</span>
          </button>
          <p className="es-footnote">
            ✧ Your plan starts with the time you actually have.
          </p>
        </form>

        <aside className="es-side-card">
          <span className="es-eyebrow">YOUR STRATEGY</span>
          <h3>Study smarter, not longer.</h3>
          <p className="es-muted">
            Exam Sprint organizes your preparation around three things.
          </p>

          <div className="es-side-item">
            <span className="es-side-icon lilac">◷</span>
            <div>
              <strong>Your available time</strong>
              <p>A short deadline means a focused, realistic plan.</p>
            </div>
          </div>
          <div className="es-side-item">
            <span className="es-side-icon peach">↗</span>
            <div>
              <strong>Your weak topics</strong>
              <p>Topics you find difficult receive higher priority.</p>
            </div>
          </div>
          <div className="es-side-item">
            <span className="es-side-icon mint">✓</span>
            <div>
              <strong>Your important chapters</strong>
              <p>High-priority topics move toward the top of the list.</p>
            </div>
          </div>

          <div className="es-tip">
            ✦ Leave room for breaks and revision. A plan should support
            you, not overwhelm you.
          </div>
        </aside>
      </section>

      {plan && (
        <section className="es-result" aria-live="polite">
          <span className="es-eyebrow">YOUR STUDY ROADMAP</span>
          <h2>{plan.subject} · Your preparation plan</h2>

          <div className="es-stats">
            <div>
              <strong>{plan.daysLeft}</strong>
              <span>Days available</span>
            </div>
            <div>
              <strong>{plan.hoursPerDay}h</strong>
              <span>Daily study time</span>
            </div>
            <div>
              <strong>{plan.availableHours}h</strong>
              <span>Total available</span>
            </div>
          </div>

          <h3>Prioritized topics</h3>
          <p className="es-muted">
            Start with the topics that are both important and less familiar.
          </p>

          <div className="es-plan-list">
            {plan.sessions.map((topic) => (
              <article className="es-plan-item" key={topic.order}>
                <div className="es-plan-number">{topic.order}</div>
                <div className="es-plan-content">
                  <strong>{topic.name}</strong>
                  <p>
                    {topic.importance} · {topic.level}
                  </p>
                  <div className="es-plan-bar">
                    <span
                      style={{
                        width: `${Math.min(100, (topic.score / 6) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="es-plan-hours">{topic.hours}h</div>
              </article>
            ))}
          </div>

          <div className="es-tip">
            This is your first draft, not a fixed timetable. The current
            version uses your topic priorities and available hours.
            AI-generated daily scheduling will be added during the AI integration.
          </div>
        </section>
      )}
    </main>
  );
}

export default ExamSprint;
