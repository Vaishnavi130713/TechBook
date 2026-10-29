
import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "techbookLearningActivity";

const initialData = {
  topics: [],
  quizzes: [],
  activities: [],
};

function readLearningData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialData;

    const parsed = JSON.parse(saved);

    return {
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      activities: Array.isArray(parsed.activities)
        ? parsed.activities
        : [],
    };
  } catch {
    return initialData;
  }
}

function formatDate(value) {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTopicProgress(topic) {
  if (topic.status === "completed") return 100;

  return Math.min(
    100,
    Math.max(0, Number(topic.progress) || 0)
  );
}

export default function MyLearning() {
  const [data, setData] = useState(readLearningData);
  const [activeTab, setActiveTab] = useState("Overview");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All subjects");

  useEffect(() => {
    const refresh = () => setData(readLearningData());

    window.addEventListener("storage", refresh);
    window.addEventListener("techbook:learning-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(
        "techbook:learning-updated",
        refresh
      );
    };
  }, []);

  const completedTopics = data.topics.filter(
    (topic) => topic.status === "completed"
  ).length;

  const studyMinutes = data.activities.reduce(
    (total, activity) =>
      total + Math.max(0, Number(activity.minutes) || 0),
    0
  );

  const averageScore = data.quizzes.length
    ? Math.round(
        data.quizzes.reduce(
          (total, quiz) =>
            total + Math.max(0, Math.min(100, Number(quiz.score) || 0)),
          0
        ) / data.quizzes.length
      )
    : null;

  const subjects = useMemo(
    () => [
      "All subjects",
      ...new Set(
        data.topics
          .map((topic) => topic.subject)
          .filter(Boolean)
      ),
    ],
    [data.topics]
  );

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();

    return data.topics.filter((topic) => {
      const matchesSearch =
        !query ||
        `${topic.title || ""} ${topic.subject || ""}`
          .toLowerCase()
          .includes(query);

      const matchesSubject =
        subjectFilter === "All subjects" ||
        topic.subject === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  }, [data.topics, search, subjectFilter]);

  const subjectStats = useMemo(() => {
    const groups = {};

    data.topics.forEach((topic) => {
      const name = topic.subject || "Uncategorised";
      if (!groups[name]) groups[name] = [];

      groups[name].push(topic);
    });

    return Object.entries(groups).map(([name, topics]) => ({
      name,
      total: topics.length,
      completed: topics.filter(
        (topic) => topic.status === "completed"
      ).length,
      progress: Math.round(
        topics.reduce(
          (sum, topic) => sum + getTopicProgress(topic),
          0
        ) / topics.length
      ),
    }));
  }, [data.topics]);

  const recentActivities = useMemo(
    () =>
      [...data.activities]
        .sort(
          (a, b) =>
            new Date(b.date || 0).getTime() -
            new Date(a.date || 0).getTime()
        )
        .slice(0, 6),
    [data.activities]
  );
  const recentlyStudiedTopics = useMemo(
    () =>
      [...data.topics]
        .sort(
          (a, b) =>
            new Date(b.lastStudied || b.date || 0).getTime() -
            new Date(a.lastStudied || a.date || 0).getTime()
          )
          .slice(0, 5),
          [data.topics]
  );

  const tabs = ["Overview", "Topics", "Quiz records", "Activity"];

  return (
    <div className="ml-page">
      <header className="ml-header">
        <div>
          <a className="ml-back" href="#home">
            ← Back to dashboard
          </a>
          <p className="ml-eyebrow">YOUR LEARNING SPACE</p>
          <h1>My Learning<span>.</span></h1>
          <p className="ml-subtitle">
            Every topic, every attempt, every little step forward.
          </p>
        </div>

        <div className="ml-header-art" aria-hidden="true">
          <span>✦</span>
          <i>Learn</i>
          <i>Grow</i>
        </div>
      </header>

      <section className="ml-stats">
        <article className="ml-stat-card">
          <span className="ml-stat-icon ml-lilac">◈</span>
          <p>Topics explored</p>
          <strong>{data.topics.length}</strong>
          <small>Across your learning journey</small>
        </article>

        <article className="ml-stat-card">
          <span className="ml-stat-icon ml-peach">✓</span>
          <p>Topics completed</p>
          <strong>{completedTopics}</strong>
          <small>Finished learning topics</small>
        </article>

        <article className="ml-stat-card">
          <span className="ml-stat-icon ml-mint">◷</span>
          <p>Study time recorded</p>
          <strong>
            {Math.floor(studyMinutes / 60)}h {studyMinutes % 60}m
          </strong>
          <small>From recorded study sessions</small>
        </article>

        <article className="ml-stat-card">
          <span className="ml-stat-icon ml-pink">✧</span>
          <p>Average quiz score</p>
          <strong>
            {averageScore === null ? "—" : `${averageScore}%`}
          </strong>
          <small>
            {averageScore === null
              ? "Complete a recorded quiz to begin"
              : `${data.quizzes.length} quiz attempts recorded`}
          </small>
        </article>
      </section>

      <nav className="ml-tabs" aria-label="Learning sections">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === "Overview" && (
        <div className="ml-main-grid">
          <section className="ml-panel ml-wide">
            <div className="ml-panel-heading">
              <div>
                <p className="ml-eyebrow">KEEP GOING</p>
                <h2>Recently studied</h2>
              </div>
              <button
                className="ml-text-button"
                onClick={() => setActiveTab("Topics")}
              >
                View all →
              </button>
            </div>

            {data.topics.length === 0 ? (
              <EmptyState
                icon="✧"
                title="Your learning story starts here"
                text="Explore a topic in TechBook. Your learning history will appear here as activities are recorded."
                action="Explore learning tools"
                onClick={() => {
                  window.location.hash = "#home";
                }}
              />
            ) : (
              <TopicList topics={recentlyStudiedTopics} />
            )}
          </section>

          <section className="ml-panel">
            <div className="ml-panel-heading">
              <div>
                <p className="ml-eyebrow">YOUR PROGRESS</p>
                <h2>By subject</h2>
              </div>
            </div>

            {subjectStats.length === 0 ? (
              <p className="ml-muted">
                Subject progress will appear when you start studying.
              </p>
            ) : (
              <div className="ml-subject-list">
                {subjectStats.map((subject) => (
                  <div className="ml-subject" key={subject.name}>
                    <div className="ml-subject-line">
                      <strong>{subject.name}</strong>
                      <span>{subject.progress}%</span>
                    </div>
                    <div className="ml-progress-track">
                      <span style={{ width: `${subject.progress}%` }} />
                    </div>
                    <small>
                      {subject.completed} of {subject.total} topics completed
                    </small>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="ml-panel">
            <div className="ml-panel-heading">
              <div>
                <p className="ml-eyebrow">TEST YOURSELF</p>
                <h2>Quiz performance</h2>
              </div>
              <button
                className="ml-text-button"
                onClick={() => setActiveTab("Quiz records")}
              >
                History →
              </button>
            </div>

            {data.quizzes.length === 0 ? (
              <EmptyState
                icon="✎"
                title="No quiz attempts yet"
                text="Your scores and attempts will be collected here once quiz results are saved."
              />
            ) : (
              <div className="ml-quiz-summary">
                <strong>{averageScore}%</strong>
                <span>Average score</span>
                <small>{data.quizzes.length} recorded attempts</small>
              </div>
            )}
          </section>

          <section className="ml-panel">
            <div className="ml-panel-heading">
              <div>
                <p className="ml-eyebrow">YOUR JOURNEY</p>
                <h2>Recent activity</h2>
              </div>
              <button
                className="ml-text-button"
                onClick={() => setActiveTab("Activity")}
              >
                View all →
              </button>
            </div>

            {recentActivities.length === 0 ? (
              <p className="ml-muted">
                Your notes, concept maps, explanations and study sessions
                will show up here when recorded.
              </p>
            ) : (
              <ActivityList activities={recentActivities} />
            )}
          </section>
        </div>
      )}

      {activeTab === "Topics" && (
        <section className="ml-panel ml-tab-panel">
          <div className="ml-panel-heading">
            <div>
              <p className="ml-eyebrow">YOUR KNOWLEDGE</p>
              <h2>Topics and progress</h2>
            </div>
            <span className="ml-count">{data.topics.length} topics</span>
          </div>

          <div className="ml-filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search topics or subjects..."
              aria-label="Search topics"
            />
            <select
              value={subjectFilter}
              onChange={(event) => setSubjectFilter(event.target.value)}
              aria-label="Filter by subject"
            >
              {subjects.map((subject) => (
                <option key={subject}>{subject}</option>
              ))}
            </select>
          </div>

          {filteredTopics.length ? (
            <TopicList topics={filteredTopics} />
          ) : (
            <EmptyState
              icon="⌕"
              title="No matching topics"
              text="Topics will appear here after a TechBook feature records your learning activity."
            />
          )}
        </section>
      )}

      {activeTab === "Quiz records" && (
        <section className="ml-panel ml-tab-panel">
          <div className="ml-panel-heading">
            <div>
              <p className="ml-eyebrow">PRACTICE HISTORY</p>
              <h2>Your quiz attempts</h2>
            </div>
            <span className="ml-count">{data.quizzes.length} attempts</span>
          </div>

          {data.quizzes.length === 0 ? (
            <EmptyState
              icon="✎"
              title="Your first score is waiting"
              text="When a TechBook quiz saves its result, the score, topic, date and correct answers summary can appear here."
            />
          ) : (
            <div className="ml-table-wrap">
              <table className="ml-table">
                <thead>
                  <tr>
                    <th>Quiz / topic</th>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...data.quizzes]
                    .sort(
                      (a, b) =>
                        new Date(b.date || 0) - new Date(a.date || 0)
                    )
                    .map((quiz, index) => (
                      <tr key={quiz.id || index}>
                        <td>{quiz.title || quiz.topic || "Quiz"}</td>
                        <td>{quiz.subject || "—"}</td>
                        <td>
                          <span className="ml-score">
                            {Number(quiz.score) || 0}%
                          </span>
                        </td>
                        <td>{formatDate(quiz.date)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "Activity" && (
        <section className="ml-panel ml-tab-panel">
          <div className="ml-panel-heading">
            <div>
              <p className="ml-eyebrow">ALL YOUR STEPS</p>
              <h2>Learning activity</h2>
            </div>
            <span className="ml-count">
              {data.activities.length} activities
            </span>
          </div>

          {recentActivities.length === 0 ? (
            <EmptyState
              icon="◷"
              title="Your activity timeline is ready"
              text="Recorded summaries, flashcards, mind maps, Know It sessions and other learning activities will appear here."
            />
          ) : (
            <ActivityList
              activities={[...data.activities].sort(
                (a, b) =>
                  new Date(b.date || 0) - new Date(a.date || 0)
              )}
            />
          )}
        </section>
      )}

      <footer className="ml-footer">
        <span>TechBook · Your learning, your way.</span>
        <span>Progress is built one step at a time ♡</span>
      </footer>
    </div>
  );
}

function EmptyState({ icon, title, text, action, onClick }) {
  return (
    <div className="ml-empty">
      <span className="ml-empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button className="ml-primary-button" onClick={onClick}>
          {action} →
        </button>
      )}
    </div>
  );
}

function TopicList({ topics }) {
  if (!topics.length) {
    return (
      <EmptyState
        icon="✧"
        title="No topics to show yet"
        text="Your recorded topics will appear here."
      />
    );
  }

  return (
    <div className="ml-topic-list">
      {topics.map((topic, index) => {
        const progress = getTopicProgress(topic);

        return (
          <article className="ml-topic-row" key={topic.id || index}>
            <span className="ml-topic-icon">✧</span>
            <div className="ml-topic-info">
              <div className="ml-topic-title-line">
                <strong>{topic.title || "Untitled topic"}</strong>
                <span
                  className={
                    topic.status === "completed"
                      ? "ml-status completed"
                      : "ml-status"
                  }
                >
                  {topic.status === "completed"
                    ? "Completed"
                    : "In progress"}
                </span>
              </div>
              <p>
                {topic.subject || "General"} · Last studied{" "}
                {formatDate(topic.lastStudied || topic.date)}
              </p>
              <div className="ml-progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <strong className="ml-topic-percent">{progress}%</strong>
          </article>
        );
      })}
    </div>
  );
}

function ActivityList({ activities }) {
  return (
    <div className="ml-activity-list">
      {activities.map((activity, index) => (
        <article
          className="ml-activity-row"
          key={activity.id || index}
        >
          <span className="ml-activity-icon">
            {activity.icon || "✧"}
          </span>
          <div>
            <strong>
              {activity.title || activity.type || "Learning activity"}
            </strong>
            <p>
              {activity.subject || "TechBook"} ·{" "}
              {formatDate(activity.date)}
              {Number(activity.minutes) > 0
                ? ` · ${activity.minutes} min`
                : ""}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
