const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(path, accessToken, options = {}) {
  if (!API_BASE_URL) {
    throw new Error("API URL is missing. Check your .env file.");
  }

  if (!accessToken) {
    throw new Error("Your session has expired. Please sign in again.");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.error || data.message || `Request failed (${response.status})`
    );
  }

  return data;
}

export function getNotes(accessToken) {
  return apiRequest("/notes", accessToken);
}

export function getNote(accessToken, recordId) {
  return apiRequest(`/notes/${encodeURIComponent(recordId)}`, accessToken);
}

export function saveNote(accessToken, note) {
  return apiRequest("/notes", accessToken, {
    method: "POST",
    body: JSON.stringify(note),
  });
}

export function updateNote(accessToken, recordId, note) {
  return apiRequest(`/notes/${encodeURIComponent(recordId)}`, accessToken, {
    method: "PUT",
    body: JSON.stringify(note),
  });
}

export function deleteNote(accessToken, recordId) {
  return apiRequest(`/notes/${encodeURIComponent(recordId)}`, accessToken, {
    method: "DELETE",
  });
}