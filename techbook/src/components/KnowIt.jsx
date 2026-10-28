
import { useEffect, useRef, useState } from "react";

const initialMessage = {
  role: "assistant",
  type: "intro",
  content:
    "Hey! I'm here to help you discover how well you understand what you've learned. Tell me about something you've been studying, in your own words. It doesn't have to be perfect — we'll work through your thinking together.",
};

function evaluateExplanation(text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();

  const hasExample =
    /for example|e\.g\.|such as|imagine|suppose|like when|example/i.test(text);
  const hasReasoning =
    /because|therefore|so that|which means|this means|as a result|since/i.test(text);
  const hasSequence =
    /first|then|next|finally|after that|step|process/i.test(text);

  const signals = [
    {
      name: "Core explanation",
      present: words.length >= 15,
      detail:
        words.length >= 15
          ? "You've shared enough detail to begin understanding your thinking."
          : "Try explaining the main idea in a little more detail.",
    },
    {
      name: "Reasoning",
      present: hasReasoning,
      detail: hasReasoning
        ? "You attempted to explain why something happens."
        : "Explain why your statement is true, not just what happens.",
    },
    {
      name: "Example",
      present: hasExample,
      detail: hasExample
        ? "You connected your explanation to an example."
        : "A concrete example could help demonstrate your understanding.",
    },
    {
      name: "Step-by-step logic",
      present: hasSequence,
      detail: hasSequence
        ? "You showed some order or progression in your explanation."
        : "Try explaining the steps in the process in the order they happen.",
    },
  ];

  const strengths = signals.filter((item) => item.present);
  const gaps = signals.filter((item) => !item.present);

  let response = "";

  if (words.length < 8) {
    response =
      "Thanks for starting! I need a little more of your thinking to review your understanding. Can you explain what the concept means and how it works, in your own words?";
  } else {
    response = `Here's what I can tell from your explanation:\n\n**What looks promising**\n${
      strengths.length
        ? strengths.map((item) => `• ${item.name}: ${item.detail}`).join("\n")
        : "• You've made a start by putting the idea into your own words."
    }\n\n**What to strengthen**\n${
      gaps.length
        ? gaps.map((item) => `• ${item.name}: ${item.detail}`).join("\n")
        : "• Your explanation includes several useful learning signals. Let's test how deeply you understand the idea."
    }\n\nThese are preliminary writing signals, not a judgment of whether your explanation is factually correct. Let's explore your reasoning further.`;
  }

  let followUp =
    "What is the most important reason behind the idea you just explained?";

  if (!hasReasoning) {
    followUp =
      "Why does the concept work that way? Can you explain the reason behind it?";
  } else if (!hasExample) {
    followUp =
      "Can you give me a real example that demonstrates what you just explained?";
  } else if (!hasSequence) {
    followUp =
      "Can you walk me through what happens first, next, and last?";
  } else {
    followUp =
      "What would happen if one important part of this process changed? Explain why.";
  }

  return {
    response,
    followUp,
    signals,
    words: words.length,
  };
}

function MessageText({ content }) {
  return (
    <div className="ki-message-text">
      {content.split("\n").map((line, index) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);

        return (
          <p key={index}>
            {parts.map((part, partIndex) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={partIndex}>{part.slice(2, -2)}</strong>
              ) : (
                <span key={partIndex}>{part}</span>
              )
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function KnowIt() {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [turnCount, setTurnCount] = useState(0);
  const [review, setReview] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      }
    };
  }, []);

  function addMessage(message) {
    setMessages((previous) => [...previous, message]);
  }

  function startListening() {
    setSpeechError("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        "Speech input isn't supported in this browser. Try Chrome or type your explanation instead."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      setInput(transcript);
    };

    recognition.onerror = () => {
      setSpeechError(
        "I couldn't capture your speech. Please try again or type your explanation."
      );
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }

  function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();
    if (!text || isTyping) return;

    addMessage({ role: "user", content: text });
    setInput("");
    setSpeechError("");
    setIsTyping(true);

    // Local prototype evaluation. AWS Bedrock will replace this
    // heuristic with context-aware evaluation and adaptive follow-ups.
    const result = evaluateExplanation(text);

    setTimeout(() => {
      addMessage({
        role: "assistant",
        content: result.response,
      });

      addMessage({
        role: "assistant",
        type: "followup",
        content: result.followUp,
      });

      setReview(result);
      setTurnCount((count) => count + 1);
      setIsTyping(false);
    }, 500);
  }

  function startFreshConversation() {
    setMessages([initialMessage]);
    setInput("");
    setTurnCount(0);
    setReview(null);
    setShowProgress(false);
    setSpeechError("");
  }

  return (
    <main className="ki-page">
      <header className="ki-topbar">
        <a className="ki-back" href="#home">
          <span>←</span> Dashboard
        </a>

        <div className="ki-brand">
          <span className="ki-brand-icon">K</span>
          <span>TechBook <i>/</i> Know It</span>
        </div>

        <button
          type="button"
          className="ki-new-chat"
          onClick={startFreshConversation}
        >
          + New conversation
        </button>
      </header>

      <section className="ki-heading">
        <div className="ki-heading-copy">
          <span className="ki-eyebrow">THINK IT THROUGH</span>
          <h1>Show me how <span>you understand.</span></h1>
          <p>
            Explain what you've learned. I'll help you uncover
            what's clear, what needs work, and what to think about next.
          </p>
        </div>

        <div className="ki-heading-art" aria-hidden="true">
          <div className="ki-art-orbit ki-orbit-one" />
          <div className="ki-art-orbit ki-orbit-two" />
          <span>✦</span>
          <small>Think · Explain · Grow</small>
        </div>
      </section>

      <section className="ki-workspace">
        <div className="ki-chat-card">
          <div className="ki-chat-header">
            <div className="ki-avatar">K</div>

            <div className="ki-chat-heading">
              <strong>Your learning conversation</strong>
              <span><i /> Ready to listen</span>
            </div>

            <button
              type="button"
              className="ki-progress-toggle"
              onClick={() => setShowProgress((value) => !value)}
            >
              {showProgress ? "Hide progress" : "My progress"}
            </button>
          </div>

          <div className="ki-chat-messages">
            <div className="ki-day-label">YOUR SESSION</div>

            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`ki-message-row ${
                  message.role === "user" ? "ki-user-row" : "ki-ai-row"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="ki-message-avatar">K</div>
                )}

                <div
                  className={`ki-bubble ${
                    message.role === "user" ? "ki-user-bubble" : "ki-ai-bubble"
                  } ${message.type === "followup" ? "ki-followup-bubble" : ""}`}
                >
                  {message.type === "followup" && (
                    <span className="ki-followup-label">
                      ✦ LET'S GO DEEPER
                    </span>
                  )}
                  <MessageText content={message.content} />
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="ki-typing">
                <span />
                <span />
                <span />
                Thinking through your explanation...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form className="ki-composer" onSubmit={sendMessage}>
            {speechError && (
              <p className="ki-speech-error">{speechError}</p>
            )}

            {isListening && (
              <div className="ki-listening">
                <span className="ki-listening-pulse" />
                Listening — speak naturally, then stop recording.
              </div>
            )}

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Explain something you've learned in your own words..."
              rows={3}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              aria-label="Your explanation"
            />

            <div className="ki-composer-footer">
              <span>Take your time. There are no perfect first answers.</span>

              <div className="ki-composer-actions">
                <button
                  type="button"
                  className={`ki-mic-button ${isListening ? "recording" : ""}`}
                  onClick={startListening}
                  aria-label={isListening ? "Stop recording" : "Speak your explanation"}
                  title={isListening ? "Stop recording" : "Speak your explanation"}
                >
                  {isListening ? "■" : "🎙"}
                  <span>{isListening ? "Stop" : "Speak"}</span>
                </button>

                <button
                  type="submit"
                  className="ki-send-button"
                  disabled={!input.trim() || isTyping}
                >
                  Send <span>↑</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        <aside className="ki-side-panel">
          <section className="ki-side-card ki-purpose-card">
            <span className="ki-eyebrow">THE IDEA</span>
            <h2>Understanding, not memorising.</h2>
            <p>
              Know It looks at how you explain an idea, connect
              concepts, and reason through a problem — not just
              whether you can repeat a definition.
            </p>

            <div className="ki-purpose-steps">
              <div><span>01</span> Explain in your own words</div>
              <div><span>02</span> Find gaps in your reasoning</div>
              <div><span>03</span> Answer a deeper question</div>
            </div>
          </section>

          {showProgress && (
            <section className="ki-side-card ki-progress-card">
              <span className="ki-eyebrow">SESSION SNAPSHOT</span>
              <h2>Your conversation so far</h2>

              <div className="ki-progress-stat">
                <span>Explanation turns</span>
                <strong>{turnCount}</strong>
              </div>

              <div className="ki-progress-stat">
                <span>Latest response length</span>
                <strong>{review ? `${review.words} words` : "—"}</strong>
              </div>

              <p>
                {review
                  ? "These are preliminary writing signals, not an AI assessment of factual accuracy."
                  : "Keep explaining your thinking to build your session."}
              </p>
            </section>
          )}

          <section className="ki-side-card ki-tip-card">
            <div className="ki-tip-icon">✧</div>
            <h3>A little tip</h3>
            <p>
              Try explaining not only <em>what</em> happens, but
              <em> why</em> it happens. That's where deeper understanding shows up.
            </p>
          </section>
        </aside>
      </section>

      <footer className="ki-footer">
        <span>TechBook · Your learning, your way.</span>
        <span>Every explanation is a chance to grow ♡</span>
      </footer>
    </main>
  );
}
