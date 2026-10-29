
import "./App.css";
import "./index.css";
import { useState, useEffect } from "react";

import NoteCraft from "./components/NoteCraft";
import LectureLens from "./components/LectureLens";
import ClearMind from "./components/ClearMind";
import ExamSprint from "./components/ExamSprint";
import ReMind from "./components/ReMind";
import ConceptMap from "./components/ConceptMap";
import KnowIt from "./components/KnowIt";
import MyLearning from "./components/MyLearning";
import StudyPlanner from "./components/StudyPlanner";

const features = [
  {
    icon: "▶",
    name: "LectureLens",
    slug: "lecture-lens",
    description: "Turn YouTube lectures into summaries and notes.",
    color: "lavender",
  },
  {
    icon: "✎",
    name: "Note Craft",
    slug: "note-craft",
    description: "Create revision notes, flashcards and quizzes.",
    color: "peach",
  },
  {
    icon: "✧",
    name: "Clear Mind",
    slug: "clear-mind",
    description: "Understand difficult concepts your way.",
    color: "blue",
  },
  {
    icon: "◷",
    name: "Exam Sprint",
    slug: "exam-sprint",
    description: "Build a study plan around your exam dates.",
    color: "green",
  },
  {
    icon: "↻",
    name: "ReMind",
    slug: "re-mind",
    description: "Review topics before you forget them.",
    color: "pink",
  },
  {
    icon: "⌘",
    name: "Concept Map",
    slug: "concept-map",
    description: "Connect ideas and see the bigger picture.",
    color: "yellow",
  },
  {
    icon: "✦",
    name: "Know It",
    slug: "know-it",
    description: "Explain what you learned and find knowledge gaps.",
    color: "lavender",
  },
];

function App() {
  const getCurrentPage = () => {
    const hash = window.location.hash;

    if (hash === "#note-craft") return "note-craft";
    if (hash === "#lecture-lens") return "lecture-lens";
    if (hash === "#clear-mind") return "clear-mind";
    if (hash === "#exam-sprint") return "exam-sprint";
    if (hash === "#re-mind") return "re-mind";
    if (hash === "#concept-map") return "concept-map";
    if (hash === "#know-it") return "know-it";
    if (hash === "#my-learning") return "my-learning";
    if (hash === "#study-planner") return "study-planner";

    return "dashboard";
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPage);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPage(getCurrentPage());
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  if (currentPage === "note-craft") {
    return <NoteCraft />;
  }

  if (currentPage === "lecture-lens") {
    return <LectureLens />;
  }

  if (currentPage === "clear-mind") {
    return <ClearMind />;
  }

  if (currentPage === "exam-sprint") {
    return <ExamSprint />;
  }

  if (currentPage === "re-mind") {
    return <ReMind />;
  }

  if (currentPage === "concept-map") {
    return <ConceptMap />;
  }

  if (currentPage === "know-it") {
    return <KnowIt />;
  }

  if (currentPage === "my-learning") {
    return <MyLearning />;
  }

  if (currentPage === "study-planner") {
  return <StudyPlanner />;
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#">
          <span className="brand-icon">T</span>
          <span>TechBook</span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <nav className="navigation">
          <a
            className={`nav-item ${
              currentPage === "dashboard" ? "active" : ""
            }`}
            href="#home"
          >
            ⌂ <span>Dashboard</span>
          </a>

          <a
            className={`nav-item ${
              currentPage === "my-learning" ? "active" : ""
            }`}
            href="#my-learning"
          >
            ✧ <span>My learning</span>
          </a>

          <a
            className={`nav-item ${
              currentPage === "my-notes" ? "active" : ""
            }`}
            href="#my-notes"
          >
            ▤ <span>My notes</span>
          </a>

          <a
            className={`nav-item ${
              currentPage === "study-planner" ? "active" : ""
            }`}
            href="#study-planner"
          >
            ◷ <span>Study planner</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>

          <div>
            <strong>Student</strong>
            <p>Your learning space</p>
          </div>
        </div>
      </aside>

      <main className="main-content" id="home">
        <header className="topbar">
          <span className="breadcrumb">Workspace / Dashboard</span>
          <button
            className="profile-button"
            aria-label="Student profile"
          >
            S
          </button>
        </header>

        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="eyebrow">
              YOUR PERSONAL LEARNING SPACE
            </span>

            <h1>
              Make learning
              <br />
              feel like <span>you.</span>
            </h1>

            <p>
              Understand more, study smarter, and make every
              learning session count. Your journey starts here.
            </p>

            <a className="primary-button" href="#features">
              Explore your tools <span>→</span>
            </a>
          </div>

          <div className="welcome-art" aria-hidden="true">
            <div className="art-orbit orbit-one"></div>
            <div className="art-orbit orbit-two"></div>
            <div className="art-book">✦</div>

            <span className="float-note note-one">
              Learn at your pace
            </span>

            <span className="float-note note-two">
              One step at a time ♡
            </span>
          </div>
        </section>

        <section className="features-section" id="features">
          <div className="section-heading">
            <div>
              <span className="eyebrow">YOUR TOOLKIT</span>
              <h2>What would you like to learn?</h2>
              <p>
                Choose a tool to get started with your studies.
              </p>
            </div>

            <span className="tool-count">7 learning tools</span>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <button
                className="feature-card"
                key={feature.name}
                onClick={() => {
                  if (
                    [
                      "note-craft",
                      "lecture-lens",
                      "clear-mind",
                      "exam-sprint",
                      "re-mind",
                      "concept-map",
                      "know-it",
                    ].includes(feature.slug)
                  ) {
                    window.location.hash = feature.slug;
                  } else {
                    alert(`${feature.name} is coming soon`);
                  }
                }}
              >
                <span
                  className={`feature-icon ${feature.color}`}
                >
                  {feature.icon}
                </span>

                <span className="feature-name">
                  {feature.name}
                </span>

                <span className="feature-description">
                  {feature.description}
                </span>

                <span className="feature-arrow">↗</span>
              </button>
            ))}
          </div>
        </section>

        <footer className="footer">
          <span>TechBook · Your learning, your way.</span>
          <span>Built for curious minds ♡</span>
        </footer>
      </main>
    </div>
  );
}

export default App;
