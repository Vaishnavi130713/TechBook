
import { useState } from "react";

const outputOptions = [
  {
    id: "summary",
    icon: "✦",
    color: "lilac",
    title: "Smart Lecture Summary",
    subtitle: "Understand the lecture quickly",
    details: [
      "Short summary in 5–10 bullet points",
      "Detailed chapter-wise summary",
      "Main concepts and key takeaways",
      "Important definitions and explanations",
      "Timestamps for important topics, when available",
    ],
  },
  {
    id: "notes",
    icon: "📝",
    color: "peach",
    title: "AI Generated Notes",
    subtitle: "Ready-to-study learning material",
    details: [
      "Short revision notes and detailed notes",
      "Simple language and exam-oriented notes",
      "Definitions, formulas and examples",
      "Tables, flowcharts and comparison charts",
      "Important questions with answers",
    ],
  },
  {
    id: "quiz",
    icon: "✓",
    color: "mint",
    title: "Quiz & Practice",
    subtitle: "Test what you learned",
    details: [
      "Multiple-choice questions (MCQs)",
      "True or false and fill-in-the-blanks",
      "Short-answer and long-answer questions",
      "Coding questions, if relevant",
      "Answer key with explanations",
    ],
  },
];

function LectureLens() {
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [lecture, setLecture] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState("summary");

  function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLecture(null);

    const trimmedUrl = videoUrl.trim();

    if (!trimmedUrl) {
      setError("Paste a YouTube lecture link to get started.");
      return;
    }

    try {
      const url = new URL(trimmedUrl);
      const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
      let videoId = "";

      if (hostname === "youtu.be") {
        videoId = url.pathname.split("/").filter(Boolean)[0] || "";
      } else if (
        hostname === "youtube.com" ||
        hostname === "m.youtube.com" ||
        hostname === "youtube-nocookie.com"
      ) {
        if (url.pathname === "/watch") {
          videoId = url.searchParams.get("v") || "";
        } else {
          const parts = url.pathname.split("/").filter(Boolean);

          if (["embed", "shorts", "live"].includes(parts[0])) {
            videoId = parts[1] || "";
          }
        }
      }

      if (!/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        setError(
          "That doesn't look like a valid YouTube video link. Please check it and try again."
        );
        return;
      }

      setLecture({
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        output: selectedOutput,
      });
    } catch {
      setError("Please enter a valid YouTube URL.");
    }
  }

  function goBack() {
    window.location.hash = "features";
  }

  return (
    <main className="ll-page">
      <header className="ll-topbar">
        <button
          className="ll-back"
          type="button"
          onClick={goBack}
        >
          ← Dashboard
        </button>

        <span className="ll-topbar-label">
          YOUR LECTURE WORKSPACE
        </span>

        <div className="ll-avatar">T</div>
      </header>

      <section className="ll-hero">
        <div>
          <span className="ll-eyebrow">
            ✦ LEARN SMARTER WITH LECTURELENS
          </span>

          <h1>
            Every lecture,
            <br />
            <span>made clearer.</span>
          </h1>

          <p>
            Turn long lectures into organized learning material.
            Start with a YouTube link and build your understanding.
          </p>

          <div className="ll-benefits">
            <span>✦ Easier revision</span>
            <span>◎ Key ideas</span>
            <span>↗ Learn at your pace</span>
          </div>
        </div>

        <div className="ll-hero-art" aria-hidden="true">
          <div className="ll-video-illustration">
            <span>▶</span>
          </div>

          <div className="ll-floating-note">
            ✎ Lecture notes
          </div>

          <div className="ll-floating-play">
            ✦ Learn more
          </div>
        </div>
      </section>

      <section className="ll-workspace">
        <form
          className="ll-form-card"
          onSubmit={handleSubmit}
        >
          <div className="ll-heading-icon">▶</div>

          <h2>Add your lecture</h2>

          <p>
            Paste the link to a YouTube lecture you'd like to study.
          </p>

          <label htmlFor="ll-url">
            YouTube video link
          </label>

          <input
            id="ll-url"
            type="url"
            value={videoUrl}
            onChange={(event) => setVideoUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            autoComplete="url"
          />

          {error && (
            <p className="ll-error" role="alert">
              {error}
            </p>
          )}

          <button
            className="ll-submit"
            type="submit"
          >
            Prepare my lecture <span>✦</span>
          </button>

          <p className="ll-footnote">
            Your lecture workspace starts here.
          </p>
        </form>

        <aside className="ll-info-card ll-output-card">
          <span className="ll-eyebrow">
            CHOOSE YOUR LEARNING TOOL
          </span>

          <h3>What would you like to create?</h3>

          <p className="ll-output-intro">
            Turn your lecture into learning material that works for you.
          </p>

          <div className="ll-output-grid">
            <button
              type="button"
              className={`ll-output-option summary-option ${
                selectedOutput === "summary" ? "selected" : ""
              }`}
              onClick={() => setSelectedOutput("summary")}
              aria-pressed={selectedOutput === "summary"}
            >
              <span className="ll-option-icon">✦</span>

              <strong>Smart Lecture Summary</strong>

              <span>Understand lectures in minutes</span>

              <span className="ll-option-action">
                {selectedOutput === "summary"
                  ? "✓ Selected"
                  : "Select →"}
              </span>
            </button>

            <button
              type="button"
              className={`ll-output-option notes-option ${
                selectedOutput === "notes" ? "selected" : ""
              }`}
              onClick={() => setSelectedOutput("notes")}
              aria-pressed={selectedOutput === "notes"}
            >
              <span className="ll-option-icon">✎</span>

              <strong>AI Generated Notes</strong>

              <span>Create personalized study notes</span>

              <span className="ll-option-action">
                {selectedOutput === "notes"
                  ? "✓ Selected"
                  : "Select →"}
              </span>
            </button>

            <button
              type="button"
              className={`ll-output-option quiz-option ${
                selectedOutput === "quiz" ? "selected" : ""
              }`}
              onClick={() => setSelectedOutput("quiz")}
              aria-pressed={selectedOutput === "quiz"}
            >
              <span className="ll-option-icon">✓</span>

              <strong>Quiz &amp; Practice</strong>

              <span>
                Test knowledge and improve understanding
              </span>

              <span className="ll-option-action">
                {selectedOutput === "quiz"
                  ? "✓ Selected"
                  : "Select →"}
              </span>
            </button>
          </div>

          <p className="ll-output-footnote">
            ✦ Select an option, then prepare your lecture.
          </p>
        </aside>
      </section>

      {lecture && (
        <section className="ll-result" aria-live="polite">
          <span className="ll-eyebrow">YOUR LECTURE</span>

          <h2>Your lecture workspace is ready ✨</h2>

          <p>
            Selected output:{" "}
            <strong>
              {
                outputOptions.find(
                  (option) => option.id === lecture.output
                )?.title
              }
            </strong>
          </p>

          <div className="ll-video-frame">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${lecture.videoId}`}
              title="YouTube lecture preview"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </div>

          <p className="ll-status">
            Your link is valid and your output preference is saved
            for this session. Transcript extraction and AI content
            generation have not been connected yet.
          </p>

          <a
            className="ll-open-link"
            href={lecture.url}
            target="_blank"
            rel="noreferrer"
          >
            Open original video ↗
          </a>
        </section>
      )}
    </main>
  );
}

export default LectureLens;
