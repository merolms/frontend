import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Segment, Icon, Breadcrumb, Divider, Button, Header, Message } from 'semantic-ui-react';
import SideBar from '@/app/containers/SideBar/SideBar';
import StructureTree from './components/StructureTree';
import NodeEditor from './components/NodeEditor';
import { fetchCourseById, fetchLessons, createLesson, updateLesson, deleteLesson as apiDeleteLesson } from '@/app/services/courseService';
import './CourseBuilder.scss';

const CourseBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Local hierarchical structure built from flat lessons
  const [sections, setSections] = useState([]);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [courseData, lessonsData] = await Promise.all([
        fetchCourseById(id),
        fetchLessons(id),
      ]);
      setCourse(courseData);

      // Build hierarchical structure from flat lessons
      if (lessonsData && lessonsData.length > 0) {
        const section = {
          id: 's1',
          title: 'Course Content',
          description: '',
          order: 0,
          status: 'published',
          isCollapsed: false,
          modules: [
            {
              id: 'm1',
              title: 'Lessons',
              description: '',
              order: 0,
              lessons: lessonsData.map((l, idx) => ({
                id: `l_${l.id}`,
                realId: l.id,
                title: l.title,
                description: l.description,
                type: 'text',
                duration: l.duration || '',
                order: idx,
                status: 'published',
                isLocked: false,
                unlockCondition: null,
                points: 0,
                content: { html: l.content || '', videoUrl: '', transcript: '' },
                topics: [],
              })),
            },
          ],
        };
        setSections([section]);

        // Auto-select first lesson
        if (section.modules[0].lessons.length > 0) {
          setSelectedNode(section.modules[0].lessons[0]);
          setSelectedType('lesson');
        }
      } else {
        // Empty course — create a default section
        setSections([{
          id: 's1',
          title: 'Course Content',
          description: '',
          order: 0,
          status: 'draft',
          isCollapsed: false,
          modules: [],
        }]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load course structure.');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSelect = (node, type) => {
    setSelectedNode(node);
    setSelectedType(type);
  };

  // ─── Add Section (local only) ────────────────────────────────
  const handleAddSection = () => {
    const newSection = {
      id: `s_${Date.now()}`,
      title: 'New Section',
      description: '',
      order: sections.length,
      status: 'draft',
      isCollapsed: false,
      modules: [],
    };
    setSections(prev => [...prev, newSection]);
    setSelectedNode(newSection);
    setSelectedType('section');
    showSuccess('Section added.');
  };

  // ─── Add Lesson (real API) ───────────────────────────────────
  const handleAddLesson = async (moduleId) => {
    if (!course) return;
    try {
      setSaving(true);
      const newLesson = await createLesson(id, { title: 'New Lesson', description: '' });
      // Add to local structure
      setSections(prev => prev.map(s => ({
        ...s,
        modules: s.modules.map(m => {
          if (m.id === moduleId) {
            return {
              ...m,
              lessons: [...m.lessons, {
                id: `l_${newLesson.id}`,
                realId: newLesson.id,
                title: newLesson.title,
                description: newLesson.description,
                type: 'text',
                duration: '',
                order: m.lessons.length,
                status: 'draft',
                isLocked: false,
                unlockCondition: null,
                points: 0,
                content: { html: '', videoUrl: '', transcript: '' },
                topics: [],
              }],
            };
          }
          return m;
        }),
      })));
      showSuccess('Lesson added.');
    } catch (err) {
      setError(err.message || 'Failed to create lesson.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Dispatcher: handleAdd(type, parentId) ───────────────────
  const handleAdd = async (type, parentId) => {
    if (type === 'section') {
      handleAddSection();
    } else if (type === 'lesson') {
      await handleAddLesson(parentId);
    } else {
      // module, topic — local only for now
      showSuccess(`${type} creation is local only.`);
    }
  };

  // ─── Delete Lesson (real API) ────────────────────────────────
  const handleDelete = async (nodeId, type) => {
    if (!course) return;

    if (type === 'lesson') {
      const realId = nodeId.startsWith('l_') ? parseInt(nodeId.replace('l_', ''), 10) : parseInt(nodeId, 10);
      if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
      try {
        setSaving(true);
        await apiDeleteLesson(id, realId);
        // Remove from local structure
        setSections(prev => prev.map(s => ({
          ...s,
          modules: s.modules.map(m => ({
            ...m,
            lessons: m.lessons.filter(l => l.id !== nodeId),
          })),
        })));
        if (selectedNode?.id === nodeId) {
          setSelectedNode(null);
          setSelectedType(null);
        }
        showSuccess('Lesson deleted.');
      } catch (err) {
        setError(err.message || 'Failed to delete lesson.');
      } finally {
        setSaving(false);
      }
    } else {
      // section, module — local only
      showSuccess(`${type} deletion is local only.`);
    }
  };

  // ─── Save Lesson (real API) ──────────────────────────────────
  const handleSave = async (formData) => {
    if (!selectedNode || !selectedType || !course) return;

    if (selectedType === 'lesson') {
      const realId = selectedNode.realId;
      if (!realId) {
        setError('Cannot save: lesson has no backend ID yet.');
        return;
      }
      try {
        setSaving(true);
        await updateLesson(id, realId, {
          title: formData.title,
          description: formData.description || '',
        });
        // Update local structure
        setSections(prev => prev.map(s => ({
          ...s,
          modules: s.modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => l.id === selectedNode.id ? { ...l, ...formData } : l),
          })),
        })));
        setSelectedNode(prev => ({ ...prev, ...formData }));
        showSuccess('Lesson saved.');
      } catch (err) {
        setError(err.message || 'Failed to save lesson.');
      } finally {
        setSaving(false);
      }
    } else {
      // section, module — update local only
      setSections(prev => prev.map(s => {
        if (s.id === selectedNode.id) return { ...s, ...formData };
        return {
          ...s,
          modules: s.modules.map(m => m.id === selectedNode.id ? { ...m, ...formData } : m),
        };
      }));
      setSelectedNode(prev => ({ ...prev, ...formData }));
      showSuccess('Changes saved locally.');
    }
  };

  const handleToggleCollapse = (sectionId) => {
    setSections(prev => prev.map(s =>
      s.id === sectionId ? { ...s, isCollapsed: !s.isCollapsed } : s
    ));
  };

  // Build course object for StructureTree
  const courseForTree = course ? { ...course, sections } : null;

  if (loading) {
    return (
      <div className='dashboard-layout'>
        <SideBar />
        <div className='dashboard-main'>
          <Segment loading style={{ marginTop: 40 }}><Header as='h2'>Loading course builder...</Header></Segment>
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
            <h1 className='page-title'>Course Builder</h1>
            <p className='page-subtitle'>{course?.title}</p>
          </div>
          <div className='header-right'>
            <Button onClick={() => navigate(`/courses/${id}`)}>
              <Icon name='eye' /> Preview
            </Button>
            <Button primary>
              <Icon name='save' /> Publish
            </Button>
          </div>
        </div>

        <div className='dashboard-content'>
          <Breadcrumb>
            <Breadcrumb.Section link onClick={() => navigate('/courses')}>Courses</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section link onClick={() => navigate(`/courses/${id}`)}>{course?.title}</Breadcrumb.Section>
            <Breadcrumb.Divider />
            <Breadcrumb.Section active>Builder</Breadcrumb.Section>
          </Breadcrumb>
          <Divider hidden />

          {error && (
            <Message error onDismiss={() => setError(null)} style={{ marginBottom: 16 }}>
              <Icon name='warning circle' /> {error}
            </Message>
          )}
          {successMsg && (
            <Message success onDismiss={() => setSuccessMsg(null)} style={{ marginBottom: 16 }}>
              <Icon name='check circle' /> {successMsg}
            </Message>
          )}

          {/* Builder Layout: Tree (left) + Editor (right) */}
          <div className='course-builder-layout'>
            <div className='course-builder-tree'>
              <div className='course-builder-tree-header'>
                <Header as='h4' style={{ margin: 0 }}>
                  <Icon name='sitemap' /> Structure
                </Header>
                <Button primary size='small' onClick={() => handleAdd('section', null)} disabled={saving}>
                  <Icon name='plus' /> Section
                </Button>
              </div>
              <StructureTree
                course={courseForTree}
                selectedId={selectedNode?.id}
                onSelect={handleSelect}
                onAdd={handleAdd}
                onDelete={handleDelete}
                onToggleCollapse={handleToggleCollapse}
              />
            </div>

            <div className='course-builder-editor'>
              <NodeEditor
                node={selectedNode}
                nodeType={selectedType}
                onSave={handleSave}
                saving={saving}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseBuilder;
