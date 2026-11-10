import { useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  recordTopic,
  recordActivity,
} from "../utils/learningHistory";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

// Converts AI-generated Markdown into formatted HTML.
function markdownToHtml(markdown) {
  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const formatInline = (value) =>
    escapeHtml(value)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const lines = String(markdown || "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const output = [];
  let paragraph = [];
  let list = null;
  let nextOrderedNumber = 1;
  let codeBlock = false;
  let codeLines = [];
  let index = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
      paragraph = [];
    }
  };

  const closeList = () => {
    if (list) {
      output.push(`</${list}>`);
      list = null;
    }
  };

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    // Code blocks
    if (trimmed.startsWith("```")) {
      flushParagraph();
      closeList();

      if (codeBlock) {
        output.push(
          `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
        );
        codeLines = [];
        codeBlock = false;
      } else {
        codeBlock = true;
      }

      index++;
      continue;
    }

    if (codeBlock) {
      codeLines.push(line);
      index++;
      continue;
    }

    // Tables
    if (
      trimmed.includes("|") &&
      index + 1 < lines.length &&
      /^\s*\|?\s*:?-{3,}/.test(lines[index + 1])
    ) {
      flushParagraph();
      closeList();

      const splitCells = (row) =>
        row
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((cell) => cell.trim());

      const headers = splitCells(trimmed);

      output.push(
        '<div class="ll-table-wrap"><table><thead><tr>'
      );

      output.push(
        headers
          .map((cell) => `<th>${formatInline(cell)}</th>`)
          .join("")
      );

      output.push("</tr></thead><tbody>");

      index += 2;

      while (
        index < lines.length &&
        lines[index].trim().includes("|")
      ) {
        const cells = splitCells(lines[index]);

        output.push(
          "<tr>" +
            cells
              .map((cell) => `<td>${formatInline(cell)}</td>`)
              .join("") +
            "</tr>"
        );

        index++;
      }

      output.push("</tbody></table></div>");
      continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      flushParagraph();
      closeList();
      nextOrderedNumber = 1;

      const level = heading[1].length;

      output.push(
        `<h${level}>${formatInline(heading[2])}</h${level}>`
      );

      index++;
      continue;
    }

    // Horizontal separators
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      closeList();
      output.push("<hr />");
      index++;
      continue;
    }

    // Lists
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+[.)]\s+(.+)$/);
    
    if (unordered || ordered) {
      flushParagraph();
      
      const nextList = unordered ? "ul" : "ol";
      
      if (list !== nextList) {
        closeList();
        
        if (nextList === "ol") {
          const startAttribute =
            nextOrderedNumber > 1
              ? ` start="${nextOrderedNumber}"`
              : "";

          output.push(`<ol${startAttribute}>`);
        } else {
          output.push("<ul>");
      }

      list = nextList;
    }
    
    output.push(
      `<li>${formatInline((unordered || ordered)[1])}</li>`
    );
    
    if (ordered) {
      nextOrderedNumber++;
    }
    
    index++;
    continue;
 }

    // Empty lines
    if (!trimmed) {
      flushParagraph();
      index++;
      continue;
    }

    closeList();
    paragraph.push(trimmed);
    index++;
  }

  if (codeBlock) {
    output.push(
      `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`
    );
  }

  flushParagraph();
  closeList();

  return output.join("\n");
}

function MarkdownContent({ content }) {
  const formattedContent = markdownToHtml(content);

  return (
    <div
      className="ll-markdown"
      dangerouslySetInnerHTML={{ __html: formattedContent }}
    />
  );
}

function LectureLens() {
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [lecture, setLecture] = useState(null);
  const [selectedOutput, setSelectedOutput] = useState("summary");

  const auth = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLecture(null);
    setGeneratedContent("");

    const trimmedUrl = videoUrl.trim();

    if (!trimmedUrl) {
      setError("Paste a YouTube lecture link to get started.");
      return;
    }

    if (!API_BASE_URL) {
      setError("API URL is missing. Check your .env file.");
      return;
    }

    const accessToken = auth.user?.access_token;

    if (!accessToken) {
      setError("Your session has expired. Please sign in again.");
      return;
    }

    let videoId = "";

    try {
      const url = new URL(trimmedUrl);

      const hostname = url.hostname
        .toLowerCase()
        .replace(/^www\./, "");

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
    } catch {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    setIsLoading(true);

    try {
      // STEP 1: FETCH YOUTUBE TRANSCRIPT

      const transcriptResponse = await fetch(
        `${API_BASE_URL}/lecture/transcript`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            youtubeUrl: trimmedUrl,
            language: "en",
          }),
        }
      );

      const transcriptResult = await transcriptResponse.json();

      if (!transcriptResponse.ok || !transcriptResult.success) {
        throw new Error(
          transcriptResult.error ||
            "Unable to extract the lecture transcript."
        );
      }

      const transcriptData = transcriptResult.data;

      const lectureTitle =
        transcriptData.title || `YouTube Lecture (${videoId})`;

      // STEP 2: GENERATE CONTENT USING AMAZON NOVA

      const aiResponse = await fetch(
        `${API_BASE_URL}/ai/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            outputType: selectedOutput,
            title: lectureTitle,
            transcript: transcriptData.transcript,
            segments: transcriptData.segments || [],
          }),
        }
      );

      const aiResult = await aiResponse.json();

      if (!aiResponse.ok || !aiResult.success) {
        throw new Error(
          aiResult.error || "AI content generation failed."
        );
      }

      const generated = aiResult.data.content;

      if (!generated) {
        throw new Error("The AI returned empty study material.");
      }

      // STEP 3: SAVE LEARNING ACTIVITY

      const selectedOption = outputOptions.find(
        (option) => option.id === selectedOutput
      );

      recordTopic({
        title: lectureTitle,
        subject: "General",
        feature: "LectureLens",
        progress: 0,
        status: "in-progress",
      });

      recordActivity({
        title: `${selectedOption?.title || "Lecture Workspace"} — ${lectureTitle}`,
        type: "AI study material generated",
        subject: "General",
        feature: "LectureLens",
        minutes: 0,
        icon: "▶",
        details: `Generated: ${
          selectedOption?.title || "Smart Lecture Summary"
        }`,
      });

      // STEP 4: DISPLAY THE RESULT

      setGeneratedContent(generated);

      setLecture({
        videoId,
        title: lectureTitle,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        output: selectedOutput,
        transcript: transcriptData.transcript,
        segments: transcriptData.segments || [],
        language: transcriptData.language || "en",
      });
    } catch (error) {
      console.error("LectureLens generation error:", error);

      setError(
        error.message ||
          "Something went wrong while preparing your study material."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function goBack() {
    window.location.hash = "features";
  }

  return (
    <main className="ll-page">
      <header className="ll-topbar">
        <button
          className="ll-back-button"
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
            disabled={isLoading}
          >
            {isLoading
              ? "Generating your study material..."
              : "Prepare my lecture"}

            {!isLoading && <span>✦</span>}
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
            Your lecture transcript is ready! Your study material
            has been generated successfully.
          </p>

          <div className="ll-generated-content">
            <h3>
              {outputOptions.find(
                (option) => option.id === lecture.output
              )?.title}
            </h3>

            <MarkdownContent content={generatedContent} />
          </div>

          <details className="ll-transcript">
            <summary>View extracted transcript</summary>

            <p>
              <strong>{lecture.title}</strong>
            </p>

            <p>{lecture.transcript}</p>
          </details>

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