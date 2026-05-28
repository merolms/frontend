import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SideBar from '@/app/containers/SideBar/SideBar';
import './CourseBuilder.scss';
import LessonPanel from './components/LessonPanel';
import BlockNoteEditor from './components/BlockNoteEditor/BlockNoteEditor';
import {
  fetchCourseById,
  fetchLessons,
  createLesson,
  updateLesson,
  reorderLessons,
} from '@/app/services/courseService';
import { saveAutosave, fetchAutosave } from '@/app/services/blockService';

// ─── Icons ───────────────────────────────────────────────────────
const SaveIcon = () => (
  <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16v4H7v-4m10-8v4a1 1 0 01-1 1H8a1 1 0 01-1-1V8m7-5H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V9l-4-4z" />
  </svg>
);

const EyeIcon = () => (
  <svg style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AlertIcon = () => (
  <svg style={{ width: 16, height: 16, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const CheckIcon = () => (
  <svg style={{ width: 12, height: 12 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const Spinner = ({ size = 14 }) => (
  <svg style={{ width: size, height: size, animation: 'spin 0.8s linear infinite' }} fill="none" viewBox="0 0 24 24">
    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

// ─── CourseBuilder ───────────────────────────────────────────────
const CourseBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  // ─── Content bridge ─────────────────────────────────────────────
  // Editor writes to contentRef (never to state during active editing).
  // State is only updated on explicit save to avoid echo back to editor.
  const contentRef = useRef('');
  const [content, setContent] = useState('');
  const [panelWidth, setPanelWidth] = useState(300);
  const [isResizing, setIsResizing] = useState(false);
  const resizeStart = useRef({ x: 0, width: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [addingLesson, setAddingLesson] = useState(false);
  const [error, setError] = useState(null);
  const [words, setWords] = useState(0);

  useEffect(() => { loadData(); }, [id]); // eslint-disable-line

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await fetchCourseById(id);
      setCourse(courseData);
      const lessonList = await fetchLessons(id);
      if (lessonList?.length > 0) {
        setLessons(lessonList);
        await loadLesson(lessonList[0]);
      } else {
        const newLesson = await createLesson(id, { title: 'Lesson 1', description: '' });
        setLessons([newLesson]);
        setSelectedLesson(newLesson);
        setContent('');
      }
    } catch (err) {
      setError(err.message || 'Failed to load course.');
    } finally {
      setLoading(false);
    }
  };

  const loadLesson = async (lesson) => {
    setSelectedLesson(lesson);
    setContent('');
    contentRef.current = '';
    try {
      // First try autosave (more recent)
      const autosave = await fetchAutosave(lesson.id);
      if (autosave?.snapshot) {
        const snap = JSON.parse(autosave.snapshot);
        const c = Array.isArray(snap) ? JSON.stringify(snap)
          : snap.content ? (typeof snap.content === 'string' ? snap.content : JSON.stringify(snap.content))
          : JSON.stringify(snap);
        setContent(c);
        contentRef.current = c;
        return;
      }
      // Fall back to lesson content
      if (lesson.content) {
        const c = typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content);
        setContent(c);
        contentRef.current = c;
        return;
      }
    } catch { /* ignore */ }
  };

  const handleSave = async () => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setError(null);
      const currentContent = contentRef.current;
      await saveAutosave(selectedLesson.id, JSON.stringify({ content: currentContent, format: 'blocknote' }));
      await updateLesson(id, selectedLesson.id, { title: selectedLesson.title, content: currentContent, type: 'blocknote' });
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = useCallback((json) => {
    contentRef.current = json;
  }, []);
  const handleStatsChange = useCallback(({ words: w }) => setWords(w), []);

  // ─── Reorder lessons ───────────────────────────────────────────
  const handleReorderLessons = useCallback(async (newLessons) => {
    // Optimistically update local state
    const previousLessons = lessons;
    setLessons(newLessons);

    // Persist new order to backend
    try {
      const orderedIds = newLessons.map((l) => l.id);
      await reorderLessons(id, orderedIds);
    } catch (err) {
      // Rollback on failure
      setLessons(previousLessons);
      setError(err.message || 'Failed to reorder lessons.');
    }
  }, [lessons, id]);

  // ─── Panel resize ─────────────────────────────────────────────
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    resizeStart.current = { x: e.clientX, width: panelWidth };

    const handleMove = (ev) => {
      const dx = ev.clientX - resizeStart.current.x;
      const next = Math.max(160, Math.min(480, resizeStart.current.width + dx));
      setPanelWidth(next);
    };

    const handleUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  }, [panelWidth]);

  const handleSelectLesson = useCallback(
    async (lessonId) => {
      if (lessonId === selectedLesson?.id) return;
      const lesson = lessons.find((l) => l.id === lessonId);
      if (lesson) await loadLesson(lesson);
    },
    [selectedLesson, lessons]
  );

  const handleRenameLesson = async (lessonId, newTitle) => {
    try {
      await updateLesson(id, lessonId, { title: newTitle });
      setLessons(lessons.map((l) => l.id === lessonId ? { ...l, title: newTitle } : l));
      if (selectedLesson?.id === lessonId) setSelectedLesson((l) => ({ ...l, title: newTitle }));
    } catch (err) {
      setError(err.message || 'Failed to rename lesson.');
    }
  };

  const handleAddLesson = async () => {
    try {
      setAddingLesson(true);
      const newLesson = await createLesson(id, { title: `Lesson ${lessons.length + 1}`, description: '' });
      setLessons([...lessons, newLesson]);
      await loadLesson(newLesson);
    } catch (err) {
      setError(err.message || 'Failed to add lesson.');
    } finally {
      setAddingLesson(false);
    }
  };

  const lessonIndex = lessons.findIndex((l) => l.id === selectedLesson?.id);

  // ─── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <SideBar />
        <div style={{ marginLeft: 70, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <Spinner size={32} />
            <span style={{ color: '#aaa', fontSize: 14 }}>Loading editor…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div >
      <SideBar />

      {/* Main panel */}
      <div style={{ marginLeft: 70, flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f5f5f5' }}>

        {/* ── Top bar ───────────────────────────────────────── */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          height: 52,
          minHeight: 52,
          background: '#fff',
          borderBottom: '1px solid #ebebeb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          padding: '0 16px',
          flexShrink: 0,
          zIndex: 50,
        }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 0, fontSize: 13 }}>
            <BreadcrumbButton onClick={() => navigate('/courses')}>Courses</BreadcrumbButton>
            <span style={{ color: '#ddd' }}>/</span>
            <BreadcrumbButton onClick={() => navigate(`/courses/${id}`)} maxWidth={160}>
              {course?.title}
            </BreadcrumbButton>
            <span style={{ color: '#ddd' }}>/</span>
            <span style={{ color: '#333', fontWeight: 600, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedLesson?.title || 'Untitled'}
            </span>
          </nav>

          {/* Right controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {words > 0 && (
              <span style={{ fontSize: 11, color: '#bbb', background: '#f5f5f5', borderRadius: 12, padding: '2px 8px', fontVariantNumeric: 'tabular-nums' }}>
                {words} words
              </span>
            )}

            {autosaveStatus === 'saved' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#111' }}>
                <CheckIcon /> Saved
              </span>
            )}

            <TopBarButton
              onClick={() => navigate(`/courses/${id}`)}
              variant="ghost"
            >
              <EyeIcon /> Preview
            </TopBarButton>

            <TopBarButton
              onClick={handleSave}
              disabled={saving}
              variant="primary"
            >
              {saving ? <Spinner /> : <SaveIcon />} Save
            </TopBarButton>
          </div>
        </header>

        {/* ── Error bar ─────────────────────────────────────── */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 16px',
            background: '#fff2f0',
            borderBottom: '1px solid #ffd4cf',
            color: '#c53030',
            fontSize: 13,
            flexShrink: 0,
          }}>
            <AlertIcon />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c53030', fontSize: 18, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* ── Editor layout ──────────────────────────────────── */}
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <LessonPanel
            lessons={lessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={handleSelectLesson}
            onAddLesson={handleAddLesson}
            onRenameLesson={handleRenameLesson}
            adding={addingLesson}
            width={panelWidth}
            onReorder={handleReorderLessons}
          />

          {/* Resize handle */}
          <div
            onMouseDown={handleResizeStart}
            style={{
              width: 6,
              flexShrink: 0,
              cursor: 'col-resize',
              background: isResizing ? 'rgba(0,0,0,0.08)' : 'transparent',
              transition: 'background 0.15s',
              userSelect: 'none',
            }}
            onMouseEnter={(e) => { if (!isResizing) e.currentTarget.style.background = 'rgba(0,0,0,0.06)'; }}
            onMouseLeave={(e) => { if (!isResizing) e.currentTarget.style.background = 'transparent'; }}
          />

          {/* Scrollable canvas */}
          <main style={{
            flex: 1,
            overflowY: 'auto',
            background: '#f5f5f5',
            backgroundImage: 'radial-gradient(circle, #d0d0d0 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            display: 'flex',
            justifyContent: 'center',
            padding: '40px 24px',
          }}>
            {/* Document card */}
            <div style={{
              width: '100%',
              minWidth: 760,
              background: '#fff',
              borderRadius: 12,
              boxShadow: '0 2px 20px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.03)',
              padding: '48px 56px 0',
              display: 'flex',
              flexDirection: 'column',
            }}>
              {/* Document header */}
              <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>
                <div style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: '#d1d5db',
                  marginBottom: 6,
                }}>
                  Lesson {lessonIndex >= 0 ? lessonIndex + 1 : 1}
                </div>
                <h1 style={{ fontSize: '1.8em', fontWeight: 700, color: '#111', margin: 0, lineHeight: 1.25 }}>
                  {selectedLesson?.title || 'Untitled Lesson'}
                </h1>
              </div>

              {/* BlockNote editor */}
              <div style={{ flex: 1 }}>
                <BlockNoteEditor
                  key={selectedLesson?.id}
                  lessonId={selectedLesson?.id}
                  contentRef={contentRef}
                  onChange={handleContentChange}
                  onSave={handleSave}
                  onStatsChange={handleStatsChange}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// ─── Small helper components ──────────────────────────────────────

const BreadcrumbButton = ({ onClick, children, maxWidth = 120 }) => {
  const [hovered, setHovered] = React.useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: hovered ? '#111' : '#999',
        padding: 0,
        fontSize: 13,
        maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        transition: 'color 0.15s',
      }}
    >
      {children}
    </button>
  );
};

const TopBarButton = ({ onClick, disabled, variant, children }) => {
  const [hovered, setHovered] = React.useState(false);

  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 13px',
    border: 'none',
    borderRadius: 7,
    fontSize: 13,
    fontWeight: 500,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'background 0.15s, opacity 0.15s',
  };

  const styles = variant === 'primary' ? {
    ...base,
    background: hovered && !disabled ? '#000' : '#111',
    color: '#fff',
    opacity: disabled ? 0.7 : 1,
  } : {
    ...base,
    background: hovered ? '#e8e8e8' : '#f0f0f0',
    color: '#555',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={styles}
    >
      {children}
    </button>
  );
};

export default CourseBuilder;
