
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "react-oidc-context";
import {
  getNotes,
  saveNote,
  updateNote,
  deleteNote,
} from "../services/api";

const categories = [
  "All materials",
  "Notes",
  "Flashcards",
  "Quizzes",
  "Lecture summaries",
  "Mind maps",
  "Revision sheets",
  "Other",
];

const categoryIcons = {
  Notes: "▤",
  Flashcards: "▧",
  Quizzes: "✎",
  "Lecture summaries": "▶",
  "Mind maps": "⌘",
  "Revision sheets": "✧",
  Other: "▱",
};

function getCategory(note) {
  const type = (note.materialType || "").toLowerCase();

  if (type.includes("flashcard")) return "Flashcards";
  if (type.includes("quiz") || type.includes("mcq")) return "Quizzes";

  if (type.includes("lecture") || type.includes("video")) {
    return "Lecture summaries";
  }

  if (type.includes("mind")) return "Mind maps";

  if (type.includes("revision") || type.includes("quick")) {
    return "Revision sheets";
  }

  if (type.includes("note")) return "Notes";

  return "Other";
}

function formatDate(value) {
  if (!value) return "Recently saved";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Recently saved";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyNotes() {
  const auth = useAuth();
  const accessToken = auth.user?.access_token;

  const [materials, setMaterials] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All materials");
  const [search, setSearch] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [materialType, setMaterialType] = useState("notes");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [actionError, setActionError] = useState("");

  // LOAD MATERIALS FROM AWS
  const loadMaterials = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      setLoadError("Please sign in to access your learning library.");
      return;
    }

    try {
      setLoading(true);
      setLoadError("");

      const result = await getNotes(accessToken);

      setMaterials(result.items || []);
    } catch (err) {
      setLoadError(
        err.message || "Unable to load your learning library."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadMaterials();
  }, [loadMaterials]);

  // SEARCH AND FILTER MATERIALS
  const filteredMaterials = useMemo(() => {
    return materials.filter((item) => {
      const category = getCategory(item);

      const matchesCategory =
        activeCategory === "All materials" ||
        category === activeCategory;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        (item.title || "").toLowerCase().includes(query) ||
        (item.content || "").toLowerCase().includes(query) ||
        (item.sourceFeature || "").toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [materials, activeCategory, search]);

  // CREATE NEW MATERIAL
  function openNewEditor() {
    setEditingMaterial(null);
    setTitle("");
    setContent("");
    setMaterialType("notes");
    setFormError("");
    setShowEditor(true);
  }

  // EDIT EXISTING MATERIAL
  function openEditEditor(item) {
    setEditingMaterial(item);
    setTitle(item.title || "");
    setContent(item.content || "");
    setMaterialType(item.materialType || "notes");
    setSelectedMaterial(null);
    setFormError("");
    setShowEditor(true);
  }

  // SAVE OR UPDATE MATERIAL
  async function handleSave(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setFormError("Please enter a title and content.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = {
        title: title.trim(),
        content: content.trim(),
        materialType,
        sourceFeature: editingMaterial?.sourceFeature || "My Notes",
      };

      if (editingMaterial) {
        await updateNote(
          accessToken,
          editingMaterial.recordId,
          payload
        );
      } else {
        await saveNote(accessToken, payload);
      }

      setShowEditor(false);
      setEditingMaterial(null);

      await loadMaterials();
    } catch (err) {
      setFormError(
        err.message || "Unable to save this material."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE MATERIAL
  async function handleDelete(item) {
    const confirmed = window.confirm(
      `Delete "${item.title}" from your library?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(item.recordId);
      setActionError("");

      await deleteNote(accessToken, item.recordId);

      setMaterials((current) =>
        current.filter((note) => note.recordId !== item.recordId)
      );

      setSelectedMaterial(null);
    } catch (err) {
      setActionError(
        err.message || "Unable to delete this material."
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="library-page">

      {/* HEADER - BACK TO DASHBOARD ON LEFT */}

      <header className="library-topbar">
        <a className="library-back-link" href="#home">
          <span>←</span>
          Back to Dashboard
        </a>
      </header>

      <main className="library-main">

        {/* PAGE HEADING */}

        <section className="library-heading">
          <div>
            <span className="library-eyebrow">
              YOUR LEARNING SPACE
            </span>

            <h1>
              My <span>Notes..</span>
            </h1>

            <p>
              Everything you've created and saved, together in one place.
            </p>
          </div>

          <button
            className="library-create-button"
            onClick={openNewEditor}
          >
            <span>＋</span>
            Create New
          </button>
        </section>

        {/* LIBRARY OVERVIEW */}

        <section className="library-overview">
          <div className="library-overview-icon">▤</div>

          <div>
            <strong>
              {materials.length}{" "}
              {materials.length === 1 ? "material" : "materials"} saved
            </strong>

            <p>Your personal collection of learning resources</p>
          </div>

          <div className="library-overview-decoration">✧</div>
        </section>

        {/* SEARCH */}

        <section className="library-controls">
          <div className="library-search">
            <span>⌕</span>

            <input
              type="search"
              placeholder="Search your materials..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <button
            className="library-refresh"
            onClick={loadMaterials}
            disabled={loading}
            title="Refresh library"
          >
            ↻
          </button>
        </section>

        {/* CATEGORY FILTERS */}

        <nav className="library-categories">
          {categories.map((category) => (
            <button
              key={category}
              className={
                activeCategory === category ? "active" : ""
              }
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>

        {/* SOFT LIBRARY NOTICE */}

        {loadError && (
          <div className="library-notice">
            <span>✧</span>

            <div>
              <strong>Your library couldn't be loaded</strong>

              <p>{loadError}</p>

              <button
                type="button"
                onClick={loadMaterials}
                disabled={loading}
              >
                {loading ? "Trying again..." : "Try again"}
              </button>
            </div>
          </div>
        )}

        {actionError && (
          <div className="library-notice">
            <span>✧</span>

            <div>
              <strong>Unable to complete that action</strong>
              <p>{actionError}</p>
            </div>
          </div>
        )}

        {/* MATERIALS */}

        <section className="library-results">

          <div className="library-results-heading">
            <div>
              <h2>
                {activeCategory === "All materials"
                  ? "All materials"
                  : activeCategory}
              </h2>

              <p>
                {filteredMaterials.length}{" "}
                {filteredMaterials.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          {/* LOADING */}

          {loading ? (
            <div className="library-state">
              <div className="library-loader" />
              <p>Loading your library...</p>
            </div>

          ) : loadError ? (
            <div className="library-state">
              <div className="library-empty-icon">✧</div>
              <h3>Your materials are waiting</h3>
              <p>
                Reconnect to your library to view your saved learning resources.
              </p>
            </div>

          ) : filteredMaterials.length === 0 ? (

            /* EMPTY LIBRARY */

            <div className="library-empty">
              <div className="library-empty-icon">▤</div>

              <h3>
                {search
                  ? "No matching materials found"
                  : materials.length
                    ? "No materials in this category yet"
                    : "No notes created yet"}
              </h3>

              <p>
                {search
                  ? "Try a different keyword to find your study materials."
                  : materials.length
                    ? "Your other learning resources are saved in different categories."
                    : "Your notes, flashcards, lecture summaries and revision resources will find a home here."}
              </p>

              {!materials.length && !search && (
                <button onClick={openNewEditor}>
                  Create your first material
                </button>
              )}
            </div>

          ) : (

            /* MATERIAL CARDS */

            <div className="library-grid">
              {filteredMaterials.map((item) => {
                const category = getCategory(item);

                return (
                  <article
                    className="library-card"
                    key={item.recordId}
                    onClick={() => setSelectedMaterial(item)}
                  >
                    <div className="library-card-top">

                      <span
                        className={`library-file-icon ${category
                          .toLowerCase()
                          .replaceAll(" ", "-")}`}
                      >
                        {categoryIcons[category]}
                      </span>

                      <button
                        className="library-card-menu"
                        title="Open material"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMaterial(item);
                        }}
                      >
                        ↗
                      </button>
                    </div>

                    <span className="library-card-category">
                      {category}
                    </span>

                    <h3>{item.title}</h3>

                    <p className="library-card-description">
                      {item.content || "No preview available."}
                    </p>

                    <div className="library-card-footer">
                      <span>
                        {item.sourceFeature || "TechBook"}
                      </span>

                      <span>
                        {formatDate(item.updatedAt || item.createdAt)}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* CREATE / EDIT MODAL */}

      {showEditor && (
        <div
          className="library-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowEditor(false);
            }
          }}
        >
          <form
            className="library-editor"
            onSubmit={handleSave}
          >
            <div className="library-modal-heading">
              <div>
                <span className="library-eyebrow">
                  YOUR LIBRARY
                </span>

                <h2>
                  {editingMaterial
                    ? "Edit material"
                    : "Create material"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowEditor(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <label htmlFor="library-title">
              Title
            </label>

            <input
              id="library-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Give your material a title"
              required
            />

            <label htmlFor="library-type">
              Material type
            </label>

            <select
              id="library-type"
              value={materialType}
              onChange={(event) => setMaterialType(event.target.value)}
            >
              <option value="notes">Notes</option>
              <option value="flashcards">Flashcards</option>
              <option value="quiz">Quizzes</option>
              <option value="lecture-summary">Lecture summaries</option>
              <option value="mind-map">Mind maps</option>
              <option value="revision-sheet">Revision sheets</option>
              <option value="other">Other</option>
            </select>

            <label htmlFor="library-content">
              Content
            </label>

            <textarea
              id="library-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Write or paste your study material..."
              rows={9}
              required
            />

            {formError && (
              <div className="library-notice">
                <span>✧</span>
                <div>
                  <strong>Unable to save material</strong>
                  <p>{formError}</p>
                </div>
              </div>
            )}

            <div className="library-editor-actions">
              <button
                type="button"
                className="library-cancel-button"
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="library-save-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save to Library"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MATERIAL PREVIEW */}

      {selectedMaterial && (
        <div
          className="library-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedMaterial(null);
            }
          }}
        >
          <section className="library-preview">

            <div className="library-modal-heading">
              <div>
                <span className="library-eyebrow">
                  {getCategory(selectedMaterial)}
                </span>

                <h2>{selectedMaterial.title}</h2>

                <p>
                  {selectedMaterial.sourceFeature || "TechBook"}
                  {" · "}
                  {formatDate(
                    selectedMaterial.createdAt
                  )}
                </p>
              </div>

              <button
                onClick={() => setSelectedMaterial(null)}
                aria-label="Close preview"
              >
                ×
              </button>
            </div>

            <div className="library-preview-content">
              {selectedMaterial.content}
            </div>

            <div className="library-editor-actions">

              <button
                className="library-delete-button"
                disabled={
                  deletingId === selectedMaterial.recordId
                }
                onClick={() => handleDelete(selectedMaterial)}
              >
                {deletingId === selectedMaterial.recordId
                  ? "Deleting..."
                  : "Delete"}
              </button>

              <button
                className="library-save-button"
                onClick={() => openEditEditor(selectedMaterial)}
              >
                Edit material
              </button>

            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default MyNotes;
