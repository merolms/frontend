import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import LessonPanel from './components/LessonPanel';
import TipTapEditor from './components/TipTapEditor/TipTapEditor';
import Toolbar from './components/TipTapEditor/Toolbar';
import { saveAutosave, fetchAutosave } from '@/app/services/blockService';
import { fetchCourseById, fetchLessons, createLesson, updateLesson } from '@/app/services/courseService';
import './CourseBuilder.scss';

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [content, setContent] = useState('');
  const [editorInstance, setEditorInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState('');
  const [addingLesson, setAddingLesson] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  // ─── Load ────────────────────────────────────────────────
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await fetchCourseById(id);
      setCourse(courseData);
      const lessonList = await fetchLessons(id);
      if (lessonList && lessonList.length > 0) {
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
    try {
      const autosave = await fetchAutosave(lesson.id);
      if (autosave?.snapshot) {
        const snap = JSON.parse(autosave.snapshot);
        if (snap?.content && typeof snap.content === 'string') {
          setContent(snap.content);
          return;
        }
      }
    } catch { /* ignore */ }
  };

  // ─── Save ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedLesson) return;
    try {
      setSaving(true);
      setError(null);
      await saveAutosave(selectedLesson.id, JSON.stringify({ content }));
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutosave = useCallback(async (html) => {
    if (!selectedLesson) return;
    try {
      setAutosaveStatus('saving');
      await saveAutosave(selectedLesson.id, JSON.stringify({ content: html }));
      setAutosaveStatus('saved');
      setTimeout(() => setAutosaveStatus(''), 2000);
    } catch { setAutosaveStatus(''); }
  }, [selectedLesson]);

  const handleContentChange = useCallback((html) => {
    setContent(html);
    handleAutosave(html);
  }, [handleAutosave]);

  // Ctrl/Cmd+S
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [content, selectedLesson]);

  // ─── Lesson ops ──────────────────────────────────────────
  const handleSelectLesson = useCallback(async (lessonId) => {
    if (lessonId === selectedLesson?.id) return;
    setEditorInstance(null);
    const lesson = lessons.find((l) => l.id === lessonId);
    if (lesson) await loadLesson(lesson);
  }, [selectedLesson, lessons]);

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
      setEditorInstance(null);
      await loadLesson(newLesson);
    } catch (err) {
      setError(err.message || 'Failed to add lesson.');
    } finally {
      setAddingLesson(false);
    }
  };

  const handleEditorReady = useCallback((editor) => {
    setEditorInstance(editor);
  }, []);

  // ─── Render ───────────────────────────────────────────────
  if (loading) {
    return (
      <div className="dashboard-layout">
        <SideBar />
        <div className="cb-page">
          <div className="cb-loading"><Icon name="circle notch" loading size="big" /> Loading editor…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <SideBar />
      <div className="cb-page">
        <div className="cb-topbar">
          <div className="cb-topbar-left">
            <span className="cb-breadcrumb">
              <button className="cb-breadcrumb-link" onClick={() => navigate('/courses')}>Courses</button>
              <span className="cb-breadcrumb-sep">/</span>
              <button className="cb-breadcrumb-link" onClick={() => navigate(`/courses/${id}`)}>{course?.title}</button>
              <span className="cb-breadcrumb-sep">/</span>
              <span className="cb-breadcrumb-current">{selectedLesson?.title || 'Untitled'}</span>
            </span>
          </div>

          <div className="cb-topbar-center">
            <Toolbar editor={editorInstance} />
          </div>

          <div className="cb-topbar-right">
            {autosaveStatus === 'saving' && <span className="cb-autosave">Saving…</span>}
            {autosaveStatus === 'saved'  && <span className="cb-autosave cb-autosave--saved">✓ Saved</span>}
            <button className="cb-btn-preview" onClick={() => navigate(`/courses/${id}`)}>
              <Icon name="eye" />Preview
            </button>
            <button className="cb-btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <Icon name="circle notch" loading /> : <Icon name="save" />}Save
            </button>
          </div>
        </div>

        {error && (
          <div className="cb-error-bar">
            <Icon name="warning circle" />{error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        <div className="cb-editor-layout">
          <LessonPanel
            lessons={lessons}
            selectedLessonId={selectedLesson?.id}
            onSelectLesson={handleSelectLesson}
            onAddLesson={handleAddLesson}
            onRenameLesson={handleRenameLesson}
            adding={addingLesson}
          />

          <div className="cb-editor-area">
            <div className="cb-document">
              <TipTapEditor
                key={selectedLesson?.id}
                content={content}
                onChange={handleContentChange}
                onEditorReady={handleEditorReady}
                lessonId={selectedLesson?.id}
                fullPage
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
