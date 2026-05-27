import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Button, Header, Message, Label } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import BlockEditor from './components/BlockEditor';
import {
  fetchBlocks, createBlock, updateBlock, deleteBlock as apiDeleteBlock,
  reorderBlocks, saveAutosave, fetchAutosave, generateAIContent,
  BLOCK_TYPE_LABELS, BLOCK_TYPE_ICONS,
} from '@/app/services/blockService';
import { fetchCourseById, fetchLessons, createLesson } from '@/app/services/courseService';
import './CourseBuilder.scss';

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autosaving, setAutosaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [lessonId, setLessonId] = useState(null);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const courseData = await fetchCourseById(id);
      setCourse(courseData);

      // Load lessons for thiscourse
      const lessons = await fetchLessons(id);
      if (lessons && lessons.length > 0) {
        setLessonId(lessons[0].id);
        // Load blocks for the first lesson
        const blocksData = await fetchBlocks(lessons[0].id);
        setBlocks(blocksData);

        // Check for autosave
        const autosave = await fetchAutosave(lessons[0].id);
        if (autosave && autosave.snapshot) {
          try {
            const snapshot = JSON.parse(autosave.snapshot);
            if (snapshot && snapshot.length > 0) {
              // Merge snapshot with server blocks (prefer server blocks)
              setBlocks(snapshot);
            }
          } catch {
            // ignore parse error
          }
        }
      } else {
        // No lessons yet — create one
        const newLesson = await createLesson(id, { title: 'Lesson 1', description: 'Auto-created lesson' });
        setLessonId(newLesson.id);
        setBlocks([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course.')    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // ─── Block Operations ─────────────────────────────────────

  const handleBlocksChange = useCallback((newBlocks) => {
    setBlocks(newBlocks);
  }, []);

  const handleSave = async (blocksToSave) => {
    if (!lessonId) return;
    try {
      setSaving(true);
      setError(null);

      // For each block, create or update on server
      const savedBlocks = [];
      for (let i = 0; i < blocksToSave.length; i++) {
        const block = { ...blocksToSave[i], order: i, lessonId };
        if (block.id && String(block.id).startsWith('temp_')) {
          // New block — create on server
          const created = await createBlock(lessonId, block);
          savedBlocks.push(created);
        } else {
          // Existing block — update
          const updated = await updateBlock(block.id, block);
          savedBlocks.push(updated);
        }
      }
      setBlocks(savedBlocks);
      showSuccess(`${savedBlocks.length} blocks saved.`);
    } catch (err) {
      setError(err.message || 'Failed to save blocks.');
    } finally {
      setSaving(false);
    }
  };

  const handleAutosave = async (autosaveBlocks) => {
    if (!lessonId) return;
    try {
      setAutosaving(true);
      const snapshot = JSON.stringify(autosaveBlocks);
      await saveAutosave(lessonId, snapshot);
    } catch (err) {
      // Non-fatal: autosave failures shouldn't disrupt UX
      console.error('Autosave failed:', err);
    } finally {
      setAutosaving(false);
    }
  };

  const handleAIGenerate = async (block, action, prompt) => {
    if (!lessonId) return null;
    try {
      setError(null);
      const context = block.content || '';
      const result = await generateAIContent(
        lessonId,
        block.type,
        prompt || `Generate ${action} for this ${block.type} block`,
        context
      );
      showSuccess('AI content generated.');
      return result;
    } catch (err) {
      setError(err.message || 'AI generation failed.');
      return null;
    }
  };

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment loading style={{ marginTop: 40 }}>
            <Header as='h2'>Loading block editor...</Header>
          </Segment>
        </div>
      </div>
    );
  }

  return (
    <div className='dashboard-layout'>
      <SideBar />

      <div className='dashboard-main'>
        {/* Header */}
        <div className='dashboard-header'>
          <div className='header-left'>
            <h1 className='page-title'>Block Editor</h1>
            <p className='page-subtitle'>{course?.title}</p>
          </div>
          <div className='header-right'>
            <Button onClick={() => navigate(`/courses/${id}`)}>
              <Icon name='eye' /> Preview
            </Button>
            <Button primary onClick={() => handleSave(blocks)} loading={saving}>
              <Icon name='save' /> Save All
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Block Editor</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          {/* Block Info Bar */}
          <div className='block-editor-info-bar'>
            <div className='block-editor-stats'>
              <Label size='small'>
                <Icon name='cubes' /> {blocks.length} block{blocks.length !== 1 ? 's' : ''}
              </Label>
              {blocks.length > 0 && (
                <Label size='small' color='grey'>
                  Types: {[...new Set(blocks.map(b => b.type))].map(t => BLOCK_TYPE_LABELS[t] || t).join(', ')}
                </Label>
              )}
            </div>
            <div className='block-editor-hint'>
              <Icon name='info circle' style={{ color: '#aaa' }} />
              <span style={{ fontSize: 12, color: '#aaa' }}>
                Type <kbd>/</kbd> at the start of a text block to use slash commands. Drag blocks to reorder.
              </span>
            </div>
          </div>

          <Divider hidden />

          {/* Block Editor */}
          <div className='block-editor-wrapper'>
            <BlockEditor
              blocks={blocks}
              onBlocksChange={handleBlocksChange}
              onSave={handleSave}
              onAutosave={handleAutosave}
              onAIGenerate={handleAIGenerate}
              saving={saving}
              autosaving={autosaving}
              error={error}
              successMsg={successMsg}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
