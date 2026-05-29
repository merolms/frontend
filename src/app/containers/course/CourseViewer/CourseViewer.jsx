import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Paper, Breadcrumbs, Anchor, Button, Progress, Title,
  Text, Skeleton, Group
} from '@mantine/core';
import { ArrowLeft, ArrowRight, BookOpen, Check } from 'lucide-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import { fetchCourseById, fetchLessons } from '@/app/services/courseService';
import { fetchAutosave } from '@/app/services/blockService';
import { t } from '@/styles/theme';
import { useTheme as useThemeContext } from '@/app/context/ThemeContext';
import { BlockNoteView } from '@blocknote/mantine';
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';
import './CourseViewer.scss';

const PARA_PROPS = {
  textAlignment: 'left',
  backgroundColor: 'default',
  textColor: 'default',
};

const toInlineContent = (content) => {
  if (!content) return [];
  if (Array.isArray(content)) {
    return content
      .filter((c) => c && c.type)
      .map((c) =>
        c.type === 'text'
          ? { type: 'text', text: c.text || '', styles: c.styles || {} }
          : c
      );
  }
  if (typeof content === 'string' && content.trim()) {
    return [{ type: 'text', text: content, styles: {} }];
  }
  if (typeof content === 'object' && content.text) {
    return [{ type: 'text', text: content.text, styles: content.styles || {} }];
  }
  return [];
};

const sanitizeBlocks = (content) => {
  if (!content) return [];
  let parsed;
  try {
    parsed = typeof content === 'string' ? JSON.parse(content) : content;
  } catch {
    if (typeof content === 'string' && content.trim()) {
      return [{ type: 'paragraph', props: { ...PARA_PROPS }, content: [{ type: 'text', text: content, styles: {} }], children: [] }];
    }
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((b) => b && b.type)
    .map((b) => ({
      type: b.type,
      props: b.props || { ...PARA_PROPS },
      content: toInlineContent(b.content),
      children: Array.isArray(b.children) ? sanitizeBlocks(b.children) : [],
    }));
};

const CourseViewer = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { resolvedTheme: theme } = useThemeContext();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lessonContents, setLessonContents] = useState({});

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [c, l] = await Promise.all([fetchCourseById(id), fetchLessons(id)]);
      setCourse(c);
      const sorted = (l || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
      setLessons(sorted);

      // Fetch content for all lessons (from autosave first, then lesson.content)
      const contents = {};
      await Promise.all((l || []).map(async (lesson) => {
        try {
          const autosave = await fetchAutosave(lesson.id);
          if (autosave?.snapshot) {
            const snap = JSON.parse(autosave.snapshot);
            const raw = Array.isArray(snap) ? snap
              : snap.content ? (typeof snap.content === 'string' ? snap.content : JSON.stringify(snap.content))
              : snap;
            contents[lesson.id] = raw;
            return;
          }
        } catch { /* ignore */ }
        if (lesson.content) {
          contents[lesson.id] = typeof lesson.content === 'string' ? lesson.content : JSON.stringify(lesson.content);
        }
      }));
      setLessonContents(contents);
    } catch (err) {
      setError(err.message || 'Failed to load course.');
    } finally {
      setLoading(false);
    }
  };

  const goToLesson = useCallback((idx) => {
    if (idx >= 0 && idx < lessons.length) setActiveIndex(idx);
  }, [lessons.length]);

  const activeLesson = lessons[activeIndex];
  const activeContent = activeLesson ? lessonContents[activeLesson.id] : null;
  const sanitizedBlocks = sanitizeBlocks(activeContent);

  const editor = useCreateBlockNote();
  useEffect(() => {
    if (!editor) return;
    if (sanitizedBlocks.length > 0) {
      try { editor.replaceBlocks(editor.document, sanitizedBlocks); } catch { /* ignore */ }
    } else {
      try { editor.replaceBlocks(editor.document, []); } catch { /* ignore */ }
    }
  }, [activeLesson?.id, editor]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Loading ───────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main' style={{ padding: '40px 24px' }}>
          <Skeleton height={40} width={300} mb="lg" />
          <Grid>
            <Grid.Col span={9}><Skeleton height={400} /></Grid.Col>
            <Grid.Col span={3}><Skeleton height={400} /></Grid.Col>
          </Grid>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main' style={{ padding: 24 }}>
          <Paper p="lg"><Text c="red">{error}</Text></Paper>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />

      <div className='dashboard-main' style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Top bar ─────────────────────────────────────────── */}
        <header style={{
          display: 'flex', alignItems: 'center', gap: 12,
          height: 52, minHeight: 52,
          background: t('bg-surface'), borderBottom: `1px solid ${t('border-primary')}`,
          padding: '0 16px', flexShrink: 0, zIndex: 50,
        }}>
          <Breadcrumbs style={{ flex: 1, fontSize: 13 }}>
            <Anchor onClick={() => navigate('/courses')}>Courses</Anchor>
            <Anchor onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Anchor>
            <span>{activeLesson?.title || 'Preview'}</span>
          </Breadcrumbs>
          <Text size="sm" style={{ color: t('text-muted') }}>
            Lesson {activeIndex + 1} of {lessons.length}
          </Text>
        </header>

        {/* ── Main content ────────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>

          {/* Lesson content area */}
          <main style={{
            flex: 1, overflowY: 'auto', padding: '32px 24px',
            background: t('bg-secondary'),
            display: 'flex', justifyContent: 'center',
          }}>
            <div style={{
              width: '100%', maxWidth: 780,
              background: t('bg-surface'),
              borderRadius: t('radius-lg'),
              boxShadow: t('shadow-md'),
              padding: '40px 48px',
              minHeight: 500,
            }}>
              {/* Lesson header */}
              <div style={{
                marginBottom: 28, paddingBottom: 20,
                borderBottom: `1px solid ${t('border-secondary')}`,
              }}>
                <Text size={10} fw={700} tt="uppercase" ls="0.07em" style={{ color: t('text-disabled'), marginBottom: 6 }}>
                  Lesson {activeIndex + 1}
                </Text>
                <Title order={2} style={{ color: t('text-primary'), margin: 0, lineHeight: 1.25 }}>
                  {activeLesson?.title || 'Untitled Lesson'}
                </Title>

              </div>

              {/* BlockNote read-only content */}
              {editor && sanitizedBlocks.length > 0 ? (
                <div style={{ minHeight: 200 }}>
                  <BlockNoteView editor={editor} editable={false} theme={theme} />
                </div>
              ) : (
                <div style={{
                  minHeight: 200, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: t('text-muted'), fontSize: 14,
                }}>
                  <BookOpen size={32} style={{ opacity: 0.3, marginRight: 12 }} />
                  This lesson has no content yet.
                </div>
              )}

              {/* Navigation */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 40, paddingTop: 20,
                borderTop: `1px solid ${t('border-secondary')}`,
              }}>
                <Button
                  variant="subtle"
                  leftSection={<ArrowLeft size={14} />}
                  onClick={() => goToLesson(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  style={{ color: t('text-secondary') }}
                >
                  Previous
                </Button>
                <Text size="xs" style={{ color: t('text-muted') }}>
                  {activeIndex + 1} / {lessons.length}
                </Text>
                <Button
                  variant="subtle"
                  rightSection={<ArrowRight size={14} />}
                  onClick={() => goToLesson(activeIndex + 1)}
                  disabled={activeIndex >= lessons.length - 1}
                  style={{ color: t('text-secondary') }}
                >
                  Next
                </Button>
              </div>
            </div>
          </main>

          {/* Right sidebar — lesson outline */}
          <aside style={{
            width: 280, flexShrink: 0,
            background: t('bg-surface'),
            borderLeft: `1px solid ${t('border-primary')}`,
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '16px 16px 12px', flexShrink: 0,
              borderBottom: `1px solid ${t('border-primary')}`,
              background: t('bg-secondary'),
            }}>
              <Text size="xs" fw={700} tt="uppercase" ls="0.06em" style={{ color: t('text-muted') }}>
                Lessons
              </Text>
              <Progress
                value={lessons.length > 0 ? ((activeIndex + 1) / lessons.length) * 100 : 0}
                size="xs" mt="sm" style={{ '--progress-section-color': 'var(--primary)' }}
              />
              <Text size="xs" mt={4} style={{ color: t('text-muted') }}>
                {activeIndex + 1} of {lessons.length} completed
              </Text>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              {lessons.map((lesson, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <div
                    key={lesson.id}
                    onClick={() => goToLesson(idx)}
                    style={{
                      padding: '10px 16px',
                      cursor: 'pointer',
                      background: isActive ? t('bg-active') : 'transparent',
                      borderLeft: isActive ? `2px solid ${t('text-primary')}` : '2px solid transparent',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = t('bg-hover'); }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <Group justify="space-between" gap={8} wrap="nowrap">
                      <Text
                        size="sm"
                        fw={isActive ? 600 : 400}
                        style={{
                          color: isActive ? t('text-primary') : t('text-secondary'),
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}
                      >
                        <span style={{ color: t('text-muted'), marginRight: 6 }}>
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        {lesson.title || `Lesson ${idx + 1}`}
                      </Text>
                      {idx < activeIndex && <Check size={14} color="green" style={{ flexShrink: 0 }} />}
                    </Group>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
