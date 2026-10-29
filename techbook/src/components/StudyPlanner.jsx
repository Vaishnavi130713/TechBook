
import { useState } from "react";

const initialTasks = [
  {
    id: 1,
    title: "Revise important concepts",
    subject: "Mathematics",
    time: "9:00 AM",
    duration: 45,
    completed: false,
  },
  {
    id: 2,
    title: "Review lecture notes",
    subject: "Artificial Intelligence",
    time: "11:00 AM",
    duration: 30,
    completed: false,
  },
  {
    id: 3,
    title: "Practice coding problems",
    subject: "Data Structures",
    time: "4:00 PM",
    duration: 60,
    completed: false,
  },
];

const initialExams = [
  {
    id: 1,
    subject: "Mathematics",
    title: "Mathematics examination",
    date: "2026-11-05",
  },
  {
    id: 2,
    subject: "Artificial Intelligence",
    title: "AI/ML examination",
    date: "2026-11-12",
  },
];

function getDaysLeft(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const examDate = new Date(`${date}T00:00:00`);
  return Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
}

export default function StudyPlanner() {
  const [tasks, setTasks] = useState(initialTasks);
  const [exams] = useState(initialExams);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    duration: 30,
  });

  const completedTasks = tasks.filter((task) => task.completed).length;

  const totalMinutes = tasks
    .filter((task) => task.completed)
    .reduce((total, task) => total + task.duration, 0);

  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  function toggleTask(id) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function addTask(event) {
    event.preventDefault();

    if (!newTask.title.trim() || !newTask.subject.trim()) {
      return;
    }

    setTasks((currentTasks) => [
      ...currentTasks,
      {
        id: Date.now(),
        title: newTask.title.trim(),
        subject: newTask.subject.trim(),
        time: "Flexible",
        duration: Math.max(5, Number(newTask.duration) || 30),
        completed: false,
      },
    ]);

    setNewTask({ title: "", subject: "", duration: 30 });
    setShowAddTask(false);
  }

  function askAssistant(prompt = question) {
    const text = prompt.trim();
    if (!text) return;

    const normalized = text.toLowerCase();
    let answer;

    if (
      normalized.includes("missed") ||
      normalized.includes("yesterday") ||
      normalized.includes("behind")
    ) {
      answer =
        "Start by reviewing your unfinished tasks. Focus on the most urgent subject first, then distribute the remaining work across your available study sessions. Keep your exam deadline fixed and avoid overloading a single day.";
    } else if (
      normalized.includes("exam") ||
      normalized.includes("prioriti") ||
      normalized.includes("three days") ||
      normalized.includes("3 days")
    ) {
      answer =
        "Prioritize topics that are important for the exam, review your weaker areas, and practise questions. Reserve time for a final revision. Add your actual exam dates and syllabus to get a more relevant plan.";
    } else if (
      normalized.includes("today") ||
      normalized.includes("study")
    ) {
      const pending = tasks.filter((task) => !task.completed);

      answer = pending.length
        ? `You have ${pending.length} pending tasks. Start with ${pending[0].subject}: "${pending[0].title}" (${pending[0].duration} minutes). Then continue with the remaining tasks according to your available time.`
        : "You have no pending tasks in this plan. You can add a new task or revise a topic you find difficult.";
    } else if (
      normalized.includes("progress") ||
      normalized.includes("track")
    ) {
      answer =
        `You have completed ${completedTasks} of ${tasks.length} tasks (${progress}%). ` +
        (progress === 100
          ? "All tasks in this plan are complete. Great work!"
          : "Keep going with your next pending task.");
    } else {
      answer =
        "I can help you review today's tasks, think through missed sessions, prioritize an upcoming exam, or check your current task progress. This is a prototype assistant; personalized AI planning will be connected later.";
    }

    setMessages((current) => [
      ...current,
      { id: Date.now(), question: text, answer },
    ]);
    setQuestion("");
  }

  return (
    <div className="sp-page">
      <header className="sp-header">
        <div>
          <a href="#home" className="sp-back">
            ← Back to dashboard
          </a>

          <p className="sp-eyebrow">YOUR PERSONAL STUDY SPACE</p>
          <h1>
            Study Planner<span>.</span>
          </h1>
          <p className="sp-subtitle">
            Plan your time, track your progress, and stay ready
            for every exam.
          </p>
        </div>

        <div className="sp-header-art" aria-hidden="true">
          <span>✦</span>
          <strong>Plan</strong>
          <strong>Progress</strong>
        </div>
      </header>

      <div className="sp-demo-notice">
        <span>ⓘ</span>
        Prototype mode: changes currently stay in this page's
        temporary state. AWS storage and live Exam Sprint integration
        will come later.
      </div>

      <section className="sp-stats">
        <article className="sp-stat-card">
          <span className="sp-stat-icon sp-lilac">◷</span>
          <p>Study time completed</p>
          <strong>
            {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
          </strong>
          <small>From completed tasks in this demo</small>
        </article>

        <article className="sp-stat-card">
          <span className="sp-stat-icon sp-peach">✓</span>
          <p>Tasks completed</p>
          <strong>
            {completedTasks}/{tasks.length}
          </strong>
          <small>{progress}% of planned tasks</small>
        </article>

        <article className="sp-stat-card">
          <span className="sp-stat-icon sp-mint">↗</span>
          <p>Plan progress</p>
          <strong>{progress}%</strong>
          <div className="sp-progress-track">
            <span style={{ width: `${progress}%` }} />
          </div>
        </article>

        <article className="sp-stat-card">
          <span className="sp-stat-icon sp-pink">◷</span>
          <p>Upcoming exams</p>
          <strong>
            {
              exams.filter(
                (exam) => getDaysLeft(exam.date) >= 0
              ).length
            }
          </strong>
          <small>Sample deadlines</small>
        </article>
      </section>

      <div className="sp-main-grid">
        <section className="sp-panel sp-tasks-panel">
          <div className="sp-panel-heading">
            <div>
              <p className="sp-eyebrow">YOUR SCHEDULE</p>
              <h2>Today's study plan</h2>
              <p className="sp-muted">
                Check off each task as you finish it.
              </p>
            </div>

            <button
              className="sp-primary-button"
              onClick={() => setShowAddTask(!showAddTask)}
            >
              {showAddTask ? "Cancel" : "+ Add task"}
            </button>
          </div>

          {showAddTask && (
            <form className="sp-add-form" onSubmit={addTask}>
              <label>
                Task name
                <input
                  value={newTask.title}
                  onChange={(event) =>
                    setNewTask({
                      ...newTask,
                      title: event.target.value,
                    })
                  }
                  placeholder="e.g. Revise linked lists"
                  required
                />
              </label>

              <label>
                Subject
                <input
                  value={newTask.subject}
                  onChange={(event) =>
                    setNewTask({
                      ...newTask,
                      subject: event.target.value,
                    })
                  }
                  placeholder="e.g. Data Structures"
                  required
                />
              </label>

              <label>
                Duration in minutes
                <input
                  type="number"
                  min="5"
                  value={newTask.duration}
                  onChange={(event) =>
                    setNewTask({
                      ...newTask,
                      duration: event.target.value,
                    })
                  }
                  required
                />
              </label>

              <button className="sp-primary-button" type="submit">
                Add to plan
              </button>
            </form>
          )}

          <div className="sp-task-list">
            {tasks.map((task) => (
              <article
                className={`sp-task ${
                  task.completed ? "sp-task-done" : ""
                }`}
                key={task.id}
              >
                <button
                  className={`sp-task-check ${
                    task.completed ? "checked" : ""
                  }`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={
                    task.completed
                      ? "Mark task pending"
                      : "Mark task complete"
                  }
                >
                  {task.completed ? "✓" : ""}
                </button>

                <div className="sp-task-content">
                  <strong>{task.title}</strong>
                  <p>{task.subject}</p>
                  <small>
                    ◷ {task.time} · {task.duration} min
                  </small>
                </div>

                <span
                  className={`sp-task-status ${
                    task.completed ? "done" : ""
                  }`}
                >
                  {task.completed ? "Completed" : "Pending"}
                </span>
              </article>
            ))}

            {tasks.length === 0 && (
              <div className="sp-empty">
                <span>✧</span>
                <h3>Your plan starts here</h3>
                <p>Add a task to organize your study day.</p>
              </div>
            )}
          </div>
        </section>

        <section className="sp-panel">
          <div className="sp-panel-heading">
            <div>
              <p className="sp-eyebrow">STAY PREPARED</p>
              <h2>Upcoming deadlines</h2>
            </div>
            <span className="sp-heading-icon">♧</span>
          </div>

          <div className="sp-exam-list">
            {exams.map((exam) => {
              const days = getDaysLeft(exam.date);

              return (
                <article className="sp-exam" key={exam.id}>
                  <div className="sp-exam-date">
                    <strong>
                      {new Date(
                        `${exam.date}T00:00:00`
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                      })}
                    </strong>
                    <span>
                      {new Date(
                        `${exam.date}T00:00:00`
                      ).toLocaleDateString("en-IN", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className="sp-exam-info">
                    <strong>{exam.title}</strong>
                    <p>{exam.subject}</p>
                    <small>
                      {days < 0
                        ? "Date has passed"
                        : days === 0
                          ? "Today"
                          : `${days} days remaining`}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="sp-footnote">
            Sample exams only. These will be replaced with your
            actual Exam Sprint deadlines.
          </p>
        </section>

        <section className="sp-panel">
          <div className="sp-panel-heading">
            <div>
              <p className="sp-eyebrow">YOUR CONSISTENCY</p>
              <h2>Weekly overview</h2>
            </div>
            <span className="sp-heading-icon">▥</span>
          </div>

          <div className="sp-week-chart">
            {[
              { day: "Mon", height: 35 },
              { day: "Tue", height: 60 },
              { day: "Wed", height: 45 },
              { day: "Thu", height: 75 },
              { day: "Fri", height: 50 },
              { day: "Sat", height: 25 },
              { day: "Sun", height: 15 },
            ].map((item) => (
              <div className="sp-chart-day" key={item.day}>
                <div className="sp-chart-bar-area">
                  <span
                    className="sp-chart-bar"
                    style={{ height: `${item.height}%` }}
                  />
                </div>
                <small>{item.day}</small>
              </div>
            ))}
          </div>

          <p className="sp-footnote">
            Illustrative chart. Real study hours and productivity
            reports will use recorded sessions.
          </p>
        </section>

        <section className="sp-panel sp-assistant-panel">
          <div className="sp-assistant-heading">
            <span className="sp-assistant-avatar">✦</span>
            <div>
              <p className="sp-eyebrow">YOUR STUDY COMPANION</p>
              <h2>AI Study Assistant</h2>
              <p className="sp-muted">
                Let's figure out your next step.
              </p>
            </div>
          </div>

          <div className="sp-suggestions">
            {[
              "What should I study today?",
              "I missed yesterday's plan. What now?",
              "How is my progress?",
              "I have an exam in three days. What should I prioritize?",
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => askAssistant(prompt)}
              >
                {prompt} <span>↗</span>
              </button>
            ))}
          </div>

          <div className="sp-chat-messages">
            {messages.map((message) => (
              <div className="sp-chat-message" key={message.id}>
                <div className="sp-user-message">
                  {message.question}
                </div>
                <div className="sp-ai-message">
                  <span>✦</span>
                  <p>{message.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <form
            className="sp-chat-input"
            onSubmit={(event) => {
              event.preventDefault();
              askAssistant();
            }}
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask about your study plan..."
              aria-label="Ask the study assistant"
            />
            <button type="submit" aria-label="Send message">
              ↑
            </button>
          </form>

          <p className="sp-footnote">
            Prototype responses only. AI-powered planning will be
            connected through AWS later.
          </p>
        </section>
      </div>

      <footer className="sp-footer">
        <span>TechBook · Your learning, your way.</span>
        <span>Small steps make progress ♡</span>
      </footer>
    </div>
  );
}

