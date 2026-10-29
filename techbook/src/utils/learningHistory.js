
const STORAGE_KEY = "techbookLearningActivity";

const emptyHistory = {
  topics: [],
  quizzes: [],
  activities: [],
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function readHistory() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {
        topics: [],
        quizzes: [],
        activities: [],
      };
    }

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
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    window.dispatchEvent(new Event("techbook:learning-updated"));

    return history;
  } catch (error) {
    console.error("Could not save TechBook history:", error);
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeProgress(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return 0;

  return Math.min(100, Math.max(0, number));
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
  const cleanTitle = title.trim();
  const cleanSubject = subject?.trim() || "General";
  const cleanFeature = feature?.trim() || "TechBook";
  const normalizedTitle = normalizeText(cleanTitle);
  const normalizedSubject = normalizeText(cleanSubject);
  const now = new Date().toISOString();
  const safeProgress = normalizeProgress(progress);

  let topic = history.topics.find(
    (item) =>
      normalizeText(item.title) === normalizedTitle &&
      normalizeText(item.subject) === normalizedSubject
  );

  if (topic) {
    topic.lastStudied = now;
    topic.feature = cleanFeature;
    topic.features = Array.from(
      new Set([...(topic.features || []), cleanFeature])
    );

    if (status === "completed" || safeProgress >= 100) {
      topic.status = "completed";
      topic.progress = 100;
      topic.completedAt = topic.completedAt || now;
    } else if (topic.status !== "completed") {
      topic.status = "in-progress";
      topic.progress = Math.max(
        normalizeProgress(topic.progress),
        safeProgress
      );
    }
  } else {
    topic = {
      id: makeId(),
      title: cleanTitle,
      subject: cleanSubject,
      feature: cleanFeature,
      features: [cleanFeature],
      progress: status === "completed" ? 100 : safeProgress,
      status:
        status === "completed" || safeProgress >= 100
          ? "completed"
          : "in-progress",
      date: now,
      lastStudied: now,
      completedAt:
        status === "completed" || safeProgress >= 100 ? now : null,
    };

    history.topics.unshift(topic);
  }

  saveHistory(history);
  return topic;
}

export function updateTopicProgress({
  title,
  subject = "General",
  feature = "TechBook",
  progress,
  status,
}) {
  const safeProgress =
    status === "completed" ? 100 : normalizeProgress(progress);

  return recordTopic({
    title,
    subject,
    feature,
    progress: safeProgress,
    status:
      status === "completed" || safeProgress >= 100
        ? "completed"
        : "in-progress",
  });
}

export function completeTopic({
  title,
  subject = "General",
  feature = "TechBook",
}) {
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
    minutes: Math.max(
      0,
      Number.isFinite(Number(minutes)) ? Number(minutes) : 0
    ),
    icon,
    details,
    date: new Date().toISOString(),
  };

  history.activities.unshift(activity);

  const saved = saveHistory(history);

  return saved ? activity : null;
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
  const numericScore = Number(score);

  if (
    score === undefined ||
    score === null ||
    score === "" ||
    !Number.isFinite(numericScore)
  ) {
    console.error("Quiz was not saved: a valid score is required.");
    return null;
  }

  const history = readHistory();
  const now = new Date().toISOString();
  const cleanTopic = topic.trim();
  const cleanSubject = subject?.trim() || "General";

  const quiz = {
    id: makeId(),
    title: title?.trim() || cleanTopic || "Quiz",
    topic: cleanTopic || title?.trim() || "Quiz",
    subject: cleanSubject,
    score: Math.min(100, Math.max(0, numericScore)),
    totalQuestions:
      totalQuestions !== undefined &&
      totalQuestions !== null &&
      totalQuestions !== "" &&
      Number.isFinite(Number(totalQuestions))
        ? Math.max(0, Number(totalQuestions))
        : null,
    correctAnswers:
      correctAnswers !== undefined &&
      correctAnswers !== null &&
      correctAnswers !== "" &&
      Number.isFinite(Number(correctAnswers))
        ? Math.max(0, Number(correctAnswers))
        : null,
    feature,
    date: now,
  };

  // Save the topic and quiz in the same history update.
  if (cleanTopic) {
    let existingTopic = history.topics.find(
      (item) =>
        normalizeText(item.title) === normalizeText(cleanTopic) &&
        normalizeText(item.subject) === normalizeText(cleanSubject)
    );

    if (!existingTopic) {
      existingTopic = {
        id: makeId(),
        title: cleanTopic,
        subject: cleanSubject,
        feature,
        features: [feature],
        progress: 0,
        status: "in-progress",
        date: now,
        lastStudied: now,
        completedAt: null,
      };

      history.topics.unshift(existingTopic);
    } else {
      existingTopic.lastStudied = now;
      existingTopic.feature = feature;
      existingTopic.features = Array.from(
        new Set([...(existingTopic.features || []), feature])
      );
    }
  }

  history.quizzes.unshift(quiz);

  const saved = saveHistory(history);

  return saved ? quiz : null;
}

export function clearLearningHistory() {
  return saveHistory({
    ...emptyHistory,
    topics: [],
    quizzes: [],
    activities: [],
  });
}
