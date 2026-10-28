
const STORAGE_KEY = "techbookLearningActivity";

const emptyHistory = {
  topics: [],
  quizzes: [],
  activities: [],
};

function readHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return { ...emptyHistory };

    const parsed = JSON.parse(saved);

    return {
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      quizzes: Array.isArray(parsed.quizzes) ? parsed.quizzes : [],
      activities: Array.isArray(parsed.activities)
        ? parsed.activities
        : [],
    };
  } catch (error) {
    console.error("Could not read TechBook history:", error);
    return {
      topics: [],
      quizzes: [],
      activities: [],
    };
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

  window.dispatchEvent(new Event("techbook:learning-updated"));

  return history;
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getLearningHistory() {
  return readHistory();
}

export function recordTopic({
  title,
  subject = "General",
  feature = "TechBook",
  progress = 0,
  status = "in-progress",
}) {
  if (!title?.trim()) return null;

  const history = readHistory();
  const normalizedTitle = title.trim().toLowerCase();

  let topic = history.topics.find(
    (item) =>
      item.title?.trim().toLowerCase() === normalizedTitle &&
      item.subject === subject
  );

  const now = new Date().toISOString();

  if (topic) {
    topic.lastStudied = now;
    topic.feature = feature;
    topic.progress = Math.max(
      Number(topic.progress) || 0,
      Math.min(100, Math.max(0, Number(progress) || 0))
    );

    if (status === "completed" || topic.progress === 100) {
      topic.status = "completed";
      topic.progress = 100;
    } else if (status === "in-progress") {
      topic.status = "in-progress";
    }
  } else {
    topic = {
      id: makeId(),
      title: title.trim(),
      subject,
      feature,
      progress: Math.min(100, Math.max(0, Number(progress) || 0)),
      status:
        status === "completed" || Number(progress) >= 100
          ? "completed"
          : "in-progress",
      date: now,
      lastStudied: now,
    };

    history.topics.unshift(topic);
  }

  saveHistory(history);
  return topic;
}

export function completeTopic({ title, subject = "General", feature }) {
  return recordTopic({
    title,
    subject,
    feature,
    progress: 100,
    status: "completed",
  });
}

export function recordActivity({
  title,
  type = "Learning",
  subject = "General",
  feature = "TechBook",
  minutes = 0,
  icon = "✧",
  details = "",
}) {
  if (!title?.trim()) return null;

  const history = readHistory();

  const activity = {
    id: makeId(),
    title: title.trim(),
    type,
    subject,
    feature,
    minutes: Math.max(0, Number(minutes) || 0),
    icon,
    details,
    date: new Date().toISOString(),
  };

  history.activities.unshift(activity);
  saveHistory(history);

  return activity;
}

export function recordQuiz({
  title,
  topic = "",
  subject = "General",
  score,
  totalQuestions,
  correctAnswers,
  feature = "ReMind",
}) {
  if (!Number.isFinite(Number(score))) return null;

  const history = readHistory();
  const numericScore = Math.min(100, Math.max(0, Number(score)));

  const quiz = {
    id: makeId(),
    title: title || topic || "Quiz",
    topic: topic || title || "Quiz",
    subject,
    score: numericScore,
    totalQuestions:
      Number.isFinite(Number(totalQuestions))
        ? Math.max(0, Number(totalQuestions))
        : null,
    correctAnswers:
      Number.isFinite(Number(correctAnswers))
        ? Math.max(0, Number(correctAnswers))
        : null,
    feature,
    date: new Date().toISOString(),
  };

  history.quizzes.unshift(quiz);

  if (topic) {
    recordTopic({
      title: topic,
      subject,
      feature,
    });

    // recordTopic saves its own changes, so reload before
    // saving the updated quiz history.
    const latestHistory = readHistory();
    latestHistory.quizzes.unshift(quiz);

    // Remove the earlier copy before saving.
    latestHistory.quizzes = latestHistory.quizzes.filter(
      (item, index, array) =>
        array.findIndex((candidate) => candidate.id === item.id) === index
    );

    saveHistory(latestHistory);
  } else {
    saveHistory(history);
  }

  return quiz;
}

export function clearLearningHistory() {
  saveHistory({
    topics: [],
    quizzes: [],
    activities: [],
  });
}
