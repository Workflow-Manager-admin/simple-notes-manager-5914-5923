import React, { useState, useEffect, useRef } from "react";
import "./App.css";

// Image background config
const BG_IMAGES = [
  {
    key: "potato",
    label: "Potato Cakes",
    file: "/images/20250728_044641_AR-223597-old-fashioned-potato-cakes-DDMFS-044-2x1-651634faa2d146709f3886c5e19aeed4.jpg",
    overlay: "rgba(255,255,255,0.6)",
    blur: "6px",
    position: "center",
    usage: "main"
  },
  {
    key: "ratatouille",
    label: "Ratatouille",
    file: "/images/20250728_044641_Ratatouille-recipe-500x500.jpg",
    overlay: "rgba(255,255,255,0.62)",
    blur: "8px",
    position: "center",
    usage: "main"
  },
  {
    key: "shakshuka",
    label: "Shakshuka",
    file: "/images/20250728_044642_opt__aboutcom__coeus__resources__content_migration__serious_eats__seriouseats.com__recipes__images__2016__09__20160926-shakshuka-17-a2b1d35f5ce146d1b8f5e2851e73b487.jpg",
    overlay: "rgba(255,255,255,0.77)",
    blur: "4px",
    position: "center",
    usage: "main"
  },
  {
    key: "garlic-steak",
    label: "Steak & Potatoes",
    file: "/images/20250728_044643_garlic-steak-bites-potatoes-recipe-3-edited.jpg",
    overlay: "rgba(255,255,255,0.7)",
    blur: "7px",
    position: "center",
    usage: "sidebar"
  }
];
/**
 * Color palette by request for theme:
 *   accent:   #ff9800
 *   primary:  #1976d2
 *   secondary #2196f3
 */

const THEME_COLORS = {
  accent: "#ff9800",
  primary: "#1976d2",
  secondary: "#2196f3",
  background: "#ffffff",
  border: "#e9ecef",
  sidebar: "#f4f7fa"
};

// Generate a unique id for new notes
const uid = () => Date.now().toString();

/**
 * CATEGORY/TAGS - seed with some example categories
 */
const seedCategories = [
  { name: "All", value: "all" },
  { name: "Personal", value: "personal" },
  { name: "Work", value: "work" },
  { name: "Ideas", value: "ideas" }
];

/**
 * PUBLIC_INTERFACE
 * Main App
 */
function App() {
  // Note structure: { id, title, body, tags:[], created, updated }
  const [notes, setNotes] = useState(() => {
    const data = localStorage.getItem("notes");
    return data ? JSON.parse(data) : [];
  });
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState(seedCategories);
  const [editingNote, setEditingNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // === Background theme selection state ===
  const [background, setBackground] = useState(() => {
    // Persist user selection in localStorage
    const stored = localStorage.getItem("notesapp-bg") || "ratatouille";
    return (BG_IMAGES.find(b => b.key === stored) ? stored : "ratatouille");
  });
  const selectedBg = BG_IMAGES.find(b => b.key === background) || BG_IMAGES[0];

  useEffect(() => {
    localStorage.setItem("notesapp-bg", background);
  }, [background]);

  // Persist notes to localStorage
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // Add or update category list when tags change
  useEffect(() => {
    // Flat unfold from notes' tags
    let tags = Array.from(
      new Set(notes.flatMap(note => note.tags || []))
    ).filter(tag => !!tag);

    // Add any new tags as categories if they're not present
    let nextCatValues = categories.map(c => c.value);
    let newCats = [
      ...seedCategories,
      ...tags
        .filter(
          tag =>
            !nextCatValues.includes(tag) &&
            !seedCategories.find(c => c.value === tag)
        )
        .map(tag => ({
          name: tag[0].toUpperCase() + tag.slice(1),
          value: tag
        }))
    ];
    setCategories(newCats);
  }, [notes]);

  // Filtered notes (search AND category)
  const filteredNotes = notes.filter(note => {
    const inTagOrCategory =
      selectedCategory === "all" ||
      (note.tags || []).includes(selectedCategory) ||
      note.category === selectedCategory;
    const searchMatch =
      search.trim() === "" ||
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.body.toLowerCase().includes(search.toLowerCase()) ||
      (note.tags || []).some(tag =>
        tag.toLowerCase().includes(search.toLowerCase())
      );
    return inTagOrCategory && searchMatch;
  });

  // --- CRUD HANDLERS ---

  // PUBLIC_INTERFACE
  function handleCreateNote(note) {
    const now = new Date().toISOString();
    setNotes(prev => [
      {
        ...note,
        id: uid(),
        created: now,
        updated: now
      },
      ...prev
    ]);
    setShowNoteModal(false);
  }

  // PUBLIC_INTERFACE
  function handleEditNote(note) {
    const now = new Date().toISOString();
    setNotes(prev =>
      prev.map(n =>
        n.id === note.id
          ? { ...note, updated: now }
          : n
      )
    );
    setShowNoteModal(false);
    setEditingNote(null);
  }

  // PUBLIC_INTERFACE
  function handleDeleteNote(id) {
    if (window.confirm("Are you sure you want to delete this note?")) {
      setNotes(prev => prev.filter(n => n.id !== id));
    }
  }

  function handleShowEdit(note) {
    setEditingNote(note);
    setModalMode("edit");
    setShowNoteModal(true);
  }

  function handleShowCreate() {
    setEditingNote(null);
    setModalMode("create");
    setShowNoteModal(true);
  }

  function handleSidebarToggle() {
    setSidebarOpen(s => !s);
  }

  // UI

  return (
    <div
      className="notesapp"
      style={{
        minHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Visual background + overlay */}
      <div
        className="notesapp__background"
        style={{
          position: "fixed",
          zIndex: 0,
          inset: 0,
          pointerEvents: "none",
          backgroundImage: selectedBg.file ? `url('${selectedBg.file}')` : "none",
          backgroundSize: "cover",
          backgroundPosition: selectedBg.position,
          transition: "background-image 0.4s",
          minHeight: "100vh"
        }}
      />
      <div
        className="notesapp__overlay"
        style={{
          position: "fixed",
          zIndex: 1,
          inset: 0,
          background: selectedBg.overlay,
          backdropFilter: `blur(${selectedBg.blur})`,
          pointerEvents: "none",
          minHeight: "100vh"
        }}
      />
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh" }}>
        <Header accent={THEME_COLORS.accent} primary={THEME_COLORS.primary} handleSidebarToggle={handleSidebarToggle} />

        {/* Background selector UI */}
        <ThemeSelector
          value={background}
          onChange={setBackground}
          accent={THEME_COLORS.accent}
        />

        <div className="main-wrapper">
          {/* SIDEBAR with optional food background for sidebar */}
          <Sidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            bgTheme={background}
          />
          {/* CONTENT */}
          <main className="main-content">
            <div className="content-header">
              <SearchBar
                value={search}
                onChange={e => setSearch(e.target.value)}
                accent={THEME_COLORS.accent}
              />
            </div>
            <NotesList
              notes={filteredNotes}
              onEdit={handleShowEdit}
              onDelete={handleDeleteNote}
            />
            <FloatingActionButton
              onClick={handleShowCreate}
              accent={THEME_COLORS.accent}
            />
          </main>
        </div>
        {showNoteModal && (
          <NoteModal
            mode={modalMode}
            note={editingNote}
            onCancel={() => {
              setShowNoteModal(false);
              setEditingNote(null);
            }}
            onSave={modalMode === "create" ? handleCreateNote : handleEditNote}
            accent={THEME_COLORS.accent}
          />
        )}
        <div className="footer-note">
          <span>Notes App &middot; {new Date().getFullYear()} · Modern Minimalist UI</span>
        </div>
      </div>
    </div>
  );
}

// Header with navigation title
function Header({ accent, primary, handleSidebarToggle }) {
  return (
    <header
      className="header"
      style={{
        background: primary,
        color: "#fff",
        boxShadow: "0 2px 4px rgba(25, 118, 210,0.03)"
      }}
    >
      <button
        className="sidebar-toggle"
        aria-label="Toggle Sidebar"
        onClick={handleSidebarToggle}
      >
        ☰
      </button>
      <span className="header-logo">📝</span>
      <span className="header-title" style={{ color: accent }}>
        Notes
      </span>
      <span className="header-tagline">Simple, Fast, Minimalist</span>
    </header>
  );
}

/** PUBLIC_INTERFACE
 * ThemeSelector – select which food image is used as background
 */
function ThemeSelector({ value, onChange, accent }) {
  return (
    <div style={{
      position: "absolute",
      top: 12,
      right: 22,
      zIndex: 101,
      userSelect: "none"
    }}>
      <label style={{
        fontWeight: 500, color: accent, marginRight: 8, background: "rgba(255,255,255,0.89)", borderRadius: 6, padding: "1px 8px", fontSize: "0.98em"
      }}>
        Background:
      </label>
      <select
        value={value}
        style={{
          padding: "4px 11px",
          borderRadius: 6,
          fontSize: "1em",
          border: `1px solid ${accent}`,
          background: "#fff9f4",
          color: accent,
          outlineColor: accent
        }}
        onChange={e => onChange(e.target.value)}
        aria-label="Select background image"
      >
        {BG_IMAGES.map(bg => (
          <option value={bg.key} key={bg.key}>
            {bg.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Sidebar for categories/tags – supports optional sidebar-specific background
function Sidebar({ categories, selectedCategory, onSelectCategory, sidebarOpen, setSidebarOpen, bgTheme }) {
  // Show steak & potatoes image only if corresponding theme is selected
  const bg = BG_IMAGES.find(bg => bg.key === bgTheme);
  const isSidebarBg = bg && bg.usage === "sidebar";
  const bgImage = isSidebarBg ? bg.file : undefined;
  const overlay = isSidebarBg ? bg.overlay : undefined;
  const blur = isSidebarBg ? bg.blur : undefined;

  return (
    <aside
      className={`sidebar${sidebarOpen ? " open" : ""}`}
      tabIndex="-1"
      aria-label="Categories"
      style={
        isSidebarBg
          ? {
              position: "relative",
              background: "none",
              boxShadow: "0 2px 16px rgba(123,72,36,0.08)"
            }
          : {}
      }
    >
      {isSidebarBg && (
        <>
          <div
            style={{
              position: "absolute",
              zIndex: 0,
              inset: 0,
              backgroundImage: `url('${bgImage}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.84,
              pointerEvents: "none"
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              zIndex: 1,
              inset: 0,
              background: overlay,
              backdropFilter: `blur(${blur})`,
              pointerEvents: "none"
            }}
          ></div>
        </>
      )}
      <nav style={isSidebarBg ? { position: "relative", zIndex: 2 } : {}}>
        <div className="sidebar-title">Categories</div>
        <ul>
          {categories.map(cat => (
            <li
              key={cat.value}
              className={cat.value === selectedCategory ? "selected" : ""}
              tabIndex={0}
              onClick={() => {
                onSelectCategory(cat.value);
                setSidebarOpen(false);
              }}
              onKeyPress={e => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectCategory(cat.value);
                  setSidebarOpen(false);
                }
              }}
            >
              #{cat.name}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

// Search bar component
function SearchBar({ value, onChange, accent }) {
  return (
    <div className="searchbar-wrapper">
      <input
        className="searchbar"
        type="search"
        placeholder="Search notes..."
        value={value}
        onChange={onChange}
        style={{
          borderColor: accent,
          outlineColor: accent
        }}
        aria-label="Search notes"
      />
    </div>
  );
}

// Notes list
function NotesList({ notes, onEdit, onDelete }) {
  if (!notes.length)
    return (
      <div className="notes-list empty-state">
        <span>No notes found. Create your first note!</span>
      </div>
    );
  return (
    <section className="notes-list">
      {notes.map(note => (
        <NoteCard
          key={note.id}
          note={note}
          onEdit={() => onEdit(note)}
          onDelete={() => onDelete(note.id)}
        />
      ))}
    </section>
  );
}

// Individual note card
function NoteCard({ note, onEdit, onDelete }) {
  return (
    <article className="note-card" tabIndex={0}>
      <header>
        <h3 className="note-title">{note.title}</h3>
        <div className="note-meta">
          <span className="meta-date">
            {new Date(note.updated || note.created).toLocaleString()}
          </span>
          <div>
            <button className="card-btn edit" onClick={onEdit} title="Edit note">
              ✎
            </button>
            <button className="card-btn delete" onClick={onDelete} title="Delete note">
              🗑
            </button>
          </div>
        </div>
      </header>
      <section className="note-body">
        <p style={{ whiteSpace: "pre-wrap" }}>{note.body}</p>
      </section>
      <footer>
        <div className="note-tags">
          {(note.tags || []).map(tag => (
            <span key={tag} className="tag">
              #{tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}

// Floating action button for creation
function FloatingActionButton({ onClick, accent }) {
  return (
    <button
      className="fab"
      style={{
        background: accent,
        color: "#fff"
      }}
      aria-label="Add Note"
      onClick={onClick}
    >
      +
    </button>
  );
}

// Modal for creating/editing notes
function NoteModal({ mode, note, onCancel, onSave, accent }) {
  const [title, setTitle] = useState(note ? note.title : "");
  const [body, setBody] = useState(note ? note.body : "");
  const [tags, setTags] = useState(note && note.tags ? note.tags.join(", ") : "");
  const titleRef = useRef();

  useEffect(() => {
    if (titleRef.current) titleRef.current.focus();
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const tagArr = tags
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(Boolean);
    if (!title.trim()) {
      alert("Title is required");
      return;
    }
    if (mode === "create") {
      onSave({
        title: title.trim(),
        body: body.trim(),
        tags: tagArr
      });
    } else if (mode === "edit") {
      onSave({
        ...note,
        title: title.trim(),
        body: body.trim(),
        tags: tagArr
      });
    }
  }

  return (
    <div className="modal-backdrop" tabIndex={-1}>
      <div className="modal" role="dialog" aria-modal="true">
        <form className="note-form" onSubmit={handleSubmit} style={{borderColor: accent}}>
          <h2>{mode === "create" ? "Add Note" : "Edit Note"}</h2>
          <div className="form-group">
            <label htmlFor="notetitle">Title</label>
            <input
              id="notetitle"
              ref={titleRef}
              type="text"
              placeholder="Note title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              maxLength={128}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notebody">Body</label>
            <textarea
              id="notebody"
              placeholder="Write your note..."
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notetags">Tags <span className="help">(comma separated)</span></label>
            <input
              id="notetags"
              type="text"
              placeholder="e.g. work, ideas"
              value={tags}
              onChange={e => setTags(e.target.value)}
              maxLength={64}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn cancel" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn save" style={{background: accent}}>
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
